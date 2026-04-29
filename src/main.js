import { Game } from './engine/game.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);
const boot = document.getElementById('boot');
const startBtn = document.getElementById('startBtn');

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  startBtn.textContent = 'Loading generated assets...';
  await game.art.loadAssets();
  boot.classList.add('hidden');
  canvas.focus();
  game.start();
});

canvas.addEventListener('click', () => canvas.focus());

// Prevent default touch behaviors that interfere with the game
window.addEventListener('touchstart', (e) => {
  if (e.target === canvas) e.preventDefault();
}, { passive: false });
window.addEventListener('touchmove', (e) => {
  if (e.target === canvas) e.preventDefault();
}, { passive: false });
