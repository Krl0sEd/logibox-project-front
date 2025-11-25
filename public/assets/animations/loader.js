
/* ==========================================
                LOADER GLOBAL
   ========================================== */

//  Fiz esse js caso quiserem usar, notei que em qualquer click de carregamento de pág ele de fato aparece
// isso é bom, mas pode parecer que é glitch 
// fica critério de vocês usarem em todas as páginas ao carregar ou não <3

document.addEventListener("DOMContentLoaded", () => {
    const loaderContainer = document.getElementById("loader_container");

    function showLoader() {
        loaderContainer.style.display = "flex";
        loaderContainer.style.opacity = "1";
    }

    function hideLoader() {
        loaderContainer.style.transition = "opacity .3s ease";
        loaderContainer.style.opacity = "0";

        setTimeout(() => {
            loaderContainer.style.display = "none";
        }, 300);
    }

    // Ativa o loader no início
    showLoader();

    // Desativa quando tudo carregar
    window.addEventListener("load", () => {
        hideLoader();
    });

    // EXPORTA para outros scripts usarem
    window.showLoader = showLoader;
    window.hideLoader = hideLoader;
});
