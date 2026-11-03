/* Pump Room Live: five stations for the "Pumps, seals and vacuum for operators" training deck (slide "Now you call it"),
   plus a pump curve simulator. The room decides, then the trainer presses Reveal. Teaching models, typical values. */
(function () {
  'use strict';
  var F = {};
  function $(host, sel) { return host.querySelector(sel); }
  function fmt(x, d) { if (!isFinite(x)) return 'n/a'; var a = Math.abs(x); if (a !== 0 && (a < 0.01 || a >= 1e5)) return x.toExponential(1); return x.toFixed(d == null ? (a < 10 ? 2 : a < 100 ? 1 : 0) : d); }
  var instant = false;
  var listeners = [];
  var G = 9.81, PATM = 101325;

  /* Liquids: density kg/m3 (about 20 to 30 C, held constant) and Antoine constants, log10(P mmHg) = A - B / (C + T degC). */
  var LIQ = {
    water:   { n: 'Water',         rho: 1000, A: 8.07131, B: 1730.63,  C: 233.426 },
    methanol:{ n: 'Methanol',      rho: 790,  A: 8.08097, B: 1582.271, C: 239.726 },
    ethanol: { n: 'Ethanol',       rho: 789,  A: 8.20417, B: 1642.89,  C: 230.3 },
    acetone: { n: 'Acetone',       rho: 790,  A: 7.11714, B: 1210.595, C: 229.664 },
    ipa:     { n: 'IPA',           rho: 785,  A: 8.11778, B: 1580.92,  C: 219.61 },
    etoac:   { n: 'Ethyl acetate', rho: 900,  A: 7.10179, B: 1244.95,  C: 217.88 },
    toluene: { n: 'Toluene',       rho: 867,  A: 6.95464, B: 1344.8,   C: 219.482 },
    heptane: { n: 'n-Heptane',     rho: 684,  A: 6.89385, B: 1264.37,  C: 216.636 }
  };
  function opts(sel) { return Object.keys(LIQ).map(function (k) { return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + LIQ[k].n + '</option>'; }).join(''); }
  function pvPa(k, T) { var s = LIQ[k]; return 133.322 * Math.pow(10, s.A - s.B / (s.C + T)); }
  function tbAt(k, Ppa) { var s = LIQ[k]; return s.B / (s.A - Math.log10(Ppa / 133.322)) - s.C; }

  function station(host, html, answerFn) {
    host.innerHTML = '<div class="tk-fx">' + html + '<div class="tk-actions" style="margin:10px 0 0"><button type="button" class="tk-btn primary" data-rv>Reveal the answer</button></div><div class="tk-verdict" data-ans hidden role="status"></div></div>';
    var btn = $(host, '[data-rv]'), ans = $(host, '[data-ans]');
    function show() { var r = answerFn(); ans.className = 'tk-verdict ' + r[0]; ans.innerHTML = r[1]; ans.hidden = false; }
    function hide() { if (!instant) ans.hidden = true; else show(); }
    btn.onclick = show;
    host.addEventListener('input', hide); host.addEventListener('change', hide);
    listeners.push(function () { if (instant) show(); else ans.hidden = true; });
    return { hide: hide, show: show };
  }

  /* 1. Will it cavitate? NPSH available against NPSH required */
  F.s1 = function (host) {
    station(host,
      '<div class="tk-row"><div><label for="p1l">Liquid</label><select id="p1l">' + opts('acetone') + '</select></div>' +
      '<div><label for="p1t">Temperature: <span class="tk-val" id="p1tv"></span> &deg;C</label><input type="range" id="p1t" min="5" max="90" step="1" value="40"></div>' +
      '<div><label for="p1p">Pressure on the liquid surface: <span class="tk-val" id="p1pv"></span> barg</label><input type="range" id="p1p" min="-0.8" max="1" step="0.05" value="0"></div></div>' +
      '<div class="tk-row"><div><label for="p1z">Liquid level above pump centreline: <span class="tk-val" id="p1zv"></span> m</label><input type="range" id="p1z" min="-3" max="6" step="0.1" value="0.5"></div>' +
      '<div><label for="p1h">Suction line losses: <span class="tk-val" id="p1hv"></span> m</label><input type="range" id="p1h" min="0" max="5" step="0.1" value="1"></div>' +
      '<div><label for="p1r">Pump NPSH required: <span class="tk-val" id="p1rv"></span> m</label><input type="range" id="p1r" min="1" max="10" step="0.5" value="4"></div></div>' +
      '<div class="tk-out" id="p1o"></div><div class="tk-bar" id="p1b" aria-hidden="true"><i></i><u></u></div>',
      function () { var c = calc(); var m = c.avail - c.req;
        if (c.avail <= 0) return ['bad', 'NPSH available is ' + fmt(c.avail) + ' m: the liquid is at or past boiling at the suction. The pump will vapour-lock or run dry.'];
        if (m <= 0) return ['bad', 'Cavitates. Available ' + fmt(c.avail) + ' m is below the ' + fmt(c.req) + ' m the pump needs. Expect gravel noise, vibration and falling flow.'];
        if (m < 1 || c.avail < 1.3 * c.req) return ['warn', 'Marginal. Available ' + fmt(c.avail) + ' m against ' + fmt(c.req) + ' m needed leaves ' + fmt(m) + ' m. Keep at least 1 m and about 30 % extra. A warm day or a dirty strainer can tip it.'];
        return ['ok', 'Go. Available ' + fmt(c.avail) + ' m against ' + fmt(c.req) + ' m needed, a margin of ' + fmt(m) + ' m.']; });
    function calc() {
      var k = $(host, '#p1l').value, T = +$(host, '#p1t').value, pg = +$(host, '#p1p').value, z = +$(host, '#p1z').value, hf = +$(host, '#p1h').value, req = +$(host, '#p1r').value;
      var rho = LIQ[k].rho, pabs = PATM + pg * 1e5, pv = pvPa(k, T);
      return { avail: (pabs - pv) / (rho * G) + z - hf, req: req, pv: pv, pabs: pabs, rho: rho };
    }
    function upd() {
      var c = calc();
      $(host, '#p1tv').textContent = $(host, '#p1t').value; $(host, '#p1pv').textContent = (+$(host, '#p1p').value).toFixed(2);
      $(host, '#p1zv').textContent = (+$(host, '#p1z').value).toFixed(1); $(host, '#p1hv').textContent = (+$(host, '#p1h').value).toFixed(1); $(host, '#p1rv').textContent = (+$(host, '#p1r').value).toFixed(1);
      $(host, '#p1o').innerHTML = '<div><b>' + fmt(c.pv / 1000) + ' kPa</b><span>vapour pressure</span></div><div><b>' + fmt(c.avail) + ' m</b><span>NPSH available</span></div><div><b>' + fmt(c.req) + ' m</b><span>NPSH required</span></div>';
      var max = Math.max(12, c.avail * 1.1, c.req * 1.4), bar = $(host, '#p1b'), i = bar.firstChild;
      i.style.width = Math.max(0, Math.min(100, 100 * c.avail / max)) + '%'; i.style.background = c.avail - c.req > 1 && c.avail >= 1.3 * c.req ? '#5FD09A' : (c.avail > c.req ? '#F2A33C' : '#E8706B');
      bar.querySelector('u').style.left = Math.min(100, 100 * c.req / max) + '%';
    }
    host.addEventListener('input', upd); upd();
  };

  /* Pump and system model shared by s2 and the simulator.
     Pump: H = H0 - kp Q^2 (m, Q in m3/h). System: H = Hs + (Kpipe + Kvalve) Q^2, Kvalve = Kv0 (1/f^2 - 1), f = opening 0.05 to 1.
     Efficiency parabola peaking at the best efficiency point (BEP) at 120 m3/h. NPSH required rises with flow. */
  var M = { H0: 42, kp: 0.0008, Kpipe: 0.0010, Kv0: 0.0004, Qbep: 120, eta: 0.75 };
  function kvalve(f) { return M.Kv0 * (1 / (f * f) - 1); }
  function opPoint(f, Hs) {
    var K = M.Kpipe + kvalve(f), num = M.H0 - Hs;
    if (num <= 0) return { Q: 0, H: M.H0, K: K };
    var Q = Math.sqrt(num / (M.kp + K)); return { Q: Q, H: M.H0 - M.kp * Q * Q, K: K };
  }
  function eff(Q) { var e = M.eta * (1 - Math.pow((Q - M.Qbep) / 130, 2)); return Math.max(0.05, e); }
  function npshr(Q) { return 1.5 + 0.0001 * Q * Q; }
  function powerKW(Q, H, rho) { var e = eff(Q); return (Q / 3600) * rho * G * H / e / 1000; }

  /* 2. Where does it run? Throttle the discharge valve */
  F.s2 = function (host) {
    station(host,
      '<div class="tk-row"><div><label for="p2f">Discharge valve opening: <span class="tk-val" id="p2fv"></span> %</label><input type="range" id="p2f" min="10" max="100" step="5" value="50"></div>' +
      '<div><label for="p2s">Static head, tank to tank: <span class="tk-val" id="p2sv"></span> m</label><input type="range" id="p2s" min="0" max="30" step="1" value="10"></div></div>' +
      '<div class="tk-out" id="p2o"></div><p class="tk-cite" style="margin:4px 0 0">Pump curve in this model: 42 m at zero flow, 34 m at 100 m&sup3;/h, best efficiency at 120 m&sup3;/h. Guess the flow, then reveal.</p>',
      function () { var f = +$(host, '#p2f').value / 100, Hs = +$(host, '#p2s').value, o = opPoint(f, Hs);
        if (o.Q === 0) return ['bad', 'No flow. The static head of ' + Hs + ' m is above the 42 m the pump can make at shut-off.'];
        var e = eff(o.Q), msg = 'Runs at about ' + fmt(o.Q, 0) + ' m&sup3;/h and ' + fmt(o.H) + ' m head, efficiency about ' + fmt(100 * e, 0) + ' %. The valve burns ' + fmt(kvalve(f) * o.Q * o.Q) + ' m of head as heat.';
        if (o.Q < 0.6 * M.Qbep) return ['warn', msg + ' That is far left of the best efficiency point: heat, recirculation and shaft load.'];
        if (o.Q > 1.2 * M.Qbep) return ['warn', msg + ' That is right of the best efficiency point: motor load and NPSH required rise.'];
        return ['ok', msg + ' Close to the best efficiency point.']; });
    function upd() { var f = +$(host, '#p2f').value / 100, Hs = +$(host, '#p2s').value, o = opPoint(f, Hs);
      $(host, '#p2fv').textContent = $(host, '#p2f').value; $(host, '#p2sv').textContent = Hs;
      $(host, '#p2o').innerHTML = '<div><b>' + fmt(M.H0) + ' m</b><span>shut-off head</span></div><div><b>' + fmt(Hs) + ' m</b><span>static head</span></div><div><b>' + (Hs >= M.H0 ? 'No flow' : fmt(M.Qbep, 0) + ' m&sup3;/h') + '</b><span>' + (Hs >= M.H0 ? 'static head too high' : 'best efficiency flow') + '</span></div>'; }
    host.addEventListener('input', upd); upd();
  };

  /* 3. Will it boil under vacuum? */
  F.s3 = function (host) {
    station(host,
      '<div class="tk-row"><div><label for="p3l">Liquid</label><select id="p3l">' + opts('water') + '</select></div>' +
      '<div><label for="p3t">Liquid temperature: <span class="tk-val" id="p3tv"></span> &deg;C</label><input type="range" id="p3t" min="0" max="100" step="1" value="40"></div>' +
      '<div><label for="p3p">Absolute pressure: <span class="tk-val" id="p3pv"></span> mbar abs</label><input type="range" id="p3p" min="20" max="1013" step="1" value="100"></div></div>' +
      '<div class="tk-out" id="p3o"></div>',
      function () { var c = calc();
        if (c.pv >= c.P) return ['bad', 'It boils. Vapour pressure ' + fmt(c.pv / 100, 0) + ' mbar is above the ' + fmt(c.P / 100, 0) + ' mbar in the vessel. The liquid boils at ' + fmt(c.tb, 0) + ' &deg;C at this pressure, so expect foaming, carry-over and loss to the vacuum system. A pump on this suction will cavitate.'];
        if (c.pv > 0.8 * c.P) return ['warn', 'Close to boiling. Vapour pressure is ' + fmt(100 * c.pv / c.P, 0) + ' % of the vessel pressure, and it boils at ' + fmt(c.tb, 0) + ' &deg;C. A small rise in temperature or fall in pressure starts it.'];
        return ['ok', 'No boiling. It would boil at ' + fmt(c.tb, 0) + ' &deg;C at this pressure and the liquid is at ' + fmt(c.T, 0) + ' &deg;C.']; });
    function calc() { var k = $(host, '#p3l').value, T = +$(host, '#p3t').value, P = +$(host, '#p3p').value * 100; return { k: k, T: T, P: P, pv: pvPa(k, T), tb: tbAt(k, P) }; }
    function upd() { var c = calc(); $(host, '#p3tv').textContent = c.T; $(host, '#p3pv').textContent = fmt(c.P / 100, 0);
      $(host, '#p3o').innerHTML = '<div><b>' + fmt(c.pv / 100, 0) + ' mbar</b><span>vapour pressure at ' + c.T + ' &deg;C</span></div><div><b>' + fmt((c.P - PATM) / 1e5, 2) + ' barg</b><span>same pressure as gauge</span></div>'; }
    host.addEventListener('input', upd); upd();
  };

  /* 4. Name the seal failure */
  var SEAL = [
    { s: 'A drum emptied and the pump kept running for ten minutes. Seal faces are scored, cracked and blackened.', a: 'dry', w: 'The liquid film between the faces is the lubricant and the coolant. Without it the faces overheat in minutes. Stop on low level and never leave a pump running on an empty line.' },
    { s: 'Seal leaks soon after start-up. Faces show heat cracks and a hard carbon deposit. The flush line valve was found closed.', a: 'flush', w: 'No flush or cooling means heat builds at the faces. Check the flush plan is open and flowing before every start, and that the cooling water is on.' },
    { s: 'Seal faces are worn and grooved. The liquid is a slurry with crystals and the seal has no filter or clean flush.', a: 'solids', w: 'Hard particles get between the faces and grind them. Use a clean external flush, a double seal with barrier fluid, or a cyclone separator.' },
    { s: 'A new seal leaked within days. Dial gauge check shows the shaft runs out by more than the limit and the coupling is not aligned.', a: 'align', w: 'Misalignment or a bent shaft makes the faces open and close every turn. Align the coupling and check shaft run-out before fitting a new seal.' },
    { s: 'On a double seal, the barrier tank level keeps rising and its pressure is below the process pressure.', a: 'barrier', w: 'The barrier must stay above process pressure so that leakage goes into the process, not out. A rising level means process liquid is entering the barrier. Stop and check the inner seal.' }
  ];
  var SEALOPT = { dry: 'Dry running', flush: 'Loss of flush or cooling', solids: 'Solids in the liquid', align: 'Misalignment or shaft run-out', barrier: 'Barrier pressure lost (double seal)' };
  F.s4 = function (host) {
    var so = Object.keys(SEALOPT).map(function (k) { return '<option value="' + k + '">' + SEALOPT[k] + '</option>'; }).join('');
    var co = SEAL.map(function (c, i) { return '<option value="' + i + '">Case ' + (i + 1) + '</option>'; }).join('');
    station(host,
      '<div class="tk-row"><div><label for="p4c">Case</label><select id="p4c">' + co + '</select></div><div><label for="p4d">Your diagnosis</label><select id="p4d">' + so + '</select></div></div>' +
      '<div class="tk-why" id="p4s"></div>',
      function () { var c = SEAL[+$(host, '#p4c').value], d = $(host, '#p4d').value;
        return d === c.a ? ['ok', 'Correct: ' + SEALOPT[c.a] + '. ' + c.w] : ['bad', 'Not this one. The answer is ' + SEALOPT[c.a] + '. ' + c.w]; });
    function upd() { $(host, '#p4s').textContent = SEAL[+$(host, '#p4c').value].s; }
    host.addEventListener('input', upd); upd();
  };

  /* 5. Change the speed: affinity laws */
  F.s5 = function (host) {
    station(host,
      '<div class="tk-row"><div><label for="p5q">Flow now, m&sup3;/h</label><input type="number" id="p5q" min="1" step="1" value="100"></div>' +
      '<div><label for="p5h">Head now, m</label><input type="number" id="p5h" min="1" step="1" value="30"></div>' +
      '<div><label for="p5w">Power now, kW</label><input type="number" id="p5w" min="0.1" step="0.5" value="15"></div>' +
      '<div><label for="p5s">Static head in the system, m</label><input type="number" id="p5s" min="0" step="1" value="0"></div></div>' +
      '<div class="tk-row"><div><label for="p5n">Speed change: <span class="tk-val" id="p5nv"></span> % of present speed</label><input type="range" id="p5n" min="40" max="110" step="1" value="80"></div></div>' +
      '<div class="tk-out" id="p5o"></div>',
      function () { var r = +$(host, '#p5n').value / 100, Q = +$(host, '#p5q').value, H = +$(host, '#p5h').value, P = +$(host, '#p5w').value, Hs = +$(host, '#p5s').value;
        var H2 = H * r * r; var msg = 'Speed ' + fmt(100 * (r - 1), 0) + ' %: flow ' + fmt(100 * (r - 1), 0) + ' %, head ' + fmt(100 * (r * r - 1), 0) + ' %, power ' + fmt(100 * (r * r * r - 1), 0) + ' %.';
        if (Hs > 0 && H2 <= Hs) return ['bad', msg + ' But the pump head falls to ' + fmt(H2) + ' m, at or below the ' + fmt(Hs) + ' m static head, so the flow stops. The laws only hold for the same impeller; with static head the system curve does not scale.'];
        if (r > 1.02) return ['warn', msg + ' Power rises with the cube of speed. Check the motor rating and NPSH required, which also goes up.'];
        return ['ok', msg + ' New duty: ' + fmt(Q * r, 0) + ' m&sup3;/h at ' + fmt(H2) + ' m, ' + fmt(P * r * r * r) + ' kW. With friction-only systems the operating point moves along the same system curve.']; });
    function upd() { var r = +$(host, '#p5n').value / 100, Q = +$(host, '#p5q').value, H = +$(host, '#p5h').value, P = +$(host, '#p5w').value; $(host, '#p5nv').textContent = $(host, '#p5n').value;
      $(host, '#p5o').innerHTML = '<div><b>' + fmt(r, 2) + '</b><span>speed ratio</span></div><div><b>' + fmt(Q * r, 0) + ' m&sup3;/h</b><span>new flow (Q &times; r)</span></div><div><b>' + fmt(H * r * r) + ' m</b><span>new head (H &times; r&sup2;)</span></div><div><b>' + fmt(P * r * r * r) + ' kW</b><span>new power (P &times; r&sup3;)</span></div>'; }
    host.addEventListener('input', upd); upd();
  };

  /* Simulator: pump curve, system curve, operating point, with a throttle valve on the discharge or the suction */
  F.sim = function (host) {
    host.innerHTML = '<div class="tk-fx"><div class="tk-row">' +
      '<div><label for="sm-f">Throttle valve opening: <span class="tk-val" id="sm-fv"></span> %</label><input type="range" id="sm-f" min="10" max="100" step="1" value="100"></div>' +
      '<div><label for="sm-w">Throttle valve on the</label><select id="sm-w"><option value="d">Discharge side</option><option value="s">Suction side</option></select></div>' +
      '<div><label for="sm-a">NPSH available with the valve open: <span class="tk-val" id="sm-av"></span> m</label><input type="range" id="sm-a" min="2" max="14" step="0.5" value="8"></div>' +
      '<div><label for="sm-s">Static head: <span class="tk-val" id="sm-sv"></span> m</label><input type="range" id="sm-s" min="0" max="30" step="1" value="10"></div></div>' +
      '<canvas id="sm-c" style="width:100%;height:auto;display:block;background:var(--panel);border:1px solid var(--grid-line);border-radius:6px" aria-label="Pump curve and system curve. The operating point is where they cross."></canvas>' +
      '<div class="tk-out" id="sm-o"></div><div class="tk-verdict" id="sm-vd" role="status"></div>' +
      '<p class="tk-cite" style="margin:8px 0 0">Teaching model: one pump (42 m shut-off head, best efficiency at 120 m&sup3;/h), a fixed pipe, and a valve whose loss grows as it closes. Throttling the discharge moves the system curve up and left. Throttling the suction removes the same head from NPSH available. It shows the pattern, it is not a pump selection tool.</p></div>';
    var cv = $(host, '#sm-c'), ctx = cv.getContext('2d');
    var QMAX = 220, HMAX = 50;
    function size() { var w = Math.max(280, cv.parentNode.clientWidth - 32), dpr = window.devicePixelRatio || 1, h = Math.round(w * 0.5); cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px'; cv.style.width = w + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return [w, h]; }
    function draw() {
      var wh = size(), W = wh[0], H = wh[1], L = 46, R = 14, T = 14, B = 34, pw = W - L - R, ph = H - T - B;
      var f = +$(host, '#sm-f').value / 100, Hs = +$(host, '#sm-s').value, where = $(host, '#sm-w').value, a0 = +$(host, '#sm-a').value;
      $(host, '#sm-fv').textContent = $(host, '#sm-f').value; $(host, '#sm-av').textContent = a0.toFixed(1); $(host, '#sm-sv').textContent = Hs;
      var o = opPoint(f, Hs), Q = o.Q, Hh = o.H;
      var vloss = kvalve(f) * Q * Q, avail = where === 's' ? a0 - vloss : a0, req = npshr(Q), margin = avail - req, e = eff(Q);
      function X(q) { return L + pw * q / QMAX; } function Y(h) { return T + ph * (1 - h / HMAX); }
      ctx.clearRect(0, 0, W, H); ctx.font = '12px sans-serif'; ctx.lineWidth = 1; ctx.strokeStyle = '#2A4A6A'; ctx.fillStyle = '#93A9BD';
      for (var q = 0; q <= QMAX; q += 40) { ctx.beginPath(); ctx.moveTo(X(q), T); ctx.lineTo(X(q), T + ph); ctx.stroke(); ctx.fillText(q, X(q) - 8, H - 18); }
      for (var h = 0; h <= HMAX; h += 10) { ctx.beginPath(); ctx.moveTo(L, Y(h)); ctx.lineTo(L + pw, Y(h)); ctx.stroke(); ctx.fillText(h, 14, Y(h) + 4); }
      ctx.fillText('Flow, m3/h', L + pw / 2 - 30, H - 3); ctx.save(); ctx.translate(11, T + ph / 2 + 20); ctx.rotate(-Math.PI / 2); ctx.fillText('Head, m', 0, 0); ctx.restore();
      ctx.setLineDash([5, 4]); ctx.strokeStyle = '#5FD09A'; ctx.beginPath(); ctx.moveTo(X(M.Qbep), T); ctx.lineTo(X(M.Qbep), T + ph); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#5FD09A'; ctx.fillText('best efficiency', X(M.Qbep) + 4, T + 12);
      ctx.lineWidth = 3; ctx.strokeStyle = '#C9A227'; ctx.beginPath();
      for (q = 0; q <= QMAX; q += 2) { var hp = M.H0 - M.kp * q * q; if (hp < 0) break; q === 0 ? ctx.moveTo(X(q), Y(hp)) : ctx.lineTo(X(q), Y(hp)); } ctx.stroke(); ctx.fillStyle = '#C9A227'; ctx.fillText('pump', X(8), Y(M.H0) + 14);
      ctx.strokeStyle = '#6FB3F2'; ctx.beginPath(); var K = o.K;
      for (q = 0; q <= QMAX; q += 2) { var hs = Hs + K * q * q; if (hs > HMAX) break; q === 0 ? ctx.moveTo(X(q), Y(hs)) : ctx.lineTo(X(q), Y(hs)); } ctx.stroke(); ctx.fillStyle = '#6FB3F2'; ctx.fillText('system', X(8), Y(Hs) - 6);
      if (Q > 0) { ctx.fillStyle = '#ECE7D8'; ctx.beginPath(); ctx.arc(X(Q), Y(Hh), 7, 0, 7); ctx.fill(); ctx.strokeStyle = '#0B1622'; ctx.lineWidth = 2; ctx.stroke(); }
      var rho = 1000, kw = Q > 0 ? powerKW(Q, Hh, rho) : 0;
      $(host, '#sm-o').innerHTML = '<div><b>' + fmt(Q, 0) + ' m&sup3;/h</b><span>flow at the operating point</span></div><div><b>' + fmt(Hh) + ' m</b><span>head</span></div><div><b>' + fmt(100 * e, 0) + ' %</b><span>efficiency</span></div><div><b>' + fmt(kw) + ' kW</b><span>shaft power (water)</span></div><div><b>' + fmt(avail) + ' m</b><span>NPSH available</span></div><div><b>' + fmt(req) + ' m</b><span>NPSH required</span></div>';
      var vd = $(host, '#sm-vd'), msg;
      if (Q === 0) { vd.className = 'tk-verdict bad'; vd.textContent = 'No flow: the static head is above the shut-off head.'; return; }
      if (margin <= 0) { vd.className = 'tk-verdict bad'; msg = 'Cavitating. NPSH available ' + fmt(avail) + ' m is below the ' + fmt(req) + ' m required' + (where === 's' ? '. The suction valve takes ' + fmt(vloss) + ' m of head before the impeller. Never throttle the suction.' : '. Open the valve or raise the suction level.'); }
      else if (margin < 1) { vd.className = 'tk-verdict warn'; msg = 'Little margin: only ' + fmt(margin) + ' m of NPSH to spare.'; }
      else if (Q < 0.6 * M.Qbep) { vd.className = 'tk-verdict warn'; msg = 'Far left of the best efficiency point at ' + fmt(100 * e, 0) + ' % efficiency. About ' + fmt(vloss) + ' m of head is lost across the valve as heat.'; }
      else if (Q > 1.2 * M.Qbep) { vd.className = 'tk-verdict warn'; msg = 'Right of the best efficiency point. Motor load and NPSH required both climb.'; }
      else { vd.className = 'tk-verdict ok'; msg = 'Healthy: near the best efficiency point with ' + fmt(margin) + ' m of NPSH margin.'; }
      vd.textContent = msg;
    }
    host.addEventListener('input', draw); host.addEventListener('change', draw); window.addEventListener('resize', draw); draw();
  };

  var sw = document.getElementById('live-instant');
  if (sw) sw.addEventListener('change', function () { instant = sw.checked; listeners.forEach(function (f) { f(); }); });
  document.querySelectorAll('[data-fx]').forEach(function (el) { var f = F[el.getAttribute('data-fx')]; if (f) f(el); });
})();
