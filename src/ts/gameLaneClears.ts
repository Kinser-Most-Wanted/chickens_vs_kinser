import type { GameState } from "./types.js";
import {
  HELICOPTER_CLEAR_FRONT_OFFSET,
  HELICOPTER_START_OFFSET,
  HELICOPTER_WIDTH,
} from "./gameConstants.js";

function triggerLaneClear(lane: number, gameState: GameState): void {
  if (!gameState.grid) return;

  const laneClear = gameState.laneClears.find((candidate) => candidate.lane === lane);
  if (!laneClear?.armed) return;

  laneClear.armed = false;
  const bounds = gameState.grid.getBounds();
  gameState.activeLaneClears.push({
    lane,
    x: bounds.x - HELICOPTER_START_OFFSET,
    speed: 8,
  });
}

function hasActiveLaneClear(lane: number, gameState: GameState): boolean {
  return gameState.activeLaneClears.some((laneClear) => laneClear.lane === lane);
}

export function updateLaneClears(gameState: GameState): void {
  const grid = gameState.grid;
  if (!grid) return;

  const bounds = grid.getBounds();

  gameState.activeLaneClears = gameState.activeLaneClears.filter((laneClear) => {
    laneClear.x += laneClear.speed;
    const clearFront = laneClear.x + HELICOPTER_WIDTH - HELICOPTER_CLEAR_FRONT_OFFSET;

    for (const unit of gameState.units) {
      if (unit.getType() !== "kinser" || unit.getLane() !== laneClear.lane) {
        continue;
      }

      const unitPosition = grid.getPixelCoordinates(unit.getLane(), unit.getCell());
      if (unitPosition.pixelX <= clearFront) {
        unit.takeDamage(unit.getHealth());
      }
    }

    return laneClear.x <= bounds.x + bounds.width + HELICOPTER_WIDTH;
  });
}

export function resolveEndOfLaneKinsers(gameState: GameState): boolean {
  for (const unit of gameState.units) {
    if (unit.getType() !== "kinser") continue;
    if (unit.getCell() > 0) continue;

    const lane = unit.getLane();
    const laneClear = gameState.laneClears.find(
      (candidate) => candidate.lane === lane,
    );

    if (laneClear?.armed) {
      triggerLaneClear(lane, gameState);
      continue;
    }

    if (hasActiveLaneClear(lane, gameState)) {
      continue;
    }

    return true;
  }

  return false;
}
