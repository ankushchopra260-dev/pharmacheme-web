/* PharmaChemE: live-formula Excel layouts for the comparison calculators (one column per case).
   xl-export.js calls window.PCME_XL_CASES() when "Download Excel" is pressed; it returns the spec for whichever calculator is on the page.
   Formulas mirror the functions in calculators.js. Look-ups (steam table, solvents, impellers, utilities) go on a read-only Data sheet. */
(function () {
  'use strict';
  const has = id => !!document.getElementById(id);
  const col = (cases, f) => cases.map(f);
  const inp = (k, label, unit, cases, field, list) => ({ k, label, unit, values: col(cases, c => c[field || k]), list });
  const out = (k, label, unit, f, helper) => ({ k, label, unit, f, helper: !!helper });
  const ANTOINE_NOTE = 'Boiling point from the Antoine equation, log10(P/torr) = A − B/(C + T), with constants from the Data sheet for the solvent named in each column.';

  function solventTable() {
    const names = Object.keys(SOLVENT_DB).sort((a, b) => a.localeCompare(b));
    return { title: 'Solvents: Antoine constants (P in torr, T in °C)', head: ['Solvent', 'A', 'B', 'C'], rows: names.map(n => [n, SOLVENT_DB[n].A, SOLVENT_DB[n].B, SOLVENT_DB[n].C]) };
  }
  const tb = '{B_}/({A_}-LOG10({P}))-{C_}';
  const antoineRows = () => [
    out('A_', 'Antoine A', '', 'VLOOKUP({solvent},SOLVENTS,2,FALSE)', true),
    out('B_', 'Antoine B', '', 'VLOOKUP({solvent},SOLVENTS,3,FALSE)', true),
    out('C_', 'Antoine C', '', 'VLOOKUP({solvent},SOLVENTS,4,FALSE)', true)];

  /* ---- Pump power ---- */
  function pump() {
    const c = pumpCases;
    return { title: 'Pump Power Calculator', sub: 'Hydraulic, shaft and motor power', cases: c.map(x => x.label),
      sections: [
        { title: 'Inputs', rows: [inp('solvent', 'Fluid (for reference)', '', c), inp('density', 'Density', 'kg/m³', c), inp('flowRate', 'Flow rate, Q', 'm³/h', c), inp('head', 'Total head, H', 'm', c),
          inp('etaPump', 'Pump efficiency (fraction or %)', '', c), inp('etaMotor', 'Motor efficiency (fraction or %)', '', c)] },
        { title: 'Results', rows: [
          out('ep', 'Pump efficiency used', 'fraction', 'IF({etaPump}>1,{etaPump}/100,{etaPump})', true),
          out('em', 'Motor efficiency used', 'fraction', 'IF({etaMotor}>1,{etaMotor}/100,{etaMotor})', true),
          out('dP', 'ΔP = ρ g H', 'Pa', '{density}*9.81*{head}'),
          out('theo', 'Theoretical (hydraulic) power', 'kW', '{flowRate}*{dP}/3600/1000'),
          out('shaft', 'Pump shaft power', 'kW', '{theo}/{ep}'),
          out('motor', 'Motor power requirement', 'kW', '{shaft}/{em}'),
          out('hp', 'Motor power requirement', 'hp', '{motor}*1.34102')] }],
      notes: ['Hydraulic power = Q × ρ × g × H / 3,600,000 (kW). Shaft = hydraulic / pump efficiency; motor = shaft / motor efficiency. Choose the next standard motor size with a margin above the motor power.'] };
  }

  /* ---- Centrifuge ---- */
  function centrifuge() {
    const c = centrifugeCases;
    return { title: 'Centrifuge Cake Weight and G-Force', sub: 'Basket centrifuge sizing', cases: c.map(x => x.label),
      sections: [
        { title: 'Inputs', rows: [inp('Db', 'Basket diameter, Db', 'm', c, 'basketDia'), inp('lip', 'Lip diameter, Dl', 'mm', c, 'lipDia'), inp('t', 'Maximum cake thickness, t', 'mm', c, 'cakeThickness'),
          inp('H', 'Basket height, H', 'm', c, 'height'), inp('BD', 'Bulk density of cake, BD', 'kg/m³', c, 'bulkDensity'), inp('rpm', 'Speed', 'rpm', c)] },
        { title: 'Results', rows: [
          out('R', 'Basket radius', 'mm', '{Db}*1000/2', true),
          out('Da', 'Inner cake diameter, Da = Db − 2t', 'm', '{Db}-2*{t}/1000'),
          out('Aa', 'Annular cake area', 'm²', 'PI()/4*({Db}^2-{Da}^2)'),
          out('V', 'Cake volume', 'm³', '{H}*{Aa}'),
          out('W', 'Cake weight', 'kg', '{V}*{BD}'),
          out('g', 'G-force', '× g', '1.12*{R}*({rpm}/1000)^2'),
          out('maxT', 'Thickest cake the lip allows', 'mm', '({Db}*1000-{lip})/2'),
          out('lipChk', 'Lip check', '', 'IF({t}<={maxT},"OK","Cake thicker than the lip allows")')] }],
      notes: ['G-force = 1.12 × r(mm) × (rpm/1000)². Bulk density should come from your own cake-weight trial.'] };
  }

  /* ---- Corrosion coupon ---- */
  function coupon() {
    const c = couponReactors;
    const dens = c.map(x => computeCouponMetrics(x).density);
    return { title: 'Corrosion Coupon Study', sub: 'Weight-loss method, mpy', cases: c.map(x => x.label),
      sections: [
        { title: 'Identification', rows: [inp('product', 'Product', '', c), inp('coupon', 'Coupon material', '', c), inp('temp', 'Temperature', '°C', c, 'temperature'), inp('desc', 'Description / conditions', '', c, 'description')] },
        { title: 'Weighing, exposure and coupon', rows: [inp('w1', 'Initial weight', 'g', c, 'initialWeight'), inp('w2', 'Final weight', 'g', c, 'finalWeight'), inp('time', 'Time of exposure', 'h', c),
          inp('L', 'Length', 'cm', c, 'length'), inp('W', 'Width', 'cm', c, 'width'), inp('Hh', 'Height', 'cm', c, 'height'),
          { k: 'rho', label: 'Alloy density (ASTM G1 value, or measured)', unit: 'g/cm³', values: dens }] },
        { title: 'Results', rows: [
          out('wl', 'Weight loss', 'g', '{w1}-{w2}'),
          out('area', 'Exposed area', 'cm²', '2*({L}*{W}+{W}*{Hh}+{Hh}*{L})'),
          out('mpy', 'Corrosion rate', 'mpy', '{wl}*365*24*10/0.0254/{rho}/{time}/{area}'),
          out('rating', 'Rating', '', 'IF({mpy}<2,"Excellent",IF({mpy}<20,"Good",IF({mpy}<50,"Satisfactory","Unsatisfactory")))')] }],
      notes: ['Corrosion rate (mpy) = weight loss × 87,600 / (0.0254 × density × time × area), weight in g, time in h, area in cm².', 'Rating: Excellent < 2 mpy, Good < 20, Satisfactory < 50, Unsatisfactory ≥ 50.'] };
  }

  /* ---- Filtration ---- */
  function filtration() {
    const c = filtrationTrials, N = c[0].readings.length;
    const rows = FILTRATION_SCALAR_ROWS.map(r => { const m = r.label.match(/^(.*?)\s*\(([^)]*)\)\s*$/); return inp(r.field, m ? m[1] : r.label, m ? m[2] : '', c); });
    rows.push(inp('evalBasis', 'Evaluation basis', '', c, 'evalBasis', ['Flux', 'Cake Resistance']));
    const rd = [];
    for (let i = 0; i < N; i++) {
      rd.push({ k: 't' + i, label: `Reading ${i + 1}: time`, unit: 'min', values: c.map(x => x.readings[i].time) });
      rd.push({ k: 'v' + i, label: `Reading ${i + 1}: filtrate volume`, unit: 'mL', values: c.map(x => x.readings[i].volume) });
    }
    const helpers = [];
    for (let i = 0; i < N; i++) helpers.push(out('F' + i, `F${i + 1} = V / 10⁶`, 'm³', `IF(OR({t${i}}="",{v${i}}=""),"",{v${i}}/1000000)`, true));
    for (let i = 0; i < N; i++) helpers.push(out('G' + i, `G${i + 1} = t / F`, 's/m³', `IF(OR({t${i}}="",{v${i}}=""),"",{t${i}}*60/({v${i}}/1000000))`, true));
    const ms = c.map(x => computeFiltrationMetrics(x));
    return { title: 'Filtration Evaluation', sub: 'Büchner trial: flux and specific cake resistance', cases: c.map(x => x.label),
      sections: [{ title: 'Inputs', rows }, { title: 'Time and filtrate readings', rows: rd },
        { title: 'Working (t/V against V)', rows: helpers.concat([{ k: 'slope', label: 'Slope of t/V against V', unit: 's/m⁶', f: `IF(COUNT({G0}:{G${N - 1}})<2,"Enter at least 2 readings",SLOPE({G0}:{G${N - 1}},{F0}:{F${N - 1}}))`, values: ms.map(m => isFinite(m.slope) ? m.slope : 'Enter at least 2 readings'), helper: true }]) },
        { title: 'Results', rows: [
          out('area', 'Filter area', 'm²', 'PI()/4*({buchnerDia}/100)^2'),
          out('flux', 'Filtration flux', 'L/m²·min', '({filtrateVol}/1000)/({area}*{filtrationTime})'),
          out('conc', 'Solids concentration, c', 'kg/m³', '{wetCakeWt}*{solidsFraction}/{slurryVol}*1000'),
          out('dP', 'Pressure difference', 'Pa', '{vacuum}*133.322', true),
          out('mu', 'Viscosity', 'Pa·s', '{viscosity}*0.001', true),
          { k: 'alpha', label: 'Specific cake resistance, α', unit: 'm/kg', f: 'IF(ISNUMBER({slope}),2*{area}^2*{dP}*{slope}/({mu}*{conc}),"Enter at least 2 readings")', values: ms.map(m => isFinite(m.alpha) ? m.alpha : 'Enter at least 2 readings') },
          out('fluxClass', 'Flux verdict', '', 'IF({flux}<20,"Poor Filtration",IF({flux}<40,"Moderate Filtration","Good Filtration"))'),
          { k: 'alphaClass', label: 'Cake resistance verdict', unit: '', values: ms.map(m => m.alphaClass), f: 'IF(NOT(ISNUMBER({alpha})),{alpha},IF({alpha}<10000000000,"Good Filtration",IF({alpha}<100000000000,"Moderate Filtration",IF({alpha}<1000000000000,"Slow Filtration","Very Slow Filtration"))))' },
          { k: 'result', label: 'Result on the chosen basis', unit: '', values: ms.map(m => m.result), f: 'IF({evalBasis}="Cake Resistance",{alphaClass},{fluxClass})' }] }],
      notes: ['From the Ruth equation: t/V = (α μ c / 2 A² ΔP) V + constant, so α = 2 A² ΔP × slope / (μ c).', 'Blank readings are skipped. At least two readings are needed for the slope.'] };
  }

  /* ---- Mixing scale-up ---- */
  function scaleup() {
    const c = scaleupReactors, NP = Object.keys(IMPELLER_NP);
    const rows = SCALEUP_INPUT_ROWS.filter(r => !r.section).map(r => { const m = r.label.match(/^(.*?)\s*\(([^)]*)\)\s*$/); return inp(r.field, m ? m[1] : r.label, m ? m[2] : '', c, r.field, r.type === 'select' ? 'IMPELLERS_KEYS' : undefined); });
    return { title: 'Mixing / Scale-up Comparison', sub: 'P/V, tip speed, Reynolds number and torque', cases: c.map(x => x.label),
      tables: { IMPELLERS: { title: 'Impeller power numbers (turbulent)', head: ['Impeller', 'Np'], rows: NP.map(k => [k, IMPELLER_NP[k]]) } },
      sections: [{ title: 'Inputs', rows },
        { title: 'Results', rows: [
          out('Npb', 'Np, bottom impeller', '', 'VLOOKUP({typeBottom},IMPELLERS,2,FALSE)', true),
          out('Npm', 'Np, middle impeller', '', 'VLOOKUP({typeMiddle},IMPELLERS,2,FALSE)', true),
          out('Npt', 'Np, top impeller', '', 'VLOOKUP({typeTop},IMPELLERS,2,FALSE)', true),
          out('N', 'Speed', 'rev/s', '{rpm}/60', true),
          out('mu', 'Viscosity', 'Pa·s', '{viscosityCp}/1000', true),
          out('calcVol', 'Calculated vessel volume', 'L', 'PI()/4*({T}/1000)^2*{Ltt}+PI()/24*({T}/1000)^3*1000'),
          out('H', 'Liquid height', 'm', '({Ltt}+{dishAdd})/{calcVol}*({rmVol}/1000)'),
          out('occ', 'Occupancy', '%', '{rmVol}/{capacity}*100'),
          out('LT', 'L/T', '', '{Ltt}/{T}'),
          out('DT', 'D/T, bottom impeller', '', '{dBottom}/{T}'),
          out('clearWall', 'Blade tip to wall clearance', 'mm', '({T}-{dBottom})/2'),
          out('Re', 'Reynolds number', '', '({dBottom}/1000)^2*{N}*{density}/{mu}'),
          out('regime', 'Flow regime', '', 'IF({Re}>10000,"Turbulent",IF({Re}<100,"Laminar","Transitional"))'),
          out('tip', 'Tip speed', 'm/s', 'PI()*({dBottom}/1000)*{N}'),
          out('P', 'Power (all three impellers)', 'W', '{Npt}*{density}*{N}^3*({dTop}/1000)^5+{Npb}*{density}*{N}^3*({dBottom}/1000)^5+{Npm}*{density}*{N}^3*({dMiddle}/1000)^5'),
          out('PV', 'Power per volume, P/V', 'W/L', '{P}/{rmVol}'),
          out('blend', 'Blend time estimate', 's', '5.2*{T}^2/{Npb}^(1/3)/{N}/{dBottom}^2'),
          out('G', 'Shear rate (Camp–Stein)', '1/s', 'SQRT({PV}*1000/{mu})'),
          out('torque', 'Torque', 'N·m', '{P}/(2*PI()*{N})'),
          out('torqueV', 'Torque per volume', 'N·m/L', '{torque}/{rmVol}')] }],
      notes: ['P = Np ρ N³ D⁵ summed over the three impellers (turbulent power numbers on the Data sheet). Blend time θ = 5.2 (T/D)² / (Np^(1/3) N).', 'For scale-up, match one criterion (P/V, tip speed or torque/V) across columns; no single basis keeps every row equal.'] };
  }

  /* ---- Solvent recovery sub-tools ---- */
  function solventRecovery() {
    if (typeof srSubActive === 'undefined' || !srSubActive) return null;
    const c = srCases[srSubActive], cases = c.map(x => x.label);
    const SOLV = solventTable();
    if (srSubActive === 'boiling') return { title: 'Boiling Point at Vacuum', sub: 'Antoine equation', cases, tables: { SOLVENTS: SOLV },
      sections: [{ title: 'Inputs', rows: [inp('solvent', 'Solvent (pick from the list)', '', c, 'solvent', 'SOLVENTS_KEYS'), inp('P', 'Vacuum applied', 'torr abs', c, 'vacuum')] },
        { title: 'Results', rows: antoineRows().concat([out('Tb', 'Boiling point at vacuum', '°C', tb)]) }], notes: [ANTOINE_NOTE] };
    if (srSubActive === 'condenser') {
      const U = c.map(x => +x.uCond > 0 ? +x.uCond : condenserU(x.hxType, x.condMoc));
      return { title: 'Condenser Sizing', sub: 'Duty, LMTD, area and utility flow', cases, tables: { SOLVENTS: SOLV, UTILITIES: { title: 'Condenser utilities', head: ['Utility', 'Typical inlet °C', 'Typical outlet °C', 'Density kg/m³', 'cp kcal/kg·°C'], rows: Object.entries(COND_UTILITIES).map(([k, u]) => [k, u.tin, u.tout, u.density, u.cp]) } },
        sections: [{ title: 'Inputs', rows: [inp('solvent', 'Solvent (pick from the list)', '', c, 'solvent', 'SOLVENTS_KEYS'), inp('P', 'Vacuum applied', 'torr abs', c, 'vacuum'), inp('qty', 'Quantity distilled', 'L', c, 'qtyDistilled'),
          inp('time', 'Recovery time', 'h', c, 'recoveryTime'), inp('rho', 'Density', 'kg/m³', c, 'density'), inp('lat', 'Latent heat', 'kcal/kg', c, 'latent'),
          { k: 'U', label: 'Overall U (from HX type and MOC on the website, or your value)', unit: 'kcal/m²·h·°C', values: U.map(u => Math.round(u)) },
          inp('util', 'Utility', '', c, 'condUtility', Object.keys(COND_UTILITIES)), inp('tin', 'Utility inlet', '°C', c, 'condTin'), inp('tout', 'Utility outlet', '°C', c, 'condTout'),
          inp('vel', 'Pipe velocity, assumed', 'm/s', c, 'condVelocity'), inp('margin', 'Design margin', '%', c, 'designMargin')] },
          { title: 'Results', rows: antoineRows().concat([out('Tb', 'Boiling point at vacuum', '°C', tb),
            out('Q', 'Condenser duty', 'kcal/h', '{qty}/{time}*{rho}/1000*{lat}'),
            out('d1', 'ΔT1 = Tb − utility outlet', '°C', '{Tb}-{tout}', true), out('d2', 'ΔT2 = Tb − utility inlet', '°C', '{Tb}-{tin}', true),
            out('lmtd', 'LMTD', '°C', 'IF(OR({d1}<=0,{d2}<=0),"Utility too warm",IF(ABS({d1}-{d2})<0.000000001,{d1},({d1}-{d2})/LN({d1}/{d2})))'),
            out('aBase', 'Condenser area (base)', 'm²', '{Q}/({U}*{lmtd})'), out('area', 'Condenser area with margin', 'm²', '{aBase}*(1+{margin}/100)'),
            out('ucp', 'Utility cp', 'kcal/kg·°C', 'VLOOKUP({util},UTILITIES,5,FALSE)', true), out('urho', 'Utility density', 'kg/m³', 'VLOOKUP({util},UTILITIES,4,FALSE)', true),
            out('flow', 'Utility flow', 'm³/h', '{Q}/({ucp}*({tout}-{tin}))/{urho}'),
            out('pipe', 'Utility pipe diameter', 'mm', 'SQRT(4*({flow}/3600/{vel})/PI())*1000')]) }],
        notes: [ANTOINE_NOTE, 'Area = duty / (U × LMTD) plus the design margin. The vapour is taken to condense at its boiling point at the applied vacuum.'] };
    }
    if (srSubActive === 'vacuumpump') return { title: 'Vacuum Pump Capacity', sub: 'Leakage, evacuation and evaporation load', cases, tables: { SOLVENTS: SOLV },
      sections: [{ title: 'Inputs', rows: [inp('solvent', 'Solvent (pick from the list)', '', c, 'solvent', 'SOLVENTS_KEYS'), inp('P', 'Vacuum applied', 'torr abs', c, 'vacuum'), inp('cap', 'Reactor capacity', 'L', c, 'capacity'),
        inp('qty', 'Quantity distilled', 'L', c, 'qtyDistilled'), inp('time', 'Recovery time', 'h', c, 'recoveryTime'), inp('rho', 'Density', 'kg/m³', c, 'density'), inp('mw', 'Molecular weight', 'g/mol', c),
        inp('nz', 'Process nozzles on reactor', 'no.', c, 'nozzleCount'), inp('nzs', 'Average nozzle size', 'in', c, 'nozzleSize'), inp('g3', 'Gaskets, 3 inch', 'no.', c, 'gasket3in'), inp('g05', 'Gaskets, 1/2 inch', 'no.', c, 'gasket05in'),
        inp('gp', 'Reactor gasket perimeter', 'in', c, 'gasketPerimeter'), inp('vc', 'Valve count', 'no.', c, 'valveCount'), inp('vd', 'Valve diameter', 'in', c, 'valveDia'), inp('loss', 'Solvent loss to vacuum', '%', c, 'lossPct'), inp('evac', 'Evacuation time', 'h', c, 'evacTime')] },
        { title: 'Results', rows: antoineRows().concat([out('Tb', 'Boiling point at vacuum', '°C', tb),
          out('leak', 'Air leakage', 'lb/h', '{nz}*{nzs}*0.018+{g3}*3.14*3*0.005+{g05}*3.14*0.5*0.005+{gp}*0.005+{vc}*3.14*{vd}*0.02', true),
          out('pLeak', 'Pump capacity for leakage', 'm³/h', '{leak}/60*(379/29)*(760/{P})*0.028*60'),
          out('pEvac', 'Pump capacity for evacuation', 'm³/h', '({cap}/1000/{evac})*LN(760/{P})'),
          out('pEvap', 'Pump capacity for evaporation load', 'm³/h', '({qty}*{loss}/100*{rho}/1000)*8.314*(273+{Tb})/{mw}/({time}*{P}*0.133)'),
          out('total', 'Vacuum pump capacity', 'm³/h', 'IF({P}>=760,"N/A (atmospheric)",MAX({pLeak},{pEvac})+{pEvap})')]) }],
      notes: [ANTOINE_NOTE, 'Air leakage from the standard allowances per nozzle, gasket and valve; capacity = larger of leakage and evacuation, plus the evaporation load.'] };
    if (srSubActive === 'heatload') {
      const steam = { title: 'Saturated steam', head: ['Pressure kg/cm² g', 'Temperature °C', 'Vapour density kg/m³', 'Latent heat kcal/kg', 'Pipe velocity m/s'], rows: STEAM_TABLE.map(r => [+r.p, r.t, r.density, r.latent, r.velocity]) };
      const newton = [];
      newton.push(out('D0', 'Vessel diameter, first guess', 'm', 'SQRT(4*{V}/(PI()*{L}))', true));
      for (let i = 1; i <= 6; i++) newton.push(out('D' + i, `Vessel diameter, Newton step ${i}`, 'm', `{D${i - 1}}-(PI()/4*{D${i - 1}}^2*{L}+PI()/24*{D${i - 1}}^3-{V})/(PI()/2*{D${i - 1}}*{L}+PI()/8*{D${i - 1}}^2)`, true));
      const wet = v => `IF(${v}<=0,0,IF(${v}<={dishV},{dishA}*(${v}/{dishV})^(2/3),{dishA}+PI()*{D6}*MIN({L},(${v}-{dishV})/(PI()/4*{D6}^2))))`;
      return { title: 'Heat Load and Recovery Time', sub: 'Batch solvent recovery from a jacketed reactor', cases, tables: { SOLVENTS: SOLV, STEAM: steam },
        sections: [{ title: 'Inputs', rows: [inp('capL', 'Reactor capacity', 'L', c, 'capacity'), inp('U', 'Overall U', 'kcal/m²·h·°C', c, 'u'), inp('basis', 'Jacket area basis', '', c, 'jacketAreaBasis', ['Calculated', 'User Entered']),
          inp('L', 'Assumed straight length', 'm', c, 'jacketLength'), inp('occ', 'Reactor occupancy at start', '%', c, 'occupancy'), inp('aMan', 'Jacket area, user entered', 'm²', c, 'jacketAreaManual'),
          inp('ffe', 'FFE required', '', c, 'ffeRequired', ['YES', 'NO']), inp('ffeA', 'Proposed FFE area', 'm²', c, 'ffeArea'),
          inp('solvent', 'Solvent (pick from the list)', '', c, 'solvent', 'SOLVENTS_KEYS'), inp('P', 'Vacuum applied', 'torr abs', c, 'vacuum'), inp('qty', 'Quantity distilled', 'L', c, 'qtyDistilled'),
          inp('T1', 'Initial mass temperature', '°C', c, 'initialTemp'), inp('rho', 'Density', 'kg/m³', c, 'density'), inp('cp', 'Specific heat, Cp', 'kcal/kg·°C', c, 'cp'), inp('lat', 'Latent heat', 'kcal/kg', c, 'latent'),
          inp('type', 'Heating utility', '', c, 'heatingType', ['Hot Water', 'Steam']), inp('hws', 'HW supply temperature', '°C', c, 'hwSupply'), inp('hwr', 'HW return temperature', '°C', c, 'hwReturn'), inp('hwf', 'HW flow rate', 'm³/h', c, 'hwFlow'),
          inp('sp', 'Steam pressure', 'kg/cm² g', c, 'steamPressure', STEAM_TABLE.map(r => +r.p)), inp('spd', 'Steam pipe diameter', 'in', c, 'steamPipeDia'), inp('sdt', 'Steam jacket ΔT', '°C', c, 'steamJacketDT'), inp('loss', 'Heat loss in transfer', '%', c, 'jacketLossPct')] },
          { title: 'Working: vessel geometry and wetted area', rows: [out('V', 'Reactor volume', 'm³', '{capL}/1000', true)].concat(newton, [
            out('dishV', 'Bottom dish volume (2:1 ellipsoidal)', 'm³', 'PI()/24*{D6}^3', true), out('dishA', 'Bottom dish area', 'm²', '1.084*{D6}^2', true),
            out('vS', 'Liquid volume at start', 'm³', '{V}*{occ}/100', true), out('vE', 'Liquid volume at end', 'm³', '{vS}-{qty}/1000', true),
            out('aS', 'Wetted area at start', 'm²', wet('{vS}'), true), out('aE', 'Wetted area at end', 'm²', wet('MAX(0,{vE})'), true)]) },
          { title: 'Results', rows: antoineRows().concat([out('Tb', 'Boiling point at vacuum', '°C', tb),
            out('aJ', 'Jacket area used', 'm²', 'IF({basis}="User Entered",{aMan},({aS}+{aE})/2)'),
            out('aEff', 'Effective area (jacket + FFE)', 'm²', '{aJ}+IF({ffe}="YES",{ffeA},0)'),
            out('m', 'Mass distilled', 'kg', '{qty}*{rho}/1000', true),
            out('Q', 'Total heat load', 'kcal', '{m}*{cp}*MAX(0,{Tb}-{T1})+{m}*{lat}'),
            out('hwDT', 'HW available ΔT', '°C', '{hws}-{hwr}', true), out('hwMean', 'HW mean temperature', '°C', '({hws}+{hwr})/2', true), out('hwJ', 'HW jacket ΔT', '°C', '{hwMean}-{Tb}', true),
            out('sT', 'Steam temperature', '°C', 'VLOOKUP({sp},STEAM,2,FALSE)', true), out('sRho', 'Steam density', 'kg/m³', 'VLOOKUP({sp},STEAM,3,FALSE)', true),
            out('sLat', 'Steam latent heat', 'kcal/kg', 'VLOOKUP({sp},STEAM,4,FALSE)', true), out('sVel', 'Steam pipe velocity', 'm/s', 'VLOOKUP({sp},STEAM,5,FALSE)', true),
            out('s1', 'Steam ΔT1', '°C', '{sT}-{Tb}', true), out('s2', 'Steam ΔT2', '°C', '{sT}-{sdt}-{Tb}', true),
            out('sLM', 'Steam jacket LMTD', '°C', 'IF(OR({s1}<=0,{s2}<=0),0,IF(ABS({s1}-{s2})<0.000000001,{s1},({s1}-{s2})/LN({s1}/{s2})))', true),
            out('qAv', 'Heat available (utility)', 'kcal/h', 'IF({type}="Hot Water",{hwf}*1000*{hwDT},PI()/4*({spd}*0.0254)^2*{sVel}*{sLat}*3600*{sRho})'),
            out('qJ', 'Heat transferable (jacket)', 'kcal/h', 'IF({type}="Hot Water",{U}*{aEff}*{hwJ},{U}*{aEff}*{sLM})'),
            out('check', 'Heating check', '', 'IF({type}<>"Hot Water","Steam",IF({hwDT}<=0,"HW return not cooler than supply",IF({hwJ}<0,"HW below boiling point: invalid",IF({hwJ}<5,"Very low driving force","Acceptable"))))'),
            out('qAct', 'Heat delivered after losses', 'kcal/h', 'MIN({qAv},{qJ})*(1-{loss}/100)'),
            out('time', 'Recovery time', 'h', 'IF(AND({basis}<>"User Entered",{vE}<0),"Check occupancy",{Q}/{qAct})'),
            out('steam', 'Steam consumption', 'kg per batch', 'IF({type}="Hot Water","n/a (hot water)",{Q}/(1-{loss}/100)/{sLat})')]) }],
        notes: [ANTOINE_NOTE, 'Recovery time = heat load / (smaller of utility supply and jacket duty, less losses). The wetted area is averaged between the start and end of the distillation for a vessel with a 2:1 ellipsoidal bottom.'] };
    }
    return null;
  }

  window.PCME_XL_CASES = function () {
    try {
      if (has('pp-table')) return pump();
      if (has('cf-table')) return centrifuge();
      if (has('cp-table')) return coupon();
      if (has('ft-table')) return filtration();
      if (has('su-table')) return scaleup();
      if (has('sr-comparison-table')) return solventRecovery();
    } catch (e) { if (window.console) console.warn('Excel layout failed, using the table export', e); }
    return null;
  };
})();
