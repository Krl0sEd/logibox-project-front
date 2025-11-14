document.addEventListener("DOMContentLoaded", () => {

        const form = document.getElementById('recoverForm');
        const email = document.getElementById('email');

        const feedback_modal = new bootstrap.Modal(document.getElementById('feedback_modal'));
        const modal_title = document.getElementById('modal_title');
        const modal_message = document.getElementById('modal_message');
        const modal_header = document.querySelector('#feedback_modal .modal-header');
        const modal_btn = document.querySelector('#feedback_modal .modal-footer .btn');

        form.addEventListener('submit', (e) => {
          e.preventDefault(); // REMOVER quando conectar ao PHP

          // === VALIDAÇÃO PERSONALIZADA ===
          if (!email.value.trim()) {
            modal_header.className = "modal-header bg-danger text-white";
            modal_btn.className = "btn btn-danger";
            modal_title.textContent = "⚠ Campo vazio";
            modal_message.innerHTML = "Digite seu e-mail antes de continuar.";

            feedback_modal.show();
            return;
          }

          // SIMULAÇÃO TEMPORÁRIA
          const email_valido = (email.value === "teste@exemplo.com");

          if (email_valido) {
            modal_header.className = "modal-header bg-success text-white";
            modal_btn.className = "btn btn-success";

            modal_title.textContent = "✔ Link enviado!";
            modal_message.innerHTML = "Enviamos um link de redefinição para o seu e-mail.";

            feedback_modal.show();

            document.getElementById('feedback_modal')
              .addEventListener('hidden.bs.modal', () => {
                window.location.href = "login.html";
              }, { once: true });

          } else {
            modal_header.className = "modal-header bg-danger text-white";
            modal_btn.className = "btn btn-danger";

            modal_title.textContent = "✖ E-mail não encontrado!";
            modal_message.innerHTML = "Verifique o endereço digitado e tente novamente.";

            feedback_modal.show();
          }
        });
      });