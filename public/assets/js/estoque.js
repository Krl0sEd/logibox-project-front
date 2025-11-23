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
     /* ================================
                MENU DA TABELA
     ================================ */

     const buttonsOpcoes = document.querySelectorAll(".botao_opcoes");
     const menuOpcoes = document.getElementById("menuUnico");

     let produtoSelecionado = null;

     buttonsOpcoes.forEach(btn => {
          btn.addEventListener("click", (e) => {
               e.stopPropagation();

               // Posição do menu
               const rect = btn.getBoundingClientRect();
               menuOpcoes.style.top = rect.bottom + window.scrollY + "px";
               menuOpcoes.style.left = rect.left + window.scrollX + "px";
               menuOpcoes.style.display = "block";

               // Pega o ID da linha
               const linha = btn.closest("tr");
               produtoSelecionado = linha.dataset.id;
          });
     });

     // Fecha o menu ao clicar fora
     document.addEventListener("click", () => {
          menuOpcoes.style.display = "none";
     });

     //para disparar determinada ação 
     menuOpcoes.querySelectorAll(".botao_acao").forEach(btn => {
          btn.addEventListener("click", (e) => {
               e.stopPropagation();

               const acao = btn.dataset.acao;

               if (acao === "editar") abrirModal("modalEdit");
               if (acao === "visualizar") abrirModal("modalView");
               if (acao === "excluir") abrirAlert("alert1");

               menuOpcoes.style.display = "none";
          });
     });


     /* ================================
                   MODAIS 
     ================================ */

     const modalOverlay = document.getElementById("modalOverlay");

     function abrirModal(id) {
          // FECHA QUALQUER ALERT ABERTO ANTES
          fecharAlert();

          modalOverlay.classList.add("on");
          modalOverlay.style.zIndex = "999"; // Z-index normal para modais

          // Esconde todos os modais
          document.querySelectorAll(".modalBase").forEach(m => {
               m.style.display = "none";
          });

          // Mostra o modal correto
          const modal = document.getElementById(id);
          if (modal) {
               modal.style.display = "block";
          }
     }

     function fecharModal() {
          // Esconde todos os modais
          document.querySelectorAll(".modalBase").forEach(m => {
               m.style.display = "none";
          });

          // Remove overlay apenas se não tiver alert aberto
          const alertsAbertos = document.querySelectorAll('.alert_modelo.aberto');
          if (alertsAbertos.length === 0) {
               modalOverlay.classList.remove("on");
          }
     }

     // Abrir modal de criar
     document.getElementById("btn_criar").addEventListener("click", () => {
          abrirModal("modalCreate");
     });

     // Fechar modal clicando fora do conteúdo
     modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) {
               fecharModal();
               fecharAlert(); // Fecha alert também se estiver aberto
          }
     });

     // Fechar com ESC
     document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
               fecharModal();
               fecharAlert();
          }
     });



    /* ================================
            ALERT
================================ */

function abrirAlert(id) {

    const alert = document.getElementById(id);
    if (alert) {
        alert.classList.add("aberto");
        // Usa o mesmo overlay dos modais mas com z-index maior
        modalOverlay.classList.add("on");
        modalOverlay.style.zIndex = "1000"; // Garante que fique acima de tudo
    }
}

function fecharAlert(id) {
    // Se passar ID específico, fecha só aquele
    if (id) {
        const alert = document.getElementById(id);
        if (alert) {
            alert.classList.remove("aberto");
        }
    } else {
        // Se não passar ID, fecha todos
        document.querySelectorAll('.alert_modelo').forEach(alert => {
            alert.classList.remove("aberto");
        });
    }

    // Remove o overlay apenas se não tiver modal aberto E não tiver alert aberto
    const modaisAbertos = document.querySelectorAll('.modalBase[style*="display: block"]');
    const alertsAbertos = document.querySelectorAll('.alert_modelo.aberto');
    
    if (modaisAbertos.length === 0 && alertsAbertos.length === 0) {
        modalOverlay.classList.remove("on");
        modalOverlay.style.zIndex = ""; // Volta ao normal
    }
}

// REMOVA estas linhas antigas que estavam fechando todos os alerts
// const botao_delete = document.querySelectorAll('.botao_delete');
// const fechar_modal = document.querySelectorAll('.fechar_modal');

// botao_delete.forEach(btn => {
//     btn.addEventListener('click', () => fecharAlert());
// });
// fechar_modal.forEach(btn => {
//     btn.addEventListener('click', () => fecharAlert());
// });

// EM VEZ DISSO, configure individualmente cada alert:

