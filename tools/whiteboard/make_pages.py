"""Writes whiteboard/<slug>/index.html for the lessons below and the hub page whiteboard/index.html.
Run after the lesson JSON is built:  python3 tools/whiteboard/make_pages.py
The NPSH page (whiteboard/npsh-cavitation/) is kept by hand; it is listed on the hub from HUB below."""
import html, importlib, json, os, sys

HERE = os.path.dirname(__file__)
sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SITE = 'https://www.pharmacheme.in'
TODAY = '2026-11-22'

PAGES = {
    'heat-exchangers': dict(
        module='heat_exchangers',
        h1='Heat Exchangers: Whiteboard Lesson',
        seo_title='Heat Exchangers Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on heat exchangers: LMTD, fouling, tube velocity, tube or shell side, waterlogged steam heaters and venting.',
        intro='Six questions on how heat exchangers work and why they stop working: counter-current flow, fouling, water velocity, which fluid goes in the tubes, flooded steam heaters and air in coolers.',
        keywords='heat exchanger explained, LMTD explained, counter-current vs co-current, exchanger fouling, tube side or shell side, steam heater waterlogging, heat exchanger interview questions',
        teaches=['Log mean temperature difference', 'Heat exchanger fouling', 'Shell-and-tube exchanger design'],
        image='/assets/img/share/whiteboard-heat-exchangers.jpg',
        related=[('/calculators/lmtd-calculator/', 'LMTD calculator'),
                 ('/calculators/overall-heat-transfer-coefficient-calculator/', 'Overall heat transfer coefficient calculator'),
                 ('/articles/heat-exchanger-design-basics/', 'Heat exchanger design basics')]),
    'runaway-reactions': dict(
        module='runaway_reactions',
        h1='Runaway Reactions: Whiteboard Lesson',
        seo_title='Runaway Reactions Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on runaway reactions: heat made vs removed, accumulation, MTSR, adiabatic rise, agitator trips and boiling as a barrier.',
        intro='Six questions on why exothermic batches run away and how plants stop it: heat made against heat removed, accumulation in semi-batch dosing, adiabatic temperature rise, agitator trips and what happens when cooling fails.',
        keywords='runaway reaction explained, thermal runaway batch reactor, accumulation semi-batch, MTSR, adiabatic temperature rise, agitator failure dosing, process safety interview questions',
        teaches=['Thermal runaway', 'Reagent accumulation in semi-batch reactions', 'Adiabatic temperature rise'],
        image='/assets/img/share/whiteboard-runaway-reactions.jpg',
        related=[('/calculators/heat-of-reaction-calculator/', 'Heat of reaction calculator'),
                 ('/articles/semi-batch-dosing-accumulation/', 'Semi-batch dosing and accumulation'),
                 ('/articles/how-to-read-dsc-arc-rc1-tsu/', 'How to read thermal safety test data')]),
    'distillation-basics': dict(
        module='distillation_basics',
        h1='Distillation Basics: Whiteboard Lesson',
        seo_title='Distillation Basics Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on distillation: reflux ratio, minimum reflux, flooding, weeping, the ethanol-water azeotrope and batch distillation cuts.',
        intro='Six questions on how a distillation column behaves: what reflux does, minimum reflux, flooding and weeping, why ethanol and water stop at an azeotrope, and when to change receivers in a batch distillation.',
        keywords='distillation explained, reflux ratio, minimum reflux, column flooding, tray weeping, ethanol water azeotrope, batch distillation cuts, distillation interview questions',
        teaches=['Reflux ratio', 'Column flooding and weeping', 'Azeotropes'],
        image='/assets/img/share/whiteboard-distillation-basics.jpg',
        related=[('/calculators/batch-distillation-simulator/', 'Batch distillation simulator'),
                 ('/calculators/mccabe-thiele/', 'McCabe-Thiele diagram tool'),
                 ('/articles/distillation-basics/', 'Distillation basics article')]),
    'vacuum-ejectors': dict(
        module='vacuum_ejectors',
        h1='Vacuum and Ejectors: Whiteboard Lesson',
        seo_title='Vacuum Systems and Steam Ejectors: Whiteboard Lesson',
        description='Six-question whiteboard lesson on vacuum: gauge vs absolute, finding leaks, the rate-of-rise test, steam ejectors breaking and why to condense first.',
        intro='Six questions on vacuum systems in the plant: gauge and absolute pressure, splitting a vacuum problem, telling a leak from vapour, why ejectors break, summer vacuum trouble and condensers before the pump.',
        keywords='vacuum explained, gauge vs absolute pressure, vacuum leak test, rate of rise test, steam ejector, ejector breaking, vacuum pump condenser, vacuum interview questions',
        teaches=['Vacuum measurement', 'Vacuum leak testing', 'Steam ejectors'],
        image='/assets/img/share/whiteboard-vacuum-ejectors.jpg',
        related=[('/articles/vacuum-systems/', 'Vacuum systems guide'),
                 ('/articles/steam-energy-and-condenser-selection/', 'Steam energy and condenser selection'),
                 ('/articles/solvent-recovery-troubleshooting/', 'Solvent recovery troubleshooting')]),
}

