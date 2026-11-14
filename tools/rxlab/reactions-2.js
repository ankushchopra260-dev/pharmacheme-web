/* Reaction lab, second set. Same format as reactions.js. */
const H3O = '[2H][O+]([2H])[2H]';
const S1 = 1, S2 = 1, S3 = 1, S4 = 1, S5 = -1;
module.exports = [
  {
    slug: 'fischer-esterification', name: 'Fischer esterification', short: 'Fischer esterification', cat: 'Acylation and activation',
    seo: 'Fischer Esterification: Mechanism and Plant Tips',
    desc: 'Acid-catalysed esterification of a carboxylic acid with an alcohol: animated mechanism, why water must be removed, by-products and plant handling.',
    intro: 'An acid and an alcohol give an ester and water when a strong acid catalyst is present. Every step is reversible, so the reaction stops at an equilibrium. The plant work is about pushing that equilibrium: excess alcohol, removing the water, or both.',
    eq: { r: [['CC(=O)O', 'Acetic acid'], ['CCCCO', 'n-Butanol']], p: [['CCCCOC(C)=O', 'Butyl acetate'], ['O', 'Water']], cond: 'H₂SO₄ (cat.), reflux' },
    mech: [
      { cap: 'The acid catalyst protonates the carbonyl oxygen. This makes the carbonyl carbon much more open to attack by a weak nucleophile like an alcohol.',
        sp: [{ s: 'CC(=O)O', lp: [2] }, { s: H3O }], ar: [{ f: ['l', 0, 2], t: ['n', 0, 2, 1, 2], side: -1 }, { f: ['b', 1, 2, 1], t: ['a', 1, 1] }] },
      { cap: 'The alcohol oxygen attacks the carbonyl carbon, and the C=O π electrons move onto the protonated oxygen.',
        sp: [{ s: 'CC(O)=[O+][2H]' }, { s: 'CCCCO', lp: [4] }], ar: [{ f: ['l', 1, 4], t: ['n', 1, 4, 0, 1] }, { f: ['b', 0, 1, 3], t: ['a', 0, 3] }] },
      { cap: 'A proton moves from the oxygen that came from the alcohol to one of the OH groups (through the solvent). That OH becomes a good leaving group: water.',
        sp: [{ s: 'CC(O)(O[2H])[O+]([2H])CCCC', lp: [2] }], ar: [{ f: ['l', 0, 2], t: ['n', 0, 2, 0, 6] }, { f: ['b', 0, 5, 6], t: ['a', 0, 5] }] },
      { cap: 'An OH lone pair pushes back down to re-form C=O, and water leaves.',
        sp: [{ s: 'CC(O[2H])(OCCCC)[O+]([2H])[2H]', lp: [2] }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 1, 9], t: ['a', 0, 9] }] },
      { cap: 'Water takes the proton back: the ester forms and the acid catalyst is regenerated.',
        sp: [{ s: 'CC(=[O+][2H])OCCCC' }, { s: 'O', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 3] }, { f: ['b', 0, 2, 3], t: ['a', 0, 2] }] },
      { cap: 'Products: ester and water. Removing the water (or using a large excess of alcohol) is what drives the conversion past the equilibrium.', sp: [{ s: 'CCCCOC(C)=O' }, { s: 'O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge acetic acid and excess n-butanol.', level: 0.5, color: '#eef0e6', T: 25, stir: true },
      { cap: 'Add concentrated sulfuric acid slowly. It warms the mixture.', dose: { color: '#f4f4f4', name: 'H₂SO₄' }, glow: true, T: 35 },
      { cap: 'Heat to reflux. Water distils over as its azeotrope with butanol and separates as a lower layer in the Dean–Stark trap; the butanol runs back.', T: 105, heat: true, distil: true },
      { cap: 'Hold until no more water collects and the acid content stops falling; the pot temperature climbs as water leaves.', T: 118, heat: true, distil: true, color: '#efe9d6' },
      { cap: 'Cool and wash with sodium bicarbonate solution to remove the catalyst and leftover acid. Carbon dioxide foams up: add slowly.', T: 25, dose: { color: '#e4f2fb', name: 'aq. NaHCO₃' }, gas: { name: 'CO₂' }, level: 0.75 },
      { cap: 'Separate the layers: ester in the organic layer.', layers: ['#efe9d6', '#d8ecf6'], T: 25 }
    ],
    gas: [], gasNote: 'None in the reaction; CO₂ in the bicarbonate wash',
    care: [
      'The reaction stops at equilibrium. Plan how water leaves (Dean–Stark, molecular sieves, distillation) rather than only extending the hold time.',
      'Concentrated sulfuric acid addition is exothermic; add it to the mixture, not the other way round.',
      'The bicarbonate wash gives CO₂ and can foam over. Add slowly with good venting and leave head space.',
      'Strong acid at reflux can dehydrate the alcohol, especially secondary and tertiary alcohols.'
    ],
    byp: [
      ['Dibutyl ether', 'From the alcohol and acid at high temperature. Keep the catalyst low and avoid overheating.'],
      ['Alkene', 'Dehydration of secondary or tertiary alcohols. Use a milder catalyst such as p-toluenesulfonic acid or a different route.'],
      ['Unreacted acid', 'Equilibrium not pushed far enough. Remove water or increase the alcohol excess.'],
      ['Alkyl sulfates', 'Alcohols with sulfuric acid can form alkyl hydrogen sulfates and traces of dialkyl sulfates (genotoxic). Use the least catalyst needed.']
    ],
    moist: { lvl: 'Low', txt: 'Water does not destroy anything, but it is a product: any water in the feed pushes the equilibrium back and lowers conversion. Use dry alcohol where conversion matters.' },
    exo: { short: 'Close to thermoneutral', txt: 'The esterification itself releases very little heat. The heat comes from adding sulfuric acid and from the bicarbonate neutralisation.' },
    plant: ['Track water collected in the trap against the theoretical amount; it is a simple conversion check.', 'Glass-lined equipment for hot sulfuric acid.', 'Check the ester for residual alcohol and sulfate esters before release.'],
    links: [['/articles/improve-reaction-conversion-and-yield/', 'Improve reaction conversion and yield'], ['/solvents/', 'Solvent properties'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'amide-from-acid-chloride', name: 'Amide formation from an acid chloride', short: 'Amide coupling (acid chloride)', cat: 'Acylation and activation',
    seo: 'Amide from Acid Chloride and Amine: Mechanism',
    desc: 'Acid chloride and amine to amide with a base (Schotten–Baumann type): animated mechanism, exotherm, HCl capture, moisture and by-product control.',
    intro: 'An amine attacks an acid chloride and the amide forms in minutes, releasing one mole of HCl. A base, usually triethylamine or aqueous alkali, takes up the HCl so that the amine is not used up as its salt. It is one of the most common bond-forming steps in API synthesis.',
    eq: { r: [['CC(=O)Cl', 'Acid chloride'], ['CN', 'Amine (methylamine shown)'], ['CCN(CC)CC', 'Triethylamine']], p: [['CC(=O)NC', 'Amide'], ['CC[NH+](CC)CC.[Cl-]', 'Triethylamine hydrochloride']], cond: 'toluene or THF, 0–10 °C' },
    mech: [
      { cap: 'The amine nitrogen attacks the carbonyl carbon of the acid chloride. The C=O π bond moves onto oxygen.',
        sp: [{ s: 'CN', lp: [1] }, { s: 'CC(=O)Cl' }], ar: [{ f: ['l', 0, 1], t: ['n', 0, 1, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The tetrahedral intermediate collapses: C=O re-forms and chloride leaves.',
        sp: [{ s: 'CC([O-])(Cl)[NH2+]C', lp: [2] }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 1, 3], t: ['a', 0, 3] }] },
      { cap: 'Triethylamine takes the proton from nitrogen, giving the neutral amide and triethylamine hydrochloride.',
        sp: [{ s: 'CC(=O)[NH+]([2H])C' }, { s: 'CCN(CC)CC', lp: [2] }], ar: [{ f: ['l', 1, 2], t: ['n', 1, 2, 0, 4] }, { f: ['b', 0, 3, 4], t: ['a', 0, 3] }] },
      { cap: 'Products: the amide and the hydrochloride salt, which usually comes out as a white solid in non-polar solvents.', sp: [{ s: 'CC(=O)NC' }, { s: 'CC[NH+](CC)CC' }, { s: '[Cl-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Under nitrogen, charge the amine and triethylamine in the solvent.', level: 0.45, color: '#eef1f3', T: 25, n2: true, stir: true },
      { cap: 'Cool to 0 °C.', T: 0, cool: true },
      { cap: 'Dose the acid chloride slowly. Each drop reacts at once; the temperature rises and the hydrochloride salt starts to come out.', dose: { color: '#f1ead0', name: 'Acid chloride' }, glow: true, cool: true, T: 8, level: 0.55, solid: '#ffffff' },
      { cap: 'Stir at 5–10 °C until the amine is used up (check by TLC or HPLC).', cool: true, T: 6 },
      { cap: 'Add water to dissolve the salt, then separate the layers.', dose: { color: '#dceef8', name: 'Water' }, solid: null, level: 0.8, T: 15 },
      { cap: 'Amide in the organic layer, triethylamine hydrochloride in the water.', layers: ['#eef1f3', '#d8ecf6'], T: 20 }
    ],
    gas: [], gasNote: 'None while the base is present; HCl fumes without base',
    care: [
      'Fast and exothermic: control the temperature with the dosing rate.',
      'Use at least one equivalent of base; without it half the amine is lost as its hydrochloride and HCl can fume.',
      'Acid chlorides hydrolyse in moist air and solvent to the acid and HCl. Keep everything dry until the reaction is complete.',
      'Thick slurries of the hydrochloride salt can stop stirring; leave enough solvent.'
    ],
    byp: [
      ['Carboxylic acid', 'From water hydrolysing the acid chloride. Dry solvent and amine; dose the acid chloride last.'],
      ['Diacylation (imide)', 'Excess acid chloride on primary amides at higher temperature. Keep near 1.0–1.05 eq and cold.'],
      ['Ester', 'If an alcohol is present (solvent or another group). Avoid alcohol solvents.'],
      ['Ketene products', 'Acid chlorides with an α-hydrogen can lose HCl to a ketene with strong base. Keep cold and dose slowly.']
    ],
    moist: { lvl: 'High', txt: 'The acid chloride reacts with water to give the carboxylic acid and HCl, lowering yield and adding an impurity that can be hard to remove. Dry solvent and amine are needed; the Schotten–Baumann version in water works only because the amine reacts faster than water.' },
    exo: { short: 'Strongly exothermic', txt: 'Typically 20–30 kcal per mole of acid chloride, plus the heat of neutralising HCl with the base. Run as dosing-controlled.' },
    plant: ['Charge the acid chloride below the liquid surface or with good mixing to avoid local hot spots.', 'Check the amine assay before charging; the stoichiometry depends on it.', 'The aqueous layer contains triethylamine hydrochloride; it can be recovered with caustic.'],
    links: [['/molecules/reaction-lab/acid-chloride-thionyl-chloride/', 'Making the acid chloride'], ['/articles/common-chemical-reactions-in-plants/', 'Common reactions in plants'], ['/process-modelling/semi-batch-dosing-simulator/', 'Semi-batch dosing simulator']]
  },
  {
    slug: 'friedel-crafts-acylation', name: 'Friedel–Crafts acylation', short: 'Friedel–Crafts acylation', cat: 'Aromatic substitution',
    seo: 'Friedel–Crafts Acylation: Mechanism, HCl, Quench',
    desc: 'Friedel–Crafts acylation with aluminium chloride: animated mechanism, HCl gas per kg, the violent quench, moisture sensitivity and by-product control.',
    intro: 'Aluminium chloride pulls chloride off an acid chloride to make an acylium ion, which attacks an aromatic ring. The ketone product binds the aluminium chloride, so more than one equivalent is needed and the mixture has to be quenched into water at the end. Both the reaction and the quench release hydrogen chloride.',
    eq: { r: [['C1=CC=CC=C1', 'Arene (benzene shown)'], ['CC(=O)Cl', 'Acetyl chloride']], p: [['CC(=O)c1ccccc1', 'Aryl ketone'], ['Cl', 'HCl']], cond: 'AlCl₃ (1.1–1.3 eq), 0–25 °C' },
    mech: [
      { cap: 'A chlorine lone pair of the acid chloride bonds to aluminium, and the C–Cl bond breaks.',
        sp: [{ s: 'CC(=O)Cl', lp: [3] }, { s: 'Cl[Al](Cl)Cl' }], ar: [{ f: ['l', 0, 3], t: ['n', 0, 3, 1, 1] }, { f: ['b', 0, 1, 3], t: ['a', 0, 3] }] },
      { cap: 'This gives the acylium ion, a strong electrophile. A π bond of the ring attacks its carbon.',
        sp: [{ s: 'C1=CC=CC=C1' }, { s: 'CC#[O+]' }, { s: 'Cl[Al-](Cl)(Cl)Cl' }], ar: [{ f: ['b', 0, 0, 1], t: ['n', 0, 0, 1, 1], side: S1 }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The ring has lost its aromaticity (σ-complex). AlCl₄⁻ removes the proton, the ring becomes aromatic again, and HCl and AlCl₃ are released.',
        sp: [{ s: 'CC(=O)C1([2H])C=CC=C[CH+]1' }, { s: 'Cl[Al-](Cl)(Cl)Cl', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 4] }, { f: ['b', 0, 3, 4], t: ['b', 0, 3, 9] }] },
      { cap: 'Products: the aryl ketone (held as a complex with AlCl₃ until the quench) and HCl gas.', sp: [{ s: 'CC(=O)c1ccccc1' }, { s: 'Cl' }, { s: 'Cl[Al](Cl)Cl' }], ar: [] }
    ],
    lab: [
      { cap: 'Dry reactor under nitrogen. Charge the solvent and aluminium chloride: a grey-white slurry.', level: 0.4, color: '#e6e8ea', solid: '#f2f2f2', T: 20, n2: true, stir: true },
      { cap: 'Cool to 0–5 °C and dose the acid chloride. The complex forms; the slurry turns yellow.', cool: true, T: 5, dose: { color: '#f0e9c8', name: 'Acetyl chloride' }, color: '#f1dc8a', level: 0.48 },
      { cap: 'Dose the arene slowly. HCl gas comes off at once and goes to the scrubber; the mixture turns orange.', cool: true, T: 8, dose: { color: '#f7f7f7', name: 'Arene' }, gas: { name: 'HCl' }, color: '#e7a84e', solid: null, glow: true, level: 0.58 },
      { cap: 'Warm to 20–25 °C and hold until the HCl stops and the arene is used up.', T: 22, gas: { name: 'HCl', slow: true }, color: '#d98f3a' },
      { cap: 'This flask is now the quench vessel with ice-cold dilute hydrochloric acid; the reaction mass is transferred into it slowly. Very exothermic, more HCl fumes.', dose: { color: '#d98f3a', name: 'Reaction mass' }, glow: true, cool: true, gas: { name: 'HCl fumes' }, T: 30, level: 0.85, color: '#c9b08a' },
      { cap: 'Separate the layers: the ketone in the organic layer, aluminium salts in the acidic water.', layers: ['#efe2bd', '#dceef8'], T: 25 }
    ],
    gas: [{ n: 'Hydrogen chloride', s: 'Cl', mol: 1, note: 'Corrosive. Scrub in water then caustic. More HCl fumes during the quench.' }],
    care: [
      'Aluminium chloride reacts violently with water and moist air, giving HCl. Charge it from dry, sealed containers under nitrogen.',
      'HCl comes off as fast as the arene reacts; size the vent and scrubber for the dosing rate.',
      'The quench is the most dangerous step: highly exothermic and gassing. Always add the reaction mass to the water (reverse quench), slowly, with cooling.',
      'Aluminium salts can form gels and emulsions; quench into acid to keep them dissolved.'
    ],
    byp: [
      ['Ortho/para isomers', 'Ring substituents decide the position. Solvent and temperature shift the ratio; set them in development and keep them fixed.'],
      ['Unreacted arene', 'AlCl₃ is consumed by the product; use 1.1–1.3 eq and dry reagents.'],
      ['Demethylation of aryl methyl ethers', 'AlCl₃ can cleave OMe groups at higher temperature. Keep cold and limit the hold.'],
      ['Tars', 'Overheating or long holds. Control temperature and quench promptly.']
    ],
    moist: { lvl: 'Very high', txt: 'Water destroys aluminium chloride (and makes HCl), deactivates the catalyst and lowers conversion. Use dry solvent and reagents, dry nitrogen, and keep the AlCl₃ container closed.' },
    exo: { short: 'Exothermic, quench very exothermic', txt: 'The acylation is moderately exothermic; the quench of the AlCl₃ complex into water is far more so and gives HCl. Both are run as dosing-controlled operations.' },
    plant: ['Glass-lined equipment; HCl and aluminium chloride attack steel.', 'Weigh AlCl₃ in a dry, closed system; lumps and dust hydrolyse in air.', 'Plan the quench vessel volume and cooling before the batch starts.'],
    links: [['/articles/grignard-friedel-crafts-coupling/', 'Grignard, Friedel–Crafts and coupling'], ['/molecules/reaction-lab/aromatic-bromination/', 'Aromatic bromination'], ['/process-safety/', 'Process safety']]
  },
  {
    slug: 'aromatic-nitration', name: 'Aromatic nitration with mixed acid', short: 'Nitration', cat: 'Aromatic substitution',
    seo: 'Aromatic Nitration: Mechanism and Runaway Control',
    desc: 'Nitration of an arene with nitric and sulfuric acid: animated nitronium mechanism, heat of reaction, runaway risk, NOx, by-products and plant control.',
    intro: 'Sulfuric acid turns nitric acid into the nitronium ion, NO₂⁺, which attacks the aromatic ring. Nitration is fast and very exothermic, and the products and by-products can decompose violently, so it is one of the most hazardous common reactions. Control is all about dosing, cooling and never letting unreacted material build up.',
    eq: { r: [['C1=CC=CC=C1', 'Arene (benzene shown)'], ['O[N+](=O)[O-]', 'Nitric acid']], p: [['[O-][N+](=O)c1ccccc1', 'Nitroarene'], ['O', 'Water']], cond: 'H₂SO₄, 30–50 °C' },
    mech: [
      { cap: 'Sulfuric acid, the stronger acid, protonates the OH group of nitric acid.',
        sp: [{ s: 'O[N+](=O)[O-]', lp: [0] }, { s: '[2H]OS(=O)(=O)O' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'Water leaves, giving the nitronium ion NO₂⁺.',
        sp: [{ s: '[2H][O+]([2H])[N+](=O)[O-]', lp: [5] }], ar: [{ f: ['l', 0, 5], t: ['b', 0, 3, 5] }, { f: ['b', 0, 1, 3], t: ['a', 0, 1] }] },
      { cap: 'A π bond of the ring attacks the nitrogen of NO₂⁺; one N=O π bond moves onto oxygen.',
        sp: [{ s: 'C1=CC=CC=C1' }, { s: 'O=[N+]=O' }], ar: [{ f: ['b', 0, 0, 1], t: ['n', 0, 0, 1, 1], side: S2 }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'Hydrogen sulfate removes the proton from the σ-complex and the ring becomes aromatic again.',
        sp: [{ s: '[O-][N+](=O)C1([2H])C=CC=C[CH+]1' }, { s: 'OS(=O)(=O)[O-]', lp: [4] }], ar: [{ f: ['l', 1, 4], t: ['n', 1, 4, 0, 4] }, { f: ['b', 0, 3, 4], t: ['b', 0, 3, 9] }] },
      { cap: 'Products: the nitroarene and water. The water dilutes the acid, which is why spent acid is weaker and slower than fresh mixed acid.', sp: [{ s: '[O-][N+](=O)c1ccccc1' }, { s: 'O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge sulfuric acid and cool to 5–10 °C.', level: 0.35, color: '#f2f2ee', T: 8, cool: true, stir: true },
      { cap: 'Dose nitric acid to make the mixed acid. This mixing is itself exothermic.', dose: { color: '#f5f0dc', name: 'Nitric acid' }, glow: true, cool: true, T: 15, level: 0.45 },
      { cap: 'Dose the arene slowly at 30–40 °C. It reacts as it goes in; the dosing rate is set by the cooling capacity.', dose: { color: '#f7f7f7', name: 'Arene' }, glow: true, cool: true, T: 35, level: 0.6, color: '#f4e7a8' },
      { cap: 'Hold at 40–50 °C until the arene is consumed. Brown NOx fumes mean oxidation side reactions: check temperature and acid strength.', T: 45, heat: true, gas: { name: 'NOx (traces)', slow: true }, color: '#f0dc86' },
      { cap: 'This flask is now the quench vessel with ice water; the reaction mass is run into it slowly. Once the acid is diluted, the nitroarene is denser than the water layer and settles to the bottom.', dose: { color: '#f0dc86', name: 'Reaction mass' }, glow: true, cool: true, T: 25, level: 0.85 },
      { cap: 'Separate: diluted acid on top, crude nitroarene below. Wash the product to remove acid before any distillation.', layers: ['#e8f1f5', '#ecd36b'], T: 25 }
    ],
    gas: [], gasNote: 'None normally; brown NOx if overheated',
    care: [
      'Nitration is fast and strongly exothermic. Never add arene faster than the cooling can remove the heat, and stop dosing if the temperature does not rise as expected (accumulation).',
      'Loss of agitation is dangerous: the arene floats on the acid and builds up, then reacts all at once when stirring restarts. Interlock the feed with the agitator.',
      'Nitro compounds, especially polynitro and nitrophenols, can decompose violently at high temperature. Know the onset temperature (DSC) of the reaction mass and distillation residues.',
      'Brown NOx fumes indicate oxidation; they are toxic and signal that conditions are drifting.',
      'Never distil crude nitro products to dryness.'
    ],
    byp: [
      ['Dinitro compounds', 'Too much nitric acid, too strong acid or too high temperature. Use close to 1.0–1.05 eq and control temperature.'],
      ['Nitrophenols', 'Oxidation side reactions. They are acidic and unstable; remove them by alkaline washing.'],
      ['Isomers (ortho/meta/para)', 'Set by the substituent; temperature and acid strength shift the ratio slightly.'],
      ['Oxidation products and NOx', 'High temperature or excess nitric acid. Keep conditions inside the developed window.']
    ],
    moist: { lvl: 'Medium', txt: 'Water does not destroy the reagents, but it dilutes the mixed acid and lowers the nitronium concentration. A weaker acid reacts slowly, which lets unreacted arene build up: a hidden accumulation hazard. Check the acid strength of every batch.' },
    exo: { dH: -28, txt: 'About 28 kcal per mole of nitro groups introduced, plus heat from mixing the acids and diluting them in the quench. The adiabatic temperature rise of a typical batch is well above 100 °C, so cooling and dosing control are essential.' },
    plant: ['Reaction calorimetry and DSC data are a must before scale-up.', 'Use a dosing interlock on high temperature and on agitator failure.', 'Have a dump or drown-out tank sized for the batch.'],
    links: [['/articles/nitration-sulfonation-halogenation/', 'Nitration, sulfonation and halogenation'], ['/training/modules/runaway-reactions-safe-dosing/', 'Runaway reactions and safe dosing'], ['/process-modelling/semi-batch-dosing-simulator/', 'Semi-batch dosing simulator']]
  },
  {
    slug: 'sodium-borohydride-reduction', name: 'Sodium borohydride reduction of a ketone', short: 'NaBH₄ reduction', cat: 'Reduction',
    seo: 'Sodium Borohydride Reduction: Mechanism, H₂ Gas',
    desc: 'Ketone to alcohol with sodium borohydride: animated hydride transfer, hydrogen gas from the quench per kg, moisture and pH, by-products and plant care.',
    intro: 'Sodium borohydride delivers a hydride (H⁻) to the carbon of an aldehyde or ketone, giving an alcohol after work-up. It is mild, selective and works in alcohols or even water, which makes it a plant favourite. The catch is hydrogen gas: borohydride slowly reacts with protic solvents, and fast with acid.',
    eq: { r: [['CC(C)=O', 'Ketone (acetone shown)'], ['[Na+].[BH4-]', 'Sodium borohydride']], p: [['CC(C)O', 'Secondary alcohol']], cond: 'MeOH, 0–20 °C; then acid quench', note: 'one BH₄⁻ can reduce up to four ketones; borate salts not shown' },
    mech: [
      { cap: 'A B–H bond delivers its electrons, with the hydrogen, to the carbonyl carbon. The C=O π bond moves onto oxygen.',
        sp: [{ s: '[2H][B-]([2H])([2H])[2H]' }, { s: 'CC(C)=O' }], ar: [{ f: ['b', 0, 0, 1], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 1, 3], t: ['a', 1, 3] }] },
      { cap: 'The alkoxide takes a proton from the solvent (methanol here), giving the alcohol.',
        sp: [{ s: 'CC(C)([2H])[O-]', lp: [4] }, { s: 'CO[2H]' }], ar: [{ f: ['l', 0, 4], t: ['n', 0, 4, 1, 2] }, { f: ['b', 1, 1, 2], t: ['a', 1, 1] }] },
      { cap: 'Product: the alcohol. Each borohydride can deliver up to four hydrides; the boron ends up as borate esters, which are broken up in the work-up.', sp: [{ s: 'CC(C)O' }, { s: 'C[O-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the ketone in methanol and cool to 0–5 °C.', level: 0.5, color: '#eef2f5', T: 3, cool: true, stir: true },
      { cap: 'Add sodium borohydride in portions (or as a stabilised alkaline solution). Each portion foams a little: some hydrogen from reaction with methanol.', dose: { color: '#ffffff', name: 'NaBH₄' }, gas: { name: 'H₂ (slow)', slow: true }, glow: true, cool: true, T: 10 },
      { cap: 'Stir at 10–20 °C until the ketone is gone.', T: 18, gas: { name: 'H₂ (slow)', slow: true } },
      { cap: 'Quench slowly with dilute acid (or acetone first, to use up excess hydride). Hydrogen comes off fast here.', dose: { color: '#dceef8', name: 'dil. HCl' }, gas: { name: 'Hydrogen' }, glow: true, T: 22, level: 0.65 },
      { cap: 'Distil off methanol, then extract the alcohol.', distil: true, heat: true, T: 55, level: 0.45 }
    ],
    gas: [{ n: 'Hydrogen', s: '[H][H]', mol: 1, per: 'when 0.25 eq of excess borohydride is destroyed in the acid quench (4 H₂ per BH₄⁻)', note: 'Flammable, very light, wide explosive range. Inert the head space and vent to a safe place.' }],
    care: [
      'Hydrogen comes from borohydride meeting acid, water or alcohol. The quench gives the most gas: add acid slowly with nitrogen sweep.',
      'Borohydride solutions are stabilised with caustic; do not let them become acidic in storage.',
      'Portion-wise addition of solid can give delayed reaction and foaming. A dosed solution is easier to control.',
      'Boron residues must be removed in the work-up (acidic or oxidative), or they carry into the product.',
      'A fast acid quench of excess borohydride can also release diborane, a toxic gas. Quench slowly, keep the vent swept with nitrogen, or destroy excess hydride with acetone first.'
    ],
    byp: [
      ['Borate esters', 'Bound alcohol product. Hydrolyse fully in the work-up (acid, or heating with methanol to remove trimethyl borate).'],
      ['Over-reduction', 'Rare with ketones; esters and acids are normally untouched at low temperature. Keep the temperature down.'],
      ['Diastereomers', 'For substituted ketones the face of attack sets the stereochemistry. Temperature and additives (CeCl₃) change the ratio.']
    ],
    moist: { lvl: 'Low', txt: 'Borohydride works in water and alcohols, but slowly decomposes in them, giving hydrogen and losing strength. Store it dry; add a small excess to cover losses.' },
    exo: { short: 'Moderately exothermic', txt: 'The reduction and the quench both release heat; the quench also releases hydrogen. Add reagent and acid in portions with cooling.' },
    plant: ['Inert the reactor and check the vent for hydrogen service.', 'Measure off-gas or watch the foam level during the quench.', 'Check borohydride assay (hydrogen evolution test) for old lots.'],
    links: [['/articles/hydrogenation-and-reduction/', 'Hydrogenation and reduction'], ['/molecules/reaction-lab/lithium-aluminium-hydride-ester-reduction/', 'LiAlH₄ reduction of an ester'], ['/articles/hydrogenation-safety/', 'Hydrogen safety']]
  },
  {
    slug: 'lithium-aluminium-hydride-ester-reduction', name: 'Lithium aluminium hydride reduction of an ester', short: 'LiAlH₄ ester reduction', cat: 'Reduction',
    seo: 'LiAlH₄ Ester Reduction: Mechanism, Safe Quench',
    desc: 'Ester to alcohol with lithium aluminium hydride: animated two-hydride mechanism, hydrogen in the quench, very high moisture sensitivity and safe work-up.',
    intro: 'Lithium aluminium hydride is a far stronger hydride donor than sodium borohydride. It reduces esters all the way to primary alcohols, using two hydrides per ester. It reacts violently with water and alcohols, so both the reaction and the quench need care.',
    eq: { r: [['CC(=O)OCC', 'Ester (ethyl acetate shown)'], ['[Li+].[AlH4-]', 'Lithium aluminium hydride']], p: [['CCO', 'Primary alcohol'], ['CCO', 'Alcohol from the ester part']], cond: 'dry THF, 0 °C to reflux; then careful quench', note: 'aluminium and lithium salts from the quench not shown' },
    mech: [
      { cap: 'A hydride from AlH₄⁻ attacks the ester carbonyl carbon; the C=O π bond moves onto oxygen.',
        sp: [{ s: '[2H][Al-]([2H])([2H])[2H]' }, { s: 'CC(=O)OCC' }], ar: [{ f: ['b', 0, 0, 1], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The intermediate collapses: C=O re-forms and ethoxide leaves, giving an aldehyde.',
        sp: [{ s: 'CC([2H])([O-])OCC', lp: [3] }], ar: [{ f: ['l', 0, 3], t: ['b', 0, 1, 3] }, { f: ['b', 0, 1, 4], t: ['a', 0, 4] }] },
      { cap: 'The aldehyde is more reactive than the ester, so it takes a second hydride at once. That is why the reaction cannot be stopped at the aldehyde with LiAlH₄.',
        sp: [{ s: '[2H][Al-]([2H])([2H])[2H]' }, { s: 'CC([2H])=O' }, { s: 'CC[O-]' }], ar: [{ f: ['b', 0, 0, 1], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 1, 3], t: ['a', 1, 3] }] },
      { cap: 'After the quench, the two alkoxides become two alcohols: the primary alcohol from the acyl part and the alcohol from the ester part.', sp: [{ s: 'CCO' }, { s: 'CCO' }], ar: [] }
    ],
    lab: [
      { cap: 'Dry reactor under nitrogen. Charge dry THF and LiAlH₄: a grey suspension.', level: 0.4, color: '#b9b7b1', solid: '#8f8f8f', T: 20, n2: true, stir: true },
      { cap: 'Cool to 0 °C and dose the ester in THF. Strong exotherm; keep below 10 °C.', cool: true, dose: { color: '#f6f6f6', name: 'Ester in THF' }, glow: true, T: 8, level: 0.55 },
      { cap: 'Warm, then reflux briefly to finish the reduction.', T: 66, heat: true },
      { cap: 'Cool to 0 °C. Quench by slowly adding water, drop by drop: very vigorous hydrogen evolution.', cool: true, T: 5, dose: { color: '#dceef8', name: 'Water' }, gas: { name: 'Hydrogen' }, glow: true },
      { cap: 'Then 15 % sodium hydroxide, then more water. The aluminium salts become a white, granular solid that filters well.', dose: { color: '#e5f2fa', name: '15 % NaOH, water' }, gas: { name: 'Hydrogen', slow: true }, solid: '#ffffff', color: '#eeeeea', T: 15, level: 0.62 },
      { cap: 'Filter off the salts; the alcohol is in the THF filtrate.', solid: null, T: 20, level: 0.5, color: '#f2f1ec' }
    ],
    gas: [{ n: 'Hydrogen', s: '[H][H]', mol: 1, per: 'when 0.25 eq of excess LiAlH₄ is destroyed in the quench (4 H₂ per AlH₄⁻)', note: 'Flammable. Quench under nitrogen sweep; vent to a safe place.' }],
    care: [
      'LiAlH₄ reacts violently with water, alcohols and acids, giving hydrogen that can ignite. Keep it dry and never charge solid onto a wet surface.',
      'Use a quench with known amounts (for x g LiAlH₄: x mL water, x mL 15 % NaOH, 3x mL water) to get filterable salts and avoid gels.',
      'Dosing the ester gives a strong exotherm; set the dosing rate by the cooling.',
      'Solid LiAlH₄ dust can ignite in moist air. Handle it under nitrogen, or use the THF solution.'
    ],
    byp: [
      ['Aluminium gels', 'Wrong quench ratio or speed. Follow the water/caustic/water quench and stir long enough.'],
      ['Over-reduction of other groups', 'LiAlH₄ also reduces acids, amides, nitriles and halides. Protect or choose a milder reagent.'],
      ['Aldehyde', 'Not isolated with LiAlH₄. For aldehydes, use DIBAL at −78 °C.']
    ],
    moist: { lvl: 'Very high', txt: 'Water destroys the reagent violently and gives hydrogen. Wet THF can cause a fire on charging. Dry the solvent (Karl Fischer), dry the reactor and keep a nitrogen blanket throughout.' },
    exo: { short: 'Strongly exothermic, quench violent', txt: 'Both the reduction and the quench release a lot of heat; the quench also releases hydrogen. Both are dosing-controlled.' },
    plant: ['Many plants replace LiAlH₄ with sodium bis(2-methoxyethoxy)aluminium hydride (a toluene solution) for safer handling.', 'Quench into a vessel with spare volume for foaming.', 'Check the vent for hydrogen and keep ignition sources away.'],
    links: [['/molecules/reaction-lab/sodium-borohydride-reduction/', 'Sodium borohydride reduction'], ['/articles/hydrogenation-and-reduction/', 'Hydrogenation and reduction'], ['/process-safety/', 'Process safety']]
  },
  {
    slug: 'williamson-ether-synthesis', name: 'Williamson ether synthesis (with sodium hydride)', short: 'Williamson ether', cat: 'Substitution and alkylation',
    seo: 'Williamson Ether Synthesis: SN2 Mechanism, NaH',
    desc: 'Alcohol deprotonated with sodium hydride, then SN2 alkylation to an ether: animated mechanism, hydrogen gas per kg, NaH hazards and elimination side reactions.',
    intro: 'An alkoxide attacks an alkyl halide from the back side and pushes out the halide in one step (SN2), making an ether. The alkoxide is often made with sodium hydride, which gives hydrogen gas. Primary alkyl halides work best; secondary and tertiary ones tend to eliminate instead.',
    eq: { r: [['CCO', 'Alcohol (ethanol shown)'], ['BrCc1ccccc1', 'Benzyl bromide'], ['[Na+].[H-]', 'Sodium hydride']], p: [['CCOCc1ccccc1', 'Benzyl ether'], ['[H][H]', 'Hydrogen'], ['[Na+].[Br-]', 'Sodium bromide']], cond: 'THF, 0–25 °C' },
    mech: [
      { cap: 'Hydride from sodium hydride takes the proton of the alcohol, releasing hydrogen gas and giving the alkoxide.',
        sp: [{ s: 'CCO[2H]' }, { s: '[2H-]', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 3], side: -1 }, { f: ['b', 0, 2, 3], t: ['a', 0, 2] }] },
      { cap: 'The alkoxide attacks the carbon of the alkyl halide from the side opposite the bromine, and bromide leaves in the same step (SN2).',
        sp: [{ s: 'CC[O-]', lp: [2] }, { s: 'C(Br)c1ccccc1' }], ar: [{ f: ['l', 0, 2], t: ['n', 0, 2, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'Products: the benzyl ether and bromide (as sodium bromide).', sp: [{ s: 'CCOCc1ccccc1' }, { s: '[Br-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Under nitrogen, charge dry THF and the alcohol; cool to 0–5 °C.', level: 0.45, color: '#eef1f3', T: 3, n2: true, cool: true, stir: true },
      { cap: 'Add sodium hydride (60 % in mineral oil) in portions. Hydrogen bubbles off with each portion.', dose: { color: '#d8d8d0', name: 'NaH (in oil)' }, gas: { name: 'Hydrogen' }, glow: true, cool: true, T: 10, solid: '#d0d0c8' },
      { cap: 'Stir until gas stops: the alkoxide is ready.', T: 15, gas: { name: 'Hydrogen', slow: true } },
      { cap: 'Dose benzyl bromide. The SN2 reaction warms the mixture; sodium bromide comes out as a fine solid.', dose: { color: '#f5f5f5', name: 'Benzyl bromide' }, glow: true, T: 25, solid: '#ffffff', level: 0.55 },
      { cap: 'Quench carefully with water (excess hydride gives more hydrogen), then separate the layers.', dose: { color: '#dceef8', name: 'Water' }, gas: { name: 'Hydrogen', slow: true }, T: 20, level: 0.8, solid: null },
      { cap: 'Ether in the organic layer; the mineral oil from the hydride goes with it and is removed later.', layers: ['#eef1f3', '#d8ecf6'], T: 20 }
    ],
    gas: [{ n: 'Hydrogen', s: '[H][H]', mol: 1, note: 'From deprotonation with sodium hydride. Flammable: inert the head space and vent safely.' }],
    care: [
      'Sodium hydride reacts with water and moist air to give hydrogen and caustic. Keep it dry; charge under nitrogen.',
      'Sodium hydride in DMF or DMAc can undergo a runaway decomposition on warming. Avoid that combination at scale or keep it cold with proven safety data.',
      'Hydrogen comes off with each portion of NaH; add in portions and wait for the gas to slow.',
      'Benzyl bromide and other alkyl halides are toxic alkylating agents, and benzyl bromide is a strong lachrymator; handle in closed systems.'
    ],
    byp: [
      ['Alkene (elimination)', 'The alkoxide acts as a base on secondary or tertiary halides. Use a primary halide, or a less basic route.'],
      ['C-alkylation', 'With phenoxides or enolates, alkylation can occur on carbon. Solvent and counter-ion control the ratio.'],
      ['Residual benzyl or alkyl halide', 'Genotoxic impurity. Use a small excess and destroy it in the work-up (e.g., with an amine).']
    ],
    moist: { lvl: 'High', txt: 'Water uses up sodium hydride (giving hydrogen) and turns the alkoxide back into alcohol and hydroxide, which then makes alcohol by-products. Use dry solvent and alcohol.' },
    exo: { short: 'Moderately exothermic', txt: 'Deprotonation with NaH and the SN2 step both release heat; the hydrogen release is the main hazard.' },
    plant: ['Weigh NaH dispersion in a closed, inerted system.', 'Measure hydrogen off-gas to confirm the deprotonation is complete before dosing the alkyl halide.', 'Potassium tert-butoxide or phase-transfer catalysis avoid hydrogen altogether where they work.'],
    links: [['/articles/common-chemical-reactions-in-plants/', 'Common reactions in plants'], ['/molecules/reaction-lab/epoxide-ring-opening-with-amine/', 'Epoxide opening (another SN2)'], ['/process-safety/', 'Process safety']]
  },
  {
    slug: 'boc-protection-of-amine', name: 'Boc protection of an amine', short: 'Boc protection', cat: 'Protecting groups',
    seo: 'Boc Protection with Boc₂O: Mechanism and CO₂',
    desc: 'Amine protection with di-tert-butyl dicarbonate (Boc₂O): animated mechanism, carbon dioxide gas per kg, foaming, by-products and plant handling.',
    intro: 'Di-tert-butyl dicarbonate (Boc anhydride) puts a tert-butoxycarbonyl group on an amine, making a carbamate that is stable to bases and nucleophiles. The leaving group falls apart into carbon dioxide and tert-butanol, so gas is released throughout the reaction.',
    eq: { r: [['CN', 'Amine (methylamine shown)'], ['CC(C)(C)OC(=O)OC(=O)OC(C)(C)C', 'Boc anhydride']], p: [['CC(C)(C)OC(=O)NC', 'Boc-protected amine'], ['O=C=O', 'Carbon dioxide'], ['CC(C)(C)O', 'tert-Butanol']], cond: 'THF or water/base, 20–40 °C' },
    mech: [
      { cap: 'The amine nitrogen attacks one carbonyl carbon of Boc anhydride.',
        sp: [{ s: 'CN', lp: [1] }, { s: 'CC(C)(C)OC(=O)OC(=O)OC(C)(C)C' }], ar: [{ f: ['l', 0, 1], t: ['n', 0, 1, 1, 5] }, { f: ['b', 1, 5, 6], t: ['a', 1, 6] }] },
      { cap: 'The intermediate collapses and the tert-butyl carbonate group leaves.',
        sp: [{ s: 'CC(C)(C)OC([O-])([NH2+]C)OC(=O)OC(C)(C)C', lp: [6] }], ar: [{ f: ['l', 0, 6], t: ['b', 0, 5, 6] }, { f: ['b', 0, 5, 9], t: ['a', 0, 9] }] },
      { cap: 'The tert-butyl carbonate falls apart into carbon dioxide gas and tert-butoxide.',
        sp: [{ s: 'CC(C)(C)OC(=O)[NH2+]C' }, { s: 'CC(C)(C)OC(=O)[O-]', lp: [7] }], ar: [{ f: ['l', 1, 7], t: ['b', 1, 5, 7] }, { f: ['b', 1, 4, 5], t: ['a', 1, 4] }] },
      { cap: 'tert-Butoxide takes the proton from nitrogen, giving the neutral carbamate and tert-butanol.',
        sp: [{ s: 'CC(C)(C)OC(=O)[NH+]([2H])C' }, { s: 'CC(C)(C)[O-]', lp: [4] }, { s: 'O=C=O' }], ar: [{ f: ['l', 1, 4], t: ['n', 1, 4, 0, 8] }, { f: ['b', 0, 7, 8], t: ['a', 0, 7] }] },
      { cap: 'Products: the Boc carbamate, carbon dioxide and tert-butanol.', sp: [{ s: 'CC(C)(C)OC(=O)NC' }, { s: 'O=C=O' }, { s: 'CC(C)(C)O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the amine in the solvent (with a base if the amine is a salt).', level: 0.45, color: '#eef1f3', T: 20, stir: true },
      { cap: 'Dose Boc anhydride (melted or as a solution). Carbon dioxide bubbles off steadily.', dose: { color: '#f7f7f2', name: 'Boc₂O' }, gas: { name: 'CO₂' }, T: 28, glow: true, level: 0.55 },
      { cap: 'Stir at 25–40 °C until the amine is gone and the gas stops.', T: 32, gas: { name: 'CO₂', slow: true } },
      { cap: 'Work up: wash, separate layers and remove tert-butanol by distillation.', layers: ['#eef1f3', '#d8ecf6'], T: 25 }
    ],
    gas: [{ n: 'Carbon dioxide', s: 'O=C=O', mol: 1, note: 'Not toxic at these levels but displaces air and causes foaming. Never close the vessel.' }],
    care: [
      'Carbon dioxide is released throughout; a closed or blocked vessel can pressurise. Keep the vent open.',
      'Foaming can be strong in some solvents; dose Boc anhydride at a controlled rate.',
      'Boc anhydride melts near 23 °C and is toxic by inhalation; handle melted material in closed lines.',
      'Excess Boc anhydride carries into the product; destroy it with a small amount of amine (e.g., imidazole or dimethylaminopropylamine) before work-up if needed.'
    ],
    byp: [
      ['Di-Boc amine', 'Large excess of Boc₂O with DMAP on primary amines. Use 1.0–1.1 eq and avoid DMAP unless needed.'],
      ['Urea / isocyanate products', 'With DMAP or at high temperature. Keep mild conditions.'],
      ['Boc on other groups (O-Boc)', 'Phenols and alcohols with DMAP. Choose conditions that favour the amine.']
    ],
    moist: { lvl: 'Low', txt: 'Boc anhydride reacts only slowly with water; the reaction is often run in water with a base. Long holds in wet solvent do slowly consume the reagent.' },
    exo: { short: 'Mildly exothermic', txt: 'The heat release is modest; gas release and foaming set the dosing rate more than heat does.' },
    plant: ['Vent through a line sized for the CO₂ rate at the planned dosing time.', 'tert-Butanol freezes at 25 °C; keep lines warm or flush them.', 'Check residual Boc₂O and tert-butanol in the isolated product.'],
    links: [['/molecules/reaction-lab/boc-deprotection-with-hcl/', 'Boc deprotection with HCl'], ['/articles/common-chemical-reactions-in-plants/', 'Common reactions in plants'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'boc-deprotection-with-hcl', name: 'Boc deprotection with hydrogen chloride', short: 'Boc deprotection', cat: 'Protecting groups',
    seo: 'Boc Deprotection with HCl: Mechanism and Off-Gas',
    desc: 'Removing a Boc group with HCl: animated mechanism through the tert-butyl cation, isobutylene and CO₂ gas per kg, tert-butyl chloride and genotoxic impurities.',
    intro: 'Acid removes the Boc group by breaking it into a tert-butyl cation, carbon dioxide and the free amine, which ends up as its salt. Two gases come off, isobutylene and carbon dioxide, so gas handling and foaming are the main plant concerns. The tert-butyl cation can also alkylate the product or form tert-butyl chloride.',
    eq: { r: [['CC(C)(C)OC(=O)NC', 'Boc-protected amine'], ['Cl', 'Hydrogen chloride']], p: [['C[NH3+].[Cl-]', 'Amine hydrochloride'], ['C=C(C)C', 'Isobutylene'], ['O=C=O', 'Carbon dioxide']], cond: 'HCl in IPA or EtOAc, 20–50 °C' },
    mech: [
      { cap: 'HCl protonates the carbonyl oxygen of the carbamate.',
        sp: [{ s: 'CC(C)(C)OC(=O)NC', lp: [6] }, { s: 'Cl[2H]' }], ar: [{ f: ['l', 0, 6], t: ['n', 0, 6, 1, 1] }, { f: ['b', 1, 0, 1], t: ['a', 1, 0] }] },
      { cap: 'The tert-butyl–oxygen bond breaks, giving a stable tert-butyl cation and a carbamic acid.',
        sp: [{ s: 'CC(C)(C)OC(=[O+][2H])NC' }], ar: [{ f: ['b', 0, 1, 4], t: ['b', 0, 4, 5] }, { f: ['b', 0, 5, 6], t: ['a', 0, 6] }] },
      { cap: 'Chloride removes a proton from the tert-butyl cation, giving isobutylene gas. (Chloride can also add to it, giving tert-butyl chloride.)',
        sp: [{ s: 'O=C(O[2H])NC' }, { s: '[2H]C[C+](C)C' }, { s: '[Cl-]', lp: [0] }], ar: [{ f: ['l', 2, 0], t: ['n', 2, 0, 1, 0] }, { f: ['b', 1, 0, 1], t: ['b', 1, 1, 2] }] },
      { cap: 'A proton moves from the OH to the nitrogen of the carbamic acid (through the solvent).',
        sp: [{ s: 'O=C(O[2H])NC', lp: [4] }], ar: [{ f: ['l', 0, 4], t: ['n', 0, 4, 0, 3] }, { f: ['b', 0, 2, 3], t: ['a', 0, 2] }] },
      { cap: 'The oxygen lone pair forms a second C=O bond and the C–N bond breaks: carbon dioxide leaves and the amine is freed.',
        sp: [{ s: 'O=C([O-])[NH2+]C', lp: [2] }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 1, 3], t: ['a', 0, 3] }] },
      { cap: 'Products: the amine (as its hydrochloride salt), carbon dioxide and isobutylene.', sp: [{ s: 'C[NH3+]' }, { s: '[Cl-]' }, { s: 'O=C=O' }, { s: 'C=C(C)C' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the Boc compound in the solvent at 20 °C.', level: 0.45, color: '#f0f1ee', T: 20, stir: true },
      { cap: 'Dose HCl solution. After a short delay, gas starts: carbon dioxide and isobutylene to the vent.', dose: { color: '#eaf4fa', name: 'HCl in IPA' }, gas: { name: 'CO₂ + isobutylene' }, T: 25, level: 0.6 },
      { cap: 'Warm to 40 °C to finish. The amine hydrochloride often crystallises as a white solid.', heat: true, T: 40, gas: { name: 'CO₂ + isobutylene' }, solid: '#ffffff' },
      { cap: 'Hold until gas stops and no Boc compound remains; cool and filter the salt.', T: 15, cool: true, gas: { name: 'CO₂ + isobutylene', slow: true }, solid: '#ffffff' }
    ],
    gas: [{ n: 'Carbon dioxide', s: 'O=C=O', mol: 1, note: 'Foaming and pressure. Keep the vent open.' }, { n: 'Isobutylene', s: 'C=C(C)C', mol: 1, note: 'Flammable gas. Vent to a safe place or a flare/scrubber; part of it stays as tert-butyl chloride.' }],
    care: [
      'Two moles of gas per mole of product. Size the vent for the peak rate and expect foaming.',
      'Isobutylene is flammable; inert the vessel and keep the vent away from ignition sources.',
      'Gas starts after a delay; do not add all the acid at once because the reaction did not seem to start.',
      'tert-Butyl chloride and other tert-butyl species can be genotoxic impurities; show they are purged.'
    ],
    byp: [
      ['tert-Butyl chloride', 'Chloride adding to the tert-butyl cation. Volatile; removed by distillation or purge in isolation.'],
      ['t-Butylated product', 'The cation alkylates electron-rich rings, thiols or indoles. Add a scavenger (anisole, thioanisole, water) if needed.'],
      ['Esters cleaved', 'tert-Butyl esters and some acetals are cleaved too. Choose conditions if they must survive.']
    ],
    moist: { lvl: 'Low', txt: 'Water does not stop the reaction, though very wet conditions slow it and change the salt form. Some processes add water on purpose to trap the cation.' },
    exo: { short: 'Mildly exothermic', txt: 'Heat release is small; the gas rate is the controlling factor.' },
    plant: ['Dose acid at a rate the vent can take; monitor off-gas flow if available.', 'Check the salt for residual tert-butyl chloride.', 'TFA is common in the lab; HCl or methanesulfonic acid are usual in plants because TFA is costly and hard to remove.'],
    links: [['/molecules/reaction-lab/boc-protection-of-amine/', 'Boc protection'], ['/articles/common-mistakes-in-batch-reactions/', 'Common mistakes in batch reactions'], ['/process-safety/', 'Process safety']]
  },
  {
    slug: 'diazotisation-of-aniline', name: 'Diazotisation of an aromatic amine', short: 'Diazotisation', cat: 'Nitrogen chemistry',
    seo: 'Diazotisation: Mechanism, Temperature and Safety',
    desc: 'Aromatic amine to diazonium salt with sodium nitrite and acid: animated mechanism, why it must stay cold, nitrogen gas on decomposition, NOx and excess nitrite.',
    intro: 'Nitrous acid, made from sodium nitrite and acid, turns an aromatic amine into a diazonium salt. Diazonium salts are the gateway to Sandmeyer reactions, azo dyes and many substitutions, but they are unstable: they lose nitrogen gas as they warm, and dry diazonium salts can explode.',
    eq: { r: [['Nc1ccccc1', 'Aromatic amine (aniline shown)'], ['N(=O)[O-].[Na+]', 'Sodium nitrite'], ['Cl', 'HCl (2–3 eq)']], p: [['N#[N+]c1ccccc1.[Cl-]', 'Diazonium chloride'], ['O', 'Water']], cond: 'water, 0–5 °C', note: 'overall: ArNH₂ + NaNO₂ + 2 HCl → ArN₂⁺Cl⁻ + NaCl + 2 H₂O' },
    mech: [
      { cap: 'In acid, nitrous acid is protonated and loses water, giving the nitrosonium ion NO⁺.',
        sp: [{ s: 'O=N[O+]([2H])[2H]', lp: [0] }], ar: [{ f: ['l', 0, 0], t: ['b', 0, 0, 1] }, { f: ['b', 0, 1, 2], t: ['a', 0, 2] }] },
      { cap: 'The amine nitrogen attacks the nitrogen of NO⁺.',
        sp: [{ s: 'Nc1ccccc1', lp: [0] }, { s: 'N#[O+]', flip: true }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'After loss of a proton, the N-nitrosamine rearranges: a proton moves from nitrogen to oxygen (through the solvent) as the N=N bond forms.',
        sp: [{ s: 'O=NN([2H])c1ccccc1', lp: [2] }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 0, 1], t: ['a', 0, 0] }] },
      { cap: 'The diazohydroxide is protonated on oxygen; the nitrogen lone pair pushes water out and the N≡N triple bond forms.',
        sp: [{ s: '[2H][O+]([2H])N=Nc1ccccc1', lp: [4] }], ar: [{ f: ['l', 0, 4], t: ['b', 0, 3, 4] }, { f: ['b', 0, 1, 3], t: ['a', 0, 1] }] },
      { cap: 'Product: the aryl diazonium salt. Warm it, and it loses N₂: that is what the next step uses, and also why it must stay cold until then.', sp: [{ s: 'N#[N+]c1ccccc1' }, { s: '[Cl-]' }, { s: 'O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge water, hydrochloric acid and the amine: the amine hydrochloride forms a white slurry.', level: 0.45, color: '#eef3f6', solid: '#ffffff', T: 25, stir: true },
      { cap: 'Cool to 0–5 °C with brine in the jacket.', cool: true, T: 2 },
      { cap: 'Dose sodium nitrite solution below the surface, keeping below 5 °C. The solid dissolves as the diazonium forms.', dose: { color: '#f0f6fa', name: 'NaNO₂ (aq)' }, glow: true, cool: true, T: 4, level: 0.6, solid: null, color: '#f3efcf' },
      { cap: 'Check for a slight excess of nitrite with starch–iodide paper (it turns blue-black).', cool: true, T: 3 },
      { cap: 'Destroy the excess nitrite with sulfamic acid. This gives nitrogen gas bubbles.', dose: { color: '#ffffff', name: 'Sulfamic acid' }, gas: { name: 'N₂', slow: true }, cool: true, T: 3 },
      { cap: 'Use the cold diazonium solution at once in the next step. Never isolate or dry it.', cool: true, T: 3, color: '#f2ebc4' }
    ],
    gas: [{ n: 'Nitrogen', s: 'N#N', mol: 1, per: 'released when the diazonium decomposes, or in the next step (Sandmeyer, hydrolysis)', note: 'Not toxic, but its volume is large: plan the vent for the next step and for any decomposition.' }],
    care: [
      'Keep the diazonium below 5 °C (or the limit from DSC for your compound). It decomposes as it warms, giving nitrogen gas and heat.',
      'Never isolate dry diazonium salts unless they are a known stable form (e.g. tetrafluoroborate) and the hazard is studied.',
      'Dose nitrite below the surface; added on top, it forms toxic brown NOx gas.',
      'Use enough acid (2.5–3 eq) so free amine does not couple with the diazonium to form triazenes or azo compounds.',
      'Remove excess nitrite before the next step; it causes side reactions and NOx.'
    ],
    byp: [
      ['Phenol', 'From the diazonium reacting with water when warm. Keep cold and use it promptly.'],
      ['Triazenes and azo compounds', 'Free amine coupling with diazonium when acid is too low. Keep excess acid.'],
      ['Nitrosamines', 'From nitrite with secondary amines present (also in other steps). A regulated impurity: control nitrite and its removal.'],
      ['NOx', 'From nitrite in strong acid at the surface. Dose sub-surface and keep a slight excess only.']
    ],
    moist: { lvl: 'None', txt: 'The reaction runs in water. The concern is temperature and stability, not moisture.' },
    exo: { short: 'Exothermic; decomposition much more so', txt: 'Diazotisation releases a moderate amount of heat, removed by cold jacket. The decomposition of the diazonium releases far more and gives nitrogen gas, so thermal stability data (DSC) are needed before scale-up.' },
    plant: ['Interlock nitrite dosing on high temperature.', 'Have a plan to quench the diazonium if the next step is delayed.', 'Continuous flow is increasingly used for diazotisation because it keeps the inventory of diazonium small.'],
    links: [['/articles/nitration-sulfonation-halogenation/', 'Nitration, sulfonation and halogenation'], ['/articles/continuous-flow-chemistry/', 'Continuous flow chemistry'], ['/process-safety/', 'Process safety']]
  },
  {
    slug: 'reductive-amination', name: 'Reductive amination with sodium triacetoxyborohydride', short: 'Reductive amination', cat: 'Nitrogen chemistry',
    seo: 'Reductive Amination: Mechanism, Imine and Hydride',
    desc: 'Ketone and amine to a new amine through an iminium ion reduced by sodium triacetoxyborohydride: animated mechanism, moisture, by-products and plant handling.',
    intro: 'A ketone or aldehyde and an amine form an iminium ion, which a mild hydride reagent reduces to a new amine. Sodium triacetoxyborohydride is selective: it reduces the iminium much faster than the ketone, so everything can be mixed in one pot.',
    eq: { r: [['CC(C)=O', 'Ketone (acetone shown)'], ['CN', 'Amine (methylamine shown)'], ['[Na+].[2H][B-](OC(C)=O)(OC(C)=O)OC(C)=O', 'NaBH(OAc)₃']], p: [['CC(C)NC', 'Secondary amine']], cond: 'THF or EtOAc, AcOH, 20–25 °C', note: 'boron and acetate salts not shown' },
    mech: [
      { cap: 'The amine attacks the carbonyl carbon; the C=O π bond moves onto oxygen.',
        sp: [{ s: 'CN', lp: [1] }, { s: 'CC(C)=O' }], ar: [{ f: ['l', 0, 1], t: ['n', 0, 1, 1, 1] }, { f: ['b', 1, 1, 3], t: ['a', 1, 3] }] },
      { cap: 'After proton transfers, the OH is protonated by acetic acid; the nitrogen lone pair pushes water out, forming an iminium ion.',
        sp: [{ s: 'CC(C)([O+]([2H])[2H])NC', lp: [6] }], ar: [{ f: ['l', 0, 6], t: ['b', 0, 1, 6] }, { f: ['b', 0, 1, 3], t: ['a', 0, 3] }] },
      { cap: 'A B–H bond of the triacetoxyborohydride delivers hydride to the iminium carbon.',
        sp: [{ s: 'CC(C)=[NH+]C' }, { s: '[2H][B-](OC(C)=O)(OC(C)=O)OC(C)=O' }], ar: [{ f: ['b', 1, 0, 1], t: ['n', 1, 0, 0, 1] }, { f: ['b', 0, 1, 3], t: ['a', 0, 3] }] },
      { cap: 'Product: the new secondary amine.', sp: [{ s: 'CC(C)NC' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the ketone, the amine and acetic acid in the solvent; stir for the imine to form.', level: 0.45, color: '#eef1f3', T: 22, stir: true, n2: true },
      { cap: 'Add sodium triacetoxyborohydride in portions. Mild exotherm; a little gas.', dose: { color: '#ffffff', name: 'NaBH(OAc)₃' }, glow: true, T: 26, solid: '#ffffff', gas: { name: 'H₂ (traces)', slow: true } },
      { cap: 'Stir at room temperature until the ketone or imine is consumed.', T: 23, solid: '#ffffff' },
      { cap: 'Quench with aqueous sodium bicarbonate: carbon dioxide foams.', dose: { color: '#dceef8', name: 'aq. NaHCO₃' }, gas: { name: 'CO₂' }, solid: null, level: 0.75, T: 20 },
      { cap: 'Separate: the amine in the organic layer (raise the pH first if it is protonated).', layers: ['#eef1f3', '#d8ecf6'], T: 20 }
    ],
    gas: [], gasNote: 'Small H₂ from the hydride; CO₂ in the bicarbonate quench',
    care: [
      'The reagent reacts with water and alcohols; use dry, non-alcoholic solvent.',
      'Portion-wise solid addition can give delayed exotherms; add in measured portions and watch the temperature.',
      'The bicarbonate quench neutralises acetic acid and gives a lot of CO₂; add slowly.',
      'Sodium cyanoborohydride, the older reagent, gives HCN with acid; triacetoxyborohydride avoids that.'
    ],
    byp: [
      ['Alcohol from the ketone', 'Direct reduction of the ketone when the iminium forms slowly. Let the imine form first; keep the reagent mild.'],
      ['Over-alkylation (tertiary amine)', 'The product amine reacts again with the carbonyl. Use excess of the starting amine.'],
      ['Acetylated amine', 'Acetate transfer from the reagent at long holds. Avoid large excess and long holds.']
    ],
    moist: { lvl: 'Medium', txt: 'Water slowly destroys the hydride and pushes the imine back to ketone and amine. Use dry solvent; a drying agent or molecular sieves help when imine formation is slow.' },
    exo: { short: 'Mildly exothermic', txt: 'Modest heat release on reagent addition and in the bicarbonate quench.' },
    plant: ['Check the imine formation by HPLC before adding the reagent.', 'Triacetoxyborohydride is a moisture-sensitive solid: weigh quickly and keep containers closed.', 'Catalytic hydrogenation is the usual large-scale alternative when the molecule allows.'],
    links: [['/molecules/reaction-lab/sodium-borohydride-reduction/', 'Sodium borohydride reduction'], ['/articles/hydrogenation-and-reduction/', 'Hydrogenation and reduction'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'aromatic-bromination', name: 'Aromatic bromination with bromine and iron(III) bromide', short: 'Aromatic bromination', cat: 'Aromatic substitution',
    seo: 'Aromatic Bromination: Mechanism, HBr and Bromine',
    desc: 'Electrophilic bromination of an arene with Br₂ and FeBr₃: animated mechanism, HBr gas per kg, bromine handling, moisture sensitivity and isomer control.',
    intro: 'Iron(III) bromide polarises bromine so that one end becomes strongly electrophilic. The aromatic ring attacks it, and loss of a proton restores the aromatic ring. One mole of hydrogen bromide gas forms for every bromine put on the ring.',
    eq: { r: [['C1=CC=CC=C1', 'Arene (benzene shown)'], ['BrBr', 'Bromine']], p: [['Brc1ccccc1', 'Aryl bromide'], ['Br', 'Hydrogen bromide']], cond: 'FeBr₃ (cat.), 20–50 °C' },
    mech: [
      { cap: 'Bromine coordinates to iron(III) bromide. A π bond of the ring attacks the outer bromine, and the Br–Br bond breaks towards iron.',
        sp: [{ s: 'C1=CC=CC=C1' }, { s: 'BrBr' }, { s: 'Br[Fe](Br)Br' }], ar: [{ f: ['b', 0, 0, 1], t: ['n', 0, 0, 1, 0], side: S3 }, { f: ['b', 1, 0, 1], t: ['n', 1, 1, 2, 1] }] },
      { cap: 'The σ-complex loses its proton to FeBr₄⁻, the ring becomes aromatic again, and HBr and FeBr₃ are released.',
        sp: [{ s: 'BrC1([2H])C=CC=C[CH+]1' }, { s: 'Br[Fe-](Br)(Br)Br', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 2], side: S5 }, { f: ['b', 0, 1, 2], t: ['b', 0, 1, 7] }] },
      { cap: 'Products: aryl bromide and HBr gas; the catalyst is regenerated.', sp: [{ s: 'Brc1ccccc1' }, { s: 'Br' }, { s: 'Br[Fe](Br)Br' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the arene (and solvent) with a little iron powder or FeBr₃ under nitrogen.', level: 0.45, color: '#eceae4', solid: '#5a4a3a', T: 20, n2: true, stir: true },
      { cap: 'Dose bromine slowly. The red-brown colour fades as it reacts; HBr gas goes to the scrubber.', dose: { color: '#9b2c13', name: 'Bromine' }, gas: { name: 'HBr' }, color: '#d9a07a', glow: true, T: 30, level: 0.55 },
      { cap: 'Hold at 40–50 °C until the arene is used up and the gas slows.', T: 45, heat: true, gas: { name: 'HBr', slow: true }, color: '#cf8f63' },
      { cap: 'Quench excess bromine with sodium bisulfite solution: the red colour disappears.', dose: { color: '#e6f3fb', name: 'aq. NaHSO₃' }, color: '#efe6d3', level: 0.75, T: 25, solid: null },
      { cap: 'Separate: aryl bromide in the organic layer.', layers: ['#efe6d3', '#dceef8'], T: 25 }
    ],
    gas: [{ n: 'Hydrogen bromide', s: 'Br', mol: 1, note: 'Corrosive fumes. Scrub in water then caustic; HBr can be recovered as hydrobromic acid.' }],
    care: [
      'Bromine is very toxic and corrosive, with a high vapour pressure. Use closed transfer, and have thiosulfate or bisulfite ready for spills.',
      'HBr comes off with the reaction; size the scrubber for the dosing rate.',
      'Keep water out: it deactivates the Lewis acid catalyst and makes the mixture corrosive.',
      'Bromine dosed into a stalled reaction accumulates (the colour stays red). Stop dosing until it fades.'
    ],
    byp: [
      ['Dibromo products', 'Excess bromine or long holds. Use close to 1.0 eq and stop at the right conversion.'],
      ['Isomers', 'Set by the substituent; ortho/para ratio shifts with temperature and solvent.'],
      ['Benzylic bromination', 'With alkyl arenes under light or radical conditions. Keep in the dark, without radical initiators.']
    ],
    moist: { lvl: 'High', txt: 'Water deactivates FeBr₃ (and AlBr₃), slowing the reaction and letting bromine build up. It also makes HBr much more corrosive to equipment.' },
    exo: { short: 'Moderately exothermic', txt: 'Heat release is moderate; the bromine dosing rate controls both heat and HBr gas.' },
    plant: ['Glass-lined or PTFE-lined equipment; bromine and HBr attack most metals.', 'Watch the colour as a simple accumulation check.', 'N-Bromosuccinimide is easier to handle for small batches but costs more.'],
    links: [['/articles/nitration-sulfonation-halogenation/', 'Nitration, sulfonation and halogenation'], ['/molecules/reaction-lab/friedel-crafts-acylation/', 'Friedel–Crafts acylation'], ['/process-safety/', 'Process safety']]
  },
  {
    slug: 'ester-hydrolysis-saponification', name: 'Ester hydrolysis with sodium hydroxide (saponification)', short: 'Saponification', cat: 'Acylation and activation',
    seo: 'Saponification: Ester Hydrolysis Mechanism',
    desc: 'Base hydrolysis of an ester with sodium hydroxide: animated mechanism, why it goes to completion, acidification heat, by-products and plant tips.',
    intro: 'Hydroxide attacks the ester carbonyl and pushes out the alkoxide. Unlike acid hydrolysis, the last step is a proton transfer that makes the carboxylate salt, which cannot react back, so the reaction goes to completion. The free acid is recovered by acidifying.',
    eq: { r: [['CC(=O)OCC', 'Ester (ethyl acetate shown)'], ['[Na+].[OH-]', 'Sodium hydroxide']], p: [['CC(=O)[O-].[Na+]', 'Sodium carboxylate'], ['CCO', 'Alcohol']], cond: 'water/MeOH, 25–60 °C; then acidify' },
    mech: [
      { cap: 'Hydroxide attacks the ester carbonyl carbon; the C=O π bond moves onto oxygen.',
        sp: [{ s: '[OH-]', lp: [0] }, { s: 'CC(=O)OCC' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The intermediate collapses: C=O re-forms and the alkoxide leaves.',
        sp: [{ s: 'CC([O-])(O)OCC', lp: [2] }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 1, 4], t: ['a', 0, 4] }] },
      { cap: 'The alkoxide takes the acid proton at once. This step is strongly downhill, which is why base hydrolysis goes to completion.',
        sp: [{ s: 'CC(=O)O[2H]' }, { s: 'CC[O-]', lp: [2] }], ar: [{ f: ['l', 1, 2], t: ['n', 1, 2, 0, 4] }, { f: ['b', 0, 3, 4], t: ['a', 0, 3] }] },
      { cap: 'Products: the carboxylate salt and the alcohol. Acidify later to get the free carboxylic acid.', sp: [{ s: 'CC(=O)[O-]' }, { s: 'CCO' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the ester with water and methanol (to dissolve it).', level: 0.45, color: '#eef2f4', T: 25, stir: true },
      { cap: 'Dose sodium hydroxide solution. The mixture warms; two phases become one as the salt forms.', dose: { color: '#f2f7fa', name: 'NaOH (aq)' }, glow: true, T: 40, level: 0.6 },
      { cap: 'Heat to 50–60 °C and hold until no ester is left.', heat: true, T: 58 },
      { cap: 'Distil off methanol and the released alcohol.', distil: true, heat: true, T: 70, level: 0.5 },
      { cap: 'Cool and acidify with hydrochloric acid to pH 2–3. A solid carboxylic acid crystallises here (acetic acid itself would stay dissolved); this neutralisation is exothermic.', cool: true, dose: { color: '#e6f3fb', name: 'HCl (aq)' }, glow: true, T: 20, solid: '#ffffff', level: 0.62 },
      { cap: 'Filter and wash the acid.', T: 15, solid: '#ffffff' }
    ],
    gas: [], gasNote: 'None',
    care: [
      'Sodium hydroxide addition and acidification are both exothermic; dose with cooling.',
      'Strong base can epimerise stereocentres next to the carbonyl and hydrolyse other esters or amides. Use the mildest conditions that work (LiOH, lower temperature).',
      'Acidify slowly at the end to grow filterable crystals and avoid oiling out.',
      'If carbonate is present in the caustic, acidification gives CO₂ foam.'
    ],
    byp: [
      ['Epimer or racemate', 'Base and heat at a stereocentre α to the carbonyl. Keep temperature and time low; check chiral purity.'],
      ['Amide hydrolysis', 'Other groups hydrolysing at high temperature. Monitor and stop at full ester conversion.'],
      ['Salt in product', 'NaCl from acidification trapped in the crystals. Wash well; check ash or chloride.']
    ],
    moist: { lvl: 'None', txt: 'The reaction runs in water; moisture is not a concern.' },
    exo: { short: 'Moderately exothermic', txt: 'Hydrolysis releases moderate heat; neutralising excess base and the carboxylate with acid adds more.' },
    plant: ['Check that the pH of the final slurry is stable before filtering.', 'Recover the methanol: it is often most of the solvent cost.', 'Use LiOH in THF/water for sensitive substrates.'],
    links: [['/molecules/reaction-lab/fischer-esterification/', 'Fischer esterification (the reverse in acid)'], ['/process-modelling/solubility-curve-crystallisation/', 'Solubility and crystallisation'], ['/articles/improve-reaction-conversion-and-yield/', 'Conversion and yield']]
  },
  {
    slug: 'epoxide-ring-opening-with-amine', name: 'Epoxide ring opening with an amine', short: 'Epoxide opening', cat: 'Substitution and alkylation',
    seo: 'Epoxide Opening with Amines: Mechanism, Exotherm',
    desc: 'Amine opening an epoxide (SN2 at the less hindered carbon) to a β-amino alcohol: animated mechanism, strong exotherm, accumulation risk and bis-alkylation.',
    intro: 'Epoxides are strained three-membered rings, so even a neutral amine can open them. The amine attacks the less hindered carbon from the back side, giving a β-amino alcohol, a structure found in many drugs such as beta-blockers. The ring strain makes the reaction strongly exothermic.',
    eq: { r: [['CC1CO1', 'Epoxide (propylene oxide shown)'], ['CC(C)N', 'Amine (isopropylamine)']], p: [['CC(C)NCC(C)O', 'β-Amino alcohol']], cond: 'IPA, 30–40 °C, closed reactor' },
    mech: [
      { cap: 'The amine nitrogen attacks the less hindered CH₂ carbon of the epoxide from the back side; the C–O bond breaks and the ring opens.',
        sp: [{ s: 'CC(C)N', lp: [3] }, { s: 'CC1CO1' }], ar: [{ f: ['l', 0, 3], t: ['n', 0, 3, 1, 2] }, { f: ['b', 1, 2, 3], t: ['a', 1, 3] }] },
      { cap: 'A proton moves from nitrogen to oxygen (through the solvent), giving the neutral amino alcohol.',
        sp: [{ s: 'CC(C)[NH+]([2H])CC(C)[O-]', lp: [8] }], ar: [{ f: ['l', 0, 8], t: ['n', 0, 8, 0, 4] }, { f: ['b', 0, 3, 4], t: ['a', 0, 3] }] },
      { cap: 'Product: the β-amino alcohol. It is still an amine and can react with a second epoxide, which is why excess amine is used.', sp: [{ s: 'CC(C)NCC(C)O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the amine (in excess) and the solvent into a closed, pressure-rated reactor with a cold reflux condenser; both isopropylamine and propylene oxide boil near 33 °C.', level: 0.45, color: '#eef1f3', T: 25, stir: true, n2: true },
      { cap: 'Dose the epoxide slowly at 30–40 °C under slight pressure. The heat of ring opening shows at once; set the rate by the cooling.', dose: { color: '#f8f8f8', name: 'Epoxide' }, glow: true, cool: true, T: 38, level: 0.58 },
      { cap: 'Hold until the epoxide is gone. Check it is really consumed before heating further.', T: 40 },
      { cap: 'Vent to atmospheric pressure and distil off the excess amine and solvent for recovery.', distil: true, heat: true, T: 70, level: 0.4 }
    ],
    gas: [], gasNote: 'None (volatile epoxide vapour)',
    care: [
      'Ring opening releases about 20–25 kcal per mole. If the epoxide is dosed faster than it reacts, it accumulates and can then react all at once.',
      'Low-boiling epoxides (ethylene oxide, propylene oxide) are flammable and toxic; dose from closed systems with a condenser on the vent.',
      'Epoxides are alkylating agents and potential genotoxic impurities; show they are purged.',
      'Never heat a mixture containing much unreacted epoxide.'
    ],
    byp: [
      ['Bis-alkylated amine', 'The product amine reacts with a second epoxide. Use a large excess of amine and dose the epoxide into the amine.'],
      ['Regio-isomer', 'Attack at the more substituted carbon, favoured by acids or Lewis acids. Avoid acids if the less hindered product is wanted.'],
      ['Diol', 'From water opening the epoxide. Keep water low.']
    ],
    moist: { lvl: 'Low', txt: 'Water slowly opens epoxides to diols, a by-product, but it does not destroy the reagents. Moderate water is often tolerated; it can even speed up the reaction.' },
    exo: { dH: -24, txt: 'Around 24 kcal per mole of epoxide opened, released quickly at reaction temperature. The adiabatic rise of a neat batch can exceed 100 °C, so dosing control is required.' },
    plant: ['Calorimetry to confirm the epoxide reacts as it is dosed (no accumulation).', 'Recover the excess amine by distillation and recycle it.', 'Keep a dump or quench option for the epoxide feed.'],
    links: [['/molecules/reaction-lab/williamson-ether-synthesis/', 'Williamson ether (another SN2)'], ['/process-modelling/semi-batch-dosing-simulator/', 'Semi-batch dosing simulator'], ['/training/modules/runaway-reactions-safe-dosing/', 'Runaway reactions and safe dosing']]
  },
  {
    slug: 'mesylation-of-alcohol', name: 'Mesylation of an alcohol', short: 'Mesylation', cat: 'Substitution and alkylation',
    seo: 'Mesylation with MsCl and Triethylamine: Mechanism',
    desc: 'Alcohol to mesylate with methanesulfonyl chloride and triethylamine: animated mechanism, exotherm, moisture sensitivity and genotoxic mesylate esters.',
    intro: 'Methanesulfonyl chloride turns an alcohol into a mesylate, a very good leaving group for the next substitution. Triethylamine takes up the HCl. It is quick and exothermic, and alkyl mesylates are genotoxic, so their removal matters as much as their formation.',
    eq: { r: [['CCO', 'Alcohol (ethanol shown)'], ['CS(=O)(=O)Cl', 'Methanesulfonyl chloride'], ['CCN(CC)CC', 'Triethylamine']], p: [['CCOS(C)(=O)=O', 'Alkyl mesylate'], ['CC[NH+](CC)CC.[Cl-]', 'Triethylamine hydrochloride']], cond: 'DCM or toluene, 0–5 °C' },
    mech: [
      { cap: 'The alcohol oxygen attacks sulfur and chloride leaves. (With triethylamine, much of the reaction actually goes through a sulfene, CH₂=SO₂, formed first from MsCl; the product is the same.)',
        sp: [{ s: 'CCO', lp: [2] }, { s: 'CS(=O)(=O)Cl' }], ar: [{ f: ['l', 0, 2], t: ['n', 0, 2, 1, 1] }, { f: ['b', 1, 1, 4], t: ['a', 1, 4] }] },
      { cap: 'Triethylamine removes the proton from the oxygen.',
        sp: [{ s: 'CC[O+]([2H])S(C)(=O)=O' }, { s: 'CCN(CC)CC', lp: [2] }], ar: [{ f: ['l', 1, 2], t: ['n', 1, 2, 0, 3] }, { f: ['b', 0, 2, 3], t: ['a', 0, 2] }] },
      { cap: 'Products: the mesylate and triethylamine hydrochloride.', sp: [{ s: 'CCOS(C)(=O)=O' }, { s: 'CC[NH+](CC)CC' }, { s: '[Cl-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Under nitrogen, charge the alcohol and triethylamine in dry solvent; cool to 0 °C.', level: 0.45, color: '#eef1f3', T: 1, cool: true, n2: true, stir: true },
      { cap: 'Dose methanesulfonyl chloride slowly. Each drop reacts; the temperature rises and the hydrochloride salt comes out.', dose: { color: '#f4f1e2', name: 'MsCl' }, glow: true, cool: true, T: 6, solid: '#ffffff', level: 0.55 },
      { cap: 'Stir at 0–5 °C until the alcohol is consumed.', cool: true, T: 3, solid: '#ffffff' },
      { cap: 'Add cold water to dissolve the salt; separate the layers. Use the mesylate solution directly in the next step if possible.', dose: { color: '#dceef8', name: 'Water' }, solid: null, level: 0.78, T: 8 },
      { cap: 'Mesylate in the organic layer; amine hydrochloride in the water.', layers: ['#eef1f3', '#d8ecf6'], T: 10 }
    ],
    gas: [], gasNote: 'None with base present',
    care: [
      'Fast and exothermic; control by dosing rate and keep at 0–5 °C.',
      'Methanesulfonyl chloride is corrosive and toxic and reacts with water to give HCl. Handle in closed systems.',
      'Alkyl mesylates (methyl, ethyl, isopropyl mesylate) are genotoxic. Avoid alcohol solvents with methanesulfonic acid or MsCl in any step, and show residual levels are controlled.',
      'Mesylates of activated alcohols can be unstable; use them promptly and do not heat the crude.'
    ],
    byp: [
      ['Alkyl chloride', 'Chloride displaces the mesylate when warm or held long. Keep cold and work up promptly.'],
      ['Elimination (alkene)', 'Base and heat on secondary mesylates. Keep cold; use the mesylate straight away.'],
      ['Methanesulfonic acid', 'From hydrolysis of MsCl by water. Dry solvent and base.']
    ],
    moist: { lvl: 'High', txt: 'Water consumes methanesulfonyl chloride, giving methanesulfonic acid and HCl, which then use up base. Dry solvent and triethylamine (Karl Fischer) are needed.' },
    exo: { short: 'Strongly exothermic', txt: 'Sulfonylation plus neutralisation of HCl by the base release significant heat. Run dosing-controlled at low temperature.' },
    plant: ['Check water content of solvent and base before charging.', 'Specify limits for alkyl mesylates in the API if any alcohol meets MsCl or methanesulfonic acid.', 'Tosyl chloride gives crystalline tosylates that are easier to isolate when isolation is needed.'],
    links: [['/molecules/reaction-lab/williamson-ether-synthesis/', 'Williamson ether synthesis'], ['/articles/common-mistakes-in-batch-reactions/', 'Common mistakes in batch reactions'], ['/molecules/reaction/', 'Reaction Builder']]
  }
];
