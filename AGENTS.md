# Project instructions

- This repository is an English-only, native HTML/CSS/JavaScript portfolio deployed with GitHub Pages. Do not introduce a framework, package manager, build runtime, or JavaScript-injected shared navigation for routine changes.
- Main pages are `index.html`, `about.html`, `architect.html`, `interaction.html`, `photography.html`, and `tools.html`, with project details in `project.html` and `case-study.html`. Keep every visible string, metadata value, alt text, and ARIA label in English. Mark the active main navigation link with `aria-current="page"`; detail pages inherit their parent section.
- Architecture source data lives in English `assets/arch/<id>/context.csv`. `assets/arch/projectsData.js` is generated and must not be edited by hand.
- Follow `docs/DESIGN_GUIDELINES.md` for visual and responsive decisions. Record intentional design-system changes there instead of accumulating page-specific exceptions.
- Before delivery, run `python3 scripts/build_arch_data.py --check`, `python3 scripts/validate_site.py`, syntax-check changed JavaScript with `node --check`, and run `git diff --check`.
- When testing deployment or network behavior, account for the user's V2ray proxy, likely in TUN mode. Prefer local static verification first and distinguish proxy failures from site failures.
- Preserve unrelated user changes. Stage only explicitly confirmed files with `git add -- <paths>`; never include local `.vscode/` settings.

Current state: the site is intentionally static, English-only, and publishes from the GitHub Pages repository. `js/site-header.js` controls the mobile menu, and `js/site-motion.js` controls same-site page transitions.
