import type { GameState, Projectile } from "./types.js";
import type { Unit } from "./unit.js";
import { PROJECTILE_RENDER_SIZE, SIMULATION_STEP_MS, UNIT_RENDER_SIZE } from "./gameConstants.js";
import { updateLaneClears } from "./gameLaneClears.js";
import { Kinser } from "./kinser.js";
import { KINSER_CONFIGS, WAVE_CONFIGS } from "./unitData.js";

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
  updateWaves(gameState);

  gameState.projectiles = gameState.projectiles.filter(
    (projectile) => projectile.x < 1000,
  );
}

function updateWaves(gameState: GameState): void {
  if (!gameState.waveActive) return;

  const currentWaveConfig = WAVE_CONFIGS.find(w => w.waveNumber === gameState.currentWave);
  if (!currentWaveConfig) {
    gameState.waveActive = false;
    return;
  }

  const now = gameState.simulationTime;

  // Spawn one tank kinser at the start of each wave
  if (gameState.enemiesSpawnedInWave === 0 && gameState.currentWave > 1) {
    spawnKinser(gameState, "tank");
    gameState.enemiesSpawnedInWave++;
  }

  if (gameState.enemiesSpawnedInWave < currentWaveConfig.enemyCount + (gameState.currentWave > 1 ? 1 : 0)) {
    if (now - gameState.lastSpawnTime >= currentWaveConfig.spawnInterval) {
      spawnKinser(gameState, currentWaveConfig.enemyType);
      gameState.lastSpawnTime = now;
      gameState.enemiesSpawnedInWave++;
    }
  } else {
    // Wave complete, check if all enemies are dead
    const enemiesAlive = gameState.units.some(u => u.getType() === "kinser");
    if (!enemiesAlive) {
      gameState.waveActive = false;
      // Start next wave after delay
      setTimeout(() => {
        gameState.currentWave++;
        gameState.enemiesSpawnedInWave = 0;
        gameState.waveActive = true;
        gameState.lastSpawnTime = gameState.simulationTime;
      }, currentWaveConfig.delayBeforeNextWave);
    }
  }

  // Calculate overall progress across all waves
  const totalEnemiesAllWaves = WAVE_CONFIGS.reduce((total, wave) => 
    total + wave.enemyCount + (wave.waveNumber > 1 ? 1 : 0), 0);
  
  let enemiesSpawnedTotal = 0;
  // Add completed waves
  for (let waveNum = 1; waveNum < gameState.currentWave; waveNum++) {
    const waveConfig = WAVE_CONFIGS.find(w => w.waveNumber === waveNum);
    if (waveConfig) {
      enemiesSpawnedTotal += waveConfig.enemyCount + (waveNum > 1 ? 1 : 0);
    }
  }
  // Add current wave progress
  enemiesSpawnedTotal += gameState.enemiesSpawnedInWave;
  
  gameState.waveProgress = enemiesSpawnedTotal / totalEnemiesAllWaves;
}

function spawnKinser(gameState: GameState, type: "basic" | "tank"): void {
  const startingCell = Math.max((gameState.grid?.getCellCount() ?? 1) - 1, 0);
  const lane = Math.floor(Math.random() * (gameState.grid?.getLaneCount() ?? 1));

  const kinserConfig = { ...KINSER_CONFIGS[type], lane, cell: startingCell };
  gameState.units.push(new Kinser(kinserConfig));
}
