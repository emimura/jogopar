// let idadeJogador; // Não é mais necessário
let temaSelecionado = 'pokemon'; // Tema fixo
let configAtual; // Será definido dinamicamente por nível
let cartasParaJogar = [];
let primeiraCartaVirada = null;
let segundaCartaVirada = null;
let travarCliques = false;
let paresEncontradosContador = 0;
let totalParesNoJogoAtual = 0;

let nivelAtual = 1;
let numParesParaJogo = 2; // Começa com 2 pares (4 cartas)
const MAX_PARES_JOGO = 20; // Aumentado para 20 níveis/pares

function calcularGrid(numCartas) {
    let colunas, linhas;
    // Tenta manter uma proporção agradável
    if (numCartas <= 4) { colunas = 2; linhas = Math.ceil(numCartas / 2); }
    else if (numCartas <= 6) { colunas = 3; linhas = 2; }
    else if (numCartas <= 9) { colunas = 3; linhas = 3; } // 3x3 para 9 cartas (não usado com pares)
    else if (numCartas <= 10) { colunas = 5; linhas = 2; } // 5x2 para 10 cartas
    else if (numCartas <= 12) { colunas = 4; linhas = 3; }
    else if (numCartas <= 16) { colunas = 4; linhas = 4; }
    else if (numCartas <= 20) { colunas = 5; linhas = 4; }
    else { // Fallback para mais de 20 pares (40 cartas)
        colunas = Math.ceil(Math.sqrt(numCartas));
        linhas = Math.ceil(numCartas / colunas);
        // Ajuste para garantir que todas as cartas caibam
        while (colunas * linhas < numCartas) {
            if (colunas <= linhas) colunas++; else linhas++;
        }
    }
    return { colunas, linhas };
}

async function iniciarJogo(paresNesteNivel) {
    numParesParaJogo = paresNesteNivel;
    configAtual = { pares: numParesParaJogo, grid: calcularGrid(numParesParaJogo * 2) };

    paresEncontradosContador = 0;
    cartasParaJogar = [];
    primeiraCartaVirada = null;
    segundaCartaVirada = null;
    travarCliques = false;

    // spanTemaAtual.textContent = DADOS_JOGO.temas[temaSelecionado].nomeDisplay; // Tema é fixo
    if (spanNivelAtual) spanNivelAtual.textContent = nivelAtual;
    atualizarParesEncontradosDisplay();

    // Opcional: Mostrar mensagem de carregamento (requer elemento no HTML e ui.js)
    if (typeof spanStatusCarregamento !== 'undefined' && spanStatusCarregamento) {
        let mensagemCarregando = "Carregando Pokémon...";
        spanStatusCarregamento.textContent = mensagemCarregando;
        spanStatusCarregamento.style.display = 'block';
    }

    await prepararCartas(); // Aguarda a preparação das cartas, que pode envolver API

    // Opcional: Esconder mensagem de carregamento
    if (typeof spanStatusCarregamento !== 'undefined' && spanStatusCarregamento) {
        spanStatusCarregamento.textContent = "";
        spanStatusCarregamento.style.display = 'none';
    }

    if (cartasParaJogar.length === 0 && temaSelecionado === 'pokemon') {
        // Se prepararCartas falhou para pokemon e não populou cartasParaJogar
        // A mensagem de erro já foi dada em prepararCartas, e o usuário foi redirecionado.
        // Apenas garantimos que não prossiga se algo muito errado ocorreu.
        return;
    }

    renderizarCartas();
    mostrarTela('jogo');
}

async function fetchPokemonParaJogo(numItens) {
    console.log(`Buscando ${numItens} Pokémon da API...`);
    try {
        // 1. Buscar uma lista maior de Pokémon para ter variedade
        const responseList = await fetch('https://pokeapi.co/api/v2/pokemon?limit=200'); // Pega os primeiros 200 para ter uma boa base
        if (!responseList.ok) throw new Error(`Falha ao buscar lista de Pokémon: ${responseList.status}`);
        const dataList = await responseList.json();
        const todosOsPokemonRefs = dataList.results; // [{name: "bulbasaur", url: "..."}, ...]

        // 2. Embaralhar e selecionar o número necessário de referências de Pokémon
        const refsSelecionadas = embaralharArray([...todosOsPokemonRefs]).slice(0, numItens);

        // 3. Buscar detalhes de cada Pokémon selecionado (para pegar nome e imagem)
        const promessasPokemon = refsSelecionadas.map(async (pkmRef) => {
            const detailResponse = await fetch(pkmRef.url);
            if (!detailResponse.ok) {
                console.warn(`Falha ao buscar detalhes para ${pkmRef.name}: ${detailResponse.status}`);
                return null; // Retorna null se falhar para este Pokémon específico
            }
            const pkmData = await detailResponse.json();
            const nome = pkmData.name.charAt(0).toUpperCase() + pkmData.name.slice(1);
            // Para imagens de melhor qualidade, você pode tentar: pkmData.sprites.other['official-artwork'].front_default
            // Mas front_default é mais garantido de existir.
            const imagem = pkmData.sprites.front_default;
            if (!imagem) {
                console.warn(`Nenhuma imagem 'front_default' encontrada para ${nome}`);
                return null; // Se não houver imagem, não podemos usá-lo
            }
            return { id: pkmData.name, nome: nome, imagem: imagem };
        });

        const itensPokemon = (await Promise.all(promessasPokemon)).filter(item => item !== null); // Filtra os que falharam
        console.log(`${itensPokemon.length} Pokémon carregados com sucesso.`);
        return itensPokemon;

    } catch (error) {
        console.error("Erro ao buscar dados dos Pokémon da API:", error);
        throw error; // Re-throw para ser pego por prepararCartas
    }
}

