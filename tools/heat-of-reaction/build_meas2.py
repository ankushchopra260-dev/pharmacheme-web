import json, math, warnings, re
warnings.filterwarnings('ignore')
from chemicals import reaction
from chemicals.identifiers import search_chemical, int_to_CAS
reaction._load_reaction_data()
cv=lambda x: x if isinstance(x,str) else int_to_CAS(int(x))
def collect(srcs, col):
    out={}
    for s,df in srcs.items():
        if s in ('TRC','JOBACK') or col not in df.columns: continue
        for c in df.index:
            try: v=float(df.loc[c,col])
            except Exception: continue
            if math.isnan(v): continue
            out.setdefault(cv(c),{})[s]=round(v/4184,3)
    return out
G=collect(reaction.Hfg_sources,'Hfg'); L=collect(reaction.Hfl_sources,'Hfl')
S=collect(reaction.Hfs_sources,'Hfs') if hasattr(reaction,'Hfs_sources') else {}
cas=set(G)|set(L)|set(S)
ok_el=set('C H N O S F Cl Br I P Si B'.split())
rows=[]
for c in cas:
    try: ch=search_chemical(c)
    except Exception: continue
    if not ch.smiles or '.' in ch.smiles: continue
    if not set(re.findall(r'[A-Z][a-z]?',ch.formula or ''))<=ok_el: continue
    if re.search(r'\[\d+[A-Z]',ch.smiles): continue
    rows.append({'cas':c,'name':ch.common_name or ch.iupac_name,'smi':ch.smiles,'g':G.get(c,{}),'l':L.get(c,{}),'s':S.get(c,{})})
json.dump(rows,open('meas_all.json','w'))
print(len(rows), sum(1 for r in rows if r['g']), sum(1 for r in rows if r['l']), sum(1 for r in rows if r['s']))
