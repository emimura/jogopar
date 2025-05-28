let idadeJogador;
let temaSelecionado;
let configAtual;
let cartasParaJogar = [];
let primeiraCartaVirada = null;
let segundaCartaVirada = null;
let travarCliques = false;
let paresEncontradosContador = 0;
let totalParesNoJogoAtual = 0; // Novo: para guardar o número real de pares no jogo

function iniciarJogo(idade, tema) {
    idadeJogador = idade;
    temaSelecionado = tema;
    configAtual = DADOS_JOGO.configDificuldade[idadeJogador];

    paresEncontradosContador = 0;
    cartasParaJogar = [];
    primeiraCartaVirada = null;
    segundaCartaVirada = null;
    travarCliques = false;
    totalParesNoJogoAtual = 0; // Reset

    spanTemaAtual.textContent = DADOS_JOGO.temas[temaSelecionado].nomeDisplay;
    // spanTotalPares será atualizado em prepararCartas
    atualizarParesEncontradosDisplay();

    prepararCartas(); // Define totalParesNoJogoAtual e atualiza spanTotalPares
    renderizarCartas();
    mostrarTela('jogo');
}

function prepararCartas() {
    const todosOsItensDoTema = DADOS_JOGO.temas[temaSelecionado].itens; // Mudança: usa 'itens'
    const itensDisponiveisShuffled = embaralharArray([...todosOsItensDoTema]);
    const numItensUnicosParaJogo = configAtual.pares; // 'pares' aqui significa o número de itens únicos a serem pareados

    // 1. Selecionar o número de itens únicos (animais) conforme a dificuldade
    const itensSelecionadosParaJogo = itensDisponiveisShuffled.slice(0, numItensUnicosParaJogo);
    totalParesNoJogoAtual = itensSelecionadosParaJogo.length; // Número de pares a serem encontrados

    spanTotalPares.textContent = totalParesNoJogoAtual; // Atualiza o display

    // 2. Criar as cartas individuais (duas para cada item selecionado)
    cartasParaJogar = []; // Limpar antes de preencher
    itensSelecionadosParaJogo.forEach((item, index) => {
        // Para cada item (animal), criamos duas cartas idênticas
        const valorDaCarta = item.id; // O ID do animal será o valor para comparar o par

        cartasParaJogar.push({
            idUnico: `carta-${index}-a`, // ID único para o elemento DOM
            parId: item.id,
            valor: valorDaCarta,
            conteudo: item,
            virada: false,
            combinada: false
        });
        cartasParaJogar.push({
            idUnico: `carta-${index}-b`,
            parId: item.id,      // Correção: usar item.id
            valor: valorDaCarta, // Correção: usar valorDaCarta
            conteudo: item,      // Correção: usar item
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

function virarCartaVisualmente(elementoCarta, cartaInfo, mostrarFrente) {
    const frente = elementoCarta.querySelector('.frente-carta');
    // const verso = elementoCarta.querySelector('.verso-carta'); // Não manipulado diretamente aqui

    if (mostrarFrente) {
        if (frente.innerHTML === '') { // Preencher conteúdo da frente apenas uma vez ou se necessário
            if (cartaInfo.conteudo.imagem) {
                frente.innerHTML = `<img src="${cartaInfo.conteudo.imagem}" alt="${cartaInfo.conteudo.nome}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
            } else {
                frente.textContent = cartaInfo.conteudo.nome;
            }
        }
        elementoCarta.classList.add('virada');
    } else {
        elementoCarta.classList.remove('virada');
        // Opcional: limpar frente.innerHTML se for muito pesado, mas geralmente não é necessário
    }
}

function aoClicarNaCarta(elementoCarta, cartaInfo) {
    // Ignora clique se:
    // - Cliques estão travados (aguardando par resolver)
    // - Carta já foi combinada
    // - Carta já está virada (é a primeiraCartaVirada sendo clicada novamente)
    if (travarCliques || cartaInfo.combinada || cartaInfo.virada) {
        return;
    }

    virarCartaVisualmente(elementoCarta, cartaInfo, true); // Mostra a frente da carta

    if (!primeiraCartaVirada) {
        primeiraCartaVirada = { info: cartaInfo, elemento: elementoCarta };
        primeiraCartaVirada.info.virada = true; // Marca como logicamente virada
    } else {
        segundaCartaVirada = { info: cartaInfo, elemento: elementoCarta };
        segundaCartaVirada.info.virada = true; // Marca como logicamente virada
        travarCliques = true; // Trava cliques enquanto verifica o par

        if (primeiraCartaVirada.info.valor === segundaCartaVirada.info.valor) {
            // Encontrou um par
            primeiraCartaVirada.info.combinada = true;
            segundaCartaVirada.info.combinada = true;

            primeiraCartaVirada.elemento.classList.add('combinada');
            segundaCartaVirada.elemento.classList.add('combinada');

            paresEncontradosContador++;
            atualizarParesEncontradosDisplay();

            primeiraCartaVirada = null;
            segundaCartaVirada = null;
            travarCliques = false;

            verificarFimDeJogo();
        } else {
            // Não é um par
            setTimeout(() => {
                virarCartaVisualmente(primeiraCartaVirada.elemento, primeiraCartaVirada.info, false);
                virarCartaVisualmente(segundaCartaVirada.elemento, segundaCartaVirada.info, false);

                primeiraCartaVirada.info.virada = false; // Reseta estado lógico
                segundaCartaVirada.info.virada = false; // Reseta estado lógico

                primeiraCartaVirada = null;
                segundaCartaVirada = null;
                travarCliques = false;
            }, 1000); // Tempo para o jogador ver a segunda carta
        }
    }
}

function atualizarParesEncontradosDisplay() {
    spanParesEncontrados.textContent = paresEncontradosContador;
}

function verificarFimDeJogo() {
    if (totalParesNoJogoAtual > 0 && paresEncontradosContador === totalParesNoJogoAtual) {
        // Adicionar um pequeno delay para o jogador ver o último par
        setTimeout(() => {
            mensagemResultado.textContent = `Você encontrou todos os ${totalParesNoJogoAtual} pares do tema ${DADOS_JOGO.temas[temaSelecionado].nomeDisplay}!`;
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