// ================================================================
// PharmaChemE Batch Schedule (Gantt) planner
// Stages on equipment (parallel units allowed), in-process tests inside
// the stage time, final product analysis after unloading, cleaning,
// shift working, equipment downtime, WIP batches.
// Reports BCT (gap between batch starts), STE (start-to-end time per
// batch), output, bottleneck and utilisation.
// ================================================================
(function () {
  "use strict";
  const KEY = "pce-batch-gantt-v2";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const f = (v, d) => (isFinite(v) ? Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");
  const num = (v, def) => { const x = parseFloat(v); return isFinite(x) ? x : def; };
  const COLORS = ["#C9A227", "#4E9AD6", "#6FCB9F", "#E07A6A", "#B48EDB", "#E3A15C", "#5FC3C1", "#D47FB0", "#9FB34A", "#7F8FE0"];

  function todayAt8() { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(6, 0, 0, 0); return toLocalInput(d); }
  function toLocalInput(d) { const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; }
  function addH(startStr, h) { const d = new Date(startStr); return new Date(d.getTime() + h * 3600e3); }
  function fmtDT(d) { return d.toLocaleString("en-GB", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).replace(",", ""); }
  function hoursBetween(a, b) { return (new Date(b).getTime() - new Date(a).getTime()) / 3600e3; }

  const DEFAULT = () => ({
    start: todayAt8(), n: 10, out: 250, unit: "kg", prefix: "B-", first: 103, gap: 0, view: "eq", zoom: 6,
    qc: 24, shiftLen: 8, shifts: 3, shiftStart: "06:00", days: 28,
    stages: [
      { name: "Reaction (with in-process test)", eq: "Reactor A", t: 16, hold: true, cl: 0 },
      { name: "Work-up and crystallisation", eq: "Reactor B", t: 10, hold: true, cl: 0 },
      { name: "Centrifuging", eq: "Centrifuge", t: 6, hold: false, cl: 0.5 },
      { name: "Drying (with LOD check)", eq: "Dryer A, Dryer B", t: 20, hold: true, cl: 0.5 },
      { name: "Milling and packing", eq: "Mill and pack", t: 4, hold: false, cl: 1 },
    ],
    down: [{ eq: "Reactor A", at: null, atOffset: 48, h: 24, note: "Modification" }],
    wip: [{ name: "B-101", stage: 3, done: 6 }, { name: "B-102", stage: 1, done: 4 }],
  });
  let S = null;

  // ---------------------------------------------------------------
  // Scheduling
  // ---------------------------------------------------------------
  const units = (eq) => String(eq || "").split(",").map((x) => x.trim()).filter(Boolean);
  function allUnits() { const seen = []; S.stages.forEach((s) => units(s.eq).forEach((u) => { if (seen.indexOf(u) < 0) seen.push(u); })); return seen; }

  /* working shifts: stages may start only inside a working shift; a running stage carries on */
  function shiftWindow() {
    const len = Math.max(1, num(S.shiftLen, 8)), n = Math.max(1, Math.round(num(S.shifts, 3))), workH = len * n;
    if (workH >= 24) return { cont: true, next: (t) => t };
    const t0 = new Date(S.start), hm = String(S.shiftStart || "06:00").split(":"), sh = (+hm[0] || 0) + (+hm[1] || 0) / 60;
    const off = ((sh - (t0.getHours() + t0.getMinutes() / 60)) % 24 + 24) % 24; // hours from plan start to the first shift start
    return { cont: false, len, n, off, workH, next: (t) => { const d = (((t - off) % 24) + 24) % 24; return d < workH - 1e-9 ? t : t + (24 - d); } };
  }

  function schedule() {
    const U = allUnits(), avail = {}, down = {}, segs = [], batches = [], warn = [];
    U.forEach((u) => { avail[u] = 0; down[u] = []; });
    S.down.forEach((d, i) => {
      const at = d.at ? hoursBetween(S.start, d.at) : num(d.atOffset, 0);
      const h = Math.max(0, num(d.h, 0));
      if (!down[d.eq]) { if (d.eq) warn.push(`Downtime ${i + 1}: “${d.eq}” is not used by any stage.`); return; }
      if (h > 0) { down[d.eq].push({ s: at, e: at + h, note: d.note || "Unavailable" }); segs.push({ u: d.eq, s: at, e: at + h, type: "down", label: d.note || "Unavailable" }); }
    });
    const clash = (u, s, occ) => down[u].find((w) => s < w.e && s + occ > w.s);
    const work = shiftWindow();
    function place(list, earliest, occ, holder, holderReady) {
      let best = null;
      list.forEach((u) => {
        if (!(u in avail)) return;
        let s = u === holder ? Math.max(earliest, holderReady) : Math.max(earliest, avail[u]);
        let w, guard = 0;
        for (;;) { s = work.next(s); w = clash(u, s, occ); if (!w || guard++ > 200) break; s = w.e; }
        if (!best || s < best.s - 1e-9) best = { u, s };
      });
      return best;
    }
    const nS = S.stages.length;
    const jobs = [];
    S.wip.forEach((w) => { const st = Math.min(Math.max(0, Math.round(num(w.stage, 0))), nS - 1); jobs.push({ name: w.name || "WIP", wip: true, from: st, done: Math.max(0, num(w.done, 0)) }); });
    for (let i = 0; i < Math.max(0, Math.round(num(S.n, 0))); i++) jobs.push({ name: `${S.prefix}${num(S.first, 1) + i}`, wip: false, from: 0, done: 0 });

    let lastNewStart = null;
    jobs.forEach((J, ji) => {
      const color = COLORS[ji % COLORS.length];
      let ready = 0, prev = null, startT = null;
      if (!J.wip && S.gap > 0 && lastNewStart !== null) ready = lastNewStart + S.gap;
      for (let k = J.from; k < nS; k++) {
        const st = S.stages[k], list = units(st.eq);
        if (!list.length) { warn.push(`Stage ${k + 1} has no equipment.`); return; }
        let t = Math.max(0, num(st.t, 0));
        if (J.wip && k === J.from) t = Math.max(0, t - J.done);
        const an = 0, cl = Math.max(0, num(st.cl, 0));
        const occ = t + (st.hold ? an : 0);
        const p = place(list, ready, occ, prev && prev.hold ? prev.u : null, ready);
        if (!p) { warn.push(`No usable equipment for stage ${k + 1}.`); return; }
        // the previous stage's equipment is released when this stage starts (material held) or at its own end
        if (prev) {
          if (prev.hold && p.s > prev.occEnd + 1e-9) {
            segs.push({ u: prev.u, s: prev.occEnd, e: p.s, type: "wait", job: J, color, stage: k - 1 });
            if (clash(prev.u, prev.occEnd, p.s - prev.occEnd)) warn.push(`${J.name}: material is still in ${prev.u} during its planned downtime. Move the downtime or add a holding vessel.`);
          }
          const rel = prev.hold ? Math.max(prev.occEnd, p.s) : prev.occEnd;
          if (prev.u !== p.u) { avail[prev.u] = Math.max(avail[prev.u], rel + prev.cl); if (prev.cl > 0) segs.push({ u: prev.u, s: rel, e: rel + prev.cl, type: "clean", job: J }); }
        }
        if (startT === null) { startT = p.s; if (!J.wip) lastNewStart = p.s; }
        segs.push({ u: p.u, s: p.s, e: p.s + t, type: "work", job: J, color, stage: k, label: st.name });
        avail[p.u] = p.s + occ; // provisional; finalised when the next stage starts
        prev = { u: p.u, s: p.s, occEnd: p.s + occ, hold: st.hold, cl, stage: k };
        ready = p.s + t + an;
      }
      if (prev) { avail[prev.u] = Math.max(avail[prev.u], prev.occEnd + prev.cl); if (prev.cl > 0) segs.push({ u: prev.u, s: prev.occEnd, e: prev.occEnd + prev.cl, type: "clean", job: J }); }
      const unloaded = ready, qc = Math.max(0, num(S.qc, 0));
      if (qc > 0) segs.push({ u: null, s: unloaded, e: unloaded + qc, type: "qc", job: J, color, label: "Final product analysis" });
      batches.push({ job: J, color, start: startT, unloaded, end: unloaded + qc, ste: unloaded + qc - startT });
    });

    // theoretical BCT: occupancy per batch on each unit, shared over parallel units
    const load = {};
    U.forEach((u) => (load[u] = 0));
    S.stages.forEach((st) => { const l = units(st.eq); l.forEach((u) => { load[u] += (num(st.t, 0) + num(st.cl, 0)) / l.length; }); });
    let bn = null; U.forEach((u) => { if (!bn || load[u] > load[bn]) bn = u; });
    const end = Math.max(0, ...segs.map((x) => x.e));
    const busy = {}; U.forEach((u) => (busy[u] = 0));
    segs.forEach((x) => { if (x.u && x.type !== "down") busy[x.u] += x.e - x.s; });
    const newB = batches.filter((b) => !b.job.wip);
    const actBCT = newB.length > 1 ? (newB[newB.length - 1].start - newB[0].start) / (newB.length - 1) : NaN;
    return { segs, batches, U, load, bn, bct0: load[bn], actBCT, end, busy, warn };
  }

  // ---------------------------------------------------------------
  // Gantt SVG
  // ---------------------------------------------------------------
  function gantt(R) {
    const byEq = S.view !== "batch";
    const rows = byEq ? R.U.slice() : R.batches.map((b) => b.job.name);
    const pxH = Math.max(1, num(S.zoom, 6)), left = 128, top = 34, rowH = 30;
    const horizon = Math.max(24, Math.ceil(R.end / 24) * 24);
    const W = left + horizon * pxH + 20, H = top + rows.length * rowH + 16;
    const t0 = new Date(S.start);
    let g = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gantt chart of the batch schedule">
      <defs><pattern id="bg-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#E07A6A" stroke-width="2"/></pattern>
      <pattern id="bg-clean" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#8a9bb0" stroke-width="1.5"/></pattern></defs>`;
    // grid: a line at every midnight with the date, lighter lines every 6 h
    const off = (24 - (t0.getHours() + t0.getMinutes() / 60)) % 24;
    for (let h = off - 24; h <= horizon; h += 6) {
      if (h < 0) continue;
      const x = left + h * pxH, abs = new Date(t0.getTime() + h * 3600e3), midnight = Math.abs((h - off) % 24) < 1e-6;
      if (midnight) {
        g += `<line x1="${x}" y1="${top - 6}" x2="${x}" y2="${H - 10}" stroke="#2C4C6C" stroke-width="1"/>`;
        if (x + 60 < W) g += `<text x="${x + 3}" y="${top - 12}" fill="#9fb0c3" font-size="11" font-family="sans-serif">${esc(abs.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }))}</text>`;
      } else if (pxH >= 4) g += `<line x1="${x}" y1="${top}" x2="${x}" y2="${H - 10}" stroke="#1d3349" stroke-width="1"/>`;
    }
    // shifts: boundaries with letters, non-working hours shaded
    const Wk = shiftWindow(), len = Math.max(1, num(S.shiftLen, 8)), hm = String(S.shiftStart || "06:00").split(":"), sh = (+hm[0] || 0) + (+hm[1] || 0) / 60;
    const off0 = ((sh - (t0.getHours() + t0.getMinutes() / 60)) % 24 + 24) % 24, perDay = Math.max(1, Math.round(24 / len));
    for (let d = -1; d * 24 + off0 <= horizon; d++) {
      const base = d * 24 + off0;
      for (let k = 0; k < perDay; k++) {
        const a = base + k * len, b2 = a + len; if (b2 <= 0 || a >= horizon) continue;
        const xa = left + Math.max(0, a) * pxH, xb = left + Math.min(horizon, b2) * pxH;
        const working = Wk.cont || k < Wk.n;
        if (!working) g += `<rect x="${xa}" y="${top}" width="${xb - xa}" height="${H - 10 - top}" fill="rgba(0,0,0,.35)"/>`;
        if (a >= 0) g += `<line x1="${left + a * pxH}" y1="${top}" x2="${left + a * pxH}" y2="${H - 10}" stroke="#1d3349" stroke-width="1"/>`;
        if (len * pxH >= 16 && a >= 0) g += `<text x="${left + a * pxH + 3}" y="${top - 1}" fill="${working ? "#6f8299" : "#4a5a6c"}" font-size="9" font-family="sans-serif">${"ABCDEF"[k] || ""}</text>`;
      }
    }
    g += `<line x1="${left}" y1="${top - 6}" x2="${left}" y2="${H - 10}" stroke="#C9A227" stroke-width="1.5"/><text x="${left - 4}" y="${top - 12}" fill="#C9A227" font-size="10" text-anchor="end" font-family="sans-serif">${esc(t0.toTimeString().slice(0, 5))}</text>`;
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      g += `<rect x="0" y="${y}" width="${W}" height="${rowH}" fill="${i % 2 ? "rgba(255,255,255,.02)" : "transparent"}"/>`;
      g += `<text x="6" y="${y + rowH / 2 + 4}" fill="#e8e2d0" font-size="12" font-family="sans-serif">${esc(r.length > 17 ? r.slice(0, 16) + "…" : r)}<title>${esc(r)}</title></text>`;
    });
    const rowOf = (seg) => (byEq ? rows.indexOf(seg.u) : seg.job ? rows.indexOf(seg.job.name) : -1);
    const segsDraw = byEq ? R.segs.filter((s) => s.u) : R.segs.filter((s) => s.job && s.type !== "clean");
    segsDraw.forEach((s) => {
      const i = rowOf(s); if (i < 0) return;
      const x = left + s.s * pxH, w = Math.max(1, (s.e - s.s) * pxH), y = top + i * rowH + 4, h = rowH - 8;
      const tip = `${s.job ? s.job.name + " · " : ""}${s.type === "down" ? s.label : s.type === "clean" ? "Cleaning" : s.type === "wait" ? "Waiting for the next stage" : s.type === "qc" ? "Final product analysis (equipment free)" : esc(s.label)}${byEq ? "" : " · " + (s.u || "")}\n${fmtDT(addH(S.start, s.s))} → ${fmtDT(addH(S.start, s.e))} (${f(s.e - s.s, 1)} h)`;
      let fill = s.color, extra = "", op = 1;
      if (s.type === "down") { fill = "url(#bg-hatch)"; extra = ` stroke="#E07A6A"`; }
      else if (s.type === "clean") { fill = "url(#bg-clean)"; }
      else if (s.type === "qc") { op = 0.45; }
      else if (s.type === "wait") { fill = "none"; extra = ` stroke="${s.color}" stroke-dasharray="4 3"`; }
      if (s.job && s.job.wip && s.type === "work") extra += ` stroke="#fff" stroke-width="1.5"`;
      g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}" fill-opacity="${op}"${extra}><title>${esc(tip)}</title></rect>`;
      if (s.type === "work" && w > 24) {
        let t = byEq ? s.job.name : String(s.u || ""); const max = Math.floor((w - 6) / 6.3);
        if (t.length > max) t = max >= 3 ? t.slice(0, max - 1) + "…" : "";
        if (t) g += `<text x="${x + 4}" y="${y + h / 2 + 4}" fill="#0B1622" font-size="10.5" font-weight="700" font-family="sans-serif" pointer-events="none">${esc(t)}</text>`;
      }
    });
    return g + `</svg>`;
  }

  // ---------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------
  function inp(path, val, opts) {
    const o = opts || {};
    return `<input ${o.type === "text" ? 'type="text"' : o.type === "dt" ? 'type="datetime-local"' : 'type="number" step="any" inputmode="decimal"'} data-p="${path}" value="${esc(val == null ? "" : val)}"${o.w ? ` style="width:${o.w}"` : ""}${o.aria ? ` aria-label="${esc(o.aria)}"` : ""}>`;
  }
  function editors() {
    const st = S.stages.map((s, i) => `<tr><td>${i + 1}</td><td>${inp(`stages.${i}.name`, s.name, { type: "text", w: "12em", aria: "Stage name" })}</td><td>${inp(`stages.${i}.eq`, s.eq, { type: "text", w: "11em", aria: "Equipment" })}</td><td>${inp(`stages.${i}.t`, s.t, { aria: "Stage time including in-process tests, h" })}</td><td><label class="bg-chk"><input type="checkbox" data-p="stages.${i}.hold"${s.hold ? " checked" : ""}> waits in it</label></td><td>${inp(`stages.${i}.cl`, s.cl, { aria: "Cleaning after each batch, h" })}</td><td class="bg-btns"><button type="button" data-act="up" data-i="${i}" aria-label="Move up">↑</button><button type="button" data-act="del-stage" data-i="${i}" aria-label="Remove stage">×</button></td></tr>`).join("");
    const eqOpts = (sel) => allUnits().map((u) => `<option${u === sel ? " selected" : ""}>${esc(u)}</option>`).join("");
    const dn = S.down.map((d, i) => `<tr><td><select data-p="down.${i}.eq" aria-label="Equipment">${eqOpts(d.eq)}</select></td><td>${inp(`down.${i}.at`, d.at || toLocalInput(addH(S.start, num(d.atOffset, 0))), { type: "dt", aria: "From" })}</td><td>${inp(`down.${i}.h`, d.h, { aria: "Hours" })}</td><td>${inp(`down.${i}.note`, d.note, { type: "text", w: "11em", aria: "Reason" })}</td><td class="bg-btns"><button type="button" data-act="del-down" data-i="${i}" aria-label="Remove">×</button></td></tr>`).join("");
    const stOpts = (sel) => S.stages.map((s, k) => `<option value="${k}"${k === +sel ? " selected" : ""}>${k + 1}. ${esc(s.name)}</option>`).join("");
    const wp = S.wip.map((w, i) => `<tr><td>${inp(`wip.${i}.name`, w.name, { type: "text", w: "8em", aria: "Batch" })}</td><td><select data-p="wip.${i}.stage" aria-label="Current stage">${stOpts(w.stage)}</select></td><td>${inp(`wip.${i}.done`, w.done, { aria: "Hours done in this stage" })}</td><td class="bg-btns"><button type="button" data-act="del-wip" data-i="${i}" aria-label="Remove">×</button></td></tr>`).join("");
    return `
      <div class="bg-sec"><h3>1. Plan</h3><div class="bg-grid">
        <label>Plan starts ${inp("start", S.start, { type: "dt" })}</label>
        <label>New batches to schedule ${inp("n", S.n)}</label>
        <label>Output per batch ${inp("out", S.out)} ${inp("unit", S.unit, { type: "text", w: "4em", aria: "Output unit" })}</label>
        <label>Batch numbers ${inp("prefix", S.prefix, { type: "text", w: "4em", aria: "Prefix" })} from ${inp("first", S.first, { aria: "First number" })}</label>
        <label>Minimum gap between new batch starts ${inp("gap", S.gap)} h <small>(0 = start as soon as the first stage is free)</small></label>
        <label>Final product analysis after unloading ${inp("qc", S.qc)} h <small>(QC release; adds to STE, not to BCT)</small></label>
      </div><div class="bg-grid" style="margin-top:10px">
        <label>Shift length ${inp("shiftLen", S.shiftLen)} h</label>
        <label>Shifts worked per day <select data-p="shifts">${[1, 2, 3].map((k) => `<option value="${k}"${+S.shifts === k ? " selected" : ""}>${k}</option>`).join("")}</select></label>
        <label>First shift starts at <input type="time" data-p="shiftStart" value="${esc(S.shiftStart || "06:00")}"></label>
        <label>Days in a month for output ${inp("days", S.days)}</label>
      </div></div>
      <div class="bg-sec"><h3>2. Stages in order</h3>
        <p class="bg-small">Stage time is the full occupancy of the equipment for one batch, <b>including in-process tests</b> (an IPC sample, an LOD check), so it adds to the BCT. Separate parallel equipment with commas, e.g. <b>Dryer A, Dryer B</b>: each batch takes whichever is free first. Tick <b>waits in it</b> when the material cannot leave until the next stage is free (a reaction mass in a reactor); untick it when the material is unloaded into drums or a holding tank and the equipment is freed.</p>
        <div class="bg-scroll"><table class="bg-tab"><thead><tr><th>#</th><th>Stage</th><th>Equipment</th><th>Stage time incl. in-process tests, h</th><th>If next stage is busy, material</th><th>Cleaning after each batch, h</th><th></th></tr></thead><tbody>${st}</tbody></table></div>
        <button type="button" class="pill" data-act="add-stage">+ Add stage</button></div>
      <div class="bg-sec"><h3>3. Equipment downtime (modification, maintenance)</h3>
        <div class="bg-scroll"><table class="bg-tab"><thead><tr><th>Equipment</th><th>From</th><th>Hours</th><th>Reason</th><th></th></tr></thead><tbody>${dn || `<tr><td colspan="5" class="bg-small">None planned.</td></tr>`}</tbody></table></div>
        <button type="button" class="pill" data-act="add-down">+ Add downtime</button></div>
      <div class="bg-sec"><h3>4. Batches already in progress (WIP)</h3>
        <div class="bg-scroll"><table class="bg-tab"><thead><tr><th>Batch</th><th>Now in stage</th><th>Hours already done in it</th><th></th></tr></thead><tbody>${wp || `<tr><td colspan="4" class="bg-small">No batches in progress.</td></tr>`}</tbody></table></div>
        <button type="button" class="pill" data-act="add-wip">+ Add WIP batch</button></div>`;
  }

  function results() {
    const R = schedule(), out = num(S.out, 0), unit = esc(S.unit || ""), days = Math.max(1, num(S.days, 28)), W = shiftWindow();
    const allB = R.batches, newB = allB.filter((b) => !b.job.wip);
    const total = allB.length * out, lastEnd = allB.length ? Math.max(...allB.map((b) => b.end)) : 0;
    const steAvg = newB.length ? newB.reduce((a, b) => a + b.ste, 0) / newB.length : NaN;
    const bct = isFinite(R.actBCT) ? R.actBCT : R.bct0;
    const util = R.U.map((u) => ({ u, p: R.end > 0 ? (100 * R.busy[u]) / R.end : 0, l: R.load[u] }));
    let h = `<div class="bg-grid4">
      <div class="readout"><div class="label">BCT, gap between batch starts</div><div class="val">${f(bct, 1)} h</div><div class="bg-unit">Bottleneck allows ${f(R.bct0, 1)} h (${esc(R.bn || "—")})</div></div>
      <div class="readout"><div class="label">STE, start to end per batch</div><div class="val">${f(steAvg, 1)} h</div><div class="bg-unit">Average of new batches, including waits and ${f(num(S.qc, 0), 0)} h final analysis</div></div>
      <div class="readout"><div class="label">Output at this pace</div><div class="val">${f(((24 * days) / bct) * out, 0)}</div><div class="bg-unit">${unit} in ${f(days, 0)} days · ${f((24 * days) / bct, 1)} batches</div></div>
      <div class="readout"><div class="label">This plan</div><div class="val">${f(total, 0)}</div><div class="bg-unit">${unit} from ${allB.length} batches · last released ${allB.length ? esc(fmtDT(addH(S.start, lastEnd))) : "—"}</div></div>
    </div>`;
    if (!W.cont) h += `<div class="bg-note">Working ${W.n} shift${W.n > 1 ? "s" : ""} of ${f(W.len, 0)} h a day: a stage starts only inside a shift and, once started, runs to the end. Hours outside the shifts are shaded in the chart.</div>`;
    if (R.warn.length) h += R.warn.filter((v, i, a) => a.indexOf(v) === i).map((w) => `<div class="bg-note bg-bad">${esc(w)}</div>`).join("");
    if (isFinite(R.actBCT) && R.actBCT > R.bct0 * 1.1) h += `<div class="bg-note">The batches start every ${f(R.actBCT, 1)} h on average, slower than the ${f(R.bct0, 1)} h the bottleneck alone would allow. Waits for the next stage (dashed bars), downtime or a held stage are adding time; look for dashed bars in the chart.</div>`;
    h += `<div class="bg-toolbar"><div class="pill-group"><button type="button" class="pill${S.view !== "batch" ? " active" : ""}" data-view="eq">By equipment</button><button type="button" class="pill${S.view === "batch" ? " active" : ""}" data-view="batch">By batch</button></div>
      <label>Zoom <input type="range" min="2" max="20" step="1" data-p="zoom" value="${S.zoom}"></label>
      <button type="button" class="pill" data-act="csv">Download CSV</button><button type="button" class="pill" data-act="print">Print</button></div>
      <div class="bg-legend"><span><i style="background:#C9A227"></i>Stage</span><span><i style="background:#C9A227;opacity:.45"></i>Final analysis (by batch view)</span><span><i class="dash"></i>Waiting for next stage</span><span><i class="clean"></i>Cleaning</span><span><i class="down"></i>Downtime</span><span><i class="wip"></i>WIP batch</span></div>
      <div class="bg-chart">${gantt(R)}</div>`;
    h += `<h3 class="bg-h">Batches</h3><div class="bg-scroll"><table class="bg-tab bg-out"><thead><tr><th>Batch</th><th>Starts</th><th>Unloaded</th><th>Released after analysis</th><th>STE, h</th><th>Gap from previous start, h</th><th>Output, ${unit}</th><th>Cumulative, ${unit}</th></tr></thead><tbody>
      ${allB.map((b, i) => { const prevNew = !b.job.wip ? newB[newB.indexOf(b) - 1] : null; return `<tr><td><i class="bg-dot" style="background:${b.color}"></i>${esc(b.job.name)}${b.job.wip ? " <small>(WIP)</small>" : ""}</td><td>${esc(fmtDT(addH(S.start, b.start)))}</td><td>${esc(fmtDT(addH(S.start, b.unloaded)))}</td><td>${esc(fmtDT(addH(S.start, b.end)))}</td><td>${b.job.wip ? f(b.ste, 1) + " <small>(remaining)</small>" : f(b.ste, 1)}</td><td>${prevNew ? f(b.start - prevNew.start, 1) : "—"}</td><td>${f(out, 0)}</td><td>${f(out * (i + 1), 0)}</td></tr>`; }).join("")}</tbody></table></div>`;
    h += `<h3 class="bg-h">Equipment</h3><div class="bg-scroll"><table class="bg-tab bg-out"><thead><tr><th>Equipment</th><th>Hours per batch (shared over parallel units)</th><th>Busy in this plan</th><th></th></tr></thead><tbody>
      ${util.map((x) => `<tr><td>${esc(x.u)}${x.u === R.bn ? " <b>· bottleneck</b>" : ""}</td><td>${f(x.l, 1)}</td><td>${f(x.p, 0)} %</td><td><div class="bg-bar"><i style="width:${Math.min(100, x.p)}%"></i></div></td></tr>`).join("")}</tbody></table></div>
      <p class="bg-small">Busy time counts stage time (with in-process tests), waiting for the next stage and cleaning, over the whole plan horizon (so it is low at the start and end of a plan). Hours per batch on the bottleneck set the shortest possible BCT.</p>`;
    $("bg-results").innerHTML = h;
    lastR = R;
  }
  let lastR = null;

  function csv() {
    const R = lastR || schedule(), rows = [["Batch", "WIP", "Stage", "Equipment", "Activity", "Start", "End", "Hours"]];
    const lab = { work: "Stage", qc: "Final product analysis", wait: "Waiting for next stage", clean: "Cleaning", down: "Downtime" };
    R.segs.slice().sort((a, b) => a.s - b.s).forEach((s) => rows.push([s.job ? s.job.name : "", s.job && s.job.wip ? "yes" : "", s.stage !== undefined ? S.stages[s.stage].name : s.label || "", s.u || "", lab[s.type] || s.type, toLocalInput(addH(S.start, s.s)).replace("T", " "), toLocalInput(addH(S.start, s.e)).replace("T", " "), (s.e - s.s).toFixed(2)]));
    const blob = new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "batch-schedule.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function setPath(path, v) {
    const p = path.split("."); let o = S;
    for (let i = 0; i < p.length - 1; i++) o = o[p[i]];
    const k = p[p.length - 1];
    if (typeof o[k] === "boolean") o[k] = !!v;
    else if (["name", "eq", "note", "unit", "prefix", "start", "at", "shiftStart"].indexOf(k) >= 0) o[k] = v;
    else o[k] = num(v, 0);
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
  function renderAll() { $("bg-editors").innerHTML = editors(); results(); save(); }

  function init() {
    const mount = $("calc-mount"); if (!mount) return;
    try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
    if (!S || !Array.isArray(S.stages)) S = DEFAULT();
    mount.innerHTML = `${typeof plateHeader === "function" ? plateHeader("PharmaChemE Batch Scheduler", "GANTT · BCT · STE · WIP") : ""}
      <p class="bg-small" style="margin-top:0">Set the stages and equipment, add any downtime and the batches already running, and the schedule, Gantt chart and output update as you type. Everything stays in your browser.</p>
      <div class="pill-group" style="margin-bottom:12px"><button type="button" class="pill" data-act="reset">Load the example</button><button type="button" class="pill" data-act="clear">Start blank</button></div>
      <div id="bg-editors"></div><h3 class="bg-h">Schedule</h3><div id="bg-results" aria-live="polite"></div>`;
    renderAll();
    mount.addEventListener("input", (e) => {
      const p = e.target.getAttribute("data-p"); if (!p) return;
      setPath(p, e.target.type === "checkbox" ? e.target.checked : e.target.value);
      if (/^stages\.\d+\.(name|eq)$/.test(p) || p === "start") { save(); results(); return; }
      save(); results();
    });
    mount.addEventListener("change", (e) => { const p = e.target.getAttribute("data-p"); if (p && (/\.(eq|name)$/.test(p) || /^wip|^down/.test(p) || p === "start" || p === "shifts")) renderAll(); });
    mount.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const act = b.dataset.act, i = +b.dataset.i;
      if (b.dataset.view) { S.view = b.dataset.view; save(); results(); return; }
      if (act === "add-stage") S.stages.push({ name: "New stage", eq: "Equipment", t: 4, hold: false, cl: 0 });
      else if (act === "del-stage") { S.stages.splice(i, 1); S.wip.forEach((w) => { if (w.stage >= S.stages.length) w.stage = Math.max(0, S.stages.length - 1); }); }
      else if (act === "up" && i > 0) { const t = S.stages[i - 1]; S.stages[i - 1] = S.stages[i]; S.stages[i] = t; }
      else if (act === "add-down") S.down.push({ eq: allUnits()[0] || "", at: toLocalInput(addH(S.start, 24)), h: 8, note: "Preventive maintenance" });
      else if (act === "del-down") S.down.splice(i, 1);
      else if (act === "add-wip") S.wip.push({ name: "WIP-" + (S.wip.length + 1), stage: 0, done: 0 });
      else if (act === "del-wip") S.wip.splice(i, 1);
      else if (act === "reset") S = DEFAULT();
      else if (act === "clear") S = { start: todayAt8(), n: 5, out: 100, unit: "kg", prefix: "B-", first: 1, gap: 0, view: "eq", zoom: 6, qc: 24, shiftLen: 8, shifts: 3, shiftStart: "06:00", days: 28, stages: [{ name: "Stage 1", eq: "Reactor", t: 8, hold: true, cl: 0 }], down: [], wip: [] };
      else if (act === "csv") { csv(); return; }
      else if (act === "print") { window.print(); return; }
      else return;
      renderAll();
    });
  }
  window.PCEBatchGanttInit = init;
  window.PCEBatchGanttTest = { schedule: (st) => { S = st; return schedule(); }, DEFAULT };
})();
