/**
 * Single chokepoint for every outgoing email.
 *
 * Honours CONFIG.TEST_REDIRECT_EMAIL — when set, diverts every message to
 * that address and prepends a `[TEST]` banner to the subject showing the
 * original To + CC. Lets QA run real Zoho submissions through the full
 * pipeline without spamming partners or applicants.
 *
 * Clear CONFIG.TEST_REDIRECT_EMAIL (empty string) to go live.
 */
function sendMail_(to, subject, body, opts) {
  opts = opts || {};
  const redirect = (CONFIG.TEST_REDIRECT_EMAIL || '').trim();

  if (redirect) {
    const tag = `[TEST → was To:${to}${opts.cc ? ' CC:' + opts.cc : ''}] `;
    GmailApp.sendEmail(redirect, tag + subject, body, {
      replyTo: opts.replyTo,
      name:    opts.name
    });
    console.log('TEST redirect: would have sent to "%s" (cc %s) — diverted to %s',
                to, opts.cc || '—', redirect);
    return;
  }

  GmailApp.sendEmail(to, subject, body, {
    cc:      opts.cc || undefined,
    replyTo: opts.replyTo,
    name:    opts.name
  });
}
