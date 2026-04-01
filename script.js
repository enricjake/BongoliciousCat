let soundEnabled = true;
let audioCtx = null;

// Initialize audio context on first interaction
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Play a drum sound
function playDrum(frequency = 200) {
  if (!soundEnabled || !audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, audioCtx.currentTime + 0.1);
  
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.15);
  
  // Add a click for attack
  const clickOsc = audioCtx.createOscillator();
  const clickGain = audioCtx.createGain();
  clickOsc.type = 'square';
  clickOsc.frequency.setValueAtTime(800, audioCtx.currentTime);
  clickGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  clickGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.02);
  clickOsc.connect(clickGain);
  clickGain.connect(audioCtx.destination);
  clickOsc.start(audioCtx.currentTime);
  clickOsc.stop(audioCtx.currentTime + 0.02);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  document.querySelector('.sound-toggle').textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
  localStorage.setItem('soundEnabled', soundEnabled);
}

// Get elements
const leftPaw = document.querySelector('.paw.left');
const rightPaw = document.querySelector('.paw.right');
const leftDrum = document.querySelector('.drum.left');
const rightDrum = document.querySelector('.drum.right');
const notesContainer = document.querySelector('.notes');
const catHead = document.querySelector('.cat-head');
const leftButton = document.querySelector('.left-button');
const rightButton = document.querySelector('.right-button');

function hitDrum(isLeftDrum, x, y) {
  initAudio();
  
  const paw = isLeftDrum ? leftPaw : rightPaw;
  const drum = isLeftDrum ? leftDrum : rightDrum;
  
  // Animate paw
  paw.classList.add('hit');
  setTimeout(() => paw.classList.remove('hit'), 150);
  
  // Animate drum
  drum.classList.add('hit');
  setTimeout(() => drum.classList.remove('hit'), 150);
  
  // Head bops slightly
  catHead.style.transform = `rotate(${isLeftDrum ? -5 : 5}deg)`;
  setTimeout(() => catHead.style.transform = 'rotate(0deg)', 100);
  
  // Play sound
  playDrum(isLeftDrum ? 220 : 280);
  
  // Create note
  createNote(x, y);
}

function createNote(x, y) {
  const note = document.createElement('div');
  note.className = 'note';
  note.textContent = ['♪', '♫', '♬', '🎵', '🎶'][Math.floor(Math.random() * 5)];
  note.style.left = (x + Math.random() * 40 - 20) + 'px';
  note.style.top = (y + Math.random() * 30 - 15) + 'px';
  notesContainer.appendChild(note);
  
  setTimeout(() => note.remove(), 1000);
}

// Setup button listeners
function setupButtonListeners() {
  // Left button (A)
  leftButton.addEventListener('click', (e) => {
    e.stopPropagation();
    hitDrum(true, 140, 150);
  });
  
  leftButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hitDrum(true, 140, 150);
  });
  
  // Right button (D)
  rightButton.addEventListener('click', (e) => {
    e.stopPropagation();
    hitDrum(false, 260, 150);
  });
  
  rightButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    hitDrum(false, 260, 150);
  });
}

// Keyboard handler - only A and D keys
document.addEventListener('keydown', (e) => {
  if (e.repeat) return; // Prevent key repeat
  
  const key = e.key.toLowerCase();
  if (key === 'a') {
    e.preventDefault();
    hitDrum(true, 140, 150);
    leftButton.classList.add('active');
  } else if (key === 'd') {
    e.preventDefault();
    hitDrum(false, 260, 150);
    rightButton.classList.add('active');
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'a') {
    leftButton.classList.remove('active');
  } else if (key === 'd') {
    rightButton.classList.remove('active');
  }
});

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  // Load sound preference
  const savedSoundPref = localStorage.getItem('soundEnabled');
  if (savedSoundPref !== null) {
    soundEnabled = savedSoundPref === 'true';
    document.querySelector('.sound-toggle').textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
  }
  
  // Setup button listeners
  setupButtonListeners();
  
  // Add click listener for sound toggle
  const soundToggle = document.querySelector('.sound-toggle');
  soundToggle.addEventListener('click', toggleSound);
  soundToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSound();
    }
  });
});
