const DADOS_JOGO = {
    temas: {
        animais: {
            nomeDisplay: "Jogo da Memória: Animais", // Nome atualizado para clareza
            itens: [ // Mudamos de 'pares' para 'itens'
                { id: "urso_polar", nome: "Urso Polar", imagem: "assets/images/themes/animals/urso_polar.png" },
                { id: "onca_pintada", nome: "Onça Pintada", imagem: "assets/images/themes/animals/onca_pintada.png" },
                { id: "leao", nome: "Leão", imagem: "assets/images/themes/animals/leao.png" },
                { id: "abelha", nome: "Abelha", imagem: "assets/images/themes/animals/abelha.png" },
                { id: "peixe", nome: "Peixe", imagem: "assets/images/themes/animals/peixe.png" },
                { id: "sapo", nome: "Sapo", imagem: "assets/images/themes/animals/sapo.png" },
                { id: "mosca", nome: "Mosca", imagem: "assets/images/themes/animals/mosca.png" },
                { id: "rato", nome: "Rato", imagem: "assets/images/themes/animals/rato.png" }
                // Adicione mais animais aqui se desejar, cada um será duplicado para formar um par no jogo.
            ]
        },
        pokemon: {
            nomeDisplay: "Jogo da Memória: Pokémon (Online)", // Atualizado para indicar que usa API
            itens: [] // Esta lista será preenchida dinamicamente pela API
        },
        bandeiras: {
            nomeDisplay: "Jogo da Memória: Bandeiras (Online)",
            itens: [] // Esta lista será preenchida dinamicamente pela API
        },
        dinossauros: {
            nomeDisplay: "Jogo da Memória: Dinossauros (Online)",
            itens: [] // Esta lista será preenchida dinamicamente pela API
        }
        // Futuramente, adicionar mais temas aqui:
        // alimentos: {
        //     nomeDisplay: "Alimentos",
        //     pares: [
        //         { item1: { nome: "Pão", imagem: "assets/images/themes/alimentos/pao.png" }, item2: { nome: "Farinha", imagem: "assets/images/themes/alimentos/farinha.png" } },
        //         // ...
        //     ]
        // }
    },
    configDificuldade: { // Mapeia idade para número de pares
        2: { pares: 2, grid: { colunas: 2, linhas: 2 } }, // 2 pares = 4 cartas
        3: { pares: 3, grid: { colunas: 3, linhas: 2 } }, // 3 pares = 6 cartas
        4: { pares: 4, grid: { colunas: 4, linhas: 2 } }, // 4 pares = 8 cartas
        5: { pares: 6, grid: { colunas: 4, linhas: 3 } }, // 6 pares = 12 cartas
        6: { pares: 8, grid: { colunas: 4, linhas: 4 } }  // 8 pares = 16 cartas
    }
};

// NOTA: Você precisará criar as imagens correspondentes na pasta assets/images/themes/animals/
// Ex: leao.png, savana.png, macaco.png, banana.png, etc.
// Por enquanto, o jogo não vai mostrar as imagens se elas não existirem, mas a lógica pode ser testada.