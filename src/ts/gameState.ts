import { GridLanes } from "./GridLanes.js";
import type { ExceedsDrop, GameState } from "./types.js";
import { NORMAL_SPEED_MULTIPLIER } from "./gameConstants.js";

export function createInitialGameState(canvas: HTMLCanvasElement): GameState {
  const startingDrop: ExceedsDrop = {
    id: "starting-exceeds",
    pixelX: canvas.width - 50,
    pixelY: canvas.height - 50,
    amount: 25,
    radius: 24,
  };

  const gridMargins = {
    top: 120,
    bottom: 20,
    left: 100,
    right: 20,
  };

  const grid = new GridLanes(
    3,
    9,
    { width: canvas.width, height: canvas.height },
    gridMargins,
  );
  const laneClears = Array.from({ length: grid.getLaneCount() }, (_, lane) => ({
    lane,
    armed: true,
  }));

  return {
    lastFrameTime: 0,
    frameCount: 0,
    simulationTime: 0,
    speedMultiplier: NORMAL_SPEED_MULTIPLIER,
    fastForwardEnabled: false,
    grid,
    status: "playing",
    units: [],
    projectiles: [],
    exceedsDrops: [startingDrop],
    laneClears,
    activeLaneClears: [],
  };
}
