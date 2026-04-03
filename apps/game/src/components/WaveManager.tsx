import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';

export function WaveManager() {
  useFrame((_, delta) => {
    useGameStore.getState().tick(delta);
  });
  return null;
}
