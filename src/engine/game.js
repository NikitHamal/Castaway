import { Input } from './input.js';
import { Art } from './art.js';
import { World } from './world.js';
import { AudioEngine } from './audio.js';
import {
  TILE,
  SAVE_KEY,
  SAVE_VERSION,
  ATTACK_COOLDOWN,
  TWO_PI,
  RENDER_SCALE_BASE,
  SHEET_ORDER,
  SHEET_TITLES,
  COLORS,
  ITEM_INFO,
  HOTBAR,
  BUILD_RECIPES,
  CRAFT_RECIPES,
  QUESTS,
  clamp,
  lerp,
  dist2,
  distance,
  randRange,
  nowId,
  formatCost,
  itemName,
  deepClone,
  addToBag,
  sanitizeBag,
  finiteNumber,
  hasCost,
  payCost,
  bagSummary,
  wrapTextLines
} from './shared.js';

export class Game {
  constructor(canvas){
    this.canvas=canvas; this.ctx=canvas.getContext('2d'); this.ctx.imageSmoothingEnabled=false;
    this.input=new Input(canvas); this.art=new Art(); this.audio=new AudioEngine();
    this.renderScale=RENDER_SCALE_BASE;
    this.camera={x:0,y:0}; this.messages=[]; this.particles=[]; this.floatText=[]; this.uiButtons=[];
    this._lastFootstep=0; this._lastAmbient=null; this._lastMusicState=false; this._touchButtonHits={};
    this.hitStop=0; this.shake=0; this.damageFlash=0;
    this.seed=(Date.now() ^ 0x513ad) & 0x7fffffff; this.overworld=new World(this.seed,'overworld',1); this.world=this.overworld; this.dungeonReturn=null;
    this.player={x:this.world.spawn.x,y:this.world.spawn.y,dir:'down',facing:'right',walk:0,health:100,maxHealth:100,hunger:94,maxHunger:100,stamina:100,maxStamina:100,inv:{axe:1,pickaxe:1,hammer:1,berry:4,banana:1,monkey_munch:1},attackCd:0,invuln:0,charge:0,onRaft:false,respawn:{x:this.world.spawn.x,y:this.world.spawn.y}};
    this.monkeys=[]; this.selectedSlot=0; this.currentBuild='campfire'; this.craftOpen=false; this.helpOpen=false; this.assetOpen=false; this.assetPage=0; this.paused=false; this.gameOver=false; this.win=false;
    this.unlocked={craft:{monkey_munch:true,cooked_meal:true,pickaxe:true,sword:true}, build:{campfire:true,chest:true,workbench:true,bed:true,wall:true,torch:true,raft:true}};
    this.mimic={active:false,monkey:null,phase:'idle'};
    this.time=.36; this.day=1; this.dayTimer=0; this.raidTimer=300; this.questIndex=0; this.island=1;
    this.message('Welcome. Build a camp, tame monkeys, raid a vault, repair the galleon.');
    this.message('Tip: mouse-click aims tools toward the cursor; Space uses your current facing.');
    if(localStorage.getItem(SAVE_KEY)) this.message('Save found: press L to load, or N for a fresh island.');
  }
  resize(){
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.canvas.height = Math.floor(window.innerHeight * dpr);
    this.ctx.imageSmoothingEnabled=false;
    const minDim = Math.min(this.canvas.width, this.canvas.height);
    const isMobile = this.input.isMobile || (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);
    this.renderScale = isMobile
      ? Math.max(1.25, Math.min(2.0, minDim / 360))
      : Math.max(1.0, Math.min(1.6, minDim / 480));
  }
  // Responsive UI scaling — clamps content to the smaller dim so phones still get readable HUD.
  uiScale(){
    const min = Math.min(this.canvas.width, this.canvas.height);
    return clamp(min/720, 0.5, 1.2);
  }
  start(){
    this.resize();
    window.addEventListener('resize',()=>this.resize());
    window.addEventListener('orientationchange',()=>setTimeout(()=>this.resize(),60));
    let last=performance.now();
    const loop=(ts)=>{ const dt=Math.min((ts-last)/1000,.05); last=ts; this.update(dt); this.render(); this.input.endFrame(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  // Audio side-channel: start music + match ambient layer to current biome/time.
  updateAudio(){
    if(!this.audio || !this.audio.unlocked) return;
    // BGM disabled - uncomment to enable: if(!this._lastMusicState){ this.audio.startMusic(); this._lastMusicState=true; }
    let ambient='overworld';
    if(this.world.kind==='dungeon') ambient='dungeon';
    else if(this.nightAmount()>.45) ambient='night';
    if(ambient!==this._lastAmbient){ this.audio.setAmbient(ambient); this._lastAmbient=ambient; }
  }
  message(text, color=COLORS.white){ this.messages.unshift({text,color,t:5}); this.messages=this.messages.slice(0,6); }
  addFloat(text,x,y,color=COLORS.white){ this.floatText.push({text,x,y,t:1.2,color}); }
  update(dt){
    const input=this.input;
    const sc=this.renderScale;
    input.mouse.worldX = input.mouse.x / sc + this.camera.x; input.mouse.worldY = input.mouse.y / sc + this.camera.y;
    this.updateAudio();
    if(input.hit('f1')) this.helpOpen=!this.helpOpen;
    if(input.hit('escape')) { if(this.craftOpen){this.craftOpen=false; this.audio.play('menu_close');} else {this.helpOpen=!this.helpOpen; this.audio.play(this.helpOpen?'menu_open':'menu_close');} }
    if(input.hit('l')) this.loadGame(); if(input.hit('n')) this.newGame();
    this.hitStop=Math.max(0,this.hitStop-dt); this.shake=Math.max(0,this.shake-dt); this.damageFlash=Math.max(0,this.damageFlash-dt*2.8);
    if(this.win || this.gameOver){ if(input.hit('enter')) this.newGame(); return; }
    // Hit-test UI buttons (hotbar slots + craft menu) before tryAction so taps don't both trigger UI and an attack.
    if(input.mouse.clicked){
      const mx=input.mouse.x, my=input.mouse.y;
      for(const b of this.uiButtons){ if(mx>=b.x && my>=b.y && mx<=b.x+b.w && my<=b.y+b.h){ b.cb(); input.mouse.clicked=false; break; } }
    }
    if(this.craftOpen){ /* craft menu uses uiButtons too — already consumed above */ }
    else this.handleHotkeys();
    const simDt=this.hitStop>0?Math.min(dt,.006):dt;
    if(!this.craftOpen && !this.assetOpen && !this.paused) this.updateWorld(simDt);
    for(const m of this.messages) m.t-=dt; this.messages=this.messages.filter(m=>m.t>0);
    for(const f of this.floatText){ f.t-=dt; f.y-=28*dt; } this.floatText=this.floatText.filter(f=>f.t>0);
  }
  handleHotkeys(){
    const input=this.input;
    if(input.hit('v')) { this.assetOpen=!this.assetOpen; this.message(this.assetOpen?'Asset viewer opened. [ / ] pages, V closes.':'Asset viewer closed.'); }
    if(this.assetOpen){ if(input.hit('[')) this.assetPage=(this.assetPage+SHEET_ORDER.length-1)%SHEET_ORDER.length; if(input.hit(']')) this.assetPage=(this.assetPage+1)%SHEET_ORDER.length; return; }
    for(let i=0;i<10;i++) if(input.hit(String((i+1)%10))){ this.selectedSlot=i; this.audio.play('select'); }
    if(input.hit('[')){ this.selectedSlot=(this.selectedSlot+HOTBAR.length-1)%HOTBAR.length; this.audio.play('select'); }
    if(input.hit(']')){ this.selectedSlot=(this.selectedSlot+1)%HOTBAR.length; this.audio.play('select'); }
    if(input.hit('tab')){ this.selectedSlot=(this.selectedSlot+1)%HOTBAR.length; this.audio.play('select'); }
    if(input.hit('b')) this.cycleBuild();
    if(input.hit('f')) this.placeBlueprint();
    if(input.hit('c')){ this.craftOpen=true; this.audio.play('menu_open'); }
    if(input.hit('m')) this.toggleMimic();
    if(input.hit('e')) this.tryInteract();
    if(input.hit('space') || input.mouse.clicked) this.tryAction(input.mouse.clicked);
    if(input.mouse.rightClicked) this.placeBlueprintAt(input.mouse.worldX,input.mouse.worldY);
  }
  updateWorld(dt){
    this.time += dt/420; if(this.time>=1){ this.time-=1; this.day++; this.message(`Day ${this.day}. The island shifts with the tide.`); }
    this.raidTimer -= dt; if(this.raidTimer<=0){ this.startRaid(); this.raidTimer = 300 + this.day*45; }
    this.updatePlayer(dt); this.updateItems(dt); this.updateParticles(dt); this.updateMonkeys(dt); this.updateEnemies(dt); this.updateBlueprints(); this.updateQuest();
    const vw=this.canvas.width/this.renderScale, vh=this.canvas.height/this.renderScale;
    this.camera.x = clamp(this.player.x - vw/2, 0, this.world.w*TILE - vw);
    this.camera.y = clamp(this.player.y - vh/2, 0, this.world.h*TILE - vh);
  }
  updatePlayer(dt){
    const p=this.player, input=this.input;
    let dx=0,dy=0; if(input.down('w')||input.down('arrowup')) dy--; if(input.down('s')||input.down('arrowdown')) dy++; if(input.down('a')||input.down('arrowleft')) dx--; if(input.down('d')||input.down('arrowright')) dx++;
    if(dx||dy){ const len=Math.hypot(dx,dy); dx/=len; dy/=len; if(Math.abs(dx)>.05) p.facing=dx<0?'left':'right'; p.dir=Math.abs(dx)>Math.abs(dy)?'side':(dy<0?'up':'down'); p.walk += dt*(p.onRaft?4:7); const sprint=input.down('shift') && p.stamina>5 && p.hunger>0; let speed=(p.onRaft?130:118)*(sprint?1.42:1); if(sprint) p.stamina=Math.max(0,p.stamina-18*dt); this.moveEntity(p,dx*speed*dt,dy*speed*dt,{onRaft:p.onRaft}); const tt=this.world.tile(Math.floor(p.x/TILE),Math.floor(p.y/TILE)); const ff=tt==='sand'?420:tt==='shallow'?620:tt==='swamp'?260:340; this.audio.play('footstep',{freq:ff, volume: sprint?1:.7}); }
    p.attackCd=Math.max(0,p.attackCd-dt); p.invuln=Math.max(0,p.invuln-dt);
    p.hunger=Math.max(0,p.hunger-dt*(p.onRaft ? .68 : .42));
    if(p.hunger<=0) this.damagePlayer(4*dt); else p.stamina=clamp(p.stamina+30*dt,0,p.maxStamina);
    const tile=this.world.tile(Math.floor(p.x/TILE),Math.floor(p.y/TILE));
    if(tile==='swamp' && !p.onRaft){ p.stamina=Math.max(0,p.stamina-10*dt); if(Math.random()<dt*.25) this.addFloat('poison fumes',p.x,p.y-40,'#b8ff78'); }
    if(tile==='ash' && !p.onRaft && Math.random()<dt*.2) { this.damagePlayer(2); this.addFloat('hot ash',p.x,p.y-40,COLORS.orange); }
  }
  moveEntity(e,dx,dy,opts={}){
    const r=opts.radius||10; const w=this.world; const ox=e.x, oy=e.y;
    if(!w.isBlocked(e.x+dx,e.y,r,opts)) e.x+=dx;
    if(!w.isBlocked(e.x,e.y+dy,r,opts)) e.y+=dy;
    e.x=clamp(e.x,8,w.w*TILE-8); e.y=clamp(e.y,8,w.h*TILE-8);
    return distance(ox,oy,e.x,e.y);
  }
  lineClear(x1,y1,x2,y2,r=9,opts={}){
    const d=distance(x1,y1,x2,y2), steps=Math.max(1,Math.ceil(d/18));
    for(let i=1;i<=steps;i++){ const t=i/steps, x=lerp(x1,x2,t), y=lerp(y1,y2,t); if(this.world.isBlocked(x,y,r,opts)) return false; }
    return true;
  }
  moveToward(e,x,y,speed,dt,opts={}){
    const d=distance(e.x,e.y,x,y); if(d<=4) return d;
    const radius=opts.radius||9; let tx=x, ty=y;
    if(opts.route!==false && !this.lineClear(e.x,e.y,x,y,radius,opts)){
      e.pathTimer=(e.pathTimer||0)-dt; const gx=Math.floor(x/TILE), gy=Math.floor(y/TILE);
      if(!e.path || e.pathTimer<=0 || e.pathGoalX!==gx || e.pathGoalY!==gy){ e.path=this.world.findPath(e.x,e.y,x,y,{...opts,maxNodes:opts.maxNodes||1200}); e.pathGoalX=gx; e.pathGoalY=gy; e.pathTimer=.45+Math.random()*.25; }
      if(e.path && e.path.length){ while(e.path.length && distance(e.x,e.y,e.path[0].x,e.path[0].y)<12) e.path.shift(); if(e.path.length){ tx=e.path[0].x; ty=e.path[0].y; } }
    }
    const pd=distance(e.x,e.y,tx,ty); if(pd<=0.01) return d;
    const vx=(tx-e.x)/pd, vy=(ty-e.y)/pd;
    if(Math.abs(vx)>.15) e.facing=vx<0?'left':'right'; else e.facing=vy<0?'up':'down';
    const moved=this.moveEntity(e,vx*speed*dt,vy*speed*dt,{...opts,radius});
    e.stuckTime = moved<.2 ? (e.stuckTime||0)+dt : 0;
    if(e.stuckTime>.6){ e.pathTimer=0; e.stuckTime=0; }
    return d;
  }
  screenImpact(power=.12){ this.hitStop=Math.max(this.hitStop,Math.min(.16,power)); this.shake=Math.max(this.shake,Math.min(.35,power*1.8)); }
  updateItems(dt){ for(const it of this.world.items){ it.t+=dt; it.x += it.vx*dt; it.y += it.vy*dt; it.vx*=Math.pow(.05,dt); it.vy*=Math.pow(.05,dt); } }
  updateParticles(dt){
    for(const p of this.particles){ p.t-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=90*dt; }
    this.particles=this.particles.filter(p=>p.t>0);
  }
  emitChips(x,y,color,n=8){ for(let i=0;i<n;i++) this.particles.push({x,y,vx:(Math.random()-.5)*90,vy:-Math.random()*80,t:.55+Math.random()*.35,color,size:2+Math.random()*3}); }
  cycleBuild(){ const ids=Object.keys(BUILD_RECIPES).filter(id=>this.unlocked.build[id]); const idx=ids.indexOf(this.currentBuild); this.currentBuild=ids[(idx+1)%ids.length]; this.message(`Blueprint selected: ${BUILD_RECIPES[this.currentBuild].name}`); }
  currentHotbarItem(){ return HOTBAR[this.selectedSlot] || HOTBAR[0]; }
  toggleMimic(){
    if(this.monkeys.filter(m=>m.tamed).length===0){ this.message('No tamed monkeys. Feed Monkey Munch to a caged or wild monkey first.'); return; }
    this.mimic.active=!this.mimic.active; this.mimic.monkey=null; this.mimic.phase='select';
    this.message(this.mimic.active?'Mimic Mode: stand near a monkey and press E, then perform the action to record.':'Mimic Mode cancelled.');
  }
  tryInteract(){
    const p=this.player, w=this.world;
    // Select a monkey in mimic mode first.
    const nearMonkey=this.nearestMonkey(p.x,p.y,52,m=>m.tamed);
    if(this.mimic.active && nearMonkey){ this.mimic.monkey=nearMonkey; this.mimic.phase='record'; this.message(`${nearMonkey.name} is watching. Do one action: chop, mine, pick up, deposit, build, craft or attack.`); return; }
    // Pick up items.
    let picked=[];
    for(const it of [...w.items]) if(distance(p.x,p.y,it.x,it.y)<42){ addToBag(p.inv,it.type,it.qty); picked.push(`${it.qty}× ${itemName(it.type)}`); w.removeItem(it.id); this.discoverFromItem(it.type); }
    if(picked.length){ this.message(`Picked up ${picked.join(', ')}.`); this.audio.play('pickup'); this.recordAction({kind:'pickup'}); return; }
    // Tame monkey from cage or wild.
    const cage=w.nearestBuilding(p.x,p.y,b=>b.type==='cage'&&b.cagedMonkey,58);
    if(cage){ if((p.inv.monkey_munch||0)>0){ addToBag(p.inv,'monkey_munch',-1); cage.cagedMonkey=false; const m=this.spawnMonkey(cage.x,cage.y-10,true); this.message(`${m.name} joined your crew. Press M to teach it.`); this.audio.play('tame'); this.audio.play('monkey_chitter'); this.recordAction({kind:'tame'}); } else this.message('A monkey rattles the cage. It wants Monkey Munch.'); return; }
    const wild=this.nearestMonkey(p.x,p.y,48,m=>!m.tamed);
    if(wild){ if((p.inv.monkey_munch||0)>0){ addToBag(p.inv,'monkey_munch',-1); wild.tamed=true; wild.name=this.nextMonkeyName(); this.message(`${wild.name} has been tamed. Press M to teach it.`); this.audio.play('tame'); this.audio.play('monkey_chitter'); } else this.message('The monkey sniffs your pack. Craft Monkey Munch to tame it.'); return; }
    // Blueprint resource add.
    const bp=w.nearestBlueprint(p.x,p.y,null,56);
    if(bp){ this.addResourcesToBlueprint(bp,p.inv); this.recordAction({kind:'blueprint_add', blueprintType:bp.type}); return; }
    // Building interactions.
    const b=w.nearestBuilding(p.x,p.y,null,64);
    if(b){ this.interactBuilding(b); return; }
    // Bush hand gather.
    const bush=w.nearestResource(p.x,p.y,r=>r.type==='bush',42);
    if(bush){ this.hitResource(bush,1,'hand'); this.recordAction({kind:'hit_resource',resourceType:'bush',tool:'hand'}); return; }
    this.message('Nothing close enough to interact with.');
  }
  interactBuilding(b){
    const p=this.player;
    if(b.type==='chest'){
      if(b.dungeonLoot){ this.lootChest(b); return; }
      if(this.input.down('shift')){
        const got=this.withdrawFromChest(b,p.inv);
        this.message(got ? `Withdrew ${got}.` : `Chest contains: ${bagSummary(b.storage||{}) || 'nothing'}.`);
      } else {
        const moved=this.depositToChest(b,p.inv);
        if(moved) { this.message(`Deposited ${moved}. Hold Shift+E to withdraw.`); this.audio.play('deposit'); this.recordAction({kind:'deposit',buildingType:'chest'}); }
        else this.message(`Chest contains: ${bagSummary(b.storage||{}) || 'nothing'}. Hold Shift+E to withdraw.`);
      }
    } else if(b.type==='bed'){
      p.respawn={x:b.x,y:b.y}; this.saveGame(); this.message('Saved at bed. Respawn point set.');
    } else if(b.type==='campfire'){
      if((p.inv.berry||0)>=2 && (p.inv.wood||0)>=1){ payCost(p.inv,{berry:2,wood:1}); addToBag(p.inv,'cooked_meal',1); this.message('Cooked a meal at the campfire.'); }
      else { p.health=clamp(p.health+8,0,p.maxHealth); this.message('You warm up by the fire. Need 2 berries + 1 wood to cook.'); }
    } else if(b.type==='workbench' || b.type==='forge'){
      this.craftOpen=true; this.message(`${itemName(b.type)} ready. Queue a recipe, then hammer it or teach a monkey Craft.`);
    } else if(b.type==='raft'){
      this.sailToNewIsland();
    } else if(b.type==='vault'){
      this.enterDungeon();
    } else if(b.type==='galleon'){
      this.tryRepairGalleon(b);
    } else if(b.type==='portal'){
      this.exitDungeon();
    } else if(b.type==='totem'){
      this.message('The totem hums: “Monkeys copy what they see. Show, then let go.”');
    }
  }
  depositToChest(chest,bag){
    chest.storage=chest.storage||{}; const moved=[];
    for(const [k,v] of Object.entries({...bag})){
      if(v>0 && !ITEM_INFO[k]?.tool){ addToBag(chest.storage,k,v); addToBag(bag,k,-v); moved.push(`${v}× ${itemName(k)}`); }
    }
    return moved.join(', ');
  }
  withdrawFromChest(chest,bag){
    chest.storage=chest.storage||{}; const moved=[];
    for(const [k,v] of Object.entries({...chest.storage})){
      if(v>0){ addToBag(bag,k,v); addToBag(chest.storage,k,-v); moved.push(`${v}× ${itemName(k)}`); this.discoverFromItem(k); }
    }
    return moved.join(', ');
  }
  lootChest(chest){
    if(chest.locked){ this.message('The vault chest is sealed. Defeat the guardian first.'); return; }
    const got=this.withdrawFromChest(chest,this.player.inv);
    this.message(got ? `Vault loot claimed: ${got}.` : 'The vault chest is empty.');
  }
  addResourcesToBlueprint(bp,bag,fromMonkey=null){
    let moved=[];
    for(const [k,need] of Object.entries(bp.cost)){
      const have=bp.added[k]||0; const miss=need-have; if(miss<=0) continue;
      const amt=Math.min(miss, bag[k]||0); if(amt>0){ addToBag(bag,k,-amt); bp.added[k]=(bp.added[k]||0)+amt; moved.push(`${amt} ${itemName(k)}`); }
    }
    bp.ready=Object.entries(bp.cost).every(([k,v])=>(bp.added[k]||0)>=v);
    if(moved.length){ if(!fromMonkey) this.message(`Added ${moved.join(', ')} to ${BUILD_RECIPES[bp.type].name}.`); }
    else if(!fromMonkey) this.message(`Need ${formatCost(this.missingCost(bp))}.`);
  }
  missingCost(bp){ const out={}; for(const [k,v] of Object.entries(bp.cost)){ const m=v-(bp.added[k]||0); if(m>0) out[k]=m; } return out; }
  tryAction(fromMouse=false){
    const p=this.player; if(p.attackCd>0) return;
    const item=this.currentHotbarItem();
    if(ITEM_INFO[item]?.food || item==='cooked_meal'){ this.eat(item); return; }
    if(item==='monkey_munch'){ const before=(p.inv.monkey_munch||0); this.tryInteract(); if((p.inv.monkey_munch||0)===before) this.message('Use Monkey Munch near a monkey or cage.'); return; }
    if(fromMouse) this.faceToward(this.input.mouse.worldX,this.input.mouse.worldY);
    const target=this.findActionTarget(fromMouse);
    if(target.enemy) this.faceToward(target.enemy.x,target.enemy.y); else if(target.resource) this.faceToward(target.resource.x,target.resource.y);
    if(item==='hammer'){
      const bp=this.world.nearestBlueprint(p.x,p.y,null,62);
      if(bp){ this.hammerBlueprint(bp,p); this.recordAction({kind:'hammer_blueprint',blueprintType:bp.type}); return; }
      const station=this.world.nearestBuilding(p.x,p.y,b=>(b.type==='workbench'||b.type==='forge') && b.queue && b.queue.length,64);
      if(station){ this.hammerStation(station,1.2); this.recordAction({kind:'workbench_hammer',station:station.type}); return; }
    }
    if((item==='sword'||item==='metal_sword') && target.enemy){ this.attackEnemy(target.enemy,item); this.recordAction({kind:'attack',weapon:item}); return; }
    if(item==='axe' && target.resource && (target.resource.type==='tree'||target.resource.type==='bush')){ this.consumeStamina(12) && this.hitResource(target.resource, item==='axe'?1.5:1, item); this.recordAction({kind:'hit_resource',resourceType:target.resource.type,tool:item}); return; }
    if(item==='pickaxe' && target.resource && (target.resource.type==='rock'||target.resource.type==='iron')){ this.consumeStamina(13) && this.hitResource(target.resource, 1.4, item); this.recordAction({kind:'hit_resource',resourceType:target.resource.type,tool:item}); return; }
    if(target.enemy){ this.attackEnemy(target.enemy,item==='axe'?'axe':'hand'); this.recordAction({kind:'attack',weapon:item}); return; }
    if(target.resource){
      if(target.resource.type==='bush'){ this.consumeStamina(5) && this.hitResource(target.resource,1,'hand'); this.recordAction({kind:'hit_resource',resourceType:'bush',tool:'hand'}); }
      else this.message(`Need the right tool: ${target.resource.type==='tree'?'axe':'pickaxe'}.`);
      return;
    }
    // buildable selected in hotbar acts as blueprint placement.
    if(BUILD_RECIPES[item]){ this.placeBlueprint(); return; }
    this.message('No target in reach. Aim at a resource, enemy, blueprint or station.');
  }
  consumeStamina(cost){ if(this.player.stamina<cost){ this.message('Too tired. Let stamina refill.'); return false; } this.player.stamina-=cost; this.player.attackCd=ATTACK_COOLDOWN; return true; }
  faceToward(wx,wy){
    const p=this.player, dx=wx-p.x, dy=wy-p.y;
    if(Math.abs(dx)>3) p.facing=dx<0?'left':'right';
    if(Math.abs(dx)>Math.abs(dy)*.75){ p.dir='side'; }
    else if(dy<0) p.dir='up'; else p.dir='down';
  }
  findActionTarget(fromMouse=false){
    const p=this.player; const tx=fromMouse?this.input.mouse.worldX:p.x+(p.dir==='side'?(p.facing==='left'?-38:38):0), ty=fromMouse?this.input.mouse.worldY:p.y+(p.dir==='up'?-38:p.dir==='down'?38:0);
    const maxReach=fromMouse?92:64;
    let bestResource=null, bestEnemy=null, br=99999, be=99999;
    for(const r of this.world.resources){ const d=dist2(tx,ty,r.x,r.y); const pr=dist2(p.x,p.y,r.x,r.y); if(d<br && pr<maxReach*maxReach){ br=d; bestResource=r; } }
    for(const e of this.world.enemies){ const d=dist2(tx,ty,e.x,e.y); const pr=dist2(p.x,p.y,e.x,e.y); if(d<be && pr<(maxReach+8)*(maxReach+8)){ be=d; bestEnemy=e; } }
    return {resource: br<be?bestResource:null, enemy: be<=br?bestEnemy:null};
  }
  eat(item){
    const p=this.player; if((p.inv[item]||0)<=0){ this.message(`You have no ${itemName(item)}.`); return; }
    const food=ITEM_INFO[item]?.food || 44; addToBag(p.inv,item,-1); p.hunger=clamp(p.hunger+food,0,p.maxHunger); p.health=clamp(p.health+food*.22,0,p.maxHealth); this.addFloat(`+${food} food`,p.x,p.y-48,COLORS.yellow); this.message(`Ate ${itemName(item)}.`); this.audio.play('eat');
  }
  hitResource(r,power,tool){
    r.hp-=power; r.hitFlash=.12; this.screenImpact(.045); this.emitChips(r.x,r.y-18,r.type==='tree'?COLORS.wood:(r.type==='bush'?COLORS.grassLight:COLORS.stoneLight),8); this.addFloat('-',r.x,r.y-30,'#fff');
    if(r.type==='tree'||r.type==='bush') this.audio.play('chop'); else this.audio.play('mine');
    if(r.hp<=0){
      if(r.type==='tree'){ this.world.addItem('wood',r.x,r.y,2+Math.floor(Math.random()*3)); this.world.addItem('fiber',r.x+8,r.y,1+Math.floor(Math.random()*2)); if(Math.random()<.35) this.world.addItem('banana',r.x-8,r.y,1); }
      else if(r.type==='rock'){ this.world.addItem('stone',r.x,r.y,2+Math.floor(Math.random()*3)); if(Math.random()<.18) this.world.addItem('iron',r.x+8,r.y,1); }
      else if(r.type==='iron'){ this.world.addItem('iron',r.x,r.y,2+Math.floor(Math.random()*2)); this.world.addItem('stone',r.x+8,r.y,1+Math.floor(Math.random()*2)); }
      else if(r.type==='bush'){ this.world.addItem('berry',r.x,r.y,1+Math.floor(Math.random()*3)); this.world.addItem('fiber',r.x+7,r.y,1); }
      this.world.removeResource(r.id); this.message(`${itemName(tool)} harvested ${r.type}.`);
    }
  }
  attackEnemy(e,weapon){
    const dmg = weapon==='metal_sword'?34:(weapon==='sword'?22:(weapon==='axe'?13:6));
    const cost = weapon==='metal_sword'?16:(weapon==='hand'?5:12);
    if(!this.consumeStamina(cost)) return;
    this.faceToward(e.x,e.y);
    this.audio.play(weapon==='metal_sword'?'attack_metal':'attack_swing');
    this.audio.play('hit_flesh',{volume:.7});
    const d=Math.max(1,distance(this.player.x,this.player.y,e.x,e.y));
    const kx=(e.x-this.player.x)/d, ky=(e.y-this.player.y)/d;
    e.hp-=dmg; e.hitFlash=.22; e.pathTimer=0;
    this.moveEntity(e,kx*(weapon==='metal_sword'?18:12),ky*(weapon==='metal_sword'?18:12),{radius:e.type==='boss'?16:10});
    this.screenImpact(e.type==='boss'?.13:.09);
    this.emitChips(e.x,e.y-18, e.type==='boss'?'#ff6a55':'#9cff83',14);
    this.addFloat(`-${dmg}`,e.x,e.y-35,weapon==='metal_sword'?COLORS.cyan:COLORS.white);
    if(e.hp<=0) this.killEnemy(e);
  }
  killEnemy(e){
    this.world.removeEnemy(e.id); this.world.addItem(e.type==='boss'?'core':'stone',e.x,e.y,e.type==='boss'?1:1); if(Math.random()<.5) this.world.addItem('banana',e.x+8,e.y,1); if(e.type==='boss'){ this.message('Vault guardian defeated! The treasure chest is unlocked.'); for(const b of this.world.buildings) if(b.dungeonLoot) b.locked=false; }
  }
  hammerBlueprint(bp,actor){
    if(!bp.ready){ this.addResourcesToBlueprint(bp,this.player.inv); if(!bp.ready) return; }
    if(actor===this.player && !this.consumeStamina(8)) return;
    bp.progress += actor===this.player ? 1.25 : .8;
    this.emitChips(bp.x,bp.y-20,COLORS.yellow,5);
    if(bp.progress>=bp.needProgress){
      const b=this.world.addBuilding(bp.type,bp.x,bp.y,{}); if(bp.type==='bed') this.player.respawn={x:b.x,y:b.y}; this.world.removeBlueprint(bp.id); this.message(`${BUILD_RECIPES[bp.type].name} built.`); this.onBuildComplete(bp.type);
    }
  }
  onBuildComplete(type){ this.audio.play('build_complete'); if(type==='workbench'){ this.unlocked.craft.pickaxe=true; this.unlocked.craft.sword=true; this.message('Discovery: Workbench recipes unlocked. Queue tools from C.'); } if(type==='forge') this.unlocked.craft.metal_sword=true; if(type==='raft') this.message('Raft ready. Interact with it to sail to another island.'); }
  placeBlueprint(){
    const item=this.currentHotbarItem(); const type=BUILD_RECIPES[item]?item:this.currentBuild; this.placeBlueprintAt(this.player.x + (this.player.dir==='side'?(this.player.facing==='left'?-42:42):0), this.player.y + (this.player.dir==='up'?-42:this.player.dir==='down'?42:0), type);
  }
  placeBlueprintAt(wx,wy,type=null){
    type=type||this.currentBuild; if(!this.unlocked.build[type]){ this.message('Blueprint locked.'); return; }
    const tx=Math.floor(wx/TILE), ty=Math.floor(wy/TILE); const x=tx*TILE+TILE/2, y=ty*TILE+TILE*.72;
    if(this.world.isBlocked(x,y,22,{onRaft:false}) || this.world.tile(tx,ty)==='water' || this.world.tile(tx,ty)==='lava'){ this.message('Cannot place blueprint there.'); return; }
    const bp=this.world.addBlueprint(type,x,y); this.message(`${BUILD_RECIPES[type].name} blueprint placed. Press E to add resources, hammer to build.`); this.audio.play('place'); this.recordAction({kind:'place_blueprint',blueprintType:type}); return bp;
  }
  updateBlueprints(){ for(const bp of this.world.blueprints){ bp.ready=Object.entries(bp.cost).every(([k,v])=>(bp.added[k]||0)>=v); } }
  updateCraftMenuInput(){
    if(this.input.mouse.clicked){ const mx=this.input.mouse.x,my=this.input.mouse.y; for(const b of this.uiButtons){ if(mx>=b.x && my>=b.y && mx<=b.x+b.w && my<=b.y+b.h){ b.cb(); break; } } }
  }
  craftRecipe(id){
    const r=CRAFT_RECIPES[id]; if(!r || !this.unlocked.craft[id]) return;
    const p=this.player;
    if(r.stationNear){ const near=this.world.nearestBuilding(p.x,p.y,b=>b.type===r.stationNear,70); if(!near){ this.message(`Stand near a ${itemName(r.stationNear)}.`); return; } }
    if(r.station){ const station=this.world.nearestBuilding(p.x,p.y,b=>b.type===r.station,80); if(!station){ this.message(`Need to stand near a ${itemName(r.station)}.`); return; } if(!payCost(p.inv,r.cost)){ this.message(`Missing: ${formatCost(r.cost)}.`); return; } station.queue=station.queue||[]; station.queue.push({id,name:r.name,result:deepClone(r.result),progress:0,need:r.craftTime||5,unlockBuild:r.unlockBuild}); this.message(`${r.name} queued. Hammer the ${itemName(station.type)} or teach a monkey Craft.`); return; }
    if(!payCost(p.inv,r.cost)){ this.message(`Missing: ${formatCost(r.cost)}.`); return; }
    for(const [k,v] of Object.entries(r.result||{})) addToBag(p.inv,k,v);
    this.message(`Crafted ${r.name}.`); this.audio.play('craft');
  }
  hammerStation(station,amt){
    if(!station.queue || !station.queue.length){ this.message('No queued work here.'); return; }
    const job=station.queue[0]; job.progress+=amt; this.emitChips(station.x,station.y-26,COLORS.yellow,4);
    if(job.progress>=job.need){
      station.queue.shift();
      if(job.unlockBuild){ this.unlocked.build[job.unlockBuild]=true; this.message(`Blueprint unlocked: ${BUILD_RECIPES[job.unlockBuild].name}.`); }
      for(const [k,v] of Object.entries(job.result||{})) this.world.addItem(k,station.x+randRange(Math.random,-15,15),station.y-8,v);
      this.message(`${job.name} complete.`);
    }
  }
  findRaidSpawn(){
    for(let tries=0; tries<90; tries++){
      const side=Math.floor(Math.random()*4);
      const tx=side===0?1:side===1?this.world.w-2:Math.floor(randRange(Math.random,2,this.world.w-2));
      const ty=side===2?1:side===3?this.world.h-2:Math.floor(randRange(Math.random,2,this.world.h-2));
      const x=tx*TILE+TILE/2, y=ty*TILE+TILE/2;
      if(this.world.isWalkableTile(tx,ty,{onRaft:false}) && !this.world.isBlocked(x,y,11,{onRaft:false})) return {x,y};
    }
    const p=this.player;
    for(let r=12;r<36;r+=4) for(let a=0;a<TWO_PI;a+=Math.PI/5){
      const x=clamp(p.x+Math.cos(a)*r*TILE,18,this.world.w*TILE-18), y=clamp(p.y+Math.sin(a)*r*TILE,18,this.world.h*TILE-18);
      if(!this.world.isBlocked(x,y,11,{onRaft:false})) return {x,y};
    }
    return {x:this.world.spawn.x,y:this.world.spawn.y};
  }
  startRaid(){
    if(this.world.kind!=='overworld') return;
    const count=Math.min(6,1+Math.floor(this.day/2)); this.message(`Raid! ${count} goblin${count>1?'s are':' is'} probing your camp.`, COLORS.orange); this.audio.play('raid_alert');
    for(let i=0;i<count;i++){
      const spawn=this.findRaidSpawn();
      this.world.addEnemy('goblin',spawn.x,spawn.y,{raid:true,path:[],pathTimer:0});
    }
  }
  updateEnemies(dt){
    const w=this.world,p=this.player;
    for(const e of [...w.enemies]){
      e.attackCd=Math.max(0,e.attackCd-dt); e.hitFlash=Math.max(0,e.hitFlash-dt);
      let target={x:p.x,y:p.y,type:'player'};
      const combatMonkey=this.nearestMonkey(e.x,e.y,260,m=>m.tamed && m.order && m.order.type==='combat'); if(combatMonkey && distance(e.x,e.y,combatMonkey.x,combatMonkey.y)<distance(e.x,e.y,p.x,p.y)) target={x:combatMonkey.x,y:combatMonkey.y,type:'monkey',ref:combatMonkey};
      if(e.raid){ const base=w.nearestBuilding(e.x,e.y,b=>['chest','campfire','workbench','bed','wall'].includes(b.type),99999); if(base && distance(e.x,e.y,p.x,p.y)>180) target={x:base.x,y:base.y,type:'building',ref:base}; }
      const d=distance(e.x,e.y,target.x,target.y);
      if(d>28){ const speed=e.type==='boss'?50:70; this.moveToward(e,target.x,target.y,speed,dt,{radius:e.type==='boss'?16:10}); e.walk+=dt; }
      else if(e.attackCd<=0){ e.attackCd=e.type==='boss'?1.2:.85; e.hitFlash=.08; if(target.type==='player') this.damagePlayer(e.type==='boss'?22:10); else if(target.type==='monkey') this.damageMonkey(target.ref,e.type==='boss'?20:8); else if(target.type==='building') this.damageBuilding(target.ref,e.type==='boss'?22:8); }
    }
  }
  damagePlayer(amount){ const p=this.player; if(p.invuln>0 && amount>=1) return; p.health-=amount; if(amount>=1) { p.invuln=.55; this.damageFlash=1; this.screenImpact(.11); this.emitChips(p.x,p.y-18,COLORS.red,8); this.addFloat(`-${Math.ceil(amount)}`,p.x,p.y-48,COLORS.red); this.audio.play('damage'); } if(p.health<=0){ this.playerDeath(); } }
  damageMonkey(m,amt){ m.hp-=amt; m.hitFlash=.2; this.emitChips(m.x,m.y-20,COLORS.red,5); this.addFloat('ouch',m.x,m.y-34,COLORS.red); if(m.hp<=0){ m.hp=m.maxHp; m.x=this.player.x+20; m.y=this.player.y+20; m.order=null; m.carry=null; m.path=[]; this.message(`${m.name} fled, recovered, and forgot its task.`); } }
  damageBuilding(b,amt){ if(!b.hp || b.hp>900) b.hp=BUILD_RECIPES[b.type]?.hp||90; b.hp-=amt; b.hitFlash=.2; this.emitChips(b.x,b.y-10,COLORS.wood,6); if(b.hp<=0){ const i=this.world.buildings.indexOf(b); if(i>=0) this.world.buildings.splice(i,1); this.message(`${itemName(b.type)} was destroyed!`); } }
  playerDeath(){ this.audio.play('death'); this.player.health=this.player.maxHealth; this.player.hunger=Math.max(35,this.player.hunger); this.player.stamina=this.player.maxStamina; this.player.x=this.player.respawn.x; this.player.y=this.player.respawn.y; this.message('You collapsed and woke up at your bed/spawn.', COLORS.red); }
  spawnMonkey(x,y,tamed=false){ const m={id:nowId(),x,y,tamed,name:tamed?this.nextMonkeyName():'Wild Monkey',hp:60,maxHp:60,walk:0,order:null,carry:null,attackCd:0,actCd:0,target:null,path:[],pathTimer:0,wander:Math.random()*TWO_PI}; this.monkeys.push(m); return m; }
  nextMonkeyName(){ const names=['Momo','Pip','Bongo','Kiki','Nana','Tiko','Bibi','Coco']; return names[this.monkeys.filter(m=>m.tamed).length%names.length]; }
  nearestMonkey(x,y,maxD,pred=null){ let best=null,bd=maxD*maxD; for(const m of this.monkeys){ if(pred && !pred(m)) continue; const d=dist2(x,y,m.x,m.y); if(d<bd){bd=d;best=m;} } return best; }
  updateMonkeys(dt){
    // Spawn visible caged monkeys as entities if cage opened already. Wild ambient monkeys.
    if(this.monkeys.length<1 && this.world.kind==='overworld') this.spawnMonkey(this.world.spawn.x+90,this.world.spawn.y+80,false);
    for(const m of this.monkeys){ m.attackCd=Math.max(0,m.attackCd-dt); m.actCd=Math.max(0,m.actCd-dt); m.hitFlash=Math.max(0,(m.hitFlash||0)-dt); m.walk+=dt; if(!m.tamed){ this.updateWildMonkey(m,dt); continue; } if(!m.order) this.monkeyFollow(m,dt); else this.updateMonkeyOrder(m,dt); }
  }
  updateWildMonkey(m,dt){ m.wander += (Math.random()-.5)*dt*2; if(Math.random()<dt*.05) m.wander=Math.random()*TWO_PI; const vx=Math.cos(m.wander), vy=Math.sin(m.wander); if(Math.abs(vx)>.15) m.facing=vx<0?'left':'right'; else m.facing=vy<0?'up':'down'; this.moveEntity(m,vx*22*dt,vy*22*dt,{radius:9}); }
  monkeyFollow(m,dt){ const p=this.player; const d=distance(m.x,m.y,p.x,p.y); if(d>66) this.moveToward(m,p.x,p.y,94,dt,{radius:9,maxNodes:900}); }
  updateMonkeyOrder(m,dt){
    if(m.order.type==='harvest') this.monkeyHarvest(m,dt);
    else if(m.order.type==='gather') this.monkeyGather(m,dt);
    else if(m.order.type==='build') this.monkeyBuild(m,dt);
    else if(m.order.type==='craft') this.monkeyCraft(m,dt);
    else if(m.order.type==='combat') this.monkeyCombat(m,dt);
  }
  monkeyMoveTo(m,x,y,speed,dt){ return this.moveToward(m,x,y,speed,dt,{radius:9}); }
  monkeyHarvest(m,dt){
    if(m.carry){ this.monkeyDepositCarry(m,dt); return; }
    const type=m.order.resourceType; const target=this.world.nearestResource(m.x,m.y,r=> type==='tree'?r.type==='tree': type==='rock'?r.type==='rock'||r.type==='iron': r.type===type,99999);
    if(!target){ this.monkeyFollow(m,dt); return; }
    const d=this.monkeyMoveTo(m,target.x,target.y,84,dt); if(d<42 && m.actCd<=0){ m.actCd=.75; target.hp-=1; this.emitChips(target.x,target.y-16,target.type==='tree'?COLORS.wood:COLORS.stone,5); if(target.hp<=0){ const before=this.world.items.length; this.hitResource(target,999,m.order.tool||'monkey'); // pick newest nearby item
        const item=this.world.nearestItem(m.x,m.y,null,65); if(item) this.monkeyPickupItem(m,item); }
    }
  }
  monkeyPickupItem(m,item){ m.carry={type:item.type,qty:Math.min(item.qty,5)}; item.qty-=m.carry.qty; if(item.qty<=0) this.world.removeItem(item.id); }
  monkeyDepositCarry(m,dt){
    if(!m.carry) return;
    const chest=this.world.nearestBuilding(m.x,m.y,b=>b.type==='chest',99999); if(!chest){ if(distance(m.x,m.y,this.player.x,this.player.y)>38) this.monkeyMoveTo(m,this.player.x,this.player.y,85,dt); else { this.world.addItem(m.carry.type,m.x,m.y,m.carry.qty); m.carry=null; } return; }
    const d=this.monkeyMoveTo(m,chest.x,chest.y,86,dt); if(d<40){ chest.storage=chest.storage||{}; addToBag(chest.storage,m.carry.type,m.carry.qty); this.addFloat(`${m.carry.qty} ${itemName(m.carry.type)}`,chest.x,chest.y-36,COLORS.yellow); m.carry=null; m.targetId=null; }
  }
  monkeyGather(m,dt){
    if(m.carry){ this.monkeyDepositCarry(m,dt); return; }
    let item=m.targetId?this.world.items.find(i=>i.id===m.targetId):null;
    if(!item){ item=this.world.nearestItem(m.x,m.y,null,99999); m.targetId=item?.id||null; }
    if(!item){ this.monkeyFollow(m,dt); return; }
    const d=this.monkeyMoveTo(m,item.x,item.y,92,dt); if(d<28){ this.monkeyPickupItem(m,item); m.targetId=null; }
  }
  monkeyBuild(m,dt){
    const bp=this.world.nearestBlueprint(m.x,m.y,null,99999); if(!bp){ this.monkeyFollow(m,dt); return; }
    if(m.carry){ const bag={[m.carry.type]:m.carry.qty}; this.addResourcesToBlueprint(bp,bag,m); const left=bag[m.carry.type]||0; m.carry=left>0?{type:m.carry.type,qty:left}:null; if(m.carry) this.monkeyDepositCarry(m,dt); return; }
    if(bp.ready){ const d=this.monkeyMoveTo(m,bp.x,bp.y,84,dt); if(d<42 && m.actCd<=0){ m.actCd=.65; this.hammerBlueprint(bp,m); } return; }
    const missing=this.missingCost(bp); const needType=Object.keys(missing)[0]; if(!needType){ return; }
    const item=this.world.nearestItem(m.x,m.y,it=>it.type===needType,99999); if(item){ const d=this.monkeyMoveTo(m,item.x,item.y,90,dt); if(d<24) this.monkeyPickupItem(m,item); return; }
    const chest=this.world.nearestBuilding(m.x,m.y,b=>b.type==='chest' && b.storage && (b.storage[needType]||0)>0,99999); if(chest){ const d=this.monkeyMoveTo(m,chest.x,chest.y,88,dt); if(d<35){ const qty=Math.min(5,chest.storage[needType]||0); addToBag(chest.storage,needType,-qty); m.carry={type:needType,qty}; } return; }
    this.monkeyFollow(m,dt);
  }
  monkeyCraft(m,dt){ const station=this.world.nearestBuilding(m.x,m.y,b=>(b.type==='workbench'||b.type==='forge')&&b.queue&&b.queue.length,99999); if(!station){ this.monkeyFollow(m,dt); return; } const d=this.monkeyMoveTo(m,station.x,station.y,84,dt); if(d<48 && m.actCd<=0){ m.actCd=.58; this.hammerStation(station,.85); } }
  monkeyCombat(m,dt){ const enemy=this.world.enemies.reduce((best,e)=>{ const d=dist2(m.x,m.y,e.x,e.y); return !best||d<best.d?{e,d}:best; },null); if(!enemy || Math.sqrt(enemy.d)>420){ this.monkeyFollow(m,dt); return; } const e=enemy.e; const d=this.monkeyMoveTo(m,e.x,e.y,98,dt); if(d<32 && m.attackCd<=0){ m.attackCd=.7; e.hp-=12; e.hitFlash=.18; this.emitChips(e.x,e.y-18,'#9cff83',7); this.addFloat('-12',e.x,e.y-32,COLORS.yellow); if(e.hp<=0) this.killEnemy(e); } }
  recordAction(action){
    if(!this.mimic.active || !this.mimic.monkey || this.mimic.phase!=='record') return;
    const m=this.mimic.monkey; let order=null;
    if(action.kind==='hit_resource') order={type:'harvest',resourceType:action.resourceType,tool:action.tool};
    else if(action.kind==='pickup'||action.kind==='deposit') order={type:'gather'};
    else if(action.kind==='blueprint_add'||action.kind==='hammer_blueprint'||action.kind==='place_blueprint') order={type:'build'};
    else if(action.kind==='workbench_hammer') order={type:'craft'};
    else if(action.kind==='attack') order={type:'combat'};
    if(order){ m.order=order; this.message(`${m.name} learned: ${this.orderName(order)}. It will loop that task.`); this.mimic.active=false; this.mimic.monkey=null; this.mimic.phase='idle'; }
  }
  orderName(order){ return {harvest:`Harvest ${order.resourceType}`,gather:'Gather + deposit',build:'Build blueprints',craft:'Craft at stations',combat:'Combat guard'}[order.type] || order.type; }
  discoverFromItem(item){
    if(item==='iron' && !this.unlocked.craft.forge_unlock){ this.unlocked.craft.forge_unlock=true; this.message('Discovery: iron unlocks Forge Plans at a workbench.'); }
    if(item==='core'){ this.unlocked.craft.metal_sword=true; this.message('Discovery: Ancient Core can repair the galleon or forge a metal sword.'); }
  }
  updateQuest(){
    const old=this.questIndex;
    if((this.player.inv.wood||0)+(this.player.inv.stone||0)+(this.player.inv.fiber||0)>8) this.questIndex=Math.max(this.questIndex,1);
    if(this.monkeys.some(m=>m.tamed && m.order)) this.questIndex=Math.max(this.questIndex,2);
    if(this.world.buildings.some(b=>b.type==='workbench')) this.questIndex=Math.max(this.questIndex,3);
    if((this.player.inv.core||0)>0 || this.world.items.some(i=>i.type==='core')) this.questIndex=Math.max(this.questIndex,4);
    if(old!==this.questIndex) this.message(`Quest updated: ${QUESTS[this.questIndex]}`);
  }
  enterDungeon(){
    if(this.world.kind==='dungeon') return;
    this.dungeonReturn={world:this.world,x:this.player.x,y:this.player.y};
    this.world=new World((this.seed+this.day*999+this.island*77)|0,'dungeon',this.island);
    this.player.x=this.world.spawn.x; this.player.y=this.world.spawn.y; this.player.onRaft=false;
    for(const m of this.monkeys.filter(m=>m.tamed)){ m.x=this.player.x+randRange(Math.random,-30,30); m.y=this.player.y+randRange(Math.random,-30,30); }
    this.message('Entered an ancient vault. Defeat the guardian and loot the chest.');
  }
  exitDungeon(){
    if(!this.dungeonReturn) return;
    this.world=this.dungeonReturn.world; this.player.x=this.dungeonReturn.x; this.player.y=this.dungeonReturn.y; for(const m of this.monkeys.filter(m=>m.tamed)){m.x=this.player.x+randRange(Math.random,-30,30);m.y=this.player.y+randRange(Math.random,-30,30);} this.dungeonReturn=null; this.message('Returned to the island.');
  }
  tryRepairGalleon(g){
    const cost={wood:16,fiber:10,iron:4,core:1}; if(hasCost(this.player.inv,cost)){ payCost(this.player.inv,cost); g.repaired=true; this.win=true; this.message('The galleon is repaired. You escaped!'); this.audio.play('win_fanfare'); }
    else this.message(`Repair needs ${formatCost(cost)}.`);
  }
  sailToNewIsland(){
    if(this.world.kind!=='overworld') return;
    this.audio.play('splash'); this.island++; this.seed=(this.seed+0x9e3779b9+this.island*1337)&0x7fffffff; this.world=new World(this.seed,'overworld',this.island); this.overworld=this.world; this.player.x=this.world.spawn.x; this.player.y=this.world.spawn.y; this.player.respawn={x:this.player.x,y:this.player.y};
    for(const m of this.monkeys.filter(m=>m.tamed)){ m.x=this.player.x+randRange(Math.random,-40,40); m.y=this.player.y+randRange(Math.random,-40,40); }
    this.message(`You sailed to Island ${this.island}. New resources and dangers await.`);
  }
  saveGame(){
    const data={version:SAVE_VERSION,savedAt:Date.now(),seed:this.seed,island:this.island,world:this.world.serialize(),player:this.player,monkeys:this.monkeys,unlocked:this.unlocked,day:this.day,time:this.time,questIndex:this.questIndex,currentBuild:this.currentBuild,selectedSlot:this.selectedSlot,raidTimer:this.raidTimer,dungeonReturn:this.dungeonReturn?{world:this.dungeonReturn.world.serialize(),x:this.dungeonReturn.x,y:this.dungeonReturn.y}:null};
    try{ localStorage.setItem(SAVE_KEY,JSON.stringify(data)); this.message('Game saved.'); }catch(e){ this.message('Could not save: browser storage blocked.'); }
  }
  loadGame(){
    const raw=localStorage.getItem(SAVE_KEY) || localStorage.getItem('castaway_mimics_save_v1'); if(!raw){ this.message('No save found.'); return; }
    try{
      const d=JSON.parse(raw); if(!d || !d.world) throw new Error('missing world');
      this.seed=finiteNumber(d.seed,this.seed); this.island=Math.max(1,Math.floor(finiteNumber(d.island,1)));
      this.world=World.fromData(d.world); this.overworld=this.world.kind==='overworld'?this.world:this.overworld;
      const oldPlayer=d.player||{}; this.player={...this.player,...oldPlayer};
      this.player.x=finiteNumber(this.player.x,this.world.spawn.x); this.player.y=finiteNumber(this.player.y,this.world.spawn.y);
      this.player.maxHealth=finiteNumber(this.player.maxHealth,100); this.player.maxHunger=finiteNumber(this.player.maxHunger,100); this.player.maxStamina=finiteNumber(this.player.maxStamina,100);
      this.player.health=clamp(finiteNumber(this.player.health,this.player.maxHealth),1,this.player.maxHealth);
      this.player.hunger=clamp(finiteNumber(this.player.hunger,70),0,this.player.maxHunger);
      this.player.stamina=clamp(finiteNumber(this.player.stamina,this.player.maxStamina),0,this.player.maxStamina);
      this.player.inv=sanitizeBag(this.player.inv); this.player.respawn=this.player.respawn||{x:this.world.spawn.x,y:this.world.spawn.y};
      this.monkeys=Array.isArray(d.monkeys)?d.monkeys.map(m=>({id:m.id||nowId(),x:finiteNumber(m.x,this.player.x+20),y:finiteNumber(m.y,this.player.y+20),tamed:!!m.tamed,name:m.name||'Monkey',hp:clamp(finiteNumber(m.hp,55),1,finiteNumber(m.maxHp,55)),maxHp:finiteNumber(m.maxHp,55),walk:0,order:m.order||null,carry:m.carry||null,attackCd:0,actCd:0,target:null,wander:finiteNumber(m.wander,Math.random()*TWO_PI),facing:m.facing||'right',path:[]})):[];
      this.unlocked={craft:{...this.unlocked.craft,...(d.unlocked?.craft||{})},build:{...this.unlocked.build,...(d.unlocked?.build||{})}}; this.day=Math.max(1,Math.floor(finiteNumber(d.day,1))); this.time=clamp(finiteNumber(d.time,.36),0,1); this.questIndex=Math.max(0,Math.floor(finiteNumber(d.questIndex,0)));
      this.currentBuild=d.currentBuild||this.currentBuild; this.selectedSlot=clamp(Math.floor(finiteNumber(d.selectedSlot,0)),0,HOTBAR.length-1); this.raidTimer=finiteNumber(d.raidTimer,260); this.mimic={active:false,monkey:null,phase:'idle'};
      if(d.dungeonReturn?.world){ this.dungeonReturn={world:World.fromData(d.dungeonReturn.world),x:finiteNumber(d.dungeonReturn.x,this.player.x),y:finiteNumber(d.dungeonReturn.y,this.player.y)}; }
      this.message(d.version===SAVE_VERSION?'Loaded saved game.':'Loaded legacy save and upgraded it.');
    } catch(e){ this.message('Save failed to load safely. Starting fresh.'); console.warn(e); }
  }
  newGame(){
    localStorage.removeItem(SAVE_KEY);
    const preserved={canvas:this.canvas,ctx:this.ctx,input:this.input,art:this.art};
    const fresh=new Game(this.canvas);
    Object.assign(this,fresh);
    this.canvas=preserved.canvas; this.ctx=preserved.ctx; this.input=preserved.input; this.art=preserved.art;
    this.resize();
    this.message('New island generated.');
  }
  render(){
    const ctx=this.ctx; const sc=this.renderScale;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height); ctx.imageSmoothingEnabled=false;
    ctx.save(); ctx.scale(sc, sc); this.renderWorld(ctx); this.renderLighting(ctx, sc); ctx.restore();
    this.renderUI(ctx);
    if(this.damageFlash>0){ ctx.save(); ctx.fillStyle=`rgba(232,59,75,${this.damageFlash*.16})`; ctx.fillRect(0,0,this.canvas.width,this.canvas.height); ctx.restore(); }
  }
  renderWorld(ctx){
    const w=this.world, shakeAmt=this.shake>0?this.shake*28:0, cam={x:Math.round(this.camera.x + (Math.random()-.5)*shakeAmt), y:Math.round(this.camera.y + (Math.random()-.5)*shakeAmt)}; const startX=Math.floor(cam.x/TILE)-1, endX=Math.ceil((cam.x+this.canvas.width/this.renderScale)/TILE)+1; const startY=Math.floor(cam.y/TILE)-1, endY=Math.ceil((cam.y+this.canvas.height/this.renderScale)/TILE)+1;
    for(let y=startY;y<=endY;y++) for(let x=startX;x<=endX;x++){ if(!w.inBounds(x,y)) continue; this.art.drawTile(ctx,w.tile(x,y),x*TILE-cam.x,y*TILE-cam.y,x,y,this.time*100); }
    // sort objects by ground Y
    const objects=[];
    for(const r of w.resources) objects.push({y:r.y,draw:()=>{r.sx=r.x-cam.x;r.sy=r.y-cam.y;this.art.drawResource(ctx,r); if(r.hp<r.maxHp) this.art.drawHealthBar(ctx,r.sx,r.sy-48,34,r.hp/r.maxHp,COLORS.yellow);}});
    for(const b of w.buildings) objects.push({y:b.y,draw:()=>{b.sx=b.x-cam.x;b.sy=b.y-cam.y;this.art.drawBuilding(ctx,b);}});
    for(const bp of w.blueprints) objects.push({y:bp.y,draw:()=>{bp.sx=bp.x-cam.x;bp.sy=bp.y-cam.y;this.art.drawBlueprint(ctx,bp);}});
    for(const it of w.items) objects.push({y:it.y,draw:()=>{it.sx=it.x-cam.x;it.sy=it.y-cam.y;this.art.drawItem(ctx,it);}});
    for(const e of w.enemies) objects.push({y:e.y,draw:()=>{const sx=e.x-cam.x,sy=e.y-cam.y;this.art.drawEnemy(ctx,sx,sy,e.walk,e.type==='boss',e); if(e.hitFlash>0){ctx.save();ctx.globalAlpha=clamp(e.hitFlash/.22,0,.75);ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(sx,sy-22,e.type==='boss'?30:18,e.type==='boss'?24:16,0,0,TWO_PI);ctx.fill();ctx.restore();} this.art.drawHealthBar(ctx,sx,sy-(e.type==='boss'?68:45),e.type==='boss'?56:34,e.hp/e.maxHp,e.type==='boss'?COLORS.purple:COLORS.red);}});
    for(const m of this.monkeys) objects.push({y:m.y,draw:()=>{const sx=m.x-cam.x,sy=m.y-cam.y;this.art.drawMonkey(ctx,sx,sy,m.walk,m.tamed?m.order:null,this.mimic.monkey===m,m); if(m.hitFlash>0){ctx.save();ctx.globalAlpha=clamp(m.hitFlash/.2,0,.65);ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.ellipse(sx,sy-17,16,14,0,0,TWO_PI);ctx.fill();ctx.restore();} if(m.carry){this.art.drawIconShape(ctx,m.carry.type,sx+15,sy-40,.55);}}});
    objects.push({y:this.player.y,draw:()=>this.art.drawPlayer(ctx,this.player.x-cam.x,this.player.y-cam.y,this.player.dir,this.player.walk,this.player.charge,this.currentHotbarItem(),this.player.facing,this.player.attackCd)});
    objects.sort((a,b)=>a.y-b.y); for(const o of objects) o.draw();
    for(const p of this.particles){ ctx.fillStyle=p.color; ctx.globalAlpha=clamp(p.t/.7,0,1); ctx.fillRect(p.x-cam.x,p.y-cam.y,p.size,p.size); ctx.globalAlpha=1; }
    for(const f of this.floatText){ ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.globalAlpha=clamp(f.t,0,1); ctx.strokeStyle='black'; ctx.lineWidth=4; ctx.strokeText(f.text,f.x-cam.x,f.y-cam.y); ctx.fillStyle=f.color; ctx.fillText(f.text,f.x-cam.x,f.y-cam.y); ctx.globalAlpha=1; }
    this.renderCursorTooltip(ctx);
  }
  renderLighting(ctx, sc){
    const night = this.nightAmount();
    const camX=Math.round(this.camera.x), camY=Math.round(this.camera.y);
    const lights=[];
    for(const b of this.world.buildings){ const rec=BUILD_RECIPES[b.type]; if(rec && rec.light) lights.push({x:b.x-camX,y:b.y-camY-20,r:Math.round(rec.light*.72)}); }
    if(night>.03){
      ctx.save();
      ctx.fillStyle=`rgba(8,12,28,${night*.34})`;
      ctx.fillRect(0,0,this.canvas.width/sc,this.canvas.height/sc);
      ctx.restore();
    }
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    for(const l of lights){
      const g=ctx.createRadialGradient(l.x,l.y,4,l.x,l.y,l.r*.6);
      g.addColorStop(0,'rgba(255,194,96,.20)');
      g.addColorStop(.45,'rgba(255,143,48,.09)');
      g.addColorStop(1,'rgba(255,143,48,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(l.x,l.y,l.r*.6,0,TWO_PI); ctx.fill();
    }
    ctx.restore();
  }
  nightAmount(){ const t=this.time; const d=Math.min(Math.abs(t-.5)*2,1); return clamp((d-.62)/.28,0,1); }
  renderUI(ctx){
    this.uiButtons=[];
    this.drawStats(ctx); this.drawHotbar(ctx); this.drawMinimap(ctx); this.drawMessages(ctx); this.drawQuest(ctx); this.drawMimicPanel(ctx); this.drawActionHint(ctx);
    if(this.input.isUsingTouch()) this.drawTouchHUD(ctx); else this.input.setTouchButtons([]);
    this.drawAudioToggle(ctx);
    if(this.craftOpen) this.drawCraftMenu(ctx); if(this.helpOpen) this.drawHelp(ctx); if(this.assetOpen) this.drawAssetBrowser(ctx); if(this.win) this.drawWin(ctx); if(this.gameOver) this.drawGameOver(ctx);
  }
  drawAudioToggle(ctx){
    // Small mute toggle, top-right corner, below minimap.
    const s=this.uiScale();
    const r=Math.round(18*s);
    const x=this.canvas.width-Math.round(28*s)-r, y=Math.round(180*s)+r;
    ctx.save();
    ctx.fillStyle='rgba(8,12,20,.7)'; ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.fill();
    ctx.strokeStyle=this.audio.muted?'rgba(255,120,120,.9)':'rgba(255,245,214,.85)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.stroke();
    ctx.fillStyle=this.audio.muted?'#ff8080':COLORS.white; ctx.font=`bold ${Math.round(15*s)}px monospace`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(this.audio.muted?'X':'♪',x,y+1);
    ctx.textBaseline='alphabetic';
    ctx.restore();
    this.uiButtons.push({x:x-r,y:y-r,w:r*2,h:r*2,cb:()=>{ this.audio.toggleMute(); }});
  }
  drawTouchHUD(ctx){
    // Build action button cluster on the right and feed it to the input layer.
    const s = this.uiScale();
    const cw=this.canvas.width, ch=this.canvas.height;
    const slot = clamp(Math.floor((Math.max(280,cw-240) - 11*6)/12),32,56);
    const baseY = ch - (slot + 28) - Math.round(110*s);
    const rB = Math.round(34*s), rL = Math.round(28*s);
    const rightX = cw - rB - Math.round(20*s);
    // Big primary action button (use tool / attack)
    const buttons = [
      {id:'atk', x:rightX, y:baseY, r:rB, action:'mouse_click', label:'⚔'},
      {id:'e', x:rightX - rB - rL - 8, y:baseY, r:rL, key:'e', label:'E'},
      {id:'f', x:rightX, y:baseY - rB - rL - 8, r:rL, key:'f', label:'F'},
      {id:'b', x:rightX - rB - rL - 8, y:baseY - rB - rL - 8, r:rL, key:'b', label:'B'},
      {id:'c', x:rightX - 2*(rB + rL + 8) + rB - rL, y:baseY, r:rL, key:'c', label:'C'},
      {id:'m', x:rightX - 2*(rB + rL + 8) + rB - rL, y:baseY - rB - rL - 8, r:rL, key:'m', label:'M'},
      {id:'pause', x:rightX, y:baseY + rB + rL + 8, r:rL, key:'escape', label:'≡'},
    ];
    this.input.setTouchButtons(buttons);
    ctx.save();
    for(const b of buttons){
      const pressed = this.input.virtualKeys.has(b.key||'') || (b.action==='mouse_click' && this.input.mouse.down);
      ctx.fillStyle = pressed ? 'rgba(255,216,90,.55)' : 'rgba(8,12,20,.55)';
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,TWO_PI); ctx.fill();
      ctx.strokeStyle='rgba(255,245,214,.85)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,TWO_PI); ctx.stroke();
      ctx.fillStyle = pressed ? '#1a1208' : '#fff3bd';
      ctx.font=`bold ${Math.round(b.r*.95)}px monospace`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(b.label||'', b.x, b.y+1);
    }
    ctx.textBaseline='alphabetic';
    // Joystick visualization (shown only while active).
    if(this.input.joystick.active){
      const j=this.input.joystick;
      ctx.strokeStyle='rgba(255,245,214,.5)'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(j.baseX,j.baseY,j.radius,0,TWO_PI); ctx.stroke();
      ctx.fillStyle='rgba(255,216,90,.65)';
      ctx.beginPath(); ctx.arc(j.x,j.y,j.radius*.32,0,TWO_PI); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(j.x,j.y,j.radius*.32,0,TWO_PI); ctx.stroke();
    } else {
      // Idle hint on the lower-left so users know where to drag.
      const hx=Math.round(80*s), hy=ch - Math.round(180*s);
      ctx.globalAlpha=.25; ctx.strokeStyle='rgba(255,245,214,.9)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(hx,hy,Math.round(56*s),0,TWO_PI); ctx.stroke();
      ctx.globalAlpha=1; ctx.fillStyle='rgba(255,245,214,.55)'; ctx.font=`bold ${Math.round(11*s)}px monospace`; ctx.textAlign='center';
      ctx.fillText('drag to move',hx,hy+Math.round(70*s));
    }
    ctx.restore();
  }
  panel(ctx,x,y,w,h,a=.84){
    ctx.save();
    ctx.fillStyle=`rgba(16,22,30,${a})`; ctx.fillRect(x,y,w,h);
    ctx.fillStyle='rgba(255,255,255,.04)'; ctx.fillRect(x+2,y+2,w-4,10);
    ctx.strokeStyle='rgba(10,8,7,.95)'; ctx.lineWidth=3; ctx.strokeRect(x+0.5,y+0.5,w,h);
    ctx.strokeStyle='rgba(255,245,214,.24)'; ctx.lineWidth=1; ctx.strokeRect(x+4.5,y+4.5,w-8,h-8);
    ctx.restore();
  }
  drawStats(ctx){
    const s=this.uiScale();
    const infoX=12, infoY=10, infoW=Math.round(220*s), infoH=Math.round(42*s);
    this.panel(ctx,infoX,infoY,infoW,infoH,.72);
    ctx.font=`bold ${Math.round(13*s)}px monospace`; ctx.textAlign='left'; ctx.fillStyle=COLORS.white;
    ctx.fillText(`Day ${this.day}  Island ${this.island}`,infoX+12,infoY+Math.round(17*s));
    ctx.fillStyle='rgba(255,245,214,.86)';
    ctx.fillText(`${this.world.kind==='dungeon'?'VAULT':'OPEN WORLD'}  ${Math.floor(this.time*24).toString().padStart(2,'0')}:00`,infoX+12,infoY+Math.round(34*s));
    // Stat circles cluster near the bottom-left and -right; stay above hotbar.
    const slot = clamp(Math.floor((Math.max(280,this.canvas.width-240) - 11*6)/12),32,56);
    const yC = this.canvas.height - (slot + 28) - Math.round(46*s);
    const r1=Math.round(26*s), r2=Math.round(22*s);
    this.drawStatCircle(ctx,Math.round(40*s)+8,yC,r1,this.player.health/this.player.maxHealth,COLORS.red,'heart');
    this.drawStatCircle(ctx,Math.round(40*s)+8 + r1+r2+Math.round(20*s),yC,r2,this.player.hunger/this.player.maxHunger,COLORS.yellow,'hunger');
    this.drawStatCircle(ctx,this.canvas.width-Math.round(50*s),yC,r1,this.player.stamina/this.player.maxStamina,'#37e052','stamina');
  }
  drawStatCircle(ctx,x,y,r,pct,color,icon){
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,.48)'; ctx.beginPath(); ctx.arc(x,y,r+6,0,TWO_PI); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.stroke();
    ctx.strokeStyle=color; ctx.lineWidth=6; ctx.lineCap='round'; ctx.beginPath(); ctx.arc(x,y,r,-Math.PI/2,-Math.PI/2+TWO_PI*clamp(pct,0,1)); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.04)'; ctx.beginPath(); ctx.arc(x,y,r-8,0,TWO_PI); ctx.fill();
    this.art.drawIconShape(ctx,icon,x,y,.72);
    ctx.restore();
  }
  drawHotbar(ctx){
    const count=HOTBAR.length;
    // Compute responsive slot size so 12 slots always fit + the on-screen action cluster doesn't overlap.
    const cw=this.canvas.width, ch=this.canvas.height;
    const reservedRight = this.input.isUsingTouch() ? Math.min(260, cw*.28) : 120;
    const reservedLeft = 120;
    const maxBar = Math.max(280, cw - reservedLeft - reservedRight);
    let slot = Math.floor((maxBar - (count-1)*6) / count);
    slot = clamp(slot, 32, 56);
    const gap = Math.max(3, Math.round(slot*.12));
    const w=count*slot+(count-1)*gap; const x0=(cw-w)/2, y=ch- (slot + 28);
    this.panel(ctx,x0-12,y-18,w+24,slot+30,.72);
    this.uiButtons = this.uiButtons || [];
    for(let i=0;i<count;i++){
      const x=x0+i*(slot+gap), id=HOTBAR[i];
      ctx.fillStyle=i===this.selectedSlot?'rgba(255,216,90,.22)':'rgba(12,18,26,.78)'; ctx.fillRect(x,y,slot,slot);
      ctx.strokeStyle=i===this.selectedSlot?COLORS.yellow:'rgba(255,255,255,.28)'; ctx.lineWidth=i===this.selectedSlot?3:2; ctx.strokeRect(x+.5,y+.5,slot,slot);
      this.art.drawIconShape(ctx,id,x+slot/2,y+slot/2,slot/60);
      let qty=this.player.inv[id]||0; if(BUILD_RECIPES[id]) qty=this.unlocked.build[id]?'B':''; if(ITEM_INFO[id]?.tool && qty>0) qty='';
      if(qty){ ctx.font=`bold ${Math.round(slot*.24)}px monospace`; ctx.textAlign='right'; ctx.strokeStyle='black'; ctx.lineWidth=3; ctx.strokeText(String(qty),x+slot-4,y+slot-5); ctx.fillStyle='white'; ctx.fillText(String(qty),x+slot-4,y+slot-5); }
      ctx.font=`bold ${Math.round(slot*.21)}px monospace`; ctx.textAlign='left'; ctx.fillStyle='rgba(255,255,255,.72)'; ctx.fillText(i===9?'0':String(i+1),x+4,y+Math.round(slot*.24));
      // Hotbar slots are clickable / tappable — pick slot.
      this.uiButtons.push({x,y,w:slot,h:slot,cb:()=>{ this.selectedSlot=i; this.audio.play('select'); }});
    }
    ctx.font=`bold ${Math.round(slot*.32)}px monospace`; ctx.textAlign='center'; ctx.fillStyle=COLORS.white; const sel=this.currentHotbarItem(); ctx.fillText(itemName(sel),cw/2,y-6);
  }
  drawMinimap(ctx){
    const s=this.uiScale();
    const r=Math.round(72*s), x=this.canvas.width-r-Math.round(20*s), y=r+Math.round(20*s); ctx.save(); ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.clip(); ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(x-r,y-r,r*2,r*2);
    const scale= r*2/this.world.w;
    for(let ty=0;ty<this.world.h;ty+=2) for(let tx=0;tx<this.world.w;tx+=2){ const t=this.world.tile(tx,ty); ctx.fillStyle= t==='water'?COLORS.water:(t==='shallow'?COLORS.shallow:(t==='sand'?COLORS.sand:(t==='swamp'?'#486b3d':(t==='ash'?'#615549':(t==='lava'?'#b64221':COLORS.grass))))); ctx.fillRect(x-r+tx*scale,y-r+ty*scale,Math.ceil(scale*2),Math.ceil(scale*2)); }
    ctx.fillStyle=COLORS.red; for(const e of this.world.enemies) ctx.fillRect(x-r+e.x/TILE*scale-2,y-r+e.y/TILE*scale-2,4,4);
    ctx.fillStyle=COLORS.yellow; ctx.beginPath(); ctx.arc(x-r+this.player.x/TILE*scale,y-r+this.player.y/TILE*scale,4,0,TWO_PI); ctx.fill();
    ctx.restore(); ctx.strokeStyle='rgba(255,245,214,.9)'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.stroke(); ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.white; ctx.fillText('N',x,y-r+18); ctx.fillText('S',x,y+r-8); ctx.fillText('W',x-r+14,y+5); ctx.fillText('E',x+r-14,y+5);
  }
  drawMessages(ctx){
    ctx.font='bold 14px monospace'; ctx.textAlign='left'; let y=this.canvas.height-132;
    for(const m of this.messages){ ctx.globalAlpha=clamp(m.t,0,.95); ctx.fillStyle='rgba(0,0,0,.45)'; const w=ctx.measureText(m.text).width+20; ctx.fillRect(16,y-17,w,22); ctx.fillStyle=m.color; ctx.fillText(m.text,26,y); y-=25; }
    ctx.globalAlpha=1;
  }
  drawQuest(ctx){
    const text=QUESTS[this.questIndex]||QUESTS[0];
    ctx.font='13px monospace';
    const maxW=Math.min(420, this.canvas.width-380);
    const lines=wrapTextLines(ctx, text, maxW-28);
    const w=Math.max(300, Math.min(460, maxW));
    const h=30 + lines.length*16;
    const x=(this.canvas.width-w)/2, y=12;
    this.panel(ctx,x,y,w,h,.62);
    ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.yellow; ctx.fillText('CURRENT QUEST',x+w/2,y+16);
    ctx.font='13px monospace'; ctx.fillStyle=COLORS.white;
    lines.forEach((line,i)=>ctx.fillText(line,x+w/2,y+34+i*15));
  }
  drawMimicPanel(ctx){
    const tamed=this.monkeys.filter(m=>m.tamed);
    const lines=[`${tamed.length} monkey crew`];
    if(this.mimic.active){ lines.push(this.mimic.monkey?`${this.mimic.monkey.name} watching...`:'Press E near a monkey'); lines.push('Then perform one action.'); }
    else if(tamed.length) lines.push('Press M to teach tasks.');
    const x=16,y=64,w=286,h=40+lines.length*18;
    this.panel(ctx,x,y,w,h,.66);
    ctx.font='bold 14px monospace'; ctx.textAlign='left'; ctx.fillStyle=this.mimic.active?COLORS.yellow:COLORS.white; ctx.fillText('MIMIC MODE [M]',x+12,y+18);
    ctx.font='13px monospace';
    lines.forEach((line,i)=>{ ctx.fillStyle=i===1&&this.mimic.active?COLORS.yellow:(i===0?COLORS.white:'rgba(255,255,255,.78)'); ctx.fillText(line,x+12,y+38+i*17); });
  }
  drawActionHint(ctx){
    if(this.craftOpen||this.assetOpen||this.helpOpen||this.win||this.gameOver) return;
    const p=this.player; let hint='Space/click: use tool'; const item=this.currentHotbarItem();
    const it=this.world.nearestItem(p.x,p.y,null,42), bp=this.world.nearestBlueprint(p.x,p.y,null,58), b=this.world.nearestBuilding(p.x,p.y,null,64), r=this.world.nearestResource(p.x,p.y,null,58);
    if(it) hint=`E: pick up ${itemName(it.type)}`; else if(bp) hint='E: add resources - Hammer: build'; else if(b) hint=`E: interact with ${itemName(b.type)}`; else if(r) hint=`${itemName(item)}: ${r.type==='tree'?'chop':r.type==='bush'?'gather':'mine'}`;
    ctx.font='bold 13px monospace'; const tw=ctx.measureText(hint).width+22, x=this.canvas.width/2-tw/2, y=this.canvas.height-104;
    this.panel(ctx,x,y,tw,28,.62); ctx.textAlign='center'; ctx.fillStyle='rgba(255,245,214,.92)'; ctx.fillText(hint,this.canvas.width/2,y+19);
  }
  drawCraftMenu(ctx){
    const w=Math.min(900,this.canvas.width-60), h=Math.min(620,this.canvas.height-80), x=(this.canvas.width-w)/2, y=(this.canvas.height-h)/2; this.panel(ctx,x,y,w,h,.94); ctx.font='bold 30px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.yellow; ctx.fillText('CRAFTING & BLUEPRINTS',x+w/2,y+42); ctx.font='14px monospace'; ctx.fillStyle=COLORS.white; ctx.fillText('Click a recipe. Stations queue jobs; hammer them or teach a monkey Craft.',x+w/2,y+66);
    let yy=y+95; const colW=(w-60)/2; ctx.textAlign='left'; ctx.font='bold 18px monospace'; ctx.fillStyle=COLORS.cyan; ctx.fillText('Items',x+26,yy); ctx.fillText('Blueprints',x+36+colW,yy); yy+=16;
    let iy=yy, by=yy;
    for(const [id,r] of Object.entries(CRAFT_RECIPES)){
      if(!this.unlocked.craft[id]) continue; const can=this.canCraft(id); this.drawRecipeButton(ctx,x+24,iy,colW-14,58,r.name,formatCost(r.cost),r.desc,can,()=>this.craftRecipe(id)); iy+=64;
    }
    for(const [id,r] of Object.entries(BUILD_RECIPES)){
      if(!this.unlocked.build[id]) continue; const selected=this.currentBuild===id; this.drawRecipeButton(ctx,x+34+colW,by,colW-14,58,r.name,formatCost(r.cost),r.desc,true,()=>{this.currentBuild=id; this.craftOpen=false; this.message(`Selected ${r.name}. Press F or right-click to place.`);},selected); by+=64;
    }
    const close={x:x+w-110,y:y+h-48,w:86,h:30,cb:()=>{this.craftOpen=false;}}; this.uiButtons.push(close); ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(close.x,close.y,close.w,close.h); ctx.strokeStyle=COLORS.white; ctx.strokeRect(close.x,close.y,close.w,close.h); ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.white; ctx.fillText('Close',close.x+43,close.y+20);
  }
  canCraft(id){ const r=CRAFT_RECIPES[id]; if(!hasCost(this.player.inv,r.cost)) return false; if(r.stationNear && !this.world.nearestBuilding(this.player.x,this.player.y,b=>b.type===r.stationNear,70)) return false; if(r.station && !this.world.nearestBuilding(this.player.x,this.player.y,b=>b.type===r.station,80)) return false; return true; }
  drawRecipeButton(ctx,x,y,w,h,title,cost,desc,enabled,cb,selected=false){ this.uiButtons.push({x,y,w,h,cb}); ctx.fillStyle=selected?'rgba(255,216,90,.26)':(enabled?'rgba(255,255,255,.10)':'rgba(0,0,0,.25)'); ctx.fillRect(x,y,w,h); ctx.strokeStyle=selected?COLORS.yellow:(enabled?'rgba(255,255,255,.35)':'rgba(255,255,255,.15)'); ctx.strokeRect(x+.5,y+.5,w,h); ctx.font='bold 15px monospace'; ctx.textAlign='left'; ctx.fillStyle=enabled?COLORS.white:'rgba(255,255,255,.45)'; ctx.fillText(title,x+12,y+19); ctx.font='12px monospace'; ctx.fillStyle=enabled?COLORS.yellow:'rgba(255,255,255,.35)'; ctx.fillText(cost,x+12,y+36); ctx.fillStyle='rgba(255,255,255,.6)'; ctx.fillText(desc.slice(0,46),x+12,y+52); }
  drawHelp(ctx){
    const x=this.canvas.width/2-330,y=this.canvas.height/2-230,w=660,h=460; this.panel(ctx,x,y,w,h,.96); ctx.font='bold 28px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.yellow; ctx.fillText('CONTROLS',x+w/2,y+42);
    ctx.font='15px monospace'; ctx.textAlign='left'; ctx.fillStyle=COLORS.white;
    const lines=[
      'WASD / Arrows: move        Shift: sprint',
      'Mouse click / Space: use selected tool or attack',
      'E: pickup, add blueprint resources, interact, tame',
      'Shift+E at a chest: withdraw stored resources',
      '1-0 / Tab: select hotbar   C: craft menu',
      'B: cycle blueprint         F / Right-click: place blueprint',
      'M: Mimic Mode. Press E near a tamed monkey, then perform an action.',
      'V: generated asset viewer / QA browser',
      '',
      'Monkey lessons: chop/mine = harvest loop; pickup/deposit = gather loop;',
      'hammer blueprint = build loop; hammer workbench = craft loop; attack = guard.',
      '',
      'Goal: build a base, raid a vault for an Ancient Core, repair the galleon.'
    ];
    lines.forEach((line,i)=>ctx.fillText(line,x+34,y+86+i*28));
  }

