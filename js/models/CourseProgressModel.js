/* ==========================================================================
   CourseProgressModel
   --------------------------------------------------------------------------
   Chapter completion, unlock rules and persistence. Pure state — no DOM.

   The whole progression system rests on one rule, in isChapterUnlocked():
   chapter 1 is always open, and every other chapter needs the one before it
   completed. Everything else derives from that.

   Progress is stored per local user, so two accounts registered in the same
   browser do not share a position in the course.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.CourseProgressModel = (function () {
  "use strict";

  const { readJSON, writeJSON } = Pung.StorageService;
  const { getCurrentUser } = Pung.UserModel;

  const PROGRESS_PREFIX = "pungAcademyProgress_";

  /** Guests get their own bucket, separate from every signed-in account. */
  function storageKey() {
    const user = getCurrentUser();
    return PROGRESS_PREFIX + (user?.email || "guest");
  }

  /**
   * Build the full progress API scoped to one course. Every course gets its
   * own independent record in storage (see saveCourseProgress), so finishing
   * a chapter in one course never touches another course's progress.
   */
  function forCourse(courseId) {
    const course = Pung.courseData.courses[courseId];
    const { totalChapters: TOTAL_CHAPTERS, chapters } = course;

    function isChapterNumber(value) {
      const n = Number(value);
      return Number.isInteger(n) && n >= 1 && n <= TOTAL_CHAPTERS;
    }

    /* ---------------------------------------------------------------- storage */

    /** The course record, always with a usable shape. */
    function getCourseProgress() {
      const all = readJSON(storageKey(), {}) || {};
      const record = all[courseId] || {};
      return {
        completedChapters: Array.isArray(record.completedChapters)
          ? record.completedChapters.filter(isChapterNumber).sort((a, b) => a - b)
          : [],
        exercisesCompleted:
          record.exercisesCompleted && typeof record.exercisesCompleted === "object"
            ? record.exercisesCompleted
            : {},
        /* Fine-grained, per-exercise-index progress for chapters with more than
           one exercise (see markExercisePassedAt/markChallengePassed below).
           Chapters with a single `exercise` never read or write this. */
        exerciseProgress:
          record.exerciseProgress && typeof record.exerciseProgress === "object"
            ? record.exerciseProgress
            : {},
        updatedAt: record.updatedAt || null,
      };
    }

    function saveCourseProgress(record) {
      const all = readJSON(storageKey(), {}) || {};
      all[courseId] = { ...record, updatedAt: new Date().toISOString() };
      writeJSON(storageKey(), all);
    }

    /* ------------------------------------------------------- progression rules */

    function isChapterCompleted(number) {
      return getCourseProgress().completedChapters.includes(Number(number));
    }

    function isChapterUnlocked(number) {
      const n = Number(number);
      if (!isChapterNumber(n)) {
        return false;
      }
      return n === 1 || isChapterCompleted(n - 1);
    }

    /** "completed" | "current" | "locked" — used for rendering. */
    function chapterState(number) {
      if (isChapterCompleted(number)) {
        return "completed";
      }
      return isChapterUnlocked(number) ? "current" : "locked";
    }

    /** First unfinished chapter — where Begin/Continue Course points. */
    function nextChapter() {
      for (let n = 1; n <= TOTAL_CHAPTERS; n += 1) {
        if (!isChapterCompleted(n)) {
          return n;
        }
      }
      return TOTAL_CHAPTERS;
    }

    function completedCount() {
      return getCourseProgress().completedChapters.length;
    }

    function progressPercent() {
      return Math.round((completedCount() / TOTAL_CHAPTERS) * 100);
    }

    function isCourseComplete() {
      return completedCount() >= TOTAL_CHAPTERS;
    }

    /* ------------------------------------------------------ recording progress */

    function isExerciseCompleted(number) {
      return getCourseProgress().exercisesCompleted[String(number)] === true;
    }

    function markExerciseCompleted(number) {
      if (!isChapterNumber(number)) {
        return;
      }
      const record = getCourseProgress();
      record.exercisesCompleted[String(number)] = true;
      saveCourseProgress(record);
    }

    /**
     * Mark a chapter finished. Refuses when the chapter is locked or its
     * exercise has not been passed, so the rule cannot be bypassed by calling
     * this from the console.
     * @returns {boolean} whether it was accepted
     */
    function completeChapter(number) {
      const n = Number(number);
      if (!isChapterUnlocked(n) || !isExerciseCompleted(n)) {
        return false;
      }
      const record = getCourseProgress();
      if (!record.completedChapters.includes(n)) {
        record.completedChapters.push(n);
        record.completedChapters.sort((a, b) => a - b);
      }
      saveCourseProgress(record);
      return true;
    }

    function resetProgress() {
      const all = readJSON(storageKey(), {}) || {};
      delete all[courseId];
      writeJSON(storageKey(), all);
    }

    /* --------------------------------------------- multi-exercise progress ---
       For chapters shaped with `exercises: [...]` + `challenge` instead of a
       single `exercise` (see LessonController.js's isMultiExercise branch).
       This lets a partially-finished chapter resume correctly after a reload,
       while chapter completion itself still goes through the exact same
       markExerciseCompleted(number)/isExerciseCompleted(number) pair above. */

    function getExerciseProgress(number) {
      const stored = getCourseProgress().exerciseProgress[String(number)];
      return {
        passed: Array.isArray(stored?.passed) ? stored.passed : [],
        challengePassed: !!stored?.challengePassed,
      };
    }

    function markExercisePassedAt(number, index) {
      if (!isChapterNumber(number)) {
        return;
      }
      const record = getCourseProgress();
      const key = String(number);
      const entry = record.exerciseProgress[key] || { passed: [], challengePassed: false };
      entry.passed[index] = true;
      record.exerciseProgress[key] = entry;
      saveCourseProgress(record);
    }

    function markChallengePassed(number) {
      if (!isChapterNumber(number)) {
        return;
      }
      const record = getCourseProgress();
      const key = String(number);
      const entry = record.exerciseProgress[key] || { passed: [], challengePassed: false };
      entry.challengePassed = true;
      record.exerciseProgress[key] = entry;
      saveCourseProgress(record);
    }

    /* ---------------------------------------------------------------- helpers */

    function getChapter(number) {
      return chapters[Number(number)] || null;
    }

    function allChapters() {
      return Array.from({ length: TOTAL_CHAPTERS }, (_, i) => ({
        number: i + 1,
        data: chapters[i + 1],
      }));
    }

    return { TOTAL_CHAPTERS, allChapters, chapterState, completeChapter, completedCount, getChapter, getCourseProgress, getExerciseProgress, isChapterCompleted, isChapterUnlocked, isCourseComplete, isExerciseCompleted, markChallengePassed, markExerciseCompleted, markExercisePassedAt, nextChapter, progressPercent, resetProgress };
  }

  /* Back-compat: the old flat API, aliased to the default course, so any
     existing reader that calls Pung.CourseProgressModel.<fn>() directly
     keeps working unchanged. New, course-aware code calls .forCourse(id). */
  return Object.assign(forCourse(Pung.courseData.DEFAULT_COURSE_ID), { forCourse });
})();
