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

async function showNoAccess(expired) {
  let req = null;
  try { const r = await getDoc(doc(db, 'requests', key(user.email))); if (r.exists()) req = r.data(); } catch (e) { /* reading own request may be blocked; ignore */ }
  const when = req && req.at && req.at.toDate ? fmtDate(req.at.toDate()) : '';
  view(whoHTML() + (expired ? '<p class="ts-note">Your access to the test series has ended.</p>' : '') +
    (req ? '<div class="ts-step done"><b>Request sent' + (when ? ' on ' + esc(when) : '') + '.</b> We will email you at ' + esc(user.email) + ' with the UPI ID. After you pay, reply with the UPI transaction reference and your mocks open here, usually within a day.</div>' +
           '<p class="ts-mute">Did the email not open, or no reply yet? <a href="' + esc(gmailLink()) + '" target="_blank" rel="noopener">Send it with Gmail</a>, <a href="' + esc(mailtoLink()) + '">use your mail app</a>, or write to ' + esc(CONTACT) + ' with your sign-in email.</p>'
         : '<ol class="ts-steps"><li><b>Request access.</b> Tap the button. It records your request and opens an email to us with your sign-in email filled in. Send that email.</li><li><b>Pay by UPI.</b> We reply with our UPI ID. Pay ' + esc(PRICE) + ' and reply with the transaction reference.</li><li><b>Start practising.</b> We switch on access for ' + esc(user.email) + ', usually within a day. Come back to this page and the 10 mocks will be here.</li></ol>' +
           '<button type="button" class="ts-btn prim" id="ts-req">Request access</button>'));
  bindWho();
  const b = document.getElementById('ts-req');
  if (b) b.onclick = async () => {
    b.disabled = true;
    try { await setDoc(doc(db, 'requests', key(user.email)), { email: user.email, name: user.displayName || '', at: serverTimestamp() }); } catch (e) { /* still open the email */ }
    if (NOTIFY) { try { fetch(NOTIFY, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ email: user.email, name: user.displayName || '', item: 'gate-test-series', title: 'GATE CH test series', price: PRICE, url: location.href.split('#')[0] }) }).catch(() => {}); } catch (e) { /* ignore */ } }
    location.href = mailtoLink();
    setTimeout(() => showNoAccess(false), 800);
  };
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
