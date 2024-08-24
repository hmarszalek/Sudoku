var numSelected = null;
var tileSelected = null;
var digitsLeft;
var startTime;
var isGamePaused = false;
var isGameOver = true;
var timePlayed;
var pauseTime = 0;
let digitUsage = new Array(10);

const isMobile = window.screen.width <= 768;

var BOARD_SIZE = 9;
var BOX_SIZE = 3;

window.onload = function() {
    prepareBoard();
    newGame(10);

    // Delete later
    const newGameTempBtn = document.getElementById('temp'); 
    newGameTempBtn.addEventListener('click', function() {
        newGame(1);
    });


    // New game buttons
    const newGameEasyBtn = document.getElementById('easy');
    const newGameMediumBtn = document.getElementById('medium');
    const newGameHardBtn = document.getElementById('hard');
    newGameEasyBtn.addEventListener('click', function() {
        newGame(Math.floor(Math.random() * 8 + 1) + 35);
        if(isMobile) {
            toggleMenu();
        }
    });
    newGameMediumBtn.addEventListener('click', function() {
        newGame(Math.floor(Math.random() * 8 + 1) + 45);
        if(isMobile) {
            toggleMenu();
        }
    });
    newGameHardBtn.addEventListener('click', function() {
        newGame(Math.floor(Math.random() * 5 + 1) + 45);
        // newGame(Math.floor(Math.random() * 5 + 1) + 55);
        if(isMobile) {
            toggleMenu();
        }
    });

    // Special buttons
    const eraseButton = document.getElementById('erase-btn');
    eraseButton.addEventListener("click", function() { selectNumber('erase-btn'); });

    // Toggle menu button
    document.getElementById('options-toggle').addEventListener('click', function() {
        toggleMenu();
    });

    // Pause game
    const pauseButton = document.getElementById('pause-btn');
    pauseButton.addEventListener('click', function() {
        pauseResume();
    });

    // Open popup window
    const popup = document.querySelector('.popup');
    document.addEventListener('gameWon', function() {
        pauseGame();
        isGameOver = true;
        popup.querySelector('.time-played').innerText = "Time played: " + document.getElementById("clock").innerText;
        popup.classList.add("show");
        deselectAll();
    });

    // Close popup window
    const closeButton = document.querySelector('.close');
    const myPopup = document.querySelector('.popup'); 
    closeButton.addEventListener('click', function() {
        myPopup.classList.remove("show");
    });
}

function toggleMenu() {
    document.getElementById('options').classList.toggle('open');
    pauseResume();
}

function pauseResume() {
    if (isGamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function prepareBoard() {
    // Digits
    for (let i = 1; i <= 9; i++) {
        let number = document.createElement("div");
        number.id = i
        number.innerText = i;
        number.addEventListener("click", function() { selectNumber(i.toString()); });
        number.classList.add("number", "prevent-text-select");
        document.getElementById("digits").appendChild(number);
    }

    // Board
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + ":" + c.toString();
            if(r == 2 || r == 5) {
                tile.classList.add("horizontal-line");
            }
            if(c == 2 || c == 5) {
                tile.classList.add("vertical-line");
            }
            tile.addEventListener("click", selectTile);
            tile.classList.add("tile", "prevent-text-select");
            document.getElementById("board").appendChild(tile);
        }
    }
}

function newGame(removedDigits) {
    // Digit Usage
    digitUsage.fill(9);
    digitUsage[0] = 1000;

    // Generate board
    let sudoku = new Sudoku(removedDigits)
    solution = sudoku.solution;
    board = sudoku.board;
    
    deselectAll();  // Deselect selected elements
    resetTimer(); // Set the game timer

    if(isMobile) {
        pauseGame();
    }

    console.log(digitUsage);
    updateDigitUsageClasses();

    // Board
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.getElementById(r.toString() + ":" + c.toString());
            tile.innerText = "";
            tile.classList.remove("start-tile");
            if(board[r][c] != 0) {
                tile.innerText = board[r][c];
                tile.classList.add("start-tile");
            }
        }
    }

    digitsLeft = removedDigits;
}

// ------------------------------------ Tile and number logic --------------------------------

function deselectAll() {
    if(numSelected != null) {
        numSelected.classList.remove("number-selected");
        numSelected = null;
    }
    if(tileSelected != null) {
        tileSelected.classList.remove("tile-selected");
        tileSelected = null;
    }
}

function selectNumber(numberId) {
    // console.log("selected number");
    if(isGamePaused || digitUsage[parseInt(numberId)] === 9) {
        return;
    }

    if(tileSelected) {
        actionChosen(numberId, tileSelected);
    }
    else {
        selectNewDigit(numberId);
    }
}

function selectTile() {
    if(isGamePaused || this.classList.contains("start-tile")) {
        return;
    }

    if(numSelected) {
        actionChosen(numSelected.id, this);
    } else {
        selectNewTile(this);
    }
}

// Keyboard
document.addEventListener('keydown', function(event) {
    if(isGamePaused) {
        return;
    }
    if (parseInt(event.key) >= 1 && parseInt(event.key) <= 9) {
        selectNumber(event.key);
    }
});

