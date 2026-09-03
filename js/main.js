/* ==========================================================================
   Pung Academy — small shared UI helpers
   ========================================================================== */

(function () {
  "use strict";

  /**
   * Keep the copyright year current without editing every page.
   */
  function updateYear() {
    var slots = document.querySelectorAll("[data-current-year]");
    var year = String(new Date().getFullYear());
    slots.forEach(function (slot) {
      slot.textContent = year;
    });
  }

  /**
   * Image fallback: if a photo is missing (for example after someone drops in
   * their own file name), swap to the bundled SVG placeholder instead of
   * showing a broken image.
   * Usage: <img src="…/kevin.jpg" data-fallback="…/kevin.svg">
   */
  function setupImageFallbacks() {
    var images = document.querySelectorAll("img[data-fallback]");
    images.forEach(function (image) {
      image.addEventListener("error", function handleError() {
        image.removeEventListener("error", handleError);
        image.src = image.getAttribute("data-fallback");
      });
    });
  }

  /**
   * Navigation items that are signposted but not built yet. Explain rather
   * than silently doing nothing when someone clicks them.
   */
  function setupComingSoonLinks() {
    var links = document.querySelectorAll("[data-coming-soon]");
    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var label = link.getAttribute("data-coming-soon") || "This section";
        window.alert(
          label +
            " is still being built. In the meantime, create an account to be " +
            "ready when the first roadmaps open."
        );
      });
    });
  }

  updateYear();
  setupImageFallbacks();
  setupComingSoonLinks();
})();
