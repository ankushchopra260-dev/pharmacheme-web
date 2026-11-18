// ================================================================
// PharmaChemE Batch Scheduler, simple mode (days, stage-wise)
// One row per stage, drawn on a day grid. Each stage: BCT (hours between
// batch starts), STE (hours one batch takes), hours before the first
// batch (cleaning, transfer, analysis, modification) with a note,
// batches (calculated as 24 h × days ÷ BCT for a regular product, or
// entered for a campaign), batches already in progress (WIP), output per
// batch, and whether it starts after the first or the last batch of the
// previous stage.
// ================================================================
(function () {
  "use strict";
  const KEY = "pce-batch-simple-v5";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v, d) => { const x = parseFloat(v); return isFinite(x) ? x : d; };
  const f = (v, d) => (isFinite(v) ? Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");
  const PAL = [["#B7DDEB", "#0B3A52"], ["#F8C59B", "#5A2A06"], ["#C9E7B5", "#1E4A10"], ["#E3CBF0", "#3E1D52"], ["#F6E39A", "#4D3D00"], ["#F3B7B7", "#561212"]];

  function nextMonth1() { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); const m = new Date(d.getFullYear(), d.getMonth() + 1, 1); return `${m.getFullYear()}-${p(m.getMonth() + 1)}-01`; }
  /* days from the first day to the end of its calendar month (e.g. 1 Dec → 31 Dec 24:00 = 31 days) */
  function prevMonthDays() { const a = new Date(S.start + "T00:00:00"); const b = new Date(a.getFullYear(), a.getMonth() - 1, a.getDate()); return Math.round((a - b) / 86400e3); }
  function monthEnd() { const a = new Date(S.start + "T00:00:00"); const b = new Date(a.getFullYear(), a.getMonth() + 1, 1); return Math.round((b - a) / 86400e3); }
  function tomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
  const DEFAULT = () => ({
    start: nextMonth1(), days: "", unit: "kg", mode: "regular",
    stages: [
      { name: "Stage-01", bct: 48, ste: 96, pre: 0, note: "", n: 14, wip: "", out: 25, link: "first" },
      { name: "Stage-02", bct: 72, ste: 144, pre: 0, note: "", n: 9, wip: "", out: 30, link: "first" },
      { name: "Stage-03", bct: 48, ste: 96, pre: 0, note: "", n: 14, wip: "", out: 45, link: "first" },
      { name: "Stage-04", bct: 96, ste: 144, pre: 0, note: "", n: 7, wip: "", out: 50, link: "first" },
    ],
  });
  let S = null;

  function dateAt(dayOffset) { const d = new Date(S.start + "T00:00:00"); d.setTime(d.getTime() + dayOffset * 86400e3); return d; }
  const fmtD = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const fmtDT = (d) => d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).replace(",", "");
  const fmtShort = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  /* a bar from day s to day e (exclusive) covers the dates s … e−1 when whole days are used */
  const lastDay = (e) => dateAt(Math.ceil(e - 1e-9) - 1);

  /* BCT is the charging gap (the longest equipment time in the stage); a batch moves through the
     stage's equipment over its STE, so batches overlap when BCT < STE */
  /* working days: the calendar days of the month unless the user has typed a number */
  const daysSet = () => String(S.days == null ? "" : S.days).trim() !== "" && num(S.days, 0) > 0;
  const workDays = (cal) => (daysSet() ? num(S.days, 0) : cal == null ? monthEnd() : cal);
  const autoN = (st, cal) => { const g = num(st.bct, 0); return g > 0 ? Math.floor((24 * workDays(cal)) / g + 1e-9) : 0; };
  const newCount = (st) => Math.min(500, Math.max(0, S.mode === "regular" ? autoN(st) : Math.round(num(st.n, 0))));

  /* Running (regular) product: the line has been running before the month and keeps running after it.
     Every stage charges a batch every BCT; stage k is phased so that a batch is charged when the
     matching batch of stage k−1 comes out (its start + STE). Batches charged before the first day and
     still running are the opening WIP; batches charged in the month and still running at its end are
     the closing WIP. */
  function planRegular() {
    const out = [], warn = [], D = monthEnd();
    let phi = 0, prevSte = 0;
    S.stages.forEach((st, k) => {
      const nm = st.name || "Stage " + (k + 1);
      const bctH = Math.max(0, num(st.bct, 0)), steH = Math.max(0, num(st.ste, 0)), bct = bctH / 24, ste = steH / 24, b = [];
      if (bct <= 0) warn.push(`${nm}: enter a BCT above zero.`);
      else {
        if (k > 0) phi = (((phi + prevSte) % bct) + bct) % bct;
        let nW = 0, nN = 0;
        const n = Math.min(500, autoN(st));
        /* last month ran the same way: n charges from its first day; those still running are the opening WIP */
        const Dp = prevMonthDays(), nP = Math.min(500, autoN(st, Dp));
        for (let i = 0; i < nP; i++) { const s0 = -Dp + phi + i * bct, e = s0 + ste; if (s0 < -1e-9 && e > 1e-9) b.push({ wip: true, j: nW++, s: s0, e }); }
        for (let i = 0; i < n; i++) { const s0 = phi + i * bct, e = s0 + ste; b.push({ wip: false, i: nN++, s: s0, e, close: s0 < D - 1e-9 && e > D + 1e-9, next: s0 >= D - 1e-9 }); }
        b.sort((x, y) => x.s - y.s);
        let q = 0; b.forEach((x) => { if (x.wip) x.j = q++; });
      }
      if (bctH > 0 && steH > 0 && bctH > steH) warn.push(`${nm}: BCT is longer than STE, so the equipment stands idle between batches.`);
      b.forEach((x, q) => { x.lane = q; });
      out.push({ st, k, bctH, steH, bct, ste, pre: 0, preS: 0, preE: 0, batches: b, lanes: Math.max(1, b.length) });
      prevSte = ste;
    });
    for (let k = 1; k < out.length; k++) {
      const a = out[k - 1], c = out[k];
      if (a.bct > 0 && c.bct > 0 && c.bct < a.bct - 1e-9) warn.push(`${c.st.name || "Stage " + (k + 1)} can take ${autoN(c.st)} batches in ${f(workDays(), 0)} working days but ${a.st.name || "the stage before"} makes ${autoN(a.st)}; the difference has to come from stock.`);
    }
    return { rows: out, warn, D, end: Math.max(D, ...out.map((r) => Math.max(0, ...r.batches.map((x) => x.e)))) };
  }

  /* all times inside are in days from the first day 00:00; inputs are hours */
  function plan() {
    if (S.mode === "regular") return planRegular();
    const out = [], warn = [];
    S.stages.forEach((st, k) => {
      const nm = st.name || "Stage " + (k + 1);
      const bctH = Math.max(0, num(st.bct, 0)), steH = Math.max(0, num(st.ste, 0)), preH = Math.max(0, num(st.pre, 0));
      const bct = bctH / 24, ste = steH / 24, pre = preH / 24, n = newCount(st), wip = [];
      const prev = out[k - 1], b = [];
      // batches already running in the stage; they end after the hours left
      wip.forEach((left, j) => { if (left > steH + 1e-9) warn.push(`${nm}: a WIP batch has more hours left (${left}) than the STE (${steH}).`); const e = left / 24; b.push({ wip: true, j, s: e - ste, e }); });
      b.sort((x, y) => x.e - y.e);
      let anchor = 0;
      if (prev && prev.batches.length) anchor = st.link === "last" ? prev.batches[prev.batches.length - 1].e : prev.batches[0].e;
      const firstNew = wip.length ? Math.max(0, Math.max(...b.map((x) => x.s)) + bct, st.link === "last" && prev && prev.batches.length ? anchor : 0) : anchor + pre;
      for (let i = 0; i < n; i++) {
        const idx = b.length;
        let s = firstNew + i * bct;
        /* material for this batch must have come out of the matching batch of the previous stage */
        if (prev && st.link !== "last" && prev.batches[i] && prev.batches[i].e > s + 1e-9) s = prev.batches[i].e;
        const last = b[idx - 1];
        if (last && s < last.s + bct - 1e-9) s = last.s + bct;
        b.push({ wip: false, i, s, e: s + ste });
      }
      /* every batch on its own line, one below the other */
      b.forEach((x, q) => { x.lane = q; });
      if (prev && st.link !== "last" && prev.batches.length < n) warn.push(S.mode === "regular" ? `${nm} can take ${n} batches in ${f(workDays(), 0)} days but ${prev.st.name || "the stage before"} makes ${prev.batches.length}; the other ${n - prev.batches.length} need intermediate from stock.` : `${nm} has more batches than the stage before it can feed.`);
      if (bctH > 0 && steH > 0 && bctH > steH) warn.push(`${nm}: BCT is longer than STE, so the equipment stands idle between batches.`);
      if (n > 0 && bctH <= 0) warn.push(`${nm}: enter a BCT above zero.`);
      const hasPre = !wip.length && pre > 0;
      out.push({ st, k, bctH, steH, bct, ste, pre: hasPre ? pre : 0, preS: anchor, preE: anchor + (hasPre ? pre : 0), batches: b, nNew: n, nWip: wip.length, lanes: Math.max(1, b.length) });
    });
    const D = monthEnd();
    out.forEach((r) => r.batches.forEach((x) => { x.close = x.s < D - 1e-9 && x.e > D + 1e-9; x.next = x.s >= D - 1e-9; }));
    return { rows: out, warn, D, end: Math.max(0, ...out.map((r) => Math.max(r.preE, ...r.batches.map((x) => x.e)))) };
  }
  const label = (b) => (b.wip ? "WIP" + (b.j + 1) : "#" + String(b.i + 1).padStart(2, "0"));

  function chart(P) {
    const days = Math.max(7, Math.ceil(P.end - 1e-9), (P.D || 0) + 1);
    const cw = 26, nameW = 130, numW = 38, top = 104, laneH = 22;
    const left = nameW + numW * 2;
    const rowsH = P.rows.map((r) => r.lanes * laneH + 8);
    const H = top + rowsH.reduce((a, b) => a + b, 0) + 2, W = left + days * cw + 2;
    let g = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Stage-wise batch schedule by day" font-family="sans-serif">`;
    g += `<rect x="0" y="0" width="${W}" height="${top}" fill="#E26A12"/>`;
    g += `<text x="8" y="${top - 10}" fill="#fff" font-size="12" font-weight="700">Stage</text>`;
    g += `<text transform="translate(${nameW + numW / 2 + 4},${top - 8}) rotate(-90)" fill="#fff" font-size="12" font-weight="700">BCT, h</text>`;
    g += `<text transform="translate(${nameW + numW * 1.5 + 4},${top - 8}) rotate(-90)" fill="#fff" font-size="12" font-weight="700">STE, h</text>`;
    for (let d = 0; d < days; d++) {
      const x = left + d * cw, dt = dateAt(d), we = dt.getDay() === 0;
      g += `<text transform="translate(${x + cw / 2 + 4},${top - 6}) rotate(-90)" fill="#fff" font-size="11" font-weight="${we ? 700 : 400}">${esc(fmtShort(dt))}${dt.getDate() === 1 || d === 0 ? " " + dt.getFullYear() : ""}</text>`;
      g += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${d ? "#c9c9c9" : "#555"}" stroke-width="1"/>`;
    }
    [nameW, nameW + numW].forEach((x) => (g += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#555"/>`));
    let y = top;
    P.rows.forEach((r, i) => {
      const h = rowsH[i];
      g += `<rect x="0" y="${y}" width="${W}" height="${h}" fill="#fff"/><line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#555"/>`;
      for (let d = 0; d < days; d++) g += `<line x1="${left + d * cw}" y1="${y}" x2="${left + d * cw}" y2="${y + h}" stroke="#d6d6d6"/>`;
      g += `<text x="6" y="${y + h / 2 + 5}" fill="#111" font-size="13">${esc(r.st.name || "Stage " + (i + 1))}</text>`;
      g += `<text x="${nameW + numW / 2}" y="${y + h / 2 + 5}" fill="#111" font-size="13" text-anchor="middle">${f(r.bctH, r.bctH % 1 ? 1 : 0)}</text>`;
      g += `<text x="${nameW + numW * 1.5}" y="${y + h / 2 + 5}" fill="#111" font-size="13" text-anchor="middle">${f(r.steH, r.steH % 1 ? 1 : 0)}</text>`;
      if (r.pre > 0) {
        const x = left + r.preS * cw, w = r.pre * cw;
        g += `<rect x="${x}" y="${y + 3}" width="${w}" height="${h - 6}" fill="#D8D2C4"><title>${esc((r.st.note || "Before the first batch") + ": " + f(r.pre * 24, 0) + " h, " + fmtD(dateAt(r.preS)) + " to " + fmtD(lastDay(r.preE)))}</title></rect>`;
        g += `<polygon points="${x + w - 7},${y + 3} ${x + w},${y + 3} ${x + w},${y + 10}" fill="#d11"/>`;
      }
      r.batches.forEach((b) => {
        const [bg, fg] = b.wip ? ["#9AA7B5", "#0B1622"] : PAL[b.i % 2 === 0 ? 0 : 1];
        const s0 = Math.max(0, b.s), x = left + s0 * cw, w = Math.max(2, (b.e - s0) * cw), yy = y + 4 + b.lane * laneH, hh = laneH - 2;
        const lab = label(b);
        g += `<rect x="${x}" y="${yy}" width="${w}" height="${hh}" fill="${bg}" stroke="${b.close ? "#C0152F" : "#7a7a7a"}" stroke-width="${b.close ? 1.4 : 0.6}"${b.close ? ' stroke-dasharray="4 3"' : ""}><title>${esc((r.st.name || "") + " " + lab + ": " + fmtDT(dateAt(b.s)) + " to " + fmtDT(dateAt(b.e)) + (b.wip ? " (opening WIP, charged last month)" : b.close ? " (closing WIP, finishes next month)" : ""))}</title></rect>`;
        if (w > 40) g += `<text x="${x + w / 2}" y="${yy + hh / 2 + 5}" fill="${fg}" font-size="13" text-anchor="middle" pointer-events="none">${lab}</text>`;
        else g += `<text x="${x + w + 4}" y="${yy + hh / 2 + 5}" fill="#333" font-size="12" pointer-events="none">${lab}</text>`;
      });
      y += h;
    });
    g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#555"/>`;
    if (P.D < days) { const xm = left + P.D * cw; g += `<line x1="${xm}" y1="${top - 30}" x2="${xm}" y2="${y}" stroke="#C0152F" stroke-width="2" stroke-dasharray="6 4"/><text x="${xm - 4}" y="${top + 14}" fill="#C0152F" font-size="11" font-weight="700" text-anchor="end">month end</text>`; }
    return g + `</svg>`;
  }

  function editors() {
    const opt = (v, cur, t) => `<option value="${v}"${cur === v ? " selected" : ""}>${t}</option>`;
    const row = (s, i) => `<tr>
      <td><input type="text" data-p="stages.${i}.name" value="${esc(s.name)}" style="width:9em" aria-label="Stage name"></td>
      <td><input type="number" step="any" min="0" data-p="stages.${i}.bct" value="${esc(s.bct)}" aria-label="BCT, hours"></td>
      <td><input type="number" step="any" min="0" data-p="stages.${i}.ste" value="${esc(s.ste)}" aria-label="STE, hours"></td>
      <td>${S.mode === "regular" ? `<span class="bs-auto" data-o="n${i}" title="24 h × ${esc(workDays())} days ÷ BCT">${autoN(s)}</span>` : `<input type="number" step="1" min="0" data-p="stages.${i}.n" value="${esc(s.n)}" aria-label="New batches">`}</td>
      ${S.mode === "regular" ? `<td colspan="3"><span class="bg-small">${i === 0 ? "running product: the line is already full" : "—"}</span></td>` : `<td>${i === 0 ? `<span class="bg-small">plan start</span>` : `<select data-p="stages.${i}.link" aria-label="Starts after">${opt("first", s.link, "#01 of previous stage")}${opt("last", s.link, "last of previous stage")}</select>`}</td>
      <td><input type="number" step="any" min="0" data-p="stages.${i}.pre" value="${esc(s.pre)}" aria-label="Hours before first batch"></td>
      <td><input type="text" data-p="stages.${i}.note" value="${esc(s.note)}" class="bs-note" aria-label="What happens before the first batch"></td>`}
      <td><input type="number" step="any" min="0" data-p="stages.${i}.out" value="${esc(s.out)}" aria-label="Output per batch"></td>
      <td class="bg-btns"><button type="button" data-act="up" data-i="${i}" aria-label="Move up">↑</button><button type="button" data-act="del" data-i="${i}" aria-label="Remove stage">×</button></td></tr>`;
    return `<div class="bs-plan">
        <label><span>First day</span><input type="date" data-p="start" value="${esc(S.start)}"></label>
        <label><span title="Batches = 24 h × these days ÷ BCT">Working days in a month</span><input type="number" step="1" min="1" data-p="days" value="${esc(daysSet() ? S.days : "")}" placeholder="${monthEnd()} (auto)" aria-label="Working days in a month; leave empty for the days in the month"></label>
        <label><span>Product</span><select data-p="mode"><option value="regular"${S.mode === "regular" ? " selected" : ""}>Running product: 24 h × days ÷ BCT, WIP automatic</option><option value="campaign"${S.mode !== "regular" ? " selected" : ""}>New product or campaign: batches entered, starts empty</option></select></label>
        <label><span>Output unit</span><input type="text" data-p="unit" value="${esc(S.unit)}"></label>
      </div>
      <div class="bg-scroll"><table class="bg-tab bs-tab"><thead><tr><th>Stage</th><th>BCT, h</th><th>STE, h</th><th>${S.mode === "regular" ? "Batches in the month" : "Batches"}</th><th>Starts after</th><th>Hours before first batch</th><th>What happens before it</th><th>Output per batch, ${esc(S.unit)}</th><th></th></tr></thead><tbody>${S.stages.map(row).join("")}</tbody></table></div>
      <div class="pill-group"><button type="button" class="pill" data-act="add">+ Add stage</button><button type="button" class="pill" data-act="reset">Load the example</button></div>`;
  }

  function results() {
    const P = plan();
    let h = "";
    if (!P.rows.length) { $("bs-results").innerHTML = `<div class="bg-note bg-bad">Add at least one stage.</div>`; return; }
    const D = P.D, reg = S.mode === "regular", unit = esc(S.unit);
    const last = P.rows[P.rows.length - 1], lo = num(last.st.out, 0);
    const cnt = (r) => ({ open: r.batches.filter((b) => b.wip).length, charged: r.batches.filter((b) => !b.wip && b.s < D - 1e-9).length, done: r.batches.filter((b) => b.e <= D + 1e-9).length, close: r.batches.filter((b) => b.close).length, next: r.batches.filter((b) => b.next).length });
    const C = P.rows.map(cnt), cl = C[C.length - 1];
    const sumOpen = C.reduce((a, c) => a + c.open, 0), sumClose = C.reduce((a, c) => a + c.close, 0);
    const bn = P.rows.reduce((a, r) => (r.bctH > 0 && (!a || r.bctH > a.bctH) ? r : a), null);
    const mEnd = fmtD(lastDay(D)) + " 24:00";
    h += `<div class="bg-grid4" aria-live="polite">
      <div class="readout"><div class="label">Output to ${esc(fmtShort(lastDay(D)))}</div><div class="val">${f(cl.done * lo, 0)}</div><div class="bg-unit">${unit} · ${cl.done} batches of ${esc(last.st.name || "the last stage")} finished by ${esc(mEnd)}</div></div>
      <div class="readout"><div class="label">Opening WIP</div><div class="val">${reg ? sumOpen : 0}</div><div class="bg-unit">${reg ? (sumOpen === 1 ? "batch" : "batches") + " charged last month, finishing this month" : "a new product starts empty"}</div></div>
      <div class="readout"><div class="label">Closing WIP</div><div class="val">${sumClose}</div><div class="bg-unit">${sumClose === 1 ? "batch" : "batches"} still running at month end${!reg && C.some((c) => c.next) ? " · " + C.reduce((a, c) => a + c.next, 0) + " more start next month" : ""}</div></div>
      <div class="readout"><div class="label">Slowest stage</div><div class="val">${bn ? esc(bn.st.name || "") : "—"}</div><div class="bg-unit">${bn ? "BCT " + f(bn.bctH, 0) + " h · " + autoN(bn.st) + " batches in " + f(workDays(), 0) + " working days" : ""}</div></div></div>`;
    P.warn.forEach((w) => (h += `<div class="bg-note">${esc(w)}</div>`));
    h += `<div class="bg-toolbar"><button type="button" class="pill" data-act="csv">Download CSV</button><button type="button" class="pill" data-act="print">Print</button><span class="bg-small" style="margin:0">Each batch has its own line. Grey bars: opening WIP, charged last month. Red dashed outline: closing WIP, still running at the red month-end line.${reg ? "" : " Grey block: time before the first batch (hover for the note)."}</span></div>`;
    h += `<div class="bs-chart">${chart(P)}</div>`;
    h += `<h3 class="bg-h">Month summary, ${esc(fmtD(dateAt(0)))} to ${esc(mEnd)}</h3><div class="bg-scroll"><table class="bg-tab bg-out"><thead><tr><th>Stage</th><th>Opening WIP</th><th>Charged in the month</th><th>Finished in the month</th><th>Closing WIP</th>${reg ? "" : "<th>Start next month</th>"}<th>Output in the month, ${unit}</th></tr></thead><tbody>
      ${P.rows.map((r, k) => { const c = C[k]; return `<tr><td>${esc(r.st.name)}</td><td>${c.open}</td><td>${c.charged}</td><td>${c.done}</td><td>${c.close}</td>${reg ? "" : `<td>${c.next}</td>`}<td>${f(c.done * num(r.st.out, 0), 0)}</td></tr>`; }).join("")}</tbody></table></div>
      <h3 class="bg-h">Batch dates</h3><div class="bg-scroll"><table class="bg-tab bg-out"><thead><tr><th>Stage</th><th>Batch</th><th>Charged</th><th>Finishes</th><th>Hours</th><th></th></tr></thead><tbody>
      ${P.rows.map((r) => r.batches.map((b) => `<tr><td>${esc(r.st.name)}</td><td>${label(b)}</td><td>${esc(fmtDT(dateAt(b.s)))}</td><td>${esc(fmtDT(dateAt(b.e)))}</td><td>${f((b.e - b.s) * 24, 0)}</td><td>${status(b)}</td></tr>`).join("")).join("")}</tbody></table></div>`;
    $("bs-results").innerHTML = h;
    S.stages.forEach((st, i) => { const o = document.querySelector(`[data-o="n${i}"]`); if (o) o.textContent = autoN(st); });
    const di = document.querySelector('#bs-editors [data-p="days"]'); if (di) di.placeholder = monthEnd() + " (auto)";
    lastP = P;
  }
  const status = (b) => (b.wip ? "Opening WIP" : b.close ? "Closing WIP" : b.next ? "Next month" : "");
  let lastP = null;

  function csv() {
    const P = lastP || plan(), rows = [["Stage", "Item", "Charged", "Finishes", "Hours", "Note"]];
    P.rows.forEach((r) => {
      if (r.pre > 0) rows.push([r.st.name, "Before first batch", fmtDT(dateAt(r.preS)), fmtDT(dateAt(r.preE)), r.pre * 24, r.st.note || ""]);
      r.batches.forEach((b) => rows.push([r.st.name, label(b), fmtDT(dateAt(b.s)), fmtDT(dateAt(b.e)), Math.round((b.e - b.s) * 24 * 10) / 10, status(b)]));
    });
    const blob = new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "stage-schedule.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
  function load() {
    let o = null; try { o = JSON.parse(localStorage.getItem(KEY)); } catch (e) { o = null; }
    const d = DEFAULT();
    if (!o || typeof o !== "object" || !Array.isArray(o.stages)) return d;
    const r = Object.assign(d, o); r.stages = r.stages.filter((x) => x && typeof x === "object");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(r.start))) r.start = d.start;
    return r;
  }
  function setPath(path, v) {
    const p = path.split("."); let o = S;
    for (let i = 0; i < p.length - 1; i++) o = o[p[i]];
    const k = p[p.length - 1];
    o[k] = ["name", "note", "unit", "start", "link", "wip", "mode", "days"].indexOf(k) >= 0 ? v : num(v, 0);
  }

  function initSimple(mount) {
    S = load();
    mount.innerHTML = `<div id="bs-editors"></div><h3 class="bg-h">Schedule</h3><div id="bs-results"></div>`;
    const all = () => { $("bs-editors").innerHTML = editors(); results(); save(); };
    all();
    mount.addEventListener("input", (e) => { const p = e.target.getAttribute("data-p"); if (!p) return; if (p === "start" && !/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) return; setPath(p, e.target.value); save(); results(); });
    mount.addEventListener("change", (e) => { const p = e.target.getAttribute("data-p"); if (p === "unit" || p === "mode") all(); });
    mount.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const a = b.dataset.act, i = +b.dataset.i;
      if (a === "add") { const l = S.stages[S.stages.length - 1]; S.stages.push({ name: "Stage-" + String(S.stages.length + 1).padStart(2, "0"), bct: l ? l.bct : 48, ste: l ? l.ste : 96, pre: 24, note: "Cleaning", n: l ? l.n : 2, wip: "", out: 0, link: "first" }); }
      else if (a === "del") S.stages.splice(i, 1);
      else if (a === "up" && i > 0) { const t = S.stages[i - 1]; S.stages[i - 1] = S.stages[i]; S.stages[i] = t; }
      else if (a === "reset") S = DEFAULT();
      else if (a === "csv") { csv(); return; }
      else if (a === "print") { window.print(); return; }
      else return;
      all();
    });
  }

  function init() {
    const mount = $("calc-mount"); if (!mount) return;
    mount.innerHTML = `${typeof plateHeader === "function" ? plateHeader("PharmaChemE Batch Scheduler", "STAGE-WISE · BCT · STE · WIP") : ""}
      <div class="pill-group bs-tabs" role="tablist"><button type="button" class="pill active" role="tab" aria-selected="true" data-tab="simple">Stage-wise</button><button type="button" class="pill" role="tab" aria-selected="false" data-tab="adv">Detailed: named equipment and shifts</button></div>
      <p class="bg-small" id="bs-intro">One row per stage. Enter BCT (gap between batch starts) and STE (one batch, start to end) in hours. For a running product the batches and the WIP carried in and out of the month are worked out; for a new product or campaign, enter the batches, the hours before the first batch (cleaning, transfer, analysis, modification) and whether the stage starts after batch #01 or the last batch of the stage before. Everything stays in your browser.</p>
      <div id="bs-simple"></div><div id="bg-adv" hidden></div>`;
    initSimple($("bs-simple"));
    let advDone = false;
    mount.querySelector(".bs-tabs").addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]"); if (!b) return;
      const adv = b.dataset.tab === "adv";
      mount.querySelectorAll("[data-tab]").forEach((x) => { const on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-selected", on ? "true" : "false"); });
      $("bs-simple").hidden = adv; $("bg-adv").hidden = !adv;
      $("bs-intro").textContent = adv ? "Stages on named equipment with hours, parallel units, 8-hour shifts, cleaning, downtime and batches already in progress." : "One row per stage. Enter BCT (gap between batch starts) and STE (one batch, start to end) in hours. For a running product the batches and the WIP carried in and out of the month are worked out; for a new product or campaign, enter the batches, the hours before the first batch (cleaning, transfer, analysis, modification) and whether the stage starts after batch #01 or the last batch of the stage before. Everything stays in your browser.";
      if (adv && !advDone && window.PCEBatchGanttInit) { window.PCEBatchGanttInit("bg-adv"); advDone = true; }
    });
  }
  window.PCEBatchSimpleInit = init;
})();
