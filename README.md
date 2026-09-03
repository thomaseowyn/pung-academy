# Pung Academy

A static educational website that gives beginner programmers a structured
learning roadmap instead of a pile of unordered tutorials.

Built with **HTML5, CSS3 and vanilla JavaScript only** — no frameworks, no build
step, no backend. Open `index.html` in a browser and it works.

## Structure

```
pung-academy/
├── index.html            Homepage: hero, roadmap visual, why / how / philosophy, CTA
├── courses.html          Course roadmap: the vertical learning path
├── coming-soon.html      Placeholder for the two future career paths
├── login.html            Standalone login page
├── register.html         Standalone registration page
├── about.html            Team introduction + links to the four profiles
│
├── courses/
│   ├── introduction-to-programming.html   Course overview + chapter list
│   └── introduction/
│       └── lesson-1.html … lesson-10.html  One page per chapter
│
├── team/                 Individual profile pages (each with its own design)
│   ├── kevin.html        Dark "terminal" identity
│   ├── bryan.html        Warm editorial / magazine identity
│   ├── elvin.html        Soft pastel designer identity
│   └── thomas.html       Bold geometric identity
│
├── css/
│   ├── style.css         Shared tokens, navbar, footer, homepage
│   ├── courses.css       Roadmap + course overview
│   ├── lessons.css       Chapter pages, code editor, exercises
│   ├── auth.css          Login + registration
│   ├── about.css         About Us page
│   └── team/             One standalone stylesheet per profile
│       ├── kevin.css  bryan.css  elvin.css  thomas.css
│
├── js/
│   ├── auth.js           localStorage accounts + login/register form handling
│   ├── navigation.js     Signed-in / signed-out header state
│   ├── courses.js        Course data, progress engine, roadmap + overview rendering
│   ├── lessons.js        Chapter runtime: access guard, exercises, completion
│   └── main.js           Copyright year, image fallbacks, "coming soon" links
│
└── assets/
    ├── icons/logo.svg
    └── images/           Placeholder portraits (kevin/bryan/elvin/thomas .svg)
```

## The course system

**Roadmap** (`courses.html`) — a vertical path: start node → Introduction to
Programming → a locked gate → a fork into Web Development and Artificial
Intelligence. Both branches stay locked until the first course is finished.

**Progression** — Chapter 1 is open from the start; every other chapter needs
the one before it completed. A chapter counts as complete only after its
exercise is passed, never just by opening the page. The rule is enforced in
JavaScript, so typing `courses/introduction/lesson-8.html` directly shows a
locked screen rather than the content.

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
`chapters[N].videoId` in `js/courses.js` and that chapter's player appears; no
other change is needed.

**Editing course content** — chapter titles, summaries, topics, projects and
every exercise (prompt, starter code, checks, hint, solution) live in the
`chapters` object at the top of `js/courses.js`. The chapter pages hold only the
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

**Text** — each profile's biography is fictional placeholder copy. Edit the
paragraphs directly in `team/<name>.html`, and update the short blurbs and role
labels in the team cards in `about.html`.

**Photos** — the portraits are generated SVG placeholders in `assets/images/`.
Two ways to replace them:

1. *Simplest* — save your photo as `assets/images/kevin.svg` (etc.), overwriting
   the placeholder. Nothing else needs to change.
2. *Or* drop in `assets/images/kevin.jpg` and update that page's `src` to point
   at it. Every portrait `<img>` also carries a `data-fallback` attribute
   pointing at the bundled placeholder, so if your file is ever missing,
   `js/main.js` swaps the placeholder back in instead of showing a broken image.

The images to change:

| Page | Image |
| --- | --- |
| `about.html` | `assets/images/{kevin,bryan,elvin,thomas}.svg` (four cards) |
| `team/kevin.html` | `assets/images/kevin.svg` |
| `team/bryan.html` | `assets/images/bryan.svg` |
| `team/elvin.html` | `assets/images/elvin.svg` |
| `team/thomas.html` | `assets/images/thomas.svg` |

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

Just open `index.html`. If you would rather serve it over HTTP:

```bash
python -m http.server 5500
```
