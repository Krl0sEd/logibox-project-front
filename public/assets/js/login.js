// Alternar visibilidade da senha
document.querySelectorAll('.toggle-password').forEach(button => {
     button.addEventListener('click', function () {
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

// Login
document.getElementById('login_form').addEventListener('submit', function (event) {
     event.preventDefault();

     const login_input = document.getElementById('login').value.trim();
     const senha_input = document.getElementById('senha').value.trim();
     const modal = new bootstrap.Modal(document.getElementById('feedback_modal'));
     const modal_title = document.getElementById('modal_title');
     const modal_message = document.getElementById('modal_message');

     // Validações básicas
     if (!login_input || !senha_input) {
          modal_title.textContent = 'Erro ao entrar';
          modal_message.textContent = 'Informe login e senha.';
          modal.show();
          return;
     }

     // Enviar para o PHP
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
               console.log("RETORNO DO PHP:", data);

               if (data.sucesso) {

                    // ⬇️ aqui pega os dados do usuário retornado pelo PHP
                    const usuario = data.usuario || {};

                    // salvar no localStorage
                    localStorage.setItem("user", JSON.stringify(usuario));

                    modal_title.textContent = 'Login bem-sucedido!';
                    modal_message.textContent = 'Bem-vindo à Logibox.';
                    modal.show();

                    setTimeout(() => {
                         window.location.href = '../pages/2fa.html';
                    }, 600);

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
