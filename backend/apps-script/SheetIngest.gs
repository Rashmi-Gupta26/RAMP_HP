/**
 * Sheet ingest — the new primary entry point.
 *
 * Zoho writes form submissions directly to the sheet via its native
 * Google Sheets integration. This job runs every minute and converts
 * each "raw" row (one Zoho just dropped, no ID) into a fully processed
 * submission:
 *
 *   • assigns the next RAMP-YYYY-NNN reference ID
 *   • resolves the implementation partner from the Institutes dropdown
 *   • sets Status = Pending and last_updated = now
 *   • emails the partner (CC: Catalyst)
 *
 * Idempotent: a row with a non-empty ID is skipped.
 * Safe under concurrency thanks to LockService.
 */

function processNewSubmissions() {
  const lock = LockService.getScriptLock();
  // Wait up to 30s for any previous run to finish.
  try { lock.waitLock(30 * 1000); } catch (e) {
    console.warn('Ingest skipped — another run still holds the lock.');
    return;
  }

  try {
    const sh = getSheet_();
    const headers = ensureMetaColumns_(sh);

    const lastRow = sh.getLastRow();
    if (lastRow < 2) return;        // header-only

    const idCol = headerCol_(headers, 'ID');
    const ids = sh.getRange(2, idCol, lastRow - 1, 1).getValues().flat();

    let processed = 0;
    for (let i = 0; i < ids.length; i++) {
      if (ids[i]) continue;          // already processed
      const rowNum = i + 2;
      try {
        ingestRow_(sh, headers, rowNum);
        processed++;
      } catch (err) {
        console.error('Row %s ingest failed: %s', rowNum, err && err.stack || err);
      }
    }
    if (processed) console.log('Ingested %s new submission(s).', processed);
  } finally {
    lock.releaseLock();
  }
}

function ingestRow_(sh, headers, rowNum) {
  const rowValues = sh.getRange(rowNum, 1, 1, headers.length).getValues()[0];
  const s = rowToSubmission_(headers, rowValues);
  s._row = rowNum;

  // Derive age from DOB if Zoho didn't fill it
  if (!s['Age'] && s['Date of birth']) {
    const dob = new Date(s['Date of birth']);
    if (!isNaN(dob)) {
      s['Age'] = Math.floor((Date.now() - dob.getTime()) / (365.25 * 86400000));
    }
  }

  // Resolve implementation partner — dropdown first, free-text fallback
  const partner = resolvePartner(s['Institute']);
  const partnerName = partner ? partner.name : '';

  // Allocate the reference ID
  const id = nextId_(sh, headers);

  // Write the meta block
  patchSubmission_(sh, rowNum, {
    'ID': id,
    'Implementation partner': partnerName,
    'Status': 'Pending'
  });

  // Re-read so the email gets the freshly-written fields
  s.ID = id;
  s['Implementation partner'] = partnerName;
  s.Status = 'Pending';

  if (!partner) {
    console.warn('Row %s (%s): no partner resolved for institute "%s" — notification not sent.',
                 rowNum, id, s['Institute']);
    return;
  }

  s._partner = partner;
  sendNotification_(s);
}

/** Notification email — To: implementation partner, CC: Catalyst. */
function sendNotification_(s) {
  const { subject, body } = notificationEmail(s);
  GmailApp.sendEmail(s._partner.to, subject, body, {
    cc:      ccForPartner_(s._partner),
    replyTo: CONFIG.REPLY_TO,
    name:    CONFIG.PROGRAMME_NAME
  });
}

/** CC list for a partner email — Catalyst, deduped against the To address. */
function ccForPartner_(partner) {
  const catalyst = (CONFIG.CATALYST_EMAIL || '').toLowerCase();
  const to = (partner && partner.to || '').toLowerCase();
  return (catalyst && catalyst !== to) ? CONFIG.CATALYST_EMAIL : '';
}
