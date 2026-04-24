import { GridLanes } from "./GridLanes.js";
import type {
  ActiveLaneClear,
  ExceedsDrop,
  GameState,
  Projectile,
} from "./types.js";
import { getEventCoordinates } from "./canvas.js";
import { dragState, resetDragState, notifyDragStateChanged } from "./dragState.js";
import type { Chicken } from "./shop.js";
import type { CurrencyWallet } from "./currency.js";
import { Kinser } from "./kinser.js";
import { KINSER_CONFIGS, CHICKEN_CONFIGS } from "./unitData.js";
import { Chicken as ChickenClass } from "./chicken.js";
import type { Unit } from "./unit.js";
import { readStoredSettings } from "./settings.js";

const spriteCache: Record<string, HTMLImageElement> = {};
const HELICOPTER_SPRITE = "./assets/attackHeli.png";
const UNIT_RENDER_SIZE = 60;
const PROJECTILE_RENDER_SIZE = 30;
const HELICOPTER_WIDTH = 88;
const HELICOPTER_HEIGHT = 34;
const HELICOPTER_MARKER_WIDTH = 72;
const HELICOPTER_MARKER_HEIGHT = 42;
const HELICOPTER_START_OFFSET = 60;
const HELICOPTER_CLEAR_FRONT_OFFSET = 26;
const NORMAL_SPEED_MULTIPLIER = 1;
const FAST_FORWARD_SPEED_MULTIPLIER = 2;
const SIMULATION_STEP_MS = 1000 / 60;

export interface GameLoopControls {
  pause: () => void;
  resume: () => void;
  restart: () => void;
  spawnEnemy: () => void;
  toggleFastForward: () => void;
  isFastForwardEnabled: () => boolean;
  isPaused: () => boolean;
  isGameOver: () => boolean;
}

const STARTING_KINSER_LANE = 1;

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
    renderingContext.drawImage(
      img,
      pos.pixelX - UNIT_RENDER_SIZE / 2,
      pos.pixelY - UNIT_RENDER_SIZE / 2,
      UNIT_RENDER_SIZE,
      UNIT_RENDER_SIZE,
    );
  }
}

