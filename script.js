// =========================================================================
// 1. INITIALISATION DU CANVAS ET DES ÉLÉMENTS HTML
// =========================================================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const gameOverScreen = document.getElementById("game-over-screen");
const restartBtn = document.getElementById("restart-btn");
const pauseBtn = document.getElementById("pause-btn"); // Le bouton pause ajouté

const gridSize = 20; 
const tileCount = canvas.width / gridSize; 

// Variables globales pour piloter le jeu
let snakeObj;
let foodObj;
let dx = gridSize; 
let dy = 0;        
let score = 0;
let highScore = 0;
let gameInterval;
let gameSpeed = 120;
let isPaused = false; // Permet de savoir si le jeu est arrêté temporairement

// =========================================================================
// 2. DÉFINITION DES CLASSES (PROGRAMMATION ORIENTÉE OBJET)
// =========================================================================

// Classe représentant le Serpent
class Snake {
    constructor() {
        this.body = [
            { x: 160, y: 200 },
            { x: 140, y: 200 },
            { x: 120, y: 200 }
        ];
    }

    // Méthode pour dessiner le serpent sur l'écran
    draw(context) {
        this.body.forEach((part, index) => {
            context.fillStyle = index === 0 ? "#2ecc71" : "#27ae60";
            context.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
        });
    }

    // Méthode pour faire avancer le serpent
    move(deltaX, deltaY, hasEaten) {
        const head = { x: this.body[0].x + deltaX, y: this.body[0].y + deltaY };
        this.body.unshift(head); // Ajoute la nouvelle tête devant

        if (!hasEaten) {
            this.body.pop(); // Retire la queue si on n'a pas mangé
        }
    }

    // Méthode pour vérifier si la tête touche le reste du corps
    checkSelfCollision() {
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].x === this.body[0].x && this.body[i].y === this.body[0].y) {
                return true;
            }
        }
        return false;
    }
}

// Classe représentant la Nourriture
class Food {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.generate();
    }

    // Méthode pour placer la nourriture au hasard sur la grille
    generate() {
        this.x = Math.floor(Math.random() * tileCount) * gridSize;
        this.y = Math.floor(Math.random() * tileCount) * gridSize;
    }

    // Méthode pour dessiner la nourriture
    draw(context) {
        context.fillStyle = "#e74c3c";
        context.fillRect(this.x, this.y, gridSize - 2, gridSize - 2);
    }
}

// =========================================================================
// 3. LOGIQUE GLOBALE ET BOUCLE DE JEU (GAME LOOP)
// =========================================================================

// Lancement initial au chargement du script
resetGame();

// Écouteurs d'événements pour le clavier et les clics de boutons
document.addEventListener("keydown", changeDirection);
restartBtn.addEventListener("click", resetGame);
pauseBtn.addEventListener("click", togglePause);

function main() {
    // Si le jeu est en pause, on bloque l'exécution et on ne fait rien
    if (isPaused) return;

    // Détection de défaite
    if (snakeObj.checkSelfCollision() || hitWalls()) {
        gameOverScreen.classList.remove("hidden");
        clearInterval(gameInterval);
        checkHighScore();
        playSound('gameover');
        return;
    }

    clearCanvas();
    foodObj.draw(ctx); 
    
    // Vérifie si le serpent mange la pomme
    const hasEatenFood = snakeObj.body[0].x === foodObj.x && snakeObj.body[0].y === foodObj.y;
    
    // On déplace le serpent
    snakeObj.move(dx, dy, hasEatenFood); 

    if (hasEatenFood) {
        score += 10;
        scoreElement.textContent = score;
        foodObj.generate(); 
        
        // Empêche la nourriture d'apparaître sur le corps du serpent
        while (snakeObj.body.some(part => part.x === foodObj.x && part.y === foodObj.y)) {
            foodObj.generate();
        }
        
        playSound('eat');
        increaseSpeed();
    }

    snakeObj.draw(ctx); 
}

function clearCanvas() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function hitWalls() {
    const head = snakeObj.body[0];
    return head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height;
}

// Gestion du bouton Pause
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Reprendre" : "Pause";
    pauseBtn.style.background = isPaused ? "#e67e22" : "#34495e";
}

function changeDirection(event) {
    // Si le jeu est en pause, on bloque les changements de direction
    if (isPaused) return;

    const keyPressed = event.key;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if ((keyPressed === "ArrowLeft" || keyPressed === "q") && !goingRight) { dx = -gridSize; dy = 0; }
    if ((keyPressed === "ArrowUp" || keyPressed === "z") && !goingDown) { dx = 0; dy = -gridSize; }
    if ((keyPressed === "ArrowRight" || keyPressed === "d") && !goingLeft) { dx = gridSize; dy = 0; }
    if ((keyPressed === "ArrowDown" || keyPressed === "s") && !goingUp) { dx = 0; dy = gridSize; }
}

function increaseSpeed() {
    if (gameSpeed > 30) {
        gameSpeed -= 5;
        clearInterval(gameInterval);
        gameInterval = setInterval(main, gameSpeed);
    }
}

function checkHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
        highScoreElement.textContent = highScore;
    }
}

function loadHighScore() {
    highScore = parseInt(localStorage.getItem("snakeHighScore")) || 0;
    highScoreElement.textContent = highScore;
}

function resetGame() {
    snakeObj = new Snake(); 
    foodObj = new Food();

    score = 0;
    dx = gridSize;
    dy = 0;
    gameSpeed = 120;
    isPaused = false; // Remet la pause à zéro si on rejoue
    
    scoreElement.textContent = score;
    if (pauseBtn) {
        pauseBtn.textContent = "Pause";
        pauseBtn.style.background = "#34495e";
    }
    
    loadHighScore();
    gameOverScreen.classList.add("hidden");
    
    clearInterval(gameInterval);
    gameInterval = setInterval(main, gameSpeed);
}

// Générateur d'effets sonores
function playSound(type) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'eat') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'gameover') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.4);
    }
}
