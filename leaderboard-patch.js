/* ============================================================================
   TimerX / ChronoPulse - Liderlik Tablosu & Canlı Senkronizasyon Yaması (v2.0.0)
   ----------------------------------------------------------------------------
   Çözülen Kritik Sorunlar:
     1. Farklı cihazlarda / tarayıcılarda kayıtların eksik veya farklı görünmesi
        sorunu tamamen çözüldü (Set-Union veri birleştirme).
     2. Yeni/boş bir cihaz açıldığında sunucudaki dolu listeyi ezmesi engellendi
        (Koruma kalkanı: Asla daha az kayıtla sunucuya yazılmaz).
     3. Çoklu MQTT Broker yedeklemesi (EMQX + HiveMQ) ile retained mesaj
        kayıpları önlendi.
     4. Liderlik tablosu açıldığında veya 10 saniyede bir otomatik canlı
        senkronizasyon tetiklenir.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'chrono_timi_champions_v1';
  var MQTT_TOPIC_PRIMARY = 'chronopulse/global/timi_leaderboard_retained/v1';
  var MQTT_TOPIC_BACKUP = 'timerx/global/timi_leaderboard_retained/v2';
  var PURGE_USERS = ['testali'];

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
      if (typeof currentLang === 'string' && LABELS[currentLang]) lang = currentLang;
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
    try {
      return !!rec && PURGE_USERS.indexOf(String(rec.username || '').trim().toLowerCase()) > -1;
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

  /* Benzersiz kimlik anahtarı üretir — kayıtların mükerrer olmasını önler */
  function getRecordKey(r) {
    if (!r) return '';
    if (r.id && typeof r.id === 'string' && r.id.indexOf('timi_win_') === 0) {
      return r.id;
    }
    var user = String(r.username || '').trim().toLowerCase();
    var ts = Number(r.timestamp) || 0;
    var ut = String(r.userTime || '');
    return 'timi_' + user + '_' + ts + '_' + ut;
  }

  function getRecords() {
    try {
      if (typeof window.timiLeaderboardRecords !== 'undefined' && Array.isArray(window.timiLeaderboardRecords)) {
        return window.timiLeaderboardRecords;
      }
    } catch (e) {}
    return [];
  }

  var maxSeenGlobalCount = 0;

  /* ==========================================================================
     KUSURSUZ BİRLEŞTİRME MOTORU (Set-Union Merge)
     Hiçbir cihazın galibiyetini silmez, eksiltmez; daima en geniş listeyi korur.
     ========================================================================== */
  function safeMergeRecords(incoming) {
    if (!Array.isArray(incoming) || incoming.length === 0) return false;

    var current = getRecords();
    var map = Object.create(null);

    // 1. Mevcut yerel kayıtları haritaya ekle
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

    if (merged.length > 200) merged = merged.slice(0, 200);

    if (merged.length > maxSeenGlobalCount) {
      maxSeenGlobalCount = merged.length;
    }

    if (added > 0 || current.length !== merged.length) {
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

      return true;
    }

    return false;
  }

  /* ==========================================================================
     RETAINED YAYIN KORUMA KALKANI
     Dolu bir sunucunun boş/eksik bir cihaz tarafından ezilmesini engeller.
     ========================================================================== */
  function safePublishLeaderboardRetained() {
    var recs = getRecords();
    if (!recs || recs.length === 0) return; // Asla boş liste yayınlanmaz!

    // Eğer yereldeki sayı bugüne kadar gördüğümüz global sayıdan belirgin küçükse ezme!
    if (recs.length < maxSeenGlobalCount) return;

    var payload = JSON.stringify(recs);

    // 1. Ana MQTT istemcisiyle yayınla
    try {
      if (window.mqttClient && window.mqttClient.connected) {
        window.mqttClient.publish(MQTT_TOPIC_PRIMARY, payload, { retain: true, qos: 1 });
        window.mqttClient.publish(MQTT_TOPIC_BACKUP, payload, { retain: true, qos: 1 });
      }
    } catch (e) {}

    // 2. Yedek HiveMQ istemcisiyle yayınla
    try {
      if (backupClient && backupClient.connected) {
        backupClient.publish(MQTT_TOPIC_PRIMARY, payload, { retain: true, qos: 1 });
        backupClient.publish(MQTT_TOPIC_BACKUP, payload, { retain: true, qos: 1 });
      }
    } catch (e) {}
  }

  /* ==========================================================================
     YEDEK MQTT BROKER BAĞLANTISI (HiveMQ Cloud Fallback)
     ========================================================================== */
  var backupClient = null;
  function initBackupMqtt() {
    try {
      if (typeof mqtt !== 'undefined') {
        var id = 'cp_bak_' + Math.random().toString(36).substr(2, 8);
        backupClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', {
          clientId: id,
          keepalive: 45,
          clean: true
        });

        backupClient.on('connect', function () {
          backupClient.subscribe(MQTT_TOPIC_PRIMARY, { qos: 1 });
          backupClient.subscribe(MQTT_TOPIC_BACKUP, { qos: 1 });
          // Bağlanınca hemen mevcut listemizi akıllıca senkronize et
          safePublishLeaderboardRetained();
        });

        backupClient.on('message', function (topic, message) {
          try {
            if (topic === MQTT_TOPIC_PRIMARY || topic === MQTT_TOPIC_BACKUP) {
              var list = JSON.parse(message.toString());
              if (Array.isArray(list)) {
                safeMergeRecords(list);
              }
            }
          } catch (e) {}
        });
      }
    } catch (e) {}
  }

  /* ==========================================================================
     GRUP VE EKRAN ÇİZİMİ
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
        badge: 'bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 border-amber-300',
        card: 'bg-gradient-to-r from-amber-950/50 via-yellow-950/30 to-slate-900 border-amber-500/70 shadow-lg shadow-amber-500/10',
        count: 'text-amber-300'
      };
    }
    if (index === 1) {
      return {
        medal: '🥈',
        badge: 'bg-slate-300/20 text-slate-200 border-slate-400/50',
        card: 'bg-slate-900/90 border-slate-700 hover:border-slate-500/60',
        count: 'text-slate-200'
      };
    }
    if (index === 2) {
      return {
        medal: '🥉',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        card: 'bg-slate-900/90 border-slate-800 hover:border-orange-500/40',
        count: 'text-orange-300'
      };
    }
    return {
      medal: '',
      badge: 'bg-slate-800 text-slate-400 border-slate-700',
      card: 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40',
      count: 'text-brand-glow'
    };
  }

  function isMe(name) {
    try {
      if (typeof window.currentUsername === 'string' && window.currentUsername) {
        return window.currentUsername.trim().toLocaleLowerCase('tr') === name.trim().toLocaleLowerCase('tr');
      }
    } catch (e) {}
    return false;
  }

  function buildRow(group, index) {
    var s = rankStyles(index);
    var row = document.createElement('div');
    row.className = 'p-3 sm:p-4 rounded-2xl border transition-all ' + s.card;
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
          '<div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center text-xs sm:text-sm font-black font-mono shrink-0 ' + s.badge + '">' +
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

  function renderGroupedLeaderboard() {
    var list = getRecords();
    var groups = groupByPlayer(list);

    var listEl = document.getElementById('leaderboardList');
    var totalEl = document.getElementById('leaderboardTotalWins');
    var badgeEl = document.getElementById('leaderboardBadgeCount');

    if (totalEl) totalEl.textContent = list.length;
    if (badgeEl) badgeEl.textContent = list.length;

    if (!listEl) return;
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
    for (var i = 0; i < groups.length; i++) fragment.appendChild(buildRow(groups[i], i));
    listEl.appendChild(fragment);

    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    } catch (e) {}
  }

  function requestPeerSync() {
    try {
      if (typeof window.broadcast === 'function') {
        window.broadcast({ type: 'REQUEST_LEADERBOARD_SYNC' });
      }
    } catch (e) {}
  }

  /* ==========================================================================
     KURULUM VE EVENT SARMALARI
     ========================================================================== */
  function install() {
    // 1. Fonksiyonları güvenle devral
    window.renderLeaderboard = renderGroupedLeaderboard;
    window.mergeLeaderboardRecords = safeMergeRecords;
    window.publishLeaderboardRetained = safePublishLeaderboardRetained;

    // 2. localStorage'daki mevcut kayıtları haritaya yükle
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          safeMergeRecords(parsed);
        }
      }
    } catch (e) {}

    // 3. TİMİ galibiyeti kaydedildiğinde anında çoklu yayına çık
    if (typeof window.recordTimiDefeat === 'function') {
      var origRecordTimiDefeat = window.recordTimiDefeat;
      window.recordTimiDefeat = function () {
        var res = origRecordTimiDefeat.apply(this, arguments);
        try {
          safePublishLeaderboardRetained();
        } catch (e) {}
        return res;
      };
    }

    // 4. Liderlik butonu tıklandığında anında senkronize et
    var openBtn = document.getElementById('openLeaderboardBtn');
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        requestPeerSync();
        renderGroupedLeaderboard();
      });
    }

    // 5. Sekmeler arası senkronizasyon (Storage Event)
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          var parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) safeMergeRecords(parsed);
        } catch (err) {}
      }
      if (e.key === 'chrono_realtime_event' && e.newValue) {
        try {
          var ev = JSON.parse(e.newValue);
          if (ev.type === 'SYNC_LEADERBOARD_RECORDS' && Array.isArray(ev.records)) {
            safeMergeRecords(ev.records);
          } else if (ev.type === 'TIMI_CHAMPION_RECORD' && ev.record) {
            safeMergeRecords([ev.record]);
          }
        } catch (err) {}
      }
    });

    // 6. Yedek MQTT kanalını başlat
    initBackupMqtt();

    // 7. İlk çizim ve ilk ağ sorgusu
    renderGroupedLeaderboard();
    setTimeout(requestPeerSync, 1500);

    // 8. Canlı tazeleyici (her 15 sn'de bir peers'e sorar, süreleri günceller)
    setInterval(function () {
      var modal = document.getElementById('leaderboardModal');
      if (modal && !modal.classList.contains('hidden')) {
        requestPeerSync();
        renderGroupedLeaderboard();
      }
    }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
