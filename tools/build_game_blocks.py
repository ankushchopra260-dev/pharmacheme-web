#!/usr/bin/env python3
"""Games section: one list of games drives the hub cards and the "what next" block under each game.

Run after changing GAMES below:  python3 tools/build_game_blocks.py
It rewrites the text between the  <!-- games:... -->  markers in games/index.html and in each
game page (adding the markers at the end of a page the first time). Every link is checked
against the repo, so a typo fails here and not on the live site.
"""
import os, re, sys, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VER = '2'   # bump when assets/js/game-kit.js changes

# tags: start (good first game), quick (about 5 minutes), safety, ops
GAMES = [
 dict(id='tour', url='/plant-tour/', file='plant-tour/index.html', icon='&#129517;', title='Virtual Plant Tour', cta='Start Tour',
      blurb='Walk through a 3D chemical plant. Fly over it, go inside, follow one full working day, then take the plant quiz.',
      time='10 min', level='Beginner', tags='start ops', learn='Plant layout, what each equipment does, how a batch moves through the site',
      inject=False),
 dict(id='rally', url='/games/plant-rally/', file='games/plant-rally/index.html', icon='&#127950;&#65039;', title='Plant Rally', cta='Play',
      blurb='Drive the emergency vehicle round a chemical plant. Keep to the zone speed limits, handle spills and gas alarms, and solve engineering missions with worked solutions.',
      time='10 min', level='Intermediate', tags='ops', learn='Site traffic rules, spill and gas alarm response, quick engineering calculations',
      read=[('Permit to work and isolation', '/articles/permit-to-work-and-isolation/'), ('Line sizing and pressure drop', '/articles/line-sizing-and-pressure-drop/'), ('Toxic and flammable releases', '/process-safety/toxic-and-flammable-releases/')],
      nxt=['operator', 'hazard']),
 dict(id='operator', url='/games/plant-operator/', file='games/plant-operator/index.html', icon='&#127981;', title='Plant Operator', cta='Play',
      blurb='Take a shift on a multi-floor pharma plant. Check equipment, find what is wrong, and take a batch from the reactor to final product.',
      time='15 min', level='Intermediate', tags='ops', learn='Reading field readings, finding the cause of a deviation, deciding what to handle first',
      read=[('Common mistakes in batch reactions', '/articles/common-mistakes-in-batch-reactions/'), ('Heat load calculation', '/articles/heat-load-calculation/'), ('Alarm management basics', '/articles/alarm-management-basics-plants/'), ('Heat load calculator', '/calculators/heat-load-calculator/')],
      nxt=['troubleshooter', 'runaway']),
 dict(id='runaway', url='/games/runaway/', file='games/runaway/index.html', icon='&#127777;&#65039;', title='Runaway! Stoessel Challenge', cta='Play',
      blurb='Learn MTSR, MTT and TD24, take the quiz, then design four exothermic reactions so a cooling failure cannot become a thermal runaway.',
      time='20 min', level='Advanced', tags='safety', learn='Adiabatic temperature rise, MTSR, the five criticality classes, safe dosing',
      read=[('Stoessel criticality classes', '/process-safety/stoessel-criticality-classes/'), ('Cooling failure and runaway', '/process-safety/cooling-failure-and-runaway/'), ('Training deck: runaway reactions and safe dosing', '/training/modules/runaway-reactions-safe-dosing/'), ('Safe addition time calculator', '/calculators/reagent-addition-time-calculator/')],
      nxt=['hazard', 'operator']),
 dict(id='hazard', url='/games/stop-the-hazard/', file='games/stop-the-hazard/index.html', icon='&#9888;&#65039;', title='Stop the Hazard', cta='Play',
      blurb='Fast process safety rounds. Spot the hazard, read live trends and pick which one to deal with first, before the risk climbs.',
      time='5 min', level='Beginner', tags='start quick safety', learn='Hazard spotting, reading a trend, deciding which alarm comes first',
      read=[('What is process safety?', '/process-safety/what-is-process-safety/'), ('Alarm management basics', '/articles/alarm-management-basics-plants/'), ('HIRA and JSA risk assessment', '/articles/hira-and-jsa-risk-assessment/'), ('Process safety quiz', '/process-safety/quiz/')],
      nxt=['troubleshooter', 'runaway']),
 dict(id='wordsearch', url='/games/word-search/', file='games/word-search/index.html', icon='&#128269;', title='Word Search', cta='Play',
      blurb='Seven puzzles: unit operations, heat transfer, fluid flow, process safety, equipment, utilities and dimensionless numbers. Every word you find explains itself.',
      time='5 min', level='Beginner', tags='start quick', learn='The vocabulary of a chemical plant, with a one-line meaning for every term',
      read=[('Process equipment and instrumentation', '/equipment-instruments/'), ('Interview prep questions', '/process-engineering-faq/'), ('How to read a P&ID', '/articles/how-to-read-a-pid/')],
      nxt=['hazard', 'tour']),
 dict(id='troubleshooter', url='/games/troubleshooter/', file='games/troubleshooter/index.html', icon='&#127918;', title='PharmaChemE Troubleshooter', cta='Play',
      blurb='An upset hits a reactor, pump or filter. You get one gauge and two controls. Bring the reading back into range.',
      time='5 min', level='Intermediate', tags='quick ops', learn='Linking a symptom to its cause, and fixing it without passing through an unsafe line-up',
      read=[('Scale-up troubleshooting playbook', '/articles/scale-up-troubleshooting-playbook/'), ('Pump and seal troubleshooting', '/articles/pump-and-mechanical-seal-troubleshooting/'), ('Common mistakes in batch reactions', '/articles/common-mistakes-in-batch-reactions/'), ('Training deck: pumps, seals and vacuum', '/training/modules/pumps-seals-vacuum/')],
      nxt=['operator', 'hazard']),
]
BY = {g['id']: g for g in GAMES}

