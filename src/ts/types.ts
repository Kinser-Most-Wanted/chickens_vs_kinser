import { GridLanes } from "./GridLanesCLass.js";

export type SupportedCanvasSize = "small" | "large" | "portrait";

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface GridConfig {
  lanes: number;
  cells: number;
}

export interface Unit {
  lane: number;
  cell: number;
  type: string;
}

export interface ExceedsDrop {
  id: string;
  pixelX: number;
  pixelY: number;
  amount: number;
  radius: number;
}

export interface GameState {
  lastFrameTime: number;
  frameCount: number;
  grid?: GridLanes;
  units: Unit[];
  exceedsDrops?: ExceedsDrop[];
  coordX?: number;
  coordY?: number;
}
