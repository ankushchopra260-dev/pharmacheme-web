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

  /* mount */
  document.querySelectorAll('.pm-tool').forEach(el => { const t = TOOLS[el.dataset.tool]; if (t) shell(el, t); });
  window.__pm = { TOOLS, dosingSim, Xmodel, tFor, fitK, swapSim, vessel, bubble, psat, sv, stoessel };
})();
