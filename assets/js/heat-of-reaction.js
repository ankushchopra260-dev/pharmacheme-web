// ================================================================
// PharmaChemE Heat of Reaction calculator
// Best value from measured heats of formation (ATcT, CRC, NIST),
// otherwise Benson group additivity; bond-energy method alongside.
// Chemistry engine: assets/js/hr-core.js (HRCore) on OpenChemLib.
// ================================================================
(function () {
  "use strict";

  const STORE_KEY = "pce-heat-of-reaction-v1";
  const PUG = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const f = (v, d) => (v === null || v === undefined || !isFinite(v) ? "—" : Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }));
  const sgn = (v, d) => (isFinite(v) ? (v > 0 ? "+" : v < 0 ? "−" : "") + f(Math.abs(v), d) : "—");
  const sub = (fml) => esc(fml).replace(/([A-Za-z\)])(\d+)/g, "$1<sub>$2</sub>");
  const PH = { g: "Gas", l: "Liquid", s: "Solid" };

  let Mdl = null, Meas = null, nameIdx = null, dataErr = "";
  let comps = [], nextId = 1, basisId = null, basisKg = 1000, drawTarget = null, drawEditor = null;

  // ---------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------
  async function loadData() {
    const base = (window.PCE_BASE || "") + "/assets/data/";
    try {
      const [a, b] = await Promise.all([fetch(base + "hr-model.json"), fetch(base + "hr-measured.json")]);
      if (!a.ok || !b.ok) throw new Error("HTTP");
      Mdl = await a.json(); Meas = await b.json();
      nameIdx = {};
      for (const k in Meas) { const n = String(Meas[k][0] || "").toLowerCase(); if (n && !nameIdx[n]) nameIdx[n] = k; }
      Object.assign(nameIdx, { "hydrogen gas": nameIdx.hydrogen, h2: nameIdx.hydrogen, "acetic acid": nameIdx["acetic acid"], "hcl": nameIdx["hydrogen chloride"], "hydrochloric acid": nameIdx["hydrogen chloride"], "ipa": nameIdx["isopropanol"] || nameIdx["2-propanol"], "dcm": nameIdx["dichloromethane"], "mdc": nameIdx["dichloromethane"], "thf": nameIdx["tetrahydrofuran"], "dmf": nameIdx["n,n-dimethylformamide"], "toluene": nameIdx.toluene });
    } catch (e) { dataErr = "The thermochemistry data did not load. Check your connection and reload the page."; }
  }

  function molFromSmiles(s) { if (s === "[HH]") s = "[H][H]"; const m = window.OCL.Molecule.fromSmiles(s); if (!m.getAllAtoms()) throw new Error("empty"); return m; }
  function info(c) {
    if (!c.smiles || !Mdl) return null;
    if (c._info && c._info.smiles === c.smiles) return c._info;
    try { c._info = window.HRCore.compound(window.OCL, Mdl, Meas, c.smiles); } catch (e) { c._info = null; }
    return c._info;
  }
  /* substances that are gases at 25 °C and 1 atm */
  const GAS_SMILES = ["[H][H]", "O=O", "N#N", "ClCl", "FF", "Cl", "Br", "F", "N", "O=C=O", "[C-]#[O+]", "O=S=O", "S", "C", "CC", "CCC", "CCCC", "CC(C)C", "C=C", "CC=C", "C=CC=C", "CC(=C)C", "C=CC", "CC=CC", "C#C", "CC#C", "CCl", "CBr", "CF", "C=CCl", "ClC(Cl)=O", "C=O", "CN", "CNC", "CN(C)C", "CCN", "COC", "C1CO1", "C=C=O", "C#N", "FC(F)(F)F", "O=NO", "N=O", "O=[N]=O", "N#CCl"];
  let gasIdc = null;
  function isGas(inf) {
    if (!gasIdc) { gasIdc = {}; GAS_SMILES.forEach((x) => { try { gasIdc[window.OCL.Molecule.fromSmiles(x).getIDCode()] = 1; } catch (e) { /* skip */ } }); }
    return !!gasIdc[inf.idc];
  }
  function defaultPhase(inf) {
    if (!inf) return "l";
    if (isGas(inf)) return "g";
    const m = inf.meas;
    if (!m) return "l";
    if (m[4]) return "l";
    if (m[5]) return "s";
    if (m[3] && inf.hvapEst !== null && inf.hvapEst < 5.5) return "g";
    return "l";
  }

  // ---------------------------------------------------------------
  // Name / SMILES resolution
  // ---------------------------------------------------------------
  async function pubchemSmilesByName(name) {
    const url = (prop) => `${PUG}/name/${encodeURIComponent(name)}/property/${prop},Title/JSON`;
    let r = await fetch(url("SMILES"));
    if (r.status === 400) r = await fetch(url("IsomericSMILES"));
    if (!r.ok) { const e = new Error("HTTP " + r.status); e.status = r.status; throw e; }
    const p = (await r.json()).PropertyTable.Properties[0];
    const smi = p.SMILES || p.IsomericSMILES || p.CanonicalSMILES;
    if (!smi) throw new Error("no smiles");
    return { smiles: smi, title: p.Title || name, cid: p.CID };
  }
  async function resolve(c, raw) {
    const text = (raw || "").trim();
    if (!text) return;
    c.status = "busy"; c.msg = ""; render();
    try {
      const local = nameIdx && nameIdx[text.toLowerCase()];
      if (local) { const m = window.OCL.Molecule.fromIDCode(local); setStructure(c, m.toIsomericSmiles(), "Name found in the data table"); if (!c.label) c.label = text; return; }
      const P = window.PCEStructPaste;
      const res = P ? P.parseText(raw) : null;
      if (res && res.type !== "rxn") { let s = ""; try { s = res.mol.toIsomericSmiles(); } catch (e) { s = res.mol.toSmiles(); } setStructure(c, s, "SMILES / molfile"); return; }
      const p = await pubchemSmilesByName(text);
      if (!c.label) c.label = text;
      setStructure(c, p.smiles, `PubChem CID ${p.cid}`);
    } catch (e) {
      c.status = "err";
      c.msg = e && e.status === 404 ? `PubChem has no compound named “${esc(text)}”. Try another name, paste SMILES, or draw it.` : `Not a valid SMILES, and PubChem couldn't be reached. Paste SMILES or draw the structure.`;
      render();
    }
  }
  function setStructure(c, smiles, src) {
    if (smiles === "[HH]") smiles = "[H][H]";
    c.smiles = smiles; c.src = src; c.status = "ok"; c.msg = ""; c._info = null;
    const inf = info(c);
    if (!c.phaseSet) c.phase = defaultPhase(inf);
    if (!c.label && inf && inf.meas) c.label = cap(inf.meas[0]);
    save(); render();
  }
  const cap = (s) => String(s || "").replace(/^./, (x) => x.toUpperCase());

  // ---------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------
  function molSVG(smiles, w, h) {
    try { const m = molFromSmiles(smiles); m.inventCoordinates(); return m.toSVG(w, h, null, { autoCrop: true, autoCropMargin: 8, suppressChiralText: true, suppressESR: true, suppressCIPParity: true, noStereoProblem: true }); } catch (e) { return ""; }
  }
  function card(c) {
    const inf = info(c);
    if (!c.phase && inf) c.phase = defaultPhase(inf);
    const h = inf ? window.HRCore.hf(inf, c.phase || "l", c.over) : null;
    const name = c.label || (inf ? inf.formula : "");
    return `<div class="hr-card" data-id="${c.id}">
      <div class="hr-top"><input class="hr-coeff" type="number" min="0" step="any" value="${c.coeff}" data-k="coeff" aria-label="Coefficient"><input class="hr-label" type="text" value="${esc(c.label)}" placeholder="Label (optional)" data-k="label" aria-label="Label"><button type="button" class="hr-x" data-act="del" aria-label="Remove">×</button></div>
      <div class="hr-find"><input type="text" class="hr-in" placeholder="Name or SMILES, e.g. nitrobenzene" data-k="in" value="${esc(c.pending || "")}" spellcheck="false"><button type="button" class="pill" data-act="find">Find</button><button type="button" class="pill" data-act="draw">Draw</button></div>
      ${c.status === "busy" ? `<div class="hr-msg">Looking up…</div>` : c.msg ? `<div class="hr-msg hr-err">${c.msg}</div>` : ""}
      ${c.smiles ? `<div class="hr-struct">${molSVG(c.smiles, 220, 120)}</div><div class="hr-meta"><span>${sub(inf ? inf.formula : "?")}</span><span>${inf ? f(inf.mw, 2) + " g/mol" : ""}</span></div>` : `<div class="hr-empty">No structure yet</div>`}
      <div class="hr-row2"><label>Phase <select data-k="phase">${["g", "l", "s"].map((p) => `<option value="${p}"${(c.phase || "l") === p ? " selected" : ""}>${PH[p]}</option>`).join("")}</select></label><label>Your ΔH<sub>f</sub> <input type="number" step="any" data-k="over" value="${esc(c.over || "")}" placeholder="optional" class="hr-over"><em>kcal/mol</em></label></div>
      ${inf && c.phase && c.phase !== "g" && isGas(inf) ? `<div class="hr-src hr-err">This is a gas at 25 °C and 1 atm. Choose Gas unless it is condensed or dissolved, and then enter your own ΔH<sub>f</sub>.</div>` : ""}
      ${c.smiles ? `<div class="hr-src">${h ? `ΔH<sub>f</sub> = <b>${f(h.v, 2)}</b> kcal/mol · ${esc(h.how)}` : `<span class="hr-err">No value: ${esc(inf && inf.ga.missing.length ? inf.ga.missing[0] : "not in the data")}. Enter your own ΔH<sub>f</sub>.</span>`}</div>` : ""}
    </div>`;
  }

  function render() {
    const R = $("hr-reactants"), P = $("hr-products");
    if (!R) return;
    R.innerHTML = comps.filter((c) => c.role === "R").map(card).join("");
    P.innerHTML = comps.filter((c) => c.role === "P").map(card).join("");
    renderResults();
  }

  function renderResults() {
    const out = $("hr-results");
    if (dataErr) { out.innerHTML = `<div class="hr-note hr-err">${dataErr}</div>`; return; }
    if (!Mdl) { out.innerHTML = `<div class="hr-note">Loading the thermochemistry data…</div>`; return; }
    const filled = comps.filter((c) => c.smiles && +c.coeff > 0 && info(c));
    if (!filled.some((c) => c.role === "R") || !filled.some((c) => c.role === "P")) { out.innerHTML = `<div class="hr-note">Add at least one reactant and one product to see the heat of reaction.</div>`; return; }
    const list = filled.map((c) => ({ id: c.id, label: c.label || info(c).formula, c: info(c), nu: (c.role === "P" ? 1 : -1) * +c.coeff, phase: c.phase || "l", override: c.over }));
    const r = window.HRCore.reaction(Mdl, list);
    let html = "";

    // equation + balance
    const side = (role) => list.filter((x) => (role === "R" ? x.nu < 0 : x.nu > 0)).map((x) => `${Math.abs(x.nu) !== 1 ? `<b>${f(Math.abs(x.nu), Math.abs(x.nu) % 1 ? 2 : 0)}</b> ` : ""}${esc(x.label)} <em>(${x.phase})</em>`).join(` <span class="hr-op">+</span> `);
    html += `<h3 class="hr-h">Reaction</h3><div class="hr-eq">${side("R")} <span class="hr-arrow">→</span> ${side("P")}</div>`;
    if (r.unbalanced.length) {
      html += `<div class="hr-note hr-bad"><b>Not balanced:</b> ${r.unbalanced.map((e) => `${e === "charge" ? "charge" : e} ${sgn(r.balance[e], 2)}`).join(", ")} (products minus reactants). Fix the coefficients first: a heat of reaction for an unbalanced equation has no meaning. The <a href="${(window.PCE_BASE || "")}/molecules/reaction/">Reaction Builder</a> can auto-balance it.</div>`;
      out.innerHTML = html; return;
    }
    html += `<div class="hr-okline"><span class="hr-badge hr-ok">Balanced</span></div>`;
    if (!r.ok) { html += r.msgs.map((m) => `<div class="hr-note hr-bad">${esc(m)}</div>`).join(""); out.innerHTML = html; return; }

    // headline
    const kind = r.best < -0.05 ? "Exothermic: heat is released" : r.best > 0.05 ? "Endothermic: heat is absorbed" : "Close to thermoneutral";
    const b = list.find((x) => x.id === basisId) || list.find((x) => x.nu < 0);
    const kmolRxnPerKg = 1 / (b.c.mw * Math.abs(b.nu));          // kmol of reaction per kg of basis
    const perKg = r.best * 1000 * kmolRxnPerKg;                    // kcal per kg of basis
    html += `<div class="hr-grid">
      <div class="readout hr-big ${r.best < 0 ? "" : "warn"}"><div class="label">ΔH<sub>r</sub> at 25 °C</div><div class="val">${sgn(r.best, 1)}</div><div class="hr-unit">kcal/mol of reaction · ±${f(Math.max(r.u, 0.1), 1)} typical</div><div class="hr-unit">${kind}</div></div>
      <div class="readout"><div class="label">Per kg of ${esc(b.label)}</div><div class="val">${sgn(perKg, 0)}</div><div class="hr-unit">kcal/kg · ${sgn(perKg * 4.184, 0)} kJ/kg</div></div>
      <div class="readout"><div class="label">For a batch</div><div class="val">${sgn(perKg * basisKg, 0)}</div><div class="hr-unit">kcal for ${f(basisKg, 0)} kg of ${esc(b.label)}</div></div>
    </div>
    <div class="hr-basis"><label>Basis component <select id="hr-basis">${list.map((x) => `<option value="${x.id}"${x.id === b.id ? " selected" : ""}>${esc(x.label)}</option>`).join("")}</select></label><label>Batch quantity of it <input id="hr-basis-kg" type="number" min="0" step="any" value="${basisKg}"><em>kg</em></label></div>`;
    const anyNotes = r.rows.some((x) => x.h && x.h.notes.length);
    if (anyNotes) html += r.rows.filter((x) => x.h && x.h.notes.length).map((x) => `<div class="hr-note hr-warn"><b>${esc(x.x.label)}:</b> ${x.h.notes.map(esc).join(" ")}</div>`).join("");

    // component table
    html += `<h3 class="hr-h">Heats of formation used</h3><div class="hr-scroll"><table class="hr-table"><thead><tr><th>Component</th><th>ν</th><th>Phase</th><th>ΔH<sub>f</sub>, kcal/mol</th><th>ν·ΔH<sub>f</sub></th><th>Where the value comes from</th></tr></thead><tbody>
      ${r.rows.map((x) => `<tr><td>${esc(x.x.label)}<div class="hr-fm">${sub(x.x.c.formula)}</div></td><td>${sgn(x.x.nu, Math.abs(x.x.nu) % 1 ? 2 : 0)}</td><td>${PH[x.x.phase]}</td><td>${f(x.h.v, 2)}</td><td>${sgn(x.x.nu * x.h.v, 2)}</td><td class="hr-how">${esc(x.h.how)}</td></tr>`).join("")}
      <tr class="hr-sum"><td colspan="4">ΔH<sub>r</sub> = Σ ν·ΔH<sub>f</sub> (products positive, reactants negative)</td><td>${sgn(r.best, 2)}</td><td></td></tr></tbody></table></div>`;

    // method comparison
    const pc = r.phaseCorr;
    const meth = [
      ["Measured heats of formation", r.measAll ? r.gasMeas : null, "Published experimental values (ATcT, CRC Handbook, NIST). The reference when every species has one."],
      ["Group additivity (Benson)", r.gaAll ? r.gasGA : null, (r.gaUsesMeas ? "Organic species by groups; small inorganic species from measured data. " : "") + "Typical error 0.5 to 2 kcal/mol for ordinary organics."],
      ["Bond energies", r.beAll ? r.gasBE : null, "Bonds broken minus bonds formed. Ignores ring strain, resonance and branching, so errors of 5 kcal/mol or more are normal."],
    ];
    html += `<h3 class="hr-h">Three methods side by side</h3><p class="hr-small">Each method gives the gas-phase heat of reaction; the same phase correction (${sgn(pc, 1)} kcal/mol, from heats of vaporisation and the phases you chose) is then added so the rows compare like with like.</p>
      <div class="hr-scroll"><table class="hr-table"><thead><tr><th>Method</th><th>Gas phase</th><th>At your phases</th><th>vs headline</th><th>Notes</th></tr></thead><tbody>
      ${meth.map(([n, v, note]) => `<tr><td>${n}</td><td>${v === null ? "—" : sgn(v, 1)}</td><td>${v === null ? "—" : sgn(v + pc, 1)}</td><td>${v === null ? "—" : sgn(v + pc - r.best, 1)}</td><td class="hr-how">${v === null ? (n.startsWith("Measured") ? "Not every species has a measured gas value." : n.startsWith("Group") ? "No group values for at least one species (see the notes on its card)." : "At least one bond type is not in the table (S, P, Si and B are not covered).") : note}</td></tr>`).join("")}
      </tbody></table></div>`;

    // bond energy detail
    if (r.beAll) {
      const rowsBE = Object.keys(r.beRows).filter((k) => Math.abs(r.beRows[k]) > 1e-9).map((k) => ({ k, n: -r.beRows[k], v: Mdl.bonds[k] }));
      const broken = rowsBE.filter((x) => x.n > 0), formed = rowsBE.filter((x) => x.n < 0);
      const sb = broken.reduce((s, x) => s + x.n * x.v, 0), sf = formed.reduce((s, x) => s - x.n * x.v, 0);
      const tr = (x) => `<tr><td>${esc(x.k)}</td><td>${f(Math.abs(x.n), Math.abs(x.n) % 1 ? 2 : 0)}</td><td>${f(x.v, 1)}</td><td>${f(Math.abs(x.n) * x.v, 1)}</td></tr>`;
      html += `<details class="hr-det"><summary>Bond energy working: net bonds broken and formed</summary>
        <p class="hr-small">Bonds that appear on both sides cancel, so only the net change is listed. Values are bond enthalpies for each bond type (kcal/mol), fitted to the measured heats of formation of ${"863"} compounds; see the notes below the calculator.</p>
        <div class="hr-cols2"><div><b>Broken (energy in)</b><table class="hr-table"><thead><tr><th>Bond</th><th>Net number</th><th>Each</th><th>Total</th></tr></thead><tbody>${broken.map(tr).join("") || `<tr><td colspan="4">none</td></tr>`}<tr class="hr-sum"><td colspan="3">Σ broken</td><td>${f(sb, 1)}</td></tr></tbody></table></div>
        <div><b>Formed (energy out)</b><table class="hr-table"><thead><tr><th>Bond</th><th>Net number</th><th>Each</th><th>Total</th></tr></thead><tbody>${formed.map(tr).join("") || `<tr><td colspan="4">none</td></tr>`}<tr class="hr-sum"><td colspan="3">Σ formed</td><td>${f(sf, 1)}</td></tr></tbody></table></div></div>
        <p class="hr-small">ΔH<sub>r</sub>(gas) ≈ Σ broken − Σ formed = ${f(sb, 1)} − ${f(sf, 1)} = <b>${sgn(sb - sf, 1)}</b> kcal/mol.</p></details>`;
    }
    // group additivity detail
    const gaRows = list.filter((x) => x.c.gaOK);
    if (gaRows.length) {
      html += `<details class="hr-det"><summary>Group additivity working, per component (gas phase)</summary>${gaRows.map((x) => {
        const agg = {}; x.c.ga.terms.forEach((t) => { const k = t.name; if (!agg[k]) agg[k] = { n: 0, v: t.v, src: t.src }; agg[k].n++; });
        const meas = x.c.meas && x.c.meas[3] ? x.c.meas[3][0] : null;
        return `<div class="hr-ga"><b>${esc(x.label)}</b> <span class="hr-fm">${sub(x.c.formula)}</span><table class="hr-table"><thead><tr><th>Group or correction</th><th>Count</th><th>Each</th><th>Source</th></tr></thead><tbody>${Object.keys(agg).map((k) => `<tr><td>${esc(k)}</td><td>${agg[k].n}</td><td>${f(agg[k].v, 2)}</td><td class="hr-how">${esc(agg[k].src)}</td></tr>`).join("")}<tr class="hr-sum"><td colspan="2">ΔH<sub>f</sub>(gas) by groups</td><td>${f(x.c.ga.value, 2)}</td><td>${meas !== null ? `measured: ${f(meas, 2)} (${sgn(x.c.ga.value - meas, 2)})` : ""}</td></tr></tbody></table>${x.c.ga.notes.length ? `<div class="hr-small">${x.c.ga.notes.map(esc).join(" · ")}</div>` : ""}</div>`;
      }).join("")}</details>`;
    }
    html += `<div class="hr-next"><b>Next:</b> turn the heat into a temperature rise with the <a href="${(window.PCE_BASE || "")}/articles/thermochemistry-and-heat-of-reaction/#adiabatic">adiabatic temperature rise tool</a>, or into a dosing time with the <a href="${(window.PCE_BASE || "")}/calculators/reagent-addition-time-calculator/">addition time calculator</a>.</div>`;
    out.innerHTML = html;
  }

  // ---------------------------------------------------------------
  // State
  // ---------------------------------------------------------------
  function stateObj() { return { c: comps.map((c) => [c.role, c.label, c.smiles, c.coeff, c.phase, c.over || "", c.phaseSet ? 1 : 0]), bi: comps.findIndex((c) => c.id === basisId), k: basisKg }; }
  function loadState(o) {
    if (!o || !Array.isArray(o.c)) return false;
    comps = []; nextId = 1;
    o.c.forEach((a) => comps.push({ id: nextId++, role: a[0] === "P" ? "P" : "R", label: a[1] || "", smiles: a[2] === "[HH]" ? "[H][H]" : a[2] || "", coeff: a[3] === undefined || a[3] === "" || !isFinite(+a[3]) ? 1 : +a[3], phase: a[4] || "", over: a[5] || "", phaseSet: !!a[6], status: a[2] ? "ok" : "" }));
    basisId = o.bi >= 0 && comps[o.bi] ? comps[o.bi].id : null; basisKg = isFinite(+o.k) && o.k !== undefined ? +o.k : 1000;
    return true;
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(stateObj())); } catch (e) { /* storage unavailable */ } }

  const EXAMPLES = {
    nb: ["Nitrobenzene hydrogenation", [["R", "Nitrobenzene", "c1ccccc1[N+](=O)[O-]", 1, "l"], ["R", "Hydrogen", "[HH]", 3, "g"], ["P", "Aniline", "Nc1ccccc1", 1, "l"], ["P", "Water", "O", 2, "l"]]],
    est: ["Esterification", [["R", "Acetic acid", "CC(=O)O", 1, "l"], ["R", "Ethanol", "CCO", 1, "l"], ["P", "Ethyl acetate", "CCOC(C)=O", 1, "l"], ["P", "Water", "O", 1, "l"]]],
    acyl: ["Acetylation (paracetamol)", [["R", "4-Aminophenol", "Nc1ccc(O)cc1", 1, "s"], ["R", "Acetic anhydride", "CC(=O)OC(C)=O", 1, "l"], ["P", "Paracetamol", "CC(=O)Nc1ccc(O)cc1", 1, "s"], ["P", "Acetic acid", "CC(=O)O", 1, "l"]]],
    cl: ["Side-chain chlorination", [["R", "Toluene", "Cc1ccccc1", 1, "l"], ["R", "Chlorine", "ClCl", 1, "g"], ["P", "Benzyl chloride", "ClCc1ccccc1", 1, "l"], ["P", "Hydrogen chloride", "Cl", 1, "g"]]],
    nit: ["Nitration of benzene", [["R", "Benzene", "c1ccccc1", 1, "l"], ["R", "Nitric acid", "O[N+](=O)[O-]", 1, "l"], ["P", "Nitrobenzene", "c1ccccc1[N+](=O)[O-]", 1, "l"], ["P", "Water", "O", 1, "l"]]],
    soc: ["Acid chloride (SOCl₂)", [["R", "Benzoic acid", "OC(=O)c1ccccc1", 1, "s"], ["R", "Thionyl chloride", "O=S(Cl)Cl", 1, "l"], ["P", "Benzoyl chloride", "ClC(=O)c1ccccc1", 1, "l"], ["P", "Sulfur dioxide", "O=S=O", 1, "g"], ["P", "Hydrogen chloride", "Cl", 1, "g"]]],
  };
  function loadExample(k) {
    const ex = EXAMPLES[k]; if (!ex) return;
    comps = []; nextId = 1;
    ex[1].forEach(([r, l, s, n, p]) => comps.push({ id: nextId++, role: r, label: l, smiles: s, coeff: n, phase: p, phaseSet: true, status: "ok", src: "Example" }));
    basisId = 1; save(); render();
  }
  function add(role) { comps.push({ id: nextId++, role, label: "", smiles: "", coeff: 1, phase: "l", over: "", status: "" }); save(); render(); }

  // ---------------------------------------------------------------
  // Draw dialog
  // ---------------------------------------------------------------
  function openDraw(c) {
    drawTarget = c; $("hr-dialog").hidden = false; document.body.style.overflow = "hidden";
    if (!drawEditor) drawEditor = new window.OCL.CanvasEditor($("hr-draw-editor"), { initialMode: "molecule" });
    try { if (c.smiles) { const m = molFromSmiles(c.smiles); m.inventCoordinates(); drawEditor.setMolecule(m); } else drawEditor.clearAll(); } catch (e) { drawEditor.clearAll(); }
  }
  function closeDraw(use) {
    if (use && drawTarget) { const m = drawEditor.getMolecule(); if (m && m.getAllAtoms()) setStructure(drawTarget, m.toIsomericSmiles(), "Drawn"); }
    $("hr-dialog").hidden = true; document.body.style.overflow = ""; drawTarget = null;
  }

  function shell() {
    return `${typeof plateHeader === "function" ? plateHeader("PharmaChemE Heat of Reaction", "MEASURED DATA · GROUP ADDITIVITY · BOND ENERGY") : ""}
      <p class="hr-intro">Enter each reactant and product by <b>name</b>, <b>SMILES</b> or a <b>drawn</b> structure, set the coefficient and the phase, and the heat of reaction at 25 °C appears below with the working.</p>
      <div class="pill-group hr-ex"><span class="hr-small">Examples:</span>${Object.keys(EXAMPLES).map((k) => `<button type="button" class="pill" data-ex="${k}">${EXAMPLES[k][0]}</button>`).join("")}<button type="button" class="pill hr-clear" id="hr-clear">Clear all</button></div>
      <div class="hr-cols">
        <section><div class="hr-col-head"><h3>Reactants</h3><button type="button" class="pill active" data-add="R">+ Add reactant</button></div><div id="hr-reactants" class="hr-list"></div></section>
        <div class="hr-arrowcol" aria-hidden="true">→</div>
        <section><div class="hr-col-head"><h3>Products</h3><button type="button" class="pill active" data-add="P">+ Add product</button></div><div id="hr-products" class="hr-list"></div></section>
      </div>
      <div id="hr-results" aria-live="polite"></div>
      <p class="hr-foot">Structures are processed in your browser by OpenChemLib. A name is sent to PubChem only if it is not in the built-in table of about 6,700 compounds.</p>
      <div id="hr-dialog" class="hr-dialog" hidden role="dialog" aria-modal="true" aria-label="Draw structure"><div class="hr-dialog-box"><div class="hr-dialog-head"><b>Draw structure</b></div><div id="hr-draw-editor" class="hr-draw-editor"></div><div class="pill-group" style="justify-content:flex-end;margin-top:10px;"><button type="button" class="pill" id="hr-draw-cancel">Cancel</button><button type="button" class="pill active" id="hr-draw-ok">Use this structure</button></div></div></div>`;
  }

  const byId = (id) => comps.find((c) => c.id === +id);
  async function init() {
    const mount = $("calc-mount"); if (!mount) return;
    if (!window.OCL || !window.HRCore) { mount.innerHTML = `<p style="color:var(--rust)">The chemistry engine did not load. Please reload the page.</p>`; return; }
    mount.innerHTML = shell();
    let loaded = false;
    try { const m = location.hash.match(/^#rx=(.*)$/); if (m) loaded = loadState(JSON.parse(decodeURIComponent(m[1]))); } catch (e) { /* ignore */ }
    if (!loaded) { try { loaded = loadState(JSON.parse(localStorage.getItem(STORE_KEY))); } catch (e) { /* ignore */ } }
    if (!loaded || !comps.length) { loadExample("nb"); }
    render();
    await loadData();
    comps.forEach((c) => { c._info = null; });
    render();

    mount.addEventListener("click", (e) => {
      const t = e.target;
      const ex = t.closest("[data-ex]"); if (ex) { loadExample(ex.dataset.ex); return; }
      const ad = t.closest("[data-add]"); if (ad) { add(ad.dataset.add); return; }
      if (t.id === "hr-clear") { comps = []; nextId = 1; add("R"); add("R"); add("P"); add("P"); return; }
      if (t.id === "hr-draw-ok") { closeDraw(true); return; }
      if (t.id === "hr-draw-cancel") { closeDraw(false); return; }
      const cardEl = t.closest(".hr-card"); if (!cardEl) return;
      const c = byId(cardEl.dataset.id), act = t.dataset.act;
      if (act === "del") { comps = comps.filter((x) => x !== c); save(); render(); }
      else if (act === "find") resolve(c, cardEl.querySelector('[data-k="in"]').value);
      else if (act === "draw") openDraw(c);
    });
    mount.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.dataset && e.target.dataset.k === "in") { e.preventDefault(); const cardEl = e.target.closest(".hr-card"); resolve(byId(cardEl.dataset.id), e.target.value); } });
    mount.addEventListener("change", (e) => {
      const t = e.target;
      if (t.id === "hr-basis") { basisId = +t.value; save(); renderResults(); return; }
      if (t.id === "hr-basis-kg") { basisKg = Math.max(0, +t.value || 0); save(); renderResults(); return; }
      const cardEl = t.closest(".hr-card"); if (!cardEl) return;
      const c = byId(cardEl.dataset.id), k = t.dataset.k;
      if (k === "coeff") c.coeff = Math.max(0, +t.value || 0);
      else if (k === "label") c.label = t.value;
      else if (k === "phase") { c.phase = t.value; c.phaseSet = true; }
      else if (k === "over") c.over = t.value.trim();
      else if (k === "in") { c.pending = t.value; return; }
      save(); render();
    });
  }
  window.PCEHeatInit = init;
})();
