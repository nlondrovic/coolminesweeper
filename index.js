const DEBUGMODE = false;
const rows = 10;
const cols = 10;
const mineCount = 10;
const boardElement = document.querySelector('#board');
const actionBtn = document.querySelector('#actionBtn');
const flagCounter = document.querySelector('#flagCounter');
const timeCounter = document.querySelector('#timeCounter');
const timerInterval = setInterval(timer, 1000);
var board = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

var timeElapsed = 0;
var gameStarted = false;
var flaggedCount = 0;

class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.revealed = false;
		this.mine = false;
		this.flagged = false;
	}

	reveal() {
		if (!gameStarted) {
			gameStarted = true;
			if (this.mine) {
				this.mine = false;
				pickRandomMine();
			}
		}

		if (this.revealed) return;
		if (this.flagged) return;

		this.revealed = true;
		var cellElement = document.querySelector(`#cell-${this.x}-${this.y}`);

		if (this.mine) {
			cellElement.classList.add('bg-mine', 'bg-red', 'revealed');
			boardElement.classList.add('inactive-board');
			actionBtn.classList.add('bg-face-lose');
			gameStarted = false;
			revealMines('bg-mine');
			stopTimer();
			return;
		}
		cellElement.classList.add(`bg-num${this.neighborCount}`, 'revealed');

		if (this.neighborCount == 0)
			floodFill(this, cellElement);

		checkGame();
	}

	countNeighbors() {
		this.neighborCount = 0;

		for (let k = -1; k <= 1; k++)
			for (let l = -1; l <= 1; l++)
				if (this.x + k >= 0 &&
					this.x + k < rows &&
					this.y + l >= 0 &&
					this.y + l < cols &&
					(k != 0 || l != 0))
					if (board[this.x + k][this.y + l].mine)
						this.neighborCount++;
	}

	toggleFlagged(target) {
		target.classList.toggle('bg-flag');

		if (this.flagged) {
			this.flagged = false;
			flaggedCount--;
		} else {
			this.flagged = true;
			flaggedCount++;
		}
		flagCounter.innerHTML = mineCount - flaggedCount;
		checkGame();
	}
}

function main() {
	boardElement.classList.remove('inactive-board');
	actionBtn.classList.remove('bg-face-lose');
	actionBtn.classList.remove('bg-face-win');
	actionBtn.classList.add('bg-smiley');
	boardElement.innerHTML = '';
	flagCounter.innerHTML = mineCount;
	timeCounter.innerHTML = '000';
	timeElapsed = 0;
	flaggedCount = 0;
	gameStarted = false;

	fillBoardVariables();
	pickRandomMines();
	setNeighborCountValues();
	fillCanvas();
	addEventListenersToCells();
	if (DEBUGMODE)
		revealBoard();
}

function fillBoardVariables() {
	for (let i = 0; i < rows; i++)
		for (let j = 0; j < cols; j++) {
			board[i][j] = new Cell(i, j);
			board[i][j].revealed = DEBUGMODE;
		}
}

function pickRandomMines() {
	for (let i = 0; i < mineCount; i++)
		pickRandomMine();
}

function pickRandomMine() {
	var x = Math.floor(Math.random() * rows);
	var y = Math.floor(Math.random() * cols);
	if (board[x][y].mine)
		return pickRandomMine();

	board[x][y].mine = true;
}

function setNeighborCountValues() {
	for (let i = 0; i < rows; i++)
		for (let j = 0; j < cols; j++)
			board[i][j].countNeighbors();
}

function fillCanvas() {
	for (let i = 0; i < rows; i++) {
		var row = document.createElement('div');
		boardElement.appendChild(row);
		row.className = 'row';
		for (let j = 0; j < cols; j++) {
			var cell = document.createElement('div');
			cell.className = 'cell';
			cell.id = `cell-${j}-${i}`;
			cell.setAttribute('x', j);
			cell.setAttribute('y', i);
			row.appendChild(cell);
		}
	}
}

function addEventListenersToCells() {
	document.querySelectorAll('.cell').forEach(item => {
		item.addEventListener('mouseup', e => {
			e.preventDefault();

			var x = e.target.getAttribute('x');
			var y = e.target.getAttribute('y');
			var cell = board[x][y];

			if (e.which == 3 && !cell.revealed)
				cell.toggleFlagged(e.target);
			else
				cell.reveal();
		}, false);
	});

	document.querySelectorAll('.cell').forEach(item => {
		item.addEventListener("contextmenu", e => e.preventDefault());
	});
}

function floodFill(cell) {
	for (let k = -1; k <= 1; k++) {
		for (let l = -1; l <= 1; l++) {
			if (cell.x + k >= 0 &&
				cell.x + k < rows &&
				cell.y + l >= 0 &&
				cell.y + l < cols &&
				(k != 0 || l != 0)) {
				var neighborCell = board[cell.x + k][cell.y + l];

				if (neighborCell.mine)
					continue;

				if (!neighborCell.revealed) {
					if (neighborCell.neighborCount == 0)
						neighborCell.reveal();
					else
						neighborCell.reveal();
				}
			}
		}
	}
}

function revealMines(background) {
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			var cell = board[i][j];
			var element = document.querySelector(`#cell-${i}-${j}`);
			if (cell.mine) {
				element.classList.add(background);
				if (background == 'bg-mine')
					element.classList.add('revealed');
			}
		}
	}
}

function timer() {
	if (gameStarted) {
		timeElapsed++;
		timeCounter.innerHTML = timeElapsed;
	}
}

function stopTimer() {
	clearInterval(timerInterval);
}

function revealBoard() {
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			var cell = board[i][j];
			var element = document.querySelector(`#cell-${i}-${j}`);

			if (cell.revealed) {
				if (cell.mine)
					element.classList.add('bg-mine');
				else
					element.classList.add(`bg-num${cell.neighborCount}`);
			}
		}
	}
}

function checkGame() {
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			var cell = board[i][j];
			// var element = document.querySelector(`#cell-${i}-${j}`);

			if (!cell.mine && !cell.revealed)
				return;
		}
	}
	return gameWon();
}

function gameWon() {
	boardElement.classList.add('inactive-board');
	actionBtn.classList.add('bg-face-win');
	gameStarted = false;
	revealMines('bg-flag');
	stopTimer();
}

main();
