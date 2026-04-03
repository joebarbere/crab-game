import { useRef } from 'react';
import { OrthographicCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import { playerEntities } from '../ecs/world';
import type { OrthographicCamera as OrthographicCameraType } from 'three';
import { Vector3 } from 'three';

const CAM_OFFSET = new Vector3(20, 30, 20);
const lookTarget = new Vector3();

export function Camera() {
  const cameraRef = useRef<OrthographicCameraType>(null!);

  useFrame(() => {
    const { screenShake } = useGameStore.getState();
    const player = playerEntities.entities[0];
    if (!player) return;
    const pos = player.position;
    const shakeX =
      screenShake > 0 ? (Math.random() - 0.5) * screenShake * 2 : 0;
    const shakeZ =
      screenShake > 0 ? (Math.random() - 0.5) * screenShake * 2 : 0;

    cameraRef.current.position.set(
      pos.x + CAM_OFFSET.x + shakeX,
      CAM_OFFSET.y,
      pos.z + CAM_OFFSET.z + shakeZ
    );
    lookTarget.set(pos.x + shakeX, 0, pos.z + shakeZ);
    cameraRef.current.lookAt(lookTarget);
  });

  return (
    <OrthographicCamera
      ref={cameraRef}
      makeDefault
      position={[CAM_OFFSET.x, CAM_OFFSET.y, CAM_OFFSET.z]}
      zoom={35}
      near={0.1}
      far={1000}
    />
  );
}
