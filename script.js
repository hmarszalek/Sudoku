var numSelected = null;
var tileSelected = null;
var digitsLeft;
var startTime;
var isGamePaused = false;
var timePlayed;
var pauseTime = 0;

var BOARD_SIZE = 9;
var BOX_SIZE = 3;

window.onload = function() {
    setGame();
    newGame(30);

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
    });
    newGameMediumBtn.addEventListener('click', function() {
        newGame(Math.floor(Math.random() * 8 + 1) + 45);
    });
    newGameHardBtn.addEventListener('click', function() {
        newGame(Math.floor(Math.random() * 5 + 1) + 45);
        // newGame(Math.floor(Math.random() * 5 + 1) + 55);
    });

    // Pause game
    const pauseButton = document.getElementById('pause-btn');
    pauseButton.addEventListener('click', function() {
        if (isGamePaused) {
            resumeGame(pauseButton);
        } else {
            pauseGame(pauseButton)
        }
    });

    // Close popup window
    const closeButton = document.querySelector('.close');
    const myPopup = document.querySelector('.popup'); 
    closeButton.addEventListener('click', function() {
        myPopup.classList.remove("show");
    });
}

function setGame() {
    // Generate board
    let sudoku = new Sudoku(40)
    solution = sudoku.solution;
    board = sudoku.board;

    // Digits
    for (let i = 1; i <= 9; i++) {
        let number = document.createElement("div");
        number.id = i
        number.innerText = i;
        number.addEventListener("click", selectNumber);
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
    // Generate board
    let sudoku = new Sudoku(removedDigits)
    solution = sudoku.solution;
    board = sudoku.board;
    
    deselectAll();

    // Unpause - FIX
    isGamePaused = false; // Reset the pause state
    const pauseIcon = document.getElementById('pause-icon');
    const playIcon = document.getElementById('play-icon');
    pauseIcon.classList.remove('paused');
    pauseIcon.classList.add('resumed');
    playIcon.classList.remove('paused');
    playIcon.classList.add('resumed');

    // Set the game timer
    resetTimer();
    clearInterval(timePlayed); // Stop the previous timer
    startTime = new Date().getTime(); // Reset the start time
    timePlayed = setInterval(function() {
        setTimer();
    }, 1000);

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

    // Add event listener to check when digitsLeft equals zero
    digitsLeft = removedDigits;
    const popup = document.querySelector('.popup');
    document.addEventListener('gameWon', function() {
        clearInterval(timePlayed); // Stop the clock
        popup.querySelector('.time-played').innerText = "Time played: " + document.getElementById("clock").innerText;
        popup.classList.add("show");
        deselectAll();
    });
}

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

function selectNumber() {
    if(isGamePaused) {
        return;
    }

    if(tileSelected) {
        if(tileSelected.classList.contains("start-tile")) {
            return;
        }

        let coords = tileSelected.id.split(":");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if(tileSelected.innerText === this.id) {
            // remove the same digit
            board[r][c] = 0;
            tileSelected.innerText = "";
            digitsLeft++;
        }
        else {
            // add new digit
            if(tileSelected.innerText === "") {
                digitsLeft--;
            }
    
            tileSelected.innerText = this.id;
            board[r][c] = parseInt(this.id);
    
    
            // Check if digitsLeft equals zero
            if(digitsLeft === 0) {
                boardFilledUp();
            }
        }
    }
    else {
        if(numSelected != null) {
            numSelected.classList.remove("number-selected");
            if(numSelected == this) {
                numSelected = null;
                return;
            }
        }

        numSelected = this;
        numSelected.classList.add("number-selected");
    }
}

function selectTile() {
    if(isGamePaused) {
        return;
    }

    if(numSelected) {
        if(this.classList.contains("start-tile")) {
            return;
        }

        let coords = this.id.split(":");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if(this.innerText === numSelected.id) {
            // remove the same digit
            board[r][c] = 0;
            this.innerText = "";
            digitsLeft++;
        }
        else {
            // add new digit
            if(this.innerText === "") {
                digitsLeft--;
            }
    
            this.innerText = numSelected.id;
            board[r][c] = parseInt(numSelected.id);
    
            // Check if digitsLeft equals zero
            if(digitsLeft === 0) {
                boardFilledUp();
            }
        }
    } else {
        if(this.classList.contains("start-tile")) {
            return;
        }

        if(tileSelected != null) {
            tileSelected.classList.remove("tile-selected");
            if(tileSelected == this) {
                tileSelected = null;
                return;
            }
        }

        tileSelected = this;
        tileSelected.classList.add("tile-selected");
    }
}

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

// Timer logic
function resetTimer() {
    document.getElementById("clock").innerHTML = "00:00";
    clearInterval(timePlayed);
    startTime = new Date().getTime();
    timePlayed = setInterval(function() {
        setTimer();
    }, 1000);
}

// Game pausing logic
function pauseGame(pauseButton) {
    const pauseIcon = document.getElementById('pause-icon');
    const playIcon = document.getElementById('play-icon');
    pauseIcon.classList.add('paused');
    pauseIcon.classList.remove('resumed');
    playIcon.classList.add('paused');
    playIcon.classList.remove('resumed');
    
    isGamePaused = true;
    clearInterval(timePlayed); // Stop the timer
    pauseTime = new Date().getTime(); // Record the pause time
}

function resumeGame(pauseButton) {
    const pauseIcon = document.getElementById('pause-icon');
    const playIcon = document.getElementById('play-icon');
    pauseIcon.classList.remove('paused');
    pauseIcon.classList.add('resumed');
    playIcon.classList.remove('paused');
    playIcon.classList.add('resumed');

    isGamePaused = false;
    var now = new Date().getTime();
    var pauseDuration = now - pauseTime; // Calculate the pause duration
    startTime += pauseDuration; // Update the start time
    timePlayed = setInterval(function() {
        setTimer();
    }, 1000); // Resume the timer
}

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