/* ==========================================================================
   CourseController
   --------------------------------------------------------------------------
   Drives the two course pages — the roadmap and the course overview — by
   reading CourseProgressModel and handing the numbers to the views.

   Both entry points are behind AuthController.requireLogin(): the whole
   Lessons section requires a signed-in session, not just its individual
   chapters.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.CourseController = (function () {
  "use strict";

  /* courses roadmap page always shows Introduction to Programming's card,
     regardless of what other courses exist, so it keeps using the default
     (back-compat) CourseProgressModel/courseData API directly. */
  const { TOTAL_CHAPTERS, completedCount, progressPercent, isCourseComplete } = Pung.CourseProgressModel;
  const { requireLogin } = Pung.AuthController;
  const TreeView = Pung.CourseTreeView;
  const OverviewView = Pung.CourseOverviewView;

  /** courses roadmap page */
  function initCourseTree() {
    if (!requireLogin()) {
      return;
    }

    TreeView.renderRoadmap({
      completed: completedCount(),
      total: TOTAL_CHAPTERS,
      percent: progressPercent(),
      finished: isCourseComplete(),
    });
  }

  /** Any course's overview page — reads which course from data-course. */
  function initCourseOverview() {
    if (!requireLogin()) {
      return;
    }

    const courseId = document.body.getAttribute("data-course") || Pung.courseData.DEFAULT_COURSE_ID;
    const course = Pung.courseData.courses[courseId];
    const progress = Pung.CourseProgressModel.forCourse(courseId);

    OverviewView.renderHeader({
      completed: progress.completedCount(),
      total: progress.TOTAL_CHAPTERS,
      percent: progress.progressPercent(),
      finished: progress.isCourseComplete(),
      next: progress.nextChapter(),
    }, courseId);

    const rows = progress.allChapters().map(({ number, data }) => ({
      number,
      data,
      state: progress.chapterState(number),
    }));

    OverviewView.renderChapterList(rows, course.units, OverviewView.showLockedMessage, courseId);

    /* Only Introduction to Programming forks into the two career paths, so
       the "what's next" branch cards only render on its overview page. */
    if (courseId === Pung.courseData.DEFAULT_COURSE_ID) {
      Pung.CourseTreeView.renderBranches(progress.isCourseComplete());
    }

    wireResetButton(course, progress);
  }

  function wireResetButton(course, progress) {
    const button = document.querySelector("[data-reset-progress]");
    if (!button) {
      return;
    }
    button.addEventListener("click", () => {
      const sure = window.confirm(
        `Reset your progress in ${course.title}? ` +
          "Every chapter will be locked again except Chapter 1."
      );
      if (sure) {
        progress.resetProgress();
        window.location.reload();
      }
    });
  }

  return { initCourseOverview, initCourseTree };
})();