async function prepararCartas() { // Tornada async
    let itensDoTemaParaJogo;
    const numItensUnicosParaJogo = configAtual.pares; // 'pares' aqui significa o número de itens únicos a serem pareados

    if (temaSelecionado === 'pokemon') {
        try {
            itensDoTemaParaJogo = await fetchPokemonParaJogo(numItensUnicosParaJogo);
            if (itensDoTemaParaJogo.length < numItensUnicosParaJogo && itensDoTemaParaJogo.length > 0) {
                console.warn(`API retornou ${itensDoTemaParaJogo.length} Pokémon, mas eram esperados ${numItensUnicosParaJogo}. Usando os disponíveis.`);
            } else if (itensDoTemaParaJogo.length === 0) {
                throw new Error("Nenhum Pokémon foi carregado da API.");
            }
        } catch (error) {
            alert(`Falha ao carregar os dados do tema ${DADOS_JOGO.temas[temaSelecionado].nomeDisplay}. Por favor, tente outro tema ou verifique sua conexão.`);
            // Opcional: Limpar mensagem de carregamento
            if (typeof spanStatusCarregamento !== 'undefined' && spanStatusCarregamento) {
                spanStatusCarregamento.textContent = "";
                spanStatusCarregamento.style.display = 'none';
            }
            mostrarTela('selecaoTema'); // Volta para a seleção de tema
            cartasParaJogar = [];
            return;
        }
    } else {
        // Lógica para temas com dados estáticos
        const todosOsItensDoTema = DADOS_JOGO.temas[temaSelecionado].itens;
        const itensDisponiveisShuffled = embaralharArray([...todosOsItensDoTema]);
        itensDoTemaParaJogo = itensDisponiveisShuffled.slice(0, numItensUnicosParaJogo);
    }

    totalParesNoJogoAtual = itensDoTemaParaJogo.length;

    spanTotalPares.textContent = totalParesNoJogoAtual; // Atualiza o display

    // 2. Criar as cartas individuais (duas para cada item selecionado)
    cartasParaJogar = []; // Limpar antes de preencher
    itensDoTemaParaJogo.forEach((item, index) => {
        // Para cada item (animal), criamos duas cartas idênticas
        const valorDaCarta = item.id; // O ID do animal será o valor para comparar o par

        cartasParaJogar.push({
            idUnico: `carta-${index}-a`, // ID único para o elemento DOM
            parId: item.id, // O ID do Pokémon (ex: "pikachu")
            valor: valorDaCarta, // O mesmo ID, para comparação
            conteudo: item, // O objeto {id, nome, imagem}
            virada: false,
            combinada: false
        });
        cartasParaJogar.push({
            idUnico: `carta-${index}-b`,
            parId: item.id,
            valor: valorDaCarta,
            conteudo: item,
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
    const temasComNomeEImagem = ['pokemon']; // Apenas Pokémon mostrará nome e imagem por enquanto

    if (mostrarFrente) {
        // Preenche o conteúdo da frente apenas se estiver vazio ou se for forçado (não implementado aqui)
        // Isso evita recarregar a imagem desnecessariamente se a carta for clicada e desvirada rapidamente.
        if (frente.innerHTML === '') {
            const conteudoNome = cartaInfo.conteudo.nome || '';
            const conteudoImagem = cartaInfo.conteudo.imagem || '';

            if (conteudoImagem) {
                let htmlFrente = `<img src="${conteudoImagem}" alt="${conteudoNome}" class="imagem-carta">`;
                // Adiciona o nome se for um dos temas especiais
                if (temasComNomeEImagem.includes(temaSelecionado)) {
                    htmlFrente += `<span class="nome-item-carta">${conteudoNome}</span>`;
                }
                frente.innerHTML = htmlFrente;
            } else if (conteudoNome) {
                // Se não tiver imagem, mas tiver nome (para temas que não são de API, por exemplo)
                // ou como fallback se a imagem da API falhar mas o nome vier.
                frente.innerHTML = `<span class="nome-item-carta-sem-imagem">${conteudoNome}</span>`;
            } else {
                frente.textContent = cartaInfo.conteudo.nome;
            }
        }
        elementoCarta.classList.add('virada');
    } else {
        elementoCarta.classList.remove('virada');
        // Não limpamos o innerHTML da frente aqui para que, se o usuário clicar novamente,
        // a imagem não precise ser recarregada. O CSS cuidará de esconder/mostrar.
    }
}


function aoClicarNaCarta(elementoCarta, cartaInfo) {
    if (travarCliques || cartaInfo.combinada || cartaInfo.virada) {
        return;
    }

    virarCartaVisualmente(elementoCarta, cartaInfo, true);

    if (!primeiraCartaVirada) {
        primeiraCartaVirada = { info: cartaInfo, elemento: elementoCarta };
        primeiraCartaVirada.info.virada = true;
    } else {
        segundaCartaVirada = { info: cartaInfo, elemento: elementoCarta };
        segundaCartaVirada.info.virada = true;
        travarCliques = true;

        if (primeiraCartaVirada.info.valor === segundaCartaVirada.info.valor) {
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
                console.log("[DEBUG] Desvirando cartas não combinadas.");
                // Verifica se primeiraCartaVirada e segundaCartaVirada ainda são válidos antes de acessá-los
                if (primeiraCartaVirada && primeiraCartaVirada.info && segundaCartaVirada && segundaCartaVirada.info) {
                    console.log("[DEBUG] Estado ANTES de desvirar - primeiraCarta.info.virada:", primeiraCartaVirada.info.virada, "segundaCarta.info.virada:", segundaCartaVirada.info.virada);

                    virarCartaVisualmente(primeiraCartaVirada.elemento, primeiraCartaVirada.info, false);
                    virarCartaVisualmente(segundaCartaVirada.elemento, segundaCartaVirada.info, false);

                    primeiraCartaVirada.info.virada = false;
                    segundaCartaVirada.info.virada = false;

                    console.log("[DEBUG] Estado DEPOIS de desvirar - primeiraCarta.info.virada:", primeiraCartaVirada.info.virada, "segundaCarta.info.virada:", segundaCartaVirada.info.virada);
                } else {
                    console.warn("[DEBUG] Tentativa de desvirar cartas, mas primeiraCartaVirada ou segundaCartaVirada é null/undefined.");
                }
                primeiraCartaVirada = null;
                segundaCartaVirada = null;
                travarCliques = false;
                console.log("[DEBUG] Estado do jogo resetado, travarCliques:", travarCliques);
            }, 1000);
        }
    }
}

function atualizarParesEncontradosDisplay() {
    spanParesEncontrados.textContent = paresEncontradosContador;
}

function verificarFimDeJogo() {
    if (totalParesNoJogoAtual > 0 && paresEncontradosContador === totalParesNoJogoAtual) {
        // Nível concluído
        const btnProximo = document.getElementById('btn-proximo-nivel');
        const containerMasterball = document.getElementById('container-masterball');

        if (numParesParaJogo < MAX_PARES_JOGO) {
            mensagemResultado.textContent = `Nível ${nivelAtual} completo! Prepare-se para o próximo!`;
            // O botão "Próximo Nível" em tela-resultado cuidará de avançar
            if(btnProximo) {
                btnProximo.style.display = 'inline-block'; // Garante que está visível
                btnProximo.textContent = "Próximo Nível";
                btnProximo.disabled = false;
            }
            if(containerMasterball) containerMasterball.style.display = 'none'; // Esconde a masterball
        } else {
            mensagemResultado.innerHTML = `Parabéns!<br>Você concluiu todos os ${nivelAtual} níveis!<br>Agora você é um Mestre Pokémon!`; // Nova mensagem
            // Desabilitar o botão "Próximo Nível" ou mudar seu texto
            if(btnProximo) {
                btnProximo.style.display = 'none'; // Esconde o botão de próximo nível
            }
            if(containerMasterball) containerMasterball.style.display = 'block'; // Mostra a masterball

            // Lançar confetes!
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 150,
                    spread: 180,
                    origin: { y: 0.6 }
                });
                // Alguns fogos de artifício extras
                setTimeout(() => confetti({ particleCount: 100, spread: 60, origin: { x: 0.2, y: 0.7}, angle: 60, scalar: 1.2 }), 300);
                setTimeout(() => confetti({ particleCount: 100, spread: 60, origin: { x: 0.8, y: 0.7}, angle: 120, scalar: 1.2 }), 300);
            }
        }
        mostrarTela('resultado');
    }
}

function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}