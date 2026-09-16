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

  /* Sidebar state marks. Line icons rather than ✓/🔒 glyphs so they sit on
     the 18px disc at a predictable size on every platform. */
  const ICON_CHECK =
    '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';
  const ICON_LOCK =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

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

  /* -------------------------------------------------------- sidebar layout
     Restructures the page into a slim breadcrumb bar + two-column body
     (reading column + a "course content" sidebar), entirely by relocating
     elements that already exist in every lesson's static HTML — nothing
     here is deleted, so renderHeader/renderCourseProgress/renderCompletion
     etc. keep finding the same nodes with the same querySelector calls no
     matter where they end up. No lesson HTML file needs to change.

     - The title/summary/topics move from the old full-width tinted header
       band into the top of the reading column.
     - What's left of that header band becomes the slim breadcrumb bar
       (back link + progress), matching the course's own overview page.
     - The sidebar itself is filled separately by renderSidebarNav(). */
  function applySidebarLayout(courseTitle, chapterNumber, total) {
    const lesson = document.querySelector(".lesson");
    const header = document.querySelector(".lesson-header");
    if (!lesson || !header || lesson.parentElement?.classList.contains("lesson-layout")) {
      return;
    }

    const eyebrow = header.querySelector("[data-chapter-number]");
    const title = header.querySelector("[data-chapter-title]");
    const summary = header.querySelector("[data-chapter-summary]");
    const topics = header.querySelector("[data-chapter-topics]");
    const progressBlock = header.querySelector(".lesson-header__progress");

    const intro = el("div", "lesson-intro");
    [eyebrow, title, summary, topics].forEach((node) => {
      if (node) {
        intro.appendChild(node);
      }
    });
    lesson.insertBefore(intro, lesson.firstChild);

    /* What's left of .lesson-header becomes the slim breadcrumb bar. */
    header.className = "lesson-breadcrumb";
    header.innerHTML = "";
    const back = el("a", "lesson-breadcrumb__back", "← Back to course");
    back.href = routes.courseOverview(document.body.getAttribute("data-course") || undefined);
    header.appendChild(back);
    header.appendChild(
      el("span", "lesson-breadcrumb__trail", `${courseTitle} / Lesson ${chapterNumber} of ${total}`)
    );
    if (progressBlock) {
      progressBlock.className = "lesson-breadcrumb__progress";
      header.appendChild(progressBlock);
    }

    const layout = el("div", "lesson-layout");
    lesson.parentElement.insertBefore(layout, lesson);
    layout.appendChild(lesson);

    const sidebar = el("aside", "lesson-sidebar");
    sidebar.setAttribute("data-lesson-sidebar", "");
    layout.appendChild(sidebar);
  }

  /** Fills the sidebar built by applySidebarLayout() with a compact,
   * linkable list of every chapter in the course — the same completed/
   * current/locked states CourseOverviewView shows on the full course
   * page, just condensed to icon + title. */
  function renderSidebarNav(rows, currentNumber, courseId) {
    const sidebar = document.querySelector("[data-lesson-sidebar]");
    if (!sidebar) {
      return;
    }
    sidebar.innerHTML = "";
    sidebar.appendChild(el("span", "lesson-sidebar__label", "Course content"));

    const list = el("div", "lesson-nav");
    rows.forEach(({ number, data, state }) => {
      const isCurrent = number === currentNumber;
      /* chapterState() calls every reachable chapter "current"; only the one
         being read actually is. The rest are "unlocked" — reachable, not yet
         started — which the sidebar draws as an empty ring. */
      const rowState = isCurrent ? "current" : state === "current" ? "unlocked" : state;
      const row = el(
        isCurrent || state === "locked" ? "div" : "a",
        `lesson-nav__row lesson-nav__row--${rowState}`
      );
      if (!isCurrent && state !== "locked") {
        row.href = routes.chapter(number, courseId);
      }

      const mark = el("span", "lesson-nav__mark");
      if (state === "completed") {
        mark.innerHTML = ICON_CHECK;
      } else if (state === "locked") {
        mark.innerHTML = ICON_LOCK;
      } else {
        mark.textContent = String(number);
      }
      row.appendChild(mark);
      row.appendChild(el("span", "lesson-nav__title", `${number}. ${data.title}`));
      list.appendChild(row);
    });

    sidebar.appendChild(list);
  }

  /* ------------------------------------------------------------ locked guard */

  function renderLockedScreen(chapterNumber, previousTitle, courseId) {
    document.querySelector("[data-lesson-content]")?.setAttribute("hidden", "");

    const guard = document.querySelector("[data-lesson-guard]");
    if (!guard) {
      window.location.replace(routes.courseOverview(courseId));
      return;
    }

    guard.hidden = false;
    guard.innerHTML = "";

    const panel = el("div", "locked-panel");
    const lockIcon = el("p", "locked-panel__icon");
    lockIcon.innerHTML = ICON_LOCK;
    panel.appendChild(lockIcon);
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
    back.href = routes.courseOverview(courseId);
    const previous = el("a", "btn btn--secondary", `Go to Chapter ${chapterNumber - 1}`);
    previous.href = routes.chapter(chapterNumber - 1, courseId);
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
      /* Plain youtube.com, not youtube-nocookie.com: the nocookie host
         validates the embedding page more strictly and fails with "Error
         153" whenever the browser sends no Referer — which is exactly what
         happens when a lesson is opened straight off disk as a file:// URL.
         rel=0 keeps end-screen suggestions within the same channel rather
         than sending a beginner into the recommendation feed. */
      iframe.src = `https://www.youtube.com/embed/${chapter.videoId}?rel=0`;
      iframe.title = chapter.videoTitle || chapter.title;
      iframe.loading = "lazy";
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute(
        "allow",
        "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      );
      frame.appendChild(iframe);
      slot.appendChild(frame);

      /* Some uploaders disable embedding entirely. The player then renders
         its own "Watch on YouTube" error inside the frame and nothing plays
         here, which looks like a broken page — so always offer a way out. */
      const fallback = el("p", "video-frame__fallback");
      const link = el("a", null, "Trouble playing? Watch it on YouTube ↗");
      link.href = `https://www.youtube.com/watch?v=${chapter.videoId}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      fallback.appendChild(link);
      slot.appendChild(fallback);
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

  /* Per-block feedback/hint nodes for multi-exercise chapters (see
     renderExerciseSet below), keyed by exercise index or the string
     "challenge" — kept separate from the singular nodes above so the two
     rendering paths never interfere with each other. */
  let setFeedbackNodes = null;
  let setHintNodes = null;

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

    buildExerciseInput(form, exercise);

    const actions = el("div", "exercise__actions");
    const submit = el(
      "button",
      "btn btn--primary",
      exercise.kind === "code" ? "Run check" : "Check answer"
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

  /** Routes an exercise to the input builder matching its kind. */
  function buildExerciseInput(form, exercise) {
    if (exercise.kind === "choice") {
      return buildChoices(form, exercise);
    }
    if (exercise.kind === "text") {
      return buildTextInput(form, exercise);
    }
    if (exercise.kind === "order") {
      return buildOrderList(form, exercise);
    }
    return buildEditor(form, exercise); // "code"
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

  /** A single exact-answer text field, for "text" kind exercises. */
  function buildTextInput(form, exercise) {
    const input = document.createElement("input");
    input.type = "text";
    input.name = "answer";
    input.className = "text-input";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = exercise.placeholder || "Type your answer";
    form.appendChild(input);
  }

  /* A shuffled list of items, each given a position <select> (1..N) instead
     of drag-and-drop, since no such library exists in this codebase. Used
     for "order" kind exercises (e.g. arranging Git commands correctly). */
  function buildOrderList(form, exercise) {
    const list = el("div", "order-list");
    const shuffled = exercise.items
      .map((label, originalIndex) => ({ label, originalIndex }))
      .sort(() => Math.random() - 0.5);

    shuffled.forEach(({ label, originalIndex }) => {
      const row = el("div", "order-item");
      row.appendChild(el("span", "order-item__label", label));

      const select = document.createElement("select");
      select.className = "order-item__select";
      select.dataset.orderSelect = "true";
      select.dataset.originalIndex = String(originalIndex);
      select.setAttribute("aria-label", `Position for: ${label}`);
      select.appendChild(new Option("Position…", ""));
      exercise.items.forEach((_, i) => select.appendChild(new Option(String(i + 1), String(i + 1))));

      row.appendChild(select);
      list.appendChild(row);
    });

    form.appendChild(list);
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

  /* ------------------------------------------------------------ exercise set
     Chapters with several exercises plus one distinct "module challenge"
     (instead of a single `exercise`) render through here. Mounts into the
     same [data-exercise] node renderExercise uses — that node is also
     LessonController's trackMaterialViewed IntersectionObserver target, so
     mounting anywhere else would silently break "material viewed" tracking. */

  function renderExerciseSet(exercises, challenge, callbacks) {
    const mount = document.querySelector("[data-exercise]");
    if (!mount) {
      return;
    }

    setFeedbackNodes = new Map();
    setHintNodes = new Map();

    const {
      initialPassed = [],
      initialChallengePassed = false,
      onSubmitExercise,
      onSubmitChallenge,
    } = callbacks;

    const list = el("div", "exercise-set");

    exercises.forEach((exercise, index) => {
      const block = buildExerciseBlock(exercise, index, `Exercise ${index + 1}`, (form) =>
        onSubmitExercise(index, form)
      );
      list.appendChild(block);
      if (initialPassed[index]) {
        showFeedbackAt(index, "✓ Correct! Great job.", "success");
        showSolvedAt(index, exercise);
        disableBlockInputs(block);
      }
    });

    if (challenge) {
      const challengeBlock = buildExerciseBlock(
        challenge,
        "challenge",
        "Module challenge",
        (form) => onSubmitChallenge(form)
      );
      challengeBlock.classList.add("exercise-set__challenge");
      list.appendChild(challengeBlock);
      if (initialChallengePassed) {
        showFeedbackAt("challenge", "✓ Correct! Great job.", "success");
        showSolvedAt("challenge", challenge);
        disableBlockInputs(challengeBlock);
      }
    }

    mount.appendChild(list);
  }

  function buildExerciseBlock(exercise, id, defaultHeading, onSubmit) {
    const wrap = el("div", "exercise");
    wrap.appendChild(el("h3", "exercise__heading", exercise.heading || defaultHeading));
    wrap.appendChild(el("p", "exercise__prompt", exercise.prompt));

    const form = el("form", "exercise__form");
    form.noValidate = true;

    buildExerciseInput(form, exercise);

    const actions = el("div", "exercise__actions");
    const submit = el(
      "button",
      "btn btn--primary",
      exercise.kind === "code" ? "Run check" : "Check answer"
    );
    submit.type = "submit";

    const hintButton = el("button", "btn btn--secondary", "Show hint");
    hintButton.type = "button";
    actions.append(submit, hintButton);
    form.appendChild(actions);

    const blockFeedback = el("p", "feedback");
    blockFeedback.setAttribute("role", "status");
    blockFeedback.hidden = true;
    form.appendChild(blockFeedback);
    setFeedbackNodes.set(id, blockFeedback);

    const blockHint = el("div", "hint");
    blockHint.hidden = true;
    blockHint.appendChild(el("strong", null, "Hint: "));
    blockHint.appendChild(document.createTextNode(exercise.hint || ""));
    form.appendChild(blockHint);
    setHintNodes.set(id, blockHint);

    hintButton.addEventListener("click", () => {
      blockHint.hidden = false;
      hintButton.disabled = true;
      hintButton.textContent = "Hint shown";
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      onSubmit(form);
    });

    wrap.appendChild(form);
    return wrap;
  }

  function showFeedbackAt(id, message, tone) {
    const node = setFeedbackNodes?.get(id);
    if (!node) {
      return;
    }
    node.textContent = message;
    node.className = `feedback feedback--${tone}`;
    node.hidden = false;
  }

  function showIncorrectAt(id, message, guidance) {
    showFeedbackAt(id, message, "error");
    const node = setFeedbackNodes?.get(id);
    if (guidance && node) {
      node.appendChild(el("span", "feedback__detail", guidance));
    }
  }

  function showSolvedAt(id, exercise) {
    const node = setFeedbackNodes?.get(id);
    const form = node?.closest("form");
    if (!form || form.querySelector(".solved")) {
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
    form.appendChild(solved);
  }

  /** Freezes an already-solved block's inputs so it can't be resubmitted. */
  function disableBlockInputs(block) {
    block.querySelectorAll("input, textarea, select, button").forEach((node) => {
      node.disabled = true;
    });
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

  function renderNextStep(chapterNumber, total, nextChapterData, courseId) {
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
      go.href = routes.chapter(chapterNumber + 1, courseId);
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

  /**
   * @param {Object} options
   * @param {string} options.title course title, e.g. "Artificial Intelligence"
   * @param {string|string[]} [options.message] one or more body paragraphs,
   *   specific to that course — every course supplies its own via
   *   `courseData.js`'s `completionMessage`, since "you finished the
   *   fundamentals" doesn't describe finishing the AI or Software
   *   Engineering tracks.
   */
  function showCourseComplete({ title, message }) {
    const overlay = el("div", "course-complete");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Course complete");

    const card = el("div", "course-complete__card");
    card.appendChild(el("p", "course-complete__emoji", "🎉"));
    card.appendChild(el("p", "course-complete__label", "Course complete!"));
    card.appendChild(el("h2", "course-complete__title", title));

    const paragraphs = Array.isArray(message) ? message : [message].filter(Boolean);
    paragraphs.forEach((text) => {
      card.appendChild(el("p", "course-complete__text", text));
    });

    const go = el("a", "btn btn--primary btn--lg", "Continue");
    go.href = routes.courseTree();
    card.appendChild(go);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    go.focus();
  }

  /* ------------------------------------------------------------ chapter nav */

  function renderChapterNav(chapterNumber, total, isNextUnlocked, courseId) {
    const slot = document.querySelector("[data-chapter-nav]");
    if (!slot) {
      return;
    }
    slot.innerHTML = "";

    if (chapterNumber > 1) {
      const prev = el("a", "chapter-nav__link", `← Chapter ${chapterNumber - 1}`);
      prev.href = routes.chapter(chapterNumber - 1, courseId);
      slot.appendChild(prev);
    }

    const overview = el(
      "a",
      "chapter-nav__link chapter-nav__link--plain",
      "All chapters"
    );
    overview.href = routes.courseOverview(courseId);
    slot.appendChild(overview);

    if (chapterNumber < total) {
      const next = el(
        "a",
        "chapter-nav__link chapter-nav__link--next",
        `Chapter ${chapterNumber + 1} →`
      );
      if (isNextUnlocked) {
        next.href = routes.chapter(chapterNumber + 1, courseId);
      } else {
        next.className = "chapter-nav__link chapter-nav__link--locked";
        next.setAttribute("aria-disabled", "true");
        next.href = "#";
        next.title = "Complete this chapter first";
        next.innerHTML = `${ICON_LOCK}<span>Chapter ${chapterNumber + 1}</span>`;
        next.addEventListener("click", (event) => event.preventDefault());
      }
      slot.appendChild(next);
    }
  }

  /**
   * Wire up every "predict the output" box in the lesson body: clicking
   * reveal shows the paired answer and disables the button.
   */
  function bindPredictWidgets() {
    document.querySelectorAll("[data-predict-reveal]").forEach((button) => {
      button.addEventListener("click", () => {
        const box = button.closest(".predict");
        const answer = box && box.querySelector("[data-predict-answer]");
        if (!answer) return;
        answer.hidden = false;
        button.disabled = true;
        button.textContent = "Revealed";
      });
    });
  }

  return { applySidebarLayout, bindPredictWidgets, renderChapterNav, renderCompletion, renderCourseProgress, renderExercise, renderExerciseSet, renderHeader, renderLockedScreen, renderNextStep, renderSidebarNav, renderVideo, showCourseComplete, showFeedback, showFeedbackAt, showIncorrect, showIncorrectAt, showSolved, showSolvedAt };
})();
