

const MAX_TRIES = 6;

/* ---------- Game state ---------- */
let wordList = [];        // All words loaded from JSON
let currentWord = "";     // The word the user must guess
let currentHint = "";     // Hint shown for the current word
let guessedLetters = [];  // Letters the player has already tried
let triesLeft = MAX_TRIES;
let gameOver = false;

/* ---------- DOM references ---------- */
const wordDisplayEl    = document.getElementById("wordDisplay");
const hintEl           = document.getElementById("hint");
const letterInputEl    = document.getElementById("letterInput");
const guessBtnEl       = document.getElementById("guessBtn");
const triesLeftEl      = document.getElementById("triesLeft");
const guessedLettersEl = document.getElementById("guessedLetters");
const messageEl        = document.getElementById("message");
const resetBtnEl       = document.getElementById("resetBtn");

/* =====================================================
   1. Load words from JSON, then start the game
   ===================================================== */
async function loadWordsAndStart() {
  try {
    const response = await fetch("words.json");
    if (!response.ok) {
      throw new Error("Could not load words.json (status " + response.status + ")");
    }
    const data = await response.json();
    wordList = data.words;
    startGame();
  } catch (err) {
    // If fetch fails (e.g. opened via file:// in some browsers),
    // show a helpful message instead of silently breaking.
    messageEl.textContent =
      "Error loading words. Please run this page from a local server.";
    messageEl.classList.add("msg-lose");
    console.error(err);
  }
}

/* =====================================================
   2. Start / reset a game round
   ===================================================== */
function startGame() {
  // Pick a random word from the list
  const randomIndex = Math.floor(Math.random() * wordList.length);
  const chosen = wordList[randomIndex];

  currentWord    = chosen.word.toLowerCase();
  currentHint    = chosen.hint;
  guessedLetters = [];
  triesLeft      = MAX_TRIES;
  gameOver       = false;

  // Reset UI
  hintEl.textContent    = currentHint;
  messageEl.textContent = "";
  messageEl.classList.remove("msg-win", "msg-lose");

  // Re-enable input in case the previous game disabled it
  letterInputEl.disabled = false;
  guessBtnEl.disabled    = false;
  letterInputEl.value    = "";
  letterInputEl.focus();

  updateDisplay();
}

/* =====================================================
   3. Handle a single guess
   ===================================================== */
function handleGuess() {
  if (gameOver) return;

  const rawInput = letterInputEl.value.trim().toLowerCase();
  letterInputEl.value = "";
  letterInputEl.focus();

  // Edge case: empty input or non-letter input
  if (rawInput === "" || !/^[a-z]$/.test(rawInput)) {
    showMessage("Please enter a single letter (A–Z).", "msg-lose");
    return;
  }

  const letter = rawInput;

  // Edge case: duplicate guess
  if (guessedLetters.includes(letter)) {
    showMessage(`You already guessed "${letter}". Try another!`, "msg-lose");
    return;
  }

  guessedLetters.push(letter);

  // Correct or incorrect?
  if (currentWord.includes(letter)) {
    showMessage(`Good guess! "${letter}" is in the word.`, "msg-win");
  } else {
    triesLeft--;
    showMessage(`Sorry, "${letter}" is not in the word.`, "msg-lose");
  }

  updateDisplay();
  checkGameEnd();
}

/* =====================================================
   4. Update the word display, tries, and guessed letters
   ===================================================== */
function updateDisplay() {
  // Build the masked word: show letter if guessed, otherwise "_"
  const masked = currentWord
    .split("")
    .map((ch) => (guessedLetters.includes(ch) ? ch.toUpperCase() : "_"))
    .join(" ");

  wordDisplayEl.textContent = masked;
  triesLeftEl.textContent   = triesLeft;

  guessedLettersEl.textContent =
    guessedLetters.length === 0
      ? "none"
      : guessedLetters.join(", ").toUpperCase();
}

/* =====================================================
   5. Check if the player has won or lost
   ===================================================== */
function checkGameEnd() {
  // Win: every letter of the word has been guessed
  const hasWon = currentWord
    .split("")
    .every((ch) => guessedLetters.includes(ch));

  if (hasWon) {
    endGame(true);
    return;
  }

  // Lose: no tries left
  if (triesLeft <= 0) {
    endGame(false);
  }
}

/* =====================================================
   6. End the game (win or lose) and disable input
   ===================================================== */
function endGame(won) {
  gameOver = true;
  letterInputEl.disabled = true;
  guessBtnEl.disabled    = true;

  if (won) {
    showMessage(`You won! The word was "${currentWord.toUpperCase()}".`, "msg-win");
    // Reveal the full word clearly
    wordDisplayEl.textContent = currentWord.toUpperCase().split("").join(" ");
  } else {
    showMessage(`Game over! The word was "${currentWord.toUpperCase()}".`, "msg-lose");
  }
}

/* =====================================================
   7. Helper: show a message in the message area
   ===================================================== */
function showMessage(text, cssClass) {
  messageEl.textContent = text;
  messageEl.classList.remove("msg-win", "msg-lose");
  if (cssClass) messageEl.classList.add(cssClass);
}

/* =====================================================
   8. Event listeners
   ===================================================== */
guessBtnEl.addEventListener("click", handleGuess);

// Allow pressing Enter in the input to submit a guess
letterInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleGuess();
  }
});

resetBtnEl.addEventListener("click", startGame);

/* ---------- Kick things off ---------- */
loadWordsAndStart();
