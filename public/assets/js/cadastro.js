/* ============================================================
                    CONFIGURAÇÃO INICIAL
============================================================ */
const steps = document.querySelectorAll('.step');
const form_steps = document.querySelectorAll('.form_step');
let current_step = parseInt(localStorage.getItem('current_step')) || 0;

/* ============================================================
                    ESTILOS DE ERRO
============================================================ */
function markError(field){
    field.classList.add("input-error");
}
function clearError(field){
    field.classList.remove("input-error");
}

/* ============================================================
                            MODAL
============================================================ */
const feedback_modal = new bootstrap.Modal(document.getElementById('feedback_modal'));
function show_modal(title, message, success=false){
    document.getElementById('modal_title').textContent = title;
    document.getElementById('modal_message').textContent = message;

    const header = document.querySelector('.modal-header');
    header.classList.toggle('bg-success', success);
    header.classList.toggle('bg-danger', !success);

    feedback_modal.show();
}

/* ============================================================
                    VALIDAÇÃO DE CPF
============================================================ */
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Valida 1º dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    // Valida 2º dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;
    
    return digito2 === parseInt(cpf.charAt(10));
}

/* ============================================================
                    VALIDAÇÃO DE EMAIL
============================================================ */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/* ============================================================
                    RESTRIÇÃO DE CARACTERES
============================================================ */

// Apenas letras (incluindo acentos e espaços)
function onlyLetters(input) {
    input.value = input.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
}

// Apenas números
function onlyNumbers(input) {
    input.value = input.value.replace(/\D/g, "");
}

