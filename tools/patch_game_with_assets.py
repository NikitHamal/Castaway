from __future__ import annotations
import json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
main=ROOT/'src'/'main.js'
js=main.read_text()
manifest=json.load(open(ROOT/'assets'/'generated'/'atlas_manifest.json'))
curated={k:v['path'] for k,v in manifest['curated'].items()}
sheets=manifest['sheet_paths']

def js_obj(o):
    return json.dumps(o, indent=2)

constants = f'''
const GENERATED_ASSETS = {js_obj(curated)};
const GENERATED_SHEETS = {js_obj(sheets)};
const SHEET_ORDER = ['characters','terrain','world_buildables','items_icons','biomes_dungeon','poi_interiors','ui_kit','effects'];
const SHEET_TITLES = {{
  characters:'Characters & Combat', terrain:'Island Terrain', world_buildables:'World Buildables', items_icons:'Items / Tools / HUD Icons',
  biomes_dungeon:'Biomes & Dungeon Tiles', poi_interiors:'POI / Interior / Exploration Props', ui_kit:'UI Kit', effects:'FX / Markers / Blueprint Ghosts'
}};
const TILE_ASSET_KEYS = {{
  grass:'tile_grass', grass2:'tile_grass2', sand:'tile_sand', shallow:'tile_shallow', water:'tile_water', path:'tile_path',
  swamp:'tile_swamp', ash:'tile_ash', lava:'tile_lava', floor:'tile_floor', stone:'tile_stone', walltile:'tile_walltile'
}};
const ICON_ASSET_KEYS = {{
  wood:'icon_wood', stone:'icon_stone', fiber:'icon_fiber', berry:'icon_berry', banana:'icon_banana', iron:'icon_iron', core:'icon_core', monkey_munch:'icon_monkey_munch',
  axe:'icon_axe', pickaxe:'icon_pickaxe', sword:'icon_sword', metal_sword:'icon_metal_sword', hammer:'icon_hammer', cooked_meal:'icon_cooked_meal',
  chest:'icon_chest', campfire:'icon_campfire', workbench:'icon_workbench', bed:'icon_bed', wall:'icon_wall', torch:'icon_torch', forge:'icon_workbench', raft:'icon_raft',
  heart:'icon_heart', hunger:'icon_hunger', stamina:'icon_stamina', bag:'icon_bag', build:'icon_build', monkey:'icon_monkey', attack:'icon_attack', interact:'icon_interact', save:'icon_save', quest:'icon_quest'
}};
const RESOURCE_ASSET_KEYS = {{ tree:['prop_palm_0','prop_palm_1','prop_palm_2','prop_palm_3'], rock:['prop_rock_0','prop_rock_1'], iron:['prop_iron_0','prop_iron_1'], bush:['prop_bush_red','prop_bush_purple'] }};
const BUILDING_ASSET_KEYS = {{
  chest:'prop_chest_closed', workbench:'prop_workbench', campfire:'prop_campfire_lit', bed:'prop_bed', wall:'prop_wall', torch:'prop_torch', forge:'prop_forge', raft:'prop_raft_sail',
  vault:'poi_vault_round', galleon:'poi_galleon_hull', cage:'prop_cage', totem:'prop_totem',
  tent:'prop_tent', barrel:'prop_barrel', crates:'prop_crates', sack:'prop_sack', table:'prop_table',
  ship_wreck0:'prop_wreck_0', ship_wreck1:'prop_wreck_1', ship_wreck2:'prop_wreck_2', ship_wreck3:'prop_wreck_3',
  dock:'poi_dock', signal_fire:'poi_signal_fire', treasure_pile:'poi_treasure_pile', dig_spot:'poi_dig_spot', treasure_chest:'poi_treasure_chest',
  shelf:'poi_shelf', cupboard:'poi_cupboard', long_table:'poi_long_table', bookshelf:'poi_bookshelf', rug:'poi_rug', pottery:'poi_pottery', cauldron:'poi_cauldron', chopping_block:'poi_chopping_block', loom:'poi_loom', anvil:'poi_anvil',
  tilled_soil:'poi_tilled_soil', seedlings:'poi_seedlings', crops:'poi_crops', bucket:'poi_bucket', compost:'poi_compost', scarecrow:'poi_scarecrow',
  spike_trap:'poi_spike_trap', snare:'poi_snare', barricade:'poi_barricade', brazier:'poi_brazier', drum:'poi_drum', lantern_post:'poi_lantern_post', firewood:'poi_firewood', ore_basket:'poi_ore_basket', drying_rack:'poi_drying_rack', fish_rack:'poi_fish_rack'
}};
const BLUEPRINT_ASSET_KEYS = {{ chest:'prop_chest_closed', campfire:'prop_campfire_lit', workbench:'prop_workbench', bed:'prop_bed', wall:'prop_wall', torch:'prop_torch', forge:'prop_forge', raft:'prop_raft_sail' }};
'''
js=js.replace("const TWO_PI = Math.PI * 2;\n", "const TWO_PI = Math.PI * 2;\n" + constants + "\n")

