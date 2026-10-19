"""Append ?v=<build time> to local CSS/JS links so browsers fetch fresh files after each deploy.
Run after regenerating pages (safe to run repeatedly)."""
import os, re
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "?v={{ site.time | date: '%s' }}"
P1 = re.compile(r"(\{\{ '/assets/(?:js|css)/[^'?]+\.(?:js|css)' \| relative_url \}\})(?!\?v=)")
P2 = re.compile(r'((?:src|href)="/assets/(?:js|css)/[^"?]+\.(?:js|css))(?=")')
n = 0
for root, ds, fs in os.walk(R):
    rel = os.path.relpath(root, R)
    if rel.startswith(('_site', '.git', 'tools', 'node_modules')): continue
    for f in fs:
        if not f.endswith('.html'): continue
        p = os.path.join(root, f); s = open(p, encoding='utf-8').read()
        if not (s.startswith('---') or rel.startswith(('_layouts', '_includes'))): continue
        t, a = P1.subn(lambda m: m.group(1) + V, s); t, b = P2.subn(lambda m: m.group(1) + V, t)
        if a + b: open(p, 'w', encoding='utf-8').write(t); n += a + b
print('cache-bust refs added', n)
