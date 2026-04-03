import { useRef } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import type { OrthographicCamera as OrthographicCameraType } from 'three';

export function Camera() {
  const cameraRef = useRef<OrthographicCameraType>(null!);

  useFrame(() => {
    const { crabPosition, screenShake } = useGameStore.getState();
    const shakeX =
      screenShake > 0 ? (Math.random() - 0.5) * screenShake * 2 : 0;
    const shakeZ =
      screenShake > 0 ? (Math.random() - 0.5) * screenShake * 2 : 0;
    cameraRef.current.position.x = crabPosition.x + shakeX;
    cameraRef.current.position.z = crabPosition.z + shakeZ;
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
