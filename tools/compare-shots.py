#!/usr/bin/env python3
"""Prove that a risky change did not alter the rendered layout.

Pixel diffing this page is unreliable: the carousel autoplays and the typed line
animates, so two runs of the same code differ by several percent. Instead this
measures the geometry of stable landmarks (every section, the navbar, the footer,
the hero image, the skill columns) and compares the numbers.

    python tools/compare-shots.py before     # record baseline
    ...make the change...
    python tools/compare-shots.py after      # record + report differences

Requires a local server on port 5500 and Chrome installed.
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, '.shots')
CHROME = os.environ.get('CHROME', r'C:\Program Files\Google\Chrome\Application\chrome.exe')
# width x height: real viewport sizes - a tall probe iframe would make any
# 100vh rule meaningless (the hero is sized in vh)
VIEWPORTS = ((1440, 900), (1024, 768), (760, 1000))
TOLERANCE = 1.0  # px

LANDMARKS = [
    '.navbar', '#about', '#about .col-lg-5', '#about .col-lg-7', '.profile-img',
    '#about-name', '#about-description', '#about-social', '#qualification',
    '#education-list', '#experience-list', '#skill', '#skills-left', '#skills-right',
    '#portfolio', '#projects-carousel', '#certification', '#service', '#interest-list',
    '#testimonial', '#contact', '#contactForm', '.fot', '#footer-socials', '.page-footer',
]

PROBE = """
<!DOCTYPE html><html><body style="margin:0">
<iframe id="f" src="/index.html" style="width:%dpx;height:%dpx;border:0"></iframe>
<pre id="out">pending</pre>
<script>
document.getElementById('f').addEventListener('load', function () {
  setTimeout(function () {
    var d = document.getElementById('f').contentDocument;
    var result = {};
    %s.forEach(function (sel) {
      var el = d.querySelector(sel);
      if (!el) { result[sel] = null; return; }
      var r = el.getBoundingClientRect();
      result[sel] = [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    });
    result['__docHeight'] = d.documentElement.scrollHeight;
    result['__docWidth'] = d.documentElement.scrollWidth;
    document.getElementById('out').textContent = JSON.stringify(result);
  }, 11000);
});
</script></body></html>
"""


def measure(width, height):
    probe_path = os.path.join(ROOT, '_layout_probe.html')
    with open(probe_path, 'w', encoding='utf-8') as handle:
        handle.write(PROBE % (width, height, json.dumps(LANDMARKS)))
    try:
        proc = subprocess.run([
            CHROME, '--headless=new', '--disable-gpu', '--no-sandbox',
            '--force-prefers-reduced-motion', '--virtual-time-budget=22000',
            '--dump-dom', 'http://localhost:5500/_layout_probe.html',
        ], capture_output=True, text=True, errors='replace')
        match = re.search(r'<pre id="out">(.*?)</pre>', proc.stdout, re.S)
        if not match or match.group(1).strip() == 'pending':
            raise SystemExit('probe did not report for width %d - is the server running?' % width)
        return json.loads(match.group(1).replace('&quot;', '"').replace('&amp;', '&'))
    finally:
        if os.path.exists(probe_path):
            os.remove(probe_path)


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ('before', 'after'):
        print(__doc__)
        return 2
    label = sys.argv[1]
    if not os.path.isdir(OUT_DIR):
        os.makedirs(OUT_DIR)

    data = {}
    for width, height in VIEWPORTS:
        print('  measuring at %dx%d...' % (width, height))
        data[str(width)] = measure(width, height)
    path = os.path.join(OUT_DIR, 'layout-%s.json' % label)
    json.dump(data, open(path, 'w'), indent=1)
    print('wrote %s' % os.path.relpath(path, ROOT))

    if label == 'before':
        print('\nbaseline saved - make your change, then run: python tools/compare-shots.py after')
        return 0

    before_path = os.path.join(OUT_DIR, 'layout-before.json')
    if not os.path.exists(before_path):
        print('no baseline to compare against')
        return 1
    before = json.load(open(before_path))

    problems = 0
    for width, height in VIEWPORTS:
        key = str(width)
        for sel in LANDMARKS + ['__docHeight', '__docWidth']:
            was, now = before[key].get(sel), data[key].get(sel)
            if was == now:
                continue
            if was is None or now is None:
                print('  %4dpx  %-28s %s -> %s' % (width, sel, was, now))
                problems += 1
                continue
            if isinstance(was, list):
                delta = [abs(a - b) for a, b in zip(was, now)]
                if max(delta) <= TOLERANCE:
                    continue
                print('  %4dpx  %-28s %s -> %s  (delta %s)' % (width, sel, was, now, delta))
            else:
                if abs(was - now) <= TOLERANCE:
                    continue
                print('  %4dpx  %-28s %s -> %s' % (width, sel, was, now))
            problems += 1

    print()
    if problems == 0:
        print('VERDICT: layout identical at %s' % ', '.join('%dx%d' % v for v in VIEWPORTS))
        return 0
    print('VERDICT: %d landmark(s) moved - inspect before accepting' % problems)
    return 1


if __name__ == '__main__':
    sys.exit(main())
