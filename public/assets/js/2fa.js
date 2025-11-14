      const question_label = document.getElementById('question_label');
      const form = document.getElementById('twofa_form');
      const answer_input = document.getElementById('answer');
      const confirm_btn = document.getElementById('confirm_btn');

      const questions = [
        "Qual o nome da sua mãe?",
        "Qual a data do seu nascimento?",
        "Qual o CEP do seu endereço?"
      ];

      let current_question = questions[Math.floor(Math.random() * questions.length)];
      question_label.textContent = current_question;

      const correct_answers = {
        "Qual o nome da sua mãe?": "Ana Souza Ferreira",
        "Qual a data do seu nascimento?": "01/03/2005",
        "Qual o CEP do seu endereço?": "21040120"
      };

      let attempts = 0;

      form.addEventListener('submit', (e)=>{
        e.preventDefault();

        const answer = answer_input.value.trim().toLowerCase();

       
        if(answer === ""){
          show_popup("❗ Campo obrigatório", "Por favor, responda à pergunta.", "error");

          confirm_btn.disabled = false;
          confirm_btn.textContent = "Confirmar";
          answer_input.focus();

          return;
        }

        confirm_btn.disabled = true;
        confirm_btn.textContent = 'Verificando...';

        setTimeout(()=>{
          const correct = correct_answers[current_question].toLowerCase();

          if(answer === correct){
            show_popup("✅ Resposta correta!", "Identidade confirmada com sucesso.", "success");
            setTimeout(()=> window.location.href = "../login/login.html", 2000);
          }

          else {
            attempts++;

            if (attempts >= 3) {
              show_popup("3 tentativas sem sucesso!", "Favor realizar Login novamente.", "error");
              setTimeout(()=> window.location.href = "../login/login.html", 3000);
            }

            else {
              show_popup("⚠️ Resposta incorreta!", `Você ainda tem ${3 - attempts} tentativa(s).`, "warning");
              confirm_btn.disabled = false;
              confirm_btn.textContent = 'Confirmar';
              answer_input.value = "";
              answer_input.focus();
            }
          }
        }, 800);
      });

      function show_popup(title, message, type="error") {
        const modal_title = document.getElementById("modal_title");
        const modal_message = document.getElementById("modal_message");
        const modal_header = document.getElementById("modal_header");
        const modal_button = document.getElementById("modal_footer_btn");

        modal_title.textContent = title;
        modal_message.textContent = message;

        modal_header.className = "modal-header";
        modal_button.className = "btn";

        if (type === "success") {
          modal_header.classList.add("bg-success","text-white");
          modal_button.classList.add("btn-success","text-white");
        } 
        else if (type === "warning") {
          modal_header.classList.add("bg-warning","text-dark");
          modal_button.classList.add("btn-warning","text-dark");
        } 
        else {
          modal_header.classList.add("bg-danger","text-white");
          modal_button.classList.add("btn-danger","text-white");
        }

        const feedback_modal = new bootstrap.Modal(document.getElementById("feedback_modal"));
        feedback_modal.show();
      }