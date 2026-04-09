export type SupportedCanvasSize = "small" | "large";

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface GameState {
  lastFrameTime: number;
  frameCount: number;
}
