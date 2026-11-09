# Fair Claim captures (temporary)

Captured 2026-11-09 from https://fairclaim.pages.dev with Playwright (system Chrome). Sample inputs are made-up (Jordan Lee / Harbor View Rentals LLC, Oakland CA).

- `source-notes.md` — where the code lives, README, STATUS highlights, tools list, numbers shown on the site
- `text/` — full visible text of each page (light theme): home, tools, steps, worth-it, demand-letter, states, states-ca, states-ny, states-ca-counties, states-ca-counties-alameda (first county), states-ca-counties-los-angeles, checklists, checklists-ca, glossary, sources, about. (/tools/ links only to the calculator, letter and checklists, all included.)
- `screenshots/desktop/` — 1440x900 @2x, top of page, light + dark, every page above, plus:
  - `before-you-start-{worth-it,demand-letter}-*` — the one-time notice
  - `worth-it-filled-results-*` — calculator: California, person, $3,200, court fees, 75% win / 70% collect → results
  - `demand-letter-filled-preview-*` (live preview beside the form) and `demand-letter-letter-full-*` (the whole letter, element shot)
  - `ca-deadline-estimator-*` — written contract, 03/15/2024 → "About March 15, 2028"
  - `states-filter-new-*` — states table filtered by "new"
  - `home-us-map-*` (home limits tile map) and `about-us-limit-map-*` (About's US limit map chart; element shot + viewport)
- `screenshots/full-page/` — home, tools, states-ca, worth-it filled; light + dark
- `screenshots/iphone/` — iPhone 14 emulation, viewport + full page: home, tools, worth-it filled (results in view); light + dark
- `recordings/` — Playwright recordVideo webm, 1440x900, light theme:
  - `cost-calculator-empty-to-results.webm` (13 s)
  - `demand-letter-fill-and-preview.webm` (20 s real-time; seven steps don't fit in 12 s) and `demand-letter-fill-and-preview-1.7x.webm` (12 s, sped up with ffmpeg)
  - `ca-deadline-estimator.webm` (10 s)
  - `states-filter-and-open-state.webm` (12 s; filter "new", open New York, scroll)
- `_scripts/` — the Playwright scripts used (flows.mjs, capture.mjs, rerec.mjs)
