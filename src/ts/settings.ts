interface GameSettings {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  chickenVolume: number;
  robotVolume: number;
  unitPlaceKey: string;
  fastForwardKey: string;
  backgroundImage: string;
}

const SETTINGS_STORAGE_KEY = "chickens-vs-kinser-settings";

const DEFAULT_SETTINGS: GameSettings = {
  musicEnabled: true,
  soundEffectsEnabled: true,
  chickenVolume: 80,
  robotVolume: 70,
  unitPlaceKey: "Space",
  fastForwardKey: "F",
  backgroundImage: "",
};

export function readStoredSettings(): GameSettings {
  const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!storedSettings) {
    return DEFAULT_SETTINGS;
  }

  try {
    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(storedSettings) as Partial<GameSettings>),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function getControl<T extends HTMLElement>(
  root: ParentNode,
  selector: string,
): T | null {
  return root.querySelector(selector) as T | null;
}

function updateVolumeLabel(
  root: ParentNode,
  inputId: string,
  outputId: string,
): void {
  const input = getControl<HTMLInputElement>(root, `#${inputId}`);
  const output = getControl<HTMLOutputElement>(root, `#${outputId}`);

  if (!input || !output) {
    return;
  }

  output.value = `${input.value}%`;
  output.textContent = `${input.value}%`;
}

function populateSettingsForm(root: ParentNode, settings: GameSettings): void {
  const musicToggle = getControl<HTMLInputElement>(root, "#music-toggle");
  const sfxToggle = getControl<HTMLInputElement>(root, "#sfx-toggle");
  const chickenVolume = getControl<HTMLInputElement>(root, "#chicken-volume");
  const robotVolume = getControl<HTMLInputElement>(root, "#robot-volume");
  const unitPlaceKey = getControl<HTMLInputElement>(root, "#unit-place-key");
  const fastForwardKey = getControl<HTMLInputElement>(root, "#fast-forward-key");
  const backgroundImage = getControl<HTMLInputElement>(root, "#background-image");

  if (
    !musicToggle ||
    !sfxToggle ||
    !chickenVolume ||
    !robotVolume ||
    !unitPlaceKey ||
    !fastForwardKey ||
    !backgroundImage
  ) {
    return;
  }

  musicToggle.checked = settings.musicEnabled;
  sfxToggle.checked = settings.soundEffectsEnabled;
  chickenVolume.value = String(settings.chickenVolume);
  robotVolume.value = String(settings.robotVolume);
  unitPlaceKey.value = settings.unitPlaceKey;
  fastForwardKey.value = settings.fastForwardKey;
  backgroundImage.value = settings.backgroundImage;

  updateVolumeLabel(root, "chicken-volume", "chicken-volume-value");
  updateVolumeLabel(root, "robot-volume", "robot-volume-value");
}

function collectSettings(root: ParentNode): GameSettings {
  const musicToggle = getControl<HTMLInputElement>(root, "#music-toggle");
  const sfxToggle = getControl<HTMLInputElement>(root, "#sfx-toggle");
  const chickenVolume = getControl<HTMLInputElement>(root, "#chicken-volume");
  const robotVolume = getControl<HTMLInputElement>(root, "#robot-volume");
  const unitPlaceKey = getControl<HTMLInputElement>(root, "#unit-place-key");
  const fastForwardKey = getControl<HTMLInputElement>(root, "#fast-forward-key");
  const backgroundImage = getControl<HTMLInputElement>(root, "#background-image");

  return {
    musicEnabled: musicToggle?.checked ?? DEFAULT_SETTINGS.musicEnabled,
    soundEffectsEnabled:
      sfxToggle?.checked ?? DEFAULT_SETTINGS.soundEffectsEnabled,
    chickenVolume: Number(chickenVolume?.value ?? DEFAULT_SETTINGS.chickenVolume),
    robotVolume: Number(robotVolume?.value ?? DEFAULT_SETTINGS.robotVolume),
    unitPlaceKey:
      unitPlaceKey?.value.trim() || DEFAULT_SETTINGS.unitPlaceKey,
    fastForwardKey:
      fastForwardKey?.value.trim() || DEFAULT_SETTINGS.fastForwardKey,
    backgroundImage: backgroundImage?.value.trim() ?? "",
  };
}

