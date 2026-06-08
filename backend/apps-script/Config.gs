/**
 * RAMP HP — Backend configuration
 *
 * Single place to set IDs, emails and routing rules.
 * Everything that varies between dev/prod lives here.
 */

const CONFIG = {

  // ── Spreadsheet ────────────────────────────────────────────────────────
  // Open the master sheet → URL is .../spreadsheets/d/<THIS_ID>/edit
  SHEET_ID:    '1IpIlL3V3mJ_7X0BIJt1-6Dn4ZNGdzVy5BNY_WM86Mrg',
  SHEET_NAME:  'Submissions',   // ← rename if Zoho writes to a different tab (e.g. "Form Responses 1")

  // ── Programme identity ────────────────────────────────────────────────
  PROGRAMME_NAME: 'RAMP Programme — IIT Mandi Catalyst',
  CATALYST_EMAIL: 'catalyst@iitmandi.ac.in',   // always CC'd; the inbox the script reads
  REPLY_TO:       'catalyst@iitmandi.ac.in',
  PUBLIC_SITE:    'https://rashmi-gupta26.github.io/RAMP_HP/',

  // ── Review timings (days) ─────────────────────────────────────────────
  REVIEW_DEADLINE_DAYS: 21,   // hard deadline for a decision
  REVIEW_PAUSE_DAYS:    10,   // STATUS: REVIEW pauses reminders for this long
  REMINDER_COOLDOWN_DAYS: 7,  // don't re-remind the same row more often than this

  // ── Reference ID format ───────────────────────────────────────────────
  ID_PREFIX: 'RAMP',          // → RAMP-2026-047

  // ── Implementation partners ───────────────────────────────────────────
  // The four agencies that actually review ideas. The `to` address gets the
  // notification email; `aliases` are alternate spellings the Zoho dropdown
  // may produce, normalised to the canonical `name`.
  // Every notification email is sent To: partner, CC: CATALYST_EMAIL.
  PARTNERS: [
    {
      name:    'IIT Mandi Catalyst',
      to:      'rashmi@iitmandicatalyst.in',
      url:     'https://www.iitmandicatalyst.in/',
      aliases: ['iit mandi catalyst', 'catalyst', 'iitmandi catalyst']
    },
    {
      name:    'Skill Labs',
      to:      'himesh.s@skilllabs.net',
      url:     'https://skilllabs.net/',
      aliases: ['skill labs', 'skilllabs', 'skill-labs', 'skilllabs resource services']
    },
    {
      name:    'The Planet Education Society',
      to:      'tpsdm2018@gmail.com',
      url:     'https://theplaneteducation.net/',
      aliases: ['planet education', 'the planet education', 'the planet education institute',
                'planet education society', 'tpei']
    },
    {
      name:    'Regional Centre for Entrepreneurship Development',
      to:      'rcedindia@gmail.com',
      url:     'https://rcedindia.com/',
      aliases: ['rced', 'rced india', 'regional centre for entrepreneurship development']
    }
  ],

  // ── Zoho webhook secret (optional) ────────────────────────────────────
  // If set, the doPost() handler will reject requests whose `?token=` query
  // param does not match. Set the same value when configuring the Zoho
  // webhook URL.
  WEBHOOK_TOKEN: ''
};

/**
 * Resolve a partner name from anything the Zoho form may send.
 * Falls back to the institute → partner mapping (Institutes column) if the
 * dropdown didn't carry a partner directly.
 */
function resolvePartner(partnerOrInstituteName) {
  const needle = String(partnerOrInstituteName || '').trim().toLowerCase();
  if (!needle) return null;

  // direct match against PARTNERS
  for (const p of CONFIG.PARTNERS) {
    if (p.name.toLowerCase() === needle) return p;
    if (p.aliases.some(a => a.toLowerCase() === needle)) return p;
    if (needle.indexOf(p.name.toLowerCase()) !== -1) return p;
  }

  // fall back to the INSTITUTE_TO_PARTNER map (institute name → partner)
  const partnerName = INSTITUTE_TO_PARTNER[needle];
  if (partnerName) {
    return CONFIG.PARTNERS.find(p => p.name === partnerName) || null;
  }

  return null;
}

