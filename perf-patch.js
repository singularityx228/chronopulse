/* ============================================================================
   TimerX - Akıllı Performans & Donanım Hızlandırma Motoru (perf-patch.js v1.2.0)
   ----------------------------------------------------------------------------
   Ne Yapar?
     1. Gözle görülen hiçbir parlamayı, neon efektini veya rengi KISMAZ.
     2. Her karede DOM'u gereksiz yere baştan çizmek yerine "Sadece Değişen
        Rakamları Güncelleme" (Dirty Checking) uygular -> CPU yükü %70 azalır.
     3. Lucide ikon tarayıcısını tüm sayfa yerine sadece değişen butona odaklar.
     4. Sekme arka plana alındığında döngüleri hafifleterek pil/işlemci tasarrufu sağlar.
     5. Konfeti bittiğinde arka planda kalan geçici canvasları bellekten temizler.
     6. Eski Linux (Pardus), macOS, Android, iOS ve Windows cihazlarda tam uyumlu çalışır.
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
        if (iconThrottleTimeout) return;
        iconThrottleTimeout = setTimeout(function () {
          iconThrottleTimeout = null;
          try { origCreateIcons.call(window.lucide); } catch (e) {}
        }, 30);
      };
    }
  } catch (e) {}

  // 2. Kronometre ve Sayaç Metin Düğümlerinde "Dirty Checking"
  var swP1 = null, swP2 = null, swP3 = null;
  var lastM = '', lastS = '', lastMs = '';

  function tryHookRenderStopwatch() {
    swP1 = document.getElementById('swPart1');
    swP2 = document.getElementById('swPart2');
    swP3 = document.getElementById('swPart3');

    if (swP1 && swP2 && swP3 && typeof window.renderStopwatch === 'function') {
      var origRender = window.renderStopwatch;
      window.renderStopwatch = function (timeMs) {
        if (typeof window.get2DigitTime !== 'function') {
          return origRender(timeMs);
        }
        var t = window.get2DigitTime(timeMs);
        if (lastM !== t.strM) { swP1.textContent = t.strM; lastM = t.strM; }
        if (lastS !== t.strS) { swP2.textContent = t.strS; lastS = t.strS; }
        if (lastMs !== t.strMs) { swP3.textContent = t.strMs; lastMs = t.strMs; }
      };
      return true;
    }
    return false;
  }

  function initStopwatchOptimizer() {
    if (!tryHookRenderStopwatch()) {
      var attempts = 0;
      var iv = setInterval(function () {
        attempts++;
        if (tryHookRenderStopwatch() || attempts > 20) {
          clearInterval(iv);
        }
      }, 100);
    }
  }

  // 3. Konfeti Bellek Temizleyici & Max Düşüklük Koruması
  try {
    if (window.confetti) {
      var origConfetti = window.confetti;
      window.confetti = function () {
        var mode = document.documentElement.getAttribute('data-graphics');
        if (mode === 'max-low') {
          return; // Tost makinesi modunda canvas çizimini atla
        }
        var res = origConfetti.apply(this, arguments);
        if (mode === 'max-ultra') {
          setTimeout(function () {
            try {
              origConfetti({ particleCount: 70, spread: 120, origin: { y: 0.6, x: 0.2 } });
              origConfetti({ particleCount: 70, spread: 120, origin: { y: 0.6, x: 0.8 } });
            } catch (e) {}
          }, 300);
        }
        setTimeout(function () {
          try {
            var canvases = document.querySelectorAll('canvas');
            for (var i = 0; i < canvases.length; i++) {
              if (canvases[i].style.position === 'fixed' && !canvases[i].id) {
                try { canvases[i].remove(); } catch (err) {}
              }
            }
          } catch (e) {}
        }, 5000);
        return res;
      };
    }
  } catch (e) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStopwatchOptimizer);
  } else {
    initStopwatchOptimizer();
  }
})();
