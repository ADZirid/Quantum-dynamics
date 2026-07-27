/* Formulaire « Rejoindre » — compteur de caractères du champ motivation.
   JS vanilla, aucune animation de visibilité (contenu toujours visible). */
(function () {
  "use strict";

  var motivation = document.getElementById("motivation");
  var counter = document.getElementById("motivation-count");
  if (!motivation || !counter) return;

  var max = motivation.getAttribute("maxlength") || "1000";

  function update() {
    counter.textContent = motivation.value.length + "/" + max;
  }

  motivation.addEventListener("input", update);
  update();
})();
