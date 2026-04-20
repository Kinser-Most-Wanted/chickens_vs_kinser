import type { GameState } from "./types.js";

/**
 * Unit configuration passed at instantiation.
 * Stats are data-driven from the shop or game config.
 */
export interface UnitConfig {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  attackRange: number;
  speed: number;
  lane: number;
  cell: number;
  image: string;
}

/**
 * Base Unit class for all playable entities (defenders, attackers).
 * Handles common state: position, health, damage.
 * Subclasses override update() and attack() for specific behavior.
 */
export abstract class Unit {
  protected id: string;
  protected name: string;
  protected health: number;
  protected maxHealth: number;
  protected damage: number;
  protected attackRange: number;
  protected speed: number;
  public lane: number;
  public cell: number;
  protected image: string;

  constructor(config: UnitConfig) {
    this.id = config.id;
    this.name = config.name;
    this.health = config.health;
    this.maxHealth = config.maxHealth;
    this.damage = config.damage;
    this.attackRange = config.attackRange;
    this.speed = config.speed;
    this.lane = config.lane;
    this.image = config.image;
    this.cell = config.cell;
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getDamage(): number {
    return this.damage;
  }

  public getAttackRange(): number {
    return this.attackRange;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public getLane(): number {
    return this.lane;
  }

  public getCell(): number {
    return this.cell;
  }

  public isAlive(): boolean {
    return this.health > 0;
  }

  // Setters
  public setHealth(health: number): void {
    this.health = Math.max(0, Math.min(health, this.maxHealth));
  }

  public takeDamage(amount: number): void {
    this.setHealth(this.health - amount);
  }

  public setPosition(lane: number, cell: number): void {
    this.lane = lane;
    this.cell = cell;
  }

  /**
   * Called each frame to update unit state (movement, timers, etc).
   * Subclasses override for specific behavior.
   * @param gameState The current game state.
   */
  public abstract update(gameState: GameState): void;

  /**
   * Called after all units have updated to resolve attacks.
   * Subclasses override for specific behavior.
   * @param gameState The current game state.
   */
  public abstract attack(gameState: GameState): void;

  public getImage(): string {
    return this.image;
  }

  /**
   * Returns the unit type for identification.
   */
  public abstract getType(): "chicken" | "kinser";
}
