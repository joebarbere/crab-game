import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { playerEntities } from '../ecs/world';
import { CharacterController } from './CharacterController';
import { DemoCrabController } from './DemoCrabController';
import type { Sprite as SpriteType } from 'three';

export function CrabCharacter() {
  const spriteRef = useRef<SpriteType>(null!);
  const texture = useTexture('/textures/crab.png');

  useFrame(() => {
    const player = playerEntities.entities[0];
    if (!player) return;
    spriteRef.current.position.set(player.position.x, 0.5, player.position.z);
    spriteRef.current.scale.set(player.facing ?? 1, 1, 1);
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
