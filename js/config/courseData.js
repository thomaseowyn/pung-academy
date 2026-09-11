/* ==========================================================================
   Static course configuration
   --------------------------------------------------------------------------
   Chapter titles, topics, projects, video ids and exercise definitions for
   Introduction to Programming. Editing the course means editing this file
   and nothing else.

   The sixteen chapters open with a conceptual primer (Chapter 1: what a
   computer and a programming language actually are), then follow the
   two-phase curriculum: Chapters 2-10 are foundational Python (variables
   through data structures, split into smaller chapters so no single
   sitting stacks more than a couple of new ideas), Chapters 11-16 are
   intermediate (functions through object-oriented programming), ending in
   an OOP capstone project.

   videoId is intentionally empty on any chapter without a verified id,
   rather than a guessed one — that chapter shows a marked placeholder
   until a real 11-character YouTube id is dropped in here.
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.courseData = (function () {
  "use strict";

  const COURSE_ID = "introductionToProgramming";
  const TOTAL_CHAPTERS = 16;

  /**
   * Groups the chapter list on the overview page so a beginner sees the
   * shape of the course, not a flat wall of sixteen identical rows.
   * Chapter 1 (orientation) is rendered on its own, outside every unit.
   */
  const units = [
    {
      id: "foundations",
      label: "Unit 1 · Foundations",
      title: "Writing and controlling a program",
      description:
        "Get Python running, store information, make decisions, repeat work, and organise data — the toolkit every later chapter assumes you have.",
      range: [2, 10],
      bridge:
        "With these, you can already build real (if simple) programs. Unit 2 is about writing them well."
    },
    {
      id: "building",
      label: "Unit 2 · Building Real Programs",
      title: "Structure, safety, and working with the outside world",
      description:
        "Break code into reusable pieces, handle things going wrong, save data between runs, and use code other people wrote.",
      range: [11, 14],
      bridge:
        "You can now build tools that persist data and don't crash. Unit 3 changes how you model the data itself."
    },
    {
      id: "objects",
      label: "Unit 3 · Thinking in Objects",
      title: "Modelling real things, and writing it cleanly",
      description:
        "Bundle data and behaviour into classes, then tighten your code with Python's shorthand tools — ending in the final project.",
      range: [15, 16],
      bridge: null
    }
  ];

  const chapters = {
    /* ==================================================================
       Orientation
       ================================================================== */
    1: {
      title: "Computer Basics & What a Programming Language Is",
      summary:
        "Before writing a line of code, understand what a computer actually is, how it stores and processes information, and what a programming language does for you.",
      topics: [
        "What a computer is (CPU, memory, storage)",
        "Input, output and how they connect",
        "What a programming language is",
        "Source code vs. machine code",
        "Compilers and interpreters",
        "Why this course uses Python"
      ],
      videoId: "",
      videoTitle: "Computer basics and what a programming language is",
      exercise: {
        kind: "choice",
        heading: "Concept check",
        prompt:
          "A CPU can only ever execute instructions written in one form. Which of these is it?",
        choices: [
          "Python source code, exactly as you type it",
          "Machine code — binary instructions specific to that processor",
          "English sentences describing what the program should do",
          "A diagram of the program's logic"
        ],
        answer: 1,
        hint:
          "Three of these four are meant for a human reader, not a processor. Only one is in a form the hardware itself can directly carry out.",
        explanation:
          "A CPU only understands machine code — streams of binary instructions built into its own design. Everything else, including the Python you will start writing in the next chapter, has to be translated into machine code before the processor can run it. A compiler translates the whole program up front; an interpreter translates and runs it line by line, which is what Python does."
      }
    },

    /* ==================================================================
       Phase 1 — Foundational Programming
       ================================================================== */
    2: {
      title: "First Steps & Computational Thinking",
      summary:
        "Set up a real coding environment, understand how a program actually runs, and write the first lines of Python you will ever type.",
      topics: [
        "Setting up your environment",
        "Execution flow",
        "print() and input()",
        "Comments"
      ],
      videoId: "4iUJZEa2xP8",
      videoTitle: "Environment setup and your first steps in Python",
      exercise: {
        kind: "choice",
        heading: "Concept check",
        prompt:
          "You run a Python file and nothing happens on screen until you type something and press Enter. Which line is responsible for that pause?",
        choices: [
          'print("Hello")',
          "# This line asks for your name",
          'name = input("Your name: ")',
          'name = "Alex"'
        ],
        answer: 2,
        hint:
          "Three of these four lines run instantly and produce no pause at all. Which one is the only one that has to wait on a person?",
        explanation:
          "input() is the only line that pauses the program and waits for someone to type something. print() only displays text, a comment does nothing at all, and a plain assignment does not ask anyone for anything."
      }
    },

    3: {
      title: "Data Types & Variable Manipulation",
      summary:
        "Store information in variables, learn Python's basic data types, and convert between them without losing track of what you have.",
      topics: [
        "Numbers (int, float)",
        "Strings",
        "Booleans",
        "Type casting",
        "f-strings"
      ],
      videoId: "LKFrQXaoSMQ",
      videoTitle: "Variables and data types in Python",
      exercise: {
        kind: "code",
        heading: "Exercise — store and show information",
        prompt:
          "Create a variable for a person's name (text) and one for their age (a whole number), then print both together using an f-string.",
        starter:
          "# Create your two variables below, then print them with an f-string.\n",
        checks: [
          {
            test: /^[^\S\n]*[A-Za-z_]\w*\s*=\s*(['"]).*?\1/m,
            message: 'Assign a text value to a variable, for example name = "Alex".'
          },
          {
            test: /^[^\S\n]*[A-Za-z_]\w*\s*=\s*\d+/m,
            message: "Assign a whole number to a variable, for example age = 20."
          },
          {
            test: /f["']/,
            message: 'Use an f-string, written f"..." with the variables inside curly braces.'
          },
          {
            test: /print\s*\(/,
            message: "Call print(...) to display the f-string."
          }
        ],
        hint:
          "Two assignments — one text, one number — then a single print() using f\"{name} is {age} years old\".",
        solution: 'name = "Alex"\nage = 20\n\nprint(f"{name} is {age} years old")',
        explanation:
          "You stored two different types and combined them into one readable line with an f-string, which is the normal way Python programs build text out of variables."
      }
    },

    4: {
      title: "Conditionals",
      summary:
        "Let a program choose between paths using comparisons and if / elif / else, so it can react to whatever it is given.",
      topics: [
        "Comparison operators",
        "if / elif / else"
      ],
      videoId: "9XbeXpKMR_E",
      videoTitle: "Conditional logic in Python",
      exercise: {
        kind: "code",
        heading: "Exercise — pass or fail",
        prompt:
          "Ask the user for a score, then print \"Pass\" if it is 60 or above, otherwise print \"Fail\".",
        starter: "# Ask for a score, then decide what to print.\n",
        checks: [
          {
            test: /input\s*\(/,
            message: "Use input(...) to ask for the score."
          },
          {
            test: /int\s*\(|float\s*\(/,
            message: "Convert the text from input() into a number with int(...) or float(...)."
          },
          {
            test: /\bif\b[^\n]*>=/,
            message: "Use an if statement with >= to check the score."
          },
          {
            test: /\belse\b/,
            message: "Handle the other case with else."
          },
          {
            test: /print\s*\(/,
            message: "Print the result."
          }
        ],
        hint:
          "score = int(input(\"Score: \")); then if score >= 60: print the pass message, else: print the fail message.",
        solution:
          'score = int(input("Score: "))\n\nif score >= 60:\n    print("Pass")\nelse:\n    print("Fail")',
        explanation:
          "A single comparison feeding a single if/else is the smallest complete decision a program can make — everything in the next chapter builds on this same shape."
      }
    },

    5: {
      title: "Combining Conditions",
      summary:
        "Join multiple conditions together with and, or and not, and nest decisions inside each other for genuinely complex logic.",
      topics: [
        "Logical operators (and, or, not)",
        "Nested conditionals"
      ],
      videoId: "",
      videoTitle: "Combining conditions with logical operators",
      exercise: {
        kind: "code",
        heading: "Exercise — is the temperature comfortable?",
        prompt:
          "Ask the user for a temperature, then print \"Comfortable\" if it is between 18 and 25 degrees inclusive, using a single condition joined with and. Otherwise print \"Not comfortable\".",
        starter: "# Ask for a temperature, then decide what to print.\n",
        checks: [
          {
            test: /input\s*\(/,
            message: "Use input(...) to ask for the temperature."
          },
          {
            test: /int\s*\(|float\s*\(/,
            message: "Convert the text from input() into a number with int(...) or float(...)."
          },
          {
            test: /\band\b/,
            message: "Combine two comparisons with and, for example temp >= 18 and temp <= 25."
          },
          {
            test: /\bif\b[^\n]*(>=|<=)/,
            message: "Use an if statement with >= or <= to check the range."
          },
          {
            test: /\belse\b/,
            message: "Handle the other case with else."
          }
        ],
        hint:
          "Convert the input to a number first. Then: if temp >= 18 and temp <= 25: print the comfortable message, else: print the other one.",
        solution:
          'temperature = float(input("Temperature: "))\n\nif temperature >= 18 and temperature <= 25:\n    print("Comfortable")\nelse:\n    print("Not comfortable")',
        explanation:
          "Two comparisons combined with and only pass when both sides are true, which is exactly what checking a range needs — this is the pattern behind every range check you will write."
      }
    },

    6: {
      title: "Iteration & Loops",
      summary:
        "Repeat work without repeating code, and learn to stop or skip a repetition exactly when you need to.",
      topics: ["for loops", "while loops", "range()", "break and continue", "Nested loops"],
      videoId: "KWgYha0clzw",
      videoTitle: "Loops and repetition in Python",
      exercise: {
        kind: "code",
        heading: "Exercise — print the even numbers",
        prompt:
          "Print every even number from 1 to 20 using a single loop, skipping the odd numbers with continue rather than writing a separate check for what to print.",
        starter: "# Print the even numbers from 1 to 20.\n",
        checks: [
          {
            test: /\bfor\b[\s\S]*\bin\b[\s\S]*range\s*\(/,
            message: "Use a for loop over range(...) to visit every number from 1 to 20."
          },
          {
            test: /%\s*2/,
            message: "Use % 2 to test whether a number is odd or even."
          },
          {
            test: /\bcontinue\b/,
            message: "Use continue to skip the odd numbers rather than printing them."
          },
          {
            test: /print\s*\(/,
            message: "Print each even number."
          }
        ],
        hint:
          "range(1, 21) covers 1 to 20. Inside the loop: if number % 2 != 0: continue — then the print() below only ever runs for even numbers.",
        solution:
          "for number in range(1, 21):\n    if number % 2 != 0:\n        continue\n    print(number)",
        explanation:
          "continue abandons the rest of that pass and jumps straight to the next number, so the print() beneath it only ever runs when the odd check did not trigger."
      }
    },

    7: {
      title: "Lists & Tuples",
      summary:
        "Store many values in order under one name, and reach any single item by its position.",
      topics: [
        "Lists and tuples",
        "Indexing",
        "Looping through a sequence"
      ],
      videoId: "gOMW_n2-2Mw",
      videoTitle: "Lists, tuples and indexing in Python",
      exercise: {
        kind: "code",
        heading: "Exercise — index into a list",
        prompt:
          "Create a list of three favourite foods, then print the first item and the last item using indexing (not slicing).",
        starter: "# Create a list of three items, then print the first and last using indexing.\n",
        checks: [
          {
            test: /\[[^\]]*,[^\]]*,[^\]]*\]/,
            message: "Keep a list of exactly three items."
          },
          {
            test: /\[\s*0\s*\]/,
            message: "Print the first item using index 0, for example foods[0]."
          },
          {
            test: /\[\s*-1\s*\]/,
            message: "Print the last item using index -1, for example foods[-1]."
          },
          {
            test: /print\s*\(/,
            message: "Print both items."
          }
        ],
        hint:
          'foods = ["Pizza", "Sushi", "Tacos"] then print(foods[0]) and print(foods[-1]).',
        solution: 'foods = ["Pizza", "Sushi", "Tacos"]\n\nprint(foods[0])\nprint(foods[-1])',
        explanation:
          "Index 0 always reaches the first item and index -1 always reaches the last, regardless of how long the list is — that is what makes negative indexing worth using instead of counting the list's length yourself."
      }
    },

    8: {
      title: "Slicing & List Methods",
      summary:
        "Reach a whole chunk of a list in one go, change a list after it exists, and put both to work in a real encryption project.",
      topics: [
        "Slicing",
        "List methods (append, pop, sort)"
      ],
      project: "Caesar Cipher / Text Encryptor",
      videoId: "",
      videoTitle: "Slicing and list methods in Python",
      exercise: {
        kind: "code",
        heading: "Exercise — slice out the middle",
        prompt:
          "Create a list of five numbers, then use slicing (not individual indexes) to print only the middle three.",
        starter: "numbers = [10, 20, 30, 40, 50]\n\n# Print the middle three using a slice.\n",
        checks: [
          {
            test: /\[[^\]]*,[^\]]*,[^\]]*,[^\]]*,[^\]]*\]/,
            message: "Keep a list of exactly five numbers."
          },
          {
            test: /\[\s*1\s*:\s*(-1|4)\s*\]/,
            message: "Use a slice such as numbers[1:-1] or numbers[1:4] to get the middle three."
          },
          {
            test: /print\s*\(/,
            message: "Print the sliced result."
          }
        ],
        hint:
          "A slice numbers[1:-1] means \"from index 1 up to, but not including, the last item\" — for a list of five that is exactly the middle three.",
        solution: "numbers = [10, 20, 30, 40, 50]\n\nprint(numbers[1:-1])",
        explanation:
          "Slicing takes a whole chunk of a sequence in one expression. The negative index -1 means \"the last item\", so [1:-1] reads naturally as \"everything except the first and last\"."
      }
    },

    9: {
      title: "Dictionaries & Sets",
      summary:
        "Look things up by name instead of position with dictionaries, and filter duplicates with sets.",
      topics: [
        "Dictionaries",
        ".get(), .keys(), .values(), .items()",
        "Sets"
      ],
      videoId: "MZZSMaEAC2g",
      videoTitle: "Dictionaries and sets in Python",
      exercise: {
        kind: "code",
        heading: "Exercise — report every student's score",
        prompt:
          "Given a dictionary mapping student names to scores, loop through it with .items() and print each name and score. Then use .get() to safely look up a name that might not be in the dictionary, with a default of \"Not found\".",
        starter:
          'scores = {"Alex": 88, "Bo": 91, "Chris": 76}\n\n# Loop through scores with .items(), then look up "Dev" safely with .get().\n',
        checks: [
          {
            test: /\.items\s*\(\s*\)/,
            message: "Loop through the dictionary with .items() so you get both the name and the score."
          },
          {
            test: /\bfor\b[\s\S]*\bin\b/,
            message: "Use a for loop to go through the dictionary."
          },
          {
            test: /\.get\s*\(\s*["'][^"']*["']\s*,/,
            message: 'Use .get("Dev", "Not found") to look up a name safely, with a default value.'
          },
          {
            test: /print\s*\(/,
            message: "Print the results."
          }
        ],
        hint:
          'for name, score in scores.items(): print(name, score) — then print(scores.get("Dev", "Not found")) on its own line.',
        solution:
          'scores = {"Alex": 88, "Bo": 91, "Chris": 76}\n\nfor name, score in scores.items():\n    print(name, score)\n\nprint(scores.get("Dev", "Not found"))',
        explanation:
          ".items() hands you both halves of each pair at once, which is why the loop can unpack them into name and score directly. .get() with a default is what keeps a missing key from crashing your program with a KeyError."
      }
    },

    10: {
      title: "Nested Data & Mutability",
      summary:
        "Work with data nested inside data, loop with enumerate() and zip(), and learn the aliasing trap that catches almost every beginner once.",
      topics: [
        "Nested data structures",
        "enumerate() and zip()",
        "Mutability and aliasing"
      ],
      project: "Student Grade & Class Performance Analyzer",
      videoId: "",
      videoTitle: "Nested data, enumerate, zip and mutability in Python",
      exercise: {
        kind: "code",
        heading: "Exercise — number a list with enumerate()",
        prompt:
          "Given a list of three names, loop with enumerate(names, start=1) and print each one numbered, like \"1. Alex\".",
        starter: 'names = ["Alex", "Bo", "Chris"]\n\n# Loop with enumerate(names, start=1) and print each numbered.\n',
        checks: [
          {
            test: /enumerate\s*\(/,
            message: "Use enumerate(names, start=1) to get a position alongside each name."
          },
          {
            test: /start\s*=\s*1/,
            message: "Pass start=1 so the numbering begins at 1, not 0."
          },
          {
            test: /\bfor\b[\s\S]*\bin\b/,
            message: "Use a for loop to unpack the position and name together."
          },
          {
            test: /print\s*\(/,
            message: "Print each numbered name."
          }
        ],
        hint:
          'for position, name in enumerate(names, start=1): print(f"{position}. {name}")',
        solution:
          'names = ["Alex", "Bo", "Chris"]\n\nfor position, name in enumerate(names, start=1):\n    print(f"{position}. {name}")',
        explanation:
          "enumerate() hands you the position and the value together on every pass, which is why the loop can unpack them straight into position and name — start=1 is just a convenience so the numbering matches how a person would count, instead of starting at 0."
      }
    },

    /* ==================================================================
       Phase 2 — Structural & Intermediate Concepts
       ================================================================== */
    11: {
      title: "Functions & Scope Mechanics",
      summary:
        "Give a name to a piece of work, hand it values, and get an answer back — the single habit that keeps programs from turning into one long block.",
      topics: [
        "Parameters and arguments",
        "*args and **kwargs",
        "return vs. print",
        "Local vs. global scope",
        "Default arguments"
      ],
      project: "Quiz Game",
      videoId: "4jBJhCaNrWU",
      videoTitle: "Functions and scope in Python",
      exercise: {
        kind: "code",
        heading: "Exercise — a function that adds",
        prompt:
          "Create a function that takes two numbers, returns their sum, and then call it and print the result.",
        starter: "# Define your function, then call it and print what comes back.\n",
        checks: [
          {
            test: /\bdef\s+[A-Za-z_]\w*\s*\(\s*[A-Za-z_]\w*\s*,\s*[A-Za-z_]\w*\s*\)\s*:/,
            message: "Define a function with def that takes two parameters, for example def add(a, b):"
          },
          {
            test: /\breturn\b/,
            message: "Use return to hand the answer back — printing inside the function is not the same thing."
          },
          {
            test: /print\s*\(/,
            message: "Call your function and print the value it returns."
          }
        ],
        hint:
          "def add(a, b): on the first line, an indented return a + b underneath, then outside the function: print(add(2, 3)).",
        solution: "def add(a, b):\n    return a + b\n\nprint(add(2, 3))",
        explanation:
          "return hands a value back to whoever called the function, so the result can be stored, printed or passed into more work — a function that only prints is a dead end for anything built on top of it."
      }
    },

    12: {
      title: "Error Handling & Debugging",
      summary:
        "Catch the errors you can predict, so your program fails gracefully instead of crashing the moment someone types something unexpected.",
      topics: [
        "try / except / else / finally",
        "Raising exceptions",
        "Reading stack traces"
      ],
      project: "Safe Calculator",
      videoId: "V_NXT2-QIlE",
      videoTitle: "Error handling with try and except",
      exercise: {
        kind: "code",
        heading: "Exercise — divide without crashing",
        prompt:
          "Ask the user for two numbers and divide the first by the second, but wrap the risky part in try/except so that dividing by zero or typing something that is not a number does not crash the program.",
        starter: "# Ask for two numbers and divide them safely.\n",
        checks: [
          {
            test: /\btry\s*:/,
            message: "Start a try block around the code that might fail."
          },
          {
            test: /\bexcept\b/,
            message: "Add at least one except block to catch the error."
          },
          {
            test: /input\s*\(/,
            message: "Read the two numbers with input(...)."
          },
          {
            test: /\/(?!\/)/,
            message: "Actually divide the two numbers with /."
          }
        ],
        hint:
          "Put the int(input(...)) conversions and the division inside try:. Catch ValueError for bad text and ZeroDivisionError for dividing by zero — you can catch both in one line as except (ValueError, ZeroDivisionError):",
        solution:
          'try:\n    first = float(input("First number: "))\n    second = float(input("Second number: "))\n    print(first / second)\nexcept (ValueError, ZeroDivisionError):\n    print("That was not a valid division. Try again.")',
        explanation:
          "Wrapping the risky lines in try lets Python attempt them and hand control to except the moment something goes wrong, instead of stopping the whole program on the spot."
      }
    },

    13: {
      title: "File I/O & Data Persistence",
      summary:
        "Save information that survives after your program closes, by reading and writing files instead of keeping everything only in memory.",
      topics: [
        "Reading and writing files (open(), with)",
        "Working with CSV",
        "Working with JSON"
      ],
      project: "Persistent Notes App",
      videoId: "LpZmZs2_BC4",
      videoTitle: "File input and output in Python",
      exercise: {
        kind: "code",
        heading: "Exercise — write a note to a file",
        prompt:
          'Open a file called "notes.txt" in write mode using a with statement, and write one line of text to it.',
        starter: "# Open notes.txt for writing and write a line to it.\n",
        checks: [
          {
            test: /\bwith\s+open\s*\(/,
            message: 'Use a with statement: with open("notes.txt", "w") as file:'
          },
          {
            test: /["']w["']/,
            message: 'Open the file in write mode — the "w" mode.'
          },
          {
            test: /\.write\s*\(/,
            message: "Call .write(...) on the file to save your text."
          }
        ],
        hint:
          'with open("notes.txt", "w") as file:\n    file.write("Remember to practise loops.\\n")',
        solution:
          'with open("notes.txt", "w") as file:\n    file.write("Remember to practise loops.\\n")',
        explanation:
          "The with statement opens the file, hands it to you as file, and closes it automatically once the indented block finishes — even if something goes wrong inside it. That is why with is the standard way to work with files rather than open() and close() by hand."
      }
    },

    14: {
      title: "Modules, Libraries & Virtual Environments",
      summary:
        "Bring in code other people have already written, from Python's own toolkit and from packages you install yourself.",
      topics: [
        "Importing built-in modules (math, random, datetime)",
        "Installing packages with pip",
        "Virtual environments (venv)"
      ],
      project: "Daily Dice Roller",
      videoId: "XcfxkHrHTVE",
      videoTitle: "Modules, pip and virtual environments",
      exercise: {
        kind: "code",
        heading: "Exercise — roll a die",
        prompt:
          "Import the random module and use random.randint() to simulate rolling a six-sided die, then print the result.",
        starter: "# Import random, roll a die, and print the result.\n",
        checks: [
          {
            test: /^\s*import\s+random/m,
            message: "Import the module first: import random."
          },
          {
            test: /random\.randint\s*\(/,
            message: "Use random.randint(1, 6) to pick a number between 1 and 6."
          },
          {
            test: /print\s*\(/,
            message: "Print the result of the roll."
          }
        ],
        hint:
          "import random goes at the very top. Then roll = random.randint(1, 6), and print(roll).",
        solution: "import random\n\nroll = random.randint(1, 6)\nprint(roll)",
        explanation:
          "import random gives your file access to everything in Python's random module, and randint(1, 6) picks a whole number from 1 to 6 inclusive — this is the same module you already used back in the loops chapter."
      }
    },

    15: {
      title: "Object-Oriented Programming (OOP)",
      summary:
        "Model a real thing as a class — data and the actions that belong to it, bundled together instead of scattered across separate variables.",
      topics: [
        "Classes and objects",
        "__init__ and attributes",
        "Methods and self",
        "Inheritance basics",
        "Encapsulation"
      ],
      project: "BankAccount Class",
      videoId: "q2SGW2VgwAM",
      videoTitle: "Object-oriented programming in Python",
      exercise: {
        kind: "code",
        heading: "Exercise — your first class",
        prompt:
          'Create a class called Dog with an __init__ method that stores a name. Give it a method called bark that prints "<name> says Woof!". Then create one Dog and call bark on it.',
        starter: "# Define the Dog class, then create one and call bark().\n",
        checks: [
          {
            test: /\bclass\s+Dog\s*[:(]/,
            message: "Define a class called Dog."
          },
          {
            test: /def\s+__init__\s*\(\s*self/,
            message: "Give the class an __init__ method that takes self."
          },
          {
            test: /self\.\w+\s*=/,
            message: "Store the name on self inside __init__, for example self.name = name."
          },
          {
            test: /def\s+bark\s*\(\s*self/,
            message: "Define a bark method that takes self."
          },
          {
            test: /Dog\s*\(/,
            message: "Create an actual Dog object by calling Dog(...)."
          }
        ],
        hint:
          "class Dog: then def __init__(self, name): self.name = name. Then def bark(self): print(f\"{self.name} says Woof!\"). Finally: rex = Dog(\"Rex\") and rex.bark().",
        solution:
          'class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        print(f"{self.name} says Woof!")\n\n\nrex = Dog("Rex")\nrex.bark()',
        explanation:
          "__init__ runs the moment you create a Dog and sets up its attributes. self inside bark refers to that particular dog, which is how rex.bark() knows to use Rex's name rather than anyone else's."
      }
    },

    16: {
      title: "Intermediate Python Features (Pythonic Code)",
      summary:
        "Write shorter, clearer Python with comprehensions and lambdas — then bring the whole course together in one final, object-oriented project.",
      topics: [
        "List comprehensions",
        "Lambda functions",
        "map() and filter()",
        "Generators (introduction)",
        "@staticmethod (introduction)"
      ],
      project: "Personal Task Manager (Object-Oriented)",
      isFinalProject: true,
      videoId: "",
      videoTitle: "Pythonic code and the final project",
      exercise: {
        kind: "code",
        heading: "Final project — Object-Oriented Task Manager",
        prompt:
          "Rebuild the task manager using a Task class instead of plain dictionaries. Give Task an __init__ that stores a title and a completed flag, and a method to mark it complete. Then build a menu loop that repeats until the user exits, and can add a task, view all tasks, and complete one.",
        starter:
          "# Personal Task Manager — object-oriented version\n# Define your Task class, then build the menu loop below it.\n\ntasks = []\n\n",
        checks: [
          {
            test: /\bclass\s+Task\s*[:(]/,
            message: "Define a class called Task."
          },
          {
            test: /def\s+__init__\s*\(\s*self/,
            message: "Give Task an __init__ method that takes self."
          },
          {
            test: /self\.\w+\s*=/,
            message: "Store at least the title on self inside __init__."
          },
          {
            test: /def\s+\w+\s*\(\s*self\s*\)\s*:/,
            message: "Give Task a method (other than __init__) for marking a task complete."
          },
          {
            test: /\[\s*\]|\.append\s*\(/,
            message: "Keep the tasks in a list, and add new Task objects to it."
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
            test: /\bbreak\b/,
            message: "Give the loop a way to stop when the user chooses to exit."
          }
        ],
        hint:
          "Sketch it in two parts. First the class: class Task: with __init__(self, title) storing self.title and self.done = False, plus a complete(self) method setting self.done = True. Then the program: an empty list, and while True: showing a menu, reading a choice, and calling the right behaviour for add / view / complete / exit, with break on exit.",
        solution:
          'class Task:\n    def __init__(self, title):\n        self.title = title\n        self.done = False\n\n    def complete(self):\n        self.done = True\n\n    def __str__(self):\n        mark = "x" if self.done else " "\n        return f"[{mark}] {self.title}"\n\n\ntasks = []\n\nwhile True:\n    print("\\n1 Add  2 View  3 Complete  4 Exit")\n    choice = input("Choose: ")\n\n    if choice == "1":\n        title = input("Task: ")\n        tasks.append(Task(title))\n        print("Added.")\n    elif choice == "2":\n        for index, task in enumerate(tasks, start=1):\n            print(index, task)\n    elif choice == "3":\n        for index, task in enumerate(tasks, start=1):\n            print(index, task)\n        number = int(input("Which number is done? "))\n        tasks[number - 1].complete()\n    elif choice == "4":\n        print("Goodbye.")\n        break\n    else:\n        print("Unknown choice.")',
        explanation:
          "Every phase of this course is in that program: a class with __init__ and a method (Chapter 15), a list of objects (Chapter 7), a menu loop with input and branching (Chapters 2, 4 and 6), and __str__ giving Python a way to turn a Task into readable text automatically whenever you print one."
      }
    }
  };

  return { COURSE_ID, TOTAL_CHAPTERS, chapters, units };
})();
