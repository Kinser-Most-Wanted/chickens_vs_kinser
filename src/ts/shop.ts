// Chickens vs Kinser - Shop UI ONLY (Clean Fixed Version)

// =========================
// TYPES
// =========================

type Chicken = {
  id: string;
  name: string;
  cost: number;
  image: string;
};

// =========================
// GAME STATE
// =========================

let exceeds: number = 100;

// !!! ADD MORE CHICKENS HERE !!! (Make sure to add unique IDs and valid image paths)

const chickens: Chicken[] = [
  { id: "basic", name: "Basic Chicken", cost: 100, image: "assets/basicchicken.png" },
  { id: "exceeds", name: "Exceeds Chicken", cost: 50, image: "assets/exceedschicken.png" },
  { id: "tank", name: "Tank Chicken", cost: 75, image: "assets/tankchicken.png" },
];

// =========================
// DOM ELEMENTS
// =========================

// Main PvZ-style top bar
const topBar = document.createElement("div");
topBar.id = "top-bar";

// Currency (left side like PvZ sun counter)
const currencyDisplay = document.createElement("div");
currencyDisplay.id = "currency";

const currencyImg = document.createElement("img");
currencyImg.src = "assets/exceeds.png";
currencyImg.style.width = "40px";

const currencyText = document.createElement("span");

currencyDisplay.appendChild(currencyImg);
currencyDisplay.appendChild(currencyText);

// Shop tray (seed packet bar)
const shop = document.createElement("div");
shop.id = "shop";

// Attach to top bar
topBar.appendChild(currencyDisplay);
topBar.appendChild(shop);

// =========================
// STYLES
// =========================

const style = document.createElement("style");
style.innerHTML = `
  body {
    margin: 0;
    background: #1a1a1a;
    font-family: sans-serif;
  }

  #top-bar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 10px;
    background: #3b2f1c; /* PvZ dirt-ish tone */
    border-bottom: 4px solid #2a1f10;
  }

  #currency {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff8c6;
    font-size: 22px;
    background: #5a3d1e;
    padding: 6px 12px;
    border-radius: 8px;
    border: 2px solid #2a1f10;
  }

  #shop {
    display: flex;
    gap: 8px;
    padding: 6px;
    background: #6b4f2a;
    border-radius: 10px;
    border: 3px solid #2a1f10;
  }

  .card {
    width: 80px;
    height: 100px;
    background: #d2b48c;
    border-radius: 6px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
  }

  .card img {
    width: 60px;
    height: 60px;
  }

  .cost {
    position: absolute;
    top: 2px;
    left: 4px;
    background: black;
    color: #ffd700;
    font-size: 14px;
    padding: 2px 5px;
    border-radius: 4px;
  }

  .name {
    font-size: 11px;
    color: #222;
    margin-top: 2px;
    text-align: center;
    font-weight: bold;
  }
`;

document.head.appendChild(style);

// =========================
// FUNCTIONS
// =========================

function updateCurrency() {
  currencyText.textContent = `${exceeds}`;
}

// add flair to the UI with color-coded borders based on cost of chickens

function getBorderColor(cost: number): string {
  if (cost <= 50) return "#4caf50";
  if (cost <= 75) return "#2196f3";
  return "#f44336";
}

function createChickenCard(chicken: Chicken) {
  const card = document.createElement("div");
  card.className = "card";

  card.style.border = `3px solid ${getBorderColor(chicken.cost)}`;

  const img = document.createElement("img");
  img.src = chicken.image;

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = chicken.name;

  const cost = document.createElement("div");
  cost.className = "cost";
  cost.textContent = `${chicken.cost}`;

  card.appendChild(cost);
  card.appendChild(img);
  card.appendChild(name);

  return card;
}

function initShop() {
  chickens
    .slice()
    .sort((a, b) => a.cost - b.cost)
    .forEach(chicken => {
      shop.appendChild(createChickenCard(chicken));
    });
}

// =========================
// INIT
// =========================

updateCurrency();
initShop();

document.body.appendChild(topBar);
