/* PharmaChemE process modelling tools: heating/cooling time, semi-batch dosing, kinetics fitting,
   mixing and mass transfer scale-up, solvent swap. Pages place <div class="pm-tool" data-tool="id"></div>.
   Everything runs in the browser; no data leaves the page. */
(function () {
  'use strict';
  const F = (x, d) => (isFinite(x) ? Number(x).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–');
  const G = x => { if (!isFinite(x)) return '–'; const a = Math.abs(x); return a === 0 ? '0' : a >= 1000 ? F(x, 0) : a >= 100 ? F(x, 1) : a >= 1 ? F(x, 2) : a >= 0.01 ? F(x, 3) : Number(x).toExponential(2); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const hm = h => { if (!isFinite(h)) return '–'; const m = Math.round(h * 60); return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min'; };
  const C = { brass: '#C9A227', blue: '#5B9BFF', green: '#5FD07A', rust: '#E0785A', violet: '#B38CFF', teal: '#4FC3C7', muted: '#7F95AB' };
  const SER = [C.brass, C.blue, C.green, C.rust, C.violet, C.teal];
  const R_GAS = 8.314, KCAL = 4186.8, WK = 1.163, KH = 0.859845; // J per kcal, W/m²K per kcal/h·m²·°C, kcal/h per W

  /* ---------------- SVG line chart with hover readout ---------------- */
  function niceTicks(lo, hi, n) {
    if (!(hi > lo)) { hi = lo + 1; }
    const span = hi - lo, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0))), r = step0 / mag;
    const step = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag, t = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) t.push(+v.toPrecision(12));
    return { t, step, lo: Math.min(lo, t[0]), hi: Math.max(hi, t[t.length - 1]) };
  }
  function chart(host, o) {
    const W = 640, H = 300, L = 58, Rm = 14, T = 16, B = 44;
    const lines = o.series.filter(s => s.pts && s.pts.length);
    let xs = [], ys = [];
    lines.forEach(s => s.pts.forEach(p => { if (isFinite(p[0]) && isFinite(p[1])) { xs.push(p[0]); ys.push(p[1]); } }));
    (o.hlines || []).forEach(h => isFinite(h.y) && ys.push(h.y));
    if (!xs.length) { host.innerHTML = ''; return; }
    let x0 = o.xmin != null ? o.xmin : Math.min(...xs), x1 = o.xmax != null ? o.xmax : Math.max(...xs);
    let y0 = o.ymin != null ? o.ymin : Math.min(...ys), y1 = o.ymax != null ? o.ymax : Math.max(...ys);
    const log = !!o.ylog;
    if (log) { const pos = ys.filter(y => y > 0); y0 = Math.log10(Math.max(o.ymin || Math.min(...pos), 1e-6)); y1 = Math.log10(Math.max(...pos)); y0 = Math.floor(y0); y1 = Math.ceil(y1); if (y1 <= y0) y1 = y0 + 1; }
    else { const pad = (y1 - y0) * 0.06 || 1; if (o.ymin == null) y0 -= pad; if (o.ymax == null) y1 += pad; }
    const xt = niceTicks(x0, x1, 6); if (o.xmin == null) x0 = xt.lo; if (o.xmax == null) x1 = xt.hi;
    const yt = log ? { t: Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i) } : niceTicks(y0, y1, 5);
    if (!log) { y0 = Math.min(y0, yt.t[0]); y1 = Math.max(y1, yt.t[yt.t.length - 1]); }
    const X = x => L + (x - x0) / (x1 - x0 || 1) * (W - L - Rm), Y = y => { const v = log ? Math.log10(Math.max(y, 1e-12)) : y; return T + (1 - (v - y0) / (y1 - y0 || 1)) * (H - T - B); };
    const dec = st => Math.max(0, Math.min(4, -Math.floor(Math.log10(st) + 1e-9))), xd = dec(xt.step), yd = log ? 0 : dec(yt.step);
    const tl = v => log ? (Math.pow(10, v) >= 1 ? F(Math.pow(10, v), 0) : String(+Math.pow(10, v).toPrecision(1))) : F(v, yd);
    let s = `<svg viewBox="0 0 ${W} ${H}" class="pm-svg" role="img" aria-label="${esc(o.title)}">`;
    yt.t.forEach(v => { const yy = T + (1 - (v - y0) / (y1 - y0 || 1)) * (H - T - B); s += `<line x1="${L}" x2="${W - Rm}" y1="${yy}" y2="${yy}" class="pm-grid"/><text x="${L - 6}" y="${yy + 4}" class="pm-tk" text-anchor="end">${tl(v)}</text>`; });
    xt.t.filter(v => v >= x0 - 1e-9 && v <= x1 + 1e-9).forEach(v => { const xx = X(v); s += `<line x1="${xx}" x2="${xx}" y1="${T}" y2="${H - B}" class="pm-grid"/><text x="${xx}" y="${H - B + 16}" class="pm-tk" text-anchor="middle">${F(v, xd)}</text>`; });
    s += `<text x="${(L + W - Rm) / 2}" y="${H - 6}" class="pm-ax" text-anchor="middle">${esc(o.xLabel)}</text><text transform="translate(13 ${(T + H - B) / 2}) rotate(-90)" class="pm-ax" text-anchor="middle">${esc(o.yLabel)}</text>`;
    (o.hlines || []).forEach(h => { if (!isFinite(h.y)) return; const yy = Y(h.y); if (yy < T - 1 || yy > H - B + 1) return; s += `<line x1="${L}" x2="${W - Rm}" y1="${yy}" y2="${yy}" stroke="${h.color}" stroke-dasharray="6 4" stroke-width="1.5"/><text x="${W - Rm - 4}" y="${yy - 5}" fill="${h.color}" class="pm-hl" text-anchor="end">${esc(h.label)}</text>`; });
    lines.forEach(se => {
      if (se.dots) se.pts.forEach(p => { s += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="3.6" fill="${se.color}"/>`; });
      else { const d = se.pts.filter(p => isFinite(p[1]) && (!log || p[1] > 0)).map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(''); s += `<path d="${d}" fill="none" stroke="${se.color}" stroke-width="2.2"${se.dash ? ' stroke-dasharray="7 5"' : ''}/>`; }
    });
    s += `<line class="pm-cross" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"/><rect x="${L}" y="${T}" width="${W - L - Rm}" height="${H - T - B}" fill="transparent" class="pm-hit"/></svg>`;
    const leg = lines.filter(se => se.name).map(se => `<span><i style="background:${se.color}${se.dash ? ';opacity:.7' : ''}"></i>${esc(se.name)}</span>`).join('');
    host.innerHTML = `<figure class="pm-fig"><figcaption>${esc(o.title)}</figcaption>${s}<div class="pm-leg">${leg}</div><div class="pm-tip" hidden></div></figure>`;
    const svg = host.querySelector('svg'), cross = svg.querySelector('.pm-cross'), tip = host.querySelector('.pm-tip'), hit = svg.querySelector('.pm-hit');
    const interp = (pts, x) => { if (!pts.length || x < pts[0][0] || x > pts[pts.length - 1][0]) return NaN; let i = 1; while (i < pts.length && pts[i][0] < x) i++; if (i >= pts.length) return pts[pts.length - 1][1]; const a = pts[i - 1], b = pts[i]; return b[0] === a[0] ? b[1] : a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); };
    function move(ev) {
      const r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * W; if (px < L || px > W - Rm) return leave();
      const x = x0 + (px - L) / (W - L - Rm) * (x1 - x0); cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.setAttribute('visibility', 'visible');
      const rows = lines.filter(se => !se.dots && se.name).map(se => [se, interp(se.pts, x)]).filter(r2 => isFinite(r2[1]));
      if (!rows.length) return leave();
      tip.innerHTML = `<b>${esc(o.xLabel)}: ${G(x)}</b>` + rows.map(r2 => `<span><i style="background:${r2[0].color}"></i>${esc(r2[0].name)}: ${G(r2[1])}</span>`).join('');
      tip.hidden = false; const left = (px / W) * 100; tip.style.left = left > 60 ? '' : (left + 2) + '%'; tip.style.right = left > 60 ? (100 - left + 2) + '%' : '';
    }
    function leave() { cross.setAttribute('visibility', 'hidden'); tip.hidden = true; }
    hit.addEventListener('pointermove', move); hit.addEventListener('pointerleave', leave);
  }

  /* ---------------- tool shell: inputs, results, charts, PDF ---------------- */
  // links that carry the inputs: everything after "#s=" stays in the browser and is never sent to a server
  const pcmeEnc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const pcmeLink = (o) => location.origin + location.pathname + "#s=" + pcmeEnc(o);
  const pcmeRead = (k) => { try { const m = location.hash.match(/[#&]s=([A-Za-z0-9_-]+)/); if (!m) return null; const o = JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))))); return o && o.k === k ? o : null; } catch (e) { return null; } };
  function shell(el, spec) {
    const v = {}; spec.groups.forEach(g => g.inputs.forEach(i => v[i.k] = i.v));
    const toolId = el.dataset.tool;
    { const st = pcmeRead('pm'); if (st && st.id === toolId && st.v) Object.keys(v).forEach(k => { if (st.v[k] !== undefined) v[k] = st.v[k]; }); }
    el.innerHTML = `<div class="ut-card pm-card"><div class="ut-hd"><h2>${esc(spec.title)}</h2><p>${esc(spec.sub)}</p></div>
      <div class="ut-body"><form class="ut-in pm-in" autocomplete="off"></form><div class="ut-out" aria-live="polite"></div></div>
      <div class="pm-more"></div>
      <div class="ut-tools"><button type="button" class="ut-xl">Download PDF</button><span>your inputs and results</span></div></div>`;
    const form = el.querySelector('form'), out = el.querySelector('.ut-out'), more = el.querySelector('.pm-more'), xb = el.querySelector('.ut-xl');
    let last = null, timer = 0;
    function drawInputs() {
      form.innerHTML = spec.groups.filter(g => !g.show || g.show(v)).map(g => `<p class="pm-gh">${esc(g.title)}</p>` + g.inputs.filter(i => !i.show || i.show(v)).map(i => {
        const lab = `<span>${esc(i.label)}${i.unit && i.type !== 'sel' ? ` <i>${esc(i.unit)}</i>` : ''}</span>`;
        if (i.type === 'sel') return `<label class="ut-f${i.wide ? ' pm-wide' : ''}">${lab}<select data-k="${i.k}">${i.opts.map(o => `<option value="${esc(o[0])}"${o[0] === v[i.k] ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select></label>`;
        if (i.type === 'area') return `<label class="ut-f pm-wide">${lab}<textarea data-k="${i.k}" rows="${i.rows || 8}" spellcheck="false">${esc(v[i.k])}</textarea></label>`;
        return `<label class="ut-f">${lab}<input data-k="${i.k}" type="number" step="any" inputmode="decimal" value="${v[i.k]}"></label>`;
      }).join('')).join('');
    }
    function find(k) { for (const g of spec.groups) for (const i of g.inputs) if (i.k === k) return i; }
    function calc() {
      const bad = []; spec.groups.forEach(g => { if (g.show && !g.show(v)) return; g.inputs.forEach(i => { if (i.type !== 'sel' && i.type !== 'area' && (!i.show || i.show(v)) && !isFinite(v[i.k])) bad.push(i.label); }); });
      if (bad.length) { out.innerHTML = '<p class="ut-empty">Fill in every value to see the result.</p>'; more.innerHTML = ''; last = null; return; }
      let r; try { r = spec.run(v); } catch (e) { console.error(e); r = { rows: [], notes: [['Could not calculate with these inputs. Check the values.', 'bad']] }; }
      last = r;
      out.innerHTML = (r.rows && r.rows.length ? `<dl class="ut-res">${r.rows.map((x, j) => `<div${j === 0 ? ' class="lead"' : ''}><dt>${esc(x[0])}</dt><dd>${esc(x[1])} <small>${esc(x[2] || '')}</small></dd></div>`).join('')}</dl>` : '') +
        (r.actions || []).map((a, j) => `<button type="button" class="ut-xl pm-act" data-a="${j}">${esc(a.label)}</button>`).join('') +
        (r.actionMsg ? `<p class="ut-note warn">${r.actionMsg}</p>` : '') +
        (r.notes || []).map(n => `<p class="ut-note ${n[1] || ''}">${n[0]}</p>`).join('');
      out.querySelectorAll('.pm-act').forEach(b => b.addEventListener('click', () => { const a = r.actions[+b.dataset.a]; b.disabled = true; b.textContent = 'Working…'; setTimeout(() => { const res = a.run(v); if (res && res.set) { Object.assign(v, res.set); drawInputs(); } spec._msg = res && res.msg; calc(); spec._msg = null; }, 20); }));
      more.innerHTML = (r.html || '') + (r.charts || []).map((_, j) => `<div class="pm-chart" data-c="${j}"></div>`).join('');
      (r.charts || []).forEach((c, j) => chart(more.querySelector(`[data-c="${j}"]`), c));
    }
    function sched() { clearTimeout(timer); timer = setTimeout(calc, spec.delay || 120); }
    form.addEventListener('input', e => {
      const k = e.target.dataset.k; if (!k) return; const i = find(k);
      v[k] = i.type === 'sel' || i.type === 'area' ? e.target.value : (e.target.value === '' ? NaN : +e.target.value);
      if (i.type === 'sel') { const o = spec.onSel && spec.onSel(k, v[k], v); if (o) Object.assign(v, o); drawInputs(); const f2 = form.querySelector(`[data-k="${k}"]`); if (f2) f2.focus(); }
      sched();
    });
    xb.addEventListener('click', () => {
      if (!last) { alert('Fill in every value first.'); return; }
      if (!window.PCME_XL || !window.PCME_XL.dataBook) { alert('Download is not available on this page.'); return; }
      const ins = []; spec.groups.forEach(g => { if (g.show && !g.show(v)) return; g.inputs.forEach(i => { if (i.show && !i.show(v)) return; ins.push([i.label, i.type === 'sel' ? (i.opts.find(o => o[0] === v[i.k]) || [, v[i.k]])[1] : v[i.k], i.type === 'sel' || i.type === 'area' ? '' : (i.unit || '')]); }); });
      xb.disabled = true; xb.textContent = 'Preparing…';
      window.PCME_XL.dataBook({ link: pcmeLink({ k: 'pm', id: toolId, v }), title: spec.title, sub: spec.sub, inputs: ins, results: (last.rows || []).concat(last.xlRows || []), notes: (last.notes || []).map(n => n[0]), tables: last.tables || [] })
        .then(() => { xb.disabled = false; xb.textContent = 'Download PDF'; }, e => window.PCME_XL.fail(xb, e));
    });
    drawInputs(); calc();
  }
  const tableHTML = (head, rows, cls) => `<div class="ut-table-wrap"><table class="ut-table ${cls || ''}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const thin = (arr, n) => { if (arr.length <= n) return arr; const step = (arr.length - 1) / (n - 1), o = []; for (let i = 0; i < n; i++) o.push(arr[Math.round(i * step)]); return o; };

  const TOOLS = {};

  /* ======================= 1. Heating and cooling time ======================= */
  TOOLS.heatcool = {
    title: 'Heating and cooling time simulator', sub: 'Batch temperature against time in a jacketed reactor, with the jacket duty and utility use',
    groups: [
      { title: 'Batch', inputs: [{ k: 'm', label: 'Batch mass', unit: 'kg', v: 5000 }, { k: 'cp', label: 'Specific heat of the batch', unit: 'kcal/kg·°C', v: 0.48 },
        { k: 'T0', label: 'Start temperature', unit: '°C', v: 25 }, { k: 'Tt', label: 'Target temperature', unit: '°C', v: 80 }] },
      { title: 'Jacket', inputs: [{ k: 'U', label: 'Overall heat transfer coefficient U', unit: 'kcal/h·m²·°C', v: 300 }, { k: 'A', label: 'Wetted jacket area', unit: 'm²', v: 10 },
        { k: 'mode', label: 'How the jacket is run', type: 'sel', wide: true, v: 'const', opts: [['const', 'Utility at a fixed temperature (steam, or high-flow brine)'], ['flow', 'Liquid utility with limited flow (water, brine, thermic fluid)'], ['dt', 'Glass-lined: jacket kept within a set ΔT of the batch']] },
        { k: 'Tu', label: 'Utility temperature (steam saturation or coolant supply)', unit: '°C', v: 140 },
        { k: 'F', label: 'Utility flow', unit: 'm³/h', v: 20, show: v => v.mode === 'flow' }, { k: 'rj', label: 'Utility density', unit: 'kg/m³', v: 1000, show: v => v.mode === 'flow' },
        { k: 'cj', label: 'Utility specific heat', unit: 'kcal/kg·°C', v: 1.0, show: v => v.mode === 'flow' },
        { k: 'dT', label: 'Largest allowed jacket-to-batch ΔT', unit: '°C', v: 60, show: v => v.mode === 'dt' }] },
      { title: 'Other heat in and out', inputs: [{ k: 'Pa', label: 'Agitator power into the batch', unit: 'kW', v: 3 }, { k: 'UL', label: 'Heat loss to surroundings (UA)', unit: 'kcal/h·°C', v: 0 }, { k: 'Ta', label: 'Ambient temperature', unit: '°C', v: 30 }] }],
    run(v) {
      const heat = v.Tt > v.T0, notes = [];
      if (v.Tt === v.T0) return { rows: [], notes: [['Start and target temperatures are the same.', 'bad']] };
      if (!(v.m > 0 && v.cp > 0 && v.U > 0 && v.A > 0)) return { rows: [], notes: [['Mass, specific heat, U and area must be above zero.', 'bad']] };
      if (heat && v.Tu <= v.Tt) notes.push(['The utility is not hotter than the target, so the batch can only approach the utility temperature. Raise the utility temperature.', 'bad']);
      if (!heat && v.Tu >= v.Tt) notes.push(['The coolant is not colder than the target, so the batch can only approach the coolant temperature. Use a colder coolant.', 'bad']);
      const UA = v.U * WK * v.A, Cb = v.m * v.cp * KCAL, Cj = v.F / 3600 * v.rj * v.cj * KCAL;
      if (v.mode === 'flow' && !(Cj > 0)) return { rows: [], notes: [['Utility flow, density and specific heat must be above zero.', 'bad']] };
      const Qj = T => v.mode === 'flow' ? Cj * (v.Tu - T) * (1 - Math.exp(-UA / Cj)) : v.mode === 'dt' ? UA * clamp(v.Tu - T, -v.dT, v.dT) : UA * (v.Tu - T);
      const Tj = T => v.mode === 'flow' ? v.Tu - Qj(T) / Cj : v.mode === 'dt' ? T + clamp(v.Tu - T, -v.dT, v.dT) : v.Tu;
      const f = T => (Qj(T) + v.Pa * 1000 - v.UL * WK * (T - v.Ta)) / Cb;
      const tau = Cb / UA, dt = clamp(tau / 500, 0.5, 30), tmax = 72 * 3600;
      let t = 0, T = v.T0, E = 0, peak = 0, reached = false, tr = NaN; const pts = [[0, T, Tj(T), Qj(T) * KH]];
      const every = Math.max(1, Math.round(tmax / dt / 4000));
      for (let n = 1; t < tmax; n++) {
        const k1 = f(T), k2 = f(T + dt / 2 * k1), k3 = f(T + dt / 2 * k2), k4 = f(T + dt * k3), Tn = T + dt / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
        const q = Qj(T); E += Math.abs(q) * dt; peak = Math.max(peak, Math.abs(q));
        if (heat ? Tn >= v.Tt : Tn <= v.Tt) { tr = t + dt * (v.Tt - T) / (Tn - T); reached = true; T = v.Tt; t = tr; pts.push([t / 3600, T, Tj(T), Qj(T) * KH]); break; }
        T = Tn; t += dt;
        if (n % every === 0) pts.push([t / 3600, T, Tj(T), Qj(T) * KH]);
        if (Math.abs(k1) * tau < 1e-4 && t > 5 * tau) break;
      }
      let Teq = NaN;
      if (!reached) { let a = -100, b = 400; for (let i = 0; i < 80; i++) { const mdl = (a + b) / 2; (f(mdl) > 0) ? a = mdl : b = mdl; } Teq = (a + b) / 2; }
      const th = (reached ? tr : t) / 3600, Ekwh = E / 3.6e6, rows = [];
      rows.push([heat ? 'Time to heat to target' : 'Time to cool to target', reached ? hm(th) : 'not reached', reached ? '(' + F(th, 2) + ' h)' : '']);
      if (!reached) rows.push(['Batch levels off at about', F(Teq, 1), '°C']);
      rows.push(['Average jacket duty', F(Ekwh / th * 1000 * KH, 0), 'kcal/h'], ['Peak jacket duty (at the start)', F(peak * KH, 0), 'kcal/h']);
      if (!heat) rows.push(['Peak refrigeration load', F(peak / 1000 / 3.517, 1), 'TR']);
      rows.push(['Heat through the jacket', F(E / KCAL, 0), 'kcal']);
      if (heat && v.mode !== 'flow' && v.Tu > 100 && v.Tu < 300) { const hfg = 2257 * Math.pow((647.1 - (v.Tu + 273.15)) / (647.1 - 373.15), 0.38); rows.push(['Steam used (if the utility is saturated steam)', F(E / 1000 / hfg, 0), 'kg']); }
      if (v.mode === 'flow') rows.push(['Utility outlet temperature at the start', F(Tj(v.T0), 1), '°C']);
      rows.push(['Time constant m·c_p / UA', F(tau / 60, 0), 'min']);
      if (v.mode === 'const' && !v.Pa && !v.UL && reached) notes.push([`Check: with a fixed utility temperature the time is t = (m·c<sub>p</sub>/UA) × ln[(T<sub>u</sub> − T<sub>0</sub>)/(T<sub>u</sub> − T<sub>target</sub>)] = ${F(tau / 3600 * Math.log((v.Tu - v.T0) / (v.Tu - v.Tt)), 2)} h, the same as the simulation.`, 'good']);
      if (v.mode === 'const') notes.push(['A fixed utility temperature is right for condensing steam, and for brine only when its flow is high. If the brine warms up noticeably across the jacket, use the limited-flow option.']);
      if (v.mode === 'dt') notes.push(['The jacket is held within the allowed ΔT of the batch, which is how glass-lined vessels are protected from thermal shock. Take the allowed ΔT from your vessel maker\'s thermal shock chart.']);
      notes.push(['Heating and cooling slow down near the target because the driving ΔT shrinks. On scale-up the wetted area per kg falls, so the same batch takes longer in a bigger vessel. Get U from the <a href="/calculators/overall-heat-transfer-coefficient-calculator/">overall U calculator</a>.']);
      const tbl = thin(pts, 40).map(p => [F(p[0], 2), F(p[1], 1), F(p[2], 1), F(p[3], 0)]);
      return { rows, notes,
        charts: [{ title: 'Batch and jacket temperature', xLabel: 'Time (h)', yLabel: 'Temperature (°C)', series: [{ name: 'Batch', color: C.brass, pts: pts.map(p => [p[0], p[1]]) }, { name: v.mode === 'flow' ? 'Utility outlet' : 'Jacket', color: heat ? C.rust : C.blue, pts: pts.map(p => [p[0], p[2]]), dash: true }], hlines: [{ y: v.Tt, label: 'Target', color: C.green }] },
          { title: 'Jacket duty', xLabel: 'Time (h)', yLabel: 'Duty (kcal/h)', series: [{ name: heat ? 'Heat into the batch' : 'Heat removed', color: heat ? C.rust : C.blue, pts: pts.map(p => [p[0], Math.abs(p[3])]) }], ymin: 0 }],
        tables: [{ name: 'Profile', head: ['Time (h)', 'Batch (°C)', 'Jacket or outlet (°C)', 'Duty (kcal/h)'], rows: pts.map(p => [+p[0].toFixed(4), +p[1].toFixed(2), +p[2].toFixed(2), Math.round(p[3])]) }],
        html: `<details class="pm-det"><summary>Show the profile as a table</summary>${tableHTML(['Time (h)', 'Batch (°C)', 'Jacket or outlet (°C)', 'Duty (kcal/h)'], tbl)}</details>` };
    }
  };

  /* ======================= 2. Semi-batch dosing ======================= */
  function stoessel(MTSR, MTT, TD24) {
    if (MTSR < MTT) return MTSR < TD24 ? (MTT < TD24 ? 1 : 2) : 5;
    return MTSR < TD24 ? 3 : (MTT < TD24 ? 4 : 5);
  }
  function dosingSim(v, td, nstep) {
    const tot = td + Math.max(0, v.th), dt = tot / nstep, Tk = v.Tr + 273.15, Tref = v.Tref + 273.15;
    const k = v.k * Math.exp(-v.Ea * KCAL / R_GAS * (1 / Tk - 1 / Tref));
    const FB = v.nB / td, FV = v.Vd / td, Fm = v.md / td, nlim = v.order === '2' ? Math.min(v.nA, v.nB) : v.nB;
    const vol = t => (v.V0 + FV * Math.min(t, td)) / 1000, mass = t => v.m0 + Fm * Math.min(t, td), area = t => v.A0 + (v.A1 - v.A0) * Math.min(t, td) / td;
    const rate = (t, a, b) => v.order === '2' ? k * Math.max(a, 0) * Math.max(b, 0) / vol(t) : k * Math.max(b, 0); // kmol/h
    const der = (t, a, b) => { const r = rate(t, a, b), feed = t < td ? FB : 0; return [v.order === '2' ? -r : 0, feed - r]; };
    let a = v.order === '2' ? v.nA : 0, b = 0, t = 0;
    const pts = [], cap = t2 => v.U * area(t2) * (v.Tr - v.Tj); // kcal/h
    let maxM = -Infinity, tM = 0, maxAcc = 0, peakQ = 0, tQ = 0, peakNeed = 0, short = 0, convEndDose = NaN, t99 = NaN, reacted = 0;
    const every = Math.max(1, Math.floor(nstep / 600));
    for (let i = 0; i <= nstep; i++) {
      const r = rate(t, a, b), qr = r * 1000 * v.dH, qf = t < td ? Fm * v.cp * (v.Tf - v.Tr) : 0, need = qr + qf, c = cap(t); // kcal/h
      const pot = v.order === '2' ? Math.min(a, b) : b, m = mass(t), mtsr = v.Tr + pot * 1000 * v.dH / (m * v.cp), acc = pot / nlim * 100, conv = reacted / nlim * 100;
      if (mtsr > maxM) { maxM = mtsr; tM = t; } if (acc > maxAcc) maxAcc = acc; if (qr > peakQ) { peakQ = qr; tQ = t; }
      if (need > peakNeed) peakNeed = need; if (need > c) short = Math.max(short, need - c);
      if (!isFinite(convEndDose) && t >= td - dt / 2) convEndDose = conv;
      if (!isFinite(t99) && conv >= 99) t99 = t;
      if (i % every === 0 || i === nstep) pts.push([t, qr, need, c, acc, conv, mtsr]);
      if (i === nstep) break;
      const h = dt, k1 = der(t, a, b), k2 = der(t + h / 2, a + h / 2 * k1[0], b + h / 2 * k1[1]), k3 = der(t + h / 2, a + h / 2 * k2[0], b + h / 2 * k2[1]), k4 = der(t + h, a + h * k3[0], b + h * k3[1]);
      const r1 = rate(t, a, b), r2 = rate(t + h / 2, a + h / 2 * k1[0], b + h / 2 * k1[1]), r3 = rate(t + h / 2, a + h / 2 * k2[0], b + h / 2 * k2[1]), r4 = rate(t + h, a + h * k3[0], b + h * k3[1]);
      reacted += h / 6 * (r1 + 2 * r2 + 2 * r3 + r4);
      a += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); b += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]); t += h;
    }
    const mEnd = mass(tot), dTad = nlim * 1000 * v.dH / (mEnd * v.cp);
    return { k, pts, maxM, tM, maxAcc, peakQ, tQ, peakNeed, short, convEndDose, convEnd: reacted / nlim * 100, t99, dTad, nlim };
  }
  TOOLS.dosing = {
    title: 'Semi-batch dosing simulator', sub: 'Heat release, accumulation and MTSR while you dose a reagent into an exothermic reaction',
    delay: 200,
    groups: [
      { title: 'Initial charge in the reactor', inputs: [{ k: 'm0', label: 'Mass', unit: 'kg', v: 2000 }, { k: 'V0', label: 'Volume', unit: 'L', v: 2200 }, { k: 'nA', label: 'Substrate A charged', unit: 'kmol', v: 3.8, show: v => v.order === '2' }] },
      { title: 'Dosed reagent B', inputs: [{ k: 'md', label: 'Mass dosed', unit: 'kg', v: 900 }, { k: 'Vd', label: 'Volume dosed', unit: 'L', v: 1000 }, { k: 'nB', label: 'Reagent B dosed', unit: 'kmol', v: 4.0 },
        { k: 'td', label: 'Dosing time', unit: 'h', v: 3 }, { k: 'Tf', label: 'Feed temperature', unit: '°C', v: 25 }] },
      { title: 'Reaction', inputs: [{ k: 'order', label: 'Rate law', type: 'sel', wide: true, v: '2', opts: [['2', 'Second order: rate = k [A] [B]  (k in L/mol·h)'], ['1', 'First order in B: rate = k [B]  (k in 1/h)']] },
        { k: 'k', label: 'Rate constant at the reference temperature', unit: 'L/mol·h or 1/h', v: 0.8 }, { k: 'Tref', label: 'Reference temperature', unit: '°C', v: 20 }, { k: 'Ea', label: 'Activation energy', unit: 'kcal/mol', v: 14.3 },
        { k: 'dH', label: 'Heat of reaction (released, per mol of B)', unit: 'kcal/mol', v: 28.7 }, { k: 'cp', label: 'Specific heat of the mass', unit: 'kcal/kg·°C', v: 0.43 }] },
      { title: 'Process and cooling', inputs: [{ k: 'Tr', label: 'Reaction temperature', unit: '°C', v: 20 }, { k: 'th', label: 'Hold after dosing', unit: 'h', v: 4 }, { k: 'U', label: 'Overall U', unit: 'kcal/h·m²·°C', v: 215 },
        { k: 'A0', label: 'Wetted area at the start', unit: 'm²', v: 6 }, { k: 'A1', label: 'Wetted area at the end of dosing', unit: 'm²', v: 8 }, { k: 'Tj', label: 'Coolant temperature in the jacket', unit: '°C', v: -5 }] },
      { title: 'Safety limits', inputs: [{ k: 'MTT', label: 'MTT (boiling point or highest technical temperature)', unit: '°C', v: 65 }, { k: 'TD24', label: 'TD24 of the reaction mass', unit: '°C', v: 130 }] }],
    run(v) {
      if (!(v.td > 0 && v.m0 > 0 && v.V0 > 0 && v.nB > 0 && v.cp > 0 && v.k >= 0 && (v.order !== '2' || v.nA > 0))) return { rows: [], notes: [['Dosing time, masses, volumes, moles and specific heat must be above zero.', 'bad']] };
      if (!(v.Tr > v.Tj)) return { rows: [], notes: [['The coolant must be colder than the reaction temperature.', 'bad']] };
      const s = dosingSim(v, v.td, 20000), cls = stoessel(s.maxM, v.MTT, v.TD24);
      const rows = [['Highest MTSR', F(s.maxM, 1), '°C at ' + F(s.tM, 2) + ' h'], ['Stoessel class (screening)', String(cls), ''], ['Highest accumulation', F(s.maxAcc, 1), '% of the limiting reagent'],
        ['Peak heat of reaction', F(s.peakQ, 0), 'kcal/h at ' + F(s.tQ, 2) + ' h'], ['Peak cooling needed (reaction + feed)', F(s.peakNeed, 0), 'kcal/h'],
        ['Conversion at the end of dosing', F(s.convEndDose, 1), '%'], ['Conversion at the end of the hold', F(s.convEnd, 1), '%'], ['Time to 99 % conversion', isFinite(s.t99) ? F(s.t99, 2) : 'not reached', isFinite(s.t99) ? 'h from start of dosing' : 'in the time simulated'],
        ['ΔT adiabatic, whole charge', F(s.dTad, 1), '°C'], ['MTSR if everything were charged at once', F(v.Tr + s.dTad, 1), '°C'], ['Rate constant at the reaction temperature', G(s.k), v.order === '2' ? 'L/mol·h' : '1/h']];
      const notes = [];
      if (s.short > 0) notes.push([`The jacket cannot remove the heat at the peak: it falls short by ${F(s.short, 0)} kcal/h. The reactor would heat up and the reaction would run faster. Dose more slowly, use colder coolant or run at a lower concentration.`, 'bad']);
      if (s.maxM > v.TD24) notes.push(['After a cooling failure the batch could reach TD24 and start the decomposition. Change the process before scale-up.', 'bad']);
      else if (s.maxM > v.MTT) notes.push(['After a cooling failure the batch would reach the MTT (usually boiling). Check that the condenser and vent can take the boil-up.', 'warn']);
      else notes.push(['MTSR stays below the MTT and TD24 throughout dosing.', 'good']);
      if (s.maxAcc > 30) notes.push(['Accumulation is high: the reaction is slow compared with the dosing, so much of the dosed reagent sits unreacted. A higher reaction temperature (if MTSR allows) or slower dosing reduces it. Colder is not always safer.', 'warn']);
      notes.push(['The simulation assumes the reactor stays at the set temperature (ideal control), perfect mixing and a single reaction. MTSR at each moment = T<sub>r</sub> + (unreacted reagent × ΔH<sub>r</sub>) / (mass × c<sub>p</sub>). Fit k and E<sub>a</sub> from your own data with the <a href="/process-modelling/reaction-kinetics-fitting/">kinetics fitting tool</a>, or use RC1 results. This is a screening tool and does not replace a process safety assessment.']);
      const P = s.pts;
      return { rows, notes,
        actions: [{ label: 'Find the shortest safe dosing time', run(v2) {
          const okAt = td => { const r = dosingSim(v2, td, 4000); return r.maxM <= Math.min(v2.MTT, v2.TD24) && r.short <= 0; };
          let lo = 0.05, hi = 48;
          if (!okAt(hi)) return { msg: 'Even a 48-hour dosing time does not keep MTSR below the limits with enough cooling. Change temperature, concentration or cooling.' };
          if (okAt(lo)) return { set: { td: lo }, msg: 'Even very fast dosing stays within the limits (the reaction is fast and the cooling is ample).' };
          for (let i = 0; i < 30; i++) { const mid = Math.sqrt(lo * hi); okAt(mid) ? hi = mid : lo = mid; }
          const td = Math.ceil(hi * 4) / 4; return { set: { td }, msg: `Shortest dosing time that keeps MTSR below ${F(Math.min(v2.MTT, v2.TD24), 0)} °C with enough cooling: about ${F(hi, 2)} h. Set to ${F(td, 2)} h (rounded up). Add a margin for plant reality.` };
        } }],
        actionMsg: this._msg,
        charts: [
          { title: 'Heat of reaction and cooling', xLabel: 'Time from start of dosing (h)', yLabel: 'kcal/h', ymin: 0, series: [{ name: 'Heat of reaction', color: C.rust, pts: P.map(p => [p[0], p[1]]) }, { name: 'Cooling needed', color: C.brass, pts: P.map(p => [p[0], p[2]]), dash: true }, { name: 'Cooling available', color: C.blue, pts: P.map(p => [p[0], p[3]]) }] },
          { title: 'Accumulation and conversion', xLabel: 'Time from start of dosing (h)', yLabel: '% of limiting reagent', ymin: 0, ymax: 100, series: [{ name: 'Accumulation (unreacted)', color: C.rust, pts: P.map(p => [p[0], p[4]]) }, { name: 'Conversion', color: C.green, pts: P.map(p => [p[0], p[5]]) }] },
          { title: 'MTSR during dosing', xLabel: 'Time from start of dosing (h)', yLabel: 'Temperature (°C)', series: [{ name: 'MTSR', color: C.rust, pts: P.map(p => [p[0], p[6]]) }, { name: 'Reaction temperature', color: C.brass, pts: P.map(p => [p[0], v.Tr]) }], hlines: [{ y: v.MTT, label: 'MTT', color: C.blue }, { y: v.TD24, label: 'TD24', color: C.violet }] }],
        tables: [{ name: 'Profile', head: ['Time (h)', 'Heat of reaction (kcal/h)', 'Cooling needed (kcal/h)', 'Cooling available (kcal/h)', 'Accumulation (%)', 'Conversion (%)', 'MTSR (°C)'], rows: P.map(p => p.map(x => +x.toFixed(3))) }] };
    }
  };

  /* ======================= 3. Kinetics fitting ======================= */
  function Xmodel(model, t, k, n, CA0, M) {
    if (t <= 0) return 0;
    if (model === '1') return 1 - Math.exp(-k * t);
    if (model === '2') {
      if (Math.abs(M - 1) < 1e-6) { const z = k * CA0 * t; return z / (1 + z); }
      const E = Math.exp(Math.min(CA0 * (M - 1) * k * t, 700)); return M * (E - 1) / (M * E - 1);
    }
    if (Math.abs(n - 1) < 1e-6) return 1 - Math.exp(-k * t);
    const base = 1 + (n - 1) * k * Math.pow(CA0, n - 1) * t;
    if (n < 1 && base <= 0) return 1; return 1 - Math.pow(base, 1 / (1 - n));
  }
  function tFor(model, X, k, n, CA0, M) {
    if (model === '1' || (model === 'n' && Math.abs(n - 1) < 1e-6)) return -Math.log(1 - X) / k;
    if (model === '2') { if (Math.abs(M - 1) < 1e-6) return X / (k * CA0 * (1 - X)); if (M < 1 && X >= M) return Infinity; return Math.log((M - X) / (M * (1 - X))) / (k * CA0 * (M - 1)); }
    return (Math.pow(1 - X, 1 - n) - 1) / ((n - 1) * k * Math.pow(CA0, n - 1));
  }
  function fitK(data, model, n, CA0, M) {
    const sse = lk => { const k = Math.exp(lk); let s = 0; data.forEach(d => { const e = Xmodel(model, d[0], k, n, CA0, M) - d[1]; s += e * e; }); return s; };
    let best = -25, bv = Infinity; for (let lk = -25; lk <= 12; lk += 0.25) { const s = sse(lk); if (s < bv) { bv = s; best = lk; } }
    let a = best - 0.25, b = best + 0.25; const g = (Math.sqrt(5) - 1) / 2;
    for (let i = 0; i < 60; i++) { const c = b - g * (b - a), d = a + g * (b - a); sse(c) < sse(d) ? b = d : a = c; }
    const lk = (a + b) / 2; return { k: Math.exp(lk), sse: sse(lk) };
  }
  const SAMPLE = '40, 0, 0\n40, 10, 6.1\n40, 20, 12.3\n40, 40, 21.2\n40, 60, 29.0\n40, 90, 37.9\n40, 120, 45.9\n40, 180, 57.9\n40, 240, 65.0\n50, 0, 0\n50, 10, 13.5\n50, 20, 23.0\n50, 40, 38.0\n50, 60, 48.3\n50, 90, 57.8\n50, 120, 67.4\n50, 180, 76.8\n50, 240, 82.8\n60, 0, 0\n60, 10, 22.0\n60, 20, 37.1\n60, 40, 56.1\n60, 60, 67.2\n60, 90, 77.4\n60, 120, 83.0\n60, 180, 90.1\n60, 240, 92.7';
  TOOLS.kinetics = {
    title: 'Reaction kinetics fitting', sub: 'Fit a rate constant and activation energy to your conversion data, then predict the batch time at plant temperature',
    delay: 300,
    groups: [
      { title: 'Your data', inputs: [{ k: 'data', label: 'One point per line: temperature (°C), time (min), conversion (%). Paste from Excel or HPLC results.', type: 'area', v: SAMPLE, rows: 9 }] },
      { title: 'Model', inputs: [{ k: 'model', label: 'Rate law to fit', type: 'sel', wide: true, v: '2', opts: [['1', 'First order: A → products'], ['2', 'Second order: A + B → products'], ['n', 'nth order in A (also fits the order n)']] },
        { k: 'CA0', label: 'Starting concentration of A', unit: 'mol/L', v: 1.0, show: v => v.model !== '1' }, { k: 'M', label: 'Ratio B / A at the start', unit: 'mol/mol', v: 1.2, show: v => v.model === '2' }] },
      { title: 'Prediction', inputs: [{ k: 'Tp', label: 'Plant reaction temperature', unit: '°C', v: 45 }, { k: 'Xt', label: 'Target conversion', unit: '%', v: 99 }] }],
    run(v) {
      const pts = [];
      String(v.data).split(/\r?\n/).forEach(line => { const p = line.trim().split(/[\s,;\t]+/).map(Number); if (p.length >= 3 && p.slice(0, 3).every(isFinite)) pts.push(p.slice(0, 3)); });
      const byT = {}; pts.forEach(p => { (byT[p[0]] = byT[p[0]] || []).push([p[1], p[2] / 100]); });
      const temps = Object.keys(byT).map(Number).sort((a, b) => a - b).filter(T => byT[T].filter(d => d[0] > 0).length >= 2);
      if (!temps.length) return { rows: [], notes: [['Enter at least two points after time zero for one temperature, as: temperature, time, conversion.', 'bad']] };
      if (pts.some(p => p[2] < 0 || p[2] > 100)) return { rows: [], notes: [['Conversion must be between 0 and 100 %.', 'bad']] };
      if (v.model !== '1' && !(v.CA0 > 0)) return { rows: [], notes: [['Starting concentration must be above zero.', 'bad']] };
      if (v.model === '2' && !(v.M > 0)) return { rows: [], notes: [['The ratio B / A must be above zero.', 'bad']] };
      const model = v.model, CA0 = v.CA0, M = v.M;
      const fitAll = n => { let tot = 0; const ks = temps.map(T => { const r = fitK(byT[T], model, n, CA0, M); tot += r.sse; return r; }); return { ks, tot }; };
      let n = model === '1' ? 1 : model === '2' ? 2 : 1, fit;
      if (model === 'n') { let a = 0.2, b = 3.5; const g = (Math.sqrt(5) - 1) / 2; for (let i = 0; i < 40; i++) { const c = b - g * (b - a), d = a + g * (b - a); fitAll(c).tot < fitAll(d).tot ? b = d : a = c; } n = (a + b) / 2; }
      fit = fitAll(n);
      const kUnit = model === '1' || (model === 'n' && Math.abs(n - 1) < 0.02) ? '1/min' : model === '2' ? 'L/mol·min' : '(L/mol)^' + F(n - 1, 2) + '/min';
      const stats = temps.map((T, i) => { const d = byT[T], mean = d.reduce((s, x) => s + x[1], 0) / d.length, sst = d.reduce((s, x) => s + (x[1] - mean) ** 2, 0); return { T, k: fit.ks[i].k, r2: sst > 0 ? 1 - fit.ks[i].sse / sst : NaN, rms: Math.sqrt(fit.ks[i].sse / d.length) * 100, n: d.length }; });
      let Ea = NaN, lnA = NaN, r2A = NaN;
      if (temps.length >= 2) {
        const xs = stats.map(s => 1 / (s.T + 273.15)), ys = stats.map(s => Math.log(s.k)), mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
        const sxy = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0), sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0), slope = sxy / sxx;
        Ea = -slope * R_GAS / KCAL; lnA = my - slope * mx; const syy = ys.reduce((s, y) => s + (y - my) ** 2, 0); r2A = temps.length > 2 && syy > 0 ? sxy * sxy / (sxx * syy) : NaN;
      }
      const kAt = T => temps.length >= 2 ? Math.exp(lnA - Ea * KCAL / R_GAS / (T + 273.15)) : stats[0].k;
      const kp = kAt(v.Tp), Xt = clamp(v.Xt / 100, 0.01, 0.99999), tp = tFor(model, Xt, kp, n, CA0, M);
      const rows = [['Time to ' + F(v.Xt, 1) + ' % at ' + F(v.Tp, 0) + ' °C', isFinite(tp) ? hm(tp / 60) : 'not reachable', isFinite(tp) ? '(' + G(tp) + ' min)' : '']];
      if (temps.length >= 2) rows.push(['Activation energy E_a', F(Ea, 1), 'kcal/mol'], ['Pre-exponential factor A', Math.exp(lnA).toExponential(3), kUnit], ['Rate constant at ' + F(v.Tp, 0) + ' °C', G(kp), kUnit], ['Rate change per 10 °C near ' + F(v.Tp, 0) + ' °C', '× ' + F(kAt(v.Tp + 10) / kp, 2), '']);
      else rows.push(['Rate constant at ' + F(temps[0], 0) + ' °C', G(stats[0].k), kUnit]);
      if (model === 'n') rows.push(['Fitted reaction order n', F(n, 2), '']);
      const notes = [], minR2 = Math.min(...stats.map(s => s.r2).filter(isFinite));
      if (temps.length < 2) notes.push(['Data at one temperature only, so the activation energy cannot be found and the prediction is only valid at ' + F(temps[0], 0) + ' °C. Add runs at two or more other temperatures.', 'warn']);
      if (isFinite(minR2) && minR2 < 0.97) notes.push(['The fit is poor at one or more temperatures (R² below 0.97). Try another rate law, check the starting ratio, or look for an induction period or a second reaction.', 'warn']);
      if (isFinite(Ea) && (Ea < 5 || Ea > 48)) notes.push(['E<sub>a</sub> outside 5 to 48 kcal/mol is unusual for a chemical reaction. Check the data, or the reaction may be limited by mass transfer or dissolution.', 'warn']);
      if (temps.length >= 2 && (v.Tp < temps[0] - 15 || v.Tp > temps[temps.length - 1] + 15)) notes.push(['The plant temperature is more than 15 °C outside your data, so the prediction is an extrapolation. Confirm with a run near the plant temperature.', 'warn']);
      if (isFinite(r2A)) notes.push([`Arrhenius line R² = ${F(r2A, 4)}. ` + (r2A > 0.98 ? 'The rate constants follow Arrhenius well.' : 'Scatter in the Arrhenius plot: check the temperature control in each run.'), r2A > 0.98 ? 'good' : 'warn']);
      notes.push(['Fitted by least squares on conversion, constant volume, isothermal batch. The plant batch time also includes heating, dosing and sampling. If the plant is slower than this, look at mixing, gas-liquid mass transfer or solids dissolution.']);
      const tmax = Math.max(...pts.map(p => p[1]), isFinite(tp) && tp < 1e6 ? Math.min(tp, 3 * Math.max(...pts.map(p => p[1]))) : 0), grid = Array.from({ length: 121 }, (_, i) => tmax * i / 120);
      const series = []; temps.forEach((T, i) => { const c = SER[i % SER.length]; series.push({ name: F(T, 0) + ' °C data', color: c, dots: true, pts: byT[T].map(d => [d[0], d[1] * 100]) }); series.push({ name: F(T, 0) + ' °C fit', color: c, pts: grid.map(t => [t, Xmodel(model, t, stats[i].k, n, CA0, M) * 100]) }); });
      series.push({ name: 'Prediction at ' + F(v.Tp, 0) + ' °C', color: '#ECE7D8', dash: true, pts: grid.map(t => [t, Xmodel(model, t, kp, n, CA0, M) * 100]) });
      const charts = [{ title: 'Conversion against time', xLabel: 'Time (min)', yLabel: 'Conversion (%)', ymin: 0, ymax: 100, series, hlines: [{ y: v.Xt, label: 'Target', color: C.green }] }];
      if (temps.length >= 2) { const xa = stats.map(s => 1000 / (s.T + 273.15)), lo = Math.min(...xa), hi = Math.max(...xa); charts.push({ title: 'Arrhenius plot', xLabel: '1000 / (T °C + 273.15)', yLabel: 'ln k', series: [{ name: 'Fitted k', color: C.brass, dots: true, pts: stats.map((s, i) => [xa[i], Math.log(s.k)]) }, { name: 'Arrhenius line', color: C.blue, pts: [lo - 0.02, hi + 0.02].map(x => [x, lnA - Ea * KCAL / R_GAS * x / 1000]) }] }); }
      const tb = stats.map(s => [F(s.T, 0) + ' °C', G(s.k) + ' ' + kUnit, String(s.n), F(s.r2, 4), F(s.rms, 2) + ' %']);
      return { rows, notes, charts,
        html: tableHTML(['Temperature', 'Fitted k', 'Points', 'R²', 'RMS error (conversion)'], tb),
        tables: [{ name: 'Fit', head: ['Temperature (°C)', 'k (' + kUnit + ')', 'Points', 'R²', 'RMS error (% conversion)'], rows: stats.map(s => [s.T, s.k, s.n, s.r2, s.rms]) },
          { name: 'Data', head: ['Temperature (°C)', 'Time (min)', 'Measured conversion (%)', 'Model conversion (%)'], rows: pts.map(p => { const i = temps.indexOf(p[0]); return [p[0], p[1], p[2], i >= 0 ? +(Xmodel(model, p[1], stats[i].k, n, CA0, M) * 100).toFixed(2) : '']; }) }] };
    }
  };

  /* ======================= 4. Mixing and mass transfer scale-up ======================= */
  const IMP = { rushton: ['Rushton turbine (6 flat blades on a disc)', 5.0, 0.73], pbt: ['Pitched-blade turbine, 45°, 4 blades', 1.27, 0.53], hydro: ['Hydrofoil (high-efficiency axial)', 0.30, 0.40], rci: ['Retreat curve (glass-lined, with baffle)', 0.40, 0.33], anchor: ['Anchor', 0.60, 0.36] };
  const impOpts = Object.keys(IMP).map(k => [k, IMP[k][0]]);
  function vessel(v, s) {
    const Tm = v['T' + s], H = v['H' + s], D = v['D' + s], N = v['N' + s] / 60, Np = v['Np' + s], Ch = v['Ch' + s];
    const V = Math.PI / 4 * Tm * Tm * H, rho = v.rho, mu = v.mu / 1000, nu = mu / rho;
    const Re = rho * N * D * D / mu, P = Np * rho * N ** 3 * D ** 5, PV = P / V, tip = Math.PI * D * N, blend = 5.2 / (Math.pow(Np, 1 / 3) * N) * (Tm / D) ** 2;
    const kSI = v.kf * WK, Pr = v.cpf * KCAL * mu / kSI, h = Ch * Math.pow(Re, 2 / 3) * Math.pow(Pr, 1 / 3) * kSI / Tm / WK; // kcal/h·m²·°C
    let njsBase = NaN; if (v.ws > 0 && v.ws < 100 && v.rhos > rho) { const X = 100 * v.ws / (100 - v.ws); njsBase = Math.pow(nu, 0.1) * Math.pow(9.81 * (v.rhos - rho) / rho, 0.45) * Math.pow(X, 0.13) * Math.pow(v.dp * 1e-6, 0.2) * Math.pow(D, -0.85); }
    let kla = NaN, vs = NaN; if (v.vvm > 0) { vs = v.vvm * V / 60 / (Math.PI / 4 * Tm * Tm); const PgV = v.pg * PV; kla = (v.coal === 'c' ? 0.026 * Math.pow(PgV, 0.4) * Math.pow(vs, 0.5) : 0.002 * Math.pow(PgV, 0.7) * Math.pow(vs, 0.2)) * 3600; }
    return { Tm, H, D, N, Np, V, Re, P, PV, tip, blend, h, njsBase, kla, vs, torque: P / (2 * Math.PI * N) };
  }
  TOOLS.mixing = {
    title: 'Mixing and mass transfer scale-up', sub: 'Compare a lab and a plant vessel: power, solids suspension (Njs), gas-liquid kLa and the process-side heat transfer coefficient',
    groups: [
      { title: 'Liquid', inputs: [{ k: 'rho', label: 'Density', unit: 'kg/m³', v: 950 }, { k: 'mu', label: 'Viscosity', unit: 'cP', v: 1.5 }, { k: 'kf', label: 'Thermal conductivity', unit: 'kcal/h·m·°C', v: 0.13 }, { k: 'cpf', label: 'Specific heat', unit: 'kcal/kg·°C', v: 0.48 }] },
      { title: 'Lab vessel', inputs: [{ k: 'T1', label: 'Vessel diameter', unit: 'm', v: 0.15 }, { k: 'H1', label: 'Liquid height', unit: 'm', v: 0.15 }, { k: 'i1', label: 'Impeller', type: 'sel', v: 'pbt', opts: impOpts, wide: true },
        { k: 'D1', label: 'Impeller diameter', unit: 'm', v: 0.06 }, { k: 'N1', label: 'Speed', unit: 'rpm', v: 600 }, { k: 'Np1', label: 'Power number Np', unit: '', v: 1.27 }, { k: 'Ch1', label: 'Heat transfer constant C', unit: '', v: 0.53 }] },
      { title: 'Plant vessel', inputs: [{ k: 'T2', label: 'Vessel diameter', unit: 'm', v: 2.0 }, { k: 'H2', label: 'Liquid height', unit: 'm', v: 2.0 }, { k: 'i2', label: 'Impeller', type: 'sel', v: 'pbt', opts: impOpts, wide: true },
        { k: 'D2', label: 'Impeller diameter', unit: 'm', v: 0.8 }, { k: 'N2', label: 'Speed', unit: 'rpm', v: 80 }, { k: 'Np2', label: 'Power number Np', unit: '', v: 1.27 }, { k: 'Ch2', label: 'Heat transfer constant C', unit: '', v: 0.53 }] },
      { title: 'Solids (set solids to 0 to skip)', inputs: [{ k: 'ws', label: 'Solids loading', unit: 'wt %', v: 10 }, { k: 'dp', label: 'Particle size', unit: 'µm', v: 150 }, { k: 'rhos', label: 'Solid density', unit: 'kg/m³', v: 1400 },
        { k: 'S', label: 'Zwietering S (geometry constant)', unit: '', v: 6 }, { k: 'Nobs', label: 'Njs seen in the lab (0 = use S)', unit: 'rpm', v: 0 }] },
      { title: 'Gas sparging (set gas flow to 0 to skip)', inputs: [{ k: 'vvm', label: 'Gas flow', unit: 'vvm', v: 0.1 }, { k: 'pg', label: 'Gassed / ungassed power', unit: '', v: 0.7 },
        { k: 'coal', label: 'Liquid type', type: 'sel', v: 'c', opts: [['c', 'Coalescing (pure liquids, most solvents)'], ['n', 'Non-coalescing (salt solutions)']], wide: true }] }],
    onSel(k, val) { if (k === 'i1') return { Np1: IMP[val][1], Ch1: IMP[val][2] }; if (k === 'i2') return { Np2: IMP[val][1], Ch2: IMP[val][2] }; return null; },
    run(v) {
      for (const s of ['1', '2']) if (!(v['T' + s] > 0 && v['H' + s] > 0 && v['D' + s] > 0 && v['N' + s] > 0 && v['Np' + s] > 0 && v['D' + s] < v['T' + s])) return { rows: [], notes: [['Each vessel needs a positive diameter, height, speed and power number, and an impeller smaller than the vessel.', 'bad']] };
      if (!(v.rho > 0 && v.mu > 0 && v.kf > 0 && v.cpf > 0)) return { rows: [], notes: [['Liquid properties must be above zero.', 'bad']] };
      const a = vessel(v, '1'), b = vessel(v, '2'), solids = isFinite(a.njsBase);
      let S = v.S, calib = false; if (solids && v.Nobs > 0) { S = v.Nobs / 60 / a.njsBase; calib = true; }
      const nj1 = a.njsBase * S * 60, nj2 = b.njsBase * S * 60;
      const reg = Re => Re > 1e4 ? 'turbulent' : Re < 100 ? 'laminar' : 'transitional';
      const rows = [['Plant P/V', F(b.PV, 0), 'W/m³ (lab ' + F(a.PV, 0) + ')'], ['Plant speed / Njs', solids ? F(b.N * 60 / nj2, 2) : '–', solids ? '(lab ' + F(a.N * 60 / nj1, 2) + ')' : 'no solids'],
        ['Plant blend time (95 %)', F(b.blend, 0), 's (lab ' + F(a.blend, 0) + ' s)'], ['Plant process-side h', F(b.h, 0), 'kcal/h·m²·°C (lab ' + F(a.h, 0) + ')'],
        ['Plant kLa', isFinite(b.kla) ? F(b.kla, 0) : '–', isFinite(b.kla) ? '1/h (lab ' + F(a.kla, 0) + ')' : 'no gas'], ['Plant tip speed', F(b.tip, 2), 'm/s (lab ' + F(a.tip, 2) + ')']];
      const cmp = [['Liquid volume', F(a.V * 1000, 1) + ' L', F(b.V * 1000, 0) + ' L'], ['Reynolds number', F(a.Re, 0) + ' (' + reg(a.Re) + ')', F(b.Re, 0) + ' (' + reg(b.Re) + ')'], ['Tip speed', F(a.tip, 2) + ' m/s', F(b.tip, 2) + ' m/s'],
        ['Power', G(a.P) + ' W', G(b.P / 1000) + ' kW'], ['P/V', F(a.PV, 0) + ' W/m³', F(b.PV, 0) + ' W/m³'], ['Torque', G(a.torque) + ' N·m', G(b.torque) + ' N·m'], ['Blend time, 95 %', F(a.blend, 1) + ' s', F(b.blend, 1) + ' s'],
        ['Just-suspended speed Njs', solids ? F(nj1, 0) + ' rpm' : '–', solids ? F(nj2, 0) + ' rpm' : '–'], ['Speed / Njs', solids ? F(a.N * 60 / nj1, 2) : '–', solids ? F(b.N * 60 / nj2, 2) : '–'],
        ['Process-side h (jacket wall)', F(a.h, 0) + ' kcal/h·m²·°C', F(b.h, 0) + ' kcal/h·m²·°C'], ['Superficial gas velocity', isFinite(a.vs) ? F(a.vs * 1000, 2) + ' mm/s' : '–', isFinite(b.vs) ? F(b.vs * 1000, 2) + ' mm/s' : '–'], ['kLa', isFinite(a.kla) ? F(a.kla, 0) + ' 1/h' : '–', isFinite(b.kla) ? F(b.kla, 0) + ' 1/h' : '–'],
        ['Jacket area per m³ (flat-bottom estimate)', F((Math.PI * a.Tm * a.H + Math.PI / 4 * a.Tm ** 2) / a.V, 1) + ' m²/m³', F((Math.PI * b.Tm * b.H + Math.PI / 4 * b.Tm ** 2) / b.V, 1) + ' m²/m³']];
      // plant speed for each rule
      const r = v.rho, Np2 = v.Np2, D2 = b.D, V2 = b.V, at = N => { const c = Object.assign({}, v, { N2: N }); return vessel(c, '2'); };
      const rules = [['Same P/V (blending, gas dispersion)', Math.cbrt(a.PV * V2 / (Np2 * r * D2 ** 5)) * 60], ['Same tip speed (shear-sensitive crystals)', a.tip / (Math.PI * D2) * 60],
        ['Same blend time (fast competing reactions)', a.N * 60 * Math.pow(v.Np1 / Np2, 1 / 3) * (b.Tm / D2) ** 2 / (a.Tm / a.D) ** 2]];
      if (solids) rules.push(['Same speed / Njs (solids suspension)', a.N / (nj1 / 60) * nj2]);
      if (isFinite(a.kla)) { let lo = 1, hi = 2000; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; at(m).kla < a.kla ? lo = m : hi = m; } rules.push(['Same kLa at the same vvm (gas-liquid reactions)', (lo + hi) / 2]); }
      const rt = rules.map(x => { const q = at(x[1]); return [x[0], F(x[1], 0) + ' rpm', F(q.PV, 0) + ' W/m³', F(q.tip, 2) + ' m/s', F(q.P / 1000, 2) + ' kW', solids ? F(x[1] / nj2, 2) : '–']; });
      const notes = [];
      if (a.Re < 1e4 || b.Re < 1e4) notes.push(['One vessel is not fully turbulent (Re below 10,000). The power number, blend time and h correlations used here assume turbulent flow, so treat those numbers as rough.', 'warn']);
      if (solids) notes.push([calib ? `S back-calculated from your lab Njs: ${F(S, 2)}. Keep the geometry similar (same D/T and clearance) for the plant prediction to hold.` : 'S depends on the impeller, D/T and clearance; typical values are 4 to 8. For a reliable plant Njs, watch the lab vessel for the speed at which no particle rests on the base for more than 1 to 2 s, and enter it above.', calib ? 'good' : 'warn']);
      if (solids && b.N * 60 < nj2) notes.push(['The plant speed is below Njs: solids will settle on the base. This matters for crystallisation, slurries and solid catalysts.', 'bad']);
      if (isFinite(b.kla)) notes.push(['kLa from van\'t Riet for a sparged vessel (coalescing: 0.026 (P<sub>g</sub>/V)<sup>0.4</sup> v<sub>s</sub><sup>0.5</sup>; non-coalescing: 0.002 (P<sub>g</sub>/V)<sup>0.7</sup> v<sub>s</sub><sup>0.2</sup>, in SI units). It does not apply to hydrogenation through the headspace without a sparger. For best accuracy, measure kLa in the lab and scale with these ratios.']);
      notes.push(['Process-side h from Nu = C Re<sup>2/3</sup> Pr<sup>1/3</sup> (Uhl and Gray), wall viscosity correction taken as 1. Use it in the <a href="/calculators/overall-heat-transfer-coefficient-calculator/">overall U calculator</a>. Blend time from θ<sub>95</sub> = 5.2 (T/D)² / (Np<sup>1/3</sup> N), for liquid height about equal to the diameter. For basic power and P/V across reactors, see the <a href="/calculators/mixing-scale-up-calculator/">mixing scale-up calculator</a>.']);
      return { rows, notes,
        html: `<h3 class="pm-h">Lab and plant side by side</h3>${tableHTML(['', 'Lab', 'Plant'], cmp)}<h3 class="pm-h">Plant speed for each scale-up rule</h3>${tableHTML(['Keep the same…', 'Plant speed', 'P/V', 'Tip speed', 'Power', 'Speed / Njs'], rt)}<p class="pm-small">No single rule keeps everything the same. Pick the rule for the step that limits your process, then check the others stay acceptable. Keeping the lab blend time at plant scale usually needs impossible power, so plants live with longer blending and dose fast reagents near the impeller instead.</p>`,
        tables: [{ name: 'Lab vs plant', head: ['', 'Lab', 'Plant'], rows: cmp }, { name: 'Scale-up rules', head: ['Keep the same', 'Plant speed', 'P/V', 'Tip speed', 'Power', 'Speed / Njs'], rows: rt }] };
    }
  };

  /* ======================= 5. Solvent swap ======================= */
  const SOLV = window.PCME_SWAP_SOLVENTS || [];
  const solvOpts = SOLV.map(s => [s[0], s[1]]);
  const sv = slug => SOLV.find(s => s[0] === slug);
  const psat = (s, T) => Math.pow(10, s[4] - s[5] / (s[6] + T)); // mmHg
  function bubble(xa, A, B, P) { let lo = -80, hi = 400; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (xa * psat(A, m) + (1 - xa) * psat(B, m) > P) ? hi = m : lo = m; } return (lo + hi) / 2; }
  function swapSim(v, A, B, method) {
    const vA = A[2] / A[3] / 1000, vB = B[2] / B[3] / 1000; // m³/kmol -> L/mol: MW g/mol / (g/mL) = mL/mol ; /1000 -> L/mol
    let a = v.V0 / vA, b = 0; // mol
    const vol = () => a * vA + b * vB, wt = () => a * A[2] / (a * A[2] + b * B[2]) * 100;
    let Badd = 0, dist = 0, cycles = 0, T = bubble(1, A, B, v.P), done = false;
    const pts = [[0, wt(), T, 0]], log = [];
    function step(dV, addB) {
      const xa = a / (a + b); T = bubble(xa, A, B, v.P); const ya = xa * psat(A, T) / v.P, yb = 1 - ya, vv = ya * vA + yb * vB;
      const half = dV / 2 / vv, a2 = a - ya * half, b2 = b - yb * half, x2 = a2 / (a2 + b2), T2 = bubble(x2, A, B, v.P), y2 = x2 * psat(A, T2) / v.P, vv2 = y2 * vA + (1 - y2) * vB;
      const dn = dV / vv2; a = Math.max(0, a - y2 * dn); b = Math.max(0, b - (1 - y2) * dn); dist += dV;
      if (addB) { const nb = dV / vB; b += nb; Badd += dV; }
    }
    const Vlow = method === 'cv' ? v.Vc : v.Vmin;
    // first distil down from V0 to the working low level
    let guard = 0;
    while (vol() > Vlow * 1.0001 && guard++ < 5000) { step(Math.min(vol() - Vlow, Vlow / 200 + 0.0001), false); if (guard % 5 === 0) pts.push([Badd, wt(), T, dist]); }
    pts.push([Badd, wt(), T, dist]);
    if (wt() <= v.tgt) done = true;
    if (method === 'pt') {
      while (!done && cycles < 40) {
        cycles++; const add = v.Vmax - vol(); b += add / vB; Badd += add;
        pts.push([Badd, wt(), bubble(a / (a + b), A, B, v.P), dist]);
        guard = 0; while (vol() > v.Vmin * 1.0001 && guard++ < 5000) { step(Math.min(vol() - v.Vmin, v.Vmin / 200 + 0.0001), false); if (guard % 5 === 0) pts.push([Badd, wt(), T, dist]); }
        pts.push([Badd, wt(), T, dist]); log.push([cycles, Badd, dist, wt(), T]);
        if (wt() <= v.tgt) done = true;
      }
    } else {
      guard = 0; const dV = v.Vc / 200;
      while (!done && guard++ < 200 * 400) { step(dV, true); if (guard % 10 === 0) pts.push([Badd, wt(), T, dist]); if (wt() <= v.tgt) done = true; }
      pts.push([Badd, wt(), T, dist]);
    }
    return { Badd, dist, cycles, T, done, wt: wt(), pts, log, vol: vol() };
  }
  TOOLS.swap = {
    title: 'Solvent swap simulator', sub: 'Put-and-take against constant-volume distillation: how much new solvent, distillate and time to reach your residual limit',
    delay: 250,
    groups: [
      { title: 'Solvents and pressure', inputs: [{ k: 'sA', label: 'Swap out of (solvent A)', type: 'sel', v: 'thf', opts: solvOpts, wide: true }, { k: 'sB', label: 'Swap into (solvent B)', type: 'sel', v: 'toluene', opts: solvOpts, wide: true },
        { k: 'P', label: 'Distillation pressure (absolute)', unit: 'mmHg', v: 400 }] },
      { title: 'Volumes', inputs: [{ k: 'V0', label: 'Starting volume (solution in A)', unit: 'L', v: 1500 }, { k: 'Vmax', label: 'Maximum working volume', unit: 'L', v: 2000 }, { k: 'Vmin', label: 'Minimum stirrable volume', unit: 'L', v: 600 },
        { k: 'Vc', label: 'Level held during constant-volume swap', unit: 'L', v: 600 }, { k: 'rate', label: 'Distillation rate', unit: 'L/h', v: 250 }] },
      { title: 'Target', inputs: [{ k: 'tgt', label: 'Residual solvent A allowed at the end', unit: 'wt %', v: 0.5 }] }],
    run(v) {
      const A = sv(v.sA), B = sv(v.sB);
      if (!A || !B) return { rows: [], notes: [['Choose both solvents.', 'bad']] };
      if (A === B) return { rows: [], notes: [['Choose two different solvents.', 'bad']] };
      if (!(v.P > 0 && v.V0 > 0 && v.Vmax > v.Vmin && v.Vmin > 0 && v.Vc > 0 && v.rate > 0 && v.tgt > 0 && v.tgt < 100)) return { rows: [], notes: [['Volumes, rate and pressure must be above zero, the maximum volume above the minimum, and the target between 0 and 100 %.', 'bad']] };
      if (v.V0 > v.Vmax) return { rows: [], notes: [['The starting volume is above the maximum working volume.', 'bad']] };
      if (v.Vc > v.V0) return { rows: [], notes: [['The constant-volume level must not be above the starting volume.', 'bad']] };
      const pt = swapSim(v, A, B, 'pt'), cv = swapSim(v, A, B, 'cv');
      const Tb = bubble(0.5, A, B, v.P), alpha = psat(A, Tb) / psat(B, Tb);
      const kg = L => L * B[3];
      const rows = [['Solvent B needed, constant volume', cv.done ? F(cv.Badd, 0) : '> ' + F(cv.Badd, 0), 'L (' + F(kg(cv.Badd), 0) + ' kg)'],
        ['Solvent B needed, put-and-take', pt.done ? F(pt.Badd, 0) : '> ' + F(pt.Badd, 0), 'L in ' + pt.cycles + ' charge' + (pt.cycles === 1 ? '' : 's')],
        ['Saving with constant volume', pt.done && cv.done && pt.Badd > 0 ? F((1 - cv.Badd / pt.Badd) * 100, 0) : '–', '% less solvent B'],
        ['Distillate, constant volume', F(cv.dist, 0), 'L (' + F(cv.dist / v.rate, 1) + ' h)'], ['Distillate, put-and-take', F(pt.dist, 0), 'L (' + F(pt.dist / v.rate, 1) + ' h)'],
        ['Solvent A left, constant volume / put-and-take', F(cv.wt, 2) + ' / ' + F(pt.wt, 2), 'wt %'],
        ['Batch temperature at the end', F(cv.T, 1), '°C at ' + F(v.P, 0) + ' mmHg'], ['Boiling point of A / B at this pressure', F(bubble(1, A, B, v.P), 1) + ' / ' + F(bubble(0, A, B, v.P), 1), '°C'], ['Relative volatility A to B (50:50)', F(alpha, 1), '']];
      const notes = [];
      if (alpha < 1.2) notes.push(['Solvent A is not much more volatile than B at this pressure' + (alpha < 1 ? ' (it is actually less volatile)' : '') + ', so a swap by distillation is slow or impossible. Choose a different solvent B or a different route (for example isolate and redissolve).', 'bad']);
      if (!pt.done || !cv.done) notes.push(['The target was not reached within the simulated limit. Relax the target, use a lower minimum volume or check the solvent pair.', 'warn']);
      const fa = A[8], fb = B[8], alc = f => f === 'Alcohols', hc = f => /hydrocarbons|Esters|Ketones|Chlorinated|Ethers/.test(f);
      if ((alc(fa) && hc(fb)) || (alc(fb) && hc(fa)) || fa === 'Water' || fb === 'Water' || (/acetonitrile/i.test(A[1] + B[1]) && /Aromatic|Alcohols|Water/.test(fa + fb)))
        notes.push(['This pair may form an azeotrope (common with alcohols or water against hydrocarbons, esters, ketones, ethers and chlorinated solvents, and with acetonitrile). This model assumes an ideal mixture and will underestimate the solvent B needed. Check with VLE data or a lab trial and confirm the end point by GC.', 'warn']);
      notes.push(['Ideal (Raoult\'s law) single-stage distillation from the reactor, with Antoine vapour pressures from the <a href="/solvents/">solvent data pages</a>. The dissolved product is ignored; it raises the boiling point slightly. Put-and-take: distil to the minimum volume, refill with B to the maximum, repeat. Constant volume: distil to the set level, then feed B at the distillation rate. Residual A is checked at the end of each distillation.']);
      const ser = [{ name: 'Constant volume', color: C.brass, pts: cv.pts.map(p => [p[0], p[1]]) }, { name: 'Put-and-take', color: C.blue, pts: pt.pts.map(p => [p[0], p[1]]) }];
      const tb = pt.log.map(l => ['Charge ' + l[0], F(l[1], 0) + ' L', F(l[2], 0) + ' L', F(l[3], 2) + ' %', F(l[4], 1) + ' °C']);
      return { rows, notes,
        charts: [{ title: 'Residual solvent A against solvent B used', xLabel: 'Solvent B added (L)', yLabel: 'Solvent A in the batch (wt %, log scale)', ylog: true, ymin: Math.max(Math.min(v.tgt / 5, cv.wt, pt.wt), 1e-3), series: ser, hlines: [{ y: v.tgt, label: 'Target', color: C.green }] },
          { title: 'Batch temperature', xLabel: 'Distillate collected (L)', yLabel: 'Temperature (°C)', series: [{ name: 'Constant volume', color: C.brass, pts: cv.pts.map(p => [p[3], p[2]]) }, { name: 'Put-and-take', color: C.blue, pts: pt.pts.map(p => [p[3], p[2]]) }] }],
        html: tb.length ? `<h3 class="pm-h">Put-and-take, charge by charge</h3>${tableHTML(['Step', 'B added so far', 'Distillate so far', 'Solvent A after distilling', 'Batch temperature'], tb)}` : '',
        tables: [{ name: 'Put-and-take', head: ['Charge', 'B added (L)', 'Distillate (L)', 'Solvent A (wt %)', 'Temperature (°C)'], rows: pt.log.map(l => l.map(x => +(+x).toFixed(3))) },
          { name: 'Constant volume', head: ['B added (L)', 'Solvent A (wt %)', 'Temperature (°C)', 'Distillate (L)'], rows: thin(cv.pts, 300).map(p => p.map(x => +x.toFixed(4))) }] };
    }
  };

  /* ======================= 6. Solubility curve, cooling and antisolvent crystallisation ======================= */
  const SLV = [['methanol', 'Methanol', 32.04, 0.792], ['ethanol', 'Ethanol', 46.07, 0.789], ['ipa', 'Isopropanol (IPA)', 60.10, 0.786], ['acetone', 'Acetone', 58.08, 0.790],
    ['etoac', 'Ethyl acetate', 88.11, 0.902], ['ipac', 'Isopropyl acetate', 102.13, 0.872], ['toluene', 'Toluene', 92.14, 0.867], ['water', 'Water', 18.02, 0.998],
    ['acn', 'Acetonitrile', 41.05, 0.786], ['thf', 'THF', 72.11, 0.889], ['metf', '2-Methyl THF', 86.13, 0.854], ['mtbe', 'MTBE', 88.15, 0.740], ['dcm', 'Dichloromethane', 84.93, 1.326],
    ['heptane', 'n-Heptane', 100.20, 0.684], ['hexane', 'n-Hexane', 86.18, 0.659], ['dmf', 'DMF', 73.09, 0.944], ['other', 'Other: enter molar mass and density', NaN, NaN]];
  const slv = k => SLV.find(s => s[0] === k) || SLV[0];
  const sg = x => (x < 0 ? ' − ' : ' + ') + G(Math.abs(x));
  /* least squares for y = Σ c_j f_j(x) */
  function lsq(rows, ys) {
    const n = rows[0].length, A = Array.from({ length: n }, () => new Array(n + 1).fill(0));
    rows.forEach((r, i) => { for (let a = 0; a < n; a++) { for (let b = 0; b < n; b++) A[a][b] += r[a] * r[b]; A[a][n] += r[a] * ys[i]; } });
    for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; if (Math.abs(A[c][c]) < 1e-14) return null;
      for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; } }
    return A.map((r, i) => r[n] / r[i]);
  }
  /* solubility value in g per 100 g solvent from the entered unit */
  function toS(val, unit, mwS, mwV, rhoV) {
    if (unit === 'g100') return val; if (unit === 'gL') return val / rhoV / 10; if (unit === 'wt') return val >= 100 ? NaN : 100 * val / (100 - val);
    if (unit === 'x') return val >= 1 ? NaN : 100 * val * mwS / ((1 - val) * mwV); return NaN;
  }
  const fromS = (S, unit, mwS, mwV, rhoV) => unit === 'g100' ? S : unit === 'gL' ? S * rhoV * 10 : unit === 'wt' ? 100 * S / (100 + S) : (S / mwS) / (S / mwS + 100 / mwV);
  const unitLab = { g100: 'g per 100 g solvent', gL: 'g per L of solvent', wt: 'wt % in solution', x: 'mole fraction' };
  const parse = txt => { const p = []; String(txt).split(/\r?\n/).forEach(l => { const q = l.trim().split(/[\s,;\t]+/).map(Number); if (q.length >= 2 && isFinite(q[0]) && isFinite(q[1])) p.push([q[0], q[1]]); }); return p; };
  function invert(f, target, lo, hi) { /* f increasing in x */ if (f(lo) > target || f(hi) < target) return NaN; for (let i = 0; i < 70; i++) { const m = (lo + hi) / 2; f(m) < target ? lo = m : hi = m; } return (lo + hi) / 2; }
  const SOL_SAMPLE = '10, 4.1\n20, 6.0\n30, 8.7\n40, 12.4\n50, 17.6\n60, 24.5';
  const ANTI_SAMPLE = '0, 22.0\n20, 10.5\n40, 4.2\n60, 1.5\n80, 0.45';
  TOOLS.solubility = {
    title: 'Solubility curve and crystallisation', sub: 'Fit a solubility curve to lab data or estimate it, then plan a cooling or antisolvent crystallisation: saturation, seeding, yield and losses',
    delay: 250,
    groups: [
      { title: 'What to do', inputs: [{ k: 'mode', label: 'Mode', type: 'sel', wide: true, v: 'fit', opts: [['fit', 'Fit lab data, then plan a cooling crystallisation'], ['pred', 'No data: estimate from melting point, then plan cooling'], ['anti', 'Antisolvent: fit solubility against antisolvent, then plan the addition']] }] },
      { title: 'Solute and solvent', inputs: [
        { k: 'mw', label: 'Solute molar mass', unit: 'g/mol', v: 250 },
        { k: 'sv', label: 'Solvent', type: 'sel', v: 'ethanol', opts: SLV.map(s => [s[0], s[1]]) },
        { k: 'mwv', label: 'Solvent molar mass', unit: 'g/mol', v: 46.07, show: v => v.sv === 'other' },
        { k: 'rho', label: 'Solvent density', unit: 'kg/L', v: 0.789, show: v => v.sv === 'other' }] },
      { title: 'Your solubility data', show: v => v.mode === 'fit', inputs: [
        { k: 'u', label: 'Data unit', type: 'sel', wide: true, v: 'g100', opts: [['g100', 'g solute per 100 g solvent'], ['gL', 'g solute per L of solvent'], ['wt', 'wt % solute in the solution'], ['x', 'mole fraction of solute']] },
        { k: 'data', label: 'One point per line: temperature (°C), solubility. Paste from Excel.', type: 'area', v: SOL_SAMPLE, rows: 7 },
        { k: 'mdl', label: 'Curve to fit', type: 'sel', wide: true, v: 'apel', opts: [['vh', "van't Hoff: ln S = A + B/T"], ['apel', 'Apelblat: ln S = A + B/T + C ln T (4 or more points)'], ['poly', 'Polynomial: S = a + bT + cT²']] }] },
      { title: 'Estimate from melting point (ideal solubility)', show: v => v.mode === 'pred', inputs: [
        { k: 'tm', label: 'Melting point of the solute', unit: '°C', v: 165 },
        { k: 'hfm', label: 'Heat of fusion', type: 'sel', v: 'walden', opts: [['walden', "Estimate (Walden's rule)"], ['enter', 'Enter a measured value (DSC)']] },
        { k: 'hf', label: 'Heat of fusion', unit: 'kcal/mol', v: 6.5, show: v => v.hfm === 'enter' },
        { k: 'gam', label: 'Activity coefficient γ in this solvent', unit: '1 = ideal', v: 1 }] },
      { title: 'Antisolvent data (at the crystallisation temperature)', show: v => v.mode === 'anti', inputs: [
        { k: 'av', label: 'Antisolvent', type: 'sel', v: 'water', opts: SLV.filter(s => s[0] !== 'other').map(s => [s[0], s[1]]) },
        { k: 'au', label: 'Solubility unit', type: 'sel', wide: true, v: 'g100', opts: [['g100', 'g solute per 100 g of solvent mixture'], ['wt', 'wt % solute in the solution']] },
        { k: 'adata', label: 'One point per line: antisolvent in the solvent mixture (wt %), solubility', type: 'area', v: ANTI_SAMPLE, rows: 6 },
        { k: 'amdl', label: 'Curve to fit', type: 'sel', wide: true, v: 'q', opts: [['l', 'Log-linear: ln S = A + B·f'], ['q', 'Log-quadratic: ln S = A + B·f + C·f²']] }] },
      { title: 'Cooling batch', show: v => v.mode !== 'anti', inputs: [
        { k: 'm', label: 'Solute charged', unit: 'kg', v: 100 }, { k: 'ms', label: 'Solvent charged', unit: 'kg', v: 500 },
        { k: 't0', label: 'Dissolution temperature', unit: '°C', v: 65 }, { k: 'tf', label: 'Final (isolation) temperature', unit: '°C', v: 5 },
        { k: 'mz', label: 'Metastable zone width (from lab)', unit: '°C', v: 10 }, { k: 'sd', label: 'Seed this far below saturation', unit: '°C', v: 3 },
        { k: 'tc', label: 'Cooling time, seed to final', unit: 'h', v: 8 },
        { k: 'mw2', label: 'Cake wash solvent', unit: 'kg', v: 100 }, { k: 'tw', label: 'Wash temperature', unit: '°C', v: 0 }] },
      { title: 'Antisolvent batch', show: v => v.mode === 'anti', inputs: [
        { k: 'am', label: 'Solute charged', unit: 'kg', v: 100 }, { k: 'ams', label: 'Solvent charged', unit: 'kg', v: 500 },
        { k: 'aa', label: 'Antisolvent to add', unit: 'kg', v: 1000 }, { k: 'amz', label: 'Seed after this much antisolvent past saturation', unit: '% of solvent mass', v: 2 },
        { k: 'aw', label: 'Cake wash', unit: 'kg', v: 100 }, { k: 'awf', label: 'Antisolvent in the wash', unit: 'wt %', v: 80 }] }],
    run(v) {
      const S0 = slv(v.sv), mwV = v.sv === 'other' ? v.mwv : S0[2], rho = v.sv === 'other' ? v.rho : S0[3], mwS = v.mw;
      if (!(mwS > 0) || !(mwV > 0) || !(rho > 0)) return { rows: [], notes: [['Enter molar masses and density above zero.', 'bad']] };
      return v.mode === 'anti' ? antiRun(v, mwS) : coolRun(v, mwS, mwV, rho, S0[1]);
    }
  };
  function coolRun(v, mwS, mwV, rho, solvName) {
    let Sfn, pts = [], fitRows = [], notes = [], fitLabel = '', tlo = -20, thi = 150, info = [];
    if (v.mode === 'fit') {
      pts = parse(v.data).map(p => [p[0], toS(p[1], v.u, mwS, mwV, rho), p[1]]).filter(p => isFinite(p[1]) && p[1] > 0).sort((a, b) => a[0] - b[0]);
      if (pts.length < 3) return { rows: [], notes: [['Enter at least three points, as temperature, solubility. Solubility must be above zero' + (v.u === 'wt' ? ' and below 100 wt %' : v.u === 'x' ? ' and below 1' : '') + '.', 'bad']] };
      if (v.mdl === 'apel' && pts.length < 4) return { rows: [], notes: [['The Apelblat curve needs at least four points. Use van\'t Hoff for three.', 'bad']] };
      const Tk = t => t + 273.15;
      let c;
      if (v.mdl === 'poly') { c = lsq(pts.map(p => [1, p[0], p[0] * p[0]]), pts.map(p => p[1])); if (!c) return { rows: [], notes: [['The data cannot be fitted. Use different temperatures.', 'bad']] }; Sfn = t => c[0] + c[1] * t + c[2] * t * t; fitLabel = 'S = ' + G(c[0]) + sg(c[1]) + '·T' + sg(c[2]) + '·T²  (T in °C)'; }
      else if (v.mdl === 'vh') { c = lsq(pts.map(p => [1, 1 / Tk(p[0])]), pts.map(p => Math.log(p[1]))); if (!c) return { rows: [], notes: [['The data cannot be fitted. Use different temperatures.', 'bad']] }; Sfn = t => Math.exp(c[0] + c[1] / Tk(t)); fitLabel = 'ln S = ' + G(c[0]) + ' ' + (c[1] < 0 ? '− ' : '+ ') + G(Math.abs(c[1])) + '/T  (T in K)'; info.push(['Apparent heat of dissolution', F(-c[1] * 1.98720 / 1000, 2), 'kcal/mol, from the slope']); }
      else { c = lsq(pts.map(p => [1, 1 / Tk(p[0]), Math.log(Tk(p[0]))]), pts.map(p => Math.log(p[1]))); if (!c) return { rows: [], notes: [['The data cannot be fitted. Use different temperatures.', 'bad']] }; Sfn = t => Math.exp(c[0] + c[1] / Tk(t) + c[2] * Math.log(Tk(t))); fitLabel = 'ln S = ' + G(c[0]) + sg(c[1]) + '/T' + sg(c[2]) + '·ln T  (T in K)'; }
      const mean = pts.reduce((s, p) => s + p[1], 0) / pts.length, sst = pts.reduce((s, p) => s + (p[1] - mean) ** 2, 0), sse = pts.reduce((s, p) => s + (p[1] - Sfn(p[0])) ** 2, 0), r2 = 1 - sse / sst;
      const maxDev = Math.max(...pts.map(p => Math.abs(Sfn(p[0]) / p[1] - 1) * 100));
      info.unshift(['Fit R²', F(r2, 4), 'max deviation ' + F(maxDev, 1) + ' %']);
      if (r2 < 0.98 || maxDev > 10) notes.push(['The curve does not fit the data well (R² ' + F(r2, 3) + ', worst point ' + F(maxDev, 0) + ' % off). Check the data, or try another curve.', 'warn']);
      tlo = pts[0][0]; thi = pts[pts.length - 1][0];
      fitRows = pts.map(p => [F(p[0], 1) + ' °C', G(p[2]), G(p[1]), G(Sfn(p[0])), F((Sfn(p[0]) / p[1] - 1) * 100, 1) + ' %']);
      for (let i = 1; i < 50; i++) { const t = tlo + (thi - tlo) * i / 50; if (Sfn(t) < Sfn(t - (thi - tlo) / 50) - 1e-9) { return { rows: [], notes: [['The fitted curve falls as the temperature rises somewhere in your data range. Cooling crystallisation needs a solubility that rises with temperature: check the data, or use the antisolvent mode (or an evaporative crystallisation) for this product.', 'bad']] }; } }
    } else {
      const TmK = v.tm + 273.15; if (!(TmK > 150)) return { rows: [], notes: [['Enter a melting point above −120 °C.', 'bad']] };
      const dH = v.hfm === 'walden' ? 13.5 * TmK / 1000 : v.hf; if (!(dH > 0)) return { rows: [], notes: [['Enter a heat of fusion above zero.', 'bad']] };
      if (!(v.gam > 0)) return { rows: [], notes: [['The activity coefficient must be above zero.', 'bad']] };
      const xs = t => Math.min(0.999, Math.exp(-dH * 1000 / 1.98720 * (1 / (t + 273.15) - 1 / TmK)) / v.gam);
      Sfn = t => { const x = xs(t); return 100 * x * mwS / ((1 - x) * mwV); };
      fitLabel = 'ln x = −(ΔH_fus/R)(1/T − 1/T_m) − ln γ, ΔH_fus = ' + F(dH, 2) + ' kcal/mol' + (v.hfm === 'walden' ? " (Walden's rule, 13.5 cal/mol·K × T_m)" : '');
      info.push(['Heat of fusion used', F(dH, 2), 'kcal/mol' + (v.hfm === 'walden' ? " (Walden's rule estimate)" : '')], ['Ideal mole fraction at 25 °C', G(xs(25) * v.gam), 'divided by γ = ' + G(v.gam)]);
      notes.push(['This is an estimate. Ideal solubility is often right within a factor of 2 to 3 in solvents similar to the solute, and too high in poor solvents (γ well above 1, often 10 to 1000 in water for organic solids). Measure at least two points before scaling up.', 'warn']);
      tlo = Math.min(v.tf, 0); thi = Math.min(v.tm - 5, Math.max(v.t0, 60));
    }
    /* cooling batch */
    const m = v.m, ms = v.ms; if (!(m > 0 && ms > 0)) return { rows: [], notes: [['Enter the solute and solvent charges above zero.', 'bad']] };
    if (!(v.t0 > v.tf)) return { rows: [], notes: [['The dissolution temperature must be above the final temperature.', 'bad']] };
    if (!(v.mz > 0) || !(v.sd >= 0) || !(v.tc > 0)) return { rows: [], notes: [['Enter a metastable zone width and cooling time above zero, and a seeding offset of zero or more.', 'bad']] };
    const sLo = Math.min(v.tf, tlo) - 30, sHi = v.mode === 'pred' ? Math.min(v.tm - 1, Math.max(v.t0, thi) + 100) : Math.max(v.t0, thi) + 60;
    const conc = 100 * m / ms, Tsat = invert(Sfn, conc, sLo, sHi);
    const Sf = Sfn(v.tf), dissF = Sf * ms / 100, solid = Math.max(0, m - dissF), washLoss = Math.min(solid, Math.max(0, (v.mw2 || 0) * Sfn(v.tw) / 100)), isol = Math.max(0, solid - washLoss);
    const rows = [];
    if (!isFinite(Tsat)) return { rows: [], notes: [['The charge does not saturate between ' + F(sLo, 0) + ' and ' + F(sHi, 0) + ' °C on this curve: ' + (Sfn(sHi) < conc ? 'it would not dissolve fully. Add solvent.' : 'it stays dissolved even at ' + F(sLo, 0) + ' °C. Remove solvent or use an antisolvent.'), 'bad']] };
    const Tseed = Tsat - v.sd, minSolv = 100 * m / Sfn(v.t0);
    rows.push(['Isolated yield', F(isol / m * 100, 1) + ' %', F(isol, 1) + ' kg of ' + F(m, 1) + ' kg']);
    rows.push(['Saturation temperature of the charge', F(Tsat, 1) + ' °C', F(conc, 2) + ' g per 100 g solvent']);
    rows.push(['Seed at', F(Tseed, 1) + ' °C', F(v.sd, 1) + ' °C below saturation; MSZW ' + F(v.mz, 1) + ' °C']);
    rows.push(['Solubility at ' + F(v.tf, 0) + ' °C', G(Sf), 'g per 100 g solvent']);
    rows.push(['Lost in the mother liquor', F(dissF, 2) + ' kg', F(dissF / m * 100, 1) + ' % of the charge']);
    rows.push(['Lost in the wash (if it leaves saturated)', F(washLoss, 2) + ' kg', F(washLoss / m * 100, 1) + ' %, solubility ' + G(Sfn(v.tw)) + ' at ' + F(v.tw, 0) + ' °C']);
    rows.push(['Minimum solvent to dissolve at ' + F(v.t0, 0) + ' °C', F(minSolv, 0) + ' kg', F(minSolv / rho, 0) + ' L of ' + solvName]);
    rows.push(['Slurry at the end', F(solid / (m + ms) * 100, 1) + ' wt % solids', F(ms / rho, 0) + ' L solvent']);
    info.forEach(r => rows.push(r));
    if (v.t0 < Tsat + 3) notes.unshift([v.t0 < Tsat ? 'The charge does not fully dissolve at ' + F(v.t0, 1) + ' °C: it needs ' + F(Tsat, 1) + ' °C. Heat higher or add at least ' + F(minSolv - ms, 0) + ' kg more solvent.' : 'The dissolution temperature is less than 3 °C above saturation. Undissolved fines or a slightly high assay will leave solids; allow 5 °C or more.', 'bad']);
    if (v.sd >= v.mz) notes.push(['The seeding point is at or beyond the metastable zone width: the solution may nucleate on its own before you seed. Seed about a quarter to a third of the way into the zone.', 'bad']);
    else if (v.sd > v.mz / 2) notes.push(['Seeding more than halfway into the metastable zone risks a burst of fine crystals. About a quarter to a third of the way in is the usual target.', 'warn']);
    if (solid / (m + ms) > 0.35) notes.push(['The slurry is above about 35 wt % solids at the end: it may be hard to stir and transfer. Consider more solvent.', 'warn']);
    if (v.mode === 'fit' && (v.tf < tlo - 5 || v.t0 > thi + 5 || Tsat > thi + 5)) notes.push(['Part of the batch lies more than 5 °C outside your data (' + F(tlo, 0) + ' to ' + F(thi, 0) + ' °C), so the curve is extrapolated there. Measure solubility at the final temperature at least.', 'warn']);
    if (Tseed <= v.tf) notes.push(['The seeding temperature is at or below the final temperature: the solution is not supersaturated over the cooling range. Increase the charge or reduce the solvent.', 'bad']);
    /* profiles from the seed point */
    const N = 120, prof = kind => Array.from({ length: N + 1 }, (_, i) => { const f = i / N, t = v.tc * f, T = kind === 'lin' ? Tseed - (Tseed - v.tf) * f : Tseed - (Tseed - v.tf) * f * f * f; return [t, T, Math.max(0, m - Sfn(T) * ms / 100)]; });
    const lin = prof('lin'), cub = prof('cub'), rate = P => P.slice(1).map((p, i) => [p[0], (p[2] - P[i][2]) / (p[0] - P[i][0])]), rl = rate(lin), rc = rate(cub);
    const pkL = Math.max(...rl.map(p => p[1])), pkC = Math.max(...rc.map(p => p[1])), solidAtHalfL = lin[N / 2][2], solidAtHalfC = cub[N / 2][2];
    notes.push(['With linear cooling, ' + F(solidAtHalfL / Math.max(solid, 1e-9) * 100, 0) + ' % of the solid forms in the first half of the cooling time, at a peak of ' + F(pkL, 1) + ' kg/h. A cubic (slow-start) profile spreads it out: ' + F(solidAtHalfC / Math.max(solid, 1e-9) * 100, 0) + ' % in the first half, peak ' + F(pkC, 1) + ' kg/h. Slow early cooling, while the seed surface is small, gives larger, more even crystals.']);
    notes.push(['Equilibrium model: the liquid follows the solubility curve after seeding, so the yield is the most you can get at the final temperature. Real batches keep some supersaturation; hold 1 to 2 h at the final temperature before filtering. Wash loss assumes the wash leaves saturated (worst case).']);
    /* charts */
    const tA = Math.min(v.tf, tlo) - 5, tB = Math.max(v.t0, Tsat, thi) + 5, grid = Array.from({ length: 101 }, (_, i) => tA + (tB - tA) * i / 100);
    const series = [{ name: 'Solubility curve', color: C.brass, pts: grid.map(t => [t, Sfn(t)]) }, { name: 'Metastable limit (nucleation)', color: C.rust, dash: true, pts: grid.map(t => [t, Sfn(t + v.mz)]) }];
    if (pts.length) series.push({ name: 'Your data', color: C.blue, dots: true, pts: pts.map(p => [p[0], p[1]]) });
    series.push({ name: 'Batch path', color: C.green, pts: [[v.t0, conc], [Tseed, conc]].concat(lin.map(p => [p[1], Sfn(p[1])])) });
    const ymax = Math.max(conc * 1.3, Sfn(Math.min(tB, v.t0 + 5)) * 1.05);
    const charts = [{ title: 'Solubility curve, metastable zone and batch path', xLabel: 'Temperature (°C)', yLabel: 'g solute per 100 g solvent', ymin: 0, ymax, series: series.map(s => ({ ...s, pts: s.pts.filter(p => p[1] <= ymax * 1.2) })), hlines: [{ y: conc, label: 'Charge', color: C.muted }] },
      { title: 'Solid formed during cooling', xLabel: 'Time from seeding (h)', yLabel: 'Solid (kg)', ymin: 0, series: [{ name: 'Linear cooling', color: C.blue, pts: lin.map(p => [p[0], p[2]]) }, { name: 'Cubic (slow start)', color: C.green, pts: cub.map(p => [p[0], p[2]]) }] },
      { title: 'Temperature profile', xLabel: 'Time from seeding (h)', yLabel: 'Temperature (°C)', series: [{ name: 'Linear cooling', color: C.blue, pts: lin.map(p => [p[0], p[1]]) }, { name: 'Cubic (slow start)', color: C.green, pts: cub.map(p => [p[0], p[1]]) }] }];
    const tbT = []; for (let k = 0; k <= 8; k++) { const i = Math.round(N * k / 8); tbT.push([F(lin[i][0], 1) + ' h', F(lin[i][1], 1) + ' °C', F(lin[i][2], 1) + ' kg', F(cub[i][1], 1) + ' °C', F(cub[i][2], 1) + ' kg']); }
    let html = `<p class="ut-note">Curve: ${esc(fitLabel)}</p>`;
    if (fitRows.length) html += `<h3 class="pm-h">Fit against your data</h3>` + tableHTML(['Temperature', 'Entered (' + unitLab[v.u] + ')', 'g/100 g solvent', 'Curve', 'Deviation'], fitRows);
    html += `<h3 class="pm-h">Cooling profiles from the seed point</h3>` + tableHTML(['Time', 'Linear: temperature', 'Linear: solid', 'Cubic: temperature', 'Cubic: solid'], tbT);
    const stab = []; for (let t = Math.ceil(tA / 5) * 5; t <= tB; t += 5) stab.push([t, Sfn(t), fromS(Sfn(t), 'gL', mwS, mwV, rho), fromS(Sfn(t), 'wt', mwS, mwV, rho), fromS(Sfn(t), 'x', mwS, mwV, rho)]);
    html += `<h3 class="pm-h">Solubility table</h3>` + tableHTML(['°C', 'g/100 g solvent', 'g/L solvent', 'wt % solution', 'mole fraction'], stab.map(r => [F(r[0], 0), G(r[1]), G(r[2]), G(r[3]), G(r[4])]));
    return { rows, notes, charts, html, tables: [{ name: 'Solubility', head: ['T (°C)', 'g/100 g solvent', 'g/L solvent', 'wt % solution', 'mole fraction'], rows: stab.map(r => r.map(x => +(+x).toPrecision(5))) }, { name: 'Cooling', head: ['Time (h)', 'Linear T (°C)', 'Linear solid (kg)', 'Cubic T (°C)', 'Cubic solid (kg)'], rows: lin.map((p, i) => [p[0], p[1], p[2], cub[i][1], cub[i][2]].map(x => +x.toFixed(3))) }] };
  }
  function antiRun(v, mwS) {
    const A = slv(v.av), notes = [];
    const pts = parse(v.adata).map(p => [p[0] / 100, v.au === 'wt' ? (p[1] < 100 ? 100 * p[1] / (100 - p[1]) : NaN) : p[1], p[1]]).filter(p => isFinite(p[1]) && p[1] > 0 && p[0] >= 0 && p[0] < 1).sort((a, b) => a[0] - b[0]);
    if (pts.length < 2 || (v.amdl === 'q' && pts.length < 3)) return { rows: [], notes: [['Enter at least ' + (v.amdl === 'q' ? 'three' : 'two') + ' points: antisolvent wt % (0 to 99), solubility above zero.', 'bad']] };
    const c = lsq(pts.map(p => v.amdl === 'q' ? [1, p[0], p[0] * p[0]] : [1, p[0]]), pts.map(p => Math.log(p[1]))); if (!c) return { rows: [], notes: [['The data cannot be fitted. Use different antisolvent levels.', 'bad']] };
    const Sf = f => Math.exp(c[0] + c[1] * f + (c[2] || 0) * f * f);
    const mean = pts.reduce((s, p) => s + p[1], 0) / pts.length, r2 = 1 - pts.reduce((s, p) => s + (p[1] - Sf(p[0])) ** 2, 0) / pts.reduce((s, p) => s + (p[1] - mean) ** 2, 0);
    const m = v.am, ms = v.ams, ma = v.aa; if (!(m > 0 && ms > 0 && ma > 0)) return { rows: [], notes: [['Enter the solute, solvent and antisolvent amounts above zero.', 'bad']] };
    if (!(v.amz >= 0) || !(v.awf >= 0 && v.awf < 100)) return { rows: [], notes: [['Enter a seeding margin of zero or more and wash antisolvent below 100 %.', 'bad']] };
    const conc = a => 100 * m / (ms + a), fr = a => a / (ms + a);
    if (conc(0) > Sf(0)) notes.push(['The charge is already above its solubility before any antisolvent (' + G(conc(0)) + ' against ' + G(Sf(0)) + ' g per 100 g). Add solvent or warm to dissolve first.', 'bad']);
    const aSat = conc(0) >= Sf(0) ? 0 : invert(a => conc(a) - Sf(fr(a)), 0, 0, ma * 20), aSeed = aSat + v.amz / 100 * ms;
    const dissolved = a => Math.min(m, Sf(fr(a)) * (ms + a) / 100), solid = a => m - dissolved(a);
    const fF = fr(ma), dissF = dissolved(ma), sol = solid(ma), wl = Math.min(sol, (v.aw || 0) * Sf(v.awf / 100) / 100), isol = Math.max(0, sol - wl);
    let a90 = NaN; for (let i = 1; i <= 2000; i++) { const a = ma * 5 * i / 2000; if (solid(a) >= 0.9 * m) { a90 = a; break; } }
    const rows = [['Isolated yield', F(isol / m * 100, 1) + ' %', F(isol, 1) + ' kg of ' + F(m, 1) + ' kg'],
      ['Solution saturates after', isFinite(aSat) ? F(aSat, 1) + ' kg antisolvent' : '–', isFinite(aSat) ? F(fr(aSat) * 100, 1) + ' wt % antisolvent in the solvent' : ''],
      ['Seed at', isFinite(aSeed) ? F(aSeed, 1) + ' kg antisolvent added' : '–', 'then add the rest slowly'],
      ['Antisolvent in the final mixture', F(fF * 100, 1) + ' wt %', F(ms + ma, 0) + ' kg solvent mixture'],
      ['Solubility at the end', G(Sf(fF)), 'g per 100 g mixture'],
      ['Lost in the mother liquor', F(dissF, 2) + ' kg', F(dissF / m * 100, 1) + ' %'],
      ['Lost in the wash (if it leaves saturated)', F(wl, 2) + ' kg', F(wl / m * 100, 1) + ' %, wash at ' + F(v.awf, 0) + ' wt % ' + A[1]],
      ['Antisolvent for 90 % in the solid', isFinite(a90) ? F(a90, 0) + ' kg' : 'not reached', isFinite(a90) ? F(a90 / ms, 2) + ' kg per kg solvent' : 'within 5 × the planned amount: more antisolvent only dilutes'],
      ['Fit R²', F(r2, 4), 'ln S = ' + G(c[0]) + sg(c[1]) + '·f' + (c[2] != null ? sg(c[2]) + '·f²' : '')]];
    if (r2 < 0.98) notes.push(['The curve fits the data poorly (R² ' + F(r2, 3) + '). Try the other curve or check the data.', 'warn']);
    if (fF > pts[pts.length - 1][0] + 0.05) notes.push(['The final antisolvent level (' + F(fF * 100, 0) + ' wt %) is beyond your data (up to ' + F(pts[pts.length - 1][0] * 100, 0) + ' wt %), so the solubility there is extrapolated. Measure it.', 'warn']);
    if (isFinite(aSat) && aSat > ma) notes.push(['The solution does not even saturate with this much antisolvent: add at least ' + F(aSat, 0) + ' kg, or start more concentrated.', 'bad']);
    if (sol / (m + ms + ma) > 0.3) notes.push(['The slurry is above about 30 wt % solids at the end.', 'warn']);
    const ag = Array.from({ length: 121 }, (_, i) => ma * 1.2 * i / 120), d1 = ag.slice(1).map((a, i) => [a, (solid(a) - solid(ag[i])) / (a - ag[i])]), pk = d1.reduce((b, p) => p[1] > b[1] ? p : b, [0, 0]);
    notes.push(['Most solid forms ' + (pk[0] < (isFinite(aSat) ? aSat : 0) + 0.3 * ma ? 'soon after saturation' : 'late in the addition') + ': the steepest point is near ' + F(pk[0], 0) + ' kg added. Add slowly there, especially to a poorly mixed point, to avoid oiling out and fines; local excess antisolvent at the feed point is the usual cause.']);
    notes.push(['Equilibrium model: the liquid follows the fitted solubility after seeding. Solubility data must be at the crystallisation temperature. Volumes are mass-based; mixing may change volume.']);
    const fg = Array.from({ length: 101 }, (_, i) => Math.min(0.99, Math.max(fF, pts[pts.length - 1][0]) * i / 100));
    const charts = [{ title: 'Solubility against antisolvent, with the batch path', xLabel: 'Antisolvent in the solvent mixture (wt %)', yLabel: 'g solute per 100 g mixture', ylog: true, series: [{ name: 'Fitted solubility', color: C.brass, pts: fg.map(f => [f * 100, Sf(f)]) }, { name: 'Your data', color: C.blue, dots: true, pts: pts.map(p => [p[0] * 100, p[1]]) }, { name: 'Dissolved solute in the batch', color: C.green, pts: ag.filter(a => a <= ma).map(a => [fr(a) * 100, Math.min(conc(a), Sf(fr(a)))]) }] },
      { title: 'Yield as antisolvent is added', xLabel: 'Antisolvent added (kg)', yLabel: 'Solid formed (% of charge)', ymin: 0, ymax: 100, series: [{ name: 'Solid formed', color: C.green, pts: ag.map(a => [a, solid(a) / m * 100]) }], hlines: [{ y: sol / m * 100, label: 'At ' + F(ma, 0) + ' kg', color: C.muted }] }];
    const tb = []; for (let k = 0; k <= 10; k++) { const a = ma * k / 10; tb.push([F(a, 0) + ' kg', F(fr(a) * 100, 1) + ' %', G(Sf(fr(a))), F(solid(a), 1) + ' kg', F(solid(a) / m * 100, 1) + ' %']); }
    return { rows, notes, charts, html: `<h3 class="pm-h">Addition table</h3>` + tableHTML(['Antisolvent added', 'Antisolvent wt %', 'Solubility, g/100 g', 'Solid', 'Yield'], tb),
      tables: [{ name: 'Addition', head: ['Antisolvent added (kg)', 'Antisolvent (wt %)', 'Solubility (g/100 g)', 'Solid (kg)'], rows: ag.map(a => [a, fr(a) * 100, Sf(fr(a)), solid(a)].map(x => +x.toPrecision(5))) }] };
  }

  /* mount */
  document.querySelectorAll('.pm-tool').forEach(el => { const t = TOOLS[el.dataset.tool]; if (t) shell(el, t); });
  window.__pm = { TOOLS, lsq, toS, dosingSim, Xmodel, tFor, fitK, swapSim, vessel, bubble, psat, sv, stoessel };
})();
