import { Unit, type UnitConfig } from "./unit.js";
import type { GameState } from "./types.js";

/**
 * Kinser unit — an attacker.
 * Moves rightward across the grid (toward the goal).
 * Attacks chickens that block its path.
 */
export class Kinser extends Unit {
  private lastAttackTime: number = 0;
  private attackCooldown: number = 500; // milliseconds between attacks
  private lastMoveTime: number = 0;

  constructor(config: UnitConfig) {
    super(config);
  }

  /**
   * Kinsers move rightward each frame (toward higher cell indices).
   * Movement is throttled by speed.
   */
  public update(gameState: GameState): void {
    const now = gameState.simulationTime;
    const moveInterval = 1000 / this.speed; // speed is cells per second

    if (now - this.lastMoveTime > moveInterval) {
      const nextCell = this.cell - 1;

      // Check if next cell is valid
      if (nextCell >= 0) {
        // Assuming 9 cells max (from GridLanes)
        // Check if the path is blocked by a chicken
        const isBlocked = gameState.units.some(
          (unit) =>
            unit.getType() === "chicken" &&
            unit.getLane() === this.lane &&
            unit.getCell() === nextCell,
        );

        if (!isBlocked) {
          this.cell = nextCell;
          this.lastMoveTime = now;
        }
      }
    }
  }

  /**
   * Kinsers attack chickens blocking their path in the same lane.
   * TEMP: Disabled for now
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public attack(_gameState: GameState): void {
    // TEMP: Attacks disabled
    /*
    const now = _gameState.simulationTime;

    // Check if enough time has passed since last attack
    if (now - this.lastAttackTime < this.attackCooldown) {
      return;
    }

    // Find chickens adjacent to or within range
    for (const unit of gameState.units) {
      if (unit.getType() === "chicken" && unit.getLane() === this.lane) {
        const distance = Math.abs(unit.getCell() - this.cell);

        if (distance <= this.attackRange) {
          unit.takeDamage(this.damage);
          this.lastAttackTime = now;
          break; // Attack only one target per frame
        }
      }
    }
    */
  }

  public getType(): "kinser" {
    return "kinser";
  }
}
