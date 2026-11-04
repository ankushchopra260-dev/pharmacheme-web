/* Pipe dimensions: ASME B36.10M (carbon/alloy) and B36.19M (stainless).
   Stored: OD and nominal wall (mm). Everything else is computed. */
(function () {
  'use strict';
  // [NPS label, DN, OD mm, {schedule: wall mm}]
  var D = [
    ['1/8', 6, 10.3, { '10S': 1.24, 40: 1.73, 80: 2.41, STD: 1.73, XS: 2.41 }],
    ['1/4', 8, 13.7, { '10S': 1.65, 40: 2.24, 80: 3.02, STD: 2.24, XS: 3.02 }],
    ['3/8', 10, 17.1, { '10S': 1.65, 40: 2.31, 80: 3.20, STD: 2.31, XS: 3.20 }],
    ['1/2', 15, 21.3, { '5S': 1.65, '10S': 2.11, 40: 2.77, 80: 3.73, 160: 4.78, STD: 2.77, XS: 3.73, XXS: 7.47 }],
    ['3/4', 20, 26.7, { '5S': 1.65, '10S': 2.11, 40: 2.87, 80: 3.91, 160: 5.56, STD: 2.87, XS: 3.91, XXS: 7.82 }],
    ['1', 25, 33.4, { '5S': 1.65, '10S': 2.77, 40: 3.38, 80: 4.55, 160: 6.35, STD: 3.38, XS: 4.55, XXS: 9.09 }],
    ['1 1/4', 32, 42.2, { '5S': 1.65, '10S': 2.77, 40: 3.56, 80: 4.85, 160: 6.35, STD: 3.56, XS: 4.85, XXS: 9.70 }],
    ['1 1/2', 40, 48.3, { '5S': 1.65, '10S': 2.77, 40: 3.68, 80: 5.08, 160: 7.14, STD: 3.68, XS: 5.08, XXS: 10.15 }],
    ['2', 50, 60.3, { '5S': 1.65, '10S': 2.77, 40: 3.91, 80: 5.54, 160: 8.74, STD: 3.91, XS: 5.54, XXS: 11.07 }],
    ['2 1/2', 65, 73.0, { '5S': 2.11, '10S': 3.05, 40: 5.16, 80: 7.01, 160: 9.53, STD: 5.16, XS: 7.01, XXS: 14.02 }],
    ['3', 80, 88.9, { '5S': 2.11, '10S': 3.05, 40: 5.49, 80: 7.62, 160: 11.13, STD: 5.49, XS: 7.62, XXS: 15.24 }],
    ['3 1/2', 90, 101.6, { '5S': 2.11, '10S': 3.05, 40: 5.74, 80: 8.08, STD: 5.74, XS: 8.08 }],
    ['4', 100, 114.3, { '5S': 2.11, '10S': 3.05, 40: 6.02, 80: 8.56, 120: 11.13, 160: 13.49, STD: 6.02, XS: 8.56, XXS: 17.12 }],
    ['5', 125, 141.3, { '5S': 2.77, '10S': 3.40, 40: 6.55, 80: 9.53, 120: 12.70, 160: 15.88, STD: 6.55, XS: 9.53, XXS: 19.05 }],
    ['6', 150, 168.3, { '5S': 2.77, '10S': 3.40, 40: 7.11, 80: 10.97, 120: 14.27, 160: 18.26, STD: 7.11, XS: 10.97, XXS: 21.95 }],
    ['8', 200, 219.1, { '5S': 2.77, '10S': 3.76, 20: 6.35, 30: 7.04, 40: 8.18, 60: 10.31, 80: 12.70, 100: 15.09, 120: 18.26, 140: 20.62, 160: 23.01, STD: 8.18, XS: 12.70, XXS: 22.23 }],
    ['10', 250, 273.1, { '5S': 3.40, '10S': 4.19, 20: 6.35, 30: 7.80, 40: 9.27, 60: 12.70, 80: 15.09, 100: 18.26, 120: 21.44, 140: 25.40, 160: 28.58, STD: 9.27, XS: 12.70, XXS: 25.40 }],
    ['12', 300, 323.9, { '5S': 3.96, '10S': 4.57, 20: 6.35, 30: 8.38, 40: 10.31, 60: 14.27, 80: 17.48, 100: 21.44, 120: 25.40, 140: 28.58, 160: 33.32, STD: 9.53, XS: 12.70, XXS: 25.40 }],
    ['14', 350, 355.6, { '5S': 3.96, '10S': 4.78, 10: 6.35, 20: 7.92, 30: 9.53, 40: 11.13, 60: 15.09, 80: 19.05, 100: 23.83, 120: 27.79, 140: 31.75, 160: 35.71, STD: 9.53, XS: 12.70 }],
    ['16', 400, 406.4, { '5S': 4.19, '10S': 4.78, 10: 6.35, 20: 7.92, 30: 9.53, 40: 12.70, 60: 16.66, 80: 21.44, 100: 26.19, 120: 30.96, 140: 36.53, 160: 40.49, STD: 9.53, XS: 12.70 }],
    ['18', 450, 457.2, { '5S': 4.19, '10S': 4.78, 10: 6.35, 20: 7.92, 30: 11.13, 40: 14.27, 60: 19.05, 80: 23.83, 100: 29.36, 120: 34.93, 140: 39.67, 160: 45.24, STD: 9.53, XS: 12.70 }],
    ['20', 500, 508.0, { '5S': 4.78, '10S': 5.54, 10: 6.35, 20: 9.53, 30: 12.70, 40: 15.09, 60: 20.62, 80: 26.19, 100: 32.54, 120: 38.10, 140: 44.45, 160: 50.01, STD: 9.53, XS: 12.70 }],
    ['22', 550, 558.8, { '5S': 4.78, '10S': 5.54, 10: 6.35, 20: 9.53, 30: 12.70, 60: 22.23, 80: 28.58, 100: 34.93, 120: 41.28, 140: 47.63, 160: 53.98, STD: 9.53, XS: 12.70 }],
    ['24', 600, 609.6, { '5S': 5.54, '10S': 6.35, 10: 6.35, 20: 9.53, 30: 14.27, 40: 17.48, 60: 24.61, 80: 30.96, 100: 38.89, 120: 46.02, 140: 52.37, 160: 59.54, STD: 9.53, XS: 12.70 }]
  ];
  var CS_ORDER = ['10', '20', '30', '40', '60', '80', '100', '120', '140', '160', 'STD', 'XS', 'XXS'];
  var SS_ORDER = ['5S', '10S', '40S', '80S'];

  // Stainless series: 40S = STD wall and 80S = XS wall (B36.19M, NPS 1/8 to 12 only).
  function wall(row, sch, std) {
    var w = row[3];
    if (std === 'ss') {
      if (sch === '5S' || sch === '10S') return w[sch];
      if (row[1] > 300) return undefined;
      if (sch === '40S') return w.STD;
      if (sch === '80S') return w.XS;
      return undefined;
    }
    if (sch === '5S' || sch === '10S' || sch === '40S' || sch === '80S') return undefined;
    return w[sch];
  }
  function schedules(std) { return std === 'ss' ? SS_ORDER : CS_ORDER; }
  function calc(row, t, std) {
    var od = row[2], id = od - 2 * t;
    var area = Math.PI / 4 * id * id;                    // mm2
    var k = std === 'ss' ? 0.02482 : 0.02466;            // 7.90 / 7.85 g/cm3
    var steel = k * (od - t) * t;                        // kg/m
    var water = area / 1e6 * 1000;                       // kg/m
    return { od: od, t: t, id: id, area: area, steel: steel, filled: steel + water, surf: Math.PI * od / 1000 };
  }
  function pipe(npsIdx, sch, std) {
    var row = D[npsIdx], t = wall(row, sch, std);
    return t === undefined ? null : calc(row, t, std);
  }
  function f(x, n) { return x.toFixed(n); }
  function lbl(row) { return row[0] + ' in (DN ' + row[1] + ')'; }

  var $ = function (id) { return document.getElementById(id); };
  var app = $('pd-app');
  if (!app) { window.PipeDims = { D: D, pipe: pipe, wall: wall }; return; }

  app.innerHTML =
    '<div class="pd-card"><h2>Look up a pipe</h2><div class="pd-row">' +
    '<label>Standard<select id="pd-std"><option value="cs">Carbon and alloy steel (ASME B36.10M)</option><option value="ss">Stainless steel (ASME B36.19M)</option></select></label>' +
    '<label>NPS (inch)<select id="pd-nps"></select></label>' +
    '<label>Schedule<select id="pd-sch"></select></label>' +
    '<label>Units<select id="pd-unit"><option value="mm">mm</option><option value="in">inch</option></select></label></div>' +
    '<div id="pd-out" class="pd-out" aria-live="polite"></div>' +
    '<h3>Velocity check</h3><div class="pd-row"><label>Flow (m³/h)<input id="pd-q" type="number" min="0" step="any" value="50" inputmode="decimal"></label></div>' +
    '<div id="pd-v" class="pd-note"></div></div>' +
    '<div class="pd-card"><h2>Find the pipe for a required inside size</h2><div class="pd-row">' +
    '<label>I know<select id="pd-rmode"><option value="id">Required inside diameter (mm)</option><option value="area">Required flow area (cm²)</option></select></label>' +
    '<label>Value<input id="pd-rval" type="number" min="0" step="any" value="100" inputmode="decimal"></label>' +
    '<label>Search in<select id="pd-rsch"></select></label></div>' +
    '<div id="pd-rout" class="pd-note"></div></div>' +
    '<div class="pd-card"><h2>Full table by schedule</h2><div class="pd-row"><label>Schedule<select id="pd-tsch"></select></label></div>' +
    '<div class="pd-scroll"><table class="pd-tab" id="pd-table"></table></div></div>';

  var std = $('pd-std'), nps = $('pd-nps'), sch = $('pd-sch'), unit = $('pd-unit');

  function fillNps() {
    nps.innerHTML = D.map(function (r, i) { return '<option value="' + i + '">' + r[0] + ' in (DN ' + r[1] + ')</option>'; }).join('');
    nps.value = '8'; // NPS 2
  }
  function fillSch() {
    var cur = sch.value, i = +nps.value, list = schedules(std.value).filter(function (s) { return wall(D[i], s, std.value) !== undefined; });
    sch.innerHTML = list.map(function (s) { return '<option>' + s + '</option>'; }).join('');
    sch.value = list.indexOf(cur) >= 0 ? cur : (list.indexOf('40') >= 0 ? '40' : list.indexOf('10S') >= 0 ? '10S' : list[0]);
  }
  function fillGlobalScheds() {
    var all = schedules(std.value).filter(function (s) { return D.some(function (r, i) { return wall(r, s, std.value) !== undefined; }); });
    var tcur = $('pd-tsch').value, rcur = $('pd-rsch').value;
    $('pd-tsch').innerHTML = all.map(function (s) { return '<option>' + s + '</option>'; }).join('');
    $('pd-tsch').value = all.indexOf(tcur) >= 0 ? tcur : (all.indexOf('40') >= 0 ? '40' : '10S');
    $('pd-rsch').innerHTML = '<option value="any">Any schedule</option>' + all.map(function (s) { return '<option>' + s + '</option>'; }).join('');
    $('pd-rsch').value = rcur && ($('pd-rsch').querySelector('option[value="' + rcur + '"]') || rcur === 'any') ? rcur : 'any';
  }
  function U(mm, n) { return unit.value === 'mm' ? f(mm, n === undefined ? 2 : n) : f(mm / 25.4, 3); }
  function uu() { return unit.value === 'mm' ? 'mm' : 'in'; }
  function A(mm2) { return unit.value === 'mm' ? f(mm2 / 100, 2) + ' cm²' : f(mm2 / 645.16, 3) + ' in²'; }
  function W(kgm) { return unit.value === 'mm' ? f(kgm, 2) + ' kg/m' : f(kgm * 0.671969, 2) + ' lb/ft'; }

  var cur = null;
  function show() {
    var i = +nps.value, row = D[i], p = pipe(i, sch.value, std.value);
    cur = p;
    if (!p) { $('pd-out').textContent = 'Not available.'; return; }
    var kv = [
      ['Outside diameter', U(p.od) + ' ' + uu()], ['Wall thickness', U(p.t) + ' ' + uu()],
      ['Inside diameter', U(p.id) + ' ' + uu()], ['Flow area', A(p.area)],
      ['Steel weight', W(p.steel)], ['Weight, water-filled', W(p.filled)],
      ['Outside surface', unit.value === 'mm' ? f(p.surf, 3) + ' m²/m' : f(p.surf * 3.28084, 3) + ' ft²/ft']
    ];
    $('pd-out').innerHTML = '<div class="pd-title">NPS ' + lbl(row) + ', Sch ' + sch.value + '</div>' +
      kv.map(function (k) { return '<div><span>' + k[0] + '</span><b>' + k[1] + '</b></div>'; }).join('');
    vel();
  }
  function vel() {
    var q = parseFloat($('pd-q').value);
    if (!cur || !(q >= 0)) { $('pd-v').textContent = ''; return; }
    var v = q / 3600 / (cur.area / 1e6);
    $('pd-v').innerHTML = 'At <b>' + q + ' m³/h</b> the velocity in this pipe is <b>' + f(v, 2) + ' m/s</b> (' + f(v * 3.28084, 1) + ' ft/s). Compare with the usual range for your fluid in the <a href="/design-tools/line-sizing/">line sizing tool</a>.';
  }
  function reverse() {
    var val = parseFloat($('pd-rval').value), mode = $('pd-rmode').value, sc = $('pd-rsch').value, out = [];
    if (!(val > 0)) { $('pd-rout').textContent = 'Enter a positive value.'; return; }
    var needId = mode === 'id' ? val : Math.sqrt(val * 100 * 4 / Math.PI);
    D.forEach(function (r, i) {
      schedules(std.value).forEach(function (s) {
        if (sc !== 'any' && s !== sc) return;
        var p = pipe(i, s, std.value);
        if (p) out.push({ r: r, s: s, p: p });
      });
    });
    out.sort(function (a, b) { return a.p.id - b.p.id; });
    var up = out.filter(function (o) { return o.p.id >= needId; }).slice(0, 6);
    var dn = out.filter(function (o) { return o.p.id < needId; }).slice(-1);
    if (!up.length) { $('pd-rout').textContent = 'Larger than any pipe in the table (NPS 24).'; return; }
    var rows = dn.concat(up).map(function (o) {
      return '<tr' + (o === up[0] ? ' class="pick"' : '') + '><td>' + o.r[0] + ' (DN ' + o.r[1] + ')</td><td>' + o.s + '</td><td>' + f(o.p.id, 2) + '</td><td>' + f(o.p.area / 100, 2) + '</td><td>' + f(o.p.t, 2) + '</td></tr>';
    }).join('');
    $('pd-rout').innerHTML = 'Need an inside diameter of at least <b>' + f(needId, 1) + ' mm</b>. Smallest pipe that is big enough is highlighted; the row above it (if shown) is the largest that falls short.' +
      '<div class="pd-scroll"><table class="pd-tab"><thead><tr><th>NPS</th><th>Sch</th><th>ID mm</th><th>Area cm²</th><th>Wall mm</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  function table() {
    var s = $('pd-tsch').value, h = '<thead><tr><th>NPS</th><th>DN</th><th>OD</th><th>Wall</th><th>ID</th><th>Area</th><th>Steel kg/m</th><th>Filled kg/m</th><th>Surface m²/m</th></tr></thead><tbody>';
    D.forEach(function (r, i) {
      var p = pipe(i, s, std.value);
      if (!p) return;
      h += '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + U(p.od, 1) + '</td><td>' + U(p.t) + '</td><td>' + U(p.id) + '</td><td>' + A(p.area) + '</td><td>' + f(p.steel, 2) + '</td><td>' + f(p.filled, 2) + '</td><td>' + f(p.surf, 3) + '</td></tr>';
    });
    $('pd-table').innerHTML = h + '</tbody>';
  }
  function all() { fillGlobalScheds(); fillSch(); show(); reverse(); table(); }

  fillNps(); all();
  std.addEventListener('change', all);
  nps.addEventListener('change', function () { fillSch(); show(); });
  sch.addEventListener('change', show);
  unit.addEventListener('change', function () { show(); table(); });
  $('pd-q').addEventListener('input', vel);
  ['pd-rmode', 'pd-rval', 'pd-rsch'].forEach(function (id) { $(id).addEventListener('input', reverse); });
  $('pd-tsch').addEventListener('change', table);
  window.PipeDims = { D: D, pipe: pipe, wall: wall };
})();
