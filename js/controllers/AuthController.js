/* ==========================================================================
   AuthController
   --------------------------------------------------------------------------
   Glue between the auth forms and UserModel: listens for submits, asks the
   model to validate, tells AuthView what to show, then navigates.

   Also holds requireLogin() — the guard any page behind a login wall calls
   before rendering anything. It reads session state from UserModel and,
   finding none, redirects to the login page with a "redirect" query param
   pointing back at the page that was actually requested.

   Where a learner lands afterwards is decided in one place, by
   destinationAfterAuth():

     - the ?redirect= page, when they were sent here from a locked page;
     - otherwise the lessons roadmap, because someone who has just signed in
       wants to carry on learning, not to re-read the landing page.

   The redirect survives the whole round trip — including the hop through
   registration and the login <-> signup links — so "Start learning" ends at
   the lessons either way: straight through login, or via signing up first.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.AuthController = (function () {
  "use strict";

  const { register, login, getCurrentUser } = Pung.UserModel;
  const { routes } = Pung.PathService;
  const { clearErrors, showErrors, showFormMessage, valueOf } = Pung.AuthView;

  /* ---------------------------------------------------------- redirection */

  /**
   * The ?redirect= value, but only when it is a safe same-site path.
   * Anything carrying a scheme ("https://elsewhere.example"), a
   * protocol-relative "//host" prefix, or a backslash is discarded — without
   * that check a crafted link could bounce a freshly signed-in learner
   * straight off the site.
   */
  function requestedRedirect() {
    const value = new URLSearchParams(window.location.search).get("redirect");
    if (!value) {
      return null;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
      return null;
    }
    if (value.startsWith("//") || value.includes("\\")) {
      return null;
    }
    return value;
  }

  /** Where a successful sign-in or sign-up should land. */
  function destinationAfterAuth() {
    return requestedRedirect() || routes.courseTree();
  }

  /** Append the current redirect to the login <-> signup cross-links, so a
   *  learner who arrived from a locked chapter still lands there after
   *  detouring through registration. */
  function carryRedirectAcrossAuthPages() {
    const redirect = requestedRedirect();
    if (!redirect) {
      return;
    }
    document.querySelectorAll("[data-auth-switch]").forEach((link) => {
      const base = link.getAttribute("href").split("?")[0];
      link.href = `${base}?redirect=${encodeURIComponent(redirect)}`;
    });
  }

  /** An auth page has nothing to offer someone who is already signed in. */
  function skipIfSignedIn() {
    if (!getCurrentUser()) {
      return false;
    }
    window.location.replace(destinationAfterAuth());
    return true;
  }

  /* -------------------------------------------------------------- register */

  function initRegisterForm() {
    const form = document.querySelector("[data-form='register']");
    if (!form || skipIfSignedIn()) {
      return;
    }

    carryRedirectAcrossAuthPages();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors(form);

      const result = register({
        name: valueOf(form, "name"),
        email: valueOf(form, "email"),
        password: valueOf(form, "password"),
        confirmPassword: valueOf(form, "confirmPassword"),
      });

      if (!result.ok) {
        showErrors(form, result.errors);
        return;
      }

      showFormMessage(form, "Account created. Taking you to the login page…", "success");
      form.reset();

      /* Hand the destination on to the login page rather than losing it
         here, so registering mid-journey still ends where it was going. */
      const redirect = requestedRedirect();
      const query = redirect
        ? `?registered=1&redirect=${encodeURIComponent(redirect)}`
        : "?registered=1";

      window.setTimeout(() => {
        window.location.href = `${routes.login()}${query}`;
      }, 900);
    });
  }

  /* ----------------------------------------------------------------- login */

  function initLoginForm() {
    const form = document.querySelector("[data-form='login']");
    if (!form || skipIfSignedIn()) {
      return;
    }

    carryRedirectAcrossAuthPages();

    /* Friendly confirmation after arriving from a successful registration. */
    if (new URLSearchParams(window.location.search).has("registered")) {
      showFormMessage(form, "Your account is ready. Log in to continue.", "success");
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors(form);

      const result = login(valueOf(form, "email"), valueOf(form, "password"));
      if (!result.ok) {
        showErrors(form, result.errors);
        return;
      }

      window.location.href = destinationAfterAuth();
    });
  }

  /**
   * Call at the top of any page that requires a signed-in session.
   * Redirects to login (preserving the current page so login can return
   * here) and returns false when there is no session; returns true and
   * does nothing otherwise.
   */
  function requireLogin() {
    if (getCurrentUser()) {
      return true;
    }
    const here = window.location.pathname + window.location.search;
    window.location.replace(`${routes.login()}?redirect=${encodeURIComponent(here)}`);
    return false;
  }

  return { initLoginForm, initRegisterForm, requireLogin };
})();
