import {
  DRAG_STATE_CHANGE_EVENT,
  dragState,
  notifyDragStateChanged,
} from "./dragState.js";
import type { CurrencyWallet } from "./currency.js";
import type { PlacementCooldowns } from "./placementCooldowns.js";

const CHICKEN_NET_IMAGE = "./assets/chickenNet.png";
const DEFAULT_UNIT_COOLDOWN_MS = 5000;

// =========================
// TYPES
// =========================

export type Chicken = {
  id: string;
  name: string;
  cost: number;
  image: string;
  cooldownMs: number;
};

// =========================
// DATA
// =========================

// !!! ADD MORE CHICKENS HERE !!! (Make sure to add unique IDs and valid image paths)

const chickens: Chicken[] = [
  {
    id: "basic",
    name: "Basic Chicken",
    cost: 100,
    image: "./assets/basicchicken.png",
    cooldownMs: DEFAULT_UNIT_COOLDOWN_MS,
  },
  {
    id: "exceeds",
    name: "Exceeds Chicken",
    cost: 50,
    image: "./assets/exceedschicken.png",
    cooldownMs: DEFAULT_UNIT_COOLDOWN_MS,
  },
  {
    id: "tank",
    name: "Tank Chicken",
    cost: 75,
    image: "./assets/tankchicken.png",
    cooldownMs: DEFAULT_UNIT_COOLDOWN_MS,
  },
];

export const SHOP_CHICKENS = chickens;

// =========================
// SHOP CLASS
// =========================

export class Shop {
  private currencyWallet: CurrencyWallet;
  private placementCooldowns: PlacementCooldowns;
  private currencyText!: HTMLSpanElement;
  private shopContainer!: HTMLDivElement;
  private netButton!: HTMLButtonElement;
  private chickenCards: {
    card: HTMLDivElement;
    chicken: Chicken;
    cooldownOverlay: HTMLDivElement;
    cooldownText: HTMLSpanElement;
  }[] = [];

  constructor(
    currencyWallet: CurrencyWallet,
    placementCooldowns: PlacementCooldowns,
  ) {
    this.currencyWallet = currencyWallet;
    this.placementCooldowns = placementCooldowns;
  }

  init(): void {
    const topBar = document.createElement("div");
    topBar.id = "top-bar";

    const currencyDisplay = document.createElement("div");
    currencyDisplay.id = "currency";

    const currencyImg = document.createElement("img");
    currencyImg.src = "assets/exceeds.png";
    currencyImg.style.width = "40px";

    this.currencyText = document.createElement("span");

    currencyDisplay.appendChild(currencyImg);
    currencyDisplay.appendChild(this.currencyText);

    // =========================
    // SHOP WRAPPER
    // =========================
    const shopWrapper = document.createElement("div");
    shopWrapper.id = "shop-wrapper";

    this.shopContainer = document.createElement("div");
    this.shopContainer.id = "shop";
    this.netButton = this.createNetButton();

    shopWrapper.appendChild(this.netButton);
    shopWrapper.appendChild(this.shopContainer);

    topBar.appendChild(currencyDisplay);
    topBar.appendChild(shopWrapper);

    const uiLayer = document.getElementById("uiLayer");
    uiLayer?.appendChild(topBar);

    this.currencyWallet.subscribe(() => {
      this.updateCurrency();
      this.updateCardAvailability();
    });
    this.placementCooldowns.subscribe(() => {
      this.updateCardAvailability();
    });
    window.addEventListener(DRAG_STATE_CHANGE_EVENT, () => {
      this.updateToolSelection();
    });
    this.renderShop();
    this.updateCardAvailability();
    this.updateToolSelection();
  }

  private updateCurrency(): void {
    this.currencyText.textContent = `${this.currencyWallet.getBalance("exceeds")}`;
  }

