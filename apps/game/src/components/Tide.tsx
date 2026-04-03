import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, MAP_SIZE, getFloodLine } from '../store/gameStore';
import { TideFoamParticles } from './TideFoamParticles';
import type { Mesh } from 'three';

const HALF_MAP = MAP_SIZE / 2;

export function Tide() {
  const waterRef = useRef<Mesh>(null!);
  const foamRef = useRef<Mesh>(null!);

  useFrame(() => {
    const { gamePhase, demoSubPhase, tideProgress, tideDirection } =
      useGameStore.getState();

    const showTide =
      ((gamePhase === 'tideActive' || gamePhase === 'gameOver') ||
        (gamePhase === 'demo' && demoSubPhase === 'tideActive')) &&
      tideProgress > 0.001;

    waterRef.current.visible = showTide;
    foamRef.current.visible = showTide;

    if (!showTide) return;

    const depth = tideProgress * MAP_SIZE;
    const floodLine = getFloodLine(tideProgress, tideDirection);
    const foamWidth = 0.6;

    switch (tideDirection) {
      case 'south': // from +Z edge, moving toward -Z
        waterRef.current.position.set(0, 0.06, (HALF_MAP + floodLine) / 2);
        waterRef.current.scale.set(MAP_SIZE, depth, 1);
        foamRef.current.position.set(0, 0.07, floodLine);
        foamRef.current.scale.set(MAP_SIZE, foamWidth, 1);
        break;
      case 'north': // from -Z edge, moving toward +Z
        waterRef.current.position.set(0, 0.06, (-HALF_MAP + floodLine) / 2);
        waterRef.current.scale.set(MAP_SIZE, depth, 1);
        foamRef.current.position.set(0, 0.07, floodLine);
        foamRef.current.scale.set(MAP_SIZE, foamWidth, 1);
        break;
      case 'east': // from +X edge, moving toward -X
        waterRef.current.position.set((HALF_MAP + floodLine) / 2, 0.06, 0);
        waterRef.current.scale.set(depth, MAP_SIZE, 1);
        foamRef.current.position.set(floodLine, 0.07, 0);
        foamRef.current.scale.set(foamWidth, MAP_SIZE, 1);
        break;
      case 'west': // from -X edge, moving toward +X
        waterRef.current.position.set((-HALF_MAP + floodLine) / 2, 0.06, 0);
        waterRef.current.scale.set(depth, MAP_SIZE, 1);
        foamRef.current.position.set(floodLine, 0.07, 0);
        foamRef.current.scale.set(foamWidth, MAP_SIZE, 1);
        break;
    }
  });

  return (
    <>
      {/* Water body */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#1E90FF"
          transparent
          opacity={0.55}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* Foam leading edge */}
      <mesh ref={foamRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#E8F4FD"
          transparent
          opacity={0.8}
          roughness={0.1}
        />
      </mesh>
      <TideFoamParticles />
    </>
  );
}
