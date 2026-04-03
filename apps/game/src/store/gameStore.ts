import { create } from 'zustand';
import {
  world,
  playerEntities,
  shellEntities,
  safeZoneEntities,
} from '../ecs/world';
import { spawnWaveEntities, ensurePlayer } from '../ecs/helpers';
import {
  playShellPickup,
  playTideStart,
  playGameOver,
  playWaveSurvived,
} from '../audio/soundManager';

// --- Constants ---
export const MAP_SIZE = 50;
const HALF_MAP = MAP_SIZE / 2;
export const SHELL_COLLECT_RADIUS = 1.2;
export const SAFE_ZONE_RADIUS = 1.8;

// --- Types ---
export type GamePhase =
  | 'title'
  | 'demo'
  | 'playing'
  | 'tideActive'
  | 'gameOver';
export type TideDirection = 'north' | 'south' | 'east' | 'west';

interface GameState {
  gamePhase: GamePhase;
  demoSubPhase: 'playing' | 'tideActive';
  score: number;
  highScore: number;
  wave: number;
  timeUntilWave: number;
  tideProgress: number;
  tideDirection: TideDirection;
  screenShake: number;
  isNight: boolean;

  moveCrab: (dx: number, dz: number) => void;
  startGame: () => void;
  startDemo: () => void;
  toggleDayNight: () => void;
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

// --- Flood detection ---
export function getFloodLine(
  progress: number,
  direction: TideDirection
): number {
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

function isCrabOnSafeZone(pos: { x: number; z: number }): boolean {
  return safeZoneEntities.entities.some(
    (e) => Math.hypot(e.position.x - pos.x, e.position.z - pos.z) <= e.safeZone.radius
  );
}

// --- Store ---
function loadHighScore(): number {
  try {
    return (
      parseInt(localStorage.getItem('crabGameHighScore') || '0', 10) || 0
    );
  } catch {
    return 0;
  }
}

function initWaveState(wave: number) {
  spawnWaveEntities(wave);
  return {
    score: 0,
    wave,
    timeUntilWave: getCountdown(wave),
    tideProgress: 0,
    tideDirection: randomDirection(),
    screenShake: 0,
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  gamePhase: 'title',
  demoSubPhase: 'playing',
  score: 0,
  highScore: loadHighScore(),
  wave: 1,
  timeUntilWave: 10,
  tideProgress: 0,
  tideDirection: 'south',
  screenShake: 0,
  isNight: false,

  toggleDayNight: () => {
    set((state) => ({ isNight: !state.isNight }));
  },

  moveCrab: (dx, dz) => {
    const player = playerEntities.entities[0];
    if (!player) return;
    const pos = player.position;
    pos.x = Math.max(-HALF_MAP + 1, Math.min(HALF_MAP - 1, pos.x + dx));
    pos.z = Math.max(-HALF_MAP + 1, Math.min(HALF_MAP - 1, pos.z + dz));
    if (dx !== 0) {
      player.facing = dx > 0 ? 1 : -1;
    }
  },

  startGame: () => {
    set({
      gamePhase: 'playing',
      ...initWaveState(1),
      highScore: loadHighScore(),
    });
  },

  startDemo: () => {
    set({
      gamePhase: 'demo',
      demoSubPhase: 'playing',
      ...initWaveState(1),
    });
  },

  tick: (delta) => {
    const state = get();
    const updates: Partial<GameState> = {};
    const isDemo = state.gamePhase === 'demo';

    // Decay screen shake
    if (state.screenShake > 0) {
      updates.screenShake = Math.max(0, state.screenShake - delta * 3);
    }

    // Determine effective sub-phase
    const effectivePhase = isDemo ? state.demoSubPhase : state.gamePhase;

    const player = playerEntities.entities[0];
    if (!player) return;
    const pos = player.position;

    if (effectivePhase === 'playing') {
      // Shell collection via ECS
      let scoreGained = 0;
      for (const entity of shellEntities.entities) {
        if (
          !entity.shell.collected &&
          Math.hypot(entity.position.x - pos.x, entity.position.z - pos.z) <
            SHELL_COLLECT_RADIUS
        ) {
          entity.shell.collected = true;
          scoreGained += entity.shell.points;
        }
      }
      if (scoreGained > 0) {
        updates.score = state.score + scoreGained;
        if (!isDemo) playShellPickup();
      }

      // Wave countdown
      const newTime = state.timeUntilWave - delta;
      if (newTime <= 0) {
        if (isDemo) {
          updates.demoSubPhase = 'tideActive';
        } else {
          updates.gamePhase = 'tideActive';
        }
        updates.timeUntilWave = 0;
        updates.tideProgress = 0;
        updates.screenShake = 0.4;
        if (!isDemo) playTideStart();
      } else {
        updates.timeUntilWave = newTime;
      }

      set(updates as Partial<GameState>);
    } else if (effectivePhase === 'tideActive') {
      const tideDuration = getTideDuration(state.wave);
      const newProgress = Math.min(
        1,
        state.tideProgress + delta / tideDuration
      );

      // Check if crab is in the flooded zone
      if (isCrabFlooded(pos, newProgress, state.tideDirection)) {
        if (!isCrabOnSafeZone(pos)) {
          if (isDemo) {
            get().startDemo();
          } else {
            const newHighScore = Math.max(state.score, state.highScore);
            try {
              localStorage.setItem('crabGameHighScore', String(newHighScore));
            } catch {
              /* noop */
            }
            playGameOver();
            set({
              ...updates,
              gamePhase: 'gameOver',
              highScore: newHighScore,
              tideProgress: newProgress,
            });
          }
          return;
        }
      }

      if (newProgress >= 1) {
        // Wave survived — next wave
        const nextWave = state.wave + 1;
        spawnWaveEntities(nextWave);
        if (!isDemo) playWaveSurvived();
        set({
          ...updates,
          ...(isDemo
            ? { demoSubPhase: 'playing' as const }
            : { gamePhase: 'playing' as const }),
          wave: nextWave,
          tideProgress: 0,
          timeUntilWave: getCountdown(nextWave),
          tideDirection: randomDirection(),
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
