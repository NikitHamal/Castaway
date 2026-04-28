# Generated Asset Review & Integration Notes

## Review outcome
- Character sheet: usable for billboard characters; front/back/side poses are consistent enough for gameplay. The crop pass selected clean frames for player, monkey, goblin, boss, and villagers.
- Island terrain: strong top-down perspective; selected base tile crops are normalized to 32×32.
- World buildables: 3/4 pixel props fit the intended 2.5D billboard look; selected palms, resources, buildables, raft, cage, totem, and wreckage are wired into gameplay.
- Items/icons: clean and consistent; used for hotbar, pickups, stats, and crafting.
- Biome/dungeon tiles: strongest match for swamp, volcanic, and vault areas; wired into terrain renderer.
- POI/interior sheet: some individual props are more side-on; they are kept as billboard props and used for vault/galleon/decorative world content.
- UI kit: consistent; selected slot/status/minimap/panel elements are used in the HUD and asset viewer.
- FX sheet: strong style consistency; selected fire/slash/smoke/splash/spark frames are integrated, with the full sheet available through the asset viewer.

## What was changed
- Cleaned generated sheets into transparent PNGs.
- Sliced every sheet into components under `assets/generated/slices/`.
- Created curated, named gameplay sprites under `assets/generated/curated/`.
- Added `assets/generated/atlas_manifest.json` describing full sheets, curated sprites, and component coordinates.
- Updated the game renderer to use generated assets with procedural fallback if assets fail to load.
- Added in-game generated asset viewer: press `V`, use `[` and `]` to page sheets.
