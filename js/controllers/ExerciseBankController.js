/* ==========================================================================
   ExerciseBankController
   --------------------------------------------------------------------------
   Drives the Arena page: builds the recommended pick and the per-course,
   per-unit exercise lists from ExerciseBankModel, hands them to the view,
   and wires the solving modal so a result refreshes both.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.ExerciseBankController = (function () {
  "use strict";

  const Model = Pung.ExerciseBankModel;
  const View = Pung.ExerciseBankView;
  const { requireLogin } = Pung.AuthController;
  const { courses } = Pung.courseData;

  function buildSections() {
    return Model.COURSE_ORDER.map((courseId) => {
      const title = courses[courseId].title;

      if (!Model.isCourseUnlocked(courseId)) {
        return { id: courseId, title, locked: true };
      }

      const units = Model.unitIdsFor(courseId).map((unitId) => {
        const stats = Model.unitStats(courseId, unitId);
        const exercises = Model.exercisesIn(courseId, unitId).map((ex) => ({
          ...ex,
          solved: Model.isSolved(ex.id),
        }));
        return { id: unitId, label: Model.unitLabel(courseId, unitId), exercises, ...stats };
      });

      return { id: courseId, title, locked: false, units, ...Model.courseStats(courseId) };
    });
  }

  function refresh(justSolvedId) {
    View.renderRecommended(Model.recommend(), startExercise);
    View.renderCourseLists(buildSections(), startExercise, justSolvedId || null);
  }

  function startExercise(exercise) {
    let solved = false;
    View.openExercise(exercise, {
      onSubmit: (value) => {
        const result = Model.checkAnswer(exercise, value);
        if (result.ok) {
          Model.markSolved(exercise.id);
          solved = true;
        }
        return result;
      },
      onClose: () => refresh(solved ? exercise.id : null),
    });
  }

  function init() {
    if (!requireLogin()) {
      return;
    }
    refresh();
    View.runBoot();
  }

  return { init };
})();
