/* PharmaChemE articles: interactive figures. A figure is <figure class="art-fig" data-fig="name">; each module draws into it. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const F = (x, d) => isFinite(x) ? Number(x).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–';
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || null;
  const C = () => ({ ink: css('--paper') || '#E8EEF4', mute: css('--muted') || '#8DA2B6', brass: css('--brass') || '#D4A72C', grid: css('--grid-line') || '#22384F', rust: '#F08A6B', blue: '#7FB2E8', green: '#8FD1A5' });
  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, x, y, s, attrs) { const t = el('text', Object.assign({ x, y, 'font-family': 'sans-serif', 'font-size': 12, fill: 'currentColor' }, attrs || {}), parent); t.textContent = s; return t; }
  function tween(from, to, ms, step) { if (reduce || ms <= 0) { step(to); return; } const t0 = performance.now(); (function f(now) { const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; step(from.map((a, i) => a + (to[i] - a) * e)); if (k < 1) requestAnimationFrame(f); })(performance.now()); }
  function controls(fig, html) { const d = document.createElement('div'); d.className = 'art-ctl'; d.innerHTML = html; fig.insertBefore(d, fig.firstChild); return d; }
  function readout(fig) { const d = document.createElement('div'); d.className = 'art-read'; const cap = fig.querySelector('figcaption'); fig.insertBefore(d, cap); return d; }
  // plot helper: axes with ticks; returns mapping functions
  function axes(svg, o) {
    const c = C(), { x0, y0, w, h, xmax, ymax, xlab, ylab, xstep, ystep } = o, yd = o.ydec || 0;
    const X = v => x0 + v / xmax * w, Y = v => y0 + h - v / ymax * h;
    for (let v = 0; v <= xmax + 1e-9; v += xstep) { el('line', { x1: X(v), y1: y0, x2: X(v), y2: y0 + h, stroke: c.grid, 'stroke-width': 1 }, svg); txt(svg, X(v), y0 + h + 16, F(v, 0), { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); }
    for (let v = 0; v <= ymax + 1e-9; v += ystep) { el('line', { x1: x0, y1: Y(v), x2: x0 + w, y2: Y(v), stroke: c.grid, 'stroke-width': 1 }, svg); txt(svg, x0 - 8, Y(v) + 4, F(v, yd), { 'text-anchor': 'end', fill: c.mute, 'font-size': 11 }); }
    txt(svg, x0 + w / 2, y0 + h + 34, xlab, { 'text-anchor': 'middle', fill: c.mute });
    const yl = txt(svg, 0, 0, ylab, { 'text-anchor': 'middle', fill: c.mute }); yl.setAttribute('transform', `translate(${x0 - 40},${y0 + h / 2}) rotate(-90)`);
    return { X, Y };
  }
  const path = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

  const M = {};

  /* Pump curve vs system curve: throttle valve vs VFD */
  M['pump-curve'] = function (fig) {
    const c = C(), H0 = 38, a = 0.0032, Hs = 12, k = 0.0072, Qb = 50, eMax = 0.70, sg = 1;
    const svg = el('svg', { viewBox: '0 0 640 330', role: 'img', 'aria-label': 'Pump curve and system curve with the operating point' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<button type="button" data-m="thr" aria-pressed="true">Throttle a valve</button><button type="button" data-m="vfd" aria-pressed="false">Slow the pump (VFD)</button>
      <label>Flow needed <input type="range" min="25" max="50" step="1" value="35" aria-label="Flow needed in cubic metres per hour"> <output>35 m³/h</output></label>`);
    const rd = readout(fig);
    const { X, Y } = axes(svg, { x0: 70, y0: 16, w: 540, h: 260, xmax: 70, ymax: 50, xstep: 10, ystep: 10, xlab: 'Flow (m³/h)', ylab: 'Head (m)' });
    const sysBase = el('path', { fill: 'none', stroke: c.blue, 'stroke-width': 2.5 }, svg);
    const sysNow = el('path', { fill: 'none', stroke: c.rust, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, svg);
    const pumpFull = el('path', { fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg);
    const pumpNow = el('path', { fill: 'none', stroke: c.brass, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, svg);
    const dot = el('circle', { r: 8, fill: c.ink, stroke: '#0B1622', 'stroke-width': 2 }, svg);
    txt(svg, X(3), Y(H0) - 10, 'Pump curve', { fill: c.brass, 'font-weight': 700 });
    txt(svg, X(14), Y(Hs + k * 14 * 14) + 22, 'System curve', { fill: c.blue, 'font-weight': 700 });
    const lab = txt(svg, 0, 0, '', { fill: c.ink, 'font-weight': 700 });
    sysBase.setAttribute('d', path(Array.from({ length: 71 }, (_, q) => [X(q), Y(Hs + k * q * q)])));
    pumpFull.setAttribute('d', path(Array.from({ length: 71 }, (_, q) => [X(q), Y(Math.max(0, H0 - a * q * q))])));
    const eff = (q, n) => Math.max(0.05, eMax * (1 - Math.pow((q - Qb * n) / (Qb * n), 2)));
    const pw = (q, h, n) => sg * 9.81 * q / 3600 * h / eff(q, n);
    let mode = 'thr', Q = 35, cur = null;
    function draw() {
      let n = 1, H, kk = k;
      if (mode === 'thr') { H = H0 - a * Q * Q; kk = (H - Hs) / (Q * Q); }
      else { H = Hs + k * Q * Q; n = Math.sqrt((H + a * Q * Q) / H0); }
      sysNow.setAttribute('d', mode === 'thr' ? path(Array.from({ length: 71 }, (_, q) => q).filter(q => Hs + kk * q * q <= 50).map(q => [X(q), Y(Hs + kk * q * q)])) : '');
      pumpNow.setAttribute('d', mode === 'vfd' ? path(Array.from({ length: 71 }, (_, q) => [X(q), Y(Math.max(0, H0 * n * n - a * q * q))])) : '');
      const target = [X(Q), Y(H)], start = cur || target;
      tween(start, target, 450, p => { dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]); lab.setAttribute('x', p[0] + 12); lab.setAttribute('y', p[1] - 10); }); cur = target;
      lab.textContent = F(H, 1) + ' m';
      const Hfull = H0 - a * 50 * 50, Pfull = pw(50, Hfull, 1), Pthr = pw(Q, H0 - a * Q * Q, 1), Pvfd = pw(Q, Hs + k * Q * Q, Math.sqrt((Hs + k * Q * Q + a * Q * Q) / H0));
      rd.innerHTML = `<div><span>Head the pump makes</span><b>${F(H, 1)} m</b></div><div><span>${mode === 'thr' ? 'Valve burns off' : 'Pump speed'}</span><b>${mode === 'thr' ? F(H - (Hs + k * Q * Q), 1) + ' m of head' : F(n * 100, 0) + ' %'}</b></div>
        <div><span>Pump efficiency</span><b>${F(eff(Q, n) * 100, 0)} %</b></div><div class="hi"><span>Shaft power</span><b>${F(mode === 'thr' ? Pthr : Pvfd, 2)} kW</b></div>
        <div><span>${mode === 'thr' ? 'With a VFD instead' : 'With a throttled valve'}</span><b>${F(mode === 'thr' ? Pvfd : Pthr, 2)} kW</b></div><div><span>Full flow (50 m³/h)</span><b>${F(Pfull, 2)} kW</b></div>`;
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-m]'); if (!b) return; mode = b.dataset.m; ctl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    ctl.querySelector('input').addEventListener('input', e => { Q = +e.target.value; ctl.querySelector('output').textContent = Q + ' m³/h'; draw(); });
    draw();
  };

  /* Cavitation: vapour bubbles at the impeller eye when suction pressure is too low */
  M['cavitation'] = function (fig) {
    const ctl = controls(fig, `<button type="button" data-v="vac" aria-pressed="true">Receiver at 100 mbar abs</button><button type="button" data-v="n2" aria-pressed="false">Vacuum broken with nitrogen</button>`);
    const g = fig.querySelector('.bubbles'), msg = fig.querySelector('.cav-msg'), out = readout(fig);
    function set(v) {
      const vac = v === 'vac', P = vac ? 10000 : 101325, npsha = (P - 7900) / (850 * 9.81) + 2.0 - 0.3;
      g.style.display = vac ? '' : 'none'; if (msg) msg.textContent = vac ? 'Cavitating: vapour forms at the eye and collapses on the vanes' : 'Liquid stays liquid: no cavitation';
      out.innerHTML = `<div><span>Pressure on the liquid</span><b>${vac ? '100 mbar abs' : '1,013 mbar abs'}</b></div><div><span>Toluene vapour pressure, 40 °C</span><b>79 mbar</b></div><div class="hi"><span>NPSH available</span><b>${F(npsha, 2)} m</b></div><div><span>Pump needs</span><b>2.5 m</b></div>`;
      ctl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (b) set(b.dataset.v); });
    set('vac');
  };

  /* Antoine: boiling point under vacuum, with the condenser check */
  const SOLV = { toluene: ['Toluene', 6.95087, 1342.31, 219.187, 363], methanol: ['Methanol', 8.08097, 1582.27, 239.7, 1100], acetone: ['Acetone', 7.11714, 1210.595, 229.664, 518],
    ipa: ['IPA', 8.11778, 1580.92, 219.61, 663], ethanol: ['Ethanol', 8.20417, 1642.89, 230.3, 841], water: ['Water', 8.07131, 1730.63, 233.426, 2257], mdc: ['MDC', 7.0803, 1138.91, 231.45, 330] };
  M['antoine'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 320', role: 'img', 'aria-label': 'Vapour pressure curve with the boiling point at the chosen vacuum' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Solvent <select aria-label="Solvent">${Object.entries(SOLV).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select></label>
      <label>Pressure <input type="range" min="20" max="1013" step="1" value="133" aria-label="Pressure in mbar absolute"> <output>133 mbar abs</output></label>`);
    const sel = ctl.querySelector('select'); sel.style.cssText = 'font:600 .85rem var(--f-sans);color:var(--paper);background:var(--bg-deep);border:1px solid #2C4C6C;border-radius:6px;padding:5px 8px';
    const rd = readout(fig);
    const x0 = 70, y0 = 14, w = 540, h = 250, Tmin = -30, Tmax = 130, Pmax = 1100;
    const X = t => x0 + (t - Tmin) / (Tmax - Tmin) * w, Y = p => y0 + h - p / Pmax * h;
    for (let t = -20; t <= 120; t += 20) { el('line', { x1: X(t), y1: y0, x2: X(t), y2: y0 + h, stroke: c.grid }, svg); txt(svg, X(t), y0 + h + 16, t, { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); }
    for (let p = 0; p <= 1000; p += 200) { el('line', { x1: x0, y1: Y(p), x2: x0 + w, y2: Y(p), stroke: c.grid }, svg); txt(svg, x0 - 8, Y(p) + 4, p, { 'text-anchor': 'end', fill: c.mute, 'font-size': 11 }); }
    txt(svg, x0 + w / 2, y0 + h + 34, 'Temperature (°C)', { 'text-anchor': 'middle', fill: c.mute });
    const yl = txt(svg, 0, 0, 'Vapour pressure (mbar)', { 'text-anchor': 'middle', fill: c.mute }); yl.setAttribute('transform', `translate(${x0 - 46},${y0 + h / 2}) rotate(-90)`);
    // condenser coolant bands
    el('rect', { x: X(25), y: y0, width: X(40) - X(25), height: h, fill: c.blue, opacity: .08 }, svg); txt(svg, X(32.5), y0 + 14, 'cooling water', { 'text-anchor': 'middle', fill: c.blue, 'font-size': 11 });
    el('rect', { x: X(-15), y: y0, width: X(10) - X(-15), height: h, fill: c.green, opacity: .07 }, svg); txt(svg, X(-2.5), y0 + 14, 'chilled / brine', { 'text-anchor': 'middle', fill: c.green, 'font-size': 11 });
    const curve = el('path', { fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg);
    const hline = el('line', { stroke: c.ink, 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }, svg), vline = el('line', { stroke: c.ink, 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }, svg);
    const dot = el('circle', { r: 7, fill: c.ink, stroke: '#0B1622', 'stroke-width': 2 }, svg), lab = txt(svg, 0, 0, '', { fill: c.ink, 'font-weight': 700 });
    let cur = null;
    function draw() {
      const s = SOLV[sel.value], P = +ctl.querySelector('input').value, [_, A, B, Cc, L] = s;
      const pv = t => Math.pow(10, A - B / (t + Cc)) * 1.33322;
      const pts = []; for (let t = Tmin; t <= Tmax; t += 1) { const p = pv(t); if (p <= Pmax) pts.push([X(t), Y(p)]); }
      curve.setAttribute('d', path(pts));
      const Tb = B / (A - Math.log10(P / 1.33322)) - Cc, nbp = B / (A - Math.log10(760)) - Cc;
      ctl.querySelector('output').textContent = P + ' mbar abs';
      const tgt = [X(Math.max(Tmin, Math.min(Tmax, Tb))), Y(P)], st = cur || tgt; cur = tgt;
      tween(st, tgt, 350, q => { dot.setAttribute('cx', q[0]); dot.setAttribute('cy', q[1]); hline.setAttribute('x1', x0); hline.setAttribute('x2', q[0]); hline.setAttribute('y1', q[1]); hline.setAttribute('y2', q[1]);
        vline.setAttribute('x1', q[0]); vline.setAttribute('x2', q[0]); vline.setAttribute('y1', q[1]); vline.setAttribute('y2', y0 + h); lab.setAttribute('x', q[0] + 10); lab.setAttribute('y', q[1] - 10); });
      lab.textContent = F(Tb, 1) + ' °C';
      const cond = Tb >= 42 ? ['Cooling water (32 °C) condenses it', ''] : Tb >= 17 ? ['Needs chilled water (≈7 °C) in the condenser', ''] : Tb >= -5 ? ['Needs brine (≈ −10 °C); vapour will reach the vacuum pump', 'hi'] : ['Too cold to condense on normal utilities', 'hi'];
      rd.innerHTML = `<div class="hi"><span>Boils at</span><b>${F(Tb, 1)} °C</b></div><div><span>At atmospheric</span><b>${F(nbp, 1)} °C</b></div><div><span>Drop from vacuum</span><b>${F(nbp - Tb, 0)} °C</b></div><div><span>Latent heat (near nbp)</span><b>${F(L, 0)} kJ/kg</b></div><div class="${cond[1]}"><span>Condenser</span><b style="font-size:.9rem">${cond[0]}</b></div>`;
    }
    sel.addEventListener('change', draw); ctl.querySelector('input').addEventListener('input', draw); draw();
  };

  /* Batch heat-up / cool-down with a jacket at constant temperature */
  M['heatup'] = function (fig) {
    const c = C(), Mcp = 4000 * 2.0; // kJ/K
    const svg = el('svg', { viewBox: '0 0 640 310', role: 'img', 'aria-label': 'Batch temperature against time for a jacketed reactor' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<button type="button" data-j="steam" aria-pressed="true">Steam, 3 barg</button><button type="button" data-j="hw" aria-pressed="false">Hot water, 90 °C</button><button type="button" data-j="cw" aria-pressed="false">Cool with cooling water</button>
      <label>U <input type="range" min="150" max="600" step="10" value="350" aria-label="Overall heat transfer coefficient"> <output>350 W/m²K</output></label>`);
    const rd = readout(fig);
    const { X, Y } = axes(svg, { x0: 64, y0: 14, w: 550, h: 240, xmax: 120, ymax: 160, xstep: 20, ystep: 20, xlab: 'Time (min)', ylab: 'Batch temperature (°C)' });
    const jl = el('line', { stroke: c.rust, 'stroke-dasharray': '6 5', 'stroke-width': 1.5 }, svg), jt = txt(svg, 0, 0, '', { fill: c.rust, 'font-size': 11 });
    const tl = el('line', { stroke: c.mute, 'stroke-dasharray': '2 4', 'stroke-width': 1.5 }, svg), tt = txt(svg, 0, 0, '', { fill: c.mute, 'font-size': 11 });
    const curve = el('path', { fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg), dot = el('circle', { r: 6, fill: c.ink }, svg);
    let J = 'steam', anim = 0;
    function draw() {
      const U = +ctl.querySelector('input').value, A = 9, UA = U * A / 1000; // kW/K
      const Tj = J === 'steam' ? 143.6 : J === 'hw' ? 90 : 32, T0 = J === 'cw' ? 80 : 30, Tt = J === 'cw' ? 40 : 80;
      const tau = Mcp / UA / 60; // min
      const T = t => Tj + (T0 - Tj) * Math.exp(-t / tau);
      const tReach = tau * Math.log((Tj - T0) / (Tj - Tt));
      ctl.querySelector('output').textContent = U + ' W/m²K';
      jl.setAttribute('x1', X(0)); jl.setAttribute('x2', X(120)); jl.setAttribute('y1', Y(Tj)); jl.setAttribute('y2', Y(Tj)); jt.setAttribute('x', X(120) - 4); jt.setAttribute('y', Y(Tj) - 6); jt.setAttribute('text-anchor', 'end'); jt.textContent = 'Jacket ' + F(Tj, 0) + ' °C';
      tl.setAttribute('x1', X(0)); tl.setAttribute('x2', X(120)); tl.setAttribute('y1', Y(Tt)); tl.setAttribute('y2', Y(Tt)); tt.setAttribute('x', X(2)); tt.setAttribute('y', Y(Tt) - 6); tt.textContent = 'Target ' + Tt + ' °C';
      const pts = []; for (let t = 0; t <= 120; t += 1) pts.push([X(t), Y(T(t))]); curve.setAttribute('d', path(pts));
      const id = ++anim, tEnd = Math.min(120, tReach);
      if (reduce) { dot.setAttribute('cx', X(tEnd)); dot.setAttribute('cy', Y(T(tEnd))); }
      else { const t0 = performance.now(); (function f(now) { if (id !== anim) return; const k = Math.min(1, (now - t0) / 1600), t = tEnd * k; dot.setAttribute('cx', X(t)); dot.setAttribute('cy', Y(T(t))); if (k < 1) requestAnimationFrame(f); })(t0); }
      const q0 = UA * Math.abs(Tj - T0), q1 = UA * Math.abs(Tj - Tt);
      rd.innerHTML = `<div class="hi"><span>Time to ${Tt} °C</span><b>${isFinite(tReach) ? F(tReach, 0) + ' min' : 'never'}</b></div><div><span>Heat flow at start</span><b>${F(q0, 0)} kW</b></div><div><span>Heat flow near target</span><b>${F(q1, 0)} kW</b></div><div><span>Time constant M·cp/UA</span><b>${F(tau, 0)} min</b></div>`;
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-j]'); if (!b) return; J = b.dataset.j; ctl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    ctl.querySelector('input').addEventListener('input', draw); draw();
  };

  /* Ruth cake filtration: filtrate collected against time, lab data and plant prediction */
  M['ruth'] = function (fig) {
    const c = C(), mu = 1e-3, cs = 40;
    const svg = el('svg', { viewBox: '0 0 640 310', role: 'img', 'aria-label': 'Filtrate volume collected against time for different cake resistances' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Cake resistance α <input type="range" min="9" max="12" step="0.1" value="10.7" aria-label="Log of specific cake resistance"> <output></output></label>
      <label>Driving pressure <input type="range" min="0.3" max="3" step="0.1" value="0.5" aria-label="Pressure difference in bar"> <output></output></label>`);
    const [ia, ip] = ctl.querySelectorAll('input'), [oa, op] = ctl.querySelectorAll('output');
    const rd = readout(fig);
    const { X, Y } = axes(svg, { x0: 64, y0: 14, w: 550, h: 240, xmax: 8, ymax: 2, xstep: 1, ystep: 0.5, ydec: 1, xlab: 'Time (h)', ylab: 'Filtrate (m³) on 2 m²' });
    const curve = el('path', { fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg), tgt = el('line', { stroke: c.mute, 'stroke-dasharray': '4 4' }, svg), dot = el('circle', { r: 6, fill: c.ink }, svg);
    function draw() {
      const al = Math.pow(10, +ia.value), dp = +ip.value * 1e5, A = 2, Rm = 1e10, Vt = 2;
      oa.textContent = al.toExponential(1).replace('e+', ' × 10^') + ' m/kg'; op.textContent = (+ip.value).toFixed(1) + ' bar';
      const K = mu * al * cs / (2 * A * A * dp), B = mu * Rm / (A * dp); // t = K V² + B V (s)
      const tOf = V => K * V * V + B * V, VOf = t => (-B + Math.sqrt(B * B + 4 * K * t)) / (2 * K);
      const pts = []; for (let h = 0; h <= 8; h += 0.05) pts.push([X(h), Y(Math.min(2.2, VOf(h * 3600)))]); curve.setAttribute('d', path(pts.filter(p => p[1] >= 10)));
      const th = tOf(Vt) / 3600; tgt.setAttribute('x1', X(0)); tgt.setAttribute('x2', X(8)); tgt.setAttribute('y1', Y(Vt)); tgt.setAttribute('y2', Y(Vt));
      dot.setAttribute('cx', X(Math.min(8, th))); dot.setAttribute('cy', Y(th <= 8 ? Vt : VOf(8 * 3600)));
      const band = al < 1e10 ? 'Fast-filtering' : al < 1e11 ? 'Moderate' : al < 1e12 ? 'Slow' : 'Very slow';
      rd.innerHTML = `<div class="hi"><span>Time for 2 m³ of filtrate</span><b>${th > 99 ? '> 99 h' : F(th, 1) + ' h'}</b></div><div><span>Cake behaviour</span><b>${band}</b></div><div><span>Cake on the cloth</span><b>${F(cs * Vt / A, 0)} kg/m² dry</b></div>`;
    }
    ia.addEventListener('input', draw); ip.addEventListener('input', draw); draw();
  };

  /* Mixing scale-up: lab vs plant vessel, impellers turning at relative speeds */
  M['scaleup'] = function (fig) {
    const c = C(), D1 = 0.1, D2 = 1.0, N1 = 300, Np = 5, rho = 1000, mu = 1e-3, T1 = 3 * D1, T2 = 3 * D2;
    const V = T => Math.PI / 4 * T * T * T, Pw = (N, D) => Np * rho * Math.pow(N / 60, 3) * Math.pow(D, 5), tB = (N) => 5.2 / (Math.cbrt(Np) * N / 60) * 9;
    const svg = el('svg', { viewBox: '0 0 640 250', role: 'img', 'aria-label': 'Lab and plant stirred vessels with impellers turning at relative speeds' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<button type="button" data-r="pv" aria-pressed="true">Constant P/V</button><button type="button" data-r="tip" aria-pressed="false">Constant tip speed</button><button type="button" data-r="re" aria-pressed="false">Constant Reynolds number</button>`);
    const rd = readout(fig);
    function vessel(x, y, w, h, label) {
      const g = el('g', {}, svg);
      el('path', { d: `M${x} ${y} V${y + h - w * .12} q0 ${w * .16} ${w / 2} ${w * .16} q${w / 2} 0 ${w / 2} ${-w * .16} V${y}`, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5 }, g);
      el('rect', { x: x + 1.5, y: y + h * .12, width: w - 3, height: h * .88 - w * .1, fill: c.blue, opacity: .25 }, g);
      el('line', { x1: x + w / 2, y1: y - 14, x2: x + w / 2, y2: y + h * .7, stroke: 'currentColor', 'stroke-width': 2 }, g);
      const imp = el('g', {}, g); const iw = w / 3;
      el('rect', { x: x + w / 2 - iw / 2, y: y + h * .7 - 5, width: iw, height: 10, rx: 2, fill: c.brass }, imp);
      txt(svg, x + w / 2, 244, label, { 'text-anchor': 'middle', fill: c.mute });
      return { imp, cx: x + w / 2, iw };
    }
    const lab = vessel(90, 120, 90, 90, 'Lab: 0.1 m impeller'), plant = vessel(330, 30, 230, 180, 'Plant: 1.0 m impeller');
    const ll = txt(svg, lab.cx, 104, '', { 'text-anchor': 'middle', fill: c.ink, 'font-weight': 700 }), pl = txt(svg, plant.cx, 16, '', { 'text-anchor': 'middle', fill: c.ink, 'font-weight': 700 });
    let N2 = 64.6, ph1 = 0, ph2 = 0, last = performance.now();
    function spin(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; const slow = 1 / 20; // shown 20x slower so the eye can follow
      ph1 += N1 / 60 * dt * slow * 2 * Math.PI; ph2 += N2 / 60 * dt * slow * 2 * Math.PI;
      lab.imp.setAttribute('transform', `translate(${lab.cx} 0) scale(${Math.cos(ph1).toFixed(3)} 1) translate(${-lab.cx} 0)`);
      plant.imp.setAttribute('transform', `translate(${plant.cx} 0) scale(${Math.cos(ph2).toFixed(3)} 1) translate(${-plant.cx} 0)`);
      if (!fig.classList.contains('paused') && !reduce) requestAnimationFrame(spin); else setTimeout(() => requestAnimationFrame(spin), 300); }
    function draw(r) {
      const n = r === 'tip' ? 1 : r === 'pv' ? 2 / 3 : 2; N2 = N1 * Math.pow(D1 / D2, n);
      const p1 = Pw(N1, D1), p2 = Pw(N2, D2), tip = n => Math.PI * D1 * n / 60;
      ll.textContent = N1 + ' rpm'; pl.textContent = F(N2, N2 < 10 ? 1 : 0) + ' rpm';
      rd.innerHTML = `<div class="hi"><span>Plant speed</span><b>${F(N2, N2 < 10 ? 1 : 0)} rpm</b></div><div><span>Tip speed lab → plant</span><b>${F(tip(N1), 2)} → ${F(Math.PI * D2 * N2 / 60, 2)} m/s</b></div>
        <div><span>P/V lab → plant</span><b>${F(p1 / V(T1), 0)} → ${F(p2 / V(T2), N2 < 10 ? 2 : 0)} W/m³</b></div><div><span>Plant agitator power</span><b>${p2 > 100 ? F(p2 / 1000, 1) + ' kW' : F(p2, 1) + ' W'}</b></div>
        <div><span>Blend time lab → plant</span><b>${F(tB(N1), 0)} → ${F(tB(N2), 0)} s</b></div><div><span>Reynolds number, plant</span><b>${Math.round(rho * N2 / 60 * D2 * D2 / mu).toLocaleString('en-IN')}</b></div>`;
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (!b) return; ctl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(b.dataset.r); });
    draw('pv'); requestAnimationFrame(spin);
  };

  /* Basket centrifuge: top view, G-force across the cake, cake mass and the pressure that drives liquid out */
  M['centrifuge'] = function (fig) {
    const c = C(), Db = 1.2, H = 0.6, BD = 700, rhoL = 900, lip = 0.9;
    const svg = el('svg', { viewBox: '0 0 640 300', role: 'img', 'aria-label': 'Top view of a spinning basket centrifuge with the cake ring and liquid layer' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Speed <input type="range" min="400" max="1400" step="50" value="1000" aria-label="Basket speed in rpm"> <output></output></label>
      <label>Cake thickness <input type="range" min="20" max="150" step="5" value="120" aria-label="Cake thickness in millimetres"> <output></output></label>`);
    const [ir, it] = ctl.querySelectorAll('input'), [or_, ot] = ctl.querySelectorAll('output');
    const rd = readout(fig);
    const cx = 160, cy = 150, R = 130, sc = R / (Db / 2);
    const rot = el('g', {}, svg);
    el('circle', { cx, cy, r: R, fill: 'none', stroke: 'currentColor', 'stroke-width': 4 }, rot);
    for (let i = 0; i < 24; i++) { const a = i / 24 * 2 * Math.PI; el('circle', { cx: cx + Math.cos(a) * (R + 7), cy: cy + Math.sin(a) * (R + 7), r: 2.2, fill: c.mute }, rot); }
    const cake = el('circle', { cx, cy, fill: 'none', stroke: c.brass, opacity: .85 }, rot), liq = el('circle', { cx, cy, fill: 'none', stroke: c.blue, opacity: .5 }, rot);
    for (let i = 0; i < 6; i++) { const a = i / 6 * 2 * Math.PI; el('line', { x1: cx + Math.cos(a) * 20, y1: cy + Math.sin(a) * 20, x2: cx + Math.cos(a) * 34, y2: cy + Math.sin(a) * 34, stroke: c.mute, 'stroke-width': 3 }, rot); }
    el('circle', { cx, cy, r: lip / 2 * sc, fill: 'none', stroke: c.rust, 'stroke-dasharray': '4 4', 'stroke-width': 1.5 }, svg);
    txt(svg, cx, cy + 62, 'dashed: lip opening', { 'text-anchor': 'middle', fill: c.rust, 'font-size': 11 });
    // G profile
    const gx0 = 340, gy0 = 30, gw = 270, gh = 200;
    const gl = el('g', {}, svg);
    let ang = 0, last = performance.now(), rpm = 1000;
    function spin(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; ang += rpm / 60 * 360 * dt / 40; rot.setAttribute('transform', `rotate(${ang.toFixed(2)} ${cx} ${cy})`); if (!reduce) requestAnimationFrame(spin); }
    function draw() {
      rpm = +ir.value; const t = +it.value / 1000, w = rpm * 2 * Math.PI / 60, rw = Db / 2, ri = rw - t;
      or_.textContent = rpm + ' rpm'; ot.textContent = Math.round(t * 1000) + ' mm';
      cake.setAttribute('r', (rw - t / 2) * sc); cake.setAttribute('stroke-width', t * sc);
      const lt = 0.03; liq.setAttribute('r', (ri - lt / 2) * sc); liq.setAttribute('stroke-width', lt * sc);
      const Gw = w * w * rw / 9.81, Gi = w * w * ri / 9.81, V = H * Math.PI * (rw * rw - ri * ri), W = V * BD, dp = rhoL * w * w * (rw * rw - (ri - lt) * (ri - lt)) / 2 / 1e5, maxT = (Db - lip) / 2;
      gl.innerHTML = ''; const Gmax = 2000, X = r => gx0 + r / rw * gw, Y = g => gy0 + gh - g / Gmax * gh;
      el('line', { x1: gx0, y1: gy0 + gh, x2: gx0 + gw, y2: gy0 + gh, stroke: c.grid }, gl); el('line', { x1: gx0, y1: gy0, x2: gx0, y2: gy0 + gh, stroke: c.grid }, gl);
      [0, 500, 1000, 1500, 2000].forEach(g => { txt(gl, gx0 - 6, Y(g) + 4, g, { 'text-anchor': 'end', fill: c.mute, 'font-size': 10 }); });
      el('rect', { x: X(ri), y: gy0, width: X(rw) - X(ri), height: gh, fill: c.brass, opacity: .15 }, gl);
      el('line', { x1: X(0), y1: Y(0), x2: X(rw), y2: Y(Gw), stroke: c.ink, 'stroke-width': 2.5 }, gl);
      txt(gl, gx0 + gw / 2, gy0 + gh + 18, 'Radius from the axis (centre → wall)', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      txt(gl, X(ri) - 4, Y(Gi) - 8, F(Gi, 0) + ' G', { 'text-anchor': 'end', fill: c.ink, 'font-size': 11 }); txt(gl, X(rw) - 2, Y(Gw) - 8, F(Gw, 0) + ' G', { 'text-anchor': 'end', fill: c.brass, 'font-size': 11, 'font-weight': 700 });
      txt(gl, X(ri) + 4, gy0 + 14, 'cake', { fill: c.brass, 'font-size': 11 });
      rd.innerHTML = `<div class="hi"><span>G at basket wall</span><b>${F(Gw, 0)} G</b></div><div><span>G at cake surface</span><b>${F(Gi, 0)} G</b></div><div><span>Cake per load</span><b>${F(W, 0)} kg</b></div>
        <div><span>Pressure pushing liquid out</span><b>${F(dp, 1)} bar</b></div><div><span>Lip allows up to</span><b style="${t > maxT + 1e-9 ? 'color:#F08A6B' : ''}">${F(maxT * 1000, 0)} mm${t > maxT + 1e-9 ? ': spills' : ''}</b></div>`;
    }
    ir.addEventListener('input', draw); it.addEventListener('input', draw); draw(); requestAnimationFrame(spin);
  };

  /* bar helper: horizontal bars with labels */
  function bars(svg, rows, o) {
    const c = C(), max = o.max || Math.max(...rows.map(r => r[1])) * 1.1, x0 = o.x0 || 170, w = o.w || 380, bh = o.bh || 26, gap = o.gap || 14;
    svg.innerHTML = '';
    rows.forEach((r, i) => { const y = 10 + i * (bh + gap), bw = Math.max(2, r[1] / max * w);
      txt(svg, x0 - 10, y + bh / 2 + 4, r[0], { 'text-anchor': 'end', fill: c.mute });
      const b = el('rect', { x: x0, y, width: 2, height: bh, rx: 4, fill: r[2] || c.brass }, svg);
      tween([parseFloat(b.dataset.w || 2)], [bw], 450, v => b.setAttribute('width', v[0]));
      txt(svg, x0 + bw + 8, y + bh / 2 + 4, r[3], { fill: c.ink, 'font-weight': 700 }); });
  }

  /* Cost of a tonne of steam by fuel */
  M['steamcost'] = function (fig) {
    const c = C(), FU = [['Indian coal', 4000, 75, 8], ['Biomass briquette', 3800, 72, 7], ['Rice husk', 3200, 70, 5], ['Furnace oil', 10200, 85, 55], ['PNG (per Sm³)', 9500, 88, 50]];
    const svg = el('svg', { viewBox: '0 0 640 220', role: 'img', 'aria-label': 'Fuel cost per tonne of steam for different fuels' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Boiler efficiency vs typical <input type="range" min="-15" max="5" step="1" value="0" aria-label="Efficiency change in percentage points"> <output></output></label>
      <label>Feed water <input type="range" min="30" max="105" step="5" value="80" aria-label="Feed water temperature"> <output></output></label>`);
    const [ie, it] = ctl.querySelectorAll('input'), [oe, ot] = ctl.querySelectorAll('output');
    function draw() {
      const de = +ie.value, tf = +it.value, dh = 2780 - 4.186 * tf;
      oe.textContent = (de > 0 ? '+' : '') + de + ' points'; ot.textContent = tf + ' °C';
      bars(svg, FU.map(f => { const fuel = 1000 * dh / ((f[2] + de) / 100 * f[1] * 4.1868), cost = fuel * f[3]; return [f[0], cost, f[0] === 'Furnace oil' || f[0].startsWith('PNG') ? c.rust : c.brass, '₹ ' + F(cost, 0) + ' /t  (' + F(fuel, 0) + (f[0].startsWith('PNG') ? ' Sm³' : ' kg') + ')']; }), { max: 4500 });
    }
    ie.addEventListener('input', draw); it.addEventListener('input', draw); draw();
  };

  /* Cooling tower: make-up and blowdown against cycles of concentration */
  M['coc'] = function (fig) {
    const c = C(), E = 0.00085 * 1.8 * 1000 * 6, D = 0.0002 * 1000;
    const svg = el('svg', { viewBox: '0 0 640 150', role: 'img', 'aria-label': 'Evaporation, blowdown and make-up for the chosen cycles of concentration' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Cycles of concentration <input type="range" min="1.5" max="10" step="0.5" value="3" aria-label="Cycles of concentration"> <output></output></label>`);
    const i = ctl.querySelector('input'), o = ctl.querySelector('output'), rd = readout(fig);
    function draw() {
      const coc = +i.value, B = Math.max(0, E / (coc - 1) - D), M_ = E + B + D; o.textContent = coc.toFixed(1);
      bars(svg, [['Evaporation', E, c.blue, F(E, 1) + ' m³/h'], ['Blowdown', B, c.rust, F(B, 1) + ' m³/h'], ['Make-up', M_, c.brass, F(M_, 1) + ' m³/h']], { max: 30 });
      rd.innerHTML = `<div class="hi"><span>Make-up per day</span><b>${F(M_ * 24, 0)} m³</b></div><div><span>Blowdown to ETP per day</span><b>${F(B * 24, 0)} m³</b></div><div><span>Change vs 3 cycles</span><b>${(E * 1.5 - M_) >= 0 ? F((E * 1.5 - M_) * 24, 0) + ' m³/day saved' : F((M_ - E * 1.5) * 24, 0) + ' m³/day more'}</b></div>`;
    }
    i.addEventListener('input', draw); draw();
  };

  /* Electric chiller vs VAM: yearly running cost against steam price */
  M['chillervam'] = function (fig) {
    const c = C(), TR = 200, h = 6000;
    const svg = el('svg', { viewBox: '0 0 640 120', role: 'img', 'aria-label': 'Yearly running cost of an electric chiller and a VAM' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Steam cost <input type="range" min="0" max="4000" step="100" value="2500" aria-label="Steam cost in rupees per tonne"> <output></output></label>
      <label>Power cost <input type="range" min="4" max="12" step="0.5" value="8" aria-label="Power cost in rupees per kWh"> <output></output></label>`);
    const [is, ip] = ctl.querySelectorAll('input'), [os, op] = ctl.querySelectorAll('output'), rd = readout(fig);
    function draw() {
      const sc = +is.value, pc = +ip.value, e = TR * 0.85 * h * pc, v = TR * 4.6 / 1000 * h * sc + TR * 0.15 * h * pc, be = (0.85 - 0.15) * pc / 0.0046;
      os.textContent = '₹ ' + F(sc, 0) + ' /t'; op.textContent = '₹ ' + pc.toFixed(1) + ' /kWh';
      bars(svg, [['Electric chiller', e, c.blue, '₹ ' + F(e / 1e5, 1) + ' lakh/yr'], ['VAM on steam', v, c.brass, '₹ ' + F(v / 1e5, 1) + ' lakh/yr']], { max: 200e5 });
      rd.innerHTML = `<div class="hi"><span>Cheaper to run</span><b>${e < v ? 'Electric chiller' : 'VAM'}</b></div><div><span>Difference</span><b>₹ ${F(Math.abs(e - v) / 1e5, 1)} lakh/yr</b></div><div><span>Break-even steam cost</span><b>₹ ${F(be, 0)} /t</b></div>`;
    }
    is.addEventListener('input', draw); ip.addEventListener('input', draw); draw();
  };

  /* Nitrogen pressure purge: oxygen falling cycle by cycle */
  M['purge'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 240', role: 'img', 'aria-label': 'Oxygen concentration after each pressure purge cycle' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Nitrogen pressure <input type="range" min="0.5" max="5" step="0.5" value="2" aria-label="Purge pressure in barg"> <output></output></label><button type="button">Run the purge</button>`);
    const i = ctl.querySelector('input'), o = ctl.querySelector('output'), btn = ctl.querySelector('button'), rd = readout(fig);
    const x0 = 70, y0 = 14, w = 540, h = 180, Y = v => y0 + h - v / 21 * h;
    function frame(shown) {
      svg.innerHTML = ''; const pg = +i.value, r = 1.013 / (pg + 1.013), seq = [21]; for (let k = 1; k <= 5; k++) seq.push(21 * Math.pow(r, k));
      [21, 15, 10, 5, 0].forEach(v => { el('line', { x1: x0, y1: Y(v), x2: x0 + w, y2: Y(v), stroke: c.grid }, svg); txt(svg, x0 - 8, Y(v) + 4, v + ' %', { 'text-anchor': 'end', fill: c.mute, 'font-size': 11 }); });
      el('line', { x1: x0, y1: Y(10), x2: x0 + w, y2: Y(10), stroke: c.rust, 'stroke-dasharray': '6 5', 'stroke-width': 2 }, svg); txt(svg, x0 + w, Y(10) - 6, 'LOC ≈ 10 %', { 'text-anchor': 'end', fill: c.rust, 'font-size': 11, 'font-weight': 700 });
      el('line', { x1: x0, y1: Y(8), x2: x0 + w, y2: Y(8), stroke: c.green, 'stroke-dasharray': '3 4', 'stroke-width': 2 }, svg); txt(svg, x0 + w, Y(8) + 14, 'target 8 %', { 'text-anchor': 'end', fill: c.green, 'font-size': 11 });
      const bw = 60, step = w / 6;
      seq.forEach((v, k) => { const x = x0 + 20 + k * step; const vis = k <= shown;
        el('rect', { x, y: vis ? Y(v) : Y(0), width: bw, height: vis ? h - (Y(v) - y0) : 0, rx: 4, fill: k ? c.blue : c.mute }, svg);
        if (vis) txt(svg, x + bw / 2, Y(v) - 6, F(v, v < 10 ? 1 : 0) + ' %', { 'text-anchor': 'middle', fill: c.ink, 'font-weight': 700, 'font-size': 12 });
        txt(svg, x + bw / 2, y0 + h + 18, k ? 'Cycle ' + k : 'Air', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); });
      const n = seq.findIndex(v => v <= 8);
      rd.innerHTML = `<div><span>Each cycle multiplies O₂ by</span><b>${F(r, 3)}</b></div><div class="hi"><span>Cycles to reach 8 %</span><b>${n}</b></div><div><span>N₂ per cycle, 6 m³ vessel</span><b>${F(6 * (pg + 1.013 - 1.013) / 1.013, 1)} Nm³</b></div>`;
      o.textContent = pg.toFixed(1) + ' barg';
    }
    let timer = null; function run() { clearInterval(timer); let k = 0; frame(0); if (reduce) { frame(5); return; } timer = setInterval(() => { k++; frame(k); if (k >= 5) clearInterval(timer); }, 700); }
    i.addEventListener('input', () => frame(5)); btn.addEventListener('click', run); frame(5);
  };

  /* Affinity laws: flow, head and power against speed */
  M['affinity'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 160', role: 'img', 'aria-label': 'Flow, head and power as a percentage of full speed values' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Pump speed <input type="range" min="40" max="100" step="5" value="70" aria-label="Pump speed in percent"> <output></output></label>`);
    const i = ctl.querySelector('input'), o = ctl.querySelector('output'), rd = readout(fig);
    function draw() {
      const n = +i.value / 100; o.textContent = Math.round(n * 100) + ' %';
      bars(svg, [['Flow (∝ N)', n * 100, c.blue, F(n * 100, 0) + ' %'], ['Head (∝ N²)', n * n * 100, c.green, F(n * n * 100, 0) + ' %'], ['Power (∝ N³)', n * n * n * 100, c.brass, F(n * n * n * 100, 0) + ' %']], { max: 110 });
      const kw = 45, vfd = kw * n * n * n * 1.03, thr = kw * (0.6 + 0.4 * n);
      rd.innerHTML = `<div class="hi"><span>45 kW pump with VFD</span><b>${F(vfd, 1)} kW</b></div><div><span>Same flow by throttling</span><b>≈ ${F(thr, 1)} kW</b></div><div><span>Saving</span><b>${F(Math.max(0, thr - vfd), 1)} kW</b></div>`;
    }
    i.addEventListener('input', draw); draw();
  };

  window.PCME_ART = M;
  document.querySelectorAll('.art-fig[data-fig]').forEach(f => { const m = M[f.dataset.fig]; if (m) try { m(f); } catch (e) { console.error(e); } });
  // pause looping diagrams when off screen
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('paused', !e.isIntersecting)), { rootMargin: '100px' });
    document.querySelectorAll('.art-fig').forEach(f => io.observe(f));
  }
})();
