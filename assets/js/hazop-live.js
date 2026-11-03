/* HAZOP live: five stations and a mini worksheet for the "HAZOP made practical" training deck.
   The room decides, then the trainer presses Reveal. Teaching examples only. */
(function () {
  'use strict';
  var F = {}, instant = false, listeners = [];
  function $(h, s) { return h.querySelector(s); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
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
  function opts(arr, sel) { return arr.map(function (x, i) { return '<option value="' + i + '">' + esc(x) + '</option>'; }).join(''); }
  var LI = 'style="margin:6px 0 0;padding-left:1.1em;font-weight:400;color:#C9D4DE"';
  function mark(good) { return 'style="color:' + (good ? '#5FD09A' : '#E8706B') + '"'; }

  /* 1. Pick the guideword */
  var GW = ['No / none', 'Less', 'More', 'Reverse', 'As well as', 'Part of', 'Other than'];
  var S1 = [
    ['Solvent pump is running but no solvent reaches the reactor', 0, 'Nothing of the intended flow happens. Check closed valves, empty day tank, airlock.'],
    ['Solvent arrives at about a third of the intended rate', 1, 'The quantity is lower than intended. Slow charging, partly blocked line or strainer.'],
    ['Solvent flows at twice the intended rate', 2, 'The quantity is higher than intended. Wrong pump, valve fully open, no flow limit.'],
    ['Reactor contents flow back up the charging line to the day tank', 3, 'The direction is opposite. A non-return valve or a pressure difference decides this.'],
    ['Water is found in the solvent line', 4, 'Something extra is present along with the intended material.'],
    ['Only one of the two blend components is charged', 5, 'Only part of the intended composition is present.'],
    ['Methanol is charged instead of toluene', 6, 'A different material replaces the intended one. This is the guideword for wrong material.']
  ];
  F.s1 = function (host) {
    var st = station(host, '<div class="tk-row"><div><label for="s1a">Deviation seen in the node</label><select id="s1a">' + S1.map(function (x, i) { return '<option value="' + i + '">' + esc(x[0]) + '</option>'; }).join('') + '</select></div><div><label for="s1b">Which guideword?</label><select id="s1b"><option value="-1">Choose</option>' + opts(GW) + '</select></div></div>',
      function () {
        var s = S1[+$(host, '#s1a').value], g = +$(host, '#s1b').value;
        if (g < 0) return ['warn', 'Choose a guideword first. The room should argue before you reveal.'];
        if (g === s[1]) return ['ok', 'Yes: <b>' + GW[g] + '</b>. ' + s[2]];
        return ['bad', 'The usual guideword is <b>' + GW[s[1]] + '</b>, not ' + GW[g] + '. ' + s[2]];
      });
  };

  /* 2. Weak or useful row */
  var ROWS = [
    ['Flow, No: pump problem. Consequence: bad. Safeguard: operator is careful. Action: be careful.', true, 'No real cause, no consequence, no safeguard that can be tested, no action with an owner.'],
    ['Temperature, More: cooling valve fails closed. Reactor heats above solvent boiling point and releases vapour. Safeguard: high-temperature alarm, independent trip that stops the feed. Action: test the trip set point.', false, 'Cause, consequence, safeguards and a testable action are all present.'],
    ['Pressure, More: see previous node.', true, 'A cross-reference is not an analysis. Each node needs its own reasoning.'],
    ['Flow, Reverse: no non-return valve on the charging line, so reactor contents can flow back and overfill the day tank. Safeguard: none. Action: fit a non-return valve, update the P&ID (owner: projects).', false, 'It states the cause, the consequence, honestly says there is no safeguard, and gives an action with an owner.'],
    ['Cooling water, Less flow: pump trips. Consequence: temperature rises. Safeguard: operator training.', true, 'The consequence stops short of the hazard, and training alone is a weak safeguard. Say what the temperature reaches and what that causes.'],
    ['Composition, Other than: wrong solvent drum connected (similar labels). Wrong solvent reacts with the reagent. Safeguard: bar-code or label check before charging, second-person verification. Action: separate drum colours by solvent (owner: stores).', false, 'Specific cause, consequence, layered safeguards and an action.']
  ];
  F.s2 = function (host) {
    var picked = {};
    var st = station(host, '<p><b>Click every row that is weak.</b> A good row has a cause, a consequence that reaches the hazard, safeguards that exist, and an action with an owner.</p><div class="tk-choice" id="s2l"></div>', function () {
      var ok = 0, html = '<ul ' + LI + '>';
      ROWS.forEach(function (r, i) { var good = !!picked[i] === r[1]; if (good) ok++; html += '<li ' + mark(good) + '>' + (r[1] ? 'Weak' : 'Useful') + ': <span style="color:#C9D4DE">' + esc(r[2]) + '</span></li>'; });
      return [ok === ROWS.length ? 'ok' : 'warn', 'You scored ' + ok + ' out of ' + ROWS.length + '.' + html + '</ul>'];
    });
    var box = $(host, '#s2l');
    ROWS.forEach(function (r, i) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = r[0]; b.setAttribute('aria-pressed', 'false');
      b.onclick = function () { picked[i] = !picked[i]; b.setAttribute('aria-pressed', picked[i] ? 'true' : 'false'); b.style.borderColor = picked[i] ? '#C9A227' : ''; b.style.background = picked[i] ? 'rgba(201,162,39,.14)' : ''; st.hide(); };
      box.appendChild(b);
    });
  };

  /* 3. Cause, consequence or safeguard */
  var KIND = ['Cause', 'Consequence', 'Safeguard'];
  var S3 = [
    ['Cooling water pump trips', 0],
    ['Reactor temperature rises above the solvent boiling point', 1],
    ['Independent high-temperature trip that stops the feed', 2],
    ['Operator reads the wrong step on the batch sheet', 0],
    ['Flammable vapour released into the building', 1],
    ['Relief valve sized for the cooling failure case', 2],
    ['Level transmitter fails reading low', 0],
    ['Day tank overfills and spills', 1]
  ];
  F.s3 = function (host) {
    var rows = S3.map(function (x, i) { return '<div><label for="s3_' + i + '">' + esc(x[0]) + '</label><select id="s3_' + i + '"><option value="-1">Choose</option>' + opts(KIND) + '</select></div>'; }).join('');
    station(host, '<p><b>Sort each statement.</b> Cause starts the deviation, consequence is what follows, safeguard is something that prevents or reduces it.</p><div class="tk-row">' + rows + '</div>', function () {
      var ok = 0, html = '<ul ' + LI + '>';
      S3.forEach(function (x, i) { var v = +$(host, '#s3_' + i).value, good = v === x[1]; if (good) ok++; html += '<li ' + mark(good) + '>' + esc(x[0]) + ': ' + KIND[x[1]] + '</li>'; });
      return [ok === S3.length ? 'ok' : 'warn', 'You scored ' + ok + ' out of ' + S3.length + '.' + html + '</ul><p style="font-weight:400;margin:8px 0 0">A safeguard must not share the failure with the cause. A high-level alarm on the same transmitter that failed reading low is not independent.</p>'];
    });
  };

  /* 4. Risk matrix */
  var SEV = ['1 Minor', '2 Moderate', '3 Serious', '4 Major', '5 Catastrophic'];
  var LIK = ['1 Rare', '2 Unlikely', '3 Possible', '4 Likely', '5 Frequent'];
  function band(s) { return s <= 4 ? ['Low', 'ok'] : s <= 9 ? ['Medium', 'warn'] : s <= 16 ? ['High', 'bad'] : ['Very high', 'bad']; }
  var S4 = [
    ['Cooling fails on an exothermic reaction, no independent trip', 4, 3, 'A runaway can break the vessel or vent flammable vapour, and cooling failures do happen over a plant life.'],
    ['Wrong drum charged, with a label check and a second-person check', 3, 2, 'The consequence is serious, but two layers make it unlikely.'],
    ['Small hose leak during transfer, inside a bunded area', 2, 3, 'A small contained spill is moderate, and hose leaks are possible.']
  ];
  F.s4 = function (host) {
    station(host, '<div class="tk-row"><div><label for="s4a">Scenario</label><select id="s4a">' + S4.map(function (x, i) { return '<option value="' + i + '">' + esc(x[0]) + '</option>'; }).join('') + '</select></div><div><label for="s4s">Severity</label><select id="s4s">' + opts(SEV) + '</select></div><div><label for="s4l">Likelihood (with the safeguards that exist)</label><select id="s4l">' + opts(LIK) + '</select></div></div><div class="tk-out" id="s4o"></div><div class="tk-bar" id="s4b" aria-hidden="true"><i></i><u style="left:16%"></u><u style="left:36%"></u><u style="left:64%"></u></div><p class="tk-cite" style="margin:4px 0 0">Bands used here: 1 to 4 low, 5 to 9 medium, 10 to 16 high, 17 to 25 very high. Your company matrix decides.</p>',
      function () {
        var sc = S4[+$(host, '#s4a').value], s = +$(host, '#s4s').value + 1, l = +$(host, '#s4l').value + 1, mine = band(s * l), ref = band(sc[1] * sc[2]);
        var same = mine[0] === ref[0];
        return [same ? 'ok' : 'warn', 'Your rank: ' + s * l + ' (' + mine[0] + '). A typical team rank: severity ' + sc[1] + ' x likelihood ' + sc[2] + ' = ' + sc[1] * sc[2] + ' (' + ref[0] + '). ' + sc[3] + (same ? '' : ' Argue the difference: it is usually about what the safeguards really achieve.')];
      });
    function upd() { var s = +$(host, '#s4s').value + 1, l = +$(host, '#s4l').value + 1, b = band(s * l); $(host, '#s4o').innerHTML = '<div><b>' + s * l + '</b><span>severity x likelihood</span></div><div><b>' + b[0] + '</b><span>risk band</span></div>'; var bar = $(host, '#s4b'); bar.firstChild.style.width = (s * l * 4) + '%'; bar.firstChild.style.background = b[1] === 'ok' ? '#5FD09A' : s * l <= 9 ? '#F2A33C' : '#E8706B'; }
    host.addEventListener('input', upd); upd();
  };

  /* 5. Batch step deviations */
  var TD = ['Too early', 'Too late', 'Too long', 'Too short', 'Wrong order', 'Step skipped'];
  var S5 = [
    ['Heating starts before the agitator is running', 4, 'The sequence is wrong. Heating an unstirred batch gives hot spots.'],
    ['The hold time is 2 hours, the step ends after 20 minutes', 3, 'The duration is shorter than intended, so the reaction may not be complete.'],
    ['Sample taken before the reaction is complete', 0, 'The action happens before its condition is met.'],
    ['Quench water added long after the temperature limit was passed', 1, 'The action happens after the point where it was needed.'],
    ['Nitrogen purge not done before the solvent is charged', 5, 'A required step is missed. Ask what interlock or checklist would catch it.'],
    ['Batch left at temperature overnight, sheet says 2 hours', 2, 'The duration is longer than intended. Ask what degrades or builds up with time.']
  ];
  F.s5 = function (host) {
    station(host, '<div class="tk-row"><div><label for="s5a">What happened in the batch</label><select id="s5a">' + S5.map(function (x, i) { return '<option value="' + i + '">' + esc(x[0]) + '</option>'; }).join('') + '</select></div><div><label for="s5b">Which deviation?</label><select id="s5b"><option value="-1">Choose</option>' + opts(TD) + '</select></div></div>',
      function () {
        var s = S5[+$(host, '#s5a').value], g = +$(host, '#s5b').value;
        if (g < 0) return ['warn', 'Choose a deviation first.'];
        if (g === s[1]) return ['ok', 'Yes: <b>' + TD[g] + '</b>. ' + s[2]];
        return ['bad', 'The best fit is <b>' + TD[s[1]] + '</b>, not ' + TD[g] + '. ' + s[2]];
      });
  };

  /* Sim: mini worksheet for a feed line */
  var PAR = ['Flow', 'Pressure', 'Temperature', 'Level', 'Composition'];
  var LIB = {
    '0|0': ['No flow of solvent to the reactor', 'Day tank empty; charging valve closed; pump airlocked or tripped', 'Batch cannot proceed; operator may bypass or add by hand', 'Level indication on day tank; pump run feedback', 'Add a flow-confirm step before the next operation'],
    '1|0': ['Less flow of solvent', 'Strainer partly blocked; pump worn', 'Slow charge; heating step may start with too little solvent', 'Flow totaliser; charge quantity check', 'Add quantity check before heating starts'],
    '2|0': ['More flow of solvent', 'Charging valve fully open; wrong pump speed', 'Overcharge; reactor level too high; vapour pushed to the vent', 'Flow totaliser with cut-off; high level alarm on the reactor', 'Confirm the cut-off setting is tested'],
    '3|0': ['Reverse flow, reactor to day tank', 'Reactor pressure higher than the day tank; no non-return valve', 'Reactor contents contaminate the day tank; overfill and spill', 'Non-return valve (check it exists on the P&ID)', 'Fit or test the non-return valve'],
    '2|1': ['More pressure in the feed line', 'Pump runs against a closed valve', 'Hose or flange leak; flammable release', 'Pump relief or recirculation; pressure gauge', 'Check relief valve set pressure and discharge location'],
    '1|1': ['Less pressure (vacuum) at the pump suction', 'Day tank outlet blocked; vent choked', 'Cavitation; pump seal damage; flow reduced', 'Tank vent; suction pressure gauge', 'Include the tank vent in routine checks'],
    '2|2': ['More temperature of solvent', 'Day tank in direct sun; steam leak into heating coil', 'Vapour pressure rises; vent releases more vapour', 'Tank vent; shade or insulation; temperature indication', 'Check the heating coil isolation'],
    '2|3': ['More level in the day tank', 'Transfer from the drum not stopped', 'Overfill and spill', 'High level alarm; bunded area', 'Confirm the alarm is tested'],
    '4|4': ['Water present along with the solvent', 'Water in the drum; wet transfer hose', 'Water-sensitive reagent reacts and gives off heat or gas', 'Incoming material check; closed, dry hose', 'Add a moisture check for water-sensitive batches'],
    '5|4': ['Only part of the blend is charged', 'One component step skipped or charged short', 'Wrong ratio; reaction rate and heat output differ from design', 'Batch record check; second-person verification', 'Add a quantity confirmation for each component'],
    '6|4': ['Wrong solvent charged', 'Similar drum labels; wrong drum connected', 'Unplanned reaction; wrong boiling point and flash point', 'Label and bar-code check; second-person verification', 'Separate drum colours by solvent']
  };
  F.sim = function (host) {
    var st = station(host, '<p><b>Node:</b> solvent feed line from the day tank through the pump, flow meter and charging valve to the reactor. <b>Design intent:</b> transfer the batch quantity of solvent at a controlled rate.</p><div class="tk-row"><div><label for="sm-g">Guideword</label><select id="sm-g">' + opts(GW) + '</select></div><div><label for="sm-p">Parameter</label><select id="sm-p">' + opts(PAR) + '</select></div></div><div><label for="sm-t">What does the room say? (optional)</label><textarea id="sm-t" rows="2" style="width:100%;font:inherit;background:#0B1622;color:#ECE7D8;border:1px solid #2A4A6A;border-radius:6px;padding:8px" placeholder="Cause, consequence, safeguards"></textarea></div>',
      function () {
        var k = $(host, '#sm-g').value + '|' + $(host, '#sm-p').value, e = LIB[k], g = GW[+$(host, '#sm-g').value], p = PAR[+$(host, '#sm-p').value];
        if (!e) return ['warn', '<b>' + g + ' ' + p + '</b>: no credible deviation in this node. Record it as not applicable with the reason, so the team can see it was considered.'];
        return ['ok', '<b>' + g + ' ' + p + '</b>: ' + e[0] + '<ul ' + LI + '><li>Cause: ' + e[1] + '</li><li>Consequence: ' + e[2] + '</li><li>Safeguards: ' + e[3] + '</li><li>Suggested action: ' + e[4] + '</li></ul><p style="font-weight:400;margin:8px 0 0">One example for teaching. Compare it with the room, then check what is really on your P&amp;ID.</p>'];
      });
  };

  var sw = document.getElementById('live-instant');
  if (sw) sw.addEventListener('change', function () { instant = sw.checked; listeners.forEach(function (f) { f(); }); });
  document.querySelectorAll('[data-fx]').forEach(function (el) { var f = F[el.getAttribute('data-fx')]; if (f) f(el); });
})();