/* Aplica restrições */
document.addEventListener("input", (e) => {
    const el = e.target;

    if(!el || !el.dataset.key) return;

    const key = el.dataset.key;

    /* ---------- CAMPOS DE TEXTO QUE DEVEM ACEITAR SÓ LETRAS ---------- */
    if(["nome","nome_materno","cidade","bairro","rua","login"].includes(key)){
        onlyLetters(el);
    }

    /* ---------- CAMPOS DE SENHA (APENAS LETRAS) ---------- */
    if(["senha","repetir_senha"].includes(key)){
        // Remove números e caracteres especiais, mantém apenas letras
        el.value = el.value.replace(/[^A-Za-zÀ-ÿ]/g, "");
    }

    /* ---------- CAMPOS DE NÚMEROS ---------- */
    if(["cpf","cep","numero_rua"].includes(key)){
        onlyNumbers(el);
    }

    /* ---------- MÁSCARA CPF ---------- */
    if(key === "cpf"){
        el.value = el.value
            .replace(/\D/g, '')
            .slice(0, 11)
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    /* ---------- MÁSCARA CEP ---------- */
    if(key === "cep"){
        el.value = el.value
            .replace(/\D/g, '')
            .slice(0, 8)
            .replace(/(\d{5})(\d)/, "$1-$2");
    }

    /* ---------- MÁSCARA TELEFONE ---------- */
    if(key === "telefone_celular"){
        let num = el.value.replace(/\D/g, '').slice(0, 13);

        if(num.startsWith("55")) num = num.slice(2);

        if(num.length <= 2) {
            el.value = "(+55) " + num;
        } else if(num.length <= 7) {
            el.value = `(+55) ${num.slice(0,2)} ${num.slice(2)}`;
        } else {
            el.value = `(+55) ${num.slice(0,2)} ${num.slice(2,7)}-${num.slice(7)}`;
        }
    }

    save_form_data();
});

/* ============================================================
                        BUSCA AUTOMÁTICA CEP
============================================================ */
document.getElementById("cep").addEventListener("blur", async (e) => {
    const cep = e.target.value.replace(/\D/g, "");

    if(cep.length === 8){
        try{
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();

            if(!data.erro){
                document.getElementById("rua").value = data.logradouro || "";
                document.getElementById("bairro").value = data.bairro || "";
                document.getElementById("cidade").value = data.localidade || "";
                document.getElementById("estado").value = data.uf || "";
                save_form_data();
            } else {
                show_modal("Erro", "CEP não encontrado.");
            }
        } catch {
            show_modal("Erro", "Não foi possível buscar o CEP.");
        }
    }
});

/* ============================================================
                SALVAR / RESTAURAR LOCALSTORAGE
============================================================ */
function save_form_data(){
    const inputs = document.querySelectorAll("[data-key]");
    const form_data = {};

    inputs.forEach(i => {
        if(i.dataset.key !== "senha" && i.dataset.key !== "repetir_senha"){
            form_data[i.dataset.key] = i.value;
        }
    });

    localStorage.setItem("form_data", JSON.stringify(form_data));
    localStorage.setItem("current_step", current_step);
}

function restore_form_data(){
    const saved = JSON.parse(localStorage.getItem("form_data") || "{}");

    for(const key in saved){
        const field = document.querySelector(`[data-key="${key}"]`);
        if(field) field.value = saved[key];
    }
}
restore_form_data();

/* LIMPAR FORMULÁRIO */
document.querySelectorAll(".limpar").forEach(btn => {
    btn.addEventListener("click", () => {
        localStorage.removeItem("form_data");
        localStorage.removeItem("current_step");
        show_modal("Limpado", "Os dados foram apagados com sucesso!", true);
        setTimeout(() => location.reload(), 700);
    });
});

/* ============================================================
                        VALIDAÇÃO DOS PASSOS
============================================================ */
function showError(field, message){
    markError(field);
    show_modal("Erro", message);
}

async function validate_step(step) {
    const fields = document.querySelectorAll(`.form_step[data-step="${step}"] [data-key]`);

    for (const field of fields) {

        const key = field.dataset.key;
        const value = field.value.trim();

        clearError(field);

        /* Campos opcionais */
        if(key === "complemento") continue;

        /* Campo vazio */
        if (!value || (field.tagName === "SELECT" && !value)){
            return showError(field, "Preencha todos os campos obrigatórios."), false;
        }

        /* ----------- VALIDAÇÕES ESPECÍFICAS ----------- */

        if(key === "nome" || key === "nome_materno"){
            if(value.length < 10) return showError(field, "Nome muito curto."), false;
        }

        if(key === "cpf"){
            if(value.length !== 14){
                return showError(field, "CPF inválido."), false;
            }
            if(!validarCPF(value)){
                return showError(field, "CPF inválido."), false;
            }
        }

        if(key === "email"){
            if(!validarEmail(value)){
                return showError(field, "Email inválido."), false;
            }
        }

        if(key === "telefone_celular" && value.length < 19){
            return showError(field, "Telefone inválido."), false;
        }

        if(key === "cep" && value.length !== 9){
            return showError(field, "CEP inválido."), false;
        }

        if(key === "numero_rua" && value.length === 0){
            return showError(field, "Digite o número da casa."), false;
        }

        if(key === "login"){
            if(!/^[A-Za-zÀ-ÿ]{6}$/.test(value.trim())){
                return showError(field, "O login deve conter exatamente 6 letras."), false;
            }
        }

        if(key === "senha"){
            if(value.length !== 8){
                return showError(field, "A senha deve ter exatamente 8 caracteres."), false;
            }
            if(!/^[A-Za-zÀ-ÿ]+$/.test(value)){
                return showError(field, "A senha deve conter apenas letras."), false;
            }
        }

        if(key === "repetir_senha"){
            const senha = document.querySelector('[data-key="senha"]').value.trim();

            if(value !== senha){
                return showError(field, "As senhas não conferem."), false;
            }
            if(!/^[A-Za-zÀ-ÿ]+$/.test(value)){
                return showError(field, "A senha deve conter apenas letras."), false;
            }
        }
    }

    return true;
}

/* ============================================================
                        NAVEGAÇÃO ENTRE PASSOS
============================================================ */
document.querySelectorAll(".next_step").forEach(btn => {
    btn.addEventListener("click", async () => {

        const ok = await validate_step(current_step);

        if(!ok) return; // NÃO AVANÇA JAMAIS COM ERRO

        current_step++;

        if(current_step >= form_steps.length)
            current_step = form_steps.length - 1;

        show_step();
        save_form_data();
    });
});

document.querySelectorAll(".prev_step").forEach(btn => {
    btn.addEventListener("click", () => {
        if(current_step > 0){
            current_step--;
            show_step();
            save_form_data();
        }
    });
});

function show_step(){
    form_steps.forEach(f => f.classList.remove("active"));
    steps.forEach(s => s.classList.remove("active"));
    form_steps[current_step].classList.add("active");
    steps[current_step].classList.add("active");
}
show_step();

/* ============================================================
                            SUBMIT
============================================================ */
document.getElementById("multi_step_form").addEventListener("submit", async (e) => {
    e.preventDefault();

    if(!await validate_step(current_step)) return;

    const inputs = document.querySelectorAll("[data-key]");
    const payload = {};

    inputs.forEach(i => {
        if(i.dataset.key !== "repetir_senha"){
            payload[i.dataset.key] = i.value;
        }
    });

    try{
      const response = await fetch("http://163.176.193.115/cadastro.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

        if(data.sucesso){
            show_modal("Sucesso!", data.sucesso, true);
            setTimeout(() => window.location.href = "login.html", 2000);
        } else {
            show_modal("Erro", data.error || "Erro ao enviar dados.");
        }

    } catch {
        show_modal("Erro", "Não foi possível conectar ao servidor.");
    }
});

/* ============================================================
                    TOGGLE VISIBILIDADE SENHA
============================================================ */
document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", function(){
        const input = document.getElementById(this.dataset.target);
        const icon = this.querySelector("i");

        if(input.type === "password"){
            input.type = "text";
            icon.classList.replace("bi-eye", "bi-eye-slash");
        } else {
            input.type = "password";
            icon.classList.replace("bi-eye-slash", "bi-eye");
        }
    });
});