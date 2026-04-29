import {
  TILE,
  PLAYER_DRAW_HEIGHT,
  MONKEY_DRAW_HEIGHT,
  GOBLIN_DRAW_HEIGHT,
  BOSS_DRAW_HEIGHT,
  ATTACK_COOLDOWN,
  TWO_PI,
  GENERATED_ASSETS,
  GENERATED_SHEETS,
  TILE_ASSET_KEYS,
  ICON_ASSET_KEYS,
  RESOURCE_ASSET_KEYS,
  BUILDING_ASSET_KEYS,
  BLUEPRINT_ASSET_KEYS,
  COLORS,
  BUILD_RECIPES,
  clamp,
  choice,
  hash2
} from './shared.js';

const TILE_KEY_PREFIX = 'tile_';

export class Art {
  constructor(){
    this.tileCanvases = {};
    this.sprites = {};
    this.sheets = {};
    this.assetsReady = false;
    this.assetErrors = [];
    this.makeTiles();
  }
  makeCanvas(w,h){ const c = document.createElement('canvas'); c.width=w; c.height=h; const ctx=c.getContext('2d'); ctx.imageSmoothingEnabled=false; return [c,ctx]; }
  loadImage(src){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load ${src}`));
      img.src = src;
    });
  }
  // Cleans up edge fringing from generated PNGs.
  // For tile assets: force alpha to 255 (tiles are fully opaque, kills seams).
  // For character/prop/icon assets: alpha threshold and white-halo cleanup so
  // edges become crisply transparent in production rendering.
  cleanupImage(img, key){
    try {
      const w = img.width, h = img.height;
      const c = document.createElement('canvas'); c.width=w; c.height=h;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0,0,w,h);
      const px = data.data;
      const isTile = key.startsWith(TILE_KEY_PREFIX);
      if (isTile){
        // Force fully opaque, also clamp any near-white halo at edges to nearest non-white sample.
        for (let i=0;i<px.length;i+=4){ px[i+3] = 255; }
      } else {
        // First pass: alpha threshold. Pixels with alpha below cutoff become fully transparent.
        // Pixels above cutoff get fully opaque alpha to remove fringing.
        const alphaCut = 138;
        const whiteHaloCut = 230; // r,g,b mean above this and alpha < 220 -> kill.
        for (let i=0;i<px.length;i+=4){
          const a = px[i+3];
          if (a === 0) continue;
          const r = px[i], g = px[i+1], b = px[i+2];
          // Kill semi-transparent white/cream halo pixels regardless of threshold.
          const lum = (r+g+b)/3;
          if (a < 220 && lum > whiteHaloCut){ px[i+3] = 0; continue; }
          if (a < alphaCut){ px[i+3] = 0; continue; }
          // Snap to opaque to avoid soft edges.
          px[i+3] = 255;
        }
        // Second pass: erode 1px halo of pixels that are white-ish AND adjacent to a transparent neighbor.
        const get = (x,y,off)=>px[((y*w)+x)*4+off];
        const set = (x,y,off,val)=>{ px[((y*w)+x)*4+off]=val; };
        for (let y=0;y<h;y++){
          for (let x=0;x<w;x++){
            const a = get(x,y,3); if (a===0) continue;
            // Edge if any 4-neighbor is transparent (or out-of-bounds counts as transparent).
            const tNbr = (x===0 || x===w-1 || y===0 || y===h-1) ||
              get(x-1,y,3)===0 || get(x+1,y,3)===0 || get(x,y-1,3)===0 || get(x,y+1,3)===0;
            if (!tNbr) continue;
            const r=get(x,y,0), g=get(x,y,1), b=get(x,y,2);
            const lum=(r+g+b)/3;
            // If pixel is bright/white-ish at the silhouette, kill it.
            if (lum > 218) set(x,y,3,0);
          }
        }
      }
      ctx.putImageData(data,0,0);
      return c;
    } catch(e){
      // If anything goes wrong (CORS, etc.), fall back to original image.
      return img;
    }
  }
  async loadAssets(){
    if(this.assetsReady) return true;
    const loads = [];
    for(const [key,path] of Object.entries(GENERATED_ASSETS)){
      loads.push(this.loadImage(path).then(img => {
        this.sprites[key] = this.cleanupImage(img, key);
      }).catch(err => { this.assetErrors.push(err.message); }));
    }
    for(const [key,path] of Object.entries(GENERATED_SHEETS)){
      loads.push(this.loadImage(path).then(img => { this.sheets[key]=img; }).catch(err => { this.assetErrors.push(err.message); }));
    }
    await Promise.all(loads);
    this.assetsReady = Object.keys(this.sprites).length > 0;
    return this.assetsReady;
  }
  has(id){ return !!this.sprites[id]; }
  drawAsset(ctx,id,x,y,opts={}){
    const img=this.sprites[id]; if(!img) return false;
    const scale=opts.scale ?? 1, alpha=opts.alpha ?? 1;
    let w, h;
    if(opts.w && opts.h){ w=Math.round(opts.w); h=Math.round(opts.h); }
    else if(opts.w){ w=Math.round(opts.w); h=Math.round(opts.w * (img.height / img.width)); }
    else if(opts.h){ h=Math.round(opts.h); w=Math.round(opts.h * (img.width / img.height)); }
    else { w=Math.round(img.width*scale); h=Math.round(img.height*scale); }
    const anchor=opts.anchor || 'center';
    let dx=Math.round(x-w/2), dy=Math.round(y-h/2);
    if(anchor==='ground') dy=Math.round(y-h);
    else if(anchor==='topleft'){ dx=Math.round(x); dy=Math.round(y); }
    ctx.save(); ctx.globalAlpha*=alpha;
    if(opts.flip){ ctx.translate(dx+w,dy); ctx.scale(-1,1); ctx.drawImage(img,0,0,w,h); }
    else ctx.drawImage(img,dx,dy,w,h);
    ctx.restore();
    return true;
  }
  drawCharacterAsset(ctx,id,x,y,opts={}){
    const img=this.sprites[id]; if(!img) return false;
    const cropBottom=Math.max(0, opts.cropBottom ?? 2);
    const sw=img.width, sh=Math.max(1, img.height-cropBottom);
    const alpha=opts.alpha ?? 1;
    let w, h;
    if(opts.w && opts.h){ w=Math.round(opts.w); h=Math.round(opts.h); }
    else if(opts.w){ w=Math.round(opts.w); h=Math.round(opts.w * (sh / sw)); }
    else if(opts.h){ h=Math.round(opts.h); w=Math.round(opts.h * (sw / sh)); }
    else { const scale=opts.scale ?? 1; w=Math.round(sw*scale); h=Math.round(sh*scale); }
    const anchor=opts.anchor || 'center';
    let dx=Math.round(x-w/2), dy=Math.round(y-h/2);
    if(anchor==='ground') dy=Math.round(y-h);
    else if(anchor==='topleft'){ dx=Math.round(x); dy=Math.round(y); }
    ctx.save(); ctx.globalAlpha*=alpha;
    if(opts.flip){ ctx.translate(dx+w,dy); ctx.scale(-1,1); ctx.drawImage(img,0,0,sw,sh,0,0,w,h); }
    else ctx.drawImage(img,0,0,sw,sh,dx,dy,w,h);
    ctx.restore();
    return true;
  }
  // Tiles draw without overdraw bleed; we use exact TILE size at integer positions.
  drawTileAsset(ctx,id,x,y){
    const img=this.sprites[id]; if(!img) return false;
    const dx=Math.floor(x), dy=Math.floor(y);
    ctx.drawImage(img,dx,dy,TILE,TILE);
    return true;
  }
  px(ctx,x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
  makeTiles(){
    const types = ['grass','grass2','sand','water','shallow','stone','path','swamp','ash','lava','floor','walltile'];
    for (const type of types){
      const [c,ctx] = this.makeCanvas(TILE,TILE);
      this.drawTilePattern(ctx,type,0,0,0,0,0);
      this.tileCanvases[type] = c;
    }
  }
  drawTilePattern(ctx,type,x,y,tx,ty,time){
    const fill = color => { ctx.fillStyle=color; ctx.fillRect(x,y,TILE,TILE); };
    if (type === 'grass' || type === 'grass2') {
      fill(type==='grass' ? COLORS.grass : '#559f45');
      for (let i=0;i<28;i++){
        const h = hash2(tx*31+i,ty*17+i,11); const h2 = hash2(tx*13+i,ty*23+i,4);
        ctx.fillStyle = h > .55 ? COLORS.grassLight : COLORS.grassDark;
        ctx.fillRect(x + Math.floor(h*TILE), y + Math.floor(h2*TILE), h>.7?2:1, h2>.6?2:1);
      }
      if (type==='grass2'){
        for (let i=0;i<3;i++){
          ctx.fillStyle = ['#d84165','#f2d66b','#7c4dcc'][i];
          ctx.fillRect(x+5+Math.floor(hash2(tx+i,ty,99)*32), y+5+Math.floor(hash2(tx,ty+i,98)*32),3,3);
        }
      }
    } else if (type === 'sand') {
      fill(COLORS.sand);
      for (let i=0;i<24;i++){
        const h=hash2(tx*3+i,ty*7-i,3), h2=hash2(tx*5-i,ty*11+i,8);
        ctx.fillStyle = h>.5 ? COLORS.sandLight : COLORS.sandDark;
        ctx.fillRect(x+Math.floor(h*TILE), y+Math.floor(h2*TILE), h>.7?3:1, 1);
      }
    } else if (type === 'water' || type === 'shallow') {
      fill(type==='water' ? COLORS.water : COLORS.shallow);
      for (let i=0;i<10;i++){
        const yy = (Math.floor(hash2(tx+i,ty-i,4)*TILE) + Math.floor(time*16+i*5)) % TILE;
        ctx.fillStyle = i%2 ? COLORS.waterDark : COLORS.waterLight;
        ctx.globalAlpha = type==='water' ? .55 : .45;
        ctx.fillRect(x+Math.floor(hash2(tx-i,ty+i,5)*TILE), y+yy, 7+Math.floor(hash2(tx+i,ty+i,7)*10), 1);
        ctx.globalAlpha = 1;
      }
    } else if (type === 'stone' || type === 'floor') {
      fill(type==='floor'?'#917d60':COLORS.stone);
      ctx.strokeStyle = type==='floor'?'#5d5142':COLORS.stoneDark; ctx.lineWidth=1;
      for (let yy=0; yy<=TILE; yy+=10){ ctx.beginPath(); ctx.moveTo(x,y+yy); ctx.lineTo(x+TILE,y+yy); ctx.stroke(); }
      for (let xx=0; xx<=TILE; xx+=12){ ctx.beginPath(); ctx.moveTo(x+xx+(ty%2)*4,y); ctx.lineTo(x+xx+((ty+1)%2)*4,y+TILE); ctx.stroke(); }
      for (let i=0;i<10;i++){ ctx.fillStyle=COLORS.stoneLight; ctx.fillRect(x+Math.floor(hash2(tx+i,ty,41)*TILE), y+Math.floor(hash2(tx,ty+i,42)*TILE),1,1); }
    } else if (type === 'path') {
      fill('#9a8558');
      for(let i=0;i<28;i++){ const h=hash2(tx+i,ty-i,22), h2=hash2(tx-i,ty+i,23); ctx.fillStyle=h>.55?'#b2a476':'#6e6147'; ctx.beginPath(); ctx.ellipse(x+h*TILE,y+h2*TILE,1+h*2,1+h2*2,0,0,TWO_PI); ctx.fill(); }
    } else if (type === 'swamp') {
      fill('#486b3d');
      for(let i=0;i<14;i++){ const h=hash2(tx+i,ty,31), h2=hash2(tx,ty+i,32); ctx.fillStyle=h>.5?'#75b069':'#2e4f31'; ctx.globalAlpha=.7; ctx.fillRect(x+h*TILE,y+h2*TILE,3,1); ctx.globalAlpha=1; }
    } else if (type === 'ash') {
      fill('#615549');
      for(let i=0;i<18;i++){ const h=hash2(tx+i,ty,35), h2=hash2(tx,ty+i,36); ctx.fillStyle=h>.7?'#a26331':(h>.4?'#887864':'#403b38'); ctx.fillRect(x+h*TILE,y+h2*TILE,h>.5?2:1,1); }
    } else if (type === 'lava') {
      fill('#5e241f');
      for(let i=0;i<10;i++){ const h=hash2(tx+i,ty,39), h2=hash2(tx,ty+i,40); ctx.strokeStyle=h>.55?'#ffcc45':'#ff7a25'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+h*TILE,y+h2*TILE); ctx.lineTo(x+h*TILE+10,y+h2*TILE+(h-.5)*5); ctx.stroke(); }
    } else if (type === 'walltile') {
      fill('#3c3732');
      ctx.fillStyle='#504941'; ctx.fillRect(x,y+24,TILE,16); ctx.strokeStyle='#201b19'; for(let xx=0;xx<TILE;xx+=10){ctx.strokeRect(x+xx,y+5,10,16);} ctx.strokeRect(x,y+5,TILE,32);
    }
  }
  drawTile(ctx,type,x,y,tx,ty,time){
    const key=TILE_ASSET_KEYS[type];
    if(key && this.drawTileAsset(ctx,key,x,y)) return;
    if (type==='water' || type==='shallow' || type==='lava') this.drawTilePattern(ctx,type,x,y,tx,ty,time);
    else ctx.drawImage(this.tileCanvases[type] || this.tileCanvases.grass, Math.round(x), Math.round(y));
  }
  shadow(ctx,x,y,w=34,h=12,a=.32){ ctx.save(); ctx.fillStyle=`rgba(0,0,0,${a})`; ctx.beginPath(); ctx.ellipse(x,y,w,h,0,0,TWO_PI); ctx.fill(); ctx.restore(); }
  outlineRect(ctx,x,y,w,h,c=COLORS.ink){ ctx.strokeStyle=c; ctx.lineWidth=2; ctx.strokeRect(Math.round(x)+.5,Math.round(y)+.5,Math.round(w),Math.round(h)); }
  drawPlayer(ctx,x,y,dir='down',walk=0,charge=0,tool='hand',facing='right',attackCd=0){
    if(this.assetsReady){
      const baseDir = dir==='up' ? 'up' : (dir==='down' ? 'down' : 'side');
      const id = baseDir==='up' ? 'player_up' : (baseDir==='side' ? `player_walk_${Math.floor(walk*8)%3}` : 'player_down');
      // Side/walk sprites point left by default; flip when facing right.
      const flip = baseDir==='side' && facing==='right';
      // Shadow at the player's feet (just below the ground anchor).
      this.shadow(ctx,x,y+10,18,6,.32);
      if(this.drawCharacterAsset(ctx,id,x,y+12,{anchor:'ground',flip,h:PLAYER_DRAW_HEIGHT,cropBottom:2})){
        if(attackCd>0) this.drawToolSwing(ctx,x,y,tool,facing,baseDir,attackCd);
        if(charge>0){ ctx.save(); ctx.strokeStyle=`rgba(255,216,90,${.25+charge*.5})`; ctx.lineWidth=2+charge*4; ctx.beginPath(); ctx.arc(x,y-14,18+charge*8,0,TWO_PI); ctx.stroke(); ctx.restore(); }
        return;
      }
    }
    this.shadow(ctx,x,y+8,18,7,.32);
    ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(dir==='side' && facing==='left'){ ctx.scale(-1,1); }
    const bob = Math.sin(walk*8)*1.5;
    const step = Math.sin(walk*8) > 0 ? 1 : -1;
    // legs
    this.px(ctx,-6,6+bob,5,12,'#35517a'); this.px(ctx,3,6-bob,5,12,'#35517a');
    this.px(ctx,-7,17+bob,7,3,COLORS.ink); this.px(ctx,2,17-bob,7,3,COLORS.ink);
    // body
    this.px(ctx,-9,-9,18,18,'#3ac49e'); this.outlineRect(ctx,-9,-9,18,18);
    // arms
    this.px(ctx,-15,-6+step,6,14,'#ffb277'); this.px(ctx,9,-6-step,6,14,'#ffb277');
    this.outlineRect(ctx,-15,-6+step,6,14); this.outlineRect(ctx,9,-6-step,6,14);
    // head/hair
    ctx.fillStyle='#ffb277'; ctx.beginPath(); ctx.ellipse(0,-21,11,12,0,0,TWO_PI); ctx.fill();
    ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.stroke();
    if (dir==='up'){
      ctx.fillStyle='#3a2419'; ctx.beginPath(); ctx.ellipse(0,-24,12,10,0,0,TWO_PI); ctx.fill(); this.px(ctx,-9,-19,18,8,'#3a2419');
    } else if (dir==='side'){
      this.px(ctx,-8,-31,16,7,'#3a2419'); this.px(ctx,-11,-27,7,13,'#3a2419');
      this.px(ctx,4,-22,3,3,COLORS.ink); this.px(ctx,4,-15,6,2,'#d86f4a');
    } else {
      this.px(ctx,-10,-31,20,8,'#3a2419'); this.px(ctx,-11,-26,6,9,'#3a2419'); this.px(ctx,6,-26,5,7,'#3a2419');
      this.px(ctx,-4,-22,3,3,COLORS.ink); this.px(ctx,5,-22,3,3,COLORS.ink); this.px(ctx,-3,-15,7,2,'#d86f4a');
    }
    if (attackCd>0) this.drawToolSwing(ctx,0,0,tool,facing,dir,attackCd,true);
    if (charge>0){ ctx.strokeStyle=`rgba(255,216,90,${.25+charge*.5})`; ctx.lineWidth=2+charge*4; ctx.beginPath(); ctx.arc(0,-4,18+charge*8,0,TWO_PI); ctx.stroke(); }
    ctx.restore();
  }
  drawToolSwing(ctx,x,y,tool='hand',facing='right',dir='side',attackCd=0,local=false){
    if(!tool || tool==='hand' || tool==='berry' || tool==='banana' || tool==='monkey_munch') return;
    const iconKey = ICON_ASSET_KEYS[tool] || ICON_ASSET_KEYS.axe;
    const sign = facing==='left' ? -1 : 1;
    const phase = clamp(1 - attackCd/ATTACK_COOLDOWN,0,1);
    let ox=sign*22, oy=-19, rot=sign*(-1.05 + phase*2.1);
    if(dir==='up'){ ox=sign*8; oy=-34; rot=sign*(-.55 + phase*1.1); }
    else if(dir==='down'){ ox=sign*17; oy=-10; rot=sign*(-1.25 + phase*1.7); }
    const cx=local?ox:x+ox, cy=local?oy:y+oy;
    ctx.save();
    ctx.lineCap='round'; ctx.lineWidth=3; ctx.strokeStyle='rgba(255,245,214,.62)';
    ctx.beginPath();
    const arcR=tool==='hammer'?20:24;
    ctx.arc(local?0:x, local?-18:y-18, arcR, sign*(-.65+phase*.8), sign*(.35+phase*.8), sign<0);
    ctx.stroke();
    ctx.translate(Math.round(cx),Math.round(cy));
    ctx.rotate(rot);
    if(iconKey && this.sprites[iconKey]) this.drawAsset(ctx,iconKey,0,0,{anchor:'center',h:tool==='hammer'?25:28,flip:facing==='left'});
    else { ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-3,10); ctx.lineTo(3,-12); ctx.stroke(); }
    ctx.restore();
  }
  drawMonkey(ctx,x,y,walk=0,order=null,selected=false,entity=null){
    if(this.assetsReady){
      let id = entity?.carry ? 'monkey_carry' : (order?.type==='combat' ? 'monkey_attack' : `monkey_walk_${Math.floor(walk*7)%3}`);
      if(!entity || (!entity.carry && !order && Math.floor(walk*7)%3===0)) id='monkey_down';
      // Monkey side sprites face RIGHT in the source asset; flip when entity faces LEFT.
      const flip = entity?.facing==='left';
      // Position shadow at feet so it sits properly under the monkey.
      this.shadow(ctx,x,y+8,14,5,.30);
      if(this.drawCharacterAsset(ctx,id,x,y+10,{anchor:'ground',flip,h:MONKEY_DRAW_HEIGHT,cropBottom:2})){
        if(order){ ctx.save(); ctx.fillStyle='rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(x+15,y-32,8,0,TWO_PI); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.stroke(); this.drawMiniTaskIcon(ctx,x+15,y-32,order.type); ctx.restore(); }
        if(selected){ ctx.save(); ctx.strokeStyle=COLORS.yellow; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(x,y-9,22,0,TWO_PI); ctx.stroke(); ctx.restore(); }
        return;
      }
    }
    this.shadow(ctx,x,y+5,15,6,.32);
    ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(entity?.facing==='left'){ ctx.scale(-1,1); }
    const bob = Math.sin(walk*7)*1.5;
    ctx.strokeStyle='#6b3b24'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(-13,-14,8,Math.PI*.1,Math.PI*1.7); ctx.stroke();
    ctx.fillStyle='#81492b'; ctx.beginPath(); ctx.ellipse(0,-5+bob,9,10,0,0,TWO_PI); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle='#bf7651'; ctx.beginPath(); ctx.ellipse(0,-4+bob,6,7,0,0,TWO_PI); ctx.fill();
    ctx.fillStyle='#81492b'; ctx.beginPath(); ctx.ellipse(0,-19+bob,10,9,0,0,TWO_PI); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#e6a077'; ctx.beginPath(); ctx.ellipse(0,-17+bob,6,5,0,0,TWO_PI); ctx.fill();
    ctx.fillStyle=COLORS.ink; ctx.fillRect(-4,-18+bob,2,2); ctx.fillRect(4,-18+bob,2,2);
    this.px(ctx,-9,4+bob,4,8,'#6b3b24'); this.px(ctx,5,4-bob,4,8,'#6b3b24');
    if (order){
      ctx.fillStyle='rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(12,-30,8,0,TWO_PI); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.stroke();
      this.drawMiniTaskIcon(ctx,12,-30,order.type);
    }
    if (selected){ ctx.strokeStyle=COLORS.yellow; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,-8,23,0,TWO_PI); ctx.stroke(); }
    ctx.restore();
  }
  drawMiniTaskIcon(ctx,x,y,type){
    ctx.save(); ctx.translate(x,y); ctx.strokeStyle=COLORS.ink; ctx.fillStyle=COLORS.ink; ctx.lineWidth=2;
    if (type==='harvest'){ ctx.beginPath(); ctx.moveTo(-4,4); ctx.lineTo(4,-5); ctx.stroke(); ctx.fillRect(0,-6,7,4); }
    else if (type==='gather'){ ctx.beginPath(); ctx.arc(0,0,4,0,TWO_PI); ctx.fill(); }
    else if (type==='build'){ ctx.fillRect(-5,1,10,4); ctx.fillRect(1,-5,4,10); }
    else if (type==='craft'){ ctx.fillRect(-5,-3,10,6); ctx.strokeRect(-6,-4,12,8); }
    else if (type==='combat'){ ctx.beginPath(); ctx.moveTo(-5,5); ctx.lineTo(5,-5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(2,-6); ctx.lineTo(6,-2); ctx.stroke(); }
    ctx.restore();
  }
  drawEnemy(ctx,x,y,walk=0,boss=false,entity=null){
    if(this.assetsReady){
      const attacking = entity && entity.attackCd > (boss ? .6 : .45);
      const id = boss ? (attacking?'boss_attack':(entity?.facing==='left'||entity?.facing==='right'?'boss_side':'boss_down')) : (attacking?'goblin_attack':(entity?.facing==='left'||entity?.facing==='right'?'goblin_side':'goblin_down'));
      // Goblin/boss side sprites face RIGHT by default; flip when facing LEFT.
      const flip = entity?.facing==='left';
      this.shadow(ctx,x,y+9,boss?26:16,boss?9:6,.36);
      if(this.drawCharacterAsset(ctx,id,x,y+11,{anchor:'ground',flip,h:boss?BOSS_DRAW_HEIGHT:GOBLIN_DRAW_HEIGHT,cropBottom:2})) return;
    }
    this.shadow(ctx,x,y+7,boss?26:16,boss?9:6,.36);
    ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(entity?.facing==='left'||entity?.facing==='right'){ if(entity?.facing==='left') ctx.scale(-1,1); } const s=boss?1.45:1; const bob=Math.sin(walk*6)*1.3;
    ctx.fillStyle=boss?'#8a3d4d':'#5aaa52';
    ctx.beginPath(); ctx.moveTo(-10*s,-24*s+bob); ctx.lineTo(-24*s,-30*s+bob); ctx.lineTo(-11*s,-13*s+bob); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10*s,-24*s+bob); ctx.lineTo(24*s,-30*s+bob); ctx.lineTo(11*s,-13*s+bob); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0,-20*s+bob,11*s,12*s,0,0,TWO_PI); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.stroke();
    this.px(ctx,-9*s,-8*s+bob,18*s,16*s,boss?'#6c2735':'#7a3b31'); this.outlineRect(ctx,-9*s,-8*s+bob,18*s,16*s);
    ctx.fillStyle=COLORS.yellow; ctx.fillRect(-5*s,-21*s+bob,3*s,3*s); ctx.fillRect(4*s,-21*s+bob,3*s,3*s);
    ctx.fillStyle=COLORS.ink; ctx.fillRect(-4*s,-14*s+bob,8*s,2*s);
    this.px(ctx,-6*s,8*s+bob,4*s,9*s,'#3e3232'); this.px(ctx,3*s,8*s-bob,4*s,9*s,'#3e3232');
    if (boss){ this.px(ctx,-12*s,-38*s,4*s,12*s,COLORS.yellow); this.px(ctx,8*s,-38*s,4*s,12*s,COLORS.yellow); }
    ctx.restore();
  }
  drawTree(ctx,x,y,variant=0){
    this.shadow(ctx,x,y+4,24,9,.34);
    ctx.save(); ctx.translate(Math.round(x),Math.round(y));
    ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2;
    this.px(ctx,-5,-36,11,38,COLORS.woodDark); this.px(ctx,-2,-36,6,38,COLORS.wood);
    ctx.strokeRect(-5,-36,11,38);
    ctx.strokeStyle='#5b2c1c'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-5,-25); ctx.lineTo(5,-30); ctx.moveTo(-5,-10); ctx.lineTo(6,-16); ctx.stroke();
    const leaves = [[-30,-42,-13,-22],[-18,-58,-2,-29],[0,-65,13,-32],[18,-56,2,-27],[31,-41,11,-20],[18,-27,0,-18],[-19,-26,-3,-18]];
    for (const [a,b,c,d] of leaves){
      ctx.fillStyle=variant? '#5b9747': COLORS.leaf; ctx.beginPath(); ctx.moveTo(0,-35); ctx.lineTo(a,b); ctx.lineTo(c,d); ctx.closePath(); ctx.fill(); ctx.strokeStyle=COLORS.leafDark; ctx.lineWidth=2; ctx.stroke();
      ctx.strokeStyle=COLORS.leafLight; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,-35); ctx.lineTo(a*.75,b+4); ctx.stroke();
    }
    ctx.fillStyle='#4c2b22'; ctx.beginPath(); ctx.ellipse(-4,-35,5,6,0,0,TWO_PI); ctx.fill(); ctx.beginPath(); ctx.ellipse(5,-35,5,6,0,0,TWO_PI); ctx.fill();
    ctx.restore();
  }
  drawRock(ctx,x,y,iron=false){
    this.shadow(ctx,x,y+5,20,7,.32); ctx.save(); ctx.translate(Math.round(x),Math.round(y));
    ctx.fillStyle=iron?'#66777b':COLORS.stoneDark; ctx.beginPath(); ctx.ellipse(0,0,20,12,0,0,TWO_PI); ctx.fill();
    ctx.fillStyle=iron?'#8ca1a2':COLORS.stone; ctx.beginPath(); ctx.moveTo(-19,2); ctx.lineTo(-10,-12); ctx.lineTo(5,-17); ctx.lineTo(20,-5); ctx.lineTo(17,9); ctx.lineTo(-12,13); ctx.closePath(); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle=iron?'#c0dddd':COLORS.stoneLight; ctx.beginPath(); ctx.moveTo(-10,-12); ctx.lineTo(1,-20); ctx.lineTo(5,-17); ctx.lineTo(-3,-4); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  drawBush(ctx,x,y){
    this.shadow(ctx,x,y+4,16,6,.26); ctx.save(); ctx.translate(Math.round(x),Math.round(y));
    const blobs=[[-8,-2,10,8],[3,-6,12,11],[11,0,8,8],[-14,2,7,6]];
    for(const [bx,by,rx,ry] of blobs){ ctx.fillStyle='#407b36'; ctx.beginPath(); ctx.ellipse(bx,by,rx,ry,0,0,TWO_PI); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=1.5; ctx.stroke(); ctx.fillStyle='#5daa4e'; ctx.beginPath(); ctx.ellipse(bx-2,by-2,Math.max(2,rx-4),Math.max(2,ry-4),0,0,TWO_PI); ctx.fill(); }
    ctx.fillStyle='#d84165'; for(const p of [[-3,-7],[8,1],[-14,1]]){ ctx.beginPath(); ctx.ellipse(p[0],p[1],2,2,0,0,TWO_PI); ctx.fill(); }
    ctx.restore();
  }
  drawResource(ctx,node){
    if(this.assetsReady){
      const choices=RESOURCE_ASSET_KEYS[node.type];
      if(choices){ const id=Array.isArray(choices)?choices[(node.variant||0)%choices.length]:choices; if(this.drawAsset(ctx,id,node.sx,node.sy+10,{anchor:'ground'})) return; }
    }
    if(node.type==='tree') this.drawTree(ctx,node.sx,node.sy,node.variant); else if(node.type==='rock'||node.type==='iron') this.drawRock(ctx,node.sx,node.sy,node.type==='iron'); else this.drawBush(ctx,node.sx,node.sy);
  }
  drawItem(ctx,item){
    const bob = Math.sin(item.t*4 + item.seed)*3;
    this.shadow(ctx,item.sx,item.sy+8,11,4,.22); ctx.save(); ctx.translate(Math.round(item.sx),Math.round(item.sy+bob));
    const iconKey=ICON_ASSET_KEYS[item.type];
    if(iconKey && this.sprites[iconKey]) this.drawAsset(ctx,iconKey,0,0,{anchor:'center',scale:.86}); else this.drawIconShape(ctx,item.type,0,0,0.84);
    if (item.qty > 1){ ctx.font='bold 11px monospace'; ctx.fillStyle='white'; ctx.strokeStyle='black'; ctx.lineWidth=3; ctx.strokeText(String(item.qty),9,9); ctx.fillText(String(item.qty),9,9); }
    ctx.restore();
  }
  drawIconShape(ctx,type,x,y,s=1){
    const iconKey=ICON_ASSET_KEYS[type];
    if(iconKey && this.drawAsset(ctx,iconKey,x,y,{anchor:'center',scale:s})) return;
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ctx.lineWidth=2; ctx.strokeStyle=COLORS.ink;
    const circ=(c,rx=8,ry=8)=>{ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,TWO_PI); ctx.fill(); ctx.stroke();};
    if (type==='wood'){ ctx.fillStyle=COLORS.wood; ctx.fillRect(-10,-4,20,8); ctx.strokeRect(-10,-4,20,8); ctx.strokeStyle=COLORS.woodLight; ctx.beginPath(); ctx.moveTo(-7,0); ctx.lineTo(8,0); ctx.stroke(); }
    else if (type==='stone'){ ctx.fillStyle=COLORS.stone; ctx.beginPath(); ctx.moveTo(-9,5); ctx.lineTo(-4,-8); ctx.lineTo(8,-7); ctx.lineTo(11,5); ctx.lineTo(1,10); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (type==='fiber'){ ctx.strokeStyle=COLORS.grassLight; ctx.lineWidth=3; for(let i=-5;i<=5;i+=3){ ctx.beginPath(); ctx.moveTo(i,9); ctx.lineTo(i-2,-8); ctx.stroke(); } }
    else if (type==='berry'){ ctx.fillStyle='#ce315a'; for(const p of [[-3,-2],[3,-1],[0,5]]){ ctx.beginPath(); ctx.ellipse(p[0],p[1],4,4,0,0,TWO_PI); ctx.fill(); ctx.stroke(); } }
    else if (type==='banana'){ ctx.strokeStyle=COLORS.ink; ctx.fillStyle='#f2d45e'; ctx.beginPath(); ctx.ellipse(0,0,11,5,-.2,0,TWO_PI); ctx.fill(); ctx.stroke(); ctx.fillStyle='rgba(0,0,0,0)'; }
    else if (type==='iron'){ ctx.fillStyle='#8ca1a2'; ctx.beginPath(); ctx.moveTo(-10,5); ctx.lineTo(-4,-8); ctx.lineTo(8,-7); ctx.lineTo(11,6); ctx.lineTo(0,11); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#c0dddd'; ctx.fillRect(-1,-5,6,4); }
    else if (type==='core'){ circ('#41d7ff',9,9); ctx.fillStyle='#d4ffff'; ctx.beginPath(); ctx.ellipse(0,0,4,4,0,0,TWO_PI); ctx.fill(); }
    else if (type==='monkey_munch'){ ctx.fillStyle='#d981ff'; ctx.fillRect(-5,-10,10,18); ctx.strokeRect(-5,-10,10,18); ctx.fillStyle='#d9c2ff'; ctx.fillRect(-6,-12,12,4); ctx.strokeRect(-6,-12,12,4); }
    else if (type==='axe'){ ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-7,10); ctx.lineTo(7,-8); ctx.stroke(); ctx.fillStyle='#9fb3bd'; ctx.beginPath(); ctx.moveTo(2,-11); ctx.lineTo(13,-9); ctx.lineTo(8,0); ctx.lineTo(-1,-1); ctx.closePath(); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.stroke(); }
    else if (type==='pickaxe'){ ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-6,11); ctx.lineTo(5,-9); ctx.stroke(); ctx.strokeStyle='#9fb3bd'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-9,-7); ctx.lineTo(13,-10); ctx.stroke(); }
    else if (type==='sword' || type==='metal_sword'){ ctx.strokeStyle= type==='metal_sword' ? '#dbe8e8' : '#c8d5c8'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-8,10); ctx.lineTo(9,-10); ctx.stroke(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=1.5; ctx.stroke(); ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-11,12); ctx.lineTo(-5,6); ctx.stroke(); ctx.strokeStyle=COLORS.yellow; ctx.beginPath(); ctx.moveTo(-8,4); ctx.lineTo(-1,10); ctx.stroke(); }
    else if (type==='hammer'){ ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-6,11); ctx.lineTo(6,-5); ctx.stroke(); ctx.fillStyle=COLORS.stone; ctx.fillRect(2,-12,16,8); ctx.strokeStyle=COLORS.ink; ctx.strokeRect(2,-12,16,8); }
    else if (type==='heart'){ ctx.fillStyle=COLORS.red; ctx.beginPath(); ctx.moveTo(0,10); ctx.bezierCurveTo(-15,-1,-9,-11,0,-5); ctx.bezierCurveTo(9,-11,15,-1,0,10); ctx.fill(); ctx.stroke(); }
    else if (type==='hunger'){ circ('#f0b65a',9,11); ctx.fillStyle='#67a54b'; ctx.fillRect(-4,-13,8,4); }
    else if (type==='stamina'){ ctx.fillStyle='#37e052'; ctx.beginPath(); ctx.moveTo(3,-14); ctx.lineTo(-8,2); ctx.lineTo(0,2); ctx.lineTo(-4,14); ctx.lineTo(10,-5); ctx.lineTo(2,-5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (BUILD_RECIPES[type]) { this.drawBuildingIcon(ctx,type); }
    else { circ('#ddd',8,8); }
    ctx.restore();
  }
  drawBuildingIcon(ctx,type){
    if (type==='chest'){ ctx.fillStyle=COLORS.wood; ctx.fillRect(-12,-4,24,12); ctx.fillStyle=COLORS.woodLight; ctx.fillRect(-12,-10,24,8); ctx.strokeStyle=COLORS.ink; ctx.strokeRect(-12,-10,24,18); ctx.fillStyle=COLORS.yellow; ctx.fillRect(-2,-1,4,4); }
    else if (type==='campfire'){ ctx.fillStyle=COLORS.stone; ctx.beginPath(); ctx.ellipse(0,8,13,5,0,0,TWO_PI); ctx.fill(); ctx.stroke(); ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-8,8); ctx.lineTo(8,0); ctx.moveTo(-8,0); ctx.lineTo(8,8); ctx.stroke(); ctx.fillStyle=COLORS.yellow; ctx.beginPath(); ctx.ellipse(0,-5,6,10,0,0,TWO_PI); ctx.fill(); ctx.fillStyle=COLORS.orange; ctx.beginPath(); ctx.ellipse(0,-2,3,6,0,0,TWO_PI); ctx.fill(); }
    else if (type==='workbench'){ ctx.fillStyle=COLORS.wood; ctx.fillRect(-14,0,28,8); ctx.strokeStyle=COLORS.ink; ctx.strokeRect(-14,0,28,8); ctx.fillStyle=COLORS.stone; ctx.fillRect(-9,-8,10,8); ctx.fillStyle='#7c5a42'; ctx.fillRect(4,-7,9,7); }
    else if (type==='wall'){ ctx.fillStyle='#b48c3e'; ctx.fillRect(-13,-5,26,16); ctx.fillStyle='#d8b65c'; ctx.fillRect(-13,-9,26,6); ctx.strokeStyle=COLORS.ink; ctx.strokeRect(-13,-9,26,20); }
    else if (type==='raft'){ ctx.fillStyle=COLORS.wood; ctx.fillRect(-14,4,28,7); ctx.fillStyle=COLORS.woodLight; ctx.fillRect(-13,-2,26,7); ctx.strokeStyle=COLORS.ink; ctx.strokeRect(-14,-2,28,13); ctx.fillStyle='#f1e2a8'; ctx.beginPath(); ctx.moveTo(0,-15); ctx.lineTo(12,-4); ctx.lineTo(0,2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else if (type==='bed'){ ctx.fillStyle='#79b35b'; ctx.fillRect(-13,-4,26,12); ctx.fillStyle=COLORS.woodDark; ctx.fillRect(-13,-8,6,18); ctx.fillRect(7,-8,6,18); ctx.strokeStyle=COLORS.ink; ctx.strokeRect(-13,-8,26,18); }
    else if (type==='torch'){ ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(0,14); ctx.lineTo(0,-4); ctx.stroke(); ctx.fillStyle=COLORS.yellow; ctx.beginPath(); ctx.ellipse(0,-10,5,8,0,0,TWO_PI); ctx.fill(); ctx.fillStyle=COLORS.orange; ctx.beginPath(); ctx.ellipse(0,-7,3,5,0,0,TWO_PI); ctx.fill(); }
    else if (type==='forge'){ ctx.fillStyle=COLORS.stoneDark; ctx.fillRect(-12,-2,24,14); ctx.fillStyle=COLORS.stone; ctx.beginPath(); ctx.ellipse(0,-2,13,10,0,0,TWO_PI); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.stroke(); ctx.fillStyle=COLORS.orange; ctx.beginPath(); ctx.ellipse(0,3,6,6,0,0,TWO_PI); ctx.fill(); }
  }
  drawBuilding(ctx,b){
    const x=b.sx, y=b.sy, type=b.type;
    const assetKey=BUILDING_ASSET_KEYS[type];
    if(assetKey && this.assetsReady){
      this.shadow(ctx,x,y+9,type==='galleon'?56:(type==='vault'?42:26),type==='galleon'?12:8,.26);
      const alpha=b.locked ? .72 : 1;
      if(this.drawAsset(ctx,assetKey,x,y+10,{anchor:'ground',alpha})){
        if((type==='workbench'||type==='forge') && b.queue && b.queue.length){ const job=b.queue[0]; ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(x-24,y-62,48,8); ctx.fillStyle=COLORS.yellow; ctx.fillRect(x-24,y-62,48*job.progress/job.need,8); this.outlineRect(ctx,x-24,y-62,48,8); }
        if(type==='wall' && b.hp && b.hp < (BUILD_RECIPES.wall.hp||90)){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x-24,y-48,48,5);ctx.fillStyle=COLORS.red;ctx.fillRect(x-24,y-48,48*(b.hp/(BUILD_RECIPES.wall.hp||90)),5);}
        return;
      }
    }
    if (type==='chest'){
      this.shadow(ctx,x,y+5,20,7,.25); ctx.save(); ctx.translate(x,y); this.px(ctx,-22,-15,44,20,COLORS.wood); this.px(ctx,-22,-24,44,15,COLORS.woodLight); this.outlineRect(ctx,-22,-24,44,29); this.px(ctx,-4,-7,8,6,COLORS.yellow); ctx.strokeStyle=COLORS.woodDark; ctx.beginPath(); ctx.moveTo(-19,-9); ctx.lineTo(19,-9); ctx.stroke(); ctx.restore();
    } else if (type==='workbench'){
      this.shadow(ctx,x,y+6,30,8,.25); ctx.save(); ctx.translate(x,y); this.px(ctx,-33,-18,66,16,COLORS.wood); this.outlineRect(ctx,-33,-18,66,16); this.px(ctx,-24,-32,20,14,COLORS.stone); this.px(ctx,12,-31,16,13,'#6d5b52'); this.px(ctx,-28,-2,8,14,COLORS.woodDark); this.px(ctx,20,-2,8,14,COLORS.woodDark); if(b.queue && b.queue.length){ const job=b.queue[0]; ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(-24,-44,48,8); ctx.fillStyle=COLORS.yellow; ctx.fillRect(-24,-44,48*job.progress/job.need,8); this.outlineRect(ctx,-24,-44,48,8); } ctx.restore();
    } else if (type==='campfire'){
      this.shadow(ctx,x,y+5,24,7,.25); ctx.save(); ctx.translate(x,y); ctx.fillStyle=COLORS.stone; ctx.beginPath(); ctx.ellipse(0,0,22,7,0,0,TWO_PI); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.stroke(); ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-15,3); ctx.lineTo(15,-10); ctx.moveTo(-15,-10); ctx.lineTo(15,3); ctx.stroke(); const f=Math.sin(Date.now()/120)*3; ctx.fillStyle=COLORS.yellow; ctx.beginPath(); ctx.ellipse(0,-19,9,16+f,0,0,TWO_PI); ctx.fill(); ctx.fillStyle=COLORS.orange; ctx.beginPath(); ctx.ellipse(0,-15,5,10,0,0,TWO_PI); ctx.fill(); ctx.restore();
    } else if (type==='bed'){
      this.shadow(ctx,x,y+4,30,6,.2); ctx.save(); ctx.translate(x,y); this.px(ctx,-30,-16,60,20,'#79b35b'); this.px(ctx,-30,-21,60,8,'#a37d49'); this.px(ctx,-30,-21,12,25,COLORS.woodDark); this.px(ctx,18,-21,12,25,COLORS.woodDark); this.outlineRect(ctx,-30,-21,60,25); ctx.restore();
    } else if (type==='wall'){
      this.shadow(ctx,x,y+7,32,7,.24); ctx.save(); ctx.translate(x,y); this.px(ctx,-32,-19,64,32,'#aa8840'); this.px(ctx,-32,-30,64,18,'#d2ad56'); for(let xx=-25;xx<=25;xx+=16){ this.px(ctx,xx,-35,10,48,'#ba9347'); this.outlineRect(ctx,xx,-35,10,48); } this.outlineRect(ctx,-32,-30,64,43); if(b.hp && b.hp < (BUILD_RECIPES.wall.hp||90)){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(-24,-45,48,5);ctx.fillStyle=COLORS.red;ctx.fillRect(-24,-45,48*(b.hp/(BUILD_RECIPES.wall.hp||90)),5);} ctx.restore();
    } else if (type==='torch'){
      ctx.save(); ctx.translate(x,y); ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-34); ctx.stroke(); const f=Math.sin(Date.now()/90)*2; ctx.fillStyle=COLORS.yellow; ctx.beginPath(); ctx.ellipse(0,-43,8,13+f,0,0,TWO_PI); ctx.fill(); ctx.fillStyle=COLORS.orange; ctx.beginPath(); ctx.ellipse(0,-38,4,8,0,0,TWO_PI); ctx.fill(); ctx.restore();
    } else if (type==='forge'){
      this.shadow(ctx,x,y+6,28,8,.28); ctx.save(); ctx.translate(x,y); this.px(ctx,-25,-18,50,25,COLORS.stoneDark); ctx.fillStyle=COLORS.stone; ctx.beginPath(); ctx.ellipse(0,-18,25,18,0,0,TWO_PI); ctx.fill(); this.px(ctx,-20,-18,40,20,COLORS.stone); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.strokeRect(-25,-34,50,41); ctx.fillStyle='#302b29'; ctx.beginPath(); ctx.ellipse(0,-8,15,12,0,0,TWO_PI); ctx.fill(); ctx.fillStyle=COLORS.orange; ctx.beginPath(); ctx.ellipse(0,-4,11,8,0,0,TWO_PI); ctx.fill(); if(b.queue && b.queue.length){ const job=b.queue[0]; ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(-24,-52,48,8); ctx.fillStyle=COLORS.yellow; ctx.fillRect(-24,-52,48*job.progress/job.need,8); this.outlineRect(ctx,-24,-52,48,8); } ctx.restore();
    } else if (type==='raft'){
      this.shadow(ctx,x,y+8,45,9,.26); ctx.save(); ctx.translate(x,y); for(let xx=-42; xx<=34; xx+=14){ this.px(ctx,xx,-18,11,40, choice(()=>0,[COLORS.wood,COLORS.woodLight])); this.outlineRect(ctx,xx,-18,11,40); } ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-47,-14); ctx.lineTo(47,-14); ctx.moveTo(-47,19); ctx.lineTo(47,19); ctx.stroke(); this.px(ctx,4,-40,5,30,COLORS.woodDark); ctx.fillStyle='#f1e2a8'; ctx.beginPath(); ctx.moveTo(9,-40); ctx.lineTo(36,-22); ctx.lineTo(9,-8); ctx.closePath(); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.stroke(); ctx.restore();
    } else if (type==='vault'){
      this.shadow(ctx,x,y+8,48,12,.3); ctx.save(); ctx.translate(x,y); this.px(ctx,-43,-23,86,44,COLORS.stoneDark); this.px(ctx,-33,-50,66,50,COLORS.stone); ctx.fillStyle=COLORS.stoneLight; ctx.beginPath(); ctx.moveTo(-41,-50); ctx.lineTo(0,-78); ctx.lineTo(41,-50); ctx.closePath(); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=3; ctx.stroke(); this.outlineRect(ctx,-43,-50,86,71); this.px(ctx,-13,-23,26,44,'#242327'); this.outlineRect(ctx,-13,-23,26,44); ctx.fillStyle=COLORS.cyan; ctx.beginPath(); ctx.ellipse(0,-34,9,9,0,0,TWO_PI); ctx.fill(); ctx.restore();
    } else if (type==='galleon'){
      this.shadow(ctx,x,y+8,62,12,.26); ctx.save(); ctx.translate(x,y); this.px(ctx,-56,-4,112,24,COLORS.woodDark); ctx.fillStyle=COLORS.wood; ctx.beginPath(); ctx.moveTo(-60,-5); ctx.lineTo(-38,28); ctx.lineTo(38,28); ctx.lineTo(60,-5); ctx.closePath(); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=3; ctx.stroke(); this.px(ctx,-3,-56,6,55,COLORS.woodDark); ctx.fillStyle='#e8dca6'; ctx.beginPath(); ctx.moveTo(3,-55); ctx.lineTo(43,-28); ctx.lineTo(3,-12); ctx.closePath(); ctx.fill(); ctx.stroke(); this.px(ctx,-40,-16,25,12,COLORS.woodLight); this.px(ctx,16,-16,25,12,COLORS.woodLight); ctx.restore();
    } else if (type==='cage'){
      this.shadow(ctx,x,y+4,25,7,.2); ctx.save(); ctx.translate(x,y); ctx.strokeStyle=COLORS.woodDark; ctx.lineWidth=4; for(let xx=-20;xx<=20;xx+=8){ ctx.beginPath(); ctx.moveTo(xx,-34); ctx.lineTo(xx,6); ctx.stroke(); } ctx.strokeStyle=COLORS.wood; ctx.lineWidth=5; for(let yy of [-32,-16,4]){ ctx.beginPath(); ctx.moveTo(-24,yy); ctx.lineTo(24,yy); ctx.stroke(); } this.outlineRect(ctx,-24,-34,48,40); ctx.restore();
    } else if (type==='totem'){
      this.shadow(ctx,x,y+3,16,5,.25); ctx.save(); ctx.translate(x,y); this.px(ctx,-8,-55,16,58,COLORS.wood); this.outlineRect(ctx,-8,-55,16,58); this.px(ctx,-14,-45,28,10,COLORS.orange); this.px(ctx,-12,-26,24,10,'#5aa65e'); this.px(ctx,-5,-51,3,3,COLORS.ink); this.px(ctx,4,-51,3,3,COLORS.ink); ctx.restore();
    } else if (type==='portal'){
      ctx.save(); ctx.translate(x,y); ctx.fillStyle='rgba(98,211,255,.35)'; ctx.beginPath(); ctx.ellipse(0,-15,25,30,0,0,TWO_PI); ctx.fill(); ctx.fillStyle='rgba(98,211,255,.8)'; ctx.beginPath(); ctx.ellipse(0,-15,16,22,0,0,TWO_PI); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(0,-15,8,13,0,0,TWO_PI); ctx.fill(); ctx.restore();
    }
  }
  drawBlueprint(ctx,bp){
    const bpAsset=BLUEPRINT_ASSET_KEYS[bp.type];
    if(bpAsset && this.assetsReady){
      ctx.save(); ctx.globalAlpha=.50; this.drawAsset(ctx,bpAsset,bp.sx,bp.sy+10,{anchor:'ground'}); ctx.globalAlpha=1;
      ctx.strokeStyle=COLORS.cyan; ctx.lineWidth=2; ctx.setLineDash([4,4]); ctx.strokeRect(bp.sx-28,bp.sy-50,56,56); ctx.setLineDash([]);
      if(bp.ready){ ctx.fillStyle='rgba(255,216,90,.24)'; ctx.fillRect(bp.sx-28,bp.sy-50,56,56); }
      ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(bp.sx-26,bp.sy+12,52,7); ctx.fillStyle=COLORS.yellow; ctx.fillRect(bp.sx-26,bp.sy+12,52*(bp.progress/(bp.needProgress||1)),7); this.outlineRect(ctx,bp.sx-26,bp.sy+12,52,7); ctx.restore(); return;
    }
    ctx.save(); ctx.translate(bp.sx,bp.sy); ctx.globalAlpha=.72; ctx.strokeStyle=COLORS.cyan; ctx.lineWidth=2; ctx.setLineDash([4,4]); ctx.strokeRect(-24,-40,48,48); ctx.beginPath(); ctx.moveTo(-20,4); ctx.lineTo(20,-36); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1;
    if (bp.ready){ ctx.fillStyle='rgba(255,216,90,.35)'; ctx.fillRect(-24,-40,48,48); }
    ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(-26,12,52,7); ctx.fillStyle=COLORS.yellow; ctx.fillRect(-26,12,52*(bp.progress/(bp.needProgress||1)),7); this.outlineRect(ctx,-26,12,52,7); ctx.restore();
  }
  drawHealthBar(ctx,x,y,w,pct,color=COLORS.red){ ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(x-w/2,y,w,5); ctx.fillStyle=color; ctx.fillRect(x-w/2,y,w*clamp(pct,0,1),5); ctx.strokeStyle=COLORS.ink; ctx.strokeRect(x-w/2,y,w,5); }
}
