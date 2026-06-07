/**
 * RAMP HP — Apps Script entry points.
 *
 *   doPost(e)               ← Zoho webhook on form submit
 *   scanInboxForReplies()   ← time-trigger, every 10 minutes
 *   sendOverdueReminders()  ← time-trigger, daily at 09:00 IST
 *
 * Install the triggers by running installTriggers() once from the editor.
 */

// ════════════════════════════════════════════════════════════════════════
//  1. Webhook — Zoho posts here on form submission
// ════════════════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    // Optional shared-secret check (set CONFIG.WEBHOOK_TOKEN + add ?token= to URL)
    if (CONFIG.WEBHOOK_TOKEN) {
      const tok = (e && e.parameter && e.parameter.token) || '';
      if (tok !== CONFIG.WEBHOOK_TOKEN) {
        return jsonResponse_({ ok: false, error: 'unauthorized' }, 401);
      }
    }

    const payload = parseZohoPayload_(e);
    const submission = normaliseSubmission_(payload);
    const saved = persistAndNotify_(submission);

    return jsonResponse_({ ok: true, id: saved.ID });
  } catch (err) {
    console.error(err && err.stack || err);
    return jsonResponse_({ ok: false, error: String(err && err.message || err) }, 500);
  }
}

/** Health check — visit the web-app URL in a browser. */
function doGet() {
  return jsonResponse_({ ok: true, service: 'RAMP HP backend', time: new Date() });
}

function jsonResponse_(obj, code) {
  const out = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  // Apps Script doesn't expose status codes; non-200 returned by throwing.
  if (code && code >= 400) throw new Error(JSON.stringify(obj));
  return out;
}

/** Accept JSON body, form-encoded body, or query-string from Zoho. */
function parseZohoPayload_(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    const ct = (e.postData.type || '').toLowerCase();
    if (ct.indexOf('json') !== -1) {
      try { return JSON.parse(e.postData.contents); } catch (_) {}
    }
  }
  // Zoho's default webhook sends form-encoded params → land in e.parameter
  return e.parameter || {};
}

/**
 * Map raw Zoho keys to our COLUMNS.
 * Zoho field names depend on the form; this map covers the labels
 * documented in RAMP_Workflow Section 4 with a few common variants.
 * Unknown keys are ignored.
 */
const ZOHO_FIELD_MAP = {
  'Name':                                                      'Name',
  'Phone':                                                     'Phone',
  'Email':                                                     'Email',
  'Address':                                                   'Address',
  'Gender':                                                    'Gender',
  'Date_of_birth':                                             'Date of birth',
  'DateofBirth':                                               'Date of birth',
  'Age':                                                       'Age',
  'District':                                                  'District',
  'Institutes':                                                'Institute',
  'Institutes_name':                                           'Institute',
  'Idea_title':                                                'Idea title',
  'Provide_a_short_description_of_your_idea':                  'Idea description',
  'Current_status_of_your_startup_business':                   'Startup status',
  'Which_sector_does_your_startup_belong_to':                  'Sector',
  'What_is_the_current_stage_of_your_startup':                 'Startup stage',
  'Have_you_done_any_research_related_to_this_idea':           'Prior research',
  'Have_you_tried_making_your_product':                        'Prototype made',
  'Have_you_made_any_sample_or_model_of_your_product':         'Sample / model',
  'How_did_you_do_the_testing_of_your_product':                'Testing method',
  'What_feedback_did_you_receive':                             'Feedback received',
  'Is_this_commercialised':                                    'Commercialised',
  'Are_you_currently_earning_from_this_business':              'Currently earning',
  'Who_are_your_customers':                                    'Customers',
  'How_do_you_sell_your_product_service':                      'Sales method',
  'How_will_you_sell_your_product_service':                    'Sales method',
  'Do_you_have_a_team':                                        'Team',
  'What_support_do_you_need_right_now':                        'Support needed now',
  'What_kind_of_support_do_you_need_from_the_RAMP_Program':    'Support from RAMP',
  'Have_you_been_part_of_any_incubation_earlier':              'Prior incubation'
};

function normaliseSubmission_(raw) {
  const out = {};
  Object.keys(raw).forEach(k => {
    const col = ZOHO_FIELD_MAP[k];
    if (col) out[col] = String(raw[k] || '').trim();
  });

  // derive age from DOB if not provided
  if (!out['Age'] && out['Date of birth']) {
    const dob = new Date(out['Date of birth']);
    if (!isNaN(dob)) {
      const diff = Date.now() - dob.getTime();
      out['Age'] = Math.floor(diff / (365.25 * 86400000));
    }
  }

  // resolve implementation partner from the Institute dropdown
  const partner = resolvePartner(out['Institute']);
  out['Implementation partner'] = partner ? partner.name : (out['Institute'] || '');
  out._partner = partner;     // stash for emailer

  return out;
}

function persistAndNotify_(s) {
  const sh = getSheet_();
  s.ID = nextId_(sh);
  s['Added time'] = new Date();
  s.Status = 'Pending';
  s.last_updated = new Date();

  sh.appendRow(rowFromObject_(s));

  if (s._partner) {
    sendNotification_(s);
  } else {
    console.warn('No partner resolved for institute "%s" — notification not sent.', s['Institute']);
  }
  return s;
}

function sendNotification_(s) {
  const { subject, body } = notificationEmail(s);
  const districtHead = CONFIG.DISTRICT_HEADS[s.District];

  const cc = [CONFIG.CATALYST_EMAIL];
  if (districtHead) cc.push(districtHead);

  GmailApp.sendEmail(s._partner.to, subject, body, {
    cc:      cc.join(','),
    replyTo: CONFIG.REPLY_TO,
    name:    CONFIG.PROGRAMME_NAME
  });
}

// ════════════════════════════════════════════════════════════════════════
//  2. Trigger installer — run once from the editor
// ════════════════════════════════════════════════════════════════════════

function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('scanInboxForReplies')
    .timeBased().everyMinutes(10).create();

  ScriptApp.newTrigger('sendOverdueReminders')
    .timeBased().atHour(9).everyDays(1)
    .inTimezone('Asia/Kolkata').create();

  console.log('Triggers installed: scanInboxForReplies (10 min) + sendOverdueReminders (daily 09:00 IST)');
}
