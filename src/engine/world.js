import {
  TILE,
  WORLD_W,
  WORLD_H,
  BUILD_RECIPES,
  clamp,
  dist2,
  distance,
  randRange,
  nowId,
  hash2,
  mulberry32,
  deepClone,
  finiteNumber
} from './shared.js';

export class World {
  constructor(seed, kind='overworld', island=1){
    this.seed = seed|0; this.kind = kind; this.island = island;
    this.w = kind === 'dungeon' ? 36 : WORLD_W;
    this.h = kind === 'dungeon' ? 28 : WORLD_H;
    this.tiles = new Array(this.w*this.h);
    this.resources = []; this.items = []; this.buildings = []; this.blueprints = []; this.enemies = [];
    this.defeatedVault = false;
    this.spawn = {x: Math.floor(this.w/2)*TILE + TILE/2, y: Math.floor(this.h/2)*TILE + TILE/2};
    if (kind === 'dungeon') this.generateDungeon(); else this.generateOverworld();
  }
  idx(tx,ty){ return ty*this.w + tx; }
  inBounds(tx,ty){ return tx>=0 && ty>=0 && tx<this.w && ty<this.h; }
  tile(tx,ty){ if(!this.inBounds(tx,ty)) return 'water'; return this.tiles[this.idx(tx,ty)] || 'grass'; }
  setTile(tx,ty,t){ if(this.inBounds(tx,ty)) this.tiles[this.idx(tx,ty)] = t; }
  generateOverworld(){
    const rng = mulberry32(this.seed);
    const cx = this.w/2 + randRange(rng,-5,5), cy = this.h/2 + randRange(rng,-5,5);
    const swamp = {x: Math.floor(randRange(rng,18,this.w-18)), y: Math.floor(randRange(rng,18,this.h-18)), r: randRange(rng,9,14)};
    const volcano = {x: Math.floor(randRange(rng,18,this.w-18)), y: Math.floor(randRange(rng,18,this.h-18)), r: randRange(rng,7,12)};
    for (let y=0;y<this.h;y++) for (let x=0;x<this.w;x++){
      const nx=(x-cx)/(this.w*.47), ny=(y-cy)/(this.h*.43);
      const d=Math.sqrt(nx*nx+ny*ny);
      const n=(hash2(Math.floor(x/3),Math.floor(y/3),this.seed)-.5)*.32 + (hash2(x,y,this.seed+9)-.5)*.10;
      let score = 1 - d + n;
      let t='grass';
      if (score < .02) t='water'; else if (score < .09) t='shallow'; else if (score < .20) t='sand'; else t = hash2(x,y,this.seed+3)>.87?'grass2':'grass';
      const sd = Math.hypot(x-swamp.x,y-swamp.y); if (score>.22 && sd < swamp.r) t='swamp';
      const vd = Math.hypot(x-volcano.x,y-volcano.y); if (score>.22 && vd < volcano.r) t = vd < volcano.r*.33 ? 'lava' : 'ash';
      this.setTile(x,y,t);
    }
    // Safe starter beach/green patch.
    const spawnTile = this.findSpawnTile();
    this.spawn = {x: spawnTile.x*TILE+TILE/2, y: spawnTile.y*TILE+TILE/2};
    for (let yy=-5; yy<=5; yy++) for (let xx=-5; xx<=5; xx++){
      const tx=spawnTile.x+xx, ty=spawnTile.y+yy; if(!this.inBounds(tx,ty)) continue;
      const d=Math.hypot(xx,yy); if(d<2.2) this.setTile(tx,ty,'sand'); else if(d<5 && this.tile(tx,ty)!=='water') this.setTile(tx,ty, d<3.8?'grass':'sand');
    }
    this.addPaths(spawnTile, rng);
    this.populateResources(rng, spawnTile);
    this.placePOIs(rng, spawnTile);
  }
  findSpawnTile(){
    let best={x:Math.floor(this.w/2),y:Math.floor(this.h/2),score:99};
    for(let y=10;y<this.h-10;y++) for(let x=10;x<this.w-10;x++){
      const t=this.tile(x,y); if(t==='water'||t==='shallow'||t==='lava'||t==='ash'||t==='swamp') continue;
      const edge=Math.min(x,y,this.w-1-x,this.h-1-y); const score=Math.abs(edge-16)+hash2(x,y,this.seed)*4;
      if(score<best.score) best={x,y,score};
    }
    return best;
  }
  addPaths(spawnTile,rng){
    const targets=[];
    for(let i=0;i<4;i++) targets.push({x:Math.floor(randRange(rng,14,this.w-14)),y:Math.floor(randRange(rng,14,this.h-14))});
    for(const target of targets){
      let x=spawnTile.x, y=spawnTile.y;
      for(let n=0;n<250 && (Math.abs(x-target.x)>1 || Math.abs(y-target.y)>1); n++){
        if(this.tile(x,y)!=='water' && this.tile(x,y)!=='shallow' && this.tile(x,y)!=='lava') this.setTile(x,y,'path');
        if(rng()<.55) x += Math.sign(target.x-x); else y += Math.sign(target.y-y);
        if(!this.inBounds(x,y)) break;
      }
    }
  }
  populateResources(rng, spawnTile){
    for(let y=3;y<this.h-3;y++) for(let x=3;x<this.w-3;x++){
      const t=this.tile(x,y); if(t==='water'||t==='shallow'||t==='lava'||t==='path') continue;
      const nearSpawn = Math.hypot(x-spawnTile.x,y-spawnTile.y) < 6;
      const r=hash2(x,y,this.seed+44);
      if(!nearSpawn && (t==='grass'||t==='grass2'||t==='sand') && r>.91) this.addResource('tree',x*TILE+16+randRange(rng,-5,5),y*TILE+25+randRange(rng,-5,5),{variant:r>.96?1:0});
      else if(!nearSpawn && (t==='grass'||t==='grass2'||t==='sand'||t==='ash') && r>.84 && r<=.91) this.addResource(t==='ash'?'iron':'rock',x*TILE+16,y*TILE+22);
      else if((t==='grass'||t==='grass2'||t==='swamp') && r>.78 && r<=.84) this.addResource('bush',x*TILE+16,y*TILE+23);
    }
    // starter supplies
    for(let i=0;i<6;i++) this.addResource(i%3===0?'rock':(i%3===1?'tree':'bush'), this.spawn.x + randRange(rng,-180,180), this.spawn.y + randRange(rng,-160,160));
  }
  placePOIs(rng, spawnTile){
    const place = (type, tx, ty, extra={}) => this.addBuilding(type,tx*TILE+16,ty*TILE+24,extra);
    // caged monkeys near start
    place('cage', spawnTile.x+5, spawnTile.y+1, {cagedMonkey:true});
    place('chest', spawnTile.x-3, spawnTile.y+1, {storage:{wood:2, berry:2}});
    place('totem', spawnTile.x+2, spawnTile.y-4, {});
    place('tent', spawnTile.x-5, spawnTile.y+4, {solid:false,deco:true});
    place('barrel', spawnTile.x-2, spawnTile.y+4, {solid:false,deco:true});
    place('crates', spawnTile.x-4, spawnTile.y+3, {solid:false,deco:true});
    place('table', spawnTile.x+3, spawnTile.y+4, {solid:false,deco:true});
    place('firewood', spawnTile.x+1, spawnTile.y+5, {solid:false,deco:true});
    // vault and galleon on distant valid tiles
    const vault = this.findFarTile(spawnTile, t => t==='grass'||t==='grass2'||t==='path');
    if(vault) place('vault', vault.x, vault.y, {poi:true});
    const ship = this.findFarTile(spawnTile, t => t==='sand'||t==='shallow', true);
    if(ship) place('galleon', ship.x, ship.y, {poi:true, repaired:false});
    // extra monkey cage/wild supplies
    for(let i=0;i<3;i++){
      const p=this.findFarTile(spawnTile, t => t==='grass'||t==='sand'||t==='path');
      if(p) place(i===0?'cage':'totem',p.x,p.y,i===0?{cagedMonkey:true}:{});
    }
    const deco=['ship_wreck0','ship_wreck1','ship_wreck2','signal_fire','treasure_pile','dig_spot','dock','sack','scarecrow','drying_rack','fish_rack','lantern_post'];
    for(let i=0;i<deco.length;i++){
      const p=this.findFarTile(spawnTile, t => t==='grass'||t==='sand'||t==='path'||t==='shallow', i%3===0);
      if(p) place(deco[i],p.x,p.y,{solid:false,deco:true});
    }
  }
  findFarTile(spawnTile, predicate, beach=false){
    let best=null, score=-999;
    for(let y=5;y<this.h-5;y++) for(let x=5;x<this.w-5;x++){
      const t=this.tile(x,y); if(!predicate(t)) continue;
      if(this.isOccupiedTile(x,y)) continue;
      if(beach){ let waterNear=false; for(let yy=-1;yy<=1;yy++) for(let xx=-1;xx<=1;xx++) if(this.tile(x+xx,y+yy)==='water'||this.tile(x+xx,y+yy)==='shallow') waterNear=true; if(!waterNear) continue; }
      const d=Math.hypot(x-spawnTile.x,y-spawnTile.y) + hash2(x,y,this.seed+81)*20;
      if(d>score){ score=d; best={x,y}; }
    }
    return best;
  }
  isOccupiedTile(tx,ty){
    const x=tx*TILE+16,y=ty*TILE+16;
    return this.buildings.some(b=>distance(x,y,b.x,b.y)<80)||this.resources.some(r=>distance(x,y,r.x,r.y)<45);
  }
  generateDungeon(){
    this.spawn = {x: 4*TILE+16, y: Math.floor(this.h/2)*TILE+16};
    for(let y=0;y<this.h;y++) for(let x=0;x<this.w;x++){
      let t='floor';
      if(x===0||y===0||x===this.w-1||y===this.h-1) t='walltile';
      if((x===12||x===23) && y>3 && y<this.h-4 && y!==Math.floor(this.h/2)) t='walltile';
      if((y===7||y===20) && x>6 && x<this.w-7 && x!==18) t='walltile';
      this.setTile(x,y,t);
    }
    this.addBuilding('portal', 2*TILE+16, Math.floor(this.h/2)*TILE+24, {exit:true, solid:false});
    for(let i=0;i<6;i++) this.addEnemy('goblin', (8+i*4)*TILE+16, (5+(i%4)*5)*TILE+16, {dungeon:true});
    this.addEnemy('boss', 30*TILE+16, Math.floor(this.h/2)*TILE+16, {boss:true, hp:190, dungeon:true});
    this.addBuilding('chest', 32*TILE+16, Math.floor(this.h/2+3)*TILE+24, {storage:{core:1, iron:3, banana:3}, locked:true, dungeonLoot:true});
    this.addBuilding('bookshelf', 7*TILE+16, 4*TILE+24, {solid:false,deco:true});
    this.addBuilding('rug', 18*TILE+16, 14*TILE+24, {solid:false,deco:true});
    this.addBuilding('cauldron', 13*TILE+16, 10*TILE+24, {solid:false,deco:true});
    this.addBuilding('anvil', 24*TILE+16, 10*TILE+24, {solid:false,deco:true});
    this.addBuilding('spike_trap', 18*TILE+16, 7*TILE+24, {solid:false,deco:true});
    this.addBuilding('brazier', 22*TILE+16, 20*TILE+24, {solid:false,deco:true});
  }
  addResource(type,x,y,extra={}){ const hp = type==='tree'?4:(type==='iron'?6:(type==='rock'?4:2)); const r={id:nowId(),type,x,y,hp,maxHp:hp,variant:extra.variant||0}; this.resources.push(r); return r; }
  addItem(type,x,y,qty=1){
    if(qty<=0) return null;
    for(const it of this.items){ if(it.type===type && distance(it.x,it.y,x,y)<24){ it.qty += qty; return it; } }
    const it={id:nowId(),type,x,y,qty,vx:(Math.random()-.5)*22,vy:(Math.random()-.5)*22,t:0,seed:Math.random()*10}; this.items.push(it); return it;
  }
  addBuilding(type,x,y,extra={}){
    const recipe=BUILD_RECIPES[type] || {}; const b={id:nowId(),type,x,y,solid: extra.solid ?? recipe.solid ?? false, hp: extra.hp ?? recipe.hp ?? 999, storage: extra.storage ? deepClone(extra.storage) : (recipe.storage?{}:undefined), queue: [], ...extra};
    this.buildings.push(b); return b;
  }
  addBlueprint(type,x,y){
    const recipe=BUILD_RECIPES[type]; if(!recipe) return null;
    const bp={id:nowId(),type,x,y,cost:deepClone(recipe.cost), added:{}, progress:0, needProgress:recipe.progress, ready:false};
    this.blueprints.push(bp); return bp;
  }
  addEnemy(type,x,y,extra={}){ const e={id:nowId(),type,x,y,hp:extra.hp || (type==='boss'?190:42), maxHp:extra.hp || (type==='boss'?190:42), vx:0,vy:0,walk:0,attackCd:0,hitFlash:0,...extra}; this.enemies.push(e); return e; }
  isWalkableTile(tx,ty,opts={}){
    const t=this.tile(tx,ty);
    if(t==='walltile') return false;
    if(t==='water') return !!opts.onRaft;
    if(t==='shallow') return true;
    if(t==='lava') return false;
    return true;
  }
  isBlocked(px,py,r=10,opts={}){
    const tx=Math.floor(px/TILE), ty=Math.floor(py/TILE);
    for(let yy=-1;yy<=1;yy++) for(let xx=-1;xx<=1;xx++) if(!this.isWalkableTile(tx+xx,ty+yy,opts)){
      const cx=(tx+xx)*TILE+16, cy=(ty+yy)*TILE+16; if(Math.abs(px-cx)<16+r && Math.abs(py-cy)<16+r) return true;
    }
    for(const b of this.buildings){ if(b.solid && distance(px,py,b.x,b.y)<(typeRadius(b.type)+r)) return true; }
    for(const b of this.blueprints){ if(distance(px,py,b.x,b.y)<(24+r)) return true; }
    return false;
  }
  nearestResource(x,y,pred,maxD=99999){ let best=null, bd=maxD*maxD; for(const r of this.resources){ if(pred && !pred(r)) continue; const d=dist2(x,y,r.x,r.y); if(d<bd){bd=d; best=r;} } return best; }
  nearestItem(x,y,pred,maxD=99999){ let best=null, bd=maxD*maxD; for(const it of this.items){ if(pred && !pred(it)) continue; const d=dist2(x,y,it.x,it.y); if(d<bd){bd=d; best=it;} } return best; }
  nearestBuilding(x,y,pred,maxD=99999){ let best=null, bd=maxD*maxD; for(const b of this.buildings){ if(pred && !pred(b)) continue; const d=dist2(x,y,b.x,b.y); if(d<bd){bd=d; best=b;} } return best; }
  nearestBlueprint(x,y,pred,maxD=99999){ let best=null, bd=maxD*maxD; for(const b of this.blueprints){ if(pred && !pred(b)) continue; const d=dist2(x,y,b.x,b.y); if(d<bd){bd=d; best=b;} } return best; }
  removeResource(id){ const i=this.resources.findIndex(r=>r.id===id); if(i>=0) this.resources.splice(i,1); }
  removeItem(id){ const i=this.items.findIndex(r=>r.id===id); if(i>=0) this.items.splice(i,1); }
  removeEnemy(id){ const i=this.enemies.findIndex(r=>r.id===id); if(i>=0) this.enemies.splice(i,1); }
  removeBlueprint(id){ const i=this.blueprints.findIndex(r=>r.id===id); if(i>=0) this.blueprints.splice(i,1); }
  serialize(){ return {seed:this.seed,kind:this.kind,island:this.island,resources:this.resources,items:this.items,buildings:this.buildings,blueprints:this.blueprints,defeatedVault:this.defeatedVault}; }
  findPath(sx,sy,gx,gy,opts={}){
    const radius=opts.radius||9;
    const start={x:clamp(Math.floor(sx/TILE),0,this.w-1),y:clamp(Math.floor(sy/TILE),0,this.h-1)};
    let goal={x:clamp(Math.floor(gx/TILE),0,this.w-1),y:clamp(Math.floor(gy/TILE),0,this.h-1)};
    const idx=(x,y)=>y*this.w+x, total=this.w*this.h;
    const openCell=(x,y,allowEndpoint=false)=>{
      if(!this.inBounds(x,y) || !this.isWalkableTile(x,y,opts)) return false;
      if(allowEndpoint && x===start.x&&y===start.y) return true;
      return !this.isBlocked(x*TILE+TILE/2,y*TILE+TILE/2,radius,opts);
    };
    if(!openCell(goal.x,goal.y,true)){
      let found=null, best=999999;
      for(let r=1;r<=6;r++) for(let yy=-r;yy<=r;yy++) for(let xx=-r;xx<=r;xx++){
        if(Math.abs(xx)!==r && Math.abs(yy)!==r) continue;
        const tx=goal.x+xx, ty=goal.y+yy;
        if(openCell(tx,ty,false)){
          const score=Math.hypot(tx-goal.x,ty-goal.y)+Math.hypot(tx-start.x,ty-start.y)*.03;
          if(score<best){ best=score; found={x:tx,y:ty}; }
        }
      }
      if(found) goal=found; else return [];
    }
    const came=new Int32Array(total); came.fill(-1);
    const qx=new Int16Array(total), qy=new Int16Array(total);
    let head=0, tail=0; qx[tail]=start.x; qy[tail++]=start.y; came[idx(start.x,start.y)]=idx(start.x,start.y);
    const dirs=[[1,0],[-1,0],[0,1],[0,-1]]; let foundIdx=-1, visited=0, maxNodes=opts.maxNodes||1600;
    while(head<tail && visited++<maxNodes){
      const x=qx[head], y=qy[head++];
      if(x===goal.x && y===goal.y){ foundIdx=idx(x,y); break; }
      dirs.sort((a,b)=>(Math.abs(goal.x-(x+a[0]))+Math.abs(goal.y-(y+a[1])))-(Math.abs(goal.x-(x+b[0]))+Math.abs(goal.y-(y+b[1]))));
      for(const [dx,dy] of dirs){
        const nx=x+dx, ny=y+dy; if(!openCell(nx,ny,false)) continue;
        const ni=idx(nx,ny); if(came[ni]!==-1) continue;
        came[ni]=idx(x,y); qx[tail]=nx; qy[tail++]=ny;
      }
    }
    if(foundIdx<0) return [];
    const cells=[]; let cur=foundIdx;
    while(cur!==came[cur] && cells.length<96){ const x=cur%this.w, y=Math.floor(cur/this.w); cells.push({x:x*TILE+TILE/2,y:y*TILE+TILE/2}); cur=came[cur]; }
    cells.reverse(); return cells;
  }
  static fromData(data={}){ const w=new World(finiteNumber(data.seed,Date.now()&0x7fffffff),data.kind==='dungeon'?'dungeon':'overworld',finiteNumber(data.island,1)); w.resources=Array.isArray(data.resources)?data.resources:[]; w.items=Array.isArray(data.items)?data.items:[]; w.buildings=Array.isArray(data.buildings)?data.buildings:[]; w.blueprints=Array.isArray(data.blueprints)?data.blueprints:[]; w.enemies=[]; w.defeatedVault=!!data.defeatedVault; return w; }
}
export function typeRadius(type){ return {chest:24,workbench:32,campfire:20,bed:30,wall:32,forge:30,raft:42,vault:46,galleon:58,cage:28,totem:22}[type] || 20; }
