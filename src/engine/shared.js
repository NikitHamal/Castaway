export const TILE = 32;
export const WORLD_W = 144;
export const WORLD_H = 104;
export const SAVE_VERSION = 41;
export const SAVE_KEY = 'island_serious_production_pass_v41';
export const TWO_PI = Math.PI * 2;

export const COLORS = {
  ink:'#181922', panel:'#1f2937', panel2:'#354155', white:'#fff2d0', gold:'#ffd36a', red:'#ef4d5d', orange:'#ff9c42',
  green:'#75cf62', cyan:'#67d7ef', water:'#0099db', shallow:'#32dce8', sand:'#e4d572', grass:'#5fc14c', grass2:'#63c74d',
  dirt:'#e4a672', path:'#e0a272', stone:'#8493ab', shadow:'rgba(0,0,0,.35)'
};

const P = 'assets/generated/player/';
export const ASSETS = {
  pc_idle_down:P+'pc_idle_down.png', pc_idle_side:P+'pc_idle_side.png', pc_idle_up:P+'pc_idle_up.png',
  pc_walk_down:P+'pc_walk_down.png', pc_walk_side:P+'pc_walk_side.png', pc_walk_up:P+'pc_walk_up.png',
  pc_run_down:P+'pc_run_down.png', pc_run_side:P+'pc_run_side.png', pc_run_up:P+'pc_run_up.png',
  pc_slice_down:P+'pc_slice_down.png', pc_slice_side:P+'pc_slice_side.png', pc_slice_up:P+'pc_slice_up.png',
  pc_crush_down:P+'pc_crush_down.png', pc_crush_side:P+'pc_crush_side.png', pc_crush_up:P+'pc_crush_up.png',
  pc_collect_down:P+'pc_collect_down.png', pc_collect_side:P+'pc_collect_side.png', pc_collect_up:P+'pc_collect_up.png',
  pc_water_down:P+'pc_water_down.png', pc_water_side:P+'pc_water_side.png', pc_water_up:P+'pc_water_up.png',
  pc_fish_down:P+'pc_fish_down.png', pc_fish_side:P+'pc_fish_side.png', pc_fish_up:P+'pc_fish_up.png',
  pc_hit_down:P+'pc_hit_down.png', pc_hit_side:P+'pc_hit_side.png', pc_hit_up:P+'pc_hit_up.png',
  tile_grass:'assets/sunnyside/tile_grass.png', tile_grass2:'assets/sunnyside/tile_grass2.png', tile_meadow:'assets/sunnyside/tile_meadow.png',
  tile_dirt:'assets/sunnyside/tile_dirt.png', tile_path:'assets/sunnyside/tile_path.png', tile_sand:'assets/sunnyside/tile_sand.png',
  tile_water:'assets/sunnyside/tile_water.png', tile_shallow:'assets/sunnyside/tile_shallow.png', tile_shore:'assets/sunnyside/tile_shore.png', tile_stone:'assets/sunnyside/tile_stone.png', tile_woodfloor:'assets/sunnyside/tile_woodfloor.png', tile_walltile:'assets/sunnyside/tile_walltile.png',
  duck:'assets/sunnyside/duck_strip4.png', chicken:'assets/sunnyside/chicken_strip4.png', cow:'assets/sunnyside/cow_strip4.png', sheep:'assets/sunnyside/sheep_strip4.png', pig:'assets/sunnyside/pig_strip4.png',
  tree1:'assets/sunnyside/tree_01_strip4.png', tree2:'assets/sunnyside/tree_02_strip4.png', propTree0:'assets/sunnyside/prop_tree_0.png', propTree1:'assets/sunnyside/prop_tree_1.png', mushroomRed:'assets/sunnyside/mushroom_red_strip4.png', mushroomBlue:'assets/sunnyside/mushroom_blue_strip4.png',
  bushRed:'assets/sunnyside/prop_bush_red.png', bushBlue:'assets/sunnyside/prop_bush_blue.png', rock:'assets/sunnyside/rock.png', wood:'assets/sunnyside/wood.png', crateBase:'assets/sunnyside/crate_base.png', crateTop:'assets/sunnyside/crate_top.png', seeds:'assets/sunnyside/seeds.png', carrot:'assets/sunnyside/carrot.png', pumpkin:'assets/sunnyside/pumpkin.png', wheat:'assets/sunnyside/wheat.png', cabbage:'assets/sunnyside/cabbage.png', fish:'assets/sunnyside/fish.png', soil:'assets/sunnyside/soil_00.png', soilReady:'assets/sunnyside/soil_04.png',
  home:'assets/generated/buildings/home_blue.png', cabin:'assets/generated/buildings/barn_blue.png', workshop:'assets/generated/buildings/forge_blue.png', shop:'assets/generated/buildings/shop_red.png', factory:'assets/generated/buildings/factory_blue.png', well:'assets/sunnyside/building_well.png', dock:'assets/sunnyside/building_dock.png', windmill:'assets/sunnyside/windmill_strip9.png', coracle:'assets/sunnyside/coracle_land.png', coracleWater:'assets/sunnyside/coracle_water_strip4.png', fire:'assets/sunnyside/fire_strip4.png', fireBig:'assets/sunnyside/fire_big_strip4.png', smoke:'assets/sunnyside/smoke_strip30.png', marker:'assets/sunnyside/ui_marker.png',
  uiAxe:'assets/sunnyside/ui_axe.png', uiPickaxe:'assets/sunnyside/ui_pickaxe.png', uiHammer:'assets/sunnyside/ui_hammer.png', uiSword:'assets/sunnyside/ui_sword.png', uiBasket:'assets/sunnyside/ui_basket.png', uiWater:'assets/sunnyside/ui_water.png', uiConfirm:'assets/sunnyside/ui_confirm.png', uiCancel:'assets/sunnyside/ui_cancel.png', iconFood:'assets/sunnyside/icon_food.png'
};

