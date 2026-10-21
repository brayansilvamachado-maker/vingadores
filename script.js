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
let playerHp = 10; // 10 blocos de vida total do jogador
let gameInterval;
let isPlaying = false;
let isReloading = false;
let spawnSpeed = 1800; // Cadência inicial mais amigável e cadenciada

playButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);

// Previne menu padrão do clique direito para funcionar a recarga rápida
gameContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    reloadWeapon();
});

function startGame() {
    score = 0;
    kills = 0;
    wave = 1;
    ammo = maxAmmo;
    playerHp = 10;
    spawnSpeed = 1800;
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

    // Vida individual deste Coragem específico (3 acertos para morrer)
    target.dataset.hp = "3";

    // Cria o indicador de texto de vida sobre a cabeça dele
    const hpDisplay = document.createElement('div');
    hpDisplay.classList.add('enemy-hp');
    hpDisplay.textContent = "HP: |||";
    target.appendChild(hpDisplay);

    const horizonX = 400; 
    const horizonY = 320; 

    const targetX = Math.floor(Math.random() * (gameContainer.clientWidth - 160)) + 80;
    const targetY = Math.floor(Math.random() * 120) + 420; 

    target.style.left = `${horizonX}px`;
    target.style.top = `${horizonY}px`;

    // Lógica ao atirar diretamente em cima do inimigo
    target.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            e.stopPropagation(); // Evita ativar o clique duplo do fundo do cenário
            
            // Só computa dano se tiver munição carregada e não estiver recarregando
            if (ammo > 0 && !isReloading) {
                // Executa a função global de gasto de bala para manter consistência
                fireBullet(); 
                damageEnemy(target, hpDisplay);
            }
        }
    });

    gameContainer.appendChild(target);

    let progress = 0;
    // Corrida mais lenta e controlada, subindo progressivamente a cada onda
    let runSpeed = 0.005 + (wave * 0.0015); 

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
                takeDamage(2); // Inimigo que chega rouba 2 blocos de vida direto
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

// Lógica ao clicar em qualquer lugar vazio do cenário (Tiro Errado)
gameContainer.addEventListener('mousedown', (e) => {
    if (!isPlaying || isReloading || e.button !== 0) return;
    
    // Dispara a bala normalmente (mecanismo que gasta munição mesmo no erro)
    fireBullet();
});

// Mecanismo central unificado de disparo da arma
function fireBullet() {
    if (ammo > 0) {
        ammo--;
        updateHUD();
        
        // Efeito de Clarão na Tela
        shootFlash.style.opacity = '1';
        setTimeout(() => shootFlash.style.opacity = '0', 40);

        if (ammo === 0) {
            reloadPrompt.classList.remove('hide');
        }
    } else {
        reloadPrompt.classList.remove('hide');
    }
}

// Lógica de dano ao inimigo
function damageEnemy(enemyElement, display) {
    let currentEnemyHp = parseInt(enemyElement.dataset.hp);
    currentEnemyHp--;
    enemyElement.dataset.hp = currentEnemyHp;

    if (currentEnemyHp <= 0) {
        enemyElement.remove();
        kills++;
        score += 150 * wave;
        
        if (kills % 5 === 0) {
            wave++;
            adjustDifficulty();
        }
        updateHUD();
    } else {
        // Atualiza os palitinhos visuais do HP dele
        display.textContent = "HP: " + "|".repeat(currentEnemyHp);
        
        // Pequeno efeito físico de recuo rápido ao tomar o tiro
        enemyElement.style.filter = "brightness(2) drop-shadow(2px 3px 4px rgba(0,0,0,0.7))";
        setTimeout(() => {
            if(enemyElement) enemyElement.style.filter = "brightness(1) drop-shadow(2px 3px 4px rgba(0,0,0,0.7))";
        }, 60);
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
    playerHp -= amount;
    updateHUD();

    const hurt = document.createElement('div');
    hurt.classList.add('hurt-flash');
    gameContainer.appendChild(hurt);
    setTimeout(() => hurt.remove(), 250);

    if (playerHp <= 0) {
        endGame();
    }
}

function adjustDifficulty() {
    spawnSpeed = Math.max(600, 1800 - (wave * 120));
    clearInterval(gameInterval);
    gameInterval = setInterval(spawnTarget, spawnSpeed);
}

function updateHUD() {
    scoreVal.textContent = String(score).padStart(6, '0');
    killsVal.textContent = kills;
    waveVal.textContent = wave;
    ammoVal.textContent = `${ammo}/${maxAmmo}`;
    
    // Atualiza a barra de blocos do jogador e muda de cor se a vida estiver crítica
    const remainingBars = Math.max(0, playerHp);
    hpVal.textContent = `[${"|".repeat(remainingBars)}${".".repeat(10 - remainingBars)}]`;
    
    if (playerHp <= 3) {
        hpVal.style.color = "#ff3333"; // Vermelho crítico
    } else if (playerHp <= 6) {
        hpVal.style.color = "#ffcc00"; // Amarelo alerta
    } else {
        hpVal.style.color = "#33ff33"; // Verde estável
    }
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    finalScore.textContent = score;
    gameoverScreen.classList.remove('hide');
    reloadPrompt.classList.add('hide');
}
