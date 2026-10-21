/* PharmaChemE: P&ID / PFD drawing with a CAD-style workspace.
   Symbols from line-network-symbols.js (window.LNS), item names from window.LNE.
   One sheet per page: items (equipment, connectors, junctions), lines between items, valves on lines, instruments, text notes.
   CAD layer: crosshair, coordinates, GRID / SNAP / ORTHO / OSNAP, command line, window and crossing selection,
   move / copy / rotate / mirror / erase, layers, drawing sheet with title block, PDF and DXF export. */
(function () {
  'use strict';
  const S = window.LNS, L = window.LNE, root = document.getElementById('sd-app'); if (!S || !L || !root) return;
  const PFD = root.dataset.kind === 'pfd', KEY = 'pcme-sheet-' + (PFD ? 'pfd' : 'pid'), OKEY = 'pcme-cad-opts';
  const EQ = S.EQUIP, SVC = S.SERVICES, ITEMS = L.ITEMS;
  const $ = s => root.querySelector(s), $$ = s => Array.from(root.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let uid = Date.now() % 1e6; const nid = p => p + (++uid).toString(36);
  const ITAG = { pump: 'P', aodd: 'P', gear: 'P', blower: 'K', cv: 'FCV', prv: 'PCV', fe: 'FE', fm: 'FT', rotameter: 'FI', strainer: 'S', hx: 'E', filter: 'F', trap: 'ST', onoff: 'XV', solenoid: 'SV', flamearr: 'FA', breather: 'BV' };
  const INSTS = ['PI', 'PT', 'PIC', 'TI', 'TT', 'TIC', 'LT', 'LG', 'LIC', 'FT', 'FI', 'FIC', 'PDT', 'AT', 'PSV', 'RD'];
  const COMMON = ['tank', 'vessel', 'reactor', 'hxn', 'cond', 'column', 'centrifuge', 'anfd', 'rcvd', 'ct', 'opc', 'junction'];
  const PUMPS = ['pump', 'aodd', 'gear', 'blower'], VALVES = ['ball', 'gate', 'globe', 'butterfly', 'check', 'cv', 'prv', 'onoff', 'diaphragm', 'needle', 'plug', 'solenoid'], INLINE = ['strainer', 'fm', 'rotameter', 'sg', 'filter', 'trap', 'fe', 'flamearr', 'breather', 'hx'];
  const DARK = { bg: '#0B0F14', grid: '#141B23', grid2: '#1C2733', ink: '#ECE7D8', fill: '#0E141B', mute: '#9FB6CC', mask: 'rgba(11,15,20,.88)', sel: '#C9A227', border: '#7F93A8', line: ln => svcCol(ln) },
    PRINT = { bg: '#FFFFFF', grid: null, ink: '#111111', fill: '#FFFFFF', mute: '#444444', mask: 'rgba(255,255,255,.9)', sel: '#111111', border: '#111111', line: () => '#111111' };
  const svcCol = ln => (SVC[ln.svc] || SVC.PRC).col;
  const U = 4; /* world units per mm on the drawing sheet */
  const SHEETS = { A3: [1680, 1188], A2: [2376, 1680], A1: [3364, 2376] };
  const LAYERS = [['EQUIPMENT', 'Equipment', 7], ['PROCESS', 'Process lines', 2], ['UTILITY', 'Utility lines', 5], ['VALVES', 'Valves, pumps, in-line items', 6], ['INSTRUMENTS', 'Instruments', 3], ['TEXT', 'Tags, line numbers and notes', 7], ['BORDER', 'Sheet border and title block', 8]];
  const lineLayer = ln => (SVC[ln.svc] || {}).pfd ? 'PROCESS' : 'UTILITY';

  /* ---------- state ---------- */
  let doc = blank(), sel = null, selSet = [], tool = 'move', place = null, conn = null, connSide = null, cursor = null, scr = null, drag = null, undo = [], redo = [];
  let cmd = null, lastCmd = '', snapPt = null, clip = null, hist = [];
  const view = { x: 400, y: 300, z: 1 };
  const opts = Object.assign({ grid: true, snap: true, ortho: false, osnap: true, sheet: true, cad: false, palhide: false }, (() => { try { return JSON.parse(localStorage.getItem(OKEY) || '{}'); } catch (e) { return {}; } })());
  function blank() { return { v: 2, name: PFD ? 'Process flow diagram' : 'P&ID', items: [], lines: [], inst: [], notes: [], hide: {}, tb: {}, sheet: { size: 'A3', x: 0, y: 0 } }; }
  const item = id => doc.items.find(i => i.id === id), line = id => doc.lines.find(l => l.id === id), note = id => (doc.notes || []).find(n => n.id === id);
  const shown = ly => !(doc.hide && doc.hide[ly]);
  function snap() { undo.push(JSON.stringify(doc)); if (undo.length > 100) undo.shift(); redo = []; }
  function doUndo() { if (!undo.length) return msg('Nothing to undo.'); redo.push(JSON.stringify(doc)); doc = norm(JSON.parse(undo.pop())); setSel([]); save(); refresh(); }
  function doRedo() { if (!redo.length) return msg('Nothing to redo.'); undo.push(JSON.stringify(doc)); doc = norm(JSON.parse(redo.pop())); setSel([]); save(); refresh(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(doc)); } catch (e) { /* storage blocked: drawing still works */ } }
  function saveOpts() { try { localStorage.setItem(OKEY, JSON.stringify(opts)); } catch (e) { /* ignore */ } }
  function norm(d) { d.notes = d.notes || []; d.hide = d.hide || {}; d.tb = d.tb || {}; d.inst = d.inst || []; return d; }

  /* ---------- layout ---------- */
  root.className = 'sd';
  root.innerHTML = `
<div class="sd-bar">
  <button type="button" id="sd-palbtn" title="Show or hide the symbol list">Symbols</button>
  <input class="sd-name" id="sd-name" aria-label="Drawing title">
  <span class="grp"><button type="button" id="sd-conn" aria-pressed="false" title="Line (L): click one item, then another">Line</button><button type="button" data-cmd="TEXT" title="Text (T)">Text</button></span>
  <span class="grp"><button type="button" data-cmd="MOVE" title="Move (M)">Move</button><button type="button" data-cmd="ROTATE" title="Rotate (RO)">Rotate</button><button type="button" data-cmd="ERASE" title="Delete (Delete key)">Delete</button></span>
  <span class="grp"><button type="button" id="sd-undo" title="Undo (Ctrl+Z)">Undo</button><button type="button" id="sd-redo" title="Redo (Ctrl+Y)">Redo</button></span>
  <button type="button" id="sd-more" aria-haspopup="true" aria-expanded="false">More</button>
  <span class="sp"></span>
  <button type="button" id="sd-dl" aria-haspopup="true" aria-expanded="false">Download</button>
  <button type="button" id="sd-how" title="How to use this tool">Help</button>
  <button type="button" id="sd-full" class="sd-fs" title="Full screen (FULL)" aria-pressed="false">Full screen</button>
</div>
<div class="sd-menu" id="sd-moremenu" hidden>
  <button type="button" data-cmd="COPY">Copy</button><button type="button" data-cmd="MIRROR">Mirror</button>
  <button type="button" data-cmd="LAYER">Layers</button><button type="button" data-cmd="TB">Title block</button>
  <button type="button" id="sd-tpl">Templates</button><button type="button" id="sd-new">New drawing</button>
  <button type="button" id="sd-cad" aria-pressed="false" title="Show the command line, GRID, SNAP, ORTHO and OSNAP">CAD mode (command line)</button>
</div>
<div class="sd-menu" id="sd-dlmenu" hidden>
  <button type="button" data-cmd="PDF">PDF (A3 sheet)</button><button type="button" data-cmd="DXF">DXF for AutoCAD</button><button type="button" id="sd-png">PNG image</button>
</div>
<div class="sd-pal" id="sd-pal"><input type="search" id="sd-q" placeholder="Search symbols" aria-label="Search symbols"><div id="sd-list"></div></div>
<div class="sd-main">
  <div class="sd-wrap" id="sd-wrap"><canvas id="sd-cv" aria-label="${PFD ? 'PFD' : 'P&ID'} drawing"></canvas>
    <div class="sd-msg" id="sd-msg" role="status"></div>
    <div class="sd-card" id="sd-card" hidden></div>
    <div class="sd-pop" id="sd-layers" hidden></div>
    <div class="sd-pop sd-tbp" id="sd-tb" hidden></div>
    <div class="sd-pop sd-help" id="sd-help" hidden></div>
    <div class="sd-pop sd-how" id="sd-howp" hidden></div>
    <div class="sd-start" id="sd-start" hidden></div>
    <div class="sd-zoom"><button type="button" id="sd-zo" aria-label="Zoom out" title="Zoom out">−</button><button type="button" id="sd-fit" title="Fit drawing to screen (Z, E)">Fit</button><button type="button" id="sd-zi" aria-label="Zoom in" title="Zoom in">+</button></div>
  </div>
  <div class="sd-cmd" id="sd-cmdbox">
    <div class="sd-hist" id="sd-hist" aria-live="polite"></div>
    <label class="sd-cl"><span id="sd-plabel">Command:</span><input id="sd-cmd" autocomplete="off" spellcheck="false" aria-label="Command line"></label>
  </div>
  <div class="sd-status" id="sd-status">
    <span class="xy" id="sd-xy">X 0.0  Y 0.0</span>
    <button type="button" data-opt="grid" title="Grid (F7)">GRID</button><button type="button" data-opt="snap" title="Snap to 2.5 mm (F9)">SNAP</button><button type="button" data-opt="ortho" title="Ortho (F8)">ORTHO</button><button type="button" data-opt="osnap" title="Object snap (F3)">OSNAP</button><button type="button" data-opt="sheet" title="Drawing sheet and title block">SHEET</button>
    <span class="sp"></span>
    <button type="button" data-cmd="HELP" title="Command list">Commands</button>
  </div>
</div>`;
  const cv = $('#sd-cv'), wrap = $('#sd-wrap'), ctx = cv.getContext('2d'), cin = $('#sd-cmd'); let W = 0, H = 0, dpr = 1;
  new ResizeObserver(() => { const r = wrap.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); if (!userView && W > 50 && H > 50 && typeof fit === 'function') { try { fit(); } catch (e) { /* not ready */ } } paint(); }).observe(wrap);
  let userView = false;
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
  const noteBox = n => { const h = n.h || 14, w = Math.max(...String(n.t || ' ').split('\n').map(s => s.length)) * h * .56, rows = String(n.t || '').split('\n').length; return { x0: n.x, y0: n.y - h, x1: n.x + w, y1: n.y - h + rows * h * 1.3 }; };

  /* ---------- tags and names ---------- */
  function nextTag(pre) { const used = new Set(), re = new RegExp('^' + pre.replace(/[^\w]/g, '\\$&') + '-(\\d+)'), add = t => { const m = re.exec(t || ''); if (m) used.add(+m[1]); };
    doc.items.forEach(i => add(i.tag)); doc.lines.forEach(l => (l.valves || []).forEach(v => add(v.tag))); doc.inst.forEach(q => add(q.tag));
    for (let i = 101; i < 9999; i++) if (!used.has(i)) return pre + '-' + i; return pre + '-1'; }
  function nextLineNo(svc) { let mx = 0; doc.lines.forEach(l => { const m = new RegExp('^' + svc + '-(\\d+)$').exec(l.no || ''); if (m) mx = Math.max(mx, +m[1]); }); return svc + '-' + String(mx + 1).padStart(3, '0'); }
  function streams() { let mx = Math.max(0, ...doc.lines.map(l => +l.sno || 0)); return doc.lines.filter(l => ENDS[l.id]).map(l => ({ l, no: l.sno ? +l.sno : ++mx })); }
  const label = it => it ? (it.sym === 'junction' ? 'tee' : it.tag || it.name || '') : '';

  /* ---------- selection ---------- */
  const inSel = (k, id) => selSet.some(r => r.k === k && r.id === id);
  function setSel(list) { const seen = new Set(); selSet = list.filter(r => { const key = r.k + ':' + r.id; if (seen.has(key)) return false; seen.add(key); return true; }); sel = selSet.length === 1 ? selSet[0] : null; card(); paint(); }
  function toggleSel(r) { if (inSel(r.k, r.id)) setSel(selSet.filter(x => !(x.k === r.k && x.id === r.id))); else setSel(selSet.concat([r])); }
  const refOf = h => h.k === 'valve' ? { k: 'valve', id: h.o.id, line: h.ln.id } : { k: h.k, id: h.o.id };

  /* ---------- drawing sheet ---------- */
  function ensureSheet() { if (doc.sheet && SHEETS[doc.sheet.size]) return; computeEnds(); const b = bounds(), [sw, sh] = SHEETS.A3;
    doc.sheet = b ? { size: 'A3', x: Math.round(((b.x0 + b.x1) / 2 - sw / 2) / 10) * 10, y: Math.round(((b.y0 + b.y1) / 2 + 70 - sh / 2) / 10) * 10 } : { size: 'A3', x: 0, y: 0 }; }
  const sheetBox = () => { ensureSheet(); const [sw, sh] = SHEETS[doc.sheet.size]; return { x0: doc.sheet.x, y0: doc.sheet.y, x1: doc.sheet.x + sw, y1: doc.sheet.y + sh, w: sw, h: sh }; };
  function drawSheet(c, tx, k, pal) { const sb = sheetBox(), m = 10 * U, ml = 20 * U, I = { x0: sb.x0 + ml, y0: sb.y0 + m, x1: sb.x1 - m, y1: sb.y1 - m }, tb = doc.tb || {};
    c.__ly = 'BORDER'; c.strokeStyle = pal.border; c.fillStyle = pal.border;
    const rectW = (x0, y0, x1, y1, lw) => { const a = tx(x0, y0), b = tx(x1, y1); c.lineWidth = Math.max(.6, lw * k); c.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); };
    const lineW = (x0, y0, x1, y1, lw) => { const a = tx(x0, y0), b = tx(x1, y1); c.lineWidth = Math.max(.6, (lw || 1) * k); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
    const text = (t, x, y, h, wt, al, col) => { if (t == null || t === '') return; const a = tx(x, y); c.font = (wt || 500) + ' ' + Math.max(1, h * k) + 'px IBM Plex Sans, sans-serif'; c.fillStyle = col || pal.border; c.textAlign = al || 'left'; c.textBaseline = 'middle'; c.fillText(String(t), a[0], a[1]); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; };
    rectW(sb.x0, sb.y0, sb.x1, sb.y1, .8); rectW(I.x0, I.y0, I.x1, I.y1, 2.2);
    const cols = Math.max(4, Math.round(sb.w / (50 * U))), rows = Math.max(3, Math.round(sb.h / (50 * U)));
    for (let i = 0; i <= cols; i++) { const x = I.x0 + (I.x1 - I.x0) * i / cols; if (i > 0 && i < cols) { lineW(x, sb.y0 + 2 * U, x, I.y0, .8); lineW(x, I.y1, x, sb.y1 - 2 * U, .8); }
      if (i < cols) { const xm = x + (I.x1 - I.x0) / cols / 2; text(String(i + 1), xm, (sb.y0 + I.y0) / 2 + U, 12, 600, 'center'); text(String(i + 1), xm, (I.y1 + sb.y1) / 2 - U, 12, 600, 'center'); } }
    for (let j = 0; j <= rows; j++) { const y = I.y0 + (I.y1 - I.y0) * j / rows; if (j > 0 && j < rows) { lineW(sb.x0 + 2 * U, y, I.x0, y, .8); lineW(I.x1, y, sb.x1 - 2 * U, y, .8); }
      if (j < rows) { const ym = y + (I.y1 - I.y0) / rows / 2, L1 = String.fromCharCode(65 + j); text(L1, (sb.x0 + I.x0) / 2, ym, 12, 600, 'center'); text(L1, (I.x1 + sb.x1) / 2, ym, 12, 600, 'center'); } }
    /* title block, bottom right */
    const TW = 180 * U, x0 = I.x1 - TW, rH = 6 * U, revs = (tb.revs && tb.revs.length ? tb.revs : [{ rev: tb.rev || '0', date: tb.date || '', desc: 'Issued for review', by: tb.drawn || '', chk: tb.checked || '' }]).slice(0, 4);
    const hT = [16 * U, 18 * U, 10 * U, 10 * U, 8 * U], tbH = hT.reduce((a, b) => a + b, 0), revH = rH * (revs.length + 1), y0 = I.y1 - tbH - revH;
    c.fillStyle = pal.fill; const A0 = tx(x0, y0), B0 = tx(I.x1, I.y1); c.__ly = 'BORDER'; c.fillRect(A0[0], A0[1], B0[0] - A0[0], B0[1] - A0[1]);
    rectW(x0, y0, I.x1, I.y1, 1.6);
    const rc = [[0, 'REV', 15], [15, 'DATE', 30], [45, 'DESCRIPTION', 95], [140, 'BY', 20], [160, 'CHK', 20]];
    let y = y0; rc.forEach(([o, t, w]) => { text(t, x0 + (o + w / 2) * U, y + rH / 2, 9.5, 700, 'center'); if (o) lineW(x0 + o * U, y0, x0 + o * U, y0 + revH, .7); }); lineW(x0, y + rH, I.x1, y + rH, .7);
    revs.slice().reverse().forEach((r, i) => { const yy = y0 + rH * (i + 1); [r.rev, r.date, r.desc, r.by, r.chk].forEach((v, j) => text(v, x0 + (rc[j][0] + (j === 2 ? 2 : rc[j][2] / 2)) * U, yy + rH / 2, 11, 500, j === 2 ? 'left' : 'center')); lineW(x0, yy + rH, I.x1, yy + rH, .7); });
    y = y0 + revH; lineW(x0, y, I.x1, y, 1.6);
    const cellT = (lab, val, cx0, cy0, cw, ch, vh, wt) => { text(lab, cx0 + 1.5 * U, cy0 + 2.4 * U, 8.5, 600); text(val, cx0 + 1.5 * U, cy0 + ch / 2 + 1.8 * U, vh, wt || 600); };
    cellT('COMPANY / PROJECT', '', x0, y, TW, hT[0], 0); text(tb.company || 'Company name', x0 + 1.5 * U, y + hT[0] / 2 + .2 * U, 22, 700); text(tb.project || '', x0 + 1.5 * U, y + hT[0] - 2.6 * U, 11.5, 500); y += hT[0]; lineW(x0, y, I.x1, y, 1);
    cellT('TITLE', '', x0, y, TW, hT[1], 0); text(doc.name || '', x0 + 1.5 * U, y + hT[1] / 2 + 1.6 * U, 24, 700); y += hT[1]; lineW(x0, y, I.x1, y, 1);
    const sc = (vals, h) => { let o = 0; vals.forEach(([lab, val, w], i) => { cellT(lab, val, x0 + o * U, y, w * U, h, 14); o += w; if (i < vals.length - 1) lineW(x0 + o * U, y, x0 + o * U, y + h, 1); }); y += h; lineW(x0, y, I.x1, y, 1); };
    sc([['DRAWING NO.', tb.dwgno || '', 90], ['REV', tb.rev || '0', 30], ['SHEET', tb.sheetno || '1 OF 1', 30], ['SIZE', doc.sheet.size, 30]], hT[2]);
    sc([['DRAWN', tb.drawn || '', 45], ['CHECKED', tb.checked || '', 45], ['APPROVED', tb.approved || '', 45], ['DATE', tb.date || '', 45]], hT[3]);
    text('SCALE: ' + (tb.scale || 'NTS'), x0 + 1.5 * U, y + hT[4] / 2, 11, 600); text(PFD ? 'PROCESS FLOW DIAGRAM' : 'SYMBOLS TO ISA 5.1 / ISO 10628', x0 + 60 * U, y + hT[4] / 2, 10, 600); text('pharmacheme.in', I.x1 - 1.5 * U, y + hT[4] / 2, 10, 500, 'right');
    c.__ly = '0'; }

  /* ---------- painting ---------- */
  function paint() { if (!W) return; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(ctx, W, H, view, DARK, false); overlay(ctx); }
  function draw(c, Wd, Ht, v, pal, exp) {
    const tx = (x, y) => [(x - v.x) * v.z + Wd / 2, (y - v.y) * v.z + Ht / 2], k = v.z, live = !exp, sheetOn = exp === 'sheet' || (live && opts.sheet);
    c.__ly = '0'; c.fillStyle = pal.bg; c.fillRect(0, 0, Wd, Ht);
    if (live && opts.grid && pal.grid && 20 * k > 6) { const x0 = (0 - Wd / 2) / k + v.x, y0 = (0 - Ht / 2) / k + v.y;
      [[20, pal.grid], [100, pal.grid2]].forEach(([g, col]) => { if (g * k < 6) return; c.strokeStyle = col; c.lineWidth = 1; c.beginPath();
        for (let x = Math.floor(x0 / g) * g; ; x += g) { const s = tx(x, 0)[0]; if (s > Wd) break; c.moveTo(Math.round(s) + .5, 0); c.lineTo(Math.round(s) + .5, Ht); }
        for (let y = Math.floor(y0 / g) * g; ; y += g) { const s = tx(0, y)[1]; if (s > Ht) break; c.moveTo(0, Math.round(s) + .5); c.lineTo(Wd, Math.round(s) + .5); } c.stroke(); }); }
    computeEnds(); const sno = {}; if (PFD) streams().forEach(s => sno[s.l.id] = s.no);
    if (sheetOn && shown('BORDER')) drawSheet(c, tx, k, pal);
    const mask = (t, x, y, font, col, left) => { c.font = font; const w = c.measureText(t).width, h = parseFloat(font.split(' ')[1]), x0 = left ? x : x - w / 2; c.fillStyle = pal.mask; c.fillRect(x0 - 3, y - h * .85, w + 6, h * 1.15); c.fillStyle = col; c.fillText(t, x0, y); };
    const under = new Set(); Object.values(ENDS).forEach(e => { if (e.sa === 'b') under.add(e.a.id); if (e.sb === 'b') under.add(e.b.id); });
    doc.lines.forEach(ln => { const e = ENDS[ln.id]; if (!e) return; const pts = e.pts.map(p => tx(p[0], p[1])), isS = live && inSel('line', ln.id), col = pal.line(ln), V = SVC[ln.svc] || {}, LY = lineLayer(ln);
      if (shown(LY)) { c.__ly = LY;
        if (isS) { c.strokeStyle = 'rgba(201,162,39,.45)'; c.lineWidth = Math.max(1.5, 2.2 * k) + 7; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); }
        c.strokeStyle = col; c.lineWidth = Math.max(exp ? .8 : 1.3, (PFD ? 2.4 : 2) * k); if (V.dash) c.setLineDash([8 * k, 5 * k]); c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); c.setLineDash([]);
        const p1 = pts[pts.length - 1], p0 = pts[pts.length - 2], ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), L0 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), back = Math.min(L0 * .5, 14 * k), mx = p1[0] - Math.cos(ang) * back, my = p1[1] - Math.sin(ang) * back, ah = 6 * Math.max(.5, k);
        c.fillStyle = col; c.beginPath(); c.moveTo(mx + ah * Math.cos(ang), my + ah * Math.sin(ang)); c.lineTo(mx + ah * Math.cos(ang + 2.5), my + ah * Math.sin(ang + 2.5)); c.lineTo(mx + ah * Math.cos(ang - 2.5), my + ah * Math.sin(ang - 2.5)); c.closePath(); c.fill(); }
      let bi = 1, bl = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (l > bl) { bl = l; bi = i; } }
      const a = pts[bi - 1], b = pts[bi];
      if (!PFD && shown('TEXT') && shown(LY) && bl > 80 * Math.min(1, k) && (k > .45 || exp)) { c.__ly = 'TEXT'; const t = (ln.size ? ln.size + '-' : '') + (ln.no || ''); c.save(); c.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); let ra = Math.atan2(b[1] - a[1], b[0] - a[0]); if (ra > Math.PI / 2 || ra < -Math.PI / 2) ra += Math.PI; c.rotate(ra);
        c.font = '600 ' + Math.max(exp ? 1 : 9, 10 * k) + 'px IBM Plex Mono, monospace'; c.fillStyle = pal.mute; c.textAlign = 'center'; c.fillText(t, 0, -6 * k - (exp ? 0 : 3)); c.restore(); c.textAlign = 'left'; }
      if (shown('VALVES')) (ln.valves || []).forEach(vl => { if (!valveShown(vl)) return; const p = at(e.pts, vl.t), q = tx(p.x, p.y), s2 = live && inSel('valve', vl.id), pump = (ITEMS[vl.k] || {}).g === 'p';
        c.__ly = 'VALVES'; S.drawItem(c, vl.k, q[0], q[1], p.ang + (vl.rev ? Math.PI : 0), k * (PFD && pump ? 1.2 : 1), s2 ? pal.sel : pal.ink, pal.fill);
        if (vl.tag && (k > .5 || exp) && shown('TEXT')) { c.__ly = 'TEXT'; c.font = '600 ' + Math.max(exp ? 1 : 8, 9 * k) + 'px IBM Plex Sans, sans-serif'; c.fillStyle = s2 ? pal.sel : pal.mute; c.textAlign = 'center'; c.fillText(vl.tag, q[0], q[1] + (pump ? 32 : 22) * k); c.textAlign = 'left'; } });
      if (PFD && sno[ln.id] != null && shown(LY)) { c.__ly = 'TEXT'; const m = at(e.pts, .5), q = tx(m.x, m.y), d = 11 * Math.max(exp ? .3 : .7, k); c.fillStyle = pal.fill; c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.moveTo(q[0], q[1] - d); c.lineTo(q[0] + d, q[1]); c.lineTo(q[0], q[1] + d); c.lineTo(q[0] - d, q[1]); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = pal.ink; c.font = '700 ' + Math.max(exp ? 1 : 8, 10 * Math.max(exp ? .3 : .7, k)) + 'px IBM Plex Sans, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(sno[ln.id]), q[0], q[1] + .5); c.textBaseline = 'alphabetic'; c.textAlign = 'left'; } });
    doc.items.forEach(it => { const q = tx(it.x, it.y), isS = live && inSel('item', it.id), cn = live && conn === it.id, col = isS || cn ? pal.sel : pal.ink, b = boxOf(it);
      if (shown('EQUIPMENT')) { c.__ly = 'EQUIPMENT'; S.drawEq(c, it.sym, q[0], q[1], k, col, pal.fill, it.name); }
      if (cn) { c.strokeStyle = pal.sel; c.setLineDash([4, 3]); c.strokeRect(q[0] - b.w * k / 2 - 6, q[1] - b.h * k / 2 - 6, b.w * k + 12, b.h * k + 12); c.setLineDash([]); }
      if (it.sym === 'opc' || it.sym === 'junction' || !shown('TEXT') || !shown('EQUIPMENT')) return; c.__ly = 'TEXT';
      const side = under.has(it.id), lx = side ? q[0] + b.w * k / 2 + 10 * k : q[0], yb = side ? q[1] + b.h * k / 2 - 26 * k : q[1] + b.h * k / 2 + (it.sym === 'centrifuge' ? 40 : 14) * k + 2, f1 = '700 ' + Math.max(exp ? 1 : 9, 11 * k) + 'px IBM Plex Sans, sans-serif', f2 = '500 ' + Math.max(exp ? 1 : 8, 10 * k) + 'px IBM Plex Sans, sans-serif';
      if (it.tag) mask(it.tag, lx, yb, f1, col, side); if (it.name) mask(it.name, lx, yb + 12 * k + 2, f2, pal.mute, side); if (PFD && it.cap) mask(it.cap, lx, yb + 24 * k + 4, f2, pal.mute, side); });
    if (!PFD && shown('INSTRUMENTS')) doc.inst.forEach(qn => { const ab = instPos(qn); if (!ab) return; const A = tx(ab[0][0], ab[0][1]), B = tx(ab[1][0], ab[1][1]), s2 = live && inSel('inst', qn.id);
      c.__ly = 'INSTRUMENTS'; c.strokeStyle = pal.mute; c.lineWidth = 1; c.setLineDash([3 * Math.max(.5, k), 3 * Math.max(.5, k)]); c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); c.setLineDash([]); S.drawInst(c, qn, B[0], B[1], k, s2 ? pal.sel : pal.ink, pal.fill); });
    if (shown('TEXT')) (doc.notes || []).forEach(n => { const s2 = live && inSel('note', n.id), h = (n.h || 14) * k; c.__ly = 'TEXT'; c.fillStyle = s2 ? pal.sel : pal.ink; c.font = '500 ' + Math.max(exp ? 1 : 6, h) + 'px IBM Plex Sans, sans-serif';
      String(n.t || '').split('\n').forEach((row, i) => { const q = tx(n.x, n.y + i * (n.h || 14) * 1.3); c.fillText(row, q[0], q[1]); }); });
    if (PFD) { c.__ly = 'TEXT'; streamTable(c, tx, k, pal); }
    if (exp === true) { c.__ly = 'TEXT'; c.fillStyle = pal.ink; c.font = '700 16px IBM Plex Sans, sans-serif'; c.fillText(doc.name || '', 16, 26); c.font = '500 11px IBM Plex Sans, sans-serif'; c.fillStyle = pal.mute; c.fillText((PFD ? 'Process flow diagram' : 'P&ID, symbols to ISA 5.1 / ISO 10628') + ' · drawn with pharmacheme.in', 16, 44); }
    c.__ly = '0'; }

  /* live overlays: grips, rubber band, previews, selection window, object snap marker, crosshair */
  function overlay(c) { const tx = w2s;
    selSet.forEach(r => { let p = null; if (r.k === 'item') { const it = item(r.id); if (it) p = [it.x, it.y]; } else if (r.k === 'note') { const n = note(r.id); if (n) p = [n.x, n.y]; } else if (r.k === 'inst') { const q = doc.inst.find(x => x.id === r.id), ab = q && instPos(q); if (ab) p = ab[1]; }
      if (p) { const s = tx(p[0], p[1]); c.fillStyle = '#2F7CF6'; c.strokeStyle = '#DCE8FF'; c.lineWidth = 1; c.fillRect(s[0] - 4, s[1] - 4, 8, 8); c.strokeRect(s[0] - 4.5, s[1] - 4.5, 9, 9); } });
    if (conn && cursor) { const a = item(conn); if (a) { const A = connSide ? portPt(a, connSide, 0) : [a.x, a.y], As = tx(A[0], A[1]), B = tx((snapPt || cursor)[0], (snapPt || cursor)[1]); c.setLineDash([6, 5]); c.strokeStyle = DARK.sel; c.lineWidth = 2; c.beginPath(); c.moveTo(As[0], As[1]); c.lineTo(B[0], B[1]); c.stroke(); c.setLineDash([]); } }
    if (place && cursor) { const w = pickPoint(cursor), q = tx(w[0], w[1]), k = view.z; c.globalAlpha = .55; if (place.kind === 'eq') S.drawEq(c, place.key, q[0], q[1], k, DARK.sel, DARK.fill); else if (place.kind === 'item') S.drawItem(c, place.key, q[0], q[1], 0, k, DARK.sel, DARK.fill); else S.drawInst(c, { k: place.key, tag: place.key + '-' }, q[0], q[1], k, DARK.sel, DARK.fill); c.globalAlpha = 1; }
    if (cmd && cmd.base && cursor && /second|angle|m2/.test(cmd.step)) { const B0 = tx(cmd.base[0], cmd.base[1]), pt = pickPoint(cursor, cmd.base), P = tx(pt[0], pt[1]);
      c.setLineDash([5, 4]); c.strokeStyle = '#DCE8FF'; c.lineWidth = 1; c.beginPath(); c.moveTo(B0[0], B0[1]); c.lineTo(P[0], P[1]); c.stroke(); c.setLineDash([]);
      const f = previewXf(pt); if (f) { c.globalAlpha = .5; selSet.forEach(r => { if (r.k === 'item') { const it = item(r.id); if (!it) return; const p = f([it.x, it.y]), s = tx(p[0], p[1]); S.drawEq(c, it.sym, s[0], s[1], view.z, DARK.sel, DARK.fill); }
        else if (r.k === 'note') { const n = note(r.id); if (!n) return; const p = f([n.x, n.y]), s = tx(p[0], p[1]); c.fillStyle = DARK.sel; c.font = '500 ' + (n.h || 14) * view.z + 'px IBM Plex Sans, sans-serif'; c.fillText(String(n.t || '').split('\n')[0], s[0], s[1]); } }); c.globalAlpha = 1; } }
    if (drag && drag.win && drag.cur) { const a = [Math.min(drag.sx, drag.cur[0]), Math.min(drag.sy, drag.cur[1])], b = [Math.max(drag.sx, drag.cur[0]), Math.max(drag.sy, drag.cur[1])], cross = drag.cur[0] < drag.sx;
      c.fillStyle = cross ? 'rgba(60,200,90,.14)' : 'rgba(47,124,246,.16)'; c.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); c.strokeStyle = cross ? '#5FD07A' : '#5B9BFF'; c.lineWidth = 1; if (cross) c.setLineDash([5, 4]); c.strokeRect(a[0] + .5, a[1] + .5, b[0] - a[0], b[1] - a[1]); c.setLineDash([]); }
    if (snapPt && opts.osnap && cursor) { const s = tx(snapPt[0], snapPt[1]); c.strokeStyle = '#FFD84D'; c.lineWidth = 2; if (snapPt.kind === 'cen') { c.beginPath(); c.arc(s[0], s[1], 7, 0, 7); c.stroke(); } else c.strokeRect(s[0] - 6, s[1] - 6, 12, 12);
      c.font = '600 11px IBM Plex Sans, sans-serif'; c.fillStyle = '#FFD84D'; c.fillText(snapPt.lab || '', s[0] + 10, s[1] + 18); }
    if (scr && !wrap.classList.contains('touch')) { const [x, y] = scr; c.strokeStyle = 'rgba(232,236,240,.62)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, Math.round(y) + .5); c.lineTo(W, Math.round(y) + .5); c.moveTo(Math.round(x) + .5, 0); c.lineTo(Math.round(x) + .5, H); c.stroke();
      if (!cmd || cmd.step === 'select') { if (!place && !conn) { c.strokeStyle = '#E8ECF0'; c.strokeRect(Math.round(x) - 4.5, Math.round(y) - 4.5, 9, 9); } } } }

  const SROWS = [['phase', 'Phase'], ['kgh', 'Mass flow (kg/h)'], ['T', 'Temperature (°C)'], ['P', 'Pressure (barg)'], ['comp', 'Fluid / composition']];
  function bounds() { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; doc.items.forEach(it => { const b = boxOf(it); x0 = Math.min(x0, it.x - b.w / 2 - 20); x1 = Math.max(x1, it.x + b.w / 2 + 20); y0 = Math.min(y0, it.y - b.h / 2 - 40); y1 = Math.max(y1, it.y + b.h / 2 + 50); });
    Object.values(ENDS).forEach(e => (e.pts || []).forEach(p => { x0 = Math.min(x0, p[0] - 20); x1 = Math.max(x1, p[0] + 20); y0 = Math.min(y0, p[1] - 30); y1 = Math.max(y1, p[1] + 30); }));
    doc.inst.forEach(q => { const ab = instPos(q); if (ab) { y0 = Math.min(y0, ab[1][1] - 20); x0 = Math.min(x0, ab[1][0] - 20); x1 = Math.max(x1, ab[1][0] + 20); } });
    (doc.notes || []).forEach(n => { const b = noteBox(n); x0 = Math.min(x0, b.x0 - 10); y0 = Math.min(y0, b.y0 - 10); x1 = Math.max(x1, b.x1 + 10); y1 = Math.max(y1, b.y1 + 10); });
    return x0 > x1 ? null : { x0, y0, x1, y1 }; }
  function tableBox() { const st = PFD ? streams() : [], b = bounds(); if (!st.length || !b) return null; const per = 10, blocks = Math.ceil(st.length / per); return { x0: b.x0, y0: b.y1 + 30, w: 150 + Math.min(per, st.length) * 100, h: blocks * (18 * (SROWS.length + 1) + 18), st, per }; }
  function streamTable(c, tx, k, pal) { const tb = tableBox(); if (!tb) return; const cw = 100, lw = 150, rh = 18;
    for (let bk = 0; bk * tb.per < tb.st.length; bk++) { const part = tb.st.slice(bk * tb.per, bk * tb.per + tb.per), y0 = tb.y0 + bk * (rh * (SROWS.length + 1) + 18), o = tx(tb.x0, y0);
      c.fillStyle = pal.fill; c.fillRect(o[0], o[1], (lw + cw * part.length) * k, rh * (SROWS.length + 1) * k); c.strokeStyle = pal === DARK ? '#3B5875' : '#555'; c.lineWidth = 1;
      const cell = (t, x, y, w, bold) => { const a = tx(x, y); c.strokeRect(a[0], a[1], w * k, rh * k); c.font = (bold ? '700 ' : '500 ') + Math.max(pal === DARK ? 7 : 1, 10.5 * k) + 'px IBM Plex Sans, sans-serif'; c.fillStyle = bold ? pal.ink : pal.mute; c.textBaseline = 'middle'; let s = String(t == null ? '' : t); while (s.length > 2 && c.measureText(s).width > (w - 8) * k) s = s.slice(0, -2) + '…'; c.fillText(s, a[0] + 5 * k, a[1] + rh * k / 2 + 1); c.textBaseline = 'alphabetic'; };
      [['no', 'Stream']].concat(SROWS).forEach((r, i) => { cell(r[1], tb.x0, y0 + i * rh, lw, true); part.forEach((s, j) => cell(i === 0 ? s.no : (s.l.st || {})[r[0]] || (r[0] === 'comp' ? s.l.fluid || (SVC[s.l.svc] || {}).n || '' : ''), tb.x0 + lw + j * cw, y0 + i * rh, cw, i === 0)); }); } }

  /* ---------- picking ---------- */
  function hit(w) { computeEnds(); const tol = 8 / view.z;
    if (shown('TEXT')) for (const n of (doc.notes || [])) { const b = noteBox(n); if (w[0] >= b.x0 - 3 && w[0] <= b.x1 + 3 && w[1] >= b.y0 - 3 && w[1] <= b.y1 + 3) return { k: 'note', o: n }; }
    if (!PFD && shown('INSTRUMENTS')) for (const q of doc.inst) { const ab = instPos(q); if (ab && Math.hypot(ab[1][0] - w[0], ab[1][1] - w[1]) < 15) return { k: 'inst', o: q }; }
    if (shown('VALVES')) for (const ln of doc.lines) { const e = ENDS[ln.id]; if (!e || !shown(lineLayer(ln))) continue; for (const v of (ln.valves || [])) { if (!valveShown(v)) continue; const p = at(e.pts, v.t); if (Math.hypot(p.x - w[0], p.y - w[1]) < 12) return { k: 'valve', o: v, ln }; } }
    let best = null, bd = 1e9; if (shown('EQUIPMENT')) for (const it of doc.items) { const b = boxOf(it), hw = Math.max(9, b.w / 2), hh = Math.max(9, b.h / 2); if (Math.abs(it.x - w[0]) < hw && Math.abs(it.y - w[1]) < hh) { const d = Math.hypot(it.x - w[0], it.y - w[1]) - (it.sym === 'junction' ? 50 : 0); if (d < bd) { bd = d; best = it; } } }
    if (best) return { k: 'item', o: best };
    let bl = null; for (const ln of doc.lines) { const e = ENDS[ln.id]; if (!e || !shown(lineLayer(ln))) continue; const p = project(e.pts, w); if (p.d < tol && (!bl || p.d < bl.d)) bl = { k: 'line', o: ln, t: p.t, d: p.d, leg: p.leg }; } return bl; }
  /* window (all inside) and crossing (touching) selection */
  function segHitsRect(a, b, r) { const inside = p => p[0] >= r.x0 && p[0] <= r.x1 && p[1] >= r.y0 && p[1] <= r.y1; if (inside(a) || inside(b)) return true;
    const sx = (p, q, x) => (x - p[0]) / ((q[0] - p[0]) || 1e-9), sy = (p, q, y) => (y - p[1]) / ((q[1] - p[1]) || 1e-9);
    for (const x of [r.x0, r.x1]) { const t = sx(a, b, x); if (t >= 0 && t <= 1) { const y = a[1] + (b[1] - a[1]) * t; if (y >= r.y0 && y <= r.y1) return true; } }
    for (const y of [r.y0, r.y1]) { const t = sy(a, b, y); if (t >= 0 && t <= 1) { const x = a[0] + (b[0] - a[0]) * t; if (x >= r.x0 && x <= r.x1) return true; } } return false; }
  function pickWindow(r, cross) { computeEnds(); const out = [], inR = (x0, y0, x1, y1) => x0 >= r.x0 && x1 <= r.x1 && y0 >= r.y0 && y1 <= r.y1, ov = (x0, y0, x1, y1) => !(x1 < r.x0 || x0 > r.x1 || y1 < r.y0 || y0 > r.y1);
    if (shown('EQUIPMENT')) doc.items.forEach(it => { const b = boxOf(it), x0 = it.x - b.w / 2, x1 = it.x + b.w / 2, y0 = it.y - b.h / 2, y1 = it.y + b.h / 2; if (cross ? ov(x0, y0, x1, y1) : inR(x0, y0, x1, y1)) out.push({ k: 'item', id: it.id }); });
    doc.lines.forEach(ln => { const e = ENDS[ln.id]; if (!e || !shown(lineLayer(ln))) return; const P = e.pts; let hitL = false;
      if (cross) { for (let i = 1; i < P.length && !hitL; i++) hitL = segHitsRect(P[i - 1], P[i], r); } else hitL = P.every(p => inR(p[0], p[1], p[0], p[1]));
      if (hitL) out.push({ k: 'line', id: ln.id });
      if (shown('VALVES')) (ln.valves || []).forEach(v => { if (!valveShown(v)) return; const p = at(P, v.t); if (inR(p.x - 6, p.y - 6, p.x + 6, p.y + 6) || (cross && ov(p.x - 6, p.y - 6, p.x + 6, p.y + 6))) out.push({ k: 'valve', id: v.id, line: ln.id }); }); });
    if (!PFD && shown('INSTRUMENTS')) doc.inst.forEach(q => { const ab = instPos(q); if (!ab) return; const p = ab[1]; if (cross ? ov(p[0] - 13, p[1] - 13, p[0] + 13, p[1] + 13) : inR(p[0] - 13, p[1] - 13, p[0] + 13, p[1] + 13)) out.push({ k: 'inst', id: q.id }); });
    if (shown('TEXT')) (doc.notes || []).forEach(n => { const b = noteBox(n); if (cross ? ov(b.x0, b.y0, b.x1, b.y1) : inR(b.x0, b.y0, b.x1, b.y1)) out.push({ k: 'note', id: n.id }); });
    return out; }

  /* ---------- points: snap, ortho, object snap ---------- */
  function osnapAt(w) { if (!opts.osnap) return null; computeEnds(); const tol = 12 / view.z; let best = null, bd = tol;
    const cand = (x, y, kind, lab, extra) => { const d = Math.hypot(x - w[0], y - w[1]); if (d < bd) { bd = d; best = Object.assign([x, y], { kind, lab }, extra || {}); } };
    if (shown('EQUIPMENT')) doc.items.forEach(it => { if (it.sym === 'junction') return cand(it.x, it.y, 'end', 'Tee'); cand(it.x, it.y, 'cen', 'Center', { it });
      if (it.sym === 'opc') { ['l', 'r'].forEach(s => { const p = portPt(it, s, 0); cand(p[0], p[1], 'end', 'Nozzle', { it, side: s }); }); return; }
      ['t', 'b', 'l', 'r'].forEach(s => { const p = portPt(it, s, 0); cand(p[0], p[1], 'end', 'Nozzle', { it, side: s }); }); });
    doc.lines.forEach(ln => { const e = ENDS[ln.id]; if (!e || !shown(lineLayer(ln))) return; e.pts.forEach((p, i) => { if (i && i < e.pts.length - 1) cand(p[0], p[1], 'end', 'Bend'); }); });
    (doc.notes || []).forEach(n => cand(n.x, n.y, 'end', 'Insertion'));
    return best; }
  function pickPoint(w, base) { let p = snapPt && opts.osnap ? [snapPt[0], snapPt[1]] : (opts.snap ? [Math.round(w[0] / 10) * 10, Math.round(w[1] / 10) * 10] : [Math.round(w[0]), Math.round(w[1])]);
    if (base && opts.ortho && !(snapPt && opts.osnap)) { if (Math.abs(p[0] - base[0]) > Math.abs(p[1] - base[1])) p[1] = base[1]; else p[0] = base[0]; } return p; }
  /* typed points: x,y (absolute, mm, Y up) · @dx,dy · @dist<angle · plain distance along the cursor direction */
  function parsePoint(s, base) { s = s.trim().replace(/\s+/g, ''); let m;
    if ((m = /^@(-?[\d.]+)<(-?[\d.]+)$/.exec(s)) && base) { const d = +m[1] * U, a = +m[2] * Math.PI / 180; return [base[0] + d * Math.cos(a), base[1] - d * Math.sin(a)]; }
    if ((m = /^@(-?[\d.]+),(-?[\d.]+)$/.exec(s)) && base) return [base[0] + +m[1] * U, base[1] - +m[2] * U];
    if ((m = /^(-?[\d.]+),(-?[\d.]+)$/.exec(s))) return [+m[1] * U, -+m[2] * U];
    if ((m = /^(-?[\d.]+)$/.exec(s)) && base && cursor) { const c2 = pickPoint(cursor, base), dx = c2[0] - base[0], dy = c2[1] - base[1], L0 = Math.hypot(dx, dy) || 1; return [base[0] + dx / L0 * +m[1] * U, base[1] + dy / L0 * +m[1] * U]; }
    return null; }

  /* ---------- editing operations ---------- */
  function addItem(sym, w) { const E = EQ[sym], it = { id: nid('i'), sym, x: Math.round(w[0]), y: Math.round(w[1]) };
    if (sym === 'opc') it.name = 'From / to'; else if (sym !== 'junction') { it.tag = nextTag(E.pre); it.name = E.n.replace(/ \(.*\)|\s\/.*/g, ''); } doc.items.push(it); return it; }
  function addLine(a, b, sa, sb) { const svc = 'PRC', ln = { id: nid('l'), a: a.id, b: b.id, svc, no: nextLineNo(svc), autoNo: true, valves: [] }; if (sa) ln.pa = { side: sa, f: 0 }; if (sb) ln.pb = { side: sb, f: 0 }; doc.lines.push(ln); return ln; }
  function splitLine(ln, t) { computeEnds(); const e = ENDS[ln.id], p = at(e.pts, t), j = addItem('junction', [p.x, p.y]); j.x = Math.round(p.x); j.y = Math.round(p.y);
    const ln2 = Object.assign(JSON.parse(JSON.stringify(ln)), { id: nid('l'), a: j.id, pa: null, no: nextLineNo(ln.svc), autoNo: true }); delete ln2.r; delete ln2.mid; delete ln2.sno;
    ln2.valves = (ln.valves || []).filter(v => v.t > t).map(v => Object.assign(v, { t: (v.t - t) / (1 - t) })); ln.valves = (ln.valves || []).filter(v => v.t <= t).map(v => Object.assign(v, { t: v.t / t }));
    ln.b = j.id; ln.pb = null; delete ln.r; delete ln.mid; doc.lines.splice(doc.lines.indexOf(ln) + 1, 0, ln2);
    doc.inst.forEach(q => { if (q.on === ln.id) { if ((q.t || .5) > t) { q.on = ln2.id; q.t = ((q.t || .5) - t) / (1 - t); } else q.t = (q.t || .5) / t; } }); return j; }
  function eraseRefs(refs) { if (!refs.length) return; snap(); const ids = k => new Set(refs.filter(r => r.k === k).map(r => r.id)), I = ids('item'), Ln = ids('line'), V = ids('valve'), Q = ids('inst'), N = ids('note');
    doc.lines.forEach(l => { if (I.has(l.a) || I.has(l.b)) Ln.add(l.id); });
    doc.items = doc.items.filter(i => !I.has(i.id)); doc.lines = doc.lines.filter(l => !Ln.has(l.id)); doc.lines.forEach(l => { l.valves = (l.valves || []).filter(v => !V.has(v.id)); });
    doc.inst = doc.inst.filter(q => !Q.has(q.id) && !I.has(q.on) && !Ln.has(q.on)); doc.notes = (doc.notes || []).filter(n => !N.has(n.id));
    setSel([]); changed(); }
  function removeSel() { eraseRefs(selSet); }
  function moveRefs(refs, dx, dy) { const I = new Set(refs.filter(r => r.k === 'item').map(r => r.id));
    doc.items.forEach(it => { if (I.has(it.id)) { it.x = Math.round(it.x + dx); it.y = Math.round(it.y + dy); } });
    (doc.notes || []).forEach(n => { if (refs.some(r => r.k === 'note' && r.id === n.id)) { n.x = Math.round(n.x + dx); n.y = Math.round(n.y + dy); } });
    doc.inst.forEach(q => { if (refs.some(r => r.k === 'inst' && r.id === q.id) && !I.has(q.on)) { q.dx = Math.round((q.dx || 0) + dx); q.dy = Math.round((q.dy != null ? q.dy : -46) + dy); } });
    doc.lines.forEach(l => { if (I.has(l.a) && I.has(l.b) && l.mid != null && l.r !== 'ud') { const e = ENDS[l.id], vert = e && e.pts.length === 4 && Math.abs(e.pts[1][0] - e.pts[2][0]) < 1; l.mid = Math.round(l.mid + (vert ? dx : dy)); } }); }
  function duplicate(refs, dx, dy) { const map = {}, out = [], I = new Set(refs.filter(r => r.k === 'item').map(r => r.id)), Lsel = new Set(refs.filter(r => r.k === 'line').map(r => r.id));
    doc.items.filter(it => I.has(it.id)).forEach(it => { const n = JSON.parse(JSON.stringify(it)); n.id = nid('i'); n.x = Math.round(it.x + dx); n.y = Math.round(it.y + dy); if (it.tag && it.sym !== 'opc' && it.sym !== 'junction') n.tag = nextTag((EQ[it.sym] || EQ.user).pre); doc.items.push(n); map[it.id] = n.id; out.push({ k: 'item', id: n.id }); });
    const lmap = {}; doc.lines.slice().forEach(l => { if (!(map[l.a] && map[l.b])) return; const n = JSON.parse(JSON.stringify(l)); n.id = nid('l'); n.a = map[l.a]; n.b = map[l.b]; n.no = nextLineNo(l.svc); n.autoNo = true; delete n.sno;
      if (n.mid != null && n.r !== 'ud') { const e = ENDS[l.id], vert = e && e.pts.length === 4 && Math.abs(e.pts[1][0] - e.pts[2][0]) < 1; n.mid = Math.round(n.mid + (vert ? dx : dy)); }
      n.valves = (l.valves || []).map(v => Object.assign({}, v, { id: nid('v'), tag: v.tag && ITAG[v.k] ? nextTag(ITAG[v.k]) : v.tag })); doc.lines.push(n); lmap[l.id] = n.id; if (Lsel.has(l.id)) out.push({ k: 'line', id: n.id }); });
    doc.inst.slice().forEach(q => { const on = map[q.on] || lmap[q.on]; if (!on) return; const n = Object.assign({}, q, { id: nid('q'), on, tag: nextTag(q.k) }); doc.inst.push(n); });
    (doc.notes || []).filter(n => refs.some(r => r.k === 'note' && r.id === n.id)).forEach(n => { const c = Object.assign({}, n, { id: nid('n'), x: Math.round(n.x + dx), y: Math.round(n.y + dy) }); doc.notes.push(c); out.push({ k: 'note', id: c.id }); });
    return out; }
  /* rotate or mirror item positions; equipment symbols stay upright and the lines re-route. Nozzle sides turn with the layout. */
  function sideXf(side, f, vf) { if (!side || side === 'c') return { side, f }; const v = { r: [1, f || 0], l: [-1, f || 0], t: [f || 0, -1], b: [f || 0, 1] }[side], o = vf(v);
    return Math.abs(o[0]) >= Math.abs(o[1]) ? { side: o[0] > 0 ? 'r' : 'l', f: +o[1].toFixed(3) } : { side: o[1] > 0 ? 'b' : 't', f: +o[0].toFixed(3) }; }
  function transformRefs(refs, pf, vf) { const I = new Set(refs.filter(r => r.k === 'item').map(r => r.id));
    doc.items.forEach(it => { if (I.has(it.id)) { const p = pf([it.x, it.y]); it.x = Math.round(p[0]); it.y = Math.round(p[1]); } });
    (doc.notes || []).forEach(n => { if (refs.some(r => r.k === 'note' && r.id === n.id)) { const p = pf([n.x, n.y]); n.x = Math.round(p[0]); n.y = Math.round(p[1]); } });
    doc.lines.forEach(l => { const ia = I.has(l.a), ib = I.has(l.b); if (!ia && !ib) return; delete l.mid; if (l.r === 'h' || l.r === 'v') delete l.r;
      if (ia && l.pa) l.pa = sideXf(l.pa.side, l.pa.f, vf); if (ib && l.pb) l.pb = sideXf(l.pb.side, l.pb.f, vf); }); }
  function rotateRefs(refs, base, deg) { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    transformRefs(refs, p => { const dx = p[0] - base[0], dy = p[1] - base[1]; return [base[0] + dx * c + dy * s, base[1] - dx * s + dy * c]; }, v => [v[0] * c + v[1] * s, -v[0] * s + v[1] * c]); }
  function mirrorRefs(refs, p1, p2) { const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L2 = dx * dx + dy * dy || 1;
    const refl = (x, y) => { const t = (x * dx + y * dy) / L2; return [2 * t * dx - x, 2 * t * dy - y]; };
    transformRefs(refs, p => { const r = refl(p[0] - p1[0], p[1] - p1[1]); return [p1[0] + r[0], p1[1] + r[1]]; }, v => refl(v[0], v[1])); }

  /* ---------- command line ---------- */
  const ALIAS = { L: 'LINE', LINE: 'LINE', PL: 'LINE', C: 'LINE', CONNECT: 'LINE', I: 'INSERT', INSERT: 'INSERT', M: 'MOVE', MOVE: 'MOVE', CO: 'COPY', CP: 'COPY', COPY: 'COPY', RO: 'ROTATE', ROTATE: 'ROTATE', MI: 'MIRROR', MIRROR: 'MIRROR',
    E: 'ERASE', ERASE: 'ERASE', DEL: 'ERASE', U: 'UNDO', UNDO: 'UNDO', REDO: 'REDO', Z: 'ZOOM', ZOOM: 'ZOOM', P: 'PAN', PAN: 'PAN', T: 'TEXT', DT: 'TEXT', TEXT: 'TEXT', MT: 'TEXT', MTEXT: 'TEXT',
    LA: 'LAYER', LAYER: 'LAYER', TB: 'TB', TITLE: 'TB', TITLEBLOCK: 'TB', GRID: 'GRID', SNAP: 'SNAP', SN: 'SNAP', ORTHO: 'ORTHO', OSNAP: 'OSNAP', OS: 'OSNAP', SHEET: 'SHEET', LIMITS: 'SHEET',
    PDF: 'PDF', PLOT: 'PDF', PRINT: 'PDF', DXF: 'DXF', DXFOUT: 'DXF', SAVEAS: 'DXF', PNG: 'PNG', EXPORT: 'PNG', JPGOUT: 'PNG', PNGOUT: 'PNG', ALL: 'ALL', SELECTALL: 'ALL', HELP: 'HELP', '?': 'HELP', HOW: 'HOW', GUIDE: 'HOW', TUTORIAL: 'HOW', NEW: 'NEW', QNEW: 'NEW', REGEN: 'REGEN', RE: 'REGEN', FULL: 'FULL', CLEANSCREENON: 'FULL', FS: 'FULL' };
  const HELP = [['L', 'Line between two items (click nozzles with OSNAP on to fix the side)'], ['I name', 'Insert a symbol, e.g. I reactor, I ball, I PT'], ['T', 'Text note'], ['M', 'Move'], ['CO', 'Copy (repeat clicks for several copies, Enter to end)'], ['RO', 'Rotate the layout (equipment stays upright, lines re-route)'], ['MI', 'Mirror'], ['E', 'Erase (or press Delete)'],
    ['U / REDO', 'Undo / redo (Ctrl+Z, Ctrl+Y)'], ['Z', 'Zoom: E extents, W window, I in, O out'], ['P', 'Pan (or drag with the middle or right mouse button)'], ['LA', 'Layers on and off'], ['TB', 'Title block and sheet size'], ['ALL', 'Select everything (Ctrl+A)'],
    ['PDF', 'Plot the sheet to PDF'], ['DXF', 'Export a DXF that opens in AutoCAD'], ['PNG', 'Export an image'], ['FULL', 'Full screen on and off'], ['HOW', 'Open the how-to-use guide'], ['F3 F7 F8 F9', 'OSNAP, GRID, ORTHO, SNAP on and off'], ['Points', 'Click, or type x,y · @dx,dy · @dist<angle · a distance along the cursor (mm, Y up)'], ['Enter / Space', 'Repeat the last command, or finish selecting']];
  function say(t, cls) { hist.push([t, cls || '']); if (hist.length > 40) hist.shift(); const h = $('#sd-hist'); h.innerHTML = hist.slice(-3).map(([t2, c2]) => '<div class="' + c2 + '">' + esc(t2) + '</div>').join(''); }
  function promptT(t) { $('#sd-plabel').textContent = t; }
  function idlePrompt() { promptT(opts.cad ? 'Command:' : 'Next:'); cin.placeholder = tool === 'connect' ? (conn ? 'Click the next item, a line (tee) or empty space (bend). Esc to stop.' : 'Click the item the line starts from') : tool === 'place' ? (place.kind === 'eq' ? 'Click to place. Esc to cancel.' : place.kind === 'item' ? 'Click a line to put it there. Esc to cancel.' : 'Click equipment or a line. Esc to cancel.') : (doc.items.length ? 'Type a command (L, M, CO, RO, MI, E, Z, ?) or pick objects' : 'Pick a symbol on the left, or type I and a name'); }
  function endCmd(t) { cmd = null; if (t) say(t, 'mute'); idlePrompt(); paint(); }
  function needSel(name, next) { if (selSet.length) { say('Command: ' + name + '  (' + selSet.length + ' selected)'); next(); } else { cmd = { name, step: 'select', after: next }; say('Command: ' + name); promptT('Select objects:'); cin.placeholder = 'Click or drag a window, then press Enter'; } }
  function run(raw) { const s = String(raw || '').trim(); if (cmd) return feed(s); if (!s) { if (lastCmd) return run(lastCmd); return; }
    const parts = s.split(/\s+/), name = ALIAS[parts[0].toUpperCase()], arg = parts.slice(1).join(' ');
    if (!name) { say('Unknown command "' + parts[0] + '". Type ? for the list.', 'err'); return; }
    if (!['UNDO', 'REDO', 'GRID', 'SNAP', 'ORTHO', 'OSNAP', 'HELP'].includes(name)) lastCmd = name;
    hidePops(); if (tool !== 'move') setTool('move');
    switch (name) {
      case 'LINE': say('Command: LINE'); setTool('connect'); break;
      case 'INSERT': { say('Command: INSERT ' + arg); if (!arg) { cmd = { name, step: 'name' }; promptT('Enter symbol name (e.g. reactor, pump, ball, PT):'); cin.placeholder = ''; break; } insertByName(arg); break; }
      case 'MOVE': case 'COPY': needSel(name, () => { cmd = { name, step: 'base' }; promptT('Specify base point:'); cin.placeholder = 'Click, or type x,y'; paint(); }); break;
      case 'ROTATE': needSel(name, () => { cmd = { name, step: 'base' }; promptT('Specify base point:'); cin.placeholder = ''; paint(); }); break;
      case 'MIRROR': needSel(name, () => { cmd = { name, step: 'm1' }; promptT('Specify first point of mirror line:'); cin.placeholder = ''; paint(); }); break;
      case 'ERASE': needSel(name, () => { const n = selSet.length; eraseRefs(selSet); endCmd(n + ' object' + (n === 1 ? '' : 's') + ' erased.'); }); break;
      case 'UNDO': say('Command: UNDO'); doUndo(); break;
      case 'REDO': say('Command: REDO'); doRedo(); break;
      case 'ZOOM': { say('Command: ZOOM'); const o = arg.toUpperCase(); if (o) zoomOpt(o); else { cmd = { name, step: 'zopt' }; promptT('[Extents/Window/In/Out] <Extents>:'); cin.placeholder = ''; } break; }
      case 'PAN': say('Command: PAN  (drag, Esc to end)'); cmd = { name, step: 'pan' }; promptT('Press Esc or Enter to exit, or drag to pan.'); wrap.classList.add('panmode'); break;
      case 'TEXT': say('Command: TEXT'); cmd = { name, step: 'tpt' }; promptT('Specify start point of text:'); cin.placeholder = 'Click, or type x,y'; break;
      case 'LAYER': say('Command: LAYER'); layers(); break;
      case 'TB': say('Command: TITLE BLOCK'); titleBlock(); break;
      case 'GRID': case 'SNAP': case 'ORTHO': case 'OSNAP': case 'SHEET': toggle(name.toLowerCase()); break;
      case 'PDF': say('Command: PLOT to PDF'); plotPDF(); break;
      case 'DXF': say('Command: DXFOUT'); exportDXF(); break;
      case 'PNG': say('Command: EXPORT image'); exportPNG(); break;
      case 'ALL': selectAll(); break;
      case 'HELP': help(); break;
      case 'HOW': howTo(); break;
      case 'NEW': $('#sd-new').click(); break;
      case 'REGEN': paint(); say('Regenerating model.', 'mute'); break;
      case 'FULL': fullScreen(); break; } }
  function feed(s) { const c = cmd, up = s.toUpperCase();
    if (c.step === 'select') { if (!s) { if (!selSet.length) return endCmd('Nothing selected.'); cmd = null; return c.after(); } if (up === 'ALL') { selectAll(true); return; } say('Select objects, then press Enter.', 'mute'); return; }
    if (c.step === 'name') { endCmd(); return s ? insertByName(s) : null; }
    if (c.step === 'zopt') { endCmd(); return zoomOpt(up || 'E'); }
    if (c.step === 'pan') { wrap.classList.remove('panmode'); return endCmd(); }
    if (c.step === 'erase') { finishMirror(/^Y/.test(up)); return; }
    if (c.step === 'ttext') { if (!s) return endCmd('No text.'); snap(); const n = { id: nid('n'), x: c.base[0], y: c.base[1], t: s, h: 14 }; doc.notes.push(n); setSel([{ k: 'note', id: n.id }]); changed(); return endCmd(); }
    if (c.step === 'angle') { if (!s) return applyRotate(90); const a = parseFloat(s); if (isFinite(a)) return applyRotate(a); say('Type an angle in degrees, or click.', 'err'); return; }
    if (!s) { if (c.step === 'second' && c.name === 'COPY' && c.copied) return endCmd(); if (c.step === 'second') { return applyPoint([c.base[0] + c.base[0] * 0, c.base[1]], true); } return endCmd('*Cancel*'); }
    const p = parsePoint(s, c.base || null); if (!p) { say('Point or option keyword required.', 'err'); return; } applyPoint(p); }
  function applyPoint(p, displacement) { const c = cmd; if (!c) return;
    if (c.step === 'tpt') { c.base = p; c.step = 'ttext'; promptT('Enter text:'); cin.placeholder = 'Type the note, then Enter'; cin.focus({ preventScroll: true }); paint(); return; }
    if (c.step === 'base') { c.base = p; if (c.name === 'ROTATE') { c.step = 'angle'; promptT('Specify rotation angle <90>:'); cin.placeholder = 'Degrees, counter-clockwise, or click'; } else { c.step = 'second'; promptT('Specify second point or <use first point as displacement>:'); cin.placeholder = 'Click, or type @dx,dy or a distance'; } paint(); return; }
    if (c.step === 'second') { let dx = p[0] - c.base[0], dy = p[1] - c.base[1]; if (displacement) { dx = c.base[0]; dy = c.base[1]; }
      snap(); if (c.name === 'MOVE') { moveRefs(selSet, dx, dy); changed(); return endCmd(); }
      const out = duplicate(selSet, dx, dy); c.copied = (c.copied || 0) + 1; changed(); say(out.length + ' object' + (out.length === 1 ? '' : 's') + ' copied.', 'mute'); promptT('Specify second point or [Exit] <Exit>:'); return; }
    if (c.step === 'angle') { const a = Math.atan2(-(p[1] - c.base[1]), p[0] - c.base[0]) * 180 / Math.PI; return applyRotate(Math.round(a)); }
    if (c.step === 'm1') { c.base = p; c.step = 'm2'; promptT('Specify second point of mirror line:'); paint(); return; }
    if (c.step === 'm2') { if (Math.hypot(p[0] - c.base[0], p[1] - c.base[1]) < 1) { say('Pick a different second point.', 'err'); return; } c.p2 = p; c.step = 'erase'; promptT('Erase source objects? [Yes/No] <No>:'); cin.placeholder = 'Y or N'; cin.focus({ preventScroll: true }); paint(); return; } }
  function applyRotate(deg) { const c = cmd; snap(); rotateRefs(selSet, c.base, deg); changed(); endCmd('Rotated ' + deg + '°.'); }
  function finishMirror(eraseSrc) { const c = cmd; snap(); let refs = selSet; if (!eraseSrc) { refs = duplicate(selSet, 0, 0); } mirrorRefs(refs, c.base, c.p2); setSel(refs); changed(); endCmd(eraseSrc ? 'Mirrored.' : 'Mirrored copy made.'); }
  function previewXf(pt) { const c = cmd; if (!c || !c.base) return null;
    if (c.step === 'second') { const dx = pt[0] - c.base[0], dy = pt[1] - c.base[1]; return p => [p[0] + dx, p[1] + dy]; }
    if (c.step === 'angle') { const a = Math.atan2(-(pt[1] - c.base[1]), pt[0] - c.base[0]), co = Math.cos(a), si = Math.sin(a); return p => { const dx = p[0] - c.base[0], dy = p[1] - c.base[1]; return [c.base[0] + dx * co + dy * si, c.base[1] - dx * si + dy * co]; }; }
    if (c.step === 'm2') { const dx = pt[0] - c.base[0], dy = pt[1] - c.base[1], L2 = dx * dx + dy * dy || 1; return p => { const x = p[0] - c.base[0], y = p[1] - c.base[1], t = (x * dx + y * dy) / L2; return [c.base[0] + 2 * t * dx - x, c.base[1] + 2 * t * dy - y]; }; }
    return null; }
  function insertByName(q) { q = q.toLowerCase().trim(); const all = []; const eqName = k => k === 'opc' ? 'Connector (to / from)' : k === 'junction' ? 'Tee / junction' : EQ[k].n;
    Object.keys(EQ).forEach(k => { if (!EQ[k].hide || k === 'opc' || k === 'junction') all.push(['eq', k, eqName(k)]); }); PUMPS.concat(PFD ? [] : VALVES.concat(INLINE)).forEach(k => all.push(['item', k, ITEMS[k].n])); if (!PFD) INSTS.forEach(k => all.push(['inst', k, k + ', ' + S.INST[k]]));
    const m = all.find(a => a[1].toLowerCase() === q) || all.find(a => a[0] === 'inst' && a[1].toLowerCase() === q) || all.find(a => a[2].toLowerCase().startsWith(q)) || all.find(a => a[2].toLowerCase().includes(q));
    if (!m) { say('No symbol matches "' + q + '". Search the panel on the left.', 'err'); return; } say('Insert: ' + m[2], 'mute'); setTool('place', { kind: m[0], key: m[1] }); }
  function zoomOpt(o) { if (/^E/.test(o) || /^A/.test(o)) { fit(); paint(); } else if (/^I/.test(o)) zoomAt(1.5, [view.x, view.y], W / 2, H / 2); else if (/^O/.test(o)) zoomAt(1 / 1.5, [view.x, view.y], W / 2, H / 2); else if (/^W/.test(o)) { cmd = { name: 'ZOOM', step: 'zwin' }; promptT('Specify window corners (drag):'); } else say('Option not recognised.', 'err'); }
  function selectAll(keep) { const all = []; if (shown('EQUIPMENT')) doc.items.forEach(i => all.push({ k: 'item', id: i.id })); doc.lines.forEach(l => { if (shown(lineLayer(l))) all.push({ k: 'line', id: l.id }); }); if (!PFD && shown('INSTRUMENTS')) doc.inst.forEach(q => all.push({ k: 'inst', id: q.id })); if (shown('TEXT')) doc.notes.forEach(n => all.push({ k: 'note', id: n.id }));
    setSel(all); say(all.length + ' found', 'mute'); if (!keep) idlePrompt(); }
  function toggle(o) { opts[o] = !opts[o]; saveOpts(); statusUI(); say(o.toUpperCase() + ' ' + (opts[o] ? 'on' : 'off'), 'mute'); if (o === 'sheet' && opts.sheet) ensureSheet(); paint(); }
  function statusUI() { $$('#sd-status [data-opt]').forEach(b => b.setAttribute('aria-pressed', String(!!opts[b.dataset.opt]))); }
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  function fullScreen(want) {
    if (typeof want !== 'boolean') want = !root.classList.contains('full');
    root.classList.toggle('full', want); document.documentElement.classList.toggle('sd-noscroll', want);
    if (want && !fsEl()) { const rq = root.requestFullscreen || root.webkitRequestFullscreen; if (rq) { try { const pr = rq.call(root); if (pr && pr.catch) pr.catch(() => {}); } catch (e) { /* CSS full window still works */ } } }
    if (!want && fsEl()) { const ex = document.exitFullscreen || document.webkitExitFullscreen; try { const pr = ex.call(document); if (pr && pr.catch) pr.catch(() => {}); } catch (e) { /* ignore */ } }
    const fb = $('#sd-full'); fb.setAttribute('aria-pressed', String(want)); fb.textContent = want ? 'Exit full screen' : 'Full screen';
    closeMenus(); requestAnimationFrame(() => requestAnimationFrame(() => { fit(); paint(); }));
  }
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => { if (!fsEl() && root.classList.contains('full')) fullScreen(false); }));
  function closeMenus() { ['#sd-moremenu', '#sd-dlmenu'].forEach(s2 => { $(s2).hidden = true; }); ['#sd-more', '#sd-dl'].forEach(s2 => $(s2).setAttribute('aria-expanded', 'false')); }
  function openMenu(btn, menu) { const was = !$(menu).hidden; closeMenus(); if (was) return; hidePops(); const m = $(menu), r = $(btn).getBoundingClientRect(), rr = root.getBoundingClientRect(); m.hidden = false; m.style.top = (r.bottom - rr.top + 4) + 'px'; m.style.left = Math.max(6, Math.min(r.left - rr.left, rr.width - m.offsetWidth - 6)) + 'px'; $(btn).setAttribute('aria-expanded', 'true'); }
  function modeUI() { root.classList.toggle('simple', !opts.cad); root.classList.toggle('pal-hide', !!opts.palhide); $('#sd-cad').setAttribute('aria-pressed', String(!!opts.cad)); $('#sd-palbtn').setAttribute('aria-pressed', String(!opts.palhide)); }
  function hidePops() { ['#sd-layers', '#sd-tb', '#sd-help', '#sd-howp'].forEach(s => { $(s).hidden = true; }); }
  const HOW = [
    ['Get room', 'Press <b>Full screen</b> (top right) to use the whole screen; Esc leaves it. Press <b>Symbols</b> to hide or show the symbol list.'],
    ['Start', 'Pick a blank sheet or a ready setup. <b>More → Templates</b> or <b>More → New drawing</b> starts again. Your drawing is saved in this browser.'],
    ['Place equipment', 'Click a symbol on the left, then click the sheet. Hold Shift while clicking to place several.'],
    ['Join with lines', 'Press <b>Line</b>, click the first item, then the next. Click a line to branch with a tee, or empty space for a bend. Esc stops.'],
    ['Add valves and instruments' + (PFD ? ' (pumps on a PFD)' : ''), 'Pick the valve, pump or instrument on the left, then click the line (or the vessel, for an instrument). Drag a valve along its line to move it.'],
    ['Edit', 'Click anything to change its tag, name or size in the card on the right. Drag to move it. <b>Move</b>, <b>Rotate</b> and <b>Delete</b> are on the toolbar; Copy and Mirror are under <b>More</b>.'],
    ['Zoom', 'Scroll or use <b>− Fit +</b> at the bottom right. Drag with the right or middle mouse button (one finger on a phone) to pan.'],
    ['Download', 'Fill in <b>More → Title block</b>, then <b>Download</b> a PDF, a DXF for AutoCAD, or an image.'],
    ['For CAD users (optional)', 'Turn on <b>More → CAD mode</b> for GRID, SNAP, ORTHO and OSNAP buttons and the command history. Typing commands like <code>L</code>, <code>M</code>, <code>CO</code> or <code>@50,0</code> works in both modes.']];
  function howTo() { const p = $('#sd-howp'); p.innerHTML = '<button type="button" class="x" aria-label="Close">✕</button><h3>How to use the ' + (PFD ? 'PFD' : 'P&amp;ID') + ' tool</h3><ol>' + HOW.map(([t, d]) => '<li><b>' + t + '.</b> ' + d + '</li>').join('') + '</ol><p class="note">Esc cancels and Ctrl+Z undoes.</p><button type="button" id="how-ok">Got it</button>';
    p.hidden = false; const close = () => { p.hidden = true; try { localStorage.setItem('pcme-cad-howto', '1'); } catch (e) { /* ignore */ } }; p.querySelector('.x').onclick = close; $('#how-ok').onclick = close; }
  function help() { const p = $('#sd-help'); p.innerHTML = '<button type="button" class="x" aria-label="Close">✕</button><h3>Commands</h3><table>' + HELP.map(([k2, d]) => '<tr><td><b>' + esc(k2) + '</b></td><td>' + esc(d) + '</td></tr>').join('') + '</table>'; p.hidden = false; p.querySelector('.x').onclick = () => { p.hidden = true; }; }
  function layers() { const p = $('#sd-layers'); p.innerHTML = '<button type="button" class="x" aria-label="Close">✕</button><h3>Layers</h3>' + LAYERS.map(([k2, n]) => '<label class="ly"><input type="checkbox" data-ly="' + k2 + '"' + (shown(k2) ? ' checked' : '') + '><span class="sw" style="background:' + ({ EQUIPMENT: '#ECE7D8', PROCESS: '#E6C35C', UTILITY: '#3E8ED0', VALVES: '#D98EE0', INSTRUMENTS: '#6FBF73', TEXT: '#9FB6CC', BORDER: '#7F93A8' })[k2] + '"></span><b>' + k2 + '</b><small>' + esc(n) + '</small></label>').join('') + '<p class="note">Hidden layers are not drawn, picked or exported.</p>';
    p.hidden = false; p.querySelector('.x').onclick = () => { p.hidden = true; }; p.querySelectorAll('input[data-ly]').forEach(i => i.onchange = () => { doc.hide[i.dataset.ly] = !i.checked; setSel([]); save(); paint(); }); }
  function titleBlock() { ensureSheet(); const p = $('#sd-tb'), tb = doc.tb, r0 = (tb.revs && tb.revs[0]) || {};
    const f = (k2, lab, ph) => '<label>' + lab + '<input data-tb="' + k2 + '" value="' + esc(tb[k2] || '') + '" placeholder="' + esc(ph || '') + '"></label>';
    p.innerHTML = '<button type="button" class="x" aria-label="Close">✕</button><h3>Title block and sheet</h3><label>Drawing title<input id="tb-title" value="' + esc(doc.name || '') + '"></label>' + f('company', 'Company', 'Company name') + f('project', 'Project / client', '') +
      '<div class="two">' + f('dwgno', 'Drawing no.', 'e.g. PID-101') + f('rev', 'Revision', '0') + '</div><div class="two">' + f('drawn', 'Drawn', '') + f('checked', 'Checked', '') + '</div><div class="two">' + f('approved', 'Approved', '') + f('date', 'Date', 'DD-MM-YYYY') + '</div><div class="two">' + f('sheetno', 'Sheet', '1 OF 1') + f('scale', 'Scale', 'NTS') + '</div>' +
      '<label>Revision description<input id="tb-desc" value="' + esc(r0.desc || 'Issued for review') + '"></label><label>Sheet size<select id="tb-size">' + Object.keys(SHEETS).map(s2 => '<option' + (s2 === doc.sheet.size ? ' selected' : '') + '>' + s2 + '</option>').join('') + '</select></label><button type="button" id="tb-center">Centre the sheet on the drawing</button>';
    p.hidden = false; p.querySelector('.x').onclick = () => { p.hidden = true; };
    const upd = () => { const t = doc.tb; t.revs = [{ rev: t.rev || '0', date: t.date || '', desc: $('#tb-desc').value, by: t.drawn || '', chk: t.checked || '' }]; save(); paint(); };
    p.querySelectorAll('input[data-tb]').forEach(i => i.onchange = () => { snap(); doc.tb[i.dataset.tb] = i.value; upd(); });
    $('#tb-title').onchange = e => { snap(); doc.name = e.target.value; $('#sd-name').value = doc.name; upd(); }; $('#tb-desc').onchange = () => { snap(); upd(); };
    $('#tb-size').onchange = e => { snap(); const c0 = sheetBox(), cx = (c0.x0 + c0.x1) / 2, cy = (c0.y0 + c0.y1) / 2, [sw, sh] = SHEETS[e.target.value]; doc.sheet = { size: e.target.value, x: Math.round((cx - sw / 2) / 10) * 10, y: Math.round((cy - sh / 2) / 10) * 10 }; save(); fit(); paint(); };
    $('#tb-center').onclick = () => { snap(); const size = doc.sheet.size; doc.sheet = null; ensureSheet(); if (doc.sheet.size !== size) { const [sw, sh] = SHEETS[size], c0 = sheetBox(), cx = (c0.x0 + c0.x1) / 2, cy = (c0.y0 + c0.y1) / 2; doc.sheet = { size, x: Math.round((cx - sw / 2) / 10) * 10, y: Math.round((cy - sh / 2) / 10) * 10 }; } save(); fit(); paint(); }; }

  /* ---------- tools and pointer ---------- */
  function setTool(t, p) { tool = t; place = t === 'place' ? p : null; conn = null; connSide = null; $('#sd-conn').setAttribute('aria-pressed', String(t === 'connect')); wrap.classList.toggle('placing', t === 'place'); wrap.classList.toggle('connecting', t === 'connect');
    $$('#sd-list .s').forEach(b => b.setAttribute('aria-pressed', String(!!(place && b.dataset.key === place.key && b.dataset.kind === place.kind)))); if (!cmd) idlePrompt(); paint(); }
  let msgT = 0; function msg(t) { const m = $('#sd-msg'); m.textContent = t; m.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('on'), 3200); say(t, 'mute'); }
  const screenAt = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const worldAt = e => { const s = screenAt(e); return s2w(s[0], s[1]); };
  function xyUI(w) { const p = pickPoint(w, cmd && cmd.base); $('#sd-xy').textContent = 'X ' + (p[0] / U).toFixed(1) + '   Y ' + (-p[1] / U).toFixed(1) + ' mm'; }
  const pointing = () => tool === 'place' || tool === 'connect' || (cmd && /base|second|angle|m1|m2|tpt/.test(cmd.step));

  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); wrap.classList.toggle('touch', e.pointerType === 'touch'); const w = worldAt(e), s = screenAt(e); hidePops();
    if (e.button === 1 || e.button === 2) { drag = { pan: true, sx: e.clientX, sy: e.clientY, right: e.button === 2 }; return; }
    if (cmd && cmd.step === 'pan') { drag = { pan: true, sx: e.clientX, sy: e.clientY }; return; }
    if (cmd && cmd.step === 'zwin') { drag = { win: true, zoom: true, sx: s[0], sy: s[1], w0: w }; return; }
    if (pointing()) { drag = { click: true, sx: e.clientX, sy: e.clientY, w }; return; }
    const h = hit(w);
    if (cmd && cmd.step === 'select') { if (h) { const r = refOf(h); if (e.shiftKey) setSel(selSet.filter(x => !(x.k === r.k && x.id === r.id))); else setSel(selSet.concat([r])); return; } if (e.pointerType === 'touch') { drag = { pan: true, sx: e.clientX, sy: e.clientY }; return; } drag = { win: true, sx: s[0], sy: s[1], w0: w, add: true }; return; }
    if (h) { const r = refOf(h); if (e.shiftKey || e.ctrlKey || e.metaKey) { toggleSel(r); return; } if (!inSel(r.k, r.id)) setSel([r]);
      const group = selSet.filter(x => x.k === 'item' || x.k === 'note'); drag = { h, w0: w, moved: false, sx: e.clientX, sy: e.clientY, group: (h.k === 'item' || h.k === 'note') && group.length > 1 ? group : null, start: group.map(x => { const o = x.k === 'item' ? item(x.id) : note(x.id); return o ? [o, o.x, o.y] : null; }).filter(Boolean) }; paint(); return; }
    if (e.pointerType === 'touch') { if (!e.shiftKey) setSel([]); drag = { pan: true, sx: e.clientX, sy: e.clientY }; return; }
    drag = { win: true, sx: s[0], sy: s[1], w0: w, add: e.shiftKey }; });
  cv.addEventListener('pointermove', e => { const w = worldAt(e); cursor = w; scr = screenAt(e); if (e.pointerType !== 'touch') wrap.classList.remove('touch');
    snapPt = (pointing() || (drag && drag.h && drag.moved)) ? osnapAt(w) : null; xyUI(w);
    if (drag && drag.pan) { if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 2) { wrap.classList.add('panning'); drag.moved = true; } userView = true; view.x -= e.movementX / view.z; view.y -= e.movementY / view.z; paint(); return; }
    if (drag && drag.win) { drag.cur = scr; paint(); return; }
    if (drag && drag.click) { if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6 && e.pointerType === 'touch') drag = { pan: true, sx: e.clientX, sy: e.clientY }; paint(); return; }
    if (drag && drag.h) { if (!drag.moved) { if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return; snap(); drag.moved = true; } const h = drag.h;
      if (drag.group) { const p = pickPoint(w, drag.w0), dx = p[0] - Math.round(drag.w0[0] / 10) * 10, dy = p[1] - Math.round(drag.w0[1] / 10) * 10; drag.start.forEach(([o, x0, y0]) => { o.x = Math.round(x0 + dx); o.y = Math.round(y0 + dy); }); }
      else if (h.k === 'item') { const o = drag.start.find(s2 => s2[0] === h.o), p = pickPoint(w, o ? [o[1], o[2]] : null); h.o.x = p[0]; h.o.y = p[1]; }
      else if (h.k === 'note') { const p = pickPoint(w); h.o.x = p[0]; h.o.y = p[1]; }
      else if (h.k === 'valve') { const e2 = ENDS[h.ln.id]; if (e2) h.o.t = +project(e2.pts, w).t.toFixed(3); }
      else if (h.k === 'inst') { const a = instAnchor(h.o); if (a) { const p = pickPoint(w); h.o.dx = Math.round(p[0] - a[0]); h.o.dy = Math.round(p[1] - a[1]); } }
      else if (h.k === 'line') { const e2 = ENDS[h.o.id]; if (e2 && e2.pts.length === 4) { const vert = Math.abs(e2.pts[1][0] - e2.pts[2][0]) < 1; h.o.mid = Math.round((vert ? w[0] : w[1]) / 10) * 10; } else if (h.o.r === 'ud') h.o.mid = Math.max(0, Math.round((w[1] - e2.pts[1][1] + (+h.o.mid || 0)) / 10) * 10); }
      paint(); return; }
    paint(); });
  cv.addEventListener('pointerup', e => { const d = drag; drag = null; wrap.classList.remove('panning'); if (!d) return;
    if (d.pan) { if (d.right && !d.moved) { if (cmd) run(''); else if (lastCmd) run(lastCmd); } return; }
    if (d.win) { const s = screenAt(e), moved = Math.hypot(s[0] - d.sx, s[1] - d.sy) > 4;
      if (d.zoom) { if (moved) { const a = s2w(Math.min(d.sx, s[0]), Math.min(d.sy, s[1])), b = s2w(Math.max(d.sx, s[0]), Math.max(d.sy, s[1])); view.x = (a[0] + b[0]) / 2; view.y = (a[1] + b[1]) / 2; view.z = Math.max(.1, Math.min(6, Math.min(W / (b[0] - a[0]), H / (b[1] - a[1])))); } endCmd(); return; }
      if (!moved) { if (!d.add && !(cmd && cmd.step === 'select')) setSel([]); paint(); return; }
      const a = s2w(Math.min(d.sx, s[0]), Math.min(d.sy, s[1])), b = s2w(Math.max(d.sx, s[0]), Math.max(d.sy, s[1])), got = pickWindow({ x0: a[0], y0: a[1], x1: b[0], y1: b[1] }, s[0] < d.sx);
      setSel((d.add ? selSet : []).concat(got)); if (got.length) say(got.length + ' found', 'mute'); return; }
    if (d.h) { if (d.moved) changed(); return; }
    if (!d.click) return; const w = d.w, h = hit(w), sp = osnapAt(w);
    if (cmd) { applyPoint(pickPoint(w, cmd.base)); return; }
    if (tool === 'place') { const p = place, pt = pickPoint(w);
      if (p.kind === 'eq') { snap(); const it = addItem(p.key, pt); setSel([{ k: 'item', id: it.id }]); if (!e.shiftKey) setTool('move'); changed(); return; }
      if (p.kind === 'item') { if (!h || (h.k !== 'line' && h.k !== 'valve')) { msg('Click on a line to put the ' + ITEMS[p.key].n.toLowerCase() + ' in it.'); return; } snap();
        const ln = h.k === 'line' ? h.o : h.ln, v = { id: nid('v'), k: p.key, t: h.k === 'line' ? +h.t.toFixed(3) : Math.min(.95, h.o.t + .1), tag: ITAG[p.key] ? nextTag(ITAG[p.key]) : '' }; ln.valves = ln.valves || []; ln.valves.push(v);
        setSel([{ k: 'valve', id: v.id, line: ln.id }]); if (!e.shiftKey) setTool('move'); changed(); return; }
      if (!h || (h.k !== 'item' && h.k !== 'line' && h.k !== 'valve')) { msg('Click on a piece of equipment or a line to fit the instrument.'); return; } snap();
      const q = { id: nid('q'), k: p.key, tag: nextTag(p.key), dx: 0, dy: /PSV|RD/.test(p.key) ? -30 : -46, mount: /T$|IC$/.test(p.key) ? 'dcs' : 'field' };
      if (h.k === 'item') { q.on = h.o.id; q.ax = Math.round(w[0] - h.o.x); } else { q.on = h.k === 'line' ? h.o.id : h.ln.id; q.t = h.k === 'line' ? +h.t.toFixed(3) : h.o.t; }
      doc.inst.push(q); setSel([{ k: 'inst', id: q.id }]); if (!e.shiftKey) setTool('move'); changed(); return; }
    if (tool === 'connect') {
      let target = sp && sp.it ? sp.it : (h && h.k === 'item' ? h.o : null); const side = sp && sp.it && sp.side ? sp.side : null;
      if (!conn) { if (!target) { msg('Click a piece of equipment, a connector or a tee to start the line.'); return; } conn = target.id; connSide = side; idlePrompt(); paint(); return; }
      snap(); if (!target) target = h && h.k === 'line' ? splitLine(h.o, h.t) : addItem('junction', pickPoint(w, (() => { const a = item(conn); return a ? (connSide ? portPt(a, connSide, 0) : [a.x, a.y]) : null; })()));
      if (target.id === conn) { undo.pop(); conn = null; connSide = null; idlePrompt(); paint(); return; }
      const ln = addLine(item(conn), target, connSide, side); setSel([{ k: 'line', id: ln.id }]); conn = target.sym === 'junction' ? target.id : null; connSide = null; changed(); idlePrompt(); return; } });
  cv.addEventListener('pointercancel', () => { drag = null; wrap.classList.remove('panning'); });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('pointerleave', () => { cursor = null; scr = null; snapPt = null; paint(); });
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top, q = s2w(sx, sy); zoomAt(Math.exp(-e.deltaY * .0015), q, sx, sy); }, { passive: false });
  cv.addEventListener('dblclick', e => { const h = hit(worldAt(e)); if (!h) { fit(); paint(); } });
  function zoomAt(f, q, sx, sy) { userView = true; view.z = Math.max(.1, Math.min(6, view.z * f)); view.x = q[0] - (sx - W / 2) / view.z; view.y = q[1] - (sy - H / 2) / view.z; paint(); }
  $('#sd-zi').onclick = () => zoomAt(1.25, [view.x, view.y], W / 2, H / 2); $('#sd-zo').onclick = () => zoomAt(.8, [view.x, view.y], W / 2, H / 2); $('#sd-fit').onclick = () => { fit(); paint(); };
  function fit() { computeEnds(); let b = bounds(); const tb = tableBox(); if (b && tb) { b.y1 = tb.y0 + tb.h; b.x1 = Math.max(b.x1, tb.x0 + tb.w); }
    if (opts.sheet) { const sb = sheetBox(); b = b ? { x0: Math.min(b.x0, sb.x0), y0: Math.min(b.y0, sb.y0), x1: Math.max(b.x1, sb.x1), y1: Math.max(b.y1, sb.y1) } : sb; }
    if (!b) { view.x = 400; view.y = 300; view.z = 1; return; } const { x0, y0, x1, y1 } = b;
    const rw = $('#sd-card').hidden || W < 800 ? 0 : 290, Wv = W - rw; view.z = Math.max(.1, Math.min(1.5, Math.min(Wv / (x1 - x0 + 40), H / (y1 - y0 + 40)))); view.x = (x0 + x1) / 2 + rw / 2 / view.z; view.y = (y0 + y1) / 2; }

  /* keyboard: typing goes to the command line, like AutoCAD (only while the pointer is over the drawing or focus is inside it) */
  let hot = false; root.addEventListener('pointerenter', () => { hot = true; }); root.addEventListener('pointerleave', () => { hot = false; });
  document.addEventListener('keydown', e => { if (!root.isConnected) return; const ae = document.activeElement || {}, inCmd = ae === cin, inRoot = root.contains(ae) || (ae === document.body && (hot || root.classList.contains('full'))),
      typing = !inCmd && (ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || (ae.tagName === 'INPUT' && !/checkbox|radio|button/.test(ae.type || '')));
    if (!inRoot && ae.tagName) return;
    if (typing) { if (e.key === 'Escape' && root.contains(ae)) { ae.blur(); hidePops(); } return; }
    const k = e.key, mod = e.ctrlKey || e.metaKey, cmdEmpty = !inCmd || !cin.value;
    if (k === 'F3' || k === 'F7' || k === 'F8' || k === 'F9') { e.preventDefault(); toggle({ F3: 'osnap', F7: 'grid', F8: 'ortho', F9: 'snap' }[k]); return; }
    if (mod && k.toLowerCase() === 'z') { e.preventDefault(); doUndo(); return; }
    if (mod && (k.toLowerCase() === 'y' || (e.shiftKey && k.toLowerCase() === 'z'))) { e.preventDefault(); doRedo(); return; }
    if (mod && k.toLowerCase() === 'a' && cmdEmpty) { e.preventDefault(); selectAll(); return; }
    if (mod && k.toLowerCase() === 'c' && cmdEmpty && selSet.length) { e.preventDefault(); clip = selSet.slice(); msg(selSet.length + ' object(s) copied. Ctrl+V to paste.'); return; }
    if (mod && k.toLowerCase() === 'v' && cmdEmpty && clip) { e.preventDefault(); snap(); const out = duplicate(clip.filter(r => (r.k === 'item' && item(r.id)) || (r.k === 'note' && note(r.id)) || r.k === 'line'), 40, 40); setSel(out); changed(); return; }
    if (k === 'Escape') { e.preventDefault(); cin.value = ''; hidePops(); if (cmd) { wrap.classList.remove('panmode'); return endCmd('*Cancel*'); } if (tool !== 'move') { setTool('move'); return; } setSel([]); return; }
    if ((k === 'Delete' || (k === 'Backspace' && !inCmd)) && selSet.length && !(inCmd && cin.value)) { e.preventDefault(); const n = selSet.length; eraseRefs(selSet); say(n + ' erased.', 'mute'); return; }
    if (k.startsWith('Arrow') && selSet.length && cmdEmpty && !cmd) { e.preventDefault(); const st = e.shiftKey ? 50 : 10, d = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[k]; snap(); moveRefs(selSet, d[0], d[1]); changed(); return; }
    if (k === 'Enter' || (k === ' ' && (!inCmd || !cin.value) && !(cmd && cmd.step === 'ttext'))) { if (mod) return; e.preventDefault(); const v = cin.value; cin.value = ''; run(v); return; }
    if (!inCmd && !mod && !e.altKey && k.length === 1) { e.preventDefault(); if (ae && ae.blur && ae !== document.body) ae.blur(); cin.focus({ preventScroll: true }); cin.value += k; } });

  /* status bar, toolbar */
  $$('#sd-status [data-opt]').forEach(b => b.onclick = () => toggle(b.dataset.opt));
  $$('[data-cmd]').forEach(b => b.onclick = () => { if (cmd) endCmd(); run(b.dataset.cmd); });
  $('#sd-conn').onclick = () => { if (cmd) endCmd(); if (tool === 'connect') setTool('move'); else run('LINE'); };
  $('#sd-undo').onclick = doUndo; $('#sd-redo').onclick = doRedo;
  $('#sd-name').onchange = e => { doc.name = e.target.value; save(); paint(); };
  $('#sd-new').onclick = () => { if (doc.items.length && !confirm('Start a new drawing? This one will be cleared.')) return; snap(); doc = blank(); setSel([]); setTool('move'); changed(); startScreen(); };
  const narrow = () => matchMedia('(max-width: 800px)').matches;
  $('#sd-palbtn').onclick = () => { closeMenus(); if (narrow()) { root.style.setProperty('--sd-bar', $('.sd-bar').offsetHeight + 'px'); root.classList.toggle('pal-open'); return; } opts.palhide = !opts.palhide; saveOpts(); modeUI(); };
  $('#sd-more').onclick = () => openMenu('#sd-more', '#sd-moremenu'); $('#sd-dl').onclick = () => openMenu('#sd-dl', '#sd-dlmenu');
  $$('.sd-menu button').forEach(b => b.addEventListener('click', () => closeMenus()));
  document.addEventListener('pointerdown', e => { if (!e.target.closest || !e.target.closest('.sd-menu, #sd-more, #sd-dl')) closeMenus(); });
  $('#sd-cad').onclick = () => { opts.cad = !opts.cad; saveOpts(); modeUI(); idlePrompt(); msg(opts.cad ? 'CAD mode on: command line, GRID, SNAP, ORTHO and OSNAP are shown.' : 'Simple mode: status bar and command history hidden. Typing a command still works.'); };
  $('#sd-tpl').onclick = () => startScreen();
  { const hd = document.querySelector('.site-nav'); const setTop = () => root.style.setProperty('--sd-top', ((hd ? hd.offsetHeight : 0) + 12) + 'px'); setTop(); addEventListener('resize', setTop); }
  modeUI();
  $('#sd-png').onclick = () => run('PNG'); $('#sd-how').onclick = () => { hidePops(); howTo(); }; $('#sd-full').onclick = () => run('FULL');

  /* ---------- export ---------- */
  const fileName = ext => (doc.name || 'drawing').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') + '.' + ext;
  function download(href, name) { const a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  function exportPNG() { computeEnds(); if (opts.sheet) { const sb = sheetBox(), sc = 2.4, c2 = document.createElement('canvas'); c2.width = sb.w * sc; c2.height = sb.h * sc; const x = c2.getContext('2d');
      draw(x, c2.width, c2.height, { x: (sb.x0 + sb.x1) / 2, y: (sb.y0 + sb.y1) / 2, z: sc }, PRINT, 'sheet'); download(c2.toDataURL('image/png'), fileName('png')); say('Image saved.', 'mute'); return; }
    const b = bounds(); if (!b) return msg('The drawing is empty.'); let { x0, y0, x1, y1 } = b; const tb = tableBox(); if (tb) { y1 = tb.y0 + tb.h; x1 = Math.max(x1, tb.x0 + tb.w); }
    const pad = 40, top = 60, sc = 2, Wd = x1 - x0 + pad * 2, Hd = y1 - y0 + pad * 2 + top, c2 = document.createElement('canvas'); c2.width = Wd * sc; c2.height = Hd * sc; const x = c2.getContext('2d'); x.scale(sc, sc);
    draw(x, Wd, Hd, { x: (x0 + x1) / 2, y: (y0 + y1) / 2 - top / 2, z: 1 }, PRINT, true); download(c2.toDataURL('image/png'), fileName('png')); say('Image saved.', 'mute'); }
  let pdfLib = null; const me = document.currentScript, VEND = me ? me.src.replace(/js\/sheet-draw\.js.*$/, 'vendor/jspdf.umd.min.js') : '/assets/vendor/jspdf.umd.min.js';
  function loadPDF() { if (window.jspdf) return Promise.resolve(window.jspdf); if (!pdfLib) pdfLib = new Promise((res, rej) => { const s = document.createElement('script'); s.src = VEND; s.onload = () => res(window.jspdf); s.onerror = () => { pdfLib = null; rej(new Error('Could not load the PDF library')); }; document.head.appendChild(s); }); return pdfLib; }
  function plotPDF() { computeEnds(); ensureSheet(); say('Plotting ' + doc.sheet.size + ' sheet to PDF…', 'mute');
    loadPDF().then(lib => { const sb = sheetBox(), mmW = sb.w / U, mmH = sb.h / U, dpi = doc.sheet.size === 'A1' ? 150 : 200, px = dpi / 25.4 / U, c2 = document.createElement('canvas'); c2.width = Math.round(sb.w * px); c2.height = Math.round(sb.h * px);
      draw(c2.getContext('2d'), c2.width, c2.height, { x: (sb.x0 + sb.x1) / 2, y: (sb.y0 + sb.y1) / 2, z: px }, PRINT, 'sheet');
      const pdf = new lib.jsPDF({ orientation: 'landscape', unit: 'mm', format: [mmW, mmH], compress: true }); pdf.setProperties({ title: doc.name || 'P&ID', creator: 'pharmacheme.in' });
      pdf.addImage(c2.toDataURL('image/png'), 'PNG', 0, 0, mmW, mmH, undefined, 'FAST'); pdf.save(fileName('pdf')); say('PDF saved (' + doc.sheet.size + ', ' + dpi + ' dpi).', 'mute'); }, err => say(err.message, 'err')); }

  /* DXF (AutoCAD R12): draw the sheet through a recording context that turns canvas paths into DXF entities */
  function DxfRec(Hd) { this.H = Hd; this.m = [1, 0, 0, 1, 0, 0]; this.stack = []; this.paths = []; this.cur = null; this.ents = []; this.__ly = '0'; this.lineWidth = 1; this.font = '10px sans-serif'; this.textAlign = 'left'; this.textBaseline = 'alphabetic';
    this.fillStyle = '#000'; this.strokeStyle = '#000'; this.globalAlpha = 1; this.lineJoin = 'round'; this.lineCap = 'butt'; this.dash = []; this.mc = document.createElement('canvas').getContext('2d'); }
  DxfRec.prototype = {
    P(x, y) { const m = this.m; return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; },
    save() { this.stack.push({ m: this.m.slice(), lw: this.lineWidth, f: this.font, ta: this.textAlign, tb: this.textBaseline, fs: this.fillStyle, ss: this.strokeStyle, d: this.dash.slice(), ly: this.__ly }); },
    restore() { const s = this.stack.pop(); if (!s) return; this.m = s.m; this.lineWidth = s.lw; this.font = s.f; this.textAlign = s.ta; this.textBaseline = s.tb; this.fillStyle = s.fs; this.strokeStyle = s.ss; this.dash = s.d; this.__ly = s.ly; },
    transform(a, b, c, d, e, f) { const m = this.m; this.m = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * d, m[1] * c + m[3] * d, m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]]; },
    setTransform(a, b, c, d, e, f) { this.m = [a, b, c, d, e, f]; }, translate(x, y) { this.transform(1, 0, 0, 1, x, y); }, scale(x, y) { this.transform(x, 0, 0, y, 0, 0); },
    rotate(a) { const c = Math.cos(a), s = Math.sin(a); this.transform(c, s, -s, c, 0, 0); },
    setLineDash(d) { this.dash = d || []; }, getLineDash() { return this.dash; },
    beginPath() { this.paths = []; this.cur = null; },
    moveTo(x, y) { this.cur = { pts: [this.P(x, y)], closed: false }; this.paths.push(this.cur); },
    lineTo(x, y) { if (!this.cur) return this.moveTo(x, y); this.cur.pts.push(this.P(x, y)); },
    closePath() { if (this.cur) { this.cur.closed = true; const p0 = this.cur.pts[0]; this.cur = { pts: [p0], closed: false }; this.paths.push(this.cur); } },
    arc(x, y, r, a0, a1, ccw) { this.ellipse(x, y, r, r, 0, a0, a1, ccw); },
    ellipse(x, y, rx, ry, rot, a0, a1, ccw) { let span = a1 - a0; if (!ccw && span < 0) span += Math.PI * 2; if (ccw && span > 0) span -= Math.PI * 2; if (Math.abs(span) > Math.PI * 2) span = Math.sign(span) * Math.PI * 2;
      const n = Math.max(8, Math.ceil(Math.abs(span) / (Math.PI / 18))), cr = Math.cos(rot || 0), sr = Math.sin(rot || 0);
      for (let i = 0; i <= n; i++) { const a = a0 + span * i / n, ex = rx * Math.cos(a), ey = ry * Math.sin(a), px = x + ex * cr - ey * sr, py = y + ex * sr + ey * cr; if (i === 0 && this.cur) this.lineTo(px, py); else if (i === 0) this.moveTo(px, py); else this.lineTo(px, py); }
      if (Math.abs(Math.abs(span) - Math.PI * 2) < 1e-6 && this.cur) this.cur.closed = true; },
    arcTo(x1, y1) { this.lineTo(x1, y1); },
    quadraticCurveTo(cx, cy, x, y) { const p0 = this.cur ? this.cur.pts[this.cur.pts.length - 1] : this.P(cx, cy), inv = this.inv(p0); for (let i = 1; i <= 8; i++) { const t = i / 8, u = 1 - t; this.lineTo(u * u * inv[0] + 2 * u * t * cx + t * t * x, u * u * inv[1] + 2 * u * t * cy + t * t * y); } },
    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) { const p0 = this.cur ? this.inv(this.cur.pts[this.cur.pts.length - 1]) : [c1x, c1y]; for (let i = 1; i <= 10; i++) { const t = i / 10, u = 1 - t; this.lineTo(u * u * u * p0[0] + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x, u * u * u * p0[1] + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y); } },
    inv(p) { const m = this.m, det = m[0] * m[3] - m[1] * m[2] || 1, x = p[0] - m[4], y = p[1] - m[5]; return [(m[3] * x - m[2] * y) / det, (-m[1] * x + m[0] * y) / det]; },
    rect(x, y, w, h) { this.moveTo(x, y); this.lineTo(x + w, y); this.lineTo(x + w, y + h); this.lineTo(x, y + h); this.cur.closed = true; this.cur = null; },
    solid(c) { c = String(c || '').replace(/\s/g, '').toLowerCase(); return !(c === '#ffffff' || c === '#fff' || c === 'white' || /^rgba\(255,255,255/.test(c) || c === 'transparent'); },
    emit(closedFill) { this.paths.forEach(p => { if (p.pts.length < 2) return; this.ents.push({ t: 'pl', ly: this.__ly, pts: p.pts.slice(), closed: p.closed || closedFill, dash: this.dash.length > 0 }); }); },
    stroke() { this.emit(false); }, fill() { if (this.solid(this.fillStyle)) this.emit(true); },
    strokeRect(x, y, w, h) { const keep = this.paths; this.beginPath(); this.rect(x, y, w, h); this.emit(true); this.paths = keep; },
    fillRect(x, y, w, h) { if (!this.solid(this.fillStyle)) return; const keep = this.paths; this.beginPath(); this.rect(x, y, w, h); this.emit(true); this.paths = keep; },
    clearRect() {},
    measureText(t) { this.mc.font = this.font; return this.mc.measureText(t); },
    fillText(t, x, y) { const px = parseFloat((/([\d.]+)px/.exec(this.font) || [0, 10])[1]), m = this.m, sc = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1, w = this.measureText(t).width;
      const ha = this.textAlign === 'center' ? 1 : this.textAlign === 'right' || this.textAlign === 'end' ? 2 : 0, va = this.textBaseline === 'middle' ? 2 : this.textBaseline === 'top' || this.textBaseline === 'hanging' ? 3 : 0;
      this.ents.push({ t: 'tx', ly: this.__ly, p: this.P(x, y), ha, va, w: w * sc, h: px * .72 * sc, rot: Math.atan2(m[1], m[0]), s: String(t) }); },
    strokeText() {}, drawImage() {}, createLinearGradient() { return { addColorStop() {} }; }, clip() {} };
  function exportDXF() { computeEnds(); ensureSheet(); const sb = sheetBox(), r = new DxfRec(sb.h);
    draw(r, sb.w, sb.h, { x: (sb.x0 + sb.x1) / 2, y: (sb.y0 + sb.y1) / 2, z: 1 }, PRINT, 'sheet');
    const X = p => (p[0] / U).toFixed(3), Y = p => ((sb.h - p[1]) / U).toFixed(3), out = [], g = (code, v) => out.push(String(code), String(v));
    const txt = s => s.replace(/°/g, '%%d').replace(/±/g, '%%p').replace(/[₀-₉]/g, c => String(c.charCodeAt(0) - 8320)).replace(/[²³]/g, c => c === '²' ? '2' : '3').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/·/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/µ/g, 'u').replace(/[^\x20-\x7E%]/g, '?');
    g(0, 'SECTION'); g(2, 'HEADER'); g(9, '$ACADVER'); g(1, 'AC1009'); g(9, '$INSUNITS'); g(70, 4); g(9, '$DWGCODEPAGE'); g(3, 'ANSI_1252'); g(9, '$EXTMIN'); g(10, 0); g(20, 0); g(30, 0); g(9, '$EXTMAX'); g(10, (sb.w / U).toFixed(1)); g(20, (sb.h / U).toFixed(1)); g(30, 0); g(9, '$LIMMIN'); g(10, 0); g(20, 0); g(9, '$LIMMAX'); g(10, (sb.w / U).toFixed(1)); g(20, (sb.h / U).toFixed(1)); g(0, 'ENDSEC');
    g(0, 'SECTION'); g(2, 'TABLES');
    g(0, 'TABLE'); g(2, 'LTYPE'); g(70, 2); g(0, 'LTYPE'); g(2, 'CONTINUOUS'); g(70, 0); g(3, 'Solid line'); g(72, 65); g(73, 0); g(40, 0); g(0, 'LTYPE'); g(2, 'DASHED'); g(70, 0); g(3, '__ __ __'); g(72, 65); g(73, 2); g(40, 3); g(49, 2); g(49, -1); g(0, 'ENDTAB');
    const lys = [['0', 7]].concat(LAYERS.map(l => [l[0], l[2]])); g(0, 'TABLE'); g(2, 'LAYER'); g(70, lys.length); lys.forEach(([n, col]) => { g(0, 'LAYER'); g(2, n); g(70, 0); g(62, col); g(6, 'CONTINUOUS'); }); g(0, 'ENDTAB');
    g(0, 'TABLE'); g(2, 'STYLE'); g(70, 1); g(0, 'STYLE'); g(2, 'STANDARD'); g(70, 0); g(40, 0); g(41, 1); g(50, 0); g(71, 0); g(42, 2.5); g(3, 'txt'); g(4, ''); g(0, 'ENDTAB'); g(0, 'ENDSEC');
    g(0, 'SECTION'); g(2, 'ENTITIES'); let n = 0;
    r.ents.forEach(e => { const ly = e.ly || '0';
      if (e.t === 'pl') { let pts = e.pts.filter((p, i) => !i || Math.hypot(p[0] - e.pts[i - 1][0], p[1] - e.pts[i - 1][1]) > .05); if (pts.length < 2) return; if (e.closed && pts.length > 2 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < .05) pts = pts.slice(0, -1);
        if (pts.length === 2 && !e.closed) { g(0, 'LINE'); g(8, ly); if (e.dash) g(6, 'DASHED'); g(10, X(pts[0])); g(20, Y(pts[0])); g(30, 0); g(11, X(pts[1])); g(21, Y(pts[1])); g(31, 0); n++; return; }
        g(0, 'POLYLINE'); g(8, ly); if (e.dash) g(6, 'DASHED'); g(66, 1); g(10, 0); g(20, 0); g(30, 0); g(70, e.closed ? 1 : 0); pts.forEach(p => { g(0, 'VERTEX'); g(8, ly); g(10, X(p)); g(20, Y(p)); g(30, 0); }); g(0, 'SEQEND'); g(8, ly); n++; }
      else if (e.t === 'tx' && e.s.trim()) { g(0, 'TEXT'); g(8, ly); g(10, X(e.p)); g(20, Y(e.p)); g(30, 0); g(40, Math.max(.5, e.h / U).toFixed(2)); g(1, txt(e.s)); const rot = -e.rot * 180 / Math.PI; if (Math.abs(rot) > .01) g(50, rot.toFixed(2));
        if (e.ha || e.va) { if (e.ha) g(72, e.ha); g(11, X(e.p)); g(21, Y(e.p)); g(31, 0); if (e.va) g(73, e.va); } n++; } });
    g(0, 'ENDSEC'); g(0, 'EOF');
    const blob = new Blob([out.join('\r\n') + '\r\n'], { type: 'application/dxf' }), url = URL.createObjectURL(blob); download(url, fileName('dxf')); setTimeout(() => URL.revokeObjectURL(url), 4000);
    say('DXF saved: ' + n + ' entities on ' + LAYERS.length + ' layers, in mm (' + doc.sheet.size + ' sheet).', 'mute'); window.__sdLastDxf = out.join('\r\n'); }

  /* ---------- edit card ---------- */
  function card() { const box = $('#sd-card'); if (!selSet.length) { box.hidden = true; box.innerHTML = ''; return; }
    const f = (id, lab, val, attrs) => '<label>' + lab + '<input id="' + id + '" value="' + esc(val) + '" ' + (attrs || '') + '></label>';
    let h = '<button type="button" class="x" id="c-x" aria-label="Close">✕</button>', bind = [];
    if (selSet.length > 1) { const cnt = {}; selSet.forEach(r => cnt[r.k] = (cnt[r.k] || 0) + 1); const nm = { item: 'equipment', line: 'lines', valve: 'valves', inst: 'instruments', note: 'notes' };
      h += '<h3>' + selSet.length + ' objects selected</h3><span style="font-size:12.5px;color:var(--muted)">' + Object.entries(cnt).map(([k2, v]) => v + ' ' + nm[k2]).join(', ') + '</span><div class="acts"><button type="button" data-c="MOVE">Move</button><button type="button" data-c="COPY">Copy</button><button type="button" data-c="ROTATE">Rotate</button><button type="button" data-c="MIRROR">Mirror</button></div>';
      h += '<button type="button" class="del" id="c-del">Erase</button>'; box.innerHTML = h; box.hidden = false; box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => run(b.dataset.c)); $('#c-x').onclick = () => setSel([]); $('#c-del').onclick = removeSel; return; }
    if (sel.k === 'item') { const it = item(sel.id); if (!it) return setSel([]); const E = EQ[it.sym];
      if (it.sym === 'junction') h += '<h3>Tee / junction</h3>';
      else if (it.sym === 'opc') { h += '<h3>Connector</h3>' + f('c-name', 'Text', it.name || '', 'placeholder="e.g. CWS from header"'); bind.push(['c-name', it, 'name']); }
      else { h += '<h3>' + esc(E.n) + '</h3><div class="two">' + f('c-tag', 'Tag', it.tag || '') + f('c-cap', 'Capacity', it.cap || '', 'placeholder="e.g. 6.3 KL"') + '</div>' + f('c-name', 'Name', it.name || '');
        if (!PFD) h += f('c-moc', 'MOC', it.moc || '', 'placeholder="e.g. SS316, GLR"');
        if (E.link) h += '<a href="/equipment-instruments/#' + E.link + '" target="_blank" rel="noopener">How a ' + esc(E.n.replace(/ \(.*\)/, '').toLowerCase()) + ' works</a>';
        bind.push(['c-tag', it, 'tag'], ['c-cap', it, 'cap'], ['c-name', it, 'name'], ['c-moc', it, 'moc']); }
      h += '<div class="two">' + f('c-x2', 'X (mm)', (it.x / U).toFixed(1), 'type="number" step="any"') + f('c-y2', 'Y (mm)', (-it.y / U).toFixed(1), 'type="number" step="any"') + '</div>'; }
    else if (sel.k === 'line') { const ln = line(sel.id); if (!ln) return setSel([]); const a = item(ln.a), b = item(ln.b);
      h += '<h3>' + (PFD ? 'Stream' : 'Line ' + esc(ln.no || '')) + '</h3><span style="font-size:12.5px;color:var(--muted)">' + esc(label(a)) + ' to ' + esc(label(b)) + ' · layer ' + lineLayer(ln) + '</span>';
      h += '<label>Service<select id="c-svc">' + Object.entries(SVC).map(([k2, v]) => '<option value="' + k2 + '"' + (k2 === ln.svc ? ' selected' : '') + '>' + k2 + ', ' + esc(v.n) + '</option>').join('') + '</select></label>';
      if (!PFD) { h += '<div class="two">' + f('c-no', 'Line no.', ln.no || '') + '<label>Size<select id="c-size"><option value="">Not set</option>' + L.NBS.map(nb => '<option' + (+ln.size === nb ? ' selected' : '') + '>' + nb + '</option>').join('') + '</select></label></div>';
        h += '<a href="/design-tools/line-sizing/?fluid=' + ((SVC[ln.svc] || SVC.PRC).u) + '" target="_blank" rel="noopener">Find the size with the Line Sizing calculator</a>'; bind.push(['c-no', ln, 'no']); }
      else { const st = ln.st = ln.st || {}; h += f('c-comp', 'Fluid / composition', st.comp || ln.fluid || '', 'placeholder="e.g. Toluene 95%, water 5%"') + '<div class="two">' + f('c-kgh', 'Mass flow, kg/h', st.kgh || '') + '<label>Phase<select id="c-phase">' + ['', 'Liquid', 'Vapour', 'Two-phase', 'Slurry', 'Solid'].map(p => '<option' + (p === (st.phase || '') ? ' selected' : '') + '>' + p + '</option>').join('') + '</select></label></div>' +
        '<div class="two">' + f('c-T', 'Temperature, °C', st.T || '') + f('c-P', 'Pressure, barg', st.P || '') + '</div>' + f('c-sno', 'Stream no.', ln.sno || '', 'type="number" min="1" placeholder="auto"');
        bind.push(['c-comp', st, 'comp'], ['c-kgh', st, 'kgh'], ['c-phase', st, 'phase'], ['c-T', st, 'T'], ['c-P', st, 'P'], ['c-sno', ln, 'sno']); }
      h += '<button type="button" id="c-flip">Reverse flow direction</button>'; }
    else if (sel.k === 'valve') { const ln = line(sel.line), v = ln && (ln.valves || []).find(x => x.id === sel.id); if (!v) return setSel([]);
      h += '<h3>' + esc(ITEMS[v.k].n) + '</h3>' + f('c-tag', 'Tag', v.tag || '', 'placeholder="optional"') + '<span style="font-size:12.5px;color:var(--muted)">On line ' + esc(ln.no || '') + '. Drag it along the line to move it.</span>'; bind.push(['c-tag', v, 'tag']);
      const lk = S.ITEMLINK[v.k]; if (lk) h += '<a href="/equipment-instruments/#' + lk + '" target="_blank" rel="noopener">How a ' + esc(ITEMS[v.k].n.toLowerCase()) + ' works</a>'; }
    else if (sel.k === 'inst') { const q = doc.inst.find(x => x.id === sel.id); if (!q) return setSel([]);
      h += '<h3>Instrument</h3><div class="two">' + f('c-tag', 'Tag', q.tag || '') + '<label>Mounting<select id="c-mount">' + [['field', 'Field'], ['panel', 'Local panel'], ['dcs', 'DCS / PLC']].map(([k2, l2]) => '<option value="' + k2 + '"' + (k2 === q.mount ? ' selected' : '') + '>' + l2 + '</option>').join('') + '</select></label></div>' +
        '<span style="font-size:12.5px;color:var(--muted)">' + esc(S.INST[q.k] || q.k) + '</span>'; bind.push(['c-tag', q, 'tag'], ['c-mount', q, 'mount']); }
    else if (sel.k === 'note') { const n = note(sel.id); if (!n) return setSel([]);
      h += '<h3>Text</h3><label>Text<textarea id="c-note" rows="3">' + esc(n.t || '') + '</textarea></label><label>Height<select id="c-h">' + [[10, '2.5 mm'], [14, '3.5 mm'], [20, '5 mm'], [28, '7 mm'], [40, '10 mm']].map(([v, l2]) => '<option value="' + v + '"' + (+n.h === v ? ' selected' : '') + '>' + l2 + '</option>').join('') + '</select></label>'; }
    h += '<button type="button" class="del" id="c-del">Erase</button>'; box.innerHTML = h; box.hidden = false;
    bind.forEach(([id, o, key]) => { const el = $('#' + id); if (el) el.onchange = () => { snap(); o[key] = el.value; if (o === line(sel.id) && key === 'no') o.autoNo = false; changed(); }; });
    $('#c-x').onclick = () => setSel([]); $('#c-del').onclick = removeSel;
    if ($('#c-x2')) { const it = item(sel.id); $('#c-x2').onchange = e => { snap(); it.x = Math.round(+e.target.value * U); changed(); }; $('#c-y2').onchange = e => { snap(); it.y = Math.round(-e.target.value * U); changed(); }; }
    if ($('#c-note')) { const n = note(sel.id); $('#c-note').onchange = e => { snap(); n.t = e.target.value; changed(); }; $('#c-h').onchange = e => { snap(); n.h = +e.target.value; changed(); }; }
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
    $$('#sd-list .s').forEach(b => b.onclick = () => { if (cmd) endCmd(); setTool('place', { kind: b.dataset.kind, key: b.dataset.key }); say('Command: INSERT ' + b.title, 'mute'); root.classList.remove('pal-open'); });
    $('#sd-q').oninput = e => { const q = e.target.value.trim().toLowerCase(); $$('#sd-list .s').forEach(b => b.hidden = !!q && !(b.title.toLowerCase().includes(q) || b.dataset.key.toLowerCase() === q)); $$('#sd-list details').forEach(d => { d.hidden = !d.querySelector('.s:not([hidden])'); d.open = q ? true : d === $('#sd-list details'); }); }; }

  /* ---------- start screen and templates ---------- */
  function fromTemplate(T) { const d = blank(); d.sheet = null; d.name = T.short; const prev = doc; doc = d; const id = {}, nz = {}, grp = {};
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
    draw(c, w, h, { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, z }, Object.assign({}, DARK, { grid: null }), 'thumb'); doc = keep; computeEnds(); }
  function startScreen() { const s = $('#sd-start');
    s.innerHTML = '<h2>' + (PFD ? 'Start a PFD' : 'Start a P&amp;ID') + '</h2><p>Start blank, or from a ready setup that you can change.' + (doc.items.length ? ' Picking one replaces the drawing on screen (Undo brings it back). <button type="button" class="sd-startx" id="sd-startx">Back to my drawing</button>' : '') + '</p><div class="grid"><button type="button" class="tpl blank" data-k="">Blank sheet</button>' +
      Object.entries(S.TEMPLATES).map(([k, T]) => '<button type="button" class="tpl" data-k="' + k + '"><canvas width="440" height="250" aria-hidden="true"></canvas><b>' + esc(T.short) + '</b></button>').join('') + '</div>';
    s.hidden = false; const bx = $('#sd-startx'); if (bx) bx.onclick = () => { s.hidden = true; }; $$('#sd-start .tpl').forEach(b => { const c = b.querySelector('canvas'); if (c) thumb(S.TEMPLATES[b.dataset.k], c.getContext('2d'), 440, 250);
      b.onclick = () => { if (b.dataset.k) { snap(); doc = norm(fromTemplate(S.TEMPLATES[b.dataset.k])); ensureSheet(); } s.hidden = true; setSel([]); setTool('move'); changed(); requestAnimationFrame(() => { fit(); paint(); }); let seen = false; try { seen = !!localStorage.getItem('pcme-cad-howto'); } catch (e) { seen = true; } if (!seen) howTo(); }; }); }

  /* ---------- refresh ---------- */
  function changed() { save(); refresh(); }
  function refresh() { $('#sd-name').value = doc.name || ''; card(); if (!cmd) idlePrompt(); paint(); }
  palette(); statusUI();
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.items) { doc = norm(s); if (!doc.sheet) ensureSheet(); } } catch (e) { /* ignore */ }
  { const tq = new URLSearchParams(location.search).get('template'); if (tq && S.TEMPLATES[tq] && (!doc.items.length || confirm('Open the ' + S.TEMPLATES[tq].short + ' template? It replaces the drawing on screen (Undo brings it back).'))) { snap(); doc = norm(fromTemplate(S.TEMPLATES[tq])); ensureSheet(); save(); } }
  refresh(); say('Pick a symbol, click to place it, then use Line to join items. Drag a window to select (left to right: inside; right to left: crossing).', 'mute'); if (!doc.items.length) startScreen(); requestAnimationFrame(() => { fit(); paint(); });
  window.__sd = { get doc() { return doc; }, get sel() { return selSet; }, opts, view, run, w2s: (x, y) => { const r = cv.getBoundingClientRect(), q = w2s(x, y); return [q[0] + r.left, q[1] + r.top]; }, fit: () => { fit(); paint(); }, setSel: s => setSel(Array.isArray(s) ? s : s ? [s] : []), dxf: () => window.__sdLastDxf };
})();
