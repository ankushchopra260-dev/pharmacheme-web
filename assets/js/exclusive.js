/* PharmaChemE exclusive content: Google sign-in, per-item access requests, opening paid items,
   3D concept books, learning paths with saved progress, and the path certificate.
   The paid content is in Firestore (items/{id}). Security rules let a signed-in user read it only when
   access/{their email}.items[{id}] is a future date (or they are an admin). Prices, descriptions and paths are public, in _data/exclusive.yml.
   Progress is in progress/{email}: { items: { id: { done: [page numbers], total, fin: true } }, at }. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

const app = initializeApp({ apiKey: 'AIzaSyAoko-Lgtl23DrJQ5_Dk3bQpdCHX0NvMCc', authDomain: 'pharmacheme-1f559.firebaseapp.com', projectId: 'pharmacheme-1f559', storageBucket: 'pharmacheme-1f559.firebasestorage.app', messagingSenderId: '324335799446', appId: '1:324335799446:web:a7bb53bbc3e4b67c9906b7' });
const auth = getAuth(app), db = getFirestore(app);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const key = e => e.trim().toLowerCase();
const page = document.querySelector('.ex-page'), panel = document.getElementById('ex-panel'), content = document.getElementById('ex-content');
const CAT = (() => { try { return JSON.parse(document.getElementById('ex-cat').textContent); } catch (e) { return { items: [], paths: [] }; } })();
const ITEM = {}; (CAT.items || []).forEach(i => { ITEM[i.id] = i; });
const CONTACT = 'pharmacheme.app@gmail.com';
let user = null, ACC = {}, PROG = {};

function toast(t) { let el = document.getElementById('ex-toast'); if (!el) { el = document.createElement('div'); el.id = 'ex-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => { el.hidden = true; }, 7000); }
async function signIn() {
  const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
  try { await signInWithPopup(auth, p); }
  catch (e) { if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return signInWithRedirect(auth, p);
    if (e && e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') toast('Sign-in did not complete (' + (e.code || e.message) + '). Please try again.'); }
}
export function notify(url, data) { if (!url) return; try { fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) }).catch(() => {}); } catch (e) { /* ignore */ } }
const CFGEL = panel || document.getElementById('ex-hub');
const UPI = { upi: (CFGEL && CFGEL.dataset.upi) || '', name: (CFGEL && CFGEL.dataset.upiName) || 'PharmaChemE' };
async function upiBox(o) { await loadScript('/assets/js/upi-pay.js?v=' + V); return window.PCME_UPI.box(Object.assign({}, UPI, o)); }
const NOTIFY = (panel && panel.dataset.notify) || (document.getElementById('ex-hub') && document.getElementById('ex-hub').dataset.notify) || '';

/* ---------- access and progress ---------- */
const owns = id => { const t = ACC[id]; return !!(t && t.toDate && t.toDate().getTime() > Date.now()); };
const finished = id => !!(PROG[id] && PROG[id].fin);
async function loadMine() {
  ACC = {}; PROG = {};
  if (!user) return;
  try { const a = await getDoc(doc(db, 'access', key(user.email))); if (a.exists()) ACC = a.data().items || {}; } catch (e) { /* not readable */ }
  try { const p = await getDoc(doc(db, 'progress', key(user.email))); if (p.exists()) PROG = p.data().items || {}; } catch (e) { /* none yet */ }
}
async function saveProgress(id, patch) {
  if (!user) return;
  PROG[id] = Object.assign({}, PROG[id] || {}, patch);
  try { await setDoc(doc(db, 'progress', key(user.email)), { items: { [id]: PROG[id] }, at: serverTimestamp() }, { merge: true }); } catch (e) { /* progress is a convenience */ }
  drawPaths();
}
function markFinished(id) { if (!finished(id)) { saveProgress(id, { fin: true }); toast('Marked as finished. Your learning path is updated.'); } }

