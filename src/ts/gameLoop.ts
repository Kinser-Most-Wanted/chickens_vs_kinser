import { GridLanes } from "./GridLanesCLass.js";
import type { GameState, Unit } from "./types.js";
import { getEventCoordinates } from "./canvas.js";
import { dragState } from "./dragState.js";

const spriteCache: Record<string, HTMLImageElement> = {};

function getSprite(src: string): HTMLImageElement {
  if (!spriteCache[src]) {
    const img = new Image();
    img.src = src;
    spriteCache[src] = img;
  }

  return spriteCache[src];
}

function getUnitSpriteSrc(type: string): string {
  switch (type) {
    case "exceeds":
      return "./assets/exceedschicken.png";
    case "tank":
      return "./assets/tankchicken.png";
    case "basic":
    case "chicken":
    default:
      return "./assets/basicchicken.png";
  }
}

function renderUnits(
  renderingContext: CanvasRenderingContext2D,
  gameState: GameState,
): void {
  if (!gameState.grid) return;

  for (const unit of gameState.units) {
    const pos = gameState.grid.getPixelCoordinates(unit.lane, unit.cell);
    if (!pos) continue;

    const img = getSprite(getUnitSpriteSrc(unit.type));
    renderingContext.drawImage(img, pos.pixelX - 30, pos.pixelY - 30, 60, 60);
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

  if (gameState.grid) {
    gameState.grid.render(renderingContext, gameState.coordX, gameState.coordY);
  }

  renderUnits(renderingContext, gameState);
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
): boolean {
  if (!gameState.grid) return false;

  const coords = gameState.grid.getGridCoordinates(pixelX, pixelY);
  if (!coords) return false;

  const isOccupied = gameState.units.some(
    (unit) => unit.lane === coords.lane && unit.cell === coords.cell,
  );
  if (isOccupied) return false;

  const unit: Unit = {
    lane: coords.lane,
    cell: coords.cell,
    type: dragState.chicken?.id ?? "chicken",
  };

  gameState.units.push(unit);
  return true;
}

export function startGameLoop(
  canvas: HTMLCanvasElement,
  renderingContext: CanvasRenderingContext2D,
): void {
  const gameState = createInitialGameState(canvas);

  const updatePointerPosition = (event: MouseEvent | TouchEvent) => {
    const { x, y } = getEventCoordinates(event, canvas);
    gameState.coordX = x;
    gameState.coordY = y;
  };

  canvas.addEventListener("mousemove", updatePointerPosition);

  canvas.addEventListener("mousedown", (event) => {
    updatePointerPosition(event);

    if (dragState.isDragging) {
      return;
    }

    attemptUnitPlacement(gameState.coordX!, gameState.coordY!, gameState);
  });

  canvas.addEventListener("mouseup", (event) => {
    if (!dragState.isDragging || !dragState.chicken) return;

    updatePointerPosition(event);

    const success = attemptUnitPlacement(
      gameState.coordX!,
      gameState.coordY!,
      gameState,
    );

    if (success) {
      console.log(`Placed: ${dragState.chicken.name}`);
      resetDragState();
    }
  });

  canvas.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      updatePointerPosition(event);

      if (dragState.isDragging && dragState.chicken) {
        const success = attemptUnitPlacement(
          gameState.coordX!,
          gameState.coordY!,
          gameState,
        );

        if (success) {
          console.log(`Placed: ${dragState.chicken.name}`);
          resetDragState();
        }

        return;
      }

      attemptUnitPlacement(gameState.coordX!, gameState.coordY!, gameState);
    },
    { passive: false },
  );

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
    renderFrame(canvas, renderingContext, gameState);
    window.requestAnimationFrame(runFrame);
  }

  window.requestAnimationFrame(runFrame);
}
