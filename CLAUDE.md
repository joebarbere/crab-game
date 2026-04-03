# CLAUDE.md

Guidelines and context for working on the crab-game monorepo.

## Project Overview

Nx 22 monorepo with two apps: a React + react-three-fiber top-down crab game (`game`) and an Electron desktop wrapper (`game-electron`). TypeScript throughout. The game implements "Tide Survival" — an arcade/survival mode where the crab collects shells for points and must reach safe zones (rocks) before periodic tide waves sweep across the map. Waves get progressively faster and more frequent.

## Commands

```bash
npm run dev              # Start web game dev server (port 4200)
npm run dev:electron     # Start Electron app (launches dev server + Electron)
npm run build            # Build web game to dist/apps/game/
npm run build:electron   # Build Electron app to dist/apps/game-electron/
npm run screenshots      # Generate screenshots with Playwright (needs xvfb on headless)
npm run clips            # Record webm video clips with Playwright (needs xvfb on headless)
npx nx build game        # Same as npm run build
npx nx serve game        # Same as npm run dev
```

## Architecture

```
apps/
  game/                        # React + R3F + Vite app (port 4200)
    src/App.tsx                # Root: KeyboardControls (WASD/arrows/SPACE), HUD overlay,
                               #   auto-starts demo on mount
    src/components/
      GameCanvas.tsx           # R3F <Canvas>, lighting, scene composition
      Camera.tsx               # OrthographicCamera, top-down, follows crab, screen shake
      TileMap.tsx              # Single plane with repeating sand texture
      CrabCharacter.tsx        # Crab sprite, mounts both player + demo controllers
      CharacterController.tsx  # Headless: reads keyboard input, updates store each frame
      DemoCrabController.tsx   # Headless: AI bot that plays during demo phase
      HUD.tsx                  # DOM overlay: demo/title, playing (score/wave/countdown), game over
      Rock.tsx                 # Safe zone boulder mesh (sphere + cylinder base)
      Shell.tsx                # Collectible torus mesh with bob/spin animation
      Tide.tsx                 # Advancing water plane + foam edge, driven by store state
      WaveManager.tsx          # Headless: calls store.tick(delta) each frame
    src/store/gameStore.ts     # Zustand store: game phase state machine, demo mode,
                               #   tide/flood logic, wave progression, shell collection,
                               #   screen shake, high scores
    public/textures/           # sand.png, crab.png (placeholder PNGs)
  game-electron/               # Electron wrapper
    src/main.ts                # BrowserWindow, loads localhost:4200 in dev, static in prod
    src/preload.ts             # Minimal contextBridge
scripts/
  take-screenshots.ts          # Playwright: starts dev server, screenshots web + electron
  take-clips.ts                # Playwright: records webm video clips of both apps
```

### App dependency graph

`game-electron` depends on `game` via `implicitDependencies` in project.json. The Electron serve target runs `nx serve game` and `wait-on http://localhost:4200` before launching Electron.

## Critical Version Constraints

**Do NOT upgrade React to v19.** R3F v8 requires `react >=18 <19`. If upgrading React, you must also upgrade `@react-three/fiber` to a version that supports React 19.

All `@nx/*` packages must be pinned to the same version (currently 22.6.4). Mismatched Nx plugin versions cause runtime errors.

