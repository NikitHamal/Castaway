import { Game } from './engine/game.js';

const canvas=document.getElementById('game'); const game=new Game(canvas);
const boot=document.getElementById('boot'); const startBtn=document.getElementById('startBtn');
startBtn.addEventListener('click',async()=>{
  startBtn.disabled=true; startBtn.textContent='Loading generated assets...';
  try { game.audio.unlock(); } catch(_e) {}
  await game.art.loadAssets();
  boot.classList.add('hidden');
  canvas.focus();
  game.start();
  // Music kicks in inside game.updateAudio() once audio.unlocked is true.
});
canvas.addEventListener('click',()=>{ canvas.focus(); try { game.audio.unlock(); } catch(_e) {} });
canvas.addEventListener('touchstart',()=>{ try { game.audio.unlock(); } catch(_e) {} }, {passive:true});
