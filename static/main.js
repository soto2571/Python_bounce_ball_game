const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameOverScreen = document.getElementById('game-over-screen');
const restartButton = document.getElementById('restart-button');

let gameStarted = false;
let lastUpdate = 0;
let updateInterval = 1000 / 60; // 60 FPS

function drawBall(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.closePath();
}

function drawPlatform(x, y, width, height, color) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.fill();
    ctx.closePath();
}

function drawText(text, x, y, color = '#FFF') {
    ctx.fillStyle = color;
    ctx.font = '20px Arial';
    ctx.fillText(text, x, y);
}

function updateGame() {
    fetch('/game_state')
        .then(response => response.json())
        .then(data => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawBall(data.ball_pos[0], data.ball_pos[1], 20);
            drawPlatform(data.platform_pos[0], data.platform_pos[1], 100, 10, data.platform_color);

            drawText(`Score: ${data.score}`, 10, 20);
            drawText(`Lives: ${data.lives}`, 110, 20);
            drawText(`Level: ${data.current_level}`, 210, 20);

            if (data.game_status === 'game_over') {
                gameOverScreen.style.display = 'block';  // Show game over screen
                canvas.style.display = 'none';  // Hide canvas
            } else {
                setTimeout(() => requestAnimationFrame(updateGame), updateInterval);
            }
        });
}

function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';
    gameStarted = true;
    updateGame();
}

function restartGame() {
    fetch('/restart_game', { method: 'POST' })
        .then(() => {
            gameOverScreen.style.display = 'none';  // Hide game over screen
            startScreen.style.display = 'none';     // Hide start screen if it's visible
            canvas.style.display = 'block';         // Show canvas
            gameStarted = true;                     // Set gameStarted to true
            updateGame();                          // Restart the game
        });
}

document.addEventListener('keydown', (event) => {
    if (!gameStarted) {
        startGame();
    } else if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const direction = event.key === 'ArrowLeft' ? 'left' : 'right';
        fetch('/game_state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ direction: direction })
        });
    }
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);