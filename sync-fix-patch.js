/* ============================================================================
   TimerX / ChronoPulse - Universal Online Engine  (v2.0.0)
   ============================================================================
   Loads AFTER app.js, leaderboard-patch.js and matchsecond-patch.js.
   To revert: delete the <script src="sync-fix-patch.js..."> line in index.html.

   WHY THIS FILE EXISTS (root cause of "works only on Windows 11 / Android")
   ---------------------------------------------------------------------------
   The old online layer depended on:
     1) the `mqtt` library from unpkg/jsdelivr -> blocked on many school /
        corporate / Pardus networks => `mqtt` is undefined => no MQTT at all,
     2) a single free broker reached through a fallback ladder that almost
        never advanced (mqtt.js keeps reconnecting to the same dead broker),
     3) ntfy.sh for *everything*, including a presence ping every 2.5 s.
        ntfy.sh allows only 60 burst requests per IP, then 1 request / 5 s,
        and 250 messages per IP per day. One open tab alone would need
        ~34 000 messages/day, so after a few minutes every publish is
        rejected (HTTP 429) and the site looks "online dead" - worst on
        shared IPs (schools, dormitories, CGNAT mobile carriers).

   This version replaces that with a self contained, dependency free engine:
     * Own minimal MQTT 3.1.1 client over WebSocket (~200 lines, no CDN).
     * A MESH of public brokers, 443-only brokers first. Every connected
       broker is subscribed, every publish goes to several of them, so a
       blocked port, a dead broker or a rate limit can no longer stop the game.
     * ntfy is only a fallback (4 independent ntfy servers, 443-only) with a
       strict quota budget, so the 250/day limit is never hit.
     * Critical game messages (invites, match start/stop, results) go into a
       small outbox and are re-sent with the *same* msgId until the peer
       acknowledges them, which makes delivery idempotent and reliable.
     * Leaderboard lives in MQTT *retained* messages (real cloud storage, no
       size limit, no expiry) plus chunked ntfy copies as backup.
     * Presence is event driven (join / rename / unseen peer) with jittered
       hello replies instead of a 2.5 s broadcast storm.
     * Own reconnection with exponential back-off, half-open socket watchdog,
       visibility / online / pageshow recovery (iOS Safari, Android, Pardus,
       Windows 10/11, macOS).

   Debug:  add #syncdebug to the URL
   Tests:  add #netcheck to the URL (per-broker / per-server report)
   ========================================================================== */
