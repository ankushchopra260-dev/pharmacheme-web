/* NPSH available calculator with suction arrangements (calculators/npsh-calculator/)
   NPSHa = (P_surface − P_vapour)/(ρg) + Z − h_f, in metres of liquid, referred to the pump inlet centre line.
   Vapour pressure: Antoine constants of the PharmaChemE solvent pages (log10 P[mmHg] = A − B/(C + T[°C])).
   Suction loss: Darcy–Weisbach, Churchill friction factor, K values for entrance, elbows, valves and strainer. */
(function () {
  "use strict";
  const ME = document.currentScript, DATA = (ME && ME.getAttribute("data-sol")) || "/assets/data/solvent-lite.json";
  const KEY = "pce-npsh-v1", g = 9.80665, MMHG = 133.322368, KSC = 98066.5;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v, d) => { const x = parseFloat(v); return isFinite(x) ? x : d; };
  const f = (x, d) => (isFinite(x) ? Number(x).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");
  let SOL = [];

  const SCEN = {
    flooded: { t: "Open tank, flooded suction", d: "Vented storage or day tank above the pump.", lvl: "Lowest liquid level above the pump centre line", v: { fluid: "water", T: 30, alt: 0, z: 2, q: 20, id: 80, len: 10, elb: 2, val: 1, str: "clean", kx: 0, npshr: 3, qr: 20 } },
    lift: { t: "Suction lift from a sump or pit", d: "Pump above the liquid: the lift is taken off the atmospheric head.", lvl: "Lift: pump centre line above the lowest liquid level", v: { fluid: "water", T: 30, alt: 0, z: 3, q: 20, id: 80, len: 8, elb: 2, val: 0, str: "foot", kx: 0, npshr: 3, qr: 20 } },
    pressure: { t: "Closed vessel under nitrogen", d: "Reactor or tank under a nitrogen blanket or pad.", lvl: "Lowest liquid level above the pump centre line", v: { fluid: "toluene", T: 40, pg: 0.3, z: 1.5, q: 10, id: 50, len: 12, elb: 3, val: 1, str: "clean", kx: 0, npshr: 2.5, qr: 10 } },
    vacuum: { t: "Vacuum receiver", d: "Distillate or solvent receiver under vacuum.", lvl: "Lowest liquid level above the pump centre line", v: { fluid: "methanol", T: 30, pa: 250, z: 2.5, q: 5, id: 40, len: 8, elb: 3, val: 1, str: "clean", kx: 0, npshr: 2, qr: 5 } },
    boiling: { t: "Liquid at its boiling point", d: "Column bottoms, reboiler or flash drum: the liquid is saturated at the vessel pressure.", lvl: "Lowest liquid level above the pump centre line", v: { fluid: "toluene", pb: 0, z: 3, q: 15, id: 80, len: 15, elb: 4, val: 1, str: "clean", kx: 0, npshr: 2.5, qr: 15 } },
    condensate: { t: "Hot condensate tank", d: "Vented tank collecting steam condensate, close to 100 °C.", lvl: "Lowest liquid level above the pump centre line", v: { fluid: "water", T: 95, alt: 0, z: 2, q: 5, id: 50, len: 6, elb: 2, val: 1, str: "clean", kx: 0, npshr: 2, qr: 5 } },
  };
  const STR = { none: ["No strainer", 0], clean: ["Y/T strainer, clean", 2], dirty: ["Y/T strainer, half blocked", 8], foot: ["Foot valve with strainer", 8] };
  const FLUIDS = () => [["own", "Other liquid (enter properties)"]].concat(SOL.map((s) => [s.s, s.n]));

  const DEF = () => Object.assign({ sc: "flooded", margin: 1, rho: "", pv: "", mu: "", rough: 0.045 }, SCEN.flooded.v);
  let S = null;
  const load = () => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && SCEN[x.sc]) return Object.assign(DEF(), x); } catch (e) {} return DEF(); };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  const sol = () => SOL.find((s) => s.s === S.fluid);
  /* water: two Antoine sets (1–100 °C and 99–374 °C) so hot condensate is right */
  function antoine(s, T) {
    if (s.s === "water" && T > 99) return Math.pow(10, 8.14019 - 1810.94 / (244.485 + T));
    return Math.pow(10, s.a[0] - s.a[1] / (s.a[2] + T));
  }
  function tBoil(s, Pmm) {
    if (s.s === "water" && Pmm > 733) return 1810.94 / (8.14019 - Math.log10(Pmm)) - 244.485;
    return s.a[1] / (s.a[0] - Math.log10(Pmm)) - s.a[2];
  }
  /* water density, Thiesen (0–150 °C, within 0.1 %) */
  const rhoWater = (T) => 1000 * (1 - ((T + 288.9414) / (508929.2 * (T + 68.12963))) * (T - 3.9863) ** 2);

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
  const pAtm = (alt) => 101325 * Math.pow(1 - 2.25577e-5 * Math.max(-400, Math.min(5000, alt)), 5.25588);

  function friction(q, p) {
    const D = num(S.id, 50) / 1000, A = (Math.PI * D * D) / 4, v = q / 3600 / A;
    if (!(D > 0) || q <= 0) return { v: 0, hf: 0, Re: 0, fD: 0, K: 0 };
    const Re = (p.rho * v * D) / (p.mu / 1000), e = num(S.rough, 0.045) / 1000;
    const a = Math.pow(2.457 * Math.log(1 / (Math.pow(7 / Re, 0.9) + (0.27 * e) / D)), 16), b = Math.pow(37530 / Re, 16);
    const fD = 8 * Math.pow(Math.pow(8 / Re, 12) + 1 / Math.pow(a + b, 1.5), 1 / 12);
    const K = 0.5 + 0.75 * Math.max(0, num(S.elb, 0)) + 0.2 * Math.max(0, num(S.val, 0)) + (STR[S.str] || STR.none)[1] + Math.max(0, num(S.kx, 0));
    const hv = (v * v) / (2 * g), hf = ((fD * Math.max(0, num(S.len, 0))) / D + K) * hv;
    return { v, hf, Re, fD, K, hv };
  }

  /* the whole calculation for a given temperature, flow, level and surface pressure (any may be overridden) */
  function calc(o) {
    o = o || {};
    const sc = S.sc, s = sol();
    let T = o.T != null ? o.T : num(S.T, 30);
    let P;
    if (sc === "boiling") {
      P = o.P != null ? o.P : num(S.pb, 0) * KSC + pAtm(0);
      if (s) T = tBoil(s, P / MMHG);
    } else if (sc === "pressure") P = o.P != null ? o.P : num(S.pg, 0) * KSC + pAtm(num(S.alt, 0));
    else if (sc === "vacuum") P = o.P != null ? o.P : num(S.pa, 250) * MMHG;
    else P = o.P != null ? o.P : pAtm(num(S.alt, 0));
    const p = props(T);
    const Pv = sc === "boiling" ? P : p.pv * MMHG;
    const z = o.z != null ? o.z : sc === "lift" ? -num(S.z, 0) : num(S.z, 0);
    const q = o.q != null ? o.q : num(S.q, 0);
    const fr = friction(q, p);
    const hP = P / (p.rho * g), hV = Pv / (p.rho * g);
    const npsha = hP - hV + z - fr.hf;
    return { T, P, Pv, p, z, q, fr, hP, hV, npsha };
  }
  const need = () => num(S.npshr, 0) + Math.max(0, num(S.margin, 1));

  function bisect(fn, lo, hi, n) { let flo = fn(lo); for (let i = 0; i < (n || 60); i++) { const m = (lo + hi) / 2, fm = fn(m); if ((fm > 0) === (flo > 0)) { lo = m; flo = fm; } else hi = m; } return (lo + hi) / 2; }

  function limits(R) {
    const out = [], N = need(), gap = R.npsha - N, s = sol();
    const lvlName = S.sc === "lift" ? "Highest lift" : "Lowest liquid level";
    const zLim = R.z - gap;
    if (S.sc === "lift") out.push([lvlName, zLim <= 0 ? f(-zLim, 2) + " m" : "none", zLim <= 0 ? "pump centre line above the liquid" : `the liquid must stand ${f(zLim, 2)} m above the pump`]);
    else out.push([lvlName, f(Math.abs(zLim), 2) + " m", zLim >= 0 ? "above the pump centre line" : "below the pump: it could even lift this far, if self-priming"]);
    if (S.sc !== "boiling" && s) {
      const fn = (T) => calc({ T }).npsha - N;
      const Tb = tBoil(s, R.P / MMHG);
      if (fn(-20) < 0) out.push(["Highest liquid temperature", "none", "margin not met even with cold liquid"]);
      else out.push(["Highest liquid temperature", f(fn(Tb - 0.01) > 0 ? Tb : bisect(fn, -20, Tb - 0.01), 1) + " °C", `boils at ${f(Tb, 1)} °C at the surface pressure`]);
    }
    if (num(S.q, 0) > 0) {
      const fq = (q) => calc({ q }).npsha - N;
      if (fq(0) < 0) out.push(["Highest flow", "none", "margin not met even at zero flow"]);
      else { const hi = Math.max(1, num(S.q, 1)) * 20; out.push(["Highest flow", fq(hi) > 0 ? "> " + f(hi, 0) + " m³/h" : f(bisect(fq, 0, hi), 1) + " m³/h", "for this suction line; NPSHr also rises with flow"]); }
    }
    if (S.sc === "pressure" || S.sc === "vacuum") {
      const Pmin = R.P - gap * R.p.rho * g, pg = (Pmin - pAtm(num(S.alt, 0))) / KSC;
      out.push(["Lowest vessel pressure", Pmin <= R.Pv ? "none" : S.sc === "vacuum" || pg < 0 ? f(Pmin / MMHG, 0) + " mmHg abs" : f(pg, 3) + " kg/cm² g", Pmin <= R.Pv ? "" : pg < 0 && S.sc === "pressure" ? "the margin holds even with the pad lost and the vessel under vacuum" : "at this level and temperature"]);
    }
    return out;
  }

  /* NPSHa against flow, with NPSHr and the margin line */
  function chart(R) {
    const qr = Math.max(0.1, num(S.qr, num(S.q, 10)), num(S.q, 0)), qmax = qr * 1.6, W = 560, H = 260, l = 46, r = 14, t = 14, b = 38;
    const pts = []; for (let i = 0; i <= 40; i++) { const q = (qmax * i) / 40; pts.push([q, calc({ q }).npsha]); }
    const ys = pts.map((p) => p[1]).concat([need(), num(S.npshr, 0), 0]);
    let y0 = Math.min(...ys), y1 = Math.max(...ys); const pad = (y1 - y0) * 0.1 || 1; y0 = Math.floor(y0 - pad); y1 = Math.ceil(y1 + pad);
    const X = (q) => l + ((W - l - r) * q) / qmax, Y = (h) => t + ((H - t - b) * (y1 - h)) / (y1 - y0);
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="NPSH available against flow" font-family="sans-serif" font-size="11">`;
    const step = Math.max(1, Math.ceil((y1 - y0) / 6));
    for (let h = Math.ceil(y0); h <= y1; h += step) s += `<line x1="${l}" x2="${W - r}" y1="${Y(h)}" y2="${Y(h)}" stroke="#2c3b4f"/><text x="${l - 6}" y="${Y(h) + 4}" fill="#9fb0c3" text-anchor="end">${h}</text>`;
    for (let i = 0; i <= 4; i++) { const q = (qmax * i) / 4; s += `<text x="${X(q)}" y="${H - b + 16}" fill="#9fb0c3" text-anchor="middle">${f(q, q < 10 ? 1 : 0)}</text>`; }
    s += `<text x="${(l + W - r) / 2}" y="${H - 4}" fill="#9fb0c3" text-anchor="middle">Flow, m³/h</text><text transform="translate(12,${(t + H - b) / 2}) rotate(-90)" fill="#9fb0c3" text-anchor="middle">Head, m of liquid</text>`;
    s += `<line x1="${l}" x2="${W - r}" y1="${Y(need())}" y2="${Y(need())}" stroke="#D9A441" stroke-dasharray="6 4"/><text x="${W - r - 4}" y="${Y(need()) - 5}" fill="#D9A441" text-anchor="end">NPSHr + margin</text>`;
    s += `<polyline fill="none" stroke="#4E9AD6" stroke-width="2.4" points="${pts.map((p) => X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1)).join(" ")}"/><text x="${X(pts[4][0])}" y="${Y(pts[4][1]) - 7}" fill="#4E9AD6">NPSH available</text>`;
    s += `<circle cx="${X(num(S.qr, 0))}" cy="${Y(num(S.npshr, 0))}" r="4.5" fill="#E07A6A"/><text x="${X(num(S.qr, 0)) + 7}" y="${Y(num(S.npshr, 0)) + 14}" fill="#E07A6A">NPSHr at rated flow</text>`;
    if (R.q > 0) s += `<line x1="${X(R.q)}" x2="${X(R.q)}" y1="${t}" y2="${H - b}" stroke="#7d8da1" stroke-dasharray="2 3"/><text x="${X(R.q) + 4}" y="${t + 10}" fill="#9fb0c3">operating</text>`;
    return s + `</svg>`;
  }

  function results() {
    const R = calc(), N = need(), mar = R.npsha - num(S.npshr, 0), ratio = num(S.npshr, 0) > 0 ? R.npsha / num(S.npshr, 0) : NaN;
    const ok = R.npsha >= N, cav = mar < 0, flash = R.Pv > R.P * 1.0001 && S.sc !== "boiling";
    const notes = [];
    if (flash) notes.push(["bad", `The liquid is above its boiling point at the surface pressure (vapour pressure ${f(R.Pv / MMHG, 0)} mmHg against ${f(R.P / MMHG, 0)} mmHg): it flashes before it reaches the pump.`]);
    else if (cav) notes.push(["bad", "NPSH available is below the NPSH the pump needs: it will cavitate. Raise the level, cool the liquid, cut suction losses (larger pipe, fewer fittings, clean strainer) or choose a pump with a lower NPSHr."]);
    else if (!ok) notes.push(["warn", `Margin is ${f(mar, 2)} m, less than the ${f(num(S.margin, 1), 1)} m asked for. NPSHr is the flow at which head has already dropped 3 %, so the pump is cavitating at NPSHr; check with the vendor at the highest flow.`]);
    else notes.push(["good", `NPSH available is ${f(mar, 2)} m above NPSHr. Confirm against the vendor curve at the highest flow the pump will see.`]);
    if (S.sc === "boiling") notes.push(["warn", "The liquid is at its boiling point, so pressure and vapour pressure cancel: only the liquid level minus the suction loss is left. Keep the suction line short, insulated and free of high points; any heat pick-up or pressure dip makes vapour."]);
    if (S.sc === "vacuum") notes.push(["warn", "In a vacuum receiver the gap between vessel pressure and vapour pressure is small, so the liquid level does most of the work. Pumps on vacuum receivers are usually mounted well below the vessel; a falling level or a warmer distillate quickly takes the margin away."]);
    if (S.sc === "lift") notes.push(["warn", "A suction lift needs a self-priming pump or a foot valve, and the line must be air tight: a leak at a flange or gland lets air in and the pump loses prime."]);
    if (R.fr.v > 1.5) notes.push(["warn", `Suction velocity ${f(R.fr.v, 2)} m/s. Suction lines are usually sized for about 1 to 1.5 m/s; a larger pipe cuts the loss.`]);
    if (sol() && sol().s !== "water" && !num(S.rho, NaN) && Math.abs(R.T - 20) > 30) notes.push(["", "Density is the 20 °C value from the solvent page; enter the density at the pumping temperature for hot liquids."]);
    const card = (l, v, u) => `<div class="readout"><div class="label">${l}</div><div class="val">${v}</div><div class="np-unit">${u}</div></div>`;
    let h = `<div class="np-grid4" aria-live="polite">${card("NPSH available", f(R.npsha, 2), "m of liquid")}${card("Margin over NPSHr", f(mar, 2), "m · needed " + f(num(S.margin, 1), 1) + " m")}${card("NPSHa / NPSHr", f(ratio, 2), "ratio")}${card("Result", cav || flash ? "Cavitates" : ok ? "OK" : "Tight", cav || flash ? "short of NPSH" : ok ? "margin met" : "below the margin asked for")}</div>`;
    notes.forEach(([c, t]) => (h += `<div class="np-note ${c === "bad" ? "np-bad" : c === "good" ? "np-good" : ""}">${esc(t)}</div>`));
    const row = (a, b, c) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`;
    h += `<div class="np-two"><div><h3 class="np-h">How it adds up</h3><table class="np-tab"><tbody>
      ${row("Surface pressure head", "+ " + f(R.hP, 2) + " m", f(R.P / KSC, 3) + " kg/cm² abs · " + f(R.P / MMHG, 0) + " mmHg")}
      ${row("Vapour pressure head", "− " + f(R.hV, 2) + " m", f(R.Pv / MMHG, 1) + " mmHg at " + f(R.T, 1) + " °C")}
      ${row(R.z >= 0 ? "Liquid level above pump" : "Suction lift", (R.z >= 0 ? "+ " : "− ") + f(Math.abs(R.z), 2) + " m", "")}
      ${row("Suction line loss", "− " + f(R.fr.hf, 2) + " m", R.q > 0 ? f(R.fr.v, 2) + " m/s · Re " + f(R.fr.Re, 0) + " · ΣK " + f(R.fr.K, 2) : "no flow")}
      <tr class="np-tot"><td>NPSH available</td><td>${f(R.npsha, 2)} m</td><td>${f(R.npsha * R.p.rho * g / KSC, 3)} kg/cm²</td></tr></tbody></table>
      <p class="np-small">Liquid: density ${f(R.p.rho, 0)} kg/m³, viscosity ${f(R.p.mu, 2)} cP${R.p.auto.pv ? ", vapour pressure from Antoine" : ""}.</p></div>
      <div><h3 class="np-h">Limits for this pump (NPSHr + ${f(num(S.margin, 1), 1)} m)</h3><table class="np-tab"><tbody>${limits(R).map((x) => row(x[0], x[1], x[2])).join("")}</tbody></table></div></div>`;
    h += `<h3 class="np-h">NPSH available against flow</h3><div class="np-chart">${chart(R)}</div>`;
    $("np-results").innerHTML = h;
  }

  function inputs() {
    const sc = SCEN[S.sc], s = sol(), T = num(S.T, 30), p = props(T);
    const inp = (k, lab, unit, step, extra) => `<label><span>${lab}${unit ? ` <small>${unit}</small>` : ""}</span><input type="number" step="${step || "any"}" data-k="${k}" value="${esc(S[k])}"${extra || ""}></label>`;
    const auto = (k, lab, unit, val, d) => `<label><span>${lab} <small>${unit}</small></span><input type="number" step="any" data-k="${k}" value="${esc(S[k])}" placeholder="${s ? f(val, d).replace(/,/g, "") : ""}"></label>`;
    let pres = "";
    if (S.sc === "pressure") pres = inp("pg", "Vessel pressure", "kg/cm² g") + inp("alt", "Site altitude", "m");
    else if (S.sc === "vacuum") pres = inp("pa", "Vessel pressure", "mmHg abs");
    else if (S.sc === "boiling") pres = inp("pb", "Vessel pressure", "kg/cm² g") + `<p class="np-small" style="flex-basis:100%">${s ? `${esc(s.n)} boils at ${f(tBoil(s, (num(S.pb, 0) * KSC + pAtm(0)) / MMHG), 1)} °C at this pressure.` : "For another liquid, the vapour pressure equals the vessel pressure."}</p>`;
    else pres = inp("alt", "Site altitude", "m");
    return `
      <div class="np-scen" role="radiogroup" aria-label="Suction arrangement">${Object.keys(SCEN).map((k) => `<button type="button" role="radio" aria-checked="${k === S.sc}" class="np-sc${k === S.sc ? " on" : ""}" data-sc="${k}"><b>${esc(SCEN[k].t)}</b><span>${esc(SCEN[k].d)}</span></button>`).join("")}</div>
      <div class="np-form">
        <fieldset><legend>Liquid</legend>
          <label class="np-wide"><span>Liquid</span><select data-k="fluid">${FLUIDS().map(([v, n]) => `<option value="${esc(v)}"${v === S.fluid ? " selected" : ""}>${esc(n)}</option>`).join("")}</select></label>
          ${S.sc === "boiling" ? "" : inp("T", "Temperature", "°C")}
          ${auto("rho", "Density", "kg/m³", p.rho, 0)}${S.sc === "boiling" && s ? "" : auto("pv", "Vapour pressure", "mmHg abs", p.pv, 1)}${auto("mu", "Viscosity", "cP", p.mu, 2)}
        </fieldset>
        <fieldset><legend>Suction vessel</legend>${pres}${inp("z", sc.lvl, "m")}</fieldset>
        <fieldset><legend>Suction line</legend>
          ${inp("q", "Flow", "m³/h")}${inp("id", "Pipe inside diameter", "mm")}${inp("len", "Straight length", "m")}${inp("elb", "90° elbows", "", "1", ' min="0"')}${inp("val", "Valves, fully open", "", "1", ' min="0"')}
          <label><span>Strainer</span><select data-k="str">${Object.keys(STR).map((k) => `<option value="${k}"${k === S.str ? " selected" : ""}>${esc(STR[k][0])}</option>`).join("")}</select></label>
          ${inp("kx", "Other K", "reducer, tee, meter")}${inp("rough", "Roughness", "mm")}
        </fieldset>
        <fieldset><legend>Pump</legend>${inp("npshr", "NPSHr from the pump curve", "m")}${inp("qr", "Rated flow", "m³/h")}${inp("margin", "Margin wanted", "m")}</fieldset>
      </div>
      <p class="np-small">Grey values for density, vapour pressure and viscosity come from the solvent data at the temperature; type a value to use your own.</p>`;
  }

  function all() { $("np-inputs").innerHTML = inputs(); results(); }

  function init() {
    const mount = $("calc-mount"); if (!mount) return;
    S = load();
    mount.innerHTML = `${typeof plateHeader === "function" ? plateHeader("PharmaChemE NPSH Calculator", "NPSHa · SUCTION · MARGIN") : ""}<div id="np-inputs"></div><div id="np-results"></div>`;
    mount.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sc]"); if (!b) return;
      const k = b.getAttribute("data-sc"); S = Object.assign(DEF(), { margin: S.margin }, SCEN[k].v, { sc: k }); save(); all();
    });
    mount.addEventListener("input", (e) => {
      const k = e.target.getAttribute("data-k"); if (!k) return;
      S[k] = e.target.value; save();
      if (k === "fluid") { S.rho = S.pv = S.mu = ""; all(); return; }
      results();
      /* refresh the greyed auto values without rebuilding the form under the cursor */
      const p = props(num(S.T, 30));
      [["rho", p.rho, 0], ["pv", p.pv, 1], ["mu", p.mu, 2]].forEach(([kk, v, d]) => { const el = mount.querySelector(`[data-k="${kk}"]`); if (el && sol()) el.placeholder = f(v, d).replace(/,/g, ""); });
      if (k === "pb") { const el = mount.querySelector(".np-form .np-small"); if (el && sol()) el.textContent = `${sol().n} boils at ${f(tBoil(sol(), (num(S.pb, 0) * KSC + pAtm(0)) / MMHG), 1)} °C at this pressure.`; }
    });
    mount.addEventListener("change", (e) => { const k = e.target.getAttribute("data-k"); if (k === "str") results(); });
    const go = () => all();
    fetch(DATA).then((r) => r.json()).then((d) => { SOL = d; go(); }).catch(() => { S.fluid = "own"; go(); });
  }
  window.PCENpshInit = init;
  window.PCENpshTest = { calc: (st) => { S = Object.assign(DEF(), st); return calc(); }, setSol: (d) => (SOL = d), antoine, tBoil };
})();
