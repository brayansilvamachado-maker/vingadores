const heroisDisponiveis = [
    {
        id: "homem_de_ferro",
        nome: "Homem de Ferro",
        hp: 100,
        classe: "Ataque",
        golpes: [
            { nome: "Soco Repulsor", custo: 2, dano: 15, efeito: null },
            { nome: "Escudo Fotônico", custo: 3, dano: 0, efeito: "defesa" },
            { nome: "Unibeam", custo: 6, dano: 50, efeito: null }
        ]
    },
    {
        id: "capitao_america",
        nome: "Capitão América",
        hp: 130,
        classe: "Defesa",
        golpes: [
            { nome: "Golpe de Escudo", custo: 2, dano: 12, efeito: null },
            { nome: "Postura Defensiva", custo: 3, dano: 0, efeito: "defesa" },
            { nome: "Lançar Escudo", custo: 5, dano: 40, efeito: null }
        ]
    },
    {
        id: "homem_aranha",
        nome: "Homem-Aranha",
        hp: 90,
        classe: "Velocidade",
        golpes: [
            { nome: "Chute Teia", custo: 2, dano: 18, efeito: null },
            { nome: "Teia Lenta", custo: 3, dano: 10, efeito: "lentidao" },
            { nome: "Combo de Teias", custo: 5, dano: 45, efeito: null }
        ]
    },
    {
        id: "thor",
        nome: "Thor",
        hp: 120,
        classe: "Força",
        golpes: [
            { nome: "Martelada", custo: 2, dano: 16, efeito: null },
            { nome: "Bênção de Asgard", custo: 3, dano: 0, efeito: "cura" },
            { nome: "Ira de Asgard", custo: 6, dano: 55, efeito: null }
        ]
    },
    {
        id: "viuva_negra",
        nome: "Viúva Negra",
        hp: 85,
        classe: "Agilidade",
        golpes: [
            { nome: "Ataque Furtivo", custo: 1, dano: 10, efeito: null },
            { nome: "Bastões Elétricos", custo: 3, dano: 15, efeito: "lentidao" },
            { nome: "Picada da Viúva", custo: 5, dano: 48, efeito: null }
        ]
    }
];

let meuTime = [];
let heroiAtualIndex = 0;
let inimigo = { nome: "Ultron", maxHp: 150, currentHp: 150, defesaAtiva: false, lento: false };

let currentEnergy = 0;
const maxEnergy = 10;
let chargeSpeed = 1.2;

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
        meuTime.push({ ...heroi, currentHp: heroi.hp, defesaAtiva: false });
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
    atualizarBadges();
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
    // Aplica velocidade reduzida se estiver sob efeito de lentidão
    let vel = inimigo.lento ? chargeSpeed * 0.5 : chargeSpeed;

    if (currentEnergy < maxEnergy) {
        currentEnergy += vel * 0.05;
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
        
        let detalheEfeito = "";
        if (move.efeito === "defesa") detalheEfeito = " [+Defesa]";
        if (move.efeito === "cura") detalheEfeito = " [+Cura]";
        if (move.efeito === "lentidao") detalheEfeito = " [Lentidão]";

        btn.innerText = `${move.nome}${detalheEfeito}\n(${move.custo} blocos)`;
        btn.onclick = () => atracar(move);
        movesContainer.appendChild(btn);
    });
}

function atracar(move) {
    if (currentEnergy >= move.custo) {
        currentEnergy -= move.custo;
        const heroi = meuTime[heroiAtualIndex];

        // Lógica de Dano e Defesa do Inimigo
        let danoFinal = move.dano;
        if (inimigo.defesaAtiva && danoFinal > 0) {
            danoFinal = Math.floor(danoFinal / 2);
            inimigo.defesaAtiva = false; // Defesa consome após o ataque
        }

        inimigo.currentHp -= danoFinal;
        if (inimigo.currentHp < 0) inimigo.currentHp = 0;

        // Lógica de Efeitos de Status
        if (move.efeito === "defesa") {
            heroi.defesaAtiva = true;
        } else if (move.efeito === "cura") {
            heroi.currentHp += 30;
            if (heroi.currentHp > heroi.hp) heroi.currentHp = heroi.hp;
        } else if (move.efeito === "lentidao") {
            inimigo.lento = true;
            setTimeout(() => { inimigo.lento = false; atualizarBadges(); }, 5000); // Dura 5 segundos
        }

        atualizarVidaPlayer();
        atualizarVidaInimigo();
        atualizarBadges();

        if (inimigo.currentHp === 0) {
            alert("Você venceu a batalha!");
        }
    }
}

function atualizarBadges() {
    const heroi = meuTime[heroiAtualIndex];
    const playerBadge = document.getElementById("player-status-text");
    const enemyBadge = document.getElementById("enemy-status-text");

    playerBadge.innerText = heroi.defesaAtiva ? "🛡️ DEFESA ALTA" : "";
    
    let statusInimigo = [];
    if (inimigo.defesaAtiva) statusInimigo.push("🛡️ DEFESA");
    if (inimigo.lento) statusInimigo.push("🕸️ LENTO");
    enemyBadge.innerText = statusInimigo.join(" ");
}

function atualizarVidaPlayer() {
    const heroi = meuTime[heroiAtualIndex];
    const pct = (heroi.currentHp / heroi.hp * 100);
    document.getElementById("player-hp-fill").style.width = pct + "%";
    document.getElementById("player-hp-text").innerText = `${heroi.currentHp} / ${heroi.hp} HP`;
    renderizarPainelTroca();
}

function atualizarVidaInimigo() {
    const pct = (inimigo.currentHp / inimigo.maxHp * 100);
    document.getElementById("enemy-hp-fill").style.width = pct + "%";
    document.getElementById("enemy-hp-text").innerText = `${inimigo.currentHp} / ${inimigo.maxHp} HP`;
}

renderizarSelecao();