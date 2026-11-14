#!/usr/bin/env node
/* Builds the reaction lab: /molecules/reaction-lab/ (hub) and /molecules/reaction-lab/<slug>/ (one page per reaction).
   Needs the openchemlib npm package for 2D coordinates and molar masses:
     npm i openchemlib@8   then   NODE_PATH=<that>/node_modules node tools/rxlab/build.js */
'use strict';
const fs = require('fs'), path = require('path');
const OCL = require('openchemlib');
const ROOT = path.resolve(__dirname, '..', '..');
const RX = require('./reactions.js').concat(require('./reactions-2.js'));

function mol(smi) {
  const m = OCL.Molecule.fromSmiles(smi);
  m.inventCoordinates();
  const atoms = [], bonds = [];
  for (let i = 0; i < m.getAllAtoms(); i++) {
    const iso = m.getAtomMass(i) === 2 && m.getAtomicNo(i) === 1;
    atoms.push([iso ? 'H' : m.getAtomLabel(i), +m.getAtomX(i).toFixed(3), +(-m.getAtomY(i)).toFixed(3), m.getAtomCharge(i), m.getImplicitHydrogens(i)]);
  }
  for (let i = 0; i < m.getAllBonds(); i++) bonds.push([m.getBondAtom(0, i), m.getBondAtom(1, i), m.getBondOrder(i)]);
  return { a: atoms, b: bonds };
}
function mw(smi) { const m = OCL.Molecule.fromSmiles(smi.replace(/\[2H\]/g, '[H]')); return m.getMolecularFormula().relativeWeight; }
function formula(smi) { const m = OCL.Molecule.fromSmiles(smi.replace(/\[2H\]/g, '[H]')); return m.getMolecularFormula().formula; }

function checkArrow(r, step, k, e) {
  const sp = step.sp, bad = (msg) => { throw new Error(r.slug + ' mech step "' + step.cap.slice(0, 30) + '" arrow ' + k + ': ' + msg); };
  const at = (s, i) => { if (!sp[s]) bad('no species ' + s); if (i >= sp[s].m.a.length) bad('species ' + s + ' has no atom ' + i); };
  if (e[0] === 'l' || e[0] === 'a') at(e[1], e[2]);
  else if (e[0] === 'b') { at(e[1], e[2]); at(e[1], e[3]); if (!sp[e[1]].m.b.some((b) => (b[0] === e[2] && b[1] === e[3]) || (b[0] === e[3] && b[1] === e[2]))) bad('no bond ' + e[2] + '-' + e[3] + ' in ' + sp[e[1]].s); }
  else if (e[0] === 'n') { at(e[1], e[2]); at(e[3], e[4]); }
  else bad('bad end type');
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (x, d) => Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const KEEP = /^(Boc|Fischer|Grignard|Friedel|Williamson|NaBH|LiAlH|n-|tert-|N-)/;
const lc = (t) => KEEP.test(t) || /^[A-Z][a-z]?[A-Z]/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1);
const LVL = { 'Very high': 4, High: 3, Medium: 2, Low: 1, None: 0 };

