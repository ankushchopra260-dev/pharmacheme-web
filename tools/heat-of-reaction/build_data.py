import json,re
B=json.load(open('benson.json'))
groups=B['groups']; other=B['other']; remaps=B['remaps']
# --- normalise pgradd names that omit implied ligands ---
fix={}
for k,v in list(groups.items()):
    c,l=k.split('|'); L=l.split(',') if l else []
    if c=='C[B]' and len(L)==1: L=L+['C[B]','C[B]']
    elif c=='C[t]' and len(L)==1 and L!=['C[t]']: L=L+['C[t]']
    elif c=='C[d]' and len(L)==2 and 'C[d]' not in L: L=L+['C[d]']
    elif c=='C[d]' and len(L)==1: L=L+['C[d]']
    nk=c+'|'+','.join(sorted(L))
    if nk!=k: del groups[k]; groups[nk]=v
# Benson's methyl convention etc. are in remaps (canonical). normalise remap targets too
# --- RMG halogen groups (Cs, CO, Cb, Cd centres) ---
rmg=json.load(open('rmg_groups.json'))
tok=re.compile(r'Cs|Cd|Ct|Cb|CO|Cl|Br|C|H|O|F|I')
MAP={'Cs':'C','Cd':'C[d]','Ct':'C[t]','Cb':'C[B]','CO':'CO','C':'*C','H':'H','O':'O','Cl':'Cl','Br':'Br','F':'F','I':'I'}
added=0
for lab,v,desc in rmg:
    if re.search(r'J|singlet|[()\-]|Cdd|C2s|N|S',lab) and lab not in ('Cb-Cl','Cb-Br','Cb-F'): continue
    if not re.search('Cl|Br|F',lab): continue
    if lab in ('Cb-Cl','Cb-Br','Cb-F'):
        k='C[B]|'+','.join(sorted(['C[B]','C[B]',lab[3:]]))
    else:
        t=tok.findall(lab)
        if ''.join(t)!=lab: continue
        c=t[0]; L=[MAP[x] for x in t[1:]]
        if c=='Cs': center='C'
        elif c=='CO': center='CO'; 
        elif c=='Cd': center='C[d]'
        else: continue
        if center=='CO':
            if 'O' not in L: continue
            L.remove('O')            # the carbonyl oxygen
            if len(L)!=2: continue
        elif center=='C':
            if len(L)!=4: continue
        elif center=='C[d]':
            if len(L)!=3: continue
            # one carbon ligand is the double-bond partner
            if 'C[d]' in L: pass
            elif '*C' in L: L[L.index('*C')]='C[d]'
            else: continue
        k=center+'|'+','.join(sorted(L))
    if k in groups: continue
    groups[k]={'v':round(v,2),'n':lab,'src':'RMG-database'}; added+=1
print('rmg halogen groups',added)
# Benson equivalences for vinyl ethers/enamines and allenes (Benson 1976 conventions)
remaps.update({'C[d]|C[d],H,O':'C[d]|C,C[d],H','C[d]|C,C[d],O':'C[d]|C,C,C[d]','C[d]|C[d],H,N':'C[d]|C,C[d],H','C[d]|C,C[d],N':'C[d]|C,C,C[d]',
  'C[d]|C[a],H,H':'C[d]|C[d],H,H','C[d]|C,C[a],H':'C[d]|C,C[d],H','C[d]|C,C,C[a]':'C[d]|C,C,C[d]'})
if 'C[a]|' in groups: groups['C[a]|C[d],C[d]']=groups.pop('C[a]|')
json.dump({'groups':groups,'other':other,'remaps':remaps},open('groups_base.json','w'),indent=0)
print(len(groups))
