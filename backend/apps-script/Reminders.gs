/**
 * Daily reminder job — implements the 21-day review rule from Section 7.
 *
 * For every Sheet row:
 *   - status = "Pending"      → remind once submission is > REVIEW_DEADLINE_DAYS old
 *   - status = "Under review" → remind once response date is > REVIEW_PAUSE_DAYS old
 *
 * A row is never reminded more often than REMINDER_COOLDOWN_DAYS.
 */

function sendOverdueReminders() {
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return;

  const range = sh.getRange(2, 1, last - 1, COLUMNS.length).getValues();
  const now = Date.now();
  let sent = 0, skipped = 0;

  range.forEach((row, i) => {
    const s = {};
    COLUMNS.forEach((c, j) => s[c] = row[j]);
    s._row = i + 2;

    if (!needsReminder_(s, now)) { skipped++; return; }

    const partner = resolvePartner(s['Implementation partner']);
    if (!partner) {
      console.warn('No partner mapping for row %s (%s)', s._row, s.ID);
      return;
    }

    const { subject, body } = reminderEmail(s);
    const districtHead = CONFIG.DISTRICT_HEADS[s.District];
    const cc = [CONFIG.CATALYST_EMAIL];
    if (districtHead) cc.push(districtHead);

    GmailApp.sendEmail(partner.to, subject, body, {
      cc:      cc.join(','),
      replyTo: CONFIG.REPLY_TO,
      name:    CONFIG.PROGRAMME_NAME
    });

    patchRow_(sh, s._row, { 'Last reminder sent': new Date() });
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
