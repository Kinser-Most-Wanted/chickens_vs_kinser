import { GridLanes } from "./GridLanesCLass.js";
import type { GameState } from "./types.js";
import { getEventCoordinates } from "./canvas.js";
import { Shop } from "./shop.js";
import type { Chicken } from "./shop.js";

export function createInitialGameState(canvas: HTMLCanvasElement): GameState {
  return {
    lastFrameTime: 0,
    frameCount: 0,
    grid: new GridLanes(1, 9, { width: canvas.width, height: canvas.height }),
    units: [],

    exceeds: 100,
    selectedChickenId: undefined,
  };
}

export function updateGameState(
  gameState: GameState,
  currentTime: number,
): void {
  gameState.lastFrameTime = currentTime;
  gameState.frameCount += 1;
}

export function renderFrame(
  canvas: HTMLCanvasElement,
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
  shop: Shop, // ✅ added so UI can sync currency
): void {
  renderingContext.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  renderingContext.fillStyle = "#111111";
  renderingContext.fillRect(0, 0, canvas.width, canvas.height);

  // GRID
  if (gameState.grid) {
    gameState.grid.render(
      renderingContext,
      gameState.coordX,
      gameState.coordY,
    );
  }

  // 💸 SYNC EXCEEDS WITH SHOP UI
  shop.updateCurrency(gameState.exceeds);

  // DEBUG INFO
  renderingContext.fillStyle = "#ffffff";
  renderingContext.font = "24px Arial";

  renderingContext.fillText(
    `Canvas: ${canvas.width}x${canvas.height}`,
    20,
    canvas.height - 100,
  );

  renderingContext.fillText(
    `Frame: ${gameState.frameCount}`,
    20,
    canvas.height - 60,
  );

  if (gameState.coordX !== undefined && gameState.coordY !== undefined) {
    renderingContext.fillText(
      `Mouse: ${Math.round(gameState.coordX)}, ${Math.round(gameState.coordY)}`,
      20,
      canvas.height - 20,
    );
  }
}

/**
 * Acts as the logic gate for adding entities, ensuring we don't place units out of bounds or stack them on occupied cells.
 * @param pixelX - Raw horizontal canvas pixel coordinate.
 * @param pixelY - Raw vertical canvas pixel coordinate.
 * @param gameState - The active state to modify.
 * @returns True if the unit was placed, false if placement was blocked.
 */
export function attemptUnitPlacement(
  pixelX: number,
  pixelY: number,
  gameState: GameState,
  shop: Shop,
): boolean {
  if (!gameState.grid) return false;

  // 1. Must have a selected unit
  const selectedId = gameState.selectedChickenId;
  if (!selectedId) return false;

  // 2. Look up chicken from shop
  const chicken = shop.getChickenById(selectedId);
  if (!chicken) return false;

  // 3. Check grid position validity
  const coords = gameState.grid.getGridCoordinates(pixelX, pixelY);
  if (!coords) return false;

  // 4. Check if cell is already occupied
  const isOccupied = gameState.units.some(
    (unit) => unit.lane === coords.lane && unit.cell === coords.cell,
  );
  if (isOccupied) return false;

  // 5. Check currency (exceeds system)
  if (gameState.exceeds < chicken.cost) {
    return false;
  }

  // 6. Spend currency
  gameState.exceeds -= chicken.cost;

  // 7. Place unit
  gameState.units.push({
    lane: coords.lane,
    cell: coords.cell,
    type: chicken.id,
  });

  return true;
}

export function startGameLoop(
  canvas: HTMLCanvasElement,
  renderingContext: CanvasRenderingContext2D,
  shop: Shop,
): void {
  const gameState = createInitialGameState(canvas);

  shop.setOnSelect((chicken: Chicken) => {
  gameState.selectedChickenId = chicken.id;
  });

  // Mouse movement & click listeners
  const updateMousePosition = (event: MouseEvent | TouchEvent) => {
    const { x, y } = getEventCoordinates(event, canvas);
    gameState.coordX = x;
    gameState.coordY = y;
  };
  canvas.addEventListener("mousemove", updateMousePosition);
  canvas.addEventListener("mousedown", (event) => {
    updateMousePosition(event);
    attemptUnitPlacement(gameState.coordX!, gameState.coordY!, gameState, shop);
  });

  // Touch movement listeners
  canvas.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      updateMousePosition(event);
      attemptUnitPlacement(gameState.coordX!, gameState.coordY!, gameState, shop);
    },
    { passive: false },
  );
  canvas.addEventListener(
    "touchmove",
    (event) => {
      event.preventDefault();
      updateMousePosition(event);
    },
    { passive: false },
  );

  function runFrame(currentTime: number): void {
    updateGameState(gameState, currentTime);
  renderFrame(canvas, renderingContext, gameState, shop);

    window.requestAnimationFrame(runFrame);
  }

  window.requestAnimationFrame(runFrame);
}
