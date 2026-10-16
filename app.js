/**
 * ChronoPulse - Professional Precision Stopwatch, Timer, Live Clock & Global 1v1 VS Arena
 * Worldwide Real-Time Multiplayer Sync via Public Global Cloud Relay + BroadcastChannel
 */

/* ==========================================================================
   0. GÜVENLİK VE KOD KORUMA KATMANI (ANTI-INSPECT & DEVTOOLS BLOCKER)
   ========================================================================== */
(function enforceDomainLock() {
  try {
    const host = window.location.hostname || '';
    const isAllowed = host === 'singularityx228.github.io' || host === 'localhost' || host === '127.0.0.1' || !host || host === '0.0.0.0';
    if (!isAllowed) {
      window.location.replace('https://singularityx228.github.io/chronopulse/');
    }
  } catch (e) {
    window.location.href = 'https://singularityx228.github.io/chronopulse/';
  }
})();

(function initCodeProtection() {
  // 1. Sağ tık (Context Menu) Engelleme
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Kısayol Tuş Kombinasyonlarını Engelleme (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
  document.addEventListener('keydown', (e) => {
    // F12 tuşu
    if (e.keyCode === 123 || e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I (İncele), Ctrl+Shift+J (Konsol), Ctrl+Shift+C (Öğe Seç)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U (Kaynağı Görüntüle), Ctrl+S (Sayfayı Kaydet)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // 3. Konsol Güvenlik Uyarısı
  try {
    const warningTitle = 'font-size: 32px; font-weight: 900; color: #ef4444; text-shadow: 0 0 10px rgba(239,68,68,0.8);';
    const warningBody = 'font-size: 13px; font-weight: bold; color: #cbd5e1;';
    console.log('%c⚠️ DİKKAT!', warningTitle);
    console.log('%cChronoPulse kodları fikri mülkiyet koruması altındadır. Kodların kopyalanması, tersine mühendislik yapılması veya yetkisiz çoğaltılması yasaktır.', warningBody);
  } catch (err) {}
})();

// Initialize Lucide Icons
lucide.createIcons();

/* ==========================================================================
   1.5. I18N — ÇOKLU DİL DESTEĞİ (TR / EN / ES)
   ========================================================================== */
const TRANSLATIONS = {
  tr: {
    // Header
    leaderboardBtn: 'LİDERLİK TABLOSU',
    leaderboardBtnShort: 'LİDERLER',
    headerLiveBadge: '🌍 Canlı Global 1v1',
    headerBotBtn: 'BOTLA YARIŞ',
    headerBotBtnShort: 'BOT',
    headerUsernameDefault: 'Giriş Yap',
    soundToggleTitle: 'Sesi Aç/Kapat',
    fullscreenTitle: 'Tam Ekran',
    // Nav Tabs
    tabStopwatch: 'Kronometre & Hedef',
    tabTimer: 'Zamanlayıcı',
    tabClock: 'Saat Kaç? (TR)',
    // Banner
    bannerDesc: 'ile hemen yarış veya gerçek oyuncularla',
    bannerDesc2: 'at!',
    bannerBotBtn: '🤖 BOTLA YARIŞ',
    bannerVsBtn: '⚔️ 1v1 VS (CANLI OYUNCU)',
    // Stopwatch
    targetPanelTitle: 'Detaylı Hedef Zamanlama',
    targetPanelDesc: 'Örnek: 5.32 Saniye veya 5.32 Saat seçebilirsiniz!',
    targetLabel: 'Hedef:',
    unitSecond: 'Saniye',
    unitMs: 'Milisaniye',
    unitHour: 'Saat',
    activeTargetPrefix: 'Aktif Hedef:',
    keyboardHint: 'Klavye: Space',
    touchHint: 'Dokunmatik: Büyük Buton',
    labelMinute: 'DAKİKA',
    labelSecond: 'SANİYE',
    labelMs: 'MİLİSANİYE',
    btnStart: 'BAŞLA',
    btnStop: 'DURDUR',
    btnSpaceHint: '(veya Space tuşuna bas)',
    lapBtn: 'Tur Ekle',
    resetBtn: 'Sıfırla',
    resultEval: 'Sonuç Değerlendirmesi',
    resTargetLabel: 'Hedef',
    resStoppedLabel: 'Durdurulan',
    resDiffLabel: 'Fark',
    lapHistoryTitle: 'Durdurma & Tur Geçmişi',
    clearHistoryBtn: 'Temizle',
    // Timer
    timerTitle: 'Geri Sayım Zamanlayıcı',
    timerDesc: 'İstediğiniz süreyi girin, bittiğinde alarm çalacaktır.',
    timerReady: 'Hazır',
    timerHourLabel: 'Saat',
    timerMinLabel: 'Dakika',
    timerSecLabel: 'Saniye',
    preset1m: '+1 Dk',
    preset5m: '+5 Dk',
    preset10m: '+10 Dk',
    preset25m: '🍅 25 Dk (Pomodoro)',
    timerStart: 'BAŞLAT',
    timerPause: 'DURAKLAT',
    // Clock
    clockTRLabel: 'Türkiye Standart Saati (TRT • UTC+3)',
    // Login
    loginTitle: 'Oyuncu Adınızı Belirleyin',
    loginDesc: 'Dünyadaki tüm oyuncularla canlı 1v1 VS atabilmek için kullanıcı adı girin.',
    loginUsernameLabel: 'Kullanıcı Adı',
    loginPlaceholder: 'Örn: RefleksKralı',
    loginSubmitBtn: 'GİRİŞ YAP & DÜNYA ARENASINA KATIL',
    // VS Modal
    vsModalTitle: 'Global 1v1 VS Meydan Okuma',
    vsModalDesc: 'Çevrimiçi bir oyuncu arayın ve meydan okuyun!',
    vsSearchPlaceholder: 'Kullanıcı adı ara...',
    vsYouLabel: 'Siz:',
    vsLivePool: 'Global Canlı Havuz',
    // Invite
    inviteIncoming: 'CANLI MEYDAN OKUMA GELDİ!',
    inviteWants: 'SİZİNLE CANLI 1v1 VS ATMAK İSTİYOR!',
    inviteAccept: 'KABUL ET',
    inviteDecline: 'RED ET',
    // Arena / Mode Modal
    arenaTitle: 'GLOBAL 1v1 ARENASI',
    modeModalBadge: '1v1 VS EŞLEŞTİ!',
    modeModalTitle: 'OYUN MODUNU SEÇİN',
    modeModalDesc: 'İki oyuncu da mod seçer. Farklı seçim yapılırsa sistem rastgele birini belirler!',
    modeWaiting: 'Seçiminiz bekleniyor...',
    // Arena buttons
    arenaStart: 'BAŞLAT',
    arenaStop: 'DURDUR',
    arenaRematch: 'Tekrar VS At',
    arenaExit: 'Arenadan Çık',
    // Leaderboard
    leaderboardTitle: 'TİMİ AVCILARI LİDERLİK TABLOSU',
    leaderboardSubtitle: 'Sadece efsanevi TİMİ botunu yenebilen şampiyonlar',
    leaderboardLiveSync: '🔴 Canlı & Küresel Senkronize',
    leaderboardTotalLabel: '⚡ Toplam Zafer:',
    leaderboardFooter: 'TİMİ zorluğunu yendiğiniz an rekorunuz buraya yazılır.',
    leaderboardEmpty: 'Henüz hiç şampiyon yok. İlk sen ol! 👑',
    toastNewChamp: 'YENİ TİMİ ŞAMPİYONU!',
    toastDefeated: 'az önce TİMİ botu yendi!',
    // Mode cards
    diffSelectLabel: 'BOT ZORLUK SEVİYESİNİ SEÇ:',
    diffMediumBadge: 'ORTA SEVİYE',
    diffEasy: 'KOLAY', diffEasyDesc: 'Acemi Bot',
    diffMedium: 'ORTA', diffMediumDesc: 'Standart Bot',
    diffHard: 'ZOR', diffHardDesc: 'Usta Oyuncu',
    diffTimiDesc: 'AŞIRI ZOR 🔥',
    modeDifficultyHard: 'ZOR',
    modeClassicBadge: 'KLASİK',
    modeNewBadge: 'YENİ MOD',
    modeDuelBadge: 'DÜELLO',
    modeSelectBtn: 'SEÇ ➔',
    modeTimiDesc: 'Sayaç çalışırken gizlenir (??.??.??)! Kendin sayıp durdurmalısın.',
    modeNormalDesc: 'Sayaç sayarken saniye görünür. Bakarak tam hedefte durdurabilirsin.',
    modeGuessTitle: 'TAHMİN ET',
    modeGuessDesc: 'Sayaç gizlice başlar ve rastgele bir anda durur! Sayıp tahminini yaz, en yakın olan kazanır.',
    modeOverstepTitle: 'HEDEFİ AŞMA',
    modeOverstepDesc: 'Ortak gizli sayaç sayarken sırayla basarak paslaşın! Belirlenen hedefi ilk aşan ELENİR!',
    // Arena
    arenaRandomTarget: 'Rastgele Hedef:',
    arenaAutoStart: 'Kendiniz başlatın veya saniye sonra otomatik başlar!',
    arenaYourScore: 'Sizin Skorunuz',
    arenaOpponentScore: 'Rakip Skoru',
    arenaReady: 'Hazır',
    arenaWaiting: 'Bekleniyor...',
    arenaWin: '🏆 KAZANDINIZ!',
    arenaLose: '💀 KAYBETTİNİZ!',
    arenaDraw: '🤝 BERABERE!',
    // Guess mode
    guessHiddenTimer: 'ORTAK GİZLİ SAYAÇ',
    guessReady: '⏳ Sayaç başlamaya hazırlanıyor...',
    guessRobotTrigger: '🤖 ROBOT TETİKLEYİCİ',
    guessRobotWaiting: 'Robot bekleniyor...',
    guessStoppedTitle: 'SAYAÇ DURDU! TAHMİNİNİ YAZ',
    guessStoppedDesc: 'Sayaç kaçıncı saniyede durdu? İçinden saydığın süreyi gir:',
    guessSecLabel: 'Saniye',
    guessMsLabel: 'Salise / ms',
    guessSubmitBtn: 'TAHMİNİ GÖNDER 🚀',
    guessWaitingMsg: '✅ Tahmininiz kaydedildi! Rakibin tahmini bekleniyor...',
    // Overstep mode
    overstepTarget: '💣 HEDEF:',
    overstepPassTurn: 'Sırayla Paslaş!',
    overstepEvaluating: '⏳ SONUÇ DEĞERLENDİRİLİYOR...',
    overstepPreparing: 'Hazırlanıyor...',
    overstepAutoPass: 'Sıranız için kalan süre:',
    overstepAutoPassSuffix: 'sn (Yoksa otomatik basılır!)',
    overstepYourTurn: 'BAS!',
    overstepOpponentTurn: 'SIRA RAKİPTE...',
    overstepSpaceHint: '(Sıra sizdeyken Space veya butona basarak paslayın)',
    overstepLiveFollow: 'RAKİBİN BUTONU (CANLI TAKİP ET):',
    overstepLiveLog: '⚡ Canlı Pas Akışı:',
    overstepNoPasses: 'Henüz pas atılmadı...',
    // Prep overlay
    prepAttention: '🚨 DİKKAT! SON HAZIRLIK SAYACI 🚨',
    prepFocus: 'ODAKLAN! GÖZÜNÜ AYIRMA!',
    prepStarting: '⚡ Sayım biter bitmez sayaç DİREKT olarak başlayacaktır!',
  },
  en: {
    // Header
    leaderboardBtn: 'LEADERBOARD',
    leaderboardBtnShort: 'LEADERS',
    headerLiveBadge: '🌍 Live Global 1v1',
    headerBotBtn: 'RACE VS BOT',
    headerBotBtnShort: 'BOT',
    headerUsernameDefault: 'Sign In',
    soundToggleTitle: 'Toggle Sound',
    fullscreenTitle: 'Fullscreen',
    // Nav Tabs
    tabStopwatch: 'Stopwatch & Target',
    tabTimer: 'Countdown Timer',
    tabClock: 'What Time? (TR)',
    // Banner
    bannerDesc: 'race now or challenge real players in a',
    bannerDesc2: 'match!',
    bannerBotBtn: '🤖 RACE VS BOT',
    bannerVsBtn: '⚔️ 1v1 VS (LIVE PLAYER)',
    // Stopwatch
    targetPanelTitle: 'Precision Target Timing',
    targetPanelDesc: 'Example: 5.32 Seconds or 5.32 Hours!',
    targetLabel: 'Target:',
    unitSecond: 'Seconds',
    unitMs: 'Milliseconds',
    unitHour: 'Hours',
    activeTargetPrefix: 'Active Target:',
    keyboardHint: 'Keyboard: Space',
    touchHint: 'Touch: Big Button',
    labelMinute: 'MINUTE',
    labelSecond: 'SECOND',
    labelMs: 'MILLISEC',
    btnStart: 'START',
    btnStop: 'STOP',
    btnSpaceHint: '(or press Space)',
    lapBtn: 'Add Lap',
    resetBtn: 'Reset',
    resultEval: 'Result Evaluation',
    resTargetLabel: 'Target',
    resStoppedLabel: 'Stopped At',
    resDiffLabel: 'Diff',
    lapHistoryTitle: 'Stop & Lap History',
    clearHistoryBtn: 'Clear',
    // Timer
    timerTitle: 'Countdown Timer',
    timerDesc: 'Enter a duration; an alarm will ring when done.',
    timerReady: 'Ready',
    timerHourLabel: 'Hours',
    timerMinLabel: 'Minutes',
    timerSecLabel: 'Seconds',
    preset1m: '+1 Min',
    preset5m: '+5 Min',
    preset10m: '+10 Min',
    preset25m: '🍅 25 Min (Pomodoro)',
    timerStart: 'START',
    timerPause: 'PAUSE',
    // Clock
    clockTRLabel: 'Turkey Standard Time (TRT • UTC+3)',
    // Login
    loginTitle: 'Set Your Player Name',
    loginDesc: 'Enter a username to play live 1v1 VS with players worldwide.',
    loginUsernameLabel: 'Username',
    loginPlaceholder: 'e.g. ReflexKing',
    loginSubmitBtn: 'SIGN IN & JOIN THE WORLD ARENA',
    // VS Modal
    vsModalTitle: 'Global 1v1 VS Challenge',
    vsModalDesc: 'Search for an online player and challenge them!',
    vsSearchPlaceholder: 'Search username...',
    vsYouLabel: 'You:',
    vsLivePool: 'Global Live Pool',
    // Invite
    inviteIncoming: 'LIVE CHALLENGE RECEIVED!',
    inviteWants: 'WANTS TO PLAY LIVE 1v1 VS WITH YOU!',
    inviteAccept: 'ACCEPT',
    inviteDecline: 'DECLINE',
    // Arena / Mode Modal
    arenaTitle: 'GLOBAL 1v1 ARENA',
    modeModalBadge: '1v1 VS MATCHED!',
    modeModalTitle: 'SELECT GAME MODE',
    modeModalDesc: 'Both players choose a mode. If different, the system picks one at random!',
    modeWaiting: 'Waiting for your selection...',
    // Arena buttons
    arenaStart: 'START',
    arenaStop: 'STOP',
    arenaRematch: 'Rematch',
    arenaExit: 'Exit Arena',
    // Leaderboard
    leaderboardTitle: 'TİMİ HUNTERS LEADERBOARD',
    leaderboardSubtitle: 'Only legendary champions who defeated TİMİ bot',
    leaderboardLiveSync: '🔴 Live & Global Sync',
    leaderboardTotalLabel: '⚡ Total Victories:',
    leaderboardFooter: 'Your record is added the moment you beat TİMİ difficulty.',
    leaderboardEmpty: 'No champions yet. Be the first! 👑',
    toastNewChamp: 'NEW TİMİ CHAMPION!',
    toastDefeated: 'just defeated TİMİ bot!',
    // Mode cards
    diffSelectLabel: 'SELECT BOT DIFFICULTY:',
    diffMediumBadge: 'MEDIUM LEVEL',
    diffEasy: 'EASY', diffEasyDesc: 'Beginner Bot',
    diffMedium: 'MEDIUM', diffMediumDesc: 'Standard Bot',
    diffHard: 'HARD', diffHardDesc: 'Expert Player',
    diffTimiDesc: 'EXTREME 🔥',
    modeDifficultyHard: 'HARD',
    modeClassicBadge: 'CLASSIC',
    modeNewBadge: 'NEW MODE',
    modeDuelBadge: 'DUEL',
    modeSelectBtn: 'SELECT ➔',
    modeTimiDesc: 'Timer hides while running (??.??.??)! Count mentally and stop it yourself.',
    modeNormalDesc: 'Timer is visible while running. Watch it and stop exactly at the target.',
    modeGuessTitle: 'GUESS IT',
    modeGuessDesc: 'Timer starts hidden and stops at a random moment! Write your guess — closest wins.',
    modeOverstepTitle: 'DON\'T EXCEED',
    modeOverstepDesc: 'Take turns pressing a shared hidden timer! The first to exceed the target is ELIMINATED!',
    // Arena
    arenaRandomTarget: 'Random Target:',
    arenaAutoStart: 'Start yourself or it auto-starts in seconds!',
    arenaYourScore: 'Your Score',
    arenaOpponentScore: 'Opponent Score',
    arenaReady: 'Ready',
    arenaWaiting: 'Waiting...',
    arenaWin: '🏆 YOU WIN!',
    arenaLose: '💀 YOU LOST!',
    arenaDraw: '🤝 DRAW!',
    // Guess mode
    guessHiddenTimer: 'SHARED HIDDEN TIMER',
    guessReady: '⏳ Timer is about to start...',
    guessRobotTrigger: '🤖 ROBOT TRIGGER',
    guessRobotWaiting: 'Robot waiting...',
    guessStoppedTitle: 'TIMER STOPPED! ENTER YOUR GUESS',
    guessStoppedDesc: 'When did the timer stop? Enter the seconds you counted:',
    guessSecLabel: 'Seconds',
    guessMsLabel: 'Centisec / ms',
    guessSubmitBtn: 'SUBMIT GUESS 🚀',
    guessWaitingMsg: '✅ Guess recorded! Waiting for opponent...',
    // Overstep mode
    overstepTarget: '💣 TARGET:',
    overstepPassTurn: 'Take Turns!',
    overstepEvaluating: '⏳ EVALUATING RESULT...',
    overstepPreparing: 'Preparing...',
    overstepAutoPass: 'Time left for your turn:',
    overstepAutoPassSuffix: 's (Auto-pressed if you don\'t!)',
    overstepYourTurn: 'PRESS!',
    overstepOpponentTurn: 'OPPONENT\'S TURN...',
    overstepSpaceHint: '(Press Space or the button when it\'s your turn)',
    overstepLiveFollow: 'OPPONENT\'S BUTTON (LIVE):',
    overstepLiveLog: '⚡ Live Pass Feed:',
    overstepNoPasses: 'No passes yet...',
    // Prep overlay
    prepAttention: '🚨 ATTENTION! FINAL COUNTDOWN 🚨',
    prepFocus: 'FOCUS! DON\'T LOOK AWAY!',
    prepStarting: '⚡ Timer starts immediately when countdown ends!',
  },
  es: {
    // Header
    leaderboardBtn: 'CLASIFICACIÓN',
    leaderboardBtnShort: 'LÍDERES',
    headerLiveBadge: '🌍 En Vivo Global 1v1',
    headerBotBtn: 'CORRER VS BOT',
    headerBotBtnShort: 'BOT',
    headerUsernameDefault: 'Iniciar Sesión',
    soundToggleTitle: 'Activar/Silenciar Sonido',
    fullscreenTitle: 'Pantalla Completa',
    // Nav Tabs
    tabStopwatch: 'Cronómetro & Objetivo',
    tabTimer: 'Temporizador',
    tabClock: '¿Qué Hora? (TR)',
    // Banner
    bannerDesc: 'corre ahora o desafía jugadores reales en un',
    bannerDesc2: '¡combate!',
    bannerBotBtn: '🤖 CORRER VS BOT',
    bannerVsBtn: '⚔️ 1v1 VS (JUGADOR EN VIVO)',
    // Stopwatch
    targetPanelTitle: 'Temporización de Objetivo',
    targetPanelDesc: 'Ejemplo: 5.32 Segundos o 5.32 Horas.',
    targetLabel: 'Objetivo:',
    unitSecond: 'Segundos',
    unitMs: 'Milisegundos',
    unitHour: 'Horas',
    activeTargetPrefix: 'Objetivo Activo:',
    keyboardHint: 'Teclado: Espacio',
    touchHint: 'Táctil: Botón Grande',
    labelMinute: 'MINUTO',
    labelSecond: 'SEGUNDO',
    labelMs: 'MILISEG',
    btnStart: 'INICIAR',
    btnStop: 'DETENER',
    btnSpaceHint: '(o presiona Espacio)',
    lapBtn: 'Añadir Vuelta',
    resetBtn: 'Reiniciar',
    resultEval: 'Evaluación de Resultado',
    resTargetLabel: 'Objetivo',
    resStoppedLabel: 'Detenido En',
    resDiffLabel: 'Dif',
    lapHistoryTitle: 'Historial de Paradas y Vueltas',
    clearHistoryBtn: 'Limpiar',
    // Timer
    timerTitle: 'Temporizador de Cuenta Regresiva',
    timerDesc: 'Ingresa una duración; sonará una alarma al terminar.',
    timerReady: 'Listo',
    timerHourLabel: 'Horas',
    timerMinLabel: 'Minutos',
    timerSecLabel: 'Segundos',
    preset1m: '+1 Min',
    preset5m: '+5 Min',
    preset10m: '+10 Min',
    preset25m: '🍅 25 Min (Pomodoro)',
    timerStart: 'INICIAR',
    timerPause: 'PAUSAR',
    // Clock
    clockTRLabel: 'Hora Estándar de Turquía (TRT • UTC+3)',
    // Login
    loginTitle: 'Elige Tu Nombre de Jugador',
    loginDesc: 'Ingresa un nombre de usuario para jugar 1v1 VS en vivo con jugadores del mundo.',
    loginUsernameLabel: 'Nombre de Usuario',
    loginPlaceholder: 'ej. ReyReflejo',
    loginSubmitBtn: 'INICIAR SESIÓN & UNIRSE AL ARENA MUNDIAL',
    // VS Modal
    vsModalTitle: 'Desafío Global 1v1 VS',
    vsModalDesc: '¡Busca un jugador en línea y desafíalo!',
    vsSearchPlaceholder: 'Buscar usuario...',
    vsYouLabel: 'Tú:',
    vsLivePool: 'Sala Global en Vivo',
    // Invite
    inviteIncoming: '¡DESAFÍO EN VIVO RECIBIDO!',
    inviteWants: '¡QUIERE JUGAR 1v1 VS EN VIVO CONTIGO!',
    inviteAccept: 'ACEPTAR',
    inviteDecline: 'RECHAZAR',
    // Arena / Mode Modal
    arenaTitle: 'ARENA GLOBAL 1v1',
    modeModalBadge: '¡1v1 VS EMPAREJADO!',
    modeModalTitle: 'SELECCIONA MODO DE JUEGO',
    modeModalDesc: 'Ambos jugadores eligen un modo. ¡Si difieren, el sistema elige uno al azar!',
    modeWaiting: 'Esperando tu selección...',
    // Arena buttons
    arenaStart: 'INICIAR',
    arenaStop: 'DETENER',
    arenaRematch: 'Revancha',
    arenaExit: 'Salir del Arena',
    // Leaderboard
    leaderboardTitle: 'TABLA DE CLASIFICACIÓN TİMİ',
    leaderboardSubtitle: 'Solo los campeones legendarios que derrotaron al bot TİMİ',
    leaderboardLiveSync: '🔴 En Vivo & Sincronización Global',
    leaderboardTotalLabel: '⚡ Total de Victorias:',
    leaderboardFooter: 'Tu récord se añade en cuanto vences la dificultad TİMİ.',
    leaderboardEmpty: 'Aún no hay campeones. ¡Sé el primero! 👑',
    toastNewChamp: '¡NUEVO CAMPEÓN TİMİ!',
    toastDefeated: '¡acaba de derrotar al bot TİMİ!',
    // Mode cards
    diffSelectLabel: 'SELECCIONA DIFICULTAD DEL BOT:',
    diffMediumBadge: 'NIVEL MEDIO',
    diffEasy: 'FÁCIL', diffEasyDesc: 'Bot Principiante',
    diffMedium: 'MEDIO', diffMediumDesc: 'Bot Estándar',
    diffHard: 'DIFÍCIL', diffHardDesc: 'Jugador Experto',
    diffTimiDesc: 'EXTREMO 🔥',
    modeDifficultyHard: 'DIFÍCIL',
    modeClassicBadge: 'CLÁSICO',
    modeNewBadge: 'MODO NUEVO',
    modeDuelBadge: 'DUELO',
    modeSelectBtn: 'ELEGIR ➔',
    modeTimiDesc: 'El temporizador se oculta (??.??.??)! Cuenta mentalmente y detenlo tú.',
    modeNormalDesc: 'El temporizador es visible. Míralo y detente exactamente en el objetivo.',
    modeGuessTitle: 'ADIVINA',
    modeGuessDesc: 'El temporizador empieza oculto y para en un momento aleatorio. ¡El más cercano gana!',
    modeOverstepTitle: 'NO PASES',
    modeOverstepDesc: '¡Presionen turnos un temporizador oculto compartido! El primero en exceder el objetivo es ELIMINADO.',
    // Arena
    arenaRandomTarget: 'Objetivo Aleatorio:',
    arenaAutoStart: '¡Inicia tú mismo o empieza automáticamente!',
    arenaYourScore: 'Tu Puntuación',
    arenaOpponentScore: 'Puntuación Rival',
    arenaReady: 'Listo',
    arenaWaiting: 'Esperando...',
    arenaWin: '🏆 ¡GANASTE!',
    arenaLose: '💀 ¡PERDISTE!',
    arenaDraw: '🤝 ¡EMPATE!',
    // Guess mode
    guessHiddenTimer: 'TEMPORIZADOR OCULTO COMPARTIDO',
    guessReady: '⏳ El temporizador está a punto de empezar...',
    guessRobotTrigger: '🤖 DISPARADOR ROBOT',
    guessRobotWaiting: 'Robot esperando...',
    guessStoppedTitle: '¡TEMPORIZADOR PARADO! INGRESA TU ESTIMACIÓN',
    guessStoppedDesc: '¿Cuándo se detuvo? Ingresa los segundos que contaste:',
    guessSecLabel: 'Segundos',
    guessMsLabel: 'Centiseg / ms',
    guessSubmitBtn: 'ENVIAR ESTIMACIÓN 🚀',
    guessWaitingMsg: '✅ Estimación guardada. Esperando al oponente...',
    // Overstep mode
    overstepTarget: '💣 OBJETIVO:',
    overstepPassTurn: '¡Turno a turno!',
    overstepEvaluating: '⏳ EVALUANDO RESULTADO...',
    overstepPreparing: 'Preparando...',
    overstepAutoPass: 'Tiempo restante:',
    overstepAutoPassSuffix: 's (¡Se presiona automático!)',
    overstepYourTurn: '¡PRESIONA!',
    overstepOpponentTurn: 'TURNO DEL RIVAL...',
    overstepSpaceHint: '(Presiona Espacio o el botón en tu turno)',
    overstepLiveFollow: 'BOTÓN DEL RIVAL (EN VIVO):',
    overstepLiveLog: '⚡ Feed de Pases En Vivo:',
    overstepNoPasses: 'Sin pases aún...',
    // Prep overlay
    prepAttention: '🚨 ¡ATENCIÓN! CUENTA ATRÁS FINAL 🚨',
    prepFocus: '¡CONCÉNTRATE! ¡NO APARTES LA VISTA!',
    prepStarting: '⚡ ¡El temporizador arranca al terminar la cuenta!',
  }
};

let currentLang = localStorage.getItem('cp_lang') || 'tr';

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS['tr'][key] || key;
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('cp_lang', lang);

  // Update lang selector button
  const flags = { tr: '🇹🇷', en: '🇬🇧', es: '🇪🇸' };
  const labels = { tr: 'TR', en: 'EN', es: 'ES' };
  const flagEl = document.getElementById('langCurrentFlag');
  const labelEl = document.getElementById('langCurrentLabel');
  if (flagEl) flagEl.textContent = flags[lang] || '🇹🇷';
  if (labelEl) labelEl.textContent = labels[lang] || 'TR';

  // Apply data-i18n text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.textContent = val;
  });

  // Apply data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.placeholder = val;
  });

  // Apply data-i18n-title (tooltip attributes)
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = t(key);
    if (val) el.title = val;
  });

  // Dynamic elements updated by JS (keep in sync)
  const headerUsername = document.getElementById('headerUsername');
  if (headerUsername && !headerUsername.dataset.loggedIn) {
    headerUsername.textContent = t('headerUsernameDefault');
  }

  // Leaderboard modal texts
  const lbTitle = document.querySelector('#leaderboardModal h2 span');
  if (lbTitle) lbTitle.textContent = t('leaderboardTitle');
  const lbSubtitle = document.querySelector('#leaderboardModal .text-amber-400\\/80');
  if (lbSubtitle) lbSubtitle.innerHTML = `Sadece efsanevi <span class="font-bold text-amber-300 underline">TİMİ</span> ${lang === 'tr' ? 'botunu yenebilen şampiyonlar' : lang === 'en' ? 'bot champions' : 'campeones del bot TİMİ'}`;
  const lbSync = document.querySelector('#leaderboardModal .text-\\[11px\\].text-slate-400');
  if (lbSync) lbSync.textContent = t('leaderboardLiveSync');
  const lbFooter = document.querySelector('#leaderboardModal .p-4.border-t span');
  if (lbFooter) lbFooter.textContent = t('leaderboardFooter');
  const lbTotal = document.querySelector('#leaderboardModal .font-bold.text-amber-300');
  if (lbTotal) lbTotal.textContent = t('leaderboardTotalLabel');

  // Arena rematch/exit buttons
  const arenaRematch = document.getElementById('arenaRematchBtn');
  if (arenaRematch) arenaRematch.textContent = t('arenaRematch');
  const arenaExit = document.getElementById('arenaExitBtn');
  if (arenaExit) arenaExit.textContent = t('arenaExit');

  // Arena title
  const arenaH3 = document.querySelector('#vsArenaModal h3.font-black');
  if (arenaH3) arenaH3.textContent = t('arenaTitle');

  // Mode modal badge/title/desc
  const modeModalBadge = document.getElementById('modeModalBadge');
  if (modeModalBadge) modeModalBadge.textContent = t('modeModalBadge');
  const modeModalTitle = document.getElementById('modeModalTitle');
  if (modeModalTitle) modeModalTitle.textContent = t('modeModalTitle');
  const modeModalDesc = document.getElementById('modeModalDesc');
  if (modeModalDesc) modeModalDesc.textContent = t('modeModalDesc');

  // Re-render leaderboard to pick up translated empty state
  if (typeof renderLeaderboard === 'function') renderLeaderboard();
}

