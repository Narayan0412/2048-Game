document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.querySelector('.grid');
    const gridSize = 4;
    let gameGrid = [];
    let playerScore = 0;
    const scoreDisplay = document.getElementById('current-score');

    let highestScore = localStorage.getItem('2048-bestScore') || 0;
    const highScoreDisplay = document.getElementById('high-score');
    highScoreDisplay.textContent = highestScore;

    const gameOverMessage = document.getElementById('game-over');

    function incrementScore(points) {
        playerScore += points;
        scoreDisplay.textContent = playerScore;
        if (playerScore > highestScore) {
            highestScore = playerScore;
            highScoreDisplay.textContent = highestScore;
            localStorage.setItem('2048-bestScore', highestScore);
        }
    }

    function resetGame() {
        playerScore = 0;
        scoreDisplay.textContent = '0';
        gameOverMessage.style.display = 'none';
        initializeGame();
    }
    
    function getRandomNumber(max) {
        return Math.floor(Math.random() * max);
    }

    function initializeGame() {
        gameGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
        let tileCount = getRandomNumber(3);
        for (let i = 0; i <= tileCount; i++) {
            placeRandomTile();
        }
        drawBoard();
    }

    function drawBoard() {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cell = document.querySelector(`[row="${row}"][col="${col}"]`);
                const previousValue = cell.dataset.value, currentValue = gameGrid[row][col];
                if (currentValue !== 0) {
                    cell.dataset.value = currentValue;
                    cell.textContent = currentValue;
                    if (currentValue !== parseInt(previousValue) && !cell.classList.contains('new-tile')) {
                        cell.classList.add('merged-tile');
                    }
                } else {
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('merged-tile', 'new-tile');
                }
            }
        }

        setTimeout(() => {
            const allCells = document.querySelectorAll('.cell');
            allCells.forEach(cell => {
                cell.classList.remove('merged-tile', 'new-tile');
            });
        }, 200);
    }

    function placeRandomTile() {
        const emptyCells = [];
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (gameGrid[row][col] === 0) {
                    emptyCells.push({ x: row, y: col });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            gameGrid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            const cell = document.querySelector(`[row="${randomCell.x}"][col="${randomCell.y}"]`);
            cell.classList.add('new-tile'); 
            cell.dataset.value = gameGrid[randomCell.x][randomCell.y];
            cell.textContent = gameGrid[randomCell.x][randomCell.y];
        }
    }

    function shiftTiles(direction) {
        let moved = false;
        if (direction === 'ArrowUp' || direction === 'ArrowDown') {
            for (let col = 0; col < gridSize; col++) {
                const column = Array.from({ length: gridSize }, (_, row) => gameGrid[row][col]);
                const newColumn = shiftLine(column, direction === 'ArrowUp');
                for (let row = 0; row < gridSize; row++) {
                    if (gameGrid[row][col] !== newColumn[row]) {
                        moved = true;
                        gameGrid[row][col] = newColumn[row];
                    }
                }
            }
        } else if (direction === 'ArrowLeft' || direction === 'ArrowRight') {
            for (let row = 0; row < gridSize; row++) {
                const line = gameGrid[row];
                const newLine = shiftLine(line, direction === 'ArrowLeft');
                if (line.join(',') !== newLine.join(',')) {
                    moved = true;
                    gameGrid[row] = newLine;
                }
            }
        }
        if (moved) {
            placeRandomTile();
            drawBoard();
            checkGameOver();
        }
    }

    const finalScoreDisplay = document.getElementById('final-score');

    function displayFinalScore(score) {
        finalScoreDisplay.textContent = 'You scored ' + score;
    }

    function shiftLine(line, shiftToStart) {
        let newLine = line.filter(cell => cell !== 0);
        if (!shiftToStart) {
            newLine.reverse();
        }
        for (let i = 0; i < newLine.length - 1; i++) {
            if (newLine[i] === newLine[i + 1]) {
                newLine[i] *= 2;
                incrementScore(newLine[i]);
                newLine.splice(i + 1, 1);
            }
        }
        while (newLine.length < gridSize) {
            newLine.push(0);
        }
        if (!shiftToStart) {
            newLine.reverse();
        }
        return newLine;
    }

    function checkGameOver() {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (gameGrid[row][col] === 0) {
                    return;
                }
                if (col < gridSize - 1 && gameGrid[row][col] === gameGrid[row][col + 1]) {
                    return; 
                }
                if (row < gridSize - 1 && gameGrid[row][col] === gameGrid[row + 1][col]) {
                    return; 
                }
            }
        }

        gameOverMessage.style.display = 'flex';
        displayFinalScore(playerScore);
    }

    document.addEventListener('keydown', event => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            shiftTiles(event.key);
        }
    });
    document.getElementById('restart-btn').addEventListener('click', resetGame);

    initializeGame();
});
