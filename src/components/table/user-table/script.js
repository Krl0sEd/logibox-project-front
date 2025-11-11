document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.botao_opcoes');
  let activeMenu = null;

  function closeAllMenus() {
    if (activeMenu) {
      activeMenu.classList.remove('ativo');
      document.body.removeChild(activeMenu);
      activeMenu = null;
    }
  }

  buttons.forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();

      // Fecha qualquer menu aberto
      closeAllMenus();

      // Clona o menu e adiciona no body
      const menu = button.nextElementSibling.cloneNode(true);
      menu.classList.add('ativo');
      document.body.appendChild(menu);
      activeMenu = menu;

      // Calcula posição abaixo do botão
      const rect = button.getBoundingClientRect();
      menu.style.top = `${rect.bottom + 4}px`;
      menu.style.left = `${rect.left + 0}px`;
      menu.style.right = `${rect.right + 50}px`;

      // Impede o fechamento ao clicar dentro do menu
      menu.addEventListener('click', ev => ev.stopPropagation());
    });
  });

  // Fecha ao clicar fora
  document.addEventListener('click', () => closeAllMenus());

  // Fecha se redimensionar a tela
  window.addEventListener('resize', () => closeAllMenus());
});
