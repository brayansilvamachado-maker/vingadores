const gameContainer = document.getElementById('game-container');
const scoreVal = document.getElementById('score-val');
const killsVal = document.getElementById('kills-val');
const waveVal = document.getElementById('wave-val');
const ammoVal = document.getElementById('ammo-val');
const hpVal = document.getElementById('hp-val');
const hpFill = document.getElementById('player-hp-fill');
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const finalScore = document.getElementById('final-score');
const shootFlash = document.getElementById('shoot-flash');
const reloadPrompt = document.getElementById('reload-prompt');
const waveBanner = document.getElementById('wave-banner');
const bossCard = document.getElementById('boss-card');
const bossTitle = document.getElementById('boss-title');
const bossSubtitle = document.getElementById('boss-subtitle');
const playerWeapon = document.getElementById('player-weapon');
const playButton = document.getElementById('play-button');
const retryButton = document.getElementById('retry-button');

let score = 0;
let kills = 0;
let wave = 1;
let ammo = 6;
const maxAmmo = 6;
let playerHp = 100;
let gameInterval;
let isPlaying = false;
let isReloading = false;
let spawnSpeed = 2000;

playButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);

// Desativa o menu do botão direito no jogo
gameContainer.addEventListener('contextmenu', (e) => e.preventDefault());

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
    bossCard.classList.add('hide');

    document.querySelectorAll('.target').forEach(t => t.remove());
    triggerWaveBanner();

    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnSpeed);
}

function triggerWaveBanner() {
    waveBanner.innerHTML = `ONDA ${wave}<br><span>${wave === 2 ? 'Eles estão mais rápidos!' : 'Defenda a fazenda!'}</span>`;
    waveBanner.classList.remove('hide');
    setTimeout(() => waveBanner.classList.add('hide'), 2000);
}

function showBossAnnouncement(title, subtitle) {
    bossTitle.textContent = title;
    bossSubtitle.textContent = subtitle;
    bossCard.classList.remove('hide');
    setTimeout(() => bossCard.classList.add('hide'), 2500);
}

function spawnTarget() {
    if (!isPlaying) return;

    const target = document.createElement('div');
    target.classList.add('target');

    // 30% de hipóteses de surgir o Eustáquio
    const isEustaquioBoss = Math.random() > 0.70; 

    if (isEustaquioBoss) {
        target.classList.add('eustaquio');
        target.dataset.hp = "3"; // Requer 3 tiros
        target.dataset.maxHp = "3";
        target.style.backgroundImage = "url('eustaquio.png')"; 

        // Balão de fala
        const bubble = document.createElement('div');
        bubble.classList.add('speech-bubble');
        bubble.textContent = "Cachorro idiota!";
        target.appendChild(bubble);

        showBossAnnouncement("CACHORRO IDIOTA!", "O Eustáquio apareceu!");
    } else {
        target.dataset.hp = "1"; // Inimigo comum (1 tiro)
        target.style.backgroundImage = "url('coragem.jpg')";
    }

    // Barra de vida para inimigos com mais de 1 de HP
    if (parseInt(target.dataset.hp) > 1) {
        const hpBar = document.createElement('div');
        hpBar.classList.add('enemy-hp');
        const hpInner = document.createElement('div');
        hpInner.classList.add('enemy-hp-inner');
        hpBar.appendChild(hpInner);
        target.appendChild(hpBar);
    }

    const horizonX = 450; 
    const horizonY = 320; 
    const targetX = Math.floor(Math.random() * (gameContainer.clientWidth - 160)) + 80;
    const targetY = Math.floor(Math.random() * 100) + 430; 

    target.style.left = `${horizonX}px`;
    target.style.top = `${horizonY}px`;

    target.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            e.stopPropagation();
            if (ammo > 0 && !isReloading) {
                fireBullet(); 
                damageEnemy(target);
            }
        }
    });

    gameContainer.appendChild(target);

    let progress = 0;
    let runSpeed = 0.004 + (wave * 0.0012); 

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
                takeDamage(20);
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

// Tiro ao clicar no cenário
gameContainer.addEventListener('mousedown', (e) => {
    if (!isPlaying || isReloading || e.button !== 0) return;
    fireBullet();
});

function fireBullet() {
    if (ammo > 0) {
        ammo--;
        updateHUD();
        
        // Animação da arma
        playerWeapon.classList.add('weapon-shoot');
        setTimeout(() => playerWeapon.classList.remove('weapon-shoot'), 60);

        shootFlash.style.opacity = '1';
        setTimeout(() => shootFlash.style.opacity = '0', 40);

        // Recarga automática ao zerar
        if (ammo === 0) {
            autoReload();
        }
    }
}

function autoReload() {
    isReloading = true;
    reloadPrompt.textContent = "RECARREGANDO...";
    reloadPrompt.classList.remove('hide');

    setTimeout(() => {
        ammo = maxAmmo;
        isReloading = false;
        reloadPrompt.classList.add('hide');
        updateHUD();
    }, 900);
}

function damageEnemy(enemyElement) {
    let currentEnemyHp = parseInt(enemyElement.dataset.hp);
    currentEnemyHp--;
    enemyElement.dataset.hp = currentEnemyHp;

    if (currentEnemyHp <= 0) {
        enemyElement.remove();
        kills++;
        score += 150 * wave;
        
        if (kills % 6 === 0) {
            wave++;
            triggerWaveBanner();
            adjustDifficulty();
        }
        updateHUD();
    } else {
        const innerBar = enemyElement.querySelector('.enemy-hp-inner');
        if (innerBar) {
            const maxHp = parseInt(enemyElement.dataset.maxHp);
            innerBar.style.width = `${(currentEnemyHp / maxHp) * 100}%`;
        }
    }
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

    // Atualiza a barra de vida verde/amarela/vermelha
    hpFill.style.width = `${playerHp}%`;
    if (playerHp > 50) {
        hpFill.style.backgroundColor = "#22c55e";
    } else if (playerHp > 25) {
        hpFill.style.backgroundColor = "#eab308";
    } else {
        hpFill.style.backgroundColor = "#ef4444";
    }
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    finalScore.textContent = score;
    gameoverScreen.classList.remove('hide');
    reloadPrompt.classList.add('hide');
}