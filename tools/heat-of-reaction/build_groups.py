import yaml, re, json, os
D='/usr/local/lib/python3.13/site-packages/pgradd/data/BensonGA/gas_benson/'
def canon(name):
    m=re.match(r'^([A-Za-z]+(?:\[[A-Za-z.]+\])?)(.*)$',name)
    center,rest=m.group(1),m.group(2)
    ligs=[]
    for lig,n in re.findall(r'\(([^()]+)\)(\d*)',rest):
        ligs += [lig]*(int(n) if n else 1)
    return center+'|'+','.join(sorted(ligs))
groups={}; other={}
for f in ['hydrocarbons.yaml','oxygenates.yaml','nitrogenates.yaml']:
    d=yaml.safe_load(open(D+f))
    for k,v in d['groups'].items():
        h=(v.get('thermochem') or {}).get('H_ref')
        if h is None: continue
        groups[canon(k)]={'v':float(h),'n':k,'src':'Benson 1976'}
for f in ['strain.yaml','corrections.yaml']:
    d=yaml.safe_load(open(D+f))
    for sec in ('other_descriptors','groups'):
        for k,v in (d.get(sec) or {}).items():
            h=(v.get('thermochem') or {}).get('H_ref')
            if h is not None: other[k]=float(h)
# remaps from scheme
sch=yaml.safe_load(open('/usr/local/lib/python3.13/site-packages/pgradd/data/BensonGA/scheme.yaml'))
remaps={}
for k,v in sch['remaps'].items():
    if len(v)==1 and v[0][0]==1 and '(' in k and '(' in v[0][1]:
        remaps[canon(k)]=canon(v[0][1])
json.dump({'groups':groups,'other':other,'remaps':remaps},open('benson.json','w'),indent=0)
print(len(groups),len(other),len(remaps))
print(sorted(other.items())[:60])
