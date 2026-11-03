#!/usr/bin/env python3
"""Builds the landing page for each training deck from the deck itself (slide titles and trainer notes)."""
import re, html, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug = 'static-and-solvent-fire-safety'
d = f'{ROOT}/training/modules/{slug}'
src = open(f'{d}/deck/index.html', encoding='utf-8').read()
secs = re.findall(r'<section id="([^"]+)"(.*?)</section>', src, re.S)
def txt(s): return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s))).strip()
rows = []
for sid, body in secs:
    h = re.search(r'<h2[^>]*>(.*?)</h2>', body, re.S)
    n = re.search(r'<aside class="notes">(.*?)</aside>', body, re.S)
    title = txt(h.group(1)) if h else sid.replace('-', ' ').capitalize()
    if sid == 'cover': title = 'Static and solvent fire safety (title)'
    rows.append((sid, title, txt(n.group(1)) if n else ''))
N = len(rows)
items = ''.join(f'<li><details><summary>{html.escape(t)}</summary><p>{html.escape(n) if n else "No notes for this slide."}</p></details></li>\n' for _, t, n in rows)
page = f'''---
layout: default
title: "Static Electricity and Solvent Fire Safety: Free Training Module"
seo_title: "Static Electricity and Solvent Fire Safety Training | Free Slides and Live Demos"
description: "A free {N}-slide training session on static charge, solvent vapour and fire prevention, with trainer notes, live checks and a printable guide. For teachers, trainers, students and plant teams."
breadcrumbs:
  - label: Training
    url: /training/
  - label: "Training modules"
    url: /training/modules/
  - label: "Static and solvent fire safety"
    url: /training/modules/{slug}/
last_modified_at: 2026-11-03
---
<link rel="stylesheet" href="{{{{ '/assets/css/training.css' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"LearningResource","name":"Static electricity and solvent fire safety","description":"A free training session on static charge and solvent fire prevention with trainer notes and live demonstrations.","educationalLevel":"Professional training","learningResourceType":"Slide deck","isAccessibleForFree":true,"inLanguage":"en","author":{{"@type":"Person","name":"Ankush Chopra"}},"publisher":{{"@type":"Organization","name":"PharmaChemE"}},"url":"https://www.pharmacheme.in/training/modules/{slug}/"}}</script>
<style>
.tm-frame{{position:relative;aspect-ratio:16/9;background:#12202C;border:1px solid var(--grid-line);border-radius:6px;overflow:hidden}}
.tm-frame iframe{{position:absolute;inset:0;width:100%;height:100%;border:0}}
.tm-who{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:0}}
.tm-who div{{background:var(--panel);border:1px solid var(--grid-line);border-radius:6px;padding:16px}}
.tm-who h3{{font-family:var(--f-display);font-size:1.05rem;margin:0 0 6px;color:var(--paper)}}
.tm-who p{{margin:0;color:var(--muted);font-size:.9rem;line-height:1.55}}
.tm-keys{{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;color:#C9D4DE;font-size:.92rem;margin:0}}
.tm-keys kbd{{border:1px solid var(--grid-line);border-bottom-width:2px;border-radius:4px;padding:1px 8px;background:var(--panel);color:var(--paper);font:inherit;font-weight:600}}
.tm-out{{list-style:none;margin:0;padding:0;columns:1}}
.tm-out li{{border-bottom:1px solid var(--grid-line);padding:2px 0}}
.tm-out summary{{cursor:pointer;padding:8px 0;color:var(--paper);min-height:36px}}
.tm-out details p{{margin:0 0 10px;padding-left:12px;border-left:3px solid var(--brass);color:#C9D4DE;font-size:.9rem;line-height:1.6}}
@media print{{.no-print,.site-nav,footer,.tm-frame{{display:none!important}}.tm-out details>*{{display:block!important}}.tm-out summary{{font-weight:700}}body{{background:#fff!important;color:#000!important}}.tm-out p{{color:#000!important}}}}
</style>
<div class="container calc-page-head">
  <h1>Static electricity and solvent fire safety</h1>
  <p>A free session you can run yourself: {N} slides with trainer notes, five live checks for the room, a tank-filling simulator and a printable guide. About 75 to 90 minutes.</p>
  <div class="tk-actions no-print">
    <a class="tk-btn primary" href="{{{{ '/training/modules/{slug}/deck/' | relative_url }}}}" target="_blank" rel="noopener">Present full screen</a>
    <a class="tk-btn" href="{{{{ '/training/modules/{slug}/live/' | relative_url }}}}" target="_blank" rel="noopener">Open live checks</a>
    <a class="tk-btn" href="{{{{ '/training/modules/{slug}/deck/' | relative_url }}}}" download="Static-and-Solvent-Fire-Safety.html">Download the deck</a>
    <button type="button" class="tk-btn" onclick="window.print()">Print trainer&rsquo;s guide</button>
    <button type="button" class="tk-btn" id="tm-copy">Copy link</button>
    <a class="tk-btn" id="tm-wa" href="#" target="_blank" rel="noopener">Share on WhatsApp</a>
  </div>
</div>
<section class="section" style="padding-top:8px;"><div class="container">
  <div class="tm-frame no-print"><iframe src="{{{{ '/training/modules/{slug}/deck/' | relative_url }}}}" title="Slide preview" loading="lazy"></iframe></div>
  <p class="tk-cite no-print" style="margin:8px 0 0">Click inside the preview to move through the slides. For a room, use Present full screen.</p>
</div></section>
<section class="section" style="padding-top:8px;"><div class="container">
  <div class="section-head" style="text-align:left;"><h2>Who it is for</h2></div>
  <div class="tm-who">
    <div><h3>Trainers and safety officers</h3><p>Run it as a toolbox or induction session. Notes are written to be read aloud, with questions to ask the room.</p></div>
    <div><h3>Teachers and lecturers</h3><p>Use the slides and live checks in a process safety class. Download the deck to teach without internet.</p></div>
    <div><h3>Students</h3><p>Open the live checks and try the cases yourself. The notes explain each slide.</p></div>
    <div><h3>Plant professionals</h3><p>Check your own practice against the five rules. Use the checks for toolbox talks.</p></div>
  </div>
</div></section>
<section class="section" style="padding-top:8px;"><div class="container">
  <div class="section-head" style="text-align:left;"><h2>Keys while presenting</h2></div>
  <div class="tm-keys"><kbd>Right or Space</kbd><span>Next build or slide</span><kbd>Left</kbd><span>Back</span><kbd>N</kbd><span>Show or hide trainer notes</span><kbd>P</kbd><span>Presenter view with timer, in a second window</span><kbd>F</kbd><span>Full screen</span></div>
</div></section>
<section class="section" style="padding-top:8px;"><div class="container">
  <div class="section-head" style="text-align:left;"><h2>Trainer&rsquo;s guide: slide by slide</h2><p>Open any slide for its notes. Printing opens them all.</p></div>
  <ol class="tm-out">
{items}  </ol>
</div></section>
<section class="section" style="padding-top:8px;"><div class="container">
  <p class="tk-cite">Teaching material, not a site-specific procedure. Numbers such as ignition energies, relaxation times and filling limits are typical values from published guidance. Confirm limits against your own standards and permit system before applying them. Related: <a href="{{{{ '/training/' | relative_url }}}}">team training enquiries</a>, <a href="{{{{ '/process-safety/' | relative_url }}}}">process safety</a>.</p>
</div></section>
<script>
(function(){{var u=location.href.split('#')[0];var c=document.getElementById('tm-copy');
c.onclick=function(){{try{{navigator.clipboard.writeText(u);c.textContent='Link copied';}}catch(e){{prompt('Copy this link',u);}}}};
document.getElementById('tm-wa').href='https://wa.me/?text='+encodeURIComponent('Static electricity and solvent fire safety, a free training session: '+u);}})();
</script>
'''
open(f'{d}/index.html', 'w', encoding='utf-8').write(page)

