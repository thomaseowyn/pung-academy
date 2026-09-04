/* ==========================================================================
   StorageService
   --------------------------------------------------------------------------
   The only place in the app that touches localStorage. Every read and write
   is wrapped, so a browser with storage disabled or full degrades to
   "nothing saved" instead of throwing.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.StorageService = (function () {
  "use strict";

  /**
   * Read and parse a JSON value.
   * @param {string} key
   * @param {*} fallback returned when the key is missing or unreadable
   */
  function readJSON(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        return fallback;
      }
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  /**
   * Serialise and store a value. Returns false if storage refused it.
   * @returns {boolean}
   */
  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      /* nothing sensible to do */
    }
  }

  return { readJSON, remove, writeJSON };
})();
