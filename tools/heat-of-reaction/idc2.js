const OCL=require('openchemlib');const fs=require('fs');
const d=JSON.parse(fs.readFileSync('meas_all.json'));const out=[];
for(const o of d){try{if(o.smi==='[HH]')o.smi='[H][H]';const m=OCL.Molecule.fromSmiles(o.smi);if(m.getFragments().length!==1)continue;
 let net=0,rad=0,bad=false;for(let i=0;i<m.getAllAtoms();i++){const q=m.getAtomCharge(i);net+=q;rad+=m.getAtomRadical(i);if(q&&!((q===1&&m.getAtomLabel(i)==='N')||(q===-1&&m.getAtomLabel(i)==='O')))bad=true}
 if(rad||net||bad)continue;
 o.idc=m.getIDCode();o.mw=+m.getMolecularFormula().relativeWeight.toFixed(3);o.formula=m.getMolecularFormula().formula;out.push(o)}catch(e){}}
fs.writeFileSync('meas_all_idc.json',JSON.stringify(out));console.log(out.length);
