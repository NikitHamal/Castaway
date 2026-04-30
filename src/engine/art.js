import { TILE, ASSETS, SHEETS, COLORS, BUILDINGS, ITEMS, clamp, TWO_PI } from './shared.js';

export class Art {
  constructor(){ this.sprites={}; this.sheets={}; this.assetsReady=false; this.assetErrors=[]; }
  loadImage(src){ return new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=()=>reject(new Error(`Failed to load ${src}`)); img.src=src; }); }
  async loadAssets(onProgress=null){
    if(this.assetsReady){ if(onProgress) onProgress(1); return true; }
    const entries=[...Object.entries(ASSETS).map(([key,path])=>({key,path,kind:'sprite'})), ...Object.entries(SHEETS).map(([key,path])=>({key,path,kind:'sheet'}))];
    let done=0; const tick=()=>{ done++; if(onProgress) onProgress(done/entries.length); };
    await Promise.all(entries.map(e=>this.loadImage(e.path).then(img=>{ if(e.kind==='sheet') this.sheets[e.key]=img; else this.sprites[e.key]=img; tick(); }).catch(err=>{ this.assetErrors.push(err.message); tick(); })));
    this.assetsReady=true; return true;
  }
  img(id){ return this.sprites[id]; }
  drawAsset(ctx,id,x,y,{scale=1,w=null,h=null,anchor='center',alpha=1,flip=false}={}){
    const img=this.img(id); if(!img) return false;
    const dw=Math.round(w || (h ? h*img.width/img.height : img.width*scale));
    const dh=Math.round(h || (w ? w*img.height/img.width : img.height*scale));
    let dx=Math.round(x-dw/2), dy=Math.round(y-dh/2); if(anchor==='ground') dy=Math.round(y-dh); if(anchor==='topleft'){dx=Math.round(x); dy=Math.round(y);}
    ctx.save(); ctx.globalAlpha*=alpha; ctx.imageSmoothingEnabled=false;
    if(flip){ ctx.translate(dx+dw,dy); ctx.scale(-1,1); ctx.drawImage(img,0,0,dw,dh); }
    else ctx.drawImage(img,dx,dy,dw,dh);
    ctx.restore(); return true;
  }
  drawFrame(ctx,id,frames,x,y,{frame=0,scale=1,anchor='ground',flip=false,alpha=1}={}){
    const img=this.img(id); if(!img) return false;
    const fw=Math.floor(img.width/frames), fh=img.height, f=Math.floor(frame)%frames;
    const dw=Math.round(fw*scale), dh=Math.round(fh*scale);
    let dx=Math.round(x-dw/2), dy=Math.round(y-dh/2); if(anchor==='ground') dy=Math.round(y-dh); if(anchor==='topleft'){dx=Math.round(x);dy=Math.round(y);}
    ctx.save(); ctx.globalAlpha*=alpha; ctx.imageSmoothingEnabled=false;
    if(flip){ ctx.translate(dx+dw,dy); ctx.scale(-1,1); ctx.drawImage(img,f*fw,0,fw,fh,0,0,dw,dh); }
    else ctx.drawImage(img,f*fw,0,fw,fh,dx,dy,dw,dh);
    ctx.restore(); return true;
  }
  drawTile(ctx,type,x,y,tx,ty,time=0){
    let key={grass:'tile_grass',grass2:'tile_grass2',meadow:'tile_meadow',dirt:'tile_dirt',path:'tile_path',sand:'tile_sand',shore:'tile_shore',water:'tile_water',shallow:'tile_shallow',stone:'tile_stone',woodfloor:'tile_woodfloor',wall:'tile_walltile'}[type] || 'tile_grass';
    const img=this.img(key);
    if(img) ctx.drawImage(img,Math.floor(x),Math.floor(y),TILE,TILE);
    else { ctx.fillStyle=COLORS[type]||COLORS.grass; ctx.fillRect(x,y,TILE,TILE); }
    if(type==='water'||type==='shallow'){
      const a=(time*0.8+tx*0.7+ty*0.35)%TWO_PI;
      ctx.fillStyle=type==='water'?'rgba(255,255,255,.18)':'rgba(255,255,255,.22)';
      for(let i=0;i<2;i++) ctx.fillRect(Math.floor(x+8+i*18+Math.sin(a+i)*4), Math.floor(y+10+i*15), 12, 2);
    }
  }
  shadow(ctx,x,y,rx=18,ry=7,alpha=.32){ ctx.save(); ctx.fillStyle=`rgba(0,0,0,${alpha})`; ctx.beginPath(); ctx.ellipse(Math.round(x),Math.round(y),rx,ry,0,0,TWO_PI); ctx.fill(); ctx.restore(); }
  playerSheet(p){
    const dir = p.dir === 'up' ? 'up' : (p.dir === 'down' ? 'down' : 'side');
    const action = p.action || 'idle';
    const flip = dir === 'side' && p.facing === 'left';
    let base = p.running && p.moving ? 'run' : (p.moving ? 'walk' : 'idle');
    let frames = base === 'idle' ? 4 : 6;
    let speed = base === 'idle' ? 5 : (base === 'run' ? 12 : 8);
    if(action === 'attack') { base = 'slice'; frames = 8; speed = 16; }
    else if(action === 'axe') { base = 'hit'; frames = 4; speed = 12; }
    else if(action === 'mine') { base = 'crush'; frames = 8; speed = 15; }
    else if(action === 'hammer') { base = 'collect'; frames = 8; speed = 15; }
    else if(action === 'plant') { base = 'collect'; frames = 8; speed = 13; }
    else if(action === 'water') { base = 'water'; frames = 8; speed = 12; }
    else if(action === 'fish') { base = 'fish'; frames = 8; speed = 10; }
    const key = `pc_${base}_${dir}`;
    return {key, frames, speed, flip, action};
  }
  drawToolOverlay(ctx,p,action){
    const tool={axe:'uiAxe',mine:'uiPickaxe',hammer:'uiHammer',attack:'uiSword'}[action];
    if(!tool) return;
    const side=p.dir==='side', left=p.facing==='left';
    let ox=side?(left?-18:18):0, oy=p.dir==='up'?-40:-28, rot=0;
    if(action==='mine') { oy-=4; ox=side?(left?-24:24):10; }
    if(action==='hammer') { oy=-20; ox=side?(left?-22:22):14; }
    this.drawAsset(ctx,tool,p.sx+ox,p.sy+oy,{scale:.72,flip:left,alpha:.96});
  }
  drawPlayer(ctx,p){
    const sx=p.sx, sy=p.sy, bob=p.z||0;
    this.shadow(ctx,sx,sy,11,4,.28);
    const s=this.playerSheet(p);
    const frame=Math.floor((p.anim||0)*s.speed)%s.frames;
    this.drawFrame(ctx,s.key,s.frames,sx,sy+18-bob,{frame,scale:1.08,flip:s.flip});
    if(p.actionTimer>0) this.drawToolOverlay(ctx,p,s.action);
  }
  drawResource(ctx,r,time=0){
    const x=r.sx,y=r.sy;
    if(r.type==='tree'){
      this.shadow(ctx,x,y,24,8,.24);
      this.drawAsset(ctx,r.variant%2?'propTree1':'propTree0',x,y+5,{scale:r.variant%2?1.24:1.34,anchor:'ground'});
    } else if(r.type==='rock'){
      this.shadow(ctx,x,y,11,4,.22); this.drawAsset(ctx,'rock',x,y,{scale:2.15,anchor:'ground'});
    } else if(r.type==='mushroom'){
      this.shadow(ctx,x,y,7,3,.18); this.drawFrame(ctx,r.variant%2?'mushroomBlue':'mushroomRed',4,x,y,{frame:Math.floor(time*2+r.seed)%4,scale:1.55});
    }
  }
  drawDecoration(ctx,d,time=0){
    const x=d.sx,y=d.sy, type=d.type;
    if(type==='campfire'){ this.shadow(ctx,x,y,12,4,.22); this.drawFrame(ctx,'fireBig',4,x,y,{frame:Math.floor(time*8)%4,scale:1.7}); return; }
    if(type==='coracleWater'){ this.drawFrame(ctx,'coracleWater',4,x,y,{frame:Math.floor(time*4)%4,scale:1.08}); return; }
    const scales={bushRed:1.2,bushBlue:1.2,crateBase:1.6,crateTop:1.6,coracle:1.2,fish:1.2};
    const key={bushRed:'bushRed',bushBlue:'bushBlue',crateBase:'crateBase',crateTop:'crateTop',coracle:'coracle',fish:'fish'}[type]||type;
    this.shadow(ctx,x,y,12,4,.14);
    this.drawAsset(ctx,key,x,y,{scale:scales[type]||1,anchor:'ground',flip:!!d.flip});
  }
  drawBuilding(ctx,b,time=0){
    const x=b.sx,y=b.sy, key=BUILDINGS[b.type]?.asset || b.type;
    if(b.type==='windmill') { this.shadow(ctx,x,y,42,12,.24); this.drawFrame(ctx,'windmill',9,x,y,{frame:Math.floor(time*5)%9,scale:1.12}); return; }
    if(b.type==='campfire'){ this.shadow(ctx,x,y,10,4,.24); this.drawFrame(ctx,'fire',4,x,y,{frame:Math.floor(time*8)%4,scale:1.45}); return; }
    const img=this.img(key); const rx=img?Math.max(18,Math.min(90,img.width*.22)):Math.max(10,b.radius||20);
    this.shadow(ctx,x,y,rx,8,.22);
    const scale={home:.54,cabin:.58,workshop:.55,shop:.64,factory:.64,well:1.0,dock:1.0}[b.type]||1;
    this.drawAsset(ctx,key,x,y,{scale,anchor:'ground',alpha:b.built?1:.48});
    if((b.type==='home'||b.type==='cabin'||b.type==='workshop'||b.type==='shop'||b.type==='factory') && this.img('smoke')) this.drawFrame(ctx,'smoke',30,x+8,y-100,{frame:Math.floor(time*10)%30,scale:.5,alpha:.55});
  }
  drawAnimal(ctx,a,time=0){
    const frames=4, frame=Math.floor((a.anim||time)*4)%frames;
    const scale={duck:1.15,chicken:0.9,cow:0.82,sheep:0.85,pig:0.9}[a.type]||1;
    const shadow={duck:[7,3],chicken:[8,3],cow:[14,5],sheep:[13,5],pig:[12,4]}[a.type]||[9,4];
    this.shadow(ctx,a.sx,a.sy,shadow[0],shadow[1],.20);
    this.drawFrame(ctx,a.type,frames,a.sx,a.sy,{frame,scale,flip:a.facing==='right'});
  }
  drawEnemy(ctx,e,time=0){
    this.shadow(ctx,e.sx,e.sy,10,4,.30);
    const prefix=e.type==='skeleton'?'skeleton':'goblin'; const moving=e.moving; const attacking=e.action==='attack';
    const id=attacking?`${prefix}_attack`:(moving?`${prefix}_walk`:`${prefix}_idle`); const frames=attacking?(prefix==='skeleton'?7:10):(moving?8:(prefix==='skeleton'?6:9));
    this.drawFrame(ctx,id,frames,e.sx,e.sy,{frame:Math.floor((e.anim||0)*(attacking?14:8))%frames,scale:1.05,flip:e.facing==='left'});
  }
  drawCrop(ctx,c){
    this.drawAsset(ctx,c.ready?'soilReady':'soil',c.sx,c.sy,{scale:2.0,anchor:'ground'});
    if(c.plant){ const key={carrot:'carrot',pumpkin:'pumpkin',wheat:'wheat',cabbage:'cabbage'}[c.plant]||'carrot'; this.drawAsset(ctx,key,c.sx,c.sy-4,{scale:c.ready?1.35:1.0,anchor:'ground'}); }
  }
  drawItem(ctx,it){
    this.shadow(ctx,it.sx,it.sy,6,2,.18); this.drawAsset(ctx,ITEMS[it.type]?.icon||it.type,it.sx,it.sy-3,{scale:1.55,anchor:'ground'});
    if(it.qty>1){ ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.strokeStyle='black'; ctx.lineWidth=2; ctx.strokeText(String(it.qty),it.sx+9,it.sy-6); ctx.fillStyle='white'; ctx.fillText(String(it.qty),it.sx+9,it.sy-6); }
  }
  drawIcon(ctx,id,x,y,size=32){ const key=ITEMS[id]?.icon || BUILDINGS[id]?.asset || id; this.drawAsset(ctx,key,x,y,{w:size,h:size,anchor:'center'}); }
  drawBar(ctx,x,y,w,h,pct,color){ ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(x,y,w,h); ctx.fillStyle=color; ctx.fillRect(x,y,w*clamp(pct,0,1),h); ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.strokeRect(x+.5,y+.5,w,h); }
}
