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
  const { COURSE_ID, TOTAL_CHAPTERS, chapters } = Pung.courseData;
  const { getCurrentUser } = Pung.UserModel;

  const PROGRESS_PREFIX = "pungAcademyProgress_";

  /* ---------------------------------------------------------------- storage */

  /** Guests get their own bucket, separate from every signed-in account. */
  function storageKey() {
    const user = getCurrentUser();
    return PROGRESS_PREFIX + (user?.email || "guest");
  }

  function isChapterNumber(value) {
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= TOTAL_CHAPTERS;
  }

  /** The course record, always with a usable shape. */
  function getCourseProgress() {
    const all = readJSON(storageKey(), {}) || {};
    const record = all[COURSE_ID] || {};
    return {
      completedChapters: Array.isArray(record.completedChapters)
        ? record.completedChapters.filter(isChapterNumber).sort((a, b) => a - b)
        : [],
      exercisesCompleted:
        record.exercisesCompleted && typeof record.exercisesCompleted === "object"
          ? record.exercisesCompleted
          : {},
      updatedAt: record.updatedAt || null,
    };
  }

  function saveCourseProgress(record) {
    const all = readJSON(storageKey(), {}) || {};
    all[COURSE_ID] = { ...record, updatedAt: new Date().toISOString() };
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
    delete all[COURSE_ID];
    writeJSON(storageKey(), all);
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

  return { TOTAL_CHAPTERS, allChapters, chapterState, completeChapter, completedCount, getChapter, getCourseProgress, isChapterCompleted, isChapterUnlocked, isCourseComplete, isExerciseCompleted, markExerciseCompleted, nextChapter, progressPercent, resetProgress };
})();
