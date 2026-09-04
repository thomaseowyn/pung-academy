/* ==========================================================================
   UserModel
   --------------------------------------------------------------------------
   Local accounts and the current session. Pure data and state — no DOM.

   PROTOTYPE ONLY. Accounts live in localStorage and passwords are stored as
   plain text. This is not secure authentication and must never hold a real
   password; it exists so the interface can be demonstrated without a server.
   ========================================================================== */

import { readJSON, writeJSON, remove } from "../services/StorageService.js";
import {
  isValidEmail,
  normaliseEmail,
  isLongEnough,
  isNotBlank,
} from "../services/ValidationService.js";

const USERS_KEY = "pungAcademyUsers";
const SESSION_KEY = "pungAcademyCurrentUser";
const MIN_PASSWORD = 8;

/* ------------------------------------------------------------------ reads */

export function getUsers() {
  const users = readJSON(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

export function findUser(email) {
  const target = normaliseEmail(email);
  return getUsers().find((user) => normaliseEmail(user.email) === target) || null;
}

export function getCurrentUser() {
  return readJSON(SESSION_KEY, null);
}

/* ------------------------------------------------------------- validation */

/**
 * @returns {Object} field name -> message; empty when the input is valid
 */
export function validateRegistration({ name, email, password, confirmPassword }) {
  const errors = {};

  if (!isNotBlank(name) || String(name).trim().length < 2) {
    errors.name = "Please enter your full name (at least 2 characters).";
  }

  if (!isNotBlank(email)) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address, for example name@example.com.";
  } else if (findUser(email)) {
    errors.email = "An account with this email already exists. Try logging in.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (!isLongEnough(password, MIN_PASSWORD)) {
    errors.password = `Use at least ${MIN_PASSWORD} characters.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

/* ---------------------------------------------------------------- actions */

/** @returns {{ok: boolean, errors?: Object}} */
export function register(data) {
  const errors = validateRegistration(data);
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const users = getUsers();
  users.push({
    name: data.name.trim(),
    email: normaliseEmail(data.email),
    // Plain text on purpose: prototype storage, see the file header.
    password: data.password,
    createdAt: new Date().toISOString(),
  });
  writeJSON(USERS_KEY, users);

  return { ok: true };
}

/** @returns {{ok: boolean, errors?: Object}} */
export function login(email, password) {
  const errors = {};
  if (!isNotBlank(email)) {
    errors.email = "Email is required.";
  }
  if (!password) {
    errors.password = "Password is required.";
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const user = findUser(email);
  if (!user || user.password !== password) {
    // Deliberately vague: do not reveal which half was wrong.
    return {
      ok: false,
      errors: { form: "Incorrect email or password. Please try again." },
    };
  }

  startSession(user);
  return { ok: true };
}

export function startSession(user) {
  writeJSON(SESSION_KEY, {
    name: user.name,
    email: user.email,
    loggedInAt: new Date().toISOString(),
  });
}

export function logout() {
  remove(SESSION_KEY);
}
