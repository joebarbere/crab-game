import { create } from 'zustand';

// --- Constants ---
export const MAP_SIZE = 50;
const HALF_MAP = MAP_SIZE / 2;
const SHELL_COLLECT_RADIUS = 1.2;
const SAFE_ZONE_RADIUS = 1.8;

// --- Types ---
export interface Shell {
  id: string;
  x: number;
  z: number;
  collected: boolean;
}

export interface SafeZone {
  x: number;
  z: number;
  radius: number;
}

export type GamePhase = 'title' | 'playing' | 'tideActive' | 'gameOver';
export type TideDirection = 'north' | 'south' | 'east' | 'west';

interface GameState {
  crabPosition: { x: number; z: number };
  crabFacing: 1 | -1;
  gamePhase: GamePhase;
  score: number;
  highScore: number;
  wave: number;
  timeUntilWave: number;
  tideProgress: number;
  tideDirection: TideDirection;
  safeZones: SafeZone[];
  shells: Shell[];
  screenShake: number;

  moveCrab: (dx: number, dz: number) => void;
  startGame: () => void;
  tick: (delta: number) => void;
}

// --- Wave helpers ---
function getCountdown(wave: number): number {
  return Math.max(4, 10 - (wave - 1) * 0.5);
}

function getTideDuration(wave: number): number {
  return Math.max(1.5, 3 - (wave - 1) * 0.1);
}

