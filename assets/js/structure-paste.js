// ================================================================
// PharmaChemE — shared structure paste / drop helper
// Turns pasted text or dropped files into OpenChemLib molecules or
// reactions: SMILES, reaction SMILES (A.B>>C.D), molfile (V2000/V3000),
// SD file (first record), RXN file. Images are politely refused
// (no image recognition on this site).
// ================================================================
(function () {
  "use strict";

  const TEXT_EXT = /\.(mol|sdf|sd|mdl|rxn|smi|smiles|txt|cml)$/i;
  const IMAGE_MSG = "That's an image. Structures can't be read from pictures here — paste SMILES or a molfile instead. In ChemDraw: Edit → Copy As → SMILES (or MOL Text). In Marvin: Edit → Copy As → SMILES.";
  const CDX_MSG = "ChemDraw .cdx/.cdxml files can't be read here. In ChemDraw use File → Save As → MDL Molfile (*.mol), or Edit → Copy As → SMILES, then paste.";

  // Split one side of a reaction SMILES into molecules. Dots separate
  // components; consecutive charged fragments are re-joined until neutral
  // so salts like [Na+].[OH-] stay one component.
  function sideMols(side) {
    const OCL = window.OCL;
    const frags = side.split(".").filter(Boolean);
    const out = [];
    let buf = [], charge = 0;
    frags.forEach((f) => {
      const m = OCL.Molecule.fromSmiles(f);
      let q = 0; for (let i = 0; i < m.getAllAtoms(); i++) q += m.getAtomCharge(i);
      if (!buf.length && q === 0) { out.push(m); return; }
      buf.push(f); charge += q;
      if (charge === 0) { out.push(OCL.Molecule.fromSmiles(buf.join("."))); buf = []; }
    });
    if (buf.length) out.push(OCL.Molecule.fromSmiles(buf.join(".")));
    return out;
  }
  function rxnFromObj(r) {
    const R = [], P = [];
    for (let i = 0; i < r.getReactants(); i++) R.push(r.getReactant(i));
    for (let i = 0; i < r.getProducts(); i++) P.push(r.getProduct(i));
    return { reactants: R, products: P };
  }

  // Returns {type:'mol', mol, note} | {type:'rxn', reactants:[], products:[], note} | null
  function parseText(raw) {
    const OCL = window.OCL;
    if (!OCL || raw == null) return null;
    const text = String(raw).replace(/\r\n?/g, "\n");
    const t = text.trim();
    if (!t) return null;

    // RXN file
    if (/^\$RXN/m.test(text)) {
      try { const r = OCL.Reaction.fromRxn(text); if (r.getReactants() + r.getProducts() > 0) return Object.assign({ type: "rxn", note: "RXN file" }, rxnFromObj(r)); } catch (e) { /* fall through */ }
    }
    // Molfile / SD file (first record)
    if (/M\s+END/.test(text) || /V2000|V3000/.test(text)) {
      const records = text.split(/^\$\$\$\$\s*$/m).filter((s) => /M\s+END/.test(s));
      try {
        const m = OCL.Molecule.fromMolfile(records[0] || text);
        if (m.getAllAtoms()) return { type: "mol", mol: m, note: records.length > 1 ? `SD file — first of ${records.length} structures loaded` : "Molfile" };
      } catch (e) { /* fall through */ }
      return null;
    }
    // Single line: reaction SMILES or SMILES (optionally followed by a name, as in .smi files)
    const first = t.split("\n")[0].trim().split(/\s+/)[0];
    if (/>/.test(first)) {
      const parts = first.split(">");
      if (parts.length !== 3) return null;   // reactants>agents>products (">>" = no agents)
      try {
        const reactants = sideMols(parts[0]), products = sideMols(parts[2]);
        if (reactants.some((m) => !m.getAllAtoms()) || products.some((m) => !m.getAllAtoms())) return null;
        if (reactants.length + products.length > 0) return { type: "rxn", reactants, products, note: "Reaction SMILES" + (parts[1] ? " (reagents above the arrow ignored)" : "") };
      } catch (e) { /* fall through */ }
      return null;
    }
    try {
      const m = OCL.Molecule.fromSmiles(first);
      if (m.getAllAtoms()) return { type: "mol", mol: m, note: "SMILES" };
    } catch (e) { /* not SMILES */ }
    return null;
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      if (/^image\//.test(file.type)) return reject(new Error(IMAGE_MSG));
      if (/\.cdx(ml)?$/i.test(file.name)) return reject(new Error(CDX_MSG));
      if (!TEXT_EXT.test(file.name) && file.type && !/^text\//.test(file.type) && file.type !== "chemical/x-mdl-molfile") {
        return reject(new Error(`Can't read “${file.name}”. Use a .mol, .sdf, .rxn or .smi file.`));
      }
      if (file.size > 5 * 1024 * 1024) return reject(new Error("That file is larger than 5 MB — use a single-structure .mol or .sdf file."));
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => reject(new Error("Couldn't read that file."));
      fr.readAsText(file);
    });
  }

  async function fromFile(file) {
    const text = await readFile(file);
    const res = parseText(text);
    if (!res) throw new Error(`No structure found in “${file.name}”.`);
    res.note = `${file.name} (${res.note})`;
    return res;
  }

  const isTyping = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);

  // opts: { dropTarget: Element, onResult(res), onError(msg), canPaste(): bool }
  // Paste is handled anywhere on the page except while typing in a field.
  function attach(opts) {
    document.addEventListener("paste", (e) => {
      if (isTyping(document.activeElement)) return;
      if (opts.canPaste && !opts.canPaste()) return;
      const cd = e.clipboardData;
      if (!cd) return;
      const text = cd.getData("text/plain");
      const files = [...(cd.files || [])];
      if (text && text.trim()) {
        const res = parseText(text);
        e.preventDefault();
        if (res) { res.note = "Pasted " + res.note; opts.onResult(res); }
        else opts.onError("The pasted text isn't a SMILES string, reaction SMILES or molfile.");
        return;
      }
      if (files.some((f) => /^image\//.test(f.type))) { e.preventDefault(); opts.onError(IMAGE_MSG); }
    });

    const zone = opts.dropTarget;
    if (!zone) return;
    let depth = 0;
    zone.addEventListener("dragenter", (e) => { if (hasFiles(e)) { depth++; zone.classList.add("pce-drop-active"); } });
    zone.addEventListener("dragleave", () => { depth = Math.max(0, depth - 1); if (!depth) zone.classList.remove("pce-drop-active"); });
    zone.addEventListener("dragover", (e) => { if (hasFiles(e)) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; } });
    zone.addEventListener("drop", async (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault(); e.stopPropagation();
      depth = 0; zone.classList.remove("pce-drop-active");
      const file = e.dataTransfer.files[0];
      try { opts.onResult(await fromFile(file)); } catch (err) { opts.onError(err.message); }
    }, true);
  }
  const hasFiles = (e) => e.dataTransfer && [...(e.dataTransfer.types || [])].includes("Files");

  // A hidden <input type=file> wired to a button
  function filePicker(onResult, onError) {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".mol,.sdf,.sd,.rxn,.smi,.smiles,.txt,.mdl";
    inp.style.display = "none";
    document.body.appendChild(inp);
    inp.addEventListener("change", async () => {
      const f = inp.files[0]; inp.value = "";
      if (!f) return;
      try { onResult(await fromFile(f)); } catch (err) { onError(err.message); }
    });
    return () => inp.click();
  }

  window.PCEStructPaste = { parseText, fromFile, attach, filePicker, IMAGE_MSG };
})();
