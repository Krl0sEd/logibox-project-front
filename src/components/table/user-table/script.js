
document.addEventListener('DOMContentLoaded', () => {

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

});
