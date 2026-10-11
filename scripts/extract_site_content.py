# -*- coding: utf-8 -*-
"""
Generate the bilingual content layer from the reference build.

    python scripts/extract_site_content.py

Reads  src/pages/site/index.html  (the client's vetted single-file site)
Writes src/content/generated/<section>.json

Why a generator and not hand-transcription: the reference carries ~39,000 words
across 2,312 <span lang="hi">/<span lang="en"> pairs, 62 tables, 82 accordions
and 425 data-src citation refs. Copying that by hand would drift. This is
re-runnable, so a revised index.html costs one command instead of a re-port.

Every node keeps its `src` (data-src) so a claim can be traced back to the
source document it came from, and its class list so the renderer can style
.card / .recap / .illustrative the way the reference does.
"""
import json
import os
import re
import sys

from lxml import html as LH

SRC = 'src/pages/site/index.html'
OUT = 'src/content/generated'

# Tags allowed to survive inside a translated string. Measured, not guessed:
# only <strong> and <br> ever appear inside a lang span in this source.
INLINE = {'strong', 'em', 'b', 'i', 'br', 'sup', 'sub', 'small', 'code', 'abbr', 'span'}
SKIP = {'script', 'style'}
BLOCK = {'div', 'p', 'ul', 'ol', 'table', 'details', 'figure', 'blockquote',
         'aside', 'header', 'form', 'section', 'fieldset', 'img', 'canvas',
         'h2', 'h3', 'h4', 'h5'}

HEADINGS = ('h2', 'h3', 'h4', 'h5', 'p', 'figcaption', 'cite', 'caption')
FIELDS = ('type', 'name', 'placeholder', 'value', 'min', 'max', 'step',
          'required', 'inputmode', 'for', 'rows', 'data-err-hi', 'data-err-en')


def asset(src):
    """
    `assets/23.png` -> `/site-assets/23.jpg`

    scripts/optimize_assets.py writes the web-sized copies into public/, where
    Vite serves them at the site root. Everything lands as .jpg; these are all
    photographs, and nine of them shipped as multi-megabyte PNGs.
    """
    if not src:
        return src
    name = src.rsplit('/', 1)[-1]
    stem = name.rsplit('.', 1)[0]
    return '/site-assets/%s.jpg' % stem


def esc(s):
    return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def inline(el):
    """Element -> (hi, en) strings, with allowed inline tags preserved in both."""
    hi, en = [], []

    def push(h, e):
        hi.append(h)
        en.append(e)

    push(esc(el.text), esc(el.text))
    for ch in el:
        tag = ch.tag if isinstance(ch.tag, str) else None
        if tag in SKIP or tag == 'canvas':
            pass
        elif tag == 'span' and ch.get('lang') == 'hi':
            h, _ = inline(ch)
            cls = ch.get('class') or ''
            if 'hi-original' in cls:
                # A slogan the client keeps in Devanagari in BOTH views, with
                # an English gloss beside it:
                #   html[data-lang="en"] [lang="hi"]:not(.hi-original){display:none}
                # Dropping it from the English view would lose the line that
                # actually is the slogan. `.hi-original{font-weight:600}`.
                push('<strong>%s</strong>' % h, '<strong>%s</strong>' % h)
            else:
                push(h, '')
        elif tag == 'span' and ch.get('lang') == 'en':
            _, e = inline(ch)
            cls = ch.get('class') or ''
            if 'keep' in cls or 'gloss-always' in cls:
                # Exempt from being hidden in the Hindi view — an English brand
                # name or term the client wants shown either way.
                push(e, e)
            elif 'gloss' in cls:
                # The translation under an original. English view only;
                # `.gloss` renders muted and italic.
                # Leading space: the gloss sits inline right after the
                # original (`.taglines .gloss{display:inline;margin-left:.3em}`),
                # and without it the two run together — "विकसित भारतPROSPEROUS".
                push('', ' <em>%s</em>' % e)
            else:
                push('', e)
        elif tag == 'a':
            h, e = inline(ch)
            href = esc(ch.get('href', ''))
            push('<a href="%s">%s</a>' % (href, h), '<a href="%s">%s</a>' % (href, e))
        elif tag == 'br':
            push('<br/>', '<br/>')
        elif tag == 'span' and ch.get('data-src'):
            # A citation ref sitting on an inline fragment (an email address, a
            # phone number). Keep it in the string so the audit trail back to
            # the source document survives at fragment level too.
            h, e = inline(ch)
            ref = esc(ch.get('data-src'))
            push('<span data-src="%s">%s</span>' % (ref, h),
                 '<span data-src="%s">%s</span>' % (ref, e))
        elif tag in INLINE:
            h, e = inline(ch)
            push('<%s>%s</%s>' % (tag, h, tag), '<%s>%s</%s>' % (tag, e, tag))
        else:
            h, e = inline(ch)
            push(h, e)
        push(esc(ch.tail), esc(ch.tail))

    def clean(parts):
        return re.sub(r'\s+', ' ', ''.join(parts)).strip()

    return clean(hi), clean(en)


