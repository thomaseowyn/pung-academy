/* ==========================================================================
   FlashcardController
   --------------------------------------------------------------------------
   Glue between the flashcard model and view: draws the box on the Lessons
   page, and opens a review session on top of it.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.FlashcardController = (function () {
  "use strict";

  const Model = Pung.FlashcardModel;
  const View = Pung.FlashcardView;

  function refreshBox() {
    View.renderBox(Model.getSummary(), startReview);
  }

  function startReview() {
    /* Pick up where the last session was left, or deal a fresh one. */
    const session = Model.loadSession() || {
      cards: Model.buildSession(),
      index: 0,
      results: {}
    };
    if (session.cards.length === 0) {
      return;
    }
    View.openReview(session.cards, {
      startIndex: session.index,
      results: session.results,
      onProgress: (index, results) => Model.saveSession(session.cards, index, results),
      onResult: Model.recordResult,
      onFinish: Model.clearSession,
      onClose: refreshBox
    });
  }

  function initFlashcards() {
    refreshBox();
  }

  return { initFlashcards };
})();