def exists(url):
    p = os.path.join(ROOT, url.strip('/'))
    return os.path.isfile(os.path.join(p, 'index.html')) or os.path.isfile(p + '.md') or os.path.isfile(p + '.html') \
        or (url.startswith('/articles/') and any(os.path.isfile(os.path.join(ROOT, '_articles', url.strip('/').split('/')[1] + e)) for e in ('.md', '.html')))

def check():
    bad = []
    for g in GAMES:
        for u in [g['url']] + [u for _, u in g.get('read', [])] + [BY[n]['url'] for n in g.get('nxt', [])]:
            if not exists(u): bad.append((g['id'], u))
    for u in ('/process-safety/', '/training/', '/process-engineering-faq/', '/equipment-instruments/'):
        if not exists(u): bad.append(('hub', u))
    if bad: sys.exit('Broken links: %r' % bad)

def esc(s): return html.escape(s, quote=True)

def card(g):
    return ('    <a class="category-card game-card" href="%s" data-game="%s" data-tags="%s">\n      <span class="icon">%s</span>\n      <h3>%s</h3>\n'
            '      <p class="game-meta"><span>&#9201; About %s</span><span>%s</span></p>\n      <p>%s</p>\n      <p class="game-learn"><b>You practise:</b> %s</p>\n'
            '      <p class="game-best" data-best hidden></p>\n      <span class="card-link">%s &rarr;</span>\n    </a>\n') % (
            g['url'], g['id'], g['tags'], g['icon'], esc(g['title']), g['time'], g['level'], esc(g['blurb']), esc(g['learn']), g['cta'])

def after(g):
    reads = ''.join('      <li><a href="%s" data-kind="read">%s</a></li>\n' % (u, esc(t)) for t, u in g['read'])
    nxt = ''.join('      <a class="category-card" href="%s" data-kind="next" data-title="%s"><span class="icon">%s</span><h3>%s</h3><p>%s</p><span class="card-link">%s &rarr;</span></a>\n'
                  % (BY[n]['url'], esc(BY[n]['title']), BY[n]['icon'], esc(BY[n]['title']), 'About %s. %s.' % (BY[n]['time'], esc(BY[n]['learn'])), BY[n]['cta']) for n in g['nxt'])
    return ('<section class="container game-after" id="game-after" data-game="%s">\n'
            '  <div class="game-after-cols">\n    <div>\n      <h2>What this game trains</h2>\n      <p>%s.</p>\n      <p class="game-after-best" data-best hidden></p>\n    </div>\n'
            '    <div>\n      <h2>Learn the theory behind it</h2>\n      <ul class="game-after-links">\n%s      </ul>\n    </div>\n  </div>\n'
            '  <h2>Play next</h2>\n  <div class="grid-cards game-after-next">\n%s      <a class="category-card" href="/games/"><span class="icon">&#127922;</span><h3>All games</h3><p>See every game with its time, level and your best scores.</p><span class="card-link">Open &rarr;</span></a>\n  </div>\n</section>\n'
            '<link rel="stylesheet" href="/assets/css/games.css?v=%s">\n<script src="/assets/js/game-kit.js?v=%s"></script>\n') % (g['id'], esc(g['learn']), reads, nxt, VER, VER)

def put(path, name, body):
    p = os.path.join(ROOT, path); s = open(p, encoding='utf-8').read()
    a, b = '<!-- games:%s:start -->' % name, '<!-- games:%s:end -->' % name
    block = a + '\n' + body + b
    if a in s: s = re.sub(re.escape(a) + r'[\s\S]*?' + re.escape(b), lambda m: block, s)
    else: s = s.rstrip('\n') + '\n\n' + block + '\n'
    open(p, 'w', encoding='utf-8').write(s)

if __name__ == '__main__':
    check()
    put('games/index.html', 'cards', ''.join(card(g) for g in GAMES))
    for g in GAMES:
        if g.get('inject', True): put(g['file'], 'after', after(g))
    print('games: hub cards and %d game pages updated' % sum(1 for g in GAMES if g.get('inject', True)))
