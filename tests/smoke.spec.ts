import { test, expect } from "@playwright/test";

test("site loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Game" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Settings" })).toBeVisible();
});
