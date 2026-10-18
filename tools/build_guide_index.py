"""Rebuild the plant guide's search data (assets/data/site-search.json and solvent-facts.json).
Run from anywhere:  python3 tools/build_guide_index.py   (needs PyYAML)
Pages whose text is built by JavaScript keep their existing records; every other page is re-read."""
import os, re, json, html, yaml
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def clean(h):
    h = re.sub(r'<(script|style|svg|noscript)[\s\S]*?</\1>', ' ', h)
    h = re.sub(r'\{\{[^}]*\}\}|\{%[^%]*%\}', ' ', h)
    h = re.sub(r'<sub>(.*?)</sub>', r'\1', h); h = re.sub(r'<sup>(.*?)</sup>', r'^\1', h)
    t = re.sub(r'<[^>]+>', ' ', h); t = html.unescape(t).replace('−', '-')
    return re.sub(r'\s+', ' ', t).strip()

def kind(u):
    if u.startswith('/solvents/'): return 'Solvent data'
    if u.startswith('/gate/'): return 'GATE'
    if u.startswith('/process-modelling/'): return 'Tool'
    if u.startswith('/calculators/') and u != '/calculators/': return 'Calculator'
    if u.startswith('/utilities/') and u != '/utilities/': return 'Calculator'
    if u.startswith('/design-tools/') and u != '/design-tools/': return 'Tool'
    if u.startswith('/articles/') and u != '/articles/': return 'Article'
    if u.startswith('/process-safety/case-studies/'): return 'Case study'
    if u.startswith('/process-safety/'): return 'Process safety'
    if u.startswith('/games/'): return 'Game'
    if u.startswith('/molecules/'): return 'Molecule tool'
    return 'Page'

old = json.load(open(f'{R}/assets/data/site-search.json'))
JS_KINDS = {'Interview', 'Animation', 'Equipment', 'Instrument', 'Agitator', 'Videos', 'Plant tour'}
oldby = {}
for r in old: oldby.setdefault(r['u'].split('#')[0], []).append(r)
keep = [r for r in old if r['k'] in JS_KINDS]
keptids = set(id(r) for r in keep)
new = []
pages = []
for root, ds, fs in os.walk(R):
    rel = os.path.relpath(root, R)
    if rel.startswith(('_', '.', 'PCCPL', 'admin', 'get-test', 'assets')) or 'index.html' not in fs: continue
    s = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
    if not s.startswith('---'): continue
    fm = yaml.safe_load(s.split('---', 2)[1]) or {}
    if fm.get('noindex') or fm.get('sitemap') is False or fm.get('redirect_to'): continue
    u = '/' if rel == '.' else '/' + rel.replace(os.sep, '/') + '/'
    body = s.split('---', 2)[2]
    if u in oldby and len(clean(body)) < 400:   # text is rendered by JavaScript: keep what we had
        keep += [r for r in oldby[u] if id(r) not in keptids]; continue
    if u in oldby and all(r['k'] in JS_KINDS for r in oldby[u]) and u in ('/process-engineering-faq/', '/equipment-instruments/'):
        pass
    pages.append((u, fm, body))

for u, fm, body in sorted(pages):
    k = kind(u)
    h1 = re.search(r'<h1[^>]*>([\s\S]*?)</h1>', body)
    title = clean(h1.group(1)) if h1 else (fm.get('title') or 'PharmaChemE')
    desc = fm.get('description') or ''
    if u.startswith('/solvents/') and u != '/solvents/':
        rows = re.findall(r'<tr><th>([\s\S]*?)</th><td>([\s\S]*?)</td></tr>', body)
        facts = '. '.join(clean(a) + ': ' + clean(b) for a, b in rows)
        new.append({'t': title, 'u': u, 'k': k, 's': desc, 'x': facts[:1200], 'w': 'solvent properties data sheet'})
        continue
    if u == '/gate/practice/':
        for m in re.finditer(r'<div class="gs-item" id="(q-[\w-]+)">([\s\S]*?)</details></div>', body):
            qid, blk = m.group(1), m.group(2)
            q = re.search(r'<p class="gs-q">([\s\S]*?)</p>', blk); sec = None
            new.append({'t': clean(q.group(1))[:160] if q else 'GATE question', 'u': u + '#' + qid, 'k': 'GATE question', 's': 'GATE Chemical practice question', 'x': clean(blk)[:600], 'w': 'gate practice question'})
    text = clean(body)
    new.append({'t': title, 'u': u, 'k': k, 's': desc, 'x': text[:900], 'w': ('gate exam chemical engineering' if k == 'GATE' else 'process modelling simulation scale-up' if u.startswith('/process-modelling/') else '')})
    # sections by h2
    parts = re.split(r'<h[23]([^>]*)>([\s\S]*?)</h[23]>', body)
    for i in range(1, len(parts) - 2, 3):
        attrs, head, rest = parts[i], parts[i + 1], parts[i + 2]
        ht = clean(head)
        if not ht or ht.lower() in ('frequently asked questions', 'related', 'questions people ask', 'related articles', 'related calculators', 'try the calculators', 'try the tools', 'try the calculator'): continue
        idm = re.search(r'id="([^"]+)"', attrs)
        x = clean(rest)[:650]
        if len(x) < 40: continue
        new.append({'t': ht, 'u': u + ('#' + idm.group(1) if idm else ''), 'k': k, 's': title, 'x': x, 'w': '', 'h': 1})

# keep older records for regenerated pages that the new pass did not reproduce (sections built by JavaScript)
newkeys = set((r['u'], r['t'].lower()) for r in new); newpages = set(r['u'].split('#')[0] for r in new)
extra = [r for r in old if id(r) not in keptids and r['k'] not in JS_KINDS and r['u'].split('#')[0] in newpages and (r['u'], r['t'].lower()) not in newkeys and '#' in r['u']]
out = keep + new + extra
json.dump(out, open(f'{R}/assets/data/site-search.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('records', len(out), 'added', len(new), 'pages added', len(pages), 'size KB', os.path.getsize(f'{R}/assets/data/site-search.json') // 1024)


# ---------------- solvent facts ----------------
sw_txt = open(f'{R}/assets/js/swap-solvents.js', encoding='utf-8').read()
sw = {r[0]: r for r in json.loads(sw_txt[sw_txt.index('=') + 1:].strip().rstrip(';'))}
facts = []
for slug, r in sorted(sw.items()):
    body = open(f'{R}/solvents/{slug}/index.html', encoding='utf-8').read()
    rows = dict((clean(a), clean(b)) for a, b in re.findall(r'<tr><th>([\s\S]*?)</th><td>([\s\S]*?)</td></tr>', body))
    name = r[1]; short = name.split(' (')[0]; abbr = name.split('(')[1].rstrip(')') if '(' in name else ''
    also = re.search(r'Also called ([^.<]+)\.', body)
    al = [short, abbr] + ([a.strip() for a in re.split(r',\s|;|/| or ', also.group(1)) if a.strip()] if also else [])
    facts.append({'n': name, 's': slug, 'a': sorted(set(a for a in al if len(a) >= 2 and 'isomer' not in a), key=len, reverse=True), 'f': rows, 'ant': [r[4], r[5], r[6]]})
json.dump(facts, open(f'{R}/assets/data/solvent-facts.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('solvents', len(facts))
