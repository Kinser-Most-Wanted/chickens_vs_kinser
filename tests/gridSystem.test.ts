import { test, expect } from "@playwright/test";
import { GridLanes } from "../src/ts/GridLanesCLass";
import { attemptUnitPlacement } from "../src/ts/gameLoop";
import type { GameState, CanvasDimensions } from "../src/ts/types";

test.describe("Grid System Logic", () => {
  const dimensions: CanvasDimensions = { width: 800, height: 600 };
  const lanes = 5;
  const cells = 9;
  const grid = new GridLanes(lanes, cells, dimensions);

  // Constants from GridLanesCLass.ts
  const cellWidth = 80;
  const cellHeight = 100;
  const totalGridWidth = cells * cellWidth; // 720
  const totalGridHeight = lanes * cellHeight; // 500
  const xOffset = (dimensions.width - totalGridWidth) / 2; // (800 - 720) / 2 = 40
  const yOffset = (dimensions.height - totalGridHeight) / 2; // (600 - 500) / 2 = 50

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

    const result = attemptUnitPlacement(x, y, gameState);
    
    expect(result).toBe(true);
    expect(gameState.units.length).toBe(1);
    expect(gameState.units[0]).toEqual({
      lane: 0,
      cell: 0,
      type: "chicken",
    });
  });

  test("Unit Placement Logic: attemptUnitPlacement failure on occupied cell", () => {
    const gameState: GameState = {
      lastFrameTime: 0,
      frameCount: 0,
      grid: grid,
      units: [{ lane: 1, cell: 1, type: "chicken" }],
    };

    const x = xOffset + cellWidth + cellWidth / 2;
    const y = yOffset + cellHeight + cellHeight / 2;

    const result = attemptUnitPlacement(x, y, gameState);
    
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

    const result = attemptUnitPlacement(0, 0, gameState); // Outside the 40px offset
    
    expect(result).toBe(false);
    expect(gameState.units.length).toBe(0);
  });
});