# Replace Art constructor and add loader methods after makeCanvas.
js=js.replace("""class Art {
  constructor(){
    this.tileCanvases = {};
    this.makeTiles();
  }
  makeCanvas(w,h){ const c = document.createElement('canvas'); c.width=w; c.height=h; const ctx=c.getContext('2d'); ctx.imageSmoothingEnabled=false; return [c,ctx]; }
""", """class Art {
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
  async loadAssets(){
    if(this.assetsReady) return true;
    const loads = [];
    for(const [key,path] of Object.entries(GENERATED_ASSETS)){
      loads.push(this.loadImage(path).then(img => { this.sprites[key]=img; }).catch(err => { this.assetErrors.push(err.message); }));
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
    const w=Math.round(opts.w || img.width*scale), h=Math.round(opts.h || img.height*scale);
    const anchor=opts.anchor || 'center';
    let dx=Math.round(x-w/2), dy=Math.round(y-h/2);
    if(anchor==='ground') dy=Math.round(y-h);
    else if(anchor==='topleft'){ dx=Math.round(x); dy=Math.round(y); }
    ctx.save(); ctx.globalAlpha*=alpha;
    if(opts.tint){ ctx.globalCompositeOperation='source-over'; }
    if(opts.flip){ ctx.translate(dx+w,dy); ctx.scale(-1,1); ctx.drawImage(img,0,0,w,h); }
    else ctx.drawImage(img,dx,dy,w,h);
    ctx.restore();
    return true;
  }
  drawTileAsset(ctx,id,x,y){ const img=this.sprites[id]; if(!img) return false; ctx.drawImage(img,Math.round(x),Math.round(y),TILE,TILE); return true; }
""")

# Modify drawTile method.
js=js.replace("""  drawTile(ctx,type,x,y,tx,ty,time){
    if (type==='water' || type==='shallow' || type==='lava') this.drawTilePattern(ctx,type,x,y,tx,ty,time);
    else ctx.drawImage(this.tileCanvases[type] || this.tileCanvases.grass, Math.round(x), Math.round(y));
  }
""", """  drawTile(ctx,type,x,y,tx,ty,time){
    const key=TILE_ASSET_KEYS[type];
    if(key && this.drawTileAsset(ctx,key,x,y)) return;
    if (type==='water' || type==='shallow' || type==='lava') this.drawTilePattern(ctx,type,x,y,tx,ty,time);
    else ctx.drawImage(this.tileCanvases[type] || this.tileCanvases.grass, Math.round(x), Math.round(y));
  }
""")

# Insert asset branch at top of drawPlayer.
js=js.replace("""  drawPlayer(ctx,x,y,dir='down',walk=0,charge=0){
    this.shadow(ctx,x,y+3,16,6,.28);
""", """  drawPlayer(ctx,x,y,dir='down',walk=0,charge=0,tool='hand',facing='right',attackCd=0){
    if(this.assetsReady){
      let id = dir==='up' ? 'player_up' : (dir==='side' ? `player_walk_${Math.floor(walk*8)%3}` : 'player_down');
      if(attackCd>0){
        if(tool==='axe') id='player_axe'; else if(tool==='pickaxe') id='player_pickaxe'; else if(tool==='hammer') id='player_hammer'; else if(tool==='sword'||tool==='metal_sword') id='player_sword';
      }
      const flip = dir==='side' && facing==='left';
      this.shadow(ctx,x,y+4,16,5,.22);
      if(this.drawAsset(ctx,id,x,y+10,{anchor:'ground',flip})){
        if(attackCd>0 && (tool==='sword'||tool==='metal_sword')) this.drawAsset(ctx,'fx_slash_0',x+(flip?-20:20),y-20,{anchor:'center',flip,alpha:.82});
        if(charge>0){ ctx.save(); ctx.strokeStyle=`rgba(255,216,90,${.25+charge*.5})`; ctx.lineWidth=2+charge*4; ctx.beginPath(); ctx.arc(x,y-14,18+charge*8,0,TWO_PI); ctx.stroke(); ctx.restore(); }
        return;
      }
    }
    this.shadow(ctx,x,y+3,16,6,.28);
""")