function selectNewTile(tile) {
    if(tileSelected != null) {
        tileSelected.classList.remove("tile-selected");
        if(tileSelected === tile) {
            tileSelected = null;
            return;
        }
    }
    tileSelected = tile;
    tileSelected.classList.add("tile-selected");
}

function selectNewDigit(numberId) {
    // console.log("select new digit");

    if(numSelected != null) {
        numSelected.classList.remove("number-selected");
        if(numSelected.id === numberId) {
            numSelected = null;
            return;
        }
    }
    numSelected = document.getElementById(numberId);
    numSelected.classList.add('number-selected');   
}

function removeSameDigit(row, col, number, tile) {
    // console.log("remove same digit");
    board[row][col] = 0;
    tile.innerText = "";
    digitsLeft++;
    digitUsage[number]--;
}

function addNewDigit(row, col, number, tile) {
    // console.log("add new digit");
    if(board[row][col] === 0) {
        digitsLeft--;
    } else {
        digitUsage[board[row][col]]--;
    }

    if(number === 0) {
        tile.innerText = "";
    } else {
        tile.innerText = number.toString();
        digitUsage[number]++;
    }

    board[row][col] = number;

    // Check if digitsLeft equals zero
    if(digitsLeft === 0) {
        boardFilledUp();
    }
}

function actionChosen(numberId, tile) {
    // console.log("action chosen");
    let coords = tile.id.split(":");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    if(numberId === "erase-btn") {
        numberId = "0";
    }

    if(numberId === tile.innerText) {
        removeSameDigit(r, c, parseInt(numberId), tile);
    }
    else {
        addNewDigit(r, c, parseInt(numberId), tile);
    }
    updateDigitUsageClasses();
    console.log(digitUsage);
}

// Segregate used up digits
function updateDigitUsageClasses() {
    for (let i = 1; i <= 9; i++) {
        const numberElement = document.getElementById(i);
        if (digitUsage[i] === 9) {
            numberElement.classList.add('number-used');
            numberElement.classList.remove('number-selected');
            if(numSelected != null && numSelected.id === i.toString()) {
                numSelected = null;
            }
        } else {
            numberElement.classList.remove('number-used');
        }
    }
}

// Maybe fix the comparison?
function boardFilledUp() {
    const solutionNumbers = solution.map(row => row.split('').map(Number));
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] !== solutionNumbers[i][j]) {
                console.log(`Mismatch at row ${i}, col ${j}: board=${board[i][j]}, solution=${solutionNumbers[i][j]}`);
                return;
            }
        }
    }

    document.dispatchEvent(new Event('gameWon'));
}

// -------------------------------------------------------------------------------------------

// ------------------------------------------- Timer logic -----------------------------------
function setTimer() {
    var now = new Date().getTime();
    var distance = now - startTime;
    
    // Time calculations for days, hours, minutes and seconds
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
    if(seconds < 10)
        seconds = "0" + seconds;
    if(minutes < 10)
        minutes = "0" + minutes;
    
    // Output the result in an element with id="demo"
    if(hours > 0) {
        document.getElementById("clock").innerHTML = hours + ":" + minutes + ":" + seconds;
    } else {
        document.getElementById("clock").innerHTML = minutes + ":" + seconds;
  }
}

