const form = document.getElementById('resetForm');
const senha = document.getElementById('senha');
const confirmar = document.getElementById('confirmar');

const feedbackModal = new bootstrap.Modal(document.getElementById('feedback_modal'));
const modalTitle = document.getElementById('modal_title');
const modalMessage = document.getElementById('modal_message');

const modalHeader = document.querySelector('.modal-header');
const modalBtn = document.querySelector('#feedback_modal .modal-footer button');

form.addEventListener('submit', (e) => {
  e.preventDefault(); // remover quando o PHP estiver pronto

  let valido = true;

  if (senha.value.trim().length < 6) {
    senha.classList.add('is-invalid');
    valido = false;
  } else {
    senha.classList.remove('is-invalid');
  }

  if (confirmar.value !== senha.value || confirmar.value.trim() === "") {
    confirmar.classList.add('is-invalid');
    valido = false;
  } else {
    confirmar.classList.remove('is-invalid');
  }

  if (!valido) return;

  // Reset visual do modal
  modalHeader.classList.remove("bg-success", "bg-danger");
  modalBtn.classList.remove("btn-success", "btn-danger");

  // --- SIMULAÇÃO TEMPORÁRIA (alterar quando houver PHP) ---
  const simulacaoOk = true;
  // ---------------------------------------------------------

  if (simulacaoOk) {
    modalTitle.textContent = "✔ Senha redefinida!";
    modalMessage.innerHTML = "Sua senha foi alterada com sucesso.";

    modalHeader.classList.add("bg-success");
    modalBtn.classList.add("btn-success");

    feedbackModal.show();

    // redirecionar após fechar
    document.getElementById('feedback_modal').addEventListener('hidden.bs.modal', () => {
      window.location.href = "login.html";
    });

  } else {
    modalTitle.textContent = "Erro ao alterar!";
    modalMessage.innerHTML = "Tente novamente mais tarde.";

    modalHeader.classList.add("bg-danger");
    modalBtn.classList.add("btn-danger");

    feedbackModal.show();
  }
});

// Remove erro ao digitar
senha.addEventListener('input', () => senha.classList.remove('is-invalid'));
confirmar.addEventListener('input', () => confirmar.classList.remove('is-invalid'));
