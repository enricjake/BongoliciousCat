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

let isLeft = true;

function hitDrum(x, y) {
  initAudio();
  
  const paw = isLeft ? leftPaw : rightPaw;
  const drum = isLeft ? leftDrum : rightDrum;
  
  // Animate paw
  paw.classList.add('hit');
  setTimeout(() => paw.classList.remove('hit'), 150);
  
  // Animate drum
  drum.classList.add('hit');
  setTimeout(() => drum.classList.remove('hit'), 150);
  
  // Head bops slightly
  catHead.style.transform = `rotate(${isLeft ? -5 : 5}deg)`;
  setTimeout(() => catHead.style.transform = 'rotate(0deg)', 100);
  
  // Play sound
  playDrum(isLeft ? 220 : 280);
  
  // Create note
  createNote(x, y);
  
  isLeft = !isLeft;
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

// Click handler
document.body.addEventListener('click', (e) => {
  if (e.target.classList.contains('sound-toggle')) return;
  hitDrum(e.clientX - 200, 150);
});

// Touch handler
document.body.addEventListener('touchstart', (e) => {
  if (e.target.classList.contains('sound-toggle')) return;
  e.preventDefault();
  const touch = e.touches[0];
  hitDrum(touch.clientX - 200, 150);
});

// Keyboard handler
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.key === 'a' || e.key === 'd') {
    initAudio();
    const x = e.key === 'a' ? 140 : 260;
    hitDrum(x - 200, 150);
  }
});

// Idle animation
let idleTimer = 0;
function idleAnimation() {
  idleTimer++;
  if (idleTimer > 300) { // Every ~5 seconds
    idleTimer = 0;
    if (Math.random() > 0.5) {
      hitDrum(140, 150);
      setTimeout(() => hitDrum(260, 150), 200);
    }
  }
  requestAnimationFrame(idleAnimation);
}
idleAnimation();

// Initialize sound preference from localStorage
window.addEventListener('DOMContentLoaded', () => {
  const savedSoundPref = localStorage.getItem('soundEnabled');
  if (savedSoundPref !== null) {
    soundEnabled = savedSoundPref === 'true';
    document.querySelector('.sound-toggle').textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
  }
  
  // Add keyboard accessibility for sound toggle
  const soundToggle = document.querySelector('.sound-toggle');
  soundToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSound();
    }
  });
});