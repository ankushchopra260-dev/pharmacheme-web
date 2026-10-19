/* PharmaChemE GATE: animated explanations for solutions and formula sheets.
   GATE_ANIM.mount(el, key) builds an SVG timeline with play / pause, replay and a scrubber.
   GATE_ANIM.pick(q) returns the animation key for a bank question (or null).
   Elements with data-anim="key" are mounted automatically. SI units throughout (GATE convention). */
(function () {
  'use strict';
  const C = { brass: '#C9A227', blue: '#5B9BFF', green: '#5FD07A', rust: '#E0785A', violet: '#B38CFF', mute: '#7F95AB', paper: '#ECE7D8', grid: '#1D3752', deep: '#0E1B2A' };
  const W = 400, H = 240;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (p, a, b) => cl((p - a) / (b - a), 0, 1);
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const fx = (n, d) => Number(n).toFixed(d);
  const r1 = n => Math.round(n * 10) / 10;
  const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- SVG helpers (return markup strings) ---------- */
  const ln = (x1, y1, x2, y2, c, w, ex) => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c || C.mute}" stroke-width="${w || 1.5}"${ex ? ' ' + ex : ''}/>`;
  const dash = (x1, y1, x2, y2, c) => ln(x1, y1, x2, y2, c || C.mute, 1, 'stroke-dasharray="4 3"');
  const tx = (x, y, s, c, o) => { o = o || {}; return `<text x="${r1(x)}" y="${r1(y)}" fill="${c || C.paper}" font-size="${o.size || 11}" text-anchor="${o.a || 'start'}"${o.b ? ' font-weight="700"' : ''}${o.op != null ? ` opacity="${fx(o.op, 2)}"` : ''}>${s}</text>`; };
  const rc = (x, y, w, h, fill, stroke, ex) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(0, w))}" height="${r1(Math.max(0, h))}" fill="${fill || 'none'}"${stroke ? ` stroke="${stroke}"` : ''}${ex ? ' ' + ex : ''}/>`;
  const ci = (x, y, r, fill, stroke, ex) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="${fill || 'none'}"${stroke ? ` stroke="${stroke}" stroke-width="1.5"` : ''}${ex ? ' ' + ex : ''}/>`;
  const pl = (pts, c, w, fill, ex) => pts.length < 2 ? '' : `<path d="M${pts.map(q => r1(q[0]) + ' ' + r1(q[1])).join('L')}${fill ? 'Z' : ''}" fill="${fill || 'none'}" stroke="${c || 'none'}" stroke-width="${w || 2}" stroke-linejoin="round"${ex ? ' ' + ex : ''}/>`;
  function arr(x1, y1, x2, y2, c, w) {
    const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1); if (L < 2) return '';
    const h = Math.min(8, L * 0.6) + (w || 2), bx = x2 - h * Math.cos(a), by = y2 - h * Math.sin(a), s = h * 0.5;
    return ln(x1, y1, bx, by, c, w || 2) + pl([[x2, y2], [bx + s * Math.sin(a), by - s * Math.cos(a)], [bx - s * Math.sin(a), by + s * Math.cos(a)]], 'none', 0, c || C.mute);
  }
  // point at fraction t along a polyline
  function along(pts, t) {
    let tot = 0; const L = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let d = cl(t, 0, 1) * tot; for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) { const f = L[i] ? d / L[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } d -= L[i]; }
    return pts[0];
  }
  // moving dots along a path; p drives the phase, on = visibility 0..1
  function flow(pts, p, c, n, speed, on) {
    if (!on) return ''; let s = ''; n = n || 5;
    for (let i = 0; i < n; i++) { const t = ((p * (speed || 6)) + i / n) % 1; const q = along(pts, t); s += ci(q[0], q[1], 2.6, c, null, `opacity="${fx(on, 2)}"`); }
    return s;
  }
  function axes(o) {
    const X = v => o.x + (v - o.xr[0]) / (o.xr[1] - o.xr[0]) * o.w, Y = v => o.y + o.h - (v - o.yr[0]) / (o.yr[1] - o.yr[0]) * o.h;
    let s = '';
    (o.yt || []).forEach(v => { s += ln(o.x, Y(v), o.x + o.w, Y(v), C.grid, 1) + tx(o.x - 6, Y(v) + 3.5, o.yf ? o.yf(v) : v, C.mute, { a: 'end', size: 10 }); });
    (o.xt || []).forEach(v => { s += ln(X(v), o.y + o.h, X(v), o.y + o.h + 4, C.mute, 1) + tx(X(v), o.y + o.h + 15, o.xf ? o.xf(v) : v, C.mute, { a: 'middle', size: 10 }); });
    s += ln(o.x, o.y + o.h, o.x + o.w, o.y + o.h, C.mute, 1) + ln(o.x, o.y, o.x, o.y + o.h, C.mute, 1);
    if (o.xl) s += tx(o.x + o.w, o.y + o.h + 29, o.xl, C.mute, { a: 'end', size: 10 });
    if (o.yl) s += tx(o.x + 6, o.y - 5, o.yl, C.mute, { size: 10 });
    const curve = (g, a, b, n) => { const pts = []; n = n || 90; for (let i = 0; i <= n; i++) { const v = a + (b - a) * i / n; pts.push([X(v), Y(g(v))]); } return pts; };
    return { X, Y, s, curve };
  }
  const AX = (xr, yr, ex) => Object.assign({ x: 50, y: 22, w: 320, h: 170, xr, yr }, ex || {});
  const pill = (x, y, s, c) => { const w = s.replace(/<[^>]+>|&[a-z]+;/g, 'x').length * 6.1 + 14; return rc(x - w / 2, y - 12, w, 18, C.deep, c, 'rx="9"') + tx(x, y + 1.5, s, c, { a: 'middle', size: 11, b: 1 }); };

  /* ---------- animations ---------- */
  const A = {};

  A.newton = {
    t: 'Newton–Raphson: follow the tangent to the axis', d: 9000,
    s: [[0, 'f(x) = x² − 2. The root is where the curve crosses zero.'], [0.16, 'Start at x₀ = 1: f(1) = −1 and the slope f′(1) = 2x = 2.'], [0.3, 'Slide down the tangent to the x-axis: x₁ = 1 − (−1)/2 = 1.5.'], [0.52, 'At x₁ = 1.5: f = 0.25 and the slope is 3.'], [0.64, 'Next tangent: x₂ = 1.5 − 0.25/3 = 1.4167.'], [0.84, 'Exact root √2 = 1.4142. Each step roughly doubles the correct digits.']],
    draw(p) {
      const a = axes(AX([0.9, 2.0], [-1.25, 2.1], { xt: [1, 1.25, 1.5, 1.75, 2], yt: [-1, 0, 1, 2], xl: 'x', yl: 'f(x) = x² − 2' })), f = x => x * x - 2;
      let s = a.s + ln(a.X(0.9), a.Y(0), a.X(2), a.Y(0), C.paper, 1, 'opacity=".55"');
      s += pl(a.curve(f, 0.9, 0.9 + 1.1 * ease(seg(p, 0, 0.14))), C.blue, 2.4);
      const tan = (x0, t) => { const y0 = f(x0), x1 = x0 - y0 / (2 * x0), q = ease(t); return arr(a.X(x0), a.Y(y0), a.X(x0 + (x1 - x0) * q), a.Y(y0 * (1 - q)), C.brass, 2); };
      if (p >= 0.16) s += ci(a.X(1), a.Y(-1), 4.5, C.brass) + tx(a.X(1) + 8, a.Y(-1) + 4, 'x₀ = 1', C.brass, { b: 1 });
      if (p >= 0.3) s += tan(1, seg(p, 0.3, 0.44));
      if (p >= 0.44) s += ci(a.X(1.5), a.Y(0), 3.5, C.paper) + tx(a.X(1.5), a.Y(0) + 15, '1.5', C.paper, { a: 'middle' });
      if (p >= 0.52) s += dash(a.X(1.5), a.Y(0), a.X(1.5), a.Y(0.25), C.mute) + ci(a.X(1.5), a.Y(0.25), 4.5, C.brass) + tx(a.X(1.5) - 8, a.Y(0.25) - 7, 'x₁', C.brass, { a: 'end', b: 1 });
      if (p >= 0.64) s += tan(1.5, seg(p, 0.64, 0.78));
      if (p >= 0.78) s += ci(a.X(1.41667), a.Y(0), 4.5, C.green) + tx(a.X(1.41667) - 6, a.Y(0) - 9, 'x₂ = 1.4167', C.green, { a: 'end', b: 1 });
      if (p >= 0.84) s += pill(300, 52, '√2 = 1.4142', C.green);
      return s;
    }
  };

  A.trapz = {
    t: 'Trapezoidal rule: straight tops on a curved area', d: 9000,
    s: [[0, 'Area under y = eˣ from 0 to 1. Split it into two strips, h = 0.5.'], [0.16, 'Strip 1: (h/2)[f(0) + f(0.5)] = 0.25 × (1 + 1.6487) = 0.662'], [0.38, 'Strip 2: (h/2)[f(0.5) + f(1)] = 0.25 × (1.6487 + 2.7183) = 1.092'], [0.6, 'Sum = 1.754. Same as (h/2)[f(0) + 2f(0.5) + f(1)].'], [0.76, 'Exact: e − 1 = 1.718. The straight tops sit above a convex curve, so the rule overestimates.']],
    draw(p) {
      const a = axes(AX([0, 1.05], [0, 3], { xt: [0, 0.5, 1], yt: [0, 1, 2, 3], xl: 'x', yl: 'y = eˣ' })), f = Math.exp;
      let s = a.s;
      const trap = (x0, x1, t, c) => { const q = ease(t); return pl([[a.X(x0), a.Y(0)], [a.X(x0), a.Y(f(x0) * q)], [a.X(x1), a.Y(f(x1) * q)], [a.X(x1), a.Y(0)]], c, 1.6, c + '40'); };
      if (p >= 0.16) s += trap(0, 0.5, seg(p, 0.16, 0.3), C.brass) + tx(a.X(0.25), a.Y(0.45), '0.662', C.paper, { a: 'middle', b: 1, op: seg(p, 0.26, 0.32) });
      if (p >= 0.38) s += trap(0.5, 1, seg(p, 0.38, 0.52), C.violet) + tx(a.X(0.75), a.Y(0.45), '1.092', C.paper, { a: 'middle', b: 1, op: seg(p, 0.48, 0.54) });
      s += pl(a.curve(f, 0, 1.03 * ease(seg(p, 0, 0.14))), C.blue, 2.4);
      if (p >= 0.6) s += pill(130, 50, 'trapezoids 1.754', C.brass);
      if (p >= 0.76) { const pts = a.curve(f, 0, 1, 40); s += pl([[a.X(0), a.Y(0)]].concat(pts, [[a.X(1), a.Y(0)]]), C.green, 1.2, 'none', `stroke-dasharray="3 3" opacity="${fx(seg(p, 0.76, 0.82), 2)}"`) + pill(130, 76, 'exact 1.718', C.green); }
      return s;
    }
  };

  // first-order curves: exponential decay / rise
  function expAnim(o) {
    return {
      t: o.t, d: 8500, s: o.s,
      draw(p) {
        const a = axes(AX(o.xr, o.yr, { xt: o.xt, yt: o.yt, xl: o.xl, yl: o.yl })); let s = a.s;
        if (o.fin != null) s += dash(a.X(o.xr[0]), a.Y(o.fin), a.X(o.xr[1]), a.Y(o.fin), C.green) + tx(a.X(o.xr[1]) - 2, a.Y(o.fin) - 5, o.finL, C.green, { a: 'end', size: 10 });
        if (o.step) s += pl([[a.X(o.xr[0]), a.Y(0) - 1], [a.X(0), a.Y(0) - 1], [a.X(0), a.Y(o.step)], [a.X(o.xr[1]), a.Y(o.step)]], C.violet, 1.4, null, 'opacity=".6"') + tx(a.X(o.xr[1] * 0.75), a.Y(o.step) - 5, o.stepL, C.violet, { size: 10 });
        const e = o.xr[0] + (o.xr[1] - o.xr[0]) * ease(seg(p, 0.1, 0.62));
        s += pl(a.curve(o.f, o.xr[0], e), C.blue, 2.4) + ci(a.X(e), a.Y(o.f(e)), 4, C.blue);
        if (p >= 0.66) { const [mx, my] = o.mark, q = seg(p, 0.66, 0.78); s += dash(a.X(mx), a.Y(o.yr[0]), a.X(mx), a.Y(o.yr[0]) + (a.Y(my) - a.Y(o.yr[0])) * q, C.brass); if (q >= 1) s += dash(a.X(mx), a.Y(my), a.X(o.xr[0]), a.Y(my), C.brass) + ci(a.X(mx), a.Y(my), 5, C.brass) + pill(a.X(mx) + o.lx, a.Y(my) + o.ly, o.ml, C.brass); }
        return s;
      }
    };
  }
  A['ode-m9'] = expAnim({ t: 'dy/dx = −2y: exponential decay', xr: [0, 2], yr: [0, 5.5], xt: [0, 0.5, 1, 1.5, 2], yt: [0, 1, 2, 3, 4, 5], xl: 'x', yl: 'y', f: x => 5 * Math.exp(-2 * x), mark: [1, 0.677], ml: 'y(1) = 0.677', lx: 70, ly: -22,
    s: [[0, 'dy/dx = −2y: the slope is always −2 times the current value.'], [0.1, 'Separate and integrate: ln y = −2x + c, so y = 5e^(−2x) with y(0) = 5.'], [0.66, 'At x = 1: y = 5e^(−2) = 0.677.']] });
  A['fo-cn1'] = expAnim({ t: 'First-order step response: 63.2% at one time constant', xr: [0, 5], yr: [0, 1.15], xt: [0, 1, 2, 3, 4, 5], yt: [0, 0.5, 1], xl: 't / τ', yl: 'fraction of final change', f: t => 1 - Math.exp(-t), fin: 1, finL: 'final value', mark: [1, 0.632], ml: '63.2%', lx: 40, ly: 22,
    s: [[0, 'A first-order system after a step: y = 1 − e^(−t/τ).'], [0.1, 'It rises fastest at the start, then slows as it nears the final value.'], [0.66, 'At t = τ: 1 − e^(−1) = 0.632. After 3τ: 95%; after 5τ: 99.3%.']] });
  A['fo-cn2'] = expAnim({ t: 'G(s) = 2/(5s + 1) after a step of 3', xr: [0, 25], yr: [0, 7], xt: [0, 5, 10, 15, 20, 25], yt: [0, 2, 4, 6], xl: 't, s', yl: 'output change', f: t => 6 * (1 - Math.exp(-t / 5)), fin: 6, finL: 'K·M = 6', step: 3, stepL: 'input step M = 3', mark: [5, 3.79], ml: 'y(5) = 3.79', lx: 55, ly: 22,
    s: [[0, 'Input steps by M = 3. The final output change is K·M = 2 × 3 = 6.'], [0.1, 'y(t) = K·M(1 − e^(−t/τ)) with τ = 5 s.'], [0.66, 'At t = 5 s = τ: 6 × (1 − e^(−1)) = 3.79, which is 63.2% of the way.']] });
  A['batch-re2'] = expAnim({ t: 'First-order batch reactor: time for 90% conversion', xr: [0, 40], yr: [0, 1.1], xt: [0, 10, 20, 30, 40], yt: [0, 0.5, 1], xl: 't, min', yl: 'C_A / C_A0', f: t => Math.exp(-0.1 * t), fin: 0.1, finL: 'X = 0.9', mark: [23.03, 0.1], ml: 't = 23.03 min', lx: 10, ly: -38,
    s: [[0, 'Batch, first order: −dC_A/dt = kC_A, so C_A/C_A0 = e^(−kt) with k = 0.1 min⁻¹.'], [0.1, 'The concentration falls by the same fraction every minute.'], [0.66, '90% conversion leaves C_A/C_A0 = 0.1: t = ln(10)/0.1 = 23.03 min.']] });

  A.underdamped = {
    t: 'Underdamped step response, ζ = 0.5', d: 9000,
    s: [[0, 'Second-order system with ζ = 0.5 (< 1): underdamped, so it overshoots.'], [0.1, 'The response rises past the final value, then rings and settles.'], [0.62, 'Peak at t_p = π/(ωₙ√(1 − ζ²)) = 3.63/ωₙ.'], [0.76, 'Overshoot = exp(−πζ/√(1 − ζ²)) = exp(−1.814) = 0.163. The dashed curve (ζ = 1) never overshoots.']],
    draw(p) {
      const z = 0.5, wd = Math.sqrt(1 - z * z), ph = Math.acos(z), g = t => 1 - Math.exp(-z * t) / wd * Math.sin(wd * t + ph), cr = t => 1 - (1 + t) * Math.exp(-t);
      const a = axes(AX([0, 14], [0, 1.4], { xt: [0, 2, 4, 6, 8, 10, 12, 14], yt: [0, 0.5, 1], xl: 'ωₙt', yl: 'y / final value' })); let s = a.s;
      s += dash(a.X(0), a.Y(1), a.X(14), a.Y(1), C.green);
      const e = 14 * ease(seg(p, 0.1, 0.6));
      s += pl(a.curve(cr, 0, e), C.mute, 1.4, null, 'stroke-dasharray="5 4"') + pl(a.curve(g, 0, e), C.blue, 2.4) + ci(a.X(e), a.Y(g(e)), 4, C.blue);
      if (p >= 0.62) { const tp = Math.PI / wd; s += dash(a.X(tp), a.Y(0), a.X(tp), a.Y(g(tp)), C.brass) + ci(a.X(tp), a.Y(g(tp)), 5, C.brass) + tx(a.X(tp), a.Y(0) - 5, 't_p', C.brass, { a: 'middle', size: 10 }); }
      if (p >= 0.76) { const tp = Math.PI / wd; s += arr(a.X(tp) + 22, a.Y(1), a.X(tp) + 22, a.Y(g(tp)) + 1, C.rust, 1.6) + arr(a.X(tp) + 22, a.Y(g(tp)), a.X(tp) + 22, a.Y(1) - 1, C.rust, 1.6) + pill(a.X(tp) + 88, a.Y(1.08), 'overshoot 0.163', C.rust); }
      return s;
    }
  };

  // recycle loop, optional purge
  function recycleAnim(purge) {
    return {
      t: purge ? 'Purge: the only exit for the inert' : 'Recycle: reactor feed from single-pass conversion', d: 10000,
      s: purge ? [[0, 'Fresh feed 100 mol/h carries 1 mol% inert: 1 mol/h of inert enters.'], [0.22, 'The inert does not react and is not in the product, so it builds up in the recycle loop.'], [0.44, 'It can only leave through the purge, taken from the recycle at the recycle composition.'], [0.66, 'At steady state, inert in = inert out: 100 × 0.01 = P × 0.05.'], [0.82, 'Minimum purge P = 20 mol/h (at the 5% limit). A smaller purge would push the inert above 5%.']]
        : [[0, 'Fresh feed 100 mol/h of A. All unreacted A is recycled, so overall conversion is 100%.'], [0.22, 'Only 25% of the A entering the reactor converts in one pass.'], [0.44, 'All 100 mol/h must react per pass, so 0.25F = 100: reactor feed F = 400 mol/h.'], [0.66, 'The separator sends the 300 mol/h of unreacted A back.'], [0.82, 'Recycle = 400 − 100 = 300 mol/h: three times the fresh feed.']],
      draw(p) {
        let s = ''; const y = 120, on = seg(p, 0, 0.08);
        const feed = [[14, y], [84, y]], rf = [[100, y], [150, y]], ro = [[230, y], [262, y]], prod = [[342, y], [392, y]], rec = [[302, y - 30], [302, 50], [92, 50], [92, y - 16]];
        s += rc(150, y - 30, 80, 60, C.deep, C.blue, 'rx="6"') + tx(190, y - 4, 'Reactor', C.paper, { a: 'middle', b: 1 }) + tx(190, y + 12, 'X = 25%', C.mute, { a: 'middle', size: 10 });
        s += rc(262, y - 30, 80, 60, C.deep, C.violet, 'rx="6"') + tx(302, y - 4, 'Separator', C.paper, { a: 'middle', b: 1 }) + tx(302, y + 12, 'A ↺ / product', C.mute, { a: 'middle', size: 10 });
        s += ci(92, y, 9, C.deep, C.brass) + tx(92, y + 4, '+', C.brass, { a: 'middle', b: 1 });
        s += arr(14, y, 82, y, C.brass, 2) + arr(101, y, 149, y, C.brass, 3.5) + arr(231, y, 261, y, C.blue, 3) + arr(343, y, 392, y, C.green, 2);
        s += pl(rec, C.rust, 2.6) + arr(92, 60, 92, y - 10, C.rust, 2.6);
        s += flow(feed, p, C.brass, 3, 5, on) + flow(rf, p, C.brass, 4, 5, on) + flow(ro, p, C.blue, 3, 5, on) + flow(prod, p, C.green, 3, 5, on) + flow(rec, p, C.rust, 8, 3, on);
        if (purge) { s += arr(200, 50, 200, 16, C.mute, 2) + flow([[200, 50], [200, 18]], p, C.mute, 2, 4, on) + tx(208, 24, 'purge P', C.mute, { size: 10 }); }
        s += tx(14, y - 10, 'fresh 100', C.brass, { size: 10 });
        const op = t => seg(p, t, t + 0.06);
        if (purge) {
          s += tx(14, y + 22, '1% inert', C.brass, { size: 10, op: op(0) });
          s += tx(150, 40, 'inert builds up', C.rust, { size: 10, op: op(0.22) });
          s += tx(320, 40, '≤ 5% inert', C.rust, { size: 10, b: 1, op: op(0.44) });
          if (p >= 0.66) s += pill(200, 200, '1.0 = P × 0.05', C.paper);
          if (p >= 0.82) s += pill(200, 224, 'P = 20 mol/h', C.green);
        } else {
          s += tx(190, y + 48, '25% reacts per pass', C.blue, { a: 'middle', size: 10, op: op(0.22) });
          if (p >= 0.44) s += pill(125, y + 30, 'F = 400', C.brass);
          s += tx(197, 42, 'recycle 300', C.rust, { a: 'middle', b: 1, op: op(0.66) });
          s += tx(392, y - 10, 'product 100', C.green, { a: 'end', size: 10 });
          if (p >= 0.82) s += pill(200, 214, 'R = 400 − 100 = 300 mol/h', C.rust);
        }
        return s;
      }
    };
  }
  A.recycle = recycleAnim(false);
  A.purge = recycleAnim(true);

  A.evaporator = {
    t: 'Evaporator: the salt balance does the work', d: 9000,
    s: [[0, 'Feed: 100 kg/h at 20 wt% NaCl, so 20 kg/h salt and 80 kg/h water.'], [0.25, 'Only water leaves as vapour. The salt all stays in the product.'], [0.5, 'Product at 50 wt% salt: 20 / 0.5 = 40 kg/h.'], [0.72, 'Water evaporated = 100 − 40 = 60 kg/h.']],
    draw(p) {
      let s = ''; const on = seg(p, 0, 0.08), boil = seg(p, 0.25, 0.7);
      s += rc(140, 60, 110, 120, C.deep, C.blue, 'rx="10"');
      const lvl = 160 - 70 * (1 - 0.6 * ease(boil)); s += rc(142, lvl, 106, 178 - lvl, C.blue + '33');
      for (let i = 0; i < 6; i++) { const t = (p * 8 + i / 6) % 1; if (boil > 0 && boil < 1) s += ci(158 + i * 15, lvl - t * 30, 2.2, C.paper, null, `opacity="${fx(1 - t, 2)}"`); }
      s += arr(72, 150, 138, 150, C.brass, 2.4) + flow([[72, 150], [136, 150]], p, C.brass, 3, 5, on) + tx(72, 140, 'feed', C.brass, { size: 10 });
      s += arr(195, 58, 195, 18, C.paper, 2.4) + flow([[195, 58], [195, 20]], p, C.paper, 3, 5, seg(p, 0.25, 0.32)) + tx(205, 26, 'water vapour', C.paper, { size: 10 });
      s += arr(252, 168, 300, 168, C.green, 2.4) + flow([[252, 168], [298, 168]], p, C.green, 2, 5, seg(p, 0.5, 0.56)) + tx(256, 158, 'product', C.green, { size: 10 });
      // stacked bars: salt / water
      const bar = (x, salt, water, lab, op) => { const k = 1.1; return `<g opacity="${fx(op, 2)}">` + rc(x, 200 - salt * k, 26, salt * k, C.brass) + rc(x, 200 - (salt + water) * k, 26, water * k, C.blue + '88') + tx(x + 13, 214, lab, C.mute, { a: 'middle', size: 10 }) + tx(x + 13, 196 - (salt + water) * k, salt + water, C.paper, { a: 'middle', size: 10, b: 1 }) + '</g>'; };
      s += bar(36, 20, 80, 'feed', 1);
      s += bar(320, 20, 80 - 60 * ease(seg(p, 0.5, 0.65)), 'product', seg(p, 0.5, 0.55));
      s += rc(36, 222, 9, 9, C.brass) + tx(49, 230, 'salt', C.mute, { size: 10 }) + rc(80, 222, 9, 9, C.blue + '88') + tx(93, 230, 'water', C.mute, { size: 10 });
      if (p >= 0.72) s += pill(195, 214, 'evaporated 60 kg/h', C.paper);
      return s;
    }
  };

  A.pxy = {
    t: 'Raoult’s law on a P–x–y diagram', d: 9000,
    s: [[0, 'Bubble line: P = x_B P_B + (1 − x_B) P_T, straight from 40 kPa to 100 kPa.'], [0.18, 'Dew line: the vapour composition at each pressure (curved).'], [0.36, 'Liquid at x_B = 0.4: go up to the bubble line, P = 0.4 × 100 + 0.6 × 40 = 64 kPa.'], [0.58, 'Across at 64 kPa to the dew line: the first vapour.'], [0.76, 'y_B = x_B P_B / P = 40 / 64 = 0.625. The vapour is richer in benzene, the lighter component.']],
    draw(p) {
      const a = axes(AX([0, 1], [30, 110], { xt: [0, 0.2, 0.4, 0.6, 0.8, 1], yt: [40, 60, 80, 100], xl: 'x_B, y_B (benzene)', yl: 'P, kPa' }));
      const bub = x => 40 + 60 * x, dewx = y => 1 / (y / 100 + (1 - y) / 40); let s = a.s;
      s += pl(a.curve(bub, 0, ease(seg(p, 0, 0.16))), C.blue, 2.4);
      if (p >= 0.18) { const pts = a.curve(y => dewx(y), 0, ease(seg(p, 0.18, 0.34))); s += pl(pts, C.rust, 2.4); }
      if (p >= 0.2) s += tx(a.X(0.78), a.Y(bub(0.78)) - 8, 'bubble', C.blue, { size: 10, a: 'end' }) + tx(a.X(0.8), a.Y(dewx(0.8)) + 15, 'dew', C.rust, { size: 10 });
      if (p >= 0.36) { const q = seg(p, 0.36, 0.5); s += arr(a.X(0.4), a.Y(30), a.X(0.4), a.Y(30 + 34 * q), C.brass, 1.8); if (q >= 1) s += ci(a.X(0.4), a.Y(64), 4.5, C.brass) + tx(a.X(0.4) - 6, a.Y(64) - 8, '64 kPa', C.brass, { a: 'end', b: 1 }); }
      if (p >= 0.58) { const q = seg(p, 0.58, 0.72); s += arr(a.X(0.4), a.Y(64), a.X(0.4 + 0.225 * q), a.Y(64), C.brass, 1.8); if (q >= 1) s += ci(a.X(0.625), a.Y(64), 4.5, C.green) + dash(a.X(0.625), a.Y(64), a.X(0.625), a.Y(30), C.green); }
      if (p >= 0.76) s += pill(a.X(0.625) + 58, a.Y(50), 'y_B = 0.625', C.green);
      return s;
    }
  };

  A.carnot = {
    t: 'Carnot engine: the efficiency set by temperature', d: 8500,
    s: [[0, 'The engine takes Q_H = 1000 kJ from the hot reservoir at 500 K.'], [0.28, 'Maximum efficiency: η = 1 − T_C/T_H = 1 − 300/500 = 0.40.'], [0.5, 'Work out: W = ηQ_H = 0.40 × 1000 = 400 kJ.'], [0.72, 'The rest, Q_C = 600 kJ, must go to the cold reservoir at 300 K.']],
    draw(p) {
      let s = ''; const on = seg(p, 0, 0.08);
      s += rc(60, 14, 220, 36, C.rust + '33', C.rust, 'rx="6"') + tx(170, 37, 'Hot reservoir, T_H = 500 K', C.paper, { a: 'middle', b: 1 });
      s += rc(60, 190, 220, 36, C.blue + '33', C.blue, 'rx="6"') + tx(170, 213, 'Cold reservoir, T_C = 300 K', C.paper, { a: 'middle', b: 1 });
      s += ci(170, 120, 30, C.deep, C.brass) + tx(170, 124, 'engine', C.brass, { a: 'middle', b: 1 });
      const qh = ease(seg(p, 0, 0.2)), w = ease(seg(p, 0.5, 0.64)), qc = ease(seg(p, 0.72, 0.86));
      s += arr(170, 52, 170, 52 + 36 * qh, C.rust, 10) + flow([[170, 52], [170, 88]], p, C.paper, 3, 4, on * (qh >= 1 ? 1 : 0)) + tx(184, 76, 'Q_H = 1000 kJ', C.rust, { b: 1, op: qh });
      if (p >= 0.5) s += arr(202, 120, 202 + 120 * w, 120, C.green, 4 + 4) + tx(250, 108, 'W = 400 kJ', C.green, { b: 1, op: w });
      if (p >= 0.72) s += arr(170, 152, 170, 152 + 36 * qc, C.blue, 6 + 0) + tx(184, 176, 'Q_C = 600 kJ', C.blue, { b: 1, op: qc });
      if (p >= 0.28) s += pill(70, 120, 'η = 0.40', C.brass);
      return s;
    }
  };

  function laminarAnim(caps, extra) {
    return {
      t: 'Laminar pipe flow: the parabolic profile', d: 9000, s: caps,
      draw(p) {
        let s = ''; const y0 = 40, y1 = 200, ym = 120, R = 80, x0 = 40, um = 150;
        s += rc(20, y0 - 8, 360, 8, C.mute + '55') + rc(20, y1, 360, 8, C.mute + '55') + dash(20, ym, 380, ym, C.grid);
        // tracer particles moving at local velocity
        for (let k = -4; k <= 4; k++) { const r = k / 4.6, u = 1 - r * r, yy = ym + r * R; for (let j = 0; j < 3; j++) { const x = 20 + ((p * 900 * u / 360 + j / 3 + (k & 1) * 0.15) % 1) * 360; s += ci(x, yy, 2.2, C.blue, null, 'opacity=".55"'); } }
        const g = ease(seg(p, 0.12, 0.42)); const pts = [];
        for (let i = 0; i <= 40; i++) { const r = -1 + i / 20; pts.push([x0 + um * (1 - r * r) * g, ym + r * R]); }
        s += pl(pts, C.brass, 2.4) + ln(x0, y0, x0, y1, C.mute, 1.2);
        for (let k = -3; k <= 3; k++) { const r = k / 3.5, L = um * (1 - r * r) * g; if (L > 6) s += arr(x0, ym + r * R, x0 + L, ym + r * R, C.brass, 1.4); }
        if (p >= 0.5) { const op = seg(p, 0.5, 0.6); s += `<g opacity="${fx(op, 2)}">` + ln(x0 + um / 2, y0, x0 + um / 2, y1, C.green, 1.6, 'stroke-dasharray="5 4"') + tx(x0 + um / 2 + 4, y1 - 6, 'v_avg', C.green, { b: 1 }) + tx(x0 + um + 6, ym + 4, 'u_max', C.brass, { b: 1 }) + '</g>'; }
        if (p >= 0.66) s += pill(300, 70, 'u_max = 2 v_avg', C.brass);
        if (extra && p >= 0.82) s += pill(300, 172, extra, C.paper);
        return s;
      }
    };
  }
  const LCAP = [[0, 'Laminar flow (Re < 2100): fluid at the wall is still, the centre moves fastest.'], [0.12, 'The profile is a parabola: u = u_max(1 − r²/R²).'], [0.5, 'Averaging u over the circular area gives v_avg = u_max/2.']];
  A.laminar = laminarAnim(LCAP.concat([[0.66, 'So u_max = 2 v_avg. The same balance gives Hagen–Poiseuille: ΔP = 32μLv/D², f_Fanning = 16/Re.']]));
  A['laminar-fm3'] = laminarAnim(LCAP.concat([[0.66, 'Check Re = ρvD/μ = 1000 × 0.02 × 0.05/0.001 = 1000: laminar.'], [0.82, 'Hagen–Poiseuille: ΔP = 32μLv/D² = 32 × 0.001 × 10 × 0.02/0.0025 = 2.56 Pa.']]), 'ΔP = 2.56 Pa');

  A.torricelli = {
    t: 'Torricelli: free fall from the surface to the jet', d: 8000,
    s: [[0, 'Large open tank: the surface barely moves (v₁ ≈ 0) and both points are at atmospheric pressure.'], [0.3, 'Bernoulli from surface to hole: gh = v²/2. The water falls h = 5 m.'], [0.6, 'v = √(2gh) = √(2 × 9.81 × 5) = 9.90 m/s, the speed of a stone dropped 5 m.']],
    draw(p) {
      let s = ''; const on = seg(p, 0, 0.1);
      s += pl([[40, 30], [40, 200], [170, 200], [170, 30]], C.mute, 2.4) + rc(42, 50, 126, 148, C.blue + '33');
      s += ln(42, 50, 168, 50, C.blue, 1.5) + pl([[100, 44], [96, 38], [104, 38]], 'none', 0, C.blue);
      s += rc(170, 182, 6, 10, C.deep);
      // jet trajectory
      const jet = []; for (let i = 0; i <= 30; i++) { const t = i / 30; jet.push([176 + 200 * t, 187 + 50 * t * t]); }
      s += pl(jet, C.blue, 3.2, null, `opacity="${fx(on, 2)}"`);
      for (let i = 0; i < 6; i++) { const t = (p * 6 + i / 6) % 1; s += ci(176 + 200 * t, 187 + 50 * t * t, 2.4, C.paper, null, `opacity="${fx(on, 2)}"`); }
      if (p >= 0.3) { const q = ease(seg(p, 0.3, 0.44)); s += arr(200, 50, 200, 50 + 136 * q, C.brass, 1.6) + arr(200, 186, 200, 186 - 136 * q, C.brass, 1.6) + tx(208, 122, 'h = 5 m', C.brass, { b: 1, op: q }); }
      if (p >= 0.6) s += pill(300, 110, 'v = 9.90 m/s', C.green);
      return s;
    }
  };

  A.settling = {
    t: 'Settling: the particle speeds up until drag balances weight', d: 9000,
    s: [[0, 'A sand particle released in still water. Gravity minus buoyancy pulls it down.'], [0.22, 'Drag grows with speed (Stokes: F_D = 3πμdv), so the acceleration falls.'], [0.5, 'When drag equals the net weight the speed stops changing: terminal velocity.'], [0.7, 'v_t = g d²(ρ_p − ρ)/18μ = 9.81 × (50 µm)² × 1650/0.018 = 2.25 mm/s. Note v_t ∝ d².']],
    draw(p) {
      let s = ''; const a = axes({ x: 190, y: 26, w: 190, h: 160, xr: [0, 5], yr: [0, 1.2], xt: [0, 1, 2, 3, 4, 5], yt: [0, 0.5, 1], xl: 't / τ', yl: 'v / v_t', xf: v => v, yf: v => v });
      s += rc(30, 20, 110, 190, C.blue + '22', C.mute, 'rx="4"');
      const tt = 5 * seg(p, 0.05, 0.62), v = 1 - Math.exp(-tt), y = 34 + (tt - (1 - Math.exp(-tt))) / 4.01 * 150;
      s += ci(85, y, 8, C.brass);
      const Fg = 34, Fd = 34 * v; s += arr(85, y + 10, 85, y + 10 + Fg, C.rust, 2.2) + tx(98, y + 34, 'weight − buoyancy', C.rust, { size: 9 });
      if (Fd > 4) s += arr(85, y - 10, 85, y - 10 - Fd, C.green, 2.2) + tx(98, y - 18, 'drag', C.green, { size: 9 });
      s += a.s + dash(a.X(0), a.Y(1), a.X(5), a.Y(1), C.green) + pl(a.curve(t => 1 - Math.exp(-t), 0, tt), C.blue, 2.4) + ci(a.X(tt), a.Y(v), 4, C.blue);
      if (p >= 0.5) s += tx(a.X(5) - 2, a.Y(1) - 6, 'terminal', C.green, { a: 'end', size: 10 });
      if (p >= 0.7) s += pill(285, 216, 'v_t = 2.25 mm/s', C.green);
      return s;
    }
  };

  A.wall = {
    t: 'Composite wall: resistances in series', d: 9000,
    s: [[0, 'Brick 0.2 m (k = 0.7) and insulation 0.05 m (k = 0.05) between 600 °C and 50 °C.'], [0.2, 'Each layer is a resistance L/k: brick 0.286, insulation 1.000 m²·K/W.'], [0.42, 'Same heat flows through both: q = ΔT/ΣR = 550/1.286 = 428 W/m².'], [0.64, 'Temperature drop in each layer = q × R: brick 122 K, insulation 428 K.'], [0.8, 'The thin insulation takes most of the drop: it carries most of the resistance.']],
    draw(p) {
      let s = ''; const x0 = 90, xb = 230, xi = 300, Y = T => 200 - (T - 0) / 650 * 170;
      s += rc(x0, 20, xb - x0, 180, C.rust + '30', C.rust) + rc(xb, 20, xi - xb, 180, C.violet + '30', C.violet);
      s += tx((x0 + xb) / 2, 214, 'brick 0.2 m', C.rust, { a: 'middle', size: 10 }) + tx((xb + xi) / 2, 214, 'insulation', C.violet, { a: 'middle', size: 10 });
      s += tx(x0 - 6, Y(600) + 4, '600 °C', C.paper, { a: 'end', b: 1 }) + tx(xi + 6, Y(50) + 4, '50 °C', C.paper, { b: 1 });
      const on = seg(p, 0, 0.1); for (let i = 0; i < 5; i++) { const t = (p * 5 + i / 5) % 1; s += ci(x0 + (xi - x0) * t, 120 + (i - 2) * 22, 2.4, C.brass, null, `opacity="${fx(on * 0.8, 2)}"`); }
      if (p >= 0.2) s += `<g opacity="${fx(seg(p, 0.2, 0.28), 2)}">` + tx((x0 + xb) / 2, 36, 'R = 0.286', C.paper, { a: 'middle', size: 10 }) + tx((xb + xi) / 2, 36, 'R = 1.000', C.paper, { a: 'middle', size: 10 }) + '</g>';
      if (p >= 0.42) s += pill(345, 120, 'q = 428 W/m²', C.brass);
      const Ti = 600 - 427.78 * 0.2857, g = ease(seg(p, 0.64, 0.8));
      if (p >= 0.64) { const mid = [x0 + (xb - x0) * Math.min(1, g * 2), Y(600 + (Ti - 600) * Math.min(1, g * 2))]; s += pl([[x0, Y(600)], mid], C.paper, 2.4); if (g > 0.5) { const t = (g - 0.5) * 2; s += pl([[xb, Y(Ti)], [xb + (xi - xb) * t, Y(Ti + (50 - Ti) * t)]], C.paper, 2.4); } }
      if (p >= 0.8) s += ci(xb, Y(Ti), 4, C.paper) + tx(xb - 6, Y(Ti) - 8, fx(Ti, 0) + ' °C', C.paper, { a: 'end', b: 1 });
      return s;
    }
  };

  A.lmtd = {
    t: 'LMTD: counter-current against co-current', d: 11000,
    s: [[0, 'Counter-current: hot 150 → 90 °C one way, cold 30 → 70 °C the other way.'], [0.22, 'End differences: ΔT₁ = 150 − 70 = 80, ΔT₂ = 90 − 30 = 60.'], [0.38, 'LMTD = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂) = 20/ln(1.333) = 69.5 °C.'], [0.6, 'Same temperatures in co-current: the ends become 120 and 20.'], [0.8, 'Co-current LMTD = 100/ln 6 = 55.8 °C, so counter-current needs about 20% less area.']],
    draw(p) {
      const co = p >= 0.6, a = axes(AX([0, 1], [20, 160], { xt: [], yt: [30, 70, 90, 150], xl: 'length along the exchanger', yl: 'T, °C' }));
      const prof = (d1, d2) => x => { const dT = d1 * Math.pow(d2 / d1, x); return [150 - 60 * (d1 - dT) / (d1 - d2), 150 - 60 * (d1 - dT) / (d1 - d2) - dT]; };
      const f = co ? prof(120, 20) : prof(80, 60); let s = a.s;
      const g = co ? ease(seg(p, 0.6, 0.74)) : ease(seg(p, 0, 0.16)), n = 60;
      const hot = [], cold = []; for (let i = 0; i <= n * g; i++) { const x = i / n, v = f(x); hot.push([a.X(x), a.Y(v[0])]); }
      const cg = co ? g : g; for (let i = 0; i <= n * cg; i++) { const x = co ? i / n : 1 - i / n, v = f(x); cold.push([a.X(x), a.Y(v[1])]); }
      s += pl(hot, C.rust, 2.6) + pl(cold, C.blue, 2.6);
      const hp = [], cp = []; for (let i = 0; i <= 30; i++) { hp.push([a.X(i / 30), a.Y(f(i / 30)[0])]); cp.push([a.X(co ? i / 30 : 1 - i / 30), a.Y(f(co ? i / 30 : 1 - i / 30)[1])]); }
      if (g >= 1) s += flow(hp, p, C.rust, 4, 4, 1) + flow(cp, p, C.blue, 4, 4, 1);
      s += tx(a.X(0.02), a.Y(f(0)[0]) - 7, 'hot', C.rust, { size: 10 }) + tx(co ? a.X(0.02) : a.X(0.98), a.Y(co ? f(0)[1] : f(1)[1]) + 15, 'cold in', C.blue, { size: 10, a: co ? 'start' : 'end' });
      const end = (x, d) => { const v = f(x); return arr(a.X(x) + (x ? -10 : 10), a.Y(v[0]) + 3, a.X(x) + (x ? -10 : 10), a.Y(v[1]) - 3, C.brass, 1.4) + tx(a.X(x) + (x ? -16 : 16), (a.Y(v[0]) + a.Y(v[1])) / 2 + 4, 'ΔT = ' + d, C.brass, { b: 1, a: x ? 'end' : 'start', size: 10 }); };
      if ((!co && p >= 0.22) || (co && p >= 0.74)) s += end(0, co ? 120 : 80) + end(1, co ? 20 : 60);
      if (p >= 0.38 && !co) s += pill(200, 205, 'counter-current LMTD = 69.5 °C', C.brass);
      if (p >= 0.8) s += pill(200, 205, 'co-current LMTD = 55.8 °C', C.violet);
      s += tx(370, 16, co ? 'co-current' : 'counter-current', co ? C.violet : C.brass, { a: 'end', b: 1 });
      return s;
    }
  };

  const eqc = al => x => al * x / (1 + (al - 1) * x);
  function mtAxes() { return axes(AX([0, 1], [0, 1], { x: 120, w: 170, h: 170, xt: [0, 0.5, 1], yt: [0, 0.5, 1], xl: 'x (liquid)', yl: 'y (vapour)' })); }
  A.rmin = {
    t: 'Minimum reflux: the operating line touches equilibrium', d: 9000,
    s: [[0, 'Equilibrium curve for α = 2.5 and the 45° line.'], [0.18, 'Saturated liquid feed: the q-line is vertical at x_F = 0.5.'], [0.36, 'It meets the equilibrium curve at y* = 2.5 × 0.5/(1 + 1.5 × 0.5) = 0.714: the pinch.'], [0.56, 'At minimum reflux the rectifying line runs from (x_D, x_D) = (0.95, 0.95) through the pinch.'], [0.76, 'Slope R/(R + 1) = (0.95 − 0.714)/(0.95 − 0.5) = 0.524, so R_min = 1.10. Any less and infinite stages are needed.']],
    draw(p) {
      const a = mtAxes(), f = eqc(2.5); let s = a.s + ln(a.X(0), a.Y(0), a.X(1), a.Y(1), C.mute, 1);
      s += pl(a.curve(f, 0, ease(seg(p, 0, 0.16))), C.blue, 2.4);
      if (p >= 0.18) { const q = seg(p, 0.18, 0.32); s += ln(a.X(0.5), a.Y(0.5), a.X(0.5), a.Y(0.5 + 0.214 * q), C.violet, 2); s += tx(a.X(0.5) + 4, a.Y(0.25), 'x_F', C.violet, { size: 10 }); }
      if (p >= 0.36) s += ci(a.X(0.5), a.Y(0.7143), 4.5, C.rust) + tx(a.X(0.5) - 8, a.Y(0.7143) - 6, 'pinch', C.rust, { a: 'end', size: 10, b: 1 });
      if (p >= 0.56) { const q = ease(seg(p, 0.56, 0.72)), yi = 0.95 / 2.1, xe = 0.95 - 0.95 * q; s += ci(a.X(0.95), a.Y(0.95), 4, C.brass) + ln(a.X(0.95), a.Y(0.95), a.X(xe), a.Y(0.95 + (yi - 0.95) * q), C.brass, 2); }
      if (p >= 0.76) s += pill(345, 60, 'R_min = 1.10', C.brass) + tx(345, 86, 'slope 0.524', C.mute, { a: 'middle', size: 10 });
      return s;
    }
  };
  A.fenske = {
    t: 'Total reflux: stepping off the minimum stages', d: 11000,
    s: [[0, 'At total reflux the operating line is the 45° line. α = 2.5, x_D = 0.95, x_B = 0.05.'], [0.12, 'Step from the top: across to equilibrium (a stage), down to the diagonal, repeat.'], [0.74, 'About 6½ stages reach x_B = 0.05.'], [0.86, 'Fenske: N_min = ln[(0.95/0.05)(0.95/0.05)]/ln 2.5 = ln 361/0.916 = 6.43, reboiler included.']],
    draw(p) {
      const a = mtAxes(), al = 2.5, f = eqc(al), inv = y => y / (al - (al - 1) * y); let s = a.s + ln(a.X(0), a.Y(0), a.X(1), a.Y(1), C.mute, 1) + pl(a.curve(f, 0, 1), C.blue, 2.4);
      s += dash(a.X(0.95), a.Y(0), a.X(0.95), a.Y(0.95), C.brass) + tx(a.X(0.95), a.Y(0) + 26, 'x_D', C.brass, { a: 'middle', size: 10 });
      s += dash(a.X(0.05), a.Y(0), a.X(0.05), a.Y(0.05), C.green) + tx(a.X(0.05), a.Y(0) + 26, 'x_B', C.green, { a: 'middle', size: 10 });
      const pts = [[0.95, 0.95]]; let y = 0.95, n = 0; while (n < 8) { const x = inv(y); pts.push([x, y]); n++; if (x <= 0.05) break; pts.push([x, x]); y = x; }
      const g = seg(p, 0.12, 0.72) * (pts.length - 1), k = Math.floor(g), fr = g - k, path = pts.slice(0, k + 1).map(q => [a.X(q[0]), a.Y(q[1])]);
      if (k < pts.length - 1) path.push([a.X(pts[k][0] + (pts[k + 1][0] - pts[k][0]) * fr), a.Y(pts[k][1] + (pts[k + 1][1] - pts[k][1]) * fr)]);
      s += pl(path, C.brass, 2);
      let m = 0; for (let i = 1; i < pts.length && i <= k; i += 2) { m++; s += tx(a.X(pts[i][0]) - 5, a.Y(pts[i][1]) - 4, m, C.paper, { a: 'end', size: 9 }); }
      if (p >= 0.86) s += pill(345, 60, 'N_min = 6.43', C.brass);
      return s;
    }
  };

  function levAnim(two) {
    return {
      t: two ? 'Two CSTRs in series on a Levenspiel plot' : 'Levenspiel plot: CSTR against PFR', d: 10000,
      s: two ? [[0, 'First order, k = 0.2 min⁻¹: 1/(−r_A) ∝ 1/(k(1 − X)). Total τ = 10 min split into two tanks of 5 min.'], [0.2, 'Tank 1: kτ = 1, so X₁ = kτ/(1 + kτ) = 0.5. Its τ is the rectangle up to the exit value.'], [0.46, 'Tank 2 starts at 0.5: (1 − X₂) = 0.5/(1 + 1) = 0.25.'], [0.7, 'Overall X = 1 − 1/(1 + kτ)² = 0.75. Two equal rectangles of 5 min each.'], [0.86, 'Shaded steps hug the curve better than one big tank: more tanks in series approach a PFR.']]
        : [[0, 'Plot 1/(−r_A) against X. For first order with k = 0.5 min⁻¹ it rises as 1/(k(1 − X)).'], [0.2, 'PFR: τ = ∫dX/(−r_A) (per C_A0), the area under the curve: −ln(0.2)/0.5 = 3.22 min.'], [0.48, 'CSTR: τ = X/(−r_A) at the exit, the whole rectangle: 0.8/(0.5 × 0.2) = 8.00 min.'], [0.72, 'Ratio 8.00/3.22 = 2.49. The CSTR runs entirely at the low exit concentration.']],
      draw(p) {
        const k = two ? 0.2 : 0.5, ymax = two ? 22 : 12, Xe = two ? 0.75 : 0.8, g = X => 1 / (k * (1 - X));
        const a = axes(AX([0, 1], [0, ymax], { xt: [0, 0.25, 0.5, 0.75, 1], yt: two ? [0, 5, 10, 15, 20] : [0, 4, 8, 12], xl: 'conversion X', yl: '1/(−r_A), min (per C_A0)' })); let s = a.s;
        s += pl(a.curve(g, 0, Math.min(0.9, 0.9 * ease(seg(p, 0, 0.16)) + 0.0001), 80).filter(q => q[1] >= a.Y(ymax)), C.blue, 2.4);
        const box = (x0, x1, t, c) => { const h = g(x1) * ease(t); return rc(a.X(x0), a.Y(h), a.X(x1) - a.X(x0), a.Y(0) - a.Y(h), c + '33', c, 'stroke-width="1.4"'); };
        if (two) {
          if (p >= 0.2) s += box(0, 0.5, seg(p, 0.2, 0.34), C.rust) + tx(a.X(0.25), a.Y(3), 'τ₁ = 5', C.paper, { a: 'middle', b: 1, op: seg(p, 0.34, 0.4) });
          if (p >= 0.46) s += box(0.5, 0.75, seg(p, 0.46, 0.6), C.violet) + tx(a.X(0.625), a.Y(3), 'τ₂ = 5', C.paper, { a: 'middle', b: 1, op: seg(p, 0.6, 0.66) });
          if (p >= 0.7) s += pill(a.X(0.3), a.Y(17), 'X = 0.75', C.brass);
        } else {
          if (p >= 0.48) s += box(0, Xe, seg(p, 0.48, 0.64), C.rust) + tx(a.X(0.4), a.Y(9), 'CSTR 8.00 min', C.rust, { a: 'middle', b: 1, op: seg(p, 0.6, 0.66) });
          if (p >= 0.2) { const e = Xe * ease(seg(p, 0.2, 0.4)), pts = a.curve(g, 0, e, 50); s += pl([[a.X(0), a.Y(0)]].concat(pts, [[a.X(e), a.Y(0)]]), C.blue, 1, C.blue + '55'); s += tx(a.X(0.4), a.Y(1.4), 'PFR 3.22 min', C.paper, { a: 'middle', b: 1, op: seg(p, 0.36, 0.42) }); }
          if (p >= 0.72) s += pill(a.X(0.3), a.Y(11), 'V_CSTR / V_PFR = 2.49', C.brass);
        }
        s += dash(a.X(Xe), a.Y(0), a.X(Xe), a.Y(g(Xe)), C.mute);
        return s;
      }
    };
  }
  A.levenspiel = levAnim(false);
  A.cstr2 = levAnim(true);

  A.discount = {
    t: 'Present worth: discounting one year at a time', d: 9000,
    s: [[0, '₹1 lakh arrives at the end of year 5. Interest is 10% per year, compounded annually.'], [0.12, 'Bring it back one year at a time: divide by 1.10 each year.'], [0.72, 'PW = 1/(1.10)⁵ = 1/1.6105 = ₹0.621 lakh.'], [0.86, 'Money later is worth less now: the discount factor 1/(1 + i)ⁿ.']],
    draw(p) {
      const a = axes(AX([-0.6, 5.6], [0, 1.15], { xt: [0, 1, 2, 3, 4, 5], yt: [0, 0.5, 1], xl: 'year', yl: '₹ lakh' })); let s = a.s;
      const g = 5 * seg(p, 0.12, 0.7), yr = 5 - g, v = Math.pow(1.1, -g), bw = 30;
      for (let n = 5; n >= Math.ceil(yr); n--) { const vv = Math.pow(1.1, -(5 - n)); s += rc(a.X(n) - bw / 2, a.Y(vv), bw, a.Y(0) - a.Y(vv), C.brass + '22', C.brass + '66'); }
      s += rc(a.X(yr) - bw / 2, a.Y(v), bw, a.Y(0) - a.Y(v), C.brass) + tx(a.X(yr), a.Y(v) - 6, fx(v, 3), C.paper, { a: 'middle', b: 1 });
      if (p >= 0.12 && p < 0.7) s += arr(a.X(yr) - 20, a.Y(v) - 22, a.X(yr) - 48, a.Y(v) - 22, C.mute, 1.4) + tx(a.X(yr) - 34, a.Y(v) - 28, '÷ 1.10', C.mute, { a: 'middle', size: 10 });
      if (p >= 0.72) s += pill(a.X(2.6), a.Y(1.02), 'PW = ₹0.621 lakh', C.green);
      return s;
    }
  };

  A.gantt = {
    t: 'Batch scheduling: the bottleneck sets the pace', d: 10000,
    s: [[0, 'Three batches: reactor 4 h each, then filter 3 h each. Filtering can overlap the next reaction.'], [0.1, 'The reactor runs batches back to back: 0–4, 4–8, 8–12 h.'], [0.4, 'Each batch is filtered as soon as it leaves the reactor; the filter waits 1 h between batches.'], [0.8, 'The last batch finishes filtering at 12 + 3 = 15 h. The reactor (longest step) is the bottleneck.']],
    draw(p) {
      const X = h => 90 + h * 18.5, row = { R: 70, F: 130 }, cols = [C.brass, C.blue, C.violet]; let s = '';
      for (let h = 0; h <= 16; h += 2) s += ln(X(h), 50, X(h), 170, C.grid, 1) + tx(X(h), 186, h, C.mute, { a: 'middle', size: 10 });
      s += tx(X(16), 202, 'hours', C.mute, { a: 'end', size: 10 }) + tx(80, row.R + 22, 'Reactor', C.paper, { a: 'end', b: 1 }) + tx(80, row.F + 22, 'Filter', C.paper, { a: 'end', b: 1 });
      const now = 16 * seg(p, 0.1, 0.78), bar = (y, a0, d, i) => { const w = cl(now - a0, 0, d); return w > 0 ? rc(X(a0), y, w * 18.5, 34, cols[i] + '55', cols[i], 'rx="4"') + (w >= d ? tx(X(a0 + d / 2), y + 22, 'B' + (i + 1), C.paper, { a: 'middle', b: 1 }) : '') : ''; };
      [0, 1, 2].forEach(i => { s += bar(row.R, 4 * i, 4, i) + bar(row.F, 4 * i + 4, 3, i); });
      if (p >= 0.1 && p < 0.99) s += ln(X(Math.min(now, 16)), 44, X(Math.min(now, 16)), 172, C.rust, 1.6);
      if (p >= 0.8) s += dash(X(15), 40, X(15), 172, C.green) + pill(X(15) - 6, 30, 'done at 15 h', C.green);
      return s;
    }
  };

  A.contact = {
    t: 'Contact process: SO₂ to SO₃ over V₂O₅', d: 9000,
    s: [[0, 'Sulfur burns in dry air to SO₂.'], [0.22, 'SO₂ + ½O₂ ⇌ SO₃ over promoted V₂O₅ in 4 beds, about 420–450 °C, cooled between beds (exothermic, equilibrium-limited).'], [0.54, 'SO₃ is absorbed in 98% H₂SO₄, not water: water makes an acid mist that is hard to capture.'], [0.78, 'The oleum is diluted to the required strength. Double absorption pushes conversion above 99.5%.']],
    draw(p) {
      let s = ''; const on = seg(p, 0, 0.08);
      s += rc(14, 90, 70, 60, C.deep, C.rust, 'rx="6"') + tx(49, 116, 'S burner', C.paper, { a: 'middle', b: 1, size: 10 }) + tx(49, 132, 'S + O₂', C.mute, { a: 'middle', size: 9 });
      s += rc(150, 30, 80, 180, C.deep, C.brass, 'rx="6"');
      for (let i = 0; i < 4; i++) s += rc(158, 44 + i * 42, 64, 18, C.brass + (p >= 0.22 ? '55' : '22')) + tx(190, 57 + i * 42, 'V₂O₅', C.paper, { a: 'middle', size: 9 });
      s += tx(190, 224, 'converter', C.brass, { a: 'middle', size: 10 });
      s += rc(300, 50, 70, 140, C.deep, C.blue, 'rx="30"') + tx(335, 116, 'absorber', C.paper, { a: 'middle', b: 1, size: 10 }) + tx(335, 132, '98% H₂SO₄', C.mute, { a: 'middle', size: 9 });
      const p1 = [[84, 120], [120, 120], [120, 20], [190, 20], [190, 30]], p2 = [[190, 210], [190, 230], [265, 230], [265, 150], [300, 150]];
      s += pl(p1, C.rust, 2) + pl(p2, C.green, 2);
      s += flow(p1, p, C.rust, 5, 4, on) + flow(p2, p, C.green, 5, 4, seg(p, 0.22, 0.3));
      s += tx(126, 112, 'SO₂', C.rust, { b: 1 }) + tx(240, 224, 'SO₃', C.green, { b: 1, op: seg(p, 0.22, 0.3) });
      if (p >= 0.54) s += arr(335, 50, 335, 18, C.mute, 1.6) + tx(345, 26, 'tail gas', C.mute, { size: 9 }) + arr(370, 170, 396, 170, C.violet, 2) + tx(394, 160, 'oleum', C.violet, { a: 'end', size: 10, b: 1 });
      if (p >= 0.22) s += pill(95, 190, 'catalyst V₂O₅', C.brass);
      return s;
    }
  };

  /* ---------- question / sheet map ---------- */
  const QMAP = { m9: 'ode-m9', m10: 'newton', m11: 'trapz', cn1: 'fo-cn1', cn2: 'fo-cn2', cn4: 'underdamped', pc2: 'evaporator', pc4: 'recycle', pc5: 'purge', td4: 'carnot', td5: 'pxy', fm1: 'laminar', fm2: 'laminar', fm3: 'laminar-fm3', fm4: 'torricelli', fm7: 'settling', fm8: 'settling', ht1: 'wall', ht2: 'wall', ht3: 'lmtd', mt3: 'rmin', mt4: 'fenske', re2: 'batch-re2', re3: 'levenspiel', re8: 'cstr2', pd5: 'discount', pd7: 'gantt', ct1: 'contact' };
  const pick = q => { const id = typeof q === 'string' ? q : q && q.id; return (id && QMAP[id]) || null; };

  /* ---------- player ---------- */
  let uid = 0;
  function mount(el, key) {
    const an = A[key]; if (!an || !el || el.dataset.animOn) return null; el.dataset.animOn = '1';
    const id = 'ga' + (++uid);
    el.classList.add('ga-fig');
    el.innerHTML = `<div class="ga-head"><b>${an.t}</b><span>Animated explanation</span></div>` +
      `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-c" font-family="inherit"></svg>` +
      `<p class="ga-cap" id="${id}-c" aria-live="polite"></p>` +
      `<div class="ga-ctl"><button type="button" class="ga-play" aria-label="Play">▶</button><button type="button" class="ga-re" aria-label="Replay">↺</button>` +
      `<input type="range" min="0" max="1000" value="0" aria-label="Animation position"><span class="ga-step"></span></div>`;
    const svg = el.querySelector('svg'), cap = el.querySelector('.ga-cap'), btn = el.querySelector('.ga-play'), rng = el.querySelector('input'), stp = el.querySelector('.ga-step');
    let p = 0, playing = false, last = 0, raf = 0, lastCap = -1;
    const render = () => {
      try { svg.innerHTML = an.draw(p); } catch (e) { svg.innerHTML = ''; }
      let k = 0; an.s.forEach((x, i) => { if (p >= x[0]) k = i; });
      if (k !== lastCap) { cap.textContent = an.s[k][1]; stp.textContent = (k + 1) + ' / ' + an.s.length; lastCap = k; }
      rng.value = Math.round(p * 1000);
    };
    const setPlay = v => { playing = v; btn.textContent = v ? '❚❚' : '▶'; btn.setAttribute('aria-label', v ? 'Pause' : 'Play'); if (v) { last = 0; raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf); };
    function tick(t) { if (!playing) return; if (last) p = Math.min(1, p + (t - last) / an.d); last = t; render(); if (p >= 1) setPlay(false); else raf = requestAnimationFrame(tick); }
    btn.onclick = () => { if (playing) setPlay(false); else { if (p >= 1) p = 0; setPlay(true); } };
    el.querySelector('.ga-re').onclick = () => { p = 0; render(); setPlay(true); };
    rng.oninput = () => { setPlay(false); p = rng.value / 1000; render(); };
    if (RM) { p = 1; render(); return el; }
    render();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting && p === 0 && !playing) { setPlay(true); io.disconnect(); } }); }, { threshold: 0.5 });
      io.observe(el);
    } else setPlay(true);
    return el;
  }
  // a <figure> for a question, or '' if none
  function figureFor(q) { const k = pick(q); return k ? `<figure class="ga-slot" data-anim="${k}"></figure>` : ''; }
  function auto(root) { (root || document).querySelectorAll('[data-anim]:not([data-anim-on])').forEach(el => { if (el.offsetParent !== null || el.closest('details[open]') || !el.closest('details')) mount(el, el.dataset.anim); }); }
  window.GATE_ANIM = { mount, pick, figureFor, auto, keys: Object.keys(A) };
  const go = () => {
    auto();
    // static question list: mount when a solution is opened
    document.addEventListener('toggle', e => { const d = e.target; if (d.tagName === 'DETAILS' && d.open) auto(d); }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
