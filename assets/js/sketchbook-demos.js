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
  D.reactor = {
    cam: { az: -0.4, el: 0.3, dist: 10, ty: 1.9 },
    build(st, k) {
      const T = window.THREE, R = 1.0, Hs = 1.7, y0 = 1.4;
      for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5; st.box(0.12, y0 + 0.1, 0.12, { pos: [Math.cos(a) * R * 0.85, (y0 + 0.1) / 2, Math.sin(a) * R * 0.85], tint: '#efe6d2' }); }
      st.cyl(R + 0.14, R + 0.14, Hs * 0.8, { pos: [0, y0 + Hs * 0.4, 0], opacity: 0.16, tint: '#cfe0f7', seg: 44 });
      st.cyl(R, R, Hs, { pos: [0, y0 + Hs / 2, 0], opacity: 0.24, tint: '#e4ecf3', seg: 48, open: true });
      st.solid(new T.SphereGeometry(R, 36, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), { pos: [0, y0, 0], scale: [1, 0.5, 1], opacity: 0.24, tint: '#e4ecf3' });
      st.solid(new T.SphereGeometry(R, 36, 14, 0, Math.PI * 2, 0, Math.PI / 2), { pos: [0, y0 + Hs, 0], scale: [1, 0.5, 1], opacity: 0.3, tint: '#e4ecf3' });
      const top = y0 + Hs + 0.5; st.box(0.5, 0.35, 0.5, { pos: [0, top + 0.2, 0], tint: '#e3d9c4' }); st.cyl(0.24, 0.24, 0.7, { pos: [0, top + 0.72, 0], tint: '#dde3d2' });
      st.cyl(R - 0.03, R - 0.03, Hs * 0.6, { pos: [0, y0 + Hs * 0.3, 0], tint: '#8fb4e6', opacity: 0.5, hull: false, edges: false });
      st.cyl(R - 0.04, R - 0.04, 0.12, { pos: [0, y0 + Hs * 0.6 + 0.06, 0], tint: '#c7a8e3', opacity: 0.8, hull: false, edges: false });
      const ag = new T.Group(); st.world.add(ag);
      st.cyl(0.04, 0.04, Hs + 0.4, { parent: ag, pos: [0, y0 + Hs / 2 + 0.15, 0], tint: '#d6d0c4', hull: false });
      for (let i = 0; i < 3; i++) { const b = st.box(0.55, 0.05, 0.16, { parent: ag, pos: [0, y0 - 0.18, 0], tint: '#d6d0c4', hull: false }); b.rotation.y = i * 2.094; b.children.forEach(c => { c.position.x = 0.27; }); }
      st.onFrame(dt => { ag.rotation.y += dt * 4; });
      st.cyl(0.11, 0.11, 0.4, { pos: [0.55, top - 0.05, 0], tint: '#e3d9c4' });
      st.flow(st.curve([[0.55, top - 0.3, 0], [0.55, y0 + Hs * 0.62, 0]]), { color: '#6b3fa0', count: 10, speed: 0.8, size: 0.05 });
      st.flow(st.curve([[R + 0.5, y0 - 0.2, 0.4], [R + 0.16, y0 + 0.1, 0.3], [0.4, y0 + 0.7, R + 0.16], [-R - 0.16, y0 + 1.0, 0.3], [-R - 0.5, y0 + 1.3, 0]]), { color: k.COLD, count: 36, speed: 0.15, size: 0.05 });
    }
  };
  D.plant = {
    cam: { az: -0.5, el: 0.62, dist: 15, ty: 0.6 },
    build(st, k) {
      const bld = (x, z, w, h, d, tint) => st.box(w, h, d, { pos: [x, h / 2, z], tint });
      bld(0, 0, 3.0, 2.6, 2.0, '#f3c96b'); [0.9, 1.75].forEach(y => st.line([[-1.5, y, 1.0], [1.5, y, 1.0]], { opacity: 0.5 }));
      bld(0, 2.6, 1.6, 0.8, 1.0, '#e6edf3'); bld(-4.2, 1.0, 2.0, 1.4, 1.6, '#e7e0d0'); st.cyl(0.14, 0.18, 2.4, { pos: [-4.8, 1.2, 1.4], tint: '#ddd' });
      st.cyl(0.8, 1.0, 1.4, { pos: [-4.2, 0.7, -1.8], tint: '#dfe8ef', seg: 28 }); st.box(3.0, 0.25, 2.0, { pos: [4.4, 0.12, -1.6], tint: '#e3dccb' });
      [[3.6, -2.1], [4.4, -2.1], [5.2, -2.1], [3.6, -1.1], [4.4, -1.1], [5.2, -1.1]].forEach(([x, z]) => st.cyl(0.32, 0.32, 1.0, { pos: [x, 0.62, z], tint: '#efe6d2', seg: 20 }));
      bld(4.4, 1.4, 2.6, 1.1, 1.4, '#ece4d2'); bld(2.3, 3.1, 1.4, 0.8, 1.0, '#e8eef0');
      st.cyl(0.7, 0.7, 0.35, { pos: [-2.2, 0.18, -3.4], tint: '#dbe6d8', seg: 28 }); st.cyl(0.6, 0.6, 1.2, { pos: [2.6, 0.6, -3.4], tint: '#f2d4cc', seg: 24 });
      st.flow(st.curve([[-3.2, 1.6, 1.0], [-1.5, 2.2, 0.6], [0, 2.7, 0]]), { color: k.HOT, count: 16, speed: 0.15, size: 0.06 });
      st.flow(st.curve([[-3.4, 0.6, -1.4], [-1.5, 0.8, -0.6], [0, 1.0, 0]]), { color: k.COLD, count: 16, speed: 0.15, size: 0.06 });
    }
  };
  window.PCME_SB_DEMOS = D;
})();