# Insert asset branch at top of drawMonkey.
js=js.replace("""  drawMonkey(ctx,x,y,walk=0,order=null,selected=false){
    this.shadow(ctx,x,y+2,13,5,.25);
""", """  drawMonkey(ctx,x,y,walk=0,order=null,selected=false,entity=null){
    if(this.assetsReady){
      let id = entity?.carry ? 'monkey_carry' : (order?.type==='combat' ? 'monkey_attack' : `monkey_walk_${Math.floor(walk*7)%3}`);
      if(!entity || (!entity.carry && !order && Math.floor(walk*7)%3===0)) id='monkey_down';
      const flip = entity?.facing==='left';
      this.shadow(ctx,x,y+3,12,4,.22);
      if(this.drawAsset(ctx,id,x,y+8,{anchor:'ground',flip})){
        if(order){ ctx.save(); ctx.fillStyle='rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(x+15,y-32,8,0,TWO_PI); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.stroke(); this.drawMiniTaskIcon(ctx,x+15,y-32,order.type); ctx.restore(); }
        if(selected){ ctx.save(); ctx.strokeStyle=COLORS.yellow; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(x,y-9,22,0,TWO_PI); ctx.stroke(); ctx.restore(); }
        return;
      }
    }
    this.shadow(ctx,x,y+2,13,5,.25);
""")

# Insert asset branch in drawEnemy.
js=js.replace("""  drawEnemy(ctx,x,y,walk=0,boss=false){
    this.shadow(ctx,x,y+3,boss?24:15,boss?8:5,.32);
""", """  drawEnemy(ctx,x,y,walk=0,boss=false,entity=null){
    if(this.assetsReady){
      const attacking = entity && entity.attackCd > (boss?.6:.45);
      const id = boss ? (attacking?'boss_attack':(entity?.facing==='left'||entity?.facing==='right'?'boss_side':'boss_down')) : (attacking?'goblin_attack':(entity?.facing==='left'||entity?.facing==='right'?'goblin_side':'goblin_down'));
      const flip = entity?.facing==='left';
      this.shadow(ctx,x,y+4,boss?24:15,boss?7:5,.3);
      if(this.drawAsset(ctx,id,x,y+9,{anchor:'ground',flip})) return;
    }
    this.shadow(ctx,x,y+3,boss?24:15,boss?8:5,.32);
""")

# Replace drawResource one-liner with asset-aware version.
js=js.replace("""  drawResource(ctx,node){ if(node.type==='tree') this.drawTree(ctx,node.sx,node.sy,node.variant); else if(node.type==='rock'||node.type==='iron') this.drawRock(ctx,node.sx,node.sy,node.type==='iron'); else this.drawBush(ctx,node.sx,node.sy); }
""", """  drawResource(ctx,node){
    if(this.assetsReady){
      const choices=RESOURCE_ASSET_KEYS[node.type];
      if(choices){ const id=Array.isArray(choices)?choices[(node.variant||0)%choices.length]:choices; if(this.drawAsset(ctx,id,node.sx,node.sy+10,{anchor:'ground'})) return; }
    }
    if(node.type==='tree') this.drawTree(ctx,node.sx,node.sy,node.variant); else if(node.type==='rock'||node.type==='iron') this.drawRock(ctx,node.sx,node.sy,node.type==='iron'); else this.drawBush(ctx,node.sx,node.sy);
  }
""")

# Insert icon in drawItem.
js=js.replace("""  drawItem(ctx,item){
    const bob = Math.sin(item.t*4 + item.seed)*3;
    this.shadow(ctx,item.sx,item.sy+6,10,3,.18); ctx.save(); ctx.translate(Math.round(item.sx),Math.round(item.sy+bob));
    this.drawIconShape(ctx,item.type,0,0,0.72);
""", """  drawItem(ctx,item){
    const bob = Math.sin(item.t*4 + item.seed)*3;
    this.shadow(ctx,item.sx,item.sy+6,10,3,.18); ctx.save(); ctx.translate(Math.round(item.sx),Math.round(item.sy+bob));
    const iconKey=ICON_ASSET_KEYS[item.type];
    if(iconKey && this.sprites[iconKey]) this.drawAsset(ctx,iconKey,0,0,{anchor:'center',scale:.78}); else this.drawIconShape(ctx,item.type,0,0,0.72);
""")

# Insert icon branch at top of drawIconShape.
js=js.replace("""  drawIconShape(ctx,type,x,y,s=1){
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ctx.lineWidth=2; ctx.strokeStyle=COLORS.ink;
""", """  drawIconShape(ctx,type,x,y,s=1){
    const iconKey=ICON_ASSET_KEYS[type];
    if(iconKey && this.drawAsset(ctx,iconKey,x,y,{anchor:'center',scale:s})) return;
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ctx.lineWidth=2; ctx.strokeStyle=COLORS.ink;
""")

