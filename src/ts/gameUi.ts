import type { GameState } from "./types.js";
import type { CurrencyWallet } from "./currency.js";
import type { PlacementCooldowns } from "./placementCooldowns.js";
import {
  FAST_FORWARD_SPEED_MULTIPLIER,
  NORMAL_SPEED_MULTIPLIER,
} from "./gameConstants.js";
import { readStoredSettings } from "./settings.js";

export function toggleFastForward(gameState: GameState): boolean {
  gameState.fastForwardEnabled = !gameState.fastForwardEnabled;
  gameState.speedMultiplier = gameState.fastForwardEnabled
    ? FAST_FORWARD_SPEED_MULTIPLIER
    : NORMAL_SPEED_MULTIPLIER;

  return gameState.fastForwardEnabled;
}

export function updateFastForwardButtonState(
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

export function matchesFastForwardKey(event: KeyboardEvent): boolean {
  if (event.repeat || shouldIgnoreKeybindTarget(event.target)) {
    return false;
  }

  const configuredKey = readStoredSettings().fastForwardKey.trim();
  if (!configuredKey) {
    return event.key.toLowerCase() === "f";
  }

  return event.key.toLowerCase() === configuredKey.toLowerCase();
}

export function publishDebugState(
  gameState: GameState,
  currencyWallet: CurrencyWallet,
  placementCooldowns: PlacementCooldowns,
): void {
  (
    window as Window & {
      __cvkDebug?: {
        getGameStateSnapshot: () => {
          frameCount: number;
          simulationTime: number;
          speedMultiplier: number;
          fastForwardEnabled: boolean;
        };
        getPlacementCooldowns: () => Array<{
          unitId: string;
          durationMs: number;
          remainingMs: number;
          progress: number;
          active: boolean;
        }>;
        grantCurrency: (type: "exceeds" | "eggs", amount: number) => void;
      };
    }
  ).__cvkDebug = {
    getGameStateSnapshot: () => ({
      frameCount: gameState.frameCount,
      simulationTime: gameState.simulationTime,
      speedMultiplier: gameState.speedMultiplier,
      fastForwardEnabled: gameState.fastForwardEnabled,
    }),
    getPlacementCooldowns: () => placementCooldowns.getAllSnapshots(),
    grantCurrency: (type, amount) => {
      currencyWallet.add(type, amount);
    },
  };
}
