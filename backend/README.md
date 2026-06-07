# RAMP HP — Backend

Serverless backend for the RAMP Himachal Pradesh website. There is no
server to maintain: a Zoho form posts to a Google Apps Script web app,
which writes to a Google Sheet (the single source of truth), emails the
implementation partner, scans replies, and runs the 21-day reminder.
The GitHub Pages site reads the published Sheet CSV.

```
Innovator → Zoho Form  ──webhook──►  Apps Script (doPost)
                                         │
                                         ├─► Google Sheet  (single source of truth)
                                         └─► Gmail  (notification to partner, CC district head + Catalyst)

Partner replies (Reply All) ──►  Apps Script (scanInboxForReplies, every 10 min)
                                         ├─► Sheet  (Status, Reason, Response date)
                                         └─► Gmail  (Accept/Reject email to applicant)

Daily 09:00 IST                ──►  Apps Script (sendOverdueReminders)
                                         └─► Gmail  (reminder if pending > 21 days)

Dashboard (dashboard.html) ──fetch CSV──►  Google Sheet (Published to web)
```

## Repo layout

| Path | Purpose |
|---|---|
| [`apps-script/Code.gs`](apps-script/Code.gs) | `doPost` webhook + Zoho field normalisation + trigger installer |
| [`apps-script/Config.gs`](apps-script/Config.gs) | All IDs, partner addresses, district heads, timings — edit this first |
| [`apps-script/Sheet.gs`](apps-script/Sheet.gs) | Sheet column layout + ID generation + row helpers |
| [`apps-script/EmailTemplates.gs`](apps-script/EmailTemplates.gs) | Notification / reminder / accept / reject email bodies |
| [`apps-script/Replies.gs`](apps-script/Replies.gs) | Gmail reply scanner — parses `STATUS:` / `REASON:` lines |
| [`apps-script/Reminders.gs`](apps-script/Reminders.gs) | 21-day reminder job (respects `STATUS: REVIEW` pause) |
| [`apps-script/appsscript.json`](apps-script/appsscript.json) | Manifest with OAuth scopes + timezone |
| [`sheet/master-template.csv`](sheet/master-template.csv) | Headers (+ 1 sample row) — import this into a blank Sheet |
| [`zoho/field-mapping.md`](zoho/field-mapping.md) | Zoho field link names → Sheet columns |

## Deploy

### 1. Create the Google Sheet

1. Create a new Sheet from the [`sheet/master-template.csv`](sheet/master-template.csv)
   (File → Import → Upload → Replace spreadsheet).
2. Rename the tab to `Submissions`.
3. Copy the Sheet ID from the URL: `.../spreadsheets/d/`**`THIS_LONG_STRING`**`/edit`.

### 2. Create the Apps Script project

1. From the Sheet: **Extensions → Apps Script**.
2. Delete the default `Code.gs`, then create a file for each `.gs` here
   (`Code`, `Config`, `Sheet`, `EmailTemplates`, `Replies`, `Reminders`)
   and paste contents.
3. Open the manifest (gear icon → "Show appsscript.json in editor") and
   replace it with [`appsscript.json`](apps-script/appsscript.json).
4. In `Config.gs`:
   - set `SHEET_ID` to the ID from step 1
   - replace the `DISTRICT_HEADS` placeholders with real DIC email addresses
   - confirm `PARTNERS[*].to` addresses are correct (defaults are sourced
     from each partner's public website)
   - optionally set `WEBHOOK_TOKEN` to a random secret

### 3. Authorise & install triggers

1. In the editor, select function `installTriggers` → **Run**.
2. Apps Script will ask for permission to access Sheets + Gmail. Accept.
3. After it completes, you'll have two triggers under the clock icon:
   - `scanInboxForReplies` — every 10 minutes
   - `sendOverdueReminders` — daily at 09:00 IST

### 4. Deploy as a web app

1. **Deploy → New deployment**.
2. Type = **Web app**, Execute as = **Me**, Who has access = **Anyone**.
3. Copy the resulting `/exec` URL — this is the webhook endpoint.

### 5. Wire the Zoho form

In Zoho Forms (the form used in [`submit.html`](../submit.html), perma
`ctfU9L6P8jDev-Ru43Ib0SkLSw4dlcSHksoS3a2lC6g`):

1. **Integrations → Webhooks → New Webhook**
2. URL = your `/exec` URL (append `?token=<WEBHOOK_TOKEN>` if you set one)
3. Method = `POST`, Module = `On form submit`
4. Map fields per [`zoho/field-mapping.md`](zoho/field-mapping.md) — for
   most fields the default "Field Link Name" already matches.

Test by submitting once. You should see:
- a new row at the bottom of the Sheet (status `Pending`)
- a notification email in the Catalyst inbox

### 6. Publish the Sheet as CSV (for the dashboard)

1. In the Sheet: **File → Share → Publish to web**
2. Entire Document → **Comma-separated values (.csv)** → Publish.
3. Copy the URL.
4. Paste it into [`dashboard.html`](../dashboard.html), replacing the empty
   string after `const SHEET_CSV_URL =`.
5. Commit & push — GitHub Pages will redeploy and the dashboard will go live.

## How it stays consistent

- **Sheet first.** Every status change (script or hand-typed) flows through
  the Sheet. The website is read-only.
- **Reference ID is the join key.** The `[RAMP-2026-NNN]` token in the
  subject line links every email back to its row. Don't edit subject lines.
- **Reply All, not Reply.** The reply scanner reads the Catalyst inbox, so
  partners must keep `catalyst@iitmandi.ac.in` on the recipient list.
- **`last_updated` column.** Surfaced on the dashboard so officials know
  the snapshot is live.

## Local testing without Zoho

You can drive the webhook directly with `curl`:

```bash
curl -X POST 'https://script.google.com/macros/s/<DEPLOY_ID>/exec?token=<WEBHOOK_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "Name": "Test Applicant",
    "Phone": "9876543210",
    "Email": "test@example.com",
    "Address": "Village Test, Mandi, HP 175001",
    "District": "Mandi",
    "Institutes": "Govt Industrial Training Institute Joginder Nagar",
    "Idea_title": "Test idea",
    "Provide_a_short_description_of_your_idea": "Just a webhook smoke test."
  }'
```

Expected response: `{"ok":true,"id":"RAMP-2026-NNN"}`.

To rehearse the reply scanner from the editor:

1. Send yourself a Reply All to the notification email with
   `STATUS: ACCEPT` and `REASON: …` in the body.
2. Open the script editor → run `scanInboxForReplies` manually.
3. Check the Sheet row's `Status`, `Response date`, `Reason`, `Responded by`.

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
