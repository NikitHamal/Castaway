# Castaway Mimics - Production Polish Audit Pass

This update delivers a focused production-ready polish pass on the uploaded build.

## Key fixes included

### Gameplay / Controls
- Fixed left/right facing logic for the player when moving horizontally.
- Fixed action targeting so tool use now respects whether the player is facing left or right.
- Preserved runtime systems during `New Game` so assets/input are not accidentally reset into an inconsistent state.

### Animation / Character Rendering
- Normalized character sprite rendering so axe/pickaxe/hammer/sword attack frames no longer pop to a larger size.
- Inverted side-facing sprite flip logic for curated side sprites so their direction matches movement.
- Added character sprite baseline normalization and bottom-row cropping to reduce ugly foot/shadow artifacts on player, monkey, and enemy sprites.

### World / Camera / Rendering
- Increased tile size from 32 to 36 for a slightly larger and more readable world scale.
- Pixel-snapped camera usage during world rendering to reduce sub-pixel jitter and seam artifacts.
- Overdrew tile assets by 1 pixel to reduce visible water/tile seam lines at edges.
- Softened and delayed night-lighting so the dark blob / harsh vignette effect around the player is reduced.
- Shifted the default opening time later into daylight to improve the first-play experience.

### UI / UX
- Reworked main UI panels to use cleaner code-drawn panels instead of rough texture panels.
- Rebuilt health / hunger / stamina circular UI with cleaner vector rings to remove edge artifacts.
- Improved hotbar readability and slot presentation.
- Added a dedicated top-left info panel for day / island / biome / time.
- Made quest text wrap correctly so it no longer overflows the quest panel.
- Improved mimic panel layout so text fits cleanly.

## Files changed
- `src/main.js`
- `AUDIT_AND_FIXES.md`

## Packaging
Two zips are produced:
1. Full updated project
2. Changes-only package
