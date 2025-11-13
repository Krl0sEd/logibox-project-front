 const backBtn = document.getElementById('backBtn');
      const questionLabel = document.getElementById('questionLabel');
      const form = document.getElementById('twofaForm');
      const answerInput = document.getElementById('answer');
      const confirmBtn = document.getElementById('confirmBtn');

      const questions = [
        "Qual o nome da sua mãe?",
        "Qual a data do seu nascimento?",
        "Qual o CEP do seu endereço?"
      ];

      let currentQuestion = questions[Math.floor(Math.random() * questions.length)];
      questionLabel.textContent = currentQuestion;

      const correctAnswers = {
        "Qual o nome da sua mãe?": "Ana Souza Ferreira",
        "Qual a data do seu nascimento?": "01/03/2005",
        "Qual o CEP do seu endereço?": "21040120"
      };

      let attempts = 0;

      backBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        window.history.back();
      });

      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const answer = answerInput.value.trim().toLowerCase();
        if(answer === ""){
          answerInput.classList.add('is-invalid');
          answerInput.focus();
          return;
        }

        answerInput.classList.remove('is-invalid');
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Verificando...';

        setTimeout(()=>{
          const correct = correctAnswers[currentQuestion].toLowerCase();
          if(answer === correct){
            showPopup("✅ Resposta correta!", "Identidade confirmada com sucesso.", "success");
            setTimeout(()=> window.location.href = "../login/login.html", 2000);
          } else {
            attempts++;
            if (attempts >= 3) {
            showPopup("3 tentativas sem sucesso!", "Favor realizar Login novamente.", "error");
  
            // Aguarda o usuário ler a mensagem e redireciona
            setTimeout(() => {
            window.location.href = "../login/login.html";
            }, 3000);
            } else {
              showPopup("⚠️ Resposta incorreta!", `Você ainda tem ${3 - attempts} tentativa(s).`, "warning");
              confirmBtn.disabled = false;
              confirmBtn.textContent = 'Confirmar';
              answerInput.value = "";
              answerInput.focus();
            }
          }
        }, 800);
      });

      function showPopup(title, message, type="error") {
        const modalTitle = document.getElementById("modal_title");
        const modalMessage = document.getElementById("modal_message");
        const modalHeader = document.querySelector("#feedback_modal .modal-header");
        const modalFooterButton = document.querySelector("#feedback_modal .modal-footer button");

        modalTitle.textContent = title;
        modalMessage.textContent = message;

        // Ajusta cor conforme tipo
        modalHeader.classList.remove("bg-danger", "bg-success", "bg-warning", "text-dark", "text-white");
        modalFooterButton.classList.remove("btn-danger", "btn-success", "btn-warning", "text-dark", "text-white");

        if (type === "success") {
          modalHeader.classList.add("bg-success", "text-white");
          modalFooterButton.classList.add("btn-success");
        } else if (type === "warning") {
          modalHeader.classList.add("bg-warning", "text-dark");
          modalFooterButton.classList.add("btn-warning", "text-dark");
        } else {
          modalHeader.classList.add("bg-danger", "text-white");
          modalFooterButton.classList.add("btn-danger");
        }

        const feedbackModal = new bootstrap.Modal(document.getElementById("feedback_modal"));
        feedbackModal.show();
      }

      answerInput.addEventListener('input', ()=>{
        answerInput.classList.remove('is-invalid');
      });