// Language dropdown toggle
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(currentLang);
});

// Also apply immediately in case DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  setTimeout(() => applyLanguage(currentLang), 0);
}

// Lang toggle button
const langToggleBtn = document.getElementById('langToggleBtn');
const langDropdown = document.getElementById('langDropdown');
if (langToggleBtn && langDropdown) {
  langToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('hidden');
  });
  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lang = btn.getAttribute('data-lang');
      applyLanguage(lang);
      langDropdown.classList.add('hidden');
    });
  });
  document.addEventListener('click', () => langDropdown.classList.add('hidden'));
}

/* ==========================================================================
   1. SOUND ENGINE (Web Audio API)
   ========================================================================== */
class SoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playStart() {
    this.playBeep(587.33, 'sine', 0.1, 0.2);
    setTimeout(() => this.playBeep(880, 'triangle', 0.15, 0.2), 60);
  }

  playStop() {
    this.playBeep(440, 'sine', 0.1, 0.2);
  }

  playMegaVictory() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 'triangle', 0.35, 0.3);
      }, idx * 100);
    });
  }

  playVictory() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 'triangle', 0.25, 0.25);
      }, idx * 100);
    });
  }

  playGood() {
    if (!this.enabled) return;
    const notes = [440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 'sine', 0.2, 0.2);
      }, idx * 80);
    });
  }

  playTimerAlarm() {
    if (!this.enabled) return;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playBeep(987.77, 'square', 0.12, 0.2);
        setTimeout(() => this.playBeep(1318.51, 'square', 0.18, 0.2), 120);
      }, i * 350);
    }
  }

  playChallengeInvite() {
    if (!this.enabled) return;
    this.playBeep(523.25, 'triangle', 0.15, 0.3);
    setTimeout(() => this.playBeep(659.25, 'triangle', 0.15, 0.3), 120);
    setTimeout(() => this.playBeep(783.99, 'triangle', 0.25, 0.35), 240);
  }
}

const sounds = new SoundEngine();

const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
soundToggleBtn.addEventListener('click', () => {
  sounds.enabled = !sounds.enabled;
  if (sounds.enabled) {
    soundIcon.setAttribute('data-lucide', 'volume-2');
    soundToggleBtn.classList.remove('opacity-50');
  } else {
    soundIcon.setAttribute('data-lucide', 'volume-x');
    soundToggleBtn.classList.add('opacity-50');
  }
  lucide.createIcons();
});

const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
}

/* ==========================================================================
   2. TAB NAVIGATION
   ========================================================================== */
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    navTabs.forEach(t => {
      t.classList.remove('active', 'text-slate-100');
      t.classList.add('text-slate-400');
    });
    tabContents.forEach(c => c.classList.add('hidden'));

    tab.classList.add('active', 'text-slate-100');
    tab.classList.remove('text-slate-400');
    const targetId = tab.getAttribute('data-target');
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.classList.remove('hidden');
    }
    sounds.playBeep(400, 'sine', 0.05, 0.05);
  });
});

/* ==========================================================================
   3. KRONOMETRE & HEDEF MODU (STRICT 2-DIGIT 00.00.00 ENGINE)
   ========================================================================== */
let swIsRunning = false;
let swStartTime = 0;
let swElapsedTime = 0;
let swRafId = null;
let historyLaps = [];

const swPart1 = document.getElementById('swPart1');
const swPart2 = document.getElementById('swPart2');
const swPart3 = document.getElementById('swPart3');

const mainActionBtn = document.getElementById('mainActionBtn');
const btnIcon = document.getElementById('btnIcon');
const btnText = document.getElementById('btnText');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');

const targetMainValue = document.getElementById('targetMainValue');
const targetDotSeparator = document.getElementById('targetDotSeparator');
const targetSubValue = document.getElementById('targetSubValue');
const unitBtns = document.querySelectorAll('.unit-btn');
const activeTargetLabel = document.getElementById('activeTargetLabel');
const chronoGlow = document.getElementById('chronoGlow');

const resultCard = document.getElementById('resultCard');
const resultTitle = document.getElementById('resultTitle');
const resultDesc = document.getElementById('resultDesc');
const resultBadgeIcon = document.getElementById('resultBadgeIcon');
const rankBadge = document.getElementById('rankBadge');
const resTarget = document.getElementById('resTarget');
const resActual = document.getElementById('resActual');
const resDiff = document.getElementById('resDiff');

const lapsContainer = document.getElementById('lapsContainer');
const lapsList = document.getElementById('lapsList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

let currentUnit = 'second';

function updateTargetLabel() {
  const mainVal = Math.max(0, parseInt(targetMainValue.value) || 0);
  const subVal = Math.max(0, parseInt(targetSubValue.value) || 0);
  
  targetMainValue.value = mainVal;
  targetSubValue.value = String(subVal).padStart(2, '0');

  let formattedTarget = '';

  if (currentUnit === 'second') {
    targetDotSeparator.classList.remove('hidden');
    targetSubValue.classList.remove('hidden');
    targetSubValue.max = '99';
    targetSubValue.placeholder = 'ms';

    const m = String(Math.floor(mainVal / 60)).padStart(2, '0');
    const s = String(mainVal % 60).padStart(2, '0');
    const ms = String(subVal % 100).padStart(2, '0');
    formattedTarget = `${m}.${s}.${ms} (${mainVal}.${ms} Saniye)`;

  } else if (currentUnit === 'millisecond') {
    targetDotSeparator.classList.add('hidden');
    targetSubValue.classList.add('hidden');

    const s = String(Math.floor(mainVal / 100)).padStart(2, '0');
    const ms = String(mainVal % 100).padStart(2, '0');
    formattedTarget = `00.${s}.${ms} (${mainVal} Milisaniye)`;

  } else if (currentUnit === 'hour') {
    targetDotSeparator.classList.remove('hidden');
    targetSubValue.classList.remove('hidden');
    targetSubValue.max = '59';
    targetSubValue.placeholder = 'dk';

    const h = String(mainVal).padStart(2, '0');
    const m = String(subVal % 60).padStart(2, '0');
    formattedTarget = `${h}.${m}.00 (${mainVal}.${m} Saat)`;
  }

  activeTargetLabel.textContent = formattedTarget;
}

unitBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    unitBtns.forEach(b => {
      b.classList.remove('active', 'bg-brand-500', 'text-slate-950');
      b.classList.add('text-slate-400');
    });
    btn.classList.add('active', 'bg-brand-500', 'text-slate-950');
    btn.classList.remove('text-slate-400');
    currentUnit = btn.getAttribute('data-unit');
    updateTargetLabel();
    sounds.playBeep(500, 'sine', 0.04, 0.1);
  });
});

targetMainValue.addEventListener('input', updateTargetLabel);
targetSubValue.addEventListener('input', updateTargetLabel);

function get2DigitTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;
  const ms2 = Math.floor((ms % 1000) / 10);

  return {
    m: minutes,
    s: seconds,
    ms2: ms2,
    strM: String(minutes).padStart(2, '0'),
    strS: String(seconds).padStart(2, '0'),
    strMs: String(ms2).padStart(2, '0'),
    formatted: `${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}.${String(ms2).padStart(2, '0')}`
  };
}

function renderStopwatch(timeMs) {
  const { strM, strS, strMs } = get2DigitTime(timeMs);
  swPart1.textContent = strM;
  swPart2.textContent = strS;
  swPart3.textContent = strMs;
}

function updateStopwatch() {
  swElapsedTime = performance.now() - swStartTime;
  renderStopwatch(swElapsedTime);
  swRafId = requestAnimationFrame(updateStopwatch);
}

function startStopwatch() {
  if (swIsRunning) return;
  sounds.init();
  sounds.playStart();

  swIsRunning = true;
  swStartTime = performance.now() - swElapsedTime;
  swRafId = requestAnimationFrame(updateStopwatch);

  mainActionBtn.classList.add('running');
  btnText.textContent = 'DURDUR';
  btnIcon.setAttribute('data-lucide', 'square');
  lapBtn.disabled = false;
  chronoGlow.classList.remove('bg-brand-500/5');
  chronoGlow.classList.add('bg-red-500/15');

  resultCard.classList.add('hidden');
  lucide.createIcons();
}

function evaluateResult(elapsedMs) {
  const mainVal = Math.max(0, parseInt(targetMainValue.value) || 0);
  const subVal = Math.max(0, parseInt(targetSubValue.value) || 0);
  const { m, s, ms2, formatted } = get2DigitTime(elapsedMs);

  let targetFormatted = '';
  let actualFormatted = formatted;
  let diff = 0;
  let unitSuffix = 'ms';
  let diffText = '';
  let rank = '';
  let title = '';
  let desc = '';
  let badgeClass = '';
  let borderClass = '';
  let icon = '';

  if (currentUnit === 'second') {
    const actualUnits = (m * 60 + s) * 100 + ms2;
    const targetUnits = mainVal * 100 + (subVal % 100);
    const rawDiff = actualUnits - targetUnits;
    diff = Math.abs(rawDiff);
    unitSuffix = 'ms';

    const tm = String(Math.floor(mainVal / 60)).padStart(2, '0');
    const ts = String(mainVal % 60).padStart(2, '0');
    const tms = String(subVal % 100).padStart(2, '0');
    targetFormatted = `${tm}.${ts}.${tms}`;

    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} ms`;

  } else if (currentUnit === 'millisecond') {
    const actualUnits = (m * 60 + s) * 100 + ms2;
    const targetUnits = mainVal;
    const rawDiff = actualUnits - targetUnits;
    diff = Math.abs(rawDiff);
    unitSuffix = 'ms';

    const ts = String(Math.floor(mainVal / 100)).padStart(2, '0');
    const tms = String(mainVal % 100).padStart(2, '0');
    targetFormatted = `00.${ts}.${tms}`;

    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} ms`;

  } else if (currentUnit === 'hour') {
    const actualSeconds = m * 60 + s;
    const targetSeconds = mainVal * 3600 + (subVal % 60) * 60;
    const rawDiff = actualSeconds - targetSeconds;
    diff = Math.abs(rawDiff);
    unitSuffix = 'sn';

    const th = String(mainVal).padStart(2, '0');
    const tm = String(subVal % 60).padStart(2, '0');
    targetFormatted = `${th}.${tm}.00`;

    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} sn`;
  }

  if (diff === 0) {
    rank = 'EFSANEVİ (0 FARK)';
    title = 'BETTER THAN TİMİ??';
    desc = `👑 İNANILMAZ REKOR! Tam 0 ${unitSuffix} farkla durdurdun! Resmi olarak TİMİ'den daha iyisin!`;
    badgeClass = 'badge-better';
    borderClass = 'border-better';
    icon = '🏆';
    sounds.playMegaVictory();
    triggerMegaConfetti();
  } else if (diff >= 1 && diff <= 4) {
    rank = 'MÜKEMMEL';
    title = 'TİMİ';
    desc = `👑 Kusursuz zamanlama! Fark sadece ${diff} ${unitSuffix}. Sen bir TİMİ'sin!`;
    badgeClass = 'badge-timi';
    borderClass = 'border-timi';
    icon = '👑';
    sounds.playVictory();
    triggerConfetti();
  } else if (diff >= 5 && diff <= 10) {
    rank = 'HARİKA';
    title = 'REALLY GOOD';
    desc = `⚡ Çok iyi refleks! Fark sadece ${diff} ${unitSuffix}.`;
    badgeClass = 'badge-good';
    borderClass = 'border-good';
    icon = '⚡';
    sounds.playGood();
  } else if (diff >= 11 && diff <= 15) {
    rank = 'ORTA';
    title = 'NORMAL';
    desc = `🎯 Fena değil! ${diff} ${unitSuffix} fark ile ortalama bir skor.`;
    badgeClass = 'badge-normal';
    borderClass = 'border-normal';
    icon = '🎯';
    sounds.playBeep(440, 'sine', 0.15, 0.15);
  } else {
    rank = 'GELİŞTİRİLEBİLİR';
    title = 'THİS REALLY BAD';
    desc = `⚠️ Hedefin ${diff} ${unitSuffix} uzağındasın. TİMİ'yi geçmek için tekrar dene!`;
    badgeClass = 'badge-bad';
    borderClass = 'border-bad';
    icon = '⚠️';
    sounds.playBeep(220, 'sawtooth', 0.25, 0.2);
  }

  resultTitle.textContent = title;
  resultDesc.textContent = desc;
  rankBadge.textContent = rank;
  resultBadgeIcon.textContent = icon;
  resTarget.textContent = targetFormatted;
  resActual.textContent = actualFormatted;
  resDiff.textContent = diffText;

  resultCard.className = `bg-cyber-card/95 border-2 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all animate-bounceIn relative overflow-hidden ${borderClass}`;
  rankBadge.className = `text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeClass}`;

  resultCard.classList.remove('hidden');

  addHistoryItem(title, targetFormatted, actualFormatted, diffText, badgeClass);
}

