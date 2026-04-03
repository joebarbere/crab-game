import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { With } from 'miniplex';
import { Entity } from '../ecs/world';
import type { Mesh } from 'three';

type ShellEntity = With<Entity, 'position' | 'shell'>;

export function ShellItem({ entity }: { entity: ShellEntity }) {
  const ref = useRef<Mesh>(null!);
  const { position, shell } = entity;

  useFrame((state) => {
    if (shell.collected) return;
    // Gentle bob and spin
    ref.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 2 + position.x) * 0.3;
    ref.current.position.y =
      0.35 + Math.sin(state.clock.elapsedTime * 3 + position.z) * 0.08;
  });

  return (
    <mesh ref={ref} position={[position.x, 0.35, position.z]}>
      <torusGeometry args={[0.25, 0.1, 8, 16]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFA500"
        emissiveIntensity={0.3}
        roughness={0.4}
        metalness={0.3}
      />
    </mesh>
  );
}
