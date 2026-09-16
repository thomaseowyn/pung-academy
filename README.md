# Pung Academy

A static educational website that gives beginner programmers a structured
learning roadmap instead of a pile of unordered tutorials.

Built with **HTML5, CSS3 and vanilla JavaScript only** — no frameworks, no build
step, no backend. Double-click `index.html` and it works.

Three courses, 38 chapters, 192 graded exercises and challenges.

## Structure

```
pung-academy/
├── index.html              Landing page (entry point)
│
├── pages/                  One HTML file per screen
│   ├── login.html  signup.html  about-us.html
│   ├── course-tree.html    The roadmap
│   ├── coming-soon.html
│   ├── courses/
│   │   ├── introduction-to-programming.html   overview · 16 chapters
│   │   ├── software-engineering.html          overview · 15 chapters
│   │   ├── ai-overview.html                   overview ·  7 chapters
│   │   ├── introduction/lesson-1.html … lesson-16.html
│   │   ├── software-engineering/lesson-1.html … lesson-15.html
│   │   └── ai/lesson-1.html … lesson-7.html
│   └── team/kevin.html  bryan.html  elvin.html  thomas.html
│
├── css/
│   ├── main.css            Master stylesheet — every page links this
│   ├── base/               reset · variables (tokens) · global
│   ├── components/         brand, navbar, footer, buttons, cards, forms,
│   │                       progress, course-node, chapter-row, callouts,
│   │                       code-block, code-editor, feedback, video, cta
│   └── pages/              landing, auth, about, course-tree,
│                           course-overview, lesson, coming-soon, team/*
│
├── js/
│   ├── config/             courseData.js — all three courses, as data
│   ├── services/           StorageService · ValidationService · PathService
│   ├── models/             UserModel · CourseProgressModel      (state, no DOM)
│   ├── views/              SiteChrome · CourseTree · CourseOverview ·
│   │                       Lesson · Auth                        (DOM, no state)
│   ├── controllers/        Auth · Course · Lesson               (the glue)
│   └── pages/              One entry module per page
│
├── tools/
│   └── check-paths.py      Verifies every link and import resolves
│
└── assets/
    ├── icons/  images/
```

## How the code is organised

**One namespace, `Pung`.** Each file wraps itself in an IIFE and registers on
`window.Pung`, e.g. `Pung.CourseProgressModel`. Nothing else is global, so no
two files can collide.

**One master stylesheet.** Every page links exactly two CSS files:
`css/main.css` (which `@import`s base + all components) and its own
`css/pages/*.css`. The four team profile pages are the deliberate exception —
each is a standalone personal design with its own stylesheet only.

**Plain `<script>` tags, in dependency order.** Not ES modules — those cannot
load from `file://`, and this project has to work when someone double-clicks
`index.html`. The order is: services → config → models → views → controllers →
`pages/_shared.js` → the page's own entry. Every page lists the same core set
plus its own entry; a new file goes in after whatever it depends on.

**Layers, and the rule for each:**

| Layer | Rule |
| --- | --- |
| `config/` | Static data only. No logic. |
| `services/` | Technical utilities — storage, validation, paths. No app concepts. |
| `models/` | State and rules. Never touches the DOM. |
| `views/` | Renders DOM. Holds no state of its own. |
| `controllers/` | Listens for events, asks a model, tells a view. |
| `pages/` | One tiny entry file per page that wires the above together. |

Adding a feature means adding one file per layer it needs — not all six.

**The navbar and footer are rendered once**, by `views/SiteChromeView.js`, into
two placeholders (`<header data-site-header>` / `<footer data-site-footer>`).
Changing the navigation is one edit, not twenty-one.

**Paths are always relative, never root-absolute.** GitHub Pages serves this
project from `/pung-academy/`, so `/js/…` would work locally and 404 in
production — and root-absolute paths break under `file://` entirely. Pages
declare their depth with `<html data-root="../..">` and
`services/PathService.js` turns that into working links.

### Before you push

```bash
python tools/check-paths.py
```

There is no build step, so a mistyped path fails silently at runtime on one
page. This walks every HTML, JS and CSS file and confirms each local
reference resolves — including every `<script>` tag. It also flags
root-absolute paths.


