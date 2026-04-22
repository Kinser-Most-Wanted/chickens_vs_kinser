import { test, expect } from "@playwright/test";
import { GridLanes } from "../src/ts/GridLanes";
import {
  attemptExceedsCollection,
  attemptUnitPlacement,
  collectExceeds,
  createInitialGameState,
  resolveEndOfLaneKinsers,
} from "../src/ts/gameLoop";
import { CurrencyWallet } from "../src/ts/currency";
import type { GameState, CanvasDimensions } from "../src/ts/types";
import type { Chicken } from "../src/ts/shop";
import { Kinser } from "../src/ts/kinser";
import { KINSER_CONFIGS } from "../src/ts/unitData";

test.describe("Grid System Logic", () => {
  const dimensions: CanvasDimensions = { width: 800, height: 600 };
  const lanes = 5;
  const cells = 9;
  const grid = new GridLanes(lanes, cells, dimensions, {
    left: 40,
    right: 40,
    top: 50,
    bottom: 50,
  });

  // Constants from GridLanesCLass.ts
  const cellWidth = 80;
  const cellHeight = 100;
  const totalGridWidth = cells * cellWidth; // 720
  const totalGridHeight = lanes * cellHeight; // 500
  const xOffset = (dimensions.width - totalGridWidth) / 2; // (800 - 720) / 2 = 40
  const yOffset = (dimensions.height - totalGridHeight) / 2; // (600 - 500) / 2 = 50
  const basicChicken: Chicken = {
    id: "basic",
    name: "Basic Chicken",
    cost: 100,
    image: "./assets/basicchicken.png",
  };

  test("Grid Coordinate Mapping: getPixelCoordinates calculates center of cell", () => {
    // Test for lane 0, cell 0
    const coords00 = grid.getPixelCoordinates(0, 0);
    expect(coords00.pixelX).toBe(xOffset + cellWidth / 2);
    expect(coords00.pixelY).toBe(yOffset + cellHeight / 2);

    // Test for lane 2, cell 4
    const coords24 = grid.getPixelCoordinates(2, 4);
    expect(coords24.pixelX).toBe(xOffset + 4 * cellWidth + cellWidth / 2);
    expect(coords24.pixelY).toBe(yOffset + 2 * cellHeight + cellHeight / 2);
  });

  test("Grid Coordinate Mapping: getGridCoordinates maps pixels back to indices", () => {
    // Center of lane 1, cell 1
    const x = xOffset + cellWidth + cellWidth / 2;
    const y = yOffset + cellHeight + cellHeight / 2;
    const gridCoords = grid.getGridCoordinates(x, y);
    
    expect(gridCoords).not.toBeNull();
    expect(gridCoords?.lane).toBe(1);
    expect(gridCoords?.cell).toBe(1);

    // Near the edge of lane 0, cell 0
    const edgeCoords = grid.getGridCoordinates(xOffset + 1, yOffset + 1);
    expect(edgeCoords?.lane).toBe(0);
    expect(edgeCoords?.cell).toBe(0);
  });

  test("Boundary Validation: getGridCoordinates returns null for out-of-bounds", () => {
    // Negative bounds
    expect(grid.getGridCoordinates(xOffset - 1, yOffset)).toBeNull();
    expect(grid.getGridCoordinates(xOffset, yOffset - 1)).toBeNull();
    
    // Positive bounds
    expect(grid.getGridCoordinates(xOffset + totalGridWidth + 1, yOffset)).toBeNull();
    expect(grid.getGridCoordinates(xOffset, yOffset + totalGridHeight + 1)).toBeNull();

    // Far outside
    expect(grid.getGridCoordinates(-100, -100)).toBeNull();
    expect(grid.getGridCoordinates(2000, 2000)).toBeNull();
  });

  test("Unit Placement Logic: attemptUnitPlacement success", () => {
    const gameState: GameState = {
      lastFrameTime: 0,
      frameCount: 0,
      grid: grid,
      units: [],
    };

    const x = xOffset + cellWidth / 2;
    const y = yOffset + cellHeight / 2;

    const result = attemptUnitPlacement(x, y, gameState, basicChicken);
    
    expect(result).toBe(true);
    expect(gameState.units.length).toBe(1);
    expect(gameState.units[0].getLane()).toBe(0);
    expect(gameState.units[0].getCell()).toBe(0);
    expect(gameState.units[0].getId()).toBe("basic-chicken");
  });

  test("Currency Logic: collectExceeds adds to the exceeds counter", () => {
    const wallet = new CurrencyWallet({ exceeds: 0, eggs: 0 });

    const result = collectExceeds(25, wallet);

    expect(result).toBe(true);
    expect(wallet.getBalance("exceeds")).toBe(25);
    expect(wallet.getBalance("eggs")).toBe(0);
  });

  test("Currency Logic: attemptExceedsCollection collects a gameplay drop once", () => {
    const wallet = new CurrencyWallet({ exceeds: 0, eggs: 0 });
    const gameState: GameState = {
      lastFrameTime: 0,
      frameCount: 0,
      units: [],
      exceedsDrops: [
        {
          id: "test-drop",
          pixelX: 100,
          pixelY: 100,
          amount: 25,
          radius: 20,
        },
      ],
    };

    expect(attemptExceedsCollection(100, 100, gameState, wallet)).toBe(true);
    expect(wallet.getBalance("exceeds")).toBe(25);
    expect(gameState.exceedsDrops).toEqual([]);

    expect(attemptExceedsCollection(100, 100, gameState, wallet)).toBe(false);
    expect(wallet.getBalance("exceeds")).toBe(25);
  });

  test("Currency Logic: attemptUnitPlacement spends chicken cost on success", () => {
    const wallet = new CurrencyWallet({ exceeds: 100, eggs: 0 });
    const gameState: GameState = {
      lastFrameTime: 0,
      frameCount: 0,
      grid: grid,
      units: [],
    };

    const x = xOffset + cellWidth / 2;
    const y = yOffset + cellHeight / 2;

    const result = attemptUnitPlacement(x, y, gameState, basicChicken, wallet);

    expect(result).toBe(true);
    expect(wallet.getBalance("exceeds")).toBe(0);
    expect(gameState.units.length).toBe(1);
  });

  test("Currency Logic: attemptUnitPlacement fails without enough exceeds", () => {
    const wallet = new CurrencyWallet({ exceeds: 99, eggs: 0 });
    const gameState: GameState = {
      lastFrameTime: 0,
      frameCount: 0,
      grid: grid,
      units: [],
    };

    const x = xOffset + cellWidth / 2;
    const y = yOffset + cellHeight / 2;

    const result = attemptUnitPlacement(x, y, gameState, basicChicken, wallet);

    expect(result).toBe(false);
    expect(wallet.getBalance("exceeds")).toBe(99);
    expect(gameState.units.length).toBe(0);
  });

  test("Unit Placement Logic: attemptUnitPlacement ignores plain cell clicks without a dragged chicken", () => {
    const gameState: GameState = {
      lastFrameTime: 0,
      frameCount: 0,
      grid: grid,
      units: [],
    };

    const x = xOffset + cellWidth / 2;
    const y = yOffset + cellHeight / 2;

    const result = attemptUnitPlacement(x, y, gameState);

    expect(result).toBe(false);
    expect(gameState.units.length).toBe(0);
  });

  test("Unit Placement Logic: attemptUnitPlacement failure on occupied cell", () => {
    const gameState: GameState = {
      lastFrameTime: 0,
      frameCount: 0,
      grid: grid,
      units: [{
        lane: 1,
        cell: 1,
        getLane: () => 1,
        getCell: () => 1,
        getType: () => "chicken" as const,
      } as any],
    };

    const x = xOffset + cellWidth + cellWidth / 2;
    const y = yOffset + cellHeight + cellHeight / 2;

    const result = attemptUnitPlacement(x, y, gameState, basicChicken);
    
    expect(result).toBe(false);
    expect(gameState.units.length).toBe(1); // Length should not increase
  });

  test("Unit Placement Logic: attemptUnitPlacement failure on off-grid coordinates", () => {
    const gameState: GameState = {
      lastFrameTime: 0,
      frameCount: 0,
      grid: grid,
      units: [],
    };

    const result = attemptUnitPlacement(0, 0, gameState, basicChicken); // Outside the 40px offset
    
    expect(result).toBe(false);
    expect(gameState.units.length).toBe(0);
  });

  test("Lane Clear Logic: end-of-lane kinser triggers an armed lane clear before game over", () => {
    const gameState = createInitialGameState({
      width: 800,
      height: 400,
    } as HTMLCanvasElement);
    gameState.units.push(
      new Kinser({ ...KINSER_CONFIGS.basic, lane: 0, cell: 0 }),
    );

    const shouldEndGame = resolveEndOfLaneKinsers(gameState);

    expect(shouldEndGame).toBe(false);
    expect(gameState.laneClears[0].armed).toBe(false);
    expect(gameState.activeLaneClears).toEqual([
      expect.objectContaining({ lane: 0 }),
    ]);
  });

  test("Lane Clear Logic: end-of-lane kinser ends the game when no lane clear remains", () => {
    const gameState = createInitialGameState({
      width: 800,
      height: 400,
    } as HTMLCanvasElement);
    gameState.laneClears[0].armed = false;
    gameState.units.push(
      new Kinser({ ...KINSER_CONFIGS.basic, lane: 0, cell: 0 }),
    );

    expect(resolveEndOfLaneKinsers(gameState)).toBe(true);
  });

  test("Lane Clear Logic: active lane clear prevents game over while it crosses the lane", () => {
    const gameState = createInitialGameState({
      width: 800,
      height: 400,
    } as HTMLCanvasElement);
    gameState.laneClears[0].armed = false;
    gameState.activeLaneClears.push({ lane: 0, x: 100, speed: 8 });
    gameState.units.push(
      new Kinser({ ...KINSER_CONFIGS.basic, lane: 0, cell: 0 }),
    );

    expect(resolveEndOfLaneKinsers(gameState)).toBe(false);
  });
});
