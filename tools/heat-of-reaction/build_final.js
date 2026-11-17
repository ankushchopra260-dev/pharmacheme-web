const OCL=require('openchemlib');const fs=require('fs');const H=require('/home/claude/pharmacheme-web/assets/js/hr-core.js');
const G=JSON.parse(fs.readFileSync('groups_all.json'));const vap=JSON.parse(fs.readFileSync('vap_model.json'));const bonds=JSON.parse(fs.readFileSync('bond_fit.json'));
const rows=JSON.parse(fs.readFileSync('meas_dedup.json'));
const SRC={ATCT_G:'a',ATCT_L:'a',CRC:'c',API_TDB_G:'p',WEBBOOK:'w',JANAF:'j',YAWS:'y'};
const NAME={'7647-01-0':'hydrogen chloride','10035-10-6':'hydrogen bromide','7664-39-3':'hydrogen fluoride','7732-18-5':'water','1333-74-0':'hydrogen'};
function vapEst(f){let s=vap.const;for(const k in vap)if(k!=='const')s+=vap[k]*(f[k]||0);return s}
function pick(srcs,ga,isGas){
  const ks=Object.keys(srcs);if(!ks.length)return null;
  for(const a of ['ATCT_G','ATCT_L'])if(srcs[a]!==undefined)return {v:srcs[a],s:'a',n:ks.length,flag:''};
  const nonY=ks.filter(k=>k!=='YAWS');const use=nonY.length?nonY:ks;
  const v=use.map(k=>srcs[k]).sort((a,b)=>a-b);const spread=v[v.length-1]-v[0];
  let val=v.length%2?v[(v.length-1)/2]:(v[v.length/2-1]+v[v.length/2])/2, src=use.map(k=>SRC[k]).join(''), flag='';
  if(spread>3){ if(ga!=null){const best=use.reduce((b,k)=>Math.abs(srcs[k]-ga)<Math.abs(srcs[b]-ga)?k:b,use[0]);val=srcs[best];src=SRC[best];flag='D'+spread.toFixed(1);}
    else flag='d'+spread.toFixed(1); }
  return {v:+val.toFixed(2),s:src,n:use.length,flag};
}
const out={};let nf=0,stats={g:0,l:0,s:0,flag:0,gaConflict:0};
for(const o of rows){
  const m=OCL.Molecule.fromSmiles(o.smi);let ga=null,gaClean=false;
  try{const r=H.groupAdditivity(OCL,G,m);if(!r.missing.length){ga=r.value;gaClean=!r.notes.length}}catch(e){}
  const g=pick(o.g,gaClean?ga:null,true), l=pick(o.l,null,false), s=pick(o.s,null,false);
  if(!g&&!l&&!s)continue;
  if(g&&l){const hv=g.v-l.v;let est=null;try{est=vapEst(H.vapFeatures(OCL,m))}catch(e){}
    if(!(g.s==='a'&&l.s==='a')&&(hv<0||hv>45||(est!=null&&Math.abs(hv-est)>8))){l.flag=(l.flag?l.flag+';':'')+'v'+hv.toFixed(1);}}
  if(g&&gaClean&&Math.abs(g.v-ga)>8&&g.s!=='ATcT'){g.flag=(g.flag?g.flag+';':'')+'g'+ga.toFixed(1);stats.gaConflict++}
  if(l&&s){const gap=l.v-s.v;if(gap<0||gap>15)s.flag=(s.flag?s.flag+';':'')+'f'+gap.toFixed(1)}
  const rec=[NAME[o.cas]||o.name,o.cas,+o.mw];
  const ph=x=>x?(x.flag?[x.v,x.s,x.flag]:[x.v,x.s]):0;rec.push(ph(g),ph(l),ph(s));
  if(g)stats.g++;if(l)stats.l++;if(s)stats.s++;if((g&&g.flag)||(l&&l.flag))stats.flag++;
  out[o.idc]=rec;
}
/* carbon monoxide: the open data stores it as a charged structure that is filtered above */
out[OCL.Molecule.fromSmiles('[C-]#[O+]').getIDCode()]=['carbon monoxide','630-08-0',28.01,[-26.42,'a'],0,0];
fs.writeFileSync('/home/claude/pharmacheme-web/assets/data/hr-measured.json',JSON.stringify(out));
const data={groups:{},other:G.other,remaps:G.remaps,bonds,vap,
  atoms:{H:52.103,C:171.29,N:112.97,O:59.555,F:18.97,Cl:28.992,Br:26.74,I:25.52}};
for(const k in G.groups){const g=G.groups[k];data.groups[k]={v:g.v,n:g.n,src:g.src}}
fs.writeFileSync('/home/claude/pharmacheme-web/assets/data/hr-model.json',JSON.stringify(data));
console.log(Object.keys(out).length,stats,(fs.statSync('/home/claude/pharmacheme-web/assets/data/hr-measured.json').size/1024).toFixed(0)+'KB',(fs.statSync('/home/claude/pharmacheme-web/assets/data/hr-model.json').size/1024).toFixed(0)+'KB');
