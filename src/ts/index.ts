function initGame(): void {
  const canvas = document.getElementById(
    "gameCanvas",
  ) as HTMLCanvasElement | null;

  if (!canvas) {
    console.error("Game canvas element not found.");
    return;
  }

  const renderingContext = canvas.getContext("2d");

  if (!renderingContext) {
    console.error("Failed to get 2D rendering context.");
    return;
  }

  renderingContext.fillStyle = "#111111";
  renderingContext.fillRect(0, 0, canvas.width, canvas.height);

  renderingContext.fillStyle = "#ffffff";
  renderingContext.font = "24px Arial";
  renderingContext.fillText("Game canvas loaded", 20, 40);
}

window.addEventListener("DOMContentLoaded", initGame);
