"""Writes whiteboard/<slug>/index.html for the lessons below and the hub page whiteboard/index.html.
Run after the lesson JSON is built:  python3 tools/whiteboard/make_pages.py
The NPSH page (whiteboard/npsh-cavitation/) is kept by hand; it is listed on the hub from HUB below."""
import html, importlib, json, os, sys

HERE = os.path.dirname(__file__)
sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SITE = 'https://www.pharmacheme.in'
TODAY = os.environ.get('WB_DATE', '2026-11-22')

PAGES = {
    'heat-exchangers': dict(
        module='heat_exchangers',
        h1='Heat Exchangers: Whiteboard Lesson',
        seo_title='Heat Exchangers Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on heat exchangers: LMTD, fouling, tube velocity, tube or shell side, waterlogged steam heaters and venting.',
        intro='Six questions on how heat exchangers work and why they stop working: counter-current flow, fouling, water velocity, which fluid goes in the tubes, flooded steam heaters and air in coolers.',
        keywords='heat exchanger explained, LMTD explained, counter-current vs co-current, exchanger fouling, tube side or shell side, steam heater waterlogging, heat exchanger interview questions',
        teaches=['Log mean temperature difference', 'Heat exchanger fouling', 'Shell-and-tube exchanger design'],
        image='/assets/img/share/whiteboard-heat-exchangers.jpg',
        related=[('/calculators/lmtd-calculator/', 'LMTD calculator'),
                 ('/calculators/overall-heat-transfer-coefficient-calculator/', 'Overall heat transfer coefficient calculator'),
                 ('/articles/heat-exchanger-design-basics/', 'Heat exchanger design basics')]),
    'runaway-reactions': dict(
        module='runaway_reactions',
        h1='Runaway Reactions: Whiteboard Lesson',
        seo_title='Runaway Reactions Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on runaway reactions: heat made vs removed, accumulation, MTSR, adiabatic rise, agitator trips and boiling as a barrier.',
        intro='Six questions on why exothermic batches run away and how plants stop it: heat made against heat removed, accumulation in semi-batch dosing, adiabatic temperature rise, agitator trips and what happens when cooling fails.',
        keywords='runaway reaction explained, thermal runaway batch reactor, accumulation semi-batch, MTSR, adiabatic temperature rise, agitator failure dosing, process safety interview questions',
        teaches=['Thermal runaway', 'Reagent accumulation in semi-batch reactions', 'Adiabatic temperature rise'],
        image='/assets/img/share/whiteboard-runaway-reactions.jpg',
        related=[('/calculators/heat-of-reaction-calculator/', 'Heat of reaction calculator'),
                 ('/articles/semi-batch-dosing-accumulation/', 'Semi-batch dosing and accumulation'),
                 ('/articles/how-to-read-dsc-arc-rc1-tsu/', 'How to read thermal safety test data')]),
    'distillation-basics': dict(
        module='distillation_basics',
        h1='Distillation Basics: Whiteboard Lesson',
        seo_title='Distillation Basics Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on distillation: reflux ratio, minimum reflux, flooding, weeping, the ethanol-water azeotrope and batch distillation cuts.',
        intro='Six questions on how a distillation column behaves: what reflux does, minimum reflux, flooding and weeping, why ethanol and water stop at an azeotrope, and when to change receivers in a batch distillation.',
        keywords='distillation explained, reflux ratio, minimum reflux, column flooding, tray weeping, ethanol water azeotrope, batch distillation cuts, distillation interview questions',
        teaches=['Reflux ratio', 'Column flooding and weeping', 'Azeotropes'],
        image='/assets/img/share/whiteboard-distillation-basics.jpg',
        related=[('/calculators/batch-distillation-simulator/', 'Batch distillation simulator'),
                 ('/calculators/mccabe-thiele/', 'McCabe-Thiele diagram tool'),
                 ('/articles/distillation-basics/', 'Distillation basics article')]),
    'vacuum-ejectors': dict(
        module='vacuum_ejectors',
        h1='Vacuum and Ejectors: Whiteboard Lesson',
        seo_title='Vacuum Systems and Steam Ejectors: Whiteboard Lesson',
        description='Six-question whiteboard lesson on vacuum: gauge vs absolute, finding leaks, the rate-of-rise test, steam ejectors breaking and why to condense first.',
        intro='Six questions on vacuum systems in the plant: gauge and absolute pressure, splitting a vacuum problem, telling a leak from vapour, why ejectors break, summer vacuum trouble and condensers before the pump.',
        keywords='vacuum explained, gauge vs absolute pressure, vacuum leak test, rate of rise test, steam ejector, ejector breaking, vacuum pump condenser, vacuum interview questions',
        teaches=['Vacuum measurement', 'Vacuum leak testing', 'Steam ejectors'],
        image='/assets/img/share/whiteboard-vacuum-ejectors.jpg',
        related=[('/articles/vacuum-systems/', 'Vacuum systems guide'),
                 ('/articles/steam-energy-and-condenser-selection/', 'Steam energy and condenser selection'),
                 ('/articles/solvent-recovery-troubleshooting/', 'Solvent recovery troubleshooting')]),
    'relief-valves': dict(
        module='relief_valves',
        h1='Relief Valves: Whiteboard Lesson',
        seo_title='Relief Valves Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on relief valves: set pressure and MAWP, thermal relief, back pressure and bellows, rupture discs, isolation valves, chatter.',
        intro='Six questions on pressure relief: where the set pressure comes from, why blocked-in liquid needs a thermal relief, back pressure and bellows valves, rupture discs, isolation valves under relief valves and chatter.',
        keywords='relief valve explained, PSV set pressure MAWP, accumulation 10 % 21 %, thermal relief valve, balanced bellows valve, rupture disc under relief valve, relief valve chatter, interview questions',
        teaches=['Relief valve set pressure and accumulation', 'Thermal relief', 'Relief valve chatter'],
        image='/assets/img/share/whiteboard-relief-valves.jpg',
        related=[('/calculators/relief-valve-sizing/', 'Relief valve sizing tool'),
                 ('/articles/relief-valve-sizing/', 'Relief valve sizing article'),
                 ('/articles/lopa-and-sil-basics/', 'LOPA and SIL basics')]),
    'cooling-towers': dict(
        module='cooling_towers',
        h1='Cooling Towers: Whiteboard Lesson',
        seo_title='Cooling Towers Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on cooling towers: range and approach, the wet bulb limit, evaporation loss, cycles of concentration, blowdown and fouled fill.',
        intro='Six questions on cooling towers: range and approach, why the wet bulb is the floor, how much water evaporates, cycles and blowdown, telling weather from a tower problem, and fouled fill.',
        keywords='cooling tower explained, range and approach, wet bulb temperature, cooling tower evaporation loss, cycles of concentration, blowdown formula, cooling tower interview questions',
        teaches=['Cooling tower range and approach', 'Evaporation and blowdown', 'Cooling tower performance'],
        image='/assets/img/share/whiteboard-cooling-towers.jpg',
        related=[('/articles/cooling-tower-calculations/', 'Cooling tower calculations'),
                 ('/articles/water-and-power-utilities/', 'Water and power utilities'),
                 ('/articles/utility-load-estimation/', 'Utility load estimation')]),
    'agitation-mixing': dict(
        module='agitation_mixing',
        h1='Agitation and Mixing: Whiteboard Lesson',
        seo_title='Agitation and Mixing Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on agitators: power and speed, baffles and vortex, impellers for solids and gas, scale-up blend time and the dosing point.',
        intro='Six questions on agitation: how power climbs with speed, why baffles matter, which impeller lifts solids or disperses gas, why blend time grows on scale-up and where to dose a fast reaction.',
        keywords='agitator power number, agitator speed power, baffles vortex, pitched blade turbine solids, disc turbine gas dispersion, mixing scale-up blend time, agitator interview questions',
        teaches=['Agitator power', 'Impeller selection', 'Mixing scale-up'],
        image='/assets/img/share/whiteboard-agitation-mixing.jpg',
        related=[('/calculators/mixing-scale-up-calculator/', 'Mixing scale-up calculator'),
                 ('/calculators/agitator-simulator/', 'Agitator simulator'),
                 ('/articles/agitator-design/', 'Agitator design')]),
    'pid-control': dict(
        module='pid_control',
        h1='PID Control: Whiteboard Lesson',
        seo_title='PID Control Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on PID control: offset and integral, too much gain, derivative and noise, valve fail positions, cascade and integral windup.',
        intro='Six questions on control loops: why P-only leaves an offset, what too much gain does, why flow loops skip derivative, which way valves should fail, cascade control and integral windup.',
        keywords='PID control explained, proportional offset, integral action, derivative noise, fail open fail closed valve, cascade control reactor, integral windup, instrumentation interview questions',
        teaches=['PID control', 'Cascade control', 'Control valve fail positions'],
        image='/assets/img/share/whiteboard-pid-control.jpg',
        related=[('/articles/pid-control-tuning/', 'PID control tuning'),
                 ('/articles/instrumentation-basics/', 'Instrumentation basics'),
                 ('/articles/reading-process-trends-to-find-faults/', 'Reading process trends to find faults')]),
    'line-sizing-pressure-drop': dict(
        module='line_sizing',
        h1='Line Sizing and Pressure Drop: Whiteboard Lesson',
        seo_title='Line Sizing and Pressure Drop: Whiteboard Lesson',
        description='Six-question whiteboard lesson on pipe sizing: velocity, why pressure drop goes with D to the fifth, typical speeds, suction lines, steam and water hammer.',
        intro='Six questions on sizing pipes: what halving the diameter does to velocity and pressure drop, rule-of-thumb speeds, why suction lines are bigger, why steam can run fast and what water hammer does.',
        keywords='line sizing explained, pipe velocity, pressure drop diameter, typical pipe velocity, pump suction line size, steam line velocity, water hammer, piping interview questions',
        teaches=['Line sizing', 'Pipe pressure drop', 'Water hammer'],
        image='/assets/img/share/whiteboard-line-sizing-pressure-drop.jpg',
        related=[('/calculators/pipe-pressure-drop/', 'Pipe pressure drop calculator'),
                 ('/articles/line-sizing-and-pressure-drop/', 'Line sizing and pressure drop article'),
                 ('/calculators/pump-head-calculator/', 'Pump head calculator')]),
    'filtration-centrifuges': dict(
        module='filtration_centrifuges',
        h1='Filtration and Centrifuges: Whiteboard Lesson',
        seo_title='Filtration and Centrifuges: Whiteboard Lesson',
        description='Six-question whiteboard lesson on filtration and centrifuges: cake growth, compressible cakes, cracked cakes, G-force, spin-dry limits and inerting.',
        intro='Six questions on solid-liquid separation: why filtration slows as the cake grows, soft cakes, cracked cakes and washing, centrifuge G-force, why spinning longer stops helping and inerting before you spin.',
        keywords='filtration explained, constant pressure filtration, compressible cake, cake washing cracks, centrifuge g force, centrifuge spin dry, centrifuge nitrogen inerting, interview questions',
        teaches=['Cake filtration', 'Centrifuge G-force', 'Centrifuge safety'],
        image='/assets/img/share/whiteboard-filtration-centrifuges.jpg',
        related=[('/calculators/filtration-calculator/', 'Filtration calculator'),
                 ('/calculators/centrifuge-cake-weight-calculator/', 'Centrifuge cake weight calculator'),
                 ('/articles/filtration-calculation/', 'Filtration calculation article')]),
    'drying-basics': dict(
        module='drying_basics',
        h1='Drying Basics: Whiteboard Lesson',
        seo_title='Drying Basics Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on drying: wet vs dry basis LOD, the drying curve, vacuum dryers, heat to evaporate water, case hardening and the end point.',
        intro='Six questions on drying: LOD on a wet and dry basis, the constant and falling rate periods, why dry under vacuum, how much heat evaporation takes, case hardening and how to tell a batch is dry.',
        keywords='drying explained, LOD wet basis dry basis, drying rate curve, vacuum tray dryer, latent heat evaporation, case hardening, dryer end point, drying interview questions',
        teaches=['Moisture content and LOD', 'Drying rate curve', 'Vacuum drying'],
        image='/assets/img/share/whiteboard-drying-basics.jpg',
        related=[('/articles/drying-and-dryer-scale-up/', 'Drying and dryer scale-up'),
                 ('/articles/atfd-agitated-thin-film-dryer/', 'Agitated thin film dryer'),
                 ('/calculators/heat-load-calculator/', 'Heat load calculator')]),
    'crystallisation': dict(
        module='crystallisation',
        h1='Crystallisation: Whiteboard Lesson',
        seo_title='Crystallisation Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on crystallisation: yield from solubility, crash cooling and fines, seeding, the metastable zone, oiling out and polymorphs.',
        intro='Six questions on crystallisation: working out yield from solubility, why crash cooling gives fines, why and where to seed, oiling out and why polymorphs matter for a drug.',
        keywords='crystallisation explained, crystallisation yield solubility, supersaturation nucleation, seeding crystallisation, metastable zone width, oiling out, polymorphs, crystallisation interview questions',
        teaches=['Crystallisation yield', 'Seeding and the metastable zone', 'Polymorphism'],
        image='/assets/img/share/whiteboard-crystallisation.jpg',
        related=[('/articles/solubility-curve-and-crystallisation-yield/', 'Solubility curve and crystallisation yield'),
                 ('/articles/crystallisation-scale-up/', 'Crystallisation scale-up'),
                 ('/calculators/filtration-calculator/', 'Filtration calculator')]),
    'mass-balance-yield': dict(
        module='mass_balance_yield',
        h1='Mass Balance and Yield: Whiteboard Lesson',
        seo_title='Mass Balance and Yield Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on mass balance and yield: molar vs weight yield, limiting reagent, conversion and selectivity, closing a balance and recycle.',
        intro='Six questions on yield and mass balance: molar and weight yield, the limiting reagent and excess, conversion times selectivity, finding missing kilograms and the catch with recycling mother liquor.',
        keywords='molar yield vs weight yield, limiting reagent excess, conversion selectivity yield, mass balance closure, mother liquor recycle purge, chemical engineering interview questions',
        teaches=['Molar and weight yield', 'Limiting reagent', 'Mass balance closure'],
        image='/assets/img/share/whiteboard-mass-balance-yield.jpg',
        related=[('/articles/material-and-energy-balance/', 'Material and energy balance'),
                 ('/articles/improve-reaction-conversion-and-yield/', 'Improve reaction conversion and yield'),
                 ('/calculators/batch-size-calculator/', 'Batch size calculator')]),
    'hazop-basics': dict(
        module='hazop_basics',
        h1='HAZOP Basics: Whiteboard Lesson',
        seo_title='HAZOP Basics Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on HAZOP: guide words and deviations, the order of a HAZOP row, safeguard strength, timing, the team and management of change.',
        intro='Six questions on HAZOP: how deviations are built, what goes in each column, which safeguards count most, when to hold the study, who should be in the room and why a small change still needs a review.',
        keywords='HAZOP explained, HAZOP guide words, HAZOP deviation causes consequences safeguards, independent safeguard, HAZOP team, management of change MOC, process safety interview questions',
        teaches=['HAZOP method', 'Safeguards', 'Management of change'],
        image='/assets/img/share/whiteboard-hazop-basics.jpg',
        related=[('/articles/hazop-made-practical/', 'HAZOP made practical'),
                 ('/articles/lopa-and-sil-basics/', 'LOPA and SIL basics'),
                 ('/whiteboard/relief-valves/', 'Relief valves: whiteboard lesson')]),
    'batch-heating-cooling': dict(
        module='batch_heating_cooling',
        h1='Batch Heating and Cooling: Whiteboard Lesson',
        seo_title='Batch Heating and Cooling Time: Whiteboard Lesson',
        description='Six-question whiteboard lesson on jacketed reactors: heat needed, why heating slows, heat-up time, wetted area, glass-lined U and thermal shock.',
        intro='Six questions on heating and cooling a batch in a jacketed reactor: how much heat, why the last degrees are slow, working out heat-up time, low batch levels, glass-lined reactors and thermal shock.',
        keywords='batch heating time, jacketed reactor heat transfer, heat up time formula, wetted area reactor, glass lined reactor U value, thermal shock glass lined, interview questions',
        teaches=['Batch heat-up time', 'Jacketed vessel heat transfer', 'Glass-lined reactor limits'],
        image='/assets/img/share/whiteboard-batch-heating-cooling.jpg',
        related=[('/calculators/jacketed-vessel-heat-transfer/', 'Jacketed vessel heat transfer calculator'),
                 ('/calculators/batch-cooling-tr-calculator/', 'Batch cooling TR calculator'),
                 ('/articles/jacket-and-limpet-coil-design/', 'Jacket and limpet coil design')]),
    'steam-and-steam-traps': dict(
        module='steam_traps',
        h1='Steam and Steam Traps: Whiteboard Lesson',
        seo_title='Steam and Steam Traps Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on steam: saturated vs superheated, lower pressure for heating, what traps do, flash steam and water hammer in mains.',
        intro='Six questions on steam systems: why heaters use saturated steam, why lower pressure gives more heat per kilogram, what a trap does, telling flash steam from a failed trap, how much flashes and draining the mains.',
        keywords='steam trap explained, saturated vs superheated steam, steam pressure latent heat, flash steam calculation, failed steam trap, steam main water hammer, utilities interview questions',
        teaches=['Steam for process heating', 'Steam traps', 'Flash steam'],
        image='/assets/img/share/whiteboard-steam-and-steam-traps.jpg',
        related=[('/calculators/steam-heating-calculator/', 'Steam heating calculator'),
                 ('/calculators/steam-tables/', 'Steam tables'),
                 ('/articles/steam-system-efficiency/', 'Steam system efficiency')]),
    'liquid-extraction-workup': dict(
        module='extraction_workup',
        h1='Extraction and Workup: Whiteboard Lesson',
        seo_title='Liquid-Liquid Extraction and Workup: Whiteboard Lesson',
        description='Six-question whiteboard lesson on workup: partition coefficient, split extractions, emulsions, pH swings, which layer is on top and the rag layer.',
        intro='Six questions on liquid-liquid extraction and workup: how much one wash extracts, why two smaller washes win, breaking emulsions, using pH to move acids and bases, which layer floats and what to do with the rag layer.',
        keywords='liquid liquid extraction explained, partition coefficient, multiple extractions, emulsion brine, pH swing extraction pKa, DCM water layer, rag layer separator, workup interview questions',
        teaches=['Partition coefficient', 'Workup and phase separation', 'pH-controlled extraction'],
        image='/assets/img/share/whiteboard-liquid-extraction-workup.jpg',
        related=[('/articles/workup-and-phase-separation/', 'Workup and phase separation'),
                 ('/whiteboard/crystallisation/', 'Crystallisation: whiteboard lesson'),
                 ('/articles/static-electricity-solvent-fires/', 'Static electricity and solvent fires')]),
    'control-valves': dict(
        module='control_valves',
        h1='Control Valves: Whiteboard Lesson',
        seo_title='Control Valves Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on control valves: Kv and Cv, flow vs pressure drop, oversized valves, equal percentage vs linear, cavitation and positioners.',
        intro='Six questions on control valves: what Kv means, how flow follows pressure drop, why an oversized valve controls badly, choosing a characteristic, cavitation noise and what a positioner does.',
        keywords='control valve explained, Kv Cv meaning, control valve sizing, oversized control valve, equal percentage vs linear, control valve cavitation, valve positioner, instrumentation interview questions',
        teaches=['Control valve sizing', 'Valve characteristics', 'Valve cavitation'],
        image='/assets/img/share/whiteboard-control-valves.jpg',
        related=[('/calculators/control-valve-sizing/', 'Control valve sizing calculator'),
                 ('/whiteboard/pid-control/', 'PID control: whiteboard lesson'),
                 ('/articles/instrumentation-basics/', 'Instrumentation basics')]),
    'scrubbers': dict(
        module='scrubbers',
        h1='Scrubbers: Whiteboard Lesson',
        seo_title='Scrubbers and Gas Absorption: Whiteboard Lesson',
        description='Six-question whiteboard lesson on vent scrubbers: choosing the liquid, caustic needed for HCl, wetting the packing, spent caustic, ammonia and pump trips.',
        intro='Six questions on vent scrubbers: which liquid for which gas, how much caustic HCl needs, why dry packing lets gas through, when to change caustic, scrubbing ammonia and what must happen when the pump trips.',
        keywords='scrubber explained, HCl scrubber caustic, caustic consumption HCl, packed column distributor, spent caustic pH, ammonia scrubber sulphuric acid, scrubber interlock, interview questions',
        teaches=['Gas absorption', 'Scrubber liquid selection', 'Scrubber safety'],
        image='/assets/img/share/whiteboard-scrubbers.jpg',
        related=[('/calculators/packed-scrubber-calculator/', 'Packed scrubber calculator'),
                 ('/calculators/scrubber-solution-calculator/', 'Scrubber solution calculator'),
                 ('/articles/scrubber-design/', 'Scrubber design')]),
    'effluent-treatment-basics': dict(
        module='effluent_treatment',
        h1='Effluent Treatment Basics: Whiteboard Lesson',
        seo_title='Effluent Treatment (ETP) Basics: Whiteboard Lesson',
        description='Six-question whiteboard lesson on effluent treatment: COD vs BOD, biodegradability, COD load, solvent losses, aeration oxygen, and salts with MEE and ZLD.',
        intro='Six questions on the effluent treatment plant: COD and BOD, what the BOD/COD ratio says, working out COD load, how much COD a lost solvent adds, dissolved oxygen in aeration and why salts need evaporation.',
        keywords='ETP basics, COD vs BOD, BOD COD ratio biodegradability, COD load calculation, solvent COD, aeration dissolved oxygen, TDS MEE ZLD, environment interview questions',
        teaches=['COD and BOD', 'Effluent load', 'Zero liquid discharge'],
        image='/assets/img/share/whiteboard-effluent-treatment-basics.jpg',
        related=[('/articles/etp-basics/', 'ETP basics'),
                 ('/articles/etp-load-reduction-at-source/', 'ETP load reduction at source'),
                 ('/articles/atfd-agitated-thin-film-dryer/', 'Agitated thin film dryer')]),
    'process-measurement': dict(
        module='process_measurement',
        h1='Flow, Level and Pressure Measurement: Whiteboard Lesson',
        seo_title='Flow, Level and Pressure Measurement: Whiteboard Lesson',
        description='Six-question whiteboard lesson on plant instruments: DP flow and square roots, turndown, DP level and density, mass flowmeters, gauge siphons and thermowells.',
        intro='Six questions on plant measurement: reading a DP flowmeter, why it struggles at low flow, how density fools a level transmitter, why mass flowmeters suit dosing, protecting steam gauges and getting temperature probes into the liquid.',
        keywords='DP flowmeter square root, orifice turndown, DP level density error, mass flowmeter dosing, pressure gauge siphon, thermowell immersion, instrumentation interview questions',
        teaches=['Flow measurement', 'Level measurement', 'Pressure and temperature measurement'],
        image='/assets/img/share/whiteboard-process-measurement.jpg',
        related=[('/articles/instrumentation-basics/', 'Instrumentation basics'),
                 ('/whiteboard/control-valves/', 'Control valves: whiteboard lesson'),
                 ('/whiteboard/pid-control/', 'PID control: whiteboard lesson')]),
    'dust-explosions': dict(
        module='dust_explosions',
        h1='Dust Explosions: Whiteboard Lesson',
        seo_title='Dust Explosions Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on dust explosions: the explosion pentagon, Kst classes, secondary explosions, venting, particle size and safe housekeeping.',
        intro='Six questions on combustible dust: what a dust explosion needs, what Kst classes mean, why thin layers cause secondary explosions, how collectors are protected, why finer powder is worse and how to clean up safely.',
        keywords='dust explosion explained, explosion pentagon, Kst St1 St2 St3, secondary dust explosion, explosion vent panel, minimum ignition energy powder, dust housekeeping, process safety interview questions',
        teaches=['Dust explosion hazards', 'Kst classification', 'Dust explosion protection'],
        image='/assets/img/share/whiteboard-dust-explosions.jpg',
        related=[('/articles/dust-explosions/', 'Dust explosions'),
                 ('/articles/static-electricity-solvent-fires/', 'Static electricity and solvent fires'),
                 ('/whiteboard/drying-basics/', 'Drying basics: whiteboard lesson')]),
    'hydrogenation-safety': dict(
        module='hydrogenation_safety',
        h1='Hydrogenation Safety: Whiteboard Lesson',
        seo_title='Hydrogenation Safety Explained: Whiteboard Lesson',
        description='Six-question whiteboard lesson on hydrogenation: hydrogen flammability, nitrogen purging, pyrophoric catalyst, mass transfer, heat control and leak detection.',
        intro='Six questions on running hydrogenations safely: how flammable hydrogen is, purging before and after, handling spent catalyst, why stirring speeds uptake, controlling the exotherm and where to put gas detectors.',
        keywords='hydrogenation safety, hydrogen flammable range, nitrogen purge hydrogenation, pyrophoric palladium carbon, hydrogen mass transfer, nitro reduction exotherm, hydrogen detector placement, interview questions',
        teaches=['Hydrogen hazards', 'Catalyst handling', 'Hydrogenation heat control'],
        image='/assets/img/share/whiteboard-hydrogenation-safety.jpg',
        related=[('/articles/hydrogenation-safety/', 'Hydrogenation safety'),
                 ('/articles/hydrogenation-and-reduction/', 'Hydrogenation and reduction'),
                 ('/calculators/hydrogen-solubility-calculator/', 'Hydrogen solubility calculator')]),
    'compressed-air-nitrogen': dict(
        module='compressed_air_nitrogen',
        h1='Compressed Air and Nitrogen: Whiteboard Lesson',
        seo_title='Compressed Air and Nitrogen: Whiteboard Lesson',
        description='Six-question whiteboard lesson on compressed air and nitrogen: air cost, pressure and power, dew point, PSA purity, nitrogen asphyxiation and solvent transfers.',
        intro='Six questions on two everyday utilities: how little compressor power does useful work, what each bar costs, why instrument air must be dry, the price of nitrogen purity, nitrogen in confined spaces and why air never pushes solvent.',
        keywords='compressed air efficiency, compressor pressure power saving, instrument air dew point, PSA nitrogen purity output, nitrogen asphyxiation confined space, solvent transfer nitrogen, utilities interview questions',
        teaches=['Compressed air efficiency', 'Nitrogen generation', 'Nitrogen safety'],
        image='/assets/img/share/whiteboard-compressed-air-nitrogen.jpg',
        related=[('/articles/compressed-air-and-nitrogen/', 'Compressed air and nitrogen'),
                 ('/articles/inerting-and-loc/', 'Inerting and LOC'),
                 ('/whiteboard/steam-and-steam-traps/', 'Steam and steam traps: whiteboard lesson')]),
}

