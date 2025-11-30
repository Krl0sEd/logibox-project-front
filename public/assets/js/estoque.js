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
                         AUTH
     ========================================*/
     if (window.auth && window.auth.initAuth) {
          window.auth.initAuth();
     }

     /* ========================================
                     VARIÁVEIS GLOBAIS
     ========================================*/
     const API_URL = 'http://163.176.193.115/estoque.php';
     const inputPesquisa = document.getElementById("pesquisa");
     const linhasTabela = document.querySelectorAll(".table_conteudo tbody tr");
     const filterButton = document.getElementById("filter-button");
     const popupFiltro = document.getElementById("popupFiltro");
     const buttonsOpcoes = document.querySelectorAll(".botao_opcoes");
     const menuOpcoes = document.getElementById("menuUnico");
     const modalOverlay = document.getElementById("modalOverlay");

     let produtoSelecionado = null;
     let modalComAlteracoes = {
          'modalCreate': false,
          'modalEdit': false
     };

     carregarProdutos();

     // Configurações dos inputs dos modais
     const inputsCreate = {
          nome: document.getElementById("create_nome_produto"),
          descricao: document.getElementById("create_descricao_produto"),
          categoria: document.getElementById("create_categoria_produto"),
          quantidade: document.getElementById("create_quantidade_produto"),
          preco: document.getElementById("create_precouni_produto")
     };

     const inputsEdit = {
          nome: document.getElementById("edit_nome_produto"),
          descricao: document.getElementById("edit_descricao_produto"),
          categoria: document.getElementById("edit_categoria_produto"),
          quantidade: document.getElementById("edit_quantidade_produto"),
          preco: document.getElementById("edit_precouni_produto")
     };

     const inputsView = {
          nome: document.getElementById("view_nome_produto"),
          descricao: document.getElementById("view_descricao_produto"),
          categoria: document.getElementById("view_categoria_produto"),
          quantidade: document.getElementById("view_quantidade_produto"),
          preco: document.getElementById("view_precouni_produto")
     };

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

     document.addEventListener("click", () => {
          menuOpcoes.style.display = "none";
     });

     menuOpcoes.querySelectorAll(".botao_acao").forEach(btn => {
          btn.addEventListener("click", (e) => {
               e.stopPropagation();
               const acao = btn.dataset.acao;

               if (acao === "editar") {
                   // Agora chamamos a função que busca os dados e abre o modal
                   carregarDadosEditar(produtoSelecionado); 
               }

               if (acao === "visualizar") {
                   // CHAMA A NOVA FUNÇÃO
                   carregarDadosVisualizar(produtoSelecionado);
               }

               if (acao === "excluir") {
                    // UX: Atualiza o texto do modal com o nome do produto
                    // Procura a linha da tabela que tem o ID selecionado
                    const linha = document.querySelector(`tr[data-id="${produtoSelecionado}"]`);
                    if (linha) {
                         const nomeProduto = linha.cells[1].textContent; // A 2ª célula é o nome
                         document.querySelector("#alert1 h2").textContent = `Deletar ${nomeProduto}?`;
                         document.querySelector("#alert1 p").textContent = `Deseja realmente deletar ${nomeProduto}? Essa ação é irreversível.`;
                    }
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

     document.getElementById("btn_criar").addEventListener("click", () => {
          abrirModal("modalCreate");
     });

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
         FUNÇÕES GLOBAIS DE VALIDAÇÃO
     ================================*/
     function aplicarMascaraPreco(input) {
          if (!input) return;

          input.addEventListener("input", function () {
               let valor = this.value.replace(/\D/g, "");

               if (valor.length === 0) {
                    this.value = "";
                    return;
               }

               valor = parseInt(valor).toString();

               if (valor.length === 1) {
                    this.value = "0,0" + valor;
               } else if (valor.length === 2) {
                    this.value = "0," + valor;
               } else {
                    const parteInteira = valor.slice(0, -2);
                    const parteDecimal = valor.slice(-2);
                    this.value = parteInteira + "," + parteDecimal;
               }
          });
     }

     function validarQuantidadeInput(input) {
          const valor = input.value.trim();

          if (valor === "") {
               input.classList.remove("erro_input");
               return true;
          }

          if (!/^\d+$/.test(valor) || parseInt(valor) <= 0 || valor.length > 4) {
               input.classList.add("erro_input");
               return false;
          }

          input.classList.remove("erro_input");
          return true;
     }

     function validarQuantidade(valor) {
          valor = valor.toString().trim();
          if (valor === "") return false;
          if (!/^\d+$/.test(valor)) return false;

          const numero = parseInt(valor);
          if (isNaN(numero) || numero <= 0 || numero > 9999) return false;

          return true;
     }

     function validarCamposObrigatorios(inputs) {
          let camposVazios = [];

          Object.entries(inputs).forEach(([key, input]) => {
               if (input && input.value.trim() === "") {
                    camposVazios.push(key);
                    input.classList.add("erro_input");
               } else if (input) {
                    input.classList.remove("erro_input");
               }
          });

          return camposVazios;
     }

     /* ================================
         INICIALIZAÇÃO DAS MÁSCARAS
     ================================*/
     document.addEventListener('DOMContentLoaded', function () {
          const inputsPreco = [
               'create_precouni_produto',
               'edit_precouni_produto',
               'view_precouni_produto'
          ];

          inputsPreco.forEach(id => {
               const input = document.getElementById(id);
               if (input) {
                    aplicarMascaraPreco(input);
               }
          });

          const inputsQuantidade = [
               'create_quantidade_produto',
               'edit_quantidade_produto',
               'view_quantidade_produto'
          ];

          inputsQuantidade.forEach(id => {
               const input = document.getElementById(id);
               if (input) {
                    input.addEventListener('input', function () {
                         validarQuantidadeInput(this);
                    });

                    input.addEventListener('blur', function () {
                         validarQuantidadeInput(this);
                    });
               }
          });
     });

     /* ================================
                 MODAL CREATE
     ================================*/
     const formCreate = document.getElementById("formCreateProduto");

     Object.values(inputsCreate).forEach(input => {
          if (input) {
               input.addEventListener('input', () => {
                    if (verificarAlteracoesModal('modalCreate')) {
                         marcarAlteracoes('modalCreate');
                    }
               });
          }
     });

     document.getElementById("btnSalvarCreate").addEventListener("click", async (e) => {
          e.preventDefault();

          // Validações
          if (!validarQuantidade(inputsCreate.quantidade.value)) {
               mostrarToast("Quantidade inválida", "A quantidade deve ser maior que zero.", "erro");
               inputsCreate.quantidade.classList.add("erro_input");
               return;
          }

          const camposVazios = validarCamposObrigatorios(inputsCreate);
          if (camposVazios.length > 0) {
               mostrarToast("Campos obrigatórios", "Preencha todos os campos.", "erro");
               return;
          }

          // --- CORREÇÃO DE PREÇO ---
          // Pega o valor digitado (ex: "1,00")
          // Troca a vírgula por ponto para o padrão americano/banco de dados (ex: "1.00")
          let precoFormatado = inputsCreate.preco.value.replace(',', '.');
        
          // Converte para número decimal
          let precoFinal = parseFloat(precoFormatado);

          // --- CORREÇÃO DE CATEGORIA ---
          // Pegamos explicitamente o .value (o código minúsculo definido no HTML)
          let categoriaSelecionada = inputsCreate.categoria.value;

          // Data atual
          const dataHoje = new Date().toISOString().split('T')[0];

          const novoProduto = {
               nome_produto: inputsCreate.nome.value,
               descricao: inputsCreate.descricao.value,
               categoria: categoriaSelecionada, 
               preco_unitario: precoFinal,
               quantidade_estoque: parseInt(inputsCreate.quantidade.value),
               data_cadastro: dataHoje,
               id_usuario: 24 // Para o usuario Joao Ninguem
          };

          try {
               const btnSalvar = document.getElementById("btnSalvarCreate");
               btnSalvar.innerHTML = '<i class="bi bi-hourglass-split"></i> Salvando...';
               btnSalvar.disabled = true;

               const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(novoProduto)
               });

               if (response.ok) {
                    mostrarToast("Sucesso!", "Produto cadastrado.", "sucesso");
                    formCreate.reset();
                    limparAlteracoes('modalCreate');
                    fecharModal();
                    carregarProdutos();
               } else {
                    throw new Error("Erro ao salvar produto.");
               }
          } catch (error) {
               console.error(error);
               mostrarToast("Erro", "Falha ao cadastrar.", "erro");
          } finally {
               const btnSalvar = document.getElementById("btnSalvarCreate");
               btnSalvar.innerHTML = '<i class="bi bi-plus"></i> Criar item';
               btnSalvar.disabled = false;
          }
     });

     document.querySelector("#modalCreate .botao_limpar").addEventListener("click", (e) => {
          e.preventDefault();

          const temAlgoDigitado = Object.values(inputsCreate).some(input =>
               input && input.value.trim() !== ""
          );

          formCreate.reset();

          Object.values(inputsCreate).forEach(input => {
               if (input) input.classList.remove("erro_input");
          });

          if (temAlgoDigitado) {
               mostrarToast(
                    "Campos limpos!",
                    "Todos os campos foram apagados com sucesso.",
                    "sucesso"
               );
               limparAlteracoes('modalCreate');
          }
     });

     /* ================================
                 MODAL EDITAR
     ================================*/
     const formEdit = document.getElementById("formEditProduto");

     Object.values(inputsEdit).forEach(input => {
          if (input) {
               input.addEventListener('input', () => {
                    if (verificarAlteracoesModal('modalEdit')) {
                         marcarAlteracoes('modalEdit');
                    }
               });
          }
     });

     /* ========================================
       AÇÃO DE SALVAR EDIÇÃO (ATUALIZAR)
    ========================================*/
     document.querySelector("#modalEdit .botao_salvar").addEventListener("click", async (e) => {
          e.preventDefault();

          // Validações
          if (!validarQuantidade(inputsEdit.quantidade.value)) {
               mostrarToast("Quantidade inválida", "A quantidade deve ser numérica.", "erro");
               inputsEdit.quantidade.classList.add("erro_input");
               return;
          }

          const camposVazios = validarCamposObrigatorios(inputsEdit);
          if (camposVazios.length > 0) {
               mostrarToast("Campos vazios", "Preencha todos os dados.", "erro");
               return;
          }

          // --- CORREÇÃO DE PREÇO (EDIÇÃO) ---
          // 1. Pega o valor (ex: "1,00")
          // 2. Remove pontos de milhar se houver (ex: 1.000,00 -> 1000,00) - opcional, mas seguro
          let precoFormatado = inputsEdit.preco.value.replace(/\./g, '');
          // 3. Troca a vírgula decimal por ponto (ex: 1,00 -> 1.00)
          precoFormatado = precoFormatado.replace(',', '.');
        
          let precoFinal = parseFloat(precoFormatado);

          let categoriaSelecionada = inputsEdit.categoria.value;

          const produtoAtualizado = {
               id_produto: produtoSelecionado,
               nome_produto: inputsEdit.nome.value,
               descricao: inputsEdit.descricao.value,
               categoria: categoriaSelecionada, 
               preco_unitario: precoFinal, 
               quantidade_estoque: parseInt(inputsEdit.quantidade.value)
          };

          try {
               const btnSalvar = document.querySelector("#modalEdit .botao_salvar");
               btnSalvar.innerHTML = '<i class="bi bi-hourglass-split"></i> Salvando...';
               btnSalvar.disabled = true;

               const response = await fetch(API_URL, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(produtoAtualizado)
               });

               if (response.ok) {
                    mostrarToast("Atualizado!", "Produto editado com sucesso.", "sucesso");
                    fecharModal();
                    limparAlteracoes('modalEdit');
                    carregarProdutos();
               } else {
                    const resultado = await response.json();
                    throw new Error(resultado.error || "Erro ao atualizar");
               }
          } catch (error) {
               console.error(error);
               mostrarToast("Erro", "Falha ao editar.", "erro");
          } finally {
               const btnSalvar = document.querySelector("#modalEdit .botao_salvar");
               btnSalvar.innerHTML = '<i class="bi bi-floppy-fill"></i> Salvar';
               btnSalvar.disabled = false;
          }
     });

     document.querySelector("#modalEdit .botao_visualizar").addEventListener("click", (e) => {
          e.preventDefault();
          abrirModal("modalView");
     });

     document.querySelector("#modalEdit .botao_excluir").addEventListener("click", (e) => {
          e.preventDefault();
          abrirAlert("alert1");
     });

     document.querySelector("#modalEdit .botao_limpar").addEventListener("click", (e) => {
          e.preventDefault();

          const temAlgoDigitado = Object.values(inputsEdit).some(input =>
               input && input.value.trim() !== ""
          );

          formEdit.reset();

          Object.values(inputsEdit).forEach(input => {
               if (input) input.classList.remove("erro_input");
          });

          if (temAlgoDigitado) {
               mostrarToast(
                    "Campos limpos!",
                    "Todos os campos foram resetados com sucesso.",
                    "sucesso"
               );
               limparAlteracoes('modalEdit');
          }
     });

     /* ================================
                 MODAL VISUALIZAR
     ================================*/
     document.querySelector("#modalView .botao_editar").addEventListener("click", (e) => {
          e.preventDefault();
          abrirModal("modalEdit");
     });

     document.querySelector("#modalView .botao_excluir").addEventListener("click", (e) => {
          e.preventDefault();
          abrirAlert("alert1");
     });


/* ================================
CONFIGURAÇÃO DOS BOTÕES DE ALERT
================================*/

// Alert1 - Excluir produto (CONFIRMAÇÃO)
document.querySelector('#alert1 .botao_cancelar').addEventListener('click', async function () {
     if (!produtoSelecionado) return;

     try {
          // Feedback visual no botão
          const btnDeletar = this;
          const textoOriginal = btnDeletar.innerHTML;
          btnDeletar.innerHTML = "Excluindo...";
          btnDeletar.disabled = true;

          // Envia o comando DELETE para a API (passando o ID na URL)
          const response = await fetch(`${API_URL}?id_produto=${produtoSelecionado}`, {
               method: 'DELETE'
          });

          if (response.ok) {
               mostrarToast("Excluído!", "O item foi removido com sucesso.", "sucesso");
               fecharAlert('alert1');
            
               // Atualiza a tabela
               carregarProdutos();
          } else {
               const resultado = await response.json();
               throw new Error(resultado.error || "Erro ao excluir");
          }

     } catch (error) {
          console.error("Erro ao deletar:", error);
          mostrarToast("Erro", "Não foi possível excluir o item.", "erro");
     } finally {
          // Restaura o botão
          const btnDeletar = document.querySelector('#alert1 .botao_cancelar');
          btnDeletar.innerHTML = "Sim, deletar";
          btnDeletar.disabled = false;
     }
});

     // .botao_delete (Cancelar) AGORA só fecha o alert
     document.querySelector('#alert1 .botao_delete').addEventListener('click', function () {
          fecharAlert('alert1');
     });


     // Alert0 - Descartar alterações
     // AGORA: .botao_cancelar (Sim, sair) EXECUTA a ação
     document.querySelector('#alert0 .botao_cancelar').addEventListener('click', function () {
          const modalAberto = document.querySelector('.modalBase[style*="display: block"]');
          if (modalAberto) {
               limparAlteracoes(modalAberto.id);
               fecharModal();
          }
          fecharAlert('alert0');
     });

     // .botao_delete (Cancelar) AGORA só fecha o alert
     document.querySelector('#alert0 .botao_delete').addEventListener('click', function () {
          fecharAlert('alert0');
     });


     // BOTÕES FECHAR_ALERT PARA TODOS OS ALERTS
     document.querySelectorAll('#fechar_alert').forEach(btn => {
          btn.addEventListener('click', function () {
               const alert = this.closest('.alert_modelo');
               if (alert) {
                    fecharAlert(alert.id);
               }
          });
     });

/* ========================================
          CARREGAMENTO DE DADOS (NOVO)
========================================*/
    async function carregarProdutos() {
        try {
            // 1. Faz a requisição para o PHP
            const response = await fetch(API_URL);
            
            // Verifica se a resposta foi ok
            if (!response.ok) {
                throw new Error('Erro na resposta da rede');
            }

            const produtos = await response.json();

            // 2. Seleciona o corpo da tabela
            const tbody = document.querySelector(".table_conteudo tbody");
            tbody.innerHTML = ""; // Limpa os dados de exemplo estáticos

            // 3. Atualiza o contador de produtos no cabeçalho
            const contadorHeader = document.querySelector(".header_text p");
            if (contadorHeader) {
                contadorHeader.textContent = `${produtos.length} produtos cadastrados.`;
            }

            // 4. Se não houver produtos
            if (produtos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhum produto encontrado.</td></tr>`;
                return;
            }

            // 5. Cria as linhas da tabela
            produtos.forEach(produto => {
                const tr = document.createElement("tr");
                tr.dataset.id = produto.id_produto; // Importante para editar/excluir depois

                // Formata o preço para R$
                const precoFormatado = parseFloat(produto.preco_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                tr.innerHTML = `
                    <td>${produto.id_produto}</td>
                    <td>${produto.nome_produto}</td>
                    <td style="text-transform: capitalize;">${produto.categoria}</td>
                    <td>${produto.quantidade_estoque}</td>
                    <td>${precoFormatado}</td>
                    <td>
                        <div class="container_opcoes">
                            <button class="botao_opcoes" aria-label="Abrir opções do produto">
                                <i class="bi bi-three-dots"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // 6. Reativa os listeners do menu de opções (pois os botões foram recriados)
            atualizarEventosMenu();

        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            mostrarToast("Erro", "Não foi possível carregar o estoque.", "erro");
        }
    }

    // Função auxiliar para reativar o menu nos novos botões
    function atualizarEventosMenu() {
        const novosBotoes = document.querySelectorAll(".botao_opcoes");
        const menuOpcoes = document.getElementById("menuUnico");

        novosBotoes.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                
                // Posiciona o menu
                const rect = btn.getBoundingClientRect();
                menuOpcoes.style.top = rect.bottom + window.scrollY + "px";
                menuOpcoes.style.left = rect.left + window.scrollX + "px";
                menuOpcoes.style.display = "block";

                // Salva o ID do produto selecionado
                const linha = btn.closest("tr");
                produtoSelecionado = linha.dataset.id;
                console.log("Produto ID selecionado:", produtoSelecionado); // Debug
            });
        });
    }
   
