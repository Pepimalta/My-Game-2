const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

// =====================================================
// IMAGEM
// =====================================================

const spriteSheet = new Image();
spriteSheet.src = "Spritesheet-1.png.png";

// =====================================================
// ESTADOS
// =====================================================

const ESTADO = {
    MENU: "menu",
    JOGANDO: "jogando",
    GAME_OVER: "game_over"
};

let estadoAtual = ESTADO.MENU;

let pontuacao = 0;

let recorde =
    Number(localStorage.getItem("recordeFlapB")) || 0;

// =====================================================
// CONFIGURAÇÕES
// =====================================================

const alturaDoChao = 70;
const limiteDoChao = canvas.height - alturaDoChao;

const larguraDoCano = 78;
const aberturaDosCanos = 175;
const distanciaEntreCanos = 245;
const velocidadeDosCanos = 3.5;

// =====================================================
// RECORTES DA SPRITE SHEET
// =====================================================

const SPRITES = {
    passaro1: {
        x: 10,
        y: 14,
        largura: 68,
        altura: 35
    },

    canoSuperior: {
        x: 85,
        y: 13,
        largura: 20,
        altura: 39
    },

    canoInferior: {
        x: 115,
        y: 15,
        largura: 20,
        altura: 38
    },

    passaro2: {
        x: 145,
        y: 21,
        largura: 65,
        altura: 35
    },

    nuvemPequena: {
        x: 222,
        y: 25,
        largura: 13,
        altura: 6
    },

    nuvemGrande: {
        x: 234,
        y: 35,
        largura: 16,
        altura: 9
    }
};

// =====================================================
// PÁSSARO
// =====================================================

const passaro = {
    x: 110,
    y: canvas.height / 2,

    largura: 78,
    altura: 42,

    velocidadeY: 0,

    gravidade: 0.42,
    forcaDoPulo: -7.5,

    frame: 0,
    contadorDoFrame: 0
};

// =====================================================
// CANOS
// =====================================================

let canos = [];

function criarCano(x) {
    const margemSuperior = 70;
    const margemInferior = 110;

    const alturaDisponivel =
        limiteDoChao -
        aberturaDosCanos -
        margemSuperior -
        margemInferior;

    const alturaSuperior =
        margemSuperior +
        Math.random() * alturaDisponivel;

    canos.push({
        x: x,
        largura: larguraDoCano,
        alturaSuperior: alturaSuperior,
        abertura: aberturaDosCanos,
        passou: false
    });
}

function prepararCanos() {
    canos = [];

    criarCano(canvas.width + 120);
    criarCano(canvas.width + 120 + distanciaEntreCanos);
    criarCano(canvas.width + 120 + distanciaEntreCanos * 2);
}

// =====================================================
// NUVENS
// =====================================================

let nuvens = [];

function prepararNuvens() {
    nuvens = [
        {
            x: 50,
            y: 90,
            tipo: "grande",
            velocidade: 0.25
        },
        {
            x: 300,
            y: 190,
            tipo: "pequena",
            velocidade: 0.18
        },
        {
            x: 430,
            y: 300,
            tipo: "grande",
            velocidade: 0.22
        }
    ];
}

function atualizarNuvens() {
    for (const nuvem of nuvens) {
        nuvem.x -= nuvem.velocidade;

        const largura =
            nuvem.tipo === "grande"
                ? 85
                : 60;

        if (nuvem.x + largura < 0) {
            nuvem.x = canvas.width + Math.random() * 150;
            nuvem.y = 60 + Math.random() * 300;
        }
    }
}

// =====================================================
// INÍCIO E FIM
// =====================================================

function iniciarJogo() {
    pontuacao = 0;

    passaro.y = canvas.height / 2;
    passaro.velocidadeY = 0;

    prepararCanos();
    prepararNuvens();

    estadoAtual = ESTADO.JOGANDO;
}

