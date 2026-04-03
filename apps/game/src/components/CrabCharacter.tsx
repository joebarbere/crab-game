import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import { CharacterController } from './CharacterController';
import { DemoCrabController } from './DemoCrabController';
import type { Sprite as SpriteType } from 'three';

export function CrabCharacter() {
  const spriteRef = useRef<SpriteType>(null!);
  const texture = useTexture('/textures/crab.png');

  useFrame(() => {
    const { crabPosition, crabFacing } = useGameStore.getState();
    spriteRef.current.position.set(crabPosition.x, 0.5, crabPosition.z);
    spriteRef.current.scale.set(crabFacing, 1, 1);
  });

  return (
    <>
      <CharacterController />
      <DemoCrabController />
      <sprite ref={spriteRef} scale={[1, 1, 1]}>
        <spriteMaterial map={texture} />
      </sprite>
    </>
  );
}
