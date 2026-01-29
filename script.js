const gameBoard = document.getElementById("gameBoard");
const movesEl = document.getElementById("moves");
const resetBtn = document.getElementById("resetBtn");
const progressBar = document.getElementById("progressBar");

const allSymbols = [
  "🍎","🍌","🍇","🍓","🍉","🍒","🥝","🍍",
  "🥭","🍑","🍋","🍐","🍏","🍊","🥥","🍈",
  "🍅","🍆","🥕","🌽","🥔","🍄"
];

// Levels
const levels = [
  { cols: 4, rows: 4 },
  { cols: 6, rows: 4 },
  { cols: 6, rows: 6 },
  { cols: 8, rows: 6 }
];

let currentLevel = 0;
let cards = [];
let totalPairs = 0;
let matchedPairs = 0;
let moves = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;


const levelModal = document.getElementById("levelModal");
const modalMessage = document.getElementById("modalMessage");
const nextLevelBtn = document.getElementById("nextLevelBtn");

function showLevelModal(message) {
  modalMessage.textContent = message;
  levelModal.style.display = "flex";
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function hideLevelModal() {
  levelModal.style.display = "none";
}

// When user clicks Next Level
nextLevelBtn.addEventListener("click", () => {
  hideLevelModal();
  currentLevel++;
  if (currentLevel >= levels.length) {
    alert("🏆 You completed all levels! Restarting...");
    currentLevel = 0;
  }
  startNewGame();
});

// Shuffle
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Update progress bar
function updateProgress() {
  const percent = (matchedPairs / totalPairs) * 100;
  progressBar.style.width = percent + "%";
}

// Create board
function createBoard(cols) {
  gameBoard.innerHTML = "";
  shuffle(cards);

  const colSize = 12 / cols;

  cards.forEach(symbol => {
    const col = document.createElement("div");
    col.className = `col-${colSize}`;

    col.innerHTML = `
      <div class="card-box">
        <div class="card-inner">
          <div class="card-front">?</div>
          <div class="card-back">${symbol}</div>
        </div>
      </div>
    `;

    col.querySelector(".card-box").addEventListener("click", flipCard);
    gameBoard.appendChild(col);
  });
}

// Flip card
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

  checkMatch();
}

// Check match
function checkMatch() {
  const firstSymbol = firstCard.querySelector(".card-back").textContent;
  const secondSymbol = secondCard.querySelector(".card-back").textContent;

  if (firstSymbol === secondSymbol) {
    matchedPairs++;
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    updateProgress(); //update bar on match
    resetTurn();

    // Level complete
    if (matchedPairs === totalPairs) {
      setTimeout(() => {
        showLevelModal(`🎉 You completed Level ${currentLevel + 1}!`);
        currentLevel++;
        if (currentLevel >= levels.length) {
          alert("🏆 You completed all levels! Restarting...");
          currentLevel = 0;
        }

        startNewGame();
      }, 600);
    }

  } else {
    lockBoard = true;
    firstCard.classList.add("wrong");
    secondCard.classList.add("wrong");

    setTimeout(() => {
      firstCard.classList.remove("wrong", "flipped");
      secondCard.classList.remove("wrong", "flipped");
      resetTurn();
    }, 800);
  }
}

// Reset turn
function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Start game
function startNewGame() {
  const { cols, rows } = levels[currentLevel];
  totalPairs = (cols * rows) / 2;

  const selectedSymbols = allSymbols.slice(0, totalPairs);
  cards = [...selectedSymbols, ...selectedSymbols];

  matchedPairs = 0;
  moves = 0;
  movesEl.textContent = moves;
  progressBar.style.width = "0%"; // reset bar

  resetTurn();
  createBoard(cols);
}

// Reset button
resetBtn.addEventListener("click", () => {
  currentLevel = 0;
  startNewGame();
});

// Init
startNewGame();