function renderProjectiles(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  for (const projectile of gameState.projectiles) {
    const img = getSprite(projectile.image);
    renderingContext.drawImage(
      img,
      projectile.x - PROJECTILE_RENDER_SIZE / 2,
      projectile.y - PROJECTILE_RENDER_SIZE / 2,
      PROJECTILE_RENDER_SIZE,
      PROJECTILE_RENDER_SIZE,
    );
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
  renderingContext.drawImage(
    img,
    pixel.pixelX - UNIT_RENDER_SIZE / 2,
    pixel.pixelY - UNIT_RENDER_SIZE / 2,
    UNIT_RENDER_SIZE,
    UNIT_RENDER_SIZE,
  );
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

    if (helicopterSprite.complete && helicopterSprite.naturalWidth > 0) {
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

  if (helicopterSprite.complete && helicopterSprite.naturalWidth > 0) {
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

export function createInitialGameState(canvas: HTMLCanvasElement): GameState {
  const startingDrop: ExceedsDrop = {
    id: "starting-exceeds",
    pixelX: canvas.width - 50,
    pixelY: canvas.height - 50,
    amount: 25,
    radius: 24,
  };

  const gridMargins = {
    top: 120, // Clear the shop UI
    bottom: 20,
    left: 100, // Space for lawn mowers/house
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

        const projectileLeft = projectile.x - PROJECTILE_RENDER_SIZE / 2;
        const projectileRight = projectile.x + PROJECTILE_RENDER_SIZE / 2;
        const projectileTop = projectile.y - PROJECTILE_RENDER_SIZE / 2;
        const projectileBottom = projectile.y + PROJECTILE_RENDER_SIZE / 2;

        const unitLeft = unitPos.pixelX - UNIT_RENDER_SIZE / 2;
        const unitRight = unitPos.pixelX + UNIT_RENDER_SIZE / 2;
        const unitTop = unitPos.pixelY - UNIT_RENDER_SIZE / 2;
        const unitBottom = unitPos.pixelY + UNIT_RENDER_SIZE / 2;

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
  unit.takeDamage(projectile.damage);
}

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

function updateLaneClears(gameState: GameState): void {
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

export function attemptChickenRemoval(
  pixelX: number,
  pixelY: number,
  gameState: GameState,
): boolean {
  if (!gameState.grid) return false;

  const coords = gameState.grid.getGridCoordinates(pixelX, pixelY);
  if (!coords) return false;

  const chickenIndex = gameState.units.findIndex(
    (unit) =>
      unit.getType() === "chicken" &&
      unit.getLane() === coords.lane &&
      unit.getCell() === coords.cell,
  );

  if (chickenIndex < 0) return false;

  gameState.units.splice(chickenIndex, 1);
  return true;
}

export function updateGameState(
  gameState: GameState,
): void {
  if (gameState.status !== "playing") return;

  gameState.simulationTime += SIMULATION_STEP_MS;
  gameState.frameCount += 1;

  // Update projectiles
  gameState.projectiles.forEach(projectile => {
    projectile.x += projectile.speed;
  });

  // Check projectile collisions
  checkProjectileCollisions(gameState);

  updateLaneClears(gameState);

  // Remove projectiles that are off-screen
  gameState.projectiles = gameState.projectiles.filter(projectile => projectile.x < 1000); // Assuming canvas width ~800, remove when far off right
}

function toggleFastForward(gameState: GameState): boolean {
  gameState.fastForwardEnabled = !gameState.fastForwardEnabled;
  gameState.speedMultiplier = gameState.fastForwardEnabled
    ? FAST_FORWARD_SPEED_MULTIPLIER
    : NORMAL_SPEED_MULTIPLIER;

  return gameState.fastForwardEnabled;
}

function updateFastForwardButtonState(
  fastForwardButton: HTMLButtonElement | null,
  gameState: GameState,
): void {
  if (!fastForwardButton) {
    return;
  }

  const buttonLabel = gameState.fastForwardEnabled ? ">>" : ">";
  const buttonDescription = gameState.fastForwardEnabled
    ? "Return gameplay to normal speed"
    : "Speed gameplay up to 2x";

  fastForwardButton.textContent = buttonLabel;
  fastForwardButton.setAttribute("aria-label", buttonDescription);
  fastForwardButton.setAttribute(
    "aria-pressed",
    String(gameState.fastForwardEnabled),
  );
  fastForwardButton.dataset.active = String(gameState.fastForwardEnabled);
  fastForwardButton.title = `Fast forward (${readStoredSettings().fastForwardKey || "F"})`;
}

function shouldIgnoreKeybindTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

function matchesFastForwardKey(event: KeyboardEvent): boolean {
  if (event.repeat || shouldIgnoreKeybindTarget(event.target)) {
    return false;
  }

  const configuredKey = readStoredSettings().fastForwardKey.trim();
  if (!configuredKey) {
    return event.key.toLowerCase() === "f";
  }

  return event.key.toLowerCase() === configuredKey.toLowerCase();
}

function publishDebugState(gameState: GameState): void {
  (
    window as Window & {
      __cvkDebug?: {
        getGameStateSnapshot: () => {
          frameCount: number;
          simulationTime: number;
          speedMultiplier: number;
          fastForwardEnabled: boolean;
        };
      };
    }
  ).__cvkDebug = {
    getGameStateSnapshot: () => ({
      frameCount: gameState.frameCount,
      simulationTime: gameState.simulationTime,
      speedMultiplier: gameState.speedMultiplier,
      fastForwardEnabled: gameState.fastForwardEnabled,
    }),
  };
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
  renderLaneClears(renderingContext, gameState);
  renderProjectiles(renderingContext, gameState);
  renderExceedsDrops(renderingContext, gameState);
  renderDragPreview(renderingContext, gameState);
  renderNetPreview(renderingContext, gameState);

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
): GameLoopControls {
  let gameState = createInitialGameState(canvas);
  let simulationAccumulatorMs = 0;
  const fastForwardButton = document.getElementById(
    "fastForwardBtn",
  ) as HTMLButtonElement | null;

  const spawnKinser = (lane = STARTING_KINSER_LANE): void => {
    const startingCell = Math.max((gameState.grid?.getCellCount() ?? 1) - 1, 0);

    // TEMP: Spawn one basic Kinser for testing - will be replaced with proper wave system
    const kinserConfig = { ...KINSER_CONFIGS.basic, lane, cell: startingCell };
    gameState.units.push(new Kinser(kinserConfig));
  };

  const setGameOver = (): void => {
    if (gameState.status === "gameOver") return;

    gameState.status = "gameOver";
    resetDragState();
    window.dispatchEvent(new CustomEvent("game:over"));
  };

  const restartGame = (): void => {
    gameState = createInitialGameState(canvas);
    simulationAccumulatorMs = 0;
    spawnKinser();
    currencyWallet.reset({ exceeds: 100, eggs: 0 });
    resetDragState();
    updateFastForwardButtonState(fastForwardButton, gameState);
    publishDebugState(gameState);
  };

  const handleFastForwardToggle = (): void => {
    if (gameState.status === "gameOver") {
      return;
    }

    toggleFastForward(gameState);
    updateFastForwardButtonState(fastForwardButton, gameState);
  };

  spawnKinser();
  updateFastForwardButtonState(fastForwardButton, gameState);
  publishDebugState(gameState);

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
    if (gameState.status !== "playing") return;

    updatePointerPosition(event);

    if (dragState.activeTool === "net") {
      const removedChicken = attemptChickenRemoval(
        gameState.coordX!,
        gameState.coordY!,
        gameState,
      );

      if (removedChicken) {
        dragState.activeTool = "place";
        notifyDragStateChanged();
      }

      return;
    }

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
    if (
      gameState.status !== "playing" ||
      !dragState.isDragging ||
      !dragState.chicken
    ) {
      return;
    }

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
      if (gameState.status !== "playing") return;

      event.preventDefault();
      updatePointerPosition(event);
    },
    { passive: false },
  );

  fastForwardButton?.addEventListener("click", () => {
    handleFastForwardToggle();
  });

  window.addEventListener("keydown", (event) => {
    if (!matchesFastForwardKey(event)) {
      return;
    }

    event.preventDefault();
    handleFastForwardToggle();
  });

  const runSimulationStep = (): void => {
    updateGameState(gameState);

    gameState.units = gameState.units.filter((unit) => unit.isAlive());
    gameState.units.forEach((unit) => unit.update(gameState));
    gameState.units.forEach((unit) => unit.attack(gameState));
    gameState.units = gameState.units.filter((unit) => unit.isAlive());

    if (resolveEndOfLaneKinsers(gameState)) {
      setGameOver();
    }
  };

  function runFrame(currentTime: number): void {
    if (gameState.status === "playing") {
      if (gameState.lastFrameTime === 0) {
        gameState.lastFrameTime = currentTime;
      }

      const elapsedMs = Math.min(currentTime - gameState.lastFrameTime, 250);
      gameState.lastFrameTime = currentTime;
      simulationAccumulatorMs += elapsedMs * gameState.speedMultiplier;

      while (
        simulationAccumulatorMs >= SIMULATION_STEP_MS &&
        gameState.status === "playing"
      ) {
        runSimulationStep();
        simulationAccumulatorMs -= SIMULATION_STEP_MS;
      }
    } else {
      gameState.lastFrameTime = 0;
      simulationAccumulatorMs = 0;
    }

    renderFrame(canvas, renderingContext, gameState);
    window.requestAnimationFrame(runFrame);
  }

  window.requestAnimationFrame(runFrame);

  return {
    pause: () => {
      if (gameState.status !== "playing") return;

      gameState.status = "paused";
      gameState.lastFrameTime = 0;
      simulationAccumulatorMs = 0;
      resetDragState();
    },
    resume: () => {
      if (gameState.status !== "paused") return;

      gameState.status = "playing";
      gameState.lastFrameTime = 0;
    },
    restart: restartGame,
    spawnEnemy: () => {
      if (gameState.status !== "playing") return;

      spawnKinser();
    },
    toggleFastForward: () => {
      handleFastForwardToggle();
    },
    isFastForwardEnabled: () => gameState.fastForwardEnabled,
    isPaused: () => gameState.status === "paused",
    isGameOver: () => gameState.status === "gameOver",
  };
}
