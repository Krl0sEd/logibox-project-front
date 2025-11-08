document.addEventListener("DOMContentLoaded", () => {

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

/* ========================================
          Aumentar/diminuir fonte
   ======================================== */
  
let fontSizeLevel = parseInt(localStorage.getItem('fontSizeLevel')) || 0;
  const body = document.body;
  const increaseBtn = document.querySelector(".btn_font_plus");
  const decreaseBtn = document.querySelector(".btn_font_menos");

function applyFontSize() {
  body.classList.remove("font-small", "font-normal", "font-large");
  if (fontSizeLevel < 0) body.classList.add("font-small");
  else if (fontSizeLevel === 0) body.classList.add("font-normal");
  else body.classList.add("font-large");
  localStorage.setItem('fontSizeLevel', fontSizeLevel);
}

  increaseBtn.addEventListener("click", () => {
    if (fontSizeLevel < 1) {
      fontSizeLevel++;
      applyFontSize();
    }
  });

  decreaseBtn.addEventListener("click", () => {
    if (fontSizeLevel > -1) {
      fontSizeLevel--;
      applyFontSize();
    }
  });

  applyFontSize();

});