# Insert building asset branch.
js=js.replace("""  drawBuilding(ctx,b){
    const x=b.sx, y=b.sy, type=b.type;
    if (type==='chest'){
""", """  drawBuilding(ctx,b){
    const x=b.sx, y=b.sy, type=b.type;
    const assetKey=BUILDING_ASSET_KEYS[type];
    if(assetKey && this.assetsReady){
      this.shadow(ctx,x,y+7,type==='galleon'?52:(type==='vault'?38:24),type==='galleon'?10:7,.22);
      const alpha=b.locked?.72:1;
      if(this.drawAsset(ctx,assetKey,x,y+10,{anchor:'ground',alpha})){
        if((type==='workbench'||type==='forge') && b.queue && b.queue.length){ const job=b.queue[0]; ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(x-24,y-62,48,8); ctx.fillStyle=COLORS.yellow; ctx.fillRect(x-24,y-62,48*job.progress/job.need,8); this.outlineRect(ctx,x-24,y-62,48,8); }
        if(type==='wall' && b.hp && b.hp < (BUILD_RECIPES.wall.hp||90)){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x-24,y-48,48,5);ctx.fillStyle=COLORS.red;ctx.fillRect(x-24,y-48,48*(b.hp/(BUILD_RECIPES.wall.hp||90)),5);}
        return;
      }
    }
    if (type==='chest'){
""")

# Insert blueprint asset branch.
js=js.replace("""  drawBlueprint(ctx,bp){
    ctx.save(); ctx.translate(bp.sx,bp.sy); ctx.globalAlpha=.72; ctx.strokeStyle=COLORS.cyan; ctx.lineWidth=2; ctx.setLineDash([4,4]); ctx.strokeRect(-24,-40,48,48); ctx.beginPath(); ctx.moveTo(-20,4); ctx.lineTo(20,-36); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1;
""", """  drawBlueprint(ctx,bp){
    const bpAsset=BLUEPRINT_ASSET_KEYS[bp.type];
    if(bpAsset && this.assetsReady){
      ctx.save(); ctx.globalAlpha=.50; this.drawAsset(ctx,bpAsset,bp.sx,bp.sy+10,{anchor:'ground'}); ctx.globalAlpha=1;
      ctx.strokeStyle=COLORS.cyan; ctx.lineWidth=2; ctx.setLineDash([4,4]); ctx.strokeRect(bp.sx-28,bp.sy-50,56,56); ctx.setLineDash([]);
      if(bp.ready){ ctx.fillStyle='rgba(255,216,90,.24)'; ctx.fillRect(bp.sx-28,bp.sy-50,56,56); }
      ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(bp.sx-26,bp.sy+12,52,7); ctx.fillStyle=COLORS.yellow; ctx.fillRect(bp.sx-26,bp.sy+12,52*(bp.progress/(bp.needProgress||1)),7); this.outlineRect(ctx,bp.sx-26,bp.sy+12,52,7); ctx.restore(); return;
    }
    ctx.save(); ctx.translate(bp.sx,bp.sy); ctx.globalAlpha=.72; ctx.strokeStyle=COLORS.cyan; ctx.lineWidth=2; ctx.setLineDash([4,4]); ctx.strokeRect(-24,-40,48,48); ctx.beginPath(); ctx.moveTo(-20,4); ctx.lineTo(20,-36); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1;
""")

# Game constructor: add facing and asset viewer state.
js=js.replace("""    this.player={x:this.world.spawn.x,y:this.world.spawn.y,dir:'down',walk:0,health:100,maxHealth:100,hunger:86,maxHunger:100,stamina:100,maxStamina:100,inv:{axe:1,pickaxe:1,hammer:1,berry:3,monkey_munch:1},attackCd:0,invuln:0,charge:0,onRaft:false,respawn:{x:this.world.spawn.x,y:this.world.spawn.y}};
    this.monkeys=[]; this.selectedSlot=0; this.currentBuild='campfire'; this.craftOpen=false; this.helpOpen=false; this.paused=false; this.gameOver=false; this.win=false;
""", """    this.player={x:this.world.spawn.x,y:this.world.spawn.y,dir:'down',facing:'right',walk:0,health:100,maxHealth:100,hunger:86,maxHunger:100,stamina:100,maxStamina:100,inv:{axe:1,pickaxe:1,hammer:1,berry:3,monkey_munch:1},attackCd:0,invuln:0,charge:0,onRaft:false,respawn:{x:this.world.spawn.x,y:this.world.spawn.y}};
    this.monkeys=[]; this.selectedSlot=0; this.currentBuild='campfire'; this.craftOpen=false; this.helpOpen=false; this.assetOpen=false; this.assetPage=0; this.paused=false; this.gameOver=false; this.win=false;
""")

# Start loop condition and hotkeys.
js=js.replace("""    if(this.craftOpen){ this.updateCraftMenuInput(); }
    else this.handleHotkeys();
    if(!this.craftOpen && !this.paused) this.updateWorld(dt);
""", """    if(this.craftOpen){ this.updateCraftMenuInput(); }
    else this.handleHotkeys();
    if(!this.craftOpen && !this.assetOpen && !this.paused) this.updateWorld(dt);
""")

