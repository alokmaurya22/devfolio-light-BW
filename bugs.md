# bugs.md

Bug list for **devfolio-light-BW**, from a full read of the codebase at commit `eabe1c0`.

**Status: 51 of 51 fixed.** The 44 original bugs plus 7 found during the work (B45-B51).
The asset pass (B16, B17, B18) is complete.

Verification used on every change: `node --check` on all custom JS, a static reference checker
(local `src`/`href`, data asset paths, renderer ids, duplicate ids, leftovers), and headless Chrome
renders at desktop + mobile widths with DOM assertions and screenshots.

| # | Severity | Summary | Status |
| --- | --- | --- | --- |
| B1 | 🔴 | Hero image 404s on mobile/tablet | ✅ fixed |
| B2 | 🔴 | Font Awesome never loaded — 3 icon sets invisible | ✅ fixed |
| B3 | 🔴 | `Typed` throws every load; tagline animation dead | ✅ fixed |
| B4 | 🔴 | LocomotiveScroll throws, then double-initializes | ✅ fixed |
| B5 | 🔴 | Particle background dead (2 libraries, 0 output) | ✅ fixed |
| B6 | 🔴 | Contact form: button never re-enabled after success | ✅ fixed |
| B7 | 🔴 | Contact form: second message invisible | ✅ fixed |
| B8 | 🔴 | Contact form: likely sends every message twice | ✅ fixed |
| B9 | 🔴 | Two education links point to a nonexistent page | ✅ fixed |
| B10 | 🔴 | Race: sections could stay permanently invisible (AOS) | ✅ fixed |
| B11 | 🟠 | LCP blocked by `data-aos` on the hero image | ✅ fixed |
| B12 | 🟠 | Black full-screen loader held until `load` | ✅ fixed |
| B13 | 🟠 | ~510 KB of duplicate libraries | ✅ fixed |
| B14 | 🟠 | 1.27 MB for one mouse follower | ✅ fixed |
| B15 | 🟠 | Dead libraries and junk files shipped | ✅ fixed |
| B16 | 🟠 | Favicon is 221 KB at 1772×1068 | ✅ fixed |
| B17 | 🟠 | 220 KB signature image rendered at 60×40 | ✅ fixed |
| B18 | 🟠 | ~1 MB of images at ~10× needed resolution | ✅ fixed |
| B19 | 🟠 | CSS delivery: `@import` fonts, double font loads | ✅ fixed |
| B20 | 🟠 | Skill bars: jQuery `.animate()` vs CSS transition | ✅ fixed |
| B21 | 🟠 | Desktop-only effects loaded on touch devices | ✅ fixed |
| B22 | 🟡 | No navigation visible at the top of the page | ✅ fixed |
| B23 | 🟡 | No cursor during load, then two custom cursors | ✅ fixed |
| B24 | 🟡 | Content fades back out when scrolling up | ✅ fixed |
| B25 | 🟡 | Bootstrap 5 classes in a Bootstrap 4 project | ✅ fixed |
| B26 | 🟡 | One skill bar has no colour (`bg-2` undefined) | ✅ fixed |
| B27 | 🟡 | Project images stuck grayscale 577–991 px | ✅ fixed |
| B28 | 🟡 | Duplicate DOM id `zoom` on 6 elements | ✅ fixed |
| B29 | 🟡 | Invalid markup (`</br>`, `<a type="button">`, 404 video) | ✅ fixed |
| B30 | 🟡 | Typos visible to recruiters | ✅ fixed |
| B31 | 🔵 | Project cards unreachable by keyboard | ✅ fixed |
| B32 | 🔵 | Missing alt text on logos | ✅ fixed |
| B33 | 🔵 | Icon-only social links have no accessible name | ✅ fixed |
| B34 | 🔵 | Decorative Hindi headings announced by screen readers | ✅ fixed |
| B35 | 🔵 | No `prefers-reduced-motion` support | ✅ fixed |
| B36 | 🔵 | Right-click blocking bound 3×, broken `event` ref | ✅ fixed (kept, deduped) |
| B37 | 🟣 | No Open Graph / Twitter Card tags | ✅ fixed |
| B38 | 🟣 | Entire body is JS-rendered — bots see an empty page | ✅ mitigated |
| B39 | 🟣 | Missing canonical / robots.txt / sitemap | ✅ fixed |
| B40 | ⚪ | Two competing init systems | ✅ fixed |
| B41 | ⚪ | `initializeAllData()` polls forever on failure | ✅ fixed |
| B42 | ⚪ | Renderers welded to Bootstrap class chains | ✅ fixed |
| B43 | ⚪ | Per-item hacks hardcoded inside renderers | ✅ fixed |
| B44 | ⚪ | `index2.html` is a 58 KB duplicate | ✅ removed |
| B45 | 🔴 | *(new)* Owl + AOS measured a pre-CSS layout | ✅ fixed |
| B46 | 🟠 | *(new)* Two Iconify builds loaded | ✅ fixed |
| B47 | 🔴 | *(new)* 2.97 MB giphy GIF used to colour one heading | ✅ fixed |
| B48 | 🟠 | *(new)* 44 runtime requests to the Iconify API per load | ✅ fixed |
| B49 | 🟠 | *(new)* Unused `.display-3` rule pulling a 1 MB behance GIF | ✅ fixed |
| B50 | 🟠 | *(new)* `aos.css` render-blocking from unpkg (third-party SPOF) | ✅ fixed |
| B51 | 🟠 | *(new)* Background textures fetched from a third party | ✅ fixed |

