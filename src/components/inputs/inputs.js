// ===================== TOGGLE SENHA =====================
const toggleSenha = document.getElementById('toggle-senha');
const inputSenha = document.querySelector('.input_senha .input_padrao');

toggleSenha.addEventListener('click', () => {
    if (inputSenha.type === 'password') {
        inputSenha.type = 'text';
        toggleSenha.classList.replace('bi-eye-fill', 'bi-eye-slash-fill');
    } else {
        inputSenha.type = 'password';
        toggleSenha.classList.replace('bi-eye-slash-fill', 'bi-eye-fill');
    }
});

// ===================== Data nascimento =====================
document.getElementById("data_nascimento").addEventListener("input", function(e) {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 8) valor = valor.slice(0, 8);

    if (valor.length >= 5) {
        valor = valor.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
    } else if (valor.length >= 3) {
        valor = valor.replace(/(\d{2})(\d{0,2})/, "$1/$2");
    }

    e.target.value = valor;
});

// ===================== CPF =====================
const cpfInput = document.getElementById("cpf");

cpfInput.addEventListener("input", function(e) {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);

    if (valor.length > 9) {
        valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    } else if (valor.length > 6) {
        valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (valor.length > 3) {
        valor = valor.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }

    e.target.value = valor;
    cpfInput.classList.remove("erro");
});

cpfInput.addEventListener("blur", function(e) {
    const valor = e.target.value.replace(/\D/g, "");
    if (valor.length !== 11) {
        cpfInput.classList.add("erro");
        return;
    }
    if (!validarCPF(valor)) {
        cpfInput.classList.add("erro");
    } else {
        cpfInput.classList.remove("erro");
    }
});

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

// ===================== Celular =====================
const inputCelular = document.getElementById("celular");

inputCelular.addEventListener("focus", function(e) {
    if (!e.target.value.startsWith("+55")) {
        e.target.value = "+55 ";
    }
});

inputCelular.addEventListener("input", function(e) {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.startsWith("55")) valor = valor.slice(2);
    if (valor.length > 11) valor = valor.slice(0, 11);

    if (valor.length > 2) {
        if (valor.length > 7) {
            valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, "$1 $2-$3");
        } else {
            valor = valor.replace(/(\d{2})(\d{0,5})/, "$1 $2");
        }
    }

    e.target.value = "+55 " + valor;
});

// ===================== E-mail =====================
const emailInput = document.getElementById("email");

emailInput.addEventListener("blur", function() {
    const valor = emailInput.value.trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const dominiosValidos = [
        'gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com',
        'icloud.com', 'protonmail.com', 'aol.com', 'live.com',
        'bol.com.br', 'uol.com.br', 'ig.com.br', 'terra.com.br',
        'r7.com', 'folha.com.br', 'globo.com', 'empresas.com'
    ];

    if (valor !== "" && !regexEmail.test(valor)) {
        emailInput.classList.add("erro");
    } else if (valor !== "" && regexEmail.test(valor)) {
        const dominio = valor.split('@')[1].toLowerCase();
        if (!dominiosValidos.includes(dominio)) {
            emailInput.classList.add("erro");
        } else {
            emailInput.classList.remove("erro");
        }
    } else {
        emailInput.classList.remove("erro");
    }
});

emailInput.addEventListener("input", function() {
    emailInput.classList.remove("erro");
});

// ===================== CEP =====================
const cepInput = document.getElementById("cep");

cepInput.addEventListener("input", function(e) {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 8) valor = valor.slice(0, 8);

    if (valor.length > 5) {
        valor = valor.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    }

    e.target.value = valor;
    cepInput.classList.remove("erro");
});

cepInput.addEventListener("blur", function(e) {
    const cep = e.target.value.replace(/\D/g, "");

    if (cep.length !== 8) {
        cepInput.classList.add("erro");
        limparCampos();
        return;
    }

    cepInput.classList.remove("erro");

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                cepInput.classList.add("erro");
                limparCampos();
                return;
            }

            document.getElementById("rua").value = data.logradouro || "";
            document.getElementById("bairro").value = data.bairro || "";
            document.getElementById("cidade").value = data.localidade || "";
            document.getElementById("uf").value = data.uf || "";
            document.getElementById("complemento").value = data.complemento || "";

            cepInput.classList.remove("erro");
        })
        .catch(error => {
            console.error("Erro ao consultar CEP:", error);
            cepInput.classList.add("erro");
            limparCampos();
        });
});

function limparCampos() {
    document.getElementById("rua").value = "";
    document.getElementById("bairro").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("uf").value = "";
    document.getElementById("complemento").value = "";
}