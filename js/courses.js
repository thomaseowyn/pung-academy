/* ==========================================================================
   Pung Academy — course data + progress engine
   --------------------------------------------------------------------------
   One source of truth for the Introduction to Programming course: chapter
   titles, topics, projects, video ids and exercise definitions, plus the
   localStorage progress API shared by courses.html, the course overview and
   all ten chapter pages.

   Progress is stored per local user so two accounts registered in the same
   browser do not share a position in the course.
   ========================================================================== */

window.PungCourses = (function () {
  "use strict";

  var COURSE_ID = "introductionToProgramming";
  var PROGRESS_PREFIX = "pungAcademyProgress_";
  var TOTAL_CHAPTERS = 10;

  /* ------------------------------------------------------------------
     Video configuration

     NOTE: these ids are intentionally empty. Rather than guess YouTube
     ids that may not exist (which would render a broken player), each
     chapter shows a clearly marked placeholder until a real id is added
     here. Drop the 11-character id from a video's URL into `videoId`
     and the player appears on that chapter with no other changes.
     ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------
     Chapter definitions
     ------------------------------------------------------------------ */
  var chapters = {
    1: {
      title: "What is Programming?",
      summary:
        "Understand what a program actually is, how problems are broken into steps, and how to plan a solution before writing any code.",
      topics: [
        "What is Programming?",
        "Algorithms & Problem Solving",
        "Pseudocode",
        "Flowcharts"
      ],
      videoId: "",
      videoTitle: "What is programming? — chapter 1 walkthrough",
      exercise: {
        kind: "choice",
        heading: "Concept check",
        prompt:
          "A friend asks you what an algorithm is. Which answer is closest to correct?",
        choices: [
          "A programming language used to write instructions for computers.",
          "A finite, ordered set of steps that solves a problem or completes a task.",
          "A piece of hardware inside the computer that performs calculations.",
          "A mistake in a program that makes it produce the wrong result."
        ],
        answer: 1,
        hint:
          "An algorithm is not a language and not hardware. Think about the recipe analogy from the chapter: what makes a recipe a recipe?",
        explanation:
          "An algorithm is the plan — an ordered list of steps that reliably gets you from a starting point to a result. The language you write it in comes afterwards."
      }
    },

    2: {
      title: "Your First Program",
      summary:
        "Write and run your first working program, learn how syntax rules work, and stop being afraid of error messages.",
      topics: [
        "Writing Your First Program",
        "Programming Syntax",
        "Running a Program",
        "Understanding Errors",
        "Debugging Basics"
      ],
      videoId: "",
      videoTitle: "Your first program — chapter 2 walkthrough",
      exercise: {
        kind: "choice",
        heading: "Concept check",
        prompt:
          "You run your program and Python reports: SyntaxError: '(' was never closed. What has gone wrong?",
        choices: [
          "The program ran, but produced the wrong answer.",
          "Python could not understand the code, because a bracket was left open.",
          "The computer has run out of memory.",
          "The file was saved with the wrong name."
        ],
        answer: 1,
        hint:
          "A SyntaxError happens before the program runs at all. Reread the section on what the two broad families of error mean.",
        explanation:
          "A SyntaxError means Python could not even read your code as valid instructions, so nothing ran. These are the easiest errors to fix: go to the line named and look for the unclosed or mistyped character."
      }
    },

    3: {
      title: "Variables & Data",
      summary:
        "Store information in named boxes, learn the basic types of data, and read input from the person using your program.",
      topics: [
        "Variables",
        "Data Types",
        "Strings",
        "Numbers",
        "Boolean Values",
        "User Input",
        "Type Conversion"
      ],
      project: "Personal Information Program",
      videoId: "",
      videoTitle: "Variables and data types — chapter 3 walkthrough",
      exercise: {
        kind: "code",
        heading: "Exercise — store and show information",
        prompt:
          "Create a variable for a person's name and one for their age, then print them both.",
        starter: "# Create your two variables below, then print them.\n",
        checks: [
          {
            test: /^[^\S\n]*[A-Za-z_]\w*\s*=\s*(['\"]).*?\1/m,
            message: "Assign a text value to a variable, for example name = \"Alex\"."
          },
          {
            test: /^[^\S\n]*[A-Za-z_]\w*\s*=\s*\d+/m,
            message: "Assign a number to a variable, for example age = 20."
          },
          {
            test: /print\s*\(/,
            message: "Use print(...) to display your variables."
          }
        ],
        hint:
          "You need three lines. Two assignments using =, then a print() that mentions both variable names. Text needs quotes; whole numbers do not.",
        solution:
          'name = "Alex"\nage = 20\n\nprint(name, age)',
        explanation:
          "You stored two different types of data — a string and an integer — and then displayed both. That is the foundation of every program that works with information."
      }
    },

    4: {
      title: "Operators",
      summary:
        "Do arithmetic, compare values, and combine true/false conditions to make your programs calculate and reason.",
      topics: [
        "Arithmetic Operators",
        "Comparison Operators",
        "Boolean Logic",
        "Logical Operators"
      ],
      project: "Simple Calculator",
      videoId: "",
      videoTitle: "Operators and boolean logic — chapter 4 walkthrough",
      exercise: {
        kind: "code",
        heading: "Exercise — total up a shopping basket",
        prompt:
          "Write a program that stores the price of two items, adds them into a total, and prints the total.",
        starter:
          "# Store two prices, add them into a total, then print the total.\n",
        checks: [
          {
            test: /^[^\S\n]*[A-Za-z_]\w*\s*=\s*\d+(\.\d+)?/m,
            message: "Store your first price in a variable, for example item_one = 4.50."
          },
          {
            test: /=\s*[A-Za-z_]\w*\s*\+\s*[A-Za-z_]\w*/,
            message:
              "Add your two variables together into a total, for example total = item_one + item_two."
          },
          {
            test: /print\s*\(/,
            message: "Print the total so the person running the program can see it."
          }
        ],
        hint:
          "Store each price in its own variable. Then make a third variable whose value is the first plus the second. Add the two variable names, not the numbers.",
        solution:
          "item_one = 4.50\nitem_two = 2.25\n\ntotal = item_one + item_two\nprint(\"Total:\", total)",
        explanation:
          "You used an arithmetic operator on two variables and stored the result in a third. Calculating from stored values, rather than from numbers typed inline, is what makes a program reusable."
      }
    },

    5: {
      title: "Making Decisions",
      summary:
        "Let your program choose between different paths using conditions, so it can react to whatever it is given.",
      topics: ["if", "else", "elif", "Nested Conditions", "Combining Conditions"],
      project: "Grade Calculator",
      videoId: "",
      videoTitle: "Conditions and branching — chapter 5 walkthrough",
      exercise: {
        kind: "code",
        heading: "Exercise — adult or not",
        prompt:
          "Ask for the user's age, then print a different message depending on whether they are 18 or older.",
        starter:
          "# Ask for an age, then decide what to print.\n",
        checks: [
          {
            test: /input\s*\(/,
            message: "Use input(...) to ask the person for their age."
          },
          {
            test: /int\s*\(|float\s*\(/,
            message:
              "input() gives you text. Convert it to a number with int(...) before comparing it."
          },
          {
            test: /\bif\b[^\n]*(>=|>|<|<=)/,
            message: "Use an if statement that compares the age against 18."
          },
          {
            test: /\belse\b|\belif\b/,
            message: "Handle the other case too, with else (or elif)."
          }
        ],
        hint:
          "Four ingredients: read with input(), wrap it in int(), compare with >= 18 inside an if, and give the alternative in an else. Remember the colon and the indented line underneath.",
        solution:
          'age = int(input("How old are you? "))\n\nif age >= 18:\n    print("You are an adult.")\nelse:\n    print("You are not an adult yet.")',
        explanation:
          "Your program now behaves differently depending on its input. Converting the text from input() into a number before comparing is the step beginners most often miss."
      }
    },

    6: {
      title: "Loops",
      summary:
        "Repeat work without repeating yourself, and learn how to stop or skip a repetition when you need to.",
      topics: ["Why Loops?", "for Loops", "while Loops", "break", "continue"],
      project: "Number Guessing Game",
      videoId: "",
      videoTitle: "Loops and repetition — chapter 6 walkthrough",
      exercise: {
        kind: "code",
        heading: "Exercise — count to ten",
        prompt: "Print the numbers 1 to 10, using a loop rather than ten print statements.",
        starter: "# Print 1 through 10 using a loop.\n",
        checks: [
          {
            test: /\bfor\b[\s\S]*\bin\b|\bwhile\b/,
            message: "Use a for loop or a while loop — not ten separate print calls."
          },
          {
            test: /print\s*\(/,
            message: "Print each number inside the loop."
          },
          {
            test: /range\s*\(\s*1\s*,\s*11\s*\)|<=\s*10|<\s*11/,
            message:
              "Make sure the loop actually reaches 10. range(1, 11) stops just before 11."
          }
        ],
        hint:
          "range(1, 11) produces 1 up to and including 10 — the second number is where it stops, not the last value. Put print() on an indented line inside the loop.",
        solution: "for number in range(1, 11):\n    print(number)",
        explanation:
          "One loop replaced ten lines. The off-by-one trap in range() is worth remembering: the end value is exclusive."
      }
    },

    7: {
      title: "Collections",
      summary:
        "Hold many values in one place with lists and dictionaries, and work through them with loops.",
      topics: [
        "Lists",
        "Accessing List Elements",
        "Modifying Lists",
        "Looping Through Lists",
        "Dictionaries",
        "Key-Value Pairs"
      ],
      project: "Student Grade Manager",
      videoId: "",
      videoTitle: "Lists and dictionaries — chapter 7 walkthrough",
      exercise: {
        kind: "code",
        heading: "Exercise — find the largest number",
        prompt:
          "Given a list of numbers, work out the largest one and print it. Write the logic yourself with a loop rather than only calling max().",
        starter: "numbers = [4, 19, 7, 2, 45, 13]\n\n# Find the largest value and print it.\n",
        checks: [
          {
            test: /\[[^\]]*,[^\]]*\]/,
            message: "Keep a list of several numbers to search through."
          },
          {
            test: /\bfor\b[\s\S]*\bin\b|\bwhile\b/,
            message: "Loop over the list to inspect each value."
          },
          {
            test: /\bif\b[^\n]*(>|<|>=|<=)/,
            message:
              "Inside the loop, compare each value against the largest one found so far."
          },
          {
            test: /print\s*\(/,
            message: "Print the largest value at the end."
          }
        ],
        hint:
          "Start by assuming the first item is the largest. Then loop through the list and, whenever you meet a bigger value, replace your stored largest with it. Print after the loop, not inside it.",
        solution:
          "numbers = [4, 19, 7, 2, 45, 13]\n\nlargest = numbers[0]\nfor number in numbers:\n    if number > largest:\n        largest = number\n\nprint(\"Largest:\", largest)",
        explanation:
          "This is the running-best pattern, and it appears constantly: keep a variable holding the best answer so far, and update it as you go."
      }
    },

    8: {
      title: "Functions",
      summary:
        "Give a name to a piece of work, hand it values, get an answer back, and split a big problem into small ones.",
      topics: [
        "Why Functions?",
        "Creating Functions",
        "Parameters",
        "Arguments",
        "Return Values",
        "Breaking Problems Into Functions"
      ],
      project: "Quiz Game",
      videoId: "",
      videoTitle: "Functions and decomposition — chapter 8 walkthrough",
      exercise: {
        kind: "code",
        heading: "Exercise — a function that adds",
        prompt:
          "Create a function that takes two numbers, returns their sum, and then call it and print the result.",
        starter: "# Define your function, then call it and print what comes back.\n",
        checks: [
          {
            test: /\bdef\s+[A-Za-z_]\w*\s*\(\s*[A-Za-z_]\w*\s*,\s*[A-Za-z_]\w*\s*\)\s*:/,
            message:
              "Define a function with def that accepts two parameters, for example def add(a, b):"
          },
          {
            test: /\breturn\b/,
            message:
              "Use return to send the answer back — printing inside the function is not the same thing."
          },
          {
            test: /print\s*\(/,
            message: "Call your function and print the value it returns."
          }
        ],
        hint:
          "def add(a, b): on the first line, an indented return a + b underneath, then outside the function call it — print(add(2, 3)).",
        solution:
          "def add(a, b):\n    return a + b\n\nresult = add(2, 3)\nprint(result)",
        explanation:
          "return hands a value back to whoever called the function, so the result can be stored, printed or fed into more work. A function that only prints is a dead end."
      }
    },

    9: {
      title: "Debugging & Problem Solving",
      summary:
        "Read errors calmly, hunt down bugs methodically, test your work, and break hard problems into pieces you can actually solve.",
      topics: [
        "Reading Error Messages",
        "Finding Bugs",
        "Debugging Strategies",
        "Testing Programs",
        "Breaking Problems Into Smaller Pieces",
        "Thinking Like a Programmer"
      ],
      videoId: "",
      videoTitle: "Debugging and problem solving — chapter 9 walkthrough",
      exercise: {
        kind: "code",
        heading: "Exercise — fix the broken program",
        prompt:
          "This program should add up every number in the list and print the total, but it is broken in more than one way. Fix it so it prints 60.",
        starter:
          "numbers = [10, 20, 30]\ntotal = 0\n\nfor number in numbers\n    total = number\n\nprint(\"Total: \" + total)\n",
        checks: [
          {
            test: /\bfor\b[^\n]*\bin\b[^\n]*:/,
            message: "The for line is missing its colon."
          },
          {
            test: /total\s*(\+=|=\s*total\s*\+)/,
            message:
              "total = number overwrites the running total each time. It should add to it."
          },
          {
            test: /print\s*\([^)]*(,|str\s*\(|f['\"])/,
            message:
              "You cannot join a string to a number with +. Use a comma, str(), or an f-string."
          }
        ],
        hint:
          "There are three separate faults: a missing colon on the for line, an assignment that should be an addition, and a string being added to a number in the print. Fix them one at a time and rerun after each.",
        solution:
          'numbers = [10, 20, 30]\ntotal = 0\n\nfor number in numbers:\n    total += number\n\nprint("Total:", total)',
        explanation:
          "One syntax error, one logic error and one type error — the three families you met in this chapter. Fixing them one at a time, rather than rewriting everything, is the habit to keep."
      }
    },

    10: {
      title: "Final Project — Task Manager",
      summary:
        "Bring everything together and build a working command-line Personal Task Manager.",
      topics: [
        "Planning the program",
        "The menu loop",
        "Add, view, complete, delete",
        "Search and counting",
        "Exiting cleanly"
      ],
      project: "Personal Task Manager",
      isFinalProject: true,
      videoId: "",
      videoTitle: "Building the task manager — final project walkthrough",
      exercise: {
        kind: "code",
        heading: "Final project — Personal Task Manager",
        prompt:
          "Build the task manager. It needs a menu that repeats until the user exits, and it must be able to add, view, complete, delete, search and count tasks. Use functions to keep the parts separate.",
        starter:
          "# Personal Task Manager\n# Store your tasks, then loop over a menu until the user chooses to exit.\n\ntasks = []\n\n",
        checks: [
          {
            test: /\bdef\s+[A-Za-z_]\w*\s*\(/,
            message:
              "Use at least one function (def ...) so the program is not one long block."
          },
          {
            test: /\bwhile\b/,
            message: "Use a while loop so the menu keeps reappearing until the user exits."
          },
          {
            test: /input\s*\(/,
            message: "Read the user's menu choice with input(...)."
          },
          {
            test: /\bif\b[\s\S]*(\belif\b|\belse\b)/,
            message: "Branch on the menu choice with if / elif / else."
          },
          {
            test: /\[\s*\]|\.append\s*\(|\{\s*\}/,
            message:
              "Store the tasks in a collection — a list of tasks, or a list of dictionaries."
          },
          {
            test: /\bbreak\b|\bexit\b|running\s*=\s*False/,
            message: "Give the loop a way to stop when the user chooses Exit."
          }
        ],
        hint:
          "Sketch the shape first: a list to hold tasks, a function per menu action, then while True: print the menu, read a choice, and call the matching function. Choice 7 should break out of the loop.",
        solution:
          'tasks = []\n\n\ndef add_task():\n    title = input("Task: ")\n    tasks.append({"title": title, "done": False})\n    print("Added.")\n\n\ndef view_tasks():\n    if not tasks:\n        print("No tasks yet.")\n        return\n    for index, task in enumerate(tasks, start=1):\n        mark = "x" if task["done"] else " "\n        print(index, "[" + mark + "]", task["title"])\n\n\ndef complete_task():\n    view_tasks()\n    number = int(input("Which number is done? "))\n    tasks[number - 1]["done"] = True\n\n\ndef delete_task():\n    view_tasks()\n    number = int(input("Delete which number? "))\n    del tasks[number - 1]\n\n\ndef search_tasks():\n    term = input("Search for: ").lower()\n    for task in tasks:\n        if term in task["title"].lower():\n            print(task["title"])\n\n\ndef count_completed():\n    done = 0\n    for task in tasks:\n        if task["done"]:\n            done += 1\n    print(done, "of", len(tasks), "completed")\n\n\nwhile True:\n    print("\\n1 Add  2 View  3 Complete  4 Delete  5 Search  6 Count  7 Exit")\n    choice = input("Choose: ")\n\n    if choice == "1":\n        add_task()\n    elif choice == "2":\n        view_tasks()\n    elif choice == "3":\n        complete_task()\n    elif choice == "4":\n        delete_task()\n    elif choice == "5":\n        search_tasks()\n    elif choice == "6":\n        count_completed()\n    elif choice == "7":\n        print("Goodbye.")\n        break\n    else:\n        print("Unknown choice.")',
        explanation:
          "Variables, operators, conditions, loops, collections and functions — all six working together in one program. That is the whole course in a single file."
      }
    }
  };

  /* ------------------------------------------------------------------
     Storage
     ------------------------------------------------------------------ */

  /** Progress key for whoever is signed in (guests get their own bucket). */
  function storageKey() {
    var user = window.PungAuth ? window.PungAuth.getCurrentUser() : null;
    var who = user && user.email ? user.email : "guest";
    return PROGRESS_PREFIX + who;
  }

  function readAll() {
    try {
      var raw = window.localStorage.getItem(storageKey());
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function writeAll(data) {
    try {
      window.localStorage.setItem(storageKey(), JSON.stringify(data));
    } catch (error) {
      /* Storage full or blocked — progress simply will not persist. */
    }
  }

  /** The current course's record, always with a usable shape. */
  function getCourseProgress() {
    var all = readAll();
    var record = all[COURSE_ID] || {};
    return {
      completedChapters: Array.isArray(record.completedChapters)
        ? record.completedChapters.filter(isChapterNumber).sort(byNumber)
        : [],
      exercisesCompleted:
        record.exercisesCompleted && typeof record.exercisesCompleted === "object"
          ? record.exercisesCompleted
          : {},
      updatedAt: record.updatedAt || null
    };
  }

  function saveCourseProgress(record) {
    var all = readAll();
    record.updatedAt = new Date().toISOString();
    all[COURSE_ID] = record;
    writeAll(all);
  }

  function isChapterNumber(value) {
    var n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= TOTAL_CHAPTERS;
  }

  function byNumber(a, b) {
    return a - b;
  }

  /* ------------------------------------------------------------------
     Progression rules
     ------------------------------------------------------------------ */

  function isChapterCompleted(number) {
    return getCourseProgress().completedChapters.indexOf(Number(number)) !== -1;
  }

  /**
   * Chapter 1 is always open. Every other chapter needs the one before it
   * finished — this is the single rule the whole lock system rests on.
   */
  function isChapterUnlocked(number) {
    var n = Number(number);
    if (!isChapterNumber(n)) {
      return false;
    }
    if (n === 1) {
      return true;
    }
    return isChapterCompleted(n - 1);
  }

  /** State used for rendering: "completed" | "current" | "locked". */
  function chapterState(number) {
    if (isChapterCompleted(number)) {
      return "completed";
    }
    return isChapterUnlocked(number) ? "current" : "locked";
  }

  /** The first unfinished chapter — where Begin/Continue Course should go. */
  function nextChapter() {
    for (var n = 1; n <= TOTAL_CHAPTERS; n += 1) {
      if (!isChapterCompleted(n)) {
        return n;
      }
    }
    return TOTAL_CHAPTERS;
  }

  function completedCount() {
    return getCourseProgress().completedChapters.length;
  }

  function progressPercent() {
    return Math.round((completedCount() / TOTAL_CHAPTERS) * 100);
  }

  function isCourseComplete() {
    return completedCount() >= TOTAL_CHAPTERS;
  }

  /* ------------------------------------------------------------------
     Recording progress
     ------------------------------------------------------------------ */

  function isExerciseCompleted(number) {
    return getCourseProgress().exercisesCompleted[String(number)] === true;
  }

  function markExerciseCompleted(number) {
    if (!isChapterNumber(number)) {
      return;
    }
    var record = getCourseProgress();
    record.exercisesCompleted[String(number)] = true;
    saveCourseProgress(record);
  }

  /**
   * Mark a chapter finished. Refuses if the chapter is locked or its
   * exercise has not been passed, so the rule cannot be bypassed by
   * calling this directly from the console.
   */
  function completeChapter(number) {
    var n = Number(number);
    if (!isChapterUnlocked(n) || !isExerciseCompleted(n)) {
      return false;
    }
    var record = getCourseProgress();
    if (record.completedChapters.indexOf(n) === -1) {
      record.completedChapters.push(n);
      record.completedChapters.sort(byNumber);
    }
    saveCourseProgress(record);
    return true;
  }

  function resetProgress() {
    var all = readAll();
    delete all[COURSE_ID];
    writeAll(all);
  }

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */

  function getChapter(number) {
    return chapters[Number(number)] || null;
  }

  function allChapters() {
    var list = [];
    for (var n = 1; n <= TOTAL_CHAPTERS; n += 1) {
      list.push({ number: n, data: chapters[n] });
    }
    return list;
  }

  /** Path prefix back to the site root, from <html data-root>. */
  function rootPath() {
    var root = document.documentElement.getAttribute("data-root");
    return root ? root.replace(/\/?$/, "/") : "";
  }

  /** URL of a chapter page, correct from any depth in the site. */
  function chapterUrl(number) {
    return rootPath() + "courses/introduction/lesson-" + Number(number) + ".html";
  }

  function courseUrl() {
    return rootPath() + "courses/introduction-to-programming.html";
  }

  function roadmapUrl() {
    return rootPath() + "courses.html";
  }

  return {
    COURSE_ID: COURSE_ID,
    TOTAL_CHAPTERS: TOTAL_CHAPTERS,
    chapters: chapters,
    getChapter: getChapter,
    allChapters: allChapters,
    getCourseProgress: getCourseProgress,
    isChapterCompleted: isChapterCompleted,
    isChapterUnlocked: isChapterUnlocked,
    chapterState: chapterState,
    nextChapter: nextChapter,
    completedCount: completedCount,
    progressPercent: progressPercent,
    isCourseComplete: isCourseComplete,
    isExerciseCompleted: isExerciseCompleted,
    markExerciseCompleted: markExerciseCompleted,
    completeChapter: completeChapter,
    resetProgress: resetProgress,
    rootPath: rootPath,
    chapterUrl: chapterUrl,
    courseUrl: courseUrl,
    roadmapUrl: roadmapUrl
  };
})();

/* ==========================================================================
   Page rendering
   Draws the roadmap on courses.html and the chapter list on the course
   overview. Each block no-ops on pages without its mount point.
   ========================================================================== */
(function () {
  "use strict";

  var Courses = window.PungCourses;
  if (!Courses) {
    return;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  /* ------------------------------------------------------------------
     Roadmap (courses.html)
     ------------------------------------------------------------------ */
  function renderRoadmap() {
    var card = document.querySelector("[data-course-card]");
    if (!card) {
      return;
    }

    var completed = Courses.completedCount();
    var percent = Courses.progressPercent();
    var finished = Courses.isCourseComplete();
    var started = completed > 0;

    card.href = Courses.courseUrl();

    var badge = card.querySelector("[data-course-badge]");
    if (badge) {
      if (finished) {
        badge.textContent = "✓ Completed";
        badge.classList.add("course-card__badge--done");
      } else if (started) {
        badge.textContent = "In progress";
      } else {
        badge.textContent = "Start here";
      }
    }

    var fill = card.querySelector("[data-course-progress-fill]");
    if (fill) {
      fill.style.width = percent + "%";
      fill.classList.toggle("progress__fill--done", finished);
    }

    var text = card.querySelector("[data-course-progress-text]");
    if (text) {
      text.textContent = completed + " / " + Courses.TOTAL_CHAPTERS + " chapters";
    }

    var cta = card.querySelector("[data-course-cta]");
    if (cta) {
      if (finished) {
        cta.textContent = "Review the course →";
      } else if (started) {
        cta.textContent = "Continue where you left off →";
      } else {
        cta.textContent = "Open the course →";
      }
    }

    /* The gate node between the course and the two future paths. */
    var gate = document.querySelector("[data-gate-node]");
    if (gate) {
      gate.textContent = finished ? "✓" : "🔒";
      gate.classList.toggle("is-open", finished);
    }

    var gateCaption = document.querySelector("[data-gate-caption]");
    if (gateCaption) {
      gateCaption.textContent = finished
        ? "Introduction to Programming complete — both paths are open"
        : "Complete Introduction to Programming to open the paths below";
    }

    /* Unlock the two branch cards once the course is finished. */
    document.querySelectorAll("[data-branch]").forEach(function (branch) {
      var status = branch.querySelector("[data-branch-status]");
      var icon = branch.querySelector("[data-branch-icon]");
      var note = branch.querySelector("[data-branch-note]");

      branch.classList.toggle("is-unlocked", finished);

      if (icon) {
        icon.textContent = finished ? "🔓" : "🔒";
      }
      if (status) {
        status.textContent = finished ? "Unlocked" : "Locked";
      }
      if (note) {
        note.innerHTML = "";
        if (finished) {
          var link = el("a", "btn btn--secondary", "See what is coming");
          link.href = Courses.rootPath() + "coming-soon.html";
          note.appendChild(link);
        } else {
          note.appendChild(
            el(
              "span",
              "chapter__hint",
              "Finish Introduction to Programming first."
            )
          );
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     Course overview (courses/introduction-to-programming.html)
     ------------------------------------------------------------------ */
  function renderCourseOverview() {
    var list = document.querySelector("[data-chapter-list]");
    if (!list) {
      return;
    }

    renderOverviewHeader();

    list.innerHTML = "";
    Courses.allChapters().forEach(function (entry) {
      list.appendChild(buildChapterRow(entry.number, entry.data));
    });
  }

  function renderOverviewHeader() {
    var completed = Courses.completedCount();
    var percent = Courses.progressPercent();

    var fill = document.querySelector("[data-course-progress-fill]");
    if (fill) {
      fill.style.width = percent + "%";
      fill.classList.toggle("progress__fill--done", Courses.isCourseComplete());
    }

    var text = document.querySelector("[data-course-progress-text]");
    if (text) {
      text.textContent =
        completed + " / " + Courses.TOTAL_CHAPTERS + " chapters completed";
    }

    var percentSlot = document.querySelector("[data-course-percent]");
    if (percentSlot) {
      percentSlot.textContent = percent + "%";
    }

    var remaining = document.querySelector("[data-course-remaining]");
    if (remaining) {
      remaining.textContent = String(Courses.TOTAL_CHAPTERS - completed);
    }

    /* Begin / Continue button. */
    var begin = document.querySelector("[data-begin-course]");
    if (begin) {
      var next = Courses.nextChapter();
      begin.href = Courses.chapterUrl(next);

      if (Courses.isCourseComplete()) {
        begin.textContent = "Review the final project";
      } else if (completed > 0) {
        begin.textContent = "Continue Course — Chapter " + next;
      } else {
        begin.textContent = "Begin Course";
      }
    }
  }

  function buildChapterRow(number, data) {
    var state = Courses.chapterState(number);

    var row = el("li", "chapter chapter--" + state);
    if (data.isFinalProject) {
      row.classList.add("chapter--final");
    }

    /* Marker */
    var marker = el("span", "chapter__marker");
    if (state === "completed") {
      marker.textContent = "✓";
    } else if (state === "locked") {
      marker.textContent = "🔒";
    } else {
      marker.textContent = String(number);
    }
    row.appendChild(marker);

    /* Body */
    var body = el("div");

    var stateLabel = {
      completed: "✓ Completed",
      current: "▶ Current",
      locked: "🔒 Locked"
    }[state];
    body.appendChild(el("span", "chapter__state", stateLabel));

    body.appendChild(
      el("h3", "chapter__title", "Chapter " + number + " — " + data.title)
    );
    body.appendChild(el("p", "chapter__summary", data.summary));

    if (data.topics && data.topics.length) {
      var topics = el("ul", "chapter__topics");
      data.topics.forEach(function (topic) {
        topics.appendChild(el("li", null, topic));
      });
      body.appendChild(topics);
    }

    if (data.project) {
      body.appendChild(
        el("span", "chapter__project", "Project: " + data.project)
      );
    }

    row.appendChild(body);

    /* Action */
    var action = el("div", "chapter__action");

    if (state === "locked") {
      var lockedButton = el("button", "btn btn--secondary", "Locked");
      lockedButton.type = "button";
      lockedButton.addEventListener("click", function () {
        showLockedMessage(row);
      });
      action.appendChild(lockedButton);
    } else {
      var link = el(
        "a",
        "btn " + (state === "completed" ? "btn--secondary" : "btn--primary"),
        state === "completed" ? "Review" : "Start"
      );
      link.href = Courses.chapterUrl(number);
      action.appendChild(link);
    }

    row.appendChild(action);
    return row;
  }

  /** Explain, in place, why a locked chapter did not open. */
  function showLockedMessage(row) {
    var existing = row.querySelector(".locked-message");
    if (existing) {
      existing.remove();
    }
    var message = el(
      "p",
      "locked-message",
      "Complete the previous chapter to unlock this lesson."
    );
    message.setAttribute("role", "status");
    row.appendChild(message);

    window.setTimeout(function () {
      if (message.parentNode) {
        message.remove();
      }
    }, 4000);
  }

  /* ------------------------------------------------------------------
     Progress reset (course overview tools)
     ------------------------------------------------------------------ */
  function setupResetButton() {
    var button = document.querySelector("[data-reset-progress]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      var sure = window.confirm(
        "Reset your progress in Introduction to Programming? " +
          "Every chapter will be locked again except Chapter 1."
      );
      if (sure) {
        Courses.resetProgress();
        window.location.reload();
      }
    });
  }

  renderRoadmap();
  renderCourseOverview();
  setupResetButton();
})();
