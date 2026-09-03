# Pung Academy

A static educational website that gives beginner programmers a structured
learning roadmap instead of a pile of unordered tutorials.

Built with **HTML5, CSS3 and vanilla JavaScript only** — no frameworks, no build
step, no backend. Open `index.html` in a browser and it works.

## Structure

```
pung-academy/
├── index.html            Homepage: hero, roadmap visual, why / how / philosophy, CTA
├── login.html            Standalone login page
├── register.html         Standalone registration page
├── about.html            Team introduction + links to the four profiles
│
├── team/                 Individual profile pages (each with its own design)
│   ├── kevin.html        Dark "terminal" identity
│   ├── bryan.html        Warm editorial / magazine identity
│   ├── elvin.html        Soft pastel designer identity
│   └── thomas.html       Bold geometric identity
│
├── css/
│   ├── style.css         Shared tokens, navbar, footer, homepage
│   ├── auth.css          Login + registration
│   ├── about.css         About Us page
│   └── team/             One standalone stylesheet per profile
│       ├── kevin.css  bryan.css  elvin.css  thomas.css
│
├── js/
│   ├── auth.js           localStorage accounts + login/register form handling
│   ├── navigation.js     Signed-in / signed-out header state
│   └── main.js           Copyright year, image fallbacks, "coming soon" links
│
└── assets/
    ├── icons/logo.svg
    └── images/           Placeholder portraits (kevin/bryan/elvin/thomas .svg)
```

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
- **Lessons and Resources are not built.** Both navigation items are signposted
  with a "Soon" badge and explain themselves when clicked.
- Google Fonts are loaded from a CDN, so the pages fall back to system fonts
  when offline.

## Running it

Just open `index.html`. If you would rather serve it over HTTP:

```bash
python -m http.server 5500
```
