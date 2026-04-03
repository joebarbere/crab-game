import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

interface ShellData {
  id: string;
  x: number;
  z: number;
}

export function ShellItem({ shell }: { shell: ShellData }) {
  const ref = useRef<Mesh>(null!);

  useFrame((state) => {
    // Gentle bob and spin
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2 + shell.x) * 0.3;
    ref.current.position.y =
      0.35 + Math.sin(state.clock.elapsedTime * 3 + shell.z) * 0.08;
  });

  return (
    <mesh ref={ref} position={[shell.x, 0.35, shell.z]}>
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
