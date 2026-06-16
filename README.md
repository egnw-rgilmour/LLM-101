# AI & LLM Systems 101 — Interactive Course

A beginner-friendly, **vendor-neutral** internal course that teaches the
concepts and technology behind modern AI and Large Language Model (LLM) systems.
It is built as a small static website using **only vanilla HTML, CSS, and
JavaScript** — no frameworks, no build tools, no server.

## Who it's for

Internal IT staff of every skill level — help desk, sysadmins, network/security,
developers, and IT managers. The goal is enough conceptual grounding to
confidently understand, evaluate, and discuss AI tools with colleagues, vendors,
and end users. It is **not** meant to turn anyone into an ML researcher.

## How to use it

**Download or clone the repository and open `index.html` in any modern
browser — no installation or server required.** You can literally double-click
`index.html`.

- Work through the 12 modules in order (~10–15 minutes each).
- Each module ends with a short quiz; score 75%+ to mark it complete.
- The home page shows an overall progress bar, per-module completion, and a
  "reset progress" button.
- Use the searchable **Glossary** and try the interactive demos in Modules 4, 6,
  and 7.
- Toggle light/dark mode from the top navigation (remembered per browser).

Everything runs locally in your browser. The course makes **no network
requests** and sends no data anywhere; it uses `localStorage` only to remember
your progress and theme on your device.

## Modules

1. What is AI?
2. Machine Learning vs. Deep Learning
3. What is an LLM?
4. Tokens & Tokenization *(interactive tokenizer demo)*
5. How LLMs are Trained
6. Prompting & Context *(interactive temperature demo)*
7. Embeddings & Vector Search *(interactive similarity demo)*
8. Retrieval-Augmented Generation (RAG)
9. Agents & Tool Use
10. Limitations & Risks
11. Security, Privacy & Governance — **the most important module for IT**
12. The AI Tool Landscape

## Repository structure

```
/
├── index.html              # Course home: intro, module list, overall progress
├── glossary.html           # Searchable glossary
├── about.html              # How to use the course + disclaimer
├── modules/                # 01–12, one HTML page per module
├── css/
│   └── styles.css          # Single shared stylesheet (theming via CSS variables)
├── js/
│   ├── course.js           # Global namespace, module list (single source of truth), nav
│   ├── progress.js         # localStorage progress + completion tracking
│   ├── quiz.js             # Reusable quiz engine + embedded question bank
│   ├── glossary.js         # Glossary data + search/filter
│   └── demos.js            # Interactive demo widgets
├── assets/                 # Local assets (diagrams are inline SVG in the HTML)
└── README.md
```

## Contributor notes — please read before editing

This site is intentionally **dependency-free and offline-first** so it runs by
opening files directly (`file://`). A few rules keep it that way — breaking them
will break the course:

- **Vanilla only.** No frameworks or libraries (React, Vue, Tailwind, jQuery,
  etc.), and no build tooling (npm/Node, bundlers, transpilers, CSS
  preprocessors). There is no `package.json` by design.
- **No ES modules.** Do not use `import`/`export` or
  `<script type="module">` — they fail under `file://`. Load plain
  `<script src="...">` files in dependency order and share code through the
  single global `window.Course` namespace.
- **No `fetch()` / `XMLHttpRequest`** for local files (blocked under `file://`).
  Embed any data (quiz questions, glossary terms) directly as JavaScript
  objects/arrays in the `.js` files.
- **Fully offline.** No CDN links, no web fonts, no external images. Use the
  system font stack and author diagrams as inline SVG or CSS.
- **Storage is optional.** Always feature-detect `localStorage` and degrade
  gracefully (some browsers restrict storage on `file://`). The provided
  `Course.storage` helper already does this — use it instead of touching
  `localStorage` directly.

Script load order on every page is: `course.js` → `progress.js` →
`quiz.js` / `glossary.js` / `demos.js`.

## How to add a module

The module list is defined **once** in `js/course.js` (the array
`Course.modules`). Navigation, prev/next links, the home page cards, and progress
tracking are all derived from it.

1. **Add an entry** to `Course.modules` in `js/course.js` with a `num`, `file`,
   `title`, `minutes`, and `summary`.
2. **Create the page** at `modules/<file>` (copy an existing module as a
   template). In its `<head>`, set:
   ```html
   <script>
     window.COURSE_BASE = "../";
     window.COURSE_PAGE = "module";
     window.COURSE_MODULE = "<num>"; // e.g. "13"
   </script>
   ```
   Include a `<div id="quiz"></div>` and a `<nav id="module-nav"></nav>`, and load
   the scripts in order (see any existing module).
3. **Add quiz questions** for the new `num` to `Quiz.data` in `js/quiz.js`
   (4–6 multiple-choice questions, each with `q`, `options`, `answer`, and
   `explain`).
4. Optionally add any new terms to `Glossary.terms` in `js/glossary.js`.

That's it — the home page, navigation, and progress bar update automatically
from the module list.

## Disclaimer

This material is for general education only. It is vendor-neutral and avoids
recommending specific commercial products. AI capabilities and best practices
change quickly; treat the content as a conceptual foundation, not formal policy,
legal, security, or compliance advice. Always follow your organization's own
policies and consult the appropriate teams before adopting or deploying AI tools.