js=js.replace("""  handleHotkeys(){
    const input=this.input;
    for(let i=0;i<10;i++) if(input.hit(String((i+1)%10))) this.selectedSlot=i;
    if(input.hit('[')) this.selectedSlot=(this.selectedSlot+HOTBAR.length-1)%HOTBAR.length;
    if(input.hit(']')) this.selectedSlot=(this.selectedSlot+1)%HOTBAR.length;
""", """  handleHotkeys(){
    const input=this.input;
    if(input.hit('v')) { this.assetOpen=!this.assetOpen; this.message(this.assetOpen?'Asset viewer opened. [ / ] pages, V closes.':'Asset viewer closed.'); }
    if(this.assetOpen){ if(input.hit('[')) this.assetPage=(this.assetPage+SHEET_ORDER.length-1)%SHEET_ORDER.length; if(input.hit(']')) this.assetPage=(this.assetPage+1)%SHEET_ORDER.length; return; }
    for(let i=0;i<10;i++) if(input.hit(String((i+1)%10))) this.selectedSlot=i;
    if(input.hit('[')) this.selectedSlot=(this.selectedSlot+HOTBAR.length-1)%HOTBAR.length;
    if(input.hit(']')) this.selectedSlot=(this.selectedSlot+1)%HOTBAR.length;
""")

# Update player facing.
js=js.replace("""    if(dx||dy){ const len=Math.hypot(dx,dy); dx/=len; dy/=len; p.dir=Math.abs(dx)>Math.abs(dy)?'side':(dy<0?'up':'down'); p.walk += dt*(p.onRaft?4:7); const sprint=input.down('shift') && p.stamina>5 && p.hunger>0; let speed=(p.onRaft?125:112)*(sprint?1.45:1); if(sprint) p.stamina=Math.max(0,p.stamina-18*dt); this.moveEntity(p,dx*speed*dt,dy*speed*dt,{onRaft:p.onRaft}); }
""", """    if(dx||dy){ const len=Math.hypot(dx,dy); dx/=len; dy/=len; if(Math.abs(dx)>.05) p.facing=dx<0?'left':'right'; p.dir=Math.abs(dx)>Math.abs(dy)?'side':(dy<0?'up':'down'); p.walk += dt*(p.onRaft?4:7); const sprint=input.down('shift') && p.stamina>5 && p.hunger>0; let speed=(p.onRaft?125:112)*(sprint?1.45:1); if(sprint) p.stamina=Math.max(0,p.stamina-18*dt); this.moveEntity(p,dx*speed*dt,dy*speed*dt,{onRaft:p.onRaft}); }
""")

# Update enemy facing and draw call.
js=js.replace("""      if(d>28){ const speed=e.type==='boss'?50:70; this.moveEntity(e,(target.x-e.x)/d*speed*dt,(target.y-e.y)/d*speed*dt,{radius:e.type==='boss'?16:10}); e.walk+=dt; }
""", """      if(d>28){ const speed=e.type==='boss'?50:70; const vx=(target.x-e.x)/d, vy=(target.y-e.y)/d; if(Math.abs(vx)>.15) e.facing=vx<0?'left':'right'; else e.facing=vy<0?'up':'down'; this.moveEntity(e,vx*speed*dt,vy*speed*dt,{radius:e.type==='boss'?16:10}); e.walk+=dt; }
""")
js=js.replace("""  monkeyMoveTo(m,x,y,speed,dt){ const d=distance(m.x,m.y,x,y); if(d>4) this.moveEntity(m,(x-m.x)/d*speed*dt,(y-m.y)/d*speed*dt,{radius:9}); return d; }
""", """  monkeyMoveTo(m,x,y,speed,dt){ const d=distance(m.x,m.y,x,y); if(d>4){ const vx=(x-m.x)/d, vy=(y-m.y)/d; if(Math.abs(vx)>.15) m.facing=vx<0?'left':'right'; else m.facing=vy<0?'up':'down'; this.moveEntity(m,vx*speed*dt,vy*speed*dt,{radius:9}); } return d; }
""")
js=js.replace("""  updateWildMonkey(m,dt){ m.wander += (Math.random()-.5)*dt*2; if(Math.random()<dt*.05) m.wander=Math.random()*TWO_PI; this.moveEntity(m,Math.cos(m.wander)*22*dt,Math.sin(m.wander)*22*dt,{radius:9}); }
""", """  updateWildMonkey(m,dt){ m.wander += (Math.random()-.5)*dt*2; if(Math.random()<dt*.05) m.wander=Math.random()*TWO_PI; const vx=Math.cos(m.wander), vy=Math.sin(m.wander); if(Math.abs(vx)>.15) m.facing=vx<0?'left':'right'; else m.facing=vy<0?'up':'down'; this.moveEntity(m,vx*22*dt,vy*22*dt,{radius:9}); }
""")
js=js.replace("""  monkeyFollow(m,dt){ const p=this.player; const d=distance(m.x,m.y,p.x,p.y); if(d>55){ this.moveEntity(m,(p.x-m.x)/d*86*dt,(p.y-m.y)/d*86*dt,{radius:9}); } }
""", """  monkeyFollow(m,dt){ const p=this.player; const d=distance(m.x,m.y,p.x,p.y); if(d>55){ const vx=(p.x-m.x)/d, vy=(p.y-m.y)/d; if(Math.abs(vx)>.15) m.facing=vx<0?'left':'right'; else m.facing=vy<0?'up':'down'; this.moveEntity(m,vx*86*dt,vy*86*dt,{radius:9}); } }
""")

