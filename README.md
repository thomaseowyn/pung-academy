# Pung Academy

A static educational website that gives beginner programmers a structured
learning roadmap instead of a pile of unordered tutorials.

Built with **HTML5, CSS3 and vanilla JavaScript only** — no frameworks, no build
step, no backend. Double-click `index.html` and it works.

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
│   │   ├── introduction-to-programming.html
│   │   └── introduction/lesson-1.html … lesson-10.html
│   └── team/kevin.html  bryan.html  elvin.html  thomas.html
│
├── css/
│   ├── base/               reset · variables (tokens) · global
│   ├── components/         brand, navbar, footer, buttons, cards, forms,
│   │                       progress, course-node, chapter-row, callouts,
│   │                       code-block, code-editor, feedback, video, cta
│   └── pages/              landing, auth, about, course-tree,
│                           course-overview, lesson, coming-soon, team/*
│
├── js/
│   ├── config/             courseData.js — the whole course, as data
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

**Roadmap** (`pages/course-tree.html`) — a vertical path: start node → Introduction to
Programming → a locked gate → a fork into Web Development and Artificial
Intelligence. Both branches stay locked until the first course is finished.

**Progression** — Chapter 1 is open from the start; every other chapter needs
the one before it completed. A chapter counts as complete only after its
exercise is passed, never just by opening the page. The rule is enforced in
JavaScript, so typing `pages/courses/introduction/lesson-8.html` directly shows
a locked screen rather than the content.

**Exercises** — chapters 1–2 use a concept-check question; chapters 3–10 use a
built-in code editor (plain textarea plus a line-number gutter, no external
library). Submissions are checked against patterns for the concepts each task
requires. Nothing is executed — Python cannot run in a static page, and the
editor says so rather than pretending otherwise. Checks tolerate extra spaces,
tabs, curly quotes and either quote style.

**Progress storage** — `pungAcademyProgress_<email>` for a signed-in user, or
`pungAcademyProgress_guest` when nobody is signed in, so two local accounts do
not share a position:

```json
{
  "introductionToProgramming": {
    "completedChapters": [1, 2, 3],
    "exercisesCompleted": { "1": true, "2": true, "3": true },
    "updatedAt": "2026-09-03T15:31:20.764Z"
  }
}
```

**Adding chapter videos** — every chapter shows a marked placeholder instead of
a player, because no YouTube ids have been verified. Put an id into
`chapters[N].videoId` in `js/config/courseData.js` and that chapter's player
appears; no other change is needed.

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
- **Only Introduction to Programming exists.** Web Development and Artificial
  Intelligence are shown on the roadmap and link to `coming-soon.html`.
- **Exercises are pattern-checked, not executed.** A submission that contains
  the right constructs passes even if the program would not actually run.
- Google Fonts are loaded from a CDN, so the pages fall back to system fonts
  when offline.

## Running it

Double-click `index.html`. That is the whole thing — no server, no build.

If you would rather serve it over HTTP (closer to how GitHub Pages behaves):

```bash
python -m http.server 5500
```
