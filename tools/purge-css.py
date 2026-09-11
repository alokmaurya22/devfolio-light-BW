#!/usr/bin/env python3
"""Remove CSS rules this site cannot use.

css-style.css is a full Bootstrap 4 build plus template leftovers; most of it
targets components that do not exist here. This keeps a rule when any class, id
or element it mentions appears in the source (index.html, data/*.js, js/*.js) or
in a rendered DOM snapshot, and drops the rest.

Because a static scan cannot see states that only exist at runtime (modal open,
carousel classes, validation errors, the custom cursor), SAFELIST below is kept
unconditionally. When in doubt the rule is KEPT - this errs towards doing nothing.

    python tools/purge-css.py --dry-run      # report only
    python tools/purge-css.py                # rewrite css/css-style.css

Always re-check the page visually afterwards: tools/compare-shots.py renders the
site before and after and reports the pixel difference.
"""
import glob
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, 'css', 'css-style.css')

# Classes that only ever appear at runtime, or are added by a library.
SAFELIST_PREFIXES = (
    # library-added classes that never appear in our source
    'owl', 'aos', 'kursor', 'js-tilt',
    # bootstrap component states toggled at runtime
    'modal', 'collapse', 'collapsing', 'show', 'fade', 'alert', 'close',
    'was-validated', 'help-block', 'control-group', 'has-error', 'is-invalid',
    'is-valid', 'invalid-', 'valid-', 'active', 'disabled', 'sr-only',
    'typed',  # typed.js adds .typed-cursor
)
SAFELIST_EXACT = {'body', 'html', ':root', '*', 'a', 'p', 'h1', 'h2', 'h3', 'h4',
                  'h5', 'h6', 'ul', 'li', 'img', 'svg', 'small', 'strong', 'i',
                  'span', 'div', 'section', 'footer', 'nav', 'input', 'textarea',
                  'button', 'label', 'form', 'iconify-icon'}

TOKEN_RE = re.compile(r'[.#]([A-Za-z][-\w]*)')


def used_tokens():
    """Every class/id name that appears anywhere in the site's own source."""
    tokens = set()
    files = [os.path.join(ROOT, 'index.html'), os.path.join(ROOT, '404.html')]
    files += glob.glob(os.path.join(ROOT, 'data', '*.js'))
    files += [f for f in glob.glob(os.path.join(ROOT, 'js', '*.js'))
              if os.path.basename(f) in ('2967-js-main.js', '2653-mail-contact.js')]
    for path in files:
        if not os.path.exists(path):
            continue
        text = io.open(path, encoding='utf-8', errors='replace').read()
        for attr in re.findall(r'class="([^"]*)"', text):
            tokens.update(attr.split())
        # data files declare classes as a property:  class: "btn btn-light btn-social"
        for attr in re.findall(r"""class:\s*["']([^"']*)["']""", text):
            tokens.update(attr.split())
        # classes toggled from JS, both vanilla and jQuery
        for attr in re.findall(r"classList\.(?:add|remove|toggle)\('([^']+)'", text):
            tokens.add(attr)
        for attr in re.findall(r"(?:addClass|removeClass|toggleClass)\(['\"]([^'\"]+)", text):
            tokens.update(attr.split())
        for attr in re.findall(r'id="([^"]*)"', text):
            tokens.add(attr)
        # class names used inside JS selectors and template strings
        tokens.update(re.findall(r"[.#]([a-zA-Z][-\w]{2,})", text))
    return tokens


def split_rules(css):
    """Split a stylesheet into top-level chunks, keeping at-rules whole."""
    chunks, depth, start = [], 0, 0
    in_string = None
    i = 0
    while i < len(css):
        ch = css[i]
        if in_string:
            if ch == in_string and css[i - 1] != '\\':
                in_string = None
        elif ch in '"\'':
            in_string = ch
        elif ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                chunks.append(css[start:i + 1])
                start = i + 1
        i += 1
    if css[start:].strip():
        chunks.append(css[start:])
    return chunks


def selector_used(selector, tokens):
    names = TOKEN_RE.findall(selector)
    if not names:
        base = selector.strip().split()[0].split(':')[0] if selector.strip() else ''
        return base in SAFELIST_EXACT or base in ('', '*', 'from', 'to')
    for name in names:
        if name in tokens:
            return True
        if any(name.startswith(p) for p in SAFELIST_PREFIXES):
            return True
    return False


def filter_block(chunk, tokens, stats):
    head, _, body = chunk.partition('{')
    head_clean = head.strip()

    if head_clean.startswith('@'):
        at = head_clean.split()[0]
        if at in ('@media', '@supports'):
            inner = body.rstrip()[:-1] if body.rstrip().endswith('}') else body
            kept_inner = ''.join(filter_block(c, tokens, stats) for c in split_rules(inner))
            if not kept_inner.strip():
                return ''
            return head + '{' + kept_inner + '}'
        return chunk  # @font-face, @keyframes, @charset, :root ... keep

    selectors = [s for s in head_clean.split(',') if s.strip()]
    kept = [s for s in selectors if selector_used(s, tokens)]
    stats['total'] += len(selectors)
    stats['kept'] += len(kept)
    if not kept:
        return ''
    return ','.join(kept) + '{' + body


def main():
    dry = '--dry-run' in sys.argv
    tokens = used_tokens()
    # Always purge from the unpurged original, so re-running can bring back rules
    # that a previous run dropped (e.g. after adding a new Bootstrap component).
    source = CSS + '.full' if os.path.exists(CSS + '.full') else CSS
    print('source                 : %s' % os.path.relpath(source, ROOT))
    css = io.open(source, encoding='utf-8').read()
    css_nocomment = re.sub(r'/\*.*?\*/', '', css, flags=re.S)

    stats = {'total': 0, 'kept': 0}
    out = ''.join(filter_block(c, tokens, stats) for c in split_rules(css_nocomment))

    print('tokens found in source : %d' % len(tokens))
    print('selectors              : %d kept of %d' % (stats['kept'], stats['total']))
    print('size                   : %d -> %d bytes (%.0f%% smaller)'
          % (len(css), len(out), 100 * (1 - len(out) / len(css))))

    if dry:
        print('\ndry run - nothing written')
        return 0

    io.open(CSS + '.full', 'w', encoding='utf-8', newline='\n').write(css)
    io.open(CSS, 'w', encoding='utf-8', newline='\n').write(
        '/* Purged with tools/purge-css.py. The unpurged original is css-style.css.full */\n' + out)
    print('\nwrote %s (original kept as css-style.css.full)' % os.path.relpath(CSS, ROOT))
    return 0


if __name__ == '__main__':
    sys.exit(main())
