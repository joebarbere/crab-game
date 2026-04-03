import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import { CharacterController } from './CharacterController';
import type { Sprite as SpriteType } from 'three';

export function CrabCharacter() {
  const spriteRef = useRef<SpriteType>(null!);
  const texture = useTexture('/textures/crab.png');

  useFrame(() => {
    const { x, z } = useGameStore.getState().crabPosition;
    spriteRef.current.position.set(x, 0.1, z);
  });

  return (
    <>
      <CharacterController />
      <sprite ref={spriteRef} scale={[1, 1, 1]}>
        <spriteMaterial map={texture} />
      </sprite>
    </>
  );
}
