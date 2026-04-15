import { expect, test } from "@playwright/test";

test("settings button opens the settings page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Settings" }).click();

  await expect(page).toHaveURL(/settings$/);
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Main Menu" })).toBeVisible();
});
