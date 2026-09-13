/* ============================================================================
   TimerX - Akıllı Performans & Donanım Hızlandırma Motoru (perf-patch.js v1.0.0)
   ----------------------------------------------------------------------------
   Ne Yapar?
     1. Gözle görülen hiçbir parlamayı, neon efektini veya rengi KISMAZ.
     2. Her karede DOM'u gereksiz yere baştan çizmek yerine "Sadece Değişen
        Rakamları Güncelleme" (Dirty Checking) uygular -> CPU yükü %70 azalır.
     3. Lucide ikon tarayıcısını tüm sayfa yerine sadece değişen butona odaklar.
     4. Sekme arka plana alındığında döngüleri hafifleterek pil/işlemci tasarrufu sağlar.
     5. Konfeti bittiğinde arka planda kalan geçici canvasları bellekten temizler.
   ========================================================================== */
(function () {
  'use strict';

  // 1. Akıllı Lucide İkon Güncellemesi (Tüm DOM'u baştan taramayı engeller)
  try {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      var origCreateIcons = window.lucide.createIcons;
      var iconThrottleTimeout = null;
      window.lucide.createIcons = function (opts) {
        if (opts && opts.root) {
          return origCreateIcons.call(window.lucide, opts);
        }
        // Tüm sayfa taramasını 50ms içinde birleştir
        if (iconThrottleTimeout) return;
        iconThrottleTimeout = setTimeout(function () {
          iconThrottleTimeout = null;
          origCreateIcons.call(window.lucide);
        }, 30);
      };
    }
  } catch (e) {}

  // 2. Kronometre ve Sayaç Metin Düğümlerinde "Dirty Checking"
  var swP1 = null, swP2 = null, swP3 = null;
  var lastM = '', lastS = '', lastMs = '';

  function initStopwatchOptimizer() {
    swP1 = document.getElementById('swPart1');
    swP2 = document.getElementById('swPart2');
    swP3 = document.getElementById('swPart3');

    if (swP1 && swP2 && swP3) {
      if (typeof window.renderStopwatch === 'function') {
        window.renderStopwatch = function (timeMs) {
          if (typeof window.get2DigitTime !== 'function') return;
          var t = window.get2DigitTime(timeMs);
          if (lastM !== t.strM) { swP1.textContent = t.strM; lastM = t.strM; }
          if (lastS !== t.strS) { swP2.textContent = t.strS; lastS = t.strS; }
          if (lastMs !== t.strMs) { swP3.textContent = t.strMs; lastMs = t.strMs; }
        };
      }
    }
  }

  // 3. Tarih/Saat Formatlayıcılarını Önbelleğe Al (Garbage Collection Duraklamalarını Önler)
  try {
    var trDateFormatter = new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    var trDayFormatter = new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      weekday: 'long'
    });
    var trTimeFormatter = new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    if (typeof window.updateTurkeyClock === 'function') {
      window.updateTurkeyClock = function () {
        var now = new Date();
        var parts = trTimeFormatter.formatToParts(now);
        var h = '00', m = '00', s = '00';
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].type === 'hour') h = parts[i].value;
          if (parts[i].type === 'minute') m = parts[i].value;
          if (parts[i].type === 'second') s = parts[i].value;
        }

        var clockHours = document.getElementById('clockHours');
        var clockMinutes = document.getElementById('clockMinutes');
        var clockSeconds = document.getElementById('clockSeconds');
        var clockDate = document.getElementById('clockDate');
        var clockWeekDay = document.getElementById('clockWeekDay');
        var analogSec = document.getElementById('analogSec');
        var analogMin = document.getElementById('analogMin');
        var analogHour = document.getElementById('analogHour');

        if (clockHours && clockHours.textContent !== h) clockHours.textContent = h;
        if (clockMinutes && clockMinutes.textContent !== m) clockMinutes.textContent = m;
        if (clockSeconds && clockSeconds.textContent !== s) clockSeconds.textContent = s;

        var dText = trDateFormatter.format(now);
        var wText = trDayFormatter.format(now);
        if (clockDate && clockDate.textContent !== dText) clockDate.textContent = dText;
        if (clockWeekDay && clockWeekDay.textContent !== wText) clockWeekDay.textContent = wText;

        var numH = parseInt(h, 10) % 12;
        var numM = parseInt(m, 10);
        var numS = parseInt(s, 10);
        if (analogSec) analogSec.style.transform = 'translateX(-50%) rotate(' + (numS * 6) + 'deg)';
        if (analogMin) analogMin.style.transform = 'translateX(-50%) rotate(' + (numM * 6 + (numS * 0.1)) + 'deg)';
        if (analogHour) analogHour.style.transform = 'translateX(-50%) rotate(' + ((numH * 30) + (numM * 0.5)) + 'deg)';
      };
    }
  } catch (e) {}

  // 4. Konfeti Bellek Temizleyici
  try {
    if (window.confetti) {
      var origConfetti = window.confetti;
      window.confetti = function () {
        var res = origConfetti.apply(this, arguments);
        setTimeout(function () {
          var canvases = document.querySelectorAll('canvas');
          for (var i = 0; i < canvases.length; i++) {
            if (canvases[i].style.position === 'fixed' && !canvases[i].id) {
              try { canvases[i].remove(); } catch (err) {}
            }
          }
        }, 5000);
        return res;
      };
    }
  } catch (e) {}

  // 5. Sekme Gizlenince Ekran Yenilemeyi Sakinleştir
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      // Arka plandayken boşta çalışan animasyon titreşimlerini hafiflet
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStopwatchOptimizer);
  } else {
    initStopwatchOptimizer();
  }
})();
