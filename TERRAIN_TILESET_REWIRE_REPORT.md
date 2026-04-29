# Terrain Tileset Rewire Report

The in-game terrain/floor tiles were replaced with crops from the newly generated tileset batches and wired directly into the existing runtime by overwriting the curated tile PNGs under `assets/generated/curated/tiles/`.

## Source sheets added to the project
- `assets/generated/rebuilt_tilesets/tropical_terrain_pixel_tileset.png`
- `assets/generated/rebuilt_tilesets/coastal_and_marsh_terrain_tileset.png`
- `assets/generated/rebuilt_tilesets/pixel_art_terrain_tileset_collection.png`
- `assets/generated/rebuilt_tilesets/rpg_terrain_floor_tileset_sprite_sheet.png`

## Tile mapping
| in-game tile | source batch | row | col |
| --- | --- | ---: | ---: |
| assets/generated/curated/tiles/tile_grass.png | assets/generated/rebuilt_tilesets/tropical_terrain_pixel_tileset.png | 0 | 0 |
| assets/generated/curated/tiles/tile_grass2.png | assets/generated/rebuilt_tilesets/tropical_terrain_pixel_tileset.png | 0 | 3 |
| assets/generated/curated/tiles/tile_sand.png | assets/generated/rebuilt_tilesets/coastal_and_marsh_terrain_tileset.png | 0 | 0 |
| assets/generated/curated/tiles/tile_sand_detail.png | assets/generated/rebuilt_tilesets/coastal_and_marsh_terrain_tileset.png | 1 | 5 |
| assets/generated/curated/tiles/tile_shore.png | assets/generated/rebuilt_tilesets/coastal_and_marsh_terrain_tileset.png | 5 | 4 |
| assets/generated/curated/tiles/tile_shallow.png | assets/generated/rebuilt_tilesets/coastal_and_marsh_terrain_tileset.png | 2 | 4 |
| assets/generated/curated/tiles/tile_water.png | assets/generated/rebuilt_tilesets/coastal_and_marsh_terrain_tileset.png | 4 | 3 |
| assets/generated/curated/tiles/tile_path.png | assets/generated/rebuilt_tilesets/tropical_terrain_pixel_tileset.png | 2 | 3 |
| assets/generated/curated/tiles/tile_wood.png | assets/generated/rebuilt_tilesets/rpg_terrain_floor_tileset_sprite_sheet.png | 0 | 0 |
| assets/generated/curated/tiles/tile_dirt.png | assets/generated/rebuilt_tilesets/tropical_terrain_pixel_tileset.png | 2 | 1 |
| assets/generated/curated/tiles/tile_stone.png | assets/generated/rebuilt_tilesets/pixel_art_terrain_tileset_collection.png | 0 | 0 |
| assets/generated/curated/tiles/tile_cliff.png | assets/generated/rebuilt_tilesets/pixel_art_terrain_tileset_collection.png | 1 | 3 |
| assets/generated/curated/tiles/tile_swamp.png | assets/generated/rebuilt_tilesets/pixel_art_terrain_tileset_collection.png | 2 | 4 |
| assets/generated/curated/tiles/tile_swamp_water.png | assets/generated/rebuilt_tilesets/pixel_art_terrain_tileset_collection.png | 3 | 1 |
| assets/generated/curated/tiles/tile_poison.png | assets/generated/rebuilt_tilesets/pixel_art_terrain_tileset_collection.png | 3 | 5 |
| assets/generated/curated/tiles/tile_ash.png | assets/generated/rebuilt_tilesets/pixel_art_terrain_tileset_collection.png | 4 | 1 |
| assets/generated/curated/tiles/tile_lava.png | assets/generated/rebuilt_tilesets/pixel_art_terrain_tileset_collection.png | 5 | 1 |
| assets/generated/curated/tiles/tile_floor.png | assets/generated/rebuilt_tilesets/rpg_terrain_floor_tileset_sprite_sheet.png | 4 | 4 |
| assets/generated/curated/tiles/tile_walltile.png | assets/generated/rebuilt_tilesets/rpg_terrain_floor_tileset_sprite_sheet.png | 1 | 5 |

## Notes
- Existing code paths did not need changes because the runtime already loads these filenames from `shared.js`.
- A new contact sheet was written to `assets/generated/sheets/terrain_rewired.png` and also mirrored to `assets/generated/sheets/terrain.png`.