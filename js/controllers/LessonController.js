/* ==========================================================================
   LessonController
   --------------------------------------------------------------------------
   Drives a chapter page: enforces the access rule, wires the exercise(s) up
   to validation, and records completion.

   The lock is enforced here, not just shown. Opening a locked chapter by
   typing its URL hides the content and renders the locked screen instead.

   A signed-in session is enforced first, before the chapter-lock check —
   an unauthenticated visitor is sent to log in rather than shown either
   the lesson or the "chapter locked" screen.

   Two chapter shapes are supported: a single `chapter.exercise` (Python and
   AI courses), or `chapter.exercises` (array) + an optional `chapter.challenge`
   (Software Engineering course, chapters needing several exercises plus one
   distinct capstone question). The single-exercise path is untouched from
   before this course existed — isMultiExercise gates every difference.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.LessonController = (function () {
  "use strict";

  const { normaliseCode, meaningfulCode } = Pung.ValidationService;
  const { requireLogin } = Pung.AuthController;
  const View = Pung.LessonView;

  function initLessonPage() {
    if (!requireLogin()) {
      return;
    }

    const courseId = document.body.getAttribute("data-course") || Pung.courseData.DEFAULT_COURSE_ID;
    const course = Pung.courseData.courses[courseId];
    const {
      TOTAL_CHAPTERS,
      allChapters,
      chapterState,
      getChapter,
      isChapterUnlocked,
      isChapterCompleted,
      isExerciseCompleted,
      markExerciseCompleted,
      completeChapter,
      completedCount,
      progressPercent,
      isCourseComplete,
      getExerciseProgress,
      markExercisePassedAt,
      markChallengePassed,
    } = Pung.CourseProgressModel.forCourse(courseId);

    const chapterNumber = Number(document.body.getAttribute("data-chapter"));
    const chapter = getChapter(chapterNumber);
    if (!chapterNumber || !chapter) {
      return;
    }

    /* ---- 1. the access rule ---------------------------------------------- */
    if (!isChapterUnlocked(chapterNumber)) {
      View.renderLockedScreen(
        chapterNumber,
        getChapter(chapterNumber - 1)?.title || "",
        courseId
      );
      return;
    }

    const isMultiExercise = Array.isArray(chapter.exercises);

    /* ---- 2. page state ---------------------------------------------------- */
    const progressAtLoad = isMultiExercise ? getExerciseProgress(chapterNumber) : null;
    const state = isMultiExercise
      ? {
          materialViewed: isChapterCompleted(chapterNumber),
          exercisesPassed: chapter.exercises.map((_, i) => !!progressAtLoad.passed[i]),
          challengePassed: !!progressAtLoad.challengePassed,
        }
      : {
          materialViewed: isChapterCompleted(chapterNumber),
          exercisePassed: isExerciseCompleted(chapterNumber),
        };

    /* Single boolean either shape can be reduced to, so refreshCompletion
       and wireCompleteButton below never need to know which shape this
       chapter uses. */
    const allExercisesDone = () =>
      isMultiExercise
        ? state.exercisesPassed.every(Boolean) && (!chapter.challenge || state.challengePassed)
        : state.exercisePassed;

    const refreshCompletion = () =>
      View.renderCompletion({
        materialViewed: state.materialViewed,
        exercisePassed: allExercisesDone(),
        alreadyDone: isChapterCompleted(chapterNumber),
        chapterNumber,
      });

    const refreshProgress = () =>
      View.renderCourseProgress({
        completed: completedCount(),
        total: TOTAL_CHAPTERS,
        percent: progressPercent(),
      });

    /* ---- 3. render -------------------------------------------------------- */
    View.applySidebarLayout(course.title, chapterNumber, TOTAL_CHAPTERS);
    View.renderHeader(chapterNumber, chapter, TOTAL_CHAPTERS);

    const chapterRows = allChapters().map(({ number, data }) => ({
      number,
      data,
      state: chapterState(number),
    }));
    View.renderSidebarNav(chapterRows, chapterNumber, courseId);
    refreshProgress();
    View.renderVideo(chapterNumber, chapter);
    View.renderChapterNav(
      chapterNumber,
      TOTAL_CHAPTERS,
      isChapterUnlocked(chapterNumber + 1),
      courseId
    );

    if (isMultiExercise) {
      View.renderExerciseSet(chapter.exercises, chapter.challenge, {
        initialPassed: state.exercisesPassed,
        initialChallengePassed: state.challengePassed,
        onSubmitExercise: (index, form) => checkExerciseAt(index, form),
        onSubmitChallenge: (form) => checkChallenge(form),
      });
    } else {
      View.renderExercise(chapter.exercise, (form) =>
        checkAnswer(form, chapter.exercise)
      );

      if (state.exercisePassed) {
        View.showFeedback("✓ Correct! Great job.", "success");
        View.showSolved(chapter.exercise);
      }
    }

    refreshCompletion();
    trackMaterialViewed();
    wireCompleteButton();

    if (isChapterCompleted(chapterNumber)) {
      View.renderNextStep(
        chapterNumber,
        TOTAL_CHAPTERS,
        getChapter(chapterNumber + 1),
        courseId
      );
    }

    /* ---- 4. exercise validation --------------------------------------------
       evaluateExercise is pure (no DOM side effects), so both the single-
       exercise path and the per-index/challenge checks below can share it. */
    function evaluateExercise(form, exercise) {
      if (exercise.kind === "choice") {
        const picked = form.querySelector("input[name='answer']:checked");
        if (!picked) {
          return { ok: false, tone: "neutral", message: "Choose an answer first." };
        }
        if (Number(picked.value) === exercise.answer) {
          return { ok: true };
        }
        return { ok: false, message: "Not quite. Check your logic and try again." };
      }

      if (exercise.kind === "text") {
        const raw = form.elements.answer.value;
        const value = raw.trim().toLowerCase();
        if (value === "") {
          return { ok: false, tone: "neutral", message: "Type an answer first." };
        }
        const accepted = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer];
        const ok = accepted.some((expected) =>
          expected instanceof RegExp
            ? expected.test(raw.trim())
            : String(expected).trim().toLowerCase() === value
        );
        return ok
          ? { ok: true }
          : { ok: false, message: "Not quite. Check your answer and try again." };
      }

      if (exercise.kind === "order") {
        const selects = Array.from(form.querySelectorAll("[data-order-select]"));
        const n = selects.length;
        const positions = selects.map((select) => Number(select.value));
        if (positions.some((p) => !p)) {
          return { ok: false, tone: "neutral", message: "Choose a position for every item." };
        }
        if (new Set(positions).size !== n) {
          return { ok: false, message: "Each item needs a different position — check for repeats." };
        }
        const byPosition = new Array(n);
        selects.forEach((select) => {
          byPosition[Number(select.value) - 1] = Number(select.dataset.originalIndex);
        });
        const ok = byPosition.every((originalIndex, i) => originalIndex === i);
        return ok
          ? { ok: true }
          : { ok: false, message: "Not quite the right order. Check your logic and try again." };
      }

      /* kind === "code" */
      const code = normaliseCode(form.elements.code.value);
      if (meaningfulCode(code).trim() === "") {
        return { ok: false, tone: "neutral", message: "Write some code in the editor first." };
      }
      const failed = exercise.checks.find((check) => !check.test.test(code));
      if (failed) {
        return {
          ok: false,
          message: "Not quite. Check your logic and try again.",
          guidance: failed.message,
        };
      }
      return { ok: true };
    }

    function checkAnswer(form, exercise) {
      const result = evaluateExercise(form, exercise);
      if (result.ok) {
        pass(exercise);
      } else if (result.tone === "neutral") {
        View.showFeedback(result.message, "neutral");
      } else {
        View.showIncorrect(result.message, result.guidance);
      }
    }

    function pass(exercise) {
      View.showFeedback("✓ Correct! Great job.", "success");
      markExerciseCompleted(chapterNumber);
      state.exercisePassed = true;

      /* Passing the exercise means the material was reached, so a missed
         IntersectionObserver can never leave the chapter uncompletable. */
      state.materialViewed = true;

      View.showSolved(exercise);
      refreshCompletion();
    }

    function checkExerciseAt(index, form) {
      const exercise = chapter.exercises[index];
      const result = evaluateExercise(form, exercise);
      if (result.ok) {
        passExerciseAt(index, exercise);
      } else if (result.tone === "neutral") {
        View.showFeedbackAt(index, result.message, "neutral");
      } else {
        View.showIncorrectAt(index, result.message, result.guidance);
      }
    }

    function checkChallenge(form) {
      const result = evaluateExercise(form, chapter.challenge);
      if (result.ok) {
        passChallenge(chapter.challenge);
      } else if (result.tone === "neutral") {
        View.showFeedbackAt("challenge", result.message, "neutral");
      } else {
        View.showIncorrectAt("challenge", result.message, result.guidance);
      }
    }

    function passExerciseAt(index, exercise) {
      markExercisePassedAt(chapterNumber, index);
      state.exercisesPassed[index] = true;
      state.materialViewed = true;
      View.showFeedbackAt(index, "✓ Correct! Great job.", "success");
      View.showSolvedAt(index, exercise);
      maybeCompleteAllExercises();
      refreshCompletion();
    }

    function passChallenge(exercise) {
      markChallengePassed(chapterNumber);
      state.challengePassed = true;
      View.showFeedbackAt("challenge", "✓ Correct! Great job.", "success");
      View.showSolvedAt("challenge", exercise);
      maybeCompleteAllExercises();
      refreshCompletion();
    }

    /* markExerciseCompleted(chapterNumber) is the same flag completeChapter()
       already reads for every course — firing it here, once everything in a
       multi-exercise chapter is passed, means chapter completion/unlock logic
       needs no changes at all for this course. */
    function maybeCompleteAllExercises() {
      if (allExercisesDone() && !isExerciseCompleted(chapterNumber)) {
        markExerciseCompleted(chapterNumber);
      }
    }

    /* ---- 5. completion ---------------------------------------------------- */
    function wireCompleteButton() {
      const button = document.querySelector("[data-complete-chapter]");
      if (!button) {
        return;
      }

      button.addEventListener("click", () => {
        if (!completeChapter(chapterNumber)) {
          View.showFeedback(
            "Every exercise has to be passed before this chapter can be completed.",
            "error"
          );
          return;
        }

        refreshCompletion();
        refreshProgress();

        if (chapter.isFinalProject && isCourseComplete()) {
          View.showCourseComplete({ title: course.title, message: course.completionMessage });
        } else {
          View.renderNextStep(
            chapterNumber,
            TOTAL_CHAPTERS,
            getChapter(chapterNumber + 1),
            courseId
          );
        }
      });
    }

    /* "Material viewed" ticks once the exercise scrolls into view — by then
       the learner has passed the whole written lesson. */
    function trackMaterialViewed() {
      if (state.materialViewed) {
        return;
      }

      const marker = document.querySelector("[data-exercise]");
      if (!marker || typeof window.IntersectionObserver !== "function") {
        state.materialViewed = true;
        refreshCompletion();
        return;
      }

      const observer = new window.IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            state.materialViewed = true;
            refreshCompletion();
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(marker);
    }
  }

  return { initLessonPage };
})();
