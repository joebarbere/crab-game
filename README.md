# Crab Game: Tide Survival

A top-down arcade/survival game built with React and Three.js. Control a crab on the beach — collect shells for points, then scramble to a safe rock before the tide sweeps in. Each wave gets faster and more intense. How long can you survive?

The title screen features an AI-controlled crab that plays the game automatically until you press SPACE.

## Screenshots

### Web App (`game`)

The animated title screen with the AI demo playing in the background. Shells, rocks, and tide are all active while the title overlay is displayed.

![Game running in web browser](docs/screenshots/game-web.png)

### Electron App (`game-electron`)

The same game running inside an Electron desktop window (1280x720).

![Game running in Electron](docs/screenshots/game-electron.png)

## Video Clips

Recorded clips of the animated title screen are available in `docs/clips/` (webm format). Generate them with:

```bash
npm run clips
```

## Tech Stack

- **[React](https://react.dev/)** (v18) - UI framework
- **[react-three-fiber](https://github.com/pmndrs/react-three-fiber)** - React renderer for Three.js
- **[@react-three/drei](https://github.com/pmndrs/drei)** - Helpers and abstractions for R3F (OrthographicCamera, KeyboardControls, useTexture)
- **[Three.js](https://threejs.org/)** - 3D graphics engine
- **[Zustand](https://github.com/pmndrs/zustand)** - State management
- **[Nx](https://nx.dev/)** (v22) - Monorepo build system
- **[Vite](https://vite.dev/)** - Frontend bundler
- **[Electron](https://www.electronjs.org/)** - Desktop app framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## Project Structure

```
apps/
  game/                   # React + R3F web game
    src/
      App.tsx             # Root: KeyboardControls, SPACE handler, auto-starts demo
      components/
        GameCanvas.tsx    # R3F Canvas, lighting, scene composition
        Camera.tsx        # Orthographic top-down camera, screen shake
        TileMap.tsx       # Sand-textured ground plane
        CrabCharacter.tsx # Crab sprite rendering + mounts controllers
        CharacterController.tsx   # Player keyboard input (WASD/arrows)
        DemoCrabController.tsx    # AI bot that plays during title screen demo
        HUD.tsx           # Title, playing, tide warning, and game over overlays
        Rock.tsx          # Safe zone boulder meshes
        Shell.tsx         # Collectible torus meshes with bob/spin animation
        Tide.tsx          # Advancing water plane + foam edge
        WaveManager.tsx   # Headless: drives game tick each frame
      store/
        gameStore.ts      # Zustand store: game state machine, tide/flood logic
    public/textures/      # Sand and crab sprite textures
  game-electron/          # Electron desktop wrapper
    src/
      main.ts             # Electron main process
      preload.ts          # Context bridge preload script
scripts/
  take-screenshots.ts     # Playwright screenshot generator
  take-clips.ts           # Playwright video clip recorder
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the web game

```bash
npx nx serve game
```

Opens at [http://localhost:4200](http://localhost:4200). The title screen shows an AI demo — press **SPACE** to start playing.

### Run the Electron app

```bash
npx nx serve game-electron
```

Starts the Vite dev server and launches the game in an Electron window.

### Build for production

```bash
npx nx build game            # Build web app to dist/apps/game/
npx nx build game-electron   # Compile Electron app to dist/apps/game-electron/
```

### Generate screenshots

```bash
npm run screenshots
```

Uses Playwright to capture screenshots of the animated title screen in both web and Electron apps, saving them to `docs/screenshots/`.

### Record video clips

```bash
npm run clips
```

Uses Playwright to record webm video clips of the title screen demo, saving them to `docs/clips/`. Override the default 10-second duration with `CLIP_DURATION=20000 npm run clips`.

## Controls

| Key | Action |
|-----|--------|
| W / Arrow Up | Move up |
| S / Arrow Down | Move down |
| A / Arrow Left | Move left |
| D / Arrow Right | Move right |
| Space | Start game / Restart after game over |
