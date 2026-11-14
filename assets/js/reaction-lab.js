/* PharmaChemE Reaction Lab: draws structures from 2D coordinates, animates curly arrows step by step,
   and plays the lab sequence in an animated flask. Data comes from <script id="rl-data"> built by tools/rxlab/build.js. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', S = 34, REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SUB = { 2: '₂', 3: '₃', 4: '₄' };

  /* ---------- hub page: filter and search ---------- */
  var cards = document.querySelector('.rl-cards');
  if (cards) {
    var chips = document.querySelectorAll('.rl-chip'), q = document.querySelector('.rl-search'), cur = 'all';
    var apply = function () {
      var t = (q.value || '').trim().toLowerCase(), n = 0;
      cards.querySelectorAll('.rl-card').forEach(function (c) { var ok = (cur === 'all' || c.getAttribute('data-c') === cur) && (!t || t.split(/\s+/).every(function (w) { return c.getAttribute('data-k').indexOf(w) >= 0; })); c.hidden = !ok; if (ok) n++; });
      document.querySelector('.rl-none').hidden = n > 0;
    };
    chips.forEach(function (b) { b.addEventListener('click', function () { cur = b.getAttribute('data-c'); chips.forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); apply(); }); });
    q.addEventListener('input', apply);
  }
  var dataEl = document.getElementById('rl-data'); if (!dataEl) return;
  var D = JSON.parse(dataEl.textContent);

  /* ---------- structure drawing ---------- */
  function el(tag, at, parent) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function shown(a, deg) { return a[0] !== 'C' || a[3] !== 0 || deg === 0; }
  function layout(m, ox, oy, minW) {
    // returns atom positions (px) translated so the species bbox centre sits at (ox + w/2, oy)
    var xs = m.a.map(function (a) { return a[1] * S; }), ys = m.a.map(function (a) { return a[2] * S; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var pad = 16, w0 = x1 - x0 + 2 * pad + 10, w = Math.max(w0, minW || 0), sh = (w - w0) / 2, h = y1 - y0 + 2 * pad;
    return { w: w, h: h, p: m.a.map(function (a, i) { return [ox + sh + pad + xs[i] - x0, oy + ys[i] - (y0 + y1) / 2]; }) };
  }
  function neighbours(m, i) { var n = []; m.b.forEach(function (b) { if (b[0] === i) n.push(b[1]); else if (b[1] === i) n.push(b[0]); }); return n; }
  function lpPos(m, P, i) {
    var nb = neighbours(m, i), dx = 0, dy = 0;
    nb.forEach(function (j) { var vx = P[j][0] - P[i][0], vy = P[j][1] - P[i][1], l = Math.hypot(vx, vy) || 1; dx -= vx / l; dy -= vy / l; });
    if (!nb.length) return [P[i][0] + 6, P[i][1] + 15, 0, 1];
    var l = Math.hypot(dx, dy); if (l < 0.2) { dx = -0.8; dy = -0.6; l = 1; }
    var a = m.a[i], hasH = a[4] > 0 && shown(a, nb.length);
    if (hasH && dx > 0.3) { dx = 0; dy = -1; l = 1; }       // keep clear of the H written to the right
    return [P[i][0] + dx / l * 14, P[i][1] + dy / l * 14, dx / l, dy / l];
  }
  function drawMol(g, m, P, lps, cls) {
    var deg = m.a.map(function (_, i) { return neighbours(m, i).length; });
    m.b.forEach(function (b) {
      var p = P[b[0]], q2 = P[b[1]], dx = q2[0] - p[0], dy = q2[1] - p[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      var s0 = shown(m.a[b[0]], deg[b[0]]) ? 9 : 0, s1 = shown(m.a[b[1]], deg[b[1]]) ? 9 : 0;
      var x0 = p[0] + ux * s0, y0 = p[1] + uy * s0, x1 = q2[0] - ux * s1, y1 = q2[1] - uy * s1, nx = -uy, ny = ux;
      var line = function (o, sh) { el('line', { x1: x0 + nx * o + ux * sh, y1: y0 + ny * o + uy * sh, x2: x1 + nx * o - ux * sh, y2: y1 + ny * o - uy * sh, class: 'rl-bond' }, g); };
      if (b[2] === 1) line(0, 0);
      else if (b[2] === 2) {
        // ring double bonds sit inside the ring; others are centred
        var side = 0;
        neighbours(m, b[0]).concat(neighbours(m, b[1])).forEach(function (j) { if (j === b[0] || j === b[1]) return; var v = (P[j][0] - p[0]) * nx + (P[j][1] - p[1]) * ny; side += v > 1 ? 1 : v < -1 ? -1 : 0; });
        var inRing = neighbours(m, b[0]).some(function (j) { return j !== b[1] && neighbours(m, b[1]).some(function (k) { return k !== b[0] && (k === j || neighbours(m, k).indexOf(j) >= 0); }); }) || false;
        if (inRing && side !== 0) { line(0, 0); line(5 * Math.sign(side), 5); } else { line(2.6, 0); line(-2.6, 0); }
      } else { line(0, 0); line(4, 0); line(-4, 0); }
    });
    m.a.forEach(function (a, i) {
      if (!shown(a, deg[i])) return;
      if (deg[i] === 0 && a[4] > 0 && /^(O|S|F|Cl|Br|I)$/.test(a[0])) {   // small molecules: H₂O, HO⁻, HCl, HBr
        var w = el('text', { x: P[i][0], y: P[i][1] + 5, class: 'rl-atom rl-' + a[0], 'text-anchor': 'middle' }, g); w.textContent = 'H' + (a[4] > 1 ? SUB[a[4]] : '') + a[0];
        if (a[3]) { el('circle', { cx: P[i][0] + 16, cy: P[i][1] - 9, r: 5.5, class: 'rl-chg' }, g); var c2 = el('text', { x: P[i][0] + 16, y: P[i][1] - 5.5, class: 'rl-chgt', 'text-anchor': 'middle' }, g); c2.textContent = a[3] > 0 ? '+' : '−'; }
        return;
      }
      var t = el('text', { x: P[i][0], y: P[i][1] + 5, class: 'rl-atom rl-' + a[0], 'text-anchor': 'middle' }, g);
      t.textContent = a[0];
      var nbs = neighbours(m, i), avx = nbs.reduce(function (s2, j) { return s2 + (P[j][0] - P[i][0]); }, 0) / (nbs.length || 1), left = nbs.length > 0 && avx > 8;
      if (a[4] > 0) { var h = el('text', { x: P[i][0] + (left ? -1 : 1) * (a[0].length > 1 ? 10 : 6), y: P[i][1] + 5, class: 'rl-atom rl-' + a[0], 'text-anchor': left ? 'end' : 'start' }, g); h.textContent = 'H' + (a[4] > 1 ? SUB[a[4]] || a[4] : ''); }
      if (a[3]) {
        var cx = P[i][0] + (a[4] > 0 && !left ? 22 : 10), cy = P[i][1] - 9;
        el('circle', { cx: cx, cy: cy, r: 5.5, class: 'rl-chg' }, g);
        var c = el('text', { x: cx, y: cy + 3.5, class: 'rl-chgt', 'text-anchor': 'middle' }, g); c.textContent = a[3] > 0 ? '+' : '−';
      }
    });
    (lps || []).forEach(function (i) { var L = lpPos(m, P, i), px = -L[3], py = L[2]; el('circle', { cx: L[0] + px * 3, cy: L[1] + py * 3, r: 1.8, class: 'rl-lp' }, g); el('circle', { cx: L[0] - px * 3, cy: L[1] - py * 3, r: 1.8, class: 'rl-lp' }, g); });
  }
  function scene(svg, list, opts) {
    // list: [{m, lp, l (label)}], returns positions per species
    var g = el('g', {}, svg), x = 10, H = 0, pos = [], gap = 34;
    list.forEach(function (sp, k) {
      var L = layout(sp.m, x, 0, opts && opts.labels && sp.l ? sp.l.length * 6.3 + 8 : 0); pos.push(L); H = Math.max(H, L.h); x += L.w;
      if (k < list.length - 1) {
        if (opts && opts.arrowAt === k) { pos.arrowX = x; pos.arrowW = Math.max(120, (opts.cond || '').length * 6.4 + 24); x += pos.arrowW; }
        else { var t = el('text', { x: x + gap / 2, y: 6, class: 'rl-plus', 'text-anchor': 'middle' }, g); t.textContent = '+'; x += gap; }
      }
    });
    list.forEach(function (sp, k) { drawMol(g, sp.m, pos[k].p, sp.lp); });
    var top = -H / 2 - 18, bot = H / 2 + (opts && opts.labels ? 34 : 14);
    if (opts && opts.labels) list.forEach(function (sp, k) {
      var cx = pos[k].p.reduce(function (s, p) { return s + p[0]; }, 0) / pos[k].p.length;
      var t = el('text', { x: cx, y: H / 2 + 20, class: 'rl-lbl', 'text-anchor': 'middle' }, g); t.textContent = sp.l;
    });
    svg.setAttribute('viewBox', [0, top, x + 10, bot - top].join(' '));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.aspectRatio = (x + 10) + ' / ' + (bot - top);
    return { g: g, pos: pos };
  }
  function fit(svg) {
    try { var b = svg.getBBox(), pad = 12; svg.setAttribute('viewBox', [b.x - pad, b.y - pad, b.width + 2 * pad, b.height + 2 * pad].join(' ')); svg.style.aspectRatio = (b.width + 2 * pad) + ' / ' + (b.height + 2 * pad); } catch (e) { /* not rendered yet */ }
  }
  function endPt(e, sp, pos, other) {
    var P = function (s, i) { return pos[s].p[i]; };
    if (e[0] === 'l') { var L = lpPos(sp[e[1]].m, pos[e[1]].p, e[2]); return [L[0], L[1]]; }
    if (e[0] === 'b') { var a = P(e[1], e[2]), b = P(e[1], e[3]); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
    if (e[0] === 'n') { var c = P(e[1], e[2]), d = P(e[3], e[4]), vx = c[0] - d[0], vy = c[1] - d[1], l = Math.hypot(vx, vy) || 1, ta = sp[e[3]].m.a[e[4]], bare = ta[0] === 'C' && !ta[3]; var k = Math.min(bare ? 6 : 14, l / 2); return [d[0] + vx / l * k, d[1] + vy / l * k]; }
    var q = P(e[1], e[2]); if (!other) return q;
    var vx = other[0] - q[0], vy = other[1] - q[1], l = Math.hypot(vx, vy) || 1; return [q[0] + vx / l * 11, q[1] + vy / l * 11];
  }
  function curly(g, p0, p3, cen, delay) {
    var dx = p3[0] - p0[0], dy = p3[1] - p0[1], d = Math.hypot(dx, dy) || 1, nx = dy / d, ny = -dx / d, h = Math.min(60, Math.max(11, 0.45 * d));
    var mx = (p0[0] + p3[0]) / 2, my = (p0[1] + p3[1]) / 2;
    if (Math.hypot(mx + nx * h - cen[0], my + ny * h - cen[1]) < Math.hypot(mx - nx * h - cen[0], my - ny * h - cen[1])) h = -h;   // bow away from the molecules
    var c1 = [p0[0] + dx * 0.15 + nx * h, p0[1] + dy * 0.15 + ny * h], c2 = [p0[0] + dx * 0.85 + nx * h, p0[1] + dy * 0.85 + ny * h];
    var tx = p3[0] - c2[0], ty = p3[1] - c2[1], tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    var e = [p3[0] - tx * 6, p3[1] - ty * 6];
    var path = el('path', { d: 'M' + p0 + ' C' + c1 + ' ' + c2 + ' ' + e, class: 'rl-arrow' }, g);
    var head = el('polygon', { points: [p3, [p3[0] - tx * 10 + ty * 4.5, p3[1] - ty * 10 - tx * 4.5], [p3[0] - tx * 10 - ty * 4.5, p3[1] - ty * 10 + tx * 4.5]].join(' '), class: 'rl-head' }, g);
    if (REDUCED) return;
    var len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len; head.style.opacity = 0;
    setTimeout(function () { path.style.transition = 'stroke-dashoffset .8s ease-in-out'; path.style.strokeDashoffset = 0; setTimeout(function () { head.style.transition = 'opacity .2s'; head.style.opacity = 1; }, 750); }, delay);
  }

  /* ---------- equation ---------- */
  var eqHost = document.getElementById('rl-eq');
  if (eqHost) {
    var svg = el('svg', { class: 'rl-svg', role: 'img', 'aria-label': D.name + ' equation' }, eqHost);
    var list = D.eq.r.map(function (x) { return { m: x.m, l: x.l }; }).concat(D.eq.p.map(function (x) { return { m: x.m, l: x.l }; }));
    var sc = scene(svg, list, { labels: true, arrowAt: D.eq.r.length - 1, cond: D.eq.cond });
    var ax = sc.pos.arrowX, aw = sc.pos.arrowW; el('line', { x1: ax + 8, y1: 0, x2: ax + aw - 12, y2: 0, class: 'rl-rxarrow' }, sc.g); el('polygon', { points: (ax + aw - 8) + ',0 ' + (ax + aw - 18) + ',-5 ' + (ax + aw - 18) + ',5', class: 'rl-head rl-rxhead' }, sc.g);
    var ct = el('text', { x: ax + aw / 2, y: -9, class: 'rl-cond', 'text-anchor': 'middle' }, sc.g); ct.textContent = D.eq.cond;
  }

  /* ---------- mechanism stepper ---------- */
  var mh = document.getElementById('rl-mech');
  if (mh) {
    mh.innerHTML = '<div class="rl-stage"></div><p class="rl-cap" aria-live="polite"></p><div class="rl-ctl"><button type="button" data-m="prev" aria-label="Previous step">←</button><span class="rl-count"></span><button type="button" data-m="next" aria-label="Next step">→</button><button type="button" data-m="replay">Replay arrows</button></div>';
    var mi = 0, stage = mh.querySelector('.rl-stage');
    var showM = function () {
      var st = D.mech[mi]; stage.innerHTML = '';
      var svg2 = el('svg', { class: 'rl-svg', role: 'img', 'aria-label': 'Mechanism step ' + (mi + 1) }, stage);
      var sc2 = scene(svg2, st.sp, {});
      st.ar.forEach(function (a, k) {
        var pf = endPt(a.f, st.sp, sc2.pos), pt = endPt(a.t, st.sp, sc2.pos, pf);
        if (a.f[0] === 'a') pf = endPt(a.f, st.sp, sc2.pos, pt);
        // centre of the atoms near this arrow: the species it starts and ends in
        var ids = [a.f[1], a.t[0] === 'n' ? a.t[3] : a.t[1]], pts = [];
        ids.forEach(function (s) { pts = pts.concat(sc2.pos[s].p); });
        var cen = [pts.reduce(function (t, p) { return t + p[0]; }, 0) / pts.length, pts.reduce(function (t, p) { return t + p[1]; }, 0) / pts.length];
        if (a.side) { cen = [(pf[0] + pt[0]) / 2, (pf[1] + pt[1]) / 2 + 100 * a.side]; }
        // a bond breaking onto one of its own atoms: start beside the bond, land beside the atom
        if (a.f[0] === 'b' && a.t[0] === 'a' && a.t[1] === a.f[1] && (a.t[2] === a.f[2] || a.t[2] === a.f[3])) {
          var P0 = sc2.pos[a.f[1]].p, A = P0[a.f[2]], B = P0[a.f[3]], T = P0[a.t[2]], ux = B[0] - A[0], uy = B[1] - A[1], ul = Math.hypot(ux, uy); ux /= ul; uy /= ul;
          var nx = -uy, ny = ux, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
          if ((mx + nx * 10 - cen[0]) * nx + (my + ny * 10 - cen[1]) * ny < 0) { nx = -nx; ny = -ny; }
          var ox = T === A ? -ux : ux, oy = T === A ? -uy : uy;
          pf = [mx + nx * 6, my + ny * 6]; pt = [T[0] + nx * 10 - ox * 2, T[1] + ny * 10 - oy * 2]; cen = [mx - nx * 40, my - ny * 40];
        }
        curly(sc2.g, pf, pt, cen, 250 + k * 1000);
      });
      fit(svg2);
      mh.querySelector('.rl-cap').textContent = st.cap;
      mh.querySelector('.rl-count').textContent = 'Step ' + (mi + 1) + ' of ' + D.mech.length;
      mh.querySelector('[data-m="prev"]').disabled = mi === 0; mh.querySelector('[data-m="next"]').disabled = mi === D.mech.length - 1;
      mh.querySelector('[data-m="replay"]').hidden = !st.ar.length;
    };
    mh.addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (!b) return; var a = b.getAttribute('data-m'); if (a === 'prev' && mi > 0) mi--; else if (a === 'next' && mi < D.mech.length - 1) mi++; showM(); });
    showM();
  }

  /* ---------- lab flask ---------- */
  var lh = document.getElementById('rl-lab');
  if (lh) {
    lh.innerHTML = '<svg class="rl-flask" viewBox="0 0 340 300" role="img" aria-label="Animated reactor flask">'
      + '<defs><clipPath id="rlclip"><path d="M158 95 V148.3 A58 58 0 1 0 182 148.3 V95 Z"/></clipPath><radialGradient id="rlglow"><stop offset="0" stop-color="#ff8a3d" stop-opacity=".55"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient></defs>'
      + '<g class="rl-bath"><rect x="96" y="170" width="148" height="98" rx="16"/><rect class="ice" x="104" y="178" width="12" height="10" rx="2"/><rect class="ice" x="222" y="182" width="12" height="10" rx="2"/><rect class="ice" x="110" y="232" width="10" height="9" rx="2"/><rect class="ice" x="226" y="236" width="11" height="9" rx="2"/></g>'
      + '<rect class="rl-plate" x="100" y="266" width="140" height="22" rx="4"/><rect class="rl-heat" x="104" y="262" width="132" height="6" rx="3"/><text class="rl-small-t" x="170" y="281" text-anchor="middle">stirrer / heater</text>'
      + '<g clip-path="url(#rlclip)"><rect class="rl-liq" x="100" y="263" width="140" height="0"/><rect class="rl-liq2" x="100" y="263" width="140" height="0"/><circle class="rl-glowc" cx="170" cy="215" r="70" fill="url(#rlglow)"/><g class="rl-solid"></g><g class="rl-bub"></g><rect class="rl-bar" x="160" y="252" width="20" height="6" rx="3"/></g>'
      + '<path class="rl-glass" d="M158 95 V148.3 A58 58 0 1 0 182 148.3 V95"/>'
      + '<path class="rl-glass" d="M182 112 L232 92 M182 120 L232 100"/><text class="rl-small-t rl-ventl" x="236" y="94">to scrubber</text><g class="rl-fume"></g>'
      + '<g class="rl-n2"><path class="rl-glass" d="M100 60 H150 V100"/><text class="rl-small-t" x="98" y="54">N₂</text></g>'
      + '<g class="rl-funnel"><path class="rl-glass" d="M150 18 H190 L178 62 V70 H174 V96 H166 V70 H162 V62 Z"/><path class="rl-fliq" d="M152 22 H188 L177 60 H163 Z"/><text class="rl-small-t rl-fname" x="196" y="30"></text><g class="rl-drops"></g></g>'
      + '<line class="rl-therm" x1="176" y1="70" x2="176" y2="236"/><circle class="rl-thermb" cx="176" cy="238" r="4"/>'
      + '<g class="rl-tbox"><rect x="250" y="160" width="80" height="44" rx="6"/><text class="rl-small-t" x="290" y="176" text-anchor="middle">Temperature</text><text class="rl-tval" x="290" y="197" text-anchor="middle">25 °C</text></g>'
      + '<text class="rl-gasl rl-small-t" x="236" y="112"></text>'
      + '</svg><p class="rl-cap rl-labcap" aria-live="polite"></p><div class="rl-ctl"><button type="button" data-l="prev" aria-label="Previous step">←</button><span class="rl-count"></span><button type="button" data-l="next" aria-label="Next step">→</button><button type="button" data-l="play">Play</button></div>';
    var F = lh.querySelector('svg'), li = 0, Tshow = 25, timer = null, tween = null;
    var $ = function (s) { return F.querySelector(s); };
    var stateAt = function (k) {
      var s = { level: 0, color: '#dfe7ee', T: 25, n2: false, stir: false, solid: null, layers: null };
      for (var i = 0; i <= k; i++) { var x = D.lab[i]; ['level', 'color', 'T', 'n2', 'stir', 'solid', 'layers'].forEach(function (p) { if (p in x) s[p] = x[p]; }); }
      var c = D.lab[k]; ['heat', 'cool', 'glow', 'dose', 'gas', 'distil'].forEach(function (p) { s[p] = c[p] || null; });
      return s;
    };
    var fill = function (g, n, mk) { g.innerHTML = ''; for (var i = 0; i < n; i++) g.appendChild(mk(i)); };
    var showL = function () {
      var s = stateAt(li), top = 263 - s.level * 116;
      var l1 = $('.rl-liq'), l2 = $('.rl-liq2');
      if (s.layers) { var mid = top + (263 - top) * 0.5; l1.setAttribute('y', top); l1.setAttribute('height', mid - top); l1.style.fill = s.layers[0]; l2.setAttribute('y', mid); l2.setAttribute('height', 263 - mid); l2.style.fill = s.layers[1]; }
      else { l1.setAttribute('y', top); l1.setAttribute('height', 263 - top); l1.style.fill = s.color; l2.setAttribute('height', 0); l2.setAttribute('y', 263); }
      F.classList.toggle('is-heat', !!s.heat); F.classList.toggle('is-cool', !!s.cool); F.classList.toggle('is-glow', !!s.glow); F.classList.toggle('is-n2', !!s.n2); F.classList.toggle('is-stir', !!s.stir && s.level > 0);
      F.classList.toggle('is-dose', !!s.dose); F.classList.toggle('is-gas', !!s.gas); F.classList.toggle('is-distil', !!s.distil);
      $('.rl-fliq').style.fill = s.dose ? s.dose.color : 'transparent'; $('.rl-fname').textContent = s.dose ? s.dose.name : '';
      fill($('.rl-drops'), s.dose ? 3 : 0, function (i) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', 170); c.setAttribute('cy', 100); c.setAttribute('r', 2.6); c.style.fill = s.dose.color; c.style.animationDelay = (i * 0.33) + 's'; c.style.setProperty('--fall', Math.max(20, top - 100) + 'px'); return c; });
      var nb = s.gas ? (s.gas.slow ? 5 : 12) : 0;
      fill($('.rl-bub'), nb, function (i) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', 130 + ((i * 37) % 80)); c.setAttribute('cy', 258); c.setAttribute('r', 2 + (i % 3)); c.style.animationDelay = ((i * 0.27) % 1.6) + 's'; c.style.setProperty('--rise', Math.max(10, 258 - top) + 'px'); return c; });
      fill($('.rl-fume'), s.gas || s.distil ? 5 : 0, function (i) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', 186); c.setAttribute('cy', 112); c.setAttribute('r', s.distil ? 2.5 : 4); c.setAttribute('class', s.distil ? 'drop' : ''); c.style.animationDelay = (i * 0.4) + 's'; return c; });
      $('.rl-gasl').textContent = s.gas ? s.gas.name : s.distil ? 'distillate' : '';
      fill($('.rl-solid'), s.solid ? 26 : 0, function (i) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', 122 + ((i * 53) % 96)); c.setAttribute('cy', Math.max(top + 6, 252 - ((i * 29) % Math.max(8, (263 - top) * 0.8)))); c.setAttribute('r', 1.8 + (i % 2)); c.style.fill = s.solid; c.style.animationDelay = (i * 0.13) + 's'; return c; });
      // temperature tween
      clearInterval(tween); var from = Tshow, to = s.T, t0 = Date.now(), dur = REDUCED ? 0 : 1200;
      tween = setInterval(function () { var f = dur ? Math.min(1, (Date.now() - t0) / dur) : 1; Tshow = from + (to - from) * f; $('.rl-tval').textContent = Math.round(Tshow) + ' °C'; if (f >= 1) clearInterval(tween); }, 40);
      lh.querySelector('.rl-labcap').textContent = D.lab[li].cap;
      lh.querySelector('.rl-count').textContent = 'Step ' + (li + 1) + ' of ' + D.lab.length;
      lh.querySelector('[data-l="prev"]').disabled = li === 0; lh.querySelector('[data-l="next"]').disabled = li === D.lab.length - 1;
    };
    var stop = function () { clearInterval(timer); timer = null; lh.querySelector('[data-l="play"]').textContent = 'Play'; };
    lh.addEventListener('click', function (e) {
      var b = e.target.closest('[data-l]'); if (!b) return; var a = b.getAttribute('data-l');
      if (a === 'play') { if (timer) { stop(); return; } if (li === D.lab.length - 1) li = 0; showL(); b.textContent = 'Pause'; timer = setInterval(function () { if (li >= D.lab.length - 1) { stop(); return; } li++; showL(); }, 4200); return; }
      stop(); if (a === 'prev' && li > 0) li--; else if (a === 'next' && li < D.lab.length - 1) li++; showL();
    });
    showL();
  }
})();
