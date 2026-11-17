# Heat of reaction data build

Builds `assets/data/hr-model.json` (group values, ring/cis/ortho corrections, fitted bond enthalpies, heat-of-vaporisation model) and `assets/data/hr-measured.json` (measured heats of formation keyed by OpenChemLib idcode).

Sources: Benson 1976 group values via the `pgradd` package (BensonGA library); halogen groups from RMG-database `input/thermo/groups/group.py`; measured values from the `chemicals` package (ATcT, CRC, NIST WebBook, NIST-JANAF, API TDB, Yaws; TRC excluded after cross-checking).

Order: build_groups.py → build_data.py → derive.py → build_meas2.py → idc2.js → (dedupe, see commit notes) → vapfeat.js + fit → bondfeat.js + fitbonds.py → build_final.js. eval.js and rxn_val.js report accuracy. Scripts expect a working folder with openchemlib@9.25 installed.
