# Switching to the new master sheet

New sheet: `1uIdfhMsojuT2Uanqr0bOkYiSZF6KmK92_wgzgGANjik`
URL: https://docs.google.com/spreadsheets/d/1uIdfhMsojuT2Uanqr0bOkYiSZF6KmK92_wgzgGANjik/edit

What I already changed in the codebase:

- **`Config.gs`** — `SHEET_ID` now points at the new sheet, and a new `DASHBOARD_SHEET_NAME: 'Dashboard'` constant was added.
- **`Sheet.gs`** — `ZOHO_HEADER` now reads `'Choose your District'` and `'Choose your Institutes'` (the new Zoho labels). After a status patch it also calls `rebuildDashboardTab()` so the publishable view stays in sync.
- **`Dashboard.gs`** — new file. Builds a clean "Dashboard" tab from the canonical columns. That tab is what gets published as CSV (the raw Submissions tab has PII, IP addresses, and duplicate columns — we never publish it directly).

What **you** need to do (5 minutes, all in the browser):

---

## 1. Open the Apps Script project

`Extensions → Apps Script` from the new sheet (or push these files via `clasp`). Make sure all six files are present:

```
Code.gs  Config.gs  Dashboard.gs  EmailTemplates.gs  Mail.gs
Reminders.gs  Replies.gs  Sheet.gs  SheetIngest.gs  appsscript.json
```

## 2. Make sure the tab the Zoho form writes to is called `Submissions`

If Zoho is writing to a tab named `Form Responses 1`, either rename it to `Submissions` **or** change `CONFIG.SHEET_NAME` in `Config.gs` to match.

## 3. Build the Dashboard tab

In the Apps Script editor:

1. Open `Dashboard.gs`.
2. From the function dropdown choose **`rebuildDashboardTab`**, then click **Run**. Authorise if prompted.
3. Switch back to the spreadsheet — there should now be a new tab called **Dashboard** with exactly these 8 columns (the minimum set the public table needs — no phone, email, idea text, or reviewer notes):

```
ID │ Added time │ Name │ District │
Implementation partner │ Sector │ Status │ Response date
```

4. From the same dropdown choose **`installDashboardTrigger`** and click **Run** once. That installs a 5-minute background trigger that keeps the tab fresh (and it also rebuilds instantly on every status change).

> **No formula needed** — the script populates the tab. If you'd rather use a sheet-side formula instead of the script, see "Formula-only alternative" at the bottom.

## 4. Publish the Dashboard tab as CSV

In the spreadsheet:

1. Click the **Dashboard** tab so it's the active sheet.
2. `File → Share → Publish to web`
3. In the dropdown that says "Entire document", pick **Dashboard** (just that one tab).
4. In the format dropdown pick **Comma-separated values (.csv)**.
5. Click **Publish** → **Confirm**.
6. Copy the URL Google shows you. It will look like:

```
https://docs.google.com/spreadsheets/d/e/<long-token>/pub?gid=<number>&single=true&output=csv
```

## 5. Wire that URL into the dashboard

Open `/dashboard.html` and replace the existing `SHEET_CSV_URL` constant (around line 294) with the URL from step 4.

Commit + push and the live dashboard at https://rashmi-gupta26.github.io/RAMP_HP/dashboard.html will read from the new sheet on its next load.

## 6. (Optional but recommended) Re-wire the Zoho webhook

If you re-deployed the script as a new web-app version, update the Zoho form's webhook URL to the new `/exec` URL. If you redeployed to the same version, no change needed.

---

## Formula-only alternative (no Apps Script needed for the Dashboard tab)

If for any reason you prefer the Dashboard tab to be a pure spreadsheet formula instead of script-driven, create a tab called `Dashboard` and put this single formula in cell **A1**:

```excel
={
  {"ID","Added time","Name","District","Implementation partner","Sector","Status","Response date"};
  ARRAYFORMULA(
    IFERROR(
      QUERY(
        Submissions!A2:AZ,
        "SELECT "
          & "Col" & MATCH("ID",                                       Submissions!A1:AZ1, 0) & ", "
          & "Col" & MATCH("Added Time",                               Submissions!A1:AZ1, 0) & ", "
          & "Col" & MATCH("Name",                                     Submissions!A1:AZ1, 0) & ", "
          & "Col" & MATCH("Choose your District",                     Submissions!A1:AZ1, 0) & ", "
          & "Col" & MATCH("Implementation partner",                   Submissions!A1:AZ1, 0) & ", "
          & "Col" & MATCH("which sector does your startup belong to", Submissions!A1:AZ1, 0) & ", "
          & "Col" & MATCH("Status",                                   Submissions!A1:AZ1, 0) & ", "
          & "Col" & MATCH("Response date",                            Submissions!A1:AZ1, 0)
          & " WHERE Col" & MATCH("ID", Submissions!A1:AZ1, 0) & " IS NOT NULL",
        0
      ),
      ""
    )
  )
}
```

The `MATCH` calls find each Zoho column by header name, so this formula keeps working even if Zoho reorders columns. Headers row 1 stays hard-coded so the CSV always has the schema the dashboard expects. Phone, email, idea title/description, reason, and reviewer notes are deliberately omitted — they stay on the private Submissions tab.

If you go this route, **skip steps 3 (the script run) and the script-trigger**, then continue with step 4 onward. The Dashboard tab updates the instant Zoho writes a new row.
