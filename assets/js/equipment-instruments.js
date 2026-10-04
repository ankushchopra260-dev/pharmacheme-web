(function(){
"use strict";

var ROOT=document.querySelector('.ei');
function track(n,p){try{if(typeof window.gtag==='function')window.gtag('event',n,p||{});}catch(e){}}
function slug(n){return String(n).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
var TABHASH={eq:'equipment',in:'instrumentation',lab:'labs',ag:'agitators'};
function setHash(h){try{history.replaceState(null,'',h?('#'+h):(location.pathname+location.search));}catch(e){}}
var _tm={};function trackLater(k,n,p){clearTimeout(_tm[k]);_tm[k]=setTimeout(function(){track(n,p);},900);}
/* ============ SVG helpers ============ */
function svg(w,h,inner){return '<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">'+inner+'</svg>';}
function arr(d,hot){return '<path class="ei-flow'+(hot?' ei-flowhot':'')+'" d="'+d+'"/>';}
var DIA={
reactor:svg(220,150,
 '<rect class="ei-st" x="94" y="4" width="32" height="16" rx="3"/><line class="ei-st" x1="110" y1="20" x2="110" y2="108"/>'+
 '<path class="ei-st" d="M62 34 h96 v70 q0 22 -48 22 q-48 0 -48 -22 z"/>'+
 '<path class="ei-st ei-hot" d="M54 44 v62 q0 30 56 30 q56 0 56 -30 v-62" />'+
 '<path class="ei-fl" d="M64 70 h92 v34 q0 20 -46 20 q-46 0 -46 -20z"/>'+
 '<line class="ei-st" x1="92" y1="108" x2="128" y2="108"/><line class="ei-st" x1="94" y1="100" x2="94" y2="116"/><line class="ei-st" x1="126" y1="100" x2="126" y2="116"/>'+
 arr('M6 40 H62')+arr('M110 128 V148')+'<text class="ei-txt" x="8" y="34">feed</text><text class="ei-txt" x="168" y="80" style="fill:var(--accent2)">jacket</text>'),
hx:svg(220,150,
 '<rect class="ei-st" x="40" y="48" width="140" height="54" rx="10"/><line class="ei-st" x1="40" y1="48" x2="40" y2="102"/>'+
 '<line class="ei-st ei-ac" x1="46" y1="62" x2="174" y2="62"/><line class="ei-st ei-ac" x1="46" y1="75" x2="174" y2="75"/><line class="ei-st ei-ac" x1="46" y1="88" x2="174" y2="88"/>'+
 '<line class="ei-st" x1="70" y1="48" x2="70" y2="94"/><line class="ei-st" x1="110" y1="56" x2="110" y2="102"/><line class="ei-st" x1="150" y1="48" x2="150" y2="94"/>'+
 arr('M14 75 H40')+arr('M180 75 H206')+arr('M60 8 V48',true)+arr('M160 102 V142',true)+
 '<text class="ei-txt" x="8" y="68">tube</text><text class="ei-txt" x="66" y="16" style="fill:var(--accent2)">shell</text>'),
plate:svg(220,150,
 '<line class="ei-st" x1="40" y1="20" x2="40" y2="130"/><line class="ei-st" x1="180" y1="20" x2="180" y2="130"/><line class="ei-st" x1="34" y1="24" x2="186" y2="24"/>'+
 '<path class="ei-st" d="M60 30 v90 M74 30 v90 M88 30 v90 M102 30 v90 M116 30 v90 M130 30 v90 M144 30 v90 M158 30 v90"/>'+
 arr('M10 40 H60')+arr('M170 110 H214')+arr('M10 110 H40',true)+arr('M180 40 H214',true)+'<text class="ei-txt" x="64" y="144">alternate channels: hot / cold</text>'),
column:svg(220,150,
 '<rect class="ei-st" x="80" y="14" width="44" height="122" rx="14"/>'+
 '<path class="ei-st ei-ac" d="M84 38 h30 M90 54 h34 M84 70 h30 M90 86 h34 M84 102 h30"/>'+
 '<path class="ei-st" d="M124 22 h30 v14 h-30"/><rect class="ei-st" x="140" y="40" width="26" height="18" rx="4"/>'+
 '<path class="ei-st ei-hot" d="M124 124 h30 v-20 h20"/><rect class="ei-st ei-hot" x="160" y="96" width="38" height="24" rx="6"/>'+
 arr('M30 76 H80')+arr('M166 49 H206')+arr('M102 136 V148')+'<text class="ei-txt" x="8" y="70">feed</text><text class="ei-txt" x="168" y="36">distillate</text>'),
centrifuge:svg(220,150,
 '<ellipse class="ei-st" cx="110" cy="75" rx="62" ry="50"/><ellipse class="ei-st ei-ac" cx="110" cy="75" rx="44" ry="34"/>'+
 '<circle class="ei-st" cx="110" cy="75" r="6"/><path class="ei-st ei-hot" d="M150 50 a44 34 0 0 1 8 22"/><path class="ei-st ei-hot" d="M70 100 a44 34 0 0 1 -8 -22"/>'+
 arr('M110 4 V40')+arr('M110 125 V148',true)+'<text class="ei-txt" x="130" y="22">feed</text><text class="ei-txt" x="126" y="142">filtrate</text>'),
pump:svg(220,150,
 '<circle class="ei-st" cx="100" cy="82" r="46"/><circle class="ei-st ei-ac" cx="100" cy="82" r="8"/>'+
 '<path class="ei-st ei-ac" d="M100 82 q20 -10 28 -34 M100 82 q-24 -2 -38 20 M100 82 q-6 22 10 38 M100 82 q22 14 22 -2"/>'+
 '<path class="ei-st" d="M100 36 V12 H150 V36 Z" style="display:none"/>'+arr('M8 82 H54')+arr('M146 60 V6')+
 '<rect class="ei-st" x="146" y="70" width="40" height="24" rx="4"/><text class="ei-txt" x="152" y="86">motor</text>'),
fbd:svg(220,150,
 '<path class="ei-st" d="M70 30 h80 l14 40 h-108z"/><rect class="ei-st" x="56" y="70" width="108" height="46"/>'+
 '<line class="ei-st ei-ac" x1="56" y1="100" x2="164" y2="100" stroke-dasharray="3 3"/>'+
 '<circle class="ei-fl" cx="76" cy="90" r="4"/><circle class="ei-fl" cx="96" cy="84" r="4"/><circle class="ei-fl" cx="118" cy="92" r="4"/><circle class="ei-fl" cx="140" cy="86" r="4"/>'+
 arr('M80 146 V104',true)+arr('M110 146 V104',true)+arr('M140 146 V104',true)+arr('M110 30 V6')+'<text class="ei-txt" x="120" y="14">moist air out</text><text class="ei-txt" x="8" y="142" style="fill:var(--accent2)">hot air in</text>'),
tank:svg(220,150,
 '<path class="ei-st" d="M60 38 q50 -16 100 0 v84 q-50 14 -100 0z"/><path class="ei-fl" d="M62 76 q48 -12 96 0 v46 q-48 12 -96 0z"/>'+
 '<line class="ei-st" x1="110" y1="26" x2="110" y2="10"/><path class="ei-st" d="M102 10 h16"/>'+arr('M10 118 H60')+arr('M160 130 H210')+'<text class="ei-txt" x="8" y="108">in</text><text class="ei-txt" x="180" y="122">out</text>'),
filter:svg(220,150,
 '<path class="ei-st" d="M50 20 h120 v34 l-40 28 h-40 l-40 -28z"/><path class="ei-st" d="M90 82 v20 h40 v-20"/>'+
 '<line class="ei-st ei-ac" x1="76" y1="66" x2="144" y2="66" stroke-dasharray="4 3"/><path class="ei-fl" d="M54 26 h112 v26 l-24 14 h-64 l-24 -14z"/>'+
 arr('M110 4 V30')+arr('M110 104 V146',true)+'<text class="ei-txt" x="122" y="16">slurry</text><text class="ei-txt" x="122" y="134">filtrate</text><text class="ei-txt" x="40" y="70">cake</text>'),
evap:svg(220,150,
 '<rect class="ei-st" x="70" y="46" width="34" height="86" rx="6"/><path class="ei-st ei-ac" d="M80 52 v74 M88 52 v74 M96 52 v74"/>'+
 '<ellipse class="ei-st" cx="150" cy="40" rx="30" ry="28"/><path class="ei-st" d="M104 52 q20 -12 22 -16"/><path class="ei-st ei-hot" d="M70 64 h-18 M70 112 h-18"/>'+
 arr('M87 148 V132')+arr('M150 12 V2')+arr('M104 118 q40 0 46 -50',false)+'<text class="ei-txt" x="8" y="60" style="fill:var(--accent2)">steam</text><text class="ei-txt" x="160" y="14">vapour</text>'),
cooling:svg(220,150,
 '<path class="ei-st" d="M62 26 h96 l-12 100 h-72z"/><path class="ei-st ei-ac" d="M80 60 h60 M78 76 h64 M76 92 h68 M74 108 h72"/>'+
 '<ellipse class="ei-st" cx="110" cy="22" rx="24" ry="7"/><path class="ei-st" d="M110 22 L92 18 M110 22 L128 18"/>'+
 arr('M14 70 H64',true)+arr('M156 126 H208')+arr('M110 14 V0')+'<text class="ei-txt" x="6" y="62" style="fill:var(--accent2)">hot water</text><text class="ei-txt" x="150" y="120">cold</text>'),
scrubber:svg(220,150,
 '<rect class="ei-st" x="80" y="12" width="52" height="116" rx="14"/><path class="ei-st ei-ac" d="M90 74 h32 M90 84 h32 M90 94 h32"/>'+
 '<path class="ei-st" d="M96 30 v8 M106 30 v8 M116 30 v8"/>'+
 arr('M20 112 H80',true)+arr('M106 12 V0')+arr('M106 128 V148')+'<text class="ei-txt" x="6" y="104" style="fill:var(--accent2)">gas in</text><text class="ei-txt" x="116" y="24">liquor</text>'),
compressor:svg(220,150,
 '<path class="ei-st" d="M60 40 L160 60 V100 L60 120z"/><circle class="ei-st ei-ac" cx="110" cy="80" r="14"/>'+
 arr('M10 80 H60')+arr('M160 80 H210')+'<text class="ei-txt" x="12" y="72">low P</text><text class="ei-txt" x="176" y="72">high P</text>'),
boiler:svg(220,150,
 '<rect class="ei-st" x="50" y="40" width="120" height="70" rx="30"/><path class="ei-fl" d="M54 76 h112 v10 q0 20 -30 24 h-52 q-30 -4 -30 -24z"/>'+
 '<path class="ei-st ei-hot" d="M90 124 q-6 -14 6 -22 q2 10 10 6 q8 6 -2 16z"/>'+arr('M110 40 V8')+'<text class="ei-txt" x="120" y="22">steam</text><text class="ei-txt" x="60" y="144" style="fill:var(--accent2)">fuel + air</text>'),
spray:svg(220,150,
 '<path class="ei-st" d="M70 20 h80 v40 l-30 70 h-20 l-30 -70z"/><path class="ei-st ei-hot" d="M110 14 l-16 40 M110 14 l0 44 M110 14 l16 40"/>'+
 arr('M180 30 H150',true)+arr('M110 130 V148')+'<text class="ei-txt" x="156" y="26" style="fill:var(--accent2)">hot air</text><text class="ei-txt" x="122" y="144">powder</text>'),
membrane:svg(220,150,
 '<rect class="ei-st" x="50" y="40" width="120" height="70" rx="8"/><line class="ei-st ei-ac" x1="50" y1="75" x2="170" y2="75" stroke-dasharray="5 3"/>'+
 arr('M10 58 H50')+arr('M170 58 H210')+arr('M110 110 V148',true)+'<text class="ei-txt" x="8" y="50">feed</text><text class="ei-txt" x="160" y="50">reject</text><text class="ei-txt" x="122" y="140">permeate</text>'),
mill:svg(220,150,
 '<circle class="ei-st" cx="110" cy="80" r="46"/><path class="ei-st ei-ac" d="M110 80 L146 62 M110 80 L74 98 M110 80 L96 44 M110 80 L124 116"/><circle class="ei-st" cx="110" cy="80" r="5"/>'+
 arr('M110 4 V34')+arr('M110 128 V148'),),
blender:svg(220,150,
 '<path class="ei-st" d="M50 30 L100 100 L110 100 L110 70 L130 70 L130 100 L170 30" style="display:none"/>'+
 '<path class="ei-st" d="M44 36 L100 112 L120 112 L176 36z"/><path class="ei-st ei-ac" d="M64 58 q46 40 92 0"/><path class="ei-st" d="M110 112 v22"/>'+arr('M110 8 V32')),
ejector:svg(220,150,
 '<path class="ei-st" d="M20 60 h50 l20 12 h40 l30 -16 h40 v36 h-40 l-30 -16 h-40 l-20 12 h-50z"/>'+
 arr('M20 76 H60',true)+arr('M110 20 V54')+arr('M166 76 H208')+'<text class="ei-txt" x="20" y="54">motive steam</text><text class="ei-txt" x="104" y="14">vapour in</text>'),
gear:svg(220,150,
 '<circle class="ei-st" cx="84" cy="76" r="28"/><circle class="ei-st" cx="136" cy="76" r="28"/><circle class="ei-st ei-ac" cx="84" cy="76" r="5"/><circle class="ei-st ei-ac" cx="136" cy="76" r="5"/>'+
 arr('M10 76 H56')+arr('M164 76 H210')),
agit:svg(220,150,
 '<rect class="ei-st" x="98" y="4" width="24" height="14" rx="3"/><line class="ei-st" x1="110" y1="18" x2="110" y2="104"/>'+
 '<path class="ei-st ei-ac" d="M80 104 h60 M80 96 l10 8 l-10 8 M140 96 l-10 8 l10 8"/>'+
 '<path class="ei-st" d="M58 40 h104 v86 h-104z"/><path class="ei-fl" d="M60 60 h100 v64 h-100z"/>'),
adsorb:svg(220,150,
 '<rect class="ei-st" x="30" y="16" width="56" height="112" rx="14"/><rect class="ei-st" x="124" y="16" width="56" height="112" rx="14"/>'+
 '<path class="ei-fl" d="M34 50 h48 v70 h-48z"/><path class="ei-fl" d="M128 50 h48 v70 h-48z"/>'+
 arr('M58 148 V128')+arr('M152 128 V148')+arr('M86 40 H124')+'<text class="ei-txt" x="30" y="10">bed A (adsorb)</text><text class="ei-txt" x="120" y="10">bed B (regen)</text>'),
settle:svg(220,150,
 '<path class="ei-st" d="M20 40 h180 v50 l-70 36 h-40 l-70 -36z"/><path class="ei-fl" d="M24 62 h172 v26 l-68 34 h-36 l-68 -34z"/>'+
 arr('M2 54 H20')+arr('M200 50 H216')+arr('M110 126 V148',true)+'<text class="ei-txt" x="60" y="54">clarified</text><text class="ei-txt" x="122" y="144">sludge</text>'),
aerate:svg(220,150,
 '<path class="ei-st" d="M20 40 h180 v90 h-180z"/><path class="ei-fl" d="M22 58 h176 v70 h-176z"/>'+
 '<circle class="ei-st ei-ac" cx="60" cy="110" r="4"/><circle class="ei-st ei-ac" cx="62" cy="92" r="3"/><circle class="ei-st ei-ac" cx="110" cy="112" r="4"/><circle class="ei-st ei-ac" cx="112" cy="90" r="3"/><circle class="ei-st ei-ac" cx="160" cy="110" r="4"/>'+
 arr('M10 134 H40')+'<text class="ei-txt" x="24" y="30">air from blower</text>'),
condenser:svg(220,150,
 '<rect class="ei-st" x="70" y="14" width="46" height="110" rx="10"/><path class="ei-st ei-ac" d="M82 20 v98 M92 20 v98 M102 20 v98"/>'+
 arr('M92 2 V14')+arr('M92 124 V148')+arr('M30 100 H70',true)+arr('M116 40 H160',true)+'<text class="ei-txt" x="100" y="12">vapour</text><text class="ei-txt" x="100" y="144">condensate</text>'),
generic:svg(220,150,'<rect class="ei-st" x="56" y="36" width="108" height="78" rx="12"/><path class="ei-st ei-ac" d="M80 60 h60 M80 76 h60 M80 92 h40"/>'+arr('M6 75 H56')+arr('M164 75 H214'))
};

/* ISA bubble: kind = field | room | aux | dcs | plc | comp | local-hidden */
function bubble(letters,num,kind,el){
  var s='';
  var cx=60,cy=60,r=32;
  if(kind==='dcs'||kind==='plc'){ s+='<rect class="ei-st" x="22" y="22" width="76" height="76" rx="2"/>'; }
  if(kind==='plc'){ s+='<path class="ei-st" d="M60 28 L92 60 L60 92 L28 60z"/>'; }
  else if(kind==='comp'){ s+='<path class="ei-st" d="M36 60 L48 30 H72 L84 60 L72 90 H48z"/>'; }
  else { s+='<circle class="ei-st" cx="'+cx+'" cy="'+cy+'" r="'+r+'"/>'; }
  if(kind==='room'||kind==='dcs'||kind==='plc'||kind==='comp'){ s+='<line class="ei-st" x1="28" y1="60" x2="92" y2="60"/>'; }
  if(kind==='aux'){ s+='<line class="ei-st" x1="28" y1="57" x2="92" y2="57"/><line class="ei-st" x1="28" y1="63" x2="92" y2="63"/>'; }
  s+='<text x="60" y="'+(kind==='aux'?50:53)+'" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor" font-family="system-ui,sans-serif">'+letters+'</text>';
  s+='<text x="60" y="'+(kind==='aux'?80:78)+'" text-anchor="middle" font-size="15" font-weight="600" fill="currentColor" font-family="system-ui,sans-serif">'+num+'</text>';
  if(kind==='dcs'){ s=s; }
  return s;
}
function elementSym(el){
  // returns inner svg (placed below bubble) and viewBox height extension
  if(el==='valve') return '<path class="ei-st" d="M30 148 L60 168 L30 188 Z M90 148 L60 168 L90 188 Z"/><path class="ei-st" d="M60 168 V126"/><path class="ei-st" d="M44 126 q16 -22 32 0 z"/><line class="ei-st" x1="60" y1="92" x2="60" y2="104" style="display:none"/>';
  if(el==='psv') return '<path class="ei-st" d="M44 192 L76 192 L60 166 Z M60 166 L88 150 L88 182 Z"/><path class="ei-st" d="M60 166 V150 L52 146 L68 138 L52 130 L68 122 L60 118"/><line class="ei-st" x1="88" y1="166" x2="108" y2="166"/>';
  if(el==='disc') return '<line class="ei-st" x1="20" y1="170" x2="100" y2="170"/><path class="ei-st" d="M48 150 q12 20 0 40 M72 150 q-12 20 0 40"/>';
  if(el==='orifice') return '<line class="ei-st" x1="20" y1="170" x2="100" y2="170"/><line class="ei-st" x1="60" y1="150" x2="60" y2="190"/><line class="ei-st" x1="52" y1="156" x2="52" y2="184"/><line class="ei-st" x1="68" y1="156" x2="68" y2="184"/>';
  if(el==='solenoid') return '<path class="ei-st" d="M30 148 L60 168 L30 188 Z M90 148 L60 168 L90 188 Z"/><path class="ei-st" d="M60 168 V138"/><path class="ei-st" d="M46 126 h28 v12 h-28 z"/><path class="ei-st" d="M60 126 L52 112 L68 112 Z" style="display:none"/>';
  if(el==='onoff') return '<path class="ei-st" d="M30 148 L60 168 L30 188 Z M90 148 L60 168 L90 188 Z"/><path class="ei-st" d="M60 168 V138"/><rect class="ei-st" x="46" y="124" width="28" height="14"/>';
  if(el==='pipe') return '<line class="ei-st" x1="10" y1="170" x2="110" y2="170"/>';
  return '';
}
function instSymbol(it,large){
  var el=it.el||'';
  var h=el?200:120;
  var body=bubble(it.letters,it.num,it.kind||'field',el);
  if(el){
    var e=elementSym(el);
    // connector line from bubble to element
    var cy2={valve:114,solenoid:126,onoff:124,orifice:150}[el];
    body+=(cy2?'<line class="ei-st" x1="60" y1="92" x2="60" y2="'+cy2+'" stroke-dasharray="4 3"/>':'')+e;
  }
  return svg(120,h,body);
}

/* ============ DATA: EQUIPMENT ============ */
var EQ=[];
function E(cat,name,dia,one,how,deep,watch,use){EQ.push({cat:cat,name:name,dia:dia,one:one,how:how,deep:deep,watch:watch,use:use});}

/* Reactors */
E('Reactors','Batch Reactor (Glass-lined / SS)','reactor',
 'A closed, stirred vessel. Everything is charged, reacted for a set time, then discharged. It is the workhorse of pharma and agrochemical plants.',
 ['Raw materials are charged through the manhole or charging line.','The agitator mixes the contents while the jacket heats or cools it (steam, chilled brine, thermic fluid).','The reaction proceeds while temperature, pressure and samples are monitored.','At the end point the batch is quenched or worked up as needed, then transferred to the next step.'],
 ['Mole balance: dN/dt = r x V. Heat balance: the jacket must remove heat at least as fast as the reaction releases it: Q = U x A x dT.','Heat-transfer area per unit volume falls roughly as 1/D when scaling up, so a reaction that was easy in the lab may be cooling-limited at plant scale.','Impeller choice: anchor or retreat-curve for viscous or glass-lined service, pitched blade for general mixing, Rushton turbine for gas dispersion. Baffles stop vortexing.','Glass lining has limited thermal-shock resistance and does not tolerate hard solids, HF or strong alkali at temperature. Follow the vendor limits.'],
 'Cooling failure on an exothermic reaction can lead to thermal runaway. Glass lining damage from thermal shock. Mechanical seal leaks.',
 'APIs, intermediates, agrochemical technicals, specialty chemicals.');
E('Reactors','Semi-batch Reactor','reactor',
 'A batch reactor where one reagent is added slowly over time. Dosing speed controls heat release and selectivity.',
 ['Part of the charge sits in the reactor at the set temperature.','The second reagent is dosed through a pump or addition vessel at a controlled rate.','Cooling removes the heat as fast as the dosing releases it.','After dosing ends there is a hold period to finish the reaction.'],
 ['Heat release rate is set by the dosing rate if the reaction is fast. Dosing-controlled operation is the usual safety strategy.','Accumulation = dosed amount minus reacted amount. If the reaction stalls (cold, catalyst missing) and dosing continues, accumulated reagent can react suddenly.','Stoessel criticality classes rank four temperatures: process temperature, MTSR (process temperature plus the adiabatic rise from accumulated reagent), MTT (maximum technical temperature, e.g. boiling point) and TD24 (onset of a dangerous decomposition).'],
 'Dosing into a cold, unreacted mixture builds up unreacted reagent. Agitator failure during dosing is a classic cause of incidents.',
 'Nitrations, chlorinations, Grignard and other exothermic additions.');
E('Reactors','CSTR (Continuous Stirred-Tank Reactor)','reactor',
 'A well-mixed vessel with continuous feed in and product out at the same rate. Composition inside equals composition at the outlet.',
 ['Feed enters continuously and mixes instantly with the contents.','Reaction occurs at the outlet concentration (the lowest reactant concentration in the system).','Product leaves continuously at the same flow rate.','The system settles to steady state.'],
 ['Design equation: V = F_A0 x X / (-r_A). Residence time: tau = V / Q.','First-order, constant density: X = k x tau / (1 + k x tau).','For the same conversion a CSTR needs more volume than a PFR for positive-order kinetics, but it gives uniform temperature and easy control.','Several CSTRs in series approach PFR performance.'],
 'Short-circuiting and dead zones from poor mixing. Startup and shutdown transients.',
 'Neutralisations, polymerisation, fermentation, continuous crystallisation.');
E('Reactors','Plug-flow / Tubular Reactor (PFR)','hx',
 'A pipe or tube bundle where fluid moves like a plug with no back-mixing. Reaction progresses along the length.',
 ['Reactants are pumped in at one end.','Each slice of fluid reacts as it travels along the tube.','Heat is added or removed through the tube wall.','Product leaves at the far end.'],
 ['Design equation: dX/dV = -r_A / F_A0, integrated along the length.','First-order: X = 1 - exp(-k x tau).','High surface-to-volume ratio gives excellent heat control, which is why flow chemistry suits fast, hazardous reactions.','Check Reynolds number to confirm the flow regime and mixing.'],
 'Fouling and plugging. Hot spots with highly exothermic reactions.',
 'Flow chemistry, nitration, cracking, ammonia synthesis.');
E('Reactors','Hydrogenator / Autoclave','reactor',
 'A high-pressure agitated vessel for gas-liquid-solid reactions such as catalytic hydrogenation.',
 ['Substrate, solvent and catalyst are charged.','The vessel is purged with nitrogen to remove air.','Hydrogen is introduced to the set pressure while the agitator keeps gas, liquid and catalyst in contact.','Hydrogen uptake is followed until it stops, then the vessel is vented and purged again.'],
 ['Rate is often limited by gas-liquid mass transfer: r = kLa x (C* - C). Agitator speed and gas dispersion matter.','Catalysts such as Pd/C and Raney Ni can be pyrophoric when dry. Keep them wet and handle under inert atmosphere.','Design to the pressure vessel code, with relief protection and hydrogen detection.'],
 'Air ingress with hydrogen. Dry catalyst ignition during filtration. Over-pressurisation.',
 'Hydrogenations, high-pressure carbonylations, polymerisations.');
E('Reactors','Packed-bed Catalytic Reactor','column',
 'A tube or vessel filled with catalyst pellets. Reactants flow through the bed and react on the catalyst surface.',
 ['Feed is preheated and enters the bed.','Reaction happens on the catalyst surface inside the pores.','Heat is removed or added through the shell or between beds.','Product leaves and is separated downstream.'],
 ['Pressure drop across the bed is estimated with the Ergun equation.','Effectiveness factor and mass-transfer limits determine whether the pellet is used fully.','Deactivation by coking or poisoning sets the regeneration cycle.'],
 'Channelling, hot spots and catalyst deactivation. Pressure-drop growth over time.',
 'Oxidations, hydrogenations, SO2 conversion, reforming.');

/* Heat transfer */
E('Heat Transfer','Shell and Tube Heat Exchanger','hx',
 'A bundle of tubes inside a cylindrical shell. One fluid flows inside the tubes, the other outside, and heat moves through the tube walls.',
 ['Tube-side fluid enters the channel head and flows through the tubes.','Shell-side fluid enters a nozzle and is guided across the tubes by baffles.','Heat flows from the hot fluid through the tube wall to the cold fluid.','Both fluids leave at their own outlets.'],
 ['Duty: Q = m x Cp x dT = U x A x LMTD x F.','LMTD = (dT1 - dT2) / ln(dT1 / dT2). The correction factor F accounts for non-pure counter-current flow, and F below about 0.8 is a warning sign.','Put the fouling, corrosive or high-pressure fluid on the tube side. Baffle spacing balances heat transfer against shell-side pressure drop.','Overall coefficient: 1/U = 1/h_o + R_fo + (wall) + R_fi + 1/h_i (referred to a common area).'],
 'Fouling reduces U over time. Tube leaks mix the two streams. Large shell-to-tube temperature differences need a floating head, U-tubes or an expansion joint.',
 'Heating, cooling and condensing almost everywhere in a plant.');
E('Heat Transfer','Plate Heat Exchanger','plate',
 'A stack of corrugated metal plates with gaskets. Hot and cold fluids flow in alternate channels and exchange heat across the thin plates.',
 ['Plates are clamped between a fixed and a movable frame.','Gaskets direct fluid A into every other channel and fluid B into the others.','Corrugations create turbulence at low flow rates.','Heat transfers across a thin plate over a large area.'],
 ['High U values (often several times a shell-and-tube) and close temperature approaches are possible.','Limited by gasket temperature and pressure rating. Brazed and welded variants extend the range.','Narrow channels foul or plug with fibres and solids. Use a strainer upstream.'],
 'Gasket failure and cross-contamination. Plugging by solids. Standard plates are unsuitable for coarse particulates or extremely viscous fluids unless wide-gap plates are used.',
 'Pasteurising, utility heat recovery, clean liquid services (WFI loops normally use double-tubesheet shell-and-tube units).');
E('Heat Transfer','Jacket, Half-coil and Limpet Coil','reactor',
 'Heat-transfer surfaces welded to the outside of a vessel to heat or cool its contents.',
 ['A utility (steam, brine, hot oil, chilled water) is circulated in the jacket or coil.','Heat passes through the vessel wall to the process side.','Half-coil and limpet designs force the utility along a path at higher velocity.','Utility leaves and returns to its system.'],
 ['A conventional jacket is simple but has low velocity and poorer heat transfer. Half-coil or limpet gives better velocity and higher pressure rating.','Heating and cooling time depends on wall resistance, process-side film and agitation.','Use the correct utility for glass-lined vessels to avoid thermal shock. Ramp changes gradually.'],
 'Jacket leaks contaminate the batch. Steam hammer in jackets. Poor condensate drainage.',
 'Almost every batch reactor and receiver.');
E('Heat Transfer','Condenser','condenser',
 'A heat exchanger that turns vapour back into liquid by removing latent heat.',
 ['Vapour enters the condenser.','Cooling water or chilled brine flows on the other side.','Vapour gives up its latent heat and condenses.','Condensate drains out while non-condensables are vented or pulled by vacuum.'],
 ['Duty: Q = m x lambda (+ sensible cooling). The cooling-medium flow follows from Q = m_c x Cp x dT.','Non-condensable gases blanket the tube surface and cut performance sharply.','Vertical or horizontal, shell-side or tube-side condensing: choose by fouling, pressure drop and drainage.','Vent condensers recover solvent from tank or reactor vents.'],
 'Loss of cooling water causes vapour to carry over to the vacuum system or atmosphere. Tube leaks.',
 'Reflux and overhead condensers, solvent recovery, vent condensers.');
E('Heat Transfer','Reboiler','hx',
 'A heat exchanger at the bottom of a column that vaporises liquid to drive the distillation.',
 ['Bottom liquid is drawn from the column.','Steam or hot oil heats it and part of it boils.','The vapour (or vapour-liquid mixture, in a thermosyphon) returns to the column.','Vapour rises up the column as the stripping/boil-up stream.'],
 ['Types: kettle, thermosyphon (vertical or horizontal), forced circulation.','Thermosyphon driving force comes from the density difference between the liquid leg and the two-phase return line.','Boil-up rate sets reflux and separation. Limit the wall temperature to avoid fouling or product degradation.'],
 'Instability in thermosyphons, fouling, and overheating of heat-sensitive products.',
 'Distillation columns and strippers.');
E('Heat Transfer','Cooling Tower','cooling',
 'Cools circulating water by letting a small part evaporate into an air stream.',
 ['Hot return water is sprayed or distributed over the fill.','A fan (or natural draft) moves air through the fill, upward in counterflow or horizontally in crossflow.','Part of the water evaporates, which carries heat away.','Cooled water collects in the basin and is pumped back.'],
 ['Approach = cold water temperature minus wet-bulb temperature. Range = hot water minus cold water.','Evaporation loss is roughly 1% of circulation per 5-6 degC range. Blowdown controls the cycles of concentration.','Water treatment: scale, corrosion and biological control, including Legionella management.'],
 'Scaling and biofouling, drift losses and fan or gearbox failure.',
 'Plant cooling-water circuits, chiller condenser water.');
E('Heat Transfer','Chiller (Vapour-compression)','compressor',
 'A refrigeration machine that produces chilled water or brine for process cooling.',
 ['Refrigerant is compressed into hot, high-pressure vapour.','It condenses in the condenser, rejecting heat to cooling water or air.','An expansion valve drops its pressure and temperature.','In the evaporator the cold refrigerant absorbs heat from the process brine.'],
 ['COP = cooling duty / compressor power.','Lower condensing temperature and higher evaporating temperature improve COP.','Brine freezing point must stay below the evaporator temperature. Monitor concentration of glycol or calcium chloride.'],
 'Evaporator freeze-up, low refrigerant charge, dirty condenser tubes and high discharge pressure trips.',
 'Reactor jackets at low temperature, condensers for solvents, HVAC.');
E('Heat Transfer','Steam Boiler (Fire-tube / Water-tube)','boiler',
 'Burns fuel to produce steam for heating and process use.',
 ['Fuel and air burn in the furnace.','Hot flue gases pass through tubes (fire-tube) or around tubes (water-tube).','Feed water absorbs the heat and turns to steam.','Steam passes to the header, and flue gas leaves through the stack.'],
 ['Boiler efficiency can be found by the direct method (steam flow x (steam enthalpy - feed-water enthalpy) / fuel flow x GCV) or the indirect (loss) method.','Feed-water quality (TDS, hardness, dissolved O2) protects the tubes. Blowdown removes concentrated solids.','Drum level, flame failure and steam pressure interlocks are critical safety loops.'],
 'Low water level, scale on tubes, and carryover. Strictly follow statutory boiler rules.',
 'Plant steam for jackets, tracing, evaporation and distillation.');
E('Heat Transfer','Thermic Fluid Heater','boiler',
 'Heats a special oil to a high temperature at low pressure for process heating beyond steam limits.',
 ['A burner heats oil flowing through a coil in the furnace.','A circulation pump moves the hot oil to users.','Oil returns to the pump, with an expansion tank connected to the circuit to absorb thermal expansion.','Temperature is held by firing control.'],
 ['Oil can reach 250-320 degC without high pressure, which suits high-temperature reactions.','Oil degrades with overheating and oxidation. Test it regularly.','Keep minimum flow through the coil. Low flow overheats and cokes the tubes.'],
 'Coil coking, oil leaks and fire, water in oil.',
 'High-temperature reactor jackets, dryers, distillation reboilers.');
E('Heat Transfer','Falling-film Evaporator','evap',
 'Liquid flows as a thin film down the inside of heated tubes and partly evaporates.',
 ['Feed is distributed evenly to the top of the tubes.','It runs down as a film while steam heats the tube outside.','Vapour and concentrate separate at the bottom.','Concentrate leaves, vapour goes to the condenser or next effect.'],
 ['Short residence time and low temperature difference make it good for heat-sensitive products.','Needs a minimum wetting rate. Recirculation keeps tubes wet.','Boiling point elevation reduces the effective temperature difference.'],
 'Dry spots on tubes cause fouling. Uneven distribution.',
 'Concentrating solutions, solvent removal, juice and dairy-type duties.');
E('Heat Transfer','Agitated Thin Film Evaporator (ATFE)','evap',
 'A heated cylinder with rotating blades that spread viscous liquid into a thin film.',
 ['Feed enters at the top and is spread by the rotor wiper blades.','The film flows down the heated wall.','Volatiles evaporate and move to the condenser.','Concentrate or residue leaves at the bottom.'],
 ['Short residence time with very high heat-transfer coefficients, even for viscous and fouling fluids.','Works under vacuum for heat-sensitive materials.','Wiped-film arrangement controls film thickness and renewal.'],
 'Rotor wear, seal leaks and over-concentration into solid crusts.',
 'Solvent stripping, residue concentration, high-viscosity products.');
E('Heat Transfer','Multiple-effect Evaporator (MEE)','evap',
 'A series of evaporators where vapour from one effect heats the next, which saves steam.',
 ['Live steam heats the first effect.','Vapour from effect 1 becomes the heating medium for effect 2, which runs at a lower pressure.','The chain continues through all effects, and the last vapour goes to the condenser.','Concentrated liquor leaves the last effect in forward feed, or the first effect in backward feed.'],
 ['A rough screening rule is a steam economy of about 0.8 x N kg of water evaporated per kg of steam (N = number of effects). Actual economy depends on feed condition, boiling point elevation, heat losses, configuration and operating conditions.','Higher boiling-point elevation reduces usable temperature difference per effect.','Feed arrangements: forward, backward, mixed.'],
 'Scaling and salting, foaming, carryover to the condensate.',
 'ETP concentrate treatment, salt recovery, caustic concentration.');

/* Separation */
E('Separation','Distillation Column (Tray / Packed)','column',
 'A tall vessel that separates liquid mixtures by differences in boiling point using repeated vaporisation and condensation.',
 ['Feed enters near the middle. A reboiler at the bottom creates vapour.','Vapour rises through trays or packing and contacts the downflowing liquid (reflux).','Light components enrich in the vapour and travel to the top, heavy components go down.','The overhead is condensed. Part is taken off as distillate and part returns as reflux.'],
 ['Equilibrium stages are found by McCabe-Thiele or computer simulation. Minimum reflux and minimum stages bound the design (Fenske-Underwood-Gilliland).','Tray efficiency converts theoretical stages to actual trays. Packing uses HETP.','Flooding and weeping set the operating window. Pressure drop matters under vacuum.','Relative volatility alpha above about 1.2 usually makes distillation practical.'],
 'Flooding, foaming, weeping, loss of condenser cooling, and reboiler failures.',
 'Solvent recovery and purification of intermediates.');
E('Separation','Liquid-Liquid Separator / Decanter','settle',
 'A vessel where two immiscible liquids settle into layers and are drawn off separately.',
 ['The mixed stream enters and slows down.','The denser liquid sinks and the lighter floats.','The interface level is held by a level controller or an overflow weir.','Each layer leaves through its own outlet.'],
 ['Settling follows Stokes law: velocity is proportional to droplet diameter squared and the density difference, and inversely proportional to continuous-phase viscosity.','Interface detection is by a sight glass, conductivity probe or radar.','Emulsions, rag layers and surfactants slow separation.'],
 'Poor separation due to emulsion, interface-level error and carryover of one phase.',
 'Work-up after reaction, extraction, washing.');
E('Separation','Liquid-Liquid Extraction','settle',
 'Uses a solvent to pull a wanted compound from one liquid into another.',
 ['Feed and solvent are mixed so that the solute moves into the solvent.','Phases are allowed to separate.','Extract (solvent plus solute) and raffinate are drawn off.','Repeating with fresh solvent or in a counter-current column improves recovery.'],
 ['Distribution coefficient K = C_extract / C_raffinate, measured at equilibrium. Several small extractions beat one large one.','pH adjustment can switch an acid or base between phases.','Counter-current extraction columns and mixer-settlers are used at scale.'],
 'Emulsions, solvent losses and solvent safety.',
 'Product isolation, impurity removal, wastewater pre-treatment.');
E('Separation','Absorber / Scrubber','scrubber',
 'A column where a gas stream contacts a liquid that dissolves or reacts with a pollutant.',
 ['Dirty gas enters at the bottom.','Scrubbing liquor (water, caustic, acid) is sprayed from the top over packing.','The pollutant moves into the liquid, sometimes with a chemical reaction.','Clean gas leaves at the top and spent liquor drains from the bottom.'],
 ['Henry law and the L/G ratio decide the required liquid rate.','Packed height = HTU x NTU.','Chemical absorption (e.g. SO2 in caustic, NH3 in acid) or very high solubility (HCl in water) makes mass transfer much faster.','Keep liquor pH under control.'],
 'Liquor depletion, packing blockage, demister carryover and corrosion.',
 'HCl, Cl2, NH3, SO2 and solvent-vapour scrubbing.');
E('Separation','Crystallizer','tank',
 'A vessel that produces solid crystals from a solution by cooling, evaporation or anti-solvent addition.',
 ['A solution is made supersaturated.','Nuclei form and crystals grow.','Slurry is held under agitation to reach the target size.','Crystals go to a filter or centrifuge.'],
 ['Supersaturation drives both nucleation and growth. Slow, controlled cooling gives larger and more uniform crystals.','Seeding gives repeatability. Metastable zone width guides the cooling profile.','Polymorph and particle-size control are critical for APIs.'],
 'Oiling out, fines, agglomeration and encrustation on walls.',
 'API purification, salt production, intermediates.');
E('Separation','Centrifuge (Basket / Peeler / Decanter)','centrifuge',
 'Spins a slurry at high speed so centrifugal force separates solids from liquid.',
 ['In basket and peeler types, slurry is fed into a rotating perforated basket lined with filter cloth (decanters use a solid bowl and a scroll instead).','Liquid passes through the cloth, solids stay as a cake.','The cake may be washed and spun dry.','Cake is discharged by a peeler knife, a bottom discharge or manually.'],
 ['Centrifugal force in g: G = (omega squared x r) / g.','Cake permeability and cloth resistance set the filtration rate.','Out-of-balance loads need good loading practice. Peeler designs reduce manual exposure.','Decanter centrifuges handle continuous slurries.'],
 'Imbalance and vibration, cloth blinding, solvent vapours (inert with nitrogen).',
 'Isolating crystals and washing solids.');
E('Separation','Agitated Nutsche Filter Dryer (ANFD)','filter',
 'One vessel that filters, washes and dries a product with a built-in agitator, with no manual handling of the cake.',
 ['Slurry is filtered under pressure or vacuum through the filter plate.','The cake is washed in place.','Heated plate and agitator dry the cake under vacuum.','The agitator discharges the dry powder through a side port.'],
 ['Closed system suits potent or toxic APIs.','Agitator height control keeps the cake level and avoids damage to the filter cloth.','Drying rate depends on cake temperature, vacuum and agitation.'],
 'Cake cracking, filter plate blinding, and cake lumps.',
 'High-potency APIs and sterile processing.');
E('Separation','Filter Press / Plate and Frame','filter',
 'Squeezes solids out of slurry between filter cloths held in a stack of plates.',
 ['Plates are closed under hydraulic pressure.','Slurry is pumped into the chambers.','Liquid passes through the cloth and solids build a cake.','Plates open and the cakes drop out.'],
 ['Flow follows Darcy filtration: rate is proportional to pressure drop divided by (viscosity x (cake + cloth resistance)).','Compressible cakes need a ramped pressure.','Washing and air blow-down reduce liquid content.'],
 'Cloth blinding, leaks between plates and cake not releasing.',
 'Carbon removal, ETP sludge, catalyst recovery.');
E('Separation','Cartridge / Bag / Sparkler Filter','filter',
 'Polishing filters that remove fine particles from a liquid.',
 ['Liquid is pumped through a filter element.','Most particles larger than the rating are caught (almost all for absolute-rated elements).','Pressure drop rises as the element loads.','The element is replaced or cleaned.'],
 ['Rating can be nominal or absolute. Beta ratio describes capture efficiency.','Change on differential pressure, not on a schedule alone.','Integrity testing (bubble point or diffusion test) is required for sterile filters.'],
 'Element bypass and incorrect seating.',
 'Final clarification, carbon-bed polishing, sterile filtration.');
E('Separation','Membrane Separation (RO / UF / NF)','membrane',
 'A semi-permeable membrane lets some components through under pressure while holding others back.',
 ['High-pressure feed flows across the membrane surface.','Water (permeate) passes. RO rejects most salts, NF rejects divalent ions and small organics, and UF holds back only large molecules and colloids.','Concentrate (reject) leaves, carrying the rejected materials.','Membranes are cleaned periodically.'],
 ['Reverse osmosis pressure must exceed osmotic pressure: pi = i x C x R x T.','Recovery = permeate flow / feed flow. Higher recovery raises scaling risk.','Cross-flow limits fouling. Pre-treatment protects the membrane.'],
 'Scaling, biofouling, chlorine damage to RO membranes.',
 'Purified water, ETP reuse, concentration of solutions.');
E('Separation','Activated Carbon Adsorber','adsorb',
 'A bed of porous carbon that traps organics or colour on its surface.',
 ['Fluid flows through the carbon bed.','Contaminants stick to the internal surface of the carbon.','The bed gradually saturates, and breakthrough begins.','The carbon is regenerated or replaced.'],
 ['Capacity follows an isotherm (Langmuir or Freundlich).','The mass-transfer zone moves down the bed. Lead-lag arrangements use the bed fully.','Contact time (EBCT) governs removal.'],
 'Early breakthrough, bed channelling and fire risk with solvent-laden carbon.',
 'Colour removal, solvent vapour capture, wastewater polishing.');

/* Drying */
E('Drying','Tray Dryer','fbd',
 'A cabinet with trays of wet material and hot air circulated over them.',
 ['Wet material is spread on trays and loaded onto racks.','Heated air is circulated across the trays.','Moisture evaporates into the air.','Humid air is exhausted and fresh air is heated.'],
 ['Constant-rate period (surface evaporation) followed by falling-rate periods (internal diffusion).','Simple and gentle, but slow and labour intensive. Vacuum tray dryers speed up drying at low temperature.','Check for hot spots and uneven loading.'],
 'Uneven drying, cross-contamination between batches and dust exposure.',
 'APIs, intermediates and heat-sensitive solids.');
E('Drying','Fluid Bed Dryer (FBD)','fbd',
 'Hot air blown up through a bed of powder lifts it so the particles behave like a boiling liquid, drying it quickly.',
 ['Wet material is loaded in the bowl.','Hot air flows upward through the bed and fluidises it.','Close contact between air and particles dries the solids rapidly.','Fines are held by the filter bags and shaken back.'],
 ['Fluidisation starts at minimum fluidisation velocity, which can be estimated from Ergun.','Excellent heat and mass transfer, with short drying times.','Static electricity with solvents needs inerting, grounding and explosion protection.'],
 'Channelling, filter-bag blinding, static and dust explosions.',
 'Granules, powders, pharma formulation.');
E('Drying','Rotocone Vacuum Dryer (RCVD)','blender',
 'A double-cone vessel that rotates under vacuum while heated to dry solids gently.',
 ['Wet cake is charged.','The vessel rotates slowly, and the jacket heats the wall.','Vacuum lowers the boiling point of moisture or solvent.','Vapours go to the condenser and dry product is discharged.'],
 ['Vacuum drying keeps temperature low for heat-sensitive materials.','Tumbling reduces lumps and gives more uniform drying, though sticky cakes can still ball.','Condensed solvent is recovered.'],
 'Filter blinding at the vacuum port, leaks and overheating.',
 'API and intermediate drying, solvent recovery.');
E('Drying','Spray Dryer','spray',
 'Atomises a liquid into a hot air chamber so droplets dry into powder in seconds.',
 ['Liquid feed is pumped to a nozzle or rotary atomiser.','Fine droplets meet hot air in the chamber.','Water evaporates almost instantly.','Powder is collected from the cone or cyclone.'],
 ['Droplet drying time depends on size squared (d-squared law).','Outlet temperature is the main control variable.','Particle size and density follow the feed solids and atomiser settings.'],
 'Wall deposits, powder burning in the chamber, nozzle wear.',
 'Detergents, excipients, pigments and heat-sensitive powders.');

/* Solids handling */
E('Solids Handling','Mills (Multi-mill / Pulveriser / Jet Mill)','mill',
 'Reduce particle size by impact, shear or compression.',
 ['Material is fed to the milling chamber.','Rotating hammers, blades or fluid jets break the particles.','A screen or classifier limits the maximum size.','Ground powder is collected.'],
 ['Energy relationships (Rittinger, Kick, Bond) relate size reduction to energy.','Jet mills use gas energy and give very fine, low-contamination powders.','Dust control and explosion protection are a must.'],
 'Heat build-up, dust explosion and cross-contamination.',
 'API micronisation, spices, agrochemical formulation.');
E('Solids Handling','Vibro Sifter','mill',
 'A vibrating sieve that separates particles by size or removes lumps.',
 ['Powder is fed on a mesh deck.','Vibration moves material across the screen.','Fine material falls through, oversize leaves separately.','Both streams are collected.'],
 ['Screening efficiency depends on feed rate, mesh opening and amplitude.','Blinding is reduced by ball or ultrasonic cleaning.','Use equipment certified for the hazardous-area zone (ATEX/IECEx) when handling flammable dust.'],
 'Mesh tearing, blinding and dust.',
 'De-lumping, oversize removal and particle grading.');
E('Solids Handling','Blenders (Ribbon / Double Cone / V)','blender',
 'Mix powders to a uniform blend.',
 ['Components are charged in a planned order.','Rotation or ribbons move the solids.','Particles continually redistribute.','Uniformity is checked by sampling.'],
 ['Blend uniformity is measured as RSD of samples.','Mixing time must be validated. Over-blending can cause segregation.','Different densities and sizes segregate during discharge and handling.'],
 'Dead zones, segregation and static charge.',
 'Formulations, premixes and final product blending.');

/* Fluid movers */
E('Fluid Movers & Vacuum','Centrifugal Pump','pump',
 'An impeller throws liquid outward and converts that speed into pressure.',
 ['Liquid enters the centre (eye) of the spinning impeller.','Vanes accelerate it outward.','The volute casing slows the flow and converts velocity into pressure.','Liquid leaves through the discharge.'],
 ['Pressure head H = (P2 - P1)/(rho x g), plus any velocity and elevation differences between the gauges. Power P = rho x g x Q x H / eta.','Affinity laws: Q is proportional to N, H to N squared, P to N cubed.','NPSH available must exceed NPSH required by a safe margin. NPSHr is set at a 3% head drop, so cavitation has already started at NPSHr.','Operate near best-efficiency point (BEP).'],
 'Cavitation, running dry, dead-heading and mechanical seal failure.',
 'Water, solvent and process-liquid transfer.');
E('Fluid Movers & Vacuum','Diaphragm Pump (AODD)','pump',
 'Air-driven flexible diaphragms push liquid in and out through check valves.',
 ['Compressed air pushes one diaphragm, which forces liquid out of its chamber.','The other diaphragm is pulled back and draws liquid in.','Air shifts and the cycle reverses.','Check valves keep flow in one direction.'],
 ['Handles solids, slurries, corrosive and shear-sensitive fluids, and can run dry.','Flow is pulsating. Use a dampener for smoother output.','Diaphragm materials (PTFE, EPDM) must suit the chemical.'],
 'Diaphragm rupture, air consumption and freezing exhaust.',
 'Drum transfer, slurry, acid and solvent transfer.');
E('Fluid Movers & Vacuum','Gear Pump (Positive Displacement)','gear',
 'Meshing gears trap fluid between teeth and carry it from suction to discharge.',
 ['In an external gear pump, the gears rotate in opposite directions.','Fluid is trapped between the teeth and the casing.','It is carried around and squeezed out at the discharge.','Output is nearly proportional to speed.'],
 ['Flow is nearly independent of pressure, so it needs a relief valve.','Good for viscous liquids and metering.','Wear increases slip, especially with abrasive fluids.'],
 'Dead-heading without relief, dry running and wear.',
 'Viscous liquids, oils, polymer transfer.');
E('Fluid Movers & Vacuum','Liquid-ring Vacuum Pump','pump',
 'A rotor spins inside a casing with a ring of liquid. The ring seals the gaps and the changing volume creates vacuum.',
 ['The impeller is off-centre in the casing, and sealing liquid forms a ring.','Pockets between vanes grow on the inlet side and draw gas in.','Pockets shrink on the other side and compress the gas.','Gas is discharged with some sealing liquid.'],
 ['Ultimate vacuum is limited by the vapour pressure of the sealing liquid.','Handles wet and condensable vapours, with nearly isothermal compression.','Seal-liquid temperature control matters. Closed-loop systems avoid solvent in effluent.'],
 'Cavitation, seal-liquid contamination and effluent disposal.',
 'Distillation, drying and filtration vacuum.');
E('Fluid Movers & Vacuum','Dry Screw Vacuum Pump','compressor',
 'Two non-contacting screws compress gas with no sealing liquid.',
 ['Gas enters the screw cavities.','Rotation reduces the trapped volume and compresses the gas.','Hot walls prevent condensation inside.','Gas leaves at the discharge.'],
 ['No contamination of the process or the effluent, with good solvent recovery.','Operating temperature must stay above the dew point of the vapours.','Higher initial cost but lower running cost than liquid ring.'],
 'Powder or condensate ingress and overheating.',
 'Solvent-service vacuum in API plants.');
E('Fluid Movers & Vacuum','Steam Ejector','ejector',
 'A fixed nozzle uses a high-speed steam jet to draw in and carry away vapour.',
 ['High-pressure steam expands through a nozzle to a high velocity.','The jet entrains the suction gas by momentum.','Mixture slows in the diffuser and gains pressure.','Condenser removes steam and the next stage continues.'],
 ['No moving parts. Several stages in series achieve deep vacuum.','Steam pressure below design stops the nozzle from working properly.','Needs steady motive-steam pressure and cooling water.'],
 'Wet steam, low steam pressure and nozzle erosion.',
 'Distillation vacuum, refinery and large process vacuum systems.');
E('Fluid Movers & Vacuum','Agitators and Impellers','agit',
 'Rotating impellers that mix liquids, suspend solids, disperse gases or promote heat transfer.',
 ['A motor drives the shaft through a gearbox.','The impeller creates flow (axial or radial).','Baffles break swirl so the liquid mixes top to bottom.','Mixing time and shear depend on speed and impeller type.'],
 ['Power: P = Np x rho x N cubed x D to the fifth. Np depends on impeller type and Reynolds number.','Axial impellers (pitched blade, hydrofoil) give flow, radial (Rushton) give shear.','Scale-up uses constant tip speed, power per volume or mixing time, depending on the goal.'],
 'Vortexing, seal failure and shaft deflection.',
 'Stirred reactors, crystallisers and mixing tanks.');
E('Fluid Movers & Vacuum','Air Compressor (Screw / Reciprocating)','compressor',
 'Raises air pressure for instruments, pneumatic tools and process air.',
 ['Air is drawn in and filtered.','Screw rotors or pistons compress it.','Aftercooler and separator remove heat and moisture.','A dryer and receiver supply clean, dry air.'],
 ['Isentropic work: W = k/(k-1) x P1 x V1 x [(P2/P1)^((k-1)/k) - 1]. Intercooling reduces work.','Instrument air needs a low dew point to avoid corrosion and freezing.','Receivers buffer demand. Leaks are a major energy loss.'],
 'Moisture and oil carryover and unloaded running.',
 'Instrument air, plant air, pneumatic conveying.');
E('Fluid Movers & Vacuum','Roots Blower','compressor',
 'Two lobed rotors trap and push air from suction to discharge for low-pressure duty.',
 ['Rotors turn in opposite directions.','Air is trapped between lobes and casing.','It is pushed to the discharge.','Output is nearly constant volume.'],
 ['Used for low-pressure, high-flow air service. Allowable differential pressure is model and manufacturer specific, and excessive differential pressure causes heating and mechanical stress.','Flow is nearly proportional to speed. Needs a relief valve.','Pulsation and noise are handled with silencers.'],
 'Overheating at high differential pressure and dead-heading.',
 'Aeration in ETP, pneumatic conveying, low vacuum.');

/* Storage & safety */
E('Storage & Safety','Atmospheric Storage Tank','tank',
 'A vertical tank holding liquids at near-atmospheric pressure.',
 ['Liquid enters through the inlet nozzle.','The level rises. A vent allows air out.','Level gauge and high-level switch monitor the inventory.','Liquid leaves through the outlet or pump suction.'],
 ['Fixed-roof (cone or dome) or floating-roof designs. Flammable liquids need venting, flame arrestors and nitrogen blanketing in many cases.','Breathing losses depend on temperature and filling.','Dyked bund area holds spills.'],
 'Overfilling, vacuum collapse and static ignition.',
 'Raw material, solvent and product storage.');
E('Storage & Safety','Pressure Vessel / Receiver','tank',
 'A closed vessel designed to hold gas or liquid under pressure.',
 ['Fluid is fed to the vessel.','Pressure builds up to the operating value.','A relief device protects against over-pressure.','Fluid leaves under controlled conditions.'],
 ['Design pressure sits above maximum operating pressure with a practical margin (often about 10%), and the vessel is designed to a code such as ASME VIII or IS 2825.','Thickness depends on pressure, diameter and allowable stress.','A pressure test at fabrication is required by the code, and periodic inspection is statutory in many jurisdictions (e.g. Factories Act rules in India).'],
 'Corrosion under insulation, relief valve failure and fatigue.',
 'Air receivers, reflux drums, process receivers.');
E('Storage & Safety','Flame Arrestor and Breather Valve','tank',
 'Protect tanks from vacuum or over-pressure and stop a flame from travelling into them.',
 ['Normal breathing passes through the breather valve.','Pressure or vacuum beyond set limits opens the valve.','A flame arrestor element absorbs the heat of a flame front it is rated for (gas group, deflagration or detonation, burn time).','The flame is quenched and does not reach the tank.'],
 ['Set pressure and vacuum are defined from the tank design limits.','Arrestor elements can foul. Check pressure drop and inspect regularly.','Size for normal breathing only. Fire-case emergency venting needs a separate emergency vent.'],
 'Blocked elements, frozen or stuck pallets.',
 'Solvent storage tanks and vent lines.');

/* Utilities & ETP */
E('Utilities & ETP','Nitrogen Generator (PSA)','adsorb',
 'Makes nitrogen from compressed air using carbon molecular sieve beds.',
 ['Compressed, dry, clean air enters bed A.','Oxygen is adsorbed faster than nitrogen by the sieve, so nitrogen passes through.','Bed A is depressurised to release oxygen while bed B takes over.','The cycle repeats every minute or so, giving continuous nitrogen.'],
 ['Purity and flow trade off: higher purity gives lower yield.','Air quality (oil, moisture) protects the sieve.','The oxygen-rich exhaust stream is a by-product that can sometimes be reused.'],
 'Moisture or oil on the sieve and valve timing faults.',
 'Inerting, blanketing and purging of reactors and tanks.');
E('Utilities & ETP','Steam Trap and Condensate System','generic',
 'A trap that releases condensate and air from steam lines without letting live steam escape.',
 ['Steam gives up heat in the equipment and condenses.','The trap senses condensate and opens (thermodynamic, float, bimetal).','Condensate flows to the return line.','Live steam closes the trap again.'],
 ['Leaking traps waste steam, and blocked traps cause water hammer and poor heat transfer.','Size the trap for start-up as well as running load.','Condensate return recovers heat and treated water.'],
 'Failed-open or failed-closed traps and water hammer.',
 'Every steam-heated item.');
E('Utilities & ETP','DM Plant (Ion Exchange)','adsorb',
 'Removes dissolved salts from water using cation and anion resin beds.',
 ['Raw water passes through the cation bed, where cations are exchanged for H+.','It then passes through the anion bed, where anions are exchanged for OH-.','H+ and OH- combine to give water.','Exhausted beds are regenerated with acid and caustic.'],
 ['Capacity is measured in equivalents or kg as CaCO3 between regenerations.','Conductivity or silica at the outlet signals exhaustion.','Mixed-bed polishers give high purity.'],
 'Resin fouling and incomplete regeneration.',
 'Boiler feed, process water and closed-loop cooling systems.');
E('Utilities & ETP','ETP Clarifier / Primary Settling','settle',
 'Settles suspended solids from wastewater before further treatment.',
 ['Wastewater enters the centre well.','Flocculated solids settle by gravity.','A scraper moves sludge to the hopper.','Clear water overflows the weir.'],
 ['Design is based mainly on surface overflow rate (m3/m2/day), checked against detention time and weir loading.','Coagulant and flocculant doses are set by jar tests.','Sludge is thickened and dewatered.'],
 'Septic or rising sludge, sludge carryover and short-circuiting.',
 'Effluent treatment plants.');
E('Utilities & ETP','Activated Sludge (Aeration) Tank','aerate',
 'Bacteria in an aerated tank consume dissolved organic pollutants.',
 ['Effluent enters the aeration tank.','Blowers add air through diffusers, giving oxygen to the microbes.','Microbes digest organics (BOD/COD) and form flocs.','The mixture goes to a clarifier, and part of the sludge is returned.'],
 ['Key parameters: F/M ratio, MLSS, SRT and dissolved oxygen (typically about 1.5-2 mg/L).','Toxic shocks (high TDS, solvents) can kill the culture.','Nutrients (N and P) must be balanced.'],
 'Foaming, sludge bulking and loss of biomass from shock loads.',
 'Biological treatment of pharma and chemical effluent.');

/* ============ DATA: INSTRUMENTS ============ */
var IN=[];
function I(cat,name,letters,num,kind,el,one,how,deep,watch,loop,use){
 IN.push({cat:cat,name:name,letters:letters,num:num,kind:kind||'field',el:el||'',tag:letters+'-'+num,one:one,how:how,deep:deep,watch:watch,loop:loop,use:use});
}

/* Temperature */
I('Temperature','Thermocouple','TE','101','field','',
 'Two different metals joined at one end make a tiny voltage that changes with temperature.',
 ['The measuring junction sits in the process.','A temperature difference between that junction and the reference end creates a small voltage (Seebeck effect).','The transmitter measures the millivolts and adds cold-junction compensation.','It converts the result to a temperature using the table for that thermocouple type.'],
 ['Common types are K (general purpose), J, T (low temperature) and R, S, B (platinum, very high temperature). Usable range depends on the type, construction, sheath, calibration requirements and the applicable standard.','Output is only tens of microvolts per degC (type K is about 41 uV/degC), so wiring noise and the correct extension cable matter.','Use matching thermocouple extension wire and observe polarity. Mixed-up cable gives wrong readings with no alarm.','Fast response and wide range, but less accurate and less stable than an RTD.'],
 'Cold-junction errors, wrong extension cable, drift with age, and ground loops.',
 'TE-101 > TT-101 > TIC-101 (DCS) > TV-101',
 'Furnaces, boilers, thermic fluid heaters, dryers, high-temperature reactors.');
I('Temperature','RTD (Pt100)','TE','102','field','',
 'A platinum wire whose electrical resistance rises in a very predictable way as it gets hotter.',
 ['A small current is passed through the platinum element.','Resistance changes with temperature (100 ohm at 0 degC for Pt100).','The transmitter measures the resistance.','It converts the resistance to temperature.'],
 ['Pt100 changes by roughly 0.385 ohm per degC on average near 0-100 degC (the slope is not exactly constant over the whole range). Above 0 degC: R = R0 x (1 + A x T + B x T squared), with A = 3.9083e-3 and B = -5.775e-7.','3-wire connections compensate for lead resistance (if leads are equal); 4-wire connections eliminate it. A 2-wire connection adds error.','Class A tolerance is +/-(0.15 + 0.002 x |T|) degC, valid only over a limited range (wire-wound -100 to 450 degC). Pt100s are typically used from -200 to about 600 degC.','Excitation current must be small to avoid self-heating.'],
 'Self-heating, lead-resistance errors on 2-wire sensors, moisture in the head, and vibration damage.',
 'TE-102 > TT-102 > TIC-102 (DCS) > TV-102',
 'Reactor and jacket temperature, product temperature, utilities.');
I('Temperature','Temperature Transmitter','TT','103','field','',
 'Converts the weak signal from a thermocouple or RTD into a standard 4-20 mA (or digital) signal for the control system.',
 ['The sensor signal enters the transmitter, usually in the connection head or on a DIN rail.','The transmitter linearises it and, for thermocouples, corrects for cold junction.','It outputs 4-20 mA, often with a HART digital signal on top.','The control system reads it as a temperature.'],
 ['4 mA = bottom of the range, 20 mA = top of the range. A live zero lets the system detect a broken wire.','NAMUR NE 43 commonly uses 3.8-20.5 mA as the normal and saturation range, with transmitter failure signalled at about 3.6 mA or below, or 21.0 mA or above. Exact behaviour depends on the device configuration.','Smart transmitters can be re-ranged and diagnosed remotely.'],
 'Wrong sensor type or range configured, and ambient temperature effects on head-mounted units.',
 'TE-103 > TT-103 > TIC-103 (DCS)',
 'Almost every temperature measurement that goes to the DCS or PLC.');
I('Temperature','Dial Thermometer (Bimetal)','TI','104','field','',
 'A local pointer gauge that uses a coil of two bonded metals that bend as they warm up.',
 ['A bimetallic strip or coil sits in the stem.','Two metals with different expansion bend the coil when heated.','The bending turns a pointer over a dial.','The operator reads the temperature locally.'],
 ['Cheap, no power needed, typical accuracy about +/-1% of span.','Often installed in a thermowell so it can be removed under process pressure.','Use as a local check beside the transmitter.'],
 'Stem too short, mechanical shock, and parallax when reading the dial.',
 'TI-104 (local reading only)',
 'Local indication on utilities, pipes and vessels.');
I('Temperature','Thermowell','TW','105','field','',
 'A closed metal sleeve that protects the temperature sensor and lets it be changed without opening the process.',
 ['The thermowell is screwed, flanged or welded into the vessel or pipe.','The sensor slides into it and touches the bottom.','Heat passes through the wall to the sensor.','The sensor can be removed while the process stays closed.'],
 ['The well slows response time compared with a bare sensor. Thin or tapered wells respond faster.','Insertion length should be enough to avoid stem-conduction error (a common rule is 10 x diameter).','In flowing fluids, vortex shedding can resonate with the well and break it. Check with ASME PTC 19.3 TW.'],
 'Thermowell failure from resonance, corrosion and poor thermal contact.',
 'TW-105 holds TE-101 or TE-102',
 'Reactors, pipes, hot-oil and steam lines.');
I('Temperature','Temperature Switch','TSH','106','field','',
 'Changes an electrical contact when temperature crosses a set value, used for alarm or trip.',
 ['A sensor measures temperature.','At the set value the switch snaps over.','A contact signals the alarm or interlock.','It resets after the temperature falls past the deadband.'],
 ['An independent switch with its own sensor protects against failure of the control loop, because the control transmitter and its sensor could fail together.','HH or LL versions are used for trips and H or L for alarms.','Set the trip well within the design limit and verify during proof tests.'],
 'Drift, setpoint tampering and no regular proof test.',
 'TSH-106 > alarm / shutdown logic',
 'High-temperature trips on heaters, reactors and bearings.');

/* Pressure */
I('Pressure','Bourdon Pressure Gauge','PI','201','field','',
 'A local dial gauge. A curved tube tries to straighten as pressure rises and moves the pointer.',
 ['Process pressure enters a curved, flattened tube.','The tube straightens slightly.','A linkage and gear turn the pointer.','The scale shows the pressure.'],
 ['Pick a range so normal pressure sits in the middle of the scale (about 25-75%).','Liquid-filled cases damp vibration. Accuracy classes such as 0.6, 1.0 and 1.6 are defined in EN 837-1.','Use a diaphragm seal for viscous, crystallising or corrosive media.','For gas, high-pressure or hazardous service, use a safety-pattern gauge with a solid front and blow-out back (EN 837-1 S3).'],
 'Over-range damage, pulsation, blocked socket and wrong material for the fluid.',
 'PI-201 (local reading only)',
 'Pumps, compressors, receivers, steam and air lines.');
I('Pressure','Pressure Transmitter','PT','202','field','',
 'Measures pressure and sends it as a 4-20 mA signal to the control system.',
 ['Process pressure bends a thin sensing diaphragm.','A capacitive or strain-gauge element converts the movement to an electrical signal.','The electronics send 4-20 mA (with HART).','The DCS shows the pressure.'],
 ['Types: gauge, absolute, vacuum and sealed gauge. Choose by reference pressure.','Zero and span trims correct drift. Mount position changes the zero for liquid-filled lines.','Use a two-valve (block and bleed) manifold for isolation, venting and zeroing.','Impulse lines should slope and be protected against freezing and plugging.'],
 'Plugged impulse lines, zero shift, and over-pressure damage.',
 'PT-202 > PIC-202 (DCS) > PV-202',
 'Reactors, columns, vacuum systems, utility headers.');
I('Pressure','Differential Pressure Transmitter','PDT','203','field','',
 'Measures the difference between two pressures. It is the basis of many flow and level measurements.',
 ['High and low pressure ports connect to the two points.','The diaphragm moves with the difference.','Electronics convert it to 4-20 mA.','The control system shows differential pressure or a calculated flow or level.'],
 ['For flow: Q is proportional to the square root of the DP across an orifice.','For level: DP = rho x g x h.','For filters: rising DP shows loading and tells you when to clean.','A manifold equalises both sides for zeroing.'],
 'Blocked impulse lines, trapped gas or liquid in lines and wrong tapping position.',
 'PDT-203 > PDI-203 (DCS)',
 'Filter DP, flow with orifice, level in closed tanks.');
I('Pressure','Diaphragm (Chemical) Seal','PI','204','field','',
 'A flexible metal diaphragm that keeps the process away from the gauge or transmitter and passes pressure through a fill fluid.',
 ['Process presses on the seal diaphragm.','Pressure is passed to the instrument by a fill fluid in a capillary or direct mount.','The instrument senses the pressure.','Process never enters the instrument.'],
 ['Often used for viscous, corrosive, crystallising, hygienic or hot services.','Fill-fluid expansion with temperature and long capillaries add error and slow the response.','Select diaphragm material (Hastelloy, tantalum, PTFE) for the chemical.'],
 'Fill-fluid leaks, temperature errors and diaphragm damage.',
 'PI-204 with seal (local reading)',
 'Slurries, sticky products, reactors with aggressive fluids.');
I('Pressure','Pressure Switch','PSH','205','field','',
 'Closes or opens a contact when pressure crosses a set value, used for alarms and trips.',
 ['Pressure acts on a piston or diaphragm against a spring.','At the set value the mechanism snaps a contact.','The contact signals an alarm or shutdown.','The switch resets after the deadband.'],
 ['Hysteresis (deadband) prevents chatter around the set point.','Independent switches protect when the transmitter loop fails.','Safety-rated switches have a proof-test interval.'],
 'Setpoint drift, chatter and blocked sensing line.',
 'PSH-205 > alarm / shutdown logic',
 'High-pressure trips, low air pressure alarms, pump protection.');

/* Level */
I('Level','Gauge Glass / Magnetic Level Gauge','LG','301','field','',
 'A local window or magnetic indicator that shows liquid level in a vessel.',
 ['A side chamber is connected to the vessel at the top and bottom.','Liquid level in the chamber matches the vessel.','A glass shows it directly, or a magnetic float flips coloured flaps.','The operator reads the level.'],
 ['Reflex and transparent glasses are cheap but fragile. Magnetic gauges are fully enclosed, safer for toxic or hot services.','Level in a chamber with different temperature from the vessel can read wrong because density differs.','Fit isolation valves with ball checks on hazardous services.'],
 'Glass breakage, dirty glass and wrong reading from temperature or density difference.',
 'LG-301 (local reading)',
 'Receivers, storage tanks and reactors.');
I('Level','DP Level Transmitter','LT','302','field','',
 'Calculates liquid level from the pressure that the liquid column creates at the bottom of the vessel.',
 ['The pressure at the bottom rises with the height of the liquid.','The transmitter measures it (DP across the vessel in closed tanks).','The electronics convert it into level using the liquid density.','The DCS shows level in % or mm.'],
 ['DP = rho x g x h, so level h = DP / (rho x g).','Closed tanks need a wet or dry leg on the low side. Zero suppression or elevation corrects for leg fill and mounting position.','Density change (temperature, composition) changes the reading.','Remote seals avoid plugging and condensing leg problems.'],
 'Density change, wet-leg evaporation and plugged impulse lines.',
 'LT-302 > LIC-302 (DCS) > LV-302',
 'Storage tanks, reactors, receivers and column bases.');
I('Level','Radar Level Transmitter (Non-contact)','LT','303','field','',
 'Sends microwaves down at the liquid surface and times the echo to find the level.',
 ['The antenna emits radar pulses (or a frequency sweep).','They reflect from the liquid surface.','The device measures the echo time.','Distance to the surface gives level.'],
 ['Level = tank height minus measured distance. Time of flight t = 2d / c.','Largely insensitive to liquid density, needs no contact with the product and has no moving parts. Temperature, pressure, vapour conditions, dielectric properties and internal obstructions can still affect performance.','High-frequency (about 80 GHz) models give narrow beams for small nozzles and agitated tanks.','Low-dielectric liquids, foam and agitator blades can reduce the echo.'],
 'Foam, condensation on the antenna and false echoes from agitators or nozzles.',
 'LT-303 > LIC-303 (DCS)',
 'Solvent tanks, reactors, corrosive liquids, ETP tanks.');
I('Level','Guided Wave Radar (GWR)','LT','304','field','',
 'Sends radar pulses along a probe (rod or cable) dipped into the liquid and detects the reflection at the surface.',
 ['A pulse travels down the probe.','Part reflects where the liquid starts.','Time of flight gives the distance.','Level (and sometimes the interface of two liquids) is calculated.'],
 ['Works well in narrow chambers, bridles and tanks with internals.','Can measure the interface between oil and water.','Probe coating and build-up shift the signal. Choose a coaxial probe for clean, low-dielectric products; use a single rod or cable probe for dirty or coating products.'],
 'Product build-up, probe touching the wall and agitator contact.',
 'LT-304 > LIC-304 (DCS)',
 'Side chambers, small vessels, interface measurement.');
I('Level','Ultrasonic Level Transmitter','LT','305','field','',
 'Sends a sound pulse at the surface and measures how long the echo takes to return.',
 ['A transducer emits an ultrasonic pulse.','The pulse reflects from the surface.','The transmitter times the echo.','Distance = speed of sound x time / 2.'],
 ['Speed of sound varies with temperature, so a temperature sensor is built in.','Vapour, foam, dust and heavy turbulence weaken the signal. It needs a clear air path.','Economical for open tanks, sumps and wastewater channels.'],
 'Foam, steam and temperature layers in the air gap.',
 'LT-305 > LIC-305 (DCS)',
 'ETP sumps, water tanks and open channels.');
I('Level','Capacitance Level Probe','LT','306','field','',
 'A probe that senses level from the change in electrical capacitance as the liquid covers it.',
 ['The probe and the vessel wall form a capacitor.','The liquid replaces air as the dielectric.','Capacitance rises with level.','The electronics convert it into a level signal.'],
 ['Dielectric constant of the product sets the sensitivity. Water is about 80, many solvents are 2-20, and air is 1.','Insulated probes are used for conductive liquids.','Coating and sticky layers can fool it. Use an active-shield design.'],
 'Coating build-up and a changing product dielectric.',
 'LT-306 > LIC-306 (DCS)',
 'Interface detection, point level, solids and slurries.');
I('Level','Float / Displacer Level Transmitter','LT','307','field','',
 'Uses the buoyancy force on a float or displacer to measure level or interface.',
 ['A displacer hangs in a chamber and is immersed by the liquid.','Buoyant force (Archimedes) reduces its apparent weight.','A torque tube turns that change into a signal.','Electronics convert it to level.'],
 ['Force change = rho x g x A x h, so the density must be known or stable.','Good for interface measurement between liquids with different density.','Mechanical parts need maintenance.'],
 'Fouling, density change and stuck float.',
 'LT-307 > LIC-307 (DCS)',
 'Separators, boiler drums and interface level.');
I('Level','Level Switch (Vibrating Fork)','LSH','308','field','',
 'A tuning fork that vibrates freely in air and is damped when covered by liquid, so it signals the level has been reached.',
 ['A piezo element vibrates the fork.','In air it vibrates at full frequency.','When liquid covers it, frequency and amplitude change.','The electronics switch an output contact.'],
 ['Independent high-level protection (LSHH) prevents overfilling and is often part of the safety function.','Largely unaffected by foam, bubbles or pressure, but the liquid must be above the minimum density (typically about 0.5-0.7 g/cm3).','Proof test by lifting from the product or using the test function.'],
 'Build-up on the fork and mounting in a dead leg.',
 'LSH-308 > alarm / pump trip',
 'Overfill protection, dry-run protection, sump control.');
I('Level','Weighing System (Load Cell)','WT','309','field','',
 'Weighs a vessel on load cells to find its contents by mass, regardless of density.',
 ['Load cells support the vessel legs or the hopper.','Weight stresses a strain gauge in each cell.','The signals add up in the weight indicator.','The contents are found by subtracting the tare weight.'],
 ['Gives true mass for batching and charging, even for slurries and foaming liquids.','Piping connections, wind and vibration add errors. Use flexible connections.','Calibrate with test weights.'],
 'Rigid piping loads, overload and moisture in cell cables.',
 'WT-309 > WIC-309 (DCS) > charge pump / valve',
 'Batch charging, drum filling, hopper inventory.');

/* Flow */
I('Flow','Orifice Plate with DP Transmitter','FE','401','field','orifice',
 'A plate with a hole narrows the flow and the pressure drop across it tells you the flow rate.',
 ['Fluid is forced through the hole in the plate.','Velocity rises and pressure falls just after the plate.','A DP transmitter measures the pressure difference.','Flow is calculated from the square root of that difference.'],
 ['Q = Cd x A x sqrt(2 x DP / rho) / sqrt(1 - beta to the fourth), where beta is the hole diameter divided by the pipe diameter.','Rangeability is typically about 3:1 to 4:1 (more with smart transmitters) because DP varies as flow squared. Use a square-root extractor or the DCS to linearise.','Needs straight pipe before and after the plate (often 15-45 D upstream and 6-8 D downstream per ISO 5167-2, depending on beta and fittings).','Permanent pressure loss is significant, and the sharp edge wears.'],
 'Worn edge, plugged taps, wrong orientation and liquid or gas in the impulse lines.',
 'FE-401 > FT-401 > FIC-401 (DCS) > FV-401',
 'Utility lines, steam, solvents and general process flows.');
I('Flow','Rotameter (Variable Area)','FI','402','field','',
 'A float rises in a tapered tube as flow increases. The float height shows the flow rate.',
 ['Fluid enters at the bottom of a vertical tapered tube.','Flow lifts the float until drag plus buoyancy balance its weight.','The ring area around the float grows with height.','The float position is read on the scale.'],
 ['It is an area flowmeter: at constant pressure drop, flow is proportional to the annular area.','Scale is calibrated for a given fluid density and viscosity.','Metal-tube versions with magnetic coupling suit hot, hazardous or opaque fluids.'],
 'Dirty tube, wrong fluid for the scale and pulsating flow.',
 'FI-402 (local reading, optional switch)',
 'Purge gas, cooling water to equipment, small dosing lines.');
I('Flow','Magnetic Flowmeter','FT','403','field','',
 'Measures the flow of a conductive liquid using a magnetic field. The pipe stays completely open.',
 ['Coils around the pipe create a magnetic field across it.','A conductive liquid moving through the field generates a voltage (Faraday law).','Electrodes in the wall pick up that voltage.','The voltage is proportional to velocity, from which flow is calculated.'],
 ['Voltage E = k x B x D x v. No moving parts and no obstruction.','The liquid needs a minimum conductivity (typically about 5 uS/cm). It will not work with pure hydrocarbons, gases or deionised water that is too pure.','Liner (PTFE, rubber) and electrode material (Hastelloy, tantalum) must suit the chemical.','Needs a full pipe and good earthing.'],
 'Empty pipe, coating on electrodes and poor grounding.',
 'FT-403 > FIC-403 (DCS) > FV-403',
 'Water, acids, caustic, slurries and effluent.');
I('Flow','Coriolis Flowmeter','FT','404','field','',
 'Measures true mass flow (and density) by vibrating tubes that twist slightly when fluid flows through them.',
 ['Tubes are vibrated at their natural frequency.','Moving fluid makes the tubes twist.','Sensors detect the phase shift between two points.','The twist is proportional to mass flow, and the frequency gives density.'],
 ['High-end Coriolis meters can reach roughly +/-0.1-0.2% of reading under specified conditions. They are largely insensitive to the upstream velocity profile, but fluid properties, entrained gas, installation and meter design still affect performance.','Excellent for batching and dosing and for custody transfer.','Entrained gas bubbles upset the signal. Pressure drop and cost are usually higher than for most other meters.','Install away from strong vibration.'],
 'Gas slugs, vibration, and zero drift after installation stress.',
 'FT-404 > FQIC-404 (batch totaliser) > charge valve',
 'Batch charging, dosing, high-value liquids.');
I('Flow','Vortex Flowmeter','FT','405','field','',
 'A blunt bar in the pipe sheds swirls (vortices) whose frequency tells you the flow velocity.',
 ['A bluff body sits across the flow.','Vortices shed alternately from each side.','A sensor detects the shedding frequency.','Frequency is proportional to velocity: f = St x v / d.'],
 ['Good for steam, gas and clean liquids over a wide range.','Needs a minimum Reynolds number, so it is poor on very viscous liquids at low flow.','Pipe vibration can give false readings at low flow.'],
 'Low flow cut-off, vibration and wet steam.',
 'FT-405 > FIC-405 (DCS)',
 'Steam, compressed air, nitrogen and water.');
I('Flow','Turbine Flowmeter','FT','406','field','',
 'A small turbine spins in the flow. Its rotation speed is proportional to the flow velocity.',
 ['Fluid passes over the turbine blades.','The rotor spins at a speed set by velocity.','A pickup counts blade passes.','Pulse frequency is converted to flow.'],
 ['High accuracy and repeatability on clean, low-viscosity liquids.','Bearings wear and viscosity changes shift the calibration.','Needs a strainer and straight pipe.'],
 'Bearing wear, solids and over-speeding on gas flushing.',
 'FT-406 > FQI-406 (totaliser)',
 'Solvent and fuel transfer, clean liquid metering.');
I('Flow','Ultrasonic Flowmeter (Transit Time)','FT','407','field','',
 'Measures flow by timing ultrasonic pulses sent with and against the flow. Clamp-on versions need no pipe cut.',
 ['Two transducers send pulses diagonally across the pipe.','The pulse travelling with the flow is faster than the one against it.','The time difference is proportional to velocity.','Flow is velocity times area.'],
 ['Clamp-on types do not touch the fluid, so they suit temporary checks and hard-to-shut-down lines.','Needs a full pipe, clean fluid and a known pipe wall and liner.','Gas bubbles and solids reduce signal strength.'],
 'Air in the pipe, wrong pipe data and a poor acoustic coupling.',
 'FT-407 > FI-407 (DCS)',
 'Water, cooling circuits, large pipes and verification of other meters.');
I('Flow','Thermal Mass Flowmeter (Gas)','FT','408','field','',
 'A heated sensor is cooled by the gas flow. The cooling tells you the mass flow of the gas.',
 ['One sensor is heated above gas temperature.','Moving gas carries heat away.','The power needed to keep the temperature difference measures mass flow.','The output is mass or standard volume flow.'],
 ['Reads mass flow directly with no pressure or temperature compensation.','Calibrated for a specific gas. Composition changes shift the reading.','Moisture and condensation foul or damage the sensor.'],
 'Wet gas, composition changes and contamination of the sensor.',
 'FT-408 > FIC-408 (DCS)',
 'Nitrogen, compressed air, biogas and flare lines.');

/* Analytical */
I('Analytical','pH Analyser','AT','501','field','',
 'Measures how acidic or basic a liquid is using a special glass electrode.',
 ['A glass bulb develops a small voltage that depends on the hydrogen-ion activity outside it.','A reference electrode gives a stable comparison.','The transmitter reads the voltage difference.','It converts the voltage to pH, with temperature compensation.'],
 ['Nernst equation: about 59.16 mV per pH unit at 25 degC.','Calibrate with at least two buffers (e.g. pH 4 and 7 or 7 and 10). Slope and offset show electrode health.','Coating, a dry glass bulb and an exhausted reference all cause drift.','Use a flow-through or retractable holder for easy cleaning.'],
 'Fouled or aged electrode, wrong temperature compensation and poor mixing at the sensor.',
 'AT-501 > AIC-501 (DCS) > dosing pump',
 'Neutralisation, ETP, scrubber liquor and reaction monitoring.');
I('Analytical','Conductivity Analyser','AT','502','field','',
 'Measures how well a liquid carries electric current, which shows the amount of dissolved ions.',
 ['Electrodes in the liquid carry a small AC current.','Conductance depends on ion concentration.','The cell constant converts it to conductivity (uS/cm or mS/cm).','Temperature compensation corrects it to a reference temperature.'],
 ['Higher conductivity means more dissolved salts. Pure water is about 0.055 uS/cm at 25 degC.','Used to monitor DM water quality, detect leaks in heat exchangers, and distinguish interfaces between liquids.','Inductive (toroidal) sensors suit dirty or corrosive liquids.'],
 'Fouled electrodes and wrong cell constant.',
 'AT-502 > AI-502 (DCS) > alarm',
 'DM water, cooling tower blowdown, CIP and condensate return.');
I('Analytical','Dissolved Oxygen (DO) Probe','AT','503','field','',
 'Measures the amount of oxygen dissolved in water.',
 ['A sensing layer reacts to dissolved oxygen (optical luminescence or an electrochemical cell).','The signal depends on the oxygen level.','The transmitter converts it to mg/L.','The value drives the blower or aerator.'],
 ['Optical probes need no electrolyte and drift less than membrane sensors.','Aeration tanks are often run at about 1.5-2 mg/L DO for good treatment without wasting power.','Solubility falls as temperature and salinity rise.'],
 'Biofilm on the sensor and calibration drift.',
 'AT-503 > AIC-503 (DCS) > blower speed',
 'ETP aeration tanks, fermenters and (with trace ppb sensors) boiler feed water.');
I('Analytical','Turbidity Analyser','AT','504','field','',
 'Measures how cloudy a liquid is from the light scattered by suspended particles.',
 ['A light beam passes through the sample.','Particles scatter the light.','A detector at 90 degrees measures the scattered light.','The result is given in NTU.'],
 ['Higher turbidity means more suspended solids.','Air bubbles read as turbidity, so use a bubble trap.','Windows must be kept clean.'],
 'Bubbles, fouled optics and ambient light leakage.',
 'AT-504 > AI-504 (DCS)',
 'Clarifier outlets, filter effluent and water treatment.');
I('Analytical','Karl Fischer Moisture Titrator','AT','505','field','',
 'A laboratory or online titration that measures water content very accurately by a chemical reaction with iodine.',
 ['The sample is dissolved in a KF solvent.','Iodine reacts with water in the presence of sulphur dioxide and a base.','The titrator detects the end point electrically.','Water content is calculated from the iodine used.'],
 ['Coulometric KF measures ppm levels, and volumetric KF suits higher water contents.','Differs from loss on drying (LOD), which also removes volatile solvents.','Atmospheric moisture is the main source of error, so keep the cell sealed.'],
 'Moist air entering, exhausted reagent and interfering side reactions with some samples.',
 'AT-505 (QC laboratory instrument)',
 'API release, solvent water content and drying end-point checks.');
I('Analytical','Combustible Gas (LEL) Detector','AT','506','field','',
 'Detects flammable gas or vapour in the air and warns before it reaches an explosive level.',
 ['A sensor (catalytic bead or infrared) is exposed to the air.','Flammable gas changes the signal.','The transmitter converts it to % LEL.','Alarms and ventilation or shutdown actions follow.'],
 ['LEL is the lowest concentration that can burn. Alarm setpoints depend on the site, the gas and the applicable standard. 10-20% LEL is commonly used for combustible-gas alarms, and higher alarm or trip levels may be set by the plant hazard analysis. Do not treat any single value as universal.','Catalytic sensors can be poisoned by silicones, H2S and halogens. IR sensors are less affected.','Calibrate with test gas and bump-test at regular intervals.'],
 'Sensor poisoning, blocked guard and no regular bump test.',
 'AT-506 > gas alarm panel > ventilation / ESD',
 'Solvent storage, reactor bays and pump areas.');
I('Analytical','Oxygen Analyser','AT','507','field','',
 'Measures the oxygen content in a gas stream, usually to prove that an inert atmosphere is safe.',
 ['A gas sample reaches the sensor (paramagnetic, zirconia or electrochemical).','The sensor signal depends on oxygen concentration.','The transmitter converts it to % O2 or ppm.','It alarms or trips if oxygen is above a set limit.'],
 ['Keep oxygen below the limiting oxygen concentration (LOC) of the solvent, with a safety margin, during nitrogen blanketing or inerting.','Many organic solvents have an LOC of about 10-12% O2 in nitrogen; hydrogen and some others are much lower, so always check the actual LOC.','Calibrate with air (20.9%) and a zero gas.'],
 'Sample line leaks and sensor ageing.',
 'AT-507 > AIC-507 (DCS) > nitrogen valve',
 'Dryer inerting, reactor and tank blanketing.');
I('Analytical','Density Meter','DT','508','field','',
 'Measures liquid density using a vibrating tube. Heavier fluid makes the tube vibrate more slowly.',
 ['A U-shaped tube is vibrated.','Fluid inside changes the vibration frequency.','Frequency relates to density.','The transmitter outputs density or concentration.'],
 ['Density can show concentration of acids, caustic and sugars after calibration.','Coriolis flowmeters also give density.','Gas bubbles and deposits upset the reading.'],
 'Fouling, bubbles and temperature effects.',
 'DT-508 > DI-508 (DCS)',
 'Concentration monitoring and interface detection.');

/* Final Control & Safety */
I('Final Control & Safety','Control Valve','FV','601','field','valve',
 'A valve, usually air-operated, that opens or closes to change the flow, driven by a signal from the controller.',
 ['The controller sends a signal (4-20 mA through an I/P or positioner).','Air pressure moves the actuator.','The stem moves the plug in the valve body.','The opening changes, and so does the flow.'],
 ['Sizing: Q = Cv x sqrt(DP / SG) for liquids (Q in US gpm, DP in psi). Choose Cv so the valve works at about 20-80% travel.','Inherent characteristics: linear, equal percentage, quick opening. Installed characteristic depends on the system.','Select fail action for a safe state: fail-open (FO), fail-closed (FC) or fail-in-place (FL).','Cavitation and flashing damage trim and body.'],
 'Oversizing, stiction, cavitation, leaking seats and a wrong fail action.',
 'FT-601 > FIC-601 (DCS) > FY-601 > FV-601',
 'Flow, pressure, temperature and level control everywhere.');
I('Final Control & Safety','Valve Positioner','ZC','602','field','valve',
 'A device on the valve that compares the actual stem position with the controller signal and corrects any difference.',
 ['It receives the 4-20 mA command.','A sensor reads the real stem position.','If they differ, it adds or vents air to the actuator.','The valve reaches the position that was asked for.'],
 ['Overcomes packing friction, hysteresis and process forces.','Smart positioners give diagnostics (friction, travel, supply pressure) and support partial stroke tests.','Tuning matters. Too high a gain causes limit cycling.'],
 'Dirty or wet supply air and loose linkages.',
 'FIC-602 > ZC-602 (positioner) > FV-602',
 'Almost all modulating control valves.');
I('Final Control & Safety','I/P Converter','FY','603','field','',
 'Converts an electrical 4-20 mA signal into a proportional air pressure (3-15 psi or 0.2-1 bar).',
 ['The 4-20 mA signal drives a small coil.','A nozzle-flapper mechanism changes air pressure.','Output air pressure follows the current.','The pneumatic signal positions the actuator.'],
 ['Letter Y marks a relay or converting function.','The instrument air must be clean, dry and regulated.','Modern positioners often include the I/P function.'],
 'Blocked nozzle from dirty air and supply pressure that is too low.',
 'FIC-603 > FY-603 (I/P) > FV-603',
 'Older control valves and pneumatic dampers.');
I('Final Control & Safety','Solenoid Valve','XY','604','field','solenoid',
 'An electrically operated pilot valve that sends or vents air to an actuator, or opens and closes a small line.',
 ['The coil is energised.','The magnetic field lifts the plunger.','The air path opens or closes.','The actuator moves, and when de-energised a spring returns it.'],
 ['Fail-safe designs de-energise to trip. A loss of power moves the valve to its safe state.','Coil voltage, ATEX or IECEx rating and enclosure rating must match the area.','Direct-acting and pilot-operated types differ in minimum pressure needs.'],
 'Coil burnout, dirty air and wrong fail state.',
 'PLC output > XY-604 > XV-604 actuator',
 'Trip solenoids, valve air supply and small utility lines.');
I('Final Control & Safety','On/Off (Shutdown) Valve','XV','605','field','onoff',
 'A valve that is either fully open or fully closed, used for isolation and emergency shutdown.',
 ['The control system sends an open or close command to a solenoid.','Air moves a spring-return actuator.','The valve goes fully open or closed.','Limit switches confirm the position.'],
 ['Safety shutdown valves are specified with closing time, tight shut-off and a defined fail position.','Partial stroke testing proves the valve can move without a shutdown.','Safety function reliability is demonstrated with SIL calculations and proof tests.'],
 'Seized valve from lack of movement, slow closing and a failed solenoid.',
 'LSHH-605 > logic solver > XY-605 > XV-605',
 'Feed isolation, steam isolation and emergency shutdown.');
I('Final Control & Safety','Pressure Safety Valve (PSV)','PSV','606','field','psv',
 'A spring-loaded valve that opens by itself at a set pressure to protect equipment from over-pressure, then closes again.',
 ['Normal pressure keeps the disc closed with the spring.','At set pressure the force on the disc exceeds the spring force.','In gas service the valve pops open (liquid valves open more gradually) and discharges to a safe place.','When pressure falls below the reseat pressure it closes.'],
 ['Relief loads follow API 521, orifice sizing follows API 520 Part I, and standard valve sizes come from API 526, together with local codes. For the applicable ASME/API cases, typical maximum accumulation is 10% for a single-device non-fire case and 21% for an external-fire case. Other configurations and codes can differ.','Types: conventional, balanced-bellows (for back pressure) and pilot-operated.','High inlet pressure loss (above about 3% of set pressure) or high back pressure can cause chatter.','Test and calibrate at set intervals. Never leave the equipment unprotected; any block valves at the PSV must be full-bore and car-sealed or locked open under strict administrative control.'],
 'Chatter, fouling, seat leakage and blocked discharge or inlet.',
 'PSV-606 > flare / catch tank / safe location',
 'Reactors, boilers, receivers, columns and pressure vessels.');
I('Final Control & Safety','Rupture Disc','PSE','607','field','disc',
 'A thin metal disc that bursts at a set pressure to open a full relief path. It is used once and replaced.',
 ['Normal pressure acts on the disc.','At the burst pressure the disc ruptures.','A large opening gives rapid relief.','The disc must be replaced after burst.'],
 ['Gives tight sealing before burst and very fast response, so it is useful against runaway reactions.','Often fitted under a PSV to protect it from corrosive or fouling process, with a pressure gauge between them.','Maximum operating pressure depends on disc type: about 70% of burst for plain forward-acting discs, 80-90% for scored forward-acting, and up to 90-95% for reverse-acting; follow the manufacturer.','Pressure cycling causes fatigue.'],
 'Fatigue failure, wrong orientation and vacuum cycles without a support.',
 'PSE-607 > vent / catch tank',
 'Reactors, process vessels and PSV protection.');
I('Final Control & Safety','PID Controller (DCS Loop)','FIC','608','dcs','',
 'The control-system function that compares the measurement with the setpoint and moves the valve to remove the difference.',
 ['The transmitter signal is compared with the setpoint (error = SP - PV).','The controller calculates an output with its PID algorithm.','The output goes to the control valve.','The process responds and the loop repeats.'],
 ['u = Kp x (e + (1/Ti) x integral of e dt + Td x de/dt).','Flow loops are fast and usually use PI. Slow temperature loops often benefit from PID. Level loops often use P or PI with a gap to smooth flow changes.','Set controller action (direct or reverse) correctly. Use anti-windup, auto/manual and cascade modes where useful.','Noise with derivative action needs filtering.'],
 'Wrong action, poor tuning, integral windup and noisy measurement.',
 'FT-608 > FIC-608 (DCS) > FY-608 > FV-608',
 'All continuous control loops.');
I('Final Control & Safety','Safety Instrumented Function (Interlock)','UY','609','plc','',
 'An independent safety system that detects a dangerous condition and forces the process to a safe state.',
 ['A sensor detects a hazardous condition (for example high-high pressure).','A logic solver (safety PLC) evaluates it.','The logic solver trips the final element (shutdown valve, motor trip).','The process goes to a safe state and stays there until reset.'],
 ['IEC 61511 defines SIL levels. In low-demand mode: SIL 1 has an average PFD of 1e-2 to 1e-1, SIL 2 has 1e-3 to 1e-2, and SIL 3 has 1e-4 to 1e-3.','Sensor, logic solver and final element all count in the reliability calculation.','Provide the required independence from the basic process control system and address common-cause and dependent failures as required by the safety lifecycle and risk assessment. Proof-test it at the defined interval.','Bypasses need a strict permit.'],
 'Untested trips, bypassed interlocks and common-cause failures.',
 'PT-609 > UY-609 (SIS logic solver) > XV-609 closes',
 'Reactor trips, furnace safety and overfill protection.');

/* Monitoring & Position */
I('Monitoring & Position','Vibration Transmitter','VT','701','field','',
 'Measures machine vibration to detect developing faults in bearings, shafts and rotors.',
 ['An accelerometer or velocity sensor is mounted on the bearing housing.','Machine vibration produces a signal.','The transmitter converts it to RMS velocity (mm/s) or acceleration.','Alarm and trip levels protect the machine.'],
 ['ISO 10816 / 20816 give vibration severity zones by machine class.','Trend analysis with spectra identifies unbalance, misalignment and bearing defects.','Mount on a flat, rigid surface close to the bearing.'],
 'Loose mounting and cable damage.',
 'VT-701 > VAH-701 alarm > machine trip',
 'Pumps, compressors, blowers, fans and centrifuges.');
I('Monitoring & Position','Speed Sensor','ST','702','field','',
 'Counts teeth or marks on a rotating shaft to measure speed.',
 ['A magnetic or proximity sensor faces a toothed wheel or target.','Each tooth passing produces a pulse.','The transmitter counts pulses per second.','It converts them to rpm.'],
 ['Used for zero-speed detection and overspeed trips.','Gap between sensor and target must be within the datasheet range.','Pulse rate: rpm = (pulses per second x 60) / number of teeth.'],
 'Wrong gap and dirty targets.',
 'ST-702 > SI-702 (DCS) > alarm',
 'Agitators, centrifuges, fans and pumps.');
I('Monitoring & Position','Position Transmitter / Limit Switch','ZT','703','field','',
 'Reports the actual position of a valve or damper, or a limit switch showing open or closed.',
 ['A sensor on the stem or shaft tracks the position.','It outputs a signal (4-20 mA or open/closed contacts).','The DCS compares command with actual.','A mismatch gives an alarm.'],
 ['Limit switches are named ZSO (open) and ZSC (closed).','Position feedback is used to prove that a shutdown valve moved.','Calibrate end positions during commissioning.'],
 'Linkage wear, switch misalignment and water ingress.',
 'ZT-703 > ZI-703 (DCS)',
 'Control valves, shutdown valves and dampers.');
I('Monitoring & Position','Motor Current Transmitter','IT','704','field','',
 'Measures the current drawn by a motor, which shows the load on the pump or agitator.',
 ['A current transformer or shunt measures the motor current.','The transmitter converts it to 4-20 mA.','The DCS shows the load.','Low or high current gives an alarm.'],
 ['Low current on a centrifugal pump suggests dry running, a closed suction or a closed discharge. High current suggests runout (excess flow), higher density or viscosity, or a mechanical fault.','Agitator current changes with viscosity during a reaction, which can be used as an end-point or safety clue.','Compare with the nameplate full-load current.'],
 'Wrong CT ratio and VFD harmonics.',
 'IT-704 > II-704 (DCS) > IAL-704 (low) / IAH-704 (high)',
 'Pumps, agitators, centrifuges and compressors.');

/* ============ APP LOGIC ============ */
var $=function(id){return document.getElementById(id);};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
var KIND={field:'Field mounted',room:'Control room / main panel',aux:'Auxiliary / local panel',dcs:'DCS (shared display and control)',plc:'PLC / safety logic',comp:'Computer function'};
var FIRST={A:'Analysis',D:'Density',F:'Flow',H:'Hand (manual)',I:'Current (electrical)',L:'Level',P:'Pressure / vacuum',S:'Speed / frequency',T:'Temperature',U:'Multivariable',V:'Vibration',W:'Weight / force',X:'Unclassified',Z:'Position'};
var MOD={D:'Differential',F:'Ratio',Q:'Totalise',K:'Rate of change',J:'Scan'};
var FUNC={I:'Indicator',R:'Recorder',C:'Controller',T:'Transmitter',E:'Primary element',V:'Valve',S:'Switch',H:'High',L:'Low',A:'Alarm',Y:'Relay / convert / compute',G:'Glass / gauge',W:'Well / probe',Z:'Driver / actuator'};

function decode(t){
  t=String(t).toUpperCase().trim();
  var parts=t.split(/[-\s]/);
  var L=(parts[0]||'').replace(/[^A-Z]/g,'');
  var n=parts[1]||'';
  if(!L){return 'Type a tag such as LIC-201.';}
  var f=L.charAt(0);
  if(!FIRST[f]){return 'First letter "'+esc(f)+'" is not in the short table here (the full ISA 5.1 list has more).';}
  var lines=[],words=[];
  var rest=L.slice(1);
  var mod='';
  if(rest.length>1&&MOD[rest.charAt(0)]){mod=rest.charAt(0);rest=rest.slice(1);}
  if(mod){lines.push(mod+' = '+MOD[mod]);words.push(MOD[mod]);}
  lines.push(f+' = '+FIRST[f]);words.push(FIRST[f].split(' /')[0].split(' (')[0]);
  if(rest==='SV'){
    lines.push('SV = Safety valve');words.push('Safety Valve');
  }else{
    var i=0;
    while(i<rest.length){
      var two=rest.substr(i,2);
      if(two==='HH'){lines.push('HH = High-high');words.push('High-High');i+=2;continue;}
      if(two==='LL'){lines.push('LL = Low-low');words.push('Low-Low');i+=2;continue;}
      var c=rest.charAt(i);
      if(FUNC[c]){lines.push(c+' = '+FUNC[c]);words.push(FUNC[c].split(' /')[0]);}
      else{lines.push(c+' = ?');words.push('?');}
      i++;
    }
  }
  var h='<b>'+esc(words.join(' '))+'</b>'+(n?' (loop '+esc(n)+')':'');
  h+='<div style="color:var(--mute);margin-top:4px;font-size:13px">'+lines.map(esc).join(' &nbsp;|&nbsp; ')+'</div>';
  return h;
}

/* ============ EXTRA DATA ============ */
var QFRAW=[
'Batch Reactor (Glass-lined / SS)|Batch|Heat balance','Semi-batch Reactor|Dosing-controlled|Runaway risk','CSTR (Continuous Stirred-Tank Reactor)|Continuous|tau = V/Q','Plug-flow / Tubular Reactor (PFR)|Continuous|No back-mixing','Hydrogenator / Autoclave|High pressure|Gas-liquid-solid','Packed-bed Catalytic Reactor|Catalyst|Ergun dP',
'Shell and Tube Heat Exchanger|2 fluids|LMTD','Plate Heat Exchanger|Gasketed|High U','Jacket, Half-coil and Limpet Coil|Utility side|Vessel wall','Condenser|Latent heat|Non-condensables','Reboiler|Boil-up|Thermosyphon','Cooling Tower|Evaporative|Approach','Chiller (Vapour-compression)|Refrigeration|COP','Steam Boiler (Fire-tube / Water-tube)|Steam|Efficiency','Thermic Fluid Heater|Hot oil|Low pressure','Falling-film Evaporator|Thin film|Heat sensitive','Agitated Thin Film Evaporator (ATFE)|Viscous|Short residence','Multiple-effect Evaporator (MEE)|Steam economy|Effects',
'Distillation Column (Tray / Packed)|Boiling point|Reflux','Liquid-Liquid Separator / Decanter|Immiscible|Stokes settling','Liquid-Liquid Extraction|Solvent|Distribution K','Absorber / Scrubber|Gas-liquid|HTU x NTU','Crystallizer|Supersaturation|Particle size','Centrifuge (Basket / Peeler / Decanter)|Solid-liquid|High RPM','Agitated Nutsche Filter Dryer (ANFD)|Filter + dry|Contained','Filter Press / Plate and Frame|Batch filtration|Darcy','Cartridge / Bag / Sparkler Filter|Polishing|Beta ratio','Membrane Separation (RO / UF / NF)|Pressure driven|Recovery','Activated Carbon Adsorber|Adsorption|Breakthrough',
'Tray Dryer|Batch|Hot air','Fluid Bed Dryer (FBD)|Fluidised|Fast drying','Rotocone Vacuum Dryer (RCVD)|Vacuum|Gentle','Spray Dryer|Atomised|Powder',
'Mills (Multi-mill / Pulveriser / Jet Mill)|Size reduction|Bond energy','Vibro Sifter|Screening|Mesh','Blenders (Ribbon / Double Cone / V)|Powder mixing|Blend RSD',
'Centrifugal Pump|Rotodynamic|Head and NPSH','Diaphragm Pump (AODD)|Positive displacement|Handles solids','Gear Pump (Positive Displacement)|Positive displacement|Viscous','Liquid-ring Vacuum Pump|Vacuum|Sealing liquid','Dry Screw Vacuum Pump|Dry vacuum|Solvent service','Steam Ejector|No moving parts|Vacuum','Agitators and Impellers|Mixing|Power number','Air Compressor (Screw / Reciprocating)|Utility|Instrument air','Roots Blower|Low pressure|Aeration',
'Atmospheric Storage Tank|Storage|Vent','Pressure Vessel / Receiver|Code design|Relief','Flame Arrestor and Breather Valve|Safety|Tank vent',
'Nitrogen Generator (PSA)|Utility|Inerting','Steam Trap and Condensate System|Condensate|Utility','DM Plant (Ion Exchange)|Ion exchange|Water','ETP Clarifier / Primary Settling|Settling|Overflow rate','Activated Sludge (Aeration) Tank|Biological|F/M and DO'
];
var IQFRAW=[
'Thermocouple|Seebeck|mV signal','RTD (Pt100)|Pt100|Resistance','Temperature Transmitter|4-20 mA|HART','Dial Thermometer (Bimetal)|Local|Bimetal','Thermowell|Protection|Response time','Temperature Switch|Alarm / trip|Deadband',
'Bourdon Pressure Gauge|Local|Mechanical','Pressure Transmitter|4-20 mA|Zero and span','Differential Pressure Transmitter|Flow / level|Manifold','Diaphragm (Chemical) Seal|Isolation|Fill fluid','Pressure Switch|Alarm / trip|Hysteresis',
'Gauge Glass / Magnetic Level Gauge|Local|Visual','DP Level Transmitter|rho x g x h|Density-sensitive','Radar Level Transmitter (Non-contact)|Non-contact|Time of flight','Guided Wave Radar (GWR)|Probe|Interface','Ultrasonic Level Transmitter|Non-contact|Temp-sensitive','Capacitance Level Probe|Dielectric|Coating-sensitive','Float / Displacer Level Transmitter|Buoyancy|Interface','Level Switch (Vibrating Fork)|Point level|Overfill','Weighing System (Load Cell)|Mass|Density-independent',
'Orifice Plate with DP Transmitter|sqrt(DP)|3:1 range','Rotameter (Variable Area)|Variable area|Local','Magnetic Flowmeter|Conductive liquid|No obstruction','Coriolis Flowmeter|Mass flow|Density','Vortex Flowmeter|Steam / gas|Re limit','Turbine Flowmeter|Clean liquids|Pulses','Ultrasonic Flowmeter (Transit Time)|Clamp-on|Transit time','Thermal Mass Flowmeter (Gas)|Gas|Mass flow',
'pH Analyser|Nernst|Calibration','Conductivity Analyser|Ions|uS/cm','Dissolved Oxygen (DO) Probe|mg/L|Aeration','Turbidity Analyser|NTU|Light scatter','Karl Fischer Moisture Titrator|Water content|Laboratory','Combustible Gas (LEL) Detector|% LEL|Safety','Oxygen Analyser|Inerting|LOC','Density Meter|Vibrating tube|Concentration',
'Control Valve|Cv|Fail action','Valve Positioner|Stem position|Diagnostics','I/P Converter|mA to air|3-15 psi','Solenoid Valve|Trip|De-energise','On/Off (Shutdown) Valve|Shutdown|Partial stroke','Pressure Safety Valve (PSV)|Relief|Set pressure','Rupture Disc|One-shot|Fast relief','PID Controller (DCS Loop)|P + I + D|Tuning','Safety Instrumented Function (Interlock)|SIL|Independent',
'Vibration Transmitter|mm/s|Bearing health','Speed Sensor|rpm|Overspeed','Position Transmitter / Limit Switch|ZSO / ZSC|Feedback','Motor Current Transmitter|Load|Dry-run clue'
];
var QF={};
QFRAW.concat(IQFRAW).forEach(function(l){var p=l.split('|');QF[p[0]]=[p[1],p[2]];});

var KW={
'Centrifugal Pump':'pump head npsh cavitation bep affinity laws impeller volute seal dead head suction discharge efficiency',
'Diaphragm Pump (AODD)':'pump aodd air operated double diaphragm slurry pulsation',
'Gear Pump (Positive Displacement)':'pump pd viscous metering relief valve',
'Liquid-ring Vacuum Pump':'vacuum pump lrvp nash seal liquid cavitation ultimate vacuum',
'Dry Screw Vacuum Pump':'vacuum pump dry solvent recovery',
'Steam Ejector':'vacuum ejector motive steam venturi',
'Batch Reactor (Glass-lined / SS)':'reactor glr ss agitator jacket exotherm runaway scale-up impeller baffle',
'Semi-batch Reactor':'reactor dosing accumulation mtsr stoessel criticality runaway',
'Shell and Tube Heat Exchanger':'heat exchanger hx lmtd fouling baffle duty tema u value',
'Plate Heat Exchanger':'heat exchanger phe gasket plate',
'Condenser':'heat exchanger reflux vent overhead non-condensable',
'Distillation Column (Tray / Packed)':'distillation flooding weeping reflux hetp stage mccabe thiele fenske relative volatility',
'Centrifuge (Basket / Peeler / Decanter)':'centrifuge cake filtration solid liquid g force peeler',
'Agitated Nutsche Filter Dryer (ANFD)':'nutsche anfd filter dryer contained potent',
'Filter Press / Plate and Frame':'filter press darcy cake cloth',
'Fluid Bed Dryer (FBD)':'dryer fbd fluidisation fluidization channelling static',
'Rotocone Vacuum Dryer (RCVD)':'dryer rcvd rotary cone vacuum',
'Spray Dryer':'dryer atomiser atomizer droplet powder',
'Tray Dryer':'dryer cabinet vacuum tray',
'Cooling Tower':'cooling water approach range wet bulb blowdown evaporation legionella fill drift',
'Chiller (Vapour-compression)':'refrigeration cop brine compressor evaporator',
'Steam Boiler (Fire-tube / Water-tube)':'boiler steam drum tds blowdown feed water',
'Absorber / Scrubber':'scrubber absorber ntu htu liquor packed tower hcl',
'Crystallizer':'crystalliser crystallization supersaturation seeding polymorph metastable',
'Membrane Separation (RO / UF / NF)':'ro reverse osmosis ultrafiltration nanofiltration permeate recovery',
'Nitrogen Generator (PSA)':'nitrogen psa inerting blanketing carbon molecular sieve',
'Activated Sludge (Aeration) Tank':'etp aeration bod cod mlss f/m biological do blower',
'ETP Clarifier / Primary Settling':'etp clarifier sludge settling flocculant',
'DM Plant (Ion Exchange)':'dm demineralised water resin cation anion regeneration',
'Agitators and Impellers':'agitator impeller mixing power number baffles vortex',
'Pressure Vessel / Receiver':'receiver relief asme design pressure hydrotest',
'Flame Arrestor and Breather Valve':'tank vent pv valve flame arrester',
'Thermocouple':'tc thermocouple k type j type seebeck cold junction',
'RTD (Pt100)':'rtd pt100 resistance 3-wire 4-wire',
'Pressure Transmitter':'pt transmitter 4-20 hart gauge absolute',
'Differential Pressure Transmitter':'dpt dp delta p manifold flow level filter',
'DP Level Transmitter':'level dp wet leg dry leg density',
'Radar Level Transmitter (Non-contact)':'level radar microwave',
'Guided Wave Radar (GWR)':'level gwr guided radar interface',
'Orifice Plate with DP Transmitter':'flow orifice differential beta ratio fe ft',
'Magnetic Flowmeter':'flow magmeter electromagnetic faraday conductive',
'Coriolis Flowmeter':'flow mass flow coriolis density batching',
'Control Valve':'cv fail open fail close actuator stiction cavitation positioner trim',
'Pressure Safety Valve (PSV)':'psv prv relief valve safety valve api 520 set pressure chatter accumulation',
'Rupture Disc':'bursting disc relief burst pressure runaway',
'PID Controller (DCS Loop)':'pid tuning dcs loop controller windup cascade',
'Safety Instrumented Function (Interlock)':'sis sif sil interlock esd trip iec 61511 pfd',
'pH Analyser':'ph electrode buffer calibration slope neutralisation',
'Combustible Gas (LEL) Detector':'lel gas detector flammable explosive atmosphere'
};

var SITE='';
var LK={
 heat:['Heat Load & Recovery Calculator','/calculators/heat-load-calculator/','Calculator'],
 solv:['Solvent Recovery Calculator','/calculators/solvent-recovery-calculator/','Calculator'],
 mix:['Mixing / Scale-up Calculator','/calculators/mixing-scale-up-calculator/','Calculator'],
 agit:['Agitator Simulator','/calculators/agitator-simulator/','Calculator'],
 filt:['Filtration Evaluation Calculator','/calculators/filtration-calculator/','Calculator'],
 cent:['Centrifuge Cake Weight Calculator','/calculators/centrifuge-cake-weight-calculator/','Calculator'],
 pump:['Pump Power Rating Calculator','/calculators/pump-power-calculator/','Calculator'],
 mat:['Materials & Corrosion Compatibility','/calculators/materials-compatibility/','Calculator'],
 aPump:['Pump Power Calculation','/articles/pump-power-calculation/','Article'],
 aSolv:['Solvent Recovery Calculation','/articles/solvent-recovery-calculation/','Article'],
 aMix:['Mixing & Scale-up','/articles/mixing-scale-up/','Article'],
 tour:['Virtual Plant Tour','/plant-tour/','Game'],
 run:['Runaway! Stoessel Challenge','/games/runaway/','Game'],
 hazard:['Stop the Hazard','/games/stop-the-hazard/','Game'],
 ts:['PharmaChemE Troubleshooter','/games/troubleshooter/','Game'],
 safe:['Process Safety','/process-safety/','Lessons']
};
var RELRULES=[
 [/Batch Reactor/,['mix','agit','aMix','run']],
 [/Semi-batch/,['run','safe']],
 [/CSTR/,['mix']],
 [/Hydrogenator/,['run','safe']],
 [/Agitators/,['agit','mix','aMix']],
 [/Distillation|Condenser|Reboiler|Evaporator/,['solv','aSolv','heat']],
 [/Shell and Tube|Plate Heat|Jacket/,['heat']],
 [/Centrifuge/,['cent','filt']],
 [/Filter|Nutsche/,['filt']],
 [/Centrifugal Pump|Diaphragm Pump|Gear Pump/,['pump','aPump']],
 [/Liquid-ring|Dry Screw|Steam Ejector/,['solv']],
 [/Atmospheric Storage|Pressure Vessel|Flame Arrestor/,['safe','hazard','mat']],
 [/Diaphragm \(Chemical\) Seal|Magnetic Flowmeter/,['mat']],
 [/Pressure Safety Valve|Rupture Disc|Safety Instrumented|Solenoid|On\/Off/,['safe','hazard']]
];
function relFor(type,it){
  if(type==='ag'&&it.dia==='anfd')return [['ANFD (equipment card)','/equipment-instruments/#agitated-nutsche-filter-dryer-anfd','Card'],LK.filt];
  if(type==='ag')return [LK.agit,LK.mix,LK.aMix];
  var keys=[];
  RELRULES.forEach(function(r){if(r[0].test(it.name)){r[1].forEach(function(k){if(keys.indexOf(k)<0)keys.push(k);});}});
  if(TS[it.name]&&keys.indexOf('ts')<0)keys.push('ts');
  if(type==='eq'&&keys.length<2&&keys.indexOf('tour')<0)keys.push('tour');
  return keys.map(function(k){return LK[k];});
}

/* Troubleshoot scenarios. o = [option, isBestFirstCheck, why] */
var TS={
'Centrifugal Pump':{q:'Discharge pressure and flow have dropped on a pump that was fine yesterday. It now makes a rattling, gravel-like noise. What do you check first?',
 o:[['Suction side: strainer, suction valve, tank level and liquid temperature',true,'Gravel-like noise with falling flow is the classic sign of cavitation. Cavitation starts on the suction side when NPSH available falls below NPSH required.'],
    ['Mechanical seal leakage',false,'A leaking seal shows as a leak, not as noise and loss of head.'],
    ['Open the discharge valve fully',false,'More flow raises NPSH required and usually makes cavitation worse.'],
    ['Replace the impeller',false,'That is a late step. Rule out suction problems first, since they are quick to check.'],
    ['Motor winding temperature',false,'Not related to noise and head loss at this stage.']],
 n:'If the suction side is clear, compare tank level, liquid temperature (vapour pressure) and suction losses with the NPSH required on the pump curve. Throttling the discharge slightly reduces flow, which lowers NPSH required and suction losses, and can ease cavitation while you fix the cause.'},
'Batch Reactor (Glass-lined / SS)':{q:'During an exothermic addition the reactor temperature is rising above setpoint even though jacket cooling is at maximum. If the addition feed is the controllable heat-release source, what action should be considered immediately under the site emergency procedure?',
 o:[['Stop or isolate the addition, as the approved emergency procedure specifies',true,'The reaction is releasing more heat than the jacket can remove. If the addition drives the heat release, stopping or isolating it limits further heat generation. The right response always depends on the hazard assessment and the approved procedure for your process.'],
    ['Switch off the agitator',false,'Stopping mixing can create hot spots and accumulation of unreacted material. Do not stop it blindly.'],
    ['Wait and watch the trend',false,'Temperature rise on a runaway-prone step can accelerate quickly. Act first.'],
    ['Add more catalyst',false,'That would increase the reaction rate and heat output.'],
    ['Raise the setpoint',false,'This hides the problem and removes a safety margin.']],
 n:'Keep full cooling and agitation, and follow the batch emergency procedure. Before restarting, check the cooling flow and temperature, agitator operation and how much reagent has accumulated.'},
'Shell and Tube Heat Exchanger':{q:'Cooling duty has been falling slowly over several weeks. The process-side outlet temperature is rising and cooling-water flow is normal. What is the most likely cause?',
 o:[['Fouling on the heat-transfer surface',true,'Fouling adds resistance and lowers U. A gradual decline with normal flows is typical.'],
    ['A sudden tube rupture',false,'A tube failure is sudden and shows as contamination or a pressure change, not a slow decline.'],
    ['Cooling water is too cold',false,'Colder water would improve performance, not reduce it.'],
    ['Instrument air pressure low',false,'Not connected to heat transfer in this exchanger.']],
 n:'Calculate the current U from duty and LMTD and compare it with the clean value. Check pressure drop on both sides and cleaning history, then plan chemical or mechanical cleaning.'},
'Distillation Column (Tray / Packed)':{q:'After boil-up was increased, column pressure drop has risen sharply and distillate purity has fallen. What is happening?',
 o:[['Flooding',true,'High vapour rate holds liquid up on the trays. Pressure drop climbs and separation collapses.'],
    ['Weeping',false,'Weeping happens at low vapour rates, not after boil-up is increased.'],
    ['Condenser is too cold',false,'That would not raise column pressure drop.'],
    ['Feed is too dilute',false,'Feed composition does not explain a sharp pressure-drop rise after a boil-up change.']],
 n:'Reduce reboiler duty and check feed rate. Look for foaming or fouled trays. Return to the normal pressure-drop trend before raising boil-up again.'},
'Centrifuge (Basket / Peeler / Decanter)':{q:'A basket centrifuge shakes violently at speed while being loaded. What do you do first?',
 o:[['Stop the feed and follow the safe stop procedure',true,'Severe vibration means unbalance. Stop adding load and bring the machine to rest as the procedure requires.'],
    ['Increase speed to get through the vibration',false,'This can cause serious mechanical damage and injury.'],
    ['Open the lid to see what is happening',false,'Never open a rotating machine.'],
    ['Add more slurry to balance it',false,'More load makes unbalance worse.']],
 n:'After it has stopped completely, check load distribution, cloth condition and feed arrangement, and look for damage before starting again.'},
'Fluid Bed Dryer (FBD)':{q:'Powder in the FBD forms channels and some zones stay wet, although the air flow reading is steady. Most likely cause?',
 o:[['Cohesive wet material or a partly blocked distributor causing channelling',true,'Air takes the easy path through channels, leaving other zones undried.'],
    ['Exhaust temperature set too high',false,'High temperature would dry faster, not leave wet zones.'],
    ['Too much filter shaking',false,'This would affect fines and dP, not create channelling.'],
    ['Wrong colour of bags',false,'Not relevant.']],
 n:'Check bed depth, distributor plate condition and filter bag pressure drop. Consider pre-conditioning or breaking up lumps and reducing the load.'},
'Liquid-ring Vacuum Pump':{q:'Vacuum on a distillation system has worsened and the pump sounds like gravel. Seal liquid temperature has risen. What do you check first?',
 o:[['Seal-liquid temperature and flow (cooler and make-up)',true,'The ultimate vacuum is limited by the vapour pressure of the sealing liquid. Warm seal liquid cuts vacuum and causes cavitation.'],
    ['Change the lubricating oil',false,'The compression chamber is sealed by the service liquid; bearing lubricating oil does not explain these symptoms.'],
    ['Increase the process feed rate',false,'This adds load and does not fix the vacuum.'],
    ['Replace the motor',false,'Not indicated by these symptoms.']],
 n:'Restore seal-liquid cooling, then do a pressure-rise test on the system to check for air leaks.'},
'Cooling Tower':{q:'Cold-water temperature rises on a hot, humid afternoon. The fan runs normally. What explains it first?',
 o:[['Wet-bulb temperature has risen, so the achievable cold-water temperature rises too',true,'Cold-water temperature cannot go below wet-bulb. On humid days the higher wet-bulb raises cold-water temperature even at the same approach.'],
    ['Blowdown is too low',false,'Blowdown affects water quality over time, not an afternoon temperature change.'],
    ['Pump impeller is too large',false,'Unrelated to the daily change.']],
 n:'Compare the approach (cold-water minus wet-bulb) with design. If the approach has grown too, check fill fouling, water distribution, airflow and fan pitch.'},
'Control Valve':{q:'A level loop hunts: the valve moves in small jerks and the level oscillates slowly around setpoint. What mechanical cause is most likely?',
 o:[['Valve stiction (friction) combined with integral action',true,'Stiction makes the valve stick, then jump. With integral action, this produces a slow limit cycle.'],
    ['Wrong fail position',false,'Fail position matters on loss of signal or air, not in normal hunting.'],
    ['Tank is too large',false,'A bigger tank slows level changes but is not the cause of valve jerks.'],
    ['Cable is too long',false,'A long cable does not cause stick-jump valve motion.']],
 n:'Run a small step test on the valve and check positioner diagnostics and packing tightness. Do not simply raise integral action.'},
'DP Level Transmitter':{q:'After topping up a tank with a heavier product, the DP level transmitter reads higher than the sight gauge. What is the first thing to consider?',
 o:[['The liquid density has changed from the density used in calibration',true,'DP = rho x g x h, so a denser liquid gives a higher reading at the same level.'],
    ['The tank has shrunk',false,'Not physically relevant.'],
    ['Impulse line is too short',false,'Length does not change the reading in this way.'],
    ['The DCS screen is old',false,'The display is not the cause of a measurement difference.']],
 n:'Confirm with the sight gauge, then update the calibration density or apply density compensation. On closed tanks, also check the wet leg for correct fill.'},
'Pressure Safety Valve (PSV)':{q:'A PSV chatters (opens and closes rapidly) during a relief event. What is commonly investigated first?',
 o:[['Inlet pressure drop (long or small inlet pipe) and valve oversizing',true,'Excessive inlet loss drops the pressure at the valve seat, making it close and reopen quickly. API 520 guidance limits inlet loss (about 3% of set pressure).'],
    ['Increase the set pressure',false,'Changing the set pressure to stop chatter can compromise protection.'],
    ['Paint the valve',false,'Not relevant.'],
    ['Isolate the valve',false,'Never isolate a relief valve from the equipment it protects without an approved procedure.']],
 n:'Review inlet-line size and length, backpressure and valve sizing with a relief-system specialist. Do not adjust set pressure to cure chatter.'},
'pH Analyser':{q:'pH reading is sluggish and the two-point calibration shows a low slope. The probe has been in a neutralisation tank for months. Most likely cause?',
 o:[['Coated or aged glass electrode',true,'Coating slows the response and aged glass lowers slope.'],
    ['Buffer solution is too fresh',false,'Fresh buffer is what you want.'],
    ['DCS scaling error',false,'Scaling does not change calibration slope.'],
    ['pH has no relation to the electrode',false,'The electrode is the sensor.']],
 n:'Clean the electrode as per manufacturer instructions, then recalibrate. Replace it if the slope stays outside the manufacturer limits.'},
'RTD (Pt100)':{q:'A 2-wire Pt100 reads about 1.5 degC higher after a long cable run was installed. Why?',
 o:[['Lead-wire resistance adds to the sensor resistance',true,'In a 2-wire connection the cable resistance is measured along with the sensor.'],
    ['Thermocouple type mismatch',false,'This is an RTD, not a thermocouple.'],
    ['Self-heating from the cable',false,'Self-heating relates to the sensor current, not the cable length.'],
    ['Cable is too cold',false,'Cable temperature effect is part of lead resistance, not a separate cause here.']],
 n:'Use a 3-wire or 4-wire connection, or a transmitter mounted at the sensor, to cancel lead-wire resistance.'},
'Orifice Plate with DP Transmitter':{q:'Flow reading suddenly drops to zero, but pump and downstream indications show that flow exists. The DP transmitter shows zero DP. What do you check first?',
 o:[['The three-valve manifold (equalising valve left open) and blocked impulse lines',true,'An open equalising valve gives zero DP; blocked taps trap pressure so the reading freezes, drifts or reads low although flow continues.'],
    ['The orifice plate has disappeared',false,'Possible but much less likely than a manifold or tap problem.'],
    ['The control valve actuator',false,'A control valve does not make the DP transmitter read zero.'],
    ['The DCS display brightness',false,'Not relevant.']],
 n:'Check manifold valve positions, then blow or flush the impulse lines. Verify that taps are clear before suspecting the plate.'},
'Pressure Transmitter':{q:'A pressure transmitter reads 0.3 bar higher than the local gauge even when the vessel is vented to atmosphere. What do you check?',
 o:[['Zero trim (zero shift) with the vessel vented',true,'A steady offset at atmospheric pressure is a zero error, but first rule out liquid head in the impulse line, an absolute-type transmitter or a wrong range before trimming it.'],
    ['The span of the instrument only',false,'Span affects the error at high pressure, not at zero.'],
    ['The gauge is the reference',false,'Both could be wrong. Use a calibrated reference.'],
    ['Wiring colours',false,'Wiring colours do not cause a steady offset.']],
 n:'With the vessel vented, perform a zero trim as per the vendor procedure. Check mounting position effects if the line is liquid-filled, and verify with a calibrated reference.'}
};

var CMP=[
{id:'pumps',title:'Pumps',cols:['Centrifugal','Diaphragm (AODD)','Gear'],open:['Centrifugal Pump','Diaphragm Pump (AODD)','Gear Pump (Positive Displacement)'],
 rows:[['Flow pattern','Continuous','Pulsating','Continuous, low pulsation'],['Solids handling','Limited','Good','Limited'],['Viscosity','Low to medium','Wide range','High'],['Can run dry','No','Yes, with care','Generally no'],['Typical use','General liquid transfer','Slurry, acids, drum transfer','Viscous liquids, metering']],
 choose:['Centrifugal: clean, low-viscosity liquid at steady flow.','Diaphragm: solids, corrosive or shear-sensitive fluids, or if dry running may happen.','Gear: viscous fluids and steady, metered flow.']},
{id:'dryers',title:'Dryers',cols:['Tray','Fluid bed','Rotocone vacuum','Spray','ANFD'],open:['Tray Dryer','Fluid Bed Dryer (FBD)','Rotocone Vacuum Dryer (RCVD)','Spray Dryer','Agitated Nutsche Filter Dryer (ANFD)'],
 rows:[['Operation','Batch','Batch or continuous','Batch','Continuous','Batch'],['Drying time','Hours','Minutes to hours','Hours','Seconds','Hours'],['Heat exposure','Moderate (lower with vacuum)','Moderate','Low (vacuum)','Short contact, hot air','Low to moderate (vacuum, heated plate and walls)'],['Product form','Cake or solids','Granules, powder','Wet cake','Powder from solution','Slurry: filtered, washed and dried in the same vessel'],['Solvent service','Needs inerting or vacuum','Needs inerting and static control','Good, closed with solvent recovery','Closed-loop nitrogen system','Good, closed under vacuum or nitrogen with solvent recovery']],
 choose:['Tray: simple, small batches, gentle.','Fluid bed: granules where fast drying is needed.','Rotocone: solvent-wet cake, heat-sensitive APIs, contained handling.','Spray: turning a solution or slurry directly into powder.','ANFD: filter, wash and dry in one closed vessel with no cake transfer, useful for potent or solvent-wet products; drying is usually slower than a fluid bed.']},
{id:'level',title:'Level measurement',cols:['DP','Radar (non-contact)','Guided wave radar','Ultrasonic'],open:['DP Level Transmitter','Radar Level Transmitter (Non-contact)','Guided Wave Radar (GWR)','Ultrasonic Level Transmitter'],
 rows:[['Touches the product','Yes, via impulse line or seal','No','Yes, probe','No'],['Affected by density','Yes','No','No','No'],['Main sensitivity','Plugged lines, density','Foam, agitator echoes','Coating, build-up','Foam, steam, temperature layers'],['Typical use','Closed tanks with stable density','Solvent tanks, corrosive liquids','Narrow chambers, interface','Open tanks, sumps']],
 choose:['DP: simple, proven, where density is stable.','Radar: density changes, corrosive or hot liquids.','GWR: small chambers and interface measurement.','Ultrasonic: open tanks and effluent sumps.']},
{id:'flow',title:'Flow measurement',cols:['Orifice + DP','Magnetic','Coriolis','Vortex'],open:['Orifice Plate with DP Transmitter','Magnetic Flowmeter','Coriolis Flowmeter','Vortex Flowmeter'],
 rows:[['Suitable fluids','Clean liquid, gas, steam','Conductive liquids','Liquids and gases','Steam, gas, clean liquids'],['Typical accuracy (approx.)','About 1-2% of span','About 0.5% of reading','About 0.1-0.2% of reading','About 1% of reading'],['Pressure loss','Moderate to high','Very low','Moderate','Moderate'],['Key limitation','Rangeability about 3:1, edge wear','Needs conductive liquid, full pipe','Gas slugs, cost','Low-flow cut-off, vibration']],
 choose:['Orifice: low cost and widely understood.','Magnetic: acids, caustic, slurries and effluent.','Coriolis: batching and dosing where mass accuracy matters.','Vortex: steam and gas lines.']},
{id:'hx',title:'Heat exchangers',cols:['Shell and tube','Plate','Jacket / coil'],open:['Shell and Tube Heat Exchanger','Plate Heat Exchanger','Jacket, Half-coil and Limpet Coil'],
 rows:[['Heat-transfer performance','Good','Very good (high U)','Moderate'],['Pressure and temperature limits','High','Limited by gaskets (brazed or welded units go higher)','Set by the vessel and jacket design'],['Fouling tolerance','Moderate, cleanable','Good for fine fouling; poor with particles or fibres (narrow channels)','Process side cleaned with the vessel'],['Typical use','Utility heating, cooling and condensing','Clean services, heat recovery','Heating or cooling a stirred vessel']],
 choose:['Shell and tube: high pressure, fouling services, condensing.','Plate: clean fluids needing close temperature approach.','Jacket or coil: temperature control of a reactor or receiver.']},
{id:'vac',title:'Vacuum sources',cols:['Liquid ring','Dry screw','Steam ejector'],open:['Liquid-ring Vacuum Pump','Dry Screw Vacuum Pump','Steam Ejector'],
 rows:[['Condensable vapours','Handled well','Must stay above dew point inside the pump','Handled with intercondensers'],['Process contamination','Gas contacts the sealing liquid','None (dry)','Steam mixes with the gas'],['Effluent','Seal-liquid effluent unless recirculated','Little','Steam condensate'],['Utilities','Seal liquid, power','Power, cooling','Motive steam, cooling water'],['Moving parts','Yes','Yes','None']],
 choose:['Liquid ring: rugged, copes with wet vapours, lower capital cost.','Dry screw: solvent recovery and clean effluent.','Steam ejector: deep vacuum where steam is available and maintenance must be minimal.']}
];

var FLOWS=[
{id:'a',title:'Batch synthesis to dry product',note:'Illustrative generic sequence. Real plants vary.',nodes:[
 {t:'Raw material charge',role:'Solvent and reactants are charged.',eq:null},
 {t:'Batch reactor',role:'Reaction: heat, cool and mix the reactants for the set time.',eq:'Batch Reactor'},
 {t:'Condenser',role:'Solvent recovery or reflux: vapour is turned back into liquid.',eq:'Condenser'},
 {t:'Crystallizer',role:'The product comes out of solution as crystals.',eq:'Crystallizer'},
 {t:'Centrifuge',role:'Solid-liquid separation: wet cake is separated from mother liquor.',eq:'Centrifuge'},
 {t:'Rotocone vacuum dryer',role:'Moisture and solvent are removed under vacuum.',eq:'Rotocone'},
 {t:'Packing',role:'Dry, tested powder is packed.',eq:null}]},
{id:'b',title:'Effluent treatment',note:'Illustrative generic sequence. Real ETPs vary with the effluent.',nodes:[
 {t:'Equalisation tank',role:'Evens out flow and load before treatment.',eq:'Atmospheric Storage Tank'},
 {t:'Primary clarifier',role:'Settles suspended solids and chemical sludge from primary treatment.',eq:'ETP Clarifier'},
 {t:'Aeration tank',role:'Bacteria consume dissolved organic pollutants; a secondary clarifier then settles the biomass and returns sludge to the tank.',eq:'Activated Sludge'},
 {t:'Membrane unit',role:'After clarification and filtration, polishes the treated water for reuse.',eq:'Membrane'},
 {t:'Multiple-effect evaporator',role:'Concentrates the reject stream to reduce its volume.',eq:'Multiple-effect'}]}
];

/* ============ HELPERS ============ */
function findEq(prefix){for(var i=0;i<EQ.length;i++){if(EQ[i].name.indexOf(prefix)===0)return i;}return -1;}
function findNameIdx(arr,name){for(var i=0;i<arr.length;i++){if(arr[i].name===name)return i;}return -1;}
function typeOf(name){return findNameIdx(EQ,name)>=0?'eq':'in';}

var state={tab:'eq',cat:{eq:'All','in':'All'},q:{eq:'','in':''},lab:'cmp'};
var lastFocus=null,cur=null,simTimer=null;

/* items listed under more than one group */
var ALSO={'Agitated Nutsche Filter Dryer (ANFD)':['Drying']};
function inCat(it,c){return it.cat===c||(ALSO[it.name]||[]).indexOf(c)>=0;}
function catLabel(it){return [it.cat].concat(ALSO[it.name]||[]).join(' / ');}
function cats(arr){var c=['All'];arr.forEach(function(x){if(c.indexOf(x.cat)<0)c.push(x.cat);});return c;}
function buildChips(type){
  var arr=type==='eq'?EQ:IN, box=$(type==='eq'?'chips-eq':'chips-in'), c0=state.cat[type];
  box.innerHTML=cats(arr).map(function(c){
    return '<button class="ei-chip" data-c="'+esc(c)+'" aria-pressed="'+(c===c0)+'">'+esc(c)+'</button>';
  }).join('');
}

/* smarter search: name > tag/keywords > category > summary > full content */
function scoreItem(it,words){
  var name=it.name.toLowerCase(),tag=(it.tag||'').toLowerCase(),kw=(KW[it.name]||'').toLowerCase(),cat=it.cat.toLowerCase();
  var one=(it.one+' '+it.use).toLowerCase();
  var deep=(it.how.join(' ')+' '+it.deep.join(' ')+' '+it.watch).toLowerCase();
  var total=0;
  for(var k=0;k<words.length;k++){
    var w=words[k],s=0;
    if(w.length<=2){
      if(tag.indexOf(w)===0||(' '+name).indexOf(' '+w)>=0||(' '+kw).indexOf(' '+w)>=0)s=60;
    }else{
      if(name.indexOf(w)>=0)s=100;
      else if(tag.indexOf(w)>=0||kw.indexOf(w)>=0)s=60;
      else if(cat.indexOf(w)>=0)s=40;
      else if(one.indexOf(w)>=0)s=20;
      else if(deep.indexOf(w)>=0)s=10;
    }
    if(!s)return 0;
    total+=s;
  }
  return total;
}
function listFor(type){
  var arr=type==='eq'?EQ:IN,c=state.cat[type],q=state.q[type].toLowerCase().trim(),res=[];
  var words=q?q.split(/\s+/):[];
  arr.forEach(function(it,i){
    if(c!=='All'&&!inCat(it,c))return;
    var s=1;
    if(words.length){s=scoreItem(it,words);if(!s)return;}
    res.push({i:i,s:s});
  });
  if(words.length)res.sort(function(a,b){return b.s-a.s||a.i-b.i;});
  return res.map(function(r){return r.i;});
}
function renderGrid(type){
  var arr=type==='eq'?EQ:IN,ids=listFor(type);
  var grid=$(type==='eq'?'grid-eq':'grid-in');
  grid.innerHTML=ids.map(function(i){
    var it=arr[i];
    var th=type==='eq'?DIA[it.dia]:instSymbol(it);
    var tg=type==='eq'?catLabel(it):(it.cat+' | '+it.tag);
    var chips=(QF[it.name]||[]).map(function(c){return '<span>'+esc(c)+'</span>';}).join('');
    return '<button class="ei-card" data-i="'+i+'" data-t="'+type+'"><div class="ei-thumb">'+th+'</div><div class="ei-tag">'+esc(tg)+'</div><h3>'+esc(it.name)+'</h3><div class="ei-qf">'+chips+'</div><p>'+esc(it.one)+'</p></button>';
  }).join('');
  var cnt=$(type==='eq'?'cnt-eq':'cnt-in'),q=state.q[type].trim();
  var txt=q?(ids.length+' match'+(ids.length===1?'':'es')+' for \u201c'+esc(q)+'\u201d'+(state.cat[type]!=='All'?' in '+esc(state.cat[type]):'')):(ids.length+' of '+arr.length+' shown');
  var other=type==='eq'?'in':'eq',on=q?listFor(other).length:0;
  cnt.innerHTML='<span>'+txt+'</span>'+(on?'<button type="button" class="ei-xtab" data-go="'+other+'">'+on+' in '+(other==='eq'?'Equipment':'Instrumentation')+' &rarr;</button>':'');
  if(!ids.length&&q&&state.cat[type]!=='All'){grid.innerHTML='<p style="color:var(--mute)">No matches in this group. <button type="button" class="ei-xtab" data-allcat="'+type+'">Search all groups</button></p>';return;}
  if(!ids.length){grid.innerHTML='<p style="color:var(--mute)">Nothing matches. Try a different word (for example a concept like NPSH or cavitation) or choose All.</p>';}
}
function list(arr,tag){return '<'+tag+'>'+arr.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</'+tag+'>';}
function sentences(s){return String(s).split(/\.\s+/).map(function(x){return x.replace(/\.$/,'').trim();}).filter(Boolean).map(function(x){return x+'.';});}
function isSafetyCritical(it){return it.cat==='Final Control & Safety'||/Pressure Vessel|Flame Arrestor|Boiler|Hydrogenator|Thermic Fluid/.test(it.name);}

function tsHtml(it){
  var s=TS[it.name];
  if(!s){return '<h4>Troubleshoot</h4><p style="color:var(--mute)">No scenario for this item yet. Scenarios are being added item by item. Meanwhile, see Common mistakes above.</p>';}
  var h='<h4>Test yourself: troubleshoot</h4><p><b>'+esc(s.q)+'</b></p><div id="opts">';
  s.o.forEach(function(o,k){h+='<button class="ei-opt" data-k="'+k+'">'+esc(o[0])+'</button>';});
  h+='</div><div class="ei-fb" id="fb" aria-live="polite"></div>';
  return h;
}

function AR(t){return t==='eq'?EQ:t==='ag'?AG:IN;}
function openItem(type,i){
  var arr=AR(type),it=arr[i];
  cur={type:type,i:i};track(type==='eq'?'equipment_viewed':type==='ag'?'agitator_viewed':'instrument_viewed',{item_name:it.name,category:it.cat});
  setHash(slug(it.name));
  var h='<div class="ei-ph"><h2>'+esc(it.name)+'</h2><span class="ei-btnrow"><button class="ei-x" id="xcopy" title="Copy a link to this card">Copy link</button><button class="ei-x" id="xclose">Close</button></span></div>';
  h+='<div class="ei-tag" style="margin-top:4px">'+esc(catLabel(it))+(it.tag?' | '+esc(it.tag):'')+'</div>';
  var chips=(QF[it.name]||[]).map(function(c){return '<span>'+esc(c)+'</span>';}).join('');
  if(chips)h+='<div class="ei-qf" style="margin-top:6px">'+chips+'</div>';
  if(type==='eq'){h+='<div class="ei-big">'+DIA[it.dia]+'</div>';}
  else if(type==='ag'){h+='<div class="ei-big">'+agDia(it)+'</div><div class="ei-kv"><b>Flow pattern</b><span>'+esc(it.flow)+'</span><b>Power number</b><span>'+esc(it.np)+'</span><b>Flow regime</b><span>'+esc(it.regime)+'</span><b>Viscosity</b><span>'+esc(it.visc)+'</span><b>Typical D/T</b><span>'+esc(it.dt)+'</span><b>Tip speed</b><span>'+esc(it.tip)+'</span></div>';}
  else{
    h+='<div class="ei-big"><div style="width:190px">'+instSymbol(it)+'</div></div>';
    h+='<div class="ei-kv"><b>Symbol</b><span>'+esc(KIND[it.kind])+' (simplified, ISA 5.1-inspired)</span><b>Tag</b><span>'+esc(it.tag)+' (generic example)</span><b>Reads as</b><span>'+decode(it.tag)+'</span></div>';
    h+='<h4>Typical loop</h4><div class="ei-loop">'+esc(it.loop)+'</div>';
  }
  h+='<h4>In one minute</h4><p>'+esc(it.one)+'</p>';
  h+='<h4>How it works</h4>'+list(it.how,'ol');
  h+='<h4>Where it is used</h4><p>'+esc(it.use)+'</p>';
  h+='<h4>Common mistakes</h4>'+list(sentences(it.watch),'ul');
  var tn=isSafetyCritical(it)
    ?'<b>Safety-critical item.</b> Do not use this page to size, set, test or modify protective devices or safety functions. '
    :'';
  h+='<h4>Engineering detail</h4>'+list(it.deep,'ul')+'<div class="ei-techn">'+tn+'<b>Technical note:</b> values shown are educational or general guidance. Actual equipment selection, operating limits, relief design and safety functions must follow applicable codes, vendor data, plant procedures and project-specific engineering.</div>';
  if(TS[it.name])h+='<div class="ei-tsbox">'+tsHtml(it)+'</div>';
  var rl=relFor(type,it);
  if(rl.length){
    h+='<h4>Related PharmaChemE tools</h4><div class="ei-rel">'+rl.map(function(k){return '<a href="'+SITE+k[1]+'">'+esc(k[0])+' <small>'+k[2]+'</small></a>';}).join('')+'</div>';
  }
  $('panel').innerHTML=h;
  var ov=$('ov');ov.classList.add('ei-on');ov.setAttribute('aria-hidden','false');
  lastFocus=document.activeElement;
  $('xclose').focus();
  $('xclose').addEventListener('click',closeItem);
  $('xcopy').addEventListener('click',function(){var b=this,u=location.href;
    var done=function(){b.textContent='Link copied';setTimeout(function(){b.textContent='Copy link';},1600);};
    try{navigator.clipboard.writeText(u).then(done,function(){window.prompt('Copy this link:',u);});}catch(e){window.prompt('Copy this link:',u);}
    track('equipment_link_copied',{item_name:it.name});});
  ov.scrollTop=0;
}
function closeItem(){
  var ov=$('ov');ov.classList.remove('ei-on');ov.setAttribute('aria-hidden','true');
  setHash(state.tab==='eq'?'':TABHASH[state.tab]);
  if(lastFocus&&lastFocus.focus){lastFocus.focus();}
}
$('ov').addEventListener('click',function(e){if(e.target===$('ov'))closeItem();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('ov').classList.contains('ei-on'))closeItem();});

['grid-eq','grid-in'].forEach(function(id){
  $(id).addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.ei-card'):null;
    if(b)openItem(b.getAttribute('data-t'),parseInt(b.getAttribute('data-i'),10));
  });
});
['chips-eq','chips-in'].forEach(function(id){
  $(id).addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.ei-chip'):null;if(!b)return;
    var t=id==='chips-eq'?'eq':'in';
    state.cat[t]=b.getAttribute('data-c');track(t==='eq'?'equipment_category_selected':'instrument_category_selected',{category:state.cat[t]});
    buildChips(t);renderGrid(t);
  });
});

