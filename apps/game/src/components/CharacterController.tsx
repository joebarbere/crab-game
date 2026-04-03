import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';

const SPEED = 5;

export function CharacterController() {
  const [, getKeys] = useKeyboardControls();

  useFrame((_, delta) => {
    const phase = useGameStore.getState().gamePhase;
    if (phase !== 'playing' && phase !== 'tideActive') return;

    const { forward, backward, left, right } = getKeys() as {
      forward: boolean;
      backward: boolean;
      left: boolean;
      right: boolean;
    };
    const move = { x: 0, z: 0 };

    if (forward) move.z -= 1;
    if (backward) move.z += 1;
    if (left) move.x -= 1;
    if (right) move.x += 1;

    // Normalize diagonal movement
    const len = Math.sqrt(move.x * move.x + move.z * move.z);
    if (len > 0) {
      move.x = (move.x / len) * SPEED * delta;
      move.z = (move.z / len) * SPEED * delta;
      useGameStore.getState().moveCrab(move.x, move.z);
    }
  });

  return null;
}
