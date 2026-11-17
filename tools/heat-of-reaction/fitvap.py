# Fit the heat-of-vaporisation (298 K) model from vap.json (written by vapfeat.js); writes vap_model.json and prints 5-fold CV error.
import json,numpy as np
d=json.load(open('vap.json'))
keys=[k for k in d[0]['f'] if k!='S']
X=np.array([[o['f'][k] for k in keys]+[1.0] for o in d]); y=np.array([o['hv'] for o in d])
used=[i for i in range(len(keys)) if X[:,i].any()]+[len(keys)]
names=[keys[i] for i in used[:-1]]+['const']; X=X[:,used]
w=np.ones(len(y))
for it in range(20):
    W=np.sqrt(w); b,*_=np.linalg.lstsq(X*W[:,None],y*W,rcond=None); r=y-X@b
    s=1.4826*np.median(abs(r)); w=np.where(abs(r)<=1.5*s,1,1.5*s/abs(r))
idx=np.random.default_rng(1).permutation(len(y)); errs=[]
for k in range(5):
    te=idx[k::5]; tr=np.setdiff1d(idx,te); bb,*_=np.linalg.lstsq(X[tr],y[tr],rcond=None); errs+=list(abs(y[te]-X[te]@bb))
print('n',len(y),'CV MAE',round(float(np.mean(errs)),2),'median',round(float(np.median(errs)),2),'p90',round(float(np.percentile(errs,90)),2))
json.dump(dict(zip(names,[round(float(v),4) for v in b])),open('vap_model.json','w'))