/**
 * Institute → implementation partner.
 *
 * Mirrors js/data.js — keep in sync when new institutes are added.
 * Keys are lower-cased so resolvePartner() can match case-insensitively.
 */
const INSTITUTE_TO_PARTNER = {
  // Mandi
  'abhilashi university':                                            'IIT Mandi Catalyst',
  'govt industrial training institute dehar':                        'IIT Mandi Catalyst',
  'govt industrial training institute joginder nagar':               'IIT Mandi Catalyst',
  'govt industrial training institute sandhole':                     'IIT Mandi Catalyst',
  'govt industrial training institute paplog':                       'IIT Mandi Catalyst',
  // Kullu
  'govt. iti shamshi':                                               'IIT Mandi Catalyst',
  'industrial training institute (iti) sainj':                       'IIT Mandi Catalyst',
  'government college, banjar':                                      'IIT Mandi Catalyst',
  'govt. industrial training institute patlikuhal':                  'IIT Mandi Catalyst',
  // Lahaul & Spiti
  'govt. degree college, kukumseri':                                 'IIT Mandi Catalyst',
  'govt. industrial training institute rong-tong':                   'IIT Mandi Catalyst',
  'govt. industrial training institute udaipur':                     'IIT Mandi Catalyst',
  'govt. iti karga':                                                 'IIT Mandi Catalyst',
  // Shimla
  'govt. iti sunni':                                                 'The Planet Education Society',
  'govt college nerva':                                              'The Planet Education Society',
  'govt degree college saraswati nagar':                             'The Planet Education Society',
  'atal bihari vajpayee govt. institute of engineering & technology, pragatinagar': 'The Planet Education Society',
  // Sirmaur
  'govt. degree college shillai':                                    'The Planet Education Society',
  'govt. degree college bharali (anjhoj)':                           'The Planet Education Society',
  'govt. degree college kaffota':                                    'The Planet Education Society',
  'govt. degree college sangrah':                                    'The Planet Education Society',
  // Kinnaur
  'govt. sr. sec. school urni':                                      'The Planet Education Society',
  'govt. sr. sec. school reckong peo':                               'The Planet Education Society',
  'govt. sr. sec. school giabong':                                   'The Planet Education Society',
  // Solan
  'iti arki':                                                        'Skill Labs',
  'govt. college dharampur':                                         'Skill Labs',
  'govt. iti krishangarh':                                           'Skill Labs',
  'msme technology centre, baddi':                                   'Skill Labs',
  // Una
  'iti bangana':                                                     'Skill Labs',
  's d college, bhatoli':                                            'Skill Labs',
  'govt. college khad':                                              'Skill Labs',
  'br ambedkar govt. polytechnic, ambota':                           'Skill Labs',
  // Hamirpur
  'sidharth govt college, nadaun':                                   'Skill Labs',
  'govt. iti bhoranj':                                               'Skill Labs',
  'college of horticulture & forestry, neri':                        'Skill Labs',
  'govt. college barsar':                                            'Skill Labs',
  // Bilaspur
  'govt. iti berthin':                                               'Regional Centre for Entrepreneurship Development',
  'govt. iti shri naina devi ji':                                    'Regional Centre for Entrepreneurship Development',
  'govt. college jukhala':                                           'Regional Centre for Entrepreneurship Development',
  'govt. hydro engineering college, bandla':                         'Regional Centre for Entrepreneurship Development',
  // Chamba
  'rajiv gandhi govt. polytechnic college banikhet':                 'Regional Centre for Entrepreneurship Development',
  'batt private iti bhonkharimorh':                                  'Regional Centre for Entrepreneurship Development',
  'govt. iti chamba':                                                'Regional Centre for Entrepreneurship Development',
  'govt. iti salooni':                                               'Regional Centre for Entrepreneurship Development',
  'govt. iti garnota':                                               'Regional Centre for Entrepreneurship Development',
  // Kangra
  'rajiv gandhi govt. engg. college, nagrota bagwan':                'Regional Centre for Entrepreneurship Development',
  'govt. iti nehran pukhar':                                         'Regional Centre for Entrepreneurship Development',
  'govt. industrial training institute (iti) shahpur':               'Regional Centre for Entrepreneurship Development',
  'wazir ram singh government college, dehri':                       'Regional Centre for Entrepreneurship Development'
};
