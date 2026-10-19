#!/usr/bin/env python3
"""PharmaChemE: date stamps and author links for search engines.

Run from the repo root before every commit (after any page generator):
    python3 tools/seo_stamp.py

For every public page it:
  * sets `last_modified_at` in the front matter (jekyll-sitemap turns it into
    <lastmod>, and the layout prints "Last updated" from it). The date is the
    last human commit that changed the page, or today if the page has
    uncommitted edits. Stamp-only differences do not count as edits, so the
    script is idempotent.
  * in Article / LearningResource JSON-LD: links the author to the Person on
    the About page, links the publisher to the Organization, sets
    dateModified, and fills a missing datePublished with the page's first
    commit date.
"""
import datetime, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://www.pharmacheme.in'
PERSON = {'@type': 'Person', '@id': SITE + '/about/#ankush-chopra', 'name': 'Ankush Chopra', 'url': SITE + '/about/'}
ORG = {'@type': 'Organization', '@id': SITE + '/#organization', 'name': 'PharmaChemE', 'url': SITE + '/'}
SKIP_DIRS = ('PCCPL-LALRU', 'admin', 'get-test', 'assets', 'tools', '_layouts', '_includes', '_data', 'node_modules', '.git', '.github')
TODAY = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30))).date().isoformat()


def git(*args):
    return subprocess.run(['git', *args], cwd=ROOT, capture_output=True, text=True).stdout


def normalise(text):
    """Page content without the parts this script or cache_bust.py write."""
    text = re.sub(r'^structured_data: *\|\n(?:(?:  .*)?\n)+', '', text, flags=re.M)
    text = re.sub(r'^last_modified_at:.*\n', '', text, flags=re.M)
    text = re.sub(r"\?v=\{\{ *site\.time[^}]*\}\}", '', text)
    return re.sub(r'\s+', '', text)


def page_dates(rel, text):
    """(first published, last real content change) for one page."""
    log = [l.split() for l in git('log', '--format=%H %cs %an', '--follow', '--', rel).splitlines() if l.strip()]
    if not log:
        return TODAY, TODAY
    first = log[-1][1]
    current = normalise(text)
    if current != normalise(git('show', 'HEAD:' + rel)):
        return first, TODAY
    # walk back to the newest commit that changed the content itself
    for i, (sha, day, author) in enumerate(log):
        before = normalise(git('show', sha + '^:' + rel)) if i + 1 < len(log) else None
        if before != normalise(git('show', sha + ':' + rel)):
            return first, day
    return first, first


def fix_ld(node, first, last):
    if isinstance(node, list):
        for n in node:
            fix_ld(n, first, last)
        return
    if not isinstance(node, dict):
        return
    if isinstance(node.get('author'), dict) and node['author'].get('name') == 'Ankush Chopra':
        node['author'] = dict(PERSON)
    if isinstance(node.get('publisher'), dict) and node['publisher'].get('name') == 'PharmaChemE':
        node['publisher'] = dict(ORG)
    if node.get('@type') in ('Article', 'TechArticle', 'LearningResource', 'BlogPosting'):
        node.setdefault('datePublished', first)
        node['dateModified'] = last
    for k, v in list(node.items()):
        if k not in ('author', 'publisher') and isinstance(v, (dict, list)):
            fix_ld(v, first, last)


def process(rel):
    path = os.path.join(ROOT, rel)
    text = open(path, encoding='utf-8').read()
    if not text.startswith('---\n'):
        return False
    end = text.find('\n---', 4)
    if end < 0:
        return False
    fm, body = text[4:end + 1], text[end + 1:]
    if re.search(r'^(noindex: *true|sitemap: *false)', fm, re.M):
        return False
    first, last = page_dates(rel, text)
    m = re.search(r'^structured_data: *\|\n((?:(?:  .*)?\n)+)', fm, re.M)
    if m:
        try:
            data = json.loads(m.group(1))
        except ValueError:
            data = None
        if data is not None:
            fix_ld(data, first, last)
            block = 'structured_data: |\n' + '\n'.join('  ' + l for l in json.dumps(data, indent=2, ensure_ascii=False).splitlines()) + '\n'
            fm = fm[:m.start()] + block + fm[m.end():]
    if re.search(r'^last_modified_at:', fm, re.M):
        fm = re.sub(r'^last_modified_at:.*$', 'last_modified_at: ' + last, fm, flags=re.M)
    else:
        fm = fm.rstrip('\n') + '\nlast_modified_at: ' + last + '\n'
    new = '---\n' + fm + body
    if new != text:
        open(path, 'w', encoding='utf-8').write(new)
        return True
    return False


def main():
    changed = 0
    for dp, dns, fns in os.walk(ROOT):
        rel_dir = os.path.relpath(dp, ROOT)
        if rel_dir.split(os.sep)[0] in SKIP_DIRS:
            dns[:] = []
            continue
        for fn in fns:
            if fn.endswith(('.html', '.md')) and fn != 'README.md':
                rel = os.path.normpath(os.path.join(rel_dir, fn))
                if process(rel):
                    changed += 1
    print('seo_stamp: pages updated', changed)


if __name__ == '__main__':
    sys.exit(main())
