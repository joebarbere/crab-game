# Crab Game

A top-down 2D game built with React and Three.js, featuring a crab character navigating a sandy environment. The game runs in the browser and as a desktop application via Electron.

## Screenshots

### Web App (`game`)

The game running in a browser at `http://localhost:4200`. The scene features a sand tile map rendered with a repeating texture and a crab sprite controlled via keyboard input.

![Game running in web browser](docs/screenshots/game-web.png)

### Electron App (`game-electron`)

The same game running inside an Electron desktop window (1280x720). Electron loads the Vite dev server during development and serves built static files in production.

![Game running in Electron](docs/screenshots/game-electron.png)

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
      App.tsx             # Root component with KeyboardControls
      components/
        GameCanvas.tsx    # R3F Canvas setup
        Camera.tsx        # Orthographic top-down camera (follows crab)
        TileMap.tsx       # Sand-textured ground plane
        CrabCharacter.tsx # Crab sprite rendering
        CharacterController.tsx  # WASD/arrow key input handler
      store/
        gameStore.ts      # Zustand store for game state
    public/textures/      # Sand and crab sprite textures
  game-electron/          # Electron desktop wrapper
    src/
      main.ts             # Electron main process
      preload.ts          # Context bridge preload script
scripts/
  take-screenshots.ts     # Playwright screenshot generator
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

Opens at [http://localhost:4200](http://localhost:4200). Use **WASD** or **arrow keys** to move the crab.

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

Uses Playwright to capture screenshots of both the web and Electron apps, saving them to `docs/screenshots/`.

## Controls

| Key | Action |
|-----|--------|
| W / Arrow Up | Move forward |
| S / Arrow Down | Move backward |
| A / Arrow Left | Move left |
| D / Arrow Right | Move right |
