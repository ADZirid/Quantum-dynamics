/* Tableau de bord + espace membres — Quantum Dynamics.
 * Amélioration progressive : tout fonctionne sans JS (liens ?onglet=,
 * formulaires POST). Le JS ajoute la navigation d'onglets sans rechargement,
 * les confirmations de suppression et l'affichage du mot de passe.
 */
(function () {
  "use strict";

  var ACTIVE_CLASSES = ["border-energy", "bg-paper-2", "text-ink"];
  var INACTIVE_CLASSES = ["border-transparent", "text-ink-2"];

  /* --- Onglets du dashboard (sans rechargement) ------------------------- */
  var links = document.querySelectorAll("[data-tab-link]");
  var panels = document.querySelectorAll("[data-tab-panel]");

  function activateTab(key, updateUrl) {
    panels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-tab-panel") !== key;
    });
    links.forEach(function (link) {
      var isActive = link.getAttribute("data-tab-link") === key;
      ACTIVE_CLASSES.forEach(function (c) { link.classList.toggle(c, isActive); });
      INACTIVE_CLASSES.forEach(function (c) { link.classList.toggle(c, !isActive); });
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    if (updateUrl && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set("onglet", key);
      window.history.replaceState(null, "", url.toString());
    }
  }

  if (links.length && panels.length) {
    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        activateTab(link.getAttribute("data-tab-link"), true);
      });
    });
  }

  /* --- Confirmations de suppression ------------------------------------- */
  document.querySelectorAll("form[data-confirm]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      if (!window.confirm(form.getAttribute("data-confirm"))) {
        event.preventDefault();
      }
    });
  });

  /* --- Affichage / masquage du mot de passe (page de connexion) --------- */
  document.querySelectorAll("[data-toggle-password]").forEach(function (button) {
    button.addEventListener("click", function () {
      var input = document.getElementById(button.getAttribute("data-toggle-password"));
      if (!input) return;
      var visible = input.type === "text";
      input.type = visible ? "password" : "text";
      button.setAttribute("aria-pressed", String(!visible));
      button.setAttribute(
        "aria-label",
        visible ? "Afficher le mot de passe" : "Masquer le mot de passe"
      );
    });
  });
})();
