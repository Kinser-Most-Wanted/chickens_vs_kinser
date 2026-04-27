import type { ActiveLaneClear, GameState } from "./types.js";
import { dragState } from "./dragState.js";
import {
  HELICOPTER_HEIGHT,
  HELICOPTER_MARKER_HEIGHT,
  HELICOPTER_MARKER_WIDTH,
  HELICOPTER_SPRITE,
  HELICOPTER_WIDTH,
  PROJECTILE_RENDER_SIZE,
  UNIT_RENDER_SIZE,
} from "./gameConstants.js";

const spriteCache: Record<string, HTMLImageElement> = {};

function getSprite(src: string): HTMLImageElement | null {
  if (typeof Image === "undefined") {
    return null;
  }

  if (!spriteCache[src]) {
    const img = new Image();
    img.src = src;
    spriteCache[src] = img;
  }

  return spriteCache[src];
}

const EXCEEDS_SPRITE = "./assets/exceeds.png";

function renderUnits(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  if (!gameState.grid) return;

  for (const unit of gameState.units) {
    const pos = gameState.grid.getPixelCoordinates(unit.lane, unit.cell);
    if (!pos) continue;

    const img = getSprite(unit.getImage());

if (img && img.complete && img.naturalWidth > 0) {
  renderingContext.drawImage(
    img,
    pos.pixelX - UNIT_RENDER_SIZE / 2,
    pos.pixelY - UNIT_RENDER_SIZE / 2,
    UNIT_RENDER_SIZE,
    UNIT_RENDER_SIZE,
  );
} else {
  renderingContext.fillStyle = "#ffffff";
  renderingContext.fillRect(
    pos.pixelX - UNIT_RENDER_SIZE / 2,
    pos.pixelY - UNIT_RENDER_SIZE / 2,
    UNIT_RENDER_SIZE,
    UNIT_RENDER_SIZE,
  );
}
  }
}

function renderProjectiles(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  for (const projectile of gameState.projectiles) {
    const img = getSprite(projectile.image);

if (img && img.complete && img.naturalWidth > 0) {
  renderingContext.drawImage(
    img,
    projectile.x - PROJECTILE_RENDER_SIZE / 2,
    projectile.y - PROJECTILE_RENDER_SIZE / 2,
    PROJECTILE_RENDER_SIZE,
    PROJECTILE_RENDER_SIZE,
  );
} else {
  renderingContext.fillStyle = "#ffffff";
  renderingContext.beginPath();
  renderingContext.arc(
    projectile.x,
    projectile.y,
    PROJECTILE_RENDER_SIZE / 2,
    0,
    Math.PI * 2,
  );
  renderingContext.fill();
}
  }
}

function renderDragPreview(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  if (
    !dragState.isDragging ||
    !dragState.chicken ||
    !gameState.grid ||
    gameState.coordX === undefined ||
    gameState.coordY === undefined
  ) {
    return;
  }

  const coords = gameState.grid.getGridCoordinates(
    gameState.coordX,
    gameState.coordY,
  );
  if (!coords) return;

  const pixel = gameState.grid.getPixelCoordinates(coords.lane, coords.cell);
  const img = getSprite(dragState.chicken.image);

renderingContext.save();
renderingContext.globalAlpha = 0.6;

if (img && img.complete && img.naturalWidth > 0) {
  renderingContext.drawImage(
    img,
    pixel.pixelX - UNIT_RENDER_SIZE / 2,
    pixel.pixelY - UNIT_RENDER_SIZE / 2,
    UNIT_RENDER_SIZE,
    UNIT_RENDER_SIZE,
  );
} else {
  renderingContext.fillStyle = "#ffffff";
  renderingContext.fillRect(
    pixel.pixelX - UNIT_RENDER_SIZE / 2,
    pixel.pixelY - UNIT_RENDER_SIZE / 2,
    UNIT_RENDER_SIZE,
    UNIT_RENDER_SIZE,
  );
}

renderingContext.restore();
}

