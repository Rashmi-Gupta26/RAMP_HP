# Zoho → Google Sheet → Apps Script field mapping

Zoho's native Google Sheets integration writes one row per submission
directly into the master sheet. The Apps Script reads those columns by
**header label**, so the script does not care about column order — only
about the exact label string.

## Live mapping (canonical field → Zoho header)

This table mirrors the `ZOHO_HEADER` constant in
[`Sheet.gs`](../apps-script/Sheet.gs). If you change a Zoho field label,
update the matching **value** here and the script picks it up on its next
run.

| Canonical field (used everywhere in code) | Exact Zoho header in the sheet |
|---|---|
| `Added time`           | `Added Time` |
| `Name`                 | `Name` |
| `Phone`                | `Phone` |
| `Email`                | `Email` |
| `Address`              | `Address` |
| `Gender`               | `Gender` |
| `Date of birth`        | `Date of birth` |
| `Age`                  | `Age` |
| `District`             | `District` |
| `Institute`            | `Institutes` |
| `Institute fallback`   | `Institues name` *(sic — Zoho typo)* |
| `Idea title`           | `Idea title` |
| `Idea description`     | `Provide a short description of your idea` |
| `Startup status`       | `Current Status of Your Startup/Business` |
| `Sector`               | `which sector does your startup belong to` |
| `Startup stage`        | `What is the current stage of your startup` |
| `Prior research`       | `Have you done any research related to this idea?` |
| `Prototype made`       | `Have your tried making your product ?` *(sic — Zoho typo)* |
| `Sample / model`       | `Have you made any sample or model of your product ?` |
| `Testing method`       | `How did you do the testing of your product ?` |
| `Feedback received`    | `What feedback did you receive?` |
| `Commercialised`       | `Is this commercialised?` |
| `Currently earning`    | `Are you currently earning from this business?` |
| `Customers`            | `Who are your customers?` |
| `Sales method`         | `How do you sell your product/service?` |
| `Sales method future`  | `How will you sell your product/service ?` |
| `Team`                 | `Do you have a team?` |
| `Support needed now`   | `What support do you need right now ?` |
| `Support from RAMP`    | `What kind of support do you need from the RAMP Program?` |
| `Prior incubation`     | `Have you been part of any incubation earlier` |

The `IP Address` column Zoho also writes is ignored — it isn't read or
forwarded anywhere.

## Metadata columns the script adds

`processNewSubmissions()` appends these to the right of Zoho's columns the
first time it runs:

| Column | Filled by |
|---|---|
| `ID` | ingest — `RAMP-YYYY-NNN` |
| `Implementation partner` | ingest — resolved from `Institutes` |
| `Status` | ingest = `Pending`, then reply scanner |
| `Response date` | reply scanner |
| `Reason` | reply scanner |
| `Responded by` | reply scanner |
| `Last reminder sent` | reminder job |
| `last_updated` | every script-driven write |

## Verifying after a Zoho submission

1. New row at the bottom of the Sheet, fully filled by Zoho.
2. Within ~1 minute: row gains `ID`, `Implementation partner`,
   `Status = Pending`, `last_updated`.
3. Email lands in the Catalyst sent folder, addressed to the partner
   resolved from the Institutes dropdown, CCing Catalyst.
4. Dashboard (when `SHEET_CSV_URL` is set) shows the row on next load.
