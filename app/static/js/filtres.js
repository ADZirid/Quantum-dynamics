/* Filtres des pages bibliothèque — vanilla JS, sans dépendance.
   - Dropdown de catégories à cases à cocher (Échap, clic extérieur,
     cases qui soumettent le formulaire GET, tout cocher / décocher)
   - Selects à soumission automatique ([data-auto-submit])
   - Pastilles de retrait de catégorie ([data-retirer-categorie])
   - Recherche client sur la grille d'archives newsletter
     ([data-recherche-input] filtre [data-recherche-item]) */
(function () {
  "use strict";

  function soumettreFormulaire(el) {
    var form = el.closest("form");
    if (form) {
      form.requestSubmit ? form.requestSubmit() : form.submit();
    }
  }

  /* ---------- Dropdown de catégories ---------- */
  document.querySelectorAll("[data-dropdown]").forEach(function (dropdown) {
    var button = dropdown.querySelector("[data-dropdown-button]");
    var panel = dropdown.querySelector("[data-dropdown-panel]");
    var chevron = dropdown.querySelector("[data-dropdown-chevron]");
    if (!button || !panel) return;

    function estOuvert() {
      return !panel.classList.contains("hidden");
    }

    function ouvrir() {
      panel.classList.remove("hidden");
      button.setAttribute("aria-expanded", "true");
      if (chevron) chevron.classList.add("rotate-180");
    }

    function fermer(rendreFocus) {
      panel.classList.add("hidden");
      button.setAttribute("aria-expanded", "false");
      if (chevron) chevron.classList.remove("rotate-180");
      if (rendreFocus) button.focus();
    }

    button.addEventListener("click", function () {
      estOuvert() ? fermer(false) : ouvrir();
    });

    // Clic extérieur → fermeture
    document.addEventListener("pointerdown", function (event) {
      if (estOuvert() && !dropdown.contains(event.target)) {
        fermer(false);
      }
    });

    // Échap → fermeture + restitution du focus au bouton
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && estOuvert()) {
        event.stopPropagation();
        fermer(true);
      }
    });

    // Chaque case cochée/décochée soumet le formulaire GET
    dropdown.querySelectorAll("[data-dropdown-checkbox]").forEach(function (box) {
      box.addEventListener("change", function () {
        soumettreFormulaire(box);
      });
    });

    function cocherTout(valeur) {
      dropdown.querySelectorAll("[data-dropdown-checkbox]").forEach(function (box) {
        box.checked = valeur;
      });
      soumettreFormulaire(button);
    }

    var tout = dropdown.querySelector("[data-dropdown-tout]");
    var rien = dropdown.querySelector("[data-dropdown-rien]");
    if (tout) tout.addEventListener("click", function () { cocherTout(true); });
    if (rien) rien.addEventListener("click", function () { cocherTout(false); });
  });

  /* ---------- Pastilles de retrait de catégorie ---------- */
  document.querySelectorAll("[data-retirer-categorie]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var code = chip.getAttribute("data-retirer-categorie");
      var form = chip.closest("form");
      if (!form) return;
      var box = form.querySelector(
        '[data-dropdown-checkbox][value="' + code + '"]'
      );
      if (box) box.checked = false;
      soumettreFormulaire(chip);
    });
  });

  /* ---------- Selects à soumission automatique ---------- */
  document.querySelectorAll("[data-auto-submit]").forEach(function (select) {
    select.addEventListener("change", function () {
      soumettreFormulaire(select);
    });
  });

  /* ---------- Recherche client (archives newsletter) ---------- */
  var recherche = document.querySelector("[data-recherche-input]");
  if (recherche) {
    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-recherche-item]")
    );
    var blocVide = document.querySelector("[data-recherche-vide]");
    var pagination = document.querySelector("[data-recherche-pagination]");
    var reset = document.querySelector("[data-recherche-reset]");

    function filtrer() {
      var terme = recherche.value.trim().toLowerCase();
      var visibles = 0;
      items.forEach(function (item) {
        var correspond =
          !terme || item.textContent.toLowerCase().indexOf(terme) !== -1;
        item.classList.toggle("hidden", !correspond);
        if (correspond) visibles += 1;
      });
      if (blocVide) {
        blocVide.classList.toggle("hidden", visibles > 0 || !terme);
        blocVide.classList.toggle("flex", visibles === 0 && !!terme);
      }
      // « Charger plus » masqué pendant une recherche (périmètre = page courante)
      if (pagination) pagination.classList.toggle("hidden", !!terme);
    }

    recherche.addEventListener("input", filtrer);
    if (reset) {
      reset.addEventListener("click", function () {
        recherche.value = "";
        filtrer();
        recherche.focus();
      });
    }
  }
})();
