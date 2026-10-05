/* PharmaChemE plant guide: a character fixed at the bottom right with a chat that recommends
   tools, equipment guides and interview questions. Minimise to a small round button.
   Recommendations come from keyword matching over assets/data/guide-index.json (no AI, no server). */
(function () {
  if (window.__pceGuide) return; window.__pceGuide = true;
  var CS = document.currentScript;
  var IMG = (CS && CS.getAttribute('data-img')) || '/assets/img/guide.webp';
  var FACE = (CS && CS.getAttribute('data-face')) || '/assets/img/guide-face.webp';
  var IDX_URL = (CS && CS.getAttribute('data-index')) || '/assets/data/guide-index.json';
  var BASE = (CS && CS.getAttribute('data-base')) || '';
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'pce-guide-min';
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function track(n, p) { try { if (window.gtag) gtag('event', n, p || {}); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = '' +
    '.pg{position:fixed;right:0;bottom:0;z-index:150;font-family:"IBM Plex Sans",system-ui,sans-serif;color:#0B1622}' +
    '.pg-char{all:unset;display:block;position:fixed;right:10px;bottom:0;width:118px;height:186px;cursor:pointer}' +
    '.pg-char img{display:block;width:100%;height:100%;object-fit:contain;object-position:bottom;transform-origin:50% 100%;filter:drop-shadow(0 6px 12px rgba(0,0,0,.5))}' +
    '.pg-char:hover img{transform:translateY(-3px)}' +
    '.pg-char:focus-visible{outline:2px solid #C9A227;outline-offset:2px;border-radius:8px}' +
    '.pg.idle .pg-char img{animation:pgBreathe 3.2s ease-in-out infinite}' +
    '@keyframes pgBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.012,1.018)}}' +
    '.pg-tools{position:fixed;right:118px;bottom:150px;display:flex;flex-direction:column;gap:6px}' +
    '.pg-ic{all:unset;box-sizing:border-box;width:32px;height:32px;border-radius:50%;background:#122234;border:1px solid #2C4C6C;color:#ECE7D8;display:grid;place-items:center;font:600 16px/1 "IBM Plex Sans",sans-serif;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.35)}' +
    '.pg-ic:hover{border-color:#C9A227;color:#C9A227}.pg-ic:focus-visible{outline:2px solid #C9A227;outline-offset:2px}' +
    '.pg-hi{position:fixed;right:136px;bottom:96px;max-width:230px;background:#ECE7D8;border-radius:12px 12px 2px 12px;padding:10px 12px;font:500 13.5px/1.45 "IBM Plex Sans",sans-serif;box-shadow:0 8px 20px rgba(0,0,0,.4);opacity:0;transform:translateY(6px);transition:opacity .25s,transform .25s;pointer-events:none}' +
    '.pg-hi.on{opacity:1;transform:none;pointer-events:auto}' +
    '.pg-hi button{all:unset;display:inline-block;margin-top:6px;font-weight:700;text-decoration:underline;text-underline-offset:3px;cursor:pointer}' +
    '.pg-chat{position:fixed;right:136px;bottom:16px;width:340px;max-height:min(520px,calc(100vh - 100px));display:none;flex-direction:column;background:#0E1B29;color:#ECE7D8;border:1px solid #2C4C6C;border-radius:12px;box-shadow:0 18px 40px rgba(0,0,0,.55);overflow:hidden}' +
    '.pg.open .pg-chat{display:flex}.pg.open .pg-hi,.pg.open .pg-tools{display:none}' +
    '.pg-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#122234;border-bottom:1px solid #1D3752}' +
    '.pg-head img{width:34px;height:34px;border-radius:50%;object-fit:cover}' +
    '.pg-head b{display:block;font:800 1.1rem/1 "Big Shoulders Display","Arial Narrow",sans-serif;letter-spacing:.02em}' +
    '.pg-head small{color:#8DA4BA;font-size:.74rem}' +
    '.pg-head .pg-ic{margin-left:auto;width:28px;height:28px;font-size:15px}.pg-head .pg-ic + .pg-ic{margin-left:4px}' +
    '.pg-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:180px}' +
    '.pg-m{max-width:88%;padding:8px 11px;border-radius:12px;font-size:.88rem;line-height:1.45}' +
    '.pg-bot{background:#16283C;align-self:flex-start;border-bottom-left-radius:3px}' +
    '.pg-you{background:#C9A227;color:#0B1622;align-self:flex-end;border-bottom-right-radius:3px}' +
    '.pg-recs{display:grid;gap:6px;align-self:stretch}' +
    '.pg-rec{display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:8px 10px;border:1px solid #2C4C6C;border-radius:8px;color:#ECE7D8;text-decoration:none;background:#0B1622}' +
    '.pg-rec:hover{border-color:#C9A227}.pg-rec b{font-weight:600;font-size:.87rem}.pg-rec span{font-size:.7rem;color:#8DA4BA;align-self:center}.pg-rec i{grid-column:1/-1;font-style:normal;font-size:.78rem;color:#8DA4BA}' +
    '.pg-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 10px}' +
    '.pg-chip{all:unset;font-size:.78rem;padding:5px 10px;border:1px solid #2C4C6C;border-radius:999px;cursor:pointer;color:#C9D6E2}' +
    '.pg-chip:hover{border-color:#C9A227;color:#C9A227}.pg-chip:focus-visible{outline:2px solid #C9A227}' +
    '.pg-form{display:flex;gap:6px;padding:10px 12px;border-top:1px solid #1D3752;background:#0B1622}' +
    '.pg-form input{flex:1;min-width:0;font:500 16px "IBM Plex Sans",sans-serif;color:#ECE7D8;background:#122234;border:1px solid #2C4C6C;border-radius:8px;padding:9px 10px}' +
    '.pg-form input:focus{outline:none;border-color:#C9A227}' +
    '.pg-form button{all:unset;font:700 .85rem "IBM Plex Sans",sans-serif;background:#C9A227;color:#0B1622;border-radius:8px;padding:0 14px;cursor:pointer}' +
    '.pg-form button:focus-visible{outline:2px solid #ECE7D8}' +
    '.pg-note{padding:0 12px 8px;font-size:.68rem;color:#6E8CA8}' +
    '.pg-mini{all:unset;position:fixed;right:16px;bottom:16px;width:58px;height:58px;border-radius:50%;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.5);border:2px solid #C9A227;overflow:hidden;display:none;background:#122234}' +
    '.pg-mini img{width:100%;height:100%;object-fit:cover}.pg-mini:focus-visible{outline:2px solid #ECE7D8;outline-offset:2px}' +
    '.pg-mini::after{content:"";position:absolute;right:2px;top:2px;width:11px;height:11px;border-radius:50%;background:#5FBF8A;border:2px solid #0B1622}' +
    '.pg.min .pg-char,.pg.min .pg-tools,.pg.min .pg-hi,.pg.min .pg-chat{display:none}.pg.min .pg-mini{display:block}' +
    '@media (max-width:600px){.pg-char{width:74px;height:117px;right:4px}.pg-tools{right:26px;bottom:122px}.pg-hi{right:84px;bottom:60px;max-width:190px;font-size:12.5px}' +
    '.pg-chat{right:8px;left:8px;width:auto;bottom:126px;max-height:calc(100vh - 150px)}.pg-mini{width:50px;height:50px;right:12px;bottom:12px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var root = document.createElement('div'); root.className = 'pg idle'; root.setAttribute('role', 'complementary'); root.setAttribute('aria-label', 'Plant guide');
  root.innerHTML =
    '<div class="pg-hi" aria-live="polite">Hi! Tell me what you are working on and I will point you to the right tool.<br><button type="button" class="pg-open">Ask me</button></div>' +
    '<div class="pg-tools"><button type="button" class="pg-ic pg-min" aria-label="Minimise the guide" title="Minimise">\u2013</button></div>' +
    '<button type="button" class="pg-char" aria-label="Open the plant guide chat" aria-expanded="false"><img src="' + IMG + '" alt="" width="210" height="331"></button>' +
    '<section class="pg-chat" aria-label="Plant guide chat">' +
      '<div class="pg-head"><img src="' + FACE + '" alt=""><div><b>Plant guide</b><small>Finds the right tool for you</small></div>' +
      '<button type="button" class="pg-ic pg-close" aria-label="Close the chat" title="Close">\u00d7</button><button type="button" class="pg-ic pg-min" aria-label="Minimise the guide" title="Minimise">\u2013</button></div>' +
      '<div class="pg-log" aria-live="polite"></div>' +
      '<div class="pg-chips"></div>' +
      '<form class="pg-form"><label for="pg-in" style="position:absolute;left:-9999px">Ask the plant guide</label><input id="pg-in" type="text" autocomplete="off" placeholder="e.g. boiling point under vacuum"><button type="submit">Send</button></form>' +
      '<p class="pg-note">Suggestions come from the tools on this site. Always check results with your own engineering judgement.</p>' +
    '</section>' +
    '<button type="button" class="pg-mini" aria-label="Open the plant guide"><img src="' + FACE + '" alt=""></button>';
  document.body.appendChild(root);
  var $ = function (s) { return root.querySelector(s); };
  var log = $('.pg-log'), chips = $('.pg-chips'), input = $('#pg-in'), charBtn = $('.pg-char');

  /* ---------- recommendation engine ---------- */
  var IDX = null, loading = null;
  function load() {
    if (IDX) return Promise.resolve(IDX);
    if (window.PCE_GUIDE_INDEX) { IDX = window.PCE_GUIDE_INDEX; return Promise.resolve(IDX); }
    if (!loading) loading = fetch(IDX_URL).then(function (r) { return r.json(); }).then(function (j) { IDX = j; return j; }).catch(function () { IDX = []; return IDX; });
    return loading;
  }
  var STOP = { a: 1, an: 1, the: 1, i: 1, me: 1, my: 1, to: 1, of: 1, for: 1, in: 1, on: 1, and: 1, or: 1, is: 1, are: 1, how: 1, what: 1, do: 1, does: 1, can: 1, want: 1, need: 1, help: 1, with: 1, about: 1, please: 1, find: 1, show: 1, tool: 1, tools: 1, should: 1, which: 1, it: 1, this: 1, that: 1, be: 1, at: 1, from: 1, get: 1, some: 1, any: 1 };
  var ALIAS = { calc: 'calculator', calculate: 'calculator', calculation: 'calculator', moc: 'material', filtration: 'filter', filtering: 'filter', drying: 'dryer', dry: 'dryer', distil: 'distillation', distill: 'distillation', evaporation: 'evaporator', mixing: 'mix', agitation: 'agitator', stirrer: 'agitator', impeller: 'agitator', rpm: 'agitator', exotherm: 'runaway', exothermic: 'runaway', interview: 'interview', fresher: 'interview', job: 'interview', vacuum: 'vacuum', boiling: 'boiling', bp: 'boiling', hp: 'power', kw: 'power', temperature: 'temperature', temp: 'temperature' };
  function stem(w) { w = ALIAS[w] || w; if (w.length > 4 && /s$/.test(w) && !/ss$/.test(w)) w = w.slice(0, -1); return w; }
  function words(s) { return String(s).toLowerCase().replace(/[^a-z0-9/ ]+/g, ' ').split(/\s+/).filter(function (w) { return w && !STOP[w]; }).map(stem); }
  var TYPE_BONUS = { Calculator: 1.2, Section: .8, Tool: 1, Lesson: .7, Equipment: .5, Instrument: .5, Agitator: .4, Game: .4, Article: .5, Lab: .4, Quiz: .3, '3D tour': .3, Practice: .4, Video: .2, Interview: 0 };
  function recommend(q, prefer) {
    var qw = words(q); if (!qw.length) return [];
    var out = [];
    IDX.forEach(function (it) {
      if (!it._w) { it._w = words(it.t); it._x = words(it.d + ' ' + it.w); }
      var s = 0;
      qw.forEach(function (w) {
        if (it._w.indexOf(w) >= 0) s += 3; else if (it._w.some(function (x) { return x.indexOf(w) === 0 && w.length > 3; })) s += 2;
        if (it._x.indexOf(w) >= 0) s += 1.5;
      });
      if (!s) return;
      s += TYPE_BONUS[it.k] || 0;
      if (prefer === 'interview' && it.k === 'Interview') s += 2.5;
      if (prefer === 'calc' && it.k === 'Calculator') s += 2.5;
      out.push([s, it]);
    });
    out.sort(function (a, b) { return b[0] - a[0]; });
    var seenK = {}, res = [];
    for (var i = 0; i < out.length && res.length < 4; i++) {
      var it = out[i][1]; if (it.k === 'Interview' && (seenK.Interview || 0) >= 2 && prefer !== 'interview') continue;
      seenK[it.k] = (seenK[it.k] || 0) + 1; res.push(it);
    }
    return res;
  }

  /* ---------- conversation ---------- */
  var START = [['I need a calculator', 'calc'], ['Interview preparation', 'interview'], ['Process safety', 'safety'], ['How does equipment work?', 'equipment'], ['Something on the plant is wrong', 'fault']];
  var mode = '';
  function msg(html, who) { var d = document.createElement('div'); d.className = 'pg-m ' + (who === 'you' ? 'pg-you' : 'pg-bot'); d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function recs(list) {
    var d = document.createElement('div'); d.className = 'pg-recs';
    d.innerHTML = list.map(function (it) { return '<a class="pg-rec" href="' + BASE + it.u + '"><b>' + esc(it.t) + '</b><span>' + esc(it.k) + '</span>' + (it.d ? '<i>' + esc(it.d) + '</i>' : '') + '</a>'; }).join('');
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    d.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { track('guide_pick', { url: a.getAttribute('href') }); }); });
  }
  function setChips(list) {
    chips.innerHTML = list.map(function (c) { return '<button type="button" class="pg-chip" data-v="' + esc(c[1]) + '">' + esc(c[0]) + '</button>'; }).join('');
    chips.querySelectorAll('.pg-chip').forEach(function (b) { b.addEventListener('click', function () { chip(b.dataset.v, b.textContent); }); });
  }
  var CANNED = {
    calc: ['What do you want to calculate? Pick one or type it.', [['Boiling point under vacuum', 'q:boiling point vacuum'], ['Pump power', 'q:pump power'], ['Agitator scale-up', 'q:mixing scale up'], ['Filtration time', 'q:filtration cake resistance'], ['Heat load', 'q:heat load jacket']]],
    interview: ['Good luck! Start with the Top 50, or tell me a topic and I will find the questions.', [['Top 50 questions', 'u:/process-engineering-faq/#top50'], ['Distillation', 'q:distillation interview'], ['Heat transfer', 'q:heat transfer lmtd interview'], ['Pumps', 'q:pump interview'], ['Safety', 'q:safety interview']]],
    safety: ['Safety first. What are you looking at?', [['Runaway reaction', 'q:runaway reaction cooling'], ['Relief sizing', 'q:relief vent sizing'], ['Flash point of solvents', 'q:flash point flammable'], ['Incident case studies', 'u:/process-safety/#cases']]],
    equipment: ['Which equipment? Type its name, for example "centrifuge" or "ANFD".', [['Reactor', 'q:batch reactor'], ['Centrifuge', 'q:centrifuge'], ['Dryers', 'q:dryer'], ['Vacuum pump', 'q:vacuum pump'], ['Instruments', 'u:/equipment-instruments/#instrumentation']]],
    fault: ['Tell me the symptom, for example "vacuum not reaching" or "filtration slow".', [['Vacuum not reaching', 'q:vacuum system fail'], ['Filtration slow', 'q:filtration slow fines'], ['Temperature rising', 'q:temperature excursion runaway'], ['Pump not delivering', 'q:pump not delivering'], ['Try the Troubleshooter game', 'u:/games/troubleshooter/']]]
  };
  function chip(v, label) {
    msg(esc(label), 'you');
    if (v.indexOf('u:') === 0) { location.href = BASE + v.slice(2); return; }
    if (v.indexOf('q:') === 0) { answer(v.slice(2)); return; }
    mode = v; var c = CANNED[v]; msg(c[0]); setChips(c[1]); track('guide_topic', { topic: v });
  }
  function answer(q) {
    load().then(function () {
      var low = q.toLowerCase();
      if (/^(hi|hello|hey|namaste|hii+)\b/.test(low)) { msg('Hello! What are you working on today?'); setChips(START); return; }
      if (/who (made|built|runs)|about (you|this site)|founder/.test(low)) { msg('PharmaChemE is run by Ankush Chopra, a chemical engineer.'); recs([{ t: 'About PharmaChemE', u: '/about/', k: 'Page', d: '' }]); return; }
      if (/custom|build (a|me)|automate|excel|spreadsheet/.test(low)) { recs([{ t: 'Custom tools for your plant', u: '/custom-solutions/', k: 'Service', d: 'Turn your spreadsheet calculation into a tool' }]); return; }
      var pref = /interview|question|viva|fresher/.test(low) ? 'interview' : /calculat|calculator|how much|sizing|size /.test(low) ? 'calc' : mode === 'interview' ? 'interview' : mode === 'calc' ? 'calc' : '';
      var r = recommend(q.replace(/interview|questions?|viva/gi, ' '), pref);
      if (!r.length) {
        msg('I could not find that on the site yet. Try other words, or ask for a tool to be built.');
        recs([{ t: 'Custom tools for your plant', u: '/custom-solutions/', k: 'Service', d: 'Ask for a calculator built for your process' }]);
        setChips(START);
      } else {
        msg(r.length === 1 ? 'This should help:' : 'Here is what I recommend:'); recs(r);
        setChips([['Something else', 'restart']].concat(START.slice(0, 3)));
      }
      track('guide_query', { results: r.length, top: r[0] ? r[0].u : '' });
    });
  }
  CANNED.restart = ['Sure. What else can I help with?', START];
  $('.pg-form').addEventListener('submit', function (e) { e.preventDefault(); var q = input.value.trim(); if (!q) return; input.value = ''; msg(esc(q), 'you'); answer(q); });

  /* ---------- keep the chat above the on-screen keyboard ---------- */
  var touch = window.matchMedia && matchMedia('(hover: none)').matches, chatEl = $('.pg-chat'), VV = window.visualViewport;
  function fitChat() {
    if (!VV || window.innerWidth > 600) { chatEl.style.bottom = ''; chatEl.style.maxHeight = ''; return; }
    var kb = Math.max(0, window.innerHeight - VV.height - VV.offsetTop);
    if (kb > 80) { chatEl.style.bottom = (kb + 8) + 'px'; chatEl.style.maxHeight = (VV.height - 16) + 'px'; }
    else { chatEl.style.bottom = ''; chatEl.style.maxHeight = ''; }
    log.scrollTop = log.scrollHeight;
  }
  if (VV) { VV.addEventListener('resize', fitChat); VV.addEventListener('scroll', fitChat); }
  input.addEventListener('focus', function () { setTimeout(fitChat, 300); });
  input.addEventListener('blur', function () { setTimeout(fitChat, 300); });

  /* ---------- open, close, minimise ---------- */
  var started = false;
  function open() {
    root.classList.remove('min'); root.classList.add('open'); charBtn.setAttribute('aria-expanded', 'true'); hideHi();
    if (!started) { started = true; load(); msg('Hi, I am your plant guide. What are you working on?'); setChips(START); }
    if (!touch) setTimeout(function () { input.focus({ preventScroll: true }); }, 50); fitChat(); track('guide_open');
  }
  function close() { root.classList.remove('open'); charBtn.setAttribute('aria-expanded', 'false'); charBtn.focus({ preventScroll: true }); }
  function minimise() { root.classList.remove('open'); root.classList.add('min'); store('1'); hideHi(); $('.pg-mini').focus({ preventScroll: true }); track('guide_minimise'); }
  function restore() { root.classList.remove('min'); store('0'); open(); }
  function hideHi() { $('.pg-hi').classList.remove('on'); }
  charBtn.addEventListener('click', function () { if (root.classList.contains('open')) close(); else open(); });
  $('.pg-open').addEventListener('click', open);
  $('.pg-close').addEventListener('click', close);
  root.querySelectorAll('.pg-min').forEach(function (b) { b.addEventListener('click', minimise); });
  $('.pg-mini').addEventListener('click', restore);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('open')) close(); });

  if (RM) root.classList.remove('idle');
  if (stored() === '1') root.classList.add('min');
  else setTimeout(function () { if (!root.classList.contains('open') && !root.classList.contains('min')) { $('.pg-hi').classList.add('on'); setTimeout(hideHi, 9000); } }, 1800);
})();
