const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const gravity = 0.6;
let gameSpeed = 3;
let normalGameSpeed = 3;

// Speed Rush variables
let isSpeedRush = false;
let speedRushTimer = 0;
const speedRushDuration = 300; // Duration of speed rush in frames
const speedRushChance = 0.005; // Chance per frame to trigger a speed rush
const speedRushMultiplier = 2; // Multiplier for game speed during speed rush

// Load images
const playerImg = new Image();
playerImg.src = 'skate.png'; // Player image

const singleBlockImg = new Image();
singleBlockImg.src = 'trash.png'; // Single block image

const doubleBlockImg = new Image();
doubleBlockImg.src = 'cop.png'; // Double block image

const tripleBlockImg = new Image();
tripleBlockImg.src = 'hydrant.png'; // Triple block image

const backgroundImg = new Image();
backgroundImg.src = 'background.png'; // Initial background image

const backgroundImg2 = new Image();
backgroundImg2.src = 'background2.png'; // Background image after score 2000

const backgroundImg3 = new Image();
backgroundImg3.src = 'background3.png'; // Background image after score 4000

const backgroundImg4 = new Image();
backgroundImg4.src = 'background4.png'; // Background image after score 7000

const groundImg = new Image();
groundImg.src = 'ground.png'; // Ground image

const speedRushImg = new Image();
speedRushImg.src = 'speed_rush.png'; // Speed Rush graphic

const sorryImg = new Image();
sorryImg.src = 'sorry.png'; // Sorry graphic for collision pause

// Load sound effects
const jumpSound = new Audio('jump.mp3');
const landSound = new Audio('land.mp3');
const doubleJumpSound = new Audio('whoa.mp3');
const landCopSound = new Audio('hey.mp3');
const landHydrantSound = new Audio('splash.mp3');
const landTrashSound = new Audio('grind.mp3');
const speedRushSound = new Audio('speed.mp3');
const crashSound = new Audio('crash.mp3');
const moonSound = new Audio('moon.mp3');
const gnarSound = new Audio('gnar.mp3');

let moonSoundPlayed = false; // Flag to ensure moonSound plays only once
let gnarSoundPlayed = false; // Flag to ensure gnarSound plays only once

// Player object
const player = {
    x: 50,
    y: canvas.height - 150,
    width: 50,
    height: 50,
    dy: 0,
    jumpForce: 12,
    grounded: false,
    jumping: false,
    previousY: canvas.height - 150,
    jumpCount: 0,
    maxJumps: 2
};

// Obstacle array
const obstacles = [];
let obstacleTimer = 0;
const obstacleInterval = 100;

// Score variables
let score = 0;
let highScore = 0;

// Game over variables
let isGameOver = false;
let gameOverTimer = 0;
const gameOverDuration = 180; // 3 seconds at 60 FPS

// Keyboard input
const keys = {};

document.addEventListener('keydown', function(e) {
    if (!isGameOver) {
        if ((e.code === 'Space' || e.code === 'ArrowUp') && !keys[e.code]) {
            if (player.jumpCount < player.maxJumps) {
                if (player.jumpCount === 0) {
                    jumpSound.play(); // Play jump sound on first jump
                } else {
                    doubleJumpSound.play(); // Play double jump sound
                }
                player.dy = -player.jumpForce;
                player.jumping = true;
                player.grounded = false;
                player.jumpCount++;
            }
        }
    }
    keys[e.code] = true;
});

document.addEventListener('keyup', function(e) {
    keys[e.code] = false;
});

// Function to scale and draw images
function drawImage(img, x, y, width, height) {
    ctx.drawImage(img, x, y, width, height);
}

// Background variables
let backgroundX = 0;
let backgroundX2 = canvas.width;
const backgroundSpeed = 1.5; // Adjust for parallax effect

// Ground variables
let groundX = 0;
let groundX2 = canvas.width;
let groundSpeed = gameSpeed; // Ground moves at the same speed as obstacles

