/* ============================================================================
   ChronoPulse - Liderlik Tablosu Gruplama Yaması  (v1.0.0)
   ----------------------------------------------------------------------------
   Ne yapar?
     Aynı oyuncunun her galibiyeti için ayrı bir satır göstermek yerine,
     oyuncuyu TEK satırda gösterir ve yanında TİMİ (AŞIRI ZOR) botunu
     yenme sayısını yazar. Sıralama galibiyet sayısına göre yapılır.

   Ne yapmaz?
     Hiçbir kaydı silmez, değiştirmez veya birleştirmez. Ham kayıtlar
     (timiLeaderboardRecords) olduğu gibi kalır; localStorage ve MQTT
     senkronizasyonu hiç değişmez. Sadece EKRANA ÇİZME katmanı değişir.
     Bu dosyayı silip index.html'den script satırını kaldırırsanız
     site eski haline birebir döner.

   Canlı senkron: app.js zaten yeni bir kayıt geldiğinde (MQTT retained
   mesajı, TIMI_CHAMPION_RECORD yayını veya sekmeler arası storage olayı)
   renderLeaderboard() çağırıyor. Bu dosya o fonksiyonun üzerine yazdığı
   için sayılar her cihazda anında güncellenir.
   ========================================================================== */
(function () {
  'use strict';

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

  /* app.js içindeki formatTimeAgo varsa onu kullan, yoksa kendi sürümümüz */
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

  /* "00.04.85" / "4.85 sn" gibi metinleri karşılaştırılabilir sayıya çevirir.
     Ayrıştırılamazsa Infinity döner, yani sıralamayı asla bozmaz. */
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

  function records() {
    try {
      if (typeof timiLeaderboardRecords !== 'undefined' && Array.isArray(timiLeaderboardRecords)) {
        return timiLeaderboardRecords;
      }
    } catch (e) {}
    return [];
  }

  /* Ham kayıtları oyuncuya göre gruplar. Ham dizi HİÇ değiştirilmez. */
  function groupByPlayer(list) {
    var map = Object.create(null);

    for (var i = 0; i < list.length; i++) {
      var rec = list[i];
      if (!rec || !rec.username) continue;

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
        g.username = name; /* en güncel yazımı kullan */
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

    /* Sıralama: 1) galibiyet sayısı (çok olan üstte)
                 2) eşitlikte daha iyi (küçük) süre
                 3) yine eşitse o sayıya önce ulaşan üstte */
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
      if (typeof currentUsername === 'string' && currentUsername) {
        return currentUsername.trim().toLocaleLowerCase('tr') === name.trim().toLocaleLowerCase('tr');
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
    var list = records();
    var groups = groupByPlayer(list);

    var listEl = document.getElementById('leaderboardList');
    var totalEl = document.getElementById('leaderboardTotalWins');
    var badgeEl = document.getElementById('leaderboardBadgeCount');

    /* Üstteki sayaçlar: toplam galibiyet sayısı (eski davranışla aynı) */
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

  /* --- app.js'in fonksiyonunu güvenli biçimde devral ------------------- */
  function install() {
    try {
      window.renderLeaderboard = renderGroupedLeaderboard;
    } catch (e) {
      return;
    }

    /* Dil değişince tablo da yeniden çizilsin */
    try {
      if (typeof window.applyLanguage === 'function') {
        var originalApplyLanguage = window.applyLanguage;
        window.applyLanguage = function () {
          var result = originalApplyLanguage.apply(this, arguments);
          try { renderGroupedLeaderboard(); } catch (e) {}
          return result;
        };
      }
    } catch (e) {}

    /* İlk çizim */
    try { renderGroupedLeaderboard(); } catch (e) {}

    /* "... önce" metinleri kendiliğinden tazelensin (60 sn'de bir) */
    setInterval(function () {
      var modal = document.getElementById('leaderboardModal');
      if (modal && !modal.classList.contains('hidden')) {
        try { renderGroupedLeaderboard(); } catch (e) {}
      }
    }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
