import { GridLanes } from "./GridLanesCLass.js";
import type { ExceedsDrop, GameState, Projectile } from "./types.js";
import { getEventCoordinates } from "./canvas.js";
import { dragState } from "./dragState.js";
import type { Chicken } from "./shop.js";
import type { CurrencyWallet } from "./currency.js";
import { Kinser } from "./kinser.js";
import { KINSER_CONFIGS } from "./unitData.js";
import { Chicken as ChickenClass } from "./chicken.js";
import { CHICKEN_CONFIGS } from "./unitData.js";
import type { Unit } from "./unit.js";

const spriteCache: Record<string, HTMLImageElement> = {};

function getSprite(src: string): HTMLImageElement {
  if (!spriteCache[src]) {
    const img = new Image();
    img.src = src;
    spriteCache[src] = img;
  }

  return spriteCache[src];
}

function renderUnits(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  if (!gameState.grid) return;

  for (const unit of gameState.units) {
    const pos = gameState.grid.getPixelCoordinates(unit.lane, unit.cell);
    if (!pos) continue;

    const img = getSprite(unit.getImage());
    renderingContext.drawImage(img, pos.pixelX - 30, pos.pixelY - 30, 60, 60);
  }
}

function renderProjectiles(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  for (const projectile of gameState.projectiles) {
    const img = getSprite(projectile.image);
    renderingContext.drawImage(img, projectile.x - 15, projectile.y - 15, 30, 30);
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
  renderingContext.drawImage(img, pixel.pixelX - 30, pixel.pixelY - 30, 60, 60);
  renderingContext.restore();
}

function resetDragState(): void {
  dragState.isDragging = false;
  dragState.chicken = null;
  dragState.offsetX = 0;
  dragState.offsetY = 0;
}

export function createInitialGameState(canvas: HTMLCanvasElement): GameState {
  const startingDrop: ExceedsDrop = {
    id: "starting-exceeds",
    pixelX: canvas.width - 50,
    pixelY: canvas.height - 50,
    amount: 25,
    radius: 24,
  };

  return {
    lastFrameTime: 0,
    frameCount: 0,
    grid: new GridLanes(1, 9, { width: canvas.width, height: canvas.height }),
    units: [],
    projectiles: [],
    exceedsDrops: [startingDrop],
  };
}

export function collectExceeds(amount: number, currencyWallet: CurrencyWallet): boolean {
  return currencyWallet.add("exceeds", amount);
}

export function attemptExceedsCollection(
  pixelX: number,
  pixelY: number,
  gameState: GameState,
  currencyWallet: CurrencyWallet,
): boolean {
  const drop = gameState.exceedsDrops?.find((candidate) => {
    const distanceX = pixelX - candidate.pixelX;
    const distanceY = pixelY - candidate.pixelY;

    return Math.hypot(distanceX, distanceY) <= candidate.radius;
  });

  if (!drop || !collectExceeds(drop.amount, currencyWallet)) {
    return false;
  }

  gameState.exceedsDrops = gameState.exceedsDrops?.filter(
    (candidate) => candidate.id !== drop.id,
  );

  return true;
}

function checkProjectileCollisions(gameState: GameState): void {
  // Check each projectile against each unit
  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    const projectile = gameState.projectiles[i];
    
    for (const unit of gameState.units) {
      if (unit.getType() === "kinser") {
        // Simple bounding box collision (projectile is 30x30, unit is 60x60)
        const unitPos = gameState.grid?.getPixelCoordinates(unit.getLane(), unit.getCell());
        if (!unitPos) continue;
        
        const projectileLeft = projectile.x - 15;
        const projectileRight = projectile.x + 15;
        const projectileTop = projectile.y - 15;
        const projectileBottom = projectile.y + 15;
        
        const unitLeft = unitPos.pixelX - 30;
        const unitRight = unitPos.pixelX + 30;
        const unitTop = unitPos.pixelY - 30;
        const unitBottom = unitPos.pixelY + 30;
        
        if (projectileRight > unitLeft && projectileLeft < unitRight &&
            projectileBottom > unitTop && projectileTop < unitBottom) {
          // Collision detected - trigger damage function (placeholder)
          triggerProjectileDamage(unit, projectile);
          // Remove the projectile
          gameState.projectiles.splice(i, 1);
          break; // Projectile can only hit one unit
        }
      }
    }
  }
}

function triggerProjectileDamage(unit: Unit, projectile: Projectile): void {
  // TODO: Implement actual damage logic
  console.log(`Projectile ${projectile.id} hit ${unit.getType()} ${unit.getId()} for ${projectile.damage} damage`);
}

