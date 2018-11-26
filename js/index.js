const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");

const gameWidth = gameCanvas.width;
const gameHeight = gameCanvas.height;
const gameBorderColour = "#1c1c1f";
const gameBgColour = "#eeeeee";
const snakeColour = "lightgreen";
const snakeBorderColour = "darkgreen";
const foodColour = "red";
const foodBorderColour = "darkred";
const startPosition = {'x': 150, 'y': 200};
const tile = 10;

let snake = [];
let foodX;
let foodY;
let dx = 10;
let dy = 0;
let score = 0;
let gameSpeed = 150;
let gameFinished = false;
let changingDirections = false;
let isPaused = false;
let gameLoop;

document.addEventListener("keydown", changeDirection);
	
makeFood();
newGame();

function newGame() {
	snake = [];
	currentPosition = startPosition;
	snakeLength = 4;
	gameFinished = false;

	snakePosition();
	startGame();
}

function startGame() {
	if (didGameEnd()) return gameOver();

	gameLoop = setTimeout(function() {
		changingDirection = false;
		drawBoard();
		drawFood();
		moveSnake();
		drawSnake();
		startGame();
	}, gameSpeed);
}

function restartGame() {
	snake = [];
	snakeLength = 4;
	currentPosition = startPosition;
	snakePosition();
	drawBoard();
	moveRight();

	if (!didGameEnd()) {
		makeFood();
		newGame();
	}
}

function resumeGame() {
	isPaused = false;
	setTimeout(startGame(), gameSpeed);
}

function pauseGame() {
	isPaused = true;
	clearTimeout(gameLoop);

	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
	ctx.fillRect(0, 0, gameWidth, gameHeight);

	ctx.fillStyle = 'white';
	ctx.font = '30pt monospace';
	ctx.textAlign = 'center';
	ctx.fillText('PAUSED', 300, 200);

	ctx.closePath();
}

function gameOver() {
	clearTimeout(gameLoop);
	gameFinished = true;
	
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
	ctx.fillRect(0, 0, gameWidth, gameHeight);
	
	ctx.fillStyle = 'white';
	ctx.font = '30pt monospace';
	ctx.textAlign = 'center';
	ctx.fillText('GAME OVER', 300, 200);

	ctx.font = 'italic 12pt arial';
	ctx.fillText('Hit S to start again', 300, 235);
	ctx.closePath();
	ctx.restore();
}

function drawBoard() {
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = gameBgColour;
	ctx.strokeStyle = gameBorderColour;

	ctx.fillRect(0, 0, gameWidth, gameHeight);
	ctx.strokeRect(0, 0, gameWidth, gameHeight);
	ctx.closePath();
}

function drawSnakePart(snakePart) {
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = snakeColour;
	ctx.strokeStyle = snakeBorderColour;
	ctx.fillRect(snakePart.x, snakePart.y, tile, tile);
	ctx.strokeRect(snakePart.x, snakePart.y, tile, tile);
	ctx.closePath();
}

function drawFood() {
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = foodColour;
	ctx.strokeStyle = foodBorderColour;
	ctx.fillRect(foodX, foodY, tile, tile);
	ctx.strokeRect(foodX, foodY, tile, tile);
	ctx.closePath();
}

function snakePosition() {
	let x = currentPosition['x'];
	let y = currentPosition['y'];
	let head = snake.push({x: x, y: y}); 
	
	for (var i = 0; i < snakeLength; i++) {
		x -= 10
		snake.push({
			x: x,
			y: y
		});
	}
}

function drawSnake() {
	snake.forEach(drawSnakePart);
}

function moveSnake() {

	let head = {x: snake[0].x + dx, y: snake[0].y + dy};

	snake.unshift(head);
	
	const ateFood = snake[0].x === foodX && snake[0].y === foodY;

	if (ateFood) {
		score += 10;
		gameSpeed -= 5;

		updateScore();
		makeFood();
	} else {
		snake.pop();
	}
}

function updateScore() {
	document.getElementById('score').innerHTML = score;
}

function random(min, max) {
	return Math.round((Math.random() * (max-min) + min) / tile) * tile;
}

function makeFood() {
	foodX = random(0, gameWidth - tile);
	foodY = random(0, gameHeight - tile);

	snake.forEach(function isFoodOnSnake(snakePart) {
		const foodIsOnSnake = snakePart.x == foodX && snakePart.y == foodY;

		if (foodIsOnSnake) {
			makeFood();
		}
	});
}

function didGameEnd() {
	for (let i = 4; i < snake.length; i++) {
		const didCollide = snake[i].x === snake[0].x && snake[i].y === snake[0].y
		if (didCollide) return true;
	}

	const hitLeftWall = snake[0].x < 0;
	const hitRightWall = snake[0].x > gameWidth - tile;
	const hitTopWall = snake[0].y < 0;
	const hitBottomWall = snake[0].y > gameHeight - tile;

	return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall
}

function moveLeft() {
	dx = -tile;
	dy = 0;
}

function moveUp() {
	dx = 0;
	dy = -tile;
}

function moveRight() {
	dx = tile;
	dy = 0;
}

function moveDown() {
	dx = 0;
	dy = tile;
}

function changeDirection(event) {
	let keyPressed;

	const goingUp = dy === -tile;
	const goingDown = dy === tile;
	const goingRight = dx === tile;
	const goingLeft = dx === -tile;

	if (event == null) {
		keyPressed = window.event.keyCode;
	} else {
		keyPressed = event.keyCode;
	}

	switch(keyPressed) {
		case 37:
			if (!goingRight) {
				moveLeft();
			}
			break;
		case 38: 
			if (!goingDown) {
				moveUp();
			}
			break;
		case 39:
			if (!goingLeft) {
				moveRight();
			}
			break;
		case 40: 
			if (!goingUp) {
				moveDown();
			}
			break;
		case 32:
			if (gameFinished) {
				return;
			} else {
				if (isPaused) {
					resumeGame();
				} else {
					pauseGame();
				}
			}
			break;
		case 83:
			if (gameFinished) {
				restartGame();
			}
			break;
		default:
			break;
	}
}