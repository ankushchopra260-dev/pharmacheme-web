/* PharmaChemE: "Download Excel" for calculators. SheetJS (self-hosted) loads only when a download is asked for.
   Utility-style calculators pass their inputs and Excel formulas; older calculators are read from their tables. */
(function () {
  'use strict';
  const me = document.currentScript, VENDOR = me ? me.src.replace(/js\/xl-export\.js.*$/, 'vendor/xlsx.mini.min.js') : '/assets/vendor/xlsx.mini.min.js';
  let loading = null;
  function load() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (!loading) loading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = VENDOR; s.onload = () => res(window.XLSX); s.onerror = () => { loading = null; rej(new Error('Could not load the spreadsheet library')); }; document.head.appendChild(s); });
    return loading;
  }
  const strip = h => String(h == null ? '' : h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&[a-z]+;/g, '').trim();
  const slug = t => (strip(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'calculation') + '.xlsx';
  const today = () => { const d = new Date(); return [d.getDate(), d.getMonth() + 1, d.getFullYear()].map(n => String(n).padStart(2, '0')).join('-'); };
  // evaluate an Excel formula in JS so the file opens with values already shown
  function ev(f, vals) {
    let js = f.replace(/\{(\w+)\}/g, (_, k) => typeof vals[k] === 'string' ? JSON.stringify(vals[k]) : '(' + vals[k] + ')');
    js = js.replace(/<>/g, '!=').replace(/(?<![<>!=])=(?!=)/g, '==').replace(/\^/g, '**').replace(/\bPI\(\)/g, 'Math.PI')
      .replace(/\bSQRT\(/g, 'Math.sqrt(').replace(/\bLN\(/g, 'Math.log(').replace(/\bEXP\(/g, 'Math.exp(').replace(/\bMIN\(/g, 'Math.min(').replace(/\bMAX\(/g, 'Math.max(').replace(/\bABS\(/g, 'Math.abs(')
      .replace(/\bIF\(/g, '__IF(').replace(/\bOR\(/g, '__OR(').replace(/\bROUNDDOWN\(/g, '__RD(');
    try { return Function('__IF', '__OR', '__RD', '"use strict";return (' + js + ')')((c, a, b) => c ? a : b, (...a) => a.some(Boolean), (x, d) => { const f = Math.pow(10, d || 0); return Math.trunc(x * f) / f; }); } catch (e) { return null; }
  }
  function header(rows, title, sub) {
    rows.push([title]); if (sub) rows.push([sub]);
    rows.push(['From PharmaChemE: ' + location.href.split('#')[0], '', 'Date: ' + today()]); rows.push([]);
  }
  function save(X, rows, name, widths) {
    const ws = X.utils.aoa_to_sheet(rows); ws['!cols'] = (widths || [44, 18, 24, 40]).map(w => ({ wch: w }));
    const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, 'Calculation'); X.writeFile(wb, name);
  }
  /* spec: { title, sub, inputs:[{k,label,unit,value,text}], xl:[[id,label,formula,unit]] | null, rows:[[label,value,unit]], notes:[html] } */
  function calcSheet(spec) {
    return load().then(X => {
      const rows = []; header(rows, spec.title, spec.sub);
      const ref = {}, vals = {};
      rows.push(['Inputs (change the values in column B)', 'Value', 'Unit']);
      spec.inputs.forEach(i => { rows.push([i.label, i.value, i.unit || '', i.text || '']); ref[i.k] = 'B' + rows.length; vals[i.k] = i.value; });
      rows.push([]);
      if (spec.xl && spec.xl.length) {
        rows.push(['Results (formulas)', 'Value', 'Unit']);
        spec.xl.forEach(([id, label, f, unit]) => {
          const xf = f.replace(/\{(\w+)\}/g, (_, k) => ref[k] || k), v = ev(f, vals);
          const cell = typeof v === 'string' ? { t: 's', v, f: xf } : { t: 'n', v: isFinite(v) ? v : 0, f: xf };
          rows.push([label, cell, unit || '']); ref[id] = 'B' + rows.length; vals[id] = v;
        });
        rows.push([]); rows.push(['As shown on the website']);
      } else rows.push(['Results', 'Value', 'Unit']);
      (spec.rows || []).forEach(r => rows.push([strip(r[0]), strip(r[1]), strip(r[2])]));
      const notes = (spec.notes || []).map(strip).filter(Boolean);
      if (notes.length) { rows.push([]); rows.push(['Notes']); notes.forEach(n => rows.push([n])); }
      save(X, rows, slug(spec.title));
    });
  }
  /* older calculators: read every table inside the calculator */
  function fromTables(root, title) {
    return load().then(X => {
      const rows = []; header(rows, title, 'Inputs and results as entered on the website');
      root.querySelectorAll('table').forEach(t => {
        t.querySelectorAll('tr').forEach(tr => {
          const r = [...tr.children].map(td => {
            const inp = td.querySelector('input, select, textarea');
            if (inp) return inp.tagName === 'SELECT' ? (inp.selectedOptions[0] || {}).textContent || inp.value : inp.value;
            return (td.innerText || td.textContent).replace(/\s*\n+\s*/g, ' / ').replace(/[ \t]+/g, ' ').trim();
          });
          if (r.some(x => x !== '')) rows.push(r.map(x => (/^-?[\d,]+(\.\d+)?$/.test(x) && /\d/.test(x) ? +x.replace(/,/g, '') : x)));
        });
        rows.push([]);
      });
      save(X, rows, slug(title), [34, 18, 18, 18, 18, 18, 18]);
    });
  }
  /* simulation tools: { title, sub, inputs:[[label,value,unit]], results:[[label,value,unit]], notes:[html], tables:[{name, head, rows}] } */
  function dataBook(spec) {
    return load().then(X => {
      const rows = []; header(rows, spec.title, spec.sub);
      rows.push(['Inputs', 'Value', 'Unit']); spec.inputs.forEach(r => rows.push([strip(r[0]), typeof r[1] === 'number' ? r[1] : strip(r[1]), strip(r[2])])); rows.push([]);
      rows.push(['Results', 'Value', 'Unit']); spec.results.forEach(r => rows.push([strip(r[0]), strip(r[1]), strip(r[2])]));
      const notes = (spec.notes || []).map(strip).filter(Boolean); if (notes.length) { rows.push([]); rows.push(['Notes']); notes.forEach(n => rows.push([n])); }
      const wb = X.utils.book_new(), ws = X.utils.aoa_to_sheet(rows); ws['!cols'] = [46, 22, 26, 30].map(w => ({ wch: w })); X.utils.book_append_sheet(wb, ws, 'Summary');
      (spec.tables || []).forEach(t => { const s2 = X.utils.aoa_to_sheet([t.head].concat(t.rows.map(r => r.map(c => typeof c === 'number' ? c : strip(c))))); s2['!cols'] = t.head.map(h => ({ wch: Math.max(14, strip(h).length + 2) })); X.utils.book_append_sheet(wb, s2, String(t.name).slice(0, 31)); });
      X.writeFile(wb, slug(spec.title));
    });
  }
  function fail(btn, e) { btn.disabled = false; btn.textContent = 'Download Excel'; alert(e.message || 'Download failed. Please try again.'); }
  window.PCME_XL = { calcSheet, fromTables, dataBook, fail };
  function addTableButton() {
    const mount = document.getElementById('calc-mount') || document.getElementById('panels'); if (!mount || mount.dataset.xl) return; mount.dataset.xl = 1;
    const bar = document.createElement('div'); bar.className = 'xl-bar';
    bar.innerHTML = '<button type="button" class="btn btn-outline btn-sm">Download Excel</button><span>Your inputs and results as a spreadsheet</span>';
    mount.parentNode.insertBefore(bar, mount.nextSibling);
    const btn = bar.querySelector('button');
    btn.addEventListener('click', () => {
      if (!mount.querySelector('table')) { alert('Nothing to export on this page yet.'); return; }
      btn.disabled = true; btn.textContent = 'Preparing…';
      const h1 = document.querySelector('h1');
      fromTables(mount, h1 ? h1.textContent.trim() : document.title).then(() => { btn.disabled = false; btn.textContent = 'Download Excel'; }, e => fail(btn, e));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(addTableButton, 0)); else setTimeout(addTableButton, 0);
})();
