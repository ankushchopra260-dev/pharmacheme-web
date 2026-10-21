/* PharmaChemE: "Download PDF" for every calculator.
   A one-page-style report of the calculation as shown on the website: banner, inputs, results and method notes, with a link back to the live calculator.
   Built in the browser with jsPDF (self-hosted, loaded only when a download is asked for) and a subset of DejaVu Sans so units and Greek letters print correctly.
   The file is a record, not a tool: no formulas, no look-up data. To try other inputs, people come back to the page. */
(function () {
  'use strict';
  const me = document.currentScript;
  const ROOT = me ? me.src.replace(/js\/pdf-export\.js.*$/, '') : '/assets/';
  const LIB = ROOT + 'vendor/jspdf.umd.min.js', FONTS = ROOT + 'vendor/pdf-fonts.js', BANNER = ROOT + 'img/xl-banner.png';
  const NAVY = [11, 22, 34], BRASS = [201, 162, 39], GREY = [243, 244, 246], LINE = [200, 206, 214], INK = [31, 41, 55], MUTED = [91, 107, 123], BLUE = [31, 78, 156], SUB = [251, 243, 220];

  const scripts = {};
  function script(src, test) {
    if (test()) return Promise.resolve();
    if (!scripts[src]) scripts[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => { delete scripts[src]; rej(new Error('Could not prepare the PDF. Check your connection and try again.')); }; document.head.appendChild(s); });
    return scripts[src];
  }
  let bannerData = null;
  function banner() {
    if (bannerData) return Promise.resolve(bannerData);
    return fetch(BANNER).then(r => r.blob()).then(b => new Promise(res => { const fr = new FileReader(); fr.onload = () => { bannerData = fr.result; res(bannerData); }; fr.readAsDataURL(b); })).catch(() => null);
  }
  async function load() {
    await Promise.all([script(LIB, () => window.jspdf), script(FONTS, () => window.PCME_PDF_FONTS)]);
    return { jsPDF: window.jspdf.jsPDF, img: await banner() };
  }

  const strip = h => String(h == null ? '' : h).replace(/<br\s*\/?>/gi, ' ').replace(/<sup>(.*?)<\/sup>/gi, (_, x) => x.replace(/[0-9\-]/g, c => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] || '⁻')).replace(/<sub>(.*?)<\/sub>/gi, (_, x) => x.replace(/[0-9]/g, c => '₀₁₂₃₄₅₆₇₈₉'[+c])).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&deg;/g, '°').replace(/&[a-z]+;/g, '').replace(/\s+/g, ' ').trim();
  const slug = t => (strip(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'calculation') + '.pdf';
  const today = () => { const d = new Date(); return [d.getDate(), d.getMonth() + 1, d.getFullYear()].map(n => String(n).padStart(2, '0')).join('-'); };
  const pageUrl = () => location.href.split('#')[0].split('?')[0];
  let LINK = null; // link back to the page with the same inputs, set by each download
  const toNum = x => (typeof x === 'string' && /^-?[\d,]+(\.\d+)?$/.test(x.trim()) && /\d/.test(x)) ? +x.replace(/,/g, '') : x;
  function num(v) {
    if (typeof v !== 'number') return v == null ? '' : strip(v);
    if (!isFinite(v)) return '–';
    const a = Math.abs(v);
    if (a !== 0 && (a < 1e-4 || a >= 1e12)) { const [m, e] = v.toExponential(3).split('e'); return m + ' × 10' + String(+e).replace(/[-0-9]/g, c => c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]); }
    if (a >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (a >= 1) return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return String(+v.toFixed(4));
  }

  // evaluate a spreadsheet-style formula (used by the comparison-calculator layouts in xl-specs.js)
  function ev(f, vals, tables) {
    let js = f.replace(/\{(\w+)\}/g, (_, k) => typeof vals[k] === 'string' ? JSON.stringify(vals[k]) : '(' + vals[k] + ')');
    js = js.replace(/<>/g, '!=').replace(/(?<![<>!=])=(?!=)/g, '==').replace(/\^/g, '**').replace(/\bPI\(\)/g, 'Math.PI')
      .replace(/\bSQRT\(/g, 'Math.sqrt(').replace(/\bLN\(/g, 'Math.log(').replace(/\bLOG10\(/g, 'Math.log10(').replace(/\bEXP\(/g, 'Math.exp(').replace(/\bMIN\(/g, 'Math.min(').replace(/\bMAX\(/g, 'Math.max(').replace(/\bABS\(/g, 'Math.abs(')
      .replace(/\bIF\(/g, '__IF(').replace(/\bAND\(/g, '__AND(').replace(/\bOR\(/g, '__OR(').replace(/\bROUNDDOWN\(/g, '__RD(').replace(/\bVLOOKUP\(/g, '__VL(').replace(/\b([A-Z][A-Z_0-9]*)(?=\s*,\s*\d+\s*,\s*FALSE)/g, '"$1"').replace(/\bFALSE\b/g, 'false').replace(/\bTRUE\b/g, 'true');
    const VL = (key, name, col) => { const t = (tables || {})[name]; if (!t) return null; const r = t.find(x => String(x[0]) === String(key)); return r ? r[col - 1] : null; };
    try { return Function('__IF', '__AND', '__OR', '__RD', '__VL', '"use strict";return (' + js + ')')((c, a, b) => c ? a : b, (...a) => a.every(Boolean), (...a) => a.some(Boolean), (x, d) => { const f = Math.pow(10, d || 0); return Math.trunc(x * f) / f; }, VL); } catch (e) { return null; }
  }

  /* ---------- report writer ---------- */
  function Report(L, title, sub, landscape) {
    const doc = new L.jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4', compress: true });
    const F = window.PCME_PDF_FONTS;
    doc.addFileToVFS('dv.ttf', F.regular); doc.addFont('dv.ttf', 'DV', 'normal');
    doc.addFileToVFS('dvb.ttf', F.bold); doc.addFont('dvb.ttf', 'DV', 'bold');
    doc.setProperties({ title: strip(title) + ' | PharmaChemE', subject: strip(sub || ''), author: 'PharmaChemE', creator: 'PharmaChemE (www.pharmacheme.in)', keywords: 'PharmaChemE calculator' });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 14, CW = W - 2 * M, BOT = H - 16;
    const R = { doc, W, H, M, CW, y: 0, title: strip(title) };
    const font = (size, bold, color) => { doc.setFont('DV', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...(color || INK)); };
    R.font = font;
    R.newPage = () => {
      doc.addPage();
      doc.setFillColor(...NAVY); doc.rect(0, 0, W, 9, 'F');
      font(8, true, [236, 231, 216]); doc.text('PharmaChemE', M, 6);
      font(8, false, [236, 231, 216]); doc.text(R.title, W - M, 6, { align: 'right' });
      R.y = 16;
    };
    R.ensure = h => { if (R.y + h > BOT) { R.newPage(); return true; } return false; };
    // first page: banner, title, date, link back
    const bw = Math.min(CW, 182), bh = bw * 240 / 1800;
    doc.setFillColor(...NAVY); doc.rect(0, 0, W, bh + 10, 'F');
    if (L.img) doc.addImage(L.img, 'PNG', M, 5, bw, bh); else { font(20, true, [236, 231, 216]); doc.text('PharmaChemE', M, 18); }
    R.y = bh + 20;
    font(16, true, NAVY); doc.splitTextToSize(strip(title), CW).forEach(l => { doc.text(l, M, R.y); R.y += 7; });
    if (sub) { font(9.5, false, MUTED); doc.splitTextToSize(strip(sub), CW).forEach(l => { doc.text(l, M, R.y); R.y += 4.6; }); }
    R.y += 1.5;
    font(8.5, false, MUTED); doc.text('Date: ' + today(), W - M, R.y, { align: 'right' });
    font(9, true, BLUE);
    const cta = LINK ? 'Open this calculation on pharmacheme.in (same inputs)' : 'Try other inputs: open the live calculator on pharmacheme.in';
    doc.textWithLink(cta, M, R.y, { url: LINK || pageUrl() });
    doc.setDrawColor(...BLUE); doc.setLineWidth(0.2); doc.line(M, R.y + 0.8, M + doc.getTextWidth(cta), R.y + 0.8);
    R.y += 7;

    R.section = text => {
      R.ensure(18);
      doc.setFillColor(...NAVY); doc.rect(M, R.y, CW, 7, 'F');
      font(10, true, [236, 231, 216]); doc.text(strip(text), M + 2.5, R.y + 4.9);
      R.y += 7;
    };
    // widths in mm; rows: arrays of cell values; opt: {head, bold:[colIdx], numCols:[colIdx] (right aligned), subRows:Set(rowIdx)}
    R.table = (head, rows, widths, opt) => {
      opt = opt || {};
      const pad = 1.6, lh = 3.9, fs = opt.size || 8.6;
      const drawRow = (cells, kind) => {
        font(fs, kind === 'head' || kind === 'sub', kind === 'head' || kind === 'sub' ? NAVY : INK);
        const lines = cells.map((c, i) => {
          font(fs, kind === 'head' || kind === 'sub' || (opt.bold && opt.bold.includes(i)));
          const isNum = typeof c === 'number';
          const t = isNum ? num(c) : strip(c);
          return doc.splitTextToSize(t, widths[i] - 2 * pad);
        });
        const h = Math.max(1, ...lines.map(l => l.length)) * lh + 2 * pad - 0.6;
        if (R.ensure(h) && kind !== 'head' && head) drawRow(head, 'head');
        let x = M;
        if (kind === 'head') { doc.setFillColor(...GREY); doc.rect(M, R.y, CW, h, 'F'); }
        if (kind === 'sub') { doc.setFillColor(...SUB); doc.rect(M, R.y, CW, h, 'F'); }
        doc.setDrawColor(...LINE); doc.setLineWidth(0.2);
        cells.forEach((c, i) => {
          const right = kind !== 'head' && kind !== 'sub' && (typeof c === 'number' || (opt.numCols && opt.numCols.includes(i) && /^[-–\d.,\s×^]+$/.test(String(num(c)))));
          const bold = kind === 'head' || kind === 'sub' || (opt.bold && opt.bold.includes(i));
          font(fs, bold, kind === 'head' || kind === 'sub' ? NAVY : (opt.bold && opt.bold.includes(i) && i > 0 ? NAVY : INK));
          lines[i].forEach((ln, k) => doc.text(ln, right ? x + widths[i] - pad : x + pad, R.y + pad + 2.7 + k * lh, right ? { align: 'right' } : undefined));
          doc.rect(x, R.y, widths[i], h);
          x += widths[i];
        });
        R.y += h;
      };
      if (head) drawRow(head, 'head');
      rows.forEach((r, ri) => drawRow(r, opt.subRows && opt.subRows.has(ri) ? 'sub' : 'body'));
      R.y += 5;
    };
    R.notes = notes => {
      notes = (notes || []).map(strip).filter(Boolean); if (!notes.length) return;
      R.section('Notes'); R.y += 2;
      notes.forEach(n => { font(8.6, false, [55, 65, 81]); const ls = doc.splitTextToSize('•  ' + n, CW - 2); R.ensure(ls.length * 4 + 1); ls.forEach(l => { doc.text(l, M + 1, R.y + 3); R.y += 4; }); R.y += 1; });
      R.y += 3;
    };
    R.finish = async name => {
      R.ensure(14);
      font(8.5, false, MUTED); doc.text('This PDF is a record of your calculation. Results are estimates; check them against your own data and plant practice.', M, R.y + 2, { maxWidth: CW }); R.y += 8;
      const n = doc.getNumberOfPages();
      for (let i = 1; i <= n; i++) {
        doc.setPage(i);
        doc.setDrawColor(...BRASS); doc.setLineWidth(0.4); doc.line(M, H - 11, W - M, H - 11);
        font(8, true, NAVY); doc.textWithLink('PharmaChemE  ·  www.pharmacheme.in', M, H - 6.5, { url: 'https://www.pharmacheme.in/' });
        font(8, false, MUTED); doc.text('Page ' + i + ' of ' + n, W - M, H - 6.5, { align: 'right' });
      }
      doc.save(name);
      if (window.gtag) window.gtag('event', 'pdf_download', { file_name: name });
    };
    return R;
  }

  /* ---------- 1. single calculators (utilities.js) ---------- */
  async function calcSheet(spec) {
    LINK = spec.link || null;
    const L = await load(), R = Report(L, spec.title, spec.sub);
    const w = [R.CW * 0.46, R.CW * 0.2, R.CW * 0.34];
    R.section('Results');
    R.table(['Result', 'Value', 'Unit'], (spec.rows || []).map(r => [strip(r[0]), toNum(strip(r[1])), strip(r[2])]), w, { bold: [1] });
    R.section('Inputs (backup data)');
    R.table(['Parameter', 'Value', 'Unit'], spec.inputs.map(i => {
      const sel = /^type one of: /.test(i.unit || '');
      return [strip(i.label), sel && i.text ? strip(i.text) : String(i.value == null ? '' : i.value), sel ? '' : strip(i.unit || '')];
    }), w, { numCols: [1] });
    R.notes(spec.notes);
    await R.finish(slug(spec.title));
  }

  /* ---------- 2. a report of every table on the page (materials compatibility, reaction builder) ---------- */
  async function fromTables(root, title, opt) {
    opt = opt || {};
    LINK = opt.link || null;
    const tables = [...root.querySelectorAll('table')].filter(t => t.offsetParent !== null || opt.offscreen);
    const cols = Math.max(2, ...tables.map(t => Math.max(0, ...[...t.querySelectorAll('tr')].map(tr => [...tr.children].reduce((s, td) => s + (+td.colSpan || 1), 0)))));
    const L = await load(), R = Report(L, title, opt.sub || 'As calculated on the website', cols > 5);
    if (opt.image) { const h = Math.min(60, R.CW * opt.image.h / opt.image.w), w = h * opt.image.w / opt.image.h; R.ensure(h + 4); R.doc.addImage(opt.image.data, 'PNG', R.M, R.y, w, h); R.y += h + 5; }
    tables.forEach((t, ti) => {
      const prev = t.previousElementSibling, cap = prev && /^H\d$/.test(prev.tagName) ? strip(prev.textContent) : '';
      R.section(cap || (ti === 0 ? 'Calculation' : 'Table ' + (ti + 1)));
      let head = null; const rows = [], subs = new Set();
      [...t.querySelectorAll('tr')].forEach((tr, ri) => {
        const r = [];
        [...tr.children].forEach(td => {
          const inp = td.querySelector('input, select, textarea');
          const v = inp ? (inp.tagName === 'SELECT' ? (inp.selectedOptions[0] || {}).textContent || inp.value : inp.value) : (td.innerText || td.textContent).replace(/\s*\n+\s*/g, ' / ').replace(/[ \t]+/g, ' ').trim();
          r.push(toNum(v)); for (let k = 1; k < (+td.colSpan || 1); k++) r.push('');
        });
        while (r.length < cols) r.push('');
        if (!r.some(x => x !== '')) return;
        const isHead = tr.querySelector('th') && !tr.querySelector('td');
        if ((isHead || tr.closest('thead')) && !head && !rows.length) { head = r; return; }
        if (r.filter(x => x !== '').length === 1 && r[0] !== '' && ri > 0) subs.add(rows.length);
        rows.push(r);
      });
      // width by content: short symbol columns (+, →) stay narrow
      const len = i => Math.min(28, Math.max(1, ...[head || []].concat(rows).map(r => String(r[i] == null ? '' : (typeof r[i] === 'number' ? num(r[i]) : r[i])).length)));
      const first = Math.min(R.CW * (cols > 5 ? 0.22 : 0.36), 64), lens = Array.from({ length: cols - 1 }, (_, i) => len(i + 1) <= 2 ? 0 : Math.max(6, len(i + 1)));
      const narrow = 7, nNarrow = lens.filter(x => !x).length, tot = lens.reduce((a, b) => a + b, 0) || 1, free = R.CW - first - nNarrow * narrow;
      R.table(head, rows, [first].concat(lens.map(x => x ? free * x / tot : narrow)), { subRows: subs, size: cols > 7 ? 7.4 : 8.4, numCols: Array.from({ length: cols }, (_, i) => i).slice(1) });
    });
    R.notes(opt.notes);
    await R.finish(opt.file || slug(title));
  }

  /* ---------- 3. simulation tools: inputs and results ---------- */
  async function dataBook(spec) {
    LINK = spec.link || null;
    const L = await load(), R = Report(L, spec.title, spec.sub);
    const w = [R.CW * 0.46, R.CW * 0.2, R.CW * 0.34];
    const val = v => typeof v === 'number' ? v : toNum(strip(v));
    R.section('Results'); R.table(['Result', 'Value', 'Unit'], spec.results.map(r => [strip(r[0]), val(r[1]), strip(r[2])]), w, { bold: [1] });
    R.section('Inputs (backup data)'); R.table(['Parameter', 'Value', 'Unit'], spec.inputs.map(r => [strip(r[0]), typeof r[1] === 'number' ? String(r[1]) : strip(r[1]), strip(r[2])]), w, { numCols: [1] });
    R.notes(spec.notes);
    await R.finish(slug(spec.title));
  }

  /* ---------- 4. comparison calculators: one column per case (layouts in xl-specs.js) ---------- */
  async function caseSheet(spec) {
    LINK = spec.link || null;
    const n = spec.cases.length, L = await load(), R = Report(L, spec.title, spec.sub, n > 3);
    const tables = {}; Object.entries(spec.tables || {}).forEach(([k, t]) => { tables[k] = t.rows; });
    const vals = spec.cases.map(() => ({}));
    const first = n > 3 ? 62 : 66, unitW = 24, cw = (R.CW - first - unitW) / Math.max(1, n);
    const widths = [first, unitW].concat(Array(n).fill(cw));
    const head = ['Parameter', 'Unit'].concat(spec.cases.map(strip));
    const out = [];
    for (const sec of spec.sections) {
      const rows = [];
      for (const row of sec.rows) {
        const cells = spec.cases.map((_, ci) => {
          let v;
          if (row.f == null) { const raw = row.values[ci]; v = typeof raw === 'string' ? toNum(raw) : raw; if (v === '' || v == null) v = ''; vals[ci][row.k] = v === '' ? null : v; return raw == null ? '' : String(raw); }
          else v = row.values && row.values[ci] !== undefined ? row.values[ci] : ev(row.f, vals[ci], tables);
          vals[ci][row.k] = v === '' ? null : v;
          return (typeof v === 'number' && !isFinite(v)) || v == null ? '–' : v;
        });
        if (!row.helper) rows.push([strip(row.label), strip(row.unit || '')].concat(cells));
      }
      if (!rows.length) continue;
      out.push({ title: sec.title, rows, isResult: sec.rows.some(r => r.f != null) });
    }
    // results first, then the inputs as backup data
    out.filter(o => o.isResult).concat(out.filter(o => !o.isResult)).forEach(o => {
      R.section(o.isResult ? o.title : (/^inputs?$/i.test(o.title) ? 'Inputs (backup data)' : o.title + ' (backup data)'));
      R.table(head, o.rows, widths, { bold: o.isResult ? Array.from({ length: n }, (_, i) => i + 2) : [], numCols: Array.from({ length: n }, (_, i) => i + 2), size: n > 5 ? 7.6 : 8.4 });
    });
    R.notes(spec.notes);
    await R.finish(slug(spec.title));
  }

  /* ---------- 5. free-form report: spec { title, sub, sections:[{title, head, rows, widths:[fractions], bold:[col]}], notes } ---------- */
  async function report(spec) {
    LINK = spec.link || null;
    const L = await load(), R = Report(L, spec.title, spec.sub);
    spec.sections.forEach(sec => { R.section(sec.title); R.table(sec.head, sec.rows, sec.widths.map(f => f * R.CW), { bold: sec.bold || [] }); });
    R.notes(spec.notes);
    await R.finish(slug(spec.title));
  }

  function fail(btn, e) { btn.disabled = false; btn.textContent = 'Download PDF'; alert((e && e.message) || 'Download failed. Please try again.'); }
  window.PCME_XL = { calcSheet, fromTables, dataBook, caseSheet, report, fail, ev };

  function addTableButton() {
    const mount = document.getElementById('calc-mount') || document.getElementById('panels'); if (!mount || mount.dataset.xl) return; mount.dataset.xl = 1;
    const bar = document.createElement('div'); bar.className = 'xl-bar';
    bar.innerHTML = '<button type="button" class="btn btn-outline btn-sm">Download PDF</button><span>A copy of your inputs and results</span>';
    mount.parentNode.insertBefore(bar, mount.nextSibling);
    const btn = bar.querySelector('button');
    btn.addEventListener('click', () => {
      if (window.PCME_PDF_CUSTOM) {
        const c = window.PCME_PDF_CUSTOM();
        if (!c || c.error) { alert((c && c.error) || 'Nothing to download on this page yet.'); return; }
        btn.disabled = true; btn.textContent = 'Preparing…';
        c.link = c.link || location.href.split('#')[0];
        report(c).then(() => { btn.disabled = false; btn.textContent = 'Download PDF'; }, e => fail(btn, e));
        return;
      }
      if (!mount.querySelector('table')) { alert('Nothing to download on this page yet. Pick your inputs first.'); return; }
      btn.disabled = true; btn.textContent = 'Preparing…';
      const h1 = document.querySelector('h1');
      let spec = null; try { spec = window.PCME_XL_CASES && window.PCME_XL_CASES(); } catch (e) { spec = null; }
      let link = null; try { link = window.PCME_CALC_LINK && window.PCME_CALC_LINK(); } catch (e) { link = null; }
      if (spec) spec.link = link;
      (spec ? caseSheet(spec) : fromTables(mount, h1 ? h1.textContent.trim() : document.title, { link })).then(() => { btn.disabled = false; btn.textContent = 'Download PDF'; }, e => fail(btn, e));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(addTableButton, 0)); else setTimeout(addTableButton, 0);
})();
