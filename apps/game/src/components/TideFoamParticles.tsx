import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, MAP_SIZE, getFloodLine } from '../store/gameStore';
import * as THREE from 'three';

const HALF_MAP = MAP_SIZE / 2;
const PARTICLE_COUNT = 200;
const LIFETIME = 1.0;
const SPAWN_PER_FRAME = 4;

interface Particle {
  alive: boolean;
  age: number;
  vx: number;
  vy: number;
  vz: number;
}

const DAY_FOAM_COLOR = new THREE.Color('#F0F8FF');
const NIGHT_FOAM_COLORS = [
  new THREE.Color('#00FFAA'),
  new THREE.Color('#00CCFF'),
  new THREE.Color('#8844FF'),
];

export function TideFoamParticles() {
  const pointsRef = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.PointsMaterial>(null!);

  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      alive: false,
      age: 0,
      vx: 0,
      vy: 0,
      vz: 0,
    }))
  );

  const nextSpawn = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;
      sizes[i] = 0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  useFrame((state, delta) => {
    const { gamePhase, demoSubPhase, tideProgress, tideDirection, isNight } =
      useGameStore.getState();

    // Update material for day/night
    if (matRef.current) {
      if (isNight) {
        const colorIdx = Math.floor(state.clock.elapsedTime * 0.5) % NIGHT_FOAM_COLORS.length;
        matRef.current.color.lerp(NIGHT_FOAM_COLORS[colorIdx], Math.min(delta * 4, 1));
        matRef.current.opacity += (1.0 - matRef.current.opacity) * Math.min(delta * 3, 1);
        matRef.current.blending = THREE.AdditiveBlending;
      } else {
        matRef.current.color.lerp(DAY_FOAM_COLOR, Math.min(delta * 4, 1));
        matRef.current.opacity += (0.8 - matRef.current.opacity) * Math.min(delta * 3, 1);
        matRef.current.blending = THREE.NormalBlending;
      }
    }

    const showTide =
      ((gamePhase === 'tideActive' || gamePhase === 'gameOver') ||
        (gamePhase === 'demo' && demoSubPhase === 'tideActive')) &&
      tideProgress > 0.001;

    pointsRef.current.visible = showTide;
    if (!showTide) return;

    const positions = geometry.attributes.position.array as Float32Array;
    const sizes = geometry.attributes.size.array as Float32Array;
    const parts = particles.current;
    const floodLine = getFloodLine(tideProgress, tideDirection);
    const isHorizontal = tideDirection === 'east' || tideDirection === 'west';

    // Spawn new particles
    let spawned = 0;
    for (let i = 0; i < PARTICLE_COUNT && spawned < SPAWN_PER_FRAME; i++) {
      const idx = (nextSpawn.current + i) % PARTICLE_COUNT;
      if (!parts[idx].alive) {
        const p = parts[idx];
        p.alive = true;
        p.age = 0;

        const spread = (Math.random() - 0.5) * MAP_SIZE;
        if (isHorizontal) {
          positions[idx * 3] = floodLine + (Math.random() - 0.5) * 0.8;
          positions[idx * 3 + 1] = 0.12;
          positions[idx * 3 + 2] = spread;
          p.vx = (tideDirection === 'west' ? 1 : -1) * (0.5 + Math.random());
          p.vy = 0.4 + Math.random() * 0.2;
          p.vz = (Math.random() - 0.5) * 2;
        } else {
          positions[idx * 3] = spread;
          positions[idx * 3 + 1] = 0.12;
          positions[idx * 3 + 2] = floodLine + (Math.random() - 0.5) * 0.8;
          p.vx = (Math.random() - 0.5) * 2;
          p.vy = 0.4 + Math.random() * 0.2;
          p.vz = (tideDirection === 'north' ? 1 : -1) * (0.5 + Math.random());
        }

        spawned++;
        nextSpawn.current = (idx + 1) % PARTICLE_COUNT;
      }
    }

    // Update all particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = parts[i];
      if (!p.alive) continue;

      p.age += delta;
      if (p.age >= LIFETIME) {
        p.alive = false;
        positions[i * 3 + 1] = -100;
        sizes[i] = 0;
        continue;
      }

      positions[i * 3] += p.vx * delta;
      positions[i * 3 + 1] += p.vy * delta;
      positions[i * 3 + 2] += p.vz * delta;

      const life = 1 - p.age / LIFETIME;
      sizes[i] = life * (isNight ? 0.9 : 0.6);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} visible={false}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        ref={matRef}
        color="#F0F8FF"
        transparent
        opacity={0.8}
        size={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