/* ---------- learning paths ---------- */
const itemUrl = it => '/exclusive/' + it.slug + '/';
function pathState(p) {
  const paid = p.steps.filter(s => s.item && ITEM[s.item]);
  const done = paid.filter(s => owns(s.item) && finished(s.item)).length;
  const missing = paid.filter(s => !owns(s.item)).map(s => ITEM[s.item]);
  return { paid, done, missing, total: missing.reduce((a, it) => a + (+it.price || 0), 0), complete: paid.length > 0 && done === paid.length };
}
function pathHtml(p, focus) {
  const s = pathState(p), pct = s.paid.length ? Math.round(s.done / s.paid.length * 100) : 0;
  const steps = p.steps.map((st, i) => {
    if (st.free) return '<li class="pt-free"><span class="pt-dot" aria-hidden="true">' + (i + 1) + '</span><a href="' + esc(st.free) + '">' + esc(st.title) + '</a><em>free</em></li>';
    const it = ITEM[st.item]; if (!it) return '';
    const own = owns(it.id), fin = own && finished(it.id), here = it.id === focus;
    const pg = PROG[it.id] && PROG[it.id].total ? ' <small>' + (PROG[it.id].done || []).length + '/' + PROG[it.id].total + ' pages</small>' : '';
    return '<li class="' + (fin ? 'pt-done' : own ? 'pt-own' : 'pt-lock') + (here ? ' pt-here' : '') + '"><span class="pt-dot" aria-hidden="true">' + (fin ? '✓' : i + 1) + '</span><a href="' + esc(itemUrl(it)) + '">' + esc(it.title) + '</a>' + (fin ? '<em>finished</em>' : own ? '<em>yours' + pg + '</em>' : '<em class="pt-price">₹' + esc(it.price) + '</em>') + '</li>';
  }).join('');
  const next = p.steps.map(x => x.item && ITEM[x.item]).filter(Boolean).find(it => !(owns(it.id) && finished(it.id)));
  let cta = '';
  if (s.complete) cta = '<a class="ts-btn prim" href="/exclusive/certificate/?path=' + esc(p.id) + '">Get your certificate</a>';
  else if (s.missing.length > 1) cta = '<button type="button" class="ts-btn prim" data-path-req="' + esc(p.id) + '">Buy the rest of this path, ₹' + s.total + '</button>';
  else if (next && next.id !== focus) cta = '<a class="ts-btn" href="' + esc(itemUrl(next)) + '">Next: ' + esc(next.title.split(':')[0]) + '</a>';
  return '<div class="pt"><div class="pt-head"><h3>' + esc(p.title) + '</h3><span class="pt-count">' + (user ? s.done + ' of ' + s.paid.length + ' finished' : s.paid.length + ' paid steps') + '</span></div><p class="pt-blurb">' + esc(p.blurb) + '</p>' +
    '<div class="pt-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Progress"><i style="width:' + pct + '%"></i></div><ol class="pt-steps">' + steps + '</ol>' +
    (cta ? '<div class="pt-cta">' + cta + (s.complete ? '' : '<span class="ts-mute">Finish every paid step to earn the certificate.</span>') + '</div>' : '') + '</div>';
}
function drawPaths() {
  const box = document.getElementById('ex-paths'); if (!box) return;
  const focus = page && page.dataset.item;
  const list = (CAT.paths || []).filter(p => !focus || p.steps.some(s => s.item === focus));
  if (!list.length) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = (focus ? '<h2>Part of a learning path</h2>' : '') + list.map(p => pathHtml(p, focus)).join('');
  box.querySelectorAll('[data-path-req]').forEach(b => { b.onclick = () => requestPath(b.dataset.pathReq, b); });
}
async function requestPath(pid, btn) {
  if (!user) { await signIn(); return; }
  const p = (CAT.paths || []).find(x => x.id === pid); if (!p) return;
  const s = pathState(p); if (!s.missing.length) return;
  btn.disabled = true;
  const rids = s.missing.map(it => key(user.email) + '__' + it.id);
  for (const it of s.missing) {
    try { await setDoc(doc(db, 'requests', key(user.email) + '__' + it.id), { email: user.email, name: user.displayName || '', at: serverTimestamp(), item: it.id, title: it.title, price: '₹' + it.price }); } catch (e) { /* still show payment */ }
  }
  notify(NOTIFY, { email: user.email, name: user.displayName || '', item: 'path-' + pid, title: 'Learning path: ' + p.title + ' (' + s.missing.length + ' items)', price: '₹' + s.total, url: location.href.split('#')[0] });
  const holder = document.createElement('div'); btn.replaceWith(holder);
  holder.appendChild(await upiBox({ amount: s.total, key: 'p' + pid, note: 'PharmaChemE path ' + pid, onPaid: async utr => {
    for (const rid of rids) await setDoc(doc(db, 'requests', rid), { utr, paidAt: serverTimestamp() }, { merge: true });
    notify(NOTIFY, { email: user.email, name: user.displayName || '', item: 'path-' + pid + '|paid', title: 'PAID ₹' + s.total + ', UTR ' + utr + ': learning path ' + p.title, price: '₹' + s.total, url: location.href.split('#')[0] });
    holder.innerHTML = '<div class="ts-paid"><b>Payment received for checking (UTR ' + esc(utr) + ').</b> We will switch on all ' + s.missing.length + ' items for ' + esc(user.email) + ' and email you, usually within a few hours.</div>';
  } }));
}

