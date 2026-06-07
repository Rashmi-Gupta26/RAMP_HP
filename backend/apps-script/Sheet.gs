/**
 * Sheet helpers — the Sheet is the single source of truth.
 * All reads & writes go through these functions so the column layout
 * is defined in exactly one place.
 */

/** Canonical column order. Must match backend/sheet/master-template.csv. */
const COLUMNS = [
  'ID', 'Added time', 'Name', 'Phone', 'Email', 'Address', 'Gender',
  'Date of birth', 'Age', 'District', 'Implementation partner',
  'Idea title', 'Idea description', 'Startup status', 'Sector',
  'Startup stage', 'Prior research', 'Prototype made', 'Sample / model',
  'Testing method', 'Feedback received', 'Commercialised',
  'Currently earning', 'Customers', 'Sales method', 'Team',
  'Support needed now', 'Support from RAMP', 'Prior incubation',
  // review block
  'Status', 'Response date', 'Reason', 'Responded by',
  'Last reminder sent', 'last_updated'
];

function getSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_NAME);
    sh.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function colIndex_(name) {
  const i = COLUMNS.indexOf(name);
  if (i < 0) throw new Error('Unknown column: ' + name);
  return i + 1;   // 1-based for Sheets API
}

/** Build a row from a key→value map, in COLUMNS order. */
function rowFromObject_(obj) {
  return COLUMNS.map(c => (c in obj ? obj[c] : ''));
}

/** Generate the next reference ID, e.g. RAMP-2026-047. */
function nextId_(sh) {
  const year = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy');
  const last = sh.getLastRow();
  if (last < 2) return `${CONFIG.ID_PREFIX}-${year}-001`;
  const ids = sh.getRange(2, colIndex_('ID'), last - 1, 1).getValues().flat();
  const yearTag = `${CONFIG.ID_PREFIX}-${year}-`;
  let max = 0;
  ids.forEach(id => {
    if (typeof id === 'string' && id.indexOf(yearTag) === 0) {
      const n = parseInt(id.slice(yearTag.length), 10);
      if (n > max) max = n;
    }
  });
  return yearTag + String(max + 1).padStart(3, '0');
}

/** Find a row's 1-based row number by reference ID. Returns -1 if missing. */
function findRowById_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const ids = sh.getRange(2, colIndex_('ID'), last - 1, 1).getValues().flat();
  const idx = ids.indexOf(id);
  return idx < 0 ? -1 : idx + 2;
}

/** Read a single submission as an object keyed by COLUMNS. */
function readRowById_(sh, id) {
  const r = findRowById_(sh, id);
  if (r < 0) return null;
  const vals = sh.getRange(r, 1, 1, COLUMNS.length).getValues()[0];
  const obj = { _row: r };
  COLUMNS.forEach((c, i) => obj[c] = vals[i]);
  return obj;
}

/** Patch named columns on a row. */
function patchRow_(sh, rowNum, patch) {
  Object.keys(patch).forEach(col => {
    sh.getRange(rowNum, colIndex_(col)).setValue(patch[col]);
  });
  sh.getRange(rowNum, colIndex_('last_updated')).setValue(new Date());
}
