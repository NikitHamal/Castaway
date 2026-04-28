# Removed From Production Package

The full playable package intentionally excludes development-only bulk assets:

- `.git/` repository metadata
- `assets/generated/previews/` numbered QA contact sheets
- `assets/generated/slices/` raw automatic sprite slices
- Python cache folders

Runtime keeps `assets/generated/curated/` and `assets/generated/sheets/` because curated sprites are used by gameplay and sheets are used by the in-game asset viewer.

Additional runtime cleanup in this pass also removed unused oversized curated action sprites now replaced by directional overlays:

- `assets/generated/curated/characters/player_axe.png`
- `assets/generated/curated/characters/player_pickaxe.png`
- `assets/generated/curated/characters/player_hammer.png`
- `assets/generated/curated/characters/player_sword.png`
