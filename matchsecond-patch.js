/* ============================================================================
   ChronoPulse - "AYNI SANİYEYİ TUTTUR" Mod Yaması  (v1.0.0)
   ----------------------------------------------------------------------------
   Ne yapar?
     Mod seçim ekranına 5. bir kart ekler: AYNI SANİYEYİ TUTTUR.
     Akış:
       1) Robot eli butona basar, ekranda süresi GÖRÜNMEYEN bir sayaç başlar.
          Oyuncu geçen süreyi içinden sayar.
       2) Robot rastgele bir anda sayacı durdurur (süre gizli kalır).
       3) Ekranda YENİ ve yine gizli bir sayaç açılır:
          "BOT İLE AYNI SANİYEYİ DURDUR".
       4) Oyuncu az önce saydığı süre kadar bekleyip durdurur.
          Bot da (seçilen zorluğa göre sapmayla) aynı süreyi tutturmaya çalışır.
          Gizli süreye en yakın olan kazanır.
     1v1'de aynı akış iki gerçek oyuncu arasında oynanır; gizli süre iki
     tarafta da aynıdır (eşleşmeyle birlikte gelen guessDurationMs kullanılır).
     TİMİ (AŞIRI ZOR) botu bu modda yenilirse liderlik tablosuna işlenir.

   Ne yapmaz?
     app.js'teki hiçbir mevcut mod, sayaç, zamanlayıcı, saat, liderlik tablosu
     veya MQTT akışı değiştirilmez. Sadece:
       - getModeTitle / launchArenaMatch / openModeSelectionModal fonksiyonları
         "sarmalanır" (kendi modumuz değilse orijinali aynen çağrılır),
       - mod seçim ızgarasına yeni bir buton eklenir,
       - kendi tam ekran arenamız kendi DOM'unda çizilir.
     Bu dosyayı silip index.html'den script satırını kaldırırsanız site
     birebir eski haline döner.
   ========================================================================== */
