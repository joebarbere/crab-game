import { useTexture } from '@react-three/drei';
import { RepeatWrapping } from 'three';

const MAP_SIZE = 50;
const TILE_REPEAT = 25;

export function TileMap() {
  const texture = useTexture('/textures/sand.png');
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(TILE_REPEAT, TILE_REPEAT);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
