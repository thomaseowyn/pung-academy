/* ==========================================================================
   AuthView
   --------------------------------------------------------------------------
   Rendering for the login and sign-up forms: inline field errors, the banner
   above the form, and clearing both. DOM only.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.AuthView = (function () {
  "use strict";

  /** Clear every inline error and invalid state in a form. */
  function clearErrors(form) {
    form.querySelectorAll("[data-error-for]").forEach((node) => {
      node.textContent = "";
      node.hidden = true;
    });
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      field.setAttribute("aria-invalid", "false");
    });

    const summary = form.querySelector("[data-form-message]");
    if (summary) {
      summary.textContent = "";
      summary.hidden = true;
      summary.className = "form-message";
    }
  }

  /** Banner above the form, for general errors and success messages. */
  function showFormMessage(form, message, type = "error") {
    const summary = form.querySelector("[data-form-message]");
    if (!summary) {
      return;
    }
    summary.textContent = message;
    summary.className = `form-message form-message--${type}`;
    summary.hidden = false;
  }

  /** Render field errors and focus the first offending input. */
  function showErrors(form, errors) {
    let firstField = null;

    Object.keys(errors).forEach((field) => {
      if (field === "form") {
        showFormMessage(form, errors.form, "error");
        return;
      }

      const message = form.querySelector(`[data-error-for="${field}"]`);
      const input = form.querySelector(`[name="${field}"]`);

      if (message) {
        message.textContent = errors[field];
        message.hidden = false;
      }
      if (input) {
        input.setAttribute("aria-invalid", "true");
        firstField = firstField || input;
      }
    });

    if (firstField) {
      firstField.focus();
    } else {
      form.querySelector("[data-form-message]")?.focus();
    }
  }

  function valueOf(form, name) {
    return form.elements[name]?.value ?? "";
  }

  return { clearErrors, showErrors, showFormMessage, valueOf };
})();
