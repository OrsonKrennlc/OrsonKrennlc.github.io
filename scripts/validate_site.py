"""Validate the static portfolio structure without third-party dependencies."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


EXTERNAL_SCHEMES = {"http", "https", "mailto", "tel", "data"}


class PageParser(HTMLParser):
    def __init__(self, page: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.page = page
        self.errors: list[str] = []
        self.references: list[str] = []
        self.ids: set[str] = set()
        self.h1_count = 0
        self.html_lang: str | None = None
        self.in_main_nav = False
        self.active_nav_links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)

        if tag == "html":
            self.html_lang = attributes.get("lang")
        elif tag == "nav" and "main-nav" in (attributes.get("class") or "").split():
            self.in_main_nav = True
        elif tag == "a" and self.in_main_nav and attributes.get("aria-current") == "page":
            self.active_nav_links.append(attributes.get("href") or "")

        element_id = attributes.get("id")
        if element_id:
            if element_id in self.ids:
                self.errors.append(f"duplicate id #{element_id}")
            self.ids.add(element_id)

        if tag == "h1":
            self.h1_count += 1
        elif tag == "img" and "alt" not in attributes:
            self.errors.append(f"image is missing alt: {attributes.get('src', '<unknown>')}")
        elif tag == "button" and attributes.get("type") not in {"button", "submit", "reset"}:
            self.errors.append("button is missing an explicit type")
        elif tag == "a" and attributes.get("href") == "#":
            self.errors.append("anchor uses an empty # destination")

        for attribute_name in ("href", "src"):
            reference = attributes.get(attribute_name)
            if reference:
                self.references.append(reference)

        for attribute_name, _ in attrs:
            if attribute_name == "data-i18n" or attribute_name.startswith("data-i18n-") or attribute_name == "data-locale":
                self.errors.append(f"obsolete localization attribute: {attribute_name}")

    def handle_endtag(self, tag: str) -> None:
        if tag == "nav" and self.in_main_nav:
            self.in_main_nav = False


def local_reference_path(source_file: Path, reference: str) -> Path | None:
    parsed = urlsplit(reference)
    if parsed.scheme in EXTERNAL_SCHEMES or parsed.netloc or not parsed.path:
        return None
    if parsed.scheme:
        return None
    return (source_file.parent / unquote(parsed.path)).resolve()


def validate_html(repository_root: Path) -> list[str]:
    errors: list[str] = []
    active_pages = {
        "index.html": "index.html",
        "about.html": "about.html",
        "architect.html": "architect.html",
        "interaction.html": "interaction.html",
        "photography.html": "photography.html",
        "project.html": "architect.html",
        "case-study.html": "interaction.html",
        "tools.html": None,
    }

    for page in sorted(repository_root.glob("*.html")):
        parser = PageParser(page)
        content = page.read_text(encoding="utf-8")
        parser.feed(content)

        if parser.h1_count != 1:
            parser.errors.append(f"expected exactly one h1, found {parser.h1_count}")
        if parser.html_lang != "en":
            parser.errors.append(f"expected html lang=en, found {parser.html_lang!r}")
        if page.name != "tools.html" and "js/site-motion.js" not in parser.references:
            parser.errors.append("missing shared page transition script")
        if page.name == "tools.html" and 'content="0; url=about.html#vibe-tools"' not in content:
            parser.errors.append("legacy tools page must redirect to the About section")
        if page.name == "about.html":
            if "vibe-tools" not in parser.ids:
                parser.errors.append("missing Vibe Tools section")
            for app_name in ("AntiMap", "MARD 221 Palette"):
                if app_name not in content:
                    parser.errors.append(f"missing Vibe Tools app: {app_name}")
        if page.name != "tools.html" and 'href="tools.html"' in content:
            parser.errors.append("obsolete standalone Vibe Tools link")
        if page.name in active_pages:
            expected = [] if active_pages[page.name] is None else [active_pages[page.name]]
            if parser.active_nav_links != expected:
                parser.errors.append(f"active navigation mismatch: expected {expected}, found {parser.active_nav_links}")
        if re.search(r"[\u4e00-\u9fff]", content):
            parser.errors.append("page still contains Chinese text")

        for reference in parser.references:
            path = local_reference_path(page, reference)
            if path is not None and not path.exists():
                parser.errors.append(f"missing local reference: {reference}")

        errors.extend(f"{page.name}: {message}" for message in parser.errors)

    return errors


def validate_css(repository_root: Path) -> list[str]:
    errors: list[str] = []
    url_pattern = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)")

    for stylesheet in sorted((repository_root / "css").glob("*.css")):
        content = stylesheet.read_text(encoding="utf-8")
        for _, reference in url_pattern.findall(content):
            path = local_reference_path(stylesheet, reference)
            if path is not None and not path.exists():
                errors.append(f"{stylesheet.relative_to(repository_root)}: missing asset {reference}")

    return errors


def load_project_data(data_file: Path) -> list[dict[str, object]]:
    content = data_file.read_text(encoding="utf-8")
    prefix = "window.ARCH_PROJECTS = "
    start = content.find(prefix)
    if start == -1 or not content.rstrip().endswith(";"):
        raise ValueError("unexpected projectsData.js wrapper")
    payload = content[start + len(prefix):].rstrip()[:-1]
    data = json.loads(payload)
    if not isinstance(data, list):
        raise ValueError("project data must be an array")
    return data


def validate_projects(repository_root: Path) -> list[str]:
    errors: list[str] = []
    data_file = repository_root / "assets" / "arch" / "projectsData.js"

    try:
        projects = load_project_data(data_file)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        return [f"assets/arch/projectsData.js: {error}"]

    seen_ids: set[str] = set()
    for project in projects:
        project_id = str(project.get("id", ""))

        if not project_id or project_id in seen_ids:
            errors.append(f"project has a missing or duplicate id: {project_id!r}")
        seen_ids.add(project_id)

        if not project.get("title") or not project.get("description"):
            errors.append(f"project {project_id!r} needs an English title and description")
        if "locales" in project:
            errors.append(f"project {project_id!r} still contains localized data")

        images = project.get("images", [])
        if not isinstance(images, list) or not images:
            errors.append(f"project {project_id!r} has no images")
            continue

        for reference in images:
            image_path = (repository_root / str(reference)).resolve()
            if not image_path.is_file():
                errors.append(f"project {project_id!r} references missing image: {reference}")

    source_ids = {
        path.parent.name
        for path in (repository_root / "assets" / "arch").glob("*/context.csv")
    }
    if seen_ids != source_ids:
        errors.append(
            "project source/generated id mismatch: "
            f"source={sorted(source_ids)}, generated={sorted(seen_ids)}"
        )

    return errors


def main() -> int:
    repository_root = Path(__file__).resolve().parents[1]
    errors = [
        *validate_html(repository_root),
        *validate_css(repository_root),
        *validate_projects(repository_root),
    ]
    for obsolete in ("js/i18n.js", "assets/arch/translations.en.json"):
        if (repository_root / obsolete).exists():
            errors.append(f"obsolete translation file remains: {obsolete}")

    if errors:
        print("Site validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("Validated English HTML, active navigation, assets, CSS, and architecture project data.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
