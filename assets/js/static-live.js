/* Static Safety Live: five stations for the "Static and solvent fire safety" training deck (slide "Now you call it"),
   plus two extras. The room decides, then the trainer presses Reveal. */
(function () {
  'use strict';
  var F = {};
  function $(host, sel) { return host.querySelector(sel); }
  function fmt(x, d) { if (!isFinite(x)) return 'n/a'; var a = Math.abs(x); if (a !== 0 && (a < 0.01 || a >= 1e5)) return x.toExponential(1); return x.toFixed(d == null ? (a < 10 ? 2 : a < 100 ? 1 : 0) : d); }
  var instant = false; /* "show answers immediately" switch */
  var listeners = [];

  /* Solvent data. Flammable limits and minimum ignition energy: typical literature values (vol % in air, mJ).
     Antoine constants, log10(P mmHg) = A - B / (C + T degC), for the vapour pressure of the pure liquid. */
  var SOLV = {
    methanol:  { n: 'Methanol',      lfl: 6.0,  ufl: 36,   mie: 0.14, fp: 11,  A: 8.08097, B: 1582.271, C: 239.726, low: false },
    acetone:   { n: 'Acetone',       lfl: 2.5,  ufl: 12.8, mie: 1.15, fp: -20, A: 7.11714, B: 1210.595, C: 229.664, low: false },
    ipa:       { n: 'IPA',           lfl: 2.0,  ufl: 12.7, mie: 0.65, fp: 12,  A: 8.11778, B: 1580.92,  C: 219.61,  low: false },
    etoac:     { n: 'Ethyl acetate', lfl: 2.0,  ufl: 11.5, mie: 0.46, fp: -4,  A: 7.10179, B: 1244.95,  C: 217.88,  low: false },
    toluene:   { n: 'Toluene',       lfl: 1.1,  ufl: 7.1,  mie: 0.24, fp: 4,   A: 6.95464, B: 1344.8,   C: 219.482, low: true },
    hexane:    { n: 'n-Hexane',      lfl: 1.1,  ufl: 7.5,  mie: 0.24, fp: -22, A: 6.87776, B: 1171.53,  C: 224.366, low: true },
    heptane:   { n: 'n-Heptane',     lfl: 1.05, ufl: 6.7,  mie: 0.24, fp: -4,  A: 6.89385, B: 1264.37,  C: 216.636, low: true }
  };
  function opts(filter) { return Object.keys(SOLV).filter(function (k) { return !filter || filter(SOLV[k]); }).map(function (k) { return '<option value="' + k + '">' + SOLV[k].n + '</option>'; }).join(''); }
  function station(host, html, answerFn) {
    host.innerHTML = '<div class="tk-fx">' + html + '<div class="tk-actions" style="margin:10px 0 0"><button type="button" class="tk-btn primary" data-rv>Reveal the answer</button></div><div class="tk-verdict" data-ans hidden role="status"></div></div>';
    var btn = $(host, '[data-rv]'), ans = $(host, '[data-ans]');
    function show() { var r = answerFn(); ans.className = 'tk-verdict ' + r[0]; ans.innerHTML = r[1]; ans.hidden = false; }
    function hide() { if (!instant) ans.hidden = true; else show(); }
    btn.onclick = show;
    host.addEventListener('input', hide); host.addEventListener('change', hide);
    listeners.push(function () { if (instant) show(); else ans.hidden = true; });
    return { hide: hide, show: show };
  }

  /* 1. Spot the ignition sources in a charging bay */
  var BAY = [
    { t: 'Plastic bucket and funnel used to charge toluene', h: true, w: 'Plastics are insulators. They charge up and give brush discharges.' },
    { t: 'Steel drum standing on a wooden pallet, no earth clamp', h: true, w: 'An isolated metal drum stores charge and releases it in one spark.' },
    { t: 'Operator in rubber-soled shoes on a painted floor', h: true, w: 'The person becomes an isolated conductor, up to about 25 mJ.' },
    { t: 'Mobile phone in a shirt pocket', h: true, w: 'Not certified for flammable atmospheres. A fault or a call can ignite vapour.' },
    { t: 'Flange with a PTFE gasket and no bonding jumper in the transfer line', h: true, w: 'PTFE breaks the metal path. The pipe beyond it can be isolated.' },
    { t: 'Steel funnel resting in the drum mouth, not bonded', h: true, w: 'Loose metal parts are isolated conductors, like the float at Barton Solvents.' },
    { t: 'Steel drum with a tested earth clamp fitted before opening', h: false, w: 'This is the control. Bonded and earthed.' },
    { t: 'Flameproof pump with an earthed frame', h: false, w: 'Correct equipment for the zone.' },
    { t: 'Operator in tested ESD shoes on a conductive floor', h: false, w: 'The person can leak charge to earth.' },
    { t: 'Cotton coverall', h: false, w: 'Cotton does not hold charge the way synthetics do.' }
  ];
  F.s1 = function (host) {
    var picked = {};
    var st = station(host, '<p><b>Click every item that is an ignition or static hazard.</b></p><div class="tk-choice" id="s1l"></div>', function () {
      var ok = 0, html = '<ul style="margin:6px 0 0;padding-left:1.1em;font-weight:400;color:#C9D4DE">';
      BAY.forEach(function (b, i) { var pk = !!picked[i], good = pk === b.h; if (good) ok++; html += '<li style="color:' + (good ? '#5FD09A' : '#E8706B') + '">' + (b.h ? 'Hazard' : 'Fine') + ': ' + b.t + '. <span style="color:#C9D4DE">' + b.w + '</span></li>'; });
      return [ok === BAY.length ? 'ok' : 'warn', 'You scored ' + ok + ' out of ' + BAY.length + '.' + html + '</ul>'];
    });
    var box = $(host, '#s1l');
    BAY.forEach(function (b, i) {
      var x = document.createElement('button'); x.type = 'button'; x.textContent = b.t; x.setAttribute('aria-pressed', 'false');
      x.onclick = function () { picked[i] = !picked[i]; x.setAttribute('aria-pressed', picked[i] ? 'true' : 'false'); x.style.borderColor = picked[i] ? '#C9A227' : ''; x.style.background = picked[i] ? 'rgba(201,162,39,.14)' : ''; st.hide(); };
      box.appendChild(x);
    });
  };

  /* 2. Is the headspace flammable? */
  function vol(k, T) { var s = SOLV[k]; return 100 * Math.pow(10, s.A - s.B / (s.C + T)) / 760; }
  F.s2 = function (host) {
    var st = station(host, '<div class="tk-row"><div><label for="s2s">Solvent</label><select id="s2s">' + opts() + '</select></div><div><label for="s2t">Temperature: <span class="tk-val" id="s2tv"></span> &deg;C</label><input type="range" id="s2t" min="-20" max="50" step="1" value="30"></div></div><div class="tk-out" id="s2o"></div><div class="tk-bar" id="s2b" aria-hidden="true"><i></i><u></u><u></u></div>',
      function () {
        var k = $(host, '#s2s').value, T = +$(host, '#s2t').value, s = SOLV[k], v = vol(k, T);
        if (v < s.lfl) return ['ok', 'Too lean. The closed headspace holds about ' + fmt(v) + ' % vapour, below the ' + s.lfl + ' % lower limit. Splashes, mist and heating can still change that.'];
        if (v > s.ufl) return ['warn', 'Too rich to burn: about ' + fmt(v) + ' % is above the ' + s.ufl + ' % upper limit. When you open or empty the vessel, air comes in and the mixture passes through the flammable range.'];
        return ['bad', 'Flammable. About ' + fmt(v) + ' % vapour sits between ' + s.lfl + ' % and ' + s.ufl + ' %. Any spark above ' + s.mie + ' mJ can ignite it.'];
      });
    function upd() {
      var k = $(host, '#s2s').value, T = +$(host, '#s2t').value, s = SOLV[k], v = vol(k, T), max = Math.max(s.ufl * 1.4, v * 1.05, 10);
      $(host, '#s2tv').textContent = T;
      $(host, '#s2o').innerHTML = '<div><b>' + s.fp + ' &deg;C</b><span>flash point</span></div><div><b>' + s.lfl + ' to ' + s.ufl + ' %</b><span>flammable range in air</span></div><div><b>' + s.mie + ' mJ</b><span>min. ignition energy</span></div>';
      var bar = $(host, '#s2b'), us = bar.querySelectorAll('u'); us[0].style.left = (100 * s.lfl / max) + '%'; us[1].style.left = (100 * Math.min(s.ufl, max) / max) + '%';
      bar.firstChild.style.width = Math.min(100, 100 * v / max) + '%'; bar.firstChild.style.background = '#6E8CA8';
    }
    $(host, '#s2s').addEventListener('input', upd); $(host, '#s2t').addEventListener('input', upd); upd();
  };

  /* 3. Spark or no spark? */
  var OBJ = { drum: ['Unearthed steel drum', 100], person: ['Person in non-ESD shoes', 200], funnel: ['Isolated metal funnel', 20] };
  F.s3 = function (host) {
    var st = station(host, '<div class="tk-row"><div><label for="s3o">What is charged</label><select id="s3o"><option value="drum">Unearthed steel drum (100 pF)</option><option value="person">Person in non-ESD shoes (200 pF)</option><option value="funnel">Isolated metal funnel (20 pF)</option></select></div>' +
      '<div><label for="s3s">Solvent vapour</label><select id="s3s">' + opts() + '</select></div>' +
      '<div><label for="s3v">Voltage: <span class="tk-val" id="s3vv"></span> kV</label><input type="range" id="s3v" min="1" max="30" step="0.5" value="8"></div></div><div class="tk-out" id="s3o2"></div>',
      function () { var r = calc(); return r.E >= r.mie ? ['bad', 'Spark ignites the vapour. ' + fmt(r.E) + ' mJ is ' + fmt(r.E / r.mie, 0) + ' times what ' + r.n + ' needs (' + r.mie + ' mJ).'] : ['ok', 'No ignition. ' + fmt(r.E) + ' mJ is below the ' + r.mie + ' mJ ' + r.n + ' needs. Other objects at the same voltage may store more.']; });
    function calc() { var o = OBJ[$(host, '#s3o').value], s = SOLV[$(host, '#s3s').value], V = +$(host, '#s3v').value; return { E: 0.5 * o[1] * 1e-12 * Math.pow(V * 1e3, 2) * 1e3, mie: s.mie, n: s.n.toLowerCase(), C: o[1], V: V }; }
    function upd() { var r = calc(); $(host, '#s3vv').textContent = r.V; $(host, '#s3o2').innerHTML = '<div><b>' + fmt(r.E) + ' mJ</b><span>stored energy &frac12; C V&sup2;</span></div><div><b>' + r.mie + ' mJ</b><span>needed for ' + r.n + '</span></div>'; }
    ['#s3o', '#s3s', '#s3v'].forEach(function (q) { $(host, q).addEventListener('input', upd); }); upd();
  };

  /* 4. Safe to fill? */
  F.s4 = function (host) {
    var st = station(host, '<div class="tk-row"><div><label for="s4s">Solvent</label><select id="s4s">' + opts() + '</select></div><div><label for="s4v">Speed in the filling pipe: <span class="tk-val" id="s4vv"></span> m/s</label><input type="range" id="s4v" min="0.5" max="7" step="0.5" value="2"></div></div>' +
      '<div class="tk-row"><div><label for="s4d">Filling pipe</label><select id="s4d"><option value="dip">Dip pipe to the bottom</option><option value="top">Top nozzle, free fall</option></select></div><div><label for="s4e">Earthing</label><select id="s4e"><option value="y">Drum or tank and hose bonded and earthed</option><option value="n">Not earthed</option></select></div><div><label for="s4i">Vessel headspace</label><select id="s4i"><option value="n">Air</option><option value="y">Inerted, oxygen proven below 8 %</option></select></div><div><label for="s4p">Start of the fill</label><select id="s4p"><option value="s">Outlet still above the liquid</option><option value="c">Outlet covered by liquid</option></select></div></div>',
      function () {
        var s = SOLV[$(host, '#s4s').value], v = +$(host, '#s4v').value, bad = [], note = [];
        if ($(host, '#s4e').value === 'n') bad.push('not earthed: charge cannot leak away');
        if ($(host, '#s4d').value === 'top') bad.push('splash filling makes charge and mist');
        if (s.low && v > 1 && $(host, '#s4p').value === 's') bad.push('above 1 m/s before the outlet is covered');
        if (s.low && v > 7) bad.push('faster than the usual 7 m/s limit');
        if (s.low && $(host, '#s4i').value === 'n') note.push('A low-conductivity solvent in a vessel with air is still a risk even if the other points are right. Inert it, and wait before dipping or sampling.');
        if (bad.length) return ['bad', 'Unsafe: ' + bad.join('; ') + '.'];
        if (note.length) return ['warn', 'Partly safe. ' + note.join(' ')];
        return ['ok', 'Safe to fill on these settings. Keep checking the oxygen and the earth clamp during the transfer.'];
      });
    function upd() { $(host, '#s4vv').textContent = $(host, '#s4v').value; }
    host.addEventListener('input', upd); upd();
  };

  /* 5. How many purges? */
  F.s5 = function (host) {
    var st = station(host, '<div class="tk-row"><div><label for="s5p">Nitrogen pressure: <span class="tk-val" id="s5pv"></span> barg</label><input type="range" id="s5p" min="0.5" max="6" step="0.5" value="2"></div><div><label for="s5n">Purge cycles: <span class="tk-val" id="s5nv"></span></label><input type="range" id="s5n" min="1" max="6" step="1" value="2"></div></div><div class="tk-out" id="s5o"></div><div class="tk-bar" id="s5b" aria-hidden="true"><i></i><u style="left:47.6%"></u><u style="left:38%"></u></div><p class="tk-cite" style="margin:4px 0 0">Markers: target 8 %, limiting oxygen concentration about 10 %. Scale 0 to 21 %.</p>',
      function () { var o = calc(); if (o <= 8) return ['ok', 'Oxygen about ' + fmt(o) + ' %. At or below the 8 % target. Prove it with an analyser.']; if (o < 10) return ['warn', 'Oxygen about ' + fmt(o) + ' %. Under the 10 % limit but no margin. Add a cycle.']; return ['bad', 'Oxygen about ' + fmt(o) + ' %. Not inerted. Most solvent vapours can still burn.']; });
    function calc() { var P = +$(host, '#s5p').value, n = +$(host, '#s5n').value; return 21 * Math.pow(1.01325 / (1.01325 + P), n); }
    function upd() {
      var P = +$(host, '#s5p').value, n = +$(host, '#s5n').value, o = calc(); $(host, '#s5pv').textContent = P; $(host, '#s5nv').textContent = n;
      $(host, '#s5o').innerHTML = '<div><b>' + fmt(o) + ' %</b><span>oxygen after ' + n + ' pressure purge' + (n > 1 ? 's' : '') + '</span></div><div><b>' + fmt(21 * 1.01325 / (1.01325 + P) / 21, 2) + '</b><span>fraction left per cycle</span></div><div><b>' + fmt(n * 2 * P * 0 + n, 0) + ' &times; vessel volume</b><span>nitrogen per cycle is about P &times; volume</span></div>';
      var b = $(host, '#s5b'); b.firstChild.style.width = Math.min(100, o / 21 * 100) + '%'; b.firstChild.style.background = o <= 8 ? '#5FD09A' : o < 10 ? '#F2A33C' : '#E8706B';
    }
    host.addEventListener('input', upd); upd();
  };

  /* Extra A: watch the charge build */
  F.sim = function (host) {
    host.innerHTML =
      '<div class="tk-fx"><div class="tk-sim"><svg viewBox="0 0 240 250" role="img" aria-label="A tank being filled through a pipe. Plus signs show charge building up." id="si-svg">' +
      '<rect x="55" y="50" width="130" height="150" rx="6" fill="#0B1622" stroke="#93A9BD" stroke-width="3"/>' +
      '<rect id="si-liq" x="58" y="197" width="124" height="0" fill="#2A62A8" opacity=".75"/>' +
      '<path d="M10 28 H90 V110" fill="none" stroke="#93A9BD" stroke-width="7"/>' +
      '<g id="si-ch" fill="#F2A33C" font-size="16" font-weight="700"></g>' +
      '<g id="si-gnd" stroke="#5FD09A" stroke-width="3"><line x1="120" y1="200" x2="120" y2="222"/><line x1="100" y1="222" x2="140" y2="222"/><line x1="108" y1="230" x2="132" y2="230"/><line x1="116" y1="238" x2="124" y2="238"/></g>' +
      '<g id="si-iso" stroke="#E8706B" stroke-width="3" display="none"><line x1="75" y1="212" x2="165" y2="212"/><line x1="75" y1="218" x2="165" y2="218"/></g>' +
      '<polygon id="si-bang" display="none" points="120,10 130,32 154,28 138,46 156,62 130,58 120,80 110,58 84,62 102,46 86,28 110,32" fill="#FFD23F" stroke="#E8706B" stroke-width="2"/></svg>' +
      '<div><div class="tk-row">' +
      '<div><label for="si-v">Speed in the pipe: <span class="tk-val" id="si-vv"></span> m/s</label><input type="range" id="si-v" min="0.5" max="8" step="0.5" value="2"></div>' +
      '<div><label for="si-l">Liquid</label><select id="si-l"><option value="low">Toluene, hexane (low conductivity)</option><option value="med">In between</option><option value="high">Acetone, methanol (conductive)</option></select></div>' +
      '<div><label for="si-t">Tank</label><select id="si-t"><option value="gnd">Metal tank, grounded</option><option value="iso">Metal tank, not grounded</option><option value="pla">Plastic tank</option></select></div></div>' +
      '<div class="tk-bar" aria-hidden="true"><i id="si-bar"></i><u style="left:83.3%"></u><em style="left:0">charge level</em></div>' +
      '<div class="tk-actions" style="margin:8px 0"><button type="button" class="tk-btn primary" id="si-go">Fill the tank</button><button type="button" class="tk-btn" id="si-rs">Reset</button></div>' +
      '<div class="tk-verdict" id="si-vd" role="status">Choose the settings, then fill the tank. The marker on the bar is the level at which a spark can ignite the vapour.</div></div></div>' +
      '<p class="tk-cite" style="margin:8px 0 0">Teaching model: charge is made in proportion to speed squared and leaks away with a time that depends on the liquid and on earthing. It shows the pattern, it is not a design tool.</p></div>';
    var tauLiq = { low: 18, med: 0.05, high: 0.0002 }, CRIT = 300, FILL = 900, DT = 7.5, timer = null, t = 0, q = 0, peak = 0;
    var sv = $(host, '#si-v'), sl = $(host, '#si-l'), st = $(host, '#si-t'), go = $(host, '#si-go'), rs = $(host, '#si-rs'), vd = $(host, '#si-vd');
    function tauEff() { return st.value === 'gnd' ? tauLiq[sl.value] : 3000; }
    function draw() {
      var lvl = Math.min(1, t / FILL); $(host, '#si-liq').setAttribute('y', 197 - 144 * lvl); $(host, '#si-liq').setAttribute('height', 144 * lvl);
      var r = q / CRIT, bar = $(host, '#si-bar'); bar.style.width = Math.min(100, r * 83.3) + '%'; bar.style.background = r >= 1 ? '#E8706B' : r > 0.6 ? '#F2A33C' : '#5FD09A';
      var n = Math.min(12, Math.round(12 * Math.min(1, r))), g = $(host, '#si-ch'), s = '';
      for (var i = 0; i < n; i++) s += '<text x="' + (68 + (i % 4) * 28) + '" y="' + (180 - Math.floor(i / 4) * 30) + '">+</text>';
      g.innerHTML = s;
    }
    function setup() { $(host, '#si-vv').textContent = sv.value; $(host, '#si-gnd').setAttribute('display', st.value === 'gnd' ? '' : 'none'); $(host, '#si-iso').setAttribute('display', st.value === 'gnd' ? 'none' : ''); }
    function reset() { clearInterval(timer); timer = null; t = 0; q = 0; peak = 0; $(host, '#si-bang').setAttribute('display', 'none'); vd.className = 'tk-verdict'; vd.textContent = 'Choose the settings, then fill the tank. The marker on the bar is the level at which a spark can ignite the vapour.'; go.disabled = false; setup(); draw(); }
    function step() {
      var v = +sv.value, tau = tauEff(); t += DT; var gen = v * v, k = Math.exp(-DT / tau);
      q = q * k + gen * tau * (1 - k); peak = Math.max(peak, q); draw();
      if (q >= CRIT) {
        clearInterval(timer); timer = null; $(host, '#si-bang').setAttribute('display', ''); go.disabled = true; vd.className = 'tk-verdict bad';
        vd.textContent = (st.value === 'gnd' ? 'The charge held in the liquid reached the ignition level. Grounding the tank does not remove it: the liquid needs time, or a lower speed.' : 'A discharge. The tank cannot leak the charge, so it climbs until it sparks. Earth and bond every metal part.');
      } else if (t >= FILL) {
        clearInterval(timer); timer = null; go.disabled = true; vd.className = 'tk-verdict ' + (peak / CRIT > 0.6 ? 'warn' : 'ok');
        vd.textContent = 'Filled without reaching the ignition level. Peak was ' + Math.round(100 * peak / CRIT) + ' % of the limit' + (peak / CRIT > 0.6 ? ', which is little margin. Try a faster fill to see the limit.' : '.');
      }
    }
    go.onclick = function () { reset(); go.disabled = true; timer = setInterval(step, 100); };
    rs.onclick = reset; sv.oninput = function () { setup(); }; sl.onchange = st.onchange = reset;
    reset();
  };

  /* Extra B: relaxation time and filling speed */
  F.fill = function (host) {
    host.innerHTML =
      '<div class="tk-fx"><div class="tk-row">' +
      '<div><label for="fl-q">Transfer rate, m&sup3;/h</label><input type="number" id="fl-q" min="0.1" step="0.5" value="12"></div>' +
      '<div><label for="fl-d">Pipe inside diameter, mm</label><input type="number" id="fl-d" min="10" step="1" value="50"></div>' +
      '<div><label for="fl-l">Liquid</label><select id="fl-l"><option value="low">Low conductivity (toluene, hexane, naphtha)</option><option value="med">In between</option><option value="high">Conductive (acetone, alcohols)</option></select></div>' +
      '<div><label for="fl-s">Conductivity, pS/m</label><input type="number" id="fl-s" min="0.01" step="any" value="1"></div>' +
      '<div><label for="fl-e">Relative permittivity</label><input type="number" id="fl-e" min="1" step="0.1" value="2.4"></div></div>' +
      '<div class="tk-out" id="fl-o"></div><div class="tk-verdict" id="fl-vd"></div>' +
      '<p class="tk-cite" style="margin:8px 0 0">Common guidance for low-conductivity liquids: keep v&sup2;d at or below 0.64 m&sup3;/s&sup2; (d in metres), speed at or below 7 m/s, and about 1 m/s until the filling pipe outlet is covered. Relaxation time &tau; = &epsilon;<sub>0</sub>&epsilon;<sub>r</sub> / &sigma;. Hold the liquid for 2 to 3 times &tau; before it reaches the tank. Confirm the limits against your own standard.</p></div>';
    var q = $(host, '#fl-q'), d = $(host, '#fl-d'), l = $(host, '#fl-l'), s = $(host, '#fl-s'), e = $(host, '#fl-e');
    var pre = { low: [1, 2.4], med: [1000, 5], high: [1e6, 20] };
    function calc() {
      var Q = +q.value / 3600, D = +d.value / 1000, A = Math.PI * D * D / 4, v = Q / A, v2d = v * v * D;
      var sig = +s.value, er = +e.value, tau = 8.854e-12 * er / (sig * 1e-12), hold = 3 * tau, vol = Q * hold, len = vol / A, low = sig < 50;
      $(host, '#fl-o').innerHTML = '<div><b>' + fmt(v) + ' m/s</b><span>speed in the pipe</span></div><div><b>' + fmt(v2d) + '</b><span>v&sup2;d, m&sup3;/s&sup2;</span></div><div><b>' + fmt(tau) + ' s</b><span>relaxation time &tau;</span></div><div><b>' + fmt(len, 1) + ' m</b><span>pipe of this size to hold 3&tau;</span></div>';
      var vd = $(host, '#fl-vd');
      if (!(v > 0)) { vd.className = 'tk-verdict'; vd.textContent = 'Enter a flow and a pipe size.'; return; }
      if (low) {
        if (v > 7 || v2d > 0.64) { vd.className = 'tk-verdict bad'; vd.textContent = 'Too fast for a low-conductivity liquid. Use a larger pipe or a lower rate. Hold the liquid about ' + fmt(hold, 0) + ' s after any filter.'; }
        else if (v > 1) { vd.className = 'tk-verdict warn'; vd.textContent = 'Within the usual limits, but keep to about 1 m/s until the filling pipe outlet is under the liquid, and allow about ' + fmt(hold, 0) + ' s after any filter.'; }
        else { vd.className = 'tk-verdict ok'; vd.textContent = 'Within the usual limits. Still use a dip pipe and hold about ' + fmt(hold, 0) + ' s after any filter.'; }
      } else { vd.className = 'tk-verdict ok'; vd.textContent = 'The liquid loses its charge in a fraction of a second, so speed is not the main limit. The container and every metal part must still be bonded and grounded, because the charge then goes to earth instead of the tank.'; }
    }
    l.onchange = function () { s.value = pre[l.value][0]; e.value = pre[l.value][1]; calc(); };
    [q, d, s, e].forEach(function (x) { x.oninput = calc; });
    calc();
  };

  var sw = document.getElementById('live-instant');
  if (sw) sw.addEventListener('change', function () { instant = sw.checked; listeners.forEach(function (f) { f(); }); });
  document.querySelectorAll('[data-fx]').forEach(function (el) { var f = F[el.getAttribute('data-fx')]; if (f) f(el); });
})();
