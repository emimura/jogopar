const DADOS_JOGO = {
    temas: {
        animais: {
            nomeDisplay: "Animais",
            pares: [
                { id1: "leao", item1: { nome: "Leão", imagem: "assets/images/themes/animals/leao.png" }, id2: "savana", item2: { nome: "Savana", imagem: "assets/images/themes/animals/savana.png" } },
                { id1: "macaco", item1: { nome: "Macaco", imagem: "assets/images/themes/animals/macaco.png" }, id2: "banana", item2: { nome: "Banana", imagem: "assets/images/themes/animals/banana.png" } },
                { id1: "cachorro", item1: { nome: "Cachorro", imagem: "assets/images/themes/animals/cachorro.png" }, id2: "osso", item2: { nome: "Osso", imagem: "assets/images/themes/animals/osso.png" } },
                { id1: "gato", item1: { nome: "Gato", imagem: "assets/images/themes/animals/gato.png" }, id2: "novelo", item2: { nome: "Novelo de Lã", imagem: "assets/images/themes/animals/novelo.png" } },
                { id1: "vaca", item1: { nome: "Vaca", imagem: "assets/images/themes/animals/vaca.png" }, id2: "pasto", item2: { nome: "Pasto", imagem: "assets/images/themes/animals/pasto.png" } },
                { id1: "abelha", item1: { nome: "Abelha", imagem: "assets/images/themes/animals/abelha.png" }, id2: "colmeia", item2: { nome: "Colmeia", imagem: "assets/images/themes/animals/colmeia.png" } },
                { id1: "passaro", item1: { nome: "Pássaro", imagem: "assets/images/themes/animals/passaro.png" }, id2: "ninho", item2: { nome: "Ninho", imagem: "assets/images/themes/animals/ninho.png" } },
                { id1: "peixe", item1: { nome: "Peixe", imagem: "assets/images/themes/animals/peixe.png" }, id2: "aquario", item2: { nome: "Aquário", imagem: "assets/images/themes/animals/aquario.png" } },
                { id1: "sapo", item1: { nome: "Sapo", imagem: "assets/images/themes/animals/sapo.png" }, id2: "lagoa", item2: { nome: "Lagoa", imagem: "assets/images/themes/animals/lagoa.png" } },
                { id1: "coelho", item1: { nome: "Coelho", imagem: "assets/images/themes/animals/coelho.png" }, id2: "cenoura", item2: { nome: "Cenoura", imagem: "assets/images/themes/animals/cenoura.png" } }
            ]
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