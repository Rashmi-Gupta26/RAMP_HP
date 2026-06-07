# Zoho Form → Apps Script field mapping

The Apps Script webhook (`doPost` in `Code.gs`) reads the keys below from
the Zoho payload and writes them into the matching Google Sheet column.
Anything not listed is ignored, so adding new fields to the form is safe.

Zoho field names are derived from the form **label** by replacing spaces
with underscores (Zoho's default). If you customise the field name in
Zoho's "Field Properties → Field Link Name" pane, mirror that exact name
in `ZOHO_FIELD_MAP` inside [`Code.gs`](../apps-script/Code.gs).

| Zoho field link name | Sheet column | Required |
|---|---|---|
| `Name` | Name | ✅ |
| `Phone` | Phone | ✅ |
| `Email` | Email | ✅ |
| `Address` | Address | ✅ |
| `Gender` | Gender | |
| `Date_of_birth` | Date of birth | |
| `Age` | Age | (auto-derived if missing) |
| `District` | District | ✅ — drives partner routing |
| `Institutes` | Institute | ✅ — drives partner routing |
| `Institutes_name` | Institute (free-text fallback) | |
| `Idea_title` | Idea title | ✅ |
| `Provide_a_short_description_of_your_idea` | Idea description | ✅ |
| `Current_status_of_your_startup_business` | Startup status | |
| `Which_sector_does_your_startup_belong_to` | Sector | |
| `What_is_the_current_stage_of_your_startup` | Startup stage | |
| `Have_you_done_any_research_related_to_this_idea` | Prior research | |
| `Have_you_tried_making_your_product` | Prototype made | |
| `Have_you_made_any_sample_or_model_of_your_product` | Sample / model | |
| `How_did_you_do_the_testing_of_your_product` | Testing method | |
| `What_feedback_did_you_receive` | Feedback received | |
| `Is_this_commercialised` | Commercialised | |
| `Are_you_currently_earning_from_this_business` | Currently earning | |
| `Who_are_your_customers` | Customers | |
| `How_do_you_sell_your_product_service` | Sales method | |
| `Do_you_have_a_team` | Team | |
| `What_support_do_you_need_right_now` | Support needed now | |
| `What_kind_of_support_do_you_need_from_the_RAMP_Program` | Support from RAMP | |
| `Have_you_been_part_of_any_incubation_earlier` | Prior incubation | |

## Webhook URL

In Zoho Forms → **Integrations → Webhooks** add a new webhook:

- **URL:** `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?token=<WEBHOOK_TOKEN>`
- **Method:** `POST`
- **Content type:** `application/x-www-form-urlencoded` *(Zoho default — supported)*
  *or* `application/json` *(also supported)*
- **Module:** `On form submit`

The `?token=` query parameter is only required if you set
`CONFIG.WEBHOOK_TOKEN` in [`Config.gs`](../apps-script/Config.gs).

## Verifying

After submitting the form once you should see:

1. A new row at the bottom of the **Submissions** sheet, status `Pending`.
2. An email in the Catalyst inbox addressed to the matching implementation
   partner, with the district head + Catalyst on CC.
3. The dashboard ([dashboard.html](../../dashboard.html)) showing the new row
   on the next page load (once `SHEET_CSV_URL` is configured).
