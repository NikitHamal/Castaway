// Shared constants, data tables and tiny utilities for the Castaway runtime.
export const TILE = 48;
export const USE_CURATED_UI_TEXTURES = false;
export const PLAYER_DRAW_HEIGHT = 60;
export const MONKEY_DRAW_HEIGHT = 50;
export const GOBLIN_DRAW_HEIGHT = 64;
export const BOSS_DRAW_HEIGHT = 96;
export const WORLD_W = 96;
export const WORLD_H = 96;
export const SAVE_KEY = 'castaway_mimics_save_v3';
export const SAVE_VERSION = 3;
export const ATTACK_COOLDOWN = 0.28;
export const TWO_PI = Math.PI * 2;
export const RENDER_SCALE_BASE = 1.35;

export const GENERATED_ASSETS = {
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
  "fx_poison": "assets/generated/curated/fx/fx_poison.png",
  "sw_idle_body": "assets/generated/curated/characters/swordsman/idle_body.png",
  "sw_idle_head": "assets/generated/curated/characters/swordsman/idle_head.png",
  "sw_idle_sword": "assets/generated/curated/characters/swordsman/idle_sword.png",
  "sw_idle_swordback": "assets/generated/curated/characters/swordsman/idle_sword_back.png",
  "sw_walk_body": "assets/generated/curated/characters/swordsman/walk_body.png",
  "sw_walk_head": "assets/generated/curated/characters/swordsman/walk_head.png",
  "sw_walk_sword": "assets/generated/curated/characters/swordsman/walk_sword.png",
  "sw_walk_swordback": "assets/generated/curated/characters/swordsman/walk_sword_back.png",
  "sw_attack_body": "assets/generated/curated/characters/swordsman/attack_body.png",
  "sw_attack_head": "assets/generated/curated/characters/swordsman/attack_head.png",
  "sw_attack_sword": "assets/generated/curated/characters/swordsman/attack_sword.png",
  "sw_attack_swordback": "assets/generated/curated/characters/swordsman/attack_sword_back.png"
};
export const GENERATED_SHEETS = {
  "characters": "assets/generated/sheets/characters.png",
  "terrain": "assets/generated/sheets/terrain.png",
  "world_buildables": "assets/generated/sheets/world_buildables.png",
  "items_icons": "assets/generated/sheets/items_icons.png",
  "biomes_dungeon": "assets/generated/sheets/biomes_dungeon.png",
  "poi_interiors": "assets/generated/sheets/poi_interiors.png",
  "ui_kit": "assets/generated/sheets/ui_kit.png",
  "effects": "assets/generated/sheets/effects.png"
};
export const SHEET_ORDER = ['characters','terrain','world_buildables','items_icons','biomes_dungeon','poi_interiors','ui_kit','effects'];
export const SHEET_TITLES = {
  characters:'Characters & Combat', terrain:'Island Terrain', world_buildables:'World Buildables', items_icons:'Items / Tools / HUD Icons',
  biomes_dungeon:'Biomes & Dungeon Tiles', poi_interiors:'POI / Interior / Exploration Props', ui_kit:'UI Kit', effects:'FX / Markers / Blueprint Ghosts'
};
export const TILE_ASSET_KEYS = {
  grass:'tile_grass', grass2:'tile_grass2', sand:'tile_sand', shallow:'tile_shallow', water:'tile_water', path:'tile_path',
  swamp:'tile_swamp', ash:'tile_ash', lava:'tile_lava', floor:'tile_floor', stone:'tile_stone', walltile:'tile_walltile'
};
export const ICON_ASSET_KEYS = {
  wood:'icon_wood', stone:'icon_stone', fiber:'icon_fiber', berry:'icon_berry', banana:'icon_banana', iron:'icon_iron', core:'icon_core', monkey_munch:'icon_monkey_munch',
  axe:'icon_axe', pickaxe:'icon_pickaxe', sword:'icon_sword', metal_sword:'icon_metal_sword', hammer:'icon_hammer', cooked_meal:'icon_cooked_meal',
  chest:'icon_chest', campfire:'icon_campfire', workbench:'icon_workbench', bed:'icon_bed', wall:'icon_wall', torch:'icon_torch', forge:'icon_workbench', raft:'icon_raft',
  heart:'icon_heart', hunger:'icon_hunger', stamina:'icon_stamina', bag:'icon_bag', build:'icon_build', monkey:'icon_monkey', attack:'icon_attack', interact:'icon_interact', save:'icon_save', quest:'icon_quest'
};
export const RESOURCE_ASSET_KEYS = { tree:['prop_palm_0','prop_palm_1','prop_palm_2','prop_palm_3'], rock:['prop_rock_1'], iron:['prop_iron_1'], bush:['prop_bush_red','prop_bush_purple'] };
export const BUILDING_ASSET_KEYS = {
  chest:'prop_chest_closed', workbench:'prop_workbench', campfire:'prop_campfire_lit', bed:'prop_bed', wall:'prop_wall', torch:'prop_torch', forge:'prop_forge', raft:'prop_raft_sail',
  vault:'poi_vault_round', galleon:'poi_galleon_hull', cage:'prop_cage', totem:'prop_totem',
  tent:'prop_tent', barrel:'prop_barrel', crates:'prop_crates', sack:'prop_sack', table:'prop_table',
  ship_wreck0:'prop_wreck_0', ship_wreck1:'prop_wreck_1', ship_wreck2:'prop_wreck_2', ship_wreck3:'prop_wreck_3',
  dock:'poi_dock', signal_fire:'poi_signal_fire', treasure_pile:'poi_treasure_pile', dig_spot:'poi_dig_spot', treasure_chest:'poi_treasure_chest',
  shelf:'poi_shelf', cupboard:'poi_cupboard', long_table:'poi_long_table', bookshelf:'poi_bookshelf', rug:'poi_rug', pottery:'poi_pottery', cauldron:'poi_cauldron', chopping_block:'poi_chopping_block', loom:'poi_loom', anvil:'poi_anvil',
  tilled_soil:'poi_tilled_soil', seedlings:'poi_seedlings', crops:'poi_crops', bucket:'poi_bucket', compost:'poi_compost', scarecrow:'poi_scarecrow',
  spike_trap:'poi_spike_trap', snare:'poi_snare', barricade:'poi_barricade', brazier:'poi_brazier', drum:'poi_drum', lantern_post:'poi_lantern_post', firewood:'poi_firewood', ore_basket:'poi_ore_basket', drying_rack:'poi_drying_rack', fish_rack:'poi_fish_rack'
};
export const BLUEPRINT_ASSET_KEYS = { chest:'prop_chest_closed', campfire:'prop_campfire_lit', workbench:'prop_workbench', bed:'prop_bed', wall:'prop_wall', torch:'prop_torch', forge:'prop_forge', raft:'prop_raft_sail' };


