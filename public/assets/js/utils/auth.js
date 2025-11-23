// ========================
// SALVAR USUÁRIO NO LOCALSTORAGE
// ========================
export function salvarUsuarioLocalStorage(usuario) {
  // usuário = { id, nome, tipo }
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

// ========================
// VERIFICAR SE USUÁRIO ESTÁ LOGADO
// ========================
export function verificarLogin() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  return usuario !== null;
}

// ========================
// RETORNAR TIPO DO USUÁRIO
// ========================
export function verificarTipo() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  return usuario ? usuario.tipo : null;
}

// ========================
// BUSCAR DADOS DO USUÁRIO PELO ID
// Por enquanto simula fetch do back
// ========================
export async function buscarDadosUsuario(id) {
  // Simulação de retorno do back
  // Substitua pelo fetch real quando tiver endpoint
  const mockDB = [
    { id: 1, nome: 'Wilson Pereira', tipo: 'admin' },
    { id: 2, nome: 'João Silva', tipo: 'comum' }
  ];

  return new Promise((resolve) => {
    const usuario = mockDB.find(u => u.id === id);
    setTimeout(() => resolve(usuario || null), 300);
  });
}

// ========================
// CONTROLAR SIDEBAR BASEADO NO TIPO
// ========================
export function controlarSidebar() {
  const tipo = verificarTipo();
  if (!tipo) return;

  // exemplo de elementos do menu
  const menuDashboard = document.getElementById('menu-dashboard');
  const menuUsuarios = document.getElementById('menu-usuarios');
  const menuProdutos = document.getElementById('menu-produtos');
  const menuLog = document.getElementById('menu-log');

  // todos escondidos por padrão
  [menuDashboard, menuUsuarios, menuProdutos, menuLog].forEach(el => {
    if (el) el.style.display = 'none';
  });

  // items visíveis conforme tipo
  if (menuDashboard) menuDashboard.style.display = 'block';
  if (menuProdutos) menuProdutos.style.display = 'block';

  if (tipo === 'admin') {
    if (menuUsuarios) menuUsuarios.style.display = 'block';
    if (menuLog) menuLog.style.display = 'block';
  }
}

// ========================
// LOGOUT
// ========================
export function logout() {
  localStorage.removeItem('usuario');
  window.location.href = '../pages/login.html'; // ajuste o caminho conforme necessário
}

// ========================
// INICIALIZAÇÃO AUTOMÁTICA
// ========================
export function initAuth() {
  if (!verificarLogin()) {
    // redireciona para login se não estiver logado
    window.location.href = '../pages/login.html';
  } else {
    controlarSidebar();
  }
}