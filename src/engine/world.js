import { TILE, WORLD_W, WORLD_H, BUILDINGS, clamp, distance, dist2, hash2, mulberry32, randRange, choice, nowId, finiteNumber } from './shared.js';

const WALKABLE = new Set(['grass','grass2','meadow','dirt','path','sand','shore','shallow','stone','woodfloor']);
const WATERISH = new Set(['water','shallow','shore']);

export class World {
  constructor(seed=Date.now()&0x7fffffff, data=null){
    this.seed=seed|0; this.w=WORLD_W; this.h=WORLD_H; this.tiles=new Array(this.w*this.h).fill('water');
    this.resources=[]; this.items=[]; this.buildings=[]; this.animals=[]; this.enemies=[]; this.crops=[]; this.decorations=[]; this.paths=[];
    this.spawn={x:this.w*TILE/2,y:this.h*TILE/2}; this.rng=mulberry32(this.seed);
    if(data) this.fromData(data); else this.generate();
  }
  idx(x,y){ return y*this.w+x; }
  inBounds(x,y){ return x>=0&&y>=0&&x<this.w&&y<this.h; }
  tile(x,y){ return this.inBounds(x,y)?this.tiles[this.idx(x,y)]:'water'; }
  setTile(x,y,t){ if(this.inBounds(x,y)) this.tiles[this.idx(x,y)]=t; }
  generate(){
    const rng=this.rng, cx=this.w*.5+randRange(rng,-4,4), cy=this.h*.5+randRange(rng,-4,4);
    const lobes=[
      {x:cx,y:cy,rx:48,ry:34}, {x:cx-28,y:cy+4,rx:25,ry:18}, {x:cx+30,y:cy-8,rx:28,ry:20},
      {x:cx+4,y:cy+26,rx:26,ry:18}, {x:cx-6,y:cy-25,rx:24,ry:18}
    ];
    for(let y=0;y<this.h;y++) for(let x=0;x<this.w;x++){
      let v=-999;
      for(const l of lobes){ const n=(hash2(Math.floor(x/4),Math.floor(y/4),this.seed)-.5)*.11; v=Math.max(v,1-Math.hypot((x-l.x)/l.rx,(y-l.y)/l.ry)+n); }
      let t='water';
      if(v>.015) t='shallow'; if(v>.105) t='shore'; if(v>.19) t='sand'; if(v>.31) t=hash2(x,y,this.seed+7)>.70?'grass2':'grass'; if(v>.52 && hash2(x,y,this.seed+9)>.57) t='meadow';
      this.setTile(x,y,t);
    }
    this.smooth();
    const sp=this.findSpawn(); this.spawn={x:sp.x*TILE+TILE/2,y:sp.y*TILE+TILE*.74};
    this.clearArea(sp.x,sp.y,13);
    this.makeVillage(sp);
    this.populateResources(sp);
    this.populateAnimals(sp);
    this.spawnEnemies(sp);
  }
  smooth(){
    for(let pass=0;pass<2;pass++){
      const next=this.tiles.slice();
      for(let y=1;y<this.h-1;y++) for(let x=1;x<this.w-1;x++){
        const c={}; for(let yy=-1;yy<=1;yy++) for(let xx=-1;xx<=1;xx++){ const t=this.tile(x+xx,y+yy); c[t]=(c[t]||0)+1; }
        const t=this.tile(x,y);
        if((t==='grass'||t==='grass2'||t==='meadow') && ((c.water||0)+(c.shallow||0)>0)) next[this.idx(x,y)]='sand';
        if(t==='sand' && (c.water||0)>2) next[this.idx(x,y)]='shore';
        if(t==='shore' && (c.water||0)>4) next[this.idx(x,y)]='shallow';
      }
      this.tiles=next;
    }
  }
  findSpawn(){
    let best={x:Math.floor(this.w/2),y:Math.floor(this.h/2),score:Infinity};
    for(let y=12;y<this.h-12;y++) for(let x=12;x<this.w-12;x++){
      const t=this.tile(x,y); if(!['grass','grass2','meadow','sand'].includes(t)) continue;
      let water=0, land=0; for(let yy=-7;yy<=7;yy++) for(let xx=-7;xx<=7;xx++){ const nt=this.tile(x+xx,y+yy); if(nt==='water'||nt==='shallow'||nt==='shore') water++; else land++; }
      const score=Math.abs(water-18)*.8 - land*.06 + Math.hypot(x-this.w/2,y-this.h/2)*.22 + hash2(x,y,this.seed)*4;
      if(score<best.score) best={x,y,score};
    }
    return best;
  }
  clearArea(cx,cy,r){
    for(let y=cy-r;y<=cy+r;y++) for(let x=cx-r;x<=cx+r;x++){
      if(!this.inBounds(x,y)) continue; const d=Math.hypot(x-cx,y-cy);
      if(d<2.5) this.setTile(x,y,'path'); else if(d<r) this.setTile(x,y,d>r-1?'grass':'grass2');
    }
  }
  makeVillage(sp){
    const addB=(type,dx,dy,extra={})=>this.addBuilding(type,(sp.x+dx)*TILE+TILE/2,(sp.y+dy)*TILE+TILE*.74,extra);
    const plans=[['home',-7,-4],['workshop',7,-4],['shop',0,-8],['cabin',-9,5],['factory',8,5],['well',0,3],['windmill',15,-8]];
    for(const [type,dx,dy] of plans) addB(type,dx,dy,{built:true});
    const hubs=[[sp.x,sp.y],[sp.x-7,sp.y-4],[sp.x+7,sp.y-4],[sp.x,sp.y-8],[sp.x-9,sp.y+5],[sp.x+8,sp.y+5],[sp.x+15,sp.y-8]];
    for(const [x1,y1] of hubs.slice(1)) this.pathBetween(sp.x,sp.y,x1,y1,2);
    this.pathBetween(sp.x-12,sp.y+8,sp.x+13,sp.y+8,1);
    this.makeFarm(sp.x+3, sp.y+9, 12, 6);
    this.makeFarm(sp.x-16, sp.y-1, 7, 5);
    const beaches=this.nearestTiles(sp.x,sp.y,t=>t==='sand'||t==='shore',3,18);
    for(const beach of beaches){ this.addBuilding('dock',beach.x*TILE+TILE/2,beach.y*TILE+TILE*.74,{built:true}); this.pathBetween(sp.x,sp.y,beach.x,beach.y,1); this.addDecor('coracle',beach.x*TILE+TILE/2+24,beach.y*TILE+TILE*.74+10); }
    const decs=[
      ['crateBase',-4,-6],['crateTop',-3,-6],['crateBase',5,-7],['crateTop',6,-7],['campfire',-2,6],['bushRed',-12,-5],['bushBlue',11,-2],['bushRed',5,9],['bushBlue',-7,8],['coracleWater',13,10]
    ];
    for(const [type,dx,dy] of decs) this.addDecor(type,(sp.x+dx)*TILE+TILE/2,(sp.y+dy)*TILE+TILE*.74);
  }
  makeFarm(sx,sy,w,h){
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const tx=sx+x, ty=sy+y; if(!this.inBounds(tx,ty) || WATERISH.has(this.tile(tx,ty))) continue;
      this.setTile(tx,ty,'dirt');
      const c={id:nowId(),x:tx*TILE+TILE/2,y:ty*TILE+TILE*.74,plant:null,age:0,ready:false};
      if((x+y)%3!==0){ const plants=['carrot','pumpkin','wheat','cabbage']; c.plant=plants[(x+y)%plants.length]; c.age=20+((x*7+y*5)%20); c.ready=c.age>38; }
      this.crops.push(c);
    }
  }
  pathBetween(x,y,tx,ty,width=1){
    let cx=x, cy=y, n=0;
    while((cx!==tx||cy!==ty)&&n++<400){
      for(let yy=-width;yy<=width;yy++) for(let xx=-width;xx<=width;xx++){ const px=cx+xx, py=cy+yy; if(this.inBounds(px,py)&&!WATERISH.has(this.tile(px,py))) this.setTile(px,py,'path'); }
      if(Math.abs(tx-cx)>Math.abs(ty-cy)) cx+=Math.sign(tx-cx); else cy+=Math.sign(ty-cy);
    }
  }
  findNearestTile(cx,cy,pred){ let best=null,bd=Infinity; for(let y=1;y<this.h-1;y++) for(let x=1;x<this.w-1;x++){ if(!pred(this.tile(x,y))) continue; const d=(x-cx)**2+(y-cy)**2; if(d<bd){bd=d;best={x,y};} } return best; }
  nearestTiles(cx,cy,pred,count=3,minSep=10){
    const all=[]; for(let y=1;y<this.h-1;y++) for(let x=1;x<this.w-1;x++){ if(pred(this.tile(x,y))) all.push({x,y,d:(x-cx)**2+(y-cy)**2}); }
    all.sort((a,b)=>a.d-b.d); const out=[];
    for(const p of all){ if(out.every(o=>Math.hypot(o.x-p.x,o.y-p.y)>=minSep)){ out.push(p); if(out.length>=count) break; } }
    return out;
  }
  populateResources(sp){
    const rng=this.rng; const clear=(x,y)=>!this.isBlocked(x*TILE+TILE/2,y*TILE+TILE/2,12,{ignoreResources:true,ignoreDecorations:true}) && Math.hypot(x-sp.x,y-sp.y)>7;
    for(let i=0;i<210;i++){
      const x=Math.floor(randRange(rng,4,this.w-4)), y=Math.floor(randRange(rng,4,this.h-4)); const t=this.tile(x,y); if(!clear(x,y)) continue;
      if((t==='grass'||t==='grass2'||t==='meadow') && rng()<.62) this.addResource('tree',x*TILE+TILE/2,y*TILE+TILE*.74,{variant:Math.floor(rng()*2),seed:rng()*10});
      else if((t==='grass'||t==='sand'||t==='stone'||t==='meadow') && rng()<.28) this.addResource('rock',x*TILE+TILE/2,y*TILE+TILE*.74,{seed:rng()*10});
      else if((t==='grass2'||t==='meadow') && rng()<.55) this.addResource('mushroom',x*TILE+TILE/2,y*TILE+TILE*.74,{variant:Math.floor(rng()*2),seed:rng()*10});
    }
    for(let i=0;i<10;i++){ const a=i/10*Math.PI*2, r=8+i%3; this.addResource(i%3===0?'rock':i%3===1?'mushroom':'tree',this.spawn.x+Math.cos(a)*r*TILE,this.spawn.y+Math.sin(a)*r*TILE,{variant:i%2,seed:i}); }
  }
  populateAnimals(sp){
    const rng=this.rng; const types=['duck','chicken','cow','sheep','pig'];
    for(let i=0;i<26;i++){
      const type=choice(rng,types); let x=this.spawn.x+randRange(rng,-420,460), y=this.spawn.y+randRange(rng,-330,360);
      for(let tries=0; tries<30 && this.isBlocked(x,y,8,{ignoreAnimals:true}); tries++){ x=this.spawn.x+randRange(rng,-420,460); y=this.spawn.y+randRange(rng,-330,360); }
      this.animals.push({id:nowId(),type,x,y,home:{x,y},walk:rng()*6,anim:rng()*4,facing:rng()<.5?'left':'right',wander:rng()*Math.PI*2,pause:rng()*1.8});
    }
  }
  spawnEnemies(sp){ for(let i=0;i<12;i++){ const p=this.findFarWalkable(sp); if(p) this.enemies.push({id:nowId(),type:i%4===0?'skeleton':'goblin',x:p.x*TILE+TILE/2,y:p.y*TILE+TILE*.74,hp:i%4===0?90:36,maxHp:i%4===0?90:36,anim:0,attackCd:0,facing:'left'}); } }
  findFarWalkable(sp){ let best=null,bd=-1; for(let i=0;i<900;i++){ const x=Math.floor(randRange(this.rng,4,this.w-4)),y=Math.floor(randRange(this.rng,4,this.h-4)); if(!this.isWalkableTile(x,y,{}) || this.isBlocked(x*TILE+TILE/2,y*TILE+TILE*.74,16)) continue; const d=Math.hypot(x-sp.x,y-sp.y); if(d>bd){bd=d;best={x,y};} } return best; }
  addResource(type,x,y,extra={}){ const hp=type==='tree'?5:type==='rock'?5:1; const r={id:nowId(),type,x,y,hp,maxHp:hp,...extra}; this.resources.push(r); return r; }
  addDecor(type,x,y,extra={}){ const d={id:nowId(),type,x,y,radius:type.startsWith('bush')?15:type.startsWith('crate')?12:10,...extra}; this.decorations.push(d); return d; }
  addItem(type,x,y,qty=1){ const near=this.items.find(i=>i.type===type && distance(i.x,i.y,x,y)<24); if(near){ near.qty+=qty; return near; } const it={id:nowId(),type,x,y,qty,vx:(Math.random()-.5)*35,vy:(Math.random()-.5)*35,t:0}; this.items.push(it); return it; }
  addBuilding(type,x,y,extra={}){ const b={id:nowId(),type,x,y,radius:BUILDINGS[type]?.radius||22,built:!!extra.built,progress:extra.built?1:0,...extra}; this.buildings.push(b); return b; }
  removeResource(id){ const i=this.resources.findIndex(r=>r.id===id); if(i>=0) this.resources.splice(i,1); }
  removeItem(id){ const i=this.items.findIndex(r=>r.id===id); if(i>=0) this.items.splice(i,1); }
  isWalkableTile(tx,ty,opts={}){ const t=this.tile(tx,ty); if(t==='water') return !!opts.boat; return WALKABLE.has(t); }
  isBlocked(px,py,r=8,opts={}){
    const tx=Math.floor(px/TILE), ty=Math.floor(py/TILE); if(!this.isWalkableTile(tx,ty,opts)) return true;
    if(!opts.ignoreBuildings) for(const b of this.buildings){ if(b.built && distance(px,py,b.x,b.y)<(b.radius+r)) return true; }
    if(!opts.ignoreResources) for(const o of this.resources){ if(distance(px,py,o.x,o.y)<(o.type==='tree'?24:10)+r) return true; }
    if(!opts.ignoreDecorations) for(const d of this.decorations||[]){ if(d.type==='coracleWater') continue; if(distance(px,py,d.x,d.y)<(d.radius||10)+r*.5) return true; }
    if(!opts.ignoreAnimals) for(const a of this.animals||[]){ if(distance(px,py,a.x,a.y)<(a.type==='cow'?14:9)+r*.35) return true; }
    return false;
  }
  nearestResource(x,y,maxD=99999,pred=null){ let best=null,bd=maxD*maxD; for(const r of this.resources){ if(pred&&!pred(r)) continue; const d=dist2(x,y,r.x,r.y); if(d<bd){bd=d;best=r;} } return best; }
  nearestItem(x,y,maxD=99999){ let best=null,bd=maxD*maxD; for(const it of this.items){ const d=dist2(x,y,it.x,it.y); if(d<bd){bd=d;best=it;} } return best; }
  nearestBuilding(x,y,maxD=99999,pred=null){ let best=null,bd=maxD*maxD; for(const b of this.buildings){ if(pred&&!pred(b)) continue; const d=dist2(x,y,b.x,b.y); if(d<bd){bd=d;best=b;} } return best; }
  nearestCrop(x,y,maxD=99999){ let best=null,bd=maxD*maxD; for(const c of this.crops){ const d=dist2(x,y,c.x,c.y); if(d<bd){bd=d;best=c;} } return best; }
  findPath(sx,sy,gx,gy,opts={}){
    const start={x:clamp(Math.floor(sx/TILE),0,this.w-1),y:clamp(Math.floor(sy/TILE),0,this.h-1)}; let goal={x:clamp(Math.floor(gx/TILE),0,this.w-1),y:clamp(Math.floor(gy/TILE),0,this.h-1)};
    const total=this.w*this.h, idx=(x,y)=>y*this.w+x, radius=opts.radius||8;
    const openCell=(x,y,allowStart=false)=>{ if(!this.inBounds(x,y)||!this.isWalkableTile(x,y,opts)) return false; if(allowStart&&x===start.x&&y===start.y) return true; return !this.isBlocked(x*TILE+TILE/2,y*TILE+TILE*.74,radius,opts); };
    if(!openCell(goal.x,goal.y,false)){
      let found=null, best=Infinity; for(let r=1;r<=8;r++) for(let yy=-r;yy<=r;yy++) for(let xx=-r;xx<=r;xx++){ if(Math.abs(xx)!==r&&Math.abs(yy)!==r) continue; const x=goal.x+xx,y=goal.y+yy; if(openCell(x,y,false)){ const s=Math.hypot(x-goal.x,y-goal.y); if(s<best){best=s; found={x,y};}} }
      if(found) goal=found; else return [];
    }
    const came=new Int32Array(total); came.fill(-1); const g=new Float32Array(total); g.fill(Infinity); const f=new Float32Array(total); f.fill(Infinity); const closed=new Uint8Array(total); const open=[idx(start.x,start.y)]; came[open[0]]=open[0]; g[open[0]]=0;
    const h=(x,y)=>{const dx=Math.abs(goal.x-x),dy=Math.abs(goal.y-y); return 10*(dx+dy)+(14-20)*Math.min(dx,dy);}; f[open[0]]=h(start.x,start.y); const dirs=[[1,0,10],[-1,0,10],[0,1,10],[0,-1,10],[1,1,14],[-1,1,14],[1,-1,14],[-1,-1,14]]; let found=-1, steps=0;
    while(open.length&&steps++<(opts.maxNodes||5200)){
      let bi=0; for(let i=1;i<open.length;i++) if(f[open[i]]<f[open[bi]]) bi=i; const cur=open.splice(bi,1)[0]; if(closed[cur]) continue; closed[cur]=1; const x=cur%this.w,y=(cur/this.w)|0; if(x===goal.x&&y===goal.y){found=cur;break;}
      for(const [dx,dy,cost] of dirs){ const nx=x+dx,ny=y+dy; if(!openCell(nx,ny,false)) continue; if(dx&&dy&&(!openCell(x+dx,y,false)||!openCell(x,y+dy,false))) continue; const ni=idx(nx,ny); if(closed[ni]) continue; const tile=this.tile(nx,ny); const pen=tile==='shallow'?6:tile==='sand'?1:tile==='path'?-2:0; const tg=g[cur]+cost+pen; if(tg<g[ni]){came[ni]=cur; g[ni]=tg; f[ni]=tg+h(nx,ny); if(!open.includes(ni)) open.push(ni);} }
    }
    if(found<0) return [];
    const cells=[]; let c=found; while(c!==came[c]&&cells.length<220){ const x=c%this.w,y=(c/this.w)|0; cells.push({x:x*TILE+TILE/2,y:y*TILE+TILE*.74}); c=came[c]; } cells.reverse(); return this.smoothPath(cells,radius,opts);
  }
  lineBlocked(x1,y1,x2,y2,r,opts){ const steps=Math.max(1,Math.ceil(distance(x1,y1,x2,y2)/12)); for(let i=1;i<=steps;i++){ const t=i/steps; if(this.isBlocked(x1+(x2-x1)*t,y1+(y2-y1)*t,r,opts)) return true; } return false; }
  smoothPath(path,r,opts){ if(path.length<3) return path; const out=[path[0]]; let anchor=path[0]; for(let i=1;i<path.length-1;i++){ if(this.lineBlocked(anchor.x,anchor.y,path[i+1].x,path[i+1].y,r,opts)){ anchor=path[i]; out.push(anchor); } } out.push(path[path.length-1]); return out; }
  serialize(){ return {seed:this.seed,tiles:this.tiles,resources:this.resources,items:this.items,buildings:this.buildings,animals:this.animals,enemies:this.enemies,crops:this.crops,decorations:this.decorations,spawn:this.spawn}; }
  fromData(d){ this.seed=finiteNumber(d.seed,this.seed)|0; this.tiles=Array.isArray(d.tiles)&&d.tiles.length===this.w*this.h?d.tiles:this.tiles; this.resources=Array.isArray(d.resources)?d.resources:[]; this.items=Array.isArray(d.items)?d.items:[]; this.buildings=Array.isArray(d.buildings)?d.buildings:[]; this.animals=Array.isArray(d.animals)?d.animals:[]; this.enemies=Array.isArray(d.enemies)?d.enemies:[]; this.crops=Array.isArray(d.crops)?d.crops:[]; this.decorations=Array.isArray(d.decorations)?d.decorations:[]; this.spawn=d.spawn||this.spawn; }
  static fromData(d){ return new World(finiteNumber(d?.seed,Date.now()&0x7fffffff),d); }
}