const ART = {"acid-chloride-thionyl-chloride": "common-chemical-reactions-in-plants", "amide-from-acid-chloride": "common-chemical-reactions-in-plants", "fischer-esterification": "common-chemical-reactions-in-plants", "ester-hydrolysis-saponification": "common-chemical-reactions-in-plants", "williamson-ether-synthesis": "common-chemical-reactions-in-plants", "epoxide-ring-opening-with-amine": "common-chemical-reactions-in-plants", "mesylation-of-alcohol": "common-chemical-reactions-in-plants", "boc-protection-of-amine": "common-chemical-reactions-in-plants", "boc-deprotection-with-hcl": "common-chemical-reactions-in-plants", "grignard-addition-to-ketone": "grignard-friedel-crafts-coupling", "friedel-crafts-acylation": "grignard-friedel-crafts-coupling", "aromatic-nitration": "nitration-sulfonation-halogenation", "aromatic-bromination": "nitration-sulfonation-halogenation", "diazotisation-of-aniline": "nitration-sulfonation-halogenation", "sodium-borohydride-reduction": "hydrogenation-and-reduction", "lithium-aluminium-hydride-ester-reduction": "hydrogenation-and-reduction", "reductive-amination": "hydrogenation-and-reduction"};
const ARTN = {"hydrogenation-and-reduction": "Hydrogenation and reductions in plants", "common-chemical-reactions-in-plants": "Common chemical reactions in API and agrochemical plants", "nitration-sulfonation-halogenation": "Nitration, sulfonation and halogenation", "grignard-friedel-crafts-coupling": "Grignard, Friedel–Crafts and coupling reactions at scale"};
const out = [];
RX.forEach((r) => {
  const data = { slug: r.slug, name: r.name, cat: r.cat };
  data.eq = { r: r.eq.r.map(([s, l]) => ({ m: mol(s), l })), p: r.eq.p.map(([s, l]) => ({ m: mol(s), l })), cond: r.eq.cond };
  data.mech = r.mech.map((st) => {
    const s2 = { cap: st.cap, sp: st.sp.map((x) => { const m = mol(x.s); if (x.flip) m.a.forEach((at) => { at[1] = -at[1]; }); const o = Object.assign({}, x, { m }); delete o.flip; return o; }), ar: st.ar || [] };
    s2.ar.forEach((a, k) => { checkArrow(r, s2, k, a.f); checkArrow(r, s2, k, a.t); });
    s2.sp.forEach((x) => { delete x.s; });
    return s2;
  });
  data.lab = r.lab;
  const sub = r.eq.r[0][0], subMW = mw(sub);
  r.gasT = (r.gas || []).map((g) => { const kmol = 100 / subMW * g.mol; return Object.assign({}, g, { mw: mw(g.s), kg: kmol * mw(g.s), m3: kmol * 24.47 }); });
  r.subName = r.eq.r[0][1]; r.subMW = subMW;
  r.art = ART[r.slug] ? ['/articles/' + ART[r.slug] + '/', ARTN[ART[r.slug]]] : null;
  if (r.art) r.links = [r.art].concat(r.links.filter((l) => l[0] !== r.art[0]));
  r.json = data;
  out.push(r);
});

