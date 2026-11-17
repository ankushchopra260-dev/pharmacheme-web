import json,numpy as np,collections
d=json.load(open('bonds.json'))
SMALL=['H–H','O=O','N≡N','Cl–Cl','Br–Br','I–I','F–F','H–Cl','H–Br','H–I','H–F','O–H (water)','N–H (ammonia)','C=O (CO2)','C≡O (CO)']
fixed={}
for o in d:
    b={k:v for k,v in o['b'].items() if v}
    if len(b)==1 and list(b)[0] in SMALL: k=list(b)[0]; fixed[k]=round(o['atomz']/b[k],2)
# Br2 and I2 are liquid/solid at 298 K; their reliable gas values are what we need (ATcT gas). check presence
print('fixed',fixed)
mols=collections.Counter()
for o in d:
    for k,v in o['b'].items():
        if v and k not in SMALL: mols[k]+=1
types=[k for k,c in mols.items() if c>=4]
sel=[o for o in d if o['b'] and all((k in types) for k,v in o['b'].items() if v) and not any(k in SMALL for k,v in o['b'].items() if v)]
X=np.array([[o['b'].get(k,0) for k in types] for o in sel],float); y=np.array([o['atomz'] for o in sel])
w=np.ones(len(y))
for it in range(30):
    W=np.sqrt(w); b,*_=np.linalg.lstsq(X*W[:,None],y*W,rcond=None); r=y-X@b
    s=1.4826*np.median(abs(r)); w=np.where(abs(r)<=2*s,1,2*s/np.maximum(abs(r),1e-9))
r=y-X@b
print('molecules',len(y),'MAE',np.mean(abs(r)).round(2),'median',np.median(abs(r)).round(2),'p90',np.percentile(abs(r),90).round(2))
vals=dict(zip(types,[round(float(v),2) for v in b])); vals.update(fixed)
for k in sorted(vals,key=lambda k:-mols.get(k,99)): print(f'{k:24s}{vals[k]:8.2f}  n={mols.get(k,1)}')
json.dump(vals,open('bond_fit.json','w'),ensure_ascii=False)
