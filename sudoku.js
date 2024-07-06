var numSelected = null;
var tileSelected = null;

var BOARD_SIZE = 9;
var BOX_SIZE = 3;

var board = [
    "--74916-5",
    "2---6-3-9",
    "-----7-1-",
    "-586----4",
    "--3----9-",
    "--62--187",
    "9-4-7---2",
    "67-83----",
    "81--45---"
]

var solution = [
    "387491625",
    "241568379",
    "569327418",
    "758619234",
    "123784596",
    "496253187",
    "934176852",
    "675832941",
    "812945763"
]

window.onload = function() {
    setGame();
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
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);
    }

    // Board
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + ":" + c.toString();
            if(board[r][c] != "-") {
                tile.innerText = board[r][c];
                tile.classList.add("start-tile");
            }

            if(r == 2 || r == 5) {
                tile.classList.add("horizontal-line");
            }
            if(c == 2 || c == 5) {
                tile.classList.add("vertical-line");
            }

            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("board").appendChild(tile);
        }
    }
}

function selectNumber() {
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
        }
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