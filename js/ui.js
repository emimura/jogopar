const telaInicial = document.getElementById('tela-inicial');
const telaSelecaoTema = document.getElementById('tela-selecao-tema');
const telaJogo = document.getElementById('tela-jogo');
const telaResultado = document.getElementById('tela-resultado');

const gridCartas = document.getElementById('grid-cartas');
const spanTemaAtual = document.getElementById('tema-atual');
const spanNivelAtual = document.getElementById('nivel-atual'); // Novo
const spanParesEncontrados = document.getElementById('pares-encontrados');
const spanTotalPares = document.getElementById('total-pares');
const mensagemResultado = document.getElementById('mensagem-resultado');
const spanStatusCarregamento = document.getElementById('status-carregamento');

function mostrarTela(nomeTela) {
    // Esconde todas as telas
    telaInicial.classList.remove('ativa');
    telaJogo.classList.remove('ativa');
    telaResultado.classList.remove('ativa');
    // telaSelecaoTema não é mais usada ativamente para mostrar, mas pode ser mantida se houver planos futuros

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

    // Verso da carta
    const verso = document.createElement('div');
    verso.classList.add('verso-carta');
    verso.textContent = '?'; // Placeholder
    divCarta.appendChild(verso);

    // Frente da carta (conteúdo será preenchido ao virar)
    const frente = document.createElement('div');
    frente.classList.add('frente-carta');
    divCarta.appendChild(frente);

    return divCarta;
}