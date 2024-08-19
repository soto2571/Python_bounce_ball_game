from flask import Flask, render_template, jsonify, request
import random
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Constants
WIDTH, HEIGHT = 800, 600
BALL_RADIUS = 20
PLATFORM_WIDTH, PLATFORM_HEIGHT = 100, 10
FPS = 60

# Initialize variables for the game
ball_pos = [WIDTH // 2, HEIGHT // 2]
ball_speed = [random.uniform(2, 4), random.uniform(2, 4)]
platform_pos = [WIDTH // 2 - PLATFORM_WIDTH // 2, HEIGHT - PLATFORM_HEIGHT - 10]
platform_speed = 10
score = 0
lives = 3
current_level = 1
platform_color = [255, 165, 0]  # ORANGE

def update_game_state():
    global ball_pos, ball_speed, platform_pos, score, lives, current_level, platform_color

    # Move the ball
    ball_pos[0] += ball_speed[0]
    ball_pos[1] += ball_speed[1]

    # Bounce off the walls
    if ball_pos[0] <= 0 or ball_pos[0] >= WIDTH:
        ball_speed[0] = -ball_speed[0]
    if ball_pos[1] <= 0:
        ball_speed[1] = -ball_speed[1]

    # Check if the ball hits the platform
    if platform_pos[0] <= ball_pos[0] <= platform_pos[0] + PLATFORM_WIDTH and \
            platform_pos[1] <= ball_pos[1] <= platform_pos[1] + PLATFORM_HEIGHT:
        ball_speed[1] = -ball_speed[1]
        score += 1

    # Check if the player advances to the next level
    if score >= current_level * 10:
        current_level += 1
        ball_pos = [WIDTH // 2, HEIGHT // 2]
        ball_speed = [random.uniform(2, 4), random.uniform(2, 4)]
        platform_color = [random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)]

    # Check if the ball falls off the screen
    if ball_pos[1] >= HEIGHT:
        lives -= 1
        if lives == 0:
            return "game_over"
        else:
            ball_pos = [WIDTH // 2, HEIGHT // 2]
            ball_speed = [random.uniform(2, 4), random.uniform(2, 4)]

    return "running"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game_state', methods=['GET', 'POST'])
def game_state():
    if request.method == 'POST':
        direction = request.json.get('direction')
        logging.debug(f'Direction received: {direction}')
        if direction == 'left':
            platform_pos[0] -= platform_speed
        elif direction == 'right':
            platform_pos[0] += platform_speed

        # Ensure the platform stays within the screen boundaries
        platform_pos[0] = max(0, min(platform_pos[0], WIDTH - PLATFORM_WIDTH))

    game_status = update_game_state()

    logging.debug(f'Game state: {game_status}')

    return jsonify({
        'ball_pos': ball_pos,
        'platform_pos': platform_pos,
        'score': score,
        'lives': lives,
        'current_level': current_level,
        'platform_color': platform_color,
        'game_status': game_status        
    })

@app.route('/restart_game', methods=['POST'])
def restart_game():
    global ball_pos, ball_speed, platform_pos, score, lives, current_level, platform_color
    ball_pos = [WIDTH // 2, HEIGHT // 2]
    ball_speed = [random.uniform(2, 4), random.uniform(2, 4)]
    platform_pos = [WIDTH // 2 - PLATFORM_WIDTH // 2, HEIGHT - PLATFORM_HEIGHT - 10]
    score = 0
    lives = 3
    current_level = 1
    platform_color = [255, 165, 0]  # ORANGE
    return '', 204

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store'
    return response

logging.basicConfig(level=logging.DEBUG)

if __name__ == '__main__':
    app.run(debug=False, port=5000)