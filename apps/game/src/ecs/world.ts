import { World } from 'miniplex';

// --- ECS Component Types ---
export interface Entity {
  position?: { x: number; z: number };
  facing?: 1 | -1;
  isPlayer?: true;
  isAI?: true;
  shell?: { id: string; collected: boolean; points: number };
  safeZone?: { radius: number };
  bobOffset?: number;
}

// --- World ---
export const world = new World<Entity>();

// --- Archetypes (cached queries) ---
export const playerEntities = world.with('position', 'isPlayer');
export const shellEntities = world.with('position', 'shell');
export const safeZoneEntities = world.with('position', 'safeZone');
