const OCL=require('openchemlib');const fs=require('fs');const H=require('/home/claude/pharmacheme-web/assets/js/hr-core.js');
const D=JSON.parse(fs.readFileSync(process.argv[2]||'groups_all.json'));const R=JSON.parse(fs.readFileSync('reliable_g.json'));
let st=[],miss={};
for(const o of R){let r;try{r=H.groupAdditivity(OCL,D,OCL.Molecule.fromSmiles(o.smi))}catch(e){miss['ERR '+e]=(miss['ERR '+e]||0)+1;continue}
 if(r.missing.length){for(const m of r.missing)miss[m]=(miss[m]||0)+1;continue}
 st.push({n:o.name,smi:o.smi,meas:o.g,ga:r.value,err:r.value-o.g,poly:r.notes.some(x=>/fused/.test(x)),approx:r.notes.some(x=>/treated|any carbon/.test(x)),src:[...new Set(r.terms.map(t=>t.src))].join('+')})}
function sum(a,l){const ab=a.map(s=>Math.abs(s.err)).sort((x,y)=>x-y);if(!ab.length)return;const q=p=>ab[Math.floor(p*(ab.length-1))].toFixed(2);console.log(l.padEnd(28),'n',String(ab.length).padStart(4),'MAE',(ab.reduce((x,y)=>x+y,0)/ab.length).toFixed(2),'median',q(.5),'p90',q(.9),'p95',q(.95),'max',q(1))}
sum(st,'all covered');sum(st.filter(s=>!s.poly&&!s.approx),'no poly/approx');sum(st.filter(s=>s.poly),'polycyclic');sum(st.filter(s=>s.approx),'approx ligands');sum(st.filter(s=>/RMG/.test(s.src)),'uses RMG halogen');
console.log('missing',Object.entries(miss).sort((a,b)=>b[1]-a[1]).slice(0,25));
if(process.argv[3]){st.sort((a,b)=>Math.abs(b.err)-Math.abs(a.err));for(const s of st.slice(0,+process.argv[3]))console.log(s.err.toFixed(1),s.meas.toFixed(1),s.n.slice(0,32),s.smi.slice(0,50),s.poly?'P':'',s.approx?'A':'')}
fs.writeFileSync('eval_out.json',JSON.stringify(st));
