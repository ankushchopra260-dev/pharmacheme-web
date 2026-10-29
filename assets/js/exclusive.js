/* PharmaChemE exclusive content: Google sign-in, per-item access requests and opening paid items.
   The paid content is in Firestore (items/{id}). Security rules let a signed-in user read it only when
   access/{their email}.items[{id}] is a future date (or they are an admin). Prices and descriptions are public, in _data/exclusive.yml. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

const app = initializeApp({ apiKey: 'AIzaSyAoko-Lgtl23DrJQ5_Dk3bQpdCHX0NvMCc', authDomain: 'pharmacheme-1f559.firebaseapp.com', projectId: 'pharmacheme-1f559', storageBucket: 'pharmacheme-1f559.firebasestorage.app', messagingSenderId: '324335799446', appId: '1:324335799446:web:a7bb53bbc3e4b67c9906b7' });
const auth = getAuth(app), db = getFirestore(app);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const key = e => e.trim().toLowerCase();
const page = document.querySelector('.ex-page'), panel = document.getElementById('ex-panel'), content = document.getElementById('ex-content');
let user = null;

function toast(t) { let el = document.getElementById('ex-toast'); if (!el) { el = document.createElement('div'); el.id = 'ex-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => { el.hidden = true; }, 7000); }
async function signIn() {
  const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
  try { await signInWithPopup(auth, p); }
  catch (e) { if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return signInWithRedirect(auth, p);
    if (e && e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') toast('Sign-in did not complete (' + (e.code || e.message) + '). Please try again.'); }
}
export function notify(url, data) { if (!url) return; try { fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) }).catch(() => {}); } catch (e) { /* ignore */ } }

/* ---------------- hub page: mark what the signed-in user already has ---------------- */
async function hub() {
  const mine = document.getElementById('ex-mine'); if (!mine) return;
  if (!user) { mine.hidden = false; mine.innerHTML = 'Bought something already? <button type="button" class="ts-link" id="ex-hub-in">Sign in</button> to see it marked here.'; document.getElementById('ex-hub-in').onclick = signIn; return; }
  let items = {};
  try { const a = await getDoc(doc(db, 'access', key(user.email))); if (a.exists()) items = a.data().items || {}; } catch (e) { /* not readable */ }
  const now = Date.now(); let n = 0;
  document.querySelectorAll('.ex-card[data-id]').forEach(c => { const t = items[c.dataset.id]; const own = t && t.toDate && t.toDate().getTime() > now; c.querySelector('.ex-owned').hidden = !own; if (own) n++; });
  mine.hidden = false; mine.innerHTML = 'Signed in as <b>' + esc(user.email) + '</b>. ' + (n ? n + (n === 1 ? ' item is' : ' items are') + ' open for you, marked <b>Yours</b>.' : 'Nothing bought yet.') + ' <button type="button" class="ts-link" id="ex-hub-out">Sign out</button>';
  document.getElementById('ex-hub-out').onclick = () => signOut(auth);
}

/* ---------------- item page ---------------- */
const ID = page && page.dataset.item, CONTACT = panel && panel.dataset.contact, PRICE = panel && panel.dataset.price, TITLE = panel && panel.dataset.title, NOTIFY = panel && panel.dataset.notify;
const view = h => { panel.innerHTML = h; };
const who = () => '<div class="ts-who">' + (user.photoURL ? '<img src="' + esc(user.photoURL) + '" alt="" referrerpolicy="no-referrer">' : '') + '<span>Signed in as <b>' + esc(user.email) + '</b></span><button type="button" class="ts-link" id="ex-out">Sign out</button></div>';
const bindWho = () => { const b = document.getElementById('ex-out'); if (b) b.onclick = () => signOut(auth); };
function mailBody() { return 'Hello,\n\nPlease give me access to this PharmaChemE item:\n' + TITLE + ' (' + PRICE + ')\n' + location.href.split('#')[0] + '\n\nGoogle sign-in email: ' + user.email + '\nName: ' + (user.displayName || '') + '\n\nPlease send me the UPI ID for payment.\n\nThank you.'; }
const subject = () => 'Access request: ' + TITLE;
const mailto = () => 'mailto:' + CONTACT + '?subject=' + encodeURIComponent(subject()) + '&body=' + encodeURIComponent(mailBody());
const gmail = () => 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT) + '&su=' + encodeURIComponent(subject()) + '&body=' + encodeURIComponent(mailBody());

