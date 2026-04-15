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

function readStoredSettings(): GameSettings {
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

function updateVolumeLabel(inputId: string, outputId: string): void {
  const input = document.getElementById(inputId) as HTMLInputElement | null;
  const output = document.getElementById(outputId) as HTMLOutputElement | null;

  if (!input || !output) {
    return;
  }

  output.value = `${input.value}%`;
  output.textContent = `${input.value}%`;
}

function populateSettingsForm(settings: GameSettings): void {
  const musicToggle = document.getElementById("music-toggle") as HTMLInputElement;
  const sfxToggle = document.getElementById("sfx-toggle") as HTMLInputElement;
  const chickenVolume = document.getElementById("chicken-volume") as HTMLInputElement;
  const robotVolume = document.getElementById("robot-volume") as HTMLInputElement;
  const unitPlaceKey = document.getElementById("unit-place-key") as HTMLInputElement;
  const fastForwardKey = document.getElementById("fast-forward-key") as HTMLInputElement;
  const backgroundImage = document.getElementById("background-image") as HTMLInputElement;

  musicToggle.checked = settings.musicEnabled;
  sfxToggle.checked = settings.soundEffectsEnabled;
  chickenVolume.value = String(settings.chickenVolume);
  robotVolume.value = String(settings.robotVolume);
  unitPlaceKey.value = settings.unitPlaceKey;
  fastForwardKey.value = settings.fastForwardKey;
  backgroundImage.value = settings.backgroundImage;

  updateVolumeLabel("chicken-volume", "chicken-volume-value");
  updateVolumeLabel("robot-volume", "robot-volume-value");
}

function collectSettings(): GameSettings {
  const musicToggle = document.getElementById("music-toggle") as HTMLInputElement;
  const sfxToggle = document.getElementById("sfx-toggle") as HTMLInputElement;
  const chickenVolume = document.getElementById("chicken-volume") as HTMLInputElement;
  const robotVolume = document.getElementById("robot-volume") as HTMLInputElement;
  const unitPlaceKey = document.getElementById("unit-place-key") as HTMLInputElement;
  const fastForwardKey = document.getElementById("fast-forward-key") as HTMLInputElement;
  const backgroundImage = document.getElementById("background-image") as HTMLInputElement;

  return {
    musicEnabled: musicToggle.checked,
    soundEffectsEnabled: sfxToggle.checked,
    chickenVolume: Number(chickenVolume.value),
    robotVolume: Number(robotVolume.value),
    unitPlaceKey: unitPlaceKey.value.trim() || DEFAULT_SETTINGS.unitPlaceKey,
    fastForwardKey: fastForwardKey.value.trim() || DEFAULT_SETTINGS.fastForwardKey,
    backgroundImage: backgroundImage.value.trim(),
  };
}

function saveSettings(): void {
  const nextSettings = collectSettings();

  window.localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(nextSettings),
  );
}

function initSettingsPage(): void {
  populateSettingsForm(readStoredSettings());

  const saveSettingsButton = document.getElementById("save-settings-btn");
  const chickenVolume = document.getElementById("chicken-volume");
  const robotVolume = document.getElementById("robot-volume");

  chickenVolume?.addEventListener("input", () => {
    updateVolumeLabel("chicken-volume", "chicken-volume-value");
  });

  robotVolume?.addEventListener("input", () => {
    updateVolumeLabel("robot-volume", "robot-volume-value");
  });

  saveSettingsButton?.addEventListener("click", () => {
    saveSettings();
  });
}

window.addEventListener("DOMContentLoaded", initSettingsPage);
