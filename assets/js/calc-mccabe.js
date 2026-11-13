/* McCabe-Thiele calculator page. Needs pce-kit.js, batch-distill-engine.js (modified UNIFAC bubble point) and mccabe-engine.js.
   Loads unifac-do.json (VLE groups and Antoine) and solvent-lite.json (latent heat, heat capacity). Units: kcal, °C, kmol/h, kg/h. */
(function () {
  'use strict';
  var K = PCEKit, F = K.F, G = K.G, MC = PCEMcCabe, me = document.currentScript;
  var URL_U = me && me.getAttribute('data-unifac'), URL_S = me && me.getAttribute('data-sol');
  var U = null, MOD = null, BY = {}, LITE = {}, CACHE = {};
  var isSol = function (v) { return v.vle === 'sol' || v.vle === 'ideal'; };
  var ps = function (c, t) { return Math.pow(10, c.ant[0] - c.ant[1] / (c.ant[2] + t)); };

  /* equilibrium table for two solvents at P (mmHg): x, y, T */
  var solCurve = function (a, b, P, ideal) { return PCEVLE.solCurve(a, b, P, ideal); }, dataCurve = PCEVLE.dataCurve;

  /* ---------- McCabe-Thiele diagram ---------- */
  function diagram(c, o, s, rm, zoom, name) {
    var W = 620, H = 620, L = 58, R = 18, T = 14, B = 84, lo = 0, hi = 1;
    if (zoom === 'top') { lo = Math.max(0, o.xD - Math.max(0.1, 4 * (1 - o.xD))); hi = 1; }
    if (zoom === 'bot') { lo = 0; hi = Math.min(1, Math.max(0.1, 4 * o.xB)); }
    var pw = Math.min(W - L - R, H - T - B), X = function (x) { return L + pw * (x - lo) / (hi - lo); }, Y = function (y) { return T + pw * (1 - (y - lo) / (hi - lo)); };
    var cl = function (v) { return Math.max(lo, Math.min(hi, v)); }, P = function (x, y) { return X(x).toFixed(1) + ' ' + Y(y).toFixed(1); };
    var sv = '<svg viewBox="0 0 ' + (L + pw + R) + ' ' + (T + pw + B) + '" width="100%" role="img" aria-label="McCabe-Thiele diagram"><defs><clipPath id="mtc"><rect x="' + L + '" y="' + T + '" width="' + pw + '" height="' + pw + '"/></clipPath></defs>';
    sv += '<rect x="' + L + '" y="' + T + '" width="' + pw + '" height="' + pw + '" class="pk-frame"/>';
    var st = (hi - lo) <= 0.15 ? 0.01 : (hi - lo) <= 0.35 ? 0.05 : 0.1, g;
    for (g = Math.ceil(lo / st - 1e-9) * st; g <= hi + 1e-9; g += st) {
      sv += '<line x1="' + X(g) + '" x2="' + X(g) + '" y1="' + T + '" y2="' + (T + pw) + '" class="pk-grid"/><line x1="' + L + '" x2="' + (L + pw) + '" y1="' + Y(g) + '" y2="' + Y(g) + '" class="pk-grid"/>';
      sv += '<text x="' + X(g) + '" y="' + (T + pw + 16) + '" text-anchor="middle" class="pk-ax">' + (+g.toFixed(3)) + '</text><text x="' + (L - 6) + '" y="' + (Y(g) + 4) + '" text-anchor="end" class="pk-ax">' + (+g.toFixed(3)) + '</text>';
    }
    sv += '<text x="' + (L + pw / 2) + '" y="' + (T + pw + 38) + '" text-anchor="middle" class="pk-ax">x, liquid mole fraction of ' + K.esc(name) + '</text><text transform="translate(14 ' + (T + pw / 2) + ') rotate(-90)" text-anchor="middle" class="pk-ax">y, vapour mole fraction</text>';
    sv += '<g clip-path="url(#mtc)">';
    if (c.lle && c.lle.xa != null && !c.lle.outside) sv += '<rect x="' + X(cl(c.lle.xa)) + '" y="' + T + '" width="' + Math.max(0, X(cl(c.lle.xb)) - X(cl(c.lle.xa))) + '" height="' + pw + '" style="fill:#E07A6A;fill-opacity:.10"/><text x="' + (X(cl((c.lle.xa + c.lle.xb) / 2))) + '" y="' + (T + pw - 8) + '" text-anchor="middle" class="pk-ax" style="fill:#E07A6A">two liquid layers</text>';
    var path = function (f, a, b, cls, sty) { var d = '', k, n = 160; for (k = 0; k <= n; k++) { var x = a + (b - a) * k / n; d += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(f(x)).toFixed(1); } return '<path d="' + d + '" class="pk-l ' + cls + '"' + (sty ? ' style="' + sty + '"' : '') + '/>'; };
    sv += '<line x1="' + X(lo) + '" y1="' + Y(lo) + '" x2="' + X(hi) + '" y2="' + Y(hi) + '" style="stroke:var(--muted);stroke-width:1"/>';
    sv += path(c.y, lo, hi, 'pk-l0', 'stroke-width:2.5');
    if (o.E < 0.9999) sv += path(function (x) { var yo = x <= s.L.xi ? s.L.strip(x) : s.L.rect(x); return yo + o.E * (c.y(x) - yo); }, Math.max(lo, o.xB), Math.min(hi, o.xD), 'pk-l0 pk-dash', 'stroke-width:1.5');
    if (rm && isFinite(rm.R) && rm.L) sv += path(rm.L.rect, rm.L.xi, o.xD, 'pk-l4 pk-dash', 'stroke-width:1.2');
    /* q-line */
    var q = o.q, qx2 = s.L.xi; sv += '<path d="M' + P(o.zF, o.zF) + 'L' + P(qx2, s.L.yi) + '" class="pk-l pk-l3" style="stroke-width:2"/>';
    sv += path(s.L.rect, s.L.xi, o.xD, 'pk-l1') + path(s.L.strip, o.xB, s.L.xi, 'pk-l2');
    /* steps */
    var d = '', y0 = o.xD, x0 = o.xD, lab = '', lastL = null;
    s.st.forEach(function (p, k) {
      d += 'M' + P(x0, p.y) + 'L' + P(p.x, p.y) + 'L' + P(p.x, k < s.st.length - 1 ? s.st[k + 1].y : p.x);
      var fx = X(cl(p.x)), fy = Y(cl(p.y));
      var left = fx - L < 26, far = !lastL || Math.abs(fx - lastL[0]) > 13 || Math.abs(fy - lastL[1]) > 13 || p.n === s.feed; if (far && p.x >= lo && p.x <= hi && p.y >= lo && p.y <= hi && (lastL = [fx, fy])) lab += '<text x="' + (left ? fx + 5 : fx - 4) + '" y="' + Math.max(T + 11, fy - 5) + '" text-anchor="' + (left ? 'start' : 'end') + '" class="pk-ax" style="font-weight:700;fill:' + (p.n === s.feed ? '#E07A6A' : 'var(--paper)') + '">' + p.n + '</text>';
      x0 = p.x;
    });
    sv += '<path d="' + d + '" style="fill:none;stroke:var(--paper);stroke-width:1.4"/>' + lab + '</g>';
    var mk = []; [[o.xD, 'xD'], [o.xB, 'xB'], [o.zF, 'zF']].forEach(function (m) { if (m[0] < lo || m[0] > hi) return; var ty = Y(m[0]) + 14; mk.forEach(function (q) { if (Math.abs(q[0] - X(m[0])) < 26 && Math.abs(q[1] - ty) < 12) ty -= 26; }); mk.push([X(m[0]), ty]); sv += '<circle cx="' + X(m[0]) + '" cy="' + Y(m[0]) + '" r="4" class="pk-pt"/><text x="' + (X(m[0]) + 6) + '" y="' + ty + '" class="pk-ax">' + m[1] + '</text>'; });
    var lg = [['pk-l0', 'equilibrium'], ['pk-l1', 'rectifying line'], ['pk-l2', 'stripping line'], ['pk-l3', 'q-line']], lx = L;
    if (o.E < 0.9999) lg.push(['pk-l0 pk-dash', 'with tray efficiency']);
    if (rm && rm.L) lg.push(['pk-l4 pk-dash', 'at minimum reflux']);
    var ly = T + pw + 58; lg.forEach(function (l) { var wd = 30 + l[1].length * 6; if (lx + wd > L + pw) { lx = L; ly += 16; } sv += '<line x1="' + lx + '" x2="' + (lx + 18) + '" y1="' + (ly - 4) + '" y2="' + (ly - 4) + '" class="pk-l ' + l[0] + '"/><text x="' + (lx + 22) + '" y="' + ly + '" class="pk-ax">' + l[1] + '</text>'; lx += wd; });
    return sv + '</svg>';
  }

  function register() {
    var opts = U.comps.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }).map(function (c) { return [c.s, c.n]; });
    var sol = function (v) { return isSol(v); }, wtOK = function (v) { return isSol(v); };
    K.add('mccabe', {
      title: 'McCabe-Thiele: stages, minimum reflux and feed stage',
      sub: 'Binary distillation column with a full diagram, stage table, minimum reflux, total reflux, tray efficiency and duties',
      inputs: [
        { k: 'h1', type: 'head', label: 'Vapour-liquid equilibrium' },
        { k: 'vle', label: 'Equilibrium data from', type: 'sel', v: 'sol', opts: [['sol', 'Two solvents: real mixture (modified UNIFAC)'], ['ideal', 'Two solvents: ideal mixture (Raoult)'], ['alpha', 'Constant relative volatility'], ['data', 'My own x-y data']] },
        { k: 'a', label: 'Light component (more volatile)', type: 'sel', v: 'methanol', opts: opts, show: sol },
        { k: 'b', label: 'Heavy component', type: 'sel', v: 'water', opts: opts, show: sol },
        { k: 'p', label: 'Column pressure', v: 760, show: sol },
        { k: 'u', label: 'Pressure unit', type: 'sel', v: 'mmhga', opts: K.pOpts(['mmhga', 'mbara', 'bara', 'barg', 'kscg']), show: sol },
        { k: 'al', label: 'Relative volatility α (light to heavy)', v: 2.5, show: function (v) { return v.vle === 'alpha'; } },
        { k: 'du', label: 'Equilibrium points entered as', type: 'sel', v: 'f', opts: [['f', 'Mole fraction (0 to 1)'], ['p', 'Mol % (0 to 100)']], show: function (v) { return v.vle === 'data'; } },
        { k: 'dt', label: 'Equilibrium points x y', type: 'text', v: '0.1 0.42, 0.2 0.58, 0.3 0.67, 0.4 0.73, 0.5 0.78, 0.6 0.83, 0.7 0.87, 0.8 0.92, 0.9 0.96', show: function (v) { return v.vle === 'data'; }, help: 'Pairs separated by commas, x then y, for the light component. 0,0 and 1,1 are added.' },
        { k: 'h2', type: 'head', label: 'Feed and products (light component)' },
        { k: 'bs', label: 'Compositions in', type: 'sel', v: 'w', opts: [['w', 'wt %'], ['m', 'mol %']], show: wtOK },
        { k: 'zF', label: 'Feed', unit: '% (mol %, or wt % if chosen)', v: 50 },
        { k: 'xD', label: 'Distillate (top product)', unit: '%', v: 99 },
        { k: 'xB', label: 'Bottoms (residue)', unit: '%', v: 0.5 },
        { k: 'F', label: 'Feed rate', unit: 'kg/h or kmol/h as chosen', v: 1000, show: wtOK },
        { k: 'Fm', label: 'Feed rate', unit: 'kmol/h', v: 100, show: function (v) { return !isSol(v); } },
        { k: 'fu', label: 'Feed rate unit', type: 'sel', v: 'kg', opts: [['kg', 'kg/h'], ['km', 'kmol/h']], show: wtOK },
        { k: 'fc', label: 'Feed condition', type: 'sel', v: 'sl', opts: [['sl', 'Saturated liquid (q = 1)'], ['sub', 'Cold liquid below its boiling point'], ['pv', 'Partly vaporised'], ['sv', 'Saturated vapour (q = 0)'], ['q', 'Enter q directly']] },
        { k: 'tf', label: 'Feed temperature', unit: '°C', v: 30, show: function (v) { return v.fc === 'sub'; } },
        { k: 'cpf', label: 'Feed liquid heat capacity', unit: 'kcal/kmol·°C', v: 25, show: function (v) { return v.fc === 'sub' && !isSol(v); } },
        { k: 'tb', label: 'Feed bubble point', unit: '°C', v: 80, show: function (v) { return v.fc === 'sub' && !isSol(v); } },
        { k: 'fv', label: 'Vapour in the feed', unit: 'mol %', v: 30, show: function (v) { return v.fc === 'pv'; } },
        { k: 'qv', label: 'q (heat to vaporise 1 mol of feed ÷ molar latent heat)', v: 1, show: function (v) { return v.fc === 'q'; }, help: 'q > 1 cold liquid, 1 saturated liquid, 0 to 1 two-phase, 0 saturated vapour, below 0 superheated vapour' },
        { k: 'h3', type: 'head', label: 'Column' },
        { k: 'rm', label: 'Reflux set as', type: 'sel', v: 'mult', opts: [['mult', 'Multiple of minimum reflux'], ['R', 'Reflux ratio R = L/D']] },
        { k: 'rf', label: 'R ÷ Rmin', v: 1.3, show: function (v) { return v.rm === 'mult'; }, help: 'Typical design range 1.1 to 1.5' },
        { k: 'R', label: 'Reflux ratio R', v: 2, show: function (v) { return v.rm === 'R'; } },
        { k: 'cd', label: 'Condenser', type: 'sel', v: 't', opts: [['t', 'Total condenser (liquid distillate)'], ['p', 'Partial condenser (vapour distillate, counts as a stage)']] },
        { k: 'E', label: 'Murphree tray efficiency', unit: '%', v: 100, help: 'Use 100 for theoretical stages. Typical trays 50 to 80 %. The reboiler is taken as an ideal stage.' },
        { k: 'lam', label: 'Molar latent heat (for duties)', unit: 'kcal/kmol', v: 8000, show: function (v) { return !isSol(v); } },
        { k: 'zm', label: 'Diagram view', type: 'sel', v: 'full', opts: [['full', 'Whole diagram'], ['top', 'Zoom on the top (distillate end)'], ['bot', 'Zoom on the bottom (bottoms end)']] }
      ],
      example: { v: { vle: 'alpha', al: 2.5, bs: 'm', zF: 50, xD: 95, xB: 5, F: 100, Fm: 100, fu: 'km', fc: 'sl', rm: 'mult', rf: 1.5, cd: 't', E: 100, lam: 7800, zm: 'full' } },
      run: function (v) {
        var c, name = 'light component', nameH = 'heavy component', mwA = null, mwB = null, swapped = false, Pmm = null, notes = [];
        if (isSol(v)) {
          if (!v.a || !v.b || v.a === v.b) return { rows: [], notes: [['Choose two different components.', 'bad']] };
          Pmm = K.toBarA(v.p, v.u) / 1.33322e-3;
          if (!(Pmm > 1)) return { rows: [], notes: [['Enter a column pressure above vacuum zero.', 'bad']] };
          var a = v.a, b = v.b;
          c = solCurve(a, b, Pmm, v.vle === 'ideal');
          if (!c) return { rows: [], notes: [['Published modified UNIFAC parameters are missing for this pair. Choose "ideal mixture" or enter your own data.', 'bad']] };
          if (v.vle === 'ideal') { var crl = solCurve(a, b, Pmm, false); if (crl && crl.lle && crl.lle.xa != null && !crl.lle.outside) notes.push(['These two liquids separate into two layers at their boiling point, which an ideal mixture cannot show, so this result is not physical. Choose "real mixture" to see the two-liquid range and the heterogeneous azeotrope.', 'bad']); }
          if (c.y(0.5) < 0.5 && !c.az) { swapped = true; var t = a; a = b; b = t; c = solCurve(a, b, Pmm, v.vle === 'ideal'); }
          name = BY[a].n.replace(/\s*\(.*\)$/, ''); nameH = BY[b].n.replace(/\s*\(.*\)$/, ''); mwA = BY[a].mw; mwB = BY[b].mw;
          var la = LITE[a] && LITE[a].lh ? LITE[a].lh * mwA : 21 * (c.T(1) + 273.15), lb = LITE[b] && LITE[b].lh ? LITE[b].lh * mwB : 21 * (c.T(0) + 273.15);
          if (!(LITE[a] && LITE[a].lh) || !(LITE[b] && LITE[b].lh)) notes.push(['Latent heat estimated from the boiling point (Trouton rule) for a component without data.', 'warn']);
          var lamAt = function (x) { return x * la + (1 - x) * lb; };
          var cpA = (LITE[a] && LITE[a].cp || 0.5) * mwA, cpB = (LITE[b] && LITE[b].cp || 0.5) * mwB;
          if (swapped) notes.push([BY[a].n + ' is the more volatile component, so it is treated as the light component. Compositions refer to ' + name + '.', 'warn']);
        } else if (v.vle === 'alpha') {
          if (!(v.al > 1)) return { rows: [], notes: [['Relative volatility must be above 1.', 'bad']] };
          c = MC.alphaCurve(v.al);
        } else {
          var dc = dataCurve(v.dt, v.du === 'p'); if (dc.err) return { rows: [], notes: [[dc.err, 'bad']] }; c = dc.c;
        }
        if (!lamAt) lamAt = function () { return v.lam; };
        /* compositions to mole fraction */
        var wt = isSol(v) && v.bs === 'w', toX = function (p) { var w = p / 100; return wt ? (w / mwA) / (w / mwA + (1 - w) / mwB) : w; }, toW = function (x) { return 100 * x * mwA / (x * mwA + (1 - x) * mwB); };
        var zF = toX(v.zF), xD = toX(v.xD), xB = toX(v.xB);
        if (!(xB > 0 && xD < 1 && xB < zF && zF < xD)) return { rows: [], notes: [['Compositions must satisfy 0 < bottoms < feed < distillate < 100 %.', 'bad']] };
        var LL = c.lle && c.lle.xa != null ? c.lle : null, wtx = function (x) { return isSol(v) ? F(toW(x), x < 0.01 || x > 0.99 ? 2 : 1) + ' wt %' : F(100 * x, 1) + ' mol %'; };
        if (LL && !LL.outside && c.az && xD > c.az - 1e-6) return { rows: [], notes: [['Two liquids: the top vapour cannot pass the heterogeneous azeotrope at ' + F(LL.T, 1) + ' °C (' + wtx(LL.y) + ' ' + name + ') in one column.', 'bad'], ['Plants use a decanter instead. Condense the top vapour and let it settle: it splits into a ' + name + '-rich layer (about ' + wtx(LL.xb) + ' ' + name + ') and a ' + nameH + '-rich layer (about ' + wtx(LL.xa) + ' ' + name + '). Draw off the layer you want and return the other as reflux. Set the distillate at or below ' + wtx(LL.y) + ' here to size the column below the decanter.']] };
        if (c.az && xD > c.az - 1e-6) return { rows: [], notes: [['The distillate is beyond the azeotrope at ' + F(100 * c.az, 1) + ' mol % ' + name + (c.T ? ' (' + F(c.T(c.az), 1) + ' °C)' : '') + '. No number of stages or reflux can pass it at this pressure. Lower the distillate purity, change the pressure, or use another separation method.', 'bad']] };
        /* feed rate and q */
        var mwF = isSol(v) ? zF * mwA + (1 - zF) * mwB : null, Fk = !isSol(v) ? v.Fm : v.fu === 'kg' ? v.F / mwF : v.F, q;
        if (v.fc === 'pv' && !(v.fv > 0 && v.fv < 100)) return { rows: [], notes: [['Vapour in the feed must be between 0 and 100 %. Use "Saturated liquid" or "Saturated vapour" for the ends.', 'bad']] };
        if (v.fc === 'sub' && !(v.tf > -100)) return { rows: [], notes: [['Enter a feed temperature above −100 °C.', 'bad']] };
        if (!(v.E >= 5 && v.E <= 100)) return { rows: [], notes: [['Tray efficiency must be between 5 and 100 %.', 'bad']] };
        if (!isSol(v) && !(v.lam > 0)) return { rows: [], notes: [['Enter a molar latent heat above zero.', 'bad']] };
        if (v.fc === 'sl') q = 1; else if (v.fc === 'sv') q = 0; else if (v.fc === 'pv') q = 1 - v.fv / 100; else if (v.fc === 'q') q = v.qv;
        else {
          var tbF = isSol(v) ? c.T(zF) : v.tb, cpF = isSol(v) ? zF * cpA + (1 - zF) * cpB : v.cpf;
          if (v.tf >= tbF) return { rows: [], notes: [['The feed temperature is at or above the feed bubble point (' + F(tbF, 1) + ' °C). Choose "Partly vaporised" or "Saturated liquid".', 'bad']] };
          q = 1 + cpF * (tbF - v.tf) / lamAt(zF);
        }
        if (!(Fk > 0)) return { rows: [], notes: [['Enter a feed rate above zero.', 'bad']] };
        var o = { zF: zF, xD: xD, xB: xB, q: q, E: v.E / 100, partial: v.cd === 'p' };
        var rm = MC.rmin(c, o);
        if (!isFinite(rm.R)) return { rows: [], notes: [['No reflux ratio can reach this separation with these equilibrium data. Check for an azeotrope or a distillate purity above the equilibrium curve.', 'bad']] };
        var R = v.rm === 'mult' ? v.rf * rm.R : v.R, r0 = rm.R < 1e-4;
        if (r0) { if (v.rm === 'mult') R = 0.1; notes.push(['Minimum reflux is zero: the vapour from the feed is already richer than the distillate you asked for, so the top section needs almost no reflux. A stripping column with the feed at the top may be enough. Results use R = ' + F(R, 2) + '.', 'warn']); }
        if (!(R > 0.01)) return { rows: [['Minimum reflux ratio Rmin', F(rm.R, 3), '']], notes: [['Enter a reflux ratio above zero.', 'bad']] };
        if (!r0 && !(R > rm.R * 1.0005)) return { rows: [['Minimum reflux ratio Rmin', F(rm.R, 3), '']], notes: [['The reflux ratio is at or below the minimum (' + F(rm.R, 3) + '). The column would need an infinite number of stages. Increase R.', 'bad']] };
        var o1 = Object.assign({}, o, { E: 1 }), s1 = MC.step(c, o1, R), s = o.E < 0.9999 ? MC.step(c, o, R) : s1;
        if ((!s.ok && s.why === 'limit') || (!s1.ok && s1.why === 'limit')) return { rows: [['Minimum reflux ratio Rmin', F(rm.R, 3), '']], notes: [['This separation needs more than 400 stages (trays). Raise R, lower the purities or the efficiency target, or check the relative volatility: below about 1.1 distillation is rarely practical.', 'bad']] };
        if (!s.ok || !s1.ok) return { rows: [['Minimum reflux ratio Rmin', F(rm.R, 3), '']], notes: [['Stepping pinched: the reflux is too close to the minimum for the stages to finish, or the equilibrium data are not smooth. Increase R.', 'bad']] };
        var nm = MC.nmin(c, o), fe = MC.fenske(c, o), gil = MC.gilliland(R, rm.R, fe.N);
        var D = Fk * (zF - xB) / (xD - xB), Bt = Fk - D, Lr = R * D, Vr = Lr + D, Ls = Lr + q * Fk, Vs = Vr - (1 - q) * Fk;
        if (Vs <= 0) return { rows: [], notes: [['The vapour in the stripping section is zero or negative: the feed is too hot for this reflux. Increase R or cool the feed.', 'bad']] };
        var Qc = (o.partial ? Lr : Vr) * lamAt(xD), Qr = Vs * lamAt(xB);
        var cond = o.partial ? 1 : 0, trays = s.N - 1 - cond, theo = nm.N, eff = o.E < 0.9999;
        var kgh = function (k, x) { return isSol(v) ? ' (' + F(k * (x * mwA + (1 - x) * mwB), 0) + ' kg/h)' : ''; };
        var rows = [
          ['Minimum reflux ratio Rmin', F(rm.R, 3), rm.type === 'tangent' ? 'tangent pinch (curve shape controls)' : 'pinch at the feed'],
          ['Reflux ratio used R', F(R, 3), r0 ? 'Rmin is zero' : F(R / rm.R, 2) + ' × Rmin'],
          ['Theoretical stages', String(s1.N), 'incl. reboiler' + (cond ? ' and partial condenser' : '') + '; fractional ' + F(s1.Nfrac, 2)],
          ['Feed stage (optimum)', String(s1.feed), 'theoretical, counted from the top' + (cond ? ', condenser = 1' : '')],
          [eff ? 'Real trays in the column' : 'Theoretical trays in the column', String(trays), eff ? 'at ' + F(v.E, 0) + ' % Murphree efficiency, plus the reboiler' : 'stages minus reboiler' + (cond ? ' and condenser' : '')]].concat(eff ? [['Feed tray (real)', String(s.feed - cond), 'counted from the top tray']] : []).concat([
          ['Minimum stages at total reflux', String(theo), 'graphical; Fenske ' + F(fe.N, 2) + ' with α = ' + F(fe.a, 3)],
          ['Gilliland estimate (check)', F(gil, 1), 'theoretical stages for this R'],
          ['q (feed condition)', F(q, 3), q > 1 ? 'cold liquid' : q === 1 ? 'saturated liquid' : q > 0 ? 'part vapour' : q === 0 ? 'saturated vapour' : 'superheated vapour'],
          ['Distillate D', F(D, 2), 'kmol/h' + kgh(D, xD)],
          ['Bottoms B', F(Bt, 2), 'kmol/h' + kgh(Bt, xB)],
          ['Reflux L / vapour V (top)', F(Lr, 2) + ' / ' + F(Vr, 2), 'kmol/h'],
          ['Liquid L′ / vapour V′ (bottom)', F(Ls, 2) + ' / ' + F(Vs, 2), 'kmol/h'],
          ['Condenser duty', F(Qc, 0), 'kcal/h'],
          ['Reboiler duty', F(Qr, 0), 'kcal/h']
        ]);
        if (c.T) rows.push(['Top / bottom temperature', F(c.T(o.partial ? s.st[0].x : xD), 1) + ' / ' + F(c.T(s.st[s.st.length - 1].x), 1), '°C (bubble points)']);
        notes.unshift(['Needs ' + s1.N + ' theoretical stages with the feed on stage ' + s1.feed + ' at R = ' + F(R, 2) + (eff ? ': ' + trays + ' real trays at ' + F(v.E, 0) + ' % efficiency plus the reboiler.' : '.'), 'lead']);
        if (LL) {
          var conf = LL.known ? 'Measured data confirm that ' + name + ' and ' + nameH + ' separate into two layers.' : 'Only the model predicts this split; confirm it in the lab by shaking the two liquids at their boiling temperature.';
          notes.push(['Two liquid layers between ' + wtx(LL.xa) + ' and ' + wtx(LL.xb) + ' ' + name + (LL.outside ? ', close to the azeotrope' : ': across that range the mixture boils at ' + F(LL.T, 1) + ' °C and the vapour stays at ' + wtx(LL.y) + ' (heterogeneous azeotrope), so the curve is flat there') + '. ' + conf, 'warn']);
          if (zF > LL.xa && zF < LL.xb) notes.push(['The feed itself separates into two layers. Settle it in a decanter first: each layer is then a much easier feed.', 'warn']);
          notes.push(['With two liquids on a tray, McCabe-Thiele uses the overall liquid composition. Stage counts in the two-liquid range are approximate; a full process simulator that checks every tray for a second liquid gives the reliable answer.']);
        } else if (c.lle && c.lle.overridden) notes.push(['The model predicts two liquid layers for this pair, but measured data show one liquid at the boiling point, so the single-liquid curve is used.']);
        if (c.hump && !(LL && !LL.outside)) notes.push(['The model curve for this pair rises, dips and rises again, which a single liquid cannot do, so the dip has been flattened. The model is weak for this pair: for design, enter measured x-y data ("My own x-y data").', 'warn']);
        if (c.az && !(LL && !LL.outside)) notes.push(['Azeotrope at ' + F(100 * c.az, 1) + ' mol % ' + name + (c.T ? ' and ' + F(c.T(c.az), 1) + ' °C' : '') + '. The distillate cannot pass it.', 'warn']);
        if (rm.type === 'tangent') notes.push(['Minimum reflux is set by a tangent pinch: the operating line touches the equilibrium curve away from the feed. A simple feed-point formula would underestimate Rmin.', 'warn']);
        if (!r0 && R / rm.R > 2) notes.push(['R is more than twice Rmin: fewer stages, but higher energy. Most designs sit between 1.1 and 1.5 × Rmin.']);
        if (Math.abs(s1.Nfrac - gil) / s1.Nfrac > 0.25) notes.push(['The Gilliland correlation differs from the stepped count by more than 25 %. That is common for non-ideal mixtures; trust the stepped count.']);
        notes.push(['Method: constant molar overflow, equilibrium stages, partial reboiler as the last stage. Check large differences in latent heat, heat losses and sub-cooled reflux before final design.']);
        /* tables */
        var st = s.st.map(function (p) {
          var r = [p.kind === 'condenser' ? 'Condenser' : p.kind === 'reboiler' ? 'Reboiler' : String(p.n) + (p.n === s.feed ? ' (feed)' : ''), G(100 * p.x, 4), G(100 * p.y, 4)];
          if (LL && !LL.outside && p.x > LL.xa && p.x < LL.xb) r[0] += ' · two liquids';
          if (isSol(v)) r.push(G(toW(p.x), 4));
          if (c.T) r.push(F(c.T(p.x), 1));
          return r;
        });
        var head = ['Stage', 'x, liquid mol %', 'y, vapour mol %'].concat(isSol(v) ? ['x, liquid wt %'] : []).concat(c.T ? ['T, °C'] : []);
        var rn = [1.05, 1.1, 1.2, 1.3, 1.5, 1.75, 2, 2.5, 3].map(function (f) { var ss = MC.step(c, o1, r0 ? f * 0.1 : f * rm.R); return [r0 ? NaN : f, r0 ? f * 0.1 : f * rm.R, ss.ok ? ss.N : NaN, ss.ok ? ss.feed : NaN, (f * rm.R * D + D) * lamAt(xB)]; });
        var svg = diagram(c, o, s, rm, v.zm, name);
        svg += K.chart([{ name: 'Theoretical stages', pts: rn.filter(function (r) { return isFinite(r[2]); }).map(function (r) { return [r[1], r[2]]; }) }], { xl: 'reflux ratio R', yl: 'stages', title: 'Stages against reflux', marks: [[R, s1.N, 'your design']] });
        if (c.T) svg += K.chart([{ name: 'Temperature', pts: s.st.map(function (p) { return [p.n, c.T(p.x)]; }) }], { xl: 'stage from the top', yl: '°C', title: 'Temperature profile' });
        return {
          rows: rows,
          tables: [{ title: eff ? 'Tray by tray at ' + F(v.E, 0) + ' % efficiency (from the top)' : 'Stage by stage (from the top)', head: head, rows: st },
            { title: 'Reflux against stages (energy trade-off)', head: ['R ÷ Rmin', 'R', 'Theoretical stages', 'Feed stage (theoretical)', 'Vapour × latent heat, kcal/h (approx.)'], rows: rn.map(function (r) { return [isFinite(r[0]) ? F(r[0], 2) : '–', F(r[1], 2), isFinite(r[2]) ? String(r[2]) : 'pinched', isFinite(r[3]) ? String(r[3]) : '–', F(r[4], 0)]; }) }],
          svg: svg, notes: notes
        };
      },
      refs: ['McCabe W.L., Thiele E.W., Graphical design of fractionating columns, <i>Ind. Eng. Chem.</i> 17 (1925) 605–611.',
        'Minimum reflux found by testing that both operating lines stay below the equilibrium curve, so feed pinches and tangent pinches are both caught. Fenske equation with the geometric mean of α at the two ends.',
        'Gilliland correlation in the Molokanov form: Y = 1 − exp[(1 + 54.4X)/(11 + 117.2X) · (X − 1)/√X], X = (R − Rmin)/(R + 1), Y = (N − Nmin)/(N + 1).',
        'Murphree vapour efficiency stepped against a pseudo-equilibrium curve: y = y<sub>in</sub> + E(y* − y<sub>in</sub>).',
        'Real-mixture equilibrium: modified UNIFAC (Dortmund), Gmehling J., Li J., Schiller M., <i>Ind. Eng. Chem. Res.</i> 32 (1993) 178–193; Antoine constants and latent heats from the PharmaChemE solvent pages.']
    });
  }
  Promise.all([fetch(URL_U).then(function (r) { return r.json(); }), fetch(URL_S).then(function (r) { return r.json(); })]).then(function (d) {
    U = d[0]; PCEVLE.init(U); MOD = PCEVLE.model(); U.comps.forEach(function (c) { BY[c.s] = c; }); d[1].forEach(function (s) { LITE[s.s] = s; });
    register();
  });
})();