HUB = [
    ('npsh-cavitation', 'NPSH and cavitation', 'Where cavitation starts, why bubbles form, NPSH available as a savings account and what to check when a pump crackles.'),
    ('heat-exchangers', 'Heat exchangers', 'LMTD, fouling, tube velocity, tube or shell side, waterlogged steam heaters and air in coolers.'),
    ('runaway-reactions', 'Runaway reactions', 'Heat made vs heat removed, accumulation, MTSR, adiabatic rise and agitator trips.'),
    ('distillation-basics', 'Distillation basics', 'Reflux ratio, minimum reflux, flooding, weeping, azeotropes and batch distillation cuts.'),
    ('vacuum-ejectors', 'Vacuum and ejectors', 'Gauge vs absolute, finding leaks, the rate-of-rise test, ejectors and condensers.'),
]

E = lambda s: html.escape(s, quote=True)
U = lambda p: "{{ '" + p + "' | relative_url }}"


def yq(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'


def lesson_page(slug, m):
    mod = importlib.import_module(m['module'])
    steps = mod.STEPS
    url = f'{SITE}/whiteboard/{slug}/'
    lr = {"@type": "LearningResource", "name": f"{mod.TITLE}: whiteboard lesson", "description": m['description'], "url": url,
          "learningResourceType": "Interactive lesson", "educationalLevel": "Beginner", "inLanguage": "en", "isAccessibleForFree": True,
          "timeRequired": "PT8M", "teaches": m['teaches'],
          "author": {"@type": "Person", "@id": f"{SITE}/about/#ankush-chopra", "name": "Ankush Chopra", "url": f"{SITE}/about/"},
          "publisher": {"@type": "Organization", "@id": f"{SITE}/#organization", "name": "PharmaChemE", "url": f"{SITE}/"},
          "datePublished": TODAY, "dateModified": TODAY}
    faq = {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": s['q'], "acceptedAnswer": {"@type": "Answer", "text": s['summary']}} for s in steps]}
    sd = json.dumps({"@context": "https://schema.org", "@graph": [lr, faq]}, ensure_ascii=False, indent=2)
    sd = '\n'.join('  ' + l for l in sd.splitlines())
    qa = '\n'.join(f'  <h3>{E(s["q"])}</h3>\n  <p>{E(s["summary"])}</p>' for s in steps)
    rel = '\n'.join(f'    <a href="{U(u)}">{E(t)}</a>' for u, t in m['related'])
    return f"""---
layout: default
title: {yq(mod.TITLE + ': Whiteboard Lesson with Bubbles')}
seo_title: {yq(m['seo_title'])}
description: {yq(m['description'])}
image: {m['image']}
keywords: {yq(m['keywords'])}
breadcrumbs:
  - label: Interview Prep
    url: /process-engineering-faq/
  - label: Whiteboard lessons
    url: /whiteboard/
  - label: {yq(mod.TITLE)}
    url: /whiteboard/{slug}/
structured_data: |
{sd}
last_modified_at: {TODAY}
---
<link rel="stylesheet" href="{{{{ '/assets/css/whiteboard.css' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}">
<link rel="stylesheet" href="{{{{ '/assets/css/articles.css' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}">

<div class="container calc-page-head">
  <h1>{E(m['h1'])}</h1>
  <p>{E(m['intro'])} Pick an answer, hear what Bubbles thinks of it, then watch the whiteboard explain it. Turn the sound on; there are captions too.</p>
</div>
<div class="container">
  <div class="wb" id="wb" data-src="{{{{ '/assets/data/wb-{slug}.json' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}" data-audio="{{{{ '/assets/audio/wb/{slug}/' | relative_url }}}}"></div>
</div>

<div class="container article-body" style="padding:8px 20px 64px;">
  <h2 id="answers">The six questions and answers</h2>
  <p>The same lesson as text, for reading or revision. More lessons: <a href="{U('/whiteboard/')}">all whiteboard lessons</a>. More interview questions: <a href="{U('/process-engineering-faq/')}">Interview Prep</a>.</p>
{qa}

  <div class="related-box">
    <h3>Related</h3>
{rel}
    <a href="{U('/whiteboard/')}">More whiteboard lessons</a>
  </div>
</div>

<script src="{{{{ '/assets/js/whiteboard.js' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}" defer></script>
"""


def hub_page():
    items = [{"@type": "ListItem", "position": i + 1, "url": f"{SITE}/whiteboard/{s}/", "name": f"{t}: whiteboard lesson"} for i, (s, t, _) in enumerate(HUB)]
    sd = json.dumps({"@context": "https://schema.org", "@type": "ItemList", "name": "Whiteboard lessons", "itemListElement": items}, ensure_ascii=False, indent=2)
    sd = '\n'.join('  ' + l for l in sd.splitlines())
    cards = '\n'.join(f"""    <div class="tool-card">
      <h3>{E(t)}</h3>
      <p>{E(d)}</p>
      <a href="{U(f'/whiteboard/{s}/')}" class="btn btn-outline btn-sm">Start the lesson</a>
    </div>""" for s, t, d in HUB)
    return f"""---
layout: default
title: "Whiteboard Lessons for Chemical Engineers"
seo_title: "Chemical Engineering Whiteboard Lessons | PharmaChemE"
description: "Free voiced whiteboard lessons for chemical engineers: six interview-style questions each on pumps, heat exchangers, runaway reactions, distillation and vacuum."
image: /assets/img/share/whiteboard-npsh.jpg
breadcrumbs:
  - label: Interview Prep
    url: /process-engineering-faq/
  - label: Whiteboard lessons
    url: /whiteboard/
structured_data: |
{sd}
last_modified_at: {TODAY}
---
<div class="container calc-page-head">
  <h1>Whiteboard lessons</h1>
  <p>Six interview-style questions per topic. Pick an answer, hear what Bubbles thinks of it, then watch the whiteboard draw the explanation while the voice talks you through it. About eight minutes each, with captions.</p>
</div>
<div class="container section" style="padding-top:0;">
  <div class="grid-cards">
{cards}
  </div>
  <p style="margin-top:22px;color:var(--muted)">Practising for interviews? The <a href="{U('/process-engineering-faq/')}">Interview Prep</a> page has 142 more questions with answers.</p>
</div>
"""


if __name__ == '__main__':
    for slug, m in PAGES.items():
        d = os.path.join(ROOT, 'whiteboard', slug); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w').write(lesson_page(slug, m))
        print('wrote', slug)
    open(os.path.join(ROOT, 'whiteboard', 'index.html'), 'w').write(hub_page())
    print('wrote hub')
