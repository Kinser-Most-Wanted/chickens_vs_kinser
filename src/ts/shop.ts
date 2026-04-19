import { dragState } from "./dragState.js";
import type { CurrencyWallet } from "./currency.js";

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

    shopWrapper.appendChild(this.shopContainer);

    topBar.appendChild(currencyDisplay);
    topBar.appendChild(shopWrapper);

    const uiLayer = document.getElementById("uiLayer");
    uiLayer?.appendChild(topBar);

    this.currencyWallet.subscribe(() => {
      this.updateCurrency();
      this.updateCardAvailability();
    });
    this.renderShop();
    this.updateCardAvailability();
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

      dragState.isDragging = true;
      dragState.chicken = chicken;
      dragState.offsetX = 0;
      dragState.offsetY = 0;

      console.log(`Started dragging: ${chicken.name}`);
    });

    card.appendChild(cost);
    card.appendChild(img);
    card.appendChild(name);

    this.chickenCards.push({ card, chicken });

    return card;
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
