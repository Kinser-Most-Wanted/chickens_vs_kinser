import type { CanvasDimensions, SupportedCanvasSize } from "./types.js";

const CANVAS_DIMENSIONS: Record<SupportedCanvasSize, CanvasDimensions> = {
  small: {
    width: 400,
    height: 400,
  },
  large: {
    width: 800,
    height: 400,
  },
};

export const DEFAULT_CANVAS_SIZE: SupportedCanvasSize = "large";

export function applyCanvasDimensions(
  canvas: HTMLCanvasElement,
  canvasSize: SupportedCanvasSize,
): void {
  const dimensions = CANVAS_DIMENSIONS[canvasSize];

  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
}
