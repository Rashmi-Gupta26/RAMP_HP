# RAMP HP — Backend

Serverless backend for the RAMP Himachal Pradesh website. There is no
server to maintain. Zoho writes form submissions straight into a Google
Sheet via its native integration; an Apps Script project bolted to that
same Sheet handles ID assignment, partner emails, reply parsing and the
21-day reminder.

```
Innovator → Zoho Form ──native integration──►  Google Sheet
                                                    │
                                                    ▼
                              Apps Script (every 1 min)
                              processNewSubmissions()
                                  ├─► fills ID, Status=Pending, last_updated
                                  └─► emails partner (CC: Catalyst)

Partner replies (Reply All) ─►  Apps Script (every 10 min)
                              scanInboxForReplies()
                                  ├─► Sheet (Status, Reason, Response date)
                                  └─► Gmail (Accept/Reject email to applicant)

Daily 09:00 IST              ─►  sendOverdueReminders()
                                  └─► Gmail (reminder for Pending > 21 days)

Dashboard (dashboard.html) ──fetch CSV──►  Google Sheet (Published to web)
```

The Sheet stays **the single source of truth**. Every status change is
written into the Sheet first. The public website only ever reads from it.

## Repo layout

| Path | Purpose |
|---|---|
| [`apps-script/Code.gs`](apps-script/Code.gs) | Trigger installer + optional `doPost` webhook (curl smoke tests) |
| [`apps-script/Config.gs`](apps-script/Config.gs) | All IDs, partner addresses, timings, test-mode flag — **edit this first** |
| [`apps-script/Sheet.gs`](apps-script/Sheet.gs) | Header-driven sheet access; canonical ↔ Zoho header translation table |
| [`apps-script/SheetIngest.gs`](apps-script/SheetIngest.gs) | `processNewSubmissions()` — assigns IDs, sends notifications |
| [`apps-script/EmailTemplates.gs`](apps-script/EmailTemplates.gs) | Notification / reminder / accept / reject email bodies |
| [`apps-script/Mail.gs`](apps-script/Mail.gs) | `sendMail_()` chokepoint — honours `TEST_REDIRECT_EMAIL` |
| [`apps-script/Replies.gs`](apps-script/Replies.gs) | Gmail reply scanner — parses `STATUS:` / `REASON:` lines |
| [`apps-script/Reminders.gs`](apps-script/Reminders.gs) | 21-day reminder job (respects `STATUS: REVIEW` pause) |
| [`apps-script/appsscript.json`](apps-script/appsscript.json) | Manifest with OAuth scopes + timezone |
| [`sheet/master-template.csv`](sheet/master-template.csv) | Reference of the canonical column block the script owns |
| [`zoho/field-mapping.md`](zoho/field-mapping.md) | Zoho header → canonical field name reference |

## Deploy

### 1. Confirm the Sheet

The master Sheet is already created and Zoho writes to it. SHEET_ID is
pre-filled in [`Config.gs`](apps-script/Config.gs). Confirm:

- Open the Sheet
- Note the **tab name** that Zoho writes to (default is `Sheet1` — Zoho
  sometimes creates `Form Responses 1`). Set `CONFIG.SHEET_NAME` to
  whatever it actually is, or leave it: the script falls back to the
  first tab if the name doesn't match.

### 2. Create the Apps Script project (bound to the Sheet)

Bound to the Sheet — **not** standalone — so OAuth scopes are scoped
to that single file:

1. In the Sheet: **Extensions → Apps Script**.
2. Delete the default `Code.gs`, then create one file per `.gs` here:
   `Code`, `Config`, `Sheet`, `SheetIngest`, `EmailTemplates`, `Replies`,
   `Reminders`. Paste contents.
3. Open the manifest (gear → "Show appsscript.json in editor") and
   replace it with [`appsscript.json`](apps-script/appsscript.json).
4. In `Config.gs`:
   - confirm `SHEET_ID` matches the URL of the Sheet
   - confirm `PARTNERS[*].to` addresses are correct (the four
     implementation-partner inboxes — currently the addresses Catalyst
     provided)
   - confirm `CATALYST_EMAIL` matches the Google account that deploys
     the script (this is the CC on every email and the inbox the
     reply scanner reads)
   - decide whether you are testing or going live — see the next
     section for the `TEST_REDIRECT_EMAIL` toggle

### 3. Authorise & install triggers

1. In the editor, select function `installTriggers` → **Run**.
2. Apps Script will ask for permission to access Sheets + Gmail. Accept.
3. Confirm three triggers under the clock icon:
   - `processNewSubmissions` — every 1 minute
   - `scanInboxForReplies` — every 10 minutes
   - `sendOverdueReminders` — daily 09:00 IST

The first time `processNewSubmissions` runs it also **appends the 8
metadata columns** (`ID`, `Implementation partner`, `Status`, …) to the
right of Zoho's columns. No manual schema work is required.

### 4. Publish the Sheet as CSV (for the dashboard)

1. In the Sheet: **File → Share → Publish to web**.
2. Entire Document → **Comma-separated values (.csv)** → Publish.
3. Copy the URL.
4. Paste it into [`dashboard.html`](../dashboard.html), replacing the
   empty string after `const SHEET_CSV_URL =`.
5. Commit & push — GitHub Pages will redeploy and the dashboard will
   go live.

**Privacy note:** the published CSV is anonymously readable by anyone
who has the URL. The dashboard's password gate only hides the UI — it
does not protect the CSV. If applicant PII (phone, email, address) is
a concern, publish a sanitised tab driven by a `=QUERY()` formula
instead of the raw Submissions tab.

