/* ==========================================================================
   FlashcardModel
   --------------------------------------------------------------------------
   Turns completed chapters into flashcards and remembers how each one went.
   Pure state — no DOM.

   Cards are derived from courseData, so there is no second copy of the
   course to keep in sync: every chapter a learner has completed contributes
   one overview card, plus one card per choice / text exercise and per
   ordering challenge. Code-writing exercises are left out — they do not
   fit on a card.

   Scheduling is deliberately simple: a card marked "Got it" is not shown
   again for REVIEW_INTERVAL_DAYS days; a card that is new or was marked
   "Again" is due straight away.

   Results are stored per local user, like course progress.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.FlashcardModel = (function () {
  "use strict";

  const { readJSON, remove, writeJSON } = Pung.StorageService;
  const { getCurrentUser } = Pung.UserModel;

  const STORAGE_PREFIX = "pungAcademyFlashcards_";
  const SESSION_PREFIX = "pungAcademyFlashcardSession_";
  const SESSION_SIZE = 20;
  const REVIEW_INTERVAL_DAYS = 7;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const RESULT_AGAIN = "again";
  const RESULT_GOOD = "good";

  function storageKey() {
    const user = getCurrentUser();
    return STORAGE_PREFIX + (user?.email || "guest");
  }

  function sessionKey() {
    const user = getCurrentUser();
    return SESSION_PREFIX + (user?.email || "guest");
  }

  function readResults() {
    const stored = readJSON(storageKey(), {});
    return stored && typeof stored === "object" ? stored : {};
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /* ------------------------------------------------------------ card building */

  function baseCard(course, chapterNumber, chapter, suffix) {
    return {
      id: `${course.id}:${chapterNumber}:${suffix}`,
      courseTitle: course.title,
      chapter: chapterNumber,
      chapterTitle: chapter.title
    };
  }

  function overviewCard(course, chapterNumber, chapter) {
    if (!Array.isArray(chapter.topics) || chapter.topics.length === 0) {
      return null;
    }
    return {
      ...baseCard(course, chapterNumber, chapter, "overview"),
      type: "overview",
      prompt: `What does “${chapter.title}” cover?`,
      topics: chapter.topics,
      explanation: chapter.summary || ""
    };
  }

  /** Convert one exercise definition, or null if it does not suit a card. */
  function exerciseCard(course, chapterNumber, chapter, exercise, suffix) {
    const base = baseCard(course, chapterNumber, chapter, suffix);

    if (exercise.kind === "choice" && Array.isArray(exercise.choices)) {
      return {
        ...base,
        type: "choice",
        prompt: exercise.prompt,
        choices: exercise.choices,
        answerIndex: exercise.answer,
        explanation: exercise.explanation || ""
      };
    }

    if (exercise.kind === "text" && Array.isArray(exercise.answer)) {
      return {
        ...base,
        type: "text",
        prompt: exercise.prompt,
        answerText: exercise.answer[0],
        explanation: exercise.explanation || ""
      };
    }

    if (exercise.kind === "order" && Array.isArray(exercise.items)) {
      return {
        ...base,
        type: "order",
        prompt: exercise.prompt,
        items: exercise.items,
        explanation: exercise.explanation || ""
      };
    }

    return null;
  }

  /** Every card the learner has earned, across all courses. */
  function buildAllCards() {
    const cards = [];

    Object.values(Pung.courseData.courses).forEach((course) => {
      const progress = Pung.CourseProgressModel.forCourse(course.id);

      progress.getCourseProgress().completedChapters.forEach((number) => {
        const chapter = course.chapters[number];
        if (!chapter) {
          return;
        }

        const overview = overviewCard(course, number, chapter);
        if (overview) {
          cards.push(overview);
        }

        (chapter.exercises || []).forEach((exercise, index) => {
          const card = exerciseCard(course, number, chapter, exercise, `e${index}`);
          if (card) {
            cards.push(card);
          }
        });

        if (chapter.challenge) {
          const card = exerciseCard(course, number, chapter, chapter.challenge, "c");
          if (card) {
            cards.push(card);
          }
        }
      });
    });

    return cards;
  }

  /* ------------------------------------------------------------------ queries */

  /** When a rated card is due again, in ms; 0 for new and missed cards. */
  function dueAt(card, results) {
    const entry = results[card.id];
    if (entry?.result !== RESULT_GOOD) {
      return 0;
    }
    return new Date(entry.at).getTime() + REVIEW_INTERVAL_DAYS * DAY_MS;
  }

  /** Numbers for the box on the Lessons page. */
  function getSummary() {
    const cards = buildAllCards();
    const results = readResults();
    const now = Date.now();

    const due = cards.filter((card) => dueAt(card, results) <= now);
    const upcoming = cards.map((card) => dueAt(card, results)).filter((time) => time > now);
    const nextDueAt = upcoming.length > 0 ? Math.min(...upcoming) : null;

    const session = loadSession();
    const resume = !!session && (session.index > 0 || Object.keys(session.results).length > 0);

    return { total: cards.length, due: due.length, nextDueAt, resume };
  }

  /**
   * One review session, drawn from the cards that are due: missed cards
   * first, then cards never seen (newest chapters first), then "Got it"
   * cards whose week is up. Shuffled within each group.
   */
  function buildSession(limit = SESSION_SIZE) {
    const results = readResults();
    const now = Date.now();

    const rank = (card) => {
      const result = results[card.id]?.result;
      if (result === RESULT_AGAIN) {
        return 0;
      }
      return result === RESULT_GOOD ? 2 : 1;
    };

    return shuffle(buildAllCards().filter((card) => dueAt(card, results) <= now))
      .sort((a, b) => {
        const byRank = rank(a) - rank(b);
        if (byRank !== 0) {
          return byRank;
        }
        return rank(a) === 1 ? b.chapter - a.chapter : 0;
      })
      .slice(0, limit);
  }

  /* ------------------------------------------------- resuming a session ---
     The session in progress (its cards, the position and this round's
     ratings) is saved as the learner moves, so closing the overlay or the
     tab picks up in the same place. Cards are stored by id and rebuilt from
     courseData, so a card that no longer exists is simply skipped. */

  function saveSession(cards, index, results) {
    writeJSON(sessionKey(), { ids: cards.map((card) => card.id), index, results });
  }

  function clearSession() {
    remove(sessionKey());
  }

  /** @returns {{cards: Array, index: number, results: Object}|null} */
  function loadSession() {
    const saved = readJSON(sessionKey(), null);
    if (!saved || !Array.isArray(saved.ids)) {
      return null;
    }
    const byId = new Map(buildAllCards().map((card) => [card.id, card]));
    const cards = saved.ids.map((id) => byId.get(id)).filter(Boolean);
    if (cards.length === 0) {
      return null;
    }
    const index = Math.min(Math.max(0, Number(saved.index) || 0), cards.length - 1);
    const results = saved.results && typeof saved.results === "object" ? saved.results : {};
    return { cards, index, results };
  }

  /* ------------------------------------------------------------------ writing */

  function recordResult(cardId, result) {
    if (result !== RESULT_AGAIN && result !== RESULT_GOOD) {
      return;
    }
    const results = readResults();
    results[cardId] = { result, at: new Date().toISOString() };
    writeJSON(storageKey(), results);
  }

  return { RESULT_AGAIN, RESULT_GOOD, buildSession, clearSession, getSummary, loadSession, recordResult, saveSession, shuffle };
})();
