#!/usr/bin/env python3
"""PharmaChemE: tell Bing and the other IndexNow engines which pages changed, so they recrawl in minutes.

    python3 tools/indexnow.py --changed BEFORE AFTER   pages added, changed or deleted between two commits
    python3 tools/indexnow.py --all                    every public page (first run, or after a big change)
    add --dry-run to print the list without sending.

Only public pages are sent. A page is skipped if it is in a private folder, has no front matter, sets
noindex or sitemap: false, or carries a robots noindex meta tag. Changes to shared files (_layouts,
_includes, _data, assets) are not expanded into every page; use --all for those.
"""
import json, os, re, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = 'www.pharmacheme.in'
ENDPOINT = 'https://api.indexnow.org/indexnow'
PRIVATE = ('PCCPL-LALRU/', 'admin/', 'get-test/', 'gate/test-series/admin/', 'sales/', 'offline/', 'tools/', 'assets/', 'node_modules/')


def key():
    for f in os.listdir(ROOT):
        m = re.fullmatch(r'([0-9a-f]{32})\.txt', f)
        if m and open(os.path.join(ROOT, f)).read().strip() == m.group(1):
            return m.group(1)
    sys.exit('IndexNow key file not found at the repo root')


def git(*a):
    return subprocess.run(['git', *a], cwd=ROOT, capture_output=True, text=True).stdout


def url_of(path):
    if not path.endswith('index.html') or path.startswith(('_', '.')) or path.startswith(PRIVATE):
        return None
    return 'https://' + HOST + '/' + path[:-len('index.html')]


def public(text):
    if not text.startswith('---'):
        return False                                   # raw HTML with no front matter: not a site page
    fm = text.split('---', 2)[1]
    if re.search(r'^(noindex:\s*true|sitemap:\s*false)\s*$', fm, re.M):
        return False
    if re.search(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', text, re.I):
        return False
    return True


def all_pages():
    out = []
    for d, _, fs in os.walk(ROOT):
        for f in fs:
            p = os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/')
            u = url_of(p)
            if u and public(open(os.path.join(ROOT, p), encoding='utf-8', errors='ignore').read()):
                out.append(u)
    return sorted(set(out))


def changed(before, after):
    if not before or set(before) == {'0'}:
        before = after + '~1'
    out = []
    for line in git('diff', '--name-status', '--no-renames', before, after).splitlines():
        st, p = line.split('\t', 1)
        u = url_of(p)
        if not u:
            continue
        if st.startswith('D'):
            old = git('show', before + ':' + p)            # deleted: send it so engines drop it, if it was public
            if public(old):
                out.append(u)
        elif public(open(os.path.join(ROOT, p), encoding='utf-8', errors='ignore').read()):
            out.append(u)
    return sorted(set(out))


def send(urls, k):
    body = json.dumps({'host': HOST, 'key': k, 'keyLocation': 'https://' + HOST + '/' + k + '.txt', 'urlList': urls}).encode()
    req = urllib.request.Request(ENDPOINT, data=body, headers={'Content-Type': 'application/json; charset=utf-8'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code


def main():
    a = sys.argv[1:]
    dry = '--dry-run' in a
    if '--all' in a:
        urls = all_pages()
    elif '--changed' in a:
        i = a.index('--changed')
        urls = changed(a[i + 1], a[i + 2])
    else:
        sys.exit(__doc__)
    print(len(urls), 'URL(s)')
    for u in urls[:20]:
        print('  ' + u)
    if len(urls) > 20:
        print('  ... and', len(urls) - 20, 'more')
    if dry or not urls:
        return
    k = key()
    for i in range(0, len(urls), 10000):
        code = send(urls[i:i + 10000], k)
        meaning = {200: 'accepted', 202: 'accepted, key check pending', 400: 'bad request', 403: 'key not valid (is the key file live?)',
                   422: 'URLs do not match the host or key', 429: 'too many requests'}.get(code, 'unexpected')
        print('IndexNow:', code, meaning)
        if code not in (200, 202):
            sys.exit(1)


if __name__ == '__main__':
    main()
