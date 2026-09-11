# AGENT.md

Guidance for AI coding agents working in this repository.

## What this project is

A **static personal portfolio website** for Alok Maurya (Software Engineer / Full Stack Developer).
Live at `https://founder.sonint.in/` · Repo: `https://github.com/alokmaurya22/devfolio-light-BW`

There is **no build system, no package manager, no tests, no linter, and no CI**.
It is plain HTML + CSS + vendored JavaScript served as files. Everything you edit ships as-is.

Stack: Bootstrap 4.4.1 markup, jQuery 3.4.1, Owl Carousel, Typed.js, AOS, vanilla-tilt, kursor,
Iconify (web component) and lineicons. Fonts come from Google Fonts / Fontshare; everything else is
local in `js/`.

## Repository layout

```
index.html        the site (dynamic sections rendered by data/main.js)
404.html          error page, self-contained
robots.txt        allows all, points at the sitemap
sitemap.xml       single URL
css/              css-style.css is the real stylesheet; owl, aos + kursor CSS alongside
data/             content data (plain globals) + main.js renderers
images/           content images (patterns/ holds the self-hosted CSS textures)
favicons/         favicon-16/32.png + apple-touch-icon.png, generated from favicon.jpg
js/               vendored libraries + 3 site scripts + iconify-bundle.js
bugs.md           bug tracker: 51/51 fixed
```

## The data layer (most content edits go here)

`data/*.js` are **not modules** — each declares a top-level `const` global. Note that a top-level
`const` creates a global *binding* but **not** a property on `window`, so `window.projectsData` is
`undefined` while `projectsData` works. `data/main.js` probes them by identifier for that reason.

| Data file | Global | Renderer in `data/main.js` | Target id |
| --- | --- | --- | --- |
| `navigationData.js` | `navigationData` | `renderNavigation()` | `#navbar-links`, `#navbar-brand-text`, `#navbar-cta` |
| `socialData.js` | `socialData` | `renderAboutSection()`, `renderFooterSocials()` | `#about-name`, `#about-title`, `#about-description`, `#about-social`, `#footer-socials`, `#footer-contact` |
| `educationData.js` | `educationData` | `renderEducation()` | `#education-list` |
| `experienceData.js` | `experienceData` | `renderExperience()` | `#experience-list` |
| `skillData.js` | `skillData` | `renderSkills()` | `#skills-left`, `#skills-right` |
| `projectsData.js` | `projectsData` | `renderProjects()`, `openProjectModal()` | `#projects-carousel`, `#projectModal` |
| `certificationData.js` | `certificationData` | `renderCertifications()` | `#certification-carousel` |
| `interestData.js` | `interestData` | `renderInterests()` | `#interest-list` |
| `extraCurricularData.js` | `extraCurricularData` | `renderExtraCurricular()` | `#extracurricular-carousel` |

**Rules of thumb**

- Changing text, links, logos, percentages, or list entries → edit the matching `data/*.js` only.
- Renderers address containers by **id**. If you rename or move a container in `index.html`, update
  the matching `getElementById` in `data/main.js` — otherwise that section silently renders nothing.
- All interpolated values go through `escapeHTML()`. The one deliberate exception is
  `extraCurricularData.achievement`, which may contain `<br>`.
- Image `width`/`height` in the data files reserve layout space (CLS). If you re-export an image at a
  new size, update those numbers too.
- Adding a new data file → add a `<script defer src="data/…">` tag before `data/main.js` **and** add
  the global to `DATA_SOURCES` in `data/main.js`.
- **After editing any `data/*.js`, re-run `python tools/prerender.py`.** The rendered markup of every
  section is baked into `index.html` so crawlers and link-preview bots see real content; that copy
  goes stale otherwise. The data files stay the source of truth - the baked HTML is a cache, and
  `data/main.js` overwrites it at runtime either way.

## Render path (do not reorder casually)

1. `<head>`: inlined critical CSS, then **render-blocking** `css/assets-owl.carousel.min.css`,
   `css/css-style.css` and `aos.css`. Fonts and `css-kursur.css` load async.
   **Keep the layout-critical CSS render-blocking.** When it was async, Owl and AOS measured an
   unstyled page: slides came out 93 px wide and most cards never became visible (bugs.md B45).
2. Every `<script>` is `defer`-ed, so they all run before `DOMContentLoaded`.
3. On `DOMContentLoaded`, the inline script calls `initializeAllData()`.
4. `initializeAllData()` renders all ten sections, then `initCarousels()` → `initTyped()` →
   `animateSkillBars()` → `initAOS()`. AOS **must** be initialized after the markup exists, or the
   injected elements never get `aos-animate` and stay at `opacity: 0`.
