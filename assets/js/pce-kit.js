/* PharmaChemE calculator kit.
   A calculator is a definition registered with PCEKit.add(id, def) and placed on a page as <div class="ut-calc pk-calc" data-calc="id"></div>.
   def = { title, sub,
           inputs: [{ k, label, unit, v, type: 'sel', opts: [[value, text]], show: v => bool, step, help }],
           example: { label, v: {...} },          // optional worked example (button)
           onSel(k, value, v) -> partial v,       // optional, when a select changes
           run(v) -> { rows: [[label, value, unit]], tables: [{ title, head, rows }], notes: [[html, 'good'|'warn'|'bad'|'lead']], svg },
           refs: ['reference text', ...] }
   Each card has: project / tag / engineer fields that print on the PDF, a worked example, reset, save to file, open file,
   a link that carries the inputs (kept in the browser, after #), and Download PDF (results, tables, inputs, notes and references). */
(function () {
  'use strict';
  const DEFS = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const F = (x, d) => (isFinite(x) ? Number(x).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–');
  /* significant-figure format for engineering results */
  const G = (x, s) => {
    if (!isFinite(x)) return '–'; s = s || 3;
    const a = Math.abs(x); if (a === 0) return '0';
    const d = Math.max(0, s - 1 - Math.floor(Math.log10(a)));
    return Number(x).toLocaleString('en-IN', { minimumFractionDigits: Math.min(d, 6), maximumFractionDigits: Math.min(d, 6) });
  };
  const track = (n, p) => { try { if (window.gtag) gtag('event', n, p || {}); } catch (e) {} };
  const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const dec = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));
  const readHash = id => { try { const m = location.hash.match(/[#&]s=([A-Za-z0-9_-]+)/); if (!m) return null; const o = dec(m[1]); return o && o.k === 'pk' && o.id === id ? o : null; } catch (e) { return null; } };

  function mount(el) {
    const id = el.dataset.calc, c = DEFS[id]; if (!c || el.dataset.pk) return; el.dataset.pk = 1;
    const v = {}, meta = { project: '', tag: '', engineer: '' };
    const reset = () => c.inputs.forEach(i => { v[i.k] = i.v; });
    reset();
    const st = readHash(id); if (st) { Object.keys(v).forEach(k => { if (st.v && st.v[k] !== undefined) v[k] = st.v[k]; }); Object.assign(meta, st.m || {}); }
    el.innerHTML = `<div class="ut-card"><div class="ut-hd"><h3>${esc(c.title)}</h3><p>${esc(c.sub || '')}</p></div>
      <details class="pk-meta"><summary>Project, tag and engineer (printed on the PDF)</summary><div class="pk-meta-f">
        <label><span>Project</span><input data-m="project" maxlength="80"></label><label><span>Equipment tag</span><input data-m="tag" maxlength="40"></label><label><span>Engineer</span><input data-m="engineer" maxlength="60"></label></div></details>
      <div class="ut-body"><form class="ut-in" autocomplete="off"></form><div class="ut-out" aria-live="polite"></div></div>
      <div class="pk-extra"></div>
      <div class="ut-tools pk-tools"><button type="button" class="ut-xl" data-a="pdf">Download PDF</button>${c.example ? '<button type="button" class="pk-b" data-a="ex">Worked example</button>' : ''}<button type="button" class="pk-b" data-a="reset">Reset</button><button type="button" class="pk-b" data-a="save">Save to file</button><button type="button" class="pk-b" data-a="open">Open file</button><button type="button" class="pk-b" data-a="link">Copy link</button><input type="file" accept=".json,application/json" hidden></div>
      ${c.refs && c.refs.length ? `<details class="pk-refs"><summary>Method and references</summary><ol>${c.refs.map(r => `<li>${r}</li>`).join('')}</ol></details>` : ''}</div>`;
    const form = el.querySelector('.ut-in'), out = el.querySelector('.ut-out'), extra = el.querySelector('.pk-extra'), fileIn = el.querySelector('input[type=file]');
    el.querySelectorAll('[data-m]').forEach(inp => { inp.value = meta[inp.dataset.m] || ''; inp.addEventListener('input', () => { meta[inp.dataset.m] = inp.value; }); });
    let last = null;

    function shown() { return c.inputs.filter(i => !i.show || i.show(v)); }
    function drawInputs() {
      form.innerHTML = shown().map(i => {
        if (i.type === 'head') return `<p class="pk-sec">${esc(i.label)}</p>`;
        const lab = `<span>${esc(i.label)}${i.unit && i.type !== 'sel' ? ` <i>${esc(i.unit)}</i>` : ''}</span>`;
        const ctl = i.type === 'sel'
          ? `<select data-k="${i.k}">${i.opts.map(o => `<option value="${esc(o[0])}"${String(o[0]) === String(v[i.k]) ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
          : i.type === 'text' ? `<input data-k="${i.k}" type="text" value="${esc(v[i.k])}">`
          : `<input data-k="${i.k}" type="number" step="${i.step || 'any'}" inputmode="decimal" value="${v[i.k] === '' || v[i.k] == null || (typeof v[i.k] === 'number' && isNaN(v[i.k])) ? '' : v[i.k]}">`;
        return `<label class="ut-f"${i.help ? ` title="${esc(i.help)}"` : ''}>${lab}${ctl}${i.help ? `<small class="pk-help">${esc(i.help)}</small>` : ''}</label>`;
      }).join('');
    }
    function calc() {
      const bad = shown().filter(i => i.type !== 'sel' && i.type !== 'head' && i.type !== 'text' && !i.optional && !isFinite(v[i.k]));
      if (bad.length) { out.innerHTML = '<p class="ut-empty">Fill in every value to see the result.</p>'; extra.innerHTML = ''; last = null; return; }
      let r;
      try { r = c.run(v); } catch (e) { out.innerHTML = '<p class="ut-note bad">These inputs could not be solved. Check that they are physically possible.</p>'; extra.innerHTML = ''; last = null; return; }
      last = r;
      const notes = r.notes || [], lead = notes.filter(n => n[1] === 'lead'), rest = notes.filter(n => n[1] !== 'lead');
      out.innerHTML = lead.map(n => `<p class="ut-note lead">${n[0]}</p>`).join('') +
        ((r.rows || []).length ? `<dl class="ut-res">${r.rows.map((x, j) => `<div${j === 0 ? ' class="lead"' : ''}><dt>${esc(x[0])}</dt><dd>${esc(x[1])} <small>${esc(x[2] || '')}</small></dd></div>`).join('')}</dl>` : '') +
        rest.map(n => `<p class="ut-note ${n[1] || ''}">${n[0]}</p>`).join('');
      extra.innerHTML = (r.svg ? `<div class="pk-svg">${r.svg}</div>` : '') + (r.tables || []).map(t => `<h4 class="pk-th">${esc(t.title)}</h4><div class="ut-table-wrap"><table class="ut-table"><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${t.rows.map(row => `<tr>${row.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</table></div>`).join('');
    }
    function setAll(nv) { Object.keys(v).forEach(k => { if (nv[k] !== undefined) v[k] = nv[k]; }); drawInputs(); calc(); }
    form.addEventListener('input', e => {
      const k = e.target.dataset.k; if (!k) return; const spec = c.inputs.find(i => i.k === k);
      v[k] = spec.type === 'sel' || spec.type === 'text' ? e.target.value : (e.target.value === '' ? NaN : +e.target.value);
      if (spec.type === 'sel') { const o = c.onSel && c.onSel(k, v[k], v); if (o) Object.assign(v, o); drawInputs(); const f = form.querySelector(`[data-k="${k}"]`); if (f) f.focus(); }
      calc();
    });
    const link = () => location.origin + location.pathname + '#s=' + enc({ k: 'pk', id, v, m: meta });
    el.querySelector('.pk-tools').addEventListener('click', e => {
      const a = e.target.dataset && e.target.dataset.a; if (!a) return;
      if (a === 'ex') { reset(); setAll(c.example.v); track('pk_example', { calc: id }); }
      if (a === 'reset') { reset(); drawInputs(); calc(); }
      if (a === 'link') { const u = link(); (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => { e.target.textContent = 'Link copied'; setTimeout(() => { e.target.textContent = 'Copy link'; }, 1600); }, () => prompt('Copy this link:', u)); }
      if (a === 'save') {
        const blob = new Blob([JSON.stringify({ pharmacheme: id, saved: new Date().toISOString(), meta, inputs: v }, null, 2)], { type: 'application/json' });
        const u = URL.createObjectURL(blob), aEl = document.createElement('a'); aEl.href = u;
        aEl.download = (meta.tag || id).replace(/[^\w.-]+/g, '-') + '.pharmacheme.json'; document.body.appendChild(aEl); aEl.click(); aEl.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000);
        track('pk_save', { calc: id });
      }
      if (a === 'open') fileIn.click();
      if (a === 'pdf') pdf(e.target);
    });
    fileIn.addEventListener('change', () => {
      const f = fileIn.files[0]; if (!f) return;
      f.text().then(t => { const o = JSON.parse(t); if (o.pharmacheme !== id) throw new Error('This file was saved from a different calculator (' + (o.pharmacheme || 'unknown') + ').'); Object.assign(meta, o.meta || {}); el.querySelectorAll('[data-m]').forEach(inp => { inp.value = meta[inp.dataset.m] || ''; }); reset(); setAll(o.inputs || {}); })
        .catch(err => alert(err.message && /calculator/.test(err.message) ? err.message : 'This file could not be opened. Choose a file saved from this calculator.'));
      fileIn.value = '';
    });
    function pdf(btn) {
      if (!window.PCME_XL) { alert('Download is not available on this page.'); return; }
      if (!last) { alert('Fill in every value first.'); return; }
      const strip = h => String(h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&deg;/g, '°').replace(/&amp;/g, '&');
      const head = [meta.project && 'Project: ' + meta.project, meta.tag && 'Tag: ' + meta.tag, meta.engineer && 'Engineer: ' + meta.engineer].filter(Boolean).join('  ·  ');
      const sections = [];
      if ((last.rows || []).length) sections.push({ title: 'Results', head: ['Result', 'Value', 'Unit'], rows: last.rows.map(r => [r[0], r[1], r[2] || '']), widths: [0.5, 0.22, 0.28], bold: [1] });
      (last.tables || []).forEach(t => sections.push({ title: t.title, head: t.head, rows: t.rows, widths: t.head.map(() => 1 / t.head.length) }));
      const txt = i => i.type === 'sel' ? (i.opts.find(o => String(o[0]) === String(v[i.k])) || [, v[i.k]])[1] : String(v[i.k]);
      const inRows = [];
      shown().filter(i => i.type !== 'head').forEach(i => {
        if (i.type === 'sel' && /unit$/i.test(i.label) && inRows.length && !inRows[inRows.length - 1][2]) { inRows[inRows.length - 1][2] = txt(i); return; } // unit selector: fold into the value above
        inRows.push([i.label, txt(i), i.type === 'sel' ? '' : (i.unit || '')]);
      });
      sections.push({ title: 'Inputs (backup data)', head: ['Parameter', 'Value', 'Unit'], rows: inRows, widths: [0.5, 0.22, 0.28] });
      const notes = (last.notes || []).map(n => strip(n[0])).concat((c.refs || []).map((r, j) => 'Ref. ' + (j + 1) + ': ' + strip(r)));
      btn.disabled = true; btn.textContent = 'Preparing…';
      window.PCME_XL.report({ title: c.title, sub: head || c.sub, sections, notes, link: link() })
        .then(() => { btn.disabled = false; btn.textContent = 'Download PDF'; track('pk_pdf', { calc: id }); }, err => window.PCME_XL.fail(btn, err));
    }
    drawInputs(); calc();
  }

  /* pressure units: everything converts through bar absolute (1 atm = 1.01325 bar, 1 kg/cm2 = 0.980665 bar, 1 psi = 0.0689476 bar, 1 mmHg = 1.33322e-3 bar) */
  const PU = { barg: ['barg', b => b + 1.01325, a => a - 1.01325], bara: ['bar abs', b => b, a => a], kscg: ['kg/cm² g', b => b * 0.980665 + 1.01325, a => (a - 1.01325) / 0.980665],
    kpaa: ['kPa abs', b => b / 100, a => a * 100], mpaa: ['MPa abs', b => b * 10, a => a / 10], psig: ['psig', b => b * 0.0689476 + 1.01325, a => (a - 1.01325) / 0.0689476],
    mmhga: ['mmHg abs (torr)', b => b * 1.33322e-3, a => a / 1.33322e-3], mbara: ['mbar abs', b => b / 1000, a => a * 1000] };
  const pOpts = keys => (keys || Object.keys(PU)).map(k => [k, PU[k][0]]);
  const toBarA = (v, u) => PU[u][1](v), fromBarA = (a, u) => PU[u][2](a);

  window.PCEKit = {
    add(id, def) { DEFS[id] = def; document.querySelectorAll(`.pk-calc[data-calc="${id}"]`).forEach(mount); },
    F, G, esc, PU, pOpts, toBarA, fromBarA, KJ: 4.1868,
    /* simple line chart: series [{ name, pts: [[x, y]], cls }], opts { xl, yl, w, h, xmin, xmax, ymin, ymax, marks: [[x, y, label]] } */
    chart(series, o) {
      o = o || {}; const W = o.w || 640, H = o.h || 280, L = 58, R = 14, T = 26, B = 44;
      const xs = [], ys = []; series.forEach(s => s.pts.forEach(p => { if (isFinite(p[0]) && isFinite(p[1])) { xs.push(p[0]); ys.push(p[1]); } }));
      if (!xs.length) return '';
      let x0 = o.xmin != null ? o.xmin : Math.min(...xs), x1 = o.xmax != null ? o.xmax : Math.max(...xs), y0 = o.ymin != null ? o.ymin : Math.min(...ys), y1 = o.ymax != null ? o.ymax : Math.max(...ys);
      if (x1 === x0) x1 = x0 + 1; if (y1 === y0) { y1 += 1; y0 -= 1; }
      if (o.ymin == null) { const p = (y1 - y0) * 0.06; y0 -= p; y1 += p; }
      const X = x => L + (W - L - R) * (x - x0) / (x1 - x0), Y = y => T + (H - T - B) * (1 - (y - y0) / (y1 - y0));
      let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(o.title || 'Chart')}"><rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" class="pk-frame"/>`;
      for (let i = 0; i <= 5; i++) { const yv = y0 + (y1 - y0) * i / 5; s += `<text x="${L - 6}" y="${Y(yv) + 4}" text-anchor="end" class="pk-ax">${G(yv, 3)}</text>`; }
      for (let i = 0; i <= 5; i++) { const xv = x0 + (x1 - x0) * i / 5; s += `<text x="${X(xv)}" y="${H - B + 16}" text-anchor="middle" class="pk-ax">${G(xv, 3)}</text>`; }
      if (o.xl) s += `<text x="${(L + W - R) / 2}" y="${H - 8}" text-anchor="middle" class="pk-ax">${esc(o.xl)}</text>`;
      if (o.yl) s += `<text x="${L}" y="${T - 10}" class="pk-ax">${esc(o.yl)}</text>`;
      series.forEach((sr, i) => {
        const pts = sr.pts.filter(p => isFinite(p[0]) && isFinite(p[1]));
        s += `<path class="pk-l pk-l${i}${sr.dash ? ' pk-dash' : ''}" d="${pts.map((p, j) => (j ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(' ')}"/>`;
        s += `<line x1="${L + 8 + i * 150}" x2="${L + 26 + i * 150}" y1="${T - 14}" y2="${T - 14}" class="pk-l pk-l${i}${sr.dash ? ' pk-dash' : ''}"/><text x="${L + 30 + i * 150}" y="${T - 10}" class="pk-ax">${esc(sr.name)}</text>`;
      });
      (o.marks || []).forEach(m => { s += `<circle cx="${X(m[0])}" cy="${Y(m[1])}" r="4.5" class="pk-pt"/>${m[2] ? `<text x="${X(m[0]) + 7}" y="${Y(m[1]) - 7}" class="pk-ax">${esc(m[2])}</text>` : ''}`; });
      return s + '</svg>';
    }
  };
  const go = () => document.querySelectorAll('.pk-calc').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
