import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, SAFE_ZONE_RADIUS } from '../store/gameStore';

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

    const pos = state.crabPosition;

    // Re-evaluate target periodically
    retargetTimer.current -= delta;
    if (retargetTimer.current <= 0) {
      retargetTimer.current = RETARGET_INTERVAL + Math.random() * 0.15;
      targetRef.current = pickTarget(state, pos);
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
  state: ReturnType<typeof useGameStore.getState>,
  pos: { x: number; z: number }
): { x: number; z: number } | null {
  const { demoSubPhase, timeUntilWave, shells, safeZones } = state;

  // During tide or when tide is imminent: head for nearest rock
  if (demoSubPhase === 'tideActive' || timeUntilWave <= 3) {
    return nearestZone(pos, safeZones);
  }

  // Otherwise: go for shells
  const uncollected = shells.filter((s) => !s.collected);
  if (uncollected.length === 0) {
    // No shells left, wander toward a random rock
    return safeZones.length > 0
      ? safeZones[Math.floor(Math.random() * safeZones.length)]
      : null;
  }

  // Sort by distance
  const sorted = uncollected
    .map((s) => ({ ...s, d: Math.hypot(s.x - pos.x, s.z - pos.z) }))
    .sort((a, b) => a.d - b.d);

  // Occasionally pick 2nd-nearest for variety
  if (sorted.length > 1 && Math.random() < MISS_CHANCE) {
    return sorted[1];
  }
  return sorted[0];
}

function nearestZone(
  pos: { x: number; z: number },
  zones: { x: number; z: number }[]
): { x: number; z: number } | null {
  if (zones.length === 0) return null;
  let best = zones[0];
  let bestDist = Math.hypot(best.x - pos.x, best.z - pos.z);
  for (let i = 1; i < zones.length; i++) {
    const d = Math.hypot(zones[i].x - pos.x, zones[i].z - pos.z);
    if (d < bestDist) {
      best = zones[i];
      bestDist = d;
    }
  }
  return best;
}
