/* URS builder equipment module: heat transfer, scrubber, tanks and pressure vessels.
   Loaded before urs-builder.js. Each A.add() registers one equipment type with its input fields and clause library. */
(window.PCE_URS = window.PCE_URS || { q: [] }).q.push(function (A) {
  var c = A.c, M = A.M, S_ = A.S_, C_ = A.C_, DR = A.DR, FAT = A.FAT, SAT = A.SAT, DOC = A.DOC, YN = A.YN;
  var gmpOn = A.gmpOn, prodOn = A.prodOn, gmpProd = A.gmpProd, zoneOn = A.zoneOn, cipOn = A.cipOn;
  function is(k, re) { return function (v) { return re.test(v[k] == null ? '' : String(v[k])); }; }
  function isnt(k, re) { return function (v) { return !re.test(v[k] == null ? '' : String(v[k])); }; }
  function both(a, b) { return function (v) { return a(v) && b(v); }; }
  var yes = is('vac', /^Yes/);

  /* shared closing sections, worded for the equipment named */
  function docs(noun, extra) {
    return { t: 'Documentation and qualification', c: [
      c('The supplier shall provide a datasheet, general arrangement and dimensional drawings, design calculations, the pressure equipment data report where applicable, material certificates, an operation and maintenance manual and a recommended spare parts list for the ' + noun + '.', M, DOC),
      c('The supplier shall support design, installation and operational qualification (DQ, IQ and OQ) by providing the documents and traceability needed for the user’s protocols.', M, DOC, true, gmpOn),
      c('The supplier shall provide a compliance statement against this URS, listing every deviation, so that design qualification can be traced to the requirements.', M, DR, true, gmpOn)
    ].concat(extra || []) };
  }
  function tests(noun, extra) {
    return { t: 'Testing: FAT and SAT', c: [
      c('The factory acceptance test of the ' + noun + ' shall include the pressure or leak test required by the applicable code, a dimensional check, a visual check and a check of nameplate and connections against the drawings, and shall be open to the user to witness.', M, FAT),
      c('The site acceptance test shall include a check of installation and connections against the P&ID, a leak check under operating conditions and a functional check of every instrument and alarm supplied.', M, SAT)
    ].concat(extra || []) };
  }
  function spares(noun, extra) {
    return { t: 'Spares, delivery and warranty', c: [
      c('The supplier shall provide a list of recommended commissioning and two-year operating spares for the ' + noun + ', with prices and lead times.', S_, DOC),
      c('Delivery shall be within {delivery}, and the supplier shall state any long-lead item that could delay this.', M, DOC),
      c('The warranty shall cover the equipment for {warranty}, and the supplier shall state the response time for service support.', M, DOC)
    ].concat(extra || []) };
  }

  /* ================= Condenser ================= */
  A.add('cond', {
    cat: 'Heat transfer', label: 'Condenser', pfx: 'CND', noun: 'condenser', varKey: 'ctype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'E-301 Reactor overhead condenser' },
      { g: 'Duty', k: 'ctype', l: 'Condenser type', t: 'sel', o: ['Shell and tube', 'Graphite (impervious graphite)', 'Plate (gasketed or welded)'], d: 'Shell and tube', drv: 1 },
      { g: 'Duty', k: 'role', l: 'Service', t: 'sel', o: ['Overhead condenser (total condenser)', 'Reflux condenser', 'Vent condenser', 'Condenser on a distillation receiver'], d: 'Overhead condenser (total condenser)', drv: 1 },
      { g: 'Duty', k: 'vap', l: 'Vapour to be condensed', t: 'text', d: 'Toluene with traces of hydrogen chloride' },
      { g: 'Duty', k: 'flow', l: 'Vapour flow at design', t: 'num', u: 'kg/h', d: '800' },
      { g: 'Duty', k: 'duty', l: 'Heat duty', t: 'num', u: 'kW', d: '150' },
      { g: 'Duty', k: 'tvin', l: 'Vapour inlet temperature', t: 'num', u: '°C', d: '110' },
      { g: 'Duty', k: 'tcond', l: 'Condensate outlet temperature', t: 'num', u: '°C', d: '40' },
      { g: 'Duty', k: 'popr', l: 'Operating pressure at the condenser', t: 'num', u: 'kPa(a)', d: '101' },
      { g: 'Duty', k: 'ncond', l: 'Non-condensable gases', t: 'text', d: 'Nitrogen purge, up to 5 % by volume' },
      { g: 'Duty', k: 'cw', l: 'Coolant', t: 'text', d: 'Cooling water, 30 °C supply and 36 °C return' },
      { g: 'Duty', k: 'dpv', l: 'Allowable vapour side pressure drop', t: 'num', u: 'kPa', d: '5' },
      { g: 'Duty', k: 'margin', l: 'Minimum area margin over required area', t: 'num', u: '%', d: '10' },
      { g: 'Design', k: 'pdh', l: 'Design pressure, process side', t: 'num', u: 'barg', d: '3' },
      { g: 'Design', k: 'pdc', l: 'Design pressure, coolant side', t: 'num', u: 'barg', d: '6' },
      { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '150' },
      { g: 'Design', k: 'vac', l: 'Full vacuum rating on the process side', t: 'sel', o: YN, d: 'Yes', drv: 1 },
      { g: 'Design', k: 'orient', l: 'Orientation', t: 'sel', o: ['Vertical, vapour in at the top (downflow)', 'Vertical reflux (vapour up, condensate down)', 'Horizontal'], d: 'Vertical, vapour in at the top (downflow)' },
      { g: 'Design', k: 'leak', l: 'Protection against coolant leaking into the process', t: 'sel', o: ['Standard single tube wall', 'Leak detection on the coolant return', 'Intermediate fluid loop'], d: 'Leak detection on the coolant return', drv: 1 }
    ]
  }, [
    { t: 'Process and thermal performance', c: [
      c('The {role} shall condense {vap} at a vapour flow of {flow}, transferring a duty of {duty}, with vapour entering at {tvin} and condensate leaving at {tcond}, at an operating pressure of {popr}.', M, 'FAT, Design review'),
      c('The supplier shall provide an area margin of not less than {margin} over the calculated required area, using the fouling allowance stated on the thermal datasheet, and shall state the heat transfer area provided.', M, DR),
      c('The coolant is {cw}. The thermal design shall hold at the highest coolant supply temperature expected in the hottest season, and the supplier shall state the coolant flow, temperature rise and pressure drop.', M, DR),
      c('The vapour side pressure drop shall not exceed {dpv} at design flow, so that it does not raise the pressure in the reactor or column or reduce the vacuum achieved.', M, DR),
      c('The supplier shall state how non-condensable gases ({ncond}) affect performance. A vent connection shall be placed where non-condensables collect, with a route to the vent system, so that they do not blanket the condensing surface.', M, DR),
      c('The condenser shall operate from turndown to design vapour flow, including start-up on a cold surface at low vapour flow, without flooding, surging or hammering of condensate. The supplier shall state the turndown ratio.', S_, DR),
      c('Condensate shall drain freely to the receiver or return line, without condensate backing up into the tubes or plates, and shall leave no liquid trap in the vapour path.', M, DR),
      c('The condenser shall allow vapour to rise and condensate to fall in counter-current flow without flooding at the maximum vapour rate, and the supplier shall state the flooding limit and the condensate return arrangement.', M, DR, true, is('role', /^Reflux/)),
      c('The vent condenser shall limit the solvent carried out in the vent gas to the level in the user’s emission limit. The supplier shall state the expected vent gas temperature and the solvent loss at design flow.', M, DR, true, is('role', /^Vent/)),
      c('The supplier shall state the thermal and hydraulic design method and software used and shall provide the calculation output.', S_, DOC)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The condenser shall be designed to a recognised pressure equipment code stated by the supplier for a design pressure of {pdh} on the process side, {pdc} on the coolant side and a design temperature of {dt}.', M, DOC),
      c('The process side shall be rated for full vacuum, and the supplier shall state whether the coolant side is also rated for vacuum in case the coolant drains.', M, DR, true, yes),
      c('The condenser shall be installed as: {orient}. The arrangement shall drain completely and shall not hold liquid in the vapour path or at the vent point.', M, DR),
      c('The shell and tube design shall follow TEMA or an equivalent standard, and the supplier shall state the class and type. The tube bundle design shall consider flow-induced tube vibration.', M, DR, true, is('ctype', /^Shell/)),
      c('The supplier shall state whether the tube bundle can be withdrawn, the clearance needed, and whether the tubes can be cleaned on the coolant side without opening the process side.', S_, DR, true, is('ctype', /^Shell/)),
      c('The plate pack shall allow extension where stated by the user, the plate and gasket pressure and temperature ratings shall be stated, and the supplier shall say whether the plates can be opened for cleaning.', S_, DR, true, is('ctype', /^Plate/)),
      c('The supplier shall state the allowable nozzle loads and the support design, including thermal expansion, so that connected piping and any glass or lined equipment is not overloaded.', S_, DR),
      c('The condenser shall be impervious graphite, impregnated with a resin (such as phenolic or PTFE, as stated by the supplier). The supplier shall state the impregnant, the graphite grade and thermal conductivity, and the chemical and temperature limits of the impregnant.', M, 'Design review, Documentation', true, is('ctype', /^Graphite/)),
      c('The supplier shall state the pressure and temperature limits of the graphite and of the steel casing, the largest pressure difference allowed between the two sides, and the vacuum rating. The design shall limit tensile and bending loads on blocks or tubes because graphite is brittle.', M, DR, true, is('ctype', /^Graphite/)),
      c('The supplier shall state the limits on thermal shock and rate of heating and cooling, and the start-up and shutdown sequence needed to protect the graphite, for example whether the coolant is introduced before the hot vapour.', M, DR, true, is('ctype', /^Graphite/)),
      c('Gaskets, seals and any tie-rod or spring clamping shall be compatible with the fluids. The supplier shall state the tightening procedure and gasket life, and how a leaking block or tube is found, plugged or replaced.', S_, DR, true, is('ctype', /^Graphite/)),
      c('The graphite condenser shall be protected against mechanical shock, water hammer and pressure surges, and the supplier shall state any rupture disc, relief device or surge control needed on each side.', S_, DR, true, is('ctype', /^Graphite/))
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts on the process side shall be made of {moc} and shall resist the vapour and the condensate, including acidic condensate formed below the acid dew point of any halogen or acid gas present.', M, 'Design review, Documentation', true, isnt('ctype', /^Graphite/)),
      c('The supplier shall state the corrosion allowance and the basis for the material choice in the condensing zone, where acid gases (such as hydrogen chloride) dissolve in water and become far more corrosive than the dry vapour.', S_, DR, true, isnt('ctype', /^Graphite/)),
      c('Coolant side materials shall suit the coolant quality stated by the user, including chlorides and treatment chemicals, and shall resist fouling and pitting.', M, DR),
      c('Product-contact materials, including gaskets and seals, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, with the measurement record provided.', M, 'FAT, Documentation', true, both(gmpProd, isnt('ctype', /^Graphite/))),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for pressure parts and wetted parts, and weld maps.', S_, DOC, true, isnt('ctype', /^Graphite/))
    ] },
    { t: 'Protection of the product from coolant leakage', c: [
      c('The condenser shall give the following protection against coolant leaking into the process, or process leaking into the coolant: {leak}.', M, DR),
      c('The coolant outlet shall have a connection for conductivity or sampling and a sight or test point, so that a leak can be found before it contaminates a batch.', S_, DR, true, is('leak', /^Leak/)),
      c('The supplier shall state which side operates at the higher pressure. Where the vapour is toxic or hazardous, the pressure arrangement and the tube-rupture case shall be stated in the safety documents.', S_, DR),
      c('The intermediate fluid loop shall include a pump or thermosiphon, expansion vessel, level and pressure alarms, and a fluid that is compatible with the product. The supplier shall state how a leak into the loop is detected.', M, DR, true, is('leak', /^Intermediate/))
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The condenser shall withstand the cleaning method ({cleaning}), including temperature and cleaning chemicals, and shall drain after cleaning.', M, 'Design review, SAT', true, cipOn),
      c('The coolant side shall be cleanable by chemical or mechanical methods without damage, and the supplier shall state the access and the method.', S_, DR),
      c('The condenser shall be suitable for {loc} installation, with insulation or personnel protection for hot surfaces as stated in the user’s standard.', S_, DR),
      c('For outdoor installation the coolant side shall be drainable to protect against freezing, and the supplier shall state any heat tracing needed.', S_, DR, true, is('loc', /^Outdoor/))
    ] },
    { t: 'Instrumentation and control', c: [
      c('Connections for temperature and pressure measurement shall be provided on the vapour inlet, condensate outlet and the coolant inlet and outlet.', S_, DR),
      c('The coolant flow shall be controllable. The supplier shall state the minimum coolant flow that keeps the surface wet and avoids fouling or freezing.', S_, DR),
      c('A low coolant flow or high vent temperature alarm shall be possible, and the supplier shall state the connection points for the user’s sensors.', S_, DR)
    ] },
    { t: 'Safety and hazardous area', c: [
      c('All metallic parts shall be bonded and earthed, and the supplier shall state any parts that could become electrically isolated, such as lined or graphite parts.', M, SAT, true, zoneOn),
      c('Any instrument or electrical device fitted shall be certified for {zone}.', M, DOC, true, zoneOn),
      c('The condenser shall not be fitted with valves that can isolate it from the relief path of the reactor or column. The supplier shall state the relief assumptions, including loss of coolant and tube rupture.', M, DR),
      c('Nozzle sizes and velocities on the condensate line shall limit static charge generation when the condensate is a non-conductive solvent.', S_, DR, true, zoneOn)
    ] },
    docs('condenser'),
    tests('condenser', [
      c('The supplier shall verify at the factory the drainability and, where required, the product-contact surface finish of the condenser.', S_, FAT, true, gmpProd),
      c('Where the supplier states a thermal performance guarantee, a performance check at the first production run shall be agreed with the user.', C_, SAT, false)
    ]),
    spares('condenser', [c('The supplier shall state the number of tubes or plates that may be plugged or removed before the performance falls below the specified duty.', C_, DOC, false)])
  ]);

  /* ================= Subcooler ================= */
  A.add('sub', {
    cat: 'Heat transfer', label: 'Subcooler', pfx: 'SUB', noun: 'subcooler', varKey: 'cool',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'E-302 Vent subcooler' },
      { g: 'Duty', k: 'sfn', l: 'Service', t: 'sel', o: ['Vent condenser for final solvent recovery', 'Subcooler after the main condenser', 'Cold trap'], d: 'Vent condenser for final solvent recovery' },
      { g: 'Duty', k: 'gas', l: 'Gas stream', t: 'text', d: 'Nitrogen with toluene vapour from the reactor condenser vent' },
      { g: 'Duty', k: 'gflow', l: 'Gas flow at design', t: 'num', u: 'Nm³/h', d: '20' },
      { g: 'Duty', k: 'tgin', l: 'Gas inlet temperature', t: 'num', u: '°C', d: '35' },
      { g: 'Duty', k: 'tgout', l: 'Gas outlet temperature target', t: 'num', u: '°C', d: '-10' },
      { g: 'Duty', k: 'rec', l: 'Required solvent recovery from the gas', t: 'num', u: '%', d: '95' },
      { g: 'Duty', k: 'duty', l: 'Heat duty', t: 'num', u: 'kW', d: '8' },
      { g: 'Duty', k: 'cool', l: 'Coolant', t: 'sel', o: ['Chilled glycol', 'Brine (calcium chloride)', 'Chilled water', 'Liquid nitrogen'], d: 'Chilled glycol', drv: 1 },
      { g: 'Duty', k: 'tcin', l: 'Coolant supply temperature', t: 'num', u: '°C', d: '-20' },
      { g: 'Duty', k: 'tcout', l: 'Coolant return temperature', t: 'num', u: '°C', d: '-15' },
      { g: 'Duty', k: 'wet', l: 'Water or freezable component in the gas', t: 'sel', o: ['No (dry gas)', 'Yes (traces of water)'], d: 'Yes (traces of water)', drv: 1 },
      { g: 'Duty', k: 'dpg', l: 'Allowable gas side pressure drop', t: 'num', u: 'kPa', d: '2' },
      { g: 'Design', k: 'pdh', l: 'Design pressure, gas side', t: 'num', u: 'barg', d: '3' },
      { g: 'Design', k: 'pdc', l: 'Design pressure, coolant side', t: 'num', u: 'barg', d: '6' },
      { g: 'Design', k: 'dt', l: 'Maximum design temperature', t: 'num', u: '°C', d: '80' },
      { g: 'Design', k: 'dmt', l: 'Minimum design metal temperature', t: 'num', u: '°C', d: '-40' },
      { g: 'Design', k: 'vac', l: 'Full vacuum rating on the gas side', t: 'sel', o: YN, d: 'Yes', drv: 1 },
      { g: 'Design', k: 'orient', l: 'Orientation', t: 'sel', o: ['Vertical', 'Horizontal'], d: 'Vertical' },
      { g: 'Design', k: 'insul', l: 'Insulation', t: 'sel', o: ['Cold insulation with vapour barrier', 'No insulation (short indoor run)'], d: 'Cold insulation with vapour barrier', drv: 1 }
    ]
  }, [
    { t: 'Process and thermal performance', c: [
      c('The {sfn} shall cool {gas} at {gflow} from {tgin} to {tgout}, transferring a duty of {duty}.', M, 'FAT, Design review'),
      c('The subcooler shall recover at least {rec} of the solvent entering with the gas at design flow, and the supplier shall state the expected solvent content of the outgoing gas.', M, DR),
      c('The coolant is {cool}, supplied at {tcin} and returned at {tcout}. The design shall hold at the highest ambient and gas inlet temperature expected.', M, DR),
      c('The gas side pressure drop shall not exceed {dpg} at design flow.', M, DR),
      c('The condensed solvent shall drain freely to a collection point that is not at risk of freezing, and the drain shall not hold a liquid seal that can freeze or block.', M, DR),
      c('The subcooler shall be capable of a controlled cool-down from ambient to operating temperature, and the supplier shall state the maximum cool-down rate for the materials and the joints.', S_, DR),
      c('Because water in the gas can freeze on the cold surface, the supplier shall state how ice formation is prevented or removed, for example by twin units with defrost, by a pre-cooler to remove water, or by a gas drier, and the effect on pressure drop.', M, DR, true, is('wet', /^Yes/)),
      c('The supplier shall state how the melted ice and defrost water are drained and kept out of the solvent recovery, and how the unit is warmed up safely.', S_, DR, true, is('wet', /^Yes/)),
      c('The supplier shall state the thermal and hydraulic design method and software used and shall provide the calculation output.', S_, DOC)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The subcooler shall be designed to a recognised pressure equipment code for {pdh} on the gas side, {pdc} on the coolant side and a design temperature range from {dmt} to {dt}.', M, DOC),
      c('The gas side shall be rated for full vacuum.', M, DR, true, is('vac', /^Yes/)),
      c('The materials and the design shall be suitable for the minimum design metal temperature of {dmt}, with low-temperature toughness checked where applicable, and the supplier shall state the impact test requirements.', M, DR),
      c('The subcooler shall be installed {orient} and shall allow thermal contraction of the tubes, shell and connected piping at low temperature without overloading the nozzles.', M, DR),
      c('The supplier shall state the allowable nozzle loads, including loads from contraction of the cold piping.', S_, DR),
      c('Cold insulation shall have a continuous vapour barrier and a cladding that prevents ingress of water, and the supplier shall state the insulation thickness and the surface temperature expected.', M, DR, true, is('insul', /^Cold/)),
      c('Supports and any parts that touch the cold surface shall not conduct heat in a way that causes local icing, and a thermal break shall be provided where needed.', S_, DR, true, is('insul', /^Cold/))
    ] },
    { t: 'Coolant circuit', c: [
      c('The brine shall be a solution with a freezing point at least 10 K below the lowest coolant temperature, and the supplier shall state the concentration assumed and the effect on heat transfer.', M, DR, true, is('cool', /^Brine/)),
      c('Where the brine contains chlorides, the supplier shall state how the materials resist chloride attack and stress corrosion, and what limits apply to temperature and concentration.', M, DR, true, is('cool', /^Brine/)),
      c('The glycol circuit shall be compatible with the materials and gaskets, and the supplier shall state the glycol concentration assumed and the corrosion inhibitor required.', S_, DR, true, is('cool', /^Chilled glycol/)),
      c('The liquid nitrogen supply shall include a phase separator or vaporising arrangement, a relief valve on any trapped section, a safe vent for the nitrogen, and an oxygen deficiency warning for the room. The supplier shall state the nitrogen consumption at design duty.', M, DR, true, is('cool', /^Liquid nitrogen/)),
      c('The coolant side shall have a relief device or an expansion vessel to protect against thermal expansion of trapped liquid when the coolant warms up between isolation valves.', M, DR),
      c('The coolant flow shall be controllable, and the supplier shall state the minimum flow that avoids freezing of coolant in the passages.', S_, DR)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc}, suitable for the solvent, any acid gases and the minimum temperature, and the supplier shall state any material that becomes brittle at low temperature.', M, 'Design review, Documentation'),
      c('Gaskets and seals shall remain flexible and leak-tight at the minimum temperature. The supplier shall state the gasket material and the temperature range.', M, DR),
      c('Product-contact materials shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, with the measurement record provided.', M, 'FAT, Documentation', true, gmpProd),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for pressure parts and wetted parts, and weld maps.', S_, DOC)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The subcooler shall withstand the cleaning method ({cleaning}) and any warm-up, including temperature and cleaning chemicals, and shall drain after cleaning.', M, 'Design review, SAT', true, cipOn),
      c('The subcooler shall be suitable for {loc} installation, with protection against rain and condensation on the cold surfaces.', S_, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('Temperature measurement shall be provided on the gas inlet and outlet and on the coolant supply and return, with an alarm on high gas outlet temperature.', S_, DR),
      c('A differential pressure measurement across the gas side shall be provided to indicate icing or blockage, with a high alarm.', S_, DR, true, is('wet', /^Yes/)),
      c('A coolant flow measurement or switch shall be provided, with an alarm on low flow.', S_, DR),
      c('Connections for a solvent analyser or sample point on the outlet gas shall be provided.', C_, DR, false)
    ] },
    { t: 'Safety and hazardous area', c: [
      c('All metallic parts shall be bonded and earthed.', M, SAT, true, zoneOn),
      c('Any instrument or electrical device fitted shall be certified for {zone}.', M, DOC, true, zoneOn),
      c('The supplier shall state the relief case for a blocked gas outlet caused by ice and shall confirm that the unit cannot be isolated from the protected equipment by a closed valve.', M, DR),
      c('The condensed solvent collection vessel shall be earthed, vented and sized so that it cannot overflow before an alarm is acted on.', S_, DR)
    ] },
    docs('subcooler'),
    tests('subcooler', [
      c('The factory test shall include a low-temperature leak test or a cold-shock check where practicable, and the supplier shall state what was verified at temperature.', S_, FAT),
      c('The site acceptance test shall include a cool-down and a check of the gas outlet temperature and solvent recovery at the first production run.', S_, SAT)
    ]),
    spares('subcooler')
  ]);

  /* ================= Reboiler ================= */
  A.add('reb', {
    cat: 'Heat transfer', label: 'Reboiler', pfx: 'RBL', noun: 'reboiler', varKey: 'rtype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'E-401 Column reboiler' },
      { g: 'Duty', k: 'rtype', l: 'Reboiler type', t: 'sel', o: ['Thermosiphon', 'Kettle', 'Forced circulation', 'Falling film'], d: 'Thermosiphon', drv: 1 },
      { g: 'Duty', k: 'proc', l: 'Process fluid on the boiling side', t: 'text', d: 'Toluene with product residues' },
      { g: 'Duty', k: 'duty', l: 'Heat duty', t: 'num', u: 'kW', d: '400' },
      { g: 'Duty', k: 'vflow', l: 'Vapour generated', t: 'num', u: 'kg/h', d: '700' },
      { g: 'Duty', k: 'tbot', l: 'Boiling temperature at the column bottom', t: 'num', u: '°C', d: '112' },
      { g: 'Duty', k: 'pcol', l: 'Column bottom pressure', t: 'num', u: 'kPa(a)', d: '110' },
      { g: 'Duty', k: 'twall', l: 'Maximum process-side wall temperature', t: 'num', u: '°C', d: '130' },
      { g: 'Duty', k: 'visc', l: 'Viscosity of the bottoms', t: 'num', u: 'cP', d: '3' },
      { g: 'Duty', k: 'solids', l: 'Solids or tar in the bottoms', t: 'sel', o: ['None', 'Traces', 'Significant'], d: 'Traces', drv: 1 },
      { g: 'Duty', k: 'foul', l: 'Fouling resistance, process side', t: 'num', u: 'm²K/W', d: '0.0003' },
      { g: 'Duty', k: 'margin', l: 'Minimum area margin over required area', t: 'num', u: '%', d: '10' },
      { g: 'Duty', k: 'heat', l: 'Heating medium', t: 'sel', o: ['Saturated steam', 'Thermal fluid (hot oil)', 'Hot water'], d: 'Saturated steam', drv: 1 },
      { g: 'Duty', k: 'hdet', l: 'Heating medium condition', t: 'text', d: 'Steam at 4 barg (about 152 °C)' },
      { g: 'Duty', k: 'ctrl', l: 'Duty control', t: 'sel', o: ['Heating medium control valve', 'Condensate level control', 'Thermal fluid flow control'], d: 'Heating medium control valve' },
      { g: 'Design', k: 'pdh', l: 'Design pressure, process side', t: 'num', u: 'barg', d: '3' },
      { g: 'Design', k: 'pdc', l: 'Design pressure, heating side', t: 'num', u: 'barg', d: '6' },
      { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '180' },
      { g: 'Design', k: 'vac', l: 'Full vacuum rating on the process side', t: 'sel', o: YN, d: 'Yes', drv: 1 }
    ]
  }, [
    { t: 'Process and thermal performance', c: [
      c('The {rtype} reboiler shall supply a duty of {duty} to {proc}, generating {vflow} of vapour at a boiling temperature of {tbot} and a column bottom pressure of {pcol}.', M, 'FAT, Design review'),
      c('The supplier shall provide an area margin of not less than {margin} over the calculated required area at a process-side fouling resistance of {foul}, and shall state the heat transfer area provided.', M, DR),
      c('The process-side wall temperature shall not exceed {twall}, so that the product does not degrade or foul. The supplier shall state the calculated maximum wall temperature and the heating medium temperature at which it is reached.', M, DR),
      c('The heating medium is {heat} ({hdet}). The supplier shall state the flow, pressure drop and the condensate or return temperature.', M, DR),
      c('The boiling regime shall remain stable from turndown to design duty, without film boiling, surging or instability. The supplier shall state the turndown ratio and the minimum stable duty.', M, DR),
      c('The viscosity of the bottoms is up to {visc}. The supplier shall state the effect of viscosity and of composition change on circulation and heat transfer through the batch.', S_, DR),
      c('The supplier shall state the hydraulic design method and software and provide the calculation output, including the circulation rate and the vapour fraction at the outlet.', S_, DOC),
      c('Where the process fluid contains solids or tar, the velocities shall be high enough to prevent settling, the design shall avoid dead zones and stagnant pockets, and the supplier shall state the cleaning access and any blowdown connection.', M, DR, true, is('solids', /^(Significant|Traces)/)),
      c('The supplier shall state how the reboiler is started up and warmed up safely, and the maximum rate of heating, so that the process fluid and the metal are not subjected to shock.', S_, DR)
    ] },
    { t: 'Thermosiphon, kettle, forced circulation or falling film design', c: [
      c('The thermosiphon reboiler shall be designed with a stable natural circulation loop. The supplier shall state the static head, the piping arrangement, the two-phase return line sizing and the stability margin, and shall check the effect of a low liquid level in the column.', M, DR, true, is('rtype', /^Thermo/)),
      c('The kettle reboiler shall have enough disengagement space and a weir arrangement so that the tube bundle stays covered and the vapour carries little entrained liquid. The supplier shall state the bundle submergence and the entrainment limit.', M, DR, true, is('rtype', /^Kettle/)),
      c('The forced circulation reboiler shall include a circulation pump and the supplier shall state the minimum velocity in the tubes, the pump head and flow, and the protection against loss of circulation, such as a low flow trip on the heating medium.', M, DR, true, is('rtype', /^Forced/)),
      c('The falling film reboiler shall have a liquid distributor that wets all tubes at the minimum flow, and the supplier shall state the minimum wetting rate, the distributor design and the recirculation rate needed to avoid dry patches.', M, DR, true, is('rtype', /^Falling/)),
      c('Tube length, diameter and layout shall be selected to keep the pressure drop and the residence time low for heat-sensitive material, and the supplier shall state the residence time in the heated zone.', S_, DR)
    ] },
    { t: 'Heating medium side', c: [
      c('The steam side shall have a condensate drain that cannot back up and flood the tubes, with a condensate pot or a level control and a steam trap or equivalent, and a vent for non-condensables.', M, DR, true, is('heat', /^Saturated/)),
      c('The thermal fluid side shall limit the film temperature to below the degradation temperature of the fluid and shall provide for thermal expansion, venting and drainage. The supplier shall state the maximum film temperature.', M, DR, true, is('heat', /^Thermal/)),
      c('The supplier shall state the relief arrangement on the heating side, including the case of a tube rupture and the case of the heating medium pressure exceeding the design pressure of {pdc}.', M, DR),
      c('The heating medium shall be controlled by {ctrl}, and the supplier shall state the control valve sizing assumptions and the minimum turndown.', S_, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The reboiler shall be designed to a recognised pressure equipment code for {pdh} on the process side, {pdc} on the heating side and a design temperature of {dt}.', M, DOC),
      c('The process side shall be rated for full vacuum.', M, DR, true, is('vac', /^Yes/)),
      c('The supplier shall state allowable nozzle loads, including loads from the two-phase return line and thermal expansion of the column.', S_, DR),
      c('The reboiler shall be drainable on both sides, with vents at the high points, and shall have no pockets where liquid or solids can collect.', M, DR),
      c('The tube bundle shall be removable where fouling is expected, and the supplier shall state the clearance and the cleaning method.', S_, DR, true, is('solids', /^(Significant|Traces)/))
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts on the process side shall be made of {moc} and shall resist the process fluid, impurities and the cleaning agents in use.', M, 'Design review, Documentation'),
      c('Product-contact materials, including gaskets, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, with the measurement record provided.', M, 'FAT, Documentation', true, gmpProd),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for pressure parts and wetted parts, and weld maps.', S_, DOC)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The reboiler shall withstand the cleaning method ({cleaning}), including temperature and cleaning chemicals, and shall drain after cleaning.', M, 'Design review, SAT', true, cipOn),
      c('The reboiler shall be suitable for {loc} installation, with insulation or personnel protection for hot surfaces.', S_, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('Connections for temperature and pressure measurement shall be provided on the process and heating sides, and the supplier shall show the points for a differential pressure measurement across the process side.', S_, DR),
      c('A high temperature alarm on the process-side outlet and a means to detect low circulation or loss of liquid level shall be possible, and the supplier shall state the connection points.', S_, DR),
      c('A condensate level or temperature measurement shall be provided on the heating side to protect against flooding.', C_, DR, false, is('heat', /^Saturated/))
    ] },
    { t: 'Safety and hazardous area', c: [
      c('All metallic parts shall be bonded and earthed.', M, SAT, true, zoneOn),
      c('Any instrument or electrical device fitted shall be certified for {zone}.', M, DOC, true, zoneOn),
      c('The supplier shall state the relief case for a blocked vapour return and for loss of liquid level, and shall confirm that the reboiler cannot be isolated from the relief path of the column.', M, DR),
      c('The supplier shall state how the design avoids overheating of the product if circulation is lost while the heating medium stays on.', M, DR)
    ] },
    docs('reboiler'),
    tests('reboiler', [
      c('The factory test shall include a pressure test of each side, and the supplier shall state the test pressure and the result.', M, FAT),
      c('The site acceptance test shall include a start-up with the heating medium on a controlled ramp and a check of circulation and duty at the first production run.', S_, SAT)
    ]),
    spares('reboiler', [c('The supplier shall state the number of tubes that may be plugged before the performance falls below the specified duty.', C_, DOC, false)])
  ]);

  /* ================= Chiller ================= */
  A.add('chill', {
    cat: 'Heat transfer', label: 'Chiller package', pfx: 'CHL', noun: 'chiller package', varKey: 'ctype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'CH-01 Brine chilling unit' },
      { g: 'Duty', k: 'ctype', l: 'Chiller type', t: 'sel', o: ['Water-cooled screw chiller', 'Air-cooled screw chiller', 'Water-cooled scroll chiller', 'Absorption chiller'], d: 'Water-cooled screw chiller', drv: 1 },
      { g: 'Duty', k: 'fluid', l: 'Chilled fluid', t: 'sel', o: ['Water-glycol', 'Chilled water', 'Brine (calcium chloride)', 'Brine (other)'], d: 'Water-glycol', drv: 1 },
      { g: 'Duty', k: 'cap', l: 'Cooling capacity at design', t: 'num', u: 'kW', d: '300' },
      { g: 'Duty', k: 'tsup', l: 'Supply temperature', t: 'num', u: '°C', d: '-10' },
      { g: 'Duty', k: 'tret', l: 'Return temperature', t: 'num', u: '°C', d: '-5' },
      { g: 'Duty', k: 'flow', l: 'Chilled fluid flow', t: 'num', u: 'm³/h', d: '58' },
      { g: 'Duty', k: 'amb', l: 'Design ambient or cooling water temperature', t: 'num', u: '°C', d: '38' },
      { g: 'Duty', k: 'load', l: 'Load profile', t: 'text', d: 'Reactor jackets and condensers, load varying from 20 to 100 %' },
      { g: 'Duty', k: 'part', l: 'Lowest part-load to run continuously', t: 'num', u: '%', d: '20' },
      { g: 'Duty', k: 'tol', l: 'Supply temperature stability', t: 'num', u: 'K', d: '1' },
      { g: 'Design', k: 'refr', l: 'Refrigerant', t: 'sel', o: ['R513A', 'R134a', 'R1234ze', 'Ammonia', 'Propane (R290)'], d: 'R513A', drv: 1 },
      { g: 'Design', k: 'stand', l: 'Standby arrangement', t: 'sel', o: ['Duty and standby units', 'Two units each at 50 % capacity', 'Single unit'], d: 'Duty and standby units' },
      { g: 'Design', k: 'capc', l: 'Capacity control', t: 'sel', o: ['Stepless (slide valve or variable speed)', 'Stepped (compressors on and off)'], d: 'Stepless (slide valve or variable speed)' },
      { g: 'Design', k: 'tank', l: 'Buffer tank', t: 'sel', o: ['Included in the package', 'Supplied separately by the user'], d: 'Included in the package' },
      { g: 'Design', k: 'pd', l: 'Design pressure of the chilled fluid circuit', t: 'num', u: 'barg', d: '6' },
      { g: 'Design', k: 'supply', l: 'Electrical supply', t: 'text', d: '415 V, 3-phase, 50 Hz' },
      { g: 'Design', k: 'noise', l: 'Noise limit at 1 m', t: 'num', u: 'dB(A)', d: '85' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The {ctype} shall deliver {cap} of cooling with {fluid} at {flow}, a supply temperature of {tsup} and a return temperature of {tret}, at a design ambient or cooling water temperature of {amb}.', M, 'FAT, SAT'),
      c('The load is: {load}. The unit shall run stably and efficiently down to {part} of design capacity without short cycling, hunting or loss of supply temperature control.', M, DR),
      c('The supply temperature shall be held within {tol} of the setpoint over the load range, and the supplier shall state the response to a sudden load change.', M, FAT),
      c('The supplier shall state the capacity and the power consumption at design, at 75 %, 50 % and 25 % load and at lower ambient temperatures, and shall provide a seasonal performance estimate.', S_, DOC),
      c('The supplier shall state the pressure drop and the minimum and maximum flow of the evaporator, and the circuit shall remain stable at the minimum flow.', M, DR),
      c('The unit shall start up from a warm circuit (for example 30 °C) and pull down to the supply temperature within a time that the supplier states, without tripping on low temperature or high pressure.', S_, FAT),
      c('The unit shall have capacity control by {capc}, and shall start in a way that keeps the starting current within the limit of the user’s supply.', M, DR)
    ] },
    { t: 'Refrigeration circuit and safety', c: [
      c('The refrigerant is {refr}. The supplier shall state the refrigerant charge, the global warming potential and the safety group, and shall comply with the regulations on refrigerant use in force at the site.', M, DOC),
      c('A refrigerant leak detector shall be fitted where the refrigerant charge or the room volume requires it, with an alarm and an action stated by the supplier.', M, DR, true, is('refr', /^(Ammonia|Propane)/)),
      c('The ammonia system shall include a ventilated machinery area, an emergency ventilation and a relief discharge to a safe location, and the supplier shall state the water spray or scrubbing arrangement for a release.', M, DR, true, is('refr', /^Ammonia/)),
      c('The propane system shall be designed for a flammable refrigerant, with hazardous area equipment where required, ventilation and gas detection, and a charge minimised by design.', M, DR, true, is('refr', /^Propane/)),
      c('Pressure relief devices on the refrigeration circuit shall be piped to a safe location where required by the refrigerant, and the supplier shall state the discharge arrangement.', M, DR),
      c('The refrigeration circuit shall be designed to a recognised pressure equipment code and shall be pressure tested and leak tested at the factory.', M, 'FAT, Documentation')
    ] },
    { t: 'Heat rejection', c: [
      c('The air-cooled unit shall perform at the design ambient temperature, and the supplier shall state the capacity de-rating at higher temperatures and the fan noise. The condenser coils shall be protected against corrosion and fouling in the plant atmosphere.', M, DR, true, is('ctype', /^Air/)),
      c('The water-cooled unit shall use the cooling water quality stated by the user, and the supplier shall state the condenser tube material, the fouling allowance and the water flow and pressure drop.', M, DR, true, is('ctype', /^(Water|Absorption)/)),
      c('The supplier shall state the acceptable range of cooling water temperature and flow, and the behaviour of the unit when these are outside the range.', S_, DR, true, is('ctype', /^(Water|Absorption)/))
    ] },
    { t: 'Chilled fluid circuit', c: [
      c('The chilled fluid shall be {fluid}. For a glycol or brine circuit the concentration shall give a freezing point at least 10 K below the lowest evaporator temperature, and the supplier shall state the concentration assumed.', M, DR, true, is('fluid', /^(Water-glycol|Brine)/)),
      c('The evaporator shall be protected against freezing by a low temperature and a low flow trip and by a flow switch, and the supplier shall state the protection fitted.', M, DR),
      c('The buffer tank shall have enough volume for stable control and for the minimum compressor run time, and the supplier shall state the volume and the basis.', S_, DR, true, is('tank', /^Included/)),
      c('The circuit shall have an expansion vessel, air vents, drains, strainer and connections for pumps, and the supplier shall state the pump head the unit allows.', S_, DR),
      c('The materials in contact with brine shall be suitable for chlorides and for the inhibitor, and the supplier shall state the materials used for the evaporator and pipework.', M, DR, true, is('fluid', /^Brine/))
    ] },
    { t: 'Mechanical design, utilities and environment', c: [
      c('The unit shall be a skid-mounted package with vibration isolation, access for maintenance and lifting points, and shall be suitable for {loc} installation.', M, DR),
      c('The unit shall operate from a supply of {supply}, with motor starters and protection that follow the user’s electrical standard, and a main disconnect.', M, DR),
      c('The noise at 1 m shall not exceed {noise}. The supplier shall state the measured value at the factory test.', S_, FAT),
      c('The control panel shall be rated for the environment and, where the unit is in or near a classified area, shall be certified for {zone}.', M, DOC, true, zoneOn),
      c('The unit shall be bonded and earthed, and the supplier shall state any heat tracing or enclosure needed for low ambient temperatures.', S_, SAT)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The unit shall have a controller with remote start and stop, a remote setpoint and status, alarm and trip signals available to the plant control system.', M, DR),
      c('The controller shall provide automatic duty and standby changeover, rotation of run hours, and an alarm on loss of the standby unit.', S_, DR, true, is('stand', /^(Duty|Two)/)),
      c('The supplier shall provide sensors for supply and return temperature, evaporator pressure, discharge pressure and flow, with alarms and trips for low and high values.', M, DR),
      c('The unit shall restart automatically after a power failure and shall not restart before safe conditions are re-established, and the supplier shall state the logic.', S_, DR),
      c('The supplier shall state the operating data logging available, such as runtime, trips and energy use.', C_, DR, false)
    ] },
    docs('chiller package', [c('The supplier shall provide the refrigerant circuit diagram, the electrical diagram and a controller parameter list.', S_, DOC)]),
    tests('chiller package', [
      c('The factory test shall include a run test at stated load points with the supplier’s test fluid, a check of capacity, power and noise, and a test of all safety trips.', M, FAT),
      c('The site acceptance test shall include a performance check at the first production load, a pull-down test and a check of the temperature stability against the requirement.', M, SAT)
    ]),
    spares('chiller package', [c('The supplier shall offer a planned maintenance contract and state the response time for service on site.', C_, DOC, false)])
  ]);

  /* ================= Packed column scrubber ================= */
  A.add('scrub', {
    cat: 'Mass transfer', label: 'Packed column scrubber', pfx: 'SCR', noun: 'packed column scrubber', varKey: 'liq',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'SC-501 Process vent scrubber' },
      { g: 'Duty', k: 'gas', l: 'Gas stream to be treated', t: 'text', d: 'Nitrogen vent from reactors and centrifuge, with hydrogen chloride and solvent traces' },
      { g: 'Duty', k: 'gflow', l: 'Gas flow at design', t: 'num', u: 'Nm³/h', d: '300' },
      { g: 'Duty', k: 'gmin', l: 'Minimum gas flow', t: 'num', u: 'Nm³/h', d: '30' },
      { g: 'Duty', k: 'tgas', l: 'Gas inlet temperature', t: 'num', u: '°C', d: '40' },
      { g: 'Duty', k: 'spec', l: 'Species to be removed', t: 'text', d: 'Hydrogen chloride, up to 3 % by volume' },
      { g: 'Duty', k: 'eff', l: 'Required removal efficiency', t: 'num', u: '%', d: '99' },
      { g: 'Duty', k: 'cout', l: 'Maximum outlet concentration', t: 'num', u: 'mg/Nm³', d: '20' },
      { g: 'Duty', k: 'liq', l: 'Scrubbing liquid', t: 'sel', o: ['Caustic soda solution', 'Water', 'Acid solution', 'Oxidising solution (hypochlorite)', 'Solvent or other liquid'], d: 'Caustic soda solution', drv: 1 },
      { g: 'Duty', k: 'lrate', l: 'Liquid recirculation rate', t: 'num', u: 'm³/h', d: '8' },
      { g: 'Duty', k: 'ph', l: 'pH control setpoint', t: 'text', d: '9 to 10' },
      { g: 'Duty', k: 'dpg', l: 'Allowable gas pressure drop', t: 'num', u: 'kPa', d: '1' },
      { g: 'Design', k: 'pack', l: 'Packing', t: 'sel', o: ['Random packing (plastic)', 'Random packing (ceramic)', 'Structured packing'], d: 'Random packing (plastic)', drv: 1 },
      { g: 'Design', k: 'dia', l: 'Column diameter', t: 'num', u: 'mm', d: '600' },
      { g: 'Design', k: 'hgt', l: 'Packed height', t: 'num', u: 'm', d: '3' },
      { g: 'Design', k: 'pd', l: 'Design pressure', t: 'num', u: 'kPag', d: '50' },
      { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '80' },
      { g: 'Design', k: 'heat', l: 'Heat of absorption handled by', t: 'sel', o: ['Make-up and bleed only', 'Recirculation tank with cooler', 'Not significant'], d: 'Make-up and bleed only' },
      { g: 'Design', k: 'mover', l: 'Gas movement', t: 'sel', o: ['Existing plant vent header (no fan)', 'Induced draught fan supplied'], d: 'Existing plant vent header (no fan)', drv: 1 }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The scrubber shall treat {gas} at a design flow of {gflow}, and shall run stably down to a minimum flow of {gmin}, at a gas inlet temperature of {tgas}.', M, 'FAT, SAT'),
      c('The scrubber shall remove the following from the gas: {spec}. The removal efficiency shall be at least {eff} and the outlet concentration shall not exceed {cout}.', M, 'SAT, Documentation'),
      c('The scrubbing liquid shall be {liq}, circulated at {lrate}. The supplier shall state the liquid to gas ratio, the make-up rate and the bleed rate, and the consumption of chemicals at the design load.', M, DR),
      c('The gas side pressure drop shall not exceed {dpg} at design flow, so that the scrubber does not raise the pressure in the plant vent header.', M, DR),
      c('The supplier shall state the flooding limit, the operating point as a percentage of flooding, and the turndown at which the liquid distribution is still adequate.', M, DR),
      c('The supplier shall state how a sudden surge of gas, for example from a release of the whole reactor charge, is handled, and the effect on the outlet concentration and the pressure drop.', M, DR),
      c('The supplier shall state the temperature rise of the liquid by absorption and its effect on the performance. The arrangement is: {heat}.', S_, DR),
      c('The supplier shall state the design basis, the method and software used, and provide the calculation output.', S_, DOC)
    ] },
    { t: 'Column, packing and internals', c: [
      c('The column shall have a diameter of {dia} and a packed height of {hgt}. The supplier shall state the number of transfer units or the packed height needed to meet the efficiency, and the margin applied.', M, DR),
      c('The packing is {pack}. The supplier shall state the type, size and material, the expected life, and the support grid and bed limiter, and the packing shall not be damaged by the temperature rise or the liquid.', M, DR),
      c('The liquid distributor shall give uniform wetting of the whole bed at the minimum liquid rate, and shall be resistant to blockage by solids or scale. The supplier shall state any strainer fitted upstream.', M, DR),
      c('A mist eliminator shall be fitted at the gas outlet to limit liquid carry-over, and the supplier shall state the carry-over at design flow.', M, DR),
      c('The column shall have access for inspection and for changing the packing, with manways and a way to unload and reload it, and a drain at the sump.', S_, DR),
      c('The sump shall be sized for the pump suction, for a margin against loss of make-up, and for holding the full liquid inventory on shutdown.', S_, DR)
    ] },
    { t: 'Recirculation, dosing and control', c: [
      c('The recirculation pump shall be sized for the liquid rate with a margin, and the supplier shall state the pump type. A duty and standby pump shall be provided where the scrubber protects a plant that cannot shut down.', M, DR),
      c('The pH of the scrubbing liquid shall be controlled by dosing, with two independent pH probes, a high and a low pH alarm, and a calibration and cleaning arrangement for the probes.', M, DR, true, is('liq', /^(Caustic|Acid)/)),
      c('The caustic solution shall be kept from absorbing carbon dioxide to the point of losing capacity, and the supplier shall state how the concentration is checked and the liquid is replaced.', S_, DR, true, is('liq', /^Caustic/)),
      c('The oxidising solution shall be handled in materials that resist it, and the supplier shall state the dosing, the control of the oxidation potential and the hazard from reaction with any organic matter in the gas.', M, DR, true, is('liq', /^Oxidising/)),
      c('The supplier shall state how the bleed is sent to effluent treatment, and the composition and flow of the bleed stream.', M, DR),
      c('Make-up water and chemical supply shall have flow control, and a low liquid level or low recirculation flow shall raise an alarm and a signal that the plant can use.', M, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The column and tank shall be designed to a recognised standard for a design pressure of {pd} and a design temperature of {dt}, and for the weight of the liquid and the wind and seismic loads at the site.', M, DOC),
      c('The scrubber shall be protected against a vacuum or a pressure surge, and the supplier shall state the relief or vacuum breaker arrangement.', M, DR),
      c('The gas inlet shall be arranged so that scrubbing liquid cannot flow back into the plant if the gas flow stops or the pressure falls, for example with an inlet that rises above the liquid level and a seal or break, and the supplier shall state the protection.', M, DR),
      c('The scrubber shall be supported on a foundation or frame with access platforms and ladders to the user’s safety standard.', S_, DR),
      c('The induced draught fan shall be sized for the pressure drop plus the plant header demand, shall be suitable for the gas and the liquid carry-over, and the supplier shall state the fan type, the control and the noise.', M, DR, true, is('mover', /^Induced/))
    ] },
    { t: 'Materials', c: [
      c('Wetted parts shall be made of {moc}, and the supplier shall state the suitability of each material for the gas, the liquid and the temperature, and shall not use stainless steel where chlorides can cause pitting or stress corrosion.', M, 'Design review, Documentation'),
      c('Where hydrogen chloride or other acid gases are scrubbed, the column, packing, pipework and instruments shall be a lined, plastic or alloy construction that resists the liquid at the highest temperature, and the supplier shall state the construction.', M, DR, true, is('liq', /^(Caustic|Water|Acid)/)),
      c('The supplier shall state the plastic or lining material, its temperature limit, its resistance to the solvent traces in the gas, and the checks done on the lining or welds.', S_, DR),
      c('The packing shall resist the liquid, the solvent traces and the temperature, and the supplier shall state the compliance with a swelling or softening check for the solvent present.', S_, DR, true, is('pack', /^Random packing \(plastic\)/))
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The supplier shall state the utility consumption: electricity, water, caustic or other chemical, and instrument air.', S_, DOC),
      c('The scrubber shall be suitable for {loc} installation, with protection against freezing of the liquid and the lines where applicable.', M, DR),
      c('The scrubber shall be cleaned by {cleaning}, and the supplier shall state how the column, sump and distributor are flushed and drained.', S_, DR, true, cipOn),
      c('The noise at 1 m shall be stated, and shall meet the user’s limit.', C_, FAT, false)
    ] },
    { t: 'Safety and hazardous area', c: [
      c('The vent gas contains flammable solvent vapour. The supplier shall state how the design avoids a flammable mixture in the scrubber, and where a flame arrester or an oxygen limit is needed, and shall confirm that no ignition source is present.', M, DR, true, zoneOn),
      c('All metallic parts shall be bonded and earthed, and the supplier shall state any parts that could become electrically isolated, such as lined or plastic parts.', M, SAT, true, zoneOn),
      c('The instruments, pumps and the fan shall be certified for {zone}.', M, DOC, true, zoneOn),
      c('The supplier shall state the hazard from the chemicals used, including heat of dilution, splash and fumes, and the safety shower, eyewash and handling arrangement needed.', S_, DR),
      c('The outlet stack shall discharge at a height and velocity that disperse the treated gas safely, and the supplier shall state the dispersion basis.', S_, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The scrubber shall have measurements for gas inlet and outlet pressure, differential pressure across the bed, liquid flow, sump level and temperature.', M, DR),
      c('A sampling point and, where agreed, an online analyser shall be provided on the outlet gas for the species to be removed.', S_, DR),
      c('Alarms shall be provided on low liquid flow, low level, high differential pressure, high temperature and loss of pH control, and the signals shall be available to the plant control system.', M, DR)
    ] },
    docs('scrubber'),
    tests('scrubber', [
      c('The factory test shall include a hydrostatic or water-fill test of the column and tank, a check of the packing and distributor, and a leak test of the connections.', M, FAT),
      c('A performance test on site shall measure the removal efficiency and the outlet concentration at agreed gas flow and inlet concentration, and the supplier shall support it with a stated method.', M, SAT)
    ]),
    spares('scrubber', [c('The supplier shall state the spare packing, distributor parts, pH probes and pump seals recommended.', S_, DOC)])
  ]);

  /* ================= Storage tank ================= */
  A.add('tank', {
    cat: 'Reaction and vessels', label: 'Storage or day tank', pfx: 'TNK', noun: 'storage tank', varKey: 'ttype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'T-601 Toluene day tank' },
      { g: 'Duty', k: 'fluid', l: 'Liquid stored', t: 'text', d: 'Toluene (flammable, flash point about 4 °C)' },
      { g: 'Duty', k: 'vol', l: 'Working volume', t: 'num', u: 'm³', d: '20' },
      { g: 'Duty', k: 'dens', l: 'Density of the liquid', t: 'num', u: 'kg/m³', d: '870' },
      { g: 'Duty', k: 'tstore', l: 'Storage temperature range', t: 'text', d: '5 to 45 °C ambient' },
      { g: 'Duty', k: 'fill', l: 'Filling method', t: 'sel', o: ['Top fill through a dip pipe to the bottom', 'Bottom filling from a tanker pump', 'Pumped transfer from drums or a plant line'], d: 'Top fill through a dip pipe to the bottom' },
      { g: 'Duty', k: 'rate', l: 'Filling and emptying rate', t: 'num', u: 'm³/h', d: '15' },
      { g: 'Design', k: 'ttype', l: 'Tank type', t: 'sel', o: ['Vertical cylindrical, atmospheric', 'Horizontal cylindrical, atmospheric', 'Horizontal cylindrical, pressure rated', 'Underground'], d: 'Vertical cylindrical, atmospheric', drv: 1 },
      { g: 'Design', k: 'dia', l: 'Diameter', t: 'num', u: 'mm', d: '2800' },
      { g: 'Design', k: 'len', l: 'Straight shell height or length', t: 'num', u: 'mm', d: '3500' },
      { g: 'Design', k: 'pd', l: 'Design pressure', t: 'num', u: 'kPag', d: '35' },
      { g: 'Design', k: 'dv', l: 'Design vacuum', t: 'num', u: 'kPa below atmospheric', d: '6' },
      { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '60' },
      { g: 'Design', k: 'inert', l: 'Nitrogen blanketing', t: 'sel', o: ['Yes (nitrogen blanketing with pressure control)', 'No'], d: 'Yes (nitrogen blanketing with pressure control)', drv: 1 },
      { g: 'Design', k: 'vent', l: 'Vent arrangement', t: 'sel', o: ['Breather valve (pressure and vacuum) with flame arrester', 'Open vent with flame arrester', 'Vent to a scrubber or recovery header'], d: 'Breather valve (pressure and vacuum) with flame arrester' },
      { g: 'Design', k: 'level', l: 'Level measurement', t: 'sel', o: ['Radar transmitter with independent high level switch', 'Guided-wave or magnetic transmitter with switch', 'Differential pressure transmitter'], d: 'Radar transmitter with independent high level switch' },
      { g: 'Design', k: 'contain', l: 'Containment', t: 'sel', o: ['Bunded area (dyke) provided by the user', 'Double-walled tank with leak detection', 'None'], d: 'Bunded area (dyke) provided by the user', drv: 1 },
      { g: 'Design', k: 'heat', l: 'Heating or cooling', t: 'sel', o: ['None', 'Heating coil or jacket', 'Cooling jacket'], d: 'None', drv: 1 }
    ]
  }, [
    { t: 'Process and capacity requirements', c: [
      c('The tank shall store {fluid} with a working volume of {vol} at a density of {dens} and a storage temperature range of {tstore}.', M, 'Design review, FAT'),
      c('The tank shall be filled and emptied at up to {rate} and the supplier shall state the nozzle sizes and velocities for that rate.', M, DR),
      c('The tank shall have a diameter of {dia} and a straight shell height or length of {len}. The supplier shall state the total volume, the working volume and the free space above the maximum operating level.', M, DR),
      c('The supplier shall state the minimum liquid level that keeps the outlet covered and the level at which the high-high alarm acts, and the volume between them.', S_, DR),
      c('The tank shall be filled by the following method: {fill}. The inlet shall be arranged to avoid splashing and free fall of the liquid.', M, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The tank shall be designed to a recognised tank or vessel code stated by the supplier, for a design pressure of {pd}, a design vacuum of {dv} and a design temperature of {dt}, and for the weight of the full liquid, wind, seismic and snow loads at the site.', M, DOC),
      c('The pressure rated horizontal tank shall be designed and stamped to a recognised pressure vessel code, with a test pressure and a certificate from a notified or authorised inspector.', M, DOC, true, is('ttype', /pressure rated/)),
      c('The underground tank shall be of double-wall or coated construction with corrosion protection, anti-flotation, a leak detection system between the walls or in a monitoring well, and a manway chamber that keeps out rain.', M, DR, true, is('ttype', /^Underground/)),
      c('The tank shall have a manway, a vent, a drain at the lowest point, a sample point, a level connection, an earthing boss and connections for the instruments stated on the datasheet. All nozzle positions shall be shown on the drawing.', M, DR),
      c('The tank bottom shall slope to the drain so that the tank drains fully, and the outlet connection shall be positioned to avoid drawing water or sludge.', M, DR),
      c('The tank shall have supports or a base that allow for thermal movement, and a lifting arrangement where the tank is moved in one piece.', S_, DR),
      c('The tank shall be suitable for internal inspection and cleaning, with a manway large enough for entry and rescue and a ladder or platform to the user’s safety standard.', S_, DR)
    ] },
    { t: 'Venting, blanketing and overfill protection', c: [
      c('The vent arrangement shall be: {vent}. The supplier shall state the vent sizing basis, including normal breathing from filling, emptying and temperature change, and the emergency case from an external fire.', M, DR),
      c('The tank shall have nitrogen blanketing with a pressure controller that keeps a slight positive pressure, a supply that cannot over-pressurise the tank, and an alarm on low and high pressure. The supplier shall state the nitrogen consumption.', M, DR, true, is('inert', /^Yes/)),
      c('The flame arrester shall be suitable for the vapour and the temperature, shall have a way to check for blockage, and shall be protected against freezing or polymer build-up.', M, DR, true, is('vent', /flame arrester/)),
      c('The level shall be measured by: {level}. An independent high-high level alarm that is not part of the control system shall act on the filling to prevent overfill.', M, DR),
      c('An independent level or pressure device shall protect against emptying below the minimum level, where this could draw air or damage the pump.', S_, DR)
    ] },
    { t: 'Materials and linings', c: [
      c('Wetted parts shall be made of {moc} and shall resist the stored liquid, any water present and the cleaning agents in use.', M, 'Design review, Documentation'),
      c('Where the tank is coated or lined, the supplier shall state the system, the thickness and the checks done, and shall confirm that it resists the stored liquid and its impurities.', S_, DR),
      c('Gaskets and seals shall be compatible with the stored liquid, and shall not swell or leach.', M, DR),
      c('Product-contact surfaces of a GMP tank shall have a surface roughness not greater than {finish}, with the measurement record provided.', M, 'FAT, Documentation', true, gmpProd),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for the shell and wetted parts, and weld records.', S_, DOC)
    ] },
    { t: 'Heating, cooling and insulation', c: [
      c('The tank shall have a heating coil or jacket sized to keep the liquid at the temperature stated, and the supplier shall state the duty and the heating medium limits so that the liquid does not overheat or exceed its flash point margin.', M, DR, true, is('heat', /^Heating/)),
      c('The tank shall have a cooling jacket sized to keep the liquid below the temperature stated, and the supplier shall state the duty and the coolant.', M, DR, true, is('heat', /^Cooling/)),
      c('The tank shall have insulation or a sun shield where stated by the user, and personnel protection on hot surfaces.', S_, DR)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The tank shall be cleaned by {cleaning}, and the supplier shall state the spray ball or device and the drainability for a GMP tank.', M, 'Design review, SAT', true, cipOn),
      c('The tank shall be suitable for {loc} installation.', S_, DR)
    ] },
    { t: 'Safety, containment and hazardous area', c: [
      c('The tank shall be bonded and earthed, with an earthing boss, and the supplier shall state any parts that could become electrically isolated. Where a non-conductive solvent is stored, the inlet shall be a dip pipe to the bottom, and the velocity during the first part of filling shall be limited to reduce the generation of static charge.', M, SAT, true, zoneOn),
      c('The tank, vent point, instruments and any electrical device shall be certified for {zone}, and the supplier shall state the hazardous zone around the vent and the nozzles.', M, DOC, true, zoneOn),
      c('Containment shall be: {contain}. The supplier shall state the volume the containment must hold and the arrangement for rain water and for spills.', M, DR),
      c('The double-walled tank shall have a leak detection system between the walls, with an alarm.', M, DR, true, is('contain', /^Double/)),
      c('The tank and vent shall be protected against lightning where the site risk assessment requires it, and the supplier shall state the earthing resistance.', S_, DR, true, zoneOn),
      c('The tank shall be marked with the name of the liquid, the tag, the hazard and the working volume, as required by the site standard.', S_, SAT)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The tank shall have a temperature measurement, and connections for the pressure measurement and for the sampling of the contents.', S_, DR),
      c('Level, pressure and high-high alarm signals shall be available to the plant control system.', M, DR),
      c('The supplier shall state any heating or cooling temperature control and its protection against over-temperature.', S_, DR, true, isnt('heat', /^None/))
    ] },
    docs('tank'),
    tests('tank', [
      c('The factory or site test shall include a water or liquid fill test, with a check of the settlement and of the leak tightness of all nozzles.', M, 'FAT, SAT'),
      c('The vent device and the level alarms shall be tested at their set points before the first fill.', M, SAT)
    ]),
    spares('tank')
  ]);

  /* ================= Receiver or hold-up vessel ================= */
  A.add('rcv', {
    cat: 'Reaction and vessels', label: 'Receiver or hold-up vessel', pfx: 'RCR', noun: 'receiver vessel', varKey: 'role',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'V-701 Distillate receiver' },
      { g: 'Duty', k: 'role', l: 'Service', t: 'sel', o: ['Vacuum receiver for distillate', 'Hold-up or surge vessel', 'Decanter or phase separator', 'Knock-out pot'], d: 'Vacuum receiver for distillate', drv: 1 },
      { g: 'Duty', k: 'liq', l: 'Liquid held', t: 'text', d: 'Toluene distillate with traces of water' },
      { g: 'Duty', k: 'vol', l: 'Working volume', t: 'num', u: 'm³', d: '2' },
      { g: 'Duty', k: 'fmax', l: 'Maximum fill', t: 'num', u: '% of total volume', d: '80' },
      { g: 'Duty', k: 'fmin', l: 'Minimum level for pump suction', t: 'num', u: '% of total volume', d: '10' },
      { g: 'Duty', k: 'rate', l: 'Inlet flow at design', t: 'num', u: 'm³/h', d: '1.5' },
      { g: 'Duty', k: 'tset', l: 'Settling time for phase separation', t: 'num', u: 'min', d: '15' },
      { g: 'Design', k: 'pd', l: 'Design pressure', t: 'num', u: 'barg', d: '3' },
      { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '120' },
      { g: 'Design', k: 'vac', l: 'Full vacuum rating', t: 'sel', o: YN, d: 'Yes', drv: 1 },
      { g: 'Design', k: 'orient', l: 'Orientation', t: 'sel', o: ['Vertical', 'Horizontal'], d: 'Vertical' },
      { g: 'Design', k: 'level', l: 'Level measurement', t: 'sel', o: ['Level transmitter with high and low alarms', 'Sight glass and level switches', 'Load cells'], d: 'Level transmitter with high and low alarms' },
      { g: 'Design', k: 'vent', l: 'Vent', t: 'text', d: 'To the vacuum system through a condenser' },
      { g: 'Design', k: 'samp', l: 'Sampling', t: 'sel', o: ['Closed sampler', 'Sample valve', 'None'], d: 'Closed sampler' },
      { g: 'Design', k: 'spray', l: 'Cleaning device', t: 'sel', o: ['Fixed spray ball', 'Rotating spray device', 'None (manual cleaning)'], d: 'Fixed spray ball', drv: 1 },
      { g: 'Design', k: 'drain', l: 'Outlet', t: 'sel', o: ['Bottom outlet valve, fully drainable', 'Side outlet with a dip leg'], d: 'Bottom outlet valve, fully drainable' }
    ]
  }, [
    { t: 'Process and capacity requirements', c: [
      c('The {role} shall hold {liq} with a working volume of {vol}, filled to no more than {fmax} of its total volume, and shall receive a flow of up to {rate}.', M, 'Design review, FAT'),
      c('The vessel shall allow the transfer pump to operate from a liquid level of {fmin} without vortexing or loss of suction, and the supplier shall state the outlet and vortex breaker design.', M, DR),
      c('The vessel shall be sized so that a full batch of distillate can be collected between two emptying operations, and the supplier shall state the volume between the high level alarm and the maximum fill.', S_, DR),
      c('The decanter shall give at least {tset} of settling time at the design inlet flow, with a baffle or weir arrangement that avoids short-circuiting, and the supplier shall state how the interface level is measured and controlled.', M, DR, true, is('role', /^Decanter/)),
      c('The knock-out pot shall remove entrained liquid from the gas with a stated carry-over at design flow, and shall have a drain that does not release gas.', M, DR, true, is('role', /^Knock/)),
      c('The vessel shall be arranged so that the inlet enters below the liquid level or through a dip pipe, so that the liquid does not splash or fall freely, and so that the vessel is not an ignition risk when it holds a non-conductive solvent.', M, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The vessel shall be designed to a recognised pressure vessel code stated by the supplier, for a design pressure of {pd} and a design temperature of {dt}.', M, DOC),
      c('The vessel shall be rated for full vacuum, and the supplier shall state the vacuum design check and the stiffening provided.', M, DR, true, is('vac', /^Yes/)),
      c('The vessel shall be installed {orient} and shall have the nozzles, manway or handhole, sight glasses, vent connection and instrument connections shown on the datasheet.', M, DR),
      c('The vent shall be arranged as follows: {vent}. The vent line shall not trap condensate and shall not be able to draw liquid into the vacuum system.', M, DR),
      c('The vessel outlet is: {drain}. The vessel shall be fully drainable with no pockets where liquid can remain after draining.', M, DR),
      c('The supplier shall state the allowable nozzle loads and the support design, including the weight of the full liquid.', S_, DR),
      c('Sight glasses shall be suitable for the pressure, vacuum and temperature, shall be protected against breakage, and shall have a means of illumination where stated by the user.', S_, DR, true, isnt('level', /^Load cells/))
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} and shall resist the liquid, any acid or water present and the cleaning agents in use.', M, 'Design review, Documentation'),
      c('Product-contact materials, including gaskets, seals and sight glass, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, with the measurement record provided.', M, 'FAT, Documentation', true, gmpProd),
      c('Product-contact welds shall be smooth and fully penetrated, recorded on a weld map, and the vessel shall be free of crevices and dead legs.', M, DOC, true, gmpProd),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for pressure parts and wetted parts.', S_, DOC)
    ] },
    { t: 'Cleaning and environment', c: [
      c('The vessel shall be cleaned by {cleaning}. The cleaning device is: {spray}. The supplier shall state the spray coverage and flow, and shall verify that all internal surfaces are wetted.', M, 'Design review, FAT', true, both(cipOn, isnt('spray', /^None/))),
      c('The vessel shall be drainable after cleaning with no residual liquid in the outlet, vent or instrument connections.', M, DR, true, gmpProd),
      c('The vessel shall be suitable for {loc} installation, with insulation or personnel protection for hot or cold surfaces.', S_, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The level shall be measured by: {level}. A high level alarm shall be provided, and a low level alarm shall protect the pump.', M, DR),
      c('Connections for temperature and pressure measurement shall be provided, with the pressure instrument able to read in vacuum.', S_, DR),
      c('The vessel shall have a sample arrangement: {samp}. A closed sampler shall allow a sample to be taken without exposing the operator or breaking the vacuum.', S_, DR, true, isnt('samp', /^None/)),
      c('Level and pressure signals shall be available to the plant control system.', C_, DR, false)
    ] },
    { t: 'Safety and hazardous area', c: [
      c('The vessel, nozzles, dip pipes and instruments shall be bonded and earthed, and the supplier shall state any parts that could become electrically isolated.', M, SAT, true, zoneOn),
      c('Any instrument or electrical device shall be certified for {zone}.', M, DOC, true, zoneOn),
      c('The vessel shall have a relief or a protected vent path for a pressure rise from blocked venting or a gas break-through, and the supplier shall state the relief basis.', M, DR),
      c('The supplier shall state how the vessel is protected against over-pressure when vacuum is broken with nitrogen or air.', S_, DR)
    ] },
    docs('receiver vessel'),
    tests('receiver vessel', [
      c('The factory test shall include a vacuum leak test, with a stated leak rate not exceeding the user’s limit, in addition to the pressure test required by the code.', M, FAT, true, is('vac', /^Yes/)),
      c('The factory test shall verify the surface finish, the drainability and the coverage of the spray device for a GMP vessel.', S_, FAT, true, gmpProd)
    ]),
    spares('receiver vessel')
  ]);

  /* ================= Pressure reactor or hydrogenator ================= */
  A.add('auto', {
    cat: 'Reaction and vessels', label: 'Pressure reactor or hydrogenator', pfx: 'HYD', noun: 'pressure reactor', varKey: 'gas',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'R-801 Hydrogenation autoclave' },
      { g: 'Duty', k: 'gas', l: 'Reaction gas', t: 'sel', o: ['Hydrogen', 'Hydrogen and carbon monoxide', 'Oxygen or air', 'Other gas', 'No reaction gas (inert pressure only)'], d: 'Hydrogen', drv: 1 },
      { g: 'Duty', k: 'proc', l: 'Process and reaction', t: 'text', d: 'Catalytic hydrogenation of a nitro compound in methanol' },
      { g: 'Duty', k: 'vol', l: 'Nominal working volume', t: 'num', u: 'L', d: '1000' },
      { g: 'Duty', k: 'fmax', l: 'Maximum fill', t: 'num', u: '% of total volume', d: '70' },
      { g: 'Duty', k: 'pmax', l: 'Maximum working pressure', t: 'num', u: 'barg', d: '15' },
      { g: 'Duty', k: 'trange', l: 'Operating temperature range', t: 'text', d: '20 to 100 °C' },
      { g: 'Duty', k: 'qrx', l: 'Maximum reaction heat release to be removed', t: 'num', u: 'kW', d: '40' },
      { g: 'Duty', k: 'catl', l: 'Catalyst', t: 'sel', o: ['Pyrophoric catalyst (wet Pd/C or Raney nickel)', 'Non-pyrophoric catalyst', 'Homogeneous catalyst'], d: 'Pyrophoric catalyst (wet Pd/C or Raney nickel)', drv: 1 },
      { g: 'Duty', k: 'hz', l: 'Heating and cooling arrangement', t: 'text', d: 'Jacket or internal coil with thermal fluid, -10 to 150 °C' },
      { g: 'Design', k: 'dpress', l: 'Design pressure', t: 'num', u: 'barg', d: '20' },
      { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '150' },
      { g: 'Design', k: 'vac', l: 'Full vacuum rating', t: 'sel', o: YN, d: 'Yes', drv: 1 },
      { g: 'Agitation', k: 'agit', l: 'Agitator type', t: 'sel', o: ['Gas-entraining hollow shaft', 'Gas-entraining turbine with draft tube', 'Standard turbine'], d: 'Gas-entraining hollow shaft' },
      { g: 'Agitation', k: 'rpm', l: 'Agitator speed range', t: 'text', d: '150 to 600 rpm' },
      { g: 'Agitation', k: 'rseal', l: 'Agitator shaft seal', t: 'sel', o: ['Magnetic drive (hermetic)', 'Double mechanical seal with barrier fluid', 'Single mechanical seal'], d: 'Magnetic drive (hermetic)', drv: 1 },
      { g: 'Safety', k: 'relief', l: 'Pressure relief', t: 'sel', o: ['Relief valve and rupture disc in series', 'Rupture disc only', 'Relief valve only'], d: 'Relief valve and rupture disc in series', drv: 1 },
      { g: 'Safety', k: 'burst', l: 'Burst and explosion containment', t: 'sel', o: ['Barricaded bay with blast wall', 'Vent to a safe location only', 'No special containment (low pressure)'], d: 'Barricaded bay with blast wall' },
      { g: 'Safety', k: 'filt', l: 'Catalyst filtration', t: 'sel', o: ['Closed filter at the reactor (candle or sparkler)', 'Separate filter provided by the user', 'Not applicable'], d: 'Closed filter at the reactor (candle or sparkler)' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The reactor shall carry out: {proc}, with {gas} as the reaction gas, at a working volume of {vol}, filled to no more than {fmax} of its total volume, at up to {pmax} and over a temperature range of {trange}.', M, 'FAT, Design review'),
      c('The supplier shall state the total volume and the free headspace, and shall show that the headspace is enough for foaming, for gas hold-up and for the gas feed without carry-over into the vent.', M, DR),
      c('The agitator is a {agit} running at {rpm}. The supplier shall state the gas transfer rate (kLa or equivalent) at the stated conditions, the power input and the drive rating, so that the reaction is not limited by the gas supply.', M, DR),
      c('The reactor shall remove a reaction heat of up to {qrx} through the heating and cooling arrangement: {hz}. The supplier shall state the heat transfer area and the heating and cooling rates achievable.', M, DR),
      c('Solid catalyst shall be kept in suspension at the lowest speed, and the supplier shall state the suspension speed and the effect of the catalyst on wear.', S_, DR, true, isnt('catl', /^Homogeneous/)),
      c('The supplier shall state the proposed arrangement for the gas inlet (sparger, hollow shaft or surface entrainment) and the behaviour of the reactor when the gas feed is lost.', S_, DR, true, isnt('gas', /^No reaction/))
    ] },
    { t: 'Pressure, temperature and mechanical design', c: [
      c('The reactor shall be designed to a recognised pressure vessel code stated by the supplier, for a design pressure of {dpress}, a design temperature of {dt} and the full vacuum condition.', M, DOC, true, is('vac', /^Yes/)),
      c('The reactor shall be designed to a recognised pressure vessel code stated by the supplier, for a design pressure of {dpress} and a design temperature of {dt}.', M, DOC, true, isnt('vac', /^Yes/)),
      c('The supplier shall state the margin between the maximum working pressure and the design pressure, and between the maximum working pressure and the set pressure of the relief device, and shall state the test pressure used.', M, DR),
      c('The reactor shall have as few flanged joints as practical, with welded or fully metal-sealed connections where the gas is hydrogen or toxic, and the supplier shall list every flange and joint on the pressurised system.', M, DR, true, is('gas', /^Hydrogen/)),
      c('The supplier shall state the allowable nozzle loads, and the vessel support shall allow for thermal expansion and for the weight of the full liquid and the agitator drive.', S_, DR),
      c('The reactor shall have nozzles for the charge, the gas inlet, the vent and relief, the sample, the temperature and pressure instruments, a bottom outlet and a manway or handhole of a size agreed with the user.', M, DR)
    ] },
    { t: 'Agitator and seals', c: [
      c('The agitator shaft seal is {rseal}. The supplier shall state the seal type, the barrier or flush arrangement and the allowable leak rate.', M, DR),
      c('The magnetic drive shall be rated for the maximum pressure and torque with a margin, shall have a containment shell that is not damaged by catalyst, and shall be protected against loss of cooling and decoupling. The supplier shall state how each is detected.', M, DR, true, is('rseal', /^Magnetic/)),
      c('The barrier fluid system shall include a reservoir with level and pressure indication, alarms on loss of barrier pressure, and a fluid that is compatible with the product and with hydrogen.', M, DR, true, is('rseal', /^Double/)),
      c('A single mechanical seal shall not be used with a toxic or highly flammable gas unless the supplier states and the user accepts the leak path, the collection and the monitoring.', M, DR, true, is('rseal', /^Single/)),
      c('The agitator shall be protected against overload and the loss of rotation, and a loss of rotation shall be detected and shall stop the gas feed.', M, 'Design review, FAT')
    ] },
    { t: 'Gas supply and handling', c: [
      c('The gas supply shall come from a dedicated line with a pressure reducing station, a pressure relief device, a check valve to stop the flow of liquid or gas back into the supply, and a limit on the flow rate, for example a restriction orifice, so that the gas rate in a fault is bounded.', M, DR, true, isnt('gas', /^No reaction/)),
      c('The reactor shall be purged with nitrogen before and after the gas is used. A purge sequence shall be defined, with an oxygen measurement to confirm that the oxygen content is below the limit before hydrogen is admitted, and the supplier shall state the number of purge cycles assumed.', M, DR, true, is('gas', /^Hydrogen/)),
      c('The hydrogen vent shall discharge to a safe location through a line that has no pockets, a flame arrester where required, and an arrangement that prevents air from entering the line.', M, DR, true, is('gas', /^Hydrogen/)),
      c('The supplier shall state the way that the system is leak-tested with an inert gas or helium at a pressure that the user agrees, before the process gas is introduced, and the leak rate that is accepted.', M, 'FAT, SAT', true, isnt('gas', /^No reaction/)),
      c('The oxygen or air reaction shall be designed to stay outside the flammable range of the solvent vapour, with an oxygen limit, an inert dilution and a stated relief basis, and the supplier shall state the basis.', M, DR, true, is('gas', /^Oxygen/))
    ] },
    { t: 'Catalyst handling and filtration', c: [
      c('The catalyst shall be charged as a wet paste or slurry under nitrogen through a closed charging arrangement, and shall never be exposed to dry solvent vapour and air. The supplier shall state the charging arrangement.', M, DR, true, is('catl', /^Pyrophoric/)),
      c('The catalyst shall be filtered in a closed system under nitrogen, kept wet at all times, with a water or solvent wash and a collection that prevents the filter cake from drying in air, and the supplier shall state the arrangement. The filter arrangement is: {filt}.', M, DR, true, is('catl', /^Pyrophoric/)),
      c('The supplier shall state how catalyst that remains in the vessel, in the dip pipes or in the pipework is removed or kept wet, and how the vessel is cleaned between batches.', S_, DR, true, isnt('catl', /^Homogeneous/)),
      c('The catalyst filter shall be sized for the solids loading and the filtration time, shall be rated for the pressure and temperature of the transfer, and shall be earthed.', S_, DR, true, is('filt', /^Closed/))
    ] },
    { t: 'Relief, containment and interlocks', c: [
      c('The pressure relief arrangement shall be: {relief}. The supplier shall state the relief scenarios considered, including gas feed regulator failure, loss of cooling, runaway reaction and external fire, and the relief sizing basis for each.', M, DR),
      c('The rupture disc shall be fitted with a burst indicator, an alarm and a tell-tale connection, shall be of a type that does not fragment, and shall discharge through a line that is sized for the relieving flow and routed to a safe location or a catch tank.', M, DR, true, is('relief', /rupture disc/)),
      c('The relief valve shall be protected from the process by a rupture disc, with a pressure gauge or switch between the two, so that a leaking disc is seen.', M, DR, true, is('relief', /in series/)),
      c('Containment arrangement: {burst}. The supplier shall state the design assumptions for the blast, the overpressure and the fragments.', M, DR),
      c('The reactor shall have interlocks that close the gas feed and the heating on high pressure, high temperature, loss of agitation and loss of cooling, and the supplier shall state the logic and shall support a risk assessment of the safety functions.', M, 'Design review, FAT'),
      c('A manual emergency stop and depressurisation shall be provided from a safe location, and the supplier shall state the venting rate and the route.', M, DR)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc}, suitable for the reaction mass, the gas, the catalyst and the cleaning agents in use, and the supplier shall state the suitability of the material at the design pressure and temperature, including any hydrogen attack or embrittlement limits.', M, 'Design review, Documentation'),
      c('Product-contact materials, including gaskets, seals and sight glass, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, with the measurement record provided.', M, 'FAT, Documentation', true, gmpProd),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for pressure parts and wetted parts, and weld maps with the non-destructive testing records.', M, DOC)
    ] },
    { t: 'Utilities, cleaning and hazardous area', c: [
      c('The reactor shall be cleaned by {cleaning}, and the supplier shall state the spray device and the coverage. Cleaning shall not leave catalyst or hydrogen trapped in the vessel.', M, 'Design review, SAT', true, cipOn),
      c('The reactor, agitator motor, instruments and all electrical equipment shall be certified for {zone}, and the supplier shall state the gas group and the temperature class.', M, DOC, true, zoneOn),
      c('The reactor, agitator, piping and all conductive parts shall be bonded and earthed, and the supplier shall state any parts that could become electrically isolated.', M, SAT, true, zoneOn),
      c('The area shall have hydrogen gas detection with alarms at stated levels and ventilation that keeps the gas below the limit, and the supplier shall state the detector positions assumed.', M, DR, true, is('gas', /^Hydrogen/)),
      c('The reactor shall be suitable for {loc} installation.', S_, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The reactor shall have temperature measurement of the contents and of the jacket or coil, and independent pressure measurement with a transmitter for control and a separate instrument for the safety function.', M, DR),
      c('The gas consumption shall be measured by a mass flow meter or a pressure drop in a calibrated supply vessel, and the supplier shall state the means of detecting the end of reaction.', S_, DR, true, isnt('gas', /^No reaction/)),
      c('The supplier shall state the agitator speed and torque measurements and the connections for the plant control system.', S_, DR),
      c('The supplier shall state the connection points for an online sample or analyser, and a closed sample point that keeps the operator and the process under inert gas.', C_, DR, false)
    ] },
    docs('pressure reactor', [c('The supplier shall provide the pressure equipment data report, the non-destructive test records and the relief device data, and shall support the user’s hazard study with the vessel and relief data.', M, DOC)]),
    tests('pressure reactor', [
      c('The pressure test shall be done to the test pressure required by the code with the stated medium, and a leak test with an inert gas or helium shall be done at a stated pressure before the vessel leaves the factory.', M, FAT),
      c('The interlocks, the relief indicators and the emergency depressurisation shall be tested at the factory acceptance test and again on site, and the results shall be recorded.', M, 'FAT, SAT'),
      c('The site acceptance test shall include a nitrogen run at pressure with the agitator, a leak test of every joint and a water or solvent trial of the charging and the filtration.', M, SAT)
    ]),
    spares('pressure reactor', [c('The supplier shall state the spare rupture discs, seals, gaskets and magnetic drive parts recommended, and the testing and the replacement interval for each.', S_, DOC)])
  ]);
});
