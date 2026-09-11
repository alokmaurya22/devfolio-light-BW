# CLAUDE.md

This project's guidance lives in [AGENT.md](AGENT.md) — read it before making changes.

@AGENT.md

## Quick orientation

- Static portfolio site: **no build, no package manager, no tests, no lint**. Files ship as-is.
  Live at `https://founder.sonint.in/`.
- [index.html](index.html) is the site. Content edits belong in [data/](data/) (plain global
  `const`s), rendered by [data/main.js](data/main.js).
- Renderers address containers by **id** (`#education-list`, `#skills-left`, `#projects-carousel`, …).
  Rename a container in the HTML and that section silently renders empty — update the matching
  `getElementById`.
- Two ordering rules that have already caused bugs:
  1. **Layout-critical CSS must stay render-blocking** — Owl and AOS measure the DOM, and an async
     stylesheet makes them measure an unstyled page.
  2. **`AOS.init()` must run after the markup is rendered** — otherwise injected elements never get
     `aos-animate` and stay invisible.
- A top-level `const` in `data/*.js` is *not* a `window` property. Probe those globals by identifier
  (see `DATA_SOURCES` in `data/main.js`), never via `window[name]`.

## Verifying a change

```bash
python -m http.server 5500     # open http://localhost:5500/index.html
node --check data/main.js
```

For anything touching rendering, do a headless render check and assert the DOM actually contains
content — see AGENT.md → *Running and verifying locally*, including the caveat that headless
`--window-size` does not give a true mobile viewport on Windows.

## State of the codebase

[bugs.md](bugs.md) tracks the full review: **51 of 51 bugs fixed** (44 original + 7 found while
fixing). The asset pass is done too. Measured after the work: FCP/LCP ~200 ms, CLS 0.03, 52 requests,
of which only 5 are third-party.

If you re-export any image: photos → lossy WebP q85, logos/line art → lossless WebP, at 2–3× display
size; then update that image's `width`/`height` in the data files to the new pixel size.