| Package | Version | Constraint |
|---------|---------|-----------|
| react / react-dom | ^18.3.1 | Required by @react-three/fiber v8 |
| @react-three/fiber | ^8.18.0 | Requires react ^18, three >=0.133 |
| @react-three/drei | ^9.122.0 | Pairs with r3f v8 |
| three | ^0.160.0 | Stable, works with r3f 8 + drei 9 |
| zustand | ^5.0.12 | Framework-agnostic, works with React 18 |
| nx / @nx/* | 22.6.4 | All Nx packages must match |
| electron | ^35.0.0 | devDependency only |

## Key Patterns

### R3F performance pattern
Use `useGameStore.getState()` inside `useFrame` callbacks instead of React hooks. This avoids re-rendering React components 60 times per second. `Camera.tsx`, `CrabCharacter.tsx`, `Tide.tsx`, and `WaveManager.tsx` all follow this pattern.

### KeyboardControls placement
`<KeyboardControls>` from drei is a DOM-level provider and must wrap `<Canvas>` (it lives in `App.tsx`). Inside the Canvas, components read input via `useKeyboardControls()`.

### Game state machine
The zustand store drives a phase-based state machine: `demo` (auto-start on mount) → SPACE → `playing` ↔ `tideActive` → `gameOver` → SPACE → `playing`. The `demo` phase uses a `demoSubPhase` (`playing` | `tideActive`) to run the same game logic as real play, with the AI bot controlling the crab. Demo deaths auto-restart without affecting high scores. All per-frame game logic (countdown, tide progression, flood detection, shell collection, screen shake decay) runs in the store's `tick(delta)` method, called by the headless `WaveManager` component.

### CharacterController
Renders `null` (headless component). Uses delta-based movement with diagonal normalization for frame-rate independence. Movement is gated on game phase (`playing` or `tideActive` only). Boundary clamping is handled in the store's `moveCrab` action.

### DemoCrabController
Renders `null` (headless component). Active only during `demo` phase. AI strategy: moves toward the nearest uncollected shell during play, switches to the nearest rock when the wave countdown drops below 3s or during tide. Re-evaluates targets every ~0.35s with slight directional noise for natural-looking movement. Mounted alongside `CharacterController` in `CrabCharacter.tsx` — both self-gate on phase so they never conflict.

### Tile map
Uses a single large plane (50x50) with `RepeatWrapping` texture — NOT individual tile meshes. Much better performance (1 draw call vs hundreds). The `MAP_SIZE` constant is exported from `gameStore.ts` and used for boundary clamping and tide calculations.

### Tide system
The tide sweeps from a random cardinal direction each wave. A flood line advances across the map over a duration that decreases with each wave (3s down to 1.5s). Each frame during `tideActive`, the store checks whether the flood line has passed the crab's position — if so and the crab is not within a rock's safe zone radius, it's game over. The `Tide` component renders a water plane and foam edge whose position/scale are updated imperatively via `useFrame`.

### Wave progression
| Parameter | Base (wave 1) | Scaling | Minimum |
|-----------|--------------|---------|---------|
| Countdown | 10s | -0.5s per wave | 4s |
| Tide duration | 3s | -0.1s per wave | 1.5s |
| Rock count | 2 | +1 every 5 waves | — |
| Shell count | 5 | +2 per wave | — |

## Config Gotchas

### Electron uses CommonJS
`apps/game-electron/tsconfig.json` overrides the base config with `module: "commonjs"` and `moduleResolution: "node"`. This is required because Electron's main process runs in Node.js. Do not change to ESM.

### Electron tsconfig needs rootDir
`rootDir: "src"` is set explicitly in the electron tsconfig. Without it, tsc creates a nested `apps/game-electron/src/` directory inside the output, and Electron can't find `main.js`.

### Vite fs.allow
`apps/game/vite.config.ts` has `server.fs.allow: ['../..']` to allow Vite to serve files from the repo root. Without this, Vite blocks access to `index.html` when the dev server is started from the repo root (e.g., via `nx serve`).

### Electron dev vs prod
`main.ts` checks `process.argv.includes('--dev') || !app.isPackaged` to decide whether to load `http://localhost:4200` or built static files. DevTools open automatically in dev mode.

### Electron window size
Set to 1280x720 in `main.ts`. The screenshot and video clip scripts use the same viewport dimensions. If you change one, update the others.

## Screenshot Script

`scripts/take-screenshots.ts` uses Playwright to capture screenshots of both apps.

- Compiles to `dist/scripts/` via its own `scripts/tsconfig.json`
- Starts the Vite dev server, waits for it with `waitForServer()`
- Web screenshot: launches Chromium, navigates to localhost:4200
- Electron screenshot: compiles electron TS, launches via `playwright._electron`
- Both wait 5 seconds after page load for R3F/Three.js to render and the demo AI to play
- Outputs to `docs/screenshots/`

## Video Clip Script

`scripts/take-clips.ts` uses Playwright's `recordVideo` API to capture webm video clips of both apps.

- Same compile/serve pattern as the screenshot script
- Records the demo title screen (AI plays automatically, no SPACE press needed)
- Default clip length: 10 seconds. Override with `CLIP_DURATION` env var (milliseconds), e.g. `CLIP_DURATION=20000 npm run clips`
- Outputs to `docs/clips/` (`game-web.webm`, `game-electron.webm`)
- Resolution: 1280x720 (matches screenshot script and Electron window)

**Running on headless systems:** needs `xvfb-run -a` and `DISPLAY=:99`. The Chromium executable path defaults to `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` — override with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` env var. Electron launches with `--no-sandbox --disable-gpu` for headless compatibility.

## Build Outputs

- `dist/apps/game/` — Vite production build (static HTML/JS/CSS)
- `dist/apps/game-electron/` — Compiled Electron main process (main.js, preload.js)
- `dist/scripts/` — Compiled screenshot script
- `.nx/` — Nx computation cache (do not delete unless troubleshooting)

## Testing

No test framework is configured yet. When adding tests:
- The Nx preset supports Vitest — add `@nx/vitest` plugin
- R3F components need a mock WebGL context (e.g., `@react-three/test-renderer`)
- Electron main process tests should use Node.js test runner or Vitest with `environment: 'node'`
