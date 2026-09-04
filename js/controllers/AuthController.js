/* ==========================================================================
   AuthController
   --------------------------------------------------------------------------
   Glue between the auth forms and UserModel: listens for submits, asks the
   model to validate, tells AuthView what to show, then navigates.
   ========================================================================== */

import { register, login } from "../models/UserModel.js";
import { routes } from "../services/PathService.js";
import {
  clearErrors,
  showErrors,
  showFormMessage,
  valueOf,
} from "../views/AuthView.js";

export function initRegisterForm() {
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

export function initLoginForm() {
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

    window.location.href = routes.home();
  });
}
