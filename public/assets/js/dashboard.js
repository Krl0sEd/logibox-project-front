document.addEventListener("DOMContentLoaded", () => {

     /* ========================================
                         Gráficos
        ======================================== */

     const gCategoria = document.getElementById('grafico_categoria');
     const gValor = document.getElementById('grafico_valor');

     // Gráfico de quantidade de Categorias
     new Chart (gCategoria, {
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


     new Chart (gValor, {
          type:'bar',
          data: {
               labels: ['Produto 1', 'Produto 2','Produto 3','Produto 4','Produto 5'],
               datasets: [{ 
                    data: [20, 10, 30, 17, 50],
                     backgroundColor: [
                         '#FF6384',       // Rosa - Cosméticos
                         '#36A2EB',       // Azul - Limpeza
                         '#FFCE56',       // Amarelo - Alimentação
                         '#4BC0C0',      // Verde-água - Eletrônico
                          '#FF6384'   // Rosa - Cosméticos
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