HUB = [
    ('npsh-cavitation', 'NPSH and cavitation', 'Where cavitation starts, why bubbles form, NPSH available as a savings account and what to check when a pump crackles.'),
    ('heat-exchangers', 'Heat exchangers', 'LMTD, fouling, tube velocity, tube or shell side, waterlogged steam heaters and air in coolers.'),
    ('runaway-reactions', 'Runaway reactions', 'Heat made vs heat removed, accumulation, MTSR, adiabatic rise and agitator trips.'),
    ('distillation-basics', 'Distillation basics', 'Reflux ratio, minimum reflux, flooding, weeping, azeotropes and batch distillation cuts.'),
    ('vacuum-ejectors', 'Vacuum and ejectors', 'Gauge vs absolute, finding leaks, the rate-of-rise test, ejectors and condensers.'),
    ('relief-valves', 'Relief valves', 'Set pressure and MAWP, thermal relief, back pressure, rupture discs, isolation valves and chatter.'),
    ('cooling-towers', 'Cooling towers', 'Range and approach, the wet bulb limit, evaporation, cycles, blowdown and fouled fill.'),
    ('agitation-mixing', 'Agitation and mixing', 'Power and speed, baffles, impellers for solids and gas, scale-up blend time and dosing point.'),
    ('pid-control', 'PID control', 'Offset, gain, derivative and noise, fail positions, cascade and integral windup.'),
    ('line-sizing-pressure-drop', 'Line sizing and pressure drop', 'Velocity and diameter, the fifth-power rule, typical speeds, suction lines, steam and water hammer.'),
    ('filtration-centrifuges', 'Filtration and centrifuges', 'Cake growth, soft and cracked cakes, G-force, spin-dry limits and inerting.'),
    ('drying-basics', 'Drying basics', 'Wet and dry basis, the drying curve, vacuum drying, evaporation heat, case hardening and end point.'),
    ('crystallisation', 'Crystallisation', 'Yield from solubility, crash cooling, seeding, the metastable zone, oiling out and polymorphs.'),
    ('mass-balance-yield', 'Mass balance and yield', 'Molar and weight yield, limiting reagent, conversion and selectivity, closing the balance, recycle.'),
    ('hazop-basics', 'HAZOP basics', 'Guide words, the HAZOP row, safeguard strength, timing, the team and management of change.'),
    ('batch-heating-cooling', 'Batch heating and cooling', 'Heat needed, heat-up time, wetted area, glass-lined reactors and thermal shock.'),
    ('steam-and-steam-traps', 'Steam and steam traps', 'Saturated steam, pressure and latent heat, trap jobs, flash steam and water hammer.'),
    ('liquid-extraction-workup', 'Extraction and workup', 'Partition coefficient, split washes, emulsions, pH swings, layer order and the rag layer.'),
    ('control-valves', 'Control valves', 'Kv and Cv, flow and pressure drop, oversizing, characteristics, cavitation and positioners.'),
    ('scrubbers', 'Scrubbers', 'Liquid choice, caustic for HCl, wet packing, spent caustic, ammonia and pump trips.'),
    ('effluent-treatment-basics', 'Effluent treatment basics', 'COD vs BOD, biodegradability, COD load, solvent losses, aeration and salts.'),
    ('process-measurement', 'Flow, level and pressure measurement', 'DP flow, turndown, DP level and density, mass flowmeters, gauge siphons and thermowells.'),
    ('dust-explosions', 'Dust explosions', 'The pentagon, Kst classes, secondary explosions, venting, particle size and housekeeping.'),
    ('hydrogenation-safety', 'Hydrogenation safety', 'Hydrogen flammability, purging, spent catalyst, mass transfer, heat control and detection.'),
    ('compressed-air-nitrogen', 'Compressed air and nitrogen', 'Air cost, pressure and power, dew point, PSA purity, nitrogen entry and solvent transfers.'),
]