  private updateCardAvailability(): void {
    this.chickenCards.forEach(({ card, chicken, cooldownOverlay, cooldownText }) => {
      const canAfford = this.currencyWallet.canAfford("exceeds", chicken.cost);
      const cooldown = this.placementCooldowns.getSnapshot(chicken.id);
      const isDisabled = !canAfford || cooldown.active;

      card.classList.toggle("disabled", isDisabled);
      card.classList.toggle("cooldown-active", cooldown.active);
      card.setAttribute("aria-disabled", `${isDisabled}`);
      card.setAttribute("aria-busy", `${cooldown.active}`);
      cooldownOverlay.style.transform = `scaleY(${cooldown.progress})`;
      cooldownText.textContent = cooldown.active
        ? `${Math.ceil(cooldown.remainingMs / 1000)}s`
        : "";
    });
  }

  private updateToolSelection(): void {
    const netSelected = dragState.activeTool === "net";
    this.netButton.classList.toggle("selected-tool", netSelected);
    this.netButton.setAttribute("aria-pressed", `${netSelected}`);
    this.chickenCards.forEach(({ card }) => {
      card.classList.toggle("selected-tool", dragState.isDragging && !netSelected);
    });
  }

  private getBorderColor(cost: number): string {
    if (cost <= 50) return "#4caf50";
    if (cost <= 75) return "#2196f3";
    return "#f44336";
  }

  private createChickenCard(chicken: Chicken): HTMLDivElement {
    const card = document.createElement("div");
    card.className = "card";

    card.style.border = `3px solid ${this.getBorderColor(chicken.cost)}`;

    const img = document.createElement("img");
    img.src = chicken.image;
    img.alt = "";

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = chicken.name;

    const cost = document.createElement("div");
    cost.className = "cost";
    cost.textContent = `${chicken.cost}`;

    const cooldownOverlay = document.createElement("div");
    cooldownOverlay.className = "cooldown-overlay";
    cooldownOverlay.setAttribute("aria-hidden", "true");

    const cooldownText = document.createElement("span");
    cooldownText.className = "cooldown-text";
    cooldownText.setAttribute("aria-hidden", "true");

    /**
     * DRAG START (PvZ-style pickup)
     * This does NOT place the unit yet - only signals game loop.
     */
    card.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      if (this.placementCooldowns.isOnCooldown(chicken.id)) {
        return;
      }
      if (!this.currencyWallet.canAfford("exceeds", chicken.cost)) {
        console.log(`Not enough exceeds for: ${chicken.name}`);
        return;
      }

      dragState.activeTool = "place";
      dragState.isDragging = true;
      dragState.chicken = chicken;
      dragState.offsetX = 0;
      dragState.offsetY = 0;
      notifyDragStateChanged();

      console.log(`Started dragging: ${chicken.name}`);
    });

    card.appendChild(cost);
    card.appendChild(cooldownOverlay);
    card.appendChild(cooldownText);
    card.appendChild(img);
    card.appendChild(name);

    this.chickenCards.push({ card, chicken, cooldownOverlay, cooldownText });

    return card;
  }

  private createNetButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.id = "net-tool";
    button.className = "tool-card";
    button.type = "button";
    button.setAttribute("aria-label", "Select chicken net");

    const image = document.createElement("img");
    image.src = CHICKEN_NET_IMAGE;
    image.alt = "";
    image.className = "tool-card-image";
    button.appendChild(image);

    button.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;

      event.preventDefault();
      const nextTool = dragState.activeTool === "net" ? "place" : "net";
      dragState.activeTool = nextTool;
      dragState.isDragging = false;
      dragState.chicken = null;
      dragState.offsetX = 0;
      dragState.offsetY = 0;
      notifyDragStateChanged();
    });

    return button;
  }

  private renderShop(): void {
    chickens
      .slice()
      .sort((a, b) => a.cost - b.cost)
      .forEach((chicken) => {
        this.shopContainer.appendChild(this.createChickenCard(chicken));
      });
  }
}
