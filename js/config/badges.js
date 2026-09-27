/* ==========================================================================
   Gamification config — XP values, level titles and badges
   --------------------------------------------------------------------------
   Static data only. GamificationModel turns these into numbers and unlock
   states; nothing here runs any logic.

   A badge unlocks when the learner's `stat` reaches `atLeast`. The stats
   themselves are defined (and computed) in GamificationModel.computeStats:

     solved          lesson exercises + challenges + Arena exercises passed
     lessonItems     lesson exercises passed (challenges included)
     challenges      lesson module challenges passed
     arenaSolved     Arena exercises solved
     arenaHard       Arena exercises solved at 3-star difficulty
     chaptersDone    chapters completed across every course
     introComplete   1 once Introduction to Programming is finished
     branchChapters  chapters completed in Software Engineering + AI
     bestStreak      longest run of consecutive study days
     level           current level
     xp              total XP earned
     seComplete      1 once Software Engineering is finished
     aiComplete      1 once Artificial Intelligence is finished
     coursesComplete number of courses finished (0-3)
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.gamificationConfig = {
  /* XP is derived from progress, not stored, so changing a value here
     re-scores every learner consistently. */
  xp: {
    lessonExercise: 10, // choice, text and order exercises
    lessonCodeExercise: 20, // exercises written in the code editor
    challenge: 50, // the module challenge that closes each chapter
    chapter: 25, // bonus for completing a chapter
    course: 200, // bonus for finishing a whole course
    arenaPerStar: 20, // Arena exercises: 20 / 40 / 60 for 1 / 2 / 3 stars
  },

  /* Level n needs xpBase * n * (n - 1) total XP: 100, 300, 600, 1000 ... */
  levelBase: 50,
  levelTitles: [
    "Rookie",
    "Apprentice",
    "Coder",
    "Debugger",
    "Builder",
    "Architect",
    "Engineer",
    "Veteran",
    "Master",
    "Legend",
  ],

  badges: [
    {
      id: "first-steps",
      name: "First Steps",
      icon: "👣",
      description: "Pass your first exercise, in a lesson or in the Arena.",
      stat: "solved",
      atLeast: 1,
    },
    {
      id: "warming-up",
      name: "Warming Up",
      icon: "⚡",
      description: "Pass 10 exercises.",
      stat: "solved",
      atLeast: 10,
    },
    {
      id: "centurion",
      name: "Centurion",
      icon: "💯",
      description: "Pass 50 exercises. Consistency beats talent.",
      stat: "solved",
      atLeast: 50,
    },
    {
      id: "challenger",
      name: "Challenger",
      icon: "🏁",
      description: "Pass your first module challenge at the end of a chapter.",
      stat: "challenges",
      atLeast: 1,
    },
    {
      id: "boss-slayer",
      name: "Boss Slayer",
      icon: "🐉",
      description: "Pass 10 module challenges.",
      stat: "challenges",
      atLeast: 10,
    },
    {
      id: "chapter-one",
      name: "Chapter Closed",
      icon: "📖",
      description: "Complete your first chapter.",
      stat: "chaptersDone",
      atLeast: 1,
    },
    {
      id: "trunk-climber",
      name: "Trunk Climber",
      icon: "🧗",
      description: "Complete 8 chapters.",
      stat: "chaptersDone",
      atLeast: 8,
    },
    {
      id: "bookworm",
      name: "Bookworm",
      icon: "📚",
      description: "Complete 20 chapters across any course.",
      stat: "chaptersDone",
      atLeast: 20,
    },
    {
      id: "graduate",
      name: "Graduate",
      icon: "🎓",
      description: "Finish every chapter of Introduction to Programming.",
      stat: "introComplete",
      atLeast: 1,
    },
    {
      id: "branching-out",
      name: "Branching Out",
      icon: "🌿",
      description: "Complete a chapter in Software Engineering or Artificial Intelligence.",
      stat: "branchChapters",
      atLeast: 1,
    },
    {
      id: "software-engineer",
      name: "Software Engineer",
      icon: "🛠️",
      description: "Finish every chapter of the Software Engineering course.",
      stat: "seComplete",
      atLeast: 1,
    },
    {
      id: "ai-engineer",
      name: "AI Engineer",
      icon: "🤖",
      description: "Finish every chapter of the Artificial Intelligence course.",
      stat: "aiComplete",
      atLeast: 1,
    },
    {
      id: "polymath",
      name: "Polymath",
      icon: "🧠",
      description: "Finish all three courses.",
      stat: "coursesComplete",
      atLeast: 3,
    },
    {
      id: "arena-debut",
      name: "Arena Debut",
      icon: "⚔️",
      description: "Solve your first exercise in the Arena.",
      stat: "arenaSolved",
      atLeast: 1,
    },
    {
      id: "arena-regular",
      name: "Arena Regular",
      icon: "🛡️",
      description: "Solve 10 exercises in the Arena.",
      stat: "arenaSolved",
      atLeast: 10,
    },
    {
      id: "arena-veteran",
      name: "Arena Veteran",
      icon: "🏟️",
      description: "Solve 30 exercises in the Arena.",
      stat: "arenaSolved",
      atLeast: 30,
    },
    {
      id: "arena-champion",
      name: "Arena Champion",
      icon: "👑",
      description: "Solve 60 exercises in the Arena.",
      stat: "arenaSolved",
      atLeast: 60,
    },
    {
      id: "hard-mode",
      name: "Hard Mode",
      icon: "💎",
      description: "Solve a 3-star exercise in the Arena.",
      stat: "arenaHard",
      atLeast: 1,
    },
    {
      id: "on-fire",
      name: "On Fire",
      icon: "🔥",
      description: "Reach a 3-day streak. Study or solve something every day.",
      stat: "bestStreak",
      atLeast: 3,
    },
    {
      id: "week-warrior",
      name: "Week Warrior",
      icon: "🗓️",
      description: "Reach a 7-day streak.",
      stat: "bestStreak",
      atLeast: 7,
    },
    {
      id: "two-week-titan",
      name: "Two-Week Titan",
      icon: "🌋",
      description: "Reach a 14-day streak.",
      stat: "bestStreak",
      atLeast: 14,
    },
    {
      id: "unstoppable",
      name: "Unstoppable",
      icon: "🚀",
      description: "Reach a 30-day streak.",
      stat: "bestStreak",
      atLeast: 30,
    },
    {
      id: "xp-hoarder",
      name: "XP Hoarder",
      icon: "💰",
      description: "Earn 1,000 XP in total.",
      stat: "xp",
      atLeast: 1000,
    },
    {
      id: "rising-star",
      name: "Rising Star",
      icon: "⭐",
      description: "Reach level 5.",
      stat: "level",
      atLeast: 5,
    },
  ],
};
