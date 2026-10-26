"""Generate a calculator page that uses the PharmaChemE calculator kit (assets/js/pce-kit.js).

page(path, title, seo, desc, h1, lede, calcs, body, faqs, related, scripts, crumbs=None, jump=None)
  path     folder relative to the site root, e.g. 'calculators/steam-tables'
  calcs    list of calculator ids registered with PCEKit.add (each gets a card)
  body     HTML for the guide below the calculators (Liquid relative_url allowed)
  faqs     [(question, answer)] (plain text) -> FAQPage structured data and an FAQ section
  related  [(url, label)]
  scripts  JS files under /assets/js/ to load after pce-kit.js (order matters)
"""
import json, os, html, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def page(path, title, seo, desc, h1, lede, calcs, body, faqs, related, scripts, crumbs=None, jump=None, keywords=''):
    assert len(seo) <= 62, ('seo_title too long', len(seo), seo)
    assert len(desc) <= 158, ('description too long', len(desc), desc)
    url = '/' + path.strip('/') + '/'
    crumbs = crumbs or [('Calculators', '/calculators/')]
    sd = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebApplication", "name": h1, "url": "https://www.pharmacheme.in" + url, "applicationCategory": "EngineeringApplication",
         "operatingSystem": "Any", "description": desc, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "INR"},
         "publisher": {"@type": "Organization", "@id": "https://www.pharmacheme.in/#organization", "name": "PharmaChemE", "url": "https://www.pharmacheme.in/"}}]}
    if faqs:
        sd["@graph"].append({"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]})
    fm = ['---', 'layout: default', 'title: ' + json.dumps(title), 'seo_title: ' + json.dumps(seo), 'description: ' + json.dumps(desc)]
    if keywords:
        fm.append('keywords: ' + json.dumps(keywords))
    fm.append('structured_data: |')
    fm += ['  ' + line for line in json.dumps(sd, indent=2, ensure_ascii=False).split('\n')]
    fm.append('breadcrumbs:')
    for label, u in crumbs + [(h1, url)]:
        fm += ['  - label: ' + json.dumps(label), '    url: ' + u]
    fm.append('last_modified_at: ' + datetime.date.today().isoformat())
    fm.append('---')
    css = "{{ '/assets/css/%s' | relative_url }}?v={{ site.time | date: '%%s' }}"
    js = "{{ '/assets/js/%s' | relative_url }}?v={{ site.time | date: '%%s' }}"
    out = '\n'.join(fm) + '\n'
    out += '<link rel="stylesheet" href="%s">\n<link rel="stylesheet" href="%s">\n\n' % (css % 'utilities.css', css % 'pce-kit.css')
    out += '<div class="container ut-head">\n  <h1>%s</h1>\n  <p>%s</p>\n' % (h1, lede)
    if jump:
        out += '  <ul class="ut-jump">%s</ul>\n' % ''.join('<li><a href="#%s">%s</a></li>' % (a, html.escape(b)) for a, b in jump)
    out += '</div>\n\n<div class="container ut-grid">\n'
    out += ''.join('  <div class="ut-calc pk-calc" id="%s" data-calc="%s"></div>\n' % (c, c) for c in calcs)
    out += '</div>\n\n<div class="container article-body" id="guide" style="margin-top:28px;">\n' + body.strip() + '\n'
    if faqs:
        out += '\n  <h2 id="faq">Frequently asked questions</h2>\n' + ''.join('  <h3>%s</h3>\n  <p>%s</p>\n' % (html.escape(q), html.escape(a)) for q, a in faqs)
    if related:
        out += '\n  <div class="related-box">\n    <h3>Related</h3>\n' + ''.join("    <a href=\"{{ '%s' | relative_url }}\">%s</a>\n" % (u, html.escape(l)) for u, l in related) + '  </div>\n'
    out += '</div>\n\n'
    out += ''.join('<script src="%s"></script>\n' % (js % s) for s in ['pce-kit.js'] + scripts)
    os.makedirs(os.path.join(ROOT, path), exist_ok=True)
    open(os.path.join(ROOT, path, 'index.html'), 'w').write(out)
    return url
