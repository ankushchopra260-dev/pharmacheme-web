/* PharmaChemE GATE CH test series: Google sign-in, access requests and loading paid mocks.
   Questions live only in Firestore (collection "mocks"); the security rules let a signed-in user read them
   only while access/{their email} exists with a future "until" date. The owner grants access from /gate/test-series/admin/. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { getFirestore, doc, getDoc, getDocs, setDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

const app = initializeApp({
  apiKey: 'AIzaSyAoko-Lgtl23DrJQ5_Dk3bQpdCHX0NvMCc',
  authDomain: 'pharmacheme-1f559.firebaseapp.com',
  projectId: 'pharmacheme-1f559',
  storageBucket: 'pharmacheme-1f559.firebasestorage.app',
  messagingSenderId: '324335799446',
  appId: '1:324335799446:web:a7bb53bbc3e4b67c9906b7'
});
const auth = getAuth(app), db = getFirestore(app);
const panel = document.getElementById('ts-panel'), gateApp = document.getElementById('gate-app');
const CONTACT = panel.dataset.contact, PRICE = panel.dataset.price, NOTIFY = panel.dataset.notify;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDate = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const key = email => email.trim().toLowerCase();
let user = null, mocksCache = null;

function view(html) { panel.innerHTML = html; gateApp.hidden = true; panel.hidden = false; }
function busy(msg) { view('<p class="ts-busy">' + esc(msg) + '</p>'); }

async function signIn() {
  const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
  try { await signInWithPopup(auth, p); }
  catch (e) { if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return signInWithRedirect(auth, p);
    if (e && e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') view(signedOutHTML('Sign-in did not complete (' + esc(e.code || e.message) + '). Please try again.')); }
}

function signedOutHTML(note) {
  return (note ? '<p class="ts-note">' + note + '</p>' : '') +
    '<p>Sign in with the Google account you will use for the mocks. Access is given to that email address.</p>' +
    '<button type="button" class="ts-btn prim" id="ts-in">Sign in with Google</button>';
}
function bindSignedOut() { const b = document.getElementById('ts-in'); if (b) b.onclick = signIn; }

function whoHTML() {
  return '<div class="ts-who">' + (user.photoURL ? '<img src="' + esc(user.photoURL) + '" alt="" referrerpolicy="no-referrer">' : '') +
    '<span>Signed in as <b>' + esc(user.email) + '</b></span><button type="button" class="ts-link" id="ts-out">Sign out</button></div>';
}
function bindWho() { const b = document.getElementById('ts-out'); if (b) b.onclick = () => signOut(auth); }

function mailtoLink() {
  const subject = 'GATE CH test series access request';
  const body = 'Hello,\n\nPlease give me access to the PharmaChemE GATE CH test series (' + PRICE + ').\n\nGoogle sign-in email: ' + user.email + '\nName: ' + (user.displayName || '') + '\n\nPlease send me the UPI ID for payment.\n\nThank you.';
  return 'mailto:' + CONTACT + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}
function gmailLink() {
  const m = mailtoLink(), q = new URLSearchParams(m.split('?')[1]);
  return 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT) + '&su=' + encodeURIComponent(q.get('subject')) + '&body=' + encodeURIComponent(q.get('body'));
}

const UPI = { upi: panel.dataset.upi || '', name: panel.dataset.upiName || 'PharmaChemE' };
let upiP = null;
const loadUPI = () => upiP || (upiP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/assets/js/upi-pay.js?v=2'; s.onload = res; s.onerror = rej; document.head.appendChild(s); }));
function alertOwner(item, title) { if (!NOTIFY) return; try { fetch(NOTIFY, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ email: user.email, name: user.displayName || '', item, title, price: PRICE, url: location.href.split('#')[0] }) }).catch(() => {}); } catch (e) { /* ignore */ } }

