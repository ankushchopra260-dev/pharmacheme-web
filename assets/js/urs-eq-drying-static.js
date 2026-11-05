/* URS builder equipment module: static and air dryers (vacuum tray dryer, tray dryer, fluid bed dryer, spray dryer).
   Registers into the core builder in urs-builder.js. Clause wording is original and based on general engineering and GMP practice. */
(window.PCE_URS = window.PCE_URS || { q: [] }).q.push(function (A) {
  var c = A.c, M = A.M, S_ = A.S_, C_ = A.C_, DR = A.DR, FAT = A.FAT, SAT = A.SAT, DOC = A.DOC, YN = A.YN;
  var gmpOn = A.gmpOn, prodOn = A.prodOn, gmpProd = A.gmpProd, zoneOn = A.zoneOn, cipOn = A.cipOn;
  var flamYes = function (v) { return /^Yes/.test(v.flam); };
  var DRD = 'Design review, Documentation', DRF = 'Design review, FAT', DRS = 'Design review, SAT', FS = 'FAT, SAT', FD = 'FAT, Documentation';

  /* ====================================================================
     VTD: vacuum tray dryer
     ==================================================================== */
  A.add('vtd', {
    cat: 'Drying', label: 'VTD, vacuum tray dryer', pfx: 'VTD', noun: 'vacuum tray dryer', varKey: 'hmed',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'D-501 Vacuum tray dryer' },
      { g: 'Duty', k: 'prod', l: 'Product and solvent to be removed', t: 'text', d: 'API wet cake, residual methanol and water' },
      { g: 'Duty', k: 'batch', l: 'Wet cake charge per batch', t: 'num', u: 'kg', d: '120' },
      { g: 'Duty', k: 'bd', l: 'Bulk density of wet cake', t: 'num', u: 'kg/m³', d: '600' },
      { g: 'Duty', k: 'ldep', l: 'Maximum tray loading depth', t: 'num', u: 'mm', d: '25' },
      { g: 'Duty', k: 'lod', l: 'Initial volatile content of wet cake', t: 'num', u: '% w/w', d: '25' },
      { g: 'Duty', k: 'target', l: 'Final residual solvent and moisture target', t: 'text', d: 'Methanol below 3000 ppm, loss on drying below 0.5 %' },
      { g: 'Duty', k: 'time', l: 'Target drying time per batch', t: 'num', u: 'h', d: '16' },
      { g: 'Duty', k: 'tprod', l: 'Maximum permitted product temperature', t: 'num', u: '°C', d: '60' },
      { g: 'Design', k: 'shelves', l: 'Number of heated shelves', t: 'num', d: '12' },
      { g: 'Design', k: 'trays', l: 'Number of trays', t: 'num', d: '48' },
      { g: 'Design', k: 'area', l: 'Total heated shelf area', t: 'num', u: 'm²', d: '12' },
      { g: 'Design', k: 'hmed', l: 'Heating medium', t: 'sel', o: ['Hot water', 'Steam', 'Thermal fluid'], d: 'Hot water', drv: 1 },
      { g: 'Design', k: 'hmax', l: 'Heating medium inlet temperature', t: 'num', u: '°C', d: '90' },
      { g: 'Design', k: 'vac', l: 'Ultimate vacuum in the chamber', t: 'num', u: 'mbar(a)', d: '5' },
      { g: 'Design', k: 'dp', l: 'Chamber design pressure (positive)', t: 'num', u: 'barg', d: '1' },
      { g: 'Design', k: 'dt', l: 'Design temperature', t: 'num', u: '°C', d: '140' },
      { g: 'Design', k: 'door', l: 'Door arrangement', t: 'sel', o: ['Single door, front loading', 'Double door, barrier (pass-through)'], d: 'Single door, front loading', drv: 1 },
      { g: 'Vacuum and solvent recovery', k: 'vsrc', l: 'Vacuum source', t: 'sel', o: ['Dry screw vacuum pump', 'Liquid ring vacuum pump', 'Existing plant vacuum header'], d: 'Dry screw vacuum pump', drv: 1 },
      { g: 'Vacuum and solvent recovery', k: 'cond', l: 'Solvent condenser', t: 'sel', o: ['Shell and tube condenser, chilled water', 'Shell and tube condenser, brine'], d: 'Shell and tube condenser, chilled water' },
      { g: 'Vacuum and solvent recovery', k: 'brk', l: 'Vacuum break gas', t: 'sel', o: ['Nitrogen', 'Filtered air'], d: 'Nitrogen', drv: 1 }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The dryer shall dry {batch} of wet cake ({prod}) per batch, spread on trays to a depth of not more than {ldep}, from an initial volatile content of {lod} to the final target: {target}.', M, FD),
      c('The drying cycle shall be completed in not more than {time}, including heat-up and the final hold, when the heating medium is available at {hmax}.', M, FAT),
      c('The product temperature shall not exceed {tprod} at any tray position at any time, and the supplier shall state how the heating medium temperature is limited to guarantee this.', M, DRF),
      c('The shelf area of {area} on {shelves} shelves with {trays} trays shall give the required capacity at the stated loading depth, and the supplier shall state the basis of the drying time estimate.', M, DR),
      c('The chamber shall reach and hold an ultimate vacuum of {vac} when empty and dry, and shall reach the operating vacuum from atmospheric pressure within a time stated by the supplier.', M, FAT),
      c('The drying rate shall be uniform across all shelves and trays, and the supplier shall state the maximum difference in product temperature and in final dryness between the best and worst positions.', M, DRF),
      c('The dryer shall allow the vacuum to be broken with {brk}, at a controlled rate that does not disturb or blow the dry powder off the trays.', M, DR),
      c('The supplier shall state the rate of solvent vapour release at its peak and confirm that the condenser and the vacuum source are sized for it.', M, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The chamber and shelves shall be designed for full vacuum and for a positive pressure of {dp} at a design temperature of {dt}, to a recognised pressure vessel code stated by the supplier.', M, DOC),
      c('The shelves shall be flat and level within a tolerance stated by the supplier, with a surface that gives good contact with the trays, and shall not distort under vacuum, heat or the weight of the loaded trays.', M, DRF),
      c('The shelf spacing shall allow loading, unloading and visual inspection of each tray, and the clearance between trays and shelves shall be stated on the drawing.', S_, DR),
      c('Heating medium shall flow through each shelf in a way that gives an even shelf temperature, with no stagnant passage, and the shelf connections shall use flexible hoses or a header design that does not leak under thermal movement.', M, DR),
      c('The door shall seal under vacuum with a gasket suitable for the product and temperature, and shall be interlocked so that it cannot be opened while the chamber is under vacuum or above a stated temperature.', M, DRF),
      c('The door shall be a double-door (barrier) arrangement, with each side interlocked against the other, so that the dryer can be loaded from a lower-grade area and unloaded in a higher-grade or contained area.', M, DR, true, function (v) { return /^Double/.test(v.door); }),
      c('The chamber shall be drainable and sloped so that no condensate or cleaning liquid remains, and the vacuum and condenser connections shall be positioned to prevent product entrainment.', S_, DR),
      c('Sight glasses and lights, where fitted, shall withstand vacuum and temperature, shall be cleanable and shall not leave a shadow zone for inspection.', C_, DR, false)
    ] },
    { t: 'Heating system', c: [
      c('The shelves shall be heated by {hmed} at up to {hmax}, and the supplier shall state the heating medium flow, pressure drop and the number of shelf circuits.', M, DR),
      c('Steam shall be supplied through a pressure-reducing and condensate system that prevents the shelves from exceeding the maximum product temperature, and the supplier shall state how steam hammer and condensate backup are avoided.', M, DR, true, function (v) { return /^Steam/.test(v.hmed); }),
      c('Hot water shall be supplied from a closed, temperature-controlled loop, and the supplier shall state the loop flow and the control range needed to meet the cycle.', S_, DR, true, function (v) { return /^Hot water/.test(v.hmed); }),
      c('Thermal fluid shall be supplied from a closed loop at a controlled temperature, and the shelf design shall be suitable for the thermal fluid, with leak detection on the shelf circuit.', M, DR, true, function (v) { return /^Thermal/.test(v.hmed); }),
      c('The heating medium temperature shall be controlled in stages (a programmable ramp), so that the product is not overheated while the solvent load is highest.', S_, DR),
      c('A leak in a shelf shall be detectable, for example by a rise in chamber pressure or a loss of heating medium, and the supplier shall state how a leaking shelf is isolated.', S_, DR)
    ] },
    { t: 'Vacuum system and solvent recovery', c: [
      c('The vacuum shall be provided by: {vsrc}. The supplier shall state the capacity at the operating pressure and the pump-down time.', M, DR),
      c('A dry vacuum pump shall be protected against solvent condensate and powder carry-over, and the supplier shall state the pump discharge handling and the nitrogen purge arrangement.', M, DR, true, function (v) { return /^Dry/.test(v.vsrc); }),
      c('The solvent condenser ({cond}) shall be sized to condense the peak vapour flow at the operating vacuum, with a subcooled condensate going to a receiver that is drainable and vented to a safe location.', M, DR),
      c('A filter or demister between the chamber and the vacuum line shall protect the vacuum source from powder, and the supplier shall state how the filter is cleaned or replaced.', S_, DR),
      c('The vacuum line shall be designed to avoid cold spots where solvent can condense and flow back to the chamber.', S_, DR),
      c('The vacuum system shall be leak-tight, with a stated allowable leak rate (pressure rise test), checked at the factory and on site.', M, FS)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Product-contact parts (chamber, shelves, trays and door) shall be made of {moc} and shall be compatible with the product, the solvent and the cleaning agents.', M, DRD),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, and the supplier shall provide the measurement record.', M, FD, true, gmpProd),
      c('Product-contact welds shall be smooth and fully penetrated, with no crevices, and recorded on a weld map.', S_, DOC, true, prodOn),
      c('Gaskets and seals in contact with product or solvent vapour shall be non-shedding, non-reactive and compliant for pharmaceutical use, with a declaration for each material.', M, DOC, true, prodOn),
      c('Trays shall be made of the same material as the chamber or a compatible material, shall be free of seams that trap product, and shall have handles that are not in the product space.', S_, DR),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for pressure parts and product-contact parts.', S_, DOC)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The dryer shall be cleaned by {cleaning}. The chamber, shelves, trays and door seal shall be cleanable without dead legs, and the supplier shall state the cleaning method and the limits on temperature and chemicals.', M, 'Design review, SAT', true, function (v) { return !/^No cleaning/.test(v.cleaning); }),
      c('Spray devices and drains shall be arranged so that all shelf surfaces, the underside of each shelf and the door seal are reached, with no ponding after drain.', M, DRS, true, cipOn),
      c('The dryer and its trays shall be suitable for the cleaning and drying of trays in a separate washer, and the supplier shall state the tray size and weight for handling.', C_, DR, false),
      c('The dryer shall be suitable for {loc} installation, with insulation or guards to protect personnel from hot surfaces.', S_, DR),
      c('The supplier shall state the utility consumption (heating medium, cooling or brine for the condenser, nitrogen, compressed air and electrical power) per batch and the peak demand.', S_, DOC)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The dryer shall have a programmable control system for the heating profile, vacuum level and cycle time, with an alarm on deviation, and shall record the cycle data for batch records.', M, DRF),
      c('Temperature shall be measured in the chamber and on the heating medium, and the supplier shall offer product temperature probes (multi-point, at representative trays) for monitoring and for temperature mapping.', M, DR),
      c('The pressure in the chamber shall be measured by a vacuum gauge suitable for the solvent vapour, and a high-pressure alarm shall indicate a leak or loss of vacuum.', M, DR),
      c('The dryer shall have a solvent condensate level measurement in the receiver, with a high-level alarm that stops the cycle or alerts the operator.', S_, DR),
      c('The end of drying shall be decided by a stated method (for example a vacuum rise test or a weight or LOD check), and the supplier shall state the proposed method and its repeatability.', S_, DR),
      c('Access to the control system shall be controlled by user level, and electronic records shall have audit trail, time stamps and data integrity controls appropriate for GMP use.', M, DRD, true, gmpOn)
    ] },
    { t: 'Safety and hazardous area', c: [
      c('The dryer, vacuum pump, instruments and electrical equipment shall be certified for {zone}, with the gas group and temperature class stated by the user.', M, DOC, true, zoneOn),
      c('The dryer and all conductive parts shall be bonded and earthed, and the supplier shall state any isolated parts.', M, SAT, true, zoneOn),
      c('The vacuum break shall use nitrogen so that the chamber is not exposed to an air and solvent mixture while hot, and the supplier shall state the nitrogen demand.', M, DR, true, function (v) { return /^Nitrogen/.test(v.brk) && zoneOn(v); }),
      c('A pressure relief or burst device shall protect the chamber against over-pressure from a failure of the vacuum break or the heating medium, with the discharge routed to a safe location.', M, DR),
      c('The dryer shall have a safeguard that prevents the door opening while the chamber contains solvent vapour above a stated level or is under vacuum.', M, DRF)
    ] },
    { t: 'Documentation and qualification', c: [
      c('The supplier shall provide a datasheet, general arrangement and shelf drawings, a P&ID, design calculations, material certificates, an operation and maintenance manual and a recommended spare parts list.', M, DOC),
      c('The supplier shall support design, installation and operational qualification (DQ, IQ and OQ) by providing the documents and traceability needed for the user’s protocols.', M, DOC, true, gmpOn),
      c('The supplier shall provide a compliance statement against this URS, listing every deviation.', M, DR, true, gmpOn),
      c('The supplier shall provide a temperature mapping protocol (loaded and empty) for the performance qualification, giving the number and position of probes and the acceptance limits.', S_, DOC, true, gmpOn),
      c('Control software shall be supplied with a software design specification, a functional test record and a backup copy, for validation in line with the user’s computerised system procedure.', S_, DOC, true, gmpOn)
    ] },
    { t: 'Testing: FAT and SAT', c: [
      c('The factory acceptance test shall include a hydrostatic or pneumatic pressure test, a vacuum leak rate test, a door interlock check, a shelf heating test and a dimensional check, and shall be available for the user to witness.', M, FAT),
      c('The product-contact surface finish, drainability and the shelf flatness shall be verified at the factory acceptance test.', S_, FAT, true, gmpProd),
      c('The site acceptance test shall include a check of utilities and connections against the P&ID, a vacuum leak test, a safety interlock test and an empty-chamber temperature check.', M, SAT),
      c('The user may request a heat-up and drying trial with a placebo or a water load, at the supplier or on site, to verify the cycle time and uniformity before product is introduced.', C_, FS, false)
    ] },
    { t: 'Spares, delivery and warranty', c: [
      c('The supplier shall provide a recommended spare parts list, including gaskets, door seals, shelf hoses and instruments, with lead times.', S_, DOC),
      c('Delivery shall be within {delivery}, and the supplier shall state any items that have a longer lead time.', S_, DOC),
      c('The warranty shall be {warranty}, and the supplier shall state any items excluded from the warranty and the service response time.', S_, DOC)
    ] }
  ]);

  /* ====================================================================
     TD: tray dryer (hot air)
     ==================================================================== */
  A.add('td', {
    cat: 'Drying', label: 'TD, tray dryer (hot air)', pfx: 'TDR', noun: 'hot air tray dryer', varKey: 'htype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'D-511 Tray dryer' },
      { g: 'Duty', k: 'prod', l: 'Product to be dried', t: 'text', d: 'Intermediate cake, water-wet' },
      { g: 'Duty', k: 'flam', l: 'Flammable solvent in the product', t: 'sel', o: ['Yes (solvent-wet product)', 'No (water only)'], d: 'No (water only)', drv: 1 },
      { g: 'Duty', k: 'batch', l: 'Wet product charge per batch', t: 'num', u: 'kg', d: '200' },
      { g: 'Duty', k: 'ldep', l: 'Maximum tray loading depth', t: 'num', u: 'mm', d: '30' },
      { g: 'Duty', k: 'lod', l: 'Initial moisture content', t: 'num', u: '% w/w', d: '30' },
      { g: 'Duty', k: 'target', l: 'Final moisture target', t: 'text', d: 'Loss on drying below 1.0 %' },
      { g: 'Duty', k: 'time', l: 'Target drying time per batch', t: 'num', u: 'h', d: '12' },
      { g: 'Duty', k: 'tmax', l: 'Maximum air temperature', t: 'num', u: '°C', d: '90' },
      { g: 'Duty', k: 'tprod', l: 'Maximum permitted product temperature', t: 'num', u: '°C', d: '70' },
      { g: 'Design', k: 'shelves', l: 'Number of shelf levels', t: 'num', d: '16' },
      { g: 'Design', k: 'trays', l: 'Number of trays', t: 'num', d: '96' },
      { g: 'Design', k: 'area', l: 'Total tray area', t: 'num', u: 'm²', d: '24' },
      { g: 'Design', k: 'htype', l: 'Air heater', t: 'sel', o: ['Steam coil', 'Hot water coil', 'Electric heater', 'Thermal fluid coil'], d: 'Steam coil', drv: 1 },
      { g: 'Design', k: 'air', l: 'Air arrangement', t: 'sel', o: ['Recirculation with fresh air make-up', 'Once-through (100 % fresh air)'], d: 'Recirculation with fresh air make-up', drv: 1 },
      { g: 'Design', k: 'vel', l: 'Air velocity over the trays', t: 'num', u: 'm/s', d: '1.5' },
      { g: 'Design', k: 'flow', l: 'Total circulating air flow', t: 'num', u: 'm³/h', d: '6000' },
      { g: 'Design', k: 'uni', l: 'Maximum temperature spread across the trays', t: 'num', u: '°C', d: '3' },
      { g: 'Design', k: 'filt', l: 'Air filtration', t: 'sel', o: ['Fresh air: G4, F7 and HEPA H14', 'Fresh air: G4 and F7 only'], d: 'Fresh air: G4, F7 and HEPA H14', drv: 1 },
      { g: 'Design', k: 'exh', l: 'Exhaust treatment', t: 'sel', o: ['Exhaust to scrubber or vent header', 'Exhaust to atmosphere via stack'], d: 'Exhaust to atmosphere via stack' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The dryer shall dry {batch} of {prod} per batch, loaded on trays to a depth of not more than {ldep}, from an initial moisture content of {lod} to the final target: {target}.', M, FD),
      c('The drying cycle shall be completed in not more than {time} at a maximum air temperature of {tmax}, and the product temperature shall not exceed {tprod}.', M, FAT),
      c('The dryer shall circulate {flow} of air with a velocity of {vel} over the trays, and the supplier shall state how this is verified at each tray level.', M, DRF),
      c('The temperature across all trays shall not differ by more than {uni} during the steady drying phase, when loaded to the stated capacity, and the supplier shall state the expected difference.', M, FAT),
      c('Airflow over the trays shall be uniform, with no short-circuiting past the trays and no dead zone behind the door or the rear wall, and the supplier shall state how this is achieved (baffles, plenum or damper design).', M, DR),
      c('The tray area of {area} on {shelves} levels with {trays} trays shall deliver the stated capacity, and the supplier shall state the basis for the drying time.', M, DR),
      c('The dryer shall allow a stated drying profile (temperature and air flow stages) to be set and repeated for each product, with the profile recorded in the batch record.', M, DR),
      c('The supplier shall state the humidity of the exhaust air during the drying cycle and the water or solvent removal rate at the peak, and shall show that the air handling is sized for it.', S_, DR)
    ] },
    { t: 'Air handling and heating', c: [
      c('The air shall be heated by: {htype}. The supplier shall state the heating capacity and the control range, and shall show that the heater can reach {tmax} within a stated time.', M, DR),
      c('The air arrangement shall be: {air}. The supplier shall state the ratio of fresh to recirculated air and how it changes through the cycle.', M, DR),
      c('Steam coils shall be fitted with a condensate removal system and protected against frost and water hammer, and the supplier shall state the steam consumption at peak.', M, DR, true, function (v) { return /^Steam/.test(v.htype); }),
      c('Electric heaters shall have a separate over-temperature protection device that is independent of the control loop, and shall be suitable for the hazardous area where one is stated.', M, DR, true, function (v) { return /^Electric/.test(v.htype); }),
      c('The fan shall be sized for the pressure drop of the filters, the heater and the trays at the highest loading, with a stated margin, and a damper or inverter shall allow the air flow to be adjusted.', M, DR),
      c('Fresh air shall pass through {filt}, with the filter ratings and the change-out arrangement shown on the drawing, and a differential pressure gauge across each filter stage.', M, DR),
      c('Recirculated air shall pass through a filter that protects the heater and the fan from product dust, and the supplier shall state how the filter is cleaned or replaced.', S_, DR, true, function (v) { return /^Recirc/.test(v.air); }),
      c('The exhaust shall be handled as follows: {exh}. The supplier shall state any dust filter, the exhaust flow and the stack height or connection requirement.', M, DR),
      c('The air ducts shall be smooth, drainable and cleanable, with access hatches for inspection and cleaning, and no horizontal runs where condensate or dust can collect.', S_, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The chamber shall be of insulated, sealed construction with panels that are flush inside, free of crevices and suitable for cleaning, and the supplier shall state the insulation material and thickness.', M, DR),
      c('The door shall seal against air leakage, shall be interlocked with the fan so that it cannot be opened with the fan running (or the fan stops when it is opened), and shall have a heat-resistant gasket.', M, DRF),
      c('The trays shall be of the same material as the chamber or a compatible material, shall fit the shelf guides and the trolley (where used), and shall be handled without damaging the product.', S_, DR),
      c('The dryer shall have a trolley or rack system for loading, if stated by the user, with brakes, wheel material that is suitable for the cleanroom and a locating guide into the chamber.', C_, DR, false),
      c('The base shall be designed for the loaded weight, with levelling feet or a plinth, and the floor loading shall be stated on the drawing.', S_, DR)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Product-contact parts (chamber interior, shelves, trays and air path) shall be made of {moc} and shall be compatible with the product and the cleaning agents.', M, DRD),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, and the supplier shall provide the measurement record.', M, FD, true, gmpProd),
      c('Product-contact welds shall be smooth and fully penetrated, with no crevices, and recorded on a weld map.', S_, DOC, true, prodOn),
      c('Gaskets and seals in the product zone shall be non-shedding and suitable for the temperature, with a compliance declaration for each material.', M, DOC, true, prodOn),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for the product-contact parts.', S_, DOC)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The dryer shall be cleaned by {cleaning}. The chamber, trays and ducts shall be cleanable, and the supplier shall state the cleaning method and any limits.', M, 'Design review, SAT', true, function (v) { return !/^No cleaning/.test(v.cleaning); }),
      c('The chamber shall be washable, with a floor drain and a sloped base, so that wash water does not remain in the dryer.', S_, DR, true, cipOn),
      c('The dryer shall be suitable for {loc} installation, with insulation or guards to protect personnel from hot surfaces.', S_, DR),
      c('The supplier shall state the utility consumption (heating medium, compressed air for dampers and electrical power) per batch and at peak.', S_, DOC)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The dryer shall have a programmable control system for temperature, air flow and time, with an alarm on deviation from the profile, and shall record the cycle data for batch records.', M, DRF),
      c('Air temperature shall be measured at the supply, the return and the exhaust, and the supplier shall offer product temperature probes at representative trays for monitoring and mapping.', M, DR),
      c('Differential pressure across each filter shall be monitored with an alarm at a high value, and air flow shall be measured or inferred from the fan, with an alarm on low flow.', M, DR),
      c('Humidity of the exhaust or return air should be measured, so that the end of drying can be indicated, and the supplier shall state the proposed method.', C_, DR, false),
      c('Access to the control system shall be controlled by user level, and electronic records shall have audit trail, time stamps and data integrity controls appropriate for GMP use.', M, DRD, true, gmpOn)
    ] },
    { t: 'Safety and hazardous area', c: [
      c('The dryer shall be suitable for solvent-wet product: the air flow shall dilute solvent vapour to well below the lower explosive limit (a stated safety margin) at all times, and the supplier shall state the calculation and the fresh air rate needed.', M, DR, true, flamYes),
      c('Solvent vapour shall be monitored in the exhaust or chamber by a measuring device with alarms, and the dryer shall stop heating and increase fresh air on a high reading.', M, DRF, true, flamYes),
      c('The chamber shall have explosion relief panels or an equivalent device sized for the stated solvent and dust, and the discharge shall be directed to a safe location.', M, DR, true, flamYes),
      c('The dryer shall be interlocked so that the heater cannot operate without sufficient air flow, and the fan shall stop and the heater shall switch off on a high air temperature.', M, DRF),
      c('An independent high-temperature cut-out, separate from the control loop, shall protect the product and the chamber from over-heating.', M, DRF),
      c('The dryer and all electrical and instrument equipment shall be certified for {zone}, with the gas group and temperature class stated by the user.', M, DOC, true, zoneOn),
      c('The dryer, trays and trolley shall be bonded and earthed, and the supplier shall state any parts that could be isolated.', M, SAT, true, zoneOn)
    ] },
    { t: 'Documentation and qualification', c: [
      c('The supplier shall provide a datasheet, general arrangement and air flow drawings, a P&ID, design calculations, filter certificates, material certificates, an operation and maintenance manual and a recommended spare parts list.', M, DOC),
      c('The supplier shall support design, installation and operational qualification (DQ, IQ and OQ) by providing the documents and traceability needed for the user’s protocols.', M, DOC, true, gmpOn),
      c('The supplier shall provide a compliance statement against this URS, listing every deviation.', M, DR, true, gmpOn),
      c('The supplier shall provide a temperature mapping protocol (empty and loaded) for the performance qualification, giving the number and position of probes, the load pattern and the acceptance limits.', S_, DOC, true, gmpOn),
      c('HEPA filter integrity test certificates and the test method (for example a smoke or aerosol challenge) shall be provided for the filters in the product air path.', M, DOC, true, function (v) { return gmpOn(v) && /HEPA/.test(v.filt); })
    ] },
    { t: 'Testing: FAT and SAT', c: [
      c('The factory acceptance test shall include a leak check of the chamber, an air flow and velocity check, a door and fan interlock check, a heater and temperature control test and a dimensional check, and shall be available for the user to witness.', M, FAT),
      c('The product-contact surface finish and the drainability shall be verified at the factory acceptance test.', S_, FAT, true, gmpProd),
      c('The site acceptance test shall include a check of utilities and connections against the P&ID, a filter integrity test, an air flow check, a safety interlock test and an empty-chamber temperature distribution test.', M, SAT),
      c('The user may request a trial with a water load or a placebo to verify the cycle time and uniformity before product is introduced.', C_, FS, false)
    ] },
    { t: 'Spares, delivery and warranty', c: [
      c('The supplier shall provide a recommended spare parts list, including filters, gaskets, fan belts or bearings, sensors and heater elements, with lead times.', S_, DOC),
      c('Delivery shall be within {delivery}, and the supplier shall state any items that have a longer lead time.', S_, DOC),
      c('The warranty shall be {warranty}, and the supplier shall state any items excluded from the warranty and the service response time.', S_, DOC)
    ] }
  ]);

  /* ====================================================================
     FBD: fluid bed dryer (with optional top-spray granulation)
     ==================================================================== */
  A.add('fbd', {
    cat: 'Drying', label: 'FBD, fluid bed dryer', pfx: 'FBD', noun: 'fluid bed dryer', varKey: 'ftype',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'D-521 Fluid bed dryer' },
      { g: 'Duty', k: 'ftype', l: 'Dryer type', t: 'sel', o: ['Dryer only', 'Top-spray granulator and dryer'], d: 'Dryer only', drv: 1 },
      { g: 'Duty', k: 'prod', l: 'Product to be dried or granulated', t: 'text', d: 'Wet granules, water-based binder' },
      { g: 'Duty', k: 'batch', l: 'Working batch size', t: 'num', u: 'kg', d: '150' },
      { g: 'Duty', k: 'bd', l: 'Bulk density of the product', t: 'num', u: 'kg/m³', d: '500' },
      { g: 'Duty', k: 'vol', l: 'Product container volume', t: 'num', u: 'L', d: '600' },
      { g: 'Duty', k: 'lod', l: 'Initial moisture content', t: 'num', u: '% w/w', d: '18' },
      { g: 'Duty', k: 'target', l: 'Final moisture target', t: 'text', d: 'Loss on drying 2.0 to 3.0 %' },
      { g: 'Duty', k: 'time', l: 'Target drying time per batch', t: 'num', u: 'min', d: '45' },
      { g: 'Duty', k: 'tin', l: 'Inlet air temperature range', t: 'text', d: '30 to 90 °C' },
      { g: 'Duty', k: 'tprod', l: 'Maximum permitted product temperature', t: 'num', u: '°C', d: '45' },
      { g: 'Design', k: 'flow', l: 'Maximum process air flow', t: 'num', u: 'm³/h', d: '3000' },
      { g: 'Design', k: 'ahu', l: 'Air source', t: 'sel', o: ['Dedicated air handling unit with heating and dehumidification', 'Heated, filtered air only'], d: 'Dedicated air handling unit with heating and dehumidification', drv: 1 },
      { g: 'Design', k: 'hand', l: 'Product handling', t: 'sel', o: ['Trolley (container) with lift', 'Fixed bowl with discharge'], d: 'Trolley (container) with lift', drv: 1 },
      { g: 'Design', k: 'bag', l: 'Exhaust filter', t: 'sel', o: ['Bag filter with shaking', 'Cartridge filter with pulse cleaning'], d: 'Bag filter with shaking' },
      { g: 'Design', k: 'noz', l: 'Number of spray nozzles', t: 'num', d: '3', sh: function (v) { return /^Top/.test(v.ftype); } },
      { g: 'Design', k: 'spr', l: 'Binder spray rate range', t: 'text', d: '100 to 500 g/min', sh: function (v) { return /^Top/.test(v.ftype); } },
      { g: 'Safety', k: 'exp', l: 'Explosion protection', t: 'sel', o: ['Explosion vent panels, pressure shock resistant to the venting pressure', 'Explosion suppression and isolation', 'Not required (water-based, non-explosive dust)'], d: 'Not required (water-based, non-explosive dust)', drv: 1 },
      { g: 'Safety', k: 'psh', l: 'Pressure shock resistance of the vessel', t: 'num', u: 'barg', d: '1', sh: function (v) { return !/^Not required/.test(v.exp); } },
      { g: 'Safety', k: 'dust', l: 'Dust explosion class and solvent used', t: 'text', d: 'Dust class St 1, no flammable solvent' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The dryer shall dry a working batch of {batch} of {prod} in a container of {vol}, from an initial moisture content of {lod} to the final target: {target}.', M, FD),
      c('The drying time shall be not more than {time} with inlet air in the range {tin}, and the product temperature shall not exceed {tprod}.', M, FAT),
      c('The process air flow shall be adjustable up to {flow}, with the flow held within a stated tolerance at the set value as the filter pressure drop changes during the cycle.', M, DRF),
      c('The product shall fluidise evenly with no dead zones, channelling or caking on the screen, and the supplier shall state how the air distribution plate is designed for the bulk density of {bd}.', M, DRF),
      c('The final moisture and the temperature of the product shall be uniform from the top to the bottom of the bed, and the supplier shall state the expected spread and the method for checking it.', M, FAT),
      c('The dryer shall allow staged drying profiles (inlet temperature and air flow steps), stored as a recipe and recorded in the batch record.', M, DR),
      c('The dryer shall limit attrition of the granules and the generation of fines, and the supplier shall state the maximum air velocity and the allowed range for the bed height.', S_, DR),
      c('The supplier shall state the expected product carry-over to the filter and the proposed measures to return or contain the fines.', S_, DR)
    ] },
    { t: 'Granulation (top spray)', c: [
      c('The top-spray system shall have {noz} nozzles supplying binder at {spr}, with a pump and flow measurement, and the supplier shall state the droplet size range and the spray pattern.', M, DR, true, function (v) { return /^Top/.test(v.ftype); }),
      c('The spray system shall have atomising air (pressure and flow measured and controlled), a nozzle position that is adjustable and repeatable, and a way to prevent the nozzles from clogging when the spray stops.', M, DR, true, function (v) { return /^Top/.test(v.ftype); }),
      c('The spray rate shall be controlled by a flow measurement and the binder line shall be cleanable, with no dead legs from the pump to the nozzle.', M, DR, true, function (v) { return /^Top/.test(v.ftype); }),
      c('The supplier shall state the means of preventing wet spray from reaching the wall or the filter, such as shaking the filter or controlling the bed moisture, and shall state the filter protection during spraying.', S_, DR, true, function (v) { return /^Top/.test(v.ftype); }),
      c('The binder or spray system shall allow in-line cleaning of the spray lines without removing the nozzles, using the cleaning method specified for the equipment.', S_, DR, false, function (v) { return /^Top/.test(v.ftype); })
    ] },
    { t: 'Air handling system', c: [
      c('Process air shall be supplied by: {ahu}, with filters ahead of the heater and fine or HEPA filtration before the product bowl, as agreed with the user.', M, DR),
      c('The air handling unit shall control inlet air temperature and humidity (dew point) to the stated range, and shall be designed so that dehumidification keeps the process stable in all seasons at the site.', M, DR, true, function (v) { return /Dedicated/.test(v.ahu); }),
      c('The supplier shall state the pressure drop across each filter stage when clean and at the alarm level, and the fan margin available for the dirty-filter condition.', M, DR),
      c('The exhaust filter shall be a {bag}. It shall retain the product dust to the level stated by the supplier and shall be cleaned during the cycle without losing the bed, and a differential pressure alarm shall indicate blockage.', M, DR),
      c('The exhaust filter material shall be anti-static and suitable for the product and solvent, and the supplier shall state how the filter is changed without exposing the operator to the product.', M, DR),
      c('The exhaust duct shall be designed for the stated dust load and condensate, and shall be drainable and cleanable, with no horizontal run where product can settle.', S_, DR)
    ] },
    { t: 'Mechanical design and construction', c: [
      c('The dryer shall have a product container, expansion chamber and filter housing that seal against the air path with an inflatable or compression seal, and the supplier shall state the seal material and the pressure applied.', M, DR),
      c('The air distribution plate (screen) shall be designed to give even fluidisation of the product, shall be easily removable for cleaning, and shall not retain product in its holes or mesh.', M, DR),
      c('The product container with the handling system ({hand}) shall be moved, lifted and docked safely, with an interlock that prevents operation unless the container is sealed in position.', M, DRF),
      c('The container shall be discharged without product loss, and the supplier shall state the method (tilt, bottom discharge or vacuum transfer) and the residual product after discharge.', S_, DR),
      c('The expansion chamber shall be designed for the stated explosion protection and shall have inspection windows or sight glasses that are cleanable and safe.', S_, DR),
      c('The vessel shall be designed so that product does not collect on internal ledges, and all inner surfaces shall be accessible for cleaning and visual inspection.', M, DR, true, prodOn)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Product-contact parts shall be made of {moc} and shall be compatible with the product, the binder and the cleaning agents.', M, DRD),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, and the supplier shall provide the measurement record.', M, FD, true, gmpProd),
      c('Product-contact welds shall be smooth and fully penetrated, with no crevices, and recorded on a weld map.', S_, DOC, true, prodOn),
      c('Seals, gaskets, filter bags and sight glass materials in contact with product shall be non-shedding and non-reactive, with a compliance declaration for each material.', M, DOC, true, prodOn),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for the product-contact parts.', S_, DOC)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The dryer shall be cleaned by {cleaning}. The container, plate, expansion chamber and filter housing shall be cleanable, and the supplier shall state the cleaning method, including the washing of filter bags or cartridges.', M, 'Design review, SAT', true, function (v) { return !/^No cleaning/.test(v.cleaning); }),
      c('Wash nozzles shall cover all product-contact surfaces, including the underside of the plate and the filter, and the cleaning water shall drain completely without ponding.', M, DRS, true, cipOn),
      c('The dryer shall be suitable for {loc} installation, with guards or insulation to protect personnel from hot surfaces and from moving parts.', S_, DR),
      c('The supplier shall state the utility consumption (steam or other heating medium, chilled water or dehumidification, compressed air and electrical power) per batch and at peak.', S_, DOC)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The dryer shall have a programmable control system for air flow, temperature, spray (where fitted) and cycle time, with alarms on deviation, and shall record the cycle data for batch records.', M, DRF),
      c('Inlet air temperature, product temperature (bed), exhaust temperature, differential pressure across the bed and the filter, and air flow shall be measured and recorded.', M, DR),
      c('The dryer shall be fitted with a measurement of the product moisture (for example from the exhaust air humidity), and the supplier shall state the proposed method and its repeatability.', S_, DR),
      c('The control system shall interlock the heater with the air flow, stop the cycle on a blocked filter or low air flow, and prevent the cycle from starting if the container is not sealed.', M, DRF),
      c('Access to the control system shall be controlled by user level, and electronic records shall have audit trail, time stamps and data integrity controls appropriate for GMP use.', M, DRD, true, gmpOn)
    ] },
    { t: 'Safety, static and hazardous area', c: [
      c('The dryer shall have explosion protection as follows: {exp}. The supplier shall state the design basis (dust explosion parameters such as Kst and Pmax, and the venting or suppression sizing).', M, DR, true, function (v) { return !/^Not required/.test(v.exp); }),
      c('The vessel and ducting shall be pressure shock resistant to {psh}, and the vent panels shall discharge to a safe location, with the vent duct sized and supported as stated by the supplier.', M, DR, true, function (v) { return /vent/i.test(v.exp); }),
      c('The explosion isolation (for example valves or barriers) shall prevent the propagation of an explosion into the air handling unit and the ducting, and the supplier shall state the response time and the validation of the isolation.', M, DR, true, function (v) { return /isolation/i.test(v.exp); }),
      c('All conductive parts, the container, the filter housing and the filter bags (where anti-static) shall be bonded and earthed, with an earth check before each run, and the supplier shall state how the static charge from the fluidising product is controlled.', M, SAT),
      c('The container docking shall include an earthing check that stops the cycle if the earth continuity is lost.', S_, DRF, true, zoneOn),
      c('The dryer and all electrical and instrument equipment shall be certified for {zone}, with the dust and gas group and temperature class stated by the user (known explosive properties: {dust}).', M, DOC, true, zoneOn),
      c('The dryer shall be protected against over-temperature, with an independent cut-out, and against loss of air flow with an interlock that stops the heater.', M, DRF)
    ] },
    { t: 'Documentation and qualification', c: [
      c('The supplier shall provide a datasheet, general arrangement drawings, a P&ID, design calculations, an explosion protection concept (where applicable), filter and material certificates, an operation and maintenance manual and a spare parts list.', M, DOC),
      c('The supplier shall support design, installation and operational qualification (DQ, IQ and OQ) by providing the documents and traceability needed for the user’s protocols.', M, DOC, true, gmpOn),
      c('The supplier shall provide a compliance statement against this URS, listing every deviation.', M, DR, true, gmpOn),
      c('The supplier shall provide a bed temperature mapping and air flow verification protocol for the performance qualification, with the acceptance limits.', S_, DOC, true, gmpOn),
      c('HEPA filter integrity test certificates shall be provided for any HEPA filters in the process air path.', M, DOC, true, gmpOn)
    ] },
    { t: 'Testing: FAT and SAT', c: [
      c('The factory acceptance test shall include a leak test of the air path, container sealing, interlock checks (container, air flow, temperature), an air distribution check and a functional test of the control system, and shall be available for the user to witness.', M, FAT),
      c('The factory acceptance test shall include a water-spray test of the nozzles (where fitted) to verify the spray pattern and the rate control.', S_, FAT, true, function (v) { return /^Top/.test(v.ftype); }),
      c('The product-contact surface finish, the drainability and the filter cleaning shall be verified at the factory acceptance test.', S_, FAT, true, gmpProd),
      c('The site acceptance test shall include a check of utilities and connections against the P&ID, an air flow and filter integrity check, an earth continuity check, a safety interlock test and a drying run with a placebo load.', M, SAT)
    ] },
    { t: 'Spares, delivery and warranty', c: [
      c('The supplier shall provide a recommended spare parts list, including filter bags or cartridges, seals, spray nozzles (where fitted), the screen and sensors, with lead times.', S_, DOC),
      c('Delivery shall be within {delivery}, and the supplier shall state any items that have a longer lead time.', S_, DOC),
      c('The warranty shall be {warranty}, and the supplier shall state any items excluded from the warranty and the service response time.', S_, DOC)
    ] }
  ]);

  /* ====================================================================
     SPD: spray dryer
     ==================================================================== */
  A.add('spray', {
    cat: 'Drying', label: 'Spray dryer', pfx: 'SPD', noun: 'spray dryer', varKey: 'gas',
    fields: [
      { g: 'Duty', k: 'tag', l: 'Equipment tag and name', t: 'text', d: 'D-531 Spray dryer' },
      { g: 'Duty', k: 'feed', l: 'Feed material and solvent', t: 'text', d: 'API solution in aqueous ethanol' },
      { g: 'Duty', k: 'flam', l: 'Flammable solvent in the feed', t: 'sel', o: ['Yes (organic solvent)', 'No (water only)'], d: 'No (water only)', drv: 1 },
      { g: 'Duty', k: 'solids', l: 'Feed solids content', t: 'num', u: '% w/w', d: '20' },
      { g: 'Duty', k: 'fvisc', l: 'Feed viscosity', t: 'num', u: 'cP', d: '50' },
      { g: 'Duty', k: 'feedr', l: 'Feed rate', t: 'num', u: 'kg/h', d: '100' },
      { g: 'Duty', k: 'evap', l: 'Evaporation capacity', t: 'num', u: 'kg/h', d: '80' },
      { g: 'Duty', k: 'out', l: 'Powder output', t: 'num', u: 'kg/h', d: '20' },
      { g: 'Duty', k: 'psd', l: 'Target particle size (d50)', t: 'num', u: 'µm', d: '30' },
      { g: 'Duty', k: 'moist', l: 'Residual moisture or solvent target', t: 'text', d: 'Moisture below 2 %, ethanol below 3000 ppm' },
      { g: 'Duty', k: 'tin', l: 'Inlet gas temperature', t: 'num', u: '°C', d: '180' },
      { g: 'Duty', k: 'tout', l: 'Outlet gas temperature', t: 'num', u: '°C', d: '80' },
      { g: 'Duty', k: 'tprod', l: 'Maximum permitted product temperature', t: 'num', u: '°C', d: '70' },
      { g: 'Design', k: 'gas', l: 'Drying gas system', t: 'sel', o: ['Open cycle (heated air)', 'Closed cycle (nitrogen with solvent recovery)'], d: 'Open cycle (heated air)', drv: 1 },
      { g: 'Design', k: 'flow', l: 'Drying gas flow', t: 'num', u: 'm³/h', d: '1500' },
      { g: 'Design', k: 'atom', l: 'Atomiser', t: 'sel', o: ['Two-fluid nozzle', 'Pressure nozzle', 'Rotary atomiser'], d: 'Two-fluid nozzle', drv: 1 },
      { g: 'Design', k: 'coll', l: 'Powder collection', t: 'sel', o: ['Cyclone and bag filter', 'Cyclone only', 'Bag filter only'], d: 'Cyclone and bag filter', drv: 1 },
      { g: 'Design', k: 'cont', l: 'Containment of the powder', t: 'text', d: 'Occupational exposure band 4, closed discharge into a contained container' },
      { g: 'Safety', k: 'exp', l: 'Explosion protection', t: 'sel', o: ['Explosion vent panels and isolation', 'Explosion suppression and isolation', 'Not required (water-based, non-explosive powder)'], d: 'Not required (water-based, non-explosive powder)', drv: 1 },
      { g: 'Safety', k: 'dp', l: 'Chamber design pressure (shock resistance)', t: 'num', u: 'barg', d: '0.5' }
    ]
  }, [
    { t: 'Process and performance requirements', c: [
      c('The dryer shall dry {feed}, with a feed solids content of {solids} and a viscosity of {fvisc}, at a feed rate of {feedr}, to produce {out} of powder with a median particle size of {psd}.', M, FAT),
      c('The dryer shall evaporate {evap} of solvent at an inlet gas temperature of {tin} and an outlet gas temperature of {tout}, and the supplier shall state the heat and mass balance on which this is based.', M, DRF),
      c('The product temperature shall not exceed {tprod} at any stage, and the supplier shall state the expected product temperature profile and how thermal degradation is avoided.', M, DR),
      c('The powder shall meet the residual moisture and solvent target: {moist}. The supplier shall state the proposed secondary drying step if the target cannot be met in the dryer alone.', M, FAT),
      c('The dryer shall produce powder of a consistent particle size, bulk density and morphology, and the supplier shall state the operating variables (feed rate, atomising pressure or speed, inlet temperature) that control them.', M, DR),
      c('The drying chamber shall have no wall deposit that builds up and falls off as lumps during a run, and the supplier shall state the means of limiting wall sticking (for example air sweep, wall cooling or hammers).', M, DR),
      c('The dryer shall operate stably from start-up on solvent only (or water) to full feed and shall shut down safely on a failure, with the supplier stating the start-up and shut-down sequence.', M, DR),
      c('The dryer shall allow a campaign of at least the duration stated by the user without stopping for cleaning, and the supplier shall state the expected duration at the stated feed.', S_, DR)
    ] },
    { t: 'Atomisation and feed system', c: [
      c('The atomiser shall be: {atom}. The supplier shall state the droplet size range, the operating pressure or speed range and the feed capacity at each setting.', M, DR),
      c('The nozzle shall be accessible and replaceable without opening the chamber to the product, and the supplier shall state the nozzle material, orifice size options and the expected life with the product.', M, DR, true, function (v) { return /nozzle/i.test(v.atom); }),
      c('The rotary atomiser shall have a drive speed range and a sealed bearing and lubrication system that cannot contaminate the product, with vibration monitoring and an interlock on high vibration.', M, DR, true, function (v) { return /^Rotary/.test(v.atom); }),
      c('The feed system shall include a feed tank (or connection to one), a metering pump, a filter and a flow meter, with the feed lines cleanable and with no dead legs.', M, DR),
      c('The feed line shall be flushed with solvent or water at start-up and shut-down without sending liquid to the chamber at a rate that wets the walls, and the supplier shall state the flush procedure.', M, DR),
      c('Feed temperature control (heating or cooling) shall be provided where the feed viscosity or stability depends on temperature, as stated by the user.', C_, DR, false)
    ] },
    { t: 'Drying gas system', c: [
      c('The drying gas system shall be: {gas}. The supplier shall state the gas flow of {flow}, the heater type and capacity, and the control range of the inlet temperature.', M, DR),
      c('Process air shall pass through filters (up to HEPA grade where the product requires it) before the heater and the chamber, and a differential pressure gauge shall be fitted across each filter stage.', M, DR, true, function (v) { return /^Open/.test(v.gas); }),
      c('The closed cycle shall use nitrogen with an oxygen analyser, a scrubber or condenser to remove the solvent, a gas cooler, a blower, a heater and a make-up and bleed system, and the supplier shall state the oxygen limit and the response when it is exceeded.', M, DR, true, function (v) { return /^Closed/.test(v.gas); }),
      c('The solvent recovery condenser or scrubber shall be sized for the peak solvent load, with the recovered solvent collected in a vented, drainable receiver, and the supplier shall state the recovery efficiency.', M, DR, true, function (v) { return /^Closed/.test(v.gas); }),
      c('The exhaust shall be treated and discharged as the user requires (for example scrubbed or via a final filter), and the supplier shall state the exhaust flow, temperature, dust loading and the connection requirements.', M, DR),
      c('The fan or blower shall maintain a slight negative pressure in the chamber (or the pressure stated by the user), and the pressure shall be controlled automatically as the filter pressure drop changes.', M, DR)
    ] },
    { t: 'Chamber, powder collection and containment', c: [
      c('The drying chamber shall be designed so that droplets dry before reaching the wall, with a chamber diameter and height stated by the supplier and checked against the droplet size and the gas flow.', M, DR),
      c('The chamber shall be of insulated construction with a smooth, crevice-free interior and sloped cone, and shall have access ports for inspection and cleaning and a way to safely check the wall condition.', M, DR),
      c('Powder shall be collected by: {coll}. The supplier shall state the separation efficiency for the product and how powder carried over to the exhaust is minimised.', M, DR),
      c('The bag filter or cyclone shall be cleaned during operation (for example by pulse jet or shaking) without releasing powder to the room, and the supplier shall state how filter elements are changed safely.', M, DR, true, function (v) { return /filter/i.test(v.coll); }),
      c('The powder shall be discharged to a container, with containment as follows: {cont}. The supplier shall state the discharge arrangement (for example a rotary valve, a split butterfly valve or a continuous liner) and the measured or expected operator exposure.', M, DRF),
      c('The discharge system shall prevent product from bridging or compacting, and shall be cleanable, and the supplier shall state the residual product left after discharge.', S_, DR)
    ] },
    { t: 'Materials and surface finish', c: [
      c('Product-contact parts (atomiser, chamber, cyclone, filter housing and discharge) shall be made of {moc} and shall be compatible with the product, the solvent and the cleaning agents.', M, DRD),
      c('Product-contact surfaces shall have a surface roughness not greater than {finish}, and the supplier shall provide the measurement record.', M, FD, true, gmpProd),
      c('Product-contact welds shall be smooth and fully penetrated, with no crevices, and recorded on a weld map.', S_, DOC, true, prodOn),
      c('Seals, gaskets and filter elements in contact with the product or the solvent shall be non-shedding and suitable for the temperature, with a compliance declaration for each material.', M, DOC, true, prodOn),
      c('The supplier shall provide material certificates (for example EN 10204 type 3.1 or equivalent) for product-contact and pressure parts.', S_, DOC)
    ] },
    { t: 'Utilities, cleaning and environment', c: [
      c('The dryer shall be cleaned by {cleaning}. The supplier shall state how the chamber, cyclone, filter housing, atomiser and ducts are cleaned, and how the cleaning solution is drained and the equipment dried.', M, 'Design review, SAT', true, function (v) { return !/^No cleaning/.test(v.cleaning); }),
      c('Wash devices shall reach all surfaces of the chamber, the cone and the cyclone, and shall allow the dryer to be cleaned in place with a validated cycle, with the filter elements removed or cleaned as specified.', M, DRS, true, cipOn),
      c('The dryer shall be suitable for {loc} installation, with insulation or guards to protect personnel from hot surfaces and moving parts.', S_, DR),
      c('The supplier shall state the utility consumption (steam or electrical power for the heater, cooling water, nitrogen, compressed air and electrical power) per kilogram of powder and at peak.', S_, DOC)
    ] },
    { t: 'Instrumentation and control', c: [
      c('The dryer shall have a programmable control system for the feed rate, atomiser, inlet and outlet temperature, gas flow and chamber pressure, with alarms on deviation, and shall record the cycle data for batch records.', M, DRF),
      c('The outlet temperature shall control the feed rate (or the inlet temperature) automatically, and the supplier shall state the control strategy and response.', M, DR),
      c('Temperature, pressure, flow and differential pressure measurements shall be fitted at the points stated by the supplier, with calibration points available for each instrument.', M, DR),
      c('The dryer shall be fitted with a measurement of the residual moisture or solvent (for example in the exhaust or by sampling), and the supplier shall state the method.', C_, DR, false),
      c('Access to the control system shall be controlled by user level, and electronic records shall have audit trail, time stamps and data integrity controls appropriate for GMP use.', M, DRD, true, gmpOn)
    ] },
    { t: 'Safety, explosion protection and hazardous area', c: [
      c('The dryer shall handle flammable solvent only in a safe condition: either the closed cycle with oxygen monitoring below a limiting oxygen concentration, or an equivalent measure stated by the supplier, with the safety concept documented.', M, DR, true, flamYes),
      c('The oxygen analyser shall have redundancy or a stated verification method, with an interlock that stops the feed and sweeps the chamber with nitrogen when oxygen rises above the alarm limit.', M, DRF, true, function (v) { return flamYes(v) && /^Closed/.test(v.gas); }),
      c('Explosion protection shall be: {exp}. The supplier shall state the design basis (dust and solvent explosion parameters, venting or suppression sizing and the explosion isolation to the ducting).', M, DR, true, function (v) { return !/^Not required/.test(v.exp); }),
      c('The chamber, cyclone and filter housing shall be pressure shock resistant to {dp}, and any vent panels shall discharge to a safe location, with the vent duct supported as the supplier states.', M, DR, true, function (v) { return /vent/i.test(v.exp); }),
      c('Static shall be controlled by bonding and earthing of all conductive parts, the use of anti-static filter elements and a check of earth continuity, as stated by the supplier.', M, SAT, true, zoneOn),
      c('The dryer and all electrical and instrument equipment shall be certified for {zone}, with the gas and dust group and temperature class stated by the user.', M, DOC, true, zoneOn),
      c('The dryer shall have an independent high-temperature cut-out for the heater and an interlock that stops the feed and heater on loss of gas flow, loss of atomising air or a high outlet temperature.', M, DRF),
      c('The shut-down sequence shall flush the feed line, keep the gas flowing until the chamber has cooled, and prevent hot powder from remaining in the chamber or the filter.', M, DR)
    ] },
    { t: 'Documentation and qualification', c: [
      c('The supplier shall provide a datasheet, general arrangement drawings, a P&ID, a heat and mass balance, design calculations, an explosion protection concept (where applicable), material certificates, an operation and maintenance manual and a spare parts list.', M, DOC),
      c('The supplier shall support design, installation and operational qualification (DQ, IQ and OQ) by providing the documents and traceability needed for the user’s protocols.', M, DOC, true, gmpOn),
      c('The supplier shall provide a compliance statement against this URS, listing every deviation.', M, DR, true, gmpOn),
      c('The supplier shall provide a protocol for the performance qualification covering particle size, residual moisture or solvent and yield over several runs, with the acceptance limits stated by the user.', S_, DOC, true, gmpOn)
    ] },
    { t: 'Testing: FAT and SAT', c: [
      c('The factory acceptance test shall include a leak test of the chamber and ducts, atomiser checks, interlock checks, a functional test of the control system and a water run to check the temperature control and the stability of the outlet temperature, and shall be available for the user to witness.', M, FAT),
      c('The product-contact surface finish, the drainability and the containment discharge shall be verified at the factory acceptance test.', S_, FAT, true, gmpProd),
      c('The site acceptance test shall include a check of utilities and connections against the P&ID, a filter and containment check, a safety interlock test and a trial run with water or a placebo feed.', M, SAT),
      c('The supplier shall offer a test run with the user’s product on a pilot unit before the order, to confirm particle size, moisture and the wall deposit behaviour.', C_, DR, false)
    ] },
    { t: 'Spares, delivery and warranty', c: [
      c('The supplier shall provide a recommended spare parts list, including nozzles or atomiser wear parts, filter elements, seals, gaskets and instruments, with lead times.', S_, DOC),
      c('Delivery shall be within {delivery}, and the supplier shall state any items that have a longer lead time.', S_, DOC),
      c('The warranty shall be {warranty}, and the supplier shall state any items excluded from the warranty and the service response time.', S_, DOC)
    ] }
  ]);
});
