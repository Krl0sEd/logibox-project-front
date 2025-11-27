document.addEventListener("DOMContentLoaded", () => {

     /* ========================================
                Carregar dados do usuário
     ======================================== */

     const userData = localStorage.getItem("user");

     if (!userData) {
          window.location.href = "../pages/login.html";
          return;
     }

     const usuario = JSON.parse(userData);

     // Preenche "Bem vindo(a)" — span com id="userName"
     const nameField = document.getElementById("userName");
     if (nameField) {
          nameField.innerText = usuario.nome || "Usuário";
     }

     // Preenche o nome no topo — span id="nomeCompleto"
     const nomeTop = document.getElementById("nomeCompleto");
     if (nomeTop) {
          nomeTop.innerText = usuario.nome || "";
     }

     // Preenche o cargo — small id="cargoUser"
     const cargo = document.getElementById("cargoUser");
     if (cargo) {
          cargo.innerText = usuario.tipo || "Usuário";
     }

     // Apagar a primeira linha do gráfico E remover "usuário" e "histórico" do sidebar
     const navUsuario = document.getElementById('menu-usuarios');
     const navLog = document.getElementById('menu-log');
     const linha_dados = document.getElementById('linha_dados');

     isAdmin = usuario.tipo === 'Administrador';

     if (isAdmin) {
          navUsuario.style.display = "none";
          navLog.style.display = "none";
          linha_dados.style.display = "none";
     };


     // =============================================
     // BUSCAR TOTAL DE PRODUTOS USANDO estoque.php
     // =============================================

     fetch("http://163.176.193.115/estoque.php")
          .then(response => response.json())
          .then(data => {
               console.log("Dados recebidos do estoque:", data);

               const totalProdutosEl = document.getElementById("quant_produto");

               // Se veio array, contamos os produtos
               if (Array.isArray(data)) {
                    totalProdutosEl.innerText = data.length;
               } else {
                    totalProdutosEl.innerText = "0";
               }
          })
          .catch(error => {
               console.error("Erro ao buscar produtos:", error);
          });

     // =============================================
     // BUSCAR TOTAL DE USUÁRIO USANDO contador_usuarios.php (com animação)
     // =============================================

     function animarNumero(element, target) {
          let current = 0;
          const speed = 200;

          const intervalo = setInterval(() => {
               current++;
               element.textContent = current;

               if (current >= target) {
                    clearInterval(intervalo);
               }
          }, speed);
     }

     fetch("http://163.176.193.115/contador_usuario.php")
          .then(r => r.json())
          .then(data => {
               const span = document.getElementById("quant_user");
               animarNumero(span, Number(data.total_usuarios));
          });

     // =============================================
     // BUSCAR TOTAL DE AÇÕES DO LOG
     // =============================================

     function carregarTotalAcoes() {
          fetch("http://163.176.193.115/contador_log.php")
               .then(r => r.json())
               .then(data => {
                    document.getElementById("quant_açoes").textContent = data.total_acoes;
               })
               .catch(err => console.error("Erro ao buscar ações:", err));
     }

     carregarTotalAcoes();


     /* ========================================
                         Gráficos
        ======================================== */

     const gCategoria = document.getElementById('grafico_categoria');
     const gValor = document.getElementById('grafico_valor');

     // Gráfico de quantidade de Categorias
     new Chart(gCategoria, {
          type: 'pie',
          data: {
               labels: ['Alimentícios', 'Higiene', 'Eletrônicos', 'Bebidas', 'Papelaria'],
               datasets: [{
                    data: [12, 15, 2, 3, 5],
                    backgroundColor: [
                         '#FF6384',       // Rosa - Alimenticios
                         '#36A2EB',       // Azul - Higiene
                         '#4BC0C0',    // Verde-água - Eletrônico
                         '#FFCE56',       // Amarelo - bebidas
                         '#824bc0ff'        // Roxo - Papelaria
                    ],
                    borderColor: '#fff',
                    borderWidth: 1
               }]
          },
          options: {
               responsive: true,
               maintainAspectRatio: false,
               plugins: {
                    legend: {
                         position: 'top',
                         labels: {
                              color: '#5f5a5aff',
                              font: {
                                   size: 12
                              }
                         }

                    },
               }
          }
     });


     // Gráfico de produtos com maior preço unitário


     new Chart(gValor, {
          type: 'bar',
          data: {
               labels: ['Produto 1', 'Produto 2', 'Produto 3', 'Produto 4', 'Produto 5'],
               datasets: [{
                    data: [20, 10, 30, 17, 50],
                    backgroundColor: [
                         '#FF6384',
                         '#36A2EB',
                         '#FFCE56',
                         '#4BC0C0',
                         '#824bc0ff'
                    ]
               }]
          },
          options: {
               responsive: true,
               plugins: {
                    legend: {
                         display: false,
                         position: 'top',
                         labels: {
                              color: '#5f5a5aff',
                              font: {
                                   size: 12
                              }
                         }
                    }
               }
          }
     });


});