function stopStopwatch() {
  if (!swIsRunning) return;
  cancelAnimationFrame(swRafId);
  swIsRunning = false;
  sounds.playStop();

  const finalElapsed = performance.now() - swStartTime;
  swElapsedTime = finalElapsed;
  renderStopwatch(finalElapsed);

  mainActionBtn.classList.remove('running');
  btnText.textContent = 'BAŞLA';
  btnIcon.setAttribute('data-lucide', 'play');
  lapBtn.disabled = true;
  chronoGlow.classList.remove('bg-red-500/15');
  chronoGlow.classList.add('bg-brand-500/5');
  lucide.createIcons();

  evaluateResult(finalElapsed);
}

function resetStopwatch() {
  cancelAnimationFrame(swRafId);
  swIsRunning = false;
  swStartTime = 0;
  swElapsedTime = 0;

  renderStopwatch(0);

  mainActionBtn.classList.remove('running');
  btnText.textContent = 'BAŞLA';
  btnIcon.setAttribute('data-lucide', 'play');
  lapBtn.disabled = true;
  chronoGlow.className = 'absolute w-72 h-72 rounded-full bg-brand-500/5 blur-3xl pointer-events-none transition-all duration-700';

  resultCard.classList.add('hidden');
  lucide.createIcons();
  sounds.playBeep(330, 'sine', 0.08, 0.1);
}

function addHistoryItem(title, target, actual, diff, badgeClass) {
  lapsContainer.classList.remove('hidden');
  const record = {
    id: Date.now(),
    index: historyLaps.length + 1,
    title,
    target,
    actual,
    diff,
    badgeClass
  };
  historyLaps.unshift(record);

  const item = document.createElement('div');
  item.className = 'flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm animate-fadeIn';
  item.innerHTML = `
    <div class="flex items-center space-x-3">
      <span class="font-mono text-slate-500 font-bold">#${record.index}</span>
      <span class="font-bold px-2 py-0.5 rounded border text-[10px] ${badgeClass}">${title}</span>
      <span class="text-slate-300">Hedef: <strong class="font-mono text-white">${target}</strong></span>
    </div>
    <div class="flex items-center space-x-4">
      <span class="text-slate-400">Durdurulan: <span class="font-mono text-white font-semibold">${actual}</span></span>
      <span class="font-mono font-bold text-brand-glow">${diff}</span>
    </div>
  `;
  lapsList.prepend(item);
}

lapBtn.addEventListener('click', () => {
  if (!swIsRunning) return;
  const current = performance.now() - swStartTime;
  const formatted = get2DigitTime(current).formatted;
  
  lapsContainer.classList.remove('hidden');
  const item = document.createElement('div');
  item.className = 'flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm animate-fadeIn';
  item.innerHTML = `
    <div class="flex items-center space-x-3">
      <span class="font-mono text-brand-400 font-bold">TUR ${lapsList.children.length + 1}</span>
    </div>
    <div class="font-mono font-bold text-white text-sm">
      ${formatted}
    </div>
  `;
  lapsList.prepend(item);
  sounds.playBeep(600, 'sine', 0.05, 0.1);
});

clearHistoryBtn.addEventListener('click', () => {
  historyLaps = [];
  lapsList.innerHTML = '';
  lapsContainer.classList.add('hidden');
});

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }
}

function triggerMegaConfetti() {
  if (typeof confetti === 'function') {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };
    function fire(particleRatio, opts) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }
}

mainActionBtn.addEventListener('click', () => {
  if (!swIsRunning) {
    startStopwatch();
  } else {
    stopStopwatch();
  }
});

resetBtn.addEventListener('click', resetStopwatch);

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }
    e.preventDefault();
    
    if (isArenaActive) {
      if (currentArenaMode === 'overstep') {
        handleOverstepAction();
        return;
      }
      handleArenaAction();
      return;
    }

    const stopwatchTab = document.getElementById('tab-stopwatch');
    if (!stopwatchTab.classList.contains('hidden')) {
      if (!swIsRunning) {
        startStopwatch();
      } else {
        stopStopwatch();
      }
    }
  }
});


/* ==========================================================================
   4. ZAMANLAYICI & CANLI TÜRKİYE SAATİ
   ========================================================================== */
let timerTotalSeconds = 300;
let timerRemainingSeconds = 300;
let timerInterval = null;
let timerIsRunning = false;

const timerDigits = document.getElementById('timerDigits');
const timerStatusLabel = document.getElementById('timerStatusLabel');
const timerProgressRing = document.getElementById('timerProgressRing');
const timerToggleBtn = document.getElementById('timerToggleBtn');
const timerPlayIcon = document.getElementById('timerPlayIcon');
const timerBtnText = document.getElementById('timerBtnText');
const timerResetBtn = document.getElementById('timerResetBtn');

const timerHoursInput = document.getElementById('timerHoursInput');
const timerMinsInput = document.getElementById('timerMinsInput');
const timerSecsInput = document.getElementById('timerSecsInput');
const presetBtns = document.querySelectorAll('.timer-preset-btn');

const ringCircumference = 2 * Math.PI * 115;
timerProgressRing.style.strokeDasharray = `${ringCircumference} ${ringCircumference}`;
timerProgressRing.style.strokeDashoffset = '0';

function updateTimerDisplay() {
  const h = Math.floor(timerRemainingSeconds / 3600);
  const m = Math.floor((timerRemainingSeconds % 3600) / 60);
  const s = timerRemainingSeconds % 60;
  timerDigits.textContent = `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}.${String(s).padStart(2, '0')}`;

  if (timerTotalSeconds > 0) {
    const progress = (timerTotalSeconds - timerRemainingSeconds) / timerTotalSeconds;
    const offset = ringCircumference * progress;
    timerProgressRing.style.strokeDashoffset = offset;
  } else {
    timerProgressRing.style.strokeDashoffset = '0';
  }
}

function getTimerInputSeconds() {
  const h = parseInt(timerHoursInput.value) || 0;
  const m = parseInt(timerMinsInput.value) || 0;
  const s = parseInt(timerSecsInput.value) || 0;
  return (h * 3600) + (m * 60) + s;
}

function setTimerFromInputs() {
  const total = getTimerInputSeconds();
  timerTotalSeconds = total > 0 ? total : 300;
  timerRemainingSeconds = timerTotalSeconds;
  updateTimerDisplay();
}

[timerHoursInput, timerMinsInput, timerSecsInput].forEach(inp => {
  inp.addEventListener('input', () => {
    if (!timerIsRunning) setTimerFromInputs();
  });
});

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (timerIsRunning) return;
    const mins = parseInt(btn.getAttribute('data-mins')) || 5;
    timerHoursInput.value = 0;
    timerMinsInput.value = mins;
    timerSecsInput.value = 0;
    setTimerFromInputs();
    sounds.playBeep(480, 'sine', 0.05, 0.1);
  });
});

function startTimer() {
  if (timerRemainingSeconds <= 0) setTimerFromInputs();
  if (timerRemainingSeconds <= 0) return;

  sounds.init();
  sounds.playStart();
  timerIsRunning = true;

  timerBtnText.textContent = 'DURAKLAT';
  timerPlayIcon.setAttribute('data-lucide', 'pause');
  timerStatusLabel.textContent = 'SAYIYOR...';
  timerStatusLabel.className = 'text-xs font-semibold text-cyber-neonBlue mt-2 uppercase tracking-widest animate-pulse';

  timerInterval = setInterval(() => {
    timerRemainingSeconds--;
    updateTimerDisplay();

    if (timerRemainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerIsRunning = false;
      timerStatusLabel.textContent = 'SÜRE DOLDU!';
      timerStatusLabel.className = 'text-xs font-bold text-red-400 mt-2 uppercase tracking-widest animate-bounce';
      timerBtnText.textContent = 'BAŞLAT';
      timerPlayIcon.setAttribute('data-lucide', 'play');
      sounds.playTimerAlarm();
      triggerConfetti();
      lucide.createIcons();
    }
  }, 1000);

  lucide.createIcons();
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerIsRunning = false;
  timerBtnText.textContent = 'DEVAM ET';
  timerPlayIcon.setAttribute('data-lucide', 'play');
  timerStatusLabel.textContent = 'DURAKLATILDI';
  timerStatusLabel.className = 'text-xs font-semibold text-amber-400 mt-2 uppercase tracking-widest';
  lucide.createIcons();
}

function resetTimer() {
  clearInterval(timerInterval);
  timerIsRunning = false;
  setTimerFromInputs();
  timerBtnText.textContent = 'BAŞLAT';
  timerPlayIcon.setAttribute('data-lucide', 'play');
  timerStatusLabel.textContent = 'HAZIR';
  timerStatusLabel.className = 'text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest';
  lucide.createIcons();
  sounds.playBeep(330, 'sine', 0.08, 0.1);
}

timerToggleBtn.addEventListener('click', () => {
  if (!timerIsRunning) startTimer();
  else pauseTimer();
});
timerResetBtn.addEventListener('click', resetTimer);
setTimerFromInputs();

// Live Turkey Clock
const clockHours = document.getElementById('clockHours');
const clockMinutes = document.getElementById('clockMinutes');
const clockSeconds = document.getElementById('clockSeconds');
const clockDate = document.getElementById('clockDate');
const clockWeekDay = document.getElementById('clockWeekDay');
const analogHour = document.getElementById('analogHour');
const analogMin = document.getElementById('analogMin');
const analogSec = document.getElementById('analogSec');

