# Castaway Asset Cleanup Report

## Scope
- Cleaned generated curated assets to remove border-connected background leftovers, white specks, and light matte halos.
- Left the main player swordsman source sprites untouched, per request.
- Preserved existing canvas dimensions for gameplay stability instead of rescaling runtime assets.
- Applied PNG optimization on cleaned assets, plus lossless optimization on the swordsman sheets and generated atlas sheets.

## Overall result
- Curated PNGs scanned (excluding swordsman): **188**
- Curated PNGs that were eligible for cleanup: **163**
- Files with actual pixel changes: **163**
- Files unchanged after analysis: **25**
- Total pixels adjusted: **8552**
- Border/background pixels removed: **1328**
- Tiny white specks removed: **3671**
- Halo edge pixels recolored/decontaminated: **3495**
- Bright edge pixels softly faded where no donor color existed: **75**
- Aggregate white-fringe reduction score: **6209**

## By category
| category | files | modified | pixels_changed | bg_removed | specks_removed | halo_recolored | fringe_delta |
| --- | --- | --- | --- | --- | --- | --- | --- |
| characters | 17 | 17 | 539 | 76 | 238 | 225 | 365 |
| fx | 13 | 13 | 1587 | 235 | 535 | 753 | 1020 |
| icons | 42 | 42 | 681 | 192 | 264 | 225 | 403 |
| props | 82 | 82 | 5073 | 679 | 2452 | 1946 | 3945 |
| tiles | 19 | 0 | 0 | 0 | 0 | 0 | 0 |
| ui | 15 | 9 | 672 | 146 | 182 | 346 | 476 |

## Highest-impact cleaned files
| file | size | pixels_changed | bg_removed | specks_removed | halo_recolored | fringe_delta |
| --- | --- | --- | --- | --- | --- | --- |
| assets/generated/curated/fx/fx_slash_0.png | 56x48 | 292 | 0 | 68 | 218 | 200 |
| assets/generated/curated/fx/fx_splash.png | 54x42 | 257 | 2 | 86 | 165 | 157 |
| assets/generated/curated/fx/fx_spark_0.png | 35x36 | 202 | 149 | 37 | 17 | 104 |
| assets/generated/curated/ui/ui_minimap_round.png | 124x124 | 157 | 16 | 47 | 94 | 118 |
| assets/generated/curated/fx/fx_slash_1.png | 50x48 | 149 | 2 | 60 | 74 | 111 |
| assets/generated/curated/props/prop_palm_1.png | 70x108 | 145 | 13 | 71 | 61 | 119 |
| assets/generated/curated/props/poi_mast.png | 70x88 | 138 | 7 | 85 | 46 | 114 |
| assets/generated/curated/props/poi_galleon_hull.png | 105x72 | 133 | 1 | 66 | 67 | 94 |
| assets/generated/curated/props/prop_palm_3.png | 60x102 | 130 | 1 | 64 | 65 | 105 |
| assets/generated/curated/props/prop_palm_2.png | 70x112 | 126 | 5 | 66 | 55 | 110 |
| assets/generated/curated/ui/ui_health_ring.png | 58x58 | 118 | 34 | 33 | 52 | 81 |
| assets/generated/curated/props/prop_palm_0.png | 73x112 | 114 | 13 | 62 | 39 | 99 |
| assets/generated/curated/fx/fx_poison.png | 34x42 | 114 | 52 | 1 | 19 | 29 |
| assets/generated/curated/ui/ui_stamina_ring.png | 58x58 | 106 | 24 | 26 | 57 | 87 |
| assets/generated/curated/fx/fx_dust_0.png | 47x36 | 105 | 2 | 53 | 50 | 76 |
| assets/generated/curated/props/poi_cave_gate.png | 92x82 | 104 | 11 | 50 | 43 | 74 |
| assets/generated/curated/characters/boss_attack.png | 92x78 | 101 | 3 | 58 | 40 | 79 |
| assets/generated/curated/props/prop_workbench.png | 87x62 | 98 | 27 | 33 | 38 | 85 |
| assets/generated/curated/ui/ui_hunger_ring.png | 52x52 | 97 | 48 | 14 | 35 | 67 |
| assets/generated/curated/props/prop_raft_sail.png | 79x82 | 95 | 4 | 59 | 32 | 75 |
| assets/generated/curated/props/poi_bridge.png | 83x56 | 90 | 17 | 40 | 33 | 74 |
| assets/generated/curated/props/prop_wreck_3.png | 90x62 | 89 | 6 | 56 | 27 | 75 |
| assets/generated/curated/props/poi_tilled_soil.png | 99x54 | 89 | 2 | 60 | 27 | 74 |
| assets/generated/curated/fx/fx_fire_2.png | 41x54 | 89 | 4 | 43 | 42 | 68 |
| assets/generated/curated/fx/fx_smoke.png | 41x48 | 88 | 0 | 36 | 53 | 52 |
| assets/generated/curated/props/poi_scarecrow.png | 48x60 | 86 | 0 | 47 | 39 | 59 |
| assets/generated/curated/props/poi_vault_round.png | 88x82 | 83 | 8 | 36 | 39 | 60 |
| assets/generated/curated/props/poi_drying_rack.png | 67x48 | 83 | 26 | 19 | 38 | 50 |
| assets/generated/curated/props/prop_wreck_2.png | 74x62 | 80 | 7 | 50 | 23 | 71 |
| assets/generated/curated/props/prop_banana_plant.png | 53x58 | 79 | 3 | 45 | 31 | 70 |
| assets/generated/curated/props/poi_hatch.png | 73x52 | 77 | 20 | 16 | 43 | 49 |
| assets/generated/curated/props/poi_crops.png | 84x54 | 76 | 4 | 37 | 35 | 59 |
| assets/generated/curated/props/prop_raft.png | 71x54 | 74 | 11 | 27 | 36 | 63 |
| assets/generated/curated/fx/fx_hit_axe.png | 40x42 | 74 | 3 | 40 | 31 | 55 |
| assets/generated/curated/props/poi_dock.png | 80x52 | 74 | 2 | 41 | 31 | 52 |
| assets/generated/curated/props/prop_wall.png | 80x52 | 73 | 12 | 39 | 22 | 63 |
| assets/generated/curated/ui/ui_build_reticle.png | 40x40 | 73 | 0 | 15 | 58 | 46 |
| assets/generated/curated/props/poi_lantern_post.png | 34x54 | 73 | 20 | 21 | 32 | 44 |
| assets/generated/curated/icons/icon_metal_sword.png | 34x34 | 73 | 42 | 12 | 19 | 21 |
| assets/generated/curated/props/prop_tent.png | 94x76 | 70 | 6 | 43 | 21 | 58 |

## Notes
- The cleanup focuses on background/edge contamination. It does **not** redraw asset anatomy or re-author object designs.
- Tiles were intentionally left at original pixel content because they are full-tile textures, not transparent cutout sprites.
- Canvas sizes were preserved to avoid introducing scaling regressions in runtime draw code.
- If you later want a stricter visual pass, the next step would be manual re-authoring or targeted regeneration for the weakest non-swordsman AI assets.
