/* GATE-style virtual scientific calculator (the layout and behaviour of the on-screen calculator used in the GATE exam).
   Number keys build the entry in the lower display. Functions (sin, ln, x², n! ...) act at once on the number shown.
   Two-number keys (+ − × ÷, mod, xʸ, logᵧx, ʸ√x) go into the expression in the upper display; = evaluates it with
   the usual precedence. Deg/Rad for trigonometry, memory keys, Exp for powers of ten, ← backspace, C clear, +/- sign.
   Engine (GCalcEngine) has no DOM so it can be tested; GateCalc.toggle() opens the floating window. */
(function (root) {
  'use strict';
  const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, mod: 2, pow: 3, logy: 3, yroot: 3 };
  const OPD = { '+': '+', '-': '-', '*': '*', '/': '/', mod: 'mod', pow: '^', logy: 'logbase', yroot: 'yroot' };
  function fmt(v) {
    if (!isFinite(v)) throw new Error('Math Error');
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a >= 1e16 || a < 1e-9) return v.toExponential(9).replace(/\.?0+e/, 'e');
    return String(+v.toPrecision(15));
  }
  function fact(n) { if (n < 0 || n !== Math.floor(n) || n > 170) throw new Error('Math Error'); let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
  function applyOp(o, a, b) {
    switch (o) {
      case '+': return a + b; case '-': return a - b; case '*': return a * b;
      case '/': if (b === 0) throw new Error('Math Error'); return a / b;
      case 'mod': if (b === 0) throw new Error('Math Error'); return a % b;
      case 'pow': return Math.pow(a, b);
      case 'logy': if (a <= 0 || b <= 0 || b === 1) throw new Error('Math Error'); return Math.log(a) / Math.log(b);
      case 'yroot': if (b === 0) throw new Error('Math Error'); if (a < 0) { if (Math.abs(b % 2) === 1) return -Math.pow(-a, 1 / b); throw new Error('Math Error'); } return Math.pow(a, 1 / b);
    }
    throw new Error('Syntax Error');
  }
  // tokens: {t:'n', v, d} number, {t:'o', o, d} operator, {t:'(' }, {t:')'}
  function evaluate(toks) {
    const out = [], ops = [];
    const reduce = () => { const o = ops.pop(), b = out.pop(), a = out.pop(); if (a === undefined || b === undefined) throw new Error('Syntax Error'); out.push(applyOp(o.o, a, b)); };
    toks.forEach(k => {
      if (k.t === 'n') out.push(k.v);
      else if (k.t === '(') ops.push(k);
      else if (k.t === ')') { while (ops.length && ops[ops.length - 1].t !== '(') reduce(); ops.pop(); }
      else { while (ops.length && ops[ops.length - 1].t === 'o' && (PREC[ops[ops.length - 1].o] > PREC[k.o] || (PREC[ops[ops.length - 1].o] === PREC[k.o] && k.o !== 'pow'))) reduce(); ops.push(k); }
    });
    while (ops.length) { if (ops[ops.length - 1].t === '(') { ops.pop(); continue; } reduce(); }
    if (out.length !== 1) throw new Error('Syntax Error');
    return out[0];
  }

  function Engine() {
    const S = { toks: [], cur: '0', fresh: true, pending: null, done: false, mem: 0, deg: true, depth: 0, afterParen: false, err: '' };
    const val = () => S.pending ? S.pending.v : parseFloat(S.cur) || 0;
    const disp = () => S.pending ? S.pending.d : S.cur.replace(/e\+?$/, '');
    const last = () => S.toks[S.toks.length - 1];
    function reset() { S.toks = []; S.cur = '0'; S.fresh = true; S.pending = null; S.done = false; S.depth = 0; S.afterParen = false; S.err = ''; }
    function startOver() { if (S.done) { S.toks = []; S.done = false; S.depth = 0; S.afterParen = false; } }
    function pushOperand() { if (S.afterParen) return; S.toks.push({ t: 'n', v: val(), d: disp() }); S.pending = null; }
    const tr = x => S.deg ? x * Math.PI / 180 : x, itr = x => S.deg ? x * 180 / Math.PI : x;
    const clean = y => (Math.abs(y) < 1e-14 ? 0 : y);
    const FN = {
      sin: [x => clean(Math.sin(tr(x))), 'sin'], cos: [x => clean(Math.cos(tr(x))), 'cos'],
      tan: [x => { if (S.deg && Math.abs(x % 180) === 90) throw new Error('Math Error'); return clean(Math.tan(tr(x))); }, 'tan'],
      asin: [x => { if (Math.abs(x) > 1) throw new Error('Math Error'); return itr(Math.asin(x)); }, 'sin⁻¹'],
      acos: [x => { if (Math.abs(x) > 1) throw new Error('Math Error'); return itr(Math.acos(x)); }, 'cos⁻¹'],
      atan: [x => itr(Math.atan(x)), 'tan⁻¹'],
      sinh: [Math.sinh, 'sinh'], cosh: [Math.cosh, 'cosh'], tanh: [Math.tanh, 'tanh'],
      asinh: [Math.asinh, 'sinh⁻¹'], acosh: [x => { if (x < 1) throw new Error('Math Error'); return Math.acosh(x); }, 'cosh⁻¹'], atanh: [x => { if (Math.abs(x) >= 1) throw new Error('Math Error'); return Math.atanh(x); }, 'tanh⁻¹'],
      ln: [x => { if (x <= 0) throw new Error('Math Error'); return Math.log(x); }, 'ln'], log: [x => { if (x <= 0) throw new Error('Math Error'); return Math.log10(x); }, 'log'],
      log2: [x => { if (x <= 0) throw new Error('Math Error'); return Math.log2(x); }, 'log₂'],
      exp: [Math.exp, 'e^'], ten: [x => Math.pow(10, x), '10^'], sq: [x => x * x, 'sqr'], cube: [x => x * x * x, 'cube'],
      sqrt: [x => { if (x < 0) throw new Error('Math Error'); return Math.sqrt(x); }, '√'], cbrt: [Math.cbrt, '∛'],
      inv: [x => { if (x === 0) throw new Error('Math Error'); return 1 / x; }, 'reciproc'], fact: [fact, 'fact'], abs: [Math.abs, 'abs']
    };
    const api = {
      S,
      key(k) {
        try {
          if (S.err && k !== 'C') { reset(); if (k === 'back') return; }
          if (/^[0-9.]$/.test(k)) return api.digit(k);
          if (FN[k]) return api.fn(k);
          if (OPD[k]) return api.op(k);
          ({ '(': api.open, ')': api.close, '=': api.equals, C: reset, back: api.back, sign: api.sign, pct: api.pct, Exp: api.exp, pi: () => api.konst('π', Math.PI), e: () => api.konst('e', Math.E),
            MC: () => { S.mem = 0; }, MR: () => api.konst(fmt(S.mem), S.mem), MS: () => { S.mem = val(); S.fresh = true; }, 'M+': () => { S.mem += val(); S.fresh = true; }, 'M-': () => { S.mem -= val(); S.fresh = true; },
            deg: () => { S.deg = true; }, rad: () => { S.deg = false; } }[k] || (() => {}))();
        } catch (e) { S.err = e.message || 'Error'; }
      },
      digit(d) {
        startOver();
        if (S.afterParen) { S.afterParen = false; }
        if (S.pending) { S.pending = null; S.fresh = true; }
        if (S.fresh) { S.cur = d === '.' ? '0.' : d; S.fresh = false; return; }
        if (/e[+-]?\d*$/.test(S.cur)) { if (d === '.') return; S.cur += d; return; }
        if (d === '.' && S.cur.includes('.')) return;
        if (S.cur.replace(/[-.]/g, '').length >= 16) return;
        S.cur = S.cur === '0' && d !== '.' ? d : S.cur === '-0' && d !== '.' ? '-' + d : S.cur + d;
      },
      konst(d, v) { startOver(); S.afterParen = false; S.pending = { d, v }; S.fresh = true; },
      fn(k) {
        let x, d;
        if (S.afterParen) { // apply to the bracketed group just closed
          let depth = 0, i = S.toks.length - 1;
          for (; i >= 0; i--) { if (S.toks[i].t === ')') depth++; if (S.toks[i].t === '(') { depth--; if (!depth) break; } }
          const grp = S.toks.splice(i); x = evaluate(grp); d = grp.map(t => t.d || t.t).join(' ').replace(/\( /g, '(').replace(/ \)/g, ')');
          S.afterParen = false;
        } else { if (S.done) { S.toks = []; S.done = false; S.depth = 0; } x = val(); d = disp(); }
        const y = FN[k][0](x); if (!isFinite(y)) throw new Error('Math Error');
        S.pending = { d: FN[k][1] + '(' + d + ')', v: y }; S.fresh = true;
      },
      op(o) {
        if (S.done) { const v = val(); S.toks = []; S.done = false; S.depth = 0; S.afterParen = false; S.pending = { d: fmt(v), v }; }
        const lt = last();
        if (S.fresh && !S.pending && !S.afterParen && lt && lt.t === 'o') { S.toks[S.toks.length - 1] = { t: 'o', o, d: OPD[o] }; return; }
        pushOperand(); S.afterParen = false;
        S.toks.push({ t: 'o', o, d: OPD[o] }); S.cur = fmt(val()); S.fresh = true;
        // show the running value of what is complete so far
        try { const part = S.toks.slice(0, -1); if (part.length && !S.depth) S.cur = fmt(evaluate(part)); } catch (e) { /* incomplete: keep the entry */ }
      },
      open() { startOver(); /* a number or bracket right before '(' multiplies it */ if (S.afterParen) S.toks.push({ t: 'o', o: '*', d: '*' }); else if (S.pending || !S.fresh) { pushOperand(); S.toks.push({ t: 'o', o: '*', d: '*' }); }
        S.toks.push({ t: '(', d: '(' }); S.depth++; S.afterParen = false; S.pending = null; S.cur = '0'; S.fresh = true; },
      close() { if (!S.depth) return; pushOperand(); S.toks.push({ t: ')', d: ')' }); S.depth--; S.afterParen = true;
        let dd = 0, i = S.toks.length - 1; for (; i >= 0; i--) { if (S.toks[i].t === ')') dd++; if (S.toks[i].t === '(') { dd--; if (!dd) break; } }
        S.cur = fmt(evaluate(S.toks.slice(i))); S.fresh = true; },
      equals() {
        if (S.done) return;
        pushOperand(); while (S.depth > 0) { S.toks.push({ t: ')', d: ')' }); S.depth--; }
        const v = evaluate(S.toks); S.cur = fmt(v); S.done = true; S.fresh = true; S.afterParen = false; S.pending = null;
      },
      back() { if (S.fresh || S.done || S.pending) return; S.cur = S.cur.length > 1 && !(S.cur.length === 2 && S.cur[0] === '-') ? S.cur.slice(0, -1) : '0'; },
      sign() {
        if (/e[+-]?\d*$/.test(S.cur) && !S.fresh) { S.cur = S.cur.replace(/e([+-]?)(\d*)$/, (m, sg, dg) => 'e' + (sg === '-' ? '+' : '-') + dg); return; }
        if (S.pending || S.fresh) { const v = -val(); S.pending = { d: S.pending ? '-(' + S.pending.d + ')' : fmt(v), v }; S.fresh = true; if (S.done) { S.toks = []; S.done = false; } return; }
        S.cur = S.cur.startsWith('-') ? S.cur.slice(1) : (S.cur === '0' ? '0' : '-' + S.cur);
      },
      pct() {
        const x = val(), lt = last(); let y = x / 100;
        if (lt && lt.t === 'o' && (lt.o === '+' || lt.o === '-')) { try { y = evaluate(S.toks.slice(0, -1)) * x / 100; } catch (e) { /* plain percent */ } }
        S.pending = { d: fmt(y), v: y }; S.fresh = true;
      },
      exp() { startOver(); if (S.pending) { S.cur = fmt(S.pending.v); S.pending = null; } if (/e/.test(S.cur)) return; if (S.fresh) S.cur = '0'; S.cur += 'e+'; S.fresh = false; },
      top() { if (S.err) return ''; const t = S.toks.map(k => k.d).join(' ').replace(/\( /g, '(').replace(/ \)/g, ')'); return (S.done ? t + ' =' : t + (S.pending ? ' ' + S.pending.d : '')).trim(); },
      bottom() { if (S.err) return S.err; if (S.pending) return fmt(S.pending.v); return S.cur; },
      result() { return parseFloat(api.bottom()); }
    };
    return api;
  }

  /* ---------------- the floating window ---------------- */
  const KEYS = [ // [label, key, class, colspan, rowspan]
    ['sinh', 'sinh'], ['cosh', 'cosh'], ['tanh', 'tanh'], ['Exp', 'Exp'], ['(', '('], [')', ')'], ['←', 'back', 'r', 2], ['C', 'C', 'r'], ['+/-', 'sign', 'r'], ['√', 'sqrt'],
    ['sinh<sup>-1</sup>', 'asinh'], ['cosh<sup>-1</sup>', 'acosh'], ['tanh<sup>-1</sup>', 'atanh'], ['log<sub>2</sub>x', 'log2'], ['ln', 'ln'], ['log', 'log'], ['7', '7', 'n'], ['8', '8', 'n'], ['9', '9', 'n'], ['/', '/'], ['%', 'pct'],
    ['π', 'pi'], ['e', 'e'], ['n!', 'fact'], ['log<sub>y</sub>x', 'logy'], ['e<sup>x</sup>', 'exp'], ['10<sup>x</sup>', 'ten'], ['4', '4', 'n'], ['5', '5', 'n'], ['6', '6', 'n'], ['*', '*'], ['1/x', 'inv'],
    ['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan'], ['x<sup>y</sup>', 'pow'], ['x<sup>3</sup>', 'cube'], ['x<sup>2</sup>', 'sq'], ['1', '1', 'n'], ['2', '2', 'n'], ['3', '3', 'n'], ['-', '-'], ['=', '=', 'g', 1, 2],
    ['sin<sup>-1</sup>', 'asin'], ['cos<sup>-1</sup>', 'acos'], ['tan<sup>-1</sup>', 'atan'], ['<sup>y</sup>√x', 'yroot'], ['<sup>3</sup>√', 'cbrt'], ['|x|', 'abs'], ['0', '0', 'n', 2], ['.', '.', 'n'], ['+', '+']
  ];
  const STYLE = `
  .vcalc{position:fixed;z-index:1200;right:16px;bottom:16px;width:min(560px,calc(100vw - 16px));background:#d4d4d4;border:1px solid #8a8a8a;border-radius:6px;box-shadow:0 14px 40px rgba(0,0,0,.45);font-family:Arial,Helvetica,sans-serif;color:#000;user-select:none;-webkit-user-select:none;touch-action:manipulation}
  .vcalc[hidden]{display:none}
  .vcalc:focus{outline:none}.vcalc:focus-visible{outline:3px solid #1a4fb4}
  .vc-bar{display:flex;align-items:center;gap:8px;padding:7px 8px 7px 12px;background:linear-gradient(#5c86d6,#3a62bd);border-radius:5px 5px 0 0;color:#fff;cursor:move}
  .vc-bar b{flex:1;font-weight:400;font-size:17px;text-shadow:0 1px 1px rgba(0,0,0,.35)}
  .vc-bar button{all:unset;cursor:pointer;color:#fff;font-size:15px;padding:3px 9px;border-radius:3px}
  .vc-bar .vc-help{background:#2f62c2;border:1px solid #6f97e0;font-size:14px}
  .vc-bar button:focus-visible{outline:2px solid #fff}
  .vc-body{padding:10px}
  .vcalc.min .vc-body{display:none}
  .vc-top,.vc-bot{background:linear-gradient(#f4f4f4,#e6e6e6);border:1px solid #9a9a9a;border-radius:2px;height:30px;line-height:30px;padding:0 8px;text-align:right;overflow:hidden;white-space:nowrap;font-size:15px;color:#333;direction:rtl}
  .vc-top span,.vc-bot span{direction:ltr;unicode-bidi:embed}
  .vc-bot{height:40px;line-height:40px;font-size:26px;color:#111;margin-top:6px;position:relative}
  .vc-m{position:absolute;left:8px;top:0;font-size:12px;color:#555;direction:ltr}
  .vc-row0{display:grid;grid-template-columns:repeat(11,1fr);gap:5px;align-items:center;margin:8px 0 5px}
  .vc-mode{grid-column:2/span 3;display:flex;gap:10px;align-items:center;font-size:13px}
  .vc-mode label{display:flex;align-items:center;gap:3px;cursor:pointer}
  .vc-keys{display:grid;grid-template-columns:repeat(11,1fr);gap:5px}
  .vcalc .vk{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-height:32px;padding:2px 1px;background:linear-gradient(#fbfbfb,#dcdcdc);border:1px solid #9d9d9d;border-radius:3px;box-shadow:0 1px 1px rgba(0,0,0,.25);font-size:14px;color:#222;cursor:pointer;text-align:center;line-height:1}
  .vcalc .vk sup,.vcalc .vk sub{font-size:10px;line-height:1;position:relative}.vcalc .vk sup{top:-0.45em;vertical-align:baseline}.vcalc .vk sub{top:0.3em;vertical-align:baseline}
  .vcalc .vk:active,.vcalc .vk.on{background:linear-gradient(#d6d6d6,#f2f2f2);box-shadow:inset 0 1px 2px rgba(0,0,0,.3)}
  .vcalc .vk:focus-visible{outline:2px solid #1a4fb4;outline-offset:1px}
  .vcalc .vk.n{font-size:17px}
  .vcalc .vk.r{background:linear-gradient(#e2513c,#c4301c);border-color:#9b2414;color:#fff;font-size:16px}
  .vcalc .vk.g{background:linear-gradient(#4cc35a,#25a23a);border-color:#1b7c2b;color:#fff;font-size:22px}
  .vc-helptext{font-size:12.5px;line-height:1.45;background:#fff;border:1px solid #9a9a9a;padding:8px 10px;margin-top:8px;color:#222}
  .vc-helptext[hidden]{display:none}
  @media (max-width:520px){.vcalc{right:8px;left:8px;width:auto;bottom:8px}.vcalc .vk{min-height:30px;font-size:11px}.vcalc .vk.n{font-size:15px}.vc-keys,.vc-row0{gap:3px}.vc-body{padding:6px}.vc-bot{font-size:22px}.vc-bar b{font-size:15px}}
  `;
  let el = null, eng = null;
  function build() {
    if (!document.getElementById('vcalc-css')) { const st = document.createElement('style'); st.id = 'vcalc-css'; st.textContent = STYLE; document.head.appendChild(st); }
    eng = Engine();
    el = document.createElement('div'); el.className = 'vcalc'; el.tabIndex = 0; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Scientific calculator');
    const cell = ([t, k, c, cs, rs]) => `<button type="button" class="vk${c ? ' ' + c : ''}" data-k="${k}" style="${cs ? 'grid-column:span ' + cs + ';' : ''}${rs ? 'grid-row:span ' + rs + ';' : ''}">${t}</button>`;
    el.innerHTML = `<div class="vc-bar"><b>Scientific Calculator</b><button type="button" class="vc-help">Help</button><button type="button" class="vc-min" aria-label="Minimise">&#8212;</button><button type="button" class="vc-x" aria-label="Close">&#10005;</button></div>
      <div class="vc-body"><div class="vc-top" aria-label="Expression"><span id="vc-top"></span></div><div class="vc-bot" aria-live="polite"><span class="vc-m" id="vc-m"></span><span id="vc-bot">0</span></div>
      <div class="vc-row0"><button type="button" class="vk" data-k="mod">mod</button><div class="vc-mode"><label><input type="radio" name="vc-ang" value="deg" checked> Deg</label><label><input type="radio" name="vc-ang" value="rad"> Rad</label></div><span></span><span></span>
      ${['MC', 'MR', 'MS', 'M+', 'M-'].map(m => `<button type="button" class="vk" data-k="${m}" style="grid-column:span 1">${m}</button>`).join('')}</div>
      <div class="vc-keys">${KEYS.map(cell).join('')}</div>
      <div class="vc-helptext" id="vc-helptext" hidden><b>How it works</b><br>Type a number, then press a function (sin, ln, x², n!, √ …): it acts at once on the number shown.<br>For two numbers use + − * / mod xʸ logᵧx ʸ√x, then =. Example: 8 logᵧx 2 = 3; 27 ʸ√x 3 = 3; 2 xʸ 10 = 1024.<br>Exp enters a power of ten: 6.022 Exp 23. Press +/- after Exp for a negative power.<br>Deg/Rad sets the angle unit for sin, cos, tan and their inverses. MS stores, MR recalls, M+ and M- add to or subtract from memory, MC clears it.<br>Keyboard: digits, + − * / ( ) . Enter (=), Backspace (←), Esc (C).</div></div>`;
    document.body.appendChild(el);
    const top = el.querySelector('#vc-top'), bot = el.querySelector('#vc-bot'), mi = el.querySelector('#vc-m');
    const show = () => { top.textContent = eng.top(); bot.textContent = eng.bottom(); mi.textContent = eng.S.mem ? 'M' : ''; };
    el.addEventListener('click', e => { const b = e.target.closest('.vk'); if (!b) return; eng.key(b.dataset.k); show(); el.focus({ preventScroll: true }); });
    el.querySelectorAll('input[name="vc-ang"]').forEach(r => r.addEventListener('change', () => { eng.key(r.value); el.focus({ preventScroll: true }); }));
    el.querySelector('.vc-x').onclick = () => { el.hidden = true; };
    el.querySelector('.vc-min').onclick = () => { el.classList.toggle('min'); };
    el.querySelector('.vc-help').onclick = () => { const h = el.querySelector('#vc-helptext'); h.hidden = !h.hidden; };
    const KB = { Enter: '=', '=': '=', Backspace: 'back', Escape: 'C', Delete: 'C', '^': 'pow', '%': 'pct' };
    el.addEventListener('keydown', e => {
      let k = KB[e.key] || (/^[0-9.+\-*/()]$/.test(e.key) ? e.key : null); if (!k) return;
      e.preventDefault(); eng.key(k); show();
      const b = el.querySelector(`.vk[data-k="${window.CSS && CSS.escape ? CSS.escape(k) : k}"]`); if (b) { b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 120); }
    });
    let drag = null; const bar = el.querySelector('.vc-bar');
    bar.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; const r = el.getBoundingClientRect(); drag = [e.clientX - r.left, e.clientY - r.top]; try { bar.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } });
    bar.addEventListener('pointermove', e => { if (!drag) return; el.style.left = Math.max(0, Math.min(innerWidth - 80, e.clientX - drag[0])) + 'px'; el.style.top = Math.max(0, Math.min(innerHeight - 40, e.clientY - drag[1])) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.width = el.getBoundingClientRect().width + 'px'; });
    bar.addEventListener('pointerup', () => { drag = null; });
    show();
  }
  function toggle() { if (!el) { build(); el.focus({ preventScroll: true }); return; } el.hidden = !el.hidden; if (!el.hidden) { el.classList.remove('min'); el.focus({ preventScroll: true }); } }
  const api = { Engine, evaluate, fmt, toggle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else { root.GCalcEngine = Engine; root.GateCalc = api; }
})(typeof window !== 'undefined' ? window : globalThis);
