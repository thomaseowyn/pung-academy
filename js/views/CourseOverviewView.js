/* ==========================================================================
   CourseOverviewView
   --------------------------------------------------------------------------
   Draws the course header (progress, Begin/Continue button) and the list of
   ten chapters with their completed / current / locked state. DOM only.
   ========================================================================== */

import { routes } from "../services/PathService.js";

const STATE_LABEL = {
  completed: "✓ Completed",
  current: "▶ Current",
  locked: "🔒 Locked",
};

export function renderHeader({ completed, total, percent, finished, next }) {
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

  const remaining = document.querySelector("[data-course-remaining]");
  if (remaining) {
    remaining.textContent = String(total - completed);
  }

  const begin = document.querySelector("[data-begin-course]");
  if (begin) {
    begin.href = routes.chapter(next);
    begin.textContent = finished
      ? "Review the final project"
      : completed > 0
      ? `Continue Course — Chapter ${next}`
      : "Begin Course";
  }
}

/**
 * @param {Array} rows  [{ number, data, state }]
 * @param {Function} onLockedClick  called with the row element
 */
export function renderChapterList(rows, onLockedClick) {
  const list = document.querySelector("[data-chapter-list]");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  rows.forEach((row) => list.appendChild(buildRow(row, onLockedClick)));
}

function buildRow({ number, data, state }, onLockedClick) {
  const row = document.createElement("li");
  row.className = `chapter chapter--${state}`;
  if (data.isFinalProject) {
    row.classList.add("chapter--final");
  }

  const marker = document.createElement("span");
  marker.className = "chapter__marker";
  marker.textContent =
    state === "completed" ? "✓" : state === "locked" ? "🔒" : String(number);
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
    button.className = "btn btn--secondary";
    button.textContent = "Locked";
    button.addEventListener("click", () => onLockedClick(row));
    action.appendChild(button);
  } else {
    const link = document.createElement("a");
    link.className = `btn btn--${state === "completed" ? "secondary" : "primary"}`;
    link.textContent = state === "completed" ? "Review" : "Start";
    link.href = routes.chapter(number);
    action.appendChild(link);
  }

  row.appendChild(action);
  return row;
}

/** Explain, in place, why a locked chapter did not open. */
export function showLockedMessage(row) {
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