function encerrarJogo() {
    if (estadoAtual === ESTADO.GAME_OVER) {
        return;
    }

    estadoAtual = ESTADO.GAME_OVER;

    if (pontuacao > recorde) {
        recorde = pontuacao;

        localStorage.setItem(
            "recordeFlapB",
            recorde
        );
    }
}

// =====================================================
// CONTROLES
// =====================================================

function baterAsas() {
    if (estadoAtual === ESTADO.MENU) {
        iniciarJogo();
        passaro.velocidadeY = passaro.forcaDoPulo;
        return;
    }

    if (estadoAtual === ESTADO.GAME_OVER) {
        iniciarJogo();
        return;
    }

    passaro.velocidadeY = passaro.forcaDoPulo;
}

document.addEventListener("keydown", function (evento) {
    if (
        evento.code === "Space" ||
        evento.code === "ArrowUp"
    ) {
        evento.preventDefault();
        baterAsas();
    }
});

canvas.addEventListener("click", function () {
    baterAsas();
});

canvas.addEventListener(
    "touchstart",
    function (evento) {
        evento.preventDefault();
        baterAsas();
    },
    { passive: false }
);

// =====================================================
// ATUALIZAÇÃO DO PÁSSARO
// =====================================================

function atualizarPassaro() {
    passaro.velocidadeY += passaro.gravidade;
    passaro.y += passaro.velocidadeY;

    passaro.contadorDoFrame++;

    if (passaro.contadorDoFrame >= 8) {
        passaro.frame =
            passaro.frame === 0 ? 1 : 0;

        passaro.contadorDoFrame = 0;
    }

    if (passaro.y < 0) {
        passaro.y = 0;
        encerrarJogo();
    }

    if (
        passaro.y + passaro.altura >=
        limiteDoChao
    ) {
        passaro.y =
            limiteDoChao - passaro.altura;

        encerrarJogo();
    }
}

// =====================================================
// ATUALIZAÇÃO DOS CANOS
// =====================================================

function atualizarCanos() {
    for (const cano of canos) {
        cano.x -= velocidadeDosCanos;

        if (
            !cano.passou &&
            cano.x + cano.largura < passaro.x
        ) {
            cano.passou = true;
            pontuacao++;
        }
    }

    const primeiroCano = canos[0];

    if (
        primeiroCano.x +
        primeiroCano.largura <
        0
    ) {
        canos.shift();

        const ultimoCano =
            canos[canos.length - 1];

        criarCano(
            ultimoCano.x +
            distanciaEntreCanos
        );
    }
}

// =====================================================
// COLISÃO
// =====================================================

function verificarColisoes() {
    const margemX = 10;
    const margemY = 7;

    const esquerdaPassaro =
        passaro.x + margemX;

    const direitaPassaro =
        passaro.x +
        passaro.largura -
        margemX;

    const topoPassaro =
        passaro.y + margemY;

    const basePassaro =
        passaro.y +
        passaro.altura -
        margemY;

    for (const cano of canos) {
        const esquerdaCano = cano.x;
        const direitaCano =
            cano.x + cano.largura;

        const baseCanoSuperior =
            cano.alturaSuperior;

        const topoCanoInferior =
            cano.alturaSuperior +
            cano.abertura;

        const estaNaHorizontal =
            direitaPassaro > esquerdaCano &&
            esquerdaPassaro < direitaCano;

        if (!estaNaHorizontal) {
            continue;
        }

        const bateuNoSuperior =
            topoPassaro < baseCanoSuperior;

        const bateuNoInferior =
            basePassaro > topoCanoInferior;

        if (
            bateuNoSuperior ||
            bateuNoInferior
        ) {
            encerrarJogo();
            return;
        }
    }
}

// =====================================================
// ATUALIZAÇÃO PRINCIPAL
// =====================================================

function atualizar() {
    atualizarNuvens();

    if (estadoAtual !== ESTADO.JOGANDO) {
        return;
    }

    atualizarPassaro();
    atualizarCanos();
    verificarColisoes();
}

