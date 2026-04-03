import {
  world,
  playerEntities,
  shellEntities,
  safeZoneEntities,
  Entity,
} from './world';
import { SAFE_ZONE_RADIUS, MAP_SIZE } from '../store/gameStore';

const HALF_MAP = MAP_SIZE / 2;

// --- Player entity management ---

let playerEntity: Entity | null = null;

export function ensurePlayer(): Entity {
  if (!playerEntity || !playerEntities.has(playerEntity as any)) {
    playerEntity = world.add({
      position: { x: 0, z: 0 },
      facing: 1,
      isPlayer: true,
    });
  }
  return playerEntity;
}

export function getPlayer(): Entity | null {
  return playerEntities.entities.length > 0 ? playerEntities.entities[0] : null;
}

export function resetPlayerPosition() {
  const player = ensurePlayer();
  player.position = { x: 0, z: 0 };
  player.facing = 1;
}

// --- Spawning ---

export function spawnShells(wave: number) {
  // Remove existing shells
  for (const entity of [...shellEntities.entities]) {
    world.remove(entity);
  }

  const count = 5 + (wave - 1) * 2;
  const range = HALF_MAP - 2;

  for (let i = 0; i < count; i++) {
    world.add({
      position: {
        x: (Math.random() * 2 - 1) * range,
        z: (Math.random() * 2 - 1) * range,
      },
      shell: { id: `${wave}-${i}`, collected: false, points: 10 },
      bobOffset: Math.random() * Math.PI * 2,
    });
  }
}

export function spawnRocks(wave: number) {
  // Remove existing rocks
  for (const entity of [...safeZoneEntities.entities]) {
    world.remove(entity);
  }

  const count = 2 + Math.floor((wave - 1) / 5);
  const range = HALF_MAP - 4;
  const rocks: { x: number; z: number }[] = [];

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

    rocks.push({ x, z });
    world.add({
      position: { x, z },
      safeZone: { radius: SAFE_ZONE_RADIUS },
    });
  }
}

// --- Wave reset ---

export function spawnWaveEntities(wave: number) {
  resetPlayerPosition();
  spawnShells(wave);
  spawnRocks(wave);
}

export function clearAllEntities() {
  for (const entity of [...world.entities]) {
    world.remove(entity);
  }
  playerEntity = null;
}
