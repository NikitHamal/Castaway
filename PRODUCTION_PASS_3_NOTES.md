# Island Production Pass 3

This pass fixes the asset-scale and integration problems found after the Sunnyside rebuild.

## Major changes

- Added the uploaded Pixel Crawler free pack as a second curated professional asset layer under `assets/pixelcrawler/`.
- Replaced the active player with Pixel Crawler directional animation sheets:
  - idle down/side/up
  - walk down/side/up
  - run down/side/up
  - slice/attack down/side/up
  - crush/tool action down/side/up
  - collect, watering, fishing and hit sheets for future gameplay expansion
- Fixed player grounding by aligning the actual visible feet to the ground point instead of anchoring to the transparent 64x64 sheet bounds.
- Reduced the logical tile size from 48 to 32 so characters, animals, houses, tools and resources now share a coherent top-down scale.
- Rebuilt broken tile crops into clean 16x16 island tiles to remove the black/diagonal terrain artifacts.
- Replaced overcomposited oversized building sprites with cleaner small homestead sprites in the same pixel palette.
- Reduced animal scale, added home-radius wandering and collision-aware steering so cows/ducks/chickens/sheep/pigs no longer slide through the village or dominate the screen.
- Expanded village spacing so homes/workshop/well/dock no longer visually overlap.
- Tightened collision radii, interaction radii, resource radii, tool reach and pathfinding radii for the new 32px tile scale.
- Kept the new direction of the game as an island homestead/exploration game, not a survivalist/monkey-automation clone.

## Remaining roadmap

The next production pass should focus on game design depth rather than asset repair:

1. Add interior scenes for homes and workshop.
2. Add NPC villagers and dialogue.
3. Add true shoreline autotiling if the engine moves from tile IDs to tile layers.
4. Add crop seasons, weather and upgrade trees.
5. Add a proper build preview footprint and placement validation overlay.
