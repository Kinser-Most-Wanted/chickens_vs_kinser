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
  portrait: {
    width: 400,
    height: 800,
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

/**
 * Translates a Mouse or Touch event into canvas-relative coordinates.
 * @param event - The input event (Mouse or Touch).
 * @param canvas - The target HTML canvas element.
 * @returns The relative X and Y coordinates.
 */
export function getEventCoordinates(
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  let clientX: number;
  let clientY: number;

  if (event instanceof MouseEvent) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    // Use the first touch point for touch events
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}
