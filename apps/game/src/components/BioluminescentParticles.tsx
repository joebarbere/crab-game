import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, MAP_SIZE, getFloodLine } from '../store/gameStore';
import * as THREE from 'three';

const PARTICLE_COUNT = 80;
const HALF_MAP = MAP_SIZE / 2;

const GLOW_COLORS = [
  new THREE.Color('#00FFFF'),
  new THREE.Color('#44FF88'),
  new THREE.Color('#AA88FF'),
];

export function BioluminescentParticles() {
  const pointsRef = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.PointsMaterial>(null!);

  const ages = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT));
  const velocities = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 2)); // vx, vz per particle

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

  // Initialize particles when they first become visible
  const initialized = useRef(false);

  useFrame((state, delta) => {
    const { gamePhase, demoSubPhase, tideProgress, tideDirection, isNight } =
      useGameStore.getState();

    const showTide =
      ((gamePhase === 'tideActive' || gamePhase === 'gameOver') ||
        (gamePhase === 'demo' && demoSubPhase === 'tideActive')) &&
      tideProgress > 0.001;

    const visible = isNight && showTide;
    pointsRef.current.visible = visible;
    if (!visible) {
      initialized.current = false;
      return;
    }

    const positions = geometry.attributes.position.array as Float32Array;
    const sizes = geometry.attributes.size.array as Float32Array;
    const floodLine = getFloodLine(tideProgress, tideDirection);
    const isHorizontal = tideDirection === 'east' || tideDirection === 'west';
    const time = state.clock.elapsedTime;

    // Scatter particles across the flooded area
    if (!initialized.current) {
      initialized.current = true;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        ages.current[i] = Math.random() * 4; // random phase
        velocities.current[i * 2] = (Math.random() - 0.5) * 0.3;
        velocities.current[i * 2 + 1] = (Math.random() - 0.5) * 0.3;
      }
    }

    // Compute the flooded region bounds
    const depth = tideProgress * MAP_SIZE;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      ages.current[i] += delta;

      // Drift slowly
      const vx = velocities.current[i * 2];
      const vz = velocities.current[i * 2 + 1];

      let px = positions[i * 3] + vx * delta;
      let pz = positions[i * 3 + 2] + vz * delta;

      // Respawn if out of flooded area or initial placement
      const needsRespawn = ages.current[i] > 3 + Math.random() * 2;
      if (needsRespawn) {
        ages.current[i] = 0;
        velocities.current[i * 2] = (Math.random() - 0.5) * 0.3;
        velocities.current[i * 2 + 1] = (Math.random() - 0.5) * 0.3;

        if (isHorizontal) {
          // Flooded area extends from edge to flood line
          const edgeX = tideDirection === 'west' ? -HALF_MAP : HALF_MAP;
          px = edgeX + (floodLine - edgeX) * Math.random();
          pz = (Math.random() - 0.5) * MAP_SIZE;
        } else {
          const edgeZ = tideDirection === 'north' ? -HALF_MAP : HALF_MAP;
          pz = edgeZ + (floodLine - edgeZ) * Math.random();
          px = (Math.random() - 0.5) * MAP_SIZE;
        }
      }

      positions[i * 3] = px;
      positions[i * 3 + 1] = 0.15 + Math.sin(time * 2 + i * 0.7) * 0.05;
      positions[i * 3 + 2] = pz;

      // Pulsing size
      const pulse = 0.5 + Math.sin(time * 3 + i * 1.3) * 0.3;
      const fadeIn = Math.min(ages.current[i] / 0.5, 1);
      sizes[i] = pulse * fadeIn;
    }

    // Cycle through glow colors
    if (matRef.current) {
      const colorIdx = Math.floor(time * 0.3) % GLOW_COLORS.length;
      const nextIdx = (colorIdx + 1) % GLOW_COLORS.length;
      const frac = (time * 0.3) % 1;
      matRef.current.color.copy(GLOW_COLORS[colorIdx]).lerp(GLOW_COLORS[nextIdx], frac);
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} visible={false}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        ref={matRef}
        color="#00FFFF"
        transparent
        opacity={0.9}
        size={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
