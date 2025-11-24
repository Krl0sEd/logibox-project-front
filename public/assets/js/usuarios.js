document.addEventListener("DOMContentLoaded", () => {


     /* ========================================
                         AUTH
     ========================================*/
     if (window.auth && window.auth.initAuth) {
          window.auth.initAuth();
     }


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

     /* ========================================
                     PESQUISA NA TABELA
     ========================================*/
     function limparDestaques(elemento) {
          elemento.innerHTML = elemento.textContent;
     }

     function destacarTexto(celula, termo) {
          const textoOriginal = celula.textContent;
          const regex = new RegExp(`(${termo})`, "gi");
          celula.innerHTML = textoOriginal.replace(regex, `<span class="highlight">$1</span>`);
     }

     function filtrarTabela() {
          const termo = inputPesquisa.value.trim().toLowerCase();
          const termos = termo.split(",").map(t => t.trim()).filter(t => t !== "");

          linhasTabela.forEach(linha => {
               const celulas = linha.querySelectorAll("td");
               let corresponde = false;

               celulas.forEach(celula => {
                    limparDestaques(celula);

                    if (termos.some(termo => celula.textContent.toLowerCase().includes(termo))) {
                         corresponde = true;
                         termos.forEach(termo => {
                              if (celula.textContent.toLowerCase().includes(termo)) {
                                   destacarTexto(celula, termo);
                              }
                         });
                    }
               });

               linha.style.display = corresponde || termos.length === 0 ? "" : "none";
          });
     }

     inputPesquisa.addEventListener("input", filtrarTabela);

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

               if (acao === "editar") abrirModal("modalEdit");
               if (acao === "visualizar") abrirModal("modalView");
               if (acao === "excluir") abrirAlert("alert1");

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

document.querySelector('#alert1 .botao_delete').addEventListener('click', function () {
    mostrarToast(
        "Usuário excluído!",
        "O usuário foi excluído com sucesso.",
        "sucesso"
    );
    fecharAlert('alert1');
    fecharModal();
});


// BOTÕES FECHAR_ALERT PARA TODOS OS ALERTS
document.querySelectorAll('#fechar_alert').forEach(btn => {
    btn.addEventListener('click', function() {
        const alert = this.closest('.alert_modelo');
        if (alert) {
            fecharAlert(alert.id);
        }
    });
});

// Ou se você tem múltiplos alerts com IDs diferentes:
document.querySelectorAll('.fechar_alert').forEach(btn => {
    btn.addEventListener('click', function() {
        const alert = this.closest('.alert_modelo');
        if (alert) {
            fecharAlert(alert.id);
        }
    });
});

   
});