function renderNetPreview(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  if (
    dragState.activeTool !== "net" ||
    !gameState.grid ||
    gameState.coordX === undefined ||
    gameState.coordY === undefined
  ) {
    return;
  }

  const coords = gameState.grid.getGridCoordinates(gameState.coordX, gameState.coordY);
  if (!coords) return;

  const pixel = gameState.grid.getPixelCoordinates(coords.lane, coords.cell);

  renderingContext.save();
  renderingContext.strokeStyle = "rgba(255, 255, 255, 0.9)";
  renderingContext.lineWidth = 3;
  renderingContext.beginPath();
  renderingContext.arc(pixel.pixelX, pixel.pixelY, 26, 0, Math.PI * 2);
  renderingContext.stroke();
  renderingContext.beginPath();
  renderingContext.moveTo(pixel.pixelX - 18, pixel.pixelY - 18);
  renderingContext.lineTo(pixel.pixelX + 18, pixel.pixelY + 18);
  renderingContext.moveTo(pixel.pixelX + 18, pixel.pixelY - 18);
  renderingContext.lineTo(pixel.pixelX - 18, pixel.pixelY + 18);
  renderingContext.stroke();
  renderingContext.restore();
}

function renderLaneClearMarkers(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  if (!gameState.grid) return;

  const bounds = gameState.grid.getBounds();
  const helicopterSprite = getSprite(HELICOPTER_SPRITE);

  for (const laneClear of gameState.laneClears) {
    if (!laneClear.armed) {
      continue;
    }

    const laneCenter = gameState.grid.getPixelCoordinates(laneClear.lane, 0);
    const markerX = bounds.x - HELICOPTER_MARKER_WIDTH - 12;
    const markerY = laneCenter.pixelY - HELICOPTER_MARKER_HEIGHT / 2;

    renderingContext.save();

    if (helicopterSprite && helicopterSprite.complete && helicopterSprite.naturalWidth > 0) {
      renderingContext.drawImage(
        helicopterSprite,
        markerX,
        markerY,
        HELICOPTER_MARKER_WIDTH,
        HELICOPTER_MARKER_HEIGHT,
      );
    } else {
      renderingContext.fillStyle = "#f5d067";
      renderingContext.strokeStyle = "#fff6c7";
      renderingContext.lineWidth = 2;
      renderingContext.fillRect(
        markerX,
        markerY,
        HELICOPTER_MARKER_WIDTH,
        HELICOPTER_MARKER_HEIGHT,
      );
      renderingContext.strokeRect(
        markerX,
        markerY,
        HELICOPTER_MARKER_WIDTH,
        HELICOPTER_MARKER_HEIGHT,
      );
    }

    renderingContext.restore();
  }
}

function renderHelicopter(
  renderingContext: CanvasRenderingContext2D,
  laneClear: ActiveLaneClear,
  gameState: GameState,
): void {
  if (!gameState.grid) return;

  const laneCenter = gameState.grid.getPixelCoordinates(laneClear.lane, 0);
  const bodyX = laneClear.x;
  const bodyY = laneCenter.pixelY - HELICOPTER_HEIGHT / 2;
  const helicopterSprite = getSprite(HELICOPTER_SPRITE);

  if (helicopterSprite && helicopterSprite.complete && helicopterSprite.naturalWidth > 0) {
    renderingContext.drawImage(
      helicopterSprite,
      bodyX,
      bodyY,
      HELICOPTER_WIDTH,
      HELICOPTER_HEIGHT,
    );
    return;
  }

  renderingContext.save();
  renderingContext.fillStyle = "#d4b44b";
  renderingContext.strokeStyle = "#4a3a12";
  renderingContext.lineWidth = 2;
  renderingContext.fillRect(bodyX, bodyY, HELICOPTER_WIDTH, HELICOPTER_HEIGHT);
  renderingContext.strokeRect(bodyX, bodyY, HELICOPTER_WIDTH, HELICOPTER_HEIGHT);

  renderingContext.fillStyle = "#8ab4d6";
  renderingContext.fillRect(bodyX + 12, bodyY + 7, 26, 12);

  renderingContext.fillStyle = "#5c4a1f";
  renderingContext.fillRect(bodyX + 74, bodyY + 12, 28, 6);
  renderingContext.fillRect(bodyX + 10, bodyY + HELICOPTER_HEIGHT, 50, 4);
  renderingContext.fillRect(bodyX + 48, bodyY + HELICOPTER_HEIGHT, 4, 10);

  renderingContext.strokeStyle = "#1f1f1f";
  renderingContext.beginPath();
  renderingContext.moveTo(bodyX + 44, bodyY - 10);
  renderingContext.lineTo(bodyX + 44, bodyY + 4);
  renderingContext.moveTo(bodyX + 12, bodyY - 10);
  renderingContext.lineTo(bodyX + 76, bodyY - 10);
  renderingContext.moveTo(bodyX + 32, bodyY - 14);
  renderingContext.lineTo(bodyX + 56, bodyY - 6);
  renderingContext.moveTo(bodyX + 56, bodyY - 14);
  renderingContext.lineTo(bodyX + 32, bodyY - 6);
  renderingContext.stroke();
  renderingContext.restore();
}

