import { expect, test } from "@playwright/test";
import { CurrencyWallet } from "../src/ts/currency";

test("currency wallet tracks multiple currency types", () => {
  const wallet = new CurrencyWallet({ exceeds: 10, eggs: 2 });

  expect(wallet.getBalance("exceeds")).toBe(10);
  expect(wallet.getBalance("eggs")).toBe(2);

  expect(wallet.add("exceeds", 15)).toBe(true);
  expect(wallet.add("eggs", 3)).toBe(true);

  expect(wallet.getBalances()).toEqual({ exceeds: 25, eggs: 5 });
});

test("currency wallet spends only when enough balance exists", () => {
  const wallet = new CurrencyWallet({ exceeds: 50, eggs: 0 });

  expect(wallet.spend("exceeds", 30)).toBe(true);
  expect(wallet.getBalance("exceeds")).toBe(20);

  expect(wallet.spend("exceeds", 25)).toBe(false);
  expect(wallet.getBalance("exceeds")).toBe(20);
});

test("currency wallet can be serialized for a future whole-game save", () => {
  const firstWallet = new CurrencyWallet({ exceeds: 100, eggs: 0 });

  firstWallet.add("exceeds", 20);
  firstWallet.add("eggs", 4);
  firstWallet.spend("exceeds", 50);

  const savedBalances = firstWallet.getBalances();
  const loadedWallet = new CurrencyWallet(savedBalances);

  expect(loadedWallet.getBalances()).toEqual({ exceeds: 70, eggs: 4 });
});