/* ================================
     CONFIGURAÇÃO DOS BOTÕES DE ALERT
================================ */

// Botão "Sim, deletar" no alert1
document.querySelector('#alert1 .botao_cancelar').addEventListener('click', function() {
    mostrarToast(
        "Item excluído!",
        "O item foi excluído com sucesso.",
        "sucesso"
    );
    fecharAlert('alert1');
});

// Botão "Cancelar" no alert1
document.querySelector('#alert1 .botao_delete').addEventListener('click', function() {
    fecharAlert('alert1');
});

// Botão "Sim, sair" no alert0 - descarta alterações
document.querySelector('#alert0 .botao_cancelar').addEventListener('click', function() {
    const modalAberto = document.querySelector('.modalBase[style*="display: block"]');
    if (modalAberto) {
        limparAlteracoes(modalAberto.id);
        fecharModal();
    }
    fecharAlert('alert0');
});

// Botão "Cancelar" no alert0 - volta para o modal SEM fechar
document.querySelector('#alert0 .botao_delete').addEventListener('click', function() {
    fecharAlert('alert0');
    // NÃO chama fecharModal() aqui - só fecha o alert
});

// Botão "Sim, sair" no alert2
document.querySelector('#alert2 .botao_cancelar').addEventListener('click', function() {
    mostrarToast(
        "Sessão encerrada!",
        "Você foi desconectado com sucesso.",
        "sucesso"
    );
    fecharAlert('alert2');
});

// Botão "Cancelar" no alert2
document.querySelector('#alert2 .botao_delete').addEventListener('click', function() {
    fecharAlert('alert2');
});

// Botões fechar modal (X) nos alerts - configurar individualmente
document.querySelectorAll('.fechar_modal').forEach(btn => {
    btn.addEventListener('click', function() {
        const alert = this.closest('.alert_modelo');
        if (alert) {
            fecharAlert(alert.id);
        }
    });
});

