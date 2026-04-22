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

test("placing a chicken requires dragging it from the shop onto an open grid cell", async ({
  page,
}) => {
  const placementLogs: string[] = [];

  page.on("console", (message) => {
    if (message.text().startsWith("Placed:")) {
      placementLogs.push(message.text());
    }
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();

  const canvas = page.locator("#game-canvas");
  await expect(canvas).toBeVisible();
  await expect(page.locator("#currency span")).toHaveText("100");

  const canvasBox = await canvas.boundingBox();
  expect(canvasBox).not.toBeNull();

  const targetCell = {
    x: canvasBox!.x + 150,
    y: canvasBox!.y + 200,
  };

  await page.mouse.click(targetCell.x, targetCell.y);
  expect(placementLogs).toEqual([]);

  const chickenCard = page.locator(".card", { hasText: "Basic Chicken" });
  await expect(chickenCard).toBeVisible();

  const cardBox = await chickenCard.boundingBox();
  expect(cardBox).not.toBeNull();

  await page.mouse.move(
    cardBox!.x + cardBox!.width / 2,
    cardBox!.y + cardBox!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(targetCell.x, targetCell.y);
  await page.mouse.up();

  await expect.poll(() => placementLogs).toEqual(["Placed: Basic Chicken"]);
  await expect(page.locator("#currency span")).toHaveText("0");
});

test("clicking a gameplay exceeds drop adds to the currency counter", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();

  const canvas = page.locator("#game-canvas");
  await expect(canvas).toBeVisible();
  await expect(page.locator("#currency span")).toHaveText("100");

  const canvasBox = await canvas.boundingBox();
  expect(canvasBox).not.toBeNull();

  await page.mouse.click(canvasBox!.x + 750, canvasBox!.y + 350);

  await expect(page.locator("#currency span")).toHaveText("125");
});

test("pause menu can unpause, restart with confirmation, and return to main menu", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();

  const canvas = page.locator("#game-canvas");
  await expect(canvas).toBeVisible();

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("heading", { name: "Game Paused" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Unpause game" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Back to main menu" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restart game" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Settings" })).toBeVisible();

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.locator("#chicken-volume").fill("35");
  await page.getByRole("button", { name: "Save Settings" }).click();

  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(
          window.localStorage.getItem("chickens-vs-kinser-settings") ?? "{}",
        ),
      ),
    )
    .toMatchObject({ chickenVolume: 35 });

  await page.getByRole("button", { name: "Back to Pause Menu" }).click();
  await expect(page.getByRole("heading", { name: "Game Paused" })).toBeVisible();

  await page.getByRole("button", { name: "Unpause game" }).click();
  await expect(page.getByRole("heading", { name: "Game Paused" })).toBeHidden();

  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: "Restart game" }).click();
  await expect(page.getByRole("heading", { name: "Restart game?" })).toBeVisible();

  await page.getByRole("button", { name: "No, go back" }).click();
  await expect(page.getByRole("heading", { name: "Game Paused" })).toBeVisible();

  await page.getByRole("button", { name: "Restart game" }).click();
  await page.getByRole("button", { name: "Yes, restart" }).click();
  await expect(page.getByRole("heading", { name: "Restart game?" })).toBeHidden();
  await expect(page.locator("#currency span")).toHaveText("100");

  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: "Back to main menu" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("robot reaching the end uses the armed lane clear before game over", async ({
  page,
}) => {
  test.setTimeout(15000);

  await page.goto("/");
  await page.getByRole("button", { name: "Start Game" }).click();

  await expect(page.getByRole("heading", { name: "Game Over" })).toBeHidden();
  await page.waitForTimeout(11000);
  await expect(page.getByRole("heading", { name: "Game Over" })).toBeHidden();

  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: "Back to main menu" }).click();
  await expect(page).toHaveURL(/\/$/);
});