def txt(el):
    h, e = inline(el)
    return {'hi': h, 'en': e} if (h or e) else None


def meta(el, n):
    if el.get('data-src'):
        n['src'] = el.get('data-src')
    # An element that is itself one language — `<div lang="hi">` with a
    # `<div lang="en">` twin beside it. Where the pair is two plain text nodes
    # kids_of() merges them; where they wrap block content they cannot be
    # merged, so the language is recorded and the renderer shows only the
    # matching one.
    if el.get('lang') in ('hi', 'en'):
        n['lang'] = el.get('lang')
    cls = (el.get('class') or '').split()
    if cls:
        n['cls'] = cls
    if el.get('id'):
        n['id'] = el.get('id')
    return n


def table(el):
    def cells(tr):
        out = []
        for c in tr.xpath('./th|./td'):
            cell = {'text': txt(c) or {'hi': '', 'en': ''}}
            if c.tag == 'th':
                cell['th'] = True
            if c.get('colspan'):
                cell['colspan'] = int(c.get('colspan'))
            # The reference right-aligns these with tabular figures
            # (`table.data td[data-neutral], table.data .num`). 795 of 1065
            # body cells carry it, so dropping the flag would left-align most
            # of the numbers in the document.
            if c.get('data-neutral') is not None or 'num' in (c.get('class') or ''):
                cell['num'] = True
            out.append(cell)
        return out

    cap = el.xpath('./caption')
    return meta(el, {
        't': 'table',
        'caption': txt(cap[0]) if cap else None,
        'head': [cells(tr) for tr in el.xpath('./thead/tr')],
        'rows': [cells(tr) for tr in el.xpath('./tbody/tr')],
    })


def kids_of(el, skip_tag=None):
    """
    Children in order, pairing element-level translations as we go.

    Most of the document translates with inner `<span lang>` pairs, but 24
    places instead use two sibling ELEMENTS — `<p lang="hi">…</p><p
    lang="en">…</p>` — including Rohit's goal statement and the earnings
    disclaimer. Treated independently each becomes a node whose `en` holds the
    Hindi string, so both language versions render in both views. Merging the
    siblings into one node is what makes the toggle actually switch them.
    """
    out = []
    children = [c for c in el
                if isinstance(c.tag, str) and not (skip_tag and c.tag == skip_tag)]
    i = 0
    while i < len(children):
        cur = children[i]
        nxt = children[i + 1] if i + 1 < len(children) else None
        paired = (
            cur.get('lang') == 'hi'
            and nxt is not None
            and nxt.get('lang') == 'en'
            and nxt.tag == cur.tag
        )
        if paired:
            a, b = node(cur), node(nxt)
            if a and b and a.get('text') and b.get('text') and a['t'] == b['t']:
                a['text'] = {'hi': a['text']['hi'], 'en': b['text']['en']}
                a.pop('lang', None)  # merged: it is bilingual now
                out.append(a)
                i += 2
                continue
            # Not two simple text nodes — keep both rather than lose one.
            if a:
                out.append(a)
            if b:
                out.append(b)
            i += 2
            continue

        n = node(cur)
        if n:
            out.append(n)
        i += 1
    return out


