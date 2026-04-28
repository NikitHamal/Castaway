# Castaway Mimics - Final Production Pass Audit

This build is a full production-focused cleanup and reliability pass over the previous playable prototype.

## Major fixes

### Directional tool use
- Tool use now aims toward the mouse target when clicking.
- Spacebar tool use follows the current facing direction.
- Oversized generated axe/pickaxe/hammer action sprites were removed from runtime character animation; the player body now stays a stable size and directional tool swings are drawn as overlays.

### Black visual artifact
- Removed the player-centered night-light cutout and all `destination-out` lighting from runtime rendering.
- Night rendering now uses only a soft global tint plus warm building light glows, eliminating the recurring dark blob around the player.

### Combat and feedback
- Added hit-stop, screen shake, damage flash, hit flashes, enemy/monkey feedback and stronger chip particles.
- Improved weapon feedback and damage separation between hand, axe, sword and metal sword.
- Enemies and monkeys now surface clearer hit state and damage text.

### Monkey AI and routing
- Added route-aware movement using cached grid paths when direct line movement is blocked.
- Added path refresh and stuck recovery for routed actors.
- Monkey follow, gather, build, craft and combat behaviors now route more reliably around walls, buildings and terrain.

### Save/load robustness
- Added save versioning with a v2 save key and fallback loading for v1 saves.
- Save loading sanitizes player stats, inventory bags, monkey state and world payloads before applying them.
- Bad saves fail safely without corrupting the running game instance.

### Progression and UX
- First raid timing is less punishing.
- Starter hunger/inventory are friendlier.
- Quest text and HUD layout remain wrapped/readable.
- Start-screen guidance now mentions directional mouse tool aiming.

### Code structure
The old monolithic runtime has been split into focused ES modules under `src/engine/`:

- `shared.js` - constants, recipes, asset maps and utility helpers
- `input.js` - keyboard and mouse input
- `art.js` - rendering and asset drawing
- `world.js` - generation, collision, serialization and pathfinding
- `game.js` - gameplay loop, combat, AI, UI, crafting and saving
- `main.js` - browser bootstrap only

### Asset cleanup
- Removed the bundled Git repository from the distributable.
- Removed raw generated preview/contact-sheet folders and auto-sliced component folders from the playable build.
- Kept curated runtime sprites and generated sheets required by the in-game asset viewer.

## Validation run

- `node --check src/main.js src/engine/*.js`
- ES module import smoke check for `src/engine/game.js`
- World-generation smoke check for `World` construction
