const form = document.getElementById('recoverForm');
      const email = document.getElementById('email');
      const feedbackModal = new bootstrap.Modal(document.getElementById('feedback_modal'));
      const modalTitle = document.getElementById('modal_title');
      const modalMessage = document.getElementById('modal_message');

      form.addEventListener('submit', (e) => {
        e.preventDefault(); // impede envio real (simulação)

        if (!email.value.trim()) {
          email.classList.add('is-invalid');
          email.focus();
          return;
        }

        email.classList.remove('is-invalid');

        // Simulação de resposta do PHP
        const emailValido = (email.value === "teste@exemplo.com"); // apenas para teste

        if (emailValido) {
          modalTitle.textContent = "✔ Link enviado!";
          modalMessage.innerHTML = "Enviamos um link de redefinição para o seu e-mail.";
          document.querySelector('.modal-header').classList.replace("bg-danger", "bg-success");
          document.querySelector('.btn.btn-danger').classList.replace("btn-danger", "btn-success");
          
          feedbackModal.show();

          document.getElementById('feedback_modal').addEventListener('hidden.bs.modal', () => {
            window.location.href = "login.html";
          });

        } else {
          modalTitle.textContent = "✖ E-mail não encontrado!";
          modalMessage.innerHTML = "Verifique o endereço digitado e tente novamente.";
          document.querySelector('.modal-header').classList.replace("bg-success", "bg-danger");
          document.querySelector('.btn.btn-success')?.classList.replace("btn-success", "btn-danger");
          
          feedbackModal.show();
        }
      });

      email.addEventListener('input', () => {
        email.classList.remove('is-invalid');
      });