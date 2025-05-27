let idadeJogador;
let temaSelecionado;
let configAtual;
let paresDoTema;
let cartasParaJogar = [];
let primeiraCartaVirada = null;
let segundaCartaVirada = null;
let travarCliques = false;
let paresEncontradosContador = 0;

function iniciarJogo(idade, tema) {
    idadeJogador = idade;
    temaSelecionado = tema;
    configAtual = DADOS_JOGO.configDificuldade[idadeJogador];
    paresDoTema = DADOS_JOGO.temas[temaSelecionado].pares;

    paresEncontradosContador = 0;
    cartasParaJogar = [];
    primeiraCartaVirada = null;
    segundaCartaVirada = null;
    travarCliques = false;

    spanTemaAtual.textContent = DADOS_JOGO.temas[temaSelecionado].nomeDisplay;
    spanTotalPares.textContent = configAtual.pares;
    atualizarParesEncontradosDisplay();

    prepararCartas();
    renderizarCartas();
    mostrarTela('jogo');
}

function prepararCartas() {
    // 1. Selecionar o número de pares conforme a dificuldade
    const paresSelecionados = embaralharArray(paresDoTema).slice(0, configAtual.pares);

    // 2. Criar as cartas individuais (duas para cada par)
    paresSelecionados.forEach((par, index) => {
        const valorPar = `${par.id1}_${par.id2}`; // Um valor único para identificar o par
        cartasParaJogar.push({
            idUnico: `carta-${index}-a`, // ID único para o elemento DOM
            parId: par.id1, // ID do item específico (ex: 'leao')
            valor: valorPar,
            conteudo: par.item1, // { nome: "Leão", imagem: "..." }
            virada: false,
            combinada: false
        });
        cartasParaJogar.push({
            idUnico: `carta-${index}-b`,
            parId: par.id2, // ID do item específico (ex: 'savana')
            valor: valorPar,
            conteudo: par.item2,
            virada: false,
            combinada: false
        });
    });

    // 3. Embaralhar as cartas
    cartasParaJogar = embaralharArray(cartasParaJogar);
}

function renderizarCartas() {
    gridCartas.innerHTML = ''; // Limpa o grid anterior
    gridCartas.style.gridTemplateColumns = `repeat(${configAtual.grid.colunas}, auto)`;

    cartasParaJogar.forEach(cartaInfo => {
        const elementoCarta = criarCartaHTML(cartaInfo, cartaInfo.idUnico);
        // Adicionar o event listener para o clique na carta
        elementoCarta.addEventListener('click', () => aoClicarNaCarta(elementoCarta, cartaInfo));
        gridCartas.appendChild(elementoCarta);
    });
}

function aoClicarNaCarta(elementoCarta, cartaInfo) {
    if (travarCliques || cartaInfo.virada || cartaInfo.combinada) {
        return; // Não faz nada se os cliques estiverem travados, a carta já virada ou combinada
    }

    // Lógica de virar a carta (será implementada)
    console.log("Clicou na carta:", cartaInfo.conteudo.nome, "ID:", cartaInfo.idUnico, "Par ID:", cartaInfo.parId, "Valor do Par:", cartaInfo.valor);
    // Aqui viria a lógica para mostrar a imagem/nome, verificar pares, etc.
    // Por enquanto, apenas um log.

    // Placeholder para a lógica de virar e checar par:
    // virarCarta(elementoCarta, cartaInfo);
    // checarPar();
}

function atualizarParesEncontradosDisplay() {
    spanParesEncontrados.textContent = paresEncontradosContador;
}

function verificarFimDeJogo() {
    if (paresEncontradosContador === configAtual.pares) {
        // Adicionar um pequeno delay para o jogador ver o último par
        setTimeout(() => {
            mensagemResultado.textContent = `Você encontrou todos os ${configAtual.pares} pares do tema ${DADOS_JOGO.temas[temaSelecionado].nomeDisplay}!`;
            mostrarTela('resultado');
        }, 1000);
    }
}

// Função utilitária para embaralhar arrays (Algoritmo de Fisher-Yates)
function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Troca de elementos
    }
    return array;
}