export const COLORS = {
  ink: '#2a1715', ink2: '#4a2a20', white: '#fff5d6', panel: '#171f26', panel2: '#26323a',
  sand: '#e8c76f', sandDark: '#bd904b', sandLight: '#ffe29c', grass: '#4b9b42', grassDark: '#2f6f31', grassLight: '#76c865',
  water: '#227da0', waterDark: '#126074', waterLight: '#7be1d7', shallow: '#54b5b4', stone: '#8e7e63', stoneDark: '#504941', stoneLight: '#b7aa8a',
  wood: '#a85d2a', woodDark: '#67331e', woodLight: '#d88a42', leaf: '#4f8c41', leafDark: '#2c5e2f', leafLight: '#77bd61',
  red: '#e83b4b', orange: '#ff8a2b', yellow: '#ffd85a', cyan: '#62d3ff', purple: '#9057cf', black: '#08090d'
};

export const ITEM_INFO = {
  wood: {name:'Wood', color:'#a85d2a'}, stone: {name:'Pebble Stone', color:'#8e8a7e'}, fiber: {name:'Palm Fiber', color:'#76c865'},
  berry: {name:'Wild Berries', color:'#d84165', food:18}, banana: {name:'Banana', color:'#f4d55f', food:26}, iron: {name:'Iron Ore', color:'#9fb3bd'},
  core: {name:'Ancient Core', color:'#41d7ff'}, monkey_munch: {name:'Monkey Munch', color:'#d981ff'},
  axe: {name:'Flint Axe', tool:true}, pickaxe: {name:'Pebble Pickaxe', tool:true}, sword: {name:'Bone Sword', tool:true}, metal_sword: {name:'Metal Sword', tool:true}, hammer: {name:'Builder Hammer', tool:true},
  cooked_meal: {name:'Cooked Meal', color:'#ffad42', food:46}
};

export const HOTBAR = ['axe','pickaxe','sword','hammer','monkey_munch','berry','banana','campfire','chest','workbench','wall','raft'];

