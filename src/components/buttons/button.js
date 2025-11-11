const body = document.body;

// Modo escuro
const botaoModoEscuro = document.querySelector('.botao_modo_escuro');
const iconeModoEscuro = botaoModoEscuro.querySelector('i');

botaoModoEscuro.addEventListener('click', () => {
    body.classList.toggle('modo-escuro');

    if (body.classList.contains('modo-escuro')) {
        iconeModoEscuro.classList.replace('bi-moon', 'bi-brightness-high');
    } else {
        iconeModoEscuro.classList.replace('bi-brightness-high', 'bi-moon');
    }
});

// Aumentar/diminuir fonte
const botaoAumentar = document.querySelector('.botao_aumentar_fonte');
const botaoDiminuir = document.querySelector('.botao_diminuir_fonte');
let escalaFonte = 1;

const elementos = document.querySelectorAll(
    'body, button, h2, h4, p, input, textarea, select, i:not(#toggle-senha)'
);

elementos.forEach(el => {
    const style = window.getComputedStyle(el);
    el.dataset.tamanhoBase = parseFloat(style.fontSize);

    if (el.tagName === 'BUTTON') {
        el.dataset.paddingTop = parseFloat(style.paddingTop);
        el.dataset.paddingBottom = parseFloat(style.paddingBottom);
        el.dataset.paddingLeft = parseFloat(style.paddingLeft);
        el.dataset.paddingRight = parseFloat(style.paddingRight);
    }

    el.dataset.lineHeight = parseFloat(style.lineHeight);
});

function atualizarFonte() {
    elementos.forEach(el => {
        const base = parseFloat(el.dataset.tamanhoBase);
        el.style.fontSize = (base * escalaFonte) + "px";

        if (el.tagName === 'BUTTON') {
            el.style.paddingTop = (el.dataset.paddingTop * escalaFonte) + "px";
            el.style.paddingBottom = (el.dataset.paddingBottom * escalaFonte) + "px";
            el.style.paddingLeft = (el.dataset.paddingLeft * escalaFonte) + "px";
            el.style.paddingRight = (el.dataset.paddingRight * escalaFonte) + "px";
        }

        if (el.dataset.lineHeight) {
            el.style.lineHeight = (el.dataset.lineHeight * escalaFonte) + "px";
        }

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.style.setProperty('--placeholder-font-size', (base * escalaFonte) + "px");
        }
    });
}

botaoAumentar.addEventListener('click', () => {
    if (escalaFonte < 2) {
        escalaFonte = Math.round((escalaFonte + 0.1) * 10) / 10;
        atualizarFonte();
    }
});

botaoDiminuir.addEventListener('click', () => {
    if (escalaFonte > 0.5) {
        escalaFonte = Math.round((escalaFonte - 0.1) * 10) / 10;
        atualizarFonte();
    }
});