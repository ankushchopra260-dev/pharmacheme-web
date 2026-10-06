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
    '.pg-ans{align-self:stretch;background:#0B1622;border:1px solid #2C4C6C;border-left:3px solid #C9A227;border-radius:8px;padding:9px 11px;font-size:.86rem;line-height:1.45}.pg-ans b{display:block;color:#ECE7D8;font-size:.92rem}.pg-ans p{margin:5px 0 6px;color:#C9D6E2}.pg-ans mark{background:rgba(201,162,39,.28);color:#ECE7D8;border-radius:2px;padding:0 1px}.pg-ans-k{font-size:.7rem;color:#C9A227;font-weight:600;margin-bottom:2px}.pg-from{display:block;font-size:.74rem;color:#6E8CA8}.pg-open{color:#C9A227;font-weight:600;text-decoration:none;font-size:.82rem}.pg-open:hover{text-decoration:underline}.pg-def{border-left-color:#5FBF8A}.pg-def .pg-ans-k{color:#5FBF8A}.pg-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 10px}' +
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
      '<div class="pg-head"><img src="' + FACE + '" alt=""><div><b>Plant guide</b><small>Ask anything about the plant</small></div>' +
      '<button type="button" class="pg-ic pg-close" aria-label="Close the chat" title="Close">\u00d7</button><button type="button" class="pg-ic pg-min" aria-label="Minimise the guide" title="Minimise">\u2013</button></div>' +
      '<div class="pg-log" aria-live="polite"></div>' +
      '<div class="pg-chips"></div>' +
      '<form class="pg-form"><label for="pg-in" style="position:absolute;left:-9999px">Ask the plant guide</label><input id="pg-in" type="text" autocomplete="off" placeholder="Ask anything, e.g. what is DSC?"><button type="submit">Send</button></form>' +
      '<p class="pg-note">Answers come from pages on this site. Always check with your own engineering judgement.</p>' +
    '</section>' +
    '<button type="button" class="pg-mini" aria-label="Open the plant guide"><img src="' + FACE + '" alt=""></button>';
  document.body.appendChild(root);
  var $ = function (s) { return root.querySelector(s); };
  var log = $('.pg-log'), chips = $('.pg-chips'), input = $('#pg-in'), charBtn = $('.pg-char');

  /* ---------- search engine: curated tool index + full-text site index + glossary ---------- */
  var IDX = null, SITE = null, loading = null;
  var SITE_URL = (CS && CS.getAttribute('data-search')) || IDX_URL.replace(/guide-index\.json$/, 'site-search.json');
  function getJ(u) { return fetch(u).then(function (r) { return r.json(); }).catch(function () { return []; }); }
  function load() {
    if (IDX && SITE) return Promise.resolve();
    if (!loading) loading = Promise.all([window.PCE_GUIDE_INDEX ? Promise.resolve(window.PCE_GUIDE_INDEX) : getJ(IDX_URL), window.PCE_SITE_INDEX ? Promise.resolve(window.PCE_SITE_INDEX) : getJ(SITE_URL)])
      .then(function (a) {
        IDX = a[0] || []; SITE = a[1] || [];
        var byU = {}; SITE.forEach(function (r) { if (!byU[r.u] || !byU[r.u].h) byU[r.u] = byU[r.u] || r; });
        IDX.forEach(function (it) { var r = byU[it.u]; if (r) { r.w = (r.w || '') + ' ' + (it.w || '') + ' ' + it.t; r.cur = 1; } else SITE.push({ t: it.t, u: it.u, k: it.k, s: it.d || '', x: '', w: it.w || '', cur: 1 }); });
        prep(); });
    return loading;
  }
  /* quick definitions: answer "what is X" straight away, and widen the search to the long name */
  var GL = {
    dsc: ['DSC', 'Differential scanning calorimetry', 'A few mg of sample is heated next to an empty reference; the difference in heat flow shows melting and exotherms, their onset temperature and energy (J/g). It is the first thermal-safety screen.', 'differential scanning calorimetry thermogram'],
    arc: ['ARC', 'Accelerating rate calorimeter', 'An adiabatic test (heat, wait, search). Once the sample self-heats, the heaters follow it so no heat is lost, giving the self-heat rate, pressure, TMRad and kinetics close to a large vessel.', 'accelerating rate calorimeter adiabatic'],
    tsu: ['TSU', 'Thermal screening unit', 'A closed ~8 mL test cell heated in a ramp with a pressure transducer. It shows the exotherm onset and how much gas the sample makes, which DSC cannot.', 'thermal screening unit pressure gas'],
    rc1: ['RC1', 'Reaction calorimeter', 'A jacketed lab reactor run like the plant process. The heat balance gives the heat release rate as you dose, total reaction heat, cp and accumulation.', 'reaction calorimeter calorimetry accumulation'],
    rc: ['RC', 'Reaction calorimetry', 'Measuring the heat of the wanted reaction while you run it in a lab reactor (for example RC1): heat release rate, accumulation and adiabatic temperature rise.', 'reaction calorimetry calorimeter accumulation'],
    tmrad: ['TMRad', 'Time to maximum rate (adiabatic)', 'How long a batch that has lost all cooling takes to reach its maximum runaway rate. It falls roughly by half every ~10 °C hotter.', 'time to maximum rate tmr td24'],
    tmr: ['TMR', 'Time to maximum rate', 'Usually TMRad: the time from a given temperature to the peak of a runaway under adiabatic conditions.', 'time to maximum rate tmrad td24'],
    td24: ['TD24', 'Temperature with TMRad of 24 h', 'The start temperature at which a runaway would reach maximum rate in 24 hours. Keep the MTSR below it.', 'td24 tmrad time to maximum rate'],
    mtsr: ['MTSR', 'Maximum temperature of the synthesis reaction', 'The highest temperature the batch could reach if cooling failed and all accumulated reagent reacted: process temperature plus accumulation × ΔTad.', 'maximum temperature synthesis reaction accumulation stoessel'],
    mtt: ['MTT', 'Maximum technical temperature', 'Usually the boiling point of the mixture in an open system, or the pressure-relief set temperature in a closed one. Used in Stoessel classes.', 'maximum technical temperature stoessel'],
    adiabatic: ['ΔTad', 'Adiabatic temperature rise', 'How hot the batch would get if all the reaction heat stayed in it: ΔTad = Q′ / c′p. Above about 200 K is high severity.', 'adiabatic temperature rise severity'],
    hazop: ['HAZOP', 'Hazard and operability study', 'A team review of each part of the P&ID using guide words (no, more, less, reverse…) to find deviations, their causes, consequences and safeguards.', 'hazop hazard operability guide words'],
    lopa: ['LOPA', 'Layer of protection analysis', 'A semi-quantitative check of whether the independent protection layers reduce a scenario risk enough.', 'layer of protection analysis'],
    psv: ['PSV', 'Pressure safety valve', 'A spring-loaded valve that opens at its set pressure to protect a vessel from overpressure.', 'pressure safety relief valve'],
    prv: ['PRV', 'Pressure relief valve', 'A valve that relieves pressure above a set point; on a plant often the same thing as a PSV.', 'pressure relief valve psv'],
    npsh: ['NPSH', 'Net positive suction head', 'The margin of pressure above vapour pressure at the pump suction. NPSH available must exceed NPSH required or the pump cavitates.', 'net positive suction head cavitation pump'],
    lmtd: ['LMTD', 'Log mean temperature difference', 'The average driving force in a heat exchanger: Q = U × A × LMTD.', 'log mean temperature difference heat exchanger'],
    vfd: ['VFD', 'Variable frequency drive', 'Changes motor speed by changing supply frequency. On pumps and fans power falls with the cube of speed.', 'variable frequency drive speed motor'],
    anfd: ['ANFD', 'Agitated Nutsche filter dryer', 'A closed vessel that filters, washes and dries the cake in one place, with an agitator that smooths and turns the cake.', 'agitated nutsche filter dryer'],
    atfd: ['ATFD', 'Agitated thin film dryer', 'A heated tube with wiper blades that spreads a thin film to evaporate or dry; used for effluent and heat-sensitive products.', 'agitated thin film dryer evaporator'],
    mee: ['MEE', 'Multiple effect evaporator', 'Evaporators in series where vapour from one effect heats the next, saving steam. Common in effluent treatment.', 'multiple effect evaporator'],
    etp: ['ETP', 'Effluent treatment plant', 'Treats plant wastewater before discharge or reuse: equalisation, neutralisation, biological treatment, clarification and more.', 'effluent treatment plant wastewater'],
    cstr: ['CSTR', 'Continuous stirred-tank reactor', 'A well-mixed vessel with feed in and product out continuously; the contents are at outlet composition.', 'continuous stirred tank reactor residence'],
    pfr: ['PFR', 'Plug flow reactor', 'A tube reactor where every element of fluid spends the same time reacting, like a batch moving along a pipe.', 'plug flow reactor tube'],
    moc: ['MOC', 'Material of construction', 'The material chosen for equipment, piping or gaskets so that it resists the process chemicals at temperature.', 'material of construction compatibility corrosion'],
    pid: ['PID', 'Proportional-integral-derivative control', 'The standard feedback controller. P reacts to the error, I removes offset, D reacts to how fast the error changes.', 'pid controller tuning'],
    'p&id': ['P&ID', 'Piping and instrumentation diagram', 'The drawing that shows every line, valve, instrument and control loop of a process.', 'piping instrumentation diagram'],
    rtd: ['RTD', 'Resistance temperature detector', 'A sensor (usually Pt100) whose resistance rises with temperature; more accurate than a thermocouple below ~400 °C.', 'resistance temperature detector pt100'],
    lel: ['LEL', 'Lower explosive limit', 'The lowest vapour concentration in air that can ignite. Below it the mixture is too lean.', 'lower explosive flammable limit'],
    uel: ['UEL', 'Upper explosive limit', 'The highest vapour concentration in air that can ignite. Above it the mixture is too rich.', 'upper explosive flammable limit'],
    mie: ['MIE', 'Minimum ignition energy', 'The smallest spark energy that can ignite a vapour or dust cloud. Low MIE means static can ignite it.', 'minimum ignition energy static'],
    loto: ['LOTO', 'Lock-out tag-out', 'Isolating and locking energy sources (electrical, steam, pressure) before maintenance, with a tag naming who isolated it.', 'lock out tag out isolation permit'],
    ptw: ['PTW', 'Permit to work', 'The written system that authorises non-routine or hazardous work after hazards are checked and controls are in place.', 'permit to work hot work'],
    sop: ['SOP', 'Standard operating procedure', 'The step-by-step written instructions for running an operation the same safe way every time.', 'standard operating procedure'],
    lod: ['LOD', 'Loss on drying', 'The weight lost when a sample is dried: a quick measure of moisture or solvent left in a product.', 'loss on drying moisture'],
    kla: ['kLa', 'Volumetric mass-transfer coefficient', 'How fast gas dissolves into liquid per unit volume. Raised by agitation and gas sparging; it limits hydrogenations and oxidations.', 'mass transfer coefficient gas liquid'],
    cop: ['COP', 'Coefficient of performance', 'Cooling delivered per unit of power for a chiller or heat pump. Falls in hot weather.', 'coefficient of performance chiller'],
    tds: ['TDS', 'Total dissolved solids', 'Salts and other dissolved material in water, usually in mg/L. High-TDS effluent often goes to MEE.', 'total dissolved solids water'],
    cod: ['COD', 'Chemical oxygen demand', 'Oxygen needed to oxidise the organics in water; the main load figure for an ETP.', 'chemical oxygen demand effluent'],
    bod: ['BOD', 'Biochemical oxygen demand', 'Oxygen used by bacteria to break down organics in water over 5 days; shows the biodegradable load.', 'biochemical oxygen demand effluent'],
    stoessel: ['Stoessel classes', 'Criticality classes 1 to 5', 'Ranks a process by comparing four temperatures: process temperature, MTSR, MTT and TD24. Class 1 is safe; 5 is the worst.', 'stoessel criticality class mtsr td24'],
    reynolds: ['Re', 'Reynolds number', 'Ratio of inertia to viscous forces: Re = ρvD/μ. Below ~2300 flow is laminar, above ~4000 turbulent.', 'reynolds number laminar turbulent'],
    gmp: ['GMP', 'Good manufacturing practice', 'The quality rules for making pharmaceuticals: documented, controlled and consistent processes.', 'good manufacturing practice']
  };
  var GLA = { 'differential scanning calorimetry': 'dsc', 'accelerating rate calorimeter': 'arc', 'accelerating rate calorimetry': 'arc', 'thermal screening unit': 'tsu', 'reaction calorimetry': 'rc', 'reaction calorimeter': 'rc1', 'time to maximum rate': 'tmrad', 'adiabatic temperature rise': 'adiabatic', 'delta t ad': 'adiabatic', 'dtad': 'adiabatic', 'net positive suction head': 'npsh', 'variable frequency drive': 'vfd', 'lock out tag out': 'loto', 'permit to work': 'ptw', 'plug flow': 'pfr', 'material of construction': 'moc', 'stoessel class': 'stoessel', 'criticality class': 'stoessel', 're number': 'reynolds', 'reynolds number': 'reynolds', 'p and id': 'p&id', 'pid diagram': 'p&id', 'filter dryer': 'anfd', 'thin film dryer': 'atfd' };
  var STOP = { a: 1, an: 1, the: 1, i: 1, me: 1, my: 1, to: 1, of: 1, for: 1, in: 1, on: 1, and: 1, or: 1, is: 1, are: 1, how: 1, what: 1, whats: 1, do: 1, does: 1, can: 1, want: 1, need: 1, help: 1, with: 1, about: 1, please: 1, find: 1, show: 1, should: 1, which: 1, it: 1, this: 1, that: 1, be: 1, at: 1, from: 1, get: 1, some: 1, any: 1, tell: 1, explain: 1, mean: 1, meaning: 1, define: 1, definition: 1, why: 1, when: 1, where: 1, we: 1, you: 1, your: 1, use: 1, used: 1, will: 1, by: 1, as: 1, its: 1, was: 1, there: 1, than: 1, then: 1, so: 1, if: 1, not: 1, no: 1, has: 1, have: 1, also: 1, more: 1, all: 1, one: 1, two: 1 };
  var ALIAS = { calc: 'calculator', calculate: 'calculator', calculation: 'calculator', calculations: 'calculator', filtration: 'filter', filtering: 'filter', drying: 'dryer', dry: 'dryer', drier: 'dryer', distil: 'distillation', distill: 'distillation', evaporation: 'evaporator', mixing: 'mix', agitation: 'agitator', stirrer: 'agitator', exothermic: 'exotherm', calorimetry: 'calorimeter', boiling: 'boil', bp: 'boil', temp: 'temperature', centrifugation: 'centrifuge', crystallisation: 'crystallization', crystallise: 'crystallization', crystallize: 'crystallization', vaccum: 'vacuum', vacum: 'vacuum', presure: 'pressure', cavitating: 'cavitation', runaways: 'runaway' };
  function stem(w) { w = ALIAS[w] || w; if (w.length > 4 && /ies$/.test(w)) w = w.slice(0, -3) + 'y'; else if (w.length > 4 && /s$/.test(w) && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1); return w; }
  function words(s) { return String(s).toLowerCase().replace(/[’']/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9δ ]+/g, ' ').split(/\s+/).filter(function (w) { return w && w.length > 1 && !STOP[w]; }).map(stem); }
  var DF = {}, N = 0, VOCAB = {};
  function prep() {
    N = SITE.length;
    SITE.forEach(function (r) {
      r._t = words(r.t); r._s = words(r.s + ' ' + r.w); r._x = words(r.x);
      var seen = {};
      r._t.concat(r._s, r._x).forEach(function (w) { if (!seen[w]) { seen[w] = 1; DF[w] = (DF[w] || 0) + 1; } });
      r._t.forEach(function (w) { VOCAB[w] = (VOCAB[w] || 0) + 3; }); r._s.forEach(function (w) { VOCAB[w] = (VOCAB[w] || 0) + 1; });
    });
    Object.keys(GL).forEach(function (k) { VOCAB[k.replace(/[^a-z0-9]/g, '')] = 50; });
  }
  function idf(w) { var d = DF[w] || 0; return Math.log(1 + (N - d + .5) / (d + .5)); }
  function count(arr, w) { var c = 0; for (var i = 0; i < arr.length; i++) if (arr[i] === w) c++; return c; }
  function prefixHit(arr, w) { if (w.length < 4) return 0; for (var i = 0; i < arr.length; i++) if (arr[i].length > w.length && arr[i].indexOf(w) === 0) return 1; return 0; }
  function glossFor(q) {
    var low = ' ' + q.toLowerCase().replace(/[^a-z0-9& ]+/g, ' ').replace(/\s+/g, ' ') + ' ';
    var hits = [];
    Object.keys(GLA).forEach(function (k) { if (low.indexOf(' ' + k + ' ') >= 0 && hits.indexOf(GLA[k]) < 0) hits.push(GLA[k]); });
    low.split(' ').forEach(function (w) { if (GL[w] && hits.indexOf(w) < 0) hits.push(w); });
    return hits;
  }
  var TYPE_BONUS = { Calculator: .6, Section: .3, Tool: .5, Lesson: .4, 'Process safety': .25, Equipment: .3, Instrument: .25, Agitator: .2, Game: .2, Article: .3, Interview: 0, Page: 0, Videos: -.3, Animation: -.2 };
  function search(q, prefer) {
    var g = glossFor(q), qw = words(q), extra = [];
    g.forEach(function (k) { words(GL[k][1] + ' ' + GL[k][3]).forEach(function (w) { if (qw.indexOf(w) < 0 && extra.indexOf(w) < 0) extra.push(w); }); });
    if (!qw.length && !extra.length) return [];
    var res = [];
    SITE.forEach(function (r) {
      var s = 0, hit = 0;
      qw.forEach(function (w) {
        var t = count(r._t, w), m = count(r._s, w), x = count(r._x, w), p = 0;
        if (!t && !m && !x) { p = prefixHit(r._t, w) * 2 + prefixHit(r._s, w); if (!p) return; }
        hit++;
        var tf = t * 4 + m * 2 + Math.min(x, 6) * .6 + p * .8;
        s += idf(w) * (tf * 2.2) / (tf + 1.2);
      });
      extra.forEach(function (w) { var tf = count(r._t, w) * 2 + count(r._s, w) + Math.min(count(r._x, w), 4) * .3; if (tf) s += .35 * idf(w) * tf / (tf + 1.2); });
      if (!s) return;
      if (qw.length > 1) s *= .55 + .45 * hit / qw.length;
      var inT = qw.filter(function (w) { return r._t.indexOf(w) >= 0; }).length; if (inT && r._t.length) s += 2 * inT / r._t.length;
      s += TYPE_BONUS[r.k] || 0;
      if (prefer === 'interview' && r.k === 'Interview') s += 2.5;
      if (prefer === 'calc' && (r.k === 'Calculator' || r.k === 'Tool')) s += 2.5;
      if (r.cur) s += .3;
      res.push([s, r]);
    });
    res.sort(function (a, b) { return b[0] - a[0]; });
    /* spread results across pages: at most 2 from one page, at most 3 interview questions */
    var perPage = {}, kinds = {}, out = [];
    for (var i = 0; i < res.length && out.length < 6; i++) {
      var r = res[i][1], pg = r.u.split('#')[0]; if (out.some(function (o) { return o.u === r.u || o.t.toLowerCase() === r.t.toLowerCase(); })) continue;
      if ((perPage[pg] || 0) >= 2 && r.k !== 'Interview') continue;
      if (r.k === 'Interview' && (kinds.Interview || 0) >= 3 && prefer !== 'interview') continue;
      perPage[pg] = (perPage[pg] || 0) + 1; kinds[r.k] = (kinds[r.k] || 0) + 1; r._score = res[i][0]; out.push(r);
    }
    return out;
  }
  function suggest(q) { /* did-you-mean from the site's own words */
    var out = [];
    String(q).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).forEach(function (w) {
      if (w.length < 3 || STOP[w] || VOCAB[stem(w)]) return;
      var best = null, bd = 3;
      Object.keys(VOCAB).forEach(function (v) { if (Math.abs(v.length - w.length) > 2) return; var d = lev(w, v); if (d < bd || (d === bd && best && VOCAB[v] > VOCAB[best])) { bd = d; best = v; } });
      if (best && bd <= (w.length > 6 ? 2 : 1)) out.push([w, best]);
    });
    return out;
  }
  function lev(a, b) { var m = [], i, j; for (i = 0; i <= b.length; i++) m[i] = [i]; for (j = 0; j <= a.length; j++) m[0][j] = j;
    for (i = 1; i <= b.length; i++) for (j = 1; j <= a.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (b[i - 1] === a[j - 1] ? 0 : 1)); return m[b.length][a.length]; }
  function snippet(r, q) { /* the sentence(s) that best match the question */
    var text = r.x || r.s || ''; if (!text) return '';
    var qw = words(q).concat([].concat.apply([], glossFor(q).map(function (k) { return words(GL[k][1]); })));
    var sents = text.match(/[^.!?]+[.!?]+/g) || [text], best = '', bs = -1;
    for (var i = 0; i < sents.length && i < 40; i++) {
      var sw = words(sents[i]), sc = 0; qw.forEach(function (w) { if (sw.indexOf(w) >= 0) sc++; });
      if (sc > bs) { bs = sc; best = sents[i] + (sents[i + 1] && (sents[i] + sents[i + 1]).length < 260 ? sents[i + 1] : ''); }
    }
    best = best.trim(); if (best.length > 280) best = best.slice(0, 277).replace(/\s\S*$/, '') + '…';
    return mark(esc(best), qw);
  }
  function mark(h, qw) {
    qw.filter(function (w) { return w.length > 2; }).forEach(function (w) { h = h.replace(new RegExp('\\b(' + w.replace(/[^a-z0-9]/g, '') + '[a-z]*)', 'gi'), '<mark>$1</mark>'); });
    return h;
  }
  function link(r) {
    if (r.u.indexOf('#') < 0 && r.s && r.t && r.k !== 'Interview' && !r.cur && r.x && r.s.length < 120 && !/^Animation:/.test(r.t) && r.h) return BASE + r.u + '#:~:text=' + encodeURIComponent(r.t);
    return BASE + r.u;
  }

  /* ---------- conversation ---------- */
  var START = [['I need a calculator', 'calc'], ['Interview preparation', 'interview'], ['Process safety', 'safety'], ['How does equipment work?', 'equipment'], ['Something on the plant is wrong', 'fault']];
  var mode = '', lastQ = '';
  function msg(html, who) { var d = document.createElement('div'); d.className = 'pg-m ' + (who === 'you' ? 'pg-you' : 'pg-bot'); d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function recs(list) {
    var d = document.createElement('div'); d.className = 'pg-recs';
    d.innerHTML = list.map(function (it) { return '<a class="pg-rec" href="' + (it.href || BASE + it.u) + '"><b>' + esc(it.t) + '</b><span>' + esc(it.k) + '</span>' + (it.d ? '<i>' + esc(it.d) + '</i>' : '') + '</a>'; }).join('');
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    d.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { track('guide_pick', { url: a.getAttribute('href') }); }); });
  }
  function answerCard(r, q) {
    var d = document.createElement('div'); d.className = 'pg-ans';
    var page = r.s && r.k !== 'Interview' && r.s.length < 90 && r.s !== r.t ? '<span class="pg-from">' + esc(r.s) + '</span>' : '';
    d.innerHTML = '<div class="pg-ans-k">' + esc(r.k) + '</div><b>' + esc(r.t.replace(/^Animation: /, '')) + '</b>' + page +
      '<p>' + (snippet(r, q) || esc(r.s)) + '</p><a class="pg-open" href="' + link(r) + '">' + (r.k === 'Interview' ? 'Read the full answer' : r.k === 'Animation' ? 'Watch the animation' : r.k === 'Calculator' || r.k === 'Tool' ? 'Open the calculator' : 'Open this') + ' →</a>';
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    d.querySelector('a').addEventListener('click', function () { track('guide_pick', { url: r.u, from: 'answer' }); });
  }
  function glossCard(k) {
    var g = GL[k], d = document.createElement('div'); d.className = 'pg-ans pg-def';
    d.innerHTML = '<div class="pg-ans-k">Quick definition</div><b>' + esc(g[0]) + (g[1] && g[1] !== g[0] ? ' · ' + esc(g[1]) : '') + '</b><p>' + esc(g[2]) + '</p>';
    log.appendChild(d); log.scrollTop = log.scrollHeight;
  }
  function setChips(list) {
    chips.innerHTML = list.map(function (c) { return '<button type="button" class="pg-chip" data-v="' + esc(c[1]) + '">' + esc(c[0]) + '</button>'; }).join('');
    chips.querySelectorAll('.pg-chip').forEach(function (b) { b.addEventListener('click', function () { chip(b.dataset.v, b.textContent); }); });
  }
  var CANNED = {
    calc: ['What do you want to calculate? Pick one or type it.', [['Boiling point under vacuum', 'q:boiling point vacuum calculator'], ['Pump power', 'q:pump power calculator'], ['Agitator scale-up', 'q:mixing scale up calculator'], ['Filtration time', 'q:filtration calculator'], ['Heat load', 'q:heat load calculator']]],
    interview: ['Good luck! Start with the Top 50, or type any topic and I will find the questions.', [['Top 50 questions', 'u:/process-engineering-faq/#top50'], ['Distillation', 'q:distillation interview'], ['Heat transfer', 'q:heat exchanger lmtd interview'], ['Pumps', 'q:pump cavitation interview'], ['Safety', 'q:safety interview']]],
    safety: ['Safety first. Ask me anything, for example "what is DSC" or "runaway reaction".', [['DSC, ARC, RC1 tests', 'q:dsc arc rc1 thermal testing'], ['Runaway reaction', 'q:runaway reaction cooling failure'], ['Relief sizing', 'q:relief vent sizing'], ['Flash point of solvents', 'q:flash point flammable'], ['Incident case studies', 'u:/process-safety/#cases']]],
    equipment: ['Which equipment? Type its name, for example "centrifuge", "ANFD" or "rotameter".', [['Reactor', 'q:batch reactor'], ['Centrifuge', 'q:centrifuge'], ['Dryers', 'q:dryer'], ['Vacuum pump', 'q:vacuum pump'], ['Instruments', 'u:/equipment-instruments/#instrumentation']]],
    fault: ['Tell me the symptom, for example "vacuum not reaching" or "filtration slow".', [['Vacuum not reaching', 'q:vacuum not reaching leak'], ['Filtration slow', 'q:filtration slow fines'], ['Temperature rising', 'q:temperature rising runaway'], ['Pump not delivering', 'q:pump not delivering cavitation'], ['Try the Troubleshooter game', 'u:/games/troubleshooter/']]]
  };
  function chip(v, label) {
    msg(esc(label), 'you');
    if (v.indexOf('u:') === 0) { location.href = BASE + v.slice(2); return; }
    if (v.indexOf('q:') === 0) { answer(v.slice(2)); return; }
    mode = v; var c = CANNED[v]; msg(c[0]); setChips(c[1]); track('guide_topic', { topic: v });
  }
  function followUps(q, top) {
    var out = [], seen = glossFor(q), low = q.toLowerCase();
    /* other terms the best result talks about */
    var txt = ((top && top.x) || '').toLowerCase();
    Object.keys(GL).forEach(function (k) { if (out.length < 3 && seen.indexOf(k) < 0 && k.length > 2 && new RegExp('\\b' + k.replace(/[^a-z0-9]/g, '') + '\\b').test(txt)) out.push(['What is ' + GL[k][0] + '?', 'q:what is ' + k]); });
    var topic = q.replace(/^(what|how|why)( is| are| does| do)?\s+/i, '').replace(/\?$/, '').slice(0, 40);
    if (!/interview/.test(low)) out.push(['Interview questions on this', 'q:' + topic + ' interview']);
    if (!/calculat/.test(low)) out.push(['Is there a calculator?', 'q:' + topic + ' calculator']);
    out.push(['Start over', 'restart']);
    return out.slice(0, 5);
  }
  function answer(q) {
    load().then(function () {
      var low = q.toLowerCase().trim();
      if (/^(hi+|hello|hey|namaste|good (morning|evening|afternoon))\b/.test(low)) { msg('Hello! Ask me anything about the plant, for example “what is DSC”, “pump cavitation” or “filtration slow”.'); setChips(START); return; }
      if (/^(thanks|thank you|thx|ok|okay|great|nice)\b/.test(low)) { msg('Happy to help. Anything else?'); setChips(START); return; }
      if (/who (made|built|runs)|about (you|this site)|founder/.test(low)) { msg('PharmaChemE is run by Ankush Chopra, a chemical engineer.'); recs([{ t: 'About PharmaChemE', u: '/about/', k: 'Page', d: '' }]); return; }
      if (/custom|build (a|me)|automate|excel|spreadsheet/.test(low)) { recs([{ t: 'Custom tools for your plant', u: '/custom-solutions/', k: 'Service', d: 'Turn your spreadsheet calculation into a tool' }]); return; }
      /* a short follow-up like "and ARC?" keeps the last topic's intent */
      var qq = /^(and|what about|how about)\s+/i.test(low) ? low.replace(/^(and|what about|how about)\s+/i, '') : q;
      var pref = /interview|question|viva|fresher/.test(low) ? 'interview' : /calculat|calculator|how much|sizing|size /.test(low) ? 'calc' : mode === 'interview' ? 'interview' : mode === 'calc' ? 'calc' : '';
      var g = glossFor(qq);
      var r = search(qq.replace(/\binterview\b|\bquestions?\b|\bviva\b|\bcalculators?\b/gi, ' '), pref);
      if (g.length) glossCard(g[0]);
      if (!r.length) {
        var dm = suggest(qq);
        if (dm.length) {
          var fixed = qq.toLowerCase(); dm.forEach(function (p) { fixed = fixed.replace(p[0], p[1]); });
          msg('I could not find “' + esc(qq) + '”. Did you mean <b>' + esc(fixed) + '</b>?'); setChips([['Yes, search “' + fixed + '”', 'q:' + fixed], ['Start over', 'restart']]);
        } else if (!g.length) {
          msg('I could not find that on the site. Try fewer or different words, or search the site with Google.');
          recs([{ t: 'Search pharmacheme.in with Google', href: 'https://www.google.com/search?q=' + encodeURIComponent('site:pharmacheme.in ' + qq), k: 'Google', d: qq }, { t: 'Custom tools for your plant', u: '/custom-solutions/', k: 'Service', d: 'Ask for a calculator built for your process' }]);
          setChips(START);
        }
      } else {
        if (!g.length) msg(r[0]._score > 6 ? 'Here is what the site says:' : 'This looks closest:');
        else msg('On the site:');
        answerCard(r[0], qq);
        if (r.length > 1) {
          msg('More on this:');
          recs(r.slice(1, 5).map(function (it) { return { t: it.t.replace(/^Animation: /, ''), href: link(it), k: it.k, d: it.s && it.s !== it.t && it.s.length < 90 ? it.s : '' }; }));
        }
        setChips(followUps(qq, r[0]));
      }
      lastQ = qq;
      track('guide_query', { q: qq.slice(0, 60), results: r.length, top: r[0] ? r[0].u : '', def: g[0] || '' });
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
