/* Interview Prep: concepts in motion. Each concept draws an animated sketch and a live graph from one slider. */
(function () {
  var root = document.querySelector('.cm');
  if (!root) return;
  root.classList.add('cm-js');

  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cs = getComputedStyle(document.documentElement);
  function cv(n, f) { var x = (cs.getPropertyValue(n) || '').trim(); return x || f; }
  var C = {
    paper: cv('--paper', '#ECE7D8'), brass: cv('--brass', '#C9A227'), muted: cv('--muted', '#6E8CA8'),
    grid: '#16283C', axis: '#3A5A7A', dim: '#2C4C6C', bg: '#070F18', blue: '#8FB8E8',
    orange: '#F08A3C', liquid: '#1F4A73', hot: '#B7402F'
  };
  var MONO = "'IBM Plex Mono', monospace", SANS = "'IBM Plex Sans', system-ui, sans-serif";

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lg(x) { return Math.log(x) / Math.LN10; }
  function fmt(x, d) { return x.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function track(name, params) { try { if (window.gtag) gtag('event', name, params || {}); } catch (e) {} }

  /* ---------- canvas helpers ---------- */
  function fit(c) {
    var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    var w = Math.max(10, Math.round(r.width)), h = Math.max(10, Math.round(r.height));
    if (c.width !== Math.round(w * d) || c.height !== Math.round(h * d)) { c.width = Math.round(w * d); c.height = Math.round(h * d); }
    var ctx = c.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  function line(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (var i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.stroke(); }

  // generic x-y plot
  function plot(c, g, x) {
    var f = fit(c), ctx = f.ctx, w = f.w, h = f.h;
    var L = 58, R = 18, T = 18, B = 48, pw = w - L - R, ph = h - T - B;
    function sx(v) { return L + pw * (g.logx ? (lg(v) - lg(g.x0)) / (lg(g.x1) - lg(g.x0)) : (v - g.x0) / (g.x1 - g.x0)); }
    function sy(v) { return T + ph - ph * (g.logy ? (lg(v) - lg(g.y0)) / (lg(g.y1) - lg(g.y0)) : (v - g.y0) / (g.y1 - g.y0)); }
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
    // bands
    (g.bands || []).forEach(function (b) {
      var a = sx(Math.max(b.from, g.x0)), z = sx(Math.min(b.to, g.x1));
      ctx.fillStyle = b.fill; ctx.fillRect(a, T, z - a, ph);
      if (b.label) { ctx.fillStyle = b.color || C.muted; ctx.font = '500 12px ' + SANS; ctx.textAlign = 'center'; ctx.fillText(b.label, (a + z) / 2, T + 16); }
    });
    // grid + ticks
    ctx.lineWidth = 1; ctx.font = '12px ' + SANS; ctx.fillStyle = C.muted;
    g.xt.forEach(function (t) { var X = Math.round(sx(t)) + .5; ctx.strokeStyle = C.grid; line(ctx, [X, T, X, T + ph]); ctx.textAlign = 'center'; ctx.fillText(g.fx ? g.fx(t) : t, X, T + ph + 17); });
    g.yt.forEach(function (t) { var Y = Math.round(sy(t)) + .5; ctx.strokeStyle = C.grid; line(ctx, [L, Y, L + pw, Y]); ctx.textAlign = 'right'; ctx.fillText(g.fy ? g.fy(t) : t, L - 7, Y + 4); });
    ctx.strokeStyle = C.axis; line(ctx, [L + .5, T, L + .5, T + ph + .5, L + pw, T + ph + .5]);
    // axis labels
    ctx.fillStyle = C.muted; ctx.font = '500 12.5px ' + SANS; ctx.textAlign = 'center';
    ctx.fillText(g.xl, L + pw / 2, h - 8);
    ctx.save(); ctx.translate(15, T + ph / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(g.yl, 0, 0); ctx.restore();
    // guides
    (g.hlines || []).forEach(function (hl) {
      var Y = sy(hl.y); ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = C.dim; line(ctx, [L, Y, L + pw, Y]); ctx.restore();
      ctx.fillStyle = C.muted; ctx.font = '12px ' + SANS; ctx.textAlign = 'left'; ctx.fillText(hl.label, L + 8, Y - 6);
    });
    if (g.under) g.under(ctx, sx, sy, x, { L: L, T: T, pw: pw, ph: ph });
    // curves
    ctx.save(); ctx.beginPath(); ctx.rect(L, T, pw, ph); ctx.clip();
    g.curves.forEach(function (cu) {
      var a = cu.from != null ? cu.from : g.x0, z = cu.to != null ? cu.to : g.x1, n = 160;
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var v = g.logx ? Math.pow(10, lg(a) + (lg(z) - lg(a)) * i / n) : a + (z - a) * i / n;
        var X = sx(v), Y = sy(cu.f(v));
        if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
      }
      ctx.strokeStyle = cu.color; ctx.lineWidth = cu.width || 2.5; ctx.setLineDash(cu.dash || []); ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.restore();
    g.curves.forEach(function (cu) {
      if (!cu.label) return;
      var lx = cu.lx, Y = sy(cu.f(lx)) + (cu.dy || -8);
      ctx.fillStyle = cu.color; ctx.font = 'italic 600 14px Georgia, serif'; ctx.textAlign = cu.align || 'left'; ctx.fillText(cu.label, sx(lx) + (cu.dx || 0), Y);
    });
    // points
    g.points(x).forEach(function (p) {
      var X = sx(p.x), Y = sy(p.y);
      ctx.beginPath(); ctx.arc(X, Y, 9, 0, 7); ctx.fillStyle = 'rgba(201,162,39,.18)'; ctx.fill();
      ctx.beginPath(); ctx.arc(X, Y, 5.5, 0, 7); ctx.fillStyle = p.color || '#FFE9A8'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = C.bg; ctx.stroke();
    });
  }

  function square(w, h) { var s = Math.min(w, h); return { s: s, ox: (w - s) / 2, oy: (h - s) / 2, u: s / 100 }; }

  /* ---------- 1. boiling under vacuum (toluene) ---------- */
  function tb(Pmbar) { var mm = Pmbar * 0.750062; return 1344.8 / (6.95464 - lg(mm)) - 219.482; }
  var T_ATM = tb(1013.25);
  var vac = {
    min: 20, max: 1013, sweep: [1013, 60], val: function (s) { return +s; },
    bubbles: [], vap: 0,
    anim: function (ctx, w, h, dt, P) {
      var q = square(w, h), u = q.u, ox = q.ox, oy = q.oy, T = tb(P);
      function X(v) { return ox + v * u; } function Y(v) { return oy + v * u; }
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
      var cx = 40, cy = 64, r = 22;
      // heating jacket
      ctx.lineWidth = 2.2 * u / 1.2; ctx.strokeStyle = C.hot; ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.arc(X(cx), Y(cy), (r + 4) * u, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); ctx.globalAlpha = 1;
      // liquid
      ctx.save(); ctx.beginPath(); ctx.arc(X(cx), Y(cy), r * u, 0, 7); ctx.clip();
      ctx.fillStyle = C.liquid; ctx.fillRect(X(cx - r), Y(cy - 2), 2 * r * u, (r + 4) * u);
      // bubbles: bigger at lower pressure (vapour takes more volume)
      var size = 0.9 + 1.4 * Math.pow(1013 / P, 0.3);
      while (vac.bubbles.length < 26) vac.bubbles.push({ x: cx - 16 + Math.random() * 32, y: cy + 4 + Math.random() * 16, s: .6 + Math.random() * .6 });
      vac.bubbles.forEach(function (b) {
        b.y -= dt * (9 + 6 * b.s);
        if (b.y < cy - 2) { b.y = cy + 14 + Math.random() * 6; b.x = cx - 16 + Math.random() * 32; }
        ctx.beginPath(); ctx.arc(X(b.x), Y(b.y), size * b.s * u, 0, 7); ctx.strokeStyle = 'rgba(236,231,216,.7)'; ctx.lineWidth = 1; ctx.stroke();
      });
      ctx.restore();
      // flask outline + neck
      ctx.strokeStyle = C.paper; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(X(cx), Y(cy), r * u, -Math.PI / 2 + 0.28, -Math.PI / 2 - 0.28 + 2 * Math.PI); ctx.stroke();
      line(ctx, [X(cx - 6), Y(cy - r + 0.8), X(cx - 6), Y(20)]); line(ctx, [X(cx + 6), Y(cy - r + 0.8), X(cx + 6), Y(26)]);
      // vapour line to condenser
      ctx.strokeStyle = C.muted; line(ctx, [X(cx - 6), Y(20), X(cx - 6), Y(14), X(66), Y(14)]); line(ctx, [X(cx + 6), Y(26), X(cx + 6), Y(20), X(66), Y(20)]);
      vac.vap = (vac.vap + dt * 14) % 8;
      ctx.strokeStyle = 'rgba(236,231,216,.75)'; ctx.setLineDash([3 * u / 1.2, 5 * u / 1.2]); ctx.lineDashOffset = -vac.vap * u; ctx.lineWidth = 2;
      line(ctx, [X(cx), Y(40), X(cx), Y(17), X(66), Y(17)]); ctx.setLineDash([]);
      // condenser
      ctx.strokeStyle = C.blue; ctx.lineWidth = 2; ctx.strokeRect(X(66), Y(11), 24 * u, 12 * u);
      ctx.lineWidth = 1; for (var i = 0; i < 3; i++) line(ctx, [X(68), Y(14 + i * 3), X(88), Y(14 + i * 3)]);
      ctx.fillStyle = C.blue; ctx.font = '500 ' + Math.max(10, 3.4 * u) + 'px ' + SANS; ctx.textAlign = 'center'; ctx.fillText('condenser', X(78), Y(8));
      // receiver
      ctx.strokeStyle = C.paper; ctx.lineWidth = 2; line(ctx, [X(78), Y(23), X(78), Y(33)]);
      ctx.beginPath(); ctx.arc(X(78), Y(40), 7 * u, 0, 7); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(X(78), Y(40), 7 * u, 0, 7); ctx.clip(); ctx.fillStyle = C.liquid; ctx.fillRect(X(71), Y(42), 14 * u, 6 * u); ctx.restore();
      // vacuum line
      ctx.strokeStyle = C.muted; line(ctx, [X(85), Y(40), X(97), Y(40)]);
      ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText('to vacuum pump', X(98), Y(54));
      // vacuum gauge dial (0 to 1013 mbar)
      var gx = 78, gy = 72, gr = 12;
      ctx.strokeStyle = C.paper; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(gx), Y(gy), gr * u, 0, 7); ctx.stroke();
      var a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
      ctx.lineWidth = 1; ctx.strokeStyle = C.muted;
      for (var k = 0; k <= 5; k++) { var aa = a0 + (a1 - a0) * k / 5; line(ctx, [X(gx) + Math.cos(aa) * (gr - 3) * u, Y(gy) + Math.sin(aa) * (gr - 3) * u, X(gx) + Math.cos(aa) * (gr - 1) * u, Y(gy) + Math.sin(aa) * (gr - 1) * u]); }
      var an = a0 + (a1 - a0) * P / 1013;
      ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; line(ctx, [X(gx), Y(gy), X(gx) + Math.cos(an) * (gr - 2.5) * u, Y(gy) + Math.sin(an) * (gr - 2.5) * u]);
      ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(X(gx), Y(gy), 1.4 * u, 0, 7); ctx.fill();
      ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText('mbar', X(gx), Y(gy + gr + 5));
      // thermometer
      var tx = 10, tTop = 30, tBot = 82, frac = clamp(T / 120, 0, 1);
      ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5; ctx.strokeRect(X(tx - 1.6), Y(tTop), 3.2 * u, (tBot - tTop) * u);
      ctx.beginPath(); ctx.arc(X(tx), Y(tBot + 2.5), 3.4 * u, 0, 7); ctx.fillStyle = C.hot; ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.hot; var top = tBot - (tBot - tTop) * frac; ctx.fillRect(X(tx - 0.9), Y(top), 1.8 * u, (tBot - top + 1) * u);
      ctx.fillStyle = C.paper; ctx.font = '600 ' + Math.max(11, 4 * u) + 'px ' + MONO; ctx.textAlign = 'left'; ctx.fillText(fmt(T, 0) + ' °C', X(tx + 4), Y(top + 1.5));
    },
    graph: {
      x0: 0, x1: 1013, y0: 0, y1: 125, xt: [0, 200, 400, 600, 800, 1000], yt: [0, 20, 40, 60, 80, 100, 120],
      xl: 'Pressure  (mbar abs)', yl: 'Boiling point  (°C)',
      hlines: [{ y: T_ATM, label: fmt(T_ATM, 1) + ' °C at 1 atm' }],
      curves: [{ f: tb, from: 20, to: 1013, color: C.orange, label: 'toluene', lx: 560, dy: 22 }],
      points: function (P) { return [{ x: P, y: tb(P) }]; }
    },
    read: function (P) {
      return 'P  = <b>' + fmt(P, 0) + '</b> mbar\n   = ' + fmt(P * 0.750062, 0) + ' mmHg\nTb = <b>' + fmt(tb(P), 1) + '</b> °C';
    },
    ev: function (P) { return { pressure_mbar: Math.round(P) }; }
  };

  /* ---------- 2. pump affinity laws ---------- */
  var N0 = 1450, Q0 = 50, H0 = 32, P0 = 6.2;
  var aff = {
    min: 500, max: 1450, sweep: [1450, 600], val: function (s) { return +s; },
    ang: 0, flow: 0,
    anim: function (ctx, w, h, dt, N) {
      var q = square(w, h), u = q.u, ox = q.ox, oy = q.oy, r = N / N0;
      function X(v) { return ox + v * u; } function Y(v) { return oy + v * u; }
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
      var px = 26, py = 70, pr = 13;
      aff.ang += dt * 2 * Math.PI * 1.1 * r;
      aff.flow = (aff.flow + dt * 22 * r) % 9;
      // pipes: suction from left, discharge along bottom to head column
      ctx.strokeStyle = C.paper; ctx.lineWidth = 2;
      line(ctx, [X(2), Y(py - 3), X(px - pr + 1), Y(py - 3)]); line(ctx, [X(2), Y(py + 3), X(px - pr + 1), Y(py + 3)]);
      line(ctx, [X(px + 3), Y(py - pr + 1), X(px + 3), Y(52), X(60), Y(52)]);
      line(ctx, [X(px + 9), Y(py - pr + 3), X(px + 9), Y(58), X(60), Y(58)]);
      ctx.strokeStyle = C.blue; ctx.setLineDash([3 * u / 1.2, 6 * u / 1.2]); ctx.lineDashOffset = -aff.flow * u; ctx.lineWidth = 2.5;
      line(ctx, [X(2), Y(py), X(px - pr), Y(py)]); line(ctx, [X(px + 6), Y(py - pr), X(px + 6), Y(55), X(62), Y(55)]); ctx.setLineDash([]);
      // volute + impeller
      ctx.strokeStyle = C.paper; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(px), Y(py), pr * u, 0, 7); ctx.stroke();
      ctx.strokeStyle = C.brass; ctx.lineWidth = 2;
      for (var i = 0; i < 6; i++) {
        var a = aff.ang + i * Math.PI / 3; ctx.beginPath();
        ctx.moveTo(X(px) + Math.cos(a) * 2.5 * u, Y(py) + Math.sin(a) * 2.5 * u);
        ctx.quadraticCurveTo(X(px) + Math.cos(a + .5) * 7 * u, Y(py) + Math.sin(a + .5) * 7 * u, X(px) + Math.cos(a + .9) * 10.5 * u, Y(py) + Math.sin(a + .9) * 10.5 * u);
        ctx.stroke();
      }
      ctx.fillStyle = C.brass; ctx.beginPath(); ctx.arc(X(px), Y(py), 2.2 * u, 0, 7); ctx.fill();
      // head column
      var cx0 = 60, cx1 = 72, cTop = 8, cBot = 62, lvl = cBot - (cBot - cTop - 4) * r * r;
      ctx.fillStyle = C.liquid; ctx.fillRect(X(cx0), Y(lvl), (cx1 - cx0) * u, (cBot - lvl) * u);
      ctx.strokeStyle = C.paper; ctx.lineWidth = 2; line(ctx, [X(cx0), Y(cTop), X(cx0), Y(cBot), X(cx1), Y(cBot), X(cx1), Y(cTop)]);
      ctx.strokeStyle = C.blue; ctx.lineWidth = 1.5; line(ctx, [X(cx0 + 1), Y(lvl), X(cx1 - 1), Y(lvl)]);
      ctx.fillStyle = C.blue; ctx.font = '600 ' + Math.max(11, 4 * u) + 'px ' + MONO; ctx.textAlign = 'center';
      ctx.fillText(fmt(H0 * r * r, 1) + ' m', X((cx0 + cx1) / 2), Y(cTop - 3));
      // power bar
      var bx = 84, bTop = 8, bBot = 62, pl = bBot - (bBot - bTop) * r * r * r;
      ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5; ctx.strokeRect(X(bx), Y(bTop), 8 * u, (bBot - bTop) * u);
      ctx.fillStyle = C.orange; ctx.fillRect(X(bx) + 2, Y(pl), 8 * u - 4, (bBot - pl) * u - 2);
      ctx.fillStyle = C.orange; ctx.textAlign = 'center'; ctx.fillText(fmt(P0 * r * r * r, 1) + ' kW', X(bx + 4), Y(bTop - 3));
      ctx.fillStyle = C.muted; ctx.font = '500 ' + Math.max(10, 3.4 * u) + 'px ' + SANS;
      ctx.fillText('motor power', X(bx + 4), Y(bBot + 5)); ctx.fillText('head', X((cx0 + cx1) / 2), Y(cBot + 5));
      ctx.fillStyle = C.paper; ctx.font = '600 ' + Math.max(11, 4.2 * u) + 'px ' + MONO; ctx.fillText(fmt(N, 0) + ' rpm', X(px), Y(py + pr + 8));
      ctx.fillStyle = C.blue; ctx.font = '600 ' + Math.max(10, 3.6 * u) + 'px ' + MONO; ctx.textAlign = 'left'; ctx.fillText('Q ' + fmt(Q0 * r, 1) + ' m³/h', X(px + 8), Y(48));
    },
    graph: {
      x0: 500, x1: 1450, y0: 0, y1: 105, xt: [600, 800, 1000, 1200, 1400], yt: [0, 20, 40, 60, 80, 100],
      fy: function (t) { return t + '%'; }, xl: 'Pump speed  N  (rpm)', yl: '% of rated value',
      curves: [
        { f: function (n) { return 100 * n / N0; }, color: C.brass, label: 'Flow ∝ N', lx: 760, dy: -10 },
        { f: function (n) { return 100 * Math.pow(n / N0, 2); }, color: C.blue, label: 'Head ∝ N²', lx: 900, dy: 22 },
        { f: function (n) { return 100 * Math.pow(n / N0, 3); }, color: C.orange, label: 'Power ∝ N³', lx: 1000, dy: 26 }
      ],
      points: function (n) { var r = n / N0; return [{ x: n, y: 100 * r }, { x: n, y: 100 * r * r }, { x: n, y: 100 * r * r * r }]; }
    },
    read: function (N) {
      var r = N / N0;
      return 'N = <b>' + fmt(N, 0) + '</b> rpm (' + fmt(100 * r, 0) + '%)\nQ = ' + fmt(Q0 * r, 1) + ' m³/h\nH = ' + fmt(H0 * r * r, 1) + ' m\nP = <b>' + fmt(P0 * r * r * r, 2) + '</b> kW';
    },
    ev: function (N) { return { speed_rpm: Math.round(N) }; }
  };

  /* ---------- 3. Reynolds number: water, 50 mm pipe ---------- */
  var RHO = 1000, MU = 0.001, D = 0.05, V0 = 0.005, V1 = 2;
  function vel(s) { return V0 * Math.pow(V1 / V0, s / 1000); }
  function reOf(v) { return RHO * v * D / MU; }
  function fr(Re) {
    if (Re <= 2300) return 64 / Re;
    var fl = 64 / 2300, ft = 0.316 * Math.pow(4000, -0.25);
    if (Re < 4000) { var t = (lg(Re) - lg(2300)) / (lg(4000) - lg(2300)); return Math.pow(10, lg(fl) + t * (lg(ft) - lg(fl))); }
    return 0.316 * Math.pow(Re, -0.25);
  }
  function regime(Re) { return Re < 2300 ? 'laminar' : Re < 4000 ? 'transitional' : 'turbulent'; }
  var rey = {
    min: 0, max: 1000, sweep: [0, 1000], val: vel,
    tr: [], dye: [], emit: 0,
    prof: function (y, tau) {
      var lam = 1.5 * (1 - y * y), tur = 1.22 * Math.pow(Math.max(0, 1 - Math.abs(y)), 1 / 7);
      return lam * (1 - tau) + tur * tau;
    },
    anim: function (ctx, w, h, dt, v) {
      var Re = reOf(v), tau = clamp((Re - 2300) / 1700, 0, 1);
      var x0 = 3, x1 = 97, mid = h / 2, R = Math.min(h * 0.22, w * 0.16), sc = w / 100;
      var vis = 10 + 30 * (lg(v / V0) / lg(V1 / V0));
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
      // pipe walls
      ctx.fillStyle = '#0D1B2A'; ctx.fillRect(x0 * sc, mid - R, (x1 - x0) * sc, 2 * R);
      ctx.strokeStyle = C.paper; ctx.lineWidth = 2.5; line(ctx, [x0 * sc, mid - R, x1 * sc, mid - R]); line(ctx, [x0 * sc, mid + R, x1 * sc, mid + R]);
      // tracer particles
      while (rey.tr.length < 70) rey.tr.push({ x: x0 + Math.random() * (x1 - x0), y: Math.random() * 1.9 - 0.95 });
      rey.tr.forEach(function (p) {
        p.x += dt * vis * rey.prof(p.y, tau);
        if (tau > 0) { p.y += (Math.random() - .5) * tau * dt * 7; if (p.y > .95) p.y = 1.9 - p.y; if (p.y < -.95) p.y = -1.9 - p.y; }
        if (p.x > x1) { p.x = x0; p.y = Math.random() * 1.9 - 0.95; }
        ctx.fillStyle = 'rgba(143,184,232,.55)'; ctx.beginPath(); ctx.arc(p.x * sc, mid + p.y * R, 1.6, 0, 7); ctx.fill();
      });
      // dye streak injected on the centre line
      rey.emit += dt;
      while (rey.emit > 0.012) { rey.emit -= 0.012; rey.dye.push({ x: 12, y: 0 }); }
      ctx.fillStyle = C.orange;
      rey.dye = rey.dye.filter(function (p) {
        p.x += dt * vis * rey.prof(p.y, tau);
        var kick = tau * tau * 9 + (Re > 1500 ? (Re - 1500) / 2500 : 0);
        p.y += (Math.random() - .5) * kick * dt * 3 * (p.x - 12) / 30;
        p.y = clamp(p.y, -.97, .97);
        if (p.x < x1) { ctx.globalAlpha = clamp(1 - (p.x - 12) / 110 * tau, .25, 1); ctx.beginPath(); ctx.arc(p.x * sc, mid + p.y * R, 1.9, 0, 7); ctx.fill(); }
        return p.x < x1;
      });
      ctx.globalAlpha = 1;
      // injector
      ctx.strokeStyle = C.orange; ctx.lineWidth = 2; line(ctx, [12 * sc, mid - R - 14, 12 * sc, mid]);
      ctx.fillStyle = C.orange; ctx.font = '500 12px ' + SANS; ctx.textAlign = 'center'; ctx.fillText('dye', 12 * sc, mid - R - 18);
      // velocity profile
      var bx = 74 * sc, k = Math.min(R * 0.55, 16 * sc);
      ctx.strokeStyle = C.dim; ctx.lineWidth = 1; line(ctx, [bx, mid - R, bx, mid + R]);
      ctx.strokeStyle = C.brass; ctx.lineWidth = 2; ctx.beginPath();
      for (var i = 0; i <= 40; i++) { var y = -1 + i / 20; var X = bx + rey.prof(clamp(y, -1, 1), tau) * k; if (i) ctx.lineTo(X, mid + y * R); else ctx.moveTo(X, mid + y * R); }
      ctx.stroke();
      ctx.lineWidth = 1.2;
      for (var j = -3; j <= 3; j++) {
        var yy = j / 3.6, L2 = rey.prof(yy, tau) * k;
        if (L2 < 3) continue;
        line(ctx, [bx, mid + yy * R, bx + L2 - 2, mid + yy * R]);
        line(ctx, [bx + L2 - 5, mid + yy * R - 3, bx + L2 - 1, mid + yy * R, bx + L2 - 5, mid + yy * R + 3]);
      }
      ctx.fillStyle = C.brass; ctx.font = '500 12px ' + SANS; ctx.textAlign = 'center'; ctx.fillText('velocity profile', bx + k * .6, mid + R + 18);
      ctx.fillStyle = Re < 2300 ? C.blue : Re < 4000 ? C.brass : C.orange;
      ctx.font = '800 ' + Math.max(20, h * 0.075) + "px 'Big Shoulders Display', sans-serif"; ctx.textAlign = 'center';
      ctx.fillText(regime(Re).charAt(0).toUpperCase() + regime(Re).slice(1), w / 2, mid - R - 40 > 20 ? mid - R - 40 : 26);
      ctx.fillStyle = C.paper; ctx.font = '600 13px ' + MONO; ctx.fillText('v = ' + fmt(v, 2) + ' m/s', w / 2, mid + R + 40);
    },
    graph: {
      logx: true, logy: true, x0: 100, x1: 200000, y0: 0.01, y1: 0.5,
      xt: [100, 1000, 10000, 100000], yt: [0.01, 0.02, 0.05, 0.1, 0.2, 0.5],
      fx: function (t) { return t.toLocaleString('en-US'); }, xl: 'Reynolds number  Re', yl: 'Friction factor  f  (Darcy)',
      bands: [
        { from: 100, to: 2300, fill: 'rgba(143,184,232,.05)', label: 'Laminar', color: C.blue },
        { from: 2300, to: 4000, fill: 'rgba(201,162,39,.12)', label: '', color: C.brass },
        { from: 4000, to: 200000, fill: 'rgba(240,138,60,.05)', label: 'Turbulent', color: C.orange }
      ],
      curves: [
        { f: function (r) { return 64 / r; }, from: 100, to: 2300, color: C.blue, label: 'f = 64/Re', lx: 420, dx: 10, dy: 0 },
        { f: fr, from: 2300, to: 4000, color: C.brass, dash: [5, 4] },
        { f: function (r) { return 0.316 * Math.pow(r, -0.25); }, from: 4000, to: 200000, color: C.orange, label: 'smooth pipe', lx: 15000, dy: -12 }
      ],
      points: function (v) { var Re = reOf(v); return [{ x: Re, y: fr(Re) }]; }
    },
    read: function (v) {
      var Re = reOf(v);
      return 'v  = <b>' + fmt(v, 3) + '</b> m/s\nRe = <b>' + fmt(Math.round(Re), 0) + '</b>\n     ' + regime(Re) + '\nf  = ' + fmt(fr(Re), 4);
    },
    ev: function (v) { return { re: Math.round(reOf(v)) }; }
  };

  /* ---------- 4. Boyle's law ---------- */
  var K = 10; // bar(a) x L
  var boy = {
    min: 2.5, max: 10, sweep: [10, 2.5], val: function (s) { return +s; },
    ps: [], hits: [], lastV: 10,
    anim: function (ctx, w, h, dt, V) {
      var q = square(w, h), u = q.u, ox = q.ox, oy = q.oy;
      function X(v) { return ox + v * u; } function Y(v) { return oy + v * u; }
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
      var l = 30, r = 70, bot = 90, top = 18, py = bot - (bot - top - 8) * V / 10;
      // gas box
      ctx.fillStyle = 'rgba(183,64,47,.10)'; ctx.fillRect(X(l), Y(py + 2), (r - l) * u, (bot - py - 2) * u);
      while (boy.ps.length < 40) { var a = Math.random() * 6.283; boy.ps.push({ x: l + 2 + Math.random() * (r - l - 4), y: bot - 2 - Math.random() * 30, vx: Math.cos(a) * 34, vy: Math.sin(a) * 34 }); }
      var lo = l + 1.2, hi = r - 1.2, ceil = py + 3.2, floor = bot - 1.2;
      boy.ps.forEach(function (p) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < lo) { p.x = 2 * lo - p.x; p.vx = Math.abs(p.vx); boy.hits.push({ x: lo - 1, y: p.y, t: .35 }); }
        if (p.x > hi) { p.x = 2 * hi - p.x; p.vx = -Math.abs(p.vx); boy.hits.push({ x: hi + 1, y: p.y, t: .35 }); }
        if (p.y > floor) { p.y = 2 * floor - p.y; p.vy = -Math.abs(p.vy); boy.hits.push({ x: p.x, y: floor + 1, t: .35 }); }
        if (p.y < ceil) { p.y = Math.min(floor, ceil + (ceil - p.y)); p.vy = Math.abs(p.vy); boy.hits.push({ x: p.x, top: true, t: .35 }); }
        ctx.fillStyle = '#F2D7A0'; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 1.25 * u, 0, 7); ctx.fill();
      });
      boy.hits = boy.hits.filter(function (hh) {
        hh.t -= dt; if (hh.t <= 0) return false;
        ctx.globalAlpha = hh.t / .35; ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(X(hh.x), Y(hh.top ? ceil - 1 : hh.y), 1.1 * u, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        return true;
      });
      // cylinder
      ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5; line(ctx, [X(l - 1), Y(8), X(l - 1), Y(bot + 1), X(r + 1), Y(bot + 1), X(r + 1), Y(8)]);
      // piston + rod
      ctx.fillStyle = '#5A6B7C'; ctx.fillRect(X(l), Y(py - 1), (r - l) * u, 3 * u);
      ctx.fillStyle = '#3E4B57'; ctx.fillRect(X(46), Y(0), 8 * u, (py - 1) * u);
      ctx.fillStyle = C.paper; ctx.font = '600 ' + Math.max(11, 4 * u) + 'px ' + SANS; ctx.textAlign = 'left'; ctx.fillText('Piston', X(57), Y(6));
      // motion arrow
      var dv = V - boy.lastV; boy.lastV = V;
      if (Math.abs(dv) > 1e-4) {
        var down = dv < 0, ay = py - 10;
        ctx.strokeStyle = down ? '#FF6B6B' : C.blue; ctx.lineWidth = 2;
        line(ctx, [X(50), Y(ay - 6), X(50), Y(ay + 2)]);
        if (down) line(ctx, [X(48), Y(ay), X(50), Y(ay + 3), X(52), Y(ay)]); else line(ctx, [X(48), Y(ay - 4), X(50), Y(ay - 7), X(52), Y(ay - 4)]);
      }
      ctx.fillStyle = C.paper; ctx.font = '600 ' + Math.max(11, 4 * u) + 'px ' + MONO; ctx.textAlign = 'left';
      ctx.fillText(fmt(K / V, 2) + ' bar(a)', X(r + 4), Y((py + bot) / 2));
      ctx.fillStyle = C.muted; ctx.fillText(fmt(V, 1) + ' L', X(r + 4), Y((py + bot) / 2 + 6));
    },
    graph: {
      x0: 2, x1: 10.5, y0: 0, y1: 5, xt: [2, 4, 6, 8, 10], yt: [0, 1, 2, 3, 4, 5],
      xl: 'Volume  V  (L)', yl: 'Pressure  P  (bar abs)',
      under: function (ctx, sx, sy, V) {
        var X = sx(V), Y = sy(K / V), x0 = sx(2), y0 = sy(0);
        ctx.fillStyle = 'rgba(201,162,39,.10)'; ctx.fillRect(x0, Y, X - x0, y0 - Y);
        ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.dim; ctx.lineWidth = 1; line(ctx, [X, Y, X, y0]); line(ctx, [x0, Y, X, Y]); ctx.restore();
      },
      curves: [{ f: function (v) { return K / v; }, from: 2.5, to: 10, color: C.orange, label: 'PV = k', lx: 7.6, dy: -14 }],
      points: function (V) { return [{ x: V, y: K / V }]; }
    },
    read: function (V) {
      return 'V   = <b>' + fmt(V, 2) + '</b> L\nP   = <b>' + fmt(K / V, 3) + '</b> bar(a)\nP·V = ' + fmt(K, 2) + ' bar·L';
    },
    ev: function (V) { return { volume_l: +V.toFixed(1) }; }
  };

  /* ---------- wiring ---------- */
  var DEF = { vacuum: vac, affinity: aff, reynolds: rey, boyle: boy };
  var tabs = root.querySelectorAll('.cm-tab'), cur = null, last = 0;

  Object.keys(DEF).forEach(function (id) {
    var d = DEF[id], sec = document.getElementById(id);
    d.sec = sec; d.slider = sec.querySelector('input[type=range]'); d.btn = sec.querySelector('.cm-play');
    var cvs = sec.querySelectorAll('canvas'); d.ca = cvs[0]; d.cg = cvs[1]; d.ro = sec.querySelector('.cm-read');
    d.playing = !RM; d.phase = 0; d.dirty = true; d.touched = false;
    d.btn.textContent = d.playing ? 'Pause' : 'Play';
    d.slider.addEventListener('input', function () {
      d.playing = false; d.btn.textContent = 'Play'; d.dirty = true;
      if (!d.touched) { d.touched = true; track('concept_slider', Object.assign({ concept: id }, d.ev(d.val(d.slider.value)))); }
    });
    d.btn.addEventListener('click', function () {
      d.playing = !d.playing; d.btn.textContent = d.playing ? 'Pause' : 'Play';
      if (d.playing) { // continue the sweep from the current slider position
        var s = +d.slider.value, a = d.sweep[0], b = d.sweep[1], t = clamp((s - a) / (b - a), 0, 1);
        d.phase = Math.acos(1 - 2 * t) / Math.PI * 0.5;
      }
      track('concept_play', { concept: id, playing: d.playing });
    });
  });

  function show(id, user) {
    if (!DEF[id]) id = 'vacuum';
    cur = DEF[id];
    Object.keys(DEF).forEach(function (k) { DEF[k].sec.hidden = k !== id; DEF[k].dirty = true; });
    tabs.forEach(function (t) { var on = t.getAttribute('data-c') === id; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
    if (user) { try { history.replaceState(null, '', '#' + id); } catch (e) {} track('concept_open', { concept: id }); }
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.getAttribute('data-c'), true); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!k) return;
      var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); n.click();
    });
  });

  function frame(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    var d = cur;
    if (d && !document.hidden) {
      if (d.playing) {
        d.phase = (d.phase + dt / 9) % 1; // one sweep there and back every 9 s
        var e = (1 - Math.cos(d.phase * 2 * Math.PI)) / 2;
        d.slider.value = d.sweep[0] + (d.sweep[1] - d.sweep[0]) * e; d.dirty = true;
      }
      var x = d.val(d.slider.value), fa = fit(d.ca);
      d.anim(fa.ctx, fa.w, fa.h, RM ? 0 : dt, x);
      if (d.dirty || d.playing) { plot(d.cg, d.graph, x); d.ro.innerHTML = d.read(x); d.dirty = false; }
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener('resize', function () { if (cur) cur.dirty = true; });

  window.addEventListener('hashchange', function () { var h = location.hash.slice(1); if (DEF[h] && DEF[h] !== cur) show(h); });
  show((location.hash || '').slice(1));
  requestAnimationFrame(frame);
})();
