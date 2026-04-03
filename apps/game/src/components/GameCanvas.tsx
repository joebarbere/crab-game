import { Canvas } from '@react-three/fiber';
import { Camera } from './Camera';
import { TileMap } from './TileMap';
import { CrabCharacter } from './CrabCharacter';
import { WaveManager } from './WaveManager';
import { Tide } from './Tide';
import { Rock } from './Rock';
import { ShellItem } from './Shell';
import { useGameStore } from '../store/gameStore';

function Rocks() {
  const safeZones = useGameStore((s) => s.safeZones);
  return (
    <>
      {safeZones.map((zone) => (
        <Rock key={`${zone.x.toFixed(2)}-${zone.z.toFixed(2)}`} zone={zone} />
      ))}
    </>
  );
}

function Shells() {
  const shells = useGameStore((s) => s.shells);
  return (
    <>
      {shells
        .filter((s) => !s.collected)
        .map((s) => (
          <ShellItem key={s.id} shell={s} />
        ))}
    </>
  );
}

export function GameCanvas() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <Camera />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 20, 10]} intensity={0.6} />
        <TileMap />
        <CrabCharacter />
        <WaveManager />
        <Tide />
        <Rocks />
        <Shells />
      </Canvas>
    </div>
  );
}
