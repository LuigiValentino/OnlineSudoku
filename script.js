
document.addEventListener('DOMContentLoaded', () => {
    generateSudoku();
    startTimer();
});

const boardSize = 9;
let sudoku = [];
let originalSudoku = [];
let startTime;
let difficulty = 'medium'; 
function generateSudoku() {
    sudoku = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0));
    fillSudoku();
    originalSudoku = JSON.parse(JSON.stringify(sudoku)); 
    removeNumbersFromSudoku();
    renderSudoku();
}

function fillSudoku() {
    fillDiagonalBoxes();
    fillRemaining(0, 3);
}

function fillDiagonalBoxes() {
    for (let i = 0; i < boardSize; i += 3) {
        fillBox(i, i);
    }
}

function fillBox(row, col) {
    let num;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            do {
                num = randomNumber();
            } while (!isSafeInBox(row, col, num));
            sudoku[row + i][col + j] = num;
        }
    }
}

function randomNumber() {
    return Math.floor(Math.random() * boardSize) + 1;
}

function isSafeInBox(row, col, num) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (sudoku[row + i][col + j] === num) {
                return false;
            }
        }
    }
    return true;
}

function isSafe(row, col, num) {
    return !usedInRow(row, num) && !usedInCol(col, num) && isSafeInBox(row - row % 3, col - col % 3, num);
}

function usedInRow(row, num) {
    for (let col = 0; col < boardSize; col++) {
        if (sudoku[row][col] === num) {
            return true;
        }
    }
    return false;
}

function usedInCol(col, num) {
    for (let row = 0; row < boardSize; row++) {
        if (sudoku[row][col] === num) {
            return true;
        }
    }
    return false;
}

function fillRemaining(i, j) {
    if (j >= boardSize && i < boardSize - 1) {
        i++;
        j = 0;
    }
    if (i >= boardSize && j >= boardSize) {
        return true;
    }

    if (i < 3) {
        if (j < 3) {
            j = 3;
        }
    } else if (i < boardSize - 3) {
        if (j === Math.floor(i / 3) * 3) {
            j += 3;
        }
    } else {
        if (j === boardSize - 3) {
            i++;
            j = 0;
            if (i >= boardSize) {
                return true;
            }
        }
    }

    for (let num = 1; num <= boardSize; num++) {
        if (isSafe(i, j, num)) {
            sudoku[i][j] = num;
            if (fillRemaining(i, j + 1)) {
                return true;
            }
            sudoku[i][j] = 0;
        }
    }
    return false;
}

function removeNumbersFromSudoku() {
    let count;
    switch (difficulty) {
        case 'easy':
            count = 30;
            break;
        case 'medium':
            count = 40;
            break;
        case 'hard':
            count = 50;
            break;
    }

    while (count !== 0) {
        let cellId = randomCell();
        let i = Math.floor(cellId / boardSize);
        let j = cellId % boardSize;
        if (sudoku[i][j] !== 0) {
            count--;
            sudoku[i][j] = 0;
        }
    }
}

function randomCell() {
    return Math.floor(Math.random() * boardSize * boardSize);
}

function renderSudoku() {
    const board = document.getElementById('sudoku-board');
    board.innerHTML = '';
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            if (sudoku[i][j] !== 0) {
                cell.textContent = sudoku[i][j];
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = '1';
                input.pattern = "[1-9]";
                input.oninput = function() {
                    if (!this.checkValidity()) {
                        this.value = '';
                    }
                };
                cell.appendChild(input);
            }

            board.appendChild(cell);
        }
    }
}

function checkSolution() {
    const inputs = document.querySelectorAll('.cell input');
    let k = 0;
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (originalSudoku[i][j] === 0) {
                const value = parseInt(inputs[k].value) || 0;
                if (value < 1 || value > 9 || isNaN(value)) {
                    alert('Por favor ingresa un número válido entre 1 y 9 en todas las casillas.');
                    return;
                }
                sudoku[i][j] = value;
                k++;
            }
        }
    }

    if (isSolutionValid()) {
        alert('¡Felicidades! Has completado el Sudoku correctamente.');
    } else {
        alert('La solución es incorrecta. Inténtalo de nuevo.');
    }
}

function isSolutionValid() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (sudoku[i][j] === 0 || !isSafe(i, j, sudoku[i][j])) {
                return false;
            }
        }
    }
    return true;
}

function solveSudoku() {
    sudoku = JSON.parse(JSON.stringify(originalSudoku));
    fillRemaining(0, 0);
    renderSudoku();
}

function startTimer() {
    startTime = new Date();
    setInterval(updateTimer, 1000);
}

function updateTimer() {
    const now = new Date();
    const elapsedTime = Math.floor((now - startTime) / 1000);

    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');

    document.getElementById('time').textContent = `${minutes}:${seconds}`;
}

function giveHint() {
    const emptyCells = [];
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (originalSudoku[i][j] === 0 && sudoku[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        sudoku[randomCell.row][randomCell.col] = originalSudoku[randomCell.row][randomCell.col];
        renderSudoku();
    }
}

function resetGame() {
    generateSudoku();
    startTime = new Date();
}

function changeDifficulty() {
    const difficultySelect = document.getElementById('difficulty');
    difficulty = difficultySelect.value;
    resetGame();
}
