/* ==========================================================================
   Pung Academy — chapter page runtime
   --------------------------------------------------------------------------
   Shared by all ten chapter pages. Each page declares only its chapter
   number (<body data-chapter="3">) and its written tutorial content; this
   file supplies everything that would otherwise be copied ten times:

     - the access guard that blocks locked chapters
     - the chapter header and progress indicator
     - the video slot (real player, or a clearly marked placeholder)
     - the exercise, its code editor, validation, hints and feedback
     - the completion checklist, Complete Chapter button and course-complete
       screen
     - previous / next chapter navigation
   ========================================================================== */

(function () {
  "use strict";

  var Courses = window.PungCourses;
  var chapterNumber = Number(document.body.getAttribute("data-chapter"));

  if (!Courses || !chapterNumber) {
    return;
  }

  var chapter = Courses.getChapter(chapterNumber);
  if (!chapter) {
    return;
  }

  /* State that only matters while the page is open. */
  var materialViewed = Courses.isChapterCompleted(chapterNumber);
  var exercisePassed = Courses.isExerciseCompleted(chapterNumber);

  /* ==================================================================
     Small helpers
     ================================================================== */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function find(selector) {
    return document.querySelector(selector);
  }

  /* ==================================================================
     1. Access guard — enforced here, not just visually
     ================================================================== */
  function enforceAccess() {
    if (Courses.isChapterUnlocked(chapterNumber)) {
      return true;
    }

    var content = find("[data-lesson-content]");
    if (content) {
      content.hidden = true;
    }

    var guard = find("[data-lesson-guard]");
    if (!guard) {
      window.location.replace(Courses.courseUrl());
      return false;
    }

    guard.hidden = false;
    guard.innerHTML = "";

    var panel = el("div", "locked-panel");
    panel.appendChild(el("p", "locked-panel__icon", "🔒"));
    panel.appendChild(
      el("h1", "locked-panel__title", "This chapter is locked")
    );
    panel.appendChild(
      el(
        "p",
        "locked-panel__text",
        "Complete Chapter " +
          (chapterNumber - 1) +
          " — " +
          Courses.getChapter(chapterNumber - 1).title +
          " — to unlock Chapter " +
          chapterNumber +
          "."
      )
    );

    var actions = el("div", "locked-panel__actions");

    var back = el("a", "btn btn--primary", "Back to the course");
    back.href = Courses.courseUrl();
    actions.appendChild(back);

    var previous = el(
      "a",
      "btn btn--secondary",
      "Go to Chapter " + (chapterNumber - 1)
    );
    previous.href = Courses.chapterUrl(chapterNumber - 1);
    actions.appendChild(previous);

    panel.appendChild(actions);
    guard.appendChild(panel);

    document.title =
      "Chapter " + chapterNumber + " locked — Pung Academy";
    return false;
  }

  /* ==================================================================
     2. Chapter header + progress
     ================================================================== */
  function renderHeader() {
    var numberSlot = find("[data-chapter-number]");
    if (numberSlot) {
      numberSlot.textContent = "Chapter " + chapterNumber + " of " + Courses.TOTAL_CHAPTERS;
    }

    var titleSlot = find("[data-chapter-title]");
    if (titleSlot) {
      titleSlot.textContent = chapter.title;
    }

    var summarySlot = find("[data-chapter-summary]");
    if (summarySlot) {
      summarySlot.textContent = chapter.summary;
    }

    var barFill = find("[data-course-progress-fill]");
    if (barFill) {
      barFill.style.width = Courses.progressPercent() + "%";
    }

    var progressText = find("[data-course-progress-text]");
    if (progressText) {
      progressText.textContent =
        Courses.completedCount() +
        " / " +
        Courses.TOTAL_CHAPTERS +
        " chapters completed";
    }

    var topicsSlot = find("[data-chapter-topics]");
    if (topicsSlot && chapter.topics) {
      chapter.topics.forEach(function (topic) {
        topicsSlot.appendChild(el("li", null, topic));
      });
    }
  }

  /* ==================================================================
     3. Video slot
     ================================================================== */
  function renderVideo() {
    var slot = find("[data-video-slot]");
    if (!slot) {
      return;
    }

    if (chapter.videoId) {
      var frame = el("div", "video-frame");
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube.com/embed/" + chapter.videoId;
      iframe.title = chapter.videoTitle || chapter.title;
      iframe.setAttribute("loading", "lazy");
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
    var placeholder = el("div", "video-placeholder");
    placeholder.appendChild(el("span", "video-placeholder__icon", "▶"));
    placeholder.appendChild(
      el("p", "video-placeholder__title", "Video lesson not set yet")
    );
    placeholder.appendChild(
      el(
        "p",
        "video-placeholder__text",
        "No video has been chosen for this chapter. Add a YouTube id to " +
          "chapters[" +
          chapterNumber +
          "].videoId in js/courses.js and the player will appear here."
      )
    );
    placeholder.appendChild(
      el("p", "video-placeholder__note", "The written lesson below is complete — carry on reading.")
    );
    slot.appendChild(placeholder);
  }

  /* ==================================================================
     4. Exercise
     ================================================================== */

  var feedbackNode = null;
  var hintNode = null;

  function renderExercise() {
    var mount = find("[data-exercise]");
    if (!mount || !chapter.exercise) {
      return;
    }

    var ex = chapter.exercise;
    var wrap = el("div", "exercise");

    wrap.appendChild(el("h2", "exercise__heading", ex.heading || "Exercise"));
    wrap.appendChild(el("p", "exercise__prompt", ex.prompt));

    var form = el("form", "exercise__form");
    form.noValidate = true;

    if (ex.kind === "choice") {
      buildChoiceInputs(form, ex);
    } else {
      buildCodeEditor(form, ex);
    }

    var actions = el("div", "exercise__actions");

    var submit = el("button", "btn btn--primary", ex.kind === "choice" ? "Check answer" : "Run check");
    submit.type = "submit";
    actions.appendChild(submit);

    var hintButton = el("button", "btn btn--secondary", "Show hint");
    hintButton.type = "button";
    actions.appendChild(hintButton);

    form.appendChild(actions);

    feedbackNode = el("p", "feedback");
    feedbackNode.setAttribute("role", "status");
    feedbackNode.hidden = true;
    form.appendChild(feedbackNode);

    hintNode = el("div", "hint");
    hintNode.hidden = true;
    hintNode.appendChild(el("strong", null, "Hint: "));
    hintNode.appendChild(document.createTextNode(ex.hint || ""));
    form.appendChild(hintNode);

    hintButton.addEventListener("click", function () {
      hintNode.hidden = false;
      hintButton.disabled = true;
      hintButton.textContent = "Hint shown";
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      checkAnswer(form, ex);
    });

    wrap.appendChild(form);
    mount.appendChild(wrap);

    /* Returning after a pass: show the solved state straight away. */
    if (exercisePassed) {
      showCorrect(ex, true);
    }
  }

  /* ---------------------- multiple choice ---------------------- */
  function buildChoiceInputs(form, ex) {
    var list = el("div", "choices");
    ex.choices.forEach(function (label, index) {
      var id = "choice-" + index;

      var row = el("label", "choice");
      row.setAttribute("for", id);

      var input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.id = id;
      input.value = String(index);
      input.className = "choice__input";

      row.appendChild(input);
      row.appendChild(el("span", "choice__label", label));
      list.appendChild(row);
    });
    form.appendChild(list);
  }

  /* ------------------------ code editor ------------------------
     Deliberately simple: a textarea with a synced line-number gutter and
     sane Tab handling. No external editor library, and no pretence that
     the code is being executed.
     ------------------------------------------------------------- */
  function buildCodeEditor(form, ex) {
    var editor = el("div", "editor");

    var bar = el("div", "editor__bar");
    bar.appendChild(el("span", "editor__label", "Python"));
    bar.appendChild(
      el("span", "editor__note", "Checked for concepts — not executed")
    );
    editor.appendChild(bar);

    var body = el("div", "editor__body");
    var gutter = el("div", "editor__gutter");
    var textarea = document.createElement("textarea");
    textarea.className = "editor__input";
    textarea.name = "code";
    textarea.spellcheck = false;
    textarea.setAttribute("aria-label", "Your Python code");
    textarea.value = ex.starter || "";

    function syncGutter() {
      var lines = textarea.value.split("\n").length;
      var out = "";
      for (var i = 1; i <= Math.max(lines, 8); i += 1) {
        out += i + "\n";
      }
      gutter.textContent = out;
    }

    textarea.addEventListener("input", syncGutter);
    textarea.addEventListener("scroll", function () {
      gutter.scrollTop = textarea.scrollTop;
    });

    /* Tab should indent, not jump out of the editor. */
    textarea.addEventListener("keydown", function (event) {
      if (event.key !== "Tab") {
        return;
      }
      event.preventDefault();
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      textarea.value =
        textarea.value.slice(0, start) + "    " + textarea.value.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
      syncGutter();
    });

    body.appendChild(gutter);
    body.appendChild(textarea);
    editor.appendChild(body);
    form.appendChild(editor);

    syncGutter();
  }

  /* ------------------------- validation ------------------------- */

  /**
   * Normalise a submission so formatting differences do not fail a
   * correct answer: curly quotes become straight, tabs become spaces,
   * trailing whitespace goes, line endings are unified.
   */
  function normaliseCode(text) {
    return String(text)
      .replace(/\r\n?/g, "\n")
      .replace(/[‘’‛]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\t/g, "    ")
      .replace(/[ \t]+$/gm, "");
  }

  function checkAnswer(form, ex) {
    if (ex.kind === "choice") {
      var picked = form.querySelector("input[name='answer']:checked");
      if (!picked) {
        showFeedback("Choose an answer first.", "neutral");
        return;
      }
      if (Number(picked.value) === ex.answer) {
        showCorrect(ex, false);
      } else {
        showIncorrect("Not quite. Check your logic and try again.");
      }
      return;
    }

    /* Code exercise: every check must match. */
    var code = normaliseCode(form.elements.code.value);

    /* Ignore the starter comments so an untouched editor cannot pass. */
    var meaningful = code
      .split("\n")
      .filter(function (line) {
        return line.trim() !== "" && line.trim().charAt(0) !== "#";
      })
      .join("\n");

    if (meaningful.trim() === "") {
      showFeedback("Write some code in the editor first.", "neutral");
      return;
    }

    var failed = null;
    for (var i = 0; i < ex.checks.length; i += 1) {
      if (!ex.checks[i].test.test(code)) {
        failed = ex.checks[i];
        break;
      }
    }

    if (failed) {
      showIncorrect("Not quite. Check your logic and try again.", failed.message);
      return;
    }

    showCorrect(ex, false);
  }

  function showFeedback(message, tone) {
    if (!feedbackNode) {
      return;
    }
    feedbackNode.textContent = message;
    feedbackNode.className = "feedback feedback--" + tone;
    feedbackNode.hidden = false;
  }

  function showIncorrect(message, guidance) {
    showFeedback(message, "error");
    if (guidance) {
      feedbackNode.appendChild(el("span", "feedback__detail", guidance));
    }
  }

  function showCorrect(ex, restoring) {
    showFeedback("✓ Correct! Great job.", "success");

    if (!restoring) {
      Courses.markExerciseCompleted(chapterNumber);
    }
    exercisePassed = true;

    /* Reaching and passing the exercise means the material was reached, so
       never let a missed IntersectionObserver leave the chapter
       uncompletable. */
    materialViewed = true;

    /* Once passed, reveal the reasoning and a worked solution. */
    var mount = find("[data-exercise]");
    if (mount && !mount.querySelector(".solved")) {
      var solved = el("div", "solved");
      if (ex.explanation) {
        solved.appendChild(el("p", "solved__text", ex.explanation));
      }
      if (ex.solution) {
        solved.appendChild(el("h3", "solved__heading", "One way to write it"));
        var pre = el("pre", "code-block");
        pre.appendChild(el("code", null, ex.solution));
        solved.appendChild(pre);
      }
      mount.appendChild(solved);
    }

    updateCompletion();
  }

  /* ==================================================================
     5. Completion checklist and button
     ================================================================== */
  function updateCompletion() {
    var viewedItem = find("[data-check-viewed]");
    if (viewedItem) {
      viewedItem.classList.toggle("check--done", materialViewed);
      var viewedMark = viewedItem.querySelector("[data-check-mark]");
      if (viewedMark) {
        viewedMark.textContent = materialViewed ? "✓" : "○";
      }
    }

    var exerciseItem = find("[data-check-exercise]");
    if (exerciseItem) {
      exerciseItem.classList.toggle("check--done", exercisePassed);
      var exerciseMark = exerciseItem.querySelector("[data-check-mark]");
      if (exerciseMark) {
        exerciseMark.textContent = exercisePassed ? "✓" : "○";
      }
    }

    var button = find("[data-complete-chapter]");
    if (!button) {
      return;
    }

    var alreadyDone = Courses.isChapterCompleted(chapterNumber);
    var ready = materialViewed && exercisePassed;

    if (alreadyDone) {
      button.disabled = true;
      button.textContent = "✓ Chapter completed";
      revealNextStep();
      return;
    }

    button.disabled = !ready;
    button.textContent = ready
      ? "Complete Chapter " + chapterNumber
      : "Complete the exercise to finish this chapter";
  }

  function setupCompleteButton() {
    var button = find("[data-complete-chapter]");
    if (!button) {
      return;
    }

    button.addEventListener("click", function () {
      if (!Courses.completeChapter(chapterNumber)) {
        showFeedback(
          "The exercise has to be passed before this chapter can be completed.",
          "error"
        );
        return;
      }
      updateCompletion();
      renderHeaderProgressOnly();

      if (chapter.isFinalProject && Courses.isCourseComplete()) {
        showCourseComplete();
      } else {
        revealNextStep();
      }
    });
  }

  function renderHeaderProgressOnly() {
    var barFill = find("[data-course-progress-fill]");
    if (barFill) {
      barFill.style.width = Courses.progressPercent() + "%";
    }
    var progressText = find("[data-course-progress-text]");
    if (progressText) {
      progressText.textContent =
        Courses.completedCount() +
        " / " +
        Courses.TOTAL_CHAPTERS +
        " chapters completed";
    }
  }

  /** After completing, point clearly at whatever comes next. */
  function revealNextStep() {
    var slot = find("[data-next-step]");
    if (!slot || slot.dataset.rendered === "true") {
      return;
    }
    slot.dataset.rendered = "true";
    slot.hidden = false;
    slot.innerHTML = "";

    var panel = el("div", "next-step");

    if (chapterNumber < Courses.TOTAL_CHAPTERS) {
      var next = Courses.getChapter(chapterNumber + 1);
      panel.appendChild(el("p", "next-step__label", "Unlocked"));
      panel.appendChild(
        el(
          "h2",
          "next-step__title",
          "Chapter " + (chapterNumber + 1) + " — " + next.title
        )
      );
      panel.appendChild(el("p", "next-step__text", next.summary));

      var go = el("a", "btn btn--primary btn--lg", "Start Chapter " + (chapterNumber + 1));
      go.href = Courses.chapterUrl(chapterNumber + 1);
      panel.appendChild(go);
    } else {
      panel.appendChild(el("p", "next-step__label", "Course finished"));
      panel.appendChild(el("h2", "next-step__title", "You have completed the course"));
      var back = el("a", "btn btn--primary btn--lg", "Back to the roadmap");
      back.href = Courses.roadmapUrl();
      panel.appendChild(back);
    }

    slot.appendChild(panel);
  }

  /* ==================================================================
     6. Course-complete screen (final project only)
     ================================================================== */
  function showCourseComplete() {
    var overlay = el("div", "course-complete");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Course complete");

    var card = el("div", "course-complete__card");
    card.appendChild(el("p", "course-complete__emoji", "🎉"));
    card.appendChild(el("p", "course-complete__label", "Course complete!"));
    card.appendChild(
      el("h2", "course-complete__title", "Introduction to Programming")
    );
    card.appendChild(
      el(
        "p",
        "course-complete__text",
        "You have completed the fundamentals of programming — variables, " +
          "operators, conditions, loops, collections and functions, all the " +
          "way through to a working project of your own."
      )
    );
    card.appendChild(
      el(
        "p",
        "course-complete__text",
        "Both career paths on the roadmap are now unlocked. You can choose your next direction."
      )
    );

    var go = el("a", "btn btn--primary btn--lg", "Continue");
    go.href = Courses.roadmapUrl();
    card.appendChild(go);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    go.focus();
  }

  /* ==================================================================
     7. Chapter navigation + "material viewed" tracking
     ================================================================== */
  function renderChapterNav() {
    var slot = find("[data-chapter-nav]");
    if (!slot) {
      return;
    }

    if (chapterNumber > 1) {
      var prev = el("a", "chapter-nav__link", "← Chapter " + (chapterNumber - 1));
      prev.href = Courses.chapterUrl(chapterNumber - 1);
      slot.appendChild(prev);
    }

    var course = el("a", "chapter-nav__link", "All chapters");
    course.href = Courses.courseUrl();
    slot.appendChild(course);

    if (chapterNumber < Courses.TOTAL_CHAPTERS) {
      var next = el("a", "chapter-nav__link", "Chapter " + (chapterNumber + 1) + " →");
      if (Courses.isChapterUnlocked(chapterNumber + 1)) {
        next.href = Courses.chapterUrl(chapterNumber + 1);
      } else {
        next.classList.add("chapter-nav__link--locked");
        next.setAttribute("aria-disabled", "true");
        next.href = "#";
        next.title = "Complete this chapter first";
        next.addEventListener("click", function (event) {
          event.preventDefault();
        });
        next.textContent = "🔒 Chapter " + (chapterNumber + 1);
      }
      slot.appendChild(next);
    }
  }

  /**
   * "Material viewed" ticks when the exercise scrolls into view — by then
   * the learner has passed the whole written lesson.
   */
  function trackMaterialViewed() {
    if (materialViewed) {
      updateCompletion();
      return;
    }

    var marker = find("[data-exercise]");
    if (!marker || typeof window.IntersectionObserver !== "function") {
      materialViewed = true;
      updateCompletion();
      return;
    }

    var observer = new window.IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            materialViewed = true;
            updateCompletion();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(marker);
  }

  /* ==================================================================
     Boot
     ================================================================== */
  if (!enforceAccess()) {
    return;
  }

  renderHeader();
  renderVideo();
  renderExercise();
  renderChapterNav();
  setupCompleteButton();
  updateCompletion();
  trackMaterialViewed();
})();
