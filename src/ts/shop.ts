import {
  DRAG_STATE_CHANGE_EVENT,
  dragState,
  notifyDragStateChanged,
} from "./dragState.js";
import type { CurrencyWallet } from "./currency.js";

const CHICKEN_NET_IMAGE = "./assets/chickenNet.png";

// =========================
// TYPES
// =========================

export type Chicken = {
  id: string;
  name: string;
  cost: number;
  image: string;
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
  },
  {
    id: "exceeds",
    name: "Exceeds Chicken",
    cost: 50,
    image: "./assets/exceedschicken.png",
  },
  {
    id: "tank",
    name: "Tank Chicken",
    cost: 75,
    image: "./assets/tankchicken.png",
  },
];

// =========================
// SHOP CLASS
// =========================

export class Shop {
  private currencyWallet: CurrencyWallet;
  private currencyText!: HTMLSpanElement;
  private shopContainer!: HTMLDivElement;
  private netButton!: HTMLButtonElement;
  private chickenCards: { card: HTMLDivElement; chicken: Chicken }[] = [];

  constructor(currencyWallet: CurrencyWallet) {
    this.currencyWallet = currencyWallet;
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
    this.chickenCards.forEach(({ card, chicken }) => {
      const canAfford = this.currencyWallet.canAfford("exceeds", chicken.cost);
      card.classList.toggle("disabled", !canAfford);
      card.setAttribute("aria-disabled", `${!canAfford}`);
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

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = chicken.name;

    const cost = document.createElement("div");
    cost.className = "cost";
    cost.textContent = `${chicken.cost}`;

    /**
     * DRAG START (PvZ-style pickup)
     * This does NOT place the unit yet - only signals game loop.
     */
    card.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
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
    card.appendChild(img);
    card.appendChild(name);

    this.chickenCards.push({ card, chicken });

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
