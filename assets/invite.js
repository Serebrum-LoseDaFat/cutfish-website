// "Request an invite": instead of relying on the visitor's default mail app,
// show a small panel with Gmail, Outlook, their mail app, or copy the address.
// Without JavaScript the buttons still work as plain mailto: links.
(function () {
  var TO = 'krishna@serebrumhq.com';
  var SUBJECT = 'Cutfish invite request';
  var BODY = 'Brand:\nWebsite:\nWhat you would like Cutfish to do:\n';
  var q = encodeURIComponent;

  var links = {
    gmail: 'https://mail.google.com/mail/?view=cm&fs=1&to=' + q(TO) + '&su=' + q(SUBJECT) + '&body=' + q(BODY),
    outlook: 'https://outlook.office.com/mail/deeplink/compose?to=' + q(TO) + '&subject=' + q(SUBJECT) + '&body=' + q(BODY),
    app: 'mailto:' + TO + '?subject=' + q(SUBJECT) + '&body=' + q(BODY)
  };

  var dlg = document.createElement('dialog');
  dlg.className = 'invite';
  dlg.setAttribute('aria-labelledby', 'invite-title');
  dlg.innerHTML =
    '<form method="dialog" class="invite-close-form"><button class="invite-x" aria-label="Close">×</button></form>' +
    '<p class="eyebrow">Private beta</p>' +
    '<h2 id="invite-title">Request an invite</h2>' +
    '<p class="invite-lede">Email <b>' + TO + '</b> with your brand and website. Pick how you want to send it:</p>' +
    '<div class="invite-opts">' +
      '<a class="invite-opt" href="' + links.gmail + '" target="_blank" rel="noopener"><b>Gmail</b><span>Opens a draft in a new tab</span></a>' +
      '<a class="invite-opt" href="' + links.outlook + '" target="_blank" rel="noopener"><b>Outlook</b><span>Outlook on the web, new tab</span></a>' +
      '<a class="invite-opt" href="' + links.app + '"><b>Mail app</b><span>Your computer\'s default email app</span></a>' +
      '<button type="button" class="invite-opt" data-copy><b>Copy address</b><span class="addr">' + TO + '</span></button>' +
    '</div>' +
    '<p class="invite-status" role="status" aria-live="polite"></p>';
  document.body.appendChild(dlg);

  var opener = null;
  var status = dlg.querySelector('.invite-status');

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="mailto:"]');
    if (!a || dlg.contains(a) || typeof dlg.showModal !== 'function') return;
    if (a.textContent.trim() !== 'Request an invite') return; // footer "Contact" links stay plain mailto
    e.preventDefault();
    opener = a;
    status.textContent = '';
    dlg.showModal();
  });

  dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  // Click on the dimmed backdrop closes the panel
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  // After choosing a web or app option, close the panel
  dlg.querySelectorAll('a.invite-opt').forEach(function (a) {
    a.addEventListener('click', function () { setTimeout(function () { dlg.close(); }, 0); });
  });

  dlg.querySelector('[data-copy]').addEventListener('click', function () {
    function done(ok) { status.textContent = ok ? 'Copied ' + TO : 'Select and copy: ' + TO; }
    function legacy() {
      // Older fallback: copy from a temporary text field
      var t = document.createElement('textarea');
      t.value = TO; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      dlg.appendChild(t); t.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      dlg.removeChild(t);
      done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(TO).then(function () { done(true); }, legacy);
    } else {
      legacy();
    }
  });
})();