# renderWorld calls.
js=js.replace("""    for(const e of w.enemies) objects.push({y:e.y,draw:()=>{const sx=e.x-cam.x,sy=e.y-cam.y;this.art.drawEnemy(ctx,sx,sy,e.walk,e.type==='boss'); this.art.drawHealthBar(ctx,sx,sy-(e.type==='boss'?68:45),e.type==='boss'?56:34,e.hp/e.maxHp,e.type==='boss'?COLORS.purple:COLORS.red);}});
    for(const m of this.monkeys) objects.push({y:m.y,draw:()=>{const sx=m.x-cam.x,sy=m.y-cam.y;this.art.drawMonkey(ctx,sx,sy,m.walk,m.tamed?m.order:null,this.mimic.monkey===m); if(m.carry){this.art.drawIconShape(ctx,m.carry.type,sx+15,sy-40,.55);}}});
    objects.push({y:this.player.y,draw:()=>this.art.drawPlayer(ctx,this.player.x-cam.x,this.player.y-cam.y,this.player.dir,this.player.walk,this.player.charge)});
""", """    for(const e of w.enemies) objects.push({y:e.y,draw:()=>{const sx=e.x-cam.x,sy=e.y-cam.y;this.art.drawEnemy(ctx,sx,sy,e.walk,e.type==='boss',e); this.art.drawHealthBar(ctx,sx,sy-(e.type==='boss'?68:45),e.type==='boss'?56:34,e.hp/e.maxHp,e.type==='boss'?COLORS.purple:COLORS.red);}});
    for(const m of this.monkeys) objects.push({y:m.y,draw:()=>{const sx=m.x-cam.x,sy=m.y-cam.y;this.art.drawMonkey(ctx,sx,sy,m.walk,m.tamed?m.order:null,this.mimic.monkey===m,m); if(m.carry){this.art.drawIconShape(ctx,m.carry.type,sx+15,sy-40,.55);}}});
    objects.push({y:this.player.y,draw:()=>this.art.drawPlayer(ctx,this.player.x-cam.x,this.player.y-cam.y,this.player.dir,this.player.walk,this.player.charge,this.currentHotbarItem(),this.player.facing,this.player.attackCd)});
""")

# renderUI asset viewer and panel image.
js=js.replace("""    if(this.craftOpen) this.drawCraftMenu(ctx); if(this.helpOpen) this.drawHelp(ctx); if(this.win) this.drawWin(ctx); if(this.gameOver) this.drawGameOver(ctx);
  }
  panel(ctx,x,y,w,h,a=.84){ ctx.fillStyle=`rgba(23,31,38,${a})`; ctx.fillRect(x,y,w,h); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=3; ctx.strokeRect(x+.5,y+.5,w,h); ctx.strokeStyle='rgba(255,245,214,.28)'; ctx.lineWidth=1; ctx.strokeRect(x+4.5,y+4.5,w-8,h-8); }
""", """    if(this.craftOpen) this.drawCraftMenu(ctx); if(this.helpOpen) this.drawHelp(ctx); if(this.assetOpen) this.drawAssetBrowser(ctx); if(this.win) this.drawWin(ctx); if(this.gameOver) this.drawGameOver(ctx);
  }
  panel(ctx,x,y,w,h,a=.84){
    if(this.art.assetsReady && this.art.sprites.ui_panel_medium){ ctx.save(); ctx.globalAlpha=a; ctx.drawImage(this.art.sprites.ui_panel_medium,Math.round(x),Math.round(y),Math.round(w),Math.round(h)); ctx.restore(); return; }
    ctx.fillStyle=`rgba(23,31,38,${a})`; ctx.fillRect(x,y,w,h); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=3; ctx.strokeRect(x+.5,y+.5,w,h); ctx.strokeStyle='rgba(255,245,214,.28)'; ctx.lineWidth=1; ctx.strokeRect(x+4.5,y+4.5,w-8,h-8);
  }
""")

