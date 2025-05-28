let idadeJogador;
let temaSelecionado;
let configAtual;
let cartasParaJogar = [];
let primeiraCartaVirada = null;
let segundaCartaVirada = null;
let travarCliques = false;
let paresEncontradosContador = 0;
let totalParesNoJogoAtual = 0; // Novo: para guardar o número real de pares no jogo

async function iniciarJogo(idade, tema) { // Tornada async
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
    atualizarParesEncontradosDisplay();

    // Opcional: Mostrar mensagem de carregamento (requer elemento no HTML e ui.js)
    if (typeof spanStatusCarregamento !== 'undefined' && spanStatusCarregamento) {
        let mensagemCarregando = "Carregando..."; // Default
        if (temaSelecionado === 'pokemon') {
            mensagemCarregando = "Carregando Pokémon...";
        } else if (temaSelecionado === 'bandeiras') {
            mensagemCarregando = "Carregando Bandeiras...";
        } else if (temaSelecionado === 'dinossauros') {
            mensagemCarregando = "Carregando Dinossauros...";
        }
        spanStatusCarregamento.textContent = mensagemCarregando;
        spanStatusCarregamento.style.display = 'block';
    }

    await prepararCartas(); // Aguarda a preparação das cartas, que pode envolver API

    // Opcional: Esconder mensagem de carregamento
    if (typeof spanStatusCarregamento !== 'undefined' && spanStatusCarregamento) {
        spanStatusCarregamento.textContent = "";
        spanStatusCarregamento.style.display = 'none';
    }

    if (cartasParaJogar.length === 0 && (temaSelecionado === 'pokemon' || temaSelecionado === 'bandeiras' || temaSelecionado === 'dinossauros')) {
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

async function fetchBandeirasParaJogo(numItens) {
    console.log(`Buscando ${numItens} bandeiras da API...`);
    try {
        // 1. Buscar uma lista de países. A API retorna muitos dados, pegamos apenas nome e bandeiras.
        const responseList = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
        if (!responseList.ok) throw new Error(`Falha ao buscar lista de países: ${responseList.status}`);
        const dataList = await responseList.json(); // Array de objetos de países

        // 2. Filtrar países que têm a imagem da bandeira em PNG (mais comum) e nome comum
        const paisesComBandeira = dataList.filter(pais => pais.flags && pais.flags.png && pais.name && pais.name.common);

        // 3. Embaralhar e selecionar o número necessário de países
        const paisesSelecionados = embaralharArray([...paisesComBandeira]).slice(0, numItens);

        // 4. Formatar os dados para o formato do jogo
        const itensBandeiras = paisesSelecionados.map(pais => {
            const nomeComum = pais.name.common;
            // Criar um ID simples a partir do nome comum
            const id = nomeComum.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30); // Limita e sanitiza o ID
            return {
                id: id,
                nome: nomeComum,
                imagem: pais.flags.png // Usaremos a imagem PNG da bandeira
            };
        });

        if (itensBandeiras.length < numItens && itensBandeiras.length > 0) {
            console.warn(`API retornou ${itensBandeiras.length} bandeiras, mas eram esperadas ${numItens}. Usando as disponíveis.`);
        } else if (itensBandeiras.length === 0 && numItens > 0) {
             throw new Error("Nenhuma bandeira foi carregada da API com os critérios esperados.");
        }

        console.log(`${itensBandeiras.length} bandeiras carregadas com sucesso.`);
        return itensBandeiras;
    } catch (error) {
        console.error("Erro ao buscar dados das bandeiras da API:", error);
        throw error; // Re-throw para ser pego por prepararCartas
    }
}

async function fetchDinossaurosParaJogo(numItens) {
    const CATEGORY_API_URL = 'https://dinosaurpictures.org/api/category/all';
    const DETAIL_API_BASE_URL = 'https://dinosaurpictures.org/api/dinosaur/';
    console.log(`[Dino] Iniciando busca por ${numItens} dinossauros.`);

    try {
        // 1. Buscar a lista de todos os nomes de dinossauros
        console.log(`[Dino] Buscando lista de nomes de dinossauros de: ${CATEGORY_API_URL}`);
        const responseNomes = await fetch(CATEGORY_API_URL);
        console.log('[Dino] Resposta da API de categorias:', responseNomes.status, responseNomes.statusText);
        if (!responseNomes.ok) {
            throw new Error(`Falha ao buscar lista de nomes de dinossauros: ${responseNomes.status}`);
        }
        const listaNomesDinos = await responseNomes.json(); // Deve ser um array de strings
        console.log(`[Dino] Lista de nomes (${listaNomesDinos.length} dinos). Primeiros 5:`, listaNomesDinos.slice(0, 5));

        if (!Array.isArray(listaNomesDinos) || listaNomesDinos.length === 0) {
            throw new Error("Nenhum nome de dinossauro retornado pela API de categorias.");
        }

        // 2. Embaralhar e selecionar o número necessário de nomes de dinossauros
        const nomesSelecionados = embaralharArray([...listaNomesDinos]).slice(0, numItens);
        console.log(`[Dino] Nomes de dinossauros selecionados para o jogo (${nomesSelecionados.length}):`, nomesSelecionados);

        if (nomesSelecionados.length < numItens) {
            console.warn(`[Dino] A API forneceu menos nomes de dinossauros (${nomesSelecionados.length}) do que o solicitado (${numItens}). Usando os disponíveis.`);
        }
        if (nomesSelecionados.length === 0 && numItens > 0) {
            throw new Error("Não foi possível selecionar nomes de dinossauros para buscar detalhes.");
        }

        // 3. Buscar detalhes para cada nome de dinossauro selecionado
        const promessasDetalhesDinos = nomesSelecionados.map(async (nomeDino) => {
            const urlDetalhe = `${DETAIL_API_BASE_URL}${encodeURIComponent(nomeDino)}`;
            console.log(`[Dino] Buscando detalhes para ${nomeDino} de: ${urlDetalhe}`);
            try {
                const responseDetalhe = await fetch(urlDetalhe);
                if (!responseDetalhe.ok) {
                    console.warn(`[Dino] Falha ao buscar detalhes para ${nomeDino}: ${responseDetalhe.status}`);
                    return null;
                }
                const detalheDino = await responseDetalhe.json();
                // A documentação indica um campo "dino" com o nome e "pics" com um array de imagens.
                // Vamos pegar a primeira imagem da lista "pics", se existir.
                if (detalheDino && detalheDino.dino && detalheDino.pics && detalheDino.pics.length > 0 && detalheDino.pics[0].url) {
                    const nomeFormatado = detalheDino.dino.charAt(0).toUpperCase() + detalheDino.dino.slice(1);
                    const id = detalheDino.dino.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
                    return {
                        id: id,
                        nome: nomeFormatado,
                        imagem: detalheDino.pics[0].url // Usando a URL da primeira imagem em 'pics'
                    };
                } else {
                    console.warn(`[Dino] Dados incompletos ou sem imagem para ${nomeDino}:`, detalheDino);
                    return null;
                }
            } catch (errorDetalhe) {
                console.error(`[Dino] Erro ao buscar detalhes para ${nomeDino}:`, errorDetalhe);
                return null;
            }
        });

        const itensDinosCompletos = await Promise.all(promessasDetalhesDinos);
        const itensDinos = itensDinosCompletos.filter(item => item !== null); // Remove os que falharam
        console.log(`[Dino] Dinossauros formatados para o jogo (${itensDinos.length} itens). Primeiros 5:`, itensDinos.slice(0,5));

        if (itensDinos.length < numItens && itensDinos.length > 0) {
            console.warn(`API retornou ${itensDinos.length} dinossauros, mas eram esperados ${numItens}. Usando os disponíveis.`);
        } else if (itensDinos.length === 0 && numItens > 0) {
             console.error("[Dino] Nenhum dinossauro foi carregado da API com os critérios esperados após todo o processamento.");
             throw new Error("Nenhum dinossauro foi carregado da API com os critérios esperados.");
        }
        console.log(`${itensDinos.length} dinossauros carregados com sucesso.`);
        return itensDinos;
    } catch (error) {
        console.error("[Dino] Erro CRÍTICO ao buscar/processar dados dos dinossauros da API:", error);
        throw error;
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
    } else if (temaSelecionado === 'bandeiras') {
        try {
            itensDoTemaParaJogo = await fetchBandeirasParaJogo(numItensUnicosParaJogo);
            if (itensDoTemaParaJogo.length === 0 && numItensUnicosParaJogo > 0) {
                throw new Error("Nenhuma bandeira foi carregada da API.");
            }
        } catch (error) {
            alert(`Falha ao carregar os dados do tema ${DADOS_JOGO.temas[temaSelecionado].nomeDisplay}. Por favor, tente outro tema ou verifique sua conexão.`);
            if (typeof spanStatusCarregamento !== 'undefined' && spanStatusCarregamento) {
                spanStatusCarregamento.textContent = "";
                spanStatusCarregamento.style.display = 'none';
            }
            mostrarTela('selecaoTema');
            cartasParaJogar = [];
            return; // Interrompe a preparação
        }
    } else if (temaSelecionado === 'dinossauros') {
        try {
            itensDoTemaParaJogo = await fetchDinossaurosParaJogo(numItensUnicosParaJogo);
            if (itensDoTemaParaJogo.length === 0 && numItensUnicosParaJogo > 0) {
                throw new Error("Nenhum dinossauro foi carregado da API.");
            }
        } catch (error) {
            alert(`Falha ao carregar os dados do tema ${DADOS_JOGO.temas[temaSelecionado].nomeDisplay}. Por favor, tente outro tema ou verifique sua conexão.`);
            if (typeof spanStatusCarregamento !== 'undefined' && spanStatusCarregamento) {
                spanStatusCarregamento.textContent = "";
                spanStatusCarregamento.style.display = 'none';
            }
            mostrarTela('selecaoTema');
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

    if (mostrarFrente) {
        // Preenche o conteúdo da frente apenas se estiver vazio ou se for forçado (não implementado aqui)
        // Isso evita recarregar a imagem desnecessariamente se a carta for clicada e desvirada rapidamente.
        if (frente.innerHTML === '') {
            if (cartaInfo.conteudo.imagem) {
                frente.innerHTML = `<img src="${cartaInfo.conteudo.imagem}" alt="${cartaInfo.conteudo.nome}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
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
            setTimeout(() => {
                virarCartaVisualmente(primeiraCartaVirada.elemento, primeiraCartaVirada.info, false);
                virarCartaVisualmente(segundaCartaVirada.elemento, segundaCartaVirada.info, false);

                primeiraCartaVirada.info.virada = false;
                segundaCartaVirada.info.virada = false;

                primeiraCartaVirada = null;
                segundaCartaVirada = null;
                travarCliques = false;
            }, 1000);
        }
    }
}

function atualizarParesEncontradosDisplay() {
    spanParesEncontrados.textContent = paresEncontradosContador;
}

function verificarFimDeJogo() {
    if (totalParesNoJogoAtual > 0 && paresEncontradosContador === totalParesNoJogoAtual) {
        setTimeout(() => {
            mensagemResultado.textContent = `Você encontrou todos os ${totalParesNoJogoAtual} pares do tema ${DADOS_JOGO.temas[temaSelecionado].nomeDisplay}!`;
            mostrarTela('resultado');
        }, 1000);
    }
}

function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}