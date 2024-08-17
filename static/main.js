const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d')
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');

let gameStarted = false;

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
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]}`;
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
                drawText('Game Over!', canvas.width / 2 - 50, canvas.height / 2, '#F00');
            } else {
                requestAnimationFrame(updateGame);
            }
        });
}

function startGame() {
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    gameStarted = true;
    updateGame()
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const direction = event.key === 'ArrowLeft' ? 'left' : 'right';
        fetch('/game_state', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ direction: direction})
        });
    }
});

startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
    if (!gameStarted) {
        startGame();
    }
});