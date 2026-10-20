/* PharmaChemE: "Download Excel" for calculators.
   Built with ExcelJS (self-hosted, loaded only when a download is asked for).
   Every sheet: PharmaChemE banner, formatted tables, print footer, and sheet protection.
   Calculators with live formulas leave only the yellow input cells editable; report-style sheets are fully locked.
   Sheet protection stops casual editing and removal of the logo; like all Excel protection it is not strong security. */
(function () {
  'use strict';
  const me = document.currentScript;
  const ROOT = me ? me.src.replace(/js\/xl-export\.js.*$/, '') : '/assets/';
  const VENDOR = ROOT + 'vendor/exceljs.min.js', ZIP = ROOT + 'vendor/jszip.min.js', BANNER = ROOT + 'img/xl-banner.png';
  const PASS = 'PharmaChemE-' + 'protect';
  const NAVY = 'FF0B1622', BRASS = 'FFC9A227', PAPER = 'FFECE7D8', GREY = 'FFF3F4F6', LINE = 'FFBFC7D1', INFILL = 'FFFFF2CC', INFONT = 'FF1F4E9C';
  let loading = null, bannerB64 = null;

  function load() {
    if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
    if (!loading) loading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = VENDOR; s.onload = () => res(window.ExcelJS); s.onerror = () => { loading = null; rej(new Error('Could not load the spreadsheet library. Check your connection and try again.')); }; document.head.appendChild(s); });
    return loading;
  }
  let zipLoading = null;
  function loadZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    if (!zipLoading) zipLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = ZIP; s.onload = () => res(window.JSZip); s.onerror = () => { zipLoading = null; rej(new Error('Could not load the zip library')); }; document.head.appendChild(s); });
    return zipLoading;
  }
  // ExcelJS cannot set "protect objects"; add it so the logo cannot be moved or deleted while the sheet is protected
  async function lockObjects(buf) {
    try {
      const Z = await loadZip(), zip = await Z.loadAsync(buf);
      for (const name of Object.keys(zip.files).filter(n => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))) {
        const x = await zip.file(name).async('string');
        zip.file(name, x.replace(/<sheetProtection (?![^>]*objects=)/, '<sheetProtection objects="1" scenarios="1" '));
      }
      return await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
    } catch (e) { return buf; }
  }
  function banner() {
    if (bannerB64) return Promise.resolve(bannerB64);
    return fetch(BANNER).then(r => r.blob()).then(b => new Promise(res => { const fr = new FileReader(); fr.onload = () => { bannerB64 = fr.result; res(bannerB64); }; fr.readAsDataURL(b); })).catch(() => null);
  }
  const strip = h => String(h == null ? '' : h).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&deg;/g, '°').replace(/&[a-z]+;/g, '').replace(/\s+/g, ' ').trim();
  const slug = t => (strip(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'calculation') + '.xlsx';
  const today = () => { const d = new Date(); return [d.getDate(), d.getMonth() + 1, d.getFullYear()].map(n => String(n).padStart(2, '0')).join('-'); };
  const pageUrl = () => location.href.split('#')[0].split('?')[0];
  const NUM = '[>=1000]#,##0;[>=1]#,##0.00;0.0000';
  const toNum = x => (typeof x === 'string' && /^-?[\d,]+(\.\d+)?$/.test(x.trim()) && /\d/.test(x)) ? +x.replace(/,/g, '') : x;

  // evaluate an Excel formula in JS so the file opens with values already shown
  function ev(f, vals) {
    let js = f.replace(/\{(\w+)\}/g, (_, k) => typeof vals[k] === 'string' ? JSON.stringify(vals[k]) : '(' + vals[k] + ')');
    js = js.replace(/<>/g, '!=').replace(/(?<![<>!=])=(?!=)/g, '==').replace(/\^/g, '**').replace(/\bPI\(\)/g, 'Math.PI')
      .replace(/\bSQRT\(/g, 'Math.sqrt(').replace(/\bLN\(/g, 'Math.log(').replace(/\bEXP\(/g, 'Math.exp(').replace(/\bMIN\(/g, 'Math.min(').replace(/\bMAX\(/g, 'Math.max(').replace(/\bABS\(/g, 'Math.abs(')
      .replace(/\bIF\(/g, '__IF(').replace(/\bOR\(/g, '__OR(').replace(/\bROUNDDOWN\(/g, '__RD(');
    try { return Function('__IF', '__OR', '__RD', '"use strict";return (' + js + ')')((c, a, b) => c ? a : b, (...a) => a.some(Boolean), (x, d) => { const f = Math.pow(10, d || 0); return Math.trunc(x * f) / f; }); } catch (e) { return null; }
  }

  /* ---------- sheet building blocks ---------- */
  const thin = { style: 'thin', color: { argb: LINE } };
  const box = { top: thin, left: thin, bottom: thin, right: thin };
  function newSheet(wb, name, img, widths) {
    const ws = wb.addWorksheet(name.slice(0, 31), { views: [{ showGridLines: false }], pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.7, header: 0.3, footer: 0.3 } } });
    ws.columns = (widths || [48, 18, 16, 44]).map(w => ({ width: w }));
    const n = ws.columns.length;
    for (let r = 1; r <= 4; r++) { ws.getRow(r).height = 22.5; for (let c = 1; c <= n; c++) ws.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }; }
    if (img != null) ws.addImage(img, { tl: { col: 0, row: 0 }, ext: { width: 900, height: 120 }, editAs: 'absolute' });
    ws.headerFooter.oddFooter = '&L&"Arial,Bold"PharmaChemE&"Arial,Regular"  www.pharmacheme.in&R&P / &N';
    ws.headerFooter.oddHeader = '&R&"Arial,Italic"&8Made with PharmaChemE';
    ws._r = 6; ws._n = n;
    return ws;
  }
  function merged(ws, text, opt) {
    const r = ws._r++, row = ws.getRow(r);
    ws.mergeCells(r, 1, r, ws._n);
    const c = ws.getCell(r, 1); c.value = text; c.alignment = { wrapText: true, vertical: 'top' };
    Object.assign(c, opt || {});
    if (opt && opt.h) row.height = opt.h;
    return c;
  }
  function titleBlock(ws, title, sub) {
    merged(ws, strip(title), { font: { name: 'Arial', size: 16, bold: true, color: { argb: NAVY } }, h: 24 });
    if (sub) merged(ws, strip(sub), { font: { name: 'Arial', size: 10, italic: true, color: { argb: 'FF5B6B7B' } } });
    const r = ws._r++, a = ws.getCell(r, 1);
    a.value = { text: 'Source: ' + pageUrl(), hyperlink: pageUrl() }; a.font = { name: 'Arial', size: 9, color: { argb: INFONT }, underline: true };
    const d = ws.getCell(r, ws._n); d.value = 'Date: ' + today(); d.font = { name: 'Arial', size: 9, color: { argb: 'FF5B6B7B' } }; d.alignment = { horizontal: 'right' };
    ws._r++;
  }
  function section(ws, text) {
    const r = ws._r++; ws.getRow(r).height = 20;
    for (let c = 1; c <= ws._n; c++) { const x = ws.getCell(r, c); x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }; }
    const c = ws.getCell(r, 1); c.value = text; c.font = { name: 'Arial', size: 11, bold: true, color: { argb: PAPER } }; c.alignment = { vertical: 'middle' };
  }
  function headRow(ws, cells) {
    const r = ws._r++;
    cells.forEach((t, i) => { const c = ws.getCell(r, i + 1); c.value = t; c.font = { name: 'Arial', size: 10, bold: true, color: { argb: NAVY } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREY } }; c.border = box; c.alignment = { vertical: 'middle', wrapText: true }; });
    for (let i = cells.length; i < ws._n; i++) { const c = ws.getCell(r, i + 1); c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREY } }; c.border = box; }
    return r;
  }
  function dataRow(ws, cells, opt) {
    const r = ws._r++;
    for (let i = 0; i < ws._n; i++) {
      const c = ws.getCell(r, i + 1), v = cells[i];
      if (v !== undefined) c.value = v;
      c.border = box; c.font = { name: 'Arial', size: 10, color: { argb: 'FF1F2937' } }; c.alignment = { vertical: 'middle', wrapText: i === 0 || i === ws._n - 1 };
      if (typeof v === 'number' || (v && v.formula)) { c.numFmt = NUM; c.alignment = { horizontal: 'right', vertical: 'middle' }; }
      else if (i > 1) c.alignment = { vertical: 'middle', wrapText: true, indent: 1 };
    }
    if (opt && opt.bold) ws.getCell(r, 2).font = { name: 'Arial', size: 10, bold: true, color: { argb: NAVY } };
    return r;
  }
  function notesBlock(ws, notes) {
    notes = (notes || []).map(strip).filter(Boolean); if (!notes.length) return;
    ws._r++; section(ws, 'Notes');
    notes.forEach(n => merged(ws, n, { font: { name: 'Arial', size: 9.5, color: { argb: 'FF374151' } }, h: Math.max(15, Math.ceil(n.length / 120) * 14) }));
  }
  function footer(ws, extra) {
    ws._r++;
    if (extra) merged(ws, extra, { font: { name: 'Arial', size: 9, italic: true, color: { argb: 'FF5B6B7B' } } });
    const c = merged(ws, '', { h: 18 });
    c.value = { text: 'Made with PharmaChemE: free calculators for chemical and pharma engineers. www.pharmacheme.in', hyperlink: 'https://www.pharmacheme.in/' };
    c.font = { name: 'Arial', size: 9, bold: true, color: { argb: NAVY } };
  }
  async function protect(ws) {
    await ws.protect(PASS, { selectLockedCells: true, selectUnlockedCells: true, formatCells: false, formatColumns: false, formatRows: false, insertRows: false, insertColumns: false, deleteRows: false, deleteColumns: false });
  }
  async function book(X) {
    const wb = new X.Workbook();
    wb.creator = 'PharmaChemE (www.pharmacheme.in)'; wb.company = 'PharmaChemE'; wb.created = new Date();
    const b64 = await banner();
    const img = b64 ? wb.addImage({ base64: b64, extension: 'png' }) : null;
    return { wb, img };
  }
  async function save(wb, name) {
    const buf = await lockObjects(await wb.xlsx.writeBuffer());
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    if (window.gtag) window.gtag('event', 'excel_download', { file_name: name });
  }

  /* ---------- 1. calculators with live formulas ----------
     spec: { title, sub, inputs:[{k,label,unit,value,text}], xl:[[id,label,formula,unit]] | null, rows:[[label,value,unit]], notes:[html] } */
  async function calcSheet(spec) {
    const X = await load(), { wb, img } = await book(X);
    const ws = newSheet(wb, 'Calculation', img);
    titleBlock(ws, spec.title, spec.sub);
    const live = spec.xl && spec.xl.length;
    section(ws, live ? 'Inputs: change the yellow cells' : 'Inputs');
    headRow(ws, ['Parameter', 'Value', 'Unit', 'Note']);
    const ref = {}, vals = {};
    spec.inputs.forEach(i => {
      const opts = /^type one of: /.test(i.unit || '') ? i.unit.replace(/^type one of: /, '').split(/,\s*/) : null;
      const r = dataRow(ws, [strip(i.label), toNum(i.value), opts ? '' : strip(i.unit || ''), strip(i.text || '')]);
      const c = ws.getCell(r, 2); c.numFmt = 'General';
      if (live) {
        c.protection = { locked: false }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INFILL } };
        c.font = { name: 'Arial', size: 10, bold: true, color: { argb: INFONT } };
        if (opts) c.dataValidation = { type: 'list', allowBlank: false, formulae: ['"' + opts.join(',') + '"'], showErrorMessage: true, errorTitle: 'PharmaChemE', error: 'Pick one of: ' + opts.join(', ') };
      }
      ref[i.k] = 'B' + r; vals[i.k] = i.value;
    });
    ws._r++;
    if (live) {
      section(ws, 'Results: calculated by formulas');
      headRow(ws, ['Result', 'Value', 'Unit', '']);
      spec.xl.forEach(([id, label, f, unit]) => {
        const xf = f.replace(/\{(\w+)\}/g, (_, k) => ref[k] || k), v = ev(f, vals);
        const r = dataRow(ws, [label, { formula: xf, result: typeof v === 'string' ? v : (isFinite(v) ? v : 0) }, unit || ''], { bold: true });
        ref[id] = 'B' + r; vals[id] = v;
      });
      ws._r++;
      section(ws, 'As shown on the website (for checking)');
    } else section(ws, 'Results');
    headRow(ws, ['Result', 'Value', 'Unit', '']);
    (spec.rows || []).forEach(r => dataRow(ws, [strip(r[0]), toNum(strip(r[1])), strip(r[2])]));
    notesBlock(ws, spec.notes);
    footer(ws, live ? 'Only the yellow input cells can be changed; results update automatically.' : 'Change the inputs on the website and download again.');
    await protect(ws);
    await save(wb, slug(spec.title));
  }

  /* ---------- 2. older calculators: a formatted report of every table on the page ---------- */
  async function fromTables(root, title) {
    const X = await load(), { wb, img } = await book(X);
    const tables = [...root.querySelectorAll('table')];
    const cols = Math.max(4, ...tables.map(t => Math.max(0, ...[...t.querySelectorAll('tr')].map(tr => tr.children.length))));
    const ws = newSheet(wb, 'Calculation', img, [40].concat(Array(cols - 1).fill(18)));
    titleBlock(ws, title, 'Inputs and results as entered on the website');
    tables.forEach((t, ti) => {
      const prev = t.previousElementSibling, cap = prev && /^H\d$/.test(prev.tagName) ? strip(prev.textContent) : '';
      section(ws, cap || (ti === 0 ? 'Calculation' : 'Table ' + (ti + 1)));
      [...t.querySelectorAll('tr')].forEach((tr, ri) => {
        const r = [...tr.children].map(td => {
          const inp = td.querySelector('input, select, textarea');
          if (inp) return inp.tagName === 'SELECT' ? (inp.selectedOptions[0] || {}).textContent || inp.value : inp.value;
          return (td.innerText || td.textContent).replace(/\s*\n+\s*/g, ' / ').replace(/[ \t]+/g, ' ').trim();
        });
        if (!r.some(x => x !== '')) return;
        const isHead = tr.querySelector('th') && !tr.querySelector('td');
        if (r.filter(x => x !== '').length === 1 && r[0] !== '' && ri > 0) { // a label row such as "Inputs" or "Results"
          const rr = ws._r++; for (let c = 1; c <= ws._n; c++) { const x = ws.getCell(rr, c); x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBF3DC' } }; x.border = box; }
          const x = ws.getCell(rr, 1); x.value = r[0].charAt(0) + r[0].slice(1).toLowerCase(); x.font = { name: 'Arial', size: 10, bold: true, color: { argb: NAVY } };
        } else if (isHead || ri === 0 && tr.closest('thead')) headRow(ws, r); else dataRow(ws, r.map(toNum));
      });
      ws._r++;
    });
    footer(ws, 'This sheet is a record of your calculation. Change the inputs on the website and download again.');
    await protect(ws);
    await save(wb, slug(title));
  }

  /* ---------- 3. simulation tools: summary plus data tables ----------
     spec: { title, sub, inputs:[[label,value,unit]], results:[[label,value,unit]], notes:[html], tables:[{name, head, rows}] } */
  async function dataBook(spec) {
    const X = await load(), { wb, img } = await book(X);
    const ws = newSheet(wb, 'Summary', img);
    titleBlock(ws, spec.title, spec.sub);
    section(ws, 'Inputs'); headRow(ws, ['Parameter', 'Value', 'Unit', '']);
    spec.inputs.forEach(r => dataRow(ws, [strip(r[0]), typeof r[1] === 'number' ? r[1] : toNum(strip(r[1])), strip(r[2])]));
    ws._r++; section(ws, 'Results'); headRow(ws, ['Result', 'Value', 'Unit', '']);
    spec.results.forEach(r => dataRow(ws, [strip(r[0]), typeof r[1] === 'number' ? r[1] : toNum(strip(r[1])), strip(r[2])], { bold: true }));
    notesBlock(ws, spec.notes);
    footer(ws, (spec.tables || []).length ? 'More data on the other sheets. Change the inputs on the website and download again.' : 'Change the inputs on the website and download again.');
    await protect(ws);
    for (const t of spec.tables || []) {
      const n = t.head.length, s2 = newSheet(wb, String(t.name), img, t.head.map((h, i) => i === 0 ? Math.max(20, strip(h).length + 4) : Math.max(14, strip(h).length + 3)).concat(n < 4 ? Array(4 - n).fill(14) : []));
      titleBlock(s2, spec.title + ': ' + strip(t.name), spec.sub);
      section(s2, strip(t.name));
      headRow(s2, t.head.map(strip));
      t.rows.forEach(r => dataRow(s2, r.map(c => typeof c === 'number' ? c : toNum(strip(c)))));
      footer(s2);
      await protect(s2);
    }
    await save(wb, slug(spec.title));
  }

  function fail(btn, e) { btn.disabled = false; btn.textContent = 'Download Excel'; alert((e && e.message) || 'Download failed. Please try again.'); }
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
