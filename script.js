const gameContainer = document.getElementById('game-container');
const scoreVal = document.getElementById('score-val');
const killsVal = document.getElementById('kills-val');
const waveVal = document.getElementById('wave-val');
const ammoVal = document.getElementById('ammo-val');
const hpVal = document.getElementById('hp-val');
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
let hp = 3; // Sistema de 3 pontos de vida
let gameInterval;
let isPlaying = false;
let isReloading = false;
let spawnSpeed = 1500; 

playButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);

gameContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    reloadWeapon();
});

function startGame() {
    score = 0;
    kills = 0;
    wave = 1;
    ammo = maxAmmo;
    hp = 3;
    spawnSpeed = 1500;
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

    const target = document.createElement('div');
    target.classList.add('target');

    // Ponto fixo no horizonte (centro aproximado do cenário lá atrás perto da casa)
    const horizonX = 400; 
    const horizonY = 320; 

    // Dispersão aleatória para onde ele vai correr na tela ao chegar perto
    const targetX = Math.floor(Math.random() * (gameContainer.clientWidth - 150)) + 75;
    const targetY = Math.floor(Math.random() * 150) + 400; // Vem para a parte inferior da tela

    target.style.left = `${horizonX}px`;
    target.style.top = `${horizonY}px`;

    target.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            e.stopPropagation();
            if (ammo > 0 && !isReloading) {
                hitTarget(target);
            }
        }
    });

    gameContainer.appendChild(target);

    // Controle da corrida (aproximação progressiva por frames)
    let progress = 0;
    // O Coragem corre mais rápido a cada onda que passa
    let runSpeed = 0.01 + (wave * 0.003); 

    const runInterval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(runInterval);
            return;
        }

        progress += runSpeed;

        if (progress >= 1) {
            // Se o progresso chegar a 1, ele atingiu a tela do jogador!
            clearInterval(runInterval);
            if (target.parentNode) {
                target.remove();
                takeDamage();
            }
        } else {
            // Interpolação linear de movimento e tamanho de escala (efeito zoom)
            const currentX = horizonX + (targetX - horizonX) * progress;
            const currentY = horizonY + (targetY - horizonY) * progress;
            
            target.style.left = `${currentX}px`;
            target.style.top = `${currentY}px`;
            target.style.transform = `translate(-50%, -50%) scale(${progress})`;
        }
    }, 20); // Atualiza a cada 20 milissegundos
}

// Lógica de disparo
gameContainer.addEventListener('mousedown', (e) => {
    if (!isPlaying || isReloading || e.button !== 0) return;

    if (ammo > 0) {
        ammo--;
        updateHUD();
        
        shootFlash.style.opacity = '1';
        setTimeout(() => shootFlash.style.opacity = '0', 40);

        if (ammo === 0) {
            reloadPrompt.classList.remove('hide');
        }
    } else {
        reloadPrompt.classList.remove('hide');
    }
});

function reloadWeapon() {
    if (!isPlaying || isReloading || ammo === maxAmmo) return;

    isReloading = true;
    reloadPrompt.textContent = "RECARREGANDO...";
    reloadPrompt.classList.remove('hide');

    setTimeout(() => {
        ammo = maxAmmo;
        isReloading = false;
        reloadPrompt.classList.add('hide');
        reloadPrompt.textContent = "CLIQUE COM O BOTÃO DIREITO PARA RECARREGAR!";
        updateHUD();
    }, 800);
}

function hitTarget(targetElement) {
    targetElement.remove();
    kills++;
    score += 100 * wave;
    
    if (kills % 6 === 0) {
        wave++;
        adjustDifficulty();
    }

    updateHUD();
}

function takeDamage() {
    hp--;
    updateHUD();

    // Efeito de tela vermelha de dano
    const hurt = document.createElement('div');
    hurt.classList.add('hurt-flash');
    gameContainer.appendChild(hurt);
    setTimeout(() => hurt.remove(), 300);

    if (hp <= 0) {
        endGame();
    }
}

function adjustDifficulty() {
    spawnSpeed = Math.max(500, 1500 - (wave * 100));
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnSpeed);
}

function updateHUD() {
    scoreVal.textContent = String(score).padStart(6, '0');
    killsVal.textContent = kills;
    waveVal.textContent = wave;
    ammoVal.textContent = `${ammo}/${maxAmmo}`;
    
    // Atualiza os corações visuais
    hpVal.textContent = "❤️".repeat(Math.max(0, hp));
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    finalScore.textContent = score;
    gameoverScreen.classList.remove('hide');
    reloadPrompt.classList.add('hide');
}
