/* Scale-up Live: five stations for the "Scale-up: lab to plant" training deck (slide "Now you call it").
   All numbers are illustrative and every input is editable. Enter your own plant data. Units: kcal, degC, m, kg. */
(function () {
  'use strict';
  var F = {};
  function $(h, s) { return h.querySelector(s); }
  function n(h, s) { return parseFloat($(h, s).value); }
  function fmt(x, d) { if (!isFinite(x)) return 'n/a'; var a = Math.abs(x); if (a !== 0 && (a < 0.001 || a >= 1e7)) return x.toExponential(1); if (d != null) return x.toFixed(d); return a >= 100 ? Math.round(x).toLocaleString('en-IN') : a >= 10 ? x.toFixed(1) : x.toFixed(2); }
  function num(id, lab, val, step, min) { return '<div><label for="' + id + '">' + lab + '</label><input type="number" id="' + id + '" value="' + val + '" step="' + (step || 'any') + '" min="' + (min != null ? min : 0) + '"></div>'; }
  var instant = false, listeners = [];

  function station(host, html, answerFn) {
    host.innerHTML = '<div class="tk-fx">' + html + '<div class="tk-actions" style="margin:10px 0 0"><button type="button" class="tk-btn primary" data-rv>Reveal the answer</button></div><div class="tk-verdict" data-ans hidden></div></div>';
    var btn = $(host, '[data-rv]'), ans = $(host, '[data-ans]');
    function show() { var r = answerFn(); ans.className = 'tk-verdict ' + r[0]; ans.innerHTML = r[1]; ans.hidden = false; }
    function hide() { if (!instant) ans.hidden = true; else show(); }
    btn.onclick = show;
    host.addEventListener('input', hide); host.addEventListener('change', hide);
    listeners.push(function () { if (instant) show(); else ans.hidden = true; });
    if (instant) show();
  }
  function out(items) { return '<div class="tk-out" style="margin:8px 0 0">' + items.map(function (i) { return '<div><b>' + i[0] + '</b><span>' + i[1] + '</span></div>'; }).join('') + '</div>'; }
  var NOTE = '<p class="tk-cite" style="margin:6px 0 0">Illustrative arithmetic for teaching. Enter your own plant data.</p>';

  /* Cylindrical vessel, height = diameter, jacket on the side wall. V in m3. */
  function geom(V) { var D = Math.pow(4 * V / Math.PI, 1 / 3), A = Math.PI * D * D; return { D: D, A: A, av: A / V }; }

  /* 1. Surface per litre */
  F.s1 = function (host) {
    station(host, '<p><b>Two vessels of the same shape: a lab flask and a plant vessel. How much wall does each litre have?</b></p><div class="tk-row">' +
      num('s1a', 'Lab vessel, litres', 1, 0.5, 0.01) + num('s1b', 'Plant vessel, m&sup3;', 10, 0.5, 0.01) + '</div>',
      function () {
        var Vl = n(host, '#s1a') / 1000, Vp = n(host, '#s1b'), a = geom(Vl), b = geom(Vp), r = a.av / b.av;
        return [r > 5 ? 'warn' : 'ok', 'Each litre of the plant vessel has about <b>' + fmt(r, 1) + ' times less</b> wall than the lab vessel.' +
          out([[fmt(a.D * 100, 1) + ' cm', 'lab diameter'], [fmt(b.D * 100, 0) + ' cm', 'plant diameter'], [fmt(a.A / (Vl * 1000), 4) + ' m&sup2;/L', 'wall per litre, lab'], [fmt(b.A / (Vp * 1000), 4) + ' m&sup2;/L', 'wall per litre, plant']]) +
          '<p class="tk-cite" style="margin:6px 0 0">Model: height equals diameter, jacket on the side wall only. Wall per volume = 4 / diameter, so the ratio is the ratio of the diameters.</p>'];
      });
  };

  /* 2. Shortest dosing time the jacket can follow */
  F.s2 = function (host) {
    station(host, '<p><b>A step releases heat as fast as it is dosed. How fast can the jacket follow?</b></p><div class="tk-row">' +
      num('s2q', 'Heat released, kcal per litre of batch', 25, 1, 0.1) + num('s2u', 'Jacket U, kcal/h&middot;m&sup2;&middot;&deg;C', 150, 10, 10) + num('s2t', 'Jacket driving force, &deg;C', 30, 1, 1) +
      num('s2a', 'Lab vessel, litres', 1, 0.5, 0.01) + num('s2b', 'Plant vessel, m&sup3;', 10, 0.5, 0.01) + num('s2p', 'Planned plant dosing time, h', 2, 0.25, 0.05) + '</div>',
      function () {
        var Q = n(host, '#s2q'), U = n(host, '#s2u'), dT = n(host, '#s2t'), Vl = n(host, '#s2a') / 1000, Vp = n(host, '#s2b'), plan = n(host, '#s2p');
        var cl = U * geom(Vl).av * dT / 1000, cp = U * geom(Vp).av * dT / 1000, tl = Q / cl * 60, tp = Q / cp;
        var bad = plan < tp;
        return [bad ? 'bad' : 'ok', 'The plant jacket removes about <b>' + fmt(cp, 1) + ' kcal/h per litre</b>, so the shortest dosing time it can follow is <b>' + fmt(tp, 1) + ' h</b>. ' +
          (bad ? 'The planned ' + fmt(plan, 2) + ' h is shorter: the heat would build up faster than the jacket removes it. Lengthen the dosing or add cooling.' : 'The planned ' + fmt(plan, 2) + ' h is long enough, with a margin of ' + fmt((plan / tp - 1) * 100, 0) + ' %.') +
          out([[fmt(cl, 0) + ' kcal/h', 'lab cooling per litre'], [fmt(tl, 0) + ' min', 'lab shortest dosing time'], [fmt(cp, 1) + ' kcal/h', 'plant cooling per litre'], [fmt(tp, 1) + ' h', 'plant shortest dosing time']]) +
          '<p class="tk-cite" style="margin:6px 0 0">Cooling per litre = U &times; wall per litre &times; driving force. Reaction heat should be released only as fast as it is dosed. Take real values from calorimetry and your own reactor data.</p>'];
      });
  };

  /* 3. Mixing rule */
  F.s3 = function (host) {
    station(host, '<p><b>Scale the agitator by one rule. What happens to the other numbers?</b></p><div class="tk-row">' +
      num('s3a', 'Lab vessel, litres', 1, 0.5, 0.01) + num('s3b', 'Plant vessel, m&sup3;', 10, 0.5, 0.01) +
      '<div><label for="s3r">Keep constant</label><select id="s3r"><option value="N">Speed (rpm)</option><option value="PV" selected>Power per litre</option><option value="T">Tip speed</option><option value="R">Reynolds number</option></select></div></div>',
      function () {
        var L = Math.pow(n(host, '#s3b') * 1000 / n(host, '#s3a'), 1 / 3), r = $(host, '#s3r').value, N;
        N = r === 'N' ? 1 : r === 'PV' ? Math.pow(L, -2 / 3) : r === 'T' ? 1 / L : 1 / (L * L);
        var tip = N * L, pv = N * N * N * L * L, re = N * L * L, bt = 1 / N;
        var warn = pv > 5 || pv < 0.2 || tip > 3;
        return [warn ? 'warn' : 'ok', 'Length ratio <b>' + fmt(L, 1) + '</b>. Keeping that one thing constant changes the rest:' +
          out([['x ' + fmt(N), 'agitator speed'], ['x ' + fmt(tip), 'tip speed'], ['x ' + fmt(pv), 'power per litre'], ['x ' + fmt(re), 'Reynolds number'], ['x ' + fmt(bt), 'blend time']]) +
          '<p class="tk-cite" style="margin:6px 0 0">Geometrically similar vessels and agitators, turbulent flow. Power per litre goes with speed cubed times diameter squared; blend time goes with 1 / speed. You can protect only one thing, so protect what the step needs.</p>'];
      });
  };

  /* 4. Heat-up time */
  F.s4 = function (host) {
    station(host, '<p><b>How long to heat the batch with the jacket?</b></p><div class="tk-row">' +
      num('s4v', 'Batch volume, m&sup3;', 10, 0.5, 0.001) + num('s4d', 'Density, kg/L', 0.8, 0.05, 0.1) + num('s4c', 'Specific heat, kcal/kg&middot;&deg;C', 0.5, 0.05, 0.1) +
      num('s4a', 'Jacket area, m&sup2;', 17.1, 0.5, 0.001) + num('s4u', 'U, kcal/h&middot;m&sup2;&middot;&deg;C', 150, 10, 10) +
      num('s4i', 'Start, &deg;C', 25, 1, -50) + num('s4f', 'Target, &deg;C', 65, 1, -50) + num('s4s', 'Heating medium, &deg;C', 120, 1, 0) + '</div>',
      function () {
        var V = n(host, '#s4v'), rho = n(host, '#s4d'), cp = n(host, '#s4c'), A = n(host, '#s4a'), U = n(host, '#s4u'), T1 = n(host, '#s4i'), T2 = n(host, '#s4f'), Ts = n(host, '#s4s');
        if (Ts <= T2) return ['bad', 'The heating medium must be hotter than the target temperature.'];
        var m = V * 1000 * rho, mc = m * cp, t = mc / (U * A) * Math.log((Ts - T1) / (Ts - T2)) * 60, q = mc * (T2 - T1);
        return ['ok', 'Heating takes about <b>' + fmt(t, 0) + ' minutes</b> (' + fmt(t / 60, 1) + ' h).' +
          out([[fmt(m, 0) + ' kg', 'batch mass'], [fmt(q, 0) + ' kcal', 'heat needed'], [fmt(U * A, 0) + ' kcal/h&middot;&deg;C', 'U &times; A']]) +
          '<p class="tk-cite" style="margin:6px 0 0">Model: well-mixed batch, constant jacket temperature and U, no heat loss, no reaction. t = (m &times; cp / UA) &times; ln[(Ts &minus; T1) / (Ts &minus; T2)].</p>'];
      });
  };

  /* 5. If cooling stops */
  F.s5 = function (host) {
    station(host, '<p><b>Feed has accumulated and then cooling stops. How hot can the batch get?</b></p><div class="tk-row">' +
      num('s5d', 'Adiabatic temperature rise of the full reaction, &deg;C', 80, 5, 1) + num('s5t', 'Batch temperature now, &deg;C', 40, 1, -50) + num('s5x', 'Unreacted feed accumulated, %', 60, 5, 0) + num('s5b', 'Boiling point of the batch, &deg;C', 65, 1, 0) + '</div>',
      function () {
        var dT = n(host, '#s5d'), T = n(host, '#s5t'), x = Math.min(100, n(host, '#s5x')) / 100, bp = n(host, '#s5b');
        var m = T + x * dT, over = m - bp;
        return [over > 0 ? 'bad' : (m > bp - 10 ? 'warn' : 'ok'), 'If the accumulated feed reacts with no cooling, the batch reaches about <b>' + fmt(m, 0) + ' &deg;C</b>. ' +
          (over > 0 ? 'That is <b>' + fmt(over, 0) + ' &deg;C above the boiling point</b>: boiling, pressure and loss of containment become possible. Cut the feed rate or find out why feed accumulates.' : m > bp - 10 ? 'That is within 10 &deg;C of the boiling point. There is little margin.' : 'That stays below the boiling point, with a margin of ' + fmt(bp - m, 0) + ' &deg;C.') +
          out([[fmt(x * dT, 0) + ' &deg;C', 'rise from accumulated feed'], [fmt(m, 0) + ' &deg;C', 'temperature reached'], [fmt(bp, 0) + ' &deg;C', 'boiling point']]) +
          '<p class="tk-cite" style="margin:6px 0 0">Model: temperature reached = batch temperature + accumulated fraction &times; adiabatic rise. Decomposition or a second reaction can start well before this temperature, so a real study needs calorimetry.</p>'];
      });
  };

  /* Extra: dose-and-cool simulator. Semi-batch, first-order in accumulated feed, jacket control up to its capacity. */
  function runSim(p) {
    var Q = 25, U = 150, C = 0.4, Tj = 10, T0 = 40, Ea = 8420, uj = U * geom(p.VL / 1000).av / 1000;
    var dt = 0.0002, tmax = Math.max(p.td * 1.6 + 1, 2), N = Math.ceil(tmax / dt), T = T0, A = 0, t = 0, stopped = false;
    var o = { t: [], T: [], A: [], peak: T0, maxA: 0, tbp: null, tmax: tmax }, every = Math.max(1, Math.round(tmax / 400 / dt));
    for (var i = 0; i < N; i++) {
      var failed = p.failAt != null && t >= p.failAt; if (failed && p.stopFeed) stopped = true;
      var f = (t < p.td && !stopped) ? 1 / p.td : 0, k = p.k * Math.exp(Ea * (1 / 313.15 - 1 / (T + 273.15)));
      var An = (A + f * dt) / (1 + k * dt), re = A + f * dt - An;
      var cap = failed ? 0 : Math.max(0, uj * (T - Tj) * dt), dem = Math.max(0, Q * re + C * (T - T0) * dt / 0.05);
      T += (Q * re - Math.min(dem, cap)) / C; A = An; t += dt;
      if (T > p.bp && o.tbp == null) o.tbp = t; if (T > o.peak) o.peak = T; if (A > o.maxA) o.maxA = A;
      if (i % every === 0) { o.t.push(t); o.T.push(Math.min(T, 140)); o.A.push(A); }
      if (T > 140) break;
    }
    return o;
  }
  F.sim = function (host) {
    host.innerHTML = '<div class="tk-fx"><p><b>Dose a feed into a batch at 40 &deg;C. The reaction releases 25 kcal per litre. Can the jacket keep up?</b></p><div class="tk-row">' +
      '<div><label for="sm-v">Vessel</label><select id="sm-v"><option value="1">1 L flask</option><option value="100">100 L pilot</option><option value="1000">1 m&sup3;</option><option value="10000" selected>10 m&sup3; plant</option></select></div>' +
      num('sm-t', 'Dosing time, h', 0.17, 0.05, 0.02) +
      '<div><label for="sm-k">Reaction</label><select id="sm-k"><option value="60">Fast: reacts as it is dosed</option><option value="1">Slow: feed builds up</option></select></div>' +
      '<div><label for="sm-f">Cooling</label><select id="sm-f"><option value="0">Works all the time</option><option value="1">Fails halfway, feed stopped</option><option value="2">Fails halfway, feed continues</option></select></div></div>' +
      '<div class="tk-actions" style="margin:8px 0"><button type="button" class="tk-btn" data-p="lab">Lab recipe: 10 min in the flask</button><button type="button" class="tk-btn" data-p="same">Same recipe in the plant</button><button type="button" class="tk-btn" data-p="fix">Plant with 3.5 h dosing</button><button type="button" class="tk-btn" data-p="slow">Slow reaction, cooling fails</button></div>' +
      '<canvas id="sm-c" width="900" height="380" style="width:100%;max-width:900px;background:#0F1C28;border:1px solid var(--grid-line);border-radius:6px" role="img" aria-label="Batch temperature and unreacted feed against time"></canvas>' +
      '<p class="tk-cite" style="margin:4px 0 0"><span style="color:#F2A900">&#9632;</span> batch temperature &nbsp; <span style="color:#6FB3E8">&#9632;</span> unreacted feed in the vessel &nbsp; <span style="color:#E8706B">- -</span> boiling point 65 &deg;C</p>' +
      '<div class="tk-verdict" id="sm-o"></div>' +
      '<p class="tk-cite" style="margin:6px 0 0">Teaching model: one first-order reaction, jacket coolant at 10 &deg;C, U = 150 kcal/h&middot;m&sup2;&middot;&deg;C, height equal to diameter, heat capacity 0.4 kcal/L&middot;&deg;C, no boiling or decomposition modelled. It shows trends, not design values.</p></div>';
    var cv = $(host, '#sm-c'), cx = cv.getContext('2d');
    function draw(o) {
      var W = cv.width, H = cv.height, L = 60, R = 60, Tp = 20, B = 40, pw = W - L - R, ph = H - Tp - B, x = function (t) { return L + t / o.tmax * pw; }, yT = function (T) { return Tp + ph - (T - 20) / 120 * ph; }, yA = function (a) { return Tp + ph - a * ph; };
      cx.clearRect(0, 0, W, H); cx.font = '13px sans-serif'; cx.lineWidth = 1; cx.strokeStyle = '#2A3E50'; cx.fillStyle = '#9FB0BE';
      for (var T = 20; T <= 140; T += 20) { cx.beginPath(); cx.moveTo(L, yT(T)); cx.lineTo(W - R, yT(T)); cx.stroke(); cx.textAlign = 'right'; cx.fillText(T + ' °C', L - 6, yT(T) + 4); cx.textAlign = 'left'; cx.fillText(Math.round((T - 20) / 1.2) + ' %', W - R + 6, yT(T) + 4); }
      cx.textAlign = 'center'; for (var i = 0; i <= 4; i++) { var tt = o.tmax * i / 4; cx.fillText(tt < 1.5 ? Math.round(tt * 60) + ' min' : tt.toFixed(1) + ' h', x(tt), H - 14); }
      cx.setLineDash([6, 5]); cx.strokeStyle = '#E8706B'; cx.beginPath(); cx.moveTo(L, yT(65)); cx.lineTo(W - R, yT(65)); cx.stroke(); cx.setLineDash([]);
      function line(arr, y, col) { cx.strokeStyle = col; cx.lineWidth = 2.5; cx.beginPath(); arr.forEach(function (v, i) { i ? cx.lineTo(x(o.t[i]), y(v)) : cx.moveTo(x(o.t[i]), y(v)); }); cx.stroke(); }
      line(o.A, yA, '#6FB3E8'); line(o.T, yT, '#F2A900');
    }
    function upd() {
      var td = Math.max(0.02, n(host, '#sm-t') || 0.02), fm = $(host, '#sm-f').value, VL = parseFloat($(host, '#sm-v').value);
      var o = runSim({ VL: VL, td: td, k: parseFloat($(host, '#sm-k').value), failAt: fm === '0' ? null : td / 2, stopFeed: fm === '1', bp: 65 }); draw(o);
      var v = $(host, '#sm-o'), lim = 25 / (150 * geom(VL / 1000).av * 30 / 1000), s = 'Peak temperature <b>' + (o.peak >= 140 ? 'above 140' : fmt(o.peak, 0)) + ' &deg;C</b>. Most unreacted feed held at one time: <b>' + fmt(o.maxA * 100, 0) + ' %</b>. Jacket limit for this vessel: about ' + (lim < 1 ? fmt(lim * 60, 0) + ' min' : fmt(lim, 1) + ' h') + ' of dosing. ';
      if (o.tbp != null) { v.className = 'tk-verdict bad'; s += 'The batch passes its boiling point after ' + (o.tbp < 1 ? fmt(o.tbp * 60, 0) + ' min' : fmt(o.tbp, 1) + ' h') + '. In a real vessel this means boiling, pressure and possible loss of containment.'; }
      else if (o.peak > 50 || o.maxA > 0.15) { v.className = 'tk-verdict warn'; s += (o.maxA > 0.15 ? 'A large stock of unreacted feed sits in the vessel. If cooling stops, it keeps reacting even after the feed is stopped.' : 'The temperature leaves the set point. The margin is small.'); }
      else { v.className = 'tk-verdict ok'; s += 'The jacket holds the set point and little feed is waiting to react. Stopping the feed stops the heat.'; }
      v.innerHTML = s;
    }
    var P = { lab: ["1", 0.17, "60", "0"], same: ["10000", 0.17, "60", "0"], fix: ["10000", 3.5, "60", "0"], slow: ['10000', 3.5, '1', '1'] };
    host.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { var p = P[b.getAttribute('data-p')]; $(host, '#sm-v').value = p[0]; $(host, '#sm-t').value = p[1]; $(host, '#sm-k').value = p[2]; $(host, '#sm-f').value = p[3]; upd(); }; });
    host.addEventListener('input', upd); host.addEventListener('change', upd); upd();
  };

  /* ================= Agitators: data shared by the guide and the two simulators =================
     Typical published values for baffled vessels (retreat curve: one baffle). Np = turbulent power number,
     Kp = laminar constant (Np = Kp / Re), Nq = flow number, a = constant in Nu = a Re^(2/3) Pr^(1/3). Confirm with the agitator supplier. */
  var AG = {
    hydro: { n: 'Hydrofoil (3 blades)', flow: 'Axial', Np: 0.3, Kp: 40, Nq: 0.56, dT: 0.4, a: 0.31, S: 7, visc: 'Below about 1,000 cP', use: 'Blending thin liquids, suspending solids, heat transfer, shear-sensitive crystals', avoid: 'Gas dispersion, thick masses', why: 'Most flow for the least power. Low shear.' },
    pbt: { n: 'Pitched blade turbine (4 blades, 45°)', flow: 'Axial with some radial', Np: 1.3, Kp: 50, Nq: 0.79, dT: 0.4, a: 0.53, S: 5.5, visc: 'Below about 10,000 cP', use: 'General purpose: blending, solids suspension, reactions, drawing down floating solids', avoid: 'Very thick masses, large gas flows', why: 'Balanced flow and shear. The workhorse of batch reactors.' },
    rushton: { n: 'Rushton disc turbine (6 blades)', flow: 'Radial', Np: 5.0, Kp: 70, Nq: 0.72, dT: 0.33, a: 0.74, S: 8, visc: 'Below about 10,000 cP', use: 'Gas dispersion (hydrogenation, oxidation), liquid-liquid dispersion, fast reactions at the feed point', avoid: 'Shear-sensitive crystals, suspending heavy solids', why: 'High shear and turbulence at the blade tips. High power for its size.' },
    prop: { n: 'Marine propeller (3 blades)', flow: 'Axial', Np: 0.35, Kp: 40, Nq: 0.5, dT: 0.3, a: 0.54, S: 6.5, visc: 'Below about 2,000 cP', use: 'Small vessels, thin liquids, side-entry mixers on storage tanks', avoid: 'Large reactors, thick masses', why: 'Runs fast and small. Simple and cheap.' },
    retreat: { n: 'Retreat curve impeller (glass-lined)', flow: 'Radial at the bottom, with swirl', Np: 0.35, Kp: 50, Nq: 0.3, dT: 0.6, a: 0.33, S: 0, visc: 'Below about 5,000 cP', use: 'Corrosive duties in glass-lined reactors, general blending with one baffle', avoid: 'Fast mixing-sensitive reactions, difficult solids', why: 'Smooth shape that can be glass coated. Weaker top-to-bottom mixing.' },
    anchor: { n: 'Anchor', flow: 'Tangential (swirl at the wall)', Np: 0.35, Kp: 300, Nq: 0, dT: 0.95, a: 0.36, S: 0, visc: 'About 5,000 to 50,000 cP', use: 'Thick masses, heat transfer at the wall, keeping the wall clean (often with scrapers)', avoid: 'Jobs that need top-to-bottom blending', why: 'Sweeps the wall, so the wall film stays thin. Little vertical flow.' },
    ribbon: { n: 'Helical ribbon', flow: 'Axial at the wall, laminar', Np: 0.35, Kp: 350, Nq: 0, dT: 0.95, a: 0.633, S: 0, visc: 'About 10,000 to 1,000,000 cP', use: 'Very thick masses, polymers, pastes, laminar blending', avoid: 'Thin liquids (wasteful), gas dispersion', why: 'Lifts material along the wall and turns the whole batch over without turbulence.' }
  };
  var AGK = ['hydro', 'pbt', 'rushton', 'prop', 'retreat', 'anchor', 'ribbon'];
  function sel(id, lab, opts, cur) { return '<div><label for="' + id + '">' + lab + '</label><select id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === cur ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>'; }
  function agSel(id, cur) { return sel(id, 'Agitator', AGK.map(function (k) { return [k, AG[k].n]; }), cur); }
  function sketch(k) {
    var s = '<svg viewBox="0 0 120 120" width="96" height="96" aria-hidden="true" style="flex:none"><path d="M20 8V85Q20 112 60 112Q100 112 100 85V8" fill="none" stroke="#6F8496" stroke-width="2.5"/><path d="M21 26H99" stroke="#2C6FB7" stroke-width="1.5" stroke-dasharray="4 3"/>', c = ' fill="none" stroke="#F2A900" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"', sh = function (y) { return '<path d="M60 0V' + y + '" stroke="#C9D4DE" stroke-width="3"/>'; };
    if (k === 'hydro') s += sh(82) + '<path d="M60 82Q46 74 32 84M60 82Q74 90 88 80"' + c + '/>';
    if (k === 'pbt') s += sh(82) + '<path d="M58 78L34 86V93L58 85ZM62 78L86 70V77L62 85Z" fill="#F2A900"/>';
    if (k === 'rushton') s += sh(80) + '<path d="M44 80H76"' + c + '/><path d="M36 71h8v18h-8zM76 71h8v18h-8z" fill="#F2A900"/>';
    if (k === 'prop') s += sh(84) + '<ellipse cx="48" cy="84" rx="12" ry="5" transform="rotate(-25 48 84)" fill="#F2A900"/><ellipse cx="72" cy="84" rx="12" ry="5" transform="rotate(25 72 84)" fill="#F2A900"/>';
    if (k === 'retreat') s += sh(102) + '<path d="M60 102Q40 102 30 82M60 102Q80 102 90 82"' + c + '/><path d="M90 0V62" stroke="#C9D4DE" stroke-width="5"/>';
    if (k === 'anchor') s += sh(104) + '<path d="M27 34V84Q27 104 60 104Q93 104 93 84V34"' + c + '/>';
    if (k === 'ribbon') s += sh(104) + '<path d="M28 22L92 38L28 54L92 70L28 86L92 102"' + c + '/>';
    return s + '</svg>';
  }
  function calc(k, V, rpm, rho, cP, dT) {
    var a = AG[k], T = Math.pow(4 * V / Math.PI, 1 / 3), D = (dT || a.dT) * T, N = rpm / 60, mu = cP / 1000, Re = rho * N * D * D / mu, Np = a.Np + a.Kp / Re;
    var P = Np * rho * N * N * N * Math.pow(D, 5), th = null, note = '', x = Math.pow(Np, 1 / 3) * Re, close = k === 'anchor' || k === 'ribbon';
    if (k === 'ribbon' && Re < 1000) { th = 50 / N; note = 'laminar rule: about 50 revolutions'; }
    else if (k === 'anchor' && Re < 1000) { note = 'An anchor gives little top-to-bottom flow in thick liquids. No reliable blend time.'; }
    else if (!close && Re < 200) { note = 'Too viscous for this impeller: it stirs a small cavern around itself and the rest barely moves.'; }
    else if (x >= 6370) { th = 5.2 / (Math.pow(Np, 1 / 3) * N * Math.pow(D / T, 2)); note = 'turbulent'; }
    else { th = Math.pow(183 / x, 2) * rho * T * T / mu; note = 'transitional: slower than the turbulent rule'; }
    return { T: T, D: D, N: N, Re: Re, Np: Np, P: P, PV: P / 1000 / V, tip: Math.PI * D * N, Q: a.Nq * N * D * D * D, th: th, note: note, regime: Re < (close ? 100 : 10) ? 'laminar' : Re < 10000 ? 'transitional' : 'turbulent' };
  }
  function tm(s) { return s == null ? 'n/a' : s < 90 ? fmt(s, 0) + ' s' : s < 5400 ? fmt(s / 60, 1) + ' min' : fmt(s / 3600, 1) + ' h'; }

  /* Agitator guide */
  F.agi = function (host) {
    host.innerHTML = '<div class="tk-fx"><p><b>Seven common agitators, what each does to the liquid, and where each is used.</b> Pick one to see it move in the mixing simulator below.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px">' + AGK.map(function (k) {
        var a = AG[k];
        return '<div style="display:flex;gap:12px;background:var(--panel);border:1px solid var(--grid-line);border-radius:6px;padding:12px">' + sketch(k) + '<div style="min-width:0"><b style="color:var(--paper)">' + a.n + '</b>' +
          '<p style="margin:4px 0;font-size:.86rem;color:#C9D4DE;line-height:1.45"><b>Flow:</b> ' + a.flow + '. <b>Power number:</b> ' + (k === 'anchor' || k === 'ribbon' ? 'runs laminar, so power rises with viscosity' : a.Np + ' (turbulent)') + '.<br><b>Works best:</b> ' + a.visc + '.<br><b>Used for:</b> ' + a.use + '.<br><b>Not for:</b> ' + a.avoid + '.</p>' +
          '<p style="margin:0 0 6px;font-size:.84rem;color:var(--muted)">' + a.why + '</p><button type="button" class="tk-btn" data-go="' + k + '" style="padding:4px 10px;font-size:.84rem">See it move</button></div></div>';
      }).join('') + '</div><p class="tk-cite" style="margin:8px 0 0">Typical guidance for baffled vessels. Viscosity ranges overlap, and suppliers sell many variants. For gas-liquid reactions, gas-inducing and concave-blade turbines are also used. Confirm the choice with the agitator supplier.</p></div>';
    host.querySelectorAll('[data-go]').forEach(function (b) { b.onclick = function () { var s = document.getElementById('mx-a'); if (!s) return; s.value = b.getAttribute('data-go'); s.dispatchEvent(new Event('change', { bubbles: true })); s.closest('[data-fx]').scrollIntoView({ behavior: 'smooth', block: 'start' }); }; });
  };

  /* Mixing simulator: numbers from correlations, plus a picture of the flow pattern (not CFD). */
  F.mix = function (host) {
    host.innerHTML = '<div class="tk-fx"><p><b>Choose an agitator and a liquid. See the flow pattern, the power, and how long a dye takes to blend.</b></p><div class="tk-row">' +
      agSel('mx-a', 'pbt') + num('mx-v', 'Liquid volume, m&sup3;', 10, 0.5, 0.001) + num('mx-n', 'Speed, rpm', 90, 5, 1) + num('mx-d', 'Impeller / vessel diameter', 0.4, 0.05, 0.1) + num('mx-r', 'Density, kg/m&sup3;', 1000, 10, 100) + num('mx-m', 'Viscosity, cP', 1, 1, 0.1) + '</div>' +
      '<div class="tk-row">' + num('mx-p', 'Solids: particle size, &micro;m (0 = no solids)', 0, 10, 0) + num('mx-s', 'Solid density, kg/m&sup3;', 1500, 50, 500) + num('mx-x', 'Solids, kg per 100 kg liquid', 10, 1, 0.1) + '</div>' +
      '<div class="tk-actions" style="margin:8px 0"><button type="button" class="tk-btn" data-p="thin">Thin solvent, hydrofoil</button><button type="button" class="tk-btn" data-p="gas">Gas dispersion, Rushton</button><button type="button" class="tk-btn" data-p="thick">Thick mass, turbine (wrong choice)</button><button type="button" class="tk-btn" data-p="ribbon">Thick mass, helical ribbon</button><button type="button" class="tk-btn" data-p="lab">1 L lab flask, 400 rpm</button></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;align-items:start"><div><canvas id="mx-c" width="420" height="420" style="width:100%;max-width:420px;background:#0F1C28;border:1px solid var(--grid-line);border-radius:6px" role="img" aria-label="Side view of the vessel showing the flow pattern"></canvas>' +
      '<div class="tk-actions" style="margin:8px 0 0"><button type="button" class="tk-btn primary" id="mx-dye">Add dye at the surface</button><span id="mx-mixed" style="align-self:center;color:#C9D4DE"></span></div></div>' +
      '<div><div id="mx-o"></div><div class="tk-verdict" id="mx-vd" style="margin-top:10px"></div></div></div>' +
      '<p class="tk-cite" style="margin:8px 0 0">Numbers: Re = &rho;ND&sup2;/&mu;; P = Np&rho;N&sup3;D<sup>5</sup>; flow = Nq&middot;N&middot;D&sup3;; blend time to 95 % from the Grenville correlation (Np<sup>1/3</sup>&middot;N&middot;&theta;&middot;(D/T)&sup2; = 5.2 when turbulent, slower when transitional); just-suspended speed from Zwietering. Liquid height equals vessel diameter, one impeller, baffled. The moving picture is a sketch of the pattern whose speed follows the calculated blend time. It is not CFD.</p></div>';
    var cv = $(host, '#mx-c'), cx = cv.getContext('2d'), NP = 520, pts = [], cur = null, key = 'pbt', run = false, still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, seen = true;
    for (var i = 0; i < NP; i++) pts.push({ r: Math.sqrt(Math.random()), a: Math.random() * 6.283, y: Math.random(), d: 0 });
    function vel(p) {
      var u = p.r, y = p.y, vr, vy, sw, pat = key === 'rushton' ? 'rad' : key === 'anchor' ? 'tan' : key === 'ribbon' ? 'rib' : 'ax', yi = key === 'retreat' ? 0.12 : key === 'rushton' ? 0.4 : 0.3;
      function loop(y0, y1, sg) { var s = (y - y0) / (y1 - y0); vr = sg * Math.sin(Math.PI * u) * Math.cos(Math.PI * s) * Math.PI; vy = -sg * Math.cos(Math.PI * u) * Math.sin(Math.PI * s) * Math.PI * (y1 - y0); }
      if (pat === 'rad') { if (y > yi) loop(yi, 1, 1); else loop(0, yi, -1); sw = 0.5; }
      else if (pat === 'tan') { loop(0, 1, 1); vr *= 0.07; vy *= 0.07; sw = 2.2 * u; }
      else if (pat === 'rib') { loop(0, 1, -1); vr *= 0.6; vy *= 0.6; sw = 1.2 * u; }
      else { loop(0, 1, 1); sw = key === 'retreat' ? 1.4 : 0.4; }
      if (cur && cur.cavern) { var dx = u - 0.2, dy = y - yi, f = Math.exp(-(dx * dx + dy * dy) / 0.03); vr *= f; vy *= f; sw *= f; }
      return [vr, vy, sw];
    }
    function mixed() { var c = [], t = [], tot = 0, i, k; for (i = 0; i < 8; i++) { c.push(0); t.push(0); } pts.forEach(function (p) { k = Math.min(3, Math.floor(p.y * 4)) * 2 + (p.r > 0.707 ? 1 : 0); t[k]++; if (p.d) { c[k]++; tot++; } }); if (!tot) return null; var f = tot / NP, v = 0; for (i = 0; i < 8; i++) v += Math.pow((t[i] ? c[i] / t[i] : 0) - f, 2); return Math.max(0, 1 - Math.sqrt(v / 8) / Math.sqrt(f * (1 - f))); }
    function frame() {
      var W = 420, cxm = 210, R = 150, yb = 372, yt = 60, h = yb - yt, sp = cur ? cur.sp : 0.5, df = cur ? cur.df : 0.01, i, p, v;
      cx.clearRect(0, 0, W, W); cx.fillStyle = '#13283A'; cx.beginPath(); cx.moveTo(cxm - R, yt); cx.lineTo(cxm - R, yb - 30); cx.quadraticCurveTo(cxm - R, yb + 10, cxm, yb + 10); cx.quadraticCurveTo(cxm + R, yb + 10, cxm + R, yb - 30); cx.lineTo(cxm + R, yt); cx.closePath(); cx.fill();
      cx.strokeStyle = '#6F8496'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(cxm - R, 24); cx.lineTo(cxm - R, yb - 30); cx.quadraticCurveTo(cxm - R, yb + 10, cxm, yb + 10); cx.quadraticCurveTo(cxm + R, yb + 10, cxm + R, yb - 30); cx.lineTo(cxm + R, 24); cx.stroke();
      for (i = 0; i < NP; i++) { p = pts[i]; if (run) { v = vel(p); p.r += v[0] * 0.006 * sp + (Math.random() - 0.5) * df; p.y += v[1] * 0.006 * sp + (Math.random() - 0.5) * df; p.a += v[2] * 0.02 * sp + (Math.random() - 0.5) * df * 4; if (p.r < 0.02) p.r = 0.04 - p.r; if (p.r > 0.98) p.r = 1.96 - p.r; if (p.y < 0.01) p.y = 0.02 - p.y; if (p.y > 0.99) p.y = 1.98 - p.y; }
        var X = cxm + p.r * Math.cos(p.a) * (R - 6), Y = yb - p.y * h, fr = Math.sin(p.a) > 0; cx.globalAlpha = fr ? 0.95 : 0.45; cx.fillStyle = p.d ? '#FF5C8A' : '#6FB3E8'; cx.beginPath(); cx.arc(X, Y, p.d ? 3.2 : 2, 0, 6.283); cx.fill(); }
      cx.globalAlpha = 1; cx.strokeStyle = '#C9D4DE'; cx.lineWidth = 4; var dr = (cur ? cur.dT : 0.4) * R, iy = yb - (key === 'retreat' ? 0.06 : key === 'rushton' ? 0.4 : 0.3) * h;
      cx.beginPath(); cx.moveTo(cxm, 10); cx.lineTo(cxm, key === 'anchor' || key === 'ribbon' || key === 'retreat' ? yb - 4 : iy); cx.stroke(); cx.strokeStyle = '#F2A900'; cx.fillStyle = '#F2A900'; cx.lineWidth = 5; cx.lineCap = 'round'; cx.beginPath();
      if (key === 'rushton') { cx.moveTo(cxm - dr + 10, iy); cx.lineTo(cxm + dr - 10, iy); cx.stroke(); cx.fillRect(cxm - dr, iy - 16, 10, 32); cx.fillRect(cxm + dr - 10, iy - 16, 10, 32); }
      else if (key === 'anchor') { cx.moveTo(cxm - dr, yt + 60); cx.lineTo(cxm - dr, yb - 34); cx.quadraticCurveTo(cxm - dr, yb, cxm, yb); cx.quadraticCurveTo(cxm + dr, yb, cxm + dr, yb - 34); cx.lineTo(cxm + dr, yt + 60); cx.stroke(); }
      else if (key === 'ribbon') { for (i = 0; i < 6; i++) { cx[i ? 'lineTo' : 'moveTo'](cxm + (i % 2 ? dr : -dr), yt + 30 + i * (h - 50) / 5); } cx.stroke(); }
      else if (key === 'retreat') { cx.moveTo(cxm, yb - 4); cx.quadraticCurveTo(cxm - dr * 0.7, yb - 4, cxm - dr, yb - 60); cx.moveTo(cxm, yb - 4); cx.quadraticCurveTo(cxm + dr * 0.7, yb - 4, cxm + dr, yb - 60); cx.stroke(); }
      else { var t = key === 'pbt' ? 12 : 7; cx.moveTo(cxm, iy); cx.lineTo(cxm - dr, iy + t); cx.moveTo(cxm, iy); cx.lineTo(cxm + dr, iy - t); cx.stroke(); }
      var m = mixed(); $(host, '#mx-mixed').textContent = m == null ? '' : 'Dye blended: ' + Math.round(m * 100) + ' %';
      if (run && seen) requestAnimationFrame(frame);
    }
    function upd() {
      key = $(host, '#mx-a').value; var V = n(host, '#mx-v'), rpm = n(host, '#mx-n'), dT = n(host, '#mx-d'), rho = n(host, '#mx-r'), cP = n(host, '#mx-m'), a = AG[key], r = calc(key, V, rpm, rho, cP, dT);
      cur = { dT: Math.min(0.97, dT), cavern: r.th == null && key !== 'anchor', sp: r.th ? Math.max(0.12, Math.min(2.5, 25 / r.th)) : 0.2, df: r.regime === 'turbulent' ? 0.02 : r.regime === 'transitional' ? 0.008 : 0.0015 };
      var rows = [[fmt(r.Re, 0), 'Reynolds number: ' + r.regime], [fmt(r.P / 1000) + ' kW', 'shaft power (Np = ' + fmt(r.Np) + ')'], [fmt(r.PV) + ' kW/m&sup3;', 'power per volume'], [fmt(r.tip) + ' m/s', 'tip speed'], [a.Nq ? fmt(r.Q * 3600, 0) + ' m&sup3;/h' : 'n/a', a.Nq ? 'pumping: the batch turns over every ' + tm(V / r.Q) : 'pumping (no simple rule for this type)'], [tm(r.th), 'blend time to 95 %' + (r.th ? ' (' + r.note + ')' : '')]];
      var dp = n(host, '#mx-p'), msg = [], cls = 'ok';
      if (dp > 0) { if (a.S) { var rs = n(host, '#mx-s'), X = n(host, '#mx-x'), nu = cP / 1000 / rho, Njs = a.S * Math.pow(nu, 0.1) * Math.pow(dp * 1e-6, 0.2) * Math.pow(9.81 * Math.max(1, rs - rho) / rho, 0.45) * Math.pow(X, 0.13) / Math.pow(r.D, 0.85) * 60; rows.push([fmt(Njs, 0) + ' rpm', 'just-suspended speed (S = ' + a.S + ')']); if (rpm < Njs) { cls = 'warn'; msg.push('Solids are not fully suspended: the speed is below the just-suspended speed, so some sit on the bottom.'); } else msg.push('Solids are suspended (speed is above the just-suspended speed).'); } else msg.push('No simple suspension rule for this agitator type.'); }
      if (r.th == null) { cls = 'bad'; msg.unshift(r.note + ' Use an anchor with scrapers for heat transfer, or a helical ribbon for blending.'); }
      else { if (r.regime !== 'turbulent' && key !== 'anchor' && key !== 'ribbon') { if (cls === 'ok') cls = 'warn'; msg.push('The flow is not fully turbulent, so blending is slower and baffles do less.'); }
        if ((key === 'anchor' || key === 'ribbon') && r.regime === 'turbulent') { if (cls === 'ok') cls = 'warn'; msg.push('This liquid is thin. A close-clearance agitator works, but a hydrofoil or pitched blade turbine blends it with far less metal.'); }
        if (r.PV > 3 && key !== 'anchor' && key !== 'ribbon') { cls = 'warn'; msg.push('Power per volume is above about 3 kW/m&sup3;, which is high for a batch reactor. Check the motor and the shaft.'); } else if (r.PV < 0.05 && r.regime === 'turbulent') msg.push('Power per volume is low: fine for gentle blending, weak for solids or reactions.');
        if (r.tip > 6) { cls = 'warn'; msg.push('Tip speed is above about 6 m/s: high shear, and above the usual limit for glass-lined agitators.'); }
        if (!msg.length && (key === 'anchor' || key === 'ribbon')) msg.push('Laminar blending: a close-clearance agitator moves the whole batch, not just the zone around the blades. High power per volume is normal for thick masses.');
        if (!msg.length) msg.push('A workable set-up. Typical ranges: 0.1 to 0.5 kW/m&sup3; for blending, 0.5 to 1.5 for solids and reactions, 1 to 3 for gas dispersion.'); }
      $(host, '#mx-o').innerHTML = out(rows); var v = $(host, '#mx-vd'); v.className = 'tk-verdict ' + cls; v.innerHTML = msg.join(' ');
      if (!run) frame();
    }
    function start() { if (!run) { run = true; requestAnimationFrame(frame); } }
    $(host, '#mx-dye').onclick = function () { pts.forEach(function (p) { p.d = 0; }); var c = 0; pts.forEach(function (p) { if (c < 70 && p.y > 0.86 && Math.cos(p.a) > 0.2) { p.d = 1; c++; } }); pts.forEach(function (p) { if (c < 70 && !p.d) { p.y = 0.9 + Math.random() * 0.09; p.r = 0.3 + Math.random() * 0.5; p.a = (Math.random() - 0.5); p.d = 1; c++; } }); start(); };
    var P = { thin: ['hydro', 10, 80, 0.4, 800, 0.6], gas: ['rushton', 10, 110, 0.33, 1000, 1], thick: ['pbt', 10, 60, 0.4, 1100, 50000], ribbon: ['ribbon', 10, 20, 0.95, 1100, 50000], lab: ['pbt', 0.001, 400, 0.5, 1000, 1] };
    host.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { var p = P[b.getAttribute('data-p')]; ['#mx-a', '#mx-v', '#mx-n', '#mx-d', '#mx-r', '#mx-m'].forEach(function (s, i) { $(host, s).value = p[i]; }); upd(); }; });
    $(host, '#mx-a').addEventListener('change', function () { $(host, '#mx-d').value = AG[$(host, '#mx-a').value].dT; });
    host.addEventListener('input', upd); host.addEventListener('change', upd);
    if (window.IntersectionObserver) new IntersectionObserver(function (e) { var was = seen; seen = e[0].isIntersecting; if (seen && !was && run) requestAnimationFrame(frame); }).observe(cv);
    upd(); if (!still) start();
  };

  /* Heat-transfer simulator: inside film from Nu = a Re^(2/3) Pr^(1/3), then wall, fouling and jacket film in series. Units kcal, h, m, degC. */
  F.ht = function (host) {
    var FL = { water: ['Water', 995, 0.8, 1.0, 0.53], meoh: ['Methanol', 790, 0.55, 0.6, 0.17], tol: ['Toluene', 865, 0.56, 0.41, 0.11], thick: ['Thick organic mass', 1100, 5000, 0.5, 0.15] };
    var WL = { ss: ['Stainless steel 316, 12 mm', 0.012 / 14], gl: ['Glass-lined steel: 1.5 mm glass on 16 mm steel', 0.0015 / 0.86 + 0.016 / 38.7], hc: ['Hastelloy C, 10 mm', 0.010 / 8.6], lab: ['Lab glass flask, 3 mm', 0.003 / 0.97] };
    var JK = { cw: ['Cooling water, plain jacket', 1000], hp: ['Cooling water, half-pipe or baffled jacket', 2500], br: ['Brine or glycol', 500], st: ['Condensing steam', 5000], oil: ['Hot oil', 400] };
    function o(m) { return Object.keys(m).map(function (k) { return [k, m[k][0]]; }); }
    host.innerHTML = '<div class="tk-fx"><p><b>Where does the resistance to heat flow sit, and what does more agitator speed buy?</b></p><div class="tk-row">' +
      agSel('ht-a', 'pbt') + num('ht-v', 'Liquid volume, m&sup3;', 10, 0.5, 0.001) + num('ht-n', 'Speed, rpm', 90, 5, 1) + sel('ht-f', 'Liquid', o(FL), 'meoh') + sel('ht-w', 'Vessel wall', o(WL), 'ss') + sel('ht-j', 'Jacket service', o(JK), 'cw') + '</div><div class="tk-row">' +
      num('ht-r', 'Density, kg/m&sup3;', 790, 10, 100) + num('ht-m', 'Viscosity, cP', 0.55, 0.1, 0.05) + num('ht-c', 'Specific heat, kcal/kg&middot;&deg;C', 0.6, 0.05, 0.1) + num('ht-k', 'Conductivity, kcal/h&middot;m&middot;&deg;C', 0.17, 0.01, 0.01) + num('ht-h', 'Jacket film, kcal/h&middot;m&sup2;&middot;&deg;C', 1000, 50, 10) + num('ht-o', 'Fouling, h&middot;m&sup2;&middot;&deg;C/kcal', 0.0004, 0.0001, 0) + num('ht-t', 'Batch minus jacket, &deg;C', 30, 1, 1) + '</div>' +
      '<div class="tk-actions" style="margin:8px 0"><button type="button" class="tk-btn" data-p="ss">Solvent in stainless steel</button><button type="button" class="tk-btn" data-p="gl">Same in glass-lined</button><button type="button" class="tk-btn" data-p="thick">Thick mass, anchor</button><button type="button" class="tk-btn" data-p="lab">1 L glass lab flask</button></div>' +
      '<div id="ht-o1"></div><p style="margin:12px 0 4px;color:#C9D4DE"><b>Share of the total resistance</b></p><div id="ht-bar" style="display:flex;height:34px;border-radius:6px;overflow:hidden;border:1px solid var(--grid-line)"></div><p class="tk-cite" id="ht-leg" style="margin:4px 0 0"></p>' +
      '<p style="margin:14px 0 4px;color:#C9D4DE"><b>If you change the speed</b></p><canvas id="ht-c2" width="900" height="300" style="width:100%;max-width:900px;background:#0F1C28;border:1px solid var(--grid-line);border-radius:6px" role="img" aria-label="Overall coefficient and agitator power against speed"></canvas>' +
      '<p class="tk-cite" style="margin:4px 0 0"><span style="color:#F2A900">&#9632;</span> overall U &nbsp; <span style="color:#E8706B">&#9632;</span> agitator power &nbsp; <span style="color:#C9D4DE">&#9679;</span> your speed</p><div class="tk-verdict" id="ht-vd" style="margin-top:10px"></div>' +
      '<p class="tk-cite" style="margin:8px 0 0">Inside film: Nu = a&middot;Re<sup>2/3</sup>&middot;Pr<sup>1/3</sup> with a typical constant for each agitator (anchor and helical ribbon use their own low-Reynolds forms), no wall-viscosity correction. Wall, fouling and jacket film are added in series: 1/U = 1/h<sub>i</sub> + wall + fouling + 1/h<sub>j</sub>. Jacket on the side wall, liquid height equal to diameter. Jacket film values are typical and can be edited. Use measured U from your own vessel for design.</p></div>';
    var cv = $(host, '#ht-c2'), cx = cv.getContext('2d');
    function U(k, V, rpm, rho, cP, cp, kk, rw, hj, rf) {
      var r = calc(k, V, rpm, rho, cP), Pr = cp * cP * 3.6 / kk, Nu = k === 'ribbon' ? 0.633 * Math.sqrt(r.Re) : k === 'anchor' && r.Re < 300 ? Math.sqrt(r.Re) : AG[k].a * Math.pow(r.Re, 2 / 3);
      var hi = Nu * Math.pow(Pr, 1 / 3) * kk / r.T, R = [1 / hi, rw, rf, 1 / hj], tot = R[0] + R[1] + R[2] + R[3];
      return { hi: hi, U: 1 / tot, R: R, tot: tot, c: r, A: Math.PI * r.T * r.T };
    }
    function upd() {
      var k = $(host, '#ht-a').value, V = n(host, '#ht-v'), rpm = n(host, '#ht-n'), rho = n(host, '#ht-r'), cP = n(host, '#ht-m'), cp = n(host, '#ht-c'), kk = n(host, '#ht-k'), hj = n(host, '#ht-h'), rf = n(host, '#ht-o'), dT = n(host, '#ht-t'), rw = WL[$(host, '#ht-w').value][1];
      var a = U(k, V, rpm, rho, cP, cp, kk, rw, hj, rf), duty = a.U * a.A * dT, heat = a.c.P / 1000 * 860, b = U(k, V, rpm * 2, rho, cP, cp, kk, rw, hj, rf);
      $(host, '#ht-o1').innerHTML = out([[fmt(a.hi, 0), 'inside film h<sub>i</sub>, kcal/h&middot;m&sup2;&middot;&deg;C'], [fmt(a.U, 0), 'overall U, kcal/h&middot;m&sup2;&middot;&deg;C'], [fmt(a.A) + ' m&sup2;', 'jacket area'], [fmt(duty, 0) + ' kcal/h', 'heat removed at ' + dT + ' &deg;C difference'], [fmt(duty / (V * 1000)) + ' kcal/h', 'per litre of batch'], [fmt(heat, 0) + ' kcal/h', 'heat put in by the agitator (' + fmt(a.c.P / 1000) + ' kW)']]);
      var nm = ['Inside film', 'Wall', 'Fouling', 'Jacket film'], col = ['#F2A900', '#6FB3E8', '#9FB0BE', '#5FD09A'], sh = a.R.map(function (x) { return x / a.tot * 100; }), mx = sh.indexOf(Math.max.apply(null, sh));
      $(host, '#ht-bar').innerHTML = sh.map(function (s, i) { return '<div title="' + nm[i] + '" style="width:' + s + '%;background:' + col[i] + '"></div>'; }).join('');
      $(host, '#ht-leg').innerHTML = sh.map(function (s, i) { return '<span style="color:' + col[i] + '">&#9632;</span> ' + nm[i] + ' ' + fmt(s, 0) + ' %'; }).join(' &nbsp; ');
      var W = 900, H = 300, L = 70, R = 80, Tp = 16, B = 40, pw = W - L - R, ph = H - Tp - B, xs = [], us = [], ps = [], i, f;
      for (i = 0; i <= 44; i++) { f = 0.25 + i * (3 - 0.25) / 44; var q = U(k, V, rpm * f, rho, cP, cp, kk, rw, hj, rf); xs.push(rpm * f); us.push(q.U); ps.push(q.c.P / 1000); }
      var um = Math.max.apply(null, us) * 1.15, pm = Math.max.apply(null, ps) * 1.05, X = function (x) { return L + (x - xs[0]) / (xs[44] - xs[0]) * pw; };
      cx.clearRect(0, 0, W, H); cx.font = '13px sans-serif'; cx.strokeStyle = '#2A3E50'; cx.lineWidth = 1;
      for (i = 0; i <= 4; i++) { var yy = Tp + ph - i / 4 * ph; cx.beginPath(); cx.moveTo(L, yy); cx.lineTo(W - R, yy); cx.stroke(); cx.fillStyle = '#F2A900'; cx.textAlign = 'right'; cx.fillText(fmt(um * i / 4, 0), L - 8, yy + 4); cx.fillStyle = '#E8706B'; cx.textAlign = 'left'; cx.fillText(fmt(pm * i / 4) + ' kW', W - R + 8, yy + 4); }
      cx.fillStyle = '#9FB0BE'; cx.textAlign = 'center'; for (i = 0; i <= 4; i++) { var xr = xs[0] + (xs[44] - xs[0]) * i / 4; cx.fillText(fmt(xr, 0) + ' rpm', X(xr), H - 14); }
      function ln(arr, m, c) { cx.strokeStyle = c; cx.lineWidth = 2.5; cx.beginPath(); arr.forEach(function (v, j) { var y = Tp + ph - v / m * ph; j ? cx.lineTo(X(xs[j]), y) : cx.moveTo(X(xs[j]), y); }); cx.stroke(); }
      ln(ps, pm, '#E8706B'); ln(us, um, '#F2A900'); cx.fillStyle = '#EEF1F3'; cx.beginPath(); cx.arc(X(rpm), Tp + ph - a.U / um * ph, 6, 0, 6.283); cx.fill();
      var v = $(host, '#ht-vd'), gain = (b.U / a.U - 1) * 100, s = '<b>' + nm[mx] + '</b> is the largest resistance (' + fmt(sh[mx], 0) + ' %). Doubling the speed raises U by only <b>' + fmt(gain, 0) + ' %</b> and multiplies the agitator power by about ' + fmt(b.c.P / a.c.P, 1) + '. ';
      s += mx === 0 ? 'Here the liquid film controls, so agitation, a wall-sweeping agitator or a thinner liquid helps most.' : mx === 1 ? 'The wall controls. More speed cannot fix that: use more area, a colder jacket or a longer dosing time.' : mx === 3 ? 'The jacket side controls. Raise the jacket flow, use a half-pipe or baffled jacket, or a colder service.' : 'Fouling controls. Clean the jacket and the wall.';
      if (heat > 0.25 * duty) s += ' The agitator itself adds heat equal to ' + fmt(heat / duty * 100, 0) + ' % of the cooling duty.';
      if (a.c.Re < 400 && k !== 'anchor' && k !== 'ribbon') s += ' Reynolds number is ' + fmt(a.c.Re, 0) + ': too low for this correlation and this impeller. Treat the result as optimistic.';
      v.className = 'tk-verdict ' + (gain < 15 ? 'warn' : 'ok'); v.innerHTML = s;
    }
    function fill() { var f = FL[$(host, '#ht-f').value]; $(host, '#ht-r').value = f[1]; $(host, '#ht-m').value = f[2]; $(host, '#ht-c').value = f[3]; $(host, '#ht-k').value = f[4]; }
    $(host, '#ht-f').addEventListener('change', fill); $(host, '#ht-j').addEventListener('change', function () { $(host, '#ht-h').value = JK[$(host, '#ht-j').value][1]; });
    var P = { ss: ['pbt', 10, 90, 'meoh', 'ss', 'cw'], gl: ['retreat', 10, 90, 'meoh', 'gl', 'cw'], thick: ['anchor', 10, 30, 'thick', 'ss', 'cw'], lab: ['pbt', 0.001, 400, 'meoh', 'lab', 'cw'] };
    host.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { var p = P[b.getAttribute('data-p')]; ['#ht-a', '#ht-v', '#ht-n', '#ht-f', '#ht-w', '#ht-j'].forEach(function (s, i) { $(host, s).value = p[i]; }); fill(); $(host, '#ht-h').value = JK[p[5]][1]; upd(); }; });
    host.addEventListener('input', upd); host.addEventListener('change', upd); upd();
  };

  /* Extra: short quiz */
  F.quiz = function (host) {
    var QS = [
      ['A vessel is made 10 times wider with the same shape. Its cooling wall per litre becomes:', ['10 times more', 'The same', '10 times less', '100 times less'], 2, 'Wall per volume is 4 / diameter for this shape, so it falls in step with the diameter.'],
      ['A step is heat-limited. The dosing time in the plant should be set by:', ['The lab dosing time', 'What the jacket can remove, with a margin', 'The shift timing', 'The agitator speed'], 1, 'Heat per litre divided by cooling per litre gives the shortest time. Add a margin.'],
      ['Feed is going in but there is no temperature rise. The first action is to:', ['Dose faster', 'Heat the batch', 'Stop the feed and find out why', 'Wait and watch'], 2, 'No heat means feed is accumulating. Stop adding to the stock, then find the cause.'],
      ['Keeping the same power per litre from 1 L to 10 m³ makes the blend time about:', ['The same', '8 times longer', '8 times shorter', '460 times longer'], 1, 'Speed falls to about one eighth, and blend time goes with 1 / speed.'],
      ['Which of these does NOT change with scale?', ['Heat of reaction per kilogram', 'Heating time', 'Wall per litre', 'Blend time'], 0, 'The chemistry is the same. The equipment around it changes.'],
      ['A thick mass of about 20,000 cP needs blending from top to bottom. The better agitator is:', ['Hydrofoil', 'Rushton turbine', 'Helical ribbon', 'Marine propeller'], 2, 'Turbines only stir a small zone in thick liquids. A helical ribbon turns the whole batch over.'],
      ['In a glass-lined reactor with a thin solvent, the largest resistance to heat flow is usually:', ['The liquid film inside', 'The glass and steel wall', 'The agitator', 'The vessel lid'], 1, 'Glass conducts heat poorly, so the wall controls and extra speed buys little.'],
      ['Doubling the agitator speed in turbulent flow multiplies the power by about:', ['2', '4', '8', '16'], 2, 'Power goes with speed cubed: 2 × 2 × 2 = 8.'],
      ['60 % of the feed has accumulated, the adiabatic rise is 80 °C and the batch is at 40 °C. If cooling stops it can reach about:', ['48 °C', '65 °C', '88 °C', '120 °C'], 2, '40 + 0.6 × 80 = 88 °C.']];
    var ans = QS.map(function () { return -1; });
    function render() {
      var done = ans.filter(function (a) { return a >= 0; }).length, sc = ans.filter(function (a, i) { return a === QS[i][2]; }).length;
      host.innerHTML = '<div class="tk-fx">' + QS.map(function (q, i) {
        return '<div style="margin:0 0 18px"><p style="margin:0 0 8px"><b>' + (i + 1) + '. ' + q[0] + '</b></p><div class="tk-actions" style="margin:0">' + q[1].map(function (o, j) {
          var st = ans[i] < 0 ? '' : j === q[2] ? 'border-color:#5FD09A;color:#5FD09A' : j === ans[i] ? 'border-color:#E8706B;color:#E8706B' : 'opacity:.55';
          return '<button type="button" class="tk-btn" data-q="' + i + '" data-o="' + j + '" style="' + st + '"' + (ans[i] >= 0 ? ' disabled' : '') + '>' + o + '</button>';
        }).join('') + '</div>' + (ans[i] >= 0 ? '<p class="tk-cite" style="margin:6px 0 0">' + (ans[i] === q[2] ? 'Correct. ' : 'Not quite. ') + q[3] + '</p>' : '') + '</div>';
      }).join('') + '<div class="tk-verdict ' + (done < QS.length ? '' : sc >= 5 ? 'ok' : sc >= 3 ? 'warn' : 'bad') + '">' + (done < QS.length ? 'Answered ' + done + ' of ' + QS.length + '.' : 'Score: <b>' + sc + ' of ' + QS.length + '</b>. ' + (sc >= 5 ? 'Ready to ask the five questions on a real product.' : 'Go back to the slides for the ones you missed, then try again.')) + '</div>' +
        '<div class="tk-actions" style="margin:10px 0 0"><button type="button" class="tk-btn" data-reset>Start again</button></div></div>';
      host.querySelectorAll('[data-q]').forEach(function (b) { b.onclick = function () { ans[+b.getAttribute('data-q')] = +b.getAttribute('data-o'); render(); }; });
      $(host, '[data-reset]').onclick = function () { ans = QS.map(function () { return -1; }); render(); };
    }
    render();
  };

  var sw = document.getElementById('live-instant');
  if (sw) sw.addEventListener('change', function () { instant = sw.checked; listeners.forEach(function (f) { f(); }); });
  document.querySelectorAll('[data-fx]').forEach(function (el) { var f = F[el.getAttribute('data-fx')]; if (f) f(el); });
})();
