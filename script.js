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
let eustaquioSpawnedInWave5 = false;

playButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);

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
    eustaquioSpawnedInWave5 = false;

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
    waveBanner.innerHTML = `ONDA ${wave}<br><span>${wave === 5 ? 'PREPARE-SE PARA O BOSS!' : 'Defenda a fazenda!'}</span>`;
    waveBanner.classList.remove('hide');
    setTimeout(() => waveBanner.classList.add('hide'), 2000);
}

function spawnTarget() {
    if (!isPlaying) return;

    const target = document.createElement('div');
    target.classList.add('target');

    let isEustaquioBoss = false;
    let isRareTarget = false;

    // Regra do Boss Eustáquio na Onda 5
    if (wave >= 5 && !eustaquioSpawnedInWave5) {
        isEustaquioBoss = true;
        eustaquioSpawnedInWave5 = true;
    } else if (wave >= 3 && Math.random() > 0.65) {
        // A partir da Onda 3 aparecem alvos com 2 tiros
        isRareTarget = true;
    }

    if (isEustaquioBoss) {
        target.classList.add('eustaquio');
        target.dataset.hp = "5"; 
        target.dataset.maxHp = "5";
        target.style.backgroundImage = "url('eustaquio.png')";

        // Mostra a frase do boss no meio da tela antes de ele avançar
        bossTitle.textContent = "CACHORRO IDIOTA!";
        bossSubtitle.textContent = "você irritou o Eustáquio";
        bossCard.classList.remove('hide');

        setTimeout(() => {
            bossCard.classList.add('hide');
        }, 2200);

    } else if (isRareTarget) {
        target.dataset.hp = "2";
        target.dataset.maxHp = "2";
        target.style.backgroundImage = "url('coragem.jpg')";
    } else {
        target.dataset.hp = "1";
        target.style.backgroundImage = "url('coragem.jpg')";
    }

    // Barra de vida para quem tem mais de 1 tiro
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

    // Se for o Boss, ele espera 1 segundo antes de começar a correr para dar tempo da fala sumir
    const delayBeforeRun = isEustaquioBoss ? 1000 : 0;

    setTimeout(() => {
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
    }, delayBeforeRun);
}

gameContainer.addEventListener('mousedown', (e) => {
    if (!isPlaying || isReloading || e.button !== 0) return;
    fireBullet();
});

function fireBullet() {
    if (ammo > 0) {
        ammo--;
        updateHUD();
        
        playerWeapon.classList.add('weapon-shoot');
        setTimeout(() => playerWeapon.classList.remove('weapon-shoot'), 60);

        shootFlash.style.opacity = '1';
        setTimeout(() => shootFlash.style.opacity = '0', 40);

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
            eustaquioSpawnedInWave5 = false;
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

// 1. Carrega a foto/imagem do Coragem
const imgCoragem = new Image();
imgCoragem.src = 'coragem.jpg'; // Nome da foto do seu Coragem

// 2. Define o tamanho GRANDE do Coragem (ajuste 120, 150, etc., até ficar do tamanho ideal)
const TAMANHO_CORAGEM = {
  largura: 140, // Aumente este valor se quiser ainda maior
  altura: 140
};

// 3. No seu loop de desenho (função render/draw/atualizar):
ctx.drawImage(
  imgCoragem, 
  coragem.x, 
  coragem.y, 
  TAMANHO_CORAGEM.largura, 
  TAMANHO_CORAGEM.altura
);

// 1. Carrega a foto do Eustácio
const imgEustacio = new Image();
imgEustacio.src = 'eustacio.jpg'; // Nome da foto do seu Eustácio

// 2. Dados e tamanho do Boss Eustácio
const bossEustacio = {
  x: 300,             // Posição na tela
  y: 50,
  largura: 160,       // Tamanho de Boss (grande)
  altura: 160,
  vida: 100,          // Vida do Boss
  vidaMaxima: 100,
  ativo: true
};

// 3. Função para desenhar APENAS o Eustácio Boss na tela (sem balão)
function desenharBossEustacio() {
  if (!bossEustacio.ativo) return;

  // Desenha a foto do Eustácio no jogo
  ctx.drawImage(
    imgEustacio, 
    bossEustacio.x, 
    bossEustacio.y, 
    bossEustacio.largura, 
    bossEustacio.altura
  );

  // Barra de vida simples acima da cabeça dele (sem balão de texto)
  ctx.fillStyle = 'red';
  ctx.fillRect(bossEustacio.x, bossEustacio.y - 15, bossEustacio.largura, 8);
  
  ctx.fillStyle = 'green';
  ctx.fillRect(
    bossEustacio.x, 
    bossEustacio.y - 15, 
    (bossEustacio.largura * (bossEustacio.vida / bossEustacio.vidaMaxima)), 
    8
  );
}

function verificarEAtirar() {
  if (municao > 0) {
    // Dispara o tiro normal
    atirar();
    municao--;
    
    // Se acabou a munição com esse tiro, recarrega sozinho
    if (municao === 0) {
      setTimeout(() => {
        municao = municaoMaxima;
        
        // Recupera vida ao recarregar
        vidaJogador += 30;
        if (vidaJogador > vidaJogadorMaxima) {
          vidaJogador = vidaJogadorMaxima;
        }
      }, 1000); // 1 segundo para recarregar automaticamente
    }
  }
}

function gerarVariosCoragens() {
  // Quanto menor a sua vida, mais Coragens surgem no mesmo instante
  let quantidadeParaCriar = 1;
  let taxaVidaPerdida = 1 - (vidaJogador / vidaJogadorMaxima);

  if (taxaVidaPerdida > 0.4) {
    quantidadeParaCriar = 2; // Aparecem 2 de uma vez
  }
  if (taxaVidaPerdida > 0.7) {
    quantidadeParaCriar = 3; // Aparecem 3 de uma vez quando a vida está bem baixa
  }

  for (let i = 0; i < quantidadeParaCriar; i++) {
    listaCoragens.push({
      x: Math.random() * (canvas.width - 120),
      y: -120 - (i * 40), // Surgem em posições variadas no topo e vêm descendo
      largura: 120,       // Tamanho da foto do Antônio
      altura: 120,
      velocidade: 2
    });
  }
}

// Gera os Coragens na partida periodicamente
setInterval(gerarVariosCoragens, 1800);

// Cria o Boss Eustácio
let bossEustacio = {
  x: (canvas.width / 2) - 75,
  y: -150,        // Começa fora no topo e vem vindo
  largura: 150,   // Tamanho de Boss
  altura: 150,
  velocidade: 0.5, // Vem vindo bem devagar
  vida: 600,       // Bastante resistência
  vidaMaxima: 600
};

// No seu loop do jogo (atualizar/draw), adicione o movimento dele:
function atualizarBoss() {
  if (bossEustacio) {
    bossEustacio.y += bossEustacio.velocidade; // Avança devagar para baixo

    // Desenha a foto do Eustácio no tamanho de Boss
    ctx.drawImage(imgEustacio, bossEustacio.x, bossEustacio.y, bossEustacio.largura, bossEustacio.altura);

    // Barra de vida em cima dele
    ctx.fillStyle = 'red';
    ctx.fillRect(bossEustacio.x, bossEustacio.y - 12, bossEustacio.largura, 8);
    ctx.fillStyle = 'green';
    ctx.fillRect(bossEustacio.x, bossEustacio.y - 12, (bossEustacio.largura * (bossEustacio.vida / bossEustacio.vidaMaxima)), 8);
  }
}