// ---------- page HTML ----------
function facts(r) {
  const gasTxt = r.gasT.length ? r.gasT.map((g) => g.n).join(', ') : (r.gasNote || 'None');
  return `<div class="rl-facts">
    <div><span>Gas evolved</span><b>${esc(gasTxt)}</b></div>
    <div><span>Moisture sensitivity</span><b class="lv-${LVL[r.moist.lvl]}">${esc(r.moist.lvl)}</b></div>
    <div><span>Heat</span><b>${r.exo.dH ? 'About ' + fmt(-r.exo.dH, 0) + ' kcal/mol released' : esc(r.exo.short || 'See below')}</b></div>
    <div><span>Type</span><b>${esc(r.cat)}</b></div>
  </div>`;
}
function page(r, i) {
  const prev = out[(i - 1 + out.length) % out.length], next = out[(i + 1) % out.length];
  const faq = [
    [`What is the mechanism of ${lc(r.name)}?`, r.mech.filter((m) => m.ar && m.ar.length).map((m, k) => `Step ${k + 1}: ${m.cap}`).join(' ')],
    [`Is ${lc(r.short.replace(/ \(.*\)/, ''))} moisture sensitive?`, `${r.moist.lvl}. ${r.moist.txt}`]
  ];
  if (r.gasT.length) faq.push([`What gas is released in ${lc(r.name)}?`, r.gasT.map((g) => `${g.n}: about ${fmt(g.kg, 1)} kg (${fmt(g.m3, 1)} m³ at 25 °C) per 100 kg of ${lc(r.subName)}${g.per ? ', ' + g.per : ''}. ${g.note}`).join(' ')]);
  const sd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'LearningResource', name: r.name, description: r.desc, learningResourceType: 'Interactive simulation', educationalLevel: 'Undergraduate and professional', inLanguage: 'en', isAccessibleForFree: true,
      author: { '@type': 'Person', '@id': 'https://www.pharmacheme.in/about/#ankush-chopra', name: 'Ankush Chopra', url: 'https://www.pharmacheme.in/about/' },
      publisher: { '@type': 'Organization', '@id': 'https://www.pharmacheme.in/#organization', name: 'PharmaChemE', url: 'https://www.pharmacheme.in/' } },
    { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] };
  const seo = r.seo + ' | PharmaChemE';
  if (seo.length > 70) console.warn('long title', seo.length, seo);
  if (r.desc.length > 160) console.warn('long desc', r.desc.length, r.slug);
  const fm = `---
layout: default
title: "${r.name.replace(/"/g, '\\"')}"
seo_title: "${seo.replace(/"/g, '\\"')}"
description: "${r.desc.replace(/"/g, '\\"')}"
breadcrumbs:
  - label: "Molecules"
    url: /molecules/
  - label: "Reaction Lab"
    url: /molecules/reaction-lab/
  - label: "${r.short.replace(/"/g, '\\"')}"
    url: /molecules/reaction-lab/${r.slug}/
structured_data: |
${JSON.stringify(sd, null, 2).split('\n').map((l) => '  ' + l).join('\n')}
last_modified_at: 2026-11-14
---
`;
  const mechText = r.mech.map((m, k) => `<li>${esc(m.cap)}</li>`).join('');
  const labText = r.lab.map((l) => `<li>${esc(l.cap)}</li>`).join('');
  const gasRows = r.gasT.map((g) => `<tr><td>${esc(g.n)}</td><td>${fmt(g.kg, 1)} kg</td><td>${fmt(g.m3, 1)} m³</td><td>${esc(g.note)}${g.per ? ' <i>(' + esc(g.per) + ')</i>' : ''}</td></tr>`).join('');
  const body = `<link rel="stylesheet" href="{{ '/assets/css/reaction-lab.css' | relative_url }}?v={{ site.time | date: '%s' }}">
<div class="container rl-page">
  <p class="rl-cat"><a href="{{ '/molecules/reaction-lab/' | relative_url }}">Reaction Lab</a> · ${esc(r.cat)}</p>
  <h1>${esc(r.name)}</h1>
  <p class="rl-intro">${esc(r.intro)}</p>
  ${r.art ? `<p class="rl-small">Background and plant practice: <a href="{{ '${r.art[0]}' | relative_url }}">${esc(r.art[1])}</a>.</p>` : ''}
  ${facts(r)}
  <div class="rl-eq" id="rl-eq" aria-label="Reaction equation"></div>
  <p class="rl-eqtxt">${r.eq.r.map((x) => esc(x[1])).join(' + ')} → ${r.eq.p.map((x) => esc(x[1])).join(' + ')} <span>(${esc(r.eq.cond)})</span>${r.eq.note ? `<br><span>Not fully balanced as drawn: ${esc(r.eq.note)}.</span>` : ''}</p>
  <div class="rl-grid">
    <section class="rl-panel" aria-labelledby="h-lab"><h2 id="h-lab">In the lab</h2><div id="rl-lab" class="rl-lab"></div><ol class="rl-steps-txt">${labText}</ol></section>
    <section class="rl-panel" aria-labelledby="h-mech"><h2 id="h-mech">Mechanism</h2><div id="rl-mech" class="rl-mech"></div><ol class="rl-steps-txt">${mechText}</ol></section>
  </div>
  <div class="rl-info">
    <section><h2>What to take care of</h2><ul>${r.care.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>
    <section><h2>Gas evolution</h2>${r.gasT.length ? `<p>Per 100 kg of ${esc(lc(r.subName))} (molar mass ${fmt(r.subMW, 1)} g/mol), at full conversion:</p><div class="rl-tw"><table class="rl-t"><thead><tr><th>Gas</th><th>Mass</th><th>Volume at 25 °C</th><th>Handling</th></tr></thead><tbody>${gasRows}</tbody></table></div><p class="rl-small">The gas comes off as fast as the reaction runs. In a dosing-controlled step the peak gas rate is about the dosing rate in kmol/h times the moles of gas per mole, so size the vent and scrubber on that.</p>` : `<p>No gas is formed in the main reaction${r.gasNote && r.gasNote !== 'None' ? ' (' + esc(r.gasNote.charAt(0).toLowerCase() + r.gasNote.slice(1)) + ')' : ''}.</p>`}</section>
    <section><h2>By-products and how to control them</h2><div class="rl-tw"><table class="rl-t"><thead><tr><th>By-product</th><th>Cause and control</th></tr></thead><tbody>${r.byp.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody></table></div></section>
    <section><h2>Moisture sensitivity: <span class="lv-${LVL[r.moist.lvl]}">${esc(r.moist.lvl)}</span></h2><p>${esc(r.moist.txt)}</p></section>
    <section><h2>Heat of reaction</h2><p>${esc(r.exo.txt)}</p></section>
    <section><h2>Plant tips</h2><ul>${r.plant.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>
  </div>
  <div class="related-box"><h3>Related</h3>${r.links.map(([u, t]) => `<a href="{{ '${u}' | relative_url }}">${esc(t)}</a>`).join('')}</div>
  <nav class="rl-nav" aria-label="Other reactions"><a href="{{ '/molecules/reaction-lab/${prev.slug}/' | relative_url }}">← ${esc(prev.short)}</a><a href="{{ '/molecules/reaction-lab/' | relative_url }}">All reactions</a><a href="{{ '/molecules/reaction-lab/${next.slug}/' | relative_url }}">${esc(next.short)} →</a></nav>
  <p class="rl-small">Mechanisms are drawn in the usual textbook form for teaching; some steps that happen together are shown separately. Conditions, quantities and hazards are typical, not a validated procedure for your process.</p>
</div>
<script type="application/json" id="rl-data">${JSON.stringify(r.json).replace(/</g, '\\u003c')}</script>
<script src="{{ '/assets/js/reaction-lab.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
`;
  const dir = path.join(ROOT, 'molecules/reaction-lab', r.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), fm + body);
}
out.forEach(page);

