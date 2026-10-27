/* Plant Rally: a top-down racing game through a fictional chemical plant.
   Drive the site emergency response vehicle for three laps against the clock. Keep to the zone speed limits, respond
   correctly to hazards on the road, and stop in the yellow mission boxes to solve engineering missions (plant-rally-missions.js).
   Canvas 2D, no libraries. Progress (best times, best-lap ghost, mission log) stays on this device. */
(function () {
  'use strict';
  const P = window.PRMissions;
  const me = document.currentScript;
  const URL_AZ = me && me.getAttribute('data-azeo'), URL_SOL = me && me.getAttribute('data-sol');
  const host = document.getElementById('pr-root');
  if (!host || !P) return;
  const DEBUG = /[?&]debug\b/.test(location.search);

  /* ---------------- constants ---------------- */
  const KMH = 6;               // world px per second for 1 km/h
  const HALF = 44;             // half road width (two lanes)
  const WALL = HALF + 16;      // kerb edge: the car cannot go further from the centre line
  const OFF = { x: 250, y: 200 }, WW = 3050, WH = 2000;
  const LAPS = 3, PENALTY = 10, BONUS = 5, VIOL_MAX = 3, VIOL_PTS = 25;
  const MODES = {
    student: { name: 'Student', hazards: [1, 1, 2], tMission: 45, hint: 1, par: [1.3, 1.6], gasHold: 4, overT: 4, limiter: true },
    pro: { name: 'Professional', hazards: [3, 4, 4], tMission: 40, tTyped: 60, hint: 0, par: [1.2, 1.45], gasHold: 5.5, overT: 3 }
  };
  const BAY_ART = { reactor: '⚗️', pump: '⚙️', utility: '♨️', solvent: '🧪', tank: '🛢️', rack: '🔧' };
  const LAP_BAYS = [['reactor', 'solvent'], ['pump', 'tank'], ['utility', 'rack']];
  const COL = { ground: '#1d2a25', pad: '#38414a', pad2: '#2f363d', road: '#2a2d31', line: '#d9d4c3', z40: '#9aa5b1', z20: '#F2A33C', z10: '#E0483B', brass: '#FDBE53', ink: '#ECE7D8', muted: '#9FB2C4', navy: '#0B1622' };

  /* ---------------- storage (never required) ---------------- */
  const KEY = 'pr-v1';
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { store = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* storage blocked: play on */ } };
  store.best = store.best || {}; store.log = store.log || {};
  const track = (n, p) => { try { if (window.gtag) window.gtag('event', n, p || {}); } catch (e) { /* ignore */ } };

  /* ---------------- track ---------------- */
  const CP = [[500, 1500], [900, 1500], [1300, 1500], [1700, 1500], [2100, 1500], [2400, 1420], [2520, 1200], [2520, 950], [2480, 700],
    [2330, 450], [2050, 330], [1750, 320], [1450, 330], [1280, 420], [1150, 560], [950, 560], [820, 420], [650, 330],
    [420, 340], [250, 470], [200, 750], [200, 1050], [240, 1300], [340, 1450]].map(p => [p[0] + OFF.x, p[1] + OFF.y]);

  function catmull(pts, closed, per) {
    const out = [], n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (let k = 0; k < per; k++) {
        const t = k / per, t2 = t * t, t3 = t2 * t;
        out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
      }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }
  function resample(raw, closed, step) {
    const pts = closed ? raw.concat([raw[0]]) : raw, out = [[pts[0][0], pts[0][1]]];
    let carry = 0;
    for (let i = 1; i < pts.length; i++) {
      const ax = pts[i - 1][0], ay = pts[i - 1][1], bx = pts[i][0], by = pts[i][1], len = Math.hypot(bx - ax, by - ay);
      let pos = step - carry;
      while (pos <= len) { out.push([ax + (bx - ax) * pos / len, ay + (by - ay) * pos / len]); pos += step; }
      carry = len - (pos - step);
    }
    if (closed && Math.hypot(out[out.length - 1][0] - out[0][0], out[out.length - 1][1] - out[0][1]) < step * 0.5) out.pop();
    return out;
  }
  function build(pts, closed) {
    const n = pts.length, S = [];
    let s = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      if (i > 0) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      S.push({ x: pts[i][0], y: pts[i][1], tx, ty, nx: -ty, ny: tx, s });
    }
    const L = closed ? s + Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]) : s;
    return { S, L, closed };
  }
  const MAIN = build(resample(catmull(CP, true, 24), true, 6), true);
  const L = MAIN.L, NS = MAIN.S.length;
  const nearestIdx = (T, x, y) => { let bi = 0, bd = Infinity; T.S.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; bi = i; } }); return bi; };
  // point on the centre line at distance s, interpolated between samples so motion is smooth
  function lerpPt(A, B, f) { let tx = A.tx + (B.tx - A.tx) * f, ty = A.ty + (B.ty - A.ty) * f; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; return { x: A.x + (B.x - A.x) * f, y: A.y + (B.y - A.y) * f, tx, ty, nx: -ty, ny: tx, s: A.s + ((B.s || L) - A.s) * f }; }
  const at = s => { s = ((s % L) + L) % L; let lo = 0, hi = NS - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (MAIN.S[m].s <= s) lo = m; else hi = m - 1; } const A = MAIN.S[lo], B = MAIN.S[(lo + 1) % NS], span = (lo + 1 < NS ? B.s : L) - A.s; return lerpPt(A, B, span > 0 ? (s - A.s) / span : 0); };
  const sOf = (x, y) => MAIN.S[nearestIdx(MAIN, x, y)].s;

  // shortcut across the chicane (opened in Professional mode by a correct answer)
  const SC_A = MAIN.S[nearestIdx(MAIN, 1450 + OFF.x, 330 + OFF.y)], SC_B = MAIN.S[nearestIdx(MAIN, 650 + OFF.x, 330 + OFF.y)];
  const SHORT = build(resample([[SC_A.x, SC_A.y], [SC_B.x, SC_B.y]], false, 6), false);

  // mission bays: right-hand (outside) lane
  const BAY_POS = { reactor: [900, 1500], pump: [1750, 1500], utility: [2520, 1050], solvent: [1950, 322], tank: [200, 720], rack: [215, 1180] };
  const BAYS = P.BAYS.map(b => { const p = BAY_POS[b.id], s = sOf(p[0] + OFF.x, p[1] + OFF.y); return { id: b.id, name: b.name, s }; });
  const bayById = id => BAYS.find(b => b.id === id);

  // speed zones along the lap
  const ZONES = [];
  BAYS.forEach(b => ZONES.push({ s0: b.s - 260, s1: b.s + 260, v: 20 }));
  ['solvent', 'tank'].forEach(id => { const b = bayById(id); ZONES.push({ s0: b.s - 230, s1: b.s + 230, v: 10 }); });
  const inRange = (s, a, b) => { s = ((s % L) + L) % L; a = ((a % L) + L) % L; b = ((b % L) + L) % L; return a <= b ? s >= a && s <= b : s >= a || s <= b; };
  function limitAt(s) { let v = 40; ZONES.forEach(z => { if (inRange(s, z.s0, z.s1)) v = Math.min(v, z.v); }); return v; }
  const ZONE_NAME = { 40: 'on a plant road', 20: 'in a process area', 10: 'in a classified flammable zone' };
  // ideal lap at the limit (used for the star targets)
  const IDEAL_LAP = (() => { let t = 0; for (let s = 0; s < L; s += 6) t += 6 / (limitAt(s) * KMH); return t; })();

  /* ---------------- DOM ---------------- */
  host.innerHTML = `
  <div class="pr-stage" id="pr-stage">
    <canvas id="pr-c" aria-label="Plant Rally race track" role="img"></canvas>
    <div class="pr-hud" aria-live="off">
      <div class="pr-hl"><span class="pr-lap" id="pr-lap">Lap 1/3</span><span class="pr-time" id="pr-time">0:00.0</span><span class="pr-pen" id="pr-pen"></span></div>
      <div class="pr-hc"><span class="pr-speed" id="pr-speed">0</span><span class="pr-kmh">km/h</span><span class="pr-limit" id="pr-limit">40</span></div>
      <div class="pr-hr"><span title="Safety score">Safety <b id="pr-safe">100</b></span><span class="pr-pips" id="pr-pips"><i></i><i></i><i></i></span><span title="Missions correct">Missions <b id="pr-eng">0/6</b></span><button type="button" class="pr-icon" id="pr-pause" aria-label="Pause">❚❚</button></div>
    </div>
    <div class="pr-coach" id="pr-coach" role="status"></div>
    <div class="pr-toast" id="pr-toast" role="status" aria-live="polite"></div>
    <div class="pr-touch" id="pr-touch" aria-hidden="true">
      <div class="pr-tl"><button data-k="left" aria-label="Change to left lane">◀<small>Lane</small></button><button data-k="right" aria-label="Change to right lane">▶<small>Lane</small></button></div>
      <div class="pr-tr"><button data-k="down" class="pr-brk">Brake</button><button data-k="up" class="pr-gas">Drive</button></div>
    </div>
    <div class="pr-ov" id="pr-ov"></div>
  </div>`;
  const $ = id => document.getElementById(id);
  const cv = $('pr-c'), ctx = cv.getContext('2d'), stage = $('pr-stage'), ov = $('pr-ov');
  const hud = { lap: $('pr-lap'), time: $('pr-time'), pen: $('pr-pen'), speed: $('pr-speed'), limit: $('pr-limit'), safe: $('pr-safe'), pips: $('pr-pips'), eng: $('pr-eng'), coach: $('pr-coach'), toast: $('pr-toast') };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtT = t => { t = Math.max(0, t); const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };

  /* ---------------- sizing ---------------- */
  let W = 0, H = 0, DPR = 1, ZOOM = 1;
  const touchUI = () => window.matchMedia('(pointer: coarse)').matches;
  let lastW = 0;
  function resize(e) {
    const r = stage.getBoundingClientRect();
    // phones fire resize when the address bar slides in or out: keep the game the same size unless the width changed
    if (e && e.type === 'resize' && touchUI() && Math.abs(r.width - lastW) < 2 && document.fullscreenElement !== host) return;
    lastW = r.width;
    W = Math.max(280, r.width); H = Math.max(340, Math.min(window.innerHeight * (touchUI() ? 0.78 : 0.7), 680));
    if (document.fullscreenElement === host) H = window.innerHeight;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.height = H + 'px'; stage.style.height = H + 'px';
    ZOOM = Math.max(0.68, Math.min(1, Math.min(W / 1000, H / 620)));
    stage.classList.toggle('pr-touchon', touchUI());
  }
  window.addEventListener('resize', resize);

  /* ---------------- static layer: plant, roads, signs ---------------- */
  const bg = document.createElement('canvas'); bg.width = WW; bg.height = WH;
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function strokePath(g, T, from, to) {
    g.beginPath();
    const S = T.S, n = S.length;
    if (from == null) { S.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); if (T.closed) g.closePath(); }
    else { let first = true; for (let s = from; s <= to; s += 6) { const p = at(s); if (first) { g.moveTo(p.x, p.y); first = false; } else g.lineTo(p.x, p.y); } }
    g.stroke();
    return n;
  }
  function label(g, text, x, y, size, color, align) { g.font = `600 ${size}px "IBM Plex Sans", system-ui, sans-serif`; g.fillStyle = color || COL.ink; g.textAlign = align || 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y); }
  function sign(g, x, y, v) { g.beginPath(); g.arc(x, y, 17, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 4; g.strokeStyle = v === 10 ? COL.z10 : v === 20 ? COL.z20 : '#C0392B'; g.stroke(); label(g, String(v), x, y + 1, 15, '#111'); }
  const sideOf = (s, d) => { const p = at(s); return [p.x + p.nx * d, p.y + p.ny * d]; };

  function drawStatic() {
    const g = bg.getContext('2d');
    g.fillStyle = COL.ground; g.fillRect(0, 0, WW, WH);
    // faint site grid
    g.strokeStyle = 'rgba(255,255,255,0.03)'; g.lineWidth = 1;
    for (let x = 0; x < WW; x += 100) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, WH); g.stroke(); }
    for (let y = 0; y < WH; y += 100) { g.beginPath(); g.moveTo(0, y); g.lineTo(WW, y); g.stroke(); }
    // plant pads (fictional layout)
    const pad = (x, y, w, h, c) => { g.fillStyle = c || COL.pad2; rr(g, x + OFF.x, y + OFF.y, w, h, 10); g.fill(); };
    pad(620, 1560, 560, 230); pad(1500, 1560, 480, 200); pad(2600, 880, 260, 380); pad(1720, 40, 520, 200); pad(-220, 520, 330, 430); pad(-220, 1030, 330, 300);
    pad(430, 620, 1500, 760, '#26332d'); // infield
    // buildings and equipment
    const bld = (x, y, w, h, name) => { g.fillStyle = COL.pad; rr(g, x + OFF.x, y + OFF.y, w, h, 6); g.fill(); g.strokeStyle = 'rgba(236,231,216,0.25)'; g.lineWidth = 2; g.stroke(); if (name) label(g, name, x + OFF.x + w / 2, y + OFF.y + 18, 15, COL.ink); };
    const vessel = (x, y, r, c) => { g.beginPath(); g.arc(x + OFF.x, y + OFF.y, r, 0, 7); g.fillStyle = c || '#7f8c99'; g.fill(); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2; g.stroke(); g.beginPath(); g.arc(x + OFF.x - r * 0.3, y + OFF.y - r * 0.3, r * 0.35, 0, 7); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fill(); };
    bld(660, 1590, 480, 170, 'Reactor bay'); [740, 840, 940, 1040].forEach(x => vessel(x, 1690, 30, '#9fb2c4'));
    bld(1530, 1590, 420, 140, 'Pump house'); [1600, 1680, 1760, 1840].forEach(x => { g.fillStyle = '#5b6b7a'; g.fillRect(x + OFF.x - 18, 1660 + OFF.y, 36, 22); g.beginPath(); g.arc(x + OFF.x, 1671 + OFF.y, 9, 0, 7); g.fillStyle = '#C9A227'; g.fill(); });
    bld(2630, 910, 200, 320, 'Utility block'); vessel(2730, 1010, 34, '#8a6f5a'); vessel(2730, 1120, 40, '#6f8a99'); g.fillStyle = '#222'; g.beginPath(); g.arc(2790 + OFF.x, 980 + OFF.y, 12, 0, 7); g.fill();
    bld(1750, 60, 460, 160, 'Solvent recovery'); [1830, 1910, 1990, 2070, 2150].forEach((x, i) => vessel(x, 150, i % 2 ? 18 : 24, '#b8c3cc'));
    // tank farm with bund
    g.strokeStyle = 'rgba(236,231,216,0.35)'; g.lineWidth = 4; g.strokeRect(-200 + OFF.x, 540 + OFF.y, 290, 390); label(g, 'Tank farm', -55 + OFF.x, 560 + OFF.y, 15);
    [[-140, 640], [10, 640], [-140, 800], [10, 800]].forEach(p => vessel(p[0], p[1], 52, '#a9b4bd'));
    // pipe rack across the infield
    bld(-200, 1050, 290, 260, 'Pipe rack'); for (let k = 0; k < 6; k++) { g.strokeStyle = ['#C9A227', '#9fb2c4', '#5DADE2', '#E0483B', '#9fb2c4', '#C9A227'][k]; g.lineWidth = 6; g.beginPath(); g.moveTo(-180 + OFF.x, 1100 + OFF.y + k * 30); g.lineTo(70 + OFF.x, 1100 + OFF.y + k * 30); g.stroke(); }
    g.lineWidth = 8; ['#9fb2c4', '#C9A227', '#5DADE2'].forEach((c, k) => { g.strokeStyle = c; g.beginPath(); g.moveTo(560 + OFF.x, 1000 + OFF.y + k * 26); g.lineTo(1800 + OFF.x, 1000 + OFF.y + k * 26); g.stroke(); });
    label(g, 'Main pipe rack', 1180 + OFF.x, 960 + OFF.y, 14, COL.muted);
    // cooling towers inside the chicane
    [[1000, 430], [1120, 450]].forEach(p => { g.beginPath(); g.arc(p[0] + OFF.x, p[1] + OFF.y, 42, 0, 7); g.fillStyle = '#4b5b66'; g.fill(); g.beginPath(); g.arc(p[0] + OFF.x, p[1] + OFF.y, 26, 0, 7); g.fillStyle = '#2b3a44'; g.fill(); });
    label(g, 'Cooling towers', 1060 + OFF.x, 372 + OFF.y, 13, COL.muted);
    bld(700, 700, 300, 200, 'QC lab'); bld(1150, 700, 360, 200, 'Warehouse'); bld(1600, 700, 300, 200, 'Control room');
    bld(2050, 650, 300, 500, 'Production block'); [2120, 2280].forEach(x => [800, 950, 1100].forEach(y => vessel(x, y, 26, '#9fb2c4')));
    // shortcut road (gate drawn live)
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = '#1a1c1f'; g.lineWidth = (WALL) * 2; strokePath(g, SHORT);
    g.strokeStyle = COL.road; g.lineWidth = HALF * 2 - 10; strokePath(g, SHORT);
    // main road: kerb, zone colour, asphalt
    g.strokeStyle = '#15171a'; g.lineWidth = WALL * 2 + 6; strokePath(g, MAIN);
    g.strokeStyle = COL.z40; g.lineWidth = HALF * 2 + 10; strokePath(g, MAIN);
    ZONES.slice().sort((a, b) => b.v - a.v).forEach(z => { g.strokeStyle = z.v === 10 ? COL.z10 : COL.z20; g.lineWidth = HALF * 2 + 10; g.lineCap = 'butt'; strokePath(g, MAIN, z.s0, z.s1); });
    g.lineCap = 'round';
    g.strokeStyle = COL.road; g.lineWidth = HALF * 2; strokePath(g, MAIN);
    // centre line
    g.setLineDash([22, 22]); g.strokeStyle = 'rgba(217,212,195,0.55)'; g.lineWidth = 2; strokePath(g, MAIN); g.setLineDash([]);
    // start line (chequered)
    const s0 = at(0); for (let k = -4; k < 4; k++) for (let j = 0; j < 2; j++) { g.fillStyle = (k + j) % 2 ? '#fff' : '#111'; const cx = s0.x + s0.nx * (k * 11 + 5.5) + s0.tx * (j * 11 - 5.5), cy = s0.y + s0.ny * (k * 11 + 5.5) + s0.ty * (j * 11 - 5.5); g.save(); g.translate(cx, cy); g.rotate(Math.atan2(s0.ty, s0.tx)); g.fillRect(-5.5, -5.5, 11, 11); g.restore(); }
    // zone signs at each change of limit
    let prev = limitAt(L - 6);
    for (let s = 0; s < L; s += 6) { const v = limitAt(s); if (v !== prev) { const p = sideOf(s, -(WALL + 26)); sign(g, p[0], p[1], v); prev = v; } }
    // mission boxes (all bays)
    BAYS.forEach(b => {
      const c = at(b.s), ang = Math.atan2(c.ty, c.tx);
      g.save(); g.translate(c.x + c.nx * HALF / 2, c.y + c.ny * HALF / 2); g.rotate(ang);
      g.strokeStyle = COL.brass; g.lineWidth = 3; g.setLineDash([10, 6]); g.strokeRect(-34, -HALF / 2 + 3, 68, HALF - 6); g.setLineDash([]);
      g.restore();
    });
  }

  /* ---------------- input: speed and lane only (the car follows the road) ---------------- */
  const keys = { up: 0, down: 0 };
  const LANE = 22;
  function lane(dir) { if (G.car && (G.state === 'race' || G.state === 'countdown')) G.car.dT = dir < 0 ? -LANE : LANE; }
  const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'down' };
  const typing = e => e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  window.addEventListener('keydown', e => {
    if (typing(e)) return;
    if (G.state === 'mission' && /^Digit[1-4]$/.test(e.code)) { const b = ov.querySelectorAll('.pr-ch')[+e.code.slice(5) - 1]; if (b) b.click(); e.preventDefault(); return; }
    if ((e.code === 'KeyP' || e.code === 'Escape') && (G.state === 'race' || G.state === 'paused')) { togglePause(); e.preventDefault(); return; }
    if (G.state === 'menu' || G.state === 'done') return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { lane(-1); e.preventDefault(); return; }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { lane(1); e.preventDefault(); return; }
    const k = KEYMAP[e.code]; if (k) { keys[k] = 1; e.preventDefault(); }
  });
  window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys[k] = 0; });
  // touch: lane buttons are taps, Drive and Brake are held (multi-touch)
  const pads = $('pr-touch');
  const held = new Map();
  pads.addEventListener('pointerdown', e => {
    const b = e.target.closest('button[data-k]'); if (!b) return; e.preventDefault();
    const k = b.dataset.k; audio();
    if (k === 'left' || k === 'right') { lane(k === 'left' ? -1 : 1); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 150); return; }
    held.set(e.pointerId, k); keys[k] = 1; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
  });
  const lift = e => { const k = held.get(e.pointerId); if (!k) return; held.delete(e.pointerId); if (![...held.values()].includes(k)) keys[k] = 0; pads.querySelectorAll(`[data-k="${k}"]`).forEach(b => b.classList.remove('on')); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => pads.addEventListener(t, lift));
  pads.addEventListener('contextmenu', e => e.preventDefault());
  $('pr-pause').addEventListener('click', () => togglePause());
  const L_KEY = () => (touchUI() ? '◀' : '←'), R_KEY = () => (touchUI() ? '▶' : '→'), BRAKE = () => (touchUI() ? 'Brake' : '↓');

  /* ---------------- sound (Web Audio, generated) ---------------- */
  let AC = null, eng = null, muted = !!store.mute;
  function audio() {
    if (AC || muted) return;
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.value = 40; g.gain.value = 0; o.connect(g); g.connect(AC.destination); o.start(); eng = { o, g }; } catch (e) { AC = null; }
  }
  function beep(f, d, type, vol) { if (!AC || muted) return; try { const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'square'; o.frequency.value = f; g.gain.value = vol || 0.05; g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + d); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + d); } catch (e) { /* ignore */ } }
  const sfx = { ok: () => { beep(660, 0.12, 'sine', 0.08); setTimeout(() => beep(990, 0.18, 'sine', 0.08), 110); }, bad: () => beep(140, 0.35, 'sawtooth', 0.07), warn: () => beep(880, 0.08, 'square', 0.03), viol: () => { beep(520, 0.2, 'square', 0.06); setTimeout(() => beep(390, 0.3, 'square', 0.06), 200); }, go: () => beep(1046, 0.25, 'sine', 0.08), tick: () => beep(523, 0.1, 'sine', 0.06) };

  /* ---------------- game state ---------------- */
  const G = { state: 'menu', mode: 'student' };
  let DATA = null;

  function newRace(mode) {
    const M = MODES[mode], seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, R = P.rng(seed);
    Object.assign(G, {
      mode, M, seed, R, state: 'countdown', count: 3.2, t: 0, pen: 0, lap: 1, lapDist: 0, lapStart: 0, laps: [],
      car: { s: 0, d: LANE, dT: LANE, v: 0, x: 0, y: 0, a: 0, onShort: false, u: 0, flash: 0 },
      viol: [], safety: 100, over: 0, overWarn: 0, bonus: 0, hints: M.hint, missions: [], done: {}, cur: null, gateOpen: false,
      hazards: [], ghost: (store.best[mode] && store.best[mode].ghost) || null, rec: [], recT: 0, toastT: 0, kmh: 0, limitNow: 40
    });
    place(G.car);
    // missions for this race: one per unit, preferring missions missed before
    G.plan = {};
    BAYS.forEach(b => {
      const ids = P.IDS.filter(id => P.M[id].bay === b.id), missed = ids.filter(id => store.log[id] === 'm');
      G.plan[b.id] = missed.length && R() < 0.7 ? missed[Math.floor(R() * missed.length)] : ids[Math.floor(R() * ids.length)];
    });
    makeHazards();
    resize();
    track('rally_start', { mode });
  }
  const activeBays = () => (LAP_BAYS[G.lap - 1] || []).filter(id => !G.done[id]);

  /* ---------------- hazards ---------------- */
  const HZ = {
    spill: { len: 80, name: 'Solvent spill' }, steam: { len: 70, name: 'Steam leak' }, gas: { len: 140, name: 'Gas alarm' },
    permit: { len: 110, name: 'Hot work barricade' }, fork: { len: 40, name: 'Forklift crossing' }
  };
  function makeHazards() {
    const R = G.R, n = G.M.hazards[Math.min(G.lap, G.M.hazards.length) - 1], out = [], types = Object.keys(HZ);
    const blocked = s => BAYS.some(b => inRange(s, b.s - 260, b.s + 140)) || inRange(s, L - 260, 380) || inRange(s, SC_A.s - 60, SC_B.s + 60);
    for (let k = 0, tries = 0; k < n && tries < 400; tries++) {
      const t = types[Math.floor(R() * types.length)], len = HZ[t].len, s0 = R() * L;
      if (blocked(s0) || blocked(s0 + len)) continue;
      if (out.some(h => Math.abs(((h.s0 - s0 + L * 1.5) % L) - L / 2) < (G.mode === 'pro' ? 320 : 500))) continue;
      if (out.filter(h => h.type === t).length >= (G.mode === 'pro' ? 2 : 1)) continue;
      out.push({ type: t, s0, s1: s0 + len, side: R() < 0.5 ? 1 : -1, hit: false, state: 'idle', timer: 0, f: R() * 6, seen: false });
      k++;
    }
    G.hazards = out;
  }
  // lateral band occupied by a hazard (d measured from the centre line, + = right lane)
  function band(h) {
    if (h.type === 'gas') return [-WALL, WALL];
    if (h.type === 'fork') { const d = forkD(h); return [d - 22, d + 22]; }
    if (h.type === 'spill') return h.side > 0 ? [-4, HALF + 8] : [-HALF - 8, 4];
    if (h.type === 'steam') return h.side > 0 ? [2, WALL] : [-WALL, -2];
    return h.side > 0 ? [0, WALL] : [-WALL, 0]; // barricade
  }
  function forkD(h) { const span = WALL + 40, per = 8, ph = ((G.t + h.f) % per) / per; const u = ph < 0.16 ? ph / 0.16 : ph < 0.5 ? 1 : ph < 0.66 ? 1 - (ph - 0.5) / 0.16 : 0; return -span + 2 * span * u; } // crosses in about 1.3 s, then waits off the road for about 2.7 s
  const forkOnRoad = h => Math.abs(forkD(h)) < WALL + 14;

  function violation(text) {
    G.viol.push({ text, t: G.t, lap: G.lap }); G.safety = Math.max(0, 100 - VIOL_PTS * G.viol.length);
    toast('⚠ Safety violation: ' + text + (G.viol.length < VIOL_MAX ? ` (${G.viol.length} of ${VIOL_MAX})` : ''), 'bad', 3); sfx.viol(); G.car.flash = 0.6;
    track('rally_violation', { what: text });
    if (G.viol.length >= VIOL_MAX) finish(true);
  }
  const ahead = s => { let d = ((s - G.car.s) % L + L) % L; if (d > L / 2) d -= L; return d; };

  /* ---------------- motion: the car follows the road; you set speed and lane ---------------- */
  function place(c) {
    let p;
    if (c.onShort) { const n = SHORT.S.length - 1, f = Math.max(0, Math.min(n, c.u / (SHORT.L / n))), i = Math.min(n - 1, Math.floor(f)); p = lerpPt(SHORT.S[i], SHORT.S[i + 1], f - i); }
    else p = at(c.s);
    c.x = p.x + p.nx * c.d; c.y = p.y + p.ny * c.d;
    c.a = Math.atan2(p.ty, p.tx) + Math.max(-0.45, Math.min(0.45, (c.dT - c.d) * 0.025));
  }
  function step(dt) {
    const c = G.car, M = G.M;
    const zl = c.onShort ? 40 : limitAt(c.s), top = M.limiter ? zl * KMH : 60 * KMH;
    if (keys.up && c.v < top) c.v = Math.min(top, c.v + 220 * dt); else if (keys.down) c.v -= 520 * dt; else if (c.v > top) c.v -= 320 * dt; else if (!keys.up) c.v -= 60 * dt;
    c.v = Math.max(0, Math.min(60 * KMH, c.v));
    const dd = c.dT - c.d; c.d += Math.sign(dd) * Math.min(Math.abs(dd), 120 * dt);
    const move = c.v * dt;
    if (c.onShort) {
      c.u += move; G.lapDist += move * (SC_B.s - SC_A.s) / SHORT.L;
      c.s = SC_A.s + (SC_B.s - SC_A.s) * Math.min(1, c.u / SHORT.L);
      if (c.u >= SHORT.L) { c.onShort = false; c.s = SC_B.s; }
    } else {
      const toA = ((SC_A.s - c.s) % L + L) % L;
      if (G.gateOpen && toA > 0 && toA <= move) { c.onShort = true; c.u = move - toA; c.s = SC_A.s; G.lapDist += toA; toast('Shortcut: the gate is open for you', 'good', 1.6); }
      else { c.s = (c.s + move) % L; G.lapDist += move; }
    }
    place(c);

    const kmh = c.v / KMH, lim = c.onShort ? 40 : limitAt(c.s);
    G.kmh = kmh; G.limitNow = lim;
    // speed zones: staying over the limit (2 km/h grace) is a violation
    if (kmh > lim + 2) { G.over += dt; G.overWarn -= dt; if (G.overWarn <= 0) { sfx.warn(); G.overWarn = 0.5; } if (G.over >= M.overT) { G.over = 0; violation(`over ${lim} km/h ${ZONE_NAME[lim]}`); } }
    else G.over = Math.max(0, G.over - dt * 1.5);

    // hazards
    G.hazards.forEach(h => {
      const a0 = ahead(h.s0);
      if (a0 < 700 && a0 > -HZ[h.type].len - 50) h.seen = true;
      if (h.type === 'gas') {
        if (h.state === 'idle' && a0 < 420 && a0 > 0) { h.state = 'alarm'; h.timer = M.gasHold; sfx.viol(); }
        if (h.state === 'alarm') { h.timer -= dt; if (h.timer <= 0) { h.state = 'clear'; toast('All clear: drive on', 'good', 1.6); } }
      }
      if (c.onShort || h.hit || !inRange(c.s, h.s0, h.s1)) return;
      const b = band(h);
      if (c.d < b[0] - 9 || c.d > b[1] + 9) return;
      if (h.type === 'gas') { if (h.state === 'alarm') { h.hit = true; violation('drove into a gas alarm area'); } return; }
      if (h.type === 'spill') { if (kmh > 10.5) { h.hit = true; violation('drove through a solvent spill'); } return; }
      h.hit = true;
      if (h.type === 'steam') violation('drove into a steam leak');
      if (h.type === 'permit') { violation('broke a hot work barricade'); c.v = 0; }
      if (h.type === 'fork') { violation('did not give way to a forklift'); c.v = 0; }
    });

    // the car pulls in by itself at each mission unit of this lap
    activeBays().forEach(id => {
      if (G.state !== 'race' || c.onShort) return;
      const a = ahead(bayById(id).s);
      if (a <= 4 && a > -60) { c.v = 0; openMission(id); }
    });

    // laps
    if (G.lapDist >= L) {
      G.lapDist -= L;
      const lt = G.t - G.lapStart; G.laps.push(lt);
      (LAP_BAYS[G.lap - 1] || []).forEach(id => { if (!G.done[id]) { G.done[id] = 'skip'; G.missions.push({ bay: id, id: G.plan[id], result: 'skip' }); } });
      const best = store.best[G.mode] || {};
      if (G.rec.length && (!best.lap || lt < best.lap)) { best.lap = lt; best.ghost = G.rec; store.best[G.mode] = best; save(); }
      G.rec = []; G.recT = 0; G.lapStart = G.t;
      if (G.lap >= LAPS) { finish(false); return; }
      G.lap++; G.gateOpen = false; makeHazards();
      toast(`Lap ${G.lap} of ${LAPS}`, 'info', 1.8);
    }
    G.recT -= dt; if (G.recT <= 0) { G.recT = 0.1; G.rec.push([Math.round(c.x), Math.round(c.y), +c.a.toFixed(2)]); }
  }

  /* ---------------- the one-line coach: what to do right now ---------------- */
  function coach() {
    const c = G.car, kmh = G.kmh || 0;
    if (G.state === 'countdown') return [touchUI() ? 'Get ready: hold Drive to go' : 'Get ready: hold ↑ to go', 'info'];
    if (kmh > G.limitNow + 2) return [`Too fast: slow down to ${G.limitNow} km/h (${BRAKE()})`, 'bad'];
    let best = null;
    const put = (pri, text, kind) => { if (!best || pri < best[0]) best = [pri, text, kind]; };
    G.hazards.forEach(h => {
      const a = ahead(h.s0), len = HZ[h.type].len;
      if (a < -len - 10 || a > 420 || c.onShort) return;
      if (h.type === 'gas') {
        if (h.state === 'alarm') put(1, a > 0 ? `Gas alarm: stop before the red line and wait (${Math.ceil(h.timer)} s)` : 'Gas alarm: keep going', 'bad');
        return;
      }
      if (h.type === 'fork') { if (a > -len) put(2, forkOnRoad(h) ? `Forklift crossing: stop and give way (${BRAKE()})` : 'Forklift clear: go now', forkOnRoad(h) ? 'warn' : 'good'); return; }
      const mine = (h.side > 0) === (c.dT > 0);
      if (mine) put(1, `${HZ[h.type].name} in your lane: change lane (${h.side > 0 ? L_KEY() : R_KEY()})`, 'bad');
      else put(4, `${HZ[h.type].name} in the other lane: stay in this lane`, 'good');
    });
    if (best) return [best[1], best[2]];
    for (let s = 6; s < 260; s += 6) { const v = limitAt(c.s + s); if (v < G.limitNow) return G.M.limiter ? [`${v} km/h zone ahead: your speed limiter slows the car`, 'info'] : [`${v} km/h zone ahead: slow down (${BRAKE()})`, 'warn']; }
    const nx = activeBays().map(id => ({ id, a: ahead(bayById(id).s) })).filter(x => x.a > 0).sort((p, q) => p.a - q.a)[0];
    if (nx && nx.a < 600) return [`${bayById(nx.id).name} ahead: the car stops there for a mission`, 'info'];
    if (nx) return [`Keep to the limit. Next mission: ${bayById(nx.id).name}`, 'plain'];
    return [G.lap < LAPS ? 'Missions done for this lap: drive on to the start line' : 'Last lap: bring it home safely', 'plain'];
  }

  /* ---------------- missions ---------------- */
  function openMission(bayId) {
    const id = G.plan[bayId], o = P.make(id, (G.seed + bayId.length * 7919 + G.lap * 104729) >>> 0, DATA);
    const M = G.M, typed = G.mode === 'pro' && o.typed;
    G.cur = { bay: bayId, o, typed, left: typed ? M.tTyped : M.tMission, total: typed ? M.tTyped : M.tMission, t0: G.t, hinted: false };
    G.state = 'mission'; G.car.v = 0; G.kmh = 0;
    Object.keys(keys).forEach(k => { keys[k] = 0; });
    const b = bayById(bayId);
    ov.innerHTML = `<div class="pr-card pr-mission" role="dialog" aria-modal="true" aria-labelledby="pr-mt">
      <div class="pr-mhead"><span>${BAY_ART[bayId]} ${esc(b.name)} · mission ${G.missions.length + 1} of 6</span><span id="pr-mleft"></span></div>
      <div class="pr-mbar"><i id="pr-mbar"></i></div>
      <h3 id="pr-mt">${esc(o.title)}</h3>
      <p class="pr-q">${o.q}</p>
      <p class="pr-rule">${typed ? 'Type your answer.' : 'Pick the right answer.'} Right: −${BONUS} s · Wrong: +${PENALTY} s</p>
      ${typed ? `<form class="pr-typed" id="pr-form"><input id="pr-in" inputmode="decimal" autocomplete="off" placeholder="Your answer" aria-label="Your answer"><span>${esc(o.unit)}</span><button type="submit" class="pr-btn">Submit</button></form><p class="pr-small">Within ±3 % counts as correct.</p>`
        : `<div class="pr-chs">${o.choices.map((c, i) => `<button type="button" class="pr-ch" data-i="${i}"><b>${i + 1}</b> ${esc(c)}</button>`).join('')}</div>`}
      <div class="pr-mfoot">${G.hints > 0 ? `<button type="button" class="pr-link" id="pr-hint">Show the formula (${G.hints} hint left)</button>` : ''}<button type="button" class="pr-link" id="pr-skip">Skip this mission</button></div>
      <p class="pr-hinttext" id="pr-hinttext" hidden></p>
    </div>`;
    ov.classList.add('show');
    ov.querySelectorAll('.pr-ch').forEach(bt => bt.addEventListener('click', () => answer(+bt.dataset.i)));
    const f = $('pr-form'); if (f) { f.addEventListener('submit', e => { e.preventDefault(); answer(null, $('pr-in').value); }); setTimeout(() => { try { $('pr-in').focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 60); }
    const hb = $('pr-hint'); if (hb) hb.addEventListener('click', () => { if (G.hints <= 0 || G.cur.hinted) return; G.hints--; G.cur.hinted = true; const t = $('pr-hinttext'); t.textContent = o.hint; t.hidden = false; hb.remove(); });
    $('pr-skip').addEventListener('click', () => answer(-1));
  }
  function answer(i, typed) {
    const cur = G.cur; if (!cur || G.state !== 'mission') return;
    const o = cur.o, timeout = i === -2, skipped = i === -1;
    const ok = !timeout && !skipped && (typed != null ? P.check(o, typed) : i === o.correct);
    const yours = timeout ? 'No answer in time' : skipped ? 'Skipped' : typed != null ? (typed || '(blank)') + (o.unit ? ' ' + o.unit : '') : o.choices[i];
    G.done[cur.bay] = ok ? 'ok' : 'bad';
    G.missions.push({ bay: cur.bay, id: o.id, result: ok ? 'ok' : skipped ? 'skip' : 'bad', o, yours, secs: G.t - cur.t0 });
    store.log[o.id] = ok ? 's' : 'm'; save();
    track('rally_mission', { mission: o.id, correct: ok, seconds: Math.round(G.t - cur.t0), mode: G.mode });
    let msg;
    if (ok) { G.bonus += BONUS; msg = `−${BONUS} s off your time.`;
      if (G.mode === 'pro' && inRange(SC_A.s, G.car.s, G.car.s + L * 0.6) && !G.gateOpen) { G.gateOpen = true; msg += ' The shortcut past the cooling towers is open on this lap.'; }
      sfx.ok(); }
    else { if (!skipped) G.pen += PENALTY; msg = skipped ? 'No time added for a skip.' : `+${PENALTY} s added.`; sfx.bad(); }
    const right = o.typed ? o.fmt(o.num) : o.choices[o.correct];
    ov.innerHTML = `<div class="pr-card pr-fb ${ok ? 'good' : 'bad'}" role="dialog" aria-modal="true" aria-labelledby="pr-fbh">
      <h3 id="pr-fbh">${ok ? 'Correct' : skipped ? 'Skipped' : timeout ? 'Out of time' : 'Not quite'}</h3>
      <p class="pr-fbline">${ok ? '' : `Your answer: ${esc(yours)}<br>`}Correct answer: <b>${esc(right)}</b><br>${esc(msg)}</p>
      <div class="pr-sol"><h4>Solution</h4><p>${o.why}</p><a href="${esc(o.calc)}" target="_blank" rel="noopener">Try it in the ${esc(P.M[o.id].calcName)}</a></div>
      <p class="pr-small">The race clock is paused while you read.</p>
      <button type="button" class="pr-btn" id="pr-go">Drive on</button></div>`;
    ov.scrollTop = 0;
    const go = () => { ov.classList.remove('show'); ov.innerHTML = ''; G.cur = null; G.state = 'race'; updateHud(true); };
    $('pr-go').addEventListener('click', go);
    try { $('pr-go').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    G.state = 'missionfb';
  }

  /* ---------------- finish ---------------- */
  function stars(v, a, b) { return v <= a ? 3 : v <= b ? 2 : 1; }
  function finish(incident) {
    if (G.state === 'done') return;
    G.state = 'done';
    if (eng) eng.g.gain.value = 0;
    const total = Math.max(0, G.t + G.pen - G.bonus), M = G.M;
    // any bay not visited yet counts as skipped
    BAYS.forEach(b => { if (!G.done[b.id]) G.missions.push({ bay: b.id, id: G.plan[b.id], result: 'skip' }); });
    const ok = G.missions.filter(m => m.result === 'ok').length;
    const par = IDEAL_LAP * LAPS + 6 * 10 - 6 * BONUS;
    const st = incident ? null : { time: stars(total, par * M.par[0], par * M.par[1]), safety: G.viol.length === 0 ? 3 : G.viol.length === 1 ? 2 : 1, eng: ok >= 6 ? 3 : ok >= 4 ? 2 : 1 };
    const best = store.best[G.mode] || {}, rec = !incident && (!best.time || total < best.time);
    if (rec) { best.time = total; store.best[G.mode] = best; save(); }
    track(incident ? 'rally_incident' : 'rally_finish', { mode: G.mode, time: Math.round(total), safety: G.safety, engineering: ok });
    const star = n => '★★★'.slice(0, n) + '<span class="pr-off">' + '★★★'.slice(0, 3 - n) + '</span>';
    const bestLap = G.laps.length ? Math.min(...G.laps) : null;
    const review = G.missions.map(m => {
      const def = P.M[m.id], o = m.o, b = bayById(m.bay);
      const head = `<span class="pr-rmark ${m.result}">${m.result === 'ok' ? '✓' : m.result === 'bad' ? '✗' : '–'}</span> <b>${esc(b.name)}</b>: ${esc(def.title)}`;
      if (!o) return `<li><div class="pr-rh">${head} <span class="pr-muted">not attempted</span></div><a href="${esc((P.make(m.id, 1, DATA).calc || '').split('#')[0])}" target="_blank" rel="noopener">Open the ${esc(def.calcName)}</a></li>`;
      const right = o.typed ? o.fmt(o.num) : o.choices[o.correct];
      return `<li><details ${m.result === 'bad' ? 'open' : ''}><summary class="pr-rh">${head}</summary><p class="pr-q">${o.q}</p><p>Your answer: ${esc(m.yours)}${m.result !== 'ok' ? ' · Correct: <b>' + esc(right) + '</b>' : ''}</p><p class="pr-why">${o.why}</p><a href="${esc(o.calc)}" target="_blank" rel="noopener" data-calc="${esc(o.id)}">Work it in the ${esc(def.calcName)}</a></details></li>`;
    }).join('');
    const share = `Plant Rally (${M.name}) ${incident ? 'incident' : fmtT(total)} · safety ${G.safety} · missions ${ok}/6 · pharmacheme.in/games/plant-rally/`;
    ov.innerHTML = `<div class="pr-card pr-result">
      <h2>${incident ? 'Incident: shift stopped' : 'Shift complete'}${rec ? ' <span class="pr-rec">New best</span>' : ''}</h2>
      ${incident ? `<p>Three safety violations end the race. Fast never beats safe on a plant.</p>` : ''}
      <div class="pr-scores">
        <div><span>Time</span><b>${incident ? '–' : fmtT(total)}</b>${st ? `<em>${star(st.time)}</em>` : ''}<small>${[G.bonus ? '−' + G.bonus + ' s right answers' : '', G.pen ? '+' + G.pen + ' s wrong' : ''].filter(Boolean).join(', ')}</small></div>
        <div><span>Safety</span><b>${G.safety}</b>${st ? `<em>${star(st.safety)}</em>` : ''}<small>${G.viol.length} violation${G.viol.length === 1 ? '' : 's'}</small></div>
        <div><span>Missions</span><b>${ok}/6</b>${st ? `<em>${star(st.eng)}</em>` : ''}<small>${M.name} mode</small></div>
      </div>
      <p class="pr-small">${bestLap ? 'Best lap ' + fmtT(bestLap) + ' · ' : ''}${best.time ? 'Your best ' + fmtT(best.time) : ''}</p>
      ${G.viol.length ? `<h3>Violations</h3><ul class="pr-viol">${G.viol.map(v => `<li>Lap ${v.lap}: ${esc(v.text)}</li>`).join('')}</ul>` : ''}
      <h3>Mission review</h3><ul class="pr-review">${review}</ul>
      <div class="pr-actions"><button type="button" class="pr-btn" id="pr-again">Race again</button><button type="button" class="pr-btn pr-ghostbtn" id="pr-menu">Change mode</button><button type="button" class="pr-btn pr-ghostbtn" id="pr-copy">Copy result</button></div>
    </div>`;
    ov.classList.add('show'); ov.scrollTop = 0;
    $('pr-again').addEventListener('click', () => start(G.mode));
    $('pr-menu').addEventListener('click', menu);
    $('pr-copy').addEventListener('click', e => { const bt = e.target; (navigator.clipboard ? navigator.clipboard.writeText(share) : Promise.reject()).then(() => { bt.textContent = 'Copied'; }, () => { window.prompt('Copy your result:', share); }); });
    ov.querySelectorAll('a[data-calc]').forEach(a => a.addEventListener('click', () => track('rally_calc_click', { mission: a.dataset.calc })));
  }

  /* ---------------- HUD ---------------- */
  let hudT = 0, lastHud = {};
  function setText(el, k, v) { if (lastHud[k] !== v) { lastHud[k] = v; el.textContent = v; } }
  function updateHud(force) {
    if (!force && (hudT -= 1) > 0) return; hudT = 5;
    setText(hud.lap, 'lap', `Lap ${G.lap}/${LAPS}`);
    setText(hud.time, 'time', fmtT(G.t));
    const net = G.pen - G.bonus; setText(hud.pen, 'pen', net > 0 ? `+${net} s` : net < 0 ? `−${-net} s` : '');
    hud.pen.className = 'pr-pen ' + (net < 0 ? 'good' : '');
    setText(hud.speed, 'speed', String(Math.round(G.kmh || 0)));
    setText(hud.limit, 'limit', String(G.limitNow || 40));
    const over = (G.kmh || 0) > (G.limitNow || 40) + 2;
    hud.speed.parentNode.classList.toggle('over', over);
    hud.limit.className = 'pr-limit z' + (G.limitNow || 40);
    setText(hud.safe, 'safe', String(G.safety));
    [...hud.pips.children].forEach((p, i) => p.classList.toggle('on', i < G.viol.length));
    setText(hud.eng, 'eng', `${G.missions.filter(m => m.result === 'ok').length}/6`);
    const k = coach(); if (lastHud.coach !== k[0]) { lastHud.coach = k[0]; hud.coach.textContent = k[0]; } hud.coach.className = 'pr-coach ' + k[1];
  }
  function toast(text, kind, secs) { hud.toast.textContent = text; hud.toast.className = 'pr-toast show ' + (kind || ''); G.toastT = secs || 2; }

  /* ---------------- drawing ---------------- */
  function drawCar(x, y, a, ghost, flash) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    if (ghost) ctx.globalAlpha = 0.35;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; rr(ctx, -16, -8, 36, 20, 5); ctx.fill();
    ctx.fillStyle = ghost ? '#9fb2c4' : '#F4F1EA'; rr(ctx, -18, -10, 36, 20, 5); ctx.fill();
    if (!ghost) { ctx.fillStyle = '#D8352C'; ctx.fillRect(-18, -2.5, 36, 5); ctx.fillStyle = '#1b2a3a'; rr(ctx, 4, -8, 9, 16, 2); ctx.fill();
      const on = Math.floor(G.t * 6) % 2; ctx.fillStyle = on ? '#3B82F6' : '#D8352C'; ctx.fillRect(-6, -9, 5, 8); ctx.fillStyle = on ? '#D8352C' : '#3B82F6'; ctx.fillRect(-6, 1, 5, 8);
      if (flash > 0) { ctx.strokeStyle = 'rgba(224,72,59,' + flash + ')'; ctx.lineWidth = 4; rr(ctx, -22, -14, 44, 28, 8); ctx.stroke(); } }
    ctx.restore();
  }
  function drawHazard(h) {
    const len = HZ[h.type].len, b = band(h);
    const quad = (d0, d1, fill) => { ctx.beginPath(); for (let s = h.s0; s <= h.s0 + len; s += 10) { const p = at(s); ctx.lineTo(p.x + p.nx * d0, p.y + p.ny * d0); } for (let s = h.s0 + len; s >= h.s0; s -= 10) { const p = at(s); ctx.lineTo(p.x + p.nx * d1, p.y + p.ny * d1); } ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
    const mid = at(h.s0 + len / 2);
    if (h.type === 'spill') {
      quad(b[0] + 6, b[1] - 8, 'rgba(120,90,200,0.55)');
      ctx.save(); ctx.globalAlpha = 0.5 + 0.2 * Math.sin(G.t * 3); quad(b[0] + 14, b[1] - 16, 'rgba(190,220,255,0.35)'); ctx.restore();
      if (!h.rep) tag(mid, h.side * (WALL + 40), 'Spill', '#a78bfa');
    } else if (h.type === 'steam') {
      const c = sideOfP(mid, h.side * (HALF * 0.75));
      for (let k = 0; k < 6; k++) { const r = 26 + 10 * Math.sin(G.t * 2 + k), ox = Math.cos(k * 1.7 + G.t) * 22, oy = Math.sin(k * 2.3 + G.t * 1.3) * 22; ctx.beginPath(); ctx.arc(c[0] + ox, c[1] + oy, r, 0, 7); ctx.fillStyle = 'rgba(240,244,248,0.28)'; ctx.fill(); }
      tag(mid, h.side * (WALL + 40), 'Steam leak', '#e5e7eb');
    } else if (h.type === 'gas') {
      const on = h.state === 'alarm', blink = Math.floor(G.t * 4) % 2;
      if (on) quad(-HALF, HALF, blink ? 'rgba(224,72,59,0.32)' : 'rgba(224,72,59,0.18)');
      const p0 = at(h.s0);
      ctx.strokeStyle = on ? '#E0483B' : h.state === 'clear' ? '#4CD97B' : 'rgba(224,72,59,0.6)'; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
      ctx.beginPath(); ctx.moveTo(p0.x - p0.nx * HALF, p0.y - p0.ny * HALF); ctx.lineTo(p0.x + p0.nx * HALF, p0.y + p0.ny * HALF); ctx.stroke(); ctx.setLineDash([]);
      [-1, 1].forEach(sd => { const q = sideOfP(p0, sd * (WALL + 6)); ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, 7); ctx.fillStyle = on ? (blink ? '#ff5a4a' : '#7a1e18') : h.state === 'clear' ? '#4CD97B' : '#555'; ctx.fill(); });
      tag(at(h.s0 - 30), -(WALL + 46), on ? `GAS ALARM ${Math.ceil(h.timer)}` : h.state === 'clear' ? 'All clear' : 'Gas detectors', on ? '#ff8a7a' : '#9FB2C4');
    } else if (h.type === 'permit') {
      quad(b[0] + 2, b[1] - (h.side > 0 ? 14 : -14) * 0, 'rgba(242,163,60,0.18)');
      for (let s = h.s0; s <= h.s0 + len; s += 18) { const p = at(s), x0 = p.x + p.nx * (h.side > 0 ? 2 : -2), y0 = p.y + p.ny * (h.side > 0 ? 2 : -2), x1 = p.x + p.nx * h.side * HALF, y1 = p.y + p.ny * h.side * HALF; ctx.strokeStyle = (Math.round(s / 18) % 2) ? '#111' : '#F2C230'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
      tag(mid, h.side * (WALL + 44), 'Hot work permit', '#F2C230');
    } else if (h.type === 'fork') {
      const p = at(h.s0 + len / 2), d = forkD(h), x = p.x + p.nx * d, y = p.y + p.ny * d;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(p.ny, p.nx)); ctx.fillStyle = '#F2A33C'; rr(ctx, -16, -12, 32, 24, 4); ctx.fill(); ctx.fillStyle = '#333'; ctx.fillRect(16, -10, 10, 4); ctx.fillRect(16, 6, 10, 4); ctx.fillStyle = '#111'; ctx.fillRect(-8, -7, 10, 14); ctx.restore();
      const z = at(h.s0 - 60); ctx.save(); ctx.translate(...sideOfP(z, -(WALL + 30))); ctx.fillStyle = '#F2C230'; ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(15, 12); ctx.lineTo(-15, 12); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#111'; ctx.font = '700 14px system-ui'; ctx.textAlign = 'center'; ctx.fillText('!', 0, 8); ctx.restore();
    }
  }
  const sideOfP = (p, d) => [p.x + p.nx * d, p.y + p.ny * d];
  function tag(p, d, text, color) { const q = sideOfP(p, d); ctx.font = '600 13px "IBM Plex Sans", system-ui, sans-serif'; const w = ctx.measureText(text).width + 14; ctx.fillStyle = 'rgba(11,22,34,0.82)'; rr(ctx, q[0] - w / 2, q[1] - 11, w, 22, 6); ctx.fill(); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, q[0], q[1] + 1); }

  function render() {
    const c = G.car;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = COL.ground; ctx.fillRect(0, 0, W, H);
    if (!c) return;
    const cam = G.cam || { x: c.x, y: c.y }, cx = cam.x, cy = cam.y;
    const vw = W / ZOOM, vh = H / ZOOM, x0 = cx - vw / 2, y0 = cy - vh / 2;
    ctx.setTransform(DPR * ZOOM, 0, 0, DPR * ZOOM, -x0 * DPR * ZOOM, -y0 * DPR * ZOOM);
    const sx = Math.max(0, Math.floor(x0)), sy = Math.max(0, Math.floor(y0)), sw = Math.min(WW - sx, Math.ceil(vw) + 2), sh = Math.min(WH - sy, Math.ceil(vh) + 2);
    if (sw > 0 && sh > 0) ctx.drawImage(bg, sx, sy, sw, sh, sx, sy, sw, sh);
    // shortcut gate
    const gp = (k) => { const p = SHORT.S[Math.min(SHORT.S.length - 1, k)]; return p; };
    [gp(11), gp(SHORT.S.length - 12)].forEach(p => {
      ctx.strokeStyle = G.gateOpen ? '#4CD97B' : '#E0483B'; ctx.lineWidth = 6; ctx.setLineDash(G.gateOpen ? [6, 10] : [14, 8]);
      ctx.beginPath(); ctx.moveTo(p.x - p.nx * (HALF - 4), p.y - p.ny * (HALF - 4)); ctx.lineTo(p.x + p.nx * (HALF - 4), p.y + p.ny * (HALF - 4)); ctx.stroke(); ctx.setLineDash([]);
    });
    tag(SHORT.S[Math.floor(SHORT.S.length / 2)], -60, G.gateOpen ? 'Shortcut open' : 'Shortcut (Pro: answer a mission right)', G.gateOpen ? '#4CD97B' : '#9FB2C4');
    // active mission boxes glow
    activeBays().forEach(id => { const b = bayById(id), p = at(b.s); ctx.save(); ctx.translate(p.x + p.nx * HALF / 2, p.y + p.ny * HALF / 2); ctx.rotate(Math.atan2(p.ty, p.tx)); ctx.fillStyle = `rgba(253,190,83,${0.25 + 0.15 * Math.sin(G.t * 5)})`; ctx.fillRect(-34, -HALF / 2 + 3, 68, HALF - 6); ctx.fillStyle = '#111'; ctx.font = '800 13px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('STOP', 0, 1); ctx.restore(); });
    G.hazards.forEach(drawHazard);
    // ghost of the best lap
    if (G.ghost && G.state !== 'menu') { const k = Math.floor((G.t - G.lapStart) * 10); const f = G.ghost[Math.min(k, G.ghost.length - 1)]; if (f && k < G.ghost.length + 20) drawCar(f[0], f[1], f[2], true); }
    drawCar(c.x, c.y, c.a, false, c.flash);
    // steam fog near the car
    const fog = G.hazards.reduce((m, h) => h.type === 'steam' && Math.abs(ahead(h.s0 + 35)) < 160 ? Math.max(m, 1 - Math.abs(ahead(h.s0 + 35)) / 160) : m, 0);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (fog > 0) { ctx.fillStyle = `rgba(235,240,245,${0.55 * fog})`; ctx.fillRect(0, 0, W, H); }
    if (G.over > 0 && (G.kmh || 0) > (G.limitNow || 40) + 2) { ctx.strokeStyle = `rgba(224,72,59,${0.35 + 0.25 * Math.sin(G.t * 12)})`; ctx.lineWidth = 10; ctx.strokeRect(5, 5, W - 10, H - 10); }
    minimap();
    if (G.state === 'countdown') { ctx.fillStyle = 'rgba(11,22,34,0.45)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = COL.brass; ctx.font = '800 72px "Big Shoulders Display", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(G.count > 0.2 ? String(Math.ceil(G.count - 0.2)) : 'GO', W / 2, H / 2); }
  }
  function minimap() {
    const mw = Math.min(150, W * 0.28), sc = mw / WW, mh = WH * sc, x = W - mw - 10, y = H - mh - (stage.classList.contains('pr-touchon') ? 120 : 10);
    ctx.fillStyle = 'rgba(11,22,34,0.7)'; rr(ctx, x - 6, y - 6, mw + 12, mh + 12, 8); ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    ctx.strokeStyle = 'rgba(236,231,216,0.6)'; ctx.lineWidth = 40; ctx.lineJoin = 'round'; ctx.beginPath(); MAIN.S.forEach((p, i) => (i % 4 === 0) && (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke();
    activeBays().forEach(id => { const p = at(bayById(id).s); ctx.beginPath(); ctx.arc(p.x, p.y, 70, 0, 7); ctx.fillStyle = COL.brass; ctx.fill(); });
    G.hazards.forEach(h => { if (!h.seen) return; const p = at(h.s0); ctx.beginPath(); ctx.arc(p.x, p.y, 50, 0, 7); ctx.fillStyle = '#E0483B'; ctx.fill(); });
    ctx.beginPath(); ctx.arc(G.car.x, G.car.y, 80, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }

  /* ---------------- loop ---------------- */
  let last = 0;
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - (last || now)) / 1000)); last = now;
    if (G.state === 'countdown') {
      const before = Math.ceil(G.count - 0.2); G.count -= dt; const after = Math.ceil(G.count - 0.2);
      if (after !== before) { if (after > 0) sfx.tick(); else sfx.go(); }
      if (G.count <= 0) G.state = 'race';
    } else if (G.state === 'race') {
      G.t += dt; step(dt);
    } else if (G.state === 'mission') {
      G.t += dt;
      if (G.state === 'mission' && G.cur) { G.cur.left -= dt; const el = $('pr-mbar'), lf = $('pr-mleft'); if (el) el.style.width = Math.max(0, 100 * G.cur.left / G.cur.total) + '%'; if (lf) lf.textContent = Math.ceil(Math.max(0, G.cur.left)) + ' s'; if (G.cur.left <= 0) answer(-2); }
      G.hazards.forEach(h => { if (h.type === 'gas' && h.state === 'alarm') { h.timer -= dt; if (h.timer <= 0) h.state = 'clear'; } });
    }
    if (G.car) { G.car.flash = Math.max(0, G.car.flash - dt); const c = G.car, tx = c.x + Math.cos(c.a) * (c.v || 0) * 0.45, ty = c.y + Math.sin(c.a) * (c.v || 0) * 0.45; if (!G.cam || G.state === 'countdown' || G.state === 'menu') G.cam = { x: tx, y: ty }; else { const k = 1 - Math.exp(-4 * dt); G.cam.x += (tx - G.cam.x) * k; G.cam.y += (ty - G.cam.y) * k; } }
    if (G.toastT > 0) { G.toastT -= dt; if (G.toastT <= 0) hud.toast.classList.remove('show'); }
    if (eng && AC) { const on = G.state === 'race' && !muted; eng.g.gain.value = on ? 0.012 + Math.min(0.02, (G.kmh || 0) / 3000) : 0; eng.o.frequency.value = 38 + (G.kmh || 0) * 1.6; }
    if (G.state !== 'menu') { updateHud(); render(); }
    requestAnimationFrame(frame);
  }

  /* ---------------- menus ---------------- */
  function togglePause() {
    if (G.state === 'race') { G.state = 'paused'; ov.innerHTML = `<div class="pr-card"><h2>Paused</h2><p>The clock is stopped.</p><div class="pr-actions"><button type="button" class="pr-btn" id="pr-resume">Resume</button><button type="button" class="pr-btn pr-ghostbtn" id="pr-quit">Quit to menu</button><button type="button" class="pr-btn pr-ghostbtn" id="pr-mute">${muted ? 'Sound on' : 'Sound off'}</button></div></div>`; ov.classList.add('show');
      $('pr-resume').addEventListener('click', togglePause); $('pr-quit').addEventListener('click', menu); $('pr-mute').addEventListener('click', e => { muted = !muted; store.mute = muted; save(); e.target.textContent = muted ? 'Sound on' : 'Sound off'; if (!muted) audio(); }); }
    else if (G.state === 'paused') { ov.classList.remove('show'); ov.innerHTML = ''; G.state = 'race'; last = 0; }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'race') togglePause(); });

  function start(mode) {
    if (!DATA) return;
    G.mode = mode; ov.classList.remove('show'); ov.innerHTML = '';
    audio(); if (AC && AC.state === 'suspended') AC.resume();
    newRace(mode); last = 0; updateHud(true);
    if (touchUI()) { try { stage.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* ignore */ } }
  }
  function menu() {
    G.state = 'menu';
    const b = m => store.best[m] && store.best[m].time ? `Your best: ${fmtT(store.best[m].time)}` : 'No time yet';
    const solved = Object.values(store.log).filter(v => v === 's').length;
    ov.innerHTML = `<div class="pr-card pr-menu">
      <h2>Plant <span>Rally</span></h2>
      <p>Drive the plant emergency vehicle for 3 laps. Stay safe, and answer one engineering question at each glowing unit.</p>
      <div class="pr-modes">
        <button type="button" class="pr-mode" data-m="student"><b>Student</b><span>Speed limiter on, pick from 4 answers, 1 formula hint. Start here.</span><em>${b('student')}</em></button>
        <button type="button" class="pr-mode" data-m="pro"><b>Professional</b><span>You control the speed, type the numbers, more hazards</span><em>${b('pro')}</em></button>
      </div>
      <p class="pr-small" id="pr-load">${DATA ? '' : 'Loading mission data…'}</p>
      ${solved ? `<p class="pr-small">Missions solved so far: ${solved} of ${P.IDS.length}</p>` : ''}
      <div class="pr-actions"><button type="button" class="pr-btn pr-ghostbtn" id="pr-fs">Full screen</button><button type="button" class="pr-btn pr-ghostbtn" id="pr-mute0">${muted ? 'Sound on' : 'Sound off'}</button></div>
    </div>`;
    ov.classList.add('show');
    ov.querySelectorAll('.pr-mode').forEach(bt => { bt.disabled = !DATA; bt.addEventListener('click', () => rules(bt.dataset.m)); });
    $('pr-mute0').addEventListener('click', e => { muted = !muted; store.mute = muted; save(); e.target.textContent = muted ? 'Sound on' : 'Sound off'; });
    const fs = $('pr-fs'); if (!host.requestFullscreen) fs.remove(); else fs.addEventListener('click', () => { host.requestFullscreen().then(() => setTimeout(resize, 100), () => {}); });
    // draw the plant behind the menu
    if (!G.car) { G.car = { s: 0, d: LANE, dT: LANE, v: 0, flash: 0, onShort: false }; place(G.car); G.hazards = []; G.t = 0; }
    render();
  }
  function rules(mode) {
    const t = touchUI(), lim = MODES[mode].limiter;
    ov.innerHTML = `<div class="pr-card pr-menu">
      <h2>How to play</h2>
      <p>The car follows the road by itself. You only control ${lim ? 'when to go and stop' : 'speed'} and which lane you are in.</p>
      <ul class="pr-how">
        <li><b>Go and stop</b><span>${t ? 'Hold <kbd>Drive</kbd> to go, <kbd>Brake</kbd> to stop.' : 'Hold <kbd>↑</kbd> to go, <kbd>↓</kbd> to stop.'} ${lim ? 'The speed limiter keeps you at the zone limit.' : 'Stay under the limit on the round sign: 40, 20 or 10 km/h.'}</span></li>
        <li><b>Lane</b><span>${t ? 'Tap <kbd>◀</kbd> or <kbd>▶</kbd>' : 'Press <kbd>←</kbd> or <kbd>→</kbd>'} to move round spills, steam and barricades.</span></li>
        <li><b>Stop and wait</b><span>For a gas alarm or a crossing forklift.</span></li>
        <li><b>Questions</b><span>At two units each lap the car stops and asks one engineering question. Right: −${BONUS} s. Wrong: +${PENALTY} s.</span></li>
      </ul>
      <p class="pr-small">The yellow line at the top always tells you what to do next. ${VIOL_MAX} safety mistakes end the race.</p>
      <div class="pr-actions"><button type="button" class="pr-btn" id="pr-start">Start the race</button><button type="button" class="pr-btn pr-ghostbtn" id="pr-back">Back</button></div>
    </div>`;
    $('pr-start').addEventListener('click', () => start(mode)); $('pr-back').addEventListener('click', menu);
    try { $('pr-start').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  document.addEventListener('fullscreenchange', () => setTimeout(resize, 60));

  /* ---------------- boot ---------------- */
  resize(); drawStatic();
  G.hazards = []; G.lap = 1; G.done = {};
  menu();
  (window.PR_DATA ? Promise.resolve([window.PR_DATA.azeo, window.PR_DATA.solvents]) : Promise.all([fetch(URL_AZ).then(r => r.json()), fetch(URL_SOL).then(r => r.json())])).then(d => {
    DATA = { azeo: d[0], solvents: d[1] }; menu();
  }).catch(() => { const l = $('pr-load'); if (l) l.textContent = 'Could not load the mission data. Check your connection and reload the page.'; });
  requestAnimationFrame(frame);
  if (DEBUG) window.__PR = { G, keys, lane, MAIN, at, limitAt, BAYS, L, start, answer, IDEAL_LAP, SHORT, SC_A, SC_B, HALF, forkOnRoad };
})();
