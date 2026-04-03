import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEntities } from 'miniplex-react';
import * as THREE from 'three';
import { Camera } from './Camera';
import { TileMap } from './TileMap';
import { CrabCharacter } from './CrabCharacter';
import { WaveManager } from './WaveManager';
import { Tide } from './Tide';
import { Rock } from './Rock';
import { ShellItem } from './Shell';
import { safeZoneEntities, shellEntities } from '../ecs/world';
import { useGameStore } from '../store/gameStore';

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

// Day / night color targets
const DAY_BG = new THREE.Color('#87CEEB');
const NIGHT_BG = new THREE.Color('#0A0E2A');

const DAY_AMBIENT = new THREE.Color('#ffffff');
const NIGHT_AMBIENT = new THREE.Color('#4466AA');

const DAY_DIR_COLOR = new THREE.Color('#ffffff');
const NIGHT_DIR_COLOR = new THREE.Color('#8899CC');
const DAY_DIR_POS = new THREE.Vector3(10, 20, 10);
const NIGHT_DIR_POS = new THREE.Vector3(-8, 18, -5);

const DAY_HEMI_SKY = new THREE.Color('#87CEEB');
const DAY_HEMI_GROUND = new THREE.Color('#F4D35E');
const NIGHT_HEMI_SKY = new THREE.Color('#112244');
const NIGHT_HEMI_GROUND = new THREE.Color('#1A1A2E');

function SceneLighting() {
  const bgRef = useRef<THREE.Color>(null!);
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const dirRef = useRef<THREE.DirectionalLight>(null!);
  const hemiRef = useRef<THREE.HemisphereLight>(null!);

  useFrame((_, delta) => {
    const { isNight } = useGameStore.getState();
    const t = Math.min(delta * 3, 1); // lerp speed

    // Background
    if (bgRef.current) {
      bgRef.current.lerp(isNight ? NIGHT_BG : DAY_BG, t);
    }

    // Ambient
    if (ambientRef.current) {
      ambientRef.current.color.lerp(isNight ? NIGHT_AMBIENT : DAY_AMBIENT, t);
      ambientRef.current.intensity += ((isNight ? 0.15 : 0.5) - ambientRef.current.intensity) * t;
    }

    // Directional
    if (dirRef.current) {
      dirRef.current.color.lerp(isNight ? NIGHT_DIR_COLOR : DAY_DIR_COLOR, t);
      dirRef.current.intensity += ((isNight ? 0.4 : 1.5) - dirRef.current.intensity) * t;
      dirRef.current.position.lerp(isNight ? NIGHT_DIR_POS : DAY_DIR_POS, t);
    }

    // Hemisphere
    if (hemiRef.current) {
      hemiRef.current.color.lerp(isNight ? NIGHT_HEMI_SKY : DAY_HEMI_SKY, t);
      hemiRef.current.groundColor.lerp(isNight ? NIGHT_HEMI_GROUND : DAY_HEMI_GROUND, t);
      hemiRef.current.intensity += ((isNight ? 0.2 : 0.4) - hemiRef.current.intensity) * t;
    }
  });

  return (
    <>
      <color ref={bgRef} attach="background" args={['#87CEEB']} />
      <ambientLight ref={ambientRef} intensity={0.5} />
      <directionalLight ref={dirRef} position={[10, 20, 10]} intensity={1.5} />
      <hemisphereLight ref={hemiRef} args={['#87CEEB', '#F4D35E', 0.4]} />
    </>
  );
}

export function GameCanvas() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <SceneLighting />
        <Camera />
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
