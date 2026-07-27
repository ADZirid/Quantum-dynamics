/* Menu mobile — overlay plein écran opaque (élément direct de <body>).
   Pas d'animations de visibilité : simple bascule hidden/flex, Échap pour
   fermer, scroll bloqué pendant l'ouverture. */
(function () {
  "use strict";

  var overlay = document.getElementById("mobile-menu");
  var openBtn = document.querySelector("[data-menu-open]");
  var closeBtn = document.querySelector("[data-menu-close]");
  if (!overlay || !openBtn || !closeBtn) return;

  function open() {
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") close();
  });
  overlay.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", close);
  });
})();
