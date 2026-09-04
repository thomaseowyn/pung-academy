/* ==========================================================================
   LessonController
   --------------------------------------------------------------------------
   Drives a chapter page: enforces the access rule, wires the exercise up to
   its validation, and records completion.

   The lock is enforced here, not just shown. Opening a locked chapter by
   typing its URL hides the content and renders the locked screen instead.
   ========================================================================== */

import {
  TOTAL_CHAPTERS,
  getChapter,
  isChapterUnlocked,
  isChapterCompleted,
  isExerciseCompleted,
  markExerciseCompleted,
  completeChapter,
  completedCount,
  progressPercent,
  isCourseComplete,
} from "../models/CourseProgressModel.js";
import { normaliseCode, meaningfulCode } from "../services/ValidationService.js";
import * as View from "../views/LessonView.js";

export function initLessonPage() {
  const chapterNumber = Number(document.body.getAttribute("data-chapter"));
  const chapter = getChapter(chapterNumber);
  if (!chapterNumber || !chapter) {
    return;
  }

  /* ---- 1. the access rule ---------------------------------------------- */
  if (!isChapterUnlocked(chapterNumber)) {
    View.renderLockedScreen(
      chapterNumber,
      getChapter(chapterNumber - 1)?.title || ""
    );
    return;
  }

  /* ---- 2. page state ---------------------------------------------------- */
  const state = {
    materialViewed: isChapterCompleted(chapterNumber),
    exercisePassed: isExerciseCompleted(chapterNumber),
  };

  const refreshCompletion = () =>
    View.renderCompletion({
      ...state,
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
  View.renderHeader(chapterNumber, chapter, TOTAL_CHAPTERS);
  refreshProgress();
  View.renderVideo(chapterNumber, chapter);
  View.renderChapterNav(
    chapterNumber,
    TOTAL_CHAPTERS,
    isChapterUnlocked(chapterNumber + 1)
  );

  View.renderExercise(chapter.exercise, (form) =>
    checkAnswer(form, chapter.exercise)
  );

  if (state.exercisePassed) {
    View.showFeedback("✓ Correct! Great job.", "success");
    View.showSolved(chapter.exercise);
  }

  refreshCompletion();
  trackMaterialViewed();
  wireCompleteButton();

  if (isChapterCompleted(chapterNumber)) {
    View.renderNextStep(
      chapterNumber,
      TOTAL_CHAPTERS,
      getChapter(chapterNumber + 1)
    );
  }

  /* ---- 4. exercise validation ------------------------------------------ */
  function checkAnswer(form, exercise) {
    if (exercise.kind === "choice") {
      const picked = form.querySelector("input[name='answer']:checked");
      if (!picked) {
        View.showFeedback("Choose an answer first.", "neutral");
        return;
      }
      if (Number(picked.value) === exercise.answer) {
        pass(exercise);
      } else {
        View.showIncorrect("Not quite. Check your logic and try again.");
      }
      return;
    }

    const code = normaliseCode(form.elements.code.value);
    if (meaningfulCode(code).trim() === "") {
      View.showFeedback("Write some code in the editor first.", "neutral");
      return;
    }

    const failed = exercise.checks.find((check) => !check.test.test(code));
    if (failed) {
      View.showIncorrect("Not quite. Check your logic and try again.", failed.message);
      return;
    }

    pass(exercise);
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

  /* ---- 5. completion ---------------------------------------------------- */
  function wireCompleteButton() {
    const button = document.querySelector("[data-complete-chapter]");
    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      if (!completeChapter(chapterNumber)) {
        View.showFeedback(
          "The exercise has to be passed before this chapter can be completed.",
          "error"
        );
        return;
      }

      refreshCompletion();
      refreshProgress();

      if (chapter.isFinalProject && isCourseComplete()) {
        View.showCourseComplete();
      } else {
        View.renderNextStep(
          chapterNumber,
          TOTAL_CHAPTERS,
          getChapter(chapterNumber + 1)
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
