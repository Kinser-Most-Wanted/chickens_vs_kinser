import { expect, test } from "@playwright/test";

test("renders the game canvas with a supported size and no startup errors", async ({
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

  const canvas = page.locator("#gameCanvas");
  await expect(canvas).toBeVisible();

  const canvasSize = await canvas.evaluate((element) => {
    const gameCanvas = element as HTMLCanvasElement;

    return {
      width: gameCanvas.width,
      height: gameCanvas.height,
    };
  });

  const supportedSizes = [
    { width: 400, height: 400 },
    { width: 800, height: 400 },
  ];

  const isSupportedSize = supportedSizes.some(
    (supportedSize) =>
      supportedSize.width === canvasSize.width &&
      supportedSize.height === canvasSize.height,
  );

  expect(isSupportedSize).toBe(true);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
