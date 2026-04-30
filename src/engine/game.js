import { Input } from './input.js';
import { Art } from './art.js';
import { World } from './world.js';
import { AudioEngine } from './audio.js';
import { readSlot, writeSlot, deleteSlot, normalizeSlotId } from './saveManager.js';
import { TILE, SAVE_VERSION, HOTBAR, BUILDINGS, ITEMS, COLORS, TWO_PI, clamp, distance, dist2, nowId, itemName, addToBag, sanitizeBag, hasCost, payCost, formatCost, finiteNumber, wrapText, deepClone } from './shared.js';

export class Game {
  constructor(canvas){
    this.canvas=canvas; this.ctx=canvas.getContext('2d'); this.ctx.imageSmoothingEnabled=false;
    this.input=new Input(canvas); this.art=new Art(); this.audio=new AudioEngine();
    this.renderScale=2; this.worldCanvas=document.createElement('canvas'); this.worldCtx=this.worldCanvas.getContext('2d'); this.worldCtx.imageSmoothingEnabled=false;
    this.activeSlotId='1'; this.started=false; this.camera={x:0,y:0}; this.messages=[]; this.floatText=[]; this.uiButtons=[];
    this.seed=(Date.now()^0x51a2d)&0x7fffffff; this.world=new World(this.seed);
    this.player=this.defaultPlayer(); this.selectedSlot=0; this.inside=null; this.currentBuild='home'; this.buildGhost=null; this.buildPanel=false; this.invOpen=false; this.helpOpen=false; this.assetOpen=false; this.assetPage=0; this.paused=false;
    this.time=.30; this.day=1; this.playTime=0; this.autoSaveTimer=45; this.moveMarker={active:false,x:0,y:0,path:[],repath:0}; this.tooltip='';
    this.message('Welcome to Island. A fresh Sunnyside island is ready.');
    this.message('WASD moves, right click pathfinds, E interacts, B/F build, J jumps.');
  }
  defaultPlayer(){ return {x:this.world.spawn.x,y:this.world.spawn.y,z:0,vz:0,dir:'down',facing:'right',moving:false,running:false,swimming:false,anim:0,action:'idle',actionTimer:0,health:100,maxHealth:100,energy:100,maxEnergy:100,water:100,maxWater:100,inv:{axe:1,pickaxe:1,hammer:1,sword:1,seeds:8,wood:8,stone:4,carrot:3},path:[],pathTimer:0,attackCd:0,home:{x:this.world.spawn.x,y:this.world.spawn.y}}; }
  resize(){
    const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1)); this.canvas.width=Math.floor(window.innerWidth*dpr); this.canvas.height=Math.floor(window.innerHeight*dpr); this.ctx.imageSmoothingEnabled=false;
    const min=Math.min(window.innerWidth,window.innerHeight); this.renderScale=Math.max(1.75,Math.min(2.65,min/360)); this.worldCanvas.width=Math.ceil(this.canvas.width/this.renderScale); this.worldCanvas.height=Math.ceil(this.canvas.height/this.renderScale); this.worldCtx.imageSmoothingEnabled=false;
  }
  uiScale(){ return clamp(Math.min(this.canvas.width,this.canvas.height)/760,.62,1.25); }
  start(){ if(this.started) return; this.started=true; this.resize(); window.addEventListener('resize',()=>this.resize()); let last=performance.now(); const loop=(ts)=>{ const dt=Math.min(.05,(ts-last)/1000); last=ts; this.update(dt); this.render(); this.input.endFrame(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  message(text,color=COLORS.white){ this.messages.unshift({text,color,t:5}); this.messages=this.messages.slice(0,6); }
  addFloat(text,x,y,color=COLORS.white){ this.floatText.push({text,x,y,t:1.1,color}); }
  setActiveSlot(id){ this.activeSlotId=normalizeSlotId(id); }
  update(dt){
    const i=this.input, sc=this.renderScale; i.mouse.worldX=i.mouse.x/sc+this.camera.x; i.mouse.worldY=i.mouse.y/sc+this.camera.y;
    if(this.audio?.unlocked) this.audio.setAmbient('overworld');
    if(i.hit('escape')){ if(this.buildPanel) this.buildPanel=false; else if(this.invOpen) this.invOpen=false; else this.helpOpen=!this.helpOpen; }
    if(i.hit('f1')) this.helpOpen=!this.helpOpen; if(i.hit('i')) this.invOpen=!this.invOpen; if(i.hit('c')) this.buildPanel=!this.buildPanel; if(i.hit('v')) this.assetOpen=!this.assetOpen;
    if(this.assetOpen){ const pages=6; if(i.hit('[')) this.assetPage=(this.assetPage+pages-1)%pages; if(i.hit(']')) this.assetPage=(this.assetPage+1)%pages; }
    if(i.mouse.clicked){ for(const b of this.uiButtons){ if(i.mouse.x>=b.x&&i.mouse.y>=b.y&&i.mouse.x<=b.x+b.w&&i.mouse.y<=b.y+b.h){ b.cb(); i.mouse.clicked=false; break; } } }
    if(!this.buildPanel&&!this.invOpen&&!this.assetOpen&&!this.helpOpen){ this.handleInput(); this.updateWorld(dt); }
    for(const m of this.messages) m.t-=dt; this.messages=this.messages.filter(m=>m.t>0);
    for(const f of this.floatText){ f.t-=dt; f.y-=24*dt; } this.floatText=this.floatText.filter(f=>f.t>0);
  }
  handleInput(){
    const i=this.input;
    for(let n=0;n<HOTBAR.length;n++) if(i.hit(String((n+1)%10))) this.selectedSlot=n;
    if(i.mouse.wheel) this.selectedSlot=(this.selectedSlot+i.mouse.wheel+HOTBAR.length)%HOTBAR.length;
    if(i.hit('tab')) this.selectedSlot=(this.selectedSlot+1)%HOTBAR.length;
    if(i.hit('b')){ const keys=Object.keys(BUILDINGS); this.currentBuild=keys[(keys.indexOf(this.currentBuild)+1+keys.length)%keys.length]; this.message(`Selected ${BUILDINGS[this.currentBuild].name}. Press F to place.`); }
    if(i.hit('f')) this.tryPlaceBuilding();
    if(i.hit('e')) this.interact();
    if(i.hit('space') || i.mouse.clicked) this.useSelected(i.mouse.clicked);
    if(i.mouse.rightClicked) this.issueMove(i.mouse.worldX,i.mouse.worldY);
  }
  updateWorld(dt){
    this.playTime+=dt; this.autoSaveTimer-=dt; if(this.autoSaveTimer<=0){ this.saveGame({silent:true,auto:true}); this.autoSaveTimer=45; }
    this.time+=dt/520; if(this.time>=1){ this.time-=1; this.day++; this.message(`Day ${this.day}. Crops and island wildlife keep moving.`); }
    if(this.inside){ this.updatePlayer(dt); return; } this.updatePlayer(dt); this.updateItems(dt); this.updateCrops(dt); this.updateAnimals(dt); this.updateEnemies(dt);
    const vw=this.worldCanvas.width,vh=this.worldCanvas.height; this.camera.x=clamp(this.player.x-vw/2,0,this.world.w*TILE-vw); this.camera.y=clamp(this.player.y-vh/2,0,this.world.h*TILE-vh);
  }
  updatePlayer(dt){
    const p=this.player,i=this.input; let dx=0,dy=0; if(i.down('w')||i.down('arrowup')) dy--; if(i.down('s')||i.down('arrowdown')) dy++; if(i.down('a')||i.down('arrowleft')) dx--; if(i.down('d')||i.down('arrowright')) dx++;
    const manual=dx||dy; p.running=i.down('shift')&&p.energy>3;
    let moved=false;
    if(manual){ this.clearMove(); const len=Math.hypot(dx,dy); dx/=len; dy/=len; moved=this.moveEntity(p,dx*this.speed()*dt,dy*this.speed()*dt,8)>0.2; this.updateFacing(dx,dy); }
    else if(this.moveMarker.active){ moved=this.followMove(dt); }
    p.moving=moved; if(moved) p.anim+=dt; else p.anim+=dt*.35;
    if(p.running&&moved) p.energy=Math.max(0,p.energy-12*dt); else p.energy=clamp(p.energy+10*dt,0,p.maxEnergy);
    p.water=Math.max(0,p.water-(moved ? .11 : .055)*dt); if(p.water<=0) p.health=Math.max(0,p.health-2*dt);
    p.vz-=900*dt; p.z+=p.vz*dt; if(p.z<=0){ p.z=0; p.vz=0; if(i.hit('j')){ p.vz=220; this.audio.play('jump'); }}
    p.attackCd=Math.max(0,p.attackCd-dt); if(p.actionTimer>0){ p.actionTimer-=dt; if(p.actionTimer<=0) p.action='idle'; }
    if(this.inside){ p.swimming=false; if(moved&&p.z===0) this.audio.play('footstep',{volume:p.running?.65:.45}); return; } const t=this.world.tile(Math.floor(p.x/TILE),Math.floor(p.y/TILE)); p.swimming=t==='shallow'; if(moved&&p.z===0) this.audio.play(p.swimming?'wade':'footstep',{freq:t==='sand'?420:360,volume:p.running?.9:.65});
  }
  speed(){ return (this.player.running?124:86)*(this.player.swimming?.72:1); }
  updateFacing(dx,dy){ if(Math.abs(dx)>.1) this.player.facing=dx<0?'left':'right'; if(Math.abs(dx)>Math.abs(dy)) this.player.dir='side'; else this.player.dir=dy<0?'up':'down'; }
  moveEntity(e,dx,dy,r=8){ if(this.inside){ const ox=e.x,oy=e.y; e.x=clamp(e.x+dx,2*TILE,12*TILE+TILE/2); e.y=clamp(e.y+dy,2*TILE,8*TILE+TILE*.74); return distance(ox,oy,e.x,e.y); } const w=this.world; const ox=e.x,oy=e.y; if(!w.isBlocked(e.x+dx,e.y,r)) e.x+=dx; if(!w.isBlocked(e.x,e.y+dy,r)) e.y+=dy; e.x=clamp(e.x,10,w.w*TILE-10); e.y=clamp(e.y,10,w.h*TILE-10); return distance(ox,oy,e.x,e.y); }
  issueMove(x,y){ if(this.inside){ this.message('Use WASD indoors. Press E at the doorway to leave.'); return; } this.moveMarker={active:true,x:clamp(x,0,this.world.w*TILE),y:clamp(y,0,this.world.h*TILE),path:[],repath:0}; this.refreshPath(true); this.audio.play('select'); }
  clearMove(){ this.moveMarker.active=false; this.moveMarker.path=[]; this.player.path=[]; }
  refreshPath(force=false){ if(!this.moveMarker.active) return; if(!force&&this.moveMarker.repath>0) return; const path=this.world.findPath(this.player.x,this.player.y,this.moveMarker.x,this.moveMarker.y,{radius:8,maxNodes:5000}); this.player.path=path.slice(); this.moveMarker.path=path.slice(); this.moveMarker.repath=.3; if(!path.length) this.message('No safe route to that point.',COLORS.orange); }
  followMove(dt){ this.moveMarker.repath-=dt; if(this.moveMarker.repath<=0) this.refreshPath(); if(distance(this.player.x,this.player.y,this.moveMarker.x,this.moveMarker.y)<16){ this.clearMove(); return false; } let target=this.player.path?.[0]; if(!target){ this.clearMove(); return false; } while(target&&distance(this.player.x,this.player.y,target.x,target.y)<12){ this.player.path.shift(); target=this.player.path[0]; } if(!target){ this.clearMove(); return false; } const d=distance(this.player.x,this.player.y,target.x,target.y); const dx=(target.x-this.player.x)/d,dy=(target.y-this.player.y)/d; this.updateFacing(dx,dy); const moved=this.moveEntity(this.player,dx*this.speed()*dt,dy*this.speed()*dt,8)>0.2; this.moveMarker.path=this.player.path.slice(); return moved; }
  useSelected(mouseAim=false){
    if(this.inside){ const id=HOTBAR[this.selectedSlot]; if(id==='carrot'||id==='pumpkin'||id==='fish') return this.eat(id); this.message('Tools stay in your bag indoors. Press E at the door to leave.'); return; }
    const id=HOTBAR[this.selectedSlot]; if(id==='carrot'||id==='pumpkin'||id==='fish') return this.eat(id); if(id==='seeds') return this.plantSeed();
    const p=this.player; const wx=mouseAim?this.input.mouse.worldX:p.x+(p.facing==='left'?-40:40), wy=mouseAim?this.input.mouse.worldY:p.y;
    if(p.attackCd>0) return; p.attackCd=.36;
    const r=this.world.nearestResource(wx,wy,44);
    if(r && ((id==='axe'&&r.type==='tree') || (id==='pickaxe'&&r.type==='rock') || r.type==='mushroom')) return this.hitResource(r,id);
    const e=this.world.enemies.find(en=>distance(wx,wy,en.x,en.y)<42 || distance(p.x,p.y,en.x,en.y)<36);
    if(e && id==='sword') return this.hitEnemy(e);
    if(id==='hammer'){ const ghost=this.nearUnbuilt(); if(ghost) return this.hammerBuilding(ghost); }
    this.player.action=id==='axe'?'axe':id==='pickaxe'?'mine':id==='hammer'?'hammer':'attack'; this.player.actionTimer=.38; this.audio.play(id==='sword'?'attack_swing':'select');
  }
  hitResource(r,id){ this.player.action=id==='axe'?'axe':id==='pickaxe'?'mine':'attack'; this.player.actionTimer=.42; r.hp--; this.audio.play(id==='axe'?'chop':id==='pickaxe'?'mine':'pickup'); this.addFloat('-1',r.x,r.y-34,COLORS.gold); if(r.hp<=0){ this.world.removeResource(r.id); if(r.type==='tree'){ this.world.addItem('wood',r.x,r.y,3+Math.floor(Math.random()*2)); this.world.addItem('seeds',r.x+12,r.y,1); } else if(r.type==='rock') this.world.addItem('stone',r.x,r.y,2+Math.floor(Math.random()*2)); else this.world.addItem('mushroom',r.x,r.y,1); } }
  hitEnemy(e){ this.player.action='attack'; this.player.actionTimer=.35; e.hp-=18; e.action='hurt'; e.hit=.2; this.audio.play('attack_metal'); this.addFloat('-18',e.x,e.y-38,COLORS.red); if(e.hp<=0){ this.world.enemies=this.world.enemies.filter(x=>x!==e); this.world.addItem('stone',e.x,e.y,1); this.message('Threat cleared.'); } }
  nearUnbuilt(){ return this.world.nearestBuilding(this.player.x,this.player.y,42,b=>!b.built); }
  hammerBuilding(b){ this.player.action='hammer'; this.player.actionTimer=.42; b.progress=Math.min(1,(b.progress||0)+.18); this.audio.play('mine',{volume:.55}); this.addFloat(`${Math.round(b.progress*100)}%`,b.x,b.y-42,COLORS.gold); if(b.progress>=1){ b.built=true; this.audio.play('build_complete'); this.message(`${BUILDINGS[b.type].name} complete.`); } }
  eat(id){ if((this.player.inv[id]||0)<=0) return this.message(`No ${itemName(id)} to eat.`); addToBag(this.player.inv,id,-1); this.player.energy=clamp(this.player.energy+(ITEMS[id].food||10),0,this.player.maxEnergy); this.player.health=clamp(this.player.health+8,0,this.player.maxHealth); this.audio.play('eat'); this.message(`Ate ${itemName(id)}.`); }
  plantSeed(){ const p=this.player; if((p.inv.seeds||0)<=0) return this.message('No seeds.'); const c=this.world.nearestCrop(p.x,p.y,32); if(!c) return this.message('Stand near a farm plot.'); if(c.plant&&!c.ready) return this.message('This crop is still growing.'); if(c.ready){ addToBag(p.inv,c.plant,1); c.plant=null; c.age=0; c.ready=false; this.audio.play('pickup'); this.message('Harvested crop.'); return; } const plants=['carrot','pumpkin','wheat','cabbage']; c.plant=plants[(this.day+Math.floor(c.x/TILE)+Math.floor(c.y/TILE))%plants.length]; c.age=0; c.ready=false; addToBag(p.inv,'seeds',-1); this.audio.play('place'); this.message(`Planted ${itemName(c.plant)}.`); }
  interact(){
    const p=this.player;
    if(this.inside){
      const exitX=7*TILE+TILE/2, exitY=9*TILE;
      if(distance(p.x,p.y,exitX,exitY)<70) return this.exitInterior();
      const type=this.inside.type;
      if(type==='workshop'||type==='factory'||type==='shop') return this.craftAtWorkshop();
      if(type==='home'||type==='cabin'){ this.saveGame({silent:false}); p.health=p.maxHealth; p.energy=p.maxEnergy; this.message('Rested, saved, and warmed up indoors.'); return; }
      this.message('This room is quiet. Doorway exits at the bottom.'); return;
    }
    const item=this.world.nearestItem(p.x,p.y,28); if(item){ addToBag(p.inv,item.type,item.qty); this.world.removeItem(item.id); this.audio.play('pickup'); this.message(`Picked up ${item.qty} ${itemName(item.type)}.`); return; }
    const c=this.world.nearestCrop(p.x,p.y,32); if(c&&(c.ready||!c.plant)) return this.plantSeed();
    const b=this.world.nearestBuilding(p.x,p.y,78,b=>b.built);
    if(b){
      if(BUILDINGS[b.type]?.enterable) return this.enterBuilding(b);
      if(b.type==='well'){ this.player.water=this.player.maxWater; for(const c of this.world.crops) if(distance(c.x,c.y,b.x,b.y)<TILE*10) c.age+=12; this.audio.play('splash'); this.message('Drank from the well. Nearby crops grew faster.'); }
      else if(b.type==='dock'){ if(Math.random()<.7){ this.world.addItem('fish',p.x,p.y,1); this.audio.play('splash'); this.message('Caught a fish from the dock.'); } else this.message('The fish slipped away.'); }
      else if(b.type==='windmill'){ if((p.inv.wheat||0)>=4){ addToBag(p.inv,'wheat',-4); addToBag(p.inv,'seeds',5); this.message('Milled wheat into seed stock.'); } else this.message('Bring wheat to the windmill.'); }
      return;
    }
    const a=this.world.animals.find(a=>distance(a.x,a.y,p.x,p.y)<32); if(a){ this.message(`${itemName(a.type)} seems happy here.`); this.addFloat('♥',a.x,a.y-28,COLORS.gold); return; }
    this.message('Nothing to interact with nearby.');
  }
  enterBuilding(b){
    const p=this.player; this.clearMove(); this.inside={type:b.type, name:BUILDINGS[b.type]?.name||'Building', returnX:p.x, returnY:p.y};
    p.x=7*TILE+TILE/2; p.y=7*TILE+TILE*.74; p.dir='up'; p.facing='right'; p.moving=false; p.swimming=false; p.home={x:b.x,y:b.y};
    this.audio.play('place'); this.message(`Entered ${this.inside.name}. Press E at the doorway to leave.`);
  }
  exitInterior(){
    if(!this.inside) return; const p=this.player; const x=this.inside.returnX, y=this.inside.returnY;
    p.x=x; p.y=y+22; p.dir='down'; p.facing='right'; this.message(`Left ${this.inside.name}.`); this.inside=null; this.clearMove(); this.audio.play('select');
  }
  craftAtWorkshop(){ const p=this.player; if((p.inv.wood||0)>=6 && (p.inv.stone||0)>=3){ addToBag(p.inv,'wood',-6); addToBag(p.inv,'stone',-3); addToBag(p.inv,'seeds',5); this.message('Workshop crafted seed bundles.'); this.audio.play('craft'); } else this.message('Workshop recipe: 6 wood + 3 stone → 5 seeds.'); }
  tryPlaceBuilding(){ if(this.inside) return this.message('Build outside after leaving the building.'); const type=this.currentBuild; const b=BUILDINGS[type]; if(!b) return; if(!hasCost(this.player.inv,b.cost)) return this.message(`Need ${formatCost(b.cost)}.`); const tx=Math.floor((this.player.x+(this.player.facing==='left'?-42:42))/TILE), ty=Math.floor(this.player.y/TILE); const x=tx*TILE+TILE/2,y=ty*TILE+TILE*.74; if(this.world.isBlocked(x,y,b.radius||22,{ignoreBuildings:false,ignoreResources:true}) || ['water','shallow','shore'].includes(this.world.tile(tx,ty))) return this.message('Cannot build there.'); payCost(this.player.inv,b.cost); const nb=this.world.addBuilding(type,x,y,{built:false,progress:0}); this.audio.play('place'); this.message(`${b.name} frame placed. Use Hammer to finish.`); return nb; }
  updateItems(dt){ for(const it of [...this.world.items]){ it.t+=dt; it.x+=it.vx*dt; it.y+=it.vy*dt; it.vx*=Math.pow(.08,dt); it.vy*=Math.pow(.08,dt); if(distance(this.player.x,this.player.y,it.x,it.y)<16){ addToBag(this.player.inv,it.type,it.qty); this.world.removeItem(it.id); this.audio.play('pickup'); } } }
  updateCrops(dt){ for(const c of this.world.crops){ if(c.plant&&!c.ready){ c.age+=dt; if(c.age>38){ c.ready=true; this.addFloat('ready',c.x,c.y-24,COLORS.gold); } } } }
  updateAnimals(dt){
    for(const a of this.world.animals){
      a.anim+=dt;
      a.pause=Math.max(0,(a.pause||0)-dt);
      if(a.pause>0) continue;
      a.wander+=(Math.random()-.5)*dt*.45;
      if(Math.random()<dt*.012){ a.wander=Math.random()*TWO_PI; a.pause=Math.random()<.35?(.6+Math.random()*1.2):0; }
      const dx=Math.cos(a.wander),dy=Math.sin(a.wander), speed=a.type==='duck'?12:a.type==='cow'?8:10;
      const oldx=a.x, oldy=a.y, nx=a.x+dx*speed*dt, ny=a.y+dy*speed*dt;
      const home=a.home||{x:a.x,y:a.y};
      const tooFar=distance(nx,ny,home.x,home.y)>150;
      if(tooFar){ a.wander=Math.atan2(home.y-a.y,home.x-a.x); continue; }
      if(!this.world.isBlocked(nx,ny,8,{ignoreResources:true,ignoreAnimals:true})){ a.x=nx; a.y=ny; }
      else a.wander+=Math.PI*.55;
      if(Math.abs(a.x-oldx)>.05) a.facing=a.x<oldx?'left':'right';
    }
  }
  updateEnemies(dt){ for(const e of this.world.enemies){ e.anim+=dt; e.attackCd=Math.max(0,e.attackCd-dt); e.action=null; const d=distance(e.x,e.y,this.player.x,this.player.y); if(d<360){ const dx=(this.player.x-e.x)/d,dy=(this.player.y-e.y)/d; e.facing=dx<0?'left':'right'; e.moving=d>38; if(d>38&&!this.world.isBlocked(e.x+dx*64*dt,e.y+dy*64*dt,14,{ignoreResources:true})){ e.x+=dx*64*dt; e.y+=dy*64*dt; } else if(e.attackCd<=0){ e.attackCd=1.1; e.action='attack'; this.player.health=Math.max(0,this.player.health-8); this.addFloat('-8',this.player.x,this.player.y-52,COLORS.red); this.audio.play('damage'); } } else e.moving=false; } }
  createSaveData(){ return {version:SAVE_VERSION,title:'Island Homestead',savedAt:Date.now(),seed:this.seed,day:this.day,time:this.time,playTime:this.playTime,island:1,world:this.world.serialize(),player:this.player,currentBuild:this.currentBuild,selectedSlot:this.selectedSlot}; }
  saveGame({slotId=this.activeSlotId,silent=false}={}){ try{ writeSlot(slotId,this.createSaveData()); if(!silent) this.message('Game saved.'); return true; }catch(e){ if(!silent) this.message('Save failed.'); return false; } }
  loadGame(slotId=this.activeSlotId,{silent=false}={}){ const r=readSlot(slotId); if(r.empty||!r.data) return false; const d=r.data; try{ this.seed=finiteNumber(d.seed,this.seed)|0; this.world=World.fromData(d.world); this.player={...this.defaultPlayer(),...(d.player||{})}; this.player.inv=sanitizeBag(this.player.inv); this.day=Math.max(1,Math.floor(finiteNumber(d.day,1))); this.time=clamp(finiteNumber(d.time,.3),0,1); this.playTime=Math.max(0,finiteNumber(d.playTime,0)); this.currentBuild=d.currentBuild||'home'; this.selectedSlot=clamp(Math.floor(finiteNumber(d.selectedSlot,0)),0,HOTBAR.length-1); this.activeSlotId=normalizeSlotId(slotId); this.clearMove(); if(!silent) this.message('Loaded save.'); return true; }catch(e){ console.warn(e); return false; } }
  newGame(options={}){ const slotId=normalizeSlotId(options.slotId||this.activeSlotId||1); if(options.clearSave) deleteSlot(slotId); this.activeSlotId=slotId; this.seed=Math.floor(finiteNumber(options.seed,(Date.now()^0x51a2d)&0x7fffffff))&0x7fffffff; this.world=new World(this.seed); this.player=this.defaultPlayer(); this.day=1; this.time=.3; this.playTime=0; this.currentBuild='home'; this.selectedSlot=0; this.messages=[]; this.floatText=[]; this.clearMove(); this.message('New Island generated with Sunnyside assets only.'); this.message('Build a home, farm crops, fish from docks, and explore.'); if(!options.silent) this.saveGame({slotId,silent:true}); if(this.worldCanvas) this.resize(); return true; }
  render(){ const ctx=this.ctx; ctx.clearRect(0,0,this.canvas.width,this.canvas.height); const wc=this.worldCtx; wc.clearRect(0,0,this.worldCanvas.width,this.worldCanvas.height); this.renderWorld(wc); ctx.drawImage(this.worldCanvas,0,0,this.canvas.width,this.canvas.height); this.renderUI(ctx); }
  renderWorld(ctx){
    if(this.inside) return this.renderInterior(ctx);
    const cam={x:Math.round(this.camera.x),y:Math.round(this.camera.y)}, startX=Math.floor(cam.x/TILE)-1,endX=Math.ceil((cam.x+this.worldCanvas.width)/TILE)+1,startY=Math.floor(cam.y/TILE)-1,endY=Math.ceil((cam.y+this.worldCanvas.height)/TILE)+1;
    for(let y=startY;y<=endY;y++) for(let x=startX;x<=endX;x++) if(this.world.inBounds(x,y)) this.art.drawTile(ctx,this.world.tile(x,y),x*TILE-cam.x,y*TILE-cam.y,x,y,this.playTime);
    this.drawPath(ctx,cam); const objects=[];
    for(const c of this.world.crops) objects.push({y:c.y,draw:()=>{c.sx=c.x-cam.x; c.sy=c.y-cam.y; this.art.drawCrop(ctx,c); }});
    for(const d of this.world.decorations||[]) objects.push({y:d.y,draw:()=>{d.sx=d.x-cam.x; d.sy=d.y-cam.y; this.art.drawDecoration(ctx,d,this.playTime); }});
    for(const r of this.world.resources) objects.push({y:r.y,draw:()=>{r.sx=r.x-cam.x; r.sy=r.y-cam.y; this.art.drawResource(ctx,r,this.playTime); if(r.hp<r.maxHp) this.art.drawBar(ctx,r.sx-18,r.sy-62,36,4,r.hp/r.maxHp,COLORS.gold); }});
    for(const b of this.world.buildings) objects.push({y:b.y,draw:()=>{b.sx=b.x-cam.x; b.sy=b.y-cam.y; this.art.drawBuilding(ctx,b,this.playTime); if(!b.built) this.drawBuildProgress(ctx,b); }});
    for(const it of this.world.items) objects.push({y:it.y,draw:()=>{it.sx=it.x-cam.x; it.sy=it.y-cam.y; this.art.drawItem(ctx,it); }});
    for(const a of this.world.animals) objects.push({y:a.y,draw:()=>{a.sx=a.x-cam.x; a.sy=a.y-cam.y; this.art.drawAnimal(ctx,a,this.playTime); }});
    for(const e of this.world.enemies) objects.push({y:e.y,draw:()=>{e.sx=e.x-cam.x; e.sy=e.y-cam.y; this.art.drawEnemy(ctx,e,this.playTime); this.art.drawBar(ctx,e.sx-18,e.sy-42,36,4,e.hp/e.maxHp,COLORS.red); }});
    this.player.sx=this.player.x-cam.x; this.player.sy=this.player.y-cam.y; objects.push({y:this.player.y,draw:()=>this.art.drawPlayer(ctx,this.player)}); objects.sort((a,b)=>a.y-b.y); for(const o of objects) o.draw();
    for(const f of this.floatText){ ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.globalAlpha=clamp(f.t,0,1); ctx.strokeStyle='black'; ctx.lineWidth=3; ctx.strokeText(f.text,f.x-cam.x,f.y-cam.y); ctx.fillStyle=f.color; ctx.fillText(f.text,f.x-cam.x,f.y-cam.y); ctx.globalAlpha=1; }
    const night=this.nightAmount(); if(night>.03){ ctx.fillStyle=`rgba(8,12,30,${night*.35})`; ctx.fillRect(0,0,this.worldCanvas.width,this.worldCanvas.height); }
  }
  renderInterior(ctx){
    const ox=Math.floor((this.worldCanvas.width-15*TILE)/2), oy=Math.floor((this.worldCanvas.height-11*TILE)/2);
    ctx.fillStyle='#151926'; ctx.fillRect(0,0,this.worldCanvas.width,this.worldCanvas.height);
    for(let y=0;y<11;y++) for(let x=0;x<15;x++) this.art.drawTile(ctx,(x===0||y===0||x===14||y===10)?'wall':'woodfloor',ox+x*TILE,oy+y*TILE,x,y,this.playTime);
    for(let x=6;x<=8;x++) this.art.drawTile(ctx,'path',ox+x*TILE,oy+10*TILE,x,10,this.playTime);
    this.art.drawAsset(ctx,'crateBase',ox+2*TILE+16,oy+3*TILE+24,{scale:1.7,anchor:'ground'});
    this.art.drawAsset(ctx,'crateTop',ox+3*TILE+16,oy+3*TILE+24,{scale:1.7,anchor:'ground'});
    this.art.drawFrame(ctx,'fire',4,ox+12*TILE+16,oy+5*TILE+24,{frame:Math.floor(this.playTime*8)%4,scale:1.7});
    if(this.inside?.type==='workshop'||this.inside?.type==='factory'||this.inside?.type==='shop') this.art.drawAsset(ctx,'uiHammer',ox+7*TILE+16,oy+3*TILE+20,{scale:1.2});
    else this.art.drawAsset(ctx,'iconFood',ox+7*TILE+16,oy+3*TILE+20,{scale:1.0});
    this.player.sx=ox+this.player.x; this.player.sy=oy+this.player.y; this.art.drawPlayer(ctx,this.player);
    ctx.font='bold 15px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.gold; ctx.fillText(this.inside?.name||'Interior',this.worldCanvas.width/2,oy+20);
    ctx.font='bold 11px monospace'; ctx.fillStyle=COLORS.white; ctx.fillText('E at doorway exits · E inside rests/crafts',this.worldCanvas.width/2,oy+38);
  }
  drawBuildProgress(ctx,b){ const x=b.sx-26,y=b.sy-70; this.art.drawBar(ctx,x,y,52,5,b.progress||0,COLORS.gold); ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.white; ctx.fillText('hammer',b.sx,y-4); }
  drawPath(ctx,cam){ if(!this.moveMarker.active) return; ctx.save(); ctx.strokeStyle='rgba(255,230,100,.75)'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(this.player.x-cam.x,this.player.y-cam.y); for(const n of this.moveMarker.path) ctx.lineTo(n.x-cam.x,n.y-cam.y); ctx.lineTo(this.moveMarker.x-cam.x,this.moveMarker.y-cam.y); ctx.stroke(); this.art.drawAsset(ctx,'marker',this.moveMarker.x-cam.x,this.moveMarker.y-cam.y,{scale:.8}); ctx.restore(); }
  nightAmount(){ const t=this.time; return clamp((Math.abs(t-.5)*2-.65)/.25,0,1); }
  panel(ctx,x,y,w,h,a=.82){ ctx.save(); ctx.fillStyle=`rgba(21,26,37,${a})`; ctx.fillRect(x,y,w,h); ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=1; ctx.strokeRect(x+3.5,y+3.5,w-7,h-7); ctx.strokeStyle='rgba(0,0,0,.85)'; ctx.lineWidth=3; ctx.strokeRect(x+.5,y+.5,w,h); ctx.restore(); }
  renderUI(ctx){ this.uiButtons=[]; this.drawStats(ctx); this.drawHotbar(ctx); this.drawMessages(ctx); this.drawMinimap(ctx); this.drawHint(ctx); if(this.buildPanel) this.drawBuildPanel(ctx); if(this.invOpen) this.drawInventory(ctx); if(this.helpOpen) this.drawHelp(ctx); if(this.assetOpen) this.drawAssetBrowser(ctx); }
  drawStats(ctx){ const s=this.uiScale(), x=14, y=14; this.panel(ctx,x,y,214*s,72*s,.74); ctx.font=`bold ${Math.round(13*s)}px monospace`; ctx.textAlign='left'; ctx.fillStyle=COLORS.white; ctx.fillText(`Day ${this.day} · ${Math.floor(this.time*24).toString().padStart(2,'0')}:00`,x+12*s,y+18*s); this.art.drawBar(ctx,x+12*s,y+28*s,150*s,8*s,this.player.health/this.player.maxHealth,COLORS.red); ctx.fillStyle=COLORS.white; ctx.fillText('HP',x+168*s,y+36*s); this.art.drawBar(ctx,x+12*s,y+45*s,150*s,8*s,this.player.energy/this.player.maxEnergy,COLORS.gold); ctx.fillText('EN',x+168*s,y+53*s); this.art.drawBar(ctx,x+12*s,y+61*s,150*s,8*s,this.player.water/this.player.maxWater,COLORS.cyan); ctx.fillText('H2O',x+168*s,y+69*s); }
  drawHotbar(ctx){ const count=HOTBAR.length, s=this.uiScale(); const slot=Math.round(44*s), gap=6*s, w=count*slot+(count-1)*gap, x0=this.canvas.width/2-w/2, y=this.canvas.height-slot-22*s; this.panel(ctx,x0-10*s,y-22*s,w+20*s,slot+30*s,.78); for(let i=0;i<count;i++){ const x=x0+i*(slot+gap), id=HOTBAR[i]; ctx.fillStyle=i===this.selectedSlot?'rgba(255,211,106,.28)':'rgba(0,0,0,.36)'; ctx.fillRect(x,y,slot,slot); ctx.strokeStyle=i===this.selectedSlot?COLORS.gold:'rgba(255,255,255,.3)'; ctx.lineWidth=i===this.selectedSlot?3:1; ctx.strokeRect(x+.5,y+.5,slot,slot); this.art.drawIcon(ctx,id,x+slot/2,y+slot/2,slot*.72); const qty=this.player.inv[id]||0; if(!ITEMS[id]?.tool){ ctx.font=`bold ${Math.round(12*s)}px monospace`; ctx.textAlign='right'; ctx.strokeStyle='black'; ctx.lineWidth=3; ctx.strokeText(String(qty),x+slot-4,y+slot-5); ctx.fillStyle='white'; ctx.fillText(String(qty),x+slot-4,y+slot-5); } ctx.font=`bold ${Math.round(11*s)}px monospace`; ctx.textAlign='left'; ctx.fillStyle='rgba(255,255,255,.75)'; ctx.fillText(String(i+1),x+4,y+12*s); this.uiButtons.push({x,y,w:slot,h:slot,cb:()=>{this.selectedSlot=i;this.audio.play('select');}}); } ctx.font=`bold ${Math.round(14*s)}px monospace`; ctx.textAlign='center'; ctx.fillStyle=COLORS.white; ctx.fillText(itemName(HOTBAR[this.selectedSlot]),this.canvas.width/2,y-7*s); }
  drawMessages(ctx){ ctx.font='bold 13px monospace'; ctx.textAlign='left'; let y=this.canvas.height-142*this.uiScale(); for(const m of this.messages){ ctx.globalAlpha=clamp(m.t,0,.95); const w=ctx.measureText(m.text).width+18; ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(16,y-17,w,22); ctx.fillStyle=m.color; ctx.fillText(m.text,25,y); y-=24; } ctx.globalAlpha=1; }
  drawMinimap(ctx){ const s=this.uiScale(), r=58*s, x=this.canvas.width-r-22*s, y=22*s+r; ctx.save(); ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.clip(); ctx.fillStyle='#003d56'; ctx.fillRect(x-r,y-r,r*2,r*2); const scale=r*2/this.world.w; for(let ty=0;ty<this.world.h;ty+=2) for(let tx=0;tx<this.world.w;tx+=2){ const t=this.world.tile(tx,ty); ctx.fillStyle=t==='water'?COLORS.water:t==='shallow'?COLORS.shallow:t==='sand'||t==='shore'?COLORS.sand:t==='path'?COLORS.path:COLORS.grass; ctx.fillRect(x-r+tx*scale,y-r+ty*scale,Math.ceil(scale*2),Math.ceil(scale*2)); } ctx.fillStyle=COLORS.red; for(const e of this.world.enemies) ctx.fillRect(x-r+e.x/TILE*scale-2,y-r+e.y/TILE*scale-2,4,4); ctx.fillStyle=COLORS.gold; ctx.beginPath(); ctx.arc(x-r+this.player.x/TILE*scale,y-r+this.player.y/TILE*scale,4*s,0,TWO_PI); ctx.fill(); ctx.restore(); ctx.strokeStyle=COLORS.white; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.stroke(); }
  drawHint(ctx){
    if(this.buildPanel||this.invOpen||this.assetOpen||this.helpOpen) return;
    const p=this.player; let text='Right click: move · E: interact/enter · Space/click: use · B/F: build · I: bag';
    if(this.inside) text='Inside '+(this.inside.name||'building')+' · E at doorway exits · E inside rests/crafts';
    else { const it=this.world.nearestItem(p.x,p.y,36), b=this.world.nearestBuilding(p.x,p.y,80,b=>b.built), c=this.world.nearestCrop(p.x,p.y,34), r=this.world.nearestResource(p.x,p.y,44); if(it) text=`E: pick up ${itemName(it.type)}`; else if(c) text=c.ready?`E: harvest ${itemName(c.plant)}`:c.plant?'Crop growing':'E or Seeds: plant crop'; else if(b) text=BUILDINGS[b.type]?.enterable?`E: enter ${BUILDINGS[b.type]?.name}`:`E: use ${BUILDINGS[b.type]?.name}`; else if(r) text=`${itemName(HOTBAR[this.selectedSlot])}: ${r.type==='tree'?'chop tree':r.type==='rock'?'mine rock':'pick mushroom'}`; }
    ctx.font='bold 13px monospace'; const w=ctx.measureText(text).width+24,x=this.canvas.width/2-w/2,y=this.canvas.height-122*this.uiScale(); this.panel(ctx,x,y,w,28,.72); ctx.textAlign='center'; ctx.fillStyle=COLORS.white; ctx.fillText(text,this.canvas.width/2,y+19);
  }
  drawBuildPanel(ctx){ const s=this.uiScale(), w=640*s,h=420*s,x=this.canvas.width/2-w/2,y=this.canvas.height/2-h/2; this.panel(ctx,x,y,w,h,.94); ctx.font=`bold ${Math.round(26*s)}px monospace`; ctx.textAlign='center'; ctx.fillStyle=COLORS.gold; ctx.fillText('Build Island',x+w/2,y+38*s); ctx.font=`${Math.round(13*s)}px monospace`; ctx.fillStyle=COLORS.white; ctx.fillText('Click a building, then press F in the world to place its frame. Hammer to finish.',x+w/2,y+62*s); let yy=y+88*s; for(const [id,b] of Object.entries(BUILDINGS)){ const bx=x+24*s,bw=w-48*s,bh=48*s; ctx.fillStyle=id===this.currentBuild?'rgba(255,211,106,.28)':'rgba(255,255,255,.08)'; ctx.fillRect(bx,yy,bw,bh); ctx.strokeStyle=id===this.currentBuild?COLORS.gold:'rgba(255,255,255,.22)'; ctx.strokeRect(bx+.5,yy+.5,bw,bh); this.art.drawIcon(ctx,id,bx+26*s,yy+bh/2,34*s); ctx.font=`bold ${Math.round(14*s)}px monospace`; ctx.textAlign='left'; ctx.fillStyle=COLORS.white; ctx.fillText(`${b.name} — ${formatCost(b.cost)}`,bx+54*s,yy+18*s); ctx.font=`${Math.round(12*s)}px monospace`; ctx.fillStyle='rgba(255,255,255,.72)'; ctx.fillText(b.desc,bx+54*s,yy+36*s); this.uiButtons.push({x:bx,y:yy,w:bw,h:bh,cb:()=>{this.currentBuild=id;this.buildPanel=false;this.message(`Selected ${b.name}. Press F to place.`);}}); yy+=56*s; } }
  drawInventory(ctx){ const s=this.uiScale(), w=520*s,h=360*s,x=this.canvas.width/2-w/2,y=this.canvas.height/2-h/2; this.panel(ctx,x,y,w,h,.94); ctx.font=`bold ${Math.round(24*s)}px monospace`; ctx.textAlign='center'; ctx.fillStyle=COLORS.gold; ctx.fillText('Backpack',x+w/2,y+36*s); const entries=Object.entries(this.player.inv).filter(([,q])=>q>0); let cx=x+32*s,cy=y+70*s; for(const [id,q] of entries){ this.art.drawIcon(ctx,id,cx+18*s,cy+18*s,32*s); ctx.font=`bold ${Math.round(13*s)}px monospace`; ctx.textAlign='left'; ctx.fillStyle=COLORS.white; ctx.fillText(`${itemName(id)} × ${q}`,cx+44*s,cy+23*s); cy+=42*s; if(cy>y+h-40*s){ cy=y+70*s; cx+=180*s; } } }
  drawHelp(ctx){ const s=this.uiScale(), w=680*s,h=420*s,x=this.canvas.width/2-w/2,y=this.canvas.height/2-h/2; this.panel(ctx,x,y,w,h,.95); ctx.font=`bold ${Math.round(26*s)}px monospace`; ctx.textAlign='center'; ctx.fillStyle=COLORS.gold; ctx.fillText('Island Controls',x+w/2,y+38*s); ctx.font=`${Math.round(14*s)}px monospace`; ctx.textAlign='left'; ctx.fillStyle=COLORS.white; const lines=['WASD / Arrows move in every direction. Shift runs.','Right click marks a destination and uses A* pathfinding.','Space or left click uses the selected tool. J jumps.','E interacts: pickup, enter buildings, well water, dock fishing, workshop crafting.','B cycles buildings. F places the selected building frame. Hammer finishes it.','Seeds plant crops on farm plots. E harvests ready crops.','Sunnyside assets now drive buildings, farms, trees, animals, interiors and props.']; lines.forEach((l,i)=>ctx.fillText(l,x+32*s,y+82*s+i*36*s)); }
  drawAssetBrowser(ctx){ const keys=['sunnyside_example','sunnyside_tileset','sunnyside_forest','pixelcrawler_floors','pixelcrawler_water','pixelcrawler_resources']; const key=keys[this.assetPage%keys.length], img=this.art.sheets[key]; const pad=28,w=this.canvas.width-pad*2,h=this.canvas.height-pad*2; this.panel(ctx,pad,pad,w,h,.96); ctx.font='bold 24px monospace'; ctx.textAlign='left'; ctx.fillStyle=COLORS.gold; ctx.fillText(key,pad+20,pad+36); ctx.font='14px monospace'; ctx.fillStyle=COLORS.white; ctx.fillText('V closes · [ ] switch Sunnyside source sheets',pad+20,pad+60); if(img){ const scale=Math.min((w-50)/img.width,(h-90)/img.height); const iw=img.width*scale, ih=img.height*scale; ctx.drawImage(img,pad+(w-iw)/2,pad+80,iw,ih); } }
}
