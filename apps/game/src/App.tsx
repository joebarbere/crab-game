import { useEffect } from 'react';
import { KeyboardControls } from '@react-three/drei';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { useGameStore } from './store/gameStore';

const keyMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

export function App() {
  useEffect(() => {
    useGameStore.getState().startDemo();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        const phase = useGameStore.getState().gamePhase;
        if (phase === 'title' || phase === 'demo' || phase === 'gameOver') {
          useGameStore.getState().startGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <KeyboardControls map={keyMap}>
      <GameCanvas />
      <HUD />
    </KeyboardControls>
  );
}
