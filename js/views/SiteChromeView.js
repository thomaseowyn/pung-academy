/* ==========================================================================
   SiteChromeView
   --------------------------------------------------------------------------
   Renders the navbar and footer into every page that asks for them.

   This exists so the header and footer are written once rather than copied
   into 21 HTML files. A page opts in with two empty placeholders:

     <header data-site-header data-active="courses"></header>
     <footer data-site-footer></footer>

   DOM rendering only — it reads the session from UserModel but holds no
   state of its own.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.SiteChromeView = (function () {
  "use strict";

  const { routes } = Pung.PathService;
  const { getCurrentUser, logout } = Pung.UserModel;

  const NAV_ITEMS = [
    { key: "courses", label: "Lessons", href: () => routes.courseTree() },
    { key: "about", label: "About Us", href: () => routes.about() },
    {
      key: "resources",
      label: "Resources",
      href: () => routes.home() + "#resources",
      soon: true,
      comingSoon: "The resource library",
    },
  ];

  function brandMarkup(homeHref, logoSrc) {
    return `
      <a class="brand" href="${homeHref}">
        <img class="brand__mark" src="${logoSrc}" alt="" width="30" height="30" />
        Pung Academy
      </a>`;
  }

  /* ------------------------------------------------------------------ header */

  function renderHeader() {
    const mount = document.querySelector("[data-site-header]");
    if (!mount) {
      return;
    }

    const active = mount.getAttribute("data-active") || "";
    const user = getCurrentUser();

    const items = NAV_ITEMS.map((item) => {
      const classes = ["nav__link"];
      if (item.soon) {
        classes.push("nav__link--soon");
      }
      const current = item.key === active ? ' aria-current="page"' : "";
      const soonAttr = item.comingSoon
        ? ` data-coming-soon="${item.comingSoon}"`
        : "";
      const badge = item.soon
        ? ' <span class="nav__badge">Soon</span>'
        : "";
      return `<li><a class="${classes.join(" ")}" href="${item.href()}"${current}${soonAttr}>${item.label}${badge}</a></li>`;
    }).join("");

    mount.className = "site-header";
    mount.innerHTML = `
      <div class="container site-header__inner">
        ${brandMarkup(routes.home(), routes.asset("icons/logo.svg"))}

        <nav class="nav" id="primary-navigation" aria-label="Main">
          <ul class="nav__list nav__list--primary">${items}</ul>

          <div class="nav__session">
            <ul class="nav__list nav__list--actions" data-session="guest"${user ? " hidden" : ""}>
              <li><a class="btn btn--ghost" href="${routes.login()}">Login</a></li>
              <li><a class="btn btn--primary" href="${routes.signup()}">Sign Up</a></li>
            </ul>

            <div class="nav__session" data-session="user"${user ? "" : " hidden"}>
              <span class="nav__user">Hi, <span data-user-name>${
                user ? escapeHtml(user.name || user.email) : "learner"
              }</span></span>
              <button class="btn btn--secondary" type="button" data-logout>Log out</button>
            </div>
          </div>
        </nav>
      </div>`;

    const logoutButton = mount.querySelector("[data-logout]");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        logout();
        window.location.href = routes.home();
      });
    }
  }

  /* ------------------------------------------------------------------ footer */

  function renderFooter() {
    const mount = document.querySelector("[data-site-footer]");
    if (!mount) {
      return;
    }

    const year = new Date().getFullYear();
    const full = mount.hasAttribute("data-full");

    mount.className = "site-footer";
    mount.innerHTML = `
      <div class="container">
        ${full ? footerColumns() : ""}
        <div class="site-footer__bottom">
          <p>&copy; ${year} Pung Academy. Built as a student project.</p>
          <p>Prototype — accounts and progress are stored in your browser only.</p>
        </div>
      </div>`;
  }

  function footerColumns() {
    return `
        <div class="site-footer__grid">
          <div class="site-footer__about">
            ${brandMarkup(routes.home(), routes.asset("icons/logo.svg"))}
            <p>
              A structured starting point for people learning to program. We put
              the lessons in order so beginners can spend their energy on
              learning rather than on planning.
            </p>
          </div>

          <div>
            <h2 class="site-footer__title">Learn</h2>
            <ul class="site-footer__list">
              <li><a href="${routes.courseTree()}">Lessons</a></li>
              <li><a href="${routes.home()}#resources" data-coming-soon="The resource library">Resources</a></li>
              <li><a href="${routes.home()}#philosophy">Learning philosophy</a></li>
            </ul>
          </div>

          <div>
            <h2 class="site-footer__title">Academy</h2>
            <ul class="site-footer__list">
              <li><a href="${routes.about()}">About Us</a></li>
              <li><a href="${routes.login()}">Login</a></li>
              <li><a href="${routes.signup()}">Sign Up</a></li>
            </ul>
          </div>
        </div>`;
  }

  function escapeHtml(value) {
    const node = document.createElement("span");
    node.textContent = String(value);
    return node.innerHTML;
  }

  /** Render both, plus the shared "coming soon" link behaviour. */
  function renderChrome() {
    renderHeader();
    renderFooter();
  }

  return { renderChrome, renderFooter, renderHeader };
})();
