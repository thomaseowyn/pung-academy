/* ==========================================================================
   ValidationService
   --------------------------------------------------------------------------
   Reusable input checks. No DOM access and no storage — these are pure
   functions so they can be used by any model or controller.
   ========================================================================== */

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

export function normaliseEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isLongEnough(value, minimum) {
  return String(value || "").length >= minimum;
}

export function isNotBlank(value) {
  return String(value || "").trim().length > 0;
}

/**
 * Tidy a code submission so formatting differences do not fail a correct
 * answer: curly quotes become straight, tabs become spaces, trailing
 * whitespace and stray carriage returns go.
 */
export function normaliseCode(text) {
  return String(text)
    .replace(/\r\n?/g, "\n")
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\t/g, "    ")
    .replace(/[ \t]+$/gm, "");
}

/** Drop blank lines and comments, so an untouched starter cannot pass. */
export function meaningfulCode(text) {
  return normaliseCode(text)
    .split("\n")
    .filter((line) => line.trim() !== "" && line.trim()[0] !== "#")
    .join("\n");
}
