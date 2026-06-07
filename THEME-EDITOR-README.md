# RAMP Theme Editor

Internal tool for the RAMP Himachal website. Lets anyone on the team change
colours and fonts across the site visually, without writing CSS.

The editor is a single self-contained file — [`theme-editor.html`](theme-editor.html).
Double-click to open it; no installs, no servers, no terminal.

---

## Quick start

1. Make sure `theme-editor.html` is sitting in the project root (next to
   `index.html` and the `css/` folder).
2. **Double-click `theme-editor.html`** or right click and open with Chrome if you are a Mac user — it opens in your browser.
3. On first open you'll see a welcome dialog. Click **Connect folder**, then
   choose the project folder (the one containing `theme-editor.html`), then
   click **Allow** when the browser asks for edit permission.
4. Make your changes. The preview on the right updates live.
5. Click **Apply changes to CSS file** when you're happy.
6. Reload the site to see the change in production.

That's the whole loop. Future opens skip steps 3 and grant access automatically.

---

## What it can change

The editor edits two things in `css/styles.css`:

- **Colours** — every CSS custom property in `:root` (page background, paper,
  ink, teal, clay, gold, leaf, maroon, etc.) is exposed as a colour picker.
- **Fonts** — different fonts can be assigned to different sections of the
  site (body, H1, H2, H3, H4, navigation, footer, buttons, stats numbers,
  tags, etc.).

It does **not** touch layout, spacing, structural rules, or anything outside
of colours and the typography slots above.

---

## The interface

The window is split in two:

- **Left panel** — controls (file connection, change history, font library,
  font slots, colours, apply/reset).
- **Right pane** — live preview of the RAMP site with a section-jump toolbar
  at the top.

### File panel

| Button | What it does |
|---|---|
| **Connect project folder…** | Re-runs the folder picker (use if you moved the project). |
| **Forget** | Clears the saved folder handle. Useful if you want the editor to ask again, or you're handing the machine to someone else. |

### Change history panel

Every successful **Apply** snapshots the previous `styles.css` into a new file
in `log/` and writes an entry to `log/index.json`. The list shows every entry
newest-first.

- **Revert** on any row — restores that version of `styles.css`. The revert
  itself creates a new log entry, so you can undo a revert.
- **Clear log** — deletes every file inside `log/` after a confirmation
  prompt. The folder itself stays.

The `log/` folder is created automatically on the first Apply.

### Using custom fonts (Google Fonts)

The editor's preset fonts (Georgia, Helvetica, Verdana, etc.) cover the basics.
For anything else — Poppins, Playfair Display, Inter, Roboto Slab, Bebas Neue
and the thousand+ other typefaces on Google Fonts — load them into the editor's
**font library** first, then they show up as choices in every section dropdown.

#### Step 1 — Find the font on Google Fonts

