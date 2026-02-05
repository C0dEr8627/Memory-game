const gameBoard = document.getElementById("gameBoard");
const movesEl = document.getElementById("moves");
const restartBtn = document.getElementById("restartBtn");
const progressBar = document.getElementById("progressBar");
const levelModal = document.getElementById("levelModal");
const modalMessage = document.getElementById("modalMessage");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const resetBtn = document.getElementById("resetBtn");
const STORAGE_KEY = "flipzy-game-state";

const allSymbols = [
  "🍎", "🍌", "🍇", "🍓", "🍉", "🍒", "🥝", "🍍", "🍅", "🥧",
  "🥭", "🍑", "🍋", "🍐", "🍏", "🍊", "🥥", "🍈", "🥑"
];

const levels = [
  { cols: 4, rows: 4 },
  { cols: 6, rows: 4 },
  { cols: 6, rows: 6 }
];

let currentLevel = 0;
let cards = [];
let totalPairs = 0;
let matchedPairs = 0;
let moves = 0;
let matchedSymbols = new Set();
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let savedCardsOrder = null;

// HELPERS
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// UPDATE PROGRESS BAR
function updateProgress() {
  progressBar.style.width = (matchedPairs / totalPairs) * 100 + "%";
}

// SAVE GAME STATE
function saveGameState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentLevel,
      matchedSymbols: [...matchedSymbols],
      cardsOrder: cards,
      moves,
      matchedPairs,
      totalPairs
    })
  );
}

// LOAD GAME STATE
function loadGameState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const state = JSON.parse(saved);
    console.log(state)
    if (
      typeof state.currentLevel === "number" &&
      state.currentLevel >= 0 &&
      state.currentLevel < levels.length
    ) {
      currentLevel = state.currentLevel;
    }
    if (Array.isArray(state.matchedSymbols)) {
      matchedSymbols = new Set(state.matchedSymbols);
    }
    if (Array.isArray(state.cardsOrder)) {
      savedCardsOrder = state.cardsOrder;
    }
    if (typeof state.moves === "number") {
      moves = state.moves;
      movesEl.textContent = moves;
    }
    if (typeof state.matchedPairs === "number") {
      matchedPairs = state.matchedPairs;
      totalPairs = state.totalPairs;
      updateProgress();
    }
  } catch (e) {
    console.warn("Invalid saved state");
  }
}

// GET CARD SIZE
// function getCardSize(cols, rows) {
//   const maxBoardHeight = window.innerHeight * 0.6;
//   const gap = 16;
//   const availableHeight = maxBoardHeight - (rows - 1) * gap;
//   return Math.floor(availableHeight / rows);
// }
function getCardSize(cols, rows) {
  const gap = 16;

  const container = document.querySelector(".container");
  const containerPadding = 32; // approx left + right padding
  const maxBoardWidth = container.clientWidth - containerPadding;

  const maxBoardHeight = window.innerHeight * 0.6;

  const availableWidth = maxBoardWidth - (cols - 1) * gap;
  const availableHeight = maxBoardHeight - (rows - 1) * gap;

  const cardWidth = Math.floor(availableWidth / cols);
  const cardHeight = Math.floor(availableHeight / rows);

  return Math.min(cardWidth, cardHeight);
}


// BOARD CREATION
function createBoard(cols, rows) {
  gameBoard.innerHTML = "";
  const gap = 16;
  const cardSize = getCardSize(cols, rows);
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, ${cardSize}px)`;
  gameBoard.style.gap = `${gap}px`;

  const boardWrapper = document.querySelector(".board-wrapper");
  boardWrapper.style.width =
    cols * cardSize + (cols - 1) * gap + "px";

  cards.forEach(symbol => {
    const card = document.createElement("div");
    card.className = "card-box";

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back">${symbol}</div>
      </div>
    `;
    if (matchedSymbols.has(symbol)) {
      card.classList.add("flipped", "matched");
    }

    card.addEventListener("click", flipCard);
    gameBoard.appendChild(card);
  });
}

// GAME LOGIC
function flipCard() {
  if (lockBoard || this.classList.contains("flipped")) return;
  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  moves++;
  movesEl.textContent = moves;
  // saveGameState(); 
  checkMatch();
}

function checkMatch() {
  const a = firstCard.querySelector(".card-back").textContent;
  const b = secondCard.querySelector(".card-back").textContent;

  if (a === b) {
    matchedPairs++;
    matchedSymbols.add(a);
    saveGameState();

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    updateProgress();
    resetTurn();
  } else {
    lockBoard = true;

    [firstCard, secondCard].forEach(card => {
      card.classList.remove("wrong");
      void card.offsetWidth;
      card.classList.add("wrong");
    });

    setTimeout(() => {
      firstCard.classList.remove("flipped", "wrong");
      secondCard.classList.remove("flipped", "wrong");
      resetTurn();
    }, 500);
  }

  if (matchedPairs === totalPairs) {
    setTimeout(() => {
      modalMessage.textContent = `You completed level ${currentLevel + 1}!`;
      levelModal.style.display = "flex";
    }, 500);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// GAME CONTROL
function startGame() {
  const { cols, rows } = levels[currentLevel];
  totalPairs = (cols * rows) / 2;

  // Set cards based on saved state or generate new
  if (savedCardsOrder) {
    cards = savedCardsOrder;
  } else {
    cards = [
      ...allSymbols.slice(0, totalPairs),
      ...allSymbols.slice(0, totalPairs)
    ];
    shuffle(cards);
  }

  // Dynamically set matchedPairs based on matchedSymbols (fixes progress persistence)
  matchedPairs = matchedSymbols.size;
  updateProgress();

  // REMOVED: moves = 0; and movesEl.textContent = 0; (fixes moves persistence)
  // loadGameState() already handles this

  resetTurn();
  createBoard(cols, rows);
}

// RESET GAME TO FIRST LEVEL
function resetToFirstLevel() {
  currentLevel = 0;
  moves = 0;
  movesEl.textContent = 0;
  matchedPairs = 0;
  matchedSymbols.clear();
  savedCardsOrder = null;
  updateProgress();
  saveGameState();
  startGame();
}
resetBtn.addEventListener("click", resetToFirstLevel);

restartBtn.addEventListener("click", () => {
  moves = 0;
  movesEl.textContent = 0;
  matchedPairs = 0;
  matchedSymbols.clear();
  savedCardsOrder = null;
  saveGameState();
  startGame();
});

nextLevelBtn.addEventListener("click", () => {
  levelModal.style.display = "none";
  moves = 0;
  movesEl.textContent = 0;
  currentLevel = (currentLevel + 1) % levels.length;
  matchedSymbols.clear();
  savedCardsOrder = null;
  startGame();
  saveGameState();
});

// INIT
loadGameState();
startGame();
