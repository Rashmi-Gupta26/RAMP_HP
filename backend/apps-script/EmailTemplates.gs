/**
 * Plain-text email bodies. Kept plain so they render the same in every
 * client (and so the script can parse its own replies reliably).
 */

const REPLY_INSTRUCTIONS = [
  '',
  'HOW TO RESPOND',
  'Click Reply All and write your decision on the first line in this format:',
  '',
  '  STATUS: ACCEPT   — invite the applicant for incubation',
  '  STATUS: REJECT   — decline the application (reason required)',
  '  STATUS: REVIEW   — you need more time but have begun evaluating',
  '',
  'On the next line, add a short reason:',
  '  REASON: Strong local market fit; will invite for Phase B visit.',
  '',
  'IMPORTANT: Use Reply All, not Reply, so that IIT Mandi Catalyst stays',
  'copied. A reply sent only to your own address will NOT be recorded.'
].join('\n');

function fmtDate_(d) {
  if (!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  return Utilities.formatDate(dt, 'Asia/Kolkata', 'dd MMM yyyy');
}

function pad_(label, value, width) {
  const w = width || 18;
  return label.padEnd(w) + (value == null ? '' : String(value));
}

/** Notification email to the implementation partner. */
function notificationEmail(submission) {
  const s = submission;
  const deadline = new Date(s['Added time']);
  deadline.setDate(deadline.getDate() + CONFIG.REVIEW_DEADLINE_DAYS);

  const subject = `[${s.ID}] New idea submission — ${s.District} District`;

  const body = [
    `Dear ${s['Implementation partner']} team,`,
    '',
    'A new idea has been submitted under the RAMP programme for your centre.',
    '',
    '─── REFERENCE ───────────────────────────────────',
    pad_('Reference ID:',    s.ID),
    pad_('Submitted on:',    fmtDate_(s['Added time'])),
    pad_('Review deadline:', `${fmtDate_(deadline)} (${CONFIG.REVIEW_DEADLINE_DAYS} days)`),
    '',
    '─── APPLICANT ───────────────────────────────────',
    pad_('Name:',     s.Name),
    pad_('Phone:',    s.Phone),
    pad_('Email:',    s.Email),
    pad_('Address:',  s.Address),
    pad_('Gender:',   `${s.Gender || '—'}      Age: ${s.Age || '—'}`),
    pad_('District:', s.District),
    '',
    '─── IDEA ────────────────────────────────────────',
    pad_('Title:',         s['Idea title']),
    pad_('Description:',   s['Idea description']),
    pad_('Sector:',        s.Sector),
    pad_('Startup stage:', s['Startup stage']),
    pad_('Current status:',s['Startup status']),
    '',
    '─── RESEARCH & VALIDATION ───────────────────────',
    pad_('Prior research:',    s['Prior research']),
    pad_('Prototype made:',    s['Prototype made']),
    pad_('Sample / model:',    s['Sample / model']),
    pad_('Testing method:',    s['Testing method']),
    pad_('Feedback received:', s['Feedback received']),
    pad_('Commercialised:',    s.Commercialised),
    pad_('Currently earning:', s['Currently earning']),
    '',
    '─── MARKET ──────────────────────────────────────',
    pad_('Customers:',    s.Customers),
    pad_('Sales method:', s['Sales method']),
    '',
    '─── TEAM & SUPPORT ──────────────────────────────',
    pad_('Has a team:',         s.Team),
    pad_('Support needed now:', s['Support needed now']),
    pad_('Support from RAMP:',  s['Support from RAMP']),
    pad_('Prior incubation:',   s['Prior incubation']),
    '',
    '─────────────────────────────────────────────────',
    '',
    `Please review and respond within ${CONFIG.REVIEW_DEADLINE_DAYS} days by clicking Reply All on this`,
    'email, following the instructions below.',
    '',
    'Regards,',
    CONFIG.PROGRAMME_NAME,
    REPLY_INSTRUCTIONS
  ].join('\n');

  return { subject, body };
}

/** Daily reminder for an overdue Pending row. */
function reminderEmail(submission) {
  const s = submission;
  const ageDays = Math.floor((Date.now() - new Date(s['Added time']).getTime()) / 86400000);

  const subject = `[${s.ID}] Reminder: review overdue — ${s.District} District`;
  const body = [
    `Dear ${s['Implementation partner']} team,`,
    '',
    `Reference ${s.ID} (submitted on ${fmtDate_(s['Added time'])}) is now ${ageDays} days`,
    `old and has not yet received a decision. The ${CONFIG.REVIEW_DEADLINE_DAYS}-day review window has passed.`,
    '',
    `Applicant: ${s.Name} — ${s['Idea title']}`,
    `District:  ${s.District}`,
    '',
    'Please respond by clicking Reply All on the original notification email',
    `(subject still contains ${s.ID}). If you have begun evaluating, reply`,
    'with STATUS: REVIEW to pause this reminder for a further',
    `${CONFIG.REVIEW_PAUSE_DAYS} days.`,
    '',
    'Regards,',
    CONFIG.PROGRAMME_NAME,
    REPLY_INSTRUCTIONS
  ].join('\n');

  return { subject, body };
}

/** Applicant-facing accept email. */
function acceptEmail(submission) {
  const s = submission;
  return {
    subject: `[${s.ID}] Your RAMP idea has been accepted for incubation`,
    body: [
      `Dear ${s.Name},`,
      '',
      'Congratulations! Your idea submitted to the RAMP programme has been',
      'accepted for incubation by your implementation partner:',
      '',
      `   ${s['Implementation partner']}`,
      '',
      `Reference ID:  ${s.ID}`,
      `Idea:          ${s['Idea title']}`,
      `District:      ${s.District}`,
      '',
      s.Reason ? `Reviewer note: ${s.Reason}\n` : '',
      'Your local centre will contact you shortly with the next steps,',
      'including the Phase B exposure visit at IIT Mandi.',
      '',
      'If you have questions in the meantime, you may reply to this email.',
      '',
      'Regards,',
      CONFIG.PROGRAMME_NAME,
      CONFIG.PUBLIC_SITE
    ].join('\n')
  };
}

/** Applicant-facing reject email. */
function rejectEmail(submission) {
  const s = submission;
  return {
    subject: `[${s.ID}] Update on your RAMP idea submission`,
    body: [
      `Dear ${s.Name},`,
      '',
      'Thank you for submitting your idea to the RAMP programme.',
      '',
      `Reference ID:  ${s.ID}`,
      `Idea:          ${s['Idea title']}`,
      `District:      ${s.District}`,
      `Reviewed by:   ${s['Implementation partner']}`,
      '',
      'After review, your implementation partner has decided not to take this',
      'idea forward at this stage.',
      '',
      s.Reason ? `Reason: ${s.Reason}\n` : '',
      'This is not the end of the road. You are welcome to refine the idea',
      'and resubmit, or to apply with a different idea — the form is always',
      'open at:',
      `   ${CONFIG.PUBLIC_SITE}submit.html`,
      '',
      'Regards,',
      CONFIG.PROGRAMME_NAME
    ].join('\n')
  };
}
