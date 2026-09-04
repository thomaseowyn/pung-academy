/* ==========================================================================
   CourseController
   --------------------------------------------------------------------------
   Drives the two course pages — the roadmap and the course overview — by
   reading CourseProgressModel and handing the numbers to the views.
   ========================================================================== */

import {
  TOTAL_CHAPTERS,
  allChapters,
  chapterState,
  completedCount,
  progressPercent,
  isCourseComplete,
  nextChapter,
  resetProgress,
} from "../models/CourseProgressModel.js";
import * as TreeView from "../views/CourseTreeView.js";
import * as OverviewView from "../views/CourseOverviewView.js";

/** courses roadmap page */
export function initCourseTree() {
  TreeView.renderRoadmap({
    completed: completedCount(),
    total: TOTAL_CHAPTERS,
    percent: progressPercent(),
    finished: isCourseComplete(),
  });
}

/** Introduction to Programming overview page */
export function initCourseOverview() {
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
