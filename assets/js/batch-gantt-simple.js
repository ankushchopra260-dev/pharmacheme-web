// ================================================================
// PharmaChemE Batch Scheduler, simple mode (days, stage-wise)
// One row per stage. Each stage: BCT (days between batch starts),
// STE (days one batch takes), days before the first batch (cleaning,
// transfer, analysis, modification) with a note, number of batches,
// output per batch, and whether it starts after the first or the last
// batch of the previous stage.
// ================================================================
(function () {
  "use strict";
  const KEY = "pce-batch-simple-v1";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v, d) => { const x = parseFloat(v); return isFinite(x) ? x : d; };
  const f = (v, d) => (isFinite(v) ? Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");
  const PAL = [["#B7DDEB", "#0B3A52"], ["#F8C59B", "#5A2A06"], ["#C9E7B5", "#1E4A10"], ["#E3CBF0", "#3E1D52"], ["#F6E39A", "#4D3D00"], ["#F3B7B7", "#561212"]];

  function tomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
  const DEFAULT = () => ({
    start: tomorrow(), days: 28, unit: "kg",
    stages: [
      { name: "Stage-01", bct: 2, ste: 4, pre: 2, note: "Cleaning", n: 2, out: 0, link: "first" },
      { name: "Stage-02", bct: 3, ste: 6, pre: 2, note: "Transfer of #01 from the other site + analysis + equipment cleaning", n: 2, out: 0, link: "first" },
      { name: "Stage-03", bct: 2, ste: 4, pre: 2, note: "Modification if any + cleaning", n: 2, out: 0, link: "last" },
      { name: "Stage-04", bct: 4, ste: 6, pre: 2, note: "Modification if any", n: 2, out: 250, link: "last" },
    ],
  });
  let S = null;

  function dateAt(dayOffset) { const d = new Date(S.start + "T00:00:00"); d.setTime(d.getTime() + dayOffset * 86400e3); return d; }
  const fmtD = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const fmtShort = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  /* a bar from day s to day e (exclusive) covers the dates s … e−1 when whole days are used */
  const lastDay = (e) => dateAt(Math.ceil(e - 1e-9) - 1);

  function plan() {
    const out = [], warn = [];
    S.stages.forEach((st, k) => {
      const bct = Math.max(0, num(st.bct, 0)), ste = Math.max(0, num(st.ste, 0)), pre = Math.max(0, num(st.pre, 0));
      const n = Math.min(200, Math.max(0, Math.round(num(st.n, 0))));
      let anchor = 0;
      const prev = out[k - 1];
      if (prev && prev.batches.length) anchor = st.link === "last" ? prev.batches[prev.batches.length - 1].e : prev.batches[0].e;
      const b = [];
      for (let i = 0; i < n; i++) {
        let s = anchor + pre + i * bct;
        /* material for batch i must have come out of batch i of the previous stage */
        if (prev && st.link !== "last" && prev.batches[i] && prev.batches[i].e > s + 1e-9) s = prev.batches[i].e;
        if (i > 0 && s < b[i - 1].s + bct) s = b[i - 1].s + bct;
        b.push({ i, s, e: s + ste });
      }
      if (prev && st.link !== "last" && prev.batches.length < n) warn.push(`${st.name || "Stage " + (k + 1)} has more batches than the stage before it.`);
      if (bct > 0 && ste > 0 && bct > ste) warn.push(`${st.name || "Stage " + (k + 1)}: BCT is longer than STE, so the equipment stands idle between batches.`);
      // lanes for overlapping batches
      const lanesEnd = [];
      b.forEach((x) => { let l = lanesEnd.findIndex((e) => e <= x.s + 1e-9); if (l < 0) { l = lanesEnd.length; lanesEnd.push(0); } x.lane = l; lanesEnd[l] = x.e; });
      out.push({ st, k, bct, ste, pre, preS: anchor, preE: anchor + pre, batches: b, lanes: Math.max(1, lanesEnd.length) });
    });
    return { rows: out, warn, end: Math.max(0, ...out.map((r) => Math.max(r.preE, ...r.batches.map((x) => x.e)))) };
  }

  function chart(P) {
    const days = Math.max(7, Math.ceil(P.end));
    const cw = 26, nameW = 130, numW = 38, top = 104, laneH = 22;
    const left = nameW + numW * 2;
    const rowsH = P.rows.map((r) => r.lanes * laneH + 8);
    const H = top + rowsH.reduce((a, b) => a + b, 0) + 2, W = left + days * cw + 2;
    let g = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Stage-wise batch schedule by day" font-family="sans-serif">`;
    g += `<rect x="0" y="0" width="${W}" height="${top}" fill="#E26A12"/>`;
    g += `<text x="8" y="${top - 10}" fill="#fff" font-size="12" font-weight="700">Stage</text>`;
    g += `<text transform="translate(${nameW + numW / 2 + 4},${top - 8}) rotate(-90)" fill="#fff" font-size="12" font-weight="700">BCT, days</text>`;
    g += `<text transform="translate(${nameW + numW * 1.5 + 4},${top - 8}) rotate(-90)" fill="#fff" font-size="12" font-weight="700">STE, days</text>`;
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
      g += `<text x="${nameW + numW / 2}" y="${y + h / 2 + 5}" fill="#111" font-size="13" text-anchor="middle">${f(r.bct, r.bct % 1 ? 1 : 0)}</text>`;
      g += `<text x="${nameW + numW * 1.5}" y="${y + h / 2 + 5}" fill="#111" font-size="13" text-anchor="middle">${f(r.ste, r.ste % 1 ? 1 : 0)}</text>`;
      if (r.pre > 0) {
        const x = left + r.preS * cw, w = r.pre * cw;
        g += `<rect x="${x}" y="${y + 3}" width="${w}" height="${h - 6}" fill="#D8D2C4"><title>${esc((r.st.note || "Before the first batch") + ": " + f(r.pre, r.pre % 1 ? 1 : 0) + " days, " + fmtD(dateAt(r.preS)) + " to " + fmtD(lastDay(r.preE)))}</title></rect>`;
        g += `<polygon points="${x + w - 7},${y + 3} ${x + w},${y + 3} ${x + w},${y + 10}" fill="#d11"/>`;
      }
      r.batches.forEach((b) => {
        const [bg, fg] = PAL[b.i % 2 === 0 ? 0 : 1];
        const x = left + b.s * cw, w = Math.max(2, (b.e - b.s) * cw), yy = y + 4 + b.lane * laneH, hh = laneH - 2;
        const lab = "#" + String(b.i + 1).padStart(2, "0");
        g += `<rect x="${x}" y="${yy}" width="${w}" height="${hh}" fill="${bg}" stroke="#7a7a7a" stroke-width=".6"><title>${esc((r.st.name || "") + " " + lab + ": " + fmtD(dateAt(b.s)) + " to " + fmtD(lastDay(b.e)) + " (" + f(b.e - b.s, 1) + " days)")}</title></rect>`;
        if (w > 26) g += `<text x="${x + w / 2}" y="${yy + hh / 2 + 5}" fill="${fg}" font-size="13" text-anchor="middle" pointer-events="none">${lab}</text>`;
      });
      y += h;
    });
    g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#555"/>`;
    return g + `</svg>`;
  }

  function editors() {
    const opt = (v, cur, t) => `<option value="${v}"${cur === v ? " selected" : ""}>${t}</option>`;
    const row = (s, i) => `<tr>
      <td><input type="text" data-p="stages.${i}.name" value="${esc(s.name)}" style="width:9em" aria-label="Stage name"></td>
      <td><input type="number" step="any" min="0" data-p="stages.${i}.bct" value="${esc(s.bct)}" aria-label="BCT, days"></td>
      <td><input type="number" step="any" min="0" data-p="stages.${i}.ste" value="${esc(s.ste)}" aria-label="STE, days"></td>
      <td><input type="number" step="1" min="0" data-p="stages.${i}.n" value="${esc(s.n)}" aria-label="Batches"></td>
      <td>${i === 0 ? `<span class="bg-small">plan start</span>` : `<select data-p="stages.${i}.link" aria-label="Starts after">${opt("first", s.link, "batch #01 of previous stage")}${opt("last", s.link, "last batch of previous stage")}</select>`}</td>
      <td><input type="number" step="any" min="0" data-p="stages.${i}.pre" value="${esc(s.pre)}" aria-label="Days before first batch"></td>
      <td><input type="text" data-p="stages.${i}.note" value="${esc(s.note)}" style="width:15em" aria-label="What happens in those days"></td>
      <td><input type="number" step="any" min="0" data-p="stages.${i}.out" value="${esc(s.out)}" aria-label="Output per batch"></td>
      <td class="bg-btns"><button type="button" data-act="up" data-i="${i}" aria-label="Move up">↑</button><button type="button" data-act="del" data-i="${i}" aria-label="Remove stage">×</button></td></tr>`;
    return `<div class="bg-grid" style="margin-bottom:10px">
        <label>First day <input type="date" data-p="start" value="${esc(S.start)}"></label>
        <label>Days in a month for output <input type="number" step="1" min="1" data-p="days" value="${esc(S.days)}"></label>
        <label>Output unit <input type="text" data-p="unit" value="${esc(S.unit)}" style="width:4em"></label>
      </div>
      <div class="bg-scroll"><table class="bg-tab"><thead><tr><th>Stage</th><th>BCT, days (gap between batch starts)</th><th>STE, days (one batch, start to end)</th><th>Batches</th><th>Starts after</th><th>Days before first batch</th><th>What happens in those days</th><th>Output per batch, ${esc(S.unit)}</th><th></th></tr></thead><tbody>${S.stages.map(row).join("")}</tbody></table></div>
      <div class="pill-group"><button type="button" class="pill" data-act="add">+ Add stage</button><button type="button" class="pill" data-act="reset">Load the example</button></div>`;
  }

  function results() {
    const P = plan();
    let h = "";
    if (!P.rows.length) { $("bs-results").innerHTML = `<div class="bg-note bg-bad">Add at least one stage.</div>`; return; }
    const last = P.rows[P.rows.length - 1], lastEnd = last.batches.length ? last.batches[last.batches.length - 1].e : last.preE;
    const outTot = last.batches.length * num(last.st.out, 0);
    const days = Math.max(1, num(S.days, 28));
    h += `<div class="bg-grid4" aria-live="polite">
      <div class="readout"><div class="label">Campaign</div><div class="val">${f(P.end, P.end % 1 ? 1 : 0)} days</div><div class="bg-unit">${esc(fmtD(dateAt(0)))} to ${esc(fmtD(lastDay(P.end)))}</div></div>
      <div class="readout"><div class="label">Last batch of ${esc(last.st.name || "last stage")} ends</div><div class="val">${esc(fmtShort(lastDay(lastEnd)))}</div><div class="bg-unit">${last.batches.length} batches</div></div>
      <div class="readout"><div class="label">Output of this campaign</div><div class="val">${f(outTot, 0)}</div><div class="bg-unit">${esc(S.unit)} from the last stage</div></div>
      <div class="readout"><div class="label">Last stage at its BCT</div><div class="val">${last.bct > 0 ? f(days / last.bct, 1) : "—"}</div><div class="bg-unit">batches in ${f(days, 0)} days${last.bct > 0 && num(last.st.out, 0) ? " · " + f((days / last.bct) * num(last.st.out, 0), 0) + " " + esc(S.unit) : ""}</div></div></div>`;
    P.warn.forEach((w) => (h += `<div class="bg-note">${esc(w)}</div>`));
    h += `<div class="bg-toolbar"><button type="button" class="pill" data-act="csv">Download CSV</button><button type="button" class="pill" data-act="print">Print</button><span class="bg-small" style="margin:0">Grey: days before the first batch (hover for the note). Batches overlap when BCT is shorter than STE and are drawn one under the other.</span></div>`;
    h += `<div class="bs-chart">${chart(P)}</div>`;
    h += `<h3 class="bg-h">Stage summary</h3><div class="bg-scroll"><table class="bg-tab bg-out"><thead><tr><th>Stage</th><th>Before first batch</th><th>Batch #01 starts</th><th>Last batch ends</th><th>Days on the stage</th><th>Output, ${esc(S.unit)}</th></tr></thead><tbody>
      ${P.rows.map((r) => { const b0 = r.batches[0], bl = r.batches[r.batches.length - 1]; return `<tr><td>${esc(r.st.name)}</td><td>${r.pre ? f(r.pre, r.pre % 1 ? 1 : 0) + " d · " + esc(r.st.note || "") : "—"}</td><td>${b0 ? esc(fmtD(dateAt(b0.s))) : "—"}</td><td>${bl ? esc(fmtD(lastDay(bl.e))) : "—"}</td><td>${bl ? f(bl.e - r.preS, 1) : "—"}</td><td>${f(r.batches.length * num(r.st.out, 0), 0)}</td></tr>`; }).join("")}</tbody></table></div>
      <h3 class="bg-h">Batch dates</h3><div class="bg-scroll"><table class="bg-tab bg-out"><thead><tr><th>Stage</th><th>Batch</th><th>Starts</th><th>Ends</th><th>Days</th></tr></thead><tbody>
      ${P.rows.map((r) => r.batches.map((b) => `<tr><td>${esc(r.st.name)}</td><td>#${String(b.i + 1).padStart(2, "0")}</td><td>${esc(fmtD(dateAt(b.s)))}</td><td>${esc(fmtD(lastDay(b.e)))}</td><td>${f(b.e - b.s, 1)}</td></tr>`).join("")).join("")}</tbody></table></div>`;
    $("bs-results").innerHTML = h;
    lastP = P;
  }
  let lastP = null;

  function csv() {
    const P = lastP || plan(), rows = [["Stage", "Item", "Start", "End (last day)", "Days", "Note"]];
    P.rows.forEach((r) => {
      if (r.pre > 0) rows.push([r.st.name, "Before first batch", fmtD(dateAt(r.preS)), fmtD(lastDay(r.preE)), r.pre, r.st.note || ""]);
      r.batches.forEach((b) => rows.push([r.st.name, "#" + String(b.i + 1).padStart(2, "0"), fmtD(dateAt(b.s)), fmtD(lastDay(b.e)), b.e - b.s, ""]));
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
    o[k] = ["name", "note", "unit", "start", "link"].indexOf(k) >= 0 ? v : num(v, 0);
  }

  function initSimple(mount) {
    S = load();
    mount.innerHTML = `<div id="bs-editors"></div><h3 class="bg-h">Schedule</h3><div id="bs-results"></div>`;
    const all = () => { $("bs-editors").innerHTML = editors(); results(); save(); };
    all();
    mount.addEventListener("input", (e) => { const p = e.target.getAttribute("data-p"); if (!p) return; if (p === "start" && !/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) return; setPath(p, e.target.value); save(); results(); });
    mount.addEventListener("change", (e) => { const p = e.target.getAttribute("data-p"); if (p === "unit") all(); });
    mount.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const a = b.dataset.act, i = +b.dataset.i;
      if (a === "add") { const l = S.stages[S.stages.length - 1]; S.stages.push({ name: "Stage-" + String(S.stages.length + 1).padStart(2, "0"), bct: l ? l.bct : 2, ste: l ? l.ste : 4, pre: 1, note: "Cleaning", n: l ? l.n : 2, out: 0, link: "first" }); }
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
    mount.innerHTML = `${typeof plateHeader === "function" ? plateHeader("PharmaChemE Batch Scheduler", "STAGE-WISE · BCT · STE · DAYS") : ""}
      <div class="pill-group bs-tabs" role="tablist"><button type="button" class="pill active" role="tab" aria-selected="true" data-tab="simple">Stage-wise, in days</button><button type="button" class="pill" role="tab" aria-selected="false" data-tab="adv">Detailed: equipment and hours</button></div>
      <p class="bg-small" id="bs-intro">One row per stage. Enter BCT, STE and the number of batches, the days before the first batch (cleaning, transfer, analysis, modification) and whether the stage starts after batch #01 or the last batch of the stage before. Everything stays in your browser.</p>
      <div id="bs-simple"></div><div id="bg-adv" hidden></div>`;
    initSimple($("bs-simple"));
    let advDone = false;
    mount.querySelector(".bs-tabs").addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]"); if (!b) return;
      const adv = b.dataset.tab === "adv";
      mount.querySelectorAll("[data-tab]").forEach((x) => { const on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-selected", on ? "true" : "false"); });
      $("bs-simple").hidden = adv; $("bg-adv").hidden = !adv;
      $("bs-intro").textContent = adv ? "Stages on named equipment with hours, parallel units, 8-hour shifts, cleaning, downtime and batches already in progress." : "One row per stage. Enter BCT, STE and the number of batches, the days before the first batch (cleaning, transfer, analysis, modification) and whether the stage starts after batch #01 or the last batch of the stage before. Everything stays in your browser.";
      if (adv && !advDone && window.PCEBatchGanttInit) { window.PCEBatchGanttInit("bg-adv"); advDone = true; }
    });
  }
  window.PCEBatchSimpleInit = init;
})();
