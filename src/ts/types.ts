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
  type: "chicken"; // Example type, we'll expand this later
}

export interface GameState {
  lastFrameTime: number;
  frameCount: number;
  grid?: GridLanes;
  units: Unit[];
  coordX?: number;
  coordY?: number;
}