/* ---------- 3D demos (hub and book pages) ---------- */
const SCRIPTS = {};
function loadScript(src) { if (!SCRIPTS[src]) SCRIPTS[src] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete SCRIPTS[src]; rej(new Error('Could not load ' + src)); }; document.head.appendChild(s); }); return SCRIPTS[src]; }
function loadCss(href) { if (document.querySelector('link[href="' + href + '"]')) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); }
const V = (document.querySelector('meta[name="ex-v"]') || {}).content || '';
async function loadSB() { loadCss('/assets/css/sketchbook.css?v=' + V); await loadScript('/assets/js/sketchbook.js?v=' + V); }
async function demos() {
  const els = document.querySelectorAll('[data-demo]'); if (!els.length) return;
  try { await loadSB(); await loadScript('/assets/js/sketchbook-demos.js?v=' + V); } catch (e) { return; }
  els.forEach(el => {
    const d = window.PCME_SB_DEMOS[el.dataset.demo]; if (!d) return;
    const start = () => window.PCME_SB.demo(el, d.build, d.cam);
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '200px' }); io.observe(el); } else start();
  });
}

/* ---------- hub page ---------- */
async function hub() {
  const mine = document.getElementById('ex-mine'); if (!mine) return;
  if (!user) { mine.hidden = false; mine.innerHTML = 'Bought something already? <button type="button" class="ts-link" id="ex-hub-in">Sign in</button> to see it marked and your path progress.'; document.getElementById('ex-hub-in').onclick = signIn; drawPaths(); return; }
  let n = 0;
  document.querySelectorAll('.ex-card[data-id]').forEach(c => { const own = owns(c.dataset.id); const o = c.querySelector('.ex-owned'); if (o) { o.hidden = !own; o.textContent = finished(c.dataset.id) ? 'Finished' : 'Yours'; } if (own) n++; });
  mine.hidden = false; mine.innerHTML = 'Signed in as <b>' + esc(user.email) + '</b>. ' + (n ? n + (n === 1 ? ' item is' : ' items are') + ' open for you, marked <b>Yours</b>.' : 'Nothing bought yet.') + ' <button type="button" class="ts-link" id="ex-hub-out">Sign out</button>';
  document.getElementById('ex-hub-out').onclick = () => signOut(auth);
  drawPaths();
}

