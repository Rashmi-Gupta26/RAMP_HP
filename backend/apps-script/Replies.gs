/**
 * Gmail reply scanner — turns implementation-partner replies into Sheet
 * status updates. Triggered every 10 minutes by installTriggers().
 *
 * Matching is by reference ID in the subject line. The script reads the
 * first STATUS: line and optional REASON: lines from the reply body.
 */

const REF_ID_RE = new RegExp(`\\b${CONFIG.ID_PREFIX}-\\d{4}-\\d{3,}\\b`);
const STATUS_RE = /^\s*STATUS\s*:\s*(ACCEPT|REJECT|REVIEW)\b/im;
const REASON_RE = /^\s*REASON\s*:\s*([\s\S]+?)(?:\n\s*\n|\n[-=_]{3,}|$)/im;

const STATUS_MAP = {
  ACCEPT: 'Accepted',
  REJECT: 'Rejected',
  REVIEW: 'Under review'
};

function scanInboxForReplies() {
  const query = `is:unread newer_than:14d subject:"${CONFIG.ID_PREFIX}-"`;
  const threads = GmailApp.search(query, 0, 50);
  if (!threads.length) return;

  const sh = getSheet_();
  ensureMetaColumns_(sh);

  threads.forEach(thread => {
    try { processThread_(sh, thread); }
    catch (err) {
      console.error('Reply scan failed for thread "%s": %s',
                    thread.getFirstMessageSubject(), err);
    }
  });
}

function processThread_(sh, thread) {
  const subj = thread.getFirstMessageSubject() || '';
  const m = subj.match(REF_ID_RE);
  if (!m) { thread.markRead(); return; }
  const refId = m[0];

  const messages = thread.getMessages();
  const reply = mostRecentReply_(messages);
  if (!reply) { thread.markRead(); return; }

  const body = reply.getPlainBody();
  const statusMatch = body.match(STATUS_RE);
  if (!statusMatch) {
    console.log('Reply for %s has no STATUS: line; leaving unread for human triage.', refId);
    return;
  }

  const keyword = statusMatch[1].toUpperCase();
  const status  = STATUS_MAP[keyword];
  const reasonMatch = body.match(REASON_RE);
  const reason = reasonMatch ? reasonMatch[1].trim().replace(/\s+/g, ' ') : '';

  applyDecision_(sh, refId, status, reason, reply.getFrom());

  reply.markRead();
  thread.markRead();
  thread.addLabel(getOrCreateLabel_('RAMP/processed'));
}

function mostRecentReply_(messages) {
  // Walk newest → oldest, skipping messages sent by the Catalyst account
  // itself (the original notification + reminders).
  const self = (CONFIG.CATALYST_EMAIL || '').toLowerCase();
  for (let i = messages.length - 1; i >= 0; i--) {
    const from = (messages[i].getFrom() || '').toLowerCase();
    if (from.indexOf(self) === -1) return messages[i];
  }
  return null;
}

function applyDecision_(sh, refId, status, reason, fromHeader) {
  const row = findRowById_(sh, refId);
  if (row < 0) {
    console.warn('No Sheet row for reference %s', refId);
    return;
  }

  patchSubmission_(sh, row, {
    'Status':        status,
    'Response date': new Date(),
    'Reason':        reason || '',
    'Responded by':  parseEmailAddress_(fromHeader)
  });

  if (status === 'Accepted' || status === 'Rejected') {
    const submission = readSubmissionById_(sh, refId);
    notifyApplicant_(submission, status);
  }
}

function notifyApplicant_(s, status) {
  if (!s || !s.Email) return;
  const tpl = (status === 'Accepted') ? acceptEmail(s) : rejectEmail(s);
  sendMail_(s.Email, tpl.subject, tpl.body, {
    replyTo: CONFIG.REPLY_TO,
    name:    CONFIG.PROGRAMME_NAME
  });
}

function parseEmailAddress_(fromHeader) {
  if (!fromHeader) return '';
  const m = fromHeader.match(/<([^>]+)>/);
  return (m ? m[1] : fromHeader).trim().toLowerCase();
}

function getOrCreateLabel_(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name);
}