function updateTurkeyClock() {
  const now = new Date();
  const trOptions = { timeZone: 'Europe/Istanbul', hour12: false };
  const formatterTime = new Intl.DateTimeFormat('tr-TR', {
    ...trOptions,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatterTime.formatToParts(now);
  let h = '00', m = '00', s = '00';
  parts.forEach(p => {
    if (p.type === 'hour') h = p.value;
    if (p.type === 'minute') m = p.value;
    if (p.type === 'second') s = p.value;
  });

  clockHours.textContent = h;
  clockMinutes.textContent = m;
  clockSeconds.textContent = s;

  const formatterDate = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long', year: 'numeric' });
  clockDate.textContent = formatterDate.format(now);
  const formatterDay = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', weekday: 'long' });
  clockWeekDay.textContent = formatterDay.format(now);

  const numH = parseInt(h, 10) % 12;
  const numM = parseInt(m, 10);
  const numS = parseInt(s, 10);
  analogSec.style.transform = `translateX(-50%) rotate(${numS * 6}deg)`;
  analogMin.style.transform = `translateX(-50%) rotate(${numM * 6 + (numS * 0.1)}deg)`;
  analogHour.style.transform = `translateX(-50%) rotate(${(numH * 30) + (numM * 0.5)}deg)`;
}

setInterval(updateTurkeyClock, 1000);
updateTurkeyClock();
updateTargetLabel();


/* ==========================================================================
   5. ⚔️ GLOBAL 1v1 VS ARENA - WORLDWIDE CLOUD REAL-TIME ENGINE
   ========================================================================== */

function getHighEntropyRandom() {
  try {
    const arr = new Uint32Array(2);
    window.crypto.getRandomValues(arr);
    return (arr[0] * 4294967296 + arr[1]) / (4294967296 * 4294967296);
  } catch (e) {
    return Math.random();
  }
}

function generateRandomVsTarget() {
  const rand = getHighEntropyRandom();
  const isPureMs = rand < 0.15;

  if (isPureMs) {
    // 3 ms ile 99 ms arasında tam rastgele
    const ms = Math.floor(getHighEntropyRandom() * (99 - 3 + 1)) + 3;
    return {
      unit: 'millisecond',
      main: ms,
      sub: 0
    };
  } else {
    // 2 saniyeden 22 saniyeye kadar çok geniş ve çeşitli aralık (örn: 2.37, 4.81, 7.15, 11.44, 15.89, 18.02 vb.)
    const sec = Math.floor(getHighEntropyRandom() * (22 - 2 + 1)) + 2;
    let ms = 0;
    if (getHighEntropyRandom() > 0.10) {
      ms = Math.floor(getHighEntropyRandom() * 99) + 1;
    }
    return {
      unit: 'second',
      main: sec,
      sub: ms
    };
  }
}

function generateRandomGuessDuration() {
  const categoryRoll = getHighEntropyRandom(); // 0.00 - 1.00 arası dağılım

  if (categoryRoll < 0.20) {
    // 1. KATEGORİ: SAF MİLİSANİYE DURMALARI (10 ms - 99 ms arası - 10 milisaniyenin altında asla olmayacak!)
    const ms = Math.floor(getHighEntropyRandom() * (99 - 10 + 1)) + 10;
    return ms * 10; // 100 ms ile 990 ms arası (0.10 sn - 0.99 sn)
  } else if (categoryRoll < 0.45) {
    // 2. KATEGORİ: ÇOK KISA / ANI DURMALAR (1.00 sn - 2.99 sn arası, örn: 1.00, 1.25, 1.50, 1.82, 2.30 vb.)
    const sec = Math.floor(getHighEntropyRandom() * (2 - 1 + 1)) + 1; // 1 veya 2 sn
    const ms = Math.floor(getHighEntropyRandom() * 100);
    return (sec * 100 + ms) * 10;
  } else if (categoryRoll < 0.78) {
    // 3. KATEGORİ: ORTA SÜRELİ DURMALAR (3.00 sn - 8.99 sn arası, örn: 3.40, 4.15, 5.50, 6.78, 7.90 vb.)
    const sec = Math.floor(getHighEntropyRandom() * (8 - 3 + 1)) + 3; // 3 - 8 sn
    const ms = Math.floor(getHighEntropyRandom() * 100);
    return (sec * 100 + ms) * 10;
  } else {
    // 4. KATEGORİ: UZUN SÜRELİ DAYANIKLILIK DURMALARI (9.00 sn - 22.99 sn arası)
    const sec = Math.floor(getHighEntropyRandom() * (22 - 9 + 1)) + 9; // 9 - 22 sn
    const ms = Math.floor(getHighEntropyRandom() * 100);
    return (sec * 100 + ms) * 10;
  }
}

function generateRandomOverstepTarget() {
  // 2.00 sn ile 6.50 sn arası rastgele hedef süresi (örn: 2.70 sn, 3.40 sn, 4.20 sn, 2.16 sn, 5.00 sn)
  const sec = Math.floor(getHighEntropyRandom() * (6 - 2 + 1)) + 2;
  const ms = Math.floor(getHighEntropyRandom() * 100);
  return (sec * 100 + ms) * 10;
}

const myClientId = 'usr_' + Math.random().toString(36).substring(2, 9);
let currentUsername = sessionStorage.getItem('chrono_username') || localStorage.getItem('chrono_username') || '';

// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const userProfileBtn = document.getElementById('userProfileBtn');
const headerUsername = document.getElementById('headerUsername');

const vsModal = document.getElementById('vsModal');
const openVsModalBtn = document.getElementById('openVsModalBtn');
const closeVsModalBtn = document.getElementById('closeVsModalBtn');
const playerSearchInput = document.getElementById('playerSearchInput');
const playersList = document.getElementById('playersList');
const currentUsernameLabel = document.getElementById('currentUsernameLabel');

const incomingInviteModal = document.getElementById('incomingInviteModal');
const inviteSenderName = document.getElementById('inviteSenderName');
const acceptInviteBtn = document.getElementById('acceptInviteBtn');
const declineInviteBtn = document.getElementById('declineInviteBtn');

// Mode Selection Modal Elements
const modeSelectModal = document.getElementById('modeSelectModal');
const closeModeSelectModalBtn = document.getElementById('closeModeSelectModalBtn');
const modeModalBadge = document.getElementById('modeModalBadge');
const modeModalTitle = document.getElementById('modeModalTitle');
const modeModalDesc = document.getElementById('modeModalDesc');
const selectTimiModeBtn = document.getElementById('selectTimiModeBtn');
const selectNormalModeBtn = document.getElementById('selectNormalModeBtn');
const selectGuessModeBtn = document.getElementById('selectGuessModeBtn');
const selectOverstepModeBtn = document.getElementById('selectOverstepModeBtn');
const modeStatusText = document.getElementById('modeStatusText');
const openBotModalBtn = document.getElementById('openBotModalBtn');
const headerBotBtn = document.getElementById('headerBotBtn');
const botDifficultyContainer = document.getElementById('botDifficultyContainer');
const selectedDiffBadge = document.getElementById('selectedDiffBadge');
const botDiffBtns = document.querySelectorAll('.bot-diff-btn');
let currentBotDifficulty = 'medium';

// Arena Modal Elements
const vsArenaModal = document.getElementById('vsArenaModal');
const arenaActiveModeBadge = document.getElementById('arenaActiveModeBadge');
const arenaBotDiffBadge = document.getElementById('arenaBotDiffBadge');
const arenaBotDiffLabel = document.getElementById('arenaBotDiffLabel');
const arenaTargetContainer = document.getElementById('arenaTargetContainer');
const arenaTargetLabel = document.getElementById('arenaTargetLabel');
const arenaCountdownOverlay = document.getElementById('arenaCountdownOverlay');
const arenaCountdownNumber = document.getElementById('arenaCountdownNumber');
const arenaPrepOverlay = document.getElementById('arenaPrepOverlay');
const prepCountdownNumber = document.getElementById('prepCountdownNumber');

// Standard Mode Elements (Timi / Normal)
const arenaStandardSection = document.getElementById('arenaStandardSection');
const arenaP1Name = document.getElementById('arenaP1Name');
const arenaP2Name = document.getElementById('arenaP2Name');
const arenaP1Time = document.getElementById('arenaP1Time');
const arenaP2Time = document.getElementById('arenaP2Time');
const arenaP1Diff = document.getElementById('arenaP1Diff');
const arenaP2Diff = document.getElementById('arenaP2Diff');
const arenaAutoStartNotice = document.getElementById('arenaAutoStartNotice');
const arenaAutoStartTimer = document.getElementById('arenaAutoStartTimer');
const arenaActionBtn = document.getElementById('arenaActionBtn');
const arenaBtnIcon = document.getElementById('arenaBtnIcon');
const arenaBtnText = document.getElementById('arenaBtnText');

// Guess Mode Elements (TAHMİN ET)
const arenaGuessSection = document.getElementById('arenaGuessSection');
const guessP1Header = document.getElementById('guessP1Header');
const guessP2Header = document.getElementById('guessP2Header');
const guessMysteryDisplay = document.getElementById('guessMysteryDisplay');
const guessStatusNotice = document.getElementById('guessStatusNotice');
const guessInputBox = document.getElementById('guessInputBox');
const guessInputSec = document.getElementById('guessInputSec');
const guessInputMs = document.getElementById('guessInputMs');
const guessSubmitBtn = document.getElementById('guessSubmitBtn');
const guessWaitingMessage = document.getElementById('guessWaitingMessage');

// Overstep Mode Elements (HEDEFİ AŞMA)
const arenaOverstepSection = document.getElementById('arenaOverstepSection');
const overstepP1Badge = document.getElementById('overstepP1Badge');
const overstepP1Dot = document.getElementById('overstepP1Dot');
const overstepP1Name = document.getElementById('overstepP1Name');
const overstepP2Badge = document.getElementById('overstepP2Badge');
const overstepP2Dot = document.getElementById('overstepP2Dot');
const overstepP2Name = document.getElementById('overstepP2Name');
const overstepTargetLimitLabel = document.getElementById('overstepTargetLimitLabel');
const overstepMysteryDisplay = document.getElementById('overstepMysteryDisplay');
const overstepSuspenseBox = document.getElementById('overstepSuspenseBox');
const overstepSuspenseNumber = document.getElementById('overstepSuspenseNumber');
const overstepTurnStatus = document.getElementById('overstepTurnStatus');
const overstepAutoPassNotice = document.getElementById('overstepAutoPassNotice');
const overstepTurnTimer = document.getElementById('overstepTurnTimer');
const overstepActionBtn = document.getElementById('overstepActionBtn');
const overstepBtnIcon = document.getElementById('overstepBtnIcon');
const overstepBtnText = document.getElementById('overstepBtnText');
const overstepSpaceHint = document.getElementById('overstepSpaceHint');
const overstepOpponentLiveBox = document.getElementById('overstepOpponentLiveBox');
const overstepOpponentLiveTitle = document.getElementById('overstepOpponentLiveTitle');
const overstepOpponentLiveButton = document.getElementById('overstepOpponentLiveButton');
const overstepOpponentLiveIcon = document.getElementById('overstepOpponentLiveIcon');
const overstepOpponentLiveLabel = document.getElementById('overstepOpponentLiveLabel');
const overstepOpponentLiveStatus = document.getElementById('overstepOpponentLiveStatus');
const overstepPassCount = document.getElementById('overstepPassCount');
const overstepLogList = document.getElementById('overstepLogList');

// Robot Elements
const robotPhysicalBtn = document.getElementById('robotPhysicalBtn');
const robotBtnLabel = document.getElementById('robotBtnLabel');
const robotStatusNotice = document.getElementById('robotStatusNotice');
const robotArmContainer = document.getElementById('robotArmContainer');

// Winner Banner
const arenaWinnerBanner = document.getElementById('arenaWinnerBanner');
const arenaWinnerTitle = document.getElementById('arenaWinnerTitle');
const arenaWinnerDesc = document.getElementById('arenaWinnerDesc');
const arenaP1AccuracyLabel = document.getElementById('arenaP1AccuracyLabel');
const arenaP2AccuracyLabel = document.getElementById('arenaP2AccuracyLabel');
const arenaP1Accuracy = document.getElementById('arenaP1Accuracy');
const arenaP2Accuracy = document.getElementById('arenaP2Accuracy');
const arenaRematchBtn = document.getElementById('arenaRematchBtn');
const arenaExitBtn = document.getElementById('arenaExitBtn');

// Leaderboard Elements (TİMİ AVCILARI LİDERLİK TABLOSU)
const openLeaderboardBtn = document.getElementById('openLeaderboardBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
const leaderboardModal = document.getElementById('leaderboardModal');
const leaderboardList = document.getElementById('leaderboardList');
const leaderboardTotalWins = document.getElementById('leaderboardTotalWins');
const leaderboardBadgeCount = document.getElementById('leaderboardBadgeCount');
const floatingTimiToast = document.getElementById('floatingTimiToast');
const floatingToastText = document.getElementById('floatingToastText');

const TIMI_LEADERBOARD_STORAGE_KEY = 'chrono_timi_champions_v1';
let timiLeaderboardRecords = [];
try {
  const savedRecs = localStorage.getItem(TIMI_LEADERBOARD_STORAGE_KEY);
  if (savedRecs) {
    timiLeaderboardRecords = JSON.parse(savedRecs);
  }
} catch (e) {
  timiLeaderboardRecords = [];
}

let activePlayersMap = new Map();
let currentInvite = null;
let currentMatch = null;
let isArenaActive = false;
let arenaStartTime = 0;
let arenaElapsedTime = 0;
let arenaRafId = null;
let arenaStopped = false;
let arenaRunning = false;
let currentArenaMode = 'normal'; // 'timi', 'normal', 'guess' veya 'overstep'
let myModeChoice = null;
let opponentModeChoice = null;
let pendingModeMatch = null;
let arenaAutoStartInterval = null;
let arenaAutoStartRemaining = 10;

// Guess Mode State
let guessStopDurationMs = 0;
let guessTimeoutId = null;
let guessHasStopped = false;
let myGuess = null;
let opponentGuess = null;

// Overstep Mode State
let overstepTargetDurationMs = 2700;
let overstepCurrentTurn = null;
let overstepCurrentTurnClientId = null;
let overstepTurnState = 'idle'; // 'idle', 'ready', 'running', 'evaluating', 'ended'
let overstepPassCountVal = 0;
let overstepAccumulatedMs = 0;
let overstepTurnStartTimestamp = 0;
let overstepIsActive = false;
let overstepTurnCountdownInterval = null;
let overstepSuspenseInterval = null;
let overstepTurnRemaining = 10;
let overstepTurnsHistory = [];

// Bot Match State
let isBotMatch = false;
let botTimeoutIds = [];

function clearBotTimers() {
  botTimeoutIds.forEach(id => clearTimeout(id));
  botTimeoutIds = [];
}

// Hybrid Realtime Channel: BroadcastChannel (local) + Single Resilient MQTT Failover Broker
const vsChannel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('chrono_pulse_vs_channel') : null;
const MQTT_TOPIC = 'chronopulse/global/vs_matchmaking/v1';
const MQTT_LEADERBOARD_TOPIC = 'chronopulse/global/timi_leaderboard_retained/v1';

const NTFY_GLOBAL_TOPIC = 'chronopulse_global_v2';
const NTFY_BASE_URL = 'https://ntfy.sh/' + NTFY_GLOBAL_TOPIC;
let universalEventSource = null;
let universalWs = null;

const BROKER_SERVERS = [
  'wss://api.sondahub.com/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://broker.emqx.io:8084/mqtt',
  'wss://test.mosquitto.org:8081/mqtt'
];

let activeBrokerIndex = 0;
let mqttClient = null;
let isConnecting = false;
let pendingSentInvite = null;

// Message Deduplication
const seenMsgIds = new Set();
const seenMsgQueue = [];

function isDuplicateMessage(data) {
  if (!data) return true;
  const id = data.msgId || (data.senderId + '_' + data.type + '_' + (data.timestamp || ''));
  if (seenMsgIds.has(id)) return true;
  seenMsgIds.add(id);
  seenMsgQueue.push(id);
  if (seenMsgQueue.length > 400) {
    const old = seenMsgQueue.shift();
    seenMsgIds.delete(old);
  }
  return false;
}

function normalizeUser(str) {
  if (!str) return '';
  return String(str).trim().toLocaleLowerCase('tr');
}

// Universal Port 443 Engine (Cloudflare HTTPS & SSE & WSS - 100% Pardus, Linux, Win10/11, Mobile Uyumlu)
function initUniversal443Engine() {
  try {
    if (typeof WebSocket !== 'undefined' && !universalWs) {
      const ws = new WebSocket('wss://ntfy.sh/' + NTFY_GLOBAL_TOPIC + '/ws');
      ws.onopen = () => {
        universalWs = ws;
        console.log('[TimerX] Universal Port 443 WSS Connected');
        if (currentUsername) {
          broadcast({ type: 'PING_PRESENCE', username: currentUsername });
        }
      };
      ws.onmessage = (event) => {
        try {
          const item = JSON.parse(event.data);
          if (item.event === 'message' && item.message) {
            const data = JSON.parse(item.message);
            if (isDuplicateMessage(data)) return;
            handleRealtimeMessage(data);
          }
        } catch (e) {}
      };
      ws.onclose = () => {
        universalWs = null;
        setTimeout(initUniversal443Engine, 4000);
      };
      ws.onerror = () => {
        try { ws.close(); } catch(e){}
        universalWs = null;
      };
    }
  } catch (e) {}

  try {
    if (typeof EventSource !== 'undefined' && !universalEventSource) {
      universalEventSource = new EventSource(NTFY_BASE_URL + '/sse');
      universalEventSource.onmessage = (event) => {
        try {
          const item = JSON.parse(event.data);
          if (item.event === 'message' && item.message) {
            const data = JSON.parse(item.message);
            if (isDuplicateMessage(data)) return;
            handleRealtimeMessage(data);
          }
        } catch (e) {}
      };
      universalEventSource.onerror = () => {
        // EventSource otomatik olarak yeniden bağlanır
      };
    }
  } catch (e) {}
}

function connectToBroker(index) {
  if (typeof mqtt === 'undefined') return;
  if (mqttClient && mqttClient.connected) return;
  if (isConnecting) return;

  isConnecting = true;
  activeBrokerIndex = index % BROKER_SERVERS.length;
  const brokerUrl = BROKER_SERVERS[activeBrokerIndex];

  try {
    const clientId = 'cp_' + myClientId + '_' + Math.random().toString(36).substr(2, 5);
    const client = mqtt.connect(brokerUrl, {
      clientId: clientId,
      keepalive: 30,
      clean: true,
      reconnectPeriod: 4000,
      connectTimeout: 5000
    });

    let connectTimer = setTimeout(() => {
      if (!client.connected) {
        console.warn(`[TimerX] Broker ${brokerUrl} timeout, trying fallback...`);
        try { client.end(true); } catch(e){}
        isConnecting = false;
        connectToBroker(activeBrokerIndex + 1);
      }
    }, 5500);

    client.on('connect', () => {
      clearTimeout(connectTimer);
      isConnecting = false;
      mqttClient = client;
      console.log(`[TimerX] Connected to Cloud Realtime Broker: ${brokerUrl}`);
      
      client.subscribe(MQTT_TOPIC, { qos: 0 });
      client.subscribe(MQTT_LEADERBOARD_TOPIC, { qos: 1 });

      broadcast({ type: 'REQUEST_LEADERBOARD_SYNC' });
      if (currentUsername) {
        broadcast({ type: 'PING_PRESENCE', username: currentUsername });
      }
    });

    client.on('message', (topic, message) => {
      try {
        if (topic === MQTT_LEADERBOARD_TOPIC) {
          const remoteRecords = JSON.parse(message.toString());
          mergeLeaderboardRecords(remoteRecords);
          return;
        }
        if (topic === MQTT_TOPIC) {
          const data = JSON.parse(message.toString());
          if (isDuplicateMessage(data)) return;
          handleRealtimeMessage(data);
        }
      } catch (e) {}
    });

    client.on('error', (err) => {
      // Auto reconnect handled by client
    });

    client.on('close', () => {
      isConnecting = false;
    });

    mqttClient = client;
  } catch (err) {
    isConnecting = false;
    console.warn(`Broker error on ${brokerUrl}:`, err);
    setTimeout(() => connectToBroker(activeBrokerIndex + 1), 2000);
  }
}

try {
  initUniversal443Engine();
  connectToBroker(0);
} catch (e) {
  console.warn('Realtime init notice:', e);
}

function broadcast(msg) {
  const msgId = msg.msgId || ('m_' + myClientId + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
  const payload = { ...msg, msgId: msgId, senderId: myClientId, timestamp: Date.now() };

  // Mark our own sent message as seen
  isDuplicateMessage(payload);

  const jsonStr = JSON.stringify(payload);

  // 1. Local BroadcastChannel + LocalStorage
  try {
    if (vsChannel) { try { vsChannel.postMessage(payload); } catch(e){} }
    localStorage.setItem('chrono_realtime_event', JSON.stringify({ ...payload, _rand: Math.random() }));
  } catch (e) {}

  // 2. Port 443 Universal Engine (Cloudflare HTTPS POST - Dünyadaki tüm cihaz ve ağlarda 100% çalışır)
  try {
    fetch(NTFY_BASE_URL, {
      method: 'POST',
      body: jsonStr,
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(() => {});
  } catch (e) {}

  // 3. Global Cloud MQTT Broker (Opsiyonel ikincil kanal)
  if (mqttClient && mqttClient.connected) {
    try {
      mqttClient.publish(MQTT_TOPIC, jsonStr, { qos: 0 });
    } catch (e) {}
  }
}

function handleRealtimeMessage(data) {
  if (!data || data.senderId === myClientId) return;

  switch (data.type) {
    case 'PING_PRESENCE':
      if (data.username && (normalizeUser(data.username) !== normalizeUser(currentUsername) || data.senderId !== myClientId)) {
        activePlayersMap.set(data.username, {
          id: data.senderId,
          username: data.username,
          lastSeen: Date.now()
        });
        renderPlayersList();
      }
      break;

    case 'INVITE_SEND':
      const isInviteForMe = (data.targetClientId && data.targetClientId === myClientId) ||
                            (currentUsername && normalizeUser(data.targetUser) === normalizeUser(currentUsername));
      if (isInviteForMe) {
        // If already inside a match or in mode selection, ignore new invites
        if (isArenaActive || pendingModeMatch || currentMatch) return;

        currentInvite = data;
        currentInvite.fromClientId = data.senderId || data.fromClientId;
        inviteSenderName.textContent = data.fromUsername;
        incomingInviteModal.classList.remove('hidden');
        sounds.playChallengeInvite();
        lucide.createIcons();
      }
      break;

    case 'INVITE_DECLINED':
      const isDeclineForMe = (data.toClientId && data.toClientId === myClientId) ||
                             (currentUsername && normalizeUser(data.toUser) === normalizeUser(currentUsername));
      if (isDeclineForMe) {
        pendingSentInvite = null;
        alert(`❌ ${data.fromUsername} davetinizi reddetti.`);
        renderPlayersList();
      }
      break;

    case 'INVITE_ACCEPTED':
      const isAcceptForMe = (data.toClientId && data.toClientId === myClientId) ||
                            (currentUsername && normalizeUser(data.toUser) === normalizeUser(currentUsername));
      if (isAcceptForMe) {
        // If already in match, ignore
        if (isArenaActive || currentMatch) return;
        pendingSentInvite = null;
        openModeSelectionModal(data.matchId, data.p1, data.p2, data.targetTime, data.guessDurationMs, data.overstepTargetMs, data.p1ClientId, data.p2ClientId);
      }
      break;

    case 'MODE_SELECT':
      if (pendingModeMatch && pendingModeMatch.matchId === data.matchId) {
        opponentModeChoice = data.mode;
        if (data.fromClientId) {
          if (data.fromUsername && pendingModeMatch.p1 && normalizeUser(data.fromUsername) === normalizeUser(pendingModeMatch.p1)) {
            pendingModeMatch.p1ClientId = data.fromClientId;
          } else if (data.fromUsername && pendingModeMatch.p2 && normalizeUser(data.fromUsername) === normalizeUser(pendingModeMatch.p2)) {
            pendingModeMatch.p2ClientId = data.fromClientId;
          }
        }
        evaluateModeResolution();
      }
      break;

    case 'GUESS_SUBMIT':
      if (currentMatch && currentMatch.matchId === data.matchId) {
        opponentGuess = data.guess;
        checkGuessOutcome();
      }
      break;

    case 'ARENA_STOP':
      if (currentMatch && currentMatch.matchId === data.matchId) {
        currentMatch.p2Result = data.result;
        arenaP2Time.textContent = data.result.formatted;
        arenaP2Diff.textContent = `Fark: ${data.result.diffText}`;
        checkArenaOutcome();
      }
      break;

    case 'ARENA_REMATCH':
      if (currentMatch && currentMatch.matchId === data.matchId) {
        openModeSelectionModal(data.newMatchId, currentMatch.p1, currentMatch.p2, data.targetTime, data.guessDurationMs, data.overstepTargetMs, data.p1ClientId || currentMatch.p1ClientId, data.p2ClientId || currentMatch.p2ClientId);
      }
      break;

    case 'OVERSTEP_TURN_STARTED':
      if (currentMatch && currentMatch.matchId === data.matchId) {
        if (overstepOpponentLiveBox && overstepOpponentLiveButton) {
          overstepOpponentLiveBox.className = 'w-full p-4 rounded-2xl bg-gradient-to-b from-red-950/80 to-slate-950 border-2 border-red-500 shadow-2xl shadow-red-500/50 text-center flex flex-col items-center justify-center transition-all duration-150 animate-pulse';
          overstepOpponentLiveButton.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 border-2 border-red-400 shadow-[0_1px_0_#7f1d1d,0_0_25px_rgba(239,68,68,0.9)] flex flex-col items-center justify-center font-black text-[10px] text-white uppercase tracking-wider transition-all duration-100 select-none transform translate-y-1.5';
          overstepOpponentLiveLabel.textContent = 'BASILI! 🔥';
          overstepOpponentLiveStatus.textContent = `🔥 ${data.fromUsername} ŞU AN BASIYOR! (İçinden süreyi say!)`;
          overstepOpponentLiveStatus.className = 'text-xs font-black text-red-400 mt-2 animate-bounce';
        }
        overstepTurnStatus.textContent = `🔥 ${data.fromUsername} sayacı başlattı... İçinden süreyi say!`;
        overstepTurnStatus.className = 'p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs sm:text-sm font-black text-rose-300 mt-3 animate-pulse text-center';
        sounds.playStart();
      }
      break;

    case 'OVERSTEP_TURN_STOPPED':
      if (currentMatch && currentMatch.matchId === data.matchId) {
        if (overstepOpponentLiveBox && overstepOpponentLiveButton) {
          overstepOpponentLiveBox.className = 'w-full p-4 rounded-2xl bg-slate-900/95 border-2 border-slate-700 text-center flex flex-col items-center justify-center transition-all duration-200';
          overstepOpponentLiveButton.className = 'w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500 shadow-[0_6px_0_#064e3b] flex flex-col items-center justify-center font-black text-[10px] text-emerald-400 uppercase tracking-wider transition-all duration-150 select-none transform translate-y-0';
          overstepOpponentLiveLabel.textContent = 'DURDURDU 🛑';
          overstepOpponentLiveStatus.textContent = `🛑 ${data.fromUsername} BUTONU BIRAKTI VE DURDURDU!`;
          overstepOpponentLiveStatus.className = 'text-xs font-bold text-emerald-400 mt-2';
        }
        runOverstepSuspenseEvaluation(data.fromUsername, data.newTotalMs, data.formatted, data.isBust);
      }
      break;

    case 'TIMI_CHAMPION_RECORD':
      if (data.record) {
        mergeLeaderboardRecords([data.record]);
        showTimiVictoryToast(data.record);
      }
      break;

    case 'REQUEST_LEADERBOARD_SYNC':
      if (timiLeaderboardRecords.length > 0) {
        broadcast({
          type: 'SYNC_LEADERBOARD_RECORDS',
          records: timiLeaderboardRecords
        });
      }
      break;

    case 'SYNC_LEADERBOARD_RECORDS':
      if (data.records && Array.isArray(data.records)) {
        mergeLeaderboardRecords(data.records);
      }
      break;
  }
}

/* ==========================================================================
   TİMİ AVCILARI LİDERLİK TABLOSU YÖNETİMİ & BİLDİRİMLERİ (GLOBAL CLOUD SYNC)
   ========================================================================== */

function mergeLeaderboardRecords(newRecords) {
  if (!Array.isArray(newRecords) || newRecords.length === 0) return;
  let changed = false;

  for (const rec of newRecords) {
    if (!rec || !rec.username) continue;
    const exists = timiLeaderboardRecords.some(r => {
      if (r.id && rec.id && r.id === rec.id) return true;
      if (r.username === rec.username && r.timestamp === rec.timestamp) return true;
      if (r.username === rec.username && r.userTime === rec.userTime && r.botTime === rec.botTime && Math.abs(r.timestamp - rec.timestamp) < 5000) return true;
      return false;
    });

    if (!exists) {
      timiLeaderboardRecords.push(rec);
      changed = true;
    }
  }

  if (changed) {
    timiLeaderboardRecords.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    if (timiLeaderboardRecords.length > 100) {
      timiLeaderboardRecords = timiLeaderboardRecords.slice(0, 100);
    }
    try {
      localStorage.setItem(TIMI_LEADERBOARD_STORAGE_KEY, JSON.stringify(timiLeaderboardRecords));
    } catch (e) {}
    renderLeaderboard();
  }
}

function publishLeaderboardRetained() {
  if (mqttClient && mqttClient.connected) {
    try {
      mqttClient.publish(
        MQTT_LEADERBOARD_TOPIC,
        JSON.stringify(timiLeaderboardRecords),
        { retain: true, qos: 1 }
      );
    } catch (e) {}
  }
}

function formatTimeAgo(timestamp) {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 10) return 'Az önce';
  if (diffSec < 60) return `${diffSec} sn önce`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} sa önce`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} gün önce`;
}

function renderLeaderboard() {
  if (leaderboardTotalWins) leaderboardTotalWins.textContent = timiLeaderboardRecords.length;
  if (leaderboardBadgeCount) leaderboardBadgeCount.textContent = timiLeaderboardRecords.length;

  if (!leaderboardList) return;
  leaderboardList.innerHTML = '';

  if (timiLeaderboardRecords.length === 0) {
    leaderboardList.innerHTML = `
      <div class="text-center py-10 text-slate-500">
        <div class="text-3xl mb-2">👑</div>
        <div class="font-bold text-slate-400 text-sm">${t('leaderboardEmpty')}</div>
      </div>
    `;
    return;
  }

  timiLeaderboardRecords.forEach((rec, index) => {
    const item = document.createElement('div');
    const isTop1 = index === 0;
    
    let rankBadgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
    let crown = '';
    if (index === 0) {
      rankBadgeClass = 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-400/30';
      crown = '👑 ';
    } else if (index === 1) {
      rankBadgeClass = 'bg-slate-300 text-slate-950 border-slate-200 font-black';
      crown = '🥈 ';
    } else if (index === 2) {
      rankBadgeClass = 'bg-amber-700 text-amber-100 border-amber-600 font-black';
      crown = '🥉 ';
    }

    item.className = `p-3 sm:p-4 rounded-2xl border transition-all ${
      isTop1
        ? 'bg-gradient-to-r from-amber-950/50 via-yellow-950/30 to-slate-900 border-amber-500/70 shadow-lg shadow-amber-500/10'
        : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
    }`;

    item.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center space-x-2.5 sm:space-x-3">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center text-xs sm:text-sm font-black font-mono shrink-0 ${rankBadgeClass}">
            #${index + 1}
          </div>
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="font-black text-white text-xs sm:text-sm tracking-wide font-sans">${crown}${rec.username}</span>
              <span class="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 font-sans">
                ${rec.modeTitle || 'TİMİ BOT'}
              </span>
            </div>
            <div class="text-[10px] sm:text-[11px] text-amber-400/90 font-mono mt-0.5">
              🎯 ${rec.targetText}
            </div>
          </div>
        </div>

        <div class="text-right font-mono shrink-0">
          <div class="text-xs sm:text-sm font-black text-brand-glow">
            ${rec.userTime} <span class="text-[10px] font-bold text-emerald-400">(${rec.userDiff})</span>
          </div>
          <div class="text-[10px] text-rose-400 font-semibold">
            TİMİ BOT: ${rec.botTime} (${rec.botDiff})
          </div>
          <div class="text-[9px] text-slate-500 mt-0.5 font-sans">
            ${formatTimeAgo(rec.timestamp)}
          </div>
        </div>
      </div>
    `;
    leaderboardList.appendChild(item);
  });
}

let toastTimeout = null;
function showTimiVictoryToast(record) {
  if (!floatingTimiToast || !floatingToastText) return;
  floatingToastText.textContent = `${record.username} ${t('toastDefeated')} (${record.targetText})`;
  
  floatingTimiToast.classList.remove('hidden');
  floatingTimiToast.classList.remove('opacity-0', 'translate-y-4');
  floatingTimiToast.classList.add('opacity-100', 'translate-y-0');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    floatingTimiToast.classList.add('opacity-0', 'translate-y-4');
    floatingTimiToast.classList.remove('opacity-100', 'translate-y-0');
    setTimeout(() => {
      floatingTimiToast.classList.add('hidden');
    }, 350);
  }, 5000);
}

function recordTimiDefeat(mode, targetText, userTime, botTime, userDiff, botDiff) {
  if (!isBotMatch || currentBotDifficulty !== 'timi') {
    return;
  }
  const winnerName = currentUsername || 'Şampiyon';
  const record = {
    id: 'timi_win_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    username: winnerName,
    mode: mode,
    modeTitle: mode === 'timi' ? 'TİMİ MOD' : (mode === 'normal' ? 'NORMAL MOD' : (mode === 'guess' ? 'TAHMİN ET' : 'HEDEFİ AŞMA')),
    targetText: targetText,
    userTime: userTime,
    botTime: botTime,
    userDiff: userDiff,
    botDiff: botDiff,
    timestamp: Date.now()
  };

  timiLeaderboardRecords.unshift(record);
  if (timiLeaderboardRecords.length > 100) {
    timiLeaderboardRecords = timiLeaderboardRecords.slice(0, 100);
  }

  try {
    localStorage.setItem(TIMI_LEADERBOARD_STORAGE_KEY, JSON.stringify(timiLeaderboardRecords));
  } catch (e) {}

  renderLeaderboard();
  showTimiVictoryToast(record);

  publishLeaderboardRetained();

  broadcast({
    type: 'TIMI_CHAMPION_RECORD',
    record: record
  });
}

if (openLeaderboardBtn) {
  openLeaderboardBtn.addEventListener('click', () => {
    renderLeaderboard();
    if (leaderboardModal) leaderboardModal.classList.remove('hidden');
    sounds.playBeep(650, 'triangle', 0.1, 0.2);
    lucide.createIcons();
  });
}

if (closeLeaderboardBtn) {
  closeLeaderboardBtn.addEventListener('click', () => {
    if (leaderboardModal) leaderboardModal.classList.add('hidden');
  });
}

// Initial render for header badge count
renderLeaderboard();

if (vsChannel) {
  vsChannel.onmessage = (e) => {
    if (isDuplicateMessage(e.data)) return;
    handleRealtimeMessage(e.data);
  };
}

window.addEventListener('storage', (e) => {
  if (e.key === 'chrono_realtime_event' && e.newValue) {
    try {
      const data = JSON.parse(e.newValue);
      if (isDuplicateMessage(data)) return;
      handleRealtimeMessage(data);
    } catch (err) {}
  }
});

// Single Presence Heartbeat (every 2.5s)
setInterval(() => {
  if (currentUsername) {
    broadcast({ type: 'PING_PRESENCE', username: currentUsername });
  }
  const now = Date.now();
  for (let [uname, p] of activePlayersMap.entries()) {
    if (now - p.lastSeen > 8000) {
      activePlayersMap.delete(uname);
    }
  }
  renderPlayersList();
}, 2500);

// Instant presence announcement on tab focus or screen wake
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentUsername) {
    broadcast({ type: 'PING_PRESENCE', username: currentUsername });
  }
});
window.addEventListener('focus', () => {
  if (currentUsername) {
    broadcast({ type: 'PING_PRESENCE', username: currentUsername });
  }
});

function updateHeaderUser() {
  if (currentUsername) {
    headerUsername.textContent = currentUsername;
    currentUsernameLabel.textContent = currentUsername;
  } else {
    headerUsername.textContent = 'Giriş Yap';
    currentUsernameLabel.textContent = '--';
  }
}

userProfileBtn.addEventListener('click', () => {
  usernameInput.value = currentUsername;
  loginModal.classList.remove('hidden');
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const uname = usernameInput.value.trim();
  if (uname) {
    currentUsername = uname;
    sessionStorage.setItem('chrono_username', currentUsername);
    localStorage.setItem('chrono_username', currentUsername);
    updateHeaderUser();
    loginModal.classList.add('hidden');
    broadcast({ type: 'PING_PRESENCE', username: currentUsername });
    sounds.playBeep(660, 'sine', 0.1, 0.2);
  }
});

if (!currentUsername) {
  setTimeout(() => {
    loginModal.classList.remove('hidden');
  }, 600);
} else {
  updateHeaderUser();
  broadcast({ type: 'PING_PRESENCE', username: currentUsername });
}

openVsModalBtn.addEventListener('click', () => {
  if (!currentUsername) {
    loginModal.classList.remove('hidden');
    return;
  }
  vsModal.classList.remove('hidden');
  broadcast({ type: 'PING_PRESENCE', username: currentUsername });
  renderPlayersList();
});

closeVsModalBtn.addEventListener('click', () => {
  vsModal.classList.add('hidden');
});

function renderPlayersList() {
  if (!playersList) return;
  const filter = normalizeUser(playerSearchInput.value);
  playersList.innerHTML = '';

  let count = 0;
  for (let [uname, player] of activePlayersMap.entries()) {
    if (normalizeUser(uname) === normalizeUser(currentUsername) && player.id === myClientId) continue;
    if (filter && !normalizeUser(uname).includes(filter)) continue;

    count++;
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition-all';
    
    const isPending = pendingSentInvite && normalizeUser(pendingSentInvite.targetUser) === normalizeUser(uname);

    item.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-black text-purple-400 font-mono text-sm">
          ${uname.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <span class="font-bold text-white font-mono text-sm block">${uname}</span>
          <span class="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Çevrimiçi (Dünya Geneli)</span>
          </span>
        </div>
      </div>
      <button class="invite-btn px-4 py-2 rounded-xl ${isPending ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-md shadow-purple-500/20'} font-bold text-xs transition-all active:scale-95 flex items-center space-x-1.5" data-user="${uname}" data-client-id="${player.id}" ${isPending ? 'disabled' : ''}>
        <i data-lucide="${isPending ? 'clock' : 'swords'}" class="w-3.5 h-3.5"></i>
        <span>${isPending ? 'Gönderildi...' : 'DAVET ET'}</span>
      </button>
    `;
    playersList.appendChild(item);
  }

  if (count === 0) {
    playersList.innerHTML = `
      <div class="text-center py-8 text-slate-500 text-xs">
        <i data-lucide="globe" class="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400"></i>
        <span>Şu an aktif başka oyuncu aranıyor... Başka bir cihazdan veya sekmeden siteye girildiğinde anında burada görünecektir!</span>
      </div>
    `;
  }

  document.querySelectorAll('.invite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetUser = btn.getAttribute('data-user');
      const targetClientId = btn.getAttribute('data-client-id');
      
      const inviteId = 'inv_' + myClientId + '_' + Date.now();
      pendingSentInvite = {
        inviteId: inviteId,
        targetUser: targetUser,
        timestamp: Date.now()
      };

      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="clock" class="w-3.5 h-3.5"></i><span>Gönderildi...</span>';
      
      const randomTarget = generateRandomVsTarget();
      const randomGuessDuration = generateRandomGuessDuration();
      const randomOverstepTarget = generateRandomOverstepTarget();

      broadcast({
        type: 'INVITE_SEND',
        inviteId: inviteId,
        fromUsername: currentUsername,
        fromClientId: myClientId,
        targetUser: targetUser,
        targetClientId: targetClientId,
        targetTime: randomTarget,
        guessDurationMs: randomGuessDuration,
        overstepTargetMs: randomOverstepTarget
      });
      sounds.playBeep(520, 'sine', 0.1, 0.2);

      // Auto-reset invite button after 12s if no response
      setTimeout(() => {
        if (pendingSentInvite && pendingSentInvite.inviteId === inviteId) {
          pendingSentInvite = null;
          renderPlayersList();
        }
      }, 12000);
    });
  });

  lucide.createIcons();
}

playerSearchInput.addEventListener('input', renderPlayersList);

acceptInviteBtn.addEventListener('click', () => {
  if (!currentInvite) return;
  incomingInviteModal.classList.add('hidden');

  const matchId = 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const inviter = currentInvite.fromUsername; // Davet eden (P1)
  const invitee = currentUsername; // Daveti kabul eden (P2)
  const p1ClientId = currentInvite.fromClientId || currentInvite.senderId;
  const p2ClientId = myClientId;
  const inviteId = currentInvite.inviteId;

  broadcast({
    type: 'INVITE_ACCEPTED',
    inviteId: inviteId,
    fromUsername: currentUsername,
    fromClientId: myClientId,
    toUser: inviter,
    toClientId: p1ClientId,
    targetTime: currentInvite.targetTime,
    guessDurationMs: currentInvite.guessDurationMs,
    overstepTargetMs: currentInvite.overstepTargetMs,
    matchId: matchId,
    p1: inviter,
    p2: invitee,
    p1ClientId: p1ClientId,
    p2ClientId: p2ClientId
  });

  openModeSelectionModal(matchId, inviter, invitee, currentInvite.targetTime, currentInvite.guessDurationMs, currentInvite.overstepTargetMs, p1ClientId, p2ClientId);
  currentInvite = null;
});

declineInviteBtn.addEventListener('click', () => {
  if (!currentInvite) return;
  incomingInviteModal.classList.add('hidden');

  broadcast({
    type: 'INVITE_DECLINED',
    inviteId: currentInvite.inviteId,
    fromUsername: currentUsername,
    fromClientId: myClientId,
    toUser: currentInvite.fromUsername,
    toClientId: currentInvite.fromClientId || currentInvite.senderId
  });
  currentInvite = null;
  sounds.playBeep(220, 'sine', 0.1, 0.2);
});

/* ==========================================================================
   OYUN MODU SEÇİMİ (TİMİ MOD / NORMAL MOD / TAHMİN ET / HEDEFİ AŞMA)
   ========================================================================== */

function openBotMatchSetup() {
  clearBotTimers();
  isBotMatch = true;
  const matchId = 'bot_match_' + Date.now();
  const user = currentUsername || 'Oyuncu';
  const botName = '🤖 TİMİ BOT';
  const randomTarget = generateRandomVsTarget();
  const randomGuessDuration = generateRandomGuessDuration();
  const randomOverstepTarget = generateRandomOverstepTarget();

  openModeSelectionModal(
    matchId,
    user,
    botName,
    randomTarget,
    randomGuessDuration,
    randomOverstepTarget,
    myClientId,
    'client_timi_bot',
    true
  );
}

if (openBotModalBtn) openBotModalBtn.addEventListener('click', openBotMatchSetup);
if (headerBotBtn) headerBotBtn.addEventListener('click', openBotMatchSetup);
if (closeModeSelectModalBtn) {
  closeModeSelectModalBtn.addEventListener('click', () => {
    modeSelectModal.classList.add('hidden');
    clearBotTimers();
    isBotMatch = false;
  });
}

if (botDiffBtns && botDiffBtns.length > 0) {
  botDiffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      botDiffBtns.forEach(b => {
        b.classList.remove('active', 'border-emerald-500', 'border-yellow-500', 'border-red-500', 'border-amber-400', 'ring-2', 'ring-emerald-500/30', 'ring-yellow-500/30', 'ring-red-500/30', 'ring-amber-400/50');
        b.classList.add('border-slate-700');
      });
      btn.classList.add('active');
      btn.classList.remove('border-slate-700');
      
      const diff = btn.getAttribute('data-difficulty');
      currentBotDifficulty = diff;

      if (diff === 'easy') {
        btn.classList.add('border-emerald-500', 'ring-2', 'ring-emerald-500/30');
        if (selectedDiffBadge) {
          selectedDiffBadge.textContent = 'KOLAY SEVİYE';
          selectedDiffBadge.className = 'text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
        }
      } else if (diff === 'medium') {
        btn.classList.add('border-yellow-500', 'ring-2', 'ring-yellow-500/30');
        if (selectedDiffBadge) {
          selectedDiffBadge.textContent = 'ORTA SEVİYE';
          selectedDiffBadge.className = 'text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/40';
        }
      } else if (diff === 'hard') {
        btn.classList.add('border-red-500', 'ring-2', 'ring-red-500/30');
        if (selectedDiffBadge) {
          selectedDiffBadge.textContent = 'ZOR SEVİYE';
          selectedDiffBadge.className = 'text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40';
        }
      } else if (diff === 'timi') {
        btn.classList.add('border-amber-400', 'ring-2', 'ring-amber-400/50');
        if (selectedDiffBadge) {
          selectedDiffBadge.textContent = '👑 TİMİ SEVİYESİ (AŞIRI ZOR!)';
          selectedDiffBadge.className = 'text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400 animate-pulse';
        }
      }
      sounds.playBeep(600, 'sine', 0.08, 0.2);
    });
  });
}