/* ---------- item page ---------- */
const ID = page && page.dataset.item, PRICE = panel && panel.dataset.price, TITLE = panel && panel.dataset.title;
const view = h => { panel.innerHTML = h; };
const who = () => '<div class="ts-who">' + (user.photoURL ? '<img src="' + esc(user.photoURL) + '" alt="" referrerpolicy="no-referrer">' : '') + '<span>Signed in as <b>' + esc(user.email) + '</b></span><button type="button" class="ts-link" id="ex-out">Sign out</button></div>';
const bindWho = () => { const b = document.getElementById('ex-out'); if (b) b.onclick = () => signOut(auth); };
function mailBody() { return 'Hello,\n\nPlease give me access to this PharmaChemE item:\n' + TITLE + ' (' + PRICE + ')\n' + location.href.split('#')[0] + '\n\nGoogle sign-in email: ' + user.email + '\nName: ' + (user.displayName || '') + '\n\nPlease send me the UPI ID for payment.\n\nThank you.'; }
const subject = () => 'Access request: ' + TITLE;
const mailto = () => 'mailto:' + CONTACT + '?subject=' + encodeURIComponent(subject()) + '&body=' + encodeURIComponent(mailBody());
const gmail = () => 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT) + '&su=' + encodeURIComponent(subject()) + '&body=' + encodeURIComponent(mailBody());

async function noAccess() {
  let req = null; const rid = key(user.email) + '__' + ID;
  try { const r = await getDoc(doc(db, 'requests', rid)); if (r.exists()) req = r.data(); } catch (e) { /* ignore */ }
  const amount = parseInt(String(PRICE).replace(/\D/g, ''), 10) || 0;
  if (req && req.utr) {
    const when = req.paidAt && req.paidAt.toDate ? req.paidAt.toDate().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    view(who() + '<div class="ts-paid"><b>Payment sent' + (when ? ' on ' + esc(when) : '') + ' (UTR ' + esc(req.utr) + ').</b> We check it and switch this item on for ' + esc(user.email) + ', usually within a few hours. You will get an email, and it will open on this page.</div><p class="ts-mute">Entered the wrong UTR? <button type="button" class="ts-link" id="ex-reutr">Enter it again</button>. Questions: ' + esc(CONTACT) + '.</p>');
    bindWho(); document.getElementById('ex-reutr').onclick = () => showPay(); return;
  }
  if (req) return showPay();
  view(who() + '<ol class="ts-steps"><li><b>Pay ' + esc(PRICE) + ' by UPI</b> here: scan the QR or tap to open your UPI app.</li><li><b>Enter the UTR</b> (12-digit reference) from your UPI app.</li><li><b>It opens here</b> for ' + esc(user.email) + ' once we see the payment, usually within a few hours. Lifetime access.</li></ol><button type="button" class="ts-btn prim" id="ex-req">Buy now, ' + esc(PRICE) + '</button>');
  bindWho();
  document.getElementById('ex-req').onclick = async e => {
    e.target.disabled = true;
    try { await setDoc(doc(db, 'requests', rid), { email: user.email, name: user.displayName || '', at: serverTimestamp(), item: ID, title: TITLE, price: PRICE }); } catch (er) { /* still show payment */ }
    notify(NOTIFY, { email: user.email, name: user.displayName || '', item: ID, title: TITLE, price: PRICE, url: location.href.split('#')[0] });
    showPay();
  };
  async function showPay() {
    view(who() + '<p class="ts-ok"><b>Pay ' + esc(PRICE) + ' for this item.</b></p><div id="ex-pay"></div>');
    bindWho();
    document.getElementById('ex-pay').appendChild(await upiBox({ amount, key: 'i', note: 'PharmaChemE ' + ID, onPaid: async utr => {
      await setDoc(doc(db, 'requests', rid), { email: user.email, name: user.displayName || '', at: (req && req.at) || serverTimestamp(), item: ID, title: TITLE, price: PRICE, utr, paidAt: serverTimestamp() }, { merge: true });
      notify(NOTIFY, { email: user.email, name: user.displayName || '', item: ID + '|paid', title: 'PAID ' + PRICE + ', UTR ' + utr + ': ' + TITLE, price: PRICE, url: location.href.split('#')[0] });
      noAccess();
    } }));
  }
}

