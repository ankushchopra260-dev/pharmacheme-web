/* Reaction lab, fourth set. Same format as reactions.js. */
const H3O = '[2H][O+]([2H])[2H]';
module.exports = [
  {
    slug: 'ketal-protection-ethylene-glycol', name: 'Ketal protection with ethylene glycol', short: 'Ketal protection', cat: 'Protecting groups',
    seo: 'Ketal Protection with Ethylene Glycol: Mechanism',
    desc: 'Protecting a ketone as a 1,3-dioxolane with ethylene glycol and acid: animated mechanism, Dean–Stark water removal, moisture and by-product control.',
    intro: 'A ketone and ethylene glycol form a cyclic ketal (a 1,3-dioxolane) with an acid catalyst. The ketal survives bases, hydrides and Grignard reagents, and comes off again with aqueous acid. Every step is reversible, so water must be removed to reach full conversion.',
    eq: { r: [['CC(C)=O', 'Ketone (acetone shown)'], ['OCCO', 'Ethylene glycol']], p: [['CC1(C)OCCO1', '1,3-Dioxolane (ketal)'], ['O', 'Water']], cond: 'p-TsOH (cat.), toluene, reflux' },
    mech: [
      { cap: 'The acid catalyst protonates the carbonyl oxygen.',
        sp: [{ s: 'CC(C)=O', lp: [3] }, { s: H3O }], ar: [{ f: ['l', 0, 3], t: ['n', 0, 3, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'One OH of ethylene glycol attacks the activated carbonyl carbon.',
        sp: [{ s: 'CC(C)=[O+][2H]' }, { s: 'OCCO', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 1] }, { f: ['b', 0, 1, 3], t: ['a', 0, 3] }] },
      { cap: 'After proton transfers (the hemiketal), the remaining OH is protonated. The ether oxygen lone pair pushes it out as water, forming an oxocarbenium ion.',
        sp: [{ s: 'CC(C)(OCCO)[O+]([2H])[2H]', lp: [3] }], ar: [{ f: ['l', 0, 3], t: ['b', 0, 1, 3] }, { f: ['b', 0, 1, 7], t: ['a', 0, 7] }] },
      { cap: 'The second OH of the glycol closes the five-membered ring by attacking the same carbon.',
        sp: [{ s: 'CC(C)=[O+]CCO', lp: [6] }], ar: [{ f: ['l', 0, 6], t: ['n', 0, 6, 0, 1] }, { f: ['b', 0, 1, 3], t: ['a', 0, 3] }] },
      { cap: 'Water takes the proton and the neutral ketal forms; the acid catalyst is regenerated.',
        sp: [{ s: 'CC1(C)OCC[O+]1[2H]' }, { s: 'O', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 7] }, { f: ['b', 0, 6, 7], t: ['a', 0, 6] }] },
      { cap: 'Products: the ketal and water. Removing the water (Dean–Stark trap, orthoformate or sieves) drives the equilibrium to the ketal.', sp: [{ s: 'CC1(C)OCCO1' }, { s: 'O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the ketone, ethylene glycol (1.5–3 eq), p-toluenesulfonic acid and toluene.', level: 0.45, color: '#eef0e6', T: 25, stir: true },
      { cap: 'Heat to reflux. Water distils with toluene and separates in the Dean–Stark trap.', heat: true, distil: true, T: 110 },
      { cap: 'Hold until no more water collects and the ketone is consumed.', heat: true, distil: true, T: 112 },
      { cap: 'Cool and neutralise the acid with sodium bicarbonate solution before any concentration.', dose: { color: '#e4f2fb', name: 'aq. NaHCO₃' }, gas: { name: 'CO₂', slow: true }, T: 25, level: 0.7 },
      { cap: 'Separate: the ketal in the toluene layer.', layers: ['#eef0e6', '#d8ecf6'], T: 25 }
    ],
    gas: [], gasNote: 'None; a little CO₂ in the bicarbonate wash',
    care: [
      'The reaction is an equilibrium; conversion depends on water removal, not on time alone.',
      'Neutralise the acid before concentrating or distilling, or the ketal hydrolyses back with any water present.',
      'Ethylene glycol is toxic if swallowed; its excess goes to the aqueous waste.',
      'Acid-sensitive groups elsewhere in the molecule may not survive; use the least acid that works.'
    ],
    byp: [
      ['Unreacted ketone', 'Water not removed. Check the trap, use more glycol or a water scavenger such as trimethyl orthoformate.'],
      ['Glycol oligomers / mixed acetals', 'Excess glycol at long reflux. Use moderate excess and stop at conversion.'],
      ['Aldol products', 'Acid-catalysed self-condensation of the ketone at high temperature. Keep the catalyst low.']
    ],
    moist: { lvl: 'Medium', txt: 'Water is a product and hydrolyses the ketal back in acid. Start dry and remove water continuously; once neutralised, the ketal is stable to water.' },
    exo: { short: 'Close to thermoneutral', txt: 'Ketal formation releases little heat; energy goes into the reflux that removes water.' },
    plant: ['Measure the water collected against theory as a progress check.', 'Remove the deprotection acid completely after the protected steps, or the ketal falls off early.', 'Glass-lined equipment for the acid catalyst at reflux.'],
    links: [['/molecules/reaction-lab/fischer-esterification/', 'Fischer esterification (also a water-removal equilibrium)'], ['/molecules/reaction-lab/grignard-addition-to-ketone/', 'Grignard addition (needs the ketone protected elsewhere)'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'claisen-condensation', name: 'Claisen condensation of an ester', short: 'Claisen condensation', cat: 'Carbon–carbon bond formation',
    seo: 'Claisen Condensation: Mechanism and Base Control',
    desc: 'Claisen condensation of an ester with sodium ethoxide to a β-keto ester: animated enolate mechanism, why a full equivalent of base is needed, and work-up.',
    intro: 'An alkoxide base forms the enolate of an ester, which attacks a second ester molecule. The intermediate pushes out alkoxide, giving a β-keto ester. The product is more acidic than the alcohol, so the base removes its proton at once: this last step drives the reaction, and it is why a full equivalent of base is needed.',
    eq: { r: [['CC(=O)OCC', 'Ester (ethyl acetate, 2 molecules)'], ['CC[O-].[Na+]', 'Sodium ethoxide (1 eq)']], p: [['CC(=O)CC(=O)OCC', 'β-Keto ester (ethyl acetoacetate)'], ['CCO', 'Ethanol']], cond: 'ethanol or toluene, 60–80 °C; then acid', note: '2 esters give 1 β-keto ester + 1 ethanol' },
    mech: [
      { cap: 'Ethoxide removes a proton from the carbon next to the ester carbonyl, giving an enolate.',
        sp: [{ s: 'CC[O-]', lp: [2] }, { s: '[2H]CC(=O)OCC' }], ar: [{ f: ['l', 0, 2], t: ['n', 0, 2, 1, 0] }, { f: ['b', 1, 0, 1], t: ['b', 1, 1, 2] }, { f: ['b', 1, 2, 3], t: ['a', 1, 3] }] },
      { cap: 'The enolate carbon attacks the carbonyl carbon of a second ester molecule.',
        sp: [{ s: 'C=C([O-])OCC', lp: [2] }, { s: 'CC(=O)OCC' }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 0, 1], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The intermediate collapses and ethoxide leaves, giving the β-keto ester.',
        sp: [{ s: 'CC([O-])(OCC)CC(=O)OCC', lp: [2] }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 1, 3], t: ['a', 0, 3] }] },
      { cap: 'Ethoxide removes the very acidic proton between the two carbonyls. This irreversible step pulls the whole equilibrium to the product.',
        sp: [{ s: 'CC(=O)C([2H])C(=O)OCC' }, { s: 'CC[O-]', lp: [2] }], ar: [{ f: ['l', 1, 2], t: ['n', 1, 2, 0, 4] }, { f: ['b', 0, 3, 4], t: ['b', 0, 1, 3] }, { f: ['b', 0, 1, 2], t: ['a', 0, 2] }] },
      { cap: 'After acidic work-up: the β-keto ester and ethanol.', sp: [{ s: 'CC(=O)CC(=O)OCC' }, { s: 'CCO' }], ar: [] }
    ],
    lab: [
      { cap: 'Under nitrogen, charge dry ethanol (or toluene) and sodium ethoxide.', level: 0.4, color: '#f0eee6', T: 25, n2: true, stir: true },
      { cap: 'Dose the ester and heat to 70–80 °C. The sodium enolate of the product forms, often as a thick slurry.', dose: { color: '#f7f7f2', name: 'Ester' }, heat: true, T: 78, solid: '#f6efd6', level: 0.55, color: '#f1e3b8' },
      { cap: 'Distil off ethanol to push the equilibrium.', distil: true, heat: true, T: 85, solid: '#f6efd6' },
      { cap: 'Cool and acidify with dilute acid or acetic acid to free the β-keto ester.', cool: true, dose: { color: '#e6f3fb', name: 'dil. acid' }, glow: true, T: 15, solid: null, level: 0.7 },
      { cap: 'Separate and wash: the product in the organic layer.', layers: ['#f1e8c8', '#dceef8'], T: 20 }
    ],
    gas: [], gasNote: 'None',
    care: [
      'Use a full equivalent of base: only the deprotonated product drives the reaction to completion.',
      'Match the alkoxide to the ester (ethoxide with ethyl esters), or transesterification gives mixed esters.',
      'Sodium ethoxide is corrosive and moisture-sensitive; solid alkoxides can self-heat in moist air.',
      'β-Keto esters decarboxylate when hydrolysed and heated; keep the work-up mild.'
    ],
    byp: [
      ['Carboxylic acid (saponification)', 'Water turns ethoxide into hydroxide, which hydrolyses the ester. Keep everything dry.'],
      ['Mixed esters', 'Wrong alkoxide or alcohol solvent. Use the alkoxide that matches the ester.'],
      ['Self- and crossed-condensation mixtures', 'In crossed Claisen reactions, use one ester without α-H, or pre-form the enolate.']
    ],
    moist: { lvl: 'High', txt: 'Water converts the alkoxide to hydroxide, which saponifies the ester instead of forming the enolate. Use dry solvent, dry ester and fresh alkoxide.' },
    exo: { short: 'Moderately exothermic', txt: 'Deprotonation and condensation release moderate heat; the acid work-up of the sodium salt releases more.' },
    plant: ['Assay the alkoxide before use; it degrades with moisture.', 'Plan agitation for the thick enolate slurry.', 'Recover ethanol from the distillate.'],
    links: [['/molecules/reaction-lab/aldol-condensation/', 'Aldol condensation'], ['/molecules/reaction-lab/ester-hydrolysis-saponification/', 'Saponification (the side reaction)'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'chlorination-with-phosphorus-oxychloride', name: 'Chlorination of a pyridone with phosphorus oxychloride', short: 'POCl₃ chlorination', cat: 'Aromatic substitution',
    seo: 'POCl₃ Chlorination of Pyridones: Mechanism, Quench',
    desc: 'Hydroxy-heteroarene (2-pyridone) to chloro-heteroarene with POCl₃: animated mechanism, HCl off-gas, very high moisture sensitivity and the hazardous quench.',
    intro: 'Phosphorus oxychloride turns the C=O of a pyridone (or the OH of a hydroxypyrimidine or quinolinone) into a C–Cl bond. The oxygen is first activated on phosphorus, chloride adds to the ring carbon, and the phosphate group leaves as the ring becomes aromatic. It is one of the most used steps in heterocyclic API and agrochemical synthesis, and its quench is a well-known hazard.',
    eq: { r: [['O=C1C=CC=CN1', '2-Pyridone'], ['O=P(Cl)(Cl)Cl', 'POCl₃']], p: [['Clc1ccccn1', '2-Chloropyridine'], ['OP(=O)(Cl)Cl', 'Dichlorophosphoric acid']], cond: 'neat POCl₃ or toluene, 90–110 °C' },
    mech: [
      { cap: 'The pyridone oxygen attacks phosphorus and a chloride leaves.',
        sp: [{ s: 'O=C1C=CC=CN1', lp: [0] }, { s: 'O=P(Cl)(Cl)Cl' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'Chloride adds to the ring carbon next to nitrogen; the C=N⁺ π electrons move onto nitrogen.',
        sp: [{ s: 'ClP(Cl)(=O)OC1=[NH+]C=CC=C1' }, { s: '[Cl-]', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 5] }, { f: ['b', 0, 5, 6], t: ['a', 0, 6] }] },
      { cap: 'The nitrogen lone pair pushes back and the dichlorophosphate group leaves. Loss of the N–H proton gives the aromatic chloropyridine and HCl.',
        sp: [{ s: 'ClP(Cl)(=O)OC1(Cl)NC=CC=C1', lp: [7] }], ar: [{ f: ['l', 0, 7], t: ['b', 0, 5, 7] }, { f: ['b', 0, 4, 5], t: ['a', 0, 4] }] },
      { cap: 'Products: the chloro-heteroarene and dichlorophosphoric acid (with HCl).', sp: [{ s: 'Clc1ccccn1' }, { s: 'OP(=O)(Cl)Cl' }], ar: [] }
    ],
    lab: [
      { cap: 'Dry reactor under nitrogen. Charge the pyridone and POCl₃ (often 3–5 eq, as solvent).', level: 0.45, color: '#efeee6', solid: '#ffffff', T: 25, n2: true, stir: true },
      { cap: 'Heat to 100–105 °C. The solid dissolves and HCl comes off to the scrubber.', heat: true, T: 104, gas: { name: 'HCl' }, solid: null, color: '#ead9a3' },
      { cap: 'Hold until conversion is complete, then distil off most of the excess POCl₃ under vacuum.', heat: true, distil: true, T: 80, level: 0.35, color: '#d9b974' },
      { cap: 'This flask is now the quench vessel with ice water (or buffered water); the residue, diluted with solvent, is run in slowly. Very exothermic, with HCl; watch for delayed heat.', dose: { color: '#d9b974', name: 'Reaction mass' }, cool: true, glow: true, gas: { name: 'HCl' }, T: 30, level: 0.8, color: '#e8dcc0' },
      { cap: 'Neutralise, then extract the chloro-heteroarene.', layers: ['#efe6cf', '#dceef8'], T: 25 }
    ],
    gas: [{ n: 'Hydrogen chloride', s: 'Cl', mol: 1, note: 'Released during the reaction; scrub in water then caustic. The quench releases much more acid, mostly dissolved.' }],
    care: [
      'POCl₃ reacts violently with water, releasing heat and HCl. Keep everything dry until the planned quench.',
      'The quench of POCl₃ residues can be delayed: phosphorodichloridic acid intermediates hydrolyse slowly and then fast. Distil off excess POCl₃ first, quench slowly into a well-stirred aqueous phase, and confirm the heat has finished.',
      'Never add water to the reaction mass; always add the mass to water (reverse quench).',
      'POCl₃ is very toxic by inhalation; use closed handling and a scrubbed vent.'
    ],
    byp: [
      ['Unreacted pyridone', 'Wet POCl₃ or too low temperature. Use dry reagent and confirm conversion before the quench.'],
      ['Phosphorylated intermediates', 'Incomplete reaction; they hydrolyse back to the pyridone in the quench. Hold long enough at temperature.'],
      ['Over-chlorination', 'Other OH or activated positions chlorinated. Control temperature and POCl₃ excess; additives (PCl₅, DMF) increase reactivity.']
    ],
    moist: { lvl: 'Very high', txt: 'Water destroys POCl₃ with heat and HCl and hydrolyses the activated intermediates back to the starting material. Dry reagents, dry equipment and a nitrogen blanket are needed.' },
    exo: { short: 'Mild reaction, hazardous quench', txt: 'The chlorination itself releases moderate heat at reflux; the aqueous quench of excess POCl₃ releases far more and can be delayed. Calorimetry on the quench is strongly advised.' },
    plant: ['Recover excess POCl₃ by distillation; it cuts both cost and quench heat.', 'Quench into water with spare cooling, volume and venting.', 'Glass-lined or alloy equipment; phosphoric and hydrochloric acids together are very corrosive.'],
    links: [['/molecules/reaction-lab/vilsmeier-haack-formylation/', 'Vilsmeier–Haack (also POCl₃)'], ['/process-safety/', 'Process safety'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'finkelstein-halide-exchange', name: 'Finkelstein halide exchange', short: 'Finkelstein reaction', cat: 'Substitution and alkylation',
    seo: 'Finkelstein Reaction: SN2 Halide Exchange Mechanism',
    desc: 'Alkyl chloride to alkyl iodide with sodium iodide in acetone: animated SN2 mechanism, why NaCl precipitation drives it, by-products and plant tips.',
    intro: 'Iodide displaces chloride or bromide from an alkyl halide by SN2. In acetone, sodium iodide dissolves but sodium chloride does not, so the chloride drops out as a solid and the equilibrium is pulled to the iodide. Catalytic iodide is also used to speed up other SN2 reactions of alkyl chlorides.',
    eq: { r: [['CCCCCl', 'Alkyl chloride (1-chlorobutane)'], ['[Na+].[I-]', 'Sodium iodide']], p: [['CCCCI', 'Alkyl iodide'], ['[Na+].[Cl-]', 'Sodium chloride (solid)']], cond: 'acetone, reflux (56 °C)' },
    mech: [
      { cap: 'Iodide attacks the carbon from the side opposite chlorine; chloride leaves in the same step (SN2).',
        sp: [{ s: '[I-]', lp: [0] }, { s: 'CCCCCl' }], ar: [{ f: ['l', 0, 0], t: ['n', 0, 0, 1, 3] }, { f: ['b', 1, 3, 4], t: ['a', 1, 4] }] },
      { cap: 'Products: the alkyl iodide and chloride, which leaves solution as sodium chloride.', sp: [{ s: 'CCCCI' }, { s: '[Cl-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge acetone and sodium iodide (1.2–2 eq); it dissolves.', level: 0.45, color: '#f1f2ee', T: 25, stir: true },
      { cap: 'Add the alkyl chloride and heat to reflux.', dose: { color: '#f7f7f7', name: 'Alkyl chloride' }, heat: true, T: 56, level: 0.55 },
      { cap: 'Sodium chloride precipitates as a fine white solid as the exchange proceeds.', heat: true, T: 56, solid: '#ffffff' },
      { cap: 'Cool, filter off the salt, and concentrate the filtrate. Wash with thiosulfate to remove any iodine colour.', T: 20, solid: null, color: '#f3ecd3', level: 0.4 }
    ],
    gas: [], gasNote: 'None',
    care: [
      'Alkyl iodides are potent alkylating agents and potential genotoxic impurities; handle in closed systems and show they are purged.',
      'Iodides are light-sensitive and release iodine (brown colour); store in the dark and wash with thiosulfate.',
      'Acetone is highly flammable; reflux with a good condenser and inert atmosphere.',
      'Iodine-containing waste should be segregated; iodide is costly and often recovered.'
    ],
    byp: [
      ['Elimination (alkene)', 'Secondary halides at long reflux. Keep to primary substrates or lower temperature.'],
      ['Iodine (colour)', 'Oxidation of iodide by air or light. Inert atmosphere; thiosulfate wash.'],
      ['Unreacted chloride', 'Water in the acetone keeps NaCl dissolved and stops the drive. Use dry acetone.']
    ],
    moist: { lvl: 'Low', txt: 'Water does not destroy anything, but it dissolves sodium chloride and so removes the driving force. Use reasonably dry acetone.' },
    exo: { short: 'Slightly exothermic', txt: 'Heat release is small; the reaction is run at reflux.' },
    plant: ['Recover iodide from the salt cake and mother liquor where volumes justify it.', 'Use catalytic NaI (5–10 %) to accelerate slow SN2 reactions of chlorides instead of a full exchange.', 'Protect the product from light.'],
    links: [['/molecules/reaction-lab/williamson-ether-synthesis/', 'Williamson ether (SN2)'], ['/molecules/reaction-lab/cyanide-substitution/', 'Cyanide substitution (SN2)'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'nucleophilic-aromatic-substitution', name: 'Nucleophilic aromatic substitution (SNAr)', short: 'SNAr', cat: 'Aromatic substitution',
    seo: 'SNAr Reaction: Meisenheimer Mechanism and Control',
    desc: 'Amine replacing fluoride on an activated nitroarene (SNAr): animated Meisenheimer-complex mechanism, base, exotherm, nitro thermal hazards and by-products.',
    intro: 'An electron-poor aromatic ring, activated by a nitro group (or ring nitrogens), can be attacked by a nucleophile. The attack gives a negatively charged Meisenheimer complex; the leaving group (fluoride or chloride) is then expelled and the ring is aromatic again. SNAr reactions with amines are among the most common bond-forming steps in drug synthesis.',
    eq: { r: [['FC1=CC=C(C=C1)[N+](=O)[O-]', '4-Fluoronitrobenzene'], ['C1COCCN1', 'Morpholine']], p: [['O=[N+]([O-])c1ccc(cc1)N1CCOCC1', '4-Morpholinonitrobenzene'], ['F', 'HF (as salt with the base)']], cond: 'K₂CO₃, DMSO or acetonitrile, 60–100 °C' },
    mech: [
      { cap: 'The amine nitrogen attacks the carbon bearing fluorine. The ring π electrons move round onto the nitro group, which holds the negative charge.',
        sp: [{ s: 'C1COCCN1', lp: [5] }, { s: 'FC1=CC=C(C=C1)[N+](=O)[O-]' }], ar: [{ f: ['l', 0, 5], t: ['n', 0, 5, 1, 1] }, { f: ['b', 1, 1, 2], t: ['b', 1, 2, 3] }, { f: ['b', 1, 3, 4], t: ['b', 1, 4, 7] }, { f: ['b', 1, 7, 8], t: ['a', 1, 8] }] },
      { cap: 'The Meisenheimer complex collapses: electrons flow back into the ring and fluoride leaves.',
        sp: [{ s: 'FC1(C=CC(C=C1)=[N+]([O-])[O-])[NH+]1CCOCC1', lp: [8] }], ar: [{ f: ['l', 0, 8], t: ['b', 0, 7, 8] }, { f: ['b', 0, 4, 7], t: ['b', 0, 3, 4] }, { f: ['b', 0, 2, 3], t: ['b', 0, 1, 2] }, { f: ['b', 0, 0, 1], t: ['a', 0, 0] }] },
      { cap: 'After the base removes the N–H proton: the substituted nitroarene and fluoride (as potassium fluoride).', sp: [{ s: 'O=[N+]([O-])c1ccc(cc1)N1CCOCC1' }, { s: '[F-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the solvent, the fluoronitroarene and powdered potassium carbonate.', level: 0.45, color: '#f2f0d8', solid: '#ffffff', T: 25, stir: true },
      { cap: 'Dose the amine and heat to 70–80 °C. The solution turns deep yellow as the product forms.', dose: { color: '#f7f7f2', name: 'Morpholine' }, heat: true, glow: true, T: 75, color: '#f2d24a', level: 0.55 },
      { cap: 'Hold until the fluoroarene is consumed.', heat: true, T: 80, color: '#efc634', solid: '#ffffff' },
      { cap: 'Cool and add water: the product precipitates as a yellow solid while the salts dissolve.', cool: true, dose: { color: '#dceef8', name: 'Water' }, T: 25, level: 0.8, solid: '#f2d24a', color: '#f4ecc4' },
      { cap: 'Filter, wash and dry the product.', T: 20, solid: '#f2d24a' }
    ],
    gas: [], gasNote: 'None; a little CO₂ from the carbonate base',
    care: [
      'Nitroarenes and their reaction mixtures can decompose violently at high temperature, especially in DMSO with base. Check thermal stability (DSC) and keep a margin to the onset temperature.',
      'Fluoride by-product with acid gives HF; keep the work-up basic or neutral and choose compatible materials.',
      'Dose the amine (or the arene) so the exotherm is controlled; SNAr can be fast at temperature.',
      'Many fluoronitroarenes are toxic and skin-absorbed; use closed handling.'
    ],
    byp: [
      ['Double substitution', 'Substrates with two leaving groups react twice. Control stoichiometry and temperature.'],
      ['Hydrolysis (phenol)', 'Hydroxide from wet carbonate attacks the ring. Use dry base and solvent.'],
      ['Regio-isomers', 'With several activated positions, ortho/para selectivity depends on solvent and temperature.']
    ],
    moist: { lvl: 'Low', txt: 'Small amounts of water are tolerated, but with carbonate at temperature water gives hydroxide, which forms phenol by-products.' },
    exo: { short: 'Exothermic', txt: 'SNAr with amines releases significant heat; combined with nitro groups, thermal stability of the reaction mass sets the safe operating limit.' },
    plant: ['Run DSC on the reaction mass in the chosen solvent; DMSO with bases has a known lower decomposition onset.', 'Control dosing rather than heating everything together.', 'Plan fluoride waste treatment (calcium precipitation).'],
    links: [['/molecules/reaction-lab/aromatic-nitration/', 'Aromatic nitration (makes the activated ring)'], ['/process-safety/', 'Process safety'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'sulfonamide-formation', name: 'Sulfonamide formation from a sulfonyl chloride', short: 'Sulfonamide formation', cat: 'Nitrogen chemistry',
    seo: 'Sulfonamide from Sulfonyl Chloride: Mechanism',
    desc: 'Sulfonyl chloride and amine to a sulfonamide with a base: animated mechanism, exotherm, HCl capture, moisture sensitivity and by-product control.',
    intro: 'An amine attacks the sulfur of a sulfonyl chloride and chloride leaves, giving a sulfonamide. A base takes up the HCl. Sulfonamides are found in many drugs, from antibacterials to diuretics, and the reaction is fast, clean and exothermic.',
    eq: { r: [['O=S(=O)(Cl)c1ccccc1', 'Benzenesulfonyl chloride'], ['CN', 'Amine (methylamine shown)'], ['CCN(CC)CC', 'Triethylamine']], p: [['CNS(=O)(=O)c1ccccc1', 'Sulfonamide'], ['CC[NH+](CC)CC.[Cl-]', 'Triethylamine hydrochloride']], cond: 'DCM, THF or water/base, 0–25 °C' },
    mech: [
      { cap: 'The amine nitrogen attacks sulfur and chloride leaves (substitution at sulfur).',
        sp: [{ s: 'CN', lp: [1] }, { s: 'O=S(=O)(Cl)c1ccccc1' }], ar: [{ f: ['l', 0, 1], t: ['n', 0, 1, 1, 1] }, { f: ['b', 1, 1, 3], t: ['a', 1, 3] }] },
      { cap: 'Triethylamine removes the proton from nitrogen.',
        sp: [{ s: 'O=S(=O)([NH+]([2H])C)c1ccccc1' }, { s: 'CCN(CC)CC', lp: [2] }], ar: [{ f: ['l', 1, 2], t: ['n', 1, 2, 0, 4] }, { f: ['b', 0, 3, 4], t: ['a', 0, 3] }] },
      { cap: 'Products: the sulfonamide and triethylamine hydrochloride.', sp: [{ s: 'CNS(=O)(=O)c1ccccc1' }, { s: 'CC[NH+](CC)CC' }, { s: '[Cl-]' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the amine and triethylamine in the solvent; cool to 0–5 °C.', level: 0.45, color: '#eef1f3', T: 3, cool: true, n2: true, stir: true },
      { cap: 'Dose the sulfonyl chloride (solution or melt) slowly. Exothermic; the hydrochloride salt comes out.', dose: { color: '#f2efe4', name: 'Sulfonyl chloride' }, glow: true, cool: true, T: 10, solid: '#ffffff', level: 0.56 },
      { cap: 'Warm to 20 °C and stir until the amine is consumed.', T: 20, solid: '#ffffff' },
      { cap: 'Wash with dilute acid and water; separate the layers.', dose: { color: '#dceef8', name: 'dil. HCl' }, solid: null, level: 0.78, T: 20 },
      { cap: 'Sulfonamide in the organic layer.', layers: ['#eef1f3', '#d8ecf6'], T: 20 }
    ],
    gas: [], gasNote: 'None with base present',
    care: [
      'Sulfonyl chlorides react with water to give the sulfonic acid and HCl; keep reagents dry until the reaction is complete.',
      'The reaction is fast and exothermic; dose with cooling.',
      'Sulfonyl chlorides are corrosive and lachrymatory; use closed transfer.',
      'Residual sulfonyl chloride and sulfonate esters (if alcohols are present) can be genotoxic; quench excess before work-up.'
    ],
    byp: [
      ['Sulfonic acid', 'Hydrolysis of the sulfonyl chloride by water. Dry solvent and amine.'],
      ['Bis-sulfonylation (N,N-disulfonyl)', 'Primary amines with excess sulfonyl chloride and strong base. Use about 1.0–1.05 eq.'],
      ['Sulfonate ester', 'Alcohol solvent or hydroxyl groups react. Avoid alcohol solvents.']
    ],
    moist: { lvl: 'High', txt: 'Water consumes the sulfonyl chloride, forming sulfonic acid and HCl and lowering the yield. Aqueous-base versions work only because the amine reacts faster than water.' },
    exo: { short: 'Strongly exothermic', txt: 'Sulfonylation plus neutralisation of HCl release significant heat; run dosing-controlled at low temperature.' },
    plant: ['Assay the sulfonyl chloride lot; it hydrolyses in storage.', 'Keep the dosing line dry and flush it after use.', 'Check genotoxic impurity limits for sulfonyl chloride and esters.'],
    links: [['/molecules/reaction-lab/mesylation-of-alcohol/', 'Mesylation (sulfonyl chloride + alcohol)'], ['/molecules/reaction-lab/amide-from-acid-chloride/', 'Amide from an acid chloride'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'urea-from-isocyanate', name: 'Urea formation from an isocyanate and an amine', short: 'Urea from isocyanate', cat: 'Nitrogen chemistry',
    seo: 'Urea from Isocyanate and Amine: Mechanism, Safety',
    desc: 'Amine adding to an isocyanate to form a urea: animated mechanism, exotherm, isocyanate toxicity, moisture and CO₂, symmetric urea by-products and plant control.',
    intro: 'An amine adds across the C=N bond of an isocyanate and a proton moves from nitrogen to nitrogen, giving a urea. The reaction needs no catalyst and is fast and exothermic. Isocyanates are toxic and respiratory sensitisers, and they react with water too, so handling and dryness are the main concerns.',
    eq: { r: [['O=C=Nc1ccccc1', 'Isocyanate (phenyl isocyanate)'], ['CN', 'Amine (methylamine shown)']], p: [['CNC(=O)Nc1ccccc1', 'Urea']], cond: 'THF, toluene or DCM, 0–25 °C' },
    mech: [
      { cap: 'The amine nitrogen attacks the isocyanate carbon; the C=N π electrons move onto nitrogen.',
        sp: [{ s: 'CN', lp: [1] }, { s: 'O=C=Nc1ccccc1' }], ar: [{ f: ['l', 0, 1], t: ['n', 0, 1, 1, 1] }, { f: ['b', 1, 1, 2], t: ['a', 1, 2] }] },
      { cap: 'The proton moves from the ammonium nitrogen to the negatively charged nitrogen (through the solvent).',
        sp: [{ s: 'C[NH+]([2H])C(=O)[N-]c1ccccc1', lp: [5] }], ar: [{ f: ['l', 0, 5], t: ['n', 0, 5, 0, 2] }, { f: ['b', 0, 1, 2], t: ['a', 0, 1] }] },
      { cap: 'Product: the urea.', sp: [{ s: 'CNC(=O)Nc1ccccc1' }], ar: [] }
    ],
    lab: [
      { cap: 'Under nitrogen, charge the amine in dry solvent and cool to 0–5 °C.', level: 0.45, color: '#eef1f3', T: 3, cool: true, n2: true, stir: true },
      { cap: 'Dose the isocyanate slowly. Exothermic; ureas often crystallise from the solution.', dose: { color: '#f7f7f2', name: 'Isocyanate' }, glow: true, cool: true, T: 10, solid: '#ffffff', level: 0.56 },
      { cap: 'Stir until no isocyanate remains (IR band near 2270 cm⁻¹ gone).', T: 20, solid: '#ffffff' },
      { cap: 'Filter and wash the urea.', T: 20, solid: '#ffffff' }
    ],
    gas: [], gasNote: 'None; CO₂ if water reaches the isocyanate',
    care: [
      'Isocyanates are toxic and strong respiratory sensitisers, even at very low exposure. Use closed systems, extraction and health surveillance.',
      'Water reacts with isocyanates to give an amine and CO₂; in a closed container this pressurises it. Keep isocyanates dry and vented.',
      'Fast and exothermic; dose the isocyanate with cooling.',
      'Confirm no isocyanate remains before opening equipment or drying the product.'
    ],
    byp: [
      ['Symmetric urea', 'Water turns isocyanate into amine, which adds to more isocyanate. Dry everything.'],
      ['Biuret', 'Urea N–H adding to excess isocyanate at higher temperature. Use about 1.0 eq and stay cool.'],
      ['Carbamate', 'Alcohol solvent or hydroxyl groups react with the isocyanate. Avoid alcohols.']
    ],
    moist: { lvl: 'Medium', txt: 'Water gives CO₂ and an amine, which forms the symmetric urea impurity. Use dry solvent and amine.' },
    exo: { short: 'Strongly exothermic', txt: 'Amine addition to isocyanates is fast and releases substantial heat; dose-controlled addition is needed.' },
    plant: ['Isocyanate monitoring in the work area.', 'Store isocyanates dry, cool and vented.', 'Carbamoylating with a carbonyl-diimidazole or a carbamate avoids handling free isocyanates when possible.'],
    links: [['/molecules/reaction-lab/curtius-rearrangement/', 'Curtius rearrangement (makes isocyanates)'], ['/molecules/reaction-lab/boc-protection-of-amine/', 'Boc protection (carbamates)'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'mannich-reaction', name: 'Mannich reaction', short: 'Mannich reaction', cat: 'Carbon–carbon bond formation',
    seo: 'Mannich Reaction: Iminium and Enol Mechanism',
    desc: 'Mannich reaction of a ketone, formaldehyde and a secondary amine: animated iminium and enol mechanism, formaldehyde handling, by-products and plant tips.',
    intro: 'Formaldehyde and a secondary amine form an iminium ion. The enol of a ketone attacks it, giving a β-amino ketone (a Mannich base). It builds a carbon–carbon bond and puts an amine in place in one pot, and Mannich bases are common drug intermediates.',
    eq: { r: [['CC(C)=O', 'Ketone (acetone shown)'], ['C=O', 'Formaldehyde'], ['CNC', 'Dimethylamine']], p: [['CC(=O)CCN(C)C', 'Mannich base'], ['O', 'Water']], cond: 'HCl (amine salt), ethanol, reflux' },
    mech: [
      { cap: 'The amine attacks formaldehyde.',
        sp: [{ s: 'CNC', lp: [1] }, { s: 'C=O' }], ar: [{ f: ['l', 0, 1], t: ['n', 0, 1, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'After proton transfers, the OH is protonated; the nitrogen lone pair pushes out water and forms the iminium ion.',
        sp: [{ s: 'CN(C)C[O+]([2H])[2H]', lp: [1] }], ar: [{ f: ['l', 0, 1], t: ['b', 0, 1, 3] }, { f: ['b', 0, 3, 4], t: ['a', 0, 4] }] },
      { cap: 'The enol of the ketone attacks the iminium carbon; the iminium C=N⁺ π electrons move onto nitrogen.',
        sp: [{ s: 'C=[N+](C)C' }, { s: 'C=C(C)O', lp: [3] }], ar: [{ f: ['l', 1, 3], t: ['b', 1, 1, 3] }, { f: ['b', 1, 0, 1], t: ['n', 1, 0, 0, 0] }, { f: ['b', 0, 0, 1], t: ['a', 0, 1] }] },
      { cap: 'Water removes the proton from the carbonyl oxygen, giving the neutral β-amino ketone.',
        sp: [{ s: '[2H][O+]=C(C)CCN(C)C' }, { s: 'O', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 0] }, { f: ['b', 0, 0, 1], t: ['a', 0, 1] }] },
      { cap: 'Product: the Mannich base (isolated as its hydrochloride).', sp: [{ s: 'CC(=O)CCN(C)C' }, { s: 'O' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the ketone, paraformaldehyde, dimethylamine hydrochloride and ethanol with a little HCl.', level: 0.45, color: '#f0f0ea', solid: '#ffffff', T: 25, stir: true },
      { cap: 'Heat to reflux. The solids dissolve as the iminium forms and reacts.', heat: true, T: 78, solid: null },
      { cap: 'Hold until the ketone is consumed.', heat: true, T: 80, color: '#efe6c8' },
      { cap: 'Cool; the Mannich base hydrochloride crystallises (add acetone to complete).', cool: true, T: 5, solid: '#ffffff', dose: { color: '#f5f5f5', name: 'Acetone' }, level: 0.6 }
    ],
    gas: [], gasNote: 'None; formaldehyde vapour',
    care: [
      'Formaldehyde is toxic and a carcinogen; paraformaldehyde releases it on heating. Use closed handling and extraction.',
      'Mannich bases can undergo retro-Mannich or eliminate the amine (giving vinyl ketones, strong irritants) on heating or in base.',
      'Dimethylamine is a gas; its hydrochloride salt is easier to handle.',
      'Formaldehyde and HCl can form bis(chloromethyl) ether, a potent carcinogen; avoid concentrated HCl with formaldehyde.'
    ],
    byp: [
      ['Bis-Mannich product', 'Both α-positions react. Use excess ketone.'],
      ['Vinyl ketone', 'Elimination of the amine on heating or basification. Keep the product as its salt and avoid heat in base.'],
      ['Formaldehyde condensation products', 'Excess formaldehyde. Use close to 1 eq.']
    ],
    moist: { lvl: 'Low', txt: 'Water is formed and often present (formalin); it does not stop the reaction.' },
    exo: { short: 'Mildly exothermic', txt: 'Heat release is modest; the reaction is usually run at reflux.' },
    plant: ['Keep formaldehyde exposure monitored.', 'Isolate and store the product as its salt.', 'Do not mix formaldehyde streams with hydrochloric acid in waste tanks.'],
    links: [['/molecules/reaction-lab/aldol-condensation/', 'Aldol condensation (enolate chemistry)'], ['/molecules/reaction-lab/reductive-amination/', 'Reductive amination (iminium ions)'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'alpha-bromination-of-ketone', name: 'α-Bromination of a ketone', short: 'α-Bromination', cat: 'Aromatic substitution',
    seo: 'Alpha-Bromination of Ketones: Enol Mechanism, HBr',
    desc: 'Acid-catalysed α-bromination of a ketone with bromine: animated enol mechanism, HBr gas per kg, lachrymator handling, over-bromination and plant control.',
    intro: 'In acid, a ketone forms a small amount of enol, which attacks bromine. Loss of a proton gives the α-bromoketone and HBr. The HBr made speeds up enol formation, so the reaction can start slowly and then accelerate. α-Bromoketones are strong lachrymators and alkylating agents.',
    eq: { r: [['CC(=O)c1ccccc1', 'Ketone (acetophenone)'], ['BrBr', 'Bromine']], p: [['BrCC(=O)c1ccccc1', 'α-Bromoketone (phenacyl bromide)'], ['Br', 'Hydrogen bromide']], cond: 'acetic acid or DCM, HBr (cat.), 20–40 °C' },
    mech: [
      { cap: 'Acid protonates the carbonyl oxygen.',
        sp: [{ s: 'CC(=O)c1ccccc1', lp: [2] }, { s: H3O }], ar: [{ f: ['l', 0, 2], t: ['n', 0, 2, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'Water removes an α-proton, forming the enol. This step is slow and sets the overall rate.',
        sp: [{ s: '[2H]CC(=[O+][2H])c1ccccc1' }, { s: 'O', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 0] }, { f: ['b', 0, 0, 1], t: ['b', 0, 1, 2] }, { f: ['b', 0, 2, 3], t: ['a', 0, 3] }] },
      { cap: 'The enol C=C attacks bromine, pushed by the OH lone pair; bromide leaves.',
        sp: [{ s: 'C=C(O[2H])c1ccccc1', lp: [2] }, { s: 'BrBr' }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 0, 1], t: ['n', 0, 0, 1, 0] }, { f: ['b', 1, 0, 1], t: ['a', 1, 1] }] },
      { cap: 'Bromide takes the proton from oxygen, giving the α-bromoketone and HBr.',
        sp: [{ s: 'BrCC(=[O+][2H])c1ccccc1' }, { s: '[Br-]', lp: [0] }], ar: [{ f: ['l', 1, 0], t: ['n', 1, 0, 0, 4] }, { f: ['b', 0, 3, 4], t: ['a', 0, 3] }] },
      { cap: 'Products: the α-bromoketone and HBr, which catalyses more enol formation.', sp: [{ s: 'BrCC(=O)c1ccccc1' }, { s: 'Br' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the ketone in acetic acid with a little HBr to start enol formation.', level: 0.45, color: '#f1efe6', T: 22, stir: true, n2: true },
      { cap: 'Dose a small part of the bromine and wait for the red colour to fade: the reaction has started.', dose: { color: '#9b2c13', name: 'Bromine' }, T: 25, color: '#d9a07a' },
      { cap: 'Dose the rest of the bromine at the rate it is used up (colour stays pale). HBr goes to the scrubber.', dose: { color: '#9b2c13', name: 'Bromine' }, gas: { name: 'HBr' }, glow: true, cool: true, T: 30, color: '#efe2c4', level: 0.55 },
      { cap: 'Stir until the ketone is consumed, then pour into water: the product separates or crystallises.', dose: { color: '#dceef8', name: 'Water' }, T: 20, level: 0.8, solid: '#ffffff', color: '#f1ece0' },
      { cap: 'Filter and wash the product. Handle as a lachrymator.', T: 18, solid: '#ffffff' }
    ],
    gas: [{ n: 'Hydrogen bromide', s: 'Br', mol: 1, note: 'Corrosive; scrub in water then caustic. Recoverable as hydrobromic acid.' }],
    care: [
      'The reaction is autocatalytic: it can wait, then speed up. Start with a small bromine charge and confirm it is consumed before dosing the rest.',
      'α-Bromoketones are strong lachrymators and skin irritants. Use closed handling, extraction and full protection.',
      'Bromine is very toxic and corrosive; keep bisulfite or thiosulfate ready for spills.',
      'HBr is released throughout; size the scrubber for the dosing rate.'
    ],
    byp: [
      ['α,α-Dibromoketone', 'Excess bromine or local high concentration. Use 1.0 eq and good mixing.'],
      ['Ring bromination', 'Electron-rich aryl ketones may brominate on the ring. Keep without Lewis acids and at low temperature.'],
      ['Bromine accumulation', 'Bromine dosed before the reaction starts. Wait for the colour to fade after the first portion.']
    ],
    moist: { lvl: 'Low', txt: 'Small amounts of water do not stop acid-catalysed enolisation; very wet conditions slow it and complicate HBr handling.' },
    exo: { short: 'Moderately exothermic', txt: 'Bromination releases moderate heat; the autocatalytic start is the main control issue.' },
    plant: ['Use colour (or a redox probe) as the accumulation check during dosing.', 'Glass-lined or PTFE-lined equipment.', 'NBS or pyridinium tribromide are easier reagents for small or sensitive batches.'],
    links: [['/molecules/reaction-lab/aromatic-bromination/', 'Aromatic bromination'], ['/process-safety/', 'Process safety'], ['/molecules/reaction/', 'Reaction Builder']]
  },
  {
    slug: 'carbodiimide-amide-coupling', name: 'Amide coupling with a carbodiimide', short: 'Carbodiimide coupling', cat: 'Acylation and activation',
    seo: 'Carbodiimide Amide Coupling: Mechanism, By-products',
    desc: 'Carboxylic acid and amine coupled with a carbodiimide (DIC, EDC, DCC): animated O-acylisourea mechanism, urea by-product, additives, sensitisers and plant tips.',
    intro: 'A carbodiimide activates a carboxylic acid as an O-acylisourea, a reactive ester that an amine attacks to form the amide. The carbodiimide ends up as a urea by-product. Additives such as HOBt or Oxyma are usually added to stop side reactions and racemisation.',
    eq: { r: [['CC(=O)O', 'Carboxylic acid (acetic acid shown)'], ['CN', 'Amine'], ['CC(C)N=C=NC(C)C', 'Diisopropylcarbodiimide (DIC)']], p: [['CC(=O)NC', 'Amide'], ['CC(C)NC(=O)NC(C)C', 'Diisopropylurea']], cond: 'DMF, DCM or EtOAc, 0–25 °C, often with HOBt or Oxyma' },
    mech: [
      { cap: 'A carbodiimide nitrogen takes the acid proton.',
        sp: [{ s: 'CC(=O)O[2H]' }, { s: 'CC(C)N=C=NC(C)C', lp: [3] }], ar: [{ f: ['l', 1, 3], t: ['n', 1, 3, 0, 4] }, { f: ['b', 0, 3, 4], t: ['a', 0, 3] }] },
      { cap: 'The carboxylate attacks the central carbon of the protonated carbodiimide, forming the O-acylisourea.',
        sp: [{ s: 'CC(=O)[O-]', lp: [3] }, { s: 'CC(C)[NH+]=C=NC(C)C' }], ar: [{ f: ['l', 0, 3], t: ['n', 0, 3, 1, 4] }, { f: ['b', 1, 3, 4], t: ['a', 1, 3] }] },
      { cap: 'The amine attacks the activated carbonyl carbon.',
        sp: [{ s: 'CC(=O)OC(=NC(C)C)NC(C)C' }, { s: 'CN', lp: [1] }], ar: [{ f: ['l', 1, 1], t: ['n', 1, 1, 0, 1] }, { f: ['b', 0, 1, 2], t: ['a', 0, 2] }] },
      { cap: 'The intermediate collapses; the isourea leaves and becomes the urea by-product after proton transfers.',
        sp: [{ s: 'CC([O-])([NH2+]C)OC(=NC(C)C)NC(C)C', lp: [2] }], ar: [{ f: ['l', 0, 2], t: ['b', 0, 1, 2] }, { f: ['b', 0, 1, 5], t: ['a', 0, 5] }] },
      { cap: 'Products: the amide and diisopropylurea.', sp: [{ s: 'CC(=O)NC' }, { s: 'CC(C)NC(=O)NC(C)C' }], ar: [] }
    ],
    lab: [
      { cap: 'Charge the acid, the additive (HOBt or Oxyma) and solvent; cool to 0–5 °C.', level: 0.45, color: '#eef1f3', T: 3, cool: true, n2: true, stir: true },
      { cap: 'Dose the carbodiimide. The active ester forms; mild exotherm.', dose: { color: '#f7f7f2', name: 'DIC' }, glow: true, cool: true, T: 8, level: 0.52 },
      { cap: 'Dose the amine and warm to 20 °C.', dose: { color: '#f7f7f2', name: 'Amine' }, T: 20, level: 0.6 },
      { cap: 'Stir until the acid is consumed. With DCC the urea precipitates; with DIC or EDC it stays dissolved and is washed out.', T: 22 },
      { cap: 'Wash with dilute acid, bicarbonate and water; separate the layers.', layers: ['#eef1f3', '#d8ecf6'], T: 20, level: 0.8 }
    ],
    gas: [], gasNote: 'None',
    care: [
      'Carbodiimides (DCC, DIC, EDC) are strong skin sensitisers; avoid all skin contact and handle in closed systems.',
      'Benzotriazole additives (HOBt, HOAt) are energetic in dry form and restricted for transport; Oxyma is often preferred.',
      'Choose the carbodiimide by how its urea is removed: DCC urea filters off, EDC urea washes out with water, DIC urea dissolves in common solvents.',
      'Pre-activation time matters: leaving the O-acylisourea too long without amine gives N-acylurea.'
    ],
    byp: [
      ['N-Acylurea', 'O-acylisourea rearranges when the amine reacts slowly. Add HOBt or Oxyma; add the amine promptly.'],
      ['Racemisation / epimerisation', 'Activated chiral acids (amino acids) lose stereochemistry via oxazolone. Use additives, low temperature and weak bases.'],
      ['Anhydride', 'Excess acid with carbodiimide. Usually still couples, but changes stoichiometry.']
    ],
    moist: { lvl: 'Medium', txt: 'Water hydrolyses the activated acid back to the acid and consumes carbodiimide (making urea). Use dry solvent; EDC couplings tolerate some water.' },
    exo: { short: 'Mildly exothermic', txt: 'Activation and coupling release moderate heat; dose the carbodiimide with cooling on scale.' },
    plant: ['Health surveillance and closed handling for carbodiimide sensitisers.', 'Specify urea and additive limits in the product.', 'For large scale, acid chlorides, mixed anhydrides or propylphosphonic anhydride (T3P) are common alternatives.'],
    links: [['/molecules/reaction-lab/amide-from-acid-chloride/', 'Amide from an acid chloride'], ['/molecules/reaction-lab/acid-chloride-thionyl-chloride/', 'Acid chloride with thionyl chloride'], ['/molecules/reaction/', 'Reaction Builder']]
  }
];