(function () {
  'use strict';

  var MODE = 'matchsec';
  var OVERLAY_ID = 'msArenaOverlay';

  /* ------------------------------------------------------------------ i18n */
  var L = {
    tr: {
      cardTitle: 'AYNI SANİYEYİ TUTTUR',
      cardSub: '(Kopyala & Tuttur)',
      cardBadge: 'YENİ MOD',
      cardDesc: 'Robot gizli sayacı rastgele bir anda durdurur. Sonra <strong>aynı süreyi</strong> sen tutturmaya çalışırsın!',
      select: 'SEÇ ➔',
      modeTitle: '🎯 AYNI SANİYEYİ TUTTUR',
      hiddenCounter: 'GİZLİ SAYAÇ',
      robotZone: '🤖 ROBOT TETİKLEYİCİ',
      waitingRobot: 'Robot bekleniyor...',
      robotReaching: '🤖 Robot butona uzanıyor...',
      robotPressing: '🎯 Butona basılıyor!',
      robotStarted: '⚡ BAŞLATILDI!',
      counting: '⏳ Sayaç gizlice sayıyor! İçinden dikkatle say...',
      stopped: '🛑 SAYAÇ DURDU! Saydığın süreyi aklında tut.',
      phase2Title: 'BOT İLE AYNI SANİYEYİ DURDUR',
      phase2TitleVs: 'RAKİPLE AYNI SANİYEYİ DURDUR',
      phase2Notice: '⏱️ Yeni sayaç çalışıyor! Az önceki süre kadar bekleyip DURDUR\'a bas.',
      prepTitle: 'HAZIR MISIN?',
      prepNotice: 'Kendiniz başlatın veya',
      prepNoticeSuffix: 'saniye sonra otomatik başlar!',
      prepHint: 'BAŞLAT\'a bastığında gizli sayaç çalışmaya başlar.',
      startBtn: 'BAŞLAT',
      stopBtn: 'DURDUR',
      oppLeft: 'Rakip arenadan ayrıldı. Tur iptal edildi.',
      oppLeftTitle: '🚪 RAKİP AYRILDI',
      startingSoon: 'Hazırlanıyor...',
      you: 'SİZ',
      opponent: 'RAKİP',
      waitOpponent: '✅ Süreniz kaydedildi. Rakip bekleniyor...',
      realTime: '🎯 Gerçek Gizli Süre',
      yourTime: 'SİZİN SÜRENİZ',
      botTime: 'BOT SÜRESİ',
      oppTime: 'RAKİP SÜRESİ',
      diff: 'Fark',
      win: 'KAZANDINIZ!',
      lose: 'KAYBETTİNİZ!',
      draw: '🤝 BERABERE!',
      winDesc: 'Gizli süreye daha yakın durdurdunuz!',
      loseDesc: 'Rakip gizli süreye daha yakın durdurdu.',
      drawDesc: 'İkiniz de gizli süreye tam olarak aynı yakınlıkta durdurdunuz!',
      again: 'TEKRAR OYNA',
      close: 'ÇIKIŞ',
      timeout: '⌛ Süre doldu, otomatik durduruldu.',
      sec: 'sn'
    },
    en: {
      cardTitle: 'MATCH THE SAME SECOND',
      cardSub: '(Copy & Match)',
      cardBadge: 'NEW MODE',
      cardDesc: 'The robot stops a hidden timer at a random moment. Then you must stop at <strong>exactly the same time</strong>!',
      select: 'SELECT ➔',
      modeTitle: '🎯 MATCH THE SAME SECOND',
      hiddenCounter: 'HIDDEN TIMER',
      robotZone: '🤖 ROBOT TRIGGER',
      waitingRobot: 'Waiting for robot...',
      robotReaching: '🤖 Robot is reaching for the button...',
      robotPressing: '🎯 Pressing the button!',
      robotStarted: '⚡ STARTED!',
      counting: '⏳ The hidden timer is running! Count carefully in your head...',
      stopped: '🛑 TIMER STOPPED! Remember the time you counted.',
      phase2Title: 'STOP AT THE SAME SECOND AS THE BOT',
      phase2TitleVs: 'STOP AT THE SAME SECOND AS YOUR RIVAL',
      phase2Notice: '⏱️ A new hidden timer is running! Hit STOP after the same amount of time.',
      prepTitle: 'ARE YOU READY?',
      prepNotice: 'Start it yourself or it auto-starts in',
      prepNoticeSuffix: 'seconds!',
      prepHint: 'The hidden timer starts when you press START.',
      startBtn: 'START',
      stopBtn: 'STOP',
      oppLeft: 'Your opponent left the arena. Round cancelled.',
      oppLeftTitle: '🚪 OPPONENT LEFT',
      startingSoon: 'Getting ready...',
      you: 'YOU',
      opponent: 'RIVAL',
      waitOpponent: '✅ Your time is saved. Waiting for the rival...',
      realTime: '🎯 Real hidden time',
      yourTime: 'YOUR TIME',
      botTime: 'BOT TIME',
      oppTime: 'RIVAL TIME',
      diff: 'Diff',
      win: 'YOU WIN!',
      lose: 'YOU LOSE!',
      draw: '🤝 DRAW!',
      winDesc: 'You stopped closer to the hidden time!',
      loseDesc: 'Your rival stopped closer to the hidden time.',
      drawDesc: 'Both of you were exactly the same distance from the hidden time!',
      again: 'PLAY AGAIN',
      close: 'EXIT',
      timeout: '⌛ Time is up, stopped automatically.',
      sec: 's'
    },
    es: {
      cardTitle: 'ACIERTA EL MISMO SEGUNDO',
      cardSub: '(Copia y acierta)',
      cardBadge: 'NUEVO MODO',
      cardDesc: 'El robot detiene un cronómetro oculto en un momento aleatorio. ¡Luego debes parar en <strong>el mismo tiempo</strong>!',
      select: 'ELEGIR ➔',
      modeTitle: '🎯 ACIERTA EL MISMO SEGUNDO',
      hiddenCounter: 'CRONÓMETRO OCULTO',
      robotZone: '🤖 DISPARADOR ROBOT',
      waitingRobot: 'Esperando al robot...',
      robotReaching: '🤖 El robot se acerca al botón...',
      robotPressing: '🎯 ¡Pulsando el botón!',
      robotStarted: '⚡ ¡INICIADO!',
      counting: '⏳ ¡El cronómetro oculto corre! Cuenta con atención...',
      stopped: '🛑 ¡CRONÓMETRO DETENIDO! Recuerda el tiempo contado.',
      phase2Title: 'DETENTE EN EL MISMO SEGUNDO QUE EL BOT',
      phase2TitleVs: 'DETENTE EN EL MISMO SEGUNDO QUE TU RIVAL',
      phase2Notice: '⏱️ ¡Nuevo cronómetro oculto! Pulsa DETENER tras el mismo tiempo.',
      prepTitle: '¿LISTO?',
      prepNotice: 'Inicia tú mismo o empieza automáticamente en',
      prepNoticeSuffix: 'segundos!',
      prepHint: 'El cronómetro oculto arranca al pulsar INICIAR.',
      startBtn: 'INICIAR',
      stopBtn: 'DETENER',
      oppLeft: 'Tu rival salió del arena. Ronda cancelada.',
      oppLeftTitle: '🚪 EL RIVAL SALIÓ',
      startingSoon: 'Preparando...',
      you: 'TÚ',
      opponent: 'RIVAL',
      waitOpponent: '✅ Tu tiempo se guardó. Esperando al rival...',
      realTime: '🎯 Tiempo oculto real',
      yourTime: 'TU TIEMPO',
      botTime: 'TIEMPO DEL BOT',
      oppTime: 'TIEMPO DEL RIVAL',
      diff: 'Dif.',
      win: '¡GANASTE!',
      lose: '¡PERDISTE!',
      draw: '🤝 ¡EMPATE!',
      winDesc: '¡Paraste más cerca del tiempo oculto!',
      loseDesc: 'Tu rival paró más cerca del tiempo oculto.',
      drawDesc: '¡Ambos quedasteis exactamente a la misma distancia!',
      again: 'JUGAR OTRA VEZ',
      close: 'SALIR',
      timeout: '⌛ Se acabó el tiempo, parada automática.',
      sec: 's'
    }
  };

  function T(key) {
    var lang = 'tr';
    try {
      if (typeof currentLang === 'string' && L[currentLang]) lang = currentLang;
    } catch (e) {}
    return (L[lang] && L[lang][key]) || L.tr[key] || key;
  }

  /* --------------------------------------------------------------- yardımcı */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function beep(freq, type, vol, dur) {
    try {
      if (typeof sounds !== 'undefined' && sounds && typeof sounds.playBeep === 'function') {
        sounds.playBeep(freq, type, vol, dur);
      }
    } catch (e) {}
  }
  function sfx(name) {
    try {
      if (typeof sounds !== 'undefined' && sounds && typeof sounds[name] === 'function') sounds[name]();
    } catch (e) {}
  }
  function confettiBig() {
    try {
      if (typeof triggerMegaConfetti === 'function') triggerMegaConfetti();
    } catch (e) {}
  }
  function icons() {
    try {
      if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    } catch (e) {}
  }
  function rnd() {
    try {
      if (typeof getHighEntropyRandom === 'function') return getHighEntropyRandom();
    } catch (e) {}
    return Math.random();
  }
  function g(name) { /* app.js global değişkenini güvenle oku */
    try { return eval(name); } catch (e) { return undefined; }
  }

  /* santisaniye -> "SS.CC sn" */
  function fmtCentis(c) {
    var s = Math.floor(c / 100), r = c % 100;
    return String(s).padStart(2, '0') + '.' + String(r).padStart(2, '0') + ' ' + T('sec');
  }

  /* --------------------------------------------------- zorluk ayarları */
  /* Bot sapması (santisaniye) - app.js TAHMİN ET modundaki değerlerle aynı */
  var BOT_SPREAD = { easy: 260, medium: 74, hard: 35, timi: 6 };
  /* Gizli sayacın durma aralığı (ms) - zorluk arttıkça daha zor/uzun aralık */
  var DURATION_RANGE = {
    easy: [1500, 4000],
    medium: [2000, 6000],
    hard: [2000, 8500],
    timi: [2000, 9900]
  };

  function difficulty() {
    var d = g('currentBotDifficulty');
    return BOT_SPREAD[d] ? d : 'medium';
  }

  function makeHiddenDuration() {
    var r = DURATION_RANGE[difficulty()] || DURATION_RANGE.medium;
    var ms = Math.floor(rnd() * (r[1] - r[0] + 1)) + r[0];
    return Math.round(ms / 10) * 10;
  }

  function botAttemptCentis(targetCentis) {
    var spread = BOT_SPREAD[difficulty()] || BOT_SPREAD.medium;
    var err = Math.round((rnd() - 0.5) * spread);
    return Math.max(1, targetCentis + err);
  }

  /* ------------------------------------------------- durum (state) */
  var st = null;
  var timers = [];
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() {
    timers.forEach(function (id) { clearTimeout(id); });
    timers = [];
  }

  /* ============================== MOD KARTI ================================ */
  function buildModeCard() {
    if (document.getElementById('selectMatchSecModeBtn')) return;
    var ref = document.getElementById('selectOverstepModeBtn');
    if (!ref || !ref.parentNode) return;

    var btn = document.createElement('button');
    btn.id = 'selectMatchSecModeBtn';
    btn.type = 'button';
    btn.className = 'group/mode p-4 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:border-cyan-400 hover:bg-cyan-500/10 text-left transition-all relative overflow-hidden flex flex-col justify-between';
    btn.innerHTML =
      '<div>' +
        '<div class="flex items-center justify-between mb-2">' +
          '<span class="text-2xl">🎯</span>' +
          '<span class="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" data-ms="badge">' + esc(T('cardBadge')) + '</span>' +
        '</div>' +
        '<h4 class="font-black text-sm text-white group-hover/mode:text-cyan-300" data-ms="title">' + esc(T('cardTitle')) + '<br>' +
          '<span class="text-[11px] text-cyan-400 font-mono" data-ms="sub">' + esc(T('cardSub')) + '</span>' +
        '</h4>' +
        '<p class="text-[10px] text-slate-400 mt-1.5 leading-relaxed" data-ms="desc">' + T('cardDesc') + '</p>' +
      '</div>' +
      '<div class="mt-3 pt-2 border-t border-slate-800 text-center text-[11px] font-bold text-cyan-400 group-hover/mode:underline" data-ms="sel">' + esc(T('select')) + '</div>';

    ref.parentNode.appendChild(btn);

    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      try {
        if (typeof chooseMode === 'function') chooseMode(MODE);
      } catch (e) { return; }
      btn.classList.add('ring-4', 'ring-cyan-400');
      dimOtherCards();
    });
  }

  function otherCards() {
    return ['selectTimiModeBtn', 'selectNormalModeBtn', 'selectGuessModeBtn', 'selectOverstepModeBtn']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
  }
  function dimOtherCards() {
    otherCards().forEach(function (el) { el.classList.add('opacity-50'); });
  }
  function resetModeCard() {
    var btn = document.getElementById('selectMatchSecModeBtn');
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove('ring-4', 'ring-cyan-400', 'opacity-50');
    var q = function (k) { return btn.querySelector('[data-ms="' + k + '"]'); };
    if (q('badge')) q('badge').textContent = T('cardBadge');
    if (q('title')) q('title').innerHTML = esc(T('cardTitle')) + '<br><span class="text-[11px] text-cyan-400 font-mono">' + esc(T('cardSub')) + '</span>';
    if (q('desc')) q('desc').innerHTML = T('cardDesc');
    if (q('sel')) q('sel').textContent = T('select');
  }
  function fadeModeCard() {
    var btn = document.getElementById('selectMatchSecModeBtn');
    if (btn && !btn.classList.contains('ring-4')) btn.classList.add('opacity-50');
    if (btn) btn.disabled = true;
  }

  /* ============================== ARENA DOM ================================ */
  var ROBOT_ARM_SVG =
    '<svg width="70" height="170" viewBox="0 0 80 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]">' +
    '<rect x="24" y="0" width="32" height="70" rx="6" fill="#334155" stroke="#64748b" stroke-width="2"/>' +
    '<rect x="31" y="10" width="18" height="50" rx="3" fill="#0f172a"/>' +
    '<line x1="28" y1="12" x2="28" y2="58" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>' +
    '<line x1="52" y1="12" x2="52" y2="58" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>' +
    '<circle cx="40" cy="78" r="14" fill="#475569" stroke="#94a3b8" stroke-width="2"/>' +
    '<circle cx="40" cy="78" r="6" fill="#0ea5e9"/>' +
    '<path d="M22 88C22 84 26 82 30 82H50C54 82 58 84 58 88V115C58 120 54 124 50 124H30C26 124 22 120 22 115V88Z" fill="#1e293b" stroke="#64748b" stroke-width="2"/>' +
    '<rect x="23" y="112" width="10" height="15" rx="4" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>' +
    '<rect x="47" y="112" width="10" height="15" rx="4" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>' +
    '<rect x="35" y="120" width="10" height="22" rx="4" fill="#64748b" stroke="#cbd5e1" stroke-width="1.5"/>' +
    '<path d="M36 142C36 140 37 138 40 138C43 138 44 140 44 142V162C44 165 42 167 40 167C38 167 36 165 36 162V142Z" fill="#94a3b8" stroke="#f1f5f9" stroke-width="1.5"/>' +
    '<circle cx="40" cy="164" r="3.5" fill="#ef4444"/><circle cx="40" cy="164" r="2" fill="#ffffff"/></svg>';

  function buildOverlay() {
    var old = document.getElementById(OVERLAY_ID);
    if (old) old.remove();

    var ov = document.createElement('div');
    ov.id = OVERLAY_ID;
    ov.className = 'fixed inset-0 z-[70] bg-slate-950/97 backdrop-blur-sm overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-6';
    ov.innerHTML =
      '<div class="w-full max-w-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/10 p-4 sm:p-6 relative">' +

        /* başlık */
        '<div class="flex items-center justify-between gap-2 mb-4 flex-wrap">' +
          '<span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" id="msModeBadge">' + esc(T('modeTitle')) + '</span>' +
          '<span id="msDiffBadge" class="hidden text-xs font-black uppercase px-3 py-1 rounded-lg"></span>' +
          '<button id="msCloseBtn" class="ml-auto w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-black">✕</button>' +
        '</div>' +

        /* oyuncular */
        '<div class="flex items-center justify-center space-x-6 mb-4 text-xs font-mono">' +
          '<span class="flex items-center space-x-1.5 text-brand-400 font-bold"><span class="w-2 h-2 rounded-full bg-brand-500"></span><span id="msP1Name">' + esc(T('you')) + '</span></span>' +
          '<span class="text-slate-600 font-black">VS</span>' +
          '<span class="flex items-center space-x-1.5 text-red-400 font-bold"><span class="w-2 h-2 rounded-full bg-red-500"></span><span id="msP2Name">' + esc(T('opponent')) + '</span></span>' +
        '</div>' +

        /* geri sayım */
        '<div id="msCountdown" class="hidden py-16 text-center">' +
          '<div id="msCountdownNumber" class="text-8xl sm:text-9xl font-black text-cyan-400 animate-bounce">3</div>' +
        '</div>' +

        /* sahne */
        '<div id="msStage" class="hidden flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 w-full">' +
          '<div class="flex-1 w-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">' +
            '<div class="absolute inset-0 bg-cyan-500/5 animate-pulse pointer-events-none"></div>' +
            '<span id="msCounterLabel" class="text-[11px] uppercase font-bold tracking-widest text-cyan-400 block mb-1">' + esc(T('hiddenCounter')) + '</span>' +
            '<div id="msMystery" class="font-mono text-5xl sm:text-6xl font-black text-cyan-300 tracking-tight my-2">??.??.??</div>' +
            '<p id="msNotice" class="text-xs sm:text-sm font-semibold text-slate-300 mt-2 animate-pulse">' + esc(T('startingSoon')) + '</p>' +
          '</div>' +
          '<div id="msRobotZone" class="relative flex flex-col items-center justify-center p-5 bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl min-w-[200px] shadow-2xl overflow-visible">' +
            '<span class="text-[10px] font-black uppercase text-cyan-300 tracking-wider mb-2">' + esc(T('robotZone')) + '</span>' +
            '<div class="relative w-24 h-24 rounded-full bg-slate-950 border-4 border-slate-700/80 flex items-center justify-center shadow-inner mt-2">' +
              '<div id="msRobotBtn" class="w-16 h-16 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 border-2 border-red-400 shadow-[0_6px_0_#7f1d1d,0_10px_20px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center font-black text-[11px] text-white uppercase tracking-wider transition-all duration-150 select-none transform">' +
                '<i data-lucide="power" class="w-4 h-4 mb-0.5"></i><span id="msRobotBtnLabel" class="text-[9px]">START</span>' +
              '</div>' +
            '</div>' +
            '<span id="msRobotStatus" class="text-[10px] text-amber-400 font-bold mt-3 text-center animate-pulse">' + esc(T('waitingRobot')) + '</span>' +
            '<div id="msRobotArm" class="absolute pointer-events-none z-30 flex flex-col items-center" style="top:-240px;left:50%;transform:translateX(-50%);opacity:0;transition:top .4s cubic-bezier(.34,1.56,.64,1),opacity .3s ease">' + ROBOT_ARM_SVG + '</div>' +
          '</div>' +
        '</div>' +

        /* 2. faz hazırlık: kendi başlat veya 10 sn sonra otomatik */
        '<div id="msPrepBox" class="hidden w-full max-w-md mx-auto mt-6">' +
          '<button id="msPrepStartBtn" class="w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl select-none bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110">' +
            '<i data-lucide="play" class="w-6 h-6"></i><span>' + esc(T('startBtn')) + '</span>' +
          '</button>' +
          '<p id="msPrepNotice" class="text-[11px] text-amber-400 font-bold text-center mt-2">' +
            esc(T('prepNotice')) + ' <span id="msPrepTimer" class="font-mono text-amber-300">10</span> ' + esc(T('prepNoticeSuffix')) +
          '</p>' +
          '<p class="text-[10px] text-slate-500 text-center mt-1">' + esc(T('prepHint')) + '</p>' +
        '</div>' +

        /* 2. faz durdurma butonu */
        '<div id="msStopBox" class="hidden w-full max-w-md mx-auto mt-6">' +
          '<button id="msStopBtn" class="w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl select-none bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:brightness-110">' +
            '<i data-lucide="hand" class="w-6 h-6"></i><span>' + esc(T('stopBtn')) + '</span>' +
          '</button>' +
          '<p class="text-[11px] text-slate-400 text-center mt-2">' +
            '<kbd class="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-slate-200">Space</kbd> / ' + esc(T('stopBtn')) +
          '</p>' +
          '<p id="msWaitOpponent" class="hidden mt-3 text-center text-xs font-semibold text-amber-400 animate-pulse">' + esc(T('waitOpponent')) + '</p>' +
        '</div>' +

        /* sonuç */
        '<div id="msResult" class="hidden mt-6 p-5 rounded-3xl border-2 border-slate-700 bg-slate-900/90 text-center">' +
          '<h3 id="msResultTitle" class="text-2xl sm:text-3xl font-black text-white"></h3>' +
          '<p id="msResultDesc" class="text-xs sm:text-sm text-slate-300 mt-2"></p>' +
          '<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-left">' +
            '<div class="p-3 rounded-2xl bg-slate-950 border border-cyan-500/40"><div class="text-[10px] uppercase font-black text-cyan-300" id="msRealLabel"></div><div class="font-mono font-black text-lg text-cyan-200" id="msRealVal"></div></div>' +
            '<div class="p-3 rounded-2xl bg-slate-950 border border-brand-500/40"><div class="text-[10px] uppercase font-black text-brand-300" id="msYouLabel"></div><div class="font-mono font-black text-lg text-white" id="msYouVal"></div><div class="text-[10px] font-mono text-slate-400" id="msYouDiff"></div></div>' +
            '<div class="p-3 rounded-2xl bg-slate-950 border border-red-500/40"><div class="text-[10px] uppercase font-black text-red-300" id="msOppLabel"></div><div class="font-mono font-black text-lg text-white" id="msOppVal"></div><div class="text-[10px] font-mono text-slate-400" id="msOppDiff"></div></div>' +
          '</div>' +
          '<div class="flex items-center justify-center gap-3 mt-5 flex-wrap">' +
            '<button id="msAgainBtn" class="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-sm">' + esc(T('again')) + '</button>' +
            '<button id="msExitBtn" class="px-5 py-3 rounded-xl bg-slate-800 text-slate-200 font-black text-sm border border-slate-700">' + esc(T('close')) + '</button>' +
          '</div>' +
        '</div>' +

      '</div>';

    document.body.appendChild(ov);
    icons();

    ov.querySelector('#msCloseBtn').addEventListener('click', exitArena);
    ov.querySelector('#msExitBtn').addEventListener('click', exitArena);
    ov.querySelector('#msAgainBtn').addEventListener('click', playAgain);
    ov.querySelector('#msStopBtn').addEventListener('click', userStop);
    ov.querySelector('#msPrepStartBtn').addEventListener('click', beginPhase2);
    return ov;
  }

  function $(id) { return document.getElementById(id); }
  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }

  function onKey(e) {
    if (!st) return;
    if (e.code !== 'Space' && e.key !== ' ') return;
    var pb = $('msPrepBox');
    if (pb && !pb.classList.contains('hidden')) {
      e.preventDefault();
      beginPhase2();
      return;
    }
    if (st.phase2Running && !st.myResult) {
      e.preventDefault();
      userStop();
    }
  }

  /* ============================== ARENA AKIŞI ============================== */
  function startArena(match) {
    clearTimers();
    st = match;
    st.myResult = null;
    st.oppResult = null;
    st.phase2Running = false;
    st.finished = false;

    buildOverlay();
    document.addEventListener('keydown', onKey);

    $('msP1Name').textContent = st.p1;
    $('msP2Name').textContent = st.p2;

    var db = $('msDiffBadge');
    if (st.isBot && db) {
      var d = difficulty();
      var map = {
        easy: ['bg-emerald-500/20 text-emerald-300 border border-emerald-500/40', 'BOT: 🟢 KOLAY'],
        medium: ['bg-yellow-500/20 text-yellow-300 border border-yellow-500/40', 'BOT: 🟡 ORTA'],
        hard: ['bg-red-500/20 text-red-300 border border-red-500/40', 'BOT: 🔴 ZOR'],
        timi: ['bg-amber-500/30 text-amber-300 border border-amber-400 animate-pulse', 'BOT: 👑 TİMİ (AŞIRI ZOR)']
      }[d];
      db.className = 'text-xs font-black uppercase px-3 py-1 rounded-lg ' + map[0];
      db.textContent = map[1];
      show(db);
    }

    /* 3-2-1 geri sayım */
    show($('msCountdown'));
    var n = 3;
    $('msCountdownNumber').textContent = n;
    beep(600, 'triangle', 0.15, 0.3);
    var iv = setInterval(function () {
      n--;
      if (n > 0) {
        $('msCountdownNumber').textContent = n;
        beep(600 + (3 - n) * 120, 'triangle', 0.15, 0.3);
      } else if (n === 0) {
        $('msCountdownNumber').textContent = 'GO! ⚡';
        sfx('playStart');
      } else {
        clearInterval(iv);
        hide($('msCountdown'));
        startPhase1();
      }
    }, 800);
    timers.push(iv);
  }

  /* --- FAZ 1: robot eli butona basar, gizli sayaç çalışır --- */
  function startPhase1() {
    var stage = $('msStage');
    if (!stage) return;
    stage.classList.remove('hidden');
    stage.classList.add('flex');
    $('msCounterLabel').textContent = T('hiddenCounter');
    $('msMystery').textContent = '??.??.??';
    $('msNotice').textContent = T('robotReaching');
    robotPress(function () {
      $('msNotice').textContent = T('counting');
      $('msNotice').className = 'text-xs sm:text-sm font-semibold text-cyan-300 mt-2 animate-pulse';
      later(function () { robotStop(); }, st.hiddenMs);
    });
  }

  function robotPress(done) {
    var arm = $('msRobotArm'), btn = $('msRobotBtn'), lab = $('msRobotBtnLabel'), status = $('msRobotStatus');
    if (!arm || !btn) { if (done) done(); return; }
    status.textContent = T('robotReaching');
    status.className = 'text-[10px] text-amber-400 font-bold mt-3 text-center animate-pulse';
    arm.style.opacity = '1';
    arm.style.top = '-50px';
    beep(300, 'triangle', 0.12, 0.25);
    later(function () {
      status.textContent = T('robotPressing');
      status.className = 'text-[10px] text-red-400 font-black mt-3 text-center animate-bounce';
      arm.style.top = '10px';
      later(function () {
        btn.style.transform = 'translateY(6px)';
        btn.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-700 border-2 border-emerald-300 shadow-[0_1px_0_#064e3b,0_0_25px_rgba(16,185,129,0.9)] flex flex-col items-center justify-center font-black text-[11px] text-white uppercase tracking-wider select-none';
        lab.textContent = 'ACTIVE';
        status.textContent = T('robotStarted');
        status.className = 'text-[10px] text-emerald-400 font-black mt-3 text-center';
        beep(880, 'square', 0.08, 0.4);
        sfx('playStart');
        if (done) done();
        later(function () {
          arm.style.top = '-260px';
          arm.style.opacity = '0';
        }, 400);
      }, 450);
    }, 700);
  }

  function robotStop() {
    var btn = $('msRobotBtn'), lab = $('msRobotBtnLabel'), status = $('msRobotStatus');
    sfx('playStop');
    beep(200, 'sawtooth', 0.25, 0.3);
    if (btn) {
      btn.style.transform = 'translateY(0px)';
      btn.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 shadow-inner flex flex-col items-center justify-center font-black text-[11px] text-slate-400 uppercase tracking-wider select-none';
    }
    if (lab) lab.textContent = 'STOP';
    if (status) {
      status.textContent = '🛑';
      status.className = 'text-[10px] text-slate-400 font-bold mt-3 text-center';
    }
    $('msMystery').textContent = 'STOP! 🛑';
    $('msNotice').textContent = T('stopped');
    $('msNotice').className = 'text-xs sm:text-sm font-black text-amber-300 mt-2 animate-bounce';
    later(showPhase2Prep, 1600);
  }

  /* --- FAZ 1.5: diğer modlardaki gibi 10 saniyelik başlatma seçeneği --- */
  function showPhase2Prep() {
    if (!st) return;
    var rz = $('msRobotZone');
    if (rz) rz.classList.add('hidden');

    $('msCounterLabel').textContent = T('prepTitle');
    $('msCounterLabel').className = 'text-[11px] uppercase font-black tracking-widest text-emerald-300 block mb-1';
    $('msMystery').textContent = '??.??.??';
    $('msNotice').textContent = T('prepHint');
    $('msNotice').className = 'text-xs sm:text-sm font-semibold text-slate-300 mt-2';

    show($('msPrepBox'));
    icons();

    st.prepRemaining = 10;
    var tm = $('msPrepTimer');
    if (tm) tm.textContent = st.prepRemaining;
    beep(700, 'square', 0.12, 0.3);

    var iv = setInterval(function () {
      if (!st) { clearInterval(iv); return; }
      st.prepRemaining--;
      if (tm) tm.textContent = Math.max(0, st.prepRemaining);
      if (st.prepRemaining > 0) {
        beep(600 + (10 - st.prepRemaining) * 25, 'square', 0.1, 0.2);
      } else {
        clearInterval(iv);
        beginPhase2();
      }
    }, 1000);
    st.prepInterval = iv;
    timers.push(iv);
  }

  function beginPhase2() {
    if (!st || st.phase2Running || st.myResult) return;
    if (st.prepInterval) { clearInterval(st.prepInterval); st.prepInterval = null; }
    hide($('msPrepBox'));
    startPhase2();
  }

  /* --- FAZ 2: yeni gizli sayaç, oyuncu aynı süreyi tutturmaya çalışır --- */
  function startPhase2() {
    if (!st) return;
    $('msCounterLabel').textContent = st.isBot ? T('phase2Title') : T('phase2TitleVs');
    $('msCounterLabel').className = 'text-[11px] uppercase font-black tracking-widest text-amber-300 block mb-1';
    $('msMystery').textContent = '??.??.??';
    $('msMystery').className = 'font-mono text-5xl sm:text-6xl font-black text-amber-300 tracking-tight my-2 animate-pulse';
    $('msNotice').textContent = T('phase2Notice');
    $('msNotice').className = 'text-xs sm:text-sm font-black text-amber-200 mt-2';

    show($('msStopBox'));
    icons();

    st.phase2Running = true;
    st.phase2Start = performance.now();
    sfx('playStart');

    /* 30 sn sonra otomatik durdur (kilitlenmeyi önler) */
    later(function () {
      if (st && st.phase2Running && !st.myResult) {
        $('msNotice').textContent = T('timeout');
        userStop();
      }
    }, 30000);
  }

  function userStop() {
    if (!st || !st.phase2Running || st.myResult) return;
    var elapsed = performance.now() - st.phase2Start;
    var centis = Math.max(1, Math.round(elapsed / 10));
    st.myResult = { centis: centis, formatted: fmtCentis(centis) };
    st.phase2Running = false;

    var btn = $('msStopBtn');
    if (btn) {
      btn.disabled = true;
      btn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 shadow-xl select-none bg-slate-800 text-slate-500 cursor-not-allowed';
    }
    sfx('playStop');
    beep(420, 'sine', 0.12, 0.2);

    if (st.isBot) {
      st.oppResult = (function () {
        var c = botAttemptCentis(st.targetCentis);
        return { centis: c, formatted: fmtCentis(c) };
      })();
      later(resolve, 900);
    } else {
      show($('msWaitOpponent'));
      try {
        if (typeof broadcast === 'function') {
          broadcast({
            type: 'MATCHSEC_RESULT',
            matchId: st.matchId,
            fromUsername: g('currentUsername') || '',
            fromClientId: g('myClientId') || '',
            result: st.myResult
          });
        }
      } catch (e) {}
      if (st.oppResult) resolve();
    }
  }

  function resolve() {
    if (!st || st.finished || !st.myResult || !st.oppResult) return;
    st.finished = true;
    clearTimers();

    var target = st.targetCentis;
    var myDiff = Math.abs(st.myResult.centis - target);
    var opDiff = Math.abs(st.oppResult.centis - target);

    hide($('msStopBox'));
    show($('msResult'));

    $('msRealLabel').textContent = T('realTime');
    $('msRealVal').textContent = fmtCentis(target);
    $('msYouLabel').textContent = T('yourTime');
    $('msYouVal').textContent = st.myResult.formatted;
    $('msYouDiff').textContent = T('diff') + ': ±' + myDiff + ' cs';
    $('msOppLabel').textContent = st.isBot ? T('botTime') : T('oppTime');
    $('msOppVal').textContent = st.oppResult.formatted;
    $('msOppDiff').textContent = T('diff') + ': ±' + opDiff + ' cs';

    var title = $('msResultTitle'), desc = $('msResultDesc');
    if (myDiff < opDiff) {
      title.textContent = '🏆 ' + T('win');
      title.className = 'text-2xl sm:text-3xl font-black text-yellow-400 drop-shadow-lg';
      desc.textContent = T('winDesc');
      sfx('playMegaVictory');
      confettiBig();
      if (st.isBot && difficulty() === 'timi') {
        recordWin(target, myDiff, opDiff);
      }
    } else if (opDiff < myDiff) {
      title.textContent = '💀 ' + T('lose');
      title.className = 'text-2xl sm:text-3xl font-black text-rose-400 drop-shadow-lg';
      desc.textContent = T('loseDesc');
      beep(160, 'sawtooth', 0.3, 0.2);
    } else {
      title.textContent = T('draw');
      title.className = 'text-2xl sm:text-3xl font-black text-cyan-300 drop-shadow-lg';
      desc.textContent = T('drawDesc');
      sfx('playGood');
    }
    icons();
  }

  /* --------- TİMİ botu yenildiğinde liderlik tablosuna kaydet --------- */
  function recordWin(targetCentis, myDiff, opDiff) {
    var rec = {
      id: 'timi_win_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      username: (g('currentUsername') || 'Şampiyon'),
      mode: MODE,
      modeTitle: 'AYNI SANİYE',
      targetText: T('realTime') + ': ' + fmtCentis(targetCentis),
      userTime: st.myResult.formatted,
      botTime: st.oppResult.formatted,
      userDiff: '±' + myDiff + ' cs',
      botDiff: '±' + opDiff + ' cs',
      timestamp: Date.now()
    };
    var ok = false;
    try {
      if (typeof timiLeaderboardRecords !== 'undefined' && Array.isArray(timiLeaderboardRecords)) {
        timiLeaderboardRecords.unshift(rec);
        if (timiLeaderboardRecords.length > 200) {
          timiLeaderboardRecords = timiLeaderboardRecords.slice(0, 200);
        }
        ok = true;
      }
    } catch (e) {}
    if (!ok) {
      /* güvenli yedek: app.js'in kendi kaydediciyle işle */
      try {
        if (typeof recordTimiDefeat === 'function') {
          recordTimiDefeat(MODE, rec.targetText, rec.userTime, rec.botTime, rec.userDiff, rec.botDiff);
        }
      } catch (e) {}
      return;
    }
    try {
      var key = g('TIMI_LEADERBOARD_STORAGE_KEY');
      if (key) localStorage.setItem(key, JSON.stringify(timiLeaderboardRecords));
    } catch (e) {}
    try { if (typeof renderLeaderboard === 'function') renderLeaderboard(); } catch (e) {}
    try { if (typeof showTimiVictoryToast === 'function') showTimiVictoryToast(rec); } catch (e) {}
    try { if (typeof publishLeaderboardRetained === 'function') publishLeaderboardRetained(); } catch (e) {}
    try {
      if (typeof broadcast === 'function') broadcast({ type: 'TIMI_CHAMPION_RECORD', record: rec });
    } catch (e) {}
  }

  /* ------------------------------ kapat / tekrar ------------------------- */
  /* kullanıcı kendi kapatırsa 1v1 rakibi asılı kalmasın */
  function exitArena() {
    try {
      if (st && !st.isBot && !st.finished && typeof broadcast === 'function') {
        broadcast({
          type: 'MATCHSEC_LEAVE',
          matchId: st.matchId,
          round: st.round || 1,
          fromUsername: g('currentUsername') || '',
          fromClientId: g('myClientId') || ''
        });
      }
    } catch (e) {}
    closeArena();
  }

  function closeArena() {
    clearTimers();
    document.removeEventListener('keydown', onKey);
    var ov = $(OVERLAY_ID);
    if (ov) ov.remove();
    st = null;
    try { isArenaActive = false; } catch (e) {}
    try { if (typeof clearBotTimers === 'function') clearBotTimers(); } catch (e) {}
  }

  function playAgain() {
    if (!st) return;
    if (st.isBot) {
      closeArena();
      try {
        if (typeof openBotMatchSetup === 'function') { openBotMatchSetup(); return; }
      } catch (e) {}
      return;
    }

    /* 1v1: rövanş TEK TARAFLI olamaz. Uygulamanın kendi rövanş akışını
       kullanıyoruz: ARENA_REMATCH yayınlanır ve İKİ oyuncuda da mod seçimi
       yeniden açılır (diğer modlarla birebir aynı davranış). */
    var prev = { matchId: st.matchId, round: st.round || 1, p1: st.p1, p2: st.p2 };
    var hasMatch = false;
    try { hasMatch = !!g('currentMatch'); } catch (e) {}
    var rb = document.getElementById('arenaRematchBtn');
    closeArena();
    if (rb && hasMatch) {
      try { rb.click(); return; } catch (e) {}
    }

    /* yedek yol: uygulamanın butonu yoksa kendi senkron rövanşımız */
    var nextRound = prev.round + 1;
    try {
      if (typeof broadcast === 'function') {
        broadcast({
          type: 'MATCHSEC_REMATCH',
          matchId: prev.matchId,
          round: nextRound,
          fromUsername: g('currentUsername') || '',
          fromClientId: g('myClientId') || ''
        });
      }
    } catch (e) {}
    startRound(prev, nextRound);
  }

  function startRound(prev, round) {
    var hiddenMs = seededDuration(prev.matchId + '_r' + round);
    startArena({
      matchId: prev.matchId,
      p1: prev.p1, p2: prev.p2,
      isBot: false,
      round: round,
      hiddenMs: hiddenMs,
      targetCentis: Math.round(hiddenMs / 10)
    });
  }

  /* 1v1'de iki tarafta aynı süre çıksın diye deterministik üretim */
  function seededDuration(seed) {
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    var span = 8000, min = 2000;
    return min + (h % span) - ((h % span) % 10);
  }

  /* ============================ MESAJ DİNLEME ============================= */
  var seen = Object.create(null);
  function onRealtime(msg) {
    if (!msg) return;
    if (msg.type === 'MATCHSEC_REMATCH') return onRematch(msg);
    if (msg.type === 'MATCHSEC_LEAVE') return onLeave(msg);
    if (msg.type !== 'MATCHSEC_RESULT') return;
    var key = msg.matchId + '|' + msg.fromClientId + '|' + (msg.timestamp || 0);
    if (seen[key]) return;
    seen[key] = true;
    if (!st || st.isBot || msg.matchId !== st.matchId) return;
    try {
      if (msg.fromClientId && msg.fromClientId === g('myClientId')) return;
    } catch (e) {}
    st.oppResult = msg.result;
    if (st.myResult) resolve();
  }

  /* rakip rövanş istedi: bizde de yeni tur başlasın */
  function onRematch(msg) {
    if (!st || st.isBot || !msg.matchId || msg.matchId !== st.matchId) return;
    try { if (msg.fromClientId && msg.fromClientId === g('myClientId')) return; } catch (e) {}
    var round = Number(msg.round) || ((st.round || 1) + 1);
    if ((st.round || 1) >= round) return;
    var prev = { matchId: st.matchId, round: st.round || 1, p1: st.p1, p2: st.p2 };
    startRound(prev, round);
  }

  /* rakip arenadan çıktı: sonsuz bekleme olmasın */
  function onLeave(msg) {
    if (!st || st.isBot || !msg.matchId || msg.matchId !== st.matchId) return;
    try { if (msg.fromClientId && msg.fromClientId === g('myClientId')) return; } catch (e) {}
    if (st.finished) return;
    clearTimers();
    st.finished = true;
    hide($('msPrepBox'));
    hide($('msStopBox'));
    hide($('msWaitOpponent'));
    var n = $('msNotice');
    if (n) {
      n.textContent = T('oppLeft');
      n.className = 'text-xs sm:text-sm font-black text-rose-300 mt-2';
    }
    var m = $('msMystery');
    if (m) m.textContent = '—';
    var res = $('msResult');
    if (res) {
      show(res);
      $('msResultTitle').textContent = T('oppLeftTitle');
      $('msResultTitle').className = 'text-2xl sm:text-3xl font-black text-rose-400 drop-shadow-lg';
      $('msResultDesc').textContent = T('oppLeft');
      var ab = $('msAgainBtn');
      if (ab) ab.classList.add('hidden');
    }
    beep(180, 'sawtooth', 0.25, 0.2);
  }

  function hookTransport() {
    /* MQTT: mevcut istemciye EK bir dinleyici ekle (var olanlara dokunmaz) */
    try {
      var c = g('mqttClient');
      if (c && typeof c.on === 'function' && !c.__msHooked) {
        c.__msHooked = true;
        c.on('message', function (topic, payload) {
          try { onRealtime(JSON.parse(payload.toString())); } catch (e) {}
        });
      }
    } catch (e) {}
    /* Sekmeler arası BroadcastChannel */
    try {
      var vc = g('vsChannel');
      if (vc && vc.name && !window.__msChannel) {
        window.__msChannel = new BroadcastChannel(vc.name);
        window.__msChannel.onmessage = function (ev) { onRealtime(ev.data); };
      }
    } catch (e) {}
  }

  /* ============================ FONKSİYON SARMALARI ======================= */
  function install() {
    buildModeCard();
    hookTransport();
    /* mqttClient bağlantısı geç kurulabilir */
    var tries = 0;
    var iv = setInterval(function () {
      hookTransport();
      if (++tries > 30) clearInterval(iv);
    }, 1000);

    /* mod başlığı */
    if (typeof window.getModeTitle === 'function') {
      var origTitle = window.getModeTitle;
      window.getModeTitle = function (mode) {
        if (mode === MODE) return T('cardTitle');
        return origTitle.apply(this, arguments);
      };
    }

    /* mod seçim modalı her açıldığında kartı sıfırla */
    if (typeof window.openModeSelectionModal === 'function') {
      var origOpen = window.openModeSelectionModal;
      window.openModeSelectionModal = function () {
        /* rövanş/yeni eşleşme mod seçimi açılıyorsa eski arenamız kapansın */
        try { if (st) closeArena(); } catch (e) {}
        var r = origOpen.apply(this, arguments);
        try { buildModeCard(); resetModeCard(); } catch (e) {}
        return r;
      };
    }

    /* iki taraf da seçince diğer kartlar kilitlenir; bizimki de */
    if (typeof window.evaluateModeResolution === 'function') {
      var origEval = window.evaluateModeResolution;
      window.evaluateModeResolution = function () {
        var r = origEval.apply(this, arguments);
        try {
          var mine = g('myModeChoice'), opp = g('opponentModeChoice');
          if (mine && opp) fadeModeCard();
        } catch (e) {}
        return r;
      };
    }

    /* asıl devralma: bizim mod ise kendi arenamız çalışır */
    if (typeof window.launchArenaMatch === 'function') {
      var origLaunch = window.launchArenaMatch;
      window.launchArenaMatch = function (matchId, p1, p2, targetTime, mode, guessDurationMs, overstepTargetMs, p1ClientId, p2ClientId) {
        if (mode !== MODE) return origLaunch.apply(this, arguments);

        var bot = false;
        try { bot = !!g('isBotMatch'); } catch (e) {}
        if (!bot) {
          bot = (p2 && String(p2).indexOf('BOT') > -1) || (p1 && String(p1).indexOf('BOT') > -1);
        }

        var me = p1, rival = p2;
        try {
          if (typeof checkIsMe === 'function' && !checkIsMe(p1) && checkIsMe(p2)) { me = p2; rival = p1; }
        } catch (e) {}
        if (bot) {
          me = (g('currentUsername') || T('you'));
          rival = '🤖 TİMİ BOT';
        }

        var hiddenMs = bot
          ? makeHiddenDuration()
          : (Number(guessDurationMs) > 0 ? Number(guessDurationMs) : seededDuration(String(matchId)));

        try { isArenaActive = true; } catch (e) {}
        try { currentArenaMode = MODE; } catch (e) {}
        try { if (typeof clearBotTimers === 'function') clearBotTimers(); } catch (e) {}
        try {
          currentMatch = {
            matchId: matchId, p1: p1, p1ClientId: p1ClientId,
            p2: p2, p2ClientId: p2ClientId, targetTime: targetTime,
            mode: MODE, p1Result: null, p2Result: null
          };
        } catch (e) {}
        /* mevcut arena modalı açıksa kapat, karışmasın */
        try {
          var vam = document.getElementById('vsArenaModal');
          if (vam) vam.classList.add('hidden');
          var msm = document.getElementById('modeSelectModal');
          if (msm) msm.classList.add('hidden');
        } catch (e) {}

        startArena({
          matchId: matchId,
          p1: me, p2: rival,
          isBot: bot,
          round: 1,
          hiddenMs: hiddenMs,
          targetCentis: Math.round(hiddenMs / 10)
        });
      };
    }

    /* dil değişince kart metinleri güncellensin */
    if (typeof window.applyLanguage === 'function') {
      var origLang = window.applyLanguage;
      window.applyLanguage = function () {
        var r = origLang.apply(this, arguments);
        try { if (!st) resetModeCard(); } catch (e) {}
        return r;
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
