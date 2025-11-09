// Função para mostrar um toast
function mostrarToast(id) {
    const toast = document.getElementById(id);
    if (!toast) return;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// para fechar toast 
const btnFecharToast = document.querySelectorAll('.btn_fechar_toast')

btnFecharToast.forEach(botao => {
     botao.addEventListener('click', () => {
          const toast = botao.closest('.toast_modelo');
          if (toast) {
               toast.classList.remove('show');
          }
     })
})


// pra mostrar:
mostrarToast("toast_confirma");
mostrarToast("toast_erro");
