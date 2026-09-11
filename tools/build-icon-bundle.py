#!/usr/bin/env python3
"""Regenerate js/iconify-bundle.js from the icons actually used by the site.

The <iconify-icon> web component fetches each icon collection from
api.iconify.design at runtime. This site would make ~20 third-party requests per
page load that way, so every icon it uses is bundled locally instead.

Run this after adding or changing an icon name anywhere in index.html or data/*.js:

    python tools/build-icon-bundle.py

It scans for icons in:
    icon="prefix:name"        (markup)
    icon: "prefix:name"       (data files)
    bottomIcon: "prefix:name" (data files)
"""
import glob
import io
import json
import os
import re
import sys
import urllib.request
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'js', 'iconify-bundle.js')
API = 'https://api.iconify.design/%s.json?icons=%s'

PATTERNS = (
    r'[A-Za-z]*[Ii]con:\s*"([a-z0-9-]+:[a-z0-9-]+)"',
    r'icon="([a-z0-9-]+:[a-z0-9-]+)"',
)

TEMPLATE = '''/**
 * Offline Iconify icon bundle - GENERATED, do not edit by hand.
 *
 * Regenerate with:  python tools/build-icon-bundle.py
 *
 * Contains exactly the icons this site uses, so <iconify-icon> resolves them
 * locally instead of requesting each collection from api.iconify.design (and its
 * simplesvg.com fallback) on every page load.
 */
(function () {
    var collections = %s;

    function register() {
        var El = window.customElements && customElements.get('iconify-icon');
        if (!El || typeof El.addCollection !== 'function') return false;
        for (var i = 0; i < collections.length; i++) El.addCollection(collections[i]);
        return true;
    }

    if (!register() && window.customElements) {
        customElements.whenDefined('iconify-icon').then(register);
    }
})();
'''


def find_icons():
    icons = set()
    files = [os.path.join(ROOT, 'index.html')] + glob.glob(os.path.join(ROOT, 'data', '*.js'))
    for path in files:
        text = io.open(path, encoding='utf-8').read()
        for pattern in PATTERNS:
            icons.update(re.findall(pattern, text))
    return icons


def fetch(prefix, names):
    url = API % (prefix, ','.join(sorted(names)))
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return json.load(urllib.request.urlopen(request, timeout=30))


def main():
    icons = find_icons()
    by_prefix = defaultdict(list)
    for icon in icons:
        prefix, name = icon.split(':')
        by_prefix[prefix].append(name)

    print('found %d icons across %d collections' % (len(icons), len(by_prefix)))

    collections, missing = [], []
    for prefix, names in sorted(by_prefix.items()):
        data = fetch(prefix, names)
        available = set(data.get('icons', {})) | set(data.get('aliases', {}))
        gone = [n for n in names if n not in available]
        if gone:
            missing.append('%s:%s' % (prefix, ', '.join(gone)))
        collections.append(data)
        print('  %-24s %d/%d' % (prefix, len(available), len(names)))

    if missing:
        print('\nERROR: these icons do not exist:', '; '.join(missing))
        return 1

    payload = json.dumps(collections, separators=(',', ':'), ensure_ascii=False)
    io.open(OUT, 'w', encoding='utf-8', newline='\n').write(TEMPLATE % payload)
    print('\nwrote %s (%d bytes)' % (os.path.relpath(OUT, ROOT), os.path.getsize(OUT)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
