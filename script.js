// Dados do jogador e do inimigo
const player = {
    name: "Homem de Ferro",
    maxHp: 100,
    currentHp: 100,
    moves: [
        { name: "Soco Repulsor", cost: 2, damage: 15 },
        { name: "Raio Laser", cost: 4, damage: 30 },
        { name: "Unibeam", cost: 6, damage: 50 }
    ]
};

const enemy = {
    name: "Ultron",
    maxHp: 120,
    currentHp: 120
};

// Variáveis de energia estilo Mini Titãs
let currentEnergy = 0;
const maxEnergy = 10;
const chargeSpeed = 1.5; // Velocidade que a barra enche por segundo

// Elementos da interface
const energyFill = document.getElementById("energy-fill");
const movesContainer = document.getElementById("moves-container");

// Função principal de atualização (loop do jogo)
function update() {
    // Carrega a energia continuamente
    if (currentEnergy < maxEnergy) {
        currentEnergy += chargeSpeed * 0.05;
        if (currentEnergy > maxEnergy) currentEnergy = maxEnergy;
    }

    // Atualiza a barra visualmente (porcentagem)
    energyFill.style.width = (currentEnergy / maxEnergy * 100) + "%";

    // Atualiza os botões de ataque (ativa se tiver energia suficiente)
    player.moves.forEach((move, index) => {
        const btn = document.getElementById(`move-btn-${index}`);
        if (btn) {
            btn.disabled = currentEnergy < move.cost;
        }
    });
}

// Renderiza os botões de ataque do personagem
function setupMoves() {
    movesContainer.innerHTML = "";
    player.moves.forEach((move, index) => {
        const btn = document.createElement("button");
        btn.id = `move-btn-${index}`;
        btn.className = "btn-move";
        btn.innerText = `${move.name}\n(Gasta: ${move.cost})`;
        btn.onclick = () => attack(move);
        movesContainer.appendChild(btn);
    });
}

// Função de ataque
function attack(move) {
    if (currentEnergy >= move.cost) {
        currentEnergy -= move.cost;
        enemy.currentHp -= move.damage;
        if (enemy.currentHp < 0) enemy.currentHp = 0;

        // Atualiza vida do inimigo
        document.getElementById("enemy-hp-fill").style.width = (enemy.currentHp / enemy.maxHp * 100) + "%";
        document.getElementById("enemy-hp-text").innerText = `${enemy.currentHp} / ${enemy.maxHp} HP`;

        if (enemy.currentHp === 0) {
            alert("Você venceu a batalha!");
        }
    }
}

// Inicializa o jogo
setupMoves();
setInterval(update, 50); // Roda a atualização a cada 50 milissegundos