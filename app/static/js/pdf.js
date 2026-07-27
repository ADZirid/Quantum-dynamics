/* Lecteur PDF minimal : charge le flux /fichiers/<kind>/<pk>/ dans la
   visionneuse native du navigateur via <iframe> (CSP : object-src 'self').
   Attendu : <div data-pdf-src="..."><iframe data-pdf-frame></iframe></div> */
(function () {
  "use strict";

  document.querySelectorAll("[data-pdf-src]").forEach(function (container) {
    var frame = container.querySelector("[data-pdf-frame]");
    if (frame && !frame.getAttribute("src")) {
      frame.setAttribute("src", container.getAttribute("data-pdf-src"));
    }
  });
})();
