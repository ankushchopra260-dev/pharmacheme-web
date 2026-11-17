const OCL=require('openchemlib');const fs=require('fs');const H=require('/home/claude/pharmacheme-web/assets/js/hr-core.js');
const R=JSON.parse(fs.readFileSync('reliable_g.json'));const out=[];
const AT={H:52.103,C:171.29,N:112.97,O:59.555,F:18.97,Cl:28.992,Br:26.74,I:25.52};
for(const o of R){try{const m=OCL.Molecule.fromSmiles(o.smi);const f=m.getMolecularFormula().formula;
 const el={};for(const [_,e,n] of f.matchAll(/([A-Z][a-z]?)(\d*)/g))el[e]=(el[e]||0)+(n?+n:1);
 if(Object.keys(el).some(e=>!(e in AT)))continue;
 let atom=0;for(const e in el)atom+=AT[e]*el[e];
 const b=H.bondTypes(OCL,m);out.push({n:o.name,smi:o.smi,atomz:atom-o.g,b,g:o.g})}catch(e){}}
fs.writeFileSync('bonds.json',JSON.stringify(out));console.log(out.length);
