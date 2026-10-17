/* ============================================================================
   TimerX / ChronoPulse - Online Sync Fix Patch  (v1.0.0)
   ----------------------------------------------------------------------------
   Loads AFTER app.js, leaderboard-patch.js and matchsecond-patch.js.
   To revert: delete the <script src="sync-fix-patch.js..."> line in index.html.

   What it fixes (all transport / sync only - no graphics, no game logic):
   1) ntfy.sh anonymous rate limit (60 burst, then 1 request / 5 s per IP).
      app.js posts a presence heartbeat every 2.5 s -> after ~2 minutes every
      POST gets HTTP 429 and online features go stale. Presence is now posted
      to ntfy at most every 20 s (MQTT / BroadcastChannel keep full speed),
      critical game messages are never dropped and are retried on 429.
   2) ntfy message limit is 4096 bytes. The leaderboard list was posted as one
      big message -> turned into an attachment and silently ignored by every
      other device. It is now split into small chunks and only the records
      that are missing in the cloud are published (delta publish).
   3) ntfy cache lives 12 h. Every client that holds records now re-publishes
      what the cloud lacks, so the list survives and spreads between devices.
   4) leaderboard-patch used window.mqttClient, which is always undefined
      (it is a let binding). The retained MQTT copy is now really published.
   5) timiLeaderboardRecords (let) and window.timiLeaderboardRecords were two
      different lists. They are kept in sync, so records from the
      "same second" mode are no longer lost.
   6) Phones / macOS / Linux suspend background tabs and kill WebSocket / SSE.
      On wake / online / pageshow the connections are rebuilt, with
      exponential back-off instead of a reconnect storm.
   7) "Same second" 1v1 results only travelled over MQTT. They are now also
      forwarded from the port-443 ntfy channel.
   8) Presence list no longer flickers: players stay visible ~75 s after their
      last ping, and a new player gets everybody's answer within ~3 s.
   Debug: open the site with #syncdebug at the end of the address.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__cpSyncFixLoaded) return;
  window.__cpSyncFixLoaded = true;

  var NTFY_PREFIX = 'https://ntfy.sh/';
  var GLOBAL_TOPIC = 'chronopulse_global_v2';
  var LB_TOPIC = 'chronopulse_timi_records_v1';
  var LB_URL = NTFY_PREFIX + LB_TOPIC;
  var MAX_BODY_BYTES = 3400;
  var PRESENCE_MS = 20000;
  var PRESENCE_FORCE_MS = 3000;
  var SYNC_REQ_MS = 30000;
  var POLL_CACHE_MS = 20000;
  var PRESENCE_GRACE_EXTRA = 67000; /* app.js prunes at lastSeen + 8000 */

  var stats = {
    posts: 0, dropped: 0, retried: 0, failed: 0, lastStatus: 0,
    reconnects: 0, reconciles: 0, published: 0, cloudRecs: 0, lastError: ''
  };
  var last = { presence: 0, force: 0, syncReq: 0, syncRec: 0 };
  var pollCache = Object.create(null);
  var recentPub = Object.create(null);

  /* ------------------------------------------------------------- helpers */
  function lex(name) {
    try { return (0, eval)(name); } catch (e) { return undefined; }
  }
  var setters = Object.create(null);
  function setLex(name, val) {
    try {
      var f = setters[name] || (setters[name] = new Function('v', 'try{' + name + '=v;}catch(e){}'));
      f(val);
    } catch (e) {}
  }
  function delay(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }
  function bytes(s) {
    try {
      if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
    } catch (e) {}
    try { return unescape(encodeURIComponent(s)).length; } catch (e) {}
    return String(s).length * 2;
  }
  function mkResp(text) {
    try { return new Response(text, { status: 200 }); } catch (e) {
      return { ok: true, status: 200, text: function () { return Promise.resolve(text); } };
    }
  }
  function fakeOk() { return Promise.resolve(mkResp('')); }

  var origFetch = (typeof window.fetch === 'function') ? window.fetch.bind(window) : null;

  /* ------------------------------------------------- ntfy POST (with retry) */
  function retryWait(res, attempt) {
    var wait = 0;
    try {
      var ra = res && res.headers && res.headers.get && res.headers.get('Retry-After');
      if (ra) wait = Math.min(15000, Number(ra) * 1000 || 0);
    } catch (e) {}
    if (!wait) wait = res && res.status === 429 ? 5200 * (attempt + 1) : 1200 * Math.pow(2, attempt);
    return wait;
  }

  function sendPost(url, body, cls, attempt) {
    attempt = attempt || 0;
    var maxTries = cls === 'critical' ? 4 : (cls === 'bg' ? 2 : 0);
    stats.posts++;
    return origFetch(url, {
      method: 'POST',
      body: body,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
    }).then(function (res) {
      stats.lastStatus = res ? res.status : 0;
      if (res && (res.status === 429 || res.status >= 500)) {
        if (attempt < maxTries) {
          stats.retried++;
          return delay(retryWait(res, attempt)).then(function () {
            return sendPost(url, body, cls, attempt + 1);
          });
        }
        stats.failed++;
      }
      return res;
    }, function (err) {
      stats.lastError = String(err && err.message || err);
      if (attempt < maxTries) {
        stats.retried++;
        return delay(800 * Math.pow(2, attempt)).then(function () {
          return sendPost(url, body, cls, attempt + 1);
        });
      }
      stats.failed++;
      throw err;
    });
  }

  /* --------------------------------------------- ntfy GET (poll) with cache */
  function routePoll(url, input, init) {
    var now = Date.now();
    var c = pollCache[url];
    if (c && c.inflight) return c.inflight.then(mkResp);
    if (c && c.text !== null && now - c.t < POLL_CACHE_MS) return Promise.resolve(mkResp(c.text));
    var prev = (c && c.text !== null) ? c : null;
    var p = origFetch(input, init).then(function (res) {
      return res.text().then(function (t) {
        if (res.ok) {
          pollCache[url] = { t: Date.now(), text: t, inflight: null };
          return t;
        }
        stats.lastStatus = res.status;
        pollCache[url] = { t: prev ? prev.t : 0, text: prev ? prev.text : null, inflight: null };
        if (prev) return prev.text;
        throw new Error('poll ' + res.status);
      });
    }, function (err) {
      pollCache[url] = { t: prev ? prev.t : 0, text: prev ? prev.text : null, inflight: null };
      if (prev) return prev.text;
      throw err;
    });
    pollCache[url] = { t: prev ? prev.t : 0, text: prev ? prev.text : null, inflight: p };
    return p.then(mkResp);
  }

  /* ----------------------------------------------------- fetch interceptor */
  function routePost(url, init) {
    var body = init && init.body;
    if (typeof body !== 'string') return origFetch(url, init);
    var topic = url.slice(NTFY_PREFIX.length).split(/[?#]/)[0];
    var now = Date.now();

    if (topic === LB_TOPIC) {
      /* legacy "publish whole list" call: replaced by chunked delta publish */
      scheduleReconcile('legacy-publish', 1200);
      return fakeOk();
    }

    if (topic === GLOBAL_TOPIC) {
      var msg = null;
      try { msg = JSON.parse(body); } catch (e) {}
      var type = msg && msg.type;

      if (type === 'PING_PRESENCE') {
        if (msg.force) {
          if (now - last.force < PRESENCE_FORCE_MS) { stats.dropped++; return fakeOk(); }
          last.force = now;
        } else if (now - last.presence < PRESENCE_MS) {
          stats.dropped++;
          return fakeOk();
        }
        last.presence = now;
        return sendPost(url, body, 'presence');
      }
      if (type === 'REQUEST_LEADERBOARD_SYNC') {
        if (now - last.syncReq < SYNC_REQ_MS) { stats.dropped++; return fakeOk(); }
        last.syncReq = now;
        return sendPost(url, body, 'presence');
      }
      if (type === 'SYNC_LEADERBOARD_RECORDS') {
        /* big lists would become an attachment; they travel via the
           leaderboard topic and MQTT instead */
        if (bytes(body) > MAX_BODY_BYTES || now - last.syncRec < SYNC_REQ_MS) {
          stats.dropped++;
          return fakeOk();
        }
        last.syncRec = now;
        return sendPost(url, body, 'presence');
      }
      return sendPost(url, body, 'critical');
    }
    return origFetch(url, init);
  }

  if (origFetch && !window.fetch.__cpWrapped) {
    var wrapped = function (input, init) {
      try {
        var url = (typeof input === 'string') ? input : '';
        if (url.indexOf(NTFY_PREFIX) === 0) {
          var method = String((init && init.method) || 'GET').toUpperCase();
          if (method === 'POST') return routePost(url, init || {});
          if (method === 'GET' && url.indexOf('poll=1') > -1) return routePoll(url, input, init);
        }
      } catch (e) {}
      return origFetch(input, init);
    };
    wrapped.__cpWrapped = true;
    window.fetch = wrapped;
  }

  /* ============================================================ LEADERBOARD */
  function recKey(r) {
    if (!r) return '';
    if (r.id && typeof r.id === 'string' && r.id.indexOf('timi_win_') === 0) return r.id;
    return 'timi_' + String(r.username || '').trim().toLowerCase() + '_' +
      (Number(r.timestamp) || 0) + '_' + String(r.userTime || '') + '_' + String(r.mode || '');
  }
  function keySet(arr) {
    var m = Object.create(null);
    for (var i = 0; i < arr.length; i++) { var k = recKey(arr[i]); if (k) m[k] = true; }
    return m;
  }
  function localRecords() {
    var w = window.timiLeaderboardRecords;
    return Array.isArray(w) ? w : [];
  }
  function pushRecs(out, d) {
    var i;
    if (Array.isArray(d)) {
      for (i = 0; i < d.length; i++) if (d[i] && d[i].username) out.push(d[i]);
    } else if (d && Array.isArray(d.records)) {
      for (i = 0; i < d.records.length; i++) if (d.records[i] && d.records[i].username) out.push(d.records[i]);
    } else if (d && d.username) {
      out.push(d);
    }
  }
  function parseNdjson(text) {
    var out = [];
    if (!text) return out;
    var lines = String(text).split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      var ev;
      try { ev = JSON.parse(line); } catch (e) { continue; }
      if (!ev || ev.event !== 'message' || !ev.message) continue;
      var d;
      try { d = JSON.parse(ev.message); } catch (e) { continue; }
      pushRecs(out, d);
    }
    return out;
  }
  function chunkRecords(recs) {
    var chunks = [], cur = [];
    var overhead = bytes('{"v":1,"records":[]}') + 2;
    var size = overhead;
    for (var i = 0; i < recs.length; i++) {
      var b = bytes(JSON.stringify(recs[i])) + 1;
      if (cur.length && size + b > MAX_BODY_BYTES) { chunks.push(cur); cur = []; size = overhead; }
      cur.push(recs[i]);
      size += b;
    }
    if (cur.length) chunks.push(cur);
    return chunks.map(function (c) { return JSON.stringify({ v: 1, records: c }); });
  }
  function publishChunks(recs) {
    var bodies = chunkRecords(recs);
    stats.published += recs.length;
    var p = Promise.resolve();
    bodies.forEach(function (b) {
      p = p.then(function () { return sendPost(LB_URL, b, 'bg').catch(function () {}); })
           .then(function () { return delay(1300); });
    });
    return p;
  }
  function cloudRead() {
    var url = LB_URL + '/json?poll=1&since=all';
    return origFetch(url).then(function (res) {
      if (!res.ok) { stats.lastStatus = res.status; throw new Error('lb ' + res.status); }
      return res.text();
    }).then(function (t) {
      pollCache[url] = { t: Date.now(), text: t, inflight: null };
      var recs = parseNdjson(t);
      stats.cloudRecs = recs.length;
      return recs;
    });
  }

  /* keep app.js `let timiLeaderboardRecords` and window.timiLeaderboardRecords equal */
  function syncLexical() {
    var lexRecs = lex('timiLeaderboardRecords');
    var win = window.timiLeaderboardRecords;
    if (!Array.isArray(lexRecs) || !Array.isArray(win)) return 0;
    var added = 0;
    if (lexRecs !== win) {
      var wk = keySet(win);
      var extra = [];
      for (var i = 0; i < lexRecs.length; i++) {
        var r = lexRecs[i];
        if (r && r.username && !wk[recKey(r)]) extra.push(r);
      }
      if (extra.length && typeof window.mergeLeaderboardRecords === 'function') {
        window.mergeLeaderboardRecords(extra);
        added = extra.length;
      }
      if (Array.isArray(window.timiLeaderboardRecords)) setLex('timiLeaderboardRecords', window.timiLeaderboardRecords);
    }
    return added;
  }

  var rcTimer = null, rcBusy = false, rcAgain = false;
  function scheduleReconcile(reason, ms) {
    if (rcTimer) return;
    rcTimer = setTimeout(function () { rcTimer = null; reconcile(reason); }, ms == null ? 1500 : ms);
  }
  function mergeCloud(recs) {
    if (recs && recs.length && typeof window.mergeLeaderboardRecords === 'function') {
      try { window.mergeLeaderboardRecords(recs); } catch (e) {}
    }
  }
  function missingIn(cloudKeys) {
    var now = Date.now(), local = localRecords(), out = [];
    for (var i = 0; i < local.length; i++) {
      var k = recKey(local[i]);
      if (k && !cloudKeys[k] && !(recentPub[k] && now - recentPub[k] < 120000)) out.push(local[i]);
    }
    return out;
  }
  function reconcile(reason) {
    if (rcBusy) { rcAgain = true; return; }
    rcBusy = true;
    stats.reconciles++;
    try { syncLexical(); } catch (e) {}
    cloudRead().then(function (cloud) {
      mergeCloud(cloud);
      try { syncLexical(); } catch (e) {}
      var missing = missingIn(keySet(cloud));
      if (!missing.length) return;
      var jitter = reason === 'legacy-publish' ? 0 : Math.floor(Math.random() * 5000);
      return delay(jitter).then(function () {
        return jitter ? cloudRead() : cloud;
      }).then(function (cloud2) {
        if (cloud2 !== cloud) mergeCloud(cloud2);
        var still = missingIn(keySet(cloud2));
        if (!still.length) return;
        var now = Date.now();
        still.forEach(function (r) { recentPub[recKey(r)] = now; });
        return publishChunks(still);
      });
    }).catch(function (e) {
      stats.lastError = String(e && e.message || e);
    }).then(function () {
      publishMqttRetained();
      rcBusy = false;
      if (rcAgain) { rcAgain = false; scheduleReconcile('again', 4000); }
    });
  }

  /* ---------------------------------------- retained MQTT copy (real client) */
  var mqttSince = 0, retainedSig = '', retainedAt = 0;
  function publishMqttRetained() {
    try {
      var c = lex('mqttClient');
      var topic = lex('MQTT_LEADERBOARD_TOPIC') || 'chronopulse/global/timi_leaderboard_retained/v1';
      if (!c || !c.connected || !mqttSince || Date.now() - mqttSince < 6000) return;
      var recs = localRecords();
      if (!recs.length) return;
      var newest = 0;
      for (var i = 0; i < recs.length; i++) newest = Math.max(newest, Number(recs[i].timestamp) || 0);
      var sig = recs.length + '_' + newest;
      if (sig === retainedSig && Date.now() - retainedAt < 600000) return;
      c.publish(topic, JSON.stringify(recs), { retain: true, qos: 1 });
      retainedSig = sig;
      retainedAt = Date.now();
    } catch (e) {}
  }

  /* ================================================================ PRESENCE */
  function sendPresence(hello, force) {
    try {
      var u = lex('currentUsername');
      if (!u || typeof window.broadcast !== 'function') return;
      window.broadcast({ type: 'PING_PRESENCE', username: u, hello: !!hello, force: !!force });
    } catch (e) {}
  }
  var helloTimer = null, lastReply = 0;
  function scheduleHelloReply() {
    if (helloTimer || Date.now() - lastReply < 3000) return;
    helloTimer = setTimeout(function () {
      helloTimer = null;
      lastReply = Date.now();
      sendPresence(false, true);
    }, 250 + Math.floor(Math.random() * 2200));
  }

  function afterMessage(data) {
    if (!data || typeof data.type !== 'string') return;
    var me = lex('myClientId');
    if (data.senderId && data.senderId === me) return;
    if (data.type === 'PING_PRESENCE') {
      var map = lex('activePlayersMap');
      if (map && typeof map.get === 'function' && data.username) {
        var p = map.get(data.username);
        if (p) p.lastSeen = Date.now() + PRESENCE_GRACE_EXTRA;
      }
      if (data.hello) scheduleHelloReply();
      return;
    }
    if (data.type.indexOf('MATCHSEC_') === 0) {
      var ch = window.__msChannel;
      if (ch && typeof ch.onmessage === 'function') ch.onmessage({ data: data });
    }
  }

  function installRealtimeWrapper() {
    var orig = window.handleRealtimeMessage;
    if (typeof orig !== 'function' || orig.__cpWrapped) return;
    var w = function (data) {
      var r = orig.apply(this, arguments);
      try { afterMessage(data); } catch (e) {}
      return r;
    };
    w.__cpWrapped = true;
    window.handleRealtimeMessage = w;
  }

  /* ============================================== CONNECTION HEALTH / WAKE */
  var fails = 0, lastTry = 0, initTimer = null;
  function installInitBackoff() {
    var origInit = window.initUniversal443Engine;
    if (typeof origInit !== 'function' || origInit.__cpWrapped) return;
    var w = function () {
      if (initTimer) return;
      if (lex('universalWs') && lex('universalEventSource')) return;
      var wait = fails ? Math.min(60000, 4000 * Math.pow(2, fails)) : 0;
      var since = Date.now() - lastTry;
      if (wait && since < wait) {
        initTimer = setTimeout(function () { initTimer = null; window.initUniversal443Engine(); }, wait - since);
        return;
      }
      lastTry = Date.now();
      origInit.apply(this, arguments);
      setTimeout(function () {
        if (lex('universalWs')) fails = 0; else fails = Math.min(fails + 1, 6);
      }, 6000);
    };
    w.__cpWrapped = true;
    window.initUniversal443Engine = w;
  }

  var lastForce = 0;
  function forceReconnect() {
    var now = Date.now();
    if (now - lastForce < 4000) return;
    lastForce = now;
    stats.reconnects++;
    try {
      var ws = lex('universalWs');
      if (ws) {
        ws.onclose = null; ws.onmessage = null; ws.onerror = null;
        try { ws.close(); } catch (e) {}
      }
      setLex('universalWs', null);
    } catch (e) {}
    try {
      var es = lex('universalEventSource');
      if (es) {
        es.onmessage = null; es.onerror = null;
        try { es.close(); } catch (e) {}
      }
      setLex('universalEventSource', null);
    } catch (e) {}
    fails = 0;
    try {
      if (initTimer) { clearTimeout(initTimer); initTimer = null; }
      if (typeof window.initUniversal443Engine === 'function') window.initUniversal443Engine();
    } catch (e) {}
    try {
      var c = lex('mqttClient');
      if (!(c && c.connected) && typeof window.connectToBroker === 'function') {
        if (c) { try { c.end(true); } catch (e) {} }
        setLex('isConnecting', false);
        window.connectToBroker(Number(lex('activeBrokerIndex')) || 0);
      }
    } catch (e) {}
  }

  var hiddenAt = 0;
  function onWake(reason) {
    var away = hiddenAt ? Date.now() - hiddenAt : 0;
    hiddenAt = 0;
    if (away > 12000 || reason === 'online' || reason === 'pageshow') forceReconnect();
    setTimeout(function () { sendPresence(true, true); }, 1500);
    scheduleReconcile('wake', 2500);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') hiddenAt = Date.now();
    else onWake('visible');
  });
  window.addEventListener('online', function () { onWake('online'); });
  window.addEventListener('pageshow', function (e) { if (e && e.persisted) onWake('pageshow'); });

  /* ================================================================ TIMERS */
  var knownUser = null, watchedWs = null, lastWsMsg = 0, lastWatchdogReconnect = 0;
  var tick = 0;
  setInterval(function () {
    tick++;
    /* 1s: username change -> announce, track MQTT connected time */
    try {
      var u = lex('currentUsername') || '';
      if (u !== knownUser) {
        var first = knownUser === null;
        knownUser = u;
        if (u) setTimeout(function () { sendPresence(true, true); }, first ? 1200 : 300);
      }
      var c = lex('mqttClient');
      if (c && c.connected) { if (!mqttSince) mqttSince = Date.now(); } else { mqttSince = 0; }
    } catch (e) {}
    /* 2s: keep both leaderboard lists identical */
    if (tick % 2 === 0) {
      try {
        if (syncLexical() > 0) scheduleReconcile('lexical', 800);
      } catch (e) {}
    }
    /* 15s: half-open socket watchdog (ntfy sends keepalive every ~45 s) */
    if (tick % 15 === 0) {
      try {
        var ws = lex('universalWs');
        if (ws && ws !== watchedWs) {
          watchedWs = ws;
          lastWsMsg = Date.now();
          ws.addEventListener('message', function () { lastWsMsg = Date.now(); });
        }
        if (ws && document.visibilityState === 'visible' &&
            Date.now() - lastWsMsg > 130000 && Date.now() - lastWatchdogReconnect > 300000) {
          lastWatchdogReconnect = Date.now();
          forceReconnect();
        }
        if (!ws && !initTimer && typeof window.initUniversal443Engine === 'function') {
          window.initUniversal443Engine();
        }
      } catch (e) {}
    }
    /* 5 min: periodic reconcile while visible */
    if (tick % 300 === 0 && document.visibilityState === 'visible') scheduleReconcile('periodic', 500);
    /* 20 s: retained MQTT copy */
    if (tick % 20 === 0) publishMqttRetained();
  }, 1000);

  /* ============================================================ DEBUG VIEW */
  function status() {
    var ws = lex('universalWs'), es = lex('universalEventSource'), c = lex('mqttClient');
    var map = lex('activePlayersMap');
    return {
      ws: ws ? ws.readyState : 'none',
      sse: es ? es.readyState : 'none',
      mqtt: !!(c && c.connected),
      players: map && map.size != null ? map.size : '?',
      localRecords: localRecords().length,
      stats: stats,
      fails: fails
    };
  }
  window.__cpSyncStatus = status;
  window.__cpSyncFix = {
    chunkRecords: chunkRecords, parseNdjson: parseNdjson, recKey: recKey,
    reconcile: function () { scheduleReconcile('manual', 100); },
    forceReconnect: forceReconnect, status: status
  };

  function initDebug() {
    try {
      if (String(location.hash || '').indexOf('syncdebug') < 0) return;
      var box = document.createElement('pre');
      box.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99999;margin:0;padding:6px 8px;' +
        'background:rgba(0,0,0,.82);color:#34d399;font:11px/1.35 monospace;border-radius:8px;' +
        'max-width:92vw;white-space:pre-wrap;pointer-events:none';
      document.body.appendChild(box);
      setInterval(function () {
        var s = status();
        box.textContent = 'ws:' + s.ws + ' sse:' + s.sse + ' mqtt:' + s.mqtt + ' players:' + s.players +
          '\nrecords:' + s.localRecords + ' cloud:' + s.stats.cloudRecs + ' lastHTTP:' + s.stats.lastStatus +
          '\nposts:' + s.stats.posts + ' dropped:' + s.stats.dropped + ' retried:' + s.stats.retried +
          ' failed:' + s.stats.failed + ' reconnects:' + s.stats.reconnects;
      }, 1500);
    } catch (e) {}
  }

  /* ================================================================== INIT */
  function start() {
    installRealtimeWrapper();
    installInitBackoff();
    initDebug();
    scheduleReconcile('start', 2500);
    setTimeout(function () { scheduleReconcile('start2', 100); }, 12000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();