1. Open [https://fonts.google.com](https://fonts.google.com) in a new tab.
2. Search for the font you want, or browse the catalogue. Click the font's
   tile to open its detail page.
3. On the detail page you'll see every weight and style the font ships with
   (Thin, Light, Regular, Bold, Italic, etc.). Each one has a **"Get font"**
   or **"+"** button next to it.
4. Click **Get font** on each weight you actually want to use. A small floating
   panel will appear (top right, says **"X families selected"**). Don't worry
   about picking too many — you only need Regular (400) and Bold (700) for
   most use cases.
5. When you have all the weights you need, click the panel, then click
   **"Get embed code"** (or **"<> Get embed code"**).

#### Step 2 — Copy the `<link>` snippet

On the embed page, make sure **"Web"** is selected and the **"<link>"** tab
is active (it usually is by default). You'll see a block like this:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
```

Copy the entire block (the **Copy code** button on the right does this for
you).

#### Step 3 — Paste into the editor

In the editor's **Font library** textarea, paste the snippet. As soon as you
release the paste, a chip appears below the box with the font's name —
rendered in its own typeface, so you immediately see what it looks like.

You can paste multiple snippets, one after another (or in the same paste).
Each font becomes a new chip. For example, after pasting Poppins followed by
Playfair Display, you'll see:

> [ Poppins × ]  [ Playfair Display × ]

#### Step 4 — Assign the font to a section

Scroll down to **Font per section**. Each dropdown now has a new group called
**"From your library"** listing the fonts you just pasted. Pick which one to
use for which slot — e.g. Playfair Display for H1, Poppins for body and
navigation.

The preview updates instantly. When you're happy, click **Apply changes to
CSS file**.

#### Other accepted formats

You don't have to paste the full `<link>` snippet. The library textarea also
accepts:

**Bare URLs** (one per line) — useful if someone shared just the URL:

```
https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap
https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap
```

**Bare family names** (one per line) — quickest if you know the exact name.
The editor builds a default URL (Regular + Bold) for you:

```
Poppins
Playfair Display
Roboto Slab
```

#### Removing a font

Click the **×** on any chip to remove it from the library. Any section that
was using that font reverts to its default.

#### Notes

- The fonts are loaded directly from Google's CDN, so your machine needs
  internet access for the preview to render them correctly. Once you click
  **Apply**, the `@import` URL goes into `styles.css` and the live site
  fetches the font itself.
- Only Google Fonts are supported. Custom-hosted font files (`@font-face`
  with a local `.woff2`) aren't recognised by the library parser.
- If you paste a URL with specific weights/styles (e.g.
  `…Poppins:ital,wght@0,400;0,700;1,400…`), the editor preserves those exact
  weights in the saved CSS. The "bare family name" shortcut only loads
  Regular + Bold.

### Font per section

Each row maps to a part of the site. Pick a font from the dropdown — `(default
— leave as-is)` means "don't override the stylesheet here".

The slots and what they target:

| Slot | Where you'll see the change |
|---|---|
| Body text | Paragraphs, generic copy across all pages |
| H1 — Page title | Hero title, programme title in the identity bar, page H1s |
| H2 — Section head | Section headings throughout |
| H3 — Sub-heading | Card titles, sub-sections |
| H4 — Eyebrow / Card label | Small uppercase labels above headings |
| Lead paragraph | Hero lead text, identity bar subtitle |
| Navigation links | Top menu items |
| Buttons | Primary, ghost, small, and CTA buttons |
| Stats numbers | The big numbers in the stats strip |
| Tags & pills | Cohort tags, status pills, breadcrumbs |
| Footer | All text inside the footer |
| Top emblem strip | Government emblems / "Department of Industries" line |

### Colors

Each row is a CSS variable from `:root`. Change either:

- The colour picker (drag = live preview)
- The hex code text field (press Enter or tab out to apply)

The two stay in sync. Live preview updates as you scrub the picker.

### Apply / Reset

- **Apply changes to CSS file** — writes the new CSS to `css/styles.css` and
  snapshots the previous version into `log/`.
- **Reset to current file** — re-reads `css/styles.css` from disk and reverts
  any unsaved edits in the panel.

The preview always reflects your current edits; nothing is written to disk
until you click Apply.

### Preview toolbar

Buttons across the top of the preview pane: **Header · Hero · Stats · Cards ·
Districts · Table · News · Dashboard · Form · Footer.** Click any to
smooth-scroll the preview to that section.

The preview is a single comprehensive page covering every component on the
site, so you can verify your theme against every element without switching
pages.

---

## How it writes the CSS

The editor doesn't rewrite your stylesheet in place — that would be fragile.
Instead it appends a single managed block at the **end** of `styles.css`:

```css
/* === theme-editor:fonts:start === */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
body { font-family: 'Poppins', sans-serif; }
h1, .hero h1, .inst-header h1, .identity h1, .identity .name { font-family: 'Playfair Display', serif; }
.nav a, .nav { font-family: 'Poppins', sans-serif; }
/* === theme-editor:fonts:end === */
```

Because it comes after the original rules, it overrides them. To completely
revert to the stylesheet as originally authored, delete the block by hand or
use **Clear log** + a manual edit.

Colour changes happen in-place inside the `:root` block — the editor finds
each variable line and updates its value, leaving the rest of the stylesheet
untouched.

---

## File layout after first Apply

```
RAMP program website/
├── css/
│   └── styles.css                         ← edited in place
├── log/
│   ├── index.json                         ← list of every snapshot
│   ├── styles-20260526-143012.css         ← one snapshot per Apply
│   ├── styles-20260526-150045.css
│   └── …
├── theme-editor.html                      ← the editor
├── THEME-EDITOR-README.md                 ← this file
└── … (rest of the project)
```

---

## Sharing with the team

Send the whole folder (or the file alongside the existing project). On each
teammate's machine:

1. They open `theme-editor.html` in Chrome or Edge.
2. They click **Connect folder** in the welcome dialog.
3. They pick the project folder and click **Allow**.

That's it. Their browser remembers the folder for next time. Each teammate
goes through this once; the log folder is shared, so anyone can see and
revert anyone else's changes.

---

## Browser support

| Browser | Live preview | Apply to disk | Change log + revert |
|---|---|---|---|
| Chrome (any recent version) | ✓ | ✓ | ✓ |
| Edge | ✓ | ✓ | ✓ |
| Safari | ✓ | Downloads a new `styles.css` instead | ✗ |
| Firefox | ✓ | Downloads a new `styles.css` instead | ✗ |

**Recommended browser: Chrome.** It supports the File System Access API,
which is what powers the in-place save and the change log. Safari and Firefox
work for previewing but fall back to download-and-replace for saving.

---

## Troubleshooting

### "Click 'Connect project folder…' to start editing the real styles.css"
You're on the first run or **Forget** was clicked. Open the welcome overlay
(reload the page) and click **Connect folder**.

### "Could not find css/styles.css in this folder"
You picked the wrong folder. Make sure you choose the folder that contains
the `css/` subfolder, not the `css/` folder itself.

### Welcome overlay says "Reconnect to …"
Your browser cleared its permission cache (rare). Click the **Reconnect**
button — it's one click, no folder navigation.

### The preview looks right but the actual site looks unchanged after Apply
You probably need to hard-reload the site (Cmd-Shift-R on Mac, Ctrl-Shift-R
on Windows) to bypass the browser's CSS cache.

### Live preview doesn't update when I drag the colour picker
Open the browser's developer console and check for errors. Most likely cause:
the editor was opened in an unsupported browser. Try Chrome.

### "Your browser does not support directory access"
You're on Safari or Firefox. You can still edit colours and fonts in the
preview, and use **Apply** to download a new `styles.css` that you manually
drop into the `css/` folder. The change log is not available in this mode.

### I want to undo a change I made yesterday
Open the **Change history** panel. Find the entry just before the change you
want to undo and click **Revert**. If you reverted by mistake, the original
state is now the most recent log entry — just revert to that.

### The editor seems out of sync with what's in styles.css
Click **Reset to current file** — this re-reads `css/styles.css` from disk
and refreshes every input.

### I want to completely remove everything the editor did
1. Open `css/styles.css` in any text editor.
2. Delete the block between
   `/* === theme-editor:fonts:start === */` and
   `/* === theme-editor:fonts:end === */`.
3. Restore any colours you remember from the original.

Or, if you have an older log entry that predates all your edits, just revert
to that.

---

## What the editor cannot do

- It cannot change layout, spacing, grid columns, or anything structural.
- It cannot edit HTML — adding sections or rewriting copy still requires
  editing the page files.
- It cannot fetch new fonts that aren't on Google Fonts.
- It cannot save changes without being granted folder access (browser
  security; this can't be bypassed).

For anything in this list, you'll still need a developer.
