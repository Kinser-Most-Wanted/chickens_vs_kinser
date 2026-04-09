import type { GameState } from "./types.js";

export function createInitialGameState(): GameState {
  return {
    lastFrameTime: 0,
    frameCount: 0,
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
}

export function startGameLoop(
  canvas: HTMLCanvasElement,
  renderingContext: CanvasRenderingContext2D,
): void {
  const gameState = createInitialGameState();

  function runFrame(currentTime: number): void {
    updateGameState(gameState, currentTime);
    renderFrame(canvas, renderingContext, gameState);

    window.requestAnimationFrame(runFrame);
  }

  window.requestAnimationFrame(runFrame);
}
