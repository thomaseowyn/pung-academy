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
        ? "Review the course →"
        : started
        ? "Continue where you left off →"
        : "Open the course →";
    }

    renderGate(finished);
    renderBranches(finished);
  }

  function renderGate(finished) {
    const gate = document.querySelector("[data-gate-node]");
    if (gate) {
      gate.textContent = finished ? "✓" : "🔒";
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
        icon.textContent = finished ? "🔓" : "🔒";
      }

      const status = branch.querySelector("[data-branch-status]");
      if (status) {
        status.textContent = finished ? "Unlocked" : "Locked";
      }

      const note = branch.querySelector("[data-branch-note]");
      if (note) {
        note.innerHTML = finished
          ? `<a class="btn btn--secondary" href="${routes.comingSoon()}">See what is coming</a>`
          : '<span class="chapter__hint">Finish Introduction to Programming first.</span>';
      }
    });
  }

  return { renderRoadmap };
})();
