/* NPSH calculator with a line diagram: source vessel → suction line → pump → discharge line → destination
   NPSHa = (P_surface − P_vapour)/(ρg) + Z − h_f(suction), metres of liquid at the pump centre line.
   Pump head = (P_dest − P_source)/(ρg) + (Z_dest − Z_source) + h_f(suction) + h_f(discharge).
   Vapour pressure: Antoine constants of the PharmaChemE solvent pages (log10 P[mmHg] = A − B/(C + T[°C])).
   Line loss: Darcy–Weisbach with the Churchill friction factor plus K values for the fittings. */
(function () {
  "use strict";
  const ME = document.currentScript, DATA = (ME && ME.getAttribute("data-sol")) || "/assets/data/solvent-lite.json";
  let MODE = "npsh"; /* "npsh" or "head" (pump head calculator page) */
  let KEY = "pce-npsh-v2"; const g = 9.80665, MMHG = 133.322368, KSC = 98066.5;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v, d) => { const x = parseFloat(v); return isFinite(x) ? x : d; };
  const f = (x, d) => (isFinite(x) ? Number(x).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");
  let SOL = [];

  /* schedule 40 inside diameters, mm */
  const NPS = { 15: 15.8, 20: 20.9, 25: 26.6, 40: 40.9, 50: 52.5, 65: 62.7, 80: 77.9, 100: 102.3, 150: 154.1, 200: 202.7 };
  const INCH = { 15: "½", 20: "¾", 25: "1", 40: "1½", 50: "2", 65: "2½", 80: "3", 100: "4", 150: "6", 200: "8" };
  const STR = { none: ["None", 0], clean: ["Strainer, clean", 2], dirty: ["Strainer, half blocked", 8], foot: ["Foot valve + strainer", 8] };
  const base = { q: 20, ns: 80, len: 10, elb: 2, val: 1, str: "clean", npshr: 3, margin: 1, h2: 12, p2: 0, ns2: 65, len2: 30, elb2: 4, val2: 2, eff: 60, alt: 0 };
  const SCEN = {
    flooded: { t: "Open tank", d: "Vented tank above the pump", v: { fluid: "water", T: 30, z: 2 } },
    lift: { t: "Suction lift", d: "Pump above a sump or pit", v: { fluid: "water", T: 30, z: 3, str: "foot", val: 0, len: 8 } },
    pressure: { t: "Nitrogen-padded vessel", d: "Closed vessel under N₂", v: { fluid: "toluene", T: 40, pg: 0.3, z: 1.5, q: 10, ns: 50, ns2: 40, elb: 3, h2: 15 } },
    vacuum: { t: "Vacuum receiver", d: "Receiver under vacuum", v: { fluid: "methanol", T: 30, pa: 250, z: 2.5, q: 5, npshr: 2, ns: 40, ns2: 40, len: 8, elb: 3, h2: 10 } },
    boiling: { t: "Column bottoms", d: "Liquid at its boiling point", v: { fluid: "toluene", pb: 0, z: 4, npshr: 2.5, q: 15, ns: 80, ns2: 50, len: 15, elb: 4, h2: 20 } },
    condensate: { t: "Hot condensate", d: "Vented tank, near 100 °C", v: { fluid: "water", T: 95, z: 2, q: 5, npshr: 2, ns: 50, ns2: 40, len: 6, h2: 8 } },
  };
  const DEF = (k) => Object.assign({ sc: k || "flooded", rho: "", pv: "", mu: "", rough: 0.045, kx: 0, pg: 0.3, pa: 250, pb: 0 }, base, SCEN[k || "flooded"].v);
  let S = null;
  const load = () => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && SCEN[x.sc]) return Object.assign(DEF(x.sc), x); } catch (e) {} return DEF(); };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  const sol = () => SOL.find((s) => s.s === S.fluid);
  function antoine(s, T) { if (s.s === "water" && T > 99) return Math.pow(10, 8.14019 - 1810.94 / (244.485 + T)); return Math.pow(10, s.a[0] - s.a[1] / (s.a[2] + T)); }
  function tBoil(s, Pmm) { if (s.s === "water" && Pmm > 733) return 1810.94 / (8.14019 - Math.log10(Pmm)) - 244.485; return s.a[1] / (s.a[0] - Math.log10(Pmm)) - s.a[2]; }
  const rhoWater = (T) => 1000 * (1 - ((T + 288.9414) / (508929.2 * (T + 68.12963))) * (T - 3.9863) ** 2);
  const pAtm = (alt) => 101325 * Math.pow(1 - 2.25577e-5 * Math.max(-400, Math.min(5000, alt)), 5.25588);

  function props(T) {
    const s = sol(), o = { rho: num(S.rho, NaN), pv: num(S.pv, NaN), mu: num(S.mu, NaN), auto: {} };
    if (s) {
      if (!isFinite(o.rho)) { o.rho = s.s === "water" ? rhoWater(T) : s.rho; o.auto.rho = true; }
      if (!isFinite(o.pv)) { o.pv = antoine(s, T); o.auto.pv = true; }
      if (!isFinite(o.mu)) { o.mu = s.s === "water" ? Math.max(0.2, 2.414e-2 * Math.pow(10, 247.8 / (T + 133.15))) : s.mu; o.auto.mu = true; }
    }
    if (!isFinite(o.rho)) o.rho = 1000; if (!isFinite(o.pv)) o.pv = 20; if (!isFinite(o.mu)) o.mu = 1;
    return o;
  }

  function line(q, p, ns, L, K) {
    const D = (NPS[ns] || num(ns, 50)) / 1000, A = (Math.PI * D * D) / 4, v = q / 3600 / A;
    if (!(D > 0) || q <= 0) return { v: 0, hf: 0, Re: 0, K, D };
    const Re = (p.rho * v * D) / (p.mu / 1000), e = num(S.rough, 0.045) / 1000;
    const a = Math.pow(2.457 * Math.log(1 / (Math.pow(7 / Re, 0.9) + (0.27 * e) / D)), 16), b = Math.pow(37530 / Re, 16);
    const fD = 8 * Math.pow(Math.pow(8 / Re, 12) + 1 / Math.pow(a + b, 1.5), 1 / 12);
    return { v, Re, K, D, hf: ((fD * Math.max(0, L)) / D + K) * ((v * v) / (2 * g)) };
  }
  const kSuc = () => 0.5 + 0.75 * Math.max(0, num(S.elb, 0)) + 0.2 * Math.max(0, num(S.val, 0)) + (STR[S.str] || STR.none)[1] + Math.max(0, num(S.kx, 0));
  /* discharge: elbows, open valves, a check valve (2) and the exit into the vessel (1) */
  const kDis = () => 0.75 * Math.max(0, num(S.elb2, 0)) + 0.2 * Math.max(0, num(S.val2, 0)) + 2;

  function surfaceP(o) {
    if (o.P != null) return o.P;
    if (S.sc === "boiling") return num(S.pb, 0) * KSC + pAtm(num(S.alt, 0));
    if (S.sc === "pressure") return num(S.pg, 0) * KSC + pAtm(num(S.alt, 0));
    if (S.sc === "vacuum") return num(S.pa, 250) * MMHG;
    return pAtm(num(S.alt, 0));
  }
  function calc(o) {
    o = o || {};
    const s = sol(), P = surfaceP(o);
    let T = o.T != null ? o.T : num(S.T, 30);
    if (S.sc === "boiling" && s) T = tBoil(s, P / MMHG);
    const p = props(T), Pv = S.sc === "boiling" ? P : p.pv * MMHG;
    const z = o.z != null ? o.z : S.sc === "lift" ? -num(S.z, 0) : num(S.z, 0);
    const q = o.q != null ? o.q : num(S.q, 0);
    const su = line(q, p, S.ns, num(S.len, 0), kSuc()), di = line(q, p, S.ns2, num(S.len2, 0), kDis());
    const hP = P / (p.rho * g), hV = Pv / (p.rho * g), npsha = hP - hV + z - su.hf;
    const P2 = num(S.p2, 0) * KSC + pAtm(num(S.alt, 0));
    /* velocity head lost where the line ends in the destination (exit loss, K = 1) */
    const hExit = (di.v * di.v) / (2 * g), h2 = num(S.h2, 0), dPh = (P2 - P) / (p.rho * g);
    const head = dPh + (h2 - z) + su.hf + di.hf + hExit;
    const hyd = (p.rho * g * (q / 3600) * head) / 1000, kW = hyd / (Math.max(5, num(S.eff, 60)) / 100);
    /* gauge readings at the pump flanges (static pressure, gauges at the centre line) */
    const Ps = P + p.rho * g * (z - su.hf) - (p.rho * su.v * su.v) / 2;
    const Pd = P2 + p.rho * g * (h2 + di.hf + hExit) - (p.rho * di.v * di.v) / 2;
    return { T, P, Pv, p, z, q, su, di, hP, hV, npsha, head, kW, hyd, P2, hExit, dPh, h2, Ps, Pd };
  }
  const need = () => num(S.npshr, 0) + Math.max(0, num(S.margin, 1));
  const MOTORS = [0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3.7, 5.5, 7.5, 9.3, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200];
  const motor = (kW) => MOTORS.find((m) => m >= kW * 1.15) || null;
  const gauge = (Pa, alt) => { const gg = (Pa - pAtm(alt)) / KSC; return gg >= 0 ? f(gg, 2) + " kg/cm² g" : f(gg, 2) + " kg/cm² g (" + f((pAtm(alt) - Pa) / MMHG, 0) + " mmHg vacuum)"; };
  const gaugeShort = (Pa, alt) => { const gg = (Pa - pAtm(alt)) / KSC; return gg >= 0 ? f(gg, 2) + " kg/cm²" : f((pAtm(alt) - Pa) / MMHG, 0) + " mmHg vac"; };
  function bisect(fn, lo, hi) { let flo = fn(lo); for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2, fm = fn(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; }

  function limits(R) {
    const out = [], N = need(), gap = R.npsha - N, s = sol(), zLim = R.z - gap;
    if (S.sc === "lift") out.push(["Highest lift", zLim <= 0 ? f(-zLim, 2) + " m" : "none"]);
    else out.push(["Lowest liquid level", zLim >= 0 ? f(zLim, 2) + " m above the pump" : f(-zLim, 2) + " m below the pump"]);
    if (S.sc !== "boiling" && s) {
      const fn = (T) => calc({ T }).npsha - N, Tb = tBoil(s, R.P / MMHG);
      out.push(["Highest temperature", fn(-20) < 0 ? "none" : f(fn(Tb - 0.01) > 0 ? Tb : bisect(fn, -20, Tb - 0.01), 1) + " °C"]);
    }
    if (num(S.q, 0) > 0) { const fq = (q) => calc({ q }).npsha - N, hi = num(S.q, 1) * 20; out.push(["Highest flow", fq(0) < 0 ? "none" : fq(hi) > 0 ? "> " + f(hi, 0) + " m³/h" : f(bisect(fq, 0, hi), 1) + " m³/h"]); }
    if (S.sc === "pressure" || S.sc === "vacuum") { const Pm = R.P - gap * R.p.rho * g, pg = (Pm - pAtm(num(S.alt, 0))) / KSC; out.push(["Lowest vessel pressure", Pm <= R.Pv ? "none" : pg < 0 ? f(Pm / MMHG, 0) + " mmHg abs" : f(pg, 2) + " kg/cm² g"]); }
    return out;
  }

  /* ---------- the diagram ---------- */
  function diagram(R) {
    const sc = S.sc, ok = R.npsha >= need(), cav = R.npsha < num(S.npshr, 0) || (R.Pv > R.P * 1.0001 && sc !== "boiling");
    const col = MODE === "head" ? "#4E9AD6" : cav ? "#E0605A" : ok ? "#5BB37A" : "#D9A441";
    const PX = 470, lift = sc === "lift", PY = lift ? 250 : 330;
    const PIPE = "#9fb0c3", LIQ = "#2f6fa3", STEEL = "#c9d3de";
    let s = `<svg viewBox="0 0 1000 480" width="100%" role="img" aria-label="Line diagram: source vessel, suction line, pump, discharge line and destination" font-family="sans-serif" font-size="13">
      <defs><marker id="np-ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#D9A441"/></marker>
      <marker id="np-fl" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${PIPE}"/></marker></defs>`;
    const dim = (x, y1, y2, txt, dx, ty) => { dx = dx == null ? -8 : dx; return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#D9A441" stroke-width="1.4" marker-start="url(#np-ar)" marker-end="url(#np-ar)"/><text x="${x + dx}" y="${ty || (y1 + y2) / 2 + 4}" fill="#D9A441" text-anchor="${dx < 0 ? "end" : "start"}" font-weight="700">${txt}</text>`; };
    const tag = (x, y, txt, c, anchor) => `<text x="${x}" y="${y}" fill="${c || "#c9d3de"}" text-anchor="${anchor || "middle"}">${txt}</text>`;
    const valve = (x, y, vert) => vert ? `<path d="M${x - 8},${y - 10} L${x + 8},${y - 10} L${x - 8},${y + 10} L${x + 8},${y + 10} z" fill="#1b2838" stroke="${STEEL}" stroke-width="1.6"/>` : `<path d="M${x - 10},${y - 8} L${x + 10},${y + 8} L${x + 10},${y - 8} L${x - 10},${y + 8} z" fill="#1b2838" stroke="${STEEL}" stroke-width="1.6"/>`;
    const fmtZ = f(num(S.z, 0), 1) + " m";

    /* source vessel */
    let outX = 185, outY;
    if (lift) {
      s += `<line x1="30" y1="300" x2="330" y2="300" stroke="#6b7c8f" stroke-width="2"/><text x="34" y="316" fill="#7d8da1" font-size="11">ground</text>`;
      s += `<path d="M80,300 L80,455 L290,455 L290,300" fill="none" stroke="${STEEL}" stroke-width="2.5"/><rect x="82" y="370" width="206" height="83" fill="${LIQ}" opacity=".75"/>`;
      s += `<line x1="200" y1="432" x2="200" y2="${PY}" stroke="${PIPE}" stroke-width="7"/><rect x="190" y="430" width="20" height="14" fill="#1b2838" stroke="${STEEL}"/>${tag(222, 444, "foot valve", "#e8eef5", "start")}`;
      outX = 200;
      s += dim(50, 370, PY, "lift " + fmtZ, 8, 285);
      s += tag(130, 400, "sump", "#e8eef5");
    } else if (sc === "boiling") {
      s += `<rect x="130" y="24" width="110" height="246" rx="40" fill="#1b2838" stroke="${STEEL}" stroke-width="2.5"/>`;
      for (let y = 64; y < 175; y += 22) s += `<line x1="140" y1="${y}" x2="230" y2="${y}" stroke="#55677c" stroke-dasharray="6 4"/>`;
      s += `<path d="M132,192 L238,192 L238,240 Q185,272 132,240 z" fill="${LIQ}" opacity=".8"/>`;
      s += `<path d="M240,218 L282,218 L282,170 L240,170" fill="none" stroke="#c8693a" stroke-width="3"/>${tag(290, 198, "reboiler", "#c8693a", "start")}`;
      s += tag(185, 16, `column ${f(num(S.pb, 0), 2)} kg/cm² g`, "#e8eef5");
      outY = 266;
      s += dim(105, 192, PY, fmtZ);
    } else {
      const top = 90, bot = 270;
      s += `<rect x="90" y="${top}" width="190" height="${bot - top}" rx="12" fill="#1b2838" stroke="${STEEL}" stroke-width="2.5"/><path d="M92,170 L278,170 L278,${bot - 10} Q278,${bot - 2} 268,${bot - 2} L102,${bot - 2} Q92,${bot - 2} 92,${bot - 10} z" fill="${LIQ}" opacity=".75"/>`;
      if (sc === "flooded" || sc === "condensate") {
        s += `<path d="M185,${top} L185,${top - 30} L205,${top - 30}" fill="none" stroke="${PIPE}" stroke-width="4"/>${tag(212, top - 26, sc === "condensate" ? "vent (flash steam)" : "vent to atmosphere", "#9fb0c3", "start")}`;
        if (sc === "condensate") s += `<path d="M120,${top - 8} q6,-12 0,-24 q-6,-12 0,-24 M140,${top - 8} q6,-12 0,-24 q-6,-12 0,-24" fill="none" stroke="#7d8da1" stroke-width="1.5"/>`;
      } else if (sc === "pressure") s += `<path d="M185,${top} L185,${top - 30} L240,${top - 30}" fill="none" stroke="#7fb2d9" stroke-width="3"/>${valve(215, top - 30)}${tag(248, top - 26, `N₂ ${f(num(S.pg, 0), 2)} kg/cm² g`, "#7fb2d9", "start")}`;
      else if (sc === "vacuum") s += `<path d="M185,${top} L185,${top - 30} L240,${top - 30}" fill="none" stroke="#b48ad9" stroke-width="3"/>${tag(248, top - 26, `to vacuum, ${f(num(S.pa, 0), 0)} mmHg abs`, "#b48ad9", "start")}`;
      s += tag(185, 140, sc === "pressure" ? "vessel" : sc === "vacuum" ? "receiver" : "tank", "#e8eef5");
      s += tag(185, 230, f(R.T, 0) + " °C", "#e8eef5");
      outY = bot;
      s += dim(70, 170, PY, fmtZ);
    }
    /* pump centre line reference */
    s += `<line x1="30" y1="${PY}" x2="${PX - 34}" y2="${PY}" stroke="#55677c" stroke-dasharray="3 4"/>`;
    /* suction line */
    s += lift ? `<path d="M${outX},${PY} L${PX - 28},${PY}" fill="none" stroke="${PIPE}" stroke-width="7"/>` : `<path d="M${outX},${outY} L${outX},${PY} L${PX - 28},${PY}" fill="none" stroke="${PIPE}" stroke-width="7" stroke-linejoin="round"/>`;
    if (num(S.val, 0) > 0) s += valve(300, PY);
    if (S.str === "clean" || S.str === "dirty") s += `<path d="M352,${PY} l14,0 l10,16 l-8,5 z" fill="#1b2838" stroke="${S.str === "dirty" ? "#E0605A" : STEEL}" stroke-width="1.6"/>`;
    s += `<line x1="${lift ? 250 : 232}" y1="${PY - 22}" x2="${lift ? 272 : 254}" y2="${PY - 22}" stroke="${PIPE}" stroke-width="2" marker-end="url(#np-fl)"/>`;
    s += tag(lift ? 330 : 335, lift ? PY + 22 : PY + 40, `suction ${f(num(S.len, 0), 0)} m, ${INCH[S.ns] || ""}"`, "#c9d3de");
    s += tag(lift ? 330 : 335, lift ? PY + 39 : PY + 57, `loss ${f(R.su.hf, 2)} m · ${f(R.su.v, 2)} m/s`, "#9fb0c3");
    /* pump */
    s += `<path d="M${PX + 10},${PY - 26} L${PX + 10},70 L800,70" fill="none" stroke="${PIPE}" stroke-width="6" stroke-linejoin="round"/>`;
    s += `<circle cx="${PX}" cy="${PY}" r="28" fill="#1b2838" stroke="${col}" stroke-width="3"/><path d="M${PX - 12},${PY - 14} L${PX + 16},${PY} L${PX - 12},${PY + 14} z" fill="${col}" opacity=".85"/>`;
    if (MODE === "head") {
      /* pressure gauges on the suction and discharge flanges */
      const gz = (x, y, txt, anchor, dx) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 18}" stroke="${STEEL}" stroke-width="2"/><circle cx="${x}" cy="${y - 28}" r="10" fill="#e8eef5" stroke="${STEEL}"/><line x1="${x}" y1="${y - 28}" x2="${x + 6}" y2="${y - 34}" stroke="#0f1a26" stroke-width="1.6"/>${tag(x + dx, y - 24, txt, "#e8eef5", anchor)}`;
      s += gz(PX - 50, PY - 4, "Ps " + gaugeShort(R.Ps, num(S.alt, 0)), "end", -14);
      const dy = PY - 70;
      s += `<line x1="${PX + 7}" y1="${dy}" x2="${PX - 12}" y2="${dy}" stroke="${STEEL}" stroke-width="2"/><circle cx="${PX - 22}" cy="${dy}" r="10" fill="#e8eef5" stroke="${STEEL}"/><line x1="${PX - 22}" y1="${dy}" x2="${PX - 16}" y2="${dy - 6}" stroke="#0f1a26" stroke-width="1.6"/>${tag(PX - 38, dy + 4, "Pd " + gaugeShort(R.Pd, num(S.alt, 0)), "#e8eef5", "end")}`;
      s += `<rect x="${PX - 96}" y="${PY + 70}" width="192" height="54" rx="4" fill="#0f1a26" stroke="#4E9AD6" stroke-width="2"/>${tag(PX, PY + 93, `total head ${f(R.head, 2)} m`, "#7fb2d9")}${tag(PX, PY + 113, `${f(R.head * R.p.rho * g / KSC, 2)} kg/cm² across the pump`, "#c9d3de")}<line x1="${PX}" y1="${PY + 30}" x2="${PX}" y2="${PY + 70}" stroke="#4E9AD6" stroke-width="1.5"/>`;
    } else
    s += `<line x1="${PX}" y1="${PY + 30}" x2="${PX}" y2="${PY + 70}" stroke="${col}" stroke-width="1.5"/><rect x="${PX - 96}" y="${PY + 70}" width="192" height="54" rx="4" fill="#0f1a26" stroke="${col}" stroke-width="2"/>${tag(PX, PY + 93, `NPSHa ${f(R.npsha, 2)} m`, col)}${tag(PX, PY + 113, `NPSHr ${f(num(S.npshr, 0), 1)} m, margin ${f(R.npsha - num(S.npshr, 0), 2)} m`, "#c9d3de")}`;
    /* discharge fittings */
    const cy = Math.round((PY + 70) / 2) + 26;
    s += `<rect x="${PX + 2}" y="${cy}" width="16" height="12" fill="#1b2838" stroke="${STEEL}" stroke-width="1.4"/>${tag(PX + 24, cy + 10, "check valve", "#9fb0c3", "start")}`;
    if (num(S.val2, 0) > 0) s += valve(PX + 10, cy - 34, true);
    s += `<line x1="640" y1="54" x2="668" y2="54" stroke="${PIPE}" stroke-width="2" marker-end="url(#np-fl)"/>`;
    s += tag(650, 100, `discharge ${f(num(S.len2, 0), 0)} m, ${INCH[S.ns2] || ""}"`, "#c9d3de");
    s += tag(650, 117, `loss ${f(R.di.hf, 2)} m · ${f(R.di.v, 2)} m/s`, "#9fb0c3");
    /* destination */
    s += `<path d="M800,70 L830,70 L830,92" fill="none" stroke="${PIPE}" stroke-width="6"/><rect x="800" y="40" width="140" height="130" rx="10" fill="none" stroke="${STEEL}" stroke-width="2.5"/>`;
    s += tag(870, 125, "destination", "#e8eef5") + tag(870, 145, `${f(num(S.p2, 0), 2)} kg/cm² g`, "#9fb0c3");
    s += `<line x1="760" y1="${PY}" x2="985" y2="${PY}" stroke="#55677c" stroke-dasharray="3 4"/>`;
    s += dim(965, 70, PY, f(num(S.h2, 0), 1) + " m", -8, Math.max((70 + PY) / 2 + 4, 195));
    if (MODE === "head") {
      /* total static head: source liquid level to destination entry */
      const ly = lift ? 370 : sc === "boiling" ? 192 : 170, yS = PY - (R.z >= 0 ? 0 : 0);
      s += `<line x1="290" y1="${ly}" x2="790" y2="${ly}" stroke="#D9A441" stroke-dasharray="2 5" opacity=".7"/>`;
      s += dim(785, 70, ly, "total static " + f(R.h2 - R.z, 1) + " m", -8, lift ? 340 : Math.max((70 + ly) / 2 + 4, 190));
      s += `<rect x="560" y="${PY - 60}" width="180" height="52" rx="4" fill="#0f1a26" stroke="#4E9AD6" stroke-width="1.5"/>${tag(650, PY - 38, `${f(R.kW, 2)} kW shaft at ${f(num(S.eff, 60), 0)} %`, "#7fb2d9")}${tag(650, PY - 18, motor(R.kW) ? `motor ${motor(R.kW)} kW` : "", "#c9d3de")}`;
    } else
    s += `<rect x="560" y="${PY - 60}" width="180" height="52" rx="4" fill="#0f1a26" stroke="#4E9AD6" stroke-width="1.5"/>${tag(650, PY - 38, `pump head ${f(R.head, 1)} m`, "#7fb2d9")}${tag(650, PY - 18, `${f(R.kW, 2)} kW at ${f(num(S.eff, 60), 0)} %`, "#c9d3de")}`;
    s += tag(760, PY + 16, "pump centre line", "#7d8da1", "start");
    return s + `</svg>`;
  }

  function resultsHead() {
    const R = calc(), alt = num(S.alt, 0), rg = R.p.rho * g, mtr = motor(R.kW);
    $("np-dia").innerHTML = diagram(R);
    const notes = [];
    if (R.head < 0) notes.push(["np-bad", "The destination is lower, or at lower pressure, than the source: the liquid would flow there by gravity and a pump is not needed at this flow."]);
    if (S.sc !== "boiling" && R.Pv > R.P * 1.0001) notes.push(["np-bad", `The liquid is above its boiling point at the source pressure (vapour pressure ${f(R.Pv / MMHG, 0)} mmHg against ${f(R.P / MMHG, 0)} mmHg): it flashes and cannot be pumped like this.`]);
    else if (R.Ps < R.Pv * 1.0001) notes.push(["np-bad", "The suction pressure at the pump is below the vapour pressure: the liquid flashes in the suction line."]);
    else if (R.npsha < 2) notes.push(["np-bad", `NPSH available is only ${f(R.npsha, 2)} m: check it against the pump's NPSHr in the NPSH calculator.`]);
    if (R.su.v > 1.5) notes.push(["", `Suction velocity ${f(R.su.v, 2)} m/s is high; suction lines are usually sized for 1 to 1.5 m/s.`]);
    if (R.di.v > 3) notes.push(["", `Discharge velocity ${f(R.di.v, 2)} m/s is high; 1.5 to 3 m/s is usual for pump discharge lines.`]);
    if (!notes.length) notes.push(["np-good", `Pump duty: ${f(R.q, 1)} m³/h at ${f(R.head, 1)} m total head. Add a margin of about 10 % on head for pipe ageing and fouling when buying the pump.`]);
    const row = (a, b, c, cls) => `<tr${cls ? ` class="${cls}"` : ""}><td>${a}</td><td>${b}</td><td>${c || ""}</td></tr>`;
    const sg = (x) => (x >= 0 ? "+ " : "− ") + f(Math.abs(x), 2) + " m";
    $("np-res").innerHTML = notes.map(([c, t]) => `<div class="np-note ${c}">${esc(t)}</div>`).join("") + `
      <div class="np-sum"><div><h3 class="np-h">How the total head adds up</h3><table class="np-tab"><tbody>
        ${row("Delivery static head", f(R.h2, 2) + " m", "destination entry above the pump")}
        ${row(R.z >= 0 ? "Suction static head" : "Suction lift", f(Math.abs(R.z), 2) + " m", R.z >= 0 ? "liquid level above the pump" : "pump above the liquid level")}
        ${row("Total static head", sg(R.h2 - R.z), "delivery − suction")}
        ${row("Pressure head", sg(R.dPh), f(R.P2 / KSC, 3) + " − " + f(R.P / KSC, 3) + " kg/cm² abs")}
        ${row("Friction head, suction", sg(R.su.hf), f(R.su.v, 2) + " m/s, ΣK " + f(R.su.K, 2))}
        ${row("Friction head, discharge", sg(R.di.hf), f(R.di.v, 2) + " m/s, ΣK " + f(R.di.K, 2))}
        ${row("Velocity head at the exit", sg(R.hExit), "v²/2g lost into the destination")}
        ${row("Total head", f(R.head, 2) + " m", f(R.head * rg / KSC, 3) + " kg/cm² across the pump", "np-tot")}
      </tbody></table></div>
      <div><h3 class="np-h">Gauges and power</h3><table class="np-tab"><tbody>
        ${row("Suction gauge", gauge(R.Ps, alt))}
        ${row("Discharge gauge", gauge(R.Pd, alt))}
        ${row("Manometric head", f((R.Pd - R.Ps) / rg + (R.di.v ** 2 - R.su.v ** 2) / (2 * g), 2) + " m", "gauge difference + velocity head change")}
        ${row("Hydraulic power", f(R.hyd, 2) + " kW")}
        ${row("Shaft power", f(R.kW, 2) + " kW", "at " + f(num(S.eff, 60), 0) + " % pump efficiency")}
        ${row("Motor", mtr ? mtr + " kW" : "—", "next standard size above shaft power + 15 %")}
        ${row("NPSH available", f(R.npsha, 2) + " m", "")}
      </tbody></table><p class="np-small">Gauge readings assume both gauges at the pump centre line. If the plant gauges read differently, the line has more (or less) loss than entered, or the pump is not at this flow.</p></div></div>`;
  }

  function results() {
    if (MODE === "head") return resultsHead();
    const R = calc(), mar = R.npsha - num(S.npshr, 0), ok = R.npsha >= need(), cav = mar < 0, flash = R.Pv > R.P * 1.0001 && S.sc !== "boiling";
    $("np-dia").innerHTML = diagram(R);
    let msg, cls;
    if (flash) { cls = "np-bad"; msg = `The liquid is above its boiling point at the vessel pressure (vapour pressure ${f(R.Pv / MMHG, 0)} mmHg against ${f(R.P / MMHG, 0)} mmHg): it flashes before reaching the pump.`; }
    else if (cav) { cls = "np-bad"; msg = "Cavitation: NPSH available is below what the pump needs. Raise the level, cool the liquid, use a larger or shorter suction line, clean the strainer, or choose a pump with lower NPSHr."; }
    else if (!ok) { cls = ""; msg = `Tight: ${f(mar, 2)} m above NPSHr, less than the ${f(num(S.margin, 1), 1)} m margin you asked for.`; }
    else { cls = "np-good"; msg = `OK: ${f(mar, 2)} m above NPSHr. Check the vendor curve at the highest flow the pump will run at.`; }
    const extra = [];
    if (S.sc === "boiling") extra.push("At the boiling point, vessel pressure and vapour pressure cancel: only the liquid height minus the suction loss is left.");
    if (S.sc === "vacuum") extra.push("Under vacuum the liquid height does most of the work; a lower level or warmer distillate takes the margin away quickly.");
    if (S.sc === "lift") extra.push("A suction lift needs a self-priming pump or a foot valve and an air-tight suction line.");
    if (R.su.v > 1.5) extra.push(`Suction velocity ${f(R.su.v, 2)} m/s is high; suction lines are usually sized for 1 to 1.5 m/s.`);
    if (R.head < 0) extra.push("The destination is lower or at lower pressure than the source: the liquid would flow there by gravity.");
    const lim = limits(R);
    $("np-res").innerHTML = `<div class="np-note ${cls}">${esc(msg)}${extra.map((x) => `<br><span class="np-small">${esc(x)}</span>`).join("")}</div>
      <div class="np-sum"><div><h3 class="np-h">NPSH available</h3><table class="np-tab"><tbody>
        <tr><td>Vessel pressure</td><td>+ ${f(R.hP, 2)} m</td><td>${f(R.P / MMHG, 0)} mmHg abs</td></tr>
        <tr><td>Vapour pressure</td><td>− ${f(R.hV, 2)} m</td><td>${f(R.Pv / MMHG, 1)} mmHg at ${f(R.T, 1)} °C</td></tr>
        <tr><td>${R.z >= 0 ? "Liquid level" : "Lift"}</td><td>${R.z >= 0 ? "+" : "−"} ${f(Math.abs(R.z), 2)} m</td><td></td></tr>
        <tr><td>Suction loss</td><td>− ${f(R.su.hf, 2)} m</td><td></td></tr>
        <tr class="np-tot"><td>NPSHa</td><td>${f(R.npsha, 2)} m</td><td></td></tr></tbody></table></div>
      <div><h3 class="np-h">How far it can go</h3><table class="np-tab"><tbody>${lim.map((x) => `<tr><td>${x[0]}</td><td>${x[1]}</td></tr>`).join("")}</tbody></table>
      <p class="np-small">Keeping NPSHr + ${f(num(S.margin, 1), 1)} m.</p></div></div>`;
  }

  function inputs() {
    const s = sol(), p = props(num(S.T, 30));
    const inp = (k, lab, unit, step) => `<label><span>${lab}${unit ? ` <small>${unit}</small>` : ""}</span><input type="number" step="${step || "any"}" min="0" data-k="${k}" value="${esc(S[k])}"></label>`;
    const sel = (k, lab, opts) => `<label><span>${lab}</span><select data-k="${k}">${opts.map(([v, n]) => `<option value="${esc(v)}"${String(v) === String(S[k]) ? " selected" : ""}>${esc(n)}</option>`).join("")}</select></label>`;
    const sizes = Object.keys(NPS).map((k) => [k, `${k} mm (${INCH[k]}")`]);
    const auto = (k, lab, unit, val, d) => `<label><span>${lab} <small>${unit}</small></span><input type="number" step="any" data-k="${k}" value="${esc(S[k])}" placeholder="${s ? f(val, d).replace(/,/g, "") : ""}"></label>`;
    let pres = "";
    if (S.sc === "pressure") pres = inp("pg", "N₂ pressure", "kg/cm² g");
    else if (S.sc === "vacuum") pres = inp("pa", "Vacuum", "mmHg abs");
    else if (S.sc === "boiling") pres = inp("pb", "Column pressure", "kg/cm² g");
    return `
      <div class="np-scen" role="radiogroup" aria-label="Source vessel">${Object.keys(SCEN).map((k) => `<button type="button" role="radio" aria-checked="${k === S.sc}" class="np-sc${k === S.sc ? " on" : ""}" data-sc="${k}"><b>${esc(SCEN[k].t)}</b><span>${esc(SCEN[k].d)}</span></button>`).join("")}</div>
      <div class="np-row">${sel("fluid", "Liquid", [["own", "Other liquid"]].concat(SOL.map((x) => [x.s, x.n])))}${S.sc === "boiling" ? "" : inp("T", "Temperature", "°C")}${inp("q", "Flow", "m³/h")}</div>
      <div id="np-dia" class="np-dia"></div>
      <div class="np-form">
        <fieldset><legend>Source</legend>${pres}${inp("z", S.sc === "lift" ? "Lift, pump above liquid" : "Lowest level above pump", "m")}</fieldset>
        <fieldset><legend>Suction line</legend>${sel("ns", "Pipe size", sizes)}${inp("len", "Length", "m")}${inp("elb", "Elbows", "", 1)}${inp("val", "Valves", "", 1)}${sel("str", "Strainer", Object.keys(STR).map((k) => [k, STR[k][0]]))}</fieldset>
        <fieldset><legend>Pump</legend>${MODE === "head" ? "" : inp("npshr", "NPSHr (pump curve)", "m") + inp("margin", "Margin wanted", "m")}${inp("eff", "Efficiency", "%")}</fieldset>
        <fieldset><legend>Discharge and destination</legend>${inp("h2", "Height above pump", "m")}${inp("p2", "Pressure", "kg/cm² g")}${sel("ns2", "Pipe size", sizes)}${inp("len2", "Length", "m")}${inp("elb2", "Elbows", "", 1)}${inp("val2", "Valves", "", 1)}</fieldset>
      </div>
      <details class="np-more"><summary>Liquid properties and more</summary><div class="np-row">${auto("rho", "Density", "kg/m³", p.rho, 0)}${S.sc === "boiling" && s ? "" : auto("pv", "Vapour pressure", "mmHg abs", p.pv, 1)}${auto("mu", "Viscosity", "cP", p.mu, 2)}${inp("alt", "Site altitude", "m")}${inp("rough", "Pipe roughness", "mm")}${inp("kx", "Extra suction K", "")}</div>
      <p class="np-small">Grey values come from the solvent data at the temperature; type your own to override. Density of solvents other than water is the 20 °C value.</p></details>
      <div id="np-res"></div>`;
  }

  function all() { $("np-in").innerHTML = inputs(); results(); }
  function init(opts) {
    const mount = $("calc-mount"); if (!mount) return;
    MODE = (opts && opts.mode) || "npsh"; if (MODE === "head") KEY = "pce-pumphead-v1";
    S = load();
    mount.innerHTML = `${typeof plateHeader === "function" ? (MODE === "head" ? plateHeader("PharmaChemE Pump Head Calculator", "STATIC · PRESSURE · FRICTION · VELOCITY") : plateHeader("PharmaChemE NPSH Calculator", "TANK · PUMP · DESTINATION")) : ""}<div id="np-in"></div>`;
    mount.addEventListener("click", (e) => { const b = e.target.closest("[data-sc]"); if (!b) return; S = DEF(b.getAttribute("data-sc")); save(); all(); });
    const upd = (e) => {
      const k = e.target.getAttribute("data-k"); if (!k) return;
      S[k] = e.target.value; save();
      if (k === "fluid") { S.rho = S.pv = S.mu = ""; all(); return; }
      results();
      const p = props(num(S.T, 30));
      if (sol()) [["rho", p.rho, 0], ["pv", p.pv, 1], ["mu", p.mu, 2]].forEach(([kk, v, d]) => { const el = mount.querySelector(`[data-k="${kk}"]`); if (el) el.placeholder = f(v, d).replace(/,/g, ""); });
    };
    mount.addEventListener("input", upd);
    mount.addEventListener("change", (e) => { if (e.target.tagName === "SELECT") upd(e); });
    fetch(DATA).then((r) => r.json()).then((d) => { SOL = d; all(); }).catch(() => { S.fluid = "own"; all(); });
  }
  window.PCENpshInit = init;
  window.PCEPumpHeadInit = () => init({ mode: "head" });
  window.PCENpshTest = { calc: (st) => { S = Object.assign(DEF(st.sc), st); return calc(); }, setSol: (d) => (SOL = d), antoine, tBoil };
})();
