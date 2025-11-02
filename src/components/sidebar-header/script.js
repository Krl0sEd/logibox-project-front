/* =========================================================
                         SIDEBAR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.querySelector("body");
  const sidebar = body.querySelector(".sidebar");
  const layout_wrapper = document.querySelector(".layout_wrapper");
  const sidebar_btn = document.getElementById("sidebar_btn");
  const logo_texto = document.querySelector(".logo_texto");
  const sidebar_link_texts = document.querySelectorAll(".sidebar_link_text");
  const sidebar_links = document.querySelectorAll(".sidebar_link");
  const btn_fechar = document.querySelector(".sidebar_close_btn i");

  function ligarSideBar() {
    sidebar.classList.toggle("on");
    layout_wrapper.classList.toggle("sidebar_fechado");

    if (sidebar.classList.contains("on")) {
      logo_texto.classList.toggle("invisivel");
      btn_fechar.classList.toggle("inverte");
      sidebar_link_texts.forEach((element) => {
        element.classList.toggle("invisivel");
      });
      sidebar_links.forEach((element) => {
        element.classList.toggle("invisivel");
      });

    } else {
      logo_texto.classList.toggle("invisivel");
      btn_fechar.classList.toggle("inverte");
      sidebar_link_texts.forEach((element) => {
        element.classList.toggle("invisivel");
      });
      sidebar_links.forEach(element => {
          element.classList.toggle("invisivel")
      })
    }
  }

  sidebar_btn.addEventListener("click", ligarSideBar);
});
