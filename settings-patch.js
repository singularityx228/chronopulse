/* ============================================================================
   TimerX - Grafik & Performans Ayarları Motoru (settings-patch.js v1.0.0)
   ----------------------------------------------------------------------------
   Özellikler:
     - ULTRA DÜŞÜK, DÜŞÜK, NORMAL (Önerilen) ve ULTRA modları
     - Seçilen mod anında DOM'a ve localStorage'a uygulanır
     - Canlı FPS (Kare/Saniye) monitörü
     - Dil desteği (TR / EN / ES)
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'timerx_graphics_preset';
  var VALID_PRESETS = ['ultra-low', 'low', 'normal', 'ultra'];
  var currentPreset = 'normal';

  // 1. Kayıtlı Ayarı Oku ve Anında Uygula
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_PRESETS.indexOf(saved) > -1) {
      currentPreset = saved;
    }
  } catch (e) {}

  function applyPreset(preset, save) {
    if (VALID_PRESETS.indexOf(preset) === -1) preset = 'normal';
    currentPreset = preset;

    // DOM kök etiketine uygula
    document.documentElement.setAttribute('data-graphics', preset);
    if (document.body) {
      document.body.setAttribute('data-graphics', preset);
    }

    if (save) {
      try {
        localStorage.setItem(STORAGE_KEY, preset);
      } catch (e) {}
    }

    // Modal içindeki butonların görsel seçim durumunu güncelle
    updateButtonsUI();
  }

  // Sayfa yüklenmeden önce bile beyaz/flaş efektini önlemek için direkt çalıştır
  applyPreset(currentPreset, false);

  function updateButtonsUI() {
    var btns = document.querySelectorAll('.graphics-preset-btn');
    if (!btns || !btns.length) return;

    btns.forEach(function (btn) {
      var p = btn.getAttribute('data-preset');
      var indicator = btn.querySelector('.select-indicator');

      if (p === currentPreset) {
        btn.classList.add('active', 'border-brand-500', 'ring-2', 'ring-brand-500/40');
        btn.classList.remove('border-slate-700');
        if (indicator) {
          indicator.textContent = '✓ Aktif';
          indicator.className = 'text-[10px] font-bold text-brand-400 select-indicator';
        }
      } else {
        btn.classList.remove('active', 'border-brand-500', 'ring-2', 'ring-brand-500/40');
        btn.classList.add('border-slate-700');
        if (indicator) {
          indicator.textContent = 'Seç';
          indicator.className = 'text-[10px] font-bold text-slate-500 group-hover:text-amber-400 select-indicator';
        }
      }
    });
  }

  // 2. Canlı FPS Ölçer
  var fpsFrames = 0;
  var fpsLastTime = performance.now();
  var currentFps = 60;
  var fpsBadge = null;

  function measureFps(now) {
    fpsFrames++;
    if (now - fpsLastTime >= 1000) {
      currentFps = Math.round((fpsFrames * 1000) / (now - fpsLastTime));
      fpsFrames = 0;
      fpsLastTime = now;
      if (fpsBadge) {
        fpsBadge.textContent = 'FPS: ' + currentFps;
        if (currentFps >= 55) fpsBadge.className = 'font-mono text-emerald-400 font-bold ml-2';
        else if (currentFps >= 30) fpsBadge.className = 'font-mono text-amber-400 font-bold ml-2';
        else fpsBadge.className = 'font-mono text-red-400 font-bold ml-2';
      }
    }
    requestAnimationFrame(measureFps);
  }
  requestAnimationFrame(measureFps);

  // 3. Modal Kontrolleri & Event Dinleyicileri
  function initSettingsUI() {
    var settingsBtn = document.getElementById('settingsBtn');
    var settingsModal = document.getElementById('settingsModal');
    var closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    fpsBadge = document.getElementById('currentFpsBadge');

    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener('click', function () {
        settingsModal.classList.remove('hidden');
        updateButtonsUI();
      });
    }

    if (closeSettingsModalBtn && settingsModal) {
      closeSettingsModalBtn.addEventListener('click', function () {
        settingsModal.classList.add('hidden');
      });
    }

    if (settingsModal) {
      settingsModal.addEventListener('click', function (e) {
        if (e.target === settingsModal) {
          settingsModal.classList.add('hidden');
        }
      });
    }

    // Buton tıklamaları
    var container = document.getElementById('graphicsPresetsContainer');
    if (container) {
      container.addEventListener('click', function (e) {
        var btn = e.target.closest('.graphics-preset-btn');
        if (!btn) return;
        var p = btn.getAttribute('data-preset');
        if (p) {
          applyPreset(p, true);
        }
      });
    }

    updateButtonsUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettingsUI);
  } else {
    initSettingsUI();
  }
})();
