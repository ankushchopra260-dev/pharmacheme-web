/* PharmaChemE: pay by UPI on the page. Shows a QR with the amount filled in, a "Pay with a UPI app" button on phones,
   the UPI ID to copy, and a box for the 12-digit UTR. Needs assets/vendor/qrcode-generator-1.4.4.js (MIT).
   Usage: PCME_UPI.box({ upi, name, amount, note, onPaid: async utr => {} }) -> HTMLElement */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let qrP = null;
  const loadQR = () => window.qrcode ? Promise.resolve() : (qrP = qrP || new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/assets/vendor/qrcode-generator-1.4.4.js'; s.onload = res; s.onerror = () => rej(new Error('QR code did not load')); document.head.appendChild(s); }));
  const isPhone = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (window.matchMedia && matchMedia('(pointer: coarse)').matches && innerWidth < 900);
  function link(o) { return 'upi://pay?pa=' + encodeURIComponent(o.upi).replace(/%40/g, '@') + '&pn=' + encodeURIComponent(o.name) + '&am=' + Number(o.amount).toFixed(2) + '&cu=INR&tn=' + encodeURIComponent(String(o.note || 'PharmaChemE').slice(0, 40)); }
  function css() { if (document.getElementById('upi-css')) return; const l = document.createElement('link'); l.id = 'upi-css'; l.rel = 'stylesheet'; l.href = '/assets/css/upi-pay.css?v=2'; document.head.appendChild(l); }
  function box(o) {
    css();
    const el = document.createElement('div'); el.className = 'upi-box';
    const url = link(o), phone = isPhone();
    el.innerHTML = '<div class="upi-top"><div class="upi-qr" aria-label="UPI QR code for ₹' + esc(o.amount) + '"><span class="ts-busy">QR loading…</span></div>' +
      '<div class="upi-info"><p class="upi-amt">Pay <b>₹' + esc(o.amount) + '</b></p><p class="upi-how">' + (phone ? 'Tap the button to open your UPI app, or scan the code from another phone.' : 'Scan with Google Pay, PhonePe, Paytm or any UPI app. The amount fills in by itself.') + '</p>' +
      (phone ? '<a class="ts-btn prim upi-app" href="' + esc(url) + '">Pay ₹' + esc(o.amount) + ' with a UPI app</a>' : '') +
      '<p class="upi-id">UPI ID <b>' + esc(o.upi) + '</b> <button type="button" class="ts-link upi-copy">Copy</button><br><span class="ts-mute">' + esc(o.name) + '</span></p></div></div>' +
      '<form class="upi-utr" novalidate><label for="upi-utr-' + o.key + '"><b>After paying,</b> enter the 12-digit UTR (UPI reference number) from your UPI app.</label>' +
      '<div class="upi-row"><input id="upi-utr-' + o.key + '" inputmode="numeric" autocomplete="off" maxlength="12" placeholder="12-digit UTR"><button type="submit" class="ts-btn prim">I have paid</button></div><p class="upi-err" role="alert"></p></form>' +
      '<p class="ts-mute upi-note">We check every payment by hand and switch the item on, usually within a few hours. You get an email when it opens. Paid but something went wrong? Write to pharmacheme.app@gmail.com and we will sort it out or refund you.</p>';
    loadQR().then(() => { const q = window.qrcode(0, 'M'); q.addData(url); q.make(); el.querySelector('.upi-qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }, () => { el.querySelector('.upi-qr').innerHTML = '<span class="ts-mute">Use the UPI ID</span>'; });
    el.querySelector('.upi-copy').onclick = e => { const b = e.target; try { navigator.clipboard.writeText(o.upi).then(() => { b.textContent = 'Copied'; }, () => { b.textContent = 'Select and copy'; }); } catch (er) { b.textContent = 'Select and copy'; } };
    const f = el.querySelector('form'), inp = f.querySelector('input'), err = f.querySelector('.upi-err');
    inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 12); err.textContent = ''; });
    f.onsubmit = async e => {
      e.preventDefault(); const v = inp.value.trim();
      if (!/^\d{12}$/.test(v)) { err.textContent = 'The UTR is the 12-digit number in the payment details of your UPI app (sometimes called UPI reference or transaction ID).'; inp.focus(); return; }
      const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Sending…';
      try { await o.onPaid(v); } catch (er) { btn.disabled = false; btn.textContent = 'I have paid'; err.textContent = 'Could not send (' + (er.code || er.message) + '). Please try again.'; }
    };
    return el;
  }
  window.PCME_UPI = { box, link };
})();