function b64Blob(b64, mime) { const bin = atob(b64), a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type: mime }); }
function save(file) { const u = URL.createObjectURL(b64Blob(file.b64, file.mime)), a = document.createElement('a'); a.href = u; a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 1000); }
const finishBtn = () => '<div class="ex-finish"><button type="button" class="ts-btn' + (finished(ID) ? '' : ' prim') + '" id="ex-fin"' + (finished(ID) ? ' disabled' : '') + '>' + (finished(ID) ? 'Finished ✓' : 'Mark as finished') + '</button><span class="ts-mute">Counts towards your learning path.</span></div>';
function bindFinish() { const b = document.getElementById('ex-fin'); if (b) b.onclick = () => { markFinished(ID); b.disabled = true; b.classList.remove('prim'); b.textContent = 'Finished ✓'; }; }

function makeApi(files) {
  return { esc, toast, hasFile: k => !!files[k], download: k => { if (files[k]) { save(files[k]); markFinished(ID); } },
    report: (spec, btn) => { if (!window.PCME_XL) { toast('The PDF tool is still loading. Please try again.'); return; } if (btn) { btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = 'Preparing…'; }
      spec.link = location.href.split('#')[0]; window.PCME_XL.report(spec).then(() => { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t; } markFinished(ID); }, e => { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t; } toast((e && e.message) || 'PDF failed. Please try again.'); }); } };
}

async function render(it) {
  const files = it.files || {};
  view(who() + '<p class="ts-ok">This item is open for you.</p>' + (Object.keys(files).length && it.type !== 'calculator' && it.type !== 'book' ? Object.entries(files).map(([k, f]) => '<button type="button" class="ts-btn prim ex-dl" data-k="' + esc(k) + '">Download ' + esc(f.name.replace(/^PharmaChemE-/, '')) + '</button>').join(' ') : '<p class="ts-mute">' + (it.type === 'book' ? 'Scroll down to open the book.' : 'Scroll down to read or use it.') + '</p>'));
  bindWho();
  panel.querySelectorAll('.ex-dl').forEach(btn => btn.onclick = () => { save(files[btn.dataset.k]); markFinished(ID); });
  const stamp = '<p class="ex-stamp">Licensed to ' + esc(user.email) + '. Please do not share or copy this content.</p>';
  content.hidden = false;
  const demo = document.querySelector('.ex-demo'); if (demo) demo.hidden = true;
  if (it.type === 'book') {
    content.innerHTML = '<div class="ex-book" id="ex-book"><p class="ts-busy">Opening the book…</p></div>' + stamp;
    try {
      await loadSB();
      const fn = (0, eval)(it.js), pr = PROG[ID] || {};
      fn(document.getElementById('ex-book'), { SB: window.PCME_SB, esc, toast, notesHtml: it.html || '', done: pr.done || [],
        onDone: (i, n, total) => { const d = new Set((PROG[ID] && PROG[ID].done) || []); d.add(i); const patch = { done: [...d].sort((a, b) => a - b), total }; if (d.size >= total) { patch.fin = true; toast('Book finished. Your learning path is updated.'); } saveProgress(ID, patch); } });
      if (!PROG[ID] || !PROG[ID].opened) saveProgress(ID, { opened: true });
    } catch (e) { content.innerHTML = '<p class="ts-note">The book could not open (' + esc(e.message) + '). Please refresh; if it keeps happening, email ' + esc(CONTACT) + '.</p>'; }
  } else if (it.type === 'article' || it.type === 'concept') {
    content.innerHTML = '<div class="article-body ex-body"><div class="ex-tools"><button type="button" class="ts-btn" id="ex-print">Print or save as PDF</button></div>' + it.html + finishBtn() + stamp + '</div>';
    document.getElementById('ex-print').onclick = () => window.print();
    bindFinish();
  } else if (it.type === 'calculator') {
    content.innerHTML = '<div class="ex-calc" id="ex-calc"></div>' + stamp;
    const box = document.getElementById('ex-calc');
    let changes = 0; box.addEventListener('change', () => { if (++changes === 3) markFinished(ID); });
    try { const fn = (0, eval)(it.js); fn(box, makeApi(files)); }
    catch (e) { content.innerHTML = '<p class="ts-note">The calculator could not start (' + esc(e.message) + '). Please refresh; if it keeps happening, email ' + esc(CONTACT) + '.</p>'; }
  } else {
    content.innerHTML = '<div class="ex-files">' + Object.entries(files).map(([k, f]) => '<p><button type="button" class="ts-btn prim ex-dl2" data-k="' + esc(k) + '">Download ' + esc(f.name.replace(/^PharmaChemE-/, '')) + '</button></p>').join('') + '<p class="ts-mute">Opens in Excel, LibreOffice Calc or Google Sheets. Type your values in the yellow cells.</p></div>' + stamp;
    content.querySelectorAll('.ex-dl2').forEach(btn => btn.onclick = () => { save(files[btn.dataset.k]); markFinished(ID); });
  }
}