## The course system

**The three courses** — all defined in `js/config/courseData.js`, all built and
playable:

| Course | id | Chapters | Shape |
| --- | --- | --- | --- |
| Introduction to Programming | `introductionToProgramming` | 16 | The trunk. Python from first principles to an OOP capstone. |
| Software Engineering | `softwareEngineering` | 15 | Career branch. Version control, design, databases, APIs, security, testing, CI/CD. |
| Artificial Intelligence | `ai` | 7 | Career branch. LLM APIs, prompt architecture, tool calling, RAG, agents, FastAPI deployment. |

Each course groups its chapters into named **units** so the overview page shows
the shape of the course rather than a flat wall of identical rows.

**Roadmap** (`pages/course-tree.html`) — a vertical path: start node →
Introduction to Programming → a gate → a fork into Software Engineering and
Artificial Intelligence. Both branch cards read "Locked" and offer no link until
Introduction to Programming is finished, at which point the gate icon flips and
each card gets a live "Start the course" button.

**Progression** — Chapter 1 of a course is open from the start; every other
chapter needs the one before it completed. A chapter counts as complete only
after its exercises are passed, never just by opening the page. The rule is
enforced in JavaScript, not merely displayed, so typing
`pages/courses/introduction/lesson-8.html` directly shows a locked screen rather
than the content — and `completeChapter()` refuses a chapter whose exercises are
unpassed, so it cannot be bypassed from the console either.

This rule runs **per course**: each course keeps its own independent record, and
`CourseProgressModel.forCourse(id)` scopes every call to one of them.

**Exercises** — every chapter carries a set of exercises plus one final
`challenge`, and the chapter only completes once all of them are passed. That is
154 exercises and 38 challenges, 192 graded items in total, in four kinds:

| Kind | What it is | Count |
| --- | --- | --- |
| `choice` | Multiple choice concept check | 87 |
| `code` | Written in the built-in editor | 52 |
| `text` | Short typed answer (string or regex matched) | 37 |
| `order` | Put the steps into the right sequence | 16 |

The code editor is a plain textarea plus a synced line-number gutter, with Tab
bound to insert four spaces — no external library, since there is no build step
to bundle one. Submissions are matched against a list of `checks`, one regex per
concept the task requires (183 of them in total); the **first** failing check is
the one reported, and it carries its own message, so the learner is told which
concept is missing rather than just "wrong". Before matching, submissions are
normalised — curly quotes, tabs, line endings and trailing whitespace — and
comments and blank lines are stripped so an untouched starter template can never
pass.

> Nothing is executed. Python cannot run in a static page, so the editor is
> labelled "Checked for concepts — not executed" rather than pretending
> otherwise. A submission containing the right constructs passes even if the
> program would not actually run.

Chapter 16 of Introduction to Programming is the final project: an
object-oriented rebuild of the task manager. Completing it triggers the
course-complete screen and opens the two career branches on the roadmap.

**Progress storage** — `pungAcademyProgress_<email>` for a signed-in user, or
`pungAcademyProgress_guest` when nobody is signed in, so two local accounts do
not share a position. Each course is a separate key inside the record:

```json
{
  "introductionToProgramming": {
    "completedChapters": [1, 2, 3],
    "exercisesCompleted": { "1": true, "2": true, "3": true },
    "exerciseProgress": {
      "4": { "passed": [true, false], "challengePassed": false }
    },
    "updatedAt": "2026-09-03T15:31:20.764Z"
  },
  "ai": { "completedChapters": [1], "exercisesCompleted": { "1": true } }
}
```

`exercisesCompleted` is the flag chapter completion reads; `exerciseProgress`
records which individual exercises within a chapter are done, so a
half-finished chapter resumes correctly after a reload.

**Chapter videos** — only Introduction to Programming has them. Eleven of its
sixteen chapters carry a verified YouTube id; chapters 1, 5, 8, 10 and 16 do
not — Chapter 16 by design, since the curriculum does not pair a video with the
final project, and the others are second-half chapters created by splitting a
dense chapter in two. Software Engineering and Artificial Intelligence have no
videos at all and are written-lesson only.

