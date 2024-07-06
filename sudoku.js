var numSelected = null;
var tileSelected = null;
var digitsLeft;
var startTime;

var BOARD_SIZE = 9;
var BOX_SIZE = 3;

window.onload = function() {
    setGame();

    // Delete later
    const newGameTempBtn = document.getElementById('temp'); 
    newGameTempBtn.addEventListener('click', function() {
        newBoard(1);
    });


    const newGameEasyBtn = document.getElementById('easy');
    const newGameMediumBtn = document.getElementById('medium');
    const newGameHardBtn = document.getElementById('hard');
    newGameEasyBtn.addEventListener('click', function() {
        newBoard(Math.floor(Math.random() * 8 + 1) + 35);
    });
    newGameMediumBtn.addEventListener('click', function() {
        newBoard(Math.floor(Math.random() * 8 + 1) + 45);
    });
    newGameHardBtn.addEventListener('click', function() {
        newBoard(Math.floor(Math.random() * 5 + 1) + 55);
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

function newBoard(removedDigits) {
    // Generate board
    let sudoku = new Sudoku(removedDigits)
    solution = sudoku.solution;
    board = sudoku.board;
    
    deselectAll();

    // Set the game timer
    startTime = new Date().getTime();
    var timePlayed = setInterval(function() {
        setTimer();
    }
    );

    // Board
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.getElementById(r.toString() + ":" + c.toString());
            tile.innerText = "";
            tile.classList.remove("start-tile");
            if(board[r][c] != "-") {
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
    if(tileSelected) {
        if(tileSelected.innerText != "") {
            return;
        }

        let coords = tileSelected.id.split(":");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if(solution[r][c] == this.id) {
            tileSelected.innerText = this.id
            digitsLeft--;

            // Check if digitsLeft equals zero
            if(digitsLeft === 0) {
                document.dispatchEvent(new Event('gameWon'));
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
    if(numSelected) {
        if(this.innerText != "") {
            return;
        }

        let coords = this.id.split(":");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if(solution[r][c] == numSelected.id) {
            this.innerText = numSelected.id
            digitsLeft--;

            // Check if digitsLeft equals zero
            if(digitsLeft === 0) {
                document.dispatchEvent(new Event('gameWon'));
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

    // Remove given nomber of digits
    removeDigits() {
        let count = this.removedDigits;

        while (count !== 0) {
            // extract coordinates i and j
            let row = Math.floor(Math.random() * BOARD_SIZE);
            let col = Math.floor(Math.random() * BOARD_SIZE);
            if (this.board[row][col] !== '-') {
                this.board[row][col] = '-';
                count--;
            }
        }

        return;
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