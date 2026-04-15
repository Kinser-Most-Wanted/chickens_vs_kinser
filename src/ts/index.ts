import { applyCanvasDimensions, DEFAULT_CANVAS_SIZE } from "./canvas.js";
import { startGameLoop } from "./gameLoop.js";
import { Shop } from "./shop.js";

function initGame(): void {
  const canvas = document.getElementById(
    "game-canvas",
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

  // SHOP Creation
  const shop = new Shop(100);
  shop.init();

  startGameLoop(canvas, renderingContext);
}

window.addEventListener("DOMContentLoaded", initGame);
