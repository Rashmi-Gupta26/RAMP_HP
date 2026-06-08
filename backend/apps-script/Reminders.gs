/**
 * Daily reminder job — implements the 21-day review rule from Section 7.
 *
 * For every Sheet row:
 *   - Status = "Pending"      → remind once submission is > REVIEW_DEADLINE_DAYS old
 *   - Status = "Under review" → remind once response date is > REVIEW_PAUSE_DAYS old
 *
 * A row is never reminded more often than REMINDER_COOLDOWN_DAYS.
 */

function sendOverdueReminders() {
  const sh = getSheet_();
  const headers = ensureMetaColumns_(sh);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const rows = sh.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const now = Date.now();
  let sent = 0, skipped = 0;

  rows.forEach((row, i) => {
    const s = rowToSubmission_(headers, row);
    s._row = i + 2;

    if (!s.ID) { skipped++; return; }              // not yet ingested
    if (!needsReminder_(s, now)) { skipped++; return; }

    const partner = resolvePartner(s['Implementation partner'] || s['Institute']);
    if (!partner) {
      console.warn('Row %s (%s): no partner mapping', s._row, s.ID);
      return;
    }

    const { subject, body } = reminderEmail(s);
    GmailApp.sendEmail(partner.to, subject, body, {
      cc:      ccForPartner_(partner),
      replyTo: CONFIG.REPLY_TO,
      name:    CONFIG.PROGRAMME_NAME
    });

    patchSubmission_(sh, s._row, { 'Last reminder sent': new Date() });
    sent++;
  });

  console.log('Reminders sent: %s   skipped: %s', sent, skipped);
}

function needsReminder_(s, now) {
  const status = String(s.Status || '').trim();
  if (status !== 'Pending' && status !== 'Under review') return false;

  const submitted = toDate_(s['Added time']);
  if (!submitted) return false;
  const ageDays = Math.floor((now - submitted.getTime()) / 86400000);

  if (status === 'Pending' && ageDays < CONFIG.REVIEW_DEADLINE_DAYS) return false;

  if (status === 'Under review') {
    const responded = toDate_(s['Response date']);
    if (!responded) return false;
    const sinceReview = Math.floor((now - responded.getTime()) / 86400000);
    if (sinceReview < CONFIG.REVIEW_PAUSE_DAYS) return false;
  }

  const lastReminder = toDate_(s['Last reminder sent']);
  if (lastReminder) {
    const sinceLast = Math.floor((now - lastReminder.getTime()) / 86400000);
    if (sinceLast < CONFIG.REMINDER_COOLDOWN_DAYS) return false;
  }

  return true;
}

function toDate_(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
