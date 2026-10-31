/* PharmaChemE: free sample of "The First 30 Days in a Chemical Plant" (Day 1 only).
   The full book with all 30 days is for buyers. */
window.PCME_F30_SAMPLE = function (mount, opt) {
  'use strict'; opt = opt || {}; const api = { SB: window.PCME_SB };
  const SB = api.SB, T = () => window.THREE, esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f0 = x => Math.round(x).toLocaleString('en-IN'), f1 = x => x.toFixed(1), f2 = x => x.toFixed(2);
  const pages = [];
  /* the left-hand page of a day: what it is about, what to do on the plant, what to ask, a tip */
  const day = o => '<div class="sb-day">' + o.intro + (o.do ? '<h4>Do today on the plant</h4><ul>' + o.do.map(x => '<li>' + x + '</li>').join('') + '</ul>' : '') + (o.ask ? '<h4>Ask today</h4><ul>' + o.ask.map(x => '<li>' + x + '</li>').join('') + '</ul>' : '') + (o.tip ? '<div class="sb-plant"><b>On the plant floor</b>' + o.tip + '</div>' : '') + '</div>';
  const P = o => { o.label = 'Day'; pages.push(o); };

  /* put a set of buttons in the controls; returns the element */
  function buttons(ui, label, names, on) {
    const d = document.createElement('div'); d.className = 'sb-tg'; d.innerHTML = (label ? '<span class="sb-sl-n">' + esc(label) + '</span>' : '') + names.map((n, i) => '<button type="button" data-i="' + i + '" aria-checked="false">' + esc(n) + '</button>').join('');
    ui.note('').replaceWith(d); d.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; d.querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === b))); on(+b.dataset.i, b); });
    return d;
  }
  const card = ui => { const c = ui.note(''); c.className = 'sb-card'; return c; };
  /* ================= Day 1: induction and emergency ================= */
  const WINDS = [['from the west', [1, 0]], ['from the east', [-1, 0]], ['from the north', [0, 1]], ['from the south', [0, -1]]];
  P({
    short: 'Induction and emergency', title: 'Day 1: induction, and what to do when the siren sounds',
    cam: { az: -0.3, el: 0.8, dist: 22, ty: 0.2 },
    html: day({ intro: '<p>Day one is induction: rules, PPE issue, a tour with the safety officer, and the emergency plan. Of all of it, remember this: <b>where to go when the siren sounds</b>.</p><p>Most plants have two or more assembly points, so that one is always safe. In a gas or vapour release you go to the assembly point that is <b>upwind or crosswind</b> of the leak, never downwind. That is why every plant has windsocks, high up and visible from everywhere.</p>',
      do: ['Find the windsocks from at least three places in the plant.', 'Walk your escape route from your desk and from the production block to both assembly points.', 'Learn the siren codes (fire, gas leak, all clear) and the emergency phone number.', 'Note where the nearest safety shower, eye wash and fire extinguisher are.'],
      ask: ['Who is the incident controller on my shift?', 'Where is the emergency control centre?', 'What do I do with the people I am escorting, such as visitors and contractors?'],
      tip: 'In a real emergency, walk, do not run, and do not go back for belongings. Report to your head count at the assembly point.' }),
    try: '<p>A solvent leak has started in the tank farm. Change the wind and choose the safe assembly point each time.</p>',
    check: { q: 'Gas leak siren. The windsock shows the wind blowing from the leak towards assembly point A. Where do you go?', opts: ['Assembly point A, it is nearest', 'Assembly point B, upwind or crosswind of the leak', 'Stay inside the control room', 'Go to the leak to help'], ans: 1, why: 'A gas or vapour cloud drifts downwind. Go upwind or crosswind, to the assembly point the cloud cannot reach, and be counted there.', hint: 'Which way does the cloud drift?' },
    free: [['/process-safety/what-is-process-safety/', 'What is process safety?'], ['/articles/msihc-rules-emergency-planning/', 'MSIHC rules and emergency planning'], ['/articles/fire-noc-and-fire-protection/', 'Fire NOC and fire protection']],
    build(st, ui, k) {
      const TH = T(), bld = (x, z, w, h, d, tint) => st.box(w, h, d, { pos: [x, h / 2, z], tint });
      bld(0, 0, 3.0, 2.6, 2.0, '#efe3c4'); bld(-4.2, 1.0, 2.0, 1.4, 1.6, '#e7e0d0'); bld(4.4, 1.4, 2.6, 1.1, 1.4, '#ece4d2'); bld(2.3, 3.1, 1.4, 0.8, 1.0, '#e8eef0');
      st.box(3.0, 0.25, 2.0, { pos: [4.4, 0.12, -1.6], tint: '#e3dccb' }); [[3.6, -2.1], [4.4, -2.1], [5.2, -2.1], [3.6, -1.1], [4.4, -1.1], [5.2, -1.1]].forEach(([x, z]) => st.cyl(0.32, 0.32, 1.0, { pos: [x, 0.62, z], tint: '#efe6d2', seg: 20 }));
      const AP = { A: [5.0, 3.4], B: [-4.8, -3.4] };
      Object.entries(AP).forEach(([n, p]) => { st.box(0.9, 0.04, 0.9, { pos: [p[0], 0.02, p[1]], tint: '#7bbf8a' }); st.cyl(0.03, 0.03, 1.2, { pos: [p[0], 0.6, p[1]], tint: '#d6d0c4' }); st.label([p[0], 1.4, p[1]], 'Assembly ' + n, { cls: 'big' }); });
      st.cyl(0.04, 0.04, 2.6, { pos: [-1.8, 1.3, 2.4], tint: '#d6d0c4' }); const sock = new TH.Group(); sock.position.set(-1.8, 2.5, 2.4); st.world.add(sock);
      st.solid(new TH.ConeGeometry(0.16, 0.8, 16, 1, true), { parent: sock, pos: [0, 0, 0.4], rot: [Math.PI / 2, 0, 0], tint: '#f2a65a' }); st.label([-1.8, 3.1, 2.4], 'windsock');
      const leak = [4.4, -1.6]; st.label([leak[0], 1.6, leak[1]], 'leak', { cls: 'hot big' });
      const N = 160, cloud = new TH.InstancedMesh(new TH.SphereGeometry(0.14, 8, 6), new TH.MeshBasicMaterial({ color: '#9aa5b1', transparent: true, opacity: 0.35, depthWrite: false }), N); st.world.add(cloud);
      const P2 = Array.from({ length: N }, () => ({ t: Math.random(), s: (Math.random() - 0.5) })); let wind = [1, 0];
      const m = new TH.Matrix4();
      st.onFrame(dt => { P2.forEach((p, i) => { p.t = (p.t + dt * 0.12) % 1; const d = p.t * 6, sp = 0.3 + p.t * 2.2; const x = leak[0] + wind[0] * d - wind[1] * p.s * sp, z = leak[1] + wind[1] * d + wind[0] * p.s * sp; m.makeTranslation(x, 0.4 + p.t * 0.8, z); cloud.setMatrixAt(i, m); }); cloud.instanceMatrix.needsUpdate = true; });
      let w = 0; const c = card(ui); const out = ui.note('');
      ui.toggle({ label: 'Wind', options: WINDS.map(x => x[0]), value: 0, on: v => { w = v; set(); } });
      const pick = buttons(ui, 'Go to', ['Assembly point A', 'Assembly point B'], i => { const p = AP[i ? 'B' : 'A'], rel = [p[0] - leak[0], p[1] - leak[1]], dot = rel[0] * wind[0] + rel[1] * wind[1];
        if (dot < 0) { out.className = 'sb-note ok'; out.textContent = 'Safe: that assembly point is upwind or crosswind of the leak.'; } else { out.className = 'sb-note warn'; out.textContent = 'Downwind: the vapour cloud drifts that way. Choose the other one.'; } });
      function set() { wind = WINDS[w][1]; sock.rotation.y = Math.atan2(wind[0], wind[1]); c.innerHTML = '<b>Wind ' + esc(WINDS[w][0]) + '.</b> The windsock points the way the wind blows. Choose your assembly point.'; out.className = 'sb-note'; out.textContent = ''; pick.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', 'false')); }
      set();
    }
  });

  pages[0].free = (pages[0].free || []);
  SB.book(mount, { book: 'Free sample: Day 1 of 30', title: 'The First 30 Days in a Chemical Plant', pages,
    extraTab: { title: 'Days 2 to 30', render: el => { el.innerHTML = '<div class="article-body ex-body"><h2>29 more days like this</h2><p>Each day has its own 3D scene or plant game, what to do and ask on the plant that day, a tip from the plant floor, a quick check and links to free articles.</p><p>Week 1 continues with the plant walk, PPE and permits, inside a reactor, a centrifuge cycle, vacuum drying and starting a pump. Then valves, P&amp;IDs, utilities, interlocks you can trip, a line walk, layer separation, crystallisation, yield, steam traps, cooling towers, nitrogen purging, a vacuum leak hunt, troubleshooting, the 5 whys, permits, problem notes, shift handover and the daily report. Day 30 is the readiness test.</p><p><a class="btn btn-primary" href="' + (opt.buy || '/exclusive/first-30-days-chemical-plant/') + '">Get all 30 days</a></p></div>'; } } });
};
