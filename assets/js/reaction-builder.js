// ================================================================
// PharmaChemE Reaction Builder
// Build A + B -> C + D one component at a time (name via PubChem,
// SMILES / molfile, or a drawn structure), then: element balance
// check, auto-balance, batch stoichiometry, atom economy and a
// theoretical mass balance. All chemistry by OpenChemLib (window.OCL).
// ================================================================
(function () {
  "use strict";

  const STORE_KEY = "pce-reaction-v1";
  const PUG = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound";

  let comps = [];     // {id, role:'R'|'P', kind:'main'|'by', label, smiles, source, coeff, eq, purity, density}
  let nextId = 1;
  let basisId = null;
  let basisAmt = 100, basisUnit = "kg";
  let yieldPct = 100;
  let drawTarget = null, drawEditor = null;
  let lastSugg = [];
  let viewMode = "table";

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const f = (v, d) => (v === null || v === undefined || !isFinite(v) ? "—" : Number(v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }));
  const num = (v, dflt) => { const x = parseFloat(v); return isFinite(x) ? x : dflt; };

  // ---------------------------------------------------------------
  // Chemistry helpers (pure)
  // ---------------------------------------------------------------
  function molFromSmiles(s) {
    const m = window.OCL.Molecule.fromSmiles(s);
    if (!m.getAllAtoms()) throw new Error("empty");
    return m;
  }
  // Element counts incl. implicit H, plus net charge, formula (Hill) and MW
  function analyze(smiles) {
    const OCL = window.OCL;
    const mol = molFromSmiles(smiles);
    mol.ensureHelperArrays(OCL.Molecule.cHelperNeighbours);
    const counts = {};
    let charge = 0;
    for (let i = 0; i < mol.getAllAtoms(); i++) {
      const el = mol.getAtomLabel(i);
      counts[el] = (counts[el] || 0) + 1;
      if (mol.getAtomicNo(i) !== 1) { const h = mol.getAllHydrogens(i); if (h) counts.H = (counts.H || 0) + h; }
      charge += mol.getAtomCharge(i);
    }
    const els = Object.keys(counts);
    const order = counts.C ? ["C", "H"].filter((e) => counts[e]).concat(els.filter((e) => e !== "C" && e !== "H").sort()) : els.sort();
    let formula = order.map((e) => e + (counts[e] > 1 ? counts[e] : "")).join("");
    if (charge) formula += (Math.abs(charge) > 1 ? Math.abs(charge) : "") + (charge > 0 ? "+" : "−");
    const mw = mol.getMolecularFormula().relativeWeight;
    return { counts, charge, formula, mw };
  }

  // --- exact rational arithmetic for balancing ---
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const fr = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return [n / g, d / g]; };
  const fsub = (a, b) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  const fmul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
  const fdiv = (a, b) => fr(a[0] * b[1], a[1] * b[0]);

  // Returns smallest positive integer coefficients, or {error}
  function autoBalance(list) {
    const species = list.map((c) => ({ c, a: analyze(c.smiles) }));
    const els = [...new Set(species.flatMap((s) => Object.keys(s.a.counts)))];
    const rows = els.map((e) => species.map((s) => (s.c.role === "R" ? 1 : -1) * (s.a.counts[e] || 0)));
    if (species.some((s) => s.a.charge)) rows.push(species.map((s) => (s.c.role === "R" ? 1 : -1) * s.a.charge));
    const n = species.length;
    let M = rows.map((r) => r.map((v) => fr(v)));
    // RREF
    const pivCols = [];
    let r = 0;
    for (let col = 0; col < n && r < M.length; col++) {
      let p = M.findIndex((row, i) => i >= r && row[col][0] !== 0);
      if (p < 0) continue;
      [M[r], M[p]] = [M[p], M[r]];
      const pv = M[r][col];
      M[r] = M[r].map((v) => fdiv(v, pv));
      for (let i = 0; i < M.length; i++) {
        if (i === r || M[i][col][0] === 0) continue;
        const k = M[i][col];
        M[i] = M[i].map((v, j) => fsub(v, fmul(k, M[r][j])));
      }
      pivCols.push(col); r++;
    }
    const free = [...Array(n).keys()].filter((c) => !pivCols.includes(c));
    if (free.length === 0) return { error: "These components can't be balanced as written — check that no reactant or product is missing." };
    if (free.length > 1) return { error: "More than one independent way to balance this set (it may be two reactions combined). Enter the coefficients manually." };
    const fc = free[0];
    const x = Array(n).fill(null);
    x[fc] = fr(1);
    pivCols.forEach((pc, i) => { x[pc] = fr(-M[i][fc][0], M[i][fc][1]); });
    const lcm = x.reduce((l, v) => (l * v[1]) / gcd(l, v[1]), 1);
    let ints = x.map((v) => (v[0] * lcm) / v[1]);
    if (ints.every((v) => v <= 0)) ints = ints.map((v) => -v);
    if (!ints.every((v) => v > 0)) return { error: "No balance with all components taking part — one of them may not belong in this reaction." };
    const g = ints.reduce((a, b) => gcd(a, b));
    return { coeffs: ints.map((v) => v / g) };
  }

  // When a set can't be balanced, try adding ONE common small species on
  // either side and report every option that gives a valid balance.
  // Pure arithmetic: suggestions are shown for the user to accept, never applied silently.
  const COMMON_SPECIES = [
    ["Water", "O"], ["Hydrogen chloride", "Cl"], ["Hydrogen bromide", "Br"], ["Carbon dioxide", "O=C=O"],
    ["Sodium chloride", "[Na+].[Cl-]"], ["Sodium bromide", "[Na+].[Br-]"], ["Potassium chloride", "[K+].[Cl-]"],
    ["Methanol", "CO"], ["Ethanol", "CCO"], ["Acetic acid", "CC(=O)O"], ["Ammonia", "N"], ["Sulfur dioxide", "O=S=O"],
    ["Hydrogen", "[H][H]"], ["Nitrogen", "N#N"], ["Oxygen", "O=O"], ["Sodium hydroxide", "[Na+].[OH-]"],
  ];
  function suggestMissing(list) {
    const out = [];
    const present = new Set(list.map((c) => { try { return window.OCL.Molecule.fromSmiles(c.smiles).getIDCode(); } catch (e) { return c.smiles; } }));
    COMMON_SPECIES.forEach(([name, smi]) => {
      const idc = window.OCL.Molecule.fromSmiles(smi).getIDCode();
      if (present.has(idc)) return;
      ["P", "R"].forEach((role) => {
        const extra = { id: -1, role, kind: "by", smiles: smi, coeff: 1 };
        const res = autoBalance(list.concat([extra]));
        if (res.coeffs) out.push({ name, smiles: smi, role, coeffs: res.coeffs, total: res.coeffs.reduce((a, b) => a + b, 0) });
      });
    });
    return out.sort((a, b) => (a.role === "P" ? 0 : 1) - (b.role === "P" ? 0 : 1) || a.total - b.total).slice(0, 4);
  }

  function elementBalance(list) {
    const tot = { R: {}, P: {} }, ch = { R: 0, P: 0 };
    list.forEach((c) => {
      const a = analyze(c.smiles);
      Object.entries(a.counts).forEach(([e, k]) => { tot[c.role][e] = (tot[c.role][e] || 0) + k * c.coeff; });
      ch[c.role] += a.charge * c.coeff;
    });
    const els = [...new Set([...Object.keys(tot.R), ...Object.keys(tot.P)])];
    const rows = els.map((e) => ({ el: e, left: tot.R[e] || 0, right: tot.P[e] || 0 }));
    const ok = rows.every((r) => Math.abs(r.left - r.right) < 1e-9) && Math.abs(ch.R - ch.P) < 1e-9;
    return { rows, ok, chargeL: ch.R, chargeR: ch.P };
  }

  // Batch stoichiometry. Returns per-component results + summary.
  function stoich(list, basis, amt, unit, yld) {
    const R = list.filter((c) => c.role === "R"), P = list.filter((c) => c.role === "P");
    const an = new Map(list.map((c) => [c.id, analyze(c.smiles)]));
    const b = R.find((c) => c.id === basis) || R[0];
    if (!b) return null;
    const bMW = an.get(b.id).mw;
    const bKmol = unit === "kmol" ? amt : amt / bMW;   // pure basis kmol
    const rows = [];
    let limExtent = Infinity, limId = null;
    R.forEach((c) => {
      const mw = an.get(c.id).mw;
      const eq = c.id === b.id ? 1 : num(c.eq, c.coeff / b.coeff);
      const kmol = bKmol * eq;
      const pureKg = kmol * mw;
      const purity = Math.min(100, Math.max(0.0001, num(c.purity, 100)));
      const chargedKg = pureKg / (purity / 100);
      const dens = num(c.density, null);
      const vol = dens ? chargedKg / dens : null;
      const extent = kmol / c.coeff;
      if (extent < limExtent - 1e-12) { limExtent = extent; limId = c.id; }
      rows.push({ c, mw, eq, kmol, pureKg, chargedKg, purity, vol, stoichEq: c.coeff / b.coeff });
    });
    R.forEach((c) => {
      const r = rows.find((x) => x.c.id === c.id);
      r.excessKmol = r.kmol - limExtent * c.coeff; r.excessKg = r.excessKmol * r.mw;   // unreacted (vs limiting reagent)
      r.reqKmol = bKmol * c.coeff / b.coeff;                                           // stoichiometric need vs basis
      r.diffKmol = r.kmol - r.reqKmol; r.diffKg = r.diffKmol * r.mw;                  // + excess / - less
    });
    const prodRows = P.map((c) => {
      const mw = an.get(c.id).mw;
      const kmol = limExtent * c.coeff;
      return { c, mw, kmol, kg: kmol * mw, actualKg: c.kind === "main" ? kmol * mw * yld / 100 : null };
    });
    const main = P.find((c) => c.kind === "main") || null;
    const sumR = R.reduce((s, c) => s + c.coeff * an.get(c.id).mw, 0);
    const atomEcon = main ? (main.coeff * an.get(main.id).mw) / sumR * 100 : null;
    const inPure = rows.reduce((s, r) => s + r.pureKg, 0);
    const inImp = rows.reduce((s, r) => s + (r.chargedKg - r.pureKg), 0);
    const outProd = prodRows.reduce((s, r) => s + r.kg, 0);
    const outExcess = rows.reduce((s, r) => s + r.excessKg, 0);
    return { basis: b, bKmol, rows, prodRows, limId, limExtent, main, atomEcon, inPure, inImp, outProd, outExcess };
  }
  window.PCEReactionTest = { analyze, autoBalance, elementBalance, stoich, suggestMissing };

  // ---------------------------------------------------------------
  // Resolving input -> SMILES
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

  async function resolve(c, rawText) {
    // keep the raw text for the parser: a molfile's first (title) line may be blank
    const raw = rawText || "";
    let text = raw.trim();
    if (!text) return;
    c.status = "busy"; c.msg = ""; render();
    try {
      const P = window.PCEStructPaste;
      const res = P ? P.parseText(raw) : null;
      if (res) { applyToComp(c, res); return; }
      if (/M\s+END/.test(text) || /V2000|V3000|\$RXN/.test(text)) throw new Error("Couldn't read that molfile.");
      const p = await pubchemSmilesByName(text);
      if (!c.label) c.label = text;
      setStructure(c, p.smiles, `PubChem CID ${p.cid}`, p.cid);
    } catch (e) {
      c.status = "err";
      c.msg = e && /molfile/.test(e.message || "") ? e.message : e && e.status === 404 ? `PubChem has no compound named “${text}”. Try another name, paste SMILES, or draw it.`
        : `Not a valid SMILES, and PubChem couldn't be reached for a name search. Paste SMILES or draw the structure.`;
      render();
    }
  }

  // ---- paste / drop / file import ----
  function applyToComp(c, res) {
    if (res.type === "rxn") { importReaction(res); return; }
    let smi = "";
    try { smi = res.mol.toIsomericSmiles(); } catch (e) { smi = res.mol.toSmiles(); }
    c.pending = "";
    setStructure(c, smi, res.note.replace(/^Pasted /, ""));
  }
  function importReaction(res) {
    const hasData = comps.some((c) => c.smiles);
    if (hasData && !window.confirm("Replace the current reaction with the imported one?")) return;
    comps = []; nextId = 1;
    const push = (role, m, i) => {
      let smi = ""; try { smi = m.toIsomericSmiles(); } catch (e) { smi = m.toSmiles(); }
      comps.push({ id: nextId++, role, kind: role === "P" && i > 0 ? "by" : "main", label: "", smiles: smi, source: res.note.replace(/^Pasted /, ""), coeff: 1, purity: 100, density: "", status: "ok" });
    };
    res.reactants.forEach((m, i) => push("R", m, i));
    res.products.forEach((m, i) => push("P", m, i));
    basisId = comps.length ? comps[0].id : null;
    save(); render();
    pageMsg(`Imported ${res.reactants.length} reactant(s) and ${res.products.length} product(s) from ${res.note.replace(/^Pasted /, "")}. Check coefficients (or use Auto-balance) and mark by-products.`, "ok");
  }
  // Where a single pasted/dropped structure goes: the last card you clicked, else the first empty card, else a new reactant
  let activeId = null;
  function targetComp() {
    return byId(activeId) || comps.find((c) => !c.smiles) || (add("R"), comps[comps.length - 1]);
  }
  function pageMsg(text, kind) {
    const el = $("rb-page-msg"); if (!el) return;
    el.textContent = text; el.className = "rb-msg " + (kind === "err" ? "rb-err" : kind === "ok" ? "rb-okm" : "");
  }

  function setStructure(c, smiles, source, cid) {
    c.smiles = smiles; c.source = source; c.cid = cid || null; c.status = "ok"; c.msg = "";
    save(); render();
  }

  // ---------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------
  function molSVG(smiles, w, h) {
    try {
      const m = molFromSmiles(smiles);
      m.inventCoordinates();
      return m.toSVG(w, h, null, { autoCrop: true, autoCropMargin: 8, suppressChiralText: true, suppressESR: true, suppressCIPParity: true, noStereoProblem: true });
    } catch (e) { return ""; }
  }
  const sub = (fml) => esc(fml).replace(/([A-Za-z])(\d+)/g, "$1<sub>$2</sub>");
  const nameOf = (c) => c.label || (c.smiles ? analyze(c.smiles).formula : "(empty)");

  function compCard(c) {
    const a = c.smiles ? safeAnalyze(c.smiles) : null;
    const prodSel = c.role === "P" ? `<select class="rb-kind" data-rb-kind="${c.id}" aria-label="Product type">
        <option value="main"${c.kind === "main" ? " selected" : ""}>Main product</option>
        <option value="by"${c.kind === "by" ? " selected" : ""}>By-product</option></select>` : "";
    return `<div class="rb-card ${c.role === "P" && c.kind === "by" ? "rb-by" : ""}" data-id="${c.id}">
      <div class="rb-card-top">
        <input class="rb-coeff" type="number" min="0" step="any" value="${c.coeff}" data-rb-coeff="${c.id}" aria-label="Coefficient" title="Stoichiometric coefficient">
        <input class="rb-label" type="text" value="${esc(c.label)}" placeholder="Label (optional), e.g. KSM-1" data-rb-label="${c.id}">
        <button type="button" class="rb-x" data-rb-remove="${c.id}" aria-label="Remove">×</button>
      </div>
      ${prodSel}
      <div class="rb-find">
        <input type="text" class="rb-in" data-rb-in="${c.id}" placeholder="Name or SMILES" value="${esc(c.pending || "")}">
        <button type="button" class="pill" data-rb-find="${c.id}">Find</button>
        <button type="button" class="pill" data-rb-draw="${c.id}">Draw</button>
      </div>
      ${c.status === "busy" ? `<div class="rb-msg">Looking up…</div>` : ""}
      ${c.status === "err" ? `<div class="rb-msg rb-err">${esc(c.msg)}</div>` : ""}
      ${a ? `<div class="rb-struct">${molSVG(c.smiles, 220, 130)}</div>
        <div class="rb-meta"><span>${sub(a.formula)}</span><span>MW ${f(a.mw, 2)}</span></div>
        <div class="rb-src">${c.cid ? `<a href="https://pubchem.ncbi.nlm.nih.gov/compound/${c.cid}" target="_blank" rel="noopener">${esc(c.source)}</a>` : esc(c.source || "")}</div>` : `<div class="rb-empty">No structure yet</div>`}
    </div>`;
  }
  function safeAnalyze(s) { try { return analyze(s); } catch (e) { return null; } }

  function equationHTML(ready) {
    const side = (role) => ready.filter((c) => c.role === role).map((c) =>
      `<span class="rb-eq-term">${c.coeff !== 1 ? `<b>${esc(c.coeff)}</b> ` : ""}${esc(nameOf(c))}${c.role === "P" && c.kind === "by" ? ` <em>(by-product)</em>` : ""}</span>`).join(`<span class="rb-eq-op">+</span>`);
    const sideF = (role) => ready.filter((c) => c.role === role).map((c) => `${c.coeff !== 1 ? c.coeff + " " : ""}${sub(analyze(c.smiles).formula)}`).join(" + ");
    return `<div class="rb-eq">${side("R")}<span class="rb-eq-arrow">→</span>${side("P")}</div>
      <div class="rb-eq-f">${sideF("R")} → ${sideF("P")}</div>`;
  }

  function render() {
    const R = comps.filter((c) => c.role === "R"), P = comps.filter((c) => c.role === "P");
    $("rb-reactants").innerHTML = R.map(compCard).join("");
    $("rb-products").innerHTML = P.map(compCard).join("");
    markActive();
    renderResults();
  }

  function markActive() {
    document.querySelectorAll(".rb-card").forEach((el) => el.classList.toggle("rb-active", +el.dataset.id === activeId));
  }

  function renderResults() {
    const out = $("rb-results");
    const ready = comps.filter((c) => c.smiles && safeAnalyze(c.smiles) && c.coeff > 0);
    const R = ready.filter((c) => c.role === "R"), P = ready.filter((c) => c.role === "P");
    const pending = comps.filter((c) => !c.smiles).length;
    if (!R.length || !P.length) {
      out.innerHTML = `<div class="rb-note">Add at least one reactant and one product with a structure to see the equation and calculations.${pending ? ` (${pending} component${pending > 1 ? "s" : ""} still without a structure.)` : ""}</div>`;
      return;
    }
    let html = `<h3 class="rb-h">Equation</h3>${equationHTML(ready)}`;
    if (pending) html += `<div class="rb-note">${pending} component${pending > 1 ? "s have" : " has"} no structure yet and ${pending > 1 ? "are" : "is"} left out of the calculations.</div>`;
    html += `<div class="pill-group rb-eq-actions"><button type="button" class="pill" id="rb-balance">Auto-balance</button><button type="button" class="pill" id="rb-dl-png">Download image</button><button type="button" class="pill" id="rb-print">Print / save as PDF</button><button type="button" class="pill" id="rb-share">Copy link</button><span id="rb-share-msg" class="rb-small"></span></div><div id="rb-balance-msg" class="rb-msg"></div>`;

    // Element balance
    const eb = elementBalance(ready);
    html += `<h3 class="rb-h">Atom balance <span class="rb-badge ${eb.ok ? "rb-ok" : "rb-bad"}">${eb.ok ? "Balanced" : "Not balanced"}</span></h3>
      <div class="rb-scroll"><table class="rb-table rb-bal"><thead><tr><th>Element</th><th>Reactants</th><th>Products</th><th>Difference</th></tr></thead><tbody>
      ${eb.rows.map((r) => { const d = r.right - r.left; return `<tr><td>${esc(r.el)}</td><td>${f(r.left, fracDigits(r.left))}</td><td>${f(r.right, fracDigits(r.right))}</td><td class="${Math.abs(d) < 1e-9 ? "rb-okc" : "rb-badc"}">${Math.abs(d) < 1e-9 ? "✓" : (d > 0 ? "+" : "") + f(d, fracDigits(d))}</td></tr>`; }).join("")}
      ${eb.chargeL || eb.chargeR ? `<tr><td>Charge</td><td>${eb.chargeL}</td><td>${eb.chargeR}</td><td class="${eb.chargeL === eb.chargeR ? "rb-okc" : "rb-badc"}">${eb.chargeL === eb.chargeR ? "✓" : eb.chargeR - eb.chargeL}</td></tr>` : ""}
      </tbody></table></div>
      ${eb.ok ? "" : `<div class="rb-note">A positive difference means the products have more of that element than the reactants. Check the coefficients, or whether a reactant, product or by-product is missing — or use Auto-balance.</div>`}`;

    // Stoichiometry
    if (!R.some((c) => c.id === basisId)) basisId = R[0].id;
    const s = stoich(ready, basisId, basisAmt, basisUnit, yieldPct);
    html += `<h3 class="rb-h">Batch stoichiometry</h3>
      <div class="pill-group rb-view"><button type="button" class="pill${viewMode === "table" ? " active" : ""}" data-rb-view="table">Table view</button><button type="button" class="pill${viewMode === "sheet" ? " active" : ""}" data-rb-view="sheet">Batch sheet view</button><button type="button" class="pill" id="rb-xlsx">Download Excel</button><span id="rb-xlsx-msg" class="rb-small"></span></div>
      <div class="rb-basis">
        <label>Basis reactant <select id="rb-basis">${R.map((c) => `<option value="${c.id}"${c.id === basisId ? " selected" : ""}>${esc(nameOf(c))}</option>`).join("")}</select></label>
        <label>Amount (pure) <input id="rb-amt" type="number" step="any" min="0" value="${basisAmt}"></label>
        <label>Unit <select id="rb-unit"><option value="kg"${basisUnit === "kg" ? " selected" : ""}>kg</option><option value="kmol"${basisUnit === "kmol" ? " selected" : ""}>kmol</option></select></label>
        <label>Main product yield % <input id="rb-yield" type="number" step="any" min="0" max="100" value="${yieldPct}"></label>
      </div>
      ${viewMode === "sheet" ? sheetHTML(s) : ""}
      <div class="rb-scroll"${viewMode === "sheet" ? " hidden" : ""}><table class="rb-table">
        <thead><tr><th>Reactant</th><th>MW</th><th>Equiv.</th><th>kmol</th><th>Pure kg</th><th>kmol required</th><th>Excess/less kmol</th><th>Excess/less kg</th><th>Purity %</th><th>Charge kg</th><th>Density kg/L</th><th>Volume L</th></tr></thead><tbody>
        ${s.rows.map((r) => `<tr class="${r.c.id === s.limId ? "rb-lim" : ""}">
          <td>${esc(nameOf(r.c))}${r.c.id === s.limId ? ` <span class="rb-tag">limiting</span>` : ""}${r.c.id === s.basis.id ? ` <span class="rb-tag rb-tag-b">basis</span>` : ""}</td>
          <td>${f(r.mw, 2)}</td>
          <td>${r.c.id === s.basis.id ? "1.000" : `<input type="number" step="any" min="0" class="rb-cell" data-rb-eq="${r.c.id}" value="${+r.eq.toFixed(4)}">`}</td>
          <td>${f(r.kmol, 4)}</td><td>${f(r.pureKg, 2)}</td>
          <td>${f(r.reqKmol, 4)}</td>${diffCells(r)}
          <td><input type="number" step="any" min="0" max="100" class="rb-cell" data-rb-purity="${r.c.id}" value="${r.purity}"></td>
          <td><b>${f(r.chargedKg, 2)}</b></td>
          <td><input type="number" step="any" min="0" class="rb-cell" data-rb-density="${r.c.id}" value="${r.c.density || ""}" placeholder="—"></td>
          <td>${r.vol ? f(r.vol, 1) : "—"}</td></tr>`).join("")}
        </tbody></table></div>
      <div class="rb-small">Equiv. = moles of this reactant per mole of the basis reactant (defaults to the stoichiometric ratio). kmol required = stoichiometric need for the basis amount; Excess/less = charged minus required (negative = less than required). Limiting reagent = the reactant that runs out first given the equivalents charged.</div>
      <div class="rb-scroll"${viewMode === "sheet" ? " hidden" : ""}><table class="rb-table" style="margin-top:12px;">
        <thead><tr><th>Product</th><th>Type</th><th>MW</th><th>kmol (theor.)</th><th>kg (theor.)</th><th>kg at ${f(yieldPct, 1)}% yield</th></tr></thead><tbody>
        ${s.prodRows.map((r) => `<tr><td>${esc(nameOf(r.c))}</td><td>${r.c.kind === "main" ? "Main product" : "By-product"}</td><td>${f(r.mw, 2)}</td><td>${f(r.kmol, 4)}</td><td>${f(r.kg, 2)}</td><td>${r.actualKg !== null ? `<b>${f(r.actualKg, 2)}</b>` : "—"}</td></tr>`).join("")}
        </tbody></table></div>`;

    // Metrics + mass balance
    const mainCount = P.filter((c) => c.kind === "main").length;
    html += `<h3 class="rb-h">Metrics &amp; theoretical mass balance</h3><div class="rb-grid">
      <div class="readout rb-cell-r"><span class="lbl">Atom economy</span><span class="val">${s.atomEcon !== null ? f(s.atomEcon, 1) + "%" : "—"}</span><span class="rb-sub">${mainCount === 1 ? "main product MW × coeff ÷ Σ reactant MW × coeff" : mainCount === 0 ? "mark one product as the main product" : "uses the first main product"}</span></div>
      <div class="readout rb-cell-r"><span class="lbl">In — pure reactants</span><span class="val">${f(s.inPure, 2)} kg</span><span class="rb-sub">${s.inImp > 0.005 ? `+ ${f(s.inImp, 2)} kg impurities (from purity %)` : "no impurities entered"}</span></div>
      <div class="readout rb-cell-r"><span class="lbl">Out — products + unreacted excess</span><span class="val">${f(s.outProd + s.outExcess, 2)} kg</span><span class="rb-sub">${f(s.outProd, 2)} kg products + ${f(s.outExcess, 2)} kg excess reactants</span></div>
    </div>
    <div class="rb-small">The mass balance assumes the limiting reagent is fully converted (before yield losses). In and Out match only when the equation is balanced${eb.ok ? " — difference here: " + f(Math.abs(s.inPure - s.outProd - s.outExcess) < 0.0005 ? 0 : s.inPure - s.outProd - s.outExcess, 3) + " kg" : ""}.</div>`;
    out.innerHTML = html;
  }
  function diffCells(r) {
    const cls = Math.abs(r.diffKmol) < 1e-9 ? "" : r.diffKmol > 0 ? "rb-exc" : "rb-less";
    return `<td class="${cls}">${f(r.diffKmol, 4)}</td><td class="${cls}">${f(r.diffKg, 2)}${r.diffKmol < -1e-9 ? " <span class=\"rb-tag rb-tag-less\">less</span>" : ""}</td>`;
  }

  // Batch-sheet layout: components across, quantities down (like a plant batch sheet)
  function sheetHTML(s) {
    const R = s.rows, P = s.prodRows;
    const anyPur = R.some((r) => r.purity < 100);
    const head = R.map((r, i) => `${i ? '<th class="rb-sh-op">+</th>' : ""}<th><span class="rb-sh-co">${esc(r.c.coeff)}</span> ${esc(nameOf(r.c))}</th>`).join("") +
      `<th class="rb-sh-op">\u2192</th>` +
      P.map((r, i) => `${i ? '<th class="rb-sh-op">+</th>' : ""}<th><span class="rb-sh-co">${esc(r.c.coeff)}</span> ${esc(nameOf(r.c))}${r.c.kind === "by" ? ' <em>by-product</em>' : ""}</th>`).join("");
    const row = (label, rf, pf, cls) => `<tr class="${cls || ""}"><td>${label}</td>` +
      R.map((r, i) => `${i ? "<td></td>" : ""}<td>${rf ? rf(r) : ""}</td>`).join("") + `<td></td>` +
      P.map((r, i) => `${i ? "<td></td>" : ""}<td>${pf ? pf(r) : ""}</td>`).join("") + `</tr>`;
    const dc = (r, v, d) => `<span class="${Math.abs(r.diffKmol) < 1e-9 ? "" : r.diffKmol > 0 ? "rb-exc" : "rb-less"}">${f(v, d)}</span>`;
    return `<div class="rb-scroll"><table class="rb-table rb-sheet">
      <thead><tr><th></th>${head}</tr></thead><tbody>
      ${row("MW", (r) => f(r.mw, 3), (r) => f(r.mw, 3))}
      ${row("Qty (kg)", (r) => `<b>${f(r.pureKg, 2)}</b>`, (r) => `<b>${f(r.kg, 2)}</b>`)}
      ${row("Kmol", (r) => f(r.kmol, 4), (r) => f(r.kmol, 4))}
      ${row("M Eq", (r) => f(r.eq, 2), null)}
      ${anyPur ? row("Purity %", (r) => f(r.purity, 1), null) + row("Charge qty (kg)", (r) => f(r.chargedKg, 2), null) : ""}
      ${row("&nbsp;", null, null, "rb-sh-gap")}
      ${row("kmoles required", (r) => f(r.reqKmol, 4), null)}
      ${row("Excess/less kmol", (r) => dc(r, r.diffKmol, 4), null)}
      ${row("Excess/less kg", (r) => dc(r, r.diffKg, 2), null)}
      ${s.main ? row(`Qty at ${f(yieldPct, 1)}% yield (kg)`, null, (r) => (r.actualKg !== null ? `<b>${f(r.actualKg, 2)}</b>` : "")) : ""}
      </tbody></table></div>
      <div class="rb-small">Product quantities are theoretical (full conversion of the limiting reagent: ${esc(nameOf(s.rows.find((r) => r.c.id === s.limId).c))}). Excess/less is measured against the stoichiometric need for the basis amount.</div>`;
  }

  // ---------- Excel export (ExcelJS, loaded on demand) ----------
  const EXCELJS_URL = "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";
  function loadExcelJS() {
    if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
    return new Promise((res, rej) => {
      const sc = document.createElement("script");
      sc.src = EXCELJS_URL; sc.async = true;
      sc.onload = () => (window.ExcelJS ? res(window.ExcelJS) : rej(new Error("ExcelJS missing")));
      sc.onerror = () => rej(new Error("load failed"));
      document.head.appendChild(sc);
    });
  }
  function equationPNG() {
    return new Promise((resolve) => {
      const svg = equationSVG();
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0);
        resolve({ data: c.toDataURL("image/png"), w: c.width, h: c.height });
      };
      img.onerror = () => resolve(null);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }
  function colName(n) { let s = ""; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }

  async function downloadExcel() {
    const msg = $("rb-xlsx-msg");
    const ready = comps.filter((c) => c.smiles && safeAnalyze(c.smiles) && c.coeff > 0);
    const s = stoich(ready, basisId, basisAmt, basisUnit, yieldPct);
    if (!s) return;
    msg.textContent = "Preparing Excel\u2026";
    let ExcelJS;
    try { ExcelJS = await loadExcelJS(); } catch (e) { msg.textContent = "Couldn't load the Excel library \u2014 check your connection and try again."; return; }
    const wb = new ExcelJS.Workbook();
    wb.creator = "PharmaChemE Reaction Builder";
    const ws = wb.addWorksheet("Batch sheet", { views: [{ showGridLines: false }], pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
    const R = s.rows, P = s.prodRows;
    // Column layout: A = labels, then reactants, arrow column, products
    const colOf = {}; let ci = 1;
    R.forEach((r) => { colOf[r.c.id] = ci++; });
    const arrowCol = ci++;
    P.forEach((r) => { colOf[r.c.id] = ci++; });
    const lastCol = ci - 1;
    ws.getColumn(1).width = 26;
    for (let k = 2; k <= lastCol + 1; k++) ws.getColumn(k).width = 18;
    ws.getColumn(arrowCol + 1).width = 6;
    const A = (id) => colName(colOf[id]);          // column letter for a component
    const thin = { style: "thin", color: { argb: "FF9E9E9E" } };

    // Title
    const title = (s.main ? nameOf(s.main) : "Reaction") + " \u2014 batch stoichiometry";
    ws.mergeCells(1, 1, 1, lastCol + 1);
    Object.assign(ws.getCell(1, 1), { value: title });
    ws.getCell(1, 1).font = { bold: true, size: 13 };
    ws.getCell(1, 1).alignment = { horizontal: "center" };
    ws.getCell(1, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCE4D6" } };
    ws.getCell(1, 1).border = { top: thin, left: thin, bottom: thin, right: thin };

    // Reaction scheme image
    let r0 = 3;
    const png = await equationPNG();
    if (png) {
      const id = wb.addImage({ base64: png.data, extension: "png" });
      const maxW = Math.min(1100, 26 * 7 + lastCol * 18 * 7);
      const sc = Math.min(1, maxW / png.w);
      const w = png.w * sc, h = png.h * sc;
      ws.addImage(id, { tl: { col: 0.2, row: 1.2 }, ext: { width: w, height: h } });
      const rowsNeeded = Math.ceil(h / 20) + 1;
      for (let k = 2; k < 2 + rowsNeeded; k++) ws.getRow(k).height = 15;
      r0 = 2 + rowsNeeded + 1;
    }

    // Header: coefficient + name
    const hdr = r0, rowNo = {};
    const labels = ["Coefficient", "MW", "M Eq", "Qty (kg)", "Kmol", "Purity %", "Charge qty (kg)", "", "kmoles required", "Excess/less kmol", "Excess/less kg", "", "Limiting extent (kmol)", "Unreacted kg", "", "Yield %", "Qty at yield (kg)"];
    ws.getCell(hdr, 1).value = "";
    R.concat(P).forEach((r) => {
      const cell = ws.getCell(hdr, colOf[r.c.id] + 1);
      cell.value = nameOf(r.c) + (r.c.kind === "by" && r.c.role === "P" ? " (by-product)" : "");
      cell.font = { bold: true }; cell.alignment = { horizontal: "center", wrapText: true };
    });
    ws.getCell(hdr, arrowCol + 1).value = "\u2192"; ws.getCell(hdr, arrowCol + 1).alignment = { horizontal: "center" };
    ws.getCell(hdr, arrowCol + 1).font = { bold: true, size: 14 };
    ws.getRow(hdr).height = 32;
    labels.forEach((l, i) => { rowNo[l || "gap" + i] = hdr + 1 + i; ws.getCell(hdr + 1 + i, 1).value = l; if (l) ws.getCell(hdr + 1 + i, 1).font = { bold: true }; });
    const RC = (label, id) => `${A(id)}${rowNo[label]}`;   // e.g. "B7"
    const put = (label, id, v, fmt, input) => {
      const cell = ws.getCell(rowNo[label], colOf[id] + 1);
      cell.value = v;
      if (fmt) cell.numFmt = fmt;
      cell.alignment = { horizontal: "right" };
      if (input) { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } }; cell.font = { color: { argb: "FF1F4E79" } }; }
    };
    const b = s.basis, bK = RC("Kmol", b.id), bCo = RC("Coefficient", b.id);
    // Reactants
    R.forEach((r) => {
      const id = r.c.id;
      put("Coefficient", id, r.c.coeff, "0.###", true);
      put("MW", id, r.mw, "0.000");
      if (id === b.id) {
        put("M Eq", id, 1, "0.00");
        put("Qty (kg)", id, +r.pureKg.toFixed(4), "0.00", true);
        put("Kmol", id, { formula: `${RC("Qty (kg)", id)}/${RC("MW", id)}` }, "0.0000");
      } else {
        put("M Eq", id, +r.eq.toFixed(4), "0.00", true);
        put("Kmol", id, { formula: `${bK}*${RC("M Eq", id)}` }, "0.0000");
        put("Qty (kg)", id, { formula: `${RC("Kmol", id)}*${RC("MW", id)}` }, "0.00");
      }
      put("Purity %", id, r.purity, "0.0", true);
      put("Charge qty (kg)", id, { formula: `${RC("Qty (kg)", id)}/(${RC("Purity %", id)}/100)` }, "0.00");
      put("kmoles required", id, { formula: `${bK}*${RC("Coefficient", id)}/${bCo}` }, "0.0000");
      put("Excess/less kmol", id, { formula: `${RC("Kmol", id)}-${RC("kmoles required", id)}` }, "0.0000;[Red]-0.0000");
      put("Excess/less kg", id, { formula: `${RC("Excess/less kmol", id)}*${RC("MW", id)}` }, "0.00;[Red]-0.00");
      put("Unreacted kg", id, { formula: `(${RC("Kmol", id)}-$B$${rowNo["Limiting extent (kmol)"]}*${RC("Coefficient", id)})*${RC("MW", id)}` }, "0.00");
    });
    // Limiting extent = MIN(kmol / coefficient) over reactants
    const extCell = ws.getCell(rowNo["Limiting extent (kmol)"], 2);
    extCell.value = { formula: `MIN(${R.map((r) => `${RC("Kmol", r.c.id)}/${RC("Coefficient", r.c.id)}`).join(",")})` };
    extCell.numFmt = "0.0000"; extCell.alignment = { horizontal: "right" };
    const ext = `$B$${rowNo["Limiting extent (kmol)"]}`;
    // Products
    P.forEach((r) => {
      const id = r.c.id;
      put("Coefficient", id, r.c.coeff, "0.###", true);
      put("MW", id, r.mw, "0.000");
      put("Kmol", id, { formula: `${ext}*${RC("Coefficient", id)}` }, "0.0000");
      put("Qty (kg)", id, { formula: `${RC("Kmol", id)}*${RC("MW", id)}` }, "0.00");
      if (r.c.kind === "main") {
        put("Yield %", id, yieldPct, "0.0", true);
        put("Qty at yield (kg)", id, { formula: `${RC("Qty (kg)", id)}*${RC("Yield %", id)}/100` }, "0.00");
      }
    });
    // Borders on the table block
    for (let rr = hdr; rr <= hdr + labels.length; rr++) for (let cc = 1; cc <= lastCol + 1; cc++) {
      const cell = ws.getCell(rr, cc);
      cell.border = { top: rr === hdr ? thin : undefined, bottom: thin, left: cc === 1 ? thin : undefined, right: cc === lastCol + 1 ? thin : undefined };
    }
    // Mass balance
    let mb = hdr + labels.length + 2;
    const sumR = R.map((r) => RC("Qty (kg)", r.c.id)).join(",");
    const sumU = R.map((r) => RC("Unreacted kg", r.c.id)).join(",");
    const sumP = P.map((r) => RC("Qty (kg)", r.c.id)).join(",");
    const mbRows = [
      ["Mass balance (theoretical)", null],
      ["In \u2014 pure reactants (kg)", `SUM(${sumR})`],
      ["Out \u2014 products (kg)", `SUM(${sumP})`],
      ["Out \u2014 unreacted excess (kg)", `SUM(${sumU})`],
      ["Difference In \u2212 Out (kg)", `B${mb + 1}-B${mb + 2}-B${mb + 3}`],
    ];
    mbRows.forEach(([l, fml], i) => {
      ws.getCell(mb + i, 1).value = l; ws.getCell(mb + i, 1).font = { bold: true };
      if (fml) { const c = ws.getCell(mb + i, 2); c.value = { formula: fml }; c.numFmt = "0.00"; }
    });
    const nt = mb + mbRows.length + 1;
    ws.getCell(nt, 1).value = "Yellow cells are inputs \u2014 change them and the sheet recalculates. Product quantities assume full conversion of the limiting reagent.";
    ws.getCell(nt, 1).font = { italic: true, color: { argb: "FF666666" } };
    ws.getCell(nt + 1, 1).value = `Generated by PharmaChemE Reaction Builder (pharmacheme.in) on ${new Date().toISOString().slice(0, 10)}. Equation: ${ready.filter((c) => c.role === "R").map((c) => (c.coeff !== 1 ? c.coeff + " " : "") + analyze(c.smiles).formula).join(" + ")} \u2192 ${ready.filter((c) => c.role === "P").map((c) => (c.coeff !== 1 ? c.coeff + " " : "") + analyze(c.smiles).formula).join(" + ")}`;
    ws.getCell(nt + 1, 1).font = { color: { argb: "FF666666" }, size: 9 };

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (s.main ? nameOf(s.main) : "reaction").replace(/[^A-Za-z0-9-]+/g, "_").slice(0, 60) + "_batch_sheet.xlsx";
    document.body.appendChild(a); a.click(); a.remove();
    msg.textContent = "";
  }

  function fracDigits(v) { return Math.abs(v - Math.round(v)) < 1e-9 ? 0 : 2; }

  // ---------------------------------------------------------------
  // Export / share / persist
  // ---------------------------------------------------------------
  function equationSVG() {
    const ready = comps.filter((c) => c.smiles && safeAnalyze(c.smiles) && c.coeff > 0);
    const W = 200, H = 150, gap = 44;
    const items = [];
    const push = (role) => ready.filter((c) => c.role === role).forEach((c, i) => { if (i) items.push({ op: "+" }); items.push({ c }); });
    push("R"); items.push({ op: "→" }); push("P");
    let x = 10, parts = [];
    items.forEach((it) => {
      if (it.op) { parts.push(`<text x="${x + gap / 2}" y="${H / 2 + 8}" font-family="Arial" font-size="${it.op === "+" ? 26 : 30}" text-anchor="middle">${it.op}</text>`); x += gap; return; }
      const c = it.c;
      let svg = molSVG(c.smiles, W, H).replace(/<svg[^>]*>/, `<svg x="${x}" y="0" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
      parts.push(svg);
      const lbl = (c.coeff !== 1 ? c.coeff + " " : "") + nameOf(c);
      parts.push(`<text x="${x + W / 2}" y="${H + 20}" font-family="Arial" font-size="14" text-anchor="middle">${esc(lbl)}</text>`);
      x += W;
    });
    const total = x + 10;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${H + 34}" viewBox="0 0 ${total} ${H + 34}"><rect width="100%" height="100%" fill="#fff"/>${parts.join("")}</svg>`;
  }
  function downloadPNG() {
    const svg = equationSVG();
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth * 2; c.height = img.naturalHeight * 2;
      const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "reaction.png"; document.body.appendChild(a); a.click(); a.remove(); }, "image/png");
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function stateObj() {
    return { v: 1, c: comps.map((c) => ({ r: c.role, k: c.kind, l: c.label, s: c.smiles, o: c.source, i: c.cid, n: c.coeff, e: c.eq, p: c.purity, d: c.density })), b: comps.findIndex((c) => c.id === basisId), a: basisAmt, u: basisUnit, y: yieldPct, vm: viewMode, t: Date.now() };
  }
  function loadState(o) {
    if (!o || !Array.isArray(o.c)) return false;
    comps = o.c.map((x) => ({ id: nextId++, role: x.r === "P" ? "P" : "R", kind: x.k === "by" ? "by" : "main", label: x.l || "", smiles: x.s || "", source: x.o || "", cid: x.i || null, coeff: num(x.n, 1), eq: x.e, purity: num(x.p, 100), density: x.d || "", status: x.s ? "ok" : "" }));
    basisId = comps[o.b] ? comps[o.b].id : null;
    basisAmt = num(o.a, 100); basisUnit = o.u === "kmol" ? "kmol" : "kg"; yieldPct = num(o.y, 100); viewMode = o.vm === "sheet" ? "sheet" : "table";
    return true;
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(stateObj())); } catch (e) { /* ignore */ }
  }
  // Notice shown when the page restores a reaction saved in this browser
  function showSavedNote(ts) {
    const el = $("rb-saved-note"); if (!el) return;
    const when = ts ? new Date(ts).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
    el.innerHTML = `<span>Restored your last reaction${when ? `, saved in this browser on <b>${esc(when)}</b>` : " saved in this browser"}. It is stored only on this device \u2014 not on the website.</span><button type="button" class="pill" id="rb-forget">Clear saved reaction</button>`;
    el.hidden = false;
  }
  function forgetSaved() {
    comps = []; nextId = 1; basisId = null; basisAmt = 100; basisUnit = "kg"; yieldPct = 100;
    add("R"); add("R"); add("P"); add("P");
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    const el = $("rb-saved-note");
    el.innerHTML = `<span>Saved reaction cleared from this browser.</span>`;
    setTimeout(() => { el.hidden = true; }, 2500);
  }

  function shareURL() {
    return location.origin + location.pathname + "#r=" + encodeURIComponent(JSON.stringify(stateObj()));
  }

  // ---------------------------------------------------------------
  // Draw dialog
  // ---------------------------------------------------------------
  function openDraw(c) {
    drawTarget = c;
    const dlg = $("rb-dialog");
    dlg.hidden = false;
    document.body.style.overflow = "hidden";
    if (!drawEditor) drawEditor = new window.OCL.CanvasEditor($("rb-draw-editor"), { initialMode: "molecule" });
    try {
      if (c.smiles) { const m = molFromSmiles(c.smiles); m.inventCoordinates(); drawEditor.setMolecule(m); }
      else drawEditor.clearAll();
    } catch (e) { drawEditor.clearAll(); }
  }
  function closeDraw(useIt) {
    if (useIt && drawTarget) {
      const m = drawEditor.getMolecule();
      if (m && m.getAllAtoms()) setStructure(drawTarget, m.toIsomericSmiles(), "Drawn");
    }
    $("rb-dialog").hidden = true;
    document.body.style.overflow = "";
    drawTarget = null;
  }

  // ---------------------------------------------------------------
  // Init & events
  // ---------------------------------------------------------------
  function add(role) {
    const c = { id: nextId++, role, kind: role === "P" && comps.some((x) => x.role === "P" && x.kind === "main") ? "by" : "main", label: "", smiles: "", source: "", coeff: 1, purity: 100, density: "" };
    comps.push(c); save(); render();
    const inp = document.querySelector(`[data-rb-in="${c.id}"]`); if (inp) inp.focus();
  }
  const byId = (id) => comps.find((c) => c.id === +id);

  function shell() {
    return `
      ${typeof plateHeader === "function" ? plateHeader("PharmaChemE Reaction Builder", "EQUATION — BALANCE — STOICHIOMETRY") : ""}
      <div id="rb-saved-note" class="rb-saved" hidden></div>
      <p class="rb-intro">Add each reactant and product one at a time: type a <b>name</b> (looked up on PubChem), paste <b>SMILES</b>, or <b>draw</b> the structure. Give it a label if it has no common name (e.g. KSM-1, Intermediate B).</p>
      <div class="rb-import">
        <div class="rb-import-row"><input type="text" id="rb-rxn-in" placeholder="Or import a whole reaction: paste reaction SMILES, e.g. CC(=O)O.OCC>>CCOC(C)=O.O" spellcheck="false"><button type="button" class="pill" id="rb-rxn-go">Import</button><button type="button" class="pill" id="rb-rxn-file">Open file</button></div>
        <div class="rb-small">Paste shortcuts: press <b>Ctrl+V</b> anywhere on the page with SMILES or MOL text copied (ChemDraw: Edit \u2192 Copy As) \u2014 it goes into the component you last clicked. A reaction SMILES or .rxn file fills the whole reaction. You can also drop a .mol / .sdf / .rxn file onto a component card.</div>
        <div id="rb-page-msg" class="rb-msg"></div>
      </div>
      <div class="rb-cols">
        <section><div class="rb-col-head"><h3>Reactants</h3><button type="button" class="pill active" data-rb-add="R">+ Add reactant</button></div><div id="rb-reactants" class="rb-list"></div></section>
        <div class="rb-arrow" aria-hidden="true">→</div>
        <section><div class="rb-col-head"><h3>Products</h3><button type="button" class="pill active" data-rb-add="P">+ Add product</button></div><div id="rb-products" class="rb-list"></div></section>
      </div>
      <div class="pill-group" style="margin-top:12px;"><span class="rb-small" style="align-self:center;">Example:</span><button type="button" class="pill" id="rb-example">Esterification</button><button type="button" class="pill" id="rb-reset" style="border-color:var(--rust); color:var(--rust);">Clear all</button></div>
      <div id="rb-results"></div>
      <p class="rb-foot">Formulas and molecular weights are calculated from the structures by OpenChemLib in your browser. Names are looked up on PubChem only when you press Find with a name (that sends the name, not your structures). Stoichiometry is theoretical: it does not account for side reactions, solubility or losses beyond the yield % you enter.</p>
      <div id="rb-dialog" class="rb-dialog" hidden role="dialog" aria-modal="true" aria-label="Draw structure">
        <div class="rb-dialog-box">
          <div class="rb-dialog-head"><b>Draw structure</b><span class="rb-small">Use the tools on the left — same editor as the Structure Builder.</span></div>
          <div id="rb-draw-editor" class="rb-draw-editor"></div>
          <div class="pill-group" style="justify-content:flex-end; margin-top:10px;"><button type="button" class="pill" id="rb-draw-cancel">Cancel</button><button type="button" class="pill active" id="rb-draw-ok">Use this structure</button></div>
        </div>
      </div>`;
  }

  function loadExample() {
    comps = []; nextId = 1;
    const ex = [
      ["R", "main", "Acetic acid", "CC(=O)O"], ["R", "main", "Ethanol", "CCO"],
      ["P", "main", "Ethyl acetate", "CCOC(C)=O"], ["P", "by", "Water", "O"],
    ];
    ex.forEach(([r, k, l, s]) => comps.push({ id: nextId++, role: r, kind: k, label: l, smiles: s, source: "SMILES", coeff: 1, purity: 100, density: "", status: "ok" }));
    basisId = comps[0].id; basisAmt = 100; basisUnit = "kg"; yieldPct = 100;
    save(); render();
  }

  function init() {
    const mount = $("calc-mount");
    if (!mount) return;
    if (!window.OCL) { mount.innerHTML = `<p style="color:var(--rust)">The chemistry engine did not load. Please reload the page.</p>`; return; }
    mount.innerHTML = shell();

    let loaded = false;
    try { const m = location.hash.match(/^#r=(.*)$/); if (m) loaded = loadState(JSON.parse(decodeURIComponent(m[1]))); } catch (e) { /* ignore */ }
    if (!loaded) {
      try {
        const o = JSON.parse(localStorage.getItem(STORE_KEY));
        loaded = loadState(o);
        if (loaded && comps.some((c) => c.smiles)) showSavedNote(o.t);
      } catch (e) { /* ignore */ }
    }
    if (!loaded || !comps.length) { comps = []; add("R"); add("R"); add("P"); add("P"); }
    render();

    mount.addEventListener("click", (e) => {
      const t = e.target;
      const vw = t.closest("[data-rb-view]"); if (vw) { viewMode = vw.dataset.rbView; save(); renderResults(); return; }
      if (t.id === "rb-xlsx") { downloadExcel(); return; }
      const sg = t.closest("[data-rb-sugg]");
      if (sg) {
        const g = lastSugg[+sg.dataset.rbSugg]; if (!g) return;
        const ready = comps.filter((c) => c.smiles && safeAnalyze(c.smiles));
        const nc = { id: nextId++, role: g.role, kind: g.role === "P" ? "by" : "main", label: g.name, smiles: g.smiles, source: "Added to balance", coeff: 1, purity: 100, density: "", status: "ok" };
        comps.push(nc);
        ready.concat([nc]).forEach((c, i) => { c.coeff = g.coeffs[i]; c.eq = undefined; });
        save(); render();
        $("rb-balance-msg").textContent = `Added ${g.name.toLowerCase()} and balanced with the smallest whole-number coefficients.`;
        $("rb-balance-msg").className = "rb-msg rb-okm";
        return;
      }
      const a = t.closest("[data-rb-add]"); if (a) { add(a.dataset.rbAdd); return; }
      const rm = t.closest("[data-rb-remove]"); if (rm) { comps = comps.filter((c) => c.id !== +rm.dataset.rbRemove); save(); render(); return; }
      const fd = t.closest("[data-rb-find]"); if (fd) { const c = byId(fd.dataset.rbFind); const inp = document.querySelector(`[data-rb-in="${c.id}"]`); c.pending = ""; resolve(c, inp.value); return; }
      const dr = t.closest("[data-rb-draw]"); if (dr) { openDraw(byId(dr.dataset.rbDraw)); return; }
      switch (t.id) {
        case "rb-example": loadExample(); break;
        case "rb-reset": comps = []; nextId = 1; add("R"); add("R"); add("P"); add("P"); try { localStorage.removeItem(STORE_KEY); } catch (e2) { /* ignore */ } break;
        case "rb-forget": forgetSaved(); break;
        case "rb-draw-ok": closeDraw(true); break;
        case "rb-draw-cancel": closeDraw(false); break;
        case "rb-print": window.print(); break;
        case "rb-dl-png": downloadPNG(); break;
        case "rb-share": {
          const msg = $("rb-share-msg");
          navigator.clipboard.writeText(shareURL()).then(() => { msg.textContent = "Link copied"; }, () => { msg.textContent = "Couldn't copy"; });
          setTimeout(() => { msg.textContent = ""; }, 2000); break;
        }
        case "rb-balance": {
          const ready = comps.filter((c) => c.smiles && safeAnalyze(c.smiles));
          const res = autoBalance(ready);
          if (res.error) {
            const sug = suggestMissing(ready);
            const box = $("rb-balance-msg");
            box.className = "rb-msg rb-err";
            box.innerHTML = esc(res.error) + (sug.length
              ? `<div class="rb-sugg"><span>These single additions would balance it \u2014 pick one only if it fits your chemistry:</span>${sug.map((g, i) => `<button type="button" class="pill" data-rb-sugg="${i}">Add ${esc(g.name.toLowerCase())} as ${g.role === "P" ? "by-product" : "reactant"}</button>`).join("")}</div>`
              : `<div class="rb-sugg"><span>No single common species (water, HCl, CO\u2082, NaCl, methanol\u2026) fixes it \u2014 check each structure and whether more than one component is missing.</span></div>`);
            lastSugg = sug;
            return;
          }
          ready.forEach((c, i) => { c.coeff = res.coeffs[i]; c.eq = undefined; });
          save(); render();
          $("rb-balance-msg").textContent = "Balanced with the smallest whole-number coefficients."; $("rb-balance-msg").className = "rb-msg rb-okm";
          break;
        }
      }
    });
    mount.addEventListener("keydown", (e) => {
      const inp = e.target.closest("[data-rb-in]");
      if (inp && e.key === "Enter") { e.preventDefault(); const c = byId(inp.dataset.rbIn); resolve(c, inp.value); }
    });
    mount.addEventListener("input", (e) => {
      const t = e.target;
      if (t.dataset.rbIn) { byId(t.dataset.rbIn).pending = t.value; return; }
      if (t.dataset.rbLabel) { byId(t.dataset.rbLabel).label = t.value; save(); renderResults(); return; }
    });
    mount.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.rbCoeff) { const c = byId(t.dataset.rbCoeff); c.coeff = Math.max(0, num(t.value, 1)); c.eq = undefined; comps.forEach((x) => { x.eq = undefined; }); }
      else if (t.dataset.rbKind) byId(t.dataset.rbKind).kind = t.value;
      else if (t.dataset.rbEq) byId(t.dataset.rbEq).eq = num(t.value, undefined);
      else if (t.dataset.rbPurity) byId(t.dataset.rbPurity).purity = num(t.value, 100);
      else if (t.dataset.rbDensity) byId(t.dataset.rbDensity).density = t.value;
      else if (t.id === "rb-basis") { basisId = +t.value; comps.forEach((x) => { x.eq = undefined; }); }
      else if (t.id === "rb-amt") basisAmt = Math.max(0, num(t.value, 0));
      else if (t.id === "rb-unit") basisUnit = t.value;
      else if (t.id === "rb-yield") yieldPct = Math.min(100, Math.max(0, num(t.value, 100)));
      else return;
      save();
      if (t.dataset.rbCoeff || t.dataset.rbKind) render(); else renderResults();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("rb-dialog").hidden) closeDraw(false); });

    // Track the card the user last clicked (target for page-level paste)
    mount.addEventListener("pointerdown", (e) => { const card = e.target.closest(".rb-card"); if (card) { activeId = +card.dataset.id; markActive(); } });
    const P = window.PCEStructPaste;
    if (P) {
      const onRes = (res) => {
        if (res.type === "rxn") { importReaction(res); return; }
        const c = targetComp(); activeId = c.id; applyToComp(c, res); markActive();
        pageMsg(`${res.note} \u2192 ${c.role === "R" ? "reactant" : "product"} ${comps.filter((x) => x.role === c.role).indexOf(c) + 1}.`, "ok");
      };
      P.attach({ onResult: onRes, onError: (m) => pageMsg(m, "err"), canPaste: () => $("rb-dialog").hidden });
      $("rb-rxn-file").addEventListener("click", P.filePicker(onRes, (m) => pageMsg(m, "err")));
      const doImport = () => {
        const t = $("rb-rxn-in").value.trim(); if (!t) return;
        const res = P.parseText(t);
        if (res && res.type === "rxn") { importReaction(res); $("rb-rxn-in").value = ""; }
        else pageMsg(res ? "That's a single structure \u2014 enter it in a component card (or paste it anywhere with a card selected)." : "That isn't a valid reaction SMILES (reactants>>products, components separated by dots).", "err");
      };
      $("rb-rxn-go").addEventListener("click", doImport);
      $("rb-rxn-in").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); doImport(); } });
      // Drop a file on a specific card
      mount.addEventListener("dragover", (e) => { const card = e.target.closest(".rb-card"); if (card && e.dataTransfer && [...e.dataTransfer.types].includes("Files")) { e.preventDefault(); card.classList.add("pce-drop-active"); } });
      mount.addEventListener("dragleave", (e) => { const card = e.target.closest(".rb-card"); if (card && !card.contains(e.relatedTarget)) card.classList.remove("pce-drop-active"); });
      mount.addEventListener("drop", async (e) => {
        const card = e.target.closest(".rb-card");
        if (!card || !e.dataTransfer || !e.dataTransfer.files.length) return;
        e.preventDefault(); card.classList.remove("pce-drop-active");
        try { const res = await P.fromFile(e.dataTransfer.files[0]); const c = byId(card.dataset.id); activeId = c.id; applyToComp(c, res); if (res.type !== "rxn") pageMsg(`Loaded ${res.note}.`, "ok"); }
        catch (err) { pageMsg(err.message, "err"); }
      });
      // Multi-line molfile pasted into a single-line name box: read it directly (inputs strip newlines)
      mount.addEventListener("paste", (e) => {
        const inp = e.target.closest("[data-rb-in]"); if (!inp) return;
        const t = e.clipboardData && e.clipboardData.getData("text/plain");
        if (t && /\n/.test(t.trim())) { e.preventDefault(); resolve(byId(inp.dataset.rbIn), t); }
        else if (!t && e.clipboardData && [...e.clipboardData.files].some((f) => /^image\//.test(f.type))) { e.preventDefault(); pageMsg(P.IMAGE_MSG, "err"); }
      });
    } else { ["rb-rxn-go", "rb-rxn-file"].forEach((id) => { $(id).disabled = true; }); }
  }

  window.PCEReactionInit = init;
})();
