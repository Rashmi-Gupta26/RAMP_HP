/**
 * RAMP HP — Apps Script entry points.
 *
 * Architecture: Zoho writes new submissions directly to the master sheet
 * via the native Zoho → Google Sheets integration. This script is the
 * "review brain" sitting next to the sheet. Three time-based triggers
 * drive everything:
 *
 *   processNewSubmissions()  — every minute   (SheetIngest.gs)
 *   scanInboxForReplies()    — every 10 mins  (Replies.gs)
 *   sendOverdueReminders()   — daily 09:00 IST (Reminders.gs)
 *
 * Run installTriggers() once from the editor to register all three.
 *
 * doPost() is retained as an OPTIONAL webhook for ops/test traffic (e.g.
 * curl smoke tests, or routing a future form that doesn't use Zoho's
 * native Sheets integration). It is NOT used in the normal flow.
 */

// ════════════════════════════════════════════════════════════════════════
//  1. Trigger installer — run once from the editor
// ════════════════════════════════════════════════════════════════════════

function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('processNewSubmissions')
    .timeBased().everyMinutes(1).create();

  ScriptApp.newTrigger('scanInboxForReplies')
    .timeBased().everyMinutes(10).create();

  ScriptApp.newTrigger('sendOverdueReminders')
    .timeBased().atHour(9).everyDays(1)
    .inTimezone('Asia/Kolkata').create();

  console.log('Triggers installed:');
  console.log('  • processNewSubmissions    — every 1 minute');
  console.log('  • scanInboxForReplies      — every 10 minutes');
  console.log('  • sendOverdueReminders     — daily at 09:00 IST');
}

// ════════════════════════════════════════════════════════════════════════
//  2. Optional webhook (not used by Zoho's native Sheets integration)
// ════════════════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    if (CONFIG.WEBHOOK_TOKEN) {
      const tok = (e && e.parameter && e.parameter.token) || '';
      if (tok !== CONFIG.WEBHOOK_TOKEN) {
        return jsonResponse_({ ok: false, error: 'unauthorized' });
      }
    }
    const payload = parseWebhookPayload_(e);
    const sh = getSheet_();
    const headers = ensureMetaColumns_(sh);

    // Append a row laid out in the sheet's own header order, leaving
    // anything we can't map blank.
    const row = headers.map(h => {
      // Try canonical → header reverse-lookup, then exact key match
      const canon = Object.keys(ZOHO_HEADER).find(k => ZOHO_HEADER[k] === h);
      if (canon && payload[canon] != null) return payload[canon];
      if (payload[h] != null) return payload[h];
      return '';
    });
    // Stamp the time if Zoho's column is blank (manual posts won't have it)
    const addedCol = headerCol_(headers, ZOHO_HEADER['Added time']);
    if (addedCol > 0 && !row[addedCol - 1]) row[addedCol - 1] = new Date();

    sh.appendRow(row);
    // Ingest immediately so the test response includes the new ID.
    processNewSubmissions();
    return jsonResponse_({ ok: true });
  } catch (err) {
    console.error(err && err.stack || err);
    return jsonResponse_({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, service: 'RAMP HP backend', time: new Date() });
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseWebhookPayload_(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    const ct = (e.postData.type || '').toLowerCase();
    if (ct.indexOf('json') !== -1) {
      try { return JSON.parse(e.postData.contents); } catch (_) {}
    }
  }
  return e.parameter || {};
}
