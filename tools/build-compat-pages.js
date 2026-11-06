#!/usr/bin/env node
// Generates one static, indexable page per chemical at /calculators/compatibility/<slug>/
// from the same data the live checker uses. Re-run after editing the compatibility data:
//   node tools/build-compat-pages.js
const fs = require('fs'), path = require('path');
const D = require('./compat-data.js');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'calculators', 'compatibility');
const TODAY = new Date().toISOString().slice(0, 10);

// Site bug guard: concentrated nitric acid must map to nitric acid, not sulfuric acid.
const TO_CHEM = Object.assign({}, D.TO_CHEM);
if (D.MIX.BY.hno3) TO_CHEM['Nitric Acid (Concentrated)'] = 'hno3';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slugify = n => n.toLowerCase().replace(/</g, ' below ').replace(/>/g, ' above ').replace(/%/g, '')
  .replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const NAMES = Object.keys(D.CHEM_COMPAT).sort((a, b) => a.localeCompare(b));
const SLUG = {}; NAMES.forEach(n => { SLUG[n] = slugify(n); });
if (new Set(Object.values(SLUG)).size !== NAMES.length) throw new Error('slug collision');
// mix id -> material names that map to it (for linking)
const BY_MIX = {}; NAMES.forEach(n => { const id = TO_CHEM[n]; if (id) (BY_MIX[id] = BY_MIX[id] || []).push(n); });
const link = n => `<a href="{{ '/calculators/compatibility/${SLUG[n]}/' | relative_url }}">${esc(n)}</a>`;
const mixLink = id => BY_MIX[id] ? link(BY_MIX[id][0]) : esc(D.MIX.BY[id][1]);

const GROUPS = [
  { name: 'Metals and linings', mats: ['SS316', 'SS304', 'Mild Steel (MS)', 'Cast Iron', 'Aluminum', 'Hastelloy C276', 'Titanium', 'Glass-Lined Steel'] },
  { name: 'Plastics', mats: ['PTFE', 'PEEK', 'PVDF (Kynar)', 'PP', 'PVC', 'CPVC', 'PE (HDPE/LDPE)', 'Nylon'] },
  { name: 'Elastomers (gaskets, seals, O-rings)', mats: ['Viton (FKM)', 'EPDM', 'Nitrile (Buna-N)', 'Neoprene'] },
];
const RT = { E: ['Excellent', 'e'], G: ['Good', 'g'], F: ['Fair', 'f'], N: ['Not recommended', 'n'], '': ['No published rating', 'x'] };
const SOLVENTS = new Set(fs.readdirSync(path.join(ROOT, 'solvents')).filter(f => fs.statSync(path.join(ROOT, 'solvents', f)).isDirectory()));
const list = arr => arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
const short = n => n.replace(/ \((?:Kynar|HDPE\/LDPE|FKM|Buna-N|MS)\)/, '');

