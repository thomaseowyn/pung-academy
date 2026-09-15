/* ==========================================================================
   CourseTreeView
   --------------------------------------------------------------------------
   Draws the roadmap on the Courses page: the course card's live state, the
   gate between the course and the two career paths, and the branch cards.
   DOM only — it is handed the numbers it needs.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.CourseTreeView = (function () {
  "use strict";

  const { routes } = Pung.PathService;

  /* Maps a roadmap branch card's data-branch id to the real course it
     unlocks into, once one exists. Any branch id not listed here (a future
     path with no course yet) falls back to the "coming soon" placeholder. */
  const UNLOCKED_BRANCH_COURSES = {
    ai: "ai",
    "software-engineering": "softwareEngineering"
  };

  /* Line icons rather than emoji, so the branch tiles match the rest of the
     interface instead of picking up the host platform's emoji font. */
  const ICON_LOCKED =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  const ICON_UNLOCKED =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1.9"/></svg>';
  const ICON_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';

  function renderRoadmap({ completed, total, percent, finished }) {
    const card = document.querySelector("[data-course-card]");
    if (!card) {
      return;
    }
    const started = completed > 0;

    card.href = routes.courseOverview();

    const badge = card.querySelector("[data-course-badge]");
    if (badge) {
      badge.textContent = finished
        ? "✓ Completed"
        : started
        ? "In progress"
        : "Start here";
      badge.classList.toggle("course-card__badge--done", finished);
      badge.classList.toggle("course-card__badge--progress", started && !finished);
    }

    const fill = card.querySelector("[data-course-progress-fill]");
    if (fill) {
      fill.style.width = `${percent}%`;
      fill.classList.toggle("progress__fill--done", finished);
    }

    const text = card.querySelector("[data-course-progress-text]");
    if (text) {
      text.textContent = `${completed} / ${total} chapters`;
    }

    const cta = card.querySelector("[data-course-cta]");
    if (cta) {
      cta.textContent = finished
        ? "Review course"
        : started
        ? "Continue"
        : "Start course";
    }

    renderGate(finished);
    renderBranches(finished);
  }

  function renderGate(finished) {
    const gate = document.querySelector("[data-gate-node]");
    if (gate) {
      gate.innerHTML = finished ? ICON_CHECK : ICON_LOCKED;
      gate.classList.toggle("is-open", finished);
    }

    const caption = document.querySelector("[data-gate-caption]");
    if (caption) {
      caption.textContent = finished
        ? "Introduction to Programming complete — both paths are open"
        : "Complete Introduction to Programming to open the paths below";
    }
  }

  function renderBranches(finished) {
    document.querySelectorAll("[data-branch]").forEach((branch) => {
      branch.classList.toggle("is-unlocked", finished);

      const icon = branch.querySelector("[data-branch-icon]");
      if (icon) {
        icon.innerHTML = finished ? ICON_UNLOCKED : ICON_LOCKED;
      }

      const status = branch.querySelector("[data-branch-status]");
      if (status) {
        status.textContent = finished ? "Unlocked" : "Locked";
      }

      const note = branch.querySelector("[data-branch-note]");
      if (note) {
        if (!finished) {
          note.innerHTML =
            '<span class="chapter__hint">Finish Introduction to Programming first.</span>';
        } else {
          const targetCourseId = UNLOCKED_BRANCH_COURSES[branch.getAttribute("data-branch")];
          note.innerHTML = targetCourseId
            ? `<a class="btn btn--secondary" href="${routes.courseOverview(targetCourseId)}">Start the course</a>`
            : `<a class="btn btn--secondary" href="${routes.comingSoon()}">See what is coming</a>`;
        }
      }
    });
  }

  return { renderBranches, renderGate, renderRoadmap };
})();