---

## Measured performance (headless Chrome, local server)

| Metric | Before this pass | After |
| --- | --- | --- |
| FCP | 384 ms | **204 ms** |
| LCP | 384 ms | **204 ms** |
| CLS | 0.033 | **0.031** |
| `load` | 2,705 ms | **~1,000 ms** |
| Requests | 96 | **52** |
| Third-party requests | 53 | **5** (fonts + lineicons) |

The old `load` time was dominated by a single 2.4 s download: the giphy GIF (B47).

---

## What changed, by area

### Payload
`js/` went from **2.3 MB → 428 KB**; `css/` from **452 KB → 220 KB**. 22 files deleted: three.js,
ControlKit, Shery, `4694-js-a.js`, both GSAP builds, both ScrollTrigger builds, both LocomotiveScroll
builds, two of three Kursor copies, the second Iconify build, Isotope, Lightbox (JS + CSS),
Waypoints, both particle libraries, `particles-app.js`, `6659-js-impress.js` (a 404 HTML page saved
as `.js`), `utilities-embed.js` (a CloudFront error page saved as `.js`), and `css-style2.css`.

Nothing visual was lost: every deleted library powered a feature that was already broken
(B4, B5, B14, B15) or was never referenced.

### Render path (B10, B11, B12, B40, B45)
- The loader now clears on `DOMContentLoaded` instead of `load`.
- The hero image no longer carries `data-aos`, so the LCP element paints immediately.
- One init path: `data/main.js` renders every section, then initializes Owl, Typed, the skill bars
  and AOS — in that order. `js/2967-js-main.js` no longer initializes anything data-driven.
- `AOS.init()` runs *after* the markup exists, with `once: true, mirror: false`.
- **B45 (found during verification):** layout-critical CSS was loaded asynchronously, so Owl and AOS
  measured an unstyled layout — Owl locked slides to 93 px instead of 325 px and only 1 of 11 project
  cards ever became visible. `css-style.css`, the Owl CSS and `aos.css` are now normal render-blocking
  stylesheets; fonts and `css-kursur.css` stay async. A `load` handler refreshes Owl and AOS once
  fonts and lazy images have settled.

### Data layer (B9, B26, B30, B42, B43)
Typos fixed (`Expericence` ×2, `Greduated`, `Developement`, `bassed`/`makeing`/`journy`, `ios`,
`Weknow Technology`), dead `snpschool.html` links now render as plain text, logo sizes moved into
`educationData`/`experienceData` as `logoSize`/`logoWidth`/`logoHeight`, skill colours normalised to
explicit hex (the undefined `bg-2` became `#3776ab`), and every renderer now targets an explicit id
(`#education-list`, `#skills-left`, `#projects-carousel`, …) instead of a Bootstrap class chain.
All interpolated data is HTML-escaped.

