# Aurelle — Architecture Documentation

---

## Table of Contents

1. [Document Control](#1-document-control)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack & Rationale](#3-technology-stack--rationale)
4. [File & Directory Structure](#4-file--directory-structure)
5. [HTML Layer](#5-html-layer)
6. [CSS Layer](#6-css-layer)
7. [JavaScript Layer](#7-javascript-layer)
8. [Data Flow](#8-data-flow)
9. [State Management](#9-state-management)
10. [Rendering Pipeline](#10-rendering-pipeline)
11. [Performance & Offline Strategy](#11-performance--offline-strategy)
12. [Accessibility Architecture](#12-accessibility-architecture)
13. [Security Considerations](#13-security-considerations)
14. [Extension Guide](#14-extension-guide)
15. [Known Limitations & Future Technical Roadmap](#15-known-limitations--future-technical-roadmap)

---

## 1. Document Control

| Field | Value |
|---|---|
| Product | Aurelle — Premium E-Commerce Homepage |
| Document | Architecture Documentation |
| Version | 1.0 |
| Date | 2026-09-28 |
| Status | Reflects the implemented v1 codebase |
| Owner | Writer-Docs (Product Documentation Team) |
| Source of truth | `index.html`, `css/styles.css`, `js/main.js` as implemented |

---

## 2. Architecture Overview

Aurelle is a **static, zero-build, offline-first single-page site**: three plain text files
delivered directly to the browser. There is no server, no package manager, no bundler, no
transpiler, and no runtime network access — the page is fully functional when opened from
disk via the `file://` protocol.


The codebase is a strict three-layer separation — structure (HTML), presentation (CSS), and
behavior/data (JavaScript) — with one contract surface: the DOM `id`s and CSS class hooks
that `main.js` queries.

```text
+--------------------------------------------------------------------------+
|                          BROWSER (file:// or http://)                     |
+--------------------------------------------------------------------------+
|  +---------------------+   <link>    +----------------------------+      |
|  |  index.html (364)   |-----------> |  css/styles.css (1571)     |      |
|  |  STRUCTURE          |             |  PRESENTATION              |      |
|  |  - semantic HTML5   |             |  - :root design tokens     |      |
|  |  - static sections  |             |  - components + grids      |      |
|  |  - empty #productGrid -----------> media queries, keyframes   |      |
|  |  - inline SVG/emoji |             +----------------------------+      |
|  +---------------------+                                                 |
|           |  <script>                                                    |
|           v                                                              |
|  +-------------------------------------------------------------+        |
|  |  js/main.js (596) — BEHAVIOR + DATA (IIFE, classic script)   |        |
|  |  PRODUCTS[14] --> state{filter,query,cart} --> renderers      |        |
|  |  --> string templates --> innerHTML --> #productGrid          |        |
|  |  events: tabs, tiles, search, menu, cart, form, scroll        |        |
|  +-------------------------------------------------------------+        |
|  ZERO network calls. ZERO external assets. ZERO storage.                 |
+--------------------------------------------------------------------------+
```

Numbers in parentheses are actual line counts (`wc -l`): **2,531 lines total**.

---

## 3. Technology Stack & Rationale

| Layer | Choice | Rationale |
|---|---|---|
| Markup | Plain HTML5, semantic landmarks (`header/nav/main/section/footer`) | No transpiler; accessible and SEO-friendly |
| Styling | Modern CSS3: custom properties, Grid, Flexbox, `clamp()`, `aspect-ratio` | Full design control, no framework |
| Behavior | Vanilla ES6 in one IIFE, classic script (no modules/imports) | Guaranteed execution from `file://` — modules and `fetch` fail there |
| Visuals | Inline SVG, emoji, CSS gradients | Fully offline; zero external images/CDN |
| Fonts | System stacks (Georgia serif display, system-ui sans body) | Zero network cost, zero layout shift |
| Tooling | None — no `package.json`, no build, no dev server | Open `index.html` directly; trivially reviewable diffs |

**Key decisions:** classic script over ES modules (file:// origin restrictions); runtime
rendering from the `PRODUCTS` array so catalog edits never touch HTML; empty favicon
(`href="data:,"`) suppresses the browser's automatic `/favicon.ico` request, keeping the
zero-network guarantee absolute.

---

## 4. File & Directory Structure

```text
agentteams/
├── index.html                  (364 lines) Single page; 10 sections in semantic order,
│                                           skip-link, all static markup, empty product grid
├── css/
│   └── styles.css              (1571 lines) 16 numbered blocks:
│                                           1 tokens · 2 reset/base · 3 utilities ·
│                                           4 header · 5 mobile menu · 6 hero ·
│                                           7 categories · 8 promos · 9 products ·
│                                           10 brands · 11 newsletter · 12 footer ·
│                                           13 back-to-top · 14 reveal/keyframes ·
│                                           15 responsive · 16 reduced motion
├── js/
│   └── main.js                 (596 lines) 6 numbered blocks:
│                                           1 PRODUCTS data (14 items) · 2 state ·
│                                           3 helpers · 4 rendering/filtering ·
│                                           5 interactions · 6 bootstrap
└── docs/
    ├── PRODUCT_DOCUMENTATION.md       Product-side documentation
    └── ARCHITECTURE_DOCUMENTATION.md  This file
```

---

## 5. HTML Layer

**Semantic structure (document order):** (1) skip link `href="#main"`; (2) sticky
`header#siteHeader` — logo (inline SVG mark + "Aurelle" wordmark), `form#searchForm
[role="search"]` with `#searchInput`, `#cartButton` (SVG cart + `#cartCount` badge),
`nav.site-nav` (4 links), `#mobileMenuToggle` hamburger; (3) `#mobileOverlay` + `nav#mobileMenu`
(6 links); (4) `main#main` with sections `#top` (hero), `#categories` (12 tiles in
`#categoryGrid`), `#deals` (2 promo banners), `#products` (13 `.tab-btn` in `#productTabs`,
`#filterStatus` live region, `<noscript>` fallback, empty `#productGrid`, hidden `#noResults`
with `#clearSearch`), `#brands` (7 styled-text marks), `#newsletter` (`#newsletterForm` +
`#newsletterEmail` + `#newsletterMessage`); (5) `footer.site-footer` — brand column + 4 link
columns (Shop/Support/Company/Follow) + legal row with payment hints; (6) `#backToTop`;
(7) `<script src="js/main.js">` last in `<body>`.

### IDs referenced by JavaScript (the JS/HTML contract)

| ID | Element | Role in JS |
|---|---|---|
| `productGrid` | `div.product-grid` | Render target — `innerHTML` injection of cards |
| `productTabs` | `div.tab-strip` | Click delegation for `.tab-btn` filtering |
| `filterStatus` | `p.sr-only[role="status"]` | Live text: "Showing N of 14 products." |
| `noResults` | `div.no-results` | `hidden` toggled when the result set is empty |
| `clearSearch` | `button` | Resets query + filter, refocuses search input |
| `searchForm` | `form[role="search"]` | `submit` → `preventDefault()`, filter, scroll |
| `searchInput` | `input[type="search"]` | `input` → live text filter |
| `cartCount` | `span.cart-count` | Badge text + `.is-pulsing` restart |
| `cartButton` | `button.cart-button` | `aria-label` "Shopping cart, N item(s)" |
| `mobileMenuToggle` | `button` | Hamburger: `aria-expanded`, `aria-label`, `.is-open` |
| `mobileMenu` / `mobileOverlay` | `nav` / `div` | `.is-open` slide-down panel + click-to-close scrim |
| `newsletterForm` | `form[novalidate]` | `submit` → local email validation |
| `newsletterEmail` | `input[type="email"]` | Value read; `.is-invalid`/`aria-invalid` on error |
| `newsletterMessage` | `p[role="status"]` | Inline success/error via `textContent` |
| `backToTop` | `button` | `.is-visible` past 600px; smooth scroll to top |
| `products` | `section#products` | Scroll target of `scrollToSection('#products')` |

IDs present but **not** queried by JS: `siteHeader`, `top`, `main`, `heroTitle`, `categoriesTitle`,
`productsTitle`, `newsletterTitle` (ARIA `aria-labelledby` targets), `categories`/`deals`/`brands`/
`newsletter` (anchor targets), `categoryGrid` (JS hooks `.category-tile` classes), `artGold` (SVG
gradient definition).

---

## 6. CSS Layer

### Design tokens (`:root`, styles.css lines 12–62)

| Token(s) | Actual value(s) |
|---|---|
| `--ink` / `--ink-soft` | `#111315` / `#141618` |
| `--ivory` / `--surface` | `#FAF7F2` / `#FFFFFF` |
| `--gold` / `--gold-dark` / `--gold-soft` | `#B98A2F` / `#9A7125` / `rgba(185,138,47,0.12)` |
| `--text` / `--text-muted` / `--border` | `#2A2D30` / `#5C5F62` / `#E8E2D6` |
| `--danger` / `--danger-soft` / `--success-soft` | `#F0B3A8` / `#E08A7B` / `#DCC189` |
| `--font-display` / `--font-body` | `Georgia, "Times New Roman", serif` / `system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| `--text-xs/sm/base/md` | `0.75 / 0.875 / 1 / 1.0625` rem |
| `--space-1…12` | `8 / 16 / 24 / 32 / 48 / 64 / 96` px (8-pt scale) |
| `--radius-sm/md/lg/pill` | `12 / 16 / 20 / 999` px |
| `--shadow-sm/md/lg` | low-opacity ink shadows, `rgba(17,19,21,0.05…0.2)` |
| `--ease-out` / `--dur-fast/med/slow` | `cubic-bezier(0.22,0.61,0.36,1)` / `150 / 220 / 300` ms |
| `--header-h` | `76px` (→ `118px` at ≤640px two-row header) |

### Reset, base & layout

Minimal reset: universal `border-box`; zeroed margins; button/input normalization
(`font: inherit`); `svg { display:block }`; gold `::selection`; global
`:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px }`; `html` gets
`scroll-behavior: smooth` + `scroll-padding-top: calc(var(--header-h) + 16px)`.
`.container` — `max-width: 1232px`, fluid padding `clamp(20px, 4vw, 32px)`; `.section`
padding `clamp(56px, 8vw, 96px)`. Grids: `.hero-inner` `1.05fr 0.95fr`; `.category-grid` /
`.product-grid` `repeat(4, 1fr)`; `.promo-grid` `1.6fr 1fr`; `.footer-grid`
`1.5fr 1fr 1fr 1fr 1fr`. Sticky header: `rgba(250,247,242,0.9)` + `backdrop-filter: blur(14px)`.
Z-index ladder: skip-link 100 > back-to-top 60 > header 50 > mobile-menu 40 > overlay 30.

### Component inventory

`.skip-link`; `.btn` (`-solid`/`-ghost`/`-outline-light`/`-outline-dark`); `.logo`,
`.header-search`/`.search-input`, `.cart-button`/`.cart-count`, `.nav-link`,
`.mobile-menu-toggle`/`.hamburger-bar`, `.mobile-menu`/`.mobile-overlay`; `.hero-*` (copy,
art, glow, chips); `.category-tile`; `.promo-banner--wide/--tall`; `.tab-btn`,
`.product-card` (`card-media/badge/emoji/rating/pricing`, `add-to-cart-btn`); `.no-results`;
`.brand-mark` (`--caps/--serif/--wide/--italic`); `.newsletter-card/-form/-input/-message`;
`.site-footer` grid; `.back-to-top`; `.reveal`; `.sr-only`.

### Responsive breakpoints (actual media queries, desktop-first)

| Query | Effect |
|---|---|
| `max-width: 1100px` | category & product grids → 3 columns; footer → 3 columns |
| `max-width: 980px` | hero stacks to 1 column; promo grid → 1 column |
| `max-width: 820px` | category & product grids → 2 columns |
| `max-width: 768px` | `.site-nav` hidden, hamburger shown (mobile menu mode) |
| `max-width: 640px` | `--header-h: 118px`; search wraps to a full-width row; footer → 2 columns |
| `max-width: 520px` | newsletter form stacks; product grid → 1 column |
| `max-width: 400px` | category grid → 1 column; brand strip centered |
| `min-width: 1440px` | wider hero/product-grid gaps (calmer density) |

### Animation / motion system

Keyframes: `card-in` (fade+rise, 420ms), `badge-pulse` (scale 1→1.4→1, 400ms), `chip-float`
(hero emoji, 6s infinite, staggered delays). `.reveal` starts `opacity: 0; translateY(24px)`
and transitions 600ms to `.is-visible`. Under `@media (prefers-reduced-motion: reduce)` all
durations become `0.01ms !important`, `html` scroll-behavior → `auto`, `.reveal` is forced
visible, and `.product-card`/`.hero-chip` animations are removed.

---

## 7. JavaScript Layer

`main.js` is one IIFE (`'use strict'`) in 6 numbered blocks.

**Data — `PRODUCTS`:** 14 items (`p-001`…`p-014`) covering all 12 categories (Electronics ×2,
Beauty & Personal Care ×2, one each for the other 10) so no filter is ever empty. Model
fields: `id` (unique string), `name`, `category` (must equal a tab `data-filter` string),
`price` (number), `originalPrice` (number | null → struck-through), `rating` (0–5),
`reviewsCount` (int), `badge` (string | null: "New", "Bestseller", "−20%"), `description`
(one sentence), `emoji`.

**State:** `const state = { activeFilter: 'All', searchQuery: '', cartCount: 0 }` (details
in §9).

**Helpers:** `$`/`$$` (scoped `querySelector(All)`, `$$` returns a real array);
`prefersReducedMotion()` (`matchMedia('(prefers-reduced-motion: reduce)')`); `formatPrice()`
(numeric coercion, `'$' + toFixed(2)`); `escapeHTML()` (entity-encodes `& < > " '`);
`closest()` (Element-safe `closest` ignoring text-node targets); `scrollToSection()` (84px
header offset; `'auto'` behavior under reduced motion).

**Renderer pipeline:** `buildStars(rating)` → five `★`/`☆` glyphs (decorative, `aria-hidden`)
→ `productCardHTML(product)` → one `<article class="product-card">` string →
`getVisibleProducts()` filters `PRODUCTS` by `state.activeFilter` **and** case-insensitive
`indexOf` over `name + ' ' + category + ' ' + description` → `renderProducts()` joins cards
into `#productGrid.innerHTML`, assigns staggered `animationDelay` (`min(index*45, 315)ms`,
`0ms` under reduced motion), writes a summary to `#filterStatus`, toggles `#noResults.hidden`.
`setFilter()` syncs `.is-active`/`aria-pressed` across all 13 tabs before re-rendering.

### Event wiring map

| Event source | Event | Handler effect |
|---|---|---|
| `#productTabs` (delegated `.tab-btn`) | `click` | `setFilter(data-filter)` → sync tabs → re-render |
| `.category-tile` (12 tiles, direct) | `click` | Clear query + input → `setFilter(data-category)` → scroll to `#products` |
| `#searchInput` | `input` | `state.searchQuery` → live `renderProducts()` |
| `#searchForm` | `submit` | `preventDefault()` → filter → scroll to `#products` |
| `#clearSearch` | `click` | Reset query, `setFilter('All')`, refocus input |
| `#mobileMenuToggle` | `click` | `setOpen(!isOpen())` — `.is-open` on menu/toggle/overlay, `body.menu-locked`, `aria-expanded`/`aria-label` |
| `#mobileOverlay`, `.mobile-menu-link` | `click` | `setOpen(false)` |
| `document` | `keydown` Escape | Close menu if open; return focus to toggle |
| `document` (delegated `.add-to-cart-btn`) | `click` | Duplicate guard (<150ms) → `cartCount += 1` → `updateBadge()` (text, aria-label, `.is-pulsing` restart via `void offsetWidth`) → "Added ✓" for 1200ms |
| `#newsletterForm` / `#newsletterEmail` | `submit` / `input` | Regex `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`; error → `.is-error` + `.is-invalid` + `aria-invalid` + focus; success → `.is-success` + `form.reset()`; typing clears invalid state |
| `window` | `scroll` (**passive**) | Toggle `#backToTop.is-visible` when `scrollY > 600` |
| `#backToTop` | `click` | `window.scrollTo({ top: 0 })`, smooth unless reduced motion |

**Scroll reveal:** `initScrollReveal()` observes `.reveal` elements with an
`IntersectionObserver` (`threshold: 0.15`, `rootMargin: '0px 0px -40px 0px'`), applies a
sibling-indexed `transitionDelay` capped at 420ms, and unobserves after reveal. Reduced
motion or missing `IntersectionObserver` support → everything shown immediately.

**Bootstrap:** `init()` runs `renderProducts()` then the 8 initializers; invoked on
`DOMContentLoaded` (or immediately if the document is already loaded).

---

## 8. Data Flow

```text
FILTERING (tab / category tile)
  user click (.tab-btn | .category-tile)
        v
  setFilter(category): state.activeFilter = category; sync .is-active + aria-pressed
        v
  getVisibleProducts(): PRODUCTS.filter(category match AND query match)
        v
  renderProducts(): #productGrid.innerHTML = cards.join('')
        #filterStatus.textContent = "Showing N of 14 products."
        #noResults.hidden = (N !== 0)
        v
  DOM updated (staggered card-in animation)

SEARCH (typing)
  #searchInput "input" -> state.searchQuery = value -> renderProducts() -> DOM

ADD TO CART
  click .add-to-cart-btn -> 150ms duplicate guard -> state.cartCount += 1
        -> updateBadge(): #cartCount text, #cartButton aria-label,
           .is-pulsing restart -> button feedback "Added ✓" (1200ms)
```

All flows share one rule: **events mutate `state`, then re-render from state** — the DOM is
never a data source.

---

## 9. State Management

State is a single in-memory object; there is no persistence (no `localStorage`, no cookies,
no URL state).

| Field | Initial | Mutated in | Read by |
|---|---|---|---|
| `activeFilter` | `'All'` | `setFilter()` — from tab clicks, category tiles, `#clearSearch` | `getVisibleProducts()` |
| `searchQuery` | `''` | `initSearch` (`input`/`submit`/`#clearSearch`), `initCategoryTiles` (reset) | `getVisibleProducts()` |
| `cartCount` | `0` | `initAddToCart` handler (`+= 1` behind the 150ms guard) | `updateBadge()` |

Lifetime: the page session. Closing the tab resets the cart — intentional for v1.

---

## 10. Rendering Pipeline

1. **String templates, not DOM APIs:** cards are concatenated HTML strings in
   `productCardHTML()`, injected once per render via `grid.innerHTML = visible.map(...).join('')`.
   Full re-render (no diffing) keeps the code simple at this data scale (≤14 items).
2. **Escaping strategy:** every string field interpolated into HTML — `id`, `name`,
   `category`, `badge`, `emoji` — passes through `escapeHTML()` (`& < > "` `'` →
   `&amp; &lt; &gt; &quot;` `&#39;`). Numeric fields (`rating`, `reviewsCount`, prices) are
   coerced via `Number()`/`formatPrice()`/`toFixed()`, so only numeric text can appear. The
   add-to-cart `aria-label` embeds the **escaped** name.
3. **Post-render enhancement:** per-card `animationDelay` (capped 315ms) is set via inline
   `style`, driving the staggered `card-in` entrance.
4. **Auxiliary outputs:** `#filterStatus` and the newsletter message are written with
   `textContent` (never markup), so user-typed content (e.g., an email address echoed in the
   success message) can never be interpreted as HTML.

---

## 11. Performance & Offline Strategy

- **Zero network:** verified — no `http://`/`https://` reference in any delivered file; system font stacks; emoji/inline SVG/gradient imagery; `data:` favicon.
- **No build step:** the browser receives the authored bytes; ≈73 KB (74,594 bytes) of source text across the three code files.
- **Passive listeners:** the `scroll` listener uses `{ passive: true }`; other handlers are cheap delegated clicks.
- **CSS-driven motion:** entrances and hover transitions run on the compositor; JS only toggles classes/inline delays.
- **Reflow-safe pulse restart:** the badge pulse re-triggers via a single `void offsetWidth` read instead of node cloning.
- **Deferred bootstrap:** the script tag is last in `<body>`; `init()` guards on `document.readyState`.
- **One-time observer:** `IntersectionObserver` created once; entries unobserved after reveal — no scroll-thrash handlers.

---

## 12. Accessibility Architecture

- **Landmarks:** `header`, labelled `nav`s (Primary / Mobile navigation / four footer navs), `main#main`, sections with `aria-labelledby` heading IDs, `footer`.
- **Skip link:** first focusable element; revealed on focus (`.skip-link:focus`).
- **Live regions:** `#filterStatus` and `#newsletterMessage` (`role="status"`, `aria-live="polite"`) announce result counts and form outcomes; `#cartCount` is `aria-hidden` while `#cartButton`'s `aria-label` carries "Shopping cart, N item(s)".
- **State exposure:** tabs use `aria-pressed`; hamburger uses `aria-expanded` + `aria-controls` + dynamic `aria-label`; invalid email gets `aria-invalid="true"`.
- **Focus management:** global `:focus-visible` gold ring; Escape closes the mobile menu and refocuses the toggle; failed newsletter validation focuses the input; `#clearSearch` refocuses the search field.
- **Screen-reader text:** `.sr-only` labels for search/email inputs; decorative SVGs and emoji carry `aria-hidden="true"` / `focusable="false"`; stars are decorative with the numeric rating in text.
- **Motion:** honored in CSS under `prefers-reduced-motion` and mirrored in JS via `prefersReducedMotion()` (scroll behavior, delays, observer fallback).
- **Keyboard completeness:** all interactive elements are native `button`/`a`/`input`; a `<noscript>` notice tells non-JS visitors the catalog needs JavaScript.

---

## 13. Security Considerations

- **No backend, no secrets:** no API keys, tokens, endpoints, or telemetry; the site cannot leak what it never collects.
- **No data transmission:** newsletter and search forms are always `preventDefault()`ed and validated locally; nothing is ever submitted anywhere.
- **innerHTML hardening:** `productCardHTML` is the only `innerHTML` producer, and all interpolations are escaped or numerically coerced (§10). The catalog is author-controlled, but escaping makes runtime injection of hostile strings (e.g., a name containing `<script>`) inert.
- **Event delegation safety:** `closest()` tolerates non-element targets; delegation matches specific classes (`.tab-btn`, `.add-to-cart-btn`), so unexpected markup cannot trigger handlers.
- **No third-party code:** zero CDN scripts/fonts — no supply-chain surface.

---

## 14. Extension Guide

### Add a product

1. `js/main.js` → `PRODUCTS` array: append an object with all 10 fields (`id` unique, e.g.
   `'p-015'`; `category` must exactly match an existing tab `data-filter`; `badge: null` if
   none).
2. Done — `renderProducts()` picks it up on load; `#filterStatus` counts derive
   automatically. No HTML/CSS changes needed.

### Add a category (three synchronized places)

1. `js/main.js` → `PRODUCTS`: add at least one product with the new `category` name.
2. `index.html` → `#categoryGrid`: append `<button class="category-tile" type="button" data-category="<Name>">` containing `tile-emoji`, `tile-name`, `tile-count` spans.
3. `index.html` → `#productTabs`: append `<button class="tab-btn" type="button" data-filter="<Name>" aria-pressed="false"><Name></button>`.
4. `data-category`, `data-filter`, and product `category` must be **identical** — filtering is exact string equality. Optional: adjust grid rules in `styles.css` for tile balance.

### Add a new section

1. `index.html`: insert `<section class="section ..." id="..." aria-labelledby="...">` inside `<main>`; add nav links in the header / `#mobileMenu` if it should be reachable from menus.
2. `css/styles.css`: add a numbered component block (following the 16-block organization) using existing tokens; extend §15 media queries only if the section needs distinct per-breakpoint layout.
3. `js/main.js`: add `class="reveal"` for scroll animation (no JS change), or create an `initX()` function, call it from `init()`, and update the file header comment.

---

## 15. Known Limitations & Future Technical Roadmap

**Known limitations in v1**

- **Cart is a counter, not a cart:** no quantities, contents, or totals; state is lost on reload (no persistence).
- **Single page, no routing:** anchors only; no product detail views, no history entries.
- **In-memory catalog:** 14 products hardcoded in `main.js`; tile item counts ("128 items") are static display copy, not computed from data.
- **No image pipeline:** emoji-as-imagery limits realism and varies across platforms.
- **Simple search:** matches `name + category + description` via case-insensitive `indexOf` — no ranking or fuzzy matching.
- **Manual scroll offset:** `scrollToSection` hardcodes 84px, which must track `--header-h` (76px; 118px two-row mobile header) if the header changes.
- **No automated tests or CI:** correctness relies on manual browser verification.

**Future technical roadmap (all out of scope for v1)**

| Phase | Item | Technical shape |
|---|---|---|
| v1.1 | Product detail view | Hash routing (`#/product/:id`) reusing the renderer pipeline |
| v1.2 | Real cart + persistence | Cart items in `state` + `localStorage`; quantity/line totals |
| v1.3 | Checkout flow | Requires a backend — first network dependency, breaking offline guarantee |
| v2.0 | Accounts & auth | Server sessions/OAuth; profile and order history |
| v2.x | Backend catalog | API- or JSON-served products; build step for data bundling |
| v2.x | Image pipeline | Optimized assets, `srcset`, lazy loading — replacing emoji placeholders |

---

*© 2026 Aurelle. Architecture documentation v1.0 — matches the implemented codebase.*