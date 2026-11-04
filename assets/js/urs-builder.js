/* PharmaChemE URS builder: generates a User Requirement Specification for a pump, heat exchanger or distillation column.
   Everything runs in the browser. A draft is kept in localStorage on this device only. */
(function () {
  'use strict';
  var KEY = 'pce-urs-v1';
  var HOST = document.getElementById('urs-app');
  if (!HOST) return;

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function $(sel, root) { return (root || HOST).querySelector(sel); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage may be blocked */ } }

  /* ---------- field definitions ---------- */
  var YN = ['Yes', 'No'];
  var COMMON = [
    { g: 'Site and compliance', k: 'gmp', l: 'GMP-regulated product', t: 'sel', o: ['Yes (GMP, qualification required)', 'No (non-GMP)'], d: 'Yes (GMP, qualification required)', drv: 1 },
    { g: 'Site and compliance', k: 'contact', l: 'Product contact', t: 'sel', o: ['Product-contact', 'Non-product-contact (utility or effluent)'], d: 'Product-contact', drv: 1 },
    { g: 'Site and compliance', k: 'moc', l: 'Wetted materials of construction', t: 'sel', o: ['SS 316L', 'SS 304', 'Hastelloy C', 'Glass-lined steel', 'PTFE or PFA lined', 'Carbon steel'], d: 'SS 316L' },
    { g: 'Site and compliance', k: 'finish', l: 'Surface roughness on product-contact surfaces', t: 'num', u: 'µm Ra', d: '0.8' },
    { g: 'Site and compliance', k: 'cleaning', l: 'Cleaning method', t: 'sel', o: ['Manual cleaning', 'CIP', 'SIP', 'CIP and SIP', 'No cleaning (dedicated service)'], d: 'Manual cleaning', drv: 1 },
    { g: 'Site and compliance', k: 'zone', l: 'Hazardous area classification', t: 'sel', o: ['Non-hazardous', 'Zone 2 (gas)', 'Zone 1 (gas)', 'Not yet classified'], d: 'Zone 1 (gas)', drv: 1 },
    { g: 'Site and compliance', k: 'loc', l: 'Installation', t: 'sel', o: ['Indoor', 'Outdoor'], d: 'Indoor' },
    { g: 'Commercial', k: 'delivery', l: 'Required delivery', t: 'num', u: 'weeks from order', d: '16' },
    { g: 'Commercial', k: 'warranty', l: 'Warranty period', t: 'num', u: 'months from commissioning', d: '12' }
  ];
  var EQ = {
    pump: {
      label: 'Centrifugal pump', pfx: 'PMP', noun: 'centrifugal pump',
      varKey: 'ptype',
      fields: [
        { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'P-101 Solvent transfer pump' },
        { g: 'Duty', k: 'fluid', l: 'Fluid and service', t: 'text', d: 'Toluene, transfer from day tank to reactor' },
        { g: 'Duty', k: 'flow', l: 'Design flow', t: 'num', u: 'm³/h', d: '20' },
        { g: 'Duty', k: 'flowmin', l: 'Minimum continuous flow', t: 'num', u: 'm³/h', d: '8' },
        { g: 'Duty', k: 'head', l: 'Differential head', t: 'num', u: 'm', d: '35' },
        { g: 'Duty', k: 'temp', l: 'Pumping temperature', t: 'num', u: '°C', d: '30' },
        { g: 'Duty', k: 'sg', l: 'Density', t: 'num', u: 'kg/m³', d: '870' },
        { g: 'Duty', k: 'visc', l: 'Viscosity', t: 'num', u: 'cP', d: '0.6' },
        { g: 'Duty', k: 'vp', l: 'Vapour pressure at pumping temperature', t: 'num', u: 'kPa(a)', d: '5' },
        { g: 'Duty', k: 'npsha', l: 'NPSH available at rated flow', t: 'num', u: 'm', d: '4' },
        { g: 'Duty', k: 'solids', l: 'Suspended solids', t: 'num', u: '% w/w', d: '0', drv: 1 },
        { g: 'Design', k: 'dp', l: 'Design pressure', t: 'num', u: 'barg', d: '6' },
        { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '80' },
        { g: 'Design', k: 'ptype', l: 'Pump type', t: 'sel', o: ['Process pump (end suction, baseplate mounted)', 'Hygienic pump (sanitary design)'], d: 'Process pump (end suction, baseplate mounted)', drv: 1 },
        { g: 'Design', k: 'seal', l: 'Shaft sealing', t: 'sel', o: ['Single mechanical seal', 'Double mechanical seal with barrier fluid', 'Sealless magnetic drive'], d: 'Double mechanical seal with barrier fluid', drv: 1 },
        { g: 'Design', k: 'supply', l: 'Electrical supply', t: 'text', d: '415 V, 3-phase, 50 Hz' },
        { g: 'Design', k: 'drive', l: 'Speed control', t: 'sel', o: ['Fixed speed', 'Variable speed (VFD)'], d: 'Fixed speed', drv: 1 },
        { g: 'Design', k: 'noise', l: 'Noise limit at 1 m', t: 'num', u: 'dB(A)', d: '85' }
      ]
    },
    hx: {
      label: 'Heat exchanger', pfx: 'HEX', noun: 'heat exchanger',
      varKey: 'htype',
      fields: [
        { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'E-201 Reactor overhead condenser' },
        { g: 'Duty', k: 'htype', l: 'Exchanger type', t: 'sel', o: ['Shell and tube', 'Plate (gasketed)'], d: 'Shell and tube', drv: 1 },
        { g: 'Duty', k: 'hf', l: 'Hot fluid', t: 'text', d: 'Toluene vapour' },
        { g: 'Duty', k: 'cf', l: 'Cold fluid', t: 'text', d: 'Chilled water' },
        { g: 'Duty', k: 'duty', l: 'Heat duty', t: 'num', u: 'kW', d: '250' },
        { g: 'Duty', k: 'thi', l: 'Hot side inlet temperature', t: 'num', u: '°C', d: '110' },
        { g: 'Duty', k: 'tho', l: 'Hot side outlet temperature', t: 'num', u: '°C', d: '40' },
        { g: 'Duty', k: 'tci', l: 'Cold side inlet temperature', t: 'num', u: '°C', d: '10' },
        { g: 'Duty', k: 'tco', l: 'Cold side outlet temperature', t: 'num', u: '°C', d: '18' },
        { g: 'Duty', k: 'dph', l: 'Allowable pressure drop, hot side', t: 'num', u: 'bar', d: '0.2' },
        { g: 'Duty', k: 'dpc', l: 'Allowable pressure drop, cold side', t: 'num', u: 'bar', d: '0.7' },
        { g: 'Duty', k: 'margin', l: 'Minimum area margin over required area', t: 'num', u: '%', d: '10' },
        { g: 'Duty', k: 'foul', l: 'Fouling resistance, process side', t: 'num', u: 'm²K/W', d: '0.0002' },
        { g: 'Design', k: 'pdh', l: 'Design pressure, hot side', t: 'num', u: 'barg', d: '3' },
        { g: 'Design', k: 'pdc', l: 'Design pressure, cold side', t: 'num', u: 'barg', d: '6' },
        { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '150' }
      ]
    },
    col: {
      label: 'Distillation column', pfx: 'DST', noun: 'distillation column',
      varKey: 'ctype',
      fields: [
        { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'C-301 Solvent recovery column' },
        { g: 'Duty', k: 'ctype', l: 'Internals', t: 'sel', o: ['Packed column', 'Tray column'], d: 'Packed column', drv: 1 },
        { g: 'Duty', k: 'cmode', l: 'Operation', t: 'sel', o: ['Batch', 'Continuous'], d: 'Batch', drv: 1 },
        { g: 'Duty', k: 'feed', l: 'Feed mixture', t: 'text', d: 'Toluene with about 10 % methanol and water' },
        { g: 'Duty', k: 'rate', l: 'Feed rate (continuous)', t: 'num', u: 'kg/h', d: '800', sh: function (v) { return v.cmode === 'Continuous'; } },
        { g: 'Duty', k: 'batch', l: 'Batch charge (batch)', t: 'num', u: 'kg', d: '3000', sh: function (v) { return v.cmode === 'Batch'; } },
        { g: 'Duty', k: 'purity', l: 'Required top product purity', t: 'num', u: '% w/w', d: '99.5' },
        { g: 'Duty', k: 'recov', l: 'Required recovery', t: 'num', u: '%', d: '95' },
        { g: 'Duty', k: 'press', l: 'Operating pressure at column top', t: 'num', u: 'kPa(a)', d: '101' },
        { g: 'Duty', k: 'ttop', l: 'Top temperature', t: 'num', u: '°C', d: '111' },
        { g: 'Duty', k: 'tbot', l: 'Bottom temperature', t: 'num', u: '°C', d: '118' },
        { g: 'Duty', k: 'rr', l: 'Reflux ratio range', t: 'text', d: '2 to 6' },
        { g: 'Duty', k: 'turn', l: 'Operating range as % of design load', t: 'text', d: '50 to 100 %' },
        { g: 'Duty', k: 'dpmax', l: 'Maximum column pressure drop at design load', t: 'num', u: 'mbar', d: '30' },
        { g: 'Duty', k: 'thsens', l: 'Maximum allowable liquid temperature (thermal sensitivity)', t: 'num', u: '°C', d: '130' },
        { g: 'Duty', k: 'rebo', l: 'Reboiler duty', t: 'num', u: 'kW', d: '400' },
        { g: 'Duty', k: 'cond', l: 'Condenser duty', t: 'num', u: 'kW', d: '380' },
        { g: 'Design', k: 'vac', l: 'Full vacuum rating required', t: 'sel', o: YN, d: 'Yes', drv: 1 },
        { g: 'Design', k: 'dpress', l: 'Design pressure', t: 'num', u: 'barg', d: '3' },
        { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '180' }
      ]
    }
  };

  EQ.rx = {
    label: 'Batch reactor', pfx: 'RXR', noun: 'batch reactor',
    varKey: 'rtype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'R-401 Reaction vessel' },
      { g: 'Duty', k: 'rtype', l: 'Vessel construction', t: 'sel', o: ['Glass-lined steel', 'Stainless steel'], d: 'Glass-lined steel', drv: 1 },
      { g: 'Duty', k: 'proc', l: 'Process and reaction', t: 'text', d: 'Exothermic esterification in toluene' },
      { g: 'Duty', k: 'vol', l: 'Nominal working volume', t: 'num', u: 'L', d: '4000' },
      { g: 'Duty', k: 'fmin', l: 'Minimum fill (agitator and probes covered)', t: 'num', u: '% of working volume', d: '30' },
      { g: 'Duty', k: 'fmax', l: 'Maximum fill', t: 'num', u: '% of working volume', d: '80' },
      { g: 'Duty', k: 'visc', l: 'Maximum viscosity of reaction mass', t: 'num', u: 'cP', d: '200' },
      { g: 'Duty', k: 'solids', l: 'Solids present', t: 'sel', o: ['None', 'Slurry', 'Solids charged and dissolved'], d: 'Slurry' },
      { g: 'Duty', k: 'trange', l: 'Operating temperature range', t: 'text', d: '-10 to 120 °C' },
      { g: 'Duty', k: 'heat', l: 'Heating time from 20 °C to operating temperature', t: 'num', u: 'min', d: '90' },
      { g: 'Duty', k: 'cool', l: 'Cooling time from operating temperature to 20 °C', t: 'num', u: 'min', d: '120' },
      { g: 'Duty', k: 'qrx', l: 'Maximum reaction heat release to be removed', t: 'num', u: 'kW', d: '60' },
      { g: 'Duty', k: 'util', l: 'Jacket utilities', t: 'text', d: 'Steam 4 barg, chilled water 7 °C, brine -15 °C via thermal fluid' },
      { g: 'Duty', k: 'run', l: 'Credible runaway or relief case', t: 'text', d: 'Loss of cooling during dosing, and external fire' },
      { g: 'Duty', k: 'dpress', l: 'Design pressure', t: 'num', u: 'barg', d: '6' },
      { g: 'Duty', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '180' },
      { g: 'Duty', k: 'vac', l: 'Full vacuum rating required', t: 'sel', o: YN, d: 'Yes', drv: 1 },
      { g: 'Agitation', k: 'atype', l: 'Agitator type', t: 'sel', o: ['Retreat curve impeller', 'Pitched blade turbine', 'Anchor', 'Turbine with baffles'], d: 'Retreat curve impeller' },
      { g: 'Agitation', k: 'rpm', l: 'Agitator speed range', t: 'text', d: '30 to 120 rpm' },
      { g: 'Agitation', k: 'drive', l: 'Speed control', t: 'sel', o: ['Fixed speed', 'Variable speed (VFD)'], d: 'Variable speed (VFD)' },
      { g: 'Agitation', k: 'rseal', l: 'Agitator shaft seal', t: 'sel', o: ['Single mechanical seal', 'Double mechanical seal with barrier fluid', 'Magnetic drive'], d: 'Double mechanical seal with barrier fluid', drv: 1 },
      { g: 'Agitation', k: 'baf', l: 'Baffles', t: 'sel', o: ['Fixed baffle (beavertail)', 'Removable baffle', 'No baffle'], d: 'Fixed baffle (beavertail)' },
      { g: 'Charging', k: 'chg', l: 'Charging systems', t: 'text', d: 'Solids via charging hopper with nitrogen purge, liquids via dosing line and pump' },
      { g: 'Charging', k: 'inert', l: 'Inerting', t: 'sel', o: ['Nitrogen inerting', 'No inerting'], d: 'Nitrogen inerting', drv: 1 },
      { g: 'Charging', k: 'cond', l: 'Overhead condenser duty', t: 'num', u: 'kW', d: '80' }
    ]
  };
  Object.keys(EQ).forEach(function (k) { EQ[k].fields = EQ[k].fields.concat(COMMON); });

  /* ---------- clause library ----------
     c(text, priority, verification, default, when) - text may hold {field} tokens; IDs are numbered in order per equipment. */
  var M = 'Must', S_ = 'Should', C_ = 'Could';
  var DR = 'Design review', FAT = 'FAT', SAT = 'SAT', DOC = 'Documentation';
  function c(t, p, m, d, w) { return { t: t, p: p, m: m, d: d !== false, w: w || null }; }
  var gmpOn = function (v) { return /^Yes/.test(v.gmp); };
  var prodOn = function (v) { return v.contact === 'Product-contact'; };
  var gmpProd = function (v) { return gmpOn(v) && prodOn(v); };
  var zoneOn = function (v) { return v.zone !== 'Non-hazardous'; };
  var cipOn = function (v) { return /CIP|SIP/.test(v.cleaning) && !/^No cleaning/.test(v.cleaning); };

  var LIB = {
    pump: [
      { t: 'Process and performance requirements', c: [
        c('The pump shall deliver {flow} of {fluid} at a differential head of {head}, at a pumping temperature of {temp}, density of {sg} and viscosity of {visc}.', M, 'FAT'),
        c('The pump shall run stably and continuously from the minimum continuous flow of {flowmin} up to the design flow, without operating in an unstable or recirculating region of its curve.', M, DR),
        c('The head-capacity curve should rise continuously toward shut-off. The supplier shall state the preferred operating region and show the design point on the curve.', S_, DR),
        c('The NPSH required by the pump at the design flow shall be lower than the NPSH available of {npsha} for a fluid vapour pressure of {vp}. The supplier shall state the margin applied.', M, DR),
        c('The pump shall handle suspended solids of {solids} without blockage or abnormal wear. The supplier shall state the maximum particle size and the impeller type.', M, DR, true, function (v) { return parseFloat(v.solids) > 0; }),
        c('The pump shall not overload its motor at any point on its curve within the specified operating range.', M, DR),
        c('The supplier shall state the efficiency and the absorbed power at the design point, and the motor rating shall include a margin that follows the user’s motor standard.', S_, DOC)
      ] },
      { t: 'Mechanical design and construction', c: [
        c('The pump shall be designed to a recognised pump standard stated by the supplier (for example ISO 5199 or API 610, as agreed with the user) and shall be rated for a design pressure of {dp} and a design temperature of {dt}.', M, DOC),
        c('The pump and motor shall be mounted on a common baseplate with a coupling guard that prevents contact with rotating parts.', M, DR, true, function (v) { return !/^Hygienic/.test(v.ptype); }),
        c('The pump shall be of hygienic design, free of dead legs and crevices, self-draining when installed as specified, with sanitary connections, and shall follow a recognised hygienic design standard such as ASME BPE.', M, DR, true, function (v) { return /^Hygienic/.test(v.ptype); }),
        c('The casing shall have drain and vent connections located so that the pump can be fully drained and primed.', S_, DR),
        c('Bearings shall have a calculated life, stated by the supplier, that meets the user’s standard at rated conditions.', S_, DOC),
        c('Vibration and noise shall not exceed the limits in the user’s standard, and the noise at 1 m shall not exceed {noise}.', S_, FAT)
      ] },
      { t: 'Shaft sealing', c: [
        c('Shaft sealing shall be: {seal}.', M, DR),
        c('The mechanical seal shall be suitable for the fluid, temperature, pressure and any solids, and the supplier shall state the seal flush or support plan.', M, DR, true, function (v) { return !/^Sealless/.test(v.seal); }),
        c('The barrier fluid system shall include a reservoir with level and pressure indication, alarms on loss of barrier, and a barrier fluid that has been assessed for compatibility with the product.', M, DR, true, function (v) { return /^Double/.test(v.seal); }),
        c('The magnetic drive shall be protected against dry running, loss of flush or cooling, and over-temperature of the containment shell. The supplier shall state how each condition is detected.', M, DR, true, function (v) { return /^Sealless/.test(v.seal); }),
        c('There shall be no visible leakage of process fluid from seals, casing joints or connections during testing at the supplier and on site.', M, 'FAT, SAT')
      ] },
      { t: 'Materials and surface finish', c: [
        c('Wetted parts shall be made of {moc} and shall be compatible with the fluid, the temperature and the cleaning agents in use.', M, 'Design review, Documentation'),
        c('All product-contact materials shall be non-reactive, non-additive and non-absorptive. Elastomers and polymers shall be suitable for the fluid and cleaning agents, and the supplier shall provide a compliance declaration for each.', M, DOC, true, prodOn),
        c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for the casing and for wetted parts.', S_, DOC),
        c('Product-contact surfaces shall have a surface roughness not greater than {finish}, and the supplier shall provide the measurement record.', M, 'FAT, Documentation', true, gmpProd),
        c('Welds on product-contact surfaces shall be smooth and fully penetrated, and the supplier shall provide welding procedures and weld records.', S_, DOC, true, prodOn)
      ] },
      { t: 'Utilities, cleaning and environment', c: [
        c('The motor shall be suitable for the supply of {supply} and for the specified installation: {loc}.', M, DR),
        c('Speed control is by a variable frequency drive. The motor shall be suitable for inverter duty, and the minimum speed shall keep the motor cooling and bearing lubrication adequate.', S_, DR, true, function (v) { return /^Variable/.test(v.drive); }),
        c('The motor and all electrical equipment shall be certified for {zone}, with gas group and temperature class as stated by the user.', M, DOC, true, zoneOn),
        c('The pump, motor and baseplate shall be bonded and earthed, and the supplier shall state any parts that could become electrically isolated.', M, SAT, true, zoneOn),
        c('The pump shall withstand the cleaning method ({cleaning}), including temperature and cleaning chemicals, without damage, and shall drain after cleaning.', M, 'Design review, SAT', true, cipOn)
      ] },
      { t: 'Instrumentation and control', c: [
        c('Connections for suction and discharge pressure measurement shall be provided, with isolation valves.', S_, DR),
        c('The pump shall be protected against dry running, for example by a flow, power or level interlock, and the supplier shall state the protection offered.', M, 'Design review, FAT'),
        c('The motor shall have overload and thermal protection and a local stop.', S_, DR),
        c('Run and fault status signals shall be available for connection to the plant control system.', C_, DR, false)
      ] },
      { t: 'Documentation and qualification', c: [
        c('The supplier shall provide a datasheet, the performance curve, a dimensional drawing, material certificates, an operation and maintenance manual and a recommended spare parts list.', M, DOC),
        c('The supplier shall support design, installation and operational qualification (DQ, IQ and OQ) by providing the documents and traceability needed for the user’s protocols.', M, DOC, true, gmpOn),
        c('The supplier shall provide a compliance statement against this URS, listing every deviation, so that design qualification can be traced to the requirements.', M, DR, true, gmpOn),
        c('The user may request an extended documentation package, including calibration certificates for instruments supplied with the pump.', C_, DOC, false)
      ] },
      { t: 'Testing: FAT and SAT', c: [
        c('The factory acceptance test shall include a pressure test of the casing and a hydraulic performance test to a recognised standard (for example ISO 9906), and shall be available for the user to witness.', S_, FAT),
        c('The site acceptance test shall include checks of alignment, direction of rotation, leak tightness, a run test at the operating point and a vibration baseline reading.', M, SAT)
      ] },
      { t: 'Spares, delivery and warranty', c: [
        c('The supplier shall provide a list of recommended spares for commissioning and for two years of operation, with lead times.', S_, DOC),
        c('Delivery shall be within {delivery}, with packing that protects machined surfaces and seals from damage and moisture.', S_, DOC),
        c('The supplier shall warrant the pump against defects in design, materials and workmanship for {warranty}.', M, DOC),
        c('The supplier shall provide local service support with an agreed response time.', C_, DOC, false)
      ] }
    ],

    hx: [
      { t: 'Process and thermal performance', c: [
        c('The {htype} exchanger shall transfer a duty of {duty}, cooling {hf} from {thi} to {tho} and heating {cf} from {tci} to {tco}.', M, 'FAT, Design review'),
        c('The supplier shall state the heat transfer area provided and shall provide an area margin of not less than {margin} over the calculated required area at the specified fouling resistance of {foul}.', M, DR),
        c('The pressure drop shall not exceed {dph} on the hot side and {dpc} on the cold side at the design flow.', M, DR),
        c('The exchanger shall perform stably at reduced flow and the supplier shall state any flow rate at which pass distribution, condensing or boiling becomes unstable.', S_, DR),
        c('The design shall avoid contamination of the product by the utility. Where practicable the product side shall operate at higher pressure than the utility side, or the supplier shall offer a design with leak detection.', M, DR, true, prodOn),
        c('The supplier shall state how thermal expansion and differential expansion between the two sides are accommodated.', S_, DR),
        c('The supplier shall state the thermal and hydraulic design method and software used and shall provide the calculation output.', S_, DOC)
      ] },
      { t: 'Mechanical design and construction', c: [
        c('The exchanger shall be designed to a recognised pressure equipment code (for example ASME Section VIII or an equivalent code agreed with the user) for {pdh} on the hot side, {pdc} on the cold side and {dt}.', M, DOC),
        c('The shell and tube exchanger shall follow TEMA (or an equivalent standard) and the supplier shall state the TEMA class and type. The tube bundle design shall consider flow-induced tube vibration.', M, DR, true, function (v) { return /^Shell/.test(v.htype); }),
        c('The supplier shall state whether the tube bundle can be withdrawn, and the clearance needed, and shall allow cleaning of the tube side without removing the shell.', S_, DR, true, function (v) { return /^Shell/.test(v.htype); }),
        c('The plate pack shall have capacity for extension, the plate and gasket pressure and temperature ratings shall be stated, and the tightening dimensions shall be shown on the drawing.', S_, DR, true, function (v) { return /^Plate/.test(v.htype); }),
        c('Gasket material shall be compatible with the process fluids and the cleaning agents, and gaskets in product contact shall have a compliance declaration.', M, DOC, true, function (v) { return /^Plate/.test(v.htype); }),
        c('Vents and drains shall be provided on both sides so that the exchanger can be fully vented and drained in the installed position.', M, DR),
        c('Nozzle loads and the supports shall be stated by the supplier, and lifting points shall be provided.', S_, DR),
        c('A pressure relief provision against blocked-in thermal expansion shall be identified for each side, and the supplier shall state the connections available for relief devices.', M, DR)
      ] },
      { t: 'Materials and surface finish', c: [
        c('Wetted parts shall be made of {moc} and shall be compatible with the fluids, the temperatures and the cleaning agents in use.', M, 'Design review, Documentation'),
        c('Product-contact materials, including gaskets and seals, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
        c('Product-contact surfaces shall have a surface roughness not greater than {finish}, with the measurement record provided.', M, 'FAT, Documentation', true, gmpProd),
        c('Product-contact tubes and welds shall be crevice-free, smooth and fully penetrated, and tube-to-tubesheet joints shall be designed to avoid crevices that cannot be cleaned.', S_, DR, true, function (v) { return gmpProd(v) && /^Shell/.test(v.htype); }),
        c('The exchanger shall be drainable with no pockets where product can remain after draining.', M, DR, true, gmpProd),
        c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for pressure parts and wetted parts, and weld maps.', S_, DOC)
      ] },
      { t: 'Utilities, cleaning and environment', c: [
        c('The exchanger shall withstand the cleaning method ({cleaning}), including temperature, pressure cycling and cleaning chemicals, without damage.', M, 'Design review, SAT', true, cipOn),
        c('The exchanger shall be bonded and earthed, and any electrically isolated metal parts shall be identified by the supplier.', M, SAT, true, zoneOn),
        c('Any electrical or instrument items supplied with the exchanger shall be certified for {zone}.', M, DOC, true, zoneOn),
        c('The exchanger shall be suitable for {loc} installation, with insulation or personnel protection as stated in the user’s standard.', S_, DR)
      ] },
      { t: 'Instrumentation and control', c: [
        c('Temperature and pressure measurement connections shall be provided on the inlet and outlet of each side.', S_, DR),
        c('Where the process requires it, a connection for leak detection or sampling of the utility side shall be provided.', C_, DR, false),
        c('The supplier shall state any minimum flow, maximum rate of temperature change and thermal shock limits, so that the control scheme can respect them.', M, DR)
      ] },
      { t: 'Documentation and qualification', c: [
        c('The supplier shall provide a thermal datasheet, mechanical drawings, design calculations, the pressure equipment data report, material certificates, an operation and maintenance manual and a spare parts list.', M, DOC),
        c('The supplier shall support DQ, IQ and OQ by providing the documents and traceability needed for the user’s protocols.', M, DOC, true, gmpOn),
        c('The supplier shall provide a compliance statement against this URS, listing every deviation.', M, DR, true, gmpOn)
      ] },
      { t: 'Testing: FAT and SAT', c: [
        c('The factory acceptance test shall include a hydrostatic or pneumatic pressure test of each side to the applicable code, a dimensional check and a visual check, and shall be available for the user to witness.', M, FAT),
        c('The product-contact surface finish and the drainability shall be verified at the factory acceptance test.', S_, FAT, true, gmpProd),
        c('The site acceptance test shall include a leak check of both sides, a check of connections against the P&ID and, where agreed, a thermal performance check at the first production run.', M, SAT)
      ] },
      { t: 'Spares, delivery and warranty', c: [
        c('The supplier shall provide recommended spares, including gaskets, plugs or spare plates as applicable, with lead times.', S_, DOC),
        c('Delivery shall be within {delivery}, with all connections protected and the exchanger packed to prevent damage and moisture ingress.', S_, DOC),
        c('The supplier shall warrant the exchanger against defects in design, materials and workmanship for {warranty}.', M, DOC),
        c('The supplier shall offer cleaning or refurbishment services and state the response time.', C_, DOC, false)
      ] }
    ],

    col: [
      { t: 'Process and separation performance', c: [
        c('The {ctype} shall separate {feed} to give a top product purity of not less than {purity} and a recovery of not less than {recov}, operating at {press} at the column top.', M, 'Design review, SAT'),
        c('The supplier shall state the thermodynamic model and the vapour-liquid equilibrium data used, and shall provide a simulation or calculation showing the separation performance and its sensitivity to feed composition.', M, DOC),
        c('The column shall operate at a feed rate of {rate} within an operating range of {turn} of design load, with a reflux ratio range of {rr}.', M, DR, true, function (v) { return v.cmode === 'Continuous'; }),
        c('The column shall process a batch charge of {batch} within an operating range of {turn} of design load, with a reflux ratio range of {rr}, and shall allow several product cuts with sampling between cuts.', M, DR, true, function (v) { return v.cmode === 'Batch'; }),
        c('The supplier shall state the vapour and liquid loads as a percentage of the flooding limit at the design and the minimum load, and the pressure drop at design load shall not exceed {dpmax}.', M, DR),
        c('Liquid temperature anywhere in the column or reboiler shall not exceed the thermal sensitivity limit of {thsens}. The supplier shall state the hold-up and residence time at the bottom temperature of {tbot}.', M, DR),
        c('The reboiler shall provide {rebo} and the condenser {cond}, and the supplier shall state the design margin on each.', M, DR),
        c('The hold-up of liquid in the column shall be as low as practicable and shall be stated by the supplier. Start-up to total reflux and the changeover between cuts shall be possible without disturbing the column.', S_, DR, true, function (v) { return v.cmode === 'Batch'; }),
        c('The feed shall be capable of entering at more than one point, and the supplier shall state the feed stage options.', S_, DR, true, function (v) { return v.cmode === 'Continuous'; })
      ] },
      { t: 'Internals', c: [
        c('The packing type, material and size shall be stated by the supplier, with the packed height, the stage equivalent (HETP) used for the design and a liquid distributor design that gives even wetting at the minimum load.', M, DR, true, function (v) { return /^Packed/.test(v.ctype); }),
        c('Packed beds shall have support and hold-down grids, liquid redistribution where the bed height requires it, and a way to remove packing for inspection and cleaning.', M, DR, true, function (v) { return /^Packed/.test(v.ctype); }),
        c('The tray type, number of trays, tray efficiency basis and the turndown limit (weeping and flooding) shall be stated by the supplier.', M, DR, true, function (v) { return /^Tray/.test(v.ctype); }),
        c('Trays shall be levelled, leak-tight at the downcomer seals, and provided with manways at intervals that allow inspection and cleaning of all trays.', M, DR, true, function (v) { return /^Tray/.test(v.ctype); }),
        c('Internals shall be removable through the manways or designed so that the cleaning method ({cleaning}) reaches all surfaces.', S_, 'Design review, SAT', true, cipOn)
      ] },
      { t: 'Mechanical design and construction', c: [
        c('The column, reboiler and condenser shall be designed to a recognised pressure vessel code (for example ASME Section VIII or an equivalent code agreed with the user) for a design pressure of {dpress} and a design temperature of {dt}.', M, DOC),
        c('The column shall be rated for full vacuum and leak-tight at the operating vacuum. The supplier shall state the permitted leak rate and the leak test method.', M, 'FAT, SAT', true, function (v) { return v.vac === 'Yes'; }),
        c('Nozzle loads, wind and seismic loads (for outdoor installation), supports, and the column verticality tolerance shall be stated by the supplier.', S_, DR),
        c('Manways, sampling points, thermowells, level and pressure connections and lifting lugs shall be provided, with positions shown on the drawing.', M, DR),
        c('Insulation or personnel protection shall be provided for hot surfaces, with insulation supports that suit the column surface and the cleaning method.', S_, DR),
        c('Vent, drain and inert gas connections shall be provided, with vacuum break to nitrogen.', M, DR)
      ] },
      { t: 'Materials and surface finish', c: [
        c('Wetted parts shall be made of {moc} and shall be compatible with the feed, all expected impurities and the cleaning agents in use.', M, 'Design review, Documentation'),
        c('Product-contact materials, including gaskets and any packing or tray gaskets, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
        c('Product-contact surfaces shall have a surface roughness not greater than {finish}, with the measurement record provided.', M, 'FAT, Documentation', true, gmpProd),
        c('Product-contact welds shall be smooth, fully penetrated and recorded on a weld map, and the column shall be drainable with no pockets.', M, DOC, true, gmpProd),
        c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for pressure parts and wetted parts.', S_, DOC)
      ] },
      { t: 'Utilities, cleaning and environment', c: [
        c('The column shall be cleaned by {cleaning}. Spray devices shall cover all internal surfaces and the supplier shall state the coverage verification method.', M, 'Design review, SAT', true, cipOn),
        c('The column, piping and all conductive parts shall be bonded and earthed, and electrically isolated metal parts shall be identified by the supplier.', M, SAT, true, zoneOn),
        c('All electrical and instrument equipment supplied shall be certified for {zone}.', M, DOC, true, zoneOn),
        c('Vent and off-gas routing shall be shown, with a vent condenser or equivalent that meets the user’s emission limits.', M, DR),
        c('The column shall be suitable for {loc} installation.', S_, DR)
      ] },
      { t: 'Safety and relief', c: [
        c('The supplier shall state the connections provided for relief devices and shall give the vapour generation data for each relief scenario the user has identified (for example loss of cooling, blocked outlet, fire).', M, DR),
        c('The column shall have no cold spots or dead legs where solvent can accumulate and form hazardous mixtures during start-up or shutdown.', S_, DR),
        c('The supplier shall state the safe operating limits on temperature and pressure, including the minimum temperature of the condenser and the maximum bottom temperature.', M, DR)
      ] },
      { t: 'Instrumentation and control', c: [
        c('Temperature measurement shall be provided at the top, the bottom and at the agreed points along the column, and column differential pressure, top pressure, reflux flow, reboiler level and condenser outlet temperature shall be measurable.', M, DR),
        c('Closed sampling points shall be provided at the agreed locations for the top product, the bottoms and the feed.', S_, DR),
        c('The supplier shall state the control scheme assumed for the column and the interlocks recommended, for example on high column pressure, loss of cooling and low reboiler level.', M, DR),
        c('Instruments supplied shall have calibration certificates.', C_, DOC, false)
      ] },
      { t: 'Documentation and qualification', c: [
        c('The supplier shall provide a datasheet, the process and mechanical design calculations, drawings, the pressure equipment data report, material certificates, an operation and maintenance manual and a spare parts list.', M, DOC),
        c('The supplier shall support DQ, IQ and OQ by providing the documents and traceability needed for the user’s protocols.', M, DOC, true, gmpOn),
        c('The supplier shall provide a compliance statement against this URS listing every deviation.', M, DR, true, gmpOn)
      ] },
      { t: 'Testing: FAT and SAT', c: [
        c('The factory acceptance test shall include a pressure test to the applicable code, a dimensional check, a visual check of welds and internals, and a leak test at the specified vacuum level.', M, FAT),
        c('The product-contact surface finish, the drainability and the internals installation shall be verified at the factory acceptance test.', S_, FAT, true, gmpProd),
        c('The site acceptance test shall include a leak test under vacuum, a check of connections against the P&ID, verification of liquid distribution or tray levelness, and a performance test with a test mixture where agreed.', M, SAT)
      ] },
      { t: 'Spares, delivery and warranty', c: [
        c('The supplier shall provide recommended spares, including gaskets and any wear parts, with lead times.', S_, DOC),
        c('Delivery shall be within {delivery}, with openings blanked, internals protected, and the column packed to prevent damage and moisture ingress.', S_, DOC),
        c('The supplier shall warrant the column against defects in design, materials and workmanship for {warranty}.', M, DOC),
        c('The supplier shall offer commissioning support and operator training and state the cost basis.', C_, DOC, false)
      ] }
    ]
  };


  LIB.rx = [
    { t: 'Process and performance requirements', c: [
      c('The reactor shall have a nominal working volume of {vol} and shall operate between {fmin} and {fmax} fill without the agitator, probes or heat transfer surface becoming uncovered or the liquid reaching the nozzles.', M, DR),
      c('The reactor shall carry out the process: {proc}, over an operating temperature range of {trange} with reaction mass of up to {visc}.', M, DR),
      c('The agitator shall give uniform mixing and temperature across the stated fill range, including at minimum fill, and shall keep solids ({solids}) suspended. The supplier shall state the mixing basis (for example power per volume and tip speed).', M, DR),
      c('The jacket shall heat the contents from 20 °C to the operating temperature within {heat} and cool them back to 20 °C within {cool}, at nominal working volume. The supplier shall state the heat transfer area and the overall heat transfer coefficient assumed.', M, 'Design review, SAT'),
      c('The reactor shall remove a maximum reaction heat release of {qrx} at the operating temperature, with the utilities stated: {util}. The supplier shall state the temperature difference assumed.', M, DR),
      c('The reactor shall allow vacuum operation, and the supplier shall state the leak rate achieved and the test method.', M, 'FAT, SAT', true, function (v) { return v.vac === 'Yes'; })
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The reactor shall be designed to a recognised pressure vessel code (for example ASME Section VIII or an equivalent code agreed with the user) for a design pressure of {dpress} and a design temperature of {dt}.', M, DOC),
      c('The vessel and jacket shall be rated for full vacuum on the vessel side, with the jacket pressure and vacuum rating stated separately.', M, DOC, true, function (v) { return v.vac === 'Yes'; }),
      c('The jacket (or limpet coils) shall give uniform flow with no dead zones, and the supplier shall state the pressure drop and the maximum rate of temperature change that avoids thermal shock to the vessel.', M, DR),
      c('The supplier shall state the nozzle layout, the loads, the supports and the weight of the filled vessel, and shall provide lifting points.', S_, DR),
      c('The bottom outlet valve shall be flush with the vessel interior, shall drain the vessel completely without pockets and shall be suitable for the product and for cleaning.', M, DR),
      c('The reactor shall have a manway of adequate size for inspection and cleaning, and a sight glass and lamp, with the positions shown on the drawing.', S_, DR),
      c('Baffles: {baf}. The supplier shall state how the baffle affects mixing, cleaning and drainage.', S_, DR)
    ] },
    { t: 'Agitator and shaft sealing', c: [
      c('The agitator shall be a {atype} operating over {rpm} with speed control by {drive}. The supplier shall state the motor power, the torque at the highest viscosity and the shaft critical speed margin.', M, DR),
      c('The agitator shaft seal shall be: {rseal}. The supplier shall state the seal type, the support plan and the flush or barrier arrangement.', M, DR),
      c('The barrier fluid system shall include a reservoir with level and pressure indication and alarms on loss of barrier, and a barrier fluid compatible with the product.', M, DR, true, function (v) { return /^Double/.test(v.rseal); }),
      c('The magnetic drive shall be protected against loss of cooling and over-temperature of the containment shell, and the supplier shall state how each condition is detected.', M, DR, true, function (v) { return /^Magnetic/.test(v.rseal); }),
      c('The agitator shall be protected against overload and shall be interlocked so that a rotation failure (for example shaft slip or drive stop) is detected and alarmed.', M, 'Design review, FAT'),
      c('The agitator and shaft shall not damage the glass lining. The supplier shall state the clearance from the vessel wall and any impeller coating or lining, and shall provide a way to protect the lining during maintenance.', M, DR, true, function (v) { return /^Glass/.test(v.rtype); })
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} and shall be compatible with the reaction mass, impurities, temperature and the cleaning agents in use.', M, 'Design review, Documentation'),
      c('The glass lining shall be free of defects when tested by high-voltage spark testing, and the supplier shall state the glass grade, thickness and the chemical and thermal shock limits.', M, 'FAT, Documentation', true, function (v) { return /^Glass/.test(v.rtype); }),
      c('Product-contact stainless steel surfaces shall have a surface roughness not greater than {finish}, with the measurement record provided.', M, 'FAT, Documentation', true, function (v) { return gmpProd(v) && /^Stainless/.test(v.rtype); }),
      c('Product-contact welds shall be smooth, fully penetrated and recorded on a weld map, and the vessel shall be free of crevices and dead legs.', M, DOC, true, function (v) { return gmpProd(v) && /^Stainless/.test(v.rtype); }),
      c('Product-contact materials, including gaskets, seals and sight glass, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for the vessel, jacket and wetted parts.', S_, DOC)
    ] },
    { t: 'Nozzles, charging and inerting', c: [
      c('Charging systems shall be: {chg}. The supplier shall state the nozzle sizes, positions and the way each charge enters the liquid, so that the reaction is not disturbed.', M, DR),
      c('Solids charging shall not release dust into the room and shall allow the transfer of powder without breaking the inerting.', S_, DR, true, function (v) { return /Solids/i.test(v.chg); }),
      c('The vessel shall be inerted with nitrogen, with a pressure control and a vent path, and the supplier shall state the purge method and the oxygen level that can be reached.', M, 'Design review, SAT', true, function (v) { return /^Nitrogen/.test(v.inert); }),
      c('Vacuum and nitrogen connections shall be provided, with a means to break vacuum to nitrogen and protection against back-flow of vacuum pump or scrubber liquid.', M, DR),
      c('Sampling shall be possible without opening the vessel, and a closed sampling method shall be provided.', S_, DR)
    ] },
    { t: 'Condenser, vent and relief', c: [
      c('The overhead condenser shall remove {cond} and shall be sized for reflux and distillation duties stated by the user. The supplier shall state the area, the coolant and the allowable pressure drop.', M, DR),
      c('Pressure relief shall be provided by a relief valve, a rupture disc or both, and the supplier shall state the connection sizes available on the vessel. The relief device shall be sized by the user from the stated basis: {run}.', M, DR),
      c('The sizing basis for relief shall include a runaway reaction case if the user’s hazard assessment identifies one, using reaction calorimetry data supplied by the user. The supplier shall not size relief without this data.', M, DOC),
      c('Rupture discs shall be fitted with burst indication, and the discharge shall be routed to a safe location, such as a catch tank or scrubber, shown on the P&ID.', M, DR),
      c('Vent and off-gas routing shall be shown, with a vent condenser or equivalent that meets the user’s emission limits.', M, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The reactor shall have temperature measurement of the contents (with redundancy for critical control), jacket inlet and outlet temperatures, vessel pressure and level, and agitator rotation or motor current.', M, DR),
      c('The agitator rotation signal shall be used in an interlock that stops dosing of reactive material when stirring stops, with the logic agreed with the user.', M, 'Design review, FAT'),
      c('High temperature, high pressure and loss of cooling shall be alarmed, and the supplier shall state the independent protection layers assumed in the design.', M, DR),
      c('Weighing or flow-metered dosing shall be possible with interlocks on maximum fill and on maximum dosing rate.', S_, DR, false),
      c('Instruments supplied shall have calibration certificates.', C_, DOC, false)
    ] },
    { t: 'Cleaning, environment and hazardous area', c: [
      c('The vessel shall be cleaned by {cleaning}. Spray balls or devices shall cover all internal surfaces, including the agitator, baffle, nozzles and the underside of the lid, and the supplier shall state the coverage verification method.', M, 'Design review, SAT', true, cipOn),
      c('The vessel shall be drainable, with no pockets where cleaning agent or product can remain.', M, DR, true, gmpProd),
      c('The reactor, agitator motor and all electrical and instrument equipment shall be certified for {zone}. The supplier shall state the gas group and temperature class.', M, DOC, true, zoneOn),
      c('The vessel, agitator, piping and all conductive parts shall be bonded and earthed. For glass-lined equipment the supplier shall state the measures against static charge build-up on the lining and the contents.', M, SAT, true, zoneOn),
      c('The reactor shall be suitable for {loc} installation, with insulation or personnel protection for hot surfaces.', S_, DR)
    ] },
    { t: 'Documentation and qualification', c: [
      c('The supplier shall provide a datasheet, vessel and agitator drawings, design calculations, the pressure equipment data report, material certificates, an operation and maintenance manual and a spare parts list.', M, DOC),
      c('The supplier shall support DQ, IQ, OQ and PQ by providing the documents and traceability needed for the user’s protocols.', M, DOC, true, gmpOn),
      c('The supplier shall provide a compliance statement against this URS listing every deviation.', M, DR, true, gmpOn)
    ] },
    { t: 'Testing: FAT and SAT', c: [
      c('The factory acceptance test shall include a pressure test to the applicable code, a vacuum leak test, a dimensional check, the spark test of the glass lining (if applicable) and a visual check, and shall be available for the user to witness.', M, FAT),
      c('The agitator shall be run at the speed range in the FAT with vibration and power checks, and the shaft seal shall be tested at the agreed pressure.', S_, FAT),
      c('The site acceptance test shall include a leak test, a check of connections against the P&ID, a water trial of heating and cooling rates, and a test of the agitator interlock.', M, SAT)
    ] },
    { t: 'Spares, delivery and warranty', c: [
      c('The supplier shall provide recommended spares, including mechanical seal parts, gaskets and sight glasses, with lead times.', S_, DOC),
      c('Delivery shall be within {delivery}, with openings blanked and the lining and nozzles protected for transport.', S_, DOC),
      c('The supplier shall warrant the reactor against defects in design, materials and workmanship for {warranty}.', M, DOC),
      c('The supplier shall offer glass repair and recoating services and state the response time.', C_, DOC, false, function (v) { return /^Glass/.test(v.rtype); })
    ] }
  ];

  /* number clauses per equipment, stable by position */
  Object.keys(LIB).forEach(function (eq) {
    var n = 0;
    LIB[eq].forEach(function (sec) { sec.c.forEach(function (cl) { n++; cl.id = 'URS-' + EQ[eq].pfx + '-' + ('00' + n).slice(-3); }); });
  });
  function total(eq) { var n = 0; LIB[eq].forEach(function (s) { n += s.c.length; }); return n; }

  /* ---------- state ---------- */
  function freshEq(eq) {
    var v = {};
    EQ[eq].fields.forEach(function (f) { v[f.k] = f.d; });
    return { v: v, sel: {}, pri: {}, ver: {}, custom: [] };
  }
  var S = load();
  if (!S || !S.d || !S.hdr) {
    S = { eq: 'pump', hdr: { project: '', doc: '', rev: '0', by: '' }, d: { pump: freshEq('pump'), hx: freshEq('hx'), col: freshEq('col'), rx: freshEq('rx') } };
  }
  ['pump', 'hx', 'col', 'rx'].forEach(function (eq) {
    if (!S.d[eq]) S.d[eq] = freshEq(eq);
    EQ[eq].fields.forEach(function (f) { if (S.d[eq].v[f.k] === undefined) S.d[eq].v[f.k] = f.d; });
  });
  if (!EQ[S.eq]) S.eq = 'pump';
  function cur() { return S.d[S.eq]; }

  /* ---------- clause logic ---------- */
  function fieldOf(eq, k) { for (var i = 0; i < EQ[eq].fields.length; i++) if (EQ[eq].fields[i].k === k) return EQ[eq].fields[i]; return null; }
  function sub(eq, text, v) {
    return text.replace(/\{(\w+)\}/g, function (m, k) {
      var f = fieldOf(eq, k); var val = v[k];
      if (val === undefined || val === '' || val === null) return '[to be specified]';
      return (f && f.u ? val + ' ' + f.u : val);
    });
  }
  function applicable(eq) {
    var st = S.d[eq], v = st.v, out = [];
    LIB[eq].forEach(function (sec) {
      var list = [];
      sec.c.forEach(function (cl) { if (!cl.w || cl.w(v)) list.push(cl); });
      if (list.length) out.push({ t: sec.t, c: list });
    });
    return out;
  }
  function isOn(eq, cl) { var s = S.d[eq].sel[cl.id]; return s === undefined ? cl.d : !!s; }
  function priOf(eq, cl) { return S.d[eq].pri[cl.id] || cl.p; }
  function verOf(eq, cl) { return S.d[eq].ver[cl.id] || cl.m; }
  function chosen(eq) {
    var out = [];
    applicable(eq).forEach(function (sec) {
      var rows = [];
      sec.c.forEach(function (cl) { if (isOn(eq, cl)) rows.push({ id: cl.id, t: sub(eq, cl.t, S.d[eq].v), p: priOf(eq, cl), m: verOf(eq, cl) }); });
      if (rows.length) out.push({ t: sec.t, rows: rows });
    });
    var cs = S.d[eq].custom.filter(function (x) { return x.t && x.t.trim(); });
    if (cs.length) out.push({ t: 'Additional user requirements', rows: cs.map(function (x, i) { return { id: 'URS-' + EQ[eq].pfx + '-C' + ('0' + (i + 1)).slice(-2), t: x.t.trim(), p: x.p || 'Should', m: x.m || 'Design review' }; }) });
    return out;
  }

  /* ---------- document builders ---------- */
  function grouped(eq) {
    var g = {}, order = [];
    EQ[eq].fields.forEach(function (f) {
      if (f.sh && !f.sh(S.d[eq].v)) return;
      if (!g[f.g]) { g[f.g] = []; order.push(f.g); }
      var val = S.d[eq].v[f.k];
      g[f.g].push([f.l, (val === '' || val == null) ? '[to be specified]' : val + (f.u ? ' ' + f.u : '')]);
    });
    return order.map(function (n) { return { t: n, rows: g[n] }; });
  }
  function docModel() {
    var eq = S.eq, E = EQ[eq], v = cur().v, h = S.hdr, secs = chosen(eq);
    var n = 3;
    secs.forEach(function (s) { s.no = n++; });
    return { eq: eq, E: E, v: v, h: h, secs: secs, defNo: n, apprNo: n + 1,
      intro: 'This User Requirement Specification (URS) states what the user requires from the ' + E.noun + ' ' + (v.tag ? '(' + v.tag + ') ' : '') + 'for ' + (h.project ? h.project : '[project]') + '. It is written before purchase so that suppliers can quote against it and so that the delivered equipment can be qualified against it.' };
  }
  var LEG = [['Must', 'Mandatory. A quotation that does not meet it is not acceptable.'], ['Should', 'Strongly preferred. The supplier states any deviation.'], ['Could', 'Optional. May be included for a price option.']];
  var VER = [['Design review', 'Checked against drawings, datasheets and calculations before manufacture.'], ['FAT', 'Checked at the supplier’s works by test or inspection.'], ['SAT', 'Checked on site after installation.'], ['Documentation', 'Evidenced by certificates, records or manuals.']];

  function docHTML(word) {
    var D = docModel(), t = 'font-family:Arial,Helvetica,sans-serif;';
    var tb = 'border-collapse:collapse;width:100%;font-size:' + (word ? '10pt' : '13px') + ';';
    var td = 'border:1px solid #888;padding:4px 6px;vertical-align:top;text-align:left;';
    var th = td + 'background:#E8ECF0;font-weight:bold;';
    var h = '';
    h += '<h1 style="' + t + 'font-size:' + (word ? '18pt' : '22px') + ';margin:0 0 4px">User Requirement Specification</h1>';
    h += '<p style="' + t + 'margin:0 0 10px;font-size:' + (word ? '12pt' : '15px') + '">' + esc(D.E.label) + (D.v.tag ? ': ' + esc(D.v.tag) : '') + '</p>';
    h += '<table style="' + tb + '"><tr><th style="' + th + '">Project</th><td style="' + td + '">' + esc(D.h.project || '[to be specified]') + '</td><th style="' + th + '">Document no.</th><td style="' + td + '">' + esc(D.h.doc || '[to be specified]') + '</td></tr>' +
      '<tr><th style="' + th + '">Revision</th><td style="' + td + '">' + esc(D.h.rev || '0') + '</td><th style="' + th + '">Date</th><td style="' + td + '">' + today() + '</td></tr>' +
      '<tr><th style="' + th + '">Prepared by</th><td style="' + td + '">' + esc(D.h.by || '[to be specified]') + '</td><th style="' + th + '">Equipment</th><td style="' + td + '">' + esc(D.E.label) + '</td></tr></table>';
    h += '<h2 style="' + t + 'font-size:' + (word ? '14pt' : '17px') + ';margin:18px 0 6px">1 Purpose and scope</h2><p style="' + t + 'font-size:' + (word ? '10.5pt' : '14px') + ';line-height:1.45">' + esc(D.intro) + '</p>';
    h += '<p style="' + t + 'font-size:' + (word ? '10.5pt' : '14px') + ';line-height:1.45">Priority: ' + LEG.map(function (x) { return '<b>' + x[0] + '</b>, ' + esc(x[1]).replace(/\.$/, ''); }).join('; ') + '. Verification: ' + VER.map(function (x) { return '<b>' + x[0] + '</b>, ' + esc(x[1]).replace(/\.$/, ''); }).join('; ') + '.</p>';
    h += '<h2 style="' + t + 'font-size:' + (word ? '14pt' : '17px') + ';margin:18px 0 6px">2 Process and design data</h2>';
    grouped(D.eq).forEach(function (g) {
      h += '<h3 style="' + t + 'font-size:' + (word ? '11pt' : '14px') + ';margin:10px 0 4px">' + esc(g.t) + '</h3><table style="' + tb + '">';
      g.rows.forEach(function (r) { h += '<tr><td style="' + td + 'width:48%">' + esc(r[0]) + '</td><td style="' + td + '">' + esc(r[1]) + '</td></tr>'; });
      h += '</table>';
    });
    D.secs.forEach(function (s) {
      h += '<h2 style="' + t + 'font-size:' + (word ? '14pt' : '17px') + ';margin:18px 0 6px">' + s.no + ' ' + esc(s.t) + '</h2><table style="' + tb + '"><tr><th style="' + th + 'width:15%">ID</th><th style="' + th + '">Requirement</th><th style="' + th + 'width:9%">Priority</th><th style="' + th + 'width:16%">Verification</th></tr>';
      s.rows.forEach(function (r) { h += '<tr><td style="' + td + '">' + esc(r.id) + '</td><td style="' + td + '">' + esc(r.t) + '</td><td style="' + td + '">' + esc(r.p) + '</td><td style="' + td + '">' + esc(r.m) + '</td></tr>'; });
      h += '</table>';
    });
    h += '<h2 style="' + t + 'font-size:' + (word ? '14pt' : '17px') + ';margin:18px 0 6px">' + D.defNo + ' Abbreviations</h2><p style="' + t + 'font-size:' + (word ? '10.5pt' : '14px') + ';line-height:1.45">URS: user requirement specification. DQ, IQ, OQ, PQ: design, installation, operational and performance qualification. FAT, SAT: factory and site acceptance test. GMP: good manufacturing practice. CIP, SIP: clean-in-place, steam-in-place. P&amp;ID: piping and instrumentation diagram.</p>';
    h += '<h2 style="' + t + 'font-size:' + (word ? '14pt' : '17px') + ';margin:18px 0 6px">' + D.apprNo + ' Approval</h2><table style="' + tb + '"><tr><th style="' + th + '">Role</th><th style="' + th + '">Name</th><th style="' + th + '">Signature</th><th style="' + th + '">Date</th></tr>' +
      ['Prepared by', 'Reviewed by (engineering)', 'Reviewed by (quality assurance)', 'Approved by'].map(function (r, i) { return '<tr><td style="' + td + '">' + r + '</td><td style="' + td + '">' + (i === 0 ? esc(D.h.by) : '') + '</td><td style="' + td + 'height:26px"></td><td style="' + td + '"></td></tr>'; }).join('') + '</table>';
    h += '<p style="' + t + 'font-size:' + (word ? '9pt' : '12px') + ';color:#555;margin-top:14px">Generated with the PharmaChemE URS builder. This is a starting draft. Review every requirement against your own quality system, standards and site rules before issue.</p>';
    return h;
  }
  function wordHTML() {
    return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>URS</title><style>@page{size:A4;margin:2cm}body{font-family:Arial,sans-serif}</style></head><body>' + docHTML(true) + '</body></html>';
  }
  function plainText() {
    var D = docModel(), L = [];
    L.push('USER REQUIREMENT SPECIFICATION', D.E.label + (D.v.tag ? ': ' + D.v.tag : ''), '');
    L.push('Project: ' + (D.h.project || '[to be specified]'), 'Document no.: ' + (D.h.doc || '[to be specified]'), 'Revision: ' + (D.h.rev || '0'), 'Date: ' + today(), 'Prepared by: ' + (D.h.by || '[to be specified]'), '');
    L.push('1 PURPOSE AND SCOPE', D.intro, '', '2 PROCESS AND DESIGN DATA');
    grouped(D.eq).forEach(function (g) { L.push(g.t); g.rows.forEach(function (r) { L.push('  ' + r[0] + ': ' + r[1]); }); });
    D.secs.forEach(function (s) { L.push('', s.no + ' ' + s.t.toUpperCase()); s.rows.forEach(function (r) { L.push(r.id + ' [' + r.p + '; ' + r.m + '] ' + r.t); }); });
    L.push('', 'Generated with the PharmaChemE URS builder. Review against your own quality system before issue.');
    return L.join('\n');
  }
  function csvText() {
    var D = docModel(), rows = [['ID', 'Section', 'Requirement', 'Priority', 'Verification', 'Equipment']];
    D.secs.forEach(function (s) { s.rows.forEach(function (r) { rows.push([r.id, s.t, r.t, r.p, r.m, D.E.label]); }); });
    return '﻿' + rows.map(function (r) { return r.map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
  }
  function fileBase() { var s = (S.hdr.doc || 'URS') + '-' + EQ[S.eq].pfx; return s.replace(/[^A-Za-z0-9_-]+/g, '-'); }
  function download(name, mime, data) {
    var b = new Blob([data], { type: mime });
    var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function copyText(txt, btn) {
    function done(ok) { var o = btn.textContent; btn.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(function () { btn.textContent = o; }, 1500); }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { fb(); }); } else fb();
    function fb() { var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } ta.remove(); done(ok); }
  }
  function printDoc() {
    var f = document.createElement('iframe'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(f);
    var d = f.contentWindow.document; d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(fileBase()) + '</title><style>@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#000}table{page-break-inside:auto}tr{page-break-inside:avoid}h2{page-break-after:avoid}</style></head><body>' + docHTML(false) + '</body></html>'); d.close();
    setTimeout(function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { /* ignore */ } setTimeout(function () { f.remove(); }, 2000); }, 250);
  }

  /* ---------- UI ---------- */
  function build() {
    var eq = S.eq, E = EQ[eq], st = cur();
    var h = '<div class="urs-grid"><div class="urs-left">';
    h += '<div class="urs-card"><h2>1. Choose the equipment</h2><div class="urs-tabs" role="tablist">';
    Object.keys(EQ).forEach(function (k) { h += '<button type="button" role="tab" class="urs-tab" data-eq="' + k + '" aria-selected="' + (k === eq ? 'true' : 'false') + '">' + esc(EQ[k].label) + '</button>'; });
    h += '</div><p class="urs-small">' + total(eq) + ' standard requirements are available for this equipment. Some appear only when your inputs call for them.</p></div>';
    h += '<div class="urs-card"><h2>2. Document details</h2><div class="urs-row">';
    [['project', 'Project'], ['doc', 'Document number'], ['rev', 'Revision'], ['by', 'Prepared by']].forEach(function (x) { h += '<label>' + x[1] + '<input type="text" data-h="' + x[0] + '" value="' + esc(S.hdr[x[0]]) + '"></label>'; });
    h += '</div></div>';
    h += '<div class="urs-card"><h2>3. Process and design inputs</h2><div id="urs-fields"></div></div>';
    h += '<div class="urs-card"><h2>4. Choose the requirements</h2><div class="urs-actions"><button type="button" class="urs-btn" data-act="all">Select all</button><button type="button" class="urs-btn" data-act="none">Clear all</button><button type="button" class="urs-btn" data-act="def">Reset to defaults</button></div><div id="urs-clauses"></div>' +
      '<h3>Your own requirements</h3><div id="urs-custom"></div><button type="button" class="urs-btn" data-act="addc">Add a requirement</button></div>';
    h += '</div><div class="urs-right"><div class="urs-bar" role="toolbar" aria-label="Export"><button type="button" class="urs-btn primary" data-x="print">Print or save PDF</button><button type="button" class="urs-btn" data-x="word">Download Word</button><button type="button" class="urs-btn" data-x="csv">Download CSV</button><button type="button" class="urs-btn" data-x="copy">Copy text</button><button type="button" class="urs-btn" data-x="reset">Reset all</button></div>' +
      '<p class="urs-small" id="urs-count"></p><div class="urs-doc" id="urs-doc" aria-live="polite"></div></div></div>';
    HOST.innerHTML = h;
    fields(); clauses(); custom(); preview();
  }
  function fields() {
    var eq = S.eq, st = cur(), box = $('#urs-fields'), out = '', last = '';
    EQ[eq].fields.forEach(function (f) {
      if (f.sh && !f.sh(st.v)) return;
      if (f.g !== last) { out += (last ? '</div></details>' : '') + '<details class="urs-grp" open><summary>' + esc(f.g) + '</summary><div class="urs-row">'; last = f.g; }
      out += '<label>' + esc(f.l) + (f.u ? ' <span class="urs-u">(' + esc(f.u) + ')</span>' : '');
      if (f.t === 'sel') { out += '<select data-k="' + f.k + '"' + (f.drv ? ' data-drv="1"' : '') + '>' + f.o.map(function (o) { return '<option' + (o === st.v[f.k] ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>'; }
      else out += '<input type="' + (f.t === 'num' ? 'text' : 'text') + '"' + (f.t === 'num' ? ' inputmode="decimal"' : '') + ' data-k="' + f.k + '"' + (f.drv ? ' data-drv="1"' : '') + ' value="' + esc(st.v[f.k]) + '">';
      out += '</label>';
    });
    box.innerHTML = out + '</div></details>';
  }
  var sig = '';
  function clauseSig() { var s = S.eq + '|'; applicable(S.eq).forEach(function (sec) { sec.c.forEach(function (cl) { s += cl.id + ','; }); }); return s; }
  function clauses() {
    var eq = S.eq, h = '', n = 0;
    applicable(eq).forEach(function (sec) {
      h += '<details class="urs-grp" open><summary>' + esc(sec.t) + '</summary>';
      sec.c.forEach(function (cl) {
        var p = priOf(eq, cl), m = verOf(eq, cl);
        h += '<div class="urs-cl"><label class="urs-chk"><input type="checkbox" data-id="' + cl.id + '"' + (isOn(eq, cl) ? ' checked' : '') + '><span><b>' + cl.id + '</b> ' + esc(sub(eq, cl.t, cur().v)) + '</span></label>' +
          '<div class="urs-mini"><select data-pri="' + cl.id + '" aria-label="Priority for ' + cl.id + '">' + ['Must', 'Should', 'Could'].map(function (o) { return '<option' + (o === p ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>' +
          '<select data-ver="' + cl.id + '" aria-label="Verification for ' + cl.id + '">' + verOptions(m) + '</select></div></div>';
        n++;
      });
      h += '</details>';
    });
    $('#urs-clauses').innerHTML = h; sig = clauseSig();
  }
  function verOptions(m) {
    var base = [DR, FAT, SAT, DOC, 'FAT, SAT', 'Design review, FAT', 'Design review, SAT', 'FAT, Documentation', 'Design review, Documentation', 'Design review, SAT'];
    var seen = {}, out = '';
    [m].concat(base).forEach(function (o) { if (seen[o]) return; seen[o] = 1; out += '<option' + (o === m ? ' selected' : '') + '>' + esc(o) + '</option>'; });
    return out;
  }
  function custom() {
    var st = cur(), h = '';
    st.custom.forEach(function (x, i) {
      h += '<div class="urs-cl"><textarea data-ct="' + i + '" rows="2" placeholder="Write the requirement as a sentence using shall or should">' + esc(x.t) + '</textarea><div class="urs-mini"><select data-cp="' + i + '" aria-label="Priority">' + ['Must', 'Should', 'Could'].map(function (o) { return '<option' + (o === (x.p || 'Should') ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select><select data-cv="' + i + '" aria-label="Verification">' + verOptions(x.m || DR) + '</select><button type="button" class="urs-btn" data-del="' + i + '">Remove</button></div></div>';
    });
    $('#urs-custom').innerHTML = h || '<p class="urs-small">None yet.</p>';
  }
  function preview() {
    $('#urs-doc').innerHTML = docHTML(false);
    var n = 0; chosen(S.eq).forEach(function (s) { n += s.rows.length; });
    $('#urs-count').textContent = n + ' requirements in the document.';
  }
  function changed(rebuildClauses) {
    save();
    if (rebuildClauses && clauseSig() !== sig) clauses(); else if (rebuildClauses) clauses();
    preview();
  }

  HOST.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.eq) { S.eq = b.dataset.eq; save(); build(); return; }
    var a = b.dataset.act, st = cur();
    if (a === 'all' || a === 'none') { applicable(S.eq).forEach(function (sec) { sec.c.forEach(function (cl) { st.sel[cl.id] = (a === 'all'); }); }); clauses(); changed(); return; }
    if (a === 'def') { st.sel = {}; st.pri = {}; st.ver = {}; clauses(); changed(); return; }
    if (a === 'addc') { st.custom.push({ t: '', p: 'Should', m: DR }); custom(); save(); preview(); return; }
    if (b.dataset.del !== undefined) { st.custom.splice(+b.dataset.del, 1); custom(); changed(); return; }
    var x = b.dataset.x;
    if (x === 'print') printDoc();
    else if (x === 'word') download(fileBase() + '.doc', 'application/msword', wordHTML());
    else if (x === 'csv') download(fileBase() + '.csv', 'text/csv;charset=utf-8', csvText());
    else if (x === 'copy') copyText(plainText(), b);
    else if (x === 'reset') { if (window.confirm('Clear this draft and return to the defaults?')) { try { localStorage.removeItem(KEY); } catch (er) { /* ignore */ } S.d = { pump: freshEq('pump'), hx: freshEq('hx'), col: freshEq('col'), rx: freshEq('rx') }; S.hdr = { project: '', doc: '', rev: '0', by: '' }; build(); } }
  });
  function onInput(e) {
    var t = e.target, st = cur();
    if (t.dataset.h) { S.hdr[t.dataset.h] = t.value; save(); preview(); return; }
    if (t.dataset.k) { st.v[t.dataset.k] = t.value; save(); if (t.dataset.drv && e.type === 'change') { fields(); clauses(); } else if (t.dataset.drv) { /* wait for change */ } else { clauses(); } preview(); return; }
    if (t.dataset.id) { st.sel[t.dataset.id] = t.checked; changed(); return; }
    if (t.dataset.pri) { st.pri[t.dataset.pri] = t.value; changed(); return; }
    if (t.dataset.ver) { st.ver[t.dataset.ver] = t.value; changed(); return; }
    if (t.dataset.ct !== undefined) { st.custom[+t.dataset.ct].t = t.value; save(); preview(); return; }
    if (t.dataset.cp !== undefined) { st.custom[+t.dataset.cp].p = t.value; changed(); return; }
    if (t.dataset.cv !== undefined) { st.custom[+t.dataset.cv].m = t.value; changed(); return; }
  }
  HOST.addEventListener('input', onInput);
  HOST.addEventListener('change', onInput);

  build();
  window.__urs = { S: function () { return S; }, total: total, chosen: chosen, csv: csvText, text: plainText, word: wordHTML };
})();
