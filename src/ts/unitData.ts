import type { UnitConfig } from "./unit.js";
import type { WaveConfig } from "./types.js";

/**
 * Predefined unit configurations for spawn/creation.
 * Enemies (Kinsers) and defenders (Chickens) can be instantiated from these configs.
 */

export const KINSER_CONFIGS: Record<string, UnitConfig> = {
  basic: {
    id: "basic-kinser",
    name: "Basic Kinser",
    health: 40,
    maxHealth: 40,
    damage: 8,
    attackRange: 1,
    speed: 1.2, // cells per second
    lane: 0,
    cell: 0,
    image: "./assets/robot.png",
  },
  tank: {
    id: "tank-kinser",
    name: "Tank Kinser",
    health: 150,
    maxHealth: 150,
    damage: 6,
    attackRange: 1,
    speed: 0.4, // slower
    lane: 0,
    cell: 0,
    image: "./assets/heavyRobot2.png", // maybe different image later
  },
};

export const CHICKEN_CONFIGS: Record<string, UnitConfig> = {
  basic: {
    id: "basic-chicken",
    name: "Basic Chicken",
    health: 60,
    maxHealth: 60,
    damage: 15,
    attackRange: 3,
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
    damage: 0, // doesn't attack
    attackRange: 0,
    speed: 0,
    lane: 0,
    cell: 0,
    image: "./assets/exceedschicken.png",
  },
  tank: {
    id: "tank-chicken",
    name: "Tank Chicken",
    health: 150,
    maxHealth: 150,
    damage: 0, // doesn't attack
    attackRange: 0,
    speed: 0,
    lane: 0,
    cell: 0,
    image: "./assets/tankchicken.png",
  },
};

export const WAVE_CONFIGS: WaveConfig[] = [
  {
    waveNumber: 1,
    enemyCount: 5,
    enemyType: "basic",
    spawnInterval: 2000, // 2 seconds
    delayBeforeNextWave: 5000, // 5 seconds
  },
  {
    waveNumber: 2,
    enemyCount: 8,
    enemyType: "basic",
    spawnInterval: 1500,
    delayBeforeNextWave: 5000,
  },
  {
    waveNumber: 3,
    enemyCount: 6,
    enemyType: "tank",
    spawnInterval: 2500,
    delayBeforeNextWave: 10000, // longer break
  },
];
