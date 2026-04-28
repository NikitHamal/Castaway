# Castaway Mimics — Generated Asset Build

A browser-playable, top-down survival sandbox prototype focused on monkey mimic automation. It runs as a static site and can be opened locally or hosted on GitHub Pages.

This build uses **original generated pixel-art assets** created for the prototype. The direction is a lush 2.5D tropical survival style, but it does not include copied commercial assets, logos, names, or proprietary UI.

## Run locally

Open `index.html` in a browser.

Optional local server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages deploy

1. Create a new repository.
2. Upload everything in this folder to the repo root.
3. Go to **Settings → Pages**.
4. Set **Deploy from branch**, choose `main`, folder `/root`.
5. Open the Pages URL.

## Core controls

- `WASD` / arrow keys: move
- `Shift`: sprint
- `Mouse click` or `Space`: use selected tool / attack / hammer
- `E`: pick up, interact, tame monkeys, add blueprint resources
- `Shift + E` at a chest: withdraw stored resources
- `1`-`0`, `Tab`, `[` and `]`: hotbar selection
- `C`: crafting and blueprint menu
- `B`: cycle current blueprint
- `F` or right-click: place current blueprint
- `M`: Mimic Mode
- `V`: generated asset viewer / QA browser
- `F1`: help panel
- `L`: load save
- `N`: new run

## Monkey Mimic loop

1. Tame a monkey with **Monkey Munch**.
2. Press `M` to enter Mimic Mode.
3. Stand near a tamed monkey and press `E` so it watches you.
4. Perform one action:
   - Chop a tree or bush → monkey learns harvesting.
   - Mine rock or ore → monkey learns mining.
   - Pick up or deposit items → monkey learns gather-and-deposit.
   - Add resources / hammer blueprint → monkey learns building.
   - Hammer a workbench/forge job → monkey learns crafting.
   - Attack an enemy → monkey learns combat guard.
5. The monkey loops that task until resources or targets are gone.

## Implemented features

- Procedural islands with beach, meadow, swamp, volcanic ash/lava, water, paths and POIs.
- Generated pixel-art terrain, characters, resources, buildables, item icons, UI frames and effects wired into the renderer.
- In-game asset QA viewer that loads every generated sheet: press `V`, then `[` / `]` to page.
- Resource gathering: trees, rocks, iron rocks and berry bushes.
- Physical dropped items and chest storage.
- Blueprint construction: place ghosts, add resources, hammer into built structures.
- Workbench/forge queued crafting that can be accelerated by monkeys.
- Tameable monkeys with AI state machines for harvesting, gathering, building, crafting and combat.
- Hunger, health and stamina survival stats.
- Goblin raids against your camp.
- Vault dungeon with a boss and loot chest.
- Raft island travel.
- Galleon repair win condition.
- Browser localStorage save/load via bed interaction.

## Generated asset structure

- `assets/generated/sheets/` — the full generated spritesheets.
- `assets/generated/slices/` — every sheet automatically broken into transparent component PNGs.
- `assets/generated/curated/` — named, resized sprites used directly by the game.
- `assets/generated/previews/` — numbered contact sheets used for QA and mapping.
- `assets/generated/atlas_manifest.json` — sheet paths, component coordinates and curated sprite metadata.
- `assets/generated/ASSET_REVIEW.md` — perspective/style review and integration notes.

## Main files

- `index.html` — static game page
- `style.css` — full-screen canvas and boot overlay styling
- `src/main.js` — game loop, rendering, AI, crafting, world generation, input and save/load
- `assets/generated/` — generated spritesheets, slices, curated sprites and QA manifests
- `tools/prepare_generated_assets.py` — rebuilds generated asset folders from the generated sheets
- `tools/patch_game_with_assets.py` — documents/automates the renderer patching workflow used for this build
