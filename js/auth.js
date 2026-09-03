/* ==========================================================================
   Pung Academy — local account handling
   --------------------------------------------------------------------------
   PROTOTYPE ONLY. Accounts live in the browser's localStorage and passwords
   are stored as plain text. This is not secure authentication and must never
   be used for real accounts — it exists so the interface can be demonstrated
   without a backend.
   ========================================================================== */

window.PungAuth = (function () {
  "use strict";

  var USERS_KEY = "pungAcademyUsers";
  var SESSION_KEY = "pungAcademyCurrentUser";

  /* ------------------------------------------------------------------
     Storage helpers
     ------------------------------------------------------------------ */

  /** Read the stored user list, returning [] if it is missing or corrupt. */
  function getUsers() {
    try {
      var raw = window.localStorage.getItem(USERS_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveUsers(users) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function normaliseEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function findUser(email) {
    var target = normaliseEmail(email);
    var users = getUsers();
    for (var i = 0; i < users.length; i += 1) {
      if (normaliseEmail(users[i].email) === target) {
        return users[i];
      }
    }
    return null;
  }

  /* ------------------------------------------------------------------
     Validation
     ------------------------------------------------------------------ */

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
  }

  /**
   * Validate registration input.
   * @returns {Object} field name -> error message (empty when valid)
   */
  function validateRegistration(data) {
    var errors = {};

    if (!data.name || data.name.trim().length < 2) {
      errors.name = "Please enter your full name (at least 2 characters).";
    }

    if (!data.email || !data.email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(data.email)) {
      errors.email = "Enter a valid email address, for example name@example.com.";
    } else if (findUser(data.email)) {
      errors.email = "An account with this email already exists. Try logging in.";
    }

    if (!data.password) {
      errors.password = "Password is required.";
    } else if (data.password.length < 8) {
      errors.password = "Use at least 8 characters.";
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
  }

  /* ------------------------------------------------------------------
     Public actions
     ------------------------------------------------------------------ */

  /**
   * Create an account. Returns { ok: true } or { ok: false, errors: {...} }.
   */
  function register(data) {
    var errors = validateRegistration(data);
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors: errors };
    }

    var users = getUsers();
    users.push({
      name: data.name.trim(),
      email: normaliseEmail(data.email),
      // Plain text on purpose: prototype storage, see file header.
      password: data.password,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);

    return { ok: true };
  }

  /**
   * Check credentials and start a session.
   * Returns { ok: true } or { ok: false, errors: {...} }.
   */
  function login(email, password) {
    var errors = {};

    if (!email || !String(email).trim()) {
      errors.email = "Email is required.";
    }
    if (!password) {
      errors.password = "Password is required.";
    }
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors: errors };
    }

    var user = findUser(email);
    if (!user || user.password !== password) {
      // Deliberately vague: do not reveal which half was wrong.
      return {
        ok: false,
        errors: { form: "Incorrect email or password. Please try again." }
      };
    }

    startSession(user);
    return { ok: true };
  }

  function startSession(user) {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        name: user.name,
        email: user.email,
        loggedInAt: new Date().toISOString()
      })
    );
  }

  function getCurrentUser() {
    try {
      var raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function logout() {
    window.localStorage.removeItem(SESSION_KEY);
  }

  /**
   * Path prefix back to the site root. Pages inside /team/ declare
   * data-root=".." on <html>; everything else resolves to "".
   */
  function rootPath() {
    var root = document.documentElement.getAttribute("data-root");
    return root ? root.replace(/\/?$/, "/") : "";
  }

  return {
    USERS_KEY: USERS_KEY,
    SESSION_KEY: SESSION_KEY,
    getUsers: getUsers,
    findUser: findUser,
    isValidEmail: isValidEmail,
    register: register,
    login: login,
    getCurrentUser: getCurrentUser,
    logout: logout,
    rootPath: rootPath
  };
})();

/* ==========================================================================
   Form wiring for login.html and register.html
   Both forms share the same error-rendering helpers, so they live together.
   The code below no-ops on pages that contain neither form.
   ========================================================================== */
(function () {
  "use strict";

  var loginForm = document.querySelector("[data-form='login']");
  var registerForm = document.querySelector("[data-form='register']");

  if (!loginForm && !registerForm) {
    return;
  }

  /** Clear every inline error message and invalid state in a form. */
  function clearErrors(form) {
    form.querySelectorAll("[data-error-for]").forEach(function (node) {
      node.textContent = "";
      node.hidden = true;
    });
    form.querySelectorAll("[aria-invalid='true']").forEach(function (field) {
      field.setAttribute("aria-invalid", "false");
    });

    var summary = form.querySelector("[data-form-message]");
    if (summary) {
      summary.textContent = "";
      summary.hidden = true;
      summary.className = "form-message";
    }
  }

  /** Show a banner above the form (used for general or success messages). */
  function showFormMessage(form, message, type) {
    var summary = form.querySelector("[data-form-message]");
    if (!summary) {
      return;
    }
    summary.textContent = message;
    summary.className = "form-message form-message--" + (type || "error");
    summary.hidden = false;
  }

  /** Render field errors returned by PungAuth and focus the first one. */
  function showErrors(form, errors) {
    var firstField = null;

    Object.keys(errors).forEach(function (field) {
      if (field === "form") {
        showFormMessage(form, errors.form, "error");
        return;
      }

      var message = form.querySelector("[data-error-for='" + field + "']");
      var input = form.querySelector("[name='" + field + "']");

      if (message) {
        message.textContent = errors[field];
        message.hidden = false;
      }
      if (input) {
        input.setAttribute("aria-invalid", "true");
        if (!firstField) {
          firstField = input;
        }
      }
    });

    if (firstField) {
      firstField.focus();
    } else {
      var summary = form.querySelector("[data-form-message]");
      if (summary) {
        summary.focus();
      }
    }
  }

  function valueOf(form, name) {
    var field = form.elements[name];
    return field ? field.value : "";
  }

  /* ----------------------------- Register ----------------------------- */
  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(registerForm);

      var result = window.PungAuth.register({
        name: valueOf(registerForm, "name"),
        email: valueOf(registerForm, "email"),
        password: valueOf(registerForm, "password"),
        confirmPassword: valueOf(registerForm, "confirmPassword")
      });

      if (!result.ok) {
        showErrors(registerForm, result.errors);
        return;
      }

      showFormMessage(
        registerForm,
        "Account created. Taking you to the login page…",
        "success"
      );
      registerForm.reset();
      window.setTimeout(function () {
        window.location.href = "login.html?registered=1";
      }, 900);
    });
  }

  /* ------------------------------- Login ------------------------------ */
  if (loginForm) {
    // Friendly confirmation after arriving from a successful registration.
    if (window.location.search.indexOf("registered=1") !== -1) {
      showFormMessage(
        loginForm,
        "Your account is ready. Log in to continue.",
        "success"
      );
    }

    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(loginForm);

      var result = window.PungAuth.login(
        valueOf(loginForm, "email"),
        valueOf(loginForm, "password")
      );

      if (!result.ok) {
        showErrors(loginForm, result.errors);
        return;
      }

      window.location.href = "index.html";
    });
  }
})();
