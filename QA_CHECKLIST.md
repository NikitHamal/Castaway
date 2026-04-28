# Production QA Checklist

Use this checklist for the next manual/browser test pass.

## Movement and tool facing
- Move left, right, up and down with WASD/arrow keys.
- Use axe, pickaxe, hammer and sword with Space while facing each direction.
- Use mouse click to aim tools at targets to the left, right, above and below the player.
- Confirm the body and tool swing face the target and do not scale-pop.

## Combat
- Attack a goblin with hand/axe/sword/metal sword.
- Confirm hit flash, chip particles, damage text, knockback and small screen shake.
- Let a goblin hit the player and confirm red flash, damage text and invulnerability window.
- Test a raid near walls/chest/workbench and confirm enemies route instead of getting stuck on the map edge.

## Monkey AI
- Teach harvest, gather/deposit, build, craft and combat.
- Confirm a monkey can path around trees/buildings/blueprints.
- Confirm gather monkeys pick up items and deposit in chests.
- Confirm build monkeys withdraw from chests or pick up loose resources.
- Confirm craft monkeys hammer queued station jobs.

## Save/load
- Save at a bed.
- Reload with L.
- Confirm player inventory, monkey orders, chests, blueprints, buildings, current hotbar, current blueprint, raid timer and dungeon return state are preserved.

## Visual checks
- Watch the player during day and night; the old black blob should not appear.
- Check water edges while walking slowly; tile seams should be minimized.
- Open C, M, V and F1 panels and verify text fits.