E = lambda s: html.escape(s, quote=True)
U = lambda p: "{{ '" + p + "' | relative_url }}"


def yq(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'


def lesson_page(slug, m):
    mod = importlib.import_module(m['module'])
    steps = mod.STEPS
    url = f'{SITE}/whiteboard/{slug}/'
    lr = {"@type": "LearningResource", "name": f"{mod.TITLE}: whiteboard lesson", "description": m['description'], "url": url,
          "learningResourceType": "Interactive lesson", "educationalLevel": "Beginner", "inLanguage": "en", "isAccessibleForFree": True,
          "timeRequired": "PT8M", "teaches": m['teaches'],
          "author": {"@type": "Person", "@id": f"{SITE}/about/#ankush-chopra", "name": "Ankush Chopra", "url": f"{SITE}/about/"},
          "publisher": {"@type": "Organization", "@id": f"{SITE}/#organization", "name": "PharmaChemE", "url": f"{SITE}/"},
          "datePublished": TODAY, "dateModified": TODAY}
    faq = {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": s['q'], "acceptedAnswer": {"@type": "Answer", "text": s['summary']}} for s in steps]}
    sd = json.dumps({"@context": "https://schema.org", "@graph": [lr, faq]}, ensure_ascii=False, indent=2)
    sd = '\n'.join('  ' + l for l in sd.splitlines())
    qa = '\n'.join(f'  <h3>{E(s["q"])}</h3>\n  <p>{E(s["summary"])}</p>' for s in steps)
    rel = '\n'.join(f'    <a href="{U(u)}">{E(t)}</a>' for u, t in m['related'])
    return f"""---
layout: default
title: {yq(mod.TITLE + ': Whiteboard Lesson with Bubbles')}
seo_title: {yq(m['seo_title'])}
description: {yq(m['description'])}
image: {m['image']}
keywords: {yq(m['keywords'])}
breadcrumbs:
  - label: Interview Prep
    url: /process-engineering-faq/
  - label: Whiteboard lessons
    url: /whiteboard/
  - label: {yq(mod.TITLE)}
    url: /whiteboard/{slug}/
structured_data: |
{sd}
last_modified_at: {TODAY}
---
<link rel="stylesheet" href="{{{{ '/assets/css/whiteboard.css' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}">
<link rel="stylesheet" href="{{{{ '/assets/css/articles.css' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}">

<div class="container calc-page-head">
  <h1>{E(m['h1'])}</h1>
  <p>{E(m['intro'])} Pick an answer, hear what Bubbles thinks of it, then watch the whiteboard explain it. Turn the sound on; there are captions too.</p>
</div>
<div class="container">
  <div class="wb" id="wb" data-src="{{{{ '/assets/data/wb-{slug}.json' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}" data-audio="{{{{ '/assets/audio/wb/{slug}/' | relative_url }}}}"></div>
</div>

<div class="container article-body" style="padding:8px 20px 64px;">
  <h2 id="answers">The six questions and answers</h2>
  <p>The same lesson as text, for reading or revision. More lessons: <a href="{U('/whiteboard/')}">all whiteboard lessons</a>. More interview questions: <a href="{U('/process-engineering-faq/')}">Interview Prep</a>.</p>
{qa}

  <div class="related-box">
    <h3>Related</h3>
{rel}
    <a href="{U('/whiteboard/')}">More whiteboard lessons</a>
  </div>
</div>

<script src="{{{{ '/assets/js/whiteboard.js' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}" defer></script>
"""


def hub_page():
    items = [{"@type": "ListItem", "position": i + 1, "url": f"{SITE}/whiteboard/{s}/", "name": f"{t}: whiteboard lesson"} for i, (s, t, _) in enumerate(HUB)]
    sd = json.dumps({"@context": "https://schema.org", "@type": "ItemList", "name": "Whiteboard lessons", "itemListElement": items}, ensure_ascii=False, indent=2)
    sd = '\n'.join('  ' + l for l in sd.splitlines())
    cards = '\n'.join(f"""    <div class="tool-card">
      <h3>{E(t)}</h3>
      <p>{E(d)}</p>
      <a href="{U(f'/whiteboard/{s}/')}" class="btn btn-outline btn-sm">Start the lesson</a>
    </div>""" for s, t, d in HUB)
    return f"""---
layout: default
title: "Whiteboard Lessons for Chemical Engineers"
seo_title: "Chemical Engineering Whiteboard Lessons | PharmaChemE"
description: "Free voiced whiteboard lessons for chemical engineers: pumps, heat transfer, reactions, separation, drying, crystallisation, utilities and control."
image: /assets/img/share/whiteboard-npsh.jpg
breadcrumbs:
  - label: Interview Prep
    url: /process-engineering-faq/
  - label: Whiteboard lessons
    url: /whiteboard/
structured_data: |
{sd}
last_modified_at: {TODAY}
---
<div class="container calc-page-head">
  <h1>Whiteboard lessons</h1>
  <p>Six interview-style questions per topic. Pick an answer, hear what Bubbles thinks of it, then watch the whiteboard draw the explanation while the voice talks you through it. About eight minutes each, with captions.</p>
</div>
<div class="container section" style="padding-top:0;">
  <div class="grid-cards">
{cards}
  </div>
  <p style="margin-top:22px;color:var(--muted)">Practising for interviews? The <a href="{U('/process-engineering-faq/')}">Interview Prep</a> page has 142 more questions with answers.</p>
</div>
"""


if __name__ == '__main__':
    for slug, m in PAGES.items():
        d = os.path.join(ROOT, 'whiteboard', slug); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w').write(lesson_page(slug, m))
        print('wrote', slug)
    open(os.path.join(ROOT, 'whiteboard', 'index.html'), 'w').write(hub_page())
    print('wrote hub')
