import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { playerEntities, safeZoneEntities } from '../ecs/world';
import { CharacterController } from './CharacterController';
import { DemoCrabController } from './DemoCrabController';
import { toonGradientMap } from '../utils/toonGradient';
import type { Group } from 'three';

const ROCK_MAX_HEIGHT = 1.2;
const CLIMB_LERP_SPEED = 6;

export function CrabCharacter() {
  const groupRef = useRef<Group>(null!);
  const currentY = useRef(0);
  const lastPos = useRef({ x: 0, z: 0 });
  const walkPhase = useRef(0);

  useFrame((state, delta) => {
    const player = playerEntities.entities[0];
    if (!player) return;

    const px = player.position.x;
    const pz = player.position.z;

    // Detect movement for leg animation
    const dx = px - lastPos.current.x;
    const dz = pz - lastPos.current.z;
    const moving = Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001;
    if (moving) {
      walkPhase.current += delta * 18;
    }
    lastPos.current.x = px;
    lastPos.current.z = pz;

    // Rock climbing - compute target Y based on proximity to safe zones
    let targetY = 0;
    const zones = safeZoneEntities.entities;
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      const dist = Math.hypot(z.position.x - px, z.position.z - pz);
      if (dist < z.safeZone.radius) {
        const t = 1 - dist / z.safeZone.radius;
        const y = t * ROCK_MAX_HEIGHT;
        if (y > targetY) targetY = y;
      }
    }
    currentY.current += (targetY - currentY.current) * Math.min(1, CLIMB_LERP_SPEED * delta);

    // Update group transform
    groupRef.current.position.set(px, currentY.current + 0.3, pz);
    const facingAngle = (player.facing ?? 1) === 1 ? 0 : Math.PI;
    groupRef.current.rotation.y = facingAngle;

    // Animate legs
    const legWiggle = moving ? Math.sin(walkPhase.current) * 0.3 : 0;
    const clawBob = Math.sin(state.clock.elapsedTime * 3) * 0.05;

    const children = groupRef.current.children;
    // Legs are children 3..8 (indices after body, eye stalks, claws)
    for (let i = 3; i < 9; i++) {
      if (children[i]) {
        const side = i < 6 ? 1 : -1;
        const offset = (i % 3) * 0.7;
        children[i].rotation.z = side * (0.4 + legWiggle * Math.sin(walkPhase.current + offset));
      }
    }
    // Claws bob (children 9, 10)
    if (children[9]) children[9].position.y = 0.15 + clawBob;
    if (children[10]) children[10].position.y = 0.15 - clawBob;
  });

  return (
    <>
      <CharacterController />
      <DemoCrabController />
      <group ref={groupRef}>
        {/* Body - flattened ellipsoid */}
        <mesh scale={[0.55, 0.28, 0.45]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshToonMaterial color="#E85D3A" gradientMap={toonGradientMap} />
        </mesh>

        {/* Eye stalk left */}
        <group position={[0.15, 0.22, -0.3]}>
          <mesh scale={[0.04, 0.12, 0.04]}>
            <cylinderGeometry args={[1, 1, 1, 6]} />
            <meshToonMaterial color="#D14E2F" gradientMap={toonGradientMap} />
          </mesh>
          <mesh position={[0, 0.08, 0]} scale={[0.06, 0.06, 0.06]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshToonMaterial color="#1A1A1A" gradientMap={toonGradientMap} />
          </mesh>
        </group>

        {/* Eye stalk right */}
        <group position={[-0.15, 0.22, -0.3]}>
          <mesh scale={[0.04, 0.12, 0.04]}>
            <cylinderGeometry args={[1, 1, 1, 6]} />
            <meshToonMaterial color="#D14E2F" gradientMap={toonGradientMap} />
          </mesh>
          <mesh position={[0, 0.08, 0]} scale={[0.06, 0.06, 0.06]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshToonMaterial color="#1A1A1A" gradientMap={toonGradientMap} />
          </mesh>
        </group>

        {/* Right legs (3 legs) */}
        <mesh position={[0.45, -0.02, -0.15]} rotation={[0, 0, 0.4]} scale={[0.25, 0.04, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshToonMaterial color="#D14E2F" gradientMap={toonGradientMap} />
        </mesh>
        <mesh position={[0.48, -0.02, 0]} rotation={[0, 0, 0.4]} scale={[0.28, 0.04, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshToonMaterial color="#D14E2F" gradientMap={toonGradientMap} />
        </mesh>
        <mesh position={[0.45, -0.02, 0.15]} rotation={[0, 0, 0.4]} scale={[0.25, 0.04, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshToonMaterial color="#D14E2F" gradientMap={toonGradientMap} />
        </mesh>

        {/* Left legs (3 legs) */}
        <mesh position={[-0.45, -0.02, -0.15]} rotation={[0, 0, -0.4]} scale={[0.25, 0.04, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshToonMaterial color="#D14E2F" gradientMap={toonGradientMap} />
        </mesh>
        <mesh position={[-0.48, -0.02, 0]} rotation={[0, 0, -0.4]} scale={[0.28, 0.04, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshToonMaterial color="#D14E2F" gradientMap={toonGradientMap} />
        </mesh>
        <mesh position={[-0.45, -0.02, 0.15]} rotation={[0, 0, -0.4]} scale={[0.25, 0.04, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshToonMaterial color="#D14E2F" gradientMap={toonGradientMap} />
        </mesh>

        {/* Right claw */}
        <group position={[0.3, 0.15, -0.4]}>
          <mesh scale={[0.12, 0.08, 0.06]} rotation={[0, 0.3, 0]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshToonMaterial color="#F06A3E" gradientMap={toonGradientMap} />
          </mesh>
          <mesh position={[0.08, 0.04, 0]} scale={[0.06, 0.04, 0.03]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshToonMaterial color="#F06A3E" gradientMap={toonGradientMap} />
          </mesh>
        </group>

        {/* Left claw */}
        <group position={[-0.3, 0.15, -0.4]}>
          <mesh scale={[0.12, 0.08, 0.06]} rotation={[0, -0.3, 0]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshToonMaterial color="#F06A3E" gradientMap={toonGradientMap} />
          </mesh>
          <mesh position={[-0.08, 0.04, 0]} scale={[0.06, 0.04, 0.03]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshToonMaterial color="#F06A3E" gradientMap={toonGradientMap} />
          </mesh>
        </group>
      </group>
    </>
  );
}
