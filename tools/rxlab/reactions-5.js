/* Reaction lab, fifth set. Same format as reactions.js. */
const H3O = '[2H][O+]([2H])[2H]';
module.exports = [
  {
    slug: 'beckmann-rearrangement-of-oxime', name: 'Beckmann rearrangement of cyclohexanone oxime', short: 'Beckmann rearrangement', cat: 'Nitrogen chemistry',
    seo: 'Beckmann Rearrangement: Mechanism to Caprolactam',
    desc: 'Beckmann rearrangement of cyclohexanone oxime to caprolactam: animated ring-expansion mechanism, nitrilium ion, water control and plant notes.',
    intro: 'Under strong acid, an oxime loses water while the ring carbon anti to the leaving group migrates from carbon to nitrogen, giving a nitrilium ion. Water adds back and tautomerises to the amide. Starting from cyclohexanone oxime, the ring expands by one atom: the product is caprolactam, the nylon-6 monomer.',
    eq: { r: [['ON=C1CCCCC1', 'Cyclohexanone oxime']], p: [['O=C1CCCCCN1', 'Caprolactam']], cond: 'conc. H₂SO₄ (or oleum), 100–120 °C', note: 'water lost and re-added; shown as net loss in the equation' },
    mech: [
      { cap: 'Acid protonates the oxime oxygen, turning it into a leaving group.',
        sp: [{ s: 'ON=C1CCCCC1', lp: [0] }, { s: H3O }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'In one concerted step, the ring bond migrates from carbon to nitrogen as water leaves and nitrogen’s lone pair forms a triple bond: a cyclic nitrilium ion, with the ring now one atom bigger.',
        sp: [{ s: '[2H][O+]([2H])N=C1CCCCC1', lp: [3] }], ar: [{ f: ['b', 0, 4, 5], t: ['n', 0, 5, 0, 3] }, { f: ['b', 0, 1, 3], t: ['a', 0, 1] }, { f: ['l', 0, 3], t: ['b', 0, 3, 4] }] },
      { cap: 'Water attacks the electrophilic nitrilium carbon; one π bond of the triple bond collapses onto nitrogen.',
        sp: [{ s: 'O', lp: [0] }, { s: 'C1#[N+]CCCCC1' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'A second water molecule removes the proton from the new oxocarbenium, giving the neutral iminol.',
        sp: [{ s: '[2H][O+]([2H])C1=NCCCCC1' }, { s: 'O', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 2] }, { f: ['b', 0, 1, 2], t: ['a', 0, 1] }] },
      { cap: 'This iminol is just the tautomer of an amide; it settles to the far more stable lactam, caprolactam.', sp: [{ s: 'O=C1CCCCCN1' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge oleum (or conc. sulfuric acid) and cool.', level: 0.4, color: '#eef0e6', T: 15, cool: true },
      { cap: 'Dose molten cyclohexanone oxime slowly; the rearrangement is strongly exothermic.', dose: { color: '#f5f2df', name: 'Oxime (molten)' }, heat: true, glow: true, T: 110, level: 0.6, cool: true },
      { cap: 'Hold at 110–120 °C until oxime is consumed (IR or titration check).', heat: true, T: 115 },
      { cap: 'Cool and run into chilled water and ammonia to neutralise; ammonium sulfate crystallises.', cool: true, dose: { color: '#eaf4ea', name: 'water / NH₃' }, T: 10, solid: '#f2f2ea', level: 0.8 },
      { cap: 'Separate: caprolactam melts out as the upper layer, ammonium sulfate liquor below.', layers: ['#f6efd6', '#e4eef5'], T: 70 }
    ],
    gas: [], gasNote: 'None from the rearrangement itself; ammonia is consumed in the neutralisation',
    care: [
      'The rearrangement is strongly exothermic; dose the oxime into the acid, not the reverse, and control the rate by cooling.',
      'Oleum and hot concentrated sulfuric acid are highly corrosive; use acid-resistant equipment and PPE.',
      'Local overheating during neutralisation can hydrolyse the lactam back to the amino acid; add the acid mass to cold water, not the reverse.',
      'Ammonium sulfate by-product is roughly 1.5–2 kg per kg of product; plan its handling or sale.'
    ],
    byp: [
      ['Amino-caproic acid', 'The lactam hydrolyses in hot, dilute acid or base during work-up. Keep the neutralisation cold and brief.'],
      ['Cyclohexanone (recovered)', 'Oxime hydrolyses back if water is present before the acid activates it. Keep the oxime dry until charged.'],
      ['Tar / sulfonated by-products', 'Prolonged contact with hot oleum degrades the ring. Limit hold time at temperature.']
    ],
    moist: { lvl: 'Medium', txt: 'Water hydrolyses the oxime back to the ketone before it can rearrange, and later hydrolyses the lactam if the quench runs hot. Keep the oxime dry going in; keep the quench cold and short.' },
    exo: { short: 'Strongly exothermic', txt: 'The rearrangement itself and the later neutralisation of the acid both release substantial heat; both steps need good cooling.' },
    plant: ['Dose rate is set by the cooling duty, not by throughput targets.', 'Glass-lined or acid-brick equipment for the hot sulfuric acid stage.', 'Segregate the ammonium sulfate stream for recovery.'],
    links: [['/molecules/reaction-lab/curtius-rearrangement/', 'Curtius rearrangement (a related 1,2-shift)'], ['/molecules/reaction-lab/vilsmeier-haack-formylation/', 'Another strong-acid aromatic step'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'baeyer-villiger-oxidation', name: 'Baeyer–Villiger oxidation of a ketone', short: 'Baeyer–Villiger oxidation', cat: 'Oxidation',
    seo: 'Baeyer–Villiger Oxidation: Mechanism and Migration',
    desc: 'Baeyer–Villiger oxidation of a ketone to an ester with a peracid: animated Criegee intermediate, migration step, and by-product control.',
    intro: 'A peracid adds to a ketone to give the Criegee intermediate. The group best able to stabilise positive charge then migrates from carbon to the adjacent oxygen as the weak O–O bond breaks, inserting an oxygen next to the carbonyl and giving an ester.',
    eq: { r: [['CC(=O)c1ccccc1', 'Ketone (acetophenone shown)'], ['CC(=O)OO', 'Peracetic acid']], p: [['CC(=O)Oc1ccccc1', 'Phenyl acetate (ester)'], ['CC(=O)O', 'Acetic acid']], cond: 'dichloromethane, 20–40 °C' },
    mech: [
      { cap: 'The peracid’s terminal oxygen attacks the ketone carbon; the ketone π bond moves onto its own oxygen, giving the Criegee intermediate.',
        sp: [{ s: 'CC(=O)OO', lp: [4] }, { s: 'CC(=O)c1ccccc1' }], ar: [{ f: ['l', 0, 4], t: ['n', 0, 4, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'In the key step, the more electron-rich group (phenyl) migrates from carbon to the adjacent oxygen as the weak O–O bond breaks, expelling acetate and re-forming the carbonyl: this gives the ester, still bearing the proton from the peracid.',
        sp: [{ s: 'CC(c1ccccc1)([O-])[O+]([2H])OC(C)=O', lp: [8] }], ar: [{ f: ['b', 0, 1, 2], t: ['n', 0, 2, 0, 9] }, { f: ['b', 0, 9, 11], t: ['a', 0, 11] }, { f: ['l', 0, 8], t: ['b', 0, 1, 8] }] },
      { cap: 'The departed acetate removes the proton from the new ester oxygen, giving the neutral ester and acetic acid.',
        sp: [{ s: 'CC(=O)[O-]', lp: [2] }, { s: 'c1ccccc1[O+]([2H])C(C)=O' }], ar: [{ f: ['l', 0, 2], t: ['n', 0, 2, 1, 7] }, { f: ['b', 1, 6, 7], t: ['a', 1, 6] }] },
      { cap: 'Products: the ester, with oxygen now inserted between the carbonyl and the migrated group, and acetic acid.', sp: [{ s: 'CC(=O)Oc1ccccc1' }, { s: 'CC(=O)O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the ketone in dichloromethane and cool.', level: 0.4, color: '#eef0ec', T: 10, cool: true },
      { cap: 'Dose peracetic acid solution slowly; the addition is exothermic.', dose: { color: '#f5f2df', name: 'Peracetic acid' }, glow: true, T: 25, level: 0.6, cool: true },
      { cap: 'Stir until the ketone is consumed (HPLC or iodometric peracid check).', T: 25 },
      { cap: 'Quench excess peracid with sodium thiosulfate or sulfite solution.', dose: { color: '#e6f2fb', name: 'aq. Na₂S₂O₃' }, T: 20, level: 0.75 },
      { cap: 'Separate and wash out the acetic acid by-product.', layers: ['#eef1e3', '#d9ecf7'], T: 20 }
    ],
    gas: [], gasNote: 'None under normal operation',
    care: [
      'Peracids are concentrated oxidisers; never let them contact reducing agents, metals or heat sources uncontrolled.',
      'The migration step is also oxidative at the carbon; electron-rich or more substituted groups migrate faster, which sets regiochemistry on unsymmetrical ketones.',
      'Quench all excess peracid before work-up or concentration; residual peracid is a runaway hazard on heating.',
      'Esters can over-oxidise or hydrolyse under the acidic peracid conditions if held too long; control reaction time.'
    ],
    byp: [
      ['Unreacted ketone', 'Insufficient peracid or too cold. Verify peracid titre before dosing.'],
      ['Over-oxidation / ring-opened acids', 'Prolonged exposure to strong peracid. Quench promptly at the target conversion.'],
      ['Wrong regiochemistry ester', 'The less-migrating group inserted instead; check which group is more electron-rich before choosing substrate.']
    ],
    moist: { lvl: 'Low', txt: 'The reaction tolerates some water (it is often run as an aqueous peracid solution), but excess water dilutes the peracid and slows the reaction.' },
    exo: { short: 'Exothermic', txt: 'Both the addition and the migration release heat; dose the peracid under cooling.' },
    plant: ['Titrate peracid strength before each batch; it decomposes on storage.', 'Keep a thiosulfate quench ready for any excess peracid before work-up.', 'Segregate peracid waste streams from reducing or combustible waste.'],
    links: [['/molecules/reaction-lab/epoxidation-with-peracid/', 'Epoxidation with a peracid (the other common peracid reaction)'], ['/molecules/reaction-lab/swern-oxidation/', 'Swern oxidation'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'wittig-reaction', name: 'Wittig reaction of an aldehyde', short: 'Wittig reaction', cat: 'Carbon–carbon bond formation',
    seo: 'Wittig Reaction: Mechanism, Oxaphosphetane',
    desc: 'Wittig reaction of an aldehyde with a phosphorus ylide to an alkene: animated betaine and oxaphosphetane mechanism, tributylphosphine oxide by-product.',
    intro: 'A phosphorus ylide adds its nucleophilic carbon to an aldehyde, and the resulting alkoxide closes onto the phosphorus to give a four-membered oxaphosphetane. This ring falls apart in one concerted step, giving the alkene and the very stable tributylphosphine oxide, which is what drives the reaction forward.',
    eq: { r: [['O=CC1CCCCC1', 'Aldehyde (cyclohexanecarbaldehyde shown)'], ['[CH2-][P+](CCCC)(CCCC)CCCC', 'Methylenetributylphosphorane']], p: [['C(=C)C1CCCCC1', 'Alkene (vinylcyclohexane)'], ['O=P(CCCC)(CCCC)CCCC', 'Tributylphosphine oxide']], cond: 'THF, −78 °C to 20 °C' },
    mech: [
      { cap: 'The ylide carbon’s lone pair attacks the aldehyde carbon; the C=O π bond moves onto oxygen, giving the betaine.',
        sp: [{ s: '[CH2-][P+](CCCC)(CCCC)CCCC', lp: [0] }, { s: 'O=CC1CCCCC1' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'The alkoxide oxygen’s lone pair closes onto phosphorus, forming the four-membered oxaphosphetane.',
        sp: [{ s: '[O-]C(C1CCCCC1)C[P+](CCCC)(CCCC)CCCC', lp: [0] }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 0, 9] }] },
      { cap: 'The ring falls apart in one concerted step: the P–C and O–C bonds break while the C–C and P–O bonds each gain a π bond, giving the alkene and the very stable P=O.',
        sp: [{ s: 'O1C(C2CCCCC2)CP1(CCCC)(CCCC)CCCC' }], ar: [{ f: ['b', 0, 0, 1], t: ['b', 0, 0, 9] }, { f: ['b', 0, 8, 9], t: ['b', 0, 1, 8] }] },
      { cap: 'Products: the alkene and tributylphosphine oxide, whose strong P=O bond is the thermodynamic driving force for the whole reaction.', sp: [{ s: 'C(=C)C1CCCCC1' }, { s: 'O=P(CCCC)(CCCC)CCCC' }], ar: [] }
    ],
    lab: [
      { cap: 'Under nitrogen, charge the phosphonium salt in dry THF and cool to −78 °C.', level: 0.4, color: '#f0eee6', T: -78, n2: true, cool: true },
      { cap: 'Dose base (e.g. n-BuLi or NaH) to generate the ylide; the solution turns deep orange-red.', dose: { color: '#f5f2df', name: 'Base' }, T: -78, color: '#c9532f', level: 0.5, cool: true },
      { cap: 'Dose the aldehyde slowly at low temperature; the colour fades as the ylide is consumed.', dose: { color: '#f5f5f5', name: 'Aldehyde' }, T: -70, color: '#e8e3d2', level: 0.6, cool: true },
      { cap: 'Warm slowly to room temperature to let the oxaphosphetane collapse.', heat: true, T: 20, level: 0.6 },
      { cap: 'Quench and separate: the alkene in the organic layer, tributylphosphine oxide mostly removed on work-up or by chromatography.', layers: ['#eef1e3', '#d9ecf7'], T: 20 }
    ],
    gas: [], gasNote: 'None; butane if n-BuLi is used as the base (from the alkoxide quench)',
    care: [
      'Phosphonium salts and strong bases (n-BuLi, NaH) are moisture-sensitive; dry the reactor and solvent.',
      'n-Butyllithium is pyrophoric; dose under nitrogen with care and have the appropriate fire suppressant on hand.',
      'Non-stabilised ylides (as here) react fast and give mainly the cis (Z) alkene at low temperature; warming early or using excess base can erode selectivity.',
      'Tributylphosphine oxide is a persistent by-product; plan its removal (aqueous wash, chromatography or crystallisation) early.'
    ],
    byp: [
      ['Trans (E) alkene', 'Equilibration of the betaine before ring closure, often from warming too early. Keep cold until the oxaphosphetane has formed.'],
      ['Unreacted phosphonium salt', 'Incomplete deprotonation. Check base strength and stoichiometry.'],
      ['Alcohol (aldehyde reduced)', 'Trace water or excess strong base can give unwanted reduction pathways with some ylides. Keep the system dry.']
    ],
    moist: { lvl: 'High', txt: 'Water destroys the ylide before it can react, giving back the phosphonium salt and hydroxide. Dry the solvent and keep the system under nitrogen until the aldehyde is fully dosed.' },
    exo: { short: 'Moderately exothermic', txt: 'Ylide formation and the addition both release heat; the ring collapse itself is close to thermoneutral but is driven forward by the stability of the P=O product.' },
    plant: ['Generate the ylide cold and use it promptly; it is not usually stored.', 'Plan for tributylphosphine oxide removal in the work-up design.', 'Non-stabilised ylides need strict temperature control for selectivity; stabilised ylides (ester-substituted) are more forgiving.'],
    links: [['/molecules/reaction-lab/grignard-addition-to-ketone/', 'Grignard addition (also builds a C–C bond at a carbonyl)'], ['/molecules/reaction-lab/aldol-condensation/', 'Aldol condensation'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'appel-reaction-alcohol-to-bromide', name: 'Appel reaction: alcohol to alkyl bromide', short: 'Appel reaction', cat: 'Substitution and alkylation',
    seo: 'Appel Reaction: Mechanism, PPh₃ and CBr₄',
    desc: 'Appel reaction converting an alcohol to an alkyl bromide with triphenylphosphine and carbon tetrabromide: animated mechanism, inversion, by-products.',
    intro: 'Triphenylphosphine attacks a bromine of carbon tetrabromide, making a strong halogenating agent without using a strong acid. The alcohol then attacks that activated phosphorus, and bromide displaces the resulting phosphonium leaving group from the back side, giving the alkyl bromide with inversion and triphenylphosphine oxide as the thermodynamic driver.',
    eq: { r: [['CCCCO', 'Primary alcohol (1-butanol shown)'], ['C(Br)(Br)(Br)Br', 'Carbon tetrabromide'], ['P(c1ccccc1)(c1ccccc1)c1ccccc1', 'Triphenylphosphine']], p: [['CCCCBr', 'Alkyl bromide (with inversion)'], ['O=P(c1ccccc1)(c1ccccc1)c1ccccc1', 'Triphenylphosphine oxide'], ['C(Br)(Br)Br', 'Bromoform']], cond: 'dichloromethane, 0–25 °C' },
    mech: [
      { cap: 'Phosphorus’s lone pair attacks a bromine of carbon tetrabromide, displacing a tribromomethyl carbanion.',
        sp: [{ s: 'P(c1ccccc1)(c1ccccc1)c1ccccc1', lp: [0] }, { s: 'C(Br)(Br)(Br)Br' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'The alcohol oxygen attacks the electrophilic phosphorus, displacing bromide and forming an alkoxyphosphonium salt.',
        sp: [{ s: 'CCCCO', lp: [4] }, { s: '[P+](Br)(c1ccccc1)(c1ccccc1)c1ccccc1' }], ar: [{ f: ['l', 0, 4], t: ['n', 0, 4, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'Bromide attacks the carbon from the back side as the C–O bond breaks; the departing oxygen immediately forms a π bond to phosphorus, giving the very stable P=O and completing the inversion.',
        sp: [{ s: '[Br-]', lp: [0] }, { s: 'CCC[CH2][O+]([2H])P(c1ccccc1)(c1ccccc1)c1ccccc1' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 3] }, { f: ['b', 1, 3, 4], t: ['a', 1, 4] }, { f: ['l', 1, 4], t: ['b', 1, 4, 6] }] },
      { cap: 'Products: the alkyl bromide (inverted at that carbon) and triphenylphosphine oxide. The tribromomethyl carbanion from step 1 is protonated by the alcohol along the way, giving bromoform.', sp: [{ s: 'CCCCBr' }, { s: 'O=P(c1ccccc1)(c1ccccc1)c1ccccc1' }, { s: 'C(Br)(Br)Br' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge triphenylphosphine in dichloromethane and cool to 0 °C.', level: 0.4, color: '#f0eee6', T: 0, cool: true },
      { cap: 'Dose carbon tetrabromide; the mixture turns yellow-orange as the bromophosphonium salt forms.', dose: { color: '#f5f2df', name: 'CBr₄' }, T: 5, color: '#e8b35a', level: 0.55, cool: true },
      { cap: 'Dose the alcohol; bromoform separates as the reaction proceeds.', dose: { color: '#f5f5f5', name: 'Alcohol' }, T: 15, solid: '#f0e9c8', level: 0.65 },
      { cap: 'Warm to room temperature and stir to completion.', heat: true, T: 22 },
      { cap: 'Filter off triphenylphosphine oxide and separate: the alkyl bromide in the organic layer.', layers: ['#eef1e3', '#d9ecf7'], solid: null, T: 20 }
    ],
    gas: [], gasNote: 'None under normal operation',
    care: [
      'Carbon tetrabromide and bromoform are both suspected carcinogens; handle in a fume hood with appropriate PPE.',
      'The reaction inverts the stereochemistry at the carbon bearing the leaving oxygen; this matters for chiral substrates.',
      'Triphenylphosphine oxide is difficult to remove by distillation; plan filtration, chromatography or extraction.',
      'The reagent combination is also moisture sensitive in the early steps; dry solvent improves yield.'
    ],
    byp: [
      ['Unreacted alcohol', 'Insufficient CBr₄/PPh₃ or reagent degraded by moisture. Use fresh, dry reagents.'],
      ['Ether (from the alcohol attacking another alkoxyphosphonium)', 'Slow addition and excess reagent reduce this side path.'],
      ['Elimination product (alkene)', 'Secondary or tertiary alcohols can eliminate instead of substituting. Keep temperature low for such substrates.']
    ],
    moist: { lvl: 'Medium', txt: 'Water reacts with CBr₄/PPh₃ before the alcohol can, consuming reagent. Dry the solvent; the alcohol substrate itself is the intended source of the nucleophilic oxygen.' },
    exo: { short: 'Mildly exothermic', txt: 'Formation of the bromophosphonium and the alkoxyphosphonium salts both release modest heat; the final inversion step is close to thermoneutral.' },
    plant: ['Use the minimum excess of CBr₄/PPh₃ needed; both add to by-product load.', 'Plan disposal for bromoform and triphenylphosphine oxide separately.', 'For chiral substrates, confirm inversion is the desired outcome before choosing this route.'],
    links: [['/molecules/reaction-lab/mesylation-of-alcohol/', 'Mesylation (another way to activate an alcohol)'], ['/molecules/reaction-lab/alcohol-to-alkyl-chloride-thionyl-chloride/', 'Alcohol to chloride with SOCl₂'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'carbamate-formation-chloroformate', name: 'Carbamate formation with ethyl chloroformate', short: 'Carbamate formation', cat: 'Acylation and activation',
    seo: 'Carbamate Formation with Chloroformate: Mechanism',
    desc: 'Carbamate formation from an amine and ethyl chloroformate: animated addition-elimination mechanism, HCl by-product, and plant control notes.',
    intro: 'Ethyl chloroformate reacts with an amine exactly like an acid chloride: the amine adds to the carbonyl, chloride leaves, and a base removes the resulting ammonium proton. The result is a carbamate, a common protecting group and intermediate step in agrochemical and pharma synthesis.',
    eq: { r: [['NCc1ccccc1', 'Amine (benzylamine shown)'], ['ClC(=O)OCC', 'Ethyl chloroformate']], p: [['O=C(NCc1ccccc1)OCC', 'Ethyl N-benzylcarbamate'], ['Cl[2H]', 'Hydrogen chloride']], cond: 'dichloromethane, 0–10 °C, with a mild base' },
    mech: [
      { cap: 'The amine’s lone pair attacks the chloroformate carbon; the C=O π bond moves onto oxygen.',
        sp: [{ s: 'NCc1ccccc1', lp: [0] }, { s: 'ClC(=O)OCC' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The alkoxide reforms the carbonyl as chloride leaves, giving a protonated carbamate.',
        sp: [{ s: '[NH2+](Cc1ccccc1)C([O-])(Cl)OCC', lp: [9] }], ar: [{ f: ['l', 0, 9], t: ['b', 0, 8, 9] }, { f: ['b', 0, 8, 10], t: ['a', 0, 10] }] },
      { cap: 'The chloride just released removes the ammonium proton, giving the neutral carbamate and HCl.',
        sp: [{ s: '[Cl-]', lp: [0] }, { s: '[NH+]([2H])(Cc1ccccc1)C(=O)OCC' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'Products: the carbamate and hydrogen chloride (usually taken up by a base in the flask).', sp: [{ s: 'O=C(NCc1ccccc1)OCC' }, { s: 'Cl[2H]' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the amine, dichloromethane and a mild base (sodium bicarbonate solution or triethylamine) and cool.', level: 0.45, color: '#eef0e6', T: 5, cool: true },
      { cap: 'Dose ethyl chloroformate slowly; HCl is taken up by the base as it forms.', dose: { color: '#f5f2df', name: 'Ethyl chloroformate' }, T: 8, level: 0.6, cool: true, gas: { name: 'HCl (mostly absorbed)', slow: true } },
      { cap: 'Stir at 0–10 °C until the amine is consumed.', T: 8, cool: true },
      { cap: 'Wash with water to remove the base salt and any excess chloroformate.', dose: { color: '#e6f2fb', name: 'Water' }, T: 15, level: 0.75 },
      { cap: 'Separate: the carbamate in the organic layer.', layers: ['#eef1e3', '#d9ecf7'], T: 20 }
    ],
    gas: [{ n: 'Hydrogen chloride', s: 'Cl[2H]', mol: 1, note: 'Usually absorbed by the base present, but any excess must be vented to a scrubber.' }],
    care: [
      'Ethyl chloroformate is a lachrymator and reacts readily with water; keep the system closed and well vented.',
      'Use a base (bicarbonate, triethylamine) to mop up HCl as it forms, or the amine substrate itself is consumed as its hydrochloride salt.',
      'Add the chloroformate to the amine, not the reverse, to avoid local excess and symmetrical urea by-product.',
      'Keep the reaction cold; chloroformates can decompose with heat, releasing CO₂ and the corresponding alkyl chloride.'
    ],
    byp: [
      ['Symmetrical urea', 'Excess amine reacts with the carbamate’s own leaving potential, or chloroformate is dosed too fast. Control stoichiometry and addition rate.'],
      ['Amine hydrochloride (recovered)', 'Without added base, HCl protonates the amine and stalls the reaction. Add a base or use excess amine.'],
      ['Carbonate / diethyl carbonate', 'Chloroformate reacting with adventitious water. Keep the reactor and reagents dry.']
    ],
    moist: { lvl: 'Medium', txt: 'Water hydrolyses the chloroformate to CO₂ and ethanol, wasting reagent. Use dry solvent; the aqueous base wash is fine once the reaction is complete.' },
    exo: { short: 'Moderately exothermic', txt: 'The addition-elimination at the carbonyl releases moderate heat; dosing controls the rate.' },
    plant: ['Scrub HCl off-gas even when a base is present, in case of local excess.', 'Chloroformates are also toxic by inhalation; handle in contained equipment.', 'Confirm the base chosen does not also react competitively with the chloroformate.'],
    links: [['/molecules/reaction-lab/boc-protection-of-amine/', 'Boc protection (another amine-protecting step)'], ['/molecules/reaction-lab/amide-from-acid-chloride/', 'Amide from an acid chloride (the same mechanism)'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'knoevenagel-condensation', name: 'Knoevenagel condensation', short: 'Knoevenagel condensation', cat: 'Carbon–carbon bond formation',
    seo: 'Knoevenagel Condensation: Mechanism and Base Control',
    desc: 'Knoevenagel condensation of an aldehyde with diethyl malonate: animated enolate mechanism, dehydration, and plant control notes.',
    intro: 'A mild base removes the strongly acidified proton between two ester groups in diethyl malonate. This enolate adds to an aldehyde, and after a second deprotonation the adduct loses water to give the conjugated alkylidene malonate. The doubly activated methylene makes this run under milder base than a simple aldol.',
    eq: { r: [['O=Cc1ccccc1', 'Aldehyde (benzaldehyde shown)'], ['O=C(OCC)CC(=O)OCC', 'Diethyl malonate']], p: [['O=C(OCC)C(=Cc1ccccc1)C(=O)OCC', 'Diethyl benzylidenemalonate'], ['O', 'Water']], cond: 'piperidine (cat.), ethanol, 40–60 °C' },
    mech: [
      { cap: 'Base removes the proton flanked by both esters; the electrons form a new C=C and push one ester’s own C=O onto oxygen, giving a stabilised enolate.',
        sp: [{ s: '[OH-]', lp: [0] }, { s: 'O=C(OCC)C([2H])C(=O)OCC' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 6] }, { f: ['b', 1, 5, 6], t: ['b', 1, 5, 7] }, { f: ['b', 1, 7, 8], t: ['a', 1, 8] }] },
      { cap: 'The enolate attacks the aldehyde carbon with its C=C bond, re-forming the ester carbonyl.',
        sp: [{ s: 'C(C(=O)OCC)=C([O-])OCC', lp: [7] }, { s: 'O=Cc1ccccc1' }], ar: [{ f: ['l', 0, 7], t: ['b', 0, 6, 7] }, { f: ['b', 0, 0, 6], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'The new alkoxide takes a proton from water, giving the open aldol-type adduct.',
        sp: [{ s: 'C(C(=O)OCC)(C(=O)OCC)C([O-])c1ccccc1', lp: [12] }, { s: 'O[2H]' }], ar: [{ f: ['l', 0, 12], t: ['n', 0, 12, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'Base removes the one remaining acidic proton, flanked by both esters again, forming a new enolate.',
        sp: [{ s: '[OH-]', lp: [0] }, { s: 'C([2H])(C(=O)OCC)(C(=O)OCC)C(O)c1ccccc1' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 0, 1], t: ['b', 1, 0, 2] }, { f: ['b', 1, 2, 3], t: ['a', 1, 3] }] },
      { cap: 'This enolate pushes out the benzylic hydroxide (E1cb elimination), giving the conjugated product.',
        sp: [{ s: 'C([O-])(=C(C(=O)OCC)C(O)c1ccccc1)OCC', lp: [1] }], ar: [{ f: ['l', 0, 1], t: ['b', 0, 0, 1] }, { f: ['b', 0, 0, 2], t: ['b', 0, 2, 8] }, { f: ['b', 0, 8, 9], t: ['a', 0, 9] }] },
      { cap: 'Products: the conjugated alkylidene malonate and water.', sp: [{ s: 'O=C(OCC)C(=Cc1ccccc1)C(=O)OCC' }, { s: 'O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge diethyl malonate, ethanol and a trace of piperidine.', level: 0.45, color: '#f0eee6', T: 25, stir: true },
      { cap: 'Dose the aldehyde; the mixture warms and the condensation proceeds without strong base.', dose: { color: '#f5f5f5', name: 'Aldehyde' }, heat: true, T: 50, level: 0.6 },
      { cap: 'Hold at 40–60 °C until the aldehyde is consumed.', heat: true, T: 55 },
      { cap: 'Cool and wash out the amine catalyst with dilute acid.', cool: true, dose: { color: '#e6f2fb', name: 'dil. acid wash' }, T: 20, level: 0.75 },
      { cap: 'Separate: the alkylidene malonate in the organic layer.', layers: ['#f1e8c8', '#dceef8'], T: 20 }
    ],
    gas: [], gasNote: 'None',
    care: [
      'Only a catalytic amount of amine base is normally needed; large excess can promote further Michael addition of a second malonate.',
      'Water formed in the elimination should be removed or accounted for if the equilibrium needs pushing to completion.',
      'Aromatic aldehydes with no α-hydrogen avoid self-condensation; aliphatic aldehydes may need slower, cooler addition.',
      'The product alkylidene malonate is itself a good Michael acceptor; avoid leaving excess nucleophile in the pot afterward.'
    ],
    byp: [
      ['Michael adduct (double addition)', 'A second equivalent of malonate adds to the first product. Control malonate stoichiometry and reaction time.'],
      ['Unreacted aldehyde', 'Catalyst exhausted or too little base. Check piperidine (or equivalent amine) charge.'],
      ['Self-condensation of the aldehyde', 'Only relevant for aldehydes bearing an α-hydrogen; choose an aromatic aldehyde if this is a concern.']
    ],
    moist: { lvl: 'Low', txt: 'The reaction is normally run in alcohol and tolerates some water; water is in fact a co-product and does not need to be excluded, only removed for a complete equilibrium shift.' },
    exo: { short: 'Mildly exothermic', txt: 'The condensation releases modest heat; control addition rate on larger aldehyde charges.' },
    plant: ['A catalytic amine is easy to under- or over-charge by habit; weigh it rather than estimating by drops.', 'The product is often isolated by crystallisation once cooled.', 'Check for residual amine catalyst carrying through to the next step.'],
    links: [['/molecules/reaction-lab/aldol-condensation/', 'Aldol condensation (the same elimination pattern)'], ['/molecules/reaction-lab/claisen-condensation/', 'Claisen condensation'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'hofmann-rearrangement-of-amide', name: 'Hofmann rearrangement of an amide', short: 'Hofmann rearrangement', cat: 'Nitrogen chemistry',
    seo: 'Hofmann Rearrangement: Mechanism, Isocyanate, CO₂',
    desc: 'Hofmann rearrangement of a primary amide with bromine and base to a one-carbon-shorter amine: animated mechanism, isocyanate intermediate and CO₂ loss.',
    intro: 'Base and bromine convert a primary amide’s N–H into an N–Br bond. A second deprotonation sets up a concerted 1,2-shift, exactly like the Curtius rearrangement: the R group migrates from carbon to nitrogen as bromide leaves, giving an isocyanate. Water adds to the isocyanate and the resulting carbamic acid loses carbon dioxide at once, leaving an amine one carbon shorter than the starting amide.',
    eq: { r: [['CC(=O)N', 'Primary amide (acetamide shown)'], ['BrBr', 'Bromine (2 eq)'], ['[OH-]', 'Hydroxide (excess)']], p: [['CN', 'Amine (one carbon shorter)'], ['O=C=O', 'Carbon dioxide'], ['[Br-]', 'Bromide']], cond: 'aq. NaOH, 0–25 °C' },
    mech: [
      { cap: 'Hydroxide removes one N–H proton from the amide.',
        sp: [{ s: '[OH-]', lp: [0] }, { s: 'CC(=O)N[2H]' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 4] }, { f: ['b', 1, 3, 4], t: ['a', 1, 3] }] },
      { cap: 'The amide anion’s lone pair attacks bromine, displacing bromide and giving the N-bromoamide.',
        sp: [{ s: 'CC(=O)[N-]', lp: [3] }, { s: 'BrBr' }], ar: [{ f: ['l', 0, 3], t: ['n', 0, 3, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'Hydroxide removes the remaining N–H, giving the N-bromoamide anion.',
        sp: [{ s: '[OH-]', lp: [0] }, { s: 'CC(=O)N([2H])Br' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 4] }, { f: ['b', 1, 3, 4], t: ['a', 1, 3] }] },
      { cap: 'In one concerted step, exactly as in the Curtius rearrangement, methyl migrates from carbon to nitrogen as bromide leaves and nitrogen’s lone pair forms the isocyanate.',
        sp: [{ s: 'CC(=O)[N-]Br', lp: [3] }], ar: [{ f: ['b', 0, 0, 1], t: ['n', 0, 0, 0, 3] }, { f: ['b', 0, 3, 4], t: ['a', 0, 4] }, { f: ['l', 0, 3], t: ['b', 0, 1, 3] }] },
      { cap: 'Water attacks the isocyanate carbon; the C=N π bond moves onto nitrogen.',
        sp: [{ s: 'O', lp: [0] }, { s: 'CN=C=O' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 2] }, { f: ['b', 1, 1, 2], t: ['a', 1, 1] }] },
      { cap: 'The nitrogen anion removes the proton from the new oxocarbenium, giving methylcarbamic acid.',
        sp: [{ s: 'C[N-]C(=O)[O+]([2H])[2H]', lp: [1] }], ar: [{ f: ['l', 0, 1], t: ['n', 0, 1, 0, 5] }, { f: ['b', 0, 4, 5], t: ['a', 0, 4] }] },
      { cap: 'Carbamic acids are unstable and lose carbon dioxide at once, leaving the free amine, one carbon shorter than the starting amide.', sp: [{ s: 'CN' }, { s: 'O=C=O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the amide into cold aqueous sodium hydroxide.', level: 0.45, color: '#eef0e6', T: 5, cool: true },
      { cap: 'Dose bromine slowly; the N-bromoamide forms with a yellow tinge that fades.', dose: { color: '#e8a45a', name: 'Bromine' }, T: 8, level: 0.55, cool: true },
      { cap: 'Warm gently; the rearrangement proceeds with steady gas evolution as the carbamic acid decarboxylates.', heat: true, gas: { name: 'CO₂' }, T: 35, level: 0.6 },
      { cap: 'Hold until gas evolution stops.', heat: true, T: 40, gas: { name: 'CO₂', slow: true } },
      { cap: 'Cool, acidify to free the amine as its salt if needed, and separate.', cool: true, T: 15, layers: ['#eef1e3', '#d9ecf7'] }
    ],
    gas: [{ n: 'Carbon dioxide', s: 'O=C=O', mol: 1, note: 'Released as the carbamic acid intermediate decarboxylates; vent as the mixture warms.' }],
    care: [
      'Bromine is corrosive and the N-bromoamide intermediate can be unstable; keep the mixture cold until dosing is complete.',
      'Excess hydroxide is needed through to the end: it is consumed in both deprotonations and in neutralising HBr formed.',
      'The migrating group retains its configuration (no free carbocation forms), which matters for chiral substrates.',
      'CO₂ evolution can be vigorous on warming; control the heating rate and vent adequately.'
    ],
    byp: [
      ['Unreacted amide', 'Insufficient bromine or base. Check both charges before warming.'],
      ['N,N-dibromoamide', 'Excess bromine brominates both N–H bonds, which can divert the rearrangement. Limit bromine to about 1 equivalent beyond what reacts.'],
      ['Symmetrical urea', 'The free amine product can react with unreacted isocyanate. Keep the amine product protonated (as its salt) until isocyanate is consumed.']
    ],
    moist: { lvl: 'Low', txt: 'The reaction is run in water throughout; water is in fact required for the final hydrolysis-decarboxylation step. No special drying is needed.' },
    exo: { short: 'Exothermic', txt: 'Bromination and the rearrangement itself release heat; the later decarboxylation is mildly endothermic and needs gentle warming.' },
    plant: ['Dose bromine under good cooling and ventilation; it is both corrosive and volatile.', 'Size the CO₂ vent for the warming step.', 'If isolating the amine as a salt, acidify before the product amine can react with any remaining isocyanate.'],
    links: [['/molecules/reaction-lab/curtius-rearrangement/', 'Curtius rearrangement (the same migration step)'], ['/molecules/reaction-lab/diazotisation-of-aniline/', 'Diazotisation of aniline'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'reformatsky-reaction', name: 'Reformatsky reaction', short: 'Reformatsky reaction', cat: 'Carbon–carbon bond formation',
    seo: 'Reformatsky Reaction: Mechanism and Zinc Control',
    desc: 'Reformatsky reaction of an organozinc ester enolate with an aldehyde: animated addition mechanism, quench, and plant control notes.',
    intro: 'Zinc inserts into the carbon–bromine bond of an α-bromoester, giving an organozinc reagent milder than a Grignard. Its carbon adds to an aldehyde exactly as a Grignard reagent would, and aqueous quench gives the β-hydroxy ester.',
    eq: { r: [['[Zn](Br)CC(=O)OCC', 'Organozinc ester enolate (from ethyl bromoacetate)'], ['O=Cc1ccccc1', 'Aldehyde (benzaldehyde shown)']], p: [['OC(c1ccccc1)CC(=O)OCC', 'β-Hydroxy ester']], cond: '1) THF, 0–25 °C  2) aq. NH₄Cl', note: 'zinc insertion into BrCH₂CO₂Et not shown' },
    mech: [
      { cap: 'The carbon–zinc bond is polarised; its electrons attack the aldehyde carbon, exactly as a Grignard reagent would. The C=O π bond moves onto oxygen.',
        sp: [{ s: '[Zn](Br)CC(=O)OCC' }, { s: 'O=Cc1ccccc1' }], ar: [{ f: ['b', 0, 0, 2], t: ['n', 0, 2, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'A zinc alkoxide forms and simply waits in solution until the quench supplies a proton.', sp: [{ s: '[Zn](Br)OC(c1ccccc1)CC(=O)OCC' }], ar: [] },
      { cap: 'In the aqueous quench, the alkoxide oxygen takes a proton from the acid. Zinc salts go into the water layer.',
        sp: [{ s: '[O-]C(c1ccccc1)CC(=O)OCC', lp: [0] }, { s: H3O }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'Product: the β-hydroxy ester, with zinc salts removed in the aqueous wash.', sp: [{ s: 'OC(c1ccccc1)CC(=O)OCC' }, { s: 'O' }], ar: [] }
    ],
    lab: [
      { cap: 'Activate zinc dust and charge with ethyl bromoacetate in dry THF under nitrogen; the organozinc forms.', level: 0.4, color: '#dfe3df', T: 25, n2: true, stir: true },
      { cap: 'Dose the aldehyde slowly at 0–10 °C.', dose: { color: '#f5f5f5', name: 'Aldehyde' }, T: 8, level: 0.6, cool: true, glow: true },
      { cap: 'Stir until the aldehyde is consumed.', T: 15, cool: true },
      { cap: 'Quench into cold aqueous ammonium chloride (reverse quench); zinc salts form a white solid.', cool: true, dose: { color: '#9a8d79', name: 'Reaction mass' }, T: 15, level: 0.85, solid: '#ffffff' },
      { cap: 'Separate: the β-hydroxy ester in the organic layer, zinc salts in the water.', layers: ['#efe8d4', '#cfe6f2'], solid: null, T: 20 }
    ],
    gas: [], gasNote: 'None',
    care: [
      'Zinc activation (with acid wash, iodine or ultrasound) is often needed before insertion proceeds reliably.',
      'The organozinc is less reactive than a Grignard and tolerates some functional groups (esters, mild acidity) that a Grignard would attack.',
      'Water and air still degrade the reagent, though less violently than with Grignards; keep the system reasonably dry.',
      'The product β-hydroxy ester can eliminate to the acrylate under acidic conditions or heat; keep work-up mild.'
    ],
    byp: [
      ['Ethyl acetate (reagent destroyed)', 'Protic contamination before the aldehyde is added. Dry the solvent and substrate.'],
      ['Self-condensation of the organozinc', 'Slow or warm addition lets the reagent react with its own ester group. Keep cold and dose promptly.'],
      ['Acrylate ester (dehydration)', 'Acidic or hot work-up eliminates the new hydroxyl. Keep the quench mild and cool.']
    ],
    moist: { lvl: 'Medium', txt: 'Water degrades the organozinc before use, though it is more forgiving than a Grignard reagent. Dry the solvent and keep the zinc insertion step under nitrogen.' },
    exo: { short: 'Moderately exothermic', txt: 'The addition step releases moderate heat; the insertion step itself can have an induction period.' },
    plant: ['Confirm zinc activation (gas evolution or colour change) before dosing the aldehyde.', 'Reverse quench into cold aqueous ammonium chloride, as with Grignard reactions.', 'Keep later steps mild to avoid dehydrating the product.'],
    links: [['/molecules/reaction-lab/grignard-addition-to-ketone/', 'Grignard addition (the same addition step)'], ['/molecules/reaction-lab/aldol-condensation/', 'Aldol condensation'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'wolff-kishner-reduction', name: 'Wolff–Kishner reduction of a ketone', short: 'Wolff–Kishner reduction', cat: 'Reduction',
    seo: 'Wolff–Kishner Reduction: Mechanism, Hydrazone, N₂',
    desc: 'Wolff–Kishner reduction of a ketone to an alkane through its hydrazone: animated mechanism, nitrogen gas evolution and plant control notes.',
    intro: 'Hydrazine first condenses with a ketone to give a hydrazone. Strong base and heat then remove both hydrazone protons; the resulting anion loses nitrogen gas and is protonated by the solvent, replacing the original carbonyl carbon’s double bond with two C–H bonds. It is the usual way to deoxygenate a ketone completely, without going through an alcohol.',
    eq: { r: [['CC(=O)c1ccccc1', 'Ketone (acetophenone shown)'], ['NN', 'Hydrazine']], p: [['CCc1ccccc1', 'Alkane (ethylbenzene)'], ['N#N', 'Nitrogen']], cond: 'KOH, diethylene glycol, 180–200 °C' },
    mech: [
      { cap: 'Hydrazine’s lone pair attacks the ketone carbon; the C=O π bond moves onto oxygen.',
        sp: [{ s: 'NN', lp: [0] }, { s: 'CC(=O)c1ccccc1' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The alkoxide removes the proton from the new ammonium nitrogen, giving the neutral hemiaminal.',
        sp: [{ s: '[O-]C(C)(c1ccccc1)[NH+]([2H])N', lp: [0] }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 0, 10] }, { f: ['b', 0, 9, 10], t: ['a', 0, 9] }] },
      { cap: 'Acid protonates the hemiaminal oxygen, turning it into a leaving group.',
        sp: [{ s: 'OC(C)(c1ccccc1)NN', lp: [0] }, { s: H3O }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'Water leaves, and nitrogen’s lone pair forms the new C=N, giving the hydrazone.',
        sp: [{ s: '[2H][O+]([2H])C(C)(c1ccccc1)NN', lp: [11] }], ar: [{ f: ['b', 0, 1, 3], t: ['a', 0, 1] }, { f: ['l', 0, 11], t: ['b', 0, 3, 11] }] },
      { cap: 'Hot base removes a proton from the terminal nitrogen; the electrons form a new N=N bond as the adjacent C=N drops to a single bond, giving a stabilised carbanion.',
        sp: [{ s: '[OH-]', lp: [0] }, { s: 'C(C)(c1ccccc1)=NN([2H])[2H]' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 10] }, { f: ['b', 1, 9, 10], t: ['b', 1, 8, 9] }, { f: ['b', 1, 0, 8], t: ['a', 1, 0] }] },
      { cap: 'Under the strongly basic, hot conditions this carbanion loses nitrogen gas and is protonated by the solvent; the net, debated over several steps, replaces the carbonyl carbon’s double bond with two C–H bonds.', sp: [{ s: 'CCc1ccccc1' }, { s: 'N#N' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the ketone, hydrazine (as the hydrate) and diethylene glycol.', level: 0.4, color: '#f0eee6', T: 25, stir: true },
      { cap: 'Heat to reflux to form the hydrazone; water of condensation collects.', heat: true, distil: true, T: 120, level: 0.5 },
      { cap: 'Add potassium hydroxide and raise the temperature further.', dose: { color: '#f5f2df', name: 'KOH' }, heat: true, T: 180, level: 0.55 },
      { cap: 'Hold at 180–200 °C; nitrogen comes off steadily as the reduction proceeds.', heat: true, gas: { name: 'N₂' }, T: 195, level: 0.5 },
      { cap: 'Cool and separate: the alkane, often distilled directly from the hot mixture.', cool: true, T: 25, layers: ['#eef1e3', '#d9ecf7'] }
    ],
    gas: [{ n: 'Nitrogen', s: 'N#N', mol: 1, note: 'Inert, but released steadily at high temperature; size the vent for the heating rate.' }],
    care: [
      'Hydrazine is toxic and a suspected carcinogen; handle with closed transfer and good ventilation.',
      'The reaction runs at high temperature (often 180–200 °C) in a high-boiling solvent; plan for the heating duty and the equipment rating.',
      'Excess hydrazine and the hot strong base are both corrosive; use compatible materials of construction.',
      'The classical method needs no acid-sensitive or base-sensitive groups elsewhere in the molecule to survive the harsh conditions.'
    ],
    byp: [
      ['Unreacted hydrazone', 'Insufficient base or temperature for the final step. Confirm KOH charge and hold temperature.'],
      ['Azine (ketone + hydrazone condensation)', 'Excess ketone relative to hydrazine. Use hydrazine in excess, not the reverse.'],
      ['Alcohol (incomplete reduction)', 'Hydrolysis of the hydrazone back toward the ketone/alcohol pathway under poor conditions. Keep the system properly basic and hot.']
    ],
    moist: { lvl: 'Low', txt: 'Some water is generated and removed during hydrazone formation; the reaction otherwise runs in a high-boiling solvent and is not sensitive to adventitious moisture in the way an organometallic step would be.' },
    exo: { short: 'Net endothermic (needs sustained heating)', txt: 'The overall sequence requires substantial external heat; it is not a reaction that runs away on its own.' },
    plant: ['Heat-transfer capacity at 180–200 °C is the usual plant constraint, not reagent addition rate.', 'Hydrazine waste streams need dedicated treatment.', 'Milder variants (Huang-Minlon or catalysed low-temperature versions) exist if the harsh classical conditions are a constraint.'],
    links: [['/molecules/reaction-lab/sodium-borohydride-reduction/', 'Sodium borohydride reduction (a milder carbonyl reduction)'], ['/molecules/reaction-lab/reductive-amination/', 'Reductive amination (also goes through an imine/hydrazone-like intermediate)'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'darzens-glycidic-ester-synthesis', name: 'Darzens glycidic ester synthesis', short: 'Darzens condensation', cat: 'Carbon–carbon bond formation',
    seo: 'Darzens Glycidic Ester Synthesis: Mechanism',
    desc: 'Darzens condensation of an aldehyde with ethyl chloroacetate to a glycidic ester: animated enolate and intramolecular ring-closure mechanism.',
    intro: 'Base deprotonates ethyl chloroacetate between the ester and the chlorine, both of which help stabilise the resulting carbanion. This enolate adds to an aldehyde, and the resulting alkoxide then closes onto the adjacent carbon in an intramolecular SN2, displacing chloride and forming the three-membered epoxide ring: a glycidic ester.',
    eq: { r: [['O=Cc1ccccc1', 'Aldehyde (benzaldehyde shown)'], ['ClCC(=O)OCC', 'Ethyl chloroacetate']], p: [['O=C(OCC)C1OC1c1ccccc1', 'Ethyl glycidate (epoxide ester)'], ['[Cl-]', 'Chloride']], cond: 'NaOEt, ethanol, 0–25 °C' },
    mech: [
      { cap: 'Ethoxide removes the proton between the ester and the chlorine, giving a doubly stabilised enolate.',
        sp: [{ s: 'CC[O-]', lp: [2] }, { s: 'ClC([2H])C(=O)OCC' }], ar: [{ f: ['l', 0, 2], t: ['n', 0, 2, 1, 2] }, { f: ['b', 1, 1, 2], t: ['b', 1, 1, 3] }, { f: ['b', 1, 3, 4], t: ['a', 1, 4] }] },
      { cap: 'The chloro-enolate attacks the aldehyde carbon, re-forming the ester carbonyl.',
        sp: [{ s: 'ClC=C([O-])OCC', lp: [3] }, { s: 'O=Cc1ccccc1' }], ar: [{ f: ['l', 0, 3], t: ['b', 0, 2, 3] }, { f: ['b', 0, 1, 2], t: ['n', 0, 1, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'The new alkoxide closes onto the adjacent carbon from the back side, displacing chloride and forming the epoxide ring.',
        sp: [{ s: 'C(Cl)(C(=O)OCC)C([O-])c1ccccc1', lp: [8] }], ar: [{ f: ['l', 0, 8], t: ['n', 0, 8, 0, 0] }, { f: ['b', 0, 0, 1], t: ['a', 0, 1] }] },
      { cap: 'Product: the glycidic ester (an α,β-epoxy ester) and chloride.', sp: [{ s: 'O=C(OCC)C1OC1c1ccccc1' }, { s: '[Cl-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge sodium ethoxide in ethanol under nitrogen and cool.', level: 0.4, color: '#f0eee6', T: 0, n2: true, cool: true },
      { cap: 'Dose ethyl chloroacetate; the enolate forms.', dose: { color: '#f5f2df', name: 'Ethyl chloroacetate' }, T: 5, level: 0.55, cool: true },
      { cap: 'Dose the aldehyde slowly, keeping the mixture cold.', dose: { color: '#f5f5f5', name: 'Aldehyde' }, T: 10, level: 0.65, cool: true },
      { cap: 'Warm slowly to let ring closure complete, then hold.', heat: true, T: 25, solid: '#f0e9c8' },
      { cap: 'Quench, filter off sodium chloride, and separate: the glycidic ester in the organic layer.', solid: null, layers: ['#eef1e3', '#d9ecf7'], T: 20 }
    ],
    gas: [], gasNote: 'None',
    care: [
      'Sodium ethoxide is moisture-sensitive and corrosive; keep the system dry and under nitrogen.',
      'Diastereoselectivity (cis/trans glycidic ester) depends on reaction temperature and the base used; cold conditions generally favour one isomer.',
      'The product epoxy ester can hydrolyse or rearrange under strongly acidic work-up; keep quench conditions mild.',
      'Excess chloroacetate can self-condense; control stoichiometry relative to the aldehyde.'
    ],
    byp: [
      ['Unreacted aldehyde', 'Insufficient enolate generated, often from wet base. Dry the alkoxide and solvent.'],
      ['Glycolate ester (ring-opened)', 'Acidic or aqueous work-up opens the epoxide. Keep the quench and wash mild.'],
      ['Diastereomer mixture', 'Poor temperature control during addition. Keep cold through the addition and ring-closure steps.']
    ],
    moist: { lvl: 'High', txt: 'Water destroys the alkoxide before the enolate can form, and can also open the epoxide product on work-up. Use dry solvent and base; keep the final aqueous wash brief and mild.' },
    exo: { short: 'Moderately exothermic', txt: 'Deprotonation and the addition both release moderate heat; the ring-closure step is close to thermoneutral.' },
    plant: ['Confirm base dryness (assay or fresh material) before each batch.', 'Glycidic esters are useful intermediates toward α,β-unsaturated esters (via decarboxylative ring-opening) in later steps.', 'Filter sodium chloride before concentrating to avoid fouling.'],
    links: [['/molecules/reaction-lab/epoxidation-with-peracid/', 'Epoxidation with a peracid (a different route to the same ring)'], ['/molecules/reaction-lab/williamson-ether-synthesis/', 'Williamson ether synthesis (the same ring-closing SN2)'], ['/molecules/reaction/', 'Reaction Builder']]
  }
];
