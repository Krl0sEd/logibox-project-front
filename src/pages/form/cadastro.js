const steps = document.querySelectorAll('.step');
  const form_steps = document.querySelectorAll('.form_step');
  let current_step = parseInt(localStorage.getItem('current_step')) || 0;

  // Modal
  const feedback_modal = new bootstrap.Modal(document.getElementById('feedback_modal'));
  function show_modal(title, message, success=false){
    document.getElementById('modal_title').textContent = title;
    document.getElementById('modal_message').textContent = message;
    document.querySelector('.modal-header').classList.toggle('bg-success', success);
    document.querySelector('.modal-header').classList.toggle('bg-danger', !success);
    feedback_modal.show();
  }

  // Máscaras
  document.addEventListener('input', e=>{
    const el = e.target;
    if(el.dataset.key==='cpf') el.value = el.value.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
    if(el.dataset.key==='cep') el.value = el.value.replace(/\D/g,'').replace(/(\d{5})(\d)/,'$1-$2');
    if(el.dataset.key === 'telefone') {
      let val = el.value.replace(/\D/g,'');
      if(val.startsWith("55")) val = val.slice(2);
      if(val.length > 11) val = val.slice(0,11);
      if(val.length <= 2) {
        el.value = "(+55)" + val;
      } else if(val.length <= 7) {
        el.value = "(+55)" + val.slice(0,2) + "-" + val.slice(2);
      } else {
        el.value = "(+55)" + val.slice(0,2) + "-" + val.slice(2,7) + "-" + val.slice(7);
      }
    }
    if(el.dataset.key==='data_nasc') el.value = el.value.replace(/\D/g,'').replace(/(\d{2})(\d)/,'$1/$2').replace(/(\d{2})(\d)/,'$1/$2');
    save_form_data();
  });

  // CEP automático
  document.querySelector('[data-key="cep"]').addEventListener('blur', async e=>{
    const cep = e.target.value.replace(/\D/g,'');
    if(cep.length===8){
      try{
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if(!data.erro){
          document.querySelector('[data-key="rua"]').value = data.logradouro || '';
          document.querySelector('[data-key="bairro"]').value = data.bairro || '';
          document.querySelector('[data-key="cidade"]').value = data.localidade || '';
          document.querySelector('[data-key="estado"]').value = data.uf || '';
          save_form_data();
        }else{
          show_modal('Erro', 'CEP não encontrado.');
        }
      }catch{
        show_modal('Erro', 'Não foi possível buscar o CEP.');
      }
    }
  });

  // Salvar automaticamente
  function save_form_data(){
    const inputs = document.querySelectorAll('[data-key]');
    const form_data = {};
    inputs.forEach(i=>form_data[i.dataset.key]=i.value);
    localStorage.setItem('form_data', JSON.stringify(form_data));
    localStorage.setItem('current_step', current_step);
  }

  // Restaurar dados
  function restore_form_data(){
    const saved = JSON.parse(localStorage.getItem('form_data')||'{}');
    for(const key in saved){
      const input = document.querySelector(`[data-key="${key}"]`);
      if(input) input.value = saved[key];
    }
  }
  restore_form_data();

  // Limpar localStorage
  document.querySelectorAll('.limpar').forEach(btn=>{
    btn.addEventListener('click',()=>{
      localStorage.removeItem('form_data');
      localStorage.removeItem('current_step');
      show_modal('Limpado', 'Os dados foram apagados com sucesso!', true);
    });
  });

  // Validação passo
  function validate_step(step){
    const fields = form_steps[step].querySelectorAll('[data-key]');
    for(const field of fields){
      const value = field.value.trim();
      const key = field.dataset.key;

      if(key==='nome' && value.length<3) { show_modal('Erro', 'Preencha o nome completo corretamente.'); return false; }
      if(key==='nome_materno' && value.length<3) { show_modal('Erro', 'Preencha o nome materno corretamente.'); return false; }
      if(key==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { show_modal('Erro', 'E-mail inválido.'); return false; }
      if(key==='telefone' && value.replace(/\D/g,'').length<10) { show_modal('Erro', 'Telefone inválido.'); return false; }
      if(key==='data_nasc' && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) { show_modal('Erro', 'Data de nascimento inválida.'); return false; }
      if(key==='sexo' && value==='') { show_modal('Erro', 'Selecione o sexo.'); return false; }
      if(key==='cpf' && !validate_cpf(value)) { show_modal('Erro', 'CPF inválido.'); return false; }
      if(key==='cep' && value.replace(/\D/g,'').length!==8) { show_modal('Erro', 'CEP inválido.'); return false; }
      if(['estado','cidade','bairro','rua','numero'].includes(key) && value==='') { show_modal('Erro', `Preencha o campo ${key}.`); return false; }
      if(key==='login' && value.length<6) { show_modal('Erro', 'Login deve ter no mínimo 6 caracteres.'); return false; }
      if(key==='senha' && value.length<8) { show_modal('Erro', 'Senha deve ter no mínimo 8 caracteres.'); return false; }
      if(key==='repetir_senha' && value!==document.querySelector('[data-key="senha"]').value) { show_modal('Erro', 'As senhas não conferem.'); return false; }
    }
    return true;
  }

  // CPF válido
  function validate_cpf(cpf){
    cpf = cpf.replace(/\D/g,'');
    if(cpf.length!==11 || /^(\d)\1+$/.test(cpf)) return false;
    let sum = 0, rest;
    for(let i=1;i<=9;i++) sum += parseInt(cpf.substring(i-1,i))* (11-i);
    rest = (sum*10)%11; if(rest===10||rest===11) rest=0; if(rest!==parseInt(cpf[9])) return false;
    sum=0; for(let i=1;i<=10;i++) sum += parseInt(cpf.substring(i-1,i))*(12-i);
    rest=(sum*10)%11; if(rest===10||rest===11) rest=0; if(rest!==parseInt(cpf[10])) return false;
    return true;
  }

  // Troca de passo com validação
  document.querySelectorAll('.next_step').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(validate_step(current_step)){
        if(current_step<form_steps.length-1){
          current_step++;
          show_step();
          save_form_data();
        }
      }
    });
  });
  document.querySelectorAll('.prev_step').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(current_step>0){
        current_step--;
        show_step();
        save_form_data();
      }
    });
  });

  // Exibir passo atual
  function show_step(){
    form_steps.forEach(f=>f.classList.remove('active'));
    steps.forEach(s=>s.classList.remove('active'));
    form_steps[current_step].classList.add('active');
    steps[current_step].classList.add('active');
  }
  show_step();

  // Submit final
  document.getElementById('multi_step_form').addEventListener('submit', e=>{
    e.preventDefault();
    if(validate_step(current_step)){
      localStorage.clear();
      show_modal('Sucesso!', 'Cadastro concluído com sucesso!', true);
    }
  });