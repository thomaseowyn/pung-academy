/* ==========================================================================
   LessonView
   --------------------------------------------------------------------------
   Everything a chapter page draws: the header, the video slot, the exercise
   and its editor, feedback, the completion checklist and the course-complete
   screen. DOM only — LessonController decides when each is called and what
   the answers mean.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.LessonView = (function () {
  "use strict";

  const { routes } = Pung.PathService;

  /* ------------------------------------------------------------- small utils */

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  /* ------------------------------------------------------------ locked guard */

  function renderLockedScreen(chapterNumber, previousTitle) {
    document.querySelector("[data-lesson-content]")?.setAttribute("hidden", "");

    const guard = document.querySelector("[data-lesson-guard]");
    if (!guard) {
      window.location.replace(routes.courseOverview());
      return;
    }

    guard.hidden = false;
    guard.innerHTML = "";

    const panel = el("div", "locked-panel");
    panel.appendChild(el("p", "locked-panel__icon", "🔒"));
    panel.appendChild(el("h1", "locked-panel__title", "This chapter is locked"));
    panel.appendChild(
      el(
        "p",
        "locked-panel__text",
        `Complete Chapter ${chapterNumber - 1} — ${previousTitle} — to unlock Chapter ${chapterNumber}.`
      )
    );

    const actions = el("div", "locked-panel__actions");
    const back = el("a", "btn btn--primary", "Back to the course");
    back.href = routes.courseOverview();
    const previous = el("a", "btn btn--secondary", `Go to Chapter ${chapterNumber - 1}`);
    previous.href = routes.chapter(chapterNumber - 1);
    actions.append(back, previous);

    panel.appendChild(actions);
    guard.appendChild(panel);

    document.title = `Chapter ${chapterNumber} locked — Pung Academy`;
  }

  /* ------------------------------------------------------------------ header */

  function renderHeader(chapterNumber, chapter, total) {
    const set = (selector, value) => {
      const node = document.querySelector(selector);
      if (node) {
        node.textContent = value;
      }
    };

    set("[data-chapter-number]", `Chapter ${chapterNumber} of ${total}`);
    set("[data-chapter-title]", chapter.title);
    set("[data-chapter-summary]", chapter.summary);

    const topics = document.querySelector("[data-chapter-topics]");
    if (topics && chapter.topics) {
      topics.innerHTML = "";
      chapter.topics.forEach((topic) => topics.appendChild(el("li", null, topic)));
    }
  }

  function renderCourseProgress({ completed, total, percent }) {
    const fill = document.querySelector("[data-course-progress-fill]");
    if (fill) {
      fill.style.width = `${percent}%`;
    }
    const text = document.querySelector("[data-course-progress-text]");
    if (text) {
      text.textContent = `${completed} / ${total} chapters completed`;
    }
  }

  /* ------------------------------------------------------------------- video */

  function renderVideo(chapterNumber, chapter) {
    const slot = document.querySelector("[data-video-slot]");
    if (!slot) {
      return;
    }

    if (chapter.videoId) {
      const frame = el("div", "video-frame");
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${chapter.videoId}`;
      iframe.title = chapter.videoTitle || chapter.title;
      iframe.loading = "lazy";
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute(
        "allow",
        "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      );
      frame.appendChild(iframe);
      slot.appendChild(frame);
      return;
    }

    /* No verified id yet — say so plainly rather than embedding a dead player. */
    const placeholder = el("div", "video-placeholder");
    placeholder.appendChild(el("span", "video-placeholder__icon", "▶"));
    placeholder.appendChild(
      el("p", "video-placeholder__title", "Video lesson not set yet")
    );
    placeholder.appendChild(
      el(
        "p",
        "video-placeholder__text",
        `No video has been chosen for this chapter. Add a YouTube id to chapters[${chapterNumber}].videoId in js/config/courseData.js and the player will appear here.`
      )
    );
    placeholder.appendChild(
      el(
        "p",
        "video-placeholder__note",
        "The written lesson below is complete — carry on reading."
      )
    );
    slot.appendChild(placeholder);
  }

  /* ---------------------------------------------------------------- exercise */

  let feedbackNode = null;
  let hintNode = null;

  /**
   * Build the exercise UI.
   * @param {Function} onSubmit called with the form element
   */
  function renderExercise(exercise, onSubmit) {
    const mount = document.querySelector("[data-exercise]");
    if (!mount || !exercise) {
      return null;
    }

    const wrap = el("div", "exercise");
    wrap.appendChild(el("h2", "exercise__heading", exercise.heading || "Exercise"));
    wrap.appendChild(el("p", "exercise__prompt", exercise.prompt));

    const form = el("form", "exercise__form");
    form.noValidate = true;

    if (exercise.kind === "choice") {
      buildChoices(form, exercise);
    } else {
      buildEditor(form, exercise);
    }

    const actions = el("div", "exercise__actions");
    const submit = el(
      "button",
      "btn btn--primary",
      exercise.kind === "choice" ? "Check answer" : "Run check"
    );
    submit.type = "submit";

    const hintButton = el("button", "btn btn--secondary", "Show hint");
    hintButton.type = "button";
    actions.append(submit, hintButton);
    form.appendChild(actions);

    feedbackNode = el("p", "feedback");
    feedbackNode.setAttribute("role", "status");
    feedbackNode.hidden = true;
    form.appendChild(feedbackNode);

    hintNode = el("div", "hint");
    hintNode.hidden = true;
    hintNode.appendChild(el("strong", null, "Hint: "));
    hintNode.appendChild(document.createTextNode(exercise.hint || ""));
    form.appendChild(hintNode);

    hintButton.addEventListener("click", () => {
      hintNode.hidden = false;
      hintButton.disabled = true;
      hintButton.textContent = "Hint shown";
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      onSubmit(form);
    });

    wrap.appendChild(form);
    mount.appendChild(wrap);
    return form;
  }

  function buildChoices(form, exercise) {
    const list = el("div", "choices");
    exercise.choices.forEach((label, index) => {
      const id = `choice-${index}`;
      const row = el("label", "choice");
      row.setAttribute("for", id);

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.id = id;
      input.value = String(index);
      input.className = "choice__input";

      row.append(input, el("span", "choice__label", label));
      list.appendChild(row);
    });
    form.appendChild(list);
  }

  /* A textarea plus a synced line-number gutter. No editor library, and no
     pretence that the code is executed. */
  function buildEditor(form, exercise) {
    const editor = el("div", "editor");

    const bar = el("div", "editor__bar");
    bar.append(
      el("span", "editor__label", "Python"),
      el("span", "editor__note", "Checked for concepts — not executed")
    );
    editor.appendChild(bar);

    const body = el("div", "editor__body");
    const gutter = el("div", "editor__gutter");
    const textarea = document.createElement("textarea");
    textarea.className = "editor__input";
    textarea.name = "code";
    textarea.spellcheck = false;
    textarea.setAttribute("aria-label", "Your Python code");
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
      textarea.value =
        textarea.value.slice(0, start) + "    " + textarea.value.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
      syncGutter();
    });

    body.append(gutter, textarea);
    editor.appendChild(body);
    form.appendChild(editor);
    syncGutter();
  }

  /* ---------------------------------------------------------------- feedback */

  function showFeedback(message, tone) {
    if (!feedbackNode) {
      return;
    }
    feedbackNode.textContent = message;
    feedbackNode.className = `feedback feedback--${tone}`;
    feedbackNode.hidden = false;
  }

  function showIncorrect(message, guidance) {
    showFeedback(message, "error");
    if (guidance && feedbackNode) {
      feedbackNode.appendChild(el("span", "feedback__detail", guidance));
    }
  }

  /** Reveal the reasoning and a worked solution once the exercise is passed. */
  function showSolved(exercise) {
    const mount = document.querySelector("[data-exercise]");
    if (!mount || mount.querySelector(".solved")) {
      return;
    }
    const solved = el("div", "solved");
    if (exercise.explanation) {
      solved.appendChild(el("p", "solved__text", exercise.explanation));
    }
    if (exercise.solution) {
      solved.appendChild(el("h3", "solved__heading", "One way to write it"));
      const pre = el("pre", "code-block");
      pre.appendChild(el("code", null, exercise.solution));
      solved.appendChild(pre);
    }
    mount.appendChild(solved);
  }

  /* -------------------------------------------------------------- completion */

  function renderCompletion({ materialViewed, exercisePassed, alreadyDone, chapterNumber }) {
    const tick = (selector, done) => {
      const item = document.querySelector(selector);
      if (!item) {
        return;
      }
      item.classList.toggle("check--done", done);
      const mark = item.querySelector("[data-check-mark]");
      if (mark) {
        mark.textContent = done ? "✓" : "○";
      }
    };

    tick("[data-check-viewed]", materialViewed);
    tick("[data-check-exercise]", exercisePassed);

    const button = document.querySelector("[data-complete-chapter]");
    if (!button) {
      return;
    }

    if (alreadyDone) {
      button.disabled = true;
      button.textContent = "✓ Chapter completed";
      return;
    }

    const ready = materialViewed && exercisePassed;
    button.disabled = !ready;
    button.textContent = ready
      ? `Complete Chapter ${chapterNumber}`
      : "Complete the exercise to finish this chapter";
  }

  function renderNextStep(chapterNumber, total, nextChapterData) {
    const slot = document.querySelector("[data-next-step]");
    if (!slot || slot.dataset.rendered === "true") {
      return;
    }
    slot.dataset.rendered = "true";
    slot.hidden = false;
    slot.innerHTML = "";

    const panel = el("div", "next-step");

    if (chapterNumber < total) {
      panel.appendChild(el("p", "next-step__label", "Unlocked"));
      panel.appendChild(
        el("h2", "next-step__title", `Chapter ${chapterNumber + 1} — ${nextChapterData.title}`)
      );
      panel.appendChild(el("p", "next-step__text", nextChapterData.summary));
      const go = el("a", "btn btn--primary btn--lg", `Start Chapter ${chapterNumber + 1}`);
      go.href = routes.chapter(chapterNumber + 1);
      panel.appendChild(go);
    } else {
      panel.appendChild(el("p", "next-step__label", "Course finished"));
      panel.appendChild(el("h2", "next-step__title", "You have completed the course"));
      const back = el("a", "btn btn--primary btn--lg", "Back to the roadmap");
      back.href = routes.courseTree();
      panel.appendChild(back);
    }

    slot.appendChild(panel);
  }

  function showCourseComplete() {
    const overlay = el("div", "course-complete");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Course complete");

    const card = el("div", "course-complete__card");
    card.appendChild(el("p", "course-complete__emoji", "🎉"));
    card.appendChild(el("p", "course-complete__label", "Course complete!"));
    card.appendChild(el("h2", "course-complete__title", "Introduction to Programming"));
    card.appendChild(
      el(
        "p",
        "course-complete__text",
        "You have completed the fundamentals of programming — variables, operators, conditions, loops, collections and functions, all the way through to a working project of your own."
      )
    );
    card.appendChild(
      el(
        "p",
        "course-complete__text",
        "Both career paths on the roadmap are now unlocked. You can choose your next direction."
      )
    );

    const go = el("a", "btn btn--primary btn--lg", "Continue");
    go.href = routes.courseTree();
    card.appendChild(go);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    go.focus();
  }

  /* ------------------------------------------------------------ chapter nav */

  function renderChapterNav(chapterNumber, total, isNextUnlocked) {
    const slot = document.querySelector("[data-chapter-nav]");
    if (!slot) {
      return;
    }
    slot.innerHTML = "";

    if (chapterNumber > 1) {
      const prev = el("a", "chapter-nav__link", `← Chapter ${chapterNumber - 1}`);
      prev.href = routes.chapter(chapterNumber - 1);
      slot.appendChild(prev);
    }

    const overview = el("a", "chapter-nav__link", "All chapters");
    overview.href = routes.courseOverview();
    slot.appendChild(overview);

    if (chapterNumber < total) {
      const next = el("a", "chapter-nav__link", `Chapter ${chapterNumber + 1} →`);
      if (isNextUnlocked) {
        next.href = routes.chapter(chapterNumber + 1);
      } else {
        next.className += " chapter-nav__link--locked";
        next.setAttribute("aria-disabled", "true");
        next.href = "#";
        next.title = "Complete this chapter first";
        next.textContent = `🔒 Chapter ${chapterNumber + 1}`;
        next.addEventListener("click", (event) => event.preventDefault());
      }
      slot.appendChild(next);
    }
  }

  return { renderChapterNav, renderCompletion, renderCourseProgress, renderExercise, renderHeader, renderLockedScreen, renderNextStep, renderVideo, showCourseComplete, showFeedback, showIncorrect, showSolved };
})();
