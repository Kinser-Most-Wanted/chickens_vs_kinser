export type CurrencyType = "exceeds" | "eggs";

export type CurrencyBalances = Record<CurrencyType, number>;

export type CurrencyListener = (balances: CurrencyBalances) => void;

const DEFAULT_BALANCES: CurrencyBalances = {
  exceeds: 100,
  eggs: 0,
};

function normalizeBalances(
  balances: Partial<Record<string, unknown>>,
  fallback: CurrencyBalances,
): CurrencyBalances {
  return {
    exceeds:
      typeof balances.exceeds === "number" && balances.exceeds >= 0
        ? balances.exceeds
        : fallback.exceeds,
    eggs:
      typeof balances.eggs === "number" && balances.eggs >= 0
        ? balances.eggs
        : fallback.eggs,
  };
}

export class CurrencyWallet {
  private balances: CurrencyBalances;
  private listeners: CurrencyListener[] = [];

  constructor(initialBalances: Partial<CurrencyBalances> = DEFAULT_BALANCES) {
    this.balances = normalizeBalances(initialBalances, DEFAULT_BALANCES);
  }

  public getBalance(type: CurrencyType): number {
    return this.balances[type];
  }

  public getBalances(): CurrencyBalances {
    return { ...this.balances };
  }

  public canAfford(type: CurrencyType, amount: number): boolean {
    return (
      Number.isFinite(amount) && amount >= 0 && this.balances[type] >= amount
    );
  }

  public add(type: CurrencyType, amount: number): boolean {
    if (!Number.isFinite(amount) || amount <= 0) return false;

    this.balances[type] += amount;
    this.emitChange();
    return true;
  }

  public spend(type: CurrencyType, amount: number): boolean {
    if (!this.canAfford(type, amount)) return false;

    this.balances[type] -= amount;
    this.emitChange();
    return true;
  }

  public subscribe(listener: CurrencyListener): () => void {
    this.listeners.push(listener);
    listener(this.getBalances());

    return () => {
      this.listeners = this.listeners.filter((item) => item !== listener);
    };
  }

  private emitChange(): void {
    const balances = this.getBalances();
    this.listeners.forEach((listener) => listener(balances));
  }
}
