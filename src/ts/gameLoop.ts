import { GridLanes } from "./GridLanesCLass.js";
import type { GameState } from "./types.js";
import { getEventCoordinates } from "./canvas.js";

export function createInitialGameState(canvas: HTMLCanvasElement): GameState {
  return {
    lastFrameTime: 0,
    frameCount: 0,
    grid: new GridLanes(1, 9, { width: canvas.width, height: canvas.height }),
    units: [],
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
): void {
  renderingContext.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  renderingContext.fillStyle = "#111111";
  renderingContext.fillRect(0, 0, canvas.width, canvas.height);

  if (gameState.grid) {
    gameState.grid.render(renderingContext, gameState.coordX, gameState.coordY);
  }

  // Debug info positioned at the bottom to avoid being covered by the shop
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
 * Acts as the logic gate for adding entities,
 * ensuring we don't place units out of bounds or stack them on occupied cells.
 */
export function attemptUnitPlacement(
  pixelX: number,
  pixelY: number,
  gameState: GameState,
): boolean {
  if (!gameState.grid) return false;

  const coords = gameState.grid.getGridCoordinates(pixelX, pixelY);
  if (!coords) return false;

  const isOccupied = gameState.units.some(
    (unit) => unit.lane === coords.lane && unit.cell === coords.cell,
  );

  if (isOccupied) return false;

  gameState.units.push({
    lane: coords.lane,
    cell: coords.cell,
    type: "chicken",
  });

  return true;
}

export function startGameLoop(
  canvas: HTMLCanvasElement,
  renderingContext: CanvasRenderingContext2D,
): void {
  const gameState = createInitialGameState(canvas);

  // Mouse movement & click listeners
  const updateMousePosition = (event: MouseEvent | TouchEvent) => {
    const { x, y } = getEventCoordinates(event, canvas);
    gameState.coordX = x;
    gameState.coordY = y;
  };

  canvas.addEventListener("mousemove", updateMousePosition);

  canvas.addEventListener("mousedown", (event) => {
    updateMousePosition(event);
    attemptUnitPlacement(gameState.coordX!, gameState.coordY!, gameState);
  });

  // Touch movement listeners
  canvas.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      updateMousePosition(event);
      attemptUnitPlacement(gameState.coordX!, gameState.coordY!, gameState);
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
    renderFrame(canvas, renderingContext, gameState);

    window.requestAnimationFrame(runFrame);
  }

  window.requestAnimationFrame(runFrame);
}