export const SHEETS = {
  sunnyside_example:'assets/sunnyside/Sunnyside_World_ExampleScene.png',
  sunnyside_tileset:'assets/sunnyside/spr_tileset_sunnysideworld_16px.png',
  sunnyside_forest:'assets/sunnyside/spr_tileset_sunnysideworld_forest_32px.png',
  pixelcrawler_floors:'assets/pixelcrawler/Floors_Tiles.png',
  pixelcrawler_water:'assets/pixelcrawler/Water_tiles.png',
  pixelcrawler_resources:'assets/pixelcrawler/Resources.png'
};
export const SHEET_ORDER = Object.keys(SHEETS);
export const SHEET_TITLES = {sunnyside_example:'Sunnyside Example Scene', sunnyside_tileset:'Sunnyside World 16px Tileset', sunnyside_forest:'Sunnyside Forest 32px Tileset', pixelcrawler_floors:'Pixel Crawler Floors', pixelcrawler_water:'Pixel Crawler Water', pixelcrawler_resources:'Pixel Crawler Resources'};

export const ITEMS = {
  axe:{name:'Axe', tool:true, icon:'uiAxe'}, pickaxe:{name:'Pickaxe', tool:true, icon:'uiPickaxe'}, hammer:{name:'Hammer', tool:true, icon:'uiHammer'}, sword:{name:'Sword', tool:true, icon:'uiSword'},
  wood:{name:'Wood', icon:'wood'}, stone:{name:'Stone', icon:'rock'}, seeds:{name:'Seeds', icon:'seeds'}, carrot:{name:'Carrot', food:20, icon:'carrot'}, pumpkin:{name:'Pumpkin', food:34, icon:'pumpkin'}, wheat:{name:'Wheat', icon:'wheat'}, cabbage:{name:'Cabbage', food:26, icon:'cabbage'}, mushroom:{name:'Mushroom', food:14, icon:'mushroomRed'}, fish:{name:'Fish', food:24, icon:'fish'}
};
export const HOTBAR = ['axe','pickaxe','hammer','sword','seeds','carrot','pumpkin','fish'];
export const BUILDINGS = {
  home:{name:'Home', asset:'home', cost:{wood:18,stone:8}, radius:54, desc:'Enterable blue-roof home, rest/save point', enterable:true},
  cabin:{name:'Barn Cabin', asset:'cabin', cost:{wood:14,stone:6}, radius:46, desc:'Enterable shelter with storage', enterable:true},
  workshop:{name:'Forge Workshop', asset:'workshop', cost:{wood:24,stone:12}, radius:58, desc:'Enterable workshop for crafting', enterable:true},
  shop:{name:'Market Shop', asset:'shop', cost:{wood:18,stone:10}, radius:48, desc:'Enterable town shop and supplies', enterable:true},
  factory:{name:'Blue Mill', asset:'factory', cost:{wood:22,stone:16}, radius:48, desc:'Enterable processing building', enterable:true},
  well:{name:'Well', asset:'well', cost:{stone:16,wood:6}, radius:18, desc:'Fresh water and crop boost'},
  dock:{name:'Dock', asset:'dock', cost:{wood:16}, radius:24, desc:'Fishing, boats and shoreline access'},
  windmill:{name:'Windmill', asset:'windmill', cost:{wood:30,stone:14,wheat:8}, radius:36, desc:'Late-game landmark and grain processing'}
};

export function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
export function dist2(ax,ay,bx,by){ const dx=ax-bx, dy=ay-by; return dx*dx+dy*dy; }
export function distance(ax,ay,bx,by){ return Math.hypot(ax-bx, ay-by); }
export function finiteNumber(v,d=0){ const n=Number(v); return Number.isFinite(n)?n:d; }
export function nowId(){ return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; }
export function addToBag(bag,id,qty=1){ bag[id]=(bag[id]||0)+qty; if(bag[id]<=0) delete bag[id]; return bag; }
export function hasCost(bag,cost){ return Object.entries(cost).every(([k,v])=>(bag[k]||0)>=v); }
export function payCost(bag,cost){ if(!hasCost(bag,cost)) return false; for(const [k,v] of Object.entries(cost)) addToBag(bag,k,-v); return true; }
export function formatCost(cost){ return Object.entries(cost).map(([k,v])=>`${v} ${itemName(k)}`).join(', '); }
export function itemName(id){ return ITEMS[id]?.name || BUILDINGS[id]?.name || id; }
export function sanitizeBag(bag={}){ const out={}; for(const [k,v] of Object.entries(bag||{})){ const n=Math.floor(finiteNumber(v,0)); if(n>0) out[k]=n; } return out; }
export function deepClone(v){ return JSON.parse(JSON.stringify(v)); }
export function mulberry32(seed){ let a=seed>>>0; return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
export function hash2(x,y,seed=0){ let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(seed|0,2246822519); h=(h^(h>>>13))*1274126177; return ((h^(h>>>16))>>>0)/4294967295; }
export function randRange(rng,a,b){ return a+(b-a)*rng(); }
export function choice(rng,arr){ return arr[Math.floor(rng()*arr.length) % arr.length]; }
export function wrapText(ctx,text,maxW){ const words=String(text).split(/\s+/); const lines=[]; let line=''; for(const w of words){ const next=line?`${line} ${w}`:w; if(ctx.measureText(next).width>maxW && line){ lines.push(line); line=w; } else line=next; } if(line) lines.push(line); return lines; }
