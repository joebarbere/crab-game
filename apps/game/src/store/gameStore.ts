import { create } from 'zustand';

interface GameState {
  crabPosition: { x: number; z: number };
  moveCrab: (dx: number, dz: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  crabPosition: { x: 0, z: 0 },
  moveCrab: (dx, dz) => {
    const pos = get().crabPosition;
    set({ crabPosition: { x: pos.x + dx, z: pos.z + dz } });
  },
}));
