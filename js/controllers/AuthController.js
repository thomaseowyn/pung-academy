/* ==========================================================================
   AuthController
   --------------------------------------------------------------------------
   Glue between the auth forms and UserModel: listens for submits, asks the
   model to validate, tells AuthView what to show, then navigates.

   Also holds requireLogin() — the guard any page behind a login wall calls
   before rendering anything. It reads session state from UserModel and,
   finding none, redirects to the login page with a "redirect" query param
   pointing back at the page that was actually requested. initLoginForm()
   reads that same param back after a successful login, so the round trip
   lands the learner exactly where they were headed.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.AuthController = (function () {
  "use strict";

  const { register, login, getCurrentUser } = Pung.UserModel;
  const { routes } = Pung.PathService;
  const { clearErrors, showErrors, showFormMessage, valueOf } = Pung.AuthView;

  function initRegisterForm() {
    const form = document.querySelector("[data-form='register']");
    if (!form) {
      return;
    }

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
      window.setTimeout(() => {
        window.location.href = `${routes.login()}?registered=1`;
      }, 900);
    });
  }

  function initLoginForm() {
    const form = document.querySelector("[data-form='login']");
    if (!form) {
      return;
    }

    /* Friendly confirmation after arriving from a successful registration. */
    if (window.location.search.includes("registered=1")) {
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

      const redirect = new URLSearchParams(window.location.search).get("redirect");
      window.location.href = redirect || routes.home();
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
