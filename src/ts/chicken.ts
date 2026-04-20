import { Unit, type UnitConfig } from "./unit.js";
import type { GameState, Projectile } from "./types.js";

/**
 * Chicken unit — a defender.
 * Stationary within its lane/cell.
 * Attacks kinsers within range each frame.
 */
export class Chicken extends Unit {
  private lastAttackTime: number = 0;
  private attackCooldown: number = 500; // milliseconds between attacks

  constructor(config: UnitConfig) {
    super(config);
  }

  /**
   * Chickens don't move. Override update to be a no-op.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_gameState: GameState): void {
    // Chickens are stationary — nothing to update
  }

  /**
   * Chickens attack nearby kinsers in their lane within attack range.
   * TEMP: Disabled damage, but shoots projectiles when enemy detected
   */
  public attack(gameState: GameState): void {
    const now = performance.now();

    // Check if enough time has passed since last attack
    if (now - this.lastAttackTime < this.attackCooldown) {
      return;
    }

    // Find all kinsers in the same lane
    for (const unit of gameState.units) {
      if (unit.getType() === "kinser" && unit.getLane() === this.lane) {
        // TEMP: Shoot projectile instead of damaging
        const startPos = gameState.grid?.getPixelCoordinates(this.lane, this.cell);
        if (!startPos) continue;

        const projectile: Projectile = {
          id: `projectile-${Date.now()}-${Math.random()}`,
          image: "./assets/tempwater.png",
          lane: this.lane,
          x: startPos.pixelX + 40, // Start slightly to the right of chicken
          y: startPos.pixelY,
          speed: 2, // pixels per frame - slowed down
          damage: this.damage,
        };
        gameState.projectiles.push(projectile);
        this.lastAttackTime = now;
        break; // Shoot at first detected enemy
      }
    }
  }

  public getType(): "chicken" {
    return "chicken";
  }
}
