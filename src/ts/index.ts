import { applyCanvasDimensions, DEFAULT_CANVAS_SIZE } from "./canvas.js";
import { startGameLoop } from "./gameLoop.js";
import { Shop } from "./shop.js";

function bootstrap(): void {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;

  if (!canvas) {
    console.error("Game canvas element not found.");
    return;
  }

  // ✅ FORCE CANVAS SIZE IMMEDIATELY (before anything else)
  applyCanvasDimensions(canvas, DEFAULT_CANVAS_SIZE);

  const renderingContext = canvas.getContext("2d");

  if (!renderingContext) {
    console.error("Failed to get 2D rendering context.");
    return;
  }

  // SHOP UI
  const shop = new Shop(100);
  shop.init();

  // START GAME LOOP
  startGameLoop(canvas, renderingContext);
}

// ⚠️ Use "load" to ensure EVERYTHING (DOM + layout) is ready
window.addEventListener("load", bootstrap);
