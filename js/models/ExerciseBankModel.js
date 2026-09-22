/* ==========================================================================
   ExerciseBankModel
   --------------------------------------------------------------------------
   Reads Pung.exerciseBank, tracks which exercises a learner has solved, and
   picks the one recommendation shown on the Arena page. Pure state — no DOM.

   "Current level" is derived from the learner's existing chapter progress:
   whatever unit their next unfinished chapter falls into (see
   CourseProgressModel.nextChapter()) is where recommendations start, so the
   exercise bank tracks the same course-tree progression rather than keeping
   a second, disconnected notion of level.

   Solved exercises are stored per local user, like every other progress
   record in the app.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.ExerciseBankModel = (function () {
  "use strict";

  const { readJSON, writeJSON } = Pung.StorageService;
  const { getCurrentUser } = Pung.UserModel;
  const { bank } = Pung.exerciseBank;
  const { courses, DEFAULT_COURSE_ID } = Pung.courseData;

  const STORAGE_PREFIX = "pungAcademyExerciseBank_";
  /* Roadmap order: the foundation course, then the two paths it unlocks. */
  const COURSE_ORDER = [DEFAULT_COURSE_ID, "ai", "softwareEngineering"];

  function storageKey() {
    const user = getCurrentUser();
    return STORAGE_PREFIX + (user?.email || "guest");
  }

  function readSolved() {
    const stored = readJSON(storageKey(), {});
    return stored && typeof stored === "object" ? stored : {};
  }

  function isSolved(id) {
    return !!readSolved()[id];
  }

  function markSolved(id) {
    const solved = readSolved();
    solved[id] = { at: new Date().toISOString() };
    writeJSON(storageKey(), solved);
  }

  /* ---------------------------------------------------------------- structure */

  function unitIdsFor(courseId) {
    return Object.keys(bank[courseId] || {});
  }

  function exercisesIn(courseId, unitId) {
    return bank[courseId]?.[unitId] || [];
  }

  function unitLabel(courseId, unitId) {
    const unit = (courses[courseId].units || []).find((u) => u.id === unitId);
    return unit ? unit.label : unitId;
  }

  function isCourseUnlocked(courseId) {
    if (courseId === DEFAULT_COURSE_ID) {
      return true;
    }
    return Pung.CourseProgressModel.forCourse(DEFAULT_COURSE_ID).isCourseComplete();
  }

  /** Which unit the learner is currently working in, based on chapter progress. */
  function currentUnitId(courseId) {
    const units = courses[courseId].units || [];
    const next = Pung.CourseProgressModel.forCourse(courseId).nextChapter();
    const match = units.find((unit) => next >= unit.range[0] && next <= unit.range[1]);
    if (match) {
      return match.id;
    }
    /* Before the first unit's range (an orientation chapter with no unit of
       its own) falls back to the first unit; past the last range (the
       course is finished) falls back to the last. */
    const first = units[0];
    return first && next < first.range[0] ? first.id : units[units.length - 1]?.id;
  }

  /* ------------------------------------------------------------------ queries */

  function unitStats(courseId, unitId) {
    const list = exercisesIn(courseId, unitId);
    return { solved: list.filter((ex) => isSolved(ex.id)).length, total: list.length };
  }

  function courseStats(courseId) {
    return unitIdsFor(courseId).reduce(
      (totals, unitId) => {
        const stats = unitStats(courseId, unitId);
        return { solved: totals.solved + stats.solved, total: totals.total + stats.total };
      },
      { solved: 0, total: 0 }
    );
  }

  /**
   * One recommendation: the first unsolved exercise, starting from the
   * learner's current unit in the first unlocked course that still has one
   * to give, wrapping back through that course's earlier units before
   * moving on to the next course.
   */
  function recommend() {
    const unlockedCourses = COURSE_ORDER.filter(isCourseUnlocked);

    for (const courseId of unlockedCourses) {
      const units = unitIdsFor(courseId);
      const startIndex = Math.max(0, units.indexOf(currentUnitId(courseId)));
      const rotated = units.slice(startIndex).concat(units.slice(0, startIndex));

      for (const unitId of rotated) {
        const pick = exercisesIn(courseId, unitId).find((ex) => !isSolved(ex.id));
        if (pick) {
          return {
            ...pick,
            courseId,
            unitId,
            courseTitle: courses[courseId].title,
            unitLabel: unitLabel(courseId, unitId),
          };
        }
      }
    }
    return null;
  }

  /* ------------------------------------------------------------------ grading
     Same approach LessonController uses for a "code" exercise: not executed,
     just checked against a list of regexes for the concepts it must contain. */

  function checkAnswer(exercise, submission) {
    const { normaliseCode, meaningfulCode } = Pung.ValidationService;
    const code = normaliseCode(submission);

    if (meaningfulCode(code).trim() === "") {
      return { ok: false, tone: "neutral", message: "Write some code in the editor first." };
    }

    const failed = exercise.checks.find((check) => !check.test.test(code));
    if (failed) {
      return { ok: false, message: failed.message };
    }
    return { ok: true };
  }

  return {
    COURSE_ORDER,
    checkAnswer,
    courseStats,
    currentUnitId,
    exercisesIn,
    isCourseUnlocked,
    isSolved,
    markSolved,
    recommend,
    unitIdsFor,
    unitLabel,
    unitStats,
  };
})();
