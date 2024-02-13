//
const apiUrl = "http://localhost:8000/hint";

// query selector
const startBtn = document.querySelector(".start_btn");
const resetBtn = document.querySelector(".reset_btn");
const main_detailsElements = document.querySelectorAll(".main_details p");
let hintWord = document.querySelector("#hintPlaceholder");
let letterInput = document.querySelector(".main_typing");
const inputs = document.querySelector(".main_inputs");
let wrongLetters = document.querySelector("#wrongLettersPlaceholder");
let chanceLeft = document.querySelector("#chancesPlaceholder");
const streakBar = document.querySelector(".skill_per");
let letterPresentDiv = document.querySelector("#letterPtag");
let wordFound = document.querySelector("#wordStatus");
let streakQuery = document.querySelector(".highest_streak");
let pointsQuery = document.querySelector(".total_points");
let highScoreQuery = document.querySelector(".high_score");
let gameEnded = false;
let focusInput = document.querySelector(".main_div");
//
//
// streak vars
let lastRoundScore = 0,
  highestScore = 0,
  roundScore = 0,
  allRoundScore = {},
  roundStreak = 0,
  currentStreak = 0,
  highestStreak = 0,
  carriedStreak = 0,
  round = 0;

// score variables

// global variables for dictionary response from hint.py and other important variables
let fetchedData,
  incorrectLetters = [],
  correctLetters = [],
  maxGuesses,
  globalStreakWidth;

// fetched word filling in inputs and chances remaining

function randomWord() {
  if (!fetchedData || Object.keys(fetchedData).length === 0) {
    console.error("No fetched data available");
    return;
  }
  let fetchKey = Object.keys(fetchedData);
  let word = fetchKey[0];
  //
  //chances left
  maxGuesses = 5;
  chanceLeft.innerHTML = maxGuesses;
  //
  let html = "";
  for (let i = 0; i < word.length; i++) {
    html += `<input type="text" disabled>`;
  }

  inputs.innerHTML = html;

  console.log("Random Word values:", word);
}

// fuction to update the hint section using fetchedData

function updateHint() {
  if (!fetchedData || Object.values(fetchedData).length === 0) {
    console.error("No fetched data available");
    return;
  }

  const hintValues = Object.values(fetchedData)[0];

  const hintString = hintValues.substring("Hint: ".length);

  hintWord.textContent = hintString;

  console.log("Update Hint values:", hintString);
}

// function to insert and check user input also check guesses left to end game

