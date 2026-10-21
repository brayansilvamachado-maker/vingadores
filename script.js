const gameContainer = document.getElementById('game-container');
const scoreVal = document.getElementById('score-val');
const killsVal = document.getElementById('kills-val');
const waveVal = document.getElementById('wave-val');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const finalScore = document.getElementById('final-score');
const shootFlash = document.getElementById('shoot-flash');

let score = 0;
let kills = 0;
let wave = 1;
let gameInterval;
let isPlaying = false;
let spawnSpeed = 1200;

function startGame() {
    score = 0;
    kills = 0;
    wave = 1;
    spawnSpeed = 1200;
    isPlaying = true;

    updateHUD();

    startScreen.classList.add('hide');
    gameoverScreen.classList.add('hide');

    document.querySelectorAll('.target').forEach(t => t.remove());

    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnSpeed);
}

function spawnTarget() {
    if (!isPlaying) return;

    if (document.querySelectorAll('.target').length >= 5) {
        endGame();
        return;
    }

    const target = document.createElement('div');
    target.classList.add('target');

    const x = Math.floor(Math.random() * (gameContainer.clientWidth - 100)) + 10;
    const y = Math.floor(Math.random() * (gameContainer.clientHeight - 180)) + 100;

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    target.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        hitTarget(target);
    });

    gameContainer.appendChild(target);

    setTimeout(() => {
        if (target.parentNode) {
            target.remove();
        }
    }, spawnSpeed * 1.5);
}

gameContainer.addEventListener('mousedown', () => {
    if (!isPlaying) return;
    shootFlash.style.opacity = '1';
    setTimeout(() => shootFlash.style.opacity = '0', 40);
});

function hitTarget(targetElement) {
    targetElement.remove();
    kills++;
    score += 100 * wave;
    
    if (kills % 10 === 0) {
        wave++;
        adjustDifficulty();
    }

    updateHUD();
}

function adjustDifficulty() {
    spawnSpeed = Math.max(500, 1200 - (wave * 80));
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnSpeed);
}

function updateHUD() {
    scoreVal.textContent = String(score).padStart(6, '0');
    killsVal.textContent = kills;
    waveVal.textContent = wave;
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    finalScore.textContent = score;
    gameoverScreen.classList.remove('hide');
}
