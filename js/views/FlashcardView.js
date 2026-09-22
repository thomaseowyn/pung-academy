/* ==========================================================================
   FlashcardView
   --------------------------------------------------------------------------
   The "Flash cards" box on the Lessons page and the flashcard overlay it
   opens. The overlay sits on top of the page instead of navigating away, so
   the page stays visible behind it, dimmed and blurred. DOM only — cards and
   results come in through arguments and callbacks.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.FlashcardView = (function () {
  "use strict";

  const ICON_CARDS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="15" height="12" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1"/></svg>';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ------------------------------------------------------------------- the box */

  function whenText(timestamp) {
    const days = Math.ceil((timestamp - Date.now()) / (24 * 60 * 60 * 1000));
    return days <= 1 ? "tomorrow" : `in ${days} days`;
  }

  function renderBox(summary, onStart) {
    const mount = document.querySelector("[data-flashcard-box]");
    if (!mount) {
      return;
    }

    /* Nothing to press: no cards yet, or every card is waiting out its week. */
    const idle = summary.total === 0 || (!summary.resume && summary.due === 0);
    if (idle) {
      const note =
        summary.total === 0
          ? "Finish a chapter to unlock"
          : `Up to date · next review ${whenText(summary.nextDueAt)}`;
      mount.innerHTML = `
        <div class="review-box is-empty">
          <span class="review-box__icon" aria-hidden="true">${ICON_CARDS}</span>
          <span class="review-box__title">Flash cards</span>
          <span class="review-box__note">${note}</span>
        </div>`;
      return;
    }

    mount.innerHTML = `
      <button type="button" class="review-box" data-flashcard-start>
        <span class="review-box__icon" aria-hidden="true">${ICON_CARDS}</span>
        <span class="review-box__title">Flash cards</span>
        ${summary.resume ? '<span class="review-box__note">Continue</span>' : ""}
      </button>`;

    mount.querySelector("[data-flashcard-start]").addEventListener("click", onStart);
  }

  /* ---------------------------------------------------------------- card faces */

  function frontHtml(card) {
    let body = "";

    if (card.type === "choice") {
      body = `<ol class="fc-choices">${card.choices
        .map(
          (choice, i) =>
            `<li><span class="fc-choices__key">${String.fromCharCode(65 + i)}</span><span>${escapeHtml(
              choice
            )}</span></li>`
        )
        .join("")}</ol>`;
    } else if (card.type === "order") {
      body = `<ul class="fc-list">${Pung.FlashcardModel.shuffle(card.items)
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>`;
    }

    return `
      <p class="fc-meta">${escapeHtml(card.courseTitle)} · Chapter ${card.chapter}</p>
      <p class="fc-prompt">${escapeHtml(card.prompt)}</p>
      ${body}
      <p class="fc-tap">Click the card to reveal the answer</p>`;
  }

  function backHtml(card) {
    let answer = "";

    if (card.type === "choice") {
      answer = `<p class="fc-answer"><span class="fc-choices__key">${String.fromCharCode(
        65 + card.answerIndex
      )}</span>${escapeHtml(card.choices[card.answerIndex])}</p>`;
    } else if (card.type === "text") {
      answer = `<p class="fc-answer">${escapeHtml(card.answerText)}</p>`;
    } else if (card.type === "order") {
      answer = `<ol class="fc-list fc-list--ordered">${card.items
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ol>`;
    } else if (card.type === "overview") {
      answer = `<ul class="fc-list">${card.topics
        .map((topic) => `<li>${escapeHtml(topic)}</li>`)
        .join("")}</ul>`;
    }

    return `
      <p class="fc-meta">Answer</p>
      ${answer}
      ${card.explanation ? `<p class="fc-explain">${escapeHtml(card.explanation)}</p>` : ""}`;
  }

  /* ------------------------------------------------------------- the overlay */

  /**
   * Open the review overlay.
   * @param {Array} cards the session's cards
   * @param {{startIndex?: number, results?: Object, onProgress: Function,
   *   onResult: Function, onFinish: Function, onClose: Function}} handlers
   */
  function openReview(cards, { startIndex = 0, results: startResults = {}, onProgress, onResult, onFinish, onClose }) {
    if (document.querySelector(".fc-overlay")) {
      return;
    }
    const opener = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "fc-overlay";
    overlay.innerHTML = `
      <div class="fc-dialog" role="dialog" aria-modal="true" aria-label="Flashcard review" tabindex="-1">
        <header class="fc-head">
          <span class="fc-count" data-fc-count></span>
          <span class="fc-bar" aria-hidden="true"><span class="fc-bar__fill" data-fc-bar></span></span>
          <button type="button" class="fc-close" data-fc-close aria-label="Close review">✕</button>
        </header>
        <div class="fc-body" data-fc-body></div>
      </div>`;
    document.body.appendChild(overlay);

    /* Everything behind the overlay is dimmed by CSS; inert also keeps
       keyboard focus and screen readers inside the dialog. */
    const background = Array.from(document.body.children).filter(
      (el) => el !== overlay && el.tagName !== "SCRIPT"
    );
    background.forEach((el) => {
      el.inert = true;
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("fc-open");

    const dialog = overlay.querySelector(".fc-dialog");
    const body = overlay.querySelector("[data-fc-body]");
    const count = overlay.querySelector("[data-fc-count]");
    const bar = overlay.querySelector("[data-fc-bar]");

    let index = Math.min(Math.max(0, startIndex), cards.length - 1);
    let flipped = false;
    let finished = false;
    const results = { ...startResults };

    function close() {
      document.removeEventListener("keydown", handleKey);
      overlay.remove();
      background.forEach((el) => {
        el.inert = false;
      });
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("fc-open");
      if (opener && typeof opener.focus === "function") {
        opener.focus();
      }
      onClose();
    }

    function renderCard() {
      const card = cards[index];
      flipped = false;
      onProgress(index, results);
      count.textContent = `${index + 1} / ${cards.length}`;
      bar.style.width = `${(index / cards.length) * 100}%`;

      body.innerHTML = `
        <div class="fc-stage">
          <button type="button" class="fc-arrow" data-fc-prev aria-label="Previous card" ${
            index === 0 ? "disabled" : ""
          }>‹</button>
          <div class="fc-card" data-fc-card role="button" tabindex="0" aria-label="Flip card">
            <div class="fc-face fc-face--front">${frontHtml(card)}</div>
            <div class="fc-face fc-face--back" aria-hidden="true">${backHtml(card)}</div>
          </div>
          <button type="button" class="fc-arrow" data-fc-next aria-label="Next card" ${
            index === cards.length - 1 ? "disabled" : ""
          }>›</button>
        </div>
        <div class="fc-actions" data-fc-actions>
          <button type="button" class="btn btn--primary" data-fc-flip>Show answer</button>
        </div>
        <p class="fc-hint">Space flips · ← → move between cards · Esc closes</p>`;

      body.querySelector("[data-fc-card]").addEventListener("click", flip);
      body.querySelector("[data-fc-flip]").addEventListener("click", flip);
      body.querySelector("[data-fc-prev]").addEventListener("click", () => go(-1));
      body.querySelector("[data-fc-next]").addEventListener("click", () => go(1));
      body.querySelector("[data-fc-card]").focus();
    }

    function flip() {
      if (finished) {
        return;
      }
      flipped = !flipped;
      const card = body.querySelector("[data-fc-card]");
      card.classList.toggle("is-flipped", flipped);
      card.querySelector(".fc-face--front").setAttribute("aria-hidden", String(flipped));
      card.querySelector(".fc-face--back").setAttribute("aria-hidden", String(!flipped));

      const actions = body.querySelector("[data-fc-actions]");
      if (flipped) {
        actions.innerHTML = `
          <button type="button" class="btn btn--secondary" data-fc-again>Again</button>
          <button type="button" class="btn btn--primary" data-fc-good>Got it</button>`;
        actions.querySelector("[data-fc-again]").addEventListener("click", () => rate("again"));
        actions.querySelector("[data-fc-good]").addEventListener("click", () => rate("good"));
      } else {
        actions.innerHTML =
          '<button type="button" class="btn btn--primary" data-fc-flip>Show answer</button>';
        actions.querySelector("[data-fc-flip]").addEventListener("click", flip);
      }
    }

    function go(step) {
      const next = index + step;
      if (next < 0 || next >= cards.length) {
        return;
      }
      index = next;
      renderCard();
    }

    function rate(result) {
      results[cards[index].id] = result;
      onResult(cards[index].id, result);
      if (index === cards.length - 1) {
        onFinish();
        renderSummary();
      } else {
        index += 1;
        renderCard();
      }
    }

    function renderSummary() {
      finished = true;
      const values = Object.values(results);
      const good = values.filter((r) => r === "good").length;
      const again = values.filter((r) => r === "again").length;
      count.textContent = "Done";
      bar.style.width = "100%";

      body.innerHTML = `
        <div class="fc-summary">
          <h2 class="fc-summary__title">Session complete</h2>
          <p class="fc-summary__text"><strong>${good}</strong> got it · <strong>${again}</strong> to revisit</p>
          <p class="fc-summary__note">${
            again > 0
              ? "The ones you missed will come first next time."
              : "Nice — everything in this round stuck."
          }</p>
          <button type="button" class="btn btn--primary" data-fc-done>Close</button>
        </div>`;
      body.querySelector("[data-fc-done]").addEventListener("click", close);
      body.querySelector("[data-fc-done]").focus();
    }

    function handleKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (finished) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (event.key === " " || event.key === "Enter") {
        /* Buttons keep their own Space/Enter behaviour. */
        if (event.target.closest?.("button")) {
          return;
        }
        event.preventDefault();
        flip();
      }
    }

    document.addEventListener("keydown", handleKey);
    overlay.addEventListener("mousedown", (event) => {
      if (event.target === overlay) {
        close();
      }
    });
    overlay.querySelector("[data-fc-close]").addEventListener("click", close);

    renderCard();
    dialog.focus({ preventScroll: true });
    body.querySelector("[data-fc-card]")?.focus();
  }

  return { openReview, renderBox };
})();
