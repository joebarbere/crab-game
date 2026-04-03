import { With } from 'miniplex';
import { Entity } from '../ecs/world';
import { toonGradientMap } from '../utils/toonGradient';

type RockEntity = With<Entity, 'position' | 'safeZone'>;

export function Rock({ entity }: { entity: RockEntity }) {
  const { position, safeZone } = entity;
  const r = safeZone.radius;

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Main boulder - dodecahedron for rocky look */}
      <mesh position={[0, r * 0.4, 0]} scale={[1, 0.7, 0.9]}>
        <dodecahedronGeometry args={[r * 0.65, 1]} />
        <meshToonMaterial color="#8B7D6B" gradientMap={toonGradientMap} />
      </mesh>
      {/* Secondary smaller rock */}
      <mesh position={[r * 0.4, r * 0.2, r * 0.3]} scale={[0.8, 0.6, 0.9]}>
        <dodecahedronGeometry args={[r * 0.35, 1]} />
        <meshToonMaterial color="#7A6E5D" gradientMap={toonGradientMap} />
      </mesh>
      {/* Small accent rock */}
      <mesh position={[-r * 0.35, r * 0.12, -r * 0.25]} scale={[1, 0.5, 0.7]}>
        <dodecahedronGeometry args={[r * 0.25, 0]} />
        <meshToonMaterial color="#9B8D7B" gradientMap={toonGradientMap} />
      </mesh>
      {/* Sand base ring */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r * 0.6, r * 1.1, 16]} />
        <meshToonMaterial
          color="#E8D5A3"
          gradientMap={toonGradientMap}
        />
      </mesh>
    </group>
  );
}
