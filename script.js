const heroisDisponiveis = [
    {
        id: "homem_de_ferro",
        nome: "Homem de Ferro",
        hp: 110,
        preco: 0,
        comprado: true,
        golpes: [
            { nome: "Disparo da Mão", custo: 2, dano: 16, efeito: null },
            { nome: "Rede de Contenção", custo: 3, dano: 10, efeito: "lentidao" },
            { nome: "Super Carga de Plasma", custo: 5, dano: 50, efeito: null }
        ]
    },
    {
        id: "capitao_america",
        nome: "Capitão América",
        hp: 130,
        preco: 0,
        comprado: true,
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
        preco: 0,
        comprado: true,
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
        preco: 80,
        comprado: false,
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
        preco: 50,
        comprado: false,
        golpes: [
            { nome: "Ataque Furtivo", custo: 1, dano: 10, efeito: null },
            { nome: "Bastões Elétricos", custo: 3, dano: 15, efeito: "lentidao" },
            { nome: "Picada da Viúva", custo: 5, dano: 48, efeito: null }
        ]
    },
    {
        id: "hulk",
        nome: "Hulk",
        hp: 160,
        preco: 100,
        comprado: false,
        golpes: [
            { nome: "Soco Esmaga", custo: 2, dano: 20, efeito: null },
            { nome: "Grito de Fúria", custo: 3, dano: 0, efeito: "defesa" },
            { nome: "Esmaga Hulk!", custo: 6, dano: 60, efeito: null }
        ]
    },
    {
        id: "doutor_estranho",
        nome: "Doutor Estranho",
        hp: 95,
        preco: 90,
        comprado: false,
        golpes: [
            { nome: "Raios de Misticismo", custo: 2, dano: 14, efeito: null },
            { nome: "Olho de Agamotto", custo: 3, dano: 5, efeito: "lentidao" },
            { nome: "Invocação Mística", custo: 4, dano: 0, efeito: "cura" }
        ]
    }
];

let moedas = 100;
let meuTime = [];
let heroiAtualIndex = 0;

// Thanos configurado como Chefão
let inimigo = { nome: "Thanos", maxHp: 250, currentHp: 250, defesaAtiva: false, lento: false };

let currentEnergy = 0;
const maxEnergy = 10;
let chargeSpeed = 1.2;
let emLoja = false;

function atualizarMoedas() {
    document.getElementById("coin-count").innerText = moedas;
}

function toggleLoja() {
    emLoja = !emLoja;
    const shopScreen = document.getElementById("shop-screen");
    const selectionScreen = document.getElementById("selection-screen");
    const btnShop = document.getElementById("btn-toggle-shop");

    if (emLoja) {
        shopScreen.classList.remove("hidden");
        selectionScreen.classList.add("hidden");
        btnShop.innerText = "⚔️ Voltar";
        renderizarLoja();
    } else {
        shopScreen.classList.add("hidden");
        selectionScreen.classList.remove("hidden");
        btnShop.innerText = "🛒 Loja";
        renderizarSelecao();
    }
}

function renderizarLoja() {
    const container = document.getElementById("shop-container");
    container.innerHTML = "";

    heroisDisponiveis.forEach(heroi => {
        const card = document.createElement("div");
        card.className = "starter-card";
        
        let botaoHtml = heroi.comprado 
            ? `<button class="btn-buy" disabled>ADQUIRIDO</button>`
            : `<button class="btn-buy" onclick="comprarHeroi('${heroi.id}')">COMPRAR (🪙${heroi.preco})</button>`;

        card.innerHTML = `
            <h3>${heroi.nome}</h3>
            <p><strong>HP:</strong> ${heroi.hp}</p>
            ${botaoHtml}
        `;
        container.appendChild(card);
    });
}

function comprarHeroi(id) {
    const heroi = heroisDisponiveis.find(h => h.id === id);
    if (heroi && !heroi.comprado && moedas >= heroi.preco) {
        moedas -= heroi.preco;
        heroi.comprado = true;
        atualizarMoedas();
        renderizarLoja();
    }
}

function renderizarSelecao() {
    // Atualiza as plataformas circulares estilo Teeny Titans
    for (let i = 0; i < 3; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) {
            if (meuTime[i]) {
                slot.innerText = meuTime[i].nome;
                slot.classList.add("filled");
            } else {
                slot.innerText = "+ Escolher";
                slot.classList.remove("filled");
            }
        }
    }

    // Renderiza a lista de heróis
    const container = document.getElementById("starter-heroes-container");
    container.innerHTML = "";

    const heroisDesbloqueados = heroisDisponiveis.filter(h => h.comprado);

    heroisDesbloqueados.forEach(heroi => {
        const estaSelecionado = meuTime.some(h => h.id === heroi.id);
        const card = document.createElement("div");
        card.className = `starter-card ${estaSelecionado ? 'selected' : ''}`;
        card.innerHTML = `
            <h3>${heroi.nome}</h3>
            <p><strong>HP:</strong> ${heroi.hp}</p>
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
    document.getElementById("btn-toggle-shop").classList.add("hidden");

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
        if (move.efeito === "defesa") detalheEfeito = " [+Def]";
        if (move.efeito === "cura") detalheEfeito = " [+Cura]";
        if (move.efeito === "lentidao") detalheEfeito = " [Lento]";

        btn.innerText = `${move.nome}${detalheEfeito}\n(${move.custo} blocos)`;
        btn.onclick = () => atracar(move);
        movesContainer.appendChild(btn);
    });
}

function atracar(move) {
    if (currentEnergy >= move.custo) {
        currentEnergy -= move.custo;
        const heroi = meuTime[heroiAtualIndex];

        // Animação visual de ataque e dano
        const playerCard = document.getElementById("player-card");
        const enemyCard = document.getElementById("enemy-card");

        if (playerCard) {
            playerCard.classList.add("animar-ataque");
            setTimeout(() => playerCard.classList.remove("animar-ataque"), 400);
        }

        if (enemyCard) {
            setTimeout(() => {
                enemyCard.classList.add("animar-dano");
                setTimeout(() => enemyCard.classList.remove("animar-dano"), 400);
            }, 150);
        }

        // Cálculo do dano
        let danoFinal = move.dano;
        if (inimigo.defesaAtiva && danoFinal > 0) {
            danoFinal = Math.floor(danoFinal / 2);
            inimigo.defesaAtiva = false;
        }

        inimigo.currentHp -= danoFinal;
        if (inimigo.currentHp < 0) inimigo.currentHp = 0;

        if (move.efeito === "defesa") {
            heroi.defesaAtiva = true;
        } else if (move.efeito === "cura") {
            heroi.currentHp += 30;
            if (heroi.currentHp > heroi.hp) heroi.currentHp = heroi.hp;
        } else if (move.efeito === "lentidao") {
            inimigo.lento = true;
            setTimeout(() => { inimigo.lento = false; atualizarBadges(); }, 5000);
        }

        atualizarVidaPlayer();
        atualizarVidaInimigo();
        atualizarBadges();

        if (inimigo.currentHp === 0) {
            moedas += 100;
            atualizarMoedas();
            alert("Você derrotou Thanos e ganhou 100 moedas!");
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

atualizarMoedas();
renderizarSelecao();