const OCL=require('openchemlib');const fs=require('fs');const H=require('/home/claude/pharmacheme-web/assets/js/hr-core.js');
const d=JSON.parse(fs.readFileSync('meas_dedup.json'));const out=[];
const med=o=>{const v=Object.values(o);if(!v.length)return null;if(o.ATCT_G!==undefined)return o.ATCT_G;if(o.ATCT_L!==undefined)return o.ATCT_L;v.sort((a,b)=>a-b);return v[Math.floor(v.length/2)]};
const spread=o=>{const v=Object.values(o);return v.length?Math.max(...v)-Math.min(...v):99};
for(const o of d){if(!Object.keys(o.g).length||!Object.keys(o.l).length)continue;
 const g=med(o.g),l=med(o.l);const hv=g-l; if(!(hv>0&&hv<40))continue; if(spread(o.g)>2||spread(o.l)>2)continue;
 try{const f=H.vapFeatures(OCL,OCL.Molecule.fromSmiles(o.smi));if(f.S||f.Narom>1)continue;out.push({n:o.name,smi:o.smi,hv,f})}catch(e){}}
fs.writeFileSync('vap.json',JSON.stringify(out));console.log(out.length);
