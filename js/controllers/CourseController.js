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

  const { TOTAL_CHAPTERS, allChapters, chapterState, completedCount, progressPercent, isCourseComplete, nextChapter, resetProgress } = Pung.CourseProgressModel;
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

  /** Introduction to Programming overview page */
  function initCourseOverview() {
    if (!requireLogin()) {
      return;
    }

    OverviewView.renderHeader({
      completed: completedCount(),
      total: TOTAL_CHAPTERS,
      percent: progressPercent(),
      finished: isCourseComplete(),
      next: nextChapter(),
    });

    const rows = allChapters().map(({ number, data }) => ({
      number,
      data,
      state: chapterState(number),
    }));

    OverviewView.renderChapterList(rows, OverviewView.showLockedMessage);

    wireResetButton();
  }

  function wireResetButton() {
    const button = document.querySelector("[data-reset-progress]");
    if (!button) {
      return;
    }
    button.addEventListener("click", () => {
      const sure = window.confirm(
        "Reset your progress in Introduction to Programming? " +
          "Every chapter will be locked again except Chapter 1."
      );
      if (sure) {
        resetProgress();
        window.location.reload();
      }
    });
  }

  return { initCourseOverview, initCourseTree };
})();
