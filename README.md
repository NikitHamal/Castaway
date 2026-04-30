# Island

A browser-based open-world island-life prototype rebuilt around the Sunnyside World asset pack.

## Rebuild direction

This build removes the previous survival-clone systems and replaces them with a new Island foundation:

- Sunnyside-only runtime art layer
- deterministic island generation
- player movement in every direction
- right-click A* pathfinding
- homes, workshop, well, dock and windmill building loop
- crop plots, planting and harvesting
- fishing from docks
- ambient animals, farming and building instead of automation baggage
- clean hotbar, backpack, build panel and asset viewer

Run locally:

```bash
npm start
```

Then open `http://localhost:8080`.