function singleInput(e) {
  //
  //
  if (gameEnded === false) {
    currentStreak = streak;
    let singleKey = e.key,
      similarInput = Object.keys(fetchedData)[0],
      inputElements = inputs.querySelectorAll("input[type='text']");

    //

    if (singleKey.length === 1 && singleKey.match(/^[A-Za-z-]+$/)) {
      //
      if (
        //
        similarInput.includes(singleKey) &&
        !correctLetters.includes(singleKey)
      ) {
        if (streak >= 1) {
          streak += 1;
          currentStreak = streak;
          if (carriedStreak > 2 && streak >= 2) {
            // carry streak to round streak
            roundStreak = carriedStreak + streak;
            carriedStreak = 0;
          }
          setTimeout(() => {
            updateStreakBar();
          }, 20);
        } else {
          streak += 1;
          currentStreak = streak;
          updateStreakBar();
        }
        for (let i = 0; i < similarInput.length; i++) {
          if (similarInput[i] === singleKey) {
            inputElements[i].value = singleKey;
            correctLetters.push(singleKey);
          }
        }
        letterPresentDiv.textContent = ""; //
      } else if (
        //
        !incorrectLetters.includes(singleKey) &&
        !correctLetters.includes(singleKey)
      ) {
        maxGuesses--;
        incorrectLetters.push(` ${singleKey} `);
        streak = 0;
        currentStreak = streak;
        updateStreakBar();
      } //
      else {
        // input letter already found
        if (correctLetters.includes(singleKey)) {
          letterPresentDiv.textContent = `Letter already found: ${singleKey}`;
        }
      }
    }
    //update round streak to its maximum if carriedstreak + current streak < currentstreak
    //
    if (roundStreak == 0) {
      roundStreak = currentStreak;
    } else if (roundStreak < currentStreak) {
      roundStreak = currentStreak;
    }
    //count highest streak in all rounds
    if (highestStreak == 0 || highestStreak < currentStreak) {
      highestStreak = currentStreak;
    } else if (highestStreak < carriedStreak && highestStreak > currentStreak) {
      highestStreak = carriedStreak;
    }
    //
    streakQuery.textContent = `highest streak: ${highestStreak}`;
    chanceLeft.innerHTML = maxGuesses;
    wrongLetters.innerText = incorrectLetters;
    letterInput.value = singleKey;
    //
    // streak ++ here so that it updates +1 after updateStreakBar() is called
    console.log(singleKey);
    //
    // guess left < game over < congrats!
    if (correctLetters.length === similarInput.length) {
      // if word found score function then =>
      round += 1;
      //
      // use cases to navigate rounds
      switch (true) {
        //
        case round === 1:
          //
          roundScore = 10 + (currentStreak >= 2 ? currentStreak : streak);
          carriedStreak = roundScore - 10 >= 2 ? roundScore - 10 : 0;
          highestScore += roundScore;
          lastRoundScore = roundScore;
          //

          //
          break;
        //
        case round > 1:
          //

          if (currentStreak >= 2 && currentStreak < roundStreak) {
            roundScore = 10 + roundStreak;
          } else {
            roundScore = 10 + currentStreak;
          }
          if (roundScore - 10 >= 2) {
            carriedStreak = currentStreak;
          } else {
            carriedStreak = currentStreak;
          }
          highestScore += roundScore;
          lastRoundScore = roundScore;
          //
          break;
      }
      //Calculate total score for the round

      //
      // carrying forward logic

      //
      //streakbar
      //

      if (streak >= 1) {
        streakBar.style.maxWidth = `${globalStreakWidth}%`;
        //timeout and completion of last input before alert
      } //
      setTimeout(() => {
        wordFound.textContent = `You have found the word: ${similarInput}`;
        resetUI();
        streakBar.style.maxWidth = "0%";
      }, 200);
      pointsQuery.textContent = `Last Round Points: ${lastRoundScore}`;
      highScoreQuery.textContent = `Total Score: ${highestScore}`;
      toggleScoresVisibility();
      gameEnded = true;
    } else if (maxGuesses < 1) {
      alert("Game Over! Press Start Game");
      for (let i = 0; i < similarInput.length; i++) {
        // display word
        //
        inputElements[i].value = similarInput[i];
      }
    }
    // console.log ()
    /**console.log("Round Score:", roundScore);
  console.log("Total Score:", lastRoundScore);
  console.log("Current Streak:", currentStreak);
  console.log("Round Streak:", roundStreak);
  console.log("Highest Streak:", highestStreak);
  console.log("Carried Streak:", carriedStreak); */
  }
}

// function for points/score calculation

// fucntion reset game / UI

function resetGame() {
  // Reset global variables
  fetchedData = null;
  incorrectLetters = [];
  correctLetters = [];
  maxGuesses = null;
  streak = null;
  globalStreakWidth = null;
  totalScore = 0;
  currentStreak = 0;
  highestStreak = 0;
  gameEnded = false;
  letterPresentDiv.textContent = ``;

  // score reset
  lastRoundScore = 0;
  highestScore = 0;
  roundScore = 0;
  allRoundScore = {};
  roundStreak = 0;
  currentStreak = 0;
  highestStreak = 0;
  carriedStreak = 0;
  round = 0;
  pointsQuery.textContent = ``;
  highScoreQuery.textContent = ``;
  streakQuery.textContent = ``;

  // Reset UI elements
  hintWord.textContent = "";
  inputs.innerHTML = "";
  wrongLetters.innerText = "";
  chanceLeft.innerHTML = "";
  wordFound.textContent = "Guess the word";

  // function calling and other resets
  resetUI();
  refreshGame();
  letterInput.focus();
}

// UI_function to hide unhide .main_details UI

function resetUI() {
  hideParagraphs();
  updateStreakBar();
  startBnText();
}
// start refresh game requirements
function refreshGame() {
  fetchedData = null;
  incorrectLetters = [];
  correctLetters = [];
  maxGuesses = null;
  streak = 0;
  globalStreakWidth = null;
  gameEnded = false;
  //
  hintWord.textContent = "";
  inputs.innerHTML = "";
  wrongLetters.innerText = "";
  chanceLeft.innerHTML = "";
  wordFound.textContent = "Guess the word";
  //score variable refresh round
  roundStreak = 0;
  currentStreak = 0;
  roundScore = 0;

  // function calling and other resets
  resetUI();
  letterInput.focus();
}
// start game / refresh button text content

