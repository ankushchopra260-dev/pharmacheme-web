const OCL=require('openchemlib');const fs=require('fs');const H=require('/home/claude/pharmacheme-web/assets/js/hr-core.js');
const Mdl=JSON.parse(fs.readFileSync('/home/claude/pharmacheme-web/assets/data/hr-model.json'));const Meas=JSON.parse(fs.readFileSync('/home/claude/pharmacheme-web/assets/data/hr-measured.json'));
const R=[
['Ethylene + H2','C=C.[HH]>>CC'],['Propene + H2','CC=C.[HH]>>CCC'],['Acetone + H2','CC(C)=O.[HH]>>CC(C)O'],['Acetaldehyde + H2','CC=O.[HH]>>CCO'],
['Benzene + 3H2','c1ccccc1.3[HH]>>C1CCCCC1'],['Nitrobenzene + 3H2','c1ccccc1[N+](=O)[O-].3[HH]>>Nc1ccccc1.2O'],['Styrene + H2','C=Cc1ccccc1.[HH]>>CCc1ccccc1'],
['Cyclohexanone + H2','O=C1CCCCC1.[HH]>>OC1CCCCC1'],['Acetic acid + methanol','CC(=O)O.CO>>COC(C)=O.O'],['Acetic acid + ethanol','CC(=O)O.CCO>>CCOC(C)=O.O'],
['Acetic acid + n-butanol','CC(=O)O.CCCCO>>CCCCOC(C)=O.O'],['Acetic anhydride hydrolysis','CC(=O)OC(C)=O.O>>2CC(=O)O'],['Ethyl acetate hydrolysis','CCOC(C)=O.O>>CC(=O)O.CCO'],
['Acetic acid + NH3 -> acetamide','CC(=O)O.N>>CC(N)=O.O'],['Methane chlorination','C.ClCl>>CCl.Cl'],['Benzene chlorination','c1ccccc1.ClCl>>Clc1ccccc1.Cl'],
['Toluene side-chain chlorination','Cc1ccccc1.ClCl>>ClCc1ccccc1.Cl'],['Methanol to formaldehyde','2CO.O=O>>2C=O.2O'],['Ethanol to acetaldehyde','2CCO.O=O>>2CC=O.2O'],
['Benzene nitration','c1ccccc1.O[N+](=O)[O-]>>c1ccccc1[N+](=O)[O-].O'],['Toluene nitration (para)','Cc1ccccc1.O[N+](=O)[O-]>>Cc1ccc(cc1)[N+](=O)[O-].O'],
['Benzene + ethylene','c1ccccc1.C=C>>CCc1ccccc1'],['Benzene + acetyl chloride','c1ccccc1.CC(Cl)=O>>CC(=O)c1ccccc1.Cl'],['Butadiene + ethylene','C=CC=C.C=C>>C1CC=CCC1'],
['Ethylene hydration','C=C.O>>CCO'],['Ethanol to diethyl ether','2CCO>>CCOCC.O'],['Ethylene oxide','2C=C.O=O>>2C1CO1'],['Methanol + CO','CO.[C-]#[O+]>>CC(=O)O'],
['Phenol + methanol','Oc1ccccc1.CO>>COc1ccccc1.O'],['Isobutene + methanol (MTBE)','CC(C)=C.CO>>COC(C)(C)C'],['Acetone condensation (to mesityl oxide)','2CC(C)=O>>CC(C)=CC(C)=O.O'],
['Aniline acetylation','Nc1ccccc1.CC(=O)OC(C)=O>>CC(=O)Nc1ccccc1.CC(=O)O'],['Benzyl chloride hydrolysis','ClCc1ccccc1.O>>OCc1ccccc1.Cl'],['Methyl chloride + ammonia','CCl.N>>CN.Cl'],
];
const rows=[];
for(const [n,rx] of R){const [l,r]=rx.split('>>');const comps=[];
 for(const [side,sgn] of [[l,-1],[r,1]])for(let t of side.split('.')){let k=1;const m=t.match(/^(\d+)(.*)$/);if(m&&!/^\d/.test(m[2])&&!t.startsWith('[')){k=+m[1];t=m[2]}comps.push({c:H.compound(OCL,Mdl,Meas,t),nu:sgn*k,phase:'g',label:t})}
 const res=H.reaction(Mdl,comps);
 if(res.unbalanced.length){console.log('UNBAL',n,res.unbalanced);continue}
 if(!res.ok){console.log('NOT OK',n,res.msgs);continue}
 if(!res.measAll){console.log('no meas',n,comps.filter(c=>!(c.c.meas&&c.c.meas[3])).map(c=>c.label));continue}
 rows.push({n,meas:res.gasMeas,ga:res.gaAll?res.gasGA:null,be:res.beAll?res.gasBE:null});}
for(const r of rows)console.log(r.n.padEnd(36),r.meas.toFixed(1).padStart(7),r.ga!=null?(r.ga-r.meas).toFixed(1).padStart(6):'   —  ',r.be!=null?(r.be-r.meas).toFixed(1).padStart(6):'   —');
const st=(k)=>{const e=rows.filter(r=>r[k]!=null).map(r=>Math.abs(r[k]-r.meas)).sort((a,b)=>a-b);return `n=${e.length} MAE ${(e.reduce((a,b)=>a+b,0)/e.length).toFixed(1)} median ${e[Math.floor(e.length/2)].toFixed(1)} max ${e[e.length-1].toFixed(1)}`};
console.log('GA',st('ga'));console.log('BE',st('be'));fs.writeFileSync('rxn_val.json',JSON.stringify(rows));
