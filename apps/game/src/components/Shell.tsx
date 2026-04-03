import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { With } from 'miniplex';
import { Entity } from '../ecs/world';
import { toonGradientMap } from '../utils/toonGradient';
import type { Group } from 'three';

type ShellEntity = With<Entity, 'position' | 'shell'>;

export function ShellItem({ entity }: { entity: ShellEntity }) {
  const ref = useRef<Group>(null!);
  const { position, shell } = entity;

  useFrame((state) => {
    if (shell.collected) return;
    ref.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 2 + position.x) * 0.3;
    ref.current.position.y =
      0.35 + Math.sin(state.clock.elapsedTime * 3 + position.z) * 0.08;
  });

  return (
    <group ref={ref} position={[position.x, 0.35, position.z]}>
      {/* Shell body */}
      <mesh>
        <torusGeometry args={[0.25, 0.1, 8, 16]} />
        <meshToonMaterial
          color="#FFD700"
          emissive="#FFA500"
          emissiveIntensity={0.3}
          gradientMap={toonGradientMap}
        />
      </mesh>
      {/* Glow ring beneath */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.3, 16]} />
        <meshToonMaterial
          color="#FFD700"
          transparent
          opacity={0.25}
          gradientMap={toonGradientMap}
        />
      </mesh>
    </group>
  );
}
