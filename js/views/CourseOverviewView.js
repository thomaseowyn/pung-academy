/* ==========================================================================
   CourseOverviewView
   --------------------------------------------------------------------------
   Draws the course header (progress, Begin/Continue button) and the chapter
   list, grouped into an orientation slot plus units, each row carrying its
   completed / current / locked state. DOM only.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.CourseOverviewView = (function () {
  "use strict";

  const { routes } = Pung.PathService;

  const STATE_LABEL = {
    completed: "Completed",
    current: "Current",
    locked: "Locked",
  };

  /* A line icon rather than the 🔒 emoji, so the row reads as part of the
     interface instead of picking up the host platform's emoji font. */
  const ICON_LOCK =
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  function renderHeader({ completed, total, percent, finished, next }, courseId) {
    const fill = document.querySelector("[data-course-progress-fill]");
    if (fill) {
      fill.style.width = `${percent}%`;
      fill.classList.toggle("progress__fill--done", finished);
    }

    const text = document.querySelector("[data-course-progress-text]");
    if (text) {
      text.textContent = `${completed} / ${total} chapters completed`;
    }

    const percentSlot = document.querySelector("[data-course-percent]");
    if (percentSlot) {
      percentSlot.textContent = `${percent}%`;
    }

    /* The whole phrase, not just the number, so "1 lesson" reads correctly
       and a finished course says so rather than "0 lessons to go". */
    const remaining = document.querySelector("[data-course-remaining]");
    if (remaining) {
      const left = total - completed;
      remaining.innerHTML =
        left === 0
          ? "Course complete"
          : `<strong>${left}</strong> lesson${left === 1 ? "" : "s"} to go`;
    }

    const begin = document.querySelector("[data-begin-course]");
    if (begin) {
      begin.href = routes.chapter(next, courseId);
      begin.textContent = finished
        ? "Review the final project"
        : completed > 0
        ? `Continue Course — Chapter ${next}`
        : "Begin Course";
    }
  }

  /**
   * @param {Array} rows   [{ number, data, state }], one per chapter
   * @param {Array} units  unit metadata from courseData, each with a
   *                       [start, end] chapter range
   * @param {Function} onLockedClick  called with the row element
   */
  function renderChapterList(rows, units, onLockedClick, courseId) {
    const list = document.querySelector("[data-chapter-list]");
    if (!list) {
      return;
    }
    list.innerHTML = "";

    const byNumber = new Map(rows.map((row) => [row.number, row]));
    const grouped = new Set();

    const orientation = byNumber.get(1);
    if (orientation) {
      list.appendChild(buildOrientation(orientation, onLockedClick, courseId));
      grouped.add(1);
    }

    units.forEach((unit) => {
      const [start, end] = unit.range;
      const unitRows = rows.filter((row) => row.number >= start && row.number <= end);
      unitRows.forEach((row) => grouped.add(row.number));
      list.appendChild(buildUnit(unit, unitRows, onLockedClick, courseId));
    });

    // Any chapter not covered by the orientation slot or a unit range still
    // needs to render, so the list never silently drops a chapter.
    rows
      .filter((row) => !grouped.has(row.number))
      .forEach((row) => list.appendChild(buildRow(row, onLockedClick, courseId)));
  }

  function buildOrientation({ number, data, state }, onLockedClick, courseId) {
    const wrapper = document.createElement("div");
    wrapper.className = "chapter-list__orientation";

    const label = document.createElement("span");
    label.className = "chapter-list__orientation-label";
    label.textContent = "Orientation";
    wrapper.appendChild(label);

    wrapper.appendChild(buildRow({ number, data, state }, onLockedClick, courseId));
    return wrapper;
  }

  function buildUnit(unit, unitRows, onLockedClick, courseId) {
    const wrapper = document.createElement("div");
    wrapper.className = "unit";

    const completed = unitRows.filter((row) => row.state === "completed").length;

    const head = document.createElement("div");
    head.className = "unit__head";
    head.innerHTML = `
      <div>
        <span class="unit__label">${escapeHtml(unit.label)}</span>
        <p class="unit__title">${escapeHtml(unit.title)}</p>
        <p class="unit__desc">${escapeHtml(unit.description)}</p>
      </div>
      <span class="unit__progress">${completed} / ${unitRows.length}</span>`;
    wrapper.appendChild(head);

    const body = document.createElement("div");
    body.className = "unit__body";
    unitRows.forEach((row) => body.appendChild(buildRow(row, onLockedClick, courseId)));
    wrapper.appendChild(body);

    if (unit.bridge) {
      const bridge = document.createElement("p");
      bridge.className = "unit__bridge";
      bridge.textContent = `→ ${unit.bridge}`;
      wrapper.appendChild(bridge);
    }

    return wrapper;
  }

  function buildRow({ number, data, state }, onLockedClick, courseId) {
    const row = document.createElement("article");
    row.className = `chapter chapter--${state}`;
    if (data.isFinalProject) {
      row.classList.add("chapter--final");
    }

    const marker = document.createElement("span");
    marker.className = "chapter__marker";
    marker.textContent = String(number);
    row.appendChild(marker);

    const body = document.createElement("div");
    body.innerHTML = `
      <span class="chapter__state">${STATE_LABEL[state]}</span>
      <h3 class="chapter__title">Chapter ${number} — ${escapeHtml(data.title)}</h3>
      <p class="chapter__summary">${escapeHtml(data.summary)}</p>`;

    if (data.topics?.length) {
      const topics = document.createElement("ul");
      topics.className = "chapter__topics";
      topics.innerHTML = data.topics
        .map((t) => `<li>${escapeHtml(t)}</li>`)
        .join("");
      body.appendChild(topics);
    }

    if (data.project) {
      const project = document.createElement("span");
      project.className = "chapter__project";
      project.textContent = `Project: ${data.project}`;
      body.appendChild(project);
    }

    row.appendChild(body);

    const action = document.createElement("div");
    action.className = "chapter__action";

    if (state === "locked") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chapter__action-tag chapter__action-tag--locked";
      button.innerHTML = `${ICON_LOCK}<span>Locked</span>`;
      button.addEventListener("click", () => onLockedClick(row));
      action.appendChild(button);
    } else {
      const link = document.createElement("a");
      link.className = `chapter__action-tag chapter__action-tag--${
        state === "completed" ? "review" : "continue"
      }`;
      link.textContent = state === "completed" ? "Review" : "Continue";
      link.href = routes.chapter(number, courseId);
      action.appendChild(link);
    }

    row.appendChild(action);
    return row;
  }

  /** Explain, in place, why a locked chapter did not open. */
  function showLockedMessage(row) {
    row.querySelector(".locked-message")?.remove();

    const message = document.createElement("p");
    message.className = "locked-message";
    message.setAttribute("role", "status");
    message.textContent = "Complete the previous chapter to unlock this lesson.";
    row.appendChild(message);

    window.setTimeout(() => message.remove(), 4000);
  }

  function escapeHtml(value) {
    const node = document.createElement("span");
    node.textContent = String(value);
    return node.innerHTML;
  }

  return { renderChapterList, renderHeader, showLockedMessage };
})();
