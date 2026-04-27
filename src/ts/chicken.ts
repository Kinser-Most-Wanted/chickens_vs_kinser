import { Unit, type UnitConfig } from "./unit.js";
import type { GameState, Projectile, ExceedsDrop } from "./types.js";

/**
 * Chicken unit — a defender.
 * Stationary within its lane/cell.
 * Behavior depends on type: basic shoots, exceeds generates credits, tank is defensive.
 */
export class Chicken extends Unit {
  private lastAttackTime: number = 0;
  private attackCooldown: number = 500; // milliseconds between attacks
  private lastExceedsSpawnTime: number = 0;
  private exceedsSpawnCooldown: number = 5000; // 5 seconds for exceeds chicken

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
   * Chickens behave differently based on type.
   * Basic: shoots projectiles at kinsers.
   * Exceeds: spawns exceeds drops for collection.
   * Tank: does nothing (defensive only).
   */
  public attack(gameState: GameState): void {
    const now = gameState.simulationTime;

    if (this.id === "basic-chicken") {
      // Basic chicken shoots projectiles
      if (now - this.lastAttackTime < this.attackCooldown) {
        return;
      }

      // Find all kinsers in the same lane
      for (const unit of gameState.units) {
        if (unit.getType() === "kinser" && unit.getLane() === this.lane) {
          const startPos = gameState.grid?.getPixelCoordinates(this.lane, this.cell);
          if (!startPos) continue;

          const projectile: Projectile = {
            id: `projectile-${Date.now()}-${Math.random()}`,
            image: "./assets/tempwater.png",
            lane: this.lane,
            x: startPos.pixelX + 40,
            y: startPos.pixelY,
            speed: 2,
            damage: this.damage,
          };
          gameState.projectiles.push(projectile);
          this.lastAttackTime = now;
          break;
        }
      }
    } else if (this.id === "exceeds-chicken") {
      // Exceeds chicken spawns credit drops
      if (now - this.lastExceedsSpawnTime < this.exceedsSpawnCooldown) {
        return;
      }

      const startPos = gameState.grid?.getPixelCoordinates(this.lane, this.cell);
      if (!startPos) return;

      const exceedsDrop: ExceedsDrop = {
        id: `exceeds-${Date.now()}-${Math.random()}`,
        pixelX: startPos.pixelX + Math.random() * 80 - 40, // random around chicken
        pixelY: startPos.pixelY + Math.random() * 80 - 40,
        amount: 50, // buffed amount
        radius: 30,
      };

      if (!gameState.exceedsDrops) {
        gameState.exceedsDrops = [];
      }
      gameState.exceedsDrops.push(exceedsDrop);
      this.lastExceedsSpawnTime = now;
    }
    // Tank chicken does nothing in attack
  }

  public getType(): "chicken" {
    return "chicken";
  }
}
