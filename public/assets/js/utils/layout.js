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

    // Responsividade em telas grandes 
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
    
    //Função abrir submenu do usuario
    function abrirSubMenu() {
        submenu_userinfo.classList.toggle("on");
        header_btn.classList.toggle("rotacionar");
    }
    
    header_btn.addEventListener("click", abrirSubMenu);
    
    
    /* =========================================================
                         ALERTS E MODAIS
    ========================================================= */
    
//     // CORREÇÃO: Selecionar elementos DENTRO do DOMContentLoaded
//     const alert_modelo = document.getElementById("alert2"); // Use o ID correto
//     const btn_cancelar_modal = document.querySelector(".botao_cancelar"); // "Sim, sair"
//     const btn_fechar_modal = document.querySelector(".fechar_modal");
//     const btn_submenu = document.querySelector(".btn_submenu"); // Botão "Sair" do submenu
    
//     //Função abrir alert de confirmação de logout
//     function abrirAlert() {
//         console.log("Abrindo alert...");
//         alert_modelo.classList.add("aberto");
//         backdrop.classList.add("on");
//     }

//     function fecharAlert() {
//         console.log("Fechando alert...");
//         alert_modelo.classList.remove("aberto");
//         backdrop.classList.remove("on");
//     }
    
//     // CORREÇÃO: Adicionar event listeners apenas se os elementos existirem
//     if (btn_fechar_modal) {
//         btn_fechar_modal.addEventListener("click", fecharAlert);
//     }
    
//     if (btn_cancelar_modal) {
//         btn_cancelar_modal.addEventListener("click", fecharAlert);
//     }
    
//     if (btn_submenu) {
//         btn_submenu.addEventListener("click", abrirAlert);
//     }
    
//     // CORREÇÃO: Também fechar ao clicar no backdrop
//     if (backdrop) {
//         backdrop.addEventListener("click", fecharAlert);
//     }

});
