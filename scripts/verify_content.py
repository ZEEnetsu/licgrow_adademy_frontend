# -*- coding: utf-8 -*-
"""
Guard against a silently lossy port.

    python scripts/verify_content.py

Takes every <span lang="hi"> and <span lang="en"> string in the reference and
asserts it survives into src/content/generated/*.json. A section that quietly
drops a table cell or an accordion body would otherwise look fine in the
browser and only surface when someone goes looking for a specific claim.

Substring, not equality: a parent node's string legitimately contains its
children's, so the test is that each source string appears SOMEWHERE in the
generated text for that language.
"""
import json
import os
import re
import sys

from lxml import html as LH

SRC = 'src/pages/site/index.html'
OUT = 'src/content/generated'


def norm(s):
    s = re.sub(r'<[^>]+>', '', s or '')
    s = s.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    return re.sub(r'\s+', ' ', s).strip()


def collect(obj, lang, bag):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, dict) and lang in v and isinstance(v.get(lang), str):
                bag.append(norm(v[lang]))
            else:
                collect(v, lang, bag)
    elif isinstance(obj, list):
        for v in obj:
            collect(v, lang, bag)


def main():
    root = LH.parse(SRC).getroot()
    generated = []
    for f in sorted(os.listdir(OUT)):
        if f.endswith('.json') and f != 'index.json':
            with open(os.path.join(OUT, f), encoding='utf-8') as fh:
                generated.append((f, json.load(fh)))

    failures = 0
    for lang in ('hi', 'en'):
        bag = []
        for _, tree in generated:
            collect(tree, lang, bag)
        haystack = '\n'.join(bag)

        sources = []
        for sp in root.xpath('//section//span[@lang="%s"]' % lang):
            t = norm(sp.text_content())
            if t:
                sources.append(t)

        missing = [t for t in sources if t not in haystack]
        uniq = sorted(set(missing))
        print('%s: %d source strings, %d distinct generated strings, %d missing'
              % (lang, len(sources), len(set(bag)), len(uniq)))
        for t in uniq[:12]:
            print('    MISSING: %s' % t[:110])
        if len(uniq) > 12:
            print('    ... and %d more' % (len(uniq) - 12))
        failures += len(uniq)

    # Structural counts should match the source exactly.
    print('\nstructural parity:')
    for label, xp, key in (('tables', '//section//table', 'table'),
                           ('details', '//section//details', 'details'),
                           ('figures', '//section//figure', 'figure'),
                           ('images', '//section//img', 'img')):
        want = len(root.xpath(xp))
        got = sum(json.dumps(t, ensure_ascii=False).count('"t": "%s"' % key)
                  for _, t in generated)
        flag = 'ok' if want == got else 'MISMATCH'
        print('  %-9s source=%-4d generated=%-4d %s' % (label, want, got, flag))
        if want != got:
            failures += 1

    srcs = set()
    for sp in root.xpath('//section//*[@data-src]'):
        srcs.update(sp.get('data-src').split())
    kept = set()
    for _, t in generated:
        blob = json.dumps(t, ensure_ascii=False)
        # Node-level refs, plus refs kept inline inside a translated string.
        for m in re.finditer(r'"src": "([^"]+)"', blob):
            kept.update(m.group(1).split())
        for m in re.finditer(r'data-src=\\"([^\\"]+)\\"', blob):
            kept.update(m.group(1).split())
    print('  data-src  source=%-4d generated=%-4d %s'
          % (len(srcs), len(kept), 'ok' if srcs <= kept else 'MISSING %s' % sorted(srcs - kept)[:5]))

    # Pairing check. A node whose English string IS the Hindi string, where the
    # Hindi carries Devanagari, means the two languages were collapsed into one
    # — the English reader gets shown Hindi. This is the failure mode that word
    # counts and structural parity both miss, because nothing is missing: the
    # wrong string is simply sitting in the other language's slot.
    devanagari = re.compile(r'[ऀ-ॿ]')
    collapsed = []

    def pairs(obj):
        if isinstance(obj, dict):
            if isinstance(obj.get('hi'), str) and isinstance(obj.get('en'), str):
                h, e = norm(obj['hi']), norm(obj['en'])
                if h and h == e and devanagari.search(h):
                    collapsed.append(h)
            for v in obj.values():
                pairs(v)
        elif isinstance(obj, list):
            for v in obj:
                pairs(v)

    for _, tree in generated:
        pairs(tree)

    # Not expected to be zero: the client deliberately keeps some Hindi in the
    # English view (`.hi-original` taglines and proverbs), and those legitimately
    # pair with themselves. The source's own count is the budget.
    allowed = len(root.xpath('//*[contains(@class,"hi-original")]'))
    distinct = sorted(set(collapsed))
    print('\npairing: %d collapsed hi==en strings (budget from .hi-original: %d)'
          % (len(distinct), allowed))
    for t in distinct[:8]:
        print('    COLLAPSED: %s' % t[:100])
    if len(distinct) > allowed:
        failures += 1

    print('\n%s' % ('PASS' if failures == 0 else 'FAIL: %d problems' % failures))
    sys.exit(1 if failures else 0)


if __name__ == '__main__':
    main()
