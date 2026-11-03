#!/usr/bin/env python3
"""Sirdosh: src/ fayllarini bitta HTML ga yig'adi.
dist/index.html   - GitHub Pages / Telegram uchun (Telegram SDK bilan)
dist/preview.html - brauzerda ko'rish uchun (SDK va skeletsiz)
"""
import base64, pathlib

root = pathlib.Path(__file__).parent
src, fonts, dist = root / "src", root / "build" / "fonts", root / "dist"
dist.mkdir(exist_ok=True)

def b64(name):
    return base64.b64encode((fonts / name).read_bytes()).decode()

face = "".join(
    '@font-face{font-family:"%s";font-weight:%s;font-style:normal;font-display:swap;'
    'src:url(data:font/woff2;base64,%s) format("woff2")}' % (fam, w, b64(f))
    for fam, w, f in [
        ("Alegreya", 700, "alegreya-700.woff2"),
        ("Golos Text", 400, "golos-400.woff2"),
        ("Golos Text", 600, "golos-600.woff2"),
    ]
)
css = (src / "style.css").read_text(encoding="utf8")
js = "\n".join((src / f).read_text(encoding="utf8") for f in ["content.js", "engine.js", "app.js"])
assert "</script" not in js

head = (
    '<title>Sirdosh</title>\n'
    '<meta name="claude:viewport-fit-sides" content="cover">\n'
    "<style>\n" + face + "\n" + css + "</style>\n"
)
body = '<main id="app"></main>\n<script>\n' + js + "\n</script>\n"

full = (
    '<!doctype html>\n<html lang="uz">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    '<script src="https://telegram.org/js/telegram-web-app.js"></script>\n'
    + head + "</head>\n<body>\n" + body + "</body>\n</html>\n"
)
(dist / "index.html").write_text(full, encoding="utf8")
(dist / "preview.html").write_text(head + body, encoding="utf8")
print("index.html", len(full) // 1024, "KB")
