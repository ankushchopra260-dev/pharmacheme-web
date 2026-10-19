/* PharmaChemE GATE CH: practice mode and full mock test (GATE format), with a virtual scientific calculator.
   Questions come from gate-bank.js (window.GATE_BANK). Progress is kept in this browser only. */
(function () {
  'use strict';
  const BANK = window.GATE_BANK || [], SECS = window.GATE_SECS || {}, root = document.getElementById('gate-app'); if (!root || !BANK.length) return;
  const MODE = root.dataset.mode;
  const $ = s => root.querySelector(s), $$ = s => Array.from(root.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } } };
  const L = i => String.fromCharCode(65 + i);
  const byId = Object.fromEntries(BANK.map(q => [q.id, q]));

  /* ---------- answer checking and marks (GATE rules) ---------- */
  function isAnswered(q, a) { if (a == null) return false; if (q.t === 'MSQ') return Array.isArray(a) && a.length > 0; if (q.t === 'NAT') return String(a).trim() !== '' && isFinite(+a); return a !== '' && a != null; }
  function isRight(q, a) { if (!isAnswered(q, a)) return false;
    if (q.t === 'MCQ') return +a === q.a; if (q.t === 'MSQ') { const s = new Set(a.map(Number)); return s.size === q.a.length && q.a.every(i => s.has(i)); }
    const v = +a; return v >= q.a[0] - 1e-9 && v <= q.a[1] + 1e-9; }
  function marks(q, a) { if (!isAnswered(q, a)) return 0; if (isRight(q, a)) return q.m; return q.t === 'MCQ' ? -q.m / 3 : 0; }
  const keyText = q => q.t === 'MCQ' ? L(q.a) : q.t === 'MSQ' ? q.a.map(L).join(', ') : (q.a[0] === q.a[1] ? String(q.a[0]) : q.a[0] + ' to ' + q.a[1]);
  const ansText = (q, a) => !isAnswered(q, a) ? 'Not answered' : q.t === 'MCQ' ? L(+a) : q.t === 'MSQ' ? a.map(Number).sort().map(L).join(', ') : String(a);

  /* ---------- question rendering ---------- */
  function qHTML(q, a, name, lock) { let h = '<div class="gq-meta"><span>' + esc(SECS[q.sec] || q.sec) + '</span><span>' + q.t + '</span><span>' + q.m + ' mark' + (q.m > 1 ? 's' : '') + '</span>' + (q.t === 'MCQ' ? '<span class="neg">−' + (q.m === 1 ? '1/3' : '2/3') + ' if wrong</span>' : '<span>no negative marks</span>') + '</div>';
    h += '<div class="gq-text">' + q.q + '</div>';
    if (q.t === 'MCQ' || q.t === 'MSQ') { const multi = q.t === 'MSQ', sel = multi ? new Set((a || []).map(Number)) : a;
      h += '<div class="gq-opts" role="' + (multi ? 'group' : 'radiogroup') + '">' + q.o.map((o, i) => '<label class="gq-opt"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + name + '" value="' + i + '"' + ((multi ? sel.has(i) : +sel === i && sel !== '' && sel != null) ? ' checked' : '') + (lock ? ' disabled' : '') + '><b>(' + L(i) + ')</b> <span>' + o + '</span></label>').join('') + '</div>';
      if (multi) h += '<p class="gq-hint">One or more options are correct. You get the marks only if you select all the correct options and no wrong one.</p>'; }
    else h += '<label class="gq-nat">Your answer <input type="text" inputmode="decimal" autocomplete="off" name="' + name + '" value="' + esc(a == null ? '' : a) + '"' + (lock ? ' disabled' : '') + ' aria-label="Numerical answer"></label><p class="gq-hint">Type a number. Answers within the stated rounding are accepted.</p>';
    return h; }
  function readAnswer(box, q) { if (q.t === 'MCQ') { const r = box.querySelector('input:checked'); return r ? +r.value : null; }
    if (q.t === 'MSQ') return Array.from(box.querySelectorAll('input:checked')).map(i => +i.value);
    const v = box.querySelector('.gq-nat input').value.trim(); return v === '' ? null : v; }

  /* ---------- virtual calculator ---------- */
  function calc() { let el = document.getElementById('gate-calc'); if (el) { el.hidden = !el.hidden; return; }
    el = document.createElement('div'); el.id = 'gate-calc'; el.className = 'gcalc'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Scientific calculator');
    const keys = [['sin', 'sin('], ['cos', 'cos('], ['tan', 'tan('], ['ln', 'ln('], ['log', 'log('], ['asin', 'asin('], ['acos', 'acos('], ['atan', 'atan('], ['eˣ', 'exp('], ['10ˣ', '10^'], ['√', 'sqrt('], ['x²', '^2'], ['xʸ', '^'], ['1/x', '1/('], ['π', 'π'],
      ['(', '('], [')', ')'], ['e', 'e'], ['Ans', 'Ans'], ['⌫', 'BK'], ['7', '7'], ['8', '8'], ['9', '9'], ['÷', '/'], ['C', 'CL'], ['4', '4'], ['5', '5'], ['6', '6'], ['×', '*'], ['±', '(-'], ['1', '1'], ['2', '2'], ['3', '3'], ['−', '-'], ['EXP', 'E'], ['0', '0'], ['.', '.'], ['=', 'EQ'], ['+', '+'], ['Deg', 'DEG']];
    el.innerHTML = '<div class="gc-head"><b>Calculator</b><button type="button" class="gc-x" aria-label="Close calculator">✕</button></div><input class="gc-in" aria-label="Expression" autocomplete="off" spellcheck="false"><div class="gc-out" aria-live="polite">0</div><div class="gc-keys">' + keys.map(([t, k]) => '<button type="button" data-k="' + esc(k) + '"' + (k === 'EQ' ? ' class="eq"' : k === 'DEG' ? ' class="deg" aria-pressed="true"' : '') + '>' + t + '</button>').join('') + '</div>';
    document.body.appendChild(el); const inp = el.querySelector('.gc-in'), out = el.querySelector('.gc-out'); let deg = true, ans = 0;
    const run = () => { try { const v = evaluate(inp.value, deg, ans); if (!isFinite(v)) throw new Error('Math error'); ans = v; out.textContent = fmt(v); } catch (e) { out.textContent = e.message || 'Error'; } };
    el.querySelector('.gc-keys').onclick = e => { const b = e.target.closest('button'); if (!b) return; const k = b.dataset.k;
      if (k === 'EQ') run(); else if (k === 'CL') { inp.value = ''; out.textContent = '0'; } else if (k === 'BK') inp.value = inp.value.slice(0, -1);
      else if (k === 'DEG') { deg = !deg; b.textContent = deg ? 'Deg' : 'Rad'; b.setAttribute('aria-pressed', String(deg)); } else inp.value += k; inp.focus(); };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); run(); } if (e.key === 'Escape') el.hidden = true; });
    el.querySelector('.gc-x').onclick = () => { el.hidden = true; };
    let drag = null; el.querySelector('.gc-head').addEventListener('pointerdown', e => { if (e.target.closest('button')) return; const r = el.getBoundingClientRect(); drag = [e.clientX - r.left, e.clientY - r.top]; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => { if (!drag) return; el.style.left = Math.max(0, Math.min(innerWidth - 60, e.clientX - drag[0])) + 'px'; el.style.top = Math.max(0, Math.min(innerHeight - 40, e.clientY - drag[1])) + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto'; });
    el.addEventListener('pointerup', () => { drag = null; }); inp.focus(); }
  const fmt = v => { if (Math.abs(v) >= 1e10 || (Math.abs(v) < 1e-6 && v !== 0)) return v.toExponential(8).replace(/\.?0+e/, 'e'); return String(+v.toPrecision(12)); };
  function evaluate(src, deg, ans) { const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s+/g, ''); let i = 0;
    const tr = x => deg ? x * Math.PI / 180 : x, itr = x => deg ? x * 180 / Math.PI : x;
    const F = { sin: x => Math.sin(tr(x)), cos: x => Math.cos(tr(x)), tan: x => Math.tan(tr(x)), asin: x => itr(Math.asin(x)), acos: x => itr(Math.acos(x)), atan: x => itr(Math.atan(x)), ln: Math.log, log: Math.log10, sqrt: Math.sqrt, exp: Math.exp, abs: Math.abs };
    const peek = () => s[i], eat = c => { if (s[i] === c) { i++; return true; } return false; };
    function expr() { let v = term(); for (;;) { if (eat('+')) v += term(); else if (eat('-')) v -= term(); else return v; } }
    function term() { let v = unary(); for (;;) { if (eat('*')) v *= unary(); else if (eat('/')) v /= unary(); else if (peek() === '(' || /[a-zπA]/.test(peek() || '')) v *= unary(); else return v; } }
    function unary() { if (eat('-')) return -unary(); if (eat('+')) return unary(); return power(); }
    function power() { const b = primary(); if (eat('^')) return Math.pow(b, unary()); return b; }
    function primary() { if (eat('(')) { const v = expr(); eat(')'); return v; }
      const m = /^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/.exec(s.slice(i)); if (m) { i += m[0].length; return parseFloat(m[0].replace('E', 'e')); }
      if (eat('π')) return Math.PI; if (s.startsWith('Ans', i)) { i += 3; return ans; }
      const f = /^(asin|acos|atan|sin|cos|tan|ln|log|sqrt|exp|abs)/.exec(s.slice(i)); if (f) { i += f[0].length; if (!eat('(')) throw new Error('Syntax error'); const v = expr(); eat(')'); return F[f[1]](v); }
      if (eat('e')) return Math.E; throw new Error('Syntax error'); }
    if (!s) return 0; const v = expr(); if (i < s.length) throw new Error('Syntax error'); return v; }

  /* =========================== PRACTICE =========================== */
  function practice() { const KEY = 'pcme-gate-practice', prog = store.get(KEY, {}), q0 = new URLSearchParams(location.search).get('sec'); let f = { sec: SECS[q0] ? q0 : '', t: '', m: '' }, list = [], idx = 0;
    const secs = Object.keys(SECS);
    root.innerHTML = '<div class="gp-filters"><div class="gp-chips" role="group" aria-label="Section">' + ['', ...secs].map(s => '<button type="button" data-sec="' + s + '" aria-pressed="' + (s === f.sec ? 'true' : 'false') + '">' + (s ? esc(SECS[s]) : 'All sections') + ' <span>' + BANK.filter(q => !s || q.sec === s).length + '</span></button>').join('') + '</div>' +
      '<div class="gp-row"><label>Type <select id="gp-t"><option value="">All</option><option>MCQ</option><option>MSQ</option><option>NAT</option></select></label><label>Marks <select id="gp-m"><option value="">All</option><option value="1">1 mark</option><option value="2">2 marks</option></select></label><label class="gp-unseen"><input type="checkbox" id="gp-new"> Only questions I have not answered correctly</label><button type="button" class="gp-calc">Calculator</button></div></div>' +
      '<div class="gp-main"><div class="gq-card" id="gp-card"></div><aside class="gp-side" id="gp-side"></aside></div>';
    const filter = () => { const onlyNew = $('#gp-new').checked; list = BANK.filter(q => (!f.sec || q.sec === f.sec) && (!f.t || q.t === f.t) && (!f.m || q.m === +f.m) && (!onlyNew || prog[q.id] !== 1)); idx = 0; show(); };
    $$('.gp-chips button').forEach(b => b.onclick = () => { f.sec = b.dataset.sec; $$('.gp-chips button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); filter(); });
    $('#gp-t').onchange = e => { f.t = e.target.value; filter(); }; $('#gp-m').onchange = e => { f.m = e.target.value; filter(); }; $('#gp-new').onchange = filter; $('.gp-calc').onclick = calc;
    function side() { const rows = secs.map(s => { const qs = BANK.filter(q => q.sec === s), done = qs.filter(q => prog[q.id] != null).length, ok = qs.filter(q => prog[q.id] === 1).length;
      return '<tr><td>' + esc(SECS[s]) + '</td><td>' + ok + ' / ' + done + '</td><td><span class="bar"><i style="width:' + Math.round(100 * done / qs.length) + '%"></i></span></td></tr>'; }).join('');
      const tot = Object.keys(prog).length, ok = Object.values(prog).filter(v => v === 1).length;
      $('#gp-side').innerHTML = '<h3>Your progress</h3><p class="big">' + ok + ' correct of ' + tot + ' tried</p><p class="mute">' + BANK.length + ' questions in the bank. Kept in this browser.</p><table><tr><th>Section</th><th>Right / tried</th><th></th></tr>' + rows + '</table><button type="button" id="gp-reset">Reset progress</button>';
      $('#gp-reset').onclick = () => { if (!confirm('Clear your practice progress?')) return; Object.keys(prog).forEach(k => delete prog[k]); store.set(KEY, prog); filter(); side(); }; }
    function show() { const card = $('#gp-card'); if (!list.length) { card.innerHTML = '<p class="gq-empty">No questions match these filters. Try another section, or clear "only questions I have not answered correctly".</p>'; side(); return; }
      const q = list[idx]; card.innerHTML = '<div class="gq-top"><b>Question ' + (idx + 1) + ' of ' + list.length + '</b>' + (prog[q.id] === 1 ? '<span class="ok">Answered correctly before</span>' : prog[q.id] === 0 ? '<span class="bad">Wrong last time</span>' : '') + '</div>' + qHTML(q, null, 'p-' + q.id, false) +
        '<div class="gq-act"><button type="button" class="prim" id="gp-check">Check answer</button><button type="button" id="gp-show">Show solution</button><span class="sp"></span><button type="button" id="gp-prev"' + (idx ? '' : ' disabled') + '>Previous</button><button type="button" id="gp-next"' + (idx < list.length - 1 ? '' : ' disabled') + '>Next</button></div><div class="gq-sol" id="gp-sol" hidden></div>';
      const sol = (a, checked) => { const box = $('#gp-sol'), right = checked && isRight(q, a); box.hidden = false; box.className = 'gq-sol ' + (checked ? (right ? 'right' : 'wrong') : '');
        box.innerHTML = (checked ? '<p class="verdict">' + (right ? 'Correct. +' + q.m : !isAnswered(q, a) ? 'Not answered.' : 'Not quite.' + (q.t === 'MCQ' ? ' In the exam this costs ' + (q.m === 1 ? '1/3' : '2/3') + ' mark.' : ' No negative marks for ' + q.t + '.')) + '</p>' : '') + '<p><b>Answer:</b> ' + keyText(q) + '</p><div>' + q.s + '</div>' + (window.GATE_ANIM ? GATE_ANIM.figureFor(q) : ''); if (window.GATE_ANIM) GATE_ANIM.auto(box); };
      $('#gp-check').onclick = () => { const a = readAnswer(card, q); if (!isAnswered(q, a)) { sol(a, true); return; } prog[q.id] = isRight(q, a) ? 1 : 0; store.set(KEY, prog); sol(a, true); side(); };
      $('#gp-show').onclick = () => sol(null, false);
      $('#gp-prev').onclick = () => { idx--; show(); }; $('#gp-next').onclick = () => { idx++; show(); };
      card.querySelector('.gq-nat input') && card.querySelector('.gq-nat input').addEventListener('keydown', e => { if (e.key === 'Enter') $('#gp-check').click(); });
      side(); }
    filter(); }

  /* =========================== MOCK TEST =========================== */
  /* GATE CH pattern: 10 GA (5 x 1 mark, 5 x 2 marks), Engineering Mathematics 13 marks, core 72 marks; 25 one-mark and 30 two-mark subject questions. */
  const PLAN = { GA: [5, 5], MA: [7, 3], PC: [2, 2], TD: [2, 3], FM: [2, 4], HT: [2, 3], MT: [2, 4], RE: [2, 4], CN: [2, 3], PD: [0, 3], CT: [4, 1] };
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function draw(seed) { const r = rng(seed), pick = (arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
    const ga1 = pick(BANK.filter(q => q.sec === 'GA' && q.m === 1), 5), ga2 = pick(BANK.filter(q => q.sec === 'GA' && q.m === 2), 5), one = [], two = [];
    Object.entries(PLAN).forEach(([s, [n1, n2]]) => { if (s === 'GA') return; one.push(...pick(BANK.filter(q => q.sec === s && q.m === 1), n1)); two.push(...pick(BANK.filter(q => q.sec === s && q.m === 2), n2)); });
    const order = Object.keys(PLAN), so = (a, b) => order.indexOf(a.sec) - order.indexOf(b.sec);
    return ga1.concat(ga2, one.sort(so), two.sort(so)).map(q => q.id); }
  function mock() { const KEY = 'pcme-gate-mock', HKEY = 'pcme-gate-mock-history'; let st = store.get(KEY, null);
    const save = () => store.set(KEY, st);
    if (st && st.done) return result(); if (st && st.ids) return exam(); intro();
    function intro() { const hist = store.get(HKEY, []);
      root.innerHTML = '<div class="gm-intro"><h2>GATE Chemical Engineering mock test</h2><ul><li><b>65 questions, 100 marks, 3 hours</b>, as in the real paper: 10 General Aptitude (15 marks) and 55 Chemical Engineering questions (85 marks, including 13 marks of Engineering Mathematics).</li><li><b>MCQ:</b> one correct option. A wrong answer costs 1/3 mark (1-mark questions) or 2/3 mark (2-mark questions).</li><li><b>MSQ:</b> one or more correct options. Full marks only for exactly the right set. No negative marks.</li><li><b>NAT:</b> type a number. No negative marks.</li><li>The timer keeps running if you close the page. Use <b>Calculator</b> for the on-screen scientific calculator, as in the exam.</li><li>Each new mock draws a fresh set from our bank of ' + BANK.length + ' original questions. These are practice questions written in the GATE style, not past GATE papers.</li></ul>' +
        '<label class="gm-agree"><input type="checkbox" id="gm-ok"> I have read the instructions.</label><button type="button" class="prim" id="gm-start" disabled>Start the mock test</button>' +
        (hist.length ? '<h3>Your earlier attempts</h3><table class="gm-hist"><tr><th>Date</th><th>Score</th><th>Correct</th><th>Wrong</th><th>Time used</th></tr>' + hist.slice(-8).reverse().map(h => '<tr><td>' + esc(h.d) + '</td><td><b>' + h.score.toFixed(2) + '</b> / 100</td><td>' + h.c + '</td><td>' + h.w + '</td><td>' + h.t + ' min</td></tr>').join('') + '</table>' : '') + '</div>';
      $('#gm-ok').onchange = e => { $('#gm-start').disabled = !e.target.checked; };
      $('#gm-start').onclick = () => { const seed = Date.now() % 2147483647, ids = draw(seed); st = { seed, ids, ans: {}, mark: {}, seen: { [ids[0]]: 1 }, cur: 0, end: Date.now() + 180 * 60000, start: Date.now() }; save(); exam(); }; }
    function exam() { let timer = 0;
      root.innerHTML = '<div class="gm"><div class="gm-top"><b>GATE CH mock</b><span class="gm-tabs"><button type="button" data-tab="ga">General Aptitude</button><button type="button" data-tab="ch">Chemical Engineering</button></span><span class="sp"></span><button type="button" class="gm-calcb">Calculator</button><span class="gm-time" id="gm-time" aria-live="off">3:00:00</span></div>' +
        '<div class="gm-body"><section class="gm-q" id="gm-q" aria-live="polite"></section><aside class="gm-pal"><div class="gm-legend"><span><i class="s-ans"></i>Answered</span><span><i class="s-no"></i>Not answered</span><span><i class="s-nv"></i>Not visited</span><span><i class="s-mr"></i>Marked for review</span><span><i class="s-amr"></i>Answered and marked</span></div><div class="gm-grid" id="gm-grid"></div><button type="button" class="prim" id="gm-submit">Submit test</button></aside></div>' +
        '<div class="gm-bar"><button type="button" id="gm-mark">Mark for review and next</button><button type="button" id="gm-clear">Clear response</button><span class="sp"></span><button type="button" id="gm-back">Previous</button><button type="button" class="prim" id="gm-save">Save and next</button></div></div>';
      const qs = st.ids.map(id => byId[id]).filter(Boolean), N = qs.length;
      const status = i => { const q = qs[i], a = st.ans[q.id], an = isAnswered(q, a), mr = !!st.mark[q.id]; return mr ? (an ? 's-amr' : 's-mr') : an ? 's-ans' : st.seen[q.id] ? 's-no' : 's-nv'; };
      function grid() { $('#gm-grid').innerHTML = qs.map((q, i) => '<button type="button" class="' + status(i) + (i === st.cur ? ' cur' : '') + '" data-i="' + i + '" aria-label="Question ' + (i + 1) + '">' + (i + 1) + '</button>').join('');
        $$('#gm-grid button').forEach(b => b.onclick = () => { keep(); go(+b.dataset.i); }); $$('.gm-tabs button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.tab === 'ga') === (st.cur < 10)))); }
      function show() { const q = qs[st.cur]; st.seen[q.id] = 1; $('#gm-q').innerHTML = '<div class="gq-top"><b>Question ' + (st.cur + 1) + '</b><span class="mute">' + (st.cur < 10 ? 'General Aptitude' : 'Chemical Engineering') + '</span></div>' + qHTML(q, st.ans[q.id], 'm-' + q.id, false);
        $('#gm-back').disabled = st.cur === 0; save(); grid(); }
      function keep() { const q = qs[st.cur], a = readAnswer($('#gm-q'), q); if (isAnswered(q, a)) st.ans[q.id] = a; else delete st.ans[q.id]; save(); }
      function go(i) { st.cur = Math.max(0, Math.min(N - 1, i)); show(); }
      $('#gm-save').onclick = () => { keep(); go(st.cur + 1); };
      $('#gm-mark').onclick = () => { keep(); st.mark[qs[st.cur].id] = 1; go(st.cur + 1); };
      $('#gm-clear').onclick = () => { delete st.ans[qs[st.cur].id]; delete st.mark[qs[st.cur].id]; show(); };
      $('#gm-back').onclick = () => { keep(); go(st.cur - 1); };
      $$('.gm-tabs button').forEach(b => b.onclick = () => { keep(); go(b.dataset.tab === 'ga' ? 0 : 10); });
      $('.gm-calcb').onclick = calc;
      $('#gm-submit').onclick = () => { keep(); const a = qs.filter(q => isAnswered(q, st.ans[q.id])).length, m = qs.filter(q => st.mark[q.id]).length;
        if (!confirm('Submit the test?\n\nAnswered: ' + a + ' of ' + N + '\nMarked for review: ' + m + '\nNot answered: ' + (N - a) + '\n\nYou cannot change answers after submitting.')) return; finish(); };
      function finish() { clearInterval(timer); st.done = Date.now(); save(); const g = grade(); const hist = store.get(HKEY, []); hist.push({ d: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), score: g.score, c: g.c, w: g.w, t: g.mins }); store.set(HKEY, hist.slice(-20)); result(); }
      const tick = () => { const left = Math.max(0, st.end - Date.now()), s = Math.floor(left / 1000), t = Math.floor(s / 3600) + ':' + String(Math.floor(s % 3600 / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'), el = $('#gm-time');
        if (!el) { clearInterval(timer); return; } el.textContent = t; el.classList.toggle('low', left < 5 * 60000); if (left <= 0) { keep(); alert('Time is up. Your test is being submitted.'); finish(); } };
      timer = setInterval(tick, 1000); tick(); show(); }
    function grade() { const qs = st.ids.map(id => byId[id]).filter(Boolean); let score = 0, c = 0, w = 0, neg = 0; const sec = {};
      qs.forEach(q => { const a = st.ans[q.id], mk = marks(q, a), S = sec[q.sec] = sec[q.sec] || { max: 0, got: 0, c: 0, w: 0, u: 0 }; S.max += q.m; S.got += mk; score += mk;
        if (!isAnswered(q, a)) S.u++; else if (isRight(q, a)) { c++; S.c++; } else { w++; S.w++; if (mk < 0) neg += mk; } });
      return { qs, score, c, w, neg, sec, mins: Math.round(((st.done || Date.now()) - st.start) / 60000) }; }
    function result() { const g = grade(), order = Object.keys(PLAN); let filt = 'all';
      root.innerHTML = '<div class="gm-res"><h2>Your score: <b>' + g.score.toFixed(2) + '</b> / 100</h2><div class="gm-kpi"><div><span>Correct</span><b>' + g.c + '</b></div><div><span>Wrong</span><b>' + g.w + '</b></div><div><span>Not answered</span><b>' + (g.qs.length - g.c - g.w) + '</b></div><div><span>Lost to negative marking</span><b>' + Math.abs(g.neg).toFixed(2) + '</b></div><div><span>Time used</span><b>' + g.mins + ' min</b></div></div>' +
        '<table class="gm-sec"><tr><th>Section</th><th>Marks</th><th>Correct</th><th>Wrong</th><th>Not answered</th></tr>' + order.filter(s => g.sec[s]).map(s => { const S = g.sec[s]; return '<tr><td>' + esc(SECS[s]) + '</td><td><b>' + S.got.toFixed(2) + '</b> / ' + S.max + '</td><td>' + S.c + '</td><td>' + S.w + '</td><td>' + S.u + '</td></tr>'; }).join('') + '</table>' +
        '<p class="mute">Scores are for practice only. GATE converts raw marks to a normalised GATE score; this mock shows raw marks out of 100.</p>' +
        '<div class="gm-actions"><button type="button" class="prim" id="gm-new">Take a new mock</button><a href="' + esc(root.dataset.practice || '/gate/practice/') + '" class="btn-l">Practise by topic</a></div>' +
        '<h3>Review your answers</h3><div class="gp-chips" role="group" aria-label="Filter"><button type="button" data-f="all" aria-pressed="true">All</button><button type="button" data-f="wrong" aria-pressed="false">Wrong</button><button type="button" data-f="un" aria-pressed="false">Not answered</button><button type="button" data-f="right" aria-pressed="false">Correct</button></div><div id="gm-rev"></div></div>';
      const rev = () => { $('#gm-rev').innerHTML = g.qs.map((q, i) => { const a = st.ans[q.id], an = isAnswered(q, a), ok = an && isRight(q, a), k = !an ? 'un' : ok ? 'right' : 'wrong'; if (filt !== 'all' && filt !== k) return '';
        const mk = marks(q, a); return '<details class="gm-item ' + k + '"><summary><span class="n">Q' + (i + 1) + '</span><span class="tag">' + esc(SECS[q.sec]) + ' · ' + q.t + ' · ' + q.m + 'M</span><span class="r">' + (k === 'un' ? 'Not answered' : ok ? '+' + q.m : (mk < 0 ? mk.toFixed(2) : '0')) + '</span></summary>' + qHTML(q, a, 'r-' + q.id, true) + '<div class="gq-sol ' + (ok ? 'right' : k === 'wrong' ? 'wrong' : '') + '"><p><b>Your answer:</b> ' + esc(ansText(q, a)) + ' &nbsp; <b>Correct answer:</b> ' + keyText(q) + '</p><div>' + q.s + '</div>' + (window.GATE_ANIM ? GATE_ANIM.figureFor(q) : '') + '</div></details>'; }).join('') || '<p class="mute">Nothing in this group.</p>'; };
      $$('.gm-res .gp-chips button').forEach(b => b.onclick = () => { filt = b.dataset.f; $$('.gm-res .gp-chips button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); rev(); }); rev();
      $('#gm-new').onclick = () => { st = null; store.set(KEY, null); intro(); window.scrollTo({ top: root.offsetTop - 80 }); }; }
  }

  if (MODE === 'practice') practice(); else if (MODE === 'mock') mock();
  window.__gate = { evaluate, isRight, marks, draw, PLAN };
})();
