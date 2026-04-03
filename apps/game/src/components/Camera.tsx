import { useRef } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import type { OrthographicCamera as OrthographicCameraType } from 'three';

export function Camera() {
  const cameraRef = useRef<OrthographicCameraType>(null!);

  useFrame(() => {
    const { x, z } = useGameStore.getState().crabPosition;
    cameraRef.current.position.x = x;
    cameraRef.current.position.z = z;
  });

  return (
    <OrthographicCamera
      ref={cameraRef}
      makeDefault
      position={[0, 50, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      zoom={40}
      near={0.1}
      far={1000}
    />
  );
}
