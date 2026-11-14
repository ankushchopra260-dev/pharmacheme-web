/* Reaction lab source data. Built by tools/rxlab/build.js into /molecules/reaction-lab/ pages.
   Species are SMILES; atom indices follow the order atoms are written in the SMILES (explicit H written as [2H]).
   Arrow ends: ['l', sp, atom] lone pair on an atom | ['b', sp, a1, a2] a bond | ['a', sp, atom] an atom |
               ['n', sp1, a1, sp2, a2] the place where a new bond forms between two atoms. side: 1 or -1 bows the curve.
   Lab actions are cumulative states for the flask animation. Temperatures in °C. */
module.exports = [
  {
    slug: 'acid-chloride-thionyl-chloride',
    name: 'Acid chloride formation with thionyl chloride',
    short: 'Acid chloride (SOCl₂)',
    cat: 'Acylation and activation',
    seo: 'Acid Chloride with Thionyl Chloride: Mechanism',
    desc: 'Carboxylic acid to acid chloride with thionyl chloride: animated mechanism, lab sequence, SO₂ and HCl off-gas per kg, by-products and moisture control.',
    intro: 'Thionyl chloride turns a carboxylic acid into the acid chloride, the usual way to activate an acid before making an amide or ester. Both by-products, sulfur dioxide and hydrogen chloride, are gases, so they leave the reactor and the work-up is simple. That same gas is the main plant issue: it comes off as fast as the reaction runs, and it must go to a scrubber.',
    eq: { r: [['CC(=O)O', 'Carboxylic acid (R = CH₃ shown)'], ['O=S(Cl)Cl', 'Thionyl chloride']], p: [['CC(=O)Cl', 'Acid chloride'], ['O=S=O', 'Sulfur dioxide'], ['Cl[2H]', 'Hydrogen chloride']], cond: 'cat. DMF, toluene, 50–70 °C' },
    mech: [
      { cap: 'The carbonyl oxygen of the acid attacks sulfur, and a chloride is pushed off thionyl chloride. This is an addition–elimination at sulfur, drawn here in one step.',
        sp: [{ s: 'CC(=O)O', lp: [2] }, { s: 'O=S(Cl)Cl' }],
        ar: [{ f: ['l', 0, 2], t: ['n', 0, 2, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The free chloride ion attacks the carbonyl carbon, which is now very electron-poor because its oxygen carries a positive charge.',
        sp: [{ s: 'CC(O)=[O+]S(=O)Cl' }, { s: '[Cl-]', lp: [0] }],
        ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 1] }, { f: ['b', 0, 1, 3], t: ['a', 0, 3] }] },
      { cap: 'The tetrahedral intermediate collapses. The C=O bond re-forms, and the chlorosulfite group leaves and falls apart into sulfur dioxide gas and a chloride ion.',
        sp: [{ s: 'CC(O[2H])(Cl)OS(=O)Cl', lp: [2] }],
        ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 1, 5], t: ['b', 0, 5, 6] }, { f: ['b', 0, 6, 8], t: ['a', 0, 8] }] },
      { cap: 'Chloride takes the proton from the oxygen, giving hydrogen chloride gas and the neutral acid chloride.',
        sp: [{ s: 'CC(=[O+][2H])Cl' }, { s: '[Cl-]', lp: [0] }, { s: 'O=S=O' }],
        ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 3] }, { f: ['b', 0, 2, 3], t: ['a', 0, 2] }] },
      { cap: 'Products: the acid chloride stays in solution; SO₂ and HCl leave as gas. A drop of DMF speeds this up by forming a more reactive chloroiminium (Vilsmeier) reagent with thionyl chloride.',
        sp: [{ s: 'CC(=O)Cl' }, { s: 'O=S=O' }, { s: 'Cl[2H]' }], ar: [] }
    ],
    lab: [
      { cap: 'Dry reactor under nitrogen. Charge toluene and the carboxylic acid; it forms a white slurry.', level: 0.45, color: '#e9e4d8', T: 25, n2: true, solid: '#ffffff', stir: true },
      { cap: 'Add a few drops of DMF as catalyst. Warm to 50 °C.', T: 50, heat: true },
      { cap: 'Dose thionyl chloride slowly from the addition funnel. Gas starts at once: SO₂ and HCl go to the caustic scrubber.', dose: { color: '#f2e6a0', name: 'SOCl₂' }, gas: { name: 'SO₂ + HCl' }, level: 0.55, T: 55 },
      { cap: 'The solid dissolves as the acid chloride forms. The rate of gas follows the dosing rate: stop dosing and the gas slows down.', solid: null, color: '#efe2a8', gas: { name: 'SO₂ + HCl' }, T: 60 },
      { cap: 'Hold at 70 °C until gas stops and a sample shows no acid left (quench a sample in methanol and check for the methyl ester).', T: 70, gas: { name: 'SO₂ + HCl', slow: true }, heat: true },
      { cap: 'Distil off excess thionyl chloride with some toluene under vacuum, so it does not carry into the next step.', T: 45, level: 0.42, color: '#e8d58e', distil: true, heat: true }
    ],
    gas: [{ n: 'Sulfur dioxide', s: 'O=S=O', mol: 1, note: 'Toxic, choking. Absorbed in a caustic scrubber as sulfite.' }, { n: 'Hydrogen chloride', s: 'Cl', mol: 1, note: 'Corrosive fumes. Absorbed in water or caustic.' }],
    care: [
      'Gas evolution is immediate and follows the dosing rate. Size the vent line and scrubber for the peak gas rate, not the average.',
      'Thionyl chloride reacts violently with water, giving the same gases. Keep the reactor, lines and solvent dry.',
      'Do not close the vent. A blocked scrubber line pressurises the reactor quickly.',
      'Excess thionyl chloride must be removed before the next step, or it will react with amines, alcohols and water there.',
      'DMF is a good catalyst but forms traces of dimethylcarbamoyl chloride, a suspected carcinogen; keep the catalyst amount low and know where it goes.'
    ],
    byp: [
      ['Acid anhydride', 'Forms when acid chloride meets unreacted acid. Dose SOCl₂ in slight excess (1.1–1.3 eq) and complete the conversion before cooling.'],
      ['Sulfur-containing residues', 'Remove excess SOCl₂ by distillation with a chaser solvent.'],
      ['Colour (dark product)', 'From overheating or old, yellow SOCl₂. Keep below 80 °C and use fresh reagent.']
    ],
    moist: { lvl: 'High', txt: 'Water destroys thionyl chloride and the acid chloride product, releasing HCl and SO₂ and lowering the yield. Use dry solvent (water below about 0.05 %), a nitrogen blanket and dry lines.' },
    exo: { txt: 'Mildly exothermic overall, but the gas release is the controlling hazard. Control by the dosing rate.' },
    plant: [
      'Scrubber: two stages of caustic, with a water trap before the vacuum pump during distillation.',
      'Check off-gas flow during dosing; if it stops while you are still dosing, the reaction may have stalled and reagent is building up.',
      'Glass-lined or nickel-alloy equipment; HCl and SO₂ with moisture attack stainless steel.'
    ],
    links: [['/molecules/reaction/', 'Reaction Builder: balance and charges'], ['/articles/common-chemical-reactions-in-plants/', 'Common reactions in plants'], ['/process-modelling/batch-mass-balance-flowsheet/', 'Batch mass balance tool']]
  },
  {
    slug: 'grignard-addition-to-ketone',
    name: 'Grignard addition to a ketone',
    short: 'Grignard addition',
    cat: 'Carbon–carbon bond formation',
    seo: 'Grignard Reaction with a Ketone: Mechanism',
    desc: 'Grignard reagent adding to a ketone: animated mechanism, lab sequence, why water and air must be kept out, exotherm, quench gas and by-product control.',
    intro: 'A Grignard reagent (R–Mg–X) carries a carbon with a lot of negative character. It adds to the carbon of a ketone to make a new C–C bond, and after an acidic quench gives a tertiary alcohol. It is one of the most useful bond-forming reactions in API plants, and one of the most moisture-sensitive.',
    eq: { r: [['CC(C)=O', 'Ketone (acetone shown)'], ['C[Mg]Br', 'Methylmagnesium bromide']], p: [['CC(C)(C)O', 'Tertiary alcohol']], cond: '1) THF, 0–10 °C  2) aq. NH₄Cl', note: 'magnesium salts from the quench not shown' },
    mech: [
      { cap: 'The carbon–magnesium bond is strongly polarised; its electrons attack the carbonyl carbon. The C=O π bond moves onto oxygen.',
        sp: [{ s: 'C[Mg]Br' }, { s: 'CC(C)=O' }],
        ar: [{ f: ['b', 0, 0, 1], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 1, 3], t: ['a', 1, 3] }] },
      { cap: 'A magnesium alkoxide forms and simply waits in solution until the quench supplies a proton.',
        sp: [{ s: 'CC(C)(C)O[Mg]Br' }], ar: [] },
      { cap: 'In the quench, the alkoxide oxygen takes a proton from the acid. Magnesium salts go into the water layer.',
        sp: [{ s: 'CC(C)(C)[O-]', lp: [4] }, { s: '[2H][O+]([2H])[2H]' }],
        ar: [{ f: ['l', 0, 4], t: ['n', 0, 4, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'Product: the tertiary alcohol. Any water present before the quench would have destroyed the Grignard reagent instead, giving methane gas.',
        sp: [{ s: 'CC(C)(C)O' }, { s: 'O' }], ar: [] }
    ],
    lab: [
      { cap: 'Dry the reactor (water below 0.01 % in THF) and keep it under nitrogen.', level: 0, T: 25, n2: true },
      { cap: 'Charge the Grignard solution in THF. It is grey-brown.', level: 0.45, color: '#8b7d6b', T: 25, stir: true },
      { cap: 'Cool to 0 °C in the jacket.', T: 0, cool: true },
      { cap: 'Dose the ketone slowly. Each drop reacts at once: the temperature rises, so dosing is set by the cooling.', dose: { color: '#f5f5f5', name: 'Ketone in THF' }, T: 8, level: 0.6, glow: true, cool: true },
      { cap: 'Stir at 5–10 °C until a quenched sample shows no ketone left.', T: 6, cool: true, color: '#9a8d79' },
      { cap: 'This flask is now the quench vessel with cold aqueous ammonium chloride; the reaction mass is transferred into it slowly (reverse quench). Excess Grignard gives methane; magnesium salts form a white solid.', dose: { color: '#9a8d79', name: 'Reaction mass' }, gas: { name: 'CH₄ (excess)', slow: true }, T: 15, level: 0.85, solid: '#ffffff', glow: true },
      { cap: 'Two layers: the product in the organic layer, magnesium salts in the water.', layers: ['#efe8d4', '#cfe6f2'], solid: null, T: 20, gas: null, cool: false }
    ],
    gas: [{ n: 'Methane', s: 'C', mol: 0.1, per: 'per 0.1 eq of excess Grignard destroyed in the quench', note: 'Flammable. Vent to a safe place; keep the quench area free of ignition sources.' }],
    care: [
      'Water and air destroy the reagent. Dry the reactor, solvent and nitrogen; check water by Karl Fischer before charging.',
      'The addition is fast and exothermic. If the temperature does not rise when dosing starts, stop: unreacted ketone may be accumulating.',
      'Quench is also exothermic and gives flammable gas from excess reagent. Quench slowly into cold aqueous acid with good venting.',
      'THF can contain peroxides. Use inhibited or freshly tested solvent and never distil it to dryness.',
      'When making the Grignard reagent from magnesium, the start-up (initiation) can be delayed and then run away. Add only a small part of the halide until the reaction has clearly started.'
    ],
    byp: [
      ['Alkane (R–H)', 'From water or alcohol in the system destroying the reagent. Dry everything; titrate the reagent before use.'],
      ['Enolisation (ketone recovered)', 'Bulky reagents can take a proton instead of adding. Lower temperature or add cerium chloride.'],
      ['Reduction to secondary alcohol', 'Reagents with β-hydrogens can transfer a hydride. Keep cold; choose the reagent with care.'],
      ['Wurtz coupling (R–R)', 'During reagent preparation at high halide concentration. Dose the halide slowly into magnesium.']
    ],
    moist: { lvl: 'Very high', txt: 'One mole of water destroys one mole of Grignard reagent and makes alkane gas. Even 0.1 % water in a large solvent charge wastes a lot of reagent. Dry solvent, dry nitrogen, and a dry, leak-tested reactor are required.' },
    exo: { dH: -60, txt: 'Strongly exothermic, of the order of 60 kcal per mole of reagent added. Run as a dosing-controlled semi-batch.' },
    plant: [
      'Titrate the Grignard solution before use; its strength drops in storage.',
      'Use a reverse quench (reaction mass into the acid) so the acid is always in excess.',
      'Have a plan for what happens if cooling fails during dosing: stop the feed first.'
    ],
    links: [['/articles/grignard-friedel-crafts-coupling/', 'Grignard, Friedel-Crafts and coupling reactions'], ['/process-modelling/semi-batch-dosing-simulator/', 'Semi-batch dosing simulator'], ['/training/modules/runaway-reactions-safe-dosing/', 'Runaway reactions and safe dosing']]
  }
];
