/* ==========================================================================
   Exercise bank — standalone coding problems for the Arena
   --------------------------------------------------------------------------
   Independent of the lesson chapters: these are short, self-contained
   coding problems a learner can attempt directly from the Exercises page,
   grouped the same way the roadmap already groups chapters — by course,
   then by unit (see the `units` arrays in courseData.js, whose ids these
   keys match exactly, so ExerciseBankModel can look up each unit's label
   there instead of duplicating it here).

   Every exercise is kind: "code": a short snippet typed into the same
   editor the lesson chapters use, graded the same way LessonController
   grades a "code" exercise — checked against a list of regexes for the
   concepts it must contain, not actually executed (see the editor's own
   "Checked for concepts — not executed" note).
   ========================================================================== */

window.Pung = window.Pung || {};

Pung.exerciseBank = (function () {
  "use strict";

  const bank = {
    introductionToProgramming: {
      foundations: [
        {
          id: "introductionToProgramming-foundations-1",
          title: "True, False, or Neither?",
          topics: ["Conditionals", "Booleans"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt: "Print whether `5 > 3` and `2 > 4` are both true, using a single boolean expression.",
          starter: "# Print the result of the combined comparison.\n",
          checks: [
            { test: /5\s*>\s*3/, message: "Include the comparison 5 > 3." },
            { test: /2\s*>\s*4/, message: "Include the comparison 2 > 4." },
            { test: /\band\b/, message: "Combine both comparisons with `and`." },
            { test: /print\s*\(/, message: "Print the result." }
          ],
          hint: "print(5 > 3 and 2 > 4)",
          explanation:
            "`and` only returns True when both sides are true. Since `2 > 4` is False, the whole expression — and the printed result — is False."
        },
        {
          id: "introductionToProgramming-foundations-2",
          title: "Loop Trace",
          topics: ["Loops", "Lists"],
          difficulty: 1,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt: "Use a for loop over range(2, 8, 2) to print each value on its own line.",
          starter: "# Loop over range(2, 8, 2) and print each value.\n",
          checks: [
            { test: /for\s+\w+\s+in\s+range\s*\(\s*2\s*,\s*8\s*,\s*2\s*\)\s*:/, message: "Use for ... in range(2, 8, 2):" },
            { test: /print\s*\(/, message: "Print each value inside the loop." }
          ],
          hint: "for i in range(2, 8, 2):\n    print(i)",
          explanation:
            "range(2, 8, 2) produces 2, 4, 6 — three values — so the loop body runs three times."
        },
        {
          id: "introductionToProgramming-foundations-3",
          title: "Slice It",
          topics: ["Strings", "Slicing"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt: 'Given word = "programming", print just the substring "gram" using slicing.',
          starter: 'word = "programming"\n# print the slice below\n',
          checks: [
            { test: /word\[\s*3\s*:\s*7\s*\]/, message: "Slice word with word[3:7]." },
            { test: /print\s*\(/, message: "Print the slice." }
          ],
          hint: "print(word[3:7])",
          explanation:
            'Slicing word[3:7] takes the characters at indexes 3, 4, 5, 6 — "gram" — since the end index in a slice is exclusive.'
        },
        {
          id: "introductionToProgramming-foundations-4",
          title: "Count the Votes",
          topics: ["Dictionaries"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            'Given votes = ["a", "b", "a", "c", "b", "a"], build a dictionary named counts mapping each name to how many times it appears, then print counts.',
          starter: 'votes = ["a", "b", "a", "c", "b", "a"]\ncounts = {}\n# fill counts, then print it\n',
          checks: [
            { test: /for\s+\w+\s+in\s+votes\s*:/, message: "Loop over votes with a for loop." },
            {
              test: /counts\[\s*\w+\s*\]\s*=\s*counts\.get\s*\(\s*\w+\s*,\s*0\s*\)\s*\+\s*1/,
              message: "Increment counts[name] with counts[name] = counts.get(name, 0) + 1."
            },
            { test: /print\s*\(\s*counts\s*\)/, message: "Print counts." }
          ],
          hint: "for name in votes:\n    counts[name] = counts.get(name, 0) + 1\nprint(counts)",
          explanation:
            "dict.get(name, 0) returns the existing count or 0 for a name not seen yet, so adding 1 either starts or continues that name's tally."
        },
        {
          id: "introductionToProgramming-foundations-5",
          title: "Sort and Add",
          topics: ["Lists", "Methods"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt: "Given numbers = [5, 2, 9, 1], append 7 to the list, sort it in place, then print it.",
          starter: "numbers = [5, 2, 9, 1]\n# append 7, sort in place, then print\n",
          checks: [
            { test: /numbers\.append\s*\(\s*7\s*\)/, message: "Append 7 with numbers.append(7)." },
            { test: /numbers\.sort\s*\(\s*\)/, message: "Sort in place with numbers.sort()." },
            { test: /print\s*\(\s*numbers\s*\)/, message: "Print numbers." }
          ],
          hint: "numbers.append(7)\nnumbers.sort()\nprint(numbers)",
          explanation:
            "append() adds to the end of the list, and sort() reorders it in place (returning None) — unlike sorted(), which would return a new list instead."
        }
      ],
      building: [
        {
          id: "introductionToProgramming-building-1",
          title: "Return the Square",
          topics: ["Functions", "Return Values"],
          difficulty: 2,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt: "Write a function square(n) that returns n squared, then call square(5) and print the result.",
          starter: "def square(n):\n    # return n squared\n    pass\n\n# call square(5) and print the result\n",
          checks: [
            { test: /def\s+square\s*\(\s*\w+\s*\)\s*:/, message: "Define square(n) with one parameter." },
            { test: /return\s+\w+\s*\*\*\s*2/, message: "Return n ** 2 from the function." },
            { test: /square\s*\(\s*5\s*\)/, message: "Call square(5)." },
            { test: /print\s*\(/, message: "Print the result." }
          ],
          hint: "def square(n):\n    return n ** 2\n\nprint(square(5))",
          explanation:
            "A function's return value only exists where you use it — print(square(5)) works because square(5) evaluates to 25 before print() runs."
        },
        {
          id: "introductionToProgramming-building-2",
          title: "Catch It",
          topics: ["Error Handling"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            "Inside a try block, divide 10 by 0. In an except block that catches only ZeroDivisionError, print a friendly message.",
          starter: "try:\n    # divide 10 by 0\n    pass\nexcept:\n    pass\n",
          checks: [
            { test: /try\s*:/, message: "Start a try block." },
            { test: /10\s*\/\s*0/, message: "Divide 10 by 0 inside the try block." },
            { test: /except\s+ZeroDivisionError\s*:/, message: "Catch specifically ZeroDivisionError, not a bare except." },
            { test: /print\s*\(/, message: "Print a message in the except block." }
          ],
          hint: "try:\n    10 / 0\nexcept ZeroDivisionError:\n    print(\"Can't divide by zero!\")",
          explanation:
            "Naming ZeroDivisionError specifically means only that error is caught here — any other bug in the try block still surfaces normally, instead of being silently swallowed."
        },
        {
          id: "introductionToProgramming-building-3",
          title: "Give It a Default",
          topics: ["Functions", "Parameters"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt:
            'Write a function greet(name, greeting="Hello") that returns f"{greeting}, {name}!", using a default value for greeting. Call it once with only a name.',
          starter: 'def greet(name, greeting="Hello"):\n    pass\n\n# call greet with just a name\n',
          checks: [
            { test: /def\s+greet\s*\(\s*name\s*,\s*greeting\s*=\s*["']Hello["']\s*\)\s*:/, message: 'Define greet(name, greeting="Hello").' },
            { test: /return\s+f["']/, message: "Return an f-string." },
            { test: /greet\s*\(\s*["'][^"']+["']\s*\)/, message: "Call greet with only a name argument." }
          ],
          hint: 'def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\ngreet("Alex")',
          explanation:
            'A default parameter value is only used when the caller leaves that argument out — greet("Alex") still works even though greeting isn\'t passed.'
        },
        {
          id: "introductionToProgramming-building-4",
          title: "Read It Back",
          topics: ["File I/O"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            "Open \"notes.txt\" for reading using a with statement, read its full contents into a variable named text, and print text.",
          starter: "# open notes.txt and print its contents\n",
          checks: [
            { test: /with\s+open\s*\(\s*["']notes\.txt["']\s*,\s*["']r["']\s*\)\s+as\s+\w+\s*:/, message: 'Open the file with with open("notes.txt", "r") as f:' },
            { test: /text\s*=\s*\w+\.read\s*\(\s*\)/, message: "Read the file's contents into text with f.read()." },
            { test: /print\s*\(\s*text\s*\)/, message: "Print text." }
          ],
          hint: 'with open("notes.txt", "r") as f:\n    text = f.read()\nprint(text)',
          explanation:
            "The with statement guarantees the file is closed automatically once the block ends, even if reading raises an error."
        },
        {
          id: "introductionToProgramming-building-5",
          title: "Borrow Some Math",
          topics: ["Modules"],
          difficulty: 1,
          minutes: 8,
          kind: "code",
          language: "Python",
          prompt: "Import the math module and print the square root of 81 using math.sqrt.",
          starter: "# import math and print the square root of 81\n",
          checks: [
            { test: /import\s+math/, message: "Import the math module." },
            { test: /math\.sqrt\s*\(\s*81\s*\)/, message: "Call math.sqrt(81)." },
            { test: /print\s*\(/, message: "Print the result." }
          ],
          hint: "import math\nprint(math.sqrt(81))",
          explanation:
            "The standard library ships with modules like math so you don't have to write sqrt() yourself — import math, then call its functions with the math. prefix."
        }
      ],
      objects: [
        {
          id: "introductionToProgramming-objects-1",
          title: "Where'd It Go?",
          topics: ["OOP", "Classes"],
          difficulty: 2,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt: "Write a class Dog whose __init__ stores a name parameter on self.name. Create d = Dog(\"Rex\") and print d.name.",
          starter:
            "class Dog:\n    def __init__(self, name):\n        # store name on self\n        pass\n\n# create d = Dog(\"Rex\") and print d.name\n",
          checks: [
            { test: /class\s+Dog\s*:/, message: "Define a class named Dog." },
            { test: /def\s+__init__\s*\(\s*self\s*,\s*name\s*\)\s*:/, message: "Give __init__ a name parameter." },
            { test: /self\.name\s*=\s*name/, message: "Store the parameter on self.name." },
            { test: /Dog\s*\(\s*["']Rex["']\s*\)/, message: 'Create an instance with Dog("Rex").' },
            { test: /print\s*\(\s*\w+\.name\s*\)/, message: "Print the instance's .name attribute." }
          ],
          hint: "class Dog:\n    def __init__(self, name):\n        self.name = name\n\nd = Dog(\"Rex\")\nprint(d.name)",
          explanation:
            "self.name = name stores the value on the instance, so it's accessible later as d.name."
        },
        {
          id: "introductionToProgramming-objects-2",
          title: "Comprehend This",
          topics: ["Pythonic Code", "List Comprehension"],
          difficulty: 3,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt: "Use a list comprehension to build the squares of the even numbers from 0 to 9, then print it.",
          starter: "# Build the list with a comprehension, then print it.\n",
          checks: [
            {
              test: /\[\s*\w+\s*\*\*\s*2\s+for\s+\w+\s+in\s+range\s*\(\s*10\s*\)\s+if\s+\w+\s*%\s*2\s*==\s*0\s*\]/,
              message: "Use [x**2 for x in range(10) if x % 2 == 0]."
            },
            { test: /print\s*\(/, message: "Print the resulting list." }
          ],
          hint: "print([x**2 for x in range(10) if x % 2 == 0])",
          explanation:
            "The `if x % 2 == 0` filters down to even x, and x**2 squares each one that passes."
        },
        {
          id: "introductionToProgramming-objects-3",
          title: "Keep Counting",
          topics: ["OOP", "Methods"],
          difficulty: 2,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt:
            "Write a class Counter with an __init__ that sets self.count = 0, and a method increment(self) that adds 1 to self.count. Create c = Counter(), call c.increment() twice, then print c.count.",
          starter:
            "class Counter:\n    def __init__(self):\n        self.count = 0\n\n    def increment(self):\n        pass\n\n# create c, call increment() twice, print c.count\n",
          checks: [
            { test: /def\s+increment\s*\(\s*self\s*\)\s*:/, message: "Define increment(self)." },
            { test: /self\.count\s*(\+=\s*1|=\s*self\.count\s*\+\s*1)/, message: "Add 1 to self.count inside increment()." },
            { test: /Counter\s*\(\s*\)/, message: "Create an instance with Counter()." },
            { test: /\.increment\s*\(\s*\)/, message: "Call .increment() on the instance." },
            { test: /print\s*\(\s*\w+\.count\s*\)/, message: "Print the instance's .count." }
          ],
          hint:
            "class Counter:\n    def __init__(self):\n        self.count = 0\n\n    def increment(self):\n        self.count += 1\n\nc = Counter()\nc.increment()\nc.increment()\nprint(c.count)",
          explanation:
            "Each method call mutates the same instance's state — self.count persists between calls because it lives on the object, not inside increment() itself."
        },
        {
          id: "introductionToProgramming-objects-4",
          title: "Inherit the Bark",
          topics: ["OOP", "Inheritance"],
          difficulty: 3,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt:
            "Write a class Animal with __init__(self, name) storing self.name. Write a class Dog that inherits from Animal and adds a method bark(self) returning f\"{self.name} says woof!\".",
          starter: "class Animal:\n    def __init__(self, name):\n        self.name = name\n\nclass Dog(Animal):\n    pass\n\n# add a bark() method to Dog\n",
          checks: [
            { test: /class\s+Dog\s*\(\s*Animal\s*\)\s*:/, message: "Define Dog as a subclass: class Dog(Animal):" },
            { test: /def\s+bark\s*\(\s*self\s*\)\s*:/, message: "Define bark(self) on Dog." },
            { test: /return\s+f["'][^"']*\{\s*self\.name\s*\}/, message: "Return an f-string that includes self.name." }
          ],
          hint: 'class Dog(Animal):\n    def bark(self):\n        return f"{self.name} says woof!"',
          explanation:
            "Dog(Animal) inherits __init__ from Animal for free — Dog only needs to define what's new, bark(), instead of repeating the name-storing logic."
        },
        {
          id: "introductionToProgramming-objects-5",
          title: "Build It Both Ways",
          topics: ["Pythonic Code", "Dict Comprehension"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            'Given words = ["cat", "elephant", "dog"], use a dict comprehension to build a dictionary mapping each word to its length, then print it.',
          starter: 'words = ["cat", "elephant", "dog"]\n# build the dict with a comprehension, then print it\n',
          checks: [
            {
              test: /\{\s*\w+\s*:\s*len\s*\(\s*\w+\s*\)\s+for\s+\w+\s+in\s+words\s*\}/,
              message: "Use {word: len(word) for word in words}."
            },
            { test: /print\s*\(/, message: "Print the resulting dict." }
          ],
          hint: "print({word: len(word) for word in words})",
          explanation:
            "A dict comprehension follows the same shape as a list comprehension, just with key: value before the for clause instead of a single expression."
        }
      ]
    },

    ai: {
      "api-layer": [
        {
          id: "ai-api-layer-1",
          title: "Whose Voice Is It?",
          topics: ["Prompt Engineering"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt:
            'Build a messages list for a chat call with one system message ("You are a helpful assistant.") and one user message ("Hello!"), then print it.',
          starter: "# Build the messages list below.\nmessages = []\n\n",
          checks: [
            { test: /["']role["']\s*:\s*["']system["']/, message: 'Include a message with role set to "system".' },
            { test: /["']role["']\s*:\s*["']user["']/, message: 'Include a message with role set to "user".' },
            { test: /messages\s*=/, message: "Assign the list to a variable named messages." },
            { test: /print\s*\(\s*messages\s*\)/, message: "Print messages." }
          ],
          hint:
            'messages = [\n    {"role": "system", "content": "You are a helpful assistant."},\n    {"role": "user", "content": "Hello!"}\n]\nprint(messages)',
          explanation:
            "The system message sets standing behaviour the model treats as context for the whole conversation — kept separate from what the user actually says."
        },
        {
          id: "ai-api-layer-2",
          title: "Turn the Dial",
          topics: ["Prompt Engineering", "API Parameters"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt:
            'Build a dictionary named params for an API call with a "model" key and a "temperature" key set low (0.0 to 0.2) for consistent, repeatable output, then print it.',
          starter: "# Build params with model and a low temperature.\nparams = {}\n\n",
          checks: [
            { test: /["']model["']\s*:/, message: 'Include a "model" key.' },
            { test: /["']temperature["']\s*:\s*0(\.[0-2]\d*)?\b/, message: '"temperature" should be a low value between 0.0 and 0.2.' },
            { test: /print\s*\(\s*params\s*\)/, message: "Print params." }
          ],
          hint: 'params = {"model": "gpt-4o", "temperature": 0.0}\nprint(params)',
          explanation:
            "Temperature controls randomness in sampling — a low value like 0.0 makes output far more deterministic and repeatable across calls."
        },
        {
          id: "ai-api-layer-3",
          title: "Show, Don't Just Tell",
          topics: ["Prompt Engineering", "Few-shot"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            'Build a messages list containing a system message, then one example user/assistant exchange (a "few-shot" example), then a new user message, so the model can see the pattern before answering.',
          starter: "messages = []\n# add system, one user/assistant example pair, then a new user message\n",
          checks: [
            { test: /["']role["']\s*:\s*["']system["']/, message: 'Include a "system" message.' },
            { test: /["']role["']\s*:\s*["']assistant["']/, message: 'Include an example "assistant" message (the few-shot answer).' },
            {
              test: /["']role["']\s*:\s*["']user["'][\s\S]*["']role["']\s*:\s*["']user["']/,
              message: 'Include two "user" messages: the example question and the real one.'
            }
          ],
          hint:
            'messages = [\n    {"role": "system", "content": "You are a concise assistant."},\n    {"role": "user", "content": "2 + 2?"},\n    {"role": "assistant", "content": "4"},\n    {"role": "user", "content": "5 + 3?"}\n]',
          explanation:
            "A few-shot example shows the model the exact shape of answer you want, rather than describing it in words — often more reliable than instructions alone."
        },
        {
          id: "ai-api-layer-4",
          title: "Don't Hardcode It",
          topics: ["Security", "Environment Variables"],
          difficulty: 1,
          minutes: 8,
          kind: "code",
          language: "Python",
          prompt:
            "Read an API key from an environment variable named OPENAI_API_KEY using the os module, storing it in a variable api_key, instead of writing the key directly in the code.",
          starter: "import os\n# read the API key from the environment\n",
          checks: [
            { test: /import\s+os/, message: "Import os." },
            {
              test: /api_key\s*=\s*os\.environ\.get\s*\(\s*["']OPENAI_API_KEY["']\s*\)|api_key\s*=\s*os\.getenv\s*\(\s*["']OPENAI_API_KEY["']\s*\)/,
              message: 'Read it with os.environ.get("OPENAI_API_KEY") or os.getenv(...).'
            }
          ],
          hint: 'import os\napi_key = os.environ.get("OPENAI_API_KEY")',
          explanation:
            "Reading secrets from the environment instead of hardcoding them means the key never ends up committed to source control by accident."
        },
        {
          id: "ai-api-layer-5",
          title: "Wait For It",
          topics: ["Async", "API Calls"],
          difficulty: 2,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt:
            "Define an async function fetch_reply(client, prompt) that awaits client.chat.completions.create(...) — passing prompt as the only keyword you need to include — and returns the result.",
          starter: "async def fetch_reply(client, prompt):\n    pass\n",
          checks: [
            { test: /async\s+def\s+fetch_reply\s*\(\s*client\s*,\s*prompt\s*\)\s*:/, message: "Define async def fetch_reply(client, prompt):" },
            { test: /await\s+client\.chat\.completions\.create\s*\(/, message: "Await client.chat.completions.create(...)." },
            { test: /return\s+/, message: "Return the result." }
          ],
          hint: "async def fetch_reply(client, prompt):\n    return await client.chat.completions.create(messages=prompt)",
          explanation:
            "await hands control back while the network call is in flight, instead of freezing the whole program until the model responds."
        }
      ],
      "reliable-grounded": [
        {
          id: "ai-reliable-grounded-1",
          title: "Shape the Output",
          topics: ["Structured Output"],
          difficulty: 2,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt:
            'Build a JSON schema dictionary named schema describing an object with a required string field "name" and a required integer field "age", then print it.',
          starter: "# Build the schema dict below.\nschema = {}\n\n",
          checks: [
            { test: /["']type["']\s*:\s*["']object["']/, message: 'Set "type" to "object".' },
            { test: /["']name["']\s*:\s*\{\s*["']type["']\s*:\s*["']string["']/, message: 'Describe "name" as a string field.' },
            { test: /["']age["']\s*:\s*\{\s*["']type["']\s*:\s*["']integer["']/, message: 'Describe "age" as an integer field.' },
            { test: /print\s*\(\s*schema\s*\)/, message: "Print schema." }
          ],
          hint:
            'schema = {\n    "type": "object",\n    "properties": {\n        "name": {"type": "string"},\n        "age": {"type": "integer"}\n    },\n    "required": ["name", "age"]\n}\nprint(schema)',
          explanation:
            "Passing a schema like this to structured-output mode forces the model's response to conform to it — far more reliable than asking for JSON in plain words."
        },
        {
          id: "ai-reliable-grounded-2",
          title: "Ground Truth",
          topics: ["RAG", "Embeddings"],
          difficulty: 2,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt:
            "Write a function cosine_similarity(a, b) that returns the dot product of two equal-length lists a and b divided by the product of their magnitudes, using math.sqrt.",
          starter: "import math\n\ndef cosine_similarity(a, b):\n    # return the cosine similarity of a and b\n    pass\n",
          checks: [
            { test: /def\s+cosine_similarity\s*\(\s*a\s*,\s*b\s*\)\s*:/, message: "Define cosine_similarity(a, b)." },
            { test: /sum\s*\(/, message: "Use sum() to compute the dot product, e.g. sum(x * y for x, y in zip(a, b))." },
            { test: /math\.sqrt\s*\(/, message: "Use math.sqrt() to compute a magnitude." },
            { test: /return\s+/, message: "Return the computed similarity." }
          ],
          hint:
            "def cosine_similarity(a, b):\n    dot = sum(x * y for x, y in zip(a, b))\n    mag_a = math.sqrt(sum(x * x for x in a))\n    mag_b = math.sqrt(sum(y * y for y in b))\n    return dot / (mag_a * mag_b)",
          explanation:
            "This is exactly what embedding similarity search does under the hood: turn two vectors into one number describing how similar their directions are — the closer to 1, the more alike their meaning."
        },
        {
          id: "ai-reliable-grounded-3",
          title: "Give It a Tool",
          topics: ["Tool Calling"],
          difficulty: 2,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt:
            'Build a dictionary named tool describing a function get_weather(city: str) as a tool definition, with a "name" key and a "parameters" key whose value is a JSON-schema-style object requiring a string "city" property.',
          starter: "tool = {}\n# describe get_weather as a tool\n",
          checks: [
            { test: /["']name["']\s*:\s*["']get_weather["']/, message: 'Set "name" to "get_weather".' },
            { test: /["']parameters["']\s*:/, message: 'Include a "parameters" key.' },
            { test: /["']city["']\s*:\s*\{\s*["']type["']\s*:\s*["']string["']/, message: 'Describe "city" as a string property.' }
          ],
          hint:
            'tool = {\n    "name": "get_weather",\n    "parameters": {\n        "type": "object",\n        "properties": {"city": {"type": "string"}},\n        "required": ["city"]\n    }\n}',
          explanation:
            "A tool definition is just a schema describing a function's name and arguments — the model uses it to decide when and how to call that function, without ever running your code itself."
        },
        {
          id: "ai-reliable-grounded-4",
          title: "Shape It With Pydantic",
          topics: ["Structured Output", "Pydantic"],
          difficulty: 2,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt: "Using Pydantic, define a model named Recipe with a string field title and a list-of-strings field ingredients.",
          starter: "from pydantic import BaseModel\n\n# define Recipe below\n",
          checks: [
            { test: /class\s+Recipe\s*\(\s*BaseModel\s*\)\s*:/, message: "Define class Recipe(BaseModel):" },
            { test: /title\s*:\s*str/, message: "Give it a field title: str." },
            { test: /ingredients\s*:\s*list\s*\[\s*str\s*\]|ingredients\s*:\s*List\s*\[\s*str\s*\]/, message: "Give it a field ingredients: list[str]." }
          ],
          hint: "class Recipe(BaseModel):\n    title: str\n    ingredients: list[str]",
          explanation:
            "A Pydantic model is a schema and a validator in one — passing it to structured-output mode guarantees the model's response deserializes into exactly this shape or fails loudly."
        },
        {
          id: "ai-reliable-grounded-5",
          title: "Slice the Document",
          topics: ["RAG", "Chunking"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            "Write a function chunk_text(text, size) that splits text into a list of substrings, each up to size characters long, and returns that list.",
          starter: "def chunk_text(text, size):\n    pass\n",
          checks: [
            { test: /def\s+chunk_text\s*\(\s*text\s*,\s*size\s*\)\s*:/, message: "Define chunk_text(text, size)." },
            { test: /range\s*\(\s*0\s*,\s*len\s*\(\s*text\s*\)\s*,\s*size\s*\)/, message: "Step through text in strides of size, e.g. range(0, len(text), size)." },
            { test: /text\[\s*\w+\s*:\s*\w+\s*\+\s*size\s*\]/, message: "Slice out each chunk with text[i:i + size]." },
            { test: /return\s+/, message: "Return the list of chunks." }
          ],
          hint: "def chunk_text(text, size):\n    return [text[i:i + size] for i in range(0, len(text), size)]",
          explanation:
            "RAG can't embed an entire document as one vector and still search it usefully, so it's split into fixed-size chunks first — this is the simplest possible chunking strategy."
        }
      ],
      "agents-shipping": [
        {
          id: "ai-agents-shipping-1",
          title: "Remember Me",
          topics: ["Agents", "State"],
          difficulty: 3,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt:
            'Write a function remember(memory, role, content) that appends a dict with keys "role" and "content" to the list memory, and returns memory.',
          starter: "def remember(memory, role, content):\n    # append the new entry and return memory\n    pass\n",
          checks: [
            { test: /def\s+remember\s*\(\s*memory\s*,\s*role\s*,\s*content\s*\)\s*:/, message: "Define remember(memory, role, content)." },
            { test: /memory\.append\s*\(/, message: "Append to memory with memory.append(...)." },
            { test: /["']role["']\s*:\s*role/, message: 'Store role under the key "role".' },
            { test: /["']content["']\s*:\s*content/, message: 'Store content under the key "content".' },
            { test: /return\s+memory/, message: "Return memory." }
          ],
          hint: 'def remember(memory, role, content):\n    memory.append({"role": role, "content": content})\n    return memory',
          explanation:
            "Since the context window is limited, agents persist state like this externally and pull back only what's relevant, instead of keeping everything in one prompt forever."
        },
        {
          id: "ai-agents-shipping-2",
          title: "Ship It",
          topics: ["Deployment", "FastAPI"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt: 'Define a FastAPI GET endpoint at /status that returns {"status": "running"}.',
          starter: "from fastapi import FastAPI\n\napp = FastAPI()\n\n# Define the /status route below.\n",
          checks: [
            { test: /@app\.get\s*\(\s*["']\/status["']\s*\)/, message: 'Decorate a function with @app.get("/status").' },
            { test: /def\s+\w+\s*\(\s*\)\s*:/, message: "Define a function with no parameters underneath." },
            { test: /return\s*\{\s*["']status["']\s*:\s*["']running["']\s*\}/, message: 'Return {"status": "running"}.' }
          ],
          hint: '@app.get("/status")\ndef status():\n    return {"status": "running"}',
          explanation:
            "One small route like this is the standard way to prove a FastAPI backend is actually up before wiring anything else to it."
        },
        {
          id: "ai-agents-shipping-3",
          title: "Pick the Right Agent",
          topics: ["Agents", "Routing"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            'Write a function route(task, agents) that looks up task as a key in the dictionary agents and returns the matching agent, or returns agents["default"] if task isn\'t found.',
          starter: "def route(task, agents):\n    pass\n",
          checks: [
            { test: /def\s+route\s*\(\s*task\s*,\s*agents\s*\)\s*:/, message: "Define route(task, agents)." },
            { test: /agents\.get\s*\(\s*task\s*,\s*agents\[\s*["']default["']\s*\]\s*\)/, message: 'Return agents.get(task, agents["default"]).' }
          ],
          hint: 'def route(task, agents):\n    return agents.get(task, agents["default"])',
          explanation:
            "Routing between specialized agents is often just a lookup — the fallback to a default agent matters just as much as the happy path, so an unrecognized task never falls through with no handler."
        },
        {
          id: "ai-agents-shipping-4",
          title: "Take the Order",
          topics: ["FastAPI", "Pydantic"],
          difficulty: 2,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt:
            'Define a Pydantic model ChatRequest with a string field message, then a FastAPI POST endpoint at /chat that accepts a ChatRequest body and returns {"received": body.message}.',
          starter: "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\n# define ChatRequest, then the /chat route\n",
          checks: [
            { test: /class\s+ChatRequest\s*\(\s*BaseModel\s*\)\s*:/, message: "Define class ChatRequest(BaseModel):" },
            { test: /message\s*:\s*str/, message: "Give ChatRequest a field message: str." },
            { test: /@app\.post\s*\(\s*["']\/chat["']\s*\)/, message: 'Decorate a function with @app.post("/chat").' },
            { test: /return\s*\{\s*["']received["']\s*:\s*\w+\.message\s*\}/, message: 'Return {"received": body.message}.' }
          ],
          hint: 'class ChatRequest(BaseModel):\n    message: str\n\n@app.post("/chat")\ndef chat(body: ChatRequest):\n    return {"received": body.message}',
          explanation:
            "FastAPI validates the incoming JSON against ChatRequest automatically — by the time your function body runs, body.message is guaranteed to be a string."
        },
        {
          id: "ai-agents-shipping-5",
          title: "Configure by Environment",
          topics: ["Deployment", "Config"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt:
            'Write code that reads an environment variable named ENVIRONMENT, defaulting to "development" if it is not set, and prints it.',
          starter: "import os\n# read ENVIRONMENT, defaulting to development, then print it\n",
          checks: [
            {
              test: /os\.environ\.get\s*\(\s*["']ENVIRONMENT["']\s*,\s*["']development["']\s*\)|os\.getenv\s*\(\s*["']ENVIRONMENT["']\s*,\s*["']development["']\s*\)/,
              message: 'Read ENVIRONMENT with a "development" default.'
            },
            { test: /print\s*\(/, message: "Print the result." }
          ],
          hint: 'import os\nenv = os.environ.get("ENVIRONMENT", "development")\nprint(env)',
          explanation:
            "A sensible default means the app still runs locally without every environment variable being set, while still picking up the real value once deployed."
        }
      ]
    },

    softwareEngineering: {
      "engineering-foundations": [
        {
          id: "softwareEngineering-engineering-foundations-1",
          title: "Undo Safely",
          topics: ["Git", "Version Control"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "bash",
          prompt:
            "Write the git command that safely undoes a commit which has already been pushed and pulled by others, without rewriting history.",
          starter: "# Write the git command below.\n",
          checks: [{ test: /git\s+revert\s+\S+/, message: "Use `git revert <commit>`." }],
          hint: "git revert <commit-hash>",
          explanation:
            "git revert adds a new commit that undoes the change, leaving history intact — safe once a commit is shared. git reset --hard and git rebase both rewrite history."
        },
        {
          id: "softwareEngineering-engineering-foundations-2",
          title: "Don't Repeat Yourself",
          topics: ["Code Quality"],
          difficulty: 1,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            "This block is duplicated four times:\n\ntax = price * 0.11\ntotal = price + tax\n\nExtract it into a function with_tax(price) that returns the total, then call with_tax(100).",
          starter: "def with_tax(price):\n    pass\n\n# call with_tax(100) below\n",
          checks: [
            { test: /def\s+with_tax\s*\(\s*price\s*\)\s*:/, message: "Define with_tax(price)." },
            { test: /price\s*\*\s*0\.11/, message: "Compute tax as price * 0.11." },
            { test: /return\s+/, message: "Return the total from the function." },
            { test: /with_tax\s*\(\s*100\s*\)/, message: "Call with_tax(100)." }
          ],
          hint: "def with_tax(price):\n    tax = price * 0.11\n    return price + tax\n\nwith_tax(100)",
          explanation:
            "Duplicated logic is a maintenance risk — a bug fix has to be applied everywhere it was copied. Extracting a function gives you one place to fix it."
        },
        {
          id: "softwareEngineering-engineering-foundations-3",
          title: "Branch Out",
          topics: ["Git"],
          difficulty: 1,
          minutes: 8,
          kind: "code",
          language: "bash",
          prompt: "Write the git command that creates a new branch named feature/login and switches to it in one step.",
          starter: "# write the git command below\n",
          checks: [{ test: /git\s+checkout\s+-b\s+feature\/login/, message: "Use `git checkout -b feature/login`." }],
          hint: "git checkout -b feature/login",
          explanation:
            "The -b flag tells checkout to create the branch first, then switch to it — one command instead of `git branch` followed by a separate `git checkout`."
        },
        {
          id: "softwareEngineering-engineering-foundations-4",
          title: "Name It Well",
          topics: ["Code Quality", "Readability"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt:
            "Rename this poorly-named function so its name actually describes what it does, keeping the body the same:\n\ndef f(x):\n    return x * 1.11\n\nGive it a descriptive name like add_tax.",
          starter: "def f(x):\n    return x * 1.11\n",
          checks: [
            { test: /def\s+[a-z_]{4,}\s*\(\s*\w+\s*\)\s*:/, message: "Rename f to a descriptive name of at least 4 letters, e.g. add_tax." },
            { test: /return\s+\w+\s*\*\s*1\.11/, message: "Keep the calculation x * 1.11 in the return statement." }
          ],
          hint: "def add_tax(price):\n    return price * 1.11",
          explanation:
            "f(x) tells a reader nothing; add_tax(price) tells them what the function does without needing to read its body at all."
        },
        {
          id: "softwareEngineering-engineering-foundations-5",
          title: "Commit With Meaning",
          topics: ["Git", "Commits"],
          difficulty: 1,
          minutes: 8,
          kind: "code",
          language: "bash",
          prompt: 'Write the git command that stages all changes and commits them with the message "Fix login validation bug".',
          starter: "# stage everything and commit with a message\n",
          checks: [
            { test: /git\s+add\s+(\.|--all|-A)/, message: "Stage changes with `git add .` (or --all / -A)." },
            { test: /git\s+commit\s+-m\s+["']Fix login validation bug["']/, message: 'Commit with git commit -m "Fix login validation bug".' }
          ],
          hint: 'git add .\ngit commit -m "Fix login validation bug"',
          explanation:
            'A commit message that says what changed and why ("Fix login validation bug") is worth far more to a future reader than a vague "update" or "wip".'
        }
      ],
      "data-and-design": [
        {
          id: "softwareEngineering-data-and-design-1",
          title: "Big O Pick",
          topics: ["Data Structures", "Complexity"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt: "Build a set named ids from the list numbers, then check whether 3 is in ids and print the result.",
          starter: "numbers = [1, 2, 3, 4, 5]\n# build a set and check membership\n",
          checks: [
            { test: /ids\s*=\s*set\s*\(\s*numbers\s*\)/, message: "Build a set named ids from numbers, e.g. ids = set(numbers)." },
            { test: /3\s+in\s+ids/, message: "Check `3 in ids`." },
            { test: /print\s*\(/, message: "Print the result." }
          ],
          hint: "ids = set(numbers)\nprint(3 in ids)",
          explanation:
            "A set is backed by a hash table, giving average O(1) membership checks — checking `in` on a list would need to scan it one item at a time."
        },
        {
          id: "softwareEngineering-data-and-design-2",
          title: "One Job",
          topics: ["Design Principles"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            'A class UserManager currently creates users, emails them, and generates invoices — three responsibilities in one class. Split the email responsibility into its own function send_welcome_email(user) that returns f"Welcome, {user}!".',
          starter: "# Define send_welcome_email(user) below.\n",
          checks: [
            { test: /def\s+send_welcome_email\s*\(\s*user\s*\)\s*:/, message: "Define send_welcome_email(user)." },
            { test: /return\s+f["']/, message: "Return an f-string greeting." },
            { test: /\{\s*user\s*\}/, message: "Include the user inside the f-string." }
          ],
          hint: 'def send_welcome_email(user):\n    return f"Welcome, {user}!"',
          explanation:
            "Single Responsibility says a class (or function) should have one reason to change. Pulling the email logic into its own function is the first step toward UserManager no longer doing three unrelated jobs."
        },
        {
          id: "softwareEngineering-data-and-design-3",
          title: "Last One In, First One Out",
          topics: ["Data Structures", "Stacks"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt: "Using a plain list as a stack, push 1, 2, then 3 onto stack with append(), then pop the top item and print it.",
          starter: "stack = []\n# push 1, 2, 3, then pop and print the top\n",
          checks: [
            { test: /stack\.append\s*\(\s*1\s*\)/, message: "Push 1 with stack.append(1)." },
            { test: /stack\.append\s*\(\s*2\s*\)/, message: "Push 2 with stack.append(2)." },
            { test: /stack\.append\s*\(\s*3\s*\)/, message: "Push 3 with stack.append(3)." },
            { test: /stack\.pop\s*\(\s*\)/, message: "Pop the top item with stack.pop()." },
            { test: /print\s*\(/, message: "Print the popped value." }
          ],
          hint: "stack.append(1)\nstack.append(2)\nstack.append(3)\nprint(stack.pop())",
          explanation:
            "A Python list's append()/pop() pair (from the end) behaves exactly like a stack — last in, first out — with no extra data structure needed."
        },
        {
          id: "softwareEngineering-data-and-design-4",
          title: "First One In, First One Out",
          topics: ["Data Structures", "Queues"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            "Using collections.deque as a queue, enqueue 1, 2, then 3 with append(), then dequeue the oldest item with popleft() and print it.",
          starter: "from collections import deque\nqueue = deque()\n# enqueue 1, 2, 3, then dequeue and print\n",
          checks: [
            { test: /queue\.append\s*\(\s*1\s*\)/, message: "Enqueue 1 with queue.append(1)." },
            { test: /queue\.append\s*\(\s*2\s*\)/, message: "Enqueue 2 with queue.append(2)." },
            { test: /queue\.append\s*\(\s*3\s*\)/, message: "Enqueue 3 with queue.append(3)." },
            { test: /queue\.popleft\s*\(\s*\)/, message: "Dequeue with queue.popleft()." },
            { test: /print\s*\(/, message: "Print the dequeued value." }
          ],
          hint: "queue.append(1)\nqueue.append(2)\nqueue.append(3)\nprint(queue.popleft())",
          explanation:
            "deque.popleft() removes from the front in O(1) — a plain list's pop(0) would have to shift every remaining item down, making it O(n)."
        },
        {
          id: "softwareEngineering-data-and-design-5",
          title: "Open for Extension",
          topics: ["Design Principles", "Open/Closed"],
          difficulty: 3,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt:
            "Instead of an if/elif chain per shape type, give each shape class its own area() method, then write total_area(shapes) that sums shape.area() for every shape in the list — so a new shape never requires changing total_area.",
          starter:
            "class Square:\n    def __init__(self, side):\n        self.side = side\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n# add area() to Square and Circle, then write total_area(shapes)\n",
          checks: [
            { test: /def\s+area\s*\(\s*self\s*\)\s*:/, message: "Give Square and Circle each their own area() method." },
            { test: /def\s+total_area\s*\(\s*shapes\s*\)\s*:/, message: "Define total_area(shapes)." },
            { test: /\w+\.area\s*\(\s*\)/, message: "Call .area() on each shape inside total_area()." }
          ],
          hint:
            "class Square:\n    def __init__(self, side):\n        self.side = side\n\n    def area(self):\n        return self.side ** 2\n\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    def area(self):\n        return 3.14159 * self.radius ** 2\n\ndef total_area(shapes):\n    return sum(shape.area() for shape in shapes)",
          explanation:
            "total_area() never needs to know what kinds of shapes exist — it just calls .area() polymorphically. Adding a Triangle later means writing a Triangle class, not editing total_area() at all."
        }
      ],
      "data-and-services": [
        {
          id: "softwareEngineering-data-and-services-1",
          title: "Join the Dots",
          topics: ["SQL", "Databases"],
          difficulty: 2,
          minutes: 15,
          kind: "code",
          language: "SQL",
          prompt:
            "Write the SQL query that selects every row from users, plus matching rows from orders where they exist (NULL where a user has no orders).",
          starter: "-- Write your SQL query below.\n",
          checks: [
            { test: /SELECT/i, message: "Start with SELECT." },
            { test: /FROM\s+users/i, message: "Select FROM users." },
            { test: /LEFT\s+JOIN\s+orders/i, message: "Use LEFT JOIN orders." }
          ],
          hint: "SELECT * FROM users LEFT JOIN orders ON users.id = orders.user_id;",
          explanation:
            "LEFT JOIN keeps every row from the left table (users) and fills unmatched orders columns with NULL — INNER JOIN would drop users with no orders entirely."
        },
        {
          id: "softwareEngineering-data-and-services-2",
          title: "Right Verb",
          topics: ["HTTP", "APIs"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt:
            'Using the requests library, send an HTTP PUT request to "/items/42" that updates the resource with {"name": "Widget"}.',
          starter: "import requests\n\n# send the PUT request below\n",
          checks: [
            { test: /requests\.put\s*\(/, message: "Use requests.put(...)." },
            { test: /["']\/items\/42["']/, message: 'Target the URL "/items/42".' },
            { test: /["']name["']\s*:\s*["']Widget["']/, message: 'Send {"name": "Widget"} as the body.' }
          ],
          hint: 'requests.put("/items/42", json={"name": "Widget"})',
          explanation:
            "PUT is the conventional method for updating an existing resource in place — GET reads, POST creates, DELETE removes."
        },
        {
          id: "softwareEngineering-data-and-services-3",
          title: "Sort the Results",
          topics: ["SQL"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "SQL",
          prompt: "Write the SQL query that selects name and age from users where age is greater than 18, ordered by age descending.",
          starter: "-- write your query below\n",
          checks: [
            { test: /SELECT\s+name\s*,\s*age/i, message: "Select name and age." },
            { test: /FROM\s+users/i, message: "Select FROM users." },
            { test: /WHERE\s+age\s*>\s*18/i, message: "Filter with WHERE age > 18." },
            { test: /ORDER\s+BY\s+age\s+DESC/i, message: "Sort with ORDER BY age DESC." }
          ],
          hint: "SELECT name, age FROM users WHERE age > 18 ORDER BY age DESC;",
          explanation:
            "ORDER BY controls the result's sort order after filtering — DESC sorts largest first, which ASC (the default) would not."
        },
        {
          id: "softwareEngineering-data-and-services-4",
          title: "Count by Group",
          topics: ["SQL", "Aggregation"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "SQL",
          prompt: "Write the SQL query that counts how many orders each user placed, grouping by user_id, from a table named orders.",
          starter: "-- write your query below\n",
          checks: [
            { test: /SELECT\s+user_id\s*,\s*COUNT\s*\(/i, message: "Select user_id and COUNT(...)." },
            { test: /FROM\s+orders/i, message: "Select FROM orders." },
            { test: /GROUP\s+BY\s+user_id/i, message: "Group with GROUP BY user_id." }
          ],
          hint: "SELECT user_id, COUNT(*) FROM orders GROUP BY user_id;",
          explanation:
            "GROUP BY collapses all rows sharing the same user_id into one row per user, and COUNT(*) counts how many original rows fell into each group."
        },
        {
          id: "softwareEngineering-data-and-services-5",
          title: "Check the Status",
          topics: ["HTTP", "Status Codes"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt:
            'Using the requests library, send a GET request to "/health" and print True if the response status code is 200, otherwise False.',
          starter: "import requests\n\n# send the GET request and print whether it succeeded\n",
          checks: [
            { test: /requests\.get\s*\(\s*["']\/health["']\s*\)/, message: 'Send requests.get("/health").' },
            { test: /\.status_code\s*==\s*200/, message: "Compare .status_code to 200." },
            { test: /print\s*\(/, message: "Print the result." }
          ],
          hint: 'response = requests.get("/health")\nprint(response.status_code == 200)',
          explanation:
            "2xx status codes mean success — checking for exactly 200 (rather than just truthiness) is how code confirms an HTTP call actually succeeded instead of silently failing."
        }
      ],
      "backend-and-security": [
        {
          id: "softwareEngineering-backend-and-security-1",
          title: "Store It Safely",
          topics: ["Authentication", "Security"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            'Using the bcrypt module, hash the password "correct horse" and print the resulting hash. (Assume bcrypt is already imported.)',
          starter: "import bcrypt\n\n# hash the password below\n",
          checks: [
            { test: /bcrypt\.hashpw\s*\(/, message: "Use bcrypt.hashpw(...)." },
            { test: /bcrypt\.gensalt\s*\(\s*\)/, message: "Generate a salt with bcrypt.gensalt()." },
            { test: /print\s*\(/, message: "Print the resulting hash." }
          ],
          hint: 'hashed = bcrypt.hashpw(b"correct horse", bcrypt.gensalt())\nprint(hashed)',
          explanation:
            "bcrypt is a slow, salted hashing algorithm built for passwords — one-way, so even a database leak doesn't expose the real password. Encryption and Base64 are both reversible, which is why they're the wrong tool here."
        },
        {
          id: "softwareEngineering-backend-and-security-2",
          title: "Spot the Attack",
          topics: ["Web Security"],
          difficulty: 3,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt:
            "This line is vulnerable to SQL injection:\n\nquery = \"SELECT * FROM users WHERE email = '\" + email + \"'\"\n\nRewrite it as a parameterized query using a ? placeholder and a separate params tuple.",
          starter: 'email = "someone@example.com"\n# rewrite the query safely below\n',
          checks: [
            { test: /WHERE\s+email\s*=\s*\?/, message: "Use a ? placeholder instead of concatenating email into the string." },
            { test: /\(\s*email\s*,\s*\)/, message: "Pass email separately as a params tuple, e.g. (email,)." }
          ],
          hint: 'query = "SELECT * FROM users WHERE email = ?"\nparams = (email,)',
          explanation:
            "Concatenating raw user input directly into SQL lets an attacker inject SQL of their own. A parameterized query keeps the input as data, never as part of the SQL syntax itself."
        },
        {
          id: "softwareEngineering-backend-and-security-3",
          title: "Has It Expired?",
          topics: ["Authentication", "Tokens"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            'Write a function is_expired(token) that returns True when token["expires_at"] (a Unix timestamp) is less than the current time (use time.time()), otherwise False.',
          starter: "import time\n\ndef is_expired(token):\n    pass\n",
          checks: [
            { test: /def\s+is_expired\s*\(\s*token\s*\)\s*:/, message: "Define is_expired(token)." },
            { test: /token\[\s*["']expires_at["']\s*\]/, message: 'Read token["expires_at"].' },
            { test: /time\.time\s*\(\s*\)/, message: "Compare against time.time()." },
            { test: /return\s+token\[\s*["']expires_at["']\s*\]\s*<\s*time\.time\s*\(\s*\)/, message: 'Return token["expires_at"] < time.time().' }
          ],
          hint: 'def is_expired(token):\n    return token["expires_at"] < time.time()',
          explanation:
            "A session or access token that never expires is a standing security risk — checking expires_at against the current time is what forces re-authentication after a set window."
        },
        {
          id: "softwareEngineering-backend-and-security-4",
          title: "Trust Nothing",
          topics: ["Security", "Validation"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt: "Write a function is_valid_username(name) that returns True only when name is non-empty and at most 20 characters long, otherwise False.",
          starter: "def is_valid_username(name):\n    pass\n",
          checks: [
            { test: /def\s+is_valid_username\s*\(\s*name\s*\)\s*:/, message: "Define is_valid_username(name)." },
            { test: /len\s*\(\s*name\s*\)/, message: "Check the length of name with len(name)." },
            { test: /<=\s*20/, message: "Cap the length at 20 characters (<= 20)." },
            { test: /0\s*<|len\s*\(\s*name\s*\)\s*>\s*0|len\s*\(\s*name\s*\)\s*!=\s*0/, message: "Also make sure name isn't empty (e.g. 0 < len(name))." }
          ],
          hint: "def is_valid_username(name):\n    return 0 < len(name) <= 20",
          explanation:
            "Every value that crosses a trust boundary — like user input reaching your backend — needs validating on arrival. A length check here is the simplest version of that rule."
        },
        {
          id: "softwareEngineering-backend-and-security-5",
          title: "Who's Allowed In",
          topics: ["Security", "CORS"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt: 'Configure FastAPI\'s CORSMiddleware so only requests from "https://pungacademy.com" are allowed, not every origin.',
          starter: "from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\n\napp = FastAPI()\n\n# add the CORS middleware below\n",
          checks: [
            { test: /app\.add_middleware\s*\(\s*CORSMiddleware/, message: "Call app.add_middleware(CORSMiddleware, ...)." },
            { test: /allow_origins\s*=\s*\[\s*["']https:\/\/pungacademy\.com["']\s*\]/, message: 'Set allow_origins=["https://pungacademy.com"].' }
          ],
          hint: 'app.add_middleware(\n    CORSMiddleware,\n    allow_origins=["https://pungacademy.com"]\n)',
          explanation:
            'allow_origins=["*"] would let any website\'s JavaScript call this API on a visitor\'s behalf — naming the real origin explicitly is what keeps that door closed to everyone else.'
        }
      ],
      "quality-and-architecture": [
        {
          id: "softwareEngineering-quality-and-architecture-1",
          title: "Test Level",
          topics: ["Testing"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt: "Write a test function test_add() that asserts add(2, 3) == 5. (Assume add is already defined.)",
          starter: "# Write test_add() below.\n",
          checks: [
            { test: /def\s+test_add\s*\(\s*\)\s*:/, message: "Define test_add()." },
            { test: /assert\s+add\s*\(\s*2\s*,\s*3\s*\)\s*==\s*5/, message: "Assert add(2, 3) == 5." }
          ],
          hint: "def test_add():\n    assert add(2, 3) == 5",
          explanation:
            "Testing one function in isolation with a plain assertion is the essence of a unit test — no database, no network, no other real components involved."
        },
        {
          id: "softwareEngineering-quality-and-architecture-2",
          title: "Loose Ends",
          topics: ["Architecture"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            "Module A currently imports and calls a concrete class from Module B directly everywhere — tight coupling. Write a function process(thing) that accepts any object as a parameter and calls thing.run(), instead of importing a concrete class.",
          starter: "# Define process(thing) below.\n",
          checks: [
            { test: /def\s+process\s*\(\s*thing\s*\)\s*:/, message: "Define process(thing) with one parameter." },
            { test: /thing\.run\s*\(\s*\)/, message: "Call thing.run() inside the function." }
          ],
          hint: "def process(thing):\n    return thing.run()",
          explanation:
            "Accepting any object with a .run() method — instead of importing one concrete class directly — loosens the coupling between the two modules, since process() no longer cares which exact class it's given."
        },
        {
          id: "softwareEngineering-quality-and-architecture-3",
          title: "Every Case Counts",
          topics: ["Testing", "Pytest"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            "Using @pytest.mark.parametrize, write one test function test_is_even that checks is_even(2) is True and is_even(3) is False, without writing two separate test functions.",
          starter: "import pytest\n\n# write the parametrized test below\n",
          checks: [
            { test: /@pytest\.mark\.parametrize\s*\(/, message: "Use @pytest.mark.parametrize(...)." },
            { test: /def\s+test_is_even\s*\(/, message: "Define test_is_even(...)." },
            { test: /assert\s+is_even\s*\(/, message: "Assert on is_even(...) inside the test." }
          ],
          hint:
            '@pytest.mark.parametrize("value, expected", [(2, True), (3, False)])\ndef test_is_even(value, expected):\n    assert is_even(value) == expected',
          explanation:
            "parametrize runs the same test body once per case, so adding a third case later means adding one tuple, not copy-pasting a whole new test function."
        },
        {
          id: "softwareEngineering-quality-and-architecture-4",
          title: "Together, Not Alone",
          topics: ["Testing", "Integration"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Python",
          prompt:
            'Write an integration test test_signup_flow() that calls create_user("a@b.com") and then asserts find_user("a@b.com") is not None — checking the two functions actually work together, not in isolation.',
          starter: "def test_signup_flow():\n    pass\n",
          checks: [
            { test: /def\s+test_signup_flow\s*\(\s*\)\s*:/, message: "Define test_signup_flow()." },
            { test: /create_user\s*\(\s*["']a@b\.com["']\s*\)/, message: 'Call create_user("a@b.com").' },
            { test: /assert\s+find_user\s*\(\s*["']a@b\.com["']\s*\)\s+is\s+not\s+None/, message: 'Assert find_user("a@b.com") is not None.' }
          ],
          hint: 'def test_signup_flow():\n    create_user("a@b.com")\n    assert find_user("a@b.com") is not None',
          explanation:
            "An integration test exercises the real interaction between components — here, that create_user actually persists something find_user can later see — rather than mocking one of them away."
        },
        {
          id: "softwareEngineering-quality-and-architecture-5",
          title: "Promise an Interface",
          topics: ["Architecture", "Abstraction"],
          difficulty: 3,
          minutes: 15,
          kind: "code",
          language: "Python",
          prompt: "Using Python's abc module, define an abstract base class Notifier with an abstract method send(self, message).",
          starter: "from abc import ABC, abstractmethod\n\n# define Notifier below\n",
          checks: [
            { test: /class\s+Notifier\s*\(\s*ABC\s*\)\s*:/, message: "Define class Notifier(ABC):" },
            { test: /@abstractmethod/, message: "Mark send() with @abstractmethod." },
            { test: /def\s+send\s*\(\s*self\s*,\s*message\s*\)\s*:/, message: "Define send(self, message)." }
          ],
          hint: "class Notifier(ABC):\n    @abstractmethod\n    def send(self, message):\n        pass",
          explanation:
            "An abstract base class defines a contract — any concrete EmailNotifier or SmsNotifier that inherits from Notifier is forced to implement send(), so calling code can rely on it existing no matter which one it's handed."
        }
      ],
      "shipping-and-teams": [
        {
          id: "softwareEngineering-shipping-and-teams-1",
          title: "Automate the Gate",
          topics: ["CI/CD", "DevOps"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "YAML",
          prompt: "Write a minimal GitHub Actions step line that runs pytest on every push.",
          starter: "# Write the run line for a pytest step.\n",
          checks: [{ test: /run\s*:\s*pytest/, message: "Add a line like `run: pytest`." }],
          hint: "run: pytest",
          explanation:
            "CI's core job is to automatically build and test every change as it's pushed — a single `run: pytest` step is the minimum that catches a broken test before it merges."
        },
        {
          id: "softwareEngineering-shipping-and-teams-2",
          title: "Second Pair of Eyes",
          topics: ["Teamwork", "Code Review"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt:
            "Every change, however small, should go through review before merging. Write a function needs_review(lines_changed) that returns True whenever lines_changed > 0, and False when it's 0.",
          starter: "def needs_review(lines_changed):\n    pass\n",
          checks: [
            { test: /def\s+needs_review\s*\(\s*lines_changed\s*\)\s*:/, message: "Define needs_review(lines_changed)." },
            { test: /return\s+lines_changed\s*>\s*0/, message: "Return lines_changed > 0." }
          ],
          hint: "def needs_review(lines_changed):\n    return lines_changed > 0",
          explanation:
            "Code review exists to catch issues before they ship and keep a consistent standard across the team — treating it as mandatory for any change is what keeps that standard consistent."
        },
        {
          id: "softwareEngineering-shipping-and-teams-3",
          title: "Package It Up",
          topics: ["Deployment", "Docker"],
          difficulty: 2,
          minutes: 12,
          kind: "code",
          language: "Dockerfile",
          prompt:
            "Write the two Dockerfile lines that use python:3.11-slim as the base image and run the app with `python app.py` as the container's command.",
          starter: "# write the two lines below\n",
          checks: [
            { test: /FROM\s+python:3\.11-slim/, message: "Start with FROM python:3.11-slim." },
            { test: /CMD\s*\[\s*["']python["']\s*,\s*["']app\.py["']\s*\]/, message: 'End with CMD ["python", "app.py"].' }
          ],
          hint: 'FROM python:3.11-slim\nCMD ["python", "app.py"]',
          explanation:
            "FROM fixes exactly which runtime the container ships with, and CMD is what actually runs when the container starts — together they're the minimum a Dockerfile needs to be runnable."
        },
        {
          id: "softwareEngineering-shipping-and-teams-4",
          title: "Same Code, Different Settings",
          topics: ["DevOps", "Config"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt:
            'Write code that reads a DATABASE_URL environment variable, defaulting to "sqlite:///local.db" when it is not set, storing it in a variable named database_url.',
          starter: "import os\n# read DATABASE_URL with a local default\n",
          checks: [
            {
              test: /database_url\s*=\s*os\.environ\.get\s*\(\s*["']DATABASE_URL["']\s*,\s*["']sqlite:\/\/\/local\.db["']\s*\)|database_url\s*=\s*os\.getenv\s*\(\s*["']DATABASE_URL["']\s*,\s*["']sqlite:\/\/\/local\.db["']\s*\)/,
              message: 'Read DATABASE_URL with a "sqlite:///local.db" default.'
            }
          ],
          hint: 'database_url = os.environ.get("DATABASE_URL", "sqlite:///local.db")',
          explanation:
            "The same code runs unmodified in every environment — locally it falls back to a local SQLite file, while in production the real DATABASE_URL takes over, because nothing about the source changed."
        },
        {
          id: "softwareEngineering-shipping-and-teams-5",
          title: "Say What Changed",
          topics: ["Teamwork", "Git"],
          difficulty: 1,
          minutes: 10,
          kind: "code",
          language: "Python",
          prompt: 'Write a function is_conventional_commit(message) that returns True when message starts with "fix:", "feat:", or "chore:", otherwise False.',
          starter: "def is_conventional_commit(message):\n    pass\n",
          checks: [
            { test: /def\s+is_conventional_commit\s*\(\s*message\s*\)\s*:/, message: "Define is_conventional_commit(message)." },
            { test: /message\.startswith\s*\(\s*\(/, message: "Use message.startswith((...)) with a tuple of prefixes." },
            { test: /["']fix:["']/, message: 'Include the "fix:" prefix.' },
            { test: /["']feat:["']/, message: 'Include the "feat:" prefix.' },
            { test: /["']chore:["']/, message: 'Include the "chore:" prefix.' }
          ],
          hint: 'def is_conventional_commit(message):\n    return message.startswith(("fix:", "feat:", "chore:"))',
          explanation:
            "A consistent commit-message prefix convention is what lets tools (and teammates) scan history and instantly tell a bug fix from a new feature — small, but exactly the kind of habit that keeps a team's history readable."
        }
      ]
    }
  };

  return { bank };
})();