function saveSettings(root: ParentNode): void {
  const nextSettings = collectSettings(root);

  window.localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(nextSettings),
  );
}

export function createSettingsFormElement(options: {
  backLabel: string;
  onBack: () => void;
}): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "menu-content settings-content in-game-settings-content";

  wrapper.innerHTML = `
    <div class="settings-scroll-area">
      <p class="eyebrow">Options</p>
      <h2 class="settings-popup-title">Settings</h2>
      <p class="subtitle">Adjust audio, keybinds, and the background image.</p>

      <form id="settings-form" class="settings-layout">
        <section class="settings-panel" aria-labelledby="audio-settings-heading">
          <h3 id="audio-settings-heading">Audio</h3>

          <label class="setting-row" for="music-toggle">
            <span>Music</span>
            <input id="music-toggle" name="musicEnabled" type="checkbox" />
          </label>

          <label class="setting-row" for="sfx-toggle">
            <span>Sound Effects</span>
            <input id="sfx-toggle" name="soundEffectsEnabled" type="checkbox" />
          </label>

          <label class="setting-stack" for="chicken-volume">
            <span>Chicken Volume</span>
            <div class="range-row">
              <input id="chicken-volume" name="chickenVolume" type="range" min="0" max="100" value="80" />
              <output for="chicken-volume" id="chicken-volume-value">80%</output>
            </div>
          </label>

          <label class="setting-stack" for="robot-volume">
            <span>Robot Volume</span>
            <div class="range-row">
              <input id="robot-volume" name="robotVolume" type="range" min="0" max="100" value="70" />
              <output for="robot-volume" id="robot-volume-value">70%</output>
            </div>
          </label>
        </section>

        <section class="settings-panel" aria-labelledby="gameplay-settings-heading">
          <h3 id="gameplay-settings-heading">Gameplay</h3>

          <label class="setting-stack" for="unit-place-key">
            <span>Spacebar for Unit Placing</span>
            <input id="unit-place-key" name="unitPlaceKey" type="text" value="Space" />
          </label>

          <label class="setting-stack" for="fast-forward-key">
            <span>Fastforward Keybind</span>
            <input id="fast-forward-key" name="fastForwardKey" type="text" maxlength="12" value="F" />
          </label>

          <label class="setting-stack" for="background-image">
            <span>Background Image</span>
            <input id="background-image" name="backgroundImage" type="text" placeholder="backgrounds/farm.png" />
          </label>
        </section>
      </form>
    </div>

    <div class="settings-actions">
      <button id="save-settings-btn" class="menu-button primary" type="button">Save Settings</button>
      <button id="close-settings-btn" class="menu-button secondary" type="button"></button>
    </div>
  `;

  const backButton = getControl<HTMLButtonElement>(wrapper, "#close-settings-btn");
  if (backButton) {
    backButton.textContent = options.backLabel;
    backButton.addEventListener("click", options.onBack);
  }

  return wrapper;
}

export function initSettingsControls(root: ParentNode = document): void {
  populateSettingsForm(root, readStoredSettings());

  const saveSettingsButton = getControl<HTMLButtonElement>(
    root,
    "#save-settings-btn",
  );
  const chickenVolume = getControl<HTMLInputElement>(root, "#chicken-volume");
  const robotVolume = getControl<HTMLInputElement>(root, "#robot-volume");

  chickenVolume?.addEventListener("input", () => {
    updateVolumeLabel(root, "chicken-volume", "chicken-volume-value");
  });

  robotVolume?.addEventListener("input", () => {
    updateVolumeLabel(root, "robot-volume", "robot-volume-value");
  });

  saveSettingsButton?.addEventListener("click", () => {
    saveSettings(root);
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initSettingsControls(document);
  });
}
