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
  var MINI = CS && CS.getAttribute('data-mini') === '1';
  var PAGES_URL = (CS && CS.getAttribute('data-pages')) || IDX_URL.replace(/guide-index\.json$/, 'pages-index.json');
  var FACTS_URL = (CS && CS.getAttribute('data-facts')) || IDX_URL.replace(/guide-index\.json$/, 'solvent-facts.json');
  var PATH = location.pathname.replace(/\/+$/, '/');
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
    '.pg-cmp{overflow-x:auto;margin:6px 0}.pg-cmp table{border-collapse:collapse;font-size:.76rem;width:100%}.pg-cmp th,.pg-cmp td{border-bottom:1px solid #1D3752;padding:4px 5px;text-align:left;vertical-align:top}.pg-cmp th{color:#C9A227}.pg-cmp td:first-child{color:#8DA4BA}' +
    '.pg-ans ol li{margin:2px 0;color:#C9D6E2}' +
    '.pg-mic{all:unset;width:38px;display:grid;place-items:center;border:1px solid #2C4C6C;border-radius:8px;cursor:pointer;color:#ECE7D8;font-size:16px}.pg-mic:hover{border-color:#C9A227}.pg-mic.on{background:#E0785A;border-color:#E0785A;animation:pgPulse 1s infinite}.pg-mic:focus-visible{outline:2px solid #C9A227}' +
    '@keyframes pgPulse{50%{opacity:.6}}' +
    '.pg-hi .pg-ex{all:unset;display:block;margin-top:5px;padding:4px 8px;border:1px solid #B9A46A;border-radius:999px;font-size:12.5px;font-weight:600;cursor:pointer;text-decoration:none}.pg-hi .pg-ex:hover{background:#0B1622;color:#ECE7D8}' +
    '.pg.min .pg-hi.mini{display:block;right:84px;bottom:22px;border-radius:12px 12px 2px 12px}' +
    '.pg-mini{all:unset;position:fixed;right:16px;bottom:16px;width:58px;height:58px;border-radius:50%;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.5);border:2px solid #C9A227;overflow:hidden;display:none;background:#122234}' +
    '.pg-mini img{width:100%;height:100%;object-fit:cover}.pg-mini:focus-visible{outline:2px solid #ECE7D8;outline-offset:2px}' +
    '.pg-mini::after{content:"";position:absolute;right:2px;top:2px;width:11px;height:11px;border-radius:50%;background:#5FBF8A;border:2px solid #0B1622}' +
    '.pg.min .pg-char,.pg.min .pg-tools,.pg.min .pg-hi,.pg.min .pg-chat{display:none}.pg.min .pg-mini{display:block}' +
    '@media (max-width:600px){.pg-char{width:74px;height:117px;right:4px}.pg-tools{right:26px;bottom:122px}.pg-hi{right:84px;bottom:60px;max-width:190px;font-size:12.5px}' +
    '.pg-chat{right:8px;left:8px;width:auto;bottom:126px;max-height:calc(100vh - 150px)}.pg-mini{width:50px;height:50px;right:12px;bottom:12px}.pg.min .pg-hi.mini{right:72px;bottom:14px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var root = document.createElement('div'); root.className = 'pg idle'; root.setAttribute('role', 'complementary'); root.setAttribute('aria-label', 'Plant guide');
  root.innerHTML =
    '<div class="pg-hi" aria-live="polite">Hi! Ask me anything: a solvent\u2019s flash point, a calculator, GATE prep or a plant problem.<br><button type="button" class="pg-open">Ask me</button></div>' +
    '<div class="pg-tools"><button type="button" class="pg-ic pg-min" aria-label="Minimise the guide" title="Minimise">\u2013</button></div>' +
    '<button type="button" class="pg-char" aria-label="Open the plant guide chat" aria-expanded="false"><img src="' + IMG + '" alt="" width="210" height="331"></button>' +
    '<section class="pg-chat" aria-label="Plant guide chat">' +
      '<div class="pg-head"><img src="' + FACE + '" alt=""><div><b>Plant guide</b><small>Ask anything about the plant</small></div>' +
      '<button type="button" class="pg-ic pg-close" aria-label="Close the chat" title="Close">\u00d7</button><button type="button" class="pg-ic pg-min" aria-label="Minimise the guide" title="Minimise">\u2013</button></div>' +
      '<div class="pg-log" aria-live="polite"></div>' +
      '<div class="pg-chips"></div>' +
      '<form class="pg-form"><label for="pg-in" style="position:absolute;left:-9999px">Ask the plant guide</label><input id="pg-in" type="text" autocomplete="off" placeholder="e.g. flash point of toluene">' + ((window.SpeechRecognition || window.webkitSpeechRecognition) ? '<button type="button" class="pg-mic" aria-label="Ask by voice" title="Ask by voice">\uD83C\uDFA4</button>' : '') + '<button type="submit">Send</button></form>' +
      '<p class="pg-note">Answers come from pages on this site. Always check with your own engineering judgement.</p>' +
    '</section>' +
    '<button type="button" class="pg-mini" aria-label="Open the plant guide"><img src="' + FACE + '" alt=""></button>';
  document.body.appendChild(root);
  var $ = function (s) { return root.querySelector(s); };
  var log = $('.pg-log'), chips = $('.pg-chips'), input = $('#pg-in'), charBtn = $('.pg-char');

  /* ---------- search engine: curated tool index + full-text site index + glossary ---------- */
  var IDX = null, SITE = null, FACTS = [], loading = null;
  /* steam tables (IAPWS-IF97, same file as the steam tables page) and measured azeotropes, for quick answers */
  var AZ = [], AZ_URL = IDX_URL.replace(/guide-index\.json$/, 'azeotropes.json'), IF97_URL = IDX_URL.replace(/data\/guide-index\.json$/, 'js/if97.js');
  function loadIF97() { if (window.IF97) return Promise.resolve(); return new Promise(function (res) { var sc = document.createElement('script'); sc.src = IF97_URL; sc.onload = res; sc.onerror = res; document.head.appendChild(sc); }); }
  var SITE_URL = (CS && CS.getAttribute('data-search')) || IDX_URL.replace(/guide-index\.json$/, 'site-search.json');
  function kindOf(u) { return /^\/solvents\//.test(u) ? 'Solvent data' : /^\/gate\//.test(u) ? 'GATE' : /^\/process-modelling\/.|^\/design-tools\/./.test(u) ? 'Tool' : /^\/(calculators|utilities)\/./.test(u) ? 'Calculator' : /^\/articles\/./.test(u) ? 'Article' : /^\/process-safety\/case-studies\//.test(u) ? 'Case study' : /^\/process-safety\//.test(u) ? 'Process safety' : /^\/games\//.test(u) ? 'Game' : /^\/exclusive\/./.test(u) ? 'Exclusive' : 'Page'; }
  function getJ(u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { return r.json(); }).catch(function () { return []; }); }
  function load() {
    if (IDX && SITE) return Promise.resolve();
    if (!loading) loading = Promise.all([window.PCE_GUIDE_INDEX ? Promise.resolve(window.PCE_GUIDE_INDEX) : getJ(IDX_URL), window.PCE_SITE_INDEX ? Promise.resolve(window.PCE_SITE_INDEX) : getJ(SITE_URL), getJ(FACTS_URL), getJ(PAGES_URL), getJ(AZ_URL).then(function (d) { AZ = d || []; }), loadIF97()])
      .then(function (a) {
        IDX = a[0] || []; SITE = a[1] || []; FACTS = a[2] || [];
        var known = {}; SITE.forEach(function (r) { known[r.u.split('#')[0]] = 1; });
        (a[3] || []).forEach(function (pg) { if (pg && pg.u && !known[pg.u]) SITE.push({ t: pg.t, u: pg.u, k: kindOf(pg.u), s: pg.s || '', x: pg.s || '', w: '' }); });
        var byU = {}; SITE.forEach(function (r) { if (!byU[r.u] || !byU[r.u].h) byU[r.u] = byU[r.u] || r; });
        IDX.forEach(function (it) { var r = byU[it.u]; if (r) { r.w = (r.w || '') + ' ' + (it.w || '') + ' ' + it.t; r.cur = 1; } else SITE.push({ t: it.t, u: it.u, k: it.k, s: it.d || '', x: '', w: it.w || '', cur: 1 }); });
        prep(); });
    return loading;
  }
  /* quick definitions: answer "what is X" straight away, and widen the search to the long name */
  var GL = {
    dsc: ['DSC', 'Differential scanning calorimetry', 'A few mg of sample is heated next to an empty reference; the difference in heat flow shows melting and exotherms, their onset temperature and energy (kcal/kg). It is the first thermal-safety screen.', 'differential scanning calorimetry thermogram'],
    arc: ['ARC', 'Accelerating rate calorimeter', 'An adiabatic test (heat, wait, search). Once the sample self-heats, the heaters follow it so no heat is lost, giving the self-heat rate, pressure, TMRad and kinetics close to a large vessel.', 'accelerating rate calorimeter adiabatic'],
    tsu: ['TSU', 'Thermal screening unit', 'A closed ~8 mL test cell heated in a ramp with a pressure transducer. It shows the exotherm onset and how much gas the sample makes, which DSC cannot.', 'thermal screening unit pressure gas'],
    rc1: ['RC1', 'Reaction calorimeter', 'A jacketed lab reactor run like the plant process. The heat balance gives the heat release rate as you dose, total reaction heat, cp and accumulation.', 'reaction calorimeter calorimetry accumulation'],
    rc: ['RC', 'Reaction calorimetry', 'Measuring the heat of the wanted reaction while you run it in a lab reactor (for example RC1): heat release rate, accumulation and adiabatic temperature rise.', 'reaction calorimetry calorimeter accumulation'],
    tmrad: ['TMRad', 'Time to maximum rate (adiabatic)', 'How long a batch that has lost all cooling takes to reach its maximum runaway rate. It falls roughly by half every ~10 °C hotter.', 'time to maximum rate tmr td24'],
    tmr: ['TMR', 'Time to maximum rate', 'Usually TMRad: the time from a given temperature to the peak of a runaway under adiabatic conditions.', 'time to maximum rate tmrad td24'],
    td24: ['TD24', 'Temperature with TMRad of 24 h', 'The start temperature at which a runaway would reach maximum rate in 24 hours. Keep the MTSR below it.', 'td24 tmrad time to maximum rate'],
    mtsr: ['MTSR', 'Maximum temperature of the synthesis reaction', 'The highest temperature the batch could reach if cooling failed and all accumulated reagent reacted: process temperature plus accumulation × ΔTad.', 'maximum temperature synthesis reaction accumulation stoessel'],
    mtt: ['MTT', 'Maximum technical temperature', 'Usually the boiling point of the mixture in an open system, or the pressure-relief set temperature in a closed one. Used in Stoessel classes.', 'maximum technical temperature stoessel'],
    adiabatic: ['ΔTad', 'Adiabatic temperature rise', 'How hot the batch would get if all the reaction heat stayed in it: ΔTad = Q′ / c′p. Above about 200 °C is high severity.', 'adiabatic temperature rise severity'],
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
    flash: ['Flash point', 'Flash point', 'The lowest liquid temperature at which the vapour above it can be ignited by a flame. Below room temperature means the vapour space is flammable in normal plant conditions.', 'flash point flammable closed cup'],
    autoignition: ['AIT', 'Autoignition temperature', 'The temperature at which a vapour-air mixture ignites by itself with no spark or flame. Keep hot surfaces (steam lines, motors) well below it.', 'autoignition temperature ignition hot surface'],
    ait: ['AIT', 'Autoignition temperature', 'The temperature at which a vapour-air mixture ignites by itself with no spark or flame.', 'autoignition temperature'],
    tlv: ['TLV', 'Threshold limit value', 'The ACGIH airborne exposure limit: TWA is the 8-hour average a worker can breathe day after day; STEL is a 15-minute limit.', 'threshold limit value exposure twa stel'],
    loc: ['LOC', 'Limiting oxygen concentration', 'The oxygen level below which a vapour or dust cannot burn, whatever its concentration. Nitrogen inerting keeps oxygen safely below it.', 'limiting oxygen concentration inerting nitrogen'],
    njs: ['Njs', 'Just-suspended speed', 'The lowest agitator speed at which no solid stays on the vessel base for more than 1 to 2 seconds (Zwietering).', 'just suspended speed solids suspension zwietering'],
    accumulation: ['Accumulation', 'Unreacted dosed reagent', 'In a semi-batch reaction, the reagent dosed but not yet reacted. It sets the MTSR if cooling fails.', 'accumulation semi batch dosing mtsr'],
    gate: ['GATE', 'Graduate Aptitude Test in Engineering', 'The national exam for M.Tech admissions and PSU jobs. The Chemical Engineering (CH) paper has 65 questions for 100 marks in 3 hours.', 'gate chemical engineering exam mock practice'],
    nat: ['NAT', 'Numerical answer type', 'A GATE question where you type a number; any value inside the accepted range scores. No negative marking.', 'numerical answer type gate'],
    msq: ['MSQ', 'Multiple select question', 'A GATE question where one or more options are correct; you must pick all of them. No negative marking and no partial marks.', 'multiple select question gate'],
    antoine: ['Antoine equation', 'Vapour pressure equation', 'log10 P = A - B/(C + T). Used to find a solvent\'s boiling point at any vacuum.', 'antoine vapour pressure boiling point vacuum'],
    gmp: ['GMP', 'Good manufacturing practice', 'The quality rules for making pharmaceuticals: documented, controlled and consistent processes.', 'good manufacturing practice']
  };
  var GLA = { 'differential scanning calorimetry': 'dsc', 'accelerating rate calorimeter': 'arc', 'accelerating rate calorimetry': 'arc', 'thermal screening unit': 'tsu', 'reaction calorimetry': 'rc', 'reaction calorimeter': 'rc1', 'time to maximum rate': 'tmrad', 'adiabatic temperature rise': 'adiabatic', 'delta t ad': 'adiabatic', 'dtad': 'adiabatic', 'net positive suction head': 'npsh', 'variable frequency drive': 'vfd', 'lock out tag out': 'loto', 'permit to work': 'ptw', 'plug flow': 'pfr', 'material of construction': 'moc', 'stoessel class': 'stoessel', 'criticality class': 'stoessel', 're number': 'reynolds', 'reynolds number': 'reynolds', 'p and id': 'p&id', 'pid diagram': 'p&id', 'filter dryer': 'anfd', 'thin film dryer': 'atfd', 'flash point': 'flash', 'autoignition temperature': 'autoignition', 'auto ignition': 'autoignition', 'ignition temperature': 'autoignition', 'exposure limit': 'tlv', 'limiting oxygen': 'loc', 'just suspended': 'njs', 'antoine equation': 'antoine' };
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
  var TYPE_BONUS = { 'Solvent data': .5, GATE: .4, 'GATE question': 0, Calculator: .6, Section: .3, Tool: .5, Lesson: .4, 'Process safety': .25, Equipment: .3, Instrument: .25, Agitator: .2, Game: .2, Exclusive: .3, Article: .3, Interview: 0, Page: 0, Videos: -.3, Animation: -.2 };
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
      if (prefer === 'gate' && (r.k === 'GATE' || r.k === 'GATE question')) s += 4;
      if (prefer !== 'gate' && r.k === 'GATE question') s -= 1;
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

  /* ---------- instant solvent answers from the solvent data pages ---------- */
  var PROPS = [[/flash/, 'Flash point'], [/auto ?ignit|\bait\b|ignition temp/, 'Autoignition temperature'], [/\blel\b|\buel\b|flammab|explosive limit|explosion limit/, 'Flammable limits (LEL to UEL)'],
    [/\btlv\b|exposure|\btwa\b|\bstel\b|\bppm\b|limit value/, 'Exposure limit (TLV)'], [/melt|freez|\bmp\b/, 'Melting point'], [/vapou?r pressure/, 'Vapour pressure at 20 °C'], [/boil|\bbp\b|b\.p/, 'Boiling point'],
    [/densit|specific gravity|\bsg\b/, 'Density at 20 °C'], [/molecular weight|mol(ar)? (wt|mass)|\bmw\b|\bm\.w/, 'Molecular weight'], [/\bcas\b/, 'CAS number'], [/formula/, 'Formula'],
    [/\bich\b|residual|q3c/, 'ICH Q3C residual solvent'], [/water|miscib|solub/, 'With water'], [/specific heat|heat capacity|\bcp\b/, 'Specific heat (liquid, 25 °C)'], [/latent|heat of vapo|enthalpy of vapo|vapori[sz]ation heat/, 'Latent heat of vaporisation'], [/viscos/, 'Viscosity'], [/nfpa|704|fire diamond|hazard diamond/, 'NFPA 704 rating'], [/densit|specific gravity|\bsg\b/, 'Density'], [/melt|freez|\bmp\b/, 'Melting / freezing point'], [/specific heat|heat capacity|\bcp\b/, 'Specific heat (liquid)'], [/fire|react|flammab|explos/, 'Fire and reactivity'], [/vapou?r density|heavier than air|lighter than air/, 'Vapour density (air = 1)'], [/cancer|carcino|iarc/, 'Cancer (IARC)'], [/health|toxic|hazard|effect/, 'Main health effects'], [/skin/, 'Skin absorption']];
  function findSolvent(low) {
    var best = null, bl = 0;
    FACTS.forEach(function (f) { f.a.forEach(function (a) { var al = a.toLowerCase(); if (al.length > bl && new RegExp('(^|[^a-z0-9])' + al.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])').test(low)) { best = f; bl = al.length; } }); });
    return best;
  }
  function bpAt(f, q) {
    var m = q.match(/(\d+(?:\.\d+)?)\s*(mm ?hg|mmhg|torr|mbar|kpa|bar|mm)\b/i); if (!m) return null;
    var v = +m[1], u = m[2].toLowerCase().replace(/\s/g, ''), mm = u === 'mbar' ? v * 0.750062 : u === 'kpa' ? v * 7.50062 : u === 'bar' ? v * 750.062 : v, vac = /vac/i.test(q) && (u === 'mmhg' || u === 'mm' || u === 'torr') && v < 760;
    var abs = vac && !/abs/i.test(q) ? 760 - mm : mm; if (!(abs > 0.5 && abs < 3000) || !f.ant) return null;
    var T = f.ant[1] / (f.ant[0] - Math.log10(abs)) - f.ant[2];
    return { T: T, abs: abs, vac: vac && !/abs/i.test(q), raw: m[0] };
  }
  var CTX = { solvent: null, props: [] };
  function findAllSolvents(low) {
    var hits = [];
    FACTS.forEach(function (f) { var best = null; f.a.forEach(function (a) { var al = a.toLowerCase(), m = new RegExp('(^|[^a-z0-9])(' + al.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')($|[^a-z0-9])').exec(low); if (m && (!best || al.length > best.len)) best = { f: f, at: m.index + m[1].length, len: al.length }; }); if (best) hits.push(best); });
    hits.sort(function (a, b) { return b.len - a.len; });
    var out = []; hits.forEach(function (h) { if (!out.some(function (o) { return h.at < o.at + o.len && o.at < h.at + h.len; })) out.push(h); });
    return out.sort(function (a, b) { return a.at - b.at; }).map(function (h) { return h.f; });
  }
  var KEYP = ['Boiling point', 'Melting point', 'Flash point', 'Autoignition temperature', 'Flammable limits (LEL to UEL)', 'Exposure limit (TLV)', 'Density at 20 °C', 'With water', 'ICH Q3C residual solvent'];
  function compareCard(list) {
    var d = document.createElement('div'); d.className = 'pg-ans pg-def';
    var head = '<tr><th></th>' + list.map(function (f) { return '<th>' + esc(f.n.split(' (')[0]) + '</th>'; }).join('') + '</tr>';
    var rows = KEYP.map(function (p) { return '<tr><td>' + esc(p.replace(' (LEL to UEL)', '').replace(' residual solvent', '')) + '</td>' + list.map(function (f) { return '<td>' + esc(f.f[p] || '–') + '</td>'; }).join('') + '</tr>'; }).join('');
    d.innerHTML = '<div class="pg-ans-k">Solvent comparison</div><div class="pg-cmp"><table>' + head + rows + '</table></div>' + list.map(function (f) { return '<a class="pg-open" href="' + BASE + '/solvents/' + f.s + '/">' + esc(f.n.split(' (')[0]) + ' →</a>'; }).join(' &nbsp; ');
    msg('Side by side, from our solvent data:'); log.appendChild(d); log.scrollTop = log.scrollHeight;
    setChips([['All solvents table', 'u:/solvents/'], ['Solvent swap between them', 'u:/process-modelling/solvent-swap-simulator/'], ['Start over', 'restart']]);
  }
  function solventAnswer(q) {
    var low = q.toLowerCase(); if (!FACTS.length) return false;
    // equipment and design questions that merely mention water or steam are not solvent questions
    if (/desuperheat|attemperat|relief|\bpsv\b|\bprv\b|safety valve|fire case|hydro ?test|control valve|\bcv\b|npsh|lmtd|cooling tower|boiler|condensate|insulation|knock ?out|separator/.test(low)) return false;
    var all = findAllSolvents(low);
    if (all.length >= 2 && /\bvs\.?\b|versus|compar|differen|better|\bor\b|\band\b/.test(low)) { compareCard(all.slice(0, 3)); CTX.solvent = all[0]; track('guide_query', { q: q.slice(0, 60), compare: all.map(function (f) { return f.s; }).join(',') }); return true; }
    var follow = /^(and|what about|how about|same for)\b/.test(low) || low.split(/\s+/).length <= 3;
    var f = all[0] || null, askProps = PROPS.filter(function (p) { return p[0].test(low); }).map(function (p) { return p[1]; });
    if (!f) { var pm = PATH.match(/^\/solvents\/([a-z0-9-]+)\/$/); if (pm && askProps.length) f = FACTS.filter(function (x) { return x.s === pm[1]; })[0]; }
    if (!f && CTX.solvent && askProps.length && (follow || low.split(/\s+/).length <= 5)) f = CTX.solvent;
    if (!f) return false;
    var props = askProps.filter(function (p, i, a) { return a.indexOf(p) === i && f.f[p]; });
    var bp = /boil|\bbp\b|vac|mm ?hg|torr|mbar/.test(low) ? bpAt(f, q) : null;
    if (!props.length && !bp && all.length && follow && CTX.props.length && CTX.solvent !== f) props = CTX.props.filter(function (p) { return f.f[p]; });
    var d = document.createElement('div'); d.className = 'pg-ans pg-def'; var body = '';
    if (bp) body += '<p><b style="display:inline">' + bp.T.toFixed(1) + ' °C</b> at ' + (bp.vac ? Math.round(760 - bp.abs) + ' mmHg vacuum (' + Math.round(bp.abs) + ' mmHg absolute)' : Math.round(bp.abs) + ' mmHg absolute') + ', from the Antoine equation.</p>';
    var explicit = props.length > 0;
    if (!props.length && !bp) props = ['Boiling point', 'Flash point', 'Autoignition temperature', 'Exposure limit (TLV)'].filter(function (p) { return f.f[p]; });
    body += props.map(function (p) { return '<p><span class="pg-from" style="display:inline">' + esc(p) + ':</span> ' + esc(f.f[p]) + '</p>'; }).join('');
    d.innerHTML = '<div class="pg-ans-k">Solvent data</div><b>' + esc(f.n) + '</b>' + body + '<a class="pg-open" href="' + BASE + '/solvents/' + f.s + '/">All ' + esc(f.n.split(' (')[0]) + ' data' + (f.ant ? ', boiling point under vacuum' : '') + ' and safety →</a>';
    msg('From our solvent data:'); log.appendChild(d); log.scrollTop = log.scrollHeight;
    d.querySelector('a').addEventListener('click', function () { track('guide_pick', { url: '/solvents/' + f.s + '/', from: 'solvent' }); });
    CTX.solvent = f; if (explicit) CTX.props = props;
    var nm = f.a[f.a.length - 1];
    setChips([['Flash point', 'q:flash point of ' + nm], ['Boiling point at 100 mmHg', 'q:' + nm + ' boiling point 100 mmHg'], ['TLV and health', 'q:' + nm + ' tlv health'], ['Compare with toluene', 'q:' + nm + ' vs toluene'], ['Start over', 'restart']]);
    track('guide_query', { q: q.slice(0, 60), solvent: f.s, props: props.join(',') });
    return true;
  }

  /* ---------- Hindi, Hinglish and plant slang ---------- */
  var HI = [[/फ्लैश\s*प(ॉ|ो)इंट|फ्लैश\s*प्वाइंट/g, ' flash point '], [/क्वथनांक|बॉयलिंग\s*प(ॉ|ो)इंट|उबलने का (तापमान|बिंदु)/g, ' boiling point '], [/गलनांक/g, ' melting point '], [/घनत्व/g, ' density '],
    [/दबाव/g, ' pressure '], [/तापमान/g, ' temperature '], [/पंप/g, ' pump '], [/पावर|शक्ति/g, ' power '], [/मेथनॉल/g, ' methanol '], [/टोल्यू?ईन|टोलुइन|टॉलुईन|टोल्यून/g, ' toluene '], [/एसीटोन|एसिटोन/g, ' acetone '],
    [/पानी/g, ' water '], [/इथेनॉल/g, ' ethanol '], [/गेट/g, ' gate '], [/प्रश्न|सवाल/g, ' question '], [/सुरक्षा/g, ' safety '], [/रिएक्टर/g, ' reactor '], [/आसवन/g, ' distillation '], [/निस्पंदन|फ़िल्टर|फिल्टर/g, ' filtration '],
    [/वैक्यूम/g, ' vacuum '], [/और/g, ' and '], [/क्या|हैं|है|का|की|के|में|को|से|बताइए|बताओ|बताएं|कितना|कितनी|कैसे|मुझे|चाहिए/g, ' ']];
  var HING = /\b(kya|kyaa|hai|hain|ka|ki|ke|batao|bataiye|btao|bta|bata|kitna|kitni|kaise|kese|kyu|kyon|mujhe|muje|chahiye|chaiye|karna|karo|kare|kaun|sa|wala|wali|mein|bhi|nikalo|nikalna|hota|hoti|hote|samjhao|samjhaiye|matlab|kya\s+hota)\b/g;
  var SLANG = [[/\brota ?vap\b/g, 'rotary evaporator'], [/\bvac\b/g, 'vacuum'], [/\bhx\b/g, 'heat exchanger'], [/\bphe\b/g, 'plate heat exchanger'], [/\bglr\b/g, 'glass lined reactor'], [/\bssr\b/g, 'stainless steel reactor'],
    [/\bchw\b/g, 'chilled water'], [/\bcw\b/g, 'cooling water'], [/\bcondensor\b/g, 'condenser'], [/\bcentri\b/g, 'centrifuge'], [/\bm\.?l\.? (recovery|distillation|tank)\b/g, 'mother liquor $1'], [/\bnutch\b|\bnutsch\b/g, 'nutsche'],
    [/\bexo\b/g, 'exotherm'], [/\bbrine temp\b/g, 'brine temperature'], [/\bcum\/h(r)?\b/g, 'm3/h'], [/\bm³/g, 'm3'], [/\bcubic met(er|re)s? per hour\b/g, 'm3/h'], [/\bkg\/cm²/g, 'kg/cm2']];
  function normalise(q) {
    var s = ' ' + q + ' ', hindi = /[\u0900-\u097F]/.test(s);
    HI.forEach(function (p) { s = s.replace(p[0], p[1]); });
    s = s.toLowerCase(); var hing = HING.test(s); HING.lastIndex = 0;
    s = s.replace(/\baur\b/g, 'and').replace(HING, ' ');
    SLANG.forEach(function (p) { s = s.replace(p[0], p[1]); });
    s = s.replace(/\s+/g, ' ').trim();
    return { q: s || q, hindi: hindi || hing };
  }

  /* ---------- quick calculations ---------- */
  var NUM = '(-?\\d+(?:[.,]\\d+)?)';
  function nm(x) { return +String(x).replace(',', '.'); }
  function f2(x, d) { return isFinite(x) ? Number(x).toLocaleString('en-IN', { maximumFractionDigits: d == null ? 2 : d }) : '–'; }
  var UNITS = {
    pressure: { bar: 1e5, mbar: 100, pa: 1, kpa: 1e3, mpa: 1e6, psi: 6894.757, psig: 6894.757, atm: 101325, mmhg: 133.322, torr: 133.322, 'kg/cm2': 98066.5, ksc: 98066.5, 'kgf/cm2': 98066.5, inhg: 3386.39, mwc: 9806.65, 'm wc': 9806.65 },
    flow: { 'm3/h': 1 / 3600, 'm3/hr': 1 / 3600, 'm3/s': 1, 'm3/min': 1 / 60, lph: 1e-3 / 3600, 'l/h': 1e-3 / 3600, lpm: 1e-3 / 60, 'l/min': 1e-3 / 60, 'l/s': 1e-3, gpm: 3.785411784e-3 / 60, cfm: 0.0283168466 / 60, 'kl/h': 1 / 3600 },
    mass: { kg: 1, g: 1e-3, mg: 1e-6, lb: 0.45359237, lbs: 0.45359237, tonne: 1000, ton: 1000, mt: 1000, t: 1000 },
    energy: { j: 1, kj: 1e3, mj: 1e6, kcal: 4184, cal: 4.184, kwh: 3.6e6, btu: 1055.056 },
    power: { w: 1, kw: 1e3, mw: 1e6, hp: 745.7, tr: 3516.85, 'kcal/h': 1.16222, 'kcal/hr': 1.16222, 'btu/h': 0.29307, 'btu/hr': 0.29307 },
    length: { m: 1, mm: 1e-3, cm: 1e-2, km: 1e3, inch: 0.0254, inches: 0.0254, ft: 0.3048, feet: 0.3048 },
    volume: { l: 1e-3, litre: 1e-3, liter: 1e-3, litres: 1e-3, liters: 1e-3, ml: 1e-6, m3: 1, kl: 1, gallon: 3.785411784e-3, gallons: 3.785411784e-3, gal: 3.785411784e-3 },
    viscosity: { cp: 1e-3, cps: 1e-3, 'mpa.s': 1e-3, 'pa.s': 1, poise: 0.1 },
    density: { 'kg/m3': 1, 'g/ml': 1000, 'g/cc': 1000, 'g/cm3': 1000, 'lb/ft3': 16.0185 }
  };
  var TEMPU = { c: 'C', '°c': 'C', degc: 'C', celsius: 'C', f: 'F', '°f': 'F', degf: 'F', fahrenheit: 'F', k: 'K', kelvin: 'K' };
  function unitOf(u) { u = u.replace(/\s+/g, ' ').trim().replace(/²/g, '2').replace(/³/g, '3'); if (TEMPU[u]) return ['temp', TEMPU[u]]; for (var dim in UNITS) if (UNITS[dim][u] != null) return [dim, u]; return null; }
  function convert(low) {
    var m = low.match(new RegExp('^(?:convert\\s+)?' + NUM + '\\s*([a-z°²³0-9/.\\s]{1,10}?)\\s+(?:to|in|into|=|as)\\s+([a-z°²³0-9/.\\s]{1,10}?)\\s*\\??$')); if (!m) return null;
    var v = nm(m[1]), a = unitOf(m[2]), b = unitOf(m[3]); if (!a || !b || a[0] !== b[0]) return null;
    var out;
    if (a[0] === 'temp') { var c = a[1] === 'C' ? v : a[1] === 'F' ? (v - 32) * 5 / 9 : v - 273.15; out = b[1] === 'C' ? c : b[1] === 'F' ? c * 9 / 5 + 32 : c + 273.15; return [f2(v, 3) + ' °' + a[1].replace('K', '') + (a[1] === 'K' ? 'K' : ''), f2(out, 2) + (b[1] === 'K' ? ' K' : ' °' + b[1])]; }
    out = v * UNITS[a[0]][a[1]] / UNITS[b[0]][b[1]];
    var dp = Math.abs(out) >= 1000 ? 0 : Math.abs(out) >= 100 ? 1 : Math.abs(out) >= 1 ? 3 : 4;
    return [f2(v, 4) + ' ' + m[2].trim(), (Math.abs(out) >= 0.01 || out === 0 ? f2(out, dp) : out.toExponential(3)) + ' ' + m[3].trim()];
  }
  function calcCard(kind, title, lines, link, linkText, chipsList) {
    var d = document.createElement('div'); d.className = 'pg-ans';
    d.innerHTML = '<div class="pg-ans-k">' + esc(kind) + '</div><b>' + esc(title) + '</b>' + lines.map(function (l) { return '<p>' + l + '</p>'; }).join('') + (link ? '<a class="pg-open" href="' + BASE + link + '">' + esc(linkText) + ' →</a>' : '');
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    setChips((chipsList || []).concat([['Start over', 'restart']]));
  }
  var MOTORS = [0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3.7, 5.5, 7.5, 9.3, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250];
  function calcAnswer(q) {
    var low = q.toLowerCase().replace(/m³/g, 'm3').replace(/kg\/cm²/g, 'kg/cm2'), m;
    // a vacuum gauge reading first, so '700 mmHg vacuum to mbar' is not read as an absolute pressure
    if (vacuumAnswer(low)) return true;
    // unit conversion
    var cv = convert(low);
    if (cv) { msg('Quick conversion:'); calcCard('Unit conversion', cv[0] + ' = ' + cv[1], [], null, '', [['Convert 1 bar to psi', 'q:1 bar to psi'], ['100 °C to °F', 'q:100 c to f']]); track('guide_calc', { type: 'convert', q: q.slice(0, 40) }); return true; }
    // pump power
    if (/pump|motor kw|shaft power/.test(low)) {
      var fl = low.match(new RegExp(NUM + '\\s*(m3\\/h(?:r)?|m3\\/s|lpm|l\\/min|kl\\/h|gpm)')), hd = low.match(new RegExp(NUM + '\\s*m(?:\\s*(?:of\\s*)?(?:head|wc|lc))?(?![a-z0-9/])')) || low.match(new RegExp('head\\s*(?:of\\s*)?' + NUM));
      if (fl && hd) {
        var Q = nm(fl[1]) * UNITS.flow[fl[2].replace('m3/hr', 'm3/h')] * 3600, H = nm(hd[1]), ef = (m = low.match(new RegExp(NUM + '\\s*%'))) ? nm(m[1]) : 70, sg = (m = low.match(new RegExp('(?:sg|specific gravity|density)\\s*(?:of\\s*)?' + NUM))) ? nm(m[1]) : 1;
        if (sg > 20) sg = sg / 1000; if (!(ef > 5 && ef <= 100)) ef = 70;
        var Ph = Q * H * sg * 9.81 * 1000 / 3.6e6, Ps = Ph / (ef / 100), mot = MOTORS.filter(function (x) { return x >= Ps * 1.15; })[0];
        msg('Quick pump power estimate:');
        calcCard('Calculation', 'Pump power for ' + f2(Q, 2) + ' m³/h at ' + f2(H, 1) + ' m head', ['Hydraulic power: <b style="display:inline">' + f2(Ph, 2) + ' kW</b> (Q × H × SG / 367)', 'Shaft power at ' + f2(ef, 0) + ' % pump efficiency: <b style="display:inline">' + f2(Ps, 2) + ' kW</b>', 'Motor: about <b style="display:inline">' + (mot ? mot + ' kW' : 'over 250 kW') + '</b> (shaft power + 15 % margin, next standard size)', '<span class="pg-from">SG ' + f2(sg, 2) + (sg === 1 && !/sg|gravity|density/.test(low) ? ' assumed (water). Add "SG 0.87" or "70 %" to your question to change it.' : '') + '</span>'],
          '/calculators/pump-power-calculator/', 'Full pump power calculator with NPSH', [['Same at 80 % efficiency', 'q:pump ' + f2(Q, 2).replace(/,/g, '') + ' m3/h ' + H + ' m head 80 %']]);
        track('guide_calc', { type: 'pump' }); return true;
      }
    }
    // LMTD
    if (/lmtd|log mean/.test(low)) {
      var ns = (low.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
      if (ns.length >= 4) {
        var co = /co-?current|parallel/.test(low), th1 = ns[0], th2 = ns[1], tc1 = ns[2], tc2 = ns[3];
        var d1 = co ? th1 - tc1 : th1 - tc2, d2 = co ? th2 - tc2 : th2 - tc1, lm = Math.abs(d1 - d2) < 1e-9 ? d1 : (d1 - d2) / Math.log(d1 / d2);
        msg('Quick LMTD:');
        if (!(d1 > 0 && d2 > 0)) calcCard('Calculation', 'Temperature cross', ['With these temperatures the hot and cold streams cross (ΔT ' + f2(d1, 1) + ' and ' + f2(d2, 1) + ' °C), so this flow arrangement cannot do the duty. Read as: hot in, hot out, cold in, cold out.'], '/articles/heat-exchanger-design-basics/', 'Heat exchanger design basics');
        else calcCard('Calculation', 'LMTD = ' + f2(lm, 1) + ' °C (' + (co ? 'co-current' : 'counter-current') + ')', ['Hot ' + th1 + ' → ' + th2 + ' °C, cold ' + tc1 + ' → ' + tc2 + ' °C', 'ΔT₁ = ' + f2(d1, 1) + ' °C, ΔT₂ = ' + f2(d2, 1) + ' °C; LMTD = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂)', '<span class="pg-from">Numbers read in the order hot in, hot out, cold in, cold out.</span>'], '/articles/heat-exchanger-design-basics/', 'Heat exchanger design basics', [[co ? 'Counter-current instead' : 'Co-current instead', 'q:lmtd ' + (co ? '' : 'co-current ') + ns.slice(0, 4).join(' ')]]);
        track('guide_calc', { type: 'lmtd' }); return true;
      }
    }
    // heating / cooling a batch
    if (/\b(heat|heating|cool|cooling|warm|chill)\b/.test(low) && (m = low.match(new RegExp(NUM + '\\s*(kg|tonnes?|tons?|mt|t|kl)\\b'))) && /from\s*-?\d/.test(low)) {
      var mass = nm(m[1]) * (/^(kg)$/.test(m[2]) ? 1 : 1000), ft = low.match(new RegExp('from\\s*' + NUM + '\\s*(?:°?\\s*c)?\\s*(?:to|-)\\s*' + NUM));
      if (ft) {
        var T1 = nm(ft[1]), T2 = nm(ft[2]), cp = (m = low.match(new RegExp('cp\\s*(?:of\\s*|=\\s*)?' + NUM))) ? nm(m[1]) : (/water/.test(low) ? 1.0 : 0.5);
        if (cp > 1.5) cp = cp / 4.1868; // a cp typed in kJ/kg·K
        var tm = low.match(new RegExp('in\\s*' + NUM + '\\s*(h|hr|hrs|hours?|min|mins|minutes?)\\b')), th = tm ? nm(tm[1]) / (/^m/.test(tm[2]) ? 60 : 1) : NaN;
        var Qk = mass * cp * Math.abs(T2 - T1), cool = T2 < T1, lines = ['Heat: <b style="display:inline">' + f2(Qk, 0) + ' kcal</b> = m × c<sub>p</sub> × ΔT with c<sub>p</sub> ' + f2(cp, 2) + ' kcal/kg·°C'];
        if (isFinite(th) && th > 0) { var kh = Qk / th; lines.push('Average duty over ' + f2(th, 2) + ' h: <b style="display:inline">' + f2(kh, 0) + ' kcal/h</b>' + (cool ? ' = ' + f2(kh / 3024, 1) + ' TR' : '')); if (cool) lines.push('<span class="pg-from">With a fixed brine temperature the peak at the start is higher than the average; check it with the TR calculator.</span>'); else lines.push('Steam: about ' + f2(Qk / 500, 0) + ' kg at about 500 kcal/kg latent heat (3 to 4 bar g)'); }
        else lines.push('<span class="pg-from">Add a time, for example "in 2 h", to get the duty in kcal/h' + (cool ? ' and TR' : '') + '.</span>');
        if (!/cp/.test(low)) lines.push('<span class="pg-from">c<sub>p</sub> ' + f2(cp, 2) + ' kcal/kg·°C assumed' + (cp === 0.5 ? ' (typical organic solvent mixture)' : ' (water)') + '. Add "cp 0.45" to change it.</span>');
        msg('Quick heat load:');
        calcCard('Calculation', (cool ? 'Cool ' : 'Heat ') + f2(mass, 0) + ' kg from ' + T1 + ' to ' + T2 + ' °C', lines, cool ? '/calculators/batch-cooling-tr-calculator/' : '/process-modelling/heating-cooling-time-simulator/', cool ? 'TR calculator with peak load' : 'Heating time simulator with your jacket', [['How long will it take?', 'u:/process-modelling/heating-cooling-time-simulator/']]);
        track('guide_calc', { type: 'heat' }); return true;
      }
    }
    // vessel volume
    if (/volume|capacity/.test(low) && /dia|diameter|\bid\b/.test(low)) {
      var dm = low.match(new RegExp(NUM + '\\s*(mm|m)\\s*(?:dia|diameter|id)\\b')) || low.match(new RegExp('(?:dia|diameter|id)\\s*(?:of\\s*|=\\s*)?' + NUM + '\\s*(mm|m)?')),
        hm = low.match(new RegExp(NUM + '\\s*(mm|m)\\s*(?:height|high|tall|ht|long|length|tl|t\\/t)\\b')) || low.match(new RegExp('(?:height|ht|length|tl|t\\/t|h)\\s*(?:of\\s*|=\\s*)?' + NUM + '\\s*(mm|m)?'));
      if (dm && hm) {
        var D = nm(dm[1]) * (dm[2] === 'mm' || (!dm[2] && nm(dm[1]) > 50) ? 1e-3 : 1), Hh = nm(hm[1]) * (hm[2] === 'mm' || (!hm[2] && nm(hm[1]) > 50) ? 1e-3 : 1);
        var cyl = Math.PI / 4 * D * D * Hh, tori = 0.0809 * D * D * D, ell = Math.PI * D * D * D / 24;
        msg('Quick vessel volume:');
        calcCard('Calculation', 'Vessel ' + f2(D, 3) + ' m diameter × ' + f2(Hh, 3) + ' m straight side', ['Cylinder only: <b style="display:inline">' + f2(cyl * 1000, 0) + ' L</b> (' + f2(cyl, 3) + ' m³)', 'With two torispherical dished ends: about <b style="display:inline">' + f2((cyl + 2 * tori) * 1000, 0) + ' L</b>', 'With two 2:1 elliptical ends: about ' + f2((cyl + 2 * ell) * 1000, 0) + ' L', '<span class="pg-from">Straight-side height between the weld lines. Dished-end volumes are approximate (0.081 D³ torispherical, πD³/24 elliptical each).</span>'],
          '/calculators/vessel-volume-calculator/', 'Volume at any level, exact dished ends');
        track('guide_calc', { type: 'vessel' }); return true;
      }
    }
    if (steamAnswer(low)) return true;
    if (hydroAnswer(low)) return true;
    if (cvAnswer(low)) return true;
    if (azeoAnswer(low)) return true;
    return false;
  }
  /* pressures: '8 bar', '8 barg', '8 bar(g)', '2 bara', '8 kg/cm2', '120 psig'. Plain 'bar' is read as gauge (how plant people speak), and said so. */
  var PRE = '(-?\\d+(?:[.,]\\d+)?)\\s*(bar\\s*\\(?\\s*[ga]\\s*\\)?|bar\\s*abs|bara|barg|bar|kg\\/cm2\\s*\\(?\\s*g\\s*\\)?|kg\\/cm2|ksc|psig|psia|psi|kpa\\s*abs|kpa|mpa)(?![a-z])';
  function pAll(low) { var re = new RegExp(PRE, 'g'), out = [], m; while ((m = re.exec(low))) out.push(barA(nm(m[1]), m[2].replace(/\s+/g, ''))); return out; }
  function barA(v, u) {
    var abs = /a\)?$|abs|psia|kpa|mpa/.test(u) && !/psig/.test(u), gauge = !abs;
    var bar = /kg|ksc/.test(u) ? v * 0.980665 : /psi/.test(u) ? v * 0.0689476 : /kpa/.test(u) ? v / 100 : /mpa/.test(u) ? v * 10 : v;
    return { a: gauge ? bar + 1.01325 : bar, g: gauge, txt: f2(v, 3) + ' ' + u.replace(/\(|\)/g, ''), assumed: /^bar$/.test(u) };
  }
  function steamAnswer(low) {
    if (!window.IF97 || !/steam|saturat|condensate/.test(low)) return false;
    var KJ = 4.1868, ps = pAll(low), sat = function (pa) { var r = IF97.sat(pa / 10); return r && { T: r.T - 273.15, hf: r.L.h / KJ, hg: r.V.h / KJ, v: r.V.v }; };
    if (/flash/.test(low) && ps.length >= 2) {
      var hi = ps[0].a > ps[1].a ? ps[0] : ps[1], lo = hi === ps[0] ? ps[1] : ps[0], s1 = sat(hi.a), s2 = sat(lo.a);
      if (!s1 || !s2) return false;
      var x = Math.max(0, (s1.hf - s2.hf) / (s2.hg - s2.hf));
      msg('Quick flash steam:');
      calcCard('Calculation', f2(x * 100, 1) + ' % of the condensate flashes to steam', ['From ' + hi.txt + ' (h<sub>f</sub> ' + f2(s1.hf, 1) + ' kcal/kg) to ' + lo.txt + ' (h<sub>f</sub> ' + f2(s2.hf, 1) + ' kcal/kg, latent heat ' + f2(s2.hg - s2.hf, 1) + ' kcal/kg)', 'Flash = (h<sub>f1</sub> − h<sub>f2</sub>) ÷ h<sub>fg2</sub>, at absolute pressures', (hi.assumed || lo.assumed) ? '<span class="pg-from">"bar" read as gauge. Write "bara" for absolute.</span>' : '', '<span class="pg-from">Steam properties: IAPWS-IF97.</span>'].filter(Boolean),
        '/calculators/steam-tables/', 'Flash steam calculator with vessel size', [['Steam at ' + hi.txt, 'q:steam at ' + hi.txt]]);
      track('guide_calc', { type: 'flash' }); return true;
    }
    var tm = low.match(new RegExp(NUM + '\\s*(?:°\\s*)?c\\b'));
    if (!ps.length && tm) {
      var T = nm(tm[1]); if (!(T > 0.01 && T < 370)) return false;
      var pa = IF97.psat(T + 273.15) * 10, s3 = sat(pa);
      msg('Saturated steam at ' + f2(T, 1) + ' °C:');
      calcCard('Steam tables', 'Pressure ' + f2(pa - 1.01325, 2) + ' barg (' + f2(pa, 3) + ' bar abs)', ['Liquid enthalpy h<sub>f</sub> ' + f2(s3.hf, 1) + ' kcal/kg; steam h<sub>g</sub> ' + f2(s3.hg, 1) + ' kcal/kg', 'Latent heat ' + f2(s3.hg - s3.hf, 1) + ' kcal/kg', '<span class="pg-from">IAPWS-IF97.</span>'], '/calculators/steam-tables/', 'Full steam tables');
      track('guide_calc', { type: 'steam' }); return true;
    }
    if (!ps.length) return false;
    var p = ps[0], s4 = sat(p.a); if (!s4) return false;
    msg('Saturated steam at ' + esc(p.txt) + ':');
    calcCard('Steam tables', 'Saturation temperature ' + f2(s4.T, 1) + ' °C', ['Absolute pressure ' + f2(p.a, 3) + ' bar', 'Liquid enthalpy h<sub>f</sub> ' + f2(s4.hf, 1) + ' kcal/kg; steam h<sub>g</sub> ' + f2(s4.hg, 1) + ' kcal/kg', 'Latent heat ' + f2(s4.hg - s4.hf, 1) + ' kcal/kg; steam volume ' + f2(s4.v, 3) + ' m³/kg', p.assumed ? '<span class="pg-from">"bar" read as gauge. Write "bara" for absolute.</span>' : '', '<span class="pg-from">IAPWS-IF97.</span>'].filter(Boolean),
      '/calculators/steam-tables/', 'Full steam tables, superheated steam and desuperheater', [['Flash from ' + p.txt + ' to 0 barg', 'q:flash steam from ' + p.txt + ' to 0 barg']]);
    track('guide_calc', { type: 'steam' }); return true;
  }
  function hydroAnswer(low) {
    if (!/hydro\s*-?\s*test|hydrostatic test|test pressure/.test(low)) return false;
    var ps = pAll(low); if (!ps.length) return false;
    var mg = ps[0].a - 1.01325;
    msg('Quick hydrotest pressure:');
    calcCard('Calculation', 'Hydrotest ' + f2(1.3 * mg, 2) + ' barg', ['ASME VIII Division 1, UG-99(b): 1.3 × MAWP × stress ratio, with MAWP ' + f2(mg, 2) + ' barg and the same allowable stress at test and design temperature', 'Measured at the top of the vessel; add the liquid head for a gauge lower down', '<span class="pg-from">A pneumatic test (UG-100) is 1.1 × MAWP.</span>'],
      '/calculators/vessel-thickness-calculator/', 'Vessel thickness, MAWP and hydrotest');
    track('guide_calc', { type: 'hydrotest' }); return true;
  }
  function vacuumAnswer(low) {
    if (!/vac/.test(low)) return false;
    var m = low.match(new RegExp(NUM + '\\s*(mm\\s*hg|mmhg|torr|mm|mbar|kpa|inhg|in\\s*hg)')); if (!m) return false;
    if (/abs/.test(low.slice(m.index, m.index + m[0].length + 6))) return false;
    var v = nm(m[1]), u = m[2].replace(/\s+/g, ''), toMm = { mmhg: 1, torr: 1, mm: 1, mbar: 0.750062, kpa: 7.50062, inhg: 25.4 }[u];
    var at = low.match(new RegExp('(?:atm\\w*|local)\\D{0,20}' + NUM + '\\s*(?:mm\\s*hg|mmhg|torr)')), atm = at ? nm(at[1]) : 760;
    var vac = v * toMm, absmm = atm - vac; if (!(absmm >= 0)) return false;
    msg('Quick vacuum conversion:');
    calcCard('Unit conversion', f2(v, 2) + ' ' + m[2] + ' vacuum = ' + f2(absmm, 1) + ' mmHg abs = ' + f2(absmm * 1.333224, 1) + ' mbar abs', ['Absolute = atmospheric − vacuum, with atmospheric ' + f2(atm, 0) + ' mmHg' + (at ? '' : ' (sea level; add "atm 740 mmHg" for your site)'), f2(absmm * 0.1333224, 2) + ' kPa abs'],
      '/calculators/unit-converter/', 'Unit converter with gauge, absolute and vacuum');
    track('guide_calc', { type: 'vacuum' }); return true;
  }
  function cvAnswer(low) {
    if (!/\bcv\b|\bkv\b|control valve|valve size/.test(low)) return false;
    var fl = low.match(new RegExp(NUM + '\\s*(m3\\/h(?:r)?|lpm|l\\/min|gpm)')), dp = low.match(new RegExp(NUM + '\\s*bar\\b(?:\\s*(?:dp|drop|pressure drop|δp|delta))?')) || low.match(new RegExp('(?:dp|δp|drop)\\s*(?:of\\s*|=\\s*)?' + NUM));
    if (!fl || !dp) return false;
    var Q = nm(fl[1]) * ({ 'm3/h': 1, 'm3/hr': 1, lpm: 0.06, 'l/min': 0.06, gpm: 0.227125 }[fl[2]] || 1), d = nm(dp[1]), sg = (low.match(new RegExp('(?:sg|specific gravity)\\s*(?:of\\s*|=\\s*)?' + NUM)) || [])[1];
    sg = sg ? nm(sg) : 1; if (!(d > 0)) return false;
    var Kv = Q * Math.sqrt(sg / d), Cv = Kv / 0.865;
    msg('Quick control valve size (liquid):');
    calcCard('Calculation', 'Cv ' + f2(Cv, 1) + ' (Kv ' + f2(Kv, 1) + ')', ['Kv = Q √(SG/ΔP) = ' + f2(Q, 2) + ' × √(' + f2(sg, 2) + '/' + f2(d, 2) + '); Cv = Kv ÷ 0.865', sg === 1 ? '<span class="pg-from">SG 1 assumed. Add "sg 0.87" to change it.</span>' : '', '<span class="pg-from">Turbulent, not choked. The calculator checks flashing and cavitation.</span>'].filter(Boolean),
      '/calculators/control-valve-sizing/', 'Control valve sizing with choked-flow check');
    track('guide_calc', { type: 'cv' }); return true;
  }
  function azeoAnswer(low) {
    if (!/azeotrop|azeo\b/.test(low) || !AZ.length || !FACTS.length) return false;
    var all = findAllSolvents(low), sl = all.map(function (f) { return f.s; });
    if (/water/.test(low) && sl.indexOf('water') < 0) sl.push('water');
    var nameOf = function (s) { var f = FACTS.filter(function (x) { return x.s === s; })[0]; return f ? f.n.split(' (')[0] : s; };
    var seenPair = {}, rows = AZ.filter(function (r) { var k = [r.sa, r.sb].sort().join('|'); if (seenPair[k] || !(sl.indexOf(r.sa) >= 0 && sl.indexOf(r.sb) >= 0 && r.sa !== r.sb)) return false; seenPair[k] = 1; return true; });
    var line = function (r) {
      if (r.k === 'none' || !isFinite(r.t)) return nameOf(r.sa) + ' + ' + nameOf(r.sb) + ': no azeotrope at 1 atm';
      return nameOf(r.sa) + ' + ' + nameOf(r.sb) + ': boils at <b style="display:inline">' + f2(r.t, 1) + ' °C</b>' + (isFinite(r.w) ? ', ' + f2(r.w, 1) + ' wt % ' + nameOf(r.sb) + (isFinite(r.x) ? ' (' + f2(r.x, 1) + ' mol %)' : '') : '') + (r.k === 'max' ? ', maximum-boiling' : '') + (r.L ? ', condensate splits into two layers' : '');
    };
    if (rows.length) {
      msg('Measured azeotrope at 1 atm:');
      calcCard('Azeotrope data', nameOf(rows[0].sa) + ' and ' + nameOf(rows[0].sb), rows.slice(0, 3).map(line).concat(['<span class="pg-from">Boiling points: ' + nameOf(rows[0].sa) + ' ' + f2(rows[0].ta, 1) + ' °C, ' + nameOf(rows[0].sb) + ' ' + f2(rows[0].tb, 1) + ' °C. Source: Lange\'s Handbook and CRC Handbook via Wikipedia (CC BY-SA 4.0).</span>']),
        '/solvents/azeotropes/', 'Estimate it at your vacuum or pressure');
      track('guide_calc', { type: 'azeotrope' }); return true;
    }
    if (sl.length === 1 || (sl.length === 2 && sl.indexOf('water') >= 0 && all.length === 1)) {
      var one = all.length ? all[0].s : sl[0], seen1 = {}, list = AZ.filter(function (r) { var k = [r.sa, r.sb].sort().join('|'); if (seen1[k] || !((r.sa === one || r.sb === one) && r.k !== 'none' && isFinite(r.t))) return false; seen1[k] = 1; return true; }).slice(0, 6);
      if (!list.length) return false;
      msg('Measured azeotropes of ' + esc(nameOf(one)) + ' at 1 atm:');
      calcCard('Azeotrope data', nameOf(one) + ': ' + list.length + ' listed', list.map(line), '/solvents/azeotropes/', 'Full table, and estimates at any pressure');
      track('guide_calc', { type: 'azeotrope' }); return true;
    }
    if (sl.length >= 2) { msg('There is no measured value for that pair in the table. The azeotrope calculator can estimate it.'); recs([{ t: 'Azeotrope calculator and table', u: '/solvents/azeotropes/', k: 'Solvent data', d: 'Estimate any pair at your pressure' }]); return true; }
    return false;
  }

  /* ---------- GATE question in the chat ---------- */
  var GATE_URL = (CS && CS.getAttribute('data-gatebank')) || IDX_URL.replace(/data\/guide-index\.json$/, 'js/gate-bank.js');
  var gateLoading = null, pending = null, GKEY = 'pce-guide-gate';
  function loadGate() { if (window.GATE_BANK) return Promise.resolve(); if (!gateLoading) gateLoading = new Promise(function (res) { var sc = document.createElement('script'); sc.src = GATE_URL; sc.onload = res; sc.onerror = res; document.head.appendChild(sc); }); return gateLoading; }
  function gscore() { try { return JSON.parse(localStorage.getItem(GKEY)) || { r: 0, t: 0, seen: [] }; } catch (e) { return { r: 0, t: 0, seen: [] }; } }
  function gsave(s2) { try { localStorage.setItem(GKEY, JSON.stringify(s2)); } catch (e) {} }
  var L = function (i) { return 'ABCD'[i]; };
  function isGateAsk(low) { if (!/\b(gate|quiz|question of the day|daily question|practice question)\b/.test(low) && !/quiz me|test me/.test(low)) return false; var rest = low.replace(/\b(gate|ch|chemical|engineering|quiz|me|test|a|an|one|give|ask|another|next|new|random|daily|today'?s?|of|the|day|question|questions|practice|please|pls|now|more)\b/g, '').replace(/[^a-z0-9]/g, ''); return rest === ''; }
  function askGate(daily) {
    return loadGate().then(function () {
      var B = window.GATE_BANK || []; if (!B.length) { msg('The GATE questions did not load. Open the practice page instead.'); recs([{ t: 'GATE practice questions', u: '/gate/practice/', k: 'GATE', d: '' }]); return; }
      var sc = gscore(), q;
      if (daily) { var day = Math.floor(Date.now() / 864e5); q = B[(day * 37) % B.length]; }
      else { var left = B.filter(function (x) { return (sc.seen || []).indexOf(x.id) < 0; }); if (!left.length) { sc.seen = []; left = B; } q = left[Math.floor(Math.random() * left.length)]; }
      pending = q;
      var d = document.createElement('div'); d.className = 'pg-ans';
      var opts = q.o ? '<ol type="A" style="margin:6px 0 4px 1.3em;padding:0">' + q.o.map(function (o) { return '<li>' + o + '</li>'; }).join('') + '</ol>' : '';
      var how = q.t === 'MCQ' ? 'Tap A, B, C or D.' : q.t === 'MSQ' ? 'One or more are right: type the letters, for example "A, C".' : 'Type your number.';
      d.innerHTML = '<div class="pg-ans-k">' + (daily ? 'GATE question of the day' : 'GATE practice question') + ' · ' + esc((window.GATE_SECS || {})[q.sec] || q.sec) + ' · ' + q.t + ' · ' + q.m + ' mark' + (q.m > 1 ? 's' : '') + '</div><p style="color:#ECE7D8">' + q.q + '</p>' + opts + '<span class="pg-from">' + how + (q.t === 'MCQ' ? ' Wrong answers cost ' + (q.m === 1 ? '1/3' : '2/3') + ' mark in the real exam.' : '') + '</span>';
      log.appendChild(d); log.scrollTop = log.scrollHeight;
      setChips(q.t === 'MCQ' ? [['A', 'a:0'], ['B', 'a:1'], ['C', 'a:2'], ['D', 'a:3'], ['Skip', 'q:another gate question']] : [['Show the answer', 'a:show'], ['Skip', 'q:another gate question']]);
      track('guide_gate', { id: q.id, daily: daily ? 1 : 0 });
    });
  }
  function keyText(q) { return q.t === 'MCQ' ? L(q.a) + ') ' + q.o[q.a] : q.t === 'MSQ' ? q.a.map(L).join(', ') : (q.a[0] === q.a[1] ? String(q.a[0]) : q.a[0] + ' to ' + q.a[1]) + (q.v != null ? ' (exact ' + (+q.v.toPrecision(5)) + ')' : ''); }
  function gradeGate(input) {
    var q = pending, s0 = String(input).trim().toLowerCase(), ok = null, given = s0, show = s0 === 'show';
    if (!show) {
      if (q.t === 'MCQ') { var mm = s0.match(/^\(?([a-d])\)?$/) || s0.match(/^option\s*([a-d])$/); if (/^a:\d$/.test(s0)) mm = [0, 'abcd'[+s0.slice(2)]]; if (!mm) return false; var i = 'abcd'.indexOf(mm[1]); ok = i === q.a; given = L(i); }
      else if (q.t === 'MSQ') { var ls = s0.replace(/and/g, ',').match(/\b[a-d]\b/g); if (!ls || s0.replace(/[\sa-d,()and]/g, '') !== '') return false; var set = ls.map(function (c) { return 'abcd'.indexOf(c); }).filter(function (x, k, a) { return a.indexOf(x) === k; }); ok = set.length === q.a.length && q.a.every(function (x) { return set.indexOf(x) >= 0; }); given = set.sort().map(L).join(', '); }
      else { var v = parseFloat(s0.replace(',', '.')); if (!isFinite(v) || !/^-?[\d.,]+\s*[a-z°%/]*$/.test(s0)) return false; ok = v >= q.a[0] - 1e-9 && v <= q.a[1] + 1e-9; given = String(v); }
    }
    var sc = gscore(); sc.seen = (sc.seen || []).concat([q.id]).slice(-120); if (!show) { sc.t++; if (ok) sc.r++; } gsave(sc);
    var d = document.createElement('div'); d.className = 'pg-ans ' + (ok ? 'pg-def' : '');
    d.innerHTML = '<div class="pg-ans-k">' + (show ? 'Answer' : ok ? 'Correct!' : 'Not quite') + '</div>' + (show ? '' : '<p>Your answer: ' + esc(given) + '</p>') + '<p><b style="display:inline">Answer: ' + esc(keyText(q)) + '</b></p><p>' + q.s + '</p><span class="pg-from">Your score in this browser: ' + sc.r + ' right out of ' + sc.t + ' tried.</span>';
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    pending = null;
    setChips([['Another question', 'q:another gate question'], ['More ' + ((window.GATE_SECS || {})[q.sec] || '') + ' questions', 'u:/gate/practice/?sec=' + q.sec], ['Full mock test', 'u:/gate/mock-test/'], ['Start over', 'restart']]);
    track('guide_gate_answer', { id: q.id, ok: ok ? 1 : 0, show: show ? 1 : 0 });
    return true;
  }

  /* ---------- conversation ---------- */
  var START = [['I need a calculator', 'calc'], ['Solvent properties', 'solv'], ['GATE question of the day', 'q:gate question of the day'], ['GATE preparation', 'gate'], ['Scale-up modelling', 'model'], ['Interview preparation', 'interview'], ['Process safety', 'safety'], ['How does equipment work?', 'equipment'], ['Something on the plant is wrong', 'fault']];
  if (/^\/gate\//.test(PATH)) START = [['Take the mock test', 'u:/gate/mock-test/'], ['Practice questions', 'u:/gate/practice/'], ['Formula sheets', 'u:/gate/formula-sheets/'], ['GATE exam pattern', 'q:gate exam pattern marking'], ['Something else', 'more']];
  else if (/^\/solvents\//.test(PATH)) START = [['Flash point of a solvent', 'solv'], ['Boiling point under vacuum', 'q:boiling point under vacuum calculator'], ['Solvent swap', 'u:/process-modelling/solvent-swap-simulator/'], ['All solvents table', 'u:/solvents/'], ['Something else', 'more']];
  else if (/^\/process-modelling\//.test(PATH)) START = [['Fit my kinetics', 'u:/process-modelling/reaction-kinetics-fitting/'], ['Is my dosing safe?', 'u:/process-modelling/semi-batch-dosing-simulator/'], ['Heat-up time', 'u:/process-modelling/heating-cooling-time-simulator/'], ['What is MTSR?', 'q:what is mtsr'], ['Something else', 'more']];
  var START_ALL = [['I need a calculator', 'calc'], ['Solvent properties', 'solv'], ['GATE preparation', 'gate'], ['Scale-up modelling', 'model'], ['Interview preparation', 'interview'], ['Process safety', 'safety'], ['Something on the plant is wrong', 'fault']];
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
    calc: ['Type it and I will work it out, for example “pump power 20 m3/h 30 m head”, “heat 5000 kg from 25 to 80 in 2 h”, “lmtd 150 90 30 70” or “5 bar to psi”. Or open a calculator:', [['Pump power 20 m3/h, 30 m', 'q:pump power 20 m3/h 30 m head'], ['Cool 4000 kg 40 to 5 °C in 3 h', 'q:cool 4000 kg from 40 to 5 in 3 h'], ['100 kW to kcal/h', 'q:100 kw to kcal/h'], ['Boiling point under vacuum', 'q:boiling point vacuum calculator'], ['Pump power', 'q:pump power calculator'], ['Agitator scale-up', 'q:mixing scale up calculator'], ['Filtration time', 'q:filtration calculator'], ['Heat load', 'q:heat load calculator'], ['All calculators', 'u:/calculators/']]],
    solv: ['Type a solvent and what you need, for example "flash point of toluene", "DMF TLV" or "methanol boiling point at 700 mm vacuum".', [['Flash point of toluene', 'q:flash point of toluene'], ['Acetone autoignition', 'q:acetone autoignition temperature'], ['DCM boiling point at 300 mmHg', 'q:dcm boiling point 300 mmHg'], ['Methanol TLV', 'q:methanol tlv'], ['All solvents table', 'u:/solvents/']]],
    gate: ['GATE Chemical: a full mock test, 105 practice questions with solutions and formula sheets for every section. Or answer one right here.', [['Question of the day', 'q:gate question of the day'], ['Random question', 'q:another gate question'], ['Take the mock test', 'u:/gate/mock-test/'], ['Practice questions', 'u:/gate/practice/'], ['Formula sheets', 'u:/gate/formula-sheets/'], ['Exam pattern and syllabus', 'u:/gate/'], ['A question on LMTD', 'q:gate lmtd heat exchanger question']]],
    model: ['Process modelling for scale-up: run your own lab data against the plant.', [['Fit reaction kinetics', 'u:/process-modelling/reaction-kinetics-fitting/'], ['Semi-batch dosing and MTSR', 'u:/process-modelling/semi-batch-dosing-simulator/'], ['Heating and cooling time', 'u:/process-modelling/heating-cooling-time-simulator/'], ['Mixing, Njs and kLa', 'u:/process-modelling/mixing-mass-transfer-scale-up/'], ['Solvent swap', 'u:/process-modelling/solvent-swap-simulator/']]],
    more: ['Sure. What else can I help with?', START_ALL],
    interview: ['Good luck! Start with the Top 50, or type any topic and I will find the questions.', [['Top 50 questions', 'u:/process-engineering-faq/#top50'], ['Distillation', 'q:distillation interview'], ['Heat transfer', 'q:heat exchanger lmtd interview'], ['Pumps', 'q:pump cavitation interview'], ['Safety', 'q:safety interview']]],
    safety: ['Safety first. Ask me anything, for example "what is DSC" or "runaway reaction".', [['DSC, ARC, RC1 tests', 'q:dsc arc rc1 thermal testing'], ['Runaway reaction', 'q:runaway reaction cooling failure'], ['Relief sizing', 'q:relief vent sizing'], ['Flash point of solvents', 'q:flash point flammable'], ['Incident case studies', 'u:/process-safety/#cases']]],
    equipment: ['Which equipment? Type its name, for example "centrifuge", "ANFD" or "rotameter".', [['Reactor', 'q:batch reactor'], ['Centrifuge', 'q:centrifuge'], ['Dryers', 'q:dryer'], ['Vacuum pump', 'q:vacuum pump'], ['Instruments', 'u:/equipment-instruments/#instrumentation']]],
    fault: ['Tell me the symptom, for example "vacuum not reaching" or "filtration slow".', [['Vacuum not reaching', 'q:vacuum not reaching leak'], ['Filtration slow', 'q:filtration slow fines'], ['Temperature rising', 'q:temperature rising runaway'], ['Pump not delivering', 'q:pump not delivering cavitation'], ['Try the Troubleshooter game', 'u:/games/troubleshooter/']]]
  };
  function chip(v, label) {
    msg(esc(label), 'you');
    if (v.indexOf('u:') === 0) { location.href = BASE + v.slice(2); return; }
    if (v.indexOf('q:') === 0) { answer(v.slice(2)); return; }
    if (v.indexOf('a:') === 0) { if (pending) gradeGate(v === 'a:show' ? 'show' : v); return; }
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
  var hiNote = false;
  function answer(q0) {
    load().then(function () {
      if (pending) { if (gradeGate(q0)) return; pending = null; }
      var nq = normalise(q0), q = nq.q;
      if (nq.hindi && !hiNote) { hiNote = true; msg('I understand Hindi and Hinglish questions, and I answer in English.'); }
      var low = q.toLowerCase().trim();
      if (isGateAsk(low)) { askGate(/day|daily|today/.test(low)); lastQ = q; return; }
      if (calcAnswer(q)) { lastQ = q; return; }
      if (/^(hi+|hello|hey|namaste|good (morning|evening|afternoon))\b/.test(low)) { msg('Hello! Ask me anything, for example “flash point of toluene”, “pump power 20 m3/h 30 m head”, “1 bar to psi” or “give me a GATE question”.'); setChips(START); return; }
      if (/^(thanks|thank you|thx|ok|okay|great|nice)\b/.test(low)) { msg('Happy to help. Anything else?'); setChips(START); return; }
      if (/who (made|built|runs)|about (you|this site)|founder/.test(low)) { msg('PharmaChemE is run by Ankush Chopra, a chemical engineer.'); recs([{ t: 'About PharmaChemE', u: '/about/', k: 'Page', d: '' }]); return; }
      if (/what'?s new|what is new|new on (the|this) site|latest (tools|calculators|additions|updates)|recently added|release notes|changelog/.test(low)) { msg('The newest additions to the site:'); recs([{ t: 'Release notes', u: '/calculators/release-notes/', k: 'Page', d: 'Everything added, by date' }, { t: 'Plant Rally', u: '/games/plant-rally/', k: 'Game', d: 'Racing game with engineering questions' }, { t: 'Relief valve sizing', u: '/calculators/relief-valve-sizing/', k: 'Calculator', d: 'API 520/521, fire case, API 526 orifices' }, { t: 'Batch distillation simulator', u: '/calculators/batch-distillation-simulator/', k: 'Calculator', d: 'Cuts, reflux and azeotropes' }, { t: 'Azeotrope calculator and table', u: '/solvents/azeotropes/', k: 'Solvent data', d: '216 measured azeotropes' }]); setChips(START); return; }
      if (/custom|build (a|me)|automate|excel|spreadsheet/.test(low)) { recs([{ t: 'Custom tools for your plant', u: '/custom-solutions/', k: 'Service', d: 'Turn your spreadsheet calculation into a tool' }]); return; }
      /* a short follow-up like "and ARC?" keeps the last topic's intent */
      var qq = /^(and|what about|how about)\s+/i.test(low) ? low.replace(/^(and|what about|how about)\s+/i, '') : q;
      if (solventAnswer(q)) { lastQ = q; return; }
      var pref = /\bgate\b/.test(low) ? 'gate' : /interview|question|viva|fresher/.test(low) ? 'interview' : /calculat|calculator|how much|sizing|size /.test(low) ? 'calc' : mode === 'interview' ? 'interview' : mode === 'calc' ? 'calc' : '';
      var g = glossFor(qq);
      var r = search(qq.replace(/\binterview\b|\bquestions?\b|\bviva\b|\bcalculators?\b|\bgate\b/gi, ' ') || qq, pref);
      if (g.length) glossCard(g[0]);
      if (!r.length) {
        var dm = suggest(qq);
        if (dm.length) {
          var fixed = qq.toLowerCase(); dm.forEach(function (p) { fixed = fixed.replace(p[0], p[1]); });
          msg('I could not find “' + esc(qq) + '”. Did you mean <b>' + esc(fixed) + '</b>?'); track('guide_unanswered', { q: qq.slice(0, 80), suggested: fixed.slice(0, 60) }); setChips([['Yes, search “' + fixed + '”', 'q:' + fixed], ['Start over', 'restart']]);
        } else if (!g.length) {
          msg('I could not find that on the site. Try fewer or different words, or search the site with Google.'); track('guide_unanswered', { q: qq.slice(0, 80) });
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
      track('guide_query', { q: qq.slice(0, 60), results: r.length, top: r[0] ? r[0].u : '', def: g[0] || '', answered: r.length || g.length ? 1 : 0 });
    });
  }
  CANNED.restart = ['Sure. What else can I help with?', START_ALL];
  var micBtn = $('.pg-mic'), rec = null;
  if (micBtn) micBtn.addEventListener('click', function () {
    if (rec) { rec.stop(); return; }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition; rec = new SR(); rec.lang = 'en-IN'; rec.interimResults = false; rec.maxAlternatives = 1;
    micBtn.classList.add('on'); micBtn.setAttribute('aria-label', 'Listening… tap to stop');
    rec.onresult = function (e) { var t = e.results[0][0].transcript; input.value = t; msg(esc(t), 'you'); input.value = ''; answer(t); track('guide_voice'); };
    rec.onerror = function (e) { if (e.error !== 'aborted') msg(e.error === 'not-allowed' ? 'Microphone access is blocked. Allow it in the browser to ask by voice.' : 'I could not hear that. Try again or type your question.'); };
    rec.onend = function () { rec = null; micBtn.classList.remove('on'); micBtn.setAttribute('aria-label', 'Ask by voice'); };
    try { rec.start(); } catch (e) { rec = null; micBtn.classList.remove('on'); }
  });
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
  function close() { root.classList.remove('open'); charBtn.setAttribute('aria-expanded', 'false'); if (MINI) { root.classList.add('min'); $('.pg-mini').focus({ preventScroll: true }); } else charBtn.focus({ preventScroll: true }); }
  function minimise() { root.classList.remove('open'); root.classList.add('min'); store('1'); hideHi(); $('.pg-mini').focus({ preventScroll: true }); track('guide_minimise'); }
  function restore() { root.classList.remove('min'); if (!MINI) store('0'); open(); }
  function hideHi() { $('.pg-hi').classList.remove('on'); }
  charBtn.addEventListener('click', function () { if (root.classList.contains('open')) close(); else open(); });
  $('.pg-open').addEventListener('click', open);
  $('.pg-close').addEventListener('click', close);
  root.querySelectorAll('.pg-min').forEach(function (b) { b.addEventListener('click', minimise); });
  $('.pg-mini').addEventListener('click', restore);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('open')) close(); });

  if (RM) root.classList.remove('idle');
  if (stored() === '1' || MINI) root.classList.add('min');
  var IKEY = 'pce-guide-intro', introSeen = (function () { try { return localStorage.getItem(IKEY) === '1'; } catch (e) { return true; } })();
  if (!introSeen) {
    var hi = $('.pg-hi'), EX = [['Flash point of toluene', 'flash point of toluene'], ['Pump power 20 m³/h, 30 m', 'pump power 20 m3/h 30 m head'], ['Give me a GATE question', 'gate question of the day']];
    hi.innerHTML = 'Hi! I am your plant guide. Ask me anything, for example:' + EX.map(function (e) { return '<button type="button" class="pg-ex" data-q="' + esc(e[1]) + '">' + esc(e[0]) + '</button>'; }).join('') + '<button type="button" class="pg-open">Or type your own</button>';
    if (root.classList.contains('min')) hi.classList.add('mini');
    hi.querySelectorAll('.pg-ex').forEach(function (b) { b.addEventListener('click', function () { hi.classList.remove('mini'); open(); msg(esc(b.textContent), 'you'); answer(b.dataset.q); track('guide_intro_pick', { q: b.dataset.q }); }); });
    hi.querySelector('.pg-open').addEventListener('click', function () { hi.classList.remove('mini'); open(); });
    setTimeout(function () { if (!root.classList.contains('open')) { hi.classList.add('on'); try { localStorage.setItem(IKEY, '1'); } catch (e) {} setTimeout(function () { hideHi(); hi.classList.remove('mini'); }, 12000); } }, 2200);
  } else if (!root.classList.contains('min')) setTimeout(function () { if (!root.classList.contains('open') && !root.classList.contains('min')) { $('.pg-hi').classList.add('on'); setTimeout(hideHi, 9000); } }, 1800);
})();
