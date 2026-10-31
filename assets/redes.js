/* Redes sociales de Isla Saboga. Un solo archivo para todas las páginas.
   Cuando existan las cuentas, escribir aquí la URL completa de cada una.
   Un valor vacío deja el enlace oculto. Nada más que editar. */
(function(){
  'use strict';
  var SOCIAL = {
    instagram: '',
    x: '',
    facebook: ''
  };
  var links = document.querySelectorAll('a[data-social]');
  for (var i = 0; i < links.length; i++) {
    var a = links[i], url = SOCIAL[a.getAttribute('data-social')];
    if (url) {
      a.href = url;
      var li = a.closest ? a.closest('li') : a.parentNode;
      if (li) { li.hidden = false; }
    }
  }
})();
