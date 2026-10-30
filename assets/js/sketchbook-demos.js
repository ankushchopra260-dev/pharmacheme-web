/* Short self-running teasers for the 3D concept books (public). The interactive pages are paid. */
(function () {
  'use strict';
  const D = {};
  D.hx = {
    cam: { az: -0.5, el: 0.4, dist: 12, ty: 1.3 },
    build(st, k) {
      const T = window.THREE, cx = 1.45, L = 6, R = 1.0;
      st.box(0.5, cx - 0.55, 1.5, { pos: [-2.1, (cx - 0.55) / 2, 0], tint: '#efe6d2' }); st.box(0.5, cx - 0.55, 1.5, { pos: [2.1, (cx - 0.55) / 2, 0], tint: '#efe6d2' });
      st.cyl(R, R, L, { pos: [0, cx, 0], rot: [0, 0, Math.PI / 2], opacity: 0.13, seg: 48 });
      [-1, 1].forEach(s => { st.cyl(R + 0.08, R + 0.08, 0.1, { pos: [s * L / 2, cx, 0], rot: [0, 0, Math.PI / 2], tint: '#e9dfc9' }); st.cyl(R + 0.02, R + 0.02, 0.7, { pos: [s * (L / 2 + 0.4), cx, 0], rot: [0, 0, Math.PI / 2], tint: '#f1ebdd', opacity: 0.3 }); });
      const tubes = []; for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) { const y = r * 0.31, z = c * 0.36 + (r % 2 ? 0.18 : 0); if (y * y + z * z < 0.58) tubes.push([y, z]); }
      tubes.forEach(([y, z]) => st.cyl(0.075, 0.075, L, { pos: [0, cx + y, z], rot: [0, 0, Math.PI / 2], tint: '#e3ddd0', seg: 12, hull: false, edgeAngle: 80 }));
      const xs = [];
      for (let i = 0; i < 5; i++) { const x = -L / 2 + L * (i + 1) / 6; xs.push(x); const yc = 0.97 - 0.5, a = Math.asin(yc / 0.97), sh = new T.Shape(); sh.moveTo(0.97 * Math.cos(a), yc); sh.absarc(0, 0, 0.97, a, Math.PI - a, true); const g = new T.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false, curveSegments: 40 }); g.rotateY(Math.PI / 2); st.solid(g, { pos: [x, cx, 0], rot: [i % 2 ? 0 : Math.PI, 0, 0], tint: '#efe3c4', hull: false }); }
      st.cyl(0.22, 0.22, 0.7, { pos: [-2.4, cx + R + 0.25, 0], tint: '#f6dcd3' }); st.cyl(0.22, 0.22, 0.7, { pos: [2.4, cx - R - 0.1, 0], tint: '#f6dcd3' });
      const pts = [[-2.4, cx + R + 0.6, 0], [-2.4, cx + 0.2, 0]]; xs.forEach((x, i) => pts.push([x, i % 2 ? cx + 0.75 : cx - 0.75, 0])); pts.push([2.4, cx + 0.3, 0], [2.4, cx - R - 0.45, 0]);
      st.flow(st.curve(pts), { color: k.HOT, count: 60, speed: 0.07, jitter: 0.9, size: 0.065 });
      tubes.filter((t, i) => i % 3 === 0).forEach(([y, z]) => st.flow(st.curve([[-L / 2 - 0.4, cx + y, z], [L / 2 + 0.4, cx + y, z]]), { color: k.COLD, count: 10, speed: 0.12, size: 0.05 }));
    }
  };
  D.venturi = {
    cam: { az: -0.25, el: 0.22, dist: 13.5, ty: 2.2 },
    build(st, k) {
      const T = window.THREE, y0 = 0.95, R1 = 0.5, b = 0.5;
      const rAt = x => x <= -1.7 || x >= 3 ? R1 : x < -0.7 ? R1 + (R1 * b - R1) * (x + 1.7) : x <= -0.1 ? R1 * b : R1 * b + (R1 - R1 * b) * (x + 0.1) / 3.1;
      const pts = []; for (let i = 0; i <= 80; i++) { const x = -4.6 + 9.2 * i / 80; pts.push(new T.Vector2(rAt(x), x)); }
      const geo = new T.LatheGeometry(pts, 48); geo.rotateZ(-Math.PI / 2); const body = st.solid(geo, { pos: [0, y0, 0], opacity: 0.32, tint: '#dfe8f0', edgeAngle: 12 });
      [0, 2].forEach(q => { const a = q * Math.PI / 2, pp = []; for (let i = 0; i <= 80; i++) { const x = -4.6 + 9.2 * i / 80, r = rAt(x); pp.push([x, r * Math.cos(a), r * Math.sin(a)]); } st.line(pp, { parent: body }); });
      [[-3.3, 1.7], [-0.4, 0.75], [3.9, 1.55]].forEach(([x, h]) => { st.cyl(0.13, 0.13, 3.6, { pos: [x, y0 + R1 + 1.7, 0], opacity: 0.2, seg: 20, open: true }); st.cyl(0.1, 0.1, h, { pos: [x, y0 + R1 + h / 2 - 0.05, 0], tint: '#8fb4e6', hull: false, edgeAngle: 89 }); });
      for (let a = 0; a < 6; a++) { const ang = a / 6 * Math.PI * 2, fr = a % 2 ? 0.65 : 0.3, pp = []; for (let i = 0; i <= 40; i++) { const x = -4.6 + 9.2 * i / 40, r = rAt(x) * fr; pp.push([x, y0 + r * Math.cos(ang), r * Math.sin(ang)]); } st.flow(st.curve(pp), { color: k.COLD, count: 14, speed: 0.03, size: 0.05, vel: u => { const r = rAt(-4.6 + 9.2 * u); return R1 * R1 / (r * r); } }); }
      [-3.9, 3.4].forEach(x => st.box(0.4, y0 - R1, 1.0, { pos: [x, (y0 - R1) / 2, 0], tint: '#efe6d2' }));
    }
  };
  window.PCME_SB_DEMOS = D;
})();
