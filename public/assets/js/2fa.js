document.addEventListener("DOMContentLoaded", function () {
     const questionLabel = document.getElementById("question_label");
     const answerInput = document.getElementById("answer");
     const form = document.getElementById("twofa_form");

     const modal = new bootstrap.Modal(document.getElementById("feedback_modal"));
     const modalTitle = document.getElementById("modal_title");
     const modalMessage = document.getElementById("modal_message");

     // 🔹 Carrega dados do usuário salvos no login
     const user = JSON.parse(localStorage.getItem("user"));

     if (!user) {
          modalTitle.textContent = "Erro";
          modalMessage.textContent = "Nenhum usuário encontrado. Faça login novamente.";
          modal.show();
          return;
     }

     // 🔹 Lista de perguntas do seu sistema
     const perguntas = [
          { texto: "Qual o nome da sua mãe?", campo: "nome_materno" },
          { texto: "Qual o seu CEP?", campo: "cep" },
          { texto: "Qual sua data de nascimento? (AAAA-MM-DD)", campo: "data_nascimento" }
     ];

     // 🔹 Escolhe pergunta aleatória
     const perguntaSorteada = perguntas[Math.floor(Math.random() * perguntas.length)];

     // Exibe pergunta no HTML
     questionLabel.textContent = perguntaSorteada.texto;

     // ===========================================================
     // 🔹 SUBMIT DO FORMULÁRIO
     // ===========================================================
     form.addEventListener("submit", function (e) {
          e.preventDefault();

          const resposta = answerInput.value.trim();

          if (!resposta) {
               modalTitle.textContent = "Erro";
               modalMessage.textContent = "Digite sua resposta.";
               modal.show();
               return;
          }

          // Enviar para o backend validar
          fetch("http://163.176.193.115/2fa.php", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                    login: user.login,
                    campo: perguntaSorteada.campo,
                    resposta: resposta
               })
          })
               .then(res => res.json())
               .then(data => {
                    console.log("RETORNO DO 2FA:", data);

                    if (data.status === "aprovado") {
                         modalTitle.textContent = "Verificação concluída!";
                         modalMessage.textContent = "Identidade confirmada com sucesso.";
                         modal.show();

                         setTimeout(() => {
                              window.location.href = "../pages/dashboard.html";
                         }, 900);

                    } else {
                         modalTitle.textContent = "Resposta incorreta!";
                         modalMessage.textContent = data.error || "Tente novamente.";
                         modal.show();
                    }
               })
               .catch(err => {
                    console.error(err);
                    modalTitle.textContent = "Erro";
                    modalMessage.textContent = "Falha ao conectar com o servidor.";
                    modal.show();
               });
     });
});
