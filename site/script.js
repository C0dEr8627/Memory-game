// ==============================
// Level Configuration & State
// ==============================
const levels = [
  { id: 1, cols: 4, rows: 2 }, // Level 1
  { id: 2, cols: 4, rows: 3 }, // Level 2
  { id: 3, cols: 4, rows: 4 }, // Level 3
  // { id: 4, cols: 6, rows: 4 }, // Level 4
  // { id: 5, cols: 6, rows: 6 }  // Level 5
];

let unlockedLevels = [1]; // First level unlocked by default

// Cache DOM elements
const levelSelectionScreen = document.getElementById("levelSelectionScreen");
const levelButtonsContainer = document.getElementById("levelButtons");
const gameScreen = document.getElementById("gameScreen");
const backToLevelsBtn = document.getElementById("backToLevels");
const gameBoard = document.getElementById("gameBoard");
const moveCountEl = document.getElementById("moveCount");

// Initialize game state
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;

// Global Variables
let currentLevel = 0;
let totalPairs = 0;

// ==============================
// Functionality: Screen Management
// ==============================
function showScreen(screen) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

// ==============================
// Level Selection
// ==============================
function renderLevelSelection() {
  levelButtonsContainer.innerHTML = "";

  levels.forEach((level, index) => {
    const btn = document.createElement("button");
    btn.textContent = `Level ${index + 1}`;
    btn.disabled = !unlockedLevels.includes(level.id); // Unlock levels based on progress

    btn.addEventListener("click", () => {
      startGame(index);
    });

    levelButtonsContainer.appendChild(btn);
  });
}

// ==============================
// Game Logic
// ==============================
// Function to start the game and build the board
function startGame(levelIndex) {
  moves = 0;
  matchedPairs = 0;
  moveCountEl.textContent = "0";

  buildBoard(levelIndex); // Build the board based on level
  showScreen(gameScreen); // Show the game screen

  // Temporary card reveal at the start (for fairness)
  const cards = document.querySelectorAll(".card");
  cards.forEach(c => c.classList.add("flipped"));  // Flip all cards initially

  // After 2 seconds, flip the cards back
  setTimeout(() => {
    cards.forEach(c => c.classList.remove("flipped"));  // Flip back after 2 seconds
  }, 2000);
}

// Check if the user has won the level
function checkForWin() {
  if (matchedPairs === totalPairs) {
    setTimeout(() => {
      levelComplete();
    }, 500);
  }
}

// Modify the buildBoard function to calculate totalPairs dynamically
function buildBoard(levelIndex = 0) {
  gameBoard.innerHTML = "";

  const cols = levels[levelIndex].cols;
  const rows = levels[levelIndex].rows;
  
  // Calculate totalPairs (half of total cards)
  totalPairs = (cols * rows) / 2; // Each pair has 2 cards
  
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const values = ["🍎", "🍌", "🍇", "🍉", "🍒", "🍓", "🥝", "🍍"];
  
  // Create pairs of cards
  const neededValues = values.slice(0, totalPairs);
  const deck = [...neededValues, ...neededValues].sort(() => Math.random() - 0.5);

  deck.forEach(value => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = value;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">${value}</div>
        <div class="card-back"><img src="../assets/logo.png" class="card-logo" /></div>
      </div>
    `;

    card.addEventListener("click", () => flipCard(card));
    gameBoard.appendChild(card);
  });
}


// Function to flip the card when clicked
function flipCard(card) {
  if (lockBoard || card === firstCard || card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  moves++;
  moveCountEl.textContent = moves;

  checkMatch();
}

// Check if the two flipped cards match
function checkMatch() {
  const isMatch = firstCard.dataset.value === secondCard.dataset.value;

  if (isMatch) {
    matchedPairs++;
    resetTurn();
    // Call checkForWin to determine if the player has won
    checkForWin();  // Check if all pairs are matched
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 700);  // Delay to show the flipped cards before resetting
  }
}

// Reset board state
function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Show Level Complete Modal
function levelComplete() {
  // Show the level complete modal
  const modal = document.getElementById("levelCompleteModal");
  const message = document.getElementById("levelCompleteMessage");
  message.textContent = `You completed Level ${currentLevel + 1}!`;
  
  modal.classList.add("active");
}

// Next Level Button Logic
const nextLevelBtn = document.getElementById("nextLevelBtn");

nextLevelBtn.addEventListener("click", () => {
  // Unlock next level and store it in localStorage
  if (currentLevel + 1 < levels.length) {
    currentLevel++;
    unlockedLevels.push(currentLevel + 1);  // Unlock next level
    localStorage.setItem('gameProgress', JSON.stringify({ unlockedLevels }));

    // Hide modal and start next level
    const modal = document.getElementById("levelCompleteModal");
    modal.classList.remove("active");
    
    // Start the next level
    startGame(currentLevel);
  } else {
    alert('You have completed all available levels!');
  }
});

// Load the game progress from localStorage when the page loads
function loadGameProgress() {
  const savedProgress = localStorage.getItem('gameProgress');
  if (savedProgress) {
    const progress = JSON.parse(savedProgress);
    unlockedLevels = progress.unlockedLevels || [1]; // Default to level 1 unlocked
    currentLevel = unlockedLevels.length - 1;
  }
}

// Save progress when a level is completed
function saveGameProgress() {
  localStorage.setItem('gameProgress', JSON.stringify({ unlockedLevels }));
}

// ==============================
// Back to Levels Button
// ==============================
backToLevelsBtn.addEventListener("click", () => {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  levelSelectionScreen.classList.add("active");
});

// ==============================
// Loading Screen Handling
// ==============================
window.addEventListener("load", () => {
  setTimeout(() => {
    showScreen(levelSelectionScreen);
    loadGameProgress();
    renderLevelSelection();
  }, 3000); // Show level selection after 3-second loading screen
});
