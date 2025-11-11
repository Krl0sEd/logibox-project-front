document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
                             SIDEBAR
    ========================================================= */

    const body = document.querySelector("body");
    const sidebar = body.querySelector(".sidebar");
    const layout_wrapper = document.querySelector(".layout_wrapper");
    const sidebar_btn = document.getElementById("sidebar_btn");
    const logo_texto = document.querySelector(".logo_texto");
    const sidebar_link_texts = document.querySelectorAll(".sidebar_link_text");
    const sidebar_links = document.querySelectorAll(".sidebar_link");
    const btn_fechar_desktop = document.querySelector(".sidebar_close_btn i");

    const sidebar_mobile = document.querySelector(".sidebar_mobile");
    const btn_fechar_mobile = document.querySelector(".btn_fechar_mobile");
    const hamburguerBtn = document.getElementById("btn_hamburguer");
    const backdrop = document.querySelector(".backdrop");

    // Responsividade em telas grandes 
    function ligarSideBar() {
        sidebar.classList.toggle("on");
        layout_wrapper.classList.toggle("sidebar_fechado");

        logo_texto.classList.toggle("invisivel");
        btn_fechar_desktop.classList.toggle("inverte");
        sidebar_link_texts.forEach((element) => element.classList.toggle("invisivel"));
        sidebar_links.forEach((element) => element.classList.toggle("invisivel"));
    }

    sidebar_btn.addEventListener("click", ligarSideBar);

    sidebar.addEventListener("mouseenter", () => {
        if (layout_wrapper.classList.contains("sidebar_fechado")) {
            ligarSideBar();
        }
    });

    sidebar.addEventListener("mouseleave", () => {
        if (layout_wrapper.classList.contains("on")) {
            ligarSideBar();
        }
    });

    // Responsividade em telas pequenas
    btn_fechar_mobile.addEventListener("click", () => {
        sidebar_mobile.classList.remove("on");
        backdrop.classList.remove("on");
    });

    function abrirSidebarMobile() {
        sidebar_mobile.classList.toggle("on");
        backdrop.classList.toggle("on");
    }

    hamburguerBtn.addEventListener("click", abrirSidebarMobile);


    /* =========================================================
                             HEADER
    ========================================================= */

    const header_btn = document.querySelector(".btn_open_submenu");
    const submenu_userinfo = document.querySelector(".submenu_userinfo");
    const btn_logout = document.querySelector(".botao_delete");

    function abrirSubMenu() {
        submenu_userinfo.classList.toggle("on");
        header_btn.classList.toggle("rotacionar");
    }

    header_btn.addEventListener("click", abrirSubMenu);



    /* =========================================================
                        ALERTS E MODAIS
    ========================================================= */

    const alert_modelo = document.querySelector(".alert_modelo");
    const btn_cancelar_modal = document.querySelector(".botao_delete");
    const btn_fechar_modal = document.querySelector(".fechar_modal");
    const btn_submenu = document.querySelector(".btn_submenu");

    function abrirAlert() {
        alert_modelo.classList.toggle("aberto");
        backdrop.classList.toggle("on");
    }

    function fecharAlert() {
        alert_modelo.classList.toggle("aberto");
        backdrop.classList.toggle("on");
    }

    btn_fechar_modal.addEventListener("click", fecharAlert);
    btn_cancelar_modal.addEventListener("click", fecharAlert);
    btn_submenu.addEventListener("click", abrirAlert);



    /* =========================================================
                        MODAL HISTORICO
    ========================================================= */

    const buttons = document.querySelectorAll('.botao_opcoes');

    function closeAllMenus() {
        document.querySelectorAll('.menu_opcoes.ativo').forEach(m => m.classList.remove('ativo'));
        buttons.forEach(b => b.setAttribute('aria-expanded', 'false'));
    }

    buttons.forEach(button => {
        const container = button.closest('.container_opcoes');
        if (!container) return;

        const menu = container.querySelector('.menu_opcoes');
        if (!menu) return;

        menu.addEventListener('click', e => e.stopPropagation());

        button.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = menu.classList.contains('ativo');

            closeAllMenus();

            if (!isOpen) {
                menu.classList.add('ativo');
                button.setAttribute('aria-expanded', 'true');
            } else {
                menu.classList.remove('ativo');
                button.setAttribute('aria-expanded', 'false');
            }
        });
    });

    document.addEventListener('click', () => closeAllMenus());



    /* ========================================
                        Dark Mode
    ======================================== */

    let darkmode = localStorage.getItem('darkmode');
    const btn_darkmode = document.querySelector('.btn_darkmode');
    const darkmode_icon = btn_darkmode?.querySelector('i');

    const ligarDarkMode = () => {
        document.documentElement.classList.add('darkmode');
        darkmode_icon?.classList.replace('bi-moon', 'bi-sun');
        localStorage.setItem('darkmode', 'ligado');
    };

    const desligarDarkMode = () => {
        document.documentElement.classList.remove('darkmode');
        darkmode_icon?.classList.replace('bi-sun', 'bi-moon');
        localStorage.setItem('darkmode', 'desligado');
    };

    if (darkmode === 'ligado') {
        ligarDarkMode();
    } else {
        desligarDarkMode();
    }

    if (btn_darkmode) {
        btn_darkmode.addEventListener('click', () => {
            darkmode = localStorage.getItem('darkmode');
            if (darkmode === 'ligado') {
                desligarDarkMode();
            } else {
                ligarDarkMode();
            }
        });
    }

    /* ======================================== 
            GERAR PDF DA TABELA
    ======================================== */

    document.getElementById("download-button").addEventListener("click", async () => {
        const { jsPDF } = window.jspdf;

        // Seleciona o conteúdo da tabela
        const tabela = document.querySelector(".envoltura_tabela");

        // Mostra ícone de carregamento
        const botao = document.getElementById("download-button");
        botao.innerHTML = '<i class="bi bi-hourglass-split"></i>';
        botao.disabled = true;

        // Converte a tabela em imagem usando html2canvas
        const canvas = await html2canvas(tabela, {
            scale: 2,          // Aumenta a qualidade
            useCORS: true,     // Permite estilos externos
            logging: false
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 190; // largura útil (210 - margens)
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        // Adiciona imagem da tabela ao PDF (com quebra automática se necessário)
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Baixa o arquivo PDF
        pdf.save("Histórico de entrada.pdf");

        // Restaura o botão
        botao.innerHTML = '<i class="bi bi-download"></i>';
        botao.disabled = false;
    });


    /* ========================================
                    FILTRO POPUP
    ======================================== */

    const filterButton = document.getElementById("filter-button");
    const popupFiltro = document.getElementById("popupFiltro");

    filterButton.addEventListener("click", (e) => {
        e.stopPropagation();
        popupFiltro.style.display = popupFiltro.style.display === "block" ? "none" : "block";
    });

    // Fecha o popup se clicar fora dele
    document.addEventListener("click", (e) => {
        if (!popupFiltro.contains(e.target) && e.target !== filterButton) {
            popupFiltro.style.display = "none";
        }
    });

    /* ========================================
                    PESQUISA NA TABELA
    ========================================*/

    const inputPesquisa = document.getElementById("pesquisa");
    const linhasTabela = document.querySelectorAll(".table_conteudo tbody tr");

    function limparDestaques(elemento) {
        elemento.innerHTML = elemento.textContent; // Remove spans anteriores
    }

    function destacarTexto(celula, termo) {
        const textoOriginal = celula.textContent;
        const regex = new RegExp(`(${termo})`, "gi"); // Modificado para buscar sem se preocupar com acentos
        celula.innerHTML = textoOriginal.replace(regex, `<span class="highlight">$1</span>`);
    }

    function filtrarTabela() {
        const termo = inputPesquisa.value.trim().toLowerCase();

        // Separar termos por vírgula e remover espaços extras
        const termos = termo.split(",").map(t => t.trim()).filter(t => t !== "");

        linhasTabela.forEach(linha => {
            const celulas = linha.querySelectorAll("td");
            let corresponde = false;

            celulas.forEach(celula => {
                limparDestaques(celula); // Limpa antes de aplicar novamente

                // Verificar se qualquer um dos termos está presente na célula
                if (termos.some(termo => celula.textContent.toLowerCase().includes(termo))) {
                    corresponde = true;
                    termos.forEach(termo => {
                        if (celula.textContent.toLowerCase().includes(termo)) {
                            destacarTexto(celula, termo);
                        }
                    });
                }
            });

            // Se corresponder a qualquer termo, mostra a linha, senão esconde
            linha.style.display = corresponde || termos.length === 0 ? "" : "none";
        });
    }

    inputPesquisa.addEventListener("input", filtrarTabela);

    /* ========================================
                Aumentar/diminuir fonte
    ======================================== */

    let fontSizeLevel = parseInt(localStorage.getItem('fontSizeLevel')) || 0;
    const increaseBtn = document.querySelector(".btn_font_plus");
    const decreaseBtn = document.querySelector(".btn_font_menos");

    function applyFontSize() {
        body.classList.remove("font-small", "font-normal", "font-large");
        if (fontSizeLevel < 0) body.classList.add("font-small");
        else if (fontSizeLevel === 0) body.classList.add("font-normal");
        else body.classList.add("font-large");
        localStorage.setItem('fontSizeLevel', fontSizeLevel);
    }

    increaseBtn?.addEventListener("click", () => {
        if (fontSizeLevel < 1) {
            fontSizeLevel++;
            applyFontSize();
        }
    });

    decreaseBtn?.addEventListener("click", () => {
        if (fontSizeLevel > -1) {
            fontSizeLevel--;
            applyFontSize();
        }
    });

    applyFontSize();

});