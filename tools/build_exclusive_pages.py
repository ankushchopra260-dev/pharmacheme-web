"""Make one page per paid item under /exclusive/<slug>/ from _data/exclusive.yml.
The page shows the public description; the content itself loads from Firestore for buyers (assets/js/exclusive.js).
Run: python3 tools/build_exclusive_pages.py"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_yaml(path):
    try:
        import yaml
        return yaml.safe_load(open(path, encoding='utf-8'))
    except ImportError:
        raise SystemExit('pip install pyyaml')


def main():
    data = load_yaml(os.path.join(ROOT, '_data', 'exclusive.yml'))
    groups = {g['key']: g for g in data['groups']}
    made = []
    for it in data['items']:
        d = os.path.join(ROOT, 'exclusive', it['slug']); os.makedirs(d, exist_ok=True)
        g = groups[it['group']]
        kind = {'articles': 'Article', 'concepts': 'Article', 'calculators': 'SoftwareApplication', 'templates': 'Product', 'excel': 'Product'}[it['group']]
        sd = {'@context': 'https://schema.org', '@type': kind, 'name': it['title'], 'description': it['short'],
              'url': 'https://www.pharmacheme.in/exclusive/' + it['slug'] + '/', 'isAccessibleForFree': False, 'inLanguage': 'en',
              'author': {'@type': 'Person', '@id': 'https://www.pharmacheme.in/about/#ankush-chopra', 'name': 'Ankush Chopra', 'url': 'https://www.pharmacheme.in/about/'},
              'offers': {'@type': 'Offer', 'price': str(it['price']), 'priceCurrency': 'INR', 'availability': 'https://schema.org/InStock', 'url': 'https://www.pharmacheme.in/exclusive/' + it['slug'] + '/'}}
        if kind == 'Article': sd['headline'] = it['title']; sd['hasPart'] = {'@type': 'WebPageElement', 'isAccessibleForFree': False, 'cssSelector': '.ex-content'}; sd.pop('offers')
        if kind == 'SoftwareApplication': sd['applicationCategory'] = 'EngineeringApplication'; sd['operatingSystem'] = 'Web browser'
        title = it['title'].replace('Pro: ', '').replace('Excel: ', 'Excel ')
        seo = (title[:52] + ' | PharmaChemE') if len(title) <= 52 else (title.split(':')[0][:52] + ' | PharmaChemE')
        desc = it['short'] + ' ₹' + str(it['price']) + ' by UPI.'
        if it['group'] == 'excel':
            cs = open(os.path.join(ROOT, it['calc'].strip('/'), 'index.html'), encoding='utf-8').read()
            ct = re.search(r'^title:\s*"?(.*?)"?\s*$', cs, re.M).group(1)
            crumbs = ['breadcrumbs:', '  - label: "Calculators"', '    url: /calculators/', f'  - label: {json.dumps(ct.split(" for ")[0].split(":")[0], ensure_ascii=False)}', f'    url: {it["calc"]}', '  - label: "Excel version"', f'    url: /exclusive/{it["slug"]}/']
        else:
            crumbs = ['breadcrumbs:', '  - label: "Exclusive content"', '    url: /exclusive/', f'  - label: {json.dumps(g["title"], ensure_ascii=False)}', f'    url: /exclusive/#{g["key"]}', f'  - label: {json.dumps(title.split(":")[0] if len(title) > 60 else title, ensure_ascii=False)}', f'    url: /exclusive/{it["slug"]}/']
        fm = ['---', 'layout: exclusive', f'item: {it["id"]}', f'title: {json.dumps(it["title"], ensure_ascii=False)}', f'seo_title: {json.dumps(seo, ensure_ascii=False)}',
              f'description: {json.dumps(desc, ensure_ascii=False)}', 'structured_data: |', '  ' + json.dumps(sd, ensure_ascii=False),
              *crumbs,
              'last_modified_at: 2026-10-29', '---', '']
        open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write('\n'.join(fm))
        made.append(it['slug'])
    print(len(made), 'pages')


if __name__ == '__main__':
    main()
