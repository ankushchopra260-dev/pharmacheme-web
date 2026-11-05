/* Exclusive hub: filter the catalogue by type and search. Works without the sign-in script. */
(function () {
  var grid = document.getElementById('ex-grid'); if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.ex-item'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('#ex-chips .ex-chip'));
  var q = document.getElementById('ex-q'), count = document.getElementById('ex-count'), none = document.getElementById('ex-none');
  var group = 'all';
  function apply() {
    var words = (q.value || '').toLowerCase().split(/\s+/).filter(Boolean), n = 0;
    cards.forEach(function (c) {
      var okG = group === 'all' || c.getAttribute('data-g') === group;
      var hay = (c.getAttribute('data-s') || '') + ' ' + c.textContent.toLowerCase();
      var okQ = words.every(function (w) { return hay.indexOf(w) > -1; });
      var show = okG && okQ; c.hidden = !show; if (show) n++;
    });
    count.textContent = n + (n === 1 ? ' item' : ' items');
    none.hidden = n > 0;
  }
  chips.forEach(function (b) { b.addEventListener('click', function () {
    group = b.getAttribute('data-g'); chips.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    try { history.replaceState(null, '', group === 'all' ? location.pathname : '#' + group); } catch (e) { /* ignore */ }
    apply(); }); });
  q.addEventListener('input', apply);
  var h = (location.hash || '').replace('#', '');
  var hm = { calculators: 'calculators', templates: 'templates', excel: 'excel', apps: 'apps', books: 'books', concepts: 'concepts', articles: 'articles', courses: 'courses', gate: 'gate' };
  if (hm[h]) { var t = chips.filter(function (b) { return b.getAttribute('data-g') === hm[h]; })[0]; if (t) t.click(); else apply(); } else apply();
})();