export const BUILD_RECIPES = {
  campfire: {name:'Campfire', cost:{wood:3, stone:2}, progress:5, solid:false, light:180, desc:'Warmth, cooking and raid target.'},
  chest: {name:'Chest', cost:{wood:4, fiber:2}, progress:5, solid:true, storage:true, desc:'Monkeys deposit resources here.'},
  workbench: {name:'Workbench', cost:{wood:6, stone:2}, progress:7, solid:true, station:'workbench', desc:'Queue better tools and gear.'},
  bed: {name:'Leaf Bed', cost:{wood:4, fiber:5}, progress:5, solid:true, desc:'Save point and respawn anchor.'},
  wall: {name:'Palisade Wall', cost:{wood:2, stone:1}, progress:4, solid:true, hp:90, desc:'Blocks raiders and funnels combat.'},
  torch: {name:'Standing Torch', cost:{wood:1, fiber:1}, progress:3, solid:false, light:150, desc:'Cheap night light.'},
  forge: {name:'Stone Forge', cost:{stone:8, iron:2}, progress:8, solid:true, light:170, station:'forge', desc:'Metal tools and strong weapons.'},
  raft: {name:'Island Raft', cost:{wood:12, fiber:8}, progress:10, solid:true, desc:'Sail to a fresh neighbouring island.'}
};

export const CRAFT_RECIPES = {
  monkey_munch: {name:'Monkey Munch', cost:{berry:2, banana:1}, result:{monkey_munch:1}, craftTime:0, desc:'Tames monkeys.'},
  cooked_meal: {name:'Cooked Meal', cost:{berry:2, wood:1}, result:{cooked_meal:1}, craftTime:0, stationNear:'campfire', desc:'Restores a lot of hunger.'},
  pickaxe: {name:'Pebble Pickaxe', cost:{wood:2, stone:3, fiber:1}, result:{pickaxe:1}, craftTime:5, station:'workbench', desc:'Mines rock and ore.'},
  sword: {name:'Bone Sword', cost:{wood:1, stone:2, fiber:2}, result:{sword:1}, craftTime:5, station:'workbench', desc:'Simple defensive weapon.'},
  metal_sword: {name:'Metal Sword', cost:{wood:1, iron:4, core:1}, result:{metal_sword:1}, craftTime:8, station:'forge', desc:'Heavy damage. Requires a core.'},
  forge_unlock: {name:'Forge Plans', cost:{stone:5, iron:1}, result:{}, unlockBuild:'forge', craftTime:6, station:'workbench', desc:'Unlocks the forge blueprint.'}
};

export const QUESTS = [
  'Scavenge wood, stone, fiber, and berries from the starter grove.',
  'Build a chest, tame a monkey, then teach it to gather and deposit.',
  'Build a workbench, queue a sword, and teach a monkey to craft.',
  'Find a vault, defeat the guardian, and claim an Ancient Core.',
  'Repair the wrecked galleon with wood, fiber, iron, and the core.'
];

export function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
export function lerp(a,b,t){ return a + (b-a)*t; }
export function dist2(a,b,c,d){ const x=a-c, y=b-d; return x*x+y*y; }
export function distance(a,b,c,d){ return Math.sqrt(dist2(a,b,c,d)); }
export function randRange(rng,a,b){ return a + (b-a)*rng(); }
export function choice(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }
export function nowId(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
export function formatCost(cost){ return Object.entries(cost).map(([k,v]) => `${v} ${itemName(k)}`).join(', '); }
export function itemName(id){ return (ITEM_INFO[id] && ITEM_INFO[id].name) || (BUILD_RECIPES[id] && BUILD_RECIPES[id].name) || id.replace(/_/g,' '); }
export function hash2(x, y, seed=0){
  let n = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
export function mulberry32(a){
  return function(){
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export function deepClone(o){ return JSON.parse(JSON.stringify(o)); }
export function addToBag(bag, id, qty=1){ bag[id] = (bag[id] || 0) + qty; if (bag[id] <= 0) delete bag[id]; }
export function sanitizeBag(bag){ const out={}; if(!bag || typeof bag!=='object') return out; for(const [k,v] of Object.entries(bag)){ const n=Math.floor(Number(v)); if(Number.isFinite(n)&&n>0) out[k]=n; } return out; }
export function finiteNumber(v, fallback){ const n=Number(v); return Number.isFinite(n)?n:fallback; }
export function hasCost(bag, cost){ return Object.entries(cost).every(([k,v]) => (bag[k]||0) >= v); }
export function payCost(bag, cost){ if (!hasCost(bag, cost)) return false; for (const [k,v] of Object.entries(cost)) addToBag(bag, k, -v); return true; }
export function bagSummary(bag){ return Object.entries(bag).filter(([,v])=>v>0).map(([k,v])=>`${v}× ${itemName(k)}`).join(', '); }
export function wrapTextLines(ctx, text, maxWidth){
  const words = String(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let line = words.shift();
  for (const word of words){
    const test = `${line} ${word}`;
    if (ctx.measureText(test).width <= maxWidth) line = test;
    else { lines.push(line); line = word; }
  }
  lines.push(line);
  return lines;
}
