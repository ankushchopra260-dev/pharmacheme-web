/* Batch distillation simulator page. Needs pce-kit.js and batch-distill-engine.js; loads unifac-do.json (VLE) and solvent-lite.json (latent heat). */
(function () {
  'use strict';
  var K = PCEKit, F = K.F, G = K.G, me = document.currentScript;
  var URL_U = me && me.getAttribute('data-unifac'), URL_S = me && me.getAttribute('data-sol');
  var U = null, M = null, LITE = {}, BY = {};
  function opts(none) { var o = U.comps.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }).map(function (c) { return [c.s, c.n]; }); return none ? [['', '(none)']].concat(o) : o; }
  var END = [['T', 'Still temperature reaches (°C)'], ['TD', 'Top (vapour) temperature reaches (°C)'], ['mass', 'Cut mass reaches (kg)'], ['time', 'Cut time reaches (h)'], ['purity', 'Purity of component A in the distillate falls below (wt %)']];
  function register() {
    var inp = [{ k: 'h1', type: 'head', label: 'Charge to the still' }];
    ['A', 'B', 'C', 'D'].forEach(function (L, i) {
      inp.push({ k: 'c' + i, label: 'Component ' + L, type: 'sel', v: ['methanol', 'water', '', ''][i], opts: opts(i > 1) });
      inp.push({ k: 'm' + i, label: 'Charge of ' + L, unit: 'kg', v: [600, 400, 0, 0][i], show: (function (j) { return function (v) { return !!v['c' + j]; }; })(i) });
    });
    inp = inp.concat([
      { k: 'h2', type: 'head', label: 'Column and operation' },
      { k: 'p', label: 'Operating pressure', v: 760 }, { k: 'u', label: 'Pressure unit', type: 'sel', v: 'mmhga', opts: K.pOpts(['mmhga', 'mbara', 'bara', 'barg']) },
      { k: 'N', label: 'Theoretical stages in the column (0 = simple pot still)', v: 5, step: 1, help: 'Packing height ÷ HETP; a still with only a vapour line is 0' },
      { k: 'V', label: 'Boil-up rate (vapour)', unit: 'kg/h', v: 300, help: 'Reboiler duty ÷ latent heat; held constant (in kmol/h) during the run' },
      { k: 'hold', label: 'Liquid holdup per stage', unit: '% of charge', v: 0.5 },
      { k: 'holdc', label: 'Holdup in condenser and reflux drum', unit: '% of charge', v: 1 },
      { k: 'start', label: 'Start-up at total reflux', unit: 'h', v: 0.5 },
      { k: 'h3', type: 'head', label: 'Cuts (run in order)' }]);
    [0, 1, 2].forEach(function (j) {
      var sh = function (v) { return j === 0 || v['e' + (j - 1)] && v['use' + j] === 'y'; };
      if (j > 0) inp.push({ k: 'use' + j, label: 'Cut ' + (j + 1), type: 'sel', v: j === 1 ? 'y' : 'n', opts: [['n', 'Not used'], ['y', 'Use cut ' + (j + 1)]] });
      inp.push({ k: 'R' + j, label: 'Cut ' + (j + 1) + ': reflux ratio R = L/D', v: [3, 1, 1][j], show: j === 0 ? null : function (v) { return v['use' + j] === 'y'; } });
      inp.push({ k: 'e' + j, label: 'Cut ' + (j + 1) + ': ends when', type: 'sel', v: ['TD', 'T', 'T'][j], opts: END, show: j === 0 ? null : function (v) { return v['use' + j] === 'y'; } });
      inp.push({ k: 'x' + j, label: 'Cut ' + (j + 1) + ': value', v: [66, 99, 100][j], show: j === 0 ? null : function (v) { return v['use' + j] === 'y'; } });
    });
    inp.push({ k: 'maxT', label: 'Stop the simulation after', unit: 'h', v: 24 });

    K.add('batch-dist', {
      title: 'Batch distillation simulator',
      sub: 'Solvent recovery and solvent cuts from a batch still, with real (non-ideal) mixture behaviour and azeotropes',
      manual: true,
      inputs: inp,
      example: { v: { c0: 'methanol', m0: 600, c1: 'water', m1: 400, c2: '', c3: '', p: 760, u: 'mmhga', N: 5, V: 300, hold: 0.5, holdc: 1, start: 0.5, R0: 3, e0: 'TD', x0: 66, use1: 'y', R1: 1, e1: 'T', x1: 99, use2: 'n', maxT: 24 } },
      run: function (v) {
        var idx = [0, 1, 2, 3].filter(function (i) { return v['c' + i] && v['m' + i] > 0; });
        var slugs = idx.map(function (i) { return v['c' + i]; });
        if (idx.length < 2) return { rows: [], notes: [['Choose at least two components with a charge above zero.', 'bad']] };
        if (new Set(slugs).size !== slugs.length) return { rows: [], notes: [['Each component can be chosen only once.', 'bad']] };
        var comps = slugs.map(function (s) { return BY[s]; }), mw = comps.map(function (c) { return c.mw; });
        var lam = slugs.map(function (s, i) { var l = LITE[s]; return l && l.lh ? l.lh * mw[i] : NaN; });
        if (lam.some(function (x) { return !isFinite(x); })) return { rows: [], notes: [['Latent heat is missing for one of the components on its solvent page.', 'bad']] };
        var kg = idx.map(function (i) { return v['m' + i]; }), mol = kg.map(function (m, i) { return m / mw[i]; }), totMol = mol.reduce(function (a, b) { return a + b; }, 0), totKg = kg.reduce(function (a, b) { return a + b; }, 0);
        var Pmm = K.toBarA(v.p, v.u) / 1.33322e-3;
        var z = mol.map(function (m) { return m / totMol; }), mwMix = z.reduce(function (a, x, i) { return a + x * mw[i]; }, 0);
        var Vk = v.V / mwMix;
        var cuts = [];
        [0, 1, 2].forEach(function (j) { if (j === 0 || v['use' + j] === 'y') cuts.push({ R: Math.max(0, v['R' + j]), end: v['e' + j], val: v['x' + j], key: 0 }); });
        var r = PCEBatch.simulate(M, { comps: comps, moles: mol, P: Pmm, N: Math.max(0, Math.round(v.N)), V: Vk, hold: v.hold / 100 * totMol, holdC: Math.max(1e-4, v.holdc / 100 * totMol), cuts: cuts, maxT: v.maxT, lambda: lam, startH: v.start });
        if (!r.ok) return { rows: [], notes: [[r.msg === 'no-params' ? 'Published modified UNIFAC parameters are missing for this combination of components, so it cannot be simulated.' : 'Column holdup is more than half of the charge: reduce the holdups or the number of stages.', 'bad']] };
        var names = comps.map(function (c) { return c.n.replace(/\s*\(.*\)$/, ''); });
        var wt = function (m) { var k = m.map(function (x, i) { return x * mw[i]; }), t = k.reduce(function (a, b) { return a + b; }, 0); return { kg: t, w: k.map(function (x) { return t > 0 ? 100 * x / t : 0; }) }; };
        var cutRows = r.cuts.map(function (c) { var w = wt(c.mol); return ['Cut ' + c.i, F(c.R, 1), F(c.dur, 2), F(w.kg, 1)].concat(w.w.map(function (x) { return F(x, 1); })).concat([F(c.TDend, 1), F(c.TwEnd, 1), F(c.heat, 0)]); });
        var res = wt(r.residue);
        var distKg = r.cuts.reduce(function (a, c) { return a + wt(c.mol).kg; }, 0), endT = r.cuts.length ? r.cuts[r.cuts.length - 1].end : 0;
        var notes = [['Each cut is the distillate collected while its condition holds; the residue includes the liquid drained from the column at the end.', 'lead']];
        if (r.stop === 'empty') notes.push(['The still ran nearly dry before all cuts finished.', 'warn']);
        if (r.stop === 'time') notes.push(['Stopped at the time limit before all cuts finished.', 'warn']);
        if (Math.abs(r.balance - 1) > 1e-3) notes.push(['Mass balance closes to ' + F(100 * r.balance, 2) + ' %: reduce holdups or check inputs.', 'warn']);
        notes.push(['Model: ideal vapour, constant molar overflow and holdup, no heat losses, liquid phase treated as one phase (two-liquid systems such as toluene–water are not split). Validate against a lab or plant run before relying on cut sizes.']);
        // charts
        var tr = r.trace;
        var temps = K.chart([{ name: 'Still', pts: tr.map(function (p) { return [p.t - r.startup, p.Tw]; }) }, { name: 'Top vapour', pts: tr.map(function (p) { return [p.t - r.startup, p.TD]; }) }], { xl: 'hours after the first draw', yl: '°C', title: 'Temperatures' });
        var comp = K.chart(names.map(function (n, i) { return { name: n + ' in distillate', pts: tr.map(function (p) { var w = p.xD.map(function (x, k) { return x * mw[k]; }), t = w.reduce(function (a, b) { return a + b; }, 0); return [p.t - r.startup, 100 * w[i] / t]; }) }; }), { xl: 'hours after the first draw', yl: 'wt % in distillate', ymin: 0, ymax: 100, title: 'Distillate composition' });
        return {
          rows: [['Distillate collected', F(distKg, 1), 'kg of ' + F(totKg, 0) + ' kg charged'], ['Time after start-up', F(endT, 2), 'h'], ['Start-up at total reflux', F(r.startup, 2), 'h'],
            ['Residue in the still', F(res.kg, 1), 'kg'], ['Heat to the reboiler (incl. start-up)', F(r.Q, 0), 'kcal'], ['Average reboiler duty', F(v.V / mwMix * lam.reduce(function (a, l, i) { return a + z[i] * l; }, 0), 0), 'kcal/h (at the charge composition)']],
          tables: [{ title: 'Cuts', head: ['Cut', 'R', 'Hours', 'kg'].concat(names.map(function (n) { return n + ' wt %'; })).concat(['Top °C at end', 'Still °C at end', 'Heat kcal']), rows: cutRows },
            { title: 'Residue', head: ['', 'kg'].concat(names.map(function (n) { return n + ' wt %'; })), rows: [['Still + column holdup', F(res.kg, 1)].concat(res.w.map(function (x) { return F(x, 1); }))] }],
          svg: temps + comp, notes: notes
        };
      },
      refs: ['Activity coefficients: modified UNIFAC (Dortmund), Gmehling J., Li J., Schiller M., <i>Ind. Eng. Chem. Res.</i> 32 (1993) 178–193, public parameter matrix from the open-source thermo library (MIT licence).',
        'Column model: dynamic tray-by-tray batch distillation with constant molar overflow and holdup, as in Diwekar U.M., <i>Batch Distillation: Simulation, Optimal Design and Control</i> (2nd ed., CRC Press, 2012). Simple pot still reduces to the Rayleigh equation (checked).',
        'Vapour pressure (Antoine) and latent heat: PharmaChemE solvent pages.']
    });
  }
  Promise.all([fetch(URL_U).then(function (r) { return r.json(); }), fetch(URL_S).then(function (r) { return r.json(); })]).then(function (d) {
    U = d[0]; M = PCEBatch.model(U); U.comps.forEach(function (c) { BY[c.s] = c; }); d[1].forEach(function (s) { LITE[s.s] = s; });
    register();
  });
})();
