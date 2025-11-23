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
                 MENUS DE OPÇÕES 
 ======================================== */

     const buttons = document.querySelectorAll(".botao_opcoes");
     const menuUnico = document.getElementById("menuUnico");
     let produtoSelecionado = null;

     if (buttons.length > 0 && menuUnico) {
          buttons.forEach(btn => {
               btn.addEventListener("click", (e) => {
                    e.stopPropagation();

                    const rect = btn.getBoundingClientRect();

                    // Posição inicial
                    let top = rect.bottom + window.scrollY + 5;
                    let left = rect.left + window.scrollX;

                    // Verifica largura do menu para evitar sair da tela
                    const menuWidth = menuUnico.offsetWidth;
                    const screenWidth = window.innerWidth;

                    // Se o menu passar da tela, reposiciona mais pra esquerda
                    if (left + menuWidth > screenWidth) {
                         left = screenWidth - menuWidth - 10; // 10px de margem
                    }

                    // Aplica as posições finais
                    menuUnico.style.top = `${top}px`;
                    menuUnico.style.left = `${left}px`;
                    menuUnico.style.display = 'block';
                    // PEGA TODOS OS DADOS DA LINHA AUTOMATICAMENTE
                    const linha = btn.closest('tr');
                    produtoSelecionado = {
                         id: linha.dataset.id,
                         nome: linha.dataset.nome,
                         categoria: linha.dataset.categoria,
                         quantidade: linha.dataset.quantidade,
                         preco: linha.dataset.preco
                    };

                    console.log("Produto selecionado:", produtoSelecionado);
               });
          });

          document.addEventListener("click", () => {
               menuUnico.style.display = 'none';
          });

          menuUnico.querySelectorAll('.botao_acao').forEach(btn => {
               btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const acao = btn.textContent.trim().split(' ')[0].toLowerCase();

                    // Agora temos TODOS os dados do produto
                    alert(`${acao} produto:\nID: ${produtoSelecionado.id}\nNome: ${produtoSelecionado.nome}\nCategoria: ${produtoSelecionado.categoria}`);

                    // Para usar na integração:
                    console.log(`Ação: ${acao}`, produtoSelecionado);

                    menuUnico.style.display = 'none';
               });
          });
     }
});