// =====================================================
// FUNDO
// =====================================================

function desenharFundo() {
    const gradiente =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradiente.addColorStop(0, "#65c7f4");
    gradiente.addColorStop(0.7, "#c7efff");
    gradiente.addColorStop(1, "#ffffff");

    ctx.fillStyle = gradiente;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}

// =====================================================
// NUVENS
// =====================================================

function desenharNuvens() {
    for (const nuvem of nuvens) {
        const sprite =
            nuvem.tipo === "grande"
                ? SPRITES.nuvemGrande
                : SPRITES.nuvemPequena;

        const largura =
            nuvem.tipo === "grande"
                ? 85
                : 60;

        const altura =
            nuvem.tipo === "grande"
                ? 48
                : 30;

        ctx.globalAlpha = 0.65;

        ctx.drawImage(
            spriteSheet,

            sprite.x,
            sprite.y,
            sprite.largura,
            sprite.altura,

            nuvem.x,
            nuvem.y,
            largura,
            altura
        );

        ctx.globalAlpha = 1;
    }
}

// =====================================================
// CANOS
// =====================================================

function desenharCanos() {
    for (const cano of canos) {
        const alturaSuperior =
            cano.alturaSuperior;

        const topoInferior =
            cano.alturaSuperior +
            cano.abertura;

        const alturaInferior =
            limiteDoChao - topoInferior;

        desenharCanoSuperior(
            cano.x,
            alturaSuperior,
            cano.largura
        );

        desenharCanoInferior(
            cano.x,
            topoInferior,
            cano.largura,
            alturaInferior
        );
    }
}

function desenharCanoSuperior(
    x,
    altura,
    largura
) {
    const sprite = SPRITES.canoSuperior;

    ctx.save();

    ctx.translate(
        x,
        altura
    );

    ctx.scale(
        1,
        -1
    );

    ctx.drawImage(
        spriteSheet,

        sprite.x,
        sprite.y,
        sprite.largura,
        sprite.altura,

        0,
        0,
        largura,
        altura
    );

    ctx.restore();
}

function desenharCanoInferior(
    x,
    y,
    largura,
    altura
) {
    const sprite = SPRITES.canoInferior;

    ctx.drawImage(
        spriteSheet,

        sprite.x,
        sprite.y,
        sprite.largura,
        sprite.altura,

        x,
        y,
        largura,
        altura
    );
}

// =====================================================
// CHÃO
// =====================================================

function desenharChao() {
    ctx.fillStyle = "#e6d27c";

    ctx.fillRect(
        0,
        limiteDoChao,
        canvas.width,
        alturaDoChao
    );

    ctx.fillStyle = "#69ca34";

    ctx.fillRect(
        0,
        limiteDoChao,
        canvas.width,
        15
    );

    ctx.fillStyle = "#348b24";

    ctx.fillRect(
        0,
        limiteDoChao + 15,
        canvas.width,
        6
    );

    ctx.strokeStyle = "#23391a";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, limiteDoChao);
    ctx.lineTo(canvas.width, limiteDoChao);
    ctx.stroke();
}

// =====================================================
// PÁSSARO
// =====================================================

function desenharPassaro() {
    const sprite =
        passaro.frame === 0
            ? SPRITES.passaro1
            : SPRITES.passaro2;

    ctx.save();

    const centroX =
        passaro.x +
        passaro.largura / 2;

    const centroY =
        passaro.y +
        passaro.altura / 2;

    ctx.translate(
        centroX,
        centroY
    );

    let inclinacao =
        passaro.velocidadeY * 0.045;

    inclinacao = Math.max(
        -0.35,
        Math.min(1.1, inclinacao)
    );

    ctx.rotate(inclinacao);

    ctx.drawImage(
        spriteSheet,

        sprite.x,
        sprite.y,
        sprite.largura,
        sprite.altura,

        -passaro.largura / 2,
        -passaro.altura / 2,

        passaro.largura,
        passaro.altura
    );

    ctx.restore();
}

