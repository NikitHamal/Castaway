import { Game } from './engine/game.js';
import { MainMenu } from './engine/menu.js';

const canvas = document.getElementById('game');
const menuRoot = document.getElementById('menu');
const game = new Game(canvas);

new MainMenu({ root: menuRoot, game, canvas });

canvas.addEventListener('click', () => { canvas.focus(); try { game.audio.unlock(); } catch (_e) {} });
canvas.addEventListener('touchstart', () => { try { game.audio.unlock(); } catch (_e) {} }, { passive: true });
window.addEventListener('pagehide', () => { try { if (game.started) game.saveGame({ silent: true, auto: true }); } catch (_e) {} });
