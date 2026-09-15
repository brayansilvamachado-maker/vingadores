const heroisDisponiveis = [
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
    },
    {
        id: "thor",
        nome: "Thor",
        hp: 120,
        classe: "Força",
        golpes: [
            { nome: "Martelada", custo: 2, dano: 16 },
            { nome: "Trovão", custo: 4, dano: 35 },
            { nome: "Ira de Asgard", custo: 6, dano: 55 }
        ]
    },
    {
        id: "viuva_negra",
        nome: "Viúva Negra",
        hp: 85,
        classe: "Agilidade",
        golpes: [
            { nome: "Ataque Furtivo", custo: 1, dano: 10 },
            { nome: "Bastões elétricos", custo: 3, dano: 26 },
            { nome: "Picada da Viúva", custo: 5, dano: 48 }
        ]
    }
];

let meuTime = [];
let heroiAtualIndex = 0;
let inimigo = { nome: "Ultron", maxHp: 150, currentHp: 150 };

let currentEnergy = 0;
const maxEnergy = 10;
const chargeSpeed = 1.2;

function renderizarSelecao() {
    const container = document.getElementById("starter-heroes-container");
    container.innerHTML = "";

    heroisDisponiveis.forEach(heroi => {
        const estaSelecionado = meuTime.some(h => h.id === heroi.id);
        const card = document.createElement("div");
        card.className = `starter-card ${estaSelecionado ? 'selected' : ''}`;
        card.innerHTML = `
            <h3>${heroi.nome}</h3>
            <p><strong>HP:</strong> ${heroi.hp}</p>
            <p><strong>Tipo:</strong> ${heroi.classe}</p>
        `;
        card.onclick = () => alternarSelecao(heroi);
        container.appendChild(card);
    });

    const btnStart = document.getElementById("btn-start-battle");
    if (meuTime.length === 3) {
        btnStart.classList.remove("hidden");
    } else {
        btnStart.classList.add("hidden");
    }
}

function alternarSelecao(heroi) {
    const index = meuTime.findIndex(h => h.id === heroi.id);
    if (index > -1) {
        meuTime.splice(index, 1);
    } else if (meuTime.length < 3) {
        meuTime.push({ ...heroi, currentHp: heroi.hp });
    }
    renderizarSelecao();
}

function iniciarBatalha() {
    document.getElementById("selection-screen").classList.add("hidden");
    document.getElementById("battle-screen").classList.remove("hidden");

    criarBlocosEnergia();
    atualizarHeroiEmCampo();
    setInterval(update, 50);
}

function atualizarHeroiEmCampo() {
    const heroi = meuTime[heroiAtualIndex];
    document.getElementById("player-name").innerText = heroi.nome;
    atualizarVidaPlayer();
    setupMoves();
    renderizarPainelTroca();
}

function renderizarPainelTroca() {
    const bench = document.getElementById("team-bench");
    bench.innerHTML = "";

    meuTime.forEach((heroi, index) => {
        const card = document.createElement("div");
        let statusClass = index === heroiAtualIndex ? "active-hero" : "";
        if (heroi.currentHp <= 0) statusClass += " fainted";

        card.className = `bench-card ${statusClass}`;
        card.innerText = `${heroi.nome} (${heroi.currentHp}/${heroi.hp})`;
        
        card.onclick = () => trocarDeHeroi(index);
        bench.appendChild(card);
    });
}

function trocarDeHeroi(index) {
    if (index === heroiAtualIndex || meuTime[index].currentHp <= 0) return;
    heroiAtualIndex = index;
    atualizarHeroiEmCampo();
}

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

function update() {
    if (currentEnergy < maxEnergy) {
        currentEnergy += chargeSpeed * 0.05;
        if (currentEnergy > maxEnergy) currentEnergy = maxEnergy;
    }

    const blocosCompletos = Math.floor(currentEnergy);
    for (let i = 0; i < maxEnergy; i++) {
        const block = document.getElementById(`block-${i}`);
        if (block) {
            if (i < blocosCompletos) block.classList.add("active");
            else block.classList.remove("active");
        }
    }

    const heroi = meuTime[heroiAtualIndex];
    if (heroi && heroi.currentHp > 0) {
        heroi.golpes.forEach((move, index) => {
            const btn = document.getElementById(`move-btn-${index}`);
            if (btn) btn.disabled = blocosCompletos < move.custo;
        });
    }
}

function setupMoves() {
    const movesContainer = document.getElementById("moves-container");
    movesContainer.innerHTML = "";
    
    const heroi = meuTime[heroiAtualIndex];
    heroi.golpes.forEach((move, index) => {
        const btn = document.createElement("button");
        btn.id = `move-btn-${index}`;
        btn.className = "btn-move";
        btn.innerText = `${move.nome}\n(${move.custo} blocos)`;
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

function atualizarVidaPlayer() {
    const heroi = meuTime[heroiAtualIndex];
    const pct = (heroi.currentHp / heroi.hp * 100);
    document.getElementById("player-hp-fill").style.width = pct + "%";
    document.getElementById("player-hp-text").innerText = `${heroi.currentHp} / ${heroi.hp} HP`;
}

renderizarSelecao();