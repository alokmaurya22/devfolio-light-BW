#!/usr/bin/env python3
"""Download the web fonts this site uses and generate css/fonts.css.

Self-hosting removes two third-party origins (fonts.googleapis.com and
api.fontshare.com) from the critical path: no extra DNS + TLS handshake, and no
second round trip to discover the font URLs. Browsers partition their HTTP cache
per site now, so there is no shared-cache benefit left to give up.

Only the families and weights this site actually renders are fetched, latin
subset only. Google now serves one variable-font file per family, so identical
downloads are de-duplicated and declared with a weight *range*.

    python tools/build-fonts.py
"""
import hashlib
import io
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, 'fonts')
CSS_OUT = os.path.join(ROOT, 'css', 'fonts.css')

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

# Fonts the site renders. Anything not listed here is deliberately not loaded -
# Josefin Sans, Finger Paint and Tiro Devanagari Hindi used to be requested but
# were never applied to a single element.
SOURCES = [
    ('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap', 'latin'),
    ('https://fonts.googleapis.com/css2?family=Caveat:wght@400&display=swap', 'latin'),
    ('https://api.fontshare.com/v2/css?f[]=panchang@400,700&f[]=quicksand@400&display=swap', None),
]

FACE_RE = re.compile(r'@font-face\s*\{(.*?)\}', re.S)
WOFF2_RE = re.compile(r"url\('?(//[^')]+\.woff2|https://[^')]+\.woff2)'?\)")
FAMILY_RE = re.compile(r"font-family:\s*'([^']+)'")
WEIGHT_RE = re.compile(r'font-weight:\s*([0-9]+)')
STYLE_RE = re.compile(r'font-style:\s*([a-z]+)')


def get(url):
    if url.startswith('//'):
        url = 'https:' + url
    return urllib.request.urlopen(
        urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30).read()


def faces_from(css, subset):
    """Yield (family, weight, woff2_url) for the subset we care about."""
    for chunk in css.split('/*'):
        if '@font-face' not in chunk:
            continue
        # Google labels each subset in a comment before the block; Fontshare does not.
        if subset is not None and not chunk.lstrip().startswith(subset + ' '):
            continue
        for body in FACE_RE.findall(chunk):
            style = STYLE_RE.search(body)
            if style and style.group(1) != 'normal':
                continue  # the site never renders italics of these families
            url = WOFF2_RE.search(body)
            family = FAMILY_RE.search(body)
            weight = WEIGHT_RE.search(body)
            if url and family:
                yield family.group(1), int(weight.group(1)) if weight else 400, url.group(1)


def main():
    if not os.path.isdir(FONT_DIR):
        os.makedirs(FONT_DIR)
    for stale in os.listdir(FONT_DIR):
        os.remove(os.path.join(FONT_DIR, stale))

    # family -> digest -> {'weights': set, 'file': name, 'size': int}
    fonts, seen = {}, {}
    for url, subset in SOURCES:
        css = get(url).decode('utf-8')
        for family, weight, font_url in faces_from(css, subset):
            data = get(font_url)
            digest = hashlib.md5(data).hexdigest()
            key = (family, digest)
            if key in seen:
                # Same file already downloaded for another weight -> variable font.
                seen[key]['weights'].add(weight)
                continue
            name = '%s-%d.woff2' % (family.replace(' ', '-').lower(), weight)
            io.open(os.path.join(FONT_DIR, name), 'wb').write(data)
            entry = {'weights': {weight}, 'file': name, 'size': len(data)}
            seen[key] = entry
            fonts.setdefault(family, []).append(entry)

    if not fonts:
        print('nothing downloaded - the font services may have changed their CSS format')
        return 1

    blocks, total = [], 0
    for family in sorted(fonts):
        for entry in sorted(fonts[family], key=lambda e: min(e['weights'])):
            weights = sorted(entry['weights'])
            # A single file covering several weights is a variable font: declare a range.
            value = '%d %d' % (weights[0], weights[-1]) if len(weights) > 1 else str(weights[0])
            total += entry['size']
            print('  %-26s %6d B  %s %s' % (entry['file'], entry['size'], family, value))
            blocks.append(
                "@font-face {\n"
                "    font-family: '%s';\n"
                "    font-style: normal;\n"
                "    font-weight: %s;\n"
                "    font-display: swap;\n"
                "    src: url('../fonts/%s') format('woff2');\n"
                "}\n" % (family, value, entry['file']))

    header = ("/* Self-hosted web fonts - GENERATED, do not edit by hand.\n"
              "   Regenerate with:  python tools/build-fonts.py\n"
              "   Keeps fonts.googleapis.com and api.fontshare.com off the critical path. */\n\n")
    io.open(CSS_OUT, 'w', encoding='utf-8', newline='\n').write(header + '\n'.join(blocks))
    print('\nwrote css/fonts.css: %d faces, %d files, %d KB total'
          % (len(blocks), len(os.listdir(FONT_DIR)), total // 1024))
    return 0


if __name__ == '__main__':
    sys.exit(main())
