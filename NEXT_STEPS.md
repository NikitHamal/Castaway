# Recommended Next Steps

1. Add automated browser smoke tests: boot, load assets, move in four directions, use each tool against left/right/up/down targets, open crafting, save, reload and assert no runtime console errors.
2. Split `src/engine/game.js` again into dedicated gameplay systems: combat, monkeys, crafting/building, save/load and UI.
3. Add a real pause/settings menu with volume, keybinds, display scale, save slots and accessibility toggles.
4. Add route/navmesh debug overlay behind a dev key so monkey pathing can be tuned visually.
5. Add authored tool-swing animation frames once gameplay behavior is final; the current procedural overlay is reliable and avoids the oversized sprite bug.
6. Add audio pass: footstep ticks, tool hits, resource break, monkey task confirmation, enemy hit, raid warning and UI confirmations.
7. Add balancing telemetry counters for time-to-first-chest, time-to-first-monkey-order, resource flow, raid pressure and boss attempts.
8. Add a content pass: more POIs, better onboarding signs, early camp tutorial, improved boss mechanics and island-to-island variety.
