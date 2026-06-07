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
  // Threads we have already processed are starred + label-archived; we look
  // for unread inbox threads whose subject carries our ref ID and that
  // arrived in the last 14 days (covers reminders + late replies).
  const query = `is:unread newer_than:14d subject:"${CONFIG.ID_PREFIX}-"`;
  const threads = GmailApp.search(query, 0, 50);

  if (!threads.length) return;
  const sh = getSheet_();

  threads.forEach(thread => {
    try {
      processThread_(sh, thread);
    } catch (err) {
      console.error('Reply scan failed for thread "%s": %s', thread.getFirstMessageSubject(), err);
    }
  });
}

function processThread_(sh, thread) {
  const subj = thread.getFirstMessageSubject() || '';
  const m = subj.match(REF_ID_RE);
  if (!m) {
    thread.markRead();   // not ours, leave alone
    return;
  }
  const refId = m[0];

  // The latest message is the partner's reply (the original notification
  // we sent is also in the thread). We want the most recent non-script
  // message.
  const messages = thread.getMessages();
  const reply = mostRecentReply_(messages);
  if (!reply) { thread.markRead(); return; }

  const body = reply.getPlainBody();
  const statusMatch = body.match(STATUS_RE);
  if (!statusMatch) {
    // Partner wrote back conversationally without the STATUS: keyword.
    // Don't touch the Sheet — leave the thread unread for a human to triage.
    console.log('Reply for %s has no STATUS: line; leaving unread.', refId);
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
  // Walk from newest to oldest, skip messages sent from the Catalyst account
  // itself (the original notification + any reminders).
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

  const responder = parseEmailAddress_(fromHeader);
  const patch = {
    'Status': status,
    'Response date': new Date(),
    'Reason': reason || '',
    'Responded by': responder
  };
  patchRow_(sh, row, patch);

  // Email the applicant on a final decision
  if (status === 'Accepted' || status === 'Rejected') {
    const submission = readRowById_(sh, refId);
    notifyApplicant_(submission, status);
  }
}

function notifyApplicant_(s, status) {
  if (!s || !s.Email) return;
  const tpl = (status === 'Accepted') ? acceptEmail(s) : rejectEmail(s);
  GmailApp.sendEmail(s.Email, tpl.subject, tpl.body, {
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
