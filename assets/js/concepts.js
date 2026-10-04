/* PharmaChemE concept animations. Each concept is a sketch + live graph + slider,
   mounted into any element with data-concept="<id>". Built from /home/claude/cm/src. */
(function () {
  if (window.PCM) return;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = {
    paper: '#ECE7D8', brass: '#C9A227', muted: '#6E8CA8', grid: '#16283C', axis: '#3A5A7A', dim: '#2C4C6C',
    bg: '#070F18', blue: '#8FB8E8', orange: '#F08A3C', liquid: '#1F4A73', hot: '#B7402F', red: '#FF6B6B',
    green: '#5FBF8A', steel: '#5A6B7C', dark: '#0D1B2A', cream: '#F2D7A0'
  };
  var MONO = "'IBM Plex Mono', monospace", SANS = "'IBM Plex Sans', system-ui, sans-serif", DISP = "'Big Shoulders Display', sans-serif";
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lg(x) { return Math.log(x) / Math.LN10; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function fmt(x, d) { if (!isFinite(x)) return '–'; return x.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function sig(x, n) { if (!isFinite(x) || x === 0) return fmt(x, 0); var d = Math.max(0, (n || 3) - 1 - Math.floor(lg(Math.abs(x)))); return fmt(x, Math.min(d, 4)); }
  function track(name, p) { try { if (window.gtag) gtag('event', name, p || {}); } catch (e) {} }

  function fit(c) {
    var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    var w = Math.max(10, Math.round(r.width)), h = Math.max(10, Math.round(r.height));
    if (c.width !== Math.round(w * d) || c.height !== Math.round(h * d)) { c.width = Math.round(w * d); c.height = Math.round(h * d); }
    var ctx = c.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  function line(ctx, p) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.stroke(); }

  /* Square drawing kit: coordinates 0..100 inside the largest centred square. */
  function kit(ctx, w, h) {
    var s = Math.min(w, h), ox = (w - s) / 2, oy = (h - s) / 2, u = s / 100;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
    var K = {
      ctx: ctx, u: u, w: w, h: h,
      X: function (v) { return ox + v * u; }, Y: function (v) { return oy + v * u; },
      st: function (c, lw, dash) { ctx.strokeStyle = c; ctx.lineWidth = lw || 2; ctx.setLineDash(dash ? dash.map(function (d) { return d * u / 1.2; }) : []); return K; },
      fi: function (c) { ctx.fillStyle = c; return K; },
      ln: function () { var a = [].slice.call(arguments), p = []; for (var i = 0; i < a.length; i += 2) p.push(K.X(a[i]), K.Y(a[i + 1])); line(ctx, p); ctx.setLineDash([]); return K; },
      poly: function (pts, fill) { ctx.beginPath(); for (var i = 0; i < pts.length; i += 2) { var X = K.X(pts[i]), Y = K.Y(pts[i + 1]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); } ctx.closePath(); if (fill) ctx.fill(); else ctx.stroke(); return K; },
      rect: function (x, y, ww, hh, fill) { if (fill) ctx.fillRect(K.X(x), K.Y(y), ww * u, hh * u); else ctx.strokeRect(K.X(x), K.Y(y), ww * u, hh * u); ctx.setLineDash([]); return K; },
      circ: function (x, y, r, fill) { ctx.beginPath(); ctx.arc(K.X(x), K.Y(y), Math.max(.3, r * u), 0, 6.2832); if (fill) ctx.fill(); else ctx.stroke(); ctx.setLineDash([]); return K; },
      arc: function (x, y, r, a0, a1) { ctx.beginPath(); ctx.arc(K.X(x), K.Y(y), r * u, a0, a1); ctx.stroke(); return K; },
      clip: function (fn) { ctx.save(); ctx.beginPath(); fn(); ctx.clip(); return K; },
      un: function () { ctx.restore(); return K; },
      tx: function (s, x, y, o) {
        o = o || {}; var sz = Math.max(o.min || 10, (o.sz || 3.6) * u);
        ctx.font = (o.wt || (o.mono ? '600' : '500')) + ' ' + sz + 'px ' + (o.mono ? MONO : o.disp ? DISP : SANS);
        ctx.fillStyle = o.c || C.muted; ctx.textAlign = o.al || 'center'; ctx.fillText(s, K.X(x), K.Y(y)); return K;
      },
      dots: function (list, r, c) { ctx.fillStyle = c; list.forEach(function (p) { ctx.beginPath(); ctx.arc(K.X(p.x), K.Y(p.y), Math.max(.6, r * u), 0, 6.2832); ctx.fill(); }); return K; }
    };
    return K;
  }

  /* Particles helper: n points that wander inside a box. */
  function swarm(st, key, n, box, sp) {
    var a = st[key];
    if (!a) { a = st[key] = []; for (var i = 0; i < n; i++) { var t = Math.random() * 6.283; a.push({ x: box[0] + Math.random() * (box[2] - box[0]), y: box[1] + Math.random() * (box[3] - box[1]), vx: Math.cos(t), vy: Math.sin(t) }); } }
    return {
      list: a,
      step: function (dt, speed, b) {
        b = b || box;
        a.forEach(function (p) {
          p.x += p.vx * speed * dt; p.y += p.vy * speed * dt;
          if (p.x < b[0]) { p.x = 2 * b[0] - p.x; p.vx = Math.abs(p.vx); } if (p.x > b[2]) { p.x = 2 * b[2] - p.x; p.vx = -Math.abs(p.vx); }
          if (p.y < b[1]) { p.y = Math.min(b[3], 2 * b[1] - p.y); p.vy = Math.abs(p.vy); } if (p.y > b[3]) { p.y = Math.max(b[1], 2 * b[3] - p.y); p.vy = -Math.abs(p.vy); }
        });
      }
    };
  }

  /* x-y plot */
  function plot(c, g, x) {
    var f = fit(c), ctx = f.ctx, w = f.w, h = f.h;
    var L = 58, R = g.right || 16, T = 16, B = 46, pw = w - L - R, ph = h - T - B;
    function sx(v) { return L + pw * (g.logx ? (lg(v) - lg(g.x0)) / (lg(g.x1) - lg(g.x0)) : (v - g.x0) / (g.x1 - g.x0)); }
    function sy(v) { return T + ph - ph * (g.logy ? (lg(Math.max(v, 1e-30)) - lg(g.y0)) / (lg(g.y1) - lg(g.y0)) : (v - g.y0) / (g.y1 - g.y0)); }
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
    (g.bands || []).forEach(function (b) {
      if (b.y) { var ya = sy(b.to), yb = sy(b.from); ctx.fillStyle = b.fill; ctx.fillRect(L, ya, pw, yb - ya); if (b.label) { ctx.fillStyle = b.color || C.muted; ctx.font = '500 12px ' + SANS; ctx.textAlign = 'right'; ctx.fillText(b.label, L + pw - 6, ya + 14); } return; }
      var a = sx(Math.max(b.from, g.x0)), z = sx(Math.min(b.to, g.x1));
      ctx.fillStyle = b.fill; ctx.fillRect(a, T, z - a, ph);
      if (b.label) { ctx.fillStyle = b.color || C.muted; ctx.font = '500 12px ' + SANS; ctx.textAlign = 'center'; ctx.fillText(b.label, (a + z) / 2, T + 14); }
    });
    ctx.lineWidth = 1; ctx.font = '12px ' + SANS; ctx.fillStyle = C.muted;
    g.xt.forEach(function (t) { var X = Math.round(sx(t)) + .5; ctx.strokeStyle = C.grid; line(ctx, [X, T, X, T + ph]); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(g.fx ? g.fx(t) : t, X, T + ph + 16); });
    g.yt.forEach(function (t) { var Y = Math.round(sy(t)) + .5; ctx.strokeStyle = C.grid; line(ctx, [L, Y, L + pw, Y]); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(g.fy ? g.fy(t) : t, L - 6, Y + 4); });
    ctx.strokeStyle = C.axis; line(ctx, [L + .5, T, L + .5, T + ph + .5, L + pw, T + ph + .5]);
    ctx.fillStyle = C.muted; ctx.font = '500 12.5px ' + SANS; ctx.textAlign = 'center';
    ctx.fillText(g.xl, L + pw / 2, h - 7);
    ctx.save(); ctx.translate(14, T + ph / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(g.yl, 0, 0); ctx.restore();
    (g.hl || []).forEach(function (hl) {
      var Y = sy(hl.y); ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = hl.c || C.dim; ctx.lineWidth = 1; line(ctx, [L, Y, L + pw, Y]); ctx.restore();
      if (hl.label) { ctx.fillStyle = hl.c || C.muted; ctx.font = '12px ' + SANS; ctx.textAlign = hl.al === 'r' ? 'right' : 'left'; ctx.fillText(hl.label, hl.al === 'r' ? L + pw - 6 : L + 6, Y - 5); }
    });
    (g.vl || []).forEach(function (vl) {
      var X = sx(vl.x); ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = vl.c || C.dim; ctx.lineWidth = 1; line(ctx, [X, T, X, T + ph]); ctx.restore();
      if (vl.label) { ctx.fillStyle = vl.c || C.muted; ctx.font = '12px ' + SANS; ctx.textAlign = 'left'; ctx.fillText(vl.label, X + 5, T + (vl.ty || 28)); }
    });
    var A = { L: L, T: T, pw: pw, ph: ph, sx: sx, sy: sy };
    if (g.under) { ctx.save(); ctx.beginPath(); ctx.rect(L, T, pw, ph); ctx.clip(); g.under(ctx, sx, sy, x, A); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.rect(L, T, pw, ph); ctx.clip();
    g.curves.forEach(function (cu) {
      var a = cu.from != null ? cu.from : g.x0, z = cu.to != null ? cu.to : g.x1, n = cu.n || 160;
      ctx.beginPath();
      if (cu.pts) { cu.pts.forEach(function (p, i) { var X = sx(p[0]), Y = sy(p[1]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); }
      else for (var i = 0; i <= n; i++) {
        var v = g.logx ? Math.pow(10, lg(a) + (lg(z) - lg(a)) * i / n) : a + (z - a) * i / n;
        var X = sx(v), Y = sy(cu.f(v));
        if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
      }
      ctx.strokeStyle = cu.c; ctx.lineWidth = cu.lw || 2.5; ctx.globalAlpha = cu.a || 1; ctx.setLineDash(cu.dash || []); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    });
    ctx.restore();
    g.curves.forEach(function (cu) {
      if (!cu.label) return;
      var lx = cu.lx, ly = cu.ly != null ? cu.ly : cu.f(lx), Y = sy(ly) + (cu.dy == null ? -8 : cu.dy);
      ctx.fillStyle = cu.c; ctx.font = 'italic 600 13.5px Georgia, serif'; ctx.textAlign = cu.al || 'left'; ctx.fillText(cu.label, sx(lx) + (cu.dx || 0), Y);
    });
    if (g.over) g.over(ctx, sx, sy, x, A);
    (g.points ? g.points(x) : []).forEach(function (p) {
      if (!isFinite(p.y) || !isFinite(p.x)) return;
      var X = sx(p.x), Y = sy(p.y); if (X < L - 2 || X > L + pw + 2 || Y < T - 2 || Y > T + ph + 2) return;
      ctx.beginPath(); ctx.arc(X, Y, 9, 0, 7); ctx.fillStyle = 'rgba(201,162,39,.18)'; ctx.fill();
      ctx.beginPath(); ctx.arc(X, Y, 5.5, 0, 7); ctx.fillStyle = p.c || '#FFE9A8'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = C.bg; ctx.stroke();
    });
  }

  var LIB = {};
  function def(id, d) { LIB[id] = d; }

  /* mounting */
  var inst = [], seq = 0, last = 0, running = false;
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { var I = e.target.__pcm; if (I) I.vis = e.isIntersecting; });
  }) : null;

  function esc(s) { return String(s); }
  function mount(el) {
    if (el.__pcm || el.getAttribute('data-mounted')) return;
    var id = el.getAttribute('data-concept'), d = LIB[id]; if (!d) return;
    var n = ++seq, sid = 'cm-s-' + n;
    el.setAttribute('data-mounted', '1');
    el.innerHTML =
      '<div class="cm-in">' +
      '<p class="cm-k">Concept in motion</p>' +
      '<h4 class="cm-t">' + esc(d.t) + '</h4>' +
      (d.eq ? '<p class="cm-eq">' + d.eq + '</p>' : '') + (d.eq2 ? '<p class="cm-eq2">' + d.eq2 + '</p>' : '') +
      '<div class="cm-stage"><div class="cm-box"><canvas class="cm-anim" role="img" aria-label="' + esc(d.alt || d.t) + '"></canvas>' + (d.cap ? '<p class="cm-cap">' + d.cap + '</p>' : '') + '</div>' +
      '<div class="cm-box cm-plot"><canvas role="img" aria-label="Graph: ' + esc(d.t) + '"></canvas><div class="cm-read ' + (d.rp || '') + '" aria-live="polite"></div></div></div>' +
      '<div class="cm-ctl"><label for="' + sid + '">' + d.sl.label + '</label><input type="range" id="' + sid + '" min="' + d.sl.min + '" max="' + d.sl.max + '" step="' + (d.sl.step || 'any') + '" value="' + d.sl.v + '"><button type="button" class="cm-play">Pause</button></div>' +
      (d.note ? '<p class="cm-note">' + d.note + '</p>' : '') +
      '</div>';
    var cvs = el.querySelectorAll('canvas');
    var I = { el: el, d: d, id: id, ca: cvs[0], cg: cvs[1], ro: el.querySelector('.cm-read'), sl: el.querySelector('input'), btn: el.querySelector('.cm-play'),
      st: {}, playing: !RM, phase: 0, dirty: true, vis: !io, touched: false };
    el.__pcm = I; inst.push(I); if (io) io.observe(el);
    I.btn.textContent = I.playing ? 'Pause' : 'Play';
    var sw = d.sl.sweep || [d.sl.min, d.sl.max];
    var t0 = clamp((+d.sl.v - sw[0]) / (sw[1] - sw[0]), 0, 1); I.phase = Math.acos(1 - 2 * t0) / Math.PI * 0.5;
    I.sl.addEventListener('input', function () {
      I.playing = false; I.btn.textContent = 'Play'; I.dirty = true;
      if (!I.touched) { I.touched = true; track('concept_slider', { concept: id }); }
    });
    I.btn.addEventListener('click', function () {
      I.playing = !I.playing; I.btn.textContent = I.playing ? 'Pause' : 'Play';
      if (I.playing) { var t = clamp((+I.sl.value - sw[0]) / (sw[1] - sw[0]), 0, 1); I.phase = Math.acos(1 - 2 * t) / Math.PI * 0.5; }
      track('concept_play', { concept: id, playing: I.playing });
    });
    draw(I, 0);
    if (!running) { running = true; requestAnimationFrame(frame); }
  }
  function draw(I, dt) {
    var d = I.d, sw = d.sl.sweep || [d.sl.min, d.sl.max];
    if (I.playing) {
      I.phase = (I.phase + dt / (d.period || 10)) % 1;
      var e = (1 - Math.cos(I.phase * 2 * Math.PI)) / 2;
      I.sl.value = sw[0] + (sw[1] - sw[0]) * e; I.dirty = true;
    }
    var x = d.val ? d.val(+I.sl.value) : +I.sl.value;
    var fa = fit(I.ca);
    d.anim(fa.ctx, fa.w, fa.h, RM ? 0 : dt, x, I.st);
    if (I.dirty || I.playing || d.liveGraph) {
      var g = typeof d.graph === 'function' ? d.graph(x, I.st) : d.graph;
      plot(I.cg, g, x); I.ro.innerHTML = d.read(x, I.st); I.dirty = false;
    }
  }
  function frame(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    for (var i = inst.length - 1; i >= 0; i--) {
      var I = inst[i];
      if (!document.documentElement.contains(I.el)) { if (io) io.unobserve(I.el); inst.splice(i, 1); continue; }
      if (document.hidden || !I.vis || I.el.offsetParent === null) continue;
      try { draw(I, dt); } catch (e) { if (window.console) console.error('concept ' + I.id, e); inst.splice(i, 1); }
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', function () { inst.forEach(function (I) { I.dirty = true; }); });

  window.PCM = {
    LIB: LIB,
    mountIn: function (root) { (root || document).querySelectorAll('[data-concept]').forEach(mount); },
    reset: function (el) { el.removeAttribute('data-mounted'); el.__pcm = null; el.innerHTML = ''; }
  };
  var H = { C: C, kit: kit, swarm: swarm, clamp: clamp, lg: lg, lerp: lerp, fmt: fmt, sig: sig, def: def, line: line, MONO: MONO, SANS: SANS, DISP: DISP };
  window.PCM._h = H;
})();
(function () {
  var H = PCM._h, C = H.C, fmt = H.fmt, lg = H.lg, clamp = H.clamp, def = H.def;

  /* ---------- boiling under vacuum (toluene) ---------- */
  function tbTol(Pmbar) { return 1344.8 / (6.95464 - lg(Pmbar * 0.750062)) - 219.482; }
  var T_ATM = tbTol(1013.25);
  function gauge(K, x, y, r, frac, label) {
    K.st(C.paper, 2).circ(x, y, r);
    var a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, ctx = K.ctx;
    for (var k = 0; k <= 5; k++) { var a = a0 + (a1 - a0) * k / 5; K.st(C.muted, 1).ln(x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3), x + Math.cos(a) * (r - 1), y + Math.sin(a) * (r - 1)); }
    var an = a0 + (a1 - a0) * clamp(frac, 0, 1);
    K.st(C.orange, 2.5).ln(x, y, x + Math.cos(an) * (r - 2.5), y + Math.sin(an) * (r - 2.5));
    K.fi(C.paper).circ(x, y, 1.3, true);
    if (label) K.tx(label, x, y + r + 5, { sz: 3.3 });
  }
  function thermo(K, x, top, bot, frac, label) {
    K.st(C.paper, 1.5).rect(x - 1.6, top, 3.2, bot - top);
    K.fi(C.hot).circ(x, bot + 2.5, 3.4, true); K.st(C.paper, 1.5).circ(x, bot + 2.5, 3.4);
    var t = bot - (bot - top) * clamp(frac, 0, 1); K.fi(C.hot).rect(x - .9, t, 1.8, bot - t + 1, true);
    if (label) K.tx(label, x + 4, t + 1.5, { mono: 1, c: C.paper, al: 'left', sz: 4 });
  }
  PCM._h.gauge = gauge; PCM._h.thermo = thermo;

  def('vacuum', {
    t: 'Boiling Under Vacuum', eq: 'Lower pressure &times; Same liquid = Lower boiling point',
    eq2: 'log<sub>10</sub> P = A &minus; B / (C + T) &nbsp; (Antoine, toluene)',
    cap: 'Toluene in a still under vacuum', alt: 'Still with vacuum gauge and thermometer',
    sl: { label: 'Pressure above the liquid', min: 20, max: 1013, step: 1, v: 1013, sweep: [1013, 60] }, rp: 'br',
    anim: function (ctx, w, h, dt, P, st) {
      var K = H.kit(ctx, w, h), T = tbTol(P), cx = 40, cy = 64, r = 22;
      K.st(C.hot, 2.2).arc(cx, cy, r + 4, Math.PI * .15, Math.PI * .85);
      K.clip(function () { ctx.arc(K.X(cx), K.Y(cy), r * K.u, 0, 7); });
      K.fi(C.liquid).rect(cx - r, cy - 2, 2 * r, r + 4, true);
      var size = .9 + 1.4 * Math.pow(1013 / P, .3);
      st.b = st.b || []; while (st.b.length < 26) st.b.push({ x: cx - 16 + Math.random() * 32, y: cy + 4 + Math.random() * 16, s: .6 + Math.random() * .6 });
      st.b.forEach(function (b) { b.y -= dt * (9 + 6 * b.s); if (b.y < cy - 2) { b.y = cy + 14 + Math.random() * 6; b.x = cx - 16 + Math.random() * 32; } K.st('rgba(236,231,216,.7)', 1).circ(b.x, b.y, size * b.s); });
      K.un();
      K.st(C.paper, 2).arc(cx, cy, r, -Math.PI / 2 + .28, -Math.PI / 2 - .28 + 2 * Math.PI);
      K.ln(cx - 6, cy - r + .8, cx - 6, 20).ln(cx + 6, cy - r + .8, cx + 6, 26);
      K.st(C.muted, 2).ln(cx - 6, 20, cx - 6, 14, 66, 14).ln(cx + 6, 26, cx + 6, 20, 66, 20);
      st.v = ((st.v || 0) + dt * 14) % 8; ctx.lineDashOffset = -st.v * K.u;
      K.st('rgba(236,231,216,.75)', 2, [3, 5]).ln(cx, 40, cx, 17, 66, 17); ctx.lineDashOffset = 0;
      K.st(C.blue, 2).rect(66, 11, 24, 12); K.st(C.blue, 1); for (var i = 0; i < 3; i++) K.ln(68, 14 + i * 3, 88, 14 + i * 3);
      K.tx('condenser', 78, 8, { c: C.blue, sz: 3.4 });
      K.st(C.paper, 2).ln(78, 23, 78, 33).circ(78, 40, 7);
      K.clip(function () { ctx.arc(K.X(78), K.Y(40), 7 * K.u, 0, 7); }); K.fi(C.liquid).rect(71, 42, 14, 6, true); K.un();
      K.st(C.muted, 2).ln(85, 40, 97, 40); K.tx('to vacuum pump', 98, 54, { al: 'right', sz: 3.4 });
      gauge(K, 78, 72, 12, P / 1013, 'mbar');
      thermo(K, 10, 30, 82, T / 120, fmt(T, 0) + ' °C');
    },
    graph: {
      x0: 0, x1: 1013, y0: 0, y1: 125, xt: [0, 200, 400, 600, 800, 1000], yt: [0, 20, 40, 60, 80, 100, 120],
      xl: 'Pressure  (mbar abs)', yl: 'Boiling point  (°C)', hl: [{ y: T_ATM, label: fmt(T_ATM, 1) + ' °C at 1 atm' }],
      curves: [{ f: tbTol, from: 20, to: 1013, c: C.orange, label: 'toluene', lx: 560, dy: 22 }],
      points: function (P) { return [{ x: P, y: tbTol(P) }]; }
    },
    read: function (P) { return 'P  = <b>' + fmt(P, 0) + '</b> mbar\n   = ' + fmt(P * .750062, 0) + ' mmHg\nTb = <b>' + fmt(tbTol(P), 1) + '</b> °C'; }
  });

  /* ---------- steam pressure and temperature ---------- */
  function tsat(Pbara) { return 1810.94 / (8.14019 - lg(Pbara * 750.062)) - 244.485; }
  function hfg(T) { return 2501 - 2.4 * T - 0.0013 * T * T; }
  def('steam', {
    t: 'Steam Pressure and Temperature', eq: 'Higher steam pressure = Hotter steam', eq2: 'Saturated steam: one pressure gives one temperature',
    cap: 'Jacketed vessel heated by saturated steam', alt: 'Steam entering a reactor jacket',
    sl: { label: 'Steam pressure (bar g)', min: 0, max: 12, step: .1, v: 3, sweep: [0, 12] }, rp: 'br',
    anim: function (ctx, w, h, dt, Pg, st) {
      var K = H.kit(ctx, w, h), T = tsat(Pg + 1.013);
      K.st(C.hot, 2).poly([22, 30, 22, 80, 78, 80, 78, 30]);
      K.fi('rgba(183,64,47,.12)').rect(22, 30, 56, 50, true);
      K.fi(C.dark).rect(28, 34, 44, 40, true); K.st(C.paper, 2).rect(28, 34, 44, 40);
      K.fi(C.liquid).rect(29, 48 - 6 * (T - 100) / 90, 42, 25 + 6 * (T - 100) / 90, true);
      st.s = H.swarm(st, 'p', 34, [23, 31, 77, 79]).list;
      H.swarm(st, 'p', 34, [23, 31, 77, 79]).step(dt, 8 + Pg * 2);
      st.s.forEach(function (p) { if (p.x > 27 && p.x < 73 && p.y > 33 && p.y < 75) return; K.fi('rgba(236,231,216,.6)').circ(p.x, p.y, .8, true); });
      K.st(C.paper, 2).ln(8, 22, 22, 22, 22, 30).tx('steam in', 8, 18, { al: 'left', sz: 3.4 });
      K.st(C.blue, 2).ln(78, 76, 92, 76, 92, 90).tx('condensate', 92, 95, { c: C.blue, al: 'right', sz: 3.4 });
      gauge(K, 50, 14, 9, Pg / 12, '');
      K.tx(fmt(Pg, 1) + ' bar g', 64, 13, { mono: 1, c: C.paper, al: 'left', sz: 3.8 });
      K.tx(fmt(T, 0) + ' °C', 64, 18.5, { mono: 1, c: C.orange, al: 'left', sz: 3.8 });
    },
    graph: {
      x0: 0, x1: 12, y0: 90, y1: 200, xt: [0, 2, 4, 6, 8, 10, 12], yt: [100, 120, 140, 160, 180, 200],
      xl: 'Steam pressure  (bar g)', yl: 'Saturation temperature  (°C)',
      curves: [{ f: function (p) { return tsat(p + 1.013); }, c: C.orange, label: 'saturated steam', lx: 5, dy: 24 }],
      points: function (p) { return [{ x: p, y: tsat(p + 1.013) }]; }
    },
    read: function (p) { var T = tsat(p + 1.013); return 'P   = <b>' + fmt(p, 1) + '</b> bar g\nT   = <b>' + fmt(T, 0) + '</b> °C\nhfg ≈ ' + fmt(hfg(T), 0) + ' kJ/kg'; },
    note: 'Leave 10 to 20 °C between steam temperature and the process setpoint so the jacket can still drive heat in.'
  });

  /* ---------- Boyle's law ---------- */
  var KB = 10;
  def('boyle', {
    t: "Boyle's Law", eq: 'Pressure &times; Volume = Constant', eq2: 'PV = k &nbsp;&hArr;&nbsp; P &prop; 1/V &nbsp; (T constant, P absolute)',
    cap: 'Nitrogen at constant temperature', alt: 'Gas molecules in a cylinder with a piston',
    sl: { label: 'Gas volume', min: 2.5, max: 10, step: .05, v: 10, sweep: [10, 2.5] },
    anim: function (ctx, w, h, dt, V, st) {
      var K = H.kit(ctx, w, h), l = 30, r = 70, bot = 90, py = bot - 74 * V / 10;
      K.fi('rgba(183,64,47,.10)').rect(l, py + 2, r - l, bot - py - 2, true);
      var sw = H.swarm(st, 'p', 40, [l + 1.2, bot - 30, r - 1.2, bot - 1.2]);
      st.hits = st.hits || [];
      sw.list.forEach(function (p) { p.vx = Math.sign(p.vx || 1) * Math.max(.5, Math.abs(p.vx)); });
      var ceil = py + 3.2, before = sw.list.map(function (p) { return [p.vx, p.vy]; });
      sw.step(dt, 34, [l + 1.2, ceil, r - 1.2, bot - 1.2]);
      sw.list.forEach(function (p, i) { if (Math.sign(before[i][0]) !== Math.sign(p.vx) || Math.sign(before[i][1]) !== Math.sign(p.vy)) st.hits.push({ x: p.x < l + 3 ? l : p.x > r - 3 ? r : p.x, y: p.y > bot - 3 ? bot : p.y < ceil + 2 ? ceil - 1 : p.y, t: .35 }); });
      K.dots(sw.list, 1.25, C.cream);
      st.hits = st.hits.filter(function (q) { q.t -= dt; if (q.t <= 0) return false; ctx.globalAlpha = q.t / .35; K.fi(C.orange).circ(q.x, q.y, 1.1, true); ctx.globalAlpha = 1; return true; });
      K.st(C.blue, 2.5).ln(l - 1, 8, l - 1, bot + 1, r + 1, bot + 1, r + 1, 8);
      K.fi(C.steel).rect(l, py - 1, r - l, 3, true); K.fi('#3E4B57').rect(46, 0, 8, py - 1, true);
      K.tx('Piston', 57, 6, { c: C.paper, al: 'left', sz: 4 });
      var dv = V - (st.lv == null ? V : st.lv); st.lv = V;
      if (Math.abs(dv) > 1e-4) { var dn = dv < 0, ay = py - 10; K.st(dn ? C.red : C.blue, 2).ln(50, ay - 6, 50, ay + 2); if (dn) K.ln(48, ay, 50, ay + 3, 52, ay); else K.ln(48, ay - 4, 50, ay - 7, 52, ay - 4); }
      K.tx(fmt(KB / V, 2) + ' bar(a)', r + 4, (py + bot) / 2, { mono: 1, c: C.paper, al: 'left', sz: 4 });
      K.tx(fmt(V, 1) + ' L', r + 4, (py + bot) / 2 + 6, { mono: 1, al: 'left', sz: 4 });
    },
    graph: {
      x0: 2, x1: 10.5, y0: 0, y1: 5, xt: [2, 4, 6, 8, 10], yt: [0, 1, 2, 3, 4, 5], xl: 'Volume  V  (L)', yl: 'Pressure  P  (bar abs)',
      under: function (ctx, sx, sy, V) { var X = sx(V), Y = sy(KB / V); ctx.fillStyle = 'rgba(201,162,39,.10)'; ctx.fillRect(sx(2), Y, X - sx(2), sy(0) - Y); },
      curves: [{ f: function (v) { return KB / v; }, from: 2.5, to: 10, c: C.orange, label: 'PV = k', lx: 7.6, dy: -14 }],
      points: function (V) { return [{ x: V, y: KB / V }]; }
    },
    read: function (V) { return 'V   = <b>' + fmt(V, 2) + '</b> L\nP   = <b>' + fmt(KB / V, 3) + '</b> bar(a)\nP·V = ' + fmt(KB, 2) + ' bar·L'; }
  });

  /* ---------- gas cylinder: pressure follows temperature ---------- */
  var P15 = 200;
  function pcyl(T) { return P15 * (T + 273.15) / 288.15; }
  def('cylinder', {
    t: 'Gas Cylinder Pressure', eq: 'Same gas &times; Fixed volume: pressure follows absolute temperature', eq2: 'P<sub>1</sub>/T<sub>1</sub> = P<sub>2</sub>/T<sub>2</sub> &nbsp; (T in kelvin) &nbsp; contents &prop; P',
    cap: 'Nitrogen cylinder filled to 200 bar at 15 °C', alt: 'Gas cylinder with pressure gauge',
    sl: { label: 'Cylinder temperature', min: -20, max: 60, step: 1, v: 15, sweep: [-20, 60] },
    anim: function (ctx, w, h, dt, T, st) {
      var K = H.kit(ctx, w, h), P = pcyl(T);
      K.clip(function () { ctx.rect(K.X(32), K.Y(26), 36 * K.u, 66 * K.u); });
      K.fi(T > 40 ? 'rgba(183,64,47,.18)' : T < 0 ? 'rgba(143,184,232,.14)' : 'rgba(95,191,138,.08)').rect(32, 26, 36, 66, true);
      var sw = H.swarm(st, 'p', 46, [34, 28, 66, 90]); sw.step(dt, 14 + 0.35 * (T + 20)); K.dots(sw.list, 1.1, C.cream); K.un();
      K.st(C.paper, 2.5); ctx.beginPath(); ctx.moveTo(K.X(32), K.Y(92)); ctx.lineTo(K.X(32), K.Y(34)); ctx.quadraticCurveTo(K.X(32), K.Y(22), K.X(50), K.Y(21)); ctx.quadraticCurveTo(K.X(68), K.Y(22), K.X(68), K.Y(34)); ctx.lineTo(K.X(68), K.Y(92)); ctx.closePath(); ctx.stroke();
      K.st(C.paper, 2).rect(46, 12, 8, 9); K.ln(54, 15, 62, 15);
      gauge(K, 72, 13, 8, P / 280, '');
      K.tx(fmt(P, 0) + ' bar', 82, 11, { mono: 1, c: C.paper, al: 'left', sz: 3.8 });
      thermo(K, 14, 36, 82, (T + 20) / 80, fmt(T, 0) + ' °C');
    },
    graph: {
      x0: -20, x1: 60, y0: 150, y1: 250, xt: [-20, 0, 20, 40, 60], yt: [150, 175, 200, 225, 250], xl: 'Cylinder temperature  (°C)', yl: 'Pressure  (bar)',
      hl: [{ y: 200, label: 'filled to 200 bar at 15 °C' }],
      curves: [{ f: pcyl, c: C.orange, label: 'P ∝ T (K)', lx: 30, dy: -12 }],
      points: function (T) { return [{ x: T, y: pcyl(T) }]; }
    },
    read: function (T) { return 'T = <b>' + fmt(T, 0) + '</b> °C\nP = <b>' + fmt(pcyl(T), 0) + '</b> bar\ngas inside: unchanged'; },
    note: 'The gauge falls on a cold morning without any gas leaving. Compare readings at the same temperature, and never heat a cylinder with a flame.'
  });

  /* ---------- liquid nitrogen spill: oxygen depletion ---------- */
  var ROOM = 30, EXP = 0.694; // m³ room; m³ gas per litre LN2 at ~20 °C
  function o2(L) { return 20.9 * Math.exp(-L * EXP / ROOM); }
  def('cryo', {
    t: 'Cryogenic Liquid Expansion', eq: '1 litre of liquid nitrogen &rarr; about 694 litres of gas', eq2: 'O<sub>2</sub> &asymp; 20.9% &times; e<sup>&minus;V<sub>gas</sub>/V<sub>room</sub></sup> &nbsp; (well mixed room)',
    cap: 'Liquid nitrogen spilled in a closed 30 m³ room', alt: 'Dewar spilling nitrogen fog into a room',
    sl: { label: 'Liquid nitrogen spilled', min: 0, max: 40, step: .5, v: 0, sweep: [0, 40] }, rp: 'tl',
    anim: function (ctx, w, h, dt, L, st) {
      var K = H.kit(ctx, w, h), O = o2(L), f = 1 - O / 20.9;
      K.st(C.paper, 2).rect(8, 14, 84, 76);
      K.fi('rgba(236,231,216,' + (0.06 + f * .5) + ')').rect(9, 90 - Math.min(70, 6 + f * 140), 82, Math.min(70, 6 + f * 140), true);
      var sw = H.swarm(st, 'p', 30, [10, 16, 90, 88]); sw.step(dt, 6);
      sw.list.forEach(function (p, i) { K.fi(i / 30 < O / 20.9 ? C.blue : 'rgba(236,231,216,.5)').circ(p.x, p.y, 1, true); });
      K.st(C.paper, 2).rect(20, 70, 10, 18); K.ln(22, 70, 22, 66, 28, 66, 28, 70); K.tx('LN₂', 25, 95, { sz: 3.4 });
      var alarm = O < 19.5;
      K.fi(C.dark).rect(62, 22, 26, 14, true); K.st(alarm ? C.red : C.green, 2).rect(62, 22, 26, 14);
      K.tx(fmt(O, 1) + '% O₂', 75, 31, { mono: 1, c: alarm ? C.red : C.green, sz: 4 });
      if (alarm && (Date.now() / 400 | 0) % 2) K.tx('LOW OXYGEN', 75, 42, { c: C.red, wt: 700, sz: 3.6 });
    },
    graph: {
      x0: 0, x1: 40, y0: 10, y1: 22, xt: [0, 10, 20, 30, 40], yt: [10, 12, 14, 16, 18, 20, 22], xl: 'Liquid nitrogen spilled  (L)', yl: 'Oxygen in room  (%)',
      bands: [{ y: 1, from: 10, to: 19.5, fill: 'rgba(183,64,47,.10)', label: 'below 19.5%: oxygen deficient', color: C.red }],
      curves: [{ f: o2, c: C.blue }],
      points: function (L) { return [{ x: L, y: o2(L) }]; }
    },
    read: function (L) { return 'LN₂ = <b>' + fmt(L, 1) + '</b> L\ngas = ' + fmt(L * EXP, 1) + ' m³\nO₂  = <b>' + fmt(o2(L), 1) + '</b> %'; },
    note: 'You cannot smell or see the danger: the fog is condensed water, not the nitrogen. Use oxygen monitors and ventilation wherever cryogens are handled.'
  });

  /* ---------- Reynolds number: water, 50 mm pipe ---------- */
  var V0 = .005, V1 = 2;
  function vel(s) { return V0 * Math.pow(V1 / V0, s / 1000); }
  function reOf(v) { return 1000 * v * .05 / .001; }
  function fr(Re) {
    if (Re <= 2300) return 64 / Re;
    var fl = 64 / 2300, ft = .316 * Math.pow(4000, -.25);
    if (Re < 4000) { var t = (lg(Re) - lg(2300)) / (lg(4000) - lg(2300)); return Math.pow(10, lg(fl) + t * (lg(ft) - lg(fl))); }
    return .316 * Math.pow(Re, -.25);
  }
  function regime(Re) { return Re < 2300 ? 'laminar' : Re < 4000 ? 'transitional' : 'turbulent'; }
  function prof(y, tau) { return 1.5 * (1 - y * y) * (1 - tau) + 1.22 * Math.pow(Math.max(0, 1 - Math.abs(y)), 1 / 7) * tau; }
  def('reynolds', {
    t: 'Reynolds Number', eq: 'Density &times; Velocity &times; Diameter / Viscosity', eq2: 'Re = &rho;vD / &mu; &nbsp; laminar &lt; 2300 &lt; transitional &lt; 4000 &lt; turbulent',
    cap: 'Water at 20 °C in a 50 mm pipe', alt: 'Dye streak in a pipe going from smooth to turbulent',
    sl: { label: 'Velocity in the pipe', min: 0, max: 1000, step: 1, v: 0, sweep: [0, 1000] }, val: vel, rp: 'bl',
    anim: function (ctx, w, h, dt, v, st) {
      var Re = reOf(v), tau = clamp((Re - 2300) / 1700, 0, 1);
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
      var x0 = 3, x1 = 97, mid = h / 2, R = Math.min(h * .22, w * .16), sc = w / 100, vis = 10 + 30 * (lg(v / V0) / lg(V1 / V0));
      ctx.fillStyle = C.dark; ctx.fillRect(x0 * sc, mid - R, (x1 - x0) * sc, 2 * R);
      ctx.strokeStyle = C.paper; ctx.lineWidth = 2.5; H.line(ctx, [x0 * sc, mid - R, x1 * sc, mid - R]); H.line(ctx, [x0 * sc, mid + R, x1 * sc, mid + R]);
      st.tr = st.tr || []; while (st.tr.length < 70) st.tr.push({ x: x0 + Math.random() * (x1 - x0), y: Math.random() * 1.9 - .95 });
      ctx.fillStyle = 'rgba(143,184,232,.55)';
      st.tr.forEach(function (p) {
        p.x += dt * vis * prof(p.y, tau);
        if (tau > 0) { p.y += (Math.random() - .5) * tau * dt * 7; if (p.y > .95) p.y = 1.9 - p.y; if (p.y < -.95) p.y = -1.9 - p.y; }
        if (p.x > x1) { p.x = x0; p.y = Math.random() * 1.9 - .95; }
        ctx.beginPath(); ctx.arc(p.x * sc, mid + p.y * R, 1.6, 0, 7); ctx.fill();
      });
      st.dye = st.dye || []; st.em = (st.em || 0) + dt;
      while (st.em > .012) { st.em -= .012; st.dye.push({ x: 12, y: 0 }); }
      if (dt === 0 && !st.dye.length) for (var i = 0; i < 80; i++) st.dye.push({ x: 12 + i, y: 0 });
      ctx.fillStyle = C.orange;
      st.dye = st.dye.filter(function (p) {
        p.x += dt * vis * prof(p.y, tau);
        var kick = tau * tau * 9 + (Re > 1500 ? (Re - 1500) / 2500 : 0);
        p.y = clamp(p.y + (Math.random() - .5) * kick * dt * 3 * (p.x - 12) / 30, -.97, .97);
        if (p.x < x1) { ctx.globalAlpha = clamp(1 - (p.x - 12) / 110 * tau, .25, 1); ctx.beginPath(); ctx.arc(p.x * sc, mid + p.y * R, 1.9, 0, 7); ctx.fill(); }
        return p.x < x1;
      });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = C.orange; ctx.lineWidth = 2; H.line(ctx, [12 * sc, mid - R - 14, 12 * sc, mid]);
      ctx.font = '500 12px ' + H.SANS; ctx.textAlign = 'center'; ctx.fillText('dye', 12 * sc, mid - R - 18);
      var bx = 74 * sc, k = Math.min(R * .55, 16 * sc);
      ctx.strokeStyle = C.dim; ctx.lineWidth = 1; H.line(ctx, [bx, mid - R, bx, mid + R]);
      ctx.strokeStyle = C.brass; ctx.lineWidth = 2; ctx.beginPath();
      for (var j = 0; j <= 40; j++) { var y = -1 + j / 20, X = bx + prof(clamp(y, -1, 1), tau) * k; if (j) ctx.lineTo(X, mid + y * R); else ctx.moveTo(X, mid + y * R); }
      ctx.stroke(); ctx.lineWidth = 1.2;
      for (var q = -3; q <= 3; q++) { var yy = q / 3.6, L2 = prof(yy, tau) * k; if (L2 < 3) continue; H.line(ctx, [bx, mid + yy * R, bx + L2 - 2, mid + yy * R]); H.line(ctx, [bx + L2 - 5, mid + yy * R - 3, bx + L2 - 1, mid + yy * R, bx + L2 - 5, mid + yy * R + 3]); }
      ctx.fillStyle = C.brass; ctx.font = '500 12px ' + H.SANS; ctx.fillText('velocity profile', bx + k * .6, mid + R + 18);
      ctx.fillStyle = Re < 2300 ? C.blue : Re < 4000 ? C.brass : C.orange;
      ctx.font = '800 ' + Math.max(20, h * .075) + 'px ' + H.DISP;
      var rg = regime(Re); ctx.fillText(rg.charAt(0).toUpperCase() + rg.slice(1), w / 2, mid - R - 40 > 20 ? mid - R - 40 : 26);
      ctx.fillStyle = C.paper; ctx.font = '600 13px ' + H.MONO; ctx.fillText('v = ' + fmt(v, 2) + ' m/s', w / 2, mid + R + 40);
    },
    graph: {
      logx: true, logy: true, x0: 100, x1: 200000, y0: .01, y1: .5, xt: [100, 1000, 10000, 100000], yt: [.01, .02, .05, .1, .2, .5],
      fx: function (t) { return t.toLocaleString('en-US'); }, xl: 'Reynolds number  Re', yl: 'Friction factor  f  (Darcy)',
      bands: [{ from: 100, to: 2300, fill: 'rgba(143,184,232,.05)', label: 'Laminar', color: C.blue }, { from: 2300, to: 4000, fill: 'rgba(201,162,39,.12)' }, { from: 4000, to: 200000, fill: 'rgba(240,138,60,.05)', label: 'Turbulent', color: C.orange }],
      curves: [{ f: function (r) { return 64 / r; }, from: 100, to: 2300, c: C.blue, label: 'f = 64/Re', lx: 420, dx: 10, dy: 0 }, { f: fr, from: 2300, to: 4000, c: C.brass, dash: [5, 4] }, { f: function (r) { return .316 * Math.pow(r, -.25); }, from: 4000, to: 200000, c: C.orange, label: 'smooth pipe', lx: 15000, dy: -12 }],
      points: function (v) { var Re = reOf(v); return [{ x: Re, y: fr(Re) }]; }
    },
    read: function (v) { var Re = reOf(v); return 'v  = <b>' + fmt(v, 3) + '</b> m/s\nRe = <b>' + fmt(Math.round(Re), 0) + '</b>\n     ' + regime(Re) + '\nf  = ' + fmt(fr(Re), 4); }
  });

  /* ---------- pressure drop in a line ---------- */
  function dP(Qm3h, Dmm) {
    var D = Dmm / 1000, A = Math.PI * D * D / 4, v = Qm3h / 3600 / A, Re = 1000 * v * D / .001, e = .045e-3;
    var f = Re < 2300 ? 64 / Math.max(Re, 1) : .25 / Math.pow(lg(e / (3.7 * D) + 5.74 / Math.pow(Re, .9)), 2);
    return { v: v, Re: Re, f: f, bar: f * (100 / D) * 1000 * v * v / 2 / 1e5 };
  }
  def('dp', {
    t: 'Pressure Drop in a Line', eq: 'Double the flow &rarr; about four times the pressure drop', eq2: '&Delta;P = f (L/D) &rho;v&sup2;/2 &nbsp; (Darcy&ndash;Weisbach)',
    cap: 'Water through 100 m of 50 mm and 40 mm pipe', alt: 'Pipe with pressure gauges at each end',
    sl: { label: 'Flow rate (m³/h)', min: 1, max: 20, step: .1, v: 5, sweep: [1, 20] }, rp: 'tl',
    anim: function (ctx, w, h, dt, Q, st) {
      var K = H.kit(ctx, w, h), a = dP(Q, 50);
      K.fi(C.dark).rect(8, 46, 84, 10, true); K.st(C.paper, 2).ln(8, 46, 92, 46).ln(8, 56, 92, 56);
      st.o = ((st.o || 0) + dt * a.v * 18) % 10; ctx.lineDashOffset = -st.o * K.u;
      K.st(C.blue, 2.5, [3, 7]).ln(8, 51, 92, 51); ctx.lineDashOffset = 0;
      var p1 = 1 + a.bar, p2 = 1;
      gauge(K, 22, 30, 9, p1 / 6, ''); gauge(K, 78, 30, 9, p2 / 6, '');
      K.st(C.paper, 2).ln(22, 39, 22, 46).ln(78, 39, 78, 46);
      K.tx(fmt(p1, 2) + ' bar g', 22, 72, { mono: 1, c: C.paper, sz: 3.8 }).tx('inlet', 22, 77, { sz: 3.3 });
      K.tx('1.00 bar g', 78, 72, { mono: 1, c: C.paper, sz: 3.8 }).tx('outlet', 78, 77, { sz: 3.3 });
      K.tx('100 m of 50 mm pipe', 50, 88, { sz: 3.4 });
      K.tx('ΔP ' + fmt(a.bar, 2) + ' bar', 50, 64, { mono: 1, c: C.orange, sz: 4 });
    },
    graph: {
      x0: 0, x1: 20, y0: 0, y1: 6, xt: [0, 5, 10, 15, 20], yt: [0, 1, 2, 3, 4, 5, 6], xl: 'Flow  (m³/h)', yl: 'Pressure drop per 100 m  (bar)',
      curves: [{ f: function (q) { return dP(q, 40).bar; }, from: .5, c: C.blue, a: .7, label: '40 mm', lx: 9.5, dy: -8, al: 'right' }, { f: function (q) { return dP(q, 50).bar; }, from: .5, c: C.orange, label: '50 mm', lx: 16, dy: 18 }],
      points: function (q) { return [{ x: q, y: dP(q, 50).bar }]; }
    },
    read: function (q) { var a = dP(q, 50); return 'Q  = <b>' + fmt(q, 1) + '</b> m³/h\nv  = ' + fmt(a.v, 2) + ' m/s\nΔP = <b>' + fmt(a.bar, 2) + '</b> bar'; },
    note: 'One pipe size smaller costs roughly three times the pressure drop at the same flow. Fittings, strainers and partly shut valves add to it.'
  });

  /* ---------- pump affinity laws ---------- */
  var N0 = 1450, Q0 = 50, H0 = 32, P0 = 6.2;
  def('affinity', {
    t: 'Pump Affinity Laws', eq: 'Flow &prop; N &nbsp; Head &prop; N&sup2; &nbsp; Power &prop; N&sup3;', eq2: 'Q<sub>2</sub>/Q<sub>1</sub> = N<sub>2</sub>/N<sub>1</sub> &nbsp; H<sub>2</sub>/H<sub>1</sub> = (N<sub>2</sub>/N<sub>1</sub>)<sup>2</sup> &nbsp; P<sub>2</sub>/P<sub>1</sub> = (N<sub>2</sub>/N<sub>1</sub>)<sup>3</sup>',
    cap: 'Centrifugal pump on a VFD, rated 1450 rpm', alt: 'Centrifugal pump lifting water up a column',
    sl: { label: 'Pump speed (rpm)', min: 500, max: 1450, step: 5, v: 1450, sweep: [1450, 600] }, rp: 'tl',
    anim: function (ctx, w, h, dt, N, st) {
      var K = H.kit(ctx, w, h), r = N / N0, px = 26, py = 70, pr = 13;
      st.a = (st.a || 0) + dt * 2 * Math.PI * 1.1 * r; st.f = ((st.f || 0) + dt * 22 * r) % 9;
      K.st(C.paper, 2).ln(2, py - 3, px - pr + 1, py - 3).ln(2, py + 3, px - pr + 1, py + 3).ln(px + 3, py - pr + 1, px + 3, 52, 60, 52).ln(px + 9, py - pr + 3, px + 9, 58, 60, 58);
      ctx.lineDashOffset = -st.f * K.u; K.st(C.blue, 2.5, [3, 6]).ln(2, py, px - pr, py).st(C.blue, 2.5, [3, 6]).ln(px + 6, py - pr, px + 6, 55, 62, 55); ctx.lineDashOffset = 0;
      K.st(C.paper, 2).circ(px, py, pr);
      K.st(C.brass, 2);
      for (var i = 0; i < 6; i++) { var a = st.a + i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(K.X(px) + Math.cos(a) * 2.5 * K.u, K.Y(py) + Math.sin(a) * 2.5 * K.u); ctx.quadraticCurveTo(K.X(px) + Math.cos(a + .5) * 7 * K.u, K.Y(py) + Math.sin(a + .5) * 7 * K.u, K.X(px) + Math.cos(a + .9) * 10.5 * K.u, K.Y(py) + Math.sin(a + .9) * 10.5 * K.u); ctx.stroke(); }
      K.fi(C.brass).circ(px, py, 2.2, true);
      var lvl = 62 - 50 * r * r; K.fi(C.liquid).rect(60, lvl, 12, 62 - lvl, true); K.st(C.paper, 2).ln(60, 8, 60, 62, 72, 62, 72, 8); K.st(C.blue, 1.5).ln(61, lvl, 71, lvl);
      K.tx(fmt(H0 * r * r, 1) + ' m', 66, 5, { mono: 1, c: C.blue, sz: 3.8 });
      var pl = 62 - 54 * r * r * r; K.st(C.paper, 1.5).rect(84, 8, 8, 54); K.fi(C.orange).rect(84.3, pl, 7.4, 61.7 - pl, true);
      K.tx(fmt(P0 * r * r * r, 1) + ' kW', 88, 5, { mono: 1, c: C.orange, sz: 3.8 }).tx('motor power', 88, 67, { sz: 3.3 }).tx('head', 66, 67, { sz: 3.3 });
      K.tx(fmt(N, 0) + ' rpm', px, py + pr + 8, { mono: 1, c: C.paper, sz: 4.2 });
      K.tx('Q ' + fmt(Q0 * r, 1) + ' m³/h', px + 8, 48, { mono: 1, c: C.blue, al: 'left', sz: 3.6 });
    },
    graph: {
      x0: 500, x1: 1450, y0: 0, y1: 105, xt: [600, 800, 1000, 1200, 1400], yt: [0, 20, 40, 60, 80, 100], fy: function (t) { return t + '%'; }, xl: 'Pump speed  N  (rpm)', yl: '% of rated value',
      curves: [{ f: function (n) { return 100 * n / N0; }, c: C.brass, label: 'Flow ∝ N', lx: 760, dy: -10 }, { f: function (n) { return 100 * Math.pow(n / N0, 2); }, c: C.blue, label: 'Head ∝ N²', lx: 900, dy: 22 }, { f: function (n) { return 100 * Math.pow(n / N0, 3); }, c: C.orange, label: 'Power ∝ N³', lx: 1000, dy: 26 }],
      points: function (n) { var r = n / N0; return [{ x: n, y: 100 * r }, { x: n, y: 100 * r * r }, { x: n, y: 100 * r * r * r }]; }
    },
    read: function (N) { var r = N / N0; return 'N = <b>' + fmt(N, 0) + '</b> rpm (' + fmt(100 * r, 0) + '%)\nQ = ' + fmt(Q0 * r, 1) + ' m³/h\nH = ' + fmt(H0 * r * r, 1) + ' m\nP = <b>' + fmt(P0 * r * r * r, 2) + '</b> kW'; }
  });

  /* ---------- positive displacement vs centrifugal ---------- */
  function qCent(p) { return 20 * Math.sqrt(Math.max(0, 1 - p / 6)); }
  function qPD(p, wear) { return Math.max(0, 20 - (0.15 + 1.6 * wear) * p); }
  def('pdpump', {
    t: 'Positive Displacement vs Centrifugal', eq: 'PD pump: flow stays nearly constant &nbsp; Centrifugal: flow falls as pressure rises',
    eq2: 'Q<sub>PD</sub> = displacement &times; speed &minus; slip &nbsp; slip grows with pressure, wear and thin liquids',
    cap: 'Gear pump at fixed speed', alt: 'Two meshing gears moving liquid',
    sl: { label: 'Discharge pressure (bar g)', min: 0, max: 8, step: .1, v: 1, sweep: [0, 8] }, rp: 'br',
    anim: function (ctx, w, h, dt, p, st) {
      var K = H.kit(ctx, w, h), q = qPD(p, .3);
      st.a = (st.a || 0) + dt * 2.2;
      [[40, 50, 1], [60, 50, -1]].forEach(function (g) {
        K.st(C.brass, 2).circ(g[0], g[1], 11);
        for (var i = 0; i < 10; i++) { var a = st.a * g[2] + i * Math.PI / 5 + (g[2] < 0 ? Math.PI / 10 : 0); K.ln(g[0] + Math.cos(a) * 11, g[1] + Math.sin(a) * 11, g[0] + Math.cos(a) * 14, g[1] + Math.sin(a) * 14); }
        K.fi(C.brass).circ(g[0], g[1], 2, true);
      });
      K.st(C.paper, 2).poly([24, 34, 76, 34, 76, 66, 24, 66]);
      K.st(C.paper, 2).ln(4, 46, 24, 46).ln(4, 54, 24, 54).ln(76, 46, 96, 46).ln(76, 54, 96, 54);
      st.f = ((st.f || 0) + dt * q) % 10; ctx.lineDashOffset = -st.f * K.u;
      K.st(C.blue, 2.5, [3, 7]).ln(4, 50, 24, 50).st(C.blue, 2.5, [3, 7]).ln(76, 50, 96, 50); ctx.lineDashOffset = 0;
      K.st(C.blue, 1.5, [2, 3]).arc(50, 50, 30, Math.PI * 1.15, Math.PI * 1.85).st(C.blue, 1.5, [2, 3]).arc(50, 50, 30, Math.PI * .15, Math.PI * .85);
      gauge(K, 86, 22, 8, p / 10, '');
      K.tx(fmt(p, 1) + ' bar g', 86, 36, { mono: 1, c: C.paper, sz: 3.6 });
      K.tx('slip', 50, 80, { c: C.orange, sz: 3.6 }); K.st(C.orange, 1.5).ln(62, 74, 50, 70, 38, 74);
      K.tx('Q ' + fmt(q, 1) + ' m³/h', 14, 40, { mono: 1, c: C.blue, sz: 3.6 });
    },
    graph: {
      x0: 0, x1: 8, y0: 0, y1: 24, xt: [0, 2, 4, 6, 8], yt: [0, 5, 10, 15, 20], xl: 'Discharge pressure  (bar g)', yl: 'Flow  (m³/h)',
      curves: [{ f: function (p) { return qPD(p, .05); }, c: C.brass, label: 'PD, new', lx: 5.3, dy: -10 }, { f: function (p) { return qPD(p, .3); }, c: C.brass, dash: [5, 4], label: 'PD, worn', lx: 1.2, dy: 22 }, { f: qCent, to: 6, c: C.blue, label: 'centrifugal', lx: 3.1, dy: 22 }],
      points: function (p) { return [{ x: p, y: qPD(p, .3) }, { x: p, y: qCent(p) }]; }
    },
    read: function (p) { return 'P        = <b>' + fmt(p, 1) + '</b> bar g\nPD worn  = <b>' + fmt(qPD(p, .3), 1) + '</b> m³/h\ncentrif. = ' + fmt(qCent(p), 1) + ' m³/h'; },
    note: 'Never close the discharge of a PD pump: pressure rises until something gives. Fit a relief valve. A worn gear pump loses flow at high pressure because more liquid slips back.'
  });

  /* ---------- horizontal tank volume vs level ---------- */
  function hvol(f) { var R = 1, h = 2 * f; return (R * R * Math.acos((R - h) / R) - (R - h) * Math.sqrt(Math.max(0, 2 * R * h - h * h))) / Math.PI; }
  def('tank', {
    t: 'Tank Volume from Level', eq: 'Vertical tank: volume &prop; level &nbsp; Horizontal drum: it is not',
    eq2: 'V = L [R&sup2; cos<sup>&minus;1</sup>((R&minus;h)/R) &minus; (R&minus;h)&radic;(2Rh &minus; h&sup2;)]',
    cap: 'Horizontal drum, end view', alt: 'Cross-section of a horizontal drum filling',
    sl: { label: 'Level (% of diameter)', min: 0, max: 100, step: 1, v: 50, sweep: [0, 100] }, rp: 'br',
    anim: function (ctx, w, h, dt, L, st) {
      var K = H.kit(ctx, w, h), cx = 50, cy = 48, R = 32, y = cy + R - 2 * R * L / 100;
      K.clip(function () { ctx.arc(K.X(cx), K.Y(cy), R * K.u, 0, 7); });
      K.fi(C.liquid).rect(cx - R, y, 2 * R, cy + R - y, true);
      st.w = (st.w || 0) + dt; K.st(C.blue, 1.5); ctx.beginPath(); for (var i = 0; i <= 40; i++) { var X = cx - R + 2 * R * i / 40; var Y = y + Math.sin(i / 3 + st.w * 3) * .6; if (i) ctx.lineTo(K.X(X), K.Y(Y)); else ctx.moveTo(K.X(X), K.Y(Y)); } ctx.stroke();
      K.un(); K.st(C.paper, 2.5).circ(cx, cy, R);
      K.st(C.muted, 1, [2, 2]).ln(cx + R + 4, cy + R, cx + R + 4, y); K.st(C.muted, 1).ln(cx + R + 2, y, cx + R + 6, y);
      K.tx(fmt(L, 0) + '% level', cx + R + 6, y + 1.5, { mono: 1, c: C.paper, al: 'left', sz: 3.6 });
      K.tx(fmt(100 * hvol(L / 100), 0) + '% full', cx, 93, { mono: 1, c: C.blue, sz: 4.4 });
    },
    graph: {
      x0: 0, x1: 100, y0: 0, y1: 100, xt: [0, 25, 50, 75, 100], yt: [0, 25, 50, 75, 100], xl: 'Level  (% of diameter)', yl: 'Volume  (% of full)',
      curves: [{ f: function (x) { return x; }, c: C.muted, dash: [5, 4], lw: 1.5, label: 'vertical tank', lx: 62, dy: -10, al: 'right' }, { f: function (x) { return 100 * hvol(x / 100); }, c: C.orange, label: 'horizontal drum', lx: 60, dy: 22 }],
      points: function (L) { return [{ x: L, y: 100 * hvol(L / 100) }]; }
    },
    read: function (L) { return 'level  = <b>' + fmt(L, 0) + '</b> %\nvolume = <b>' + fmt(100 * hvol(L / 100), 1) + '</b> %'; },
    note: 'At 25% level a horizontal drum holds only about 20% of its volume. Dished ends add a little more; use a strapping table for custody figures.'
  });
})();
(function () {
  var H = PCM._h, C = H.C, fmt = H.fmt, lg = H.lg, clamp = H.clamp, def = H.def, sig = H.sig;

  /* ---------- distillation: relative volatility and stages ---------- */
  var XD = .95, XB = .05;
  function nmin(a) { return Math.log((XD / (1 - XD)) * ((1 - XB) / XB)) / Math.log(a); }
  def('distill', {
    t: 'Relative Volatility and Stages', eq: 'Bigger difference in volatility = Fewer stages', eq2: 'N<sub>min</sub> = ln[(x<sub>D</sub>/(1&minus;x<sub>D</sub>))((1&minus;x<sub>B</sub>)/x<sub>B</sub>)] / ln &alpha; &nbsp; (Fenske, total reflux)',
    cap: 'Column taking a binary from 5% to 95% purity', alt: 'Distillation column with trays',
    sl: { label: 'Relative volatility α', min: 1.2, max: 5, step: .05, v: 2.5, sweep: [5, 1.3] }, rp: 'br',
    anim: function (ctx, w, h, dt, a, st) {
      var K = H.kit(ctx, w, h), N = Math.ceil(nmin(a)), top = 14, bot = 82, n = Math.min(N, 34), gap = (bot - top) / (n + 1);
      K.fi(C.dark).rect(38, top, 24, bot - top, true); K.st(C.paper, 2).rect(38, top, 24, bot - top);
      K.st(C.muted, 1.2); for (var i = 1; i <= n; i++) K.ln(39, top + gap * i, 61, top + gap * i);
      var sw = H.swarm(st, 'v', 30, [40, top + 1, 60, bot - 1]);
      sw.list.forEach(function (p) { p.y -= dt * 12; if (p.y < top + 1) p.y = bot - 1; });
      sw.list.forEach(function (p) { var frac = (bot - p.y) / (bot - top); K.fi(frac > .5 ? 'rgba(242,215,160,.85)' : 'rgba(240,138,60,.8)').circ(p.x, p.y, .9, true); });
      K.st(C.blue, 2).rect(66, 4, 20, 8).ln(50, top, 50, 8, 66, 8).tx('condenser', 76, 2.6, { c: C.blue, sz: 3.2 });
      K.st(C.hot, 2).rect(40, 86, 20, 8).ln(50, bot, 50, 86).tx('reboiler', 50, 99, { c: C.hot, sz: 3.2 });
      K.tx(N + (N > 34 ? '+' : '') + ' stages', 64, (top + bot) / 2, { mono: 1, c: C.paper, al: 'left', sz: 4.2 });
      K.tx('95% light', 88, 18, { c: C.cream, al: 'right', sz: 3.3 }); K.tx('5% light', 36, 92, { c: C.orange, al: 'right', sz: 3.3 });
    },
    graph: function (a) {
      var eq = function (x) { return a * x / (1 + (a - 1) * x); };
      return {
        x0: 0, x1: 1, y0: 0, y1: 1, xt: [0, .2, .4, .6, .8, 1], yt: [0, .2, .4, .6, .8, 1], xl: 'x, light component in liquid', yl: 'y, in vapour',
        curves: [{ f: function (x) { return x; }, c: C.muted, lw: 1.2 }, { f: eq, c: C.orange, label: 'equilibrium', lx: .38, dy: -10 }],
        over: function (ctx, sx, sy) {
          ctx.strokeStyle = C.brass; ctx.lineWidth = 1.6; ctx.beginPath();
          var x = XD, y = XD, k = 0; ctx.moveTo(sx(x), sy(y));
          while (x > XB && k < 60) { var xn = y / (a - (a - 1) * y); ctx.lineTo(sx(xn), sy(y)); ctx.lineTo(sx(xn), sy(xn)); x = xn; y = xn; k++; }
          ctx.stroke();
        },
        points: function () { return [{ x: XD, y: XD }]; }
      };
    },
    read: function (a) { return 'α    = <b>' + fmt(a, 2) + '</b>\nNmin = <b>' + fmt(nmin(a), 1) + '</b> stages'; },
    note: 'Real columns run above minimum reflux and need more stages than N<sub>min</sub>. A tray is less than one theoretical stage, so divide by tray efficiency.'
  });

  /* ---------- azeotrope shifts with pressure (ethanol + water, van Laar) ---------- */
  function psE(T) { return Math.pow(10, 8.20417 - 1642.89 / (230.3 + T)); }
  function psW(T) { return Math.pow(10, 8.07131 - 1730.63 / (233.426 + T)); }
  var A12 = 1.6798, A21 = .9227;
  function gam(x1) { var x2 = 1 - x1, d = A12 * x1 + A21 * x2; return [Math.exp(A12 * Math.pow(A21 * x2 / d, 2)), Math.exp(A21 * Math.pow(A12 * x1 / d, 2))]; }
  function bub(x1, Pmm) {
    var lo = -40, hi = 150, g = gam(x1), T = 0;
    for (var i = 0; i < 40; i++) { T = (lo + hi) / 2; var s = x1 * g[0] * psE(T) + (1 - x1) * g[1] * psW(T); if (s > Pmm) hi = T; else lo = T; }
    return [T, x1 * g[0] * psE(T) / Pmm];
  }
  var AZ = {};
  function azeo(Pm) {
    var k = Math.round(Pm); if (AZ[k]) return AZ[k];
    var P = k * .750062, prev = null, r = null;
    for (var i = 600; i < 1000; i += 2) { var x = i / 1000, b = bub(x, P), d = b[1] - x; if (prev !== null && (prev > 0) !== (d > 0)) { r = [x, b[0]]; break; } prev = d; }
    return (AZ[k] = r);
  }
  def('azeo', {
    t: 'Azeotrope and Pressure', eq: 'At the azeotrope, vapour = liquid: distillation stops separating', eq2: 'Lower pressure moves the ethanol&ndash;water azeotrope toward pure ethanol',
    cap: 'Ethanol and water (van Laar model)', alt: 'Distillation column whose top product stops at the azeotrope',
    sl: { label: 'Column pressure (mbar abs)', min: 100, max: 1013, step: 1, v: 1013, sweep: [1013, 100] }, rp: 'br',
    anim: function (ctx, w, h, dt, P, st) {
      var K = H.kit(ctx, w, h), az = azeo(P), xa = az ? az[0] : 1;
      K.fi(C.dark).rect(32, 16, 22, 64, true); K.st(C.paper, 2).rect(32, 16, 22, 64);
      K.st(C.muted, 1.2); for (var i = 1; i < 10; i++) K.ln(33, 16 + i * 6.4, 53, 16 + i * 6.4);
      var sw = H.swarm(st, 'v', 26, [34, 17, 52, 79]); sw.list.forEach(function (p) { p.y -= dt * 10; if (p.y < 17) p.y = 79; K.fi('rgba(242,215,160,.8)').circ(p.x, p.y, .9, true); });
      K.st(C.blue, 2).ln(43, 16, 43, 8, 70, 8, 70, 20);
      K.st(C.paper, 2).rect(62, 20, 16, 30);
      K.fi(C.liquid).rect(63, 30, 14, 19, true);
      K.tx('distillate', 70, 56, { sz: 3.3 }).tx(fmt(xa * 100, 1) + '%', 70, 62, { mono: 1, c: C.cream, sz: 4 }).tx('ethanol (mol)', 70, 67, { sz: 3.2 });
      K.st(C.hot, 2).rect(34, 84, 18, 7).ln(43, 80, 43, 84);
      K.tx(fmt(P, 0) + ' mbar', 43, 98, { mono: 1, c: C.paper, sz: 3.8 });
      if (az) K.tx('max. at top', 70, 15, { c: C.orange, sz: 3.2 });
    },
    graph: function (P) {
      var Pmm = P * .750062, az = azeo(P);
      return {
        x0: .6, x1: 1, y0: .6, y1: 1, xt: [.6, .7, .8, .9, 1], yt: [.6, .7, .8, .9, 1], xl: 'x, ethanol in liquid (mol)', yl: 'y, ethanol in vapour',
        curves: [{ f: function (x) { return x; }, c: C.muted, lw: 1.2, label: 'y = x', lx: .64, dy: -6 }, { f: function (x) { return bub(Math.min(x, .999), Pmm)[1]; }, from: .6, to: .999, n: 80, c: C.orange }],
        points: function () { return az ? [{ x: az[0], y: az[0] }] : []; }
      };
    },
    read: function (P) { var a = azeo(P); return 'P     = <b>' + fmt(P, 0) + '</b> mbar\n' + (a ? 'azeo. = <b>' + fmt(a[0] * 100, 1) + '</b> mol%\n      at ' + fmt(a[1], 0) + ' °C' : 'no azeotrope\nin this model'); },
    note: 'Measured data put the 1 atm azeotrope at 89.4 mol% and 78.2 °C; this simple model gives 91.5%. The trend with pressure is the point: real ethanol&ndash;water loses its azeotrope at around 0.1 bar.'
  });

  /* ---------- azeotropic water removal (toluene, Dean-Stark) ---------- */
  function tHead(p) { return p < 92 ? 84.1 : 84.1 + (110.6 - 84.1) * Math.pow((p - 92) / 8, 1.4); }
  def('azeodry', {
    t: 'Azeotropic Water Removal', eq: 'Toluene + water boil together at 84 °C, below either liquid alone', eq2: 'Condensate splits into two layers: water stays in the trap, toluene returns',
    cap: 'Toluene reflux with a water separator (Dean&ndash;Stark)', alt: 'Flask with a water trap collecting a lower water layer',
    sl: { label: 'Water removed so far (%)', min: 0, max: 100, step: 1, v: 0, sweep: [0, 100] }, rp: 'br', period: 14,
    anim: function (ctx, w, h, dt, p, st) {
      var K = H.kit(ctx, w, h), T = tHead(p);
      K.st(C.hot, 2.2).arc(28, 70, 22, Math.PI * .15, Math.PI * .85);
      K.clip(function () { ctx.arc(K.X(28), K.Y(70), 18 * K.u, 0, 7); }); K.fi('rgba(242,215,160,.25)').rect(10, 66, 36, 24, true);
      var d = H.swarm(st, 'w', 20, [14, 68, 42, 86]); d.step(dt, 6); d.list.forEach(function (q, i) { if (i < 20 * (1 - p / 100)) K.fi(C.blue).circ(q.x, q.y, 1.1, true); });
      K.un(); K.st(C.paper, 2).circ(28, 70, 18).ln(25, 52.3, 25, 26).ln(31, 52.3, 31, 32, 50, 32, 50, 26);
      K.st(C.paper, 2).rect(46, 30, 8, 36);
      var wl = 66 - 30 * p / 100; K.fi(C.liquid).rect(46.5, wl, 7, 66 - wl, true); K.fi('rgba(242,215,160,.35)').rect(46.5, 34, 7, wl - 34, true);
      K.st(C.blue, 2).rect(44, 6, 12, 18).ln(28, 26, 28, 14, 44, 14);
      st.d = ((st.d || 0) + dt * 20) % 30; if (p < 98) K.fi(C.cream).circ(50, 26 + st.d / 4, .9, true);
      K.tx('water', 58, wl + (66 - wl) / 2 + 1, { c: C.blue, al: 'left', sz: 3.3 }).tx('toluene', 58, 38, { c: C.cream, al: 'left', sz: 3.3 });
      H.thermo(K, 76, 20, 70, (T - 60) / 60, fmt(T, 1) + ' °C'); K.tx('vapour', 76, 82, { sz: 3.2 });
    },
    graph: {
      x0: 0, x1: 100, y0: 75, y1: 115, xt: [0, 25, 50, 75, 100], yt: [80, 90, 100, 110], xl: 'Water removed  (% of total)', yl: 'Vapour temperature  (°C)',
      hl: [{ y: 110.6, label: 'toluene alone 110.6 °C', al: 'r' }, { y: 84.1, label: 'toluene-water azeotrope 84.1 °C' }],
      curves: [{ f: tHead, c: C.orange }], points: function (p) { return [{ x: p, y: tHead(p) }]; }
    },
    read: function (p) { return 'removed = <b>' + fmt(p, 0) + '</b> %\nvapour  = <b>' + fmt(tHead(p), 1) + '</b> °C'; },
    note: 'The batch is dry when the head temperature climbs to the pure solvent boiling point and the trap stops filling. Poor separation in the trap, or a wet return line, sends water back into the batch.'
  });

  /* ---------- filtration: cake resistance and time ---------- */
  function tf(al) { return al * 5e-7 + 200; }
  function cls(al) { return al < 1e8 ? 'good' : al < 1e9 ? 'moderate' : al < 1e10 ? 'slow' : 'very slow'; }
  function hrs(s) { return s < 3600 ? fmt(s / 60, 0) + ' min' : fmt(s / 3600, 1) + ' h'; }
  def('filter', {
    t: 'Cake Filtration', eq: 'Thicker, tighter cake = Slower filtration', eq2: 't/V = (&alpha;&mu;c / 2A&sup2;&Delta;P) V + &mu;R<sub>m</sub> / A&Delta;P &nbsp; (Ruth)',
    cap: '1 m² filter, 0.5 bar, 50 kg solid per m³ filtrate', alt: 'Nutsche filter with cake building up',
    sl: { label: 'Specific cake resistance α (log)', min: 7, max: 11, step: .02, v: 9, sweep: [7.3, 10.8] }, val: function (s) { return Math.pow(10, s); }, rp: 'br', period: 12,
    anim: function (ctx, w, h, dt, al, st) {
      var K = H.kit(ctx, w, h), a = al * 5e-7, b = 200, T = tf(al);
      st.t = ((st.t || 0) + dt / 6) % 1; var t = st.t * T, V = (-b + Math.sqrt(b * b + 4 * a * t)) / (2 * a), rate = b / (2 * a * V + b);
      K.st(C.paper, 2.5).ln(18, 10, 18, 70, 82, 70, 82, 10);
      var cake = 4 + 20 * V; K.fi('#8C7A5B').rect(19, 66 - cake, 62, cake, true);
      var slurry = 60 * (1 - V); K.fi('rgba(31,74,115,.85)').rect(19, 66 - cake - slurry, 62, slurry, true);
      var sw = H.swarm(st, 's', 26, [20, 12, 80, 60]); sw.step(dt, 5);
      sw.list.forEach(function (p) { if (p.y > 66 - cake - slurry && p.y < 66 - cake) K.fi(C.cream).circ(p.x, p.y, .8, true); });
      K.st(C.muted, 1.2, [1.5, 1.5]).ln(19, 67, 81, 67);
      K.st(C.paper, 2).ln(46, 70, 46, 78).ln(54, 70, 54, 78);
      st.dr = st.dr || []; st.acc = (st.acc || 0) + dt * 18 * rate;
      while (st.acc > 1) { st.acc -= 1; st.dr.push({ y: 79 }); }
      st.dr = st.dr.filter(function (d) { d.y += dt * 30; K.fi(C.blue).circ(50, d.y, 1, true); return d.y < 96; });
      K.tx('cake', 84, 66 - cake / 2, { al: 'left', sz: 3.3, c: '#C9B48A' }).tx('filtrate', 56, 92, { al: 'left', sz: 3.3, c: C.blue });
      K.tx(fmt(V * 1000, 0) + ' L', 50, 8, { mono: 1, c: C.paper, sz: 3.8 });
    },
    graph: {
      logx: true, logy: true, x0: 1e7, x1: 1e11, y0: 100, y1: 1e5, xt: [1e7, 1e8, 1e9, 1e10, 1e11], yt: [100, 1000, 1e4, 1e5],
      fx: function (t) { return '1e' + Math.round(lg(t)); }, fy: function (t) { return t < 3600 ? fmt(t / 60, 0) + ' min' : fmt(t / 3600, 0) + ' h'; },
      xl: 'Specific cake resistance  α  (m/kg)', yl: 'Time to filter 1 m³',
      bands: [{ from: 1e7, to: 1e8, fill: 'rgba(95,191,138,.07)', label: 'good', color: C.green }, { from: 1e8, to: 1e9, fill: 'rgba(201,162,39,.06)', label: 'moderate', color: C.brass }, { from: 1e9, to: 1e10, fill: 'rgba(240,138,60,.07)', label: 'slow', color: C.orange }, { from: 1e10, to: 1e11, fill: 'rgba(183,64,47,.10)', label: 'very slow', color: C.red }],
      curves: [{ f: tf, c: C.orange }], points: function (al) { return [{ x: al, y: tf(al) }]; }
    },
    read: function (al) { return 'α    = <b>' + al.toExponential(1) + '</b> m/kg\n       ' + cls(al) + '\ntime = <b>' + hrs(tf(al)) + '</b>'; },
    note: 'Measure α in a Büchner trial on the real slurry before choosing a filter. Fines from crystallization raise α sharply.'
  });

  /* ---------- drying: lab tray vs plant bed ---------- */
  function dcurve(d) { var tc = d / 2, tfa = .4 * d / 2; return { tc: tc, tf: tfa, tend: tc + tfa * Math.log(9.5 / .5) }; }
  function lod(t, d) { var c = dcurve(d); return t < c.tc ? 30 - 20 * t / c.tc : .5 + 9.5 * Math.exp(-(t - c.tc) / c.tf); }
  def('drying', {
    t: 'Drying Curve and Scale', eq: 'Deeper bed = Longer drying', eq2: 'Constant-rate period, then a falling-rate period as liquid retreats inside the cake',
    cap: 'Illustrative wet cake, 30% LOD to 1%', alt: 'Tray of wet cake drying from dark to pale',
    sl: { label: 'Cake depth (cm)', min: 1, max: 30, step: .5, v: 2, sweep: [2, 30] }, rp: 'tr', liveGraph: true, period: 12,
    anim: function (ctx, w, h, dt, d, st) {
      var K = H.kit(ctx, w, h), c = dcurve(d);
      st.p = ((st.p || 0) + dt / 5) % 1.15; st.t = Math.min(1, st.p) * c.tend * 1.05; st.d = d;
      var X = lod(st.t, d), wet = (X - .5) / 29.5;
      var depth = 4 + d * 1.6;
      K.st(C.paper, 2).ln(14, 80 - depth - 6, 14, 80, 86, 80, 86, 80 - depth - 6);
      var m = clamp((X - .5) / 15, 0, 1), r = Math.round(H.lerp(226, 92, m)), g = Math.round(H.lerp(208, 84, m)), b = Math.round(H.lerp(160, 78, m));
      K.fi('rgb(' + r + ',' + g + ',' + b + ')').rect(15, 80 - depth, 70, depth - .5, true);
      var sw = H.swarm(st, 'v', 18, [16, 10, 84, 80 - depth - 2]); sw.list.forEach(function (p) { p.y -= dt * 12; if (p.y < 10) p.y = 80 - depth - 2; });
      if (wet > .02) sw.list.forEach(function (p, i) { if (i < 18 * Math.min(1, wet * 2)) K.fi('rgba(236,231,216,.45)').circ(p.x, p.y, 1, true); });
      K.st(C.hot, 2).ln(14, 84, 86, 84).tx('heated shelf', 50, 90, { c: C.hot, sz: 3.3 });
      K.tx(fmt(X, 1) + '% LOD', 50, 8, { mono: 1, c: C.paper, sz: 4 }).tx(fmt(st.t, 1) + ' h', 86, 8, { mono: 1, c: C.muted, al: 'right', sz: 3.6 });
    },
    graph: function (d, st) {
      var t = st.t || 0;
      return {
        x0: 0, x1: 36, y0: 0, y1: 32, xt: [0, 6, 12, 18, 24, 30, 36], yt: [0, 10, 20, 30], xl: 'Drying time  (h)', yl: 'Moisture  (% LOD)',
        hl: [{ y: 1, label: 'target 1%', al: 'r' }],
        curves: [{ f: function (x) { return lod(x, 2); }, c: C.muted, lw: 1.5, label: 'lab tray, 2 cm', lx: 2.3, dy: 4 }, { f: function (x) { return lod(x, d); }, c: C.orange }],
        points: function () { return [{ x: t, y: lod(t, d) }]; }
      };
    },
    read: function (d) { return 'depth = <b>' + fmt(d, 1) + '</b> cm\ndry in ≈ <b>' + fmt(dcurve(d).tend, 1) + '</b> h'; },
    note: 'Numbers are illustrative. The shape is real: the constant-rate period scales with bed depth, and the falling-rate tail gets longer as heat and vapour have further to travel.'
  });

  /* ---------- fluidization ---------- */
  var UMF = 1.85, DPB = 22.7;
  function dpbed(U) { return U < UMF ? DPB * U / UMF : DPB; }
  def('fluid', {
    t: 'Minimum Fluidization', eq: 'Bed pressure drop rises with gas flow, then levels off at the bed weight', eq2: 'Re<sub>mf</sub> = &radic;(33.7&sup2; + 0.0408 Ar) &minus; 33.7 &nbsp; (Wen &amp; Yu)',
    cap: '200 µm particles, 1400 kg/m³, 30 cm bed, air', alt: 'Bed of particles that lifts and bubbles as air flow rises',
    sl: { label: 'Superficial gas velocity (cm/s)', min: 0, max: 8, step: .05, v: 0, sweep: [0, 8] }, rp: 'br',
    anim: function (ctx, w, h, dt, U, st) {
      var K = H.kit(ctx, w, h), ex = U < UMF ? 0 : Math.min(1, (U - UMF) / 5), bedTop = 50 - ex * 18;
      K.st(C.paper, 2).ln(26, 6, 26, 84, 74, 84, 74, 6);
      K.st(C.muted, 1.5, [2, 1.5]).ln(27, 84, 73, 84);
      st.p = st.p || []; if (!st.p.length) for (var i = 0; i < 260; i++) st.p.push({ x: 27.5 + Math.random() * 45, f: Math.random(), j: Math.random() * 6 });
      st.t = (st.t || 0) + dt;
      st.p.forEach(function (p) {
        var y = 83 - p.f * (83 - bedTop), jig = ex > 0 ? Math.sin(st.t * 9 + p.j) * ex * 1.2 : 0;
        K.fi('#C9B48A').circ(p.x + jig * .5, y + jig, .9, true);
      });
      if (U > UMF + .3) {
        st.b = st.b || []; st.ba = (st.ba || 0) + dt * (U - UMF) * 1.5;
        while (st.ba > 1) { st.ba -= 1; st.b.push({ x: 30 + Math.random() * 40, y: 82, r: 1.5 + Math.random() * 2 }); }
        st.b = st.b.filter(function (b) { b.y -= dt * 22; b.r += dt * 1.5; K.fi(C.bg).circ(b.x, b.y, b.r, true); return b.y > bedTop + 2; });
      }
      st.a = ((st.a || 0) + dt * (4 + U * 6)) % 8; ctx.lineDashOffset = -st.a * K.u;
      K.st(C.blue, 2, [2, 6]).ln(40, 98, 40, 86).st(C.blue, 2, [2, 6]).ln(50, 98, 50, 86).st(C.blue, 2, [2, 6]).ln(60, 98, 60, 86); ctx.lineDashOffset = 0;
      K.tx(U < UMF ? 'fixed bed' : 'fluidized', 50, 4.5, { c: U < UMF ? C.muted : C.orange, sz: 4, wt: 700 });
      K.tx('air', 66, 96, { c: C.blue, al: 'left', sz: 3.3 });
    },
    graph: {
      x0: 0, x1: 8, y0: 0, y1: 30, xt: [0, 2, 4, 6, 8], yt: [0, 10, 20, 30], xl: 'Gas velocity  U  (cm/s)', yl: 'Bed pressure drop  (mbar)',
      vl: [{ x: UMF, label: 'U_mf ≈ ' + fmt(UMF, 1) + ' cm/s', ty: 18 }], hl: [{ y: DPB, label: 'bed weight / area', al: 'r' }],
      curves: [{ f: dpbed, c: C.orange }], points: function (U) { return [{ x: U, y: dpbed(U) }]; }
    },
    read: function (U) { return 'U     = <b>' + fmt(U, 2) + '</b> cm/s\nU/Umf = ' + fmt(U / UMF, 1) + '\nΔP    = <b>' + fmt(dpbed(U), 1) + '</b> mbar'; },
    note: 'Fluid bed dryers usually run at a few times U<sub>mf</sub>. Wet, sticky product or a blocked distributor plate leaves dead zones that dry unevenly; keep U/U<sub>mf</sub> and bed depth the same on scale-up.'
  });

  /* ---------- centrifuge G-force ---------- */
  var RB = .6;
  function gf(n) { var w = 2 * Math.PI * n / 60; return w * w * RB / 9.81; }
  def('centrifuge', {
    t: 'Centrifuge G-Force', eq: 'Double the speed &rarr; four times the G-force', eq2: 'G = &omega;&sup2;r / g &nbsp; &omega; = 2&pi;N/60',
    cap: '1200 mm basket, top view', alt: 'Spinning basket throwing liquid through the cake',
    sl: { label: 'Basket speed (rpm)', min: 200, max: 1500, step: 10, v: 600, sweep: [200, 1500] }, rp: 'tl',
    anim: function (ctx, w, h, dt, n, st) {
      var K = H.kit(ctx, w, h), cx = 50, cy = 50; st.a = (st.a || 0) + dt * Math.min(9, n / 90);
      K.fi('#8C7A5B'); ctx.beginPath(); ctx.arc(K.X(cx), K.Y(cy), 34 * K.u, 0, 7); ctx.arc(K.X(cx), K.Y(cy), 27 * K.u, 0, 7, true); ctx.fill();
      K.st(C.paper, 2.5).circ(cx, cy, 34);
      for (var i = 0; i < 24; i++) { var a = st.a + i * Math.PI / 12; K.fi(C.bg).circ(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34, .7, true); }
      K.st(C.muted, 1.5); for (var j = 0; j < 4; j++) { var b = st.a + j * Math.PI / 2; K.ln(cx, cy, cx + Math.cos(b) * 26, cy + Math.sin(b) * 26); }
      K.fi(C.steel).circ(cx, cy, 4, true);
      st.d = st.d || []; st.e = (st.e || 0) + dt * n / 40;
      while (st.e > 1) { st.e -= 1; var t = Math.random() * 6.283; st.d.push({ a: t, r: 34 }); }
      st.d = st.d.filter(function (d) { d.r += dt * (8 + n / 30); K.fi(C.blue).circ(cx + Math.cos(d.a) * d.r, cy + Math.sin(d.a) * d.r, .9, true); return d.r < 50; });
      K.tx(fmt(gf(n), 0) + ' G', cx, cy + 2, { mono: 1, c: C.paper, sz: 4.4 }).tx('cake', cx, cy - 22, { c: '#C9B48A', sz: 3.3 });
    },
    graph: {
      x0: 200, x1: 1500, y0: 0, y1: 1600, xt: [200, 500, 800, 1100, 1400], yt: [0, 400, 800, 1200, 1600], xl: 'Basket speed  (rpm)', yl: 'G-force at the basket wall',
      curves: [{ f: gf, c: C.orange, label: 'G ∝ N²', lx: 900, dy: -12 }], points: function (n) { return [{ x: n, y: gf(n) }]; }
    },
    read: function (n) { return 'N   = <b>' + fmt(n, 0) + '</b> rpm\nG   = <b>' + fmt(gf(n), 0) + '</b>\nrim = ' + fmt(Math.PI * 1.2 * n / 60, 0) + ' m/s'; },
    note: 'Higher G drains the cake drier and faster, but compressible cakes can pack tight and blind. Always check the basket load limit at the chosen speed.'
  });

  /* ---------- settling (Stokes) ---------- */
  function vs(dum) { var d = dum * 1e-6; return 9.81 * d * d * 500 / (18 * 1e-3); }
  def('settle', {
    t: 'Settling Velocity', eq: 'Half the particle size &rarr; a quarter of the settling speed', eq2: 'v = g d&sup2; (&rho;<sub>p</sub> &minus; &rho;) / 18&mu; &nbsp; (Stokes)',
    cap: 'Solids 500 kg/m³ heavier than water, 1 mPa·s', alt: 'Particles settling in a tank',
    sl: { label: 'Particle size (µm, log)', min: 0, max: 2.2, step: .01, v: 1.3, sweep: [2.15, .3] }, val: function (s) { return Math.pow(10, s); }, rp: 'br',
    anim: function (ctx, w, h, dt, d, st) {
      var K = H.kit(ctx, w, h), v = vs(d), speed = 2 + 14 * clamp((lg(v) + 6) / 4, 0, 1.3);
      K.st(C.paper, 2.5).ln(24, 8, 24, 88, 76, 88, 76, 8);
      K.fi('rgba(31,74,115,.5)').rect(25, 14, 50, 73.5, true);
      st.sed = st.sed || 0;
      var sw = H.swarm(st, 'p', 70, [26, 15, 74, 86]);
      sw.list.forEach(function (p) { p.y += dt * speed; p.x += (Math.random() - .5) * dt * 4; if (p.y > 86 - st.sed) { p.y = 15 + Math.random() * 4; st.sed = Math.min(8, st.sed + .02); } });
      st.sed = Math.max(0, st.sed - dt * .2);
      K.dots(sw.list, clamp(.4 + d / 60, .4, 1.6), '#C9B48A');
      K.fi('#8C7A5B').rect(25, 87.5 - st.sed - 1, 50, st.sed + 1, true);
      K.tx(fmt(d, d < 10 ? 1 : 0) + ' µm', 50, 6, { mono: 1, c: C.paper, sz: 4 });
    },
    graph: {
      logx: true, logy: true, x0: 1, x1: 160, y0: .001, y1: 1000, xt: [1, 10, 100], yt: [.001, .01, .1, 1, 10, 100, 1000], fy: function (t) { return t >= 1 ? fmt(t, 0) : String(t); },
      xl: 'Particle size  (µm)', yl: 'Settling velocity  (mm/min)',
      curves: [{ f: function (d) { return vs(d) * 6e4 * 1000; }, c: C.blue, a: .6, dash: [5, 4], label: 'in a 1000 G centrifuge', lx: 1.3, dy: -8 }, { f: function (d) { return vs(d) * 6e4; }, c: C.orange, label: 'gravity', lx: 20, dy: 20 }],
      points: function (d) { return [{ x: d, y: vs(d) * 6e4 }]; }
    },
    read: function (d) { var v = vs(d), t = 1 / v; return 'd = <b>' + fmt(d, 1) + '</b> µm\nv = <b>' + sig(v * 6e4, 3) + '</b> mm/min\n1 m in ' + (t < 3600 ? fmt(t / 60, 0) + ' min' : fmt(t / 3600, 1) + ' h'); }
  });

  /* ---------- gas absorption (Kremser) ---------- */
  function rem(A) { var N = 5; return Math.abs(A - 1) < 1e-6 ? N / (N + 1) : (Math.pow(A, N + 1) - A) / (Math.pow(A, N + 1) - 1); }
  def('absorb', {
    t: 'Gas Absorption in a Scrubber', eq: 'More liquid per unit gas = More removed', eq2: 'A = L / mG &nbsp; removed = (A<sup>N+1</sup> &minus; A) / (A<sup>N+1</sup> &minus; 1) &nbsp; (Kremser, 5 stages)',
    cap: 'Packed scrubber, gas up, liquid down', alt: 'Packed column with gas rising and liquid falling',
    sl: { label: 'Absorption factor A = L/mG', min: .2, max: 3, step: .01, v: 1, sweep: [.3, 2.5] }, rp: 'br',
    anim: function (ctx, w, h, dt, A, st) {
      var K = H.kit(ctx, w, h), f = rem(A);
      K.fi(C.dark).rect(34, 12, 32, 72, true); K.st(C.paper, 2).rect(34, 12, 32, 72);
      K.st(C.dim, 1); for (var i = 0; i < 14; i++) for (var j = 0; j < 5; j++) K.circ(37.5 + j * 6.2 + (i % 2) * 3, 20 + i * 4.4, 1.6);
      st.g = st.g || []; st.ga = (st.ga || 0) + dt * 10;
      while (st.ga > 1) { st.ga -= 1; st.g.push({ x: 36 + Math.random() * 28, y: 83, stop: Math.random() < f ? 20 + Math.random() * 62 : -1 }); }
      st.g = st.g.filter(function (g) { g.y -= dt * 14; if (g.stop > 0 && g.y < g.stop) return false; K.fi(C.orange).circ(g.x, g.y, 1, true); return g.y > 2; });
      st.l = st.l || []; st.la = (st.la || 0) + dt * 6 * A;
      while (st.la > 1) { st.la -= 1; st.l.push({ x: 36 + Math.random() * 28, y: 13 }); }
      st.l = st.l.filter(function (l) { l.y += dt * 20; K.fi(C.blue).circ(l.x, l.y, .8, true); return l.y < 95; });
      K.tx('clean gas', 50, 6, { c: C.orange, sz: 3.3 }).tx('liquid in', 76, 14, { c: C.blue, al: 'left', sz: 3.3 }).tx('gas in', 76, 82, { c: C.orange, al: 'left', sz: 3.3 });
      K.st(C.blue, 2).ln(66, 15, 75, 15).st(C.orange, 2).ln(66, 80, 75, 80);
    },
    graph: {
      x0: .2, x1: 3, y0: 0, y1: 100, xt: [.5, 1, 1.5, 2, 2.5, 3], yt: [0, 20, 40, 60, 80, 100], fy: function (t) { return t + '%'; }, xl: 'Absorption factor  A = L/mG', yl: 'Solute removed from gas',
      curves: [{ f: function (A) { return 100 * rem(A); }, c: C.orange }], vl: [{ x: 1, label: 'A = 1', ty: 90 }], points: function (A) { return [{ x: A, y: 100 * rem(A) }]; }
    },
    read: function (A) { return 'A       = <b>' + fmt(A, 2) + '</b>\nremoved = <b>' + fmt(100 * rem(A), 1) + '</b> %\noutlet  = ' + fmt(1000 * (1 - rem(A)), 0) + ' ppm\n(from 1000 ppm)'; },
    note: 'Below A = 1 adding stages barely helps: the liquid is the limit. Absorption takes the gas into the liquid; adsorption holds it on a solid surface such as activated carbon.'
  });

  /* ---------- liquid-liquid extraction ---------- */
  var KD = 4;
  function left(n) { return 100 * Math.pow(1 / (1 + KD / n), n); }
  def('extract', {
    t: 'Extraction: One Wash or Several', eq: 'Same solvent split into several washes = More extracted', eq2: 'fraction left = [1 / (1 + K&middot;V<sub>s</sub>/V<sub>f</sub>n)]<sup>n</sup> &nbsp; K = 4',
    cap: 'Total solvent equal to the feed volume', alt: 'Separating funnel with solute moving into the top layer',
    sl: { label: 'Number of washes', min: 1, max: 6, step: 1, v: 1, sweep: [1, 6] }, val: function (s) { return Math.round(s); }, rp: 'tr', period: 14,
    anim: function (ctx, w, h, dt, n, st) {
      var K = H.kit(ctx, w, h), L = left(n) / 100;
      K.st(C.paper, 2.5); ctx.beginPath(); ctx.moveTo(K.X(30), K.Y(12)); ctx.lineTo(K.X(70), K.Y(12)); ctx.lineTo(K.X(70), K.Y(56)); ctx.lineTo(K.X(53), K.Y(78)); ctx.lineTo(K.X(53), K.Y(90)); ctx.moveTo(K.X(47), K.Y(90)); ctx.lineTo(K.X(47), K.Y(78)); ctx.lineTo(K.X(30), K.Y(56)); ctx.closePath(); ctx.stroke();
      K.fi('rgba(242,215,160,.18)').rect(31, 13, 38, 22, true); K.fi('rgba(31,74,115,.7)').rect(31, 35, 38, 21, true);
      K.tx('solvent', 72, 24, { al: 'left', sz: 3.3, c: C.cream }).tx('feed', 72, 46, { al: 'left', sz: 3.3, c: C.blue });
      var sw = H.swarm(st, 'p', 40, [32, 14, 68, 55]);
      sw.list.forEach(function (p, i) { var inFeed = i < 40 * L, tgt = inFeed ? [36, 68] : [15, 33]; if (p.y < tgt[0]) p.y += dt * 12; if (p.y > tgt[1]) p.y -= dt * 12; p.x += (Math.random() - .5) * dt * 6; p.x = clamp(p.x, 32, 68); });
      K.dots(sw.list, 1.1, C.orange);
      K.tx(n + (n === 1 ? ' wash' : ' washes'), 50, 7, { mono: 1, c: C.paper, sz: 4 });
    },
    graph: {
      x0: 1, x1: 6, y0: 0, y1: 25, xt: [1, 2, 3, 4, 5, 6], yt: [0, 5, 10, 15, 20, 25], fy: function (t) { return t + '%'; }, xl: 'Number of washes (same total solvent)', yl: 'Product left in the feed',
      hl: [{ y: 100 * Math.exp(-KD), label: 'limit ' + fmt(100 * Math.exp(-KD), 1) + '%', al: 'r' }],
      curves: [{ f: left, c: C.orange }], points: function (n) { return [{ x: n, y: left(n) }]; }
    },
    read: function (n) { return 'washes    = <b>' + n + '</b>\nleft      = <b>' + fmt(left(n), 1) + '</b> %\nextracted = ' + fmt(100 - left(n), 1) + ' %'; },
    note: 'Good extraction also needs enough mixing to reach equilibrium and enough settling time for a clean split. Emulsions and a rag layer lose more product than the sum suggests.'
  });

  /* ---------- size reduction (Bond) ---------- */
  var F80 = 5000, WI = 10;
  function bond(p) { return 10 * WI * (1 / Math.sqrt(p) - 1 / Math.sqrt(F80)); }
  var MESH = [[841, 20], [420, 40], [250, 60], [177, 80], [149, 100], [105, 140], [74, 200], [44, 325], [37, 400]];
  function mesh(p) { if (p > 841 || p < 37) return null; for (var i = 0; i < MESH.length - 1; i++) { var a = MESH[i], b = MESH[i + 1]; if (p <= a[0] && p >= b[0]) return Math.round(a[1] + (b[1] - a[1]) * (lg(a[0]) - lg(p)) / (lg(a[0]) - lg(b[0]))); } return null; }
  function mill(p) { return p > 300 ? 'multi mill' : p > 50 ? 'pulveriser' : 'jet mill'; }
  def('size', {
    t: 'Size Reduction Energy', eq: 'Finer product = Much more energy per tonne', eq2: 'E = 10 W<sub>i</sub> (1/&radic;P<sub>80</sub> &minus; 1/&radic;F<sub>80</sub>) &nbsp; (Bond, W<sub>i</sub> = 10 kWh/t)',
    cap: 'Feed 5 mm granules', alt: 'Particles breaking into smaller pieces in a mill',
    sl: { label: 'Product size P80 (µm, log)', min: 1, max: 3.3, step: .01, v: 2.5, sweep: [3.2, 1.05] }, val: function (s) { return Math.pow(10, s); }, rp: 'tr',
    anim: function (ctx, w, h, dt, p, st) {
      var K = H.kit(ctx, w, h), r = clamp(.35 + 2.6 * (lg(p) - 1) / 2.3, .35, 3.2);
      st.a = (st.a || 0) + dt * (2 + 8 * (3.3 - lg(p)));
      K.st(C.paper, 2).circ(50, 40, 26);
      K.st(C.brass, 2.5); for (var i = 0; i < 4; i++) { var a = st.a + i * Math.PI / 2; K.ln(50, 40, 50 + Math.cos(a) * 22, 40 + Math.sin(a) * 22); }
      K.fi(C.brass).circ(50, 40, 3, true);
      var sw = H.swarm(st, 'p', 60, [28, 18, 72, 62]); sw.step(dt, 20);
      sw.list.forEach(function (q) { if (Math.hypot(q.x - 50, q.y - 40) < 24) K.fi('#C9B48A').circ(q.x, q.y, r * .6, true); });
      K.st(C.muted, 1.2); for (var j = 0; j < 9; j++) K.ln(28 + j * 5.5, 72, 28 + j * 5.5, 78); K.ln(28, 72, 72, 72).ln(28, 78, 72, 78);
      K.tx('screen', 76, 76, { al: 'left', sz: 3.3 });
      st.f = st.f || []; st.fe = (st.fe || 0) + dt * 12;
      while (st.fe > 1) { st.fe -= 1; st.f.push({ x: 30 + Math.random() * 40, y: 79 }); }
      st.f = st.f.filter(function (f) { f.y += dt * 18; K.fi('#C9B48A').circ(f.x, f.y, r * .6, true); return f.y < 97; });
      K.tx(mill(p), 50, 8, { c: C.orange, sz: 4, wt: 700 });
    },
    graph: {
      logx: true, x0: 10, x1: 2000, y0: 0, y1: 32, xt: [10, 100, 1000], yt: [0, 10, 20, 30], xl: 'Product size P80  (µm)', yl: 'Energy  (kWh per tonne)',
      bands: [{ from: 10, to: 50, fill: 'rgba(240,138,60,.07)', label: 'jet mill', color: C.orange }, { from: 50, to: 300, fill: 'rgba(201,162,39,.06)', label: 'pulveriser', color: C.brass }, { from: 300, to: 2000, fill: 'rgba(143,184,232,.05)', label: 'multi mill', color: C.blue }],
      curves: [{ f: bond, c: C.orange }], points: function (p) { return [{ x: p, y: bond(p) }]; }
    },
    read: function (p) { var m = mesh(p); return 'P80  = <b>' + fmt(p, 0) + '</b> µm' + (m ? '\n     ≈ ' + m + ' mesh' : '') + '\nE    = <b>' + fmt(bond(p), 1) + '</b> kWh/t'; },
    note: 'Mill ranges overlap and depend on the product; the bands are a rough guide. Mesh sizes are US standard sieves.'
  });
})();
(function () {
  var H = PCM._h, C = H.C, fmt = H.fmt, lg = H.lg, clamp = H.clamp, def = H.def, sig = H.sig;

  function vessel(K, x, y, w, h, jacket) { // open-top vessel outline with optional jacket
    if (jacket) { K.st(C.hot, 2).ln(x - 3, y + h * .2, x - 3, y + h + 3, x + w + 3, y + h + 3, x + w + 3, y + h * .2); }
    K.st(C.paper, 2.2).ln(x, y, x, y + h, x + w, y + h, x + w, y);
  }
  function impeller(K, cx, y, r, ang) {
    K.st(C.steel, 2).ln(cx, 2, cx, y);
    var c = Math.cos(ang); K.st(C.brass, 2.5).ln(cx - r * c, y, cx + r * c, y);
    K.fi(C.brass).circ(cx, y, 1.2, true);
  }
  H.vessel = vessel; H.impeller = impeller;

  /* ---------- heat transfer area per volume falls with scale ---------- */
  function geo(V) { var D = Math.pow(4 * V / Math.PI, 1 / 3); return { D: D, AV: 5 / D }; }
  function heatT(V) { return 1000 * 4180 * 40 / (300 * geo(V).AV * 50); }
  function dur(s) { return s < 3600 ? fmt(s / 60, 0) + ' min' : fmt(s / 3600, 1) + ' h'; }
  def('area', {
    t: 'Area per Volume Falls on Scale-up', eq: 'Volume grows with D&sup3;, jacket area only with D&sup2;', eq2: 'A/V &prop; 1/D &nbsp; heat-up time &prop; V/(UA) &prop; D',
    cap: 'Jacketed vessel, H = D, U = 300 W/m²K, heating 40 K', alt: 'Jacketed vessel growing as batch size increases',
    sl: { label: 'Batch volume (log)', min: -3, max: 1.3, step: .01, v: -2.5, sweep: [-3, 1.3] }, val: function (s) { return Math.pow(10, s); }, rp: 'tr', period: 12,
    anim: function (ctx, w, h, dt, V, st) {
      var K = H.kit(ctx, w, h), g = geo(V), s = 14 + 56 * (lg(V) + 3) / 4.3, x = 50 - s / 2, y = 88 - s;
      st.t = ((st.t || 0) + dt * clamp(g.AV / 10, .05, 2)) % 1.2;
      var warm = Math.min(1, st.t);
      K.fi('rgb(' + Math.round(31 + 152 * warm) + ',' + Math.round(74 - 10 * warm) + ',' + Math.round(115 - 68 * warm) + ')').rect(x, y + s * .1, s, s * .9, true);
      vessel(K, x, y, s, s, true);
      st.a = (st.a || 0) + dt * 6; impeller(K, 50, y + s * .7, s * .3, st.a);
      K.tx(V < 1 ? fmt(V * 1000, V < .01 ? 1 : 0) + ' L' : fmt(V, 1) + ' m³', 50, 96, { mono: 1, c: C.paper, sz: 4 });
      K.tx('A/V ' + fmt(g.AV, 1) + ' m²/m³', 50, 7, { mono: 1, c: C.orange, sz: 3.8 });
    },
    graph: {
      logx: true, logy: true, x0: .001, x1: 20, y0: 1, y1: 100, xt: [.001, .01, .1, 1, 10], yt: [1, 2, 5, 10, 20, 50, 100],
      fx: function (t) { return t < 1 ? fmt(t * 1000, 0) + ' L' : fmt(t, 0) + ' m³'; }, xl: 'Batch volume', yl: 'Jacket area per volume  (m²/m³)',
      curves: [{ f: function (V) { return geo(V).AV; }, c: C.orange, label: 'A/V ∝ 1/D', lx: .03, dy: -10 }], points: function (V) { return [{ x: V, y: geo(V).AV }]; }
    },
    read: function (V) { return 'A/V     = <b>' + fmt(geo(V).AV, 1) + '</b> m²/m³\nheat-up ≈ <b>' + dur(heatT(V)) + '</b>'; },
    note: 'Lab: about 4 minutes to heat 40 K. A 10 m³ reactor with the same U takes about an hour and a half. The same loss of area limits how fast an exotherm can be removed.'
  });

  /* ---------- runaway: heat generation vs removal (Semenov) ---------- */
  var QA = 10, QB = .07, UA = 1;
  function qg(T) { return QA * Math.exp(QB * (T - 60)); }
  function stable(Tc) { for (var T = Tc; T < Tc + 40; T += .02) if (qg(T) <= UA * (T - Tc)) return T; return null; }
  var TCRIT = 60 + Math.log(UA / (QB * QA)) / QB - UA / (QB * UA);
  def('runaway', {
    t: 'Heat Generation vs Heat Removal', eq: 'Reaction heat grows exponentially, cooling grows only in a straight line', eq2: 'q<sub>gen</sub> = &Delta;H&middot;r(T) &prop; e<sup>&minus;E/RT</sup> &nbsp; q<sub>rem</sub> = UA (T &minus; T<sub>c</sub>) &nbsp; (Semenov)',
    cap: 'Exothermic batch, cooling at the jacket temperature', alt: 'Reactor whose temperature holds or runs away',
    sl: { label: 'Coolant temperature (°C)', min: 20, max: 56, step: .2, v: 30, sweep: [25, 55] }, rp: 'tl', liveGraph: true,
    anim: function (ctx, w, h, dt, Tc, st) {
      var K = H.kit(ctx, w, h), Ts = stable(Tc);
      if (Ts === null) { st.T = Math.min(160, (st.T || Tc + 10) + dt * Math.max(2, (st.T || 60) - 55) * .6); } else { st.T = Ts; }
      var T = st.T, hot = clamp((T - 30) / 90, 0, 1);
      K.fi('rgb(' + Math.round(31 + 170 * hot) + ',' + Math.round(74 - 30 * hot) + ',' + Math.round(115 - 80 * hot) + ')').rect(26, 32, 48, 52, true);
      vessel(K, 26, 24, 48, 60, true);
      K.st(C.paper, 2.2).ln(26, 24, 74, 24);
      st.a = (st.a || 0) + dt * 7; impeller(K, 50, 72, 14, st.a);
      if (Ts === null) {
        var sw = H.swarm(st, 'b', 24, [28, 34, 72, 82]); sw.list.forEach(function (p) { p.y -= dt * (10 + hot * 30); if (p.y < 34) p.y = 82; K.st('rgba(236,231,216,.7)', 1).circ(p.x, p.y, .8 + hot); });
        K.st(C.red, 2.5).ln(66, 24, 66, 12, 82, 12); K.tx('vent', 84, 13, { c: C.red, al: 'left', sz: 3.4 });
        if ((Date.now() / 350 | 0) % 2) K.tx('RUNAWAY', 50, 96, { c: C.red, wt: 800, sz: 5, disp: 1 });
      } else K.tx('stable', 50, 96, { c: C.green, wt: 700, sz: 4.4 });
      K.tx(fmt(T, 1) + ' °C', 50, 52, { mono: 1, c: C.paper, sz: 4.6 });
      K.tx('jacket ' + fmt(Tc, 1) + ' °C', 50, 18, { c: C.hot, sz: 3.4 });
    },
    graph: function (Tc, st) {
      return {
        x0: 20, x1: 100, y0: 0, y1: 60, xt: [20, 40, 60, 80, 100], yt: [0, 20, 40, 60], xl: 'Reactor temperature  (°C)', yl: 'Heat rate  (kW)',
        curves: [{ f: qg, c: C.orange, label: 'generated', lx: 70, dy: -8, al: 'right' }, { f: function (T) { return UA * (T - Tc); }, from: Tc, c: C.blue, label: 'removed', lx: Math.min(92, Tc + 40), dy: 18 }],
        points: function () { var Ts = stable(Tc); return Ts === null ? [{ x: Math.min(99, st.T || 99), y: qg(Math.min(99, st.T || 99)), c: C.red }] : [{ x: Ts, y: qg(Ts) }]; }
      };
    },
    read: function (Tc) { var Ts = stable(Tc); return 'jacket  = <b>' + fmt(Tc, 1) + '</b> °C\n' + (Ts === null ? 'no balance:\n<b>runaway</b>' : 'reactor = <b>' + fmt(Ts, 1) + '</b> °C\nstable') + '\ncritical ≈ ' + fmt(TCRIT, 1) + ' °C'; },
    note: 'Where the lines cross the batch holds steady. Raise the coolant past the critical point, or lose cooling area or agitation, and the lines never meet: temperature climbs on its own. Calorimetry measures the heat curve before scale-up.'
  });

  /* ---------- condenser: cooling water inlet temperature ---------- */
  var TCD = 60, NTU = .8, MCP = 10;
  function cond(Tin) { var e = 1 - Math.exp(-NTU), Q = e * MCP * (TCD - Tin), Tout = Tin + Q / MCP, lm = (Tout - Tin) / Math.log((TCD - Tin) / (TCD - Tout)); return { Q: Q, Tout: Tout, lm: lm }; }
  def('lmtd', {
    t: 'LMTD in a Condenser', eq: 'Warmer cooling water &rarr; smaller temperature difference &rarr; less duty', eq2: 'Q = U A &Delta;T<sub>lm</sub> &nbsp; &Delta;T<sub>lm</sub> = (&Delta;T<sub>1</sub> &minus; &Delta;T<sub>2</sub>) / ln(&Delta;T<sub>1</sub>/&Delta;T<sub>2</sub>)',
    cap: 'Vapour condensing at 60 °C, same exchanger and water flow', alt: 'Condenser with cooling water warming along the tubes',
    sl: { label: 'Cooling water inlet (°C)', min: 15, max: 45, step: .5, v: 30, sweep: [18, 42] }, rp: 'br',
    anim: function (ctx, w, h, dt, Tin, st) {
      var K = H.kit(ctx, w, h), r = cond(Tin);
      K.st(C.paper, 2).rect(12, 34, 76, 30);
      for (var i = 0; i < 5; i++) {
        var y = 38 + i * 5.5; for (var s = 0; s < 20; s++) { var z = s / 20, T = TCD - (TCD - Tin) * Math.exp(-NTU * z), hot = (T - 15) / 45;
          K.st('rgb(' + Math.round(80 + 160 * hot) + ',' + Math.round(150 - 40 * hot) + ',' + Math.round(220 - 160 * hot) + ')', 2.2).ln(14 + z * 72, y, 14 + (z + .05) * 72, y); }
      }
      var sw = H.swarm(st, 'v', 20, [14, 35, 86, 63]); sw.step(dt, 6); K.dots(sw.list, .8, 'rgba(242,215,160,.6)');
      K.st(C.cream, 2).ln(50, 20, 50, 34).tx('vapour 60 °C', 50, 17, { c: C.cream, sz: 3.4 });
      K.st(C.blue, 2).ln(2, 49, 12, 49).ln(88, 49, 98, 49);
      K.tx(fmt(Tin, 1) + ' °C', 6, 44, { mono: 1, c: C.blue, sz: 3.6 }).tx(fmt(r.Tout, 1) + ' °C', 94, 44, { mono: 1, c: C.orange, sz: 3.6 });
      st.d = st.d || []; st.de = (st.de || 0) + dt * r.Q / 25;
      while (st.de > 1) { st.de -= 1; st.d.push({ x: 20 + Math.random() * 60, y: 65 }); }
      st.d = st.d.filter(function (d) { d.y += dt * 20; K.fi(C.cream).circ(d.x, d.y, .8, true); return d.y < 80; });
      K.tx('Q ' + fmt(r.Q, 0) + ' kW', 50, 88, { mono: 1, c: C.paper, sz: 4.2 });
    },
    graph: function (Tin) {
      return {
        x0: 0, x1: 1, y0: 10, y1: 65, xt: [0, .25, .5, .75, 1], yt: [10, 20, 30, 40, 50, 60], fx: function (t) { return fmt(t * 100, 0) + '%'; }, xl: 'Position along the condenser', yl: 'Temperature  (°C)',
        hl: [{ y: TCD, label: 'condensing vapour 60 °C', c: C.cream }],
        curves: [{ f: function (z) { return TCD - (TCD - 20) * Math.exp(-NTU * z); }, c: C.muted, lw: 1.3, dash: [4, 4], label: 'water at 20 °C', lx: .55, dy: 18 }, { f: function (z) { return TCD - (TCD - Tin) * Math.exp(-NTU * z); }, c: C.blue, label: 'cooling water', lx: .05, dy: -8 }],
        under: function (ctx, sx, sy) { ctx.fillStyle = 'rgba(201,162,39,.08)'; ctx.beginPath(); ctx.moveTo(sx(0), sy(TCD)); for (var i = 0; i <= 40; i++) { var z = i / 40; ctx.lineTo(sx(z), sy(TCD - (TCD - Tin) * Math.exp(-NTU * z))); } ctx.lineTo(sx(1), sy(TCD)); ctx.fill(); },
        points: function () { return [{ x: 0, y: Tin }, { x: 1, y: cond(Tin).Tout }]; }
      };
    },
    read: function (Tin) { var r = cond(Tin), r25 = cond(25); return 'ΔTlm = <b>' + fmt(r.lm, 1) + '</b> K\nQ    = <b>' + fmt(r.Q, 0) + '</b> kW\n     ' + fmt(100 * r.Q / r25.Q, 0) + '% of duty at 25 °C'; },
    note: 'Shaded area is the driving force. On a hot afternoon a condenser sized for 25 °C water can lose a third of its duty, and solvent slips through to the vacuum pump.'
  });

  /* ---------- chiller capacity vs ambient ---------- */
  function cap(Ta) { return 100 * (1 - .017 * (Ta - 35)); }
  function cop(Ta) { var Te = 263.15, Tc = Ta + 273.15 + 12; return .5 * Te / (Tc - Te); }
  def('chiller', {
    t: 'Chiller Capacity and Hot Weather', eq: 'Hotter air at the condenser = Less cooling from the same chiller', eq2: 'COP &asymp; &eta; T<sub>evap</sub> / (T<sub>cond</sub> &minus; T<sub>evap</sub>) &nbsp; capacity falls about 1.5&ndash;2% per &deg;C',
    cap: 'Air-cooled brine chiller rated at 35 °C ambient', alt: 'Chiller with condenser fans and brine supply',
    sl: { label: 'Ambient air (°C)', min: 20, max: 48, step: .5, v: 35, sweep: [25, 47] }, rp: 'tr',
    anim: function (ctx, w, h, dt, Ta, st) {
      var K = H.kit(ctx, w, h), c = cap(Ta);
      K.st(C.paper, 2).rect(14, 30, 56, 44);
      st.a = (st.a || 0) + dt * 8;
      [28, 56].forEach(function (x) { K.st(C.muted, 1.5).circ(x, 30, 9); for (var i = 0; i < 3; i++) { var a = st.a + i * 2.09; K.st(C.brass, 2).ln(x, 30, x + Math.cos(a) * 8, 30 + Math.sin(a) * 2.6); } });
      var hot = clamp((Ta - 20) / 28, 0, 1); st.h = H.swarm(st, 'h', 16, [14, 2, 70, 20]).list;
      st.h.forEach(function (p) { p.y -= dt * 10; if (p.y < 2) p.y = 20; K.fi('rgba(240,138,60,' + (.2 + .6 * hot) + ')').circ(p.x, p.y, .9, true); });
      K.tx('hot air out', 42, 5, { c: C.orange, sz: 3.2 });
      K.st(C.blue, 2.5).ln(70, 46, 92, 46).st(C.orange, 2.5).ln(92, 60, 70, 60);
      K.tx('brine −5 °C', 92, 42, { c: C.blue, al: 'right', sz: 3.3 }).tx('return', 92, 66, { c: C.orange, al: 'right', sz: 3.3 });
      K.st(C.paper, 1.5).rect(18, 82, 64, 7); K.fi(c >= 100 ? C.green : c > 85 ? C.brass : C.red).rect(18.4, 82.4, 63.2 * clamp(c / 120, 0, 1), 6.2, true);
      K.tx('capacity ' + fmt(c, 0) + '% of rating', 50, 96, { mono: 1, c: C.paper, sz: 3.6 });
      H.thermo(K, 6, 36, 70, hot, '');
      K.tx(fmt(Ta, 0) + ' °C', 8, 30, { mono: 1, c: C.paper, al: 'left', sz: 3.6 });
    },
    graph: {
      x0: 20, x1: 48, y0: 60, y1: 130, xt: [20, 25, 30, 35, 40, 45], yt: [60, 80, 100, 120], fy: function (t) { return t + '%'; }, xl: 'Ambient air temperature  (°C)', yl: 'Cooling capacity',
      vl: [{ x: 35, label: 'rating point', ty: 18 }], curves: [{ f: cap, c: C.blue }], points: function (Ta) { return [{ x: Ta, y: cap(Ta) }]; }
    },
    read: function (Ta) { return 'ambient  = <b>' + fmt(Ta, 1) + '</b> °C\ncapacity = <b>' + fmt(cap(Ta), 0) + '</b> %\nCOP      ≈ ' + fmt(cop(Ta), 2); },
    note: 'Dirty condenser coils and hot air recirculating back into the fans make it worse. A TCU that cannot reach setpoint on summer afternoons is often a chiller at its limit, not a TCU fault.'
  });

  /* ---------- freezing point of glycol and brine ---------- */
  var MEG = [[0, 0], [10, -3.4], [20, -7.9], [30, -14.1], [40, -22.3], [50, -33.8], [60, -48.3]];
  var CA = [[0, 0], [5, -2.4], [10, -5.4], [15, -10.3], [20, -18], [25, -29.4], [29.9, -55]];
  function interp(t, x) { for (var i = 0; i < t.length - 1; i++) if (x <= t[i + 1][0]) return t[i][1] + (t[i + 1][1] - t[i][1]) * (x - t[i][0]) / (t[i + 1][0] - t[i][0]); return NaN; }
  var TOP = -15;
  def('freeze', {
    t: 'Glycol vs Brine Freezing Point', eq: 'More antifreeze = Lower freezing point, up to a limit', eq2: 'Pick a mix that freezes at least 5&ndash;10 &deg;C below the coldest supply',
    cap: 'Coolant loops at −15 °C supply', alt: 'Two coolant pipes, one forming ice',
    sl: { label: 'Concentration (wt%)', min: 0, max: 50, step: .5, v: 20, sweep: [0, 50] }, rp: 'tr',
    anim: function (ctx, w, h, dt, x, st) {
      var K = H.kit(ctx, w, h);
      [['Ethylene glycol', interp(MEG, x), 26], ['Calcium chloride', x <= 29.9 ? interp(CA, x) : NaN, 64]].forEach(function (r, i) {
        var y = r[2], fz = r[1], ice = isNaN(fz) ? 1 : clamp((fz - TOP + 2) / 8, 0, 1);
        K.fi(C.dark).rect(8, y, 84, 12, true); K.st(C.paper, 2).ln(8, y, 92, y).ln(8, y + 12, 92, y + 12);
        st['o' + i] = ((st['o' + i] || 0) + dt * 12 * (1 - ice)) % 10; ctx.lineDashOffset = -st['o' + i] * K.u;
        K.st(C.blue, 2.5, [3, 7]).ln(8, y + 6, 92, y + 6); ctx.lineDashOffset = 0;
        if (ice > 0) { K.fi('rgba(236,231,216,' + (.25 + .5 * ice) + ')'); for (var k = 0; k < 14; k++) K.circ(12 + k * 6, y + 2 + (k % 3), 1.2 + ice * 1.5, true); }
        K.tx(r[0], 8, y - 3, { al: 'left', c: C.paper, sz: 3.6 });
        K.tx(isNaN(fz) ? 'past solubility' : 'freezes ' + fmt(fz, 1) + ' °C', 92, y - 3, { al: 'right', mono: 1, c: ice > .4 ? C.red : C.green, sz: 3.4 });
      });
      K.tx('supply −15 °C', 50, 96, { c: C.muted, sz: 3.4 });
    },
    graph: {
      x0: 0, x1: 50, y0: -60, y1: 0, xt: [0, 10, 20, 30, 40, 50], yt: [-60, -45, -30, -15, 0], xl: 'Concentration  (wt%)', yl: 'Freezing point  (°C)',
      hl: [{ y: TOP, label: 'supply −15 °C', al: 'r' }],
      curves: [{ pts: MEG, c: C.blue, label: 'ethylene glycol', lx: 43, ly: -26, dy: -6, al: 'right' }, { pts: CA, c: C.orange, label: 'CaCl₂ brine', lx: 21, ly: -24, al: 'left' }],
      points: function (x) { var p = [{ x: x, y: interp(MEG, x) }]; if (x <= 29.9) p.push({ x: x, y: interp(CA, x) }); return p; }
    },
    read: function (x) { var b = x <= 29.9 ? interp(CA, x) : NaN; return 'conc.  = <b>' + fmt(x, 1) + '</b> wt%\nglycol = <b>' + fmt(interp(MEG, x), 1) + '</b> °C\nbrine  = ' + (isNaN(b) ? 'n/a' : '<b>' + fmt(b, 1) + '</b> °C'); },
    note: 'Brine is cheap and transfers heat well but its chlorides corrode carbon and stainless steel. Glycol needs inhibitor and turns viscous when cold, so pumps and heat transfer suffer at high strength. Values are approximate.'
  });

  /* ---------- residence time: CSTR vs PFR ---------- */
  var KR = .1;
  function xc(t) { return KR * t / (1 + KR * t); } function xp(t) { return 1 - Math.exp(-KR * t); }
  def('cstr', {
    t: 'Residence Time: Tank vs Tube', eq: 'Residence time = Volume / Flow', eq2: '&tau; = V/Q &nbsp; CSTR: X = k&tau;/(1+k&tau;) &nbsp; PFR: X = 1 &minus; e<sup>&minus;k&tau;</sup> &nbsp; (k = 0.1 /min)',
    cap: 'First-order reaction, same volume and flow', alt: 'Stirred tank and a tubular reactor side by side',
    sl: { label: 'Residence time τ (min)', min: 0, max: 60, step: .5, v: 10, sweep: [1, 60] }, rp: 'br',
    anim: function (ctx, w, h, dt, tau, st) {
      var K = H.kit(ctx, w, h), a = xc(tau), b = xp(tau);
      K.fi('rgba(240,138,60,' + (.15 + .7 * a) + ')').rect(10, 30, 32, 34, true); vessel(K, 10, 22, 32, 42, false);
      st.a = (st.a || 0) + dt * 6; impeller(K, 26, 56, 10, st.a);
      K.tx('CSTR', 26, 72, { c: C.paper, sz: 4, wt: 700 }).tx('X ' + fmt(100 * a, 0) + '%', 26, 78, { mono: 1, c: C.orange, sz: 3.8 });
      for (var i = 0; i < 20; i++) { var z = (i + .5) / 20, x = 1 - Math.exp(-KR * tau * z); K.fi('rgba(240,138,60,' + (.15 + .7 * x) + ')').rect(52 + i * 2.2, 40, 2.2, 10, true); }
      K.st(C.paper, 2).rect(52, 40, 44, 10);
      st.f = ((st.f || 0) + dt * 30 / Math.max(tau, 2)) % 1; K.st(C.blue, 1.5).ln(52 + 44 * st.f, 40, 52 + 44 * st.f, 50);
      K.tx('PFR', 74, 72, { c: C.paper, sz: 4, wt: 700 }).tx('X ' + fmt(100 * b, 0) + '%', 74, 78, { mono: 1, c: C.orange, sz: 3.8 });
      K.tx('τ = ' + fmt(tau, 1) + ' min', 50, 10, { mono: 1, c: C.paper, sz: 4 });
    },
    graph: {
      x0: 0, x1: 60, y0: 0, y1: 100, xt: [0, 10, 20, 30, 40, 50, 60], yt: [0, 25, 50, 75, 100], fy: function (t) { return t + '%'; }, xl: 'Residence time  τ  (min)', yl: 'Conversion',
      curves: [{ f: function (t) { return 100 * xp(t); }, c: C.orange, label: 'PFR / batch', lx: 26, dy: -10 }, { f: function (t) { return 100 * xc(t); }, c: C.blue, label: 'CSTR', lx: 40, dy: 22 }],
      points: function (t) { return [{ x: t, y: 100 * xp(t) }, { x: t, y: 100 * xc(t) }]; }
    },
    read: function (t) { return 'τ    = <b>' + fmt(t, 1) + '</b> min\nPFR  = <b>' + fmt(100 * xp(t), 1) + '</b> %\nCSTR = ' + fmt(100 * xc(t), 1) + ' %'; },
    note: 'A well-mixed tank runs at the outlet concentration, so it needs more volume for the same conversion. A batch reactor behaves like a plug-flow tube in time.'
  });

  /* ---------- yield, conversion, selectivity: A to B to C ---------- */
  var K1 = .2, K2 = .05;
  function conc(t) { var a = Math.exp(-K1 * t), b = K1 / (K2 - K1) * (Math.exp(-K1 * t) - Math.exp(-K2 * t)); return { A: a, B: b, C: 1 - a - b }; }
  var TMAX = Math.log(K1 / K2) / (K1 - K2);
  def('series', {
    t: 'Yield, Conversion, Selectivity', eq: 'Conversion = A used &nbsp; Yield = B made &nbsp; Selectivity = B made / A used', eq2: 'A &rarr; B &rarr; C &nbsp; k<sub>1</sub> = 0.2, k<sub>2</sub> = 0.05 /min',
    cap: 'Product B over-reacts to impurity C if left too long', alt: 'Beaker of A turning into B then C',
    sl: { label: 'Reaction time (min)', min: 0, max: 60, step: .5, v: 0, sweep: [0, 60] }, rp: 'tr',
    anim: function (ctx, w, h, dt, t, st) {
      var K = H.kit(ctx, w, h), c = conc(t);
      vessel(K, 22, 20, 56, 64, true); K.fi('rgba(31,74,115,.35)').rect(22.5, 28, 55, 55.5, true);
      var sw = H.swarm(st, 'p', 60, [24, 30, 76, 82]); sw.step(dt, 8);
      sw.list.forEach(function (p, i) { var f = i / 60; K.fi(f < c.A ? C.blue : f < c.A + c.B ? C.brass : C.red).circ(p.x, p.y, 1.3, true); });
      K.tx('A', 30, 94, { c: C.blue, sz: 4, wt: 700 }).tx('B product', 50, 94, { c: C.brass, sz: 4, wt: 700 }).tx('C', 70, 94, { c: C.red, sz: 4, wt: 700 });
      K.tx(fmt(t, 0) + ' min', 50, 12, { mono: 1, c: C.paper, sz: 4 });
    },
    graph: {
      x0: 0, x1: 60, y0: 0, y1: 1, xt: [0, 10, 20, 30, 40, 50, 60], yt: [0, .25, .5, .75, 1], fy: function (t) { return fmt(t * 100, 0) + '%'; }, xl: 'Reaction time  (min)', yl: 'Fraction of starting A',
      vl: [{ x: TMAX, label: 'best stop ≈ ' + fmt(TMAX, 0) + ' min', ty: 14 }],
      curves: [{ f: function (t) { return conc(t).A; }, c: C.blue, label: 'A', lx: 3, dy: -6 }, { f: function (t) { return conc(t).B; }, c: C.brass, label: 'B', lx: 22, dy: -8 }, { f: function (t) { return conc(t).C; }, c: C.red, label: 'C', lx: 50, dy: -8 }],
      points: function (t) { var c = conc(t); return [{ x: t, y: c.A }, { x: t, y: c.B }, { x: t, y: c.C }]; }
    },
    read: function (t) { var c = conc(t), X = 1 - c.A; return 'conversion  = <b>' + fmt(100 * X, 0) + '</b> %\nyield B     = <b>' + fmt(100 * c.B, 0) + '</b> %\nselectivity = ' + (X > .001 ? fmt(100 * c.B / X, 0) + ' %' : '–'); }
  });

  /* ---------- crystallization: solubility and metastable zone ---------- */
  function cs(T) { return 10 + .008 * T * T; } function cm(T) { return cs(T + 12); }
  var C0 = cs(65), TNUC = Math.sqrt((C0 - 10) / .008) - 12;
  function cpath(T) { return T > TNUC ? Math.min(C0, Math.max(cs(T), C0)) : cs(T) + .6; }
  function zone(T) { var c = cpath(T); return c <= cs(T) + .01 ? 'undersaturated' : T > TNUC ? 'metastable zone' : 'nucleated'; }
  def('cryst', {
    t: 'Supersaturation and the Metastable Zone', eq: 'Cool past solubility: supersaturated. Cool too far: a shower of new crystals', eq2: 'S = C / C* &nbsp; seed inside the metastable zone to grow crystals instead of nucleating fines',
    cap: 'Cooling an unseeded solution saturated at 65 °C (illustrative)', alt: 'Crystallizer where crystals appear suddenly',
    sl: { label: 'Temperature (°C)', min: 5, max: 70, step: .5, v: 70, sweep: [70, 8] }, rp: 'tl', period: 14,
    anim: function (ctx, w, h, dt, T, st) {
      var K = H.kit(ctx, w, h), z = zone(T), c = cpath(T), yieldF = (C0 - c) / C0;
      K.fi('rgba(31,74,115,.5)').rect(22, 30, 56, 54, true); vessel(K, 22, 22, 56, 62, true);
      st.a = (st.a || 0) + dt * 6; impeller(K, 50, 74, 14, st.a);
      var n = z === 'nucleated' ? Math.round(30 + 170 * clamp(yieldF * 2, 0, 1)) : 0;
      st.c = st.c || []; while (st.c.length < 200) st.c.push({ x: 24 + Math.random() * 52, y: 32 + Math.random() * 50, s: .4 + Math.random() * .5 });
      st.c.forEach(function (p, i) { if (i >= n) return; p.y += Math.sin(st.a + i) * dt * 3; K.fi(C.cream).rect(p.x, p.y, p.s, p.s, true); });
      H.thermo(K, 88, 26, 76, T / 75, fmt(T, 0) + ' °C');
      K.tx(z, 50, 95, { c: z === 'nucleated' ? C.red : z === 'metastable zone' ? C.brass : C.blue, wt: 700, sz: 4.2 });
    },
    graph: {
      x0: 0, x1: 70, y0: 0, y1: 60, xt: [0, 10, 20, 30, 40, 50, 60, 70], yt: [0, 15, 30, 45, 60], xl: 'Temperature  (°C)', yl: 'Concentration  (g / 100 g solvent)',
      under: function (ctx, sx, sy) { ctx.fillStyle = 'rgba(201,162,39,.10)'; ctx.beginPath(); for (var T = 0; T <= 70; T += 1) ctx.lineTo(sx(T), sy(cs(T))); for (T = 58; T >= 0; T -= 1) ctx.lineTo(sx(T), sy(cm(T))); ctx.fill(); },
      curves: [{ f: cs, c: C.blue, label: 'solubility C*', lx: 50, dy: 22 }, { f: cm, to: 58, c: C.red, dash: [5, 4], label: 'metastable limit', lx: 12, dy: -8 }, { f: cpath, from: 5, to: 70, c: C.orange, lw: 1.5, a: .6 }],
      points: function (T) { return [{ x: T, y: cpath(T) }]; }
    },
    read: function (T) { var c = cpath(T); return 'T     = <b>' + fmt(T, 1) + '</b> °C\nS     = <b>' + fmt(c / cs(T), 2) + '</b>\nyield = ' + fmt(100 * (C0 - c) / C0, 0) + ' %'; },
    note: 'Unseeded, nothing happens until the limit line, then nucleation crashes the concentration and makes fines. Seeding in the shaded zone and cooling slowly keeps the batch close to the solubility curve and grows bigger crystals. The zone often narrows at plant scale.'
  });

  /* ---------- heat of solution: NaOH in water ---------- */
  function dT(g) { return (g / 40) * 44.5 / ((1 + g / 1000) * 3.9); }
  def('dissolve', {
    t: 'Heat of Solution', eq: 'Some solids and acids release heat as they dissolve', eq2: '&Delta;T &asymp; n &middot; |&Delta;H<sub>soln</sub>| / (m &middot; c<sub>p</sub>) &nbsp; NaOH: &minus;44.5 kJ/mol',
    cap: 'Sodium hydroxide pellets added to 1 L of water at 25 °C', alt: 'Beaker heating up as pellets dissolve',
    sl: { label: 'NaOH added (g per litre)', min: 0, max: 400, step: 5, v: 0, sweep: [0, 400] }, rp: 'tl',
    anim: function (ctx, w, h, dt, g, st) {
      var K = H.kit(ctx, w, h), T = 25 + dT(g), hot = clamp((T - 25) / 75, 0, 1);
      K.fi('rgb(' + Math.round(31 + 160 * hot) + ',' + Math.round(74 - 20 * hot) + ',' + Math.round(115 - 70 * hot) + ')').rect(24, 40, 46, 46, true);
      K.st(C.paper, 2.2).ln(24, 26, 24, 86, 70, 86, 70, 26);
      var n = Math.round(g / 10); st.p = st.p || []; while (st.p.length < 40) st.p.push({ x: 28 + Math.random() * 38, y: 40 + Math.random() * 44 });
      st.p.forEach(function (p, i) { if (i >= n) return; p.y += dt * 2; if (p.y > 84) p.y = 42; K.fi('rgba(236,231,216,.75)').rect(p.x, p.y, 1.2, 1.2, true); });
      if (T > 85) { var sw = H.swarm(st, 's', 14, [28, 8, 66, 38]); sw.list.forEach(function (p) { p.y -= dt * 12; if (p.y < 8) p.y = 38; K.fi('rgba(236,231,216,.5)').circ(p.x, p.y, 1.2, true); }); }
      H.thermo(K, 84, 30, 80, (T - 10) / 100, fmt(T, 0) + ' °C');
      K.tx(fmt(g, 0) + ' g/L', 47, 94, { mono: 1, c: C.paper, sz: 4 });
    },
    graph: {
      x0: 0, x1: 400, y0: 0, y1: 90, xt: [0, 100, 200, 300, 400], yt: [0, 25, 50, 75], xl: 'NaOH added  (g per litre of water)', yl: 'Temperature rise  (K)',
      hl: [{ y: 75, label: 'boils if started at 25 °C', c: C.red }],
      curves: [{ f: dT, c: C.orange }], points: function (g) { return [{ x: g, y: dT(g) }]; }
    },
    read: function (g) { return 'NaOH = <b>' + fmt(g, 0) + '</b> g/L\nΔT   ≈ <b>' + fmt(dT(g), 0) + '</b> K\nT    ≈ ' + fmt(25 + dT(g), 0) + ' °C'; },
    note: 'Add the solid, or the concentrated acid, slowly into water with stirring and cooling, never water into acid. Values are approximate and ignore heat lost to the vessel.'
  });

  /* ---------- blend time on scale-up ---------- */
  function theta(V) { return 5 * Math.pow(V / .001, 2 / 9); }
  def('blend', {
    t: 'Blend Time on Scale-up', eq: 'Same power per volume, bigger tank = Longer to mix', eq2: '&theta; &prop; D<sup>2/3</sup> at constant P/V &nbsp; (turbulent, geometrically similar)',
    cap: 'Dye added at the surface; lab blend time 5 s at 1 L', alt: 'Dye spreading through a stirred tank',
    sl: { label: 'Vessel volume (log)', min: -3, max: 1.3, step: .01, v: -3, sweep: [-3, 1.3] }, val: function (s) { return Math.pow(10, s); }, rp: 'tr',
    anim: function (ctx, w, h, dt, V, st) {
      var K = H.kit(ctx, w, h), th = theta(V), cycle = Math.min(14, th / 2 + 3);
      st.t = (st.t || 0) + dt; if (st.t > cycle || !st.p) { st.t = 0; st.p = []; for (var i = 0; i < 120; i++) st.p.push({ x: 26 + Math.random() * 6, y: 26 + Math.random() * 4 }); }
      vessel(K, 18, 18, 64, 70, false); K.fi('rgba(31,74,115,.4)').rect(18.5, 24, 63, 63.5, true);
      st.a = (st.a || 0) + dt * 6; impeller(K, 50, 64, 14, st.a);
      var sp = 60 / (th / 5) * .35 + 4;
      st.p.forEach(function (p) {
        var X = (p.x - 20) / 30, Y = (p.y - 25) / 61, PI = Math.PI;
        p.x += sp * Math.sin(PI * X) * Math.cos(PI * Y) * dt * 1.2 + (Math.random() - .5) * sp * dt * 5;
        p.y += -sp * 2 * Math.cos(PI * X) * Math.sin(PI * Y) * dt * 1.2 + (Math.random() - .5) * sp * dt * 5;
        p.x = clamp(p.x, 20, 80); p.y = clamp(p.y, 25, 86);
      });
      K.dots(st.p, .9, C.orange);
      K.tx('θ ≈ ' + (th < 60 ? fmt(th, 0) + ' s' : fmt(th / 60, 1) + ' min'), 50, 96, { mono: 1, c: C.paper, sz: 4 });
      K.tx(V < 1 ? fmt(V * 1000, 0) + ' L' : fmt(V, 1) + ' m³', 50, 8, { mono: 1, c: C.muted, sz: 3.8 });
    },
    graph: {
      logx: true, x0: .001, x1: 20, y0: 0, y1: 45, xt: [.001, .01, .1, 1, 10], yt: [0, 10, 20, 30, 40], fx: function (t) { return t < 1 ? fmt(t * 1000, 0) + ' L' : fmt(t, 0) + ' m³'; }, xl: 'Vessel volume', yl: 'Blend time  (s)',
      curves: [{ f: theta, c: C.orange }], points: function (V) { return [{ x: V, y: theta(V) }]; }
    },
    read: function (V) { return 'V = <b>' + (V < 1 ? fmt(V * 1000, 0) + ' L' : fmt(V, 2) + ' m³') + '</b>\nθ ≈ <b>' + fmt(theta(V), 0) + '</b> s'; },
    note: 'If a fast reaction finishes before the feed is mixed in, selectivity changes on scale-up. Feed near the impeller, slow the addition, or check that blend time stays well below reaction time. A sample taken before blending is complete is not representative.'
  });

  /* ---------- scale-up rules for agitator speed ---------- */
  var N1 = 300;
  def('scaleup', {
    t: 'Agitator Scale-up Rules', eq: 'Each rule keeps one thing the same, and changes the rest', eq2: 'N<sub>2</sub> = N<sub>1</sub> (D<sub>1</sub>/D<sub>2</sub>)<sup>n</sup> &nbsp; n = 1 tip speed, 2/3 P/V, 2 Reynolds',
    cap: 'Lab impeller 300 rpm, geometrically similar plant', alt: 'Small lab vessel and large plant vessel with impellers',
    sl: { label: 'Scale ratio D₂/D₁ (log)', min: 0, max: 1, step: .005, v: 0, sweep: [0, 1] }, val: function (s) { return Math.pow(10, s); }, rp: 'bl',
    anim: function (ctx, w, h, dt, x, st) {
      var K = H.kit(ctx, w, h), np = N1 * Math.pow(x, -2 / 3), s = 16 + 54 * (x - 1) / 9;
      st.a = (st.a || 0) + dt * N1 / 40; st.b = (st.b || 0) + dt * np / 40;
      vessel(K, 6, 62, 16, 16, false); K.fi('rgba(31,74,115,.4)').rect(6.5, 64, 15, 13.5, true); impeller(K, 14, 72, 5, st.a);
      K.tx('lab', 14, 84, { sz: 3.3 }).tx('300 rpm', 14, 89, { mono: 1, c: C.paper, sz: 3.3 });
      var x0 = 62 - s / 2, y0 = 80 - s;
      vessel(K, x0, y0, s, s, false); K.fi('rgba(31,74,115,.4)').rect(x0 + .5, y0 + s * .12, s - 1, s * .88 - .5, true);
      K.st(C.steel, 2).ln(62, y0 - 4, 62, y0 + s * .66); var c = Math.cos(st.b); K.st(C.brass, 2.5).ln(62 - s * .17 * c, y0 + s * .66, 62 + s * .17 * c, y0 + s * .66);
      K.tx('plant, constant P/V', 62, 86, { sz: 3.3 }).tx(fmt(np, 0) + ' rpm', 62, 91, { mono: 1, c: C.paper, sz: 3.3 });
    },
    graph: {
      logx: true, logy: true, x0: 1, x1: 10, y0: 2, y1: 400, xt: [1, 2, 5, 10], yt: [2, 5, 10, 20, 50, 100, 200, 400], xl: 'Scale ratio  D₂ / D₁', yl: 'Plant agitator speed  (rpm)',
      curves: [{ f: function () { return N1; }, c: C.muted, lw: 1.5, label: 'same blend time (n = 0)', lx: 1.1, dy: -6 }, { f: function (x) { return N1 / x; }, c: C.blue, label: 'tip speed', lx: 6, dy: -8 }, { f: function (x) { return N1 * Math.pow(x, -2 / 3); }, c: C.orange, label: 'P/V', lx: 6, dy: -8 }, { f: function (x) { return N1 / (x * x); }, c: C.red, label: 'Reynolds', lx: 3.2, dy: 18 }],
      points: function (x) { return [{ x: x, y: N1 * Math.pow(x, -2 / 3) }, { x: x, y: N1 / x }, { x: x, y: N1 / (x * x) }]; }
    },
    read: function (x) { return 'D₂/D₁  = <b>' + fmt(x, 1) + '</b>\nP/V    = <b>' + fmt(N1 * Math.pow(x, -2 / 3), 0) + '</b> rpm\ntip    = ' + fmt(N1 / x, 0) + ' rpm\nRe     = ' + fmt(N1 / (x * x), 1) + ' rpm'; },
    note: 'Constant P/V suits blending and gas dispersion; constant tip speed suits shear-sensitive solids and crystals. Constant Reynolds is rarely usable. Constant blend time needs impossible power at plant scale.'
  });

  /* ---------- gas-liquid mass transfer (hydrogenation) ---------- */
  function kla(N) { return .08 * Math.pow(N / 300, 1.2); }
  var KLIM = .2;
  function upt(N) { return 100 * Math.min(1, kla(N) / KLIM); }
  def('gasliq', {
    t: 'Gas-Liquid Mass Transfer', eq: 'Rate is set by the slower step: gas dissolving or the reaction itself', eq2: 'rate = k<sub>L</sub>a (C* &minus; C) &nbsp; k<sub>L</sub>a &prop; (P/V)<sup>0.4</sup> &prop; N<sup>1.2</sup>',
    cap: 'Hydrogenation in a stirred autoclave (illustrative)', alt: 'Autoclave with hydrogen bubbles broken up by the impeller',
    sl: { label: 'Agitator speed (rpm)', min: 100, max: 900, step: 5, v: 200, sweep: [150, 900] }, rp: 'br',
    anim: function (ctx, w, h, dt, N, st) {
      var K = H.kit(ctx, w, h), k = kla(N), lim = k < KLIM;
      K.fi('rgba(31,74,115,.5)').rect(22, 30, 56, 56, true); K.st(C.paper, 2.2).rect(22, 20, 56, 66);
      st.a = (st.a || 0) + dt * N / 50; impeller(K, 50, 72, 14, st.a);
      K.st(C.blue, 2).ln(30, 6, 30, 80, 44, 80).tx('H₂', 30, 4, { c: C.blue, sz: 3.6 });
      st.b = st.b || []; st.be = (st.be || 0) + dt * (8 + N / 20);
      while (st.be > 1) { st.be -= 1; st.b.push({ x: 44 + Math.random() * 6, y: 80, r: clamp(2.6 - N / 400, .5, 2.4), vx: (Math.random() - .5) * N / 20 }); }
      st.b = st.b.filter(function (b) { b.y -= dt * 14; b.x = clamp(b.x + b.vx * dt, 23, 77); K.st('rgba(143,184,232,.85)', 1).circ(b.x, b.y, b.r); return b.y > 31; });
      K.fi('rgba(143,184,232,.12)').rect(22.5, 20.5, 55, 9, true);
      K.tx(lim ? 'gas transfer limited' : 'reaction limited', 50, 95, { c: lim ? C.orange : C.green, wt: 700, sz: 4 });
      K.tx(fmt(N, 0) + ' rpm', 88, 52, { mono: 1, c: C.paper, sz: 3.6 });
    },
    graph: {
      x0: 100, x1: 900, y0: 0, y1: 110, xt: [100, 300, 500, 700, 900], yt: [0, 25, 50, 75, 100], fy: function (t) { return t + '%'; }, xl: 'Agitator speed  (rpm)', yl: 'H₂ uptake, % of kinetic maximum',
      bands: [{ from: 100, to: 300 * Math.pow(KLIM / .08, 1 / 1.2), fill: 'rgba(240,138,60,.06)', label: 'mass-transfer limited', color: C.orange }, { from: 300 * Math.pow(KLIM / .08, 1 / 1.2), to: 900, fill: 'rgba(95,191,138,.06)', label: 'kinetic', color: C.green }],
      curves: [{ f: upt, c: C.blue }], points: function (N) { return [{ x: N, y: upt(N) }]; }
    },
    read: function (N) { return 'N     = <b>' + fmt(N, 0) + '</b> rpm\nkLa   = ' + fmt(kla(N), 3) + ' /s\nrate  = <b>' + fmt(upt(N), 0) + '</b> %'; },
    note: 'If the rate rises with agitator speed, gas transfer is the limit, and it will change on scale-up. Gas-inducing impellers, higher pressure and good catalyst suspension all help.'
  });

  /* ---------- cleaning by rinsing ---------- */
  var HOLD = 5, RINSE = 100;
  function resid(n) { return 1e6 * Math.pow(HOLD / (HOLD + RINSE), n); }
  def('rinse', {
    t: 'Cleaning by Repeated Rinses', eq: 'Each rinse dilutes what is left by the same factor', eq2: 'left after n rinses = [h / (h + V<sub>rinse</sub>)]<sup>n</sup> &nbsp; h = 5 L holdup, V = 100 L',
    cap: 'Residue film in a reactor rinsed with solvent', alt: 'Reactor wall residue fading with each rinse',
    sl: { label: 'Number of rinses', min: 0, max: 5, step: 1, v: 0, sweep: [0, 5] }, val: function (s) { return Math.round(s); }, rp: 'tr', period: 12,
    anim: function (ctx, w, h, dt, n, st) {
      var K = H.kit(ctx, w, h), f = Math.pow(HOLD / (HOLD + RINSE), n), a = clamp(.15 + lg(f * 1e6 + 1) / 6 * .7, .03, .85);
      vessel(K, 22, 20, 56, 66, true);
      K.fi('rgba(240,138,60,' + a + ')').rect(22.5, 20, 3, 65.5, true).rect(74.5, 20, 3, 65.5, true).rect(22.5, 82, 55, 3.5, true);
      st.s = st.s || []; st.se = (st.se || 0) + dt * 30;
      while (st.se > 1) { st.se -= 1; var t = Math.random() * Math.PI; st.s.push({ x: 50, y: 24, vx: Math.cos(t) * 22, vy: Math.sin(t) * 22 }); }
      st.s = st.s.filter(function (d) { d.x += d.vx * dt; d.y += d.vy * dt; K.fi('rgba(143,184,232,.7)').circ(d.x, d.y, .7, true); return d.x > 24 && d.x < 76 && d.y < 84; });
      K.st(C.blue, 2).ln(50, 4, 50, 22).circ(50, 24, 2);
      K.tx(n + (n === 1 ? ' rinse' : ' rinses'), 50, 95, { mono: 1, c: C.paper, sz: 4 });
    },
    graph: {
      logy: true, x0: 0, x1: 5, y0: .1, y1: 1e6, xt: [0, 1, 2, 3, 4, 5], yt: [.1, 10, 1000, 1e5], fy: function (t) { return t >= 1 ? fmt(t, 0) : String(t); }, xl: 'Number of rinses', yl: 'Residue left  (ppm of start)',
      hl: [{ y: 10, label: '10 ppm', al: 'r' }],
      curves: [{ f: resid, c: C.orange }], points: function (n) { return [{ x: n, y: resid(n) }]; }
    },
    read: function (n) { return 'rinses = <b>' + n + '</b>\nleft   = <b>' + sig(resid(n), 3) + '</b> ppm'; },
    note: 'This assumes the residue dissolves in the rinse. Several small rinses beat one big one. Swab and rinse-sample results, not the sum, prove the vessel clean.'
  });
})();
(function () {
  var H = PCM._h, C = H.C, fmt = H.fmt, lg = H.lg, clamp = H.clamp, def = H.def, sig = H.sig;

  /* ---------- pH and pKa ---------- */
  var PKA = 4.76;
  function ion(pH) { return 1 / (1 + Math.pow(10, PKA - pH)); }
  def('pka', {
    t: 'pH and pKa', eq: 'pKa belongs to the acid; pH belongs to the solution', eq2: 'pH = pKa + log([A<sup>&minus;</sup>]/[HA]) &nbsp; (Henderson&ndash;Hasselbalch, acetic acid pKa 4.76)',
    cap: 'Acetic acid and acetate in water', alt: 'Beaker with acid and its ionised form',
    sl: { label: 'Solution pH', min: 1, max: 9, step: .05, v: 3, sweep: [1.5, 8.5] }, rp: 'br',
    anim: function (ctx, w, h, dt, pH, st) {
      var K = H.kit(ctx, w, h), f = ion(pH);
      K.fi('rgba(31,74,115,.4)').rect(22, 30, 56, 56, true); K.st(C.paper, 2.2).ln(22, 22, 22, 86, 78, 86, 78, 22);
      var sw = H.swarm(st, 'p', 40, [24, 32, 76, 84]); sw.step(dt, 7);
      sw.list.forEach(function (p, i) { if (i / 40 < f) K.fi(C.orange).circ(p.x, p.y, 1.3, true); else { K.fi(C.blue).circ(p.x, p.y, 1.3, true); K.fi(C.paper).circ(p.x + 1.6, p.y - 1, .6, true); } });
      K.tx('HA', 30, 95, { c: C.blue, wt: 700, sz: 4 }).tx('A⁻', 70, 95, { c: C.orange, wt: 700, sz: 4 });
      K.fi(C.dark).rect(60, 6, 30, 12, true); K.st(C.brass, 1.5).rect(60, 6, 30, 12); K.tx('pH ' + fmt(pH, 2), 75, 14, { mono: 1, c: C.brass, sz: 4 });
      K.st(C.muted, 1.5).ln(70, 18, 66, 50);
    },
    graph: {
      x0: 1, x1: 9, y0: 0, y1: 100, xt: [1, 3, 5, 7, 9], yt: [0, 25, 50, 75, 100], fy: function (t) { return t + '%'; }, xl: 'pH', yl: 'Ionised  (A⁻)',
      bands: [{ from: PKA - 1, to: PKA + 1, fill: 'rgba(201,162,39,.10)', label: 'buffer range', color: C.brass }], vl: [{ x: PKA, label: 'pKa', ty: 40 }],
      curves: [{ f: function (p) { return 100 * ion(p); }, c: C.orange }], points: function (p) { return [{ x: p, y: 100 * ion(p) }]; }
    },
    read: function (p) { var f = ion(p); return 'pH      = <b>' + fmt(p, 2) + '</b>\nionised = <b>' + fmt(100 * f, 1) + '</b> %\nA⁻/HA   = ' + sig(f / (1 - f), 3); },
    note: 'A buffer works best within one pH unit of its pKa. Ionised forms dissolve in water; neutral forms extract into organic solvent.'
  });

  /* ---------- pH probe slope ---------- */
  var NER = 59.16;
  def('phprobe', {
    t: 'pH Electrode Slope', eq: 'An ageing probe gives a weaker signal per pH unit', eq2: 'E = E<sub>0</sub> &minus; s &middot; 59.16 mV &times; (pH &minus; 7) at 25 &deg;C &nbsp; s = slope efficiency',
    cap: 'Probe calibrated at pH 7 only, measuring a pH 10 sample', alt: 'pH probe and meter reading a sample',
    sl: { label: 'Probe slope (% of ideal)', min: 70, max: 100, step: .5, v: 100, sweep: [100, 72] }, rp: 'tr',
    anim: function (ctx, w, h, dt, s, st) {
      var K = H.kit(ctx, w, h), rd = 7 + 3 * s / 100;
      K.fi('rgba(95,191,138,.18)').rect(24, 50, 52, 36, true); K.st(C.paper, 2.2).ln(24, 40, 24, 86, 76, 86, 76, 40);
      K.st(C.paper, 2).rect(46, 10, 8, 50); K.fi(s > 90 ? 'rgba(143,184,232,.5)' : 'rgba(240,138,60,.45)').circ(50, 62, 5, true); K.st(C.paper, 2).circ(50, 62, 5);
      K.st(C.muted, 1.5).ln(50, 10, 50, 4, 74, 4, 74, 12);
      K.fi(C.dark).rect(64, 12, 30, 14, true); K.st(C.brass, 1.5).rect(64, 12, 30, 14);
      K.tx(fmt(rd, 2), 79, 22, { mono: 1, c: Math.abs(rd - 10) > .2 ? C.red : C.brass, sz: 5 });
      K.tx('true pH 10.00', 50, 95, { c: C.muted, sz: 3.6 });
    },
    graph: function (s) {
      return {
        x0: 2, x1: 12, y0: -320, y1: 320, xt: [2, 4, 6, 8, 10, 12], yt: [-300, -150, 0, 150, 300], xl: 'pH', yl: 'Electrode signal  (mV)',
        curves: [{ f: function (p) { return -NER * (p - 7); }, c: C.muted, lw: 1.5, dash: [5, 4], label: 'ideal 59.16 mV/pH', lx: 2.3, dy: -8 }, { f: function (p) { return -NER * s / 100 * (p - 7); }, c: C.orange, label: 'this probe', lx: 8.5, dy: 22 }],
        points: function () { return [{ x: 10, y: -NER * s / 100 * 3 }]; }
      };
    },
    read: function (s) { return 'slope   = <b>' + fmt(s, 1) + '</b> %\n        = ' + fmt(NER * s / 100, 1) + ' mV/pH\nreads   = <b>' + fmt(7 + 3 * s / 100, 2) + '</b>\n(true 10.00)'; },
    note: 'A two-point calibration corrects the slope; most labs replace a probe below about 90%. Temperature also changes the slope, so use automatic temperature compensation. Coated or dried-out glass gives slow, drifting readings.'
  });

  /* ---------- RTD and thermocouple ---------- */
  function pt100(T) { return 100 * (1 + 3.9083e-3 * T - 5.775e-7 * T * T); }
  function tcK(T) { return .041 * T; }
  def('rtd', {
    t: 'RTD vs Thermocouple', eq: 'RTD: resistance rises with temperature &nbsp; Thermocouple: a small voltage from two metals', eq2: 'Pt100: R = 100(1 + 3.9083&times;10<sup>&minus;3</sup>T &minus; 5.775&times;10<sup>&minus;7</sup>T&sup2;) &Omega; &nbsp; Type K &asymp; 41 &micro;V/&deg;C',
    cap: 'Same process temperature, two sensors', alt: 'RTD and thermocouple in a thermowell',
    sl: { label: 'Process temperature (°C)', min: 0, max: 400, step: 1, v: 100, sweep: [0, 400] }, rp: 'br',
    anim: function (ctx, w, h, dt, T, st) {
      var K = H.kit(ctx, w, h), hot = T / 400;
      K.fi('rgba(' + Math.round(80 + 150 * hot) + ',70,60,.35)').rect(8, 60, 84, 30, true); K.st(C.paper, 2).ln(8, 60, 92, 60);
      [[30, 'RTD (Pt100)', fmt(pt100(T), 1) + ' Ω', C.blue], [70, 'Thermocouple K', fmt(tcK(T), 2) + ' mV', C.orange]].forEach(function (s, i) {
        K.st(C.paper, 2).rect(s[0] - 3, 30, 6, 50); K.fi(s[3]).rect(s[0] - 1.5, 70, 3, 9, true);
        K.st(s[3], 1.5).ln(s[0], 30, s[0], 20);
        K.fi(C.dark).rect(s[0] - 14, 8, 28, 12, true); K.st(s[3], 1.5).rect(s[0] - 14, 8, 28, 12);
        K.tx(s[2], s[0], 16.5, { mono: 1, c: s[3], sz: 3.8 }); K.tx(s[1], s[0], 26, { c: C.paper, sz: 3.2 });
        if (i) { K.st(C.orange, 1.2).ln(s[0] - .8, 30, s[0] - .8, 78).st(C.blue, 1.2).ln(s[0] + .8, 30, s[0] + .8, 78); }
      });
      K.tx(fmt(T, 0) + ' °C', 50, 96, { mono: 1, c: C.paper, sz: 4 });
    },
    graph: {
      x0: 0, x1: 400, y0: 90, y1: 260, xt: [0, 100, 200, 300, 400], yt: [100, 140, 180, 220, 260], xl: 'Temperature  (°C)', yl: 'Pt100 resistance  (Ω)',
      curves: [{ f: pt100, c: C.blue, label: 'Pt100', lx: 250, dy: -10 }], points: function (T) { return [{ x: T, y: pt100(T) }]; }
    },
    read: function (T) { return 'T     = <b>' + fmt(T, 0) + '</b> °C\nPt100 = <b>' + fmt(pt100(T), 2) + '</b> Ω\nType K ≈ ' + fmt(tcK(T), 2) + ' mV'; },
    note: 'RTDs are more accurate and stable up to about 400&ndash;600 °C. Thermocouples go hotter, respond faster and are rugged, but a few microvolts of noise is a whole degree. Both read the thermowell, not the liquid, so lag and immersion matter.'
  });

  /* ---------- 4-20 mA loop ---------- */
  function mA(p) { return 4 + 16 * p / 100; }
  def('ma420', {
    t: '4&ndash;20 mA Signal', eq: '4 mA = 0% &nbsp; 20 mA = 100% &nbsp; 0 mA = broken wire', eq2: 'I = 4 + 16 &times; (value &minus; LRV)/(URV &minus; LRV)',
    cap: 'Two-wire level transmitter on a 0&ndash;5 m tank', alt: 'Tank with transmitter and current loop to a display',
    sl: { label: 'Tank level (%)', min: 0, max: 100, step: .5, v: 50, sweep: [0, 100] }, rp: 'tl',
    anim: function (ctx, w, h, dt, p, st) {
      var K = H.kit(ctx, w, h), I = mA(p);
      K.st(C.paper, 2).rect(8, 20, 30, 66); var lv = 86 - 66 * p / 100; K.fi(C.liquid).rect(8.5, lv, 29, 86 - lv, true);
      K.st(C.paper, 2).rect(40, 70, 10, 8).ln(38, 74, 40, 74).tx('LT', 45, 75.5, { c: C.paper, sz: 3.2 });
      K.st(C.muted, 2).ln(50, 72, 76, 72, 76, 30).ln(50, 76, 80, 76, 80, 30);
      st.o = ((st.o || 0) + dt * I * .8) % 10; ctx.lineDashOffset = -st.o * K.u;
      K.st(C.brass, 2, [2, 8]).ln(50, 72, 76, 72, 76, 30); ctx.lineDashOffset = 0;
      K.fi(C.dark).rect(64, 12, 30, 18, true); K.st(C.brass, 1.5).rect(64, 12, 30, 18);
      K.tx(fmt(p * .05, 2) + ' m', 79, 20, { mono: 1, c: C.brass, sz: 4 }).tx(fmt(I, 2) + ' mA', 79, 27, { mono: 1, c: C.paper, sz: 3.4 });
      K.tx('DCS', 79, 9, { sz: 3.2 });
    },
    graph: {
      x0: -10, x1: 110, y0: 0, y1: 24, xt: [0, 25, 50, 75, 100], yt: [0, 4, 8, 12, 16, 20, 24], xl: 'Measured value  (% of range)', yl: 'Loop current  (mA)',
      bands: [{ y: 1, from: 0, to: 3.6, fill: 'rgba(183,64,47,.12)', label: 'below 3.6 mA: fault', color: C.red }, { y: 1, from: 21, to: 24, fill: 'rgba(183,64,47,.12)', label: 'above 21 mA: fault', color: C.red }],
      curves: [{ f: mA, from: -2.5, to: 106, c: C.brass }], points: function (p) { return [{ x: p, y: mA(p) }]; }
    },
    read: function (p) { return 'level = <b>' + fmt(p, 1) + '</b> %\n      = ' + fmt(p * .05, 2) + ' m\nI     = <b>' + fmt(mA(p), 2) + '</b> mA'; },
    note: 'Current does not drop along long cables the way voltage does, and the "live zero" at 4 mA lets the DCS tell a true zero from a cut wire. The same two wires also power the transmitter.'
  });

  /* ---------- PID tuning ---------- */
  var SIMC = {};
  function sim(Kc) {
    var k = Math.round(Kc * 20) / 20; if (SIMC[k]) return SIMC[k];
    var dt = .1, d = 30, uh = [], y = 0, I = 0, out = [[0, 0]];
    for (var i = 0; i < 1000; i++) { var e = 1 - y; I += e * dt; var u = k * (e + I / 10); uh.push(u); var ud = i >= d ? uh[i - d] : 0; y += dt * (ud - y) / 10; if (i % 4 === 3) out.push([(i + 1) * dt, y, clamp(u, -1, 4)]); }
    return (SIMC[k] = out);
  }
  function at(r, t) { var i = clamp(Math.round(t / .4), 0, r.length - 1); return r[i]; }
  def('pid', {
    t: 'PID Tuning', eq: 'Too little gain: slow. Too much gain: overshoot and oscillation', eq2: 'u = K<sub>c</sub> (e + &int;e dt / T<sub>i</sub>) &nbsp; process: gain 1, time constant 10 s, dead time 3 s',
    cap: 'Temperature loop responding to a setpoint step', alt: 'Heated tank with control valve and temperature trend',
    sl: { label: 'Controller gain Kc', min: .3, max: 5, step: .05, v: 1, sweep: [.4, 4.5] }, rp: 'br', liveGraph: true, period: 16,
    anim: function (ctx, w, h, dt, Kc, st) {
      var K = H.kit(ctx, w, h), r = sim(Kc); st.t = ((st.t || 0) + dt * 12) % 100; var p = at(r, st.t), y = p[1], u = p[2] || 0;
      var hot = clamp(y / 1.6, 0, 1);
      K.fi('rgb(' + Math.round(31 + 150 * hot) + ',' + Math.round(74 - 20 * hot) + ',' + Math.round(115 - 70 * hot) + ')').rect(20, 36, 46, 48, true);
      H.vessel(K, 20, 28, 46, 56, true);
      K.st(C.paper, 2).ln(4, 22, 40, 22, 40, 28); K.poly([32, 18, 32, 26, 40, 22]); K.poly([48, 18, 48, 26, 40, 22]);
      var op = clamp(u / 2, 0, 1); K.fi(C.orange).rect(38, 12, 4, -8 * op - .5, true); K.st(C.paper, 1.5).rect(37, 4, 6, 8);
      K.tx('valve ' + fmt(clamp(u / 2, 0, 1) * 100, 0) + '%', 48, 9, { c: C.orange, al: 'left', sz: 3.3 }).tx('steam', 4, 19, { al: 'left', sz: 3.2 });
      K.tx('PV ' + fmt(y * 100, 0) + '%', 43, 60, { mono: 1, c: C.paper, sz: 4.2 }).tx('SP 100%', 43, 66, { mono: 1, c: C.brass, sz: 3.4 });
      K.tx('t = ' + fmt(st.t, 0) + ' s', 82, 60, { mono: 1, c: C.muted, sz: 3.4 });
    },
    graph: function (Kc, st) {
      var r = sim(Kc);
      return {
        x0: 0, x1: 100, y0: 0, y1: 2, xt: [0, 20, 40, 60, 80, 100], yt: [0, .5, 1, 1.5, 2], fy: function (t) { return fmt(t * 100, 0) + '%'; }, xl: 'Time  (s)', yl: 'Process value',
        hl: [{ y: 1, label: 'setpoint', c: C.brass }],
        curves: [{ pts: r.map(function (q) { return [q[0], clamp(q[1], -1, 3)]; }), c: C.orange }],
        points: function () { var p = at(r, st.t || 0); return [{ x: p[0], y: p[1] }]; }
      };
    },
    read: function (Kc) { var r = sim(Kc), mx = 0; r.forEach(function (q) { mx = Math.max(mx, q[1]); }); return 'Kc        = <b>' + fmt(Kc, 2) + '</b>\novershoot = <b>' + fmt(Math.max(0, mx - 1) * 100, 0) + '</b> %'; },
    note: 'An oscillating loop usually has too much gain or too little integral time. Cut the gain first, then check the valve for stiction and the measurement for noise before retuning.'
  });

  /* ---------- motor current and heating ---------- */
  var FLC = 28;
  function amps(L) { return Math.sqrt(100 + Math.pow(26.15 * L / 100, 2)); }
  function wind(L) { return 40 + 80 * Math.pow(amps(L) / FLC, 2); }
  def('motor', {
    t: 'Motor Load, Current and Heating', eq: 'More load = More current; heating rises with current squared', eq2: 'P = &radic;3 V I cos&phi; &eta; &nbsp; copper loss &prop; I&sup2;R &nbsp; (15 kW, 415 V, FLC 28 A)',
    cap: 'Three-phase induction motor, 40 °C ambient', alt: 'Motor heating up as load rises',
    sl: { label: 'Load (% of rated)', min: 0, max: 130, step: 1, v: 75, sweep: [10, 128] }, rp: 'br',
    anim: function (ctx, w, h, dt, L, st) {
      var K = H.kit(ctx, w, h), I = amps(L), Tw = wind(L), hot = clamp((Tw - 40) / 130, 0, 1);
      K.fi('rgb(' + Math.round(70 + 150 * hot) + ',' + Math.round(90 - 30 * hot) + ',' + Math.round(110 - 70 * hot) + ')').rect(22, 34, 44, 30, true);
      K.st(C.paper, 2).rect(22, 34, 44, 30); for (var i = 0; i < 6; i++) K.st(C.paper, 1).ln(26 + i * 7, 34, 26 + i * 7, 64);
      K.fi(C.steel).rect(22, 64, 44, 4, true).rect(66, 46, 16, 6, true);
      st.a = (st.a || 0) + dt * 12; K.st(C.paper, 1.5).circ(16, 49, 8); for (var j = 0; j < 4; j++) { var a = st.a + j * Math.PI / 2; K.st(C.muted, 1.5).ln(16, 49, 16 + Math.cos(a) * 7, 49 + Math.sin(a) * 7); }
      ['L1', 'L2', 'L3'].forEach(function (n, k) {
        K.st([C.red, C.brass, C.blue][k], 1.5); var ctx2 = K.ctx; ctx2.beginPath();
        for (var x = 0; x <= 30; x++) { var X = 26 + x, Y = 14 + k * 5 + Math.sin(x / 4 + st.a * .6 - k * 2.094) * 1.8 * I / FLC; if (x) ctx2.lineTo(K.X(X), K.Y(Y)); else ctx2.moveTo(K.X(X), K.Y(Y)); } ctx2.stroke();
      });
      K.tx(fmt(I, 1) + ' A', 74, 18, { mono: 1, c: I > FLC ? C.red : C.paper, al: 'left', sz: 4.4 });
      K.tx('winding ≈ ' + fmt(Tw, 0) + ' °C', 44, 80, { mono: 1, c: Tw > 155 ? C.red : C.paper, sz: 3.8 });
      K.tx(Tw > 155 ? 'over class F limit' : I > FLC ? 'above nameplate' : 'within rating', 44, 88, { c: Tw > 155 ? C.red : I > FLC ? C.orange : C.green, wt: 700, sz: 3.6 });
    },
    graph: {
      x0: 0, x1: 130, y0: 0, y1: 40, xt: [0, 25, 50, 75, 100, 125], yt: [0, 10, 20, 30, 40], fx: function (t) { return t + '%'; }, xl: 'Motor load', yl: 'Current  (A)',
      hl: [{ y: FLC, label: 'nameplate 28 A', c: C.red }], curves: [{ f: amps, c: C.orange }], points: function (L) { return [{ x: L, y: amps(L) }]; }
    },
    read: function (L) { return 'load    = <b>' + fmt(L, 0) + '</b> %\nI       = <b>' + fmt(amps(L), 1) + '</b> A\nwinding ≈ ' + fmt(wind(L), 0) + ' °C'; },
    note: 'Even at no load the motor draws magnetising current. Low supply voltage, unbalanced phases, a thick or cold product, a worn pump, or a blocked cooling fan all push current and winding temperature up. Single-phase motors suit small loads; three-phase gives smooth torque and smaller cables for the same power.'
  });

  /* ---------- cable size ---------- */
  var SIZES = [1.5, 2.5, 4, 6, 10, 16, 25], AMP = [15.5, 21, 28, 36, 50, 68, 89], IL = 28, LEN = 50;
  function drop(A) { return Math.sqrt(3) * LEN * IL * .0175 / A / 415 * 100; }
  def('wire', {
    t: 'Cable Size', eq: 'Too thin a cable runs hot and drops voltage', eq2: 'Voltage drop = &radic;3 L I &rho; / A &nbsp; (copper, 3-phase, 28 A over 50 m)',
    cap: 'Feeder to a 15 kW motor', alt: 'Cable cross-section heating up when too small',
    sl: { label: 'Cable size', min: 0, max: 6, step: 1, v: 2, sweep: [0, 6] }, val: function (s) { return Math.round(s); }, rp: 'tr', period: 14,
    anim: function (ctx, w, h, dt, i, st) {
      var K = H.kit(ctx, w, h), A = SIZES[i], ok = AMP[i] >= IL, d = drop(A), load = IL / AMP[i], hot = clamp((load - .6) / .9, 0, 1);
      var r = 2.5 + Math.sqrt(A) * 2;
      [22, 50, 78].forEach(function (x, k) {
        K.fi('rgba(240,138,60,' + (.15 + .5 * hot) + ')').circ(x, 40, r + 3, true);
        K.st([C.red, C.brass, C.blue][k], 2.5).circ(x, 40, r + 2); K.fi('#B87333').circ(x, 40, r, true);
      });
      K.tx(A + ' mm²', 50, 70, { mono: 1, c: C.paper, sz: 5 });
      K.tx('rated ≈ ' + AMP[i] + ' A', 50, 78, { mono: 1, c: ok ? C.green : C.red, sz: 3.8 });
      K.tx('drop ' + fmt(d, 1) + '%', 50, 85, { mono: 1, c: d > 5 ? C.red : C.paper, sz: 3.8 });
      K.tx(!ok ? 'too small: overheats' : d > 5 ? 'too much voltage drop' : 'suitable', 50, 94, { c: !ok || d > 5 ? C.red : C.green, wt: 700, sz: 3.8 });
    },
    graph: {
      x0: -.5, x1: 6.5, y0: 0, y1: 12, xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 3, 6, 9, 12], fx: function (t) { return SIZES[t] + ''; }, fy: function (t) { return t + '%'; }, xl: 'Cable size  (mm²)', yl: 'Voltage drop at 28 A, 50 m',
      hl: [{ y: 5, label: 'common limit 5%', c: C.red }],
      curves: [{ pts: SIZES.map(function (A, i) { return [i, drop(A)]; }), c: C.orange }], points: function (i) { return [{ x: i, y: drop(SIZES[i]) }]; }
    },
    read: function (i) { return 'size  = <b>' + SIZES[i] + '</b> mm²\nrated ≈ ' + AMP[i] + ' A\ndrop  = <b>' + fmt(drop(SIZES[i]), 1) + '</b> %'; },
    note: 'Current ratings shown are typical for PVC copper cable in conduit. Grouping, ambient temperature and installation method change them, so size cables from your local wiring code, not from this chart.'
  });

  /* ---------- dew point and humidity ---------- */
  function dew(T, RH) { var a = 17.62, b = 243.12, g = Math.log(RH / 100) + a * T / (b + T); return b * g / (a - g); }
  var TA = 30, TS = 15;
  def('dew', {
    t: 'Dew Point and Humidity', eq: 'Cool air below its dew point and water condenses', eq2: 'T<sub>d</sub> = b&gamma;/(a &minus; &gamma;) &nbsp; &gamma; = ln(RH/100) + aT/(b + T) &nbsp; (Magnus)',
    cap: 'Air at 30 °C around a 15 °C chilled-water line', alt: 'Cold pipe collecting condensation',
    sl: { label: 'Relative humidity (%)', min: 10, max: 100, step: .5, v: 40, sweep: [15, 95] }, rp: 'tl',
    anim: function (ctx, w, h, dt, RH, st) {
      var K = H.kit(ctx, w, h), Td = dew(TA, RH), wet = Td > TS;
      var sw = H.swarm(st, 'v', 60, [4, 6, 96, 94]); sw.step(dt, 8);
      sw.list.forEach(function (p, i) { if (i / 60 < RH / 100) K.fi('rgba(143,184,232,.45)').circ(p.x, p.y, .8, true); });
      K.fi('#2A4B6E').rect(10, 42, 80, 16, true); K.st(C.paper, 2).rect(10, 42, 80, 16);
      K.tx('chilled water 15 °C', 50, 52, { c: C.paper, sz: 3.6 });
      st.d = st.d || []; if (wet) { st.de = (st.de || 0) + dt * (Td - TS) * 3; while (st.de > 1) { st.de -= 1; st.d.push({ x: 12 + Math.random() * 76, y: 58 }); } }
      st.d = st.d.filter(function (d) { d.y += dt * 10; K.fi(C.blue).circ(d.x, d.y, 1, true); return d.y < 92; });
      K.tx('dew point ' + fmt(Td, 1) + ' °C', 50, 32, { mono: 1, c: wet ? C.red : C.green, sz: 4 });
      K.tx(wet ? 'pipe sweats' : 'pipe stays dry', 50, 26, { c: wet ? C.red : C.green, wt: 700, sz: 3.6 });
    },
    graph: {
      x0: 10, x1: 100, y0: -10, y1: 32, xt: [10, 25, 50, 75, 100], yt: [-10, 0, 10, 20, 30], fx: function (t) { return t + '%'; }, xl: 'Relative humidity at 30 °C', yl: 'Dew point  (°C)',
      hl: [{ y: TS, label: 'pipe surface 15 °C', c: C.blue }], curves: [{ f: function (r) { return dew(TA, r); }, c: C.orange }], points: function (r) { return [{ x: r, y: dew(TA, r) }]; }
    },
    read: function (r) { return 'RH = <b>' + fmt(r, 0) + '</b> %\nTd = <b>' + fmt(dew(TA, r), 1) + '</b> °C'; },
    note: 'Relative humidity changes with temperature; dew point does not. That is why compressed air is specified by pressure dew point: below it, water drops out in the lines.'
  });

  /* ---------- vacuum system: leaks and ultimate pressure ---------- */
  var S = 50, VV = 2000, PR = 33;
  function pult(Q) { return PR + Q / S; }
  def('leak', {
    t: 'Vacuum Pump-down and Leaks', eq: 'Ultimate vacuum = pump limit + leak / pump speed', eq2: 'P<sub>ult</sub> = P<sub>pump</sub> + Q<sub>leak</sub>/S &nbsp; P(t) = P<sub>ult</sub> + (P<sub>0</sub> &minus; P<sub>ult</sub>) e<sup>&minus;St/V</sup>',
    cap: 'Liquid ring pump 50 L/s on a 2 m³ vessel, 25 °C seal water', alt: 'Vessel with a leaking flange and a vacuum gauge',
    sl: { label: 'Air leak (mbar·L/s)', min: 0, max: 2500, step: 10, v: 0, sweep: [0, 2400] }, rp: 'tr', liveGraph: true,
    anim: function (ctx, w, h, dt, Q, st) {
      var K = H.kit(ctx, w, h), pu = pult(Q);
      st.t = ((st.t || 0) + dt * 30) % 320; var P = pu + (1013 - pu) * Math.exp(-S * st.t / VV);
      K.st(C.paper, 2.2).rect(18, 30, 40, 52); K.st(C.paper, 2).ln(58, 40, 80, 40, 80, 60);
      K.st(C.paper, 2).circ(80, 68, 8); K.tx('pump', 80, 82, { sz: 3.3 });
      if (Q > 0) { st.l = st.l || []; st.la = (st.la || 0) + dt * Q / 120; while (st.la > 1) { st.la -= 1; st.l.push({ x: 4, y: 52 + (Math.random() - .5) * 4 }); } st.l = st.l.filter(function (l) { l.x += dt * 24; K.fi(C.orange).circ(l.x, l.y, .8, true); return l.x < 24; }); K.tx('leak', 6, 46, { c: C.orange, al: 'left', sz: 3.3 }); }
      K.st(C.steel, 3).ln(16, 50, 20, 50).ln(16, 54, 20, 54);
      H.gauge(K, 38, 16, 9, 1 - P / 1013, '');
      K.tx(fmt(P, 0) + ' mbar', 52, 15, { mono: 1, c: C.paper, al: 'left', sz: 3.8 });
      K.tx('t = ' + fmt(st.t, 0) + ' s', 38, 92, { mono: 1, c: C.muted, sz: 3.4 });
    },
    graph: function (Q, st) {
      var pu = pult(Q), f = function (t) { return pu + (1013 - pu) * Math.exp(-S * t / VV); };
      return {
        logy: true, x0: 0, x1: 320, y0: 20, y1: 1100, xt: [0, 80, 160, 240, 320], yt: [20, 50, 100, 200, 500, 1000], xl: 'Time  (s)', yl: 'Vessel pressure  (mbar abs)',
        hl: [{ y: PR, label: 'pump limit ~33 mbar (seal water vapour)', al: 'r' }],
        curves: [{ f: function (t) { return PR + 1e-9 + (1013 - PR) * Math.exp(-S * t / VV); }, c: C.muted, lw: 1.2, dash: [4, 4] }, { f: f, c: C.orange }],
        points: function () { return [{ x: st.t || 0, y: f(st.t || 0) }]; }
      };
    },
    read: function (Q) { return 'leak     = <b>' + fmt(Q, 0) + '</b> mbar·L/s\nultimate = <b>' + fmt(pult(Q), 0) + '</b> mbar'; },
    note: 'If the vacuum stalls, isolate the pump and do a rate-of-rise test on the vessel. Warm seal water raises the pump limit; at 35 °C it is about 56 mbar. Solvent vapour in the ring does the same.'
  });

  /* ---------- compressor power ---------- */
  function kw(Pg) { var r = (Pg + 1.013) / 1.013; return 3.5 * 101325 / 60 * (Math.pow(r, .4 / 1.4) - 1) / .75 / 1000; }
  def('compressor', {
    t: 'Compressed Air Power', eq: 'Every extra bar of pressure costs about 6&ndash;8% more power', eq2: 'W = [k/(k&minus;1)] P<sub>1</sub>Q<sub>1</sub> [(P<sub>2</sub>/P<sub>1</sub>)<sup>(k&minus;1)/k</sup> &minus; 1] / &eta; &nbsp; k = 1.4, &eta; = 0.75',
    cap: 'Per 1 m³/min of free air delivered', alt: 'Air compressor filling a receiver',
    sl: { label: 'Discharge pressure (bar g)', min: 2, max: 12, step: .1, v: 7, sweep: [3, 11] }, rp: 'br',
    anim: function (ctx, w, h, dt, Pg, st) {
      var K = H.kit(ctx, w, h), p = kw(Pg);
      K.st(C.paper, 2).rect(8, 40, 30, 30); st.a = (st.a || 0) + dt * 8;
      for (var i = 0; i < 6; i++) { var x = 12 + ((i * 4 + st.a * 3) % 24); K.st(C.brass, 2).ln(x, 44, x - 3, 66); }
      K.tx('compressor', 23, 76, { sz: 3.3 });
      K.st(C.paper, 2).ln(38, 55, 52, 55); K.st(C.paper, 2.2).rect(52, 30, 26, 46); K.tx('receiver', 65, 82, { sz: 3.3 });
      var sw = H.swarm(st, 'p', Math.round(20 + Pg * 6), [53, 31, 77, 75]); sw.step(dt, 10);
      sw.list.forEach(function (q, i) { if (i < 20 + Pg * 6) K.fi('rgba(143,184,232,.7)').circ(q.x, q.y, .8, true); });
      H.gauge(K, 65, 16, 9, Pg / 14, '');
      K.tx(fmt(Pg, 1) + ' bar g', 80, 15, { mono: 1, c: C.paper, al: 'left', sz: 3.6 });
      K.tx(fmt(p, 2) + ' kW', 23, 34, { mono: 1, c: C.orange, sz: 4 });
    },
    graph: {
      x0: 2, x1: 12, y0: 0, y1: 10, xt: [2, 4, 6, 8, 10, 12], yt: [0, 2, 4, 6, 8, 10], xl: 'Discharge pressure  (bar g)', yl: 'Shaft power  (kW per m³/min)',
      curves: [{ f: kw, c: C.orange }], points: function (Pg) { return [{ x: Pg, y: kw(Pg) }]; }
    },
    read: function (Pg) { return 'P          = <b>' + fmt(Pg, 1) + '</b> bar g\nper m³/min = <b>' + fmt(kw(Pg), 2) + '</b> kW\n10 m³/min  = ' + fmt(10 * kw(Pg), 0) + ' kW'; },
    note: 'Single-stage estimate. Generate air at the lowest pressure the users need, and fix leaks: a 3 mm hole at 7 bar wastes several kW around the clock.'
  });

  /* ---------- flammability of a solvent headspace ---------- */
  function vap(T) { return 100 * Math.pow(10, 6.95464 - 1344.8 / (219.482 + T)) / 760; }
  var LEL = 1.1, UEL = 7.1;
  function zoneF(c) { return c < LEL ? 'too lean' : c > UEL ? 'too rich' : 'flammable'; }
  def('flam', {
    t: 'Flash Point and Flammable Range', eq: 'Above its flash point, a solvent gives off enough vapour to ignite', eq2: 'vapour % = P<sub>sat</sub>(T) / P &times; 100 &nbsp; toluene LEL 1.1%, UEL 7.1%',
    cap: 'Toluene drum, air in the headspace', alt: 'Solvent drum headspace that becomes flammable as it warms',
    sl: { label: 'Liquid temperature (°C)', min: -15, max: 60, step: .5, v: 0, sweep: [-12, 58] }, rp: 'tl',
    anim: function (ctx, w, h, dt, T, st) {
      var K = H.kit(ctx, w, h), c = vap(T), z = zoneF(c);
      K.st(C.paper, 2.2).rect(26, 20, 48, 68); K.fi('rgba(242,215,160,.3)').rect(26.5, 60, 47, 27.5, true);
      K.fi(z === 'flammable' ? 'rgba(240,138,60,.25)' : z === 'too rich' ? 'rgba(183,64,47,.25)' : 'rgba(143,184,232,.08)').rect(26.5, 20.5, 47, 39.5, true);
      var sw = H.swarm(st, 'v', 50, [28, 22, 72, 58]); sw.step(dt, 7);
      sw.list.forEach(function (p, i) { if (i / 50 < clamp(c / 10, 0, 1)) K.fi(C.orange).circ(p.x, p.y, 1, true); });
      if (z === 'flammable') { st.f = (st.f || 0) + dt * 10; var fl = 4 + Math.sin(st.f) * 1.2; K.fi('rgba(240,138,60,.9)').poly([46, 16, 50, 16 - fl * 2, 54, 16]); K.fi('rgba(255,233,168,.9)').poly([48, 16, 50, 16 - fl, 52, 16]); }
      K.tx(z, 50, 96, { c: z === 'flammable' ? C.orange : z === 'too rich' ? C.red : C.blue, wt: 700, sz: 4.4 });
      K.tx(fmt(c, 1) + '% vapour', 50, 40, { mono: 1, c: C.paper, sz: 4 });
      H.thermo(K, 88, 30, 80, (T + 15) / 75, fmt(T, 0) + ' °C');
    },
    graph: {
      x0: -15, x1: 60, y0: 0, y1: 20, xt: [-15, 0, 15, 30, 45, 60], yt: [0, 5, 10, 15, 20], fy: function (t) { return t + '%'; }, xl: 'Liquid temperature  (°C)', yl: 'Vapour in headspace  (vol%)',
      bands: [{ y: 1, from: LEL, to: UEL, fill: 'rgba(240,138,60,.14)', label: 'flammable range', color: C.orange }],
      curves: [{ f: vap, c: C.blue }], vl: [{ x: 4, label: 'flash point ≈ 4 °C', ty: 125 }], points: function (T) { return [{ x: T, y: vap(T) }]; }
    },
    read: function (T) { var c = vap(T); return 'T      = <b>' + fmt(T, 1) + '</b> °C\nvapour = <b>' + fmt(c, 2) + '</b> %\n         ' + zoneF(c); },
    note: 'Inerting the headspace with nitrogen removes the oxygen instead of the vapour. Classified-area equipment (intrinsically safe or flameproof) removes the spark. Fight solvent fires with foam, CO₂ or dry powder; water spreads them.'
  });

  /* ---------- corrosion rate and temperature ---------- */
  function rate(T) { return Math.pow(2, (T - 25) / 10); }
  function rating(m) { return m < 2 ? 'excellent' : m < 20 ? 'good' : m < 50 ? 'satisfactory' : 'unsatisfactory'; }
  def('corrosion', {
    t: 'Corrosion Rate and Temperature', eq: 'Hotter = Faster corrosion; a small rise can move a metal out of range', eq2: 'mpy = 534 W / (D A t) &nbsp; 1 mpy = 0.0254 mm/y &nbsp; rule of thumb: rate doubles every ~10 &deg;C',
    cap: 'Weight-loss coupon, 1 mpy at 25 °C (illustrative)', alt: 'Metal coupon thinning and pitting',
    sl: { label: 'Process temperature (°C)', min: 20, max: 100, step: 1, v: 25, sweep: [25, 100] }, rp: 'tl',
    anim: function (ctx, w, h, dt, T, st) {
      var K = H.kit(ctx, w, h), m = rate(T), f = clamp(lg(m) / 2.4, 0, 1);
      K.fi('rgba(31,74,115,.4)').rect(10, 20, 80, 70, true);
      var th = 14 * (1 - .5 * f); K.fi('#9AA7B4').rect(30, 50 - th / 2, 40, th, true);
      st.p = st.p || []; while (st.p.length < 40) st.p.push({ x: 31 + Math.random() * 38, y: Math.random() < .5 ? -1 : 1, r: Math.random() });
      st.p.forEach(function (p, i) { if (i / 40 < f) K.fi('#7A4A2A').circ(p.x, 50 + p.y * th / 2, .6 + p.r * 1.6 * f, true); });
      K.st(C.paper, 1.5).circ(36, 50, 1.6);
      K.tx(fmt(m, m < 10 ? 1 : 0) + ' mpy', 50, 76, { mono: 1, c: C.paper, sz: 4.4 }).tx(rating(m), 50, 84, { c: m < 20 ? C.green : m < 50 ? C.brass : C.red, wt: 700, sz: 3.8 });
      K.tx(fmt(T, 0) + ' °C', 50, 14, { mono: 1, c: C.orange, sz: 4 });
    },
    graph: {
      logy: true, x0: 20, x1: 100, y0: .5, y1: 300, xt: [20, 40, 60, 80, 100], yt: [1, 2, 5, 20, 50, 200], xl: 'Temperature  (°C)', yl: 'Corrosion rate  (mpy)',
      bands: [{ y: 1, from: .5, to: 2, fill: 'rgba(95,191,138,.08)', label: 'excellent', color: C.green }, { y: 1, from: 2, to: 20, fill: 'rgba(95,191,138,.04)', label: 'good', color: C.green }, { y: 1, from: 20, to: 50, fill: 'rgba(201,162,39,.08)', label: 'satisfactory', color: C.brass }, { y: 1, from: 50, to: 300, fill: 'rgba(183,64,47,.10)', label: 'unsatisfactory', color: C.red }],
      curves: [{ f: rate, c: C.orange }], points: function (T) { return [{ x: T, y: rate(T) }]; }
    },
    read: function (T) { var m = rate(T); return 'T    = <b>' + fmt(T, 0) + '</b> °C\nrate = <b>' + sig(m, 3) + '</b> mpy\n     = ' + sig(m * .0254, 2) + ' mm/y'; },
    note: 'Compatibility charts give one temperature and concentration. Chlorides, oxidisers and crevices cause local pitting that a weight-loss average hides: stainless steel can pit while the coupon looks fine. Test coupons in the real process stream.'
  });

  /* ---------- galvanic corrosion ---------- */
  function galv(r) { return 1 + r; }
  def('galvanic', {
    t: 'Galvanic Corrosion', eq: 'Two metals in contact: the less noble one corrodes faster', eq2: 'anode corrosion &prop; 1 + A<sub>cathode</sub>/A<sub>anode</sub> &nbsp; small anode + big cathode = worst case',
    cap: 'Carbon steel bolts in a stainless steel flange, wet', alt: 'Small steel bolt corroding in a large stainless plate',
    sl: { label: 'Area ratio cathode / anode (log)', min: -1, max: 2, step: .01, v: 0, sweep: [-1, 2] }, val: function (s) { return Math.pow(10, s); }, rp: 'tl',
    anim: function (ctx, w, h, dt, r, st) {
      var K = H.kit(ctx, w, h), aw = clamp(40 / Math.sqrt(r), 4, 70), cw = clamp(40 * Math.sqrt(r), 4, 84), f = clamp(lg(galv(r)) / 2, 0, 1);
      K.fi('rgba(31,74,115,.35)').rect(4, 30, 92, 50, true);
      K.fi('#B8C2CC').rect(50 - cw / 2, 56, cw, 10, true); K.tx('stainless (cathode)', 50, 75, { c: C.paper, sz: 3.3 });
      K.fi('#6B7480').rect(50 - aw / 2, 40, aw, 16, true); K.tx('carbon steel (anode)', 50, 36, { c: C.paper, sz: 3.3 });
      st.r = st.r || []; while (st.r.length < 30) st.r.push({ x: Math.random(), y: Math.random() });
      st.r.forEach(function (p, i) { if (i / 30 < f) K.fi('#8B4A22').circ(50 - aw / 2 + p.x * aw, 40 + p.y * 16, .8 + f, true); });
      st.e = ((st.e || 0) + dt * (2 + 6 * f)) % 6; ctx.lineDashOffset = st.e * K.u; K.st(C.brass, 1.5, [1.5, 2]).ln(50, 50, 50, 60); ctx.lineDashOffset = 0;
      K.tx('×' + fmt(galv(r), 1) + ' corrosion', 50, 92, { mono: 1, c: f > .5 ? C.red : C.paper, sz: 4 });
    },
    graph: {
      logx: true, logy: true, x0: .1, x1: 100, y0: 1, y1: 200, xt: [.1, 1, 10, 100], yt: [1, 2, 5, 10, 20, 50, 100, 200], xl: 'Area ratio  cathode / anode', yl: 'Relative corrosion of anode',
      curves: [{ f: galv, c: C.orange }], points: function (r) { return [{ x: r, y: galv(r) }]; }
    },
    read: function (r) { return 'ratio = <b>' + sig(r, 2) + '</b>\nrate  = <b>×' + fmt(galv(r), 1) + '</b>'; },
    note: 'Simplified: real rates depend on the electrolyte and how far apart the metals sit in the galvanic series. Insulating gaskets, sleeves and washers break the circuit; if metals must touch, make the anode the large part.'
  });

  /* ---------- O-ring squeeze ---------- */
  var CS = 3.53;
  function sq(d) { return 100 * (CS - d) / CS; }
  def('oring', {
    t: 'O-ring Squeeze', eq: 'Too little squeeze leaks; too much cracks and extrudes', eq2: 'squeeze = (cross-section &minus; groove depth) / cross-section &nbsp; static face seal: about 15&ndash;30%',
    cap: '3.53 mm cross-section O-ring in a flange groove', alt: 'O-ring cross-section being compressed in a groove',
    sl: { label: 'Groove depth (mm)', min: 2.2, max: 3.5, step: .01, v: 2.7, sweep: [3.45, 2.25] }, rp: 'tr',
    anim: function (ctx, w, h, dt, d, st) {
      var K = H.kit(ctx, w, h), s = sq(d), ok = s >= 15 && s <= 30, gh = d * 6, ry = gh / 2, rx = Math.min(15, CS * CS / d / 2 * 6);
      K.fi('#5A6B7C').rect(10, 22, 80, 28, true).rect(10, 50, 80, 28, true);
      K.fi(C.bg).rect(32, 50, 36, gh, true);
      K.fi(ok ? '#2F6F4F' : s < 15 ? '#4A5A8A' : '#8A3A2F'); ctx.beginPath(); ctx.ellipse(K.X(50), K.Y(50 + ry), rx * K.u, ry * K.u, 0, 0, 7); ctx.fill();
      K.st(C.paper, 1.5).ln(10, 50, 90, 50).tx('flange', 12, 28, { al: 'left', sz: 3.3, c: C.paper }).tx('groove ' + fmt(d, 2) + ' mm', 70, 50 + gh + 6, { al: 'left', sz: 3.3, c: C.paper });
      K.tx(fmt(s, 0) + '% squeeze', 50, 90, { mono: 1, c: C.paper, sz: 4.4 });
      K.tx(ok ? 'good seal' : s < 15 ? 'too loose: may leak' : 'over-squeezed', 50, 97, { c: ok ? C.green : C.red, wt: 700, sz: 3.6 });
    },
    graph: {
      x0: 2.2, x1: 3.5, y0: 0, y1: 40, xt: [2.2, 2.6, 3, 3.4], yt: [0, 10, 20, 30, 40], fy: function (t) { return t + '%'; }, xl: 'Groove depth  (mm)', yl: 'Squeeze',
      bands: [{ y: 1, from: 15, to: 30, fill: 'rgba(95,191,138,.10)', label: 'typical static range', color: C.green }],
      curves: [{ f: sq, c: C.orange }], points: function (d) { return [{ x: d, y: sq(d) }]; }
    },
    read: function (d) { return 'depth   = <b>' + fmt(d, 2) + '</b> mm\nsqueeze = <b>' + fmt(sq(d), 0) + '</b> %'; },
    note: 'Also check the stretch on the inside diameter (keep under about 5%) and that the elastomer suits the fluid and temperature: the wrong rubber swells, hardens or dissolves however well it fits.'
  });
})();
