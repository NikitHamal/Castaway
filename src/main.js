import { Game } from './engine/game.js';
import { SAVE_KEY } from './engine/shared.js';

const canvas=document.getElementById('game');
const game=new Game(canvas);
const boot=document.getElementById('boot');
const startBtn=document.getElementById('startBtn');
const resumeBtn=document.getElementById('resumeBtn');
const newBtn=document.getElementById('newBtn');
let booted=false;

async function bootGame({resume=false,fresh=false}={}){
  if(booted) return;
  booted=true;
  for(const btn of [startBtn,resumeBtn,newBtn]) if(btn) btn.disabled=true;
  startBtn.textContent='Loading generated assets...';
  await game.art.loadAssets();
  if(fresh) localStorage.removeItem(SAVE_KEY);
  if(resume) game.loadGame();
  boot.classList.add('hidden');
  canvas.focus();
  game.start();
}

const hasSave=!!localStorage.getItem(SAVE_KEY) || !!localStorage.getItem('castaway_mimics_save_v1');
if(resumeBtn) resumeBtn.hidden=!hasSave;
startBtn.addEventListener('click',()=>bootGame({resume:hasSave}));
resumeBtn?.addEventListener('click',()=>bootGame({resume:true}));
newBtn?.addEventListener('click',()=>bootGame({fresh:true}));
canvas.addEventListener('click',()=>canvas.focus());
