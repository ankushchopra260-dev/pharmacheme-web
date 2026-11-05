/* URS builder equipment module: Filtration and separation.
   ANF, ANFD, PNF, sparkler filter, line filter (cartridge or bag) and centrifuge.
   Loaded before urs-builder.js; registers through PCE_URS.q. Defaults are illustrative. */
(window.PCE_URS = window.PCE_URS || { q: [] }).q.push(function (A) {
  var c = A.c, M = A.M, S_ = A.S_, C_ = A.C_, DR = A.DR, FAT = A.FAT, SAT = A.SAT, DOC = A.DOC, YN = A.YN;
  var gmpOn = A.gmpOn, prodOn = A.prodOn, gmpProd = A.gmpProd, zoneOn = A.zoneOn, cipOn = A.cipOn;
  var CAT = 'Filtration and separation';
  function is(k, re) { return function (v) { return re.test(v[k]); }; }

  /* ---------- shared sections ---------- */
  function safety(n, extra) {
    return { t: 'Safety and hazardous area', c: (extra || []).concat([
      c('The ' + n + ', its drives, instruments and all electrical equipment shall be certified for {zone}, with the gas group and temperature class stated by the user, and the supplier shall provide the certificates.', M, DOC, true, zoneOn),
      c('All conductive parts of the ' + n + ' shall be bonded and earthed, and the supplier shall state any part that could become electrically isolated or that could collect static charge (for example polymer liners, cloths, gaskets and sight glasses).', M, SAT, true, zoneOn)
    ]) };
  }
  function docs(n, extra) {
    return { t: 'Documentation and qualification', c: [
      c('The supplier shall provide a datasheet, general arrangement and cross-section drawings, ' + extra + ', material certificates, an operation and maintenance manual and a recommended spare parts list for the ' + n + '.', M, DOC),
      c('The supplier shall support design, installation and operational qualification (DQ, IQ and OQ) of the ' + n + ' with the documents and traceability needed for the user’s protocols, and shall provide a compliance statement against this URS that lists every deviation.', M, DOC, true, gmpOn),
      c('The supplier shall provide a traceability package for product-contact parts (material certificates, weld records, surface finish records and declarations for polymers and elastomers) linked to the serial number.', S_, DOC, true, gmpProd)
    ] };
  }
  function tests(n, fatX, satX) {
    return { t: 'Testing: FAT and SAT', c: [
      c('The factory acceptance test shall include a pressure or leak test of each pressure-containing part to the applicable code, a dimensional and visual check, and a functional check of drives, interlocks and alarms. ' + fatX + ' The user may witness it.', M, FAT),
      c('The product-contact surface finish and the drainability of the ' + n + ' shall be verified at the factory acceptance test.', S_, FAT, true, gmpProd),
      c('The site acceptance test shall include a check against the P&ID, a leak test with an inert fluid, a function check of drives and interlocks, and a trial run as agreed. ' + satX, M, SAT)
    ] };
  }
  function spares(items) {
    return { t: 'Spares, delivery and warranty', c: [
      c('The supplier shall provide a list of recommended spares for commissioning and for two years of operation, including ' + items + ', with lead times.', S_, DOC),
      c('The supplier shall deliver within {delivery} and shall give a warranty of {warranty}, and shall state the support available after delivery.', M, DOC)
    ] };
  }

  /* ---------- ANF: agitated Nutsche filter ---------- */
  A.add('anf', { cat: CAT, label: 'ANF, agitated Nutsche filter', pfx: 'ANF', noun: 'agitated Nutsche filter', varKey: 'disch', fields: [
    { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'F-501 Agitated Nutsche filter' },
    { g: 'Duty', k: 'prod', l: 'Product and slurry', t: 'text', d: 'API intermediate crystal slurry in isopropanol and water' },
    { g: 'Duty', k: 'batch', l: 'Slurry batch volume', t: 'num', u: 'L', d: '800' },
    { g: 'Duty', k: 'solids', l: 'Solids content of slurry', t: 'num', u: '% w/w', d: '15' },
    { g: 'Duty', k: 'psize', l: 'Particle size d50', t: 'num', u: 'µm', d: '40' },
    { g: 'Duty', k: 'area', l: 'Filter area', t: 'num', u: 'm²', d: '1.0' },
    { g: 'Duty', k: 'cakev', l: 'Maximum cake volume', t: 'num', u: 'L', d: '200' },
    { g: 'Duty', k: 'cakeh', l: 'Maximum cake height', t: 'num', u: 'mm', d: '200' },
    { g: 'Duty', k: 'fltime', l: 'Target filtration time per batch', t: 'num', u: 'min', d: '45' },
    { g: 'Duty', k: 'wash', l: 'Cake wash volume per batch', t: 'num', u: 'L', d: '400' },
    { g: 'Design', k: 'dp', l: 'Design pressure', t: 'num', u: 'barg', d: '3' },
    { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '120' },
    { g: 'Design', k: 'vac', l: 'Full vacuum rating required', t: 'sel', o: YN, d: 'Yes', drv: 1 },
    { g: 'Design', k: 'medium', l: 'Filter medium', t: 'sel', o: ['woven metal mesh on a support plate', 'sintered metal', 'polypropylene or PTFE cloth on a support plate'], d: 'woven metal mesh on a support plate' },
    { g: 'Design', k: 'disch', l: 'Cake discharge', t: 'sel', o: ['Side discharge port, agitator pushes the cake out', 'Bottom discharge valve', 'Reslurry and pump out'], d: 'Side discharge port, agitator pushes the cake out', drv: 1 },
    { g: 'Agitation and handling', k: 'aspeed', l: 'Agitator speed range', t: 'text', d: '1 to 10 rpm' },
    { g: 'Agitation and handling', k: 'seal', l: 'Agitator shaft seal', t: 'sel', o: ['Single mechanical seal', 'Double mechanical seal with barrier fluid', 'Dry gas seal'], d: 'Double mechanical seal with barrier fluid', drv: 1 },
    { g: 'Agitation and handling', k: 'inert', l: 'Inerting', t: 'sel', o: ['Nitrogen inerting', 'No inerting'], d: 'Nitrogen inerting', drv: 1 },
    { g: 'Agitation and handling', k: 'contain', l: 'Cake discharge containment', t: 'sel', o: ['Closed discharge to liner or drum', 'Standard (local exhaust)'], d: 'Closed discharge to liner or drum', drv: 1 }
  ] }, [
    { t: 'Process and performance requirements', c: [
      c('The filter shall separate {prod}, processing a slurry batch of {batch} with a solids content of {solids} and a particle size d50 of {psize}, on a filter area of {area}.', M, FAT),
      c('The filter shall hold a maximum cake volume of {cakev} at a cake height not greater than {cakeh}. The supplier shall state the working range of cake height for filtration, washing and discharge.', M, DR),
      c('The filtration time for the stated slurry shall not exceed {fltime} per batch. The supplier shall state the filtrate rate and the cake resistance, pressure difference and temperature assumed in the sizing.', M, 'Design review, FAT'),
      c('The cake shall be washed with {wash} of wash liquid by displacement, with the option to reslurry using the agitator. The supplier shall state how the wash is spread evenly and how channelling and cracks are avoided.', M, DR),
      c('The agitator shall smooth the cake, close cracks and level the surface during filtration and washing without damaging the filter medium, and shall be able to turn the cake over for reslurry.', M, DR),
      c('The supplier shall state the residual liquid expected in the cake after deliquoring at the design pressure difference, how the first cloudy filtrate is diverted or recycled, and how both are checked at the user’s test.', S_, DOC)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The filter shall be designed to a recognised pressure vessel code for a design pressure of {dp} and a design temperature of {dt}, with a stated corrosion allowance and a pressure equipment data report.', M, DOC),
      c('The filter shall be rated for full vacuum at the design temperature and shall be tested for vacuum tightness.', M, 'Design review, FAT', true, is('vac', /^Yes/)),
      c('The vessel head shall be opened or lifted by a powered mechanism for inspection and for changing the filter medium. The head shall be interlocked so that it cannot be opened while the vessel is under pressure or vacuum or while the agitator is moving.', M, 'Design review, FAT'),
      c('The filter plate shall stay flat and rigid under the full pressure difference and the weight of the cake, and shall be sealed at the edge so that unfiltered slurry cannot bypass the medium. The edge seal and medium clamp shall have no crevices where cake can collect.', M, DR),
      c('The filter medium shall be {medium}. The supplier shall state its pore size or removal rating, how it is fixed, the method and time needed to change it, and its expected life.', M, DR)
    ] },
    { t: 'Cake discharge', c: [
      c('Cake shall be discharged through a side discharge port, using the agitator to push the cake out. The supplier shall state the residual heel left on the plate and how it is removed.', M, DR, true, is('disch', /^Side/)),
      c('Cake shall be discharged through a bottom discharge valve with no dead space, fully sealed during filtration. The supplier shall state the residual heel left on the plate and how it is removed.', M, DR, true, is('disch', /^Bottom/)),
      c('Cake shall be reslurried with solvent and pumped out as a slurry. The supplier shall state the minimum reslurry volume, the agitator duty and how the transfer line is flushed.', M, DR, true, is('disch', /^Reslurry/)),
      c('Discharge shall be closed, into a liner, drum or receiver through a split butterfly valve, glove port or equivalent, so that the operator is not exposed to the product. The supplier shall state how the containment is demonstrated.', M, 'Design review, FAT', true, is('contain', /^Closed/))
    ] },
    { t: 'Agitation and shaft sealing', c: [
      c('The agitator shall run over {aspeed} with a drive suitable for variable speed. The supplier shall state the motor power, the torque with a wet cake, and the shaft deflection and critical speed.', M, DR),
      c('The agitator shall lower to a set height above the medium, and position sensors with software and mechanical limits shall prevent contact with the plate. The supplier shall state the minimum gap and the accuracy of positioning.', M, 'Design review, FAT'),
      c('The agitator shaft seal shall be: {seal}. The supplier shall state the seal type, the support plan and how the seal copes with the shaft moving up and down.', M, DR),
      c('The barrier fluid system shall include a reservoir with level and pressure indication and an alarm on loss of barrier, and the barrier fluid shall be compatible with the product.', M, DR, true, is('seal', /^Double/)),
      c('The seal shall be tight at the design vacuum and pressure, and there shall be no visible leakage from seals or joints during testing at the supplier and on site.', M, 'FAT, SAT')
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} and shall be compatible with the slurry, the wash liquids, the temperature and the cleaning agents.', M, 'Design review, Documentation'),
      c('Product-contact polymers and elastomers, including gaskets, seals and any filter cloth, shall be non-reactive and non-additive, with a compliance declaration for each.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, welds shall be smooth and fully penetrated, and the vessel shall be free of crevices and dead legs.', M, 'FAT, Documentation', true, gmpProd)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The filter shall be cleaned by {cleaning}. Spray devices shall wet the head, agitator, shaft, plate and side walls, and the supplier shall show the coverage.', M, 'Design review, SAT', true, cipOn),
      c('The vessel, filtrate chamber and discharge route shall drain without pockets. The supplier shall state how the filter medium is cleaned or back-flushed in place and how cleaning is verified.', M, DR, true, gmpProd),
      c('The filter shall be suitable for {loc} installation, with personnel protection for hot surfaces, and the supplier shall state the headroom needed to lift the agitator and open the head.', S_, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('Pressure and vacuum shall be measured in the vessel and in the filtrate line, with a high-pressure alarm and an interlock that stops feed and gas pressure.', M, 'Design review, FAT'),
      c('The filtrate line shall have a sight glass and a connection for a turbidity or flow instrument, so that medium breakthrough and the end of filtration can be seen.', S_, DR),
      c('Agitator torque and position shall be monitored, with alarms for high torque and for lift out of range. Run and fault signals shall be available for the plant control system.', S_, DR)
    ] },
    safety('filter', [
      c('The vessel shall be protected from overpressure by a relief device sized for the worst credible case, such as failure of the gas pressure regulator, and the supplier shall state the relief basis.', M, DR),
      c('The vessel shall be purged with nitrogen before filling and before opening. The supplier shall state the purge volume and the oxygen level reached.', M, 'Design review, FAT', true, is('inert', /^Nitrogen/))
    ]),
    docs('agitated Nutsche filter', 'the cake and hold-up volume data and the agitator lift diagram'),
    tests('filter', 'It shall include a vacuum hold test, a run of the agitator over its full lift and speed range, and a check of the interlocks on the head and the agitator position.', 'It shall include a filtration and wash trial with water or solvent and a cake discharge trial.'),
    spares('filter medium, gaskets, shaft seal parts and agitator position sensors')
  ]);

  /* ---------- ANFD: agitated Nutsche filter dryer ---------- */
  A.add('anfd', { cat: CAT, label: 'ANFD, agitated Nutsche filter dryer', pfx: 'ANFD', noun: 'agitated Nutsche filter dryer', varKey: 'disch', fields: [
    { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'F-601 Agitated Nutsche filter dryer' },
    { g: 'Duty', k: 'prod', l: 'Product and slurry', t: 'text', d: 'Final API crystal slurry in isopropanol' },
    { g: 'Duty', k: 'batch', l: 'Slurry batch volume', t: 'num', u: 'L', d: '1200' },
    { g: 'Duty', k: 'psize', l: 'Particle size d50', t: 'num', u: 'µm', d: '30' },
    { g: 'Duty', k: 'area', l: 'Filter area', t: 'num', u: 'm²', d: '1.5' },
    { g: 'Duty', k: 'cakev', l: 'Maximum cake volume', t: 'num', u: 'L', d: '300' },
    { g: 'Duty', k: 'fltime', l: 'Target filtration time per batch', t: 'num', u: 'min', d: '60' },
    { g: 'Duty', k: 'wash', l: 'Cake wash volume per batch', t: 'num', u: 'L', d: '600' },
    { g: 'Drying', k: 'ldr', l: 'Target loss on drying', t: 'num', u: '% w/w', d: '0.5' },
    { g: 'Drying', k: 'dtemp', l: 'Maximum product temperature', t: 'num', u: '°C', d: '60' },
    { g: 'Drying', k: 'dvac', l: 'Operating vacuum for drying', t: 'num', u: 'mbar(a)', d: '50' },
    { g: 'Drying', k: 'dtime', l: 'Target drying time', t: 'num', u: 'h', d: '12' },
    { g: 'Drying', k: 'heat', l: 'Heating arrangement', t: 'sel', o: ['jacket, heated filter plate and heated agitator', 'jacket and heated filter plate', 'jacket only'], d: 'jacket and heated filter plate', drv: 1 },
    { g: 'Drying', k: 'vsys', l: 'Condenser and vacuum source', t: 'text', d: 'Overhead condenser and dry screw vacuum pump with solvent recovery' },
    { g: 'Design', k: 'dp', l: 'Design pressure', t: 'num', u: 'barg', d: '3' },
    { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '140' },
    { g: 'Design', k: 'disch', l: 'Dry cake discharge', t: 'sel', o: ['Side discharge port, agitator pushes the powder out', 'Bottom discharge valve'], d: 'Side discharge port, agitator pushes the powder out', drv: 1 },
    { g: 'Agitation and handling', k: 'seal', l: 'Agitator shaft seal', t: 'sel', o: ['Single mechanical seal', 'Double mechanical seal with barrier fluid', 'Dry gas seal'], d: 'Double mechanical seal with barrier fluid', drv: 1 },
    { g: 'Agitation and handling', k: 'inert', l: 'Inerting', t: 'sel', o: ['Nitrogen inerting', 'No inerting'], d: 'Nitrogen inerting', drv: 1 },
    { g: 'Agitation and handling', k: 'contain', l: 'Discharge containment', t: 'sel', o: ['Closed discharge to liner or drum', 'Standard (local exhaust)'], d: 'Closed discharge to liner or drum', drv: 1 }
  ] }, [
    { t: 'Process and performance requirements', c: [
      c('The filter dryer shall separate and dry {prod}, processing a slurry batch of {batch} with a particle size d50 of {psize}, on a filter area of {area} and with a maximum cake volume of {cakev}.', M, FAT),
      c('The filtration time shall not exceed {fltime} per batch, and the cake shall be washed with {wash} of wash liquid by displacement and by reslurry. The supplier shall state how the wash is spread evenly and how cracks are avoided.', M, 'Design review, FAT'),
      c('The dryer shall dry the cake to a loss on drying not greater than {ldr} within {dtime}, at a vacuum of {dvac} and a product temperature not greater than {dtemp}. The supplier shall provide the drying curve and the assumptions behind it.', M, 'Design review, FAT'),
      c('The product temperature shall not exceed {dtemp} at any point in the cake, and the supplier shall state the highest temperature of the wall, plate and agitator surfaces that touch the product, so that the product is not degraded, melted or sintered.', M, DR),
      c('The agitator shall break lumps and turn the cake for even drying while avoiding compaction and particle breakage beyond the level stated by the user. The supplier shall state the expected effect on particle size.', M, DR),
      c('Vapour shall leave through a filter that keeps solids in the vessel, to the condenser and vacuum system: {vsys}. The supplier shall state the vapour load, the condenser duty and the expected solvent recovery.', M, DR),
      c('The supplier shall state how the end of drying is judged (for example condensate flow, product temperature, vacuum rise test or a sample) and shall provide a sampling method that does not break containment.', S_, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The vessel shall be designed to a recognised pressure vessel code for a design pressure of {dp}, a design temperature of {dt} and full vacuum, with a pressure equipment data report.', M, DOC),
      c('The vessel head shall be opened or lifted by a powered mechanism and interlocked so that it cannot be opened while the vessel is under pressure or vacuum or while the agitator is moving.', M, 'Design review, FAT'),
      c('The filter plate shall stay flat and rigid under pressure difference, vacuum and the weight of the cake, shall be sealed at the edge so that slurry cannot bypass the medium, and shall have no crevices where product can collect. The supplier shall state the medium, its pore size and its method of change.', M, DR),
      c('Heating shall be by {heat}. The supplier shall state the heat transfer area, the heating medium and its temperature range, the heat-up time and the temperature uniformity achieved across the cake.', M, DR),
      c('The heated agitator shall use a rotary joint with leak detection, and a leak of heating medium into the product shall be prevented by design or detected by a method stated by the supplier.', M, DR, true, is('heat', /agitator/)),
      c('Dry powder shall be discharged through a side discharge port, using the agitator to push it out. The supplier shall state the residual heel and how it is removed.', M, DR, true, is('disch', /^Side/)),
      c('Dry powder shall be discharged through a bottom discharge valve with no dead space and full sealing during drying. The supplier shall state the residual heel and how it is removed.', M, DR, true, is('disch', /^Bottom/)),
      c('Discharge shall be closed, into a liner, drum or receiver, so that the operator is not exposed to the dried product. The supplier shall state how the containment is demonstrated.', M, 'Design review, FAT', true, is('contain', /^Closed/))
    ] },
    { t: 'Agitation and shaft sealing', c: [
      c('The agitator shall be able to lift, lower and rotate over a stated speed range, and the supplier shall state the motor power, the torque with wet cake and with lumps, and the shaft deflection.', M, DR),
      c('Position sensors with software and mechanical limits shall prevent the agitator from touching the filter plate.', M, 'Design review, FAT'),
      c('The agitator shaft seal shall be: {seal}. The supplier shall state the seal type, the support plan and how the seal works under vacuum and at the drying temperature.', M, DR),
      c('The barrier fluid system shall include a reservoir with level and pressure indication and an alarm on loss of barrier, and the barrier fluid shall be compatible with the product.', M, DR, true, is('seal', /^Double/)),
      c('The supplier shall state the leak rate of the vessel at the drying vacuum, and the leak rate shall be verified at the factory acceptance test.', M, 'FAT, SAT')
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} and shall be compatible with the slurry, the wash liquids, the drying temperature and the cleaning agents.', M, 'Design review, Documentation'),
      c('Product-contact polymers and elastomers, including gaskets, seals and sight glasses, shall be non-reactive and non-additive and shall withstand the drying temperature, with a compliance declaration for each.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, welds shall be smooth and fully penetrated, and the vessel shall be free of crevices and dead legs.', M, 'FAT, Documentation', true, gmpProd)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The filter dryer shall be cleaned by {cleaning}. Spray devices shall wet the head, agitator, shaft, plate and walls, and the supplier shall show the coverage.', M, 'Design review, SAT', true, cipOn),
      c('The vessel, plate chamber and discharge route shall drain and dry without pockets, and the supplier shall state how the filter medium is cleaned in place and how cleaning is verified.', M, DR, true, gmpProd),
      c('The supplier shall state the consumption of heating medium, cooling water, nitrogen, vacuum and electric power at peak and average load, and the installation shall suit {loc}.', S_, DOC)
    ] },
    { t: 'Instrumentation and control', c: [
      c('Pressure and vacuum shall be measured in the vessel and in the vapour line, with a high-pressure alarm and an interlock that stops feed and gas pressure.', M, 'Design review, FAT'),
      c('Product temperature shall be measured at more than one position and height in the cake, and the heating medium inlet and outlet temperatures shall be measured.', M, DR),
      c('Agitator torque and position shall be monitored with alarms for high torque and for lift out of range, and the drying sequence shall be run as an interlocked recipe with a record of the drying curve.', S_, DR)
    ] },
    safety('filter dryer', [
      c('The vessel shall be protected from overpressure by a relief device sized for the worst credible case, such as failure of the gas supply regulator or loss of cooling to the condenser, and the supplier shall state the relief basis.', M, DR),
      c('The vessel shall be purged with nitrogen before filling, during drying where needed and before opening. The supplier shall state the purge volume and the oxygen level reached.', M, 'Design review, FAT', true, is('inert', /^Nitrogen/)),
      c('The supplier shall state the dust explosion hazard of the dried powder as given by the user, and the equipment shall follow the explosion protection concept stated by the user (for example containment, venting or isolation).', M, DR, true, zoneOn)
    ]),
    docs('agitated Nutsche filter dryer', 'the drying curve basis and the agitator lift diagram'),
    tests('filter dryer', 'It shall include a vacuum leak rate test and a run of the agitator over its full lift and speed range.', 'It shall include a filtration, wash and drying trial with water or solvent, and a discharge trial.'),
    spares('filter medium, gaskets, shaft seal parts, rotary joint seals and temperature probes')
  ]);

  /* ---------- PNF: pressure Nutsche filter ---------- */
  A.add('pnf', { cat: CAT, label: 'PNF, pressure Nutsche filter', pfx: 'PNF', noun: 'pressure Nutsche filter', varKey: 'ftype', fields: [
    { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'F-701 Pressure Nutsche filter' },
    { g: 'Duty', k: 'prod', l: 'Product and slurry', t: 'text', d: 'API intermediate slurry in ethyl acetate' },
    { g: 'Duty', k: 'batch', l: 'Slurry batch volume', t: 'num', u: 'L', d: '600' },
    { g: 'Duty', k: 'solids', l: 'Solids content of slurry', t: 'num', u: '% w/w', d: '12' },
    { g: 'Duty', k: 'psize', l: 'Particle size d50', t: 'num', u: 'µm', d: '25' },
    { g: 'Duty', k: 'area', l: 'Filter area', t: 'num', u: 'm²', d: '0.8' },
    { g: 'Duty', k: 'cakev', l: 'Maximum cake volume', t: 'num', u: 'L', d: '120' },
    { g: 'Duty', k: 'fltime', l: 'Target filtration time per batch', t: 'num', u: 'min', d: '40' },
    { g: 'Duty', k: 'wash', l: 'Cake wash volume per batch', t: 'num', u: 'L', d: '250' },
    { g: 'Duty', k: 'rw', l: 'Target residual liquid in cake after blow-through', t: 'num', u: '% w/w', d: '25' },
    { g: 'Design', k: 'dpf', l: 'Maximum filtration pressure difference', t: 'num', u: 'bar', d: '3' },
    { g: 'Design', k: 'dp', l: 'Design pressure', t: 'num', u: 'barg', d: '6' },
    { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '120' },
    { g: 'Design', k: 'medium', l: 'Filter medium', t: 'sel', o: ['woven metal mesh on a support plate', 'sintered metal', 'polypropylene or PTFE cloth on a support plate'], d: 'woven metal mesh on a support plate' },
    { g: 'Design', k: 'ftype', l: 'Opening and discharge arrangement', t: 'sel', o: ['Bottom opening, filter plate lowered or tilted', 'Top lid removed, cake taken out from above'], d: 'Bottom opening, filter plate lowered or tilted', drv: 1 },
    { g: 'Handling', k: 'gas', l: 'Pressurising gas', t: 'sel', o: ['Nitrogen', 'Compressed air'], d: 'Nitrogen', drv: 1 },
    { g: 'Handling', k: 'contain', l: 'Cake discharge containment', t: 'sel', o: ['Closed discharge to liner or drum', 'Standard (local exhaust)'], d: 'Closed discharge to liner or drum', drv: 1 }
  ] }, [
    { t: 'Process and performance requirements', c: [
      c('The filter shall separate {prod}, processing a slurry batch of {batch} with a solids content of {solids} and a particle size d50 of {psize}, on a filter area of {area} and with a maximum cake volume of {cakev}.', M, FAT),
      c('The filtration time for the stated slurry shall not exceed {fltime} per batch at a pressure difference not greater than {dpf}. The supplier shall state the filtrate rate and the cake resistance assumed in the sizing.', M, 'Design review, FAT'),
      c('The cake shall be washed with {wash} of wash liquid by displacement. The supplier shall state how the wash is spread evenly across the cake, since the filter has no agitator to level or reslurry it.', M, DR),
      c('After filtration the cake shall be deliquored by gas blow-through to a residual liquid not greater than {rw}. The supplier shall state the gas consumption and the time needed.', M, 'Design review, FAT'),
      c('The supplier shall state how cake cracking and gas bypass are avoided (for example by controlled pressure ramps and a flat, even feed) and how a cracked cake is detected.', M, DR),
      c('The filtrate shall leave free of solids, and the supplier shall state how the first cloudy filtrate is diverted or recycled.', S_, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The filter shall be designed to a recognised pressure vessel code for a design pressure of {dp} and a design temperature of {dt}, with a stated corrosion allowance and a pressure equipment data report.', M, DOC),
      c('The filter plate and its support shall withstand a pressure difference of {dpf} without distortion, and the supplier shall state the stress margin.', M, DR),
      c('The closure shall be interlocked so that it cannot be opened while the vessel is under pressure, and the supplier shall state how residual pressure is vented and proven to be zero before opening.', M, 'Design review, FAT'),
      c('The filter plate shall be sealed at the edge so that slurry cannot bypass the medium, with no crevices where cake can collect. The filter medium shall be {medium}, and the supplier shall state its pore size, fixing method, change procedure and life.', M, DR),
      c('The filter shall open from the bottom, with the filter plate lowered or tilted by a powered mechanism so that the cake can be discharged. The supplier shall state the residual heel left on the plate and how it is removed.', M, DR, true, is('ftype', /^Bottom/)),
      c('The filter shall open from the top, with the lid removed by a lifting aid so that the cake can be taken out. The supplier shall state the lifting aid, the safe working method and the residual heel.', M, DR, true, is('ftype', /^Top/)),
      c('Discharge shall be closed, into a liner, drum or receiver, so that the operator is not exposed to the product. The supplier shall state how the containment is demonstrated.', M, 'Design review, FAT', true, is('contain', /^Closed/))
    ] },
    { t: 'Pressurising gas', c: [
      c('Nitrogen shall be the pressurising gas. The supplier shall state the nitrogen consumption per batch and the pressure regulation that keeps the pressure difference at or below {dpf}.', M, DR, true, is('gas', /^Nitrogen/)),
      c('Compressed air shall be dry and free of oil, and the user shall confirm that air is acceptable for the solvents and dusts in use, because air can create a flammable atmosphere in the vessel.', M, DR, true, is('gas', /^Compressed air/))
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} and shall be compatible with the slurry, the wash liquids, the temperature and the cleaning agents.', M, 'Design review, Documentation'),
      c('Product-contact polymers and elastomers, including gaskets, seals and any filter cloth, shall be non-reactive and non-additive, with a compliance declaration for each.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, welds shall be smooth and fully penetrated, and the vessel shall be free of crevices and dead legs.', M, 'FAT, Documentation', true, gmpProd)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The filter shall be cleaned by {cleaning}. Spray devices shall wet the lid, walls and plate, and the supplier shall show the coverage.', M, 'Design review, SAT', true, cipOn),
      c('The vessel, filtrate chamber and discharge route shall drain without pockets, and the supplier shall state how the filter medium is cleaned in place and how cleaning is verified.', M, DR, true, gmpProd),
      c('The filter shall be suitable for {loc} installation, with personnel protection for hot surfaces, and the supplier shall state the headroom and floor space needed to open and discharge.', S_, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('Pressure shall be measured in the vessel and in the filtrate line, with a high-pressure alarm and an interlock that closes the gas supply.', M, 'Design review, FAT'),
      c('The filtrate line shall have a sight glass and a connection for a turbidity or flow instrument, so that medium breakthrough and the end of filtration can be seen.', S_, DR),
      c('Plate position sensors shall confirm that the filter is closed and sealed before pressure is applied, and run and fault signals shall be available for the plant control system.', S_, DR)
    ] },
    safety('filter', [
      c('The vessel shall be protected from overpressure by a relief device sized for the worst credible case, such as failure of the gas pressure regulator, and the supplier shall state the relief basis.', M, DR)
    ]),
    docs('pressure Nutsche filter', 'the closure and plate lift diagram and the gas consumption data'),
    tests('filter', 'It shall include a closure interlock check and a test that the plate seals under the full filtration pressure difference.', 'It shall include a filtration, wash and blow-through trial with water or solvent and a discharge trial.'),
    spares('filter medium, plate and closure seals, gaskets and position sensors')
  ]);

  /* ---------- Sparkler filter ---------- */
  A.add('sparkler', { cat: CAT, label: 'Sparkler filter (plate filter)', pfx: 'SPK', noun: 'sparkler filter', varKey: 'vtype', fields: [
    { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'F-801 Sparkler filter' },
    { g: 'Duty', k: 'fluid', l: 'Fluid and service', t: 'text', d: 'API solution in methanol, carbon treatment polish filtration' },
    { g: 'Duty', k: 'vol', l: 'Batch volume per cycle', t: 'num', u: 'L', d: '1500' },
    { g: 'Duty', k: 'flow', l: 'Design filtration flow', t: 'num', u: 'm³/h', d: '3' },
    { g: 'Duty', k: 'ftemp', l: 'Operating temperature', t: 'num', u: '°C', d: '40' },
    { g: 'Duty', k: 'visc', l: 'Viscosity', t: 'num', u: 'cP', d: '1' },
    { g: 'Duty', k: 'load', l: 'Solids loading (carbon and fines)', t: 'num', u: '% w/w', d: '2' },
    { g: 'Duty', k: 'clarity', l: 'Required filtrate clarity', t: 'text', d: 'No visible carbon and particles below 5 µm' },
    { g: 'Duty', k: 'area', l: 'Filter area', t: 'num', u: 'm²', d: '2.5' },
    { g: 'Duty', k: 'dpmax', l: 'Maximum pressure difference across the cake', t: 'num', u: 'bar', d: '3' },
    { g: 'Design', k: 'dp', l: 'Design pressure', t: 'num', u: 'barg', d: '6' },
    { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '100' },
    { g: 'Design', k: 'media', l: 'Filter media on plates', t: 'sel', o: ['paper or cloth sheets', 'sintered or wire mesh plates'], d: 'paper or cloth sheets' },
    { g: 'Design', k: 'vtype', l: 'Plate arrangement', t: 'sel', o: ['Vertical stack of horizontal plates in a pressure vessel', 'Horizontal vessel with vertical plates'], d: 'Vertical stack of horizontal plates in a pressure vessel', drv: 1 },
    { g: 'Handling', k: 'recirc', l: 'Recirculation until clear', t: 'sel', o: YN, d: 'Yes', drv: 1 },
    { g: 'Handling', k: 'cake', l: 'Cake removal', t: 'sel', o: ['Opened and removed as a dry or damp cake', 'Flushed out as a slurry'], d: 'Opened and removed as a dry or damp cake', drv: 1 },
    { g: 'Handling', k: 'inert', l: 'Inerting', t: 'sel', o: ['Nitrogen inerting', 'No inerting'], d: 'Nitrogen inerting', drv: 1 }
  ] }, [
    { t: 'Process and performance requirements', c: [
      c('The filter shall clarify {fluid}, processing a batch of {vol} at a design flow of {flow}, a temperature of {ftemp} and a viscosity of {visc}.', M, FAT),
      c('The filtrate shall meet the clarity requirement: {clarity}. The supplier shall state the removal rating of the filter media and how the clarity is checked at the user’s test.', M, 'Design review, FAT'),
      c('The filter shall hold a solids load of {load} of the batch on a filter area of {area} before the pressure difference across the cake reaches {dpmax}. The supplier shall state the capacity basis and the cake resistance assumed.', M, DR),
      c('Filtration shall be started with a recirculation loop until the filtrate is clear, so that fines and carbon are not passed on. The supplier shall state the loop volume and how the pump is chosen to avoid breaking up the filter aid.', M, DR, true, is('recirc', /^Yes/)),
      c('The hold-up volume of the filter and its piping shall be low, and the supplier shall state it together with the method to recover the product (for example a solvent push or a gas blow) at the end of the cycle.', M, DR),
      c('The filter media shall not shed fibres or particles into the filtrate, and the supplier shall state how this is controlled and checked.', S_, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The filter shall be designed to a recognised pressure vessel code for a design pressure of {dp} and a design temperature of {dt}, with a stated corrosion allowance and a pressure equipment data report.', M, DOC),
      c('The plates shall be stacked horizontally on a centre tube inside a pressure vessel, with the filtrate collected through the centre tube. The supplier shall state the plate spacing, the plate support and how the stack is lifted out.', M, DR, true, is('vtype', /^Vertical/)),
      c('The plates shall be mounted vertically inside a horizontal vessel with a sliding plate carriage. The supplier shall state the plate spacing, the carriage travel and how the plates are held in position.', M, DR, true, is('vtype', /^Horizontal/)),
      c('Each plate shall be sealed so that unfiltered liquid cannot reach the filtrate side, with seals and joints that have no crevices where cake or fines can collect.', M, DR),
      c('The filter media shall be {media}. The supplier shall state the pore size or removal rating, how the media are fixed and changed, and their life.', M, DR),
      c('The closure shall be interlocked so that it cannot be opened under pressure, and the supplier shall state how residual pressure is vented and proven to be zero before opening.', M, 'Design review, FAT'),
      c('The cake shall be removed by opening the vessel and withdrawing the plates. The supplier shall state the safe working method, the lifting aid and the way the operator is protected from the product and solvent vapour.', M, DR, true, is('cake', /^Opened/)),
      c('The cake shall be flushed out of the vessel as a slurry. The supplier shall state the flush volume, the nozzles and the way the transfer line is cleared.', M, DR, true, is('cake', /^Flushed/))
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} and shall be compatible with the fluid, the temperature and the cleaning agents, and the supplier shall state any limit.', M, 'Design review, Documentation'),
      c('Product-contact polymers and elastomers, including seals, gaskets and filter sheets, shall be non-reactive and non-additive, with a compliance declaration for each.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, welds shall be smooth and fully penetrated, and the vessel shall be free of crevices and dead legs.', M, 'FAT, Documentation', true, gmpProd)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The filter shall be cleaned by {cleaning}. The supplier shall state how the plate pack is cleaned, since spray devices cannot reach between plates, and how cleaning is verified.', M, 'Design review, SAT', true, cipOn),
      c('The vessel and piping shall drain completely through low-point drains, and the vent shall be placed at the high point so that the filter can be filled without trapped gas.', M, DR),
      c('The filter shall be suitable for {loc} installation, with personnel protection for hot surfaces and clear space for withdrawing the plates.', S_, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('Pressure shall be measured at the inlet and the outlet of the filter, with the pressure difference displayed and a high-pressure-difference alarm.', M, 'Design review, FAT'),
      c('The filtrate line shall have a sight glass and a sampling point so that clarity can be checked, and a connection for a turbidity instrument.', S_, DR),
      c('The feed pump shall be interlocked to stop on high pressure difference and on high vessel pressure.', M, 'Design review, FAT')
    ] },
    safety('filter', [
      c('The vessel shall be protected from overpressure, including pressure from thermal expansion of trapped liquid and from the gas supply, by a relief device, and the supplier shall state the relief basis.', M, DR),
      c('The vessel shall be purged with nitrogen before filling and before opening. The supplier shall state the purge volume and the oxygen level reached.', M, 'Design review, FAT', true, is('inert', /^Nitrogen/)),
      c('The user shall state when activated carbon or another combustible filter aid is used, and the supplier shall state the measures against hot spots and self-heating of the cake (for example temperature monitoring, nitrogen blanketing and safe cake removal).', M, DR, true, zoneOn)
    ]),
    docs('sparkler filter', 'the plate stack drawing and the hold-up volume data'),
    tests('filter', 'It shall include a check that no liquid bypasses the plates and a check of the hold-up volume.', 'It shall include a filtration trial with the specified fluid or water and a check of the filtrate clarity.'),
    spares('filter sheets or cloth, plate seals, vessel gaskets and a spare plate')
  ]);

  /* ---------- Line filter (cartridge or bag) ---------- */
  A.add('linef', { cat: CAT, label: 'Line filter (cartridge or bag)', pfx: 'LNF', noun: 'line filter', varKey: 'ftype', fields: [
    { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'F-901 Solvent line filter' },
    { g: 'Duty', k: 'ftype', l: 'Filter element type', t: 'sel', o: ['Pleated cartridge', 'Depth cartridge', 'Bag', 'Gas or vent filter (hydrophobic cartridge)'], d: 'Pleated cartridge', drv: 1 },
    { g: 'Duty', k: 'service', l: 'Service and fluid', t: 'text', d: 'Particulate removal from solvent transfer to reactor' },
    { g: 'Duty', k: 'flow', l: 'Design flow (m³/h for liquid, Nm³/h for gas)', t: 'num', u: 'm³/h', d: '10' },
    { g: 'Duty', k: 'temp', l: 'Operating temperature', t: 'num', u: '°C', d: '30' },
    { g: 'Duty', k: 'visc', l: 'Viscosity', t: 'num', u: 'cP', d: '0.6' },
    { g: 'Duty', k: 'rating', l: 'Filter rating', t: 'text', d: '1 µm absolute' },
    { g: 'Duty', k: 'steril', l: 'Grade', t: 'sel', o: ['Particulate removal only', 'Sterilising grade (0.2 µm) with integrity test'], d: 'Particulate removal only', drv: 1 },
    { g: 'Duty', k: 'dpclean', l: 'Clean pressure drop at design flow', t: 'num', u: 'bar', d: '0.1' },
    { g: 'Duty', k: 'dpchange', l: 'Pressure drop at element change-out', t: 'num', u: 'bar', d: '1.5' },
    { g: 'Design', k: 'dp', l: 'Design pressure', t: 'num', u: 'barg', d: '10' },
    { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '100' },
    { g: 'Design', k: 'housing', l: 'Housing size', t: 'text', d: 'One housing for three 30 inch cartridges' },
    { g: 'Design', k: 'closure', l: 'Housing closure', t: 'sel', o: ['Quick-opening clamp', 'Bolted cover', 'Hinged swing bolts'], d: 'Quick-opening clamp' },
    { g: 'Design', k: 'duplex', l: 'Arrangement', t: 'sel', o: ['Single housing', 'Duplex with change-over'], d: 'Single housing', drv: 1 }
  ] }, [
    { t: 'Process and performance requirements', c: [
      c('The filter shall treat {service} at a design flow of {flow}, a temperature of {temp} and a viscosity of {visc}, with a clean pressure drop not greater than {dpclean}.', M, FAT),
      c('The filter elements shall have a rating of {rating}, and the supplier shall state how the rating is defined (absolute or nominal) and the efficiency test behind it.', M, DOC),
      c('The elements shall be changed when the pressure drop reaches {dpchange}, and the supplier shall state the expected element life for the stated service and the pressure drop curve against flow.', M, DR),
      c('Sterilising grade elements shall have a rating of 0.2 µm and shall be validated by the element supplier for bacterial retention. The supplier shall provide the validation guide and the lot release certificate.', M, DOC, true, is('steril', /^Sterilising/)),
      c('The housing shall allow an integrity test of the installed elements (for example bubble point or diffusion), with a test connection and a vent, and the supplier shall state the test method, the limits and the wetting liquid.', M, 'Design review, SAT', true, is('steril', /^Sterilising/)),
      c('The gas filter shall be hydrophobic, shall retain liquid droplets and particles, and the housing shall have a drain at the low point that removes condensate. The supplier shall state the water intrusion pressure.', M, DR, true, is('ftype', /^Gas/)),
      c('The element shall not release fibres, binder or extractables into the filtrate. The supplier shall provide extractables data for the liquids in use or a statement of suitability.', M, DOC, true, prodOn)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The housing shall be designed to a recognised pressure vessel code for a design pressure of {dp} and a design temperature of {dt}, with a pressure equipment data report.', M, DOC),
      c('The housing shall be {housing}, with a {closure} closure. The supplier shall state the number of fixing points, the sealing arrangement, and the lifting and handling needed to change the elements.', M, DR),
      c('The elements shall seat on fixed locating features so that a wrongly fitted or missing element is obvious, and the seal between the element and the housing shall have no bypass path.', M, DR),
      c('Bag filters shall have a sealed ring or basket so that the fluid cannot bypass the bag, and the bag shall be supported against the full pressure drop.', M, DR, true, is('ftype', /^Bag/)),
      c('The duplex arrangement shall allow one housing to be isolated, drained and opened while the other stays in service, with a change-over valve that cannot close both housings, and shall be interlocked or mechanically keyed to prevent unfiltered flow.', M, 'Design review, FAT', true, is('duplex', /^Duplex/)),
      c('The housing shall have a vent at the high point and a drain at the low point so that it can be filled without trapped gas and drained completely before the elements are changed.', M, DR)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts of the housing shall be made of {moc} and shall be compatible with the fluid, the temperature and the cleaning or sterilising agents.', M, 'Design review, Documentation'),
      c('Element materials, seals and O-rings in contact with the product shall be non-reactive and non-additive and compatible with the solvent, with a compliance declaration for each.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, welds shall be smooth and fully penetrated, and the housing shall have no crevices or dead legs.', M, 'FAT, Documentation', true, gmpProd)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The housing shall withstand the cleaning method ({cleaning}), including temperature and cleaning agents, and the supplier shall state whether the elements stay in place during cleaning or sterilising and the allowed number of cycles.', M, 'Design review, SAT', true, cipOn),
      c('The housing shall be suitable for {loc} installation, with a drip tray or drain arrangement under the closure and personnel protection for hot surfaces.', S_, DR)
    ] },
    { t: 'Instrumentation and control', c: [
      c('Pressure gauges or transmitters shall be fitted on the inlet and the outlet of each housing so that the pressure drop can be read, with a high pressure drop alarm at the change-out value.', M, 'Design review, FAT'),
      c('A sample connection shall be provided downstream of the filter, and the user may request a connection for particle counting.', C_, DR, false)
    ] },
    safety('line filter', [
      c('Trapped liquid in the housing shall be protected against thermal expansion, for example by a relief valve or by an arrangement that prevents it from being closed in.', M, DR),
      c('The housing shall be vented and drained safely before opening, with a means to prove that there is no pressure, and the closure shall not release until pressure has been vented.', M, 'Design review, SAT'),
      c('Where the fluid is a low-conductivity solvent, the supplier shall state the electrostatic charging risk of the elements and the housing, and the filter shall follow the earthing and flow rate limits stated by the user.', M, DR, true, zoneOn)
    ]),
    docs('line filter', 'the element datasheet and installation drawing'),
    tests('line filter', 'It shall include a check of the housing closure and a check that elements are located correctly.', 'It shall include an integrity test of the installed elements where sterilising grade is specified, and a check of the pressure drop at flow.'),
    spares('spare elements or bags, O-rings and gaskets, and closure parts')
  ]);

  /* ---------- Centrifuge ---------- */
  A.add('cent', { cat: CAT, label: 'Centrifuge', pfx: 'CEN', noun: 'centrifuge', varKey: 'ctype', fields: [
    { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'C-1001 Product centrifuge' },
    { g: 'Duty', k: 'ctype', l: 'Centrifuge type', t: 'sel', o: ['Top-discharge basket', 'Bottom-discharge peeler', 'Inverted filter bag', 'Decanter'], d: 'Bottom-discharge peeler', drv: 1 },
    { g: 'Duty', k: 'prod', l: 'Product and slurry', t: 'text', d: 'API crystal slurry in isopropanol' },
    { g: 'Duty', k: 'batch', l: 'Slurry volume per batch', t: 'num', u: 'L', d: '1000' },
    { g: 'Duty', k: 'solids', l: 'Solids content of slurry', t: 'num', u: '% w/w', d: '20' },
    { g: 'Duty', k: 'psize', l: 'Particle size d50', t: 'num', u: 'µm', d: '50' },
    { g: 'Duty', k: 'load', l: 'Maximum cake load per cycle', t: 'num', u: 'kg', d: '200' },
    { g: 'Duty', k: 'bowl', l: 'Basket or bowl diameter', t: 'num', u: 'mm', d: '1200' },
    { g: 'Duty', k: 'g', l: 'Maximum separation force', t: 'num', u: 'g', d: '1000' },
    { g: 'Duty', k: 'cycle', l: 'Target cycle time', t: 'num', u: 'min', d: '60' },
    { g: 'Duty', k: 'wetness', l: 'Target residual liquid in cake', t: 'num', u: '% w/w', d: '10' },
    { g: 'Duty', k: 'wash', l: 'Cake wash volume per cycle', t: 'num', u: 'L', d: '200' },
    { g: 'Design', k: 'dp', l: 'Housing design pressure', t: 'num', u: 'barg', d: '0.5' },
    { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '100' },
    { g: 'Design', k: 'vib', l: 'Vibration alarm limit', t: 'num', u: 'mm/s rms', d: '4.5' },
    { g: 'Handling', k: 'seal', l: 'Shaft and housing sealing', t: 'sel', o: ['Gas-purged labyrinth seal', 'Double mechanical seal with barrier fluid', 'Single mechanical seal'], d: 'Gas-purged labyrinth seal', drv: 1 },
    { g: 'Handling', k: 'inert', l: 'Inerting', t: 'sel', o: ['Nitrogen inerting with oxygen monitoring', 'No inerting'], d: 'Nitrogen inerting with oxygen monitoring', drv: 1 },
    { g: 'Handling', k: 'contain', l: 'Discharge', t: 'sel', o: ['Closed discharge to liner, drum or hopper', 'Open discharge with local exhaust'], d: 'Closed discharge to liner, drum or hopper', drv: 1 }
  ] }, [
    { t: 'Process and performance requirements', c: [
      c('The centrifuge shall separate {prod}, processing a slurry volume of {batch} per batch with a solids content of {solids} and a particle size d50 of {psize}.', M, FAT),
      c('The machine shall hold a cake load of {load} per cycle in a basket or bowl of {bowl} diameter, and shall run at a separation force of up to {g}.', M, DR),
      c('The cycle time for the stated slurry, including loading, spinning, washing, drying and discharge, shall not exceed {cycle}, and the supplier shall state the time of each step.', M, 'Design review, FAT'),
      c('The cake shall be spun to a residual liquid not greater than {wetness}. The supplier shall state the expected result, the effect of spin time and speed, and how it is measured at the user’s test.', M, 'Design review, FAT'),
      c('The cake shall be washed with {wash} of wash liquid per cycle. The supplier shall state how the wash is spread evenly and how channelling is avoided.', M, DR, true, function (v) { return !/^Decanter/.test(v.ctype); }),
      c('The peeler shall discharge the cake with a hydraulic or pneumatic knife. The supplier shall state the residual heel left on the filter medium, the knife travel and the control that stops the knife from cutting into the medium.', M, DR, true, is('ctype', /^Bottom/)),
      c('The top-discharge basket shall be unloaded from the top, by hand tools, a lifting aid or a plough. The supplier shall state the unloading method, the exposure of the operator and the heel left.', M, DR, true, is('ctype', /^Top/)),
      c('The inverted filter bag shall be turned inside out to discharge the cake, and the supplier shall state the bag material, the fatigue life of the bag and the cake left on it.', M, DR, true, is('ctype', /^Inverted/)),
      c('The decanter shall separate the solids and the liquid continuously, with the supplier stating the maximum feed rate for the stated solids content and particle size, the differential speed range, the pond depth setting and the dryness of the solids.', M, DR, true, is('ctype', /^Decanter/))
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The rotating assembly shall be dynamically balanced, and the supplier shall provide the balance record and the permitted out-of-balance for the product and cake load.', M, 'FAT, Documentation'),
      c('The housing shall be designed to contain the energy of a rotor failure, and the supplier shall state the design basis for this and the housing design pressure of {dp} at a design temperature of {dt}.', M, DOC),
      c('The machine shall be fitted with a cover interlock so that the cover cannot be opened while the rotor is turning, and the rotor cannot be started with the cover open.', M, 'Design review, FAT'),
      c('The machine shall be fitted with overspeed protection and a brake, and the supplier shall state the run-down time from full speed to rest.', M, 'Design review, FAT'),
      c('Vibration shall be measured on the bearings and the housing, with an alarm at {vib} and a trip at a higher limit stated by the supplier, and the machine shall be mounted on supports that isolate vibration from the building.', M, 'Design review, FAT'),
      c('The supplier shall state the bearing life and the temperature limits, with bearing temperature monitoring and a lubrication plan.', S_, DOC),
      c('Closed discharge shall be into a liner, drum or hopper through a sealed arrangement, so that the operator is not exposed to the product. The supplier shall state how the containment is demonstrated.', M, 'Design review, FAT', true, is('contain', /^Closed/))
    ] },
    { t: 'Sealing and inerting', c: [
      c('Shaft and housing sealing shall be: {seal}. The supplier shall state the seal type, the support plan and the leak rate to the room.', M, DR),
      c('The barrier fluid system shall include a reservoir with level and pressure indication and an alarm on loss of barrier, and the barrier fluid shall be compatible with the product.', M, DR, true, is('seal', /^Double/)),
      c('The housing shall be inerted with nitrogen and monitored for oxygen, with the oxygen limit and the purge sequence stated by the supplier, and the machine shall not start above the oxygen limit.', M, 'Design review, FAT', true, is('inert', /^Nitrogen/))
    ] },
    { t: 'Materials and surface finish', c: [
      c('Wetted parts shall be made of {moc} and shall be compatible with the slurry, the wash liquids, the temperature and the cleaning agents.', M, 'Design review, Documentation'),
      c('Product-contact polymers and elastomers, including gaskets, seals, filter cloth and bags, shall be non-reactive and non-additive, with a compliance declaration for each.', M, DOC, true, prodOn),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, welds shall be smooth and fully penetrated, and the machine shall have no crevices or dead legs where product can collect.', M, 'FAT, Documentation', true, gmpProd)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The centrifuge shall be cleaned by {cleaning}. Spray devices shall wet the basket or bowl, the housing, the lid and the discharge route, and the supplier shall show the coverage.', M, 'Design review, SAT', true, cipOn),
      c('The housing and discharge route shall drain without pockets, and the supplier shall state how the filter medium is cleaned in place and how cleaning is verified.', M, DR, true, gmpProd),
      c('The supplier shall state the floor loads, the dynamic loads on the foundation, the headroom and the nitrogen, cooling and electric power consumption, and the installation shall suit {loc}.', S_, DOC)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The drive shall have a variable speed control with a controlled ramp up and ramp down, and the speed shall be shown and recorded with high speed and low speed alarms.', M, 'Design review, FAT'),
      c('The cycle shall be run as an interlocked sequence of loading, spinning, washing, drying and discharge, with recipes, and run and fault signals shall be available for the plant control system.', S_, DR),
      c('Motor current or torque shall be monitored to detect abnormal loading of the cake, with an alarm and a safe stop.', S_, DR)
    ] },
    safety('centrifuge', [
      c('The ignition hazard assessment of the centrifuge shall consider friction, hot bearings, rubbing of the rotor and static charge from non-conductive solvents and bags. The supplier shall state the measures and the temperature class achieved.', M, DOC, true, zoneOn),
      c('The housing shall have a relief or vent for a solvent vapour event, and the supplier shall state the relief basis and where it vents to.', S_, DR, true, zoneOn)
    ]),
    docs('centrifuge', 'the balance record, the rotor and housing design basis and the foundation load drawing'),
    tests('centrifuge', 'It shall include a no-load run to full speed, an overspeed test, a vibration test and a check of the brake, with the records provided.', 'It shall include a trial run with water or solvent, a vibration baseline reading and a check of the cover interlock.'),
    spares('filter medium or bags, seals, bearings, knife parts for a peeler and a spare set of vibration sensors')
  ]);
});
