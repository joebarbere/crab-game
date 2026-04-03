import { With } from 'miniplex';
import { Entity } from '../ecs/world';

type RockEntity = With<Entity, 'position' | 'safeZone'>;

export function Rock({ entity }: { entity: RockEntity }) {
  const { position, safeZone } = entity;
  return (
    <group position={[position.x, 0, position.z]}>
      {/* Main boulder */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[safeZone.radius * 0.7, 8, 6]} />
        <meshStandardMaterial color="#7B6B4F" roughness={0.9} />
      </mesh>
      {/* Flat base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry
          args={[safeZone.radius, safeZone.radius * 1.1, 0.1, 10]}
        />
        <meshStandardMaterial color="#6B5B3F" roughness={1} />
      </mesh>
    </group>
  );
}
