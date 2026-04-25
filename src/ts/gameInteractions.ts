import { dragState } from "./dragState.js";
import type { Chicken } from "./shop.js";
import type { CurrencyWallet } from "./currency.js";
import { CHICKEN_CONFIGS } from "./unitData.js";
import { Chicken as ChickenClass } from "./chicken.js";
import type { GameState } from "./types.js";

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
