import { initAuth, logout } from '../assets/js/utils/auth.js';

document.addEventListener("DOMContentLoaded", () => {
    initAuth(); // verifica se o usuário tá logado e controla a sidebar

    // Botão de logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', logout);
    }

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

/* ========================================
                MENUS DE OPÇÕES 
======================================== */

const buttons = document.querySelectorAll(".botao_opcoes");
const menuUnico = document.getElementById("menuUnico");
let produtoAtual = null;

buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Posicionar menu abaixo do botão clicado
        const rect = btn.getBoundingClientRect();
        menuUnico.style.top = `${rect.top + window.scrollY + 2}px`;
        menuUnico.style.left = `${rect.left + window.scrollX}px`;
        menuUnico.style.display = 'block';
        
        // Guardar qual produto foi clicado
        produtoAtual = btn.getAttribute('data-id');
    });
});

// Fechar menu ao clicar fora
document.addEventListener("click", () => {
     menuUnico.style.display = 'none';
});

     // Eventos dos botões do menu
     menuUnico.querySelectorAll('.botao_acao').forEach(btn => {
          btn.addEventListener('click', (e) => {
               e.stopPropagation();
               const acao = btn.getAttribute('data-acao');

               alert(`${acao} produto ${produtoAtual}`);
               menuUnico.style.display = 'none';
          });
     });
});
