// Chickens vs Kinser - Shop UI ONLY (No drag/drop yet)
// Focus: display currency + shop chickens (PvZ-style bar)

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

const chickens: Chicken[] = [
  { id: "basic", name: "Basic Chicken", cost: 100, image: "assets/basicchicken.png" },
  { id: "exceeds", name: "Exceeds Chicken", cost: 50, image: "assets/exceedschicken.png" },
  { id: "tank", name: "Tank Chicken", cost: 75, image: "assets/placeholder.png" }, // replace with tankchicken.png later on
];

// =========================
// DOM ELEMENTS
// =========================

const shop = document.createElement("div");
shop.id = "shop";

const currencyDisplay = document.createElement("div");
currencyDisplay.id = "currency";

const currencyImg = document.createElement("img");
currencyImg.src = "assets/exceeds.png"; // Exceeds icon
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
    border-top: 3px solid #444;
    border-bottom: 3px solid #444;
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

function createChickenCard(chicken: Chicken) {
  const card = document.createElement("div");
  card.className = "card";

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
  chickens.forEach(chicken => {
    const card = createChickenCard(chicken);
    shop.appendChild(card);
  });
}

// =========================
// INIT
// =========================

updateCurrency();
initShop();

document.body.appendChild(currencyDisplay);
document.body.appendChild(shop);

// =========================
// NOTES
// =========================
// - No drag/drop yet (handled by another teammate)
// - This is purely visual + data structure
// - Later you can add click/selection or drag logic
// - Replace image paths with your assets