def node(el):
    """One element -> one content node, or None to drop it."""
    tag = el.tag
    if not isinstance(tag, str) or tag in SKIP or tag == 'canvas':
        return None

    if tag in HEADINGS:
        t = txt(el)
        return meta(el, {'t': tag, 'text': t}) if t else None

    if tag == 'table':
        return table(el)

    if tag == 'img':
        return meta(el, {'t': 'img', 'file': asset(el.get('src')),
                         'alt': {'hi': el.get('data-alt-hi') or el.get('alt', ''),
                                 'en': el.get('data-alt-en') or el.get('alt', '')}})

    if tag in ('ul', 'ol'):
        items = []
        for li in el.xpath('./li'):
            inner = kids_of(li)
            structural = [k for k in inner
                          if k['t'] in ('h4', 'h5', 'ul', 'ol', 'table', 'details', 'figure', 'box')]
            it = meta(li, {'t': 'li'})
            if structural:
                it['children'] = inner
            else:
                it['text'] = txt(li)
            items.append(it)
        return meta(el, {'t': tag, 'items': items})

    if tag == 'details':
        s = el.xpath('./summary')
        return meta(el, {'t': 'details',
                         'summary': txt(s[0]) if s else None,
                         'children': kids_of(el, skip_tag='summary')})

    if tag == 'figure':
        n = meta(el, {'t': 'figure', 'children': kids_of(el)})
        cv = el.xpath('.//canvas')
        if cv:
            c = cv[0]
            n['chart'] = {
                'id': c.get('id'),
                'fallback': c.get('data-fallback'),
                'aria': {'hi': c.get('data-aria-hi') or c.get('aria-label') or '',
                         'en': c.get('data-aria-en') or c.get('aria-label') or ''},
            }
        return n

    if tag == 'a':
        t = txt(el)
        return meta(el, {'t': 'a', 'href': el.get('href'), 'text': t}) if t else None

    if tag in ('label', 'output', 'input', 'textarea', 'button'):
        n = meta(el, {'t': tag, 'text': txt(el)})
        for a in FIELDS:
            if el.get(a) is not None:
                n[a.replace('data-', '')] = el.get(a)
        return n

    # An element holding lang spans directly, with no block-level children, is
    # a text element however it is tagged — <blockquote>, <legend>, <s>, a bare
    # <div>. Falling through to the container branch below would turn each
    # language span into its own node with `en` set to the Hindi string, so the
    # English view would show Hindi. That is silent corruption: the word count
    # still looks right.
    if el.xpath('./span[@lang]') and not any(
            isinstance(c.tag, str) and c.tag in BLOCK for c in el):
        t = txt(el)
        return meta(el, {'t': 'p', 'text': t}) if t else None

    # Containers: section, div, header, aside, blockquote, form, thead/tbody.
    inner = kids_of(el)
    if not inner:
        t = txt(el)
        return meta(el, {'t': 'p', 'text': t}) if t else None
    kind = {'div': 'box', 'section': 'section'}.get(tag, tag)
    return meta(el, {'t': kind, 'children': inner})


def main():
    if not os.path.exists(SRC):
        sys.exit('missing %s' % SRC)
    root = LH.parse(SRC).getroot()
    os.makedirs(OUT, exist_ok=True)
    index = []
    for sec in root.xpath('//section[@id]'):
        sid = sec.get('id')
        tree = node(sec)
        blob = json.dumps(tree, ensure_ascii=False, indent=1)
        with open(os.path.join(OUT, '%s.json' % sid), 'w', encoding='utf-8') as f:
            f.write(blob)
        index.append(sid)
        print('  %-12s %9s bytes' % (sid, '{:,}'.format(len(blob))))
    # Contact details live in <footer class="site-footer">, not in a section,
    # but they are the whole of the Contact page — so the footer is extracted
    # as if it were a thirteenth section.
    for foot in root.xpath('//footer[contains(@class,"site-footer")]')[:1]:
        tree = node(foot)
        blob = json.dumps(tree, ensure_ascii=False, indent=1)
        with open(os.path.join(OUT, 'contact.json'), 'w', encoding='utf-8') as f:
            f.write(blob)
        index.append('contact')
        print('  %-12s %9s bytes' % ('contact', '{:,}'.format(len(blob))))

    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=1)
    print('\n%d sections -> %s' % (len(index), OUT))


if __name__ == '__main__':
    main()