/* level modes: b = beginner, p = professional, t = troubleshoot */
$('panel').addEventListener('click',function(e){
  var ra=e.target.closest?e.target.closest('.ei-rel a'):null;
  if(ra){var hr=ra.getAttribute('href')||'';track(/^\/(calculators|articles)\//.test(hr)?'related_calculator_clicked':/^\/(games|plant-tour)\//.test(hr)?'related_game_clicked':'related_tool_clicked',{destination:hr,item_name:cur?AR(cur.type)[cur.i].name:''});}

  var o=e.target.closest?e.target.closest('.ei-opt'):null;
  if(o&&cur){
    var it=AR(cur.type)[cur.i],s=TS[it.name];if(!s)return;
    if(o.classList.contains('ei-done'))return;
    var k=parseInt(o.getAttribute('data-k'),10),opt=s.o[k],fb=$('fb');
    if(opt[1]){
      o.classList.add('ei-ok');
      Array.prototype.forEach.call(document.querySelectorAll('#opts .ei-opt'),function(x){x.classList.add('ei-done');});
      fb.className='ei-fb ei-good';
      fb.innerHTML='<b>Best first check.</b> '+esc(opt[2])+'<div style="margin-top:6px"><b>Next step:</b> '+esc(s.n)+'</div>';
    }else{
      o.classList.add('ei-bad');o.classList.add('ei-done');
      fb.className='ei-fb ei-bad';
      fb.innerHTML='<b>Not the best first check.</b> '+esc(opt[2])+' Try another option.';
    }
  }
});

/* ============ LABS ============ */
function labTabs(){
  var subs=[['cmp','Compare equipment'],['flow','Process flow'],['loop','Control loop simulator']];
  return '<div class="ei-chips">'+subs.map(function(s){return '<button class="ei-chip" data-s="'+s[0]+'" aria-pressed="'+(state.lab===s[0])+'">'+s[1]+'</button>';}).join('')+'</div>';
}
function renderLab(){
  stopSim();
  var box=$('lab-body');
  var h=labTabs();
  if(state.lab==='cmp'){
    h+='<p class="ei-sub">Pick a group to compare side by side, and open any card for more detail.</p><div class="ei-chips" id="cmpsel">'+CMP.map(function(c,i){return '<button class="ei-chip" data-ci="'+i+'" aria-pressed="'+(i===(state.cmpi||0))+'">'+esc(c.title)+'</button>';}).join('')+'</div>';
    var c=CMP[state.cmpi||0];
    h+='<div style="overflow-x:auto"><table class="ei-t ei-cmp"><tr><th></th>'+c.cols.map(function(x,j){return '<th>'+esc(x)+'</th>';}).join('')+'</tr>';
    c.rows.forEach(function(r){h+='<tr><th>'+esc(r[0])+'</th>'+r.slice(1).map(function(x){return '<td>'+esc(x)+'</td>';}).join('')+'</tr>';});
    h+='</table></div>';
    h+='<h4 class="ei-lh">When would you choose each?</h4>'+list(c.choose,'ul');
    h+='<p class="ei-rel">'+c.open.map(function(n){var t=typeOf(n),idx=findNameIdx(t==='eq'?EQ:IN,n);return '<button class="ei-x" data-open="'+t+':'+idx+'">Open: '+esc(n)+'</button>';}).join(' ')+'</p>';
    h+='<div class="ei-techn"><b>Technical note:</b> comparisons are general guidance. Selection depends on the actual fluid, conditions and applicable codes and vendor data.</div>';
  }else if(state.lab==='flow'){
    var f=FLOWS[state.flowi||0];
    h+='<p class="ei-sub">See where equipment sits in a process. Tap a step to open its card.</p><div class="ei-chips" id="flowsel">'+FLOWS.map(function(x,i){return '<button class="ei-chip" data-fi="'+i+'" aria-pressed="'+(i===(state.flowi||0))+'">'+esc(x.title)+'</button>';}).join('')+'</div>';
    h+='<div class="ei-pflow">';
    f.nodes.forEach(function(n,j){
      var idx=n.eq?findEq(n.eq):-1;
      h+=(j?'<div class="ei-down" aria-hidden="true">&#8595;</div>':'');
      if(idx>=0)h+='<button class="ei-node" data-open="eq:'+idx+'"><b>'+esc(n.t)+'</b><span>'+esc(n.role)+'</span><em>Open card</em></button>';
      else h+='<div class="ei-node ei-plain"><b>'+esc(n.t)+'</b><span>'+esc(n.role)+'</span></div>';
    });
    h+='</div><p style="color:var(--mute);font-size:13px">'+esc(f.note)+'</p>';
  }else{
    h+=simHtml();
  }
  box.innerHTML=h;
  if(state.lab==='loop')simStart();
}
function showLabSub(s){state.lab=s;renderLab();}
$('lab-body').addEventListener('click',function(e){
  var t=e.target.closest?e.target:null;if(!t)return;
  var b=t.closest('[data-s]');if(b){showLabSub(b.getAttribute('data-s'));return;}
  b=t.closest('[data-ci]');if(b){state.cmpi=parseInt(b.getAttribute('data-ci'),10);renderLab();return;}
  b=t.closest('[data-fi]');if(b){state.flowi=parseInt(b.getAttribute('data-fi'),10);renderLab();return;}
  b=t.closest('[data-open]');if(b){var p=b.getAttribute('data-open').split(':');lastFocus=b;openItem(p[0],parseInt(p[1],10));return;}
  b=t.closest('[data-sim]');if(b){simAction(b.getAttribute('data-sim'));return;}
});

/* ---------- control loop simulator ---------- */
var S=null;
function simReset(){
  S={h:50,I:0,pos:50,sp:60,Kc:2,Ti:40,qin0:40,qin:40,tmode:'ok',pvFrozen:50,vmode:'ok',lshh:true,trip:false,H:[],PV:[],U:[],SP:[],t:0,note:'Normal operation. Change the setpoint or press a fault button.'};
}
function simHtml(){
  if(!S)simReset();
  var h='<p class="ei-sub">A level loop: LT measures, LIC decides, LV opens or closes the outlet. Change the setpoint, then inject a fault and watch what the operator sees compared with what is really happening. Simplified model for learning only.</p>';
  h+='<div class="ei-sim"><svg viewBox="0 0 640 270" id="simsvg" role="img" aria-label="Level control loop diagram">';
  h+='<rect class="ei-st" x="70" y="40" width="130" height="190" rx="6"/><rect id="lvfill" class="ei-fl" x="72" y="150" width="126" height="78"/>';
  h+='<line id="splin" class="ei-st ei-hot" x1="64" y1="120" x2="206" y2="120" stroke-dasharray="6 4"/><text class="ei-txt" x="212" y="124" style="fill:var(--accent2)">SP</text>';
  h+='<path class="ei-flow" id="inflow" d="M10 20 H135 V40"/><text class="ei-txt" x="12" y="14">Inflow</text>';
  h+='<path class="ei-flow" d="M200 215 H300"/>';
  h+='<g transform="translate(300,198)"><path class="ei-st" d="M0 0 L22 17 L0 34 Z M44 0 L22 17 L44 34 Z"/><path class="ei-st" d="M22 17 V-2"/><path class="ei-st" d="M10 -2 q12 -16 24 0 z"/></g>';
  h+='<path class="ei-flow" d="M344 215 H420"/><text class="ei-txt" x="360" y="236">Outflow</text>';
  h+='<g transform="translate(232,52) scale(.55)">'+bubble('LT','101','field')+'</g>';
  h+='<g transform="translate(400,52) scale(.55)">'+bubble('LIC','101','dcs')+'</g>';
  h+='<path class="ei-st" d="M200 85 H232" stroke-dasharray="4 3"/><path class="ei-st" d="M298 85 H400" stroke-dasharray="4 3"/><path class="ei-st" d="M466 85 H540 V150 H322 V162" stroke-dasharray="4 3" style="display:none"/>';
  h+='<path class="ei-st" d="M433 118 V140 H322 V196" stroke-dasharray="4 3"/>';
  h+='<text class="ei-txt" id="rdAct" x="470" y="70">Actual level: 50%</text><text class="ei-txt" id="rdPV" x="470" y="90">Controller sees: 50%</text><text class="ei-txt" id="rdU" x="470" y="110">Valve position: 50%</text><text class="ei-txt" id="rdAl" x="470" y="130" style="fill:var(--warn)"></text>';
  h+='</svg></div>';
  h+='<div class="ei-rdrow"><span id="hAct"></span><span id="hPV"></span><span id="hU"></span><span id="hAl" style="color:var(--warn)"></span></div>';
  h+='<div class="ei-simctl"><label>Setpoint <b id="vSP">60</b>%<input type="range" id="inSP" min="20" max="90" value="60"></label><label>Gain Kc <b id="vKc">2.0</b><input type="range" id="inKc" min="0.5" max="6" step="0.1" value="2"></label><label>Integral time Ti <b id="vTi">40</b> s<input type="range" id="inTi" min="10" max="150" value="40"></label></div>';
  h+='<div class="ei-btnrow"><button class="ei-x" data-sim="up">Inflow +30%</button> <button class="ei-x" data-sim="freeze">Transmitter freezes</button> <button class="ei-x" data-sim="low">Transmitter fails low</button> <button class="ei-x" data-sim="stick">Valve stiction</button> <button class="ei-x" data-sim="frozen">Valve stuck</button> <button class="ei-x" data-sim="reset">Reset</button></div>';
  h+='<label style="display:block;margin:10px 0;font-size:14px"><input type="checkbox" id="inLS" checked> Independent high-high level switch (LSHH at 92%) trips the inlet</label>';
  h+='<div class="ei-decout" id="simnote">'+esc(S.note)+'</div>';
  h+='<svg viewBox="0 0 640 190" id="chart" class="ei-chart" role="img" aria-label="Level trend"></svg>';
  h+='<div class="ei-legendline"><span style="color:var(--accent)">Actual level</span> <span>Controller sees (PV)</span> <span style="color:var(--accent2)">Setpoint</span> <span style="color:var(--mute)">Valve %</span></div>';
  h+='<div class="ei-techn"><b>Technical note:</b> this is a simplified teaching model, not a process model for design. Real loops need tuning for the actual process, valve and measurement. <b>Simulator note:</b> the LSHH reset is simplified for teaching. Real shutdown and interlock reset logic may be latched and governed by the plant cause-and-effect matrix and SOP.</div>';
  return h;
}
function simAction(a){
  if(!S)simReset();
  if(a==='reset'){var sp=S.sp,Kc=S.Kc,Ti=S.Ti,ls=S.lshh;simReset();S.sp=sp;S.Kc=Kc;S.Ti=Ti;S.lshh=ls;}
  else if(a==='up'){S.qin0=S.qin0*1.3;S.note='Inflow increased by 30%. The controller should open the valve more. Watch whether the level settles back near the setpoint.';}
  else if(a==='freeze'){S.tmode='freeze';S.pvFrozen=S.h;S.note='The transmitter has frozen at its last value. The controller now believes the level is steady, so it will not react to real changes. Try Inflow +30% next.';}
  else if(a==='low'){S.tmode='low';S.note='The transmitter fails low (reads 0%). The controller thinks the tank is empty and closes the outlet valve, so the real level rises. An independent LSHH or a deviation alarm protects you.';}
  else if(a==='stick'){S.vmode='stick';S.note='Valve stiction: it holds until the command moves far enough, then jumps. With integral action this gives slow hunting in level.';}
  else if(a==='frozen'){S.vmode='frozen';S.note='The valve is stuck at its last position. The controller output changes but the valve does not move, so the level drifts with any inflow change.';}
}
function simStep(){
  if(!S)return;
  var dt=1;
  var pv=S.tmode==='freeze'?S.pvFrozen:S.tmode==='low'?0:S.h;
  var e=pv-S.sp;
  S.I+=e*dt/S.Ti;
  var un=50+S.Kc*(e+S.I),uc=Math.min(100,Math.max(0,un));
  if(un!==uc)S.I-=e*dt/S.Ti;
  var cmd=uc;
  if(S.vmode==='frozen'){}
  else if(S.vmode==='stick'){if(Math.abs(cmd-S.pos)>6)S.pos=cmd;}
  else{var d=cmd-S.pos,mx=5*dt;S.pos+=Math.max(-mx,Math.min(mx,d));}
  var qin=S.qin0;
  if(S.lshh&&S.h>=92)S.trip=true;
  if(!S.lshh)S.trip=false;
  if(S.trip)qin=0;
  var qout=100*(S.pos/100)*Math.sqrt(Math.max(S.h,0)/100);
  S.h+=dt*(qin-qout)/12;
  S.h=Math.min(100,Math.max(0,S.h));
  if(S.trip&&S.h<80){S.trip=false;}
  S.t++;
  S.H.push(S.h);S.PV.push(pv);S.U.push(S.pos);S.SP.push(S.sp);
  if(S.H.length>240){S.H.shift();S.PV.shift();S.U.shift();S.SP.shift();}
  var al='';
  if(S.h>=100)al='OVERFLOW';
  else if(S.h<=1)al='TANK EMPTY';
  else if(S.trip)al='LSHH TRIP: inlet closed';
  else if(pv>=85)al='LAH alarm';
  else if(Math.abs(pv-S.h)>10)al='PV and actual differ';
  var tx=function(id,t){var n=$(id);if(n)n.textContent=t;};
  tx('rdAct','Actual level: '+S.h.toFixed(0)+'%');
  tx('rdPV','Controller sees: '+pv.toFixed(0)+'%');
  tx('rdU','Valve position: '+S.pos.toFixed(0)+'%');
  tx('rdAl',al);
  tx('hAct','Actual level: '+S.h.toFixed(0)+'%');tx('hPV','Controller sees: '+pv.toFixed(0)+'%');tx('hU','Valve: '+S.pos.toFixed(0)+'%');tx('hAl',al);
  var f=$('lvfill');
  if(f){var hh=190*S.h/100*0.98;f.setAttribute('y',String(228-hh));f.setAttribute('height',String(hh));}
  var sl=$('splin');
  if(sl){var y=228-190*S.sp/100*0.98;sl.setAttribute('y1',String(y));sl.setAttribute('y2',String(y));}
  drawChart();
}
function poly(a,col,dash){
  if(!a.length)return '';
  var pts=a.map(function(v,i){return (30+i*(600/240)).toFixed(1)+','+(170-v*1.5).toFixed(1);}).join(' ');
  return '<polyline fill="none" stroke="'+col+'" stroke-width="2" '+(dash?'stroke-dasharray="5 4" ':'')+'points="'+pts+'"/>';
}
function drawChart(){
  var c=$('chart');if(!c||!S)return;
  var g='<rect x="30" y="20" width="600" height="150" fill="none" stroke="var(--line)"/>';
  [0,25,50,75,100].forEach(function(v){var y=170-v*1.5;g+='<line x1="30" y1="'+y+'" x2="630" y2="'+y+'" stroke="var(--line)" stroke-dasharray="2 4"/><text x="4" y="'+(y+4)+'" font-size="10" fill="currentColor">'+v+'</text>';});
  g+=poly(S.U,'var(--mute)',true)+poly(S.SP,'var(--accent2)',true)+poly(S.PV,'currentColor',true)+poly(S.H,'var(--accent)',false);
  c.innerHTML=g;
}
function simStart(){
  stopSim();
  if(!S)simReset();
  var sp=$('inSP'),kc=$('inKc'),ti=$('inTi'),ls=$('inLS');
  if(sp){sp.value=S.sp;$('vSP').textContent=S.sp;sp.addEventListener('input',function(){S.sp=parseFloat(this.value);$('vSP').textContent=this.value;});}
  if(kc){kc.value=S.Kc;$('vKc').textContent=S.Kc.toFixed(1);kc.addEventListener('input',function(){S.Kc=parseFloat(this.value);$('vKc').textContent=S.Kc.toFixed(1);});}
  if(ti){ti.value=S.Ti;$('vTi').textContent=S.Ti;ti.addEventListener('input',function(){S.Ti=parseFloat(this.value);$('vTi').textContent=this.value;});}
  if(ls){ls.checked=S.lshh;ls.addEventListener('change',function(){S.lshh=this.checked;});}
  var obs=setInterval(function(){var n=$('simnote');if(n&&S&&n.textContent!==S.note)n.textContent=S.note;},300);
  simTimer=setInterval(simStep,100);
  S._obs=obs;
  drawChart();
}
function stopSim(){if(simTimer){clearInterval(simTimer);simTimer=null;}if(S&&S._obs){clearInterval(S._obs);S._obs=null;}}

/* ============ TABS ============ */
function showTab(t){
  state.tab=t;
  $('sec-eq').classList.toggle('ei-hide',t!=='eq');
  $('sec-in').classList.toggle('ei-hide',t!=='in');
  $('sec-lab').classList.toggle('ei-hide',t!=='lab');
  $('sec-ag').classList.toggle('ei-hide',t!=='ag');
  $('bar').classList.toggle('ei-hide',t==='lab'||t==='ag');
  $('tab-ag').setAttribute('aria-selected',t==='ag');
  $('tab-eq').setAttribute('aria-selected',t==='eq');
  $('tab-in').setAttribute('aria-selected',t==='in');
  $('tab-lab').setAttribute('aria-selected',t==='lab');
  if(t==='lab'){renderLab();}else if(t==='ag'){stopSim();}else{stopSim();
    $('q').placeholder=t==='eq'?'Search equipment or a concept\u2026':'Search instruments or a tag\u2026';
    $('q').value=state.q[t];renderGrid(t);}
}
$('tab-eq').addEventListener('click',function(){showTab('eq');setHash('');});
$('tab-in').addEventListener('click',function(){showTab('in');setHash('instrumentation');});
$('tab-lab').addEventListener('click',function(){showTab('lab');setHash('labs');});
$('tab-ag').addEventListener('click',function(){showTab('ag');setHash('agitators');});
function setQuery(v){
  state.q.eq=state.q['in']=v;renderGrid('eq');renderGrid('in');
  $('qclear').hidden=!v;$('bar').classList.toggle('has-q',!!v);
}
$('q').addEventListener('input',function(){
  var t=state.tab;if(t==='lab')return;setQuery(this.value);
  if(this.value.length>1)trackLater('s',t==='eq'?'equipment_search':'instrument_search',{search_term:this.value.toLowerCase().slice(0,40)});
});
$('q').addEventListener('keydown',function(e){if(e.key==='Escape'&&this.value){e.stopPropagation();this.value='';setQuery('');}});
$('qclear').addEventListener('click',function(){$('q').value='';setQuery('');$('q').focus();});
document.addEventListener('keydown',function(e){
  if(e.key!=='/'||e.ctrlKey||e.metaKey||e.altKey)return;
  var tg=(e.target.tagName||'').toLowerCase();if(tg==='input'||tg==='textarea'||e.target.isContentEditable)return;
  if(state.tab==='lab'||$('ov').classList.contains('ei-on'))return;
  e.preventDefault();$('q').focus();
});
['cnt-eq','cnt-in','grid-eq','grid-in'].forEach(function(id){$(id).addEventListener('click',function(e){
  var go=e.target.closest?e.target.closest('[data-go]'):null;
  if(go){showTab(go.getAttribute('data-go'));setHash(go.getAttribute('data-go')==='in'?'instrumentation':'');window.scrollTo({top:$('bar').getBoundingClientRect().top+window.scrollY-140});return;}
  var ac=e.target.closest?e.target.closest('[data-allcat]'):null;
  if(ac){var t=ac.getAttribute('data-allcat');state.cat[t]='All';buildChips(t);renderGrid(t);}
});});

/* legend + decoder + letter table */
(function(){
  var items=[['field','Field mounted'],['room','Control room / main panel'],['aux','Auxiliary / local panel'],['dcs','DCS shared display and control'],['plc','PLC / safety logic'],['comp','Computer function']];
  var h=items.map(function(x){return '<div class="ei-lg">'+svg(120,120,bubble('XX','101',x[0]))+'<div>'+x[1]+'</div></div>';}).join('');
  var els=[['valve','Control valve with diaphragm actuator'],['onoff','On/off shutdown valve'],['solenoid','Solenoid valve'],['psv','Pressure safety valve'],['disc','Rupture disc'],['orifice','Orifice plate (flow element)']];
  h+=els.map(function(x){return '<div class="ei-lg">'+svg(120,100,'<g transform="translate(0,-105)">'+elementSym(x[0])+'</g>')+'<div>'+x[1]+'</div></div>';}).join('');
  $('legend').innerHTML=h;
  var rows='<tr><th>First letter</th><th>Measured variable</th><th>Letters after it</th><th>Meaning</th></tr>';
  var fk=Object.keys(FIRST),sk=Object.keys(FUNC).concat(['HH','LL']),mk=Object.keys(MOD);
  var n=Math.max(fk.length,sk.length);
  for(var i=0;i<n;i++){
    var a=fk[i]?'<td><b>'+fk[i]+'</b></td><td>'+esc(FIRST[fk[i]])+'</td>':'<td></td><td></td>';
    var s=sk[i]?(sk[i]==='HH'?'High-high':sk[i]==='LL'?'Low-low':FUNC[sk[i]]):'';
    var b=sk[i]?'<td><b>'+sk[i]+'</b></td><td>'+esc(s)+'</td>':'<td></td><td></td>';
    rows+='<tr>'+a+b+'</tr>';
  }
  rows+='<tr><th colspan="4">Modifiers right after the first letter: '+mk.map(function(m){return '<b>'+m+'</b> = '+esc(MOD[m]);}).join(', ')+'. Example: PDT = Pressure + Differential + Transmitter.</th></tr>';
  $('lettertbl').innerHTML=rows;
  var inp=$('dec');
  function up(){$('decout').innerHTML=decode(inp.value);if(inp.value.length>2)trackLater('d','tag_decoded',{tag:inp.value.toUpperCase().slice(0,10)});}
  inp.addEventListener('input',up);up();
})();

/* ============ Agitators tab ============ */
var AG=[];
function A(name,dia,flow,np,npv,regime,visc,dt,tip,one,how,deep,watch,use){
  AG.push({cat:flow,name:name,dia:dia,flow:flow,np:np,npv:npv,regime:regime,visc:visc,dt:dt,tip:tip,one:one,how:how,deep:deep,watch:watch,use:use});
}
A('Rushton Turbine (6-blade Disc)','rushton','Radial','About 5 (baffled, turbulent)',5.0,'Turbulent and transitional','Low (water-like to moderately viscous)','0.25 to 0.4','Moderate',
 'A flat disc with six vertical blades that throws liquid straight out to the vessel wall. The classic impeller for gas dispersion.',
 ['The blades push liquid radially outward as a strong jet.','The jet hits the wall and splits into two circulation loops, one above and one below the impeller.','Gas fed under the disc is broken into fine bubbles by the trailing vortices behind each blade.'],
 ['Power P = Np x rho x N^3 x D^5, with Np about 5 in a fully baffled tank at Re above about 10,000.','In laminar flow, Np x Re is roughly constant (Kp about 70 for the standard design).','When gas is fed, power falls (often to 40-60% of ungassed power) and the impeller can flood if gas rate is too high for the speed.','Uses a lot of power for the flow it delivers, so it is not efficient for plain blending.'],
 'Using it for simple blending or solids suspension wastes power. With several Rushtons on one shaft, the zones between them can mix poorly (compartmentalisation). Flooding when gas rate is too high for the speed.',
 'Gas dispersion in fermenters and hydrogenators, liquid-liquid dispersion and extraction, and high-shear blending of thin liquids.');
A('Pitched-blade Turbine (45 deg, 4-blade)','pbt','Mixed (mainly axial)','About 1.2 to 1.5 (4 blades at 45 deg)',1.27,'Turbulent and transitional','Low to medium','0.3 to 0.5','Moderate',
 'Flat blades set at an angle, usually 45 degrees, so the impeller pushes liquid down (or up) as well as outward. The general-purpose workhorse.',
 ['The angled blades push liquid down towards the vessel bottom (down-pumping mode).','Flow sweeps across the bottom, rises along the walls and returns to the impeller from above.','This single loop suspends solids and turns over the whole batch.'],
 ['Np about 1.27 for a standard 4-blade 45 deg design in a baffled tank, so it gives more flow per kW than a Rushton.','Down-pumping is normal for solids suspension; up-pumping is sometimes used for surface incorporation or gas.','Off-bottom clearance of about D/2 to T/3 is typical; too high and solids settle at the base.','Zwietering correlation (Njs) is used to find the minimum speed to just suspend solids.'],
 'Mounting it the wrong way round (pumping up instead of down). Placing it too high above the bottom for solids duty. Expecting it to disperse gas as well as a radial turbine.',
 'Solids suspension, blending, heat transfer in jacketed reactors and crystallisers.');
A('Hydrofoil (High-efficiency Axial)','hydrofoil','Axial','About 0.3 (geometry dependent)',0.3,'Turbulent','Low (water-like)','0.3 to 0.6','Moderate',
 'Wide, twisted, aerofoil-shaped blades that move a lot of liquid with little power and little shear.',
 ['The aerofoil blades push liquid almost straight down, like a ship propeller.','The strong axial flow sweeps the bottom and rises along the walls.','Because the blade is shaped like a wing, most of the power goes into flow rather than shear.'],
 ['Very low power number (about 0.3), so it delivers high flow per kW.','Good for blending and solids suspension in large, low-viscosity tanks.','Efficiency falls in viscous liquids; it is designed for turbulent flow.','Low shear makes it suitable for shear-sensitive crystals and cells.'],
 'Using it in viscous liquids where its flow pattern breaks down. Using a narrow-blade hydrofoil for gas dispersion, where it floods easily (wide-blade hydrofoils are made for gas duty). Undersizing the diameter to save cost.',
 'Large blending tanks, solids suspension, crystallisers and storage tanks with low-viscosity liquids.');
A('Marine Propeller','propeller','Axial','About 0.3 to 0.4 (3-blade, square pitch)',0.35,'Turbulent','Low','Small, often 0.1 to 0.3','High rotational speed',
 'A small three-blade propeller, like a boat propeller, that runs fast and drives a strong axial current.',
 ['The propeller spins at high speed and drives liquid along the shaft axis.','The jet sets up one large circulation loop through the tank.','It is often mounted off-centre, angled or through the side wall to avoid swirl without baffles.'],
 ['Power number depends on pitch; about 0.3 to 0.4 for a square-pitch 3-blade propeller in a baffled tank.','Usually direct-driven at high speed in small vessels; side-entry versions are used in large storage tanks.','Off-centre or angled mounting replaces baffles in small portable mixers.','Not suitable for viscous liquids.'],
 'Centre mounting without baffles, which gives a vortex and little real mixing. Using it in viscous products. Expecting it to suspend heavy solids in large tanks.',
 'Small blending tanks, portable mixers, side-entry mixers on large storage tanks, and dissolving tanks.');
A('Concave-blade (Smith) Turbine','concave','Radial','About 2.5 to 3.2 ungassed',3.0,'Turbulent','Low','0.3 to 0.4','Moderate',
 'Like a Rushton turbine but with curved, hollow blades. It handles much more gas before its power drops.',
 ['The disc carries six concave (half-pipe) blades.','Liquid is thrown radially outward like a Rushton.','The curved blades reduce the gas cavities behind each blade, so the impeller keeps its power when gassed.'],
 ['Ungassed power number is lower than a Rushton (roughly 2.5 to 3.2 depending on design).','Gassed power drops much less than a Rushton, so gas handling capacity is higher.','Widely used as the bottom impeller in fermenters and gas-liquid reactors.'],
 'Treating it as a blending impeller. Ignoring the gassed power curve when sizing the motor.',
 'Gas-liquid reactors, fermenters and hydrogenation where high gas rates must be dispersed.');
A('Flat-blade Paddle','paddle','Radial and tangential','Depends strongly on blade width and number','',  'Transitional and laminar','Low to medium','0.5 to 0.8','Low',
 'Two or four flat vertical blades on a shaft. The simplest agitator, running slowly.',
 ['The broad blades push liquid around and outward at low speed.','Without baffles, most of the flow is a swirl around the shaft.','Mixing is gentle with little shear.'],
 ['Simple and cheap; often used where only gentle mixing is needed.','Power number depends strongly on blade width, number and baffling, so use vendor data.','At low liquid levels a paddle near the bottom keeps the batch moving.'],
 'Expecting good top-to-bottom mixing in a tall vessel. Running without baffles in thin liquids, which just swirls the batch.',
 'Gentle mixing, slurry holding tanks and simple dissolving duties.');
A('Retreat-curve Impeller (Glass-lined)','retreat','Radial with some axial','Low; depends strongly on baffling','',  'Turbulent and transitional','Low to medium','About 0.5 to 0.6','Moderate',
 'A three-blade impeller with curved, swept-back blades, mounted close to the dished bottom. The standard agitator in glass-lined reactors.',
 ['The swept-back blades push liquid outward and slightly upward from close to the bottom head.','Because it sits low, it keeps mixing even at small batch volumes.','Glass-lined vessels usually have only one or two baffles (finger or beavertail type), so swirl is significant.'],
 ['Its shape suits glass coating: no sharp edges or welded joints.','Works at low liquid levels because of the low mounting.','Heat transfer and blending depend heavily on the baffle arrangement.','Glass-lined versions of pitched-blade and turbine impellers are also available when more flow or shear is needed.'],
 'Running a glass-lined reactor without its baffle, which gives a vortex and poor heat transfer. Thermal shock or impact damage to the glass coating.',
 'General reactions, distillation and crystallisation in glass-lined batch reactors.');
A('Anchor Agitator','anchor','Close-clearance (tangential)','Depends on Reynolds number (laminar)','',  'Laminar and transitional','Medium to high (viscous liquids, creams)','0.9 to 0.98','Low',
 'A U-shaped agitator that follows the vessel wall closely. It scrapes the wall to improve heat transfer in viscous batches.',
 ['The anchor arms sweep close to the vessel wall and bottom.','They move the viscous layer at the wall, which improves heat transfer.','Flow is mostly around the vessel; there is little top-to-bottom mixing.'],
 ['Used in the laminar region where turbine impellers no longer pump well.','Wall clearance is small, typically a few percent of the diameter, sometimes with scrapers.','Often combined with a faster inner impeller (counter-rotating or coaxial) to improve vertical mixing.','Baffles are usually not needed in laminar flow.'],
 'Expecting it to blend a thin liquid well. Poor top-to-bottom mixing in tall batches. Clearance too large, which loses the heat-transfer benefit.',
 'Viscous products, creams, ointments, resins and heat-sensitive batches in jacketed vessels.');
A('Gate (Frame) Agitator','gate','Close-clearance (tangential)','Depends on Reynolds number (laminar)','',  'Laminar and transitional','Medium to high','0.9 to 0.98','Low',
 'An anchor with extra horizontal and vertical bars, like a gate. It moves more of the batch than a plain anchor.',
 ['The outer frame sweeps close to the wall like an anchor.','The cross bars break up the rotating mass and add some vertical movement.','Mixing is gentle and suited to viscous liquids.'],
 ['Better bulk mixing than a plain anchor at similar speed.','Used in the laminar and low transitional range.','Simple and rugged; often used in large slow-speed vessels.'],
 'Using it at high speed in thin liquids. Expecting the top-to-bottom turnover of a helical ribbon.',
 'Viscous solutions, slurries and gentle mixing in large vessels.');
A('Helical Ribbon','ribbon','Close-clearance (axial)','Depends on Reynolds number (laminar)','',  'Laminar','High to very high (polymers, pastes)','0.9 to 0.95','Low',
 'One or two helical ribbons that wind around the shaft close to the wall. The best choice for very viscous liquids.',
 ['The ribbon lifts material up along the wall as it turns.','Material returns down near the shaft, giving true top-to-bottom turnover.','This works in the laminar region where other impellers only stir locally.'],
 ['Gives the shortest blend time in very viscous liquids.','High torque at low speed, so the drive and shaft must be sized for it.','An inner screw is sometimes added to pump down the centre.'],
 'Using it for thin liquids. Undersized drive for the torque. Difficult cleaning between batches.',
 'Polymers, adhesives, pastes, greases and other very viscous batches.');
A('Sawtooth (Cowles) Disperser','disperser','High shear (radial)','Low; depends on design','',  'Turbulent near the blade','Low to medium (dispersion base)','About 0.25 to 0.35','High, about 18 to 25 m/s',
 'A flat disc with bent teeth around its edge, running very fast. It breaks up powders and agglomerates in a liquid.',
 ['The disc runs at high tip speed.','Liquid is flung outward and returns above and below the disc, forming a rolling doughnut pattern.','Powder drawn into the vortex is sheared at the teeth and wetted out.'],
 ['Tip speed (pi x D x N) is the key setting, commonly about 18 to 25 m/s.','The doughnut pattern needs the right disc diameter, height above the bottom and liquid depth.','Little bulk pumping, so a slow anchor or second agitator is often added for large or viscous batches.','Generates heat; long runs can raise batch temperature.'],
 'Wrong disc-to-tank ratio or liquid depth, which loses the doughnut flow. Running it as a general blender. Ignoring heat build-up.',
 'Powder wetting, pigment and filler dispersion, paints, inks and suspensions.');
A('Rotor-Stator High-shear Mixer','rotorstator','High shear (radial jets)','Not usually quoted; use vendor data','',  'Turbulent in the shear gap','Low to medium','Small head','Very high in the shear gap',
 'A fast rotor spinning inside a slotted stator. Liquid is forced through a narrow gap, giving very high shear.',
 ['The rotor draws liquid and solids into the head from below.','Material is forced out through the stator slots at high speed.','The intense shear in the gap breaks droplets and agglomerates.'],
 ['Used for emulsions, fine dispersions and deagglomeration.','Available as batch (top-entry), bottom-entry or inline units.','Bulk circulation in the tank is weak, so a separate agitator is often needed.','Heat input is significant on long runs.'],
 'Relying on it for bulk mixing of a large tank. Running it dry or uncovered. Ignoring temperature rise.',
 'Creams, emulsions, suspensions, dissolving gums and powders, and particle size reduction in liquids.');
A('Gas-inducing (Hollow-shaft) Impeller','gasinduce','Radial with gas induction','Depends on design','',  'Turbulent','Low','0.3 to 0.4','High enough to draw gas',
 'An impeller on a hollow shaft. Low pressure at the blade tips sucks headspace gas down the shaft and disperses it into the liquid.',
 ['Holes near the top of the hollow shaft sit in the gas headspace.','At speed, low pressure behind the impeller blades draws gas down the shaft.','The gas leaves at the blade tips as fine bubbles and is recirculated continuously.'],
 ['Recirculates unreacted gas, which suits dead-end hydrogenation without an external compressor.','Needs a minimum speed and correct submergence before it starts to draw gas.','Gas induction rate depends on speed, submergence and liquid properties; use vendor data.'],
 'Running below the onset speed so no gas is drawn. Wrong liquid level, which uncovers or floods the shaft openings.',
 'Hydrogenation, oxidation and other gas-liquid reactions in autoclaves.');
A('ANFD Agitator (Nutsche Blades)','anfd','Close to the filter bed (cake handling)','Not used; the drive is sized on torque','',  'Slurry and wet cake (not a liquid mixing regime)','Slurry, wet cake and dry powder','Blades reach close to the wall','Slow',
 'The agitator inside an Agitated Nutsche Filter Dryer (ANFD). Its blades can be raised and lowered to reslurry, smooth, dry and finally discharge the cake.',
 ['During filtration the agitator is raised clear of the cake.','For a reslurry wash it is lowered and turned to mix the cake into the wash liquid, then raised while the wash is filtered off.','Turning in the smoothing direction levels the cake and closes cracks, so wash liquid and gas do not bypass.','During drying it turns slowly to break lumps and expose fresh cake to the heated plate and walls.','To discharge, it is lowered step by step and turned in the direction that sweeps the dry cake to the side discharge valve.'],
 ['Blade height is set hydraulically or mechanically. Cutting into a dense or hard cake is limited by torque, so it is lowered in small steps.','Torque, not power number, is the main design limit. The drive is sized for peak torque when the blades cut into dense or sticky cake.','Reslurry washing usually washes better than displacement washing for cracked or compressible cakes, at the cost of extra filtration time.','Heated agitators and walls speed up drying. Agitation during drying can break fragile crystals, so speed and intermittent stirring are set for each product.','A thin heel of cake usually stays on the filter cloth after discharge and is removed by reslurrying or a heel-removal system.'],
 'Lowering too fast into a dense cake and tripping on high torque. Over-stirring fragile crystals during drying, which makes fines and slows the next filtration. Stirring a cracked cake during displacement washing instead of smoothing it first. Stirring the cake while it is in its sticky wet stage, which can form balls and lumps.',
 'Isolation of pharma and fine-chemical products where filtration, washing and drying are done in one closed vessel, which also helps contain potent or solvent-wet products.');

/* drawings */
function agTank(baffles){
  var s='<path class="ei-st" d="M40 14 V138 q0 20 20 20 H160 q20 0 20 -20 V14"/>'+
        '<path class="ei-fl" d="M42 34 H178 V138 q0 18 -18 18 H60 q-18 0 -18 -18 Z"/>'+
        '<rect class="ei-st" x="98" y="2" width="24" height="10" rx="2"/>';
  if(baffles)s+='<line class="ei-st" x1="46" y1="38" x2="46" y2="146" style="opacity:.45"/><line class="ei-st" x1="174" y1="38" x2="174" y2="146" style="opacity:.45"/>';
  return s;
}
function mir(d){return d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,function(m,x,y){return (220-parseFloat(x))+' '+y;});}
function loops(kind,y){
  var L='';
  if(kind==='radial'){
    var up='M92 '+y+' L56 '+y+' Q50 '+y+' 50 '+(y-10)+' L50 46 Q50 40 58 40 L98 40 Q104 40 104 48 L104 '+(y-10);
    var dn='M92 '+(y+2)+' L56 '+(y+2)+' Q50 '+(y+2)+' 50 '+(y+12)+' L50 136 Q50 148 62 148 L98 148 Q104 148 104 140 L104 '+(y+12);
    L=arr(up)+arr(dn)+arr(mir(up))+arr(mir(dn));
  }else if(kind==='axial'){
    var a='M104 46 L104 140 Q104 148 96 148 L60 148 Q50 148 50 138 L50 48 Q50 40 58 40 L96 40';
    L=arr(a)+arr(mir(a));
  }else if(kind==='up'){
    var b='M96 40 L58 40 Q50 40 50 48 L50 138 Q50 148 60 148 L96 148 Q104 148 104 140 L104 46';
    b='M58 148 Q50 148 50 138 L50 48 Q50 40 58 40 L96 40 Q104 40 104 48 L104 140 Q104 148 96 148 Z';
    L=arr('M50 140 L50 48 Q50 40 58 40 L96 40 Q104 40 104 48 L104 138')+arr(mir('M50 140 L50 48 Q50 40 58 40 L96 40 Q104 40 104 48 L104 138'));
  }else if(kind==='swirl'){
    L=arr('M60 70 Q110 82 160 70')+arr('M60 104 Q110 116 160 104')+arr('M60 136 Q110 146 160 136');
  }else if(kind==='doughnut'){
    var u='M100 '+y+' L70 '+y+' Q60 '+y+' 60 '+(y-12)+' Q60 '+(y-26)+' 80 '+(y-26)+' L100 '+(y-26)+' L100 '+(y-8);
    var d='M100 '+(y+2)+' L70 '+(y+2)+' Q60 '+(y+2)+' 60 '+(y+14)+' Q60 '+(y+28)+' 80 '+(y+28)+' L100 '+(y+28)+' L100 '+(y+10);
    L=arr(u)+arr(d)+arr(mir(u))+arr(mir(d));
  }else if(kind==='jets'){
    L=arr('M110 150 L110 '+(y+10))+arr('M100 '+y+' L76 '+y)+arr('M120 '+y+' L144 '+y)+arr('M100 '+(y-6)+' L80 '+(y-18))+arr('M120 '+(y-6)+' L140 '+(y-18));
  }
  return L;
}
function agImp(kind,y){
  var s='';
  if(kind==='rushton'){s='<line class="ei-st" x1="90" y1="'+y+'" x2="130" y2="'+y+'"/><rect class="ei-st" x="84" y="'+(y-8)+'" width="8" height="16"/><rect class="ei-st" x="128" y="'+(y-8)+'" width="8" height="16"/><rect class="ei-st" x="106" y="'+(y-8)+'" width="8" height="16" style="opacity:.5"/>';}
  else if(kind==='concave'){s='<line class="ei-st" x1="90" y1="'+y+'" x2="130" y2="'+y+'"/><path class="ei-st" d="M90 '+(y-8)+' q-8 8 0 16"/><path class="ei-st" d="M130 '+(y-8)+' q8 8 0 16"/>';}
  else if(kind==='pbt'){s='<line class="ei-st" x1="84" y1="'+(y-7)+'" x2="104" y2="'+(y+7)+'"/><line class="ei-st" x1="136" y1="'+(y-7)+'" x2="116" y2="'+(y+7)+'"/><rect class="ei-st" x="104" y="'+(y-4)+'" width="12" height="8"/>';}
  else if(kind==='hydrofoil'){s='<path class="ei-st" d="M110 '+y+' Q94 '+(y-6)+' 78 '+(y+4)+' Q94 '+(y+2)+' 110 '+(y+6)+'"/><path class="ei-st" d="M110 '+y+' Q126 '+(y-6)+' 142 '+(y+4)+' Q126 '+(y+2)+' 110 '+(y+6)+'"/>';}
  else if(kind==='propeller'){s='<ellipse class="ei-st" cx="99" cy="'+y+'" rx="11" ry="4" transform="rotate(-25 99 '+y+')"/><ellipse class="ei-st" cx="121" cy="'+y+'" rx="11" ry="4" transform="rotate(-25 121 '+y+')"/>';}
  else if(kind==='paddle'){s='<rect class="ei-st" x="74" y="'+(y-10)+'" width="72" height="20" rx="2"/>';}
  else if(kind==='retreat'){s='<path class="ei-st" d="M110 '+y+' Q90 '+y+' 70 '+(y-10)+'"/><path class="ei-st" d="M110 '+y+' Q130 '+y+' 150 '+(y-10)+'"/>';}
  else if(kind==='anchor'){s='<path class="ei-st" d="M54 46 V132 q0 18 56 18 q56 0 56 -18 V46" style="stroke-width:3"/>';}
  else if(kind==='gate'){s='<path class="ei-st" d="M54 46 V132 q0 18 56 18 q56 0 56 -18 V46" style="stroke-width:3"/><line class="ei-st" x1="54" y1="76" x2="166" y2="76"/><line class="ei-st" x1="54" y1="110" x2="166" y2="110"/><line class="ei-st" x1="82" y1="76" x2="82" y2="146"/><line class="ei-st" x1="138" y1="76" x2="138" y2="146"/>';}
  else if(kind==='ribbon'){s='<path class="ei-st" d="M54 44 C110 52 110 52 166 62 M166 62 C110 72 110 72 54 82 M54 82 C110 92 110 92 166 102 M166 102 C110 112 110 112 54 122 M54 122 C110 132 110 132 166 142" style="stroke-width:3"/>';}
  else if(kind==='disperser'){var z='M86 '+y;for(var i=0;i<6;i++){z+=' l4 -5 l4 5';}s='<path class="ei-st" d="'+z+'"/>';}
  else if(kind==='rotorstator'){s='<rect class="ei-st" x="98" y="'+(y-10)+'" width="24" height="20" rx="3"/><line class="ei-st" x1="104" y1="'+(y-10)+'" x2="104" y2="'+(y+10)+'" style="opacity:.6"/><line class="ei-st" x1="110" y1="'+(y-10)+'" x2="110" y2="'+(y+10)+'" style="opacity:.6"/><line class="ei-st" x1="116" y1="'+(y-10)+'" x2="116" y2="'+(y+10)+'" style="opacity:.6"/>';}
  else if(kind==='gasinduce'){s='<line class="ei-st" x1="90" y1="'+y+'" x2="130" y2="'+y+'"/><rect class="ei-st" x="84" y="'+(y-7)+'" width="8" height="14"/><rect class="ei-st" x="128" y="'+(y-7)+'" width="8" height="14"/>';}
  return s;
}
var AGSPEC={
 rushton:{y:96,f:'radial',b:1},concave:{y:96,f:'radial',b:1},pbt:{y:110,f:'axial',b:1},hydrofoil:{y:110,f:'axial',b:1},
 propeller:{y:110,f:'axial',b:1},paddle:{y:110,f:'swirl',b:0},retreat:{y:140,f:'radial',b:1},anchor:{y:150,f:'swirl',b:0},
 gate:{y:150,f:'swirl',b:0},ribbon:{y:150,f:'up',b:0},disperser:{y:110,f:'doughnut',b:0},rotorstator:{y:126,f:'jets',b:0},gasinduce:{y:110,f:'radial',b:1},anfd:{y:112,f:'none',b:0}
};
function agDia(it){
  var k=it.dia;
  if(k==='anfd'){
    var t='<path class="ei-st" d="M40 14 V132 H180 V14"/><rect class="ei-st" x="98" y="2" width="24" height="10" rx="2"/>'+
      '<path class="ei-fl" d="M42 60 H178 V118 H42 Z" style="opacity:.14"/>'+
      '<rect x="42" y="118" width="136" height="13" style="fill:var(--accent);opacity:.45"/>'+
      '<line class="ei-st" x1="40" y1="132" x2="180" y2="132" stroke-dasharray="4 3"/>'+
      '<path class="ei-st" d="M50 132 L50 146 H170 L170 132"/>'+
      '<line class="ei-st" x1="110" y1="12" x2="110" y2="112"/>'+
      '<path class="ei-st" d="M110 112 L60 108 M110 112 L160 108" style="stroke-width:3"/>'+
      '<path class="ei-st" d="M66 104 l-8 8 M154 104 l8 8 M86 106 l-6 8 M134 106 l6 8"/>'+
      '<path class="ei-st" d="M180 120 H200 V128 H180"/>'+
      arr('M124 40 L124 70')+arr('M132 70 L132 40')+arr('M110 146 L110 164')+arr('M182 124 L212 124')+
      '<text class="ei-txt" x="138" y="54">raise / lower</text><text class="ei-txt" x="64" y="128" style="fill:var(--bg)">cake</text>'+
      '<text class="ei-txt" x="116" y="162">filtrate</text><text class="ei-txt" x="184" y="114">out</text>';
    return svg(220,166,t);
  }
  var sp=AGSPEC[k],s=agTank(sp.b);
  if(k==='gasinduce'){s+='<line class="ei-st" x1="106" y1="12" x2="106" y2="'+sp.y+'"/><line class="ei-st" x1="114" y1="12" x2="114" y2="'+sp.y+'"/>'+arr('M110 20 L110 '+(sp.y-8),1);}
  else s+='<line class="ei-st" x1="110" y1="12" x2="110" y2="'+sp.y+'"/>';
  s+=agImp(k,sp.y)+loops(sp.f,sp.y);
  if(k==='gasinduce')s+='<circle class="ei-st" cx="72" cy="'+(sp.y-14)+'" r="2.5"/><circle class="ei-st" cx="66" cy="'+(sp.y-26)+'" r="2"/><circle class="ei-st" cx="150" cy="'+(sp.y-16)+'" r="2.5"/><circle class="ei-st" cx="156" cy="'+(sp.y-30)+'" r="2"/>';
  return svg(220,166,s);
}

function renderAg(){
  $('grid-ag').innerHTML=AG.map(function(it,i){
    var chips='<span>'+esc(it.flow)+'</span><span>'+esc(it.regime)+'</span>';
    return '<button class="ei-card" data-i="'+i+'" data-t="ag"><div class="ei-thumb">'+agDia(it)+'</div><div class="ei-tag">'+esc(it.flow)+' flow</div><h3>'+esc(it.name)+'</h3><div class="ei-qf">'+chips+'</div><p>'+esc(it.one)+'</p></button>';
  }).join('');
  var sel=$('ag-imp');
  if(sel&&!sel.options.length){
    sel.innerHTML=AG.map(function(it,i){return '<option value="'+i+'">'+esc(it.name)+'</option>';}).join('');
  }
}
/* flow regime calculator */
function fmtN(v,d){if(!isFinite(v))return '-';return v.toLocaleString('en-IN',{maximumFractionDigits:d===undefined?0:d});}
function agCalc(){
  var it=AG[+$('ag-imp').value]||AG[0];
  var N=+$('ag-n').value,Dm=+$('ag-d').value/1000,rho=+$('ag-rho').value,mu=+$('ag-mu').value/1000,V=+$('ag-v').value/1000;
  var n=N/60,Re=rho*n*Dm*Dm/mu,tip=Math.PI*Dm*n;
  var reg=Re<10?['Laminar','lam','Viscous forces dominate. Flow follows the impeller; close-clearance agitators (anchor, gate, ribbon) work best. Power varies with viscosity: P = Kp x mu x N^2 x D^3.']:
          Re<10000?['Transitional','tra','Both viscous and inertial forces matter. Power number changes with Re, so read Np from the impeller’s Np-Re curve.']:
          ['Turbulent','tur','Inertial forces dominate. In a baffled tank the power number is roughly constant, so P = Np x rho x N^3 x D^5.'];
  var out='<div class="ei-agres"><div><span>Reynolds number</span><b>'+fmtN(Re)+'</b></div><div><span>Flow regime</span><b class="ei-reg ei-reg-'+reg[1]+'">'+reg[0]+'</b></div><div><span>Tip speed</span><b>'+fmtN(tip,2)+' m/s</b></div>';
  var pw='';
  if(reg[1]==='tur'&&it.npv){var P=it.npv*rho*Math.pow(n,3)*Math.pow(Dm,5);out+='<div><span>Power (Np '+it.npv+')</span><b>'+fmtN(P/1000,2)+' kW</b></div>';if(V>0)out+='<div><span>Power per volume</span><b>'+fmtN(P/1000/V,2)+' kW/m³</b></div>';}
  else pw='<p class="ei-agnote">Power is shown only for turbulent flow with a known power number. '+(it.npv?'In this regime Np changes with Re.':'This impeller’s power number depends on design and Re.')+' Use the <a href="'+SITE+'/calculators/agitator-simulator/">Agitator Simulator</a> or vendor data.</p>';
  out+='</div>';
  var x=Math.max(0,Math.min(100,(Math.log10(Math.max(Re,1))/6)*100));
  out+='<div class="ei-rebar" aria-hidden="true"><div class="ei-rb-lam">Laminar<br><small>Re &lt; 10</small></div><div class="ei-rb-tra">Transitional<br><small>10 to 10,000</small></div><div class="ei-rb-tur">Turbulent<br><small>Re &gt; 10,000</small></div><i style="left:'+x+'%"></i></div>';
  out+='<p class="ei-agnote">'+reg[2]+'</p>'+pw;
  out+='<p class="ei-agnote">This impeller: '+esc(it.regime.toLowerCase())+'; '+esc(it.visc.toLowerCase())+'. Re = rho x N x D^2 / mu, with N in rev/s. Regime limits are approximate and depend on impeller and baffling.</p>';
  $('ag-out').innerHTML=out;
}
var _agT=0;
['ag-imp','ag-n','ag-d','ag-rho','ag-mu','ag-v'].forEach(function(id){var e=$(id);if(e)e.addEventListener('input',function(){agCalc();clearTimeout(_agT);_agT=setTimeout(function(){track('agitator_regime_calculated',{impeller:(AG[+$('ag-imp').value]||{}).name});},1200);});});
var AGPRESET={'water':[1000,1],'solvent':[790,0.6],'syrup':[1300,500],'paste':[1200,50000]};
var pre=$('ag-pre');if(pre)pre.addEventListener('change',function(){var p=AGPRESET[this.value];if(p){$('ag-rho').value=p[0];$('ag-mu').value=p[1];agCalc();}});
$('grid-ag').addEventListener('click',function(e){var c=e.target.closest?e.target.closest('.ei-card'):null;if(c)openItem('ag',+c.getAttribute('data-i'));});
renderAg();agCalc();

buildChips('eq');buildChips('in');renderGrid('eq');renderGrid('in');showTab('eq');
function route(){
  var h=decodeURIComponent((location.hash||'').slice(1)).toLowerCase();
  if(!h){return;}
  if(h==='instrumentation'){showTab('in');return;}
  if(h==='labs'){showTab('lab');return;}
  if(h==='agitators'){showTab('ag');return;}
  if(h==='equipment'){showTab('eq');return;}
  var i=EQ.findIndex(function(x){return slug(x.name)===h;});
  if(i>=0){showTab('eq');openItem('eq',i);return;}
  i=IN.findIndex(function(x){return slug(x.name)===h;});
  if(i>=0){showTab('in');openItem('in',i);return;}
  i=AG.findIndex(function(x){return slug(x.name)===h;});
  if(i>=0){showTab('ag');openItem('ag',i);}
}
route();
window.addEventListener('hashchange',route);

})();
