import { GridLanes } from "./GridLanes.js";
import { Unit } from "./unit.js";

export type SupportedCanvasSize = "small" | "large" | "portrait";

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface GridConfig {
  lanes: number;
  cells: number;
}

export interface ExceedsDrop {
  id: string;
  pixelX: number;
  pixelY: number;
  amount: number;
  radius: number;
}

export interface Projectile {
  id: string;
  image: string;
  lane: number;
  x: number;
  y: number;
  speed: number;
  damage: number;
}

export interface LaneClearState {
  lane: number;
  armed: boolean;
}

export interface ActiveLaneClear {
  lane: number;
  x: number;
  speed: number;
}

export interface GameState {
  lastFrameTime: number;
  frameCount: number;
  grid?: GridLanes;
  units: Unit[];
  projectiles: Projectile[];
  exceedsDrops?: ExceedsDrop[];
  laneClears: LaneClearState[];
  activeLaneClears: ActiveLaneClear[];
  coordX?: number;
  coordY?: number;
}