/* ========================================
       FUNÇÃO PARA CARREGAR DADOS NO MODAL DE VISUALIZAÇÃO
    ========================================*/
    async function carregarDadosVisualizar(id) {
        try {
            // Abre o modal primeiro para dar feedback visual
            abrirModal("modalView"); 

            // Busca os dados específicos desse ID na API
            const response = await fetch(`${API_URL}?id_produto=${id}`);
            
            if (!response.ok) throw new Error("Erro ao buscar detalhes do produto");

            const produto = await response.json();

            // Preenche os campos do modal Visualizar (inputsView)
            inputsView.nome.value = produto.nome_produto;
            inputsView.descricao.value = produto.descricao;
            inputsView.categoria.value = produto.categoria; // Aqui o value minúsculo (ex: "saude") funciona perfeitamente com o select!
            inputsView.quantidade.value = produto.quantidade_estoque;
            
            // Formata o preço para exibir (ex: 5.20 -> 5,20)
            // Como o input é type="number" ou similar com máscara, dependendo do browser, 
            // às vezes precisamos ajustar o formato.
            // Se o teu input for texto com máscara:
            inputsView.preco.value = parseFloat(produto.preco_unitario).toFixed(2).replace('.', ',');

            // Preenche o cabeçalho do modal com ID e Nome
            document.getElementById("view_id").textContent = `#${produto.id_produto}`;
            document.getElementById("view_selectProductName").textContent = produto.nome_produto;
            
            // Opcional: Se quiseres mostrar o ID do usuário que criou (já que o PHP retorna id_usuario)
            // document.getElementById("view_userName").textContent = produto.id_usuario; 

        } catch (error) {
            console.error("Erro ao visualizar:", error);
            mostrarToast("Erro", "Não foi possível carregar os detalhes.", "erro");
            fecharModal();
        }
    }

