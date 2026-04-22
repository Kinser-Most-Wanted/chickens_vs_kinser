import type { GameLoopControls } from "./gameLoop.js";
import {
  createSettingsFormElement,
  initSettingsControls,
} from "./settings.js";

type MenuMode = "pause" | "gameOver" | "restartConfirm";

interface GameMenuElements {
  overlay: HTMLDivElement;
  title: HTMLHeadingElement;
  message: HTMLParagraphElement;
  actions: HTMLDivElement;
  primaryButton: HTMLButtonElement;
  secondaryButton: HTMLButtonElement;
  tertiaryButton: HTMLButtonElement;
  quaternaryButton: HTMLButtonElement;
}

function createButton(label: string, className: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `game-menu-button ${className}`;
  button.textContent = label;

  return button;
}

function createMenuElements(): GameMenuElements {
  const overlay = document.createElement("div");
  overlay.id = "gameMenuOverlay";
  overlay.className = "game-menu-overlay";
  overlay.hidden = true;

  const dialog = document.createElement("div");
  dialog.className = "game-menu-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "gameMenuTitle");

  const title = document.createElement("h2");
  title.id = "gameMenuTitle";

  const message = document.createElement("p");
  message.className = "game-menu-message";

  const actions = document.createElement("div");
  actions.className = "game-menu-actions";

  const primaryButton = createButton("", "primary");
  const secondaryButton = createButton("", "secondary");
  const tertiaryButton = createButton("", "secondary");
  const quaternaryButton = createButton("", "secondary");

  actions.append(primaryButton, secondaryButton, tertiaryButton, quaternaryButton);
  dialog.append(title, message, actions);
  overlay.appendChild(dialog);

  document.getElementById("gameContainer")?.appendChild(overlay);

  return {
    overlay,
    title,
    message,
    actions,
    primaryButton,
    secondaryButton,
    tertiaryButton,
    quaternaryButton,
  };
}

function createSettingsPopup(onBack: () => void): HTMLDivElement {
  const popup = document.createElement("div");
  popup.id = "settingsPopupOverlay";
  popup.className = "settings-popup-overlay";
  popup.hidden = true;

  const panel = document.createElement("div");
  panel.className = "settings-popup-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "settings-popup-title");

  const settingsView = createSettingsFormElement({
    backLabel: "Back to Pause Menu",
    onBack,
  });
  const title = settingsView.querySelector(".settings-popup-title");
  title?.setAttribute("id", "settings-popup-title");

  panel.appendChild(settingsView);
  popup.appendChild(panel);
  document.body.appendChild(popup);
  initSettingsControls(settingsView);

  return popup;
}

function goToMainMenu(): void {
  window.location.href = "./index.html";
}

export function initGameMenu(controls: GameLoopControls): void {
  const pauseButton = document.getElementById("pauseGameBtn");
  const menu = createMenuElements();
  const settingsPopup = createSettingsPopup(() => {
    settingsPopup.hidden = true;
    showMenu(previousMode);
  });
  let previousMode: MenuMode = "pause";

  const hideMenu = (): void => {
    menu.overlay.hidden = true;
    settingsPopup.hidden = true;
  };

  const showMenu = (mode: MenuMode): void => {
    previousMode = mode === "restartConfirm" ? previousMode : mode;
    menu.overlay.hidden = false;
    menu.tertiaryButton.hidden = false;
    menu.quaternaryButton.hidden = false;

    if (mode === "pause") {
      menu.title.textContent = "Game Paused";
      menu.message.textContent = "Choose what happens next.";
      menu.primaryButton.textContent = "Unpause game";
      menu.secondaryButton.textContent = "Back to main menu";
      menu.tertiaryButton.textContent = "Restart game";
      menu.quaternaryButton.textContent = "Settings";

      menu.primaryButton.onclick = () => {
        controls.resume();
        hideMenu();
      };
      menu.secondaryButton.onclick = goToMainMenu;
      menu.tertiaryButton.onclick = () => showMenu("restartConfirm");
      menu.quaternaryButton.onclick = () => {
        menu.overlay.hidden = true;
        settingsPopup.hidden = false;
      };
      return;
    }

    if (mode === "gameOver") {
      menu.title.textContent = "Game Over";
      menu.message.textContent = "A robot made it to the end of the level.";
      menu.primaryButton.textContent = "Restart game";
      menu.secondaryButton.textContent = "Back to main menu";
      menu.tertiaryButton.hidden = true;
      menu.quaternaryButton.hidden = true;

      menu.primaryButton.onclick = () => showMenu("restartConfirm");
      menu.secondaryButton.onclick = goToMainMenu;
      menu.tertiaryButton.onclick = null;
      menu.quaternaryButton.onclick = null;
      return;
    }

    menu.title.textContent = "Restart game?";
    menu.message.textContent = "Your current run will be reset.";
    menu.primaryButton.textContent = "Yes, restart";
    menu.secondaryButton.textContent = "No, go back";
    menu.tertiaryButton.hidden = true;
    menu.quaternaryButton.hidden = true;

    menu.primaryButton.onclick = () => {
      controls.restart();
      hideMenu();
    };
    menu.secondaryButton.onclick = () => showMenu(previousMode);
    menu.tertiaryButton.onclick = null;
    menu.quaternaryButton.onclick = null;
  };

  pauseButton?.addEventListener("click", () => {
    if (controls.isGameOver()) return;

    controls.pause();
    showMenu("pause");
  });

  window.addEventListener("game:over", () => {
    showMenu("gameOver");
  });
}
