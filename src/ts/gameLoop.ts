import { getEventCoordinates } from "./canvas.js";
import { dragState, resetDragState, notifyDragStateChanged } from "./dragState.js";
import type { CurrencyWallet } from "./currency.js";
import { Kinser } from "./kinser.js";
import { KINSER_CONFIGS } from "./unitData.js";
import { createInitialGameState } from "./gameState.js";
import {
  attemptChickenRemoval,
  attemptExceedsCollection,
  attemptUnitPlacement,
} from "./gameInteractions.js";
import { resolveEndOfLaneKinsers } from "./gameLaneClears.js";
import { renderFrame } from "./gameRendering.js";
import { updateGameState } from "./gameSimulation.js";
import {
  matchesFastForwardKey,
  publishDebugState,
  toggleFastForward,
  updateFastForwardButtonState,
} from "./gameUi.js";
import { SIMULATION_STEP_MS, STARTING_KINSER_LANE } from "./gameConstants.js";

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

export { createInitialGameState } from "./gameState.js";
export {
  attemptChickenRemoval,
  attemptExceedsCollection,
  attemptUnitPlacement,
  collectExceeds,
} from "./gameInteractions.js";
export { resolveEndOfLaneKinsers } from "./gameLaneClears.js";
export { renderExceedsDrops, renderFrame } from "./gameRendering.js";
export { updateGameState } from "./gameSimulation.js";

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

  const updatePointerPosition = (event: MouseEvent | PointerEvent | TouchEvent) => {
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
