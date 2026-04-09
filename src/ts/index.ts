type SupportedCanvasSize = "small" | "large";

interface CanvasDimensions {
  width: number;
  height: number;
}

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

const DEFAULT_CANVAS_SIZE: SupportedCanvasSize = "large";

function applyCanvasDimensions(
  canvas: HTMLCanvasElement,
  canvasSize: SupportedCanvasSize,
): void {
  const dimensions = CANVAS_DIMENSIONS[canvasSize];

  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
}

function renderInitialCanvasFrame(
  canvas: HTMLCanvasElement,
  renderingContext: CanvasRenderingContext2D,
): void {
  renderingContext.fillStyle = "#111111";
  renderingContext.fillRect(0, 0, canvas.width, canvas.height);

  renderingContext.fillStyle = "#ffffff";
  renderingContext.font = "24px Arial";
  renderingContext.fillText(`Canvas: ${canvas.width}x${canvas.height}`, 20, 40);
}

function initGame(): void {
  const canvas = document.getElementById(
    "gameCanvas",
  ) as HTMLCanvasElement | null;

  if (!canvas) {
    console.error("Game canvas element not found.");
    return;
  }

  applyCanvasDimensions(canvas, DEFAULT_CANVAS_SIZE);

  const renderingContext = canvas.getContext("2d");

  if (!renderingContext) {
    console.error("Failed to get 2D rendering context.");
    return;
  }

  renderInitialCanvasFrame(canvas, renderingContext);
}

window.addEventListener("DOMContentLoaded", initGame);
