document.addEventListener("DOMContentLoaded", () => {

 fetch("http://163.176.193.115/log.php")
    .then(response => response.json())
    .then(data => {
        // Atualiza número de registros
        document.getElementById("totalLogs").textContent =
            `${data.length} gravações de entrada.`;

        // Aqui continua seu código para preencher a tabela
        const tableBody = document.querySelector("#log-table-body");
        tableBody.innerHTML = "";

        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.data}</td>
                <td>${item.usuario}</td>
                <td>${item.acao}</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => console.error("Erro ao buscar logs:", error));

carregarHistorico();

function carregarHistorico() {
    fetch("http://163.176.193.115/log.php")
        .then(response => response.json())
        .then(logs => {
            const tbody = document.querySelector(".table_conteudo tbody");
            tbody.innerHTML = "";

            logs.forEach(log => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${formatarData(log.data)}</td>
                    <td>${log.usuario}</td>
                    <td>${log.acao}</td>
                `;

                tbody.appendChild(tr);
            });
        })
        .catch(error => console.error("Erro ao carregar logs:", error));
}

function formatarData(dataSQL) {
    const data = new Date(dataSQL);
    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

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
                 ORDENAR POR NOME
     ======================================== */

     document.querySelector(".btn_filtrar").addEventListener("click", (e) => {
          e.preventDefault();

          const ordenar = document.querySelector('input[name="ordenar"]:checked')?.value;
          if (!ordenar) return;

          const linhas = [...document.querySelectorAll("tbody tr")];
          const tbody = document.querySelector("tbody");

          const ordenado = linhas.sort((a, b) => {
               const nomeA = a.children[1].textContent.trim().toLowerCase();
               const nomeB = b.children[1].textContent.trim().toLowerCase();

               return ordenar === "asc"
                    ? nomeA.localeCompare(nomeB)
                    : nomeB.localeCompare(nomeA);
          });

          ordenado.forEach(l => tbody.appendChild(l));

          popupFiltro.style.display = "none";
     });


      /* ========================================
                Carregar dados do usuário
     ======================================== */

     const userData = localStorage.getItem("user");

     if (!userData) {
          window.location.href = "../pages/login.html";
          return;
     }

     const usuario = JSON.parse(userData);

     // Preenche "Bem vindo(a)" — span com id="userName"
     const nameField = document.getElementById("userName");
     if (nameField) {
          nameField.innerText = usuario.nome || "Usuário";
     }

     // Preenche o nome no topo — span id="nomeCompleto"
     const nomeTop = document.getElementById("nomeCompleto");
     if (nomeTop) {
          nomeTop.innerText = usuario.nome || "";
     }

     // Preenche o cargo — span id="cargoUser"
     const cargoEl = document.getElementById("cargoUser");
     if (cargoEl) {
    const cargoTexto = Number(usuario.admin) === 1 ? "Administrador" : "Usuário Comum";
    cargoEl.innerText = cargoTexto;
}

// Ajusta visibilidade de itens do menu conforme admin ou não
     const navUsuario = document.getElementById('menu-usuarios');
     const navLog = document.getElementById('menu-log');
     const linha_dados = document.getElementById('linha_dados');

     // NOVO: verificar admin corretamente
     const isAdmin = Number(usuario.admin) === 1;

     if (!isAdmin) {
    if (navUsuario) navUsuario.style.display = "none";
    if (navLog) navLog.style.display = "none";
    if (linha_dados) linha_dados.style.display = "none"; }
    
     /* ========================================
                     PESQUISA NA TABELA
     ========================================*/
     function removerAcentos(texto) {
          return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
     }

     function pesquisarTabela() {
          const termo = removerAcentos(document.getElementById("pesquisa").value.toLowerCase());
          const linhas = document.querySelectorAll(".table_conteudo tbody tr");

          // Remove highlights anteriores
          document.querySelectorAll('.highlight').forEach(el => {
               el.outerHTML = el.innerHTML;
          });

          linhas.forEach(linha => {
               const textoLinha = removerAcentos(linha.textContent.toLowerCase());
               const deveMostrar = textoLinha.includes(termo) || termo === "";
               linha.style.display = deveMostrar ? "" : "none";

               // Adiciona highlight apenas se houver termo
               if (deveMostrar && termo !== "") {
                    const cells = linha.querySelectorAll('td');
                    cells.forEach(cell => {
                         const originalText = cell.innerHTML;
                         const textoSemAcento = removerAcentos(cell.textContent.toLowerCase());

                         if (textoSemAcento.includes(termo)) {
                              // Encontra as posições onde o termo sem acento aparece
                              const textoOriginal = cell.textContent;
                              const regex = new RegExp(termo, 'gi');
                              let match;
                              const indices = [];

                              // Encontra todas as ocorrências do termo (sem acento)
                              while ((match = regex.exec(removerAcentos(textoOriginal.toLowerCase()))) !== null) {
                                   indices.push(match.index);
                              }

                              // Reconstroi o HTML com highlights nas posições corretas
                              let novoHTML = '';
                              let lastIndex = 0;

                              indices.forEach(index => {
                                   // Pega o texto original (com acento) na posição encontrada
                                   const start = index;
                                   const end = index + termo.length;
                                   const textoComAcento = textoOriginal.substring(start, end);

                                   novoHTML += textoOriginal.substring(lastIndex, start);
                                   novoHTML += `<span class="highlight">${textoComAcento}</span>`;
                                   lastIndex = end;
                              });

                              novoHTML += textoOriginal.substring(lastIndex);
                              cell.innerHTML = novoHTML;
                         }
                    });
               }
          });
     }

     // Ativa a pesquisa
     document.getElementById("pesquisa").addEventListener("input", pesquisarTabela);

});