function renderLaneClears(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  renderLaneClearMarkers(renderingContext, gameState);

  for (const laneClear of gameState.activeLaneClears) {
    renderHelicopter(renderingContext, laneClear, gameState);
  }
}

export function renderExceedsDrops(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {

  const exceedsSprite = getSprite(EXCEEDS_SPRITE);
  if (!gameState.exceedsDrops) return;

  for (const drop of gameState.exceedsDrops) {
    const size = drop.radius * 2;

    if (exceedsSprite && exceedsSprite.complete && exceedsSprite.naturalWidth > 0) {
      renderingContext.drawImage(
        exceedsSprite,
        drop.pixelX - drop.radius,
        drop.pixelY - drop.radius,
        size,
        size,
      );
    } else {
      renderingContext.fillStyle = "#ffff00";
      renderingContext.beginPath();
      renderingContext.arc(drop.pixelX, drop.pixelY, drop.radius, 0, 2 * Math.PI);
      renderingContext.fill();
    }

    renderingContext.fillStyle = "#ffffff";
    renderingContext.font = "bold 14px Arial";
    renderingContext.textAlign = "center";
    renderingContext.fillText(
      drop.amount.toString(),
      drop.pixelX,
      drop.pixelY + drop.radius + 15,
    );
    renderingContext.textAlign = "left";
  }
}

function renderWaveProgress(
  renderingContext: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  gameState: GameState,
): void {
  const barWidth = 400;
  const barHeight = 20;
  const barX = (canvas.width - barWidth) / 2;
  const barY = canvas.height - 40;

  // Background
  renderingContext.fillStyle = "#333333";
  renderingContext.fillRect(barX, barY, barWidth, barHeight);

  // Progress
  renderingContext.fillStyle = "#4caf50";
  renderingContext.fillRect(barX, barY, barWidth * gameState.waveProgress, barHeight);

  // Wave boundary flags
  const totalEnemiesAllWaves = 21; // 5 + 9 + 7
  const wave1End = 5 / totalEnemiesAllWaves; // Wave 1: 5 enemies
  const wave2End = (5 + 9) / totalEnemiesAllWaves; // Wave 2: 5 + 9 = 14 enemies
  // Wave 3 goes to the end

  renderingContext.strokeStyle = "#ffffff";
  renderingContext.lineWidth = 2;

  // Wave 1-2 boundary flag
  const flag1X = barX + barWidth * wave1End;
  renderingContext.beginPath();
  renderingContext.moveTo(flag1X, barY - 5);
  renderingContext.lineTo(flag1X, barY + barHeight + 5);
  renderingContext.stroke();

  // Wave 2-3 boundary flag
  const flag2X = barX + barWidth * wave2End;
  renderingContext.beginPath();
  renderingContext.moveTo(flag2X, barY - 5);
  renderingContext.lineTo(flag2X, barY + barHeight + 5);
  renderingContext.stroke();

  // Border
  renderingContext.strokeStyle = "#ffffff";
  renderingContext.lineWidth = 2;
  renderingContext.strokeRect(barX, barY, barWidth, barHeight);

  // Text - show current wave and overall progress
  renderingContext.fillStyle = "#ffffff";
  renderingContext.font = "16px Arial";
  renderingContext.textAlign = "center";
  const progressPercent = Math.round(gameState.waveProgress * 100);
  renderingContext.fillText(
    `Wave ${gameState.currentWave}/3 - ${progressPercent}%`,
    barX + barWidth / 2,
    barY - 5,
  );
  renderingContext.textAlign = "left";
}

export function renderFrame(
  canvas: HTMLCanvasElement,
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  renderingContext.clearRect(0, 0, canvas.width, canvas.height);

  renderingContext.fillStyle = "#111111";
  renderingContext.fillRect(0, 0, canvas.width, canvas.height);

  if (gameState.grid) {
    gameState.grid.render(renderingContext, gameState.coordX, gameState.coordY);
  }

  renderUnits(renderingContext, gameState);
  renderLaneClears(renderingContext, gameState);
  renderProjectiles(renderingContext, gameState);
  renderExceedsDrops(renderingContext, gameState);
  renderDragPreview(renderingContext, gameState);
  renderNetPreview(renderingContext, gameState);

  // Render wave progress bar
  renderWaveProgress(renderingContext, canvas, gameState);

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
