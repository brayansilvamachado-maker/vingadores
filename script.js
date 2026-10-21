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
const waveBanner = document.getElementById('wave-banner');
const playerWeapon = document.getElementById('player-weapon');
const playButton = document.getElementById('play-button');
const retryButton = document.getElementById('retry-button');

let score = 0;
let kills = 0;
let wave = 1;
let ammo = 6;
const maxAmmo = 6;
let playerHp = 100; // Começa rigorosamente em 100 como no print
let gameInterval;
let isPlaying = false;
let isReloading = false;
let spawnSpeed = 2000;

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
    playerHp = 100;
    spawnSpeed = 2000;
    isPlaying = true;
    isReloading = false;

    updateHUD();
    startScreen.classList.add('hide');
    gameoverScreen.classList.add('hide');
    reloadPrompt.classList.add('hide');

    document.querySelectorAll('.target').forEach(t => t.remove());
    triggerWaveBanner();

    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnSpeed);
}

function triggerWaveBanner() {
    waveBanner.innerHTML = `ONDA ${wave}<br><span>${wave === 2 ? 'Eles estão vindo mais rápido.' : 'Defenda a fazenda!'}</span>`;
    waveBanner.classList.remove('hide');
    setTimeout(() => waveBanner.classList.add('hide'), 2500);
}

function spawnTarget() {
    if (!isPlaying) return;

    const target = document.createElement('div');
    target.classList.add('target');

    // REGRA DE VIDA OCULTA: Sorteia se o inimigo será comum ou especial (chefe da onda)
    const isSpecialBoss = Math.random() > 0.75; // 25% de chance de ser um especial com vida visível
    
    if (isSpecialBoss) {
        target.dataset.hp = "3";
        target.dataset.maxHp = "3";
        // Cria elemento de barra de vida vermelha igual ao print
        const hpBar = document.createElement('div');
        hpBar.classList.add('enemy-hp');
        const hpInner = document.createElement('div');
        hpInner.classList.add('enemy-hp-inner');
        hpBar.appendChild(hpInner);
        target.appendChild(hpBar);
    } else {
        target.dataset.hp = "1"; // Inimigos normais morrem com 1 tiro direto e não exibem nada
    }

    const horizonX = 400; 
    const horizonY = 320; 
    const targetX = Math.floor(Math.random() * (gameContainer.clientWidth - 160)) + 80;
    const targetY = Math.floor(Math.random() * 100) + 440; 

    target.style.left = `${horizonX}px`;
    target.style.top = `${horizonY}px`;

    target.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            e.stopPropagation();
            if (ammo > 0 && !isReloading) {
                fireBullet(); 
                damageEnemy(target, isSpecialBoss);
            }
        }
    });

    gameContainer.appendChild(target);

    let progress = 0;
    let runSpeed = 0.004 + (wave * 0.0015); 

    const runInterval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(runInterval);
            return;
        }

        progress += runSpeed;

        if (progress >= 1) {
            clearInterval(runInterval);
            if (target.parentNode) {
                target.remove();
                takeDamage(20); // Cada ataque bem-sucedido arranca 20 de HP
            }
        } else {
            const currentX = horizonX + (targetX - horizonX) * progress;
            const currentY = horizonY + (targetY - horizonY) * progress;
            target.style.left = `${currentX}px`;
            target.style.top = `${currentY}px`;
            target.style.transform = `translate(-50%, -50%) scale(${progress})`;
        }
    }, 20); 
}

// Tiro em falso no cenário (gasta munição rigorosamente)
gameContainer.addEventListener('mousedown', (e) => {
    if (!isPlaying || isReloading || e.button !== 0) return;
    fireBullet();
});

function fireBullet() {
    if (ammo > 0) {
        ammo--;
        updateHUD();
        
        // Coice da Arma animado
        playerWeapon.classList.add('weapon-shoot');
        setTimeout(() => playerWeapon.classList.remove('weapon-shoot'), 60);

        shootFlash.style.opacity = '1';
        setTimeout(() => shootFlash.style.opacity = '0', 40);

        if (ammo === 0) {
            reloadPrompt.classList.remove('hide');
        }
    } else {
        reloadPrompt.classList.remove('hide');
    }
}

function damageEnemy(enemyElement, isSpecial) {
    let currentEnemyHp = parseInt(enemyElement.dataset.hp);
    currentEnemyHp--;
    enemyElement.dataset.hp = currentEnemyHp;

    if (currentEnemyHp <= 0) {
        enemyElement.remove();
        kills++;
        score += 135 * wave;
        
        if (kills % 6 === 0) {
            wave++;
            triggerWaveBanner();
            adjustDifficulty();
        }
        updateHUD();
    } else if (isSpecial) {
        // Atualiza a largura da barra vermelha do especial
        const innerBar = enemyElement.querySelector('.enemy-hp-inner');
        const maxHp = parseInt(enemyElement.dataset.maxHp);
        innerBar.style.width = `${(currentEnemyHp / maxHp) * 100}%`;
    }
}

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

function takeDamage(amount) {
    playerHp = Math.max(0, playerHp - amount);
    updateHUD();

    if (playerHp <= 0) {
        endGame();
    }
}

function adjustDifficulty() {
    spawnSpeed = Math.max(700, 2000 - (wave * 150));
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnSpeed);
}

function updateHUD() {
    scoreVal.textContent = String(score).padStart(6, '0');
    killsVal.textContent = kills;
    waveVal.textContent = wave;
    ammoVal.textContent = `${ammo} / ∞`;
    hpVal.textContent = playerHp;
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    finalScore.textContent = score;
    gameoverScreen.classList.remove('hide');
    reloadPrompt.classList.add('hide');
}
