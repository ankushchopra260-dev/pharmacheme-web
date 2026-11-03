/* Runaway reactions live checks: five stations for the "Runaway reactions and safe dosing" deck (slide "Now you call it")
   plus a semi-batch dosing simulator. Teaching models only. */
(function () {
  'use strict';
  var F = {};
  function $(host, sel) { return host.querySelector(sel); }
  function fmt(x, d) { if (!isFinite(x)) return 'n/a'; var a = Math.abs(x); if (a !== 0 && (a < 0.01 || a >= 1e5)) return x.toExponential(1); return x.toFixed(d == null ? (a < 10 ? 2 : a < 100 ? 1 : 0) : d); }
  var instant = false;
  var listeners = [];
  function slider(id, label, unit, min, max, step, val) {
    return '<div><label for="' + id + '">' + label + ': <span class="tk-val" id="' + id + 'v"></span> ' + unit + '</label><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"></div>';
  }
  function bindSliders(host) {
    function upd() { host.querySelectorAll('input[type=range]').forEach(function (r) { var o = host.querySelector('#' + r.id + 'v'); if (o) o.textContent = r.value; }); }
    host.addEventListener('input', upd); upd();
  }
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

  /* 1. Adiabatic temperature rise: dTad = dH * c / cp */
  F.s1 = function (host) {
    var html = '<div class="tk-row">' + slider('a-h', 'Heat of reaction', 'kJ/mol', 40, 300, 10, 160) + slider('a-c', 'Reagent in the mixture', 'mol/kg', 0.2, 3, 0.1, 1) + slider('a-cp', 'Heat capacity cp', 'kJ/kg/K', 1.5, 3, 0.1, 2) + '</div>' +
      '<div class="tk-row">' + slider('a-t', 'Process temperature', '&deg;C', 20, 100, 5, 60) + slider('a-b', 'Boiling point of the solvent', '&deg;C', 50, 140, 5, 85) + '</div><div class="tk-out" id="a-o"></div>';
    station(host, html, function () { var r = calc(); return r.fin > r.b ? ['bad', 'If all the heat stays in, the batch reaches ' + fmt(r.fin, 0) + ' &deg;C, ' + fmt(r.fin - r.b, 0) + ' K above boiling. Vapour and pressure follow.'] : r.fin > r.b - 15 ? ['warn', 'Final temperature ' + fmt(r.fin, 0) + ' &deg;C is within 15 K of boiling. Very little margin.'] : ['ok', 'Final temperature ' + fmt(r.fin, 0) + ' &deg;C stays below boiling by ' + fmt(r.b - r.fin, 0) + ' K.']; });
    function v(id) { return +$(host, '#' + id).value; }
    function calc() { var d = v('a-h') * v('a-c') / v('a-cp'); return { d: d, fin: v('a-t') + d, b: v('a-b') }; }
    function upd() { var r = calc(); $(host, '#a-o').innerHTML = '<div><b>' + fmt(r.d, 0) + ' K</b><span>&Delta;T<sub>ad</sub> = Q / (m&middot;cp)</span></div><div><b>' + fmt(r.fin, 0) + ' &deg;C</b><span>temperature with no cooling</span></div><div><b>' + fmt(v('a-h') * v('a-c'), 0) + ' kJ/kg</b><span>heat per kg of mixture</span></div>'; }
    host.addEventListener('input', upd); bindSliders(host); upd();
  };

  /* 2. Accumulation and MTSR. First order in unreacted reagent, constant temperature, constant feed rate. */
  F.s2 = function (host) {
    var html = '<div class="tk-row">' + slider('b-d', 'Dose time', 'min', 15, 300, 5, 60) + slider('b-h', 'Reaction half-life at Tp', 'min', 1, 120, 1, 20) + slider('b-t', 'Process temperature Tp', '&deg;C', 20, 100, 5, 50) + '</div>' +
      '<div class="tk-row">' + slider('b-a', 'Full-batch adiabatic rise', 'K', 40, 160, 5, 100) + slider('b-m', 'Technical limit MTT', '&deg;C', 60, 180, 5, 90) + '</div><div class="tk-out" id="b-o"></div><div class="tk-bar" id="b-b" aria-hidden="true"><i></i><u></u></div>';
    station(host, html, function () { var r = calc(); return r.mtsr > r.mtt ? ['bad', 'Accumulation ' + fmt(100 * r.x, 0) + ' %. MTSR ' + fmt(r.mtsr, 0) + ' &deg;C is above the ' + r.mtt + ' &deg;C limit. Dose longer or run warmer.'] : r.mtsr > r.mtt - 10 ? ['warn', 'Accumulation ' + fmt(100 * r.x, 0) + ' %. MTSR ' + fmt(r.mtsr, 0) + ' &deg;C is within 10 K of the limit.'] : ['ok', 'Accumulation ' + fmt(100 * r.x, 0) + ' %. MTSR ' + fmt(r.mtsr, 0) + ' &deg;C is below the ' + r.mtt + ' &deg;C limit.']; });
    function v(id) { return +$(host, '#' + id).value; }
    function calc() { var k = Math.LN2 / v('b-h'), kt = k * v('b-d'), x = (1 - Math.exp(-kt)) / kt; return { k: k, x: x, mtsr: v('b-t') + x * v('b-a'), mtt: v('b-m') }; }
    function upd() {
      var r = calc(); $(host, '#b-o').innerHTML = '<div><b>' + fmt(100 * r.x, 0) + ' %</b><span>unreacted reagent at end of dosing</span></div><div><b>' + fmt(r.x * v('b-a'), 0) + ' K</b><span>X<sub>acc</sub> &times; &Delta;T<sub>ad</sub></span></div><div><b>' + fmt(r.mtsr, 0) + ' &deg;C</b><span>MTSR = Tp + X<sub>acc</sub>&times;&Delta;T<sub>ad</sub></span></div>';
      var max = Math.max(r.mtsr, r.mtt, 100) * 1.1, bar = $(host, '#b-b'); bar.firstChild.style.width = Math.min(100, 100 * r.mtsr / max) + '%'; bar.lastChild.style.left = (100 * r.mtt / max) + '%'; bar.firstChild.style.background = r.mtsr > r.mtt ? '#E8706B' : r.mtsr > r.mtt - 10 ? '#F2A33C' : '#5FD09A';
    }
    host.addEventListener('input', upd); bindSliders(host); upd();
    var note = document.createElement('p'); note.className = 'tk-cite'; note.style.margin = '6px 0 0'; note.textContent = 'Teaching model: first-order reaction, constant temperature and constant feed. Accumulation at the end of dosing = (1 - e^(-k t)) / (k t). The white marker is the technical limit.'; host.firstChild.appendChild(note);
  };

  /* 3. Stoessel criticality class from the ordering of Tp, MTSR, MTT, TD24 (simplified teaching scheme). */
  F.s3 = function (host) {
    var html = '<div class="tk-row">' + slider('c-p', 'Process temperature Tp', '&deg;C', 20, 120, 5, 60) + slider('c-s', 'MTSR', '&deg;C', 40, 250, 5, 110) + slider('c-m', 'MTT', '&deg;C', 60, 200, 5, 100) + slider('c-d', 'TD24', '&deg;C', 60, 250, 5, 140) + '</div><div class="tk-out" id="c-o"></div>';
    var DES = { 1: 'No boiling and no decomposition. Keep the controls.', 2: 'MTSR is below both limits. Keep MTT in mind.', 3: 'Boiling is reached. The vent and condenser must cope with the vapour.', 4: 'Decomposition is triggered after MTT. Prove the safeguards.', 5: 'Decomposition is triggered before MTT. Change the process or conditions.' };
    station(host, html, function () { var c = cls(); return [c < 3 ? 'ok' : c === 3 ? 'warn' : 'bad', 'Criticality class ' + c + '. ' + DES[c] + ' Simplified teaching scheme.']; });
    function v(id) { return +$(host, '#' + id).value; }
    function cls() { var s = v('c-s'), m = v('c-m'), d = v('c-d'); if (s < d) { if (s < m) return m < d ? 1 : 2; return 3; } return m < d ? 4 : 5; }
    function upd() { $(host, '#c-o').innerHTML = '<div><b>' + v('c-p') + ' &deg;C</b><span>Tp</span></div><div><b>' + v('c-s') + ' &deg;C</b><span>MTSR</span></div><div><b>' + v('c-m') + ' &deg;C</b><span>MTT</span></div><div><b>' + v('c-d') + ' &deg;C</b><span>TD24</span></div>'; }
    host.addEventListener('input', upd); bindSliders(host); upd();
  };

  /* 4. Scale-up: wall area per volume falls as 1/L. Same U, same jacket temperature difference. */
  F.s4 = function (host) {
    var html = '<div class="tk-row">' + slider('d-l', 'Vessel size, linear scale factor', '&times;', 1, 12, 1, 5) + slider('d-d', 'Dose time used at plant', 'min', 10, 300, 5, 30) + slider('d-a', 'Full-batch adiabatic rise', 'K', 40, 160, 5, 100) + '</div><div class="tk-out" id="d-o"></div>';
    station(host, html, function () { var r = calc(); return r.d < r.min ? ['bad', 'Too fast. The wall can remove the heat of a ' + fmt(r.min, 0) + ' min dose, not of ' + r.d + ' min. Temperature will climb. Lengthen the dose.'] : r.d < r.min * 1.3 ? ['warn', 'Just enough cooling. Within 30 % of the limit, so there is little margin.'] : ['ok', 'Cooling can follow the heat release at this dose time.']; });
    function v(id) { return +$(host, '#' + id).value; }
    /* lab: cooling u = 0.2 per min at a 20 K driving difference, i.e. 4 K/min removable. u falls as 1/L */
    function calc() { var L = v('d-l'), cap = 4 / L, min = v('d-a') / cap; return { L: L, cap: cap, min: min, d: v('d-d'), need: v('d-a') / v('d-d') }; }
    function upd() { var r = calc(); $(host, '#d-o').innerHTML = '<div><b>' + fmt(Math.pow(r.L, 3), 0) + '&times;</b><span>volume vs the lab vessel</span></div><div><b>' + fmt(r.cap, 2) + ' K/min</b><span>heat the wall can remove</span></div><div><b>' + fmt(r.need, 2) + ' K/min</b><span>heat released at this dose time</span></div><div><b>' + fmt(r.min, 0) + ' min</b><span>shortest dose the wall can follow</span></div>'; }
    host.addEventListener('input', upd); bindSliders(host); upd();
    var note = document.createElement('p'); note.className = 'tk-cite'; note.style.margin = '6px 0 0'; note.textContent = 'Teaching model: the lab vessel removes 4 K/min of batch temperature. Area per volume falls as 1/size at the same U and jacket difference. Real vessels differ.'; host.firstChild.appendChild(note);
  };

  /* 5. Which safeguards belong before dosing a strongly exothermic reagent */
  var GUARD = [
    { t: 'High-temperature interlock that stops the feed automatically', h: true, w: 'Does not rely on the operator noticing.' },
    { t: 'Dosing allowed only above a minimum temperature', h: true, w: 'Stops accumulation in a cold, slow reaction.' },
    { t: 'Agitator running proof before and during dosing', h: true, w: 'An unmixed layer reacts all at once when stirring restarts.' },
    { t: 'Jacket flow and temperature monitored', h: true, w: 'Tells you if cooling is really working.' },
    { t: 'Tested quench or dump route for the worst case', h: true, w: 'The last barrier when control is lost.' },
    { t: 'Bypass switch on the interlock to speed up start-up', h: false, w: 'A bypassed interlock is not a safeguard.' },
    { t: 'Add the whole charge in 5 minutes to save time', h: false, w: 'Shortens dose time far below what cooling can follow.' },
    { t: 'Restart the agitator at once after a trip', h: false, w: 'Mix only after checking for accumulated reagent.' }
  ];
  F.s5 = function (host) {
    var picked = {};
    var st = station(host, '<p><b>Click every item that belongs in a safe dosing set-up.</b></p><div class="tk-choice" id="e-l"></div>', function () {
      var ok = 0, html = '<ul style="margin:6px 0 0;padding-left:1.1em;font-weight:400;color:#C9D4DE">';
      GUARD.forEach(function (b, i) { var pk = !!picked[i], good = pk === b.h; if (good) ok++; html += '<li style="color:' + (good ? '#5FD09A' : '#E8706B') + '">' + (b.h ? 'Needed' : 'Not acceptable') + ': ' + b.t + '. <span style="color:#C9D4DE">' + b.w + '</span></li>'; });
      return [ok === GUARD.length ? 'ok' : 'warn', 'You scored ' + ok + ' out of ' + GUARD.length + '.' + html + '</ul>'];
    });
    var box = $(host, '#e-l');
    GUARD.forEach(function (b, i) {
      var x = document.createElement('button'); x.type = 'button'; x.textContent = b.t; x.setAttribute('aria-pressed', 'false');
      x.onclick = function () { picked[i] = !picked[i]; x.setAttribute('aria-pressed', picked[i] ? 'true' : 'false'); x.style.borderColor = picked[i] ? '#C9A227' : ''; x.style.background = picked[i] ? 'rgba(201,162,39,.14)' : ''; st.hide(); };
      box.appendChild(x);
    });
  };

  /* Simulator: semi-batch dosing with accumulation and a cooling failure.
     State: T (reactor, degC), a (unreacted reagent as a fraction of the full charge).
       da/dt = feed/td - k(T)*a        (feed on while t < td, or until the feed is stopped)
       dT/dt = k(T)*a*dTad - u*(T - Tj)    (u = UA/(m cp), 1/min; u = 0 after the cooling failure)
     k(T) = k50 * exp(Ea/R * (1/323.15 - 1/T)), first order in unreacted reagent. Jacket temperature is set so that
     the reactor holds Tp at the steady dosing heat rate (not below 0 degC). */
  F.sim = function (host) {
    host.innerHTML = '<div class="tk-fx"><div class="tk-row">' +
      slider('s-d', 'Dose time', 'min', 20, 300, 5, 120) + slider('s-t', 'Process temperature Tp', '&deg;C', 30, 80, 1, 50) + slider('s-u', 'Cooling capacity u', '1/min', 0.02, 0.15, 0.01, 0.06) +
      slider('s-a', 'Full-batch adiabatic rise', 'K', 40, 160, 5, 100) + slider('s-m', 'Technical limit MTT', '&deg;C', 70, 150, 5, 100) + '</div>' +
      '<div class="tk-row"><label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" id="s-f" checked> Cooling fails at 60 % of the dose time</label>' +
      '<label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" id="s-s"> Stop the feed when cooling fails</label></div>' +
      '<canvas id="s-c" height="260" style="width:100%;height:260px;background:var(--panel);border:1px solid var(--grid-line);border-radius:6px" role="img" aria-label="Reactor temperature and unreacted reagent against time"></canvas>' +
      '<div class="tk-actions" style="margin:8px 0"><button type="button" class="tk-btn primary" id="s-go">Play</button></div>' +
      '<div class="tk-out" id="s-o"></div><div class="tk-verdict" id="s-v" role="status"></div>' +
      '<p class="tk-cite" style="margin:8px 0 0">Orange line: reactor temperature. Blue area: unreacted reagent, 0 to 100 % of the charge. Red dashed line: MTT. Grey vertical line: cooling failure. Teaching model: first-order reaction (rate doubles about every 10 K), constant feed, heat removal proportional to the temperature difference. It shows the pattern and is not a design tool.</p></div>';
    var cv = $(host, '#s-c'), ctx = cv.getContext('2d'), res = null, frac = 1, timer = null;
    function v(id) { return +$(host, '#' + id).value; }
    function run() {
      var td = v('s-d'), Tp = v('s-t'), u = v('s-u'), dT = v('s-a'), Tmax = v('s-m'), fail = $(host, '#s-f').checked, stop = $(host, '#s-s').checked;
      var dt = 0.1, Ea = 70000, R = 8.314, k50 = 0.05, tF = 0.6 * td, tEnd = td * 1.6 + 60;
      var Tj = Math.max(0, Tp - (dT / td) / u), T = Tp, a = 0, t = 0, n = 0, ts = [], Ts = [], as = [], maxA = 0, peakT = Tp, mtsrF = null, over = false;
      while (t < tEnd && T < 300) {
        var failed = fail && t >= tF, feed = (t < td) && !(failed && stop);
        var k = k50 * Math.exp(Ea / R * (1 / 323.15 - 1 / (T + 273.15)));
        var rdt = Math.min(a, k * a * dt);
        if (fail && !failed && t + dt >= tF) mtsrF = T + a * dT;
        a += (feed ? dt / td : 0) - rdt;
        T += rdt * dT - (failed ? 0 : u * (T - Tj)) * dt;
        t += dt; if (a > maxA) maxA = a; if (T > peakT) peakT = T; if (T > Tmax) over = true;
        if (n++ % 5 === 0) { ts.push(t); Ts.push(T); as.push(a); }
      }
      res = { td: td, tEnd: t, tF: tF, fail: fail, stop: stop, ts: ts, Ts: Ts, as: as, maxA: maxA, peakT: peakT, Tmax: Tmax, Tp: Tp, Tj: Tj, mtsrF: mtsrF, over: over, runaway: T >= 300, u: u, dT: dT };
      report();
    }
    function report() {
      var r = res; $(host, '#s-o').innerHTML = '<div><b>' + fmt(100 * r.maxA, 0) + ' %</b><span>peak unreacted reagent</span></div><div><b>' + fmt(r.peakT, 0) + ' &deg;C</b><span>peak reactor temperature</span></div><div><b>' + (r.mtsrF == null ? 'n/a' : fmt(r.mtsrF, 0) + ' &deg;C') + '</b><span>MTSR at the failure (T + X<sub>acc</sub>&times;&Delta;T<sub>ad</sub>)</span></div><div><b>' + fmt(r.Tj, 0) + ' &deg;C</b><span>jacket temperature held</span></div>';
      var vd = $(host, '#s-v'), why = '';
      if (r.Tj <= 0.01 && r.dT / r.td / r.u > r.Tp) why = ' Cooling is too small for this dose time, so the reactor drifts above Tp even before any failure.';
      if (r.over) { vd.className = 'tk-verdict bad'; vd.innerHTML = 'Runaway: the temperature passes the ' + r.Tmax + ' &deg;C limit' + (r.fail ? ' after the cooling failure' : '') + '. Peak ' + fmt(r.peakT, 0) + ' &deg;C.' + why; }
      else if (r.peakT > r.Tmax - 10) { vd.className = 'tk-verdict warn'; vd.innerHTML = 'Close call. Peak ' + fmt(r.peakT, 0) + ' &deg;C is within 10 K of the ' + r.Tmax + ' &deg;C limit.' + why; }
      else { vd.className = 'tk-verdict ok'; vd.innerHTML = 'Stays below the limit. Peak ' + fmt(r.peakT, 0) + ' &deg;C. Peak unreacted reagent was ' + fmt(100 * r.maxA, 0) + ' %.' + why; }
    }
    function draw() {
      var r = res, w = cv.clientWidth || 600, h = 260, dpr = window.devicePixelRatio || 1; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      var L = 46, Rg = 40, Tp0 = 10, B = h - 26, tp = h - 14 - B + 10;
      var Tmin = 0, Tmx = Math.max(r.Tmax + 20, Math.min(r.peakT + 10, 200));
      function X(t) { return L + (w - L - Rg) * t / r.tEnd; } function Y(T) { return B - (B - 12) * (T - Tmin) / (Tmx - Tmin); } function YA(a) { return B - (B - 12) * a; }
      ctx.font = '12px sans-serif'; ctx.fillStyle = '#93A9BD'; ctx.strokeStyle = '#2A4A6A'; ctx.lineWidth = 1;
      var tk = [0, 50, 100, 150, 200].filter(function (x) { return x <= Tmx; }); tk.forEach(function (T) { ctx.beginPath(); ctx.moveTo(L, Y(T)); ctx.lineTo(w - Rg, Y(T)); ctx.stroke(); ctx.fillText(T + '°C', 4, Y(T) + 4); });
      [0, 0.5, 1].forEach(function (a) { ctx.fillText(Math.round(a * 100) + '%', w - Rg + 6, YA(a) + 4); });
      var cut = Math.max(1, Math.floor(r.ts.length * frac));
      ctx.fillStyle = 'rgba(70,130,210,.35)'; ctx.beginPath(); ctx.moveTo(X(r.ts[0]), YA(0)); for (var i = 0; i < cut; i++) ctx.lineTo(X(r.ts[i]), YA(r.as[i])); ctx.lineTo(X(r.ts[cut - 1]), YA(0)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#E8706B'; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(L, Y(r.Tmax)); ctx.lineTo(w - Rg, Y(r.Tmax)); ctx.stroke(); ctx.setLineDash([]);
      if (r.fail) { ctx.strokeStyle = '#93A9BD'; ctx.beginPath(); ctx.moveTo(X(r.tF), 12); ctx.lineTo(X(r.tF), B); ctx.stroke(); ctx.fillStyle = '#93A9BD'; ctx.fillText('cooling fails', X(r.tF) + 4, 24); }
      ctx.strokeStyle = '#F2A33C'; ctx.lineWidth = 2.5; ctx.beginPath(); for (var j = 0; j < cut; j++) { var yy = Math.min(Math.max(Y(r.Ts[j]), 6), B); j ? ctx.lineTo(X(r.ts[j]), yy) : ctx.moveTo(X(r.ts[j]), yy); } ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = '#93A9BD'; ctx.fillText('time, min', w / 2 - 20, h - 6); ctx.fillText('0', L, h - 12); ctx.fillText(Math.round(r.tEnd), w - Rg - 14, h - 12);
    }
    function refresh() { clearInterval(timer); timer = null; frac = 1; run(); draw(); }
    $(host, '#s-go').onclick = function () { clearInterval(timer); frac = 0; var s = Date.now(); timer = setInterval(function () { frac = Math.min(1, (Date.now() - s) / 4000); draw(); if (frac >= 1) { clearInterval(timer); timer = null; } }, 50); };
    host.addEventListener('input', refresh); host.addEventListener('change', refresh); bindSliders(host);
    window.addEventListener('resize', function () { if (res) draw(); });
    refresh();
  };

  var sw = document.getElementById('live-instant');
  if (sw) sw.addEventListener('change', function () { instant = sw.checked; listeners.forEach(function (f) { f(); }); });
  document.querySelectorAll('[data-fx]').forEach(function (el) { var f = F[el.getAttribute('data-fx')]; if (f) f(el); });
})();