live = f'''---
layout: default
title: "Static Safety Live: Five Checks and a Tank Simulator"
seo_title: "Static Safety Live: Solvent Static and Fire Checks | PharmaChemE"
description: "Five live checks for a solvent static and fire safety session, plus a tank-filling charge simulator and a pipe-speed calculator. Free to use."
breadcrumbs:
  - label: Training
    url: /training/
  - label: "Training modules"
    url: /training/modules/
  - label: "Static and solvent fire safety"
    url: /training/modules/{slug}/
  - label: "Live checks"
    url: /training/modules/{slug}/live/
last_modified_at: 2026-11-03
---
<link rel="stylesheet" href="{{{{ '/assets/css/training.css' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}">
<div class="container calc-page-head">
  <h1>Static Safety Live</h1>
  <p>Set the conditions, let the room call safe or unsafe, then reveal the answer. Stations 1 to 5 follow the &ldquo;Now you call it&rdquo; slide. Typical textbook values, for teaching.</p>
  <p><label style="display:inline-flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" id="live-instant"> Show answers immediately</label> &nbsp; <a href="{{{{ '/training/modules/{slug}/' | relative_url }}}}">Back to the module</a></p>
</div>
<section class="section" style="padding-top:0;"><div class="container" style="display:grid;gap:26px">
  <div><h2>1. Spot the ignition sources</h2><div data-fx="s1"></div></div>
  <div><h2>2. Is the headspace flammable?</h2><div data-fx="s2"></div></div>
  <div><h2>3. Spark or no spark?</h2><div data-fx="s3"></div></div>
  <div><h2>4. Safe to fill?</h2><div data-fx="s4"></div></div>
  <div><h2>5. How many purges?</h2><div data-fx="s5"></div></div>
  <div><h2>Extra: watch the charge build in a tank</h2><div data-fx="sim"></div></div>
  <div><h2>Extra: filling speed and relaxation time</h2><div data-fx="fill"></div></div>
</div></section>
<script src="{{{{ '/assets/js/static-live.js' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}" defer></script>
'''
os.makedirs(f'{d}/live', exist_ok=True)
open(f'{d}/live/index.html', 'w', encoding='utf-8').write(live)

