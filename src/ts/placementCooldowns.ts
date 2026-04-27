export interface PlacementCooldownDefinition {
  unitId: string;
  durationMs: number;
}

export interface PlacementCooldownSnapshot {
  unitId: string;
  durationMs: number;
  remainingMs: number;
  progress: number;
  active: boolean;
}

type PlacementCooldownListener = () => void;

export class PlacementCooldowns {
  private currentTimeMs = 0;
  private readonly cooldownDurationsMs = new Map<string, number>();
  private readonly cooldownExpiryMs = new Map<string, number>();
  private listeners: PlacementCooldownListener[] = [];

  constructor(definitions: PlacementCooldownDefinition[]) {
    definitions.forEach(({ unitId, durationMs }) => {
      this.cooldownDurationsMs.set(unitId, durationMs);
    });
  }

  public subscribe(listener: PlacementCooldownListener): () => void {
    this.listeners.push(listener);
    listener();

    return () => {
      this.listeners = this.listeners.filter((item) => item !== listener);
    };
  }

  public setCurrentTime(currentTimeMs: number): void {
    const normalizedTimeMs = Math.max(0, currentTimeMs);
    if (normalizedTimeMs === this.currentTimeMs) {
      return;
    }

    this.currentTimeMs = normalizedTimeMs;
    this.emitChange();
  }

  public reset(): void {
    this.currentTimeMs = 0;
    this.cooldownExpiryMs.clear();
    this.emitChange();
  }

  public getSnapshot(unitId: string): PlacementCooldownSnapshot {
    const durationMs = this.cooldownDurationsMs.get(unitId) ?? 0;
    const expiresAtMs = this.cooldownExpiryMs.get(unitId) ?? 0;
    const remainingMs = Math.max(0, expiresAtMs - this.currentTimeMs);
    const progress = durationMs > 0 ? remainingMs / durationMs : 0;

    return {
      unitId,
      durationMs,
      remainingMs,
      progress,
      active: remainingMs > 0,
    };
  }

  public isOnCooldown(unitId: string): boolean {
    return this.getSnapshot(unitId).active;
  }

  public startCooldown(unitId: string): void {
    const durationMs = this.cooldownDurationsMs.get(unitId) ?? 0;
    if (durationMs <= 0) {
      return;
    }

    this.cooldownExpiryMs.set(unitId, this.currentTimeMs + durationMs);
    this.emitChange();
  }

  public getAllSnapshots(): PlacementCooldownSnapshot[] {
    return Array.from(this.cooldownDurationsMs.keys()).map((unitId) =>
      this.getSnapshot(unitId),
    );
  }

  private emitChange(): void {
    this.listeners.forEach((listener) => listener());
  }
}