// ---------- hub ----------
const cats = [...new Set(out.map((r) => r.cat))];
const hubDesc = `Animated reaction lab: ${out.length} plant reactions with curly-arrow mechanisms, lab sequence, gas evolution per kg, by-product control and moisture sensitivity.`;
const hubSd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Reaction Lab', description: hubDesc, hasPart: out.map((r) => ({ '@type': 'LearningResource', name: r.name, url: 'https://www.pharmacheme.in/molecules/reaction-lab/' + r.slug + '/' })) };
const hub = `---
layout: default
title: "Reaction Lab: Animated Mechanisms and Plant Care"
seo_title: "Reaction Lab: Mechanisms, Gas, Moisture and Safety | PharmaChemE"
description: "${hubDesc}"
breadcrumbs:
  - label: "Molecules"
    url: /molecules/
  - label: "Reaction Lab"
    url: /molecules/reaction-lab/
structured_data: |
${JSON.stringify(hubSd, null, 2).split('\n').map((l) => '  ' + l).join('\n')}
last_modified_at: 2026-11-14
---
<link rel="stylesheet" href="{{ '/assets/css/reaction-lab.css' | relative_url }}?v={{ site.time | date: '%s' }}">
<div class="container rl-page">
  <h1>Reaction Lab</h1>
  <p class="rl-intro">Pick a reaction and watch it run: reagents going into the flask, gas coming off, the colour changing, and the electrons moving in the mechanism. Each reaction also covers what to take care of in the plant, how much gas it gives per 100 kg, which by-products form and how to control them, and how sensitive it is to moisture.</p>
  <div class="rl-filter"><div class="rl-chips" role="group" aria-label="Filter by type"><button type="button" class="rl-chip on" data-c="all" aria-pressed="true">All</button>${cats.map((c) => `<button type="button" class="rl-chip" data-c="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('')}</div><input type="search" class="rl-search" placeholder="Search: nitration, HCl, Grignard" aria-label="Search reactions"></div>
  <div class="rl-cards">${out.map((r) => `<a class="rl-card" href="{{ '/molecules/reaction-lab/${r.slug}/' | relative_url }}" data-c="${esc(r.cat)}" data-k="${esc((r.name + ' ' + r.cat + ' ' + r.gasT.map((g) => g.n).join(' ') + ' ' + r.desc).toLowerCase())}"><b>${esc(r.name)}</b><span class="rl-cc">${esc(r.cat)}</span><span class="rl-badges">${r.gasT.length ? `<i class="bg-gas">Gas: ${esc(r.gasT.map((g) => g.n).join(', '))}</i>` : ''}<i class="bg-m lv-${LVL[r.moist.lvl]}">Moisture: ${esc(r.moist.lvl.toLowerCase())}</i></span></a>`).join('')}</div>
  <p class="rl-none" hidden>No reaction matches. Try another word.</p>
  <h2>At a glance</h2>
  <div class="rl-tw"><table class="rl-t"><thead><tr><th>Reaction</th><th>Gas evolved</th><th>Moisture</th><th>Key impurity or by-product</th></tr></thead><tbody>${out.map((r) => `<tr><td><a href="{{ '/molecules/reaction-lab/${r.slug}/' | relative_url }}">${esc(r.name)}</a></td><td>${esc(r.gasT.map((g) => g.n).join(', ') || r.gasNote || 'None')}</td><td class="lv-${LVL[r.moist.lvl]}">${esc(r.moist.lvl)}</td><td>${esc(r.byp[0][0])}</td></tr>`).join('')}</tbody></table></div>
  <div class="related-box"><h3>Related</h3><a href="{{ '/molecules/reaction/' | relative_url }}">Reaction Builder: balance and batch charges</a><a href="{{ '/articles/common-chemical-reactions-in-plants/' | relative_url }}">Common chemical reactions in plants</a><a href="{{ '/process-modelling/batch-mass-balance-flowsheet/' | relative_url }}">Batch mass balance tool</a></div>
</div>
<script src="{{ '/assets/js/reaction-lab.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
`;
fs.writeFileSync(path.join(ROOT, 'molecules/reaction-lab/index.html'), hub);
console.log(out.length, 'reactions built');
