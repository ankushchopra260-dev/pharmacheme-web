/* URS builder equipment module: fluid movement and vacuum (diaphragm, dosing, liquid ring, dry screw) and solids handling (mill, sifter, blender).
   Loaded before urs-builder.js. Registers equipment through the PCE_URS queue. */
(window.PCE_URS = window.PCE_URS || { q: [] }).q.push(function (A) {
  var c = A.c, M = A.M, S_ = A.S_, C_ = A.C_, DR = A.DR, FAT = A.FAT, SAT = A.SAT, DOC = A.DOC, YN = A.YN;
  var gmpOn = A.gmpOn, prodOn = A.prodOn, gmpProd = A.gmpProd, zoneOn = A.zoneOn, cipOn = A.cipOn;
  var VAR = ['Fixed speed', 'Variable speed (VFD)'];

  /* Documentation, testing and spares sections are shared in shape; the wording names the equipment. */
  function tail(noun, fatList, satList) {
    return [
      { t: 'Documentation and qualification', c: [
        c('The supplier shall provide a datasheet, a general arrangement drawing, material certificates, an operation and maintenance manual and a recommended spare parts list for the ' + noun + '.', M, DOC),
        c('The supplier shall support design, installation and operational qualification (DQ, IQ and OQ) by providing the documents and traceability needed for the user’s protocols.', M, DOC, true, gmpOn),
        c('The supplier shall provide a compliance statement against this URS, listing every deviation, so that design qualification can be traced to the requirements.', M, DR, true, gmpOn),
        c('The supplier shall provide calibration certificates for the instruments supplied with the ' + noun + ' and a list of the instruments that need periodic calibration.', S_, DOC),
        c('The user may request an extended documentation package, including a risk assessment from the supplier and the software or firmware version history for any controller supplied.', C_, DOC, false)
      ] },
      { t: 'Testing: FAT and SAT', c: [
        c('The factory acceptance test shall include a visual and dimensional check, a check of the materials against the certificates, and a functional run of the ' + noun + ', and shall be open for the user to witness.', M, FAT)
      ].concat(fatList).concat([
        c('The site acceptance test shall include a check of the installation against the P&ID and the general arrangement drawing, a check of rotation and safety functions, and a run on the user’s utilities.', M, SAT)
      ]).concat(satList) },
      { t: 'Spares, delivery and warranty', c: [
        c('The supplier shall provide a list of recommended commissioning and two-year spares with prices and lead times.', S_, DOC),
        c('The equipment shall be delivered within {delivery} of the order, and the supplier shall give a delivery plan with the main milestones.', S_, DOC),
        c('The supplier shall give a warranty of {warranty} and shall state what it covers and what it excludes, including wear parts.', M, DOC),
        c('The supplier shall state the local service support available, the response time and the training offered to operators and maintenance staff.', S_, DOC)
      ] }
    ];
  }

  /* ---------------------------------------------------------------- air-operated diaphragm pump */
  A.add('aodd', {
    cat: 'Fluid movement and vacuum', label: 'Diaphragm pump (air-operated)', pfx: 'AOD', noun: 'air-operated diaphragm pump', varKey: 'body',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'P-301 Drum transfer diaphragm pump' },
      { g: 'Duty', k: 'fluid', l: 'Fluid and service', t: 'text', d: 'Mother liquor with fine solids, transfer from drum to tank' },
      { g: 'Duty', k: 'flow', l: 'Design flow', t: 'num', u: 'm³/h', d: '6' },
      { g: 'Duty', k: 'head', l: 'Discharge head required', t: 'num', u: 'm', d: '30' },
      { g: 'Duty', k: 'temp', l: 'Pumping temperature', t: 'num', u: '°C', d: '30' },
      { g: 'Duty', k: 'sg', l: 'Density', t: 'num', u: 'kg/m³', d: '1050' },
      { g: 'Duty', k: 'visc', l: 'Maximum viscosity', t: 'num', u: 'cP', d: '50' },
      { g: 'Duty', k: 'solids', l: 'Suspended solids', t: 'num', u: '% w/w', d: '5', drv: 1 },
      { g: 'Duty', k: 'part', l: 'Largest particle to pass', t: 'num', u: 'mm', d: '3' },
      { g: 'Duty', k: 'lift', l: 'Suction lift (negative if flooded)', t: 'num', u: 'm', d: '2' },
      { g: 'Duty', k: 'dryrun', l: 'Dry running capability required', t: 'sel', o: YN, d: 'Yes' },
      { g: 'Design', k: 'body', l: 'Pump body type', t: 'sel', o: ['Metal body (stainless steel)', 'Plastic body (PP or PVDF)', 'Hygienic body (sanitary design)'], d: 'Metal body (stainless steel)', drv: 1 },
      { g: 'Design', k: 'diaph', l: 'Diaphragm material', t: 'sel', o: ['PTFE', 'PTFE with elastomer backing', 'EPDM', 'Nitrile rubber'], d: 'PTFE' },
      { g: 'Design', k: 'dp', l: 'Maximum discharge pressure', t: 'num', u: 'barg', d: '6' },
      { g: 'Design', k: 'air', l: 'Compressed air supply pressure', t: 'num', u: 'barg', d: '6' },
      { g: 'Design', k: 'airq', l: 'Maximum air consumption', t: 'num', u: 'Nm³/h', d: '25' },
      { g: 'Design', k: 'pulse', l: 'Pulsation dampener', t: 'sel', o: ['Required', 'Not required'], d: 'Required', drv: 1 },
      { g: 'Design', k: 'leak', l: 'Diaphragm failure detection', t: 'sel', o: ['Leak detection sensor', 'Double diaphragm with monitored chamber', 'None'], d: 'Leak detection sensor', drv: 1 },
      { g: 'Design', k: 'exh', l: 'Air exhaust', t: 'sel', o: ['Muffled and piped to a safe area', 'Muffled only'], d: 'Muffled and piped to a safe area', drv: 1 },
      { g: 'Design', k: 'noise', l: 'Noise limit at 1 m', t: 'num', u: 'dB(A)', d: '80' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The pump shall deliver {flow} of {fluid} at a discharge head of {head}, at a pumping temperature of {temp}, a density of {sg} and a viscosity up to {visc}.', M, FAT),
      c('The pump shall be able to pass suspended solids of {solids} with a largest particle of {part} without blockage, and the supplier shall state the ball and seat type and the effect of solids on the valve life.', M, DR, true, function (v) { return parseFloat(v.solids) > 0; }),
      c('The pump shall prime and lift from a suction lift of {lift}, and the supplier shall state the dry suction lift and the wet suction lift.', M, DR),
      c('The pump shall be able to run dry without damage for a period stated by the supplier, and shall restart without manual priming.', M, DR, true, function (v) { return /^Yes/.test(v.dryrun); }),
      c('The supplier shall give the flow curve against discharge pressure for the stated air supply, and shall show that the duty point lies in a stable part of the curve.', M, DR),
      c('The pump shall stall safely against a closed discharge and shall restart when the discharge opens, without damage to the diaphragms or to the air valve.', M, DR),
      c('The pump flow shall be controllable by air pressure or by a regulator or an air flow control, and the supplier shall state the turndown over which the flow stays stable.', S_, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The pump shall be rated for a maximum discharge pressure of {dp} and shall be designed for the fluid temperature of {temp} with a margin stated by the supplier.', M, DOC),
      c('The pump body shall be of {body} construction, and the supplier shall state the pressure and temperature limits for that construction.', M, DR),
      c('The pump body shall be of hygienic design, free of crevices, with sanitary connections and no dead pockets, and shall be fully drainable when installed as stated on the drawing.', M, DR, true, function (v) { return /^Hygienic/.test(v.body); }),
      c('The diaphragms shall be made of {diaph}, and the supplier shall state the expected life at the duty, the stroke frequency and the allowed discharge pressure for that material.', M, DR),
      c('Connections shall be flanged or sanitary as stated on the datasheet, and the suction and discharge shall be arranged so that the pump can be flushed and drained.', S_, DR),
      c('The pump shall be mounted on a stand or a base that holds it stable under pulsation, and the user’s piping shall not impose loads on the pump casing.', S_, DR),
      c('The supplier shall provide a strainer or suction filter where the process requires it to protect the ball valves.', C_, DR, false)
    ] },
    { t: 'Air supply, pulsation and exhaust', c: [
      c('The pump shall run on compressed air supplied at {air}, with a maximum consumption of {airq} at the rated duty. The air shall be dry and filtered as stated by the supplier, and the supplier shall give the air quality needed.', M, DR),
      c('An air filter regulator with a pressure gauge and an isolation valve shall be fitted on the air supply to each pump.', S_, DR),
      c('A pulsation dampener shall be fitted on the discharge, with an air or nitrogen charge suitable for the process, and shall be capable of reducing pulsation to the level stated by the supplier.', M, DR, true, function (v) { return /^Required/.test(v.pulse); }),
      c('The exhaust air shall be muffled and piped to a safe area, so that any process fluid that enters the air side after a diaphragm failure does not reach operators or the work area.', M, DR, true, function (v) { return /^Muffled and piped/.test(v.exh); }),
      c('The exhaust shall be muffled so that the noise at 1 m does not exceed {noise}, and the supplier shall state the noise level at the rated duty.', S_, FAT),
      c('The pump shall be able to run on nitrogen as the driving gas where the area classification requires it, and the supplier shall state any limits.', C_, DR, false, zoneOn)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} and the diaphragms and valve balls and seats of the materials stated, and all shall be compatible with the fluid, the temperature and the cleaning agents in use.', M, 'Design review, Documentation'),
      c('Product-contact materials, including diaphragms, balls and seals, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('Product-contact metal surfaces shall have a surface roughness not greater than {finish}, with the measurement record provided.', M, 'FAT, Documentation', true, function (v) { return gmpProd(v) && /^Metal|^Hygienic/.test(v.body); }),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for the wetted metal parts.', S_, DOC),
      c('Where a plastic body is used, the supplier shall state the static charge behaviour of the material and the measures taken to avoid a static hazard with flammable fluids.', M, DR, true, function (v) { return /^Plastic/.test(v.body) && zoneOn(v); })
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The pump shall be suitable for the specified installation: {loc}, and for the specified area classification: {zone}.', M, DR),
      c('The pump shall be suitable for cleaning by {cleaning}, including the cleaning temperature and the cleaning chemicals, and shall drain after cleaning.', M, 'Design review, SAT', true, cipOn),
      c('The pump shall be bonded and earthed through a conductive body or a dedicated earth connection, and the supplier shall state any parts that could become electrically isolated.', M, SAT, true, zoneOn),
      c('The pump, air supply and exhaust shall be certified for use in {zone}, with the certificate stating the gas group and temperature class.', M, DOC, true, zoneOn)
    ] },
    { t: 'Instrumentation and safety', c: [
      c('Connections for suction and discharge pressure measurement shall be provided, with isolation valves.', S_, DR),
      c('A sensor shall detect a failed diaphragm and shall raise an alarm or stop the air supply. The supplier shall state the sensor type and the time to detect.', M, 'Design review, FAT', true, function (v) { return /^Leak|^Double/.test(v.leak); }),
      c('The monitored chamber of a double diaphragm shall have a pressure or level indication that shows a leak into it before the second diaphragm fails.', M, DR, true, function (v) { return /^Double/.test(v.leak); }),
      c('A stroke counter or flow indication shall be provided so that dry running, blocked valves or a low-flow condition can be detected.', S_, DR),
      c('A safety shut-off valve on the air supply shall be provided so that the pump can be stopped remotely or on an interlock.', S_, DR),
      c('The supplier shall state whether a stall or a closed discharge can overpressure the connected piping, and a relief provision shall be agreed where it can.', M, DR)
    ] }
  ].concat(tail('air-operated diaphragm pump',
    [c('The pump shall be tested for flow and pressure at the duty point on water or an agreed fluid, with the air consumption recorded.', M, FAT),
     c('The pump and piping connections shall be leak tested, and the diaphragm failure detection shall be tested by simulation.', S_, FAT)],
    [c('The pump shall be run on the process fluid or an agreed substitute, and the noise, pulsation, air consumption and diaphragm failure alarm shall be recorded.', S_, SAT)])));

  /* ---------------------------------------------------------------- dosing or metering pump */
  A.add('meter', {
    cat: 'Fluid movement and vacuum', label: 'Dosing or metering pump', pfx: 'MTR', noun: 'dosing pump', varKey: 'mtype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'P-310 Reagent dosing pump' },
      { g: 'Duty', k: 'mtype', l: 'Pump type', t: 'sel', o: ['Diaphragm metering', 'Piston plunger', 'Gear'], d: 'Diaphragm metering', drv: 1 },
      { g: 'Duty', k: 'fluid', l: 'Fluid and service', t: 'text', d: 'Sodium hydroxide 20% solution, dosing to reactor' },
      { g: 'Duty', k: 'flow', l: 'Maximum dosing flow', t: 'num', u: 'L/h', d: '60' },
      { g: 'Duty', k: 'flowmin', l: 'Minimum dosing flow', t: 'num', u: 'L/h', d: '6' },
      { g: 'Duty', k: 'acc', l: 'Accuracy of delivered flow', t: 'num', u: '% of reading', d: '1' },
      { g: 'Duty', k: 'rep', l: 'Repeatability', t: 'num', u: '% of reading', d: '0.5' },
      { g: 'Duty', k: 'dpres', l: 'Discharge pressure', t: 'num', u: 'barg', d: '6' },
      { g: 'Duty', k: 'suct', l: 'Suction condition', t: 'text', d: 'Flooded suction from a day tank' },
      { g: 'Duty', k: 'temp', l: 'Fluid temperature', t: 'num', u: '°C', d: '30' },
      { g: 'Duty', k: 'sg', l: 'Density', t: 'num', u: 'kg/m³', d: '1220' },
      { g: 'Duty', k: 'visc', l: 'Viscosity', t: 'num', u: 'cP', d: '20' },
      { g: 'Duty', k: 'duty', l: 'Dosing duty', t: 'sel', o: ['Continuous', 'Batch (timed or volumetric)'], d: 'Batch (timed or volumetric)', drv: 1 },
      { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '60' },
      { g: 'Design', k: 'dhead', l: 'Pump head construction', t: 'sel', o: ['Single diaphragm', 'Double diaphragm with leak detection', 'Not applicable (piston or gear)'], d: 'Double diaphragm with leak detection', drv: 1 },
      { g: 'Design', k: 'ctl', l: 'Flow control', t: 'sel', o: ['Manual stroke adjustment', 'Motorised stroke actuator', 'Variable speed (VFD)'], d: 'Motorised stroke actuator', drv: 1 },
      { g: 'Design', k: 'damp', l: 'Pulsation dampener', t: 'sel', o: ['Required', 'Not required'], d: 'Required', drv: 1 },
      { g: 'Design', k: 'bpv', l: 'Back pressure and anti-siphon valve', t: 'sel', o: ['Required', 'Not required'], d: 'Required', drv: 1 },
      { g: 'Design', k: 'supply', l: 'Electrical supply', t: 'text', d: '415 V, 3-phase, 50 Hz' },
      { g: 'Design', k: 'seal', l: 'Leakage protection of the pump head', t: 'sel', o: ['Hermetically sealed head', 'Packed or sealed plunger', 'Mechanical seal on gear pump'], d: 'Hermetically sealed head' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The pump shall dose {fluid} over a flow range of {flowmin} to {flow} at a discharge pressure of {dpres}, with a fluid temperature of {temp}, a density of {sg} and a viscosity of {visc}.', M, FAT),
      c('The delivered flow shall be within {acc} of the set flow over the whole range, and the repeatability shall be within {rep}.', M, FAT),
      c('The supplier shall state the turndown ratio over which the stated accuracy holds, and shall give the accuracy at the minimum flow as well as at the maximum flow.', M, DR),
      c('The dosing flow shall not change by more than the accuracy stated when the discharge pressure changes within the operating range or when the suction condition changes. The supplier shall state the effect.', M, DR),
      c('The pump shall suit the stated suction condition: {suct}, and the supplier shall state the NPSH required and the suction lift limit.', M, DR),
      c('The pump shall be suitable for batch dosing, with repeatable stroke or volume counts, and shall allow a dose to be stopped and restarted without a loss of accuracy.', M, DR, true, function (v) { return /^Batch/.test(v.duty); }),
      c('The pump shall be suitable for continuous running at the stated flow, and the supplier shall state the expected life of the wear parts for that duty.', M, DR, true, function (v) { return /^Continuous/.test(v.duty); })
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The pump shall be a {mtype} pump rated for a discharge pressure of {dpres} with a margin stated by the supplier, and for a design temperature of {dt}.', M, DR),
      c('The pump head shall have a double diaphragm with a monitored chamber, and the supplier shall describe how a failure of the first diaphragm is detected before the process fluid reaches the drive.', M, 'Design review, FAT', true, function (v) { return /^Double/.test(v.dhead); }),
      c('The diaphragm shall be supported against the stroke and the pressure by a hydraulic or mechanical arrangement, and the supplier shall state how the hydraulic oil is kept in balance and replenished.', M, DR, true, function (v) { return /^Diaphragm/.test(v.mtype); }),
      c('The plunger seal shall be suitable for the fluid and shall have a leakage collection and drain, and the supplier shall state the seal life and the leakage rate.', M, DR, true, function (v) { return /^Piston/.test(v.mtype); }),
      c('The gear pump shall have a seal or magnetic coupling suitable for the fluid, and the supplier shall state the clearances, the wear mechanism and the effect of wear on the delivered flow.', M, DR, true, function (v) { return /^Gear/.test(v.mtype); }),
      c('The pump and drive shall be mounted on a rigid base with a guard, and the drive shall be suitable for continuous duty at the stated electrical supply: {supply}.', S_, DR),
      c('The pump shall have a vent and a drain connection on the head so that it can be primed, vented and emptied.', S_, DR)
    ] },
    { t: 'Flow control and dosing accuracy', c: [
      c('Flow shall be controlled by {ctl}, and the supplier shall state the control range and the linearity over that range.', M, DR),
      c('The stroke actuator shall accept a standard analogue or digital signal from the plant control system and shall report the stroke position back to it.', S_, DR, true, function (v) { return /^Motorised/.test(v.ctl); }),
      c('The motor shall be suitable for inverter duty, and the minimum speed shall keep the drive cooling and lubrication adequate.', M, DR, true, function (v) { return /^Variable/.test(v.ctl); }),
      c('The supplier shall state how the delivered flow is calibrated, and shall provide a connection for a calibration column or a flow meter.', S_, DR),
      c('The pump shall hold its set stroke setting after a power failure and a restart.', C_, DR, false)
    ] },
    { t: 'Pulsation, back pressure and siphon protection', c: [
      c('A pulsation dampener shall be fitted on the discharge so that the flow in the dosing line is smooth enough for the process, and the supplier shall state the charge pressure and how it is checked.', M, DR, true, function (v) { return /^Required/.test(v.damp); }),
      c('A back pressure valve shall hold a constant pressure on the pump discharge, and an anti-siphon function shall stop uncontrolled flow when the suction is higher than the injection point.', M, DR, true, function (v) { return /^Required/.test(v.bpv); }),
      c('A relief valve or a rupture disc shall protect the discharge line from over-pressure, and its outlet shall return to a safe location.', M, DR),
      c('A calibration column, a strainer on the suction and an isolation valve on each side shall be provided.', S_, DR, false)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} and shall be compatible with {fluid}, the temperature and the cleaning agents. The supplier shall provide the chemical compatibility basis for each wetted part.', M, 'Design review, Documentation'),
      c('Product-contact materials, including diaphragms, valve seats, balls and seals, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('Product-contact surfaces of the head shall have a roughness not greater than {finish}.', S_, FAT, true, gmpProd),
      c('The supplier shall provide material certificates for the pump head and for wetted parts.', S_, DOC)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The drive shall suit the supply of {supply}, the installation ({loc}) and the area classification ({zone}).', M, DR),
      c('The motor, stroke actuator and all electrical equipment shall be certified for {zone}, with the gas group and temperature class stated.', M, DOC, true, zoneOn),
      c('The pump shall withstand the cleaning method ({cleaning}) and the cleaning chemicals, and the head shall drain after cleaning.', M, 'Design review, SAT', true, cipOn),
      c('The pump shall be bonded and earthed, and the dosing line shall not become electrically isolated where a flammable fluid is dosed.', M, SAT, true, zoneOn)
    ] },
    { t: 'Instrumentation and safety', c: [
      c('The pump shall have a diaphragm failure or leakage alarm and the connection to the plant control system for run, fault and stroke position.', S_, DR),
      c('A low-level interlock on the supply tank or a dry-run protection shall stop the pump before the suction runs dry.', M, 'Design review, FAT'),
      c('A flow confirmation (for example a flow meter or a flow switch on the dosing line) shall be provided where the dose is critical to quality or safety.', S_, DR),
      c('For a dose that is critical to safety, such as an exothermic reagent, the pump shall stop on a high temperature or a high pressure interlock from the receiving vessel.', M, DR, true, function (v) { return /^Batch/.test(v.duty); })
    ] }
  ].concat(tail('dosing pump',
    [c('The pump shall be tested for delivered flow at minimum, mid and maximum settings, at the rated discharge pressure, to confirm the accuracy and the repeatability stated in this URS.', M, FAT),
     c('The pump head shall be tested for leaks, and the diaphragm failure detection shall be tested by simulation.', S_, FAT, true, function (v) { return /^Diaphragm/.test(v.mtype); })],
    [c('The delivered flow shall be checked on site, with the real fluid or a substitute, by a calibration column or a weighing method, and the results shall be recorded.', M, SAT)])));

  /* ---------------------------------------------------------------- liquid ring vacuum pump system */
  A.add('lrvp', {
    cat: 'Fluid movement and vacuum', label: 'Liquid ring vacuum pump system', pfx: 'LRV', noun: 'liquid ring vacuum pump system', varKey: 'sealliq',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'V-401 Liquid ring vacuum system' },
      { g: 'Duty', k: 'svc', l: 'Service', t: 'text', d: 'Vacuum for distillation and drying from reactors R-401 to R-404' },
      { g: 'Duty', k: 'vap', l: 'Main vapours and gases', t: 'text', d: 'Toluene, methanol vapours and nitrogen' },
      { g: 'Duty', k: 'cap', l: 'Suction capacity at operating pressure', t: 'num', u: 'm³/h', d: '300' },
      { g: 'Duty', k: 'opp', l: 'Operating suction pressure', t: 'num', u: 'mbar(a)', d: '100' },
      { g: 'Duty', k: 'ult', l: 'Ultimate vacuum required', t: 'num', u: 'mbar(a)', d: '33' },
      { g: 'Duty', k: 'load', l: 'Condensable vapour load', t: 'num', u: 'kg/h', d: '40' },
      { g: 'Duty', k: 'time', l: 'Evacuation time of the connected system', t: 'num', u: 'min', d: '30' },
      { g: 'Duty', k: 'vol', l: 'Volume of the connected system', t: 'num', u: 'm³', d: '8' },
      { g: 'Design', k: 'cfg', l: 'Configuration', t: 'sel', o: ['Single pump', 'Duty and standby pumps', 'Pump with booster or ejector'], d: 'Duty and standby pumps', drv: 1 },
      { g: 'Design', k: 'sealliq', l: 'Sealing liquid system', t: 'sel', o: ['Water, once through', 'Water, recirculated with a heat exchanger', 'Solvent in a closed loop', 'Oil'], d: 'Water, recirculated with a heat exchanger', drv: 1 },
      { g: 'Design', k: 'sealt', l: 'Sealing liquid temperature', t: 'num', u: '°C', d: '15' },
      { g: 'Design', k: 'rflow', l: 'Sealing liquid flow per pump', t: 'num', u: 'm³/h', d: '3' },
      { g: 'Design', k: 'rcool', l: 'Cooling of the sealing liquid', t: 'sel', o: ['Chilled water', 'Cooling tower water', 'None'], d: 'Chilled water', drv: 1 },
      { g: 'Design', k: 'sep', l: 'Separator', t: 'sel', o: ['Separator with level control', 'Separator with overflow only'], d: 'Separator with level control' },
      { g: 'Design', k: 'exh', l: 'Exhaust treatment', t: 'sel', o: ['Vent to a condenser or scrubber', 'Vent to atmosphere (non-hazardous gas only)'], d: 'Vent to a condenser or scrubber', drv: 1 },
      { g: 'Design', k: 'kw', l: 'Estimated motor rating per pump', t: 'num', u: 'kW', d: '30' },
      { g: 'Design', k: 'supply', l: 'Electrical supply', t: 'text', d: '415 V, 3-phase, 50 Hz' },
      { g: 'Design', k: 'noise', l: 'Noise limit at 1 m', t: 'num', u: 'dB(A)', d: '85' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The system shall maintain a suction pressure of {opp} with a capacity of {cap} for the service: {svc}, and shall be able to reach an ultimate vacuum of {ult}.', M, FAT),
      c('The system shall evacuate the connected volume of {vol} to the operating pressure within {time}, and the supplier shall state the assumptions used for the leak rate.', M, DR),
      c('The system shall handle the condensable vapour load of {load} of {vap}, and the supplier shall state the capacity at the operating pressure including the vapour, not only for dry air.', M, DR),
      c('The supplier shall provide the capacity curve against suction pressure at the sealing liquid temperature of {sealt}, and shall state the effect of a higher sealing liquid temperature on the capacity.', M, DR),
      c('The system shall state the vapour pressure of the sealing liquid at the operating temperature, because this sets the ultimate vacuum that can be reached.', M, DR),
      c('The system shall run continuously at the operating pressure without cavitation, and the supplier shall state the margin to cavitation at the lowest suction pressure.', M, DR),
      c('Where a booster or ejector is used, the supplier shall give the combined performance of the stages and the effect of one stage failing.', M, DR, true, function (v) { return /booster|ejector/i.test(v.cfg); })
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The system shall have the configuration: {cfg}. The supplier shall state how a standby pump starts, how the changeover is controlled and whether it is automatic.', M, DR),
      c('The pump and motor shall be mounted on a common baseplate with a coupling guard, and the pump shall be designed for continuous duty at the specified operating pressure.', M, DR),
      c('The pump shall be mounted so that it cannot be flooded with sealing liquid from the separator when stopped. A non-return valve or a vacuum break on the suction shall prevent liquid or air flowing back to the process.', M, DR),
      c('The shaft sealing shall be suitable for vacuum duty and for the fluid. The supplier shall state the seal type, the flush and the seal life.', M, DR),
      c('The pipework shall be arranged so that sealing liquid and condensate can drain and the pump and separator can be emptied completely.', S_, DR),
      c('Vibration and noise shall not exceed the limits in the user’s standard, and the noise at 1 m shall not exceed {noise}.', S_, FAT),
      c('The supplier shall state the type of connection to the process and the size of the suction line, and shall provide a suction isolation valve and a vacuum break valve.', S_, DR)
    ] },
    { t: 'Sealing liquid, separator and cooling', c: [
      c('The sealing liquid shall be compatible with the process vapours: it shall not react with them, and its contamination by the process shall be assessed. The supplier shall state how the sealing liquid is replaced or purged.', M, DR),
      c('The sealing liquid shall be recirculated through a heat exchanger that keeps it at {sealt}. The supplier shall state the duty of the heat exchanger and the cooling water or chilled water flow needed.', M, DR, true, function (v) { return /ecirculated|loop/i.test(v.sealliq) && !/^None/.test(v.rcool); }),
      c('The system shall use {rflow} of sealing liquid per pump, and the supplier shall state the make-up flow, the purge or bleed flow and the quality needed.', M, DR),
      c('Once-through water use shall be limited to the supplier’s stated flow, and the user shall be told of the effluent produced and its likely contamination with solvents.', S_, DR, true, function (v) { return /once/i.test(v.sealliq); }),
      c('The closed loop solvent shall be chosen so that its vapour pressure at the operating temperature allows the ultimate vacuum, and shall be cooled and filtered as stated by the supplier.', M, DR, true, function (v) { return /^Solvent/.test(v.sealliq); }),
      c('The separator shall separate the gas from the sealing liquid and shall have level control, an overflow, a drain and a sight glass.', M, DR),
      c('The system shall include a condenser or a vapour trap upstream where the vapour load can contaminate the sealing liquid, and the supplier shall state the recovered amount.', S_, DR, false)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} and shall be compatible with the process vapours, the sealing liquid and the cleaning agents in use.', M, 'Design review, Documentation'),
      c('Where the pump handles corrosive vapours, the supplier shall state the corrosion data for the casing, the rotor and the separator, and the allowance used.', M, DR),
      c('The supplier shall provide material certificates for the casing, the rotor and the separator.', S_, DOC),
      c('Surfaces in contact with product vapours shall be free of crevices and shall have a surface roughness not greater than {finish} where the system is on a product-contact line.', S_, FAT, true, gmpProd)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The motors shall suit the supply of {supply} and the installation ({loc}), and the supplier shall state the starting current and the starter type.', M, DR),
      c('The motor and all electrical equipment shall be certified for {zone}, with the gas group and temperature class stated.', M, DOC, true, zoneOn),
      c('The pump, separator and pipework shall be bonded and earthed.', M, SAT, true, zoneOn),
      c('The system shall be suitable for cleaning by {cleaning} where the suction line carries product.', S_, 'Design review, SAT', true, cipOn),
      c('The exhaust from the separator shall be vented to a condenser, scrubber or a safe location. The vent line shall be sized so that it does not create back-pressure on the separator.', M, DR, true, function (v) { return /^Vent to a condenser/.test(v.exh); }),
      c('The exhaust shall be vented to atmosphere only when the gas contains no hazardous or odorous component, and the user shall confirm this for each connected process.', M, DR, true, function (v) { return /^Vent to atmosphere/.test(v.exh); })
    ] },
    { t: 'Instrumentation and control', c: [
      c('The system shall have a suction pressure transmitter, a sealing liquid temperature measurement, a separator level switch and a low flow alarm for the sealing liquid.', M, DR),
      c('The pump shall be protected against low sealing liquid, high motor current and high temperature, and shall stop safely on each fault.', M, 'Design review, FAT'),
      c('The vacuum shall be controlled by a pressure controller, and the supplier shall state how the vacuum is controlled (for example a controlled air bleed or a speed change).', S_, DR),
      c('Run and fault status signals shall be available for connection to the plant control system, including the standby changeover.', S_, DR)
    ] }
  ].concat(tail('liquid ring vacuum pump system',
    [c('The system shall be tested for capacity and for ultimate vacuum at the stated sealing liquid temperature, and the results shall be compared with the curve.', M, FAT),
     c('The system shall be leak tested at vacuum, with an agreed leak-up rate, and the seals and joints shall be checked.', M, FAT),
     c('The control, the protection and the standby changeover shall be tested by simulation.', S_, FAT)],
    [c('The system shall be run on site on the connected process, and the vacuum, the evacuation time, the sealing liquid temperature and the power consumption shall be recorded.', M, SAT)])));

  /* ---------------------------------------------------------------- dry screw vacuum pump */
  A.add('dsvp', {
    cat: 'Fluid movement and vacuum', label: 'Dry screw vacuum pump', pfx: 'DSV', noun: 'dry screw vacuum pump', varKey: 'icond',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'V-411 Dry screw vacuum pump' },
      { g: 'Duty', k: 'svc', l: 'Service', t: 'text', d: 'Vacuum for reactors and a vacuum dryer, solvent-laden vapours' },
      { g: 'Duty', k: 'vap', l: 'Main vapours and gases', t: 'text', d: 'Toluene, methanol, acetone and nitrogen' },
      { g: 'Duty', k: 'cap', l: 'Suction capacity at operating pressure', t: 'num', u: 'm³/h', d: '250' },
      { g: 'Duty', k: 'opp', l: 'Operating suction pressure', t: 'num', u: 'mbar(a)', d: '5' },
      { g: 'Duty', k: 'ult', l: 'Ultimate vacuum required', t: 'num', u: 'mbar(a)', d: '0.1' },
      { g: 'Duty', k: 'load', l: 'Condensable vapour load', t: 'num', u: 'kg/h', d: '15' },
      { g: 'Duty', k: 'tin', l: 'Inlet gas temperature', t: 'num', u: '°C', d: '60' },
      { g: 'Duty', k: 'tbody', l: 'Maximum pump body temperature', t: 'num', u: '°C', d: '120' },
      { g: 'Design', k: 'icond', l: 'Inlet condenser', t: 'sel', o: ['Inlet condenser and receiver supplied', 'Inlet condenser supplied by others', 'None'], d: 'Inlet condenser and receiver supplied', drv: 1 },
      { g: 'Design', k: 'purge', l: 'Purge gas', t: 'sel', o: ['Nitrogen purge with flow monitoring', 'Nitrogen purge', 'None'], d: 'Nitrogen purge with flow monitoring', drv: 1 },
      { g: 'Design', k: 'pwd', l: 'Powder or solids in the suction', t: 'sel', o: ['None (filtered)', 'Light dust (inlet filter)', 'Significant solids'], d: 'Light dust (inlet filter)', drv: 1 },
      { g: 'Design', k: 'cool', l: 'Pump cooling', t: 'sel', o: ['Water cooled', 'Air cooled'], d: 'Water cooled' },
      { g: 'Design', k: 'drive', l: 'Speed control', t: 'sel', o: VAR, d: 'Variable speed (VFD)', drv: 1 },
      { g: 'Design', k: 'kw', l: 'Estimated motor rating', t: 'num', u: 'kW', d: '22' },
      { g: 'Design', k: 'supply', l: 'Electrical supply', t: 'text', d: '415 V, 3-phase, 50 Hz' },
      { g: 'Design', k: 'noise', l: 'Noise limit at 1 m', t: 'num', u: 'dB(A)', d: '75' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The pump shall maintain a suction pressure of {opp} with a capacity of {cap} for the service: {svc}, and shall reach an ultimate vacuum of {ult} with the inlet closed.', M, FAT),
      c('The pump shall handle {vap} at the vapour load of {load} and an inlet gas temperature of {tin}, without condensation inside the pump that could cause corrosion, a loss of performance or a dilution of oil in the gear case.', M, DR),
      c('The supplier shall provide the capacity curve against suction pressure and shall give the capacity for the actual vapour mixture, not only for dry air.', M, DR),
      c('The pump shall give a clean vacuum with no oil or sealing liquid contamination of the process. The supplier shall state how oil is kept separate from the pumped gas.', M, DR),
      c('The pump shall be able to run continuously at the operating pressure and to start against the connected system without a pressure limit that could overload it.', M, DR),
      c('The supplier shall state the maximum allowed discharge pressure and the exhaust arrangement, and the allowed pressure rise at the pump outlet.', S_, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The pump shall be of a dry screw design, with rotors that do not touch and no lubricant in the pumping chamber. The supplier shall state the clearances and the effect of wear.', M, DR),
      c('The pump body shall be heated or controlled to a temperature of up to {tbody}, so that solvents stay in the vapour phase. The supplier shall state the temperature control method and the limits.', M, DR),
      c('The pump shall be mounted on a skid or baseplate with the motor, the coupling guard and the connections, and shall be suitable for continuous duty.', M, DR),
      c('Shaft seals shall be suitable for vacuum duty and for the solvents handled, and shall have a purge arrangement. The supplier shall state the seal type and the expected life.', M, DR),
      c('The lubricated gear case and bearings shall be separated from the pumping chamber, and the oil level shall be visible and the oil drainable.', M, DR),
      c('The pump shall be designed so that the rotors can be removed and cleaned without removing the pump from the line where the service needs this.', C_, DR, false),
      c('Noise at 1 m shall not exceed {noise}, and the supplier shall state the noise level, with and without any enclosure.', S_, FAT)
    ] },
    { t: 'Condensables, purge and solids', c: [
      c('An inlet condenser and a receiver shall be fitted upstream of the pump to condense solvent before it enters the pump, and the supplier shall state the duty, the coolant and the condensate collection.', M, DR, true, function (v) { return /^Inlet condenser and receiver/.test(v.icond); }),
      c('The pump shall be supplied with a connection for a user-supplied inlet condenser, and the supplier shall state the data it needs to match the condenser to the pump.', M, DR, true, function (v) { return /by others/.test(v.icond); }),
      c('The pump shall be supplied without an inlet condenser. The supplier shall state the maximum condensable load the pump can take without one, and the user shall confirm that the actual load is below it.', M, DR, true, function (v) { return /^None/.test(v.icond); }),
      c('A nitrogen purge shall be injected at the seals, and where necessary at the pumping chamber, so that vapours do not condense or pass the seals. The supplier shall state the purge flow and the pressure.', M, DR, true, function (v) { return /^Nitrogen/.test(v.purge); }),
      c('The purge flow shall be monitored, and a loss of purge shall raise an alarm and stop the pump or prevent a start.', M, 'Design review, FAT', true, function (v) { return /monitoring/.test(v.purge); }),
      c('An inlet filter or a dust trap shall be fitted, and the supplier shall state the pressure drop, the cleaning method and the effect of a blocked filter on the capacity.', M, DR, true, function (v) { return /^Light/.test(v.pwd); }),
      c('The pump shall be able to handle solids in the suction, and the supplier shall state the maximum solids load, the wear mechanism and how the pump is flushed or cleaned.', M, DR, true, function (v) { return /^Significant/.test(v.pwd); }),
      c('The exhaust of the pump shall be vented to a condenser, scrubber or a safe location, and the exhaust line shall be sized so that the pump does not see excess back-pressure.', M, DR)
    ] },
    { t: 'Drive and cooling', c: [
      c('The pump shall be cooled by {cool}, and the supplier shall state the coolant flow, temperature and quality needed.', M, DR),
      c('The pump shall have a variable speed drive. The supplier shall state the speed range, how the speed is used to control the vacuum, and the effect of speed on the capacity.', S_, DR, true, function (v) { return /^Variable/.test(v.drive); }),
      c('The motor shall suit the supply of {supply} and the installation ({loc}), and the supplier shall state the starting current.', M, DR),
      c('The motor shall be suitable for inverter duty, with insulation and bearing protection stated by the supplier.', M, DR, true, function (v) { return /^Variable/.test(v.drive); })
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} or a coating suitable for the vapours, and shall be compatible with the solvents, the condensate and the cleaning agents in use.', M, 'Design review, Documentation'),
      c('The supplier shall state the corrosion protection of the rotors and the casing, and shall give the coating thickness and the repair method.', M, DR),
      c('The supplier shall provide material certificates for the casing, rotors and the inlet condenser.', S_, DOC),
      c('Product-contact surfaces of the inlet condenser and the receiver shall have a roughness not greater than {finish}.', S_, FAT, true, function (v) { return gmpProd(v) && !/^None/.test(v.icond); })
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The motor and all electrical equipment shall be certified for {zone}, with the gas group and temperature class stated.', M, DOC, true, zoneOn),
      c('The pump, condenser and pipework shall be bonded and earthed.', M, SAT, true, zoneOn),
      c('The pump shall be suitable for the cleaning method ({cleaning}) on the inlet side, and the supplier shall state how the inlet condenser and the receiver are drained and cleaned.', S_, 'Design review, SAT', true, cipOn),
      c('The pump shall be suitable for installation ({loc}) with the ambient temperatures stated by the user, and shall have the enclosure or the ventilation needed.', S_, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The pump shall have a suction pressure transmitter, a body or gas temperature measurement, a cooling flow switch and a high temperature trip.', M, DR),
      c('The pump shall be protected against high discharge pressure, high motor current, loss of coolant, loss of purge and overtemperature, and shall stop safely on each.', M, 'Design review, FAT'),
      c('The vacuum shall be controlled, and the supplier shall state how the vacuum is controlled and how the speed responds.', S_, DR),
      c('Run, fault and status signals shall be available for connection to the plant control system.', S_, DR)
    ] }
  ].concat(tail('dry screw vacuum pump',
    [c('The pump shall be tested for capacity and ultimate vacuum, and the results shall be compared with the capacity curve.', M, FAT),
     c('The pump shall be leak tested at vacuum with an agreed leak-up rate, and the purge, cooling and protection functions shall be tested.', M, FAT)],
    [c('The pump shall be run on site on the connected process, and the vacuum, the body temperature, the purge flow and the power consumption shall be recorded.', M, SAT)])));

  /* ---------------------------------------------------------------- multi mill or pulveriser */
  A.add('mill', {
    cat: 'Solids handling and size reduction', label: 'Multi mill or pulveriser', pfx: 'MIL', noun: 'mill', varKey: 'mtype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'M-501 Multi mill for API milling' },
      { g: 'Duty', k: 'mtype', l: 'Mill type', t: 'sel', o: ['Multi mill', 'Pin mill', 'Hammer mill', 'Jet mill'], d: 'Multi mill', drv: 1 },
      { g: 'Duty', k: 'prod', l: 'Product and hazards', t: 'text', d: 'Dry crystalline API, combustible dust' },
      { g: 'Duty', k: 'feed', l: 'Feed rate', t: 'num', u: 'kg/h', d: '200' },
      { g: 'Duty', k: 'fsize', l: 'Feed particle size (d90)', t: 'num', u: 'µm', d: '800' },
      { g: 'Duty', k: 'target', l: 'Target particle size (d90)', t: 'num', u: 'µm', d: '150' },
      { g: 'Duty', k: 'psd', l: 'Particle size distribution requirement', t: 'text', d: 'd50 40 to 60 µm, d90 below 150 µm, as agreed with QA' },
      { g: 'Duty', k: 'bd', l: 'Bulk density of feed', t: 'num', u: 'kg/m³', d: '600' },
      { g: 'Duty', k: 'melt', l: 'Melting or softening point of product', t: 'num', u: '°C', d: '120' },
      { g: 'Duty', k: 'tmax', l: 'Maximum product temperature during milling', t: 'num', u: '°C', d: '45' },
      { g: 'Design', k: 'cont', l: 'Dust containment', t: 'sel', o: ['Closed system with dust collector', 'Closed with a contained feed and discharge (high potency)', 'Open feed with local extraction'], d: 'Closed system with dust collector', drv: 1 },
      { g: 'Design', k: 'inert', l: 'Inerting', t: 'sel', o: ['Nitrogen inerting', 'No inerting'], d: 'No inerting', drv: 1 },
      { g: 'Design', k: 'expl', l: 'Explosion protection', t: 'sel', o: ['Explosion venting, isolation or suppression', 'Explosion pressure shock resistant design', 'Not required (non-combustible)'], d: 'Explosion venting, isolation or suppression', drv: 1 },
      { g: 'Design', k: 'mcool', l: 'Mill cooling', t: 'sel', o: ['Cooling jacket', 'Cooled process gas', 'None'], d: 'Cooling jacket', drv: 1 },
      { g: 'Design', k: 'screens', l: 'Screens and sizes', t: 'text', d: 'Interchangeable perforated screens, 0.5 to 3 mm' },
      { g: 'Design', k: 'speed', l: 'Rotor speed range', t: 'text', d: '1500 to 4500 rpm' },
      { g: 'Design', k: 'drive', l: 'Speed control', t: 'sel', o: VAR, d: 'Variable speed (VFD)' },
      { g: 'Design', k: 'kw', l: 'Estimated motor rating', t: 'num', u: 'kW', d: '15' },
      { g: 'Design', k: 'disch', l: 'Discharge', t: 'sel', o: ['Gravity to a container or bin', 'Pneumatic conveying', 'To a hopper'], d: 'Gravity to a container or bin' },
      { g: 'Design', k: 'noise', l: 'Noise limit at 1 m', t: 'num', u: 'dB(A)', d: '85' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The {mtype} shall mill {prod} at a feed rate of {feed}, reducing the feed particle size of {fsize} (d90) to a target of {target} (d90), with the distribution: {psd}.', M, FAT),
      c('The supplier shall state the screen, the rotor speed and the feed rate needed to reach the target, and shall state the range over which the particle size distribution can be changed.', M, DR),
      c('The mill shall not raise the product temperature above {tmax} at the rated feed rate. The supplier shall state the heat generation and the cooling provided, and the margin to the melting or softening point of {melt}.', M, DR),
      c('The mill shall not change the crystal form, cause amorphous content or degrade the product, and the supplier shall state the energy input and shall support a trial on the user’s product where needed.', M, 'Design review, FAT'),
      c('The yield loss shall not exceed the figure agreed with the user, and the supplier shall state where product is retained in the mill, the cyclone and the filter.', S_, DR),
      c('The feed shall be metered at a steady rate, and the supplier shall state the type of feeder and the effect of an uneven feed on the particle size.', S_, DR),
      c('The jet mill shall state the gas consumption, the gas pressure and the dew point of the milling gas needed for the stated particle size.', M, DR, true, function (v) { return /^Jet/.test(v.mtype); })
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The mill shall be designed for continuous duty at the rated feed rate, with a rotor balanced and guarded for the speed range of {speed}.', M, DR),
      c('The screens and blades or pins shall be easy to change without special tools, and the supplier shall state the time for a change and for a clean.', M, DR, true, function (v) { return !/^Jet/.test(v.mtype); }),
      c('The mill shall have a safety interlock that stops the rotor if a door or cover is opened, and shall prevent the cover being opened until the rotor has stopped.', M, DR),
      c('The mill shall prevent metal-to-metal contact between the rotor and the casing, and the supplier shall state the clearances and the effect of wear on the particle size.', M, DR),
      c('The mill shall have a magnet or a metal trap on the feed where the user’s process requires it, and the supplier shall state the type and the cleaning method.', S_, DR, false),
      c('The mill shall be mounted on a rigid frame that limits vibration, and the user’s building shall not need special foundations beyond those stated by the supplier.', S_, DR),
      c('Noise at 1 m shall not exceed {noise}.', S_, FAT)
    ] },
    { t: 'Dust containment and discharge', c: [
      c('The mill system shall be closed, with a dust collector or filter, and shall not release dust to the room at the stated operating conditions. The supplier shall state the dust level measured at the points of release.', M, 'FAT, SAT', true, function (v) { return /^Closed system/.test(v.cont); }),
      c('The mill shall have a contained feed and discharge, for example by split butterfly valves or a contained charge system, to the exposure limit given by the user, and the supplier shall state the containment performance and the test method.', M, 'FAT, SAT', true, function (v) { return /^Closed with a contained/.test(v.cont); }),
      c('The mill shall have local extraction at the open feed point, and the supplier shall state the extraction volume and the capture velocity needed.', M, DR, true, function (v) { return /^Open feed/.test(v.cont); }),
      c('The discharge shall be by {disch}, and shall be arranged so that product does not build up, bridge or segregate.', M, DR),
      c('Where pneumatic conveying is used, the supplier shall state the gas flow, the product velocity and the effect on particle breakage and on static.', M, DR, true, function (v) { return /^Pneumatic/.test(v.disch); }),
      c('The dust collector shall have a cleaning system and a differential pressure indication, and the filter media shall be suitable for the product and for the cleaning method.', M, DR, true, function (v) { return /^Closed/.test(v.cont); })
    ] },
    { t: 'Heat, inerting and explosion protection', c: [
      c('The mill shall be cooled by {mcool}, and the supplier shall state the cooling duty, the coolant flow and the cooling temperature needed.', M, DR, true, function (v) { return !/^None/.test(v.mcool); }),
      c('The mill system shall be inerted with nitrogen, and the supplier shall state the oxygen limit, the nitrogen flow, how the system is purged before start and how oxygen is measured.', M, 'Design review, FAT', true, function (v) { return /^Nitrogen/.test(v.inert); }),
      c('The mill system shall be protected against dust explosion by {expl}. The supplier shall state the Kst and Pmax values used, the explosion pressure ratings of the mill, the dust collector and the connected equipment.', M, 'Design review, Documentation', true, function (v) { return !/^Not required/.test(v.expl); }),
      c('The mill shall have means to prevent a mechanical ignition source, for example a metal detector on the feed, a bearing temperature monitor and a rotor speed monitor, and the supplier shall state the measures.', M, DR, true, function (v) { return !/^Not required/.test(v.expl); }),
      c('The supplier shall state the minimum ignition energy of the product assumed and shall state how static electricity is controlled in the mill, the hose and the container.', M, DR, true, zoneOn)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Product-contact parts shall be made of {moc}, and the rotor, blades, pins and screens shall be made of materials that resist wear and do not contaminate the product with metal particles.', M, 'Design review, Documentation'),
      c('Product-contact materials, including seals, gaskets and the filter media, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a roughness not greater than {finish} and shall be free of crevices and dead pockets.', M, 'FAT, Documentation', true, gmpProd),
      c('Product-contact welds shall be smooth and ground flush, and the supplier shall provide weld records.', S_, DOC, true, prodOn),
      c('The supplier shall provide material certificates for the product-contact parts and for the screens.', S_, DOC)
    ] },
    { t: 'Drive, utilities and cleaning', c: [
      c('The motor shall suit the supply and the installation ({loc}), and the motor, the starter or drive and all electrical equipment shall be certified for {zone}.', M, 'Design review, Documentation'),
      c('The mill shall be driven by a variable speed drive over {speed}, and the supplier shall state how the speed affects the particle size and the heat generated.', S_, DR, true, function (v) { return /^Variable/.test(v.drive); }),
      c('The mill shall be cleaned by {cleaning}, and the supplier shall state the cleaning procedure, the cleaning time, and the product changeover time. All product-contact parts shall be accessible or removable for visual inspection.', M, 'Design review, SAT'),
      c('The mill shall be bonded and earthed together with the hose, the dust collector and the container.', M, SAT, true, zoneOn),
      c('The mill shall be suitable for washing in place or for dry cleaning as stated, and the user shall confirm that the cleaning agent is acceptable for the product.', S_, DR, true, cipOn)
    ] },
    { t: 'Instrumentation and safety', c: [
      c('The mill shall have a motor current display and a high-current trip, a bearing temperature measurement, a rotor speed indication and a product temperature measurement at the outlet.', M, DR),
      c('The feeder and the mill shall be interlocked so that the feed stops when the mill stops, when the dust collector stops or when the discharge is blocked.', M, 'Design review, FAT'),
      c('The mill shall have an emergency stop and a safety circuit, and the supplier shall state the stopping time of the rotor.', M, DR),
      c('Run and fault signals shall be available for connection to the plant control system.', S_, DR)
    ] }
  ].concat(tail('mill',
    [c('The mill shall be run at the factory with a test product or the user’s product at agreed settings. The particle size, the temperature rise and the throughput shall be recorded and compared with this URS.', M, FAT),
     c('The safety interlocks, the emergency stop and the cover interlock shall be tested.', M, FAT)],
    [c('The mill shall be run on site on the product, and the particle size distribution, the dust containment, the temperature and the power consumption shall be recorded.', M, SAT)])));

  /* ---------------------------------------------------------------- vibro sifter */
  A.add('sieve', {
    cat: 'Solids handling and size reduction', label: 'Vibro sifter (vibratory sieve)', pfx: 'SFT', noun: 'vibro sifter', varKey: 'stype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'S-511 Vibro sifter for API powder' },
      { g: 'Duty', k: 'stype', l: 'Sifter type', t: 'sel', o: ['Circular vibratory sifter', 'Gyratory sifter', 'Ultrasonic assisted sifter'], d: 'Circular vibratory sifter', drv: 1 },
      { g: 'Duty', k: 'prod', l: 'Product and hazards', t: 'text', d: 'Dry powder, free flowing, combustible dust' },
      { g: 'Duty', k: 'cap', l: 'Capacity', t: 'num', u: 'kg/h', d: '500' },
      { g: 'Duty', k: 'bd', l: 'Bulk density', t: 'num', u: 'kg/m³', d: '550' },
      { g: 'Duty', k: 'dia', l: 'Sieve diameter', t: 'num', u: 'mm', d: '1000' },
      { g: 'Duty', k: 'mesh', l: 'Screen apertures to be fitted', t: 'text', d: '600 µm and 250 µm' },
      { g: 'Duty', k: 'decks', l: 'Number of decks', t: 'sel', o: ['Single deck', 'Double deck', 'Triple deck'], d: 'Single deck', drv: 1 },
      { g: 'Duty', k: 'over', l: 'Oversize handling', t: 'sel', o: ['Separate oversize outlet', 'Oversize returned to the feed'], d: 'Separate oversize outlet' },
      { g: 'Design', k: 'cont', l: 'Dust containment', t: 'sel', o: ['Dust-tight with clamped lids', 'Contained with sealed feed and discharge', 'Open with local extraction'], d: 'Dust-tight with clamped lids', drv: 1 },
      { g: 'Design', k: 'inert', l: 'Inerting', t: 'sel', o: ['Nitrogen inerting', 'No inerting'], d: 'No inerting', drv: 1 },
      { g: 'Design', k: 'expl', l: 'Explosion protection', t: 'sel', o: ['Explosion pressure shock resistant design', 'Explosion venting or suppression', 'Not required (non-combustible)'], d: 'Explosion pressure shock resistant design', drv: 1 },
      { g: 'Design', k: 'integ', l: 'Sieve integrity control', t: 'sel', o: ['Integrity test and a spare sieve', 'Visual inspection only'], d: 'Integrity test and a spare sieve', drv: 1 },
      { g: 'Design', k: 'kw', l: 'Estimated motor rating', t: 'num', u: 'kW', d: '1.5' },
      { g: 'Design', k: 'supply', l: 'Electrical supply', t: 'text', d: '415 V, 3-phase, 50 Hz' },
      { g: 'Design', k: 'noise', l: 'Noise limit at 1 m', t: 'num', u: 'dB(A)', d: '80' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The {stype} shall screen {prod} at a capacity of {cap}, with a bulk density of {bd}, using sieves of {mesh} on a sieve diameter of {dia} and a configuration of {decks}.', M, FAT),
      c('The sifter shall separate oversize particles effectively, and the supplier shall state the screening efficiency at the rated capacity for the stated apertures.', M, 'Design review, FAT'),
      c('The sifter shall not blind or clog at the rated capacity, and the supplier shall state the measures to prevent blinding, such as sieve cleaners, balls or ultrasonic assistance.', M, DR),
      c('The sifter shall not change the particle size of the product by attrition, and the supplier shall state the energy input and the amplitude.', S_, DR),
      c('The sifter shall handle the oversize by a {over} arrangement, and the supplier shall state how the oversize is collected and kept from contaminating the screened product.', M, DR),
      c('Product retained in the sifter at the end of a run (hold-up) shall be low and shall be stated by the supplier, and the sifter shall discharge all the screened product.', S_, DR),
      c('For an ultrasonic sifter the supplier shall state the frequency, the power, and the effect on product temperature and on the sieve life.', M, DR, true, function (v) { return /^Ultrasonic/.test(v.stype); })
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The sifter shall be a {stype}, with a drive and a vibrating assembly designed for continuous duty and for the stated capacity.', M, DR),
      c('The sifter shall be supported on springs or mounts that isolate vibration from the floor and the connected equipment, and flexible sleeves shall connect the feed and the outlets.', M, DR),
      c('The sieve frames shall be held by quick-release clamps that need no tools, and the supplier shall state the time to change a sieve.', S_, DR),
      c('Multiple decks shall have separate outlets for each fraction, so that the fractions cannot mix, and each deck shall be accessible for inspection.', M, DR, true, function (v) { return !/^Single/.test(v.decks); }),
      c('The sifter shall have a guard and an interlock so that the drive stops when a cover is removed, and no rotating or moving parts shall be accessible while running.', M, DR),
      c('The noise at 1 m shall not exceed {noise}, and the supplier shall state the noise level at the rated duty.', S_, FAT),
      c('The supplier shall state the vibration amplitude and the speed range, and the supplier shall state the effect of the product load on them.', S_, DR)
    ] },
    { t: 'Dust containment, sieve integrity and foreign matter', c: [
      c('The sifter shall be dust-tight, with gaskets between the frames and clamped lids, so that no dust is released to the room during normal running. The supplier shall state the leak test method.', M, 'FAT, SAT', true, function (v) { return /^Dust-tight/.test(v.cont); }),
      c('The sifter shall have a sealed feed and discharge, for example by a contained connection, and shall meet the exposure limit given by the user. The supplier shall state the containment performance and the test method.', M, 'FAT, SAT', true, function (v) { return /^Contained/.test(v.cont); }),
      c('The sifter shall have local extraction at the open feed and discharge, and the supplier shall state the extraction volume needed.', M, DR, true, function (v) { return /^Open/.test(v.cont); }),
      c('Each sieve shall be identified, shall have a defined aperture and wire certificate, and shall be tested for integrity before and after use by a method agreed with the user. A spare sieve shall be available.', M, 'Design review, Documentation', true, function (v) { return /^Integrity/.test(v.integ); }),
      c('The sieve shall be inspected visually before and after use for tears, holes and loose wires, and the inspection shall be recorded.', M, DR, true, function (v) { return /^Visual/.test(v.integ); }),
      c('The sifter shall be designed so that the sieve and the frames cannot release fragments into the product, and all fasteners and gaskets shall be retained or detectable.', M, DR, true, gmpProd),
      c('A magnet or a metal detector shall be fitted on the feed or the discharge where the user’s process requires it.', C_, DR, false)
    ] },
    { t: 'Safety, static and explosion protection', c: [
      c('The sifter shall be inerted with nitrogen, and the supplier shall state the oxygen limit and the purge arrangement.', M, 'Design review, FAT', true, function (v) { return /^Nitrogen/.test(v.inert); }),
      c('The sifter shall be protected against dust explosion by {expl}. The supplier shall state the Kst and Pmax values assumed and the explosion pressure rating of the sifter.', M, 'Design review, Documentation', true, function (v) { return !/^Not required/.test(v.expl); }),
      c('The sifter, the frames, the hoses and the containers shall be bonded and earthed, and the supplier shall use materials that do not build up a static charge that could ignite the dust.', M, SAT, true, zoneOn),
      c('All sieve frames, gaskets and sleeves shall be made of conductive or dissipative materials where the powder is combustible, and the supplier shall state the surface resistance.', M, DR, true, zoneOn),
      c('The drive and all electrical equipment shall be certified for {zone}, with the dust or gas group and temperature class stated.', M, DOC, true, zoneOn)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Product-contact parts shall be made of {moc}, and the sieve mesh shall be made of a material that is compatible with the product and the cleaning agents.', M, 'Design review, Documentation'),
      c('Product-contact materials, including gaskets, sleeves and sealing rings, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a roughness not greater than {finish} and shall be free of crevices and dead pockets.', M, 'FAT, Documentation', true, gmpProd),
      c('Product-contact welds shall be smooth, ground flush and free of pits, and the supplier shall provide weld records.', S_, DOC, true, prodOn),
      c('The supplier shall provide material certificates for the product-contact parts and the sieve mesh.', S_, DOC)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The drive shall suit the supply of {supply} and the installation ({loc}).', M, DR),
      c('The sifter shall be cleaned by {cleaning}. All product-contact parts shall be accessible and easily removable for cleaning and visual inspection, and the supplier shall state the cleaning time and the product changeover time.', M, 'Design review, SAT'),
      c('The sifter shall withstand the cleaning agents and the cleaning temperature and shall drain and dry after cleaning.', S_, DR, true, cipOn),
      c('The motor starter shall have overload protection and a local stop, and an emergency stop shall be provided.', M, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The sifter shall have a run and a fault indication and a local start and stop.', S_, DR),
      c('The feed shall be interlocked so that product is not fed when the sifter is stopped.', M, 'Design review, FAT'),
      c('A differential pressure or a level switch on the screened product shall be provided where the discharge can block.', C_, DR, false)
    ] }
  ].concat(tail('vibro sifter',
    [c('The sifter shall be run at the factory with a test powder or the user’s product, and the capacity, the efficiency and the vibration shall be recorded.', M, FAT),
     c('The dust-tightness shall be tested, and the interlocks and the emergency stop shall be tested.', M, FAT)],
    [c('The sifter shall be run on site on the product, and the capacity, the sieve integrity result, the dust containment and the noise shall be recorded.', M, SAT)])));

  /* ---------------------------------------------------------------- blender */
  A.add('blend', {
    cat: 'Solids handling and size reduction', label: 'Blender (cone, ribbon or double cone)', pfx: 'BLD', noun: 'blender', varKey: 'btype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'B-521 Blender for the final blend' },
      { g: 'Duty', k: 'btype', l: 'Blender type', t: 'sel', o: ['Double cone', 'Ribbon', 'Octagonal', 'Cone screw'], d: 'Double cone', drv: 1 },
      { g: 'Duty', k: 'prod', l: 'Product and hazards', t: 'text', d: 'Dry powders for final blend, combustible dust' },
      { g: 'Duty', k: 'vol', l: 'Total volume of the vessel', t: 'num', u: 'L', d: '1000' },
      { g: 'Duty', k: 'fmin', l: 'Minimum working fill', t: 'num', u: '% of total volume', d: '30' },
      { g: 'Duty', k: 'fmax', l: 'Maximum working fill', t: 'num', u: '% of total volume', d: '65' },
      { g: 'Duty', k: 'bd', l: 'Bulk density', t: 'num', u: 'kg/m³', d: '600' },
      { g: 'Duty', k: 'time', l: 'Typical blend time', t: 'num', u: 'min', d: '20' },
      { g: 'Duty', k: 'uni', l: 'Blend uniformity requirement', t: 'text', d: 'Relative standard deviation not more than 5%, as agreed with QA' },
      { g: 'Duty', k: 'speed', l: 'Rotation speed range', t: 'text', d: '4 to 20 rpm' },
      { g: 'Design', k: 'chg', l: 'Charging', t: 'sel', o: ['Vacuum transfer', 'Manual charging through a hopper', 'Contained charging valve'], d: 'Vacuum transfer', drv: 1 },
      { g: 'Design', k: 'disch', l: 'Discharge', t: 'sel', o: ['Bottom valve to a container', 'Contained discharge valve', 'Pneumatic transfer'], d: 'Contained discharge valve', drv: 1 },
      { g: 'Design', k: 'lump', l: 'Lump handling', t: 'sel', o: ['Lump breaker or intensifier', 'None'], d: 'None', drv: 1 },
      { g: 'Design', k: 'inert', l: 'Inerting', t: 'sel', o: ['Nitrogen inerting', 'No inerting'], d: 'No inerting', drv: 1 },
      { g: 'Design', k: 'expl', l: 'Explosion protection', t: 'sel', o: ['Explosion pressure shock resistant design', 'Explosion venting or suppression', 'Not required (non-combustible)'], d: 'Explosion pressure shock resistant design', drv: 1 },
      { g: 'Design', k: 'drive', l: 'Speed control', t: 'sel', o: VAR, d: 'Variable speed (VFD)' },
      { g: 'Design', k: 'kw', l: 'Estimated motor rating', t: 'num', u: 'kW', d: '7.5' },
      { g: 'Design', k: 'noise', l: 'Noise limit at 1 m', t: 'num', u: 'dB(A)', d: '80' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The {btype} blender shall blend {prod} in a vessel of {vol}, with a working fill between {fmin} and {fmax}, at a bulk density of {bd}.', M, FAT),
      c('The blender shall reach the uniformity requirement: {uni}, within the typical blend time of {time}, over the whole fill range.', M, 'FAT, SAT'),
      c('The supplier shall state the fill range at which the blender gives the best mixing, and the minimum fill at which it still mixes properly.', M, DR),
      c('The blender shall mix without segregation of components of different particle size or density, and the supplier shall state the measures to limit segregation during blending and discharge.', M, DR),
      c('The blender shall not damage the particles by attrition or shear beyond a level agreed with the user, and the supplier shall state the energy input.', S_, DR),
      c('The blender shall allow sampling at defined points to check the blend, with a sampling device that does not contaminate the product, and the supplier shall state the sampling points.', S_, 'Design review, SAT'),
      c('The blender shall be suitable for a rotation speed in the range of {speed}, and the supplier shall state the speed best for the product.', M, DR),
      c('The blender shall state the critical speed above which the mix is held to the wall of the vessel, so that the working speed is kept safely below it.', S_, DR, true, function (v) { return /cone|Octagonal/i.test(v.btype); })
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The vessel shall be designed for continuous duty at the stated fill and speed, and its shaft, bearings and the drive shall be sized for the heaviest load.', M, DR),
      c('The ribbon or screw shall have a clearance to the vessel that is stated by the supplier and that keeps wear and dead zones to a minimum. The supplier shall state the shaft seal and how product is kept from the bearings.', M, DR, true, function (v) { return /Ribbon|screw/i.test(v.btype); }),
      c('The vessel shall rotate on a horizontal axis with a drive and a brake, and shall stop with the discharge valve at the lowest point, with a position sensor that holds the vessel in the discharge position.', M, DR, true, function (v) { return /cone|Octagonal/i.test(v.btype); }),
      c('The blender shall have a guard around the rotating parts, with an interlock on the access doors and a safety fence where the vessel rotates, so that nobody can reach moving parts while it runs.', M, DR),
      c('The vessel shall have a hatch for inspection and cleaning, with a gasket that seals against dust and a handwheel or a clamp that needs no tools.', S_, DR),
      c('The blender shall be mounted on a frame that suits the floor loads stated by the supplier and that holds the vibration within the limits in the user’s standard.', S_, DR),
      c('The noise at 1 m shall not exceed {noise}.', S_, FAT)
    ] },
    { t: 'Charging, discharge, containment and lumps', c: [
      c('The blender shall be charged by {chg}, and the supplier shall state the arrangement and the time to charge a full batch.', M, DR),
      c('The charging by vacuum shall use a filter or a cartridge that retains the product, and the supplier shall state the filter cleaning method and the effect on the blend.', M, DR, true, function (v) { return /^Vacuum/.test(v.chg); }),
      c('The charging port shall be contained, for example by a split butterfly valve, and shall meet the exposure limit given by the user. The supplier shall state the containment performance and the test method.', M, 'FAT, SAT', true, function (v) { return /^Contained charging/.test(v.chg); }),
      c('The charging hopper shall have local extraction and a dust-tight lid, and the supplier shall state the extraction volume needed.', M, DR, true, function (v) { return /^Manual/.test(v.chg); }),
      c('The discharge shall be by {disch}, shall leave no more than the hold-up stated by the supplier, and shall not segregate the blend.', M, DR),
      c('The discharge valve shall be contained, for example by a split butterfly valve, and shall meet the exposure limit given by the user.', M, 'FAT, SAT', true, function (v) { return /^Contained discharge/.test(v.disch); }),
      c('Pneumatic transfer of the blend shall be designed to avoid segregation and static charging, and the supplier shall state the conveying velocity and the filter used.', M, DR, true, function (v) { return /^Pneumatic/.test(v.disch); }),
      c('A lump breaker or an intensifier shall be fitted to break soft lumps during blending, and the supplier shall state its speed, its sealing and the effect on the blend.', M, DR, true, function (v) { return /^Lump/.test(v.lump); }),
      c('Where no lump breaker is fitted, the user shall deagglomerate the feed before charging, for example by sieving.', C_, DR, false, function (v) { return /^None/.test(v.lump); })
    ] },
    { t: 'Safety, static and explosion protection', c: [
      c('The blender shall be inerted with nitrogen, and the supplier shall state the oxygen limit, the purge arrangement and how the oxygen is measured.', M, 'Design review, FAT', true, function (v) { return /^Nitrogen/.test(v.inert); }),
      c('The blender shall be protected against dust explosion by {expl}. The supplier shall state the Kst and Pmax values assumed and the explosion pressure rating of the vessel.', M, 'Design review, Documentation', true, function (v) { return !/^Not required/.test(v.expl); }),
      c('The blender, the frame, the hoses and the containers shall be bonded and earthed, and the supplier shall state the measures against static charging inside the vessel.', M, SAT, true, zoneOn),
      c('The drive and all electrical equipment shall be certified for {zone}, with the gas or dust group and the temperature class stated.', M, DOC, true, zoneOn)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Product-contact parts shall be made of {moc} and shall be compatible with the product and the cleaning agents in use.', M, 'Design review, Documentation'),
      c('Product-contact materials, including gaskets, seals and sight glasses, shall be non-reactive, non-additive and non-absorptive, with a compliance declaration for each polymer or elastomer.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a roughness not greater than {finish}, shall be free of crevices and dead pockets, and shall have rounded internal corners that can be cleaned.', M, 'FAT, Documentation', true, gmpProd),
      c('Product-contact welds shall be smooth, ground flush and recorded on a weld map.', S_, DOC, true, prodOn),
      c('The supplier shall provide material certificates for the product-contact parts.', S_, DOC)
    ] },
    { t: 'Drive, utilities and cleaning', c: [
      c('The motor shall suit the supply and the installation ({loc}), and the starter or drive shall have overload protection and a local stop.', M, DR),
      c('The blender shall have a variable speed drive over {speed}, with a controlled start and stop that does not shock the product or the gearbox.', S_, DR, true, function (v) { return /^Variable/.test(v.drive); }),
      c('The blender shall be cleaned by {cleaning}. All product-contact parts shall be accessible for visual inspection, and the supplier shall state the cleaning time and the product changeover time.', M, 'Design review, SAT'),
      c('The vessel shall drain and dry after cleaning, and any washing nozzles shall cover the whole of the inside, including the shaft and the agitator.', M, DR, true, cipOn)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The blender shall have a timer for the blend time, a revolution counter or a speed indication, and a motor current display.', M, DR),
      c('The blender shall be interlocked so that it cannot rotate with the access hatch open or with the discharge valve open, and so that the discharge valve cannot open unless the vessel is in the discharge position.', M, 'Design review, FAT'),
      c('The supplier shall state how the blend end point is judged, for example by time, by revolutions or by an in-line measurement, and shall offer a connection for a sensor where the user requires it.', C_, DR, false),
      c('Run and fault signals shall be available for connection to the plant control system.', S_, DR)
    ] }
  ].concat(tail('blender',
    [c('The blender shall be run at the factory with a test powder, and the blend time, the uniformity and the noise shall be recorded and compared with this URS.', M, FAT),
     c('The interlocks, the guard and the emergency stop shall be tested.', M, FAT)],
    [c('The blender shall be run on site on the product, and the blend uniformity, the discharge, the hold-up and the dust containment shall be recorded.', M, SAT)])));
});
