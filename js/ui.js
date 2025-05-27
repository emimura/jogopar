const telaInicial = document.getElementById('tela-inicial');
const telaSelecaoTema = document.getElementById('tela-selecao-tema');
const telaJogo = document.getElementById('tela-jogo');
const telaResultado = document.getElementById('tela-resultado');

const gridCartas = document.getElementById('grid-cartas');
const spanTemaAtual = document.getElementById('tema-atual');
const spanParesEncontrados = document.getElementById('pares-encontrados');
const spanTotalPares = document.getElementById('total-pares');
const mensagemResultado = document.getElementById('mensagem-resultado');

function mostrarTela(nomeTela) {
    // Esconde todas as telas
    telaInicial.classList.remove('ativa');
    telaSelecaoTema.classList.remove('ativa');
    telaJogo.classList.remove('ativa');
    telaResultado.classList.remove('ativa');

    // Mostra a tela desejada
    if (nomeTela === 'inicial') {
        telaInicial.classList.add('ativa');
    } else if (nomeTela === 'selecaoTema') {
        telaSelecaoTema.classList.add('ativa');
    } else if (nomeTela === 'jogo') {
        telaJogo.classList.add('ativa');
    } else if (nomeTela === 'resultado') {
        telaResultado.classList.add('ativa');
    }
}

function criarCartaHTML(cartaInfo, idCarta) {
    const divCarta = document.createElement('div');
    divCarta.classList.add('carta');
    divCarta.dataset.id = idCarta; // Identificador único para a carta no DOM
    divCarta.dataset.parId = cartaInfo.parId; // Identificador do par a que pertence (ex: 'leao' ou 'savana')
    divCarta.dataset.valor = cartaInfo.valor; // O valor que define o par (ex: 'leao_savana')

    // Conteúdo da carta (verso) - inicialmente escondido ou mostrando um placeholder
    // A lógica de virar e mostrar a imagem/nome virá depois em game.js
    const verso = document.createElement('div');
    verso.classList.add('verso-carta');
    verso.textContent = '?'; // Placeholder
    divCarta.appendChild(verso);

    // Adicionaremos a frente da carta (imagem/nome) dinamicamente ao virar

    return divCarta;
}