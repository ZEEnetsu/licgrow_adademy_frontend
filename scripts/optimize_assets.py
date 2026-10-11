# -*- coding: utf-8 -*-
"""
Prepare the reference's images for the web.

    python scripts/optimize_assets.py

src/pages/site/assets -> public/site-assets

The source ships 18.6 MB of images: nine photographic 1920x1080 collages saved
as PNG, which is the wrong container for photographs — one of them is 3.3 MB on
its own. At that weight the Explore section alone would outweigh every other
asset on the site combined.

They go to public/ rather than through the bundler because the paths live in
generated JSON, which Vite cannot rewrite into module imports.
"""
import os
import sys

from PIL import Image

SRC = 'src/pages/site/assets'
OUT = 'public/site-assets'
MAX_WIDTH = 1400
QUALITY = 82


def main():
    if not os.path.isdir(SRC):
        sys.exit('missing %s' % SRC)
    os.makedirs(OUT, exist_ok=True)

    before = after = 0
    rows = []
    for name in sorted(os.listdir(SRC)):
        src = os.path.join(SRC, name)
        if not os.path.isfile(src):
            continue
        stem, _ = os.path.splitext(name)
        dst = os.path.join(OUT, stem + '.jpg')

        im = Image.open(src)
        if im.mode not in ('RGB', 'L'):
            im = im.convert('RGB')
        if im.width > MAX_WIDTH:
            h = round(im.height * MAX_WIDTH / im.width)
            im = im.resize((MAX_WIDTH, h), Image.LANCZOS)
        im.save(dst, 'JPEG', quality=QUALITY, optimize=True, progressive=True)

        # Several of the ddl-* photos are already well-compressed JPEGs at a
        # sensible size; re-encoding them at q82 makes them bigger. Keep the
        # original whenever our version is not actually an improvement.
        if os.path.getsize(dst) >= os.path.getsize(src) and src.lower().endswith(
                ('.jpg', '.jpeg')):
            with open(src, 'rb') as fh_in, open(dst, 'wb') as fh_out:
                fh_out.write(fh_in.read())

        a, b = os.path.getsize(src), os.path.getsize(dst)
        before += a
        after += b
        rows.append((name, stem + '.jpg', a, b, im.size))

    for name, out_name, a, b, size in rows:
        print('  %-30s -> %-26s %6.2f MB -> %5.0f KB  %dx%d'
              % (name, out_name, a / 1048576, b / 1024, size[0], size[1]))
    print('\n  %.1f MB -> %.1f MB  (%.0f%% smaller)'
          % (before / 1048576, after / 1048576, (1 - after / before) * 100))


if __name__ == '__main__':
    main()
