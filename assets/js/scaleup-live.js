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

  var sw = document.getElementById('live-instant');
  if (sw) sw.addEventListener('change', function () { instant = sw.checked; listeners.forEach(function (f) { f(); }); });
  document.querySelectorAll('[data-fx]').forEach(function (el) { var f = F[el.getAttribute('data-fx')]; if (f) f(el); });
})();