function mixSection(name) {
  const id = TO_CHEM[name]; const c = id && D.MIX.BY[id]; if (!c) return { html: '', partners: [] };
  const { RULES, G, C, TRIPLES } = D.MIX, mine = c[2];
  const items = [];
  RULES.forEach(r => {
    let other = null;
    if (r[0].some(g => mine.includes(g))) other = r[1]; else if (r[1].some(g => mine.includes(g))) other = r[0];
    if (!other) return;
    const partners = C.filter(x => x[0] !== id && x[2].some(g => other.includes(g))).map(x => x[0]);
    if (!partners.length) return;
    items.push({ sev: r[2], groups: other.map(g => G[g]), effects: r[3], text: r[4], partners });
  });
  items.sort((a, b) => (a.sev === 'D' ? 0 : 1) - (b.sev === 'D' ? 0 : 1));
  const tri = TRIPLES.filter(t => [0, 1, 2].some(s => t[s].some(x => x[0] === '#' ? x.slice(1) === id : mine.includes(x))));
  const cas = (c[3] || '').split(' ').filter(t => /^\d{2,7}-\d\d-\d$/.test(t));
  let h = `<h2 id="mixing">${esc(c[1])}: dangerous mixtures</h2>\n`;
  h += `<p>Reactive group${mine.length > 1 ? 's' : ''}: <b>${esc(mine.map(g => G[g]).join(', '))}</b>${cas.length ? ` &middot; CAS ${esc(cas.join(', '))}` : ''}.</p>\n`;
  if (c[5]) h += `<p class="cc-note">${esc(c[5])}</p>\n`;
  if ((BY_MIX[id] || []).length > 1) h += `<p class="cc-note">The mixing screen treats ${esc(list(BY_MIX[id]))} as one entry (${esc(c[1])}). Hazards are worst at the highest concentration; a dilute solution is usually milder but not automatically safe.</p>\n`;
  if (!items.length && !tri.length) h += `<p>No hazardous pairing is listed for this reactive group in the checker. That does not mean every mixture is safe: read section 10 of the SDS.</p>\n`;
  else {
    h += `<ul class="cc-mix">\n`;
    items.forEach(it => {
      const ex = it.partners.slice(0, 8).map(mixLink);
      h += `<li class="cc-${it.sev === 'D' ? 'd' : 'c'}"><span class="cc-sev">${it.sev === 'D' ? 'Dangerous' : 'Caution'}</span> with <b>${esc(list(it.groups.map(g => g.toLowerCase())))}</b> &middot; ${esc(it.effects.join(', '))}<br>${esc(it.text)}<br><span class="cc-ex">For example: ${ex.join(', ')}${it.partners.length > 8 ? ` and ${it.partners.length - 8} more` : ''}.</span></li>\n`;
    });
    tri.forEach(t => { h += `<li class="cc-d"><span class="cc-sev">Dangerous three-way mix</span> ${esc(t[3].join(', '))}<br>${esc(t[4])}</li>\n`; });
    h += `</ul>\n`;
  }
  const allP = [...new Set(items.filter(i => i.sev === 'D').flatMap(i => i.partners))];
  return { html: h, partners: allP, id, groups: mine };
}

