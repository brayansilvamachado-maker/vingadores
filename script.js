const gameContainer = document.getElementById('game-container');
const scoreVal = document.getElementById('score-val');
const killsVal = document.getElementById('kills-val');
const waveVal = document.getElementById('wave-val');
const ammoVal = document.getElementById('ammo-val');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const finalScore = document.getElementById('final-score');
const shootFlash = document.getElementById('shoot-flash');
const reloadPrompt = document.getElementById('reload-prompt');
const playButton = document.getElementById('play-button');
const retryButton = document.getElementById('retry-button');

let score = 0;
let kills = 0;
let wave = 1;
let ammo = 6;
const maxAmmo = 6;
let gameInterval;
let isPlaying = false;
let isReloading = false;
let spawnSpeed = 1200;

playButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);

// Bloqueia o menu padrão do botão direito dentro do jogo para usá-lo para recarregar
gameContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    reloadWeapon();
});

function startGame() {
    score = 0;
    kills = 0;
    wave = 1;
    ammo = maxAmmo;
    spawnSpeed = 1200;
    isPlaying = true;
    isReloading = false;

    updateHUD();
    startScreen.classList.add('hide');
    gameoverScreen.classList.add('hide');
    reloadPrompt.classList.add('hide');

    document.querySelectorAll('.target').forEach(t => t.remove());

    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnSpeed);
}

function spawnTarget() {
    if (!isPlaying) return;

    // Se juntarem 5 ou mais Coragens na tela ao mesmo tempo, dá Game Over
    if (document.querySelectorAll('.target').length >= 5) {
        endGame();
        return;
    }

    const target = document.createElement('div');
    target.classList.add('target');

    const x = Math.floor(Math.random() * (gameContainer.clientWidth - 100)) + 5;
    const y = Math.floor(Math.random() * (gameContainer.clientHeight - 180)) + 90;

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    target.addEventListener('mousedown', (e) => {
        // Só acerta o alvo se for com o clique esquerdo (botão 0)
        if (e.button === 0) {
            e.stopPropagation();
            if (ammo > 0 && !isReloading) {
                hitTarget(target);
            }
        }
    });

    gameContainer.appendChild(target);

    // O tempo que ele fica na tela diminui conforme as ondas passam
    setTimeout(() => {
        if (target.parentNode && isPlaying) {
            target.remove();
        }
    }, spawnSpeed * 1.5);
}

// Lógica de disparo no cenário
gameContainer.addEventListener('mousedown', (e) => {
    if (!isPlaying || isReloading || e.button !== 0) return;

    if (ammo > 0) {
        ammo--;
        updateHUD();
        
        // Efeito visual de flash do tiro
        shootFlash.style.opacity = '1';
        setTimeout(() => shootFlash.style.opacity = '0', 40);

        if (ammo === 0) {
            reloadPrompt.classList.remove('hide');
        }
    } else {
        // Alerta visual de falta de munição
        reloadPrompt.classList.remove('hide');
    }
});

function reloadWeapon() {
    if (!isPlaying || isReloading || ammo === maxAmmo) return;

    isReloading = true;
    reloadPrompt.textContent = "RECARREGANDO...";
    reloadPrompt.classList.remove('hide');

    // Tempo de recarga de 1 segundo
    setTimeout(() => {
        ammo = maxAmmo;
        isReloading = false;
        reloadPrompt.classList.add('hide');
        reloadPrompt.textContent = "CLIQUE COM O BOTÃO DIREITO PARA RECARREGAR!";
        updateHUD();
    }, 1000);
}

function hitTarget(targetElement) {
    targetElement.remove();
    kills++;
    score += 100 * wave;
    
    // Aumenta a velocidade e traz mais inimigos a cada 7 abates
    if (kills % 7 === 0) {
        wave++;
        adjustDifficulty();
    }

    updateHUD();
}

function adjustDifficulty() {
    spawnSpeed = Math.max(400, 1200 - (wave * 90));
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnSpeed);
}

function updateHUD() {
    scoreVal.textContent = String(score).padStart(6, '0');
    killsVal.textContent = kills;
    waveVal.textContent = wave;
    ammoVal.textContent = `${ammo}/${maxAmmo}`;
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    finalScore.textContent = score;
    gameoverScreen.classList.remove('hide');
    reloadPrompt.classList.add('hide');
}
