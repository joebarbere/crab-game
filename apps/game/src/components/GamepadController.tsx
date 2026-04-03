import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';

const SPEED = 5;
const DEADZONE = 0.15;

export function GamepadController() {
  const wasStartPressed = useRef(false);

  useFrame((_, delta) => {
    const gamepads = navigator.getGamepads?.();
    if (!gamepads) return;

    const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
    if (!gamepad) return;

    const state = useGameStore.getState();

    // A button (index 0) — start/restart game
    const startPressed = gamepad.buttons[0]?.pressed ?? false;
    if (startPressed && !wasStartPressed.current) {
      const phase = state.gamePhase;
      if (phase === 'title' || phase === 'demo' || phase === 'gameOver') {
        state.startGame();
      }
    }
    wasStartPressed.current = startPressed;

    // Movement — only during active play
    const phase = state.gamePhase;
    if (phase !== 'playing' && phase !== 'tideActive') return;

    let mx = 0;
    let mz = 0;

    // Left stick
    const lx = gamepad.axes[0] ?? 0;
    const ly = gamepad.axes[1] ?? 0;
    if (Math.abs(lx) > DEADZONE) mx += lx;
    if (Math.abs(ly) > DEADZONE) mz += ly;

    // D-pad buttons (standard mapping)
    if (gamepad.buttons[12]?.pressed) mz -= 1; // up
    if (gamepad.buttons[13]?.pressed) mz += 1; // down
    if (gamepad.buttons[14]?.pressed) mx -= 1; // left
    if (gamepad.buttons[15]?.pressed) mx += 1; // right

    // Normalize and apply
    const len = Math.sqrt(mx * mx + mz * mz);
    if (len > 0) {
      const norm = Math.min(len, 1); // clamp analog stick magnitude
      mx = (mx / len) * norm * SPEED * delta;
      mz = (mz / len) * norm * SPEED * delta;
      state.moveCrab(mx, mz);
    }
  });

  return null;
}
