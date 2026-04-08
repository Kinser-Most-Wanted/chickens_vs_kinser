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
  { id: "tank", name: "Tank Chicken", cost: 75, image: "assets/placeholder.png" },
];

// =========================
// DOM ELEMENTS
// =========================

const shop = document.createElement("div");
shop.id = "shop";

const currencyDisplay = document.createElement("div");
currencyDisplay.id = "currency";

const currencyImg = document.createElement("img");
currencyImg.src = "assets/exceeds.png";
currencyImg.style.width = "32px";

const currencyText = document.createElement("span");

currencyDisplay.appendChild(currencyImg);
currencyDisplay.appendChild(currencyText);

// =========================
// STYLES
// =========================

const style = document.createElement("style");
style.innerHTML = `
  body {
    background: #1a1a1a;
    font-family: sans-serif;
  }

  #currency {
    display: flex;
    align-items: center;
    gap: 10px;
    color: white;
    padding: 10px;
    font-size: 20px;
  }

  #shop {
    display: flex;
    gap: 12px;
    padding: 10px;
    background: #2b2b2b;
  }

  .card {
    width: 90px;
    background: #3a3a3a;
    color: white;
    text-align: center;
    border-radius: 10px;
    padding: 6px;
  }

  .card img {
    width: 70px;
    height: 70px;
  }

  .cost {
    margin-top: 4px;
    font-weight: bold;
    color: #ffd700;
  }
`;

document.head.appendChild(style);

// =========================
// FUNCTIONS
// =========================

function updateCurrency() {
  currencyText.textContent = `Exceeds: ${exceeds}`;
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
  name.textContent = chicken.name;

  const cost = document.createElement("div");
  cost.className = "cost";
  cost.textContent = `${chicken.cost}`;

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(cost);

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

document.body.appendChild(currencyDisplay);
document.body.appendChild(shop);
