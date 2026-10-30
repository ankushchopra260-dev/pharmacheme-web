/* PharmaChemE 3D sketch book.
   A pencil-drawn apparatus rises off an open book page; drag to turn it, sliders change the physics live.
   Public engine only: the paid chapters are loaded from Firestore and call PCME_SB.book(mount, spec).
   Uses three.js r128 (global THREE), loaded on demand from /assets/vendor/three-r128.min.js. */
(function () {
  'use strict';
  const INK = '#2f2b26', PAPER = '#f5efe2', HOT = '#c2412d', COLD = '#2a62a8';
  let threeP = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (threeP) return threeP;
    threeP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/assets/vendor/three-r128.min.js'; s.onload = () => res(window.THREE); s.onerror = () => rej(new Error('3D library did not load')); document.head.appendChild(s); });
    return threeP;
  }
  function fonts() {
    if (document.getElementById('sb-fonts')) return;
    const l = document.createElement('link'); l.id = 'sb-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Kalam:wght@400;700&display=swap';
    document.head.appendChild(l);
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- pencil-hatch material ---------- */
  function hatchMat(T, tint, opacity) {
    const c = new T.Color(tint || '#ffffff');
    return new T.ShaderMaterial({
      transparent: opacity != null && opacity < 1, depthWrite: !(opacity != null && opacity < 1), side: T.DoubleSide,
      uniforms: { uTint: { value: c }, uInk: { value: new T.Color(INK) }, uPaper: { value: new T.Color(PAPER) }, uOpacity: { value: opacity == null ? 1 : opacity }, uPR: { value: window.devicePixelRatio || 1 } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vV = -mv.xyz; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }',
      fragmentShader: [
        'uniform vec3 uTint; uniform vec3 uInk; uniform vec3 uPaper; uniform float uOpacity; uniform float uPR; varying vec3 vN; varying vec3 vV;',
        'void main(){',
        ' vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n;',
        ' vec3 L = normalize(vec3(-0.45, 0.8, 0.55));',
        ' float d = max(dot(n, L), 0.0); float rim = 1.0 - max(dot(n, normalize(vV)), 0.0);',
        ' float tone = 0.42 + 0.58 * d - 0.12 * rim;',
        ' vec2 p = gl_FragCoord.xy / uPR;',
        ' float h1 = smoothstep(0.55, 0.95, abs(sin((p.x + p.y) * 0.75)));',
        ' float h2 = smoothstep(0.55, 0.95, abs(sin((p.x - p.y) * 0.75)));',
        ' float ink = 0.0;',
        ' float solid = step(0.99, uOpacity);',
        ' if (tone < 0.72) ink += h1 * (0.72 - tone) * 1.3 * mix(0.25, 1.0, solid);',
        ' if (tone < 0.45) ink += h2 * (0.45 - tone) * 1.8 * solid;',
        ' vec3 base = mix(uPaper, uPaper * uTint, 0.85);',
        ' vec3 col = mix(base, uInk, clamp(ink, 0.0, 0.75));',
        ' gl_FragColor = vec4(col, uOpacity);',
        '}'].join('\n')
    });
  }

  /* ---------- small 2D pencil plot ---------- */
  function plot(canvas, o) {
    const dpr = window.devicePixelRatio || 1, W = canvas.clientWidth || 320, H = canvas.clientHeight || 200;
    canvas.width = W * dpr; canvas.height = H * dpr; const g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const m = { l: 46, r: 12, t: 14, b: 34 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const X = x => m.l + (x - o.x0) / (o.x1 - o.x0) * pw, Y = y => m.t + ph - (y - o.y0) / (o.y1 - o.y0) * ph;
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed / 2147483647 - 0.5); };
    const line = (pts, col, w, dash) => { for (let k = 0; k < 2; k++) { g.beginPath(); g.strokeStyle = col; g.globalAlpha = k ? 0.35 : 0.9; g.lineWidth = w || 1.6; g.setLineDash(dash || []); pts.forEach((p, i) => { const x = p[0] + (k ? rnd() * 1.2 : 0), y = p[1] + (k ? rnd() * 1.2 : 0); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); } g.globalAlpha = 1; g.setLineDash([]); };
    line([[m.l, m.t - 4], [m.l, m.t + ph], [m.l + pw + 4, m.t + ph]], INK, 1.4);
    g.font = '15px Caveat, cursive'; g.fillStyle = INK;
    g.textAlign = 'center'; g.fillText(o.xl || '', m.l + pw / 2, H - 6);
    g.save(); g.translate(13, m.t + ph / 2); g.rotate(-Math.PI / 2); g.fillText(o.yl || '', 0, 0); g.restore();
    g.font = '13px Caveat, cursive'; g.textAlign = 'right';
    (o.yt || []).forEach(t => { const v = Array.isArray(t) ? t[0] : t; g.fillText(Array.isArray(t) ? t[1] : t, m.l - 5, Y(v) + 4); line([[m.l - 3, Y(v)], [m.l, Y(v)]], INK, 1); });
    g.textAlign = 'center'; (o.xt || []).forEach(t => { const v = Array.isArray(t) ? t[0] : t; g.fillText(Array.isArray(t) ? t[1] : t, X(v), m.t + ph + 15); });
    (o.series || []).forEach(s => {
      const pts = s.pts.map(p => [X(p[0]), Y(p[1])]); line(pts, s.color || INK, s.w || 2.2, s.dash);
      if (s.label) { const p = pts[s.at == null ? pts.length - 1 : s.at]; g.fillStyle = s.color || INK; g.font = '16px Caveat, cursive'; g.textAlign = s.align || 'left'; g.fillText(s.label, p[0] + (s.dx || 4), p[1] + (s.dy || -4)); }
    });
    (o.dots || []).forEach(d => { g.beginPath(); g.fillStyle = d.color || INK; g.arc(X(d.x), Y(d.y), d.r || 4, 0, 7); g.fill(); if (d.label) { g.font = '15px Caveat, cursive'; g.textAlign = d.align || 'left'; g.fillText(d.label, X(d.x) + (d.dx || 7), Y(d.y) + (d.dy || -6)); } });
    (o.vlines || []).forEach(v => line([[X(v.x), m.t], [X(v.x), m.t + ph]], v.color || INK, 1.2, [4, 4]));
    (o.hlines || []).forEach(v => line([[m.l, Y(v.y)], [m.l + pw, Y(v.y)]], v.color || INK, 1.2, [4, 4]));
    return { X, Y };
  }

  /* ---------- the stage: one WebGL view of the right-hand page ---------- */
  function Stage(T, holder, opts) {
    opts = opts || {};
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    holder.appendChild(renderer.domElement);
    renderer.domElement.className = 'sb-canvas';
    const labels = document.createElement('div'); labels.className = 'sb-labels'; holder.appendChild(labels);
    const camera = new T.PerspectiveCamera(32, 1, 0.1, 200);
    const st = { T, renderer, camera, holder, labels, scene: null, world: null, frames: [], items: [], lbls: [], az: opts.az == null ? -0.6 : opts.az, el: opts.el == null ? 0.55 : opts.el, dist: opts.dist || 14, target: new T.Vector3(0, 1, 0), auto: !!opts.auto, t0: 0, grow: 0, alive: true, dragging: false };

    function resize() { const w = holder.clientWidth, h = holder.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px'; camera.aspect = w / h; camera.updateProjectionMatrix(); }
    const ro = window.ResizeObserver ? new ResizeObserver(resize) : null; if (ro) ro.observe(holder); else window.addEventListener('resize', resize);
    resize();

    // drag to turn
    if (!opts.noDrag) {
      const el = renderer.domElement; let px = 0, py = 0, id = null;
      el.addEventListener('pointerdown', e => { id = e.pointerId; px = e.clientX; py = e.clientY; st.dragging = true; st.auto = false; el.setPointerCapture(id); holder.classList.add('sb-grab'); });
      el.addEventListener('pointermove', e => { if (e.pointerId !== id) return; st.az -= (e.clientX - px) * 0.008; st.el = clamp(st.el + (e.clientY - py) * 0.006, 0.12, 1.25); px = e.clientX; py = e.clientY; });
      const up = e => { if (e.pointerId === id) { id = null; st.dragging = false; holder.classList.remove('sb-grab'); } };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      el.addEventListener('wheel', e => { e.preventDefault(); st.dist = clamp(st.dist * (1 + Math.sign(e.deltaY) * 0.08), 6, 30); }, { passive: false });
    }

    st.reset = function (cam) {
      // dispose the old scene
      if (st.scene) st.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); });
      st.scene = new T.Scene(); st.world = new T.Group(); st.scene.add(st.world);
      st.frames = []; st.items = []; st.lbls.forEach(l => l.el.remove()); st.lbls = [];
      cam = cam || {}; st.az = cam.az == null ? -0.6 : cam.az; st.el = cam.el == null ? 0.55 : cam.el; st.dist = cam.dist || 14; st.target.set(cam.tx || 0, cam.ty == null ? 1 : cam.ty, 0);
      st.t0 = performance.now(); st.grow = reduced() ? 1 : 0; st.settled = false;
      paperGround(cam.ground || 9);
    };

    function paperGround(size) {
      const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
      const grd = g.createRadialGradient(256, 256, 40, 256, 256, 256); grd.addColorStop(0, 'rgba(47,43,38,0.10)'); grd.addColorStop(1, 'rgba(47,43,38,0)');
      g.strokeStyle = 'rgba(47,43,38,0.07)'; g.lineWidth = 1;
      for (let i = 0; i <= 512; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
      g.globalCompositeOperation = 'destination-in'; const m = g.createRadialGradient(256, 256, 120, 256, 256, 256); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = m; g.fillRect(0, 0, 512, 512);
      const tex = new T.CanvasTexture(c);
      const p = new T.Mesh(new T.PlaneGeometry(size * 2, size * 2), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      p.rotation.x = -Math.PI / 2; p.position.y = -0.01; st.scene.add(p);
    }

    /* add a solid with pencil edges and an outline */
    st.solid = function (geom, o) {
      o = o || {};
      const g = new T.Group();
      const mesh = new T.Mesh(geom, hatchMat(T, o.tint, o.opacity)); g.add(mesh);
      if (o.edges !== false) {
        const eg = new T.EdgesGeometry(geom, o.edgeAngle || 28);
        const lm = new T.LineBasicMaterial({ color: o.ink || INK, transparent: true, opacity: o.opacity != null && o.opacity < 1 ? 0.55 : 0.9 });
        g.add(new T.LineSegments(eg, lm));
        const l2 = new T.LineSegments(eg, new T.LineBasicMaterial({ color: o.ink || INK, transparent: true, opacity: 0.25 })); l2.position.set(0.012, 0.01, -0.008); g.add(l2);
      }
      if (o.hull !== false && !(o.opacity != null && o.opacity < 1)) {
        const hm = new T.MeshBasicMaterial({ color: o.ink || INK, side: T.BackSide });
        hm.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * ' + (o.hullW || 0.025).toFixed(4) + ';'); };
        const h = new T.Mesh(geom, hm); g.add(h);
      }
      if (o.pos) g.position.set(o.pos[0], o.pos[1], o.pos[2]);
      if (o.rot) g.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
      if (o.scale) g.scale.set(o.scale[0], o.scale[1], o.scale[2]);
      g.userData.base = g.scale.clone(); g.userData.delay = o.delay == null ? Math.min(st.items.length * 0.035, 1.1) : o.delay;
      (o.parent || st.world).add(g); st.items.push(g);
      g.mesh = mesh; return g;
    };
    st.box = (w, h, d, o) => st.solid(new T.BoxGeometry(w, h, d), o);
    st.cyl = (r1, r2, h, o) => st.solid(new T.CylinderGeometry(r1, r2, h, o && o.seg || 40, 1, !!(o && o.open)), o);
    st.sphere = (r, o) => st.solid(new T.SphereGeometry(r, 28, 18), o);
    st.pipe = (pts, r, o) => { const cv = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.05); const s = st.solid(new T.TubeGeometry(cv, Math.max(24, pts.length * 16), r, 16, false), Object.assign({ edgeAngle: 60 }, o)); s.curve = cv; return s; };
    st.line = (pts, o) => { o = o || {}; const geo = new T.BufferGeometry().setFromPoints(pts.map(p => new T.Vector3(p[0], p[1], p[2]))); const l = new T.Line(geo, new T.LineBasicMaterial({ color: o.color || INK, transparent: true, opacity: o.opacity == null ? 0.9 : o.opacity })); (o.parent || st.world).add(l); return l; };
    st.curve = pts => new T.CatmullRomCurve3(pts.map(p => new T.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.05);

    /* moving dots along a path: flow you can see */
    st.flow = function (curve, o) {
      o = o || {}; const n = o.count || 40;
      const geo = o.geo || new T.SphereGeometry(o.size || 0.06, 8, 6);
      const im = new T.InstancedMesh(geo, new T.MeshBasicMaterial({ color: o.color || COLD, transparent: true, opacity: o.opacity == null ? 0.9 : o.opacity }), n);
      (o.parent || st.world).add(im);
      const f = { mesh: im, speed: o.speed == null ? 0.15 : o.speed, jitter: o.jitter || 0, vel: o.vel || null, phase: Array.from({ length: n }, (_, i) => (i + Math.random() * 0.9) / n), off: Array.from({ length: n }, () => [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]), visible: true };
      const m = new T.Matrix4(), v = new T.Vector3();
      f.remove = () => { f.dead = true; if (im.parent) im.parent.remove(im); im.geometry.dispose(); im.material.dispose(); };
      st.frames.push(dt => {
        if (f.dead) return;
        im.visible = f.visible && st.grow > 0.6;
        for (let i = 0; i < n; i++) {
          f.phase[i] = (((f.phase[i] + dt * f.speed * (f.vel ? f.vel(f.phase[i]) : 1)) % 1) + 1) % 1; curve.getPointAt(f.phase[i], v);
          if (f.jitter) { const a = f.off[i]; v.x += a[0] * f.jitter; v.y += a[1] * f.jitter; v.z += a[2] * f.jitter; }
          m.makeTranslation(v.x, v.y, v.z); im.setMatrixAt(i, m);
        }
        im.instanceMatrix.needsUpdate = true;
      });
      return f;
    };

    /* handwritten label pinned to a 3D point */
    st.label = function (p, text, o) {
      o = o || {}; const el = document.createElement('div'); el.className = 'sb-lbl' + (o.cls ? ' ' + o.cls : ''); el.innerHTML = text; labels.appendChild(el);
      const l = { el, p: new T.Vector3(p[0], p[1], p[2]), obj: o.obj || null, dx: o.dx || 0, dy: o.dy || 0, show: true, left: !!o.left }; st.lbls.push(l); return l;
    };
    st.onFrame = fn => st.frames.push(fn);
    st.remove = g => { if (!g) return; if (g.parent) g.parent.remove(g); st.items = st.items.filter(x => x !== g); g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); };
    st.setTint = (g, col) => g.traverse(o => { if (o.material && o.material.uniforms && o.material.uniforms.uTint) o.material.uniforms.uTint.value.set(col); });
    st.added = g => { g.userData.fixed = true; g.scale.copy(g.userData.base); return g; };

    let last = performance.now();
    function tick(now) {
      if (!st.alive) return; requestAnimationFrame(tick);
      if (!st.scene || !holder.isConnected || st.paused) { last = now; return; }
      const dt = clamp((now - last) / 1000, 0, 0.05); last = now;
      const tt = reduced() ? 99 : (now - st.t0) / 1000; st.grow = clamp(tt / 1.6, 0, 1);
      if (tt < 3) st.items.forEach(g => { if (g.userData.fixed) return; const k = clamp((tt - g.userData.delay) / 0.8, 0, 1), e = 1 - Math.pow(1 - k, 3); g.scale.set(g.userData.base.x, Math.max(0.001, g.userData.base.y * e), g.userData.base.z); });
      else if (!st.settled) { st.settled = true; st.items.forEach(g => { if (!g.userData.fixed) g.scale.copy(g.userData.base); }); }
      if (st.auto && !reduced()) st.az += dt * 0.18;
      const dd = st.dist * Math.max(1, 1.5 / (camera.aspect || 1.5));
      camera.position.set(st.target.x + dd * Math.cos(st.el) * Math.sin(st.az), st.target.y + dd * Math.sin(st.el), st.target.z + dd * Math.cos(st.el) * Math.cos(st.az));
      camera.lookAt(st.target);
      st.frames.forEach(f => f(dt, now / 1000));
      renderer.render(st.scene, camera);
      const w = holder.clientWidth, h = holder.clientHeight, v = new T.Vector3();
      st.lbls.forEach(l => { v.copy(l.p); if (l.obj) l.obj.localToWorld(v); v.project(camera); const vis = l.show && st.grow > 0.8 && v.z < 1; l.el.style.opacity = vis ? 1 : 0; l.el.style.transform = 'translate(' + ((v.x + 1) / 2 * w + l.dx) + 'px,' + ((1 - v.y) / 2 * h + l.dy) + 'px) ' + (l.left ? 'translate(0,-50%)' : 'translate(-50%,-50%)'); });
    }
    requestAnimationFrame(tick);
    st.destroy = () => { st.alive = false; if (ro) ro.disconnect(); renderer.dispose(); };
    return st;
  }

  /* ---------- controls drawn on the page ---------- */
  function controls(box) {
    const api = {
      slider(o) {
        const id = 'sb' + Math.random().toString(36).slice(2, 8);
        const w = document.createElement('label'); w.className = 'sb-sl'; w.setAttribute('for', id);
        w.innerHTML = '<span class="sb-sl-n">' + esc(o.label) + '</span><input id="' + id + '" type="range" min="' + o.min + '" max="' + o.max + '" step="' + (o.step || 'any') + '" value="' + o.value + '"><b class="sb-sl-v"></b>';
        box.appendChild(w); const inp = w.querySelector('input'), out = w.querySelector('b');
        const fmt = () => { out.textContent = (o.fmt ? o.fmt(+inp.value) : (+inp.value).toFixed(o.dp == null ? 0 : o.dp)) + (o.unit ? ' ' + o.unit : ''); };
        fmt(); inp.addEventListener('input', () => { fmt(); o.on && o.on(+inp.value); });
        return { get value() { return +inp.value; }, set(v) { inp.value = v; fmt(); o.on && o.on(+inp.value); }, el: w };
      },
      toggle(o) {
        const w = document.createElement('div'); w.className = 'sb-tg'; w.setAttribute('role', 'radiogroup'); w.setAttribute('aria-label', o.label || '');
        w.innerHTML = (o.label ? '<span class="sb-sl-n">' + esc(o.label) + '</span>' : '') + o.options.map((t, i) => '<button type="button" role="radio" data-i="' + i + '" aria-checked="' + (i === (o.value || 0)) + '">' + esc(t) + '</button>').join('');
        box.appendChild(w); let cur = o.value || 0;
        w.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; w.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(+x.dataset.i === cur))); o.on && o.on(cur); });
        return { get value() { return cur; } };
      },
      readout(items) {
        const w = document.createElement('div'); w.className = 'sb-ro'; box.appendChild(w);
        const set = vals => { w.innerHTML = items.map((it, i) => '<div class="' + (vals[i] && vals[i].warn ? 'warn' : '') + '"><span>' + esc(it) + '</span><b>' + (vals[i] && vals[i].v != null ? vals[i].v : vals[i] == null ? '' : vals[i]) + '</b></div>').join(''); };
        set([]); return { set };
      },
      canvas(h) { const c = document.createElement('canvas'); c.className = 'sb-plot'; c.style.height = (h || 190) + 'px'; box.appendChild(c); return c; },
      note(html, cls) { const p = document.createElement('p'); p.className = 'sb-note' + (cls ? ' ' + cls : ''); p.innerHTML = html; box.appendChild(p); return p; }
    };
    return api;
  }

  /* ---------- the book ---------- */
  function book(mount, spec) {
    fonts();
    mount.innerHTML = '<div class="sb-book"><div class="sb-top"><div class="sb-title"></div><nav class="sb-tabs" aria-label="Pages"></nav></div><div class="sb-spread"><section class="sb-left" aria-live="polite"></section><section class="sb-right"><div class="sb-stage"><p class="sb-hint">Drag to turn it</p></div><div class="sb-ctrls"></div></section></div><div class="sb-foot"><button type="button" class="sb-prev">Previous page</button><span class="sb-pg"></span><button type="button" class="sb-next">Next page</button></div></div>';
    const q = s => mount.querySelector(s);
    q('.sb-title').innerHTML = '<span>' + esc(spec.book || '') + '</span><b>' + esc(spec.title) + '</b>';
    const tabs = q('.sb-tabs'), left = q('.sb-left'), stageEl = q('.sb-stage'), ctrls = q('.sb-ctrls');
    const done = new Set(spec.done || []);
    let cur = -1, stage = null, pageApi = null;
    function drawTabs() { tabs.innerHTML = spec.pages.map((p, i) => '<button type="button" data-i="' + i + '"' + (i === cur ? ' aria-current="page"' : '') + '><i>' + (done.has(i) ? '✓' : i + 1) + '</i>' + esc(p.short || p.title) + '</button>').join('') + (spec.extraTab ? '<button type="button" data-i="x"' + (cur === 'x' ? ' aria-current="page"' : '') + '><i>¶</i>' + esc(spec.extraTab.title) + '</button>' : ''); }
    tabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.i === 'x' ? 'x' : +b.dataset.i); });
    q('.sb-prev').onclick = () => go(cur === 'x' ? spec.pages.length - 1 : Math.max(0, cur - 1));
    q('.sb-next').onclick = () => go(cur === 'x' ? 'x' : cur + 1 < spec.pages.length ? cur + 1 : (spec.extraTab ? 'x' : cur));
    function go(i) {
      if (i === cur) return; cur = i; drawTabs();
      const spread = q('.sb-spread'), foot = q('.sb-foot');
      if (i === 'x') { spread.hidden = true; let ex = q('.sb-extra'); if (!ex) { ex = document.createElement('div'); ex.className = 'sb-extra'; spread.after(ex); spec.extraTab.render(ex); } ex.hidden = false; q('.sb-pg').textContent = spec.extraTab.title; foot.querySelector('.sb-next').disabled = true; foot.querySelector('.sb-prev').disabled = false; return; }
      const ex = q('.sb-extra'); if (ex) ex.hidden = true; spread.hidden = false;
      const p = spec.pages[i];
      q('.sb-pg').textContent = 'Page ' + (i + 1) + ' of ' + spec.pages.length;
      foot.querySelector('.sb-prev').disabled = i === 0; foot.querySelector('.sb-next').disabled = i === spec.pages.length - 1 && !spec.extraTab;
      left.innerHTML = '<h3>' + esc(p.title) + '</h3><div class="sb-body">' + (p.html || '') + '</div>' + (p.try ? '<div class="sb-try"><b>Try this</b>' + p.try + '</div>' : '') + (p.check ? '<div class="sb-check"></div>' : '');
      if (p.check) check(left.querySelector('.sb-check'), p.check, i);
      ctrls.innerHTML = '';
      const token = {}; go.token = token;
      const go2 = () => {
        if (go.token !== token) return;
        ctrls.innerHTML = '';
        if (!stage) stage = Stage(window.THREE, stageEl, {});
        stage.reset(p.cam); pageApi = controls(ctrls);
        try { p.build(stage, pageApi, { INK, HOT, COLD, PAPER, plot, clamp }); } catch (e) { ctrls.innerHTML = '<p class="sb-note warn">This page could not start (' + esc(e.message) + ').</p>'; }
      };
      loadThree().then(go2, e => { stageEl.innerHTML = '<p class="sb-note warn">' + esc(e.message) + '. Please refresh.</p>'; });
      if (window.innerWidth < 760) mount.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    }
    function check(box, c, i) {
      box.innerHTML = '<b>Quick check</b><p>' + c.q + '</p><div class="sb-opts">' + c.opts.map((o, k) => '<button type="button" data-k="' + k + '">' + o + '</button>').join('') + '</div><p class="sb-why" hidden></p>';
      box.addEventListener('click', e => {
        const b = e.target.closest('button[data-k]'); if (!b) return; const k = +b.dataset.k, why = box.querySelector('.sb-why');
        if (k === c.ans) { box.querySelectorAll('button').forEach(x => { x.disabled = true; }); b.classList.add('ok'); why.hidden = false; why.className = 'sb-why ok'; why.innerHTML = '<b>Right.</b> ' + c.why; if (!done.has(i)) { done.add(i); drawTabs(); spec.onDone && spec.onDone(i, done.size, spec.pages.length); } }
        else { b.classList.add('no'); b.disabled = true; why.hidden = false; why.className = 'sb-why no'; why.innerHTML = '<b>Not quite.</b> ' + (c.hint || 'Look at the model again and try another answer.'); }
      });
      if (done.has(i)) { const b = box.querySelector('button[data-k="' + c.ans + '"]'); b.click(); }
    }
    go(spec.start || 0);
    return { go, destroy: () => stage && stage.destroy() };
  }

  /* ---------- a short self-running demo (public teaser) ---------- */
  function demo(mount, build, cam) {
    fonts();
    mount.classList.add('sb-demo');
    return loadThree().then(T => {
      const st = Stage(T, mount, { auto: true, noDrag: true });
      st.reset(cam); st.auto = true; build(st, { INK, HOT, COLD, PAPER });
      // pause when off screen
      if (window.IntersectionObserver) new IntersectionObserver(es => es.forEach(e => { st.paused = !e.isIntersecting; })).observe(mount);
      return st;
    });
  }

  window.PCME_SB = { book, demo, plot, loadThree, INK, HOT, COLD, PAPER };
})();