async function noAccess() {
  let req = null;
  try { const r = await getDoc(doc(db, 'requests', key(user.email) + '__' + ID)); if (r.exists()) req = r.data(); } catch (e) { /* ignore */ }
  const when = req && req.at && req.at.toDate ? req.at.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  view(who() + (req ? '<div class="ts-step done"><b>Request sent' + (when ? ' on ' + esc(when) : '') + '.</b> We will email ' + esc(user.email) + ' with the UPI ID for ' + esc(PRICE) + '. After you pay, reply with the UPI transaction reference and this item opens here.</div><p class="ts-mute">No reply yet? <a href="' + esc(gmail()) + '" target="_blank" rel="noopener">Send it with Gmail</a>, <a href="' + esc(mailto()) + '">use your mail app</a>, or write to ' + esc(CONTACT) + '.</p>'
    : '<ol class="ts-steps"><li><b>Request access.</b> This records your request and opens an email to us with the details filled in. Send it.</li><li><b>Pay ' + esc(PRICE) + ' by UPI.</b> We reply with our UPI ID; send back the transaction reference.</li><li><b>Open it here.</b> We switch it on for ' + esc(user.email) + ', usually within a day.</li></ol><button type="button" class="ts-btn prim" id="ex-req">Request access</button>'));
  bindWho();
  const b = document.getElementById('ex-req');
  if (b) b.onclick = async () => {
    b.disabled = true;
    const data = { email: user.email, name: user.displayName || '', at: serverTimestamp(), item: ID, title: TITLE, price: PRICE };
    try { await setDoc(doc(db, 'requests', key(user.email) + '__' + ID), data); } catch (e) { /* still send the email */ }
    notify(NOTIFY, { email: user.email, name: user.displayName || '', item: ID, title: TITLE, price: PRICE, url: location.href.split('#')[0] });
    location.href = mailto();
    setTimeout(noAccess, 900);
  };
}

function b64Blob(b64, mime) { const bin = atob(b64), a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type: mime }); }
function save(file) { const u = URL.createObjectURL(b64Blob(file.b64, file.mime)), a = document.createElement('a'); a.href = u; a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 1000); }

function render(it) {
  const files = it.files || {};
  view(who() + '<p class="ts-ok">This item is open for you.</p>' + (Object.keys(files).length && it.type !== 'calculator' ? Object.entries(files).map(([k, f]) => '<button type="button" class="ts-btn prim ex-dl" data-k="' + esc(k) + '">Download ' + esc(f.name.replace(/^PharmaChemE-/, '')) + '</button>').join(' ') : '<p class="ts-mute">Scroll down to read or use it.</p>'));
  bindWho();
  panel.querySelectorAll('.ex-dl').forEach(btn => btn.onclick = () => save(files[btn.dataset.k]));
  const stamp = '<p class="ex-stamp">Licensed to ' + esc(user.email) + '. Please do not share or copy this content.</p>';
  content.hidden = false;
  if (it.type === 'article' || it.type === 'concept') {
    content.innerHTML = '<div class="article-body ex-body"><div class="ex-tools"><button type="button" class="ts-btn" id="ex-print">Print or save as PDF</button></div>' + it.html + stamp + '</div>';
    document.getElementById('ex-print').onclick = () => window.print();
  } else if (it.type === 'calculator') {
    content.innerHTML = '<div class="ex-calc" id="ex-calc"></div>' + stamp;
    const api = { esc, toast, hasFile: k => !!files[k], download: k => files[k] && save(files[k]),
      report: (spec, btn) => { if (!window.PCME_XL) { toast('The PDF tool is still loading. Please try again.'); return; } if (btn) { btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = 'Preparing…'; }
        spec.link = location.href.split('#')[0]; window.PCME_XL.report(spec).then(() => { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t; } }, e => { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t; } toast((e && e.message) || 'PDF failed. Please try again.'); }); } };
    try { const fn = (0, eval)(it.js); fn(document.getElementById('ex-calc'), api); }
    catch (e) { content.innerHTML = '<p class="ts-note">The calculator could not start (' + esc(e.message) + '). Please refresh; if it keeps happening, email ' + esc(CONTACT) + '.</p>'; }
  } else {
    content.innerHTML = '<div class="ex-files">' + Object.entries(files).map(([k, f]) => '<p><button type="button" class="ts-btn prim ex-dl2" data-k="' + esc(k) + '">Download ' + esc(f.name.replace(/^PharmaChemE-/, '')) + '</button></p>').join('') + '<p class="ts-mute">Opens in Excel, LibreOffice Calc or Google Sheets. Type your values in the yellow cells.</p></div>' + stamp;
    content.querySelectorAll('.ex-dl2').forEach(btn => btn.onclick = () => save(files[btn.dataset.k]));
  }
}

async function item() {
  if (!user) { content.hidden = true; content.innerHTML = ''; view('<p>Sign in with the Google account you want this item on. Access is given to that email address.</p><button type="button" class="ts-btn prim" id="ex-in">Sign in with Google</button>'); document.getElementById('ex-in').onclick = signIn; return; }
  view('<p class="ts-busy">Checking your access…</p>');
  try { const s = await getDoc(doc(db, 'items', ID)); if (s.exists()) return render(s.data()); view(who() + '<p class="ts-note">You have access, but this item is being updated. Please check again shortly.</p>'); bindWho(); }
  catch (e) { if (e && e.code === 'permission-denied') return noAccess(); view(who() + '<p class="ts-note">We could not check your access (' + esc(e.code || e.message) + '). Please refresh the page.</p>'); bindWho(); }
}

onAuthStateChanged(auth, u => { user = u; if (page) item(); else hub(); });