async function item() {
  if (!user) { content.hidden = true; content.innerHTML = ''; const demo = document.querySelector('.ex-demo'); if (demo) demo.hidden = false; view('<p>Sign in with the Google account you want this item on. Access is given to that email address.</p><button type="button" class="ts-btn prim" id="ex-in">Sign in with Google</button>'); document.getElementById('ex-in').onclick = signIn; drawPaths(); return; }
  view('<p class="ts-busy">Checking your access…</p>');
  drawPaths();
  try { const s = await getDoc(doc(db, 'items', ID)); if (s.exists()) return render(s.data()); view(who() + '<p class="ts-note">You have access, but this item is being updated. Please check again shortly.</p>'); bindWho(); }
  catch (e) { if (e && e.code === 'permission-denied') return noAccess(); view(who() + '<p class="ts-note">We could not check your access (' + esc(e.code || e.message) + '). Please refresh the page.</p>'); bindWho(); }
}

/* ---------- certificate page ---------- */
async function certificate() {
  const box = document.getElementById('ex-cert'); if (!box) return;
  const pid = new URLSearchParams(location.search).get('path'), p = (CAT.paths || []).find(x => x.id === pid);
  if (!p) { box.innerHTML = '<p class="ts-note">This learning path was not found. <a href="/exclusive/">See all paths</a>.</p>'; return; }
  if (!user) { box.innerHTML = '<p>Sign in with the Google account you used for the path.</p><button type="button" class="ts-btn prim" id="ex-cin">Sign in with Google</button>'; document.getElementById('ex-cin').onclick = signIn; return; }
  const s = pathState(p);
  if (!s.complete) { box.innerHTML = '<p class="ts-note">Not yet: ' + s.done + ' of ' + s.paid.length + ' paid steps of <b>' + esc(p.title) + '</b> are finished for ' + esc(user.email) + '.</p><div id="ex-paths"></div>'; drawPathsFor(p); return; }
  const when = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const name = (user.displayName || user.email).replace(/\s+/g, ' ');
  const ref = 'PCME-' + pid.toUpperCase().slice(0, 4) + '-' + Math.abs([...(user.email + pid)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)).toString(36).toUpperCase();
  box.innerHTML = '<div class="cert" id="cert"><div class="cert-in"><p class="cert-brand">PharmaChemE</p><p class="cert-k">Certificate of completion</p><p class="cert-this">This is to certify that</p><p class="cert-name">' + esc(name) + '</p><p class="cert-this">has completed the learning path</p><p class="cert-path">' + esc(p.title) + '</p><ul class="cert-items">' + s.paid.map(x => '<li>' + esc(ITEM[x.item].title) + '</li>').join('') + '</ul><div class="cert-foot"><span>' + esc(when) + '</span><span>Ankush Chopra, PharmaChemE</span><span>Ref. ' + esc(ref) + '</span></div></div></div><p class="cert-tools"><button type="button" class="ts-btn prim" id="cert-print">Print or save as PDF</button> <a class="ts-btn" href="/exclusive/">Back to exclusive content</a></p>';
  document.getElementById('cert-print').onclick = () => window.print();
}
function drawPathsFor(p) { const b = document.getElementById('ex-paths'); if (b) { b.innerHTML = pathHtml(p, null); b.querySelectorAll('[data-path-req]').forEach(x => { x.onclick = () => requestPath(x.dataset.pathReq, x); }); } }

demos();
onAuthStateChanged(auth, async u => { user = u; await loadMine(); if (document.getElementById('ex-cert')) certificate(); else if (page) item(); else hub(); });
