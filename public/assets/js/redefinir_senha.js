const form = document.getElementById('resetForm');
const senha = document.getElementById('senha');
const confirmar = document.getElementById('confirmar');

const feedback_modal = new bootstrap.Modal(document.getElementById('feedback_modal'));
const modal_title = document.getElementById('modal_title');
const modal_message = document.getElementById('modal_message');
const modal_header = document.querySelector('.modal-header');
const modal_btn = document.querySelector('#feedback_modal .modal-footer button');

form.addEventListener('submit', (e) => {
     e.preventDefault();

     senha.classList.remove("is-invalid");
     confirmar.classList.remove("is-invalid");

     modal_header.classList.remove("bg-success", "bg-danger");
     modal_btn.classList.remove("btn-success", "btn-danger");

     if (senha.value.trim() === "") {
          senha.classList.add("is-invalid");
          modal_title.textContent = "Campo obrigatório";
          modal_message.textContent = "Digite sua nova senha.";
          modal_header.classList.add("bg-danger");
          modal_btn.classList.add("btn-danger");
          feedback_modal.show();
          return;
     }

     if (confirmar.value.trim() === "") {
          confirmar.classList.add("is-invalid");
          modal_title.textContent = "Campo obrigatório";
          modal_message.textContent = "Confirme sua senha.";
          modal_header.classList.add("bg-danger");
          modal_btn.classList.add("btn-danger");
          feedback_modal.show();
          return;
     }

     if (senha.value.length < 6) {
          senha.classList.add("is-invalid");
          modal_title.textContent = "Senha muito curta";
          modal_message.textContent = "A senha deve ter pelo menos 6 caracteres.";
          modal_header.classList.add("bg-danger");
          modal_btn.classList.add("btn-danger");
          feedback_modal.show();
          return;
     }

     if (senha.value !== confirmar.value) {
          confirmar.classList.add("is-invalid");
          modal_title.textContent = "Senhas não coincidem";
          modal_message.textContent = "As senhas informadas devem ser iguais.";
          modal_header.classList.add("bg-danger");
          modal_btn.classList.add("btn-danger");
          feedback_modal.show();
          return;
     }

     modal_title.textContent = "✔ Senha redefinida!";
     modal_message.textContent = "Sua senha foi alterada com sucesso.";
     modal_header.classList.add("bg-success");
     modal_btn.classList.add("btn-success");

     feedback_modal.show();

     document.getElementById('feedback_modal').addEventListener('hidden.bs.modal', () => {
          window.location.href = "login.html";
     });
});

document.getElementById('feedback_modal').addEventListener('hidden.bs.modal', () => {
     senha.classList.remove('is-invalid');
     confirmar.classList.remove('is-invalid');
});

// Remove erro ao digitar
senha.addEventListener('input', () => senha.classList.remove('is-invalid'));
confirmar.addEventListener('input', () => confirmar.classList.remove('is-invalid'));