# drawStatCircle use UI ring assets optionally.
js=js.replace("""  drawStatCircle(ctx,x,y,r,pct,color,icon){ ctx.save(); ctx.fillStyle='rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(x,y,r+5,0,TWO_PI); ctx.fill(); ctx.strokeStyle='white'; ctx.lineWidth=4; ctx.globalAlpha=.25; ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.stroke(); ctx.globalAlpha=1; ctx.strokeStyle=color; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(x,y,-Math.PI/2,-Math.PI/2+TWO_PI*clamp(pct,0,1)); ctx.stroke(); this.art.drawIconShape(ctx,icon,x,y,.9); ctx.restore(); }
""", """  drawStatCircle(ctx,x,y,r,pct,color,icon){ ctx.save(); const ringKey=icon==='heart'?'ui_health_ring':(icon==='hunger'?'ui_hunger_ring':'ui_stamina_ring'); if(this.art.assetsReady && this.art.sprites[ringKey]) this.art.drawAsset(ctx,ringKey,x,y,{anchor:'center',w:r*2+14,h:r*2+14}); else { ctx.fillStyle='rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(x,y,r+5,0,TWO_PI); ctx.fill(); ctx.strokeStyle='white'; ctx.lineWidth=4; ctx.globalAlpha=.25; ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.stroke(); ctx.globalAlpha=1; } ctx.strokeStyle=color; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(x,y,r,-Math.PI/2,-Math.PI/2+TWO_PI*clamp(pct,0,1)); ctx.stroke(); this.art.drawIconShape(ctx,icon,x,y,.72); ctx.restore(); }
""")
# The above replacement might fail due minus args? check later.

# If exact failed, do a regex substitute for drawStatCircle.
js=re.sub(r"  drawStatCircle\(ctx,x,y,r,pct,color,icon\)\{[^\n]*?\}\n", "  drawStatCircle(ctx,x,y,r,pct,color,icon){ ctx.save(); const ringKey=icon==='heart'?'ui_health_ring':(icon==='hunger'?'ui_hunger_ring':'ui_stamina_ring'); if(this.art.assetsReady && this.art.sprites[ringKey]) this.art.drawAsset(ctx,ringKey,x,y,{anchor:'center',w:r*2+14,h:r*2+14}); else { ctx.fillStyle='rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(x,y,r+5,0,TWO_PI); ctx.fill(); ctx.strokeStyle='white'; ctx.lineWidth=4; ctx.globalAlpha=.25; ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.stroke(); ctx.globalAlpha=1; } ctx.strokeStyle=color; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(x,y,r,-Math.PI/2,-Math.PI/2+TWO_PI*clamp(pct,0,1)); ctx.stroke(); this.art.drawIconShape(ctx,icon,x,y,.72); ctx.restore(); }\n", js)

# Hotbar slots use UI slot image.
js=js.replace("""      const x=x0+i*(slot+gap), id=HOTBAR[i]; ctx.fillStyle=i===this.selectedSlot?'rgba(255,216,90,.36)':'rgba(14,22,30,.72)'; ctx.fillRect(x,y,slot,slot); ctx.strokeStyle=i===this.selectedSlot?COLORS.yellow:'rgba(255,255,255,.45)'; ctx.lineWidth=i===this.selectedSlot?4:2; ctx.strokeRect(x+.5,y+.5,slot,slot); this.art.drawIconShape(ctx,id,x+slot/2,y+slot/2,.86);
""", """      const x=x0+i*(slot+gap), id=HOTBAR[i]; const slotKey=i===this.selectedSlot?'ui_slot_selected':'ui_slot'; if(this.art.assetsReady && this.art.sprites[slotKey]) this.art.drawAsset(ctx,slotKey,x+slot/2,y+slot/2,{anchor:'center',w:slot,h:slot}); else { ctx.fillStyle=i===this.selectedSlot?'rgba(255,216,90,.36)':'rgba(14,22,30,.72)'; ctx.fillRect(x,y,slot,slot); ctx.strokeStyle=i===this.selectedSlot?COLORS.yellow:'rgba(255,255,255,.45)'; ctx.lineWidth=i===this.selectedSlot?4:2; ctx.strokeRect(x+.5,y+.5,slot,slot); } this.art.drawIconShape(ctx,id,x+slot/2,y+slot/2,.86);
""")

