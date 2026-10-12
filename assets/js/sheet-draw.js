/* PharmaChemE: simple P&ID / PFD drawing. Symbols from line-network-symbols.js (window.LNS), item names from window.LNE.
   One sheet per page: items (equipment, connectors, junctions), lines between items, valves on lines, instruments. */
(function () {
  'use strict';
  const S = window.LNS, L = window.LNE, root = document.getElementById('sd-app'); if (!S || !L || !root) return;
  const PFD = root.dataset.kind === 'pfd', KEY = 'pcme-sheet-' + (PFD ? 'pfd' : 'pid');
  const EQ = S.EQUIP, SVC = S.SERVICES, ITEMS = L.ITEMS;
  const $ = s => root.querySelector(s), $$ = s => Array.from(root.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let uid = Date.now() % 1e6; const nid = p => p + (++uid).toString(36);
  const ITAG = { pump: 'P', aodd: 'P', gear: 'P', blower: 'K', cv: 'FCV', prv: 'PCV', fe: 'FE', fm: 'FT', rotameter: 'FI', strainer: 'S', hx: 'E', filter: 'F', trap: 'ST', onoff: 'XV', solenoid: 'SV', flamearr: 'FA', breather: 'BV' };
  const INSTS = ['PI', 'PT', 'PIC', 'TI', 'TT', 'TIC', 'LT', 'LG', 'LIC', 'FT', 'FI', 'FIC', 'PDT', 'AT', 'PSV', 'RD'];
  const COMMON = ['tank', 'vessel', 'reactor', 'hxn', 'cond', 'column', 'centrifuge', 'anfd', 'rcvd', 'ct', 'opc', 'junction'];
  const PUMPS = ['pump', 'aodd', 'gear', 'blower'], VALVES = ['ball', 'gate', 'globe', 'butterfly', 'check', 'cv', 'prv', 'onoff', 'diaphragm', 'needle', 'plug', 'solenoid'], INLINE = ['strainer', 'fm', 'rotameter', 'sg', 'filter', 'trap', 'fe', 'flamearr', 'breather', 'hx'];
  const DARK = { bg: '#0A141F', grid: '#0F1E2E', ink: '#ECE7D8', fill: '#0E1B29', mute: '#9FB6CC', mask: 'rgba(10,20,31,.85)', sel: '#C9A227', line: ln => svcCol(ln) },
    PRINT = { bg: '#FFFFFF', grid: null, ink: '#111111', fill: '#FFFFFF', mute: '#444444', mask: 'rgba(255,255,255,.9)', sel: '#111111', line: () => '#111111' };
  const svcCol = ln => (SVC[ln.svc] || SVC.PRC).col;

  /* ---------- state ---------- */
  let doc = blank(), sel = null, tool = 'move', place = null, conn = null, cursor = null, drag = null, undo = [];
  const view = { x: 400, y: 300, z: 1 };
  function blank() { return { v: 1, name: PFD ? 'Process flow diagram' : 'P&ID', items: [], lines: [], inst: [] }; }
  const item = id => doc.items.find(i => i.id === id), line = id => doc.lines.find(l => l.id === id);
  function snap() { undo.push(JSON.stringify(doc)); if (undo.length > 80) undo.shift(); }
  function doUndo() { if (!undo.length) return; doc = JSON.parse(undo.pop()); sel = null; save(); refresh(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(doc)); } catch (e) { /* storage blocked: drawing still works */ } }

  /* ---------- layout ---------- */
  root.className = 'sd';
  root.innerHTML = `
<div class="sd-bar">
  <button type="button" class="sd-mob" id="sd-palbtn">Symbols</button>
  <input class="sd-name" id="sd-name" aria-label="Sheet name">
  <button type="button" id="sd-conn" aria-pressed="false" title="Click one item, then another">Connect</button>
  <button type="button" id="sd-del">Delete</button>
  <button type="button" id="sd-undo" title="Ctrl+Z">Undo</button>
  <span class="sp"></span>
  <button type="button" id="sd-png">Download image</button>
  <button type="button" id="sd-new">New sheet</button>
</div>
<div class="sd-pal" id="sd-pal"><input type="search" id="sd-q" placeholder="Search symbols" aria-label="Search symbols"><div id="sd-list"></div></div>
<div class="sd-wrap" id="sd-wrap"><canvas id="sd-cv" aria-label="${PFD ? 'PFD' : 'P&ID'} drawing"></canvas>
  <div class="sd-msg" id="sd-msg" role="status"></div><div class="sd-hint" id="sd-hint"></div>
  <div class="sd-zoom"><button type="button" id="sd-zo" aria-label="Zoom out">−</button><button type="button" id="sd-fit">Fit</button><button type="button" id="sd-zi" aria-label="Zoom in">+</button></div>
  <div class="sd-card" id="sd-card" hidden></div>
  <div class="sd-start" id="sd-start" hidden></div>
</div>`;
  const cv = $('#sd-cv'), wrap = $('#sd-wrap'), ctx = cv.getContext('2d'); let W = 0, H = 0, dpr = 1;
  new ResizeObserver(() => { const r = wrap.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); paint(); }).observe(wrap);
  const w2s = (x, y) => [(x - view.x) * view.z + W / 2, (y - view.y) * view.z + H / 2];
  const s2w = (x, y) => [(x - W / 2) / view.z + view.x, (y - H / 2) / view.z + view.y];

  /* ---------- geometry: ports on the equipment outline and orthogonal routes ---------- */
  const boxOf = it => { const E = EQ[it.sym] || EQ.user; return { w: E.w, h: E.h }; };
  const hz = s => s === 'l' || s === 'r';
  function portPt(it, side, f) { const b = boxOf(it); f = f || 0;
    if (side === 'c') return [it.x, it.y]; if (side === 't') return [it.x + f * b.w, it.y - b.h / 2]; if (side === 'b') return [it.x + f * b.w, it.y + b.h / 2];
    if (side === 'l') return [it.x - b.w / 2, it.y + f * b.h]; return [it.x + b.w / 2, it.y + f * b.h]; }
  function autoSide(it, other) { if (it.sym === 'junction') return 'c'; const b = boxOf(it), dx = other.x - it.x, dy = other.y - it.y;
    if (it.sym === 'opc') return dx >= 0 ? 'r' : 'l'; return Math.abs(dx) / (b.w / 2 + 40) > Math.abs(dy) / (b.h / 2 + 40) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'b' : 't'); }
  let ENDS = {};
  function computeEnds() { ENDS = {}; const groups = {};
    doc.lines.forEach(ln => { const a = item(ln.a), b = item(ln.b); if (!a || !b) return; const e = { a, b };
      e.sa = ln.pa ? ln.pa.side : autoSide(a, b); e.sb = ln.pb ? ln.pb.side : autoSide(b, a); ENDS[ln.id] = e;
      if (!ln.pa && e.sa !== 'c') (groups[a.id + e.sa] = groups[a.id + e.sa] || []).push([ln, 'a', b]); if (!ln.pb && e.sb !== 'c') (groups[b.id + e.sb] = groups[b.id + e.sb] || []).push([ln, 'b', a]); });
    Object.values(groups).forEach(g => { const side = ENDS[g[0][0].id][g[0][1] === 'a' ? 'sa' : 'sb'], n = g.length; g.sort((p, q) => hz(side) ? p[2].y - q[2].y : p[2].x - q[2].x);
      g.forEach(([ln, end], i) => { ENDS[ln.id]['f' + end] = n > 1 ? Math.max(-.4, Math.min(.4, (i - (n - 1) / 2) * .25)) : 0; }); });
    doc.lines.forEach(ln => { const e = ENDS[ln.id]; if (!e) return; e.A = portPt(e.a, e.sa, ln.pa ? ln.pa.f : e.fa); e.B = portPt(e.b, e.sb, ln.pb ? ln.pb.f : e.fb); e.pts = route(ln, e); }); }
  function route(ln, e) { const A = e.A, B = e.B, aligned = Math.abs(A[0] - B[0]) < 1 || Math.abs(A[1] - B[1]) < 1;
    if (ln.r != null) { const r = ln.r;
      if (r === 'ud') { const ab = boxOf(e.a), bb = boxOf(e.b), low = Math.max(A[1], e.a.y + ab.h / 2, B[1]) + 40 + (+ln.mid || 0);
        if (e.sb === 't') { const sg = Math.sign(e.b.x - A[0]) || 1, xr = e.b.x - sg * (bb.w / 2 + 34), top = Math.min(B[1], e.b.y - bb.h / 2) - 30; return [A, [A[0], low], [xr, low], [xr, top], [B[0], top], B]; }
        return [A, [A[0], low], [B[0], low], B]; }
      if (aligned) return [A, B]; return r === 'v' ? [A, [A[0], B[1]], B] : [A, [B[0], A[1]], B]; }
    if (aligned) return [A, B];
    let ah = e.sa === 'c' ? (e.sb === 'c' ? Math.abs(B[0] - A[0]) > Math.abs(B[1] - A[1]) : hz(e.sb)) : hz(e.sa), bh = e.sb === 'c' ? ah : hz(e.sb);
    if (ah && bh) { const m = ln.mid != null ? ln.mid : (A[0] + B[0]) / 2; return [A, [m, A[1]], [m, B[1]], B]; }
    if (!ah && !bh) { const m = ln.mid != null ? ln.mid : (A[1] + B[1]) / 2; return [A, [A[0], m], [B[0], m], B]; }
    return ah ? [A, [B[0], A[1]], B] : [A, [A[0], B[1]], B]; }
  function cum(p) { const c = [0]; for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return c; }
  function at(p, t) { const c = cum(p), T = c[c.length - 1]; let d = Math.max(0, Math.min(1, t)) * T;
    for (let i = 1; i < p.length; i++) { const l = c[i] - c[i - 1]; if (d <= l || i === p.length - 1) { const f = l ? Math.min(1, d / l) : 0; return { x: p[i - 1][0] + (p[i][0] - p[i - 1][0]) * f, y: p[i - 1][1] + (p[i][1] - p[i - 1][1]) * f, ang: Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0]), leg: i }; } d -= l; }
    return { x: p[0][0], y: p[0][1], ang: 0, leg: 1 }; }
  function project(p, w) { const c = cum(p), T = c[c.length - 1]; let best = { d: 1e9, t: 0, leg: 1 };
    for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1; let f = ((w[0] - a[0]) * dx + (w[1] - a[1]) * dy) / l2; f = Math.max(0, Math.min(1, f));
      const d = Math.hypot(a[0] + dx * f - w[0], a[1] + dy * f - w[1]); if (d < best.d) best = { d, t: T ? (c[i - 1] + f * (c[i] - c[i - 1])) / T : 0, leg: i }; } return best; }
  function instAnchor(q) { const it = item(q.on); if (it) { const b = boxOf(it); return [it.x + (q.ax || 0), it.y - b.h / 2]; } const e = ENDS[q.on]; if (e && e.pts) { const p = at(e.pts, q.t != null ? q.t : .5); return [p.x, p.y]; } return null; }
  const instPos = q => { const a = instAnchor(q); return a ? [a, [a[0] + (q.dx || 0), a[1] + (q.dy != null ? q.dy : -46)]] : null; };
  const valveShown = v => !PFD || (ITEMS[v.k] || {}).g === 'p' || v.k === 'hx';

  /* ---------- tags and names ---------- */
  function nextTag(pre) { const used = new Set(), re = new RegExp('^' + pre.replace(/[^\w]/g, '\\$&') + '-(\\d+)'), add = t => { const m = re.exec(t || ''); if (m) used.add(+m[1]); };
    doc.items.forEach(i => add(i.tag)); doc.lines.forEach(l => (l.valves || []).forEach(v => add(v.tag))); doc.inst.forEach(q => add(q.tag));
    for (let i = 101; i < 9999; i++) if (!used.has(i)) return pre + '-' + i; return pre + '-1'; }
  function nextLineNo(svc) { let mx = 0; doc.lines.forEach(l => { const m = new RegExp('^' + svc + '-(\\d+)$').exec(l.no || ''); if (m) mx = Math.max(mx, +m[1]); }); return svc + '-' + String(mx + 1).padStart(3, '0'); }
  function streams() { let mx = Math.max(0, ...doc.lines.map(l => +l.sno || 0)); return doc.lines.filter(l => ENDS[l.id]).map(l => ({ l, no: l.sno ? +l.sno : ++mx })); }
  const label = it => it ? (it.sym === 'junction' ? 'tee' : it.tag || it.name || '') : '';

  /* ---------- painting ---------- */
  function paint() { if (!W) return; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(ctx, W, H, view, DARK, false); }
  function draw(c, Wd, Ht, v, pal, exp) {
    const tx = (x, y) => [(x - v.x) * v.z + Wd / 2, (y - v.y) * v.z + Ht / 2], k = v.z;
    c.fillStyle = pal.bg; c.fillRect(0, 0, Wd, Ht);
    if (pal.grid && 20 * k > 7) { c.strokeStyle = pal.grid; c.lineWidth = 1; c.beginPath(); const x0 = (0 - Wd / 2) / k + v.x, y0 = (0 - Ht / 2) / k + v.y;
      for (let x = Math.floor(x0 / 20) * 20; ; x += 20) { const s = tx(x, 0)[0]; if (s > Wd) break; c.moveTo(Math.round(s) + .5, 0); c.lineTo(Math.round(s) + .5, Ht); }
      for (let y = Math.floor(y0 / 20) * 20; ; y += 20) { const s = tx(0, y)[1]; if (s > Ht) break; c.moveTo(0, Math.round(s) + .5); c.lineTo(Wd, Math.round(s) + .5); } c.stroke(); }
    computeEnds(); const sno = {}; if (PFD) streams().forEach(s => sno[s.l.id] = s.no);
    const mask = (t, x, y, font, col, left) => { c.font = font; const w = c.measureText(t).width, h = parseFloat(font.split(' ')[1]), x0 = left ? x : x - w / 2; c.fillStyle = pal.mask; c.fillRect(x0 - 3, y - h * .85, w + 6, h * 1.15); c.fillStyle = col; c.fillText(t, x0, y); };
    const under = new Set(); Object.values(ENDS).forEach(e => { if (e.sa === 'b') under.add(e.a.id); if (e.sb === 'b') under.add(e.b.id); });
    doc.lines.forEach(ln => { const e = ENDS[ln.id]; if (!e) return; const pts = e.pts.map(p => tx(p[0], p[1])), isSel = !exp && sel && sel.k === 'line' && sel.id === ln.id, col = pal.line(ln), V = SVC[ln.svc] || {};
      if (isSel) { c.strokeStyle = 'rgba(201,162,39,.45)'; c.lineWidth = Math.max(1.5, 2.2 * k) + 7; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); }
      c.strokeStyle = col; c.lineWidth = Math.max(1.3, (PFD ? 2.4 : 2) * k); if (V.dash) c.setLineDash([8 * k, 5 * k]); c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); c.setLineDash([]);
      const p1 = pts[pts.length - 1], p0 = pts[pts.length - 2], ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), L0 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), back = Math.min(L0 * .5, 14 * k), mx = p1[0] - Math.cos(ang) * back, my = p1[1] - Math.sin(ang) * back;
      c.fillStyle = col; c.beginPath(); c.moveTo(mx + 6 * Math.cos(ang), my + 6 * Math.sin(ang)); c.lineTo(mx + 6 * Math.cos(ang + 2.5), my + 6 * Math.sin(ang + 2.5)); c.lineTo(mx + 6 * Math.cos(ang - 2.5), my + 6 * Math.sin(ang - 2.5)); c.fill();
      let bi = 1, bl = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (l > bl) { bl = l; bi = i; } }
      const a = pts[bi - 1], b = pts[bi];
      if (!PFD && bl > 80 && k > .45) { const t = (ln.size ? ln.size + '-' : '') + (ln.no || ''); c.save(); c.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); let ra = Math.atan2(b[1] - a[1], b[0] - a[0]); if (ra > Math.PI / 2 || ra < -Math.PI / 2) ra += Math.PI; c.rotate(ra);
        c.font = '600 ' + Math.max(9, 10 * k) + 'px IBM Plex Mono, monospace'; c.fillStyle = pal.mute; c.textAlign = 'center'; c.fillText(t, 0, -6 * k - 3); c.restore(); c.textAlign = 'left'; }
      (ln.valves || []).forEach(vl => { if (!valveShown(vl)) return; const p = at(e.pts, vl.t), q = tx(p.x, p.y), s2 = !exp && sel && sel.k === 'valve' && sel.id === vl.id, pump = (ITEMS[vl.k] || {}).g === 'p';
        S.drawItem(c, vl.k, q[0], q[1], p.ang + (vl.rev ? Math.PI : 0), k * (PFD && pump ? 1.2 : 1), s2 ? pal.sel : pal.ink, pal.fill);
        if (vl.tag && k > .5) { c.font = '600 ' + Math.max(8, 9 * k) + 'px IBM Plex Sans, sans-serif'; c.fillStyle = s2 ? pal.sel : pal.mute; c.textAlign = 'center'; c.fillText(vl.tag, q[0], q[1] + (pump ? 32 : 22) * k); c.textAlign = 'left'; } });
      if (PFD && sno[ln.id] != null) { const m = at(e.pts, .5), q = tx(m.x, m.y), d = 11 * Math.max(.7, k); c.fillStyle = pal.fill; c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.moveTo(q[0], q[1] - d); c.lineTo(q[0] + d, q[1]); c.lineTo(q[0], q[1] + d); c.lineTo(q[0] - d, q[1]); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = pal.ink; c.font = '700 ' + Math.max(8, 10 * Math.max(.7, k)) + 'px IBM Plex Sans, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(sno[ln.id]), q[0], q[1] + .5); c.textBaseline = 'alphabetic'; c.textAlign = 'left'; } });
    doc.items.forEach(it => { const q = tx(it.x, it.y), isSel = !exp && sel && sel.k === 'item' && sel.id === it.id, cn = !exp && conn === it.id, col = isSel || cn ? pal.sel : pal.ink, b = boxOf(it);
      S.drawEq(c, it.sym, q[0], q[1], k, col, pal.fill, it.name);
      if (cn) { c.strokeStyle = pal.sel; c.setLineDash([4, 3]); c.strokeRect(q[0] - b.w * k / 2 - 6, q[1] - b.h * k / 2 - 6, b.w * k + 12, b.h * k + 12); c.setLineDash([]); }
      if (it.sym === 'opc' || it.sym === 'junction') return;
      const side = under.has(it.id), lx = side ? q[0] + b.w * k / 2 + 10 * k : q[0], yb = side ? q[1] + b.h * k / 2 - 26 * k : q[1] + b.h * k / 2 + (it.sym === 'centrifuge' ? 40 : 14) * k + 2, f1 = '700 ' + Math.max(9, 11 * k) + 'px IBM Plex Sans, sans-serif', f2 = '500 ' + Math.max(8, 10 * k) + 'px IBM Plex Sans, sans-serif';
      if (it.tag) mask(it.tag, lx, yb, f1, col, side); if (it.name) mask(it.name, lx, yb + 12 * k + 2, f2, pal.mute, side); if (PFD && it.cap) mask(it.cap, lx, yb + 24 * k + 4, f2, pal.mute, side); });
    if (!PFD) doc.inst.forEach(qn => { const ab = instPos(qn); if (!ab) return; const A = tx(ab[0][0], ab[0][1]), B = tx(ab[1][0], ab[1][1]), s2 = !exp && sel && sel.k === 'inst' && sel.id === qn.id;
      c.strokeStyle = pal.mute; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); c.setLineDash([]); S.drawInst(c, qn, B[0], B[1], k, s2 ? pal.sel : pal.ink, pal.fill); });
    if (PFD) streamTable(c, tx, k, pal);
    if (!exp && conn && cursor) { const a = item(conn); if (a) { const A = tx(a.x, a.y), B = tx(cursor[0], cursor[1]); c.setLineDash([6, 5]); c.strokeStyle = pal.sel; c.lineWidth = 2; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); c.setLineDash([]); } }
    if (!exp && place && cursor) { const q = tx(cursor[0], cursor[1]); c.globalAlpha = .55; if (place.kind === 'eq') S.drawEq(c, place.key, q[0], q[1], k, pal.sel, pal.fill); else if (place.kind === 'item') S.drawItem(c, place.key, q[0], q[1], 0, k, pal.sel, pal.fill); else S.drawInst(c, { k: place.key, tag: place.key + '-' }, q[0], q[1], k, pal.sel, pal.fill); c.globalAlpha = 1; }
    if (exp === true) { c.fillStyle = pal.ink; c.font = '700 16px IBM Plex Sans, sans-serif'; c.fillText(doc.name || '', 16, 26); c.font = '500 11px IBM Plex Sans, sans-serif'; c.fillStyle = pal.mute; c.fillText((PFD ? 'Process flow diagram' : 'P&ID, symbols to ISA 5.1 / ISO 10628') + ' · drawn with pharmacheme.in', 16, 44); }
  }
  const SROWS = [['phase', 'Phase'], ['kgh', 'Mass flow (kg/h)'], ['T', 'Temperature (°C)'], ['P', 'Pressure (barg)'], ['comp', 'Fluid / composition']];
  function bounds() { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; doc.items.forEach(it => { const b = boxOf(it); x0 = Math.min(x0, it.x - b.w / 2 - 20); x1 = Math.max(x1, it.x + b.w / 2 + 20); y0 = Math.min(y0, it.y - b.h / 2 - 40); y1 = Math.max(y1, it.y + b.h / 2 + 50); });
    Object.values(ENDS).forEach(e => (e.pts || []).forEach(p => { x0 = Math.min(x0, p[0] - 20); x1 = Math.max(x1, p[0] + 20); y0 = Math.min(y0, p[1] - 30); y1 = Math.max(y1, p[1] + 30); }));
    doc.inst.forEach(q => { const ab = instPos(q); if (ab) { y0 = Math.min(y0, ab[1][1] - 20); x0 = Math.min(x0, ab[1][0] - 20); x1 = Math.max(x1, ab[1][0] + 20); } });
    return x0 > x1 ? null : { x0, y0, x1, y1 }; }
  function tableBox() { const st = PFD ? streams() : [], b = bounds(); if (!st.length || !b) return null; const per = 10, blocks = Math.ceil(st.length / per); return { x0: b.x0, y0: b.y1 + 30, w: 150 + Math.min(per, st.length) * 100, h: blocks * (18 * (SROWS.length + 1) + 18), st, per }; }
  function streamTable(c, tx, k, pal) { const tb = tableBox(); if (!tb) return; const cw = 100, lw = 150, rh = 18;
    for (let bk = 0; bk * tb.per < tb.st.length; bk++) { const part = tb.st.slice(bk * tb.per, bk * tb.per + tb.per), y0 = tb.y0 + bk * (rh * (SROWS.length + 1) + 18), o = tx(tb.x0, y0);
      c.fillStyle = pal.fill; c.fillRect(o[0], o[1], (lw + cw * part.length) * k, rh * (SROWS.length + 1) * k); c.strokeStyle = pal === DARK ? '#3B5875' : '#555'; c.lineWidth = 1;
      const cell = (t, x, y, w, bold) => { const a = tx(x, y); c.strokeRect(a[0], a[1], w * k, rh * k); c.font = (bold ? '700 ' : '500 ') + Math.max(7, 10.5 * k) + 'px IBM Plex Sans, sans-serif'; c.fillStyle = bold ? pal.ink : pal.mute; c.textBaseline = 'middle'; let s = String(t == null ? '' : t); while (s.length > 2 && c.measureText(s).width > (w - 8) * k) s = s.slice(0, -2) + '…'; c.fillText(s, a[0] + 5 * k, a[1] + rh * k / 2 + 1); c.textBaseline = 'alphabetic'; };
      [['no', 'Stream']].concat(SROWS).forEach((r, i) => { cell(r[1], tb.x0, y0 + i * rh, lw, true); part.forEach((s, j) => cell(i === 0 ? s.no : (s.l.st || {})[r[0]] || (r[0] === 'comp' ? s.l.fluid || (SVC[s.l.svc] || {}).n || '' : ''), tb.x0 + lw + j * cw, y0 + i * rh, cw, i === 0)); }); } }

  /* ---------- picking ---------- */
  function hit(w) { computeEnds(); const tol = 8 / view.z;
    if (!PFD) for (const q of doc.inst) { const ab = instPos(q); if (ab && Math.hypot(ab[1][0] - w[0], ab[1][1] - w[1]) < 15) return { k: 'inst', o: q }; }
    for (const ln of doc.lines) { const e = ENDS[ln.id]; if (!e) continue; for (const v of (ln.valves || [])) { if (!valveShown(v)) continue; const p = at(e.pts, v.t); if (Math.hypot(p.x - w[0], p.y - w[1]) < 12) return { k: 'valve', o: v, ln }; } }
    let best = null, bd = 1e9; for (const it of doc.items) { const b = boxOf(it), hw = Math.max(9, b.w / 2), hh = Math.max(9, b.h / 2); if (Math.abs(it.x - w[0]) < hw && Math.abs(it.y - w[1]) < hh) { const d = Math.hypot(it.x - w[0], it.y - w[1]) - (it.sym === 'junction' ? 50 : 0); if (d < bd) { bd = d; best = it; } } }
    if (best) return { k: 'item', o: best };
    let bl = null; for (const ln of doc.lines) { const e = ENDS[ln.id]; if (!e) continue; const p = project(e.pts, w); if (p.d < tol && (!bl || p.d < bl.d)) bl = { k: 'line', o: ln, t: p.t, d: p.d, leg: p.leg }; } return bl; }

  /* ---------- editing operations ---------- */
  function addItem(sym, w) { const E = EQ[sym], it = { id: nid('i'), sym, x: Math.round(w[0] / 10) * 10, y: Math.round(w[1] / 10) * 10 };
    if (sym === 'opc') it.name = 'From / to'; else if (sym !== 'junction') { it.tag = nextTag(E.pre); it.name = E.n.replace(/ \(.*\)|\s\/.*/g, ''); } doc.items.push(it); return it; }
  function addLine(a, b) { const svc = 'PRC', ln = { id: nid('l'), a: a.id, b: b.id, svc, no: nextLineNo(svc), autoNo: true, valves: [] }; doc.lines.push(ln); return ln; }
  function splitLine(ln, t) { computeEnds(); const e = ENDS[ln.id], p = at(e.pts, t), j = addItem('junction', [p.x, p.y]); j.x = Math.round(p.x); j.y = Math.round(p.y);
    const ln2 = Object.assign(JSON.parse(JSON.stringify(ln)), { id: nid('l'), a: j.id, pa: null, no: nextLineNo(ln.svc), autoNo: true }); delete ln2.r; delete ln2.mid; delete ln2.sno;
    ln2.valves = (ln.valves || []).filter(v => v.t > t).map(v => Object.assign(v, { t: (v.t - t) / (1 - t) })); ln.valves = (ln.valves || []).filter(v => v.t <= t).map(v => Object.assign(v, { t: v.t / t }));
    ln.b = j.id; ln.pb = null; delete ln.r; delete ln.mid; doc.lines.splice(doc.lines.indexOf(ln) + 1, 0, ln2);
    doc.inst.forEach(q => { if (q.on === ln.id) { if ((q.t || .5) > t) { q.on = ln2.id; q.t = ((q.t || .5) - t) / (1 - t); } else q.t = (q.t || .5) / t; } }); return j; }
  function removeSel() { if (!sel) return; snap();
    if (sel.k === 'item') { const gone = new Set(doc.lines.filter(l => l.a === sel.id || l.b === sel.id).map(l => l.id)); doc.items = doc.items.filter(i => i.id !== sel.id); doc.lines = doc.lines.filter(l => !gone.has(l.id)); doc.inst = doc.inst.filter(q => q.on !== sel.id && !gone.has(q.on)); }
    else if (sel.k === 'line') { doc.lines = doc.lines.filter(l => l.id !== sel.id); doc.inst = doc.inst.filter(q => q.on !== sel.id); }
    else if (sel.k === 'valve') doc.lines.forEach(l => { l.valves = (l.valves || []).filter(v => v.id !== sel.id); });
    else if (sel.k === 'inst') doc.inst = doc.inst.filter(q => q.id !== sel.id);
    sel = null; changed(); }

  /* ---------- tools ---------- */
  function setTool(t, p) { tool = t; place = t === 'place' ? p : null; conn = null; $('#sd-conn').setAttribute('aria-pressed', String(t === 'connect')); wrap.classList.toggle('placing', t === 'place'); wrap.classList.toggle('connecting', t === 'connect');
    $$('#sd-list .s').forEach(b => b.setAttribute('aria-pressed', String(!!(place && b.dataset.key === place.key && b.dataset.kind === place.kind)))); hint(); paint(); }
  function hint() { const t = tool === 'connect' ? (conn ? 'Now click where the line goes: equipment, a line (adds a tee) or empty space (adds a bend point). Esc to stop.' : 'Click the equipment the line starts from.')
    : tool === 'place' ? (place.kind === 'eq' ? 'Click on the sheet to place it.' : place.kind === 'item' ? 'Click on a line to put it there.' : 'Click on equipment or a line to fit it.') + ' Esc to cancel.'
    : doc.items.length ? 'Drag to move. Click anything to edit it. Use Connect to draw a line between two items.' : 'Pick a symbol on the left, then click the sheet.';
    $('#sd-hint').textContent = t; }
  let msgT = 0; function msg(t) { const m = $('#sd-msg'); m.textContent = t; m.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('on'), 3200); }
  const worldAt = e => { const r = cv.getBoundingClientRect(); return s2w(e.clientX - r.left, e.clientY - r.top); };

  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); const w = worldAt(e);
    if (e.button === 1 || e.button === 2) { drag = { pan: true, sx: e.clientX, sy: e.clientY }; return; }
    if (tool !== 'move') { drag = { click: true, sx: e.clientX, sy: e.clientY, w }; return; }
    const h = hit(w); if (h) { sel = h.k === 'valve' ? { k: 'valve', id: h.o.id, line: h.ln.id } : { k: h.k, id: h.o.id }; drag = { h, w0: w, moved: false, sx: e.clientX, sy: e.clientY }; card(); paint(); return; }
    sel = null; card(); drag = { pan: true, sx: e.clientX, sy: e.clientY, empty: true }; paint(); });
  cv.addEventListener('pointermove', e => { const w = worldAt(e); cursor = w;
    if (drag && drag.pan) { if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 2) wrap.classList.add('panning'); view.x -= e.movementX / view.z; view.y -= e.movementY / view.z; paint(); return; }
    if (drag && drag.click) { if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag = { pan: true, sx: e.clientX, sy: e.clientY }; return; }
    if (drag && drag.h) { if (!drag.moved) { if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return; snap(); drag.moved = true; } const h = drag.h;
      if (h.k === 'item') { h.o.x = Math.round(w[0] / 10) * 10; h.o.y = Math.round(w[1] / 10) * 10; }
      else if (h.k === 'valve') { const e2 = ENDS[h.ln.id]; if (e2) h.o.t = +project(e2.pts, w).t.toFixed(3); }
      else if (h.k === 'inst') { const a = instAnchor(h.o); if (a) { h.o.dx = Math.round(w[0] - a[0]); h.o.dy = Math.round(w[1] - a[1]); } }
      else if (h.k === 'line') { const e2 = ENDS[h.o.id]; if (e2 && e2.pts.length === 4) { const vert = Math.abs(e2.pts[1][0] - e2.pts[2][0]) < 1; h.o.mid = Math.round((vert ? w[0] : w[1]) / 10) * 10; } else if (h.o.r === 'ud') h.o.mid = Math.max(0, Math.round((w[1] - e2.pts[1][1] + (+h.o.mid || 0)) / 10) * 10); }
      paint(); return; }
    if (tool !== 'move') paint(); });
  cv.addEventListener('pointerup', e => { const d = drag; drag = null; wrap.classList.remove('panning'); if (!d) return;
    if (d.h) { if (d.moved) changed(); return; }
    if (!d.click) return; const w = d.w, h = hit(w);
    if (tool === 'place') { const p = place;
      if (p.kind === 'eq') { snap(); const it = addItem(p.key, w); sel = { k: 'item', id: it.id }; setTool('move'); changed(); return; }
      if (p.kind === 'item') { if (!h || (h.k !== 'line' && h.k !== 'valve')) { msg('Click on a line to put the ' + ITEMS[p.key].n.toLowerCase() + ' in it.'); return; } snap();
        const ln = h.k === 'line' ? h.o : h.ln, v = { id: nid('v'), k: p.key, t: h.k === 'line' ? +h.t.toFixed(3) : Math.min(.95, h.o.t + .1), tag: ITAG[p.key] ? nextTag(ITAG[p.key]) : '' }; ln.valves = ln.valves || []; ln.valves.push(v);
        sel = { k: 'valve', id: v.id, line: ln.id }; setTool('move'); changed(); return; }
      if (!h || (h.k !== 'item' && h.k !== 'line' && h.k !== 'valve')) { msg('Click on a piece of equipment or a line to fit the instrument.'); return; } snap();
      const q = { id: nid('q'), k: p.key, tag: nextTag(p.key), dx: 0, dy: /PSV|RD/.test(p.key) ? -30 : -46, mount: /T$|IC$/.test(p.key) ? 'dcs' : 'field' };
      if (h.k === 'item') { q.on = h.o.id; q.ax = Math.round(w[0] - h.o.x); } else { q.on = h.k === 'line' ? h.o.id : h.ln.id; q.t = h.k === 'line' ? +h.t.toFixed(3) : h.o.t; }
      doc.inst.push(q); sel = { k: 'inst', id: q.id }; setTool('move'); changed(); return; }
    if (tool === 'connect') {
      let target = h && h.k === 'item' ? h.o : null;
      if (!conn) { if (!target) { msg('Click a piece of equipment, a connector or a tee to start the line.'); return; } conn = target.id; hint(); paint(); return; }
      snap(); if (!target) target = h && h.k === 'line' ? splitLine(h.o, h.t) : addItem('junction', w);
      if (target.id === conn) { undo.pop(); conn = null; hint(); paint(); return; }
      const ln = addLine(item(conn), target); sel = { k: 'line', id: ln.id }; conn = target.sym === 'junction' ? target.id : null; changed(); hint(); return; } });
  cv.addEventListener('pointercancel', () => { drag = null; wrap.classList.remove('panning'); });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('pointerleave', () => { cursor = null; if (tool !== 'move') paint(); });
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top, q = s2w(sx, sy); zoomAt(Math.exp(-e.deltaY * .0015), q, sx, sy); }, { passive: false });
  function zoomAt(f, q, sx, sy) { view.z = Math.max(.2, Math.min(4, view.z * f)); view.x = q[0] - (sx - W / 2) / view.z; view.y = q[1] - (sy - H / 2) / view.z; paint(); }
  $('#sd-zi').onclick = () => zoomAt(1.25, [view.x, view.y], W / 2, H / 2); $('#sd-zo').onclick = () => zoomAt(.8, [view.x, view.y], W / 2, H / 2); $('#sd-fit').onclick = () => { fit(); paint(); };
  function fit() { computeEnds(); const b = bounds(); if (!b) { view.x = 400; view.y = 300; view.z = 1; return; } let { x0, y0, x1, y1 } = b; const tb = tableBox(); if (tb) { y1 = tb.y0 + tb.h; x1 = Math.max(x1, tb.x0 + tb.w); }
    const rw = $('#sd-card').hidden || W < 800 ? 0 : 290, Wv = W - rw; view.z = Math.max(.25, Math.min(1.5, Math.min(Wv / (x1 - x0 + 60), H / (y1 - y0 + 60)))); view.x = (x0 + x1) / 2 + rw / 2 / view.z; view.y = (y0 + y1) / 2; }
  document.addEventListener('keydown', e => { if (!root.isConnected) return; const typing = /INPUT|SELECT|TEXTAREA/.test((document.activeElement || {}).tagName || '');
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); doUndo(); }
    else if (e.key === 'Escape') { if (tool !== 'move') setTool('move'); else { sel = null; card(); paint(); } }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && sel && !typing) { e.preventDefault(); removeSel(); } });
  $('#sd-conn').onclick = () => setTool(tool === 'connect' ? 'move' : 'connect');
  $('#sd-del').onclick = () => { if (sel) removeSel(); else msg('Click the item or line to delete first.'); };
  $('#sd-undo').onclick = doUndo;
  $('#sd-name').onchange = e => { doc.name = e.target.value; save(); };
  $('#sd-new').onclick = () => { if (doc.items.length && !confirm('Start a new sheet? This one will be cleared.')) return; snap(); doc = blank(); sel = null; setTool('move'); changed(); startScreen(); };
  $('#sd-palbtn').onclick = () => root.classList.toggle('pal-open');
  $('#sd-png').onclick = () => { computeEnds(); const b = bounds(); if (!b) return msg('The sheet is empty.'); let { x0, y0, x1, y1 } = b; const tb = tableBox(); if (tb) { y1 = tb.y0 + tb.h; x1 = Math.max(x1, tb.x0 + tb.w); }
    const pad = 40, top = 60, sc = 2, Wd = x1 - x0 + pad * 2, Hd = y1 - y0 + pad * 2 + top, c2 = document.createElement('canvas'); c2.width = Wd * sc; c2.height = Hd * sc; const x = c2.getContext('2d'); x.scale(sc, sc);
    draw(x, Wd, Hd, { x: (x0 + x1) / 2, y: (y0 + y1) / 2 - top / 2, z: 1 }, PRINT, true);
    const a = document.createElement('a'); a.href = c2.toDataURL('image/png'); a.download = (doc.name || 'sheet').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') + '.png'; document.body.appendChild(a); a.click(); a.remove(); };

  /* ---------- edit card ---------- */
  function card() { const box = $('#sd-card'); if (!sel) { box.hidden = true; box.innerHTML = ''; return; }
    const f = (id, lab, val, attrs) => '<label>' + lab + '<input id="' + id + '" value="' + esc(val) + '" ' + (attrs || '') + '></label>';
    let h = '<button type="button" class="x" id="c-x" aria-label="Close">✕</button>', bind = [];
    if (sel.k === 'item') { const it = item(sel.id); if (!it) return (sel = null, card()); const E = EQ[it.sym];
      if (it.sym === 'junction') h += '<h3>Tee / junction</h3>';
      else if (it.sym === 'opc') { h += '<h3>Connector</h3>' + f('c-name', 'Text', it.name || '', 'placeholder="e.g. CWS from header"'); bind.push(['c-name', it, 'name']); }
      else { h += '<h3>' + esc(E.n) + '</h3><div class="two">' + f('c-tag', 'Tag', it.tag || '') + f('c-cap', 'Capacity', it.cap || '', 'placeholder="e.g. 6.3 KL"') + '</div>' + f('c-name', 'Name', it.name || '');
        if (!PFD) h += f('c-moc', 'MOC', it.moc || '', 'placeholder="e.g. SS316, GLR"');
        if (E.link) h += '<a href="/equipment-instruments/#' + E.link + '" target="_blank" rel="noopener">How a ' + esc(E.n.replace(/ \(.*\)/, '').toLowerCase()) + ' works</a>';
        bind.push(['c-tag', it, 'tag'], ['c-cap', it, 'cap'], ['c-name', it, 'name'], ['c-moc', it, 'moc']); } }
    else if (sel.k === 'line') { const ln = line(sel.id); if (!ln) return (sel = null, card()); const a = item(ln.a), b = item(ln.b);
      h += '<h3>' + (PFD ? 'Stream' : 'Line ' + esc(ln.no || '')) + '</h3><span style="font-size:12.5px;color:var(--muted)">' + esc(label(a)) + ' to ' + esc(label(b)) + '</span>';
      h += '<label>Service<select id="c-svc">' + Object.entries(SVC).map(([k, v]) => '<option value="' + k + '"' + (k === ln.svc ? ' selected' : '') + '>' + k + ', ' + esc(v.n) + '</option>').join('') + '</select></label>';
      if (!PFD) { h += '<div class="two">' + f('c-no', 'Line no.', ln.no || '') + '<label>Size<select id="c-size"><option value="">Not set</option>' + L.NBS.map(nb => '<option' + (+ln.size === nb ? ' selected' : '') + '>' + nb + '</option>').join('') + '</select></label></div>';
        h += '<a href="/design-tools/line-sizing/?fluid=' + ((SVC[ln.svc] || SVC.PRC).u) + '" target="_blank" rel="noopener">Find the size with the Line Sizing calculator</a>'; bind.push(['c-no', ln, 'no']); }
      else { const st = ln.st = ln.st || {}; h += f('c-comp', 'Fluid / composition', st.comp || ln.fluid || '', 'placeholder="e.g. Toluene 95%, water 5%"') + '<div class="two">' + f('c-kgh', 'Mass flow, kg/h', st.kgh || '') + '<label>Phase<select id="c-phase">' + ['', 'Liquid', 'Vapour', 'Two-phase', 'Slurry', 'Solid'].map(p => '<option' + (p === (st.phase || '') ? ' selected' : '') + '>' + p + '</option>').join('') + '</select></label></div>' +
        '<div class="two">' + f('c-T', 'Temperature, °C', st.T || '') + f('c-P', 'Pressure, barg', st.P || '') + '</div>' + f('c-sno', 'Stream no.', ln.sno || '', 'type="number" min="1" placeholder="auto"');
        bind.push(['c-comp', st, 'comp'], ['c-kgh', st, 'kgh'], ['c-phase', st, 'phase'], ['c-T', st, 'T'], ['c-P', st, 'P'], ['c-sno', ln, 'sno']); }
      h += '<button type="button" id="c-flip">Reverse flow direction</button>'; }
    else if (sel.k === 'valve') { const ln = line(sel.line), v = ln && (ln.valves || []).find(x => x.id === sel.id); if (!v) return (sel = null, card());
      h += '<h3>' + esc(ITEMS[v.k].n) + '</h3>' + f('c-tag', 'Tag', v.tag || '', 'placeholder="optional"') + '<span style="font-size:12.5px;color:var(--muted)">On line ' + esc(ln.no || '') + '. Drag it along the line to move it.</span>'; bind.push(['c-tag', v, 'tag']);
      const lk = S.ITEMLINK[v.k]; if (lk) h += '<a href="/equipment-instruments/#' + lk + '" target="_blank" rel="noopener">How a ' + esc(ITEMS[v.k].n.toLowerCase()) + ' works</a>'; }
    else if (sel.k === 'inst') { const q = doc.inst.find(x => x.id === sel.id); if (!q) return (sel = null, card());
      h += '<h3>Instrument</h3><div class="two">' + f('c-tag', 'Tag', q.tag || '') + '<label>Mounting<select id="c-mount">' + [['field', 'Field'], ['panel', 'Local panel'], ['dcs', 'DCS / PLC']].map(([k, l]) => '<option value="' + k + '"' + (k === q.mount ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label></div>' +
        '<span style="font-size:12.5px;color:var(--muted)">' + esc(S.INST[q.k] || q.k) + '</span>'; bind.push(['c-tag', q, 'tag'], ['c-mount', q, 'mount']); }
    h += '<button type="button" class="del" id="c-del">Delete</button>'; box.innerHTML = h; box.hidden = false;
    bind.forEach(([id, o, key]) => { const el = $('#' + id); if (el) el.onchange = () => { snap(); o[key] = el.value; if (o === line(sel.id) && key === 'no') o.autoNo = false; changed(); }; });
    $('#c-x').onclick = () => { sel = null; card(); paint(); }; $('#c-del').onclick = removeSel;
    if ($('#c-svc')) $('#c-svc').onchange = e => { snap(); const ln = line(sel.id); ln.svc = e.target.value; if (ln.autoNo) ln.no = nextLineNo(ln.svc); changed(); };
    if ($('#c-size')) $('#c-size').onchange = e => { snap(); line(sel.id).size = e.target.value; changed(); };
    if ($('#c-flip')) $('#c-flip').onclick = () => { snap(); const ln = line(sel.id); [ln.a, ln.b] = [ln.b, ln.a]; [ln.pa, ln.pb] = [ln.pb, ln.pa]; delete ln.r; (ln.valves || []).forEach(v => v.t = +(1 - v.t).toFixed(3)); doc.inst.forEach(q => { if (q.on === ln.id && q.t != null) q.t = 1 - q.t; }); changed(); }; }

  /* ---------- symbol panel ---------- */
  function icon(kind, key) { const c = document.createElement('canvas'); c.width = 88; c.height = 66; const x = c.getContext('2d'); x.scale(2, 2);
    if (kind === 'eq') { const E = EQ[key], k = Math.min(34 / E.w, 24 / E.h, 1.1); S.drawEq(x, key, 22, 17, k, '#ECE7D8', '#0E1B29', key === 'opc' ? 'To' : ''); }
    else if (kind === 'item') { x.strokeStyle = '#6F8AA5'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(2, 17); x.lineTo(42, 17); x.stroke(); S.drawItem(x, key, 22, 17, 0, ITEMS[key].g === 'p' ? .9 : 1.2, '#ECE7D8', '#0E1B29'); }
    else S.drawInst(x, { k: key, tag: key + '-', mount: /T$|IC$/.test(key) ? 'dcs' : 'field' }, 22, 17, 1.1, '#ECE7D8', '#0E1B29');
    return c.toDataURL(); }
  function palette() { const g = (title, list, open) => '<details' + (open ? ' open' : '') + '><summary>' + title + '</summary><div class="g">' + list.map(([kind, key, name]) => '<button type="button" class="s" data-kind="' + kind + '" data-key="' + key + '" title="' + esc(name) + '" aria-pressed="false"><img alt="" src="' + icon(kind, key) + '"><span>' + esc(name) + '</span></button>').join('') + '</div></details>';
    const eqName = k => k === 'opc' ? 'Connector (to / from)' : k === 'junction' ? 'Tee / junction' : EQ[k].n;
    let h = g('Most used', COMMON.map(k => ['eq', k, eqName(k)]), true) + g('Pumps', PUMPS.map(k => ['item', k, ITEMS[k].n]), true);
    if (!PFD) h += g('Valves', VALVES.map(k => ['item', k, ITEMS[k].n]), false) + g('Strainers, meters, traps', INLINE.map(k => ['item', k, ITEMS[k].n]), false) + g('Instruments', INSTS.map(k => ['inst', k, k + ', ' + S.INST[k]]), false);
    S.CATS.filter(c => c !== 'Connections').forEach(cat => { h += g(cat, Object.entries(EQ).filter(([, e]) => e.cat === cat && !e.hide).map(([k, e]) => ['eq', k, e.n]), false); });
    $('#sd-list').innerHTML = h;
    $$('#sd-list .s').forEach(b => b.onclick = () => { setTool('place', { kind: b.dataset.kind, key: b.dataset.key }); root.classList.remove('pal-open'); });
    $('#sd-q').oninput = e => { const q = e.target.value.trim().toLowerCase(); $$('#sd-list .s').forEach(b => b.hidden = !!q && !(b.title.toLowerCase().includes(q) || b.dataset.key.toLowerCase() === q)); $$('#sd-list details').forEach(d => { d.hidden = !d.querySelector('.s:not([hidden])'); d.open = q ? true : d === $('#sd-list details'); }); }; }

  /* ---------- start screen and templates ---------- */
  function fromTemplate(T) { const d = blank(); d.name = T.short; const prev = doc; doc = d; const id = {}, nz = {}, grp = {};
    (T.eq || []).forEach(e => { const it = { id: nid('i'), sym: e.sym, x: e.x, y: e.y, name: e.name, cap: e.cap || '', moc: e.moc || '' }; doc.items.push(it); it.tag = nextTag(EQ[e.sym].pre); id[e.id] = it; });
    (T.ex || []).forEach(e => { const it = { id: nid('i'), sym: 'opc', x: e.x, y: e.y, name: e.name }; doc.items.push(it); id[e.id] = it; });
    (T.j || []).forEach(e => { const it = { id: nid('i'), sym: 'junction', x: e.x, y: e.y }; doc.items.push(it); id[e.id] = it; });
    (T.nz || []).forEach(z => nz[z.id] = { on: id[z.on], side: z.side, f: z.f || 0 });
    const end = r => nz[r] ? [nz[r].on, { side: nz[r].side, f: nz[r].f }] : [id[r], { side: 'c', f: 0 }];
    const process = (T.ln || []).some(l => SVC[l.s].pfd && l.s !== 'SLD'), lines = [];
    (T.ln || []).forEach(l => { const [a, pa] = end(l.f), [b, pb] = end(l.t), ln = { id: nid('l'), a: a.id, b: b.id, pa, pb, r: l.route === 'h' ? '' : (l.route || ''), svc: l.s, no: '', autoNo: true, valves: [] };
      lines.push(ln); if (PFD && process && !SVC[l.s].pfd) return; doc.lines.push(ln); ln.no = nextLineNo(l.s);
      (l.items || []).forEach(x => { const v = { id: nid('v'), k: x.k, t: x.t }; ln.valves.push(v); v.tag = x.tag ? x.tag : x.grp ? ((grp[x.grp] = grp[x.grp] || nextTag(x.pre)) + (x.sfx || '')) : x.pre ? nextTag(x.pre) + (x.sfx || '') : ''; }); });
    if (!PFD) (T.in || []).forEach(q => { const o = { id: nid('q'), k: q.k, tag: nextTag(q.k), mount: q.mount || 'field', dx: q.dx || 0, dy: q.dy != null ? q.dy : -46 };
      if (/^line:/.test(q.on)) { o.on = lines[+q.on.slice(5)].id; o.t = q.t != null ? q.t : .5; } else { const tgt = nz[q.on] ? nz[q.on].on : id[q.on]; o.on = tgt.id; o.ax = q.ax || 0; } doc.inst.push(o); });
    if (PFD) { const used = new Set(); doc.lines.forEach(l => { used.add(l.a); used.add(l.b); }); doc.items = doc.items.filter(i => !(['opc', 'junction'].includes(i.sym) && !used.has(i.id))); }
    const out = doc; doc = prev; return out; }
  function thumb(T, c, w, h) { const d = fromTemplate(T), keep = doc; doc = d; computeEnds(); const b = bounds(); const z = Math.min(w / (b.x1 - b.x0 + 20), h / (b.y1 - b.y0 + 20));
    const save2 = { x: view.x, y: view.y, z: view.z }; draw(c, w, h, { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, z }, Object.assign({}, DARK, { grid: null }), 'thumb'); doc = keep; Object.assign(view, save2); computeEnds(); }
  function startScreen() { const s = $('#sd-start');
    s.innerHTML = '<h2>' + (PFD ? 'Start a PFD' : 'Start a P&amp;ID') + '</h2><p>Start blank, or from a ready setup that you can change.</p><div class="grid"><button type="button" class="tpl blank" data-k="">Blank sheet</button>' +
      Object.entries(S.TEMPLATES).map(([k, T]) => '<button type="button" class="tpl" data-k="' + k + '"><canvas width="440" height="250" aria-hidden="true"></canvas><b>' + esc(T.short) + '</b></button>').join('') + '</div>';
    s.hidden = false; $$('#sd-start .tpl').forEach(b => { const c = b.querySelector('canvas'); if (c) thumb(S.TEMPLATES[b.dataset.k], c.getContext('2d'), 440, 250);
      b.onclick = () => { if (b.dataset.k) { snap(); doc = fromTemplate(S.TEMPLATES[b.dataset.k]); } s.hidden = true; sel = null; setTool('move'); changed(); requestAnimationFrame(() => { fit(); paint(); }); }; }); }

  /* ---------- refresh ---------- */
  function changed() { save(); refresh(); }
  function refresh() { $('#sd-name').value = doc.name || ''; card(); hint(); paint(); }
  palette();
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.items) doc = s; } catch (e) { /* ignore */ }
  refresh(); if (!doc.items.length) startScreen(); requestAnimationFrame(() => { fit(); paint(); });
  window.__sd = { get doc() { return doc; }, view, w2s: (x, y) => { const r = cv.getBoundingClientRect(), q = w2s(x, y); return [q[0] + r.left, q[1] + r.top]; }, fit: () => { fit(); paint(); }, setSel: s => { sel = s; card(); paint(); } };
})();