/* ========================================
       FUNÇÃO PARA CARREGAR DADOS NO MODAL DE EDIÇÃO
 ========================================*/
     async function carregarDadosEditar(id) {
          try {
               abrirModal("modalEdit");
               inputsEdit.nome.value = "Carregando...";

               const response = await fetch(`${API_URL}?id_produto=${id}`);
               if (!response.ok) throw new Error("Erro ao buscar dados");

               const produto = await response.json();

               // Preenche ID e textos
               document.getElementById("edit_id").textContent = `#${produto.id_produto}`;
               document.getElementById("edit_selectProductName").textContent = produto.nome_produto;
            
               inputsEdit.nome.value = produto.nome_produto;
               inputsEdit.descricao.value = produto.descricao;
               inputsEdit.quantidade.value = produto.quantidade_estoque;

               // CORREÇÃO 2 (CATEGORIA EM BRANCO): Lógica inteligente de seleção
               // Tenta definir pelo valor exato (ex: "alimento")
               inputsEdit.categoria.value = produto.categoria;
            
               // Se falhar (selectedIndex ficar -1) porque o banco tem "Alimento" e o HTML tem "alimento"
               if (inputsEdit.categoria.selectedIndex === -1) {
                    // Procura a opção pelo texto, ignorando maiúsculas/minúsculas
                    for (let i = 0; i < inputsEdit.categoria.options.length; i++) {
                         if (inputsEdit.categoria.options[i].text.toLowerCase() === produto.categoria.toLowerCase()) {
                         inputsEdit.categoria.selectedIndex = i;
                         break;
                         }
                    }
               }

               // CORREÇÃO PREÇO VISUAL: Formata para exibir no input com a máscara
               let preco = parseFloat(produto.preco_unitario).toFixed(2); 
               preco = preco.replace('.', ',');
               if (preco.length < 5) preco = "0" + preco; // Garante 05,00 se necessário
               inputsEdit.preco.value = preco;

          } catch (error) {
               console.error("Erro edição:", error);
               mostrarToast("Erro", "Não foi possível carregar os dados.", "erro");
               fecharModal();
          }
     }
    

});