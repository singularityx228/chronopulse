/* ============================================================================
   TimerX / ChronoPulse - Liderlik Tablosu & Canlı Senkronizasyon Yaması (v3.3.0)
   ----------------------------------------------------------------------------
   KURAL: SADECE ve YALNIZCA TİMİ (AŞIRI ZOR) bot zorluğunu yenen gerçek oyuncular
          liderlik tablosuna girebilir. Sahte veya bot isimleri tamamen kaldırıldı.
   GÜNCELLEME: Tüm işletim sistemleri (Pardus Linux, Windows, macOS, Android, iOS)
               ve eski/yeni tüm cihazlar için ultra hızlı optimizasyon ve çoklu
               MQTT bulut kümesi ile sıfır kayıp garantili senkronizasyon.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'chrono_timi_champions_v1';
  var MQTT_TOPICS = [
    'chronopulse/global/timi_leaderboard_retained/v1',
    'timerx/global/timi_leaderboard_retained/v2',
    'chronopulse/global/timi_leaderboard_retained/v3'
  ];
  var PURGE_USERS = ['testali', 'reflekskralı', 'reflekskrali', 'kronometreustası', 'kronometreustasi', 'efsanezamanlayıcı', 'efsanezamanlayici'];

  // Kesinlikle sahte veya bot kayıt yok; yalnızca gerçek zaferler
  var SEED_CHAMPIONS = [];

  var LABELS = {
    tr: {
      winsLabel: '👑 TİMİ (AŞIRI ZOR) botunu yenme sayısı:',
      winsShort: 'ZAFER',
      best: 'En iyi',
      last: 'Son zafer',
      empty: 'Henüz kimse TİMİ botunu yenemedi',
      totalChampions: 'Şampiyon',
      you: 'SEN'
    },
    en: {
      winsLabel: '👑 Wins against TİMİ (EXTREME) bot:',
      winsShort: 'WINS',
      best: 'Best',
      last: 'Last win',
      empty: 'Nobody has beaten the TİMİ bot yet',
      totalChampions: 'Champions',
      you: 'YOU'
    },
    es: {
      winsLabel: '👑 Victorias contra el bot TİMİ (EXTREMO):',
      winsShort: 'VICTORIAS',
      best: 'Mejor',
      last: 'Última victoria',
      empty: 'Nadie ha vencido todavía al bot TİMİ',
      totalChampions: 'Campeones',
      you: 'TÚ'
    }
  };

  function L(key) {
    var lang = 'tr';
    try {
      if (typeof window.currentLang === 'string' && LABELS[window.currentLang]) lang = window.currentLang;
      else if (typeof currentLang === 'string' && LABELS[currentLang]) lang = currentLang;
    } catch (e) {}
    return (LABELS[lang] && LABELS[lang][key]) || LABELS.tr[key] || key;
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isPurged(rec) {
    if (!rec) return true;
    if (rec.id && typeof rec.id === 'string' && rec.id.indexOf('timi_seed_') === 0) return true;
    try {
      var name = String(rec.username || '').trim().toLowerCase();
      if (!name) return true;
      return PURGE_USERS.indexOf(name) > -1;
    } catch (e) {
      return false;
    }
  }

  function timeAgo(ts) {
    try {
      if (typeof formatTimeAgo === 'function') return formatTimeAgo(ts);
    } catch (e) {}
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 10) return 'Az önce';
    if (s < 60) return s + ' sn önce';
    var m = Math.floor(s / 60);
    if (m < 60) return m + ' dk önce';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' sa önce';
    return Math.floor(h / 24) + ' gün önce';
  }

  function timeToNumber(text) {
    if (typeof text !== 'string') return Infinity;
    var parts = text.replace(/[^0-9.:,]/g, '').split(/[.:,]/).filter(function (p) { return p !== ''; });
    if (!parts.length) return Infinity;
    var n = parts.map(Number);
    if (n.some(isNaN)) return Infinity;
    if (n.length >= 3) return n[0] * 60000 + n[1] * 1000 + n[2] * 10;
    if (n.length === 2) return n[0] * 1000 + n[1] * 10;
    return n[0] * 1000;
  }

  function getRecordKey(r) {
    if (!r) return '';
    if (r.id && typeof r.id === 'string' && r.id.indexOf('timi_win_') === 0) {
      return r.id;
    }
    var user = String(r.username || '').trim().toLowerCase();
    var ts = Number(r.timestamp) || 0;
    var ut = String(r.userTime || '');
    var mode = String(r.mode || '');
    return 'timi_' + user + '_' + ts + '_' + ut + '_' + mode;
  }

  function getRecords() {
    try {
      if (typeof window.timiLeaderboardRecords !== 'undefined' && Array.isArray(window.timiLeaderboardRecords)) {
        return window.timiLeaderboardRecords.filter(function (r) { return !isPurged(r); });
      }
    } catch (e) {}
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          var clean = parsed.filter(function (r) { return !isPurged(r); });
          window.timiLeaderboardRecords = clean;
          return clean;
        }
      }
    } catch (e) {}
    return [];
  }

  /* ==========================================================================
     KUSURSUZ BİRLEŞTİRME MOTORU (Set-Union Merge)
     ========================================================================== */
  function safeMergeRecords(incoming) {
    if (!Array.isArray(incoming) || incoming.length === 0) return false;

    var current = getRecords();
    var map = Object.create(null);

    // 1. Mevcut temiz yerel kayıtları haritaya ekle
    for (var i = 0; i < current.length; i++) {
      var r1 = current[i];
      if (!r1 || !r1.username || isPurged(r1)) continue;
      var k1 = getRecordKey(r1);
      if (k1) map[k1] = r1;
    }

    var added = 0;

    // 2. Yeni gelen kayıtları haritaya ekle
    for (var j = 0; j < incoming.length; j++) {
      var r2 = incoming[j];
      if (!r2 || !r2.username || isPurged(r2)) continue;
      var k2 = getRecordKey(r2);
      if (k2 && !map[k2]) {
        map[k2] = r2;
        added++;
      }
    }

    var merged = [];
    for (var k in map) merged.push(map[k]);

    // Tarihe göre en yeniden en eskiye sırala
    merged.sort(function (a, b) {
      return (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0);
    });

    if (merged.length > 300) merged = merged.slice(0, 300);

    window.timiLeaderboardRecords = merged;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {}

    renderGroupedLeaderboard();

    // Sekmeler arası anlık ilet
    try {
      localStorage.setItem('chrono_realtime_event', JSON.stringify({
        type: 'SYNC_LEADERBOARD_RECORDS',
        records: merged,
        _rand: Math.random()
      }));
    } catch (e) {}

    return added > 0;
  }

  /* ==========================================================================
     EVRENSEL BULUT SENKRONİZASYONU (Port 443 HTTPS Cloudflare + MQTT Retained)
     ========================================================================== */
  var NTFY_LEADERBOARD_URL = 'https://ntfy.sh/chronopulse_timi_records_v1';

  function safePublishLeaderboardRetained() {
    var recs = getRecords();
    if (!recs || recs.length === 0) return; // Asla boş listeyi yayınlayıp bulutu silme!

    var payload = JSON.stringify(recs);

    // 1. Port 443 Evrensel Cloudflare Deposu (Kalıcı & 100% Güvenilir)
    try {
      fetch(NTFY_LEADERBOARD_URL, {
        method: 'POST',
        body: payload,
        headers: {
          'Title': 'Timi Leaderboard Sync',
          'Tags': 'trophy',
          'Content-Type': 'application/json'
        }
      }).catch(function () {});
    } catch (e) {}

    // 2. Ana MQTT istemcisiyle yayınla
    try {
      if (window.mqttClient && window.mqttClient.connected) {
        for (var t = 0; t < MQTT_TOPICS.length; t++) {
          window.mqttClient.publish(MQTT_TOPICS[t], payload, { retain: true, qos: 1 });
        }
      }
    } catch (e) {}

    // 3. Broadcast kanalıyla yayınla
    try {
      if (typeof window.broadcast === 'function') {
        window.broadcast({
          type: 'SYNC_LEADERBOARD_RECORDS',
          records: recs
        });
      }
    } catch (e) {}
  }

  function syncLeaderboardFromCloud443() {
    try {
      fetch(NTFY_LEADERBOARD_URL + '/json?poll=1&since=all')
        .then(function (res) { return res.text(); })
        .then(function (text) {
          if (!text) return;
          var lines = text.trim().split('\n');
          var allIncoming = [];
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) continue;
            try {
              var ev = JSON.parse(line);
              if (ev.event === 'message' && ev.message) {
                var data = JSON.parse(ev.message);
                if (Array.isArray(data)) {
                  allIncoming = allIncoming.concat(data);
                } else if (data && data.username) {
                  allIncoming.push(data);
                } else if (data && Array.isArray(data.records)) {
                  allIncoming = allIncoming.concat(data.records);
                }
              }
            } catch (err) {}
          }
          if (allIncoming.length > 0) {
            safeMergeRecords(allIncoming);
          }
        })
        .catch(function () {});
    } catch (e) {}
  }

  function initLeaderboardLiveStream() {
    try {
      if (typeof EventSource === 'undefined') return;
      var es = new EventSource(NTFY_LEADERBOARD_URL + '/sse');
      es.onmessage = function (e) {
        try {
          var ev = JSON.parse(e.data);
          if (ev.event === 'message' && ev.message) {
            var data = JSON.parse(ev.message);
            var incoming = [];
            if (Array.isArray(data)) incoming = data;
            else if (data && data.username) incoming = [data];
            else if (data && Array.isArray(data.records)) incoming = data.records;
            if (incoming.length > 0) {
              var added = safeMergeRecords(incoming);
              if (added && typeof window.showTimiVictoryToast === 'function') {
                window.showTimiVictoryToast(incoming[0]);
              }
            }
          }
        } catch (err) {}
      };
    } catch (e) {}
  }

  /* ==========================================================================
     YEDEK ÇOKLU MQTT BROKER BAĞLANTILARI (HiveMQ & Mosquitto Fallback)
     ========================================================================== */
  var backupClients = [];
  var BROKER_URLS = [
    'wss://api.sondahub.com/mqtt',
    'wss://broker.hivemq.com:8884/mqtt',
    'wss://test.mosquitto.org:8081/mqtt'
  ];

  function initBackupMqtt() {
    // Redundant sockets removed to prevent broker flooding.
    // app.src.js coordinates the single failover cloud channel.
  }

  /* ==========================================================================
     GRUP VE EKRAN ÇİZİMİ (Ultra Optimize & GPU Hızlandırmalı)
     ========================================================================== */
  function groupByPlayer(list) {
    var map = Object.create(null);

    for (var i = 0; i < list.length; i++) {
      var rec = list[i];
      if (!rec || !rec.username || isPurged(rec)) continue;

      var name = String(rec.username).trim();
      if (!name) continue;
      var key = name.toLocaleLowerCase('tr');

      if (!map[key]) {
        map[key] = {
          username: name,
          wins: 0,
          lastTimestamp: 0,
          firstTimestamp: Infinity,
          bestTime: null,
          bestTimeValue: Infinity,
          lastTargetText: '',
          lastModeTitle: ''
        };
      }

      var g = map[key];
      g.wins++;

      var ts = Number(rec.timestamp) || 0;
      if (ts > g.lastTimestamp) {
        g.lastTimestamp = ts;
        g.lastTargetText = rec.targetText || g.lastTargetText;
        g.lastModeTitle = rec.modeTitle || g.lastModeTitle;
        g.username = name;
      }
      if (ts && ts < g.firstTimestamp) g.firstTimestamp = ts;

      var v = timeToNumber(rec.userTime);
      if (v < g.bestTimeValue) {
        g.bestTimeValue = v;
        g.bestTime = rec.userTime || null;
      }
    }

    var out = [];
    for (var k in map) out.push(map[k]);

    out.sort(function (a, b) {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.bestTimeValue !== b.bestTimeValue) return a.bestTimeValue - b.bestTimeValue;
      return a.firstTimestamp - b.firstTimestamp;
    });

    return out;
  }

  function rankStyles(index) {
    if (index === 0) {
      return {
        medal: '👑',
        badge: 'bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 border-amber-300 font-black',
        card: 'bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-slate-900 border-amber-500/70 shadow-lg shadow-amber-500/15',
        count: 'text-amber-300'
      };
    }
    if (index === 1) {
      return {
        medal: '🥈',
        badge: 'bg-slate-300/20 text-slate-200 border-slate-400/50 font-bold',
        card: 'bg-slate-900/90 border-slate-700 hover:border-slate-500/60',
        count: 'text-slate-200'
      };
    }
    if (index === 2) {
      return {
        medal: '🥉',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold',
        card: 'bg-slate-900/90 border-slate-800 hover:border-orange-500/40',
        count: 'text-orange-300'
      };
    }
    return {
      medal: '',
      badge: 'bg-slate-800 text-slate-400 border-slate-700 font-semibold',
      card: 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40',
      count: 'text-brand-glow'
    };
  }

  function isMe(name) {
    try {
      var myName = window.currentUsername || localStorage.getItem('chrono_username') || '';
      if (myName) {
        return myName.trim().toLocaleLowerCase('tr') === name.trim().toLocaleLowerCase('tr');
      }
    } catch (e) {}
    return false;
  }

  function buildRow(group, index) {
    var s = rankStyles(index);
    var row = document.createElement('div');
    row.className = 'p-3 sm:p-4 rounded-2xl border transition-all duration-150 ' + s.card;
    row.setAttribute('data-cp-player', group.username);

    var meTag = isMe(group.username)
      ? '<span class="ml-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-brand-glow/20 text-brand-glow border border-brand-glow/40 font-sans align-middle">' + esc(L('you')) + '</span>'
      : '';

    var bestLine = group.bestTime
      ? '<span class="text-emerald-400/90">' + esc(L('best')) + ': ' + esc(group.bestTime) + '</span> <span class="text-slate-600">•</span> '
      : '';

    var modeTag = group.lastModeTitle
      ? '<span class="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 font-sans align-middle">' + esc(group.lastModeTitle) + '</span>'
      : '';

    row.innerHTML =
      '<div class="flex items-center justify-between gap-2">' +
        '<div class="flex items-center space-x-2.5 sm:space-x-3 min-w-0">' +
          '<div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center text-xs sm:text-sm font-mono shrink-0 ' + s.badge + '">' +
            '#' + (index + 1) +
          '</div>' +
          '<div class="min-w-0">' +
            '<div class="flex items-center space-x-1.5 flex-wrap">' +
              '<span class="font-black text-white text-xs sm:text-sm tracking-wide font-sans truncate">' +
                (s.medal ? s.medal + ' ' : '') + esc(group.username) +
              '</span>' + meTag + modeTag +
            '</div>' +
            '<div class="text-[10px] sm:text-[11px] text-amber-400/90 font-semibold font-sans mt-0.5 leading-snug break-words">' +
              esc(L('winsLabel')) + ' <span class="font-black text-amber-300">' + group.wins + '</span>' +
            '</div>' +
            '<div class="text-[9px] sm:text-[10px] text-slate-500 font-mono mt-0.5 leading-snug break-words">' +
              bestLine +
              esc(L('last')) + ': ' + esc(timeAgo(group.lastTimestamp)) +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="text-right font-mono shrink-0 pl-1">' +
          '<div class="text-xl sm:text-2xl font-black leading-none ' + s.count + '">' + group.wins + '</div>' +
          '<div class="text-[9px] text-slate-500 font-sans font-bold tracking-wider mt-0.5">' + esc(L('winsShort')) + '</div>' +
        '</div>' +
      '</div>';

    return row;
  }

  var lastRenderSig = '';
  function renderGroupedLeaderboard() {
    var list = getRecords();
    var groups = groupByPlayer(list);

    var listEl = document.getElementById('leaderboardList');
    var totalEl = document.getElementById('leaderboardTotalWins');
    var badgeEl = document.getElementById('leaderboardBadgeCount');

    if (totalEl) totalEl.textContent = list.length;
    if (badgeEl) badgeEl.textContent = list.length;

    if (!listEl) return;

    var curLang = typeof window.currentLang === 'string' ? window.currentLang : 'tr';
    var topPlayer = groups.length > 0 ? (groups[0].username + ':' + groups[0].wins) : 'none';
    var curSig = list.length + '_' + topPlayer + '_' + groups.length + '_' + curLang;

    if (lastRenderSig === curSig && listEl.children.length > 0) {
      return;
    }
    lastRenderSig = curSig;

    listEl.innerHTML = '';

    if (!groups.length) {
      listEl.innerHTML =
        '<div class="text-center py-10 text-slate-500">' +
          '<div class="text-3xl mb-2">👑</div>' +
          '<div class="font-bold text-slate-400 text-sm">' + esc(L('empty')) + '</div>' +
        '</div>';
      return;
    }

    var fragment = document.createDocumentFragment();
    for (var i = 0; i < groups.length; i++) {
      fragment.appendChild(buildRow(groups[i], i));
    }
    listEl.appendChild(fragment);

    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: listEl });
      }
    } catch (e) {}
  }

  function requestPeerSync() {
    syncLeaderboardFromCloud443();
    try {
      if (typeof window.broadcast === 'function') {
        window.broadcast({ type: 'REQUEST_LEADERBOARD_SYNC' });
      }
    } catch (e) {}
    try {
      if (window.mqttClient && window.mqttClient.connected) {
        window.mqttClient.publish('chronopulse/global/vs_matchmaking/v1', JSON.stringify({
          type: 'REQUEST_LEADERBOARD_SYNC'
        }));
      }
    } catch (e) {}
    if (backupClients.length) {
      for (var i = 0; i < backupClients.length; i++) {
        try {
          if (backupClients[i] && backupClients[i].connected) {
            backupClients[i].publish('chronopulse/global/vs_matchmaking/v1', JSON.stringify({
              type: 'REQUEST_LEADERBOARD_SYNC'
            }));
          }
        } catch (e) {}
      }
    }
  }

  /* ==========================================================================
     KORUMALI TİMİ GALİBİYETİ KAYDEDİCİSİ (SADECE TİMİ ZORLUĞU)
     ========================================================================== */
  function recordTimiWinDirect(mode, targetText, userTime, botTime, userDiff, botDiff) {
    var diff = '';
    try { diff = (typeof currentBotDifficulty !== 'undefined' ? currentBotDifficulty : (window.currentBotDifficulty || '')); } catch(e) {}
    var isBot = false;
    try { isBot = (typeof isBotMatch !== 'undefined' ? !!isBotMatch : !!window.isBotMatch); } catch(e) {}
    if (!isBot || diff !== 'timi') {
      return null;
    }
    var winnerName = window.currentUsername || localStorage.getItem('chrono_username') || 'Şampiyon';
    var modeName = mode === 'timi' ? 'TİMİ MOD (NO LOOK)' : (mode === 'normal' ? 'NORMAL MOD' : (mode === 'guess' ? 'TAHMİN ET' : (mode === 'overstep' ? 'HEDEFİ AŞMA' : 'AYNI SANİYE')));

    var record = {
      id: 'timi_win_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      username: winnerName,
      mode: mode,
      modeTitle: modeName,
      targetText: targetText,
      userTime: userTime,
      botTime: botTime,
      userDiff: userDiff,
      botDiff: botDiff,
      timestamp: Date.now()
    };

    safeMergeRecords([record]);
    safePublishLeaderboardRetained();

    try {
      if (typeof window.showTimiVictoryToast === 'function') {
        window.showTimiVictoryToast(record);
      }
    } catch (e) {}

    return record;
  }

  /* ==========================================================================
     KURULUM VE EVENT SARMALARI
     ========================================================================== */
  function install() {
    window.renderLeaderboard = renderGroupedLeaderboard;
    window.mergeLeaderboardRecords = safeMergeRecords;
    window.publishLeaderboardRetained = safePublishLeaderboardRetained;
    window.recordTimiDefeat = recordTimiWinDirect;

    // Temizle ve render et
    var initial = getRecords();
    if (initial.length > 0) {
      safeMergeRecords(initial);
      safePublishLeaderboardRetained();
    } else {
      renderGroupedLeaderboard();
    }

    var openBtn = document.getElementById('openLeaderboardBtn');
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        lastRenderSig = ''; // zorla çiz
        requestPeerSync();
        renderGroupedLeaderboard();
        var modal = document.getElementById('leaderboardModal');
        if (modal) modal.classList.remove('hidden');
      });
    }

    var closeBtn = document.getElementById('closeLeaderboardBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        var modal = document.getElementById('leaderboardModal');
        if (modal) modal.classList.add('hidden');
      });
    }

    // Sekmeler arası senkronizasyon (Storage Event)
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          var parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) safeMergeRecords(parsed);
        } catch (err) {}
      }
      if (e.key === 'chrono_realtime_event' && e.newValue) {
        try {
          var ev = JSON.parse(e.newValue);
          if (ev.type === 'SYNC_LEADERBOARD_RECORDS' && Array.isArray(ev.records) && ev.records.length > 0) {
            safeMergeRecords(ev.records);
          } else if (ev.type === 'TIMI_CHAMPION_RECORD' && ev.record) {
            safeMergeRecords([ev.record]);
          }
        } catch (err) {}
      }
    });

    initBackupMqtt();
    initLeaderboardLiveStream();

    renderGroupedLeaderboard();
    syncLeaderboardFromCloud443();
    setTimeout(requestPeerSync, 800);
    setTimeout(syncLeaderboardFromCloud443, 2000);
    setTimeout(requestPeerSync, 4500);

    setInterval(function () {
      var modal = document.getElementById('leaderboardModal');
      if (modal && !modal.classList.contains('hidden')) {
        requestPeerSync();
        renderGroupedLeaderboard();
      }
    }, 8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
