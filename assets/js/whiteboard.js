/* PharmaChemE whiteboard lessons: a question, a cheeky reaction from Bubbles, then the board draws the answer
   line by line while the voice explains. Lesson data: assets/data/wb-<slug>.json (built by tools/whiteboard/*.py).
   Reel mode (?reel=<question number>): fills the window and plays one question by itself, for screen recording;
   each voice clip start is logged as "WBCLIP <id> <ms>" so the audio can be laid under the video afterwards. */
(function () {
  "use strict";
  const root = document.getElementById("wb"); if (!root) return;
  const SRC = root.dataset.src, AUD = root.dataset.audio;
  const qs = new URLSearchParams(location.search), REEL = parseInt(qs.get("reel") || "0", 10) || 0;
  const NS = "http://www.w3.org/2000/svg";
  const COL = { k: "#1f2328", r: "#d2352b", b: "#2361c4", g: "#23843a", o: "#d97200" };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  let L = null, muted = false, cur = null, token = 0, score = 0, stepIx = 0;

  /* ---------- stage ---------- */
  root.innerHTML = `<div class="wb-stage">
    <div class="wb-top"><span class="wb-ttl"></span><span class="wb-prog"></span><button type="button" class="wb-mute" aria-label="Sound on or off">🔊</button></div>
    <div class="wb-boardwrap"><svg class="wb-board" viewBox="0 0 360 400" role="img" aria-label="Whiteboard">
      <defs><filter id="wb-rough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter></defs>
      <g class="wb-ink" filter="url(#wb-rough)"></g></svg>
      <div class="wb-mascot big">${mascotSvg()}</div></div>
    <div class="wb-cap" aria-live="polite"></div>
    <div class="wb-opts"></div>
    <div class="wb-nav"></div></div>`;
  const ink = root.querySelector(".wb-ink"), cap = root.querySelector(".wb-cap"), opts = root.querySelector(".wb-opts"), nav = root.querySelector(".wb-nav");
  const masc = root.querySelector(".wb-mascot"), prog = root.querySelector(".wb-prog");
  root.querySelector(".wb-mute").onclick = (e) => { muted = !muted; e.currentTarget.textContent = muted ? "🔇" : "🔊"; if (cur) cur.muted = muted; };
  if (REEL) document.documentElement.classList.add("wb-reel-mode");

  function mascotSvg() {
    return `<svg viewBox="-62 -82 124 140" aria-hidden="true">
      <ellipse cx="0" cy="52" rx="34" ry="5" fill="rgba(0,0,0,.18)"/>
      <circle cx="0" cy="4" r="46" fill="#62b3ec" stroke="#1d4f80" stroke-width="3"/>
      <ellipse cx="-20" cy="-18" rx="10" ry="6" fill="#bfe3fb" transform="rotate(-30 -20 -18)"/>
      <path d="M-40,-24 Q-38,-72 0,-73 Q38,-72 40,-24 Z" fill="#f5c518" stroke="#b88a00" stroke-width="2.5"/>
      <path d="M-4,-72 L4,-72 L4,-26 L-4,-26 Z" fill="#e0a800"/>
      <path d="M-52,-24 L52,-24" stroke="#e0a800" stroke-width="9" stroke-linecap="round"/>
      <g class="wb-eyes"><ellipse class="wb-eye" cx="-16" cy="0" rx="11" ry="13" fill="#fff" stroke="#1d4f80" stroke-width="1.5"/><ellipse class="wb-eye" cx="16" cy="0" rx="11" ry="13" fill="#fff" stroke="#1d4f80" stroke-width="1.5"/>
      <circle class="wb-pup" cx="-14" cy="2" r="5" fill="#13293d"/><circle class="wb-pup" cx="18" cy="2" r="5" fill="#13293d"/></g>
      <path class="wb-lid" d="M-28,-14 L28,-14 L28,-2 L-28,-2 Z" fill="#62b3ec" opacity="0"/>
      <path class="wb-brow" d="M-26,-17 L-8,-15 M8,-15 L26,-17" stroke="#13293d" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path class="wb-mouth" d="M-13,24 Q0,33 13,24" stroke="#13293d" stroke-width="3" fill="#7a2230" stroke-linecap="round"/>
    </svg>`;
  }
  const MOUTH = { idle: "M-13,24 Q0,33 13,24", open: "M-12,21 Q0,40 12,21 Q0,26 -12,21 Z", shock: "M-8,26 Q0,14 8,26 Q0,38 -8,26 Z", happy: "M-17,20 Q0,42 17,20 Q0,26 -17,20 Z", smug: "M-12,27 Q6,30 15,20" };
  const BROW = { idle: "M-26,-17 L-8,-15 M8,-15 L26,-17", shock: "M-26,-24 L-8,-22 M8,-22 L26,-24", smug: "M-26,-14 L-8,-17 M8,-20 L26,-15", happy: "M-26,-20 L-8,-17 M8,-17 L26,-20" };
  let face = "idle", talkT = null;
  function setFace(f) {
    face = f; masc.dataset.face = f;
    masc.querySelector(".wb-mouth").setAttribute("d", MOUTH[f] || MOUTH.idle);
    masc.querySelector(".wb-brow").setAttribute("d", BROW[f] || BROW.idle);
    masc.querySelector(".wb-lid").setAttribute("opacity", f === "smug" ? 1 : 0);
    masc.querySelectorAll(".wb-eye").forEach((e) => e.setAttribute("ry", f === "shock" ? 16 : 13));
    masc.querySelectorAll(".wb-pup").forEach((e) => e.setAttribute("r", f === "shock" ? 3.5 : 5));
  }
  function talk(on) {
    clearInterval(talkT); const m = masc.querySelector(".wb-mouth");
    if (!on) { m.setAttribute("d", MOUTH[face] || MOUTH.idle); return; }
    let o = false; talkT = setInterval(() => { o = !o; m.setAttribute("d", o ? MOUTH.open : (MOUTH[face] || MOUTH.idle)); }, 130);
  }
  const place = (where) => { masc.className = "wb-mascot " + where; };

  /* ---------- voice ---------- */
  function say(id, my) {
    const line = L.lines[id]; if (!line) return Promise.resolve();
    cap.textContent = line.text; cap.classList.add("on");
    if (REEL) console.log("WBCLIP " + id + " " + Date.now());
    const durMs = Math.round((line.dur || 2) * 1000);
    talk(true);
    return new Promise((res) => {
      let done = false; const fin = () => { if (done) return; done = true; talk(false); res(); };
      if (!REEL && !muted) {
        try {
          if (cur) { cur.pause(); }
          cur = new Audio(AUD + id + ".mp3"); cur.muted = muted;
          cur.onended = fin; cur.onerror = () => setTimeout(fin, durMs);
          const p = cur.play(); if (p && p.catch) p.catch(() => setTimeout(fin, durMs));
        } catch (e) { setTimeout(fin, durMs); }
        setTimeout(fin, durMs + 1500); /* never hang on a stuck clip */
      } else setTimeout(fin, durMs);
    }).then(() => { if (my !== token) throw new Error("stale"); });
  }
  const stop = () => { token++; if (cur) { cur.pause(); cur = null; } talk(false); };

  /* ---------- drawing ---------- */
  const tween = (ms, fn) => new Promise((res) => { const t0 = performance.now(); const f = (t) => { const k = Math.max(0, Math.min(1, (t - t0) / ms)); fn(k); if (k < 1) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  function stroke(d, c, w) {
    const p = el("path", { d, fill: "none", stroke: COL[c] || c || COL.k, "stroke-width": w || 3, "stroke-linecap": "round", "stroke-linejoin": "round" }, ink);
    const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    return tween(Math.max(180, Math.min(1100, len * 2.2)), (k) => { p.style.strokeDashoffset = len * (1 - k); });
  }
  let clipN = 0;
  function write(x, y, text, size, c) {
    const id = "wbc" + ++clipN + "-" + token;
    const cp = el("clipPath", { id }, ink); const r = el("rect", { x: x - 2, y: y - size * 1.2, width: 0, height: size * 1.6 }, cp);
    const t = el("text", { x, y, "font-size": size || 18, fill: COL[c] || c || COL.k, "clip-path": `url(#${id})`, class: "wb-hand" }, ink); t.textContent = text;
    const w = t.getComputedTextLength() + 6;
    return tween(Math.max(250, Math.min(1400, text.length * 38)), (k) => r.setAttribute("width", w * k));
  }
  const circ = (cx, cy, rr) => `M${cx - rr},${cy} a${rr},${rr} 0 1,0 ${2 * rr},0 a${rr},${rr} 0 1,0 ${-2 * rr},0`;
  function arrowD(x1, y1, x2, y2) { const a = Math.atan2(y2 - y1, x2 - x1), h = 9; return `M${x1},${y1} L${x2},${y2} M${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} L${x2},${y2} L${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)}`; }
  async function item(it) {
    const [t, ...a] = it;
    if (t === "t") return write(a[0], a[1], a[2], a[3], a[4]);
    if (t === "p") return stroke(a[0], a[1], a[2]);
    if (t === "c") return stroke(circ(a[0], a[1], a[2]), a[3], a[4]);
    if (t === "a") return stroke(arrowD(a[0], a[1], a[2], a[3]), a[4], 2.5);
    if (t === "dim") { const [x, y1, y2, c] = a; await stroke(arrowD(x, (y1 + y2) / 2, x, y1), c, 2.5); return stroke(arrowD(x, (y1 + y2) / 2, x, y2), c, 2.5); }
    if (t === "x") { const [x, y, s, c] = a; return stroke(`M${x - s},${y - s} L${x + s},${y + s} M${x + s},${y - s} L${x - s},${y + s}`, c, 4); }
    if (t === "k") { const [x, y, c] = a; return stroke(`M${x},${y} l6,7 l12,-14`, c, 3.5); }
    if (t === "v") { const [x, y] = a; return stroke(`M${x - 11},${y - 9} L${x + 11},${y + 9} L${x + 11},${y - 9} L${x - 11},${y + 9} Z`, "k", 2.5); }
    if (t === "tank") { const [x, y, w, h, lv] = a; await stroke(`M${x},${y} L${x},${y + h} L${x + w},${y + h} L${x + w},${y}`, "k", 3); return stroke(`M${x + 3},${lv} q${w / 4},-5 ${w / 2},0 t${w / 2 - 6},0`, "b", 3); }
    if (t === "pump") { const [cx, cy, r] = a; await stroke(circ(cx, cy, r), "k", 3); await stroke(circ(cx, cy, r * 0.32), "r", 2.5); return stroke(`M${cx - r * 0.6},${cy + r * 0.55} L${cx + r * 0.6},${cy - r * 0.55}`, "k", 2); }
  }
  async function draw(items, my) { for (const it of items) { if (my !== token) return; await item(it); } }
  function clear() { ink.innerHTML = ""; }
  async function title(text, my) { await write(18, 34, text, 26, "r"); if (my === token) await stroke(`M16,42 q${text.length * 5.5},-4 ${text.length * 11.5},2`, "r", 2.5); }

  /* ---------- lesson flow ---------- */
  const st = () => L.steps[stepIx];
  function navBtns(btns) { nav.innerHTML = btns.map((b, i) => `<button type="button" class="wb-btn${b.prim ? " prim" : ""}" data-i="${i}">${esc(b.t)}</button>`).join(""); nav.querySelectorAll("button").forEach((b) => (b.onclick = () => btns[+b.dataset.i].fn())); }
  function showOpts(enabled) {
    opts.innerHTML = st().opts.map((o, i) => `<button type="button" class="wb-opt" data-i="${i}"${enabled ? "" : " disabled"}><b>${"ABCD"[i]}</b>${esc(o.t)}</button>`).join("");
    opts.querySelectorAll(".wb-opt").forEach((b) => (b.onclick = () => answer(+b.dataset.i)));
  }
  async function ask() {
    stop(); const my = token, s = st();
    prog.textContent = `Q${s.n} of ${L.steps.length}`;
    clear(); place("big"); setFace("smug"); showOpts(!REEL); navBtns([]);
    cap.classList.remove("on");
    const d = draw(s.board, my);
    try { await say(s.say, my); } catch (e) { return; }
    await d; setFace("idle");
    if (REEL) { await wait(700); answer(s.reel); }
  }
  async function answer(i) {
    stop(); const my = token, s = st(), o = s.opts[i];
    opts.querySelectorAll(".wb-opt").forEach((b, j) => { b.disabled = true; if (s.opts[j].ok) b.classList.add("ok"); if (j === i && !o.ok) b.classList.add("bad"); if (j === i) b.classList.add("picked"); });
    if (REEL) opts.querySelectorAll(".wb-opt").forEach((b, j) => { if (s.opts[j].ok) b.classList.remove("ok"); });
    if (o.ok) score++;
    setFace(o.ok ? "happy" : "shock"); masc.classList.add(o.ok ? "hop" : "shake");
    try { await say(o.react, my); } catch (e) { return; }
    masc.classList.remove("hop", "shake");
    explain(my);
  }
  async function explain(my) {
    const s = st(); clear(); place("corner"); setFace("idle");
    await title(s.title, my);
    for (const b of s.beats) {
      if (my !== token) return;
      const d = draw(b.draw, my);
      try { await say(b.say, my); } catch (e) { return; }
      await d; await wait(REEL ? 250 : 350);
    }
    if (my !== token) return;
    if (REEL) {
      opts.querySelectorAll(".wb-opt").forEach((b, j) => { if (s.opts[j].ok) b.classList.add("ok"); });
      setFace("happy");
      try { await say(s.answer, my); await say(L.outroReel, my); } catch (e) { return; }
      root.classList.add("wb-end"); await wait(1800);
      console.log("WBDONE " + Date.now()); return;
    }
    const last = stepIx === L.steps.length - 1;
    navBtns([{ t: "Hear it again", fn: () => { stop(); explain(token); } }, last ? { t: "See your score", prim: true, fn: finish } : { t: "Next question", prim: true, fn: () => { stepIx++; ask(); } }]);
  }
  async function finish() {
    stop(); const my = token; clear(); opts.innerHTML = ""; place("big"); setFace(score >= 5 ? "happy" : score >= 3 ? "smug" : "shock");
    prog.textContent = "Done";
    await write(20, 70, `You got ${score} of ${L.steps.length}`, 32, "r");
    await write(20, 118, score >= 5 ? "Pumps fear you now." : score >= 3 ? "Not bad. Bubbles is watching." : "Bubbles wins this round.", 20, "k");
    navBtns([{ t: "Open the NPSH calculator", prim: true, fn: () => (location.href = L.calc) }, { t: "Start again", fn: () => { score = 0; stepIx = 0; ask(); } }]);
    try { await say(L.outroWeb, my); } catch (e) { /* stopped */ }
  }
  async function start() {
    await document.fonts.load("20px Caveat").catch(() => {});
    if (REEL) { stepIx = Math.max(0, Math.min(L.steps.length - 1, REEL - 1)); await wait(400); ask(); return; }
    clear(); place("big"); setFace("happy"); showOpts(false); opts.innerHTML = "";
    root.querySelector(".wb-ttl").textContent = L.title;
    write(20, 70, L.title, 34, "r"); write(20, 112, `${L.steps.length} questions · voice on`, 18, "k");
    navBtns([{ t: "Start the lesson", prim: true, fn: async () => { stop(); const my = token; try { await say(L.intro, my); } catch (e) { return; } ask(); } }, { t: "Skip intro", fn: () => ask() }]);
  }
  fetch(SRC).then((r) => r.json()).then((d) => { L = d; root.querySelector(".wb-ttl").textContent = d.title; start(); })
    .catch(() => { cap.textContent = "The lesson did not load. Please refresh the page."; cap.classList.add("on"); });
})();