function resetTimer() {
    isGameOver = false;
    if(isGamePaused) {
        resumeGame(); // Unpause the game if ended paused
    }
    document.getElementById("clock").innerHTML = "00:00";
    clearInterval(timePlayed); // Stop the previous timer
    startTime = new Date().getTime(); // Reset the start time
    timePlayed = setInterval(function() {
        setTimer();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timePlayed); // Stop the timer
    pauseTime = new Date().getTime(); // Record the pause time
}

function resumeTimer() {
    var now = new Date().getTime();
    var pauseDuration = now - pauseTime; // Calculate the pause duration
    startTime += pauseDuration; // Update the start time
    timePlayed = setInterval(function() {
        setTimer();
    }, 1000); // Resume the timer
}

// -------------------------------------------------------------------------------------------

// --------------------------------- Game pausing logic --------------------------------------

function pauseGameIcons() {
    const pauseIcon = document.getElementById('pause-icon');
    const playIcon = document.getElementById('play-icon');
    pauseIcon.classList.add('paused');
    pauseIcon.classList.remove('resumed');
    playIcon.classList.add('paused');
    playIcon.classList.remove('resumed');
}

function resumeGameIcons() {
    const pauseIcon = document.getElementById('pause-icon');
    const playIcon = document.getElementById('play-icon');
    pauseIcon.classList.remove('paused');
    pauseIcon.classList.add('resumed');
    playIcon.classList.remove('paused');
    playIcon.classList.add('resumed');
}

function pauseGame() {
    if(isGameOver) {
        return;
    }
    isGamePaused = true;
    deselectAll();  // Deselect selected elements
    pauseTimer();
    pauseGameIcons();
}

function resumeGame() {
    if(isGameOver) {
        return;
    }
    isGamePaused = false;
    resumeTimer();
    resumeGameIcons();
}
// ------------------------------------- Sudoku Class ----------------------------------------

class Sudoku {
    constructor(removedDigits) {
        this.removedDigits = removedDigits;
        this.board = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(0))
        this.solution = Array(BOARD_SIZE);

        this.fillSudoku();
        for(let i = 0; i < BOARD_SIZE; i++) {
            this.solution[i] = (this.board[i]).join('');
        }
        this.removeDigits();
    }

    fillSudoku() {
        this.fillDiagonalBoxes();
        this.fillRemainingBoxes(0, BOX_SIZE);
    }

    fillDiagonalBoxes() {
        // For each box on a diagonal
        for(let rc = 0; rc < BOARD_SIZE; rc += BOX_SIZE) {
            // Fill it randomly
            this.fillBox(rc, rc);
        }
    }

    fillRemainingBoxes(row, col) {
        // If we are at the end of board - return
        if (row === BOARD_SIZE - 1 && col === BOARD_SIZE) {
            return true;
        }
    
        // When reached the end of row move to the next one
        if (col === BOARD_SIZE) {
            row += 1;
            col = 0;
        }
    
        // Skip cells that are already filled
        if (this.board[row][col] !== 0) {
            return this.fillRemainingBoxes(row, col + 1);
        }
    
        // Try filling the current cell with a valid value
        for (let num = 1; num <= BOARD_SIZE; num++) {
            if (this.isValidNumber(row, col, num)) {
                this.board[row][col] = num;
                if (this.fillRemainingBoxes(row, col + 1)) {
                    return true;
                }
                this.board[row][col] = 0;
            }
        }
    
        // No valid value was found, so backtrack
        return false;
    }

    fillBox(row, col) {
        let num = 0;
        for (let i = 0; i < BOX_SIZE; i++) {
            for (let j = 0; j < BOX_SIZE; j++) {
                while (true) {
                    num = Math.floor(Math.random() * BOARD_SIZE + 1);
                    if (!this.isUsedInBox(row, col, num)) {
                        break;
                    }
                }
                this.board[row + i][col + j] = num;
            }
        }
    }

    // Check if given number is used in box [row,col]x[row+3,col+3]
    isUsedInBox(row, col, num) {
        for (let i = 0; i < BOX_SIZE; i++) {
            for (let j = 0; j < BOX_SIZE; j++) {
                if (this.board[row + i][col + j] === num) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if given number is used in given row
    isUsedInRow(row, num) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (this.board[row][col] === num) {
                return true;
            }
        }
        return false;
    }

    // Check if given number is used in given column
    isUsedInCol(col, num) {
        for (let row = 0; row < BOARD_SIZE; row++) {
            if (this.board[row][col] === num) {
                return true;
            }
        }
        return false;
    }

    // Check if safe to put in cell
    isValidNumber(i, j, num) {
        return (
            !this.isUsedInRow(i, num) &&
            !this.isUsedInCol(j, num) &&
            !this.isUsedInBox(i - (i % BOX_SIZE), j - (j % BOX_SIZE), num)
        );
    }

    // Remove given number of digits
    removeDigits() {
        let count = this.removedDigits;

        while (count !== 0) {
            // extract coordinates i and j
            let row = Math.floor(Math.random() * BOARD_SIZE);
            let col = Math.floor(Math.random() * BOARD_SIZE);
            if (this.board[row][col] !== 0) {
                let temp = this.board[row][col];
                this.board[row][col] = 0;
                if (this.isUniquelySolvable(this.board)) {
                    digitUsage[temp]--;
                    count--;
                } else {
                    this.board[row][col] = temp;
                }
            }
        }

        return;
    }

    isUniquelySolvable(board) {
        let solutions = 0;
        let tempBoard = board.map(row => row.slice()); // Create a copy of the board
    
        function solveBoard() {
            for (let i = 0; i < 81; i++) {
                let row = Math.floor(i / 9);
                let col = i % 9;
                if (tempBoard[row][col] == 0) {
                    for (let value = 1; value <= 9; value++) {
                        if (isValidNumber(row, col, value)) {
                            tempBoard[row][col] = value;
                            solveBoard();
                            tempBoard[row][col] = 0;
                        }
                    }
                    return;
                }
            }
            solutions++;
        }
    
        // fix outside isValidNumber to take a board as an argument
        function isValidNumber(row, col, num) {
            // Check the row
            for (let i = 0; i < 9; i++) {
                if (tempBoard[row][i] == num) {
                    return false;
                }
            }
    
            // Check the column
            for (let i = 0; i < 9; i++) {
                if (tempBoard[i][col] == num) {
                    return false;
                }
            }
    
            // Check the box
            let boxRow = Math.floor(row / 3) * 3;
            let boxCol = Math.floor(col / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (tempBoard[boxRow + i][boxCol + j] == num) {
                        return false;
                    }
                }
            }
    
            return true;
        }
    
        solveBoard();
        return solutions == 1;
    }
    
}