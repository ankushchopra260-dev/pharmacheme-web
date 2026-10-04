// ================================================================
// PharmaChemE Structure Builder (v2)
// Drawing: OpenChemLib's built-in CanvasEditor (ring fusion, stereo
// wedges, charges, templates, lasso, undo). Chemistry: OpenChemLib.
// This file owns only the page UI around the editor and the results
// panels. If the editor fails to start, the page falls back to the
// original hand-built builder in calculators.js (renderMolBuilder).
// ================================================================
(function () {
  "use strict";

  const STORE_KEY = "pce-structure-v2";
  const EXAMPLES = [
    ["Aspirin", "CC(=O)Oc1ccccc1C(=O)O"],
    ["Paracetamol", "CC(=O)Nc1ccc(O)cc1"],
    ["Ibuprofen", "CC(C)Cc1ccc(cc1)C(C)C(=O)O"],
    ["Caffeine", "Cn1cnc2c1c(=O)n(C)c(=O)n2C"],
    ["Metformin", "CN(C)C(=N)N=C(N)N"],
    ["Toluene", "Cc1ccccc1"],
    ["Ethyl acetate", "CCOC(C)=O"],
  ];

  let editor = null;
  let currentMol = null;
  let debounceTimer = null;

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v, d) => (v === null || v === undefined || !isFinite(v) ? "—" : Number(v).toFixed(d));
  const store = {
    get() { try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; } },
    set(v) {
      try {
        if (v) { localStorage.setItem(STORE_KEY, v); localStorage.setItem(STORE_KEY + "-t", String(Date.now())); }
        else { localStorage.removeItem(STORE_KEY); localStorage.removeItem(STORE_KEY + "-t"); }
      } catch (e) { /* private mode */ }
    },
    time() { try { return +localStorage.getItem(STORE_KEY + "-t") || null; } catch (e) { return null; } },
  };

  // ---------------------------------------------------------------
  // Chemistry: pure function of an OCL Molecule -> plain result object
  // ---------------------------------------------------------------
  function computeAll(OCL, molIn) {
    const mol = molIn.getCompactCopy ? molIn.getCompactCopy() : molIn;
    mol.ensureHelperArrays(OCL.Molecule.cHelperRings);
    const n = mol.getAllAtoms();
    if (!n) return null;

    const f = mol.getMolecularFormula();
    const hill = hillFormula(mol);

    // Element counts incl. implicit H, for degree of unsaturation
    const cnt = { C: 0, H: 0, N: 0, X: 0, other: 0 };
    let netCharge = 0, hasOddValence = false;
    for (let i = 0; i < n; i++) {
      const z = mol.getAtomicNo(i);
      netCharge += mol.getAtomCharge(i);
      if (z === 1) { cnt.H++; continue; }
      cnt.H += mol.getAllHydrogens(i);
      if (z === 6 || z === 14) cnt.C++;               // C, Si
      else if (z === 7 || z === 15) cnt.N++;          // N, P (trivalent basis)
      else if ([9, 17, 35, 53].includes(z)) cnt.X++;  // halogens
      else if (z === 8 || z === 16 || z === 34) { /* divalent: no effect */ }
      else cnt.other++;
      if ((z === 15 || z === 16) && mol.getOccupiedValence(i) + mol.getAllHydrogens(i) > (z === 15 ? 3 : 2)) hasOddValence = true;
    }
    let dou = (2 * cnt.C + 2 + cnt.N - cnt.H - cnt.X) / 2;
    const douReliable = cnt.other === 0 && netCharge === 0 && !hasOddValence;

    // Fragments (disconnected pieces, e.g. salts)
    let fragments = 1;
    try { fragments = mol.getFragments().length; } catch (e) { /* ignore */ }

    // Rings
    let rings = 0, aromaticRings = 0;
    try {
      const rc = mol.getRingSet();
      rings = rc.getSize();
      for (let r = 0; r < rings; r++) if (rc.isAromatic(r)) aromaticRings++;
    } catch (e) { /* ignore */ }

    let smiles = "";
    try { smiles = mol.toIsomericSmiles(); } catch (e) { try { smiles = mol.toSmiles(); } catch (e2) { smiles = ""; } }
    let molfile = "";
    try { molfile = mol.toMolfile(); } catch (e) { molfile = ""; }

    // Physicochemical / drug-likeness (no extra resources needed)
    let p = null;
    try {
      const mp = new OCL.MoleculeProperties(mol);
      p = {
        logP: mp.logP, logS: mp.logS, tpsa: mp.polarSurfaceArea,
        hba: mp.acceptorCount, hbd: mp.donorCount, rotb: mp.rotatableBondCount,
        stereo: mp.stereoCenterCount,
      };
    } catch (e) { p = null; }

    let heavy = 0;
    for (let i = 0; i < n; i++) if (mol.getAtomicNo(i) !== 1) heavy++;

    const mw = f.relativeWeight;
    const lipinski = p ? [
      { rule: "Molecular weight ≤ 500", value: num(mw, 1), ok: mw <= 500 },
      { rule: "cLogP ≤ 5", value: num(p.logP, 2), ok: p.logP <= 5 },
      { rule: "H-bond donors ≤ 5", value: String(p.hbd), ok: p.hbd <= 5 },
      { rule: "H-bond acceptors ≤ 10", value: String(p.hba), ok: p.hba <= 10 },
    ] : [];
    const veber = p ? [
      { rule: "Rotatable bonds ≤ 10", value: String(p.rotb), ok: p.rotb <= 10 },
      { rule: "TPSA ≤ 140 Å²", value: num(p.tpsa, 1), ok: p.tpsa <= 140 },
    ] : [];

    return {
      formula: hill, mw, exact: f.absoluteWeight, dou, douReliable, netCharge,
      heavy, fragments, rings, aromaticRings, smiles, molfile, p, lipinski, veber,
      lipinskiViolations: lipinski.filter((r) => !r.ok).length,
    };
  }
  // Hill-order formula (C, H, then alphabetical; alphabetical if no C), with net charge
  function hillFormula(mol) {
    const counts = {};
    let charge = 0;
    const add = (el, k) => { if (k) counts[el] = (counts[el] || 0) + k; };
    for (let i = 0; i < mol.getAllAtoms(); i++) {
      add(mol.getAtomLabel(i), 1);
      if (mol.getAtomicNo(i) !== 1) add("H", mol.getAllHydrogens(i));
      charge += mol.getAtomCharge(i);
    }
    const els = Object.keys(counts);
    const order = counts.C
      ? ["C", "H"].filter((e) => counts[e]).concat(els.filter((e) => e !== "C" && e !== "H").sort())
      : els.sort();
    let out = order.map((e) => e + (counts[e] > 1 ? counts[e] : "")).join("");
    if (charge) {
      const sup = { 0: "\u2070", 1: "\u00b9", 2: "\u00b2", 3: "\u00b3", 4: "\u2074", 5: "\u2075", 6: "\u2076", 7: "\u2077", 8: "\u2078", 9: "\u2079" };
      const mag = Math.abs(charge);
      out += (mag > 1 ? String(mag).split("").map((d) => sup[d]).join("") : "") + (charge > 0 ? "\u207a" : "\u207b");
    }
    return out;
  }
  window.PCEStructureCompute = computeAll; // exposed for testing

  // ---------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------
  function formulaHTML(fml) {
    // Subscript counts; charge is already written with Unicode superscripts
    return esc(fml).replace(/([A-Za-z])(\d+)/g, "$1<sub>$2</sub>");
  }

  function card(label, id, hint) {
    return `<div class="readout ms-cell"><span class="lbl">${label}</span><span class="val" id="${id}">—</span>${hint ? `<span class="ms-sub" id="${id}-sub">${hint}</span>` : `<span class="ms-sub" id="${id}-sub"></span>`}</div>`;
  }

  function renderShell() {
    const ex = EXAMPLES.map(([name, s]) => `<button type="button" class="pill" data-ms-example="${esc(s)}">${esc(name)}</button>`).join("");
    return `
      ${typeof plateHeader === "function" ? plateHeader("PharmaChemE Structure Builder", "OPENCHEMLIB EDITOR: FORMULA, MW, PROPERTIES") : ""}

      <div class="ms-toolbar">
        <span class="ms-lbl">Examples</span>
        <div class="pill-group">${ex}</div>
      </div>

      <div id="ms-saved-note" class="ms-saved" hidden></div>
      <div class="ms-editor-wrap">
        <div id="ms-editor" class="ms-editor" aria-label="Structure drawing area"></div>
      </div>
      <div class="ms-under-editor">
        <details class="ms-help">
          <summary>How to draw</summary>
          <ul>
            <li><b>Bonds:</b> pick the single-bond tool, then click empty space or drag out from an atom. Click a bond again to cycle single → double → triple.</li>
            <li><b>Atoms:</b> pick an element (C, N, O, S, F, Cl…; <b>?…</b> for any other element) and click an atom to change it.</li>
            <li><b>Rings:</b> pick a ring and click an atom or bond to fuse it onto your structure.</li>
            <li><b>Stereo:</b> wedge / hash bond tools set up/down bonds. <b>+ / −</b> set charges.</li>
            <li><b>Edit:</b> eraser deletes; lasso selects and moves; the curved arrow is undo; the red cross clears all.</li>
            <li>On a computer you can also type an element symbol while hovering an atom, and use Ctrl+Z / Ctrl+C / Ctrl+V.</li>
          </ul>
        </details>
        <div class="pill-group ms-actions">
          <button type="button" class="pill" id="ms-clear" style="border-color:var(--rust); color:var(--rust);">Clear</button>
        </div>
      </div>

      <div class="ms-import">
        <label class="field" for="ms-in"><span class="lbl">Load a structure: paste SMILES or a molfile, or type a compound name</span></label>
        <div class="ms-import-row">
          <textarea id="ms-in" rows="1" spellcheck="false" placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O  or  paracetamol"></textarea>
          <button type="button" class="pill active" id="ms-load">Load</button>
          <button type="button" class="pill" id="ms-open">Open file</button>
        </div>
        <div id="ms-load-status" class="ms-status"></div>
        <div class="ms-tip">Tip: copy a structure as SMILES or MOL text (ChemDraw: Edit \u2192 Copy As), then press <b>Ctrl+V</b> anywhere on this page. You can also drop a .mol / .sdf / .smi file onto the drawing area.</div>
      </div>

      <div id="ms-frag-note" class="ms-note" hidden></div>

      <h3 class="ms-h">Identity</h3>
      <div class="ms-grid">
        ${card("Molecular formula", "ms-formula")}
        ${card("Molecular weight (g/mol)", "ms-mw", "average isotopic mass")}
        ${card("Exact mass (Da)", "ms-exact", "monoisotopic")}
        ${card("Degree of unsaturation", "ms-dou", "rings + π bonds")}
        ${card("Heavy atoms", "ms-heavy")}
        ${card("Rings", "ms-rings")}
      </div>

      <div class="readout ms-code-box">
        <div class="ms-code-head"><span class="lbl">SMILES</span><button type="button" class="ms-mini" data-ms-copy="smiles">Copy</button></div>
        <code id="ms-smiles" class="ms-code">—</code>
      </div>

      <div class="ms-export pill-group">
        <button type="button" class="pill" id="ms-dl-png">Download PNG</button>
        <button type="button" class="pill" id="ms-dl-svg">Download SVG</button>
        <button type="button" class="pill" id="ms-dl-mol">Download .mol</button>
        <button type="button" class="pill" data-ms-copy="molfile">Copy molfile</button>
      </div>

      <h3 class="ms-h">Physicochemical &amp; drug-likeness</h3>
      <div class="ms-grid">
        ${card("cLogP", "ms-logp", "octanol/water, calculated")}
        ${card("logS", "ms-logs", "aq. solubility, mol/L, calculated")}
        ${card("TPSA (Å²)", "ms-tpsa", "topological polar surface area")}
        ${card("H-bond donors / acceptors", "ms-hb")}
        ${card("Rotatable bonds", "ms-rotb")}
        ${card("Stereocentres", "ms-stereo")}
      </div>
      <div class="ms-rules">
        <div class="ms-rule-card"><div class="ms-rule-title">Lipinski rule of 5 <span id="ms-lip-badge" class="ms-badge"></span></div><table id="ms-lip" class="ms-table"></table></div>
        <div class="ms-rule-card"><div class="ms-rule-title">Veber (oral bioavailability) <span id="ms-veb-badge" class="ms-badge"></span></div><table id="ms-veb" class="ms-table"></table></div>
      </div>

      <h3 class="ms-h">Names &amp; identifiers (PubChem)</h3>
      <div class="ms-pubchem">
        <p class="ms-small">IUPAC name, InChI and InChIKey come from PubChem. Pressing the button sends this structure's SMILES to PubChem (NIH), so don't use it for confidential structures.</p>
        <button type="button" class="pill" id="ms-pubchem-btn">Look up on PubChem</button>
        <div id="ms-pubchem-out" class="ms-pubchem-out"></div>
      </div>

      <p class="ms-foot">Formula, masses, SMILES/molfile and the calculated properties (cLogP, logS, TPSA, donor/acceptor counts) are computed in your browser by OpenChemLib; nothing is sent anywhere unless you use the PubChem lookup or load a compound by name. Calculated logP/logS are estimates for screening, not measured values. Degree of unsaturation is shown for neutral structures with normal valences.</p>
    `;
  }

  function setVal(id, html, sub) {
    const el = $(id);
    if (el) el.innerHTML = html;
    if (sub !== undefined) { const s = $(id + "-sub"); if (s) s.innerHTML = sub; }
  }

  function ruleRows(rows) {
    return rows.map((r) => `<tr><td>${r.rule}</td><td class="ms-num">${r.value}</td><td class="${r.ok ? "ms-ok" : "ms-bad"}">${r.ok ? "Pass" : "Fail"}</td></tr>`).join("");
  }

  function renderResults() {
    const OCL = window.OCL;
    const res = currentMol && currentMol.getAllAtoms() ? computeAll(OCL, currentMol) : null;
    const dash = "—";
    if (!res) {
      ["ms-formula", "ms-mw", "ms-exact", "ms-dou", "ms-heavy", "ms-rings", "ms-logp", "ms-logs", "ms-tpsa", "ms-hb", "ms-rotb", "ms-stereo"].forEach((id) => setVal(id, dash));
      setVal("ms-smiles", dash);
      $("ms-lip").innerHTML = ""; $("ms-veb").innerHTML = "";
      $("ms-lip-badge").textContent = ""; $("ms-veb-badge").textContent = "";
      $("ms-lip-badge").className = "ms-badge"; $("ms-veb-badge").className = "ms-badge";
      $("ms-frag-note").hidden = true;
      $("ms-pubchem-out").innerHTML = "";
      window.PCEStructure = null;
      return;
    }
    setVal("ms-formula", formulaHTML(res.formula));
    setVal("ms-mw", num(res.mw, 2));
    setVal("ms-exact", num(res.exact, 4));
    setVal("ms-dou", res.douReliable ? num(res.dou, res.dou % 1 ? 1 : 0) : dash, res.douReliable ? "rings + π bonds" : "n/a for charged / unusual-valence structures");
    setVal("ms-heavy", String(res.heavy));
    setVal("ms-rings", String(res.rings), res.aromaticRings ? `${res.aromaticRings} aromatic` : "");
    setVal("ms-smiles", esc(res.smiles || dash));

    const p = res.p;
    setVal("ms-logp", p ? num(p.logP, 2) : dash);
    setVal("ms-logs", p ? num(p.logS, 2) : dash);
    setVal("ms-tpsa", p ? num(p.tpsa, 1) : dash);
    setVal("ms-hb", p ? `${p.hbd} / ${p.hba}` : dash);
    setVal("ms-rotb", p ? String(p.rotb) : dash);
    setVal("ms-stereo", p ? String(p.stereo) : dash);

    $("ms-lip").innerHTML = ruleRows(res.lipinski);
    $("ms-veb").innerHTML = ruleRows(res.veber);
    const lb = $("ms-lip-badge");
    lb.textContent = res.lipinskiViolations === 0 ? "No violations" : `${res.lipinskiViolations} violation${res.lipinskiViolations > 1 ? "s" : ""}`;
    lb.className = "ms-badge " + (res.lipinskiViolations <= 1 ? "ms-badge-ok" : "ms-badge-bad");
    const vOk = res.veber.every((r) => r.ok);
    const vb = $("ms-veb-badge");
    vb.textContent = vOk ? "Pass" : "Fail";
    vb.className = "ms-badge " + (vOk ? "ms-badge-ok" : "ms-badge-bad");

    const note = $("ms-frag-note");
    if (res.fragments > 1) {
      note.hidden = false;
      note.textContent = `This drawing has ${res.fragments} separate pieces (e.g. a salt or a mixture). All values are for everything drawn, taken together.`;
    } else note.hidden = true;

    window.PCEStructure = { smiles: res.smiles, mw: res.mw, formula: res.formula };
  }

  function onEditorChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try { currentMol = editor.getMolecule(); } catch (e) { currentMol = null; }
      renderResults();
      $("ms-pubchem-out").innerHTML = "";
      let saved = "";
      try { saved = currentMol && currentMol.getAllAtoms() ? currentMol.getIDCode() + " " + currentMol.getIDCoordinates() : ""; } catch (e) { saved = ""; }
      store.set(saved);
    }, 120);
  }

  function setMolecule(mol) {
    editor.setMolecule(mol);
    onEditorChange();
  }

  function status(msg, kind) {
    const el = $("ms-load-status");
    el.textContent = msg;
    el.style.color = kind === "err" ? "var(--rust)" : kind === "ok" ? "var(--brass)" : "var(--muted)";
  }

  function fromSmilesSafe(s) {
    const m = window.OCL.Molecule.fromSmiles(s);
    if (!m.getAllAtoms()) throw new Error("empty");
    m.inventCoordinates();
    return m;
  }

  async function pubchemJSON(url, body) {
    const opts = body ? { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body } : {};
    const r = await fetch(url, opts);
    if (!r.ok) { const err = new Error("HTTP " + r.status); err.status = r.status; throw err; }
    return r.json();
  }
  const PUG = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound";
  const pickSmiles = (p) => p.SMILES || p.IsomericSMILES || p.CanonicalSMILES || "";

  async function loadFromInput() {
    const raw = $("ms-in").value;
    const text = raw.trim();
    if (!text) { status("Paste SMILES / a molfile or type a name first.", "err"); return; }
    // 1. Molfile / SD file / SMILES / reaction SMILES (shared parser)
    const P = window.PCEStructPaste;
    if (P) {
      const res = P.parseText(raw);
      if (res) { applyParsed(res); return; }
      if (/M\s+END/.test(raw) || /V2000|V3000|\$RXN/.test(raw)) { status("Could not read that molfile.", "err"); return; }
    } else if (!/\s/.test(text)) {
      try { setMolecule(fromSmilesSafe(text)); status("Loaded SMILES.", "ok"); return; } catch (e) { /* fall through to name */ }
    }
    // 3. Name via PubChem
    status(`Searching PubChem for “${text}”…`);
    try {
      const j = await pubchemJSON(`${PUG}/name/${encodeURIComponent(text)}/property/SMILES,Title/JSON`);
      const p = j.PropertyTable.Properties[0];
      const smi = pickSmiles(p);
      setMolecule(fromSmilesSafe(smi));
      status(`Loaded “${p.Title || text}” from PubChem (CID ${p.CID}).`, "ok");
    } catch (e) {
      if (e && e.status === 404) status(`Not a valid SMILES, and PubChem has no compound named “${text}”.`, "err");
      else status("Not a valid SMILES, and PubChem could not be reached for a name search. Check your connection.", "err");
    }
  }

  // Result from the shared paste/drop parser
  function applyParsed(res) {
    if (res.type === "rxn") {
      status("That's a reaction, not a single structure. Paste it into the Reaction Builder (Molecules \u2192 Reaction Builder).", "err");
      return;
    }
    const m = res.mol;
    if (!/Molfile|SD file/.test(res.note)) m.inventCoordinates();
    setMolecule(m);
    status(`Loaded: ${res.note}.`, "ok");
  }

  async function pubchemLookup() {
    const out = $("ms-pubchem-out");
    if (!currentMol || !currentMol.getAllAtoms()) { out.innerHTML = `<p class="ms-small" style="color:var(--rust)">Draw or load a structure first.</p>`; return; }
    let smi = "";
    try { smi = currentMol.toIsomericSmiles(); } catch (e) { smi = currentMol.toSmiles(); }
    out.innerHTML = `<p class="ms-small">Looking up…</p>`;
    try {
      const j = await pubchemJSON(`${PUG}/smiles/property/Title,IUPACName,InChI,InChIKey/JSON`, "smiles=" + encodeURIComponent(smi));
      const p = j.PropertyTable.Properties[0];
      if (!p || !p.CID) throw Object.assign(new Error("nf"), { status: 404 });
      const row = (k, v) => v ? `<div class="ms-kv"><span class="lbl">${k}</span><code class="ms-code">${esc(v)}</code></div>` : "";
      out.innerHTML = `
        ${row("Common name", p.Title)}
        ${row("IUPAC name", p.IUPACName)}
        ${row("InChI", p.InChI)}
        ${row("InChIKey", p.InChIKey)}
        <a class="ms-link" href="https://pubchem.ncbi.nlm.nih.gov/compound/${p.CID}" target="_blank" rel="noopener">Open PubChem CID ${p.CID} →</a>`;
    } catch (e) {
      out.innerHTML = e && e.status === 404
        ? `<p class="ms-small">PubChem has no record of this exact structure. It may be new or unusual. (InChI isn't generated locally.)</p>`
        : `<p class="ms-small" style="color:var(--rust)">Couldn't reach PubChem. Check your connection and try again.</p>`;
    }
  }

  // ---------- Export ----------
  function download(name, blob) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function fileBase() {
    const r = currentMol ? computeAll(window.OCL, currentMol) : null;
    return r ? r.formula.replace(/[^A-Za-z0-9]/g, "") || "structure" : "structure";
  }
  function svgString(w, h) {
    return currentMol.toSVG(w, h, "pce-mol", { autoCrop: true, autoCropMargin: 20, strokeWidth: 1.6, suppressChiralText: true, suppressESR: true, suppressCIPParity: true, noStereoProblem: true });
  }
  function needMol() {
    if (currentMol && currentMol.getAllAtoms()) return true;
    status("Draw or load a structure first.", "err");
    return false;
  }
  function exportSVG() {
    if (!needMol()) return;
    download(fileBase() + ".svg", new Blob([svgString(600, 450)], { type: "image/svg+xml" }));
  }
  function exportPNG() {
    if (!needMol()) return;
    let svg = svgString(600, 450);
    // ensure white background so the PNG is readable in documents
    svg = svg.replace(/<svg([^>]*)>/, '<svg$1><rect width="100%" height="100%" fill="#ffffff"/>');
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const w = img.naturalWidth || 600, h = img.naturalHeight || 450;
      const c = document.createElement("canvas");
      c.width = w * scale; c.height = h * scale;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => b && download(fileBase() + ".png", b), "image/png");
    };
    img.onerror = () => status("PNG export failed in this browser. Try SVG.", "err");
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  function exportMol() {
    if (!needMol()) return;
    download(fileBase() + ".mol", new Blob([currentMol.toMolfile()], { type: "chemical/x-mdl-molfile" }));
  }
  async function copyText(kind, btn) {
    if (!needMol()) return;
    let text = "";
    try { text = kind === "molfile" ? currentMol.toMolfile() : currentMol.toIsomericSmiles(); } catch (e) { text = ""; }
    try {
      await navigator.clipboard.writeText(text);
      const old = btn.textContent; btn.textContent = "Copied"; setTimeout(() => { btn.textContent = old; }, 1200);
    } catch (e) { status("Couldn't access the clipboard. Select the text and copy it by hand.", "err"); }
  }

  // ---------- Init ----------
  function fallback(mount, reason) {
    if (typeof renderMolBuilder === "function" && typeof initMolBuilder === "function" && window.OCL) {
      mount.innerHTML = `<p class="ms-small" style="color:var(--rust); margin-bottom:10px;">The advanced editor couldn't start in this browser (${esc(reason)}), so the basic builder is shown instead.</p>` + renderMolBuilder();
      initMolBuilder();
    } else {
      mount.innerHTML = `<p style="padding:24px; font-family:var(--f-sans); color:var(--rust);">The chemistry engine did not load. Please reload the page.</p>`;
    }
  }

  function init() {
    const mount = $("calc-mount");
    if (!mount) return;
    if (!window.OCL || !window.OCL.CanvasEditor) { fallback(mount, "chemistry engine unavailable"); return; }
    mount.innerHTML = renderShell();
    try {
      editor = new window.OCL.CanvasEditor($("ms-editor"), { initialMode: "molecule" });
    } catch (e) {
      fallback(mount, e && e.message ? e.message : "unknown error");
      return;
    }
    editor.setOnChangeListener(onEditorChange);

    // Restore last drawing on this device
    const saved = store.get();
    if (saved) {
      try {
        const ts = store.time();
        const m = window.OCL.Molecule.fromIDCode(saved.split(" ")[0], saved.split(" ")[1] || true);
        if (m.getAllAtoms()) {
          editor.setMolecule(m);
          const when = ts ? new Date(ts).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
          const note = $("ms-saved-note");
          note.innerHTML = `<span>Restored your last structure${when ? `, saved in this browser on <b>${esc(when)}</b>` : " saved in this browser"}. It is stored only on this device, not on the website.</span><button type="button" class="pill" id="ms-forget">Clear saved structure</button>`;
          note.hidden = false;
        }
      } catch (e) { store.set(""); }
    }
    onEditorChange();

    mount.addEventListener("click", (e) => {
      const ex = e.target.closest("[data-ms-example]");
      if (ex) { setMolecule(fromSmilesSafe(ex.dataset.msExample)); status(`Loaded example: ${ex.textContent}.`, "ok"); return; }
      const cp = e.target.closest("[data-ms-copy]");
      if (cp) { copyText(cp.dataset.msCopy, cp); return; }
      switch (e.target.id) {
        case "ms-clear": editor.clearAll(); onEditorChange(); status(""); break;
        case "ms-forget": {
          editor.clearAll(); onEditorChange();
          setTimeout(() => store.set(""), 200);   // after the debounced save of the now-empty canvas
          const note = $("ms-saved-note");
          note.innerHTML = "<span>Saved structure cleared from this browser.</span>";
          setTimeout(() => { note.hidden = true; }, 2500);
          break;
        }
        case "ms-load": loadFromInput(); break;
        case "ms-pubchem-btn": pubchemLookup(); break;
        case "ms-dl-png": exportPNG(); break;
        case "ms-dl-svg": exportSVG(); break;
        case "ms-dl-mol": exportMol(); break;
      }
    });
    $("ms-in").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !/\n/.test($("ms-in").value)) { e.preventDefault(); loadFromInput(); }
    });
    // Paste anywhere / drop files / open file
    if (window.PCEStructPaste) {
      const onErr = (msg) => status(msg, "err");
      window.PCEStructPaste.attach({ dropTarget: document.querySelector(".ms-editor-wrap"), onResult: applyParsed, onError: onErr });
      const pick = window.PCEStructPaste.filePicker(applyParsed, onErr);
      $("ms-open").addEventListener("click", pick);
    } else { $("ms-open").hidden = true; }
    // Grow textarea when a molfile is pasted
    $("ms-in").addEventListener("input", (e) => { e.target.rows = /\n/.test(e.target.value) ? 6 : 1; });
  }

  window.PCEStructureInit = init;
})();
