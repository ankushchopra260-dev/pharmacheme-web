/* PharmaChemE line tool: P&ID / PFD symbol library (ISA 5.1 / ISO 10628 style), line services and editable templates.
   window.LNS = { EQUIP, CATS, INST, SERVICES, ITEMLINK, drawEq, drawItem, drawInst, TEMPLATES, slug } */
(function (root) {
  'use strict';
  const slug = n => String(n).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* equipment: key -> name, category, drawing, size on the sheet, tag prefix, default role, Equipment-tab entry */
  const E = {}, CATS = [];
  function eq(cat, key, n, d, w, h, pre, type, link) { if (!CATS.includes(cat)) CATS.push(cat); E[key] = { n, cat, d, w, h, pre, type: type || 'consumer', link: link ? slug(link) : '' }; }
  eq('Storage & vessels', 'tank', 'Atmospheric storage tank', 'tank', 60, 80, 'T', 'source', 'Atmospheric Storage Tank');
  eq('Storage & vessels', 'vessel', 'Pressure vessel / receiver', 'vessel', 46, 80, 'V', 'consumer', 'Pressure Vessel / Receiver');
  eq('Storage & vessels', 'hdrum', 'Horizontal drum / receiver', 'hvessel', 100, 44, 'V', 'consumer', 'Pressure Vessel / Receiver');
  eq('Storage & vessels', 'sump', 'Hot well / cold well (sump)', 'sump', 120, 60, 'SUMP', 'source');
  eq('Reactors', 'reactor', 'Batch reactor (GLR / SSR)', 'reactor', 66, 92, 'R', 'consumer', 'Batch Reactor (Glass-lined / SS)');
  eq('Reactors', 'semibatch', 'Semi-batch reactor', 'reactor', 66, 92, 'R', 'consumer', 'Semi-batch Reactor');
  eq('Reactors', 'cstr', 'CSTR (continuous stirred tank)', 'reactor', 66, 92, 'R', 'consumer', 'CSTR (Continuous Stirred-Tank Reactor)');
  eq('Reactors', 'autoclave', 'Hydrogenator / autoclave', 'autoclave', 60, 92, 'R', 'consumer', 'Hydrogenator / Autoclave');
  eq('Reactors', 'pfr', 'Plug-flow / tubular reactor', 'pfr', 100, 34, 'R', 'consumer', 'Plug-flow / Tubular Reactor (PFR)');
  eq('Reactors', 'pbr', 'Packed-bed catalytic reactor', 'packed', 40, 130, 'R', 'consumer', 'Packed-bed Catalytic Reactor');
  eq('Reactors', 'jvessel', 'Jacketed vessel / limpet coil', 'jvessel', 60, 86, 'V', 'consumer', 'Jacket, Half-coil and Limpet Coil');
  eq('Heat transfer', 'hxn', 'Shell & tube heat exchanger', 'hx', 100, 34, 'E', 'consumer', 'Shell and Tube Heat Exchanger');
  eq('Heat transfer', 'cond', 'Condenser (vertical)', 'vhx', 34, 100, 'E', 'consumer', 'Condenser');
  eq('Heat transfer', 'phe', 'Plate heat exchanger', 'phe', 40, 70, 'E', 'consumer', 'Plate Heat Exchanger');
  eq('Heat transfer', 'reboiler', 'Reboiler (kettle)', 'kettle', 100, 50, 'E', 'consumer', 'Reboiler');
  eq('Heat transfer', 'ct', 'Cooling tower', 'ct', 84, 70, 'CT', 'source', 'Cooling Tower');
  eq('Heat transfer', 'chiller', 'Chiller (vapour compression)', 'chiller', 80, 50, 'CH', 'consumer', 'Chiller (Vapour-compression)');
  eq('Heat transfer', 'boiler', 'Steam boiler', 'boiler', 80, 56, 'B', 'source', 'Steam Boiler (Fire-tube / Water-tube)');
  eq('Heat transfer', 'tfh', 'Thermic fluid heater', 'tfh', 70, 60, 'H', 'source', 'Thermic Fluid Heater');
  eq('Heat transfer', 'ffe', 'Falling-film evaporator', 'evap', 40, 130, 'EV', 'consumer', 'Falling-film Evaporator');
  eq('Heat transfer', 'atfe', 'Agitated thin film evaporator (ATFE)', 'atfe', 36, 120, 'EV', 'consumer', 'Agitated Thin Film Evaporator (ATFE)');
  eq('Heat transfer', 'mee', 'Multiple-effect evaporator (MEE)', 'mee', 130, 90, 'EV', 'consumer', 'Multiple-effect Evaporator (MEE)');
  eq('Separation', 'column', 'Distillation column (tray)', 'column', 36, 150, 'C', 'consumer', 'Distillation Column (Tray / Packed)');
  eq('Separation', 'pcolumn', 'Packed column', 'packed', 36, 150, 'C', 'consumer', 'Distillation Column (Tray / Packed)');
  eq('Separation', 'scrubber', 'Absorber / scrubber', 'scrubber', 40, 130, 'SC', 'consumer', 'Absorber / Scrubber');
  eq('Separation', 'extractor', 'Liquid-liquid extraction column', 'extractor', 36, 140, 'C', 'consumer', 'Liquid-Liquid Extraction');
  eq('Separation', 'decanter', 'Liquid-liquid separator / decanter', 'decanter', 110, 44, 'V', 'consumer', 'Liquid-Liquid Separator / Decanter');
  eq('Separation', 'crystallizer', 'Crystallizer', 'cryst', 60, 92, 'CR', 'consumer', 'Crystallizer');
  eq('Separation', 'centrifuge', 'Centrifuge (basket / peeler)', 'centrifuge', 72, 60, 'CF', 'consumer', 'Centrifuge (Basket / Peeler / Decanter)');
  eq('Separation', 'anfd', 'Agitated Nutsche filter dryer (ANFD)', 'anfd', 70, 84, 'NF', 'consumer', 'Agitated Nutsche Filter Dryer (ANFD)');
  eq('Separation', 'fpress', 'Filter press', 'fpress', 100, 50, 'FP', 'consumer', 'Filter Press / Plate and Frame');
  eq('Separation', 'cfilter', 'Cartridge / bag / sparkler filter', 'cfilter', 30, 56, 'F', 'consumer', 'Cartridge / Bag / Sparkler Filter');
  eq('Separation', 'membrane', 'Membrane (RO / UF / NF)', 'membrane', 90, 30, 'M', 'consumer', 'Membrane Separation (RO / UF / NF)');
  eq('Separation', 'carbon', 'Activated carbon adsorber', 'adsorb', 40, 90, 'AD', 'consumer', 'Activated Carbon Adsorber');
  eq('Drying', 'traydryer', 'Tray dryer', 'tray', 70, 80, 'D', 'consumer', 'Tray Dryer');
  eq('Drying', 'fbd', 'Fluid bed dryer (FBD)', 'fbd', 60, 92, 'D', 'consumer', 'Fluid Bed Dryer (FBD)');
  eq('Drying', 'rcvd', 'Rotocone vacuum dryer (RCVD)', 'rcvd', 72, 72, 'D', 'consumer', 'Rotocone Vacuum Dryer (RCVD)');
  eq('Drying', 'spray', 'Spray dryer', 'spray', 60, 110, 'D', 'consumer', 'Spray Dryer');
  eq('Solids handling', 'mill', 'Mill (multi-mill / pulveriser / jet)', 'mill', 50, 50, 'ML', 'consumer', 'Mills (Multi-mill / Pulveriser / Jet Mill)');
  eq('Solids handling', 'sifter', 'Vibro sifter', 'sifter', 56, 44, 'SF', 'consumer', 'Vibro Sifter');
  eq('Solids handling', 'blender', 'Blender (ribbon / double cone / V)', 'blender', 80, 50, 'BL', 'consumer', 'Blenders (Ribbon / Double Cone / V)');
  eq('Vacuum & compressors', 'lrvp', 'Liquid-ring vacuum pump', 'lrvp', 46, 46, 'VP', 'consumer', 'Liquid-ring Vacuum Pump');
  eq('Vacuum & compressors', 'dryvac', 'Dry screw vacuum pump', 'dryvac', 56, 40, 'VP', 'consumer', 'Dry Screw Vacuum Pump');
  eq('Vacuum & compressors', 'ejector', 'Steam ejector', 'ejector', 70, 26, 'EJ', 'consumer', 'Steam Ejector');
  eq('Vacuum & compressors', 'compressor', 'Air compressor (screw / recip.)', 'compressor', 54, 54, 'K', 'source', 'Air Compressor (Screw / Reciprocating)');
  eq('Utilities & ETP', 'n2gen', 'Nitrogen generator (PSA)', 'psa', 70, 80, 'NG', 'source', 'Nitrogen Generator (PSA)');
  eq('Utilities & ETP', 'dm', 'DM plant (cation / anion)', 'dm', 80, 80, 'DM', 'source', 'DM Plant (Ion Exchange)');
  eq('Utilities & ETP', 'clarifier', 'Clarifier / primary settling', 'clarifier', 110, 50, 'CL', 'consumer', 'ETP Clarifier / Primary Settling');
  eq('Utilities & ETP', 'aeration', 'Aeration tank (activated sludge)', 'aeration', 110, 50, 'AT', 'consumer', 'Activated Sludge (Aeration) Tank');
  eq('Connections', 'header', 'Header', 'header', 130, 16, 'H', 'source');
  eq('Connections', 'user', 'Utility user', 'user', 46, 46, 'U', 'consumer');
  eq('Connections', 'opc', 'Off-page / battery-limit connector', 'opc', 120, 22, 'OPC', 'junction');
  eq('Connections', 'junction', 'Junction / tee', 'junction', 8, 8, 'J', 'junction');
  E.nozzle = { n: 'Nozzle', cat: '', d: 'nozzle', w: 6, h: 6, pre: 'N', type: 'junction', hide: true };

  /* in-line items that live in the engine (LNE.ITEMS): link to the Equipment tab and a drawer category */
  const ITEMLINK = { pump: 'Centrifugal Pump', aodd: 'Diaphragm Pump (AODD)', gear: 'Gear Pump (Positive Displacement)', blower: 'Roots Blower', trap: 'Steam Trap and Condensate System',
    flamearr: 'Flame Arrestor and Breather Valve', breather: 'Flame Arrestor and Breather Valve', filter: 'Cartridge / Bag / Sparkler Filter', hx: 'Shell and Tube Heat Exchanger' };
  Object.keys(ITEMLINK).forEach(k => ITEMLINK[k] = slug(ITEMLINK[k]));
  const ITEMCAT = { pump: 'Pumps & blowers', aodd: 'Pumps & blowers', gear: 'Pumps & blowers', blower: 'Pumps & blowers' };

  /* instruments (ISA 5.1 letters) */
  const INST = { PI: 'Pressure gauge', PT: 'Pressure transmitter', PIC: 'Pressure controller', PS: 'Pressure switch', PSH: 'Pressure switch high', PSL: 'Pressure switch low', PDT: 'Differential pressure transmitter', PDI: 'Differential pressure gauge',
    TI: 'Temperature gauge', TE: 'Temperature element', TT: 'Temperature transmitter', TIC: 'Temperature controller', TSH: 'Temperature switch high', TW: 'Thermowell',
    LI: 'Level indicator', LG: 'Level gauge glass', LT: 'Level transmitter', LIC: 'Level controller', LSH: 'Level switch high', LSL: 'Level switch low',
    FI: 'Flow indicator', FT: 'Flow transmitter', FIC: 'Flow controller', FQ: 'Flow totaliser', FG: 'Flow sight glass', FS: 'Flow switch',
    AE: 'Analyser element', AT: 'Analyser transmitter (pH / conductivity / O₂)', AIC: 'Analyser controller', WT: 'Load cell / weight transmitter', SI: 'Speed indicator', IT: 'Motor current transmitter',
    VT: 'Vibration transmitter', ZS: 'Position (limit) switch', HS: 'Hand switch', PSV: 'Pressure safety valve', RD: 'Rupture disc', VB: 'Vacuum breaker' };

  /* line services: code -> name, utility used for sizing, colour, material/schedule, shown on the PFD */
  const SERVICES = {
    PRC: { n: 'Process liquid', u: 'liq', col: '#E6C35C', mat: 'ss', sch: '10S', pfd: 1 },
    SOL: { n: 'Solvent', u: 'liq', col: '#F0A35E', mat: 'ss', sch: '10S', pfd: 1, rho: 790, mu: 0.00055 },
    ML: { n: 'Mother liquor', u: 'liq', col: '#D98E4C', mat: 'ss', sch: '10S', pfd: 1, rho: 1050, mu: 0.0012 },
    SLR: { n: 'Slurry', u: 'liq', col: '#C77F59', mat: 'ss', sch: '10S', pfd: 1, rho: 1150, mu: 0.004 },
    PV: { n: 'Process vapour', u: 'gas', col: '#E7D9A8', mat: 'ss', sch: '10S', pfd: 1 },
    SLD: { n: 'Solids transfer (manual / conveyor)', u: 'liq', col: '#B9A27A', mat: 'ss', sch: '10S', pfd: 1, dash: 1, ns: 1 },
    CWS: { n: 'Cooling water supply', u: 'cw', col: '#3E8ED0', mat: 'cs', sch: '40' },
    CWR: { n: 'Cooling water return', u: 'cw', col: '#2F6EA6', mat: 'cs', sch: '40', T: 38 },
    CHS: { n: 'Chilled water supply', u: 'chw', col: '#5AA9E6', mat: 'cs', sch: '40' },
    CHR: { n: 'Chilled water return', u: 'chw', col: '#4A88BA', mat: 'cs', sch: '40', T: 12 },
    BRS: { n: 'Brine supply', u: 'brine', col: '#8C7BE0', mat: 'cs', sch: '40' },
    BRR: { n: 'Brine return', u: 'brine', col: '#6E5FB8', mat: 'cs', sch: '40' },
    HWS: { n: 'Hot water supply', u: 'pw', col: '#E57E7E', mat: 'cs', sch: '40', T: 80 },
    HWR: { n: 'Hot water return', u: 'pw', col: '#B86464', mat: 'cs', sch: '40', T: 65 },
    STM: { n: 'Steam', u: 'steam', col: '#D9534F', mat: 'cs', sch: '40' },
    CND: { n: 'Condensate', u: 'cond', col: '#E8915A', mat: 'cs', sch: '80' },
    TF: { n: 'Thermic fluid', u: 'liq', col: '#C2185B', mat: 'cs', sch: '40', rho: 820, mu: 0.0012, T: 250 },
    PW: { n: 'Process / soft water', u: 'pw', col: '#4CC0DF', mat: 'ss', sch: '10S' },
    DMW: { n: 'DM water', u: 'pw', col: '#6AD3E8', mat: 'ss', sch: '10S' },
    RW: { n: 'Raw water', u: 'pw', col: '#7FB3C8', mat: 'cs', sch: '40' },
    N2: { n: 'Nitrogen', u: 'n2', col: '#6FBF73', mat: 'ss', sch: '10S' },
    IA: { n: 'Instrument air', u: 'air', col: '#9BB0C1', mat: 'gi', sch: '40' },
    PA: { n: 'Plant air', u: 'air', col: '#7F96A8', mat: 'gi', sch: '40' },
    VAC: { n: 'Vacuum', u: 'air', col: '#A58BC9', mat: 'ss', sch: '10S' },
    VNT: { n: 'Vent', u: 'air', col: '#8E9AA8', mat: 'ss', sch: '10S' },
    DRN: { n: 'Drain', u: 'pw', col: '#6F7F8F', mat: 'cs', sch: '40' },
    EFF: { n: 'Effluent', u: 'pw', col: '#8B9A5B', mat: 'plastic', sch: '40' }
  };

  /* ---------- drawing helpers ---------- */
  function vess(c, w, h) { const e = Math.min(w / 4, h / 4); c.beginPath(); c.moveTo(-w / 2, -h / 2 + e); c.ellipse(0, -h / 2 + e, w / 2, e, 0, Math.PI, 0); c.lineTo(w / 2, h / 2 - e); c.ellipse(0, h / 2 - e, w / 2, e, 0, 0, Math.PI); c.closePath(); }
  function hvess(c, w, h) { const e = Math.min(h / 4, w / 4); c.beginPath(); c.moveTo(-w / 2 + e, -h / 2); c.lineTo(w / 2 - e, -h / 2); c.ellipse(w / 2 - e, 0, e, h / 2, 0, -Math.PI / 2, Math.PI / 2); c.lineTo(-w / 2 + e, h / 2); c.ellipse(-w / 2 + e, 0, e, h / 2, 0, Math.PI / 2, Math.PI * 1.5); c.closePath(); }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function fs(c) { c.fill(); c.stroke(); }
  function line(c, pts) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); }
  function motor(c, x, y, k) { c.beginPath(); c.arc(x, y, 7 * k, 0, 7); fs(c); txt(c, 'M', x, y, 8 * k); }
  function txt(c, t, x, y, sz, ink) { c.save(); if (ink) c.fillStyle = ink; else c.fillStyle = c.strokeStyle; c.font = '700 ' + Math.max(6, sz) + 'px IBM Plex Sans, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, x, y + .5); c.restore(); }
  function agit(c, h, w, k) { line(c, [[0, -h / 2 - 12 * k], [0, h / 4]]); line(c, [[-w / 4, h / 4 - 4 * k], [w / 4, h / 4 + 4 * k]]); line(c, [[-w / 4, h / 4 + 4 * k], [w / 4, h / 4 - 4 * k]]); motor(c, 0, -h / 2 - 18 * k, k); }
  function tubes(c, x0, x1, n, h) { c.beginPath(); for (let i = 1; i <= n; i++) { const y = -h / 2 + i * h / (n + 1); c.moveTo(x0, y); c.lineTo(x1, y); } c.stroke(); }

  /* each drawer gets (c, w, h, k) at the symbol centre, stroke and fill already set */
  const D = {
    tank(c, w, h, k) { c.beginPath(); c.moveTo(-w / 2, -h / 2 + 10 * k); c.lineTo(0, -h / 2 - 4 * k); c.lineTo(w / 2, -h / 2 + 10 * k); c.lineTo(w / 2, h / 2); c.lineTo(-w / 2, h / 2); c.closePath(); fs(c); },
    vessel(c, w, h) { vess(c, w, h); fs(c); },
    hvessel(c, w, h, k) { hvess(c, w, h); fs(c); line(c, [[-w / 4, h / 2], [-w / 4, h / 2 + 8 * k]]); line(c, [[w / 4, h / 2], [w / 4, h / 2 + 8 * k]]); },
    sump(c, w, h, k) { c.save(); c.setLineDash([5 * k, 3 * k]); line(c, [[-w / 2 - 10 * k, -h / 2], [w / 2 + 10 * k, -h / 2]]); c.restore(); c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(-w / 2, h / 2); c.lineTo(w / 2, h / 2); c.lineTo(w / 2, -h / 2); fs(c);
      c.save(); c.setLineDash([2 * k, 3 * k]); line(c, [[-w / 2 + 4 * k, -h / 6], [w / 2 - 4 * k, -h / 6]]); c.restore(); },
    reactor(c, w, h, k) { vess(c, w, h); fs(c); c.beginPath(); c.moveTo(-w / 2 - 5 * k, -h / 6); c.lineTo(-w / 2 - 5 * k, h / 2 - w / 4); c.ellipse(0, h / 2 - w / 4, w / 2 + 5 * k, w / 4 + 5 * k, 0, Math.PI, 0, true); c.lineTo(w / 2 + 5 * k, -h / 6); c.stroke(); agit(c, h, w, k); },
    autoclave(c, w, h, k) { vess(c, w, h); fs(c); vess(c, w - 6 * k, h - 6 * k); c.stroke(); agit(c, h, w, k); txt(c, 'H₂', w / 2 - 12 * k, -h / 2 + 16 * k, 8 * k); },
    jvessel(c, w, h, k) { vess(c, w, h); fs(c); c.beginPath(); for (let i = 0; i < 6; i++) { const y = -h / 6 + i * h / 10; c.moveTo(-w / 2 - 5 * k, y); c.arc(-w / 2 - 5 * k, y + h / 40, h / 40, -Math.PI / 2, Math.PI / 2); } c.stroke(); },
    pfr(c, w, h, k) { rr(c, -w / 2, -h / 2, w, h, h / 2); fs(c); line(c, [[-w / 2 + h / 2, 0], [-w / 4, -h / 3], [-w / 12, h / 3], [w / 12, -h / 3], [w / 4, h / 3], [w / 2 - h / 2, 0]]); },
    packed(c, w, h, k) { vess(c, w, h); fs(c); const y0 = -h / 4, y1 = h / 4; line(c, [[-w / 2, y0], [w / 2, y0]]); line(c, [[-w / 2, y1], [w / 2, y1]]); line(c, [[-w / 2, y0], [w / 2, y1]]); line(c, [[w / 2, y0], [-w / 2, y1]]); },
    hx(c, w, h, k) { rr(c, -w / 2, -h / 2, w, h, h / 2); fs(c); tubes(c, -w / 2 + h / 2, w / 2 - h / 2, 3, h); line(c, [[-w / 2 + h / 2, -h / 2], [-w / 2 + h / 2, h / 2]]); line(c, [[w / 2 - h / 2, -h / 2], [w / 2 - h / 2, h / 2]]); },
    vhx(c, w, h, k) { rr(c, -w / 2, -h / 2, w, h, w / 2); fs(c); c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(i * w / 5, -h / 2 + w / 2); c.lineTo(i * w / 5, h / 2 - w / 2); } c.stroke(); },
    phe(c, w, h, k) { c.beginPath(); c.rect(-w / 2, -h / 2, w, h); fs(c); c.beginPath(); for (let i = 1; i < 6; i++) { const x = -w / 2 + i * w / 6; c.moveTo(x, -h / 2 + 5 * k); c.lineTo(x, h / 2 - 5 * k); } c.stroke(); },
    kettle(c, w, h, k) { c.beginPath(); c.moveTo(-w / 2, -h / 6); c.lineTo(-w / 6, -h / 6); c.lineTo(0, -h / 2); c.lineTo(w / 2 - h / 4, -h / 2); c.ellipse(w / 2 - h / 4, 0, h / 4, h / 2, 0, -Math.PI / 2, Math.PI / 2); c.lineTo(-w / 2, h / 2); c.closePath(); fs(c); tubes(c, -w / 2 + 6 * k, w / 2 - 14 * k, 2, h * .5); },
    ct(c, w, h, k) { c.beginPath(); c.moveTo(-w / 2, h / 2); c.lineTo(-w / 3, -h / 2); c.lineTo(w / 3, -h / 2); c.lineTo(w / 2, h / 2); c.closePath(); fs(c); c.beginPath(); c.ellipse(0, -h / 2 - 5 * k, w / 4, 5 * k, 0, 0, 7); c.stroke();
      c.save(); c.setLineDash([3 * k, 3 * k]); line(c, [[-w / 2 + 8 * k, h / 6], [w / 2 - 8 * k, h / 6]]); c.restore(); },
    chiller(c, w, h, k) { c.beginPath(); c.rect(-w / 2, -h / 2, w, h); fs(c); c.beginPath(); c.arc(-w / 5, 0, h / 4, 0, 7); c.stroke(); line(c, [[w / 12, -h / 4], [w / 2 - 8 * k, -h / 4]]); line(c, [[w / 12, h / 4], [w / 2 - 8 * k, h / 4]]); txt(c, 'C', -w / 5, 0, 9 * k); },
    boiler(c, w, h, k) { c.beginPath(); c.rect(-w / 2, -h / 2, w, h); fs(c); c.beginPath(); c.moveTo(-10 * k, h / 2 - 6 * k); c.quadraticCurveTo(-12 * k, -2 * k, 0, -h / 4); c.quadraticCurveTo(12 * k, -2 * k, 10 * k, h / 2 - 6 * k); c.stroke(); },
    tfh(c, w, h, k) { c.beginPath(); c.rect(-w / 2, -h / 2, w, h); fs(c); c.beginPath(); for (let i = 0; i < 4; i++) { const y = -h / 3 + i * h / 6; c.moveTo(-w / 3, y); c.lineTo(w / 3, y + h / 12); } c.stroke(); line(c, [[-6 * k, h / 2 - 4 * k], [0, h / 2 - 14 * k], [6 * k, h / 2 - 4 * k]]); },
    evap(c, w, h, k) { vess(c, w, h); fs(c); c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(i * w / 5, -h / 2 + w / 2); c.lineTo(i * w / 5, h / 6); } c.stroke(); line(c, [[-w / 2, h / 6], [w / 2, h / 6]]); },
    atfe(c, w, h, k) { vess(c, w, h); fs(c); line(c, [[0, -h / 2 - 10 * k], [0, h / 2 - w / 2]]); for (let i = 0; i < 5; i++) { const y = -h / 3 + i * h / 7; line(c, [[-w / 3, y], [w / 3, y]]); } motor(c, 0, -h / 2 - 16 * k, k); },
    mee(c, w, h, k) { for (let i = -1; i <= 1; i++) { c.save(); c.translate(i * w / 3, 0); vess(c, w / 4, h); fs(c); c.beginPath(); c.moveTo(-w / 16, -h / 4); c.lineTo(-w / 16, h / 8); c.moveTo(w / 16, -h / 4); c.lineTo(w / 16, h / 8); c.stroke(); c.restore(); }
      c.save(); c.setLineDash([3 * k, 2 * k]); line(c, [[-w / 3 + w / 8, -h / 3], [-w / 8, -h / 3]]); line(c, [[w / 8, -h / 3], [w / 3 - w / 8, -h / 3]]); c.restore(); },
    column(c, w, h, k) { vess(c, w, h); fs(c); for (let i = 1; i < 8; i++) { const y = -h / 2 + w / 3 + i * (h - w / 1.5) / 8; line(c, [[i % 2 ? -w / 2 : -w / 2 + 6 * k, y], [i % 2 ? w / 2 - 6 * k : w / 2, y]]); } },
    scrubber(c, w, h, k) { vess(c, w, h); fs(c); line(c, [[-w / 2, -h / 8], [w / 2, -h / 8]]); line(c, [[-w / 2, h / 4], [w / 2, h / 4]]); line(c, [[-w / 2, -h / 8], [w / 2, h / 4]]); line(c, [[w / 2, -h / 8], [-w / 2, h / 4]]);
      line(c, [[-w / 3, -h / 3], [w / 3, -h / 3]]); for (let i = -1; i <= 1; i++) line(c, [[i * w / 4, -h / 3], [i * w / 4 - 3 * k, -h / 3 + 7 * k]]); },
    extractor(c, w, h, k) { vess(c, w, h); fs(c); line(c, [[0, -h / 2 - 10 * k], [0, h / 2 - w / 2]]); for (let i = 0; i < 6; i++) { const y = -h / 3 + i * h / 9; line(c, [[-w / 4, y], [w / 4, y]]); } motor(c, 0, -h / 2 - 16 * k, k); },
    decanter(c, w, h, k) { hvess(c, w, h); fs(c); line(c, [[w / 6, h / 2], [w / 6, -h / 8]]); c.save(); c.setLineDash([3 * k, 3 * k]); line(c, [[-w / 2 + 8 * k, 0], [w / 6, 0]]); c.restore(); },
    cryst(c, w, h, k) { c.beginPath(); c.moveTo(-w / 2, -h / 2 + 8 * k); c.ellipse(0, -h / 2 + 8 * k, w / 2, 8 * k, 0, Math.PI, 0); c.lineTo(w / 2, h / 6); c.lineTo(8 * k, h / 2); c.lineTo(-8 * k, h / 2); c.lineTo(-w / 2, h / 6); c.closePath(); fs(c); agit(c, h, w, k); },
    centrifuge(c, w, h, k) { c.beginPath(); c.rect(-w / 2, -h / 2, w, h); fs(c); c.beginPath(); c.rect(-w / 3, -h / 3, w * 2 / 3, h * 2 / 3); c.stroke(); c.save(); c.setLineDash([2 * k, 2 * k]); c.beginPath(); c.rect(-w / 3 + 4 * k, -h / 3 + 4 * k, w * 2 / 3 - 8 * k, h * 2 / 3 - 8 * k); c.stroke(); c.restore();
      line(c, [[0, h / 3], [0, h / 2 + 8 * k]]); motor(c, 0, h / 2 + 14 * k, k); },
    anfd(c, w, h, k) { vess(c, w, h); fs(c); c.save(); c.setLineDash([3 * k, 2 * k]); line(c, [[-w / 2, h / 4], [w / 2, h / 4]]); c.restore(); line(c, [[0, -h / 2 - 12 * k], [0, h / 6]]); line(c, [[-w / 3, h / 6], [w / 3, h / 6]]); motor(c, 0, -h / 2 - 18 * k, k); },
    fpress(c, w, h, k) { c.beginPath(); c.rect(-w / 2, -h / 2, w, h); fs(c); c.beginPath(); for (let i = 1; i < 10; i++) { const x = -w / 2 + i * w / 10; c.moveTo(x, -h / 2); c.lineTo(x, h / 2); } c.stroke(); line(c, [[-w / 2 - 6 * k, -h / 2 - 4 * k], [w / 2 + 6 * k, -h / 2 - 4 * k]]); },
    cfilter(c, w, h, k) { vess(c, w, h); fs(c); c.save(); c.setLineDash([3 * k, 2 * k]); line(c, [[-w / 6, -h / 4], [-w / 6, h / 4]]); line(c, [[w / 6, -h / 4], [w / 6, h / 4]]); c.restore(); },
    membrane(c, w, h, k) { rr(c, -w / 2, -h / 2, w, h, h / 2); fs(c); c.save(); c.setLineDash([4 * k, 3 * k]); line(c, [[-w / 2 + h / 2, 0], [w / 2 - h / 2, 0]]); c.restore(); },
    adsorb(c, w, h, k) { vess(c, w, h); fs(c); c.save(); c.fillStyle = c.strokeStyle; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(((i % 3) - 1) * w / 4, -h / 5 + Math.floor(i / 3) * h / 10, 1.6 * k, 0, 7); c.fill(); } c.restore(); },
    tray(c, w, h, k) { c.beginPath(); c.rect(-w / 2, -h / 2, w, h); fs(c); for (let i = 1; i < 6; i++) line(c, [[-w / 2 + 6 * k, -h / 2 + i * h / 6], [w / 2 - 6 * k, -h / 2 + i * h / 6]]); },
    fbd(c, w, h, k) { c.beginPath(); c.moveTo(-w / 3, h / 2); c.lineTo(-w / 2, h / 6); c.lineTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2, h / 6); c.lineTo(w / 3, h / 2); c.closePath(); fs(c); c.save(); c.setLineDash([3 * k, 2 * k]); line(c, [[-w / 2, h / 6], [w / 2, h / 6]]); line(c, [[-w / 2, -h / 4], [w / 2, -h / 4]]); c.restore(); },
    rcvd(c, w, h, k) { c.beginPath(); c.moveTo(0, -h / 2); c.lineTo(w / 2, 0); c.lineTo(0, h / 2); c.lineTo(-w / 2, 0); c.closePath(); fs(c); line(c, [[-w / 2 - 8 * k, 0], [w / 2 + 8 * k, 0]]); },
    spray(c, w, h, k) { c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2, h / 8); c.lineTo(6 * k, h / 2); c.lineTo(-6 * k, h / 2); c.lineTo(-w / 2, h / 8); c.closePath(); fs(c); line(c, [[0, -h / 2], [0, -h / 3]]); line(c, [[-6 * k, -h / 3 + 8 * k], [0, -h / 3], [6 * k, -h / 3 + 8 * k]]); },
    mill(c, w, h, k) { c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2); c.lineTo(w / 4, h / 2); c.lineTo(-w / 4, h / 2); c.closePath(); fs(c); c.beginPath(); c.arc(0, 0, w / 6, 0, 7); c.stroke(); line(c, [[-w / 6, -w / 6], [w / 6, w / 6]]); line(c, [[w / 6, -w / 6], [-w / 6, w / 6]]); },
    sifter(c, w, h, k) { c.beginPath(); c.rect(-w / 2, -h / 2, w, h); fs(c); c.save(); c.setLineDash([2 * k, 2 * k]); line(c, [[-w / 2, -h / 8], [w / 2, -h / 8]]); line(c, [[-w / 2, h / 6], [w / 2, h / 6]]); c.restore(); line(c, [[-w / 3, h / 2], [-w / 3 - 4 * k, h / 2 + 6 * k]]); line(c, [[w / 3, h / 2], [w / 3 + 4 * k, h / 2 + 6 * k]]); },
    blender(c, w, h, k) { c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(0, h / 2); c.lineTo(w / 2, -h / 2); c.stroke(); c.beginPath(); c.moveTo(-w / 2 + 8 * k, -h / 2); c.lineTo(0, h / 2 - 12 * k); c.lineTo(w / 2 - 8 * k, -h / 2); c.stroke(); line(c, [[-w / 2, -h / 2], [-w / 2 + 8 * k, -h / 2]]); line(c, [[w / 2, -h / 2], [w / 2 - 8 * k, -h / 2]]); line(c, [[-w / 2 - 4 * k, h / 6], [w / 2 + 4 * k, h / 6]]); },
    lrvp(c, w, h, k) { c.beginPath(); c.arc(0, 0, w / 2, 0, 7); fs(c); c.beginPath(); c.arc(w / 12, 0, w / 4, 0, 7); c.stroke(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; line(c, [[w / 12, 0], [w / 12 + Math.cos(a) * w / 4, Math.sin(a) * w / 4]]); } },
    dryvac(c, w, h, k) { rr(c, -w / 2, -h / 2, w, h, 6 * k); fs(c); c.beginPath(); for (let i = 0; i < 4; i++) { const x = -w / 3 + i * w / 5; c.moveTo(x, -h / 3); c.lineTo(x + w / 10, h / 3); } c.stroke(); },
    ejector(c, w, h, k) { c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(-w / 8, -h / 6); c.lineTo(w / 8, -h / 6); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2, h / 2); c.lineTo(w / 8, h / 6); c.lineTo(-w / 8, h / 6); c.lineTo(-w / 2, h / 2); c.closePath(); fs(c); line(c, [[0, -h / 6], [0, -h / 2 - 8 * k]]); },
    compressor(c, w, h, k) { c.beginPath(); c.arc(0, 0, w / 2, 0, 7); fs(c); line(c, [[-w / 2 + 4 * k, -h / 4], [w / 2 - 4 * k, -h / 8]]); line(c, [[-w / 2 + 4 * k, h / 4], [w / 2 - 4 * k, h / 8]]); },
    psa(c, w, h, k) { for (let i = -1; i <= 1; i += 2) { c.save(); c.translate(i * w / 4, 0); vess(c, w / 3, h); fs(c); c.save(); c.setLineDash([2 * k, 2 * k]); line(c, [[-w / 8, -h / 4], [w / 8, h / 4]]); c.restore(); c.restore(); } txt(c, 'PSA', 0, h / 2 + 8 * k, 8 * k); },
    dm(c, w, h, k) { for (let i = -1; i <= 1; i += 2) { c.save(); c.translate(i * w / 4, 0); vess(c, w / 3, h); fs(c); c.restore(); } txt(c, 'C', -w / 4, 0, 9 * k); txt(c, 'A', w / 4, 0, 9 * k); },
    clarifier(c, w, h, k) { c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(-w / 2, h / 6); c.lineTo(0, h / 2); c.lineTo(w / 2, h / 6); c.lineTo(w / 2, -h / 2); fs(c); line(c, [[-w / 6, -h / 2], [-w / 6, -h / 8]]); line(c, [[w / 6, -h / 2], [w / 6, -h / 8]]); line(c, [[0, -h / 2 - 6 * k], [0, h / 3]]); },
    aeration(c, w, h, k) { c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(-w / 2, h / 2); c.lineTo(w / 2, h / 2); c.lineTo(w / 2, -h / 2); fs(c); line(c, [[-w / 2 + 8 * k, h / 2 - 8 * k], [w / 2 - 8 * k, h / 2 - 8 * k]]); for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-w / 2 + 14 * k + i * (w - 28 * k) / 6, h / 2 - 18 * k - (i % 2) * 8 * k, 2.5 * k, 0, 7); c.stroke(); } },
    header(c, w, h) { rr(c, -w / 2, -h / 2, w, h, h / 2); fs(c); },
    user(c, w) { c.beginPath(); c.arc(0, 0, w / 2, 0, 7); fs(c); },
    opc(c, w, h) { c.beginPath(); c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2 - h / 2, -h / 2); c.lineTo(w / 2, 0); c.lineTo(w / 2 - h / 2, h / 2); c.lineTo(-w / 2, h / 2); c.closePath(); fs(c); },
    junction(c, w, h, k) { c.fillStyle = c.strokeStyle; c.beginPath(); c.arc(0, 0, Math.max(2.5, 3.5 * k), 0, 7); c.fill(); },
    nozzle(c, w, h, k) { c.fillStyle = c.strokeStyle; c.fillRect(-2 * k, -2 * k, 4 * k, 4 * k); }
  };
  function drawEq(c, sym, x, y, k, ink, fill, label) {
    const S = E[sym] || E.user, w = S.w * k, h = S.h * k; c.save(); c.translate(x, y); c.lineWidth = Math.max(1.1, 1.6 * k); c.strokeStyle = ink; c.fillStyle = fill; c.lineJoin = 'round';
    (D[S.d] || D.user)(c, w, h, k);
    if (sym === 'opc' && label) { let sz = 10 * k; c.font = '700 ' + sz + 'px IBM Plex Sans, sans-serif'; const room = w - h * .7 - 8 * k; while (sz > 5 && c.measureText(label).width > room) { sz -= .5; c.font = '700 ' + sz + 'px IBM Plex Sans, sans-serif'; } txt(c, label, -h * .35 / 2, 0, sz, ink); }
    c.restore(); }

  /* in-line items: valves, pumps, strainers… drawn along the pipe direction */
  function drawItem(c, kind, x, y, ang, k, ink, fill) {
    const s = 9 * k; c.save(); c.translate(x, y); c.rotate(ang); c.lineWidth = Math.max(1.1, 1.5 * k); c.strokeStyle = ink; c.fillStyle = fill; c.lineJoin = 'round';
    const bow = f => { c.beginPath(); c.moveTo(-s, -s * .6); c.lineTo(s, s * .6); c.lineTo(s, -s * .6); c.lineTo(-s, s * .6); c.closePath(); c.fillStyle = f || fill; c.fill(); c.stroke(); };
    const act = (t) => { line(c, [[0, 0], [0, -s * 1.3]]); c.beginPath(); c.rect(-s * .6, -s * 2.1, s * 1.2, s * .8); c.fillStyle = fill; c.fill(); c.stroke(); if (t) { c.save(); c.rotate(-ang); c.restore(); } };
    c.fillStyle = fill; c.fillRect(-s * 1.2, -2 * k, s * 2.4, 4 * k);
    if (['gate', 'globe', 'ball', 'plug', 'diaphragm', 'needle'].includes(kind)) { bow();
      if (kind === 'globe') { c.fillStyle = ink; c.beginPath(); c.arc(0, 0, s * .28, 0, 7); c.fill(); }
      if (kind === 'ball') { c.beginPath(); c.arc(0, 0, s * .38, 0, 7); c.fillStyle = fill; c.fill(); c.stroke(); }
      if (kind === 'plug') { c.fillStyle = ink; c.fillRect(-s * .22, -s * .22, s * .44, s * .44); }
      if (kind === 'diaphragm') { c.beginPath(); c.arc(0, -s * .6, s * .5, Math.PI, 0); c.stroke(); }
      if (kind === 'needle') line(c, [[0, -s * .6], [0, -s * 1.3]]), line(c, [[-s * .4, -s * 1.3], [s * .4, -s * 1.3]]); }
    else if (kind === 'butterfly') { line(c, [[-s * .5, -s * .8], [-s * .5, s * .8]]); line(c, [[s * .5, -s * .8], [s * .5, s * .8]]); line(c, [[-s * .5, s * .5], [s * .5, -s * .5]]); c.beginPath(); c.arc(0, 0, s * .2, 0, 7); c.fillStyle = ink; c.fill(); }
    else if (kind === 'check') { bow(); c.beginPath(); c.moveTo(-s, -s * .6); c.lineTo(0, 0); c.lineTo(-s, s * .6); c.closePath(); c.fillStyle = ink; c.fill(); }
    else if (kind === 'cv' || kind === 'prv') { bow(); line(c, [[0, 0], [0, -s * 1.3]]);
      if (kind === 'cv') { c.beginPath(); c.arc(0, -s * 1.3, s * .75, Math.PI, 0); c.closePath(); c.fillStyle = fill; c.fill(); c.stroke(); }
      else { c.beginPath(); for (let i = 0; i < 5; i++) c.lineTo((i % 2 ? 1 : -1) * s * .4, -s * (.8 + i * .2)); c.stroke(); } }
    else if (kind === 'onoff' || kind === 'solenoid') { bow(); act(); c.save(); c.translate(0, -s * 1.7); c.rotate(-ang); txt(c, kind === 'onoff' ? 'XV' : 'S', 0, 0, 6.5 * k, ink); c.restore(); }
    else if (kind === 'strainer') { line(c, [[-s, 0], [s, 0]]); line(c, [[-s * .3, 0], [s * .4, s * 1.1]]); c.strokeRect(s * .15, s * .9, s * .6, s * .5); }
    else if (kind === 'fe') { line(c, [[-s * .15, -s * .9], [-s * .15, s * .9]]); line(c, [[s * .15, -s * .9], [s * .15, s * .9]]); }
    else if (kind === 'fm' || kind === 'trap' || kind === 'sg' || kind === 'flamearr') { c.beginPath(); c.rect(-s * .9, -s * .7, s * 1.8, s * 1.4); c.fill(); c.stroke();
      if (kind === 'flamearr') { c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(i * s * .4 - s * .2, -s * .7); c.lineTo(i * s * .4 + s * .2, s * .7); } c.stroke(); }
      else { c.save(); c.rotate(-ang); txt(c, kind === 'fm' ? 'M' : kind === 'trap' ? 'T' : 'SG', 0, 0, 8.5 * k, ink); c.restore(); } }
    else if (kind === 'rotameter') { c.beginPath(); c.moveTo(-s * .9, -s * .4); c.lineTo(s * .9, -s * .8); c.lineTo(s * .9, s * .8); c.lineTo(-s * .9, s * .4); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.arc(0, 0, s * .2, 0, 7); c.fillStyle = ink; c.fill(); }
    else if (kind === 'breather') { bow(); line(c, [[0, 0], [0, -s * 1.2]]); line(c, [[-s * .5, -s * 1.2], [s * .5, -s * 1.2]]); line(c, [[-s * .5, -s * 1.5], [s * .5, -s * 1.5]]); }
    else if (kind === 'filter') { c.beginPath(); c.rect(-s, -s * .8, s * 2, s * 1.6); c.fill(); c.stroke(); c.setLineDash([3 * k, 2 * k]); line(c, [[-s, s * .8], [s, -s * .8]]); c.setLineDash([]); }
    else if (kind === 'hx') { c.beginPath(); c.arc(0, 0, s, 0, 7); c.fill(); c.stroke(); line(c, [[-s, 0], [-s * .5, -s * .5], [0, s * .5], [s * .5, -s * .5], [s, 0]]); }
    else if (kind === 'pump' || kind === 'blower' || kind === 'aodd' || kind === 'gear') { c.rotate(-ang); const r = s * 1.2; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke();
      if (kind === 'pump') { line(c, [[0, -r], [r, -r]]); line(c, [[-r * .7, r * .7], [-r, r * 1.3], [r, r * 1.3], [r * .7, r * .7]]); }
      else if (kind === 'aodd') { line(c, [[0, -r], [0, r]]); c.beginPath(); c.arc(-r * .2, 0, r * .55, -Math.PI / 2, Math.PI / 2); c.stroke(); c.beginPath(); c.arc(r * .2, 0, r * .55, Math.PI / 2, Math.PI * 1.5); c.stroke(); line(c, [[-r * .7, r * .7], [-r, r * 1.3], [r, r * 1.3], [r * .7, r * .7]]); }
      else if (kind === 'gear') { c.beginPath(); c.arc(-r * .32, 0, r * .36, 0, 7); c.stroke(); c.beginPath(); c.arc(r * .32, 0, r * .36, 0, 7); c.stroke(); line(c, [[-r * .7, r * .7], [-r, r * 1.3], [r, r * 1.3], [r * .7, r * .7]]); }
      else { line(c, [[-r * .8, -r * .5], [r * .8, -r * .2]]); line(c, [[-r * .8, r * .5], [r * .8, r * .2]]); } }
    else bow();
    c.restore(); }

  function drawInst(c, q, x, y, k, ink, fill) {
    const r = 13 * k; c.save(); c.lineWidth = Math.max(1, 1.3 * k); c.strokeStyle = ink; c.fillStyle = fill;
    if (q.k === 'PSV' || q.k === 'RD' || q.k === 'VB') { c.translate(x, y);
      if (q.k === 'RD') { c.beginPath(); c.arc(0, r * .2, r * .6, Math.PI, 0); c.stroke(); line(c, [[-r * .7, r * .2], [r * .7, r * .2]]); }
      else { c.beginPath(); c.moveTo(-r * .55, r * .55); c.lineTo(r * .55, r * .55); c.lineTo(0, 0); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, 0); c.lineTo(r * .7, -r * .45); c.lineTo(r * .7, r * .45); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); for (let i = 0; i < 5; i++) c.lineTo((i % 2 ? 1 : -1) * r * .25, -r * (.15 + i * .18)); c.stroke(); }
      c.fillStyle = ink; c.font = '700 ' + Math.max(7, 9 * k) + 'px IBM Plex Sans, sans-serif'; c.textAlign = 'left'; c.fillText(q.tag || q.k, r * .9, r * .2); c.restore(); return; }
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke();
    if (q.mount === 'dcs') c.strokeRect(x - r, y - r, r * 2, r * 2);
    if (q.mount === 'panel' || q.mount === 'dcs') line(c, [[x - r, y], [x + r, y]]);
    if (q.mount === 'rear') { c.save(); c.setLineDash([2, 2]); line(c, [[x - r, y], [x + r, y]]); c.restore(); }
    const tg = String(q.tag || q.k), i = tg.indexOf('-'), L1 = i > 0 ? tg.slice(0, i) : tg, N1 = i > 0 ? tg.slice(i + 1) : '';
    c.fillStyle = ink; c.textAlign = 'center'; c.font = '700 ' + Math.max(6, (L1.length > 3 ? 7 : 8.5) * k) + 'px IBM Plex Sans, sans-serif'; c.fillText(L1, x, y - 1.5 * k); c.font = '600 ' + Math.max(6, 8 * k) + 'px IBM Plex Sans, sans-serif'; c.fillText(N1, x, y + 9 * k); c.textAlign = 'left'; c.restore(); }

  /* =====================================================================
     Templates. Coordinates are sheet units (about 1 px at 100 %). Each template lists
     eq: equipment, nz: nozzles on equipment (side t/b/l/r, f = position along the side -0.5..0.5),
     j: junctions, ln: lines (service code, in-line items, ns = drawn but not sized, route),
     in: instruments. Roles: nozzles and junctions can be a source (p barg) or a consumer (flow).
     ===================================================================== */
  const T = {};
  const it = (k, t, o) => Object.assign({ k, t }, o || {});
  const pumpSet = (pre, sfx, grp, head, kind) => [it('ball', .1), it('strainer', .2), it(kind || 'pump', .36, { pre, sfx, grp, head }), it('check', .52), it('ball', .64)];

  T.cw = { n: 'Cooling water: cold well, pumps A/B, plant users, hot well and cooling tower', short: 'Cooling water distribution', net: { u: 'cw', mat: 'cs', sch: '40' },
    eq: [{ id: 'CT', sym: 'ct', x: 150, y: 250, name: 'Cooling tower', cap: '300 m³/h' }, { id: 'CW', sym: 'sump', x: 150, y: 420, name: 'Cold well', cap: '60 m³' },
      { id: 'HW', sym: 'sump', x: 420, y: 150, name: 'Hot well', cap: '60 m³' },
      { id: 'U1', sym: 'hxn', x: 820, y: 300, name: 'Process condenser', cap: '' }, { id: 'U2', sym: 'reactor', x: 1000, y: 300, name: 'Reactor jacket', cap: '6.3 KL' }, { id: 'U3', sym: 'chiller', x: 1180, y: 300, name: 'Chiller condenser', cap: '' }],
    nz: [{ id: 'cwo', on: 'CW', side: 'r', f: .25, role: 'source', p: 0, z: -1.5, name: 'Cold well outlet' },
      { id: 'cti', on: 'CT', side: 't', f: 0, role: 'consumer', flow: 280, preq: 0.5, z: 10, name: 'Cooling tower distribution' }, { id: 'cto', on: 'CT', side: 'r', f: .45, name: 'Basin outlet' }, { id: 'cwi', on: 'CW', side: 't', f: .4, name: 'Cold well inlet' },
      { id: 'hwo', on: 'HW', side: 'l', f: .25, role: 'source', p: 0, z: -1.5, name: 'Hot well outlet' }, { id: 'hwi', on: 'HW', side: 't', f: .3, name: 'Hot well inlet' },
      { id: 'u1i', on: 'U1', side: 'b', f: -.3, role: 'consumer', flow: 90, preq: 2.0, z: 6, name: 'CWS in' }, { id: 'u1o', on: 'U1', side: 't', f: .3, name: 'CWR out' },
      { id: 'u2i', on: 'U2', side: 'b', f: -.3, role: 'consumer', flow: 70, use: 0.8, preq: 2.0, z: 4, name: 'Jacket in' }, { id: 'u2o', on: 'U2', side: 't', f: .45, name: 'Jacket out' },
      { id: 'u3i', on: 'U3', side: 'b', f: -.3, role: 'consumer', flow: 120, preq: 1.5, z: 0, name: 'CWS in' }, { id: 'u3o', on: 'U3', side: 't', f: .3, name: 'CWR out' }],
    j: [{ id: 'sA', x: 260, y: 430 }, { id: 'sB', x: 260, y: 520 }, { id: 'dA', x: 560, y: 430 }, { id: 'dB', x: 560, y: 520 }, { id: 'h1', x: 680, y: 430 }, { id: 'h2', x: 805, y: 430 }, { id: 'h3', x: 985, y: 430 }, { id: 'h4', x: 1165, y: 430 },
      { id: 'r3', x: 1195, y: 90 }, { id: 'r2', x: 1015, y: 90 }, { id: 'r1', x: 835, y: 90 }, { id: 'r0', x: 450, y: 90 }],
    ln: [{ f: 'cwo', t: 'sA', s: 'CWS', len: 4 }, { f: 'sA', t: 'dA', s: 'CWS', len: 6, items: pumpSet('P', 'A', 'cwp', 32) }, { f: 'sA', t: 'sB', s: 'CWS', len: 2, ns: 1 }, { f: 'sB', t: 'dB', s: 'CWS', len: 6, ns: 1, items: pumpSet('P', 'B', 'cwp', 32) }, { f: 'dB', t: 'dA', s: 'CWS', len: 2, ns: 1 },
      { f: 'dA', t: 'h1', s: 'CWS', len: 15, items: [it('fm', .5, { pre: 'FT' })] }, { f: 'h1', t: 'h2', s: 'CWS', len: 60 }, { f: 'h2', t: 'h3', s: 'CWS', len: 45 }, { f: 'h3', t: 'h4', s: 'CWS', len: 50 },
      { f: 'h2', t: 'u1i', s: 'CWS', len: 12, items: [it('butterfly', .5)] }, { f: 'h3', t: 'u2i', s: 'CWS', len: 14, items: [it('butterfly', .5)] }, { f: 'h4', t: 'u3i', s: 'CWS', len: 10, items: [it('butterfly', .5)] },
      { f: 'u1o', t: 'r1', s: 'CWR', ns: 1, items: [it('butterfly', .5)] }, { f: 'u2o', t: 'r2', s: 'CWR', ns: 1, items: [it('butterfly', .5)] }, { f: 'u3o', t: 'r3', s: 'CWR', ns: 1, items: [it('butterfly', .5)] },
      { f: 'r3', t: 'r2', s: 'CWR', ns: 1 }, { f: 'r2', t: 'r1', s: 'CWR', ns: 1 }, { f: 'r1', t: 'r0', s: 'CWR', ns: 1 }, { f: 'r0', t: 'hwi', s: 'CWR', ns: 1, route: 'v' },
      { f: 'hwo', t: 'cti', s: 'CWR', len: 25, route: 'h', items: [it('butterfly', .12), it('pump', .3, { pre: 'P', sfx: 'C', head: 25 }), it('check', .48), it('butterfly', .62)] },
      { f: 'cto', t: 'cwi', s: 'CWS', ns: 1 }],
    in: [{ k: 'PI', on: 'line:1', t: .6, dy: -46 }, { k: 'PI', on: 'line:3', t: .6, dy: 46 }, { k: 'PT', on: 'line:5', t: .82, dy: -46, mount: 'dcs', service: 'CWS header pressure', range: '0-6 barg' },
      { k: 'TT', on: 'line:5', t: .2, dy: -46, mount: 'dcs', service: 'CWS temperature', range: '0-60 °C' }, { k: 'TT', on: 'line:18', t: .5, dy: -40, mount: 'dcs', service: 'CWR temperature', range: '0-60 °C' },
      { k: 'LT', on: 'CW', ax: -40, dy: -50, mount: 'dcs', service: 'Cold well level', range: '0-100 %' }, { k: 'LSL', on: 'CW', ax: 40, dy: -50, mount: 'dcs', service: 'Pump dry-run trip', range: '' }, { k: 'LT', on: 'HW', ax: -40, dy: -50, mount: 'dcs', service: 'Hot well level', range: '0-100 %' }] };

  T.ct = { n: 'Cooling tower loop: basin, circulation pumps, plate exchanger, make-up, blowdown and dosing', short: 'Cooling tower loop', net: { u: 'cw', mat: 'cs', sch: '40' },
    eq: [{ id: 'CT', sym: 'ct', x: 220, y: 200, name: 'Cooling tower', cap: '150 m³/h' }, { id: 'BS', sym: 'sump', x: 220, y: 380, name: 'CT basin', cap: '30 m³' }, { id: 'PHE', sym: 'phe', x: 760, y: 380, name: 'Plate heat exchanger', cap: '' },
      { id: 'DT', sym: 'vessel', x: 470, y: 600, name: 'Chemical dosing tank', cap: '200 L' }],
    nz: [{ id: 'bo', on: 'BS', side: 'r', f: .2, role: 'source', p: 0, z: -1, name: 'Basin outlet' }, { id: 'pi', on: 'PHE', side: 'l', f: .3, role: 'consumer', flow: 140, preq: 1.2, z: 1, name: 'Cold side in' },
      { id: 'po', on: 'PHE', side: 'l', f: -.3, name: 'Cold side out' }, { id: 'ci', on: 'CT', side: 't', f: 0, name: 'Distribution header' }, { id: 'cb', on: 'CT', side: 'b', f: 0, name: 'Fill outlet' }, { id: 'bi', on: 'BS', side: 't', f: 0, name: 'Basin' },
      { id: 'mk', on: 'BS', side: 't', f: -.4, role: 'consumer', flow: 3, preq: 0, z: 1, name: 'Make-up' }, { id: 'di', on: 'BS', side: 't', f: .35, name: 'Dosing' }, { id: 'do', on: 'DT', side: 'b', f: 0, name: 'Dosing outlet' },
      { id: 'hi', on: 'PHE', side: 'r', f: -.3, name: 'Hot side in' }, { id: 'ho', on: 'PHE', side: 'r', f: .3, name: 'Hot side out' }],
    j: [{ id: 'd1', x: 600, y: 410 }, { id: 'rt', x: 600, y: 120 }, { id: 'bd', x: 600, y: 230 }, { id: 'mw', x: 60, y: 300 }, { id: 'mx', x: 152, y: 300 }],
    ex: [{ id: 'BD', sym: 'opc', x: 690, y: 230, name: 'Blowdown to ETP' }, { id: 'MU', sym: 'opc', x: 60, y: 250, name: 'Make-up (soft water)', role: 'source', p: 2.5 }, { id: 'HI', sym: 'opc', x: 920, y: 341, name: 'Process hot side in' }, { id: 'HO', sym: 'opc', x: 920, y: 419, name: 'Process hot side out' }],
    ln: [{ f: 'bo', t: 'd1', s: 'CWS', len: 20, items: [it('butterfly', .1), it('strainer', .22), it('pump', .38, { pre: 'P', sfx: 'A', head: 25 }), it('check', .55), it('butterfly', .68), it('fm', .84, { pre: 'FT' })] },
      { f: 'd1', t: 'pi', s: 'CWS', len: 6, route: 'v' }, { f: 'po', t: 'rt', s: 'CWR', ns: 1, route: 'h' }, { f: 'rt', t: 'ci', s: 'CWR', ns: 1, route: 'h' }, { f: 'rt', t: 'bd', s: 'CWR', ns: 1 }, { f: 'bd', t: 'BD', s: 'DRN', ns: 1, items: [it('globe', .5)] },
      { f: 'cb', t: 'bi', s: 'CWS', ns: 1 }, { f: 'MU', t: 'mw', s: 'PW', len: 30, items: [] }, { f: 'mw', t: 'mx', s: 'PW', len: 5, items: [it('cv', .5, { pre: 'LCV', dp: 0.5 })] }, { f: 'mx', t: 'mk', s: 'PW', len: 3, route: 'h' },
      { f: 'do', t: 'di', s: 'PRC', ns: 1, route: 'h', items: [it('gear', .3, { pre: 'P', sfx: 'D', head: 20 })] }, { f: 'HI', t: 'hi', s: 'PRC', ns: 1 }, { f: 'ho', t: 'HO', s: 'PRC', ns: 1 }],
    in: [{ k: 'LT', on: 'BS', ax: 50, dy: -60, mount: 'dcs', service: 'Basin level (make-up control)', range: '0-100 %' }, { k: 'AT', on: 'line:2', t: .5, dy: -40, mount: 'dcs', service: 'Conductivity (blowdown)', range: '0-5000 µS/cm' },
      { k: 'TT', on: 'line:1', t: .5, dy: 46, mount: 'dcs', service: 'CWS temperature' }, { k: 'PI', on: 'line:0', t: .6, dy: -46 }] };

  T.reactor = { n: 'Reactor with jacket, overhead condenser, receiver, vacuum, N₂ and solvent charging', short: 'Reactor setup', net: { u: 'liq', mat: 'ss', sch: '10S' },
    eq: [{ id: 'R', sym: 'reactor', x: 560, y: 380, name: 'Reactor', cap: '6.3 KL', moc: 'GLR' }, { id: 'E', sym: 'cond', x: 860, y: 230, name: 'Overhead condenser', cap: '20 m²', moc: 'SS316' },
      { id: 'RV', sym: 'vessel', x: 1000, y: 430, name: 'Receiver', cap: '1 KL', moc: 'SS316' }, { id: 'ST', sym: 'tank', x: 150, y: 420, name: 'Solvent day tank', cap: '5 KL', moc: 'SS316' }],
    nz: [{ id: 'rch', on: 'R', side: 't', f: -.35, role: 'consumer', flow: 10, preq: 0.3, z: 6, name: 'Solvent charge' }, { id: 'rvp', on: 'R', side: 't', f: .38, name: 'Vapour outlet' }, { id: 'rn2', on: 'R', side: 't', f: -.12, role: 'consumer', flow: 10, preq: 0.2, z: 7, name: 'N₂ inlet' },
      { id: 'rb', on: 'R', side: 'b', f: 0, name: 'Bottom outlet' }, { id: 'rji', on: 'R', side: 'l', f: .38, role: 'consumer', flow: 25, preq: 1.5, z: 3, name: 'Jacket in' }, { id: 'rjo', on: 'R', side: 'r', f: -.1, name: 'Jacket out' },
      { id: 'ev', on: 'E', side: 't', f: 0, name: 'Vapour in' }, { id: 'el', on: 'E', side: 'b', f: 0, name: 'Condensate out' }, { id: 'eci', on: 'E', side: 'r', f: .35, role: 'consumer', flow: 30, preq: 1.5, z: 9, name: 'CWS in' }, { id: 'eco', on: 'E', side: 'r', f: -.35, name: 'CWR out' },
      { id: 'rvi', on: 'RV', side: 't', f: -.2, name: 'Inlet' }, { id: 'rvv', on: 'RV', side: 't', f: .3, name: 'Vent to vacuum' }, { id: 'rvb', on: 'RV', side: 'b', f: 0, name: 'Bottom outlet' },
      { id: 'sto', on: 'ST', side: 'b', f: .2, role: 'source', p: 0, z: 0.5, name: 'Outlet' }],
    j: [{ id: 'cw1', x: 380, y: 610 }, { id: 'cw2', x: 960, y: 610 }, { id: 'cr1', x: 1120, y: 130 }],
    ex: [{ id: 'CWS', sym: 'opc', x: 230, y: 610, name: 'CWS from header', role: 'source', p: 3.5 }, { id: 'CWR', sym: 'opc', x: 1230, y: 130, name: 'CWR to header' }, { id: 'N2', sym: 'opc', x: 330, y: 150, name: 'N₂ from header', role: 'source', p: 3 },
      { id: 'VAC', sym: 'opc', x: 1230, y: 330, name: 'To vacuum system' }, { id: 'OUT', sym: 'opc', x: 700, y: 700, name: 'To centrifuge' }, { id: 'DR', sym: 'opc', x: 1150, y: 700, name: 'To recovery' }],
    ln: [{ f: 'sto', t: 'rch', s: 'SOL', len: 30, route: 'ud', items: [it('ball', .14), it('strainer', .24), it('pump', .34, { pre: 'P', head: 25 }), it('check', .44), it('fm', .55, { pre: 'FT' }), it('onoff', .66, { pre: 'XV' })] },
      { f: 'N2', t: 'rn2', s: 'N2', len: 25, route: 'h', items: [it('ball', .15), it('prv', .35, { pre: 'PCV', dp: 2.5 }), it('check', .55)] },
      { f: 'rvp', t: 'ev', s: 'PV', ns: 1, route: 'v' }, { f: 'el', t: 'rvi', s: 'PRC', ns: 1, route: 'v', items: [it('sg', .4), it('ball', .7)] }, { f: 'rvv', t: 'VAC', s: 'VAC', ns: 1, route: 'v', items: [it('ball', .5)] },
      { f: 'rb', t: 'OUT', s: 'SLR', ns: 1, route: 'v', items: [it('ball', .2, { tag: 'FBV' })] }, { f: 'rvb', t: 'DR', s: 'PRC', ns: 1, route: 'v', items: [it('ball', .3)] },
      { f: 'CWS', t: 'cw1', s: 'CWS', len: 20 }, { f: 'cw1', t: 'rji', s: 'CWS', len: 8, route: 'v', items: [it('butterfly', .5)] }, { f: 'cw1', t: 'cw2', s: 'CWS', len: 30 }, { f: 'cw2', t: 'eci', s: 'CWS', len: 15, route: 'v', items: [it('butterfly', .4)] },
      { f: 'rjo', t: 'cr1', s: 'CWR', ns: 1, route: 'h' }, { f: 'eco', t: 'cr1', s: 'CWR', ns: 1, route: 'h' }, { f: 'cr1', t: 'CWR', s: 'CWR', ns: 1 }],
    in: [{ k: 'TT', on: 'R', ax: -14, dy: -82, dx: -36, mount: 'dcs', service: 'Reaction mass temperature', range: '-20 to 200 °C' }, { k: 'PT', on: 'R', ax: 10, dy: -82, dx: 30, mount: 'dcs', service: 'Reactor pressure', range: '-1 to 5 barg' },
      { k: 'RD', on: 'R', ax: 6, dy: -50, dx: 70, service: 'Reactor relief', range: 'burst 5 barg' }, { k: 'LT', on: 'RV', ax: -10, dy: -60, mount: 'dcs', service: 'Receiver level', range: '0-100 %' },
      { k: 'TI', on: 'line:12', t: .5, dy: -36, service: 'Jacket outlet' }, { k: 'PI', on: 'line:0', t: .4, dy: 46, service: 'Charge pump discharge' }, { k: 'PI', on: 'line:1', t: .45, dy: -40, service: 'N₂ after PCV' }] };

  T.cfd = { n: 'Centrifuge and dryer: slurry feed, mother-liquor tank and pump, RCVD with vacuum and hot water', short: 'Centrifuge + dryer', net: { u: 'liq', mat: 'ss', sch: '10S' },
    eq: [{ id: 'CF', sym: 'centrifuge', x: 420, y: 260, name: 'Centrifuge', cap: '48"', moc: 'SS316' }, { id: 'MT', sym: 'tank', x: 420, y: 520, name: 'Mother liquor tank', cap: '5 KL', moc: 'SS316' },
      { id: 'D', sym: 'rcvd', x: 820, y: 260, name: 'Rotocone vacuum dryer', cap: '2 KL', moc: 'SS316' }, { id: 'E', sym: 'cond', x: 1060, y: 170, name: 'Dryer condenser', cap: '6 m²' },
      { id: 'RV', sym: 'vessel', x: 1060, y: 400, name: 'Solvent receiver', cap: '500 L' }, { id: 'VP', sym: 'lrvp', x: 1240, y: 400, name: 'Vacuum pump', cap: '300 m³/h' }],
    nz: [{ id: 'cfi', on: 'CF', side: 't', f: -.25, role: 'consumer', flow: 8, preq: 0.3, z: 3, name: 'Slurry feed' }, { id: 'cfn', on: 'CF', side: 't', f: .25, role: 'consumer', flow: 5, preq: 0.1, z: 3, name: 'N₂ purge' },
      { id: 'cfm', on: 'CF', side: 'l', f: .3, name: 'Mother liquor out' }, { id: 'cfc', on: 'CF', side: 'r', f: 0, name: 'Wet cake' }, { id: 'mti', on: 'MT', side: 't', f: -.2, name: 'Inlet' }, { id: 'mto', on: 'MT', side: 'r', f: .35, role: 'source', p: 0, z: 0.3, name: 'Outlet' },
      { id: 'dci', on: 'D', side: 'l', f: 0, name: 'Wet cake in' }, { id: 'dv', on: 'D', side: 't', f: 0, name: 'Vapour' }, { id: 'dhi', on: 'D', side: 'b', f: -.1, role: 'consumer', flow: 6, preq: 1, z: 1.5, name: 'Jacket HW in' }, { id: 'dho', on: 'D', side: 'b', f: .1, name: 'Jacket HW out' },
      { id: 'ev', on: 'E', side: 't', f: 0, name: 'Vapour in' }, { id: 'el', on: 'E', side: 'b', f: 0, name: 'Condensate' }, { id: 'rvi', on: 'RV', side: 't', f: -.2, name: 'Inlet' }, { id: 'rvv', on: 'RV', side: 'r', f: -.3, name: 'Vacuum' }, { id: 'vpi', on: 'VP', side: 'l', f: -.2, name: 'Suction' }],
    ex: [{ id: 'SL', sym: 'opc', x: 140, y: 150, name: 'Slurry from reactor', role: 'source', p: 1.5 }, { id: 'N2', sym: 'opc', x: 140, y: 90, name: 'N₂ from header', role: 'source', p: 1.5 }, { id: 'OUT', sym: 'opc', x: 720, y: 580, name: 'To solvent recovery', role: 'consumer', flow: 10, preq: 0.5 },
      { id: 'HWS', sym: 'opc', x: 640, y: 430, name: 'HWS from header', role: 'source', p: 3 }, { id: 'HWR', sym: 'opc', x: 1000, y: 560, name: 'HWR to header' }, { id: 'PK', sym: 'opc', x: 820, y: 120, name: 'Dry product to packing' }],
    ln: [{ f: 'SL', t: 'cfi', s: 'SLR', len: 15, route: 'h', items: [it('ball', .5)] }, { f: 'N2', t: 'cfn', s: 'N2', len: 20, route: 'h', items: [it('ball', .3), it('rotameter', .5, { pre: 'FI' })] },
      { f: 'cfm', t: 'mti', s: 'ML', ns: 1, route: 'h' }, { f: 'mto', t: 'OUT', s: 'ML', len: 40, route: 'h', items: [it('ball', .1), it('strainer', .2), it('pump', .32, { pre: 'P', head: 30 }), it('check', .44), it('ball', .56)] },
      { f: 'cfc', t: 'dci', s: 'SLD', ns: 1 }, { f: 'dv', t: 'ev', s: 'VAC', ns: 1, route: 'v', items: [it('filter', .3, { pre: 'F' })] }, { f: 'el', t: 'rvi', s: 'SOL', ns: 1, route: 'v' }, { f: 'rvv', t: 'vpi', s: 'VAC', ns: 1 },
      { f: 'HWS', t: 'dhi', s: 'HWS', len: 25, route: 'h', items: [it('ball', .3)] }, { f: 'dho', t: 'HWR', s: 'HWR', ns: 1, route: 'v' }, { f: 'D', t: 'PK', s: 'SLD', ns: 1, skip: 1 }],
    in: [{ k: 'SI', on: 'CF', ax: 30, dy: -70, dx: 30, mount: 'panel', service: 'Basket speed' }, { k: 'IT', on: 'CF', ax: -30, dy: -70, dx: -50, mount: 'panel', service: 'Motor load' }, { k: 'LT', on: 'MT', ax: -20, dy: -60, mount: 'dcs', service: 'ML tank level' },
      { k: 'TT', on: 'D', ax: -25, dy: -60, dx: -40, mount: 'dcs', service: 'Dryer product temperature' }, { k: 'PT', on: 'D', ax: 25, dy: -60, dx: 46, mount: 'dcs', service: 'Dryer vacuum', range: '0-1000 mbar a' }, { k: 'PI', on: 'line:3', t: .44, dy: -40 }] };

  T.distill = { n: 'Distillation column: feed preheat, condenser, reflux drum and pumps, reboiler with steam and condensate', short: 'Distillation column', net: { u: 'liq', mat: 'ss', sch: '10S' },
    eq: [{ id: 'FT', sym: 'tank', x: 120, y: 470, name: 'Feed tank', cap: '10 KL' }, { id: 'C', sym: 'column', x: 520, y: 330, name: 'Distillation column', cap: '600 mm ID' }, { id: 'E1', sym: 'cond', x: 780, y: 140, name: 'Overhead condenser', cap: '25 m²' },
      { id: 'RD', sym: 'hdrum', x: 900, y: 320, name: 'Reflux drum', cap: '1 KL' }, { id: 'RB', sym: 'reboiler', x: 640, y: 560, name: 'Reboiler', cap: '15 m²' }, { id: 'PT', sym: 'tank', x: 1260, y: 470, name: 'Distillate tank', cap: '5 KL' }, { id: 'BT', sym: 'tank', x: 940, y: 690, name: 'Bottoms tank', cap: '5 KL' }],
    nz: [{ id: 'fo', on: 'FT', side: 'b', f: .2, role: 'source', p: 0, z: 0.5, name: 'Outlet' }, { id: 'cf', on: 'C', side: 'l', f: .05, role: 'consumer', flow: 4, preq: 0.3, z: 6, name: 'Feed' },
      { id: 'ct', on: 'C', side: 't', f: 0, name: 'Overhead vapour' }, { id: 'cr', on: 'C', side: 'r', f: -.38, role: 'consumer', flow: 6, preq: 0.3, z: 11, name: 'Reflux' }, { id: 'cb', on: 'C', side: 'b', f: 0, role: 'source', p: 0.2, z: 1.5, name: 'Bottoms' },
      { id: 'cbr', on: 'C', side: 'r', f: .42, name: 'To reboiler' }, { id: 'crr', on: 'C', side: 'r', f: .3, name: 'Reboiler return' },
      { id: 'ev', on: 'E1', side: 't', f: 0, name: 'Vapour in' }, { id: 'el', on: 'E1', side: 'b', f: 0, name: 'Condensate' }, { id: 'eci', on: 'E1', side: 'r', f: .35, role: 'consumer', flow: 45, preq: 1.5, z: 12, name: 'CWS in' }, { id: 'eco', on: 'E1', side: 'r', f: -.35, name: 'CWR out' },
      { id: 'ri', on: 'RD', side: 't', f: -.3, name: 'Inlet' }, { id: 'rv', on: 'RD', side: 't', f: .3, name: 'Vent' }, { id: 'ro', on: 'RD', side: 'b', f: .35, role: 'source', p: 0, z: 7, name: 'Outlet' },
      { id: 'bi', on: 'RB', side: 'l', f: .2, name: 'Liquid in' }, { id: 'bv', on: 'RB', side: 't', f: -.1, name: 'Vapour out' }, { id: 'bs', on: 'RB', side: 't', f: .3, role: 'consumer', flow: 650, preq: 3, z: 1.5, name: 'Steam in' }, { id: 'bc', on: 'RB', side: 'b', f: .3, name: 'Condensate out' },
      { id: 'pti', on: 'PT', side: 't', f: -.2, role: 'consumer', flow: 2, preq: 0.2, z: 6, name: 'Inlet' }, { id: 'bti', on: 'BT', side: 't', f: -.2, role: 'consumer', flow: 2, preq: 0.2, z: 6, name: 'Inlet' }],
    j: [{ id: 'rj', x: 1080, y: 230 }, { id: 'cs', x: 1120, y: 140 }],
    ex: [{ id: 'STM', sym: 'opc', x: 1000, y: 540, name: 'LP steam 7 barg', role: 'source', p: 7 }, { id: 'CND', sym: 'opc', x: 1000, y: 620, name: 'To condensate return' }, { id: 'CWS', sym: 'opc', x: 1250, y: 100, name: 'CWS from header', role: 'source', p: 3.5 },
      { id: 'CWR', sym: 'opc', x: 1250, y: 175, name: 'CWR to header' }, { id: 'VNT', sym: 'opc', x: 1250, y: 300, name: 'Vent to scrubber' }],
    ln: [{ f: 'fo', t: 'cf', s: 'PRC', len: 30, route: 'ud', items: [it('ball', .12), it('strainer', .22), it('pump', .32, { pre: 'P', head: 30 }), it('check', .42), it('hx', .55, { pre: 'E', dp: 0.3 }), it('cv', .7, { pre: 'FCV', dp: 0.5 })] },
      { f: 'ct', t: 'ev', s: 'PV', ns: 1, route: 'v' }, { f: 'el', t: 'ri', s: 'PRC', ns: 1, route: 'v' }, { f: 'rv', t: 'VNT', s: 'VNT', ns: 1, route: 'v' },
      { f: 'ro', t: 'rj', s: 'PRC', len: 6, route: 'h', items: [it('ball', .15), it('pump', .35, { pre: 'P', head: 35 }), it('check', .55)] }, { f: 'rj', t: 'cr', s: 'PRC', len: 18, route: 'v', items: [it('cv', .55, { pre: 'FCV', dp: 0.7 })] },
      { f: 'rj', t: 'pti', s: 'PRC', len: 25, route: 'h', items: [it('cv', .4, { pre: 'LCV', dp: 0.7 })] },
      { f: 'cb', t: 'bti', s: 'PRC', len: 20, route: 'v', items: [it('ball', .1), it('pump', .3, { pre: 'P', head: 25 }), it('check', .45), it('cv', .62, { pre: 'LCV', dp: 0.5 })] },
      { f: 'cbr', t: 'bi', s: 'PRC', ns: 1, route: 'v' }, { f: 'bv', t: 'crr', s: 'PV', ns: 1, route: 'v' },
      { f: 'STM', t: 'bs', s: 'STM', len: 25, route: 'h', items: [it('cv', .5, { pre: 'TCV', dp: 1.5 })] }, { f: 'bc', t: 'CND', s: 'CND', ns: 1, route: 'v', items: [it('trap', .5, { pre: 'ST' })] },
      { f: 'CWS', t: 'cs', s: 'CWS', len: 10 }, { f: 'cs', t: 'eci', s: 'CWS', len: 6, route: 'v' }, { f: 'eco', t: 'CWR', s: 'CWR', ns: 1, route: 'h' }],
    in: [{ k: 'TT', on: 'C', ax: -18, dy: -110, dx: -50, mount: 'dcs', service: 'Top temperature' }, { k: 'PDT', on: 'C', ax: -18, ay: 0, dx: -70, dy: 0, mount: 'dcs', service: 'Column ΔP' }, { k: 'TIC', on: 'C', ax: -18, ay: 50, dx: -70, dy: 0, mount: 'dcs', service: 'Tray temperature (steam control)' },
      { k: 'LIC', on: 'RD', ax: -20, dy: -50, dx: -20, mount: 'dcs', service: 'Reflux drum level' }, { k: 'LIC', on: 'C', ax: 18, ay: 60, dx: 60, dy: 30, mount: 'dcs', service: 'Column bottom level' }, { k: 'FIC', on: 'line:5', t: .3, dy: 0, dx: -50, mount: 'dcs', service: 'Reflux flow' },
      { k: 'PT', on: 'RD', ax: 30, dy: -50, dx: 30, mount: 'dcs', service: 'Column top pressure' }, { k: 'PSV', on: 'C', ax: 10, dy: -100, dx: 40, service: 'Column relief' }] };

  T.steam = { n: 'Steam and condensate: boiler, PRV station with bypass, LP header to users, traps and condensate return pump', short: 'Steam distribution', net: { u: 'steam', mat: 'cs', sch: '40' },
    eq: [{ id: 'B', sym: 'boiler', x: 120, y: 200, name: 'Steam boiler', cap: '5 TPH' }, { id: 'U1', sym: 'reactor', x: 760, y: 300, name: 'Reactor jacket', cap: '6.3 KL' }, { id: 'U2', sym: 'rcvd', x: 960, y: 300, name: 'Dryer jacket', cap: '' },
      { id: 'U3', sym: 'hxn', x: 1160, y: 300, name: 'Process heater', cap: '' }, { id: 'CT', sym: 'vessel', x: 960, y: 600, name: 'Condensate collection tank', cap: '2 KL' }, { id: 'FT', sym: 'tank', x: 320, y: 600, name: 'Boiler feed water tank', cap: '5 KL' }],
    nz: [{ id: 'bo', on: 'B', side: 't', f: .2, role: 'source', p: 10.5, z: 3, name: 'Main steam' }, { id: 'u1', on: 'U1', side: 'l', f: -.1, role: 'consumer', flow: 600, use: 0.7, preq: 2.5, z: 4, name: 'Jacket steam in' }, { id: 'u1c', on: 'U1', side: 'b', f: .3, name: 'Condensate' },
      { id: 'u2', on: 'U2', side: 't', f: 0, role: 'consumer', flow: 300, preq: 2.5, z: 2, name: 'Jacket steam in' }, { id: 'u2c', on: 'U2', side: 'b', f: 0, name: 'Condensate' }, { id: 'u3', on: 'U3', side: 't', f: -.3, role: 'consumer', flow: 450, preq: 2.5, z: 3, name: 'Steam in' }, { id: 'u3c', on: 'U3', side: 'b', f: .3, name: 'Condensate' },
      { id: 'cti', on: 'CT', side: 't', f: 0, name: 'Return in' }, { id: 'cto', on: 'CT', side: 'l', f: .35, role: 'source', p: 0, z: 0.3, name: 'Outlet' }, { id: 'fti', on: 'FT', side: 't', f: .2, role: 'consumer', flow: 1.3, preq: 0.2, z: 5, name: 'Condensate in' }],
    j: [{ id: 'm1', x: 230, y: 120 }, { id: 'p1', x: 300, y: 120 }, { id: 'p2', x: 520, y: 120 }, { id: 'b1', x: 300, y: 60 }, { id: 'b2', x: 520, y: 60 }, { id: 'l1', x: 620, y: 120 }, { id: 'l2', x: 960, y: 120 }, { id: 'l3', x: 1145, y: 120 },
      { id: 'c1', x: 800, y: 470 }, { id: 'c2', x: 960, y: 470 }, { id: 'c3', x: 1175, y: 470 }],
    ln: [{ f: 'bo', t: 'm1', s: 'STM', len: 10, route: 'v', items: [it('globe', .5, { tag: 'MSV' })] }, { f: 'm1', t: 'p1', s: 'STM', len: 5 },
      { f: 'p1', t: 'p2', s: 'STM', len: 6, items: [it('globe', .12), it('strainer', .3), it('prv', .5, { pre: 'PCV', dp: 7 }), it('globe', .82)] }, { f: 'p1', t: 'b1', s: 'STM', ns: 1 }, { f: 'b1', t: 'b2', s: 'STM', ns: 1, items: [it('globe', .5)] }, { f: 'b2', t: 'p2', s: 'STM', ns: 1 },
      { f: 'p2', t: 'l1', s: 'STM', len: 15 }, { f: 'l1', t: 'u1', s: 'STM', len: 15, route: 'v', items: [it('cv', .7, { pre: 'TCV', dp: 0.5 })] }, { f: 'l1', t: 'l2', s: 'STM', len: 40 }, { f: 'l2', t: 'u2', s: 'STM', len: 12, items: [it('cv', .6, { pre: 'TCV', dp: 0.5 })] },
      { f: 'l2', t: 'l3', s: 'STM', len: 35 }, { f: 'l3', t: 'u3', s: 'STM', len: 12, items: [it('cv', .6, { pre: 'TCV', dp: 0.5 })] },
      { f: 'u1c', t: 'c1', s: 'CND', ns: 1, items: [it('trap', .5, { pre: 'ST' })] }, { f: 'u2c', t: 'c2', s: 'CND', ns: 1, items: [it('trap', .4, { pre: 'ST' })] }, { f: 'u3c', t: 'c3', s: 'CND', ns: 1, items: [it('trap', .5, { pre: 'ST' })] },
      { f: 'c1', t: 'c2', s: 'CND', ns: 1 }, { f: 'c3', t: 'c2', s: 'CND', ns: 1 }, { f: 'c2', t: 'cti', s: 'CND', ns: 1 },
      { f: 'cto', t: 'fti', s: 'CND', len: 60, route: 'h', items: [it('ball', .1), it('pump', .25, { pre: 'P', head: 20 }), it('check', .4), it('ball', .52)] }],
    in: [{ k: 'PI', on: 'line:2', t: .7, dy: -40, service: 'LP steam after PRV' }, { k: 'PSV', on: 'line:6', t: .4, dy: -36, service: 'LP header relief', range: 'set 4 barg' }, { k: 'PT', on: 'line:8', t: .5, dy: -40, mount: 'dcs', service: 'LP header pressure' },
      { k: 'FQ', on: 'line:8', t: .25, dy: -40, mount: 'dcs', service: 'Steam totaliser' }, { k: 'LT', on: 'CT', ax: 20, dy: -60, mount: 'dcs', service: 'Condensate tank level' }, { k: 'TIC', on: 'U1', ax: -20, dy: -80, dx: -40, mount: 'dcs', service: 'Jacket temperature' }] };

  T.transfer = { n: 'Tank-to-tank pump transfer with suction strainer, check valve, flowmeter and level instruments', short: 'Pump transfer', net: { u: 'liq', mat: 'ss', sch: '10S' },
    eq: [{ id: 'A', sym: 'tank', x: 160, y: 300, name: 'Storage tank', cap: '20 KL' }, { id: 'B', sym: 'vessel', x: 760, y: 260, name: 'Day tank', cap: '2 KL' }],
    nz: [{ id: 'ao', on: 'A', side: 'b', f: .25, role: 'source', p: 0, z: 0.5, name: 'Outlet' }, { id: 'bi', on: 'B', side: 't', f: -.2, role: 'consumer', flow: 10, preq: 0.1, z: 8, name: 'Inlet' }],
    ln: [{ f: 'ao', t: 'bi', s: 'PRC', len: 40, route: 'ud', items: [it('ball', .14), it('strainer', .24), it('pump', .36, { pre: 'P', head: 25 }), it('check', .48), it('ball', .58), it('fm', .68, { pre: 'FT' })] }],
    in: [{ k: 'LT', on: 'A', ax: -15, dy: -60, mount: 'dcs', service: 'Storage level' }, { k: 'LSH', on: 'B', ax: 10, dy: -60, dx: 30, mount: 'dcs', service: 'High level trip' }, { k: 'PI', on: 'line:0', t: .48, dy: 40 }] };


  root.LNS = { EQUIP: E, CATS, INST, SERVICES, ITEMLINK, ITEMCAT, drawEq, drawItem, drawInst, TEMPLATES: T, slug };
})(typeof window !== 'undefined' ? window : globalThis);
