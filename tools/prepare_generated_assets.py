from __future__ import annotations
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
import numpy as np
import os, json, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'generated'
SHEETS = OUT / 'sheets'
SLICES = OUT / 'slices'
CURATED = OUT / 'curated'
PREVIEWS = OUT / 'previews'
# This script is portable inside the shipped project: it rebuilds slices/curated assets
# from the already-included full sheets under assets/generated/sheets/.
for p in [SLICES, CURATED, PREVIEWS]:
    if p.exists(): shutil.rmtree(p)
    p.mkdir(parents=True, exist_ok=True)
SHEETS.mkdir(parents=True, exist_ok=True)

SHEET_SOURCES = {
    'characters': SHEETS / 'characters.png',
    'terrain': SHEETS / 'terrain.png',
    'world_buildables': SHEETS / 'world_buildables.png',
    'items_icons': SHEETS / 'items_icons.png',
    'biomes_dungeon': SHEETS / 'biomes_dungeon.png',
    'poi_interiors': SHEETS / 'poi_interiors.png',
    'ui_kit': SHEETS / 'ui_kit.png',
    'effects': SHEETS / 'effects.png',
}

# Keep the full sheets; the game dev viewer loads these so every generated sheet is wired into the app.
sheet_paths = {key: str(src.relative_to(ROOT)).replace('\\', '/') for key, src in SHEET_SOURCES.items()}

