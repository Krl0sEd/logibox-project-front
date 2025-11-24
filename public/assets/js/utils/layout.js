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
     const btn_fechar_mobile = document.querySelector(".btn_fechar_mobile")
     const hamburguerBtn = document.getElementById("btn_hamburguer");
     const backdrop = document.querySelector(".backdrop")


     //   Responsividade em telas grandes 
     function ligarSideBar() { // abrir e fechar
          sidebar.classList.toggle("on");
          layout_wrapper.classList.toggle("sidebar_fechado");

          if (sidebar.classList.contains("on")) {
               logo_texto.classList.toggle("invisivel");
               btn_fechar_desktop.classList.toggle("inverte");
               sidebar_link_texts.forEach((element) => {
                    element.classList.toggle("invisivel");
               });
               sidebar_links.forEach((element) => {
                    element.classList.toggle("invisivel");
               });

          } else {
               logo_texto.classList.toggle("invisivel");
               btn_fechar_desktop.classList.toggle("inverte");
               sidebar_link_texts.forEach((element) => {
                    element.classList.toggle("invisivel");
               });
               sidebar_links.forEach(element => {
                    element.classList.toggle("invisivel")
               })
          }
     }

     sidebar_btn.addEventListener("click", ligarSideBar);

     //ao passar o mouse, vai abrir
     sidebar.addEventListener("mouseenter", () => {
          if (layout_wrapper.classList.contains("sidebar_fechado")) {
               ligarSideBar();
          }
     })

     sidebar.addEventListener("mouseleave", () => {
          if (layout_wrapper.classList.contains("on")) {
               ligarSideBar();
          }
     })

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

     //Função abrir submenu do usuario
     function abrirSubMenu() {
          submenu_userinfo.classList.toggle("on");
          header_btn.classList.toggle("rotacionar");
     }

     header_btn.addEventListener("click", abrirSubMenu);




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


     /* =========================================================
                               ALERTS
     ========================================================= */

     const btnSair = document.getElementById("btn_sair");
     const fechar_alert = document.getElementById("fechar_alert");
     const btnConfirmarSair = document.querySelector('#alert2 .botao_cancelar');
     const btnCancelarSair = document.querySelector('#alert2 .botao_delete');

     function abrirAlert(id) {
          const alert = document.getElementById(id);
          if (alert) {
               alert.classList.add("aberto");
               backdrop.classList.add("on");
          }
     }

     function fecharAlert(id) {
          if (id) {
               const alert = document.getElementById(id);
               if (alert) {
                    alert.classList.remove("aberto");
                    backdrop.classList.remove("on");
               }
          } else {
               document.querySelectorAll('.alert_modelo').forEach(alert => {
                    alert.classList.remove("aberto");
               });
          }

          const modaisAbertos = document.querySelectorAll('.modalBase[style*="display: block"]');
          const alertsAbertos = document.querySelectorAll('.alert_modelo.aberto');
     }

     // Abrir alerta ao clicar em "Sair"
     if (btnSair) {
          btnSair.addEventListener("click", () => {
               abrirAlert("alert2");
          });
     }

     // Confirmar saída
     if (btnConfirmarSair) {
          btnConfirmarSair.addEventListener("click", () => {
               mostrarToast("Sessão encerrada!", "Você foi desconectado!", "sucesso");
               fecharAlert('alert2');
               window.location.href = "login.html";
          });
     }

     // Cancelar saída
     if (btnCancelarSair) {
          btnCancelarSair.addEventListener("click", () => {
               fecharAlert('alert2');
          });
     }

     //Fechar alert ao clicar no "X"
     if (fechar_alert) {
          fechar_alert.addEventListener("click", () => {
               fecharAlert('alert2');
          })
     }

});
