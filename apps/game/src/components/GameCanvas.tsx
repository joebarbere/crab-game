import { Canvas } from '@react-three/fiber';
import { useEntities } from 'miniplex-react';
import { Camera } from './Camera';
import { TileMap } from './TileMap';
import { CrabCharacter } from './CrabCharacter';
import { WaveManager } from './WaveManager';
import { Tide } from './Tide';
import { Rock } from './Rock';
import { ShellItem } from './Shell';
import { safeZoneEntities, shellEntities } from '../ecs/world';

function Rocks() {
  const rocks = useEntities(safeZoneEntities);
  return (
    <>
      {rocks.entities.map((entity, i) => (
        <Rock key={`rock-${i}`} entity={entity} />
      ))}
    </>
  );
}

function Shells() {
  const shells = useEntities(shellEntities);
  return (
    <>
      {shells.entities
        .filter((e) => !e.shell.collected)
        .map((entity) => (
          <ShellItem key={entity.shell.id} entity={entity} />
        ))}
    </>
  );
}

export function GameCanvas() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <color attach="background" args={['#87CEEB']} />
        <Camera />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 5]} intensity={1.2} />
        <hemisphereLight args={['#87CEEB', '#F4D35E', 0.3]} />
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