// =====================================================
// INTERFACE
// =====================================================

function desenharPontuacao() {
    if (estadoAtual !== ESTADO.JOGANDO) {
        return;
    }

    ctx.textAlign = "center";
    ctx.font = "bold 58px Arial";

    ctx.lineWidth = 7;
    ctx.strokeStyle = "#233142";

    ctx.strokeText(
        pontuacao,
        canvas.width / 2,
        80
    );

    ctx.fillStyle = "white";

    ctx.fillText(
        pontuacao,
        canvas.width / 2,
        80
    );
}

function desenharBotao(
    x,
    y,
    largura,
    altura,
    texto
) {
    ctx.fillStyle = "#1c72c6";

    ctx.fillRect(
        x,
        y,
        largura,
        altura
    );

    ctx.strokeStyle = "#0b3159";
    ctx.lineWidth = 5;

    ctx.strokeRect(
        x,
        y,
        largura,
        altura
    );

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 22px Arial";

    ctx.fillText(
        texto,
        x + largura / 2,
        y + altura / 2
    );

    ctx.textBaseline = "alphabetic";
}

function desenharMenu() {
    ctx.fillStyle =
        "rgba(255, 255, 255, 0.88)";

    ctx.fillRect(
        55,
        135,
        canvas.width - 110,
        300
    );

    ctx.strokeStyle = "#17334d";
    ctx.lineWidth = 5;

    ctx.strokeRect(
        55,
        135,
        canvas.width - 110,
        300
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "#1767b3";
    ctx.font = "bold 54px Arial";

    ctx.fillText(
        "FLAP B",
        canvas.width / 2,
        210
    );

    ctx.fillStyle = "#263b4d";
    ctx.font = "20px Arial";

    ctx.fillText(
        "Passe pelos canos",
        canvas.width / 2,
        255
    );

    ctx.fillText(
        "sem encostar neles!",
        canvas.width / 2,
        283
    );

    desenharBotao(
        canvas.width / 2 - 115,
        320,
        230,
        65,
        "JOGAR"
    );

    ctx.font = "16px Arial";
    ctx.fillStyle = "#485d6d";

    ctx.fillText(
        "Clique ou aperte Espaço",
        canvas.width / 2,
        415
    );
}

function desenharGameOver() {
    ctx.fillStyle =
        "rgba(13, 28, 44, 0.74)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.font = "bold 50px Arial";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        155
    );

    ctx.font = "bold 26px Arial";

    ctx.fillText(
        "Pontos: " + pontuacao,
        canvas.width / 2,
        215
    );

    ctx.fillText(
        "Recorde: " + recorde,
        canvas.width / 2,
        255
    );

    desenharBotao(
        canvas.width / 2 - 140,
        310,
        280,
        65,
        "JOGAR NOVAMENTE"
    );

    ctx.font = "16px Arial";

    ctx.fillText(
        "Clique ou aperte Espaço",
        canvas.width / 2,
        415
    );
}

// =====================================================
// DESENHO PRINCIPAL
// =====================================================

function desenhar() {
    desenharFundo();
    desenharNuvens();

    if (estadoAtual !== ESTADO.MENU) {
        desenharCanos();
    }

    desenharChao();
    desenharPassaro();
    desenharPontuacao();

    if (estadoAtual === ESTADO.MENU) {
        desenharMenu();
    }

    if (estadoAtual === ESTADO.GAME_OVER) {
        desenharGameOver();
    }
}

// =====================================================
// LOOP
// =====================================================

function loopDoJogo() {
    atualizar();
    desenhar();

    requestAnimationFrame(loopDoJogo);
}

spriteSheet.onload = function () {
    prepararNuvens();
    loopDoJogo();
};

spriteSheet.onerror = function () {
    console.error(
        "Não foi possível carregar a imagem: " +
        spriteSheet.src
    );
};
