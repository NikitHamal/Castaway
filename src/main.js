(() => {
'use strict';

const TILE = 32;
const WORLD_W = 96;
const WORLD_H = 96;
const SAVE_KEY = 'castaway_mimics_save_v1';
const TWO_PI = Math.PI * 2;

const GENERATED_ASSETS = {
  "player_down": "assets/generated/curated/characters/player_down.png",
  "player_up": "assets/generated/curated/characters/player_up.png",
  "player_side": "assets/generated/curated/characters/player_side.png",
  "player_walk_0": "assets/generated/curated/characters/player_walk_0.png",
  "player_walk_1": "assets/generated/curated/characters/player_walk_1.png",
  "player_walk_2": "assets/generated/curated/characters/player_walk_2.png",
  "player_axe": "assets/generated/curated/characters/player_axe.png",
  "player_pickaxe": "assets/generated/curated/characters/player_pickaxe.png",
  "player_hammer": "assets/generated/curated/characters/player_hammer.png",
  "player_sword": "assets/generated/curated/characters/player_sword.png",
  "player_carry": "assets/generated/curated/characters/player_carry.png",
  "monkey_down": "assets/generated/curated/characters/monkey_down.png",
  "monkey_up": "assets/generated/curated/characters/monkey_up.png",
  "monkey_side": "assets/generated/curated/characters/monkey_side.png",
  "monkey_walk_0": "assets/generated/curated/characters/monkey_walk_0.png",
  "monkey_walk_1": "assets/generated/curated/characters/monkey_walk_1.png",
  "monkey_walk_2": "assets/generated/curated/characters/monkey_walk_2.png",
  "monkey_carry": "assets/generated/curated/characters/monkey_carry.png",
  "monkey_attack": "assets/generated/curated/characters/monkey_attack.png",
  "monkey_mimic": "assets/generated/curated/characters/monkey_mimic.png",
  "goblin_down": "assets/generated/curated/characters/goblin_down.png",
  "goblin_side": "assets/generated/curated/characters/goblin_side.png",
  "goblin_attack": "assets/generated/curated/characters/goblin_attack.png",
  "boss_down": "assets/generated/curated/characters/boss_down.png",
  "boss_side": "assets/generated/curated/characters/boss_side.png",
  "boss_attack": "assets/generated/curated/characters/boss_attack.png",
  "npc_crafter": "assets/generated/curated/characters/npc_crafter.png",
  "npc_explorer": "assets/generated/curated/characters/npc_explorer.png",
  "tile_grass": "assets/generated/curated/tiles/tile_grass.png",
  "tile_grass2": "assets/generated/curated/tiles/tile_grass2.png",
  "tile_sand": "assets/generated/curated/tiles/tile_sand.png",
  "tile_sand_detail": "assets/generated/curated/tiles/tile_sand_detail.png",
  "tile_shore": "assets/generated/curated/tiles/tile_shore.png",
  "tile_shallow": "assets/generated/curated/tiles/tile_shallow.png",
  "tile_water": "assets/generated/curated/tiles/tile_water.png",
  "tile_path": "assets/generated/curated/tiles/tile_path.png",
  "tile_wood": "assets/generated/curated/tiles/tile_wood.png",
  "tile_dirt": "assets/generated/curated/tiles/tile_dirt.png",
  "tile_stone": "assets/generated/curated/tiles/tile_stone.png",
  "tile_cliff": "assets/generated/curated/tiles/tile_cliff.png",
  "tile_swamp": "assets/generated/curated/tiles/tile_swamp.png",
  "tile_swamp_water": "assets/generated/curated/tiles/tile_swamp_water.png",
  "tile_poison": "assets/generated/curated/tiles/tile_poison.png",
  "tile_ash": "assets/generated/curated/tiles/tile_ash.png",
  "tile_lava": "assets/generated/curated/tiles/tile_lava.png",
  "tile_floor": "assets/generated/curated/tiles/tile_floor.png",
  "tile_walltile": "assets/generated/curated/tiles/tile_walltile.png",
  "prop_palm_0": "assets/generated/curated/props/prop_palm_0.png",
  "prop_palm_1": "assets/generated/curated/props/prop_palm_1.png",
  "prop_palm_2": "assets/generated/curated/props/prop_palm_2.png",
  "prop_palm_3": "assets/generated/curated/props/prop_palm_3.png",
  "prop_bush_red": "assets/generated/curated/props/prop_bush_red.png",
  "prop_bush_purple": "assets/generated/curated/props/prop_bush_purple.png",
  "prop_banana_plant": "assets/generated/curated/props/prop_banana_plant.png",
  "prop_rock_0": "assets/generated/curated/props/prop_rock_0.png",
  "prop_rock_1": "assets/generated/curated/props/prop_rock_1.png",
  "prop_iron_0": "assets/generated/curated/props/prop_iron_0.png",
  "prop_iron_1": "assets/generated/curated/props/prop_iron_1.png",
  "prop_stump": "assets/generated/curated/props/prop_stump.png",
  "prop_logs": "assets/generated/curated/props/prop_logs.png",
  "prop_sticks": "assets/generated/curated/props/prop_sticks.png",
  "prop_chest_closed": "assets/generated/curated/props/prop_chest_closed.png",
  "prop_chest_open": "assets/generated/curated/props/prop_chest_open.png",
  "prop_campfire_unlit": "assets/generated/curated/props/prop_campfire_unlit.png",
  "prop_campfire_lit": "assets/generated/curated/props/prop_campfire_lit.png",
  "prop_workbench": "assets/generated/curated/props/prop_workbench.png",
  "prop_bed": "assets/generated/curated/props/prop_bed.png",
  "prop_torch": "assets/generated/curated/props/prop_torch.png",
  "prop_wall": "assets/generated/curated/props/prop_wall.png",
  "prop_wall_corner": "assets/generated/curated/props/prop_wall_corner.png",
  "prop_wall_gate": "assets/generated/curated/props/prop_wall_gate.png",
  "prop_wall_damaged": "assets/generated/curated/props/prop_wall_damaged.png",
  "prop_forge": "assets/generated/curated/props/prop_forge.png",
  "prop_raft_sail": "assets/generated/curated/props/prop_raft_sail.png",
  "prop_raft": "assets/generated/curated/props/prop_raft.png",
  "prop_wreck_0": "assets/generated/curated/props/prop_wreck_0.png",
  "prop_wreck_1": "assets/generated/curated/props/prop_wreck_1.png",
  "prop_wreck_2": "assets/generated/curated/props/prop_wreck_2.png",
  "prop_wreck_3": "assets/generated/curated/props/prop_wreck_3.png",
  "prop_table": "assets/generated/curated/props/prop_table.png",
  "prop_cage": "assets/generated/curated/props/prop_cage.png",
  "prop_totem": "assets/generated/curated/props/prop_totem.png",
  "prop_crates": "assets/generated/curated/props/prop_crates.png",
  "prop_barrel": "assets/generated/curated/props/prop_barrel.png",
  "prop_sack": "assets/generated/curated/props/prop_sack.png",
  "prop_tent": "assets/generated/curated/props/prop_tent.png",
  "poi_vault_round": "assets/generated/curated/props/poi_vault_round.png",
  "poi_temple_gate": "assets/generated/curated/props/poi_temple_gate.png",
  "poi_cave_gate": "assets/generated/curated/props/poi_cave_gate.png",
  "poi_hatch": "assets/generated/curated/props/poi_hatch.png",
  "poi_bridge": "assets/generated/curated/props/poi_bridge.png",
  "poi_supply_crate": "assets/generated/curated/props/poi_supply_crate.png",
  "poi_signal_fire": "assets/generated/curated/props/poi_signal_fire.png",
  "poi_treasure_pile": "assets/generated/curated/props/poi_treasure_pile.png",
  "poi_dig_spot": "assets/generated/curated/props/poi_dig_spot.png",
  "poi_treasure_chest": "assets/generated/curated/props/poi_treasure_chest.png",
  "poi_galleon_hull": "assets/generated/curated/props/poi_galleon_hull.png",
  "poi_mast": "assets/generated/curated/props/poi_mast.png",
  "poi_sail": "assets/generated/curated/props/poi_sail.png",
  "poi_anchor": "assets/generated/curated/props/poi_anchor.png",
  "poi_wheel": "assets/generated/curated/props/poi_wheel.png",
  "poi_cannon": "assets/generated/curated/props/poi_cannon.png",
  "poi_dock": "assets/generated/curated/props/poi_dock.png",
  "poi_shelf": "assets/generated/curated/props/poi_shelf.png",
  "poi_cupboard": "assets/generated/curated/props/poi_cupboard.png",
  "poi_long_table": "assets/generated/curated/props/poi_long_table.png",
  "poi_bookshelf": "assets/generated/curated/props/poi_bookshelf.png",
  "poi_rug": "assets/generated/curated/props/poi_rug.png",
  "poi_pottery": "assets/generated/curated/props/poi_pottery.png",
  "poi_cauldron": "assets/generated/curated/props/poi_cauldron.png",
  "poi_chopping_block": "assets/generated/curated/props/poi_chopping_block.png",
  "poi_loom": "assets/generated/curated/props/poi_loom.png",
  "poi_anvil": "assets/generated/curated/props/poi_anvil.png",
  "poi_tilled_soil": "assets/generated/curated/props/poi_tilled_soil.png",
  "poi_seedlings": "assets/generated/curated/props/poi_seedlings.png",
  "poi_crops": "assets/generated/curated/props/poi_crops.png",
  "poi_bucket": "assets/generated/curated/props/poi_bucket.png",
  "poi_compost": "assets/generated/curated/props/poi_compost.png",
  "poi_scarecrow": "assets/generated/curated/props/poi_scarecrow.png",
  "poi_spike_trap": "assets/generated/curated/props/poi_spike_trap.png",
  "poi_snare": "assets/generated/curated/props/poi_snare.png",
  "poi_barricade": "assets/generated/curated/props/poi_barricade.png",
  "poi_brazier": "assets/generated/curated/props/poi_brazier.png",
  "poi_drum": "assets/generated/curated/props/poi_drum.png",
  "poi_lantern_post": "assets/generated/curated/props/poi_lantern_post.png",
  "poi_firewood": "assets/generated/curated/props/poi_firewood.png",
  "poi_ore_basket": "assets/generated/curated/props/poi_ore_basket.png",
  "poi_drying_rack": "assets/generated/curated/props/poi_drying_rack.png",
  "poi_fish_rack": "assets/generated/curated/props/poi_fish_rack.png",
  "icon_fiber": "assets/generated/curated/icons/icon_fiber.png",
  "icon_banana": "assets/generated/curated/icons/icon_banana.png",
  "icon_wood": "assets/generated/curated/icons/icon_wood.png",
  "icon_berry": "assets/generated/curated/icons/icon_berry.png",
  "icon_cooked_meal": "assets/generated/curated/icons/icon_cooked_meal.png",
  "icon_stone": "assets/generated/curated/icons/icon_stone.png",
  "icon_monkey_munch": "assets/generated/curated/icons/icon_monkey_munch.png",
  "icon_core": "assets/generated/curated/icons/icon_core.png",
  "icon_axe": "assets/generated/curated/icons/icon_axe.png",
  "icon_pickaxe": "assets/generated/curated/icons/icon_pickaxe.png",
  "icon_hammer": "assets/generated/curated/icons/icon_hammer.png",
  "icon_iron": "assets/generated/curated/icons/icon_iron.png",
  "icon_torch": "assets/generated/curated/icons/icon_torch.png",
  "icon_campfire": "assets/generated/curated/icons/icon_campfire.png",
  "icon_workbench": "assets/generated/curated/icons/icon_workbench.png",
  "icon_sword": "assets/generated/curated/icons/icon_sword.png",
  "icon_metal_sword": "assets/generated/curated/icons/icon_metal_sword.png",
  "icon_chest": "assets/generated/curated/icons/icon_chest.png",
  "icon_bed": "assets/generated/curated/icons/icon_bed.png",
  "icon_wall": "assets/generated/curated/icons/icon_wall.png",
  "icon_palm_leaf": "assets/generated/curated/icons/icon_palm_leaf.png",
  "icon_raft": "assets/generated/curated/icons/icon_raft.png",
  "icon_sail": "assets/generated/curated/icons/icon_sail.png",
  "icon_rope": "assets/generated/curated/icons/icon_rope.png",
  "icon_shell": "assets/generated/curated/icons/icon_shell.png",
  "icon_fish": "assets/generated/curated/icons/icon_fish.png",
  "icon_flask": "assets/generated/curated/icons/icon_flask.png",
  "icon_repair": "assets/generated/curated/icons/icon_repair.png",
  "icon_meat": "assets/generated/curated/icons/icon_meat.png",
  "icon_key": "assets/generated/curated/icons/icon_key.png",
  "icon_map": "assets/generated/curated/icons/icon_map.png",
  "icon_heart": "assets/generated/curated/icons/icon_heart.png",
  "icon_hunger": "assets/generated/curated/icons/icon_hunger.png",
  "icon_stamina": "assets/generated/curated/icons/icon_stamina.png",
  "icon_bag": "assets/generated/curated/icons/icon_bag.png",
  "icon_build": "assets/generated/curated/icons/icon_build.png",
  "icon_monkey": "assets/generated/curated/icons/icon_monkey.png",
  "icon_attack": "assets/generated/curated/icons/icon_attack.png",
  "icon_interact": "assets/generated/curated/icons/icon_interact.png",
  "icon_save": "assets/generated/curated/icons/icon_save.png",
  "icon_quest": "assets/generated/curated/icons/icon_quest.png",
  "icon_marker": "assets/generated/curated/icons/icon_marker.png",
  "ui_panel_large": "assets/generated/curated/ui/ui_panel_large.png",
  "ui_panel_medium": "assets/generated/curated/ui/ui_panel_medium.png",
  "ui_hotbar_slots": "assets/generated/curated/ui/ui_hotbar_slots.png",
  "ui_inventory_grid": "assets/generated/curated/ui/ui_inventory_grid.png",
  "ui_slot": "assets/generated/curated/ui/ui_slot.png",
  "ui_slot_selected": "assets/generated/curated/ui/ui_slot_selected.png",
  "ui_health_ring": "assets/generated/curated/ui/ui_health_ring.png",
  "ui_hunger_ring": "assets/generated/curated/ui/ui_hunger_ring.png",
  "ui_stamina_ring": "assets/generated/curated/ui/ui_stamina_ring.png",
  "ui_minimap_round": "assets/generated/curated/ui/ui_minimap_round.png",
  "ui_speech_dark": "assets/generated/curated/ui/ui_speech_dark.png",
  "ui_progress_green": "assets/generated/curated/ui/ui_progress_green.png",
  "ui_cursor": "assets/generated/curated/ui/ui_cursor.png",
  "ui_reticle": "assets/generated/curated/ui/ui_reticle.png",
  "ui_build_reticle": "assets/generated/curated/ui/ui_build_reticle.png",
  "fx_slash_0": "assets/generated/curated/fx/fx_slash_0.png",
  "fx_slash_1": "assets/generated/curated/fx/fx_slash_1.png",
  "fx_spark_0": "assets/generated/curated/fx/fx_spark_0.png",
  "fx_dust_0": "assets/generated/curated/fx/fx_dust_0.png",
  "fx_hit_axe": "assets/generated/curated/fx/fx_hit_axe.png",
  "fx_hit_hammer": "assets/generated/curated/fx/fx_hit_hammer.png",
  "fx_fire_0": "assets/generated/curated/fx/fx_fire_0.png",
  "fx_fire_1": "assets/generated/curated/fx/fx_fire_1.png",
  "fx_fire_2": "assets/generated/curated/fx/fx_fire_2.png",
  "fx_torch_0": "assets/generated/curated/fx/fx_torch_0.png",
  "fx_smoke": "assets/generated/curated/fx/fx_smoke.png",
  "fx_splash": "assets/generated/curated/fx/fx_splash.png",
  "fx_poison": "assets/generated/curated/fx/fx_poison.png"
};
const GENERATED_SHEETS = {
  "characters": "assets/generated/sheets/characters.png",
  "terrain": "assets/generated/sheets/terrain.png",
  "world_buildables": "assets/generated/sheets/world_buildables.png",
  "items_icons": "assets/generated/sheets/items_icons.png",
  "biomes_dungeon": "assets/generated/sheets/biomes_dungeon.png",
  "poi_interiors": "assets/generated/sheets/poi_interiors.png",
  "ui_kit": "assets/generated/sheets/ui_kit.png",
  "effects": "assets/generated/sheets/effects.png"
};
const SHEET_ORDER = ['characters','terrain','world_buildables','items_icons','biomes_dungeon','poi_interiors','ui_kit','effects'];
const SHEET_TITLES = {
  characters:'Characters & Combat', terrain:'Island Terrain', world_buildables:'World Buildables', items_icons:'Items / Tools / HUD Icons',
  biomes_dungeon:'Biomes & Dungeon Tiles', poi_interiors:'POI / Interior / Exploration Props', ui_kit:'UI Kit', effects:'FX / Markers / Blueprint Ghosts'
};
const TILE_ASSET_KEYS = {
  grass:'tile_grass', grass2:'tile_grass2', sand:'tile_sand', shallow:'tile_shallow', water:'tile_water', path:'tile_path',
  swamp:'tile_swamp', ash:'tile_ash', lava:'tile_lava', floor:'tile_floor', stone:'tile_stone', walltile:'tile_walltile'
};
const ICON_ASSET_KEYS = {
  wood:'icon_wood', stone:'icon_stone', fiber:'icon_fiber', berry:'icon_berry', banana:'icon_banana', iron:'icon_iron', core:'icon_core', monkey_munch:'icon_monkey_munch',
  axe:'icon_axe', pickaxe:'icon_pickaxe', sword:'icon_sword', metal_sword:'icon_metal_sword', hammer:'icon_hammer', cooked_meal:'icon_cooked_meal',
  chest:'icon_chest', campfire:'icon_campfire', workbench:'icon_workbench', bed:'icon_bed', wall:'icon_wall', torch:'icon_torch', forge:'icon_workbench', raft:'icon_raft',
  heart:'icon_heart', hunger:'icon_hunger', stamina:'icon_stamina', bag:'icon_bag', build:'icon_build', monkey:'icon_monkey', attack:'icon_attack', interact:'icon_interact', save:'icon_save', quest:'icon_quest'
};
const RESOURCE_ASSET_KEYS = { tree:['prop_palm_0','prop_palm_1','prop_palm_2','prop_palm_3'], rock:['prop_rock_0','prop_rock_1'], iron:['prop_iron_0','prop_iron_1'], bush:['prop_bush_red','prop_bush_purple'] };
const BUILDING_ASSET_KEYS = {
  chest:'prop_chest_closed', workbench:'prop_workbench', campfire:'prop_campfire_lit', bed:'prop_bed', wall:'prop_wall', torch:'prop_torch', forge:'prop_forge', raft:'prop_raft_sail',
  vault:'poi_vault_round', galleon:'poi_galleon_hull', cage:'prop_cage', totem:'prop_totem',
  tent:'prop_tent', barrel:'prop_barrel', crates:'prop_crates', sack:'prop_sack', table:'prop_table',
  ship_wreck0:'prop_wreck_0', ship_wreck1:'prop_wreck_1', ship_wreck2:'prop_wreck_2', ship_wreck3:'prop_wreck_3',
  dock:'poi_dock', signal_fire:'poi_signal_fire', treasure_pile:'poi_treasure_pile', dig_spot:'poi_dig_spot', treasure_chest:'poi_treasure_chest',
  shelf:'poi_shelf', cupboard:'poi_cupboard', long_table:'poi_long_table', bookshelf:'poi_bookshelf', rug:'poi_rug', pottery:'poi_pottery', cauldron:'poi_cauldron', chopping_block:'poi_chopping_block', loom:'poi_loom', anvil:'poi_anvil',
  tilled_soil:'poi_tilled_soil', seedlings:'poi_seedlings', crops:'poi_crops', bucket:'poi_bucket', compost:'poi_compost', scarecrow:'poi_scarecrow',
  spike_trap:'poi_spike_trap', snare:'poi_snare', barricade:'poi_barricade', brazier:'poi_brazier', drum:'poi_drum', lantern_post:'poi_lantern_post', firewood:'poi_firewood', ore_basket:'poi_ore_basket', drying_rack:'poi_drying_rack', fish_rack:'poi_fish_rack'
};
const BLUEPRINT_ASSET_KEYS = { chest:'prop_chest_closed', campfire:'prop_campfire_lit', workbench:'prop_workbench', bed:'prop_bed', wall:'prop_wall', torch:'prop_torch', forge:'prop_forge', raft:'prop_raft_sail' };


const COLORS = {
  ink: '#2a1715', ink2: '#4a2a20', white: '#fff5d6', panel: '#171f26', panel2: '#26323a',
  sand: '#e8c76f', sandDark: '#bd904b', sandLight: '#ffe29c', grass: '#4b9b42', grassDark: '#2f6f31', grassLight: '#76c865',
  water: '#227da0', waterDark: '#126074', waterLight: '#7be1d7', shallow: '#54b5b4', stone: '#8e7e63', stoneDark: '#504941', stoneLight: '#b7aa8a',
  wood: '#a85d2a', woodDark: '#67331e', woodLight: '#d88a42', leaf: '#4f8c41', leafDark: '#2c5e2f', leafLight: '#77bd61',
  red: '#e83b4b', orange: '#ff8a2b', yellow: '#ffd85a', cyan: '#62d3ff', purple: '#9057cf', black: '#08090d'
};

const ITEM_INFO = {
  wood: {name:'Wood', color:'#a85d2a'}, stone: {name:'Pebble Stone', color:'#8e8a7e'}, fiber: {name:'Palm Fiber', color:'#76c865'},
  berry: {name:'Wild Berries', color:'#d84165', food:18}, banana: {name:'Banana', color:'#f4d55f', food:26}, iron: {name:'Iron Ore', color:'#9fb3bd'},
  core: {name:'Ancient Core', color:'#41d7ff'}, monkey_munch: {name:'Monkey Munch', color:'#d981ff'},
  axe: {name:'Flint Axe', tool:true}, pickaxe: {name:'Pebble Pickaxe', tool:true}, sword: {name:'Bone Sword', tool:true}, metal_sword: {name:'Metal Sword', tool:true}, hammer: {name:'Builder Hammer', tool:true},
  cooked_meal: {name:'Cooked Meal', color:'#ffad42', food:46}
};

const HOTBAR = ['axe','pickaxe','sword','hammer','monkey_munch','berry','banana','campfire','chest','workbench','wall','raft'];

const BUILD_RECIPES = {
  campfire: {name:'Campfire', cost:{wood:3, stone:2}, progress:5, solid:false, light:180, desc:'Warmth, cooking and raid target.'},
  chest: {name:'Chest', cost:{wood:4, fiber:2}, progress:5, solid:true, storage:true, desc:'Monkeys deposit resources here.'},
  workbench: {name:'Workbench', cost:{wood:6, stone:2}, progress:7, solid:true, station:'workbench', desc:'Queue better tools and gear.'},
  bed: {name:'Leaf Bed', cost:{wood:4, fiber:5}, progress:5, solid:true, desc:'Save point and respawn anchor.'},
  wall: {name:'Palisade Wall', cost:{wood:2, stone:1}, progress:4, solid:true, hp:90, desc:'Blocks raiders and funnels combat.'},
  torch: {name:'Standing Torch', cost:{wood:1, fiber:1}, progress:3, solid:false, light:150, desc:'Cheap night light.'},
  forge: {name:'Stone Forge', cost:{stone:8, iron:2}, progress:8, solid:true, light:170, station:'forge', desc:'Metal tools and strong weapons.'},
  raft: {name:'Island Raft', cost:{wood:12, fiber:8}, progress:10, solid:true, desc:'Sail to a fresh neighbouring island.'}
};

const CRAFT_RECIPES = {
  monkey_munch: {name:'Monkey Munch', cost:{berry:2, banana:1}, result:{monkey_munch:1}, craftTime:0, desc:'Tames monkeys.'},
  cooked_meal: {name:'Cooked Meal', cost:{berry:2, wood:1}, result:{cooked_meal:1}, craftTime:0, stationNear:'campfire', desc:'Restores a lot of hunger.'},
  pickaxe: {name:'Pebble Pickaxe', cost:{wood:2, stone:3, fiber:1}, result:{pickaxe:1}, craftTime:5, station:'workbench', desc:'Mines rock and ore.'},
  sword: {name:'Bone Sword', cost:{wood:1, stone:2, fiber:2}, result:{sword:1}, craftTime:5, station:'workbench', desc:'Simple defensive weapon.'},
  metal_sword: {name:'Metal Sword', cost:{wood:1, iron:4, core:1}, result:{metal_sword:1}, craftTime:8, station:'forge', desc:'Heavy damage. Requires a core.'},
  forge_unlock: {name:'Forge Plans', cost:{stone:5, iron:1}, result:{}, unlockBuild:'forge', craftTime:6, station:'workbench', desc:'Unlocks the forge blueprint.'}
};

const QUESTS = [
  'Scavenge wood, stone and fiber.',
  'Build a chest and train a monkey to gather.',
  'Build a workbench and queue a sword.',
  'Find a vault, beat the boss, and claim an Ancient Core.',
  'Repair the wrecked galleon to escape.'
];

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function lerp(a,b,t){ return a + (b-a)*t; }
function dist2(a,b,c,d){ const x=a-c, y=b-d; return x*x+y*y; }
function distance(a,b,c,d){ return Math.sqrt(dist2(a,b,c,d)); }
function randRange(rng,a,b){ return a + (b-a)*rng(); }
function choice(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }
function nowId(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function formatCost(cost){ return Object.entries(cost).map(([k,v]) => `${v} ${itemName(k)}`).join(', '); }
function itemName(id){ return (ITEM_INFO[id] && ITEM_INFO[id].name) || (BUILD_RECIPES[id] && BUILD_RECIPES[id].name) || id.replace(/_/g,' '); }
function hash2(x, y, seed=0){
  let n = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
function mulberry32(a){
  return function(){
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function deepClone(o){ return JSON.parse(JSON.stringify(o)); }
function addToBag(bag, id, qty=1){ bag[id] = (bag[id] || 0) + qty; if (bag[id] <= 0) delete bag[id]; }
function hasCost(bag, cost){ return Object.entries(cost).every(([k,v]) => (bag[k]||0) >= v); }
function payCost(bag, cost){ if (!hasCost(bag, cost)) return false; for (const [k,v] of Object.entries(cost)) addToBag(bag, k, -v); return true; }
function bagSummary(bag){ return Object.entries(bag).filter(([,v])=>v>0).map(([k,v])=>`${v}× ${itemName(k)}`).join(', '); }

class Input {
  constructor(canvas){
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = {x:0, y:0, down:false, clicked:false, rightClicked:false, worldX:0, worldY:0};
    window.addEventListener('keydown', e => {
      const key = this.norm(e.key);
      if (!this.keys.has(key)) this.pressed.add(key);
      this.keys.add(key);
      if ([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys.delete(this.norm(e.key)); });
    canvas.addEventListener('mousemove', e => this.updateMouse(e));
    canvas.addEventListener('mousedown', e => {
      this.updateMouse(e);
      if (e.button === 0) { this.mouse.down = true; this.mouse.clicked = true; }
      if (e.button === 2) { this.mouse.rightClicked = true; }
    });
    window.addEventListener('mouseup', e => { if (e.button === 0) this.mouse.down = false; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }
  norm(k){ if (k === ' ') return 'space'; return String(k).toLowerCase(); }
  updateMouse(e){
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = (e.clientX - r.left) * (this.canvas.width / r.width);
    this.mouse.y = (e.clientY - r.top) * (this.canvas.height / r.height);
  }
  down(k){ return this.keys.has(k.toLowerCase()); }
  hit(k){ return this.pressed.has(k.toLowerCase()); }
  endFrame(){ this.pressed.clear(); this.mouse.clicked = false; this.mouse.rightClicked = false; }
}

class Art {
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
      for (let i=0;i<20;i++){
        const h = hash2(tx*31+i,ty*17+i,11); const h2 = hash2(tx*13+i,ty*23+i,4);
        ctx.fillStyle = h > .55 ? COLORS.grassLight : COLORS.grassDark;
        ctx.fillRect(x + Math.floor(h*TILE), y + Math.floor(h2*TILE), h>.7?2:1, h2>.6?2:1);
      }
      if (type==='grass2'){
        for (let i=0;i<3;i++){
          ctx.fillStyle = ['#d84165','#f2d66b','#7c4dcc'][i];
          ctx.fillRect(x+4+Math.floor(hash2(tx+i,ty,99)*24), y+4+Math.floor(hash2(tx,ty+i,98)*24),2,2);
        }
      }
    } else if (type === 'sand') {
      fill(COLORS.sand);
      for (let i=0;i<18;i++){
        const h=hash2(tx*3+i,ty*7-i,3), h2=hash2(tx*5-i,ty*11+i,8);
        ctx.fillStyle = h>.5 ? COLORS.sandLight : COLORS.sandDark;
        ctx.fillRect(x+Math.floor(h*TILE), y+Math.floor(h2*TILE), h>.7?3:1, 1);
      }
    } else if (type === 'water' || type === 'shallow') {
      fill(type==='water' ? COLORS.water : COLORS.shallow);
      for (let i=0;i<7;i++){
        const yy = (Math.floor(hash2(tx+i,ty-i,4)*TILE) + Math.floor(time*16+i*5)) % TILE;
        ctx.fillStyle = i%2 ? COLORS.waterDark : COLORS.waterLight;
        ctx.globalAlpha = type==='water' ? .55 : .45;
        ctx.fillRect(x+Math.floor(hash2(tx-i,ty+i,5)*TILE), y+yy, 6+Math.floor(hash2(tx+i,ty+i,7)*8), 1);
        ctx.globalAlpha = 1;
      }
    } else if (type === 'stone' || type === 'floor') {
      fill(type==='floor'?'#917d60':COLORS.stone);
      ctx.strokeStyle = type==='floor'?'#5d5142':COLORS.stoneDark; ctx.lineWidth=1;
      for (let yy=0; yy<=TILE; yy+=8){ ctx.beginPath(); ctx.moveTo(x,y+yy); ctx.lineTo(x+TILE,y+yy); ctx.stroke(); }
      for (let xx=0; xx<=TILE; xx+=10){ ctx.beginPath(); ctx.moveTo(x+xx+(ty%2)*4,y); ctx.lineTo(x+xx+((ty+1)%2)*4,y+TILE); ctx.stroke(); }
      for (let i=0;i<8;i++){ ctx.fillStyle=COLORS.stoneLight; ctx.fillRect(x+Math.floor(hash2(tx+i,ty,41)*TILE), y+Math.floor(hash2(tx,ty+i,42)*TILE),1,1); }
    } else if (type === 'path') {
      fill('#9a8558');
      for(let i=0;i<24;i++){ const h=hash2(tx+i,ty-i,22), h2=hash2(tx-i,ty+i,23); ctx.fillStyle=h>.55?'#b2a476':'#6e6147'; ctx.beginPath(); ctx.ellipse(x+h*TILE,y+h2*TILE,1+h*2,1+h2*2,0,0,TWO_PI); ctx.fill(); }
    } else if (type === 'swamp') {
      fill('#486b3d');
      for(let i=0;i<12;i++){ const h=hash2(tx+i,ty,31), h2=hash2(tx,ty+i,32); ctx.fillStyle=h>.5?'#75b069':'#2e4f31'; ctx.globalAlpha=.7; ctx.fillRect(x+h*TILE,y+h2*TILE,3,1); ctx.globalAlpha=1; }
    } else if (type === 'ash') {
      fill('#615549');
      for(let i=0;i<16;i++){ const h=hash2(tx+i,ty,35), h2=hash2(tx,ty+i,36); ctx.fillStyle=h>.7?'#a26331':(h>.4?'#887864':'#403b38'); ctx.fillRect(x+h*TILE,y+h2*TILE,h>.5?2:1,1); }
    } else if (type === 'lava') {
      fill('#5e241f');
      for(let i=0;i<8;i++){ const h=hash2(tx+i,ty,39), h2=hash2(tx,ty+i,40); ctx.strokeStyle=h>.55?'#ffcc45':'#ff7a25'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+h*TILE,y+h2*TILE); ctx.lineTo(x+h*TILE+8,y+h2*TILE+(h-.5)*4); ctx.stroke(); }
    } else if (type === 'walltile') {
      fill('#3c3732');
      ctx.fillStyle='#504941'; ctx.fillRect(x,y+20,TILE,12); ctx.strokeStyle='#201b19'; for(let xx=0;xx<TILE;xx+=8){ctx.strokeRect(x+xx,y+4,8,12);} ctx.strokeRect(x,y+4,TILE,24);
    }
  }
  drawTile(ctx,type,x,y,tx,ty,time){
    const key=TILE_ASSET_KEYS[type];
    if(key && this.drawTileAsset(ctx,key,x,y)) return;
    if (type==='water' || type==='shallow' || type==='lava') this.drawTilePattern(ctx,type,x,y,tx,ty,time);
    else ctx.drawImage(this.tileCanvases[type] || this.tileCanvases.grass, Math.round(x), Math.round(y));
  }
  shadow(ctx,x,y,w=34,h=12,a=.28){ ctx.save(); ctx.fillStyle=`rgba(0,0,0,${a})`; ctx.beginPath(); ctx.ellipse(x,y,w,h,0,0,TWO_PI); ctx.fill(); ctx.restore(); }
  outlineRect(ctx,x,y,w,h,c=COLORS.ink){ ctx.strokeStyle=c; ctx.lineWidth=2; ctx.strokeRect(Math.round(x)+.5,Math.round(y)+.5,Math.round(w),Math.round(h)); }
  drawPlayer(ctx,x,y,dir='down',walk=0,charge=0,tool='hand',facing='right',attackCd=0){
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
    ctx.save(); ctx.translate(Math.round(x),Math.round(y));
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
    if (charge>0){ ctx.strokeStyle=`rgba(255,216,90,${.25+charge*.5})`; ctx.lineWidth=2+charge*4; ctx.beginPath(); ctx.arc(0,-4,18+charge*8,0,TWO_PI); ctx.stroke(); }
    ctx.restore();
  }
  drawMonkey(ctx,x,y,walk=0,order=null,selected=false,entity=null){
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
    ctx.save(); ctx.translate(Math.round(x),Math.round(y));
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
      const flip = entity?.facing==='left';
      this.shadow(ctx,x,y+4,boss?24:15,boss?7:5,.3);
      if(this.drawAsset(ctx,id,x,y+9,{anchor:'ground',flip})) return;
    }
    this.shadow(ctx,x,y+3,boss?24:15,boss?8:5,.32);
    ctx.save(); ctx.translate(Math.round(x),Math.round(y)); const s=boss?1.45:1; const bob=Math.sin(walk*6)*1.3;
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
    this.shadow(ctx,x,y+2,22,8,.3);
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
    this.shadow(ctx,x,y+3,18,6,.28); ctx.save(); ctx.translate(Math.round(x),Math.round(y));
    ctx.fillStyle=iron?'#66777b':COLORS.stoneDark; ctx.beginPath(); ctx.ellipse(0,0,20,12,0,0,TWO_PI); ctx.fill();
    ctx.fillStyle=iron?'#8ca1a2':COLORS.stone; ctx.beginPath(); ctx.moveTo(-19,2); ctx.lineTo(-10,-12); ctx.lineTo(5,-17); ctx.lineTo(20,-5); ctx.lineTo(17,9); ctx.lineTo(-12,13); ctx.closePath(); ctx.fill(); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle=iron?'#c0dddd':COLORS.stoneLight; ctx.beginPath(); ctx.moveTo(-10,-12); ctx.lineTo(1,-20); ctx.lineTo(5,-17); ctx.lineTo(-3,-4); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  drawBush(ctx,x,y){
    this.shadow(ctx,x,y+2,15,5,.2); ctx.save(); ctx.translate(Math.round(x),Math.round(y));
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
    this.shadow(ctx,item.sx,item.sy+6,10,3,.18); ctx.save(); ctx.translate(Math.round(item.sx),Math.round(item.sy+bob));
    const iconKey=ICON_ASSET_KEYS[item.type];
    if(iconKey && this.sprites[iconKey]) this.drawAsset(ctx,iconKey,0,0,{anchor:'center',scale:.78}); else this.drawIconShape(ctx,item.type,0,0,0.72);
    if (item.qty > 1){ ctx.font='bold 10px monospace'; ctx.fillStyle='white'; ctx.strokeStyle='black'; ctx.lineWidth=3; ctx.strokeText(String(item.qty),7,8); ctx.fillText(String(item.qty),7,8); }
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
      this.shadow(ctx,x,y+7,type==='galleon'?52:(type==='vault'?38:24),type==='galleon'?10:7,.22);
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

class World {
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
  static fromData(data){ const w=new World(data.seed,data.kind,data.island); w.resources=data.resources||[]; w.items=data.items||[]; w.buildings=data.buildings||[]; w.blueprints=data.blueprints||[]; w.enemies=[]; w.defeatedVault=!!data.defeatedVault; return w; }
}
function typeRadius(type){ return {chest:24,workbench:32,campfire:20,bed:30,wall:32,forge:30,raft:42,vault:46,galleon:58,cage:28,totem:22}[type] || 20; }

class Game {
  constructor(canvas){
    this.canvas=canvas; this.ctx=canvas.getContext('2d'); this.ctx.imageSmoothingEnabled=false;
    this.input=new Input(canvas); this.art=new Art();
    this.camera={x:0,y:0}; this.messages=[]; this.particles=[]; this.floatText=[]; this.uiButtons=[];
    this.seed=(Date.now() ^ 0x513ad) & 0x7fffffff; this.overworld=new World(this.seed,'overworld',1); this.world=this.overworld; this.dungeonReturn=null;
    this.player={x:this.world.spawn.x,y:this.world.spawn.y,dir:'down',facing:'right',walk:0,health:100,maxHealth:100,hunger:86,maxHunger:100,stamina:100,maxStamina:100,inv:{axe:1,pickaxe:1,hammer:1,berry:3,monkey_munch:1},attackCd:0,invuln:0,charge:0,onRaft:false,respawn:{x:this.world.spawn.x,y:this.world.spawn.y}};
    this.monkeys=[]; this.selectedSlot=0; this.currentBuild='campfire'; this.craftOpen=false; this.helpOpen=false; this.assetOpen=false; this.assetPage=0; this.paused=false; this.gameOver=false; this.win=false;
    this.unlocked={craft:{monkey_munch:true,cooked_meal:true,pickaxe:true,sword:true}, build:{campfire:true,chest:true,workbench:true,bed:true,wall:true,torch:true,raft:true}};
    this.mimic={active:false,monkey:null,phase:'idle'};
    this.time=.28; this.day=1; this.dayTimer=0; this.raidTimer=180; this.questIndex=0; this.island=1;
    this.message('Welcome. Build a camp, tame monkeys, raid a vault, repair the galleon.');
    if(localStorage.getItem(SAVE_KEY)) this.message('Save found: press L to load, or N for a fresh island.');
  }
  resize(){
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.canvas.height = Math.floor(window.innerHeight * dpr);
    this.ctx.imageSmoothingEnabled=false;
  }
  start(){
    this.resize(); window.addEventListener('resize',()=>this.resize());
    let last=performance.now();
    const loop=(ts)=>{ const dt=Math.min((ts-last)/1000,.05); last=ts; this.update(dt); this.render(); this.input.endFrame(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  message(text, color=COLORS.white){ this.messages.unshift({text,color,t:5}); this.messages=this.messages.slice(0,6); }
  addFloat(text,x,y,color=COLORS.white){ this.floatText.push({text,x,y,t:1.2,color}); }
  update(dt){
    const input=this.input;
    input.mouse.worldX = input.mouse.x + this.camera.x; input.mouse.worldY = input.mouse.y + this.camera.y;
    if(input.hit('f1')) this.helpOpen=!this.helpOpen;
    if(input.hit('escape')) { if(this.craftOpen) this.craftOpen=false; else this.helpOpen=!this.helpOpen; }
    if(input.hit('l')) this.loadGame(); if(input.hit('n')) this.newGame();
    if(this.win || this.gameOver){ if(input.hit('enter')) this.newGame(); return; }
    if(this.craftOpen){ this.updateCraftMenuInput(); }
    else this.handleHotkeys();
    if(!this.craftOpen && !this.assetOpen && !this.paused) this.updateWorld(dt);
    for(const m of this.messages) m.t-=dt; this.messages=this.messages.filter(m=>m.t>0);
    for(const f of this.floatText){ f.t-=dt; f.y-=28*dt; } this.floatText=this.floatText.filter(f=>f.t>0);
  }
  handleHotkeys(){
    const input=this.input;
    if(input.hit('v')) { this.assetOpen=!this.assetOpen; this.message(this.assetOpen?'Asset viewer opened. [ / ] pages, V closes.':'Asset viewer closed.'); }
    if(this.assetOpen){ if(input.hit('[')) this.assetPage=(this.assetPage+SHEET_ORDER.length-1)%SHEET_ORDER.length; if(input.hit(']')) this.assetPage=(this.assetPage+1)%SHEET_ORDER.length; return; }
    for(let i=0;i<10;i++) if(input.hit(String((i+1)%10))) this.selectedSlot=i;
    if(input.hit('[')) this.selectedSlot=(this.selectedSlot+HOTBAR.length-1)%HOTBAR.length;
    if(input.hit(']')) this.selectedSlot=(this.selectedSlot+1)%HOTBAR.length;
    if(input.hit('tab')) this.selectedSlot=(this.selectedSlot+1)%HOTBAR.length;
    if(input.hit('b')) this.cycleBuild();
    if(input.hit('f')) this.placeBlueprint();
    if(input.hit('c')) this.craftOpen=true;
    if(input.hit('m')) this.toggleMimic();
    if(input.hit('e')) this.tryInteract();
    if(input.hit('space') || input.mouse.clicked) this.tryAction(input.mouse.clicked);
    if(input.mouse.rightClicked) this.placeBlueprintAt(input.mouse.worldX,input.mouse.worldY);
  }
  updateWorld(dt){
    this.time += dt/420; if(this.time>=1){ this.time-=1; this.day++; this.message(`Day ${this.day}. The island shifts with the tide.`); }
    this.raidTimer -= dt; if(this.raidTimer<=0){ this.startRaid(); this.raidTimer = 240 + this.day*35; }
    this.updatePlayer(dt); this.updateItems(dt); this.updateParticles(dt); this.updateMonkeys(dt); this.updateEnemies(dt); this.updateBlueprints(); this.updateQuest();
    this.camera.x = clamp(this.player.x - this.canvas.width/2, 0, this.world.w*TILE - this.canvas.width);
    this.camera.y = clamp(this.player.y - this.canvas.height/2, 0, this.world.h*TILE - this.canvas.height);
  }
  updatePlayer(dt){
    const p=this.player, input=this.input;
    let dx=0,dy=0; if(input.down('w')||input.down('arrowup')) dy--; if(input.down('s')||input.down('arrowdown')) dy++; if(input.down('a')||input.down('arrowleft')) dx--; if(input.down('d')||input.down('arrowright')) dx++;
    if(dx||dy){ const len=Math.hypot(dx,dy); dx/=len; dy/=len; if(Math.abs(dx)>.05) p.facing=dx<0?'left':'right'; p.dir=Math.abs(dx)>Math.abs(dy)?'side':(dy<0?'up':'down'); p.walk += dt*(p.onRaft?4:7); const sprint=input.down('shift') && p.stamina>5 && p.hunger>0; let speed=(p.onRaft?125:112)*(sprint?1.45:1); if(sprint) p.stamina=Math.max(0,p.stamina-18*dt); this.moveEntity(p,dx*speed*dt,dy*speed*dt,{onRaft:p.onRaft}); }
    p.attackCd=Math.max(0,p.attackCd-dt); p.invuln=Math.max(0,p.invuln-dt);
    p.hunger=Math.max(0,p.hunger-dt*(p.onRaft ? .9 : .55));
    if(p.hunger<=0) this.damagePlayer(4*dt); else p.stamina=clamp(p.stamina+24*dt,0,p.maxStamina);
    const tile=this.world.tile(Math.floor(p.x/TILE),Math.floor(p.y/TILE));
    if(tile==='swamp' && !p.onRaft){ p.stamina=Math.max(0,p.stamina-10*dt); if(Math.random()<dt*.25) this.addFloat('poison fumes',p.x,p.y-40,'#b8ff78'); }
    if(tile==='ash' && !p.onRaft && Math.random()<dt*.2) { this.damagePlayer(2); this.addFloat('hot ash',p.x,p.y-40,COLORS.orange); }
  }
  moveEntity(e,dx,dy,opts={}){
    const r=opts.radius||10; const w=this.world;
    if(!w.isBlocked(e.x+dx,e.y,r,opts)) e.x+=dx;
    if(!w.isBlocked(e.x,e.y+dy,r,opts)) e.y+=dy;
    e.x=clamp(e.x,8,w.w*TILE-8); e.y=clamp(e.y,8,w.h*TILE-8);
  }
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
    if(picked.length){ this.message(`Picked up ${picked.join(', ')}.`); this.recordAction({kind:'pickup'}); return; }
    // Tame monkey from cage or wild.
    const cage=w.nearestBuilding(p.x,p.y,b=>b.type==='cage'&&b.cagedMonkey,58);
    if(cage){ if((p.inv.monkey_munch||0)>0){ addToBag(p.inv,'monkey_munch',-1); cage.cagedMonkey=false; const m=this.spawnMonkey(cage.x,cage.y-10,true); this.message(`${m.name} joined your crew. Press M to teach it.`); this.recordAction({kind:'tame'}); } else this.message('A monkey rattles the cage. It wants Monkey Munch.'); return; }
    const wild=this.nearestMonkey(p.x,p.y,48,m=>!m.tamed);
    if(wild){ if((p.inv.monkey_munch||0)>0){ addToBag(p.inv,'monkey_munch',-1); wild.tamed=true; wild.name=this.nextMonkeyName(); this.message(`${wild.name} has been tamed. Press M to teach it.`); } else this.message('The monkey sniffs your pack. Craft Monkey Munch to tame it.'); return; }
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
        if(moved) { this.message(`Deposited ${moved}. Hold Shift+E to withdraw.`); this.recordAction({kind:'deposit',buildingType:'chest'}); }
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
    const target=this.findActionTarget(fromMouse);
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
  consumeStamina(cost){ if(this.player.stamina<cost){ this.message('Too tired. Let stamina refill.'); return false; } this.player.stamina-=cost; this.player.attackCd=.24; return true; }
  findActionTarget(fromMouse=false){
    const p=this.player; const tx=fromMouse?this.input.mouse.worldX:p.x+(p.dir==='side'?34:0), ty=fromMouse?this.input.mouse.worldY:p.y+(p.dir==='up'?-34:p.dir==='down'?34:0);
    const maxReach=fromMouse?86:58;
    let bestResource=null, bestEnemy=null, br=99999, be=99999;
    for(const r of this.world.resources){ const d=dist2(tx,ty,r.x,r.y); const pr=dist2(p.x,p.y,r.x,r.y); if(d<br && pr<maxReach*maxReach){ br=d; bestResource=r; } }
    for(const e of this.world.enemies){ const d=dist2(tx,ty,e.x,e.y); const pr=dist2(p.x,p.y,e.x,e.y); if(d<be && pr<(maxReach+8)*(maxReach+8)){ be=d; bestEnemy=e; } }
    return {resource: br<be?bestResource:null, enemy: be<=br?bestEnemy:null};
  }
  eat(item){
    const p=this.player; if((p.inv[item]||0)<=0){ this.message(`You have no ${itemName(item)}.`); return; }
    const food=ITEM_INFO[item]?.food || 44; addToBag(p.inv,item,-1); p.hunger=clamp(p.hunger+food,0,p.maxHunger); p.health=clamp(p.health+food*.22,0,p.maxHealth); this.addFloat(`+${food} food`,p.x,p.y-48,COLORS.yellow); this.message(`Ate ${itemName(item)}.`);
  }
  hitResource(r,power,tool){
    r.hp-=power; this.emitChips(r.x,r.y-18,r.type==='tree'?COLORS.wood:(r.type==='bush'?COLORS.grassLight:COLORS.stoneLight),8); this.addFloat('-',r.x,r.y-30,'#fff');
    if(r.hp<=0){
      if(r.type==='tree'){ this.world.addItem('wood',r.x,r.y,2+Math.floor(Math.random()*3)); this.world.addItem('fiber',r.x+8,r.y,1+Math.floor(Math.random()*2)); if(Math.random()<.35) this.world.addItem('banana',r.x-8,r.y,1); }
      else if(r.type==='rock'){ this.world.addItem('stone',r.x,r.y,2+Math.floor(Math.random()*3)); if(Math.random()<.18) this.world.addItem('iron',r.x+8,r.y,1); }
      else if(r.type==='iron'){ this.world.addItem('iron',r.x,r.y,2+Math.floor(Math.random()*2)); this.world.addItem('stone',r.x+8,r.y,1+Math.floor(Math.random()*2)); }
      else if(r.type==='bush'){ this.world.addItem('berry',r.x,r.y,1+Math.floor(Math.random()*3)); this.world.addItem('fiber',r.x+7,r.y,1); }
      this.world.removeResource(r.id); this.message(`${itemName(tool)} harvested ${r.type}.`);
    }
  }
  attackEnemy(e,weapon){
    const dmg = weapon==='metal_sword'?32:(weapon==='sword'?20:(weapon==='axe'?12:6)); if(!this.consumeStamina(weapon==='metal_sword'?16:12)) return;
    e.hp-=dmg; e.hitFlash=.15; this.emitChips(e.x,e.y-18, e.type==='boss'?'#ff6a55':'#9cff83',10); this.addFloat(`-${dmg}`,e.x,e.y-35,COLORS.white);
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
  onBuildComplete(type){ if(type==='workbench'){ this.unlocked.craft.pickaxe=true; this.unlocked.craft.sword=true; this.message('Discovery: Workbench recipes unlocked. Queue tools from C.'); } if(type==='forge') this.unlocked.craft.metal_sword=true; if(type==='raft') this.message('Raft ready. Interact with it to sail to another island.'); }
  placeBlueprint(){
    const item=this.currentHotbarItem(); const type=BUILD_RECIPES[item]?item:this.currentBuild; this.placeBlueprintAt(this.player.x + (this.player.dir==='side'?42:0), this.player.y + (this.player.dir==='up'?-42:this.player.dir==='down'?42:0), type);
  }
  placeBlueprintAt(wx,wy,type=null){
    type=type||this.currentBuild; if(!this.unlocked.build[type]){ this.message('Blueprint locked.'); return; }
    const tx=Math.floor(wx/TILE), ty=Math.floor(wy/TILE); const x=tx*TILE+16, y=ty*TILE+24;
    if(this.world.isBlocked(x,y,22,{onRaft:false}) || this.world.tile(tx,ty)==='water' || this.world.tile(tx,ty)==='lava'){ this.message('Cannot place blueprint there.'); return; }
    const bp=this.world.addBlueprint(type,x,y); this.message(`${BUILD_RECIPES[type].name} blueprint placed. Press E to add resources, hammer to build.`); this.recordAction({kind:'place_blueprint',blueprintType:type}); return bp;
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
    this.message(`Crafted ${r.name}.`);
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
  startRaid(){
    if(this.world.kind!=='overworld') return;
    const count=2+Math.floor(this.day/2); this.message(`Raid! ${count} goblins are attacking your camp.`, COLORS.orange);
    for(let i=0;i<count;i++){
      const side=Math.floor(Math.random()*4); let x,y;
      if(side===0){x=1*TILE;y=Math.random()*this.world.h*TILE;} else if(side===1){x=(this.world.w-2)*TILE;y=Math.random()*this.world.h*TILE;} else if(side===2){x=Math.random()*this.world.w*TILE;y=1*TILE;} else {x=Math.random()*this.world.w*TILE;y=(this.world.h-2)*TILE;}
      this.world.addEnemy('goblin',x,y,{raid:true});
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
      if(d>28){ const speed=e.type==='boss'?50:70; const vx=(target.x-e.x)/d, vy=(target.y-e.y)/d; if(Math.abs(vx)>.15) e.facing=vx<0?'left':'right'; else e.facing=vy<0?'up':'down'; this.moveEntity(e,vx*speed*dt,vy*speed*dt,{radius:e.type==='boss'?16:10}); e.walk+=dt; }
      else if(e.attackCd<=0){ e.attackCd=e.type==='boss'?1.2:.85; if(target.type==='player') this.damagePlayer(e.type==='boss'?22:10); else if(target.type==='monkey') this.damageMonkey(target.ref,e.type==='boss'?20:8); else if(target.type==='building') this.damageBuilding(target.ref,e.type==='boss'?22:8); }
    }
  }
  damagePlayer(amount){ const p=this.player; if(p.invuln>0 && amount>=1) return; p.health-=amount; if(amount>=1) { p.invuln=.55; this.addFloat(`-${Math.ceil(amount)}`,p.x,p.y-48,COLORS.red); } if(p.health<=0){ this.playerDeath(); } }
  damageMonkey(m,amt){ m.hp-=amt; this.addFloat('ouch',m.x,m.y-34,COLORS.red); if(m.hp<=0){ m.hp=m.maxHp; m.x=this.player.x+20; m.y=this.player.y+20; m.order=null; this.message(`${m.name} fled, recovered, and forgot its task.`); } }
  damageBuilding(b,amt){ if(!b.hp || b.hp>900) b.hp=BUILD_RECIPES[b.type]?.hp||90; b.hp-=amt; this.emitChips(b.x,b.y-10,COLORS.wood,4); if(b.hp<=0){ const i=this.world.buildings.indexOf(b); if(i>=0) this.world.buildings.splice(i,1); this.message(`${itemName(b.type)} was destroyed!`); } }
  playerDeath(){ this.player.health=this.player.maxHealth; this.player.hunger=Math.max(35,this.player.hunger); this.player.stamina=this.player.maxStamina; this.player.x=this.player.respawn.x; this.player.y=this.player.respawn.y; this.message('You collapsed and woke up at your bed/spawn.', COLORS.red); }
  spawnMonkey(x,y,tamed=false){ const m={id:nowId(),x,y,tamed,name:tamed?this.nextMonkeyName():'Wild Monkey',hp:55,maxHp:55,walk:0,order:null,carry:null,attackCd:0,actCd:0,target:null,wander:Math.random()*TWO_PI}; this.monkeys.push(m); return m; }
  nextMonkeyName(){ const names=['Momo','Pip','Bongo','Kiki','Nana','Tiko','Bibi','Coco']; return names[this.monkeys.filter(m=>m.tamed).length%names.length]; }
  nearestMonkey(x,y,maxD,pred=null){ let best=null,bd=maxD*maxD; for(const m of this.monkeys){ if(pred && !pred(m)) continue; const d=dist2(x,y,m.x,m.y); if(d<bd){bd=d;best=m;} } return best; }
  updateMonkeys(dt){
    // Spawn visible caged monkeys as entities if cage opened already. Wild ambient monkeys.
    if(this.monkeys.length<1 && this.world.kind==='overworld') this.spawnMonkey(this.world.spawn.x+90,this.world.spawn.y+80,false);
    for(const m of this.monkeys){ m.attackCd=Math.max(0,m.attackCd-dt); m.actCd=Math.max(0,m.actCd-dt); m.walk+=dt; if(!m.tamed){ this.updateWildMonkey(m,dt); continue; } if(!m.order) this.monkeyFollow(m,dt); else this.updateMonkeyOrder(m,dt); }
  }
  updateWildMonkey(m,dt){ m.wander += (Math.random()-.5)*dt*2; if(Math.random()<dt*.05) m.wander=Math.random()*TWO_PI; const vx=Math.cos(m.wander), vy=Math.sin(m.wander); if(Math.abs(vx)>.15) m.facing=vx<0?'left':'right'; else m.facing=vy<0?'up':'down'; this.moveEntity(m,vx*22*dt,vy*22*dt,{radius:9}); }
  monkeyFollow(m,dt){ const p=this.player; const d=distance(m.x,m.y,p.x,p.y); if(d>55){ const vx=(p.x-m.x)/d, vy=(p.y-m.y)/d; if(Math.abs(vx)>.15) m.facing=vx<0?'left':'right'; else m.facing=vy<0?'up':'down'; this.moveEntity(m,vx*86*dt,vy*86*dt,{radius:9}); } }
  updateMonkeyOrder(m,dt){
    if(m.order.type==='harvest') this.monkeyHarvest(m,dt);
    else if(m.order.type==='gather') this.monkeyGather(m,dt);
    else if(m.order.type==='build') this.monkeyBuild(m,dt);
    else if(m.order.type==='craft') this.monkeyCraft(m,dt);
    else if(m.order.type==='combat') this.monkeyCombat(m,dt);
  }
  monkeyMoveTo(m,x,y,speed,dt){ const d=distance(m.x,m.y,x,y); if(d>4){ const vx=(x-m.x)/d, vy=(y-m.y)/d; if(Math.abs(vx)>.15) m.facing=vx<0?'left':'right'; else m.facing=vy<0?'up':'down'; this.moveEntity(m,vx*speed*dt,vy*speed*dt,{radius:9}); } return d; }
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
    const chest=this.world.nearestBuilding(m.x,m.y,b=>b.type==='chest',99999); if(!chest){ if(distance(m.x,m.y,this.player.x,this.player.y)>36) this.monkeyMoveTo(m,this.player.x,this.player.y,85,dt); else { this.world.addItem(m.carry.type,m.x,m.y,m.carry.qty); m.carry=null; } return; }
    const d=this.monkeyMoveTo(m,chest.x,chest.y,86,dt); if(d<35){ chest.storage=chest.storage||{}; addToBag(chest.storage,m.carry.type,m.carry.qty); this.addFloat(`${m.carry.qty} ${itemName(m.carry.type)}`,chest.x,chest.y-36,COLORS.yellow); m.carry=null; }
  }
  monkeyGather(m,dt){ if(m.carry){ this.monkeyDepositCarry(m,dt); return; } const item=this.world.nearestItem(m.x,m.y,null,99999); if(!item){ this.monkeyFollow(m,dt); return; } const d=this.monkeyMoveTo(m,item.x,item.y,90,dt); if(d<24) this.monkeyPickupItem(m,item); }
  monkeyBuild(m,dt){
    const bp=this.world.nearestBlueprint(m.x,m.y,null,99999); if(!bp){ this.monkeyFollow(m,dt); return; }
    if(m.carry){ const before=m.carry.qty; this.addResourcesToBlueprint(bp,{[m.carry.type]:m.carry.qty},m); const added=before-((bp.cost[m.carry.type]||0)-(bp.added[m.carry.type]||0)); m.carry=null; return; }
    if(bp.ready){ const d=this.monkeyMoveTo(m,bp.x,bp.y,84,dt); if(d<42 && m.actCd<=0){ m.actCd=.65; this.hammerBlueprint(bp,m); } return; }
    const missing=this.missingCost(bp); const needType=Object.keys(missing)[0]; if(!needType){ return; }
    const item=this.world.nearestItem(m.x,m.y,it=>it.type===needType,99999); if(item){ const d=this.monkeyMoveTo(m,item.x,item.y,90,dt); if(d<24) this.monkeyPickupItem(m,item); return; }
    const chest=this.world.nearestBuilding(m.x,m.y,b=>b.type==='chest' && b.storage && (b.storage[needType]||0)>0,99999); if(chest){ const d=this.monkeyMoveTo(m,chest.x,chest.y,88,dt); if(d<35){ const qty=Math.min(5,chest.storage[needType]||0); addToBag(chest.storage,needType,-qty); m.carry={type:needType,qty}; } return; }
    this.monkeyFollow(m,dt);
  }
  monkeyCraft(m,dt){ const station=this.world.nearestBuilding(m.x,m.y,b=>(b.type==='workbench'||b.type==='forge')&&b.queue&&b.queue.length,99999); if(!station){ this.monkeyFollow(m,dt); return; } const d=this.monkeyMoveTo(m,station.x,station.y,82,dt); if(d<45 && m.actCd<=0){ m.actCd=.65; this.hammerStation(station,.75); } }
  monkeyCombat(m,dt){ const enemy=this.world.enemies.reduce((best,e)=>{ const d=dist2(m.x,m.y,e.x,e.y); return !best||d<best.d?{e,d}:best; },null); if(!enemy || Math.sqrt(enemy.d)>420){ this.monkeyFollow(m,dt); return; } const e=enemy.e; const d=this.monkeyMoveTo(m,e.x,e.y,98,dt); if(d<32 && m.attackCd<=0){ m.attackCd=.7; e.hp-=12; this.emitChips(e.x,e.y-18,'#9cff83',4); if(e.hp<=0) this.killEnemy(e); } }
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
    const cost={wood:16,fiber:10,iron:4,core:1}; if(hasCost(this.player.inv,cost)){ payCost(this.player.inv,cost); g.repaired=true; this.win=true; this.message('The galleon is repaired. You escaped!'); }
    else this.message(`Repair needs ${formatCost(cost)}.`);
  }
  sailToNewIsland(){
    if(this.world.kind!=='overworld') return;
    this.island++; this.seed=(this.seed+0x9e3779b9+this.island*1337)&0x7fffffff; this.world=new World(this.seed,'overworld',this.island); this.overworld=this.world; this.player.x=this.world.spawn.x; this.player.y=this.world.spawn.y; this.player.respawn={x:this.player.x,y:this.player.y};
    for(const m of this.monkeys.filter(m=>m.tamed)){ m.x=this.player.x+randRange(Math.random,-40,40); m.y=this.player.y+randRange(Math.random,-40,40); }
    this.message(`You sailed to Island ${this.island}. New resources and dangers await.`);
  }
  saveGame(){
    const data={seed:this.seed,island:this.island,world:this.world.serialize(),player:this.player,monkeys:this.monkeys,unlocked:this.unlocked,day:this.day,time:this.time,questIndex:this.questIndex};
    try{ localStorage.setItem(SAVE_KEY,JSON.stringify(data)); }catch(e){ this.message('Could not save: browser storage blocked.'); }
  }
  loadGame(){
    const raw=localStorage.getItem(SAVE_KEY); if(!raw){ this.message('No save found.'); return; }
    try{ const d=JSON.parse(raw); this.seed=d.seed; this.island=d.island||1; this.world=World.fromData(d.world); this.overworld=this.world.kind==='overworld'?this.world:this.overworld; this.player=d.player; this.monkeys=d.monkeys||[]; this.unlocked=d.unlocked||this.unlocked; this.day=d.day||1; this.time=d.time||.28; this.questIndex=d.questIndex||0; this.message('Loaded saved game.'); } catch(e){ this.message('Save failed to load. Starting fresh.'); }
  }
  newGame(){ localStorage.removeItem(SAVE_KEY); const fresh=new Game(this.canvas); Object.assign(this,fresh); this.resize(); this.message('New island generated.'); }
  render(){
    const ctx=this.ctx; ctx.clearRect(0,0,this.canvas.width,this.canvas.height); ctx.imageSmoothingEnabled=false;
    this.renderWorld(ctx); this.renderLighting(ctx); this.renderUI(ctx);
  }
  renderWorld(ctx){
    const w=this.world, cam=this.camera; const startX=Math.floor(cam.x/TILE)-1, endX=Math.ceil((cam.x+this.canvas.width)/TILE)+1; const startY=Math.floor(cam.y/TILE)-1, endY=Math.ceil((cam.y+this.canvas.height)/TILE)+1;
    for(let y=startY;y<=endY;y++) for(let x=startX;x<=endX;x++){ if(!w.inBounds(x,y)) continue; this.art.drawTile(ctx,w.tile(x,y),x*TILE-cam.x,y*TILE-cam.y,x,y,this.time*100); }
    // sort objects by ground Y
    const objects=[];
    for(const r of w.resources) objects.push({y:r.y,draw:()=>{r.sx=r.x-cam.x;r.sy=r.y-cam.y;this.art.drawResource(ctx,r); if(r.hp<r.maxHp) this.art.drawHealthBar(ctx,r.sx,r.sy-48,34,r.hp/r.maxHp,COLORS.yellow);}});
    for(const b of w.buildings) objects.push({y:b.y,draw:()=>{b.sx=b.x-cam.x;b.sy=b.y-cam.y;this.art.drawBuilding(ctx,b);}});
    for(const bp of w.blueprints) objects.push({y:bp.y,draw:()=>{bp.sx=bp.x-cam.x;bp.sy=bp.y-cam.y;this.art.drawBlueprint(ctx,bp);}});
    for(const it of w.items) objects.push({y:it.y,draw:()=>{it.sx=it.x-cam.x;it.sy=it.y-cam.y;this.art.drawItem(ctx,it);}});
    for(const e of w.enemies) objects.push({y:e.y,draw:()=>{const sx=e.x-cam.x,sy=e.y-cam.y;this.art.drawEnemy(ctx,sx,sy,e.walk,e.type==='boss',e); this.art.drawHealthBar(ctx,sx,sy-(e.type==='boss'?68:45),e.type==='boss'?56:34,e.hp/e.maxHp,e.type==='boss'?COLORS.purple:COLORS.red);}});
    for(const m of this.monkeys) objects.push({y:m.y,draw:()=>{const sx=m.x-cam.x,sy=m.y-cam.y;this.art.drawMonkey(ctx,sx,sy,m.walk,m.tamed?m.order:null,this.mimic.monkey===m,m); if(m.carry){this.art.drawIconShape(ctx,m.carry.type,sx+15,sy-40,.55);}}});
    objects.push({y:this.player.y,draw:()=>this.art.drawPlayer(ctx,this.player.x-cam.x,this.player.y-cam.y,this.player.dir,this.player.walk,this.player.charge,this.currentHotbarItem(),this.player.facing,this.player.attackCd)});
    objects.sort((a,b)=>a.y-b.y); for(const o of objects) o.draw();
    for(const p of this.particles){ ctx.fillStyle=p.color; ctx.globalAlpha=clamp(p.t/.7,0,1); ctx.fillRect(p.x-cam.x,p.y-cam.y,p.size,p.size); ctx.globalAlpha=1; }
    for(const f of this.floatText){ ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.globalAlpha=clamp(f.t,0,1); ctx.strokeStyle='black'; ctx.lineWidth=4; ctx.strokeText(f.text,f.x-cam.x,f.y-cam.y); ctx.fillStyle=f.color; ctx.fillText(f.text,f.x-cam.x,f.y-cam.y); ctx.globalAlpha=1; }
    this.renderCursorTooltip(ctx);
  }
  renderLighting(ctx){
    const night = this.nightAmount(); if(night<=.03) return;
    ctx.save(); ctx.fillStyle=`rgba(8,12,28,${night*.72})`; ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    ctx.globalCompositeOperation='destination-out';
    const lights=[]; for(const b of this.world.buildings){ const rec=BUILD_RECIPES[b.type]; if(rec && rec.light) lights.push({x:b.x-this.camera.x,y:b.y-this.camera.y-20,r:rec.light}); }
    lights.push({x:this.player.x-this.camera.x,y:this.player.y-this.camera.y-20,r:90});
    for(const l of lights){ const g=ctx.createRadialGradient(l.x,l.y,10,l.x,l.y,l.r); g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(l.x,l.y,l.r,0,TWO_PI); ctx.fill(); }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation='lighter'; for(const l of lights){ const g=ctx.createRadialGradient(l.x,l.y,5,l.x,l.y,l.r*.65); g.addColorStop(0,'rgba(255,166,55,.20)'); g.addColorStop(1,'rgba(255,166,55,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(l.x,l.y,l.r*.65,0,TWO_PI); ctx.fill(); } ctx.restore();
  }
  nightAmount(){ const t=this.time; const d=Math.min(Math.abs(t-.5)*2,1); return clamp((d-.38)/.42,0,1); }
  renderUI(ctx){
    this.uiButtons=[];
    this.drawStats(ctx); this.drawHotbar(ctx); this.drawMinimap(ctx); this.drawMessages(ctx); this.drawQuest(ctx); this.drawMimicPanel(ctx);
    if(this.craftOpen) this.drawCraftMenu(ctx); if(this.helpOpen) this.drawHelp(ctx); if(this.assetOpen) this.drawAssetBrowser(ctx); if(this.win) this.drawWin(ctx); if(this.gameOver) this.drawGameOver(ctx);
  }
  panel(ctx,x,y,w,h,a=.84){
    if(this.art.assetsReady && this.art.sprites.ui_panel_medium){ ctx.save(); ctx.globalAlpha=a; ctx.drawImage(this.art.sprites.ui_panel_medium,Math.round(x),Math.round(y),Math.round(w),Math.round(h)); ctx.restore(); return; }
    ctx.fillStyle=`rgba(23,31,38,${a})`; ctx.fillRect(x,y,w,h); ctx.strokeStyle=COLORS.ink; ctx.lineWidth=3; ctx.strokeRect(x+.5,y+.5,w,h); ctx.strokeStyle='rgba(255,245,214,.28)'; ctx.lineWidth=1; ctx.strokeRect(x+4.5,y+4.5,w-8,h-8);
  }
  drawStats(ctx){
    const x=38,y=this.canvas.height-78; this.drawStatCircle(ctx,x,y,30,this.player.health/this.player.maxHealth,COLORS.red,'heart'); this.drawStatCircle(ctx,x+76,y,25,this.player.hunger/this.player.maxHunger,COLORS.yellow,'hunger'); this.drawStatCircle(ctx,this.canvas.width-58,y,30,this.player.stamina/this.player.maxStamina,'#37e052','stamina');
    ctx.font='bold 13px monospace'; ctx.textAlign='left'; ctx.fillStyle=COLORS.white; ctx.fillText(`Day ${this.day}  Island ${this.island}`,16,24); ctx.fillText(`${this.world.kind==='dungeon'?'VAULT':'OPEN WORLD'}  ${Math.floor(this.time*24).toString().padStart(2,'0')}:00`,16,43);
  }
  drawStatCircle(ctx,x,y,r,pct,color,icon){ ctx.save(); const ringKey=icon==='heart'?'ui_health_ring':(icon==='hunger'?'ui_hunger_ring':'ui_stamina_ring'); if(this.art.assetsReady && this.art.sprites[ringKey]) this.art.drawAsset(ctx,ringKey,x,y,{anchor:'center',w:r*2+14,h:r*2+14}); else { ctx.fillStyle='rgba(0,0,0,.45)'; ctx.beginPath(); ctx.arc(x,y,r+5,0,TWO_PI); ctx.fill(); ctx.strokeStyle='white'; ctx.lineWidth=4; ctx.globalAlpha=.25; ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.stroke(); ctx.globalAlpha=1; } ctx.strokeStyle=color; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(x,y,r,-Math.PI/2,-Math.PI/2+TWO_PI*clamp(pct,0,1)); ctx.stroke(); this.art.drawIconShape(ctx,icon,x,y,.72); ctx.restore(); }
  drawHotbar(ctx){
    const slot=50, gap=6, count=HOTBAR.length; const w=count*slot+(count-1)*gap; const x0=(this.canvas.width-w)/2, y=this.canvas.height-64;
    for(let i=0;i<count;i++){
      const x=x0+i*(slot+gap), id=HOTBAR[i]; const slotKey=i===this.selectedSlot?'ui_slot_selected':'ui_slot'; if(this.art.assetsReady && this.art.sprites[slotKey]) this.art.drawAsset(ctx,slotKey,x+slot/2,y+slot/2,{anchor:'center',w:slot,h:slot}); else { ctx.fillStyle=i===this.selectedSlot?'rgba(255,216,90,.36)':'rgba(14,22,30,.72)'; ctx.fillRect(x,y,slot,slot); ctx.strokeStyle=i===this.selectedSlot?COLORS.yellow:'rgba(255,255,255,.45)'; ctx.lineWidth=i===this.selectedSlot?4:2; ctx.strokeRect(x+.5,y+.5,slot,slot); } this.art.drawIconShape(ctx,id,x+slot/2,y+slot/2,.86);
      let qty=this.player.inv[id]||0; if(BUILD_RECIPES[id]) qty=this.unlocked.build[id]?'B':''; if(ITEM_INFO[id]?.tool && qty>0) qty=''; if(qty){ ctx.font='bold 12px monospace'; ctx.textAlign='right'; ctx.strokeStyle='black'; ctx.lineWidth=3; ctx.strokeText(String(qty),x+slot-5,y+slot-6); ctx.fillStyle='white'; ctx.fillText(String(qty),x+slot-5,y+slot-6); }
      ctx.font='bold 10px monospace'; ctx.textAlign='left'; ctx.fillStyle='rgba(255,255,255,.75)'; ctx.fillText(i===9?'0':String(i+1),x+4,y+12);
    }
    ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.white; const sel=this.currentHotbarItem(); ctx.fillText(itemName(sel),this.canvas.width/2,y-10);
  }
  drawMinimap(ctx){
    const r=78, x=this.canvas.width-102, y=96; ctx.save(); ctx.beginPath(); ctx.arc(x,y,r,0,TWO_PI); ctx.clip(); ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(x-r,y-r,r*2,r*2);
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
  drawQuest(ctx){ const text=QUESTS[this.questIndex]||QUESTS[0]; const x=this.canvas.width/2-250,y=16,w=500,h=42; this.panel(ctx,x,y,w,h,.56); ctx.font='bold 15px monospace'; ctx.textAlign='center'; ctx.fillStyle=COLORS.yellow; ctx.fillText('CURRENT QUEST',x+w/2,y+17); ctx.fillStyle=COLORS.white; ctx.fillText(text,x+w/2,y+34); }
  drawMimicPanel(ctx){
    const x=16,y=58,w=260,h=this.mimic.active?100:72; this.panel(ctx,x,y,w,h,.62); ctx.font='bold 14px monospace'; ctx.textAlign='left'; ctx.fillStyle=this.mimic.active?COLORS.yellow:COLORS.white; ctx.fillText('MIMIC MODE [M]',x+12,y+22); ctx.fillStyle=COLORS.white; const tamed=this.monkeys.filter(m=>m.tamed); ctx.fillText(`${tamed.length} monkey crew`,x+12,y+43); if(this.mimic.active){ ctx.fillStyle=COLORS.yellow; ctx.fillText(this.mimic.monkey?`${this.mimic.monkey.name} watching...`:'Press E near a monkey',x+12,y+66); ctx.fillStyle='rgba(255,255,255,.75)'; ctx.fillText('Then perform one action.',x+12,y+86); } else if(tamed.length){ ctx.fillStyle='rgba(255,255,255,.75)'; ctx.fillText('Press M to teach tasks.',x+12,y+62); }
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

const canvas=document.getElementById('game'); const game=new Game(canvas);
const boot=document.getElementById('boot'); const startBtn=document.getElementById('startBtn');
startBtn.addEventListener('click',async()=>{ startBtn.disabled=true; startBtn.textContent='Loading generated assets...'; await game.art.loadAssets(); boot.classList.add('hidden'); canvas.focus(); game.start(); });
canvas.addEventListener('click',()=>canvas.focus());

})();
