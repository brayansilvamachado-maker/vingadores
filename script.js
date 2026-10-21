const gameContainer = document.getElementById('game-container');
const scoreVal = document.getElementById('score-val');
const killsVal = document.getElementById('kills-val');
const waveVal = document.getElementById('wave-val');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const finalScore = document.getElementById('final-score');
const shootFlash = document.getElementById('shoot-flash');
const playButton = document.getElementById('play-button');
const retryButton = document.getElementById('retry-button');

let score = 0;
let kills = 0;
let wave = 1;
let gameInterval;
let isPlaying = false;
let spawnSpeed = 1200;

// Vincula os eventos de clique diretamente aos botões para evitar falhas inline
playButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);

function startGame() {
    score = 0;
    kills = 0;
    wave = 1;
    spawnSpeed = 1200;
    isPlaying = true;

    updateHUD();

    // Esconde as telas de menu de forma segura usando classes CSS
    startScreen.classList.add('hide');
    gameoverScreen.classList.add('hide');

    // Limpa qualquer inimigo remanescente na tela
    document.querySelectorAll('.target').forEach(t => t.remove());

    // Inicia o loop de surgimento dos inimigos
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnSpeed);
}

function spawnTarget() {
    if (!isPlaying) return;

    // Se acumularem mais de 4 inimigos na tela ao mesmo tempo, o jogador perde
    if (document.querySelectorAll('.target').length >= 4) {
        endGame();
        return;
    }

    const target = document.createElement('div');
    target.classList.add('target');

    // Calcula posições aleatórias dentro do limite visível do jogo
    const x = Math.floor(Math.random() * (gameContainer.clientWidth - 90)) + 10;
    const y = Math.floor(Math.random() * (gameContainer.clientHeight - 160)) + 90;

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    // Registra o acerto ao clicar no inimigo
    target.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        hitTarget(target);
    });

    gameContainer.appendChild(target);

    // Remove o inimigo se o jogador demorar muito para clicar nele
    setTimeout(() => {
        if (target.parentNode && isPlaying) {
            target.remove();
        }
    }, spawnSpeed * 1.6);
}

// Efeito visual de disparo na tela ao clicar
gameContainer.addEventListener('mousedown', () => {
    if (!isPlaying) return;
    shootFlash.style.opacity = '1';
    setTimeout(() => shootFlash.style.opacity = '0', 40);
});

function hitTarget(targetElement) {
    targetElement.remove();
    kills++;
    score += 100 * wave;
    
    // Aumenta a velocidade a cada 8 abates
    if (kills % 8 === 0) {
        wave++;
        adjustDifficulty();
    }

    updateHUD();
}

function adjustDifficulty() {
    spawnSpeed = Math.max(450, 1200 - (wave * 90));
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
