// Alternar visibilidade da senha
    document.querySelectorAll('.toggle-password').forEach(button => {
      button.addEventListener('click', function() {
        const target_id = this.getAttribute('data-target');
        const password_input = document.getElementById(target_id);
        const icon = this.querySelector('i');
        
        if (password_input.type === 'password') {
          password_input.type = 'text';
          icon.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
          password_input.type = 'password';
          icon.classList.replace('bi-eye-slash', 'bi-eye');
        }
      });
    });

    // Validação de formulário e integração com PHP
    document.getElementById('login_form').addEventListener('submit', function(event) {
      event.preventDefault();
      
      const login_input = document.getElementById('login').value.trim();
      const senha_input = document.getElementById('senha').value.trim();
      const modal = new bootstrap.Modal(document.getElementById('feedback_modal'));
      const modal_title = document.getElementById('modal_title');
      const modal_message = document.getElementById('modal_message');

      // Validações de front-end
      if (!login_input && !senha_input) {
        modal_title.textContent = 'Erro ao entrar';
        modal_message.textContent = 'Por favor, preencha o login e a senha.';
        modal.show();
        return;
      } else if (!login_input) {
        modal_title.textContent = 'Login não informado';
        modal_message.textContent = 'Digite seu login para continuar.';
        modal.show();
        return;
      } else if (!senha_input) {
        modal_title.textContent = 'Senha não informada';
        modal_message.textContent = 'Digite sua senha para continuar.';
        modal.show();
        return;
      }

      // Envio dos dados para o PHP (AGORA ENVIA JSON)
  fetch('http://163.176.193.115/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login: login_input,
      senha: senha_input
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.sucesso) {
      localStorage.setItem("user", JSON.stringify({
    nome: usuario.nome,
    tipo: usuario.tipo
}));
      modal_title.textContent = 'Login bem-sucedido!';
      modal_message.textContent = 'Bem-vindo à Logibox.';
      modal.show();

      setTimeout(() => {
        window.location.href = '../pages/dashboard.html';
      }, 800);

    } else {
      modal_title.textContent = 'Erro ao entrar';
      modal_message.textContent = data.error || 'Login ou senha incorretos.';
      modal.show();
    }
  })
  .catch(error => {
    modal_title.textContent = 'Erro de conexão';
    modal_message.textContent = 'Não foi possível conectar ao servidor.';
    modal.show();
    console.error('Erro:', error);
  });
});