Any chapter without an id shows a marked placeholder instead of a dead player.
Put an id into `chapters[N].videoId` in `js/config/courseData.js` and that
chapter's player appears; no other change is needed.

**Editing course content** — chapter titles, summaries, topics, projects and
every exercise (prompt, starter code, checks, hint, solution) live in
`js/config/courseData.js`. The chapter pages hold only the
written tutorial text.


## Local accounts

There is no server. Accounts live in the browser's `localStorage`:

- `pungAcademyUsers` — array of `{ name, email, password, createdAt }`
- `pungAcademyCurrentUser` — the active session, `{ name, email, loggedInAt }`

Registering validates required fields, email format, an 8-character minimum,
password confirmation and duplicate emails, then sends you to the login page.
Logging in checks the stored credentials, writes the session, and returns you to
the homepage, where the header swaps Login/Sign Up for your name and a Log out
button.

**The whole Lessons section requires a session.** The roadmap, the course
overviews and every chapter page check for a signed-in user first and redirect
to the login page if there is none — before any chapter-lock check runs, so a
signed-out visitor is asked to log in rather than told a chapter is locked.

> **This is not secure authentication.** Passwords are stored in plain text in
> the browser and anyone with access to the device can read them. It exists so
> the interface can be demonstrated without a backend — do not use a real
> password.

To wipe test accounts, run this in the browser console:

```js
localStorage.removeItem("pungAcademyUsers"); localStorage.removeItem("pungAcademyCurrentUser");
```

## Replacing the placeholder team content

**Text** — Kevin, Bryan and Elvin still have placeholder biographies; Thomas's
is real. Edit the paragraphs in `pages/team/<name>.html`, and the short blurbs
and role labels in `pages/about-us.html`.

**Photos** — Kevin, Bryan and Elvin use generated SVG placeholders in
`assets/images/`; Thomas uses a real `thomas.jpg`. Two ways to replace one:

1. *Simplest* — save your photo as `assets/images/kevin.svg` (etc.), overwriting
   the placeholder. Nothing else needs to change.
2. *Or* drop in `assets/images/kevin.jpg` and update that page's `src` to point
   at it. Every portrait `<img>` also carries a `data-fallback` attribute
   pointing at the bundled placeholder, so if your file is ever missing,
   `js/pages/_shared.js` swaps the placeholder back in rather than showing a
   broken image.

The images to change:

| Page | Image |
| --- | --- |
| `pages/about-us.html` | all four, in the team cards |
| `pages/team/kevin.html` | `assets/images/kevin.svg` |
| `pages/team/bryan.html` | `assets/images/bryan.svg` |
| `pages/team/elvin.html` | `assets/images/elvin.svg` |
| `pages/team/thomas.html` | `assets/images/thomas.jpg` (real photo) |

Square images look best — the About cards and three of the four profiles crop to
a 1:1 frame.

## Known limitations

- **Desktop only.** There is no mobile or tablet layout: the pages hold a fixed
  desktop width and narrow windows scroll horizontally.
- **No backend.** Accounts exist only in the browser that created them; clearing
  site data deletes them, and they do not follow you to another device.
- **Passwords are stored as plain text** (see the warning above).
- **Resources is not built.** The navigation item is signposted with a "Soon"
  badge and explains itself when clicked.
- **Exercises are pattern-checked, not executed.** A submission that contains
  the right constructs passes even if the program would not actually run.
- **The branch gate is roadmap-only.** The roadmap hides the link to Software
  Engineering and Artificial Intelligence until Introduction to Programming is
  finished, but typing a branch chapter's URL directly still opens it —
  unlike chapter locks *within* a course, which are enforced. Each course's
  progression is independent of the others.
- **Only Introduction to Programming has videos.** The other two courses are
  written-lesson only.
- Google Fonts are loaded from a CDN, so the pages fall back to system fonts
  when offline.

## Running it

Double-click `index.html`. That is the whole thing — no server, no build.

If you would rather serve it over HTTP (closer to how GitHub Pages behaves):

```bash
python -m http.server 5500
```
