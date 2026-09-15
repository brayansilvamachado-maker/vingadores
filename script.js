const heroisIniciais = [
    {
        id: "homem_de_ferro",
        nome: "Homem de Ferro",
        hp: 100,
        classe: "Ataque",
        golpes: [
            { nome: "Soco Repulsor", custo: 2, dano: 15 },
            { nome: "Raio Laser", custo: 4, dano: 30 },
            { nome: "Unibeam", custo: 6, dano: 50 }
        ]
    },
    {
        id: "capitao_america",
        nome: "Capitão América",
        hp: 130,
        classe: "Defesa",
        golpes: [
            { nome: "Golpe de Escudo", custo: 2, dano: 12 },
            { nome: "Investida", custo: 3, dano: 22 },
            { nome: "Lançar Escudo", custo: 5, dano: 40 }
        ]
    },
    {
        id: "homem_aranha",
        nome: "Homem-Aranha",
        hp: 90,
        classe: "Velocidade",
        golpes: [
            { nome: "Chute Teia", custo: 2, dano: 18 },
            { nome: "Disparo Duplo", custo: 3, dano: 25 },
            { nome: "Combo de Teias", custo: 5, dano: 45 }
        ]
    }
];

let meuHeroi = null;
let inimigo = { nome: "Ultron", maxHp: 120, currentHp: 120 };

let currentEnergy = 0;
const maxEnergy = 10;
const chargeSpeed = 1.2;

// Criar visualmente os 10 blocos da barra na tela
function criarBlocosEnergia() {
    const container = document.getElementById("energy-blocks-container");
    container.innerHTML = "";
    for (let i = 0; i < maxEnergy; i++) {
        const block = document.createElement("div");
        block.className = "block";
        block.id = `block-${i}`;
        container.appendChild(block);
    }
}

function renderizarSelecao() {
    const container = document.getElementById("starter-heroes-container");
    container.innerHTML = "";

    heroisIniciais.forEach(heroi => {
        const card = document.createElement("div");
        card.className = "starter-card";
        card.innerHTML = `
            <h3>${heroi.nome}</h3>
            <p><strong>HP:</strong> ${heroi.hp}</p>
            <p><strong>Tipo:</strong> ${heroi.classe}</p>
        `;
        card.onclick = () => escolherInicial(heroi);
        container.appendChild(card);
    });
}

function escolherInicial(heroi) {
    meuHeroi = { ...heroi, currentHp: heroi.hp };
    
    document.getElementById("selection-screen").classList.add("hidden");
    document.getElementById("battle-screen").classList.remove("hidden");

    document.getElementById("player-name").innerText = meuHeroi.nome;
    document.getElementById("player-hp-text").innerText = `${meuHeroi.currentHp} / ${meuHeroi.hp} HP`;
    
    criarBlocosEnergia();
    setupMoves();
    setInterval(update, 50);
}

function update() {
    if (currentEnergy < maxEnergy) {
        currentEnergy += chargeSpeed * 0.05;
        if (currentEnergy > maxEnergy) currentEnergy = maxEnergy;
    }

    // Atualiza os blocos acesos
    const blocosCompletos = Math.floor(currentEnergy);
    for (let i = 0; i < maxEnergy; i++) {
        const block = document.getElementById(`block-${i}`);
        if (block) {
            if (i < blocosCompletos) {
                block.classList.add("active");
            } else {
                block.classList.remove("active");
            }
        }
    }

    // Ativa/Desativa botões de acordo com o número de blocos cheios
    meuHeroi.golpes.forEach((move, index) => {
        const btn = document.getElementById(`move-btn-${index}`);
        if (btn) btn.disabled = blocosCompletos < move.custo;
    });
}

function setupMoves() {
    const movesContainer = document.getElementById("moves-container");
    movesContainer.innerHTML = "";
    
    meuHeroi.golpes.forEach((move, index) => {
        const btn = document.createElement("button");
        btn.id = `move-btn-${index}`;
        btn.className = "btn-move";
        btn.innerText = `${move.nome}\n(Gasta: ${move.custo} blocos)`;
        btn.onclick = () => atracar(move);
        movesContainer.appendChild(btn);
    });
}

function atracar(move) {
    if (currentEnergy >= move.custo) {
        currentEnergy -= move.custo;
        inimigo.currentHp -= move.dano;
        if (inimigo.currentHp < 0) inimigo.currentHp = 0;

        document.getElementById("enemy-hp-fill").style.width = (inimigo.currentHp / inimigo.maxHp * 100) + "%";
        document.getElementById("enemy-hp-text").innerText = `${inimigo.currentHp} / ${inimigo.maxHp} HP`;

        if (inimigo.currentHp === 0) {
            alert("Você venceu a batalha!");
        }
    }
}

renderizarSelecao();