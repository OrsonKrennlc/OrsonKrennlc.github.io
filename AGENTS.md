# Project instructions

- This repository is a bilingual, native HTML/CSS/JavaScript portfolio deployed with GitHub Pages. Do not introduce a framework, package manager, build runtime, or JavaScript-injected shared navigation for routine changes.
- Main entry pages are `index.html`, `architect.html`, and `tools.html`. Shared localization lives in `js/i18n.js`; every visible string, metadata value, alt text, and ARIA label must be kept complete in both `zh` and `en`.
- Architecture source data lives in `assets/arch/<id>/context.csv` and `assets/arch/translations.en.json`. `assets/arch/projectsData.js` is generated and must not be edited by hand.
- Follow `docs/DESIGN_GUIDELINES.md` for visual and responsive decisions. Record intentional design-system changes there instead of accumulating page-specific exceptions.
- Before delivery, run `python scripts\build_arch_data.py --check`, `python scripts\validate_site.py`, syntax-check changed JavaScript with `node --check`, and run `git diff --check`.
- When testing deployment or network behavior, account for the user's V2ray proxy, likely in TUN mode. Prefer local static verification first and distinguish proxy failures from site failures.
- Preserve unrelated user changes. Stage only explicitly confirmed files with `git add -- <paths>`; never include local `.vscode/` settings.

Current state: the site is intentionally static, supports `?lang=zh` and `?lang=en` across pages, and publishes from the GitHub Pages repository.
