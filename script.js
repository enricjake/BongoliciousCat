(function() {
  'use strict';

  // State
  let soundEnabled = true;
  let audioCtx = null;
  let combo = 0;
  let comboTimer = null;
  let lastHitTime = 0;
  const COMBO_TIMEOUT = 1500;
  const STREAK_MILESTONES = [5, 10, 25, 50, 100];

  // DOM Elements
  const leftPaw = document.querySelector('.paw.left');
  const rightPaw = document.querySelector('.paw.right');
  const leftDrum = document.querySelector('.drum.left');
  const rightDrum = document.querySelector('.drum.right');
  const notesContainer = document.querySelector('.notes');
  const particlesContainer = document.querySelector('.particles');
  const catHead = document.querySelector('.cat-head');
  const catBody = document.querySelector('.cat-body');
  const tail = document.querySelector('.tail');
  const leftButton = document.querySelector('.left-button');
  const rightButton = document.querySelector('.right-button');
  const spaceButton = document.querySelector('.space-button');
  const soundToggle = document.querySelector('.sound-toggle');
  const comboDisplay = document.querySelector('.combo-display');
  const comboCount = document.querySelector('.combo-count');
  const streakCelebration = document.querySelector('.streak-celebration');
  const streakText = document.querySelector('.streak-text');
  const pupils = document.querySelectorAll('.pupil');
  const leftEye = document.querySelector('.eye.left');
  const rightEye = document.querySelector('.eye.right');

  // Audio
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playDrum(frequency = 200) {
    if (!soundEnabled || !audioCtx) return;

    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, now + 0.1);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    const clickOsc = audioCtx.createOscillator();
    const clickGain = audioCtx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(800, now);
    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
    clickOsc.connect(clickGain);
    clickGain.connect(audioCtx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.02);
  }

  function playChime() {
    if (!soundEnabled || !audioCtx) return;

    const now = audioCtx.currentTime;
    const frequencies = [523.25, 659.25, 783.99];

    frequencies.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  }

  // Sound toggle
  function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
    localStorage.setItem('soundEnabled', soundEnabled);
  }

  // Combo system
  function updateCombo() {
    const now = Date.now();
    if (now - lastHitTime > COMBO_TIMEOUT) {
      combo = 0;
    }
    lastHitTime = now;
    combo++;

    comboCount.textContent = combo;
    comboDisplay.classList.toggle('active', combo >= 3);

    if (STREAK_MILESTONES.includes(combo)) {
      celebrateStreak(combo);
    }

    const wagSpeed = Math.max(0.4, 3 - (combo * 0.15));
    tail.style.animationDuration = wagSpeed + 's';

    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
      combo = 0;
      comboCount.textContent = '0';
      comboDisplay.classList.remove('active');
      tail.style.animationDuration = '3s';
    }, COMBO_TIMEOUT);
  }

  function celebrateStreak(count) {
    streakText.textContent = `🔥 ${count} Streak! 🔥`;
    streakCelebration.classList.add('show');
    playChime();

    for (let i = 0; i < 12; i++) {
      setTimeout(() => createParticle(), i * 50);
    }

    setTimeout(() => {
      streakCelebration.classList.remove('show');
    }, 1500);
  }

  // Eye tracking
  function setupEyeTracking() {
    function movePupils(x, y) {
      const eyeCenterX = (leftEye.getBoundingClientRect().left + rightEye.getBoundingClientRect().right) / 2;
      const eyeCenterY = (leftEye.getBoundingClientRect().top + leftEye.getBoundingClientRect().bottom) / 2;

      const angle = Math.atan2(y - eyeCenterY, x - eyeCenterX);
      const distance = Math.min(6, Math.hypot(x - eyeCenterX, y - eyeCenterY) / 30);

      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance;

      pupils.forEach(pupil => {
        pupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    }

    document.addEventListener('mousemove', (e) => movePupils(e.clientX, e.clientY));
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        movePupils(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  // Blinking
  function setupBlinking() {
    function blink() {
      document.querySelectorAll('.eye').forEach(eye => {
        eye.classList.add('blink');
        setTimeout(() => eye.classList.remove('blink'), 150);
      });
    }

    function scheduleBlink() {
      const delay = 2000 + Math.random() * 4000;
      setTimeout(() => {
        blink();
        scheduleBlink();
      }, delay);
    }

    scheduleBlink();
  }

  // Notes
  function createNote(x, y) {
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = ['♪', '♫', '♬', '🎵', '🎶', '🐱', '✨'][Math.floor(Math.random() * 7)];
    note.style.left = (x + Math.random() * 60 - 30) + 'px';
    note.style.top = (y - 20 + Math.random() * 40 - 20) + 'px';
    notesContainer.appendChild(note);

    setTimeout(() => note.remove(), 800);
  }

  // Particles
  function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = ['✨', '⭐', '💫', '🌟', '🎵', '♪'][Math.floor(Math.random() * 6)];
    particle.style.left = (Math.random() * 100) + '%';
    particle.style.top = (60 + Math.random() * 30) + '%';
    particlesContainer.appendChild(particle);

    setTimeout(() => particle.remove(), 1000);
  }

  // Core hit function
  function hitDrum(isLeftDrum, x, y) {
    initAudio();

    const paw = isLeftDrum ? leftPaw : rightPaw;
    const drum = isLeftDrum ? leftDrum : rightDrum;

    paw.classList.remove('hit');
    void paw.offsetWidth;
    paw.classList.add('hit');

    drum.classList.remove('hit');
    void drum.offsetWidth;
    drum.classList.add('hit');

    catHead.classList.add('happy');
    catHead.style.setProperty('--tilt', isLeftDrum ? '-8deg' : '8deg');

    setTimeout(() => {
      catHead.classList.remove('happy');
      catHead.style.setProperty('--tilt', '0deg');
    }, 100);

    playDrum(isLeftDrum ? 200 : 250);
    createNote(x, y);
    updateCombo();
  }

  function hitBothDrums() {
    initAudio();

    leftPaw.classList.remove('hit');
    rightPaw.classList.remove('hit');
    leftDrum.classList.remove('hit');
    rightDrum.classList.remove('hit');

    void leftPaw.offsetWidth;
    void rightPaw.offsetWidth;

    leftPaw.classList.add('hit');
    rightPaw.classList.add('hit');
    leftDrum.classList.add('hit');
    rightDrum.classList.add('hit');

    catHead.classList.add('happy');
    catHead.style.setProperty('--tilt', '0deg');

    setTimeout(() => {
      catHead.classList.remove('happy');
    }, 100);

    playDrum(200);
    setTimeout(() => playDrum(250), 30);

    const stageRect = document.querySelector('.stage').getBoundingClientRect();
    createNote(stageRect.width * 0.3, stageRect.height * 0.5);
    createNote(stageRect.width * 0.7, stageRect.height * 0.5);
    updateCombo();
  }

  // Get drum position for note spawning
  function getDrumNotePos(isLeftDrum) {
    const drum = isLeftDrum ? leftDrum : rightDrum;
    const rect = drum.getBoundingClientRect();
    const stageRect = document.querySelector('.stage').getBoundingClientRect();
    return {
      x: rect.left - stageRect.left + rect.width / 2,
      y: rect.top - stageRect.top
    };
  }

  // Button listeners
  let lastInputTime = 0;
  const INPUT_DEBOUNCE_MS = 50;

  // Shared by pointer and keyboard input so one physical tap never double-fires
  function debounce() {
    const now = Date.now();
    if (now - lastInputTime < INPUT_DEBOUNCE_MS) return false;
    lastInputTime = now;
    return true;
  }

  function setupButtonListeners() {
    function handleLeft(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!debounce()) return;
      const pos = getDrumNotePos(true);
      hitDrum(true, pos.x, pos.y);
    }

    function handleRight(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!debounce()) return;
      const pos = getDrumNotePos(false);
      hitDrum(false, pos.x, pos.y);
    }

    function handleSpace(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!debounce()) return;
      hitBothDrums();
    }

    leftButton.addEventListener('mousedown', handleLeft);
    leftButton.addEventListener('touchstart', handleLeft, { passive: false });

    rightButton.addEventListener('mousedown', handleRight);
    rightButton.addEventListener('touchstart', handleRight, { passive: false });

    if (spaceButton) {
      spaceButton.addEventListener('mousedown', handleSpace);
      spaceButton.addEventListener('touchstart', handleSpace, { passive: false });
    }
  }

  // Keyboard handler
  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (!debounce()) return;

    const key = e.key.toLowerCase();

    if (key === 'a' || key === 'arrowleft') {
      e.preventDefault();
      const pos = getDrumNotePos(true);
      hitDrum(true, pos.x, pos.y);
      leftButton.classList.add('active');
      leftDrum.classList.add('key-active');
    } else if (key === 'd' || key === 'arrowright') {
      e.preventDefault();
      const pos = getDrumNotePos(false);
      hitDrum(false, pos.x, pos.y);
      rightButton.classList.add('active');
      rightDrum.classList.add('key-active');
    } else if (key === ' ') {
      e.preventDefault();
      hitBothDrums();
      if (spaceButton) spaceButton.classList.add('active');
      leftDrum.classList.add('key-active');
      rightDrum.classList.add('key-active');
    }
  });

  document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();

    if (key === 'a' || key === 'arrowleft') {
      leftButton.classList.remove('active');
      leftDrum.classList.remove('key-active');
    } else if (key === 'd' || key === 'arrowright') {
      rightButton.classList.remove('active');
      rightDrum.classList.remove('key-active');
    } else if (key === ' ') {
      if (spaceButton) spaceButton.classList.remove('active');
      leftDrum.classList.remove('key-active');
      rightDrum.classList.remove('key-active');
    }
  });

  // Drum click handlers
  leftDrum.addEventListener('click', () => {
    const pos = getDrumNotePos(true);
    hitDrum(true, pos.x, pos.y);
  });

  rightDrum.addEventListener('click', () => {
    const pos = getDrumNotePos(false);
    hitDrum(false, pos.x, pos.y);
  });

  // Initialize
  window.addEventListener('DOMContentLoaded', () => {
    const savedSoundPref = localStorage.getItem('soundEnabled');
    if (savedSoundPref !== null) {
      soundEnabled = savedSoundPref === 'true';
      soundToggle.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
    }

    setupButtonListeners();
    setupEyeTracking();
    setupBlinking();

    soundToggle.addEventListener('click', toggleSound);
    soundToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSound();
      }
    });
  });
})();