function page(name) {
  const codes = D.CHEM_COMPAT[name], MATS = D.MATERIALS;
  const r = m => codes[MATS.indexOf(m)] || '';
  const by = k => MATS.filter(m => r(m) === k).map(short);
  const exc = by('E'), good = by('G'), bad = by('N');
  const rated = MATS.filter(m => r(m)).length;
  const mix = mixSection(name);
  const lower = name.replace(/\s*\((?![^)]*[\d%])[^)]*\)/g, '');
  const dangerNames = mix.partners.slice(0, 3).map(id => D.MIX.BY[id][1].replace(/\s*\(.*?\)/g, ''));

  const best = exc.length ? exc : good;
  // Meta description: 110 to 160 characters. Try richer variants first, then trim.
  const mk = (nb, nbad, nd) => {
    let d = `${lower} compatibility with ${rated} materials of construction`;
    if (nb && best.length) d += `: ${best.slice(0, nb).join(', ')} rated ${exc.length ? 'excellent' : 'good'}`;
    if (nbad && bad.length) d += `; avoid ${bad.slice(0, nbad).join(', ')}`;
    d += '.';
    if (nd && dangerNames.length) d += ` Dangerous mixtures with ${list(dangerNames.slice(0, nd))}.`;
    return d;
  };
  let desc = '';
  for (const [nb, nbad, nd] of [[4, 3, 3], [4, 3, 2], [3, 3, 1], [3, 2, 1], [3, 2, 0], [2, 2, 0], [2, 1, 0], [1, 1, 0], [0, 0, 0]]) {
    const d = mk(nb, nbad, nd);
    if (d.length <= 160) { desc = d; break; }
  }
  if (!desc) { const cut = mk(0, 0, 0).slice(0, 157); desc = cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '.'; }
  if (desc.length < 110) desc += ' Includes gasket ratings and mixing hazards.';
  if (desc.length < 110) desc += ' Screening guide only.';

  // SEO title: at most 62 characters including the site suffix.
  const SUF = ' | PharmaChemE';
  const plain = name.replace(/\s*\([^)]*\)/g, '').trim();
  let seoTitle = '';
  for (const n of [name, plain]) for (const mid of [' Compatibility Chart: MOC, Gaskets, Mixing', ' Compatibility Chart: MOC and Mixing', ' Compatibility Chart', ' Compatibility']) {
    const s = n + mid + SUF; if (s.length <= 62) { seoTitle = s; break; }
  }
  if (!seoTitle) seoTitle = plain.slice(0, 62 - SUF.length - 14).trim() + ' Compatibility' + SUF;

  let lead = `<p class="cc-lead">`;
  if (exc.length) lead += `<b>Excellent:</b> ${esc(list(exc))}. `;
  if (good.length) lead += `<b>Good:</b> ${esc(list(good))}. `;
  if (bad.length) lead += `<b>Not recommended:</b> ${esc(list(bad))}. `;
  if (rated < MATS.length) lead += `${MATS.length - rated} of ${MATS.length} materials have no published rating and are left blank, not guessed.`;
  lead += `</p>\n`;

  let note = '';
  if (D.BASIS[name]) note = `<p class="cc-note">Ratings for ${esc(name)} follow the published ratings of the closest chemical family (${esc(D.BASIS[name])}). Use them as a screening guide and confirm with the gasket, lining or equipment supplier&rsquo;s chart before ordering.</p>\n`;
  const warns = (D.WARNINGS || []).filter(w => w.chems.indexOf(name) >= 0 && w.mats.some(x => MATS.indexOf(x) >= 0));
  if (warns.length) note += `<p class="cc-note"><b>Material warnings:</b> ${warns.map(w => esc(w.text)).join(' ')}</p>\n`;
  const rsrc = (D.REAGENT_SRC[name] || []).map(k => D.SRC[k]).filter(Boolean);
  if (rsrc.length) note += `<p class="cc-note">Every rating for ${esc(name)} comes from: ${rsrc.map(s => `<a href="${esc(s.url)}" rel="noopener">${esc(s.name)}</a>`).join('; ')}. Where sources disagree, the lower rating is used.</p>\n`;

  let table = '';
  GROUPS.forEach(g => {
    table += `<h3>${esc(g.name)}</h3>\n<table class="cc-tbl"><thead><tr><th>Material</th><th>Rating</th></tr></thead><tbody>\n`;
    g.mats.filter(m => MATS.includes(m)).forEach(m => { const t = RT[r(m)]; table += `<tr><td>${esc(m)}</td><td><span class="cc-r cc-r-${t[1]}">${t[0]}</span></td></tr>\n`; });
    table += `</tbody></table>\n`;
  });

  // related: same first reactive group, then alphabetical neighbours
  let rel = [];
  if (mix.groups) rel = NAMES.filter(n => n !== name && TO_CHEM[n] && D.MIX.BY[TO_CHEM[n]] && D.MIX.BY[TO_CHEM[n]][2][0] === mix.groups[0]);
  if (rel.length < 6) { const i = NAMES.indexOf(name); rel = rel.concat(NAMES.slice(Math.max(0, i - 3), i + 4).filter(n => n !== name && !rel.includes(n))); }
  rel = rel.slice(0, 8);

  const mixId = TO_CHEM[name], solv = mixId && D.MIX.BY[mixId] && D.MIX.BY[mixId][4];
  const checker = `/calculators/compatibility/?c=${encodeURIComponent(name)}`;
  const checker2 = mixId ? `/calculators/compatibility/?tab=chemical&c=${encodeURIComponent(mixId)}` : '';

  const ld = { '@context': 'https://schema.org', '@type': 'WebPage', name: `${name} compatibility`, description: desc,
    about: { '@type': 'ChemicalSubstance', name: name.replace(/\s*\(.*?\)/g, '') }, isPartOf: { '@type': 'WebSite', name: 'PharmaChemE', url: 'https://www.pharmacheme.in/' } };

  return `---
layout: default
title: ${JSON.stringify(`${name} Compatibility: Materials of Construction and Mixing Hazards`)}
seo_title: ${JSON.stringify(seoTitle)}
description: ${JSON.stringify(desc)}
breadcrumbs:
  - label: Calculators
    url: /calculators/
  - label: Compatibility
    url: /calculators/compatibility/
  - label: ${JSON.stringify(name)}
    url: /calculators/compatibility/${SLUG[name]}/
last_modified_at: ${TODAY}
compat_chem: true
---
<link rel="stylesheet" href="{{ '/assets/css/compat-chem.css' | relative_url }}?v={{ site.time | date: '%s' }}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/}}/g, "} }").replace(/{{/g, "{ {")}</script>
<div class="container calc-page-head">
  <h1>${esc(name)} compatibility</h1>
  <p>Which materials of construction, plastics and gaskets hold up against ${esc(lower.toLowerCase() === lower ? lower : lower)}, and what it reacts dangerously with.</p>
</div>
<div class="container article-body cc-body">
${lead}${note}<p class="cc-scope">Reference starting point. Ratings are not specific to concentration or temperature. Confirm against the vendor datasheet or an in-house trial before you finalise a material of construction.</p>
<p class="cc-cta"><a class="cc-btn" href="{{ '${checker}' | relative_url }}" rel="nofollow">Check ${esc(lower)} with other chemicals and a temperature &rarr;</a></p>
<h2 id="materials">${esc(name)}: materials of construction</h2>
${table}${mix.html}${checker2 ? `<p class="cc-cta"><a class="cc-btn" href="{{ '${checker2}' | relative_url }}" rel="nofollow">Check ${esc(lower)} against your other process chemicals &rarr;</a></p>\n` : ''}<p class="cc-scope">Mixing hazards are screened by reactive group, so they do not account for concentration, temperature or order of addition. &ldquo;No reaction listed&rdquo; does not mean safe. Read section 10 of each SDS and test new combinations (DSC or reaction calorimetry) before scale-up.</p>
<h2>Sources</h2>
<p>Material ratings: published manufacturer compatibility references, Alleima corrosion tables, CP Lab Safety charts, DuPont Kalrez guide, IPEX PVDF guide and others, listed in full on the <a href="{{ '/calculators/compatibility/' | relative_url }}">compatibility checker</a> page. Mixing hazards: Hatayama et al., EPA-600/2-80-076 (1980); CCPS/NOAA Chemical Reactivity Worksheet; Bretherick&rsquo;s Handbook of Reactive Chemical Hazards.</p>
<div class="related-box">
  <h3>Other chemicals</h3>
  ${rel.map(link).join('\n  ')}
  ${solv && SOLVENTS.has(solv) ? `<a href="{{ '/solvents/${solv}/' | relative_url }}">${esc(lower)}: physical property data</a>` : ''}
  <a href="{{ '/calculators/compatibility/#by-chemical' | relative_url }}">All ${NAMES.length} chemicals A&ndash;Z</a>
</div>
</div>
`;
}

