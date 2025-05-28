document.addEventListener('DOMContentLoaded', () => {
    const btnIniciarPokemon = document.getElementById('btn-iniciar-pokemon');
    const btnVoltarMenuJogo = document.getElementById('btn-voltar-menu-jogo');
    const btnProximoNivel = document.getElementById('btn-proximo-nivel');
    const btnVoltarInicioResultado = document.getElementById('btn-voltar-inicio-resultado');

    if (btnIniciarPokemon) {
        btnIniciarPokemon.addEventListener('click', () => {
            nivelAtual = 1; // Reseta o nível
            numParesParaJogo = 2; // Reseta os pares para o início
            const btnProximo = document.getElementById('btn-proximo-nivel');
            const containerMasterball = document.getElementById('container-masterball');
            if(btnProximo) {
                btnProximo.style.display = 'inline-block'; // Garante que está visível
                btnProximo.textContent = "Próximo Nível";
                btnProximo.disabled = false;
            }
            if(containerMasterball) containerMasterball.style.display = 'none'; // Garante que a masterball está escondida
            iniciarJogo(numParesParaJogo);
        });
    }

    if (btnVoltarMenuJogo) {
        btnVoltarMenuJogo.addEventListener('click', () => {
            mostrarTela('inicial');
        });
    }

    if (btnProximoNivel) {
        btnProximoNivel.addEventListener('click', () => {
            if (numParesParaJogo < MAX_PARES_JOGO) {
                numParesParaJogo++;
                nivelAtual++;
                iniciarJogo(numParesParaJogo);
            } else {
                // Já está no máximo, o botão deveria estar desabilitado ou ter outro texto
                console.log("Todos os níveis concluídos!");
            }
        });
    }

    if (btnVoltarInicioResultado) {
        btnVoltarInicioResultado.addEventListener('click', () => {
            mostrarTela('inicial');
        });
    }

    // Inicia na tela inicial
    mostrarTela('inicial');
});