export function updateGameState(
  gameState: GameState,
  currentTime: number,
): void {
  gameState.lastFrameTime = currentTime;
  gameState.frameCount += 1;

  // Update projectiles
  gameState.projectiles.forEach(projectile => {
    projectile.x += projectile.speed;
  });

  // Check projectile collisions
  checkProjectileCollisions(gameState);

  // Remove projectiles that are off-screen
  gameState.projectiles = gameState.projectiles.filter(projectile => projectile.x < 1000); // Assuming canvas width ~800, remove when far off right
}

export function renderExceedsDrops(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  if (!gameState.exceedsDrops) return;

  for (const drop of gameState.exceedsDrops) {
    renderingContext.fillStyle = "#ffff00";
    renderingContext.beginPath();
    renderingContext.arc(drop.pixelX, drop.pixelY, drop.radius, 0, 2 * Math.PI);
    renderingContext.fill();

    renderingContext.fillStyle = "#000000";
    renderingContext.font = "12px Arial";
    renderingContext.fillText(
      drop.amount.toString(),
      drop.pixelX - 10,
      drop.pixelY + 4,
    );
  }
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
  renderProjectiles(renderingContext, gameState);
  renderExceedsDrops(renderingContext, gameState);
  renderDragPreview(renderingContext, gameState);
  renderDragPreview(renderingContext, gameState);

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

export function attemptUnitPlacement(
  pixelX: number,
  pixelY: number,
  gameState: GameState,
  chicken: Chicken | null = dragState.chicken,
  currencyWallet: CurrencyWallet | null = null,
): boolean {
  if (!gameState.grid || !chicken) return false;
  if (currencyWallet && !currencyWallet.canAfford("exceeds", chicken.cost)) {
    return false;
  }

  const coords = gameState.grid.getGridCoordinates(pixelX, pixelY);
  if (!coords) return false;

  const isOccupied = gameState.units.some(
    (unit) => unit.lane === coords.lane && unit.cell === coords.cell,
  );
  if (isOccupied) return false;

  // Create Chicken instance from shop data
  const chickenConfig = CHICKEN_CONFIGS[chicken.id];
  if (!chickenConfig) return false;

  const unitConfig = {
    ...chickenConfig,
    lane: coords.lane,
    cell: coords.cell,
  };

  if (currencyWallet && !currencyWallet.spend("exceeds", chicken.cost)) {
    return false;
  }

  gameState.units.push(new ChickenClass(unitConfig));
  return true;
}

export function startGameLoop(
  canvas: HTMLCanvasElement,
  renderingContext: CanvasRenderingContext2D,
  currencyWallet: CurrencyWallet,
): void {
  const gameState = createInitialGameState(canvas);

  // TEMP: Spawn one basic Kinser for testing - will be replaced with proper wave system
  const kinserConfig = { ...KINSER_CONFIGS.basic, lane: 0, cell: 8 };
  gameState.units.push(new Kinser(kinserConfig));

  const updatePointerPosition = (event: MouseEvent | TouchEvent) => {
    const { x, y } = getEventCoordinates(event, canvas);
    gameState.coordX = x;
    gameState.coordY = y;
  };

  canvas.addEventListener("pointermove", updatePointerPosition);
  window.addEventListener("pointermove", (event) => {
    if (dragState.isDragging) {
      updatePointerPosition(event);
    }
  });

  canvas.addEventListener("pointerdown", (event) => {
    updatePointerPosition(event);

    if (!dragState.isDragging) {
      attemptExceedsCollection(
        gameState.coordX!,
        gameState.coordY!,
        gameState,
        currencyWallet,
      );
    }
  });

  window.addEventListener("pointerup", (event) => {
    if (!dragState.isDragging || !dragState.chicken) return;

    updatePointerPosition(event);
    const placedChicken = dragState.chicken;

    const success = attemptUnitPlacement(
      gameState.coordX!,
      gameState.coordY!,
      gameState,
      placedChicken,
      currencyWallet,
    );

    if (success) {
      console.log(`Placed: ${placedChicken.name}`);
    }

    resetDragState();
  });

  canvas.addEventListener(
    "touchmove",
    (event) => {
      event.preventDefault();
      updatePointerPosition(event);
    },
    { passive: false },
  );

  function runFrame(currentTime: number): void {
    updateGameState(gameState, currentTime);

    // Update and attack with units
    gameState.units.forEach(unit => unit.update(gameState));
    gameState.units.forEach(unit => unit.attack(gameState));
    gameState.units = gameState.units.filter(unit => unit.isAlive());

    renderFrame(canvas, renderingContext, gameState);
    window.requestAnimationFrame(runFrame);
  }

  window.requestAnimationFrame(runFrame);
}
