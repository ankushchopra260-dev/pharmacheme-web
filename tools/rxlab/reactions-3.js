/* Reaction lab, third set. Same format as reactions.js. */
module.exports = [
  {
    slug: 'alcohol-to-alkyl-chloride-thionyl-chloride', name: 'Alcohol to alkyl chloride with thionyl chloride', short: 'Alkyl chloride (SOCl₂)', cat: 'Substitution and alkylation',
    seo: 'Alcohol to Alkyl Chloride with SOCl₂: Mechanism',
    desc: 'Primary alcohol to alkyl chloride with thionyl chloride and pyridine: animated mechanism, SO₂ off-gas per kg, moisture control and by-products.',
    intro: 'Thionyl chloride turns an alcohol into a chlorosulfite, a good leaving group. Chloride then displaces it, and the leaving group falls apart into sulfur dioxide and chloride. With pyridine present the HCl is captured as a salt; without a base it leaves as gas along with the SO₂.',
    eq: { r: [['CCCCO', 'Alcohol (n-butanol shown)'], ['O=S(Cl)Cl', 'Thionyl chloride']], p: [['CCCCCl', 'Alkyl chloride'], ['O=S=O', 'Sulfur dioxide'], ['Cl', 'HCl (as pyridine salt)']], cond: 'pyridine (1 eq), toluene, 0–60 °C' },
    mech: [
      { cap: 'The alcohol oxygen attacks sulfur and a chloride leaves thionyl chloride.',
        sp: [{ s: 'CCCCO', lp: [4] }, { s: 'O=S(Cl)Cl' }], ar: [{ f: ['l', 0, 4], t: ['n', 0, 4, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'Pyridine removes the proton from the oxygen, giving the alkyl chlorosulfite.',
        sp: [{ s: 'CCCC[O+]([2H])S(=O)Cl' }, { s: 'c1ccncc1', lp: [3] }], ar: [{ f: ['l', 1, 3], t: ['n', 1, 3, 0, 5] }, { f: ['b', 0, 4, 5], t: ['a', 0, 4] }] },
      { cap: 'Chloride attacks the carbon from the back side (SN2). The leaving group breaks up into sulfur dioxide and a chloride ion in the same movement.',
        sp: [{ s: '[Cl-]', lp: [0] }, { s: 'CCCCOS(=O)Cl' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 3] }, { f: ['b', 1, 3, 4], t: ['b', 1, 4, 5] }, { f: ['b', 1, 5, 7], t: ['a', 1, 7] }] },
      { cap: 'Products: the alkyl chloride, sulfur dioxide gas and chloride (held by pyridine as its hydrochloride).', sp: [{ s: 'CCCCCl' }, { s: 'O=S=O' }, { s: '[Cl-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Under nitrogen, charge toluene, the alcohol and pyridine; cool to 0–5 °C.', level: 0.45, color: '#eef0f2', T: 3, n2: true, cool: true, stir: true },
      { cap: 'Dose thionyl chloride slowly. Exothermic; pyridine hydrochloride starts to come out.', dose: { color: '#f2e6a0', name: 'SOCl₂' }, glow: true, cool: true, T: 8, solid: '#ffffff', level: 0.55 },
      { cap: 'Warm to 50–60 °C. The chlorosulfite breaks down and SO₂ comes off to the scrubber.', heat: true, T: 55, gas: { name: 'SO₂' }, solid: '#ffffff' },
      { cap: 'Hold until gas stops; cool and wash with water to remove pyridine hydrochloride.', T: 20, dose: { color: '#dceef8', name: 'Water' }, solid: null, level: 0.75 },
      { cap: 'Separate: alkyl chloride in the toluene layer.', layers: ['#eef0f2', '#d8ecf6'], T: 20 }
    ],
    gas: [{ n: 'Sulfur dioxide', s: 'O=S=O', mol: 1, note: 'Toxic; caustic scrubber. Without a base, the same amount of HCl gas comes off too.' }],
    care: [
      'Thionyl chloride reacts violently with water, giving SO₂ and HCl. Keep the system dry.',
      'SO₂ release is delayed until the chlorosulfite breaks down on warming. Warm gradually so the gas comes off at a rate the scrubber can take.',
      'Keep excess thionyl chloride small or remove it by distillation before the next step.',
      'Pyridine is toxic and smells; it must be removed in the washes and controlled as a residual solvent.'
    ],
    byp: [
      ['Dialkyl sulfite', 'From a second alcohol reacting with the chlorosulfite when thionyl chloride is short. Use a small excess (1.1–1.2 eq).'],
      ['Alkene', 'Elimination with secondary and tertiary alcohols at high temperature. Keep the warm-up mild.'],
      ['Rearranged or retained-configuration chloride', 'Without pyridine, chiral alcohols can give retention (SNi) or racemisation. Base and solvent decide the stereochemistry.'],
      ['Dialkyl ether', 'Alcohol attacking the chloride under acid. Avoid long holds with unreacted alcohol and HCl.']
    ],
    moist: { lvl: 'High', txt: 'Water destroys thionyl chloride and makes HCl and SO₂; the alcohol must also be dry or reagent is wasted. Dry solvent, base and alcohol (Karl Fischer) and keep a nitrogen blanket.' },
    exo: { short: 'Exothermic on dosing', txt: 'Forming the chlorosulfite and the pyridine salt releases heat at low temperature; the gas comes later, on warming. Both need separate control.' },
    plant: ['Plan the warm-up rate around the scrubber capacity.', 'Glass-lined equipment.', 'Distil the alkyl chloride if it must be free of sulfur residues.'],
    links: [['/molecules/reaction-lab/acid-chloride-thionyl-chloride/', 'Acid chloride with thionyl chloride'], ['/molecules/reaction-lab/mesylation-of-alcohol/', 'Mesylation of an alcohol'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'aromatic-sulfonation', name: 'Aromatic sulfonation with sulfur trioxide (oleum)', short: 'Sulfonation', cat: 'Aromatic substitution',
    seo: 'Aromatic Sulfonation with SO₃: Mechanism, Heat',
    desc: 'Sulfonation of an arene with sulfur trioxide or oleum: animated mechanism, strong heat release, reversibility, water hazard, by-products and plant control.',
    intro: 'Sulfur trioxide, present in oleum (fuming sulfuric acid), is a strong electrophile. An aromatic ring attacks the sulfur, and loss of a proton gives the arenesulfonic acid. Sulfonation is very exothermic and, unlike most aromatic substitutions, reversible: hot dilute acid removes the sulfonic acid group again.',
    eq: { r: [['C1=CC=CC=C1', 'Arene (benzene shown)'], ['O=S(=O)=O', 'Sulfur trioxide (in oleum)']], p: [['OS(=O)(=O)c1ccccc1', 'Arenesulfonic acid']], cond: 'oleum or SO₃, 20–60 °C' },
    mech: [
      { cap: 'A π bond of the ring attacks sulfur in SO₃; an S=O π bond moves onto oxygen.',
        sp: [{ s: 'C1=CC=CC=C1' }, { s: 'O=S(=O)=O' }], ar: [{ f: ['b', 0, 2, 3], t: ['n', 0, 3, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'Hydrogen sulfate removes the proton from the σ-complex and the ring becomes aromatic again.',
        sp: [{ s: '[O-]S(=O)(=O)C1([2H])C=CC=C[CH+]1' }, { s: 'OS(=O)(=O)[O-]', lp: [4] }], ar: [{ f: ['l', 1, 4], t: ['n', 1, 4, 0, 5] }, { f: ['b', 0, 4, 5], t: ['b', 0, 4, 10] }] },
      { cap: 'Product: the arenesulfonic acid (after protonation of the sulfonate). In hot dilute acid this whole sequence can run backwards.', sp: [{ s: 'OS(=O)(=O)c1ccccc1' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the arene (or its solution in sulfuric acid) and cool to 15–20 °C.', level: 0.4, color: '#efefe8', T: 18, cool: true, stir: true },
      { cap: 'Dose oleum slowly. Heat comes off at once and white SO₃ fumes appear at the vent.', dose: { color: '#f3f3ee', name: 'Oleum' }, glow: true, cool: true, gas: { name: 'SO₃ mist', slow: true }, T: 35, level: 0.55, color: '#e9e2c6' },
      { cap: 'Hold at 40–60 °C until the arene is consumed.', heat: true, T: 55, color: '#e2d7aa' },
      { cap: 'This flask is now the drown-out vessel with ice water; the acid mass is run into it slowly. Very exothermic.', dose: { color: '#e2d7aa', name: 'Reaction mass' }, glow: true, cool: true, T: 30, level: 0.85, color: '#ece6cc' },
      { cap: 'The sulfonic acid (or its sodium salt after neutralising) is isolated from the aqueous acid.', T: 20, solid: '#ffffff' }
    ],
    gas: [], gasNote: 'None; SO₃ mist from oleum',
    care: [
      'Oleum and SO₃ react violently with water and give dense, corrosive acid mist. Never add water to oleum.',
      'Sulfonation releases about 40 kcal per mole with SO₃; dose by the cooling capacity.',
      'Charring and oxidation start at high temperature and with excess SO₃; stay inside the developed temperature window.',
      'The drown-out (dilution) of the acid mass is very exothermic; add the acid to ice water, slowly, with cooling.'
    ],
    byp: [
      ['Disulfonic acids', 'Excess SO₃ or high temperature. Use close to the required amount and control temperature.'],
      ['Sulfones (Ar–SO₂–Ar)', 'From a sulfonic acid reacting with more arene at high SO₃ strength. Keep the arene from building up.'],
      ['Isomers', 'Sulfonation is reversible, so time and temperature can shift the isomer ratio towards the thermodynamic product.'],
      ['Desulfonation', 'Heating in dilute acid removes the group again. Avoid long hot holds after dilution.']
    ],
    moist: { lvl: 'High', txt: 'Water reacts with SO₃ to form sulfuric acid, releasing much heat and diluting the sulfonating agent. Too much water stops sulfonation and can let arene accumulate.' },
    exo: { dH: -40, txt: 'Around 40 kcal per mole with SO₃ (less with sulfuric acid, because water forms). Add oleum with cooling; the dilution at the end releases more heat.' },
    plant: ['Track the free SO₃ content of the oleum lot; it sets the amount to charge.', 'Use a mist eliminator or scrubber for SO₃ fumes.', 'Glass-lined or alloy equipment rated for oleum.'],
    links: [['/molecules/reaction-lab/aromatic-nitration/', 'Aromatic nitration'], ['/process-safety/', 'Process safety'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'aldol-condensation', name: 'Aldol condensation (base-catalysed)', short: 'Aldol condensation', cat: 'Carbon–carbon bond formation',
    seo: 'Aldol Condensation: Enolate Mechanism and Control',
    desc: 'Base-catalysed aldol condensation of a ketone and an aldehyde to an enone: animated enolate mechanism, dehydration, by-products and plant control.',
    intro: 'Base removes a proton next to a ketone carbonyl to form an enolate, which adds to an aldehyde. The β-hydroxy ketone then loses water to give a conjugated enone. Using an aldehyde with no α-hydrogen, such as benzaldehyde, keeps it from reacting with itself.',
    eq: { r: [['CC(C)=O', 'Ketone (acetone shown)'], ['O=Cc1ccccc1', 'Aldehyde (benzaldehyde shown)']], p: [['CC(=O)C=Cc1ccccc1', 'Enone'], ['O', 'Water']], cond: 'NaOH (aq), ethanol, 20–40 °C' },
    mech: [
      { cap: 'Hydroxide removes a proton from the carbon next to the carbonyl. The electrons form a C=C bond and push the C=O π electrons onto oxygen: an enolate.',
        sp: [{ s: '[OH-]', lp: [0] }, { s: '[2H]CC(C)=O' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 0] }, { f: ['b', 1, 0, 1], t: ['b', 1, 1, 2] }, { f: ['b', 1, 2, 4], t: ['a', 1, 4] }] },
      { cap: 'The enolate attacks the aldehyde carbon with its C=C bond, re-forming the ketone C=O.',
        sp: [{ s: 'C=C(C)[O-]', lp: [3] }, { s: 'O=Cc1ccccc1' }], ar: [{ f: ['l', 0, 3], t: ['b', 0, 1, 3] }, { f: ['b', 0, 0, 1], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'The alkoxide takes a proton from water, giving the β-hydroxy ketone (the aldol).',
        sp: [{ s: 'CC(=O)CC([O-])c1ccccc1', lp: [5] }, { s: 'O[2H]' }], ar: [{ f: ['l', 0, 5], t: ['n', 0, 5, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'Hydroxide removes the next α-proton, forming a new enolate.',
        sp: [{ s: 'CC(=O)C([2H])C(O)c1ccccc1' }, { s: '[OH-]', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 4] }, { f: ['b', 0, 3, 4], t: ['b', 0, 1, 3] }, { f: ['b', 0, 1, 2], t: ['a', 0, 2] }] },
      { cap: 'The enolate pushes out hydroxide (E1cB elimination), giving the conjugated C=C bond.',
        sp: [{ s: 'CC([O-])=CC(O)c1ccccc1', lp: [2] }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 1, 3], t: ['b', 0, 3, 4] }, { f: ['b', 0, 4, 5], t: ['a', 0, 5] }] },
      { cap: 'Product: the enone (benzalacetone here), with hydroxide regenerated.', sp: [{ s: 'CC(=O)C=Cc1ccccc1' }, { s: '[OH-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the ketone (in excess), ethanol and dilute sodium hydroxide.', level: 0.45, color: '#f2f2ec', T: 22, stir: true },
      { cap: 'Dose the aldehyde slowly. The mixture warms and turns yellow as the enone forms.', dose: { color: '#f7f7f2', name: 'Aldehyde' }, glow: true, T: 30, color: '#f3e7a0', level: 0.6 },
      { cap: 'Hold at 25–35 °C. The product often crystallises from the mixture.', T: 30, solid: '#f6e6a0', color: '#f0e090' },
      { cap: 'Neutralise the base with dilute acid, then filter and wash the product.', dose: { color: '#e6f3fb', name: 'dil. HCl' }, T: 22, level: 0.7, solid: '#f6e6a0' }
    ],
    gas: [], gasNote: 'None',
    care: [
      'The base is only a catalyst, but the addition and condensation steps release heat. Dose base and keep the temperature in range.',
      'Too much base or heat drives side reactions and coloured tars.',
      'Aldehydes oxidise in air to acids, which consume base; check the aldehyde quality.',
      'Neutralise before any distillation; hot base reverses the aldol (retro-aldol) and polymerises enones.'
    ],
    byp: [
      ['Double condensation product', 'Both α-positions of the ketone react (e.g. dibenzalacetone). Use excess ketone and dose the aldehyde.'],
      ['Ketone self-condensation', 'Enolate adding to another ketone. Keep the aldehyde present and the base dilute.'],
      ['Cannizzaro products', 'Aldehydes without α-H disproportionate in strong base. Use mild base concentration.'],
      ['Retro-aldol', 'The aldol step reverses at high temperature or long holds before dehydration. Control time and temperature.']
    ],
    moist: { lvl: 'None', txt: 'Runs in aqueous or alcoholic base; water is also a product.' },
    exo: { short: 'Moderately exothermic', txt: 'Carbon–carbon bond formation and neutralisation release moderate heat; dose base and acid with cooling.' },
    plant: ['Fix the ketone-to-aldehyde ratio and dosing order in development; they control the double-addition product.', 'Seed if the product crystallises during the reaction to avoid oiling out.', 'Check colour and residual aldehyde in the isolated product.'],
    links: [['/molecules/reaction-lab/grignard-addition-to-ketone/', 'Grignard addition (another C–C bond)'], ['/process-modelling/solubility-curve-crystallisation/', 'Solubility and crystallisation'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'swern-oxidation', name: 'Swern oxidation of an alcohol', short: 'Swern oxidation', cat: 'Oxidation',
    seo: 'Swern Oxidation: Mechanism, CO Gas and Cold Control',
    desc: 'Swern oxidation of an alcohol with DMSO and oxalyl chloride: animated mechanism, CO, CO₂ and dimethyl sulfide off-gas per kg, −60 °C control and by-products.',
    intro: 'Dimethyl sulfoxide, activated by oxalyl chloride at very low temperature, oxidises an alcohol to an aldehyde or ketone without metals. The price is three gases: carbon monoxide, carbon dioxide and foul-smelling dimethyl sulfide. The cold temperature is essential: the activated DMSO decomposes violently as it warms.',
    eq: { r: [['CC(C)O', 'Alcohol (isopropanol shown)'], ['CS(C)=O', 'DMSO'], ['ClC(=O)C(=O)Cl', 'Oxalyl chloride']], p: [['CC(C)=O', 'Ketone'], ['CSC', 'Dimethyl sulfide'], ['O=C=O', 'CO₂'], ['[C-]#[O+]', 'CO']], cond: 'DCM, −70 to −50 °C; then Et₃N', note: 'two moles of triethylamine hydrochloride not shown' },
    mech: [
      { cap: 'The DMSO oxygen attacks a carbonyl carbon of oxalyl chloride.',
        sp: [{ s: 'CS(C)=O', lp: [3] }, { s: 'ClC(=O)C(=O)Cl' }], ar: [{ f: ['l', 0, 3], t: ['n', 0, 3, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The intermediate collapses and chloride leaves.',
        sp: [{ s: 'C[S+](C)OC([O-])(Cl)C(=O)Cl', lp: [5] }], ar: [{ f: ['l', 0, 5], t: ['b', 0, 4, 5] }, { f: ['b', 0, 4, 6], t: ['a', 0, 6] }] },
      { cap: 'Chloride attacks sulfur and the rest falls apart into CO₂, CO and chloride: this is where the gas comes from, and it starts already at −60 °C.',
        sp: [{ s: '[Cl-]', lp: [0] }, { s: 'C[S+](C)OC(=O)C(=O)Cl' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 1, 3], t: ['b', 1, 3, 4] }, { f: ['b', 1, 4, 6], t: ['b', 1, 6, 7] }, { f: ['b', 1, 6, 8], t: ['a', 1, 8] }] },
      { cap: 'The alcohol attacks the chlorodimethylsulfonium ion; chloride leaves.',
        sp: [{ s: 'CC(C)O', lp: [3] }, { s: 'C[S+](C)Cl' }], ar: [{ f: ['l', 0, 3], t: ['n', 0, 3, 1, 1] }, { f: ['b', 1, 1, 3], t: ['a', 1, 3] }] },
      { cap: 'After loss of the O–H proton, triethylamine removes a proton from a methyl group on sulfur, forming a sulfur ylide.',
        sp: [{ s: 'CC(C)O[S+](C[2H])C' }, { s: 'CCN(CC)CC', lp: [2] }], ar: [{ f: ['l', 1, 2], t: ['n', 1, 2, 0, 6] }, { f: ['b', 0, 5, 6], t: ['a', 0, 5] }] },
      { cap: 'The ylide carbon takes the hydrogen on the alcohol carbon through a five-membered ring; C=O forms and dimethyl sulfide leaves.',
        sp: [{ s: 'CC([2H])(C)O[S+]([CH2-])C', lp: [6] }], ar: [{ f: ['l', 0, 6], t: ['n', 0, 6, 0, 2] }, { f: ['b', 0, 1, 2], t: ['b', 0, 1, 4] }, { f: ['b', 0, 4, 5], t: ['a', 0, 5] }] },
      { cap: 'Products: the ketone, dimethyl sulfide, CO and CO₂ (and triethylamine hydrochloride).', sp: [{ s: 'CC(C)=O' }, { s: 'CSC' }, { s: 'O=C=O' }, { s: '[C-]#[O+]' }], ar: [] }
    ],
    lab: [
      { cap: 'Dry reactor under nitrogen. Charge dichloromethane and oxalyl chloride; cool to −70 °C.', level: 0.4, color: '#eef1f3', T: -70, n2: true, cool: true, stir: true },
      { cap: 'Dose DMSO slowly. CO and CO₂ come off at once; keep below −60 °C.', dose: { color: '#f6f6f6', name: 'DMSO' }, gas: { name: 'CO + CO₂' }, cool: true, glow: true, T: -62, level: 0.48 },
      { cap: 'Dose the alcohol, still below −60 °C.', dose: { color: '#f6f6f6', name: 'Alcohol' }, cool: true, T: -62, level: 0.56 },
      { cap: 'Dose triethylamine. A thick white salt forms.', dose: { color: '#f6f6f6', name: 'Et₃N' }, cool: true, T: -55, solid: '#ffffff', level: 0.66, glow: true },
      { cap: 'Warm to 0 °C. Dimethyl sulfide is released (strong smell); vent through a bleach scrubber.', T: 0, gas: { name: 'Me₂S vapour', slow: true }, solid: '#ffffff' },
      { cap: 'Quench with water and separate: the ketone in the organic layer.', dose: { color: '#dceef8', name: 'Water' }, solid: null, layers: ['#d8ecf6', '#eef1f3'], T: 10, level: 0.85 }
    ],
    gas: [
      { n: 'Carbon monoxide', s: '[C-]#[O+]', mol: 1, per: 'with 1 eq of oxalyl chloride', note: 'Toxic and odourless. Vent to a safe place; use CO detectors.' },
      { n: 'Carbon dioxide', s: 'O=C=O', mol: 1, per: 'with 1 eq of oxalyl chloride', note: 'Released with the CO during activation.' },
      { n: 'Dimethyl sulfide', s: 'CSC', mol: 1, note: 'Boils at 37 °C; very strong smell. Scrub with bleach (hypochlorite) to oxidise it.' }
    ],
    care: [
      'Keep below −60 °C until the base has been added. The activated DMSO species decomposes as it warms, with gas and heat, and can run away.',
      'Carbon monoxide is toxic and has no smell. Vent safely and monitor the area.',
      'Dimethyl sulfide is flammable and smells at extremely low levels; scrub the vent with bleach.',
      'Oxalyl chloride reacts violently with water; keep the system dry.',
      'Large-scale Swern needs strong cooling; continuous flow or other activators are often used instead.'
    ],
    byp: [
      ['Methylthiomethyl (MTM) ether', 'Pummerer-type side reaction if the mixture warms before the base is added. Keep cold.'],
      ['Alkyl chloride', 'Chloride displacing the activated alcohol at higher temperature. Keep cold and add base on time.'],
      ['Epimerisation α to the new carbonyl', 'Excess triethylamine on warming. Use diisopropylethylamine or less base.']
    ],
    moist: { lvl: 'High', txt: 'Water destroys oxalyl chloride and the activated DMSO, giving HCl and wasting reagent. Use dry DMSO, solvent and alcohol.' },
    exo: { short: 'Exothermic at −60 °C', txt: 'Activation of DMSO and the base addition release heat that must be removed at very low temperature. Loss of cooling is dangerous because the intermediate decomposes on warming.' },
    plant: ['Check the cryogenic cooling capacity against the dosing time before scheduling.', 'CO monitors at the vent and in the area.', 'Consider TEMPO/bleach or other oxidations for large batches.'],
    links: [['/articles/oxidation-reactions/', 'Oxidation reactions in plants'], ['/process-safety/', 'Process safety'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'epoxidation-with-peracid', name: 'Epoxidation of an alkene with a peroxy acid', short: 'Peracid epoxidation', cat: 'Oxidation',
    seo: 'Alkene Epoxidation with Peracid: Mechanism, Safety',
    desc: 'Epoxidation of an alkene with a peroxy acid (mCPBA or peracetic acid): concerted animated mechanism, peroxide hazards, exotherm and quench.',
    intro: 'A peroxy acid hands its outer oxygen to an alkene in one concerted step, forming an epoxide and the parent carboxylic acid. The mechanism is often called the butterfly: four electron movements happen together. In the plant, the concern is the peroxide: accumulation, thermal stability and how excess is destroyed.',
    eq: { r: [['C/C=C\\C', 'Alkene (cis-2-butene shown)'], ['CC(=O)OO', 'Peroxy acid (peracetic acid shown)']], p: [['CC1OC1C', 'Epoxide'], ['CC(=O)O', 'Carboxylic acid']], cond: 'DCM or EtOAc, 0–25 °C' },
    mech: [
      { cap: 'All at once: the alkene π bond attacks the outer peroxide oxygen, the O–O bond breaks, the carbonyl takes the O–H proton, and the O–H bond electrons close the second C–O bond.',
        together: true, sp: [{ s: 'C/C=C\\C', xy: [[-0.7, 0.6], [0, 0], [1, 0], [1.7, 0.6]] }, { s: 'CC(=O)OO[2H]', xy: [[1.5, -4.1], [0.8, -3.3], [-0.2, -3.3], [1.3, -2.4], [0.6, -1.6], [-0.3, -2.2]] }], ar: [{ f: ['b', 0, 1, 2], t: ['n', 0, 1, 1, 4] }, { f: ['b', 1, 3, 4], t: ['b', 1, 1, 3] }, { f: ['b', 1, 1, 2], t: ['n', 1, 2, 1, 5] }, { f: ['b', 1, 4, 5], t: ['n', 1, 4, 0, 2] }] },
      { cap: 'Products: the epoxide and the carboxylic acid. The geometry of the alkene is kept: a cis-alkene gives the cis-epoxide.', sp: [{ s: 'CC1OC1C' }, { s: 'CC(=O)O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the alkene in the solvent and cool to 0–5 °C.', level: 0.45, color: '#eef1f3', T: 3, cool: true, stir: true },
      { cap: 'Dose the peroxy acid solution slowly; it reacts as it goes in. Check that it is being consumed (peroxide test) before dosing more.', dose: { color: '#f5f5ef', name: 'Peroxy acid' }, glow: true, cool: true, T: 8, level: 0.6 },
      { cap: 'Stir until the alkene is gone; the carboxylic acid by-product may crystallise (with mCPBA).', T: 15, solid: '#ffffff' },
      { cap: 'Destroy excess peroxide with sodium sulfite or thiosulfate solution; confirm with peroxide test strips.', dose: { color: '#e6f3fb', name: 'aq. Na₂SO₃' }, glow: true, T: 18, level: 0.75, solid: null },
      { cap: 'Wash with bicarbonate to remove the acid (CO₂ foams), then separate.', dose: { color: '#dceef8', name: 'aq. NaHCO₃' }, gas: { name: 'CO₂' }, layers: ['#eef1f3', '#d8ecf6'], T: 20, level: 0.85 }
    ],
    gas: [], gasNote: 'None; O₂ if the peroxide decomposes',
    care: [
      'Peroxy acids are energetic. Never let them accumulate: dose at a rate matched to consumption and confirm by peroxide testing.',
      'Pure mCPBA is shock-sensitive; it is sold at about 70–77 % with water and acid for safety. Do not dry or concentrate it.',
      'Destroy all excess peroxide before any concentration or distillation; test the solution, not just the time.',
      'Peroxides decompose with metals (iron, copper); keep equipment clean and passivated.'
    ],
    byp: [
      ['Diol (ring-opened)', 'Acid and water open the epoxide. Buffer with bicarbonate or phosphate and keep cold.'],
      ['Baeyer–Villiger products', 'Ketones in the molecule can be oxidised to esters. Control temperature and peracid excess.'],
      ['N-oxides and sulfoxides', 'Amines and sulfides are oxidised faster than alkenes. Protect them or choose another route.']
    ],
    moist: { lvl: 'Low', txt: 'Water does not destroy the reagent quickly, but with the acid formed it opens the epoxide to the diol. Keep the mixture buffered and not too wet.' },
    exo: { short: 'Strongly exothermic', txt: 'Epoxidation releases a lot of heat, and the peroxide itself can decompose with more heat and oxygen. Calorimetry and DSC are needed before scale-up.' },
    plant: ['Specify a peroxide test at every step after the reaction.', 'Hydrogen peroxide with a catalyst is often used at scale instead of mCPBA (cheaper, less waste).', 'Keep the vent open; decomposing peroxide gives oxygen, which also raises the fire risk with organic vapour.'],
    links: [['/articles/oxidation-reactions/', 'Oxidation reactions in plants'], ['/molecules/reaction-lab/epoxide-ring-opening-with-amine/', 'Epoxide ring opening'], ['/process-safety/', 'Process safety']]
  },
  {
    slug: 'curtius-rearrangement', name: 'Curtius rearrangement of an acyl azide', short: 'Curtius rearrangement', cat: 'Nitrogen chemistry',
    seo: 'Curtius Rearrangement: Mechanism, N₂ Gas and Azides',
    desc: 'Curtius rearrangement of an acyl azide to an isocyanate and Boc carbamate: animated mechanism, nitrogen gas per kg, azide hazards and urea by-products.',
    intro: 'On warming, an acyl azide loses nitrogen gas while the group on the carbonyl moves to nitrogen, giving an isocyanate. Trapping the isocyanate with tert-butanol gives a Boc-protected amine, a carbon shorter than the starting acid. The reaction is clean, but azides are energetic and the nitrogen release must be planned.',
    eq: { r: [['O=C(N=[N+]=[N-])c1ccccc1', 'Acyl azide (benzoyl azide shown)'], ['CC(C)(C)O', 'tert-Butanol']], p: [['O=C(Nc1ccccc1)OC(C)(C)C', 'Boc carbamate'], ['N#N', 'Nitrogen']], cond: 'toluene, 70–90 °C' },
    mech: [
      { cap: 'In one concerted step, the R group moves from carbon to nitrogen while nitrogen gas leaves; the nitrogen lone pair forms C=N.',
        sp: [{ s: 'c1ccccc1C(=O)[N-][N+]#N', lp: [8] }], ar: [{ f: ['b', 0, 5, 6], t: ['n', 0, 5, 0, 8] }, { f: ['b', 0, 8, 9], t: ['a', 0, 9] }, { f: ['l', 0, 8], t: ['b', 0, 6, 8] }] },
      { cap: 'tert-Butanol attacks the isocyanate carbon; the C=N π bond moves onto nitrogen.',
        sp: [{ s: 'CC(C)(C)O', lp: [4] }, { s: 'O=C=Nc1ccccc1' }], ar: [{ f: ['l', 0, 4], t: ['n', 0, 4, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The proton moves from oxygen to nitrogen, giving the carbamate.',
        sp: [{ s: '[N-](c1ccccc1)C(=O)[O+]([2H])C(C)(C)C', lp: [0] }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 0, 10] }, { f: ['b', 0, 9, 10], t: ['a', 0, 9] }] },
      { cap: 'Products: the Boc carbamate and nitrogen gas. The aryl group has moved from carbon to nitrogen: the acid has become a protected amine.', sp: [{ s: 'O=C(Nc1ccccc1)OC(C)(C)C' }, { s: 'N#N' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge toluene and tert-butanol and heat to 80 °C under nitrogen.', level: 0.4, color: '#eef1f3', T: 80, heat: true, n2: true, stir: true },
      { cap: 'Dose the acyl azide solution slowly into the hot mixture, so it rearranges as it arrives and never builds up. Nitrogen comes off steadily.', dose: { color: '#f5f2df', name: 'Acyl azide (solution)' }, gas: { name: 'N₂' }, heat: true, T: 82, level: 0.55 },
      { cap: 'Hold until gas stops and no azide or isocyanate remains (IR check).', heat: true, T: 85, gas: { name: 'N₂', slow: true } },
      { cap: 'Cool and work up; the Boc carbamate is in the toluene.', T: 25, level: 0.5 }
    ],
    gas: [{ n: 'Nitrogen', s: 'N#N', mol: 1, note: 'Inert, but large in volume and released as fast as the azide rearranges. Size the vent for the dosing rate.' }],
    care: [
      'Acyl azides are energetic and can decompose violently. Keep them in solution, never isolate them dry, and dose them into hot solvent so they react as they arrive.',
      'Azide reagents (sodium azide, DPPA) can form hydrazoic acid with acid, which is highly toxic and explosive. Avoid acids and heavy metals (copper, lead in drains).',
      'The gas rate equals the rearrangement rate; a blocked vent pressurises the reactor.',
      'Isocyanates are toxic and sensitisers; confirm full conversion before work-up.',
      'Continuous flow is widely used for Curtius reactions to keep the azide inventory small.'
    ],
    byp: [
      ['Symmetrical urea', 'Water converts some isocyanate to the amine, which adds to more isocyanate. Keep the system dry.'],
      ['Free amine', 'Isocyanate hydrolysis by water (with CO₂ release). Dry solvent and alcohol.'],
      ['Unreacted azide', 'Too low a temperature or too short a hold. Confirm by IR before cooling.']
    ],
    moist: { lvl: 'Medium', txt: 'Water reacts with the isocyanate to give the amine and CO₂, and the amine then forms urea. Use dry toluene and tert-butanol.' },
    exo: { short: 'Exothermic with gas', txt: 'The rearrangement releases heat together with nitrogen; azide decomposition releases much more. DSC data on the acyl azide solution are essential.' },
    plant: ['Run a DSC on the azide solution and set the maximum safe temperature with margin.', 'Dose-controlled addition into hot solvent is the safe pattern.', 'Treat aqueous waste containing azide (e.g. with nitrous acid) before discharge.'],
    links: [['/articles/common-chemical-reactions-in-plants/', 'Common chemical reactions in plants'], ['/molecules/reaction-lab/boc-protection-of-amine/', 'Boc protection'], ['/process-safety/', 'Process safety']]
  },
  {
    slug: 'acetylation-with-acetic-anhydride', name: 'Acetylation with acetic anhydride', short: 'Acetylation (Ac₂O)', cat: 'Acylation and activation',
    seo: 'Acetylation with Acetic Anhydride: Mechanism, Heat',
    desc: 'N-acetylation of an amine with acetic anhydride: animated mechanism, exotherm, delayed hydrolysis of anhydride, by-products and plant control.',
    intro: 'Acetic anhydride transfers an acetyl group to amines (and, more slowly, to alcohols and phenols). The leaving group is acetate, and acetic acid is the only by-product, so it is cheap and clean. The plant concern is heat: the reaction is fast with amines, and excess anhydride reacts with water later, sometimes after a delay.',
    eq: { r: [['CN', 'Amine (methylamine shown)'], ['CC(=O)OC(C)=O', 'Acetic anhydride']], p: [['CC(=O)NC', 'Acetamide'], ['CC(=O)O', 'Acetic acid']], cond: 'toluene, ethyl acetate or water, 20–50 °C' },
    mech: [
      { cap: 'The amine nitrogen attacks one carbonyl carbon of the anhydride.',
        sp: [{ s: 'CN', lp: [1] }, { s: 'CC(=O)OC(C)=O' }], ar: [{ f: ['l', 0, 1], t: ['n', 0, 1, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The intermediate collapses and acetate leaves.',
        sp: [{ s: 'CC([O-])([NH2+]C)OC(C)=O', lp: [2] }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 1, 5], t: ['a', 0, 5] }] },
      { cap: 'Acetate takes the proton from nitrogen: the neutral amide and acetic acid.',
        sp: [{ s: 'CC(=O)[NH+]([2H])C' }, { s: 'CC(=O)[O-]', lp: [3] }], ar: [{ f: ['l', 1, 3], t: ['n', 1, 3, 0, 4] }, { f: ['b', 0, 3, 4], t: ['a', 0, 3] }] },
      { cap: 'Products: the acetamide and acetic acid.', sp: [{ s: 'CC(=O)NC' }, { s: 'CC(=O)O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the amine in the solvent at 20 °C.', level: 0.45, color: '#eef1f3', T: 20, stir: true },
      { cap: 'Dose acetic anhydride. The temperature rises quickly; set the rate by the cooling.', dose: { color: '#f6f6f2', name: 'Ac₂O' }, glow: true, cool: true, T: 38, level: 0.58 },
      { cap: 'Hold until the amine is consumed. The product may crystallise.', T: 35, solid: '#ffffff' },
      { cap: 'Add water to destroy excess anhydride. This can be slow to start and then warm the batch; add slowly and watch the temperature.', dose: { color: '#dceef8', name: 'Water' }, glow: true, T: 32, level: 0.75, solid: '#ffffff' },
      { cap: 'Filter the product or separate the layers.', T: 20, solid: '#ffffff' }
    ],
    gas: [], gasNote: 'None (acetic acid vapour)',
    care: [
      'Fast and exothermic with amines; dose anhydride with cooling.',
      'Acetic anhydride hydrolysis by water is slow in two phases and can start late, then accelerate. Add water slowly with mixing and wait for the heat before adding more.',
      'Acetic anhydride is corrosive and a lachrymator, and is a regulated chemical in many countries; keep records.',
      'With catalysts such as DMAP or acids, alcohols and phenols acetylate too; choose conditions for the selectivity needed.'
    ],
    byp: [
      ['Diacetylation', 'Excess anhydride with heat on primary amines or amides. Use 1.05–1.2 eq and moderate temperature.'],
      ['O-acetylation', 'Hydroxyl groups in the molecule acylated. Keep without catalyst and cool, or hydrolyse the ester selectively afterwards.'],
      ['Acetic acid in product', 'Wash or dry well; acetic acid has a strong smell and limits.']
    ],
    moist: { lvl: 'Medium', txt: 'Water slowly consumes acetic anhydride (making acetic acid). A little water mostly wastes reagent; amines react much faster than water, so the reaction can even be run in water.' },
    exo: { short: 'Exothermic', txt: 'Amine acetylation releases significant heat quickly. Hydrolysis of the excess anhydride releases more, sometimes with a delay.' },
    plant: ['Calorimetry on the water quench of excess anhydride; it is a classic delayed exotherm.', 'Recover acetic acid from the mother liquor where volumes allow.', 'Keep anhydride stock under lock and record usage as required.'],
    links: [['/articles/common-chemical-reactions-in-plants/', 'Common chemical reactions in plants'], ['/molecules/reaction-lab/amide-from-acid-chloride/', 'Amide from an acid chloride'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'vilsmeier-haack-formylation', name: 'Vilsmeier–Haack formylation', short: 'Vilsmeier–Haack', cat: 'Aromatic substitution',
    seo: 'Vilsmeier–Haack Reaction: Mechanism, POCl₃ Quench',
    desc: 'Vilsmeier–Haack formylation with DMF and POCl₃: animated mechanism to the chloroiminium reagent, aromatic attack, hydrolysis, and the hazardous POCl₃ quench.',
    intro: 'DMF and phosphorus oxychloride form a chloroiminium ion (the Vilsmeier reagent), a mild electrophile that attacks electron-rich aromatics. Hydrolysis in the work-up turns the resulting iminium into an aldehyde. The reagent formation and especially the aqueous quench of POCl₃ residues are well-known thermal hazards.',
    eq: { r: [['CN(C)c1ccccc1', 'Electron-rich arene (N,N-dimethylaniline)'], ['CN(C)C=O', 'DMF'], ['O=P(Cl)(Cl)Cl', 'POCl₃']], p: [['CN(C)c1ccc(C=O)cc1', 'Aryl aldehyde']], cond: '0–80 °C; then aqueous hydrolysis', note: 'phosphate, HCl and dimethylamine salts not shown' },
    mech: [
      { cap: 'The DMF oxygen attacks phosphorus and a chloride leaves.',
        sp: [{ s: 'CN(C)C=O', lp: [4] }, { s: 'O=P(Cl)(Cl)Cl' }], ar: [{ f: ['l', 0, 4], t: ['n', 0, 4, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'Chloride adds to the carbon of the activated DMF.',
        sp: [{ s: 'C[N+](C)=COP(=O)(Cl)Cl' }, { s: '[Cl-]', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 3] }, { f: ['b', 0, 1, 3], t: ['a', 0, 1] }] },
      { cap: 'The nitrogen lone pair pushes out the dichlorophosphate group: the chloroiminium (Vilsmeier) reagent forms.',
        sp: [{ s: 'CN(C)C(Cl)OP(=O)(Cl)Cl', lp: [1] }], ar: [{ f: ['l', 0, 1], t: ['b', 0, 1, 3] }, { f: ['b', 0, 3, 5], t: ['a', 0, 5] }] },
      { cap: 'The electron-rich ring attacks the reagent at the para position, pushed by the nitrogen lone pair.',
        sp: [{ s: 'C[N+](C)=CCl' }, { s: 'CN(C)C1=CC=CC=C1', lp: [1] }], ar: [{ f: ['l', 1, 1], t: ['b', 1, 1, 3] }, { f: ['b', 1, 3, 4], t: ['b', 1, 4, 5] }, { f: ['b', 1, 5, 6], t: ['n', 1, 6, 0, 3] }, { f: ['b', 0, 1, 3], t: ['a', 0, 1] }] },
      { cap: 'After the ring loses its proton and chloride leaves, an iminium salt remains. In the aqueous work-up, water attacks its carbon.',
        sp: [{ s: 'C[N+](C)=Cc1ccc(N(C)C)cc1' }, { s: 'O', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 3] }, { f: ['b', 0, 1, 3], t: ['a', 0, 1] }] },
      { cap: 'After proton transfer from O to N, the O⁻ lone pair re-forms C=O and neutral dimethylamine leaves (it ends up as its hydrochloride).',
        sp: [{ s: 'C[NH+](C)C([O-])c1ccc(N(C)C)cc1', lp: [4] }], ar: [{ f: ['l', 0, 4], t: ['b', 0, 3, 4] }, { f: ['b', 0, 1, 3], t: ['a', 0, 1] }] },
      { cap: 'Product: the aryl aldehyde.', sp: [{ s: 'O=Cc1ccc(N(C)C)cc1' }, { s: 'CNC' }], ar: [] }
    ],
    lab: [
      { cap: 'Under nitrogen, charge DMF and cool to 0–5 °C.', level: 0.35, color: '#eef1f3', T: 3, n2: true, cool: true, stir: true },
      { cap: 'Dose POCl₃ slowly to form the Vilsmeier reagent. Exothermic; the solution turns pale yellow.', dose: { color: '#f3f3ec', name: 'POCl₃' }, glow: true, cool: true, T: 8, color: '#f4ecc0', level: 0.45 },
      { cap: 'Add the arene and warm to 60–80 °C. The iminium salt forms; the colour deepens.', dose: { color: '#f5f5f5', name: 'Arene' }, heat: true, T: 75, color: '#e8b65a', level: 0.55 },
      { cap: 'Cool. This flask is now the quench vessel with ice water and sodium acetate; the reaction mass is run in slowly. Very exothermic and HCl is released; watch for delayed heat.', dose: { color: '#e8b65a', name: 'Reaction mass' }, cool: true, glow: true, gas: { name: 'HCl' }, T: 30, level: 0.85, color: '#e9d7a8' },
      { cap: 'Stir until hydrolysis is complete; the aldehyde crystallises or is extracted.', T: 25, solid: '#f6e9b8' }
    ],
    gas: [{ n: 'Hydrogen chloride (acid)', s: 'Cl', mol: 4, per: 'total acid released in the quench with 1.5 eq POCl₃ (excess POCl₃, phosphate residues and the iminium chloride)', note: 'Mostly dissolves in the quench water; fumes when the quench is too concentrated or hot.' }],
    care: [
      'Forming the Vilsmeier reagent is exothermic, and the reagent itself is thermally unstable. Keep it cold and do not hold it longer than needed.',
      'POCl₃ hydrolysis can be delayed (metastable intermediates), then release heat and HCl suddenly. Quench into water slowly, keep agitation, and confirm the heat has finished before the next addition.',
      'POCl₃ reacts violently with water and is very corrosive and toxic; handle in closed systems.',
      'DMF can form dimethylcarbamoyl chloride (a suspected carcinogen) with chlorinating agents; know its fate.'
    ],
    byp: [
      ['Chlorinated by-products', 'POCl₃ can chlorinate OH or activated positions. Use the least excess and control temperature.'],
      ['Bis-formylation', 'Very electron-rich rings react twice. Control stoichiometry and temperature.'],
      ['Incomplete hydrolysis', 'Iminium or aminal remains if the quench is too short or too acidic. Buffer (sodium acetate) and hold long enough.']
    ],
    moist: { lvl: 'Very high', txt: 'POCl₃ and the Vilsmeier reagent are destroyed by water with heat and HCl. Dry DMF and arene are needed until the planned aqueous quench.' },
    exo: { short: 'Exothermic; quench hazardous', txt: 'Reagent formation and the reaction both release heat; the quench of residual POCl₃ releases much more, possibly after a delay. Calorimetry on the quench is strongly advised.' },
    plant: ['Calorimetry on the quench, not only on the reaction.', 'Quench into buffered water with spare cooling and volume.', 'Distil off excess POCl₃ before the quench where possible to reduce the quench heat.'],
    links: [['/articles/common-chemical-reactions-in-plants/', 'Common chemical reactions in plants'], ['/molecules/reaction-lab/friedel-crafts-acylation/', 'Friedel–Crafts acylation'], ['/process-safety/', 'Process safety']]
  },
  {
    slug: 'cyanide-substitution', name: 'Nitrile formation with sodium cyanide (SN2)', short: 'Cyanation (NaCN)', cat: 'Substitution and alkylation',
    seo: 'Cyanide SN2 to Nitriles: Mechanism and HCN Safety',
    desc: 'Benzyl chloride to benzyl cyanide with sodium cyanide: animated SN2 mechanism, HCN hazard if the pH drops, phase-transfer catalysis and cyanide waste.',
    intro: 'Cyanide ion attacks an alkyl halide from the back side and displaces the halide, giving a nitrile and adding one carbon. Phase-transfer catalysis lets aqueous sodium cyanide react with an organic halide. The overriding hazard is hydrogen cyanide: any acid turns cyanide into this extremely toxic gas.',
    eq: { r: [['ClCc1ccccc1', 'Benzyl chloride'], ['[C-]#N', 'Cyanide (as NaCN)']], p: [['N#CCc1ccccc1', 'Benzyl cyanide'], ['[Cl-]', 'Chloride (NaCl)']], cond: 'water/toluene, PTC, 60–90 °C' },
    mech: [
      { cap: 'The cyanide carbon attacks the CH₂ carbon from the side opposite chlorine, and chloride leaves in the same step (SN2).',
        sp: [{ s: '[C-]#N', lp: [0] }, { s: 'ClCc1ccccc1' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'Products: the nitrile and chloride. The nitrogen end of cyanide can also attack, giving a little isonitrile.', sp: [{ s: 'N#CCc1ccccc1' }, { s: '[Cl-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge aqueous sodium cyanide (kept alkaline, pH above 10) and the phase-transfer catalyst. Closed reactor, HCN detectors on.', level: 0.4, color: '#e9f3f8', T: 25, stir: true, n2: true },
      { cap: 'Heat to 70–80 °C and dose benzyl chloride. The SN2 reaction is exothermic.', dose: { color: '#f6f6f2', name: 'Benzyl chloride' }, heat: true, glow: true, T: 78, layers: ['#eef0e6', '#e9f3f8'], level: 0.6 },
      { cap: 'Hold until the halide is consumed, then cool.', T: 30, layers: ['#eef0e6', '#e9f3f8'] },
      { cap: 'Separate. The aqueous layer still contains cyanide: treat it with bleach under alkaline conditions before disposal.', layers: ['#eef0e6', '#e9f3f8'], T: 25 }
    ],
    gas: [], gasNote: 'None if kept alkaline; HCN if the pH drops',
    care: [
      'Hydrogen cyanide forms whenever cyanide meets acid, even weak acid or CO₂. Keep every cyanide stream at pH above 10 and keep acids out of the area.',
      'Cyanide is fatal in small doses through skin, ingestion or HCN inhalation. Use closed systems, HCN detectors, and have an antidote kit and trained first aiders on site.',
      'Benzyl chloride is a lachrymator and alkylating agent.',
      'Cyanide waste must be destroyed (alkaline chlorination with hypochlorite, or peroxide) and tested before it goes to the ETP.'
    ],
    byp: [
      ['Benzyl alcohol', 'Hydrolysis of benzyl chloride in the water phase. Keep good phase-transfer conditions and avoid overheating.'],
      ['Isonitrile', 'Attack through nitrogen. Minor with sodium cyanide; removed by acid wash only under controlled, ventilated conditions or by distillation.'],
      ['Dialkylated nitrile', 'The nitrile α-CH₂ is acidic and can be alkylated again. Avoid excess halide and strong base.']
    ],
    moist: { lvl: 'None', txt: 'Runs with aqueous cyanide. The control that matters is pH, not moisture.' },
    exo: { short: 'Moderately exothermic', txt: 'The substitution releases moderate heat; dose the halide at reaction temperature to avoid accumulation.' },
    plant: ['Dedicated, contained area with HCN monitors and interlocks on acid lines.', 'Written cyanide emergency procedure, antidotes and drills.', 'Measure free cyanide in the effluent after treatment before release.'],
    links: [['/articles/common-chemical-reactions-in-plants/', 'Common chemical reactions in plants'], ['/molecules/reaction-lab/williamson-ether-synthesis/', 'Williamson ether (another SN2)'], ['/process-safety/', 'Process safety']]
  },
  {
    slug: 'aza-michael-addition', name: 'Aza-Michael addition of an amine to an acrylate', short: 'Aza-Michael addition', cat: 'Nitrogen chemistry',
    seo: 'Aza-Michael Addition to Acrylates: Mechanism',
    desc: 'Amine adding to an acrylate ester (aza-Michael): animated conjugate addition mechanism, exotherm, acrylate polymerisation risk and bis-addition control.',
    intro: 'An amine adds to the end carbon of an acrylate, an α,β-unsaturated ester, in a conjugate (Michael) addition. A proton then moves to the α-carbon, giving a β-amino ester. It needs no catalyst, but acrylates polymerise easily and the addition is exothermic, so dosing and inhibitor control matter.',
    eq: { r: [['CN', 'Amine (methylamine shown)'], ['C=CC(=O)OC', 'Methyl acrylate']], p: [['CNCCC(=O)OC', 'β-Amino ester']], cond: 'methanol or neat, 20–40 °C' },
    mech: [
      { cap: 'The amine attacks the end carbon of the C=C bond. The C=C π electrons move towards the carbonyl, and the C=O π electrons move onto oxygen: an enolate forms.',
        sp: [{ s: 'CN', lp: [1] }, { s: 'C=CC(=O)OC' }], ar: [{ f: ['l', 0, 1], t: ['n', 0, 1, 1, 0] }, { f: ['b', 1, 0, 1], t: ['b', 1, 1, 2] }, { f: ['b', 1, 2, 3], t: ['a', 1, 3] }] },
      { cap: 'The enolate re-forms C=O and its α-carbon takes the proton from nitrogen (through the solvent).',
        sp: [{ s: 'C[NH+]([2H])CC=C([O-])OC', lp: [6] }], ar: [{ f: ['l', 0, 6], t: ['b', 0, 5, 6] }, { f: ['b', 0, 4, 5], t: ['n', 0, 4, 0, 2] }, { f: ['b', 0, 1, 2], t: ['a', 0, 1] }] },
      { cap: 'Product: the β-amino ester. Being a secondary amine, it can add to a second acrylate.', sp: [{ s: 'CNCCC(=O)OC' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the amine (in excess; methylamine as its solution in methanol, since it is a gas) with air in the head space if the acrylate inhibitor needs oxygen.', level: 0.45, color: '#eef1f3', T: 20, stir: true },
      { cap: 'Dose the acrylate slowly. The addition is exothermic; keep below 40 °C.', dose: { color: '#f7f7f7', name: 'Methyl acrylate' }, glow: true, cool: true, T: 32, level: 0.6 },
      { cap: 'Hold until the acrylate is gone (check by GC or HPLC).', T: 30 },
      { cap: 'Distil off methanol and excess amine.', distil: true, heat: true, T: 60, level: 0.4 }
    ],
    gas: [], gasNote: 'None',
    care: [
      'Acrylates can polymerise violently with heat, light or contamination. Keep the inhibitor (e.g. MEHQ, which needs dissolved oxygen) and avoid inerting acrylate storage completely.',
      'The addition is exothermic; dose the acrylate into the amine at a controlled rate.',
      'Methyl acrylate is flammable, toxic and a strong sensitiser with a sharp smell; use closed transfer.',
      'Do not distil mixtures with unreacted acrylate without inhibitor.'
    ],
    byp: [
      ['Bis-adduct', 'The product amine adds to a second acrylate. Use excess amine and dose acrylate into it.'],
      ['Amide (aminolysis of the ester)', 'At high temperature or long holds the amine attacks the ester. Keep mild conditions.'],
      ['Polyacrylate', 'Polymerisation from inhibitor loss or overheating. Keep inhibitor and temperature control.']
    ],
    moist: { lvl: 'Low', txt: 'Water does not stop the addition; with long holds it can hydrolyse the ester slowly.' },
    exo: { short: 'Exothermic', txt: 'Conjugate addition of amines to acrylates releases about 20 kcal per mole. Acrylate polymerisation, if started, releases far more.' },
    plant: ['Check inhibitor level of the acrylate lot before use.', 'Interlock acrylate dosing on high temperature.', 'Keep acrylate stock cool, away from light, with air in the head space.'],
    links: [['/articles/common-chemical-reactions-in-plants/', 'Common chemical reactions in plants'], ['/molecules/reaction-lab/epoxide-ring-opening-with-amine/', 'Epoxide opening with an amine'], ['/process-safety/', 'Process safety']]
  }
];