// Ensure images are loaded before starting the game
let imagesLoaded = 0;
const totalImages = 11; // Updated to include the new background image

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        // All images are loaded, start the game
        startGame();
    }
}

playerImg.onload = imageLoaded;
singleBlockImg.onload = imageLoaded;
doubleBlockImg.onload = imageLoaded;
tripleBlockImg.onload = imageLoaded;
backgroundImg.onload = imageLoaded;
backgroundImg2.onload = imageLoaded;
backgroundImg3.onload = imageLoaded;
backgroundImg4.onload = imageLoaded;
groundImg.onload = imageLoaded;
speedRushImg.onload = imageLoaded;
sorryImg.onload = imageLoaded;

// Background music
const backgroundMusic = new Audio('RUSHIT.mp3');
backgroundMusic.loop = true; // Loop the music
backgroundMusic.volume = 0.5; // Set volume (0.0 to 1.0)

// Function to start the game
function startGame() {
    backgroundMusic.play();
    update();
}

// Game loop
function update() {
    if (isGameOver) {
        // Game Over state
        gameOverTimer--;
        if (gameOverTimer <= 0) {
            // Reset the game after the pause
            resetGame();
        } else {
            // Do not clear the canvas to keep the last frame
            // Display the sorry image overlaid on the current canvas
            const imgWidth = 500;
            const imgHeight = 500;
            const imgX = (canvas.width - imgWidth) / 2;
            const imgY = (canvas.height - imgHeight) / 2;
            drawImage(sorryImg, imgX, imgY, imgWidth, imgHeight);
        }
        // Request next frame
        requestAnimationFrame(update);
        return; // Skip the rest of the game loop
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    backgroundX -= backgroundSpeed;
    backgroundX2 -= backgroundSpeed;

    // Reset background positions when off-screen
    if (backgroundX <= -canvas.width) {
        backgroundX = canvas.width;
    }
    if (backgroundX2 <= -canvas.width) {
        backgroundX2 = canvas.width;
    }

    // Select background image based on score
    let currentBackgroundImg = backgroundImg;
    if (score >= 7000) {
        currentBackgroundImg = backgroundImg4;
        if (!gnarSoundPlayed) {
            gnarSound.play();
            gnarSoundPlayed = true;
        }
    } else if (score >= 4000) {
        currentBackgroundImg = backgroundImg3;
        if (!moonSoundPlayed) {
            moonSound.play();
            moonSoundPlayed = true;
        }
    } else if (score >= 2000) {
        currentBackgroundImg = backgroundImg2;
    }

    // Draw the two background images to create a seamless scroll
    drawImage(currentBackgroundImg, backgroundX, 0, canvas.width, canvas.height);
    drawImage(currentBackgroundImg, backgroundX2, 0, canvas.width, canvas.height);

    // Update ground speed to match game speed
    groundSpeed = gameSpeed;

    // Update ground positions
    groundX -= groundSpeed;
    groundX2 -= groundSpeed;

    // Reset ground positions when off-screen
    if (groundX <= -canvas.width) {
        groundX = canvas.width;
    }
    if (groundX2 <= -canvas.width) {
        groundX2 = canvas.width;
    }

    // Draw the two ground images to create a seamless scroll
    drawImage(groundImg, groundX, canvas.height - 50, canvas.width, 50);
    drawImage(groundImg, groundX2, canvas.height - 50, canvas.width, 50);

    // Store the player's previous Y position
    player.previousY = player.y;

    // Apply gravity and update player's position
    player.dy += gravity;
    player.y += player.dy;

    // Ground collision
    if (player.y + player.height >= canvas.height - 50) {
        if (!player.grounded) {
            landSound.play(); // Play landing sound when player hits the ground
        }
        player.y = canvas.height - 50 - player.height;
        player.dy = 0;
        player.grounded = true;
        player.jumping = false;
        player.jumpCount = 0;
    }

    // Draw player
    drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Handle Speed Rush
    if (isSpeedRush) {
        speedRushTimer--;
        if (speedRushTimer <= 0) {
            // End Speed Rush
            isSpeedRush = false;
            gameSpeed = normalGameSpeed;
        } else {
            // Display Speed Rush graphic
            const imgWidth = 500;
            const imgHeight = 100;
            const imgX = (canvas.width - imgWidth) / 2;
            const imgY = (canvas.height - imgHeight) / 2;
            drawImage(speedRushImg, imgX, imgY, imgWidth, imgHeight);
        }
    } else {
        // Randomly trigger Speed Rush
        if (Math.random() < speedRushChance) {
            isSpeedRush = true;
            speedRushTimer = speedRushDuration;
            gameSpeed = normalGameSpeed * speedRushMultiplier;
            speedRushSound.play(); // Play speed rush sound
        }
    }

    // Obstacle generation
    obstacleTimer++;
    if (obstacleTimer > obstacleInterval) {
        let obstacleHeight = 50;
        let stackHeight;
        let obstacleImage;
        let rand = Math.random();
        if (rand < 0.2) {
            stackHeight = 3; // Triple block
            obstacleImage = tripleBlockImg;
        } else if (rand < 0.5) {
            stackHeight = 2; // Double block
            obstacleImage = doubleBlockImg;
        } else {
            stackHeight = 1; // Single block
            obstacleImage = singleBlockImg;
        }
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 50 - obstacleHeight * stackHeight,
            width: 50,
            height: obstacleHeight * stackHeight,
            image: obstacleImage,
            stackHeight: stackHeight
        });
        obstacleTimer = 0;
    }

    // Move and draw obstacles
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;
        // Draw obstacle
        drawImage(obs.image, obs.x, obs.y, obs.width, obs.height);

        // Collision detection
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x
        ) {
            // Check if player is landing on top of the obstacle
            if (
                player.previousY + player.height <= obs.y &&
                player.y + player.height >= obs.y &&
                player.dy >= 0
            ) {
                // Land on top of the obstacle
                player.y = obs.y - player.height;
                player.dy = 0;
                player.grounded = true;
                player.jumping = false;
                player.jumpCount = 0;

                // Play landing sound based on obstacle type
                if (obs.stackHeight === 1) {
                    landTrashSound.play(); // Landed on Trash (single block)
                } else if (obs.stackHeight === 2) {
                    landCopSound.play(); // Landed on Cop (double block)
                } else if (obs.stackHeight === 3) {
                    landHydrantSound.play(); // Landed on Hydrant (triple block)
                }
            }
            // Check for side or bottom collisions
            else if (
                player.y + player.height > obs.y &&
                player.y < obs.y + obs.height
            ) {
                // Collision from the side or bottom, initiate game over
                isGameOver = true;
                gameOverTimer = gameOverDuration;
                crashSound.play(); // Play crash sound
                if (score > highScore) {
                    highScore = score;
                }
                // Note: Do not reset score or other variables here; they will be reset after the pause
                break;
            }
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            i--;
            // Increase normal game speed over time
            normalGameSpeed += 0.02;
            if (!isSpeedRush) {
                gameSpeed = normalGameSpeed;
            }
        }
    }

    // Update score
    score++;
    ctx.fillStyle = '#fff'; // White color for text
    ctx.font = '20px Verdana'; // Change font to Verdana or any preferred font
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('High Score: ' + highScore, 10, 60);

    // Request next frame
    requestAnimationFrame(update);
}

// Function to reset the game after game over
function resetGame() {
    // Reset game variables
    isGameOver = false;
    obstacles.splice(0, obstacles.length);
    player.x = 50;
    player.y = canvas.height - 150;
    player.dy = 0;
    gameSpeed = normalGameSpeed = 3;
    player.jumpCount = 0;
    isSpeedRush = false;
    speedRushTimer = 0;
    backgroundX = 0;
    backgroundX2 = canvas.width;
    groundX = 0;
    groundX2 = canvas.width;
    score = 0;
    moonSoundPlayed = false; // Reset the moonSound flag
    gnarSoundPlayed = false; // Reset the gnarSound flag
}

// Start the game after images are loaded