# Add asset browser method before drawWin.
asset_browser = """
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
"""
js=js.replace("""  drawWin(ctx){ const x=this.canvas.width/2-310,y=this.canvas.height/2-110; this.panel(ctx,x,y,620,220,.96); ctx.font='bold 42px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.yellow; ctx.fillText('ESCAPE COMPLETE',this.canvas.width/2,y+60); ctx.font='18px monospace'; ctx.fillStyle=COLORS.white; ctx.fillText('You repaired the galleon, trained your crew, and left the island chain.',this.canvas.width/2,y+102); ctx.fillText('Press Enter for a new run.',this.canvas.width/2,y+150); }
""", asset_browser + "  drawWin(ctx){ const x=this.canvas.width/2-310,y=this.canvas.height/2-110; this.panel(ctx,x,y,620,220,.96); ctx.font='bold 42px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.yellow; ctx.fillText('ESCAPE COMPLETE',this.canvas.width/2,y+60); ctx.font='18px monospace'; ctx.fillStyle=COLORS.white; ctx.fillText('You repaired the galleon, trained your crew, and left the island chain.',this.canvas.width/2,y+102); ctx.fillText('Press Enter for a new run.',this.canvas.width/2,y+150); }\n")

# Place decor in overworld and dungeon.
js=js.replace("""    place('cage', spawnTile.x+5, spawnTile.y+1, {cagedMonkey:true});
    place('chest', spawnTile.x-3, spawnTile.y+1, {storage:{wood:2, berry:2}});
    place('totem', spawnTile.x+2, spawnTile.y-4, {});
""", """    place('cage', spawnTile.x+5, spawnTile.y+1, {cagedMonkey:true});
    place('chest', spawnTile.x-3, spawnTile.y+1, {storage:{wood:2, berry:2}});
    place('totem', spawnTile.x+2, spawnTile.y-4, {});
    place('tent', spawnTile.x-5, spawnTile.y+4, {solid:false,deco:true});
    place('barrel', spawnTile.x-2, spawnTile.y+4, {solid:false,deco:true});
    place('crates', spawnTile.x-4, spawnTile.y+3, {solid:false,deco:true});
    place('table', spawnTile.x+3, spawnTile.y+4, {solid:false,deco:true});
    place('firewood', spawnTile.x+1, spawnTile.y+5, {solid:false,deco:true});
""")
js=js.replace("""    for(let i=0;i<3;i++){
      const p=this.findFarTile(spawnTile, t => t==='grass'||t==='sand'||t==='path');
      if(p) place(i===0?'cage':'totem',p.x,p.y,i===0?{cagedMonkey:true}:{});
    }
""", """    for(let i=0;i<3;i++){
      const p=this.findFarTile(spawnTile, t => t==='grass'||t==='sand'||t==='path');
      if(p) place(i===0?'cage':'totem',p.x,p.y,i===0?{cagedMonkey:true}:{});
    }
    const deco=['ship_wreck0','ship_wreck1','ship_wreck2','signal_fire','treasure_pile','dig_spot','dock','sack','scarecrow','drying_rack','fish_rack','lantern_post'];
    for(let i=0;i<deco.length;i++){
      const p=this.findFarTile(spawnTile, t => t==='grass'||t==='sand'||t==='path'||t==='shallow', i%3===0);
      if(p) place(deco[i],p.x,p.y,{solid:false,deco:true});
    }
""")
js=js.replace("""    this.addBuilding('chest', 32*TILE+16, Math.floor(this.h/2+3)*TILE+24, {storage:{core:1, iron:3, banana:3}, locked:true, dungeonLoot:true});
""", """    this.addBuilding('chest', 32*TILE+16, Math.floor(this.h/2+3)*TILE+24, {storage:{core:1, iron:3, banana:3}, locked:true, dungeonLoot:true});
    this.addBuilding('bookshelf', 7*TILE+16, 4*TILE+24, {solid:false,deco:true});
    this.addBuilding('rug', 18*TILE+16, 14*TILE+24, {solid:false,deco:true});
    this.addBuilding('cauldron', 13*TILE+16, 10*TILE+24, {solid:false,deco:true});
    this.addBuilding('anvil', 24*TILE+16, 10*TILE+24, {solid:false,deco:true});
    this.addBuilding('spike_trap', 18*TILE+16, 7*TILE+24, {solid:false,deco:true});
    this.addBuilding('brazier', 22*TILE+16, 20*TILE+24, {solid:false,deco:true});
""")

# Draw enemy health call already done, need any syntax bugs later.
# Start button loading assets.
js=js.replace("""startBtn.addEventListener('click',()=>{ boot.classList.add('hidden'); canvas.focus(); game.start(); });
""", """startBtn.addEventListener('click',async()=>{ startBtn.disabled=true; startBtn.textContent='Loading generated assets...'; await game.art.loadAssets(); boot.classList.add('hidden'); canvas.focus(); game.start(); });
""")

# Update help text for V viewer.
js=js.replace("""      'M: Mimic Mode. Press E near a tamed monkey, then perform an action.',
""", """      'M: Mimic Mode. Press E near a tamed monkey, then perform an action.',
      'V: generated asset viewer / QA browser',
""")

main.write_text(js)
print('patched', main)
