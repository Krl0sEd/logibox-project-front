// Pegando o usuário salvo
const usuario = JSON.parse(localStorage.getItem("user") || "{}");

const isAdmin = Number(usuario.admin) === 1;

// Se NÃO for admin, esconder menus restritos
if (!isAdmin) {
    const navUsuario = document.getElementById('menu-usuarios');
    const navLog = document.getElementById('menu-log');
    const linha_dados = document.getElementById('linha_dados');

    if (navUsuario) navUsuario.style.display = "none";
    if (navLog) navLog.style.display = "none";
    if (linha_dados) linha_dados.style.display = "none";
}
