#!/usr/bin/env python3
"""Bake the rendered sections into index.html so crawlers see real content.

Every section of this site is built at runtime from data/*.js. Search engines
that execute JavaScript cope with that, but link-preview bots and simpler
crawlers see empty containers.

Rather than duplicating the template logic, this renders the page in headless
Chrome, asks the page for the finished markup of each container, and writes it
back into index.html. data/main.js still re-renders the same markup at runtime,
so the data files remain the single source of truth - this is a cache, not a fork.

Run it after changing anything in data/:

    python tools/prerender.py

Requires a local server on port 5500 (python -m http.server 5500) and Chrome.
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'index.html')
CHROME = os.environ.get('CHROME', r'C:\Program Files\Google\Chrome\Application\chrome.exe')

# Containers whose contents are safe to bake in. Carousels are included because
# the harvest script destroys the Owl instance first, restoring the plain markup.
CONTAINERS = [
    'navbar-links', 'about-social', 'education-list', 'experience-list',
    'skills-left', 'skills-right', 'projects-carousel', 'certification-carousel',
    'interest-list', 'extracurricular-carousel', 'footer-socials', 'footer-contact',
]

HARVEST = """
<pre id="harvest">pending</pre>
<script>
setTimeout(function () {
  // Undo vanilla-tilt: it injects .js-tilt-glare markup and inline transforms
  // into every .tilt element, none of which belongs in the static HTML.
  document.querySelectorAll('.tilt').forEach(function (el) {
    if (el.vanillaTilt && el.vanillaTilt.destroy) el.vanillaTilt.destroy();
  });
  document.querySelectorAll('.js-tilt-glare').forEach(function (el) { el.remove(); });

  // Undo Owl so the carousels report their original slides, not cloned ones.
  if (window.jQuery && jQuery.fn.owlCarousel) {
    jQuery('.owl-carousel').each(function () {
      var el = jQuery(this);
      if (el.hasClass('owl-loaded')) {
        el.trigger('destroy.owl.carousel');
        el.removeClass('owl-loaded owl-drag owl-hidden');
        el.find('.owl-stage-outer').children().unwrap();
        el.find('.owl-stage-outer').remove();
      }
    });
  }
  var ids = %s;
  var result = {};
  ids.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) { return; }
    // AOS state classes must not be baked in: without JS they would leave the
    // content at opacity 0 forever.
    el.querySelectorAll('.aos-init, .aos-animate').forEach(function (n) {
      n.classList.remove('aos-init', 'aos-animate');
      if (!n.className.trim()) n.removeAttribute('class');
    });
    el.querySelectorAll('[style*="visibility"], .owl-item, .owl-stage, .owl-nav, .owl-dots').forEach(function (n) {
      if (n.classList.contains('owl-nav') || n.classList.contains('owl-dots')) n.remove();
    });
    result[id] = el.innerHTML;
  });
  document.getElementById('harvest').textContent = JSON.stringify(result);
}, 9000);
</script>
"""


def harvest():
    probe = os.path.join(ROOT, '_prerender_probe.html')
    html = open(INDEX, encoding='utf-8').read()
    open(probe, 'w', encoding='utf-8').write(
        html.replace('</body>', (HARVEST % json.dumps(CONTAINERS)) + '</body>'))
    try:
        proc = subprocess.run([
            CHROME, '--headless=new', '--disable-gpu', '--no-sandbox',
            '--virtual-time-budget=20000', '--dump-dom',
            'http://localhost:5500/_prerender_probe.html',
        ], capture_output=True, text=True, errors='replace')
        match = re.search(r'<pre id="harvest">(.*?)</pre>', proc.stdout, re.S)
        if not match or match.group(1).strip() == 'pending':
            raise SystemExit('page did not report - is the server running on :5500?')
        raw = match.group(1)
        for entity, char in (('&lt;', '<'), ('&gt;', '>'), ('&amp;', '&'), ('&quot;', '"')):
            raw = raw.replace(entity, char)
        return json.loads(raw)
    finally:
        if os.path.exists(probe):
            os.remove(probe)


def replace_inner(html, element_id, inner):
    """Replace the inner HTML of the element carrying this id."""
    match = re.search(r'<(\w+)([^>]*\bid="%s"[^>]*)>' % re.escape(element_id), html)
    if not match:
        raise SystemExit('id="%s" not found in index.html' % element_id)
    tag = match.group(1)
    start = match.end()
    depth, i = 1, start
    open_re = re.compile(r'<%s\b' % tag, re.I)
    close_re = re.compile(r'</%s\s*>' % tag, re.I)
    while depth and i < len(html):
        nxt_open = open_re.search(html, i)
        nxt_close = close_re.search(html, i)
        if not nxt_close:
            raise SystemExit('unbalanced <%s> around id="%s"' % (tag, element_id))
        if nxt_open and nxt_open.start() < nxt_close.start():
            depth += 1
            i = nxt_open.end()
        else:
            depth -= 1
            i = nxt_close.end() if depth else nxt_close.start()
    return html[:start] + inner + html[i:]


def main():
    print('rendering...')
    data = harvest()
    html = open(INDEX, encoding='utf-8').read()

    baked = 0
    for element_id in CONTAINERS:
        inner = data.get(element_id)
        if not inner or not inner.strip():
            print('  %-26s EMPTY - skipped' % element_id)
            continue
        html = replace_inner(html, element_id, '\n' + inner.strip() + '\n')
        baked += 1
        print('  %-26s %6d chars' % (element_id, len(inner)))

    # Without JS, AOS never adds .aos-animate, and aos.css would keep every
    # [data-aos] element at opacity 0. Force them visible for no-JS visitors.
    guard = ('    <noscript>\n'
             '        <style>[data-aos] { opacity: 1 !important; transform: none !important; }</style>\n'
             '    </noscript>\n')
    if 'data-aos] { opacity: 1' not in html:
        html = html.replace('</head>', guard + '</head>')
        print('  added the no-JS visibility guard')

    open(INDEX, 'w', encoding='utf-8', newline='\n').write(html)
    print('\nbaked %d containers into index.html' % baked)
    return 0


if __name__ == '__main__':
    sys.exit(main())
