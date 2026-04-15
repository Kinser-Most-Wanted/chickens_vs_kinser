function navigateToPage(path: string): void {
  window.location.href = path;
}

function initMainMenu(): void {
  const startGameButton = document.getElementById("start-game-btn");
  const settingsButton = document.getElementById("settings-btn");

  startGameButton?.addEventListener("click", () => {
    navigateToPage("./game.html");
  });

  settingsButton?.addEventListener("click", () => {
    navigateToPage("./settings.html");
  });
}

window.addEventListener("DOMContentLoaded", initMainMenu);