function randomDirection(): TideDirection {
  const dirs: TideDirection[] = ['north', 'south', 'east', 'west'];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function generateRocks(wave: number): SafeZone[] {
  const count = 2 + Math.floor((wave - 1) / 5);
  const rocks: SafeZone[] = [];
  const range = HALF_MAP - 4;

  for (let i = 0; i < count; i++) {
    let x = 0,
      z = 0;
    let attempts = 0;
    do {
      x = (Math.random() * 2 - 1) * range;
      z = (Math.random() * 2 - 1) * range;
      attempts++;
    } while (
      attempts < 50 &&
      ((Math.abs(x) < 3 && Math.abs(z) < 3) ||
        rocks.some((r) => Math.hypot(r.x - x, r.z - z) < 5))
    );
    rocks.push({ x, z, radius: SAFE_ZONE_RADIUS });
  }
  return rocks;
}

function generateShells(wave: number): Shell[] {
  const count = 5 + (wave - 1) * 2;
  const shells: Shell[] = [];
  const range = HALF_MAP - 2;

  for (let i = 0; i < count; i++) {
    shells.push({
      id: `${wave}-${i}`,
      x: (Math.random() * 2 - 1) * range,
      z: (Math.random() * 2 - 1) * range,
      collected: false,
    });
  }
  return shells;
}

// --- Flood detection ---
function getFloodLine(progress: number, direction: TideDirection): number {
  switch (direction) {
    case 'south':
      return HALF_MAP - progress * MAP_SIZE;
    case 'north':
      return -HALF_MAP + progress * MAP_SIZE;
    case 'east':
      return HALF_MAP - progress * MAP_SIZE;
    case 'west':
      return -HALF_MAP + progress * MAP_SIZE;
  }
}

function isCrabFlooded(
  pos: { x: number; z: number },
  progress: number,
  direction: TideDirection
): boolean {
  const line = getFloodLine(progress, direction);
  switch (direction) {
    case 'south':
      return pos.z > line;
    case 'north':
      return pos.z < line;
    case 'east':
      return pos.x > line;
    case 'west':
      return pos.x < line;
  }
}

function isCrabOnSafeZone(
  pos: { x: number; z: number },
  zones: SafeZone[]
): boolean {
  return zones.some((z) => Math.hypot(z.x - pos.x, z.z - pos.z) <= z.radius);
}

// --- Store ---
function loadHighScore(): number {
  try {
    return parseInt(localStorage.getItem('crabGameHighScore') || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  crabPosition: { x: 0, z: 0 },
  crabFacing: 1,
  gamePhase: 'title',
  score: 0,
  highScore: loadHighScore(),
  wave: 1,
  timeUntilWave: 10,
  tideProgress: 0,
  tideDirection: 'south',
  safeZones: [],
  shells: [],
  screenShake: 0,

  moveCrab: (dx, dz) => {
    const pos = get().crabPosition;
    const newX = Math.max(
      -HALF_MAP + 1,
      Math.min(HALF_MAP - 1, pos.x + dx)
    );
    const newZ = Math.max(
      -HALF_MAP + 1,
      Math.min(HALF_MAP - 1, pos.z + dz)
    );
    const facing = dx !== 0 ? (dx > 0 ? 1 : -1) : get().crabFacing;
    set({
      crabPosition: { x: newX, z: newZ },
      crabFacing: facing as 1 | -1,
    });
  },

  startGame: () => {
    const rocks = generateRocks(1);
    const shells = generateShells(1);
    set({
      gamePhase: 'playing',
      crabPosition: { x: 0, z: 0 },
      crabFacing: 1,
      score: 0,
      wave: 1,
      timeUntilWave: getCountdown(1),
      tideProgress: 0,
      tideDirection: randomDirection(),
      safeZones: rocks,
      shells: shells,
      screenShake: 0,
      highScore: loadHighScore(),
    });
  },

  tick: (delta) => {
    const state = get();
    const updates: Partial<GameState> = {};

    // Decay screen shake
    if (state.screenShake > 0) {
      updates.screenShake = Math.max(0, state.screenShake - delta * 3);
    }

    if (state.gamePhase === 'playing') {
      // Shell collection
      const pos = state.crabPosition;
      let scoreGained = 0;
      let shellsChanged = false;
      const newShells = state.shells.map((s) => {
        if (
          !s.collected &&
          Math.hypot(s.x - pos.x, s.z - pos.z) < SHELL_COLLECT_RADIUS
        ) {
          shellsChanged = true;
          scoreGained += 10;
          return { ...s, collected: true };
        }
        return s;
      });

      if (shellsChanged) {
        updates.shells = newShells;
        updates.score = state.score + scoreGained;
      }

      // Wave countdown
      const newTime = state.timeUntilWave - delta;
      if (newTime <= 0) {
        updates.gamePhase = 'tideActive';
        updates.timeUntilWave = 0;
        updates.tideProgress = 0;
        updates.screenShake = 0.4;
      } else {
        updates.timeUntilWave = newTime;
      }

      set(updates as Partial<GameState>);
    } else if (state.gamePhase === 'tideActive') {
      const tideDuration = getTideDuration(state.wave);
      const newProgress = Math.min(
        1,
        state.tideProgress + delta / tideDuration
      );

      // Check if crab is in the flooded zone
      const pos = state.crabPosition;
      if (isCrabFlooded(pos, newProgress, state.tideDirection)) {
        if (!isCrabOnSafeZone(pos, state.safeZones)) {
          const newHighScore = Math.max(state.score, state.highScore);
          try {
            localStorage.setItem('crabGameHighScore', String(newHighScore));
          } catch {
            /* noop */
          }
          set({
            ...updates,
            gamePhase: 'gameOver',
            highScore: newHighScore,
            tideProgress: newProgress,
          });
          return;
        }
      }

      if (newProgress >= 1) {
        // Wave survived — next wave
        const nextWave = state.wave + 1;
        const rocks = generateRocks(nextWave);
        const shells = generateShells(nextWave);
        set({
          ...updates,
          gamePhase: 'playing',
          wave: nextWave,
          tideProgress: 0,
          timeUntilWave: getCountdown(nextWave),
          tideDirection: randomDirection(),
          safeZones: rocks,
          shells: shells,
          screenShake: 0.5,
        });
      } else {
        set({ ...updates, tideProgress: newProgress });
      }
    } else {
      // title or gameOver — just apply shake decay if any
      if (Object.keys(updates).length > 0) {
        set(updates as Partial<GameState>);
      }
    }
  },
}));

export { getFloodLine };
