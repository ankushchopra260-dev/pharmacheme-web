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

  /* Extra: six-question check */
  F.quiz = function (host) {
    var QS = [
      ['A vessel is made 10 times wider with the same shape. Its cooling wall per litre becomes:', ['10 times more', 'The same', '10 times less', '100 times less'], 2, 'Wall per volume is 4 / diameter for this shape, so it falls in step with the diameter.'],
      ['A step is heat-limited. The dosing time in the plant should be set by:', ['The lab dosing time', 'What the jacket can remove, with a margin', 'The shift timing', 'The agitator speed'], 1, 'Heat per litre divided by cooling per litre gives the shortest time. Add a margin.'],
      ['Feed is going in but there is no temperature rise. The first action is to:', ['Dose faster', 'Heat the batch', 'Stop the feed and find out why', 'Wait and watch'], 2, 'No heat means feed is accumulating. Stop adding to the stock, then find the cause.'],
      ['Keeping the same power per litre from 1 L to 10 m³ makes the blend time about:', ['The same', '8 times longer', '8 times shorter', '460 times longer'], 1, 'Speed falls to about one eighth, and blend time goes with 1 / speed.'],
      ['Which of these does NOT change with scale?', ['Heat of reaction per kilogram', 'Heating time', 'Wall per litre', 'Blend time'], 0, 'The chemistry is the same. The equipment around it changes.'],
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
