// ================================================================
// PharmaChemE — Materials & Corrosion Compatibility (v2)
// Ratings: the existing CHEM_COMPAT / MATERIALS data in calculators.js
// (unchanged). This file adds: process-stream check (worst case per
// material), temperature limits, sourced warnings, reverse lookup,
// print. Every temperature limit and warning below carries a source.
// ================================================================
(function () {
  "use strict";

  // ---------- Sources ----------
  const SRC = {
    parker: { name: "Parker O-Ring Handbook (ORD 5700), §2.2", url: "https://www.parker.com/content/dam/Parker-com/Literature/O-Ring-Division-Literature/ORD-5700.pdf" },
    harrington: { name: "Harrington Industrial Plastics — Basic Materials Guide", url: "https://www.hipco.com/resources/basic-materials-guide/" },
    victrex: { name: "Victrex — A closer PEEK at PEEK", url: "https://www.victrex.com/en/blog/2017/a-closer-peek-at-peek" },
    dedietrich: { name: "De Dietrich — Questions and answers about glass-lined equipment", url: "https://www.dedietrich.com/en/resources/your-questions-and-our-answers-about-glass-lined-equipment" },
    ddps: { name: "De Dietrich Process Systems — Types of chemical attack in glass-lined equipment", url: "https://www.ddpsinc.com/en/knowledge/what-are-different-types-of-chemical-attack-that-can-occur-in-glass-lined-equipment" },
    pfaudler: { name: "Pfaudler — Standard Glass WWG data sheet", url: "https://www.gmmpfaudler.com/uploads/files/F_Pfaudler-Standard-Glass-WWG-616-4E.pdf" },
    timet: { name: "TIMET — Corrosion Resistance of Titanium", url: "https://www.timet.com/assets/local/documents/technicalmanuals/corrosion.pdf" },
    ssina: { name: "SSINA — Chloride Stress Corrosion Cracking", url: "https://www.ssina.com/education/corrosion/chloride-stress-corrosion-cracking/" },
  };

  // ---------- Material groups ----------
  const GROUPS = [
    { name: "Metals", mats: ["SS316", "SS304", "Mild Steel (MS)", "Cast Iron", "Aluminum", "Hastelloy C276", "Titanium"] },
    { name: "Linings", mats: ["Glass-Lined Steel"] },
    { name: "Plastics", mats: ["PTFE", "PEEK", "PVDF (Kynar)", "PP", "PVC", "CPVC", "PE (HDPE/LDPE)", "Nylon"] },
    { name: "Elastomers", mats: ["Viton (FKM)", "EPDM", "Nitrile (Buna-N)", "Neoprene"] },
  ];

  // ---------- Maximum service temperatures (sourced; °C) ----------
  // quote = the source's own words; c = value used here in °C
  const TEMP_LIMITS = {
    "PVC": { c: 60, quote: "maximum service temperature of PVC is 140°F for Type 1", src: "harrington" },
    "CPVC": { c: 99, quote: "temperatures up to 210°F", src: "harrington" },
    "PP": { c: 82, quote: "temperatures up to 180°F in drainage applications", note: "value given for PP homopolymer", src: "harrington" },
    "PVDF (Kynar)": { c: 138, quote: "retains most of its strength to 280°F", src: "harrington" },
    "PE (HDPE/LDPE)": { c: 71, quote: "good for temperatures to 160°F", note: "value given for HDPE", src: "harrington" },
    "PTFE": { c: 260, quote: "liquids or gases up to 500°F", src: "harrington" },
    "Nylon": { c: 121, quote: "wide temperature range from -30°F to 250°F", src: "harrington" },
    "PEEK": { c: 260, quote: "continuous use temperature of 260°C (500°F)", src: "victrex" },
    "Viton (FKM)": { c: 204, quote: "Heat resistance: Up to 204°C (400°F)", src: "parker" },
    "EPDM": { c: 150, quote: "Heat resistance: Up to 150°C (302°F) (max. 204°C in water and/or steam)", src: "parker" },
    "Nitrile (Buna-N)": { c: 100, quote: "Heat resistance: Up to 100°C (212°F) with shorter life @ 121°C", src: "parker" },
    "Neoprene": { c: 121, quote: "Heat resistance: Up to approximately 121°C (250°F)", src: "parker" },
    "Glass-Lined Steel": { c: 260, quote: "The maximum temperature is 260°C.", src: "dedietrich" },
  };

  // ---------- Sourced warnings ----------
  // chems: exact CHEM_COMPAT names; mats: exact MATERIALS names; minTemp: only show at/above this °C
  const CHLORIDE_CHEMS = ["Hydrochloric Acid (37%)", "Salt Brine (NaCl, saturated)", "Ferric Chloride", "Sodium Hypochlorite (<20%)"];
  const WARNINGS = [
    { mats: ["Titanium"], chems: ["Methanol"], src: "timet",
      text: "Methanol can cause stress corrosion cracking in unalloyed titanium when the water content is below 1.5% (TIMET, p.18)." },
    { mats: ["Titanium"], chems: ["Chlorine (Dry)"], src: "timet",
      text: "Dry chlorine can rapidly attack titanium and may even cause ignition if moisture is sufficiently low; about 1% water is generally enough for passivation (TIMET, p.2)." },
    { mats: ["Titanium"], chems: ["Nitric Acid (Concentrated)"], src: "timet",
      text: "Titanium is not recommended for red fuming nitric acid — a pyrophoric reaction product can form (water < 1.34% and NO₂ > 6%) (TIMET, p.10)." },
    { mats: ["Glass-Lined Steel"], chems: ["Sodium Hydroxide (20%)", "Sodium Hydroxide (50%)", "Potassium Hydroxide (Caustic)"], src: ["ddps", "pfaudler"],
      text: "Hot caustic alkalis should be avoided in glass-lined equipment — silica is very soluble in alkali (NaOH, KOH). Pfaudler WWG data restrict higher alkali concentrations to 50 °C." },
    { mats: ["Glass-Lined Steel"], chems: ["Phosphoric Acid (>40%)"], src: "ddps",
      text: "Phosphoric acid can damage glass lining, especially when concentrated and at elevated temperature." },
    { mats: ["SS316", "SS304"], chems: CHLORIDE_CHEMS, src: "ssina", minTemp: 60,
      text: "Chloride stress corrosion cracking risk: rare below 60 °C when fully immersed, but failures have been reported with as little as 10 ppm chlorides, and evaporation can concentrate them (SSINA)." },
  ];

  const RATING = {
    E: { label: "Excellent", cls: "mc-e", rank: 3 },
    G: { label: "Good", cls: "mc-g", rank: 2 },
    F: { label: "Fair", cls: "mc-f", rank: 1 },
    N: { label: "Not Recommended", cls: "mc-n", rank: 0 },
  };

  let DATA = null, MATS = null, NAMES = [];
  let stream = [];      // selected chemical names
  let tempC = null;     // operating temperature or null
  let mode = "stream";  // "stream" | "material"
  let selMat = null;

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const srcLink = (k) => [].concat(k).map((x) => `<a href="${SRC[x].url}" target="_blank" rel="noopener">${esc(SRC[x].name)}</a>`).join("; ");

  function rating(chem, mat) {
    const i = MATS.indexOf(mat);
    const row = DATA[chem];
    const code = row && i >= 0 ? row[i] : null;
    return RATING[code] ? code : null;
  }

  function warningsFor(mat, chems, t) {
    return WARNINGS.filter((w) => w.mats.includes(mat) && chems.some((c) => w.chems.includes(c)) && (w.minTemp === undefined || (t !== null && t >= w.minTemp)));
  }

  // Worst-case evaluation of a material for the selected stream
  function evaluate(mat) {
    const per = stream.map((c) => ({ chem: c, code: rating(c, mat) }));
    let worst = null, limiting = [], missing = per.filter((p) => !p.code).map((p) => p.chem);
    per.forEach((p) => {
      if (!p.code) return;
      if (!worst || RATING[p.code].rank < RATING[worst].rank) { worst = p.code; limiting = [p.chem]; }
      else if (p.code === worst) limiting.push(p.chem);
    });
    const lim = TEMP_LIMITS[mat] || null;
    const overTemp = lim && tempC !== null && tempC > lim.c;
    const warns = warningsFor(mat, stream, tempC);
    let verdict;
    if (overTemp) verdict = "overtemp";
    else if (missing.length) verdict = "nodata";
    else verdict = worst;
    return { mat, per, worst, limiting, missing, lim, overTemp, warns, verdict };
  }

  // ---------- Rendering ----------
  function shell() {
    return `
      ${typeof plateHeader === "function" ? plateHeader("Chemical–Material Compatibility", "REFERENCE STARTING POINT — VERIFY BEFORE MOC") : ""}
      <div class="mc-tabs" role="tablist">
        <button type="button" class="pill" data-mc-mode="stream" role="tab">Check a process stream</button>
        <button type="button" class="pill" data-mc-mode="material" role="tab">Look up a material</button>
      </div>
      <div id="mc-stream-pane">
        <div class="mc-inputs">
          <div class="mc-search">
            <label class="mc-lbl" for="mc-q">Add chemicals in the stream</label>
            <input id="mc-q" type="text" autocomplete="off" placeholder="Type to search, e.g. toluene, HCl, caustic" aria-autocomplete="list" aria-controls="mc-list">
            <div id="mc-list" class="mc-list" role="listbox" hidden></div>
          </div>
          <div class="mc-temp">
            <label class="mc-lbl" for="mc-t">Operating temp (°C, optional)</label>
            <input id="mc-t" type="number" inputmode="decimal" step="any" placeholder="e.g. 60">
          </div>
        </div>
        <div id="mc-chips" class="mc-chips"></div>
        <div id="mc-results"></div>
      </div>
      <div id="mc-material-pane" hidden>
        <label class="mc-lbl" for="mc-mat">Material</label>
        <select id="mc-mat" class="mc-select"></select>
        <div id="mc-mat-results"></div>
      </div>
      <p class="mc-foot">Ratings are a compiled starting reference, not a substitute for a vendor datasheet or in-house trial — always confirm against your actual concentration, temperature and duty before finalizing MOC. The ratings are not temperature-specific. Temperature limits and warnings are shown only where a source is cited.</p>
    `;
  }

  function chip(code) {
    if (!code) return `<span class="mc-chip mc-x">No data</span>`;
    return `<span class="mc-chip ${RATING[code].cls}">${RATING[code].label}</span>`;
  }

  function renderChips() {
    $("mc-chips").innerHTML = stream.length
      ? stream.map((c, i) => `<span class="mc-tag">${esc(c)}<button type="button" aria-label="Remove ${esc(c)}" data-mc-remove="${i}">×</button></span>`).join("") +
        `<button type="button" class="mc-clear" id="mc-clear">Clear all</button>`
      : "";
  }

  function verdictChip(ev) {
    if (ev.verdict === "overtemp") return `<span class="mc-chip mc-n">Above temp limit</span>`;
    if (ev.verdict === "nodata") return `<span class="mc-chip mc-x">Incomplete data</span>`;
    return chip(ev.verdict);
  }

  function materialRow(ev) {
    const multi = stream.length > 1;
    const bits = [];
    if (ev.verdict !== "overtemp" && ev.verdict !== "nodata" && multi && ev.worst && ev.worst !== "E")
      bits.push(`<span class="mc-why">Limited by: ${ev.limiting.map(esc).join(", ")}</span>`);
    if (ev.missing.length) bits.push(`<span class="mc-why">No data for: ${ev.missing.map(esc).join(", ")}</span>`);
    if (ev.overTemp) bits.push(`<span class="mc-why mc-why-bad">${tempC} °C is above the ${ev.lim.c} °C service limit</span>`);
    const perChem = multi ? `<div class="mc-per">${ev.per.map((p) => `<span class="mc-per-item">${esc(p.chem)}: ${chip(p.code)}</span>`).join("")}</div>` : "";
    const warns = ev.warns.map((w) => `<div class="mc-warn">⚠ ${esc(w.text)} <span class="mc-src">Source: ${srcLink(w.src)}</span></div>`).join("");
    const coupon = ev.verdict === "F" ? `<a class="mc-coupon" href="/calculators/corrosion-coupon-calculator/">Fair — confirm with a coupon test →</a>` : "";
    const limTxt = ev.lim ? `<span class="mc-lim" title="${esc(ev.lim.quote)}">max ${ev.lim.c} °C</span>` : "";
    return `<div class="mc-row mc-v-${ev.verdict || "x"}">
      <div class="mc-row-main"><span class="mc-mat">${esc(ev.mat)}</span>${limTxt}<span class="mc-verdict">${verdictChip(ev)}</span></div>
      ${bits.length ? `<div class="mc-bits">${bits.join("")}</div>` : ""}
      ${perChem}${warns}${coupon}
    </div>`;
  }

  function renderStream() {
    const out = $("mc-results");
    renderChips();
    if (!stream.length) {
      out.innerHTML = `<div class="mc-empty">Add one or more chemicals to see how each material of construction holds up. With several chemicals, each material is rated by its <b>worst</b> result across the stream.</div>`;
      return;
    }
    const evs = {};
    MATS.forEach((m) => { evs[m] = evaluate(m); });
    const suitable = MATS.filter((m) => evs[m].verdict === "E" || evs[m].verdict === "G");
    const withWarn = suitable.filter((m) => evs[m].warns.length);
    let summary = `<div class="mc-summary"><div class="mc-sum-title">Rated Excellent or Good for ${stream.length > 1 ? "every chemical in this stream" : esc(stream[0])}${tempC !== null ? ` and within temperature limits at ${tempC} °C` : ""}</div>`;
    summary += suitable.length
      ? `<div class="mc-sum-list">${suitable.map((m) => `<span class="mc-sum-item ${evs[m].verdict === "E" ? "mc-e" : "mc-g"}">${esc(m)}${evs[m].warns.length ? " ⚠" : ""}</span>`).join("")}</div>`
      : `<div class="mc-sum-none">No material in this list is rated Good or better for the whole stream.</div>`;
    if (withWarn.length) summary += `<div class="mc-sum-note">⚠ = has a specific warning below — read it before selecting.</div>`;
    if (tempC !== null) summary += `<div class="mc-sum-note">Metals and ratings are not adjusted for temperature; only the polymer, elastomer and glass-lining service limits are checked.</div>`;
    summary += `</div>`;

    const groups = GROUPS.map((g) => `<h3 class="mc-h">${g.name}</h3><div class="mc-group">${g.mats.filter((m) => MATS.includes(m)).map((m) => materialRow(evs[m])).join("")}</div>`).join("");
    out.innerHTML = summary + `<div class="mc-actions"><button type="button" class="pill" id="mc-print">Print / save as PDF</button><button type="button" class="pill" id="mc-share">Copy link to this check</button><span id="mc-share-msg" class="mc-share-msg"></span></div>` + groups + sourcesBlock();
  }

  function sourcesBlock() {
    return `<details class="mc-sources"><summary>Sources for temperature limits and warnings</summary><ul>
      ${Object.entries(TEMP_LIMITS).map(([m, l]) => `<li><b>${esc(m)}</b> — max ${l.c} °C: “${esc(l.quote)}”${l.note ? ` (${esc(l.note)})` : ""} — ${srcLink(l.src)}</li>`).join("")}
      ${WARNINGS.map((w) => `<li><b>${esc(w.mats.join(", "))}</b> with ${esc(w.chems.join(", "))}: ${esc(w.text)} — ${srcLink(w.src)}</li>`).join("")}
    </ul></details>`;
  }

  function renderMaterial() {
    const out = $("mc-mat-results");
    const mat = selMat;
    const byRating = { E: [], G: [], F: [], N: [], x: [] };
    NAMES.forEach((c) => { const r = rating(c, mat); byRating[r || "x"].push(c); });
    const lim = TEMP_LIMITS[mat];
    const warns = WARNINGS.filter((w) => w.mats.includes(mat));
    let html = lim ? `<div class="mc-mat-lim">Maximum service temperature: <b>${lim.c} °C</b> — “${esc(lim.quote)}”${lim.note ? ` (${esc(lim.note)})` : ""} (${srcLink(lim.src)})</div>` : "";
    html += ["E", "G", "F", "N"].map((k) => byRating[k].length ? `<div class="mc-mat-block"><div class="mc-mat-head">${chip(k)} <span class="mc-count">${byRating[k].length}</span></div><div class="mc-mat-list">${byRating[k].map((c) => `<span class="mc-mat-chem">${esc(c)}${warns.some((w) => w.chems.includes(c)) ? " ⚠" : ""}</span>`).join("")}</div></div>` : "").join("");
    if (warns.length) html += `<h3 class="mc-h">Warnings for ${esc(mat)}</h3>` + warns.map((w) => `<div class="mc-warn">⚠ <b>${esc(w.chems.join(", "))}:</b> ${esc(w.text)} <span class="mc-src">Source: ${srcLink(w.src)}</span></div>`).join("");
    out.innerHTML = html;
  }

  function setMode(m) {
    mode = m;
    document.querySelectorAll("[data-mc-mode]").forEach((b) => { b.classList.toggle("active", b.dataset.mcMode === m); b.setAttribute("aria-selected", b.dataset.mcMode === m); });
    $("mc-stream-pane").hidden = m !== "stream";
    $("mc-material-pane").hidden = m !== "material";
    if (m === "material") renderMaterial(); else renderStream();
  }

  // ---------- Search ----------
  const ALIASES = {
    "Hydrochloric Acid (37%)": "hcl muriatic",
    "Sodium Hydroxide (20%)": "naoh caustic soda lye", "Sodium Hydroxide (50%)": "naoh caustic soda lye",
    "Potassium Hydroxide (Caustic)": "koh caustic potash",
    "Methylene Chloride": "dcm mdc dichloromethane",
    "Methyl Ethyl Ketone (MEK)": "mek butanone",
    "N,N-Dimethylformamide (DMF)": "dmf", "Dimethyl Sulfoxide (DMSO)": "dmso", "Tetrahydrofuran (THF)": "thf",
    "Isopropyl Alcohol": "ipa isopropanol 2-propanol", "Ethanol": "etoh alcohol", "Methanol": "meoh methyl alcohol",
    "Ethyl Acetate": "etoac", "Hydrogen Peroxide (30%)": "h2o2", "Sodium Hypochlorite (<20%)": "bleach naocl hypo",
    "Salt Brine (NaCl, saturated)": "sodium chloride nacl brine", "Ammonia, Anhydrous": "nh3",
    "Nitric Acid (5-10%)": "hno3", "Nitric Acid (Concentrated)": "hno3", "Phosphoric Acid (>40%)": "h3po4",
    "Acetic Acid, Glacial": "ethanoic acid aa", "Ferric Chloride": "fecl3 iron chloride", "Chloroform": "chcl3 trichloromethane",
    "Toluene (Toluol)": "methylbenzene", "Sulfuric Acid (<10%)": "h2so4 sulphuric", "Sulfuric Acid (10-75%)": "h2so4 sulphuric", "Sulfuric Acid (75-100%)": "h2so4 sulphuric",
    "Water, Distilled": "dm water di water demineralized", "Formaldehyde (40%)": "formalin",
    "Phenol (Carbolic Acid)": "phenol", "Triethylamine": "tea et3n",
  };
  let listIdx = -1;
  function matches(q) {
    q = q.trim().toLowerCase();
    const pool = NAMES.filter((n) => !stream.includes(n));
    if (!q) return pool;
    // Rank: exact alias/word match, then name prefix, then word prefix, then substring
    const score = (n) => {
      const name = n.toLowerCase();
      const words = (name + " " + (ALIASES[n] || "")).split(/[^a-z0-9]+/).filter(Boolean);
      if (words.includes(q)) return 0;
      if (name.startsWith(q)) return 1;
      if (words.some((w) => w.startsWith(q))) return 2;
      if ((name + " " + (ALIASES[n] || "")).includes(q)) return 3;
      return 9;
    };
    return pool.map((n) => [n, score(n)]).filter((x) => x[1] < 9).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).map((x) => x[0]);
  }
  function showList() {
    const items = matches($("mc-q").value);
    const list = $("mc-list");
    listIdx = -1;
    list.innerHTML = items.length ? items.map((n, i) => `<div class="mc-opt" role="option" data-mc-add="${esc(n)}" id="mc-opt-${i}">${esc(n)}</div>`).join("") : `<div class="mc-opt mc-opt-none">No match in this database</div>`;
    list.hidden = false;
  }
  function hideList() { $("mc-list").hidden = true; }
  function addChem(name) {
    if (!DATA[name] || stream.includes(name)) return;
    stream.push(name);
    $("mc-q").value = "";
    hideList();
    syncUrl();
    renderStream();
  }

  // ---------- URL state (shareable checks) ----------
  function syncUrl() {
    try {
      const p = new URLSearchParams();
      if (stream.length) p.set("c", stream.join("|"));
      if (tempC !== null) p.set("t", String(tempC));
      const qsStr = p.toString();
      history.replaceState(null, "", location.pathname + (qsStr ? "?" + qsStr : ""));
    } catch (e) { /* ignore */ }
  }
  function readUrl() {
    try {
      const p = new URLSearchParams(location.search);
      const c = p.get("c");
      if (c) stream = c.split("|").filter((n) => DATA[n]);
      const t = parseFloat(p.get("t"));
      if (isFinite(t)) { tempC = t; $("mc-t").value = t; }
    } catch (e) { /* ignore */ }
  }

  // ---------- Init ----------
  function init() {
    const mount = $("calc-mount");
    if (!mount) return;
    if (typeof CHEM_COMPAT === "undefined" || typeof MATERIALS === "undefined") { mount.innerHTML = `<p style="color:var(--rust)">Compatibility data failed to load. Please reload.</p>`; return; }
    DATA = CHEM_COMPAT; MATS = MATERIALS; NAMES = Object.keys(DATA).sort((a, b) => a.localeCompare(b));
    mount.innerHTML = shell();
    $("mc-mat").innerHTML = GROUPS.map((g) => `<optgroup label="${g.name}">${g.mats.filter((m) => MATS.includes(m)).map((m) => `<option>${esc(m)}</option>`).join("")}</optgroup>`).join("");
    selMat = $("mc-mat").value;
    readUrl();

    mount.addEventListener("click", (e) => {
      const t = e.target;
      const modeBtn = t.closest("[data-mc-mode]"); if (modeBtn) { setMode(modeBtn.dataset.mcMode); return; }
      const add = t.closest("[data-mc-add]"); if (add) { addChem(add.dataset.mcAdd); $("mc-q").focus(); return; }
      const rm = t.closest("[data-mc-remove]"); if (rm) { stream.splice(+rm.dataset.mcRemove, 1); syncUrl(); renderStream(); return; }
      if (t.id === "mc-clear") { stream = []; syncUrl(); renderStream(); return; }
      if (t.id === "mc-print") { window.print(); return; }
      if (t.id === "mc-share") {
        const msg = $("mc-share-msg");
        navigator.clipboard.writeText(location.href).then(() => { msg.textContent = "Link copied"; }, () => { msg.textContent = "Copy the address bar link"; });
        setTimeout(() => { msg.textContent = ""; }, 2000);
      }
    });
    const q = $("mc-q");
    q.addEventListener("focus", showList);
    q.addEventListener("input", showList);
    q.addEventListener("keydown", (e) => {
      const opts = [...$("mc-list").querySelectorAll("[data-mc-add]")];
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (!opts.length) return;
        listIdx = (listIdx + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length;
        opts.forEach((o, i) => o.classList.toggle("mc-opt-active", i === listIdx));
        opts[listIdx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        const pick = opts[listIdx >= 0 ? listIdx : 0]; if (pick) addChem(pick.dataset.mcAdd);
      } else if (e.key === "Escape") hideList();
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".mc-search")) hideList(); });
    $("mc-t").addEventListener("input", (e) => { const v = parseFloat(e.target.value); tempC = isFinite(v) ? v : null; syncUrl(); renderStream(); });
    $("mc-mat").addEventListener("change", (e) => { selMat = e.target.value; renderMaterial(); });
    setMode("stream");
  }

  window.PCEMaterialsInit = init;
  window.PCEMaterialsTest = { evaluate: (s, t) => { stream = s; tempC = t; return MATS.map(evaluate); }, setData: (d, m) => { DATA = d; MATS = m; }, WARNINGS, TEMP_LIMITS };
})();
