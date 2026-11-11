/* Venting of atmospheric and low-pressure storage tanks: API Standard 2000, 7th edition (general method).
   Normal venting (liquid movement and thermal breathing), emergency venting for fire exposure, and a first
   estimate of the free vent area. Needs pce-kit.js. */
(function () {
  'use strict';
  var K = PCEKit, F = K.F, G = K.G;
  var REF = 'API Standard 2000, 7th edition, <i>Venting Atmospheric and Low-pressure Storage Tanks</i> (identical in method to ISO 28300): normal venting by the general method, emergency venting for fire exposure.';
  var REFB = 'Vent area: orifice equation for low-pressure gas flow, Q = C<sub>d</sub> A &radic;(2 &Delta;P / &rho;); see Crane Technical Paper 410. The certified flow curve of the chosen vent governs.';
  var LAT = { lo: ['Below 42° (all of India)', 0.32], mid: ['42° to 58°', 0.25], hi: ['Above 58°', 0.2] };
  // C-factor: [hexane-like & below 25 °C, hexane-like & 25 °C or above, higher than hexane or unknown (both temperatures)]
  var CF = { lo: [4, 6.5, 6.5], mid: [3, 5, 5], hi: [2.5, 4, 4] };
  var NPS = [[25, 26.6], [40, 40.9], [50, 52.5], [80, 77.9], [100, 102.3], [150, 154.1], [200, 202.7], [250, 254.5], [300, 303.2], [350, 333.4], [400, 381], [450, 428.7], [500, 477.8], [600, 574.6]];
  function nps(dmm) { for (var i = 0; i < NPS.length; i++) if (NPS[i][1] >= dmm) return 'DN ' + NPS[i][0] + ' (Sch 40 bore ' + F(NPS[i][1], 0) + ' mm)'; return 'larger than DN 600: use more than one vent'; }
  function insR(v) { // reduction factor for insulation
    if (v.ins === 'n') return 1;
    var Rin = 1 / (1 + 4 * (v.lin / 1000) / v.kin);
    if (v.ins === 'f') return Rin;
    var f = Math.max(0, Math.min(100, v.Ap)) / 100; return f * Rin + (1 - f);
  }
  var INS = [
    { k: 'ins', label: 'Tank insulation', type: 'sel', v: 'n', opts: [['n', 'Not insulated'], ['f', 'Fully insulated'], ['p', 'Partly insulated']] },
    { k: 'lin', label: 'Insulation thickness', unit: 'mm', v: 50, show: function (v) { return v.ins !== 'n'; } },
    { k: 'kin', label: 'Insulation thermal conductivity', unit: 'W/m·K', v: 0.05, show: function (v) { return v.ins !== 'n'; }, help: 'About 0.04 to 0.05 for mineral wool' },
    { k: 'Ap', label: 'Share of the tank surface that is insulated', unit: '%', v: 60, show: function (v) { return v.ins === 'p'; } }
  ];

  /* ---------- normal venting ---------- */
  K.add('tank-vent-normal', {
    title: 'Normal venting: filling, emptying and thermal breathing (API 2000)',
    sub: 'Required out-breathing and in-breathing capacity of the breather valve or free vent, in Nm³/h of air',
    inputs: [
      { k: 'V', label: 'Tank capacity', unit: 'm³', v: 50 },
      { k: 'fill', label: 'Maximum filling rate', unit: 'm³/h', v: 20, help: 'Largest pump or tanker unloading rate into the tank' },
      { k: 'empty', label: 'Maximum emptying rate', unit: 'm³/h', v: 15, help: 'Largest pump-out or gravity drain rate' },
      { k: 'vol', label: 'Liquid stored', type: 'sel', v: 'v', opts: [['v', 'Volatile: vapour pressure above 5 kPa at storage temperature'], ['n', 'Non-volatile: vapour pressure 5 kPa or below']], help: 'Methanol, acetone, toluene at 40 °C and most process solvents are volatile; water, glycols and heavy oils are not' },
      { k: 'lat', label: 'Latitude of the site', type: 'sel', v: 'lo', opts: [['lo', LAT.lo[0]], ['mid', LAT.mid[0]], ['hi', LAT.hi[0]]] },
      { k: 'vp', label: 'Vapour pressure of the liquid', type: 'sel', v: 'u', opts: [['u', 'Higher than hexane, or not known'], ['h', 'Similar to hexane or lower']], help: 'Hexane is about 20 kPa at 25 °C. Low vapour pressure liquids condense less on cooling, so in-breathing is smaller' },
      { k: 'ts', label: 'Average storage temperature', type: 'sel', v: 'h', opts: [['h', '25 °C or above'], ['l', 'Below 25 °C']], show: function (v) { return v.vp === 'h'; } }
    ].concat(INS),
    example: { v: { V: 200, fill: 40, empty: 30, vol: 'v', lat: 'lo', vp: 'u', ts: 'h', ins: 'n', lin: 50, kin: 0.05, Ap: 60 } },
    run: function (v) {
      if (!(v.V > 0) || v.fill < 0 || v.empty < 0) return { rows: [], notes: [['Enter the tank capacity and the pumping rates.', 'bad']] };
      var Ri = insR(v), Y = LAT[v.lat][1], C = CF[v.lat][v.vp === 'u' ? 2 : (v.ts === 'h' ? 1 : 0)];
      var Vop = (v.vol === 'v' ? 2 : 1) * v.fill, Vip = v.empty;
      var Vot = Y * Math.pow(v.V, 0.9) * Ri, Vit = C * Math.pow(v.V, 0.7) * Ri;
      var out = Vop + Vot, inn = Vip + Vit;
      var notes = [['Out-breathing = filling (' + (v.vol === 'v' ? '2 &times; ' : '') + 'fill rate) + thermal (Y V<sup>0.9</sup> R<sub>i</sub>). In-breathing = emptying rate + thermal (C V<sup>0.7</sup> R<sub>i</sub>).', 'lead']];
      if (v.V > 30000) notes.push(['The general method covers tanks up to 30,000 m³. For a larger tank use a detailed calculation.', 'warn']);
      notes.push(['Not included: flashing of hot or pressurised feed, nitrogen blanketing regulator failure, steam-out, and inert pad gas. Add any of these that apply to your tank.', 'warn']);
      notes.push(['In-breathing is often the larger number. A blocked or undersized vacuum vent collapses a tank at only a few mbar of vacuum.']);
      return { rows: [['Out-breathing required (pressure)', F(out, 1), 'Nm³/h air'], ['In-breathing required (vacuum)', F(inn, 1), 'Nm³/h air'],
        ['Out-breathing from filling', F(Vop, 1), 'Nm³/h'], ['Thermal out-breathing', F(Vot, 1), 'Nm³/h'], ['In-breathing from emptying', F(Vip, 1), 'Nm³/h'], ['Thermal in-breathing', F(Vit, 1), 'Nm³/h'],
        ['Y factor / C factor', G(Y, 2) + ' / ' + G(C, 2), ''], ['Insulation reduction factor Ri', G(Ri, 3), '']], notes: notes };
    },
    refs: [REF]
  });

  /* ---------- emergency venting, fire ---------- */
  K.add('tank-vent-fire', {
    title: 'Emergency venting: fire around the tank (API 2000)',
    sub: 'Wetted area, heat input and the emergency vent capacity in Nm³/h of air',
    inputs: [
      { k: 'shape', label: 'Tank', type: 'sel', v: 'v', opts: [['v', 'Vertical, flat bottom on the ground'], ['h', 'Horizontal'], ['a', 'I know the wetted area']] },
      { k: 'D', label: 'Diameter', unit: 'm', v: 3.5, show: function (v) { return v.shape !== 'a'; } },
      { k: 'H', label: 'Shell height', unit: 'm', v: 5.5, show: function (v) { return v.shape === 'v'; } },
      { k: 'L', label: 'Length', unit: 'm', v: 8, show: function (v) { return v.shape === 'h'; } },
      { k: 'A', label: 'Wetted area', unit: 'm²', v: 60, show: function (v) { return v.shape === 'a'; } },
      { k: 'pd', label: 'Tank design pressure', type: 'sel', v: 'lo', opts: [['lo', '7 kPa (70 mbar) gauge or below'], ['hi', 'Above 7 kPa, up to 103.4 kPa gauge']] },
      { k: 'env', label: 'Protection of the tank', type: 'sel', v: '1', opts: [['1', 'Bare metal tank (F = 1.0)'], ['0.3', 'Fire-proof insulation, 25 mm (F = 0.3)'], ['0.15', 'Fire-proof insulation, 50 mm (F = 0.15)'], ['0.075', 'Fire-proof insulation, 100 mm (F = 0.075)'], ['0.5', 'Impoundment away from the tank (F = 0.5)'], ['0.03', 'Earth-covered above grade (F = 0.03)'], ['c', 'Enter my own F']], help: 'Water spray and ordinary weather insulation get no credit (F = 1.0). Insulation counts only if it stays in place in a fire and under a fire hose' },
      { k: 'Fc', label: 'Environment factor F', v: 1, show: function (v) { return v.env === 'c'; } },
      { k: 'lam', label: 'Latent heat of the liquid', unit: 'kcal/kg', v: 263, help: 'At relieving conditions, from the solvent pages: methanol about 263, toluene 86, hexane 80, acetone 124' },
      { k: 'M', label: 'Molecular weight of the vapour', unit: 'kg/kmol', v: 32.04 },
      { k: 't', label: 'Temperature of the relieving vapour', unit: '°C', v: 65, help: 'Normally the boiling point at the relieving pressure' }
    ],
    example: { v: { shape: 'v', D: 6, H: 7.5, L: 8, A: 60, pd: 'lo', env: '1', Fc: 1, lam: 86, M: 92.14, t: 111 } },
    run: function (v) {
      var A, how;
      if (v.shape === 'v') { A = Math.PI * v.D * Math.min(v.H, 9.14); how = 'shell up to ' + F(Math.min(v.H, 9.14), 2) + ' m above grade; the bottom on the ground is not counted'; }
      else if (v.shape === 'h') { var tot = Math.PI * v.D * v.L + 2 * Math.PI * v.D * v.D / 4; A = 0.75 * tot; how = '75 % of the total surface (flat ends assumed)'; }
      else { A = v.A; how = 'as entered'; }
      var Fe = v.env === 'c' ? v.Fc : +v.env;
      if (!(A > 0) || !(v.lam > 0) || !(v.M > 0) || !(Fe >= 0)) return { rows: [], notes: [['Check the tank size, latent heat, molecular weight and F.', 'bad']] };
      var Q, band;
      if (A < 18.6) { Q = 63150 * A; band = 'Q = 63,150 A'; }
      else if (A < 93) { Q = 224200 * Math.pow(A, 0.566); band = 'Q = 224,200 A^0.566'; }
      else if (A < 260) { Q = 630400 * Math.pow(A, 0.338); band = 'Q = 630,400 A^0.338'; }
      else if (v.pd === 'hi') { Q = 43200 * Math.pow(A, 0.82); band = 'Q = 43,200 A^0.82'; }
      else { Q = 4129700; band = 'Q = 4,129,700 W (constant above 260 m²)'; }
      var Lj = v.lam * 4186.8, T = v.t + 273.15;
      var q = 906.6 * Q * Fe / Lj * Math.sqrt(T / v.M), W = Q * Fe / Lj * 3600;
      var notes = [['q = 906.6 Q F / L &radic;(T / M), in Nm³/h of air, with Q in W, L in J/kg and T in K. Heat input: ' + band + ' (A in m²).', 'lead']];
      notes.push(['Wetted area: ' + how + '.']);
      notes.push(['The emergency vent must pass this full flow at a pressure the tank can stand. The capacity of the normal vents may be counted towards it.', 'warn']);
      notes.push(['A tank with a weak roof-to-shell joint built to API 650 needs no separate emergency vent. Small shop-built tanks usually do not qualify, so they need an emergency vent or manhole cover vent.']);
      return { rows: [['Emergency venting required', F(q, 0), 'Nm³/h air'], ['Vapour generated', F(W, 0), 'kg/h'], ['Heat input Q', F(Q / 1.163, 0), 'kcal/h (' + F(Q / 1000, 0) + ' kW)'], ['Wetted area', F(A, 1), 'm²'], ['Environment factor F', G(Fe, 3), '']], notes: notes };
    },
    refs: [REF]
  });

  /* ---------- vent size ---------- */
  K.add('tank-vent-size', {
    title: 'Vent size for a required flow',
    sub: 'First estimate of the free vent area and nozzle size at the pressure or vacuum the tank can take',
    inputs: [
      { k: 'q', label: 'Required venting capacity', unit: 'Nm³/h air', v: 150, help: 'From the normal or emergency venting calculator' },
      { k: 'dp', label: 'Pressure or vacuum available across the vent', unit: 'mbar', v: 10, help: 'Tank design pressure (or vacuum) minus losses. For a breather valve: the full-open pressure, which is above the set pressure' },
      { k: 'Cd', label: 'Discharge coefficient of the vent', v: 0.6, help: '0.6 for a plain open nozzle or short vent pipe. Lower if there is a flame arrester, weather hood or long pipe' },
      { k: 't', label: 'Gas temperature at the vent', unit: '°C', v: 35 },
      { k: 'n', label: 'Number of identical vents', v: 1 }
    ],
    example: { v: { q: 900, dp: 15, Cd: 0.6, t: 40, n: 1 } },
    run: function (v) {
      if (!(v.q > 0) || !(v.dp > 0) || !(v.Cd > 0) || !(v.n >= 1)) return { rows: [], notes: [['Enter the flow, the pressure available and the discharge coefficient.', 'bad']] };
      var dP = v.dp * 100, P = 101325 + dP / 2, T = v.t + 273.15, rho = P * 28.96 / (8314.5 * T);
      var m = v.q * 1.2922 / 3600, Qact = m / rho, vel = Math.sqrt(2 * dP / rho), A = Qact / (v.Cd * vel), Aeach = A / Math.floor(v.n), d = Math.sqrt(4 * Aeach / Math.PI) * 1000;
      var notes = [['A = Q / (C<sub>d</sub> &radic;(2 &Delta;P / &rho;)), with the air flow converted from normal conditions (0 °C, 1.01325 bar) to the vent temperature.', 'lead']];
      if (v.dp > 150) notes.push(['Above about 150 mbar the gas is compressed noticeably and this simple equation starts to under-predict the area. Use a compressible-flow method.', 'warn']);
      notes.push(['This is for a first check of a nozzle or an open vent. A breather valve, emergency vent or flame arrester must be chosen from the maker&rsquo;s certified flow curve at your set pressure and overpressure, tested to API 2000.', 'warn']);
      notes.push(['API 2000 flows are already expressed as equivalent air, so no correction for the vapour molecular weight is needed here.']);
      return { rows: [['Free vent area required (total)', F(A * 1e6, 0), 'mm² (' + F(A * 1e4, 1) + ' cm²)'], ['Diameter of each vent opening', F(d, 0), 'mm'], ['Nearest pipe size, each', nps(d), ''], ['Velocity through the opening', F(vel * v.Cd, 1), 'm/s'], ['Actual flow at the vent', F(Qact * 3600, 0), 'm³/h'], ['Air density at the vent', G(rho, 4), 'kg/m³']], notes: notes };
    },
    refs: [REFB, REF]
  });
})();
