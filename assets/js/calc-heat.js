/* Heat transfer: jacketed vessel film coefficients and duty, insulation heat loss of a pipe, LMTD with F correction. Needs pce-kit.js and if97.js. */
(function () {
  'use strict';
  var K = PCEKit, F = K.F, G = K.G, KC = 1.163; // W/m2K per kcal/h m2 C
  var WALLS = { ss: ['Stainless steel', 14], cs: ['Carbon steel', 43], gl: ['Glass-lined steel', 43], hast: ['Hastelloy', 8.6] }; // kcal/h·m·°C
  /* Pietranski, Table 2: Nu = A2 Re^(2/3) Pr^(1/3) (mu_b/mu_w)^M ; Re = D_imp^2 N rho / mu, Nu = h D_vessel / k */
  var IMP = { fbt: ['Disc / flat-blade turbine', 0.54, 0.14, '40 to 300,000', 40, 3e5], pbt: ['Pitched-blade turbine', 0.53, 0.24, '80 to 200', 80, 200], paddle: ['Paddle', 0.36, 0.21, '300 to 300,000', 300, 3e5], anchor: ['Anchor', 0.36, 0.18, '300 to 40,000', 300, 4e4], prop: ['3-blade marine propeller', 0.54, 0.14, 'about 2,000', 1000, 4000] };
  var g = 9.80665;

  K.add('jacket-ht', {
    title: 'Jacketed vessel: film coefficients, U and heat duty',
    sub: 'Batch-side film from the agitator, jacket-side film from steam or a liquid utility, then U and the heat transferred',
    inputs: [
      { k: 'h1', type: 'head', label: 'Vessel and agitator' },
      { k: 'Dv', label: 'Vessel inside diameter', unit: 'm', v: 1.6 }, { k: 'Di', label: 'Impeller diameter', unit: 'm', v: 0.8 }, { k: 'rpm', label: 'Agitator speed', unit: 'rpm', v: 80 },
      { k: 'imp', label: 'Impeller type', type: 'sel', v: 'pbt', opts: Object.keys(IMP).map(function (k) { return [k, IMP[k][0]]; }) },
      { k: 'A', label: 'Wetted jacket area', unit: 'm²', v: 6 }, { k: 'Tb', label: 'Batch temperature', unit: '°C', v: 40 },
      { k: 'h2', type: 'head', label: 'Batch liquid properties' },
      { k: 'rho', label: 'Density', unit: 'kg/m³', v: 900 }, { k: 'mu', label: 'Viscosity at batch temperature', unit: 'cP', v: 1.0 }, { k: 'muw', label: 'Viscosity at the wall temperature', unit: 'cP', v: 0.8 },
      { k: 'cp', label: 'Specific heat', unit: 'kcal/kg·°C', v: 0.5 }, { k: 'kl', label: 'Thermal conductivity', unit: 'kcal/h·m·°C', v: 0.13 },
      { k: 'h3', type: 'head', label: 'Wall and fouling' },
      { k: 'wall', label: 'Wall', type: 'sel', v: 'ss', opts: Object.keys(WALLS).map(function (k) { return [k, WALLS[k][0]]; }) },
      { k: 'tw', label: 'Wall thickness (steel)', unit: 'mm', v: 10 }, { k: 'tg', label: 'Glass thickness', unit: 'mm', v: 1.5, show: function (v) { return v.wall === 'gl'; } },
      { k: 'rf', label: 'Total fouling allowance', unit: 'm²·h·°C/kcal', v: 0.0003 },
      { k: 'h4', type: 'head', label: 'Jacket side' },
      { k: 'jt', label: 'Utility', type: 'sel', v: 'steam', opts: [['steam', 'Steam condensing in the jacket'], ['hp', 'Liquid in a half-pipe (limpet) coil'], ['sp', 'Liquid in a jacket with spiral baffle']] },
      { k: 'ps', label: 'Steam pressure', unit: 'barg', v: 2, show: function (v) { return v.jt === 'steam'; } },
      { k: 'q', label: 'Utility flow', unit: 'm³/h', v: 10, show: function (v) { return v.jt !== 'steam'; } },
      { k: 'tin', label: 'Utility inlet temperature', unit: '°C', v: 7, show: function (v) { return v.jt !== 'steam'; } },
      { k: 'urho', label: 'Utility density', unit: 'kg/m³', v: 1000, show: function (v) { return v.jt !== 'steam'; } }, { k: 'umu', label: 'Utility viscosity', unit: 'cP', v: 1.4, show: function (v) { return v.jt !== 'steam'; } },
      { k: 'ucp', label: 'Utility specific heat', unit: 'kcal/kg·°C', v: 1.0, show: function (v) { return v.jt !== 'steam'; } }, { k: 'uk', label: 'Utility thermal conductivity', unit: 'kcal/h·m·°C', v: 0.5, show: function (v) { return v.jt !== 'steam'; } },
      { k: 'dp', label: 'Half-pipe inside diameter', unit: 'mm', v: 80, show: function (v) { return v.jt === 'hp'; } },
      { k: 'Dc', label: 'Coil diameter (vessel OD)', unit: 'm', v: 1.65, show: function (v) { return v.jt === 'hp'; } },
      { k: 'gap', label: 'Jacket annulus width', unit: 'mm', v: 50, show: function (v) { return v.jt === 'sp'; } }, { k: 'pitch', label: 'Spiral baffle pitch', unit: 'mm', v: 250, show: function (v) { return v.jt === 'sp'; } }
    ],
    example: { v: { Dv: 2.0, Di: 1.0, rpm: 70, imp: 'pbt', A: 9, Tb: 60, rho: 880, mu: 0.6, muw: 0.45, cp: 0.45, kl: 0.12, wall: 'gl', tw: 14, tg: 1.6, rf: 0.0003, jt: 'steam', ps: 3 } },
    run: function (v) {
      var im = IMP[v.imp], N = v.rpm / 60, mu = v.mu / 1000, kW = v.kl * KC, cpJ = v.cp * 4186.8;
      var Re = v.Di * v.Di * N * v.rho / mu, Pr = cpJ * mu / kW, Nu = im[1] * Math.pow(Re, 2 / 3) * Math.pow(Pr, 1 / 3) * Math.pow(v.mu / v.muw, im[2]);
      var hb = Nu * kW / v.Dv / KC; // kcal/h m2 C
      var Rw = v.tw / 1000 / WALLS[v.wall][1] + (v.wall === 'gl' ? v.tg / 1000 / 0.86 : 0);
      var notes = [], hj, Q, U, extra = [];
      if (Re < im[4] || Re > im[5]) notes.push(['Batch Reynolds number ' + G(Re, 3) + ' is outside the range the ' + im[0].toLowerCase() + ' constants were fitted for (' + im[3] + '). Treat the batch-side coefficient as a rough estimate' + '. Check it against a measured U from a heat-up or cool-down of the same vessel.', 'warn']);
      if (v.jt === 'steam') {
        var s = IF97.sat((v.ps + 1.01325) / 10); if (!s) return { rows: [], notes: [['Steam pressure out of range.', 'bad']] };
        var Ts = s.T - 273.15, hfg = (s.V.h - s.L.h) * 1000, rl = 1 / s.L.v, mul = 2.414e-5 * Math.pow(10, 247.8 / (Ts + 133.15)), kl2 = 0.68; // water: Vogel viscosity, k about 0.68 W/m K near 100-180 C
        if (!(Ts > v.Tb)) return { rows: [], notes: [['Steam is not hotter than the batch.', 'bad']] };
        hj = 8000; // start
        for (var it = 0; it < 40; it++) {
          U = 1 / (1 / hb + Rw + v.rf + 1 / hj); Q = U * v.A * (Ts - v.Tb); // kcal/h
          var mc = Q * 4186.8 / 3600 / hfg, Gam = mc / (Math.PI * v.Dv), ReF = 4 * Gam / mul; // kg/s per m of perimeter
          var hn = 0.0076 * Math.pow(Math.max(ReF, 1), 0.4) / Math.pow(mul * mul / (kl2 * kl2 * kl2 * rl * rl * g), 1 / 3) / KC;
          var ReL = Math.max(ReF, 1), hlam = 1.47 * Math.pow(ReL, -1 / 3) / Math.pow(mul * mul / (kl2 * kl2 * kl2 * rl * rl * g), 1 / 3) / KC; // Nusselt laminar film (vertical wall)
          hn = ReF < 2100 ? hlam : hn;
          if (Math.abs(hn - hj) < 1e-3 * hj) { hj = hn; break; } hj = hn;
        }
        U = 1 / (1 / hb + Rw + v.rf + 1 / hj); Q = U * v.A * (Ts - v.Tb);
        extra = [['Steam temperature', F(Ts, 1), '°C'], ['Steam condensed', F(Q * 4186.8 / (hfg), 1), 'kg/h']];
      } else {
        var uq = v.q / 3600, umu = v.umu / 1000, ukW = v.uk * KC, ucp = v.ucp * 4186.8, De, Ax, dean = 1;
        if (v.jt === 'hp') { var d = v.dp / 1000; Ax = Math.PI * d * d / 8; De = Math.PI * d / (Math.PI + 2); dean = 1 + 3.5 * De / v.Dc; }
        else { var w = v.gap / 1000, p = v.pitch / 1000; Ax = w * p; De = 4 * Ax / (2 * (w + p)); }
        var u = uq / Ax, ReJ = v.urho * u * De / umu, PrJ = ucp * umu / ukW, heating = v.tin > v.Tb;
        var A1 = heating ? 0.0243 : 0.0265, b = heating ? 0.4 : 0.3;
        hj = A1 * Math.pow(ReJ, 0.8) * Math.pow(PrJ, b) * ukW / De * dean / KC;
        if (ReJ < 10000) notes.push(['Jacket-side Reynolds number ' + G(ReJ, 3) + ' is below 10,000, where the Dittus–Boelter type correlation is no longer reliable: increase the flow or reduce the flow area.', 'warn']);
        U = 1 / (1 / hb + Rw + v.rf + 1 / hj);
        var mcp = v.q * v.urho * v.ucp, tout = v.Tb + (v.tin - v.Tb) * Math.exp(-U * v.A / mcp); // kcal/h C ; batch at constant T
        Q = mcp * (v.tin - tout);
        extra = [['Utility outlet temperature', F(tout, 1), '°C'], ['Velocity in the jacket', F(u, 2), 'm/s'], ['Jacket Reynolds number', G(ReJ, 3), '']];
        if (u < 1) notes.push(['Jacket velocity below about 1 m/s gives a poor film coefficient and fouls faster.', 'warn']);
      }
      var R = 1 / U, sh = function (x) { return F(100 * x / R, 0) + ' %'; };
      notes.unshift(['Batch side: Nu = ' + im[1] + ' Re<sup>2/3</sup> Pr<sup>1/3</sup> (μ/μ<sub>w</sub>)<sup>' + im[2] + '</sup> (' + im[0] + ', fitted for Re ' + im[3] + '). Jacket: ' + (v.jt === 'steam' ? 'condensing film on a vertical wall.' : 'Dittus–Boelter on the equivalent diameter' + (v.jt === 'hp' ? ', with a coil curvature correction.' : '.')), 'lead']);
      return { rows: [[Q < 0 ? 'Heat removed from the batch' : 'Heat added to the batch', F(Math.abs(Q), 0), 'kcal/h (' + F(Math.abs(Q) * KC / 1000, 1) + ' kW)'], ['Overall U', F(U, 0), 'kcal/h·m²·°C (' + F(U * KC, 0) + ' W/m²·K)'], ['Batch-side film h', F(hb, 0), 'kcal/h·m²·°C'], ['Jacket-side film h', F(hj, 0), 'kcal/h·m²·°C']].concat(extra).concat([
          ['Batch Reynolds number', G(Re, 3), ''], ['Resistance: batch film / wall / fouling / jacket', sh(1 / hb) + ' / ' + sh(Rw) + ' / ' + sh(v.rf) + ' / ' + sh(1 / hj), '']]), notes: notes };
    },
    refs: ['Batch-side correlation and constants: Pietranski J.F., <i>Over-all Heat Transfer Coefficients in Agitated Vessels</i>, PDH Online course K102 (2002), eq. 28 and Table 2 (Chilton, Drew and Jebens form).',
      'Jacket side, liquid: Dittus–Boelter form, Nu = 0.0243 Re<sup>0.8</sup> Pr<sup>0.4</sup> (heating) or 0.0265 Re<sup>0.8</sup> Pr<sup>0.3</sup> (cooling), same source eq. 26; half-pipe coil equivalent diameter πd/(π+2) and curvature factor (1 + 3.5 D<sub>e</sub>/D<sub>c</sub>) as in Perry’s Chemical Engineers’ Handbook.',
      'Jacket side, steam: condensing film, h (μ²/(k³ρ²g))<sup>1/3</sup> = 0.0076 Re<sub>f</sub><sup>0.4</sup> for turbulent films (same source eq. 25) and the Nusselt laminar film below Re<sub>f</sub> 2,100; steam properties IAPWS-IF97.',
      'Wall conductivities as in the PharmaChemE overall U calculator.']
  });

  /* ---------- insulation heat loss: horizontal pipe in still or moving air ---------- */
  var AIR = [[250, 22.3e-3, 11.44e-6, 0.720], [300, 26.3e-3, 15.89e-6, 0.707], [350, 30.0e-3, 20.92e-6, 0.700], [400, 33.8e-3, 26.41e-6, 0.690], [450, 37.3e-3, 32.39e-6, 0.686], [500, 40.7e-3, 38.79e-6, 0.684]];
  function air(T) { var i = 0; T = Math.max(250, Math.min(500, T)); while (i < AIR.length - 2 && T > AIR[i + 1][0]) i++; var a = AIR[i], b = AIR[i + 1], f = (T - a[0]) / (b[0] - a[0]); return { k: a[1] + f * (b[1] - a[1]), nu: a[2] + f * (b[2] - a[2]), Pr: a[3] + f * (b[3] - a[3]) }; }
  var NB = [[15, 21.3], [20, 26.7], [25, 33.4], [40, 48.3], [50, 60.3], [80, 88.9], [100, 114.3], [150, 168.3], [200, 219.1], [250, 273.0], [300, 323.8]];
  K.add('insulation', {
    title: 'Heat loss from an insulated (or bare) pipe',
    sub: 'Heat loss per metre, surface temperature and yearly cost',
    inputs: [
      { k: 'nb', label: 'Pipe size', type: 'sel', v: '50', opts: NB.map(function (p) { return [String(p[0]), p[0] + ' NB (OD ' + p[1] + ' mm)']; }) },
      { k: 'Ti', label: 'Fluid (pipe) temperature', unit: '°C', v: 160 },
      { k: 't', label: 'Insulation thickness (0 for a bare pipe)', unit: 'mm', v: 50 },
      { k: 'ki', label: 'Insulation conductivity at mean temperature', unit: 'W/m·K', v: 0.045, help: 'From the insulation supplier’s data sheet at the mean temperature' },
      { k: 'eps', label: 'Emissivity of the outer surface', v: 0.2, help: 'Use the cladding supplier’s value: painted and oxidised surfaces are high (about 0.8 to 0.9), bright metal cladding low' },
      { k: 'Ta', label: 'Ambient temperature', unit: '°C', v: 30 }, { k: 'wind', label: 'Wind speed (0 indoors)', unit: 'm/s', v: 0 },
      { k: 'L', label: 'Pipe length', unit: 'm', v: 100 },
      { k: 'hrs', label: 'Operating hours per year', unit: 'h', v: 8000 }, { k: 'cost', label: 'Cost of heat (your figure)', unit: '₹ per 1,000 kcal', v: 2.5 }
    ],
    example: { v: { nb: '80', Ti: 180, t: 0, ki: 0.045, eps: 0.85, Ta: 30, wind: 0, L: 50, hrs: 8000, cost: 2.5 } },
    run: function (v) {
      var Do = NB.filter(function (p) { return String(p[0]) === String(v.nb); })[0][1] / 1000, Ds = Do + 2 * v.t / 1000, sig = 5.670374e-8;
      var Ta = v.Ta + 273.15, Ti = v.Ti + 273.15, Rins = v.t > 0 ? Math.log(Ds / Do) / (2 * Math.PI * v.ki) : 0;
      var Ts = v.t > 0 ? Ta + 0.1 * (Ti - Ta) : Ti, q = 0, hc = 0, hr = 0;
      for (var it = 0; it < 200; it++) {
        var Tf = (Ts + Ta) / 2, ap = air(Tf), dT = Math.max(Math.abs(Ts - Ta), 1e-6);
        if (v.wind > 0) { var Re = v.wind * Ds / ap.nu; hc = (0.3 + 0.62 * Math.sqrt(Re) * Math.pow(ap.Pr, 1 / 3) / Math.pow(1 + Math.pow(0.4 / ap.Pr, 2 / 3), 0.25) * Math.pow(1 + Math.pow(Re / 282000, 5 / 8), 0.8)) * ap.k / Ds; }
        else { var Ra = g * (1 / Tf) * dT * Math.pow(Ds, 3) / (ap.nu * ap.nu) * ap.Pr; hc = Math.pow(0.60 + 0.387 * Math.pow(Ra, 1 / 6) / Math.pow(1 + Math.pow(0.559 / ap.Pr, 9 / 16), 8 / 27), 2) * ap.k / Ds; }
        hr = v.eps * sig * (Ts * Ts + Ta * Ta) * (Ts + Ta);
        var Rout = 1 / ((hc + hr) * Math.PI * Ds);
        q = (Ti - Ta) / (Rins + Rout); // W/m
        var Tn = Ta + q * Rout;
        if (Math.abs(Tn - Ts) < 1e-4) { Ts = Tn; break; } Ts = 0.5 * Ts + 0.5 * Tn;
      }
      var kcalhm = q / KC, yr = q * v.L * v.hrs / KC / 1000 * v.cost; // per 1000 kcal
      var notes = [['Heat loss = (T<sub>pipe</sub> − T<sub>air</sub>) / (R<sub>insulation</sub> + R<sub>surface</sub>); the surface resistance combines convection and radiation and is solved for the surface temperature.', 'lead']];
      if (Ts - 273.15 > 60) notes.push(['Surface above 60 °C: a burn risk on contact. Many plants insulate for personnel protection to keep surfaces at or below about 60 °C (see ASTM C1055 for burn-injury guidance).', 'warn']);
      return { rows: [['Heat loss', F(kcalhm, 0), 'kcal/h per metre (' + F(q, 0) + ' W/m)'], ['Heat loss for the length', F(kcalhm * v.L, 0), 'kcal/h'], ['Outer surface temperature', F(Ts - 273.15, 1), '°C'],
          ['Yearly heat lost', F(q * v.L * v.hrs / KC / 1e6, 1), 'million kcal'], ['Yearly cost', '₹ ' + F(yr, 0), 'at your cost of heat'], ['Convection / radiation coefficient', F(hc, 1) + ' / ' + F(hr, 1), 'W/m²·K']], notes: notes };
    },
    refs: ['Natural convection from a horizontal cylinder: Churchill S.W., Chu H.H.S., <i>Int. J. Heat Mass Transfer</i> 18 (1975) 1049. Cross flow: Churchill S.W., Bernstein M., <i>J. Heat Transfer</i> 99 (1977) 300.',
      'Air properties at 1 atm: Incropera F.P. et al., <i>Fundamentals of Heat and Mass Transfer</i>, Table A.4.', 'Method follows ASTM C680, <i>Practice for Estimate of the Heat Gain or Loss and the Surface Temperatures of Insulated Flat, Cylindrical, and Spherical Systems</i>. Pipe ODs: ASME B36.10M.']
  });

  /* ---------- LMTD and F correction (1 or 2 shell passes, even tube passes) ---------- */
  function F12(R, P) {
    if (P <= 0) return 1;
    var s = Math.sqrt(R * R + 1);
    if (Math.abs(R - 1) < 1e-6) { var a = P * s / (1 - P) / Math.log((2 - P * (2 - s)) / (2 - P * (2 + s))); return a; }
    var num = s * Math.log((1 - P) / (1 - P * R)), den = (R - 1) * Math.log((2 - P * (R + 1 - s)) / (2 - P * (R + 1 + s)));
    return num / den;
  }
  function Pone(P, R, N) { // P per shell for N shells in series (counterflow arrangement)
    if (N === 1) return P;
    if (Math.abs(R - 1) < 1e-9) return P / (N - (N - 1) * P);
    var X = Math.pow((1 - P * R) / (1 - P), 1 / N); return (X - 1) / (X - R);
  }
  K.add('lmtd', {
    title: 'LMTD, F correction factor and exchanger area',
    sub: 'Counter-current, co-current, and shell-and-tube with 1 or 2 shell passes',
    inputs: [
      { k: 'Thi', label: 'Hot fluid in', unit: '°C', v: 120 }, { k: 'Tho', label: 'Hot fluid out', unit: '°C', v: 60 },
      { k: 'tci', label: 'Cold fluid in', unit: '°C', v: 32 }, { k: 'tco', label: 'Cold fluid out', unit: '°C', v: 40 },
      { k: 'arr', label: 'Arrangement', type: 'sel', v: 's1', opts: [['cc', 'Pure counter-current (double pipe, plate)'], ['co', 'Co-current'], ['s1', 'Shell and tube, 1 shell pass, 2+ tube passes'], ['s2', 'Shell and tube, 2 shell passes, 4+ tube passes']] },
      { k: 'Q', label: 'Heat duty (optional, for area)', unit: 'kcal/h', v: 300000, optional: true }, { k: 'U', label: 'Overall U (optional, for area)', unit: 'kcal/h·m²·°C', v: 400, optional: true }
    ],
    example: { v: { Thi: 150, Tho: 90, tci: 30, tco: 70, arr: 's1', Q: 500000, U: 450 } },
    run: function (v) {
      var co = v.arr === 'co', d1 = co ? v.Thi - v.tci : v.Thi - v.tco, d2 = co ? v.Tho - v.tco : v.Tho - v.tci;
      if (!(d1 > 0 && d2 > 0)) return { rows: [], notes: [['A temperature cross: the hot fluid must stay hotter than the cold fluid at both ends for this arrangement.', 'bad']] };
      var lm = Math.abs(d1 - d2) < 1e-9 ? d1 : (d1 - d2) / Math.log(d1 / d2), Fc = 1, notes = [];
      if (v.arr === 's1' || v.arr === 's2') {
        var R = (v.Thi - v.Tho) / (v.tco - v.tci), P = (v.tco - v.tci) / (v.Thi - v.tci), Ns = v.arr === 's1' ? 1 : 2;
        var Pp = Pone(P, R, Ns); Fc = F12(R, Pp);
        if (!isFinite(Fc) || Fc <= 0) { notes.push(['This duty is not possible with ' + Ns + ' shell pass' + (Ns > 1 ? 'es' : '') + ': use more shells in series or a counter-current exchanger.', 'bad']); Fc = NaN; }
        else if (Fc < 0.75) notes.push(['F below 0.75: the exchanger is inefficient and sensitive to small changes. Use more shell passes or counter-current flow (TEMA practice keeps F above about 0.75 to 0.8).', 'warn']);
        notes.unshift(['R = ' + F(R, 3) + ', P = ' + F(P, 3) + '. F from the Bowman, Mueller and Nagle equation' + (Ns > 1 ? ', applied per shell for shells in series.' : '.'), 'lead']);
      }
      var rows = [['Corrected mean temperature difference', F(lm * Fc, 2), '°C'], ['LMTD (counter-current basis)', F(lm, 2), '°C'], ['F correction factor', isFinite(Fc) ? F(Fc, 3) : '–', '']];
      if (v.Q > 0 && v.U > 0 && isFinite(Fc)) rows.push(['Area required', F(v.Q / (v.U * lm * Fc), 2), 'm²']);
      return { rows: rows, notes: notes };
    },
    refs: ['Bowman R.A., Mueller A.C., Nagle W.M., “Mean temperature difference in design”, <i>Trans. ASME</i> 62 (1940) 283–294.', 'Standards of the Tubular Exchanger Manufacturers Association (TEMA): F correction for multi-pass exchangers.']
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = { F12: F12, Pone: Pone };
})();
