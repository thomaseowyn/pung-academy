/* ==========================================================================
   ExerciseBankView
   --------------------------------------------------------------------------
   Draws the "Recommended for you" panel and the exercise lists on the Arena
   page, and the modal a learner solves an exercise in. DOM only — cards,
   stats and results come in through arguments and callbacks.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.ExerciseBankView = (function () {
  "use strict";

  const ICON_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function stars(difficulty) {
    return "&#9733;".repeat(difficulty) + "&#9734;".repeat(3 - difficulty);
  }

  /** Reveals `text` into `el` one character at a time, like it's being typed. */
  function typeInto(el, text, speed, done) {
    if (reduceMotion) {
      el.textContent = text;
      if (done) {
        done();
      }
      return;
    }
    el.textContent = "";
    let i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i += 1;
        setTimeout(step, speed);
      } else if (done) {
        done();
      }
    })();
  }

  let logTimer;
  /** The small "> ... :: solved" toast, bottom-left. */
  function showArenaLog(message) {
    const log = document.querySelector("[data-arena-log]");
    if (!log) {
      return;
    }
    log.textContent = `> ${message}`;
    log.classList.add("is-visible");
    clearTimeout(logTimer);
    logTimer = setTimeout(() => log.classList.remove("is-visible"), 1800);
  }

  /* ---------------------------------------------------------- recommended pick */

  /* Tracks the previously shown pick so a change in recommendation (not just
     a re-render of the same one) is what triggers the type-in swap. */
  let lastRecommendedId;

  function renderRecommended(pick, onStart) {
    const mount = document.querySelector("[data-arena-recommend]");
    if (!mount) {
      return;
    }

    const pickId = pick ? pick.id : null;
    const changed = lastRecommendedId !== undefined && lastRecommendedId !== pickId;
    lastRecommendedId = pickId;

    if (!pick) {
      mount.innerHTML = `
        <div class="arena-recommend arena-recommend--empty">
          <p>You have cleared every exercise in the bank. Nice work — check back after finishing more chapters, or revisit any of them below.</p>
        </div>`;
      return;
    }

    mount.innerHTML = `
      <div class="arena-recommend">
        <div class="arena-recommend__meta">
          <span>${escapeHtml(pick.courseTitle)}</span>
          <span>&middot;</span>
          <span>${escapeHtml(pick.unitLabel)}</span>
        </div>
        <h3 class="arena-recommend__title arena-cursor" data-arena-title></h3>
        <ul class="arena-topic-chips">
          ${pick.topics.map((topic) => `<li>${escapeHtml(topic)}</li>`).join("")}
        </ul>
        <div class="arena-recommend__footer">
          <span class="arena-stars" aria-label="Difficulty ${pick.difficulty} of 3">${stars(pick.difficulty)}</span>
          <span class="arena-minutes">~${pick.minutes} min</span>
          <button type="button" class="btn btn--primary" data-arena-start>Start &rarr;</button>
        </div>
      </div>`;

    const titleEl = mount.querySelector("[data-arena-title]");
    if (changed) {
      titleEl.classList.add("is-swapping");
      typeInto(titleEl, pick.title, 20, () => titleEl.classList.remove("is-swapping"));
    } else {
      titleEl.textContent = pick.title;
    }

    mount.querySelector("[data-arena-start]").addEventListener("click", () => onStart(pick));
  }

  /* ------------------------------------------------------------- course lists */

  function exerciseRowHtml(ex) {
    return `
      <li class="arena-exercise-row${ex.solved ? " is-solved" : ""}" data-row-id="${ex.id}">
        <span class="arena-exercise-row__check" aria-hidden="true">${ex.solved ? ICON_CHECK : ""}</span>
        <div class="arena-exercise-row__body">
          <p class="arena-exercise-row__title">${escapeHtml(ex.title)}</p>
          <p class="arena-exercise-row__topics">${ex.topics.map(escapeHtml).join(" &middot; ")}</p>
        </div>
        <span class="arena-stars" aria-label="Difficulty ${ex.difficulty} of 3">${stars(ex.difficulty)}</span>
        <span class="arena-minutes">~${ex.minutes} min</span>
        <button type="button" class="btn btn--secondary" data-exercise-id="${ex.id}">${
      ex.solved ? "Review" : "Solve"
    }</button>
      </li>`;
  }

  function unitHtml(unit) {
    return `
      <div class="arena-unit">
        <p class="arena-unit__label">
          <span class="arena-cursor">${escapeHtml(unit.label)}</span>
          <span class="arena-unit__stats" data-unit-stats>${unit.solved} / ${unit.total}</span>
        </p>
        <ul class="arena-exercise-list">
          ${unit.exercises.map(exerciseRowHtml).join("")}
        </ul>
      </div>`;
  }

  function courseBlockHtml(course) {
    if (course.locked) {
      return `
        <section class="arena-course-block arena-course-block--locked" aria-label="${escapeHtml(course.title)}">
          <header class="arena-course-block__head">
            <h3>${escapeHtml(course.title)}</h3>
          </header>
          <p class="arena-panel__note">Locked — finish Introduction to Programming first.</p>
        </section>`;
    }

    return `
      <section class="arena-course-block" aria-label="${escapeHtml(course.title)}">
        <header class="arena-course-block__head">
          <h3>${escapeHtml(course.title)}</h3>
          <span class="arena-course-block__stats">${course.solved} / ${course.total} solved</span>
        </header>
        ${course.units.map(unitHtml).join("")}
      </section>`;
  }

  /**
   * @param {Array} sections course rows (see ExerciseBankController.buildSections)
   * @param {Function} onSolve called with the exercise object for a clicked row
   * @param {string|null} [justSolvedId] an exercise id to react to: flashes its
   *   row, pops its unit's counter, and logs a "solved" toast
   */
  function renderCourseLists(sections, onSolve, justSolvedId) {
    const mount = document.querySelector("[data-arena-exercises]");
    if (!mount) {
      return;
    }
    mount.innerHTML = sections.map(courseBlockHtml).join("");

    const byId = new Map();
    sections.forEach((course) => {
      (course.units || []).forEach((unit) => {
        unit.exercises.forEach((ex) => byId.set(ex.id, ex));
      });
    });

    mount.querySelectorAll("[data-exercise-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const exercise = byId.get(button.getAttribute("data-exercise-id"));
        if (exercise) {
          onSolve(exercise);
        }
      });
    });

    if (!justSolvedId) {
      return;
    }

    const solvedExercise = byId.get(justSolvedId);
    if (solvedExercise) {
      showArenaLog(`${solvedExercise.title} :: solved`);
    }

    if (reduceMotion) {
      return;
    }

    const row = mount.querySelector(`[data-row-id="${CSS.escape(justSolvedId)}"]`);
    if (!row) {
      return;
    }
    row.classList.add("is-flashing");
    row.addEventListener("animationend", () => row.classList.remove("is-flashing"), { once: true });

    const statsEl = row.closest(".arena-unit")?.querySelector("[data-unit-stats]");
    if (statsEl) {
      statsEl.classList.add("is-pulsing");
      statsEl.addEventListener("animationend", () => statsEl.classList.remove("is-pulsing"), { once: true });
    }
  }

  /* ------------------------------------------------------------- boot sequence */

  /** A short terminal-style log, then reveals [data-arena-content]. */
  function runBoot() {
    const boot = document.querySelector("[data-arena-boot]");
    const content = document.querySelector("[data-arena-content]");
    if (!content) {
      return;
    }

    if (reduceMotion || !boot) {
      content.classList.add("is-ready");
      return;
    }

    const lines = ["loading course progress...", "checking your current unit...", { text: "arena ready.", ok: true }];
    boot.innerHTML = "";
    let i = 0;
    (function next() {
      if (i >= lines.length) {
        setTimeout(() => content.classList.add("is-ready"), 150);
        return;
      }
      const item = lines[i];
      const span = document.createElement("span");
      if (typeof item === "object") {
        span.textContent = item.text;
        span.classList.add("is-ok");
      } else {
        span.textContent = item;
      }
      boot.appendChild(span);
      i += 1;
      setTimeout(next, 260);
    })();
  }

  /* ----------------------------------------------------------- solving modal */

  /* A textarea plus a synced line-number gutter, styled by code-editor.css —
     the same component the lesson chapters use for their "code" exercises,
     right down to the Tab-to-indent behaviour. */
  function buildEditor(mount, exercise) {
    const editor = document.createElement("div");
    editor.className = "editor";

    const bar = document.createElement("div");
    bar.className = "editor__bar";
    const label = document.createElement("span");
    label.className = "editor__label";
    label.textContent = exercise.language || "Python";
    const note = document.createElement("span");
    note.className = "editor__note";
    note.textContent = "Checked for concepts — not executed";
    bar.append(label, note);
    editor.appendChild(bar);

    const editorBody = document.createElement("div");
    editorBody.className = "editor__body";
    const gutter = document.createElement("div");
    gutter.className = "editor__gutter";
    const textarea = document.createElement("textarea");
    textarea.className = "editor__input";
    textarea.spellcheck = false;
    textarea.setAttribute("aria-label", "Your code");
    textarea.value = exercise.starter || "";

    const syncGutter = () => {
      const count = Math.max(textarea.value.split("\n").length, 8);
      gutter.textContent = Array.from({ length: count }, (_, i) => i + 1).join("\n");
    };
    textarea.addEventListener("input", syncGutter);
    textarea.addEventListener("scroll", () => {
      gutter.scrollTop = textarea.scrollTop;
    });
    /* Tab should indent, not jump out of the editor. */
    textarea.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") {
        return;
      }
      event.preventDefault();
      const { selectionStart: start, selectionEnd: end } = textarea;
      textarea.value = textarea.value.slice(0, start) + "    " + textarea.value.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
      syncGutter();
    });

    editorBody.append(gutter, textarea);
    editor.appendChild(editorBody);
    mount.replaceWith(editor);
    syncGutter();
    return textarea;
  }

  /**
   * Open the exercise-solving modal.
   * @param {Object} exercise
   * @param {{onSubmit: Function, onClose: Function}} handlers onSubmit(code)
   *   returns {ok, tone?, message?} and, on ok, is expected to have already
   *   recorded the result; onClose fires once, when the dialog closes.
   */
  function openExercise(exercise, { onSubmit, onClose }) {
    if (document.querySelector(".ex-overlay")) {
      return;
    }
    const opener = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "ex-overlay";
    overlay.innerHTML = `
      <div class="ex-dialog" role="dialog" aria-modal="true" aria-label="Exercise: ${escapeHtml(
        exercise.title
      )}" tabindex="-1">
        <header class="ex-head">
          <span class="ex-head__meta">${escapeHtml(exercise.courseTitle || "")} &middot; ${escapeHtml(
      exercise.unitLabel || ""
    )}</span>
          <button type="button" class="ex-close" data-ex-close aria-label="Close exercise">&#10005;</button>
        </header>
        <div class="ex-body" data-ex-body></div>
      </div>`;
    document.body.appendChild(overlay);

    const background = Array.from(document.body.children).filter(
      (el) => el !== overlay && el.tagName !== "SCRIPT"
    );
    background.forEach((el) => {
      el.inert = true;
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = overlay.querySelector(".ex-dialog");
    const body = overlay.querySelector("[data-ex-body]");
    let textarea = null;

    function close() {
      document.removeEventListener("keydown", handleKey);
      overlay.remove();
      background.forEach((el) => {
        el.inert = false;
      });
      document.body.style.overflow = previousOverflow;
      if (opener && typeof opener.focus === "function") {
        opener.focus();
      }
      onClose();
    }

    function showFeedback(message, tone) {
      const feedback = body.querySelector("[data-ex-feedback]");
      feedback.textContent = message;
      feedback.className = `ex-feedback ex-feedback--${tone}`;
    }

    function submit() {
      const result = onSubmit(textarea.value);
      if (result.ok) {
        showFeedback("Correct!", "success");
        body.querySelector("[data-ex-actions]").innerHTML = `
          ${exercise.explanation ? `<p class="ex-explain">${escapeHtml(exercise.explanation)}</p>` : ""}
          <button type="button" class="btn btn--primary" data-ex-done>Done</button>`;
        body.querySelector("[data-ex-done]").addEventListener("click", close);
        body.querySelector("[data-ex-done]").focus();
      } else {
        showFeedback(result.message, result.tone === "neutral" ? "neutral" : "danger");
      }
    }

    function render() {
      body.innerHTML = `
        <p class="ex-prompt">${escapeHtml(exercise.prompt)}</p>
        <div data-ex-editor></div>
        <div class="ex-feedback" data-ex-feedback></div>
        <div class="ex-actions" data-ex-actions>
          <button type="button" class="btn btn--primary" data-ex-submit>Run check</button>
          ${exercise.hint ? '<button type="button" class="btn btn--secondary" data-ex-hint>Show hint</button>' : ""}
        </div>
        ${
          exercise.hint
            ? `<p class="ex-hint" data-ex-hint-text hidden><strong>Hint: </strong>${escapeHtml(exercise.hint)}</p>`
            : ""
        }`;

      textarea = buildEditor(body.querySelector("[data-ex-editor]"), exercise);
      body.querySelector("[data-ex-submit]").addEventListener("click", submit);

      const hintButton = body.querySelector("[data-ex-hint]");
      if (hintButton) {
        hintButton.addEventListener("click", () => {
          body.querySelector("[data-ex-hint-text]").hidden = false;
          hintButton.disabled = true;
          hintButton.textContent = "Hint shown";
        });
      }

      textarea.focus();
    }

    function handleKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }

    document.addEventListener("keydown", handleKey);
    overlay.addEventListener("mousedown", (event) => {
      if (event.target === overlay) {
        close();
      }
    });
    overlay.querySelector("[data-ex-close]").addEventListener("click", close);

    render();
    dialog.focus({ preventScroll: true });
  }

  return { openExercise, renderCourseLists, renderRecommended, runBoot };
})();
