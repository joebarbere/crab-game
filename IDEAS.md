# Game Ideas

## 1. Tide Survival (arcade/survival) — IMPLEMENTED

A rising tide sweeps across the beach periodically. The crab must scurry to higher ground (rocks, driftwood) before the wave hits. Each wave is faster/larger. Collect shells for points between waves.

**Status:** Core gameplay complete. Title screen, wave countdown, tide from random directions, shell collection (+10 pts), safe zone rocks, game over, wave progression with scaling difficulty, screen shake, sprite facing, localStorage high scores.

**Future polish (IMPLEMENTED):** Sound effects (wave crash, shell pickup, game over), particle foam on tide edge, wave announcement text.

## 2. Hermit Crab Shell Swap (puzzle/collection)

Shells of different sizes are scattered on the beach. The crab starts small and must find progressively larger shells to "upgrade." Larger shells let you access new areas (break through barriers, survive predators) but move slower. A Metroidvania-lite loop.

## 3. Crab vs. Seagulls (top-down dodge/combat)

Seagulls swoop down casting shadows that telegraph their attack zones. The crab must dodge and reach its burrow. Later: the crab can flick sand (projectile) to stun seagulls, or pick up small rocks to throw. Clean enemy AI with shadow-based telegraphing.

## 4. Beach Cleanup (timed collection)

Trash washes ashore in waves. The crab pushes/carries litter to recycling zones before the beach fills up. Combo multiplier for sorting correctly (plastic, metal, glass). Good for a chill, score-chasing loop.

## 5. Crab Royale (arena)

Multiple AI crabs compete on a shrinking sand island (tide closes in from all sides). Bump other crabs into the water. Last crab standing wins. Power-ups spawn: speed boost, bigger claws (wider bump), temporary shell shield.

## 6. Burrow Builder (tower defense / base building)

Dig tunnels under the sand (underground layer) and defend your burrow from invaders (ants, other crabs). Surface layer is for gathering resources (seaweed, shells). Underground layer is a simple grid for tunnel placement.

---

## Tide Survival — Implementation Notes

Implemented across all 6 planned phases. Key files:

| File | Role |
|------|------|
| `store/gameStore.ts` | State machine, tide/flood logic, wave scaling, shell collection, high scores |
| `components/WaveManager.tsx` | Headless — calls `tick(delta)` each frame |
| `components/Tide.tsx` | Water plane + foam edge, position driven by store |
| `components/Rock.tsx` | Safe zone boulder (sphere + cylinder base) |
| `components/Shell.tsx` | Collectible torus with bob/spin animation |
| `components/HUD.tsx` | DOM overlay — title, score/wave/countdown, game over |
| `components/Camera.tsx` | Screen shake support |
| `components/CharacterController.tsx` | Movement gated by game phase |
| `components/CrabCharacter.tsx` | Sprite flips to face movement direction |
| `App.tsx` | SPACE key to start/restart |

### Remaining polish ideas — ALL IMPLEMENTED
- ~~Sound effects (wave crash, shell pickup, game over)~~ — procedural Web Audio API sounds
- ~~Particle foam on tide edge~~ — THREE.Points particle system in TideFoamParticles.tsx
- ~~Wave announcement text ("Wave 3 incoming!")~~ — animated HUD overlay between waves
