#!/usr/bin/env python3
"""
Path checker for Pung Academy.

There is no build step here, so a mistyped path fails silently at runtime on
one page. This walks every HTML and JS file and verifies that each local
href, src and import actually resolves to a file on disk.

    python tools/check-paths.py

Exits 0 when everything resolves, 1 when something is broken.
"""

import pathlib
import posixpath
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

HTML_ATTR = re.compile(r'\b(?:href|src)="([^"]+)"')
JS_IMPORT = re.compile(r'(?:^|\s)(?:import|export)[^\n]*?from\s+["\']([^"\']+)["\']')
JS_DYNAMIC = re.compile(r'import\(\s*["\']([^"\']+)["\']\s*\)')

SKIP_PREFIXES = ("http://", "https://", "//", "#", "mailto:", "data:", "javascript:")


def local_targets(text, patterns):
    for pattern in patterns:
        for match in pattern.finditer(text):
            url = match.group(1)
            if url.startswith(SKIP_PREFIXES):
                continue
            path = url.split("#")[0].split("?")[0]
            if path:
                yield path


def check(path, patterns):
    problems = []
    base = path.parent.relative_to(ROOT).as_posix()
    text = path.read_text(encoding="utf-8")

    for target in local_targets(text, patterns):
        if target.startswith("/"):
            problems.append(
                (target, "root-absolute path — breaks on GitHub Pages subpaths")
            )
            continue
        resolved = posixpath.normpath(posixpath.join(base or ".", target))
        if not (ROOT / resolved).exists():
            problems.append((target, f"no such file: {resolved}"))
    return problems


def main():
    files = []
    for pattern in ("*.html", "pages/**/*.html", "js/**/*.js", "css/**/*.css"):
        files.extend(sorted(ROOT.glob(pattern)))

    total_refs = 0
    broken = 0

    for path in files:
        patterns = (
            [HTML_ATTR] if path.suffix == ".html"
            else [JS_IMPORT, JS_DYNAMIC] if path.suffix == ".js"
            else [re.compile(r'url\(\s*["\']?([^"\')]+)["\']?\s*\)')]
        )
        text = path.read_text(encoding="utf-8")
        total_refs += sum(1 for _ in local_targets(text, patterns))

        for target, reason in check(path, patterns):
            broken += 1
            rel = path.relative_to(ROOT).as_posix()
            print(f"BROKEN  {rel}\n        {target}  ->  {reason}")

    print(f"\nchecked {len(files)} files, {total_refs} local references")
    if broken:
        print(f"{broken} broken reference(s)")
        return 1
    print("all references resolve")
    return 0


if __name__ == "__main__":
    sys.exit(main())