async function showNoAccess(expired) {
  let req = null;
  try { const r = await getDoc(doc(db, 'requests', key(user.email))); if (r.exists()) req = r.data(); } catch (e) { /* reading own request may be blocked; ignore */ }
  const head = whoHTML() + (expired ? '<p class="ts-note">Your access to the test series has ended.</p>' : '');
  if (req && req.utr) {
    const when = req.paidAt && req.paidAt.toDate ? fmtDate(req.paidAt.toDate()) : '';
    view(head + '<div class="ts-paid"><b>Payment sent' + (when ? ' on ' + esc(when) : '') + ' (UTR ' + esc(req.utr) + ').</b> We check it and switch on the test series for ' + esc(user.email) + ', usually within a few hours. You will get an email, and the 10 mocks will appear on this page.</div><p class="ts-mute">Entered the wrong UTR? <button type="button" class="ts-link" id="ts-reutr">Enter it again</button>. Questions: ' + esc(CONTACT) + '.</p>');
    bindWho(); document.getElementById('ts-reutr').onclick = () => showPay(); return;
  }
  if (req) return showPay();
  view(head + '<ol class="ts-steps"><li><b>Pay ' + esc(PRICE) + ' by UPI</b> right here: scan the QR or tap to open your UPI app.</li><li><b>Enter the UTR</b> (12-digit reference) from your UPI app.</li><li><b>Start practising.</b> We switch on access for ' + esc(user.email) + ', usually within a few hours, and email you. The 10 mocks then appear on this page.</li></ol>' +
    '<button type="button" class="ts-btn prim" id="ts-req">Buy now, ' + esc(PRICE) + '</button>');
  bindWho();
  document.getElementById('ts-req').onclick = async e => {
    e.target.disabled = true;
    try { await setDoc(doc(db, 'requests', key(user.email)), { email: user.email, name: user.displayName || '', at: serverTimestamp() }); } catch (er) { /* still show payment */ }
    alertOwner('gate-test-series', 'GATE CH test series');
    showPay();
  };
  async function showPay() {
    view(head + '<p class="ts-ok"><b>Pay ' + esc(PRICE) + ' for the GATE CH test series.</b></p><div id="ts-pay"></div>'); bindWho();
    try { await loadUPI(); } catch (e) { document.getElementById('ts-pay').innerHTML = '<p class="ts-note">The payment box did not load. Please refresh, or write to ' + esc(CONTACT) + '.</p>'; return; }
    document.getElementById('ts-pay').appendChild(window.PCME_UPI.box(Object.assign({}, UPI, { amount: parseInt(String(PRICE).replace(/\D/g, ''), 10) || 0, key: 'g', note: 'PharmaChemE GATE test series', onPaid: async utr => {
      await setDoc(doc(db, 'requests', key(user.email)), { email: user.email, name: user.displayName || '', at: (req && req.at) || serverTimestamp(), utr, paidAt: serverTimestamp() }, { merge: true });
      alertOwner('gate-test-series|paid', 'PAID ' + PRICE + ', UTR ' + utr + ': GATE CH test series');
      showNoAccess(false);
    } })));
  }
}

async function loadMocks() {
  if (mocksCache) return mocksCache;
  const snap = await getDocs(collection(db, 'mocks'));
  mocksCache = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.id.localeCompare(b.id));
  return mocksCache;
}

async function showList(until) {
  busy('Loading your mocks…');
  let mocks;
  try { mocks = await loadMocks(); } catch (e) { view(whoHTML() + '<p class="ts-note">The mocks could not be loaded (' + esc(e.code || e.message) + '). Please refresh the page. If it keeps happening, email ' + esc(CONTACT) + '.</p>'); bindWho(); return; }
  if (!mocks.length) { view(whoHTML() + '<p class="ts-note">Your access is active, but the mocks are being updated. Please check again shortly.</p>'); bindWho(); return; }
  const G = window.__gate;
  const rows = mocks.map((m, i) => { const s = G.paidStatus(m.id);
    return '<li><div><b>' + esc(m.title || ('Mock ' + (i + 1))) + '</b><span class="ts-mute">' + (m.questions || []).length + ' questions · 100 marks · 3 hours</span></div>' +
      '<span class="ts-stat">' + (s.inProgress ? 'In progress' : s.best != null ? 'Best ' + s.best.toFixed(2) + ' / 100' : 'Not attempted') + '</span>' +
      '<button type="button" class="ts-btn' + (s.inProgress ? ' prim' : '') + '" data-i="' + i + '">' + (s.inProgress ? 'Resume' : s.attempts ? 'Open' : 'Start') + '</button></li>'; }).join('');
  view(whoHTML() + '<p class="ts-ok">Access active until <b>' + esc(fmtDate(until)) + '</b>.</p><ul class="ts-list">' + rows + '</ul><p class="ts-mute">Your answers and scores are kept in this browser. Use the same browser to resume a mock.</p>');
  bindWho();
  panel.querySelectorAll('.ts-list button').forEach(b => b.onclick = () => openMock(mocks[+b.dataset.i], until));
}

function openMock(m, until) {
  panel.hidden = true; gateApp.hidden = false;
  window.__gate.runPaid(m.questions, m.id, m.title || m.id, () => showList(until));
  window.scrollTo({ top: gateApp.getBoundingClientRect().top + window.scrollY - 90 });
}

async function route() {
  if (!user) { view(signedOutHTML()); bindSignedOut(); return; }
  busy('Checking your access…');
  let acc = null;
  try { const a = await getDoc(doc(db, 'access', key(user.email))); if (a.exists()) acc = a.data(); }
  catch (e) { view(whoHTML() + '<p class="ts-note">We could not check your access (' + esc(e.code || e.message) + '). Please refresh the page.</p>'); bindWho(); return; }
  const until = acc && acc.until && acc.until.toDate ? acc.until.toDate() : null;
  if (until && until > new Date()) return showList(until);
  return showNoAccess(!!until);
}

onAuthStateChanged(auth, u => { user = u; mocksCache = null; route(); });
