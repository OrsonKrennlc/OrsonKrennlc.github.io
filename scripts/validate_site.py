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
        self.translation_keys: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)

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

        for attribute_name, value in attrs:
            if attribute_name == "data-i18n" or attribute_name.startswith("data-i18n-"):
                if value:
                    self.translation_keys.add(value)


def local_reference_path(source_file: Path, reference: str) -> Path | None:
    parsed = urlsplit(reference)
    if parsed.scheme in EXTERNAL_SCHEMES or parsed.netloc or not parsed.path:
        return None
    if parsed.scheme:
        return None
    return (source_file.parent / unquote(parsed.path)).resolve()


def validate_html(repository_root: Path) -> list[str]:
    errors: list[str] = []

    for page in sorted(repository_root.glob("*.html")):
        parser = PageParser(page)
        parser.feed(page.read_text(encoding="utf-8"))

        if parser.h1_count != 1:
            parser.errors.append(f"expected exactly one h1, found {parser.h1_count}")

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


def validate_i18n(repository_root: Path) -> list[str]:
    errors: list[str] = []
    runtime_path = repository_root / "js" / "i18n.js"
    content = runtime_path.read_text(encoding="utf-8")
    key_pattern = re.compile(r"^\s*'([^']+)':", re.MULTILINE)

    try:
        chinese_start = content.index("        zh: {")
        english_start = content.index("        en: {")
        dictionaries_end = content.index("\n        }\n    };", english_start)
    except ValueError:
        return ["js/i18n.js: unable to locate zh and en dictionaries"]

    chinese_keys_list = key_pattern.findall(content[chinese_start:english_start])
    english_keys_list = key_pattern.findall(content[english_start:dictionaries_end])
    chinese_keys = set(chinese_keys_list)
    english_keys = set(english_keys_list)

    if len(chinese_keys_list) != len(chinese_keys):
        errors.append("js/i18n.js: duplicate Chinese translation key")
    if len(english_keys_list) != len(english_keys):
        errors.append("js/i18n.js: duplicate English translation key")
    if chinese_keys != english_keys:
        errors.append(
            "js/i18n.js: locale key mismatch: "
            f"zh-only={sorted(chinese_keys - english_keys)}, "
            f"en-only={sorted(english_keys - chinese_keys)}"
        )

    required_keys: set[str] = set()
    for page in repository_root.glob("*.html"):
        parser = PageParser(page)
        parser.feed(page.read_text(encoding="utf-8"))
        required_keys.update(parser.translation_keys)

    dynamic_content = (repository_root / "js" / "architect.js").read_text(encoding="utf-8")
    required_keys.update(re.findall(r"\bt\(\s*'([^']+)'", dynamic_content))
    missing_keys = required_keys - chinese_keys
    if missing_keys:
        errors.append(f"i18n keys are used but not defined: {sorted(missing_keys)}")

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

        locales = project.get("locales", {})
        if not isinstance(locales, dict):
            errors.append(f"project {project_id!r} has no locale data")
        else:
            for locale in ("zh", "en"):
                localized_project = locales.get(locale, {})
                if not isinstance(localized_project, dict) or not localized_project.get("title"):
                    errors.append(f"project {project_id!r} has no {locale} title")
                if not isinstance(localized_project, dict) or not localized_project.get("description"):
                    errors.append(f"project {project_id!r} has no {locale} description")

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

    translation_file = repository_root / "assets" / "arch" / "translations.en.json"
    try:
        translations = json.loads(translation_file.read_text(encoding="utf-8"))
        translation_ids = set(translations) if isinstance(translations, dict) else set()
    except (OSError, json.JSONDecodeError):
        translation_ids = set()
    if seen_ids != translation_ids:
        errors.append(
            "project English translation id mismatch: "
            f"projects={sorted(seen_ids)}, translations={sorted(translation_ids)}"
        )

    return errors


def main() -> int:
    repository_root = Path(__file__).resolve().parents[1]
    errors = [
        *validate_html(repository_root),
        *validate_css(repository_root),
        *validate_i18n(repository_root),
        *validate_projects(repository_root),
    ]

    if errors:
        print("Site validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("Validated HTML, assets, CSS, i18n keys, and localized architecture project data.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
