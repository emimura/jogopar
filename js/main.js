// Variável para armazenar a idade selecionada pelo jogador
// É importante que esta variável seja acessível pelas funções que precisam dela.
// No seu game.js, 'idadeJogador' é uma variável global. Vamos manter essa consistência por enquanto,
// mas idealmente, ela seria gerenciada de forma mais encapsulada ou passada como parâmetro.
// Se 'idadeJogador' já está declarada em game.js e acessível globalmente, não precisa redeclará-la aqui.
// let idadeSelecionadaPeloJogador; // Se não estiver global em game.js

document.addEventListener('DOMContentLoaded', () => {
    // Tela Inicial: Seleção de Idade
    const botoesIdade = document.querySelectorAll('.btn-idade');
    // Pega todos os botões de tema para poder manipulá-los depois
    const todosOsBotoesTema = document.querySelectorAll('.btn-tema');

    botoesIdade.forEach(botao => {
        botao.addEventListener('click', () => {
            const idade = parseInt(botao.dataset.idade);
            selecionarIdade(idade);
        });
    });

    // Tela de Seleção de Tema
    // Adicionamos o listener a todos os botões de tema, a visibilidade deles será controlada
    todosOsBotoesTema.forEach(botao => {
        botao.addEventListener('click', () => {
            const tema = botao.dataset.tema;
            selecionarTema(tema);
        });
    });

    document.getElementById('btn-voltar-idade').addEventListener('click', () => {
        mostrarTela('inicial');
    });

    // Tela de Jogo
    document.getElementById('btn-voltar-tema').addEventListener('click', () => {
        mostrarTela('selecaoTema');
    });

    // Tela de Resultado
    document.getElementById('btn-jogar-novamente').addEventListener('click', () => {
        // Reinicia o jogo com a mesma idade e tema
        iniciarJogo(idadeJogador, temaSelecionado);
    });
    document.getElementById('btn-escolher-outro-tema-resultado').addEventListener('click', () => {
        mostrarTela('selecaoTema');
    });
    document.getElementById('btn-voltar-inicio-resultado').addEventListener('click', () => {
        mostrarTela('inicial');
    });

    // Inicia na tela inicial
    mostrarTela('inicial');
});

// Mapeamento de quais temas são permitidos para cada idade
const temasPermitidosPorIdade = {
    2: ['animais'], // Para 2 anos, apenas 'animais'
    // Idades 3, 4, 5 não têm regras específicas aqui, então mostrarão todos os temas por padrão (ou como definido abaixo)
    6: ['pokemon', 'bandeiras', 'dinossauros'] // Para 6 anos, adicionado 'dinossauros'
};

// Função para atualizar a visibilidade dos botões de tema
function atualizarVisibilidadeTemas(idade) {
    const temasPermitidosParaEstaIdade = temasPermitidosPorIdade[idade];
    const todosOsBotoesTema = document.querySelectorAll('.btn-tema'); // Garante que estamos pegando a lista atualizada

    todosOsBotoesTema.forEach(botao => {
        const temaDoBotao = botao.dataset.tema;

        if (temasPermitidosParaEstaIdade) { // Se há uma regra específica para esta idade
            if (temasPermitidosParaEstaIdade.includes(temaDoBotao)) {
                botao.style.display = 'inline-block'; // Ou 'block', dependendo do seu CSS
            } else {
                botao.style.display = 'none';
            }
        } else {
            // Comportamento padrão se a idade não tem regra específica: mostrar todos os temas
            // Se você quiser esconder temas para idades não listadas, mude para 'none'
            botao.style.display = 'inline-block';
        }
    });
}

function selecionarIdade(idade) {
    console.log("Idade selecionada:", idade);
    // 'idadeJogador' é a variável global definida em game.js
    // Se você não a tivesse em game.js, usaria: idadeSelecionadaPeloJogador = idade;
    idadeJogador = idade;
    atualizarVisibilidadeTemas(idade); // Chama a função para filtrar os temas
    mostrarTela('selecaoTema');
}

function selecionarTema(tema) {
    console.log("Tema selecionado:", tema);
    iniciarJogo(idadeJogador, tema); // 'idadeJogador' já deve estar definida pela função selecionarIdade
}