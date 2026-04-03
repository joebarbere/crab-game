import { KeyboardControls } from '@react-three/drei';
import { GameCanvas } from './components/GameCanvas';

const keyMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

export function App() {
  return (
    <KeyboardControls map={keyMap}>
      <GameCanvas />
    </KeyboardControls>
  );
}
