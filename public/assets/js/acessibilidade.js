/* ========================================
                    Dark Mode
   ======================================== */

   let darkmode = localStorage.getItem('darkmode');
   const btn_darkmode = document.querySelector('.btn_darkmode');
   const darkmode_icon = btn_darkmode.querySelector('i');

   const ligarDarkMode = () => {
     document.documentElement.classList.add('darkmode');
     darkmode_icon.classList.replace('bi-moon', 'bi-sun');
     localStorage.setItem('darkmode', 'ligado');
   };

   const desligarDarkMode = () => {
     document.documentElement.classList.remove('darkmode');
     darkmode_icon.classList.replace('bi-sun', 'bi-moon');
     localStorage.setItem('darkmode', 'desligado');
   }

   if (darkmode === 'ligado') { //ao abrir página, confirmar o estado no localStorage
     ligarDarkMode();
   } else {
     desligarDarkMode();
   }

   btn_darkmode.addEventListener('click', () => {
     darkmode = localStorage.getItem('darkmode');
     if (darkmode === 'ligado') {
           desligarDarkMode();
     } else {
          ligarDarkMode();
     }
   })
