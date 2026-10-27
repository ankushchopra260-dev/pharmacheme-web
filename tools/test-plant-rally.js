/* Checks every Plant Rally mission against the PharmaChemE calculators it links to.
   Loads the real calculator scripts with a minimal browser stub, generates many random missions and compares answers.
   Run: node tools/test-plant-rally.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..'), J = p => path.join(ROOT, p);

/* ---- a tiny browser for the calculator scripts ---- */
const defs = {};
const sandbox = {
  console, Math, JSON, Promise, Number, String, Array, Object, Set, Map, isFinite, parseFloat, parseInt, setTimeout,
  location: { hash: '', href: 'https://www.pharmacheme.in/' },
  document: { readyState: 'complete', querySelectorAll: () => [], addEventListener() {}, currentScript: null },
  fetch: url => Promise.resolve({ json: () => JSON.parse(fs.readFileSync(J(url.replace(/^\//, '')), 'utf8')) }),
  btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary'),
  unescape, escape, encodeURIComponent, decodeURIComponent
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
function load(file, attrs) {
  sandbox.document.currentScript = { getAttribute: k => (attrs || {})[k] || null, src: '/assets/js/' + path.basename(file) };
  vm.runInContext(fs.readFileSync(J(file), 'utf8'), sandbox, { filename: file });
}
load('assets/js/if97.js');
load('assets/js/pce-kit.js');
sandbox.PCEKit.add = (id, def) => { defs[id] = def; };
load('assets/js/calc-steam.js');
load('assets/js/calc-heat.js');
load('assets/js/calc-valves.js');
load('assets/js/calc-units.js');
load('assets/js/calc-flow.js', { 'data-sol': '/assets/data/solvent-lite.json' });
load('assets/js/calc-equip.js', { 'data-sol': '/assets/data/solvent-lite.json' });
load('assets/js/line-network-engine.js');
const reliefSrc = fs.readFileSync(J('assets/js/calc-relief.js'), 'utf8');

const P = require(J('assets/js/plant-rally-missions.js'));
const DATA = { azeo: JSON.parse(fs.readFileSync(J('assets/data/azeotropes.json'), 'utf8')), solvents: JSON.parse(fs.readFileSync(J('assets/data/solvent-lite.json'), 'utf8')) };

const num = s => parseFloat(String(s).replace(/,/g, ''));
function run(id, over) {
  const d = defs[id]; if (!d) throw new Error('calculator not loaded: ' + id);
  const v = {}; d.inputs.forEach(i => { if (i.k) v[i.k] = i.v; }); Object.assign(v, over);
  return d.run(v);
}
const row = (res, re) => { const r = (res.rows || []).find(x => re.test(String(x[0]))); if (!r) throw new Error('row not found ' + re + ' in ' + JSON.stringify(res.rows)); return num(r[1]); };

let fails = 0, checks = 0;
function same(label, a, b, tol) {
  checks++;
  const ok = Math.abs(a - b) <= (tol || 0.005) * Math.max(Math.abs(a), Math.abs(b), 1e-9);
  if (!ok) { fails++; console.log('MISMATCH', label, a, b); }
}

setTimeout(() => {
  const ORI = eval(reliefSrc.match(/var ORI = (\[[^;]*\]);/)[1]);
  checks++; if (JSON.stringify(ORI) !== JSON.stringify(P.ORI)) { fails++; console.log('MISMATCH API 526 table'); }
  P.PIPE40.forEach(r => same('pipe ID ' + r[0], P.pipeID(r), sandbox.LNE.pipeID(r[0], '40'), 1e-9));

  const N = 300;
  for (let seed = 1; seed <= N; seed++) {
    const all = {};
    P.IDS.forEach(id => { all[id] = P.make(id, seed * 7919 + id.length, DATA); });
    for (const [id, m] of Object.entries(all)) {
      // every mission: 4 distinct choices, the correct one is the answer
      checks++;
      if (!m.choices || m.choices.length !== 4 || new Set(m.choices).size !== 4 || m.correct < 0) { fails++; console.log('BAD CHOICES', id, seed, m.choices); }
      if (m.typed) { checks++; if (m.choices[m.correct] !== m.fmt(m.num)) { fails++; console.log('CORRECT CHOICE IS NOT THE ANSWER', id, seed); } if (!P.check(m, String(m.num))) { fails++; console.log('TYPED ANSWER REJECTED', id, seed); } }
    }
    const I = id => all[id].inp;
    // mixing: constant tip speed
    { const i = I('tip'); same('tip', all.tip.num * i.D2, i.N1 * i.D1, 1e-9); }
    // relief orifice: smallest API 526 area >= required
    { const i = I('orifice'); const o = ORI.find(r => r[1] * 645.16 >= i.A); checks++; if (o[0] !== i.letter || all.orifice.choices[all.orifice.correct] !== i.letter) { fails++; console.log('ORIFICE', seed, i); } }
    // NPSH vs calculator (hf converted from m to bar)
    { const i = I('npsh'); const r = run('npsh', { fluid: i.s, t: i.T, rho: i.rho, pv: i.pv, p: 0, u: 'barg', z: i.z, hf: i.hf * i.rho * 9.80665 / 1e5, npshr: i.nr }); same('npsh', all.npsh.num, row(r, /NPSH available/i), 0.01); }
    // pump power vs the hydraulic power formula used by the pump power calculator (rho g Q H)
    { const i = I('pump'); same('pump', all.pump.num, i.sg * 1000 * 9.80665 * i.Q / 3600 * i.H / 1000 / i.eta, 1e-6); }
    // flash steam vs steam calculator
    { const i = I('flash'); const r = run('condensate-flash', { m: 1000, p1: i.p1, u1: 'barg', sub: 0, p2: i.p2, u2: 'barg' }); same('flash', all.flash.num, row(r, /Flash steam/i) / 10, 0.01); }
    // LMTD vs calculator (counter-current)
    { const i = I('lmtd'); const r = run('lmtd', { Thi: i.thi, Tho: i.tho, tci: i.tci, tco: i.tco, arr: 'cc' }); same('lmtd', all.lmtd.num, row(r, /LMTD/i), 0.01); }
    // azeotrope: matches the measured table
    { const i = I('azeo'); const want = i.form === 't' ? i.r.t : i.r.w; checks++; const lab = all.azeo.choices[all.azeo.correct]; if (Math.abs(num(lab) - want) > 0.051) { fails++; console.log('AZEO', seed, lab, want); } }
    // vacuum: absolute = atmospheric - vacuum
    { const i = I('vacuum'); same('vacuum', all.vacuum.num, (i.atm - i.vac) * 1.33322368, 1e-6); }
    // hydrotest vs vessel calculator (1.3 x MAWP at equal stress)
    { const i = I('hydro'); const r = run('vessel-thk', { P: i.mawp, D: 1000, S: 115, E: '1', ca: 0, head: 'ell', tn: 10 }); same('hydro ratio', row(r, /hydro/i) / row(r, /MAWP/i), all.hydro.num / i.mawp, 0.01); }
    // tank filling vs tank loss calculator (1 m3 pumped -> vapour concentration)
    { const i = I('tank'); const r = run('tank-loss', { sol: i.s, T: i.T, thru: i.V, D: 4, Hs: 6, Hl: 3, dT: 0, dPb: 0, bal: 'n' }); same('tank vapour g/m3', i.Wv * 1000, row(r, /Vapour concentration/i), 0.01); same('tank loss', all.tank.num, i.V * i.Wv, 1e-9); }
    // line size: smallest Sch 40 under the velocity limit, IDs from the line sizing tool
    { const i = I('line'); const best = sandbox.LNE.NBS.filter(nb => nb >= 25 && nb <= 200).find(nb => { const D = sandbox.LNE.pipeID(nb, '40'); return i.Q / 3600 / (Math.PI * D * D / 4) <= i.vmax; }); checks++; if (best !== i.nb) { fails++; console.log('LINE', seed, i, best); } }
    // Cv vs control valve calculator (density from SG, far from choking)
    { const i = I('cv'); const r = run('cv-liquid', { Q: i.Q, rho: i.sg * 999.1, p1: 6, p2: 6 - i.dp, pv: 0.01, pc: 221, rated: 0 }); same('cv', all.cv.num, row(r, /Required Cv|Cv required|^Cv/i), 0.02); }
  }
  console.log(`${checks} checks, ${fails} failures`);
  process.exit(fails ? 1 : 0);
}, 300);