hub = f'''---
layout: default
title: "Free Training Modules for Plants, Classrooms and Teams"
seo_title: "Free Plant Training Modules for Teachers, Students and Trainers | PharmaChemE"
description: "Free, ready-to-run training sessions for chemical and pharma plants and classrooms: present on screen, share a link, download the deck, print the trainer's guide."
breadcrumbs:
  - label: Training
    url: /training/
  - label: "Training modules"
    url: /training/modules/
last_modified_at: 2026-11-03
---
<link rel="stylesheet" href="{{{{ '/assets/css/training.css' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}">
<div class="container calc-page-head">
  <h1>Free training modules</h1>
  <p>Complete sessions you can run yourself in a classroom, a toolbox talk or a plant meeting. Each has slides with trainer notes, live checks and a printable guide. No login, no cost. Share the link.</p>
</div>
<section class="section" style="padding-top:8px;"><div class="container">
  <div class="tk-cols" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
  {{% for m in site.data.training %}}
    <a class="tk-card" style="display:block;text-decoration:none" href="{{{{ '/training/modules/' | append: m.slug | append: '/' | relative_url }}}}">
      <h2 style="font-size:1.25rem;margin:0 0 8px;display:block">{{{{ m.title }}}}</h2>
      <p style="color:var(--muted);margin:0 0 10px;font-size:.92rem;line-height:1.55">{{{{ m.short }}}}</p>
      <small style="color:var(--brass);font-weight:600">{{{{ m.minutes }}}} minutes &middot; {{{{ m.level }}}}</small>
    </a>
  {{% endfor %}}
  </div>
  <p class="tk-cite" style="margin-top:18px">Want a session delivered to your team? See <a href="{{{{ '/training/' | relative_url }}}}">team training</a>. More modules are planned.</p>
</div></section>
'''
open(f'{ROOT}/training/modules/index.html', 'w', encoding='utf-8').write(hub)
print('slides', N)
