

const MAX_TRIES = 6;


let wordList = [];     
let currentWord = "";    
let currentHint = "";    
let guessedLetters = []; 
let triesLeft = MAX_TRIES;
let gameOver = false;

const wordDisplayEl    = document.getElementById("wordDisplay");
const hintEl           = document.getElementById("hint");
const letterInputEl    = document.getElementById("letterInput");
const guessBtnEl       = document.getElementById("guessBtn");
const triesLeftEl      = document.getElementById("triesLeft");
const guessedLettersEl = document.getElementById("guessedLetters");
const messageEl        = document.getElementById("message");
const resetBtnEl       = document.getElementById("resetBtn");

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
    messageEl.textContent =
      "Error loading words. Please run this page from a local server.";
    messageEl.classList.add("msg-lose");
    console.error(err);
  }
}

function startGame() {
 
  const randomIndex = Math.floor(Math.random() * wordList.length);
  const chosen = wordList[randomIndex];

  currentWord    = chosen.word.toLowerCase();
  currentHint    = chosen.hint;
  guessedLetters = [];
  triesLeft      = MAX_TRIES;
  gameOver       = false;

  
  hintEl.textContent    = currentHint;
  messageEl.textContent = "";
  messageEl.classList.remove("msg-win", "msg-lose");


  letterInputEl.disabled = false;
  guessBtnEl.disabled    = false;
  letterInputEl.value    = "";
  letterInputEl.focus();

  updateDisplay();
}


function handleGuess() {
  if (gameOver) return;

  const rawInput = letterInputEl.value.trim().toLowerCase();
  letterInputEl.value = "";
  letterInputEl.focus();

  
  if (rawInput === "" || !/^[a-z]$/.test(rawInput)) {
    showMessage("Please enter a single letter (A–Z).", "msg-lose");
    return;
  }

  const letter = rawInput;


  if (guessedLetters.includes(letter)) {
    showMessage(`You already guessed "${letter}". Try another!`, "msg-lose");
    return;
  }

  guessedLetters.push(letter);

 
  if (currentWord.includes(letter)) {
    showMessage(`Good guess! "${letter}" is in the word.`, "msg-win");
  } else {
    triesLeft--;
    showMessage(`Sorry, "${letter}" is not in the word.`, "msg-lose");
  }

  updateDisplay();
  checkGameEnd();
}
function updateDisplay() {

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


function endGame(won) {
  gameOver = true;
  letterInputEl.disabled = true;
  guessBtnEl.disabled    = true;

  if (won) {
    showMessage(`You won! The word was "${currentWord.toUpperCase()}".`, "msg-win");
    
    wordDisplayEl.textContent = currentWord.toUpperCase().split("").join(" ");
  } else {
    showMessage(`Game over! The word was "${currentWord.toUpperCase()}".`, "msg-lose");
  }
}


function showMessage(text, cssClass) {
  messageEl.textContent = text;
  messageEl.classList.remove("msg-win", "msg-lose");
  if (cssClass) messageEl.classList.add(cssClass);
}


guessBtnEl.addEventListener("click", handleGuess);


letterInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleGuess();
  }
});

resetBtnEl.addEventListener("click", startGame);


loadWordsAndStart();
