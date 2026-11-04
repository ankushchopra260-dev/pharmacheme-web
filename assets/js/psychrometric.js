/* PharmaChemE psychrometric calculator.
   Engine: ASHRAE Fundamentals equations for moist air (Hyland-Wexler saturation pressure, ideal-gas mixing, enhancement factor neglected).
   UI: state point, cooling coil, mixing and heating modes with an interactive psychrometric chart. SI units. */
(function (root) {
  'use strict';

  /* ---------------- Engine ---------------- */
  var K = 273.15, RATIO = 0.621945, P0 = 101.325;

  /* Saturation pressure of water vapour, kPa. Over ice below 0 C, over liquid water at 0 C and above. */
  function pws(t) {
    var T = t + K, ln;
    if (t < 0) ln = -5.6745359e3 / T + 6.3925247 - 9.677843e-3 * T + 6.2215701e-7 * T * T + 2.0747825e-9 * T * T * T - 9.484024e-13 * T * T * T * T + 4.1635019 * Math.log(T);
    else ln = -5.8002206e3 / T + 1.3914993 - 4.8640239e-2 * T + 4.1764768e-5 * T * T - 1.4452093e-8 * T * T * T + 6.5459673 * Math.log(T);
    return Math.exp(ln) / 1000;
  }
  function wFromPw(pw, p) { return RATIO * pw / (p - pw); }
  function pwFromW(W, p) { return p * W / (RATIO + W); }
  function pFromAltitude(z) { return P0 * Math.pow(1 - 2.25577e-5 * z, 5.2559); }
  function altitudeFromP(p) { return (1 - Math.pow(p / P0, 1 / 5.2559)) / 2.25577e-5; }
  function enthalpy(t, W) { return 1.006 * t + W * (2501 + 1.86 * t); }
  function tFromHW(h, W) { return (h - 2501 * W) / (1.006 + 1.86 * W); }

  function dewPoint(pw) {
    var lo = -80, hi = 120;
    if (pw <= pws(lo)) return lo;
    for (var i = 0; i < 70; i++) { var m = (lo + hi) / 2; if (pws(m) < pw) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  /* Humidity ratio implied by a dry bulb and a thermodynamic wet bulb (ASHRAE eq. 33 and 35) */
  function wFromWetBulb(t, twb, p) {
    var Wsw = wFromPw(pws(twb), p);
    return twb >= 0 ? ((2501 - 2.326 * twb) * Wsw - 1.006 * (t - twb)) / (2501 + 1.86 * t - 4.186 * twb)
      : ((2830 - 0.24 * twb) * Wsw - 1.006 * (t - twb)) / (2830 + 1.86 * t - 2.1 * twb);
  }
  function wetBulb(t, W, p) {
    var pw = pwFromW(W, p), td = dewPoint(pw);
    if (td >= t) return t;
    var lo = td, hi = t;
    for (var i = 0; i < 70; i++) { var m = (lo + hi) / 2; if (wFromWetBulb(t, m, p) < W) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }

  /* Full state from dry bulb and humidity ratio (kg/kg dry air) */
  function state(t, W, p) {
    var ps = pws(t), pw = pwFromW(W, p), v = 0.287042 * (t + K) * (1 + 1.607858 * W) / p;
    return { t: t, W: W, p: p, pw: pw, pws: ps, rh: 100 * pw / ps, Ws: wFromPw(ps, p), td: dewPoint(pw), twb: wetBulb(t, W, p),
      h: enthalpy(t, W), v: v, rho: (1 + W) / v };
  }
  /* Build a state from a dry bulb and a second property: 'rh' (%), 'twb' (C), 'td' (C) or 'W' (g/kg). Returns {s} or {err}. */
  function fromPair(kind, t, x, p) {
    if (!isFinite(t) || !isFinite(x)) return { err: 'Enter both values.' };
    if (t < -60 || t > 120) return { err: 'Dry bulb must be between -60 and 120 °C.' };
    var ps = pws(t), W;
    if (ps >= p) return { err: 'At this dry bulb the saturation pressure reaches the total pressure (water boils). Use a lower temperature or a lower altitude.' };
    if (kind === 'rh') {
      if (x < 0 || x > 100) return { err: 'Relative humidity must be between 0 and 100 %.' };
      W = wFromPw(x / 100 * ps, p);
    } else if (kind === 'twb') {
      if (x > t + 1e-9) return { err: 'Wet bulb cannot be above the dry bulb.' };
      W = wFromWetBulb(t, x, p);
      if (W < 0) return { err: 'That wet bulb is too low for this dry bulb (humidity would be negative).' };
    } else if (kind === 'td') {
      if (x > t + 1e-9) return { err: 'Dew point cannot be above the dry bulb.' };
      W = wFromPw(pws(x), p);
    } else {
      if (x < 0) return { err: 'Humidity ratio cannot be negative.' };
      W = x / 1000;
      if (W > wFromPw(ps, p) * (1 + 1e-9)) return { err: 'That humidity ratio is above saturation at this dry bulb (it would be fog).' };
    }
    return { s: state(t, W, p) };
  }
  function mix(s1, m1, s2, m2, p) {
    var m = m1 + m2, W = (m1 * s1.W + m2 * s2.W) / m, h = (m1 * s1.h + m2 * s2.h) / m, t = tFromHW(h, W);
    return state(t, W, p);
  }
  var engine = { pws: pws, wFromPw: wFromPw, pwFromW: pwFromW, pFromAltitude: pFromAltitude, altitudeFromP: altitudeFromP, enthalpy: enthalpy, tFromHW: tFromHW,
    dewPoint: dewPoint, wetBulb: wetBulb, wFromWetBulb: wFromWetBulb, state: state, fromPair: fromPair, mix: mix };
  if (typeof module !== 'undefined' && module.exports) module.exports = engine;
  root.PsychEngine = engine;
  if (typeof document === 'undefined') return;

  /* ---------------- UI ---------------- */
  var host = document.getElementById('psy');
  if (!host) return;
  var F = function (x, d) { return isFinite(x) ? Number(x).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–'; };
  var $ = function (id) { return host.querySelector('#' + id); };
  var TR = 3.517; /* kW per ton of refrigeration */

  var PAIRS = {
    rh: { label: 'Relative humidity', unit: '%', v: 50, step: 1 },
    twb: { label: 'Wet bulb temperature', unit: '°C', v: 17.9, step: 0.1 },
    td: { label: 'Dew point temperature', unit: '°C', v: 13.9, step: 0.1 },
    W: { label: 'Humidity ratio', unit: 'g/kg dry air', v: 9.9, step: 0.1 }
  };
  var RANGES = [
    { id: 'n', t0: -10, t1: 50, w1: 30, tg: 5, wg: 5, hs: 10 },
    { id: 'w', t0: 0, t1: 60, w1: 50, tg: 5, wg: 10, hs: 20 },
    { id: 'd', t0: 20, t1: 120, w1: 80, tg: 10, wg: 10, hs: 40 }
  ];
  var mode = 'state', rangeIdx = 0;

  function field(id, label, unit, val, step, extra) {
    return '<label class="ut-f" for="' + id + '">' + label + ' <i>' + unit + '</i><input type="number" inputmode="decimal" id="' + id + '" value="' + val + '" step="' + (step || 'any') + '"' + (extra || '') + '></label>';
  }
  function pairOpts() {
    return Object.keys(PAIRS).map(function (k) { return '<option value="' + k + '">Dry bulb and ' + PAIRS[k].label.toLowerCase() + '</option>'; }).join('');
  }
  host.innerHTML =
    '<div class="ut-card ps-card"><div class="ut-hd"><h3>Psychrometric calculator</h3><p>Moist air properties, an interactive chart, and the coil, mixing and heating loads for air handlers and dryers.</p></div>' +
    '<div class="ps-tabs" role="tablist" aria-label="Calculator mode">' +
    [['state', 'State point'], ['coil', 'Cooling coil'], ['mix', 'Mixing'], ['heat', 'Heating']].map(function (m, i) {
      return '<button type="button" class="ps-tab" role="tab" id="tab-' + m[0] + '" data-mode="' + m[0] + '" aria-selected="' + (i === 0) + '">' + m[1] + '</button>';
    }).join('') + '</div>' +
    '<div class="ps-site ut-in">' + field('alt', 'Altitude above sea level', 'm', 0, 10, ' min="-400" max="5000"') + field('pr', 'Barometric pressure', 'kPa', '101.325', '0.1', ' min="50" max="110"') + '</div>' +
    '<div class="ut-body" id="ps-body"></div>' +
    '<div class="ps-chartwrap"><svg id="ps-chart" viewBox="0 0 900 520" role="img" aria-label="Psychrometric chart with the calculated state points" preserveAspectRatio="xMidYMid meet"></svg>' +
    '<p class="ps-hint">Click anywhere on the chart to set the first state point (A). Curves are relative humidity 10 to 100 %; sloping lines are enthalpy in kJ/kg dry air.</p></div></div>';

  var panels = {
    state: '<div class="ut-in"><label class="ut-f" for="pair">Known properties <i></i><select id="pair">' + pairOpts() + '</select></label>' +
      field('t', 'Dry bulb temperature', '°C', 25, 0.5) + '<label class="ut-f" for="x"><span id="xl">Relative humidity</span> <i id="xu">%</i><input type="number" inputmode="decimal" id="x" value="50" step="1"></label></div><div class="ut-out" id="out"></div>',
    coil: '<div class="ut-in">' + field('flow', 'Air flow at entering state', 'm³/h', 10000, 100) + field('t', 'Entering dry bulb (A)', '°C', 30, 0.5) + field('x', 'Entering relative humidity (A)', '%', 60, 1) +
      field('t2', 'Leaving dry bulb (B)', '°C', 13, 0.5) + field('x2', 'Leaving relative humidity (B)', '%', 95, 1) + '</div><div class="ut-out" id="out"></div>',
    mix: '<div class="ut-in">' + field('flow', 'Stream 1 flow (A), for example fresh air', 'm³/h', 2000, 100) + field('t', 'Stream 1 dry bulb', '°C', 35, 0.5) + field('x', 'Stream 1 relative humidity', '%', 50, 1) +
      field('flow2', 'Stream 2 flow (B), for example return air', 'm³/h', 8000, 100) + field('t2', 'Stream 2 dry bulb', '°C', 24, 0.5) + field('x2', 'Stream 2 relative humidity', '%', 50, 1) + '</div><div class="ut-out" id="out"></div>',
    heat: '<div class="ut-in">' + field('flow', 'Air flow at entering state', 'm³/h', 5000, 100) + field('t', 'Entering dry bulb (A)', '°C', 30, 0.5) + field('x', 'Entering relative humidity (A)', '%', 60, 1) +
      field('t2', 'Heated dry bulb (B)', '°C', 70, 0.5) + '</div><div class="ut-out" id="out"></div>'
  };
  var saved = {}; /* remembered input values per mode so tabs keep their numbers */

  function readAll() {
    var o = {}; host.querySelectorAll('#ps-body input, #ps-body select').forEach(function (e) { o[e.id] = e.type === 'number' ? parseFloat(e.value) : e.value; });
    return o;
  }
  function setMode(m) {
    saved[mode] = readAll();
    mode = m;
    $('ps-body').innerHTML = panels[m];
    var sv = saved[m];
    if (sv) Object.keys(sv).forEach(function (k) { var e = $(k); if (e && sv[k] === sv[k]) e.value = sv[k]; });
    host.querySelectorAll('.ps-tab').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.mode === m)); });
    if (m === 'state') pairUi();
    render();
  }
  function pairUi() {
    var sel = $('pair'); if (!sel) return;
    var P = PAIRS[sel.value]; $('xl').textContent = P.label; $('xu').textContent = P.unit; $('x').step = P.step;
  }

  function pressure() { var p = parseFloat($('pr').value); return isFinite(p) && p > 30 && p < 120 ? p : P0; }

  /* ---------- result blocks ---------- */
  function stateTable(rows) { /* rows: [[label, state], ...] */
    var th = '<tr><th></th>' + rows.map(function (r) { return '<th>' + r[0] + '</th>'; }).join('') + '</tr>';
    var lines = [
      ['Dry bulb, °C', function (s) { return F(s.t, 1); }], ['Relative humidity, %', function (s) { return F(s.rh, 1); }],
      ['Humidity ratio, g/kg', function (s) { return F(s.W * 1000, 2); }], ['Dew point, °C', function (s) { return F(s.td, 1); }],
      ['Wet bulb, °C', function (s) { return F(s.twb, 1); }], ['Enthalpy, kJ/kg', function (s) { return F(s.h, 1); }],
      ['Specific volume, m³/kg', function (s) { return F(s.v, 3); }]];
    return '<div class="ut-table-wrap"><table class="ut-table ps-table">' + th + lines.map(function (l) {
      return '<tr><td>' + l[0] + '</td>' + rows.map(function (r) { return '<td>' + l[1](r[1]) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</table></div>';
  }
  function dl(rows) { return '<dl class="ut-res">' + rows.map(function (r, i) { return '<div' + (i === 0 ? ' class="lead"' : '') + '><dt>' + r[0] + '</dt><dd>' + r[1] + (r[2] ? ' <small>' + r[2] + '</small>' : '') + '</dd></div>'; }).join('') + '</dl>'; }
  function note(cls, txt) { return '<p class="ut-note ' + cls + '">' + txt + '</p>'; }

  var chartPts = null;
  function render() {
    var o = readAll(), p = pressure(), out = $('out'), html = '', A = null, B = null, M = null, kind;
    if (mode === 'state') {
      var r = fromPair($('pair').value, o.t, o.x, p);
      if (r.err) html = note('bad', r.err); else {
        A = r.s;
        html = dl([['Relative humidity', F(A.rh, 1), '%'], ['Humidity ratio', F(A.W * 1000, 2), 'g/kg dry air'], ['Dew point', F(A.td, 1), '°C'], ['Wet bulb', F(A.twb, 1), '°C'],
          ['Enthalpy', F(A.h, 1), 'kJ/kg dry air'], ['Specific volume', F(A.v, 3), 'm³/kg dry air'], ['Moist air density', F(A.rho, 3), 'kg/m³'],
          ['Vapour pressure', F(A.pw, 3), 'kPa'], ['Saturation pressure at dry bulb', F(A.pws, 3), 'kPa']]);
        if (A.rh > 99.5) html += note('warn', 'The air is saturated. Any cooling will now form fog or condensate.');
      }
    } else {
      var a = fromPair('rh', o.t, o.x, p);
      if (a.err) html = note('bad', 'State A: ' + a.err); else {
        A = a.s;
        if (mode === 'heat') {
          if (!(o.t2 > A.t)) html = note('bad', 'The heated dry bulb must be above the entering dry bulb.');
          else if (pws(o.t2) >= p) html = note('bad', 'The heated dry bulb is above the boiling point at this pressure.');
          else if (!(o.flow > 0)) html = note('bad', 'Enter an air flow.');
          else {
            B = state(o.t2, A.W, p);
            var md = o.flow / A.v, q = md * (B.h - A.h) / 3600;
            html = dl([['Heat required', F(q, 1), 'kW'], ['Heat required', F(q * 860.4, 0), 'kcal/h'], ['Dry air mass flow', F(md, 0), 'kg/h'], ['Relative humidity after heating', F(B.rh, 1), '%']]) +
              stateTable([['A in', A], ['B heated', B]]) +
              note('', 'Heating adds no moisture, so the humidity ratio stays the same and the relative humidity falls. The wet bulb of the heated air (' + F(B.twb, 1) + ' °C) is the temperature a freely evaporating wet surface settles at, so it is a floor for the product surface temperature during constant-rate drying.');
          }
        } else {
          var b = fromPair('rh', o.t2, o.x2, p);
          if (b.err) html = note('bad', 'State B: ' + b.err); else {
            B = b.s;
            if (mode === 'coil') {
              if (!(o.flow > 0)) html = note('bad', 'Enter an air flow.');
              else {
                var m = o.flow / A.v, qt = m * (A.h - B.h) / 3600, sensH = enthalpy(A.t, B.W) - enthalpy(B.t, B.W), qs = m * sensH / 3600, ql = qt - qs, cond = m * (A.W - B.W);
                if (qt <= 0 || B.W > A.W + 1e-9 && B.t < A.t) {
                  html = note('bad', qt <= 0 ? 'The leaving air has more enthalpy than the entering air, so this is not a cooling coil. Check state B.' : 'The leaving air holds more moisture than the entering air. A cooling coil cannot add moisture; lower the leaving humidity.');
                } else {
                  html = dl([['Total cooling load', F(qt, 1), 'kW'], ['Refrigeration', F(qt / TR, 1), 'TR'], ['Sensible load', F(qs, 1), 'kW'], ['Latent load', F(Math.max(ql, 0), 1), 'kW'],
                    ['Sensible heat ratio', F(qt > 0 ? qs / qt : NaN, 2), ''], ['Condensate', F(Math.max(cond, 0), 1), 'kg/h'], ['Dry air mass flow', F(m, 0), 'kg/h']]) +
                    stateTable([['A entering', A], ['B leaving', B]]);
                  if (B.W > A.W) html += note('warn', 'No moisture is removed with these states. The coil only cools the air.');
                  if (B.t > A.td && B.W < A.W - 1e-9) html += note('warn', 'Leaving dry bulb is above the entering dew point but humidity falls. The coil surface must be colder than ' + F(A.td, 1) + ' °C to condense water, so the coil needs a low chilled water temperature or a deep coil.');
                  html += note('', 'The process line on the chart is straight for clarity. A real coil follows a curve toward its apparatus dew point. Condensate is the water removed from the air stream.');
                }
              }
            } else { /* mix */
              if (!(o.flow > 0) || !(o.flow2 > 0)) html = note('bad', 'Enter both air flows.');
              else {
                var m1 = o.flow / A.v, m2 = o.flow2 / B.v;
                M = mix(A, m1, B, m2, p);
                html = dl([['Mixed dry bulb', F(M.t, 1), '°C'], ['Mixed relative humidity', F(M.rh, 1), '%'], ['Mixed humidity ratio', F(M.W * 1000, 2), 'g/kg'], ['Mixed enthalpy', F(M.h, 1), 'kJ/kg'],
                  ['Stream 1 share of dry air', F(100 * m1 / (m1 + m2), 1), '% by mass'], ['Total flow', F(o.flow + o.flow2, 0), 'm³/h (inlet conditions)']]) +
                  stateTable([['A stream 1', A], ['B stream 2', B], ['M mixed', M]]);
                if (M.W > M.Ws * (1 + 1e-6)) html += note('bad', 'The mixture is supersaturated: it will form fog. The straight mixing line crosses the saturation curve.');
                html += note('', 'Mixing is a mass-weighted average of humidity ratio and enthalpy, so the mixed state lies on the straight line between A and B, closer to the larger air stream.');
              }
            }
          }
        }
      }
    }
    out.innerHTML = html;
    chartPts = { A: A, B: B, M: M };
    drawChart(p, A, B, M);
  }

  /* ---------- chart ---------- */
  var VW = 900, VH = 520, L = 56, R = 62, T = 18, Bt = 46;
  var X = function (R_, t) { return L + (t - R_.t0) / (R_.t1 - R_.t0) * (VW - L - R); };
  var Y = function (R_, w) { return VH - Bt - w / R_.w1 * (VH - T - Bt); };
  function fits(R_, s) { return s && s.t >= R_.t0 && s.t <= R_.t1 && s.W * 1000 <= R_.w1; }
  function pickRange(pts) {
    var list = pts.filter(Boolean);
    for (var i = 0; i < RANGES.length; i++) if (list.every(function (s) { return fits(RANGES[i], s); })) return i;
    return RANGES.length - 1;
  }
  function drawChart(p, A, B, M) {
    var pts = [A, B, M].filter(Boolean);
    if (pts.length) rangeIdx = pickRange(pts);
    var R_ = RANGES[rangeIdx], svg = $('ps-chart'), s = '';
    s += '<defs><clipPath id="psclip"><rect x="' + L + '" y="' + T + '" width="' + (VW - L - R) + '" height="' + (VH - T - Bt) + '"/></clipPath></defs>';
    s += '<rect class="ps-bg" x="' + L + '" y="' + T + '" width="' + (VW - L - R) + '" height="' + (VH - T - Bt) + '"/>';
    var t, w;
    for (t = Math.ceil(R_.t0 / R_.tg) * R_.tg; t <= R_.t1; t += R_.tg) s += '<line class="ps-grid" x1="' + X(R_, t) + '" x2="' + X(R_, t) + '" y1="' + T + '" y2="' + (VH - Bt) + '"/><text class="ps-ax" x="' + X(R_, t) + '" y="' + (VH - Bt + 17) + '" text-anchor="middle">' + t + '</text>';
    for (w = 0; w <= R_.w1; w += R_.wg) s += '<line class="ps-grid" x1="' + L + '" x2="' + (VW - R) + '" y1="' + Y(R_, w) + '" y2="' + Y(R_, w) + '"/><text class="ps-ax" x="' + (VW - R + 8) + '" y="' + (Y(R_, w) + 4) + '">' + w + '</text>';
    s += '<text class="ps-axt" x="' + (L + (VW - L - R) / 2) + '" y="' + (VH - 8) + '" text-anchor="middle">Dry bulb temperature, °C</text>';
    s += '<text class="ps-axt" transform="translate(' + (VW - 12) + ',' + (T + (VH - T - Bt) / 2) + ') rotate(90)" text-anchor="middle">Humidity ratio, g/kg dry air</text>';
    s += '<g clip-path="url(#psclip)">';
    /* enthalpy lines */
    var hmax = enthalpy(R_.t1, R_.w1 / 1000), h;
    for (h = 0; h <= hmax; h += R_.hs) {
      var d = '', first = null, last = null;
      for (t = R_.t0; t <= R_.t1 + 1e-9; t += 0.5) {
        w = (h - 1.006 * t) / (2501 + 1.86 * t);
        if (w < -1e-9 || w > wFromPw(Math.min(pws(t), p * 0.999), p) + 1e-9) continue;
        d += (d ? 'L' : 'M') + X(R_, t).toFixed(1) + ' ' + Y(R_, w * 1000).toFixed(1); if (!first) first = [t, w]; last = [t, w];
      }
      if (d) { s += '<path class="ps-h" d="' + d + '"/>'; if (first && first[1] * 1000 <= R_.w1 && h > 0) s += '<text class="ps-hl" x="' + (X(R_, first[0]) - 3) + '" y="' + (Y(R_, first[1] * 1000) - 3) + '" text-anchor="end">' + h + '</text>'; }
    }
    /* relative humidity curves */
    var labels = '';
    for (var rh = 10; rh <= 100; rh += 10) {
      var dd = '', lp = null;
      for (t = R_.t0; t <= R_.t1 + 1e-9; t += 0.5) {
        var pw = rh / 100 * pws(t); if (pw >= p * 0.999) break;
        w = wFromPw(pw, p) * 1000; if (w > R_.w1 * 1.04) break;
        dd += (dd ? 'L' : 'M') + X(R_, t).toFixed(1) + ' ' + Y(R_, w).toFixed(1); lp = [t, w];
      }
      if (dd) { s += '<path class="' + (rh === 100 ? 'ps-sat' : 'ps-rh') + '" d="' + dd + '"/>'; if (lp && lp[1] <= R_.w1) labels += '<text class="ps-rl" x="' + (X(R_, lp[0]) - 4) + '" y="' + (Y(R_, lp[1]) - 5) + '" text-anchor="end">' + rh + (rh === 100 ? ' %' : '') + '</text>'; }
    }
    s += '</g>' + labels;
    /* process line and points */
    function pt(sp, tag, cls) { return '<circle class="ps-pt ' + cls + '" cx="' + X(R_, sp.t) + '" cy="' + Y(R_, sp.W * 1000) + '" r="6"/><text class="ps-ptl" x="' + (X(R_, sp.t) + 9) + '" y="' + (Y(R_, sp.W * 1000) - 8) + '">' + tag + '</text>'; }
    if (A && B) s += '<line class="ps-proc" x1="' + X(R_, A.t) + '" y1="' + Y(R_, A.W * 1000) + '" x2="' + X(R_, B.t) + '" y2="' + Y(R_, B.W * 1000) + '"/>';
    if (A) s += pt(A, 'A', 'a'); if (B) s += pt(B, 'B', 'b'); if (M) s += pt(M, 'M', 'm');
    s += '<rect class="ps-hit" x="' + L + '" y="' + T + '" width="' + (VW - L - R) + '" height="' + (VH - T - Bt) + '"/>';
    svg.innerHTML = s;
    svg._r = R_;
  }
  function onChartClick(ev) {
    var svg = $('ps-chart'), R_ = svg._r; if (!R_) return;
    var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var c = pt.matrixTransform(svg.getScreenCTM().inverse());
    var t = R_.t0 + (c.x - L) / (VW - L - R) * (R_.t1 - R_.t0), w = (VH - Bt - c.y) / (VH - T - Bt) * R_.w1 / 1000, p = pressure();
    if (t < R_.t0 || t > R_.t1 || w < 0 || pws(t) >= p) return;
    var ws = wFromPw(pws(t), p); if (w > ws) w = ws;
    var s = state(t, w, p), tv = $('t'); if (!tv) return;
    tv.value = (Math.round(t * 2) / 2).toFixed(1);
    if (mode === 'state') {
      var k = $('pair').value, st = state(parseFloat(tv.value), w, p), val = k === 'rh' ? st.rh : k === 'twb' ? st.twb : k === 'td' ? st.td : st.W * 1000;
      $('x').value = (Math.round(val * 10) / 10).toFixed(1);
    } else {
      $('x').value = (Math.round(state(parseFloat(tv.value), w, p).rh * 10) / 10).toFixed(1);
    }
    render();
  }

  /* ---------- wiring ---------- */
  host.addEventListener('input', function (e) {
    var id = e.target.id;
    if (id === 'alt') { var z = parseFloat(e.target.value); if (isFinite(z)) $('pr').value = pFromAltitude(z).toFixed(3); }
    else if (id === 'pr') { var pp = parseFloat(e.target.value); if (isFinite(pp) && pp > 30 && pp < 120) $('alt').value = Math.round(altitudeFromP(pp)); }
    else if (id === 'pair') {
      var prev = e.target._prev, cur = PAIRS[e.target.value]; PAIRS[prev || 'rh'].v = parseFloat($('x').value) || PAIRS[prev || 'rh'].v;
      $('x').value = cur.v; e.target._prev = e.target.value; pairUi();
    }
    render();
  });
  host.addEventListener('focusin', function (e) { if (e.target.id === 'pair') e.target._prev = e.target.value; });
  host.addEventListener('click', function (e) {
    var b = e.target.closest('.ps-tab'); if (b) { setMode(b.dataset.mode); return; }
    if (e.target.classList && e.target.classList.contains('ps-hit')) onChartClick(e);
  });
  setMode('state');
})(typeof window !== 'undefined' ? window : this);