(function () {
  'use strict';
  if (window.__cpNetV2) return;
  window.__cpNetV2 = true;

  /* ================================================================ CONFIG */
  var TOPIC_GLOBAL = 'chronopulse/global/vs_matchmaking/v1';
  var TOPIC_LB = 'chronopulse/global/timi_leaderboard_retained/v1';
  var NTFY_TOPIC = 'chronopulse_global_v2';
  var NTFY_LB_TOPIC = 'chronopulse_timi_records_v1';

  /* 443-only brokers first: these work behind captive portals, school
     firewalls and mobile carriers that only allow 443/HTTPS. */
  var BROKERS = [
    { id: 'shiftr', url: 'wss://public.cloud.shiftr.io/mqtt', user: 'public', pass: 'public', tls443: true },
    { id: 'sonda', url: 'wss://api.sondahub.com/mqtt', tls443: true },
    { id: 'emqx', url: 'wss://broker.emqx.io:8084/mqtt' },
    { id: 'mosq', url: 'wss://test.mosquitto.org:8081/mqtt' },
    { id: 'hivemq', url: 'wss://broker.hivemq.com:8884/mqtt', lazy: true }
  ];

  /* Independent public ntfy servers (each one has its own rate limit budget,
     so together they survive a shared / NATed IP). */
  var NTFY_SERVERS = [
    'https://ntfy.sh',
    'https://ntfy.envs.net',
    'https://ntfy.adminforge.de',
    'https://ntfy.mzte.de'
  ];

  var RELAY_BASE = ''; /* optional: own ntfy-compatible server, see #relay= */

  var PRESENCE_MIN_MS = 7000;       /* own presence ping, mesh (app.js prunes at 8 s) */
  var PRESENCE_NTFY_MS = 45000;     /* own presence ping, ntfy fallback */
  var PRESENCE_GRACE_MS = 75000;    /* keep a peer visible this long */
  var SYNC_REQ_MS = 25000;
  var PUB_FANOUT = 3;               /* publish to every live broker (coverage) */
  var NTFY_MAX_BODY = 3400;

  var CRITICAL = {
    INVITE_SEND: 1, INVITE_ACCEPTED: 1, INVITE_DECLINED: 1,
    MODE_SELECT: 1, GUESS_SUBMIT: 1,
    ARENA_STOP: 1, ARENA_REMATCH: 1,
    OVERSTEP_TURN_STARTED: 1, OVERSTEP_TURN_STOPPED: 1,
    MATCHSEC_RESULT: 1, MATCHSEC_REMATCH: 1, MATCHSEC_LEAVE: 1,
    TIMI_CHAMPION_RECORD: 1, REQUEST_LEADERBOARD_SYNC: 1,
    SYNC_LEADERBOARD_RECORDS: 1
  };
  /* only messages addressed to one peer are retried until acknowledged;
     broadcasts (presence, leaderboard, champion toast) repeat on their own */
  var RETRYABLE = {
    INVITE_SEND: 1, INVITE_ACCEPTED: 1, INVITE_DECLINED: 1,
    MODE_SELECT: 1, GUESS_SUBMIT: 1,
    ARENA_STOP: 1, ARENA_REMATCH: 1,
    OVERSTEP_TURN_STARTED: 1, OVERSTEP_TURN_STOPPED: 1,
    MATCHSEC_RESULT: 1, MATCHSEC_REMATCH: 1, MATCHSEC_LEAVE: 1
  };
  function isRetryable(type) { return !!RETRYABLE[type]; }

  var stats = {
    brokers: 0, pub: 0, pubFail: 0, rx: 0, txNtfy: 0, ntfy429: 0,
    dup: 0, retries: 0, acks: 0, reconnects: 0, lpPolls: 0, lpMsgs: 0,
    lbPub: 0, lbCloud: 0, lastStatus: 0, lastError: '', started: Date.now()
  };

  /* ================================================================ HELPERS */
  function lex(name) { try { return (0, eval)(name); } catch (e) { return undefined; } }
  var setters = {};
  function setLex(name, val) {
    try {
      var f = setters[name] || (setters[name] = new Function('v', 'try{' + name + '=v;}catch(e){}'));
      f(val);
    } catch (e) {}
  }
  function me() { return lex('myClientId') || ''; }
  function curUser() { return lex('currentUsername') || ''; }
  function delay(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
  function rnd(n) { return Math.random().toString(36).slice(2, 2 + (n || 6)); }
  function isCrit(type) { return !!CRITICAL[type]; }
  function normName(s) { return String(s || '').trim().toLocaleLowerCase('tr'); }

  /* UTF-8 without TextEncoder (Safari < 10.1, very old Pardus browsers) */
  function utf8Encode(str) {
    try { if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str); } catch (e) {}
    var s = String(str), out = [], i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0xd800 || c >= 0xe000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else { i++; c = 0x10000 + (((c & 0x3ff) << 10) | (s.charCodeAt(i) & 0x3ff)); out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
    }
    return new Uint8Array(out);
  }
  function utf8Decode(buf) {
    try { if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(buf); } catch (e) {}
    var s = '', i = 0, b;
    while (i < buf.length) {
      b = buf[i++];
      if (b < 0x80) s += String.fromCharCode(b);
      else if (b < 0xe0) s += String.fromCharCode(((b & 31) << 6) | (buf[i++] & 63));
      else if (b < 0xf0) s += String.fromCharCode(((b & 15) << 12) | ((buf[i++] & 63) << 6) | (buf[i++] & 63));
      else {
        var cp = ((b & 7) << 18) | ((buf[i++] & 63) << 12) | ((buf[i++] & 63) << 6) | (buf[i++] & 63);
        cp -= 0x10000;
        s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      }
    }
    return s;
  }
  function byteLen(s) { try { return utf8Encode(String(s)).length; } catch (e) { return String(s).length; } }
  function mkResp(text) {
    try { return new Response(text, { status: 200 }); } catch (e) {
      return { ok: true, status: 200, text: function () { return Promise.resolve(text); } };
    }
  }
  function fakeOk() { return Promise.resolve(mkResp('')); }

  var origFetch = (typeof window.fetch === 'function') ? window.fetch.bind(window) : null;
  var origBroadcast = window.broadcast;
  var origHandle = window.handleRealtimeMessage;
  if (!origFetch) return;

  function cfgRelay() {
    var b = RELAY_BASE;
    try {
      var m = /[#&]relay=([^&]+)/.exec(String(location.hash || ''));
      if (m) {
        var v = decodeURIComponent(m[1]);
        if (v === 'off') { localStorage.removeItem('cp_relay_base'); b = ''; }
        else { localStorage.setItem('cp_relay_base', v); b = v; }
      } else if (!b) {
        b = localStorage.getItem('cp_relay_base') || '';
      }
    } catch (e) {}
    b = String(b || '').replace(/\/+$/, '');
    return /^https:\/\/[^\s]+$/.test(b) ? b : '';
  }
  var RELAY = cfgRelay();
  function ntfyBases() {
    var list = NTFY_SERVERS.slice(0);
    if (RELAY) list.unshift(RELAY);
    return list;
  }

  /* ============================================ MINIMAL MQTT 3.1.1 CLIENT */
  /* Written from scratch on purpose: no CDN, no bundled library, works on
     every browser that can open a WebSocket (iOS 8+, Android 4.4+, Pardus
     Firefox/Chromium, Windows 10/11, macOS Safari). */
  function u8cat(parts) {
    var len = 0, i;
    for (i = 0; i < parts.length; i++) len += parts[i].length;
    var out = new Uint8Array(len), off = 0;
    for (i = 0; i < parts.length; i++) { out.set(parts[i], off); off += parts[i].length; }
    return out;
  }
  function mqttStr(s) {
    var b = utf8Encode(String(s));
    return u8cat([new Uint8Array([(b.length >> 8) & 255, b.length & 255]), b]);
  }
  function mqttPkt(type, flags, body) {
    var hdr = [(type << 4) | flags], n = body.length, v;
    do { v = n % 128; n = Math.floor(n / 128); if (n > 0) v |= 128; hdr.push(v); } while (n > 0);
    return u8cat([new Uint8Array(hdr), body]);
  }
  function mqttConnectPkt(clientId, user, pass, keepalive) {
    var flags = 0x02; /* clean session */
    var parts = [];
    if (user) { flags |= 0x80; parts.push(mqttStr(user)); }
    if (pass) { flags |= 0x40; parts.push(mqttStr(pass)); }
    var body = u8cat([
      mqttStr('MQTT'), new Uint8Array([4, flags, (keepalive >> 8) & 255, keepalive & 255]),
      mqttStr(clientId)
    ].concat(parts));
    return mqttPkt(1, 0, body);
  }
  function mqttSubPkt(pid, topic) {
    return mqttPkt(8, 2, u8cat([new Uint8Array([(pid >> 8) & 255, pid & 255]), mqttStr(topic), new Uint8Array([0])]));
  }
  function mqttPubPkt(topic, payload, retain) {
    return mqttPkt(3, retain ? 1 : 0, u8cat([mqttStr(topic), payload]));
  }
  var PINGREQ = new Uint8Array([0xc0, 0x00]);

  function Parser(cb) { this.buf = new Uint8Array(0); this.cb = cb; }
  Parser.prototype.feed = function (chunk) {
    if (!chunk || !chunk.length) return;
    if (!this.buf.length) this.buf = chunk;
    else {
      var nb = new Uint8Array(this.buf.length + chunk.length);
      nb.set(this.buf, 0); nb.set(chunk, this.buf.length); this.buf = nb;
    }
    var off = 0;
    for (;;) {
      if (this.buf.length - off < 2) break;
      var mult = 1, len = 0, i = off + 1, b, complete = false;
      for (;;) {
        if (i >= this.buf.length) break;
        b = this.buf[i++];
        len += (b & 127) * mult; mult *= 128;
        if (!(b & 128)) { complete = true; break; }
        if (mult > 268435456) break;
      }
      if (!complete || this.buf.length - i < len) break;
      var type = this.buf[off] >> 4, flags = this.buf[off] & 15;
      try { this.cb(type, this.buf.subarray(i, i + len), flags); } catch (e) {}
      off = i + len;
    }
    if (off) this.buf = this.buf.subarray(off);
  };

  function Broker(conf) {
    this.conf = conf;
    this.id = conf.id;
    this.ws = null;
    this.ready = false;
    this.tries = 0;
    this.lastRx = 0;
    this.lastTx = 0;
    this.rtt = 3000;
    this.retryTimer = null;
    this.pingTimer = null;
    this.connectAt = 0;
    this.msgs = 0;
    this.parser = new Parser(this.onPacket.bind(this));
  }
  Broker.prototype.isLive = function () {
    return !!(this.ready && this.ws && this.ws.readyState === 1);
  };
  Broker.prototype.subscribe = function (topic) {
    if (!this.isLive()) return;
    try {
      this.ws.send(mqttSubPkt(1 + (this.msgs++ % 100), topic));
    } catch (e) {}
  };
  Broker.prototype.publish = function (topic, payload, retain) {
    if (!this.isLive()) return false;
    try {
      var bytes = (payload instanceof Uint8Array) ? payload : utf8Encode(String(payload));
      this.ws.send(mqttPubPkt(topic, bytes, retain));
      this.lastTx = Date.now();
      return true;
    } catch (e) { return false; }
  };
  Broker.prototype.onPacket = function (type, body, flags) {
    this.lastRx = Date.now();
    if (type === 3) { /* PUBLISH */
      var qos = ((flags || 0) >> 1) & 3;
      var tl = (body[0] << 8) | body[1];
      var off = 2 + tl + (qos > 0 ? 2 : 0);
      var topic = utf8Decode(body.subarray(2, 2 + tl));
      var payload = utf8Decode(body.subarray(off));
      onBrokerMessage(topic, payload, this);
    } else if (type === 2) { /* CONNACK */
      if (body[1] === 0) this.onConnected();
      else this.drop('connack ' + body[1]);
    } else if (type === 13) { /* PINGRESP */
      /* alive */
    }
  };
  Broker.prototype.onConnected = function () {
    var self = this;
    this.ready = true;
    this.tries = 0;
    this.lastRx = Date.now();
    this.startPing();
    this.subscribe(TOPIC_GLOBAL);
    this.subscribe(TOPIC_LB);
    stats.brokers++;
    if (window.__cpOnBrokerUp) { try { window.__cpOnBrokerUp(self); } catch (e) {} }
  };
  Broker.prototype.startPing = function () {
    var self = this;
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = setInterval(function () {
      if (!self.isLive()) return;
      try { self.ws.send(PINGREQ); } catch (e) { return self.drop('ping'); }
      if (Date.now() - self.lastRx > 100000) self.drop('half-open');
    }, 20000);
  };
  Broker.prototype.drop = function (reason) {
    this.ready = false;
    if (this.pingTimer) { clearInterval(this.pingTimer); this.pingTimer = null; }
    var ws = this.ws;
    this.ws = null;
    if (ws) {
      try { ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null; ws.close(); } catch (e) {}
    }
    this.parser = new Parser(this.onPacket.bind(this));
    this.schedule(reason);
  };
  Broker.prototype.schedule = function (reason) {
    var self = this;
    if (this.retryTimer) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      this.retryTimer = setTimeout(function () { self.retryTimer = null; self.schedule('offline'); }, 8000);
      return;
    }
    this.tries = Math.min(this.tries + 1, 7);
    var wait = Math.min(45000, 800 * Math.pow(1.7, this.tries)) + Math.floor(Math.random() * 1500);
    this.retryTimer = setTimeout(function () {
      self.retryTimer = null;
      self.connect();
    }, wait);
  };

  Broker.prototype.connect = function () {
    if (this.ws || this.ready) return;
    if (typeof WebSocket === 'undefined') return;
    var self = this, ws;
    this.connectAt = Date.now();
    try {
      ws = new WebSocket(this.conf.url, ['mqtt']);
    } catch (e) {
      try { ws = new WebSocket(this.conf.url); } catch (e2) { return this.schedule('ctor'); }
    }
    this.ws = ws;
    try { ws.binaryType = 'arraybuffer'; } catch (e) {}
    var opened = false;
    var to = setTimeout(function () {
      if (!self.ready) self.drop('timeout');
    }, 12000);
    ws.onopen = function () {
      opened = true;
      try {
        ws.send(mqttConnectPkt('cp_' + (me() || 'anon') + '_' + rnd(5), self.conf.user, self.conf.pass, 45));
      } catch (e) { self.drop('send-connect'); }
    };
    ws.onmessage = function (ev) {
      clearTimeout(to);
      var data = ev.data;
      if (!data) return;
      if (typeof data === 'string') { try { data = utf8Encode(data); } catch (e) { return; } }
      self.parser.feed(new Uint8Array(data));
    };
    ws.onerror = function () { /* onclose follows */ };
    ws.onclose = function () {
      clearTimeout(to);
      if (self.ready || opened) stats.reconnects++;
      self.ready = false;
      self.ws = null;
      if (self.pingTimer) { clearInterval(self.pingTimer); self.pingTimer = null; }
      self.schedule('close');
    };
  };

  /* ============================================================ MQTT MESH */
  var brokers = BROKERS.map(function (c) { return new Broker(c); });

  function liveBrokers() {
    var out = [];
    for (var i = 0; i < brokers.length; i++) if (brokers[i].isLive()) out.push(brokers[i]);
    return out;
  }
  function meshPublish(topic, text, retain, max) {
    var live = liveBrokers();
    if (!live.length) return false;
    var sent = 0;
    var limit = retain ? live.length : Math.min(max || PUB_FANOUT, live.length);
    for (var i = 0; i < live.length && sent < limit; i++) {
      if (live[i].publish(topic, text, !!retain)) sent++;
    }
    stats.pub += sent;
    if (!sent) stats.pubFail++;
    return sent > 0;
  }
  function meshLive() { return liveBrokers().length > 0; }
  function connectAll() {
    var i;
    /* 'lazy' brokers are only opened when the primary mesh stays thin, so a
       shared IP (school / dorm) does not burn connection slots per user */
    for (i = 0; i < brokers.length; i++) if (!brokers[i].conf.lazy) brokers[i].connect();
    setTimeout(function () {
      if (liveBrokers().length >= 2) return;
      for (var j = 0; j < brokers.length; j++) if (brokers[j].conf.lazy) brokers[j].connect();
    }, 9000);
  }
  function reconnectAll() {
    stats.reconnects++;
    for (var i = 0; i < brokers.length; i++) {
      var b = brokers[i];
      if (b.isLive()) continue;
      if (b.retryTimer) { clearTimeout(b.retryTimer); b.retryTimer = null; }
      b.tries = 0;
      b.connect();
    }
  }

  /* ========================================================= MESSAGE INTAKE */
  var seen = {}, queue = [];
  function isDup(data) {
    if (typeof window.isDuplicateMessage === 'function') {
      try { return !!window.isDuplicateMessage(data); } catch (e) {}
    }
    var id = data.msgId || ((data.senderId || '?') + '_' + data.type + '_' + (data.timestamp || 0));
    if (seen[id]) return true;
    seen[id] = 1; queue.push(id);
    if (queue.length > 500) delete seen[queue.shift()];
    return false;
  }

  function dispatch(data) {
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') return;
    if (data.senderId && data.senderId === me()) return;
    if (isDup(data)) { stats.dup++; return; }
    stats.rx++;
    if (data.type === 'NET_ACK') { onAck(data); return; }
    try {
      if (typeof window.handleRealtimeMessage === 'function') window.handleRealtimeMessage(data);
      else if (typeof origHandle === 'function') origHandle(data);
    } catch (e) {}
    try { sendAck(data); } catch (e) {}
  }

  function onBrokerMessage(topic, payload, broker) {
    if (!payload) return;
    if (topic === TOPIC_LB) { handleLbPayload(payload); return; }
    if (topic !== TOPIC_GLOBAL) return;
    var data;
    try { data = JSON.parse(payload); } catch (e) { return; }
    dispatch(data);
  }

  /* ============================================================== PRESENCE */
  function peerMap() {
    var m = lex('activePlayersMap');
    return (m && typeof m.get === 'function') ? m : null;
  }
  function afterMessage(data) {
    if (!data || typeof data.type !== 'string') return;
    if (data.type === 'PING_PRESENCE') {
      var map = peerMap();
      if (map && data.username) {
        var p = map.get(data.username);
        if (p) p.lastSeen = Date.now() + PRESENCE_GRACE_MS;
        else scheduleHelloReply();
        if (data.hello) scheduleHelloReply();
      }
    } else if (data.type.indexOf('MATCHSEC_') === 0) {
      var ch = window.__msChannel;
      if (ch && typeof ch.onmessage === 'function') {
        try { ch.onmessage({ data: data }); } catch (e) {}
      }
    }
  }

  var helloTimer = null, lastHello = 0;
  function scheduleHelloReply() {
    if (helloTimer || Date.now() - lastHello < 4000) return;
    helloTimer = setTimeout(function () {
      helloTimer = null;
      lastHello = Date.now();
      announce(true);
    }, 250 + Math.floor(Math.random() * 1800));
  }

  var lastAnnounce = 0;
  function announce(hello, force) {
    var u = curUser();
    if (!u || typeof origBroadcast !== 'function') return;
    var t = Date.now();
    if (!force && t - lastAnnounce < PRESENCE_MIN_MS) return;
    lastAnnounce = t;
    var send = (typeof window.broadcast === 'function') ? window.broadcast : origBroadcast;
    try { send.call(window, { type: 'PING_PRESENCE', username: u, hello: !!hello, ts: t }); } catch (e) {}
    /* the wrapper above also feeds the mesh; presence is skipped there when
       it is a duplicate, so publish explicitly on the fallback channel */
    if (!meshLive()) maybeNtfy({ type: 'PING_PRESENCE', username: u, hello: !!hello }, false, true);
  }

  /* ================================================================== ACKS */
  var outbox = {};
  var RETRY_DELAYS = [1600, 3400, 7000, 13000, 21000];

  function sendAck(data) {
    if (!data.msgId || !isCrit(data.type)) return;
    if (!(data.matchId || data.targetClientId || data.toClientId || data.fromClientId || data.inviteId)) return;
    var ack = { type: 'NET_ACK', ref: data.msgId, senderId: me() };
    var json = JSON.stringify(ack);
    if (!meshPublish(TOPIC_GLOBAL, json)) maybeNtfy(ack, false);
  }
  function onAck(data) {
    if (!data.ref) return;
    stats.acks++;
    var e = outbox[data.ref];
    if (!e) return;
    if (e.timer) clearTimeout(e.timer);
    delete outbox[data.ref];
  }
  function outboxAdd(payload) {
    if (!payload || !payload.msgId) return;
    if (!isRetryable(payload.type)) return;
    if (outbox[payload.msgId]) return;
    outbox[payload.msgId] = { p: payload, n: 0, at: Date.now(), timer: null };
    scheduleOutbox(payload.msgId);
  }
  function scheduleOutbox(id) {
    var e = outbox[id];
    if (!e) return;
    if (e.timer) clearTimeout(e.timer);
    e.timer = setTimeout(function () {
      e.timer = null;
      if (!outbox[id]) return;
      if (Date.now() - e.at > 75000) { delete outbox[id]; return; }
      var json = JSON.stringify(e.p);
      var ok = meshPublish(TOPIC_GLOBAL, json);
      if (!ok) maybeNtfy(e.p, true);
      stats.retries++;
      e.n++;
      if (e.n < RETRY_DELAYS.length && outbox[id]) scheduleOutbox(id);
      else delete outbox[id];
    }, RETRY_DELAYS[e.n] || 21000);
  }
  function flushOutbox() {
    for (var id in outbox) {
      if (!Object.prototype.hasOwnProperty.call(outbox, id)) continue;
      var e = outbox[id];
      if (e.timer) { clearTimeout(e.timer); e.timer = null; }
      var ok = meshPublish(TOPIC_GLOBAL, JSON.stringify(e.p));
      if (!ok) maybeNtfy(e.p, true);
      stats.retries++;
      e.n++;
      if (e.n < RETRY_DELAYS.length) scheduleOutbox(id); else delete outbox[id];
    }
  }

  /* ============================================================ NTFY FALLBACK
     Only used when no broker is reachable, or as an extra copy for critical
     messages. 4 independent servers share the load, and every publish is
     budgeted so the 250 msg/day/IP limit of ntfy.sh is never reached. */
  var ntfyScore = [0, 0, 0, 0, 0];
  var ntfyCursor = 0;
  var ntfyTimes = { presence: 0, any: 0 };

  function ntfySend(topic, body, tries) {
    var list = ntfyBases();
    var attempt = 0;
    function go() {
      if (attempt >= list.length + 1) return Promise.resolve(false);
      var idx = (ntfyCursor + attempt) % list.length;
      var base = list[idx];
      return origFetch(base + '/' + topic, {
        method: 'POST',
        body: body,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
      }).then(function (res) {
        stats.lastStatus = res.status;
        stats.txNtfy++;
        if (res.ok) {
          ntfyScore[idx] = Math.max(0, (ntfyScore[idx] || 0) - 1);
          ntfyCursor = idx;
          return true;
        }
        if (res.status === 429) { stats.ntfy429++; ntfyScore[idx] = (ntfyScore[idx] || 0) + 3; }
        else ntfyScore[idx] = (ntfyScore[idx] || 0) + 1;
        attempt++;
        if (attempt < (tries || 0) + 1) return delay(500).then(go);
        return false;
      }, function (err) {
        stats.lastError = String((err && err.message) || err);
        ntfyScore[idx] = (ntfyScore[idx] || 0) + 2;
        attempt++;
        if (attempt < (tries || 0) + 1) return delay(800).then(go);
        return false;
      });
    }
    return go();
  }

  function maybeNtfy(payload, force, isPresence) {
    if (!payload) return;
    var t = Date.now();
    var presence = isPresence || payload.type === 'PING_PRESENCE';
    if (presence && !force && t - ntfyTimes.presence < PRESENCE_NTFY_MS) return;
    if (!force && t - ntfyTimes.any < 1200) return;
    var body = JSON.stringify(payload);
    if (byteLen(body) > NTFY_MAX_BODY) return; /* big lists go to the LB topic */
    ntfyTimes.any = t;
    if (presence) ntfyTimes.presence = t;
    ntfySend(NTFY_TOPIC, body, 1);
  }

  /* Legacy publishers (app.js, leaderboard-patch.js) keep calling fetch()
     directly. Their traffic is a duplicate of what this engine already sends
     and it would burn the daily quota, so it is absorbed here. */
  function installFetchGate() {
    if (typeof window.fetch !== 'function') return;
    var list = NTFY_SERVERS.slice(0);
    if (RELAY) list.push(RELAY);
    var wrapped = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : ((input && input.url) || '');
        for (var i = 0; i < list.length; i++) {
          var base = list[i];
          if (url.indexOf(base + '/') !== 0) continue;
          var method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
          if (method !== 'POST') return origFetch(input, init);
          var rest = url.slice(base.length + 1).split(/[?#]/)[0];
          if (rest === NTFY_LB_TOPIC) { scheduleReconcile('legacy-publish', 1500); return fakeOk(); }
          return fakeOk(); /* NET_ACK-free duplicate: engine already published it */
        }
      } catch (e) {}
      return origFetch(input, init);
    };
    wrapped.__cpGate = true;
    window.fetch = wrapped;
  }

  /* ======================================================= OUTGOING MESSAGES */
  var lastMeshPresence = 0;
  function netSend(payload) {
    var type = payload.type || '';
    if (!type || type === 'NET_ACK') return;
    var t = Date.now();

    if (type === 'PING_PRESENCE') {
      if (t - lastMeshPresence < PRESENCE_MIN_MS) return;
      lastMeshPresence = t;
      meshPublish(TOPIC_GLOBAL, JSON.stringify(payload), false, 3);
      if (!meshLive()) maybeNtfy(payload, false, true);
      return;
    }
    if (type === 'SYNC_LEADERBOARD_RECORDS') {
      if (payload.records && payload.records.length) {
        mergeCloud(payload.records);
        if (!publishLbRetained() && !meshLive()) {
          /* no broker reachable: keep the cloud copy alive through ntfy */
          var bodies = chunkRecords(payload.records.slice(0, 300));
          if (bodies.length) ntfySendTo(NTFY_SERVERS[0], NTFY_LB_TOPIC, bodies[0], 1);
        }
        return;
      }
    }
    var json = JSON.stringify(payload);
    var ok = meshPublish(TOPIC_GLOBAL, json);
    if (!ok) maybeNtfy(payload, isCrit(type));
    if (isCrit(type)) outboxAdd(payload);
  }

  function installHandle() {
    if (typeof origHandle !== 'function') return;
    var w = function (data) {
      var r = origHandle.apply(this, arguments);
      /* AFTER the original handler: app.js resets lastSeen to now(), we then
         push it forward so a 11 s heartbeat cannot make players flicker */
      try { if (data && data.senderId !== me()) afterMessage(data); } catch (e) {}
      return r;
    };
    w.__cpWrapped = true;
    window.handleRealtimeMessage = w;
  }

  function installBroadcast() {
    if (typeof origBroadcast !== 'function') return;
    var w = function (msg) {
      var payload = msg || {};
      if (!payload.msgId) {
        payload = {};
        for (var k in msg) if (Object.prototype.hasOwnProperty.call(msg, k)) payload[k] = msg[k];
        payload.msgId = 'm_' + (me() || 'anon') + '_' + Date.now() + '_' + rnd(6);
        payload.senderId = payload.senderId || me();
        payload.timestamp = payload.timestamp || Date.now();
      }
      var r;
      try { r = origBroadcast.call(window, payload); } catch (e) {}
      try { netSend(payload); } catch (e) {}
      return r;
    };
    w.__cpWrapped = true;
    window.broadcast = w;
  }

  /* ========================================================== LEADERBOARD */
  function localRecords() {
    var w = window.timiLeaderboardRecords;
    return Array.isArray(w) ? w : [];
  }
  function recKey(r) {
    if (!r) return '';
    if (r.id && typeof r.id === 'string' && r.id.indexOf('timi_win_') === 0) return r.id;
    return 'timi_' + String(r.username || '').trim().toLowerCase() + '_' +
      (Number(r.timestamp) || 0) + '_' + String(r.userTime || '') + '_' + String(r.mode || '');
  }
  function keySet(arr) {
    var m = {};
    for (var i = 0; i < arr.length; i++) { var k = recKey(arr[i]); if (k) m[k] = 1; }
    return m;
  }
  function pushRecs(out, d) {
    var i, src;
    if (Array.isArray(d)) src = d;
    else if (d && Array.isArray(d.records)) src = d.records;
    else if (d && d.username) src = [d];
    else src = [];
    for (i = 0; i < src.length; i++) if (src[i] && src[i].username) out.push(src[i]);
  }
  function mergeCloud(recs) {
    if (recs && recs.length && typeof window.mergeLeaderboardRecords === 'function') {
      try { window.mergeLeaderboardRecords(recs); } catch (e) {}
    }
  }
  var lbSig = '', lbSigAt = 0, cloudMax = 0;
  function publishLbRetained(force) {
    var recs = localRecords();
    if (!recs.length) return false;
    var newest = 0, i;
    for (i = 0; i < recs.length; i++) newest = Math.max(newest, Number(recs[i].timestamp) || 0);
    var sig = recs.length + '_' + newest;
    if (recs.length < cloudMax) return false;
    if (!force && sig === lbSig && Date.now() - lbSigAt < 600000) return false;
    var slice = recs.slice(0, 300);
    var body = JSON.stringify({ v: 1, records: slice });
    while (byteLen(body) > 200000 && slice.length > 20) {
      slice = slice.slice(0, Math.max(20, Math.floor(slice.length / 2)));
      body = JSON.stringify({ v: 1, records: slice });
    }
    var ok = meshPublish(TOPIC_LB, body, true);
    if (ok) { lbSig = sig; lbSigAt = Date.now(); stats.lbPub++; }
    return ok;
  }
  function handleLbPayload(text) {
    var out = [];
    try { pushRecs(out, JSON.parse(text)); } catch (e) { return; }
    if (!out.length) return;
    stats.lbCloud += out.length;
    if (out.length > cloudMax) cloudMax = out.length;
    mergeCloud(out);
  }

  function chunkRecords(recs) {
    var chunks = [], cur = [], overhead = 24, size = overhead, i, b;
    for (i = 0; i < recs.length; i++) {
      b = byteLen(JSON.stringify(recs[i])) + 1;
      if (cur.length && size + b > NTFY_MAX_BODY) { chunks.push(cur); cur = []; size = overhead; }
      cur.push(recs[i]); size += b;
    }
    if (cur.length) chunks.push(cur);
    return chunks.map(function (c) { return JSON.stringify({ v: 1, records: c }); });
  }
  function parseNdjson(text) {
    var out = [], lines = String(text || '').split('\n'), i, ev, d;
    for (i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      try { ev = JSON.parse(line); } catch (e) { continue; }
      if (!ev || ev.event !== 'message' || !ev.message) continue;
      try { d = JSON.parse(ev.message); } catch (e) { continue; }
      pushRecs(out, d);
    }
    return out;
  }
  function readNtfyLb(base) {
    stats.lpPolls++;
    return origFetch(base + '/' + NTFY_LB_TOPIC + '/json?poll=1&since=all').then(function (res) {
      stats.lastStatus = res.status;
      if (!res.ok) throw new Error('lb ' + res.status);
      return res.text();
    }).then(parseNdjson);
  }
  function readBases() {
    var bases = ntfyBases();
    var pick = [];
    if (RELAY) pick.push(RELAY);
    for (var i = 0; i < bases.length && pick.length < 2 + (RELAY ? 1 : 0); i++) {
      if (pick.indexOf(bases[i]) < 0) pick.push(bases[i]);
    }
    return Promise.all(pick.map(function (base) {
      return readNtfyLb(base).then(
        function (recs) { return { base: base, recs: recs }; },
        function () { return { base: base, recs: null }; }
      );
    }));
  }

  var recentPub = {}, rcTimer = null, rcBusy = false, rcAgain = false, lastReconcile = 0;
  function scheduleReconcile(reason, ms) {
    if (rcTimer) return;
    rcTimer = setTimeout(function () { rcTimer = null; reconcile(reason); }, ms == null ? 1500 : ms);
  }
  function missingFor(base, keys) {
    var now = Date.now(), local = localRecords(), out = [], i, k, pk;
    for (i = 0; i < local.length; i++) {
      k = recKey(local[i]); pk = base + '|' + k;
      if (k && !keys[k] && !(recentPub[pk] && now - recentPub[pk] < 300000)) out.push(local[i]);
    }
    return out;
  }
  function publishChunks(recs, base) {
    var bodies = chunkRecords(recs), p = Promise.resolve(), now = Date.now();
    bodies.forEach(function (b, idx) {
      p = p.then(function () {
        if (idx > 2) return null;
        return ntfySendTo(base, NTFY_LB_TOPIC, b, 0);
      }).then(function () { return delay(600); });
    });
    return p;
  }
  function ntfySendTo(base, topic, body, tries) {
    return origFetch(base + '/' + topic, {
      method: 'POST', body: body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
    }).then(function (res) {
      stats.lastStatus = res.status; stats.txNtfy++;
      if (res.status === 429) stats.ntfy429++;
      return res.ok;
    }, function () { return false; });
  }
  var lastNtfyRead = 0;
  function reconcile(reason) {
    if (rcBusy) { rcAgain = true; return; }
    /* MQTT retained messages are the primary cloud store; ntfy is only read
       when the mesh is down or has no copy yet, or every 10 minutes as a
       cross-check for legacy clients that only publish to ntfy. */
    if (meshLive() && cloudMax > 0 && reason !== 'legacy-publish' && reason !== 'manual' &&
        Date.now() - lastNtfyRead < 600000) {
      publishLbRetained();
      return;
    }
    lastNtfyRead = Date.now();
    if (Date.now() - lastReconcile < 45000 && reason !== 'changed' && reason !== 'legacy-publish') return;
    rcBusy = true; lastReconcile = Date.now();
    readBases().then(function (res) {
      var all = [], i;
      for (i = 0; i < res.length; i++) if (res[i].recs) all = all.concat(res[i].recs);
      stats.lbCloud = all.length;
      if (all.length) { mergeCloud(all); if (all.length > cloudMax) cloudMax = all.length; }
      publishLbRetained();
      var jobs = [];
      for (i = 0; i < res.length; i++) {
        if (!res[i].recs) continue;
        var still = missingFor(res[i].base, keySet(res[i].recs));
        if (!still.length) continue;
        var now = Date.now(), j;
        for (j = 0; j < still.length; j++) recentPub[res[i].base + '|' + recKey(still[j])] = now;
        jobs.push(publishChunks(still, res[i].base));
      }
      return Promise.all(jobs);
    }).catch(function (e) {
      stats.lastError = String((e && e.message) || e);
    }).then(function () {
      rcBusy = false;
      if (rcAgain) { rcAgain = false; scheduleReconcile('again', 5000); }
    });
  }

  /* ===================================== NTFY STREAM + LONG-POLL FALLBACK */
  var streams = [];
  function NtfyStream(base, idx) {
    this.base = base;
    this.idx = idx;
    this.ws = null;
    this.tries = 0;
    this.lastRx = 0;
    this.timer = null;
    this.paused = true;
  }
  NtfyStream.prototype.start = function () {
    if (!this.paused && (this.ws || this.timer)) return;
    this.paused = false;
    this.tries = 0;
    this.connect();
  };
  NtfyStream.prototype.stop = function () {
    this.paused = true;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    var ws = this.ws;
    this.ws = null;
    if (ws) { try { ws.onclose = null; ws.onerror = null; ws.onmessage = null; ws.close(); } catch (e) {} }
  };
  NtfyStream.prototype.isLive = function () { return !!(this.ws && this.ws.readyState === 1); };
  NtfyStream.prototype.connect = function () {
    if (this.ws || this.paused) return;
    var self = this;
    var url = this.base.replace(/^http/, 'ws') + '/' + NTFY_TOPIC + '/ws';
    var ws;
    try { ws = new WebSocket(url); } catch (e) { return this.schedule(); }
    this.ws = ws;
    ws.onopen = function () { self.tries = 0; self.lastRx = Date.now(); };
    ws.onmessage = function (ev) {
      self.lastRx = Date.now();
      var item;
      try { item = JSON.parse(ev.data); } catch (e) { return; }
      if (!item || item.event !== 'message' || !item.message) return;
      var data;
      try { data = JSON.parse(item.message); } catch (e) { return; }
      dispatch(data);
    };
    ws.onerror = function () {};
    ws.onclose = function () {
      self.ws = null;
      if (!self.paused) self.schedule();
    };
  };
  NtfyStream.prototype.schedule = function () {
    var self = this;
    if (this.timer || this.paused) return;
    this.tries = Math.min(this.tries + 1, 6);
    var wait = Math.min(45000, 1200 * Math.pow(1.7, this.tries)) + Math.floor(Math.random() * 1200);
    this.timer = setTimeout(function () { self.timer = null; self.connect(); }, wait);
  };
  function streamsLive() {
    for (var i = 0; i < streams.length; i++) if (streams[i].isLive()) return true;
    return false;
  }

  /* Long-poll: only while nothing else delivers. 1 request / 5 s per server
     is exactly ntfy's refill rate, so it never trips the limiter. */
  var lp = { active: false, timer: null, interval: 5500, since: {} };
  function startLongPoll() {
    if (lp.active) return;
    lp.active = true;
    lp.interval = 5500;
    lpTick();
  }
  function stopLongPoll() {
    lp.active = false;
    if (lp.timer) { clearTimeout(lp.timer); lp.timer = null; }
  }
  function lpPollBase(base) {
    var since = lp.since[base] || '30s';
    var url = base + '/' + NTFY_TOPIC + '/json?poll=1&since=' + encodeURIComponent(since);
    stats.lpPolls++;
    return origFetch(url).then(function (res) {
      stats.lastStatus = res.status;
      if (res.status === 429) { lp.interval = Math.min(30000, Math.round(lp.interval * 1.6)); return ''; }
      if (!res.ok) throw new Error('lp ' + res.status);
      return res.text();
    }).then(function (text) {
      var lines = String(text || '').split('\n'), i, ev;
      for (i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) continue;
        try { ev = JSON.parse(line); } catch (e) { continue; }
        if (ev && ev.id) lp.since[base] = ev.id;
        if (ev && ev.event === 'message' && ev.message) {
          stats.lpMsgs++;
          try { dispatch(JSON.parse(ev.message)); } catch (e) {}
        }
      }
    });
  }
  function lpTick() {
    lp.timer = null;
    if (!lp.active) return;
    var bases = ntfyBases().slice(0, 2);
    var jobs = bases.map(function (b) {
      return lpPollBase(b).catch(function () {
        lp.interval = Math.min(30000, Math.round(lp.interval * 1.4));
      });
    });
    Promise.all(jobs).then(function () {
      if (lp.active) lp.timer = setTimeout(lpTick, lp.interval);
    });
  }

  /* ================================================= HEALTH / RECONNECTION */
  var hiddenAt = 0, lastWake = 0;
  function onWake(reason) {
    var away = hiddenAt ? Date.now() - hiddenAt : 0;
    hiddenAt = 0;
    if (Date.now() - lastWake < 2500) return;
    lastWake = Date.now();
    if (away > 10000 || reason === 'online' || reason === 'pageshow') {
      reconnectAll();
      for (var i = 0; i < streams.length; i++) {
        var s = streams[i];
        if (!s.isLive()) { s.stop(); if (!meshLive() && i === 0) s.start(); }
      }
    }
    setTimeout(function () { flushOutbox(); announce(true, true); }, 900);
    setTimeout(function () { scheduleReconcile('wake', 400); }, 2200);
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now();
      else onWake('visible');
    });
  }
  window.addEventListener('online', function () { onWake('online'); });
  window.addEventListener('offline', function () { hiddenAt = Date.now(); });
  window.addEventListener('pageshow', function (e) { if (!e || e.persisted) onWake('pageshow'); });
  window.addEventListener('focus', function () { if (document.visibilityState === 'visible') onWake('focus'); });

  var tick = 0, lastLbCheck = 0;
  setInterval(function () {
    tick++;
    if (tick % 10 === 0) {
      /* keep at least the 443 brokers alive; never give up on the mesh */
      var live = liveBrokers().length;
      if (live === 0) {
        for (var i = 0; i < brokers.length; i++) {
          if (!brokers[i].ws && !brokers[i].retryTimer) brokers[i].connect();
        }
      }
    }
    if (tick % 15 === 0) {
      if (meshLive()) {
        if (lp.active) stopLongPoll();
        for (var s1 = 0; s1 < streams.length; s1++) if (streams[s1].ws || streams[s1].timer) streams[s1].stop();
      } else {
        if (streams[0]) streams[0].start();
        if (streams[0] && !streams[0].isLive() && streams[0].tries >= 2 && streams[1]) streams[1].start();
        if (!streamsLive() && !lp.active && document.visibilityState === 'visible') startLongPoll();
      }
      /* half-open watchdog for broker sockets */
      for (var j = 0; j < brokers.length; j++) {
        var b = brokers[j];
        if (b.isLive() && b.lastRx && Date.now() - b.lastRx > 150000) b.drop('watchdog');
      }
    }
    if (tick % 60 === 0) {
      /* outbox GC */
      var t = Date.now();
      for (var id in outbox) {
        if (Object.prototype.hasOwnProperty.call(outbox, id) && t - outbox[id].at > 90000) {
          if (outbox[id].timer) clearTimeout(outbox[id].timer);
          delete outbox[id];
        }
      }
      if (document.visibilityState === 'visible') scheduleReconcile('periodic', 300);
    }
    if (tick % 300 === 0) publishLbRetained();
    if (tick >= 3600) tick = 0;
  }, 1000);

  /* ============================================================== DIAGNOSTICS */
  function status() {
    var out = { brokers: {}, live: 0, streams: 0, mqttOk: meshLive(), players: '?', records: localRecords().length, lp: lp.active, stats: stats, relay: RELAY || 'off' };
    for (var i = 0; i < brokers.length; i++) {
      out.brokers[brokers[i].id] = brokers[i].isLive() ? 'acik' : (brokers[i].retryTimer ? 'bekliyor' : 'kapali');
      if (brokers[i].isLive()) out.live++;
    }
    for (var j = 0; j < streams.length; j++) if (streams[j].isLive()) out.streams++;
    var m = lex('activePlayersMap');
    if (m && m.size != null) out.players = m.size;
    return out;
  }

  function testBroker(conf) {
    return new Promise(function (resolve) {
      var t0 = Date.now(), done = false, ws = null, timer = null;
      function fin(r) {
        if (done) return;
        done = true;
        if (timer) clearTimeout(timer);
        try { if (ws) { ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null; ws.close(); } } catch (e) {}
        resolve(r);
      }
      timer = setTimeout(function () { fin({ ok: false, ms: Date.now() - t0, err: 'zaman asimi / port kapali' }); }, 9000);
      try { ws = new WebSocket(conf.url, ['mqtt']); } catch (e) {
        try { ws = new WebSocket(conf.url); } catch (e2) { return fin({ ok: false, ms: 0, err: 'WebSocket yok' }); }
      }
      try { ws.binaryType = 'arraybuffer'; } catch (e) {}
      var parser = new Parser(function (type, body) {
        if (type === 2) {
          if (body[1] !== 0) return fin({ ok: false, ms: Date.now() - t0, err: 'reddedildi (' + body[1] + ')' });
          var topic = 'cp_netcheck/' + rnd(8);
          try {
            ws.send(mqttSubPkt(9, topic));
            ws.send(mqttPubPkt(topic, utf8Encode('ping'), false));
          } catch (e) {}
        } else if (type === 3) {
          fin({ ok: true, ms: Date.now() - t0 });
        }
      });
      ws.onopen = function () {
        try { ws.send(mqttConnectPkt('cpcheck_' + rnd(6), conf.user, conf.pass, 30)); } catch (e) { fin({ ok: false, ms: 0, err: 'gonderilemedi' }); }
      };
      ws.onmessage = function (ev) { try { parser.feed(new Uint8Array(ev.data)); } catch (e) {} };
      ws.onerror = function () {};
      ws.onclose = function () { if (!done) fin({ ok: false, ms: Date.now() - t0, err: 'baglanti kapandi (port engelli olabilir)' }); };
    });
  }

  function testNtfy(base) {
    var t0 = Date.now();
    return origFetch(base + '/cp_netcheck_' + rnd(8), {
      method: 'POST', body: 'ping', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
    }).then(function (res) {
      var ms = Date.now() - t0;
      if (res.status === 429) return { ok: false, ms: ms, err: 'HTTP 429 (IP kotasi dolu)' };
      if (!res.ok) return { ok: false, ms: ms, err: 'HTTP ' + res.status };
      return { ok: true, ms: ms };
    }, function (e) { return { ok: false, ms: Date.now() - t0, err: 'ulasilamiyor' }; });
  }

  function runNetCheck(log) {
    var chain = Promise.resolve();
    var summary = { mqtt: 0, ntfy: 0 };
    BROKERS.forEach(function (b) {
      chain = chain.then(function () {
        return testBroker(b).then(function (r) {
          if (r.ok) summary.mqtt++;
          log('MQTT  ' + (b.tls443 ? '[443] ' : '      ') + b.id + ' : ' + (r.ok ? 'OK (' + r.ms + ' ms, mesaj geri dondu)' : 'HATA - ' + r.err));
        });
      });
    });
    NTFY_SERVERS.forEach(function (base) {
      chain = chain.then(function () {
        return testNtfy(base).then(function (r) {
          if (r.ok) summary.ntfy++;
          log('NTFY  ' + base.replace('https://', '') + ' : ' + (r.ok ? 'OK (' + r.ms + ' ms)' : 'HATA - ' + r.err));
        });
      });
    });
    return chain.then(function () {
      log('');
      if (summary.mqtt > 0) log('SONUC: ' + summary.mqtt + ' MQTT sunucusu calisiyor. 1v1 ve liderlik tablosu tam hizda calisir.');
      else if (summary.ntfy > 0) log('SONUC: MQTT portlari kapali, ntfy yedegi calisiyor. Oyun calisir, birkac saniye gecikme olabilir.');
      else log('SONUC: Hicbir kanal acilamadi. Ag yoneticisi WebSocket/HTTPS trafigini engelliyor olabilir.');
      return summary;
    });
  }
  window.__cpNetCheck = function () {
    var lines = [];
    return runNetCheck(function (l) { lines.push(l); }).then(function () { return lines.join('\n'); });
  };

  function initDebug() {
    try {
      if (String(location.hash || '').indexOf('syncdebug') < 0) return;
      var box = document.createElement('pre');
      box.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99999;margin:0;padding:6px 8px;' +
        'background:rgba(0,0,0,.84);color:#34d399;font:11px/1.35 monospace;border-radius:8px;' +
        'max-width:94vw;white-space:pre-wrap;pointer-events:none';
      document.body.appendChild(box);
      setInterval(function () {
        var s = status(), ok = 0, id;
        var parts = [];
        for (id in s.brokers) parts.push(id + ':' + s.brokers[id]);
        box.textContent = 'canli broker: ' + s.live + '/' + brokers.length + '  ntfy akis: ' + s.streams + '  longpoll: ' + s.lp +
          '\n' + parts.join('  ') +
          '\noyuncu: ' + s.players + '  kayit: ' + s.records + '  rx: ' + stats.rx + '  dup: ' + stats.dup +
          '\npub: ' + stats.pub + '  retry: ' + stats.retries + '  ack: ' + stats.acks + '  ntfy: ' + stats.txNtfy + ' (429:' + stats.ntfy429 + ')' +
                        '\nhata: ' + (stats.lastError || '-');
      }, 1500);
    } catch (e) {}
  }

  function initNetCheck() {
    try {
      if (String(location.hash || '').indexOf('netcheck') < 0) return;
      var box = document.createElement('pre');
      box.style.cssText = 'position:fixed;left:8px;right:8px;top:8px;z-index:100000;margin:0;padding:10px 12px;' +
        'background:rgba(2,6,23,.96);color:#e2e8f0;font:12px/1.5 monospace;border:2px solid #38bdf8;' +
        'border-radius:10px;white-space:pre-wrap;max-height:84vh;overflow:auto';
      box.textContent = 'Ag testi basladi, ~60 sn surebilir...\n\n';
      document.body.appendChild(box);
      runNetCheck(function (l) { box.textContent += l + '\n'; });
    } catch (e) {}
  }

  /* ==================================================================== INIT */
  var startedOnce = false;
  window.__cpOnBrokerUp = function () {
    if (startedOnce) return;
    startedOnce = true;
    setTimeout(function () {
      announce(true, true);
      publishLbRetained(true);
      scheduleReconcile('broker-up', 1500);
    }, 500);
  };

  function start() {
    try { installHandle(); } catch (e) {}
    try { installBroadcast(); } catch (e) {}
    try { installFetchGate(); } catch (e) {}
    connectAll();
    try {
      streams.push(new NtfyStream(NTFY_SERVERS[0], 0));
      streams.push(new NtfyStream(NTFY_SERVERS[1], 1));
      setTimeout(function () { if (!meshLive()) streams[0].start(); }, 6000);
    } catch (e) {}
    initDebug();
    initNetCheck();
    scheduleReconcile('start', 2500);
    setTimeout(function () { scheduleReconcile('start2', 1200); }, 9000);
  }

  window.__cpSyncStatus = status;
  window.__cpSyncFix = {
    chunkRecords: chunkRecords, parseNdjson: parseNdjson, recKey: recKey,
    reconcile: function () { scheduleReconcile('manual', 100); },
    forceReconnect: function () { reconnectAll(); onWake('manual'); },
    status: status, startLongPoll: startLongPoll, stopLongPoll: stopLongPoll, lp: lp,
    readBases: readBases, publishLbRetained: publishLbRetained,
    brokers: brokers, streams: streams, stats: stats, dispatch: dispatch
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
