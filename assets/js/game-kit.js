/* Games: remembers your best score for each game in this browser only, shows it on the Games page,
   and adds "your best / read this / play next" to a game's end screen. Nothing is sent anywhere. */
(function () {
  var KEY = 'pce.games';
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function store(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* storage blocked: play on */ } }
  function raw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function json(k) { try { return JSON.parse(raw(k) || 'null'); } catch (e) { return null; } }
  function mmss(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  // save a finished game; returns { best, isBest, plays }
  function save(id, score, label) {
    var d = load(), g = d[id] || { plays: 0 };
    g.plays += 1; g.last = Date.now();
    var isBest = typeof score === 'number' && (g.best === undefined || score > g.best);
    if (isBest) { g.best = score; g.label = label || String(score); }
    d[id] = g; store(d);
    return { best: g.best, label: g.label, isBest: isBest, plays: g.plays };
  }

  // what we know about each game, including the games that keep their own records
  function best(id) {
    var d = load(), g = d[id];
    if (id === 'tour') { var q = +raw('pt.quizBest'); return q ? 'Plant quiz best: ' + q + ' of 8' : null; }
    if (id === 'runaway') { var st = json('rw.stars') || {}, n = 0; Object.keys(st).forEach(function (k) { n += +st[k] || 0; }); var qz = +json('rw.quiz') || 0;
      return n || qz ? 'Stars: ' + n + ' of 12' + (qz ? ' · Quiz best: ' + qz + ' of 10' : '') : null; }
    if (id === 'wordsearch') { var c = 0; ['unitops', 'heat', 'flow', 'safety', 'equip', 'util', 'dimless'].forEach(function (p) { if (raw('ws-best-' + p)) c++; }); return c ? 'Puzzles solved: ' + c + ' of 7' : null; }
    if (id === 'rally') { var pr = json('pr-v1'), t = null; if (pr && pr.best) Object.keys(pr.best).forEach(function (m) { var x = pr.best[m] && pr.best[m].time; if (x && (t === null || x < t)) t = x; });
      return t ? 'Best run: ' + mmss(t) : null; }
    return g && g.best !== undefined ? 'Your best: ' + g.label : null;
  }

  // add "your best / read / play next" to a game's own end screen
  function finish(id, score, label, mount) {
    var r = save(id, score, label);
    try { if (window.gtag) window.gtag('event', 'game_completed', { game: id, score: score }); } catch (e) { /* ignore */ }
    if (!mount) return r;
    var old = mount.querySelector('.pce-end'); if (old) old.remove();
    var box = document.createElement('div'); box.className = 'pce-end';
    var h = r.isBest ? '<b class="new">New best: ' + r.label + '</b>' : 'This run: ' + (label || score) + ' · Your best: <b>' + r.label + '</b>';
    var a = document.querySelector('#game-after [data-kind="read"]'), n = document.querySelector('#game-after [data-kind="next"]');
    if (a) h += '<br>Read next: <a href="' + a.getAttribute('href') + '">' + a.textContent + '</a>';
    if (n) h += '<br>Play next: <a href="' + n.getAttribute('href') + '">' + n.getAttribute('data-title') + '</a>';
    box.innerHTML = h; mount.appendChild(box);
    paint();
    return r;
  }

  function paint() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-game]'), function (el) {
      var b = best(el.getAttribute('data-game')), slot = el.querySelector('[data-best]');
      if (slot) { slot.hidden = !b; if (b) slot.textContent = '✓ ' + b; }
      el.classList.toggle('played', !!b);
    });
    var ids = [], done = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.game-card[data-game]'), function (el) { ids.push(el.getAttribute('data-game')); });
    ids.forEach(function (i) { if (best(i)) done++; });
    var p = document.getElementById('game-progress');
    if (p && ids.length) p.textContent = done ? 'You have played ' + done + ' of ' + ids.length + ' games on this device.' : '';
    Array.prototype.forEach.call(document.querySelectorAll('.game-path a[data-step]'), function (a) { a.classList.toggle('done', !!best(a.getAttribute('data-step'))); });
  }

  function chips() {
    var bar = document.getElementById('game-chips'); if (!bar) return;
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.game-chip'); if (!btn) return;
      var tag = btn.getAttribute('data-tag');
      Array.prototype.forEach.call(bar.querySelectorAll('.game-chip'), function (c) { c.setAttribute('aria-pressed', c === btn ? 'true' : 'false'); });
      Array.prototype.forEach.call(document.querySelectorAll('.game-card'), function (c) {
        c.hidden = !!tag && (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + tag + ' ') === -1; });
    });
  }

  window.PCEGames = { save: save, best: best, finish: finish, paint: paint };
  function init() { paint(); chips(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('pageshow', paint);
})();