  drawAssetBrowser(ctx){
    const pad=28, x=pad, y=pad, w=this.canvas.width-pad*2, h=this.canvas.height-pad*2;
    this.panel(ctx,x,y,w,h,.96);
    const key=SHEET_ORDER[this.assetPage%SHEET_ORDER.length], img=this.art.sheets[key];
    ctx.font='bold 24px monospace'; ctx.textAlign='left'; ctx.fillStyle=COLORS.yellow; ctx.fillText(`ASSET VIEWER: ${SHEET_TITLES[key]||key}`,x+24,y+38);
    ctx.font='14px monospace'; ctx.fillStyle=COLORS.white; ctx.fillText('V closes · [ and ] switch generated sheets · all sheets are packaged under assets/generated/',x+24,y+62);
    if(img){
      const maxW=w-56, maxH=h-104; const scale=Math.min(maxW/img.width,maxH/img.height); const iw=img.width*scale, ih=img.height*scale;
      const ix=x+(w-iw)/2, iy=y+86;
      ctx.save(); ctx.imageSmoothingEnabled=false; ctx.drawImage(img,ix,iy,iw,ih); ctx.restore();
    } else { ctx.fillStyle=COLORS.red; ctx.fillText('Sheet failed to load.',x+24,y+100); }
    ctx.textAlign='right'; ctx.fillStyle=COLORS.white; ctx.fillText(`${this.assetPage+1}/${SHEET_ORDER.length}`,x+w-24,y+38);
  }
  drawWin(ctx){ const x=this.canvas.width/2-310,y=this.canvas.height/2-110; this.panel(ctx,x,y,620,220,.96); ctx.font='bold 42px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.yellow; ctx.fillText('ESCAPE COMPLETE',this.canvas.width/2,y+60); ctx.font='18px monospace'; ctx.fillStyle=COLORS.white; ctx.fillText('You repaired the galleon, trained your crew, and left the island chain.',this.canvas.width/2,y+102); ctx.fillText('Press Enter for a new run.',this.canvas.width/2,y+150); }
  drawGameOver(ctx){ const x=this.canvas.width/2-260,y=this.canvas.height/2-90; this.panel(ctx,x,y,520,180,.96); ctx.font='bold 38px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.red; ctx.fillText('GAME OVER',this.canvas.width/2,y+60); ctx.font='18px monospace'; ctx.fillStyle=COLORS.white; ctx.fillText('Press Enter for a new run.',this.canvas.width/2,y+112); }
  renderCursorTooltip(ctx){
    const mx=this.input.mouse.worldX,my=this.input.mouse.worldY; let text='';
    const r=this.world.nearestResource(mx,my,null,24); const b=this.world.nearestBuilding(mx,my,null,28); const bp=this.world.nearestBlueprint(mx,my,null,26); const e=this.world.enemies.find(en=>distance(mx,my,en.x,en.y)<24);
    if(r) text=r.type==='tree'?'Palm Tree':(r.type==='rock'?'Rock':r.type==='iron'?'Iron Rock':'Berry Bush'); else if(b) text=itemName(b.type); else if(bp) text=`${BUILD_RECIPES[bp.type].name} blueprint`; else if(e) text=e.type==='boss'?'Vault Guardian':'Goblin Raider';
    if(text){ ctx.font='bold 13px monospace'; const tw=ctx.measureText(text).width+16; ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(this.input.mouse.x+14,this.input.mouse.y+14,tw,24); ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.strokeRect(this.input.mouse.x+14.5,this.input.mouse.y+14.5,tw,24); ctx.fillStyle=COLORS.white; ctx.fillText(text,this.input.mouse.x+22,this.input.mouse.y+31); }
  }
}
