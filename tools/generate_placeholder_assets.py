#!/usr/bin/env python3
"""
Fast optional asset helper for Castaway Mimics.
The game currently draws its pixel art procedurally in src/main.js so it runs with no build step.
Run this script if you want a starter SVG sheet/manifest for replacing the procedural art later.
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)

sprites = [
    ("tile_grass", 0, 0, "#4b9b42", [(4,8,3,2,"#76c865"),(18,20,2,2,"#2f6f31"),(25,11,2,2,"#f2d66b")]),
    ("tile_sand", 32, 0, "#e8c76f", [(8,7,8,1,"#ffe29c"),(20,22,7,1,"#bd904b")]),
    ("tile_water", 64, 0, "#227da0", [(5,10,13,1,"#7be1d7"),(16,24,10,1,"#126074")]),
    ("icon_wood", 0, 32, "none", [(5,12,22,8,"#a85d2a"),(5,12,22,2,"#d88a42")]),
    ("icon_stone", 32, 32, "none", [(9,15,14,10,"#8e7e63"),(12,10,9,6,"#b7aa8a")]),
    ("icon_fiber", 64, 32, "none", [(10,7,3,18,"#76c865"),(16,5,3,20,"#4b9b42"),(22,9,3,16,"#76c865")]),
    ("icon_munch", 96, 32, "none", [(12,6,8,18,"#d981ff"),(10,4,12,4,"#d9c2ff")]),
]

svg_parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80" viewBox="0 0 160 80" shape-rendering="crispEdges">']
manifest = {}
for name, x, y, bg, rects in sprites:
    manifest[name] = {"x": x, "y": y, "w": 32, "h": 32}
    if bg != "none":
        svg_parts.append(f'<rect x="{x}" y="{y}" width="32" height="32" fill="{bg}"/>')
    for rx, ry, rw, rh, fill in rects:
        svg_parts.append(f'<rect x="{x+rx}" y="{y+ry}" width="{rw}" height="{rh}" fill="{fill}"/>')
    svg_parts.append(f'<rect x="{x}" y="{y}" width="32" height="32" fill="none" stroke="#2a1715"/>')
svg_parts.append('</svg>')

(ASSETS / "procedural_sprite_sheet.svg").write_text("\n".join(svg_parts), encoding="utf-8")
(ASSETS / "sprite_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print("Wrote assets/procedural_sprite_sheet.svg and assets/sprite_manifest.json")
