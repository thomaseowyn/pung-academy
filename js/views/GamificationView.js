/* ==========================================================================
   GamificationView
   --------------------------------------------------------------------------
   Everything the learner sees of XP, levels, badges and the streak: the
   flame in the navbar, the home-page dashboard, the Arena's level and badge
   panels, the "+N XP" chips on exercises, and the reward toasts. DOM only —
   all numbers come from GamificationModel.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.GamificationView = (function () {
  "use strict";

  const Model = Pung.GamificationModel;
  const { routes } = Pung.PathService;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Two nested flames, filled from CSS so the same drawing can be lit,
     at-risk or out. */
  const FLAME_SVG =
    '<svg class="flame" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path class="flame__outer" d="M12 2.2c.7 3.5-1.3 5.2-2.9 7.2C7.6 11.3 6 13.2 6 16a6 6 0 0 0 12 0c0-2.2-.9-4-2.2-5.4-.2 1.5-.9 2.4-2 2.8.7-3.7-.3-7.9-1.8-11.2z"/>' +
    '<path class="flame__inner" d="M12 21.2a3.3 3.3 0 0 1-3.3-3.3c0-1.8 1.2-2.7 2.1-4 .4 1 1.1 1.6 1.9 1.8.9.9 1.6 1.5 1.6 2.4a3.3 3.3 0 0 1-2.3 3.1z"/>' +
    "</svg>";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatXp(n) {
    return Number(n).toLocaleString("en-US");
  }

  function formatDate(iso) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  /* -------------------------------------------------------------------- XP chip */

  function xpChipHtml(xp, earned) {
    return `<span class="xp-chip${earned ? " is-earned" : ""}" data-xp-chip data-xp="${xp}">${
      earned ? "&#10003; " : "+"
    }${xp} XP</span>`;
  }

  /** DOM version, for views that build nodes rather than strings. */
  function createXpChip(xp, earned) {
    const holder = document.createElement("span");
    holder.innerHTML = xpChipHtml(xp, earned);
    return holder.firstElementChild;
  }

  /** Flip a chip inside `root` to its "earned" state. */
  function markEarned(root) {
    const chip = root && root.querySelector("[data-xp-chip]");
    if (chip && !chip.classList.contains("is-earned")) {
      chip.classList.add("is-earned");
      chip.innerHTML = `&#10003; ${chip.getAttribute("data-xp")} XP`;
    }
  }

  /* ---------------------------------------------------------------------- streak */

  function streakState(streak) {
    if (streak.current === 0) {
      return "out";
    }
    return streak.atRisk ? "risk" : "lit";
  }

  function streakTip(streak) {
    const rule = "Study or solve something every day. Miss a day and it resets. Flashcards don't count.";
    if (streak.current === 0) {
      return { title: "No streak yet", text: `Pass an exercise today to light the flame. ${rule}` };
    }
    const days = `${streak.current}-day streak`;
    return streak.atRisk
      ? { title: days, text: `Pass an exercise today or you lose it! ${rule}` }
      : { title: days, text: `Safe for today, come back tomorrow. Best so far: ${streak.best}. ${rule}` };
  }

  /** The flame with its day count tucked up beside it like an exponent. */
  function flameHtml(streak) {
    return `<span class="flame-wrap flame-wrap--${streakState(streak)}">${FLAME_SVG}<sup class="flame-wrap__count">${streak.current}</sup></span>`;
  }

  function streakChipHtml() {
    const streak = Model.getStreak();
    const tip = streakTip(streak);
    return `
      <a class="streak-chip" href="${routes.exercises()}" data-streak-chip aria-label="${escapeHtml(
        `${tip.title}. ${tip.text}`
      )}">
        ${flameHtml(streak)}
        <span class="gx-tip gx-tip--below gx-tip--right" role="tooltip">
          <strong>${escapeHtml(tip.title)}</strong>
          <span>${escapeHtml(tip.text)}</span>
        </span>
      </a>`;
  }

  function refreshStreakChip() {
    document.querySelectorAll("[data-streak-chip]").forEach((chip) => {
      const holder = document.createElement("div");
      holder.innerHTML = streakChipHtml();
      chip.replaceWith(holder.firstElementChild);
    });
  }

  /* ---------------------------------------------------------------------- badges */

  function badgeTipDetail(badge) {
    if (badge.unlocked) {
      return badge.unlockedAt ? `Unlocked ${formatDate(badge.unlockedAt)}` : "Unlocked";
    }
    return badge.progress.target > 1
      ? `Locked · ${badge.progress.value} / ${badge.progress.target}`
      : "Locked";
  }

  /**
   * @param {Object} badge from GamificationModel.getProfile().badges
   * @param {string} [tipClass] extra class for the popup, to steer where it opens
   */
  function badgeHtml(badge, tipClass) {
    return `
      <li class="gx-badge ${badge.unlocked ? "is-unlocked" : "is-locked"}" tabindex="0"
          aria-label="${escapeHtml(`${badge.name}, ${badge.unlocked ? "unlocked" : "locked"}. ${badge.description}`)}">
        <span class="gx-badge__icon" aria-hidden="true">${badge.icon}</span>
        <span class="gx-tip ${tipClass || ""}" role="tooltip">
          <strong>${escapeHtml(badge.name)}</strong>
          <span>${escapeHtml(badge.description)}</span>
          <em>${escapeHtml(badgeTipDetail(badge))}</em>
        </span>
      </li>`;
  }

  /* ------------------------------------------------------------------- toasts */

  function toastStack() {
    let stack = document.querySelector("[data-gx-toasts]");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "gx-toasts";
      stack.setAttribute("data-gx-toasts", "");
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    return stack;
  }

  function toast(html, kind, delay) {
    window.setTimeout(() => {
      const node = document.createElement("div");
      node.className = `gx-toast gx-toast--${kind}`;
      node.innerHTML = html;
      toastStack().appendChild(node);
      window.setTimeout(() => node.classList.add("is-leaving"), 3400);
      window.setTimeout(() => node.remove(), 3800);
    }, delay);
  }

  /**
   * Show what GamificationModel.recordActivity() reported, then refresh
   * every live piece of gamification UI on the page.
   */
  function celebrate(result) {
    if (!result) {
      return;
    }
    let step = 0;
    const next = () => step++ * (reduceMotion ? 0 : 380);

    if (result.xpGained > 0) {
      toast(`<span class="gx-toast__big">+${formatXp(result.xpGained)} XP</span>`, "xp", next());
    }
    if (result.streakExtended) {
      toast(
        `${FLAME_SVG}<span><strong>${result.streak.current}-day streak</strong> keep it burning</span>`,
        "streak",
        next()
      );
    }
    if (result.leveledUp) {
      toast(
        `<span class="gx-toast__big">Level ${result.leveledUp.level}</span><span>${escapeHtml(
          result.leveledUp.title
        )}</span>`,
        "level",
        next()
      );
    }
    result.newBadges.forEach((badge) => {
      toast(
        `<span class="gx-toast__icon">${badge.icon}</span><span><strong>Badge unlocked</strong> ${escapeHtml(
          badge.name
        )}</span>`,
        "badge",
        next()
      );
    });

    refreshAll();
  }

  /* --------------------------------------------------------------- live redraw */

  const refreshers = [];

  function refreshAll() {
    refreshStreakChip();
    refreshers.forEach((fn) => fn());
  }

  /* -------------------------------------------------------------- level meter */

  /** A progress bar that grows from where it was to where it is now. */
  function animateBar(root, percent, previous) {
    const fill = root.querySelector("[data-gx-fill]");
    if (!fill) {
      return;
    }
    if (reduceMotion || previous === null) {
      fill.style.width = `${percent}%`;
      return;
    }
    fill.style.width = `${previous}%`;
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => (fill.style.width = `${percent}%`)));
  }

  /* --------------------------------------------------------------- Arena panels */

  function levelTableHtml(currentLevel) {
    const rows = Model.getLevelTable()
      .map((row, i, all) => {
        const state = row.level < currentLevel ? "is-reached" : row.level === currentLevel ? "is-current" : "";
        const last = i === all.length - 1;
        return `
          <li class="gx-levels__row ${state}"${state === "is-current" ? ' aria-current="true"' : ""}>
            <span class="gx-levels__num">${row.level}</span>
            <span class="gx-levels__name">${escapeHtml(row.title)}</span>
            <span class="gx-levels__xp">${formatXp(row.xpRequired)} XP${last ? "+" : ""}</span>
          </li>`;
      })
      .join("");
    return `<ol class="gx-levels">${rows}</ol>`;
  }

  function arenaSidebarHtml(profile, levelsOpen) {
    const { level, stats, streak } = profile;
    const toNext =
      `${formatXp(level.xpToNext)} XP to Level ${level.level + 1}` + (level.nextTitle ? ` &middot; ${escapeHtml(level.nextTitle)}` : "");

    const badgeItems = profile.badges
      .map((badge, i) => {
        const col = i % 4;
        return badgeHtml(badge, col === 0 ? "gx-tip--left" : col === 3 ? "gx-tip--right" : "");
      })
      .join("");

    return `
      <section class="arena-panel gx-level" aria-label="Your level">
        <header class="arena-panel__bar">
          <span class="arena-panel__label arena-cursor">~/level</span>
        </header>
        <div class="arena-panel__body gx-level__body">
          <div class="gx-level__top">
            <span class="gx-disc"><small>LV</small>${level.level}</span>
            <div class="gx-level__id">
              <p class="gx-level__title">${escapeHtml(level.title)}</p>
              <p class="gx-level__total">${formatXp(profile.xp)} XP total</p>
            </div>
            <span class="gx-level__streak" title="Day streak">${flameHtml(streak)}</span>
          </div>

          <div class="gx-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${level.percent}" aria-label="Progress to next level">
            <span class="gx-bar__fill" data-gx-fill></span>
          </div>
          <p class="gx-level__next"><span>${formatXp(level.xpIntoLevel)} / ${formatXp(level.xpForLevel)}</span><span>${toNext}</span></p>

          <dl class="gx-stats">
            <div><dt>Lesson exercises</dt><dd>${stats.lessonItems}</dd></div>
            <div><dt>Arena solved</dt><dd>${stats.arenaSolved}</dd></div>
            <div><dt>Chapters done</dt><dd>${stats.chaptersDone}</dd></div>
            <div><dt>Best streak</dt><dd>${streak.best}<small> d</small></dd></div>
          </dl>

          <p class="gx-level__rule">
            The flame lights when you pass an exercise or finish a chapter. Skip a day and it goes out.
            Flashcards don't count.
          </p>

          <button type="button" class="gx-level__toggle" data-gx-levels-toggle aria-expanded="${levelsOpen}" aria-controls="gx-all-levels">
            <span>All ${Model.getLevelTable().length} levels</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="gx-level__all" id="gx-all-levels"${levelsOpen ? "" : " hidden"}>
            ${levelTableHtml(level.level)}
            <p class="gx-levels__note">Keep earning XP past level ${Model.getLevelTable().length} and you stay a Legend.</p>
          </div>
        </div>
      </section>

      <section class="arena-panel gx-badges-panel" aria-label="Badges">
        <header class="arena-panel__bar">
          <span class="arena-panel__label arena-cursor">~/badges</span>
          <span class="gx-badges-panel__count">${profile.unlockedCount} / ${profile.badges.length}</span>
        </header>
        <div class="arena-panel__body">
          <ul class="gx-badges">${badgeItems}</ul>
        </div>
      </section>

      <section class="arena-panel gx-earn" aria-label="How XP works">
        <header class="arena-panel__bar">
          <span class="arena-panel__label arena-cursor">~/xp-table</span>
        </header>
        <div class="arena-panel__body">
          <dl class="gx-earn__list">
            <div><dt>Lesson exercise</dt><dd>10 XP</dd></div>
            <div><dt>Code exercise</dt><dd>20 XP</dd></div>
            <div><dt>Module challenge</dt><dd>50 XP</dd></div>
            <div><dt>Chapter complete</dt><dd>25 XP</dd></div>
            <div><dt>Course complete</dt><dd>200 XP</dd></div>
            <div><dt>Arena exercise</dt><dd>20 / 40 / 60 XP</dd></div>
          </dl>
        </div>
      </section>`;
  }

  /** Level, badge and XP-table panels in the Arena's right-hand column. */
  function renderArenaSidebar(mount) {
    if (!mount) {
      return;
    }
    let lastPercent = null;
    let levelsOpen = false;

    function draw() {
      const profile = Model.getProfile();
      mount.innerHTML = arenaSidebarHtml(profile, levelsOpen);
      animateBar(mount, profile.level.percent, lastPercent);
      lastPercent = profile.level.percent;
    }

    /* Pressing anywhere on the level card opens or closes the full list.
       Delegated, so it survives every redraw. */
    mount.addEventListener("click", (event) => {
      const card = event.target.closest(".gx-level");
      if (!card || event.target.closest(".gx-level__all")) {
        return;
      }
      levelsOpen = !levelsOpen;
      const list = card.querySelector(".gx-level__all");
      const toggle = card.querySelector("[data-gx-levels-toggle]");
      list.hidden = !levelsOpen;
      toggle.setAttribute("aria-expanded", String(levelsOpen));
    });

    draw();
    refreshers.push(draw);
  }

  /* ------------------------------------------------------------ home dashboard */

  function dashboardBodyHtml(profile) {
    const { level, streak } = profile;
    const unlocked = profile.badges.filter((b) => b.unlocked);
    const shown = unlocked.slice(0, 7);
    const badgeItems = shown.length
      ? shown
          .map((badge, i) =>
            badgeHtml(badge, i >= shown.length - 3 && shown.length > 3 ? "gx-tip--below gx-tip--right" : "gx-tip--below")
          )
          .join("")
      : '<li class="gx-dash__nobadge">No badges yet. Pass an exercise to earn your first.</li>';
    const more = unlocked.length - shown.length;

    return `
      <div class="gx-dash__cell gx-dash__level">
        <span class="gx-disc gx-disc--sm"><small>LV</small>${level.level}</span>
        <div>
          <p class="gx-dash__title">${escapeHtml(level.title)}</p>
          <p class="gx-dash__sub">${formatXp(profile.xp)} XP total</p>
        </div>
      </div>

      <div class="gx-dash__cell gx-dash__xp">
        <div class="gx-dash__xprow">
          <span>Level ${level.level + 1} in ${formatXp(level.xpToNext)} XP</span>
          <span>${formatXp(level.xpIntoLevel)} / ${formatXp(level.xpForLevel)}</span>
        </div>
        <div class="gx-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${level.percent}" aria-label="Progress to next level">
          <span class="gx-bar__fill" data-gx-fill></span>
        </div>
      </div>

      <div class="gx-dash__cell gx-dash__streak">
        <a class="gx-dash__streaklink" href="${routes.exercises()}">
          ${flameHtml(streak)}
          <span class="gx-dash__streaktext"><strong>${streak.current}</strong> day streak</span>
          <span class="gx-tip gx-tip--below" role="tooltip">
            <strong>${escapeHtml(streakTip(streak).title)}</strong>
            <span>${escapeHtml(streakTip(streak).text)}</span>
          </span>
        </a>
      </div>

      <div class="gx-dash__cell gx-dash__badges">
        <ul class="gx-badges gx-badges--row">${badgeItems}${
      more > 0 ? `<li class="gx-dash__more">+${more}</li>` : ""
    }</ul>
        <span class="gx-dash__count">${profile.unlockedCount} / ${profile.badges.length} badges</span>
      </div>`;
  }

  /**
   * The compact profile strip between the header and the home page: a short
   * terminal boot sequence (like the Arena's), then level, XP, streak and
   * unlocked badges. Signed-out visitors get a one-line invitation instead.
   */
  function renderDashboard(mount, isSignedIn) {
    if (!mount) {
      return;
    }
    document.body.classList.add("has-dash");

    if (!isSignedIn) {
      mount.innerHTML = `
        <div class="container">
          <div class="gx-dash gx-dash--guest gx-dark">
            <span class="gx-dash__guesticon">${FLAME_SVG}</span>
            <p><strong>Track your XP, level and streak.</strong> Log in to earn badges as you learn.</p>
            <a class="btn btn--primary" href="${routes.login()}">Log in</a>
          </div>
        </div>`;
      return;
    }

    mount.innerHTML = `
      <div class="container">
        <div class="gx-dash gx-dark" data-gx-dash>
          <div class="gx-dash__boot" data-gx-boot aria-hidden="true"></div>
          <div class="gx-dash__body" data-gx-body></div>
        </div>
      </div>`;

    const dash = mount.querySelector("[data-gx-dash]");
    const body = mount.querySelector("[data-gx-body]");
    let lastPercent = null;

    function draw() {
      const profile = Model.getProfile();
      body.innerHTML = dashboardBodyHtml(profile);
      animateBar(body, profile.level.percent, lastPercent);
      lastPercent = profile.level.percent;
    }

    draw();
    refreshers.push(draw);

    /* Show the boot log alone, then swap it for the dashboard. */
    if (reduceMotion) {
      dash.classList.add("is-ready");
      return;
    }
    const boot = mount.querySelector("[data-gx-boot]");
    const lines = ["loading your profile...", "counting your XP...", { text: "dashboard ready.", ok: true }];
    let i = 0;
    (function next() {
      if (i >= lines.length) {
        window.setTimeout(() => {
          dash.classList.add("is-ready");
          /* Replay the bar fill now that it is actually visible. */
          const profile = Model.getProfile();
          animateBar(body, profile.level.percent, 0);
        }, 200);
        return;
      }
      const item = lines[i];
      const span = document.createElement("span");
      span.textContent = typeof item === "object" ? item.text : item;
      if (typeof item === "object") {
        span.classList.add("is-ok");
      }
      boot.appendChild(span);
      i += 1;
      window.setTimeout(next, 240);
    })();
  }

  return {
    celebrate,
    createXpChip,
    markEarned,
    refreshAll,
    refreshStreakChip,
    renderArenaSidebar,
    renderDashboard,
    streakChipHtml,
    xpChipHtml,
  };
})();
