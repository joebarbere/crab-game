import { Canvas } from '@react-three/fiber';
import { Camera } from './Camera';
import { TileMap } from './TileMap';
import { CrabCharacter } from './CrabCharacter';

export function GameCanvas() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <Camera />
        <ambientLight intensity={1} />
        <TileMap />
        <CrabCharacter />
      </Canvas>
    </div>
  );
}