### Contact form (B6, B7, B8)
Formspree now sends `Accept: application/json` (the missing header was what made jQuery treat a
successful submit as an error and re-send via Web3Forms). The button is re-enabled on every path,
the status box is re-shown before each message, and a honeypot field (`_gotcha`) drops bot submits.

### Accessibility (B31–B36)
Project cards are `role="button" tabindex="0"` with Enter/Space handling; logos have `alt`; social
icon links have `aria-label`; decorative Hindi headings are `aria-hidden`; a
`prefers-reduced-motion` block disables the spinner, bounce, icon pulse, skill transitions and AOS.
Right-click/devtools blocking was first kept (bound once, using the handler's own event
object instead of the global `event`) and later removed entirely on request.

### SEO (B37, B38, B39)
Canonical URL, Open Graph and Twitter Card tags (`https://founder.sonint.in/`), a real `<title>`,
`robots.txt` and `sitemap.xml`. A `<noscript>` block carries a text summary, project names and
contact links for bots that don't run JS — full pre-rendering would require abandoning the
data-driven architecture, so this is a mitigation, not a cure.

---

## The asset pass (B16, B17, B18) — done

**images/ + favicons/: 2,045 KB → 478 KB (77% smaller).** No visible quality loss; several things
actually look better than before.

| Asset | Before | After | Method |
| --- | --- | --- | --- |
| 3 certificates | 3504×2472, 456 KB | 900×635, 133 KB | lossy WebP q85 |
| 5 project shots | ~2850×1560, 481 KB | 700×~385, 123 KB | lossy WebP q85 |
| 2 hero images | 155 KB | 145 KB | re-encoded, same dimensions (LCP quality) |
| 6 edu/exp logos | 79 KB | 25 KB | 2-3× display size, lossless or lossy (smaller wins) |
| signature | 1772×1068, 220 KB | 288×108, 7.4 KB | cropped to ink, alpha cleaned, lossless |
| favicon | 1772×1068, 867 KB | 16/32/180 px, 20.2 KB | new icon set: face crop of `img-about5.webp` |

### Why the earlier manual attempts lost quality

1. **Lossy compression on line art.** The signature is black ink on transparency. Lossy codecs smear
   thin strokes. Here lossless was *smaller anyway* — 7,596 B vs 7,710 B — and perfectly sharp.
2. **40% of the signature canvas was empty margin**, so shrinking the whole canvas shrank the actual
   signature further.
3. **Aspect ratio was wrong**: the ink is 2.66:1 but the HTML said `60×40` (1.5:1), so the browser
   squashed it. Now `96×36` with a 288×108 source (3× for high-DPI).

Rule of thumb used throughout: **photos/screenshots → lossy WebP q85; logos and line art → lossless
WebP (or lossy if it measures smaller); export at 2–3× the display size, never more.**

### Also fixed along the way

- `exp-manya`, `exp-webpro` and `exp-weknow` logo boxes now match each logo's real aspect ratio
  (they were being squashed into 145×25 / 125×25).
- `favicons/Logo.png` (647 KB) and `favicons/Logo.webp` (220 KB) deleted — both unreferenced after
  the new icon set. `index.html` and `404.html` now link `favicon-16.png`, `favicon-32.png` and
  `apple-touch-icon.png`.
- Intrinsic `width`/`height` in `data/projectsData.js`, `data/certificationData.js` and the modal
  placeholder updated to the new pixel sizes, so CLS protection stays accurate.
- `edu-rn.png`, `edu-rsm.png`, `exp-manya.png` and `exp-webpro.png` converted to WebP; all
  references updated.
- `exp-weknow.webp` was left at its original 586×149 / 5.8 KB — every re-encode measured *larger*,
  so the existing file was already optimal.