function startBnText() {
  if (fetchedData != null) {
    startBtn.textContent = "Refresh";
  } else {
    startBtn.textContent = "Start Game";
  }
}

// function to hide paragraphs
function hideParagraphs() {
  main_detailsElements.forEach((paragraph) => {
    paragraph.style.display = "none";
  });
}

// function to show paragraphs
function showParagraphs() {
  setTimeout(() => {
    startBtn.textContent = "Refresh";
  }, 20);
  main_detailsElements.forEach((paragraph) => {
    paragraph.style.display = "block";
  });
}
// function to hide show scores

function toggleScoresVisibility() {
  pointsQuery.classList.toggle("hidden");
  highScoreQuery.classList.toggle("hidden");
}

// fucntion for streak bar and animation to control css

function updateStreakBar() {
  //
  // cancel animation
  streakBar.getAnimations().forEach((animation) => {
    animation.cancel();
  });

  //
  // Get the max-width from the style attribute in the HTML
  if (streak == 1) {
    streakBar.style.maxWidth = "30%";
    globalStreakWidth = "30%";
  } else if (streak >= 2) {
    maxBarWidth = 100;

    // Calculate the width percentage based on the streak
    widthPercentage = maxBarWidth - maxBarWidth / streak; //streak_per fillbar logic

    // Update the streak bar width
    streakBar.style.maxWidth = `${widthPercentage}%`;
    globalStreakWidth = widthPercentage;

    combinedKeyframes = [
      // keyframes for bounce animation
      {
        transform: "translateY(-3px)",
        "max-width": `${widthPercentage}`,
        height: "14px",
        opacity: 1,
      },
      {
        transform: "translateY(3px)",
        "max-width": `${widthPercentage}`,
        height: "14px",
        opacity: 1,
      },
      {
        transform: "translateY(-1px)",
        "max-width": `${widthPercentage}`,
        height: "14px",
        opacity: 1,
      },
      {
        transform: "translateY(1px)",
        "max-width": `${widthPercentage}`,
        height: "14px",
        opacity: 1,
      },
    ];

    streakBar.animate(combinedKeyframes, {
      duration: 2,
      iterations: Infinity,
      easing: "ease-in-out",
    });
  } else {
    streakBar.style.maxWidth = "0%";
    globalStreakWidth = "30%";
  }
}

// function to startgame

async function startGame() {
  try {
    const response = await axios.get(apiUrl);
    refreshGame();
    toggleScoresVisibility();

    if (response.status === 200) {
      fetchedData = response.data;
      setTimeout(() => {
        randomWord();
        updateHint();
        showParagraphs();
      }, 20);
    } else {
      window.alert(`Failed to fetch data. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    window.alert("An error occurred while fetching data. Please try again.");
  }
}

//  event listener

// "Start Game" button
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

//  input letter

focusInput.addEventListener("click", () => {
  letterInput.focus();
});
// Add a touchstart event listener to the main_div
focusInput.addEventListener("touchstart", (event) => {
  // Prevent the default touchstart behavior to avoid unwanted side effects
  event.preventDefault();
  letterInput.focus();
});

// Add a touchend event listener to the document
document.addEventListener("touchend", (event) => {
  // Check if the touchend event occurred outside .main_div
  if (!event.target.closest(".main_div")) {
    letterInput.blur(); // Remove focus
  }
});
letterInput.addEventListener("keyup", (e) => {
  if (fetchedData !== null) {
    const pressedKey = e.key;

    // Check if the pressed key is a valid alphabet or hyphen
    if (/^[A-Za-z-]$/.test(pressedKey)) {
      singleInput(e);
    } else {
      // Handle invalid key (optional)
      console.log("Invalid key pressed:", pressedKey);
    }
  }
});
document.addEventListener("click", (event) => {
  // Check if the click event occurred outside .main_div
  if (!event.target.closest(".main_div")) {
    letterInput.blur(); // Remove focus
  }
});
document
  .querySelector(".scores")
  .addEventListener("click", toggleScoresVisibility);

//
