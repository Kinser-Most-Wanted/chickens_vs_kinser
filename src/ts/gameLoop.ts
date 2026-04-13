import type { GameState } from "./types.js";

export function createInitialGameState(): GameState {
  return {
    lastFrameTime: 0,
    frameCount: 0,
import { GridLanes } from "./GridLanesCLass.js";
import type { GameState } from "./types.js";

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

  renderingContext.fillStyle = "#111111";
  renderingContext.fillRect(0, 0, canvas.width, canvas.height);

  renderingContext.fillStyle = "#ffffff";
  renderingContext.font = "24px Arial";
  renderingContext.fillText(`Canvas: ${canvas.width}x${canvas.height}`, 20, 40);
  renderingContext.fillText(`Frame: ${gameState.frameCount}`, 20, 80);

  if (gameState.grid) {
    gameState.grid.render(renderingContext);
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
): boolean {
  if (!gameState.grid) return false;

  const coords = gameState.grid.getGridCoordinates(pixelX, pixelY);
  if (!coords) return false;

  const isOccupied = gameState.units.some(
    (unit) => unit.lane === coords.lane && unit.cell === coords.cell,
  );

  if (!isOccupied) {
    gameState.units.push({
      lane: coords.lane,
      cell: coords.cell,
      type: "chicken",
    });
    return true;
  }

  return false;
}

export function startGameLoop(
  canvas: HTMLCanvasElement,
  renderingContext: CanvasRenderingContext2D,
): void {
  const gameState = createInitialGameState();
  const gameState = createInitialGameState(canvas);

  function runFrame(currentTime: number): void {
    updateGameState(gameState, currentTime);
    renderFrame(canvas, renderingContext, gameState);

    window.requestAnimationFrame(runFrame);
  }

  window.requestAnimationFrame(runFrame);
}
