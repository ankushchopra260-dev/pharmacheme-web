/* PharmaChemE — Process Safety section: lesson progress, mini quizzes, calculators, full quiz */
(function(){
'use strict';
var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var store = { get: function(k, d){ try { var v = localStorage.getItem('ps.'+k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } },
              set: function(k, v){ try { localStorage.setItem('ps.'+k, JSON.stringify(v)); } catch(e){} } };
var R = 8.314;
function f(v, d){ if (!isFinite(v)) return '—'; return Number(v).toLocaleString('en-IN', { maximumFractionDigits: d === undefined ? 0 : d, minimumFractionDigits: 0 }); }
function fH(h){ if (!isFinite(h) || h <= 0) return '—'; if (h > 24*365) return '> 1 year'; if (h >= 48) return f(h/24, 1)+' days'; if (h >= 1) return f(h, 1)+' h'; return f(h*60, 0)+' min'; }
function num(el){ var v = parseFloat(el.value); return isFinite(v) ? v : NaN; }
function cell(lab, val, cls){ return '<div class="'+(cls || '')+'">'+lab+'<b>'+val+'</b></div>'; }

// ---------- lesson progress ----------
var done = store.get('done', []);
var mark = $('#ps-mark');
if (mark){
  var id = mark.getAttribute('data-lesson'), ok = $('#ps-mark-ok');
  var paint = function(){ var d = done.indexOf(id) !== -1; mark.textContent = d ? '✓ Completed' : 'Mark this lesson as completed'; if (ok) ok.textContent = d ? 'Saved in this browser.' : ''; };
  mark.addEventListener('click', function(){ if (done.indexOf(id) === -1) done.push(id); else done.splice(done.indexOf(id), 1); store.set('done', done); paint(); });
  paint();
}
$$('.ps-lesson[data-id]').forEach(function(a){ if (done.indexOf(a.getAttribute('data-id')) !== -1){ a.classList.add('done'); a.querySelector('.no').textContent = '✓'; } });
var prog = $('#ps-progress');
if (prog){ var n = $$('.ps-lesson[data-id]').length, k = $$('.ps-lesson.done').length, qs = store.get('quiz', null);
  prog.textContent = k+' of '+n+' lessons completed' + (qs !== null ? ' · best quiz score '+qs : ''); }

// ---------- mini quizzes ----------
$$('.ps-mq').forEach(function(box){
  var ans = +box.getAttribute('data-ans'), exp = $('.exp', box);
  $$('button.o', box).forEach(function(b, i){
    b.addEventListener('click', function(){
      $$('button.o', box).forEach(function(x, j){ x.disabled = true; if (j === ans) x.classList.add('right'); else if (j === i) x.classList.add('wrong'); });
      if (exp){ exp.innerHTML = (i === ans ? '✅ <b>Correct.</b> ' : '❌ <b>Not quite.</b> ') + exp.innerHTML; exp.style.display = 'block'; }
    });
  });
});

// ---------- calculators ----------
function stoessel(Tp, MTSR, MTT, TD24){
  if (MTSR < MTT) return MTSR < TD24 ? (MTT < TD24 ? 1 : 2) : 5;
  return MTSR < TD24 ? 3 : (MTT < TD24 ? 4 : 5);
}
var CLS = {
  1: 'Class 1: thermally safe. Even after a cooling failure the batch cannot boil and the decomposition is not triggered.',
  2: 'Class 2: MTSR stays below TD24, but TD24 is below the boiling point. Safe if the mass is not held hot for long; avoid long hold times at MTSR.',
  3: 'Class 3: the batch will boil. Evaporative cooling is the safety barrier, so check that the condenser and vent can take the vapour rate at the boiling point.',
  4: 'Class 4: boiling stops the temperature before TD24, but only if the boiling barrier works. The condenser / emergency relief must be designed for this case.',
  5: 'Class 5: the decomposition can be triggered before boiling can help. Redesign the process (dosing, temperature, concentration) or provide reliable emergency measures such as quench, dump or crash cooling.' };
var TOOLS = {
  mtsr: function(t){
    var g = function(n){ return num($('[name='+n+']', t)); };
    var Q = g('q'), cp = g('cp'), Tp = g('tp'), acc = g('acc')/100, MTT = g('mtt'), TD = g('td24');
    var dT = Q/cp, M = Tp + acc*dT, c = stoessel(Tp, M, MTT, TD);
    var sev = dT > 200 ? ['high', 'bad'] : dT >= 50 ? ['medium', 'warn'] : ['low', 'good'];
    $('.ps-out', t).innerHTML = cell('ΔT<sub>ad</sub>', f(dT)+' K') + cell('Severity (ΔT<sub>ad</sub>)', sev[0], sev[1]) + cell('MTSR', f(M)+' °C', c >= 4 ? 'bad' : c === 3 ? 'warn' : 'good') +
      cell('Margin MTSR → TD24', f(TD - M)+' K', TD - M < 0 ? 'bad' : TD - M < 20 ? 'warn' : 'good') + cell('Stoessel class', '<span class="ps-cls c'+c+'">'+c+'</span>');
    var v = $('.ps-verdict', t); v.className = 'ps-verdict '+(c <= 2 ? 'good' : c === 3 ? 'warn' : 'bad'); v.textContent = CLS[c];
  },
  dosing: function(t){
    var g = function(n){ return num($('[name='+n+']', t)); };
    var Qkg = g('q'), m = g('m'), U = g('u'), A = g('a'), Tr = g('tr'), Tc = g('tc'), margin = g('margin')/100;
    var qex = U*A*(Tr - Tc)/1000, use = qex/(1 + margin), Qtot = Qkg*m, tmin = Qtot/use/3600, qneed = function(h){ return Qtot/(h*3600); };
    $('.ps-out', t).innerHTML = cell('Cooling capacity q<sub>ex</sub>', f(qex, 1)+' kW') + cell('Usable after '+f(margin*100)+' % margin', f(use, 1)+' kW') + cell('Total heat released', f(Qtot/1000, 0)+' MJ') +
      cell('Shortest dosing time', fH(tmin), 'warn') + cell('Heat flow at 2 h dosing', f(qneed(2), 1)+' kW', qneed(2) > use ? 'bad' : 'good');
    var v = $('.ps-verdict', t); v.className = 'ps-verdict '+(Tr <= Tc ? 'bad' : 'good');
    v.innerHTML = Tr <= Tc ? 'The coolant must be colder than the reaction mass.' : 'Dose over at least <b>'+fH(tmin)+'</b> (round up). This assumes the reaction keeps pace with the dosing, i.e. heat release follows the feed. If reagent accumulates, the heat release can peak later and higher. Check with reaction calorimetry.';
  },
  tmr: function(t){
    var g = function(n){ return num($('[name='+n+']', t)); };
    var T0 = g('t0'), q0 = g('q0'), Ea = g('ea')*1000, cp = g('cp')*1000, Tx = g('tx');
    var q = function(T){ return q0*Math.exp(Ea/R*(1/(T0 + 273.15) - 1/(T + 273.15))); };
    var tmr = function(T){ var K = T + 273.15; return cp*R*K*K/(q(T)*Ea)/3600; };
    var lo = -50, hi = 600; for (var i = 0; i < 80; i++){ var mid = (lo + hi)/2; if (tmr(mid) > 24) lo = mid; else hi = mid; }
    var TD24 = (lo + hi)/2, lo8 = -50, hi8 = 600; for (var j = 0; j < 80; j++){ var m8 = (lo8 + hi8)/2; if (tmr(m8) > 8) lo8 = m8; else hi8 = m8; }
    var tx = tmr(Tx);
    $('.ps-out', t).innerHTML = cell('TMR<sub>ad</sub> at '+f(T0)+' °C', fH(tmr(T0))) + cell('T<sub>D24</sub> (TMR = 24 h)', f(TD24)+' °C', 'warn') + cell('T<sub>D8</sub> (TMR = 8 h)', f((lo8 + hi8)/2)+' °C') +
      cell('TMR<sub>ad</sub> at '+f(Tx)+' °C', fH(tx), tx < 8 ? 'bad' : tx < 24 ? 'warn' : 'good') + cell('Heat release at '+f(Tx)+' °C', f(q(Tx), 2)+' W/kg');
    var v = $('.ps-verdict', t), p = tx < 8 ? ['bad', 'High probability: TMRad below 8 h at '+f(Tx)+' °C.'] : tx < 24 ? ['warn', 'Medium probability: TMRad between 8 and 24 h at '+f(Tx)+' °C.'] : ['good', 'Low probability: TMRad above 24 h at '+f(Tx)+' °C.'];
    v.className = 'ps-verdict '+p[0]; v.textContent = p[1]+' Zero-order, adiabatic approximation: a conservative screening estimate. Autocatalytic decompositions need different treatment.';
  },
  checklist: function(t){
    var boxes = $$('input[type=checkbox]', t), on = boxes.filter(function(b){ return b.checked; }), grp = {};
    on.forEach(function(b){ grp[b.getAttribute('data-g')] = (grp[b.getAttribute('data-g')] || 0) + 1; });
    var hi = on.filter(function(b){ return b.getAttribute('data-w') === 'h'; }).length;
    var lvl = hi ? ['bad', 'HIGH-HAZARD PROCESS'] : on.length ? ['warn', 'ELEVATED: assess further'] : ['good', 'No high-hazard flag ticked'];
    $('.ps-out', t).innerHTML = cell('Flags ticked', on.length+' of '+boxes.length) + cell('High-severity flags', hi, hi ? 'bad' : 'good') + cell('Categories hit', Object.keys(grp).length) + cell('Result', lvl[1], lvl[0]);
    var v = $('.ps-verdict', t); v.className = 'ps-verdict '+lvl[0];
    v.innerHTML = hi ? 'Treat as a <b>high-hazard process</b>: full thermal screening (DSC / ARC), reaction calorimetry, a documented Stoessel assessment and a HAZOP before scale-up.' :
      on.length ? 'Some flags need a closer look. At minimum run DSC screening on reaction mixtures and residues, and review the ticked items in the PHA.' : 'Nothing flagged. Still screen new chemistry with DSC: this checklist only catches known warning signs.';
  },
  vapour: function(t){
    var g = function(n){ return num($('[name='+n+']', t)); };
    var W = g('w'), Pset = g('pset'), over = g('over')/100, Tc = g('t'), M = g('m'), k = g('k'), Z = g('z'), Kd = g('kd'), Kb = g('kb'), Kc = g('kc');
    var P1 = (Pset*100)*(1 + over) + 101.325, T = Tc + 273.15;
    var C = 0.03948*Math.sqrt(k*Math.pow(2/(k + 1), (k + 1)/(k - 1)));
    var A = W/(C*Kd*P1*Kb*Kc)*Math.sqrt(T*Z/M), d = Math.sqrt(4*A/Math.PI);
    $('.ps-out', t).innerHTML = cell('Relieving pressure P<sub>1</sub>', f(P1, 0)+' kPa(a)') + cell('Coefficient C', f(C, 4)) + cell('Required area A', f(A, 0)+' mm²', 'warn') + cell('Equivalent diameter', f(d, 1)+' mm');
    $('.ps-verdict', t).className = 'ps-verdict'; $('.ps-verdict', t).textContent = 'Choose the next standard orifice / disc size above '+f(d, 0)+' mm. Critical (choked) flow assumed. Not valid for two-phase (runaway) relief.';
  },
  fire: function(t){
    var g = function(n){ return num($('[name='+n+']', t)); };
    var D = g('d'), h = g('h'), F = g('f'), lam = g('lam'), prompt = $('[name=prompt]', t).value === '1';
    var Aw = Math.PI*D*Math.min(h, 7.6) + 1.084*D*D;   // wetted shell (up to 7.6 m above grade) + 2:1 elliptical bottom head (≈ 1.084 D²)
    var Q = (prompt ? 43200 : 70900)*F*Math.pow(Aw, 0.82), W = Q/1000/lam*3600;
    $('.ps-out', t).innerHTML = cell('Wetted area A<sub>w</sub>', f(Aw, 1)+' m²') + cell('Heat input Q', f(Q/1000, 0)+' kW', 'warn') + cell('Vapour to relieve W', f(W, 0)+' kg/h', 'warn') + cell('Factor F', f(F, 3));
    $('.ps-verdict', t).className = 'ps-verdict'; $('.ps-verdict', t).innerHTML = 'Use W = '+f(W, 0)+' kg/h in the vapour relief calculator above, with 21 % overpressure (fire case).';
  },
  liquid: function(t){
    var g = function(n){ return num($('[name='+n+']', t)); };
    var Q = g('q')*1000/60, G = g('sg'), Pset = g('pset'), over = g('over')/100, Pb = g('pb'), Kd = 0.65;
    var P1 = Pset*100*(1 + over), dP = P1 - Pb*100, A = 11.78*Q/(Kd*1*1*1)*Math.sqrt(G/dP), d = Math.sqrt(4*A/Math.PI);
    $('.ps-out', t).innerHTML = cell('Flow', f(Q, 0)+' L/min') + cell('Differential pressure', f(dP, 0)+' kPa') + cell('Required area A', f(A, 0)+' mm²', 'warn') + cell('Equivalent diameter', f(d, 1)+' mm');
    $('.ps-verdict', t).className = 'ps-verdict'; $('.ps-verdict', t).textContent = 'Liquid service, certified valve (K_d = 0.65), no viscosity or backpressure correction. Thermal expansion of a blocked-in liquid usually needs only a small relief valve.';
  },
  mie: function(t){
    var v = num($('[name=mie]', t)), r = num($('[name=res]', t));
    var lv = v < 1 ? ['bad', 'Extremely sensitive: ignitable like a flammable gas. Inert the equipment (N₂), earth everything, avoid charging powders into flammable vapour.'] :
      v < 10 ? ['bad', 'High sensitivity: brush discharges from charged plastics or insulated powder can ignite it. Earth people and plant, avoid non-conductive liners and FIBCs; consider inerting.'] :
      v < 25 ? ['warn', 'Sensitive: consider electrostatic discharges from the dust cloud and from bulk powder. Earth plant and personnel.'] :
      v < 100 ? ['warn', 'Moderate: earthing of personnel advised in addition to plant earthing.'] :
      v < 500 ? ['good', 'Low-moderate: plant earthing and bonding advised.'] : ['good', 'Low sensitivity to ignition: plant earthing as normal good practice.'];
    var rr = r <= 1e6 ? 'conductive: charge drains away if earthed' : r < 1e12 ? 'static dissipative' : 'highly resistive: holds charge, even on earthed metal';
    $('.ps-out', t).innerHTML = cell('MIE', f(v, 1)+' mJ', lv[0]) + cell('Powder resistivity', r.toExponential(0)+' Ω·m') + cell('Powder behaviour', rr);
    var vv = $('.ps-verdict', t); vv.className = 'ps-verdict '+lv[0]; vv.textContent = lv[1];
  }
};

// ---------- Stoessel "move the temperatures" demo ----------
var CRIT_TXT = {
  1:'Class 1: MTSR stays below the boiling point, and decomposition is far away. Even after a cooling failure nothing dangerous can happen.',
  2:'Class 2: MTSR stays below TD24, but TD24 is below the boiling point. Safe, as long as the batch is not left sitting hot for a long time.',
  3:'Class 3: the batch boils. Boiling (evaporative cooling) is your safety barrier, so the condenser or vent must be able to take all that vapour.',
  4:'Class 4: the batch boils before it reaches TD24, so boiling protects you, but only if the boiling barrier works. If the condenser cannot cope, decomposition follows.',
  5:'Class 5: MTSR is above TD24 and boiling cannot step in first. A cooling failure can trigger the decomposition. Redesign the process.' };
var CRIT_COL = ['', '#4CD97B', '#A6E05A', '#F2C230', '#FF8A3D', '#E5484D'];
function critClass(Tp, MTSR, MTT, TD24){
  if (MTSR < MTT) return MTSR < TD24 ? (MTT < TD24 ? 1 : 2) : 5;
  return MTSR < TD24 ? 3 : (MTT < TD24 ? 4 : 5);
}
function critLadder(svg, o){
  var vals = [o.Tp, o.MTSR, o.MTT, o.TD24];
  var lo = Math.min.apply(null, vals) - 12, hi = Math.max.apply(null, vals) + 14; if (hi - lo < 60) hi = lo + 60;
  var y = function(T){ return 312 - (T - lo)/(hi - lo)*262; };
  var step = (hi - lo) > 160 ? 50 : (hi - lo) > 70 ? 20 : 10, s = '', T, i;
  s += '<rect x="4" y="4" width="192" height="30" rx="15" fill="'+CRIT_COL[o.cls]+'"/><text x="100" y="24.5" text-anchor="middle" font-size="15" font-weight="700" fill="'+(o.cls === 5 ? '#fff' : '#0B1622')+'" font-family="IBM Plex Sans, sans-serif">CLASS '+o.cls+'</text>';
  s += '<line x1="40" y1="'+y(hi)+'" x2="40" y2="'+y(lo)+'" stroke="#42586C" stroke-width="1.5"/>';
  for (T = Math.ceil(lo/step)*step; T <= hi; T += step) s += '<line x1="36" x2="40" y1="'+y(T)+'" y2="'+y(T)+'" stroke="#42586C"/><text x="33" y="'+(y(T)+4)+'" text-anchor="end" font-size="10.5" fill="#8FA6BC" font-family="IBM Plex Mono, monospace">'+T+'</text>';
  s += '<defs><linearGradient id="ps-crit-g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5DA9E9"/><stop offset="1" stop-color="#FF8A3D"/></linearGradient></defs>';
  s += '<rect x="50" y="'+y(o.MTSR)+'" width="16" height="'+Math.max(1, y(o.Tp) - y(o.MTSR))+'" fill="url(#ps-crit-g)" rx="3"/>';
  var m = [{ k:'Tp', v:o.Tp, c:'#5DA9E9' }, { k:'MTSR', v:o.MTSR, c:'#FF8A3D' }, { k:'MTT', v:o.MTT, c:'#3FC7C7' }, { k:'TD24', v:o.TD24, c:'#E5484D' }];
  m.forEach(function(a){ a.y = y(a.v); a.ly = a.y; }); m.sort(function(a, b){ return a.y - b.y; });
  for (i = 1; i < m.length; i++) if (m[i].ly - m[i-1].ly < 26) m[i].ly = m[i-1].ly + 26;
  var L = m.length - 1; if (m[L].ly > 318) m[L].ly = 318;
  for (i = L - 1; i >= 0; i--) if (m[i+1].ly - m[i].ly < 26) m[i].ly = m[i+1].ly - 26;
  m.forEach(function(a){
    var dash = a.k === 'MTT' || a.k === 'TD24' ? ' stroke-dasharray="5 3"' : '';
    s += '<line x1="42" x2="104" y1="'+a.y+'" y2="'+a.y+'" stroke="'+a.c+'" stroke-width="2.5"'+dash+'/><path d="M104 '+a.y+' L112 '+a.ly+'" stroke="'+a.c+'" fill="none"/>';
    s += '<text x="115" y="'+(a.ly - 1)+'" font-size="13" font-weight="700" fill="'+a.c+'" font-family="IBM Plex Sans, sans-serif">'+a.k+'</text><text x="115" y="'+(a.ly + 12)+'" font-size="11.5" fill="#ECE7D8" font-family="IBM Plex Mono, monospace">'+a.v+' °C</text>';
  });
  svg.innerHTML = s;
}
TOOLS.crit = function(t){
  var ins = $$('input[data-k]', t), v = ins.map(function(i){ return +i.value; });
  if (v[1] < v[0]){ v[1] = v[0]; ins[1].value = v[0]; }
  ins.forEach(function(i, k){ $('[data-v="'+k+'"]', t).textContent = v[k]+' °C'; });
  var c = critClass(v[0], v[1], v[2], v[3]);
  critLadder($('svg', t), { Tp:v[0], MTSR:v[1], MTT:v[2], TD24:v[3], cls:c });
  var msg = $('.ps-crit-msg', t); msg.textContent = CRIT_TXT[c]; msg.style.borderLeftColor = CRIT_COL[c];
};
$$('[data-tool]').forEach(function(t){
  var fn = TOOLS[t.getAttribute('data-tool')]; if (!fn) return;
  var run = function(){ try { fn(t); } catch(e){} };
  $$('input, select', t).forEach(function(i){ i.addEventListener('input', run); i.addEventListener('change', run); });
  run();
});

// ---------- full quiz ----------
var qz = $('#ps-quiz');
if (qz){
  var Q = JSON.parse($('#ps-quiz-data').textContent), i = 0, score = 0, order = Q.map(function(_, k){ return k; });
  var show = function(){
    if (i >= order.length){ var best = Math.max(score, store.get('quiz', 0)); store.set('quiz', best);
      qz.innerHTML = '<div class="ps-quiz-bar"><i style="width:100%"></i></div><div class="ps-quiz-score">'+score+' / '+order.length+'</div><p>'+(score >= order.length*0.85 ? 'Excellent: you have the essentials of process safety.' : score >= order.length*0.6 ? 'Good. Revisit the lessons behind the questions you missed.' : 'Work through the lessons, then try again.')+
        '</p><p class="ps-src">Best score in this browser: '+best+' / '+order.length+'</p><div class="ps-done"><button class="btn btn-primary" id="ps-qagain">↺ Try again</button><a class="btn btn-outline" href="../">Back to Process Safety</a></div>';
      $('#ps-qagain').addEventListener('click', function(){ i = 0; score = 0; show(); }); return; }
    var q = Q[order[i]];
    qz.innerHTML = '<div class="ps-src">Question '+(i + 1)+' of '+order.length+' · '+q.topic+' · score '+score+'</div><div class="ps-quiz-bar"><i style="width:'+(i/order.length*100)+'%"></i></div>' +
      '<div class="ps-mq" data-ans="'+q.a+'"><div class="q">'+q.q+'</div><div class="opts">'+q.o.map(function(o, k){ return '<button class="o">'+String.fromCharCode(65 + k)+'. '+o+'</button>'; }).join('')+'</div><div class="exp">'+q.e+'</div></div>' +
      '<div class="ps-done"><button class="btn btn-primary" id="ps-qnext" disabled>Next →</button></div>';
    var box = $('.ps-mq', qz);
    $$('button.o', box).forEach(function(b, k){ b.addEventListener('click', function(){
      if (k === q.a) score++;
      $$('button.o', box).forEach(function(x, j){ x.disabled = true; if (j === q.a) x.classList.add('right'); else if (j === k) x.classList.add('wrong'); });
      var e = $('.exp', box); e.innerHTML = (k === q.a ? '✅ <b>Correct.</b> ' : '❌ <b>Not quite.</b> ') + e.innerHTML; e.style.display = 'block';
      $('#ps-qnext').disabled = false; }); });
    $('#ps-qnext').addEventListener('click', function(){ i++; show(); window.scrollTo({ top: qz.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' }); });
  };
  show();
}
})();
