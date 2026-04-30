# Serious Production Pass 4

This pass focuses on replacing placeholder/drawn art with actual asset-pack imagery and fixing the biggest gameplay/art mismatches reported.

## Art integration

- Replaced flat placeholder buildings with extracted Sunnyside building art from the supplied asset-pack reference sheets.
- Added generated runtime building sprites under `assets/generated/buildings/`:
  - blue home
  - barn cabin
  - forge workshop
  - red market shop
  - blue factory/mill
- Kept the Pixel Crawler player because it has up/down/side directions, but generated clothed versions of every Pixel Crawler player animation under `assets/generated/player/`.
- Updated all player animation references to use the clothed Pixel Crawler sprites, not the side-only Sunnyside player.
- Swapped small animated saplings for larger Sunnyside prop trees so trees no longer read smaller than the player.
- Corrected animal sprite facing: Sunnyside animal strips face left by default, so rightward motion now flips the sprite instead of leftward motion.

## Tool animation fixes

- Axe now uses the Pixel Crawler hit/chop animation.
- Pickaxe now uses the mining/crush animation.
- Hammer now uses the collect/hammering body motion.
- Sword uses the slice/slash animation.
- Tool icons are overlaid during tool use so the active axe, pickaxe, hammer, or sword reads correctly in-game.

## World production pass

- Expanded the generated island to 144 x 104 tiles.
- Added a more complete village core using real Sunnyside buildings.
- Added market, factory/mill, forge workshop, barn cabin, well, windmill, docks, crates, bushes, campfires, boats, larger forests, larger farms, animals, and enemies.
- Added multiple seeded crop fields so the map no longer starts sparse.
- Added decoration support in world save data.

## Building interiors

- Enterable home, cabin, workshop, shop, and factory/mill.
- Press E near an enterable building to go inside.
- Press E at the doorway to leave.
- Press E inside homes/cabins to rest/save.
- Press E inside workshop/shop/factory to craft seed bundles.

## Runtime files changed

- `src/engine/shared.js`
- `src/engine/art.js`
- `src/engine/world.js`
- `src/engine/game.js`
- New generated art folders under `assets/generated/`
