// Chickens vs Kinser - Shop System (PvZ-style drag & drop)
// This is a simple standalone TypeScript implementation using DOM APIs
// You can plug this into your game and expand as needed

// =========================
// TYPES
// =========================

type Chicken = {
  id: string;
  name: string;
  cost: number;
  image: string; // path to chicken image
};

// =========================
// GAME STATE
// =========================

let exceeds: number = 100; // starting currency

const chickens: Chicken[] = [
  { id: "basic", name: "Basic Chicken", cost: 25, image: "assets/basic.png" },
  { id: "fast", name: "Fast Chicken", cost: 50, image: "assets/fast.png" },
  { id: "tank", name: "Tank Chicken", cost: 75, image: "assets/tank.png" },
];

// =========================
// DOM ELEMENTS
// =========================

const shop = document.createElement("div");
shop.id = "shop";

const currencyDisplay = document.createElement("div");
currencyDisplay.id = "currency";

// Placeholder for currency image
const currencyImg = document.createElement("img");
currencyImg.src = "assets/exceeds.png"; // <-- YOU can replace this
currencyImg.style.width = "32px";

currencyDisplay.appendChild(currencyImg);

const currencyText = document.createElement("span");
currencyDisplay.appendChild(currencyText);

// Game grid (where chickens are dropped)
const grid = document.createElement("div");
grid.id = "grid";

// =========================
// STYLES
// =========================

const style = document.createElement("style");
style.innerHTML = `
  #shop {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: #222;
  }

  .card {
    width: 80px;
    background: #444;
    color: white;
    text-align: center;
    border-radius: 8px;
    padding: 5px;
    cursor: grab;
  }

  .card img {
    width: 60px;
    height: 60px;
  }

  #currency {
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px;
  }

  #grid {
    width: 600px;
    height: 400px;
    background: green;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 2px;
    margin-top: 20px;
  }

  .cell {
    background: rgba(0,0,0,0.2);
  }

  .placed {
    width: 100%;
    height: 100%;
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
  card.draggable = true;

  const img = document.createElement("img");
  img.src = chicken.image;

  const name = document.createElement("div");
  name.textContent = chicken.name;

  const cost = document.createElement("div");
  cost.textContent = `${chicken.cost}`;

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(cost);

  // Drag logic
  card.addEventListener("dragstart", (e) => {
    e.dataTransfer?.setData("chickenId", chicken.id);
  });

  return card;
}

function createGrid() {
  for (let i = 0; i < 24; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";

    cell.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    cell.addEventListener("drop", (e) => {
      e.preventDefault();

      const id = e.dataTransfer?.getData("chickenId");
      const chicken = chickens.find(c => c.id === id);

      if (!chicken) return;

      // Check cost
      if (exceeds < chicken.cost) {
        alert("Not enough Exceeds!");
        return;
      }

      // Prevent placing twice in same cell
      if (cell.hasChildNodes()) return;

      exceeds -= chicken.cost;
      updateCurrency();

      const placed = document.createElement("img");
      placed.src = chicken.image;
      placed.className = "placed";

      cell.appendChild(placed);
    });

    grid.appendChild(cell);
  }
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
createGrid();

document.body.appendChild(currencyDisplay);
document.body.appendChild(shop);
document.body.appendChild(grid);

// =========================
// NOTES FOR YOU
// =========================
// - Replace "assets/exceeds.png" with your currency icon
// - Replace chicken image paths with your sprites
// - Hook this into your actual game loop later
// - You can expand with cooldowns, greying out cards, etc.