// write pages (remove stale generated dirs first)
fs.readdirSync(OUT).forEach(f => {
  const p = path.join(OUT, f, 'index.html');
  if (fs.existsSync(p) && /compat_chem: true/.test(fs.readFileSync(p, 'utf8'))) fs.rmSync(path.join(OUT, f), { recursive: true });
});
NAMES.forEach(n => { const d = path.join(OUT, SLUG[n]); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, 'index.html'), page(n)); });

// A-Z include for the hub page
const letters = {};
NAMES.forEach(n => { const L = /^[a-z]/i.test(n.replace(/^[\d,\-]+|^(n|sec|tert|o|p)-/i, '')) ? n.replace(/^[\d,\-]+|^(n|sec|tert|o|p)-/i, '')[0].toUpperCase() : '#'; (letters[L] = letters[L] || []).push(n); });
let inc = `<h2 id="by-chemical">Compatibility by chemical (A&ndash;Z)</h2>\n<p>A reference page for each of the ${NAMES.length} chemicals: material ratings and dangerous mixtures in one place.</p>\n<div class="cc-az">\n`;
Object.keys(letters).sort().forEach(L => { inc += `<div><b>${L}</b>${letters[L].map(link).join('')}</div>\n`; });
inc += `</div>\n`;
fs.writeFileSync(path.join(ROOT, '_includes', 'compat-chem-index.html'), inc);
console.log('Wrote', NAMES.length, 'pages');