# Segment transparent sheets into connected components.
def components_for(img: Image.Image):
    a = np.array(img.convert('RGBA'))[:, :, 3]
    mask = a > 10
    lab, n = ndimage.label(mask, structure=np.ones((3, 3), dtype=int))
    objs = ndimage.find_objects(lab)
    comps = []
    for i, sli in enumerate(objs, start=1):
        if sli is None: continue
        ys, xs = sli
        x0, x1 = xs.start, xs.stop
        y0, y1 = ys.start, ys.stop
        area = int((lab[sli] == i).sum())
        w, h = x1 - x0, y1 - y0
        if area < 20 or w < 4 or h < 4: continue
        comps.append({'label': i, 'x': int(x0), 'y': int(y0), 'w': int(w), 'h': int(h), 'area': area})
    comps.sort(key=lambda c: (c['y'] // 8, c['x']))
    return comps

all_components = {}
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 10)
except Exception:
    font = None

for key, sheet in SHEET_SOURCES.items():
    img = Image.open(sheet).convert('RGBA')
    comps = components_for(img)
    all_components[key] = comps
    outdir = SLICES / key
    outdir.mkdir(parents=True, exist_ok=True)
    for idx, c in enumerate(comps, start=1):
        pad = 2
        box = (max(0, c['x'] - pad), max(0, c['y'] - pad), min(img.width, c['x'] + c['w'] + pad), min(img.height, c['y'] + c['h'] + pad))
        crop = img.crop(box)
        crop.save(outdir / f'{key}_{idx:03d}_{c["w"]}x{c["h"]}.png')
    # numbered contact preview for QA
    thumbs = []
    for idx, c in enumerate(comps[:240], start=1):
        crop = img.crop((max(0,c['x']-2), max(0,c['y']-2), min(img.width,c['x']+c['w']+2), min(img.height,c['y']+c['h']+2)))
        crop.thumbnail((64, 64), Image.Resampling.NEAREST)
        thumbs.append((idx, crop, c))
    cols, cell = 10, 100
    rows = (len(thumbs) + cols - 1) // cols
    contact = Image.new('RGBA', (cols*cell, max(1, rows)*cell), (255,255,255,255))
    draw = ImageDraw.Draw(contact)
    for k, (idx, crop, c) in enumerate(thumbs):
        cx, cy = (k % cols) * cell, (k // cols) * cell
        for yy in range(0, cell, 8):
            for xx in range(0, cell, 8):
                fill = (235,235,235,255) if ((xx//8 + yy//8) % 2) else (255,255,255,255)
                draw.rectangle([cx+xx, cy+yy, cx+xx+7, cy+yy+7], fill=fill)
        contact.alpha_composite(crop, (cx + (cell-crop.width)//2, cy + 14 + (64-crop.height)//2))
        draw.text((cx+2, cy+2), str(idx), fill=(220,0,0,255), font=font)
        draw.text((cx+2, cy+80), f'{c["w"]}x{c["h"]}', fill=(0,0,0,255), font=font)
    contact.convert('RGB').save(PREVIEWS / f'{key}_numbered_contact.jpg', quality=92)

# Curated map: component indexes are based on the component lists created above.
# The output files are scaled to sane in-game sizes while preserving alpha and pixel edge hardness.
CURATED_MAP = {
    # Characters
    'player_down': ('characters', 2, 42, None),
    'player_up': ('characters', 1, 42, None),
    'player_side': ('characters', 4, 42, None),
    'player_walk_0': ('characters', 5, 42, None),
    'player_walk_1': ('characters', 6, 42, None),
    'player_walk_2': ('characters', 7, 42, None),
    'player_axe': ('characters', 11, 58, None),
    'player_pickaxe': ('characters', 30, 58, None),
    'player_hammer': ('characters', 17, 50, None),
    'player_sword': ('characters', 29, 58, None),
    'player_carry': ('characters', 14, 58, None),
    'monkey_down': ('characters', 40, 36, None),
    'monkey_up': ('characters', 47, 36, None),
    'monkey_side': ('characters', 41, 36, None),
    'monkey_walk_0': ('characters', 43, 36, None),
    'monkey_walk_1': ('characters', 44, 36, None),
    'monkey_walk_2': ('characters', 45, 36, None),
    'monkey_carry': ('characters', 49, 36, None),
    'monkey_attack': ('characters', 53, 42, None),
    'monkey_mimic': ('characters', 58, 38, None),
    'goblin_down': ('characters', 62, 48, None),
    'goblin_side': ('characters', 64, 48, None),
    'goblin_attack': ('characters', 69, 50, None),
    'boss_down': ('characters', 82, 72, None),
    'boss_side': ('characters', 83, 72, None),
    'boss_attack': ('characters', 90, 78, None),
    'npc_crafter': ('characters', 99, 54, None),
    'npc_explorer': ('characters', 103, 54, None),

    # Terrain tiles 32x32
    'tile_grass': ('terrain', 1, None, (32,32)),
    'tile_grass2': ('terrain', 4, None, (32,32)),
    'tile_sand': ('terrain', 6, None, (32,32)),
    'tile_sand_detail': ('terrain', 8, None, (32,32)),
    'tile_shore': ('terrain', 26, None, (32,32)),
    'tile_shallow': ('terrain', 36, None, (32,32)),
    'tile_water': ('terrain', 47, None, (32,32)),
    'tile_path': ('terrain', 31, None, (32,32)),
    'tile_wood': ('terrain', 42, None, (32,32)),
    'tile_dirt': ('terrain', 52, None, (32,32)),
    'tile_stone': ('terrain', 62, None, (32,32)),
    'tile_cliff': ('terrain', 67, None, (32,32)),
    'tile_swamp': ('biomes_dungeon', 1, None, (32,32)),
    'tile_swamp_water': ('biomes_dungeon', 7, None, (32,32)),
    'tile_poison': ('biomes_dungeon', 24, None, (32,32)),
    'tile_ash': ('biomes_dungeon', 38, None, (32,32)),
    'tile_lava': ('biomes_dungeon', 45, None, (32,32)),
    'tile_floor': ('biomes_dungeon', 72, None, (32,32)),
    'tile_walltile': ('biomes_dungeon', 80, None, (32,32)),

    # World props/buildings
    'prop_palm_0': ('world_buildables', 1, 112, None),
    'prop_palm_1': ('world_buildables', 2, 108, None),
    'prop_palm_2': ('world_buildables', 3, 112, None),
    'prop_palm_3': ('world_buildables', 4, 102, None),
    'prop_bush_red': ('world_buildables', 5, 48, None),
    'prop_bush_purple': ('world_buildables', 6, 48, None),
    'prop_banana_plant': ('world_buildables', 7, 58, None),
    'prop_rock_0': ('world_buildables', 13, 42, None),
    'prop_rock_1': ('world_buildables', 16, 36, None),
    'prop_iron_0': ('world_buildables', 17, 42, None),
    'prop_iron_1': ('world_buildables', 20, 42, None),
    'prop_stump': ('world_buildables', 18, 42, None),
    'prop_logs': ('world_buildables', 19, 42, None),
    'prop_sticks': ('world_buildables', 22, 42, None),
    'prop_chest_closed': ('world_buildables', 29, 46, None),
    'prop_chest_open': ('world_buildables', 24, 50, None),
    'prop_campfire_unlit': ('world_buildables', 30, 32, None),
    'prop_campfire_lit': ('world_buildables', 25, 46, None),
    'prop_workbench': ('world_buildables', 27, 62, None),
    'prop_bed': ('world_buildables', 31, 48, None),
    'prop_torch': ('world_buildables', 26, 62, None),
    'prop_wall': ('world_buildables', 35, 52, None),
    'prop_wall_corner': ('world_buildables', 36, 52, None),
    'prop_wall_gate': ('world_buildables', 34, 52, None),
    'prop_wall_damaged': ('world_buildables', 32, 50, None),
    'prop_forge': ('world_buildables', 33, 64, None),
    'prop_raft_sail': ('world_buildables', 38, 82, None),
    'prop_raft': ('world_buildables', 45, 54, None),
    'prop_wreck_0': ('world_buildables', 41, 62, None),
    'prop_wreck_1': ('world_buildables', 42, 62, None),
    'prop_wreck_2': ('world_buildables', 43, 62, None),
    'prop_wreck_3': ('world_buildables', 44, 62, None),
    'prop_table': ('world_buildables', 49, 48, None),
    'prop_cage': ('world_buildables', 48, 58, None),
    'prop_totem': ('world_buildables', 46, 70, None),
    'prop_crates': ('world_buildables', 50, 48, None),
    'prop_barrel': ('world_buildables', 52, 42, None),
    'prop_sack': ('world_buildables', 53, 40, None),
    'prop_tent': ('world_buildables', 47, 76, None),

    # POI/interior props
    'poi_vault_round': ('poi_interiors', 4, 82, None),
    'poi_temple_gate': ('poi_interiors', 1, 82, None),
    'poi_cave_gate': ('poi_interiors', 2, 82, None),
    'poi_hatch': ('poi_interiors', 8, 52, None),
    'poi_bridge': ('poi_interiors', 7, 56, None),
    'poi_supply_crate': ('poi_interiors', 11, 44, None),
    'poi_signal_fire': ('poi_interiors', 14, 48, None),
    'poi_treasure_pile': ('poi_interiors', 15, 46, None),
    'poi_dig_spot': ('poi_interiors', 16, 42, None),
    'poi_treasure_chest': ('poi_interiors', 17, 46, None),
    'poi_galleon_hull': ('poi_interiors', 24, 72, None),
    'poi_mast': ('poi_interiors', 22, 88, None),
    'poi_sail': ('poi_interiors', 23, 68, None),
    'poi_anchor': ('poi_interiors', 25, 44, None),
    'poi_wheel': ('poi_interiors', 26, 42, None),
    'poi_cannon': ('poi_interiors', 28, 44, None),
    'poi_dock': ('poi_interiors', 27, 52, None),
    'poi_shelf': ('poi_interiors', 31, 52, None),
    'poi_cupboard': ('poi_interiors', 30, 52, None),
    'poi_long_table': ('poi_interiors', 32, 54, None),
    'poi_bookshelf': ('poi_interiors', 33, 62, None),
    'poi_rug': ('poi_interiors', 37, 50, None),
    'poi_pottery': ('poi_interiors', 39, 42, None),
    'poi_cauldron': ('poi_interiors', 43, 44, None),
    'poi_chopping_block': ('poi_interiors', 40, 42, None),
    'poi_loom': ('poi_interiors', 42, 42, None),
    'poi_anvil': ('poi_interiors', 36, 32, None),
    'poi_tilled_soil': ('poi_interiors', 47, 54, None),
    'poi_seedlings': ('poi_interiors', 49, 54, None),
    'poi_crops': ('poi_interiors', 48, 54, None),
    'poi_bucket': ('poi_interiors', 50, 32, None),
    'poi_compost': ('poi_interiors', 45, 54, None),
    'poi_scarecrow': ('poi_interiors', 46, 60, None),
    'poi_spike_trap': ('poi_interiors', 55, 40, None),
    'poi_snare': ('poi_interiors', 57, 34, None),
    'poi_barricade': ('poi_interiors', 54, 44, None),
    'poi_brazier': ('poi_interiors', 56, 44, None),
    'poi_drum': ('poi_interiors', 52, 38, None),
    'poi_lantern_post': ('poi_interiors', 59, 54, None),
    'poi_firewood': ('poi_interiors', 62, 46, None),
    'poi_ore_basket': ('poi_interiors', 63, 42, None),
    'poi_drying_rack': ('poi_interiors', 60, 48, None),
    'poi_fish_rack': ('poi_interiors', 61, 48, None),

    # Icons and HUD
    'icon_fiber': ('items_icons', 1, None, (34,34)),
    'icon_banana': ('items_icons', 2, None, (34,34)),
    'icon_wood': ('items_icons', 3, None, (34,34)),
    'icon_berry': ('items_icons', 4, None, (34,34)),
    'icon_cooked_meal': ('items_icons', 5, None, (34,34)),
    'icon_stone': ('items_icons', 7, None, (34,34)),
    'icon_monkey_munch': ('items_icons', 8, None, (34,34)),
    'icon_core': ('items_icons', 9, None, (34,34)),
    'icon_axe': ('items_icons', 10, None, (34,34)),
    'icon_pickaxe': ('items_icons', 11, None, (34,34)),
    'icon_hammer': ('items_icons', 12, None, (34,34)),
    'icon_iron': ('items_icons', 13, None, (34,34)),
    'icon_torch': ('items_icons', 15, None, (34,34)),
    'icon_campfire': ('items_icons', 16, None, (34,34)),
    'icon_workbench': ('items_icons', 17, None, (34,34)),
    'icon_sword': ('items_icons', 18, None, (34,34)),
    'icon_metal_sword': ('items_icons', 19, None, (34,34)),
    'icon_chest': ('items_icons', 23, None, (34,34)),
    'icon_bed': ('items_icons', 25, None, (34,34)),
    'icon_wall': ('items_icons', 26, None, (34,34)),
    'icon_palm_leaf': ('items_icons', 27, None, (34,34)),
    'icon_raft': ('items_icons', 28, None, (34,34)),
    'icon_sail': ('items_icons', 29, None, (34,34)),
    'icon_rope': ('items_icons', 30, None, (34,34)),
    'icon_shell': ('items_icons', 31, None, (34,34)),
    'icon_fish': ('items_icons', 32, None, (34,34)),
    'icon_flask': ('items_icons', 33, None, (34,34)),
    'icon_repair': ('items_icons', 34, None, (34,34)),
    'icon_meat': ('items_icons', 35, None, (34,34)),
    'icon_key': ('items_icons', 36, None, (34,34)),
    'icon_map': ('items_icons', 38, None, (34,34)),
    'icon_heart': ('items_icons', 39, None, (40,40)),
    'icon_hunger': ('items_icons', 40, None, (40,40)),
    'icon_stamina': ('items_icons', 41, None, (40,40)),
    'icon_bag': ('items_icons', 42, None, (34,34)),
    'icon_build': ('items_icons', 43, None, (34,34)),
    'icon_monkey': ('items_icons', 44, None, (34,34)),
    'icon_attack': ('items_icons', 45, None, (34,34)),
    'icon_interact': ('items_icons', 46, None, (34,34)),
    'icon_save': ('items_icons', 47, None, (34,34)),
    'icon_quest': ('items_icons', 48, None, (34,34)),
    'icon_marker': ('items_icons', 49, None, (34,34)),

    # UI bits
    'ui_panel_large': ('ui_kit', 1, 220, None),
    'ui_panel_medium': ('ui_kit', 2, 110, None),
    'ui_hotbar_slots': ('ui_kit', 37, None, (360,54)),
    'ui_inventory_grid': ('ui_kit', 38, None, (300,120)),
    'ui_slot': ('ui_kit', 29, None, (54,54)),
    'ui_slot_selected': ('ui_kit', 30, None, (54,54)),
    'ui_health_ring': ('ui_kit', 53, None, (58,58)),
    'ui_hunger_ring': ('ui_kit', 54, None, (52,52)),
    'ui_stamina_ring': ('ui_kit', 55, None, (58,58)),
    'ui_minimap_round': ('ui_kit', 56, None, (124,124)),
    'ui_speech_dark': ('ui_kit', 73, None, (170,48)),
    'ui_progress_green': ('ui_kit', 87, None, (180,18)),
    'ui_cursor': ('ui_kit', 100, None, (32,32)),
    'ui_reticle': ('ui_kit', 102, None, (40,40)),
    'ui_build_reticle': ('ui_kit', 103, None, (40,40)),

    # Effects
    'fx_slash_0': ('effects', 3, 48, None),
    'fx_slash_1': ('effects', 5, 48, None),
    'fx_spark_0': ('effects', 7, 36, None),
    'fx_dust_0': ('effects', 16, 36, None),
    'fx_hit_axe': ('effects', 35, 42, None),
    'fx_hit_hammer': ('effects', 37, 42, None),
    'fx_fire_0': ('effects', 94, 54, None),
    'fx_fire_1': ('effects', 97, 54, None),
    'fx_fire_2': ('effects', 105, 54, None),
    'fx_torch_0': ('effects', 89, 52, None),
    'fx_smoke': ('effects', 123, 48, None),
    'fx_splash': ('effects', 124, 42, None),
    'fx_poison': ('effects', 190, 42, None),
    'fx_ring_green': ('effects', 0, 0, None),
    'fx_blueprint_chest': ('effects', 0, 0, None),
}
# Special effects components after 200 not in first preview; locate by coordinates if component index not known.
# We'll later use bbox scanning fallback for rings/blueprints only if manually needed.
# Instead use UI build reticle and procedural blueprint, keeping effects sheet loaded in gallery.
CURATED_MAP = {k:v for k,v in CURATED_MAP.items() if v[1] != 0}

curated_manifest = {}

def crop_component(sheet_key: str, comp_idx: int) -> Image.Image:
    img = Image.open(SHEET_SOURCES[sheet_key]).convert('RGBA')
    comps = all_components[sheet_key]
    c = comps[comp_idx - 1]
    pad = 2
    box = (max(0, c['x'] - pad), max(0, c['y'] - pad), min(img.width, c['x'] + c['w'] + pad), min(img.height, c['y'] + c['h'] + pad))
    return img.crop(box), c, box

def trim_alpha(im: Image.Image, padding=0) -> Image.Image:
    bbox = im.getbbox()
    if not bbox: return im
    if padding:
        x0,y0,x1,y1=bbox
        bbox=(max(0,x0-padding), max(0,y0-padding), min(im.width,x1+padding), min(im.height,y1+padding))
    return im.crop(bbox)

def resize_preserve(im: Image.Image, target_h=None, target_size=None) -> Image.Image:
    im = trim_alpha(im, 1)
    if target_size:
        return im.resize(target_size, Image.Resampling.NEAREST)
    if target_h:
        scale = target_h / im.height
        w = max(1, int(round(im.width * scale)))
        h = max(1, int(round(im.height * scale)))
        return im.resize((w,h), Image.Resampling.NEAREST)
    return im

for name, (sheet_key, comp_idx, target_h, target_size) in CURATED_MAP.items():
    raw, c, box = crop_component(sheet_key, comp_idx)
    out_img = resize_preserve(raw, target_h, target_size)
    family = 'misc'
    if name.startswith('player') or name.startswith('monkey') or name.startswith('goblin') or name.startswith('boss') or name.startswith('npc'):
        family = 'characters'
    elif name.startswith('tile'):
        family = 'tiles'
    elif name.startswith('prop') or name.startswith('poi'):
        family = 'props'
    elif name.startswith('icon'):
        family = 'icons'
    elif name.startswith('ui'):
        family = 'ui'
    elif name.startswith('fx'):
        family = 'fx'
    out_dir = CURATED / family
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f'{name}.png'
    out_img.save(out_path)
    curated_manifest[name] = {
        'path': str(out_path.relative_to(ROOT)).replace('\\','/'),
        'family': family,
        'source_sheet': sheet_key,
        'component_index': comp_idx,
        'source_bbox': {'x': c['x'], 'y': c['y'], 'w': c['w'], 'h': c['h']},
        'output_size': {'w': out_img.width, 'h': out_img.height}
    }

# Make small non-critical decorative slices from all remaining components accessible via gallery and manifest.
manifest = {
    'generated_assets_version': 2,
    'sheet_paths': sheet_paths,
    'curated': curated_manifest,
    'component_counts': {k: len(v) for k,v in all_components.items()},
    'component_manifest': all_components,
    'notes': [
        'Main gameplay uses curated sprites at production-friendly sizes.',
        'All generated sheets are also included and loaded in the in-game asset viewer.',
        'All sheets were reviewed for perspective consistency; 3/4 billboard props were kept because they fit the 2.5D camera style.'
    ]
}
with open(OUT / 'atlas_manifest.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

# QA markdown
qa = '''# Generated Asset Review & Integration Notes\n\n## Review outcome\n- Character sheet: usable for billboard characters; front/back/side poses are consistent enough for gameplay. The crop pass selected clean frames for player, monkey, goblin, boss, and villagers.\n- Island terrain: strong top-down perspective; selected base tile crops are normalized to 32×32.\n- World buildables: 3/4 pixel props fit the intended 2.5D billboard look; selected palms, resources, buildables, raft, cage, totem, and wreckage are wired into gameplay.\n- Items/icons: clean and consistent; used for hotbar, pickups, stats, and crafting.\n- Biome/dungeon tiles: strongest match for swamp, volcanic, and vault areas; wired into terrain renderer.\n- POI/interior sheet: some individual props are more side-on; they are kept as billboard props and used for vault/galleon/decorative world content.\n- UI kit: consistent; selected slot/status/minimap/panel elements are used in the HUD and asset viewer.\n- FX sheet: strong style consistency; selected fire/slash/smoke/splash/spark frames are integrated, with the full sheet available through the asset viewer.\n\n## What was changed\n- Cleaned generated sheets into transparent PNGs.\n- Sliced every sheet into components under `assets/generated/slices/`.\n- Created curated, named gameplay sprites under `assets/generated/curated/`.\n- Added `assets/generated/atlas_manifest.json` describing full sheets, curated sprites, and component coordinates.\n- Updated the game renderer to use generated assets with procedural fallback if assets fail to load.\n- Added in-game generated asset viewer: press `V`, use `[` and `]` to page sheets.\n'''
with open(OUT / 'ASSET_REVIEW.md', 'w', encoding='utf-8') as f:
    f.write(qa)

print('Prepared generated assets in', OUT)
print('Curated sprites:', len(curated_manifest))
print('Component counts:', {k: len(v) for k,v in all_components.items()})