5. On `load`, Owl and AOS refresh once so late fonts/images can't leave stale measurements.
6. Tilt and kursor initialize on `load` + idle, and only when
   `(hover: hover) and (pointer: fine)` and motion is not reduced.

## Tooling (tools/)

No build step runs automatically. These are one-shot scripts, each safe to re-run:

| Script | When to run |
| --- | --- |
| `prerender.py` | after editing `data/*.js` - bakes the rendered sections into index.html |
| `build-icon-bundle.py` | after adding or renaming an Iconify icon |
| `build-fonts.py` | after changing which fonts or weights the CSS uses |
| `purge-css.py` | after using a Bootstrap class the page did not use before |
| `compare-shots.py` | before/after any risky CSS change - compares layout geometry |

All of them need `python -m http.server 5500` running, except build-fonts and
build-icon-bundle which just need network access.

## Site scripts

- `js/2967-js-main.js` — loader dismissal, smooth scrolling, back-to-top / scroll-hint and the
  pointer follower. It also used to block right-click and the devtools shortcuts; that was
  removed on request — don't add it back.
- `js/2653-mail-contact.js` — contact form. Formspree first (with `Accept: application/json`, which
  is required or every message is sent twice), Web3Forms as fallback, `_gotcha` honeypot.
- `js/iconify-bundle.js` — **generated**, not hand-written. Registers the 38 icons this site uses so
  `<iconify-icon>` resolves them locally. Without it the page makes ~44 requests to
  api.iconify.design on every load. **Adding a new icon means regenerating this bundle**: fetch
  `https://api.iconify.design/<prefix>.json?icons=<names>` for every collection used across
  `index.html` + `data/*.js` (fields `icon:`, `bottomIcon:`, `icon="`) and rebuild the array.
- `data/main.js` — all rendering and plugin init.

Everything else in `js/` is vendored — do not hand-edit.

## Contact form

Formspree + Web3Forms, both public client-side keys by design. Not secrets, but don't rotate them
without the owner.

## Assets

- Prefix convention: `pro-*` projects, `exp-*` employers, `edu-*` institutions, `certi-*`
  certificates, `img-*` profile/signature art. Prefer `.webp`.
- **Everything is self-hosted on purpose.** Background textures live in `images/patterns/`, AOS CSS in
  `css/aos.css`, icons in `js/iconify-bundle.js`. Do not reintroduce assets from giphy, behance,
  unpkg or transparenttextures - that is exactly what B47-B51 were.
- New `<img>` tags need explicit `width`/`height` plus `loading="lazy" decoding="async"`
  (`fetchpriority="high"` / `loading="eager"` only for the hero image).
- **Encoding rule:** photos/screenshots → lossy WebP q85; logos and line art → lossless WebP (or
  lossy if it measures smaller); export at **2–3× the display size, never more**. Every asset was
  re-encoded on this basis — `images/` + `favicons/` is 478 KB, down from 2,045 KB.
- If you re-export an image, update its `width`/`height` in the data files (and the modal placeholder
  in `index.html`) to the new pixel size — those values reserve layout space.

## Running and verifying locally

No install step. Serve over HTTP (some things misbehave on `file://`):

```bash
python -m http.server 5500     # http://localhost:5500/index.html
```

There is nothing to lint or build, but two checks are worth running after any change:

```bash
node --check data/main.js      # and the other custom JS

# headless render check (Chrome is installed on this machine)
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
  --virtual-time-budget=12000 --dump-dom http://localhost:5500/index.html > out.html
```

Then confirm the rendered DOM contains real content (`Dr. RML Avadh`, `Manya Fintech`,
`data-target-width`, `project-card`, `owl-stage-outer`) — an empty section means a renderer's target
id no longer matches.

**Headless caveat:** `--window-size=390,…` does *not* give you a 390 px viewport on Windows (Chrome
enforces a ~500 px minimum and the screenshot is just a crop, which looks like text overflow). To
test mobile layout, load the page in a 390 px-wide `<iframe>` and measure from the parent, or use a
real browser's device toolbar.

## Working conventions

- Match the surrounding style: 4-space indent in HTML, 2-space in `data/*.js`, jQuery-style DOM code,
  `// PERF:` comments for anything that exists for load-performance reasons.
- Keep content (data) and presentation (HTML/CSS) separated — don't hardcode new content into
  `index.html`. The exceptions are the small static fallbacks (nav links, name, title) that exist so
  the page is not blank before JS runs; if you change those in the data files, update the fallback.
- `css/css-style.css` is ~220 KB of accumulated Bootstrap + template CSS with heavy selector chains
  and many `!important`s. Prefer adding a small, clearly-commented block at the end over rewriting
  existing rules.
- Do not commit or push unless asked.
