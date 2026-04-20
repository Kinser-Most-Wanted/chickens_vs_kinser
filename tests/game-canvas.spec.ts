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
    x: canvasBox!.x + 80,
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
