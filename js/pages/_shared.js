/* ==========================================================================
   Shared page setup
   --------------------------------------------------------------------------
   Small behaviours every page wants: the site chrome, the copyright year,
   image fallbacks and the "coming soon" links. Each page entry calls this
   first, then does its own work.
   ========================================================================== */

import { renderChrome } from "../views/SiteChromeView.js";

/** Keep the copyright year current without editing every page. */
function updateYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((slot) => {
    slot.textContent = year;
  });
}

/**
 * If a photo is missing, swap to the bundled placeholder rather than showing
 * a broken image. Usage: <img src="…/kevin.jpg" data-fallback="…/kevin.svg">
 */
function setupImageFallbacks() {
  document.querySelectorAll("img[data-fallback]").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.src = image.getAttribute("data-fallback");
      },
      { once: true }
    );
  });
}

/** Navigation items that are signposted but not built yet. */
function setupComingSoonLinks() {
  document.querySelectorAll("[data-coming-soon]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const label = link.getAttribute("data-coming-soon") || "This section";
      window.alert(
        `${label} is still being built. In the meantime, create an account to be ` +
          "ready when the first roadmaps open."
      );
    });
  });
}

/** Render the shared chrome, then the small shared behaviours. */
export function initPage() {
  renderChrome();
  updateYear();
  setupImageFallbacks();
  setupComingSoonLinks();
}
