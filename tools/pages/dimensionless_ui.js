/* UI part appended into assets/js/dimensionless-calc.js (inside the IIFE, after C is defined) */
document.querySelectorAll('.dn-calc[data-n]').forEach(function (host) {
  var c = C[host.getAttribute('data-n')]; if (!c) return;
  var v = {};
  host.innerHTML = '<p class="dn-ch">Calculate ' + c.sym + '</p><div class="dn-in">' + c.inp.map(function (i) {
    v[i[0]] = i[3];
    return '<label><span>' + i[1] + (i[2] ? ' <i>' + i[2] + '</i>' : '') + '</span><input type="number" step="any" inputmode="decimal" data-k="' + i[0] + '" value="' + i[3] + '"></label>';
  }).join('') + '</div><div class="dn-out" aria-live="polite"></div>';
  var out = host.querySelector('.dn-out');
  function run() {
    var bad = c.inp.some(function (i) { return !isFinite(v[i[0]]); });
    if (bad) { out.innerHTML = '<p class="dn-msg">Fill in every value.</p>'; return; }
    var neg = c.inp.filter(function (i) { return i[0] === 'e' ? !(v.e >= 0) : i[0] !== 'T' && !(v[i[0]] > 0); });
    if (neg.length) { out.innerHTML = '<p class="dn-msg warn">' + neg.map(function (i) { return i[1]; }).join(', ') + ' must be greater than zero.</p>'; return; }
    if ('T' in v && v.T <= -273.15) { out.innerHTML = '<p class="dn-msg warn">Temperature must be above −273.15 °C.</p>'; return; }
    var x, r;
    try { x = c.f(v); r = c.r(x, v); } catch (e) { x = NaN; }
    if (!isFinite(x) || !r || /(= |≈ |about |is )–|– (kW|m|s|%)/.test(r[0])) { out.innerHTML = '<p class="dn-msg warn">These inputs do not give a valid result. Check for zero or negative values.</p>'; return; }
    out.innerHTML = '<p class="dn-val"><b>' + c.sym + ' = ' + G(x) + '</b></p><p class="dn-msg ' + (r[1] || '') + '">' + r[0] + '</p>';
  }
  host.addEventListener('input', function (e) { var k = e.target.getAttribute('data-k'); if (!k) return; v[k] = e.target.value === '' ? NaN : +e.target.value; run(); });
  run();
});
/* filter and search */
var chips = document.querySelectorAll('.dn-chip'), search = document.querySelector('.dn-search'), cur = 'all';
function apply() {
  var q = (search && search.value || '').trim().toLowerCase(), shown = 0;
  var words = q.split(/\s+/).filter(Boolean).map(function (w) { return new RegExp('(^|[^a-z0-9])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); });
  var exact = q && Array.prototype.some.call(document.querySelectorAll('.dn-card'), function (el) { return el.getAttribute('data-sym') === q; });
  document.querySelectorAll('.dn-card').forEach(function (el) {
    var okS = cur === 'all' || el.getAttribute('data-s') === cur, okQ = exact ? el.getAttribute('data-sym') === q : words.every(function (w) { return w.test(el.getAttribute('data-k')); });
    el.hidden = !(okS && okQ);
    if (!el.hidden) shown++;
  });
  document.querySelectorAll('.dn-sub').forEach(function (h) {
    var s = h.getAttribute('data-s'); h.hidden = !Array.prototype.some.call(document.querySelectorAll('.dn-card[data-s="' + s + '"]'), function (el) { return !el.hidden; });
  });
  var none = document.querySelector('.dn-none'); if (none) none.hidden = shown > 0;
  var tw = document.querySelector('.dn-all'); if (tw) tw.hidden = shown === 0;
  document.querySelectorAll('.dn-all tbody tr').forEach(function (tr) {
    var id = tr.querySelector('a').getAttribute('href').slice(1), card = document.getElementById(id); tr.hidden = card ? card.hidden : false;
  });
}
chips.forEach(function (b) { b.addEventListener('click', function () { cur = b.getAttribute('data-f'); chips.forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); apply(); }); });
if (search) search.addEventListener('input', apply);
/* quiz */
var qz = document.querySelector('.dn-quiz');
if (qz) {
  var Q = JSON.parse(qz.getAttribute('data-quiz')), ans = Q.map(function () { return -1; });
  var draw = function (focusQ) {
    var done = ans.filter(function (a) { return a >= 0; }).length, sc = ans.filter(function (a, i) { return a === Q[i].a; }).length;
    qz.innerHTML = Q.map(function (q, i) {
      return '<div class="dn-qq"><p><b>' + (i + 1) + '. ' + q.q + '</b></p><div class="dn-opts">' + q.o.map(function (o, j) {
        var cls = ans[i] < 0 ? '' : j === q.a ? ' right' : j === ans[i] ? ' wrong' : ' dim';
        return '<button type="button" class="dn-opt' + cls + '" data-q="' + i + '" data-o="' + j + '"' + (ans[i] >= 0 ? ' disabled' : '') + '>' + o + '</button>';
      }).join('') + '</div>' + (ans[i] >= 0 ? '<p class="dn-why">' + (ans[i] === q.a ? 'Correct. ' : 'Not quite. ') + q.w + '</p>' : '') + '</div>';
    }).join('') + '<p class="dn-score">' + (done < Q.length ? 'Answered ' + done + ' of ' + Q.length : 'Score: ' + sc + ' of ' + Q.length + (sc === Q.length ? '. Well done.' : '. Read the sections for the ones you missed.')) + ' <button type="button" class="dn-reset">Start again</button></p>';
    qz.querySelectorAll('.dn-opt').forEach(function (b) { b.addEventListener('click', function () { var i = +b.getAttribute('data-q'); ans[i] = +b.getAttribute('data-o'); draw(i); }); });
    qz.querySelector('.dn-reset').addEventListener('click', function () { ans = Q.map(function () { return -1; }); draw(-1); });
    if (focusQ !== undefined) { var nx = focusQ < 0 ? qz.querySelector('.dn-opt') : (qz.querySelector('.dn-qq:nth-child(' + (focusQ + 2) + ') .dn-opt') || qz.querySelector('.dn-reset')); if (nx) nx.focus({ preventScroll: focusQ >= 0 ? false : true }); }
  };
  draw();
}
