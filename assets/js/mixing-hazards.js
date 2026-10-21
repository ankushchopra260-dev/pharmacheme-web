/* PharmaChemE: Chemical Mixing Hazard Checker.
   Screening by reactive group, in the style of the EPA hazardous-waste compatibility chart
   (Hatayama et al., EPA-600/2-80-076, 1980) and the CCPS/NOAA Chemical Reactivity Worksheet.
   Rules and wording are our own; specific hazards are from Bretherick's Handbook of Reactive Chemical Hazards
   and published incident reports. A pair with no rule is NOT proof that the mixture is safe. */
(function () {
  'use strict';
  const G = {
    W: 'Water', ACIDS: 'Strong acid', HCL: 'Hydrochloric acid / chloride source', SULF: 'Concentrated sulphuric acid', NIT: 'Nitric acid (oxidising acid)',
    ACIDO: 'Organic acid', BASE: 'Strong base', AMINE: 'Amine / ammonia', ALC: 'Alcohol / glycol', KET: 'Ketone', ESTER: 'Ester', ETHER: 'Ether',
    HC: 'Hydrocarbon', HALO: 'Chlorinated solvent', AMIDE: 'Amide solvent (DMF, DMAc, NMP)', DMSO: 'DMSO / sulfoxide', NITRILE: 'Nitrile', NITRO: 'Nitro compound',
    ACYLX: 'Acid halide / water-reactive chloride', ANHYD: 'Acid anhydride', EPOX: 'Epoxide', ALD: 'Aldehyde', OXID: 'Strong oxidiser', PEROX: 'Hydrogen peroxide',
    HYPO: 'Hypochlorite (bleach)', NITRITE: 'Nitrite', HYDRIDE: 'Hydride / alkali metal / organolithium', AZIDE: 'Azide', CYANIDE: 'Cyanide', HYDRAZINE: 'Hydrazine',
    CS2: 'Carbon disulfide', PHENOL: 'Phenol'
  };
  const ORG = ['ALC', 'KET', 'ESTER', 'ETHER', 'HC', 'HALO', 'AMIDE', 'DMSO', 'NITRILE', 'NITRO', 'ALD', 'PHENOL', 'AMINE', 'ACIDO', 'ANHYD', 'EPOX', 'CS2', 'HYDRAZINE'];
  // [groups A, groups B, severity D|C, effects, text]
  const RULES = [
    [['ACYLX'], ['W'], 'D', ['Heat', 'Toxic gas: HCl (SO₂ from thionyl/sulfuryl chloride)', 'Pressure'], 'Reacts violently with water and moist air. Quenches into water can stall and then run away all at once (POCl₃ is known for this): dose slowly into a well-stirred, cooled quench and vent to a scrubber.'],
    [['ACYLX'], ['ALC', 'PHENOL', 'ACIDO'], 'C', ['Heat', 'Toxic gas: HCl'], 'Exothermic reaction giving HCl gas (and SO₂ with thionyl chloride). Control by dosing rate and cooling; size the scrubber for the gas flow.'],
    [['ACYLX'], ['AMINE'], 'D', ['Heat', 'Toxic gas: HCl', 'Solids'], 'Very exothermic acylation and salt formation; amine hydrochloride solids can block lines. Dose the acid chloride slowly with cooling.'],
    [['ACYLX'], ['BASE'], 'D', ['Heat'], 'Violent neutralisation and hydrolysis.'],
    [['ACYLX'], ['AMIDE'], 'D', ['Heat', 'Gas: HCl, SO₂ / CO, CO₂', 'Runaway'], 'Forms the Vilsmeier reagent: exothermic with gas release, and POCl₃/DMF and SOCl₂/DMF mixtures have runaway decomposition reported when held warm. Also forms traces of dimethylcarbamoyl chloride (a carcinogen).'],
    [['ACYLX'], ['DMSO'], 'D', ['Explosion', 'Gas: CO, CO₂, dimethyl sulfide'], 'DMSO activated by acid chlorides (oxalyl chloride, SOCl₂) reacts violently; Swern-type activation is only safe far below 0 °C (about −60 °C).'],
    [['ACYLX'], ['HYDRIDE', 'HYDRAZINE', 'AZIDE'], 'D', ['Heat', 'Explosion'], 'Violent reaction; acyl azides and some hydrazides are explosive.'],
    [['ACYLX'], ['CYANIDE'], 'D', ['Toxic gas: HCN'], 'Moisture plus acid chloride gives HCl, which releases HCN from cyanide.'],
    [['HYDRIDE'], ['W'], 'D', ['Flammable gas: H₂', 'Fire', 'Heat'], 'Gives hydrogen, often igniting it. Quench with a less reactive alcohol first, under nitrogen, with cooling.'],
    [['HYDRIDE'], ['ALC', 'PHENOL', 'ACIDO', 'ACIDS'], 'D', ['Flammable gas: H₂', 'Heat'], 'Hydrogen release and heat; the rate can rise suddenly. Vent the hydrogen and keep the headspace inerted.'],
    [['HYDRIDE'], ['HALO'], 'D', ['Explosion'], 'Alkali metals and strong hydrides with chlorinated solvents (CCl₄, chloroform, DCM) can explode.'],
    [['HYDRIDE'], ['AMIDE'], 'D', ['Runaway', 'Gas'], 'NaH in DMF or DMAc: runaway decomposition reported from about 40 to 50 °C.'],
    [['HYDRIDE'], ['DMSO'], 'D', ['Runaway', 'Explosion'], 'NaH or strong bases with DMSO (dimsyl anion): explosive runaway reported on heating.'],
    [['HYDRIDE'], ['NITRO', 'OXID', 'PEROX', 'HYPO', 'NIT'], 'D', ['Fire', 'Explosion'], 'Violent reduction or oxidation.'],
    [['HYDRIDE'], ['KET', 'ESTER', 'ALD', 'NITRILE', 'EPOX', 'AMINE', 'ANHYD'], 'C', ['Heat', 'Flammable gas: H₂ (some)'], 'Reduction or deprotonation is exothermic; add by dosing, not all at once.'],
    [['SULF'], ['W'], 'D', ['Heat', 'Splashing'], 'Very large heat of dilution: add acid to water slowly, never water to acid.'],
    [['SULF'], ['ALC', 'KET', 'ESTER', 'ETHER', 'HC', 'ALD', 'AMIDE', 'DMSO', 'NITRILE', 'EPOX', 'ANHYD', 'PHENOL', 'ACIDO'], 'C', ['Heat', 'Charring'], 'Strong heat of mixing, dehydration and charring; aromatics are sulfonated. Add slowly with cooling.'],
    [['SULF'], ['NIT'], 'D', ['Heat', 'Nitration'], 'Mixed acid: a strong nitrating mixture. With any organic material it can nitrate and run away.'],
    [['SULF'], ['OXID', 'PEROX'], 'D', ['Explosion'], 'With permanganate forms explosive Mn₂O₇; with hydrogen peroxide forms Caro’s acid, which reacts explosively with organics.'],
    [['NIT'], ['ALC', 'KET', 'ESTER', 'ETHER', 'HC', 'AMINE', 'AMIDE', 'DMSO', 'ALD', 'PHENOL', 'NITRILE', 'ANHYD', 'CS2', 'HYDRAZINE', 'EPOX', 'HALO'], 'D', ['Heat', 'Toxic gas: NOx', 'Fire', 'Explosion'], 'Strong oxidation and nitration. Nitric acid with acetone, ethanol, acetic anhydride or amines has caused explosions. Brown NOx fumes cause delayed lung damage.'],
    [['NIT'], ['ACIDO'], 'C', ['Heat', 'Toxic gas: NOx'], 'Used as nitration media, but mixtures can decompose with NOx when warm. Keep cold and make fresh.'],
    [['ACIDS', 'SULF', 'NIT'], ['BASE'], 'C', ['Heat'], 'Neutralisation heat; violent if both are concentrated.'],
    [['ACIDS', 'SULF', 'NIT', 'ACIDO'], ['AMINE'], 'C', ['Heat', 'Solids'], 'Salt formation is exothermic; fumes with ammonia and volatile amines.'],
    [['ACIDS', 'SULF', 'NIT', 'ACIDO', 'ACYLX'], ['HYPO'], 'D', ['Toxic gas: Cl₂'], 'Releases chlorine gas.'],
    [['ACIDS', 'SULF', 'NIT', 'ACIDO'], ['AZIDE'], 'D', ['Toxic gas: HN₃', 'Explosion'], 'Forms hydrazoic acid: very toxic, volatile and explosive.'],
    [['ACIDS', 'SULF', 'NIT', 'ACIDO'], ['CYANIDE'], 'D', ['Toxic gas: HCN'], 'Releases hydrogen cyanide.'],
    [['ACIDS', 'SULF', 'ACIDO'], ['NITRITE'], 'D', ['Toxic gas: NOx'], 'Forms nitrous acid and NOx; any amine present can be nitrosated (nitrosamines).'],
    [['ACIDS', 'SULF', 'BASE', 'AMINE'], ['EPOX'], 'D', ['Polymerisation', 'Heat'], 'Acids, bases and amines catalyse violent polymerisation of epoxides (ethylene oxide especially).'],
    [['HCL'], ['ALD'], 'D', ['Carcinogen'], 'Hydrochloric acid (or HCl gas) with formaldehyde forms bis(chloromethyl) ether, a potent carcinogen, even at ppm levels.'],
    [['ACIDS', 'SULF'], ['DMSO'], 'C', ['Runaway'], 'Acids lower the decomposition temperature of DMSO. Avoid heating such mixtures (keep well below about 100 °C unless tested).'],
    [['ACIDS', 'SULF'], ['NITRILE'], 'C', ['Heat'], 'Acid hydrolysis of nitriles is exothermic and can accelerate.'],
    [['ACIDS', 'SULF', 'ACIDO'], ['HYDRAZINE'], 'C', ['Heat'], 'Salt formation is exothermic.'],
    [['ACIDO'], ['BASE'], 'C', ['Heat'], 'Neutralisation heat.'],
    [['ACIDO', 'ANHYD'], ['PEROX'], 'D', ['Explosion'], 'Forms peracetic or performic acid: a strong oxidiser that can decompose explosively.'],
    [['BASE'], ['HALO'], 'C', ['Heat'], 'Strong bases with chloroform form dichlorocarbene (exothermic); chloroform with acetone and a base reacts violently. DCM slowly reacts with amines and bases.'],
    [['BASE'], ['KET', 'ESTER', 'ALD', 'ANHYD', 'PHENOL', 'NITRILE', 'AMIDE'], 'C', ['Heat'], 'Base-catalysed reactions (aldol, saponification, Cannizzaro, hydrolysis) are exothermic.'],
    [['BASE'], ['DMSO'], 'C', ['Runaway'], 'Bases lower the decomposition temperature of DMSO; do not heat strongly basic DMSO without testing.'],
    [['BASE', 'AMINE'], ['NITRO'], 'D', ['Explosion'], 'Nitromethane with bases or amines forms shock-sensitive salts and becomes much easier to detonate.'],
    [['BASE'], ['W'], 'C', ['Heat'], 'Solid caustic and alkoxides release heat on dissolving.'],
    [['BASE'], ['CS2'], 'C', ['Heat'], 'With alcohols present, forms xanthates exothermically.'],
    [['AMINE'], ['HALO'], 'C', ['Heat', 'Solids'], 'Amines react slowly with DCM and other alkyl halides (quaternisation): heat and solids over hours to days. Do not store amine/DCM mixtures.'],
    [['AMINE'], ['ALD', 'ANHYD'], 'C', ['Heat'], 'Exothermic condensation or acylation.'],
    [['AMINE', 'AMIDE'], ['NITRITE'], 'D', ['Carcinogen: nitrosamines'], 'Secondary and tertiary amines (and DMF, DMAc and NMP, which contain or form dimethyl- or methylamine) react with nitrite, especially in acid, to form N-nitrosamines (NDMA and others), potent carcinogens and a key regulatory concern for APIs.'],
    [['AMINE'], ['HYPO', 'OXID'], 'D', ['Toxic gas: chloramines', 'Explosion'], 'Ammonia and amines with hypochlorite or chlorine form chloramines; nitrogen trichloride is explosive.'],
    [['AMINE'], ['CS2'], 'C', ['Heat'], 'Forms dithiocarbamates exothermically.'],
    [['AMINE'], ['PEROX'], 'C', ['Heat'], 'Amine oxidation by peroxide is exothermic.'],
    [['HYPO'], ['ALC', 'KET'], 'C', ['Heat', 'Toxic product: chloroform'], 'Bleach with acetone or ethanol gives chloroform (haloform reaction) with heat.'],
    [['HYPO'], ['ALD', 'PHENOL', 'HYDRAZINE'], 'C', ['Heat'], 'Oxidation is exothermic.'],
    [['OXID', 'PEROX'], ['ALC', 'KET', 'ESTER', 'ETHER', 'HC', 'AMIDE', 'DMSO', 'ALD', 'PHENOL', 'NITRILE', 'CS2', 'HYDRAZINE', 'EPOX', 'ANHYD'], 'D', ['Fire', 'Explosion', 'Heat'], 'Strong oxidiser with a flammable organic: fire or explosion risk. Hydrogen peroxide with acetone (especially with acid) forms explosive peroxides (TATP).'],
    [['OXID', 'PEROX'], ['W'], 'C', ['Heat', 'Gas: O₂'], 'Concentrated hydrogen peroxide decomposes with metal traces, giving oxygen and heat; chlorine and bromine form acids in water.'],
    [['EPOX'], ['ALC', 'W'], 'C', ['Heat', 'Polymerisation'], 'Ring opening is exothermic and runs away when catalysed by acid, base or metal salts.'],
    [['ALD'], ['PHENOL'], 'D', ['Runaway'], 'Phenol–formaldehyde resin formation is strongly exothermic; many runaways with acid or base catalyst.'],
    [['ALD'], ['HYDRAZINE'], 'C', ['Heat'], 'Exothermic condensation.'],
    [['ANHYD'], ['W', 'ALC'], 'C', ['Heat'], 'Hydrolysis or esterification is exothermic and can start slowly, then accelerate.'],
    [['ANHYD'], ['DMSO'], 'C', ['Heat'], 'Acetic anhydride activates DMSO (Pfitzner–Moffatt type): exothermic.'],
    [['AZIDE'], ['HALO'], 'D', ['Explosion'], 'Sodium azide with DCM or chloroform forms di- and triazidomethane, which are explosive.'],
    [['AZIDE'], ['CS2'], 'D', ['Explosion'], 'Forms explosive azidodithiocarbonate.'],
    [['CYANIDE'], ['OXID', 'HYPO', 'PEROX'], 'C', ['Heat'], 'Oxidation of cyanide is exothermic (used for destruction, but control the rate and pH).'],
    [['HYDRAZINE'], ['KET', 'ESTER'], 'C', ['Heat'], 'Hydrazone or hydrazide formation is exothermic.'],
    [['HYDRAZINE'], ['OXID', 'PEROX', 'HYPO'], 'D', ['Fire', 'Explosion'], 'Hydrazine is a strong reducer: violent reaction with oxidisers.'],
    [['HYDRAZINE'], ['HALO'], 'C', ['Heat'], 'Slow alkylation; exothermic.'],
    [['NITRO'], ['ACIDS', 'SULF'], 'C', ['Runaway'], 'Strong acids lower the decomposition temperature of nitro compounds.'],
    [['PHENOL'], ['ACYLX'], 'C', ['Heat', 'Toxic gas: HCl'], 'Exothermic with HCl release.'],
  ];
  // three-way hazards: each slot matches a chemical id ('#id') or a group
  const TRIPLES = [
    [['#chloroform'], ['KET'], ['BASE'], ['Heat', 'Runaway'], 'Chloroform, acetone (or another ketone) and a strong base react violently (base-catalysed addition); several plant explosions.'],
    [['NITRITE'], ['AMINE', 'AMIDE'], ['ACIDS', 'SULF', 'ACIDO'], ['Carcinogen: nitrosamines'], 'Nitrite, an amine source and acid together are the classic route to N-nitrosamines. Separate nitrite quench steps from amine and amide solvent streams.'],
    [['NIT'], ['SULF'], ['HC', 'PHENOL', 'ALC', 'AMINE', 'HALO'], ['Nitration', 'Runaway'], 'Mixed acid with an organic: nitration is fast and very exothermic; accumulation of unreacted acid has caused many runaways.'],
  ];
  // chemical list: [id, name, groups, aliases (incl. CAS), solvent page slug, note]
  const C = [
    ['water', 'Water (and moist air)', ['W'], '7732-18-5 moisture humidity', 'water'],
    ['methanol', 'Methanol', ['ALC'], '67-56-1 meoh', 'methanol'], ['ethanol', 'Ethanol', ['ALC'], '64-17-5 etoh', 'ethanol'],
    ['isopropanol', 'Isopropanol (IPA)', ['ALC'], '67-63-0 ipa', 'isopropanol'], ['n-propanol', 'n-Propanol', ['ALC'], '71-23-8', 'n-propanol'],
    ['n-butanol', 'n-Butanol', ['ALC'], '71-36-3', 'n-butanol'], ['isobutanol', 'Isobutanol', ['ALC'], '78-83-1', 'isobutanol'],
    ['sec-butanol', 'sec-Butanol', ['ALC'], '78-92-2', 'sec-butanol'], ['tert-butanol', 'tert-Butanol', ['ALC'], '75-65-0', 'tert-butanol'],
    ['benzyl-alcohol', 'Benzyl alcohol', ['ALC'], '100-51-6', 'benzyl-alcohol'], ['cyclohexanol', 'Cyclohexanol', ['ALC'], '108-93-0', 'cyclohexanol'],
    ['furfuryl-alcohol', 'Furfuryl alcohol (FFA)', ['ALC'], '98-00-0 ffa', 'furfuryl-alcohol', 'Polymerises violently with acids.'],
    ['ethylene-glycol', 'Ethylene glycol (MEG)', ['ALC'], '107-21-1 meg', 'ethylene-glycol'], ['propylene-glycol', 'Propylene glycol', ['ALC'], '57-55-6', 'propylene-glycol'],
    ['diethylene-glycol', 'Diethylene glycol', ['ALC'], '111-46-6', 'diethylene-glycol'], ['glycerol', 'Glycerol', ['ALC'], '56-81-5 glycerine', 'glycerol'],
    ['2-methoxyethanol', '2-Methoxyethanol', ['ALC', 'ETHER'], '109-86-4', '2-methoxyethanol'], ['2-ethoxyethanol', '2-Ethoxyethanol', ['ALC', 'ETHER'], '110-80-5', '2-ethoxyethanol'],
    ['sds', 'Special denatured spirit (SDS)', ['ALC'], '', 'special-denatured-spirit'],
    ['acetone', 'Acetone', ['KET'], '67-64-1', 'acetone'], ['mek', 'Methyl ethyl ketone (MEK)', ['KET'], '78-93-3', 'methyl-ethyl-ketone'],
    ['mibk', 'MIBK', ['KET'], '108-10-1', 'mibk'], ['cyclohexanone', 'Cyclohexanone', ['KET'], '108-94-1', 'cyclohexanone'], ['cyclopentanone', 'Cyclopentanone', ['KET'], '120-92-3', 'cyclopentanone'],
    ['ethyl-acetate', 'Ethyl acetate', ['ESTER'], '141-78-6', 'ethyl-acetate'], ['methyl-acetate', 'Methyl acetate', ['ESTER'], '79-20-9', 'methyl-acetate'],
    ['isopropyl-acetate', 'Isopropyl acetate', ['ESTER'], '108-21-4 ipac', 'isopropyl-acetate'], ['n-propyl-acetate', 'n-Propyl acetate', ['ESTER'], '109-60-4', 'n-propyl-acetate'],
    ['n-butyl-acetate', 'n-Butyl acetate', ['ESTER'], '123-86-4', 'n-butyl-acetate'], ['isobutyl-acetate', 'Isobutyl acetate', ['ESTER'], '110-19-0', 'isobutyl-acetate'],
    ['tert-butyl-acetate', 'tert-Butyl acetate', ['ESTER'], '540-88-5', 'tert-butyl-acetate'], ['methyl-formate', 'Methyl formate', ['ESTER'], '107-31-3', 'methyl-formate'],
    ['ethyl-formate', 'Ethyl formate', ['ESTER'], '109-94-4', 'ethyl-formate'], ['diethyl-carbonate', 'Diethyl carbonate', ['ESTER'], '105-58-8', 'diethyl-carbonate'],
    ['ethyl-acetoacetate', 'Ethyl acetoacetate', ['ESTER', 'KET'], '141-97-9', 'ethyl-acetoacetate'],
    ['thf', 'Tetrahydrofuran (THF)', ['ETHER'], '109-99-9', 'thf', 'Peroxide former: test before distilling; never distil to dryness.'],
    ['2-methf', '2-Methyltetrahydrofuran', ['ETHER'], '96-47-9 2-methf', '2-methyltetrahydrofuran', 'Peroxide former.'],
    ['diethyl-ether', 'Diethyl ether', ['ETHER'], '60-29-7', 'diethyl-ether', 'Peroxide former; autoignition only about 160 °C (hot steam lines can ignite it).'],
    ['diisopropyl-ether', 'Diisopropyl ether (DIPE)', ['ETHER'], '108-20-3 ipe dipe', 'diisopropyl-ether', 'Strong peroxide former: peroxides can explode on storage.'],
    ['mtbe', 'MTBE', ['ETHER'], '1634-04-4', 'mtbe'], ['dibutyl-ether', 'Dibutyl ether', ['ETHER'], '142-96-1', 'dibutyl-ether', 'Peroxide former.'],
    ['dioxane', '1,4-Dioxane', ['ETHER'], '123-91-1', '1-4-dioxane', 'Peroxide former.'], ['dme', '1,2-Dimethoxyethane (DME)', ['ETHER'], '110-71-4', '1-2-dimethoxyethane', 'Peroxide former.'],
    ['diglyme', 'Diglyme', ['ETHER'], '111-96-6', 'diglyme', 'Peroxide former.'], ['methylal', 'Methylal', ['ETHER'], '109-87-5', 'methylal'], ['anisole', 'Anisole', ['ETHER', 'HC'], '100-66-3', 'anisole'],
    ['toluene', 'Toluene', ['HC'], '108-88-3', 'toluene'], ['xylene', 'Xylene', ['HC'], '1330-20-7', 'xylene'], ['benzene', 'Benzene', ['HC'], '71-43-2', 'benzene'],
    ['ethylbenzene', 'Ethylbenzene', ['HC'], '100-41-4', 'ethylbenzene'], ['cumene', 'Cumene', ['HC'], '98-82-8', 'cumene', 'Forms cumene hydroperoxide on long storage in air.'], ['mesitylene', 'Mesitylene', ['HC'], '108-67-8', 'mesitylene'],
    ['n-hexane', 'n-Hexane', ['HC'], '110-54-3', 'n-hexane'], ['n-heptane', 'n-Heptane', ['HC'], '142-82-5', 'n-heptane'], ['n-pentane', 'n-Pentane', ['HC'], '109-66-0', 'n-pentane'],
    ['n-octane', 'n-Octane', ['HC'], '111-65-9', 'n-octane'], ['isooctane', 'Isooctane', ['HC'], '540-84-1', 'isooctane'], ['cyclohexane', 'Cyclohexane', ['HC'], '110-82-7', 'cyclohexane'],
    ['methylcyclohexane', 'Methylcyclohexane', ['HC'], '108-87-2', 'methylcyclohexane'], ['petroleum-ether', 'Petroleum ether', ['HC'], '8032-32-4', 'petroleum-ether'],
    ['dcm', 'Dichloromethane (MDC)', ['HALO'], '75-09-2 mdc methylene chloride', 'dichloromethane'], ['chloroform', 'Chloroform', ['HALO'], '67-66-3', 'chloroform'],
    ['ccl4', 'Carbon tetrachloride', ['HALO'], '56-23-5', 'carbon-tetrachloride'], ['edc', '1,2-Dichloroethane (EDC)', ['HALO'], '107-06-2', '1-2-dichloroethane'],
    ['tce', 'Trichloroethylene', ['HALO'], '79-01-6', 'trichloroethylene'], ['pce', 'Tetrachloroethylene', ['HALO'], '127-18-4 perchloroethylene', 'tetrachloroethylene'],
    ['chlorobenzene', 'Chlorobenzene (MCB)', ['HALO', 'HC'], '108-90-7 mcb', 'chlorobenzene'], ['odcb', 'o-Dichlorobenzene', ['HALO', 'HC'], '95-50-1', 'o-dichlorobenzene'],
    ['epichlorohydrin', 'Epichlorohydrin', ['EPOX', 'HALO'], '106-89-8 eph ech', 'epichlorohydrin'],
    ['ethylene-oxide', 'Ethylene oxide', ['EPOX', 'ETHER'], '75-21-8 eo', 'ethylene-oxide', 'Can polymerise or decompose explosively, even without air.'],
    ['dmf', 'DMF', ['AMIDE'], '68-12-2 dimethylformamide', 'dmf'], ['dmac', 'DMAc', ['AMIDE'], '127-19-5 dimethylacetamide', 'dmac'], ['nmp', 'NMP', ['AMIDE'], '872-50-4', 'nmp'],
    ['formamide', 'Formamide', ['AMIDE'], '75-12-7', 'formamide'], ['dmso', 'DMSO', ['DMSO'], '67-68-5 dimethyl sulfoxide', 'dmso', 'Decomposes exothermically above about 190 °C, and much lower with acids, bases or halides.'],
    ['sulfolane', 'Sulfolane', ['AMIDE'], '126-33-0', 'sulfolane'],
    ['acetonitrile', 'Acetonitrile', ['NITRILE'], '75-05-8 acn mecn', 'acetonitrile'], ['benzonitrile', 'Benzonitrile', ['NITRILE'], '100-47-0', 'benzonitrile'],
    ['nitromethane', 'Nitromethane', ['NITRO'], '75-52-5', 'nitromethane', 'Can detonate; much more sensitive when mixed with bases or amines.'], ['nitrobenzene', 'Nitrobenzene', ['NITRO', 'HC'], '98-95-3', 'nitrobenzene'],
    ['triethylamine', 'Triethylamine (TEA)', ['AMINE', 'BASE'], '121-44-8 tea', 'triethylamine'], ['diethylamine', 'Diethylamine', ['AMINE'], '109-89-7', 'diethylamine'],
    ['diisopropylamine', 'Diisopropylamine', ['AMINE'], '108-18-9 dipa', 'diisopropylamine'], ['dipea', 'DIPEA (Hünig’s base)', ['AMINE', 'BASE'], '7087-68-5 diisopropylethylamine', 'dipea'],
    ['isopropylamine', 'Isopropylamine (MIPA)', ['AMINE'], '75-31-0 mipa', 'isopropylamine'], ['ethylenediamine', 'Ethylenediamine', ['AMINE'], '107-15-3 eda', 'ethylenediamine'],
    ['morpholine', 'Morpholine', ['AMINE'], '110-91-8', 'morpholine'], ['pyridine', 'Pyridine', ['AMINE'], '110-86-1', 'pyridine'], ['aniline', 'Aniline', ['AMINE'], '62-53-3', 'aniline'],
    ['dma', 'N,N-Dimethylaniline', ['AMINE'], '121-69-7', 'n-n-dimethylaniline'], ['ammonia', 'Liquor ammonia (aqueous)', ['AMINE', 'W'], '1336-21-6 ammonium hydroxide', 'liquor-ammonia'],
    ['acetic-acid', 'Acetic acid', ['ACIDO'], '64-19-7', 'acetic-acid'], ['formic-acid', 'Formic acid', ['ACIDO'], '64-18-6', 'formic-acid', 'Decomposes to carbon monoxide with strong acids or on heating.'],
    ['propionic-acid', 'Propionic acid', ['ACIDO'], '79-09-4', 'propionic-acid'], ['tfa', 'Trifluoroacetic acid (TFA)', ['ACIDS', 'ACIDO'], '76-05-1', 'trifluoroacetic-acid'],
    ['msa', 'Methanesulfonic acid', ['ACIDS'], '75-75-2 msa', 'methanesulfonic-acid'], ['ptsa', 'p-Toluenesulfonic acid', ['ACIDS'], '104-15-4 6192-52-5 ptsa', 'p-toluenesulfonic-acid'],
    ['hcl', 'Hydrochloric acid', ['ACIDS', 'HCL', 'W'], '7647-01-0 hcl', 'hydrochloric-acid'], ['h2so4', 'Sulphuric acid (concentrated)', ['ACIDS', 'SULF'], '7664-93-9 sulfuric', 'sulfuric-acid'],
    ['hno3', 'Nitric acid', ['ACIDS', 'NIT', 'OXID'], '7697-37-2', 'nitric-acid'], ['h3po4', 'Phosphoric acid', ['ACIDS'], '7664-38-2', 'phosphoric-acid'],
    ['acetic-anhydride', 'Acetic anhydride', ['ANHYD'], '108-24-7', 'acetic-anhydride'],
    ['pcl3', 'Phosphorus trichloride (PCl3)', ['ACYLX'], '7719-12-2 pcl3', 'phosphorus-trichloride', 'Fumes in air; reacts violently with water. Product phosphorous acid can decompose to phosphine on strong heating.'],
    ['pcl5', 'Phosphorus pentachloride (PCl5)', ['ACYLX'], '10026-13-8 pcl5', 'phosphorus-pentachloride'],
    ['pocl3', 'Phosphorus oxychloride (POCl3)', ['ACYLX'], '10025-87-3 pocl3 phosphoryl chloride', 'phosphorus-oxychloride', 'Quenches are notorious for delayed exotherms: unreacted POCl3 and intermediates can accumulate, then react suddenly.'],
    ['socl2', 'Thionyl chloride', ['ACYLX'], '7719-09-7 socl2', 'thionyl-chloride', 'Gives SO₂ and HCl with water, alcohols and acids: size the scrubber for both gases.'],
    ['so2cl2', 'Sulfuryl chloride', ['ACYLX'], '7791-25-5 so2cl2', 'sulfuryl-chloride'], ['oxalyl-chloride', 'Oxalyl chloride', ['ACYLX'], '79-37-8', 'oxalyl-chloride', 'Gives CO (toxic, odourless) and CO₂ as well as HCl.'],
    ['acetyl-chloride', 'Acetyl chloride', ['ACYLX'], '75-36-5', 'acetyl-chloride'], ['benzoyl-chloride', 'Benzoyl chloride', ['ACYLX'], '98-88-4', 'benzoyl-chloride'],
    ['triphosgene', 'Triphosgene', ['ACYLX'], '32315-10-9 bis(trichloromethyl) carbonate', 'triphosgene', 'Releases phosgene with nucleophiles, moisture and heat: treat as phosgene.'],
    ['tmcs', 'Chlorotrimethylsilane (TMCS)', ['ACYLX'], '75-77-4', 'chlorotrimethylsilane'], ['alcl3', 'Aluminium chloride (anhydrous)', ['ACYLX'], '7446-70-0 alcl3', 'aluminium-chloride'],
    ['ticl4', 'Titanium tetrachloride', ['ACYLX'], '7550-45-0 ticl4', 'titanium-tetrachloride'],
    ['naoh', 'Sodium hydroxide (caustic)', ['BASE'], '1310-73-2 caustic soda lye', 'sodium-hydroxide'], ['koh', 'Potassium hydroxide', ['BASE'], '1310-58-3 caustic potash', 'potassium-hydroxide'],
    ['naome', 'Sodium methoxide (in methanol)', ['BASE', 'ALC'], '124-41-4 sodium methylate', 'sodium-methoxide'], ['kotbu', 'Potassium tert-butoxide', ['BASE'], '865-47-4 ktbuo', 'potassium-tert-butoxide', 'Can self-heat and ignite in moist air.'],
    ['nah', 'Sodium hydride', ['HYDRIDE', 'BASE'], '7646-69-7 nah', 'sodium-hydride'], ['lialh4', 'Lithium aluminium hydride (LAH)', ['HYDRIDE'], '16853-85-3 lah', 'lithium-aluminium-hydride'],
    ['nabh4', 'Sodium borohydride', ['HYDRIDE'], '16940-66-2', 'sodium-borohydride', 'Slowly gives hydrogen even in neutral water and methanol; faster with acid.'], ['nbuli', 'n-Butyllithium (in hexane)', ['HYDRIDE', 'BASE', 'HC'], '109-72-8 buli', 'n-butyllithium', 'Pyrophoric: ignites in air.'],
    ['sodium', 'Sodium metal', ['HYDRIDE'], '7440-23-5', 'sodium-metal'],
    ['h2o2', 'Hydrogen peroxide (30 to 50 %)', ['PEROX', 'W'], '7722-84-1', 'hydrogen-peroxide'], ['naocl', 'Sodium hypochlorite (bleach)', ['HYPO', 'OXID', 'W'], '7681-52-9 bleach', 'sodium-hypochlorite'],
    ['chlorine', 'Chlorine', ['OXID'], '7782-50-5 cl2', 'chlorine'], ['bromine', 'Bromine', ['OXID'], '7726-95-6 br2', 'bromine'], ['kmno4', 'Potassium permanganate', ['OXID'], '7722-64-7', 'potassium-permanganate'],
    ['nano2', 'Sodium nitrite', ['NITRITE'], '7632-00-0', 'sodium-nitrite'], ['nan3', 'Sodium azide', ['AZIDE'], '26628-22-8', 'sodium-azide', 'Forms explosive heavy-metal azides with copper, lead and brass (drains, fittings).'],
    ['nacn', 'Sodium cyanide', ['CYANIDE'], '143-33-9', 'sodium-cyanide'], ['hydrazine', 'Hydrazine hydrate', ['HYDRAZINE'], '7803-57-8 302-01-2', 'hydrazine-hydrate'],
    ['formaldehyde', 'Formaldehyde / formalin', ['ALD', 'W'], '50-00-0 formalin', 'formaldehyde'], ['paraformaldehyde', 'Paraformaldehyde', ['ALD'], '30525-89-4', 'paraformaldehyde'],
    ['phenol', 'Phenol', ['PHENOL'], '108-95-2', 'phenol'], ['cs2', 'Carbon disulfide', ['CS2'], '75-15-0', 'carbon-disulfide', 'Autoignition about 90 °C: a steam line or hot bulb can ignite the vapour.'],
  ];
  const BY = {}; C.forEach(c => { BY[c[0]] = c; });
  const slotHit = (slot, id) => slot.some(x => x[0] === '#' ? x.slice(1) === id : BY[id][2].includes(x));
  function triples(ids) {
    const res = [];
    TRIPLES.forEach((t, k) => { const pick = [];
      for (let s = 0; s < 3; s++) { const m = ids.filter(id => slotHit(t[s], id) && !pick.includes(id)); if (!m.length) return; pick.push(m[0]); }
      res.push({ k, ids: pick }); });
    return res;
  }
  window.PCME_MIX = { C, BY, RULES, G, TRIPLES };

  function pairHazards(a, b) {
    const ga = BY[a][2], gb = BY[b][2], out = [];
    RULES.forEach((r, i) => {
      const hit = (r[0].some(x => ga.includes(x)) && r[1].some(x => gb.includes(x))) || (r[0].some(x => gb.includes(x)) && r[1].some(x => ga.includes(x)));
      if (hit) out.push(i);
    });
    return out;
  }
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const root = document.getElementById('mx-app'); if (!root) return;
  const base = root.dataset.base || '';
  let sel = [];
  root.innerHTML = `
    <div class="mx-in"><label for="mx-q">Add chemicals (name, abbreviation or CAS number)</label>
      <div class="mx-search"><input id="mx-q" type="search" autocomplete="off" placeholder="e.g. POCl3, DMF, 7719-09-7, water"><div class="mx-list" id="mx-list" hidden></div></div>
      <div class="mx-quick"><button type="button" data-add="water">+ Water / moist air</button><button type="button" id="mx-clear">Clear all</button></div>
      <div class="mx-chips" id="mx-chips"></div></div>
    <div id="mx-out" aria-live="polite"></div>`;
  const q = root.querySelector('#mx-q'), list = root.querySelector('#mx-list'), out = root.querySelector('#mx-out');
  function score(c, w) {
    const n = c[1].toLowerCase(), al = (c[3] || '').toLowerCase(), ws = (n + ' ' + al).split(/[^a-z0-9-]+/);
    const wd = w.replace(/-/g, '');
    if (ws.includes(w)) return 0; if (n.startsWith(w)) return 1; if (ws.some(x => x.startsWith(w))) return 2;
    if ((n + ' ' + al).includes(w)) return 3; if (/^[\d-]{4,}$/.test(w) && al.replace(/-/g, '').includes(wd)) return 3; return 9;
  }
  function showList() {
    const w = q.value.trim().toLowerCase(); if (!w) { list.hidden = true; return; }
    const m = C.filter(c => !sel.includes(c[0])).map(c => [c, score(c, w)]).filter(x => x[1] < 9).sort((a, b) => a[1] - b[1] || a[0][1].localeCompare(b[0][1])).slice(0, 10);
    list.innerHTML = m.length ? m.map(x => `<button type="button" class="mx-opt" data-add="${x[0][0]}">${esc(x[0][1])}</button>`).join('') : '<div class="mx-opt mx-none">Not in the list. Check its SDS section 10 (stability and reactivity).</div>';
    list.hidden = false;
  }
  function add(id) { if (BY[id] && !sel.includes(id)) sel.push(id); q.value = ''; list.hidden = true; render(); }
  root.addEventListener('click', e => {
    const a = e.target.closest('[data-add]'); if (a) { add(a.dataset.add); q.focus(); return; }
    const r = e.target.closest('[data-rm]'); if (r) { sel = sel.filter(x => x !== r.dataset.rm); render(); return; }
    if (e.target.id === 'mx-clear') { sel = []; render(); }
    if (e.target.id === 'mx-print') window.print();
  });
  q.addEventListener('input', showList); q.addEventListener('focus', showList);
  q.addEventListener('keydown', e => { if (e.key === 'Enter') { const f = list.querySelector('[data-add]'); if (f) { e.preventDefault(); add(f.dataset.add); } } if (e.key === 'Escape') list.hidden = true; });
  document.addEventListener('click', e => { if (!root.contains(e.target)) list.hidden = true; });
  const TAB = () => window.PCE_COMPAT_TAB;
  function sync() { if (TAB() && TAB() !== 'chemical') return; const qs = [TAB() ? 'tab=chemical' : '', sel.length ? 'c=' + sel.join('|') : ''].filter(Boolean).join('&');
    try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '')); } catch (e) { } }
  function pdfSpec() {
    if (sel.length < 2) return { error: 'Add two or more chemicals first.' };
    const rows = [], tri = sel.length > 2 ? triples(sel) : [];
    tri.forEach(t => { const r = TRIPLES[t.k]; rows.push([t.ids.map(id => BY[id][1]).join(' + '), 'Dangerous together', r[4] || '']); });
    const pairs = [];
    for (let i = 0; i < sel.length; i++) for (let j = i + 1; j < sel.length; j++) { const h = pairHazards(sel[i], sel[j]); pairs.push({ a: sel[i], b: sel[j], h, sev: h.some(k => RULES[k][2] === 'D') ? 'D' : h.length ? 'C' : 'N' }); }
    pairs.sort((x, y) => ({ D: 0, C: 1, N: 2 }[x.sev] - { D: 0, C: 1, N: 2 }[y.sev]));
    pairs.forEach(p => rows.push([BY[p.a][1] + ' + ' + BY[p.b][1], p.sev === 'D' ? 'Dangerous' : p.sev === 'C' ? 'Caution' : 'No reaction listed', p.h.map(k => RULES[k][3].join(', ') + ': ' + RULES[k][4]).join(' ')]));
    return { title: 'Chemical\u2013chemical compatibility', sub: 'Mixing hazard screening by reactive group, pair by pair',
      sections: [{ title: 'Chemicals', head: ['No.', 'Chemical'], widths: [0.12, 0.88], rows: sel.map((id, i) => [String(i + 1), BY[id][1]]) },
        { title: 'Combinations', head: ['Combination', 'Result', 'What happens'], widths: [0.28, 0.16, 0.56], bold: [1], rows }],
      notes: ['Screening tool working by reactive group: it does not know concentrations, temperatures or order of addition. "No reaction listed" does not mean safe. Read section 10 of each SDS and test new combinations (DSC or reaction calorimetry) before scale-up.', 'Sources: Hatayama et al., EPA-600/2-80-076 (1980); CCPS/NOAA Chemical Reactivity Worksheet; Bretherick\u2019s Handbook of Reactive Chemical Hazards.'] };
  }
  window.PCEMix = { name: id => (BY[id] ? BY[id][1] : id), get: () => sel.slice(), set: ids => { sel = ids.filter(id => BY[id]).filter((id, i, a) => a.indexOf(id) === i); render(); }, sync: () => sync(), pdf: pdfSpec };
  function render() {
    sync();
    root.querySelector('#mx-chips').innerHTML = sel.map(id => `<span class="mx-chip">${esc(BY[id][1])}<button type="button" data-rm="${id}" aria-label="Remove ${esc(BY[id][1])}">×</button></span>`).join('');
    if (sel.length < 2) { out.innerHTML = `<div class="mx-empty">${sel.length ? 'Add at least one more chemical to check the mixture.' : 'Add two or more chemicals that could meet: in a reactor, a quench, a common vent header, a waste drum or a spill. Include water or moist air if it can get in.'}</div>` + notesHtml(); return; }
    const pairs = [];
    for (let i = 0; i < sel.length; i++) for (let j = i + 1; j < sel.length; j++) {
      const h = pairHazards(sel[i], sel[j]); const sev = h.some(k => RULES[k][2] === 'D') ? 'D' : h.length ? 'C' : 'N';
      pairs.push({ a: sel[i], b: sel[j], h, sev });
    }
    const tri = sel.length > 2 ? triples(sel) : [];
    const nD = pairs.filter(p => p.sev === 'D').length + tri.length, nC = pairs.filter(p => p.sev === 'C').length;
    let html = `<div class="mx-sum ${nD ? 'd' : nC ? 'c' : 'n'}"><b>${nD ? nD + ' dangerous combination' + (nD > 1 ? 's' : '') : nC ? 'No dangerous combinations listed' : 'No reaction hazard listed'}</b>${nC ? ` &middot; ${nC} needing caution` : ''}<span>${pairs.length} pair${pairs.length > 1 ? 's' : ''} checked</span></div>`;
    if (sel.length > 2 && sel.length <= 10) {
      html += `<div class="mx-gridwrap"><table class="mx-grid"><tr><th></th>${sel.map((id, k) => `<th title="${esc(BY[id][1])}">${k + 1}</th>`).join('')}</tr>` +
        sel.map((a, i) => `<tr><th class="rh">${i + 1}. ${esc(BY[a][1])}</th>${sel.map((b, j) => { if (i === j) return '<td class="x"></td>'; const p = pairs.find(p => (p.a === a && p.b === b) || (p.a === b && p.b === a)); return `<td class="${p.sev.toLowerCase()}" title="${esc(BY[a][1])} + ${esc(BY[b][1])}">${p.sev === 'D' ? '!' : p.sev === 'C' ? '·' : ''}</td>`; }).join('')}</tr>`).join('') + '</table></div>';
    }
    html += tri.map(t => { const r = TRIPLES[t.k]; return `<div class="mx-pair d"><div class="mx-ph"><b>${t.ids.map(id => esc(BY[id][1])).join(' + ')}</b><span class="mx-tag d">Dangerous together</span></div><div class="mx-r"><div class="mx-eff">${r[3].map(x => `<span>${esc(x)}</span>`).join('')}</div><p>${esc(r[4])}</p></div></div>`; }).join('');
    pairs.sort((x, y) => ({ D: 0, C: 1, N: 2 }[x.sev] - { D: 0, C: 1, N: 2 }[y.sev]));
    html += pairs.map(p => `<div class="mx-pair ${p.sev.toLowerCase()}"><div class="mx-ph"><b>${esc(BY[p.a][1])} + ${esc(BY[p.b][1])}</b><span class="mx-tag ${p.sev.toLowerCase()}">${p.sev === 'D' ? 'Dangerous' : p.sev === 'C' ? 'Caution' : 'No reaction listed'}</span></div>` +
      (p.h.length ? p.h.map(k => { const r = RULES[k]; return `<div class="mx-r"><div class="mx-eff">${r[3].map(t => `<span>${esc(t)}</span>`).join('')}</div><p>${esc(r[4])}</p></div>`; }).join('') : '<p class="mx-mute">No hazardous reaction is listed for these two groups. That is not proof the mixture is safe: check both SDSs (section 10) and test before scale-up.</p>') + '</div>').join('');
    html += notesHtml() + `<div class="mx-act"><button type="button" class="btn btn-outline btn-sm" id="mx-print">Print / save as PDF</button></div>`;
    out.innerHTML = html;
  }
  function notesHtml() {
    const n = sel.filter(id => BY[id][5]); const pages = sel.filter(id => BY[id][4]);
    return (n.length ? `<h3 class="mx-h">Notes on the chemicals themselves</h3>` + n.map(id => `<p class="mx-note"><b>${esc(BY[id][1])}:</b> ${esc(BY[id][5])}</p>`).join('') : '') +
      (pages.length ? `<p class="mx-links">Property pages: ${pages.map(id => `<a href="${base}/solvents/${BY[id][4]}/">${esc(BY[id][1])}</a>`).join(' · ')}</p>` : '');
  }
  try { const c = (!TAB() || TAB() === 'chemical') && new URLSearchParams(location.search).get('c'); if (c) c.split('|').forEach(id => { if (BY[id] && !sel.includes(id)) sel.push(id); }); } catch (e) { }
  render();
})();
