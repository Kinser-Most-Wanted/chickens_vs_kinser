import { expect, test } from "@playwright/test";

test("start game opens the game page and renders the landscape canvas with no startup errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();

  await expect(page).toHaveURL(/game$/);

  const canvas = page.locator("#game-canvas");
  await expect(canvas).toBeVisible();

  const canvasSize = await canvas.evaluate((element) => {
    const gameCanvas = element as HTMLCanvasElement;

    return {
      width: gameCanvas.width,
      height: gameCanvas.height,
    };
  });

  expect(canvasSize).toEqual({ width: 800, height: 400 });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
