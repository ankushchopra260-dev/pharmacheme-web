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

  /* Static: spark energy against minimum ignition energy (log scale) */
  M['spark'] = function (fig) {
    const c = C(), OBJ = { person: ['Person, ordinary shoes', 200, 10], drum: ['200 L drum on plastic pallet', 100, 20], funnel: ['Metal funnel or scoop', 10, 15], tanker: ['Road tanker, not earthed', 1000, 10] },
      SOL = { methanol: ['Methanol', 0.14], toluene: ['Toluene', 0.24], ethylacetate: ['Ethyl acetate', 0.46], ipa: ['IPA', 0.65], acetone: ['Acetone', 1.15] };
    const svg = el('svg', { viewBox: '0 0 640 170', role: 'img', 'aria-label': 'Spark energy compared with the ignition energy of the solvent, log scale' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const sel = (id, o) => `<select data-k="${id}" style="font:600 .85rem var(--f-sans);color:var(--paper);background:var(--bg-deep);border:1px solid #2C4C6C;border-radius:6px;padding:5px 8px">${Object.entries(o).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select>`;
    const ctl = controls(fig, `<label>Charged object ${sel('o', OBJ)}</label><label>Solvent ${sel('s', SOL)}</label><label>Voltage <input type="range" min="0" max="30" step="1" value="10" aria-label="Voltage in kV"> <output></output></label><button type="button" aria-pressed="false">Earth it</button>`);
    const so = ctl.querySelector('[data-k=o]'), ss = ctl.querySelector('[data-k=s]'), iv = ctl.querySelector('input'), ov = ctl.querySelector('output'), be = ctl.querySelector('button'), rd = readout(fig);
    let earthed = false;
    const L = v => 60 + (Math.log10(Math.max(v, 0.01)) + 2) / 6 * 540;
    function draw() {
      const o = OBJ[so.value], m = SOL[ss.value][1], V = earthed ? 0 : +iv.value, E = 0.5 * o[1] * 1e-12 * Math.pow(V * 1e3, 2) * 1e3;
      ov.textContent = iv.value + ' kV'; svg.innerHTML = '';
      el('line', { x1: 60, y1: 120, x2: 600, y2: 120, stroke: c.mute }, svg);
      [0.01, 0.1, 1, 10, 100, 1000, 10000].forEach(v => txt(svg, L(v), 138, v >= 1000 ? v / 1000 + 'k' : v, { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }));
      txt(svg, 600, 158, 'mJ (log scale)', { 'text-anchor': 'end', fill: c.mute, 'font-size': 11 });
      el('rect', { x: L(m) - 2, y: 20, width: 4, height: 100, fill: c.rust }, svg); txt(svg, L(m) + 6, 30, SOL[ss.value][0] + ' ignites at ' + m + ' mJ', { fill: c.rust, 'font-size': 12, 'font-weight': 700 });
      el('rect', { x: L(1) - 1, y: 50, width: 2, height: 70, fill: c.mute }, svg); txt(svg, L(1) + 6, 60, 'you feel it: 1 mJ', { fill: c.mute, 'font-size': 11 });
      if (E > 0) { const b = el('rect', { x: 60, y: 76, width: 0, height: 34, rx: 4, fill: E >= m ? c.brass : c.blue }, svg); tween([0], [L(E) - 60], 500, v => b.setAttribute('width', Math.max(0, v[0]))); }
      const ign = E >= m;
      rd.innerHTML = `<div class="hi"><span>Spark energy ½CV²</span><b>${E < 1 ? F(E, 3) : F(E, 1)} mJ</b></div><div><span>Capacitance</span><b>${o[1]} pF</b></div><div><span>Verdict</span><b style="color:${ign ? '#F08A6B' : '#8FD1A5'}">${earthed ? 'Earthed: no charge builds up' : ign ? 'Ignites the vapour (' + F(E / m, 0) + '× MIE)' : 'Below the ignition energy'}</b></div>`;
    }
    so.addEventListener('change', () => { iv.value = OBJ[so.value][2]; draw(); }); ss.addEventListener('change', draw); iv.addEventListener('input', draw);
    be.addEventListener('click', () => { earthed = !earthed; be.setAttribute('aria-pressed', earthed); be.textContent = earthed ? 'Earthed (click to remove)' : 'Earth it'; draw(); }); draw();
  };

  /* HAZOP: guideword x parameter for a reactor dosing node */
  M['hazop'] = function (fig) {
    const P = ['Flow', 'Temperature', 'Pressure', 'Agitation', 'Level'], G = ['No / less', 'More', 'Reverse / other than'];
    const D = {
      'Flow|No / less': ['No or low reagent dosing flow', 'Dosing pump trips, strainer blocked, valve shut', 'Batch incomplete; if dosing restarts after a long stop with unreacted reagent present, sudden heat release', 'Flow indicator with low-flow alarm; dosing interlocked to agitator and temperature', 'Check SOP says what to do after a dosing stop (hold, sample, restart slowly)'],
      'Flow|More': ['Dosing faster than designed', 'Pump speed set wrong, control valve fails open, operator increases rate to save time', 'Reagent accumulates faster than it reacts; heat release exceeds cooling; MTSR rises', 'Flow controller with high-flow alarm (same loop as the valve, so not independent); independent high-temperature trip stops dosing', 'Fit a restriction orifice sized to the safe maximum rate'],
      'Flow|Reverse / other than': ['Wrong material dosed, or batch backflows into the dosing tank', 'Wrong drum connected, similar labels, check valve missing', 'Unknown reaction, gas evolution, contamination of the dosing tank', 'Dedicated hose couplings, material verification before charging, check valve on dosing line', 'Add a second-person check of drum label and lot before connecting'],
      'Temperature|No / less': ['Batch colder than set point', 'Brine valve stuck open, sensor reading high', 'Reaction slows, reagent accumulates; a later warm-up releases it all at once', 'Low-temperature alarm stops dosing; independent second temperature sensor', 'Interlock: no dosing below the minimum reaction temperature'],
      'Temperature|More': ['Batch hotter than set point', 'Cooling water failure, jacket valve fails shut, dosing too fast', 'Faster reaction, solvent boils, possible decomposition above TD24', 'High-temperature alarm and trip that stops dosing and opens full cooling; relief system sized for runaway', 'Confirm the trip is independent of the control loop'],
      'Temperature|Reverse / other than': ['Steam on the jacket instead of cooling water', 'Wrong jacket valve opened at changeover', 'Heating a batch that should be cooled: rapid temperature rise', 'Jacket utilities interlocked so steam and coolant cannot both be open; valve position indication', 'Label jacket valves clearly; add interlock'],
      'Pressure|More': ['Reactor pressure rises', 'Gas evolution, vent line blocked, scrubber flooded, nitrogen regulator fails', 'Overpressure, possible vessel or gasket failure, release of toxic gas', 'Pressure alarm, rupture disc/PSV to a safe location, vent line free of liquid traps', 'Check relief is sized for gas evolution as well as fire'],
      'Pressure|No / less': ['Vacuum in the reactor', 'Cooling a vapour space with the vent closed, condenser pulling vacuum', 'Vessel not rated for vacuum may collapse; air drawn in through seals into a flammable atmosphere', 'Vacuum relief or nitrogen make-up; vessel rated full vacuum', 'Confirm vacuum rating on the nameplate'],
      'Agitation|No / less': ['Agitator stops during dosing', 'Motor trip, coupling failure, power dip', 'Reagent layers out unreacted; when the agitator restarts it mixes and reacts all at once', 'Agitator running signal interlocked to dosing; operating procedure: do not restart without assessment', 'Add rotation sensor on the shaft, not just motor current'],
      'Level|More': ['Reactor overfilled', 'Wrong charge quantity, level instrument fault', 'Reduced vapour space; liquid carried into the condenser and vent; foam-over', 'High-level alarm independent of weighing; charge by weight', 'Check the maximum working volume is on the batch card'],
    };
    const ctl = controls(fig, `<span>Parameter</span>${P.map((p, i) => `<button type="button" data-p="${p}" aria-pressed="${i === 0}">${p}</button>`).join('')}`);
    const ctl2 = document.createElement('div'); ctl2.className = 'art-ctl'; ctl2.innerHTML = `<span>Guideword</span>${G.map((g, i) => `<button type="button" data-g="${g}" aria-pressed="${i === 1}">${g}</button>`).join('')}`; ctl.after(ctl2);
    const card = document.createElement('div'); card.className = 'art-read'; card.style.gridTemplateColumns = '1fr'; fig.insertBefore(card, fig.querySelector('figcaption'));
    let p = 'Flow', g = 'More';
    function draw() {
      const d = D[p + '|' + g];
      card.innerHTML = d ? [['Deviation', d[0]], ['Possible causes', d[1]], ['Consequences', d[2]], ['Existing safeguards', d[3]], ['Typical action', d[4]]].map((r, i) => `<div${i === 0 ? ' class="hi"' : ''}><span>${r[0]}</span><b style="font:${i === 0 ? '600 1.05rem' : '400 .95rem'} var(--f-sans);line-height:1.45">${r[1]}</b></div>`).join('')
        : `<div><span>${g} ${p.toLowerCase()}</span><b style="font:400 .95rem var(--f-sans)">Not a meaningful deviation for this node. A good HAZOP team says so and moves on, rather than inventing a scenario.</b></div>`;
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-p]'); if (!b) return; p = b.dataset.p; ctl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    ctl2.addEventListener('click', e => { const b = e.target.closest('button[data-g]'); if (!b) return; g = b.dataset.g; ctl2.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    draw();
  };

  /* Semi-batch: accumulation and MTSR against dosing time */
  M['accumulation'] = function (fig) {
    const c = C(), dTad = 144, MTT = 111, TD24 = 140, Ea = 80e3, R = 8.314;
    const svg = el('svg', { viewBox: '0 0 640 300', role: 'img', 'aria-label': 'MTSR and accumulation during dosing' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Dosing time <input type="range" min="0.25" max="6" step="0.25" value="4" aria-label="Dosing time in hours"> <output></output></label>
      <label>Reaction temperature <input type="range" min="30" max="80" step="5" value="60" aria-label="Reaction temperature"> <output></output></label>`);
    const [id, it] = ctl.querySelectorAll('input'), [od, ot] = ctl.querySelectorAll('output'), rd = readout(fig);
    function draw() {
      const td = +id.value * 3600, Tp = +it.value, k = 5e-4 * Math.exp(Ea / R * (1 / 333.15 - 1 / (Tp + 273.15)));
      od.textContent = (+id.value) + ' h'; ot.textContent = Tp + ' °C';
      const tEnd = Math.max(td * 1.6, 3 * 3600), dt = 10, pts = [], acc = []; let F_ = 0, X = 0, mx = 0, tmx = 0;
      for (let t = 0; t <= tEnd; t += dt) { if (t < td) F_ = Math.min(1, F_ + dt / td); const r = k * (F_ - X) * dt; X = Math.min(F_, X + r); const a = F_ - X, mtsr = Tp + a * dTad; if (mtsr > mx) { mx = mtsr; tmx = t; } pts.push([t / 3600, mtsr]); acc.push([t / 3600, a * 100]); }
      svg.innerHTML = '';
      const hx = tEnd / 3600, step = hx > 6 ? 2 : 1;
      const { X: Xs, Y } = axes(svg, { x0: 60, y0: 14, w: 540, h: 230, xmax: Math.ceil(hx), ymax: 220, xstep: step, ystep: 40, xlab: 'Time (h)', ylab: 'Temperature (°C)' });
      [[MTT, 'MTT 111 °C (toluene boils)', c.blue], [TD24, 'TD24 140 °C (decomposition)', c.rust]].forEach(([v, l, col]) => { el('line', { x1: 60, y1: Y(v), x2: 600, y2: Y(v), stroke: col, 'stroke-dasharray': '6 5', 'stroke-width': 1.5 }, svg); txt(svg, 596, Y(v) - 5, l, { 'text-anchor': 'end', fill: col, 'font-size': 11 }); });
      el('line', { x1: 60, y1: Y(Tp), x2: 600, y2: Y(Tp), stroke: c.mute, 'stroke-dasharray': '2 4' }, svg); txt(svg, 64, Y(Tp) + 14, 'process ' + Tp + ' °C', { fill: c.mute, 'font-size': 11 });
      el('rect', { x: 60, y: 14, width: Xs(td / 3600) - 60, height: 230, fill: c.brass, opacity: .06 }, svg); txt(svg, Xs(td / 3600) - 4, 28, 'dosing', { 'text-anchor': 'end', fill: c.brass, 'font-size': 11 });
      const pth = el('path', { d: path(pts.map(p => [Xs(p[0]), Y(Math.min(220, p[1]))])), fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg);
      if (!reduce) { const L = pth.getTotalLength(); pth.style.strokeDasharray = L; pth.style.strokeDashoffset = L; pth.getBoundingClientRect(); pth.style.transition = 'stroke-dashoffset .9s ease-out'; pth.style.strokeDashoffset = 0; }
      el('circle', { cx: Xs(tmx / 3600), cy: Y(Math.min(220, mx)), r: 6, fill: c.ink }, svg);
      const cls = mx < MTT ? '1 (MTSR below boiling point)' : mx < TD24 ? '3 (boils first; boiling is the barrier)' : '4 or 5 (decomposition can be reached)';
      rd.innerHTML = `<div class="hi"><span>Highest MTSR</span><b>${F(mx, 0)} °C</b></div><div><span>Peak accumulation</span><b>${F((mx - Tp) / dTad * 100, 0)} %</b></div><div><span>Criticality class</span><b style="font-size:.9rem">${cls}</b></div>`;
    }
    id.addEventListener('input', draw); it.addEventListener('input', draw); draw();
  };

  /* P&ID reader: click a symbol to learn it */
  M['pidread'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 680 330', role: 'img', 'aria-label': 'Simple P&ID of a jacketed reactor with dosing, condenser, instruments and relief; click a symbol to read about it' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const info = document.createElement('div'); info.className = 'art-read'; info.style.gridTemplateColumns = '1fr'; fig.insertBefore(info, fig.querySelector('figcaption'));
    const S = 'stroke="currentColor" stroke-width="2" fill="none"';
    svg.innerHTML = `
      <g ${S}><path d="M230 90 h140 v130 q0 40 -70 40 q-70 0 -70 -40 z"/><path d="M220 130 v90 q0 52 80 52 q80 0 80 -52 v-90" stroke-dasharray="6 5"/>
      <path d="M300 60 V90"/><rect x="290" y="40" width="20" height="20"/><path d="M300 90 V210"/><path d="M280 210 h40"/>
      <path d="M60 120 H150"/><path d="M150 112 l16 8 l-16 8 z M182 112 l-16 8 l16 8 z"/><path d="M182 120 H230"/>
      <path d="M340 90 V40 H470"/><rect x="470" y="22" width="110" height="36" rx="16"/><path d="M580 40 H620 V100"/><rect x="590" y="100" width="60" height="70" rx="6"/>
      <path d="M260 90 V60"/><path d="M252 60 h16 l-8 -14 z"/><path d="M260 46 V20 H200"/>
      <path d="M300 272 V292 H414"/><circle cx="430" cy="292" r="16"/><path d="M430 276 H520"/>
      <circle cx="166" cy="66" r="16"/><path d="M166 82 V98" stroke-dasharray="3 3"/><path d="M154 106 a12 9 0 0 1 24 0 z"/><path d="M166 106 V120"/>
      <circle cx="400" cy="190" r="16"/><path d="M384 190 H370"/>
      <circle cx="400" cy="250" r="16"/><path d="M384 250 H372"/><path d="M400 206 V234" stroke-dasharray="3 3"/></g>
      <path class="anim-flow slow" d="M60 120 H230" stroke="#7FB2E8" stroke-width="2.5" fill="none"/>
      <g font-family="sans-serif" font-size="10" fill="currentColor" text-anchor="middle"><text x="166" y="70">FIC</text><text x="166" y="80" font-size="8">101</text>
      <text x="400" y="194">TT</text><text x="400" y="204" font-size="8">101</text><text x="400" y="254">TIC</text><text x="400" y="264" font-size="8">101</text><text x="430" y="324">P-101</text>
      <text x="300" y="36">M</text><text x="300" y="180" font-size="12">R-101</text><text x="525" y="44">E-101</text><text x="620" y="190">V-101</text><text x="230" y="16">PSV-101</text><text x="90" y="112">Reagent</text></g>`;
    const H = [
      [166, 114, 22, 'Control valve FV-101', 'The bow-tie is a valve; the dome-shaped actuator on top makes it a control valve. It sits on the reagent dosing line and is moved by the flow controller above it. On a real P&ID look for FC or FO next to it: on loss of air, a dosing valve should fail closed.'],
      [166, 66, 18, 'FIC-101: flow indicating controller', 'A circle is an instrument. The letters follow ISA-5.1: the first letter is what is measured (F = flow), the next letters say what it does (I = indicate, C = control). A plain circle means it is in the field; a line through it means a control room panel or DCS.'],
      [400, 190, 18, 'TT-101: temperature transmitter', 'T = temperature, T = transmitter. It measures the batch temperature and sends the signal (dashed line) to the controller. Instruments in one control loop share the same number, here 101.'],
      [400, 250, 18, 'TIC-101: temperature controller', 'It compares the batch temperature with the set point and moves the jacket valve. On a reactor with exothermic dosing, the same signal usually also drives a high-temperature trip that stops dosing.'],
      [300, 175, 40, 'R-101: jacketed reactor', 'Equipment tags: a letter for the type (R reactor, E exchanger, P pump, V vessel, T tank) and a number. The dashed outline around the vessel is the jacket. M on top is the agitator motor.'],
      [525, 40, 40, 'E-101: overhead condenser', 'Vapour from the reactor goes to the condenser, condenses and drains to the receiver V-101. Follow the line to see where everything goes; lines on a P&ID are always drawn as connected flow paths.'],
      [260, 52, 16, 'PSV-101: pressure safety valve', 'The relief valve protects the reactor from overpressure. Its outlet must go somewhere safe: here a vent header. Check there is no isolation valve under it, or that any valve is locked open.'],
      [430, 292, 20, 'P-101: centrifugal pump', 'A circle with a tangential outlet on top is a centrifugal pump. It takes the batch out from the reactor bottom to the next step. A duty and standby pair would be tagged P-101A/B.'],
      [620, 135, 34, 'V-101: receiver', 'Condensed solvent collects here. A P&ID would also show its level instrument, vent and drain.'],
    ];
    H.forEach(h => { const r = el('circle', { cx: h[0], cy: h[1], r: h[2], fill: c.brass, opacity: 0, style: 'cursor:pointer' }, svg); r.setAttribute('tabindex', '0'); r.setAttribute('role', 'button'); r.setAttribute('aria-label', h[3]);
      const show = () => { svg.querySelectorAll('circle[role=button]').forEach(x => x.setAttribute('opacity', 0)); r.setAttribute('opacity', .22); info.innerHTML = `<div class="hi"><span>${h[3]}</span><b style="font:400 .95rem var(--f-sans);line-height:1.5">${h[4]}</b></div>`; };
      r.addEventListener('click', show); r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } }); });
    info.innerHTML = '<div><span>Click any symbol</span><b style="font:400 .95rem var(--f-sans)">Start with the circles: those are instruments.</b></div>';
  };

  /* LMTD: counter-current vs co-current temperature profiles */
  M['lmtd'] = function (fig) {
    const c = C(), Thi = 120, Tho = 60, Tci = 30;
    const svg = el('svg', { viewBox: '0 0 640 290', role: 'img', 'aria-label': 'Hot and cold temperature profiles along a heat exchanger' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<button type="button" data-m="cc" aria-pressed="true">Counter-current</button><button type="button" data-m="co" aria-pressed="false">Co-current</button>
      <label>Cold outlet <input type="range" min="40" max="110" step="1" value="40" aria-label="Cold outlet temperature"> <output></output></label>`);
    const i = ctl.querySelector('input'), o = ctl.querySelector('output'), rd = readout(fig); let m = 'cc';
    const lm = (a, b) => a <= 0 || b <= 0 ? NaN : Math.abs(a - b) < 1e-6 ? a : (a - b) / Math.log(a / b);
    function draw() {
      const Tco = +i.value; o.textContent = Tco + ' °C'; svg.innerHTML = '';
      const { X, Y } = axes(svg, { x0: 60, y0: 14, w: 540, h: 220, xmax: 100, ymax: 140, xstep: 25, ystep: 20, xlab: 'Position along the exchanger (%)', ylab: 'Temperature (°C)' });
      const d1 = m === 'cc' ? Thi - Tco : Thi - Tci, d2 = m === 'cc' ? Tho - Tci : Tho - Tco, L = lm(d1, d2), Lcc = lm(Thi - Tco, Tho - Tci);
      if (!(d1 > 0 && d2 > 0)) { txt(svg, 330, 120, m === 'co' ? 'Impossible co-current: the cold stream cannot leave hotter than the hot stream leaves.' : 'Temperature cross: not possible.', { 'text-anchor': 'middle', fill: c.rust, 'font-weight': 700 }); }
      else {
        const r = d2 / d1, q = x => Math.abs(1 - r) < 1e-6 ? x : (1 - Math.pow(r, x)) / (1 - r), Th = x => Thi - (Thi - Tho) * q(x), dT = x => d1 * Math.pow(r, x);
        const hp = [], cp = []; for (let k = 0; k <= 50; k++) { const x = k / 50; hp.push([X(x * 100), Y(Th(x))]); cp.push([X(x * 100), Y(Th(x) - dT(x))]); }
        el('path', { d: path(hp), fill: 'none', stroke: c.rust, 'stroke-width': 3 }, svg); el('path', { d: path(cp), fill: 'none', stroke: c.blue, 'stroke-width': 3 }, svg);
        txt(svg, X(2), Y(Thi) - 8, 'Hot ' + Thi + ' → ' + Tho + ' °C', { fill: c.rust, 'font-weight': 700, 'font-size': 12 });
        txt(svg, X(98), Y(m === 'cc' ? Tci : Tco) + 18, 'Cold ' + Tci + ' → ' + Tco + ' °C', { 'text-anchor': 'end', fill: c.blue, 'font-weight': 700, 'font-size': 12 });
        const ar = (m === 'cc' ? cp.slice().reverse() : cp); el('path', { class: 'anim-flow', d: path(m === 'cc' ? cp.slice().reverse() : cp), fill: 'none', stroke: c.ink, 'stroke-width': 1.5, opacity: .5 }, svg);
        el('path', { class: 'anim-flow', d: path(hp), fill: 'none', stroke: c.ink, 'stroke-width': 1.5, opacity: .5 }, svg);
      }
      rd.innerHTML = `<div class="hi"><span>LMTD</span><b>${isFinite(L) ? F(L, 1) + ' °C' : 'not possible'}</b></div><div><span>End temperature differences</span><b>${F(d1, 0)} and ${F(d2, 0)} °C</b></div><div><span>Area vs counter-current</span><b>${isFinite(L) && isFinite(Lcc) ? F(Lcc / L * 100, 0) + ' %' : '–'}</b></div>`;
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-m]'); if (!b) return; m = b.dataset.m; ctl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    i.addEventListener('input', draw); draw();
  };

  /* Batch cycle time: Gantt chart of three batches through the train */
  M['gantt'] = function (fig) {
    const c = C(), cols = [c.brass, c.blue, c.green, c.rust];
    const svg = el('svg', { viewBox: '0 0 680 230', role: 'img', 'aria-label': 'Gantt chart of consecutive batches through reactor, centrifuge, dryer and packing' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<button type="button" data-o="dryer" aria-pressed="false">Add a second dryer</button><button type="button" data-o="dist" aria-pressed="false">Faster distillation (4 h → 2.5 h)</button>`);
    const rd = readout(fig), opt = { dryer: false, dist: false };
    function draw() {
      const steps = [['Reactor', 1 + 6 + (opt.dist ? 2.5 : 4) + 1, 1], ['Centrifuge', 4.5, 1], ['Dryer', 14, opt.dryer ? 2 : 1], ['Packing', 2, 1]];
      const free = steps.map(s => Array(s[2]).fill(0)), sched = [];
      for (let b = 0; b < 4; b++) { let ready = 0; const row = [];
        steps.forEach((s, i) => { const u = free[i].indexOf(Math.min(...free[i])); const st = Math.max(ready, free[i][u]); const en = st + s[1]; free[i][u] = en; ready = en; row.push([i, st, en, u]); }); sched.push(row); }
      const cyc = Math.max(...steps.map(s => s[1] / s[2])), bott = steps.find(s => s[1] / s[2] === cyc)[0];
      svg.innerHTML = ''; const x0 = 100, W = 560, Hmax = 80, X = h => x0 + h / Hmax * W;
      for (let h = 0; h <= Hmax; h += 10) { el('line', { x1: X(h), y1: 8, x2: X(h), y2: 196, stroke: c.grid }, svg); txt(svg, X(h), 212, h + ' h', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); }
      steps.forEach((s, i) => txt(svg, x0 - 8, 30 + i * 46, s[0] + (s[2] > 1 ? ' ×2' : ''), { 'text-anchor': 'end', fill: s[0] === bott ? c.ink : c.mute, 'font-weight': s[0] === bott ? 700 : 400, 'font-size': 12 }));
      sched.forEach((row, b) => row.forEach(([i, st, en, u]) => { if (st > Hmax) return; const y = 14 + i * 46 + (steps[i][2] > 1 ? u * 15 : 0), hgt = steps[i][2] > 1 ? 14 : 26;
        const r = el('rect', { x: X(st), y, width: 0, height: hgt, rx: 3, fill: cols[b], opacity: .85 }, svg); tween([0], [Math.min(X(en), X(Hmax)) - X(st)], 400 + b * 150, v => r.setAttribute('width', Math.max(0, v[0])));
        if (hgt > 20 && X(en) - X(st) > 24) txt(svg, X(st) + 5, y + 17, 'B' + (b + 1), { fill: '#0B1622', 'font-size': 11, 'font-weight': 700 }); }));
      rd.innerHTML = `<div class="hi"><span>Cycle time (bottleneck)</span><b>${F(cyc, 1)} h: ${bott}</b></div><div><span>Batches per week</span><b>${F(168 / cyc, 1)}</b></div><div><span>Time for one batch, start to finish</span><b>${F(sched[0][3][2], 1)} h</b></div>`;
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-o]'); if (!b) return; opt[b.dataset.o] = !opt[b.dataset.o]; b.setAttribute('aria-pressed', opt[b.dataset.o]); draw(); });
    draw();
  };

  /* McCabe-Thiele: stages for a binary column at a chosen relative volatility and reflux ratio */
  M['mccabe'] = function (fig) {
    const c = C(), xD = 0.95, xB = 0.05, zF = 0.5;
    const svg = el('svg', { viewBox: '0 0 640 340', role: 'img', 'aria-label': 'McCabe-Thiele diagram with equilibrium curve, operating lines and stages' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Relative volatility &alpha; <input type="range" min="1.5" max="5" step="0.1" value="2.5" aria-label="Relative volatility"> <output></output></label>
      <label>Reflux, &times; minimum <input type="range" min="1.05" max="4" step="0.05" value="1.5" aria-label="Reflux ratio as a multiple of minimum reflux"> <output></output></label>`);
    const [ia, ir] = ctl.querySelectorAll('input'), [oa, or] = ctl.querySelectorAll('output'), rd = readout(fig);
    const x0 = 60, y0 = 12, s = 290, X = v => x0 + v * s, Y = v => y0 + s - v * s;
    function draw() {
      const a = +ia.value, m = +ir.value; oa.textContent = a.toFixed(1); or.textContent = m.toFixed(2) + '×';
      const eq = x => a * x / (1 + (a - 1) * x), inv = y => y / (a - (a - 1) * y);
      const ys = eq(zF), Rmin = (xD - ys) / (ys - zF), R = Rmin * m;
      const rect = x => R / (R + 1) * x + xD / (R + 1), yq = rect(zF), sl = (yq - xB) / (zF - xB), strip = x => xB + sl * (x - xB);
      svg.innerHTML = '';
      for (let v = 0; v <= 1.0001; v += 0.2) { el('line', { x1: X(v), y1: y0, x2: X(v), y2: y0 + s, stroke: c.grid }, svg); el('line', { x1: x0, y1: Y(v), x2: x0 + s, y2: Y(v), stroke: c.grid }, svg);
        txt(svg, X(v), y0 + s + 16, v.toFixed(1), { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); txt(svg, x0 - 8, Y(v) + 4, v.toFixed(1), { 'text-anchor': 'end', fill: c.mute, 'font-size': 11 }); }
      txt(svg, x0 + s / 2, y0 + s + 32, 'x, light component in liquid', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      const yl = txt(svg, 0, 0, 'y, in vapour', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); yl.setAttribute('transform', `translate(${x0 - 38},${y0 + s / 2}) rotate(-90)`);
      el('line', { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), stroke: c.mute, 'stroke-dasharray': '4 4' }, svg);
      el('path', { d: path(Array.from({ length: 101 }, (_, k) => [X(k / 100), Y(eq(k / 100))])), fill: 'none', stroke: c.blue, 'stroke-width': 2.5 }, svg);
      el('path', { d: path([[X(xD), Y(xD)], [X(zF), Y(yq)], [X(xB), Y(xB)]]), fill: 'none', stroke: c.rust, 'stroke-width': 2 }, svg);
      el('line', { x1: X(zF), y1: Y(zF), x2: X(zF), y2: Y(yq), stroke: c.mute, 'stroke-width': 1.5 }, svg);
      let x = xD, y = xD, n = 0; const st = [[X(x), Y(y)]];
      while (x > xB && n < 60) { const xn = inv(y); st.push([X(xn), Y(y)]); n++; if (xn <= xB) { x = xn; break; } const yn = xn > zF ? rect(xn) : strip(xn); st.push([X(xn), Y(yn)]); x = xn; y = yn; }
      el('path', { d: path(st), fill: 'none', stroke: c.brass, 'stroke-width': 2 }, svg);
      const lx = x0 + s + 30; [[c.blue, 'Equilibrium curve'], [c.rust, 'Operating lines'], [c.brass, 'Stages']].forEach((l, k) => { el('rect', { x: lx, y: 30 + k * 22, width: 14, height: 4, fill: l[0] }, svg); txt(svg, lx + 22, 36 + k * 22, l[1], { fill: c.ink, 'font-size': 12 }); });
      txt(svg, lx, 120, 'Feed 50 %, saturated liquid', { fill: c.mute, 'font-size': 11 }); txt(svg, lx, 138, 'Top 95 %, bottom 5 %', { fill: c.mute, 'font-size': 11 });
      const Nmin = Math.log((xD / (1 - xD)) * ((1 - xB) / xB)) / Math.log(a);
      rd.innerHTML = `<div class="hi"><span>Theoretical stages</span><b>${n >= 60 ? '60+' : n}</b></div><div><span>Minimum stages (total reflux)</span><b>${F(Nmin, 1)}</b></div><div><span>Reflux ratio R (R<sub>min</sub> ${F(Rmin, 2)})</span><b>${F(R, 2)}</b></div>`;
    }
    ia.addEventListener('input', draw); ir.addEventListener('input', draw); draw();
  };

  /* Relief valve sizing for gas or vapour (API 520 Part I, critical flow) */
  M['relief'] = function (fig) {
    const c = C(), FL = { tol: ['Toluene vapour', 92.1, 1.09], meoh: ['Methanol vapour', 32.0, 1.20], n2: ['Nitrogen', 28.0, 1.40] };
    const LET = [['D', .110], ['E', .196], ['F', .307], ['G', .503], ['H', .785], ['J', 1.287], ['K', 1.838], ['L', 2.853], ['M', 3.60], ['N', 4.34], ['P', 6.38], ['Q', 11.05], ['R', 16.0], ['T', 26.0]];
    const svg = el('svg', { viewBox: '0 0 640 130', role: 'img', 'aria-label': 'Standard API relief valve orifice sizes with the selected orifice highlighted' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<button type="button" data-c="1.10" aria-pressed="false">Process upset (10 % over)</button><button type="button" data-c="1.21" aria-pressed="true">Fire case (21 % over)</button><label>Fluid <select aria-label="Fluid">${Object.keys(FL).map(k => `<option value="${k}">${FL[k][0]}</option>`).join('')}</select></label>
      <label>Relieving load <input type="range" min="500" max="20000" step="50" value="3850" aria-label="Relieving load in kg per hour"> <output></output></label>
      <label>Set pressure <input type="range" min="0.5" max="10" step="0.5" value="3" aria-label="Set pressure in barg"> <output></output></label>
      <label>Relieving temperature <input type="range" min="20" max="250" step="5" value="175" aria-label="Relieving temperature"> <output></output></label>`);
    const sel = ctl.querySelector('select'), [iw, ip, it] = ctl.querySelectorAll('input'), [ow, op, ot] = ctl.querySelectorAll('output'), rd = readout(fig);
    function draw() {
      const f = FL[sel.value], W = +iw.value, Ps = +ip.value, T = +it.value + 273.15, M_ = f[1], k = f[2];
      ow.textContent = F(W, 0) + ' kg/h'; op.textContent = Ps.toFixed(1) + ' barg'; ot.textContent = it.value + ' °C';
      const P1 = (Ps * op_ + 1.01325) * 100, C_ = 0.03948 * Math.sqrt(k * Math.pow(2 / (k + 1), (k + 1) / (k - 1))), Kd = 0.975;
      const A = W / (C_ * Kd * P1) * Math.sqrt(T * 1.0 / M_), Ain = A / 645.16, pick = LET.find(l => l[1] >= Ain);
      svg.innerHTML = ''; const step = 600 / LET.length;
      LET.forEach((l, i) => { const cx = 30 + i * step + step / 2 - 10, r = 3 + 17 * Math.sqrt(l[1] / 26), on = pick && l[0] === pick[0];
        el('circle', { cx, cy: 52, r, fill: on ? c.brass : 'none', stroke: on ? c.brass : c.mute, 'stroke-width': on ? 2 : 1.5 }, svg);
        txt(svg, cx, 98, l[0], { 'text-anchor': 'middle', fill: on ? c.brass : c.ink, 'font-weight': 700, 'font-size': 13 });
        txt(svg, cx, 114, l[1] < 1 ? l[1].toFixed(2) : l[1].toFixed(1), { 'text-anchor': 'middle', fill: c.mute, 'font-size': 10 }); });
      txt(svg, 20, 127, 'API 526 orifice letter, effective area in in²', { fill: c.mute, 'font-size': 10 });
      rd.innerHTML = `<div><span>Relieving pressure (${Math.round((op_ - 1) * 100)} % over)</span><b>${F(P1 / 100, 2)} bar abs</b></div><div><span>Required area</span><b>${F(A, 0)} mm² (${F(Ain, 3)} in²)</b></div><div class="hi"><span>Next standard orifice</span><b>${pick ? pick[0] + ' (' + pick[1] + ' in²)' : 'larger than T: use two valves'}</b></div>`;
    }
    let op_ = 1.21; ctl.addEventListener('click', e => { const b = e.target.closest('button[data-c]'); if (!b) return; op_ = +b.dataset.c; ctl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    ctl.addEventListener('input', draw); draw();
  };

  /* MOC: is it a change or a replacement in kind? */
  M['moc'] = function (fig) {
    const Q = [
      ['A PTFE gasket fails and is replaced with the same specification PTFE gasket.', 0, 'Same specification, same function: a replacement in kind. Record it in the maintenance history.'],
      ['Dosing time is cut from 4 h to 2 h to finish the batch within one shift.', 1, 'A change to an operating limit. It changes accumulation and heat release, so it needs a reaction safety review.'],
      ['A carbon steel valve is swapped for a stainless steel one "because SS is better".', 1, 'Not in kind. The piping class, gasket, weight and even corrosion behaviour can change. It needs a review.'],
      ['The high-temperature trip set point is raised by 5 °C because it keeps tripping.', 1, 'A change to a safeguard. Nuisance trips are a reason to investigate, not to move the set point quietly.'],
      ['A failed pump is replaced with an identical make and model.', 0, 'Replacement in kind, provided the impeller size, seal type and materials really are the same.'],
      ['A rubber hose is laid to bypass a choked line "just until the shutdown".', 1, 'A temporary change. Temporary changes need the same review, plus an expiry date and someone who removes it.'],
      ['The same grade of raw material is bought from a new supplier.', 1, 'A change. A new route can bring different impurities, moisture or particle size; in pharma it also goes through change control.'],
      ['An interlock is bypassed so instrument technicians can work on the sensor.', 1, 'A change with real risk. It needs approval, compensating measures while bypassed, and a check that it is restored.'],
    ];
    const box = document.createElement('div'); box.className = 'moc-q'; fig.insertBefore(box, fig.querySelector('figcaption'));
    const rd = readout(fig); let done = 0, right = 0;
    Q.forEach((q, i) => {
      const d = document.createElement('div'); d.className = 'moc-item';
      d.innerHTML = `<p>${q[0]}</p><div class="art-ctl"><button type="button" data-a="1">Change: needs MOC</button><button type="button" data-a="0">Replacement in kind</button></div><p class="moc-ans" hidden></p>`;
      d.addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (!b || d.dataset.done) return; d.dataset.done = 1; done++;
        const ok = +b.dataset.a === q[1]; if (ok) right++; b.setAttribute('aria-pressed', 'true');
        const a = d.querySelector('.moc-ans'); a.hidden = false; a.innerHTML = `<b class="${ok ? 'ok' : 'no'}">${ok ? 'Right.' : 'Not quite.'}</b> ${q[2]}`;
        d.querySelectorAll('button').forEach(x => x.disabled = true); score(); });
      box.appendChild(d); });
    function score() { rd.innerHTML = `<div class="hi"><span>Score</span><b>${right} / ${done}</b></div><div><span>Answered</span><b>${done} of ${Q.length}</b></div>`; }
    score();
  };

  /* Flammability diagram: fuel vs oxygen, with LOC */
  M['loc'] = function (fig) {
    const c = C(), LFL = 1.2, UFL = 7, LOC = 10;
    const svg = el('svg', { viewBox: '0 0 640 300', role: 'img', 'aria-label': 'Flammability diagram of oxygen against solvent vapour concentration, showing the flammable region and the limiting oxygen concentration' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Solvent vapour <input type="range" min="0" max="12" step="0.1" value="3" aria-label="Solvent vapour percent by volume"> <output></output></label>
      <label>Oxygen <input type="range" min="2" max="21" step="0.5" value="21" aria-label="Oxygen percent by volume"> <output></output></label>`);
    const [ifu, io] = ctl.querySelectorAll('input'), [ofu, oo] = ctl.querySelectorAll('output'), rd = readout(fig);
    const air = f => 20.95 * (1 - f / 100);
    const poly = [[LFL, air(LFL)], [2, air(2)], [3, air(3)], [4, air(4)], [5, air(5)], [6, air(6)], [UFL, air(UFL)], [6.2, 17.6], [5, 15.4], [3.8, 13.3], [2.6, 11.4], [1.75, LOC], [1.45, 10.4], [1.3, 12.5], [1.22, 16], [LFL, air(LFL)]];
    const inside = (x, y) => { let r = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) r = !r; } return r; };
    function draw() {
      const f = +ifu.value; let o = Math.min(+io.value, air(f)); ofu.textContent = f.toFixed(1) + ' %'; oo.textContent = o.toFixed(1) + ' %';
      svg.innerHTML = ''; const { X, Y } = axes(svg, { x0: 60, y0: 12, w: 540, h: 230, xmax: 12, ymax: 24, xstep: 2, ystep: 4, xlab: 'Solvent vapour (% by volume)', ylab: 'Oxygen (% by volume)' });
      el('path', { d: path(poly.map(p => [X(p[0]), Y(p[1])])) + 'Z', fill: c.rust, opacity: .28, stroke: c.rust, 'stroke-width': 2 }, svg);
      el('line', { x1: X(0), y1: Y(air(0)), x2: X(12), y2: Y(air(12)), stroke: c.blue, 'stroke-width': 2 }, svg); txt(svg, X(11.9), Y(air(12)) - 6, 'mixtures with air', { 'text-anchor': 'end', fill: c.blue, 'font-size': 11 });
      el('line', { x1: X(0), y1: Y(LOC), x2: X(12), y2: Y(LOC), stroke: c.green, 'stroke-dasharray': '6 5', 'stroke-width': 2 }, svg); txt(svg, X(11.9), Y(LOC) + 15, 'LOC ≈ 10 %', { 'text-anchor': 'end', fill: c.green, 'font-size': 11, 'font-weight': 700 });
      el('line', { x1: X(0), y1: Y(8), x2: X(12), y2: Y(8), stroke: c.green, 'stroke-dasharray': '2 4', 'stroke-width': 1.5 }, svg); txt(svg, X(11.9), Y(8) + 14, 'target 8 %', { 'text-anchor': 'end', fill: c.green, 'font-size': 11 });
      txt(svg, X(3.6), Y(16.5), 'flammable', { 'text-anchor': 'middle', fill: c.rust, 'font-weight': 700 });
      txt(svg, X(LFL), Y(23), 'LFL', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); txt(svg, X(UFL), Y(23), 'UFL', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      el('circle', { cx: X(f), cy: Y(o), r: 8, fill: c.ink, stroke: '#0B1622', 'stroke-width': 2 }, svg);
      let v, cls = '';
      if (inside(f, o) || (o >= air(f) - 0.05 && f >= LFL && f <= UFL)) { v = 'Flammable: one spark ignites it'; cls = 'no'; }
      else if (o < LOC) v = o <= 8 ? 'Inert: cannot burn at any solvent level' : 'Below LOC, but inside the safety margin';
      else if (f > UFL) v = 'Too rich now, but flammable as air leaks in';
      else v = 'Too lean to burn at this solvent level';
      rd.innerHTML = `<div class="hi"><span>Headspace</span><b class="${cls}">${v}</b></div><div><span>Oxygen with air only at this vapour level</span><b>${F(air(f), 1)} %</b></div>`;
    }
    ifu.addEventListener('input', draw); io.addEventListener('input', draw); draw();
  };

  /* Vacuum pump-down with an air leak */
  M['vacleak'] = function (fig) {
    const c = C(), V = 6;
    const svg = el('svg', { viewBox: '0 0 640 300', role: 'img', 'aria-label': 'Pressure against time while evacuating a reactor, on a log scale' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<button type="button" data-p="lr" aria-pressed="true">Liquid ring pump</button><button type="button" data-p="ds" aria-pressed="false">Dry screw pump</button>
      <label>Pump speed <input type="range" min="50" max="500" step="25" value="250" aria-label="Pump speed in cubic metres per hour"> <output></output></label>
      <label>Air leak <input type="range" min="0" max="5" step="0.25" value="1" aria-label="Air leak in kilograms per hour"> <output></output></label>`);
    const [is, il] = ctl.querySelectorAll('input'), [os, ol] = ctl.querySelectorAll('output'), rd = readout(fig); let pump = 'lr';
    const x0 = 70, y0 = 12, w = 530, h = 230, tmax = 30, X = t => x0 + t / tmax * w, lo = -1, hi = 3, Y = p => y0 + h - (Math.log10(p) - lo) / (hi - lo) * h;
    function draw() {
      const S = +is.value, L = +il.value, floor = pump === 'lr' ? 45 : 0.05; os.textContent = S + ' m³/h'; ol.textContent = L.toFixed(2) + ' kg/h';
      const leak = L / 1.19 * 1013; // mbar·m³/h of air
      svg.innerHTML = '';
      [0.1, 1, 10, 100, 1000].forEach(p => { el('line', { x1: x0, y1: Y(p), x2: x0 + w, y2: Y(p), stroke: c.grid }, svg); txt(svg, x0 - 8, Y(p) + 4, p >= 1 ? F(p, 0) : '0.1', { 'text-anchor': 'end', fill: c.mute, 'font-size': 11 }); });
      for (let t = 0; t <= tmax; t += 5) { el('line', { x1: X(t), y1: y0, x2: X(t), y2: y0 + h, stroke: c.grid }, svg); txt(svg, X(t), y0 + h + 16, t, { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); }
      txt(svg, x0 + w / 2, y0 + h + 34, 'Time (minutes), 6 m³ reactor', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      const yl = txt(svg, 0, 0, 'Pressure (mbar abs)', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); yl.setAttribute('transform', `translate(${x0 - 46},${y0 + h / 2}) rotate(-90)`);
      let P = 1013, t50 = null; const pts = [], dt = 1 / 600;
      for (let t = 0; t <= tmax + 1e-9; t += dt) { if (Math.round(t * 600) % 6 === 0) pts.push([X(t), Y(Math.max(P, 0.1))]); if (t50 === null && P <= 50) t50 = t;
        const Se = S * Math.max(0, 1 - floor / P); P = Math.max(0.05, P + (-Se * P + leak) / V * dt / 60); }
      el('path', { d: path(pts), fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg);
      el('line', { x1: x0, y1: Y(50), x2: x0 + w, y2: Y(50), stroke: c.blue, 'stroke-dasharray': '6 5' }, svg); txt(svg, x0 + w, Y(50) - 6, 'target 50 mbar', { 'text-anchor': 'end', fill: c.blue, 'font-size': 11 });
      const ideal = V / S * Math.log(1013 / 50) * 60;
      rd.innerHTML = `<div class="hi"><span>Time to 50 mbar</span><b>${t50 === null ? 'never' : F(t50, 1) + ' min'}</b></div><div><span>Lowest pressure reached</span><b>${F(P, P < 10 ? 1 : 0)} mbar</b></div><div><span>Ideal, no leak, full speed</span><b>${F(ideal, 1)} min</b></div><div><span>Leak volume at 50 mbar</span><b>${F(L / (1.19 * 50 / 1013), 0)} m³/h</b></div>`;
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-p]'); if (!b) return; pump = b.dataset.p; ctl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    ctl.addEventListener('input', draw); draw();
  };

  /* Lab to plant: what changes with scale (geometric similarity) */
  M['scalegap'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 230', role: 'img', 'aria-label': 'How cooling area per litre, heat-up time, mixing time and tip speed change from a 1 litre flask to plant scale' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Plant batch volume <input type="range" min="1" max="4" step="0.05" value="3.78" aria-label="Plant volume, logarithmic"> <output></output></label>`);
    const i = ctl.querySelector('input'), o = ctl.querySelector('output'), rd = readout(fig);
    const rows = [['Cooling area per litre', -1 / 3, c.blue, 'less'], ['Heat-up / cool-down time', 1 / 3, c.rust, 'longer'], ['Blend time at same P/V', 2 / 9, c.brass, 'longer'], ['Tip speed at same P/V', 1 / 9, c.green, 'faster']];
    const x0 = 200, w = 400, X = r => x0 + (Math.log10(r) + 2) / 4 * w;
    function draw() {
      const V = Math.pow(10, +i.value), ratio = V / 1; o.textContent = V >= 1000 ? F(V / 1000, 1) + ' kL' : F(V, 0) + ' L';
      svg.innerHTML = '';
      [0.01, 0.1, 1, 10, 100].forEach(r => { el('line', { x1: X(r), y1: 6, x2: X(r), y2: 190, stroke: r === 1 ? c.mute : c.grid, 'stroke-width': r === 1 ? 2 : 1 }, svg); txt(svg, X(r), 208, (r < 1 ? r : F(r, 0)) + '×', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); });
      txt(svg, X(1), 224, 'same as 1 L flask', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 10 });
      let html = '';
      rows.forEach((r, k) => { const v = Math.pow(ratio, r[1]), y = 18 + k * 44, a = X(1), b = X(v);
        txt(svg, x0 - 10, y + 16, r[0], { 'text-anchor': 'end', fill: c.ink, 'font-size': 12 });
        el('rect', { x: Math.min(a, b), y, width: Math.max(2, Math.abs(b - a)), height: 22, rx: 4, fill: r[2] }, svg);
        txt(svg, b + (v >= 1 ? 6 : -6), y + 16, (v >= 1 ? F(v, 1) : F(v, 3)) + '×', { 'text-anchor': v >= 1 ? 'start' : 'end', fill: c.ink, 'font-weight': 700, 'font-size': 12 });
        html += `<div${k === 0 ? ' class="hi"' : ''}><span>${r[0]}</span><b>${v >= 1 ? F(v, 1) : F(1 / v, 0)}× ${r[3]}</b></div>`; });
      rd.innerHTML = html;
    }
    i.addEventListener('input', draw); draw();
  };

  /* Batch mass balance: inputs vs outputs, closure and unaccounted loss */
  M['mbal'] = function (fig) {
    const c = C(), IN = [['SM', 500, c.brass], ['Reagent', 300, c.green], ['Lye', 400, c.mute], ['Toluene', 2000, c.rust], ['Water', 600, c.blue]];
    const svg = el('svg', { viewBox: '0 0 640 250', role: 'img', 'aria-label': 'Stacked bars of batch inputs and outputs with the unaccounted difference' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Toluene recovered <input type="range" min="1500" max="2000" step="10" value="1850" aria-label="Toluene recovered in kg"> <output></output></label>
      <label>Dry product <input type="range" min="400" max="600" step="5" value="520" aria-label="Dry product in kg"> <output></output></label>`);
    const [it, ip] = ctl.querySelectorAll('input'), [ot, op] = ctl.querySelectorAll('output'), rd = readout(fig);
    const cols = [c.brass, c.blue, c.green, c.rust, c.mute];
    function draw() {
      const tol = +it.value, pr = +ip.value; ot.textContent = F(tol, 0) + ' kg'; op.textContent = F(pr, 0) + ' kg';
      const OUT = [['Product', pr, c.brass], ['Recovered toluene', tol, c.rust], ['Aqueous layer', 1160, c.blue], ['Residue', 140, c.mute]];
      const tin = IN.reduce((a, b) => a + b[1], 0), tout = OUT.reduce((a, b) => a + b[1], 0), lost = tin - tout, sc = 560 / 4000;
      svg.innerHTML = '';
      const bar = (y, items, label) => { txt(svg, 10, y + 26, label, { fill: c.ink, 'font-weight': 700 }); let x = 55; items.forEach((it2, k) => { const w = it2[1] * sc; el('rect', { x, y, width: Math.max(0, w - 2), height: 40, rx: 3, fill: it2[2] || cols[k % 5] }, svg); if (w > 40) txt(svg, x + 4, y + 16, it2[0], { fill: '#0B1622', 'font-size': 9, 'font-weight': 700 }), txt(svg, x + 5, y + 32, F(it2[1], 0), { fill: '#0B1622', 'font-size': 11 }); x += w; }); return x; };
      bar(20, IN, 'In');
      const xe = bar(100, OUT, 'Out');
      if (lost > 0) { el('rect', { x: xe, y: 100, width: lost * sc, height: 40, rx: 3, fill: 'none', stroke: c.rust, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, svg); txt(svg, Math.min(630, xe + lost * sc), 160, 'unaccounted ' + F(lost, 0) + ' kg', { 'text-anchor': 'end', fill: c.rust, 'font-weight': 700, 'font-size': 12 }); }
      [0, 1000, 2000, 3000, 4000].forEach(v => { el('line', { x1: 55 + v * sc, y1: 180, x2: 55 + v * sc, y2: 186, stroke: c.mute }, svg); txt(svg, 55 + v * sc, 200, F(v, 0), { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); });
      txt(svg, 350, 222, 'kg per batch', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      const cl = tout / tin * 100;
      rd.innerHTML = `<div class="hi"><span>Closure</span><b class="${cl < 97 ? 'no' : ''}">${F(cl, 1)} %</b></div><div><span>Unaccounted</span><b>${F(lost, 0)} kg</b></div><div><span>Toluene loss</span><b>${F(2000 - tol, 0)} kg (${F((2000 - tol) / pr, 2)} kg/kg)</b></div><div><span>Product yield (theory 600 kg)</span><b>${F(pr / 600 * 100, 1)} %</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  /* Pump troubleshooting: pick a symptom, see where to look */
  M['pumptrouble'] = function (fig) {
    const c = C();
    const S = {
      flow: ['No flow or low flow', ['suction', 'impeller'], ['Pump not primed or air in the suction line', 'Suction valve partly closed, strainer choked', 'Wrong rotation (common after motor rewinding)', 'Impeller worn or clogged; wear ring clearance too large', 'System head higher than the pump can make (closed or choked discharge)'], 'Check rotation first, then suction pressure. Compare discharge pressure at shut-off with the curve: a big shortfall means wear.'],
      cav: ['Crackling noise, falling head', ['suction'], ['NPSH available below NPSH required: hot liquid, vacuum vessel, low level', 'Choked strainer or long, small suction line', 'Running far to the right of the curve (flow too high)', 'Air or vapour drawn in through a vortex at low tank level'], 'Measure suction pressure and liquid temperature; calculate NPSH available. See the pump power article for the NPSH calculation.'],
      seal: ['Mechanical seal leaking', ['seal'], ['Running dry: seal faces overheat and crack within minutes', 'Flush or barrier fluid lost (plan 53 pot empty, flush line choked)', 'Shaft misalignment or vibration opening the faces', 'Solids or crystallising product on the faces', 'Wrong seal material for the solvent (elastomer swelling)'], 'Look at the failed faces and O-rings: heat cracks mean dry running, swollen elastomers mean wrong material, scoring means solids.'],
      amps: ['Motor overloads or trips', ['impeller', 'motor'], ['Running at too high a flow (discharge valve wide open, low system head)', 'Liquid heavier or more viscous than design', 'Impeller trimmed larger than the motor allows', 'Mechanical rubbing: bearing failure, impeller touching the casing', 'Electrical: low voltage, single phasing'], 'Measure current and discharge pressure. Find the operating point on the curve: power rises with flow for centrifugal pumps.'],
      vib: ['High vibration', ['coupling', 'bearing'], ['Misalignment between pump and motor', 'Running near shut-off or far from best efficiency point', 'Cavitation', 'Unbalanced or damaged impeller', 'Loose foundation bolts, pipe strain from badly supported pipework'], 'Check alignment with a dial gauge or laser after any maintenance, and check the pipes are not forcing the pump casing.'],
      hot: ['Bearing running hot', ['bearing'], ['Too much or too little grease', 'Wrong oil level or oil contaminated with water', 'Misalignment or pipe strain loading the bearings', 'Running at low flow, giving high radial loads'], 'Over-greasing is as common as under-greasing. Follow the interval and quantity on the lubrication chart.'],
    };
    const svg = el('svg', { viewBox: '0 0 640 170', role: 'img', 'aria-label': 'Centrifugal pump with the area to check highlighted' });
    const ctl = controls(fig, Object.keys(S).map((k, i) => `<button type="button" data-s="${k}" aria-pressed="${i === 0}">${S[k][0]}</button>`).join(''));
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const info = document.createElement('div'); info.className = 'art-read'; info.style.gridTemplateColumns = '1fr'; fig.insertBefore(info, fig.querySelector('figcaption'));
    const Z = { suction: [20, 70, 120, 40], impeller: [150, 30, 110, 110], seal: [262, 60, 40, 50], bearing: [308, 55, 90, 60], coupling: [400, 65, 40, 40], motor: [442, 35, 170, 100] };
    function draw(k) {
      svg.innerHTML = `<g stroke="currentColor" stroke-width="2" fill="none"><path d="M20 80 H150 M20 110 H150"/><circle cx="205" cy="85" r="52"/><path d="M205 33 V10 H260"/><path d="M190 85 l15 -30 l15 30 l-15 30 z"/>
        <rect x="262" y="70" width="40" height="30"/><rect x="305" y="60" width="90" height="50" rx="4"/><path d="M257 85 H442" stroke-width="4"/><rect x="400" y="70" width="40" height="30" rx="4"/><rect x="442" y="40" width="170" height="90" rx="8"/></g>
        <g font-family="sans-serif" font-size="11" fill="currentColor" text-anchor="middle"><text x="70" y="100">suction</text><text x="205" y="160">casing &amp; impeller</text><text x="282" y="125">seal</text><text x="350" y="125">bearings</text><text x="420" y="125">coupling</text><text x="527" y="90">motor</text></g>`;
      S[k][1].forEach(z => { const r = Z[z]; const h = el('rect', { x: r[0] - 4, y: r[1] - 4, width: r[2] + 8, height: r[3] + 8, rx: 10, fill: 'none', stroke: c.brass, 'stroke-width': 3, class: 'anim-pulse' }); svg.insertBefore(h, svg.firstChild); });
      info.innerHTML = `<div class="hi"><span>Likely causes, most common first</span><b style="font:400 .95rem var(--f-sans);line-height:1.6">${S[k][2].map(x => '&bull; ' + x).join('<br>')}</b></div><div><span>First check</span><b style="font:400 .95rem var(--f-sans);line-height:1.5">${S[k][3]}</b></div>`;
      ctl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.s === k));
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (b) draw(b.dataset.s); }); draw('flow');
  };

  /* Cooling crystallisation in the metastable zone */
  M['mszw'] = function (fig) {
    const c = C(), Cs = T => 5 * Math.exp(0.03 * T), MS = 12;
    const svg = el('svg', { viewBox: '0 0 640 300', role: 'img', 'aria-label': 'Solubility and metastable limit curves with the concentration path during cooling' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<button type="button" data-k="seed" aria-pressed="false">Seed at 67 °C</button><button type="button" data-k="cub" aria-pressed="false">Cubic cooling (slow start)</button>
      <label>Cooling time, 70 → 10 °C <input type="range" min="1" max="8" step="0.5" value="3" aria-label="Cooling time in hours"> <output></output></label>`);
    const i = ctl.querySelector('input'), o = ctl.querySelector('output'), rd = readout(fig); const opt = { seed: false, cub: false };
    function sim(tau) {
      const dt = 0.001, C0 = Cs(70); let Cc = C0, A = 0, nuc = null, smax = 0, seeded = false; const pts = [];
      for (let t = 0; t <= tau + 1e-9; t += dt) { const f = t / tau, T = opt.cub ? 70 - 60 * f * f * f : 70 - 60 * f;
        if (opt.seed && !seeded && T <= 67) seeded = true;
        if (!nuc && Cc > Cs(T + MS)) nuc = [T, Cc];
        const S = Math.max(0, Cc - Cs(T)); smax = Math.max(smax, S / Cs(T));
        Cc -= 4 * A * S * dt; A = (seeded ? 0.3 : 0) + (nuc ? 3 : 0) + 0.25 * (C0 - Cc);
        if (Math.round(t / dt) % 20 === 0) pts.push([T, Cc]); }
      return { pts, nuc, smax, Cend: Cc, C0 };
    }
    function draw() {
      const tau = +i.value; o.textContent = tau + ' h'; svg.innerHTML = '';
      const { X, Y } = axes(svg, { x0: 60, y0: 12, w: 540, h: 230, xmax: 80, ymax: 60, xstep: 10, ystep: 10, xlab: 'Temperature (°C)', ylab: 'Concentration (g / 100 g solvent)' });
      el('path', { d: path(Array.from({ length: 69 }, (_, k) => [X(k), Y(Cs(k + MS))])) + ` L${X(68)} ${Y(Cs(68))} ` + path(Array.from({ length: 69 }, (_, k) => [X(68 - k), Y(Cs(68 - k))])).replace('M', 'L') + 'Z', fill: c.green, opacity: .12 }, svg);
      el('path', { d: path(Array.from({ length: 81 }, (_, k) => [X(k), Y(Cs(k))])), fill: 'none', stroke: c.blue, 'stroke-width': 2.5 }, svg);
      el('path', { d: path(Array.from({ length: 69 }, (_, k) => [X(k), Y(Cs(k + MS))])), fill: 'none', stroke: c.rust, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
      txt(svg, X(79), Y(Cs(79)) + 18, 'solubility', { 'text-anchor': 'end', fill: c.blue, 'font-weight': 700, 'font-size': 12 });
      txt(svg, X(44), Y(Cs(56)) - 8, 'metastable limit', { 'text-anchor': 'end', fill: c.rust, 'font-weight': 700, 'font-size': 12 });
      txt(svg, X(30), Y(Cs(30)) - 8, 'metastable zone', { fill: c.green, 'font-size': 11 });
      const r = sim(tau);
      el('path', { d: path(r.pts.map(p => [X(p[0]), Y(p[1])])), fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg);
      if (r.nuc) { el('circle', { cx: X(r.nuc[0]), cy: Y(r.nuc[1]), r: 7, fill: c.rust, class: 'anim-pulse' }, svg); txt(svg, X(r.nuc[0]) - 12, Y(r.nuc[1]) - 10, 'spontaneous nucleation', { 'text-anchor': 'end', fill: c.rust, 'font-size': 11, 'font-weight': 700 }); }
      let v, cls = '';
      if (r.nuc) { v = 'Shower of fines at ' + F(r.nuc[0], 0) + ' °C'; cls = 'no'; } else if (r.smax > 0.2) { v = 'Secondary nucleation: some fines'; cls = 'no'; } else v = 'Controlled growth on the seed';
      rd.innerHTML = `<div class="hi"><span>Outcome</span><b class="${cls}">${v}</b></div><div><span>Peak supersaturation</span><b>${F(r.smax * 100, 0)} % over solubility</b></div><div><span>Crystallised by 10 °C</span><b>${F((r.C0 - r.Cend) / (r.C0 - Cs(10)) * 100, 0)} % of possible</b></div>`;
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (!b) return; opt[b.dataset.k] = !opt[b.dataset.k]; b.setAttribute('aria-pressed', opt[b.dataset.k]); draw(); });
    i.addEventListener('input', draw); draw();
  };

  /* Drying curve: constant-rate and falling-rate periods, lab tray vs plant bed */
  M['drycurve'] = function (fig) {
    const c = C(), X0 = 0.30, Xc = 0.10, Xe = 0.002, k = 0.0214;
    const svg = el('svg', { viewBox: '0 0 640 290', role: 'img', 'aria-label': 'Loss on drying against time for a lab tray and a plant dryer bed' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Plant bed depth <input type="range" min="5" max="50" step="1" value="30" aria-label="Plant cake bed depth in centimetres"> <output></output></label>
      <label>Jacket temperature <input type="range" min="35" max="80" step="5" value="60" aria-label="Jacket temperature"> <output></output></label>`);
    const [idp, itj] = ctl.querySelectorAll('input'), [odp, otj] = ctl.querySelectorAll('output'), rd = readout(fig);
    const lod = X => X / (1 + X) * 100;
    function curve(Rc, Xt) { const t1 = (X0 - Xc) / Rc, t2 = (Xc - Xe) / Rc * Math.log((Xc - Xe) / (Xt - Xe)); const f = t => t <= t1 ? X0 - Rc * t : Xe + (Xc - Xe) * Math.exp(-Rc * (t - t1) / (Xc - Xe)); return { t1, t2, f }; }
    function draw() {
      const d = +idp.value, Tj = +itj.value; odp.textContent = d + ' cm'; otj.textContent = Tj + ' °C';
      const Xt = 0.005 / 0.995, dT = Math.max(2, Tj - 25), lab = curve(k * dT / 2, Xt), pl = curve(k * dT / d, Xt);
      const tmax = Math.min(60, Math.max(12, Math.ceil((pl.t1 + pl.t2) * 1.15 / 6) * 6));
      svg.innerHTML = ''; const { X, Y } = axes(svg, { x0: 60, y0: 12, w: 540, h: 220, xmax: tmax, ymax: 25, xstep: tmax / 6, ystep: 5, xlab: 'Drying time (h)', ylab: 'Loss on drying (%)' });
      el('line', { x1: X(0), y1: Y(0.5), x2: X(tmax), y2: Y(0.5), stroke: c.green, 'stroke-dasharray': '6 5', 'stroke-width': 2 }, svg); txt(svg, X(tmax), Y(0.5) - 6, 'target LOD 0.5 %', { 'text-anchor': 'end', fill: c.green, 'font-size': 11 });
      const P = (cv, col, lbl) => { const pts = []; for (let t = 0; t <= tmax; t += tmax / 300) pts.push([X(t), Y(lod(cv.f(t)))]); el('path', { d: path(pts), fill: 'none', stroke: col, 'stroke-width': 3 }, svg); };
      P(lab, c.blue); P(pl, c.brass);
      el('line', { x1: X(pl.t1), y1: Y(lod(Xc)), x2: X(pl.t1), y2: Y(0), stroke: c.mute, 'stroke-dasharray': '3 4' }, svg); txt(svg, X(pl.t1) + 6, Y(lod(Xc)) - 6, 'falling-rate period starts', { fill: c.mute, 'font-size': 11 });
      txt(svg, X(lab.t1 + lab.t2) + 8, Y(3), 'lab tray, 2 cm', { fill: c.blue, 'font-weight': 700, 'font-size': 12 }); txt(svg, X(Math.min(pl.t1 * 0.5, tmax * .5)), Y(lod(pl.f(pl.t1 * 0.5))) - 10, 'plant bed, ' + d + ' cm', { fill: c.brass, 'font-weight': 700, 'font-size': 12 });
      rd.innerHTML = `<div><span>Lab tray to 0.5 % LOD</span><b>${F(lab.t1 + lab.t2, 1)} h</b></div><div class="hi"><span>Plant bed to 0.5 % LOD</span><b>${F(pl.t1 + pl.t2, 1)} h</b></div><div><span>Of which falling-rate period</span><b>${F(pl.t2, 1)} h (${F(pl.t2 / (pl.t1 + pl.t2) * 100, 0)} %)</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  /* Dust explosion pentagon */
  M['dustpent'] = function (fig) {
    const c = C();
    const E = [['Combustible dust', 'Fine powder below about 500 µm: APIs, intermediates, sugars, starch, many organics.', 'Good housekeeping; no dust layers on beams and ducts.'],
      ['Oxygen', 'Air. Most dusts need more than about 8–12 % oxygen to explode.', 'Inert milling, drying and blending with nitrogen; measure O₂.'],
      ['Ignition source', 'Static from bags and FIBCs, hot surfaces, sparks from tramp metal, friction in mills.', 'Earthing, antistatic FIBCs, magnets and metal detectors, temperature limits.'],
      ['Dispersion', 'The dust must be a cloud. A layer burns, but only a cloud explodes.', 'Closed transfer; avoid pouring from height; clean up without compressed air.'],
      ['Confinement', 'A dust cloud inside equipment or a room builds pressure.', 'Explosion venting, suppression, containment, and isolation of connected ducts.']];
    const svg = el('svg', { viewBox: '0 0 640 300', role: 'img', 'aria-label': 'Dust explosion pentagon; tap a side to remove it' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const rd = readout(fig); const on = [1, 1, 1, 1, 1];
    const cx = 320, cy = 150, R = 115, pt = k => [cx + R * Math.sin(k * 2 * Math.PI / 5), cy - R * Math.cos(k * 2 * Math.PI / 5)];
    function draw() {
      svg.innerHTML = ''; const all = on.every(Boolean);
      el('circle', { cx, cy, r: 46, fill: all ? c.rust : 'none', stroke: all ? c.rust : c.mute, 'stroke-width': 2, opacity: all ? .85 : 1, class: all ? 'anim-pulse' : '' }, svg);
      txt(svg, cx, cy + 5, all ? 'EXPLOSION' : 'no explosion', { 'text-anchor': 'middle', fill: all ? '#0B1622' : c.mute, 'font-weight': 700, 'font-size': all ? 13 : 12 });
      E.forEach((e, k) => { const a = pt(k), b = pt(k + 1), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ox = (mx - cx) * 0.5, oy = (my - cy) * 0.5;
        const ln = el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: on[k] ? c.brass : c.grid, 'stroke-width': on[k] ? 6 : 3, 'stroke-dasharray': on[k] ? '' : '6 6', 'stroke-linecap': 'round', style: 'cursor:pointer' }, svg);
        const t = txt(svg, mx + ox, my + oy + 4, e[0], { 'text-anchor': 'middle', fill: on[k] ? c.ink : c.mute, 'font-weight': 700, 'font-size': 12, style: 'cursor:pointer' });
        [ln, t].forEach(n => { n.setAttribute('tabindex', '0'); n.setAttribute('role', 'button'); n.setAttribute('aria-pressed', on[k] ? 'true' : 'false'); n.setAttribute('aria-label', (on[k] ? 'Remove ' : 'Restore ') + e[0]);
          const go = () => { on[k] = on[k] ? 0 : 1; draw(); }; n.addEventListener('click', go); n.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } }); }); });
      const off = E.filter((_, k) => !on[k]);
      rd.innerHTML = all ? `<div class="hi"><span>All five present</span><b style="font:400 .95rem var(--f-sans);line-height:1.5">Tap any side to take it away and see the control that does it.</b></div>`
        : off.map(e => `<div><span>Removed: ${e[0]}</span><b style="font:400 .95rem var(--f-sans);line-height:1.5">${e[1]} <br><em>How plants do it:</em> ${e[2]}</b></div>`).join('');
    }
    draw();
  };

  /* Cost per kg from yield, solvent recovery and batch costs */
  M['costkg'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 170', role: 'img', 'aria-label': 'Cost per kg of product split into raw materials, solvent make-up and conversion cost' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Yield <input type="range" min="60" max="98" step="1" value="85" aria-label="Yield percent"> <output></output></label>
      <label>Solvent recovery <input type="range" min="60" max="98" step="1" value="90" aria-label="Solvent recovery percent"> <output></output></label>`);
    const [iy, ir] = ctl.querySelectorAll('input'), [oy, or] = ctl.querySelectorAll('output'), rd = readout(fig);
    function draw() {
      const y = +iy.value / 100, r = +ir.value / 100; oy.textContent = Math.round(y * 100) + ' %'; or.textContent = Math.round(r * 100) + ' %';
      const prod = 600 * y, rm = (500 * 800 + 300 * 250) / prod, sol = 2000 * (1 - r) * 90 / prod, conv = 120000 / prod, tot = rm + sol + conv;
      svg.innerHTML = ''; const sc = 560 / 2000; let x = 40;
      [[rm, c.brass, 'Raw materials'], [sol, c.blue, 'Solvent make-up'], [conv, c.green, 'Conversion']].forEach(p => { const w = p[0] * sc; el('rect', { x, y: 30, width: Math.max(0, w - 2), height: 44, rx: 4, fill: p[1] }, svg); if (w > 70) { txt(svg, x + 6, 48, p[2], { fill: '#0B1622', 'font-size': 11, 'font-weight': 700 }); txt(svg, x + 6, 66, '₹' + F(p[0], 0), { fill: '#0B1622', 'font-size': 12 }); } x += w; });
      txt(svg, Math.min(x + 8, 600), 58, '₹' + F(tot, 0) + '/kg', { fill: c.ink, 'font-weight': 700, 'font-size': 13, 'text-anchor': x > 540 ? 'end' : 'start' });
      [0, 500, 1000, 1500, 2000].forEach(v => { el('line', { x1: 40 + v * sc, y1: 84, x2: 40 + v * sc, y2: 90, stroke: c.mute }, svg); txt(svg, 40 + v * sc, 104, '₹' + F(v, 0), { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); });
      txt(svg, 320, 126, 'cost per kg of product', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      [[rm, c.brass, 'Raw materials'], [sol, c.blue, 'Solvent make-up'], [conv, c.green, 'Conversion']].forEach((p, k) => { el('rect', { x: 40 + k * 200, y: 146, width: 12, height: 12, rx: 2, fill: p[1] }, svg); txt(svg, 58 + k * 200, 157, p[2] + ' ₹' + F(p[0], 0), { fill: c.ink, 'font-size': 12 }); });
      rd.innerHTML = `<div class="hi"><span>Cost per kg</span><b>₹${F(tot, 0)}</b></div><div><span>Product per batch</span><b>${F(prod, 0)} kg</b></div><div><span>Starting material per kg product</span><b>${F(500 / prod, 3)} kg</b></div><div><span>Toluene consumed per kg product</span><b>${F(2000 * (1 - r) / prod, 2)} kg</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  /* Generic quiz: figure holds <script type="application/json">{"a":["label0","label1"],"q":[[text, answerIndex, explanation],...]}</script> */
  M['quiz'] = function (fig) {
    const data = JSON.parse(fig.querySelector('script[type="application/json"]').textContent);
    const box = document.createElement('div'); box.className = 'moc-q'; fig.insertBefore(box, fig.querySelector('figcaption'));
    const rd = readout(fig); let done = 0, right = 0;
    data.q.forEach(q => {
      const d = document.createElement('div'); d.className = 'moc-item';
      d.innerHTML = `<p>${q[0]}</p><div class="art-ctl">${data.a.map((a, i) => `<button type="button" data-a="${i}">${a}</button>`).join('')}</div><p class="moc-ans" hidden></p>`;
      d.addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (!b || d.dataset.done) return; d.dataset.done = 1; done++;
        const ok = +b.dataset.a === q[1]; if (ok) right++; b.setAttribute('aria-pressed', 'true');
        const a = d.querySelector('.moc-ans'); a.hidden = false; a.innerHTML = `<b class="${ok ? 'ok' : 'no'}">${ok ? 'Right.' : 'Not quite: ' + data.a[q[1]] + '.'}</b> ${q[2]}`;
        d.querySelectorAll('button').forEach(x => x.disabled = true); score(); });
      box.appendChild(d); });
    function score() { rd.innerHTML = `<div class="hi"><span>Score</span><b>${right} / ${done}</b></div><div><span>Answered</span><b>${done} of ${data.q.length}</b></div>`; }
    score();
  };

  /* LOPA: initiating event frequency reduced by independent protection layers */
  M['lopa'] = function (fig) {
    const c = C(), IE = 0.1, TARGET = 1e-5;
    const L = [['alarm', 'High-temperature alarm, operator stops dosing', 0.1], ['bpcs', 'Same-sensor DCS trip (not independent)', 1], ['rd', 'Rupture disc sized for the runaway (DIERS)', 0.01], ['sil1', 'SIF: independent trip, SIL 1', 0.1], ['sil2', 'SIF: independent trip, SIL 2', 0.01], ['occ', 'Occupancy: area manned half the time', 0.5]];
    const on = { alarm: true, bpcs: false, rd: false, sil1: false, sil2: false, occ: true };
    const ctl = controls(fig, L.map(l => `<button type="button" data-l="${l[0]}" aria-pressed="${on[l[0]]}">${l[1]}</button>`).join(''));
    const svg = el('svg', { viewBox: '0 0 640 200', role: 'img', 'aria-label': 'Scenario frequency after each protection layer on a log scale, against the tolerable target' });
    fig.insertBefore(svg, fig.querySelector('figcaption')); const rd = readout(fig);
    const x0 = 70, w = 540, X = f => x0 + (Math.log10(f) + 7) / 7 * w;
    function draw() {
      svg.innerHTML = ''; let f = IE; const steps = [['Cooling water fails', f]];
      L.forEach(l => { if (on[l[0]]) { f *= l[2]; steps.push([l[1].split(':')[0].split(',')[0], f]); } });
      for (let e = -7; e <= 0; e++) { el('line', { x1: X(Math.pow(10, e)), y1: 10, x2: X(Math.pow(10, e)), y2: 160, stroke: c.grid }, svg); txt(svg, X(Math.pow(10, e)), 176, e === 0 ? '1' : '10' + String(e).replace('-', '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]), { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); }
      txt(svg, x0 + w / 2, 194, 'Frequency of the outcome (per year)', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      el('line', { x1: X(TARGET), y1: 6, x2: X(TARGET), y2: 160, stroke: c.green, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg); txt(svg, X(TARGET) - 4, 20, 'tolerable 10⁻⁵/yr', { 'text-anchor': 'end', fill: c.green, 'font-size': 11, 'font-weight': 700 });
      const dy = Math.min(26, 140 / steps.length);
      steps.forEach((s, k) => { const y = 14 + k * dy; el('rect', { x: X(s[1]) - 5, y: y + 2, width: 10, height: dy - 6, rx: 3, fill: k === steps.length - 1 ? (s[1] <= TARGET ? c.green : c.rust) : c.brass }, svg);
        if (k) el('line', { x1: X(steps[k - 1][1]), y1: y - dy / 2 + 4, x2: X(s[1]), y2: y + dy / 2 - 1, stroke: c.mute, 'stroke-dasharray': '2 3' }, svg);
        txt(svg, X(s[1]) + 10, y + dy / 2 + 2, s[0], { fill: c.ink, 'font-size': 11 }); });
      const gap = f / TARGET;
      rd.innerHTML = `<div><span>Initiating event</span><b>0.1 per year</b></div><div class="hi"><span>Mitigated frequency</span><b class="${f > TARGET ? 'no' : ''}">${f.toExponential(1).replace('e', ' × 10^')}</b></div><div><span>Verdict</span><b>${f <= TARGET ? 'Meets the target' : 'Gap of ' + F(gap, 0) + '× : add a layer'}</b></div>`;
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-l]'); if (!b) return; const k = b.dataset.l; on[k] = !on[k]; if (k === 'sil1' && on.sil1) on.sil2 = false; if (k === 'sil2' && on.sil2) on.sil1 = false; ctl.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', !!on[x.dataset.l])); draw(); });
    draw();
  };

  /* Hydrogenation purge sequence: headspace O2 / N2 / H2 through the steps */
  M['h2purge'] = function (fig) {
    const c = C();
    const ctl = controls(fig, `<button type="button" data-s="1" aria-pressed="true">Correct sequence</button><button type="button" data-s="0" aria-pressed="false">Skip the nitrogen purge</button>`);
    const svg = el('svg', { viewBox: '0 0 640 250', role: 'img', 'aria-label': 'Headspace composition through each step of a hydrogenation, with flammable steps marked' });
    fig.insertBefore(svg, fig.querySelector('figcaption')); const rd = readout(fig);
    function seq(good) {
      const st = [['Air', [21, 79, 0], false]]; let g = [21, 79, 0]; const purge = (gas, n, r) => { for (let k = 0; k < n; k++) { g = g.map(v => v * r); const add = 100 - g.reduce((a, b) => a + b, 0); g[gas] += add; } };
      if (good) { purge(1, 3, 1 / 5); st.push(['N₂ purge ×3 (4 barg)', g.slice(), false]); }
      const o2 = g[0]; purge(2, 3, 1 / 5); st.push(['H₂ purge ×3', g.slice(), o2 >= 5]); st.push(['React under H₂', g.slice(), false]);
      purge(1, 3, 1 / 5); st.push(['N₂ purge ×3', g.slice(), false]); const h2 = g[2]; st.push(['Open, filter catalyst', [21, 79, 0], h2 >= 4]);
      return st;
    }
    const flam = s => s[2];
    function draw(good) {
      svg.innerHTML = ''; const st = seq(good), bw = 74, gap = (600 - st.length * bw) / (st.length - 1 || 1);
      st.forEach((s, k) => { const x = 20 + k * (bw + gap); let y = 20; const H = 170;
        [[0, c.rust, 'O₂'], [1, c.blue, 'N₂'], [2, c.green, 'H₂']].forEach(p => { const h = s[1][p[0]] / 100 * H; el('rect', { x, y, width: bw, height: Math.max(0, h), fill: p[1] }, svg); if (h > 14) txt(svg, x + bw / 2, y + h / 2 + 4, p[2] + ' ' + F(s[1][p[0]], s[1][p[0]] < 10 ? 1 : 0) + '%', { 'text-anchor': 'middle', fill: '#0B1622', 'font-size': 10, 'font-weight': 700 }); y += h; });
        if (flam(s)) { el('rect', { x: x - 3, y: 17, width: bw + 6, height: H + 6, rx: 4, fill: 'none', stroke: c.rust, 'stroke-width': 3, class: 'anim-pulse' }, svg); }
        const words = s[0].split(' '); txt(svg, x + bw / 2, 208, words.slice(0, 2).join(' '), { 'text-anchor': 'middle', fill: c.ink, 'font-size': 10 }); txt(svg, x + bw / 2, 221, words.slice(2).join(' '), { 'text-anchor': 'middle', fill: c.ink, 'font-size': 10 }); });
      const bad = st.filter(s => flam(s));
      rd.innerHTML = `<div class="hi"><span>Flammable steps</span><b class="${bad.length ? 'no' : ''}">${bad.length ? bad.map(b => b[0]).join(', ') : 'None'}</b></div><div><span>Rule</span><b style="font:400 .95rem var(--f-sans)">Hydrogen burns from 4 to 75 % in air; keep O₂ below about 5 % before H₂ goes in</b></div>`;
      ctl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.s === (good ? '1' : '0')));
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-s]'); if (b) draw(b.dataset.s === '1'); }); draw(true);
  };

  /* Quench of sodium hydride: H2 generation rate vs nitrogen sweep */
  M['quench'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 230', role: 'img', 'aria-label': 'Hydrogen generation rate during a quench against the nitrogen sweep needed' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Excess NaH to quench <input type="range" min="1" max="20" step="1" value="6" aria-label="Kilograms of sodium hydride"> <output></output></label>
      <label>Quench addition time <input type="range" min="0.25" max="6" step="0.25" value="2" aria-label="Quench addition time in hours"> <output></output></label>`);
    const [im, it] = ctl.querySelectorAll('input'), [om, ot] = ctl.querySelectorAll('output'), rd = readout(fig);
    function draw() {
      const kg = +im.value, h = +it.value; om.textContent = kg + ' kg'; ot.textContent = h + ' h';
      const kmol = kg / 24, Nm3 = kmol * 22.4, rate = Nm3 / h, n2 = rate * (100 / 1 - 1), peak = rate * 2.5, n2pk = peak * 99;
      svg.innerHTML = ''; const { X, Y } = axes(svg, { x0: 70, y0: 12, w: 520, h: 160, xmax: 6, ymax: 30, xstep: 1, ystep: 5, xlab: 'Quench addition time (h)', ylab: 'H₂ (Nm³/h)' });
      const pts = []; for (let t = 0.25; t <= 6.001; t += 0.05) pts.push([X(t), Y(Math.min(30, Nm3 / t))]);
      el('path', { d: path(pts), fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg);
      el('line', { x1: X(0), y1: Y(2), x2: X(6), y2: Y(2), stroke: c.green, 'stroke-dasharray': '6 5', 'stroke-width': 2 }, svg); txt(svg, X(6), Y(2) - 6, 'example vent / scrubber limit 2 Nm³/h', { 'text-anchor': 'end', fill: c.green, 'font-size': 11 });
      el('circle', { cx: X(h), cy: Y(Math.min(30, rate)), r: 7, fill: c.ink, stroke: '#0B1622', 'stroke-width': 2 }, svg);
      rd.innerHTML = `<div><span>Total H₂ released</span><b>${F(Nm3, 1)} Nm³</b></div><div class="hi"><span>Average H₂ rate</span><b class="${rate > 2 ? 'no' : ''}">${F(rate, 2)} Nm³/h</b></div><div><span>Shortest addition time for a 2 Nm³/h vent</span><b>${F(Nm3 / 2, 1)} h</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  /* Caustic scrubber for HCl: NaOH consumption and when to change the liquor */
  M['scrubber'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 200', role: 'img', 'aria-label': 'Free caustic left in the scrubber liquor as HCl is absorbed batch by batch' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>HCl per batch <input type="range" min="10" max="150" step="5" value="60" aria-label="HCl per batch in kg"> <output></output></label>
      <label>Liquor <input type="range" min="1000" max="5000" step="250" value="2000" aria-label="Scrubber liquor in kg"> <output></output></label>
      <label>NaOH strength <input type="range" min="5" max="20" step="1" value="10" aria-label="Starting NaOH percent"> <output></output></label>`);
    const [ih, il, is] = ctl.querySelectorAll('input'), [oh, ol, os] = ctl.querySelectorAll('output'), rd = readout(fig);
    function draw() {
      const hcl = +ih.value, liq = +il.value, s0 = +is.value / 100; oh.textContent = hcl + ' kg'; ol.textContent = F(liq, 0) + ' kg'; os.textContent = Math.round(s0 * 100) + ' %';
      const naoh0 = liq * s0, per = hcl * 40 / 36.46, minFree = 0.02, nMax = Math.floor((naoh0 - minFree * liq) / per), dT = hcl / 36.46 * 57.3 * 1000 / (liq * 3.9);
      svg.innerHTML = ''; const N = 10, bw = 46, x0 = 70, H = 140, Yp = p => 20 + H - p / 20 * H;
      [0, 5, 10, 15, 20].forEach(v => { el('line', { x1: x0, y1: Yp(v), x2: 620, y2: Yp(v), stroke: c.grid }, svg); txt(svg, x0 - 8, Yp(v) + 4, v + ' %', { 'text-anchor': 'end', fill: c.mute, 'font-size': 11 }); });
      el('line', { x1: x0, y1: Yp(2), x2: 620, y2: Yp(2), stroke: c.rust, 'stroke-dasharray': '6 5', 'stroke-width': 2 }, svg); txt(svg, 620, Yp(2) - 5, 'change liquor below ~2 % free NaOH', { 'text-anchor': 'end', fill: c.rust, 'font-size': 11 });
      for (let k = 0; k <= N; k++) { const left = Math.max(0, naoh0 - k * per) / liq * 100, x = x0 + 8 + k * 49; el('rect', { x, y: Yp(left), width: bw - 8, height: Math.max(0, H + 20 - Yp(left)), rx: 3, fill: left < 2 ? c.rust : c.blue }, svg); txt(svg, x + (bw - 8) / 2, 178, k ? 'B' + k : 'Start', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 10 }); }
      txt(svg, 345, 196, 'free NaOH after each batch', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      rd.innerHTML = `<div><span>NaOH used per batch</span><b>${F(per, 1)} kg</b></div><div class="hi"><span>Batches before changing liquor</span><b>${Math.max(0, nMax)}</b></div><div><span>Liquor temperature rise per batch</span><b>${F(dT, 1)} °C</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  /* Reading thermal safety data: DSC, ARC, RC1 and TSU */
  M['thermread'] = function (fig) {
    const c = C();
    const T = {
      dsc: { b: 'DSC', xl: 'Temperature (°C)', yl: 'Heat flow, exo up', xmax: 400, ymax: 5, ys: 1, xs: 50,
        f: x => -0.25 * Math.exp(-Math.pow((x - 118) / 6, 2)) * 6 + 2.6 * Math.exp(-Math.pow((x - 262) / 18, 2)) + 0.004 * (x - 20) * 0 + 0.15,
        m: [[118, 0.15 - 1.5, 'Endotherm: melting', 'A peak downward (with exo up) is heat absorbed: melting, evaporation or desolvation. Note it, but it is not a hazard by itself.'], [228, 0.3, 'Onset', 'Where the curve leaves the baseline, about 228 °C here. Onset depends on ramp rate and sensitivity: a 5 K/min DSC reports a higher onset than a slow adiabatic test would. Never treat it as a safe temperature.'], [262, 2.75, 'Peak', 'Maximum heat release rate. A sharp, tall peak means a fast decomposition.'], [300, 1.2, 'Area = ΔH', 'The area under the exotherm is the energy: here about 650 J/g. Divide by heat capacity for the adiabatic temperature rise: 650 / 1.8 ≈ 360 K. Above about 500 J/g, treat as high energy and check for explosive properties.']] },
      arc: { b: 'ARC', xl: 'Temperature (°C)', yl: 'Self-heat rate (°C/min, log)', xmax: 300, ymax: 4, ys: 1, xs: 50, log: true,
        f: x => x < 150 ? NaN : Math.log10(0.02 * Math.exp((x - 150) / 13.5)) + 2, m: [[150, 0.3, 'Detected onset', 'Heat-wait-search steps up 5 K at a time; at 150 °C the sample self-heats faster than 0.02 °C/min and the calorimeter tracks it adiabatically.'], [210, 2.2, 'Runaway', 'The rate climbs exponentially: the classic shape of a runaway. Data like this give the time to maximum rate (TMR) at each temperature.'], [250, 3.2, 'Correct for φ', 'The bomb absorbs some heat, so the sample looks milder than it is. The phi factor φ = 1 + (m·cp)bomb/(m·cp)sample, often 1.5–3 in an ARC, corrects temperature rise and onset to plant conditions.'], [110, 1.2, 'TD24', 'Extrapolating the corrected data down to where TMR = 24 h gives TD24, the temperature the batch must stay below. It is typically well below the detected onset.']] },
      rc1: { b: 'RC1', xl: 'Time (h)', yl: 'Heat flow (W/kg)', xmax: 6, ymax: 40, ys: 10, xs: 1,
        f: x => x < 1 ? 0 : x < 5 ? 22 * (1 - Math.exp(-(x - 1) * 4)) : 22 * Math.exp(-(x - 5) * 3.2), m: [[0.5, 3, 'Calibration', 'Before and after the reaction, a heater pulse with known power gives UA, so heat flow = UA × (Tr − Tj) can be calculated.'], [3, 24, 'Dosing plateau', 'With fast reaction, heat flow follows the dosing rate: a flat plateau. The height tells you the cooling the plant must supply per kg.'], [5.3, 14, 'Tail after dosing', 'Heat still released after dosing stops is unreacted material: the accumulation. A long tail means high accumulation and a higher MTSR.'], [4, 2, 'Integral = ΔHr', 'Integrating the curve gives the reaction heat in kJ/mol or kJ/kg, and the adiabatic temperature rise.']] },
      tsu: { b: 'TSU', xl: 'Temperature (°C)', yl: 'Pressure (bar)', xmax: 300, ymax: 60, ys: 10, xs: 50,
        f: x => (x < 170 ? 1 + 0.02 * (x - 20) : 4 + 50 / (1 + Math.exp(-(x - 205) / 10))), m: [[100, 6, 'Vapour pressure', 'Below the onset, pressure rises gently with temperature as the solvent vapour pressure rises: this part is reversible.'], [180, 14, 'Exotherm and gas', 'Temperature and pressure both jump: decomposition with gas generation. The TSU gives onset, pressure rise and rates dT/dt and dP/dt from a few grams.'], [270, 52, 'Non-condensable gas', 'After cooling back to room temperature, the pressure that remains is permanent gas. Gas generation drives relief sizing and is often the bigger hazard than the heat.'], [60, 30, 'Screening tool', 'A TSU is a fast closed-cell screen, between DSC and ARC. Use it to flag hazards and decide what needs full ARC or RC1 testing.']] },
    };
    const ctl = controls(fig, Object.keys(T).map((k, i) => `<button type="button" data-t="${k}" aria-pressed="${i === 0}">${T[k].b}</button>`).join(''));
    const svg = el('svg', { viewBox: '0 0 640 270', role: 'img', 'aria-label': 'Example thermal safety test curve with numbered features to tap' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const info = document.createElement('div'); info.className = 'art-read'; info.style.gridTemplateColumns = '1fr'; fig.insertBefore(info, fig.querySelector('figcaption'));
    let cur = 'dsc';
    function show(m) { info.innerHTML = `<div class="hi"><span>${m[2]}</span><b style="font:400 .95rem var(--f-sans);line-height:1.5">${m[3]}</b></div>`; }
    function draw() {
      const t = T[cur]; svg.innerHTML = '';
      const ymaxPlot = t.ymax, { X, Y } = axes(svg, { x0: 70, y0: 12, w: 530, h: 210, xmax: t.xmax, ymax: ymaxPlot, xstep: t.xs, ystep: t.ys, xlab: t.xl, ylab: t.yl });
      if (t.log) svg.querySelectorAll('text').forEach(n => { if (n.getAttribute('text-anchor') === 'end' && /^\d$/.test(n.textContent)) n.textContent = ['0.01', '0.1', '1', '10', '100'][+n.textContent]; });
      const pts = []; const base = cur === 'dsc' ? 1.5 : 0;
      for (let x = 0; x <= t.xmax; x += t.xmax / 400) { let y = t.f(x); if (cur === 'dsc') y += base; if (!isFinite(y)) continue; pts.push([X(x), Y(Math.max(0, Math.min(ymaxPlot, y)))]); }
      el('path', { d: path(pts), fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg);
      t.m.forEach((m, k) => { const g = el('g', { style: 'cursor:pointer', tabindex: 0, role: 'button', 'aria-label': m[2] }, svg); const yy = cur === 'dsc' ? m[1] + base : m[1];
        el('circle', { cx: X(m[0]), cy: Y(yy), r: 12, fill: c.ink, stroke: '#0B1622', 'stroke-width': 2 }, g); txt(g, X(m[0]), Y(yy) + 4, String(k + 1), { 'text-anchor': 'middle', fill: '#0B1622', 'font-weight': 700 });
        g.addEventListener('click', () => show(m)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(m); } }); });
      show(t.m[0]);
      ctl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === cur));
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-t]'); if (!b) return; cur = b.dataset.t; draw(); }); draw();
  };

  /* Line sizing: velocity and pressure drop for a chosen pipe */
  M['dp'] = function (fig) {
    const c = C(), P = [[25, 26.6], [40, 40.9], [50, 52.5], [80, 77.9], [100, 102.3], [150, 154.1]], FL = { water: ['Water', 1000, 1.0], tol: ['Toluene', 867, 0.56], meoh: ['Methanol', 792, 0.55], visc: ['Viscous oil, 100 cP', 900, 100] };
    const svg = el('svg', { viewBox: '0 0 640 230', role: 'img', 'aria-label': 'Velocity in each standard pipe size at the chosen flow, with recommended bands' });
    const ctl = controls(fig, `<label>Fluid <select aria-label="Fluid">${Object.keys(FL).map(k => `<option value="${k}">${FL[k][0]}</option>`).join('')}</select></label>
      <label>Flow <input type="range" min="1" max="100" step="1" value="20" aria-label="Flow in cubic metres per hour"> <output></output></label>
      <label>Pipe <select aria-label="Pipe size">${P.map(p => `<option value="${p[0]}"${p[0] === 50 ? ' selected' : ''}>${p[0]} NB</option>`).join('')}</select></label>`);
    fig.insertBefore(svg, fig.querySelector('figcaption')); const rd = readout(fig);
    const [sf, sp] = ctl.querySelectorAll('select'), iq = ctl.querySelector('input'), oq = ctl.querySelector('output');
    const fr = (Re, D) => Re < 2300 ? 64 / Re : 0.25 / Math.pow(Math.log10(0.045e-3 / (3.7 * D) + 5.74 / Math.pow(Re, 0.9)), 2);
    function draw() {
      const f = FL[sf.value], Q = +iq.value / 3600, sel = +sp.value; oq.textContent = iq.value + ' m³/h'; svg.innerHTML = '';
      const x0 = 70, w = 540, vmax = 6, X = v => x0 + Math.min(v, vmax) / vmax * w;
      el('rect', { x: X(1), y: 8, width: X(3) - X(1), height: 170, fill: c.green, opacity: .1 }, svg); txt(svg, (X(1) + X(3)) / 2, 22, 'typical pump discharge 1–3 m/s', { 'text-anchor': 'middle', fill: c.green, 'font-size': 11 });
      el('line', { x1: X(1), y1: 8, x2: X(1), y2: 178, stroke: c.rust, 'stroke-dasharray': '4 4' }, svg); txt(svg, X(1) + 4, 172, 'static: 1 m/s filling limit', { fill: c.rust, 'font-size': 10 });
      for (let v = 0; v <= vmax; v++) { txt(svg, X(v), 196, v, { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); }
      txt(svg, x0 + w / 2, 214, 'Velocity (m/s)', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      let out = null;
      P.forEach((p, k) => { const D = p[1] / 1000, v = Q / (Math.PI * D * D / 4), y = 32 + k * 23, on = p[0] === sel;
        txt(svg, x0 - 8, y + 13, p[0] + ' NB', { 'text-anchor': 'end', fill: on ? c.brass : c.ink, 'font-weight': on ? 700 : 400, 'font-size': 11 });
        el('rect', { x: x0, y, width: Math.max(2, X(v) - x0), height: 17, rx: 3, fill: on ? c.brass : c.blue, opacity: on ? 1 : .55 }, svg);
        txt(svg, Math.min(X(v) + 6, 600), y + 13, F(v, 2) + (v > vmax ? ' ›' : ''), { fill: c.ink, 'font-size': 11 });
        if (on) { const Re = f[1] * v * D / (f[2] / 1000), ff = fr(Re, D), dp = ff * 100 / D * f[1] * v * v / 2 / 1e5; out = { v, Re, dp }; } });
      rd.innerHTML = `<div class="hi"><span>Velocity in ${sel} NB</span><b>${F(out.v, 2)} m/s</b></div><div><span>Reynolds number</span><b>${F(out.Re, 0)} (${out.Re < 2300 ? 'laminar' : out.Re < 4000 ? 'transition' : 'turbulent'})</b></div><div><span>Friction loss per 100 m</span><b>${F(out.dp, 2)} bar</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  /* Agitator types: flow pattern and power */
  M['impeller'] = function (fig) {
    const c = C(), I = { rt: ['Rushton turbine', 5.0, 'radial'], pbt: ['Pitched blade, 45°', 1.3, 'axial'], hf: ['Hydrofoil', 0.3, 'axial'], rci: ['Retreat curve (glass-lined)', 0.4, 'radial'] }, D = 0.6, Vt = 3.0, rho = 900, mu = 0.001;
    const ctl = controls(fig, Object.keys(I).map((k, i) => `<button type="button" data-i="${k}" aria-pressed="${i === 0}">${I[k][0]}</button>`).join('') + `<label>Speed <input type="range" min="30" max="250" step="5" value="100" aria-label="Speed in rpm"> <output></output></label>`);
    const svg = el('svg', { viewBox: '0 0 640 260', role: 'img', 'aria-label': 'Flow pattern of the chosen impeller in a baffled vessel' });
    fig.insertBefore(svg, fig.querySelector('figcaption')); const rd = readout(fig); const i = ctl.querySelector('input'), o = ctl.querySelector('output'); let cur = 'rt';
    function draw() {
      const im = I[cur], N = +i.value / 60; o.textContent = i.value + ' rpm';
      const P = im[1] * rho * N * N * N * Math.pow(D, 5), tip = Math.PI * D * N, Re = rho * N * D * D / mu;
      svg.innerHTML = `<g stroke="currentColor" stroke-width="2" fill="none"><path d="M200 20 V200 q0 40 120 40 q120 0 120 -40 V20"/><path d="M320 10 V160"/><path d="M210 40 V200 M430 40 V200" stroke-width="5" opacity=".4"/></g>`;
      const hub = el('g', {}, svg);
      if (cur === 'rt') hub.innerHTML = `<g stroke="currentColor" stroke-width="2" fill="currentColor"><rect x="290" y="158" width="60" height="4"/><rect x="286" y="150" width="8" height="20"/><rect x="346" y="150" width="8" height="20"/></g>`;
      else if (cur === 'rci') hub.innerHTML = `<path d="M276 172 q44 -22 88 0" stroke="currentColor" stroke-width="5" fill="none"/>`;
      else hub.innerHTML = `<g stroke="currentColor" stroke-width="5"><path d="M290 150 l26 14"/><path d="M350 150 l-26 14"/></g>`;
      const ar = (d) => el('path', { d, fill: 'none', stroke: c.brass, 'stroke-width': 2.5, 'marker-end': '', class: 'anim-flow' }, svg);
      if (im[2] === 'radial') { ar('M355 160 H420 Q432 160 432 120 Q432 70 380 70 Q350 70 335 140'); ar('M285 160 H220 Q208 160 208 120 Q208 70 260 70 Q290 70 305 140'); ar('M355 162 H420 Q432 162 432 200 Q432 228 380 228 Q345 228 335 175'); ar('M285 162 H220 Q208 162 208 200 Q208 228 260 228 Q295 228 305 175'); }
      else { ar('M320 170 V225 Q320 232 380 232 Q425 232 425 190 V60 Q425 40 380 40 Q340 40 335 140'); ar('M320 170 V225 Q320 232 260 232 Q215 232 215 190 V60 Q215 40 260 40 Q300 40 305 140'); }
      txt(svg, 470, 60, im[0], { fill: c.ink, 'font-weight': 700, 'font-size': 13 }); txt(svg, 470, 80, im[2] === 'radial' ? 'Radial flow: two loops' : 'Axial flow: one loop, top to bottom', { fill: c.mute, 'font-size': 11 });
      txt(svg, 470, 100, cur === 'rt' ? 'Gas dispersion, high shear' : cur === 'pbt' ? 'Solids suspension, blending' : cur === 'hf' ? 'Efficient blending, low shear' : 'Glass-lined reactors', { fill: c.mute, 'font-size': 11 });
      txt(svg, 470, 120, 'D = 0.6 m, 3 m³ batch', { fill: c.mute, 'font-size': 11 });
      rd.innerHTML = `<div><span>Power number N<sub>p</sub></span><b>${im[1]}</b></div><div class="hi"><span>Power</span><b>${F(P / 1000, 2)} kW</b></div><div><span>Power per volume</span><b>${F(P / Vt, 0)} W/m³</b></div><div><span>Tip speed</span><b>${F(tip, 2)} m/s</b></div><div><span>Reynolds number</span><b>${F(Re, 0)}</b></div>`;
      ctl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.i === cur));
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) { cur = b.dataset.i; draw(); } }); i.addEventListener('input', draw); draw();
  };

  /* Reactor choice: conversion vs Damköhler number for batch/PFR and CSTRs */
  M['reactorsel'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 270', role: 'img', 'aria-label': 'Conversion against k times residence time for a plug flow or batch reactor, one CSTR and two CSTRs in series' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Target conversion <input type="range" min="50" max="99" step="1" value="90" aria-label="Target conversion percent"> <output></output></label>`);
    const i = ctl.querySelector('input'), o = ctl.querySelector('output'), rd = readout(fig);
    const pfr = d => 1 - Math.exp(-d), cstr = d => d / (1 + d), c2 = d => 1 - 1 / Math.pow(1 + d / 2, 2);
    function draw() {
      const Xt = +i.value / 100; o.textContent = Math.round(Xt * 100) + ' %'; svg.innerHTML = '';
      const { X, Y } = axes(svg, { x0: 60, y0: 12, w: 540, h: 200, xmax: 20, ymax: 100, xstep: 5, ystep: 20, xlab: 'k × residence time (Damköhler number)', ylab: 'Conversion (%)' });
      [[pfr, c.brass, 'Batch or plug flow'], [c2, c.green, 'Two CSTRs in series'], [cstr, c.blue, 'One CSTR']].forEach((f, k) => { el('path', { d: path(Array.from({ length: 201 }, (_, j) => [X(j / 10), Y(f[0](j / 10) * 100)])), fill: 'none', stroke: f[1], 'stroke-width': 3 }, svg); el('rect', { x: 430, y: 150 + k * 18, width: 14, height: 4, fill: f[1] }, svg); txt(svg, 450, 155 + k * 18, f[2], { fill: c.ink, 'font-size': 11 }); });
      el('line', { x1: X(0), y1: Y(Xt * 100), x2: X(20), y2: Y(Xt * 100), stroke: c.mute, 'stroke-dasharray': '5 4' }, svg);
      const dP = -Math.log(1 - Xt), dC = Xt / (1 - Xt), d2 = 2 * (1 / Math.sqrt(1 - Xt) - 1);
      [[dP, c.brass], [d2, c.green], [dC, c.blue]].forEach(p => { if (p[0] <= 20) el('circle', { cx: X(p[0]), cy: Y(Xt * 100), r: 6, fill: p[1] }, svg); });
      rd.innerHTML = `<div><span>Batch / plug flow needs</span><b>kτ = ${F(dP, 1)}</b></div><div><span>Two CSTRs</span><b>kτ = ${F(d2, 1)} (${F(d2 / dP, 1)}× volume)</b></div><div class="hi"><span>One CSTR</span><b>kτ = ${F(dC, 1)} (${F(dC / dP, 1)}× volume)</b></div>`;
    }
    i.addEventListener('input', draw); draw();
  };

  /* Jacket types: cooling water velocity, film coefficient and overall U */
  M['jacket'] = function (fig) {
    const c = C(), mu = 0.0008, k = 0.615, Pr = 5.4;
    const J = [['Conventional jacket, 50 mm gap', 0.267, 0.1], ['Same jacket with agitation nozzles', null, 0.1], ['Half-pipe coil, 80 NB', 0.00239, 0.0477]];
    const svg = el('svg', { viewBox: '0 0 640 170', role: 'img', 'aria-label': 'Overall heat transfer coefficient for three jacket designs' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Cooling water <input type="range" min="5" max="40" step="1" value="20" aria-label="Cooling water flow in cubic metres per hour"> <output></output></label>`);
    const i = ctl.querySelector('input'), o = ctl.querySelector('output'), rd = readout(fig);
    function draw() {
      const Q = +i.value / 3600; o.textContent = i.value + ' m³/h'; svg.innerHTML = ''; let html = '';
      J.forEach((j, n) => { const v = j[1] ? Q / j[1] : 0.6, Re = 1000 * v * j[2] / mu, hDB = 0.023 * Math.pow(Re, 0.8) * Math.pow(Pr, 0.4) * k / j[2], h = Re < 6000 ? Math.max(350, hDB * Math.min(1, Re / 10000)) : hDB;
        const U = 1 / (1 / 1000 + 0.008 / 16 + 0.0002 + 1 / h), y = 20 + n * 46, w = U / 700 * 400;
        txt(svg, 10, y + 15, j[0], { fill: c.ink, 'font-size': 12 }); el('rect', { x: 230, y: y + 2, width: w, height: 22, rx: 4, fill: [c.rust, c.blue, c.green][n] }, svg); txt(svg, 236 + w, y + 18, F(U, 0) + ' W/m²K', { fill: c.ink, 'font-weight': 700, 'font-size': 12 });
        html += `<div${n === 2 ? ' class="hi"' : ''}><span>${j[0]}</span><b>${F(v, 2)} m/s, h ≈ ${F(h, 0)}</b></div>`; });
      txt(svg, 230, 160, 'Overall U, stainless reactor, agitated organic batch', { fill: c.mute, 'font-size': 11 });
      rd.innerHTML = html;
    }
    i.addEventListener('input', draw); draw();
  };

  /* Storage tank breathing and filling losses */
  M['breathing'] = function (fig) {
    const c = C(), S = { tol: ['Toluene', 6.95087, 1342.31, 219.187, 92.14, 90], meoh: ['Methanol', 8.08097, 1582.27, 239.7, 32.04, 35], ace: ['Acetone', 7.11714, 1210.595, 229.664, 58.08, 80], mdc: ['MDC', 7.0803, 1138.91, 231.45, 84.93, 70] };
    const svg = el('svg', { viewBox: '0 0 640 170', role: 'img', 'aria-label': 'Annual solvent loss from tank filling with and without controls' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Solvent <select aria-label="Solvent">${Object.keys(S).map(k => `<option value="${k}">${S[k][0]}</option>`).join('')}</select></label>
      <label>Tank temperature <input type="range" min="15" max="45" step="1" value="30" aria-label="Tank temperature"> <output></output></label>
      <label>Filled per month <input type="range" min="10" max="500" step="10" value="100" aria-label="Volume filled per month in cubic metres"> <output></output></label>`);
    const sel = ctl.querySelector('select'), [it, iv] = ctl.querySelectorAll('input'), [ot, ov] = ctl.querySelectorAll('output'), rd = readout(fig);
    const pv = (s, T) => Math.pow(10, s[1] - s[2] / (s[3] + T)) * 133.322;
    function draw() {
      const s = S[sel.value], T = +it.value, V = +iv.value; ot.textContent = T + ' °C'; ov.textContent = V + ' m³';
      const kgm3 = (Tv, Tg) => pv(s, Tv) / (8.314 * (Tg + 273.15)) * s[4] / 1000, base = V * 12 * kgm3(T, T), cond = V * 12 * kgm3(5, 5) * Math.min(1, 1), bal = base * 0.05;
      svg.innerHTML = ''; const mx = Math.max(base, 1);
      [['Vent to air (or N₂ blanket)', base, c.rust], ['Vent condenser at 5 °C', Math.min(cond, base), c.blue], ['Vapour balancing to tanker', bal, c.green]].forEach((r, n) => { const y = 16 + n * 44, w = r[1] / mx * 330;
        txt(svg, 10, y + 16, r[0], { fill: c.ink, 'font-size': 12 }); el('rect', { x: 200, y: y + 2, width: Math.max(2, w), height: 22, rx: 4, fill: r[2] }, svg); txt(svg, 206 + w, y + 18, F(r[1], 0) + ' kg/yr', { fill: c.ink, 'font-weight': 700, 'font-size': 12 }); });
      txt(svg, 200, 158, 'Filling losses only; breathing from day–night heating adds more', { fill: c.mute, 'font-size': 11 });
      rd.innerHTML = `<div><span>Vapour pressure at ${T} °C</span><b>${F(pv(s, T) / 1000, 1)} kPa</b></div><div class="hi"><span>Lost by venting</span><b>${F(base, 0)} kg/yr (≈ ₹${F(base * s[5] / 1e5, 2)} lakh)</b></div><div><span>Solvent in each m³ of vented gas</span><b>${F(kgm3(T, T), 3)} kg</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  /* DP flow measurement: square-root relationship and turndown */
  M['dpflow'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 260', role: 'img', 'aria-label': 'Differential pressure against flow for an orifice plate' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Flow, % of range <input type="range" min="5" max="100" step="1" value="30" aria-label="Flow percent of range"> <output></output></label>`);
    const i = ctl.querySelector('input'), o = ctl.querySelector('output'), rd = readout(fig);
    function draw() {
      const q = +i.value; o.textContent = q + ' %'; svg.innerHTML = '';
      const { X, Y } = axes(svg, { x0: 60, y0: 12, w: 540, h: 200, xmax: 100, ymax: 100, xstep: 20, ystep: 20, xlab: 'Flow (% of range)', ylab: 'Differential pressure (% of span)' });
      el('path', { d: path(Array.from({ length: 101 }, (_, k) => [X(k), Y(k * k / 100)])), fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg);
      const dp = q * q / 100; el('line', { x1: X(q), y1: Y(0), x2: X(q), y2: Y(dp), stroke: c.mute, 'stroke-dasharray': '4 4' }, svg); el('line', { x1: X(0), y1: Y(dp), x2: X(q), y2: Y(dp), stroke: c.mute, 'stroke-dasharray': '4 4' }, svg);
      el('circle', { cx: X(q), cy: Y(dp), r: 7, fill: c.ink, stroke: '#0B1622', 'stroke-width': 2 }, svg);
      const err = 0.5 * 0.1 / dp * 100;
      rd.innerHTML = `<div><span>DP signal</span><b>${F(dp, 1)} % of span</b></div><div class="hi"><span>Flow error from a ±0.1 % span transmitter</span><b class="${err > 2 ? 'no' : ''}">±${F(err, err < 1 ? 2 : 1)} % of reading</b></div><div><span>Magnetic or Coriolis meter</span><b>about ±0.2–0.5 % of reading</b></div>`;
    }
    i.addEventListener('input', draw); draw();
  };

  /* PID loop on a first-order-plus-dead-time process */
  M['pid'] = function (fig) {
    const c = C(), K = 1, tau = 10, th = 2;
    const svg = el('svg', { viewBox: '0 0 640 260', role: 'img', 'aria-label': 'Process variable response to a set point step under PID control' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Gain, Kc <input type="range" min="0.2" max="6" step="0.1" value="1" aria-label="Controller gain"> <output></output></label>
      <label>Integral time, Ti <input type="range" min="1" max="40" step="1" value="5" aria-label="Integral time in minutes"> <output></output></label>
      <label>Derivative time, Td <input type="range" min="0" max="4" step="0.25" value="0" aria-label="Derivative time in minutes"> <output></output></label><button type="button">Use IMC tuning</button>`);
    const [ik, ii, id] = ctl.querySelectorAll('input'), [ok, oi, od] = ctl.querySelectorAll('output'), rd = readout(fig);
    function draw() {
      const Kc = +ik.value, Ti = +ii.value, Td = +id.value; ok.textContent = Kc.toFixed(1); oi.textContent = Ti + ' min'; od.textContent = Td + ' min';
      const dt = 0.02, tm = 60, n = Math.round(tm / dt), buf = new Array(Math.round(th / dt)).fill(0); let y = 0, I = 0, ePrev = 0, pts = [], mx = 0, iae = 0, settle = 0;
      for (let k = 0; k <= n; k++) { const t = k * dt, sp = t >= 2 ? 1 : 0, e = sp - y; I += e * dt; const D = k ? (e - ePrev) / dt : 0; ePrev = e;
        let u = Kc * (e + I / Ti + Td * D); u = Math.max(-5, Math.min(5, u)); buf.push(u); const ud = buf.shift(); y += dt * (K * ud - y) / tau;
        if (k % 10 === 0) pts.push([t, y]); if (t > 2) { mx = Math.max(mx, y); iae += Math.abs(e) * dt; if (Math.abs(e) > 0.05) settle = t; } }
      svg.innerHTML = ''; const { X, Y } = axes(svg, { x0: 60, y0: 12, w: 540, h: 200, xmax: 60, ymax: 2, xstep: 10, ystep: 0.5, ydec: 1, xlab: 'Time (min)', ylab: 'Process variable' });
      el('path', { d: `M${X(0)} ${Y(0)} H${X(2)} V${Y(1)} H${X(60)}`, fill: 'none', stroke: c.mute, 'stroke-dasharray': '5 4', 'stroke-width': 2 }, svg);
      el('path', { d: path(pts.map(p => [X(p[0]), Y(Math.max(-0.0, Math.min(2, p[1])))])), fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg);
      const os = Math.max(0, (mx - 1) * 100), unstable = Math.abs(pts[pts.length - 1][1] - 1) > 0.2;
      rd.innerHTML = `<div class="hi"><span>Overshoot</span><b class="${os > 25 || unstable ? 'no' : ''}">${unstable ? 'Unstable / oscillating' : F(os, 0) + ' %'}</b></div><div><span>Settling time (±5 %)</span><b>${unstable ? '–' : F(settle - 2, 1) + ' min'}</b></div><div><span>Process</span><b>gain 1, τ 10 min, dead time 2 min</b></div>`;
    }
    ctl.addEventListener('input', draw);
    ctl.querySelector('button').addEventListener('click', () => { ik.value = (tau / (K * (th + th))).toFixed(1); ii.value = tau; id.value = 0; draw(); });
    draw();
  };

  /* Materials of construction selector */
  M['matsel'] = function (fig) {
    const c = C(), MAT = ['Carbon steel', 'SS316L', 'Hastelloy C-276', 'Titanium', 'Glass-lined', 'PTFE-lined'];
    const E = {
      hcl: ['Hydrochloric acid', [0, 0, 1, 1, 2, 2], 'SS pits and cracks rapidly in HCl. Hastelloy C-276 handles dilute HCl at moderate temperature; titanium only dilute and cold. Glass and PTFE are the standard answers.'],
      h2so4: ['Dilute sulphuric acid', [0, 1, 2, 1, 2, 2], 'Dilute H₂SO₄ is aggressive to carbon steel; SS316L is limited to low concentration and temperature. Strong (above about 93 %) acid at ambient is handled in carbon steel tanks, which is a different case.'],
      naoh: ['Hot caustic (NaOH, above 60 °C)', [1, 1, 2, 1, 0, 2], 'Hot alkali dissolves glass, so glass-lined vessels must not see hot caustic. Carbon steel suffers caustic cracking when hot unless stress-relieved; nickel alloys are best.'],
      cl: ['Chlorides in warm water', [1, 0, 2, 2, 2, 2], 'Chlorides cause pitting and stress-corrosion cracking in SS316L above about 50–60 °C. Titanium and Hastelloy resist them well.'],
      hno3: ['Nitric acid', [0, 2, 1, 2, 2, 2], 'An oxidising acid: stainless steel (especially 304L) and titanium do well. Nickel-molybdenum alloys like C-276 are not the first choice.'],
      hf: ['Hydrofluoric acid', [1, 0, 1, 0, 0, 2], 'HF attacks glass and titanium. Fluoropolymer linings are the safe choice; Monel and carbon steel are used for anhydrous HF under specialist guidance.'],
      org: ['Neutral organic solvents', [2, 2, 2, 2, 2, 2], 'Most materials are fine. The question becomes static (non-conductive linings), cleaning and contamination, and the elastomers in gaskets and seals.'],
    };
    const ctl = controls(fig, Object.keys(E).map((k, i) => `<button type="button" data-e="${k}" aria-pressed="${i === 0}">${E[k][0]}</button>`).join(''));
    const svg = el('svg', { viewBox: '0 0 640 120', role: 'img', 'aria-label': 'Suitability of six materials for the chosen service' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const info = document.createElement('div'); info.className = 'art-read'; info.style.gridTemplateColumns = '1fr'; fig.insertBefore(info, fig.querySelector('figcaption'));
    const R = [['Not suitable', c.rust], ['Limited: check data', c.brass], ['Generally suitable', c.green]];
    function draw(k) {
      svg.innerHTML = ''; E[k][1].forEach((r, n) => { const x = 10 + n * 105; el('rect', { x, y: 10, width: 98, height: 60, rx: 8, fill: R[r][1], opacity: .9 }, svg); txt(svg, x + 49, 36, MAT[n], { 'text-anchor': 'middle', fill: '#0B1622', 'font-weight': 700, 'font-size': 11 }); txt(svg, x + 49, 54, ['✕', '?', '✓'][r], { 'text-anchor': 'middle', fill: '#0B1622', 'font-weight': 700, 'font-size': 14 }); });
      R.forEach((r, n) => { el('rect', { x: 10 + n * 180, y: 90, width: 12, height: 12, rx: 2, fill: r[1] }, svg); txt(svg, 28 + n * 180, 101, r[0], { fill: c.ink, 'font-size': 11 }); });
      info.innerHTML = `<div class="hi"><span>${E[k][0]}</span><b style="font:400 .95rem var(--f-sans);line-height:1.5">${E[k][2]} Always confirm with corrosion data for the exact concentration, temperature and impurities.</b></div>`;
      ctl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.e === k));
    }
    ctl.addEventListener('click', e => { const b = e.target.closest('button[data-e]'); if (b) draw(b.dataset.e); }); draw('hcl');
  };

  /* ETP: COD through the treatment stages */
  M['etp'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 245', role: 'img', 'aria-label': 'COD after each treatment stage against the discharge limit' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Inlet COD <input type="range" min="2000" max="20000" step="500" value="6000" aria-label="Inlet COD in mg per litre"> <output></output></label>
      <label>BOD/COD ratio <input type="range" min="0.1" max="0.6" step="0.05" value="0.4" aria-label="BOD to COD ratio"> <output></output></label>`);
    const [ic, ib] = ctl.querySelectorAll('input'), [oc, ob] = ctl.querySelectorAll('output'), rd = readout(fig);
    function draw() {
      const cod = +ic.value, r = +ib.value; oc.textContent = F(cod, 0) + ' mg/L'; ob.textContent = r.toFixed(2);
      const bio = Math.min(0.95, r / 0.65), s1 = cod * 0.85, s2 = s1 * (1 - 0.9 * bio), s3 = s2 * 0.5, st = [['Inlet', cod], ['After primary', s1], ['After biological', s2], ['After tertiary', s3]];
      svg.innerHTML = ''; const H = 170, Yl = v => 20 + H - Math.log10(Math.max(v, 10)) / Math.log10(30000) * H;
      [100, 250, 1000, 10000].forEach(v => { el('line', { x1: 80, y1: Yl(v), x2: 620, y2: Yl(v), stroke: v === 250 ? c.green : c.grid, 'stroke-width': v === 250 ? 2 : 1, 'stroke-dasharray': v === 250 ? '6 5' : '' }, svg); txt(svg, 72, Yl(v) + 4, F(v, 0), { 'text-anchor': 'end', fill: v === 250 ? c.green : c.mute, 'font-size': 11 }); });
      txt(svg, 620, 234, 'dashed line: typical discharge limit, 250 mg/L COD', { 'text-anchor': 'end', fill: c.green, 'font-size': 11 });
      st.forEach((s, k) => { const x = 110 + k * 130, y = Yl(s[1]); el('rect', { x, y, width: 80, height: 20 + H - y, rx: 4, fill: k === 3 ? (s[1] <= 250 ? c.green : c.rust) : c.blue }, svg); txt(svg, x + 40, y - 6, F(s[1], 0), { 'text-anchor': 'middle', fill: c.ink, 'font-weight': 700, 'font-size': 12 }); txt(svg, x + 40, 210, s[0], { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); });
      txt(svg, 20, 120, 'COD, mg/L (log)', { fill: c.mute, 'font-size': 10, transform: 'rotate(-90 20 120)', 'text-anchor': 'middle' });
      rd.innerHTML = `<div><span>Biodegradable share (approx.)</span><b>${F(bio * 100, 0)} %</b></div><div class="hi"><span>Final COD</span><b class="${s3 > 250 ? 'no' : ''}">${F(s3, 0)} mg/L</b></div><div><span>Verdict</span><b>${s3 <= 250 ? 'Meets the limit' : 'Segregate high-COD streams to MEE/incineration'}</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  /* Stokes settling: droplet size vs settling time, lab vs plant */
  M['settle'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 170', role: 'img', 'aria-label': 'Time for droplets to settle across a lab flask and a plant reactor' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Droplet size <input type="range" min="1" max="3" step="0.05" value="2" aria-label="Droplet size, logarithmic"> <output></output></label>
      <label>Density difference <input type="range" min="20" max="400" step="10" value="130" aria-label="Density difference in kg per cubic metre"> <output></output></label>
      <label>Viscosity <input type="range" min="0.5" max="10" step="0.5" value="1" aria-label="Continuous phase viscosity in centipoise"> <output></output></label>`);
    const [id, ir, iv] = ctl.querySelectorAll('input'), [od, or, ov] = ctl.querySelectorAll('output'), rd = readout(fig);
    const fmt = s => s < 120 ? F(s, 0) + ' s' : s < 7200 ? F(s / 60, 0) + ' min' : F(s / 3600, 1) + ' h';
    function draw() {
      const d = Math.pow(10, +id.value) * 1e-6, dr = +ir.value, mu = +iv.value / 1000; od.textContent = F(d * 1e6, 0) + ' µm'; or.textContent = dr + ' kg/m³'; ov.textContent = iv.value + ' cP';
      const v = 9.81 * d * d * dr / (18 * mu), tl = 0.1 / v, tp = 1.5 / v;
      svg.innerHTML = ''; const X = s => 160 + Math.log10(Math.max(s, 1)) / Math.log10(86400 * 3) * 450;
      [1, 60, 3600, 86400].forEach((s, k) => { el('line', { x1: X(s), y1: 10, x2: X(s), y2: 110, stroke: c.grid }, svg); txt(svg, X(s), 126, ['1 s', '1 min', '1 h', '1 day'][k], { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); });
      [['Lab flask, 10 cm', tl, c.blue], ['Plant reactor, 1.5 m', tp, c.brass]].forEach((r, n) => { const y = 22 + n * 44; txt(svg, 10, y + 16, r[0], { fill: c.ink, 'font-size': 12 }); el('rect', { x: 160, y, width: Math.max(2, X(r[1]) - 160), height: 24, rx: 4, fill: r[2] }, svg); txt(svg, Math.min(X(r[1]) + 6, 590), y + 17, fmt(r[1]), { fill: c.ink, 'font-weight': 700, 'font-size': 12 }); });
      txt(svg, 385, 150, 'time to settle (log scale)', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      rd.innerHTML = `<div><span>Settling velocity (Stokes)</span><b>${v > 1e-3 ? F(v * 1000, 2) + ' mm/s' : F(v * 1e6, 1) + ' µm/s'}</b></div><div><span>Lab, 10 cm</span><b>${fmt(tl)}</b></div><div class="hi"><span>Plant, 1.5 m</span><b class="${tp > 7200 ? 'no' : ''}">${fmt(tp)}</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  /* Gas-liquid mass transfer vs kinetics in hydrogenation */
  M['kla'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 170', role: 'img', 'aria-label': 'Hydrogen uptake rate limited by mass transfer or by the catalyst' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Hydrogen pressure <input type="range" min="1" max="20" step="0.5" value="5" aria-label="Hydrogen pressure in bar"> <output></output></label>
      <label>kLa <input type="range" min="-2" max="0" step="0.05" value="-1" aria-label="kLa, logarithmic"> <output></output></label>
      <label>Catalyst-limited rate <input type="range" min="1" max="40" step="1" value="12" aria-label="Kinetic rate in mol per litre per hour"> <output></output></label>`);
    const [ip, ik, ir] = ctl.querySelectorAll('input'), [op, ok, or] = ctl.querySelectorAll('output'), rd = readout(fig);
    function draw() {
      const P = +ip.value, kla = Math.pow(10, +ik.value), rk = +ir.value; op.textContent = P + ' bar'; ok.textContent = F(kla, 3) + ' /s'; or.textContent = rk + ' mol/L·h';
      const rmt = kla * 0.004 * P * 3600, r = 1 / (1 / rmt + 1 / rk), t = 3 / r;
      svg.innerHTML = ''; const mx = Math.max(rmt, rk, 1), sc = 380 / mx;
      [['Mass transfer capacity', rmt, c.blue], ['Catalyst (kinetic) capacity', rk, c.green], ['Actual uptake rate', r, c.brass]].forEach((b, n) => { const y = 12 + n * 40, w = b[1] * sc; txt(svg, 10, y + 16, b[0], { fill: c.ink, 'font-size': 12 }); el('rect', { x: 190, y, width: Math.max(2, w), height: 24, rx: 4, fill: b[2] }, svg); txt(svg, 196 + w, y + 17, F(b[1], 1) + ' mol/L·h', { fill: c.ink, 'font-weight': 700, 'font-size': 12 }); });
      txt(svg, 190, 160, 'Typical kLa: lab autoclave 0.1–1 /s; plant hydrogenator 0.02–0.2 /s', { fill: c.mute, 'font-size': 11 });
      const lim = rmt < rk * 0.7 ? 'Mass transfer: improve agitation, pressure or gas dispersion' : rk < rmt * 0.7 ? 'Catalyst / kinetics: more catalyst or higher temperature' : 'Both matter';
      rd.innerHTML = `<div class="hi"><span>What limits the rate</span><b>${lim}</b></div><div><span>Time to take up 3 mol/L H₂</span><b>${t < 1 ? F(t * 60, 0) + ' min' : F(t, 1) + ' h'}</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  /* Solvent swap: put-and-take vs concentrate-then-constant-volume distillation */
  M['swap'] = function (fig) {
    const c = C(), a = 3.5;
    const svg = el('svg', { viewBox: '0 0 640 260', role: 'img', 'aria-label': 'Old solvent remaining against new solvent used for two swap methods' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Minimum stirrable volume <input type="range" min="30" max="80" step="5" value="50" aria-label="Minimum volume as percent of batch volume"> <output></output></label>`);
    const i = ctl.querySelector('input'), o = ctl.querySelector('output'), rd = readout(fig);
    const y = x => a * x / (1 + (a - 1) * x);
    function rayleigh(x0, frac) { let L = 1, x = x0; const dL = 0.0005; while (L > frac + 1e-9) { const yy = y(x); x = (L * x - yy * dL) / (L - dL); L -= dL; if (x < 0) { x = 0; break; } } return x; }
    function draw() {
      const m = +i.value / 100; o.textContent = Math.round(m * 100) + ' %'; svg.innerHTML = '';
      const { X, Y } = axes(svg, { x0: 70, y0: 12, w: 520, h: 200, xmax: 3, ymax: 4, xstep: 0.5, ystep: 1, xlab: 'New solvent used (batch volumes)', ylab: 'Old solvent left (% of batch, log)' });
      svg.querySelectorAll('text').forEach(n => { if (n.getAttribute('text-anchor') === 'end' && /^\d$/.test(n.textContent)) n.textContent = ['0.01', '0.1', '1', '10', '100'][+n.textContent]; if (n.getAttribute('text-anchor') === 'middle' && /^[0-3]$/.test(n.textContent) && +n.getAttribute('y') > 220) {} });
      const xl = [0, 0.5, 1, 1.5, 2, 2.5, 3]; let k = 0; svg.querySelectorAll('text[text-anchor="middle"]').forEach(n => { if (+n.getAttribute('y') === 12 + 200 + 16 && k < xl.length) n.textContent = xl[k++]; });
      const LY = p => Y(Math.log10(Math.max(p, 0.01)) + 2), x1 = rayleigh(1, m), a1 = x1 * m * 100;
      let x = x1, D = 0, usedCV = null; const cv = [[X(1 - m), LY(a1)]];
      while (D < 3) { x -= y(x) * 0.001 / m; D += 0.001; const u = D + 1 - m; if (u <= 3) cv.push([X(u), LY(x * m * 100)]); if (usedCV === null && x * m <= 0.01) usedCV = u; }
      el('path', { d: path(cv), fill: 'none', stroke: c.blue, 'stroke-width': 3 }, svg);
      let amt = 100, u = 0, n = 0, usedPT = null, xp = 1; const pt = [[X(0), LY(100)]];
      while (u < 3 - 1e-9 && n < 20) { xp = rayleigh(xp, m); const na = xp * m * 100; u += 1 - m; n++; pt.push([X(Math.min(u, 3)), LY(amt)]); pt.push([X(Math.min(u, 3)), LY(na)]); amt = na; xp = xp * m; if (usedPT === null && amt <= 1) { usedPT = u; break; } }
      el('path', { d: path(pt), fill: 'none', stroke: c.brass, 'stroke-width': 3 }, svg);
      el('line', { x1: X(0), y1: LY(1), x2: X(3), y2: LY(1), stroke: c.green, 'stroke-dasharray': '6 5', 'stroke-width': 2 }, svg); txt(svg, X(3), LY(1) - 6, 'target 1 %', { 'text-anchor': 'end', fill: c.green, 'font-size': 11 });
      [[c.brass, 'Put-and-take (distil down, refill, repeat)'], [c.blue, 'Concentrate, then constant volume']].forEach((l, j) => { el('rect', { x: 300, y: 24 + j * 18, width: 14, height: 4, fill: l[0] }, svg); txt(svg, 320, 29 + j * 18, l[1], { fill: c.ink, 'font-size': 11 }); });
      rd.innerHTML = `<div><span>Put-and-take, to 1 %</span><b>${usedPT ? F(usedPT, 2) + ' volumes, ' + n + ' chases' : 'over 3 volumes'}</b></div><div class="hi"><span>Constant volume at minimum, to 1 %</span><b>${usedCV ? F(usedCV, 2) + ' volumes' : 'over 3 volumes'}</b></div><div><span>Assumes</span><b>relative volatility 3.5, no azeotrope</b></div>`;
    }
    i.addEventListener('input', draw); draw();
  };

  /* Flow reactor: residence time, throughput and area per volume */
  M['flowres'] = function (fig) {
    const c = C();
    const svg = el('svg', { viewBox: '0 0 640 150', role: 'img', 'aria-label': 'Heat transfer area per volume of a tube reactor compared with batch reactors' });
    fig.insertBefore(svg, fig.querySelector('figcaption'));
    const ctl = controls(fig, `<label>Tube inner diameter <input type="range" min="1" max="25" step="1" value="6" aria-label="Tube inner diameter in mm"> <output></output></label>
      <label>Tube length <input type="range" min="2" max="200" step="2" value="40" aria-label="Tube length in metres"> <output></output></label>
      <label>Flow <input type="range" min="1" max="1000" step="1" value="100" aria-label="Flow in mL per minute"> <output></output></label>`);
    const [idd, il, iq] = ctl.querySelectorAll('input'), [od, ol, oq] = ctl.querySelectorAll('output'), rd = readout(fig);
    function draw() {
      const d = +idd.value / 1000, L = +il.value, q = +iq.value; od.textContent = idd.value + ' mm'; ol.textContent = L + ' m'; oq.textContent = q + ' mL/min';
      const V = Math.PI * d * d / 4 * L * 1000, tau = V * 1000 / q, av = 4 / d, kgd = q / 1000 * 0.5 * 250 / 1000 * 1440, v = q / 60e6 / (Math.PI * d * d / 4), Re = 1000 * v * d / 0.001;
      svg.innerHTML = ''; const X = x => 200 + Math.log10(x) / 4 * 400;
      [1, 10, 100, 1000, 10000].forEach(x => { el('line', { x1: X(x), y1: 8, x2: X(x), y2: 110, stroke: c.grid }, svg); txt(svg, X(x), 126, F(x, 0), { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 }); });
      txt(svg, 400, 144, 'Heat transfer area per volume (m²/m³, log)', { 'text-anchor': 'middle', fill: c.mute, 'font-size': 11 });
      [['6 kL batch reactor', 2.2, c.mute], ['1 L lab flask', 50, c.blue], ['This tube', av, c.brass]].forEach((r, n) => { const y = 12 + n * 32; txt(svg, 10, y + 15, r[0], { fill: c.ink, 'font-size': 12 }); el('rect', { x: 200, y, width: Math.max(2, X(r[1]) - 200), height: 22, rx: 4, fill: r[2] }, svg); txt(svg, X(r[1]) + 6, y + 16, F(r[1], 0), { fill: c.ink, 'font-weight': 700, 'font-size': 12 }); });
      rd.innerHTML = `<div><span>Reactor volume</span><b>${F(V, V < 1 ? 2 : 1)} L</b></div><div class="hi"><span>Residence time</span><b>${tau < 1 ? F(tau * 60, 0) + ' s' : F(tau, 1) + ' min'}</b></div><div><span>Output at 0.5 mol/L, MW 250</span><b>${F(kgd, 1)} kg/day</b></div><div><span>Reynolds number</span><b>${F(Re, 0)} (${Re < 2300 ? 'laminar' : 'turbulent'})</b></div>`;
    }
    ctl.addEventListener('input', draw); draw();
  };

  window.PCME_ART = M;
  document.querySelectorAll('.art-fig[data-fig]').forEach(f => { const m = M[f.dataset.fig]; if (m) try { m(f); } catch (e) { console.error(e); } });
  // pause looping diagrams when off screen
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('paused', !e.isIntersecting)), { rootMargin: '100px' });
    document.querySelectorAll('.art-fig').forEach(f => io.observe(f));
  }
})();
