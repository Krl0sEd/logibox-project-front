function mostrarAlert(id) {
    const alerta = document.getElementById(id);
    if (!alerta) return;

    alerta.classList.remove('fechar');
    alerta.style.display = "flex";
}

// Função para fechar o alert com animação
function fecharAlert(id) {
    const alerta = document.getElementById(id);
    if (!alerta) return;

    alerta.classList.add('fechar');
    setTimeout(() => {
        alerta.style.display = "none";
    }, 300);
}

// pra mostrar:
mostrarAlert("alert0");
mostrarAlert("alert1");
mostrarAlert("alert2"); 