function openModeSelectionModal(matchId, p1, p2, targetTime, guessDurationMs, overstepTargetMs, p1ClientId, p2ClientId, isBot = false) {
  vsModal.classList.add('hidden');
  incomingInviteModal.classList.add('hidden');
  vsArenaModal.classList.add('hidden');
  modeSelectModal.classList.remove('hidden');

  isBotMatch = isBot || (p2 && p2.includes('BOT')) || (p1 && p1.includes('BOT'));
  myModeChoice = null;
  opponentModeChoice = null;
  pendingModeMatch = {
    matchId,
    p1,
    p2,
    p1ClientId: p1ClientId || (normalizeUser(p1) === normalizeUser(currentUsername) ? myClientId : null),
    p2ClientId: p2ClientId || (normalizeUser(p2) === normalizeUser(currentUsername) ? myClientId : null),
    targetTime,
    guessDurationMs: guessDurationMs || generateRandomGuessDuration(),
    overstepTargetMs: overstepTargetMs || generateRandomOverstepTarget(),
    isBot: isBotMatch
  };

  if (isBotMatch) {
    if (botDifficultyContainer) botDifficultyContainer.classList.remove('hidden');
    if (modeModalBadge) {
      modeModalBadge.textContent = '🤖 YAPAY ZEKA MEYDAN OKUMASI';
      modeModalBadge.className = 'text-xs uppercase font-extrabold tracking-widest text-emerald-400';
    }
    if (modeModalTitle) modeModalTitle.textContent = 'BOTLA HANGİ MODDA YARIŞMAK İSTERSİN?';
    if (modeModalDesc) modeModalDesc.textContent = 'Önce zorluk seviyesini, ardından oynamak istediğin modu seç!';
    modeStatusText.textContent = 'Zorluğu ve modu seçin, yarış anında başlasın...';
    modeStatusText.className = 'mt-5 text-xs font-semibold text-emerald-400 animate-pulse';
  } else {
    if (botDifficultyContainer) botDifficultyContainer.classList.add('hidden');
    if (modeModalBadge) {
      modeModalBadge.textContent = '1v1 VS EŞLEŞTİ!';
      modeModalBadge.className = 'text-xs uppercase font-extrabold tracking-widest text-amber-400';
    }
    if (modeModalTitle) modeModalTitle.textContent = 'OYUN MODUNU SEÇİN';
    if (modeModalDesc) modeModalDesc.textContent = 'İki oyuncu da mod seçer. Farklı seçim yapılırsa sistem rastgele birini belirler!';
    modeStatusText.textContent = 'Oyun modunu seçin (TİMİ, NORMAL, TAHMİN ET veya HEDEFİ AŞMA)...';
    modeStatusText.className = 'mt-5 text-xs font-semibold text-slate-400 animate-pulse';
  }

  selectTimiModeBtn.disabled = false;
  selectNormalModeBtn.disabled = false;
  selectGuessModeBtn.disabled = false;
  selectOverstepModeBtn.disabled = false;

  selectTimiModeBtn.classList.remove('ring-4', 'ring-amber-400', 'opacity-50');
  selectNormalModeBtn.classList.remove('ring-4', 'ring-brand-500', 'opacity-50');
  selectGuessModeBtn.classList.remove('ring-4', 'ring-purple-500', 'opacity-50');
  selectOverstepModeBtn.classList.remove('ring-4', 'ring-rose-500', 'opacity-50');

  sounds.playChallengeInvite();
}

function chooseMode(mode) {
  if (myModeChoice || !pendingModeMatch) return;
  myModeChoice = mode;
  sounds.playBeep(550, 'triangle', 0.1, 0.2);

  if (mode === 'timi') {
    selectTimiModeBtn.classList.add('ring-4', 'ring-amber-400');
    selectNormalModeBtn.classList.add('opacity-50');
    selectGuessModeBtn.classList.add('opacity-50');
    selectOverstepModeBtn.classList.add('opacity-50');
  } else if (mode === 'normal') {
    selectNormalModeBtn.classList.add('ring-4', 'ring-brand-500');
    selectTimiModeBtn.classList.add('opacity-50');
    selectGuessModeBtn.classList.add('opacity-50');
    selectOverstepModeBtn.classList.add('opacity-50');
  } else if (mode === 'guess') {
    selectGuessModeBtn.classList.add('ring-4', 'ring-purple-500');
    selectTimiModeBtn.classList.add('opacity-50');
    selectNormalModeBtn.classList.add('opacity-50');
    selectOverstepModeBtn.classList.add('opacity-50');
  } else if (mode === 'overstep') {
    selectOverstepModeBtn.classList.add('ring-4', 'ring-rose-500');
    selectTimiModeBtn.classList.add('opacity-50');
    selectNormalModeBtn.classList.add('opacity-50');
    selectGuessModeBtn.classList.add('opacity-50');
  }

  if (isBotMatch || (pendingModeMatch && pendingModeMatch.isBot)) {
    opponentModeChoice = mode;
    evaluateModeResolution();
    return;
  }

  broadcast({
    type: 'MODE_SELECT',
    matchId: pendingModeMatch.matchId,
    fromUsername: currentUsername,
    fromClientId: myClientId,
    mode: mode
  });

  evaluateModeResolution();
}

selectTimiModeBtn.addEventListener('click', () => chooseMode('timi'));
selectNormalModeBtn.addEventListener('click', () => chooseMode('normal'));
selectGuessModeBtn.addEventListener('click', () => chooseMode('guess'));
selectOverstepModeBtn.addEventListener('click', () => chooseMode('overstep'));

