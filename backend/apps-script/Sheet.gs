/**
 * Sheet helpers — the Sheet is the single source of truth.
 *
 * Architecture: Zoho writes its own columns directly to the sheet via the
 * native Zoho → Google Sheets integration. The script reads those by
 * header label (header-driven, NOT positional) and owns a separate block
 * of metadata columns appended to the right.
 *
 * Internal code always speaks "canonical" field names. The translation
 * to Zoho's literal sheet headers lives in ZOHO_HEADER below — update
 * it when Catalyst changes the Zoho form.
 */

// ── Metadata columns the script owns. Appended to row 1 if missing. ──
const META_COLUMNS = [
  'ID',
  'Implementation partner',
  'Status',
  'Response date',
  'Reason',
  'Responded by',
  'Last reminder sent',
  'last_updated'
];

/**
 * Canonical field → exact Zoho sheet header (incl. typos/spaces).
 * The keys are what every other file in the project uses (s.Name,
 * s['Idea title'], …). Update the VALUES if Catalyst renames a Zoho
 * form field.
 */
const ZOHO_HEADER = {
  'Added time':           'Added Time',
  'Name':                 'Name',
  'Phone':                'Phone',
  'Email':                'Email',
  'Address':              'Address',
  'Gender':               'Gender',
  'Date of birth':        'Date of birth',
  'Age':                  'Age',
  'District':             'District',
  'Institute':            'Institutes',
  'Institute fallback':   'Institues name',                  // sic: Zoho typo
  'Idea title':           'Idea title',
  'Idea description':     'Provide a short description of your idea',
  'Startup status':       'Current Status of Your Startup/Business',
  'Sector':               'which sector does your startup belong to',
  'Startup stage':        'What is the current stage of your startup',
  'Prior research':       'Have you done any research related to this idea?',
  'Prototype made':       'Have your tried making your product ?',  // sic: Zoho typo
  'Sample / model':       'Have you made any sample or model of your product ?',
  'Testing method':       'How did you do the testing of your product ?',
  'Feedback received':    'What feedback did you receive?',
  'Commercialised':       'Is this commercialised?',
  'Currently earning':    'Are you currently earning from this business?',
  'Customers':            'Who are your customers?',
  'Sales method':         'How do you sell your product/service?',
  'Sales method future':  'How will you sell your product/service ?',
  'Team':                 'Do you have a team?',
  'Support needed now':   'What support do you need right now ?',
  'Support from RAMP':    'What kind of support do you need from the RAMP Program?',
  'Prior incubation':     'Have you been part of any incubation earlier'
};

/** Returns the spreadsheet tab the script reads/writes. */
function getSheet_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) sh = ss.getSheets()[0];      // fall back to first tab (gid=0)
  return sh;
}

/** Row 1 as a string array (lowered & trimmed for fuzzy lookup). */
function readHeaders_(sh) {
  const lastCol = sh.getLastColumn();
  if (lastCol < 1) return [];
  return sh.getRange(1, 1, 1, lastCol).getValues()[0].map(v => String(v || ''));
}

/** Fuzzy compare two header strings: case + collapsed whitespace. */
function normHeader_(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** 1-based column index for a header label (exact, then fuzzy). -1 if missing. */
function headerCol_(headers, label) {
  if (!label) return -1;
  const want = normHeader_(label);
  for (let i = 0; i < headers.length; i++) {
    if (normHeader_(headers[i]) === want) return i + 1;
  }
  return -1;
}

/** 1-based column for a canonical field name, via the Zoho/meta maps. */
function canonCol_(headers, canonName) {
  // META columns are stored by their canonical name directly
  if (META_COLUMNS.indexOf(canonName) !== -1) {
    return headerCol_(headers, canonName);
  }
  const zoho = ZOHO_HEADER[canonName];
  return zoho ? headerCol_(headers, zoho) : -1;
}

/**
 * Append any META_COLUMNS that aren't already in the header row.
 * Safe to call repeatedly. Returns the (possibly extended) header array.
 */
function ensureMetaColumns_(sh) {
  let headers = readHeaders_(sh);
  const toAdd = META_COLUMNS.filter(c => headerCol_(headers, c) === -1);
  if (!toAdd.length) return headers;

  const startCol = headers.length + 1;
  sh.getRange(1, startCol, 1, toAdd.length)
    .setValues([toAdd])
    .setFontWeight('bold');
  if (sh.getFrozenRows() < 1) sh.setFrozenRows(1);
  return headers.concat(toAdd);
}

/** Read row N (1-based) as a canonical submission object. */
function rowToSubmission_(headers, rowValues) {
  const s = {};
  // canonical Zoho fields
  Object.keys(ZOHO_HEADER).forEach(canon => {
    const col = headerCol_(headers, ZOHO_HEADER[canon]);
    if (col > 0) s[canon] = rowValues[col - 1];
  });
  // meta fields
  META_COLUMNS.forEach(meta => {
    const col = headerCol_(headers, meta);
    if (col > 0) s[meta] = rowValues[col - 1];
  });
  // Convenience: prefer free-text fallback only if dropdown is blank
  if (!s['Institute'] && s['Institute fallback']) {
    s['Institute'] = s['Institute fallback'];
  }
  return s;
}

/** Generate the next reference ID, e.g. RAMP-2026-047. */
function nextId_(sh, headers) {
  const year = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy');
  const idCol = headerCol_(headers, 'ID');
  if (idCol < 1) throw new Error('ID column missing — call ensureMetaColumns_ first.');

  const last = sh.getLastRow();
  if (last < 2) return `${CONFIG.ID_PREFIX}-${year}-001`;
  const ids = sh.getRange(2, idCol, last - 1, 1).getValues().flat();

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
  const headers = readHeaders_(sh);
  const idCol = headerCol_(headers, 'ID');
  if (idCol < 1) return -1;

  const last = sh.getLastRow();
  if (last < 2) return -1;
  const ids = sh.getRange(2, idCol, last - 1, 1).getValues().flat();
  const idx = ids.indexOf(id);
  return idx < 0 ? -1 : idx + 2;
}

/** Read one submission as canonical object (adds _row). null if missing. */
function readSubmissionById_(sh, id) {
  const r = findRowById_(sh, id);
  if (r < 0) return null;
  const headers = readHeaders_(sh);
  const vals = sh.getRange(r, 1, 1, headers.length).getValues()[0];
  const s = rowToSubmission_(headers, vals);
  s._row = r;
  return s;
}

/** Patch named (canonical) columns on a row. Always bumps last_updated. */
function patchSubmission_(sh, rowNum, patch) {
  const headers = readHeaders_(sh);
  Object.keys(patch).forEach(canon => {
    const col = canonCol_(headers, canon);
    if (col > 0) sh.getRange(rowNum, col).setValue(patch[canon]);
    else console.warn('patchSubmission_: no column for "%s"', canon);
  });
  const luCol = canonCol_(headers, 'last_updated');
  if (luCol > 0) sh.getRange(rowNum, luCol).setValue(new Date());
}
