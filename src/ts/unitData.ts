import type { UnitConfig } from "./unit.js";

/**
 * Predefined unit configurations for spawn/creation.
 * Enemies (Kinsers) and defenders (Chickens) can be instantiated from these configs.
 */

export const KINSER_CONFIGS: Record<string, UnitConfig> = {
  basic: {
    id: "basic-kinser",
    name: "Basic Kinser",
    health: 30,
    maxHealth: 30,
    damage: 5,
    attackRange: 1,
    speed: 1, // cells per second
    lane: 0,
    cell: 0,
    image: "./assets/robot.png",
  },
};

export const CHICKEN_CONFIGS: Record<string, UnitConfig> = {
  basic: {
    id: "basic-chicken",
    name: "Basic Chicken",
    health: 50,
    maxHealth: 50,
    damage: 10,
    attackRange: 2,
    speed: 0, // stationary
    lane: 0,
    cell: 0,
    image: "./assets/basicchicken.png",
  },
  exceeds: {
    id: "exceeds-chicken",
    name: "Exceeds Chicken",
    health: 40,
    maxHealth: 40,
    damage: 8,
    attackRange: 1,
    speed: 0,
    lane: 0,
    cell: 0,
    image: "./assets/exceedschicken.png",
  },
  tank: {
    id: "tank-chicken",
    name: "Tank Chicken",
    health: 100,
    maxHealth: 100,
    damage: 5,
    attackRange: 1,
    speed: 0,
    lane: 0,
    cell: 0,
    image: "./assets/tankchicken.png",
  },
};
