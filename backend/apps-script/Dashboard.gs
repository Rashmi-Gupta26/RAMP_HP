/**
 * Dashboard tab — derived, publishable view of the master Sheet.
 *
 * Minimal PII surface: only the 8 fields the public dashboard table
 * displays. Phone, email, idea text, reasons, etc. stay on the private
 * Submissions tab and never leave Google's servers via the published
 * CSV. Row 1 of the Dashboard tab uses the same labels dashboard.html
 * reads (ID, Name, District, …) so the column-name contract is stable
 * even if the visible column titles change.
 *
 *   ID, Added time, Name, District,
 *   Implementation partner, Sector, Status, Response date
 *
 * Rather than publish the raw Submissions tab (which has unstable Zoho
 * headers, typos, IP addresses, duplicate columns, etc.), we maintain a
 * second tab called "Dashboard" whose row 1 is exactly that schema and
 * whose rows 2+ are filled from the canonical fields by this script.
 *
 * That Dashboard tab is what gets Published to web → CSV, and that CSV
 * URL is what dashboard.html points to.
 *
 * Run rebuildDashboardTab() once manually after deploying, and add a
 * time-driven trigger (every 5 min) so it stays in sync. Also invoked
 * after every status change in patchSubmission_().
 */

const DASHBOARD_COLUMNS = [
  'ID',
  'Added time',
  'Name',
  'District',
  'Implementation partner',
  'Sector',
  'Status',
  'Response date'
];

/**
 * Build (or rebuild) the Dashboard tab from the Submissions tab.
 * Idempotent — safe to call as often as you like.
 */
function rebuildDashboardTab() {
  const ss   = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const src  = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getSheets()[0];
  let   dest = ss.getSheetByName(CONFIG.DASHBOARD_SHEET_NAME);
  if (!dest) dest = ss.insertSheet(CONFIG.DASHBOARD_SHEET_NAME);

  const headers = readHeaders_(src);
  const last = src.getLastRow();

  // Clear destination
  dest.clear();
  dest.getRange(1, 1, 1, DASHBOARD_COLUMNS.length)
      .setValues([DASHBOARD_COLUMNS])
      .setFontWeight('bold');
  dest.setFrozenRows(1);

  if (last < 2) return;

  // Pull every row from source, transform via canonical mapping
  const srcValues = src.getRange(2, 1, last - 1, headers.length).getValues();
  const out = srcValues
    .map(row => rowToSubmission_(headers, row))
    .filter(s => s['ID'])     // skip rows the script hasn't ID'd yet
    .map(s => DASHBOARD_COLUMNS.map(col => {
      // canonical mapping:  Dashboard column → submission key
      switch (col) {
        case 'Implementation partner':
          return s['Implementation partner'] || '';
        case 'Added time':
          return s['Added time'] ? formatDateISO_(s['Added time']) : '';
        case 'Response date':
          return s['Response date'] ? formatDateISO_(s['Response date']) : '';
        default:
          return s[col] != null ? s[col] : '';
      }
    }));

  if (out.length) {
    dest.getRange(2, 1, out.length, DASHBOARD_COLUMNS.length).setValues(out);
  }

  // A friendly "last refreshed" marker in column Q
  dest.getRange(1, DASHBOARD_COLUMNS.length + 2).setValue('Last refreshed:');
  dest.getRange(2, DASHBOARD_COLUMNS.length + 2).setValue(new Date());
}

/** Format a Date or date-string as YYYY-MM-DD for the CSV. */
function formatDateISO_(v) {
  const d = (v instanceof Date) ? v : new Date(v);
  if (isNaN(d.getTime())) return String(v || '');
  return Utilities.formatDate(d, 'Asia/Kolkata', 'yyyy-MM-dd');
}

/**
 * Install a 5-minute time-trigger that keeps the Dashboard tab fresh.
 * Run this ONCE after deploying. Safe to re-run — clears old triggers first.
 */
function installDashboardTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'rebuildDashboardTab') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('rebuildDashboardTab')
    .timeBased()
    .everyMinutes(5)
    .create();
}
