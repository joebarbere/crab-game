import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, SAFE_ZONE_RADIUS } from '../store/gameStore';
import { playerEntities, shellEntities, safeZoneEntities } from '../ecs/world';

const SPEED = 5;
const RETARGET_INTERVAL = 0.35;
const NOISE_AMOUNT = 0.12;
const MISS_CHANCE = 0.1;

export function DemoCrabController() {
  const targetRef = useRef<{ x: number; z: number } | null>(null);
  const retargetTimer = useRef(0);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (state.gamePhase !== 'demo') return;

    const player = playerEntities.entities[0];
    if (!player) return;
    const pos = player.position;

    // Re-evaluate target periodically
    retargetTimer.current -= delta;
    if (retargetTimer.current <= 0) {
      retargetTimer.current = RETARGET_INTERVAL + Math.random() * 0.15;
      targetRef.current = pickTarget(state.demoSubPhase, state.timeUntilWave, pos);
    }

    const target = targetRef.current;
    if (!target) return;

    const dx = target.x - pos.x;
    const dz = target.z - pos.z;
    const dist = Math.hypot(dx, dz);

    // If close enough to target (on a rock during tide), stay still
    if (
      state.demoSubPhase === 'tideActive' &&
      dist < SAFE_ZONE_RADIUS * 0.5
    ) {
      return;
    }

    if (dist < 0.1) return;

    // Normalize direction and add perpendicular noise
    const ndx = dx / dist;
    const ndz = dz / dist;
    const noise = (Math.random() - 0.5) * 2 * NOISE_AMOUNT;
    const mx = (ndx + -ndz * noise) * SPEED * delta;
    const mz = (ndz + ndx * noise) * SPEED * delta;

    state.moveCrab(mx, mz);
  });

  return null;
}

function pickTarget(
  demoSubPhase: string,
  timeUntilWave: number,
  pos: { x: number; z: number }
): { x: number; z: number } | null {
  const zones = safeZoneEntities.entities;

  // During tide or when tide is imminent: head for nearest rock
  if (demoSubPhase === 'tideActive' || timeUntilWave <= 3) {
    return nearestZone(pos, zones);
  }

  // Otherwise: go for shells
  const uncollected = shellEntities.entities.filter((e) => !e.shell.collected);
  if (uncollected.length === 0) {
    // No shells left, wander toward a random rock
    return zones.length > 0
      ? zones[Math.floor(Math.random() * zones.length)].position
      : null;
  }

  // Sort by distance
  const sorted = uncollected
    .map((e) => ({ ...e.position, d: Math.hypot(e.position.x - pos.x, e.position.z - pos.z) }))
    .sort((a, b) => a.d - b.d);

  // Occasionally pick 2nd-nearest for variety
  if (sorted.length > 1 && Math.random() < MISS_CHANCE) {
    return sorted[1];
  }
  return sorted[0];
}

function nearestZone(
  pos: { x: number; z: number },
  zones: { position: { x: number; z: number } }[]
): { x: number; z: number } | null {
  if (zones.length === 0) return null;
  let best = zones[0].position;
  let bestDist = Math.hypot(best.x - pos.x, best.z - pos.z);
  for (let i = 1; i < zones.length; i++) {
    const p = zones[i].position;
    const d = Math.hypot(p.x - pos.x, p.z - pos.z);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}
