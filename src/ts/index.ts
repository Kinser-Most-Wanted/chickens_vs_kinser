import { applyCanvasDimensions, DEFAULT_CANVAS_SIZE } from "./canvas.js";
import { CurrencyWallet } from "./currency.js";
import { initGameMenu } from "./gameMenu.js";
import { startGameLoop } from "./gameLoop.js";
import { PlacementCooldowns } from "./placementCooldowns.js";
import { Shop, SHOP_CHICKENS } from "./shop.js";

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
  const currencyWallet = new CurrencyWallet({ exceeds: 100, eggs: 0 });
  const placementCooldowns = new PlacementCooldowns(
    SHOP_CHICKENS.map((chicken) => ({
      unitId: chicken.id,
      durationMs: chicken.cooldownMs,
    })),
  );
  const shop = new Shop(currencyWallet, placementCooldowns);
  shop.init();

  // START GAME LOOP
  const gameLoopControls = startGameLoop(
    canvas,
    renderingContext,
    currencyWallet,
    placementCooldowns,
  );
  initGameMenu(gameLoopControls);

  document.getElementById("spawnEnemyBtn")?.addEventListener("click", () => {
    gameLoopControls.spawnEnemy();
  });
}

// ⚠️ Use "load" to ensure EVERYTHING (DOM + layout) is ready
window.addEventListener("load", bootstrap);
