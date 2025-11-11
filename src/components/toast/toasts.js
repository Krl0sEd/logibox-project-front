// Função para mostrar um toast
function mostrarToast(id) {
    const toast = document.getElementById(id);
    if (!toast) return;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// pra mostrar:
mostrarToast("toast_confirma");
mostrarToast("toast_erro");