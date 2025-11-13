document.addEventListener("DOMContentLoaded", () => {

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

    const radios = popupFiltro.querySelectorAll('input[type="radio"]');
    let radioSelecionado = null;

        radios.forEach(radio => {
        radio.addEventListener('click', () => {
            if (radioSelecionado === radio) {
            radio.checked = false; // desseleciona
            radioSelecionado = null;
            } else {
            radioSelecionado = radio;
            }
        });
    });

    /* ======================================== 
            GERAR PDF DA TABELA
    ======================================== */

    document.getElementById("download-button").addEventListener("click", async () => {
        const { jsPDF } = window.jspdf;

        // Seleciona a tabela original
        const tabelaOriginal = document.querySelector(".envoltura_tabela");

        // Clona a tabela para edição sem afetar a original
        const cloneTabela = tabelaOriginal.cloneNode(true);

        // === Identifica o índice da coluna "Opções" ===
        const ths = cloneTabela.querySelectorAll("th");
        let indiceOpcoes = -1;
        ths.forEach((th, i) => {
            if (th.textContent.trim().toLowerCase() === "opções") {
                indiceOpcoes = i;
            }
        });

        // Se encontrou a coluna "Opções", remove ela de todas as linhas
        if (indiceOpcoes !== -1) {
            cloneTabela.querySelectorAll("tr").forEach(tr => {
                const cells = tr.querySelectorAll("th, td");
                if (cells[indiceOpcoes]) {
                    cells[indiceOpcoes].remove();
                }
            });
        }

        // Cria container invisível temporário
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.appendChild(cloneTabela);
        document.body.appendChild(tempDiv);

        // Mostra ícone de carregamento
        const botao = document.getElementById("download-button");
        botao.innerHTML = '<i class="bi bi-hourglass-split"></i>';
        botao.disabled = true;

        // Converte a tabela clonada em imagem
        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 190;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        // Adiciona imagem ao PDF
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Salva o PDF
        pdf.save("Tabela de Usuários.pdf");

        // Remove o clone temporário
        document.body.removeChild(tempDiv);

        // Restaura o botão
        botao.innerHTML = '<i class="bi bi-download"></i>';
        botao.disabled = false;
    });


    /* ========================================
            ALERTS E MODAIS
    ======================================== */

    const alert_modelo_1 = document.getElementById("alert1");
    const alert_modelo_2 = document.getElementById("alert2");
    const backdrop = document.getElementById("backdrop");

    // Função genérica para abrir um alert
    function abrirAlert(id) {
        const alerta = document.getElementById(id);
        if (!alerta) return;
        alerta.classList.add("aberto");
        if (backdrop) backdrop.classList.add("on");
    }

    // Função genérica para fechar um alert
    function fecharAlert(id) {
        const alerta = document.getElementById(id);
        if (!alerta) return;
        alerta.classList.remove("aberto");
        if (backdrop) backdrop.classList.remove("on");
    }

    // Fecha alert1
    document.querySelectorAll("#alert1 .fechar_modal, #alert1 .botao_cancelar, #alert1 .botao_delete")
        .forEach(btn => btn.addEventListener("click", () => fecharAlert("alert1")));

    // Fecha alert2
    document.querySelectorAll("#alert2 .fechar_modal, #alert2 .botao_cancelar, #alert2 .botao_delete")
        .forEach(btn => btn.addEventListener("click", () => fecharAlert("alert2")));

    // Ativa alert1 ao clicar no botão ou no texto “Excluir”
    document.querySelectorAll(".botao_acao[aria-label='Excluir usuário']").forEach(botao => {
        botao.addEventListener("click", () => abrirAlert("alert1"));
    });


    /* ========================================
             BOTÃO OPÇÕES / MENUS
    ======================================== */

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

    document.addEventListener('click', closeAllMenus);

});
