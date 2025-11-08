/* ========================================
                    Dark Mode
   ======================================== */

   let darkmode = localStorage.getItem('darkmode');
   const darkmode_btn = document.querySelector('.btn_darkmode');
   const darkmode_icon = btn_darkmode.querySelector('i');

   const ligarDarkMode = () => {
     document.body.classList.add('darkmode');
     darkmode_icon.classList.replace('bi-moon', 'bi_sun');
     localStorage.setItem('darkmode', 'ligado');
   };

   const desligarDarkMode = () => {
     document.body.classList.remove('darkmode');
     darkmode_icon.classList.replace('bi-moon', 'bi_sun');
     localStorage.setItem('darkmode', 'desligado');
   }

   if (darkmode === 'ligado') {
     ligarDarkMode();
   } else {
     desligarDarkMode();
   }
