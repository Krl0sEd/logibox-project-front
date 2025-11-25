document.addEventListener("DOMContentLoaded", () => {

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

     // Preenche o cargo — small id="cargoUser"
     const cargo = document.getElementById("cargoUser");
     if (cargo) {
          cargo.innerText = usuario.tipo || "Usuário";
     }

     /* ========================================
                         AUTH
     ========================================*/
     if (window.auth && window.auth.initAuth) {
          window.auth.initAuth();
     }

     /* ========================================
               CONFIGURAÇÃO API
     ========================================*/
     const API_URL = "http://163.176.193.115/usuarios.php"; // IP da VM
     let idUsuarioSelecionado = null; // Variável para controlar quem vamos deletar/ver

     /* ========================================
                     VARIÁVEIS GLOBAIS
     ========================================*/
     const inputPesquisa = document.getElementById("pesquisa");
     const linhasTabela = document.querySelectorAll(".table_conteudo tbody tr");
     const filterButton = document.getElementById("filter-button");
     const popupFiltro = document.getElementById("popupFiltro");
     const buttonsOpcoes = document.querySelectorAll(".botao_opcoes");
     const menuOpcoes = document.getElementById("menuUnico");
     const modalOverlay = document.getElementById("modalOverlay");

     let produtoSelecionado = null;

     // Configurações dos inputs dos modais
     const inputsView = {
          nome: document.getElementById("view_nome_produto"),
          descricao: document.getElementById("view_descricao_produto"),
          categoria: document.getElementById("view_categoria_produto"),
          quantidade: document.getElementById("view_quantidade_produto"),
          preco: document.getElementById("view_precouni_produto")
     };

     // Inicia o carregamento dos dados do banco
     carregarUsuarios();

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

     /* ========================================
                     FILTRO POPUP
     ========================================*/
     document.querySelector('.btn_filtrar').addEventListener('click', function (e) {
          e.preventDefault();

          const sexo = document.querySelector('input[name="sexo"]:checked');
          const tipo = document.querySelector('input[name="tipoUsuario"]:checked');
          const ordenar = document.querySelector('input[name="ordenar"]:checked');
          const linhas = document.querySelectorAll('.table_conteudo tbody tr');

          linhas.forEach(linha => {
               const sexoLinha = linha.cells[4].textContent.toLowerCase().trim();
               const tipoLinha = linha.cells[2].textContent.toLowerCase()
                    .trim()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
                    .replace('usuário', 'usuario') // Converte "usuário" para "usuario"
                    .replace('administrador', 'administrador');

               let mostrar = true;

               // Filtra por sexo
               if (sexo && sexoLinha !== sexo.value) {
                    mostrar = false;
               }

               // Filtra por tipo
               if (tipo && tipoLinha !== tipo.value) {
                    mostrar = false;
               }

               // Mostra ou esconde a linha
               linha.style.display = mostrar ? '' : 'none';
          });

          // Ordenação
          if (ordenar) {
               const tbody = document.querySelector('.table_conteudo tbody');
               const linhasVisiveis = Array.from(linhas).filter(linha => linha.style.display !== 'none');

               linhasVisiveis.sort((a, b) => {
                    const nomeA = a.cells[1].textContent;
                    const nomeB = b.cells[1].textContent;

                    if (ordenar.value === 'asc') {
                         return nomeA.localeCompare(nomeB);
                    } else {
                         return nomeB.localeCompare(nomeA);
                    }
               });

               // Reorganiza as linhas na tabela
               linhasVisiveis.forEach(linha => tbody.appendChild(linha));
          }

          // Fecha o popup
          document.getElementById('popupFiltro').style.display = 'none';
     });

     // Seu código do popup (mantém igual)
     filterButton.addEventListener("click", (e) => {
          e.stopPropagation();
          popupFiltro.style.display = popupFiltro.style.display === "block" ? "none" : "block";
     });

     document.addEventListener("click", (e) => {
          if (!popupFiltro.contains(e.target) && e.target !== filterButton) {
               popupFiltro.style.display = "none";
          }
     });

     /* ======================================== 
                 GERAR PDF DA TABELA
     ========================================*/
     document.getElementById("download-button").addEventListener("click", async () => {
          // Verifica se as bibliotecas necessárias estão carregadas
          if (!window.jspdf) {
               mostrarToast("Erro", "Biblioteca de PDF não carregada. Recarregue a página.", "erro");
               return;
          }

          if (!window.html2canvas) {
               mostrarToast("Erro", "Biblioteca html2canvas não carregada. Recarregue a página.", "erro");
               return;
          }

          const { jsPDF } = window.jspdf;

          try {
               // Encontra a tabela
               const tabelaOriginal = document.querySelector(".envoltura_tabela");

               if (!tabelaOriginal) {
                    mostrarToast("Erro", "Não foi possível encontrar a tabela para download.", "erro");
                    return;
               }

               // Verifica se a tabela tem conteúdo
               const linhasComDados = tabelaOriginal.querySelectorAll("tbody tr");
               if (linhasComDados.length === 0) {
                    mostrarToast("Aviso", "A tabela está vazia. Não há dados para exportar.", "erro");
                    return;
               }

               const cloneTabela = tabelaOriginal.cloneNode(true);

               // Identifica e remove coluna "Opções"
               const ths = cloneTabela.querySelectorAll("th");
               let indiceOpcoes = -1;

               ths.forEach((th, i) => {
                    if (th.textContent.trim().toLowerCase() === "opções") {
                         indiceOpcoes = i;
                    }
               });

               if (indiceOpcoes !== -1) {
                    cloneTabela.querySelectorAll("tr").forEach(tr => {
                         const cells = tr.querySelectorAll("th, td");
                         if (cells[indiceOpcoes]) {
                              cells[indiceOpcoes].remove();
                         }
                    });
               }

               // Container temporário
               const tempDiv = document.createElement("div");
               tempDiv.style.position = "absolute";
               tempDiv.style.left = "-9999px";
               tempDiv.style.backgroundColor = "white"; // Garante fundo branco
               tempDiv.appendChild(cloneTabela);
               document.body.appendChild(tempDiv);

               // Ícone de carregamento
               const botao = document.getElementById("download-button");
               const textoOriginal = botao.innerHTML;
               botao.innerHTML = '<i class="bi bi-hourglass-split"></i> Gerando...';
               botao.disabled = true;

               // Converter para imagem com timeout
               const canvas = await Promise.race([
                    html2canvas(tempDiv, {
                         scale: 2,
                         useCORS: true,
                         logging: false,
                         backgroundColor: "#ffffff"
                    }),
                    new Promise((_, reject) =>
                         setTimeout(() => reject(new Error("Timeout na geração da imagem")), 30000)
                    )
               ]);

               if (!canvas) {
                    throw new Error("Falha ao converter tabela para imagem");
               }

               const imgData = canvas.toDataURL("image/png");

               if (!imgData || imgData === "data:,") {
                    throw new Error("Falha ao processar imagem da tabela");
               }

               const pdf = new jsPDF("p", "mm", "a4");
               const imgWidth = 190;
               const pageHeight = 297;
               const imgHeight = (canvas.height * imgWidth) / canvas.width;

               if (imgHeight <= 0) {
                    throw new Error("Altura da imagem inválida");
               }

               let heightLeft = imgHeight;
               let position = 10;

               pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
               heightLeft -= pageHeight;

               while (heightLeft > 0) {
                    position = heightLeft - imgHeight + 10;
                    pdf.addPage();
                    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
               }

               // Tenta salvar o PDF
               try {
                    pdf.save("Tabela_de_Usuarios.pdf");
                    mostrarToast("Download concluído", "PDF gerado com sucesso!", "sucesso");
               } catch (saveError) {
                    throw new Error("Falha ao salvar o arquivo PDF");
               }

          } catch (error) {
               console.error("Erro ao gerar PDF:", error);

               // Mensagens específicas para diferentes tipos de erro
               if (error.message.includes("Timeout")) {
                    mostrarToast("Erro", "A geração do PDF demorou muito tempo. Tente novamente.", "erro");
               } else if (error.message.includes("imagem")) {
                    mostrarToast("Erro", "Problema ao processar a imagem da tabela.", "erro");
               } else if (error.message.includes("salvar")) {
                    mostrarToast("Erro", "Não foi possível salvar o arquivo. Verifique as permissões.", "erro");
               } else {
                    mostrarToast("Erro", "Falha ao gerar o PDF. Tente novamente.", "erro");
               }
          } finally {
               // Limpeza segura
               const tempDiv = document.querySelector('div[style*="left: -9999px"]');
               if (tempDiv && document.body.contains(tempDiv)) {
                    document.body.removeChild(tempDiv);
               }

               const botao = document.getElementById("download-button");
               if (botao) {
                    botao.innerHTML = '<i class="bi bi-download"></i> Exportar';
                    botao.disabled = false;
               }
          }
     });

     /* ================================
                 MENU DA TABELA
     ================================*/
     buttonsOpcoes.forEach(btn => {
          btn.addEventListener("click", (e) => {
               e.stopPropagation();

               const rect = btn.getBoundingClientRect();
               menuOpcoes.style.top = rect.bottom + window.scrollY + "px";
               menuOpcoes.style.left = rect.left + window.scrollX + "px";
               menuOpcoes.style.display = "block";

               const linha = btn.closest("tr");
               produtoSelecionado = linha.dataset.id;
          });
     });

     document.addEventListener("click", () => {
          menuOpcoes.style.display = "none";
     });

     menuOpcoes.querySelectorAll(".botao_acao").forEach(btn => {
          btn.addEventListener("click", (e) => {
               e.stopPropagation();
               const acao = btn.dataset.acao;

               if (acao === "visualizar") {
                    // CHAMA A NOVA FUNÇÃO
                    window.visualizarUsuarioBanco();
               }
               if (acao === "excluir") {
                    abrirAlert("alert1");
               }
               menuOpcoes.style.display = "none";
          });
     });

     /* ================================
                     MODAIS 
     ================================*/
     function abrirModal(id) {
          fecharAlert();
          modalOverlay.classList.add("on");
          modalOverlay.style.zIndex = "999";

          document.querySelectorAll(".modalBase").forEach(m => {
               m.style.display = "none";
          });

          const modal = document.getElementById(id);
          if (modal) {
               modal.style.display = "block";
          }
     }

     function fecharModal() {
          document.querySelectorAll(".modalBase").forEach(m => {
               m.style.display = "none";
          });

          const alertsAbertos = document.querySelectorAll('.alert_modelo.aberto');
          if (alertsAbertos.length === 0) {
               modalOverlay.classList.remove("on");
          }
     }

     modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) {
               fecharModal();
               fecharAlert();
          }
     });

     document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
               fecharModal();
               fecharAlert();
          }
     });

     /* ================================
                     ALERT
     ================================*/
     function abrirAlert(id) {
          const alert = document.getElementById(id);
          if (alert) {
               alert.classList.add("aberto");
               modalOverlay.classList.add("on");
               modalOverlay.style.zIndex = "1000";
          }
     }

     function fecharAlert(id) {
          if (id) {
               const alert = document.getElementById(id);
               if (alert) {
                    alert.classList.remove("aberto");
               }
          } else {
               document.querySelectorAll('.alert_modelo').forEach(alert => {
                    alert.classList.remove("aberto");
               });
          }

          const modaisAbertos = document.querySelectorAll('.modalBase[style*="display: block"]');
          const alertsAbertos = document.querySelectorAll('.alert_modelo.aberto');

          if (modaisAbertos.length === 0 && alertsAbertos.length === 0) {
               modalOverlay.classList.remove("on");
               modalOverlay.style.zIndex = "";
          }
     }

     /* ================================
                     TOAST 
     ================================*/
     window.mostrarToast = function (titulo, texto, tipo = "sucesso") {
          const toast = document.getElementById("toast_unico");
          const tTitulo = document.getElementById("toast_titulo");
          const tTexto = document.getElementById("toast_texto");
          const tIcone = document.getElementById("toast_icone");

          tTitulo.textContent = titulo;
          tTexto.textContent = texto;

          if (tipo === "sucesso") {
               tIcone.className = "bi bi-check-circle-fill icone_alerta";
          } else {
               tIcone.className = "bi bi-x-circle-fill icone_alerta";
          }

          toast.classList.remove("toast_sucesso", "toast_erro");
          toast.classList.add(tipo === "sucesso" ? "toast_sucesso" : "toast_erro");
          toast.classList.add("show");

          setTimeout(() => toast.classList.remove("show"), 3000);
     };

     document.querySelector(".btn_fechar_toast").addEventListener("click", () => {
          document.getElementById("toast_unico").classList.remove("show");
     });

     /* ================================
         CONTROLE DE ALTERAÇÕES NOS MODAIS
     ================================*/
     const fechar_alert = document.getElementById('fechar_alert')

     function verificarAlteracoesModal(modalId) {
          const inputs = modalId === 'modalCreate' ? inputsCreate : inputsEdit;
          return Object.values(inputs).some(input =>
               input && input.value.trim() !== ""
          );
     }

     function marcarAlteracoes(modalId) {
          modalComAlteracoes[modalId] = true;
     }

     function limparAlteracoes(modalId) {
          modalComAlteracoes[modalId] = false;
     }

     function fecharModalComVerificacao(modalId) {
          if ((modalId === 'modalCreate' || modalId === 'modalEdit') &&
               modalComAlteracoes[modalId]) {
               abrirAlert("alert0");
          } else {
               fecharModal();
          }
     }

     document.querySelectorAll(".closeButton").forEach(btn => {
          btn.addEventListener("click", function () {
               const modal = this.closest('.modalBase');
               if (modal) {
                    fecharModalComVerificacao(modal.id);
               }
          });
     });

     modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) {
               const modalAberto = document.querySelector('.modalBase[style*="display: block"]');
               if (modalAberto) {
                    fecharModalComVerificacao(modalAberto.id);
               } else {
                    fecharModal();
                    fecharAlert();
               }
          }
     });


     document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
               const modalAberto = document.querySelector('.modalBase[style*="display: block"]');
               if (modalAberto) {
                    fecharModalComVerificacao(modalAberto.id);
               } else {
                    fecharModal();
                    fecharAlert();
               }
          }
     });


     /* ================================
                 MODAL VISUALIZAR
     ================================*/

     document.querySelector("#modalView .botao_excluir").addEventListener("click", (e) => {
          e.preventDefault();
          abrirAlert("alert1");
     });


     /* ================================
      CONFIGURAÇÃO DOS BOTÕES DE ALERT
  ===============================*/

     // Alert1 - Excluir usuário
     document.querySelector('#alert1 .botao_cancelar').addEventListener('click', function () {
          fecharAlert('alert1');
     });

     const btnConfirmarDelete = document.querySelector('#alert1 .botao_delete');
     if (btnConfirmarDelete) {
          // Clonar remove listeners antigos para não duplicar eventos
          const novoBtn = btnConfirmarDelete.cloneNode(true);
          btnConfirmarDelete.parentNode.replaceChild(novoBtn, btnConfirmarDelete);

          novoBtn.addEventListener('click', function () {
               // CHAMA A NOVA FUNÇÃO DE DELETE
               window.deletarUsuarioBanco();
          });
     }


     // BOTÕES FECHAR_ALERT PARA TODOS OS ALERTS
     document.querySelectorAll('#fechar_alert').forEach(btn => {
          btn.addEventListener('click', function () {
               const alert = this.closest('.alert_modelo');
               if (alert) {
                    fecharAlert(alert.id);
               }
          });
     });

     // Ou se você tem múltiplos alerts com IDs diferentes:
     document.querySelectorAll('.fechar_alert').forEach(btn => {
          btn.addEventListener('click', function () {
               const alert = this.closest('.alert_modelo');
               if (alert) {
                    fecharAlert(alert.id);
               }
          });
     });

     /* ========================================
                FUNÇÕES DE INTEGRAÇÃO (BANCO DE DADOS)
          ========================================*/

     async function carregarUsuarios() {
          const tabelaBody = document.querySelector(".table_conteudo tbody");
          try {
               tabelaBody.innerHTML = '<tr><td colspan="6" style="text-align:center">Carregando...</td></tr>';

               const response = await fetch(API_URL);
               const usuarios = await response.json();

               tabelaBody.innerHTML = ""; // Limpa o loading

               if (usuarios.length === 0) {
                    tabelaBody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhum usuário encontrado.</td></tr>';
                    return;
               }

               usuarios.forEach(user => {
                    criarLinhaTabela(user, tabelaBody);
               });

               // Atualiza o texto do cabeçalho (ex: "5 usuários cadastrados")
               const contador = document.querySelector(".page_header p");
               if (contador) contador.textContent = `${usuarios.length} usuários cadastrados.`;

          } catch (error) {
               console.error("Erro API:", error);
               mostrarToast("Erro", "Falha ao conectar com o banco de dados.", "erro");
          }
     }

     function criarLinhaTabela(user, tbody) {
          const tr = document.createElement("tr");
          tr.dataset.id = user.id_usuario; // ID do banco

          // Converte o valor '1' ou '0' do admin para texto
          const tipoUsuario = user.admin == 1 ? '<span style="color:var(--color-primary); font-weight:bold">Administrador</span>' : 'Usuário';

          tr.innerHTML = `
            <td>#${user.id_usuario}</td>
            <td>${user.nome}</td>
            <td>${tipoUsuario}</td>
            <td>${user.cpf || '---'}</td>
            <td>${user.sexo || '-'}</td>
            <td>
                <div class="container_opcoes">
                    <button class="botao_opcoes" aria-label="Abrir opções">
                        <i class="bi bi-three-dots"></i>
                    </button>
                </div>
            </td>
        `;

          // Adiciona evento ao botão de opções desta linha específica
          const btnOpcoes = tr.querySelector(".botao_opcoes");
          btnOpcoes.addEventListener("click", (e) => {
               e.stopPropagation();
               // Função global que você já tem no código original, mas vamos garantir o ID
               abrirMenuOpcoesDinamico(e, user.id_usuario);
          });

          tbody.appendChild(tr);
     }

     // Função auxiliar para abrir o menu (adaptada para pegar o ID correto)
     function abrirMenuOpcoesDinamico(e, id) {
          const rect = e.currentTarget.getBoundingClientRect();
          menuOpcoes.style.top = (rect.bottom + window.scrollY) + "px";
          menuOpcoes.style.left = (rect.left + window.scrollX - 50) + "px";
          menuOpcoes.style.display = "block";
          idUsuarioSelecionado = id; // Guarda o ID para usar no visualizar/excluir
     }

     // Função para Visualizar Detalhes (Preenche o Modal)
     window.visualizarUsuarioBanco = async function () { // Chamado pelo botão do menu
          if (!idUsuarioSelecionado) return;

          abrirModal("modalView");
          document.getElementById("nome_user").value = "Buscando dados...";

          try {
               const response = await fetch(`${API_URL}?id=${idUsuarioSelecionado}`);
               const user = await response.json();

               // Preenche IDs baseados na sua print do banco
               document.getElementById("view_id").textContent = `#${user.id_usuario}`;
               document.getElementById("view_selectUserName").textContent = user.nome;

               document.getElementById("nome_user").value = user.nome || "";
               document.getElementById("nome_mae").value = user.nome_materno || "";
               document.getElementById("email").value = user.email || "";

               // Formata a data se vier do banco (ex: 1990-01-01 -> 01/01/1990)
               let dataFormatada = user.data_nascimento || "";
               if (dataFormatada.includes("-")) {
                    const [ano, mes, dia] = dataFormatada.split("-");
                    dataFormatada = `${dia}/${mes}/${ano}`;
               }
               document.getElementById("data_nascimento").value = dataFormatada;

               document.getElementById("cpf").value = user.cpf || "";
               document.getElementById("celular").value = user.telefone_celular || "";
               document.getElementById("cep").value = user.cep || "";
               document.getElementById("rua").value = user.rua || "";
               document.getElementById("complemento").value = user.complemento || "";
               document.getElementById("numero_rua").value = user.numero_rua || "";
               document.getElementById("bairro").value = user.bairro || "";
               document.getElementById("cidade").value = user.cidade || "";

               // Selects
               document.getElementById("opcao_sexo").value = user.sexo === 'Masculino' ? 'M' : (user.sexo === 'Feminino' ? 'F' : '');
               document.getElementById("opcao_estado").value = user.estado || "";

          } catch (error) {
               console.error(error);
               document.getElementById("nome_user").value = "Erro ao carregar";
          }
     };

     // Função para Deletar
     window.deletarUsuarioBanco = async function () {
          if (!idUsuarioSelecionado) return;

          try {
               const response = await fetch(API_URL, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: idUsuarioSelecionado })
               });

               const res = await response.json();

               if (res.sucesso) {
                    mostrarToast("Sucesso", "Usuário removido.", "sucesso");
                    carregarUsuarios(); // Atualiza tabela
                    fecharAlert("alert1");
                    fecharModal(); // Fecha modal de visualização se estiver aberto
               } else {
                    mostrarToast("Erro", "Erro ao excluir: " + res.erro, "erro");
               }
          } catch (error) {
               mostrarToast("Erro", "Falha de conexão.", "erro");
          }
     };

});
