/* PharmaChemE heat-of-reaction engine.
   - Benson group additivity (gas-phase enthalpy of formation, 298 K)
   - Context-specific bond enthalpies (bond-energy method)
   - Structure perception with OpenChemLib (OCL Molecule API)
   Works in the browser (window.HRCore) and in Node (module.exports) for testing.
   Data (group values, ring corrections, bond enthalpies, ΔHvap model) are passed in. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HRCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CARBONS = { 'C': 1, 'C[d]': 1, 'C[t]': 1, 'C[B]': 1, 'C[BF]': 1, 'C[a]': 1, 'CO': 1 };
  var HAL = { F: 1, Cl: 1, Br: 1, I: 1 };

  function key(center, ligs) { return center + '|' + ligs.slice().sort().join(','); }

  /* ---------- structure perception ---------- */
  function shortestCycle(mol, bd) {
    var a0 = mol.getBondAtom(0, bd), a1 = mol.getBondAtom(1, bd), prev = {}, seen = {}, queue = [a1];
    seen[a1] = 1; prev[a1] = -1;
    while (queue.length) {
      var x = queue.shift();
      for (var j = 0; j < mol.getConnAtoms(x); j++) {
        var y = mol.getConnAtom(x, j), b = mol.getConnBond(x, j);
        if (b === bd || seen[y]) continue;
        seen[y] = 1; prev[y] = x;
        if (y === a0) {
          var atoms = [y], z = x; while (z !== -1) { atoms.push(z); z = prev[z]; }
          var bonds = [bd]; for (var k = 0; k + 1 < atoms.length; k++) bonds.push(mol.getBond(atoms[k], atoms[k + 1]));
          return { atoms: atoms, bonds: bonds, ar: false, size: atoms.length };
        }
        queue.push(y);
      }
    }
    return null;
  }
  function perceive(OCL, mol) {
    var M = OCL.Molecule;
    mol = mol.getCompactCopy ? mol.getCompactCopy() : mol;
    mol.ensureHelperArrays(M.cHelperRings);
    var n = mol.getAtoms(), A = [], i, j;
    for (i = 0; i < n; i++) {
      var nb = [];
      for (j = 0; j < mol.getConnAtoms(i); j++) nb.push({ a: mol.getConnAtom(i, j), o: mol.getConnBondOrder(i, j), b: mol.getConnBond(i, j) });
      A.push({ i: i, el: mol.getAtomLabel(i), h: mol.getAllHydrogens(i), q: mol.getAtomCharge(i), ar: mol.isAromaticAtom(i), nb: nb, rad: mol.getAtomRadical ? mol.getAtomRadical(i) : 0 });
    }
    var rs = mol.getRingSet(), all = [], rings = [];
    for (i = 0; i < rs.getSize(); i++) all.push({ atoms: Array.prototype.slice.call(rs.getRingAtoms(i)), bonds: Array.prototype.slice.call(rs.getRingBonds(i)), ar: rs.isAromatic(i), size: rs.getRingSize(i) });
    /* keep a smallest set of smallest rings: OCL also lists envelope rings */
    var nSSSR = mol.getBonds() - n + mol.getFragments().length, used = {};
    all.sort(function (p, q) { return p.size - q.size; });
    all.forEach(function (r) {
      if (rings.length >= nSSSR) return;
      var fresh = r.bonds.some(function (bd) { return !used[bd]; });
      if (fresh) { rings.push(r); r.bonds.forEach(function (bd) { used[bd] = 1; }); }
    });
    /* OCL lists rings only up to 7 atoms: find larger rings by a shortest-cycle search */
    var guard = 0;
    while (rings.length < nSSSR && guard++ < 20) {
      var bd = -1;
      for (var q = 0; q < mol.getBonds(); q++) if (mol.isRingBond(q) && !used[q]) { bd = q; break; }
      if (bd < 0) break;
      var cyc = shortestCycle(mol, bd);
      if (!cyc) break;
      rings.push(cyc); cyc.bonds.forEach(function (x) { used[x] = 1; });
    }
    /* five-membered heteroaromatics (furan etc.) are treated as conjugated dienes, Benson-style */
    rings.forEach(function (r) {
      if (r.ar && r.size === 5) { r.ar = false; r.hetero5 = true; r.atoms.forEach(function (k) { A[k].ar5 = true; }); }
    });
    A.forEach(function (a) { if (a.ar5) { var still = rings.some(function (r) { return r.ar && r.atoms.indexOf(a.i) >= 0; }); if (!still) a.ar = false; } });
    return { mol: mol, A: A, rings: rings, polycyclic: rings.filter(function (r) { return !r.ar; }).some(function (r) { return rings.some(function (q) { return q !== r && !q.ar && q.atoms.filter(function (k) { return r.atoms.indexOf(k) >= 0; }).length >= 2; }); }) };
  }

  /* atom typing; returns {type, absorbed} per atom, or throws an unsupported message */
  function typeAtoms(P) {
    var A = P.A;
    function nbo(a, el, order) { return a.nb.filter(function (x) { return A[x.a].el === el && (order === undefined || x.o === order); }); }
    /* first pass: nitro groups and carbonyl oxygens, so that atom order does not matter */
    A.forEach(function (a) {
      if (a.el === 'N') {
        var oD = nbo(a, 'O', 2), oS = nbo(a, 'O', 1);
        var oM = oS.filter(function (x) { return A[x.a].q === -1; });
        if (a.q === 1 && oD.length === 1 && oM.length === 1) { [oD[0], oM[0]].forEach(function (x) { A[x.a].absorbed = true; }); a.nitro = true; }
        else if (a.q === 0 && oD.length === 2) { oD.forEach(function (x) { A[x.a].absorbed = true; }); a.nitro = true; }
      }
    });
    A.forEach(function (a) {
      if (a.rad) throw 'Radicals are not supported (' + a.el + ')';
      if (a.el === 'C') {
        var dO = nbo(a, 'O', 2), tN = nbo(a, 'N', 3), dN = nbo(a, 'N', 2), dC = nbo(a, 'C', 2), tC = nbo(a, 'C', 3), dS = nbo(a, 'S', 2);
        if (a.q) throw 'Charged carbon is not supported';
        if (dO.length >= 2) a.t = 'O=C=O';
        else if (tN.length) a.t = 'CN*';
        else if (dO.length === 1) { a.t = 'CO'; A[dO[0].a].absorbed = true; if (dC.length || dN.length) a.t = 'ketene'; }
        else if (a.ar) a.t = a.nb.filter(function (x) { return A[x.a].ar; }).length === 3 && P.rings.filter(function (r) { return r.ar && r.atoms.indexOf(a.i) >= 0; }).length >= 2 ? 'C[BF]' : 'C[B]';
        else if (dC.length === 2) a.t = 'C[a]';
        else if (dC.length === 1) a.t = 'C[d]';
        else if (tC.length) a.t = 'C[t]';
        else if (dN.length) a.t = 'C=N';
        else if (dS.length) a.t = 'C=S';
        else a.t = 'C';
      } else if (a.el === 'N') {
        var oD = nbo(a, 'O', 2), oS = nbo(a, 'O', 1);
        if (a.nitro) a.t = 'NO2*';
        else if (a.q) throw 'Charged nitrogen (other than nitro) is not supported';
        else if (nbo(a, 'C', 3).length) { a.t = 'N#'; a.absorbed = true; }
        else if (a.ar) a.t = 'N[ar]';
        else if (nbo(a, 'N', 2).length) a.t = 'N[A]';
        else if (nbo(a, 'C', 2).length) a.t = 'N[I]';
        else if (oD.length || oS.length && a.nb.length + a.h > 3) a.t = 'N-O';
        else a.t = 'N';
      } else if (a.el === 'O') {
        if (a.absorbed) { a.t = 'O*'; return; }
        if (a.q) throw 'Charged oxygen is not supported';
        a.t = 'O';
      } else if (HAL[a.el]) a.t = a.el;
      else a.t = a.el;  /* S, P, Si, B ... handled as unsupported centres */
    });
    /* the N of a nitrile is absorbed; its carbon becomes the ligand "CN" */
    A.forEach(function (a) { if (a.t === 'N#') a.absorbed = true; });
  }

  function A_isPseudo(a) { return a.t === 'NO2*' || a.t === 'CN*'; }
  function ligName(A, k) {
    var t = A[k].t;
    if (t === 'CN*') return 'CN';
    if (t === 'NO2*') return 'NO2';
    return t;
  }

  /* Benson groups for one molecule */
  function groups(P) {
    var A = P.A, out = [];
    A.forEach(function (a) {
      if (a.absorbed || HAL[a.t] || a.t === 'CN*' || a.t === 'NO2*' || a.t === 'O*') return;
      var ligs = [];
      a.nb.forEach(function (x) { if (!(A[x.a].absorbed && A[x.a].t !== 'N#')) ligs.push(ligName(A, x.a)); });
      for (var h = 0; h < a.h; h++) ligs.push('H');
      out.push({ atom: a.i, center: a.t, ligs: ligs });
    });
    /* CN and NO2 attached to O or N, or free HCN etc., are handled by the centres above */
    return out;
  }

  /* ---------- ring corrections ---------- */
  function ringCorrections(P) {
    var A = P.A, mol = P.mol, out = [];
    P.rings.forEach(function (r) {
      if (r.ar && r.size === 6) return; /* benzene rings: built into C[B] groups */
      var het = {}, dbl = 0, exoCO = 0, endoCO = 0;
      r.atoms.forEach(function (k) { var el = A[k].el; if (el !== 'C') het[el] = (het[el] || 0) + 1; if (A[k].t === 'CO') exoCO++; });
      r.bonds.forEach(function (b) { if (mol.getBondOrder(b) === 2) dbl++; });
      var nO = het.O || 0, other = Object.keys(het).filter(function (e) { return e !== 'O'; }).length;
      var name = null, s = r.size, conj = false;
      if (dbl === 2) { /* conjugated if an atom of one double bond is bonded to an atom of the other */
        var db = r.bonds.filter(function (b) { return mol.getBondOrder(b) === 2; });
        var a1 = [mol.getBondAtom(0, db[0]), mol.getBondAtom(1, db[0])], a2 = [mol.getBondAtom(0, db[1]), mol.getBondAtom(1, db[1])];
        conj = a1.some(function (p) { return a2.some(function (q) { return mol.getBond(p, q) >= 0; }); });
      }
      if (!other && !nO) {
        if (exoCO === 1 && dbl === 0) name = s === 6 ? 'cyclohexanone' : s === 5 ? 'cyclopentanone' : null;
        else if (exoCO === 0) name = ({ '3,0': 'Cyclopropane', '3,1': 'Cyclopropene', '4,0': 'Cyclobutane', '4,1': 'Cyclobutene', '5,0': 'Cyclopentane', '5,1': 'Cyclopentene', '5,2': 'Cyclopentadiene', '6,0': 'Cyclohexane', '6,1': 'Cyclohexene', '7,0': 'Cycloheptane', '7,1': 'Cycloheptene', '7,2': 'Cycloheptadiene-1,3', '7,3': 'Cycloheptatriene-1,3,5', '8,0': 'Cyclooctane', '8,1': 'cis-Cyclooctene', '8,3': 'Cyclooctatriene-1,3,5', '8,4': 'Cyclooctatetraene', '9,0': 'Cyclononane', '9,1': 'cis-Cyclononene' })[s + ',' + dbl] || null;
        if (s === 6 && dbl === 2 && exoCO === 0) name = conj ? 'Cyclohexadiene-1,3' : 'Cyclohexadiene-1,4';
        if (!name && s >= 10 && dbl === 0 && exoCO === 0) name = '#large';
      } else if (!other) {
        var Opos = r.atoms.filter(function (k) { return A[k].el === 'O'; });
        if (exoCO === 2 && nO === 1) name = s === 5 ? (dbl ? 'furan-2,5-dione' : 'dihydrofuran-2,5-dione') : s === 6 && !dbl ? 'dihydro-2H-pyran-2,6(3H)-dione' : null;
        else if (exoCO === 0 && nO === 1) name = ({ '3,0': 'Oxirane', '4,0': 'Oxetane', '5,0': 'Tetrahydrofuran', '6,0': 'Tetrahydro-2H-pyran', '5,2': 'Furan', '6,1': '3,4-dihydro-2H-pyran' })[s + ',' + dbl] || null;
        else if (exoCO === 0 && nO === 2 && s === 6 && !dbl) {
          var bonded13 = mol.getPathLength ? mol.getPathLength(Opos[0], Opos[1]) : 0;
          name = bonded13 === 2 ? 'Dioxane-1,3' : 'Dioxane-1,4';
        } else if (exoCO === 0 && nO === 3 && s === 6) name = 'Trioxane-1,3,5';
      }
      out.push({ ring: r, name: name, size: s });
    });
    return out;
  }

  /* ---------- non-nearest-neighbour corrections ---------- */
  function corrections(P) {
    var A = P.A, mol = P.mol, out = [];
    /* alkane gauche: sp3 C–C bonds, heavy (carbon) substituents on each end */
    var g = 0;
    for (var b = 0; b < mol.getBonds(); b++) {
      if (mol.getBondOrder(b) !== 1 || mol.isRingBond(b)) continue;
      var x = mol.getBondAtom(0, b), y = mol.getBondAtom(1, b);
      if (A[x].t !== 'C' || A[y].t !== 'C') continue;
      var nx = A[x].nb.filter(function (z) { return z.a !== y && CARBONS[A[z.a].t]; }).length;
      var ny = A[y].nb.filter(function (z) { return z.a !== x && CARBONS[A[z.a].t]; }).length;
      if (nx && ny) g += (Math.max(nx, ny) - 1) * Math.min(nx, ny);
    }
    if (g) out.push({ name: 'AlkaneGauche', n: g });
    /* cis C=C (acyclic, both ends substituted on the same side) */
    var cis = 0, unknownCis = 0, dcis = 0;
    for (b = 0; b < mol.getBonds(); b++) {
      if (mol.getBondOrder(b) !== 2 || mol.isRingBond(b)) continue;
      x = mol.getBondAtom(0, b); y = mol.getBondAtom(1, b);
      if (A[x].t !== 'C[d]' || A[y].t !== 'C[d]') continue;
      var sx = A[x].nb.filter(function (z) { return z.a !== y; }).length, sy = A[y].nb.filter(function (z) { return z.a !== x; }).length;
      if (sx === 2 && sy === 2) { cis += 2; dcis++; }
      else if (sx === 2 && sy === 1 || sy === 2 && sx === 1) cis += 1;   /* one cis pair is unavoidable */
      else if (sx === 1 && sy === 1) {
        var p = mol.getBondParity(b);   /* 1 = E, 2 = Z; with one substituent per end Z means cis */
        if (p === 2) cis++; else if (p !== 1) { cis += 0.5; unknownCis++; }
      }
    }
    /* ditertiary ether (Benson): an ether O between two carbons that each carry three carbons */
    var dt = 0;
    A.forEach(function (a) { if (a.t === 'O' && a.nb.length === 2 && a.nb.every(function (z) { var c = A[z.a]; return c.t === 'C' && c.nb.filter(function (w) { return w.a !== a.i && CARBONS[A[w.a].t]; }).length === 3; })) dt++; });
    if (dt) out.push({ name: 'Ditertiary ether', n: dt });
    if (cis) out.push({ name: 'Cis', n: cis });
    if (dcis) out.push({ name: 'Double Cis', n: dcis });
    if (unknownCis) out.push({ name: '#cis-unknown', n: unknownCis });
    /* ortho pairs on benzene rings: adjacent ring atoms that both carry an exocyclic substituent */
    var ortho = 0;
    P.rings.forEach(function (r) {
      if (!(r.ar && r.size === 6)) return;
      var sub = function (k) { return A[k].nb.some(function (z) { return r.atoms.indexOf(z.a) < 0 && !P.rings.some(function (rr) { return rr !== r && rr.atoms.indexOf(k) >= 0 && rr.atoms.indexOf(z.a) >= 0; }); }); };
      for (var q = 0; q < 6; q++) {
        var a1 = r.atoms[q], a2 = r.atoms[(q + 1) % 6];
        var shared = P.rings.some(function (rr) { return rr !== r && rr.atoms.indexOf(a1) >= 0 && rr.atoms.indexOf(a2) >= 0; });
        if (!shared && sub(a1) && sub(a2)) ortho++;
      }
    });
    if (ortho > 0) out.push({ name: 'Ortho', n: ortho });
    return out;
  }
  function isCisUnused(mol, b, x, y) {
    /* use 2D coordinates after OCL has generated them */
    try {
      var cx = mol.getAtomX(x), cy = mol.getAtomY(x), dx = mol.getAtomX(y) - cx, dy = mol.getAtomY(y) - cy;
      var subX = -1, subY = -1, j;
      for (j = 0; j < mol.getConnAtoms(x); j++) if (mol.getConnAtom(x, j) !== y) subX = mol.getConnAtom(x, j);
      for (j = 0; j < mol.getConnAtoms(y); j++) if (mol.getConnAtom(y, j) !== x) subY = mol.getConnAtom(y, j);
      var s1 = dx * (mol.getAtomY(subX) - cy) - dy * (mol.getAtomX(subX) - cx);
      var s2 = dx * (mol.getAtomY(subY) - cy) - dy * (mol.getAtomX(subY) - cx);
      return s1 * s2 > 0;
    } catch (e) { return false; }
  }

  /* ---------- group lookup ---------- */
  function normalise(center, ligs) {
    ligs = ligs.slice();
    if (center === 'C[B]' || center === 'C[BF]') ligs = ligs.map(function (l) { return center === 'C[B]' && l === 'C[BF]' ? 'C[B]' : l; });
    return ligs;
  }
  function lookup(D, center, ligs) {
    ligs = normalise(center, ligs);
    var k = key(center, ligs), tried = [k];
    if (D.groups[k]) return { k: k, g: D.groups[k] };
    if (D.remaps[k] && D.groups[D.remaps[k]]) return { k: D.remaps[k], g: D.groups[D.remaps[k]], remap: k };
    /* generic carbon ligands (RMG halogen groups) */
    var gen = key(center, ligs.map(function (l) { return CARBONS[l] ? '*C' : l; }));
    if (D.groups[gen]) return { k: gen, g: D.groups[gen], approx: 'any carbon' };
    /* last resort: treat unsaturated / aromatic carbon ligands as sp3 carbon */
    var sp3 = key(center, ligs.map(function (l) { return CARBONS[l] && l !== 'CO' ? 'C' : l; }));
    if (sp3 !== k && D.groups[sp3]) return { k: sp3, g: D.groups[sp3], approx: 'ligands treated as sp3 carbon' };
    var sp3b = key(center, ligs.map(function (l) { return CARBONS[l] ? 'C' : l; }));
    if (sp3b !== k && D.groups[sp3b]) return { k: sp3b, g: D.groups[sp3b], approx: 'ligands treated as sp3 carbon' };
    return null;
  }

  /* gas-phase ΔHf by group additivity; returns {value, terms[], missing[], notes[]} */
  function groupAdditivity(OCL, D, mol) {
    var P = perceive(OCL, mol), res = { value: 0, terms: [], missing: [], notes: [] };
    typeAtoms(P);
    var unsup = P.A.filter(function (a) { return /^(S|P|Si|B|Se|Na|K|Li|Mg|Al|Zn|Fe|Cu|Pd|Sn|Ti)$/.test(a.t) || a.t === 'C=N' || a.t === 'C=S' || a.t === 'N[ar]' || a.t === 'ketene' || a.t === 'O=C=O' || a.t === 'N-O'; });
    if (unsup.length) { res.missing.push('unsupported atom type: ' + unsup.map(function (a) { return a.t === 'N[ar]' ? 'aromatic N (pyridine-type)' : a.t; }).filter(function (v, i, s) { return s.indexOf(v) === i; }).join(', ')); return res; }
    var G = groups(P), centres = {};
    G.forEach(function (g) { centres[g.atom] = 1; });
    var uncovered = P.A.filter(function (a) { return !centres[a.i] && !(a.absorbed && a.t !== 'N#' && a.nb.some(function (x) { return centres[x.a] || A_isPseudo(P.A[x.a]); })) && !((HAL[a.t] || a.t === 'CN*' || a.t === 'NO2*' || a.t === 'N#') && a.nb.some(function (x) { return centres[x.a] || (a.t === 'N#' && centres[P.A[x.a].nb.filter(function (y) { return y.a !== a.i; }).map(function (y) { return y.a; })[0]]); })); });
    if (!G.length || uncovered.length) { res.missing.push('no group scheme for ' + (uncovered.length ? uncovered.map(function (a) { return a.el; }).join(', ') + ' in this bonding' : 'this molecule')); return res; }
    if (P.polycyclic) res.notes.push('fused or bridged non-aromatic rings: ring strain taken ring by ring, so treat the estimate as rough');
    G.forEach(function (g) {
      var L = lookup(D, g.center, g.ligs);
      if (!L) { res.missing.push(g.center + '(' + normalise(g.center, g.ligs).sort().join(')(') + ')'); (res.missingKeys = res.missingKeys || []).push(key(g.center, normalise(g.center, g.ligs))); return; }
      res.terms.push({ k: L.k, name: L.g.n, v: L.g.v, src: L.g.src, approx: L.approx, atom: g.atom });
      if (L.approx) res.notes.push(L.g.n + ': ' + L.approx);
      res.value += L.g.v;
    });
    ringCorrections(P).forEach(function (rc) {
      if (rc.name === '#large') { res.notes.push(rc.size + '-membered ring: strain taken as zero'); return; }
      if (!rc.name) { res.missing.push('ring correction for a ' + rc.size + '-membered ring of this type'); return; }
      var v = D.other[rc.name];
      res.terms.push({ k: 'ring', name: rc.name + ' ring', v: v, src: 'Benson 1976' }); res.value += v;
    });
    corrections(P).forEach(function (c) {
      if (c.name === '#cis-unknown') { res.notes.push('C=C geometry not given: the average of cis and trans is used (they differ by about 1 kcal/mol)'); return; }
      var v = D.other[c.name] * c.n;
      res.terms.push({ k: c.name, name: c.name + ' × ' + c.n, v: v, src: 'Benson 1976' }); res.value += v;
    });
    /* group pairs Benson defines only as a whole (H2) */
    return res;
  }

  /* ---------- bond-energy method ---------- */
  function hyb(a) { return a.t === 'C' ? 'sp3' : a.t === 'C[B]' || a.t === 'C[BF]' ? 'ar' : a.t === 'C[t]' || a.t === 'CN*' ? 'sp' : 'sp2'; }
  var SMALL = { 'H2': { 'H–H': 1 }, 'O2': { 'O=O': 1 }, 'N2': { 'N≡N': 1 }, 'Cl2': { 'Cl–Cl': 1 }, 'Br2': { 'Br–Br': 1 }, 'I2': { 'I–I': 1 }, 'F2': { 'F–F': 1 }, 'HCl': { 'H–Cl': 1 }, 'HBr': { 'H–Br': 1 }, 'HI': { 'H–I': 1 }, 'HF': { 'H–F': 1 }, 'H2O': { 'O–H (water)': 2 }, 'H3N': { 'N–H (ammonia)': 3 }, 'CO2': { 'C=O (CO2)': 2 }, 'CO': { 'C≡O (CO)': 1 } };
  var MERGE = { 'C–F (acyl)': 'C–F', 'C–I (aryl)': 'C–I', 'C–Br (aryl)': 'C–Br', 'C–Br (acyl)': 'C–Br', 'C–I (acyl)': 'C–I', 'C–C (sp–sp2)': 'C–C (sp2/sp–sp2/sp)', 'C–C (sp–sp)': 'C–C (sp2/sp–sp2/sp)', 'C–C (ar–sp)': 'C–C (sp2/sp–sp2/sp)', 'C–C (ar–sp2)': 'C–C (sp2/sp–sp2/sp)', 'C–C (ar–ar)': 'C–C (sp2/sp–sp2/sp)', 'C–C (sp2–sp2)': 'C–C (sp2/sp–sp2/sp)' };
  function bondTypes(OCL, mol) {
    var hill = mol.getMolecularFormula().formula;
    if (SMALL[hill]) { var c = {}; for (var kk in SMALL[hill]) c[kk] = SMALL[hill][kk]; return c; }
    var raw = bondTypesRaw(OCL, mol), res = {};
    for (var k in raw) { var t = MERGE[k] || k; res[t] = (res[t] || 0) + raw[k]; }
    return res;
  }
  function bondTypesRaw(OCL, mol) {
    var P = perceive(OCL, mol); try { typeAtoms(P); } catch (e) { /* allow bond counting for ions */ }
    var A = P.A, m = P.mol, out = {};
    function add(k, n) { out[k] = (out[k] || 0) + (n || 1); }
    function cls(a) {
      if (a.el !== 'C') return a.el;
      if (a.t === 'CO') { var hasO = a.nb.some(function (x) { return A[x.a].el === 'O' && x.o === 1; }), hasN = a.nb.some(function (x) { return A[x.a].el === 'N' && x.o === 1; }), hasCl = a.nb.some(function (x) { return HAL[A[x.a].el]; }); return hasO ? 'C(acid/ester)' : hasN ? 'C(amide)' : hasCl ? 'C(acyl halide)' : a.h ? 'C(aldehyde)' : 'C(ketone)'; }
      return 'C' + (hyb(a) === 'ar' ? '(ar)' : hyb(a) === 'sp3' ? '' : '(' + hyb(a) + ')');
    }
    for (var b = 0; b < m.getBonds(); b++) {
      var x = A[m.getBondAtom(0, b)], y = A[m.getBondAtom(1, b)], o = m.getBondOrder(b);
      if (x.el === 'H' || y.el === 'H') continue;
      var ar = x.ar && y.ar && m.isAromaticBond(b);
      var e = [x.el, y.el].sort().join('');
      var k;
      if (ar) k = 'C:C aromatic';
      else if (o === 2 && e === 'CO') { var c = x.el === 'C' ? x : y; k = 'C=O ' + cls(c).replace(/^C/, '').replace(/[()]/g, '').trim(); if (c.t === 'O=C=O') k = 'C=O (CO2)'; }
      else if (o === 1 && e === 'CO') { var cc = x.el === 'C' ? x : y, oo = x.el === 'O' ? x : y; k = cc.t === 'CO' ? 'C–O (acyl)' : hyb(cc) === 'ar' ? 'C–O (aryl)' : 'C–O'; if (oo.q === -1) k = 'C–O⁻'; }
      else if (e === 'CC' && o === 1) { var hs = [hyb(x), hyb(y)].sort().join('-'); k = 'C–C ' + (hs === 'sp3-sp3' ? '(sp3–sp3)' : '(' + hs.replace('-', '–') + ')'); if (x.t === 'CO' || y.t === 'CO') k = 'C–C (to C=O)'; }
      else if (e === 'CC') k = o === 2 ? 'C=C' : 'C≡C';
      else if (e === 'CN') { var cn = x.el === 'C' ? x : y; k = o === 3 ? 'C≡N' : o === 2 ? 'C=N' : cn.t === 'CO' ? 'C–N (amide)' : hyb(cn) === 'ar' ? 'C–N (aryl)' : 'C–N'; }
      else if (e === 'NO') { var oa = x.el === 'O' ? x : y, na = x.el === 'N' ? x : y; k = (na.t === 'NO2*' && oa.absorbed) ? 'N–O (nitro)' : o === 2 ? 'N=O' : 'N–O'; }
      else if (e === 'OO') k = o === 2 ? 'O=O' : 'O–O';
      else if (e === 'NN') k = o === 3 ? 'N≡N' : o === 2 ? 'N=N' : 'N–N';
      else if (/^C(Cl|Br|F|I)$/.test(e) || /^(Br|Cl|F|I)C$/.test(e)) { var ca = x.el === 'C' ? x : y, hal = x.el === 'C' ? y.el : x.el; k = 'C–' + hal + (ca.t === 'CO' ? ' (acyl)' : hyb(ca) === 'ar' ? ' (aryl)' : ''); }
      else k = x.el + (o === 2 ? '=' : o === 3 ? '≡' : '–') + y.el;
      add(k);
    }
    /* X–H bonds from hydrogen counts */
    A.forEach(function (a) {
      if (!a.h) return;
      var k;
      if (a.el === 'C') k = a.t === 'CO' ? 'C–H (aldehyde)' : hyb(a) === 'sp3' ? 'C–H' : hyb(a) === 'ar' ? 'C–H (aromatic)' : 'C–H (sp2/sp)';
      else if (a.el === 'O') { var onC = a.nb.filter(function (x) { return A[x.a].t === 'CO'; }).length; k = !a.nb.length ? 'O–H (water)' : onC ? 'O–H (acid)' : a.nb.some(function (x) { return A[x.a].ar; }) ? 'O–H (phenol)' : 'O–H'; }
      else if (a.el === 'N') k = a.nb.some(function (x) { return A[x.a].t === 'CO'; }) ? 'N–H (amide)' : 'N–H';
      else if (a.el === 'H') k = 'H–H';
      else k = a.el + '–H';
      add(k, a.h);
      if (a.el === 'H') out['H–H'] = 0.5 * (out['H–H'] || 0);
    });
    return out;
  }

  /* descriptors for the heat-of-vaporisation model (counts of structural features) */
  function vapFeatures(OCL, mol) {
    var P = perceive(OCL, mol); typeAtoms(P);
    var A = P.A, f = { C: 0, Cq: 0, Car: 0, F: 0, Cl: 0, Br: 0, I: 0, OH: 0, PhOH: 0, COOH: 0, ester: 0, ketone: 0, aldehyde: 0, ether: 0, NH2: 0, NH: 0, N3: 0, amideNH2: 0, amideNH: 0, amideN: 0, nitrile: 0, nitro: 0, ring: 0, S: 0, Narom: 0 };
    A.forEach(function (a) {
      var nbT = a.nb.map(function (x) { return A[x.a]; });
      if (a.el === 'C') { f.C++; if (a.t === 'C' && a.nb.length === 4) f.Cq++; if (a.ar) f.Car++; }
      if (f[a.el] !== undefined && /^(F|Cl|Br|I|S)$/.test(a.el)) f[a.el]++;
      if (a.t === 'O') {
        var co = nbT.filter(function (b) { return b.t === 'CO'; }).length;
        if (a.h === 1 && co) f.COOH++;
        else if (a.h === 1 && nbT.some(function (b) { return b.ar; })) f.PhOH++;
        else if (a.h === 1) f.OH++;
        else if (a.h === 0 && co === 1) f.ester++;
        else if (a.h === 0 && !co) f.ether++;
      }
      if (a.t === 'CO') { var hetero = nbT.some(function (b) { return (b.el === 'O' && !b.absorbed) || b.el === 'N' || HAL[b.el]; }); if (!hetero) { if (a.h) f.aldehyde++; else f.ketone++; } }
      if (a.t === 'N') {
        var am = nbT.some(function (b) { return b.t === 'CO'; });
        if (am) { if (a.h === 2) f.amideNH2++; else if (a.h === 1) f.amideNH++; else f.amideN++; }
        else { if (a.h === 2) f.NH2++; else if (a.h === 1) f.NH++; else f.N3++; }
      }
      if (a.t === 'N[ar]') f.Narom++;
      if (a.t === 'CN*') f.nitrile++;
      if (a.t === 'NO2*') f.nitro++;
    });
    f.ring = P.rings.length;
    return f;
  }

  /* ---------- per-compound thermochemistry ---------- */
  var SRCN = { a: 'ATcT', c: 'CRC Handbook', p: 'API TDB', w: 'NIST WebBook', j: 'NIST-JANAF', y: 'Yaws' };
  function srcName(code) { return code.split('').map(function (c) { return SRCN[c] || c; }).join(', '); }
  function vapEstimate(Mdl, OCL, mol) {
    var f = vapFeatures(OCL, mol), s = Mdl.vap.const;
    for (var k in Mdl.vap) if (k !== 'const') s += Mdl.vap[k] * (f[k] || 0);
    return s;
  }
  function parseFlag(fl) {
    var out = {};
    (fl || '').split(';').forEach(function (x) { if (!x) return; out[x[0]] = parseFloat(x.slice(1)); });
    return out;
  }
  /* compound(): everything needed for one component. smiles in, object out. */
  function compound(OCL, Mdl, Meas, smiles) {
    if (smiles === '[HH]') smiles = '[H][H]';
    var mol = OCL.Molecule.fromSmiles(smiles);
    var mf = mol.getMolecularFormula(), idc = mol.getIDCode();
    var c = { smiles: smiles, formula: mf.formula, mw: mf.relativeWeight, idc: idc, meas: Meas ? Meas[idc] || null : null, atoms: {} };
    for (var i = 0; i < mol.getAllAtoms(); i++) { var el = mol.getAtomLabel(i); c.atoms[el] = (c.atoms[el] || 0) + 1; if (mol.getAtomicNo(i) !== 1) { var h = mol.getAllHydrogens(i); if (h) c.atoms.H = (c.atoms.H || 0) + h; } }
    c.charge = 0; for (i = 0; i < mol.getAllAtoms(); i++) c.charge += mol.getAtomCharge(i);
    try { c.ga = groupAdditivity(OCL, Mdl, mol); } catch (e) { c.ga = { value: 0, terms: [], missing: [String(e)], notes: [] }; }
    c.gaOK = !c.ga.missing.length;
    try { c.bonds = bondTypes(OCL, mol); c.bondsOK = Object.keys(c.bonds).every(function (k) { return Mdl.bonds[k] !== undefined; }) && Object.keys(c.bonds).length > 0; } catch (e) { c.bonds = {}; c.bondsOK = false; }
    c.bondSum = 0; c.bondMissing = [];
    for (var k in c.bonds) { if (Mdl.bonds[k] === undefined) c.bondMissing.push(k); else c.bondSum += Mdl.bonds[k] * c.bonds[k]; }
    try { c.hvapEst = vapEstimate(Mdl, OCL, mol); } catch (e) { c.hvapEst = null; }
    return c;
  }
  /* ΔHf of a compound in a phase, with method and a typical uncertainty (kcal/mol) */
  function hf(c, phase, override) {
    if (override !== undefined && override !== null && override !== '' && isFinite(+override)) return { v: +override, how: 'your value', u: 0, notes: [] };
    var m = c.meas, notes = [], g = null, gu = 0, ghow = '';
    if (m && m[3]) {
      var fl = parseFlag(m[3][2]), single = m[3][1].length === 1 && m[3][1] !== 'a';
      if (fl.g !== undefined && single && c.gaOK) {
        notes.push('The only published gas value (' + srcName(m[3][1]) + ', ' + m[3][0].toFixed(1) + ') disagrees with group additivity by ' + Math.abs(m[3][0] - c.ga.value).toFixed(0) + ' kcal/mol, so group additivity is used.');
      } else {
        g = m[3][0]; ghow = 'measured, gas (' + srcName(m[3][1]) + ')'; gu = m[3][1] === 'a' ? 0.1 : m[3][1].length > 1 ? 0.5 : 1;
        if (fl.D !== undefined || fl.d !== undefined) { gu = Math.max(gu, (fl.D || fl.d) / 2); notes.push('Published gas values differ by ' + (fl.D || fl.d).toFixed(1) + ' kcal/mol' + (fl.D !== undefined ? '; the one closest to group additivity is used.' : '.')); }
        if (fl.g !== undefined) notes.push('Group additivity gives ' + fl.g.toFixed(1) + ' kcal/mol; check this compound.');
      }
    }
    if (g === null && c.gaOK) { g = c.ga.value; gu = c.ga.notes.length ? 4 : 1.5; ghow = 'group additivity, gas'; if (c.ga.notes.length) notes = notes.concat(c.ga.notes); }
    if (phase === 'g') {
      if (g !== null) return { v: g, how: ghow, u: gu, notes: notes };
      if (m && m[4] && c.hvapEst !== null) return { v: m[4][0] + c.hvapEst, how: 'measured liquid + estimated heat of vaporisation', u: 1.5, notes: notes };
      return null;
    }
    if (phase === 'l' || phase === 's') {
      if (phase === 's' && m && m[5]) return { v: m[5][0], how: 'measured, solid (' + srcName(m[5][1]) + ')', u: m[5][1].length > 1 ? 0.5 : 1, notes: notes };
      var lv = null, lu = 0, lhow = '';
      if (m && m[4]) { lv = m[4][0]; lu = m[4][1] === 'a' ? 0.1 : m[4][1].length > 1 ? 0.5 : 1; lhow = 'measured, liquid (' + srcName(m[4][1]) + ')'; var fl2 = parseFlag(m[4][2]); if (fl2.v !== undefined) notes.push('The published liquid and gas values imply a heat of vaporisation of ' + fl2.v.toFixed(1) + ' kcal/mol, which looks inconsistent.'); }
      else if (g !== null && c.hvapEst !== null) { lv = g - c.hvapEst; lu = Math.sqrt(gu * gu + 1.5 * 1.5); lhow = ghow.replace(', gas', '') + ' − estimated heat of vaporisation (' + c.hvapEst.toFixed(1) + ')'; }
      if (lv === null) return null;
      if (phase === 's') { notes.push('No measured solid value: the liquid value is used. The heat of fusion (often 3 to 8 kcal/mol) is not included, so enter a measured ΔHf if you have one.'); return { v: lv, how: lhow + ', used for the solid', u: Math.sqrt(lu * lu + 25), notes: notes }; }
      return { v: lv, how: lhow, u: lu, notes: notes };
    }
    return null;
  }
  /* reaction(): comps = [{c: compound(), nu: coefficient (+products, −reactants), phase, override}] */
  function reaction(Mdl, comps) {
    var out = { ok: true, msgs: [], rows: [], balance: {}, best: 0, u2: 0, gasGA: 0, gasBE: 0, gasMeas: 0, phaseCorr: 0, measAll: true, gaAll: true, beAll: true, beRows: {} };
    comps.forEach(function (x) {
      var c = x.c, nu = x.nu;
      for (var e in c.atoms) out.balance[e] = (out.balance[e] || 0) + nu * c.atoms[e];
      out.balance['charge'] = (out.balance['charge'] || 0) + nu * c.charge;
      var h = hf(c, x.phase, x.override), hg = hf(c, 'g', null);
      out.rows.push({ x: x, h: h, hg: hg });
      if (!h) { out.ok = false; out.msgs.push('No heat of formation for ' + (x.label || c.formula) + ': ' + (c.ga.missing.join('; ') || 'not in the data') + '. Enter a value for it.'); return; }
      out.best += nu * h.v; out.u2 += Math.pow(nu * h.u, 2);
      /* method comparison in the gas phase */
      var inorganic = !c.atoms.C || /^(CO|CO2)$/.test(c.formula);
      if (c.gaOK) out.gasGA += nu * c.ga.value;
      else if (inorganic && c.meas && c.meas[3]) { out.gasGA += nu * c.meas[3][0]; out.gaUsesMeas = true; }
      else out.gaAll = false;
      if (c.meas && c.meas[3]) out.gasMeas += nu * c.meas[3][0]; else out.measAll = false;
      if (c.bondsOK && isFinite(sumAtoms(Mdl, c.atoms))) { out.gasBE += nu * (sumAtoms(Mdl, c.atoms) - c.bondSum); for (var k in c.bonds) out.beRows[k] = (out.beRows[k] || 0) + nu * c.bonds[k]; } else out.beAll = false;
      if (hg) out.phaseCorr += nu * (h.v - hg.v); else out.phaseOK = false;
    });
    out.unbalanced = Object.keys(out.balance).filter(function (e) { return Math.abs(out.balance[e]) > 1e-6; });
    out.u = Math.sqrt(out.u2);
    return out;
  }
  function sumAtoms(Mdl, atoms) { var s = 0; for (var e in atoms) s += (Mdl.atoms[e] || NaN) * atoms[e]; return s; }

  return { compound: compound, hf: hf, reaction: reaction, srcName: srcName, vapFeatures: vapFeatures, perceive: perceive, typeAtoms: typeAtoms, groups: groups, groupAdditivity: groupAdditivity, bondTypes: bondTypes, key: key, ringCorrections: ringCorrections, corrections: corrections };
});
