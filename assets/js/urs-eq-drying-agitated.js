/* URS builder equipment module: agitated and rotating vacuum dryers.
   RVD, RCVD, DCVD, Nauta (conical screw) dryer and paddle dryer. Loaded before urs-builder.js. */
(window.PCE_URS = window.PCE_URS || { q: [] }).q.push(function (A) {
  var c = A.c, M = A.M, S_ = A.S_, C_ = A.C_, DR = A.DR, FAT = A.FAT, SAT = A.SAT, DOC = A.DOC, gmpOn = A.gmpOn, prodOn = A.prodOn, gmpProd = A.gmpProd, zoneOn = A.zoneOn, cipOn = A.cipOn;

  var contOn = function (v) { return /^Contained/.test(v.cont); };
  var flamOn = function (v) { return /^(Flammable|Mixed)/.test(v.solv); };
  var inertOn = function (v) { return /^Nitrogen/.test(v.inert); };
  var dblSeal = function (v) { return /^Double/.test(v.seal); };
  var dryGas = function (v) { return /^Dry/.test(v.seal); };
  var lumpOn = function (v) { return /^Lump/.test(v.lump); };
  var sampOn = function (v) { return /^Sampling/.test(v.samp); };

  /* fields shared by all five dryers; d = defaults that differ by type */
  function fields(d, extra) {
    var f = [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: d.tag },
      { g: 'Duty', k: 'proc', l: 'Product and solvent to be removed', t: 'text', d: d.proc },
      { g: 'Duty', k: 'solv', l: 'Type of liquid removed', t: 'sel', o: ['Flammable organic solvent', 'Water', 'Mixed solvent and water'], d: d.solv || 'Flammable organic solvent', drv: 1 },
      { g: 'Duty', k: 'charge', l: 'Wet charge per batch', t: 'num', u: 'kg', d: d.charge },
      { g: 'Duty', k: 'vol', l: 'Working volume', t: 'num', u: 'L', d: d.vol },
      { g: 'Duty', k: 'bd', l: 'Wet bulk density', t: 'num', u: 'kg/m³', d: d.bd },
      { g: 'Duty', k: 'lod0', l: 'Loss on drying of the wet cake', t: 'num', u: '% w/w', d: d.lod0 },
      { g: 'Duty', k: 'lodt', l: 'Dryness target', t: 'text', d: 'Loss on drying not more than 0.5% w/w and residual solvent within the product specification' },
      { g: 'Duty', k: 'dtime', l: 'Drying time per batch, including heating up', t: 'num', u: 'h', d: d.dtime },
      { g: 'Duty', k: 'tprod', l: 'Maximum product temperature', t: 'num', u: '°C', d: d.tprod },
      { g: 'Design', k: 'dpv', l: 'Vessel design pressure (and full vacuum)', t: 'num', u: 'barg', d: '1' },
      { g: 'Design', k: 'dpj', l: 'Jacket design pressure', t: 'num', u: 'barg', d: '6' },
      { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '150' },
      { g: 'Design', k: 'jmed', l: 'Jacket heating and cooling medium', t: 'text', d: 'Hot water or thermal fluid for heating, chilled water for cooling' },
      { g: 'Design', k: 'jrange', l: 'Jacket medium temperature range', t: 'text', d: '15 to 110 °C' },
      { g: 'Vacuum and solvent recovery', k: 'vac', l: 'Operating vacuum at the dryer', t: 'num', u: 'mbar(a)', d: d.vac || '20' },
      { g: 'Vacuum and solvent recovery', k: 'vsys', l: 'Vacuum system', t: 'text', d: 'Dry screw vacuum pump with a condenser, a receiver and a nitrogen bleed' },
      { g: 'Vacuum and solvent recovery', k: 'condq', l: 'Condenser duty for the peak drying rate', t: 'num', u: 'kW', d: d.condq },
      { g: 'Vacuum and solvent recovery', k: 'cool', l: 'Condenser coolant', t: 'text', d: 'Chilled brine at -10 °C' },
      { g: 'Vacuum and solvent recovery', k: 'filt', l: 'Dust filter', t: 'sel', o: ['Sintered metal or bag filter inside the dryer with back-pulse', 'Filter housing in the vacuum line with back-pulse', 'Cartridge filter in the vacuum line without back-pulse'], d: 'Filter housing in the vacuum line with back-pulse' },
      { g: 'Drive, sealing and handling', k: 'rpm', l: 'Rotation or agitation speed range', t: 'text', d: d.rpm },
      { g: 'Drive, sealing and handling', k: 'drive', l: 'Speed control', t: 'sel', o: ['Fixed speed', 'Variable speed (VFD)'], d: 'Variable speed (VFD)' },
      { g: 'Drive, sealing and handling', k: 'seal', l: 'Sealing against vacuum at the rotating parts', t: 'sel', o: ['Single mechanical seal', 'Double mechanical seal with barrier fluid', 'Dry-running gas-lubricated seal'], d: 'Double mechanical seal with barrier fluid', drv: 1 },
      { g: 'Drive, sealing and handling', k: 'disch', l: 'Product discharge', t: 'sel', o: d.dopts, d: d.dopts[0], drv: 1 },
      { g: 'Drive, sealing and handling', k: 'cont', l: 'Containment', t: 'sel', o: ['No containment required', 'Contained charging and discharge (split butterfly valve or isolator)'], d: 'Contained charging and discharge (split butterfly valve or isolator)', drv: 1 },
      { g: 'Drive, sealing and handling', k: 'lump', l: 'Lump breaking', t: 'sel', o: ['Lump breaker or chopper', 'No lump breaker'], d: d.lump || 'No lump breaker', drv: 1 },
      { g: 'Drive, sealing and handling', k: 'samp', l: 'Sampling during drying', t: 'sel', o: ['Sampling with a thief or sample port under vacuum', 'No sampling during drying'], d: 'Sampling with a thief or sample port under vacuum', drv: 1 },
      { g: 'Safety', k: 'inert', l: 'Inerting', t: 'sel', o: ['Nitrogen inerting and bleed', 'No inerting'], d: 'Nitrogen inerting and bleed', drv: 1 }
    ];
    return f.slice(0, 15).concat(extra.pre || [], f.slice(15)).concat(extra.post || []);
  }

  /* the sections every dryer shares; n = noun, s = per-type switches */
  function sections(n, s) {
    var N = 'The ' + n;
    return {
      process: { t: 'Process and performance requirements', c: [
        c(N + ' shall dry a wet charge of {charge} ({proc}) with a working volume of {vol} and a wet bulk density of {bd}, from a loss on drying of {lod0} to the dryness target: {lodt}.', M, 'FAT, SAT'),
        c('The drying time per batch, including heating up and cooling to the discharge temperature, shall not exceed {dtime} at the specified vacuum of {vac} and the jacket temperature range of {jrange}.', M, 'FAT, SAT'),
        c('The product temperature shall not exceed {tprod} at any point, including at the heated wall, during heating, drying and any delay after drying. The supplier shall state the highest wall temperature expected and how product degradation is avoided.', M, DR),
        c('The supplier shall state the minimum and maximum fill level for effective mixing and heat transfer, and shall state the behaviour of the product (for example lumping, sticking, foaming or crusting) that has been assumed in the design.', M, DR),
        c('The residual solvent and loss on drying shall be uniform throughout the batch. The supplier shall state how uniformity is achieved and how it is shown by sampling from different positions.', S_, 'FAT, SAT'),
        c('The dryer shall not cause damaging attrition, particle size change or melting of the product beyond limits agreed with the user.', S_, DR),
        c('The supplier shall state the product holdup that remains in the dryer after discharge, so that yield loss and cross-contamination risk can be assessed.', S_, DR)
      ] },
      mech: { t: 'Mechanical design and construction', c: [
        c(N + ' vessel shall be designed to a recognised pressure vessel code stated by the supplier, for a design pressure of {dpv} together with full vacuum, a jacket design pressure of {dpj} and a design temperature of {dt}.', M, DOC),
        c('The vessel shall hold vacuum with a pressure rise not greater than the rate agreed with the user in a leak-up test. The number of flanged joints and connections below the product level shall be kept to a minimum.', M, 'FAT, SAT'),
        c('Nozzles, manways and sight glasses shall be provided for charging, vacuum take-off, inerting, instruments and inspection. A sight glass with a light shall allow the product bed to be seen during drying.', S_, DR),
        c('The vessel and jacket shall be insulated, or fitted with personnel protection, so that surfaces within reach do not exceed the temperature set in the user’s standard.', S_, DR),
        c('The structure, supports and platform shall carry the weight of the fully charged dryer with a stated margin, and shall give access to the drive, seals and instruments for maintenance.', S_, DR)
      ] },
      heat: { t: 'Heating and cooling', c: [
        c('The jacket shall be heated and cooled with {jmed}. The jacket shall give even surface temperature, shall drain and vent completely, and shall be able to change from heating to cooling without a thermal shock outside the limits stated by the supplier.', M, DR),
        c('The supplier shall state the heat transfer area per unit of working volume, the overall heat transfer coefficient assumed at the end of drying, and the resulting heat input at the specified jacket temperature.', M, DR),
        c('The jacket and any heated internal parts shall be protected against overpressure, and the supplier shall state the relief arrangement and the vent or drain route for the heating medium.', S_, DR)
      ] },
      vac: { t: 'Vacuum system and solvent recovery', c: [
        c('The vacuum system shall be: {vsys}. It shall reach and hold {vac} at the dryer while removing the vapour load at the peak drying rate.', M, 'FAT, SAT'),
        c('The condenser shall remove the peak vapour load of {condq} using {cool}, with condensate collected in a receiver that can be drained without breaking vacuum, so that the solvent is recovered and the vacuum pump is protected from condensable vapour.', M, DR),
        c('The dust filter shall be: {filt}. It shall keep product out of the vacuum line, shall be accessible for inspection, and shall be cleaned or back-pulsed with nitrogen without wetting the product.', M, DR),
        c('Vacuum shall be released with nitrogen or another gas agreed with the user, through a filtered line, at a controlled rate that does not disturb the product bed.', S_, DR)
      ] },
      disch: { t: 'Charging, discharge and containment', c: [
        c('Product shall be charged by a method suited to a wet, possibly sticky cake. The supplier shall state the size and position of the charging port and any transfer device needed to charge without product loss.', M, DR),
        c('Product discharge shall be by: {disch}. The supplier shall state the discharge time for a full batch and how complete discharge is achieved for the stated product.', M, DR),
        c('Charging and discharge shall be contained: {cont}. The supplier shall state the containment performance expected and how it is shown by a surrogate powder test, with the target set by the user’s containment assessment.', M, 'FAT, Documentation', true, contOn),
        c('Where the product forms lumps, a lump breaker or chopper shall be provided in the dryer, with a seal and drive of the same standard as the main drive, and the supplier shall state its speed and the effect on particle size.', S_, DR, true, lumpOn),
        c('A sampling device shall allow a sample to be taken during drying without breaking vacuum and without exposing the operator to product or solvent. Cross-contamination between samples shall be prevented.', S_, DR, true, sampOn)
      ] },
      drive: { t: 'Drive, shaft and rotary seals', c: [
        c('The speed range shall be {rpm}, with speed control by {drive}. The supplier shall state the motor power, the starting torque on a fully loaded wet charge and the margin applied.', M, DR),
        c('Sealing against vacuum shall be: {seal}. The supplier shall state the seal type, the support plan and the expected leak rate, and the seal shall be suitable for the solvent, the temperature and fine dust.', M, DR),
        c('The barrier fluid system shall have a reservoir with level and pressure indication and an alarm on loss of barrier. The barrier fluid shall be compatible with the product and the solvent.', M, DR, true, dblSeal),
        c('The supplier shall state the gas supply, its quality and the alarm on loss of gas for the dry-running seal, and shall state how product is kept out of the seal faces.', M, DR, true, dryGas),
        c('Bearings and gearbox lubricants that could contact product through leakage shall be of a grade accepted for the user’s product, and the supplier shall state the bearing life.', S_, DOC, true, gmpOn)
      ] },
      mat: { t: 'Materials and surface finish', c: [
        c('Wetted parts shall be made of {moc} and shall be compatible with the product, the solvent, the temperature and the cleaning agents in use.', M, 'Design review, Documentation'),
        c('Product-contact surfaces shall have a surface roughness not greater than {finish}, and the supplier shall provide the measurement record.', M, 'FAT, Documentation', true, gmpProd),
        c('Product-contact welds shall be smooth, fully penetrated and recorded on a weld map, with no crevices or dead legs, and the supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for pressure and wetted parts.', M, DOC, true, gmpProd),
        c('Product-contact gaskets, seals and elastomers shall be non-reactive, non-additive and non-absorptive, and the supplier shall provide a compliance declaration for each.', M, DOC, true, prodOn)
      ] },
      util: { t: 'Cleaning, utilities and environment', c: [
        c('The dryer shall be cleaned by {cleaning}. Spray devices or washing arrangements shall reach all product-contact surfaces, and the dryer shall drain and dry fully after cleaning.', M, 'Design review, SAT', true, cipOn),
        c('The motor and utilities shall suit the installation: {loc}. The supplier shall list the utilities (steam or hot water, chilled water, brine, nitrogen, compressed air, power) with the flow, pressure and temperature needed.', M, DR)
      ] },
      instr: { t: 'Instrumentation and control', c: [
        c('The dryer shall have product temperature probes at positions that stay in contact with the product bed over the stated fill range, jacket inlet and outlet temperature, a vacuum transmitter and a jacket pressure indication.', M, DR),
        c('Heating shall be interlocked so that it cannot continue when the drive has stopped, when the vacuum is lost or when the product temperature exceeds {tprod}, and a high-temperature alarm and trip shall be provided.', M, 'Design review, FAT'),
        c('The control system shall run the drying cycle automatically, record time, temperature, vacuum, speed and drive load, and shall support an audit trail and electronic records in line with the user’s data integrity requirements.', S_, 'Design review, FAT', true, gmpOn),
        c('An end-point indication (for example condensate flow, vapour temperature or product temperature rise) should be available so that the drying end can be decided without opening the dryer.', C_, DR, false)
      ] },
      safety: { t: 'Safety and hazardous area', c: [
        c('The dryer, drive and all electrical and instrument equipment shall be certified for {zone}, with gas group and temperature class stated by the user, and the inside of the dryer shall be suitable for flammable vapour and combustible dust.', M, DOC, true, zoneOn),
        c('The dryer shall be bonded and earthed. Static discharge from the moving bed and from non-conductive parts shall be controlled, and the supplier shall state any isolated conductive parts.', M, SAT, true, zoneOn),
        c('The dryer shall be purged with nitrogen before charging, during heating and before opening ({inert}). The supplier shall state the oxygen level reached and a connection for an oxygen analyser shall be provided.', M, DR, true, inertOn),
        c('The user will state the minimum ignition energy and explosion data of the dry product, and the supplier shall state how the dryer, filter and vent are protected on the basis of that data.', S_, DR, true, flamOn)
      ] },
      docs: { t: 'Documentation and qualification', c: [
        c('The supplier shall provide a datasheet, general arrangement and P&ID, design calculations, the pressure equipment data report, material and weld records, an operation and maintenance manual and a recommended spare parts list.', M, DOC),
        c('The supplier shall support DQ, IQ and OQ with documents and traceability for the user’s protocols, and shall provide a compliance statement against this URS that lists every deviation.', M, DOC, true, gmpOn)
      ] },
      test: { t: 'Testing: FAT and SAT', c: [
        c('The factory acceptance test shall include a pressure test of the vessel and jacket, a leak-up test under vacuum, a run of the drive and seals empty and with a water or inert load, and a check of interlocks and alarms, available for the user to witness.', M, FAT),
        c('The factory acceptance test shall verify the surface finish, drainability and the position and fit of probes and filters, and shall include a surrogate containment test where containment is required.', S_, FAT, true, gmpProd),
        c('The site acceptance test shall include a leak check, a vacuum hold test, a check of connections and utilities against the P&ID, and a drying run with water or the user’s agreed trial material to confirm drying time and temperature control.', M, SAT)
      ] },
      spare: { t: 'Spares, delivery and warranty', c: [
        c('The supplier shall provide recommended spares, including seals, gaskets, filter elements and probes, with lead times, and shall state the delivery time and the warranty.', S_, DOC)
      ] }
    };
  }

  function assemble(sec, typeSec) {
    return [sec.process, sec.mech, typeSec, sec.heat, sec.vac, sec.disch, sec.drive, sec.mat, sec.util, sec.instr, sec.safety, sec.docs, sec.test, sec.spare];
  }

  /* ---------- RVD: rotary vacuum dryer ---------- */
  (function () {
    var n = 'rotary vacuum dryer', sec = sections(n, {});
    var type = { t: 'Rotary vessel and mixing', c: [
      c('The dryer shall be a horizontal jacketed cylindrical vessel that rotates about its own axis at {rpm}, driven with speed control by {drive}, so that the bed is turned over without an internal shaft.', M, DR),
      c('The vessel shall have internal lifting baffles ({baf}) to turn the bed over evenly. The supplier shall state the baffle design and the fill range over which mixing and heat transfer are effective.', M, DR, true, function (v) { return /^Internal/.test(v.baf); }),
      c('Jacket heating and cooling medium shall pass through a rotary joint at the shaft end: {rj}. The supplier shall state the joint and its leak detection, and the arrangement shall prevent medium entering the product or the vacuum space.', M, DR),
      c('The vacuum connection shall pass through the shaft end with a rotary vacuum seal and a filter that stays clear of the moving bed, and the supplier shall state how product carry-over to the seal and the vacuum line is avoided.', M, DR),
      c('The drive shall stop the vessel at a set position for charging and discharging, using position sensing and a brake, and shall allow slow jogging so that the product can be moved to the discharge port.', M, 'Design review, FAT'),
      c('The vessel shall be supported on bearings or rollers designed for the full loaded weight, and the supplier shall state the bearing life, the alignment tolerance and how the loaded vessel is kept from moving sideways.', S_, DR)
    ] };
    A.add('rvd', { cat: 'Drying', label: 'RVD, rotary vacuum dryer', pfx: 'RVD', noun: n, varKey: 'baf',
      fields: fields({ tag: 'D-501 Rotary vacuum dryer', proc: 'API intermediate wet with methanol', charge: '600', vol: '1500', bd: '700', lod0: '20', dtime: '14', tprod: '60', condq: '40', rpm: '2 to 8 rpm', dopts: ['Discharge through the main port into a container', 'Discharge through a split butterfly valve into a contained container', 'Manual discharge through the manway'] },
        { pre: [], post: [
          { g: 'Duty', k: 'baf', l: 'Internal baffles', t: 'sel', o: ['Internal lifting baffles', 'Smooth shell'], d: 'Internal lifting baffles', drv: 1 },
          { g: 'Design', k: 'rj', l: 'Jacket media connection', t: 'sel', o: ['Single rotary union for supply and return', 'Two rotary unions for separate heating and cooling circuits'], d: 'Single rotary union for supply and return' }
        ] }) }, assemble(sec, type));
  })();

  /* ---------- RCVD: rotocone vacuum dryer ---------- */
  (function () {
    var n = 'rotocone vacuum dryer', sec = sections(n, {});
    var type = { t: 'Conical vessel and rotation', c: [
      c('The dryer shall be a jacketed conical vessel that rotates at {rpm} about an axis the supplier shall state, so that the product tumbles over the heated wall. The supplier shall state the cone angle, the rotation axis and the fill range for effective mixing.', M, DR),
      c('The cone shall be {rtype}. The supplier shall state how the shape improves mixing and discharge for a wet, sticky cake and how dead zones in the cone tip are avoided.', M, DR),
      c('The cone shape shall allow near-complete discharge through the outlet, and the supplier shall state the outlet size, the discharge time and the product left after discharge.', M, 'Design review, FAT'),
      c('Jacket heating and cooling medium, and the vacuum connection, shall pass through rotary joints on the shaft: {rj}. The supplier shall state the joints, the leak detection and the arrangement that keeps medium and product apart.', M, DR),
      c('The drive shall stop the vessel at a set position for charging and discharging, with a brake, position sensing and slow jogging, and the supplier shall state the load on the drive from a fully charged wet cake.', M, 'Design review, FAT'),
      c('The vessel shall be supported on bearings designed for the full loaded weight with a stated life, and the supplier shall state the alignment tolerance and how the rotating vessel is guarded.', S_, DR)
    ] };
    A.add('rcvd', { cat: 'Drying', label: 'RCVD, rotocone vacuum dryer', pfx: 'RCV', noun: n, varKey: 'rtype',
      fields: fields({ tag: 'D-502 Rotocone vacuum dryer', proc: 'API wet with ethyl acetate', charge: '450', vol: '1200', bd: '650', lod0: '18', dtime: '12', tprod: '55', condq: '35', rpm: '1 to 6 rpm', dopts: ['Bottom discharge through the cone outlet valve', 'Discharge through a split butterfly valve into a contained container', 'Manual discharge through the manway'] },
        { post: [
          { g: 'Duty', k: 'rtype', l: 'Cone construction', t: 'sel', o: ['Rotocone with an internal baffle', 'Rotocone with a smooth cone'], d: 'Rotocone with an internal baffle', drv: 1 },
          { g: 'Design', k: 'rj', l: 'Jacket media connection', t: 'sel', o: ['Single rotary union for supply and return', 'Two rotary unions for separate heating and cooling circuits'], d: 'Single rotary union for supply and return' }
        ] }) }, assemble(sec, type));
  })();

  /* ---------- DCVD: double cone vacuum dryer ---------- */
  (function () {
    var n = 'double cone vacuum dryer', sec = sections(n, {});
    var type = { t: 'Double cone vessel and trunnions', c: [
      c('The dryer shall be a jacketed double cone vessel (two cones joined to a short cylinder) that rotates about a horizontal axis through hollow trunnions at {rpm}, so that the bed tumbles gently without an internal agitator.', M, DR),
      c('Because there is no internal agitator, the supplier shall state the mixing time and the effectiveness for the stated product and fill, and whether a baffle or an intensifier bar is offered for lumpy or sticky cake.', M, DR),
      c('The vacuum take-off and the jacket medium shall pass through the hollow trunnions through rotary joints. The filter arrangement shall be: {dfil}.', M, DR),
      c('The supplier shall state how product is kept out of the trunnion and the filter during rotation, and how the filter is cleaned or back-pulsed without breaking vacuum.', M, DR, true, function (v) { return /^Filter in the vacuum take-off/.test(v.dfil); }),
      c('The cone ends and the discharge port shall be free of pockets where product can remain, and the supplier shall state the product left after discharge and the cleaning method used for the cone tips.', M, DR),
      c('The drive shall stop the vessel at set positions for charging and discharging, with a brake and slow jogging, and the supplier shall state the bearing life, the alignment tolerance and the guarding of the rotating vessel.', M, 'Design review, FAT')
    ] };
    A.add('dcvd', { cat: 'Drying', label: 'DCVD, double cone vacuum dryer', pfx: 'DCV', noun: n, varKey: 'dfil',
      fields: fields({ tag: 'D-503 Double cone vacuum dryer', proc: 'Crystalline API wet with isopropanol', charge: '400', vol: '1000', bd: '750', lod0: '15', dtime: '10', tprod: '65', condq: '30', rpm: '2 to 8 rpm', dopts: ['Bottom discharge through the cone outlet valve', 'Discharge through a split butterfly valve into a contained container', 'Manual discharge through the manway'] },
        { post: [
          { g: 'Vacuum and solvent recovery', k: 'dfil', l: 'Filter position', t: 'sel', o: ['Filter in the vacuum take-off at the trunnion', 'Filter in the vacuum line outside the dryer'], d: 'Filter in the vacuum take-off at the trunnion', drv: 1 }
        ] }) }, assemble(sec, type));
  })();

  /* ---------- Nauta: conical screw vacuum dryer ---------- */
  (function () {
    var n = 'conical screw (Nauta type) vacuum dryer', sec = sections(n, {});
    var type = { t: 'Screw, orbit and cone', c: [
      c('The dryer shall be a stationary vertical jacketed cone with a screw that turns about its own axis at {screw} and orbits around the cone wall at {orbit}, driven with speed control by {drive}, so that product is lifted from the cone tip and mixed gently.', M, DR),
      c('The screw shall be heated with {jmed}: {hscrew}. The supplier shall state the screw heat transfer area, the rotary joint for the heating medium and the leak detection.', M, DR, true, function (v) { return /^Heated/.test(v.hscrew); }),
      c('The screw arm shall be supported only from the top and shall have no bottom bearing, so that there is no bearing in the product zone. The supplier shall state the shaft deflection under a fully loaded wet charge.', M, DR, true, function (v) { return /^Bottom-free/.test(v.nbear); }),
      c('A bottom bearing shall be used for the screw. The supplier shall state how the bearing is protected from product and lubricant, how it is inspected and the wear limit.', M, DR, true, function (v) { return /^With bottom/.test(v.nbear); }),
      c('The clearance between the screw and the cone wall shall be stated, and shall be small enough for the bed to be moved but large enough to avoid crushing crystals. The supplier shall state the tip speed and the expected attrition.', M, DR),
      c('The drive and gearbox sit at the top of the cone, away from the product. The supplier shall state how the shaft seal at the top is arranged to keep product dust, solvent vapour and lubricant apart.', M, DR),
      c('The cone tip and discharge valve shall be free of pockets, with the screw tip close to the outlet, and the supplier shall state the product left after discharge for a full batch.', S_, DR)
    ] };
    A.add('nauta', { cat: 'Drying', label: 'Nauta dryer (conical screw vacuum dryer)', pfx: 'NAU', noun: n, varKey: 'nbear',
      fields: fields({ tag: 'D-504 Conical screw vacuum dryer', proc: 'API wet with ethanol', charge: '800', vol: '2000', bd: '700', lod0: '20', dtime: '10', tprod: '60', condq: '55', rpm: 'Screw 60 to 120 rpm, orbit 0.5 to 2 rpm', dopts: ['Bottom discharge through the cone outlet valve', 'Discharge through a split butterfly valve into a contained container', 'Manual discharge through the manway'], lump: 'No lump breaker' },
        { post: [
          { g: 'Duty', k: 'nbear', l: 'Screw support', t: 'sel', o: ['Bottom-free (no bottom bearing)', 'With bottom bearing'], d: 'Bottom-free (no bottom bearing)', drv: 1 },
          { g: 'Duty', k: 'hscrew', l: 'Screw heating', t: 'sel', o: ['Heated screw', 'Unheated screw'], d: 'Heated screw', drv: 1 },
          { g: 'Drive, sealing and handling', k: 'screw', l: 'Screw speed range', t: 'text', d: '60 to 120 rpm' },
          { g: 'Drive, sealing and handling', k: 'orbit', l: 'Orbit speed range', t: 'text', d: '0.5 to 2 rpm' }
        ] }) }, assemble(sec, type));
  })();

  /* ---------- Paddle dryer ---------- */
  (function () {
    var n = 'paddle dryer', sec = sections(n, {});
    var type = { t: 'Trough, paddles and throughput', c: [
      c('The dryer shall be a horizontal jacketed trough with twin counter-rotating shafts fitted with paddles at {rpm}, driven by {drive}. The paddles shall mix the product, move it along the trough and give a high heat transfer surface in a small volume.', M, DR),
      c('The paddles and shafts shall be hollow and heated with {jmed}, and the supplier shall state the heat transfer area per unit of working volume, the rotary joints and the leak detection for the shaft medium.', M, DR),
      c('The dryer shall run in {mode} mode. The supplier shall state the clearance between the paddles and the trough, the self-cleaning action and how build-up of sticky product is limited.', M, DR),
      c('In continuous mode the dryer shall process {feed} of wet cake with a mean residence time of {ret}, fed by {feeder}. The supplier shall state the residence time distribution, the feed method, the weir or discharge arrangement and how the bed depth is held steady.', M, 'Design review, FAT', true, function (v) { return /^Continuous/.test(v.mode); }),
      c('In batch mode the dryer shall be charged and discharged as stated for the batch size of {charge}. The supplier shall state the discharge arrangement and the product left after discharge.', M, DR, true, function (v) { return /^Batch/.test(v.mode); }),
      c('Each shaft shall pass through the trough ends with seals suited to vacuum, solvent vapour and fine dust. The supplier shall state the seal and purge arrangement and the expected leak rate.', M, DR),
      c('The trough shall have thermal expansion allowance for the shafts and paddles between cold and hot conditions, and the supplier shall state how paddle clearance is kept at the operating temperature.', S_, DR)
    ] };
    A.add('paddle', { cat: 'Drying', label: 'Paddle dryer', pfx: 'PAD', noun: n, varKey: 'mode',
      fields: fields({ tag: 'D-505 Paddle dryer', proc: 'Agrochemical technical wet with water', solv: 'Water', charge: '500', vol: '1500', bd: '900', lod0: '25', dtime: '6', tprod: '90', vac: '100', condq: '45', rpm: '5 to 30 rpm', dopts: ['Discharge through the bottom outlet valve', 'Discharge through a weir and rotary valve', 'Discharge through a split butterfly valve into a contained container'], lump: 'No lump breaker' },
        { post: [
          { g: 'Duty', k: 'mode', l: 'Operating mode', t: 'sel', o: ['Batch', 'Continuous'], d: 'Batch', drv: 1 },
          { g: 'Duty', k: 'feed', l: 'Wet cake feed rate (continuous)', t: 'num', u: 'kg/h', d: '150' },
          { g: 'Duty', k: 'ret', l: 'Mean residence time (continuous)', t: 'num', u: 'min', d: '90' },
          { g: 'Duty', k: 'feeder', l: 'Feeding method (continuous)', t: 'text', d: 'Screw feeder with a hopper and a nitrogen-purged seal' }
        ] }) }, assemble(sec, type));
  })();
});
