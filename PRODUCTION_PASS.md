# Castaway Mimics - Production Grade Pass

This pass focuses on the exact problem areas from the latest playtest: tool facing, the recurring black visual artifact, combat feel, monkey task reliability, route finding, save/load safety, progression/UX balance, code modularity, and project cleanup.

## Fixed / Enhanced

### Tool facing and visual artifacts
- Player tool use now faces the correct direction based on movement or mouse target.
- Tool animation no longer uses oversized generated action sprites. The player keeps a consistent body frame and tools are drawn as directional swing overlays.
- Removed the most likely source of the black blob around the player: opaque/dark pixels in generated attack sprites were no longer used by runtime.
- Removed the default player-centered night-light hole so lighting no longer creates a dark/bright blob around the player during normal play.

### Combat feel and hit feedback
- Added hit-stop and screen shake for stronger weapon impact.
- Added enemy knockback on player hits.
- Added damage flash, enemy flash, monkey flash, and stronger chip particles.
- Improved weapon damage tuning: hand, axe, sword, and metal sword now feel more distinct.
- Enemies now briefly flash on hit and when attacking.
- Player damage now gives clearer feedback through screen tint, particles, and floating damage text.

### Monkey AI / task reliability
- Added cached pathing for monkeys instead of pure straight-line movement.
- Improved monkey gather/deposit targeting so carried items are reliably deposited and stale targets are cleared.
- Added stuck detection and path refreshes.
- Improved monkey build behavior so monkeys no longer discard excess carried resources incorrectly.
- Combat monkeys now provide clearer damage feedback and refresh enemy hit state.
- Monkey damage now clears invalid carry/path state if a monkey flees and recovers.

### Route finding
- Added collision-aware grid pathfinding in `World.findPath()` that avoids solid buildings and blueprints.
- Added generic `moveToward()` routing in `Game`, used by monkeys and enemies.
- Entities still use direct movement when the path is clear, and only route when blocked, keeping runtime cost low.
- Raid spawns now choose valid walkable cells instead of random water/lava edges.

### Save/load robustness
- Introduced a versioned save key and `SAVE_VERSION`.
- Added fallback loading for the previous v1 save key.
- Added validation/sanitization for loaded bags, player stats, monkey data, and world data.
- Load failure now falls back safely without corrupting the current runtime.
- Save data now includes current blueprint, selected hotbar slot, raid timer, and dungeon return state.

### Progression / UX balance
- Updated quest copy to be more specific and actionable.
- Kept the larger tile scale from the previous pass.
- Preserved cleaner HUD panels and wrapped quest text.
- Reduced first-run visual darkness by using a later daylight start and removing player-centered ambient blob lighting.

### Modularization
The previous single `src/main.js` has been split into modules:

- `src/main.js` - bootstraps the canvas and start button only.
- `src/engine/shared.js` - constants, generated asset paths, recipes, quests, and utility functions.
- `src/engine/input.js` - keyboard/mouse input.
- `src/engine/art.js` - rendering, sprites, tiles, icons, buildings, and character drawing.
- `src/engine/world.js` - world generation, collisions, entities, serialization, and pathfinding.
- `src/engine/game.js` - gameplay loop, combat, monkey AI, crafting, saving, UI, and progression.

Each module now imports only the shared symbols it actually uses, keeping the codebase easier to audit and safer to extend.

### Cleanup
- Removed the bundled `.git` directory from the distributable project.
- Removed generated preview contact sheets and raw auto-sliced components from the playable build.
- Removed unused curated player action-sprite PNGs now replaced by runtime directional tool overlays.
- Updated the generated atlas manifest to document that only curated sprites and sheets are shipped in the runtime build.

## Next recommended steps

1. Add a small automated browser smoke test that starts the game, waits for assets, moves in all four directions, uses each tool, opens crafting, saves, reloads, and checks for runtime errors.
2. Add a real pause/settings menu with volume, pixel scale, keybind reference, and save slots.
3. Continue splitting `src/engine/game.js` into smaller gameplay systems: combat, monkeys, crafting/building, save/load, and UI.
4. Add authored animation frames for tool swings to replace procedural overlay arcs once the core behavior is final.
5. Add navmesh debug overlay for monkey routes behind a dev toggle.
6. Add balancing telemetry counters for harvest rate, monkey deposit rate, enemy raid pressure, and time-to-first-workbench.