// Configuração específica para o fechar_modal do alert0 (se tiver um X específico)
const fecharModalAlert0 = document.querySelector('#alert0 .fechar_modal');
if (fecharModalAlert0) {
    fecharModalAlert0.addEventListener('click', function() {
        fecharAlert('alert0');
    });
}


     /* ================================
                   TOAST 
     ================================ */
     window.mostrarToast = function (titulo, texto, tipo = "sucesso") {

          const toast = document.getElementById("toast_unico");
          const tTitulo = document.getElementById("toast_titulo");
          const tTexto = document.getElementById("toast_texto");
          const tIcone = document.getElementById("toast_icone");

          // Texto
          tTitulo.textContent = titulo;
          tTexto.textContent = texto;

          // Ícones
          if (tipo === "sucesso") {
               tIcone.className = "bi bi-check-circle-fill icone_alerta";
          } else {
               tIcone.className = "bi bi-x-circle-fill icone_alerta";
          }

          // Limpa os estilos anteriores
          toast.classList.remove("toast_sucesso", "toast_erro");

          // Aplica o estilo correto
          toast.classList.add(tipo === "sucesso" ? "toast_sucesso" : "toast_erro");

          // Mostra o toast
          toast.classList.add("show");

          setTimeout(() => toast.classList.remove("show"), 3000);
     };

     // Botão fechar
     document.querySelector(".btn_fechar_toast").addEventListener("click", () => {
          document.getElementById("toast_unico").classList.remove("show");
     });

     /* ================================
                         Fluxo 
     ================================ */

     /* ================================
          CONTROLE DE ALTERAÇÕES NOS MODAIS
     ================================ */

     let modalComAlteracoes = {
          'modalCreate': false,
          'modalEdit': false
     };

     // Função para verificar se há alterações nos modais
     function verificarAlteracoesModal(modalId) {
          const inputs = modalId === 'modalCreate' ? inputsCreate : inputsEdit;
          return Object.values(inputs).some(input =>
               input && input.value.trim() !== ""
          );
     }

     // Função para marcar que há alterações
     function marcarAlteracoes(modalId) {
          modalComAlteracoes[modalId] = true;
     }

     // Função para limpar alterações (quando salva ou limpa)
     function limparAlteracoes(modalId) {
          modalComAlteracoes[modalId] = false;
     }

     /* ================================
          MODIFICAÇÃO NO FECHAR MODAL
     ================================ */

     function fecharModalComVerificacao(modalId) {
          if ((modalId === 'modalCreate' || modalId === 'modalEdit') &&
               modalComAlteracoes[modalId]) {
               abrirAlert("alert0");
          } else {
               fecharModal();
          }
     }

     // Substituir os event listeners dos closeButtons
     document.querySelectorAll(".closeButton").forEach(btn => {
          btn.addEventListener("click", function () {
               const modal = this.closest('.modalBase');
               if (modal) {
                    fecharModalComVerificacao(modal.id);
               }
          });
     });

     // Modificar o fechar modal clicando fora
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

     // Modificar o fechar com ESC
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
     ================================ */

     // Máscara para preço (funciona para todos os inputs de preço)
     function aplicarMascaraPreco(input) {
          if (!input) return;

          input.addEventListener("input", function () {
               let valor = this.value.replace(/\D/g, ""); // só números

               if (valor.length === 0) {
                    this.value = "";
                    return;
               }

               // Remove zeros à esquerda
               valor = parseInt(valor).toString();

               // Formata como decimal
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

     // Validação de quantidade
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

     // Validação de campos obrigatórios
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
     ================================ */

     // Aplica máscaras a todos os inputs de preço e quantidade
     document.addEventListener('DOMContentLoaded', function () {
          // Máscaras para preço
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

          // Validações para quantidade
          const inputsQuantidade = [
               'create_quantidade_produto',
               'edit_quantidade_produto',
               'view_quantidade_produto'
          ];

          inputsQuantidade.forEach(id => {
               const input = document.getElementById(id);
               if (input) {
                    // Validação em tempo real
                    input.addEventListener('input', function () {
                         validarQuantidadeInput(this);
                    });

                    // Validação quando perde o foco
                    input.addEventListener('blur', function () {
                         validarQuantidadeInput(this);
                    });
               }
          });
     });

     /* ================================
               MODAL CREATE
     ================================ */

     const formCreate = document.getElementById("formCreateProduto");
     const inputsCreate = {
          nome: document.getElementById("create_nome_produto"),
          descricao: document.getElementById("create_descricao_produto"),
          categoria: document.getElementById("create_categoria_produto"),
          quantidade: document.getElementById("create_quantidade_produto"),
          preco: document.getElementById("create_precouni_produto")
     };

     // DETECTAR ALTERAÇÕES NOS INPUTS DO CREATE
     Object.values(inputsCreate).forEach(input => {
          if (input) {
               input.addEventListener('input', () => {
                    if (verificarAlteracoesModal('modalCreate')) {
                         marcarAlteracoes('modalCreate');
                    }
               });
          }
     });

     // BOTÃO CRIAR
     document.getElementById("btnSalvarCreate").addEventListener("click", (e) => {
          e.preventDefault();

          // Valida quantidade
          if (!validarQuantidade(inputsCreate.quantidade.value)) {
               mostrarToast(
                    "Quantidade inválida",
                    "A quantidade deve ser maior que zero e conter apenas números (máx. 4 dígitos).",
                    "erro"
               );
               inputsCreate.quantidade.classList.add("erro_input");
               return;
          }

          // Valida campos obrigatórios
          const camposVazios = validarCamposObrigatorios(inputsCreate);
          if (camposVazios.length > 0) {
               mostrarToast(
                    "Campos obrigatórios",
                    "Por favor, preencha todos os campos antes de continuar.",
                    "erro"
               );
               return;
          }

          // Se tudo OK → cria item
          mostrarToast(
               "Item criado!",
               "O novo item foi cadastrado com sucesso.",
               "sucesso"
          );

          limparAlteracoes('modalCreate');
          fecharModal();
          formCreate.reset();
     });

     // BOTÃO LIMPAR
     document.querySelector("#modalCreate .botao_limpar").addEventListener("click", (e) => {
          e.preventDefault();

          const temAlgoDigitado = Object.values(inputsCreate).some(input =>
               input && input.value.trim() !== ""
          );

          formCreate.reset();

          // Remove classes de erro
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
     ================================ */

     const formEdit = document.getElementById("formEditProduto");
     const inputsEdit = {
          nome: document.getElementById("edit_nome_produto"),
          descricao: document.getElementById("edit_descricao_produto"),
          categoria: document.getElementById("edit_categoria_produto"),
          quantidade: document.getElementById("edit_quantidade_produto"),
          preco: document.getElementById("edit_precouni_produto")
     };

     // DETECTAR ALTERAÇÕES NOS INPUTS DO EDIT
     Object.values(inputsEdit).forEach(input => {
          if (input) {
               input.addEventListener('input', () => {
                    if (verificarAlteracoesModal('modalEdit')) {
                         marcarAlteracoes('modalEdit');
                    }
               });
          }
     });

     // BOTÃO SALVAR EDITAR
     document.querySelector("#modalEdit .botao_salvar").addEventListener("click", (e) => {
          e.preventDefault();

          // Valida quantidade
          if (!validarQuantidade(inputsEdit.quantidade.value)) {
               mostrarToast(
                    "Quantidade inválida",
                    "A quantidade deve ser maior que zero e conter apenas números (máx. 4 dígitos).",
                    "erro"
               );
               inputsEdit.quantidade.classList.add("erro_input");
               return;
          }

          // Valida campos obrigatórios
          const camposVazios = validarCamposObrigatorios(inputsEdit);
          if (camposVazios.length > 0) {
               mostrarToast(
                    "Campos obrigatórios",
                    "Por favor, preencha todos os campos antes de salvar.",
                    "erro"
               );
               return;
          }

          limparAlteracoes('modalEdit');
          fecharModal();

          // Se tudo OK → salva alterações
          mostrarToast(
               "Alterações salvas!",
               "As modificações foram salvas com sucesso.",
               "sucesso"
          );

     });

     // BOTÃO VISUALIZAR NO MODAL EDITAR
     document.querySelector("#modalEdit .botao_visualizar").addEventListener("click", (e) => {
          e.preventDefault();
          abrirModal("modalView");
     });

     // BOTÃO EXCLUIR NO MODAL EDITAR
     document.querySelector("#modalEdit .botao_excluir").addEventListener("click", (e) => {
          e.preventDefault();
          abrirAlert("alert1");
          document.querySelector("#alert1 .botao_confirmar").addEventListener("click", () => {
               fecharAlert("alert1");

               // Fecha o modal de edição
               fecharModal("modalEdit");

               // Aqui você coloca a lógica de excluir o item, se tiver
               console.log("Item deletado!");
          });
     });

     // BOTÃO LIMPAR NO MODAL EDITAR
     document.querySelector("#modalEdit .botao_limpar").addEventListener("click", (e) => {
          e.preventDefault();

          const temAlgoDigitado = Object.values(inputsEdit).some(input =>
               input && input.value.trim() !== ""
          );

          formEdit.reset();

          // Remove classes de erro
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
     ================================ */

     const inputsView = {
          nome: document.getElementById("view_nome_produto"),
          descricao: document.getElementById("view_descricao_produto"),
          categoria: document.getElementById("view_categoria_produto"),
          quantidade: document.getElementById("view_quantidade_produto"),
          preco: document.getElementById("view_precouni_produto")
     };

     // BOTÃO EDITAR NO MODAL VISUALIZAR
     document.querySelector("#modalView .botao_editar").addEventListener("click", (e) => {
          e.preventDefault();
          abrirModal("modalEdit");
     });

     // BOTÃO EXCLUIR NO MODAL VISUALIZAR
     document.querySelector("#modalView .botao_excluir").addEventListener("click", (e) => {
          e.preventDefault();
          abrirAlert("alert1");
     });

     /* ================================
          CONFIGURAÇÃO DOS BOTÕES DE ALERT
     ================================ */

     // Botão "Sim, deletar" no alert1
     document.querySelector('#alert1 .botao_cancelar').addEventListener('click', function () {
          mostrarToast(
               "Item excluído!",
               "O item foi excluído com sucesso.",
               "sucesso"
          );
          fecharAlert('alert1');
     });

     // Botão "Sim, sair" no alert0 - descarta alterações
     document.querySelector('#alert0 .botao_cancelar').addEventListener('click', function () {
          const modalAberto = document.querySelector('.modalBase[style*="display: block"]');
          if (modalAberto) {
               limparAlteracoes(modalAberto.id);
               fecharModal();
          }
          fecharAlert('alert0');
     });

     // Botão "Sim, sair" no alert2
     document.querySelector('#alert2 .botao_cancelar').addEventListener('click', function () {
          mostrarToast(
               "Sessão encerrada!",
               "Você foi desconectado com sucesso.",
               "sucesso"
          );
          fecharAlert('alert2');
     });

     // Botão "Cancelar" em todos os alerts
     document.querySelectorAll('.botao_delete').forEach(btn => {
          btn.addEventListener('click', function () {
               const alert = this.closest('.alert_modelo');
               if (alert) {
                    fecharAlert(alert.id);
               }
          });
     });

     // Botões fechar modal (X) nos alerts
     document.querySelectorAll('.fechar_modal').forEach(btn => {
          btn.addEventListener('click', function () {
               const alert = this.closest('.alert_modelo');
               if (alert) {
                    fecharAlert(alert.id);
               }
          });
     });

});
