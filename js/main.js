document.addEventListener('DOMContentLoaded', () => {
    // Tela Inicial: Seleção de Idade
    const botoesIdade = document.querySelectorAll('.btn-idade');
    botoesIdade.forEach(botao => {
        botao.addEventListener('click', () => {
            const idade = parseInt(botao.dataset.idade);
            selecionarIdade(idade);
        });
    });

    // Tela de Seleção de Tema
    const botoesTema = document.querySelectorAll('.btn-tema');
    botoesTema.forEach(botao => {
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

function selecionarIdade(idade) {
    console.log("Idade selecionada:", idade);
    idadeJogador = idade; // Armazena globalmente para uso posterior
    mostrarTela('selecaoTema');
}

function selecionarTema(tema) {
    console.log("Tema selecionado:", tema);
    iniciarJogo(idadeJogador, tema); // Passa a idade e o tema para iniciar o jogo
}