function getModeTitle(m) {
  if (m === 'timi') return 'TİMİ MOD (NO LOOK)';
  if (m === 'normal') return 'NORMAL MOD (LOOK)';
  if (m === 'guess') return 'TAHMİN ET (Rastgele Durur)';
  if (m === 'overstep') return 'HEDEFİ AŞMA (Sırayla Paslaş)';
  return m;
}

function evaluateModeResolution() {
  if (!pendingModeMatch) return;

  if (myModeChoice && !opponentModeChoice) {
    modeStatusText.textContent = `Seçiminiz: ${getModeTitle(myModeChoice)}. Rakibin seçimi bekleniyor...`;
    return;
  }

  if (!myModeChoice && opponentModeChoice) {
    modeStatusText.textContent = 'Rakip seçimini yaptı! Lütfen siz de bir mod seçin...';
    return;
  }

  if (myModeChoice && opponentModeChoice) {
    selectTimiModeBtn.disabled = true;
    selectNormalModeBtn.disabled = true;
    selectGuessModeBtn.disabled = true;
    selectOverstepModeBtn.disabled = true;

    let finalMode = '';
    let resolutionReason = '';

    if (myModeChoice === opponentModeChoice) {
      finalMode = myModeChoice;
      resolutionReason = isBotMatch ? `Mod belirlendi: ${getModeTitle(finalMode)}!` : `İki oyuncu da aynı modu seçti: ${getModeTitle(finalMode)}!`;
    } else {
      const sumCodes = pendingModeMatch.matchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const chosenPool = [myModeChoice, opponentModeChoice].sort();
      finalMode = chosenPool[sumCodes % chosenPool.length];
      resolutionReason = `Farklı modlar seçildi! Sistem rastgele belirledi: ${getModeTitle(finalMode)}!`;
    }

    modeStatusText.textContent = `${resolutionReason} Arena başlatılıyor...`;
    modeStatusText.className = 'mt-5 text-xs font-bold text-amber-300 animate-bounce';

    const matchToLaunch = pendingModeMatch;
    const launchDelay = isBotMatch ? 600 : 1500;
    setTimeout(() => {
      modeSelectModal.classList.add('hidden');
      launchArenaMatch(
        matchToLaunch.matchId,
        matchToLaunch.p1,
        matchToLaunch.p2,
        matchToLaunch.targetTime,
        finalMode,
        matchToLaunch.guessDurationMs,
        matchToLaunch.overstepTargetMs,
        matchToLaunch.p1ClientId,
        matchToLaunch.p2ClientId
      );
      pendingModeMatch = null;
    }, launchDelay);
  }
}

/* ==========================================================================
   1v1 ARENA MOTORU (STANDART, TAHMİN ET & HEDEFİ AŞMA MODLARI)
   ========================================================================== */

