/* Pump and system curve explorer (articles/pump-curves-and-system-curves/)
   Pump: H(Q) = n²·H0 − a·Q² (affinity laws on a parabola through shut-off and BEP).
   Efficiency: η = ηmax·(2x − x²) below the BEP and ηmax·(1 − 0.6·(x − 1)²) above it, x = Q / (n·Q_BEP), per pump;
   the pump curve is drawn solid only to 140 % of BEP flow, about where vendor curves end.
   System: H = static + (k_pipe + k_valve)·Q², both k set from the head loss at the BEP flow.
   Two pumps in parallel share the flow at the same head; in series they add head at the same flow. */
(function () {
  "use strict";
  const mount = document.getElementById("pc-explorer"); if (!mount) return;
  const g = 9.80665;
  const S = { qb: 35, hb: 28, sh: 120, em: 70, hs: 15, hf: 10, hv: 0, n: 100, mode: "1", sg: 1 };
  const f = (x, d) => (isFinite(x) ? Number(x).toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const sl = (k, lab, min, max, step) => `<div class="pc-sl"><span id="pc-l-${k}">${lab}</span> <output data-o="${k}"></output><input type="range" min="${min}" max="${max}" step="${step}" data-k="${k}" value="${S[k]}" aria-labelledby="pc-l-${k}"></div>`;
  mount.innerHTML = `
    <div class="pc-ctl">
      ${sl("n", "Pump speed", 50, 110, 1)}${sl("hv", "Discharge valve closing: extra loss at BEP flow", 0, 30, 0.5)}${sl("hs", "Static head", 0, 32, 0.5)}
      <div class="pc-mode" aria-label="Number of pumps">
        <button type="button" data-m="1" class="on" aria-pressed="true">One pump</button><button type="button" data-m="p" aria-pressed="false">Two in parallel</button><button type="button" data-m="s" aria-pressed="false">Two in series</button>
      </div>
    </div>
    <div class="pc-chart"></div>
    <div class="pc-read"></div>
    <details class="pc-more"><summary>Change the pump and the line</summary><div class="pc-grid">
      <label>BEP flow, m³/h<input type="number" step="any" min="1" data-k="qb" value="${S.qb}"></label>
      <label>BEP head, m<input type="number" step="any" min="1" data-k="hb" value="${S.hb}"></label>
      <label>Shut-off head, % of BEP head<input type="number" step="1" min="101" max="160" data-k="sh" value="${S.sh}"></label>
      <label>Best efficiency, %<input type="number" step="1" min="10" max="92" data-k="em" value="${S.em}"></label>
      <label>Line friction at BEP flow, m<input type="number" step="any" min="0" data-k="hf" value="${S.hf}"></label>
      <label>Specific gravity<input type="number" step="any" min="0.3" max="2.5" data-k="sg" value="${S.sg}"></label>
    </div></details>`;

  const LIM = { qb: [1, 5000], hb: [1, 500], sh: [101, 160], em: [10, 92], hf: [0, 500], sg: [0.3, 2.5] };
  const val = (k, d) => { const x = parseFloat(S[k]); if (!isFinite(x)) return d; const L = LIM[k]; return L ? Math.min(L[1], Math.max(L[0], x)) : x; };
  const effAt = (em, x) => (x <= 1 ? em * (2 * x - x * x) : em * (1 - 0.6 * (x - 1) * (x - 1)));
  function model() {
    const qb = val("qb", 35), hb = val("hb", 28), H0 = hb * val("sh", 120) / 100;
    const a = (H0 - hb) / (qb * qb), n = (+S.n || 100) / 100, em = val("em", 70) / 100;
    const hs = +S.hs || 0, kp = val("hf", 10) / (qb * qb), kv = Math.max(0, +S.hv || 0) / (qb * qb), m = S.mode;
    const pump1 = (q) => n * n * H0 - a * q * q;
    const pumpH = (Q) => (m === "p" ? pump1(Q / 2) : m === "s" ? 2 * pump1(Q) : pump1(Q));
    const sys = (Q, withValve) => hs + (kp + (withValve ? kv : 0)) * Q * Q;
    const K = kp + kv, num = (m === "s" ? 2 : 1) * n * n * H0 - hs, den = K + (m === "p" ? a / 4 : m === "s" ? 2 * a : a);
    const Q = num > 0 ? Math.sqrt(num / den) : 0, H = num > 0 ? sys(Q, true) : 0;
    const qEach = m === "p" ? Q / 2 : Q, hEach = m === "s" ? H / 2 : H, x = qEach / (n * qb);
    const eta = Math.max(0.02, effAt(em, x));
    const shaft = num > 0 ? (val("sg", 1) * 1000 * g * (qEach / 3600) * hEach) / eta / 1000 * (m === "1" ? 1 : 2) : 0;
    const valveH = num > 0 ? kv * Q * Q : 0;
    return { qb, hb, H0, a, n, em, hs, kp, kv, m, pump1, pumpH, sys, Q, H, x, eta, shaft, valveH, noflow: num <= 0, qEach };
  }

  const nice = (span, n) => { const raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; };
  function chart(M) {
    const small = mount.clientWidth < 520;
    const W = small ? 400 : 640, Ht = small ? 330 : 340, l = small ? 44 : 54, r = small ? 44 : 50, t = 16, b = 42, fs = small ? 14 : 12;
    const per = M.m === "p" ? 2 : 1, qEnd = 1.4 * M.n * M.qb * per;
    const qmax = Math.max(M.qb * (M.m === "p" ? 2.6 : 1.8), M.Q * 1.15), hmax = Math.max(M.H0 * (M.m === "s" ? 2 : 1) * 1.15 * Math.max(1, M.n * M.n), M.hs * 1.3, 10);
    const X = (q) => l + ((W - l - r) * q) / qmax, Y = (h) => t + (Ht - t - b) * (1 - h / hmax), YE = (e) => t + (Ht - t - b) * (1 - e);
    /* stop a curve where it leaves the chart, instead of running it along the edge */
    const trace = (fn, q0, q1) => { const p = []; let qp = q0, hp = fn(q0), last = null; for (let i = 0; i <= 120; i++) { const q = q0 + ((q1 - q0) * i) / 120, h = fn(q);
      if (h < 0 || h > hmax) { if (i > 0 && hp >= 0 && hp <= hmax) { const lim = h < 0 ? 0 : hmax, k = (lim - hp) / (h - hp); last = [qp + k * (q - qp), lim]; p.push(X(last[0]).toFixed(1) + "," + Y(lim).toFixed(1)); } break; }
      p.push(X(q).toFixed(1) + "," + Y(h).toFixed(1)); qp = q; hp = h; last = [q, h]; } return { pts: p.join(" "), last }; };
    let s = `<svg viewBox="0 0 ${W} ${Ht}" width="100%" role="img" aria-label="Pump curve, system curve and operating point" font-family="sans-serif" font-size="${fs}">`;
    const q70 = 0.7 * M.n * M.qb * per, q120 = 1.2 * M.n * M.qb * per;
    s += `<rect x="${X(q70)}" y="${t}" width="${Math.max(0, Math.min(X(q120), W - r) - X(q70))}" height="${Ht - t - b}" fill="rgba(91,179,122,.10)"/><text x="${(X(q70) + Math.min(X(q120), W - r)) / 2}" y="${Ht - b - 6}" fill="#5BB37A" text-anchor="middle">70–120 % BEP</text>`;
    const stepH = nice(hmax, 5);
    for (let h = 0; h <= hmax; h += stepH) s += `<line x1="${l}" x2="${W - r}" y1="${Y(h)}" y2="${Y(h)}" stroke="#2c3b4f"/><text x="${l - 6}" y="${Y(h) + 4}" fill="#9fb0c3" text-anchor="end">${+h.toFixed(1)}</text>`;
    const stepQ = nice(qmax, small ? 4 : 6);
    for (let q = 0; q <= qmax + 1e-9; q += stepQ) s += `<text x="${X(q)}" y="${Ht - b + 17}" fill="#9fb0c3" text-anchor="middle">${+q.toFixed(1)}</text>`;
    for (let e = 0; e <= 1.0001; e += 0.25) s += `<text x="${W - r + 6}" y="${YE(e) + 4}" fill="#5BB37A">${Math.round(e * 100)}%</text>`;
    s += `<text x="${(l + W - r) / 2}" y="${Ht - 4}" fill="#9fb0c3" text-anchor="middle">Flow, m³/h</text><text transform="translate(${small ? 12 : 14},${(t + Ht - b) / 2}) rotate(-90)" fill="#9fb0c3" text-anchor="middle">Head, m</text>`;
    const eff = (Q) => effAt(M.em, Q / per / (M.n * M.qb));
    const effPts = []; for (let i = 0; i <= 80; i++) { const Q = (Math.min(qmax, qEnd) * i) / 80, e = eff(Q); if (e < 0) break; effPts.push(X(Q).toFixed(1) + "," + YE(e).toFixed(1)); }
    s += `<polyline fill="none" stroke="#5BB37A" stroke-width="1.8" stroke-dasharray="5 4" points="${effPts.join(" ")}"/>`;
    if (M.m !== "1" || M.n !== 1) s += `<polyline fill="none" stroke="#4E9AD6" stroke-width="1.4" opacity=".35" points="${trace((q) => M.H0 - M.a * q * q, 0, Math.min(qmax, 1.4 * M.qb)).pts}"/>`;
    const pc = trace(M.pumpH, 0, Math.min(qmax, qEnd));
    s += `<polyline fill="none" stroke="#4E9AD6" stroke-width="3" points="${pc.pts}"/>`;
    if (qEnd < qmax) s += `<polyline fill="none" stroke="#4E9AD6" stroke-width="2" stroke-dasharray="3 5" opacity=".6" points="${trace(M.pumpH, qEnd, qmax).pts}"/>`;
    const sc = trace((q) => M.sys(q, false), 0, qmax);
    s += `<polyline fill="none" stroke="#E08A3C" stroke-width="2.5" points="${sc.pts}"/>`;
    if (M.kv > 0) s += `<polyline fill="none" stroke="#E08A3C" stroke-width="2" stroke-dasharray="6 4" points="${trace((q) => M.sys(q, true), 0, qmax).pts}"/>`;
    /* labels, kept clear of the operating point */
    const opX = X(M.Q), opY = Y(M.H);
    const lab = (x, y, txt, col, anchor) => { if (!M.noflow && Math.abs(x - opX) < 80 && Math.abs(y - opY) < 18) y += y < opY ? -16 : 20; return `<text x="${x}" y="${y}" fill="${col}" font-weight="700" text-anchor="${anchor}">${txt}</text>`; };
    s += lab(X(qmax * 0.02) + 2, Y(Math.min(M.pumpH(0), hmax)) - 7, M.m === "p" ? "pumps in parallel" : M.m === "s" ? "pumps in series" : "pump", "#4E9AD6", "start");
    if (sc.last) s += lab(X(sc.last[0]) - 6, Y(sc.last[1]) + (sc.last[1] >= hmax - 1e-6 ? 16 : -8), "system", "#E08A3C", "end");
    if (!M.noflow) {
      if (M.kv > 0) { const hp = M.pumpH(M.Q), hsys = M.sys(M.Q, false); s += `<line x1="${opX}" x2="${opX}" y1="${Y(hp)}" y2="${Y(hsys)}" stroke="#E0605A" stroke-width="3"/><text x="${opX - 6}" y="${(Y(hp) + Y(hsys)) / 2 + 4}" fill="#E0605A" text-anchor="end">valve loss</text>`; }
      s += `<circle cx="${opX}" cy="${opY}" r="6.5" fill="#E0605A" stroke="#fff" stroke-width="2"/>`;
    }
    return s + `</svg>`;
  }

  function render() {
    const M = model();
    mount.querySelector(".pc-chart").innerHTML = chart(M);
    [["n", `${S.n} %`], ["hv", `${f(+S.hv, 1)} m`], ["hs", `${f(+S.hs, 1)} m`]].forEach(([k, v]) => { mount.querySelector(`[data-o="${k}"]`).textContent = v; mount.querySelector(`input[data-k="${k}"]`).setAttribute("aria-valuetext", v); });
    const pos = M.x * 100;
    let zone = "", cls = "";
    if (M.noflow) { zone = "No flow: the static head is above the shut-off head. The pump runs dead-headed and heats up."; cls = "bad"; }
    else if (pos < 40) { zone = `Very low flow (${f(pos, 0)} % of BEP): recirculation, vibration and heating. Check the vendor's minimum flow.`; cls = "bad"; }
    else if (pos < 70) { zone = `Below the preferred region (${f(pos, 0)} % of BEP): higher radial load and wear.`; cls = "warn"; }
    else if (pos <= 120) { zone = `In the preferred region (${f(pos, 0)} % of BEP).`; cls = "good"; }
    else if (pos <= 140) { zone = `Run-out (${f(pos, 0)} % of BEP): NPSHr and power climb; watch cavitation and motor load.`; cls = "warn"; }
    else { zone = `Past the end of a typical vendor curve (${f(pos, 0)} % of BEP): the pump may not reach this point at all. Efficiency and power here are rough.`; cls = "bad"; }
    mount.querySelector(".pc-read").innerHTML = `
      <div><span>Flow</span><b>${M.noflow ? "0" : f(M.Q, 1)}</b><small>m³/h${M.m === "p" ? `, ${f(M.qEach, 1)} each` : ""}</small></div>
      <div><span>Head</span><b>${M.noflow ? "—" : f(M.H, 1)}</b><small>m from the pump${M.valveH > 0 ? `, ${f(M.valveH, 1)} m of it lost in the valve` : ""}</small></div>
      <div><span>Efficiency</span><b>${M.noflow ? "—" : f(M.eta * 100, 0)}</b><small>% ${M.m === "1" ? "" : "each pump"}</small></div>
      <div><span>Shaft power</span><b>${M.noflow ? "—" : f(M.shaft, 2)}</b><small>kW${M.m === "1" ? "" : " total"}</small></div>
      <p class="pc-zone ${cls}" aria-live="polite">${esc(zone)}</p>`;
  }
  mount.addEventListener("input", (e) => { const k = e.target.dataset.k; if (!k) return; S[k] = e.target.value; render(); });
  mount.addEventListener("click", (e) => {
    const b = e.target.closest("[data-m]"); if (!b) return; S.mode = b.dataset.m;
    mount.querySelectorAll("[data-m]").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
    render();
  });
  /* show the clamped value when a typed number is out of range */
  mount.addEventListener("change", (e) => { const k = e.target.dataset.k; if (!k || !LIM[k]) return; const v = val(k, NaN); if (isFinite(v) && String(v) !== e.target.value) { e.target.value = v; S[k] = v; render(); } });
  let lastW = null; if (window.ResizeObserver) new ResizeObserver(() => { const w = mount.clientWidth < 520; if (w !== lastW) { lastW = w; render(); } }).observe(mount);
  render();
})();