## Test mode vs go-live

`CONFIG.TEST_REDIRECT_EMAIL` is the single switch that toggles the
backend between testing and production. Every outgoing email — partner
notifications, reminders, and applicant Accept/Reject — flows through
`sendMail_()` in [`Mail.gs`](apps-script/Mail.gs), which honours this
flag.

### Test mode (default)

`TEST_REDIRECT_EMAIL: 'rashmi@iitmandicatalyst.in'` — every message is
diverted to this address with a `[TEST → was To:… CC:…]` banner
prepended to the subject. Run real Zoho submissions end-to-end, send
real STATUS: replies, watch the dashboard update — no mail ever
reaches partners or applicants. Sheet state still updates normally.

### Going live

1. Open `Config.gs`.
2. Set `TEST_REDIRECT_EMAIL: ''` (empty string).
3. Confirm `CATALYST_EMAIL` and `REPLY_TO` match the deploying account
   (e.g. update both to `catalyst@iitmandi.ac.in` if Catalyst takes
   ownership; see "Migrating ownership" below).
4. Save — Apps Script picks up Config changes on the next invocation,
   no redeploy needed.

### Migrating ownership (rashmi@iitmandicatalyst.in → catalyst@iitmandi.ac.in)

Apps Script always runs as the deploying account. To hand over:

1. In the Apps Script editor: **Share → add `catalyst@iitmandi.ac.in`
   as Editor**.
2. From the new account: **Deploy → Manage deployments → Edit → New
   version → Deploy** (signs the deployment as the catalyst account).
3. From the new account: select function `installTriggers` → **Run**
   to re-create the three time-based triggers under the new ownership.
4. From the old (rashmi) account: open the trigger list (clock icon)
   and delete the three triggers that still belong to it — otherwise
   two scripts will both try to process the sheet.
5. Update `CATALYST_EMAIL` and `REPLY_TO` in `Config.gs` to
   `catalyst@iitmandi.ac.in`.

## How it stays consistent

- **Sheet first.** Every status change (script or hand-typed) goes
  through the Sheet. The website is read-only.
- **Reference ID is the join key.** The `[RAMP-2026-NNN]` token in the
  subject line links every email back to its row. Don't edit subjects.
- **Reply All, not Reply.** The reply scanner reads the Catalyst inbox,
  so partners must keep `catalyst@iitmandi.ac.in` on the recipient list.
- **`last_updated` column.** Surfaced on the dashboard so officials know
  the snapshot is live.
- **Header-driven, not positional.** [`Sheet.gs`](apps-script/Sheet.gs)
  looks up columns by their literal Zoho header label. If Catalyst
  renames a Zoho form field, update the matching value in `ZOHO_HEADER`.

## Test the ingest manually

After installing triggers, in the Apps Script editor:

1. Hand-fill a row in the sheet matching Zoho's header layout (or just
   submit the live Zoho form).
2. Wait up to a minute, **or** run `processNewSubmissions` directly.
3. Verify:
   - the new row has an `ID` (e.g. `RAMP-2026-001`)
   - `Implementation partner` is populated
   - `Status = Pending`
   - the notification email shows up in the Catalyst Sent folder

## Rehearse a reply

1. Reply All to the notification email with body:
   ```
   STATUS: ACCEPT
   REASON: Strong local market fit; will invite for Phase B visit.
   ```
2. Wait up to 10 minutes, **or** run `scanInboxForReplies` directly.
3. Sheet row: `Status = Accepted`, `Response date`, `Reason`,
   `Responded by` all filled, applicant should receive an acceptance email.

## Local testing without Zoho

The `doPost` endpoint is retained as a curl-friendly fallback (handy
for CI smoke tests or QA without touching the live Zoho form):

```bash
curl -X POST 'https://script.google.com/macros/s/<DEPLOY_ID>/exec?token=<WEBHOOK_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "Name":          "Test Applicant",
    "Phone":         "9876543210",
    "Email":         "test@example.com",
    "Address":       "Village Test, Mandi, HP 175001",
    "District":      "Mandi",
    "Institute":     "Govt Industrial Training Institute Joginder Nagar",
    "Idea title":    "Test idea",
    "Idea description": "Just a smoke test."
  }'
```

The webhook appends a row, then immediately runs `processNewSubmissions`
so the test response includes a freshly-assigned ID.

## Adding a new institute

1. Append it to [`js/data.js`](../js/data.js) (with the right `agency`).
2. Add a lower-cased entry to `INSTITUTE_TO_PARTNER` in
   [`Config.gs`](apps-script/Config.gs).
3. Add the institute name to the **Institutes** dropdown in the Zoho form.
4. No script redeploy needed — Apps Script picks up the new config on its
   next invocation.

## Adding a new implementation partner

1. Append a `{ name, to, url, aliases }` entry to `CONFIG.PARTNERS` in
   [`Config.gs`](apps-script/Config.gs).
2. Mirror the same canonical name in `PARTNERS` inside
   [`dashboard.html`](../dashboard.html) so the dashboard cards display it.
3. Add all new institute → partner rows to `INSTITUTE_TO_PARTNER`.

## Renaming a Zoho form field

The script is header-driven. If you rename a question in the Zoho form,
the matching column header in the Sheet changes too — find the
corresponding canonical entry in `ZOHO_HEADER` (in
[`Sheet.gs`](apps-script/Sheet.gs)) and update its **value** to the new
header label. No other file changes.
