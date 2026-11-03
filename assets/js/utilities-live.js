/* Utilities Live: five stations for the "Utilities and energy saving" training deck (slide "Now you call it"), plus a savings planner.
   All numbers are illustrative and every input is editable. Tariffs and prices are placeholders: enter your own. */
(function () {
  'use strict';
  var F = {};
  function $(h, s) { return h.querySelector(s); }
  function n(h, s) { return parseFloat($(h, s).value); }
  function fmt(x, d) { if (!isFinite(x)) return 'n/a'; var a = Math.abs(x); if (a !== 0 && (a < 0.01 || a >= 1e7)) return x.toExponential(1); if (d != null) return x.toFixed(d); return a >= 1000 ? Math.round(x).toLocaleString('en-IN') : a >= 100 ? x.toFixed(0) : a >= 10 ? x.toFixed(1) : x.toFixed(2); }
  function inr(x) { var a = Math.abs(x); if (a >= 1e7) return 'Rs ' + (x / 1e7).toFixed(2) + ' crore'; if (a >= 1e5) return 'Rs ' + (x / 1e5).toFixed(2) + ' lakh'; return 'Rs ' + Math.round(x).toLocaleString('en-IN'); }
  function num(id, lab, val, step, min) { return '<div><label for="' + id + '">' + lab + '</label><input type="number" id="' + id + '" value="' + val + '" step="' + (step || 'any') + '" min="' + (min == null ? 0 : min) + '"></div>'; }
  var instant = false, listeners = [];

  function station(host, html, answerFn) {
    host.innerHTML = '<div class="tk-fx">' + html + '<div class="tk-actions" style="margin:10px 0 0"><button type="button" class="tk-btn primary" data-rv>Reveal the answer</button></div><div class="tk-verdict" data-ans hidden role="status"></div></div>';
    var btn = $(host, '[data-rv]'), ans = $(host, '[data-ans]');
    function show() { var r = answerFn(); ans.className = 'tk-verdict ' + r[0]; ans.innerHTML = r[1]; ans.hidden = false; }
    function hide() { if (!instant) ans.hidden = true; else show(); }
    btn.onclick = show;
    host.addEventListener('input', hide); host.addEventListener('change', hide);
    listeners.push(function () { if (instant) show(); else ans.hidden = true; });
    if (instant) show();
  }
  function out(items) { return '<div class="tk-out" style="margin:8px 0 0">' + items.map(function (i) { return '<div><b>' + i[0] + '</b><span>' + i[1] + '</span></div>'; }).join('') + '</div>'; }
  var NOTE = '<p class="tk-cite" style="margin:6px 0 0">Illustrative arithmetic for teaching. Enter your own prices and plant data.</p>';

  /* Choked (sonic) flow through a sharp hole: mass flow = Cd A P0 sqrt(k/(R T0)) (2/(k+1))^((k+1)/(2(k-1))) */
  function choked(dmm, P0, T0, k, R) {
    var A = Math.PI * Math.pow(dmm / 1000, 2) / 4;
    return 0.6 * A * P0 * Math.sqrt(k / (R * T0)) * Math.pow(2 / (k + 1), (k + 1) / (2 * (k - 1)));
  }
  function tsatC(Pbar) { var mm = Pbar * 750.062; return 1810.94 / (8.14019 - Math.log10(mm)) - 244.485; } /* Antoine, 99 to 374 degC */

  /* 1. Steam trap blowing through */
  F.s1 = function (host) {
    station(host, '<p><b>A steam trap on a header is stuck open and blowing live steam to the condensate line.</b></p><div class="tk-row">' +
      num('s1d', 'Equivalent hole size, mm', 3, 0.5, 0.5) + num('s1p', 'Steam pressure, barg', 8, 0.5, 1) + num('s1h', 'Hours per year', 8000, 100) + num('s1c', 'Steam cost, Rs per tonne', 1500, 50) + num('s1n', 'Number of such traps', 10, 1, 1) + '</div>',
      function () {
        var d = n(host, '#s1d'), P = n(host, '#s1p'), h = n(host, '#s1h'), c = n(host, '#s1c'), N = n(host, '#s1n');
        var Pa = (P + 1.01325) * 1e5, T = tsatC(P + 1.01325) + 273.15, kgh = choked(d, Pa, T, 1.3, 461.5) * 3600;
        var t = kgh * h / 1000, cost = t * c;
        return [cost * N > 1e6 ? 'bad' : 'warn', 'One trap loses about <b>' + fmt(kgh) + ' kg/h</b> of steam, <b>' + fmt(t) + ' tonnes a year</b>, worth <b>' + inr(cost) + '</b>. ' + N + ' such traps: <b>' + inr(cost * N) + '</b> a year.' + out([[fmt(kgh) + ' kg/h', 'steam lost per trap'], [fmt(tsatC(P + 1.01325), 0) + ' &deg;C', 'saturation temperature'], [inr(cost * N), 'per year for ' + N + ' traps']]) +
          '<p class="tk-cite" style="margin:6px 0 0">Model: sonic flow of saturated steam through a sharp hole, discharge coefficient 0.6, k = 1.3. A trap passing steam is not a full-bore hole, so treat this as an upper estimate and check with a trap tester.</p>'];
      });
  };

  /* 2. Cooling tower water balance */
  F.s2 = function (host) {
    station(host, '<p><b>A cooling tower runs at low cycles of concentration. What does it cost in make-up water?</b></p><div class="tk-row">' +
      num('s2l', 'Circulation, m&sup3;/h', 500, 10, 1) + num('s2r', 'Range (hot minus cold), &deg;C', 6, 0.5, 1) + num('s2c', 'Cycles of concentration now', 2, 0.5, 1.1) + num('s2t', 'Target cycles', 5, 0.5, 1.1) + num('s2w', 'Water cost, Rs per m&sup3;', 60, 1) + num('s2h', 'Hours per year', 8000, 100) + '</div>',
      function () {
        var L = n(host, '#s2l'), R = n(host, '#s2r'), C = n(host, '#s2c'), T = n(host, '#s2t'), w = n(host, '#s2w'), h = n(host, '#s2h');
        if (C <= 1 || T <= 1) return ['bad', 'Cycles of concentration must be above 1.'];
        var E = 0.00153 * R * L, mk = function (x) { return E * x / (x - 1); }, B0 = E / (C - 1), B1 = E / (T - 1);
        var save = (mk(C) - mk(T)) * h * w;
        return [save > 0 ? 'ok' : 'warn', 'Evaporation is about <b>' + fmt(E) + ' m&sup3;/h</b> and does not change with cycles. At ' + C + ' cycles the blowdown is <b>' + fmt(B0) + ' m&sup3;/h</b> and make-up <b>' + fmt(mk(C)) + ' m&sup3;/h</b>. At ' + T + ' cycles the blowdown falls to ' + fmt(B1) + ' m&sup3;/h and make-up to ' + fmt(mk(T)) + ' m&sup3;/h: saving <b>' + inr(Math.max(save, 0)) + '</b> a year in water alone, before chemicals and sewer charges.' +
          out([[fmt(E) + ' m&sup3;/h', 'evaporation, E'], [fmt(B0) + ' m&sup3;/h', 'blowdown now, B = E / (C &minus; 1)'], [fmt(mk(C) - mk(T)) + ' m&sup3;/h', 'make-up saved']]) +
          '<p class="tk-cite" style="margin:6px 0 0">Rule of thumb: E = 0.00153 &times; range(&deg;C) &times; circulation. Drift and leaks ignored. Higher cycles need water treatment that can handle the scaling and corrosion risk.</p>'];
      });
  };

  /* 3. Chiller or VAM */
  F.s3 = function (host) {
    station(host, '<p><b>Chilled water at 7 &deg;C. Which machine is cheaper to run?</b></p><div class="tk-row">' +
      num('s3l', 'Cooling load, TR', 200, 10, 1) + num('s3c', 'Electric chiller COP', 5, 0.1, 1) + num('s3v', 'VAM thermal COP', 0.7, 0.05, 0.1) + num('s3e', 'Power, Rs per kWh', 8, 0.5) + num('s3s', 'Steam, Rs per tonne', 1500, 50) + num('s3a', 'VAM extra pumps and fans, kW per TR', 0.15, 0.01) + '</div>',
      function () {
        var TR = n(host, '#s3l'), cc = n(host, '#s3c'), cv = n(host, '#s3v'), e = n(host, '#s3e'), s = n(host, '#s3s'), a = n(host, '#s3a');
        var kw = TR * 3.517, ch = kw / cc * e, steamKgh = kw / cv * 3600 / 2050; /* kW thermal -> kg/h at 2050 kJ/kg */
        var vm = steamKgh / 1000 * s + TR * a * e;
        var be = (ch - TR * a * e) / (steamKgh / 1000);
        var win = ch < vm ? 'The electric chiller' : 'The VAM';
        return [ch < vm ? 'warn' : 'ok', win + ' is cheaper here. Chiller: <b>' + inr(ch) + ' per hour</b> (' + fmt(kw / cc) + ' kW). VAM: <b>' + inr(vm) + ' per hour</b> (' + fmt(steamKgh) + ' kg/h steam plus auxiliaries). The two cost the same when steam costs about <b>' + inr(be) + ' per tonne</b>.' +
          out([[fmt(kw) + ' kW', 'cooling duty'], [fmt(kw / cc) + ' kW', 'chiller electrical input'], [fmt(steamKgh) + ' kg/h', 'VAM steam at 2050 kJ/kg']]) +
          '<p class="tk-cite" style="margin:6px 0 0">1 TR = 3.517 kW. Compare on the price of the energy you would really save, not an average. Waste heat or spare steam changes the answer.</p>'];
      });
  };

  /* 4. Compressed air leak */
  F.s4 = function (host) {
    station(host, '<p><b>One leak you can hear at the end of a line. What does it cost?</b></p><div class="tk-row">' +
      num('s4d', 'Hole size, mm', 3, 0.5, 0.5) + num('s4p', 'Air pressure, barg', 7, 0.5, 1) + num('s4k', 'Compressor specific power, kW per m&sup3;/min', 6.5, 0.1, 1) + num('s4e', 'Power, Rs per kWh', 8, 0.5) + num('s4h', 'Hours per year', 8000, 100) + num('s4n', 'Number of such leaks', 10, 1, 1) + '</div>',
      function () {
        var d = n(host, '#s4d'), P = n(host, '#s4p'), k = n(host, '#s4k'), e = n(host, '#s4e'), h = n(host, '#s4h'), N = n(host, '#s4n');
        var m = choked(d, (P + 1.01325) * 1e5, 300, 1.4, 287), fad = m / 1.2 * 60, kw = fad * k, cost = kw * h * e;
        return [cost * N > 5e5 ? 'bad' : 'warn', 'One leak wastes about <b>' + fmt(fad) + ' m&sup3;/min</b> of free air, which is <b>' + fmt(kw) + ' kW</b> at the compressor: <b>' + inr(cost) + '</b> a year. ' + N + ' leaks: <b>' + inr(cost * N) + '</b>.' +
          out([[fmt(fad) + ' m&sup3;/min', 'free air lost per leak'], [fmt(kw) + ' kW', 'compressor power wasted'], [fmt(kw * h * N, 0) + ' kWh', 'per year for ' + N + ' leaks']]) +
          '<p class="tk-cite" style="margin:6px 0 0">Model: sonic flow of air at 27 &deg;C through a sharp hole, Cd 0.6, free air density 1.2 kg/m&sup3;. Leaks lose air only while pressurised; unloaded compressors save less than this.</p>'];
      });
  };

  /* 5. Condensate return */
  F.s5 = function (host) {
    station(host, '<p><b>Hot condensate goes to drain. What does returning it save?</b></p><div class="tk-row">' +
      num('s5m', 'Condensate not returned, kg/h', 2000, 100, 1) + num('s5t', 'Condensate temperature, &deg;C', 90, 1, 30) + num('s5w', 'Make-up water temperature, &deg;C', 28, 1, 5) + num('s5g', 'Fuel GCV, kcal/kg', 4000, 100, 500) + num('s5f', 'Fuel cost, Rs per kg', 8, 0.5) + num('s5b', 'Boiler efficiency, %', 80, 1, 40) + num('s5q', 'Treated water, Rs per m&sup3;', 120, 5) + num('s5h', 'Hours per year', 8000, 100) + '</div>',
      function () {
        var m = n(host, '#s5m'), T = n(host, '#s5t'), Tm = n(host, '#s5w'), g = n(host, '#s5g'), f = n(host, '#s5f'), b = n(host, '#s5b') / 100, q = n(host, '#s5q'), h = n(host, '#s5h');
        var kcal = m * (T - Tm), fuel = kcal / (g * b), cf = fuel * f * h, cw = m / 1000 * q * h;
        return ['ok', 'Returning it saves about <b>' + fmt(fuel) + ' kg/h of fuel</b> (' + inr(cf) + ' a year) and <b>' + fmt(m / 1000 * h, 0) + ' m&sup3; of treated water</b> (' + inr(cw) + '). Total about <b>' + inr(cf + cw) + '</b> a year.' +
          out([[fmt(kcal / 1000, 0) + ' Mcal/h', 'heat in the condensate above make-up'], [fmt(fuel) + ' kg/h', 'fuel saved'], [inr(cf + cw), 'saved per year']]) +
          '<p class="tk-cite" style="margin:6px 0 0">Uses cp = 1 kcal/kg&deg;C. Add the chemicals saved and any flash steam you can use. Subtract the cost of pumps, piping and insulation.</p>'];
      });
  };

  /* Savings planner */
  var MEAS = [
    ['Repair and replace failed steam traps', 6, 1.5], ['Insulate bare valves, flanges and tanks', 4, 2], ['Raise cooling tower cycles of concentration', 2.5, 0.5],
    ['Fix compressed air leaks', 3.5, 0.8], ['Lower compressor set pressure by 1 bar', 1.2, 0.2], ['Return condensate to the boiler', 9, 12],
    ['Variable speed drive on cooling tower fans', 3, 4], ['Economiser on boiler flue gas', 8, 15]
  ];
  F.sim = function (host) {
    var rows = MEAS.map(function (m, i) {
      return '<tr><td><label><input type="checkbox" data-c="' + i + '" ' + (i < 3 ? 'checked' : '') + '> ' + m[0] + '</label></td>' +
        '<td><input type="number" data-s="' + i + '" value="' + m[1] + '" step="0.1" min="0" style="width:90px"></td><td><input type="number" data-k="' + i + '" value="' + m[2] + '" step="0.1" min="0" style="width:90px"></td><td data-p="' + i + '" style="white-space:nowrap"></td></tr>';
    }).join('');
    host.innerHTML = '<div class="tk-fx"><p>Tick the measures you would do first. Savings and costs are <b>illustrative, in Rs lakh</b>: replace them with your own quotes and audit numbers.</p>' +
      '<div style="overflow-x:auto"><table style="width:100%;font-size:.92rem"><thead><tr><th>Measure</th><th>Saving, lakh/yr</th><th>Cost, lakh</th><th>Payback</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="tk-out" id="pl-o"></div><div class="tk-bar" aria-hidden="true"><i id="pl-b"></i><u style="left:33.3%"></u><em style="left:34%">1 year</em></div>' +
      '<div class="tk-verdict" id="pl-v" role="status"></div><p class="tk-cite" style="margin:6px 0 0">Simple payback = cost / annual saving. It ignores interest, maintenance and the life of the measure. Bar scale: 0 to 36 months.</p></div>';
    function upd() {
      var S = 0, K = 0, cnt = 0;
      MEAS.forEach(function (m, i) {
        var s = parseFloat($(host, '[data-s="' + i + '"]').value) || 0, k = parseFloat($(host, '[data-k="' + i + '"]').value) || 0, on = $(host, '[data-c="' + i + '"]').checked;
        $(host, '[data-p="' + i + '"]').textContent = s > 0 ? fmt(k / s * 12, 0) + ' months' : 'no saving';
        if (on) { S += s; K += k; cnt++; }
      });
      var pb = S > 0 ? K / S * 12 : 0;
      $(host, '#pl-o').innerHTML = '<div><b>' + fmt(S, 1) + ' lakh</b><span>saving per year, ' + cnt + ' measure' + (cnt === 1 ? '' : 's') + '</span></div><div><b>' + fmt(K, 1) + ' lakh</b><span>total cost</span></div><div><b>' + (S > 0 ? fmt(pb, 0) + ' months' : 'n/a') + '</b><span>simple payback</span></div>';
      var b = $(host, '#pl-b'); b.style.width = Math.min(100, pb / 36 * 100) + '%'; b.style.background = pb <= 12 ? '#5FD09A' : pb <= 24 ? '#F2A33C' : '#E8706B';
      var v = $(host, '#pl-v');
      if (!cnt) { v.className = 'tk-verdict'; v.textContent = 'Tick at least one measure.'; }
      else if (pb <= 12) { v.className = 'tk-verdict ok'; v.textContent = 'Pays back within a year. Quick wins like these usually need little approval. Do them first.'; }
      else if (pb <= 24) { v.className = 'tk-verdict warn'; v.textContent = 'Pays back in one to two years. Reasonable for a capital request, but the quick wins alone may pay for it.'; }
      else { v.className = 'tk-verdict bad'; v.textContent = 'Payback over two years. Check the quotes and look at what the quick wins can fund first.'; }
    }
    host.addEventListener('input', upd); host.addEventListener('change', upd); upd();
  };

  var sw = document.getElementById('live-instant');
  if (sw) sw.addEventListener('change', function () { instant = sw.checked; listeners.forEach(function (f) { f(); }); });
  document.querySelectorAll('[data-fx]').forEach(function (el) { var f = F[el.getAttribute('data-fx')]; if (f) f(el); });
})();
