const form = document.getElementById('recoverForm');
const email = document.getElementById('email');
const feedbackModal = new bootstrap.Modal(document.getElementById('feedback_modal'));
const modalTitle = document.getElementById('modal_title');
const modalMessage = document.getElementById('modal_message');
const modalHeader = document.querySelector('.modal-header');
const modalBtn = document.querySelector('#feedback_modal .modal-footer button');

form.addEventListener('submit', (e) => {
  e.preventDefault(); // REMOVE quando o PHP estiver pronto

  if (!email.value.trim()) {
    email.classList.add('is-invalid');
    email.focus();
    return;
  }

  email.classList.remove('is-invalid');

  // --- SIMULAÇÃO TEMPORÁRIA (para testar sem PHP) ---
  const emailValido = (email.value === "teste@exemplo.com");
  // ---------------------------------------------------

  // RESET de estilos do modal
  modalHeader.classList.remove("bg-danger", "bg-success");
  modalBtn.classList.remove("btn-danger", "btn-success");

  if (emailValido) {
    modalTitle.textContent = "✔ Link enviado!";
    modalMessage.innerHTML = "Enviamos um link de redefinição para o seu e-mail.";

    modalHeader.classList.add("bg-success");
    modalBtn.classList.add("btn-success");

    feedbackModal.show();

    // redirecionar após fechar
    document.getElementById('feedback_modal').addEventListener('hidden.bs.modal', () => {
      window.location.href = "login.html";
    });

  } else {
    modalTitle.textContent = "✖ E-mail não encontrado!";
    modalMessage.innerHTML = "Verifique o endereço digitado e tente novamente.";

    modalHeader.classList.add("bg-danger");
    modalBtn.classList.add("btn-danger");

    feedbackModal.show();
  }
});

email.addEventListener('input', () => {
  email.classList.remove('is-invalid');
});
