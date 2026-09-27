/* ==========================================================================
   GamificationModel
   --------------------------------------------------------------------------
   XP, levels, badges and the study streak. Pure state — no DOM.

   XP is DERIVED, never stored: it is recomputed from the learner's existing
   progress (lesson exercises, chapters, courses, Arena solves) every time it
   is asked for. That means it can never drift out of sync with the real
   progress records, and learners who were already mid-course when this
   feature shipped keep the XP they had already earned.

   The only things stored are the ones that cannot be derived:
     days      the calendar days on which the learner actually studied
     unlocked  when each badge was first unlocked
     seenXp / seenLevel   what the learner was last told, so recordActivity()
                          can report exactly what just changed

   The streak counts consecutive days on which the learner passed a lesson
   exercise, completed a chapter or solved an Arena exercise. Flashcards
   deliberately do not count. Miss a whole day and the streak is gone.

   Stored per local user, like every other progress record in the app.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.GamificationModel = (function () {
  "use strict";

  const { readJSON, writeJSON } = Pung.StorageService;
  const { getCurrentUser } = Pung.UserModel;
  const config = Pung.gamificationConfig;
  const { DEFAULT_COURSE_ID } = Pung.courseData;

  const STORAGE_PREFIX = "pungAcademyGamification_";
  const MAX_DAYS_KEPT = 400;
  const DAY_MS = 24 * 60 * 60 * 1000;

  function storageKey() {
    const user = getCurrentUser();
    return STORAGE_PREFIX + (user?.email || "guest");
  }

  /* ------------------------------------------------------------------ record */

  function emptyRecord() {
    return { days: [], unlocked: {}, seenXp: 0, seenLevel: 1 };
  }

  function hasRecord() {
    return readJSON(storageKey(), null) !== null;
  }

  function readRecord() {
    const stored = readJSON(storageKey(), null);
    if (!stored || typeof stored !== "object") {
      return emptyRecord();
    }
    return {
      days: Array.isArray(stored.days) ? stored.days.filter((d) => typeof d === "string") : [],
      unlocked: stored.unlocked && typeof stored.unlocked === "object" ? stored.unlocked : {},
      seenXp: Number(stored.seenXp) || 0,
      seenLevel: Number(stored.seenLevel) || 1,
    };
  }

  function writeRecord(record) {
    writeJSON(storageKey(), record);
  }

  /* --------------------------------------------------------------------- XP */

  function xpForExercise(exercise, isChallenge) {
    const { xp } = config;
    if (isChallenge) {
      return xp.challenge;
    }
    return exercise && exercise.kind === "code" ? xp.lessonCodeExercise : xp.lessonExercise;
  }

  function xpForArena(difficulty) {
    return config.xp.arenaPerStar * (Number(difficulty) || 1);
  }

  /** Everything a chapter can pay out: its exercises, challenge and completion bonus. */
  function chapterXp(chapter, chapterNumber, totalChapters) {
    let total = config.xp.chapter;
    if (Array.isArray(chapter.exercises)) {
      chapter.exercises.forEach((exercise) => {
        total += xpForExercise(exercise, false);
      });
    } else if (chapter.exercise) {
      total += xpForExercise(chapter.exercise, false);
    }
    if (chapter.challenge) {
      total += xpForExercise(chapter.challenge, true);
    }
    if (chapterNumber === totalChapters) {
      total += config.xp.course;
    }
    return total;
  }

  /* ----------------------------------------------------------------- levels */

  function levelInfo(xp) {
    const base = config.levelBase;
    let level = 1;
    while (xp >= base * (level + 1) * level) {
      level += 1;
    }
    const floor = base * level * (level - 1);
    const next = base * (level + 1) * level;
    const titles = config.levelTitles;
    const titleFor = (n) => titles[Math.min(n, titles.length) - 1];
    return {
      level,
      title: titleFor(level),
      nextTitle: titleFor(level + 1),
      xpIntoLevel: xp - floor,
      xpForLevel: next - floor,
      xpToNext: next - xp,
      percent: Math.min(100, Math.round(((xp - floor) / (next - floor)) * 100)),
    };
  }

  /** Every titled level and the total XP needed to reach it. */
  function getLevelTable() {
    return config.levelTitles.map((title, i) => ({
      level: i + 1,
      title,
      xpRequired: config.levelBase * (i + 1) * i,
    }));
  }

  /* ------------------------------------------------------------------ stats */

  /** Walk every course's stored progress and total up what has been earned. */
  function computeStats() {
    const { courses } = Pung.courseData;
    const stats = {
      xp: 0,
      solved: 0,
      lessonItems: 0,
      challenges: 0,
      arenaSolved: 0,
      arenaHard: 0,
      chaptersDone: 0,
      introComplete: 0,
      branchChapters: 0,
      seComplete: 0,
      aiComplete: 0,
      coursesComplete: 0,
    };

    Object.keys(courses).forEach((courseId) => {
      const course = courses[courseId];
      const progress = Pung.CourseProgressModel.forCourse(courseId);
      const record = progress.getCourseProgress();

      for (let number = 1; number <= course.totalChapters; number += 1) {
        const chapter = course.chapters[number];
        if (!chapter) {
          continue;
        }
        const finished = record.exercisesCompleted[String(number)] === true;
        const detail = record.exerciseProgress[String(number)];

        if (Array.isArray(chapter.exercises)) {
          chapter.exercises.forEach((exercise, index) => {
            if (finished || detail?.passed?.[index]) {
              stats.xp += xpForExercise(exercise, false);
              stats.lessonItems += 1;
            }
          });
        } else if (chapter.exercise && finished) {
          stats.xp += xpForExercise(chapter.exercise, false);
          stats.lessonItems += 1;
        }
        if (chapter.challenge && (finished || detail?.challengePassed)) {
          stats.xp += xpForExercise(chapter.challenge, true);
          stats.lessonItems += 1;
          stats.challenges += 1;
        }

        if (record.completedChapters.includes(number)) {
          stats.xp += config.xp.chapter;
          stats.chaptersDone += 1;
          if (courseId !== DEFAULT_COURSE_ID) {
            stats.branchChapters += 1;
          }
        }
      }

      if (progress.isCourseComplete()) {
        stats.xp += config.xp.course;
        stats.coursesComplete += 1;
        if (courseId === DEFAULT_COURSE_ID) {
          stats.introComplete = 1;
        }
        if (courseId === "softwareEngineering") {
          stats.seComplete = 1;
        }
        if (courseId === "ai") {
          stats.aiComplete = 1;
        }
      }
    });

    /* The Arena is optional on a page: without its data the lesson totals
       still stand. */
    const bank = Pung.exerciseBank?.bank;
    if (bank && Pung.ExerciseBankModel) {
      Object.keys(bank).forEach((courseId) => {
        Object.keys(bank[courseId]).forEach((unitId) => {
          bank[courseId][unitId].forEach((exercise) => {
            if (!Pung.ExerciseBankModel.isSolved(exercise.id)) {
              return;
            }
            stats.xp += xpForArena(exercise.difficulty);
            stats.arenaSolved += 1;
            if (exercise.difficulty === 3) {
              stats.arenaHard += 1;
            }
          });
        });
      });
    }

    stats.solved = stats.lessonItems + stats.arenaSolved;
    return stats;
  }

  /* ----------------------------------------------------------------- streak */

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  /** Local calendar day as "YYYY-MM-DD". */
  function dayKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function addDays(date, delta) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
  }

  /** Whole-day index of a "YYYY-MM-DD" key, so gaps can be measured exactly. */
  function dayIndex(key) {
    const [y, m, d] = key.split("-").map(Number);
    return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
  }

  /**
   * @returns {{current: number, best: number, activeToday: boolean, atRisk: boolean}}
   *   current is 0 the moment a whole day has been missed; atRisk means the
   *   streak is alive but today has not been studied yet.
   */
  function streakInfo(days, now = new Date()) {
    const set = new Set(days);
    const today = dayKey(now);
    const yesterday = dayKey(addDays(now, -1));
    const activeToday = set.has(today);

    let current = 0;
    if (activeToday || set.has(yesterday)) {
      let cursor = activeToday ? now : addDays(now, -1);
      while (set.has(dayKey(cursor))) {
        current += 1;
        cursor = addDays(cursor, -1);
      }
    }

    const sorted = Array.from(set)
      .map(dayIndex)
      .sort((a, b) => a - b);
    let best = 0;
    let run = 0;
    sorted.forEach((index, i) => {
      run = i > 0 && index - sorted[i - 1] === 1 ? run + 1 : 1;
      best = Math.max(best, run);
    });

    return { current, best: Math.max(best, current), activeToday, atRisk: current > 0 && !activeToday };
  }

  /* ----------------------------------------------------------------- badges */

  function evaluate(record) {
    const stats = computeStats();
    const streak = streakInfo(record.days);
    const levelData = levelInfo(stats.xp);
    stats.bestStreak = streak.best;
    stats.level = levelData.level;
    return { stats, streak, level: levelData };
  }

  function isEarned(badge, stats) {
    return (stats[badge.stat] || 0) >= badge.atLeast;
  }

  function badgeProgress(badge, stats) {
    return { value: Math.min(stats[badge.stat] || 0, badge.atLeast), target: badge.atLeast };
  }

  /* ---------------------------------------------------------------- queries */

  /** Everything the UI needs, read-only. */
  function getProfile() {
    const record = readRecord();
    const { stats, streak, level } = evaluate(record);

    const badges = config.badges.map((badge) => {
      const unlockedAt = record.unlocked[badge.id] || null;
      const unlocked = !!unlockedAt || isEarned(badge, stats);
      return { ...badge, unlocked, unlockedAt, progress: badgeProgress(badge, stats) };
    });

    return {
      xp: stats.xp,
      level,
      streak,
      stats,
      badges,
      unlockedCount: badges.filter((b) => b.unlocked).length,
    };
  }

  /** Just the streak — cheap enough for the navbar on every page. */
  function getStreak() {
    return streakInfo(readRecord().days);
  }

  /* ---------------------------------------------------------------- actions */

  /**
   * Call once per page load. The first time a learner is seen, quietly
   * record where they already are, so XP and badges they earned before this
   * feature existed are not announced as if they were new. On later loads it
   * only re-syncs the XP and level the learner has already been shown.
   */
  function ensureBaseline() {
    if (hasRecord()) {
      /* Progress can change outside a tracked event (a reset, or a record
         edited by hand). Re-sync what the learner "has already been told",
         so the next reward reports only what that action earned. */
      const existing = readRecord();
      const { stats, level } = evaluate(existing);
      /* Same for badges: one already earned (or added to the list since)
         is recorded quietly rather than announced as new. */
      const now = new Date().toISOString();
      let changed = existing.seenXp !== stats.xp || existing.seenLevel !== level.level;
      config.badges.forEach((badge) => {
        if (!existing.unlocked[badge.id] && isEarned(badge, stats)) {
          existing.unlocked[badge.id] = now;
          changed = true;
        }
      });
      if (changed) {
        existing.seenXp = stats.xp;
        existing.seenLevel = level.level;
        writeRecord(existing);
      }
      return;
    }
    const record = emptyRecord();
    const { stats, level } = evaluate(record);
    const now = new Date().toISOString();
    config.badges.forEach((badge) => {
      if (isEarned(badge, stats)) {
        record.unlocked[badge.id] = now;
      }
    });
    record.seenXp = stats.xp;
    record.seenLevel = level.level;
    writeRecord(record);
  }

  /**
   * Call after the learner passes an exercise, completes a chapter or solves
   * an Arena exercise — i.e. after the progress itself has been saved. Marks
   * today as studied and reports what changed since the last call.
   * @returns {{xpGained: number, leveledUp: Object|null, newBadges: Array,
   *            streak: Object, streakExtended: boolean, xp: number, level: Object}}
   */
  function recordActivity() {
    const record = readRecord();
    const before = streakInfo(record.days);

    const today = dayKey(new Date());
    if (!record.days.includes(today)) {
      record.days.push(today);
      record.days.sort();
      record.days = record.days.slice(-MAX_DAYS_KEPT);
    }

    const { stats, streak, level } = evaluate(record);

    const now = new Date().toISOString();
    const newBadges = config.badges.filter(
      (badge) => !record.unlocked[badge.id] && isEarned(badge, stats)
    );
    newBadges.forEach((badge) => {
      record.unlocked[badge.id] = now;
    });

    const result = {
      xp: stats.xp,
      xpGained: Math.max(0, stats.xp - record.seenXp),
      leveledUp: level.level > record.seenLevel ? level : null,
      newBadges,
      streak,
      streakExtended: streak.current > before.current,
      level,
    };

    record.seenXp = stats.xp;
    record.seenLevel = Math.max(record.seenLevel, level.level);
    writeRecord(record);
    return result;
  }

  return {
    chapterXp,
    ensureBaseline,
    getLevelTable,
    getProfile,
    getStreak,
    levelInfo,
    recordActivity,
    streakInfo,
    xpForArena,
    xpForExercise,
  };
})();
