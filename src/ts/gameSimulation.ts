import type { GameState, Projectile } from "./types.js";
import type { Unit } from "./unit.js";
import { PROJECTILE_RENDER_SIZE, SIMULATION_STEP_MS, UNIT_RENDER_SIZE } from "./gameConstants.js";
import { updateLaneClears } from "./gameLaneClears.js";

function triggerProjectileDamage(unit: Unit, projectile: Projectile): void {
  unit.takeDamage(projectile.damage);
}

function checkProjectileCollisions(gameState: GameState): void {
  for (let index = gameState.projectiles.length - 1; index >= 0; index -= 1) {
    const projectile = gameState.projectiles[index];

    for (const unit of gameState.units) {
      if (unit.getType() !== "kinser") {
        continue;
      }

      const unitPos = gameState.grid?.getPixelCoordinates(unit.getLane(), unit.getCell());
      if (!unitPos) continue;

      const projectileLeft = projectile.x - PROJECTILE_RENDER_SIZE / 2;
      const projectileRight = projectile.x + PROJECTILE_RENDER_SIZE / 2;
      const projectileTop = projectile.y - PROJECTILE_RENDER_SIZE / 2;
      const projectileBottom = projectile.y + PROJECTILE_RENDER_SIZE / 2;

      const unitLeft = unitPos.pixelX - UNIT_RENDER_SIZE / 2;
      const unitRight = unitPos.pixelX + UNIT_RENDER_SIZE / 2;
      const unitTop = unitPos.pixelY - UNIT_RENDER_SIZE / 2;
      const unitBottom = unitPos.pixelY + UNIT_RENDER_SIZE / 2;

      if (
        projectileRight > unitLeft &&
        projectileLeft < unitRight &&
        projectileBottom > unitTop &&
        projectileTop < unitBottom
      ) {
        triggerProjectileDamage(unit, projectile);
        gameState.projectiles.splice(index, 1);
        break;
      }
    }
  }
}

export function updateGameState(gameState: GameState): void {
  if (gameState.status !== "playing") return;

  gameState.simulationTime += SIMULATION_STEP_MS;
  gameState.frameCount += 1;

  gameState.projectiles.forEach((projectile) => {
    projectile.x += projectile.speed;
  });

  checkProjectileCollisions(gameState);
  updateLaneClears(gameState);

  gameState.projectiles = gameState.projectiles.filter(
    (projectile) => projectile.x < 1000,
  );
}
