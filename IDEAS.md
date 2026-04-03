# Game Ideas

## 1. Tide Survival (arcade/survival)

A rising tide sweeps across the beach periodically. The crab must scurry to higher ground (rocks, driftwood) before the wave hits. Each wave is faster/larger. Collect shells for points between waves.

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

## Tide Survival — Implementation Plan

### Core Concept

The crab roams a beach collecting shells for points. Periodically, a tide wave rolls in from one side. The crab must reach a safe zone (rock, elevated ground) before the water arrives or it's game over. Waves get progressively faster and more frequent.

### Phase 1: Game State & UI

**Store changes** (`gameStore.ts`):
- Add `gamePhase`: `"title" | "playing" | "gameOver"`
- Add `score`, `wave` (current wave number), `highScore`
- Add `timeUntilWave` (countdown timer)
- Add actions: `startGame()`, `endGame()`, `addScore(n)`, `nextWave()`, `tick(delta)`

**HUD component**:
- Overlay div showing score, wave number, and wave countdown timer
- Title screen with "Press SPACE to start"
- Game over screen showing final score/wave and "Press SPACE to restart"

### Phase 2: Safe Zones (Rocks)

- Create a `Rock` component — simple box/cylinder meshes with a brown/gray material
- Rocks are placed at semi-random positions on the map (fixed per wave or reshuffled each wave)
- Add `safeZones: {x, z, radius}[]` to the store
- Collision check: if crab is within a safe zone's radius when the tide hits, crab survives

### Phase 3: Tide System

- `Tide` component — a large blue semi-transparent plane that slides in from one edge (e.g., negative Z)
- Tide advances over ~3 seconds, covering the full play area, then recedes
- Direction can vary per wave (left, right, top, bottom) for variety
- During the "advancing" phase, if the crab is NOT on a safe zone when water reaches its position → game over
- Visual: water plane with slight opacity animation, maybe a foam edge

### Phase 4: Collectibles (Shells)

- `Shell` component — small sprite or mesh scattered on the sand
- Walking over a shell collects it (+10 points) and removes it
- New shells spawn between waves
- Store tracks shell positions: `shells: {id, x, z}[]`

### Phase 5: Wave Progression

- Wave 1: 10s countdown, tide from south, 2 rocks, 5 shells
- Each subsequent wave: reduce countdown by 0.5s (min 4s), add more shells, reposition rocks
- Every 5 waves: add a rock, increase tide speed
- Optional: wave announcement text ("Wave 3 incoming!")

### Phase 6: Polish

- Sound effects (wave crash, shell pickup, game over)
- Screen shake when tide hits
- Particle foam on tide edge
- Crab animation (walking sprite flip based on direction)
- High score persistence (localStorage)

### File Structure (new/modified)

```
src/
  store/gameStore.ts          # Modified — add game state, waves, shells, safe zones
  components/
    GameCanvas.tsx            # Modified — add new components to scene
    CharacterController.tsx   # Modified — disable movement when not "playing"
    HUD.tsx                   # New — score, wave, countdown, title/game-over screens
    Rock.tsx                  # New — safe zone mesh
    Tide.tsx                  # New — advancing water plane
    Shell.tsx                 # New — collectible item
    ShellManager.tsx          # New — spawns/manages shell entities
    WaveManager.tsx           # New — headless component, drives tide timing & wave progression
```
