/* Entry point for the landing page. */
(function () {
  "use strict";

  Pung.Shared.initPage();

  /* "Your path" preview reuses the exact same course-card/branch-card
     markup and rendering as the courses roadmap page, just without the
     login gate — anyone landing on the homepage can see where they'd
     start, signed in or not. */
  const { completedCount, progressPercent, isCourseComplete, TOTAL_CHAPTERS } =
    Pung.CourseProgressModel;

  Pung.CourseTreeView.renderRoadmap({
    completed: completedCount(),
    total: TOTAL_CHAPTERS,
    percent: progressPercent(),
    finished: isCourseComplete(),
  });
})();