function launchArenaMatch(matchId, p1, p2, targetTime, chosenMode, incomingGuessDurationMs, incomingOverstepTargetMs, p1ClientId, p2ClientId) {
  clearBotTimers();
  isArenaActive = true;
  arenaStopped = false;
  arenaRunning = false;
  currentArenaMode = chosenMode || 'normal';
  isBotMatch = (p2 && p2.includes('BOT')) || (p1 && p1.includes('BOT')) || isBotMatch;
  arenaWinnerBanner.classList.add('hidden');

  if (isBotMatch) {
    p1 = currentUsername || 'Oyuncu';
    p1ClientId = myClientId;
    p2 = '🤖 TİMİ BOT';
    p2ClientId = 'client_timi_bot';

    if (arenaBotDiffBadge && arenaBotDiffLabel) {
      arenaBotDiffBadge.classList.remove('hidden');
      if (currentBotDifficulty === 'easy') {
        arenaBotDiffBadge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm';
        arenaBotDiffLabel.textContent = 'BOT: 🟢 KOLAY';
      } else if (currentBotDifficulty === 'medium') {
        arenaBotDiffBadge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm';
        arenaBotDiffLabel.textContent = 'BOT: 🟡 ORTA';
      } else if (currentBotDifficulty === 'hard') {
        arenaBotDiffBadge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm';
        arenaBotDiffLabel.textContent = 'BOT: 🔴 ZOR';
      } else if (currentBotDifficulty === 'timi') {
        arenaBotDiffBadge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase bg-amber-500/30 text-amber-300 border border-amber-400 shadow-md animate-pulse';
        arenaBotDiffLabel.textContent = 'BOT: 👑 TİMİ (AŞIRI ZOR)';
      }
    }
  } else {
    if (arenaBotDiffBadge) arenaBotDiffBadge.classList.add('hidden');
  }

  currentMatch = {
    matchId: matchId,
    p1: p1,
    p1ClientId: p1ClientId,
    p2: p2,
    p2ClientId: p2ClientId,
    targetTime: targetTime,
    mode: currentArenaMode,
    p1Result: null,
    p2Result: null
  };

  // UI Modu Ayarı
  if (currentArenaMode === 'guess') {
    // TAHMİN ET MODU
    arenaActiveModeBadge.textContent = '🧠 TAHMİN ET (Rastgele Durur)';
    arenaActiveModeBadge.className = 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40';

    arenaTargetContainer.classList.add('hidden');
    arenaStandardSection.classList.add('hidden');
    arenaGuessSection.classList.remove('hidden');

    guessP1Header.textContent = p1;
    guessP2Header.textContent = p2;
    guessMysteryDisplay.textContent = '??.??.??';
    guessStatusNotice.textContent = '⏳ Sayaç gizlice sayıyor... İçinden dikkatle say!';
    guessStatusNotice.className = 'text-xs sm:text-sm font-semibold text-slate-300 mt-2 animate-pulse';

    guessInputBox.classList.add('hidden');
    guessWaitingMessage.classList.add('hidden');
    guessInputSec.value = '';
    guessInputMs.value = '';
    guessSubmitBtn.disabled = false;

    myGuess = null;
    opponentGuess = null;
    guessHasStopped = false;
    if (guessTimeoutId) clearTimeout(guessTimeoutId);

    if (robotPhysicalBtn) {
      robotPhysicalBtn.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 border-2 border-red-400 shadow-[0_6px_0_#7f1d1d,0_10px_20px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center font-black text-[11px] text-white uppercase tracking-wider select-none transform transition-all duration-150';
      robotPhysicalBtn.style.transform = 'translateY(0px)';
      robotBtnLabel.textContent = 'START';
      robotStatusNotice.textContent = 'Robot bekleniyor...';
      robotStatusNotice.className = 'text-[10px] text-amber-400 font-bold mt-3 text-center animate-pulse';
    }
    if (robotArmContainer) {
      robotArmContainer.style.top = '-240px';
      robotArmContainer.style.opacity = '0';
    }

    // Rastgele durma zamanı: İki oyuncuya da senkronize iletilen süre (veya yüksek entropili üretim)
    guessStopDurationMs = incomingGuessDurationMs || generateRandomGuessDuration();

  } else if (currentArenaMode === 'overstep') {
    // HEDEFİ AŞMA MODU
    arenaActiveModeBadge.textContent = '💣 HEDEFİ AŞMA (NO LOOK)';
    arenaActiveModeBadge.className = 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40';

    arenaTargetContainer.classList.add('hidden');
    arenaStandardSection.classList.add('hidden');
    arenaGuessSection.classList.add('hidden');
    arenaOverstepSection.classList.remove('hidden');

    overstepTargetDurationMs = incomingOverstepTargetMs || (pendingModeMatch ? pendingModeMatch.overstepTargetMs : generateRandomOverstepTarget());
    overstepTargetLimitLabel.textContent = `${(overstepTargetDurationMs / 1000).toFixed(2)} SANİYEYİ AŞMA`;

    overstepP1Name.textContent = checkIsMe(p1) ? `${p1} (Siz)` : p1;
    overstepP2Name.textContent = checkIsMe(p2) ? `${p2} (Siz)` : p2;
    overstepMysteryDisplay.textContent = '??.??.??';
    overstepMysteryDisplay.className = 'font-mono text-6xl sm:text-7xl font-black text-rose-300 tracking-tight my-3 animate-pulse';
    overstepTurnStatus.textContent = '⏳ Sayaç başlamaya hazırlanıyor...';
    overstepTurnStatus.className = 'p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs sm:text-sm font-bold text-rose-300 mt-3 text-center';

    overstepActionBtn.disabled = true;
    overstepActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl select-none bg-slate-800 text-slate-500 cursor-not-allowed';
    overstepBtnText.textContent = 'HAZIRLANIYOR...';
    overstepBtnIcon.setAttribute('data-lucide', 'flame');

    overstepPassCountVal = 0;
    overstepPassCount.textContent = '0 Pas';
    overstepLogList.innerHTML = '<div class="text-slate-500 italic text-center py-2">Henüz pas atılmadı...</div>';
    overstepCurrentTurn = p1;
    overstepCurrentTurnClientId = p1ClientId;
    overstepIsActive = false;

  } else {
    // STANDART MODLAR (TİMİ / NORMAL)
    if (currentArenaMode === 'timi') {
      arenaActiveModeBadge.textContent = '🙈 TİMİ MOD (NO LOOK)';
      arenaActiveModeBadge.className = 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40';
    } else {
      arenaActiveModeBadge.textContent = '👁️ NORMAL MOD (LOOK)';
      arenaActiveModeBadge.className = 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/40';
    }

    arenaTargetContainer.classList.remove('hidden');
    arenaStandardSection.classList.remove('hidden');
    arenaGuessSection.classList.add('hidden');
    arenaOverstepSection.classList.add('hidden');

    // Hedef Zaman Formatlama
    let tFormatted = '';
    if (targetTime.unit === 'second') {
      const tm = String(Math.floor(targetTime.main / 60)).padStart(2, '0');
      const ts = String(targetTime.main % 60).padStart(2, '0');
      const tms = String(targetTime.sub % 100).padStart(2, '0');
      tFormatted = `${tm}.${ts}.${tms} (${targetTime.main}.${tms} Saniye)`;
    } else if (targetTime.unit === 'millisecond') {
      tFormatted = `00.00.${String(targetTime.main % 100).padStart(2, '0')} (${targetTime.main} Milisaniye)`;
    }
    arenaTargetLabel.textContent = tFormatted;

    arenaP1Name.textContent = p1;
    arenaP2Name.textContent = p2;
    arenaP1Time.textContent = '00.00.00';
    arenaP2Time.textContent = '00.00.00';
    arenaP1Diff.textContent = 'Hazırlanıyor...';
    arenaP2Diff.textContent = 'Hazırlanıyor...';

    arenaActionBtn.disabled = true;
    arenaActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl select-none bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110';
    arenaBtnText.textContent = 'BAŞLAT';
    arenaBtnIcon.setAttribute('data-lucide', 'play');

    arenaAutoStartNotice.classList.add('hidden');
    if (arenaAutoStartInterval) clearInterval(arenaAutoStartInterval);
  }

  vsArenaModal.classList.remove('hidden');
  lucide.createIcons();

  if (isBotMatch) {
    arenaCountdownOverlay.classList.add('hidden');
    startPrepCountdown();
  } else {
    // 1. AŞAMA: 3 Saniyelik Eşleşme Geri Sayımı
    arenaCountdownOverlay.classList.remove('hidden');
    arenaPrepOverlay.classList.add('hidden');
    let count = 3;
    arenaCountdownNumber.textContent = count;
    arenaCountdownNumber.className = 'text-8xl sm:text-9xl font-black text-amber-400 animate-bounce';
    sounds.playBeep(440, 'triangle', 0.15, 0.3);

    const cInterval = setInterval(() => {
      count--;
      if (count > 0) {
        arenaCountdownNumber.textContent = count;
        sounds.playBeep(440, 'triangle', 0.15, 0.3);
      } else {
        clearInterval(cInterval);
        arenaCountdownOverlay.classList.add('hidden');
        // 2. AŞAMA: ÖZEL HAZIRLIK SAYACINI BAŞLAT!
        startPrepCountdown();
      }
    }, 1000);
  }
}

/* --- 2. AŞAMA: ÖZEL HAZIRLIK SAYACI (3.. 2.. 1.. -> DİREKT BAŞLAMA) --- */

function startPrepCountdown() {
  arenaPrepOverlay.classList.remove('hidden');
  let prepCount = 3;
  prepCountdownNumber.textContent = prepCount;
  sounds.playBeep(700, 'square', 0.12, 0.3);

  const pInterval = setInterval(() => {
    prepCount--;
    if (prepCount > 0) {
      prepCountdownNumber.textContent = prepCount;
      sounds.playBeep(700 + (3 - prepCount) * 120, 'square', 0.12, 0.3);
    } else if (prepCount === 0) {
      prepCountdownNumber.textContent = 'GO! ⚡';
      sounds.playStart();
    } else {
      clearInterval(pInterval);
      arenaPrepOverlay.classList.add('hidden');

      if (currentArenaMode === 'guess') {
        guessStatusNotice.textContent = '🤖 Robot butona uzanıyor...';
        animateRobotPress(() => {
          startGuessModeRunning();
        });
      } else if (currentArenaMode === 'overstep') {
        startOverstepModeRunning();
      } else {
        setupArenaReadyState();
      }
    }
  }, 1000);
}

/* --- 🤖 ROBOT ELİ ANİMASYONU VE BUTONA BASIŞ --- */

function animateRobotPress(onPressed) {
  if (!robotArmContainer || !robotPhysicalBtn) {
    if (onPressed) onPressed();
    return;
  }

  // Buton Başlangıç Hazırlığı
  robotPhysicalBtn.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 border-2 border-red-400 shadow-[0_6px_0_#7f1d1d,0_10px_20px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center font-black text-[11px] text-white uppercase tracking-wider select-none transform transition-all duration-150';
  robotPhysicalBtn.style.transform = 'translateY(0px)';
  robotBtnLabel.textContent = 'START';
  robotStatusNotice.textContent = '🤖 Robot butona uzanıyor...';
  robotStatusNotice.className = 'text-[10px] text-amber-400 font-bold mt-3 text-center animate-pulse';

  // 1. Adım: Robot kolu sahneye iner (Butonun hemen üstüne yaklaşır)
  robotArmContainer.style.opacity = '1';
  robotArmContainer.style.top = '-50px';
  sounds.playBeep(480, 'triangle', 0.12, 0.25);

  // 2. Adım: Hedefe kilitlenme ve aşağı sert basış
  setTimeout(() => {
    robotStatusNotice.textContent = '🎯 Butona basılıyor!';
    robotStatusNotice.className = 'text-[10px] text-red-400 font-black mt-3 text-center animate-bounce';
    
    // Parmak butona gömülür (İniş)
    robotArmContainer.style.top = '10px';

    setTimeout(() => {
      // 3. Adım: Butona tam basılma anı (TIK!)
      robotPhysicalBtn.style.transform = 'translateY(6px)';
      robotPhysicalBtn.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-700 border-2 border-emerald-300 shadow-[0_1px_0_#064e3b,0_0_25px_rgba(16,185,129,0.9)] flex flex-col items-center justify-center font-black text-[11px] text-white uppercase tracking-wider select-none';
      robotBtnLabel.textContent = 'ACTIVE';
      robotStatusNotice.textContent = '⚡ BAŞLATILDI!';
      robotStatusNotice.className = 'text-[10px] text-emerald-400 font-black mt-3 text-center';

      // Mekanik Tık / Hidrolik Ses
      sounds.playBeep(260, 'square', 0.08, 0.4);
      sounds.playStart();

      guessStatusNotice.textContent = '⏳ Sayaç başladı! İçinden dikkatle say!';
      guessStatusNotice.className = 'text-xs sm:text-sm font-semibold text-purple-300 mt-2 animate-pulse';

      // SAYAÇ TAM O BASIŞ ANINDA DİREKT BAŞLAR!
      if (onPressed) onPressed();

      // 4. Adım: Robot kolu yukarı çekilir
      setTimeout(() => {
        robotArmContainer.style.top = '-260px';
        robotArmContainer.style.opacity = '0';
      }, 500);

    }, 200);

  }, 650);
}

/* --- TAHMİN ET MODU AKIŞI --- */

function startGuessModeRunning() {
  guessHasStopped = false;
  arenaStartTime = performance.now();

  // Gizli sayaç rastgele zamanda kendiliğinden durur!
  guessTimeoutId = setTimeout(() => {
    triggerGuessStop();
  }, guessStopDurationMs);
}

function triggerGuessStop() {
  guessHasStopped = true;
  sounds.playStop();
  sounds.playBeep(700, 'sawtooth', 0.25, 0.3);

  // Robot Butonunu Durduruldu Haline Getir
  if (robotPhysicalBtn) {
    robotPhysicalBtn.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 shadow-inner flex flex-col items-center justify-center font-black text-[11px] text-slate-400 uppercase tracking-wider select-none';
    robotBtnLabel.textContent = 'STOP';
    robotStatusNotice.textContent = '🛑 Sayaç durdu!';
    robotStatusNotice.className = 'text-[10px] text-slate-400 font-bold mt-3 text-center';
  }

  guessMysteryDisplay.textContent = 'STOP! 🛑';
  guessStatusNotice.textContent = '🛑 SAYAÇ DURDU! Şimdi saydığın süreyi aşağıya yaz:';
  guessStatusNotice.className = 'text-xs sm:text-sm font-black text-amber-300 mt-2 animate-bounce';

  guessInputBox.classList.remove('hidden');
  guessInputSec.focus();
  lucide.createIcons();
}

guessSubmitBtn.addEventListener('click', () => {
  if (myGuess) return;

  const sec = Math.max(0, parseInt(guessInputSec.value) || 0);
  const ms = Math.max(0, parseInt(guessInputMs.value) || 0);
  const totalCentis = (sec * 100) + (ms % 100);

  const secStr = String(sec).padStart(2, '0');
  const msStr = String(ms % 100).padStart(2, '0');
  const formatted = `${secStr}.${msStr}`;

  myGuess = {
    sec: sec,
    ms: ms % 100,
    totalCentis: totalCentis,
    formatted: `${formatted} sn`
  };

  guessSubmitBtn.disabled = true;
  guessWaitingMessage.classList.remove('hidden');
  sounds.playBeep(600, 'sine', 0.1, 0.2);

  if (isBotMatch) {
    const actualCentis = Math.round(guessStopDurationMs / 10);
    let errorMargin = 0;

    if (currentBotDifficulty === 'easy') {
      errorMargin = Math.round((Math.random() - 0.5) * 260); // ±1.30s
    } else if (currentBotDifficulty === 'medium') {
      errorMargin = Math.round((Math.random() - 0.5) * 90);  // ±0.45s
    } else if (currentBotDifficulty === 'hard') {
      errorMargin = Math.round((Math.random() - 0.5) * 35);  // ±0.17s
    } else if (currentBotDifficulty === 'timi') {
      // 👑 TİMİ: Saniyeyi neredeyse milisaniyesine kadar bilir! (±0.03s)
      errorMargin = Math.round((Math.random() - 0.5) * 6);
    }

    const botCentis = Math.max(10, actualCentis + errorMargin);
    const botSec = Math.floor(botCentis / 100);
    const botMs = botCentis % 100;
    const botFormatted = `${String(botSec).padStart(2, '0')}.${String(botMs).padStart(2, '0')} sn`;

    opponentGuess = {
      sec: botSec,
      ms: botMs,
      totalCentis: botCentis,
      formatted: botFormatted
    };

    const bId = setTimeout(() => {
      checkGuessOutcome();
    }, 400);
    botTimeoutIds.push(bId);
  } else {
    broadcast({
      type: 'GUESS_SUBMIT',
      matchId: currentMatch.matchId,
      fromUsername: currentUsername,
      guess: myGuess
    });
    checkGuessOutcome();
  }
});

function checkGuessOutcome() {
  if (!myGuess || !opponentGuess || !currentMatch) return;

  const actualCentis = Math.round(guessStopDurationMs / 10);
  const actM = String(Math.floor(actualCentis / 6000)).padStart(2, '0');
  const actS = String(Math.floor((actualCentis % 6000) / 100)).padStart(2, '0');
  const actMs = String(actualCentis % 100).padStart(2, '0');
  
  let actualFormatted = '';
  if (actualCentis < 100) {
    actualFormatted = `00.00.${actMs} (${actualCentis} Milisaniye)`;
  } else {
    actualFormatted = `${actS}.${actMs} Saniye`;
  }

  // Süreyi Ortaya Çıkar!
  guessMysteryDisplay.textContent = `${actM}.${actS}.${actMs}`;
  guessStatusNotice.textContent = `🎯 Gerçek Durma Süresi: ${actualFormatted}`;
  guessStatusNotice.className = 'text-sm font-black text-brand-glow mt-2';

  const p1Diff = Math.abs(myGuess.totalCentis - actualCentis);
  const p2Diff = Math.abs(opponentGuess.totalCentis - actualCentis);

  arenaWinnerBanner.classList.remove('hidden');
  arenaP1AccuracyLabel.textContent = `${currentMatch.p1} TAHMİNİ: ${myGuess.formatted}`;
  arenaP2AccuracyLabel.textContent = `${currentMatch.p2} TAHMİNİ: ${opponentGuess.formatted}`;

  arenaP1Accuracy.textContent = `Fark: ${p1Diff} ms`;
  arenaP2Accuracy.textContent = `Fark: ${p2Diff} ms`;

  if (p1Diff < p2Diff) {
    arenaWinnerTitle.textContent = `🏆 ${currentMatch.p1} KAZANDI!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-yellow-400 drop-shadow-lg';
    arenaWinnerDesc.textContent = `Tebrikler! ${myGuess.formatted} tahmininizle gerçek süreye (${actualFormatted}) daha çok yaklaştınız! (Fark: ${p1Diff} ms vs ${p2Diff} ms)`;
    sounds.playMegaVictory();
    triggerMegaConfetti();

    if (isBotMatch && currentBotDifficulty === 'timi') {
      recordTimiDefeat(
        'guess',
        `Gerçek Süre: ${actualFormatted}`,
        myGuess.formatted,
        opponentGuess.formatted,
        `±${p1Diff} ms`,
        `±${p2Diff} ms`
      );
    }
  } else if (p2Diff < p1Diff) {
    arenaWinnerTitle.textContent = `💀 ${currentMatch.p2} KAZANDI!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-rose-400 drop-shadow-lg';
    arenaWinnerDesc.textContent = `Rakip ${opponentGuess.formatted} tahminiyle gerçek süreye (${actualFormatted}) daha yakın çıktı! (Rakip farkı: ${p2Diff} ms, Sizin farkınız: ${p1Diff} ms)`;
    sounds.playBeep(220, 'sawtooth', 0.3, 0.2);
  } else {
    arenaWinnerTitle.textContent = `🤝 BERABERE!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-cyber-neonBlue drop-shadow-lg';
    arenaWinnerDesc.textContent = `İnanılmaz! İki oyuncu da hedefe tam ${p1Diff} ms yakınlıkta tahmin yaptı!`;
    sounds.playGood();
  }
}

/* ==========================================================================
   HEDEFİ AŞMA MODU MOTORU (SIRAYLA BASMA & TAŞMA DÜELLOSU)
   ========================================================================== */

function checkIsMyTurn() {
  if (!currentMatch) return false;
  if (isBotMatch) {
    if (!overstepCurrentTurn) return true;
    return !overstepCurrentTurn.includes('BOT') && overstepCurrentTurn !== '🤖 TİMİ BOT';
  }
  if (currentMatch.p1ClientId && currentMatch.p2ClientId && overstepCurrentTurnClientId) {
    return overstepCurrentTurnClientId === myClientId;
  }
  return overstepCurrentTurn && (normalizeUser(overstepCurrentTurn) === normalizeUser(currentUsername));
}

function checkIsMe(playerName) {
  if (!playerName) return false;
  if (isBotMatch) {
    return !playerName.includes('BOT') && playerName !== '🤖 TİMİ BOT';
  }
  if (currentUsername && normalizeUser(playerName) === normalizeUser(currentUsername)) {
    return true;
  }
  if (currentMatch && currentMatch.p1 === playerName && currentMatch.p1ClientId === myClientId) {
    return true;
  }
  if (currentMatch && currentMatch.p2 === playerName && currentMatch.p2ClientId === myClientId) {
    return true;
  }
  return false;
}

function startOverstepModeRunning() {
  overstepIsActive = true;
  overstepAccumulatedMs = 0;
  overstepPassCountVal = 0;
  overstepTurnsHistory = [];
  overstepCurrentTurn = currentMatch.p1;
  overstepCurrentTurnClientId = currentMatch.p1ClientId;
  overstepSuspenseBox.classList.add('hidden');
  setupOverstepTurn(true);
}

function setupOverstepTurn(isInitialStart) {
  if (!isArenaActive || currentArenaMode !== 'overstep') return;
  if (overstepTurnCountdownInterval) clearInterval(overstepTurnCountdownInterval);
  if (overstepSuspenseInterval) clearInterval(overstepSuspenseInterval);

  overstepSuspenseBox.classList.add('hidden');
  overstepTurnState = 'ready';

  const isMyTurn = checkIsMyTurn();
  const isP1Turn = (currentMatch && currentMatch.p1ClientId && overstepCurrentTurnClientId)
    ? (overstepCurrentTurnClientId === currentMatch.p1ClientId)
    : (overstepCurrentTurn === currentMatch.p1);

  // P1 & P2 Rozetleri ve Işık Göstergeleri
  if (isP1Turn) {
    overstepP1Badge.className = 'flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/20 transition-all';
    overstepP1Dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping';
    overstepP1Name.className = 'font-black text-emerald-300';

    overstepP2Badge.className = 'flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 transition-all opacity-50';
    overstepP2Dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-600';
    overstepP2Name.className = 'font-bold text-slate-400';
  } else {
    overstepP2Badge.className = 'flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/20 transition-all';
    overstepP2Dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping';
    overstepP2Name.className = 'font-black text-emerald-300';

    overstepP1Badge.className = 'flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 transition-all opacity-50';
    overstepP1Dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-600';
    overstepP1Name.className = 'font-bold text-slate-400';
  }

  overstepMysteryDisplay.textContent = '??.??.??';
  overstepMysteryDisplay.className = 'font-mono text-6xl sm:text-7xl font-black text-rose-300 tracking-tight my-3 animate-pulse';

  if (isMyTurn) {
    // SIRA SİZDE (KULLANICI)
    if (overstepOpponentLiveBox) overstepOpponentLiveBox.classList.add('hidden');
    if (overstepSpaceHint) overstepSpaceHint.classList.remove('hidden');

    overstepActionBtn.classList.remove('hidden');
    overstepActionBtn.disabled = false;
    overstepActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl select-none bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-500/30 cursor-pointer animate-pulse';
    overstepBtnText.textContent = '▶️ SAYACI BAŞLAT';
    overstepBtnIcon.setAttribute('data-lucide', 'play');

    if (isInitialStart) {
      overstepTurnStatus.textContent = '🟢 SIRA SİZDE! Sayacı başlatmak için 10 saniyeniz var.';
    } else {
      overstepTurnStatus.textContent = '👉 Rakibiniz sırasını kullandı, sıra sizde!';
    }
    overstepTurnStatus.className = 'p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs sm:text-sm font-black text-emerald-300 mt-3 animate-pulse text-center';

    // 10 Saniye Kuralı: Sıra sizdeyken 10 saniye geri sayar!
    overstepAutoPassNotice.classList.remove('hidden');
    overstepTurnRemaining = 10;
    overstepTurnTimer.textContent = overstepTurnRemaining;

    overstepTurnCountdownInterval = setInterval(() => {
      overstepTurnRemaining--;
      overstepTurnTimer.textContent = overstepTurnRemaining;
      if (overstepTurnRemaining <= 0) {
        clearInterval(overstepTurnCountdownInterval);
        startOverstepRunningTimer();
        setTimeout(() => {
          stopOverstepRunningTimer();
        }, 400);
      }
    }, 1000);

  } else {
    // SIRA RAKİPTE / BOTTA (CANLI AYNA BUTONU DEVREYE GİRER)
    overstepAutoPassNotice.classList.add('hidden');
    overstepActionBtn.classList.add('hidden');
    if (overstepSpaceHint) overstepSpaceHint.classList.add('hidden');

    if (overstepOpponentLiveBox) {
      overstepOpponentLiveBox.classList.remove('hidden');
      overstepOpponentLiveBox.className = 'w-full p-4 rounded-2xl bg-slate-900/95 border-2 border-slate-700 text-center flex flex-col items-center justify-center transition-all duration-200';
      overstepOpponentLiveButton.className = 'w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 shadow-[0_6px_0_#1e293b] flex flex-col items-center justify-center font-black text-[10px] text-slate-400 uppercase tracking-wider transition-all duration-150 select-none transform translate-y-0';
      overstepOpponentLiveLabel.textContent = 'BEKLİYOR';
      overstepOpponentLiveStatus.textContent = `${overstepCurrentTurn} sayacı başlatmayı bekliyor...`;
      overstepOpponentLiveStatus.className = 'text-xs font-bold text-slate-400 mt-2 animate-pulse';
    }

    overstepTurnStatus.textContent = `⏳ SIRA RAKİPTE (${overstepCurrentTurn})... Canlı butondan takip edin!`;
    overstepTurnStatus.className = 'p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm font-semibold text-slate-400 mt-3 text-center';

    if (isBotMatch) {
      // 🤖 BOTUN HAMLESİ
      let thinkMin = 1000, thinkMax = 2000;
      if (currentBotDifficulty === 'timi') { thinkMin = 400; thinkMax = 900; }
      else if (currentBotDifficulty === 'hard') { thinkMin = 700; thinkMax = 1400; }
      else if (currentBotDifficulty === 'easy') { thinkMin = 1500; thinkMax = 3000; }

      const botThinkTime = Math.floor(Math.random() * (thinkMax - thinkMin)) + thinkMin;

      const bId = setTimeout(() => {
        if (!isArenaActive || currentArenaMode !== 'overstep' || !isBotMatch) return;
        if (overstepTurnState !== 'ready') return;

        // 1. Bot butona basmaya başlar!
        overstepTurnState = 'running';
        overstepTurnStartTimestamp = performance.now();

        if (overstepOpponentLiveBox && overstepOpponentLiveButton) {
          overstepOpponentLiveBox.className = 'w-full p-4 rounded-2xl bg-gradient-to-b from-red-950/80 to-slate-950 border-2 border-red-500 shadow-2xl shadow-red-500/50 text-center flex flex-col items-center justify-center transition-all duration-150 animate-pulse';
          overstepOpponentLiveButton.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 border-2 border-red-400 shadow-[0_1px_0_#7f1d1d,0_0_25px_rgba(239,68,68,0.9)] flex flex-col items-center justify-center font-black text-[10px] text-white uppercase tracking-wider transition-all duration-100 select-none transform translate-y-1.5';
          overstepOpponentLiveLabel.textContent = 'BASILI! 🔥';
          overstepOpponentLiveStatus.textContent = '🔥 TİMİ BOT ŞU AN BASIYOR! (İçinden süreyi say!)';
          overstepOpponentLiveStatus.className = 'text-xs font-black text-red-400 mt-2 animate-bounce';
        }
        overstepTurnStatus.textContent = '🔥 TİMİ BOT sayacı başlattı... İçinden süreyi say!';
        overstepTurnStatus.className = 'p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs sm:text-sm font-black text-rose-300 mt-3 animate-pulse text-center';
        sounds.playStart();

        // Botun basılı tutma süresi hesabı (Zorluk seviyesine göre akıllı strateji):
        const remainingMs = overstepTargetDurationMs - overstepAccumulatedMs;
        let botHoldMs = 0;

        if (currentBotDifficulty === 'timi') {
          // 👑 TİMİ: KUSURSUZ VE AŞIRI ZOR MATEMATİKSEL STRATEJİ
          if (remainingMs > 2500) {
            botHoldMs = Math.floor(Math.random() * 600) + 1200; // 1.2s - 1.8s
          } else if (remainingMs > 1200) {
            botHoldMs = Math.floor(Math.random() * 400) + 600;  // 0.6s - 1.0s
          } else if (remainingMs > 400) {
            botHoldMs = Math.floor(Math.random() * 200) + 200;  // 200ms - 400ms
          } else if (remainingMs > 120) {
            botHoldMs = Math.min(remainingMs - 20, Math.floor(Math.random() * 50) + 60);
          } else {
            botHoldMs = Math.max(15, Math.min(remainingMs - 10, 35));
          }
        } else if (currentBotDifficulty === 'hard') {
          // ZOR: Çok tecrübeli bot
          if (remainingMs > 2500) {
            botHoldMs = Math.floor(Math.random() * 700) + 800;
          } else if (remainingMs > 1200) {
            botHoldMs = Math.floor(Math.random() * 400) + 450;
          } else if (remainingMs > 500) {
            botHoldMs = Math.floor(Math.random() * 250) + 200;
          } else {
            if (Math.random() < 0.85) {
              botHoldMs = Math.floor(Math.random() * 120) + 80;
            } else {
              botHoldMs = remainingMs + 60;
            }
          }
        } else if (currentBotDifficulty === 'medium') {
          // ORTA: Standart bot
          if (remainingMs > 2500) {
            botHoldMs = Math.floor(Math.random() * 700) + 700;
          } else if (remainingMs > 1400) {
            botHoldMs = Math.floor(Math.random() * 500) + 400;
          } else if (remainingMs > 600) {
            botHoldMs = Math.floor(Math.random() * 300) + 250;
          } else {
            if (Math.random() < 0.65) {
              botHoldMs = Math.floor(Math.random() * 150) + 120;
            } else {
              botHoldMs = remainingMs + Math.floor(Math.random() * 180) + 40;
            }
          }
        } else {
          // KOLAY: Acemi bot
          if (remainingMs > 2000) {
            botHoldMs = Math.floor(Math.random() * 1000) + 700;
          } else if (remainingMs > 1000) {
            botHoldMs = Math.floor(Math.random() * 600) + 500;
          } else {
            if (Math.random() < 0.50) {
              botHoldMs = Math.floor(Math.random() * 250) + 150;
            } else {
              botHoldMs = remainingMs + Math.floor(Math.random() * 300) + 50;
            }
          }
        }

        const bStopId = setTimeout(() => {
          if (!isArenaActive || currentArenaMode !== 'overstep' || !isBotMatch) return;
          if (overstepTurnState !== 'running') return;

          // 2. Bot butonu bırakır!
          if (overstepOpponentLiveBox && overstepOpponentLiveButton) {
            overstepOpponentLiveBox.className = 'w-full p-4 rounded-2xl bg-slate-900/95 border-2 border-slate-700 text-center flex flex-col items-center justify-center transition-all duration-200';
            overstepOpponentLiveButton.className = 'w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500 shadow-[0_6px_0_#064e3b] flex flex-col items-center justify-center font-black text-[10px] text-emerald-400 uppercase tracking-wider transition-all duration-150 select-none transform translate-y-0';
            overstepOpponentLiveLabel.textContent = 'DURDURDU 🛑';
            overstepOpponentLiveStatus.textContent = '🛑 TİMİ BOT BUTONU BIRAKTI VE DURDURDU!';
            overstepOpponentLiveStatus.className = 'text-xs font-bold text-emerald-400 mt-2';
          }
          sounds.playStop();

          const newTotalMs = overstepAccumulatedMs + botHoldMs;
          const { formatted } = get2DigitTime(newTotalMs);
          const isBust = Math.floor(newTotalMs / 10) * 10 > overstepTargetDurationMs;

          runOverstepSuspenseEvaluation('🤖 TİMİ BOT', newTotalMs, formatted, isBust);
        }, botHoldMs);

        botTimeoutIds.push(bStopId);
      }, botThinkTime);

      botTimeoutIds.push(bId);
    }
  }

  lucide.createIcons();
}

function startOverstepRunningTimer() {
  if (!isArenaActive || currentArenaMode !== 'overstep') return;
  if (!checkIsMyTurn()) return;
  if (overstepTurnState !== 'ready') return;

  if (overstepTurnCountdownInterval) clearInterval(overstepTurnCountdownInterval);
  overstepAutoPassNotice.classList.add('hidden');

  overstepTurnState = 'running';
  overstepTurnStartTimestamp = performance.now();

  overstepActionBtn.disabled = false;
  overstepActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl select-none bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white hover:brightness-110 shadow-rose-500/30 cursor-pointer animate-pulse';
  overstepBtnText.textContent = '⏹️ DURDUR & PASLA!';
  overstepBtnIcon.setAttribute('data-lucide', 'square');

  overstepTurnStatus.textContent = '🔥 Sayaç çalışıyor... İçinden dikkatle say, hedefi aşmadan durdur!';
  overstepTurnStatus.className = 'p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-xs sm:text-sm font-black text-rose-300 mt-3 animate-pulse text-center';

  sounds.playStart();
  lucide.createIcons();

  if (!isBotMatch) {
    broadcast({
      type: 'OVERSTEP_TURN_STARTED',
      matchId: currentMatch.matchId,
      fromUsername: currentUsername,
      fromClientId: myClientId
    });
  }
}

function stopOverstepRunningTimer() {
  if (!isArenaActive || currentArenaMode !== 'overstep') return;
  if (!checkIsMyTurn()) return;
  if (overstepTurnState !== 'running') return;

  overstepTurnState = 'evaluating';

  const turnElapsedMs = Math.round(performance.now() - overstepTurnStartTimestamp);
  const newTotalMs = overstepAccumulatedMs + turnElapsedMs;
  const { formatted } = get2DigitTime(newTotalMs);
  const newTotalMsDisplay = Math.floor(newTotalMs / 10) * 10; // Ekranda görünen değere yuvarla (centisaniye)
  const isBust = newTotalMsDisplay > overstepTargetDurationMs;

  overstepActionBtn.disabled = true;
  overstepActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 shadow-xl select-none bg-slate-800 text-slate-500 cursor-not-allowed';
  overstepBtnText.textContent = '⏳ DEĞERLENDİRİLİYOR...';
  overstepBtnIcon.setAttribute('data-lucide', 'loader');
  lucide.createIcons();

  sounds.playStop();

  const activePlayerName = currentUsername || (currentMatch ? currentMatch.p1 : 'Oyuncu');

  if (!isBotMatch) {
    broadcast({
      type: 'OVERSTEP_TURN_STOPPED',
      matchId: currentMatch.matchId,
      fromUsername: activePlayerName,
      fromClientId: myClientId,
      newTotalMs: newTotalMs,
      formatted: formatted,
      isBust: isBust
    });
  }

  runOverstepSuspenseEvaluation(activePlayerName, newTotalMs, formatted, isBust);
}

function runOverstepSuspenseEvaluation(player, newTotalMs, formatted, isBust) {
  if (overstepTurnCountdownInterval) clearInterval(overstepTurnCountdownInterval);
  if (overstepSuspenseInterval) clearInterval(overstepSuspenseInterval);

  overstepTurnState = 'evaluating';
  overstepAutoPassNotice.classList.add('hidden');
  overstepActionBtn.disabled = true;
  overstepActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 shadow-xl select-none bg-slate-800 text-slate-500 cursor-not-allowed';
  overstepBtnText.textContent = '⏳ DEĞERLENDİRİLİYOR...';
  overstepBtnIcon.setAttribute('data-lucide', 'loader');
  lucide.createIcons();

  // 2 Saniyelik Gerilim Sayacı Başlatılır
  overstepSuspenseBox.classList.remove('hidden');
  let suspenseCount = 2;
  overstepSuspenseNumber.textContent = suspenseCount;
  overstepMysteryDisplay.textContent = '??.??.??';
  overstepMysteryDisplay.className = 'font-mono text-6xl sm:text-7xl font-black text-purple-300 tracking-tight my-3 animate-pulse';

  const isMe = checkIsMe(player);
  if (isMe) {
    overstepTurnStatus.textContent = '⏳ Sonuç değerlendiriliyor... Hedef aşıldı mı?';
  } else {
    overstepTurnStatus.textContent = `⏳ ${player} oyuncusunun sonucu değerlendiriliyor...`;
  }
  overstepTurnStatus.className = 'p-3.5 rounded-xl bg-purple-500/20 border border-purple-500/50 text-xs sm:text-sm font-bold text-purple-300 mt-3 text-center animate-pulse';

  sounds.playBeep(580, 'sine', 0.12, 0.25);

  overstepSuspenseInterval = setInterval(() => {
    suspenseCount--;
    if (suspenseCount > 0) {
      overstepSuspenseNumber.textContent = suspenseCount;
      sounds.playBeep(650, 'sine', 0.12, 0.25);
    } else {
      clearInterval(overstepSuspenseInterval);
      overstepSuspenseBox.classList.add('hidden');

      // SONUÇ AÇIKLANIYOR! (Saniyeler gizli kalır!)
      if (!isBust) {
        // HEDEFİ AŞMADI - BAŞARILI!
        overstepAccumulatedMs = newTotalMs;
        overstepPassCountVal++;
        overstepTurnsHistory.push({ passNum: overstepPassCountVal, player: player, formattedTime: formatted, isBust: false });
        addOverstepLogItem(player);

        if (isMe) {
          overstepTurnStatus.textContent = '🎉 TEBRİKLER AŞMAMAYI BAŞARDINIZ!';
          overstepTurnStatus.className = 'p-3.5 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/60 text-xs sm:text-sm font-black text-emerald-300 mt-3 text-center animate-bounce';
          sounds.playGood();
        } else {
          overstepTurnStatus.textContent = `✅ Rakibiniz (${player}) hedefi aşmadı! Sıra size geçiyor...`;
          overstepTurnStatus.className = 'p-3.5 rounded-xl bg-purple-500/20 border-2 border-purple-500/60 text-xs sm:text-sm font-black text-purple-300 mt-3 text-center';
          sounds.playBeep(520, 'triangle', 0.15, 0.2);
        }

        // 1.8 saniye sonra sırayı diğer oyuncuya aktar
        setTimeout(() => {
          if (!isArenaActive || currentArenaMode !== 'overstep') return;
          const isP1JustPlayed = (currentMatch.p1ClientId && overstepCurrentTurnClientId)
            ? (overstepCurrentTurnClientId === currentMatch.p1ClientId)
            : (player === currentMatch.p1);
          
          overstepCurrentTurn = isP1JustPlayed ? currentMatch.p2 : currentMatch.p1;
          overstepCurrentTurnClientId = isP1JustPlayed ? currentMatch.p2ClientId : currentMatch.p1ClientId;
          setupOverstepTurn(false);
        }, 1800);

      } else {
        // HEDEF AŞILDI VE ELENDİ!
        handleOverstepOutcome(player, newTotalMs, formatted, isMe);
      }
    }
  }, 1000);
}

function addOverstepLogItem(player) {
  if (overstepLogList.children.length === 1 && overstepLogList.children[0].classList.contains('italic')) {
    overstepLogList.innerHTML = '';
  }
  const item = document.createElement('div');
  item.className = 'flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs animate-fadeIn';
  item.innerHTML = `
    <div class="flex items-center space-x-2">
      <span class="text-slate-500 font-mono font-bold">#${overstepPassCountVal}</span>
      <span class="font-bold text-slate-200">${player}</span>
    </div>
    <div class="flex items-center space-x-2">
      <span class="font-mono text-slate-500 font-bold">??.?? sn</span>
      <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black">AŞMADI ✅</span>
    </div>
  `;
  overstepLogList.prepend(item);
  overstepPassCount.textContent = `${overstepPassCountVal} Pas`;
}

function renderFullOverstepHistory() {
  overstepLogList.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'text-[11px] font-black uppercase text-amber-400 mb-2 tracking-wider text-center';
  header.textContent = '📋 TÜM TURLARIN GERÇEK SÜRE DÖKÜMÜ:';
  overstepLogList.appendChild(header);

  overstepTurnsHistory.forEach(item => {
    const row = document.createElement('div');
    row.className = `flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono my-1 animate-fadeIn ${item.isBust ? 'bg-rose-950/80 border-rose-500/60 shadow-lg shadow-rose-950/50' : 'bg-slate-950/80 border-slate-800'}`;
    row.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-slate-400 font-bold">Tur #${item.passNum}</span>
        <span class="font-bold text-white">${item.player}</span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="font-bold ${item.isBust ? 'text-rose-400 font-mono text-sm' : 'text-emerald-400'}">${item.formattedTime} sn</span>
        <span class="text-[10px] px-2 py-0.5 rounded font-black ${item.isBust ? 'bg-rose-500/30 text-rose-300' : 'bg-emerald-500/20 text-emerald-400'}">
          ${item.isBust ? '💥 ELENDİ (HEDEFİ AŞTI)' : 'AŞMADI ✅'}
        </span>
      </div>
    `;
    overstepLogList.appendChild(row);
  });
}

function handleOverstepAction() {
  if (!overstepIsActive || !currentMatch || currentArenaMode !== 'overstep') return;
  if (!checkIsMyTurn()) return;

  if (overstepTurnState === 'ready') {
    startOverstepRunningTimer();
  } else if (overstepTurnState === 'running') {
    stopOverstepRunningTimer();
  }
}

function handleOverstepOutcome(bustedUser, elapsedMs, formatted, isMeBusted) {
  if (overstepTurnCountdownInterval) clearInterval(overstepTurnCountdownInterval);
  if (overstepSuspenseInterval) clearInterval(overstepSuspenseInterval);
  overstepSuspenseBox.classList.add('hidden');
  overstepAutoPassNotice.classList.add('hidden');
  if (overstepOpponentLiveBox) overstepOpponentLiveBox.classList.add('hidden');
  if (overstepSpaceHint) overstepSpaceHint.classList.add('hidden');
  overstepActionBtn.classList.remove('hidden');

  overstepTurnState = 'ended';
  overstepIsActive = false;

  // Son elenen turu da geçmişe ekle ve TÜM TURLARI AÇIĞA ÇIKAR
  overstepTurnsHistory.push({ passNum: overstepPassCountVal + 1, player: bustedUser, formattedTime: formatted, isBust: true });
  renderFullOverstepHistory();

  overstepMysteryDisplay.textContent = formatted;
  overstepMysteryDisplay.className = 'font-mono text-6xl sm:text-7xl font-black text-rose-500 tracking-tight my-3';

  overstepActionBtn.disabled = true;
  overstepActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 shadow-xl select-none bg-slate-800 text-slate-500 cursor-not-allowed';
  overstepBtnText.textContent = 'OYUN BİTTİ';
  lucide.createIcons();

  const targetSecStr = (overstepTargetDurationMs / 1000).toFixed(2);
  const elapsedMsDisplay = Math.floor(elapsedMs / 10) * 10; // Ekranda ne görünüyorsa ona göre fark hesapla
  const diffMs = elapsedMsDisplay - overstepTargetDurationMs;

  arenaWinnerBanner.classList.remove('hidden');
  arenaP1AccuracyLabel.textContent = 'HEDEF LİMİTİ';
  arenaP2AccuracyLabel.textContent = 'ELENME ANI';
  arenaP1Accuracy.textContent = `${targetSecStr} sn`;
  arenaP2Accuracy.textContent = `${formatted} sn`;

  if (isMeBusted) {
    arenaWinnerTitle.textContent = '💥 SÜREYİ AŞTINIZ VE ELENDİNİZ!';
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-rose-500 drop-shadow-lg animate-bounce';
    arenaWinnerDesc.textContent = `Hedef limit ${targetSecStr} sn idi. ${formatted} saniyede basarak hedefi +${diffMs} ms aştınız ve ELENDİNİZ! Aşağıdan tüm turların sürelerini inceleyebilirsiniz.`;
    overstepTurnStatus.textContent = `💥 SÜREYİ AŞTINIZ VE ELENDİNİZ! (+${diffMs} ms fazla)`;
    overstepTurnStatus.className = 'p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-xs sm:text-sm font-black text-rose-400 mt-3 text-center animate-bounce';
    sounds.playBeep(180, 'sawtooth', 0.4, 0.3);
  } else {
    arenaWinnerTitle.textContent = '👑 TEBRİKLER KAZANDINIZ!';
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-lg animate-bounce';
    arenaWinnerDesc.textContent = `Tebrikler! ${bustedUser} süreyi ${formatted} saniyede durdurup ${targetSecStr} sn sınırını aştı ve ELENDİ! Aşağıdan tüm turların dökümünü görebilirsiniz.`;
    overstepTurnStatus.textContent = `👑 TEBRİKLER KAZANDINIZ! (${bustedUser} süreyi aşıp elendi)`;
    overstepTurnStatus.className = 'p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-xs sm:text-sm font-black text-emerald-300 mt-3 text-center';
    sounds.playMegaVictory();
    triggerMegaConfetti();

    if (isBotMatch && currentBotDifficulty === 'timi') {
      recordTimiDefeat(
        'overstep',
        `Hedef Sınırı: ${targetSecStr} sn (${overstepPassCountVal} Pas)`,
        'Aşmadı ✅',
        `${formatted} sn`,
        'Hayatta kaldı',
        `+${diffMs} ms Elendi`
      );
    }
  }
}

overstepActionBtn.addEventListener('click', handleOverstepAction);

/* --- STANDART 1v1 MODLARI (TİMİ / NORMAL) AKIŞI --- */

function setupArenaReadyState() {
  arenaActionBtn.disabled = false;
  arenaBtnText.textContent = 'BAŞLAT';
  arenaBtnIcon.setAttribute('data-lucide', 'play');
  arenaP1Diff.textContent = 'Başlatmayı bekliyor...';
  lucide.createIcons();

  // 10 Saniye Otomatik Başlama Kuralı
  arenaAutoStartNotice.classList.remove('hidden');
  arenaAutoStartRemaining = 10;
  arenaAutoStartTimer.textContent = arenaAutoStartRemaining;

  if (arenaAutoStartInterval) clearInterval(arenaAutoStartInterval);
  arenaAutoStartInterval = setInterval(() => {
    arenaAutoStartRemaining--;
    arenaAutoStartTimer.textContent = arenaAutoStartRemaining;
    if (arenaAutoStartRemaining <= 0) {
      clearInterval(arenaAutoStartInterval);
      startArenaRunning();
    }
  }, 1000);
}

function startArenaRunning() {
  if (arenaRunning || arenaStopped) return;
  if (arenaAutoStartInterval) clearInterval(arenaAutoStartInterval);
  arenaAutoStartNotice.classList.add('hidden');

  arenaRunning = true;
  arenaStartTime = performance.now();
  arenaActionBtn.disabled = false;
  arenaBtnText.textContent = 'DURDUR';
  arenaBtnIcon.setAttribute('data-lucide', 'square');
  arenaActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl select-none bg-gradient-to-r from-red-500 to-rose-600 text-white hover:brightness-110';
  arenaP1Diff.textContent = currentArenaMode === 'timi' ? 'Sayıyor (İçinden Say!)...' : 'Sayıyor...';
  sounds.playStart();
  lucide.createIcons();

  arenaRafId = requestAnimationFrame(updateArenaTimer);

  if (isBotMatch) {
    const target = currentMatch.targetTime;
    let targetCentiseconds = 0;
    if (target.unit === 'second') {
      targetCentiseconds = target.main * 100 + (target.sub % 100);
    } else if (target.unit === 'millisecond') {
      targetCentiseconds = target.main;
    }
    const targetMs = targetCentiseconds * 10;

    let botDiffMs = 0;
    if (currentBotDifficulty === 'easy') {
      botDiffMs = (currentArenaMode === 'normal') 
        ? Math.round((Math.random() - 0.5) * 600)  // ±300ms
        : Math.round((Math.random() - 0.5) * 1200); // ±600ms
    } else if (currentBotDifficulty === 'medium') {
      botDiffMs = (currentArenaMode === 'normal')
        ? Math.round((Math.random() - 0.5) * 160)  // ±80ms
        : Math.round((Math.random() - 0.5) * 350);  // ±175ms
    } else if (currentBotDifficulty === 'hard') {
      botDiffMs = (currentArenaMode === 'normal')
        ? Math.round((Math.random() - 0.5) * 50)   // ±25ms
        : Math.round((Math.random() - 0.5) * 110);  // ±55ms
    } else if (currentBotDifficulty === 'timi') {
      // 👑 TİMİ: AŞIRI AMA AŞIRI ZOR (Neredeyse 0 ms hata!)
      botDiffMs = (currentArenaMode === 'normal')
        ? Math.round((Math.random() - 0.5) * 6)    // ±3ms
        : Math.round((Math.random() - 0.5) * 20);   // ±10ms
    }

    const botFinalElapsed = Math.max(100, targetMs + botDiffMs);
    const { m, s, ms2, formatted } = get2DigitTime(botFinalElapsed);
    const actualUnits = (m * 60 + s) * 100 + ms2;
    const rawDiff = actualUnits - targetCentiseconds;
    const diff = Math.abs(rawDiff);
    const sign = rawDiff >= 0 ? '+' : '-';
    const diffText = `${sign}${diff} ms`;
    const baseUnits = Math.max(targetCentiseconds, 10);
    const accuracy = Math.max(0, 100 - ((diff / baseUnits) * 100)).toFixed(1);

    currentMatch.p2Result = {
      elapsed: botFinalElapsed,
      formatted: formatted,
      diff: diff,
      diffText: diffText,
      accuracy: accuracy
    };

    arenaP2Diff.textContent = 'Bot sayıyor...';
    arenaP2Time.textContent = currentArenaMode === 'timi' ? '??.??.??' : 'Sayıyor...';
  }
}

function updateArenaTimer() {
  if (!arenaRunning || arenaStopped) return;
  arenaElapsedTime = performance.now() - arenaStartTime;
  const { formatted } = get2DigitTime(arenaElapsedTime);

  // TİMİ MOD (NO LOOK) Kontrolü: Kullanıcı saniyeyi göremez, ??.??.?? gösterilir!
  if (currentArenaMode === 'timi') {
    arenaP1Time.textContent = '??.??.??';
  } else {
    arenaP1Time.textContent = formatted;
  }

  arenaRafId = requestAnimationFrame(updateArenaTimer);
}

function handleArenaAction() {
  if (!isArenaActive || currentArenaMode === 'guess') return;

  // Kullanıcı henüz başlatmadıysa (10 sn bekleme süresindeyse): BAŞLAT
  if (!arenaRunning && !arenaStopped) {
    startArenaRunning();
    return;
  }

  // Kronometre çalışıyorsa: DURDUR
  if (arenaRunning && !arenaStopped) {
    arenaStopped = true;
    arenaRunning = false;
    cancelAnimationFrame(arenaRafId);
    if (arenaAutoStartInterval) clearInterval(arenaAutoStartInterval);

    arenaActionBtn.disabled = true;
    arenaActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 shadow-xl select-none bg-slate-800 text-slate-500 cursor-not-allowed';
    arenaBtnText.textContent = 'DURDURULDU';
    arenaBtnIcon.setAttribute('data-lucide', 'check');
    lucide.createIcons();
    sounds.playStop();

    const finalElapsed = performance.now() - arenaStartTime;
    const { m, s, ms2, formatted } = get2DigitTime(finalElapsed);

    // TİMİ modunda bile durdurulduğu an gerçek süre ortaya çıkar!
    arenaP1Time.textContent = formatted;

    const target = currentMatch.targetTime;
    let diff = 0;
    let diffText = '';
    let targetCentiseconds = 0;

    if (target.unit === 'second') {
      const actualUnits = (m * 60 + s) * 100 + ms2;
      const targetUnits = target.main * 100 + (target.sub % 100);
      targetCentiseconds = targetUnits;
      const rawDiff = actualUnits - targetUnits;
      diff = Math.abs(rawDiff);
      const sign = rawDiff >= 0 ? '+' : '-';
      diffText = `${sign}${diff} ms`;
    } else if (target.unit === 'millisecond') {
      const actualUnits = (m * 60 + s) * 100 + ms2;
      const targetUnits = target.main;
      targetCentiseconds = targetUnits;
      const rawDiff = actualUnits - targetUnits;
      diff = Math.abs(rawDiff);
      const sign = rawDiff >= 0 ? '+' : '-';
      diffText = `${sign}${diff} ms`;
    }

    arenaP1Diff.textContent = `Fark: ${diffText}`;

    // Başarı Oranı (%) Hesaplama
    const baseUnits = Math.max(targetCentiseconds, 10);
    const accuracy = Math.max(0, 100 - ((diff / baseUnits) * 100)).toFixed(1);

    currentMatch.p1Result = {
      elapsed: finalElapsed,
      formatted: formatted,
      diff: diff,
      diffText: diffText,
      accuracy: accuracy
    };

    if (isBotMatch && currentMatch.p2Result) {
      arenaP2Time.textContent = currentMatch.p2Result.formatted;
      arenaP2Diff.textContent = `Fark: ${currentMatch.p2Result.diffText}`;
    }

    if (!isBotMatch) {
      broadcast({
        type: 'ARENA_STOP',
        matchId: currentMatch.matchId,
        result: currentMatch.p1Result
      });
    }

    checkArenaOutcome();
  }
}

arenaActionBtn.addEventListener('click', handleArenaAction);

function checkArenaOutcome() {
  if (!currentMatch || !currentMatch.p1Result || !currentMatch.p2Result) return;

  cancelAnimationFrame(arenaRafId);
  const p1 = currentMatch.p1Result;
  const p2 = currentMatch.p2Result;

  arenaWinnerBanner.classList.remove('hidden');

  arenaP1AccuracyLabel.textContent = 'Sizin Başarı Oranınız';
  arenaP2AccuracyLabel.textContent = isBotMatch ? 'TİMİ BOT Başarı Oranı' : 'Rakip Başarı Oranı';
  arenaP1Accuracy.textContent = `%${p1.accuracy}`;
  arenaP2Accuracy.textContent = `%${p2.accuracy}`;

  if (p1.diff < p2.diff) {
    arenaWinnerTitle.textContent = `🏆 ${currentMatch.p1} KAZANDI!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-yellow-400 drop-shadow-lg';
    arenaWinnerDesc.textContent = `Tebrikler! Hedefe ${p1.diff} ms farkla (${p1.accuracy}% başarı) daha çok yaklaştınız (${currentMatch.p2}: ${p2.diff} ms, %${p2.accuracy}).`;
    sounds.playMegaVictory();
    triggerMegaConfetti();

    if (isBotMatch && currentBotDifficulty === 'timi') {
      const target = currentMatch.targetTime;
      const targetStr = target.unit === 'second' 
        ? `${target.main}.${String(target.sub).padStart(2, '0')} sn`
        : `${target.main} ms`;
      recordTimiDefeat(
        currentArenaMode,
        `Hedef: ${targetStr}`,
        p1.formatted,
        p2.formatted,
        p1.diffText,
        p2.diffText
      );
    }
  } else if (p2.diff < p1.diff) {
    arenaWinnerTitle.textContent = `💀 ${currentMatch.p2} KAZANDI!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-rose-400 drop-shadow-lg';
    arenaWinnerDesc.textContent = `${currentMatch.p2} ${p2.diff} ms farkla (${p2.accuracy}% başarı) kazandı (Siz: ${p1.diff} ms, %${p1.accuracy}).`;
    sounds.playBeep(220, 'sawtooth', 0.3, 0.2);
  } else {
    arenaWinnerTitle.textContent = `🤝 BERABERE!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-cyber-neonBlue drop-shadow-lg';
    arenaWinnerDesc.textContent = `İki taraf da tam olarak ${p1.diff} ms fark (%${p1.accuracy}) ile durdurdu!`;
    sounds.playGood();
  }
}

const closeVsArenaBtn = document.getElementById('closeVsArenaBtn');
if (closeVsArenaBtn) {
  closeVsArenaBtn.addEventListener('click', () => {
    arenaExitBtn.click();
  });
}

arenaExitBtn.addEventListener('click', () => {
  cancelAnimationFrame(arenaRafId);
  clearBotTimers();
  if (arenaAutoStartInterval) clearInterval(arenaAutoStartInterval);
  if (guessTimeoutId) clearTimeout(guessTimeoutId);
  if (overstepTurnCountdownInterval) clearInterval(overstepTurnCountdownInterval);
  if (overstepSuspenseInterval) clearInterval(overstepSuspenseInterval);
  overstepIsActive = false;
  overstepTurnState = 'idle';
  isArenaActive = false;
  isBotMatch = false;
  if (arenaBotDiffBadge) arenaBotDiffBadge.classList.add('hidden');
  vsArenaModal.classList.add('hidden');
});

arenaRematchBtn.addEventListener('click', () => {
  clearBotTimers();
  const newMatchId = (isBotMatch ? 'bot_match_' : 'match_') + Date.now();
  const newRandomTarget = generateRandomVsTarget();
  const newGuessDuration = generateRandomGuessDuration();
  const newOverstepTarget = generateRandomOverstepTarget();
  const p1ClientId = currentMatch ? currentMatch.p1ClientId : myClientId;
  const p2ClientId = currentMatch ? currentMatch.p2ClientId : (isBotMatch ? 'client_timi_bot' : null);

  if (!isBotMatch) {
    broadcast({
      type: 'ARENA_REMATCH',
      matchId: currentMatch.matchId,
      newMatchId: newMatchId,
      targetTime: newRandomTarget,
      guessDurationMs: newGuessDuration,
      overstepTargetMs: newOverstepTarget,
      p1ClientId: p1ClientId,
      p2ClientId: p2ClientId
    });
  }

  openModeSelectionModal(newMatchId, currentMatch.p1, currentMatch.p2, newRandomTarget, newGuessDuration, newOverstepTarget, p1ClientId, p2ClientId, isBotMatch);
});


// Global API Exports for Cross-Patch Coordination
try {
  window.timiLeaderboardRecords = timiLeaderboardRecords;
  window.currentUsername = currentUsername;
  window.recordTimiDefeat = recordTimiDefeat;
  window.renderLeaderboard = renderLeaderboard;
  window.mergeLeaderboardRecords = mergeLeaderboardRecords;
  window.publishLeaderboardRetained = publishLeaderboardRetained;
  window.showTimiVictoryToast = showTimiVictoryToast;
  window.broadcast = broadcast;
  window.mqttClient = mqttClient;
  window.getModeTitle = getModeTitle;
  window.openModeSelectionModal = openModeSelectionModal;
  window.evaluateModeResolution = evaluateModeResolution;
  window.launchArenaMatch = launchArenaMatch;
  window.clearBotTimers = clearBotTimers;
  window.currentBotDifficulty = currentBotDifficulty;
  window.isBotMatch = isBotMatch;
  window.openBotMatchSetup = openBotMatchSetup;
  window.checkIsMe = checkIsMe;
} catch (e) {}
