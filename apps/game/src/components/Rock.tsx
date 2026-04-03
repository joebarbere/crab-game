import { SafeZone } from '../store/gameStore';

export function Rock({ zone }: { zone: SafeZone }) {
  return (
    <group position={[zone.x, 0, zone.z]}>
      {/* Main boulder */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[zone.radius * 0.7, 8, 6]} />
        <meshStandardMaterial color="#7B6B4F" roughness={0.9} />
      </mesh>
      {/* Flat base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[zone.radius, zone.radius * 1.1, 0.1, 10]} />
        <meshStandardMaterial color="#6B5B3F" roughness={1} />
      </mesh>
    </group>
  );
}
