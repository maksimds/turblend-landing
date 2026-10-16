# Turblend · turblend.us

Landing site for Turblend: single-origin Puerto Rican arabica, roasted fresh and brewed the Turkish way on hot sand. Pop-ups in Cincinnati now, a shop in 2027.

The site has two jobs: get visitors onto the email list, and tell them where the next pop-up is.

It's plain HTML, CSS and JavaScript. There's nothing to install and no build step, so GitHub Pages serves these files exactly as they are.

---

## Files

```
index.html        The page: all copy, sections, form, SEO tags
404.html          "Page not found" page (GitHub Pages uses it automatically)
css/styles.css    Colors, type, layout
js/events.js      ← Pop-up dates (the file you'll edit most)
js/main.js        Mobile menu, pop-up list, form submission
favicon.svg       Placeholder icon
images/           Put photos here
CNAME             Tells GitHub Pages to serve the site at turblend.us
.nojekyll         Tells GitHub Pages to serve files as-is
tools/check.mjs   Optional pre-publish check (em dashes, placeholders)
```

---

## Previewing locally

Double-click `index.html` to open it in your browser. Everything works except form submission.

For a preview that behaves exactly like the live site, run a tiny local server from this folder, then open http://localhost:8000:

```bash
python3 -m http.server 8000
```

---

## Editing copy

All copy is in `index.html`. Each section is marked with a banner comment like `<!-- ======= 01 ORIGIN -->`, so search for the section name and edit the text between the tags.

A few conventions keep the design consistent:

- **Italic accent phrase:** wrap it in `<em>`, as in `Brewed on <em>sand.</em>`. It renders gold on dark sections and burgundy on light ones. Headlines use it on their last phrase.
- **Apostrophes:** use curly ones (’) to match the rest of the page. Straight ones (') work but look different in the display font.
- **No em dashes.** Use a period, comma, colon, or parentheses instead. Watch for them when pasting from Google Docs or Word. `node tools/check.mjs` finds any that slip in.
- **Middle dots** (`·`) separate items in labels, e.g. `Single origin · Fresh roasted`.

Colors, fonts and spacing are set at the top of `css/styles.css`.

---

## Adding pop-up events

Open `js/events.js` and add one line per date between the square brackets:

```js
window.TURBLEND_EVENTS = [
  { date: "2026-11-08", venue: "Findlay Market", neighborhood: "Over-the-Rhine", hours: "9 AM to 1 PM" },
  { date: "2026-11-15", venue: "Hyde Park Farmers' Market", neighborhood: "Hyde Park", hours: "9 AM to 12:30 PM", url: "https://..." },
];
```

| Field | Required | Notes |
| --- | --- | --- |
| `date` | yes | `"YYYY-MM-DD"`. A badly formatted date is skipped, with a warning in the browser console. |
| `venue` | yes | Shown large. Becomes a link if `url` is set. |
| `neighborhood` | yes | |
| `hours` | yes | Free text, e.g. `"9 AM to 1 PM"` |
| `url` | no | Map, event page or ticket link |

Keep the quotes and the comma at the end of each line. What happens automatically:

- Events are sorted by date, so order in the file doesn't matter.
- The **hero ticker** shows the soonest upcoming event, e.g. `Next pop-up · Cincinnati · Sat, Nov 8 · Findlay Market`.
- **Past events disappear** on their own, using Cincinnati time, so an event stays up through the end of its day. You never need to delete old lines, though you can.
- With no upcoming events, visitors see *"Next dates drop soon. Get on the list and you'll hear first."* and the ticker says *Dates soon*.

The three timeline cards above the list (Now / Fall 2026 / 2027) are in `index.html` under the `05 POP-UPS` banner.

---

## Connecting the signup form (Formspree)

GitHub Pages only serves files and can't receive form submissions, so the form sends signups to [Formspree](https://formspree.io), a free form service for static sites.

1. Create a Formspree account and a new form (name it "Turblend list").
2. Copy the form's ID: the code at the end of its endpoint, e.g. `xyzabcd` from `https://formspree.io/f/xyzabcd`.
3. In `index.html`, find `{FORMSPREE FORM ID}` in the form's `action` (under the `SIGNUP` banner) and replace it with your ID:
   ```html
   <form class="form" action="https://formspree.io/f/xyzabcd" method="POST" data-signup>
   ```
4. Publish, then submit a test signup on the live site. Formspree may ask you to confirm the form the first time.

Until step 3 is done, submitting shows the form's error message and the browser console explains why.

**Getting the signups:** each one arrives by email and is listed in your Formspree dashboard, where you can export a CSV for Mailchimp, Kit, Klaviyo and similar tools. Formspree's paid plans and Zapier can also send signups straight into your email tool. The free plan has a monthly submission limit, so check Formspree's current plans as the list grows.

Fields collected:

| Field | Meaning |
| --- | --- |
| `email` | Required |
| `first_name` | Optional |
| `private_tastings` | `yes` if they ticked "Invite me to private tastings" |

Spam protection is a hidden honeypot field (`_gotcha`) that Formspree recognizes.

**Prefer another service?** Any service that accepts a standard form POST works. Change the form's `action` URL. If the service doesn't return JSON, adjust the `fetch` call near the bottom of `js/main.js`.

---

## Publishing on GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, choose **`main`** and **`/ (root)`**, then click **Save**.
3. After a minute, the site is live. Every push to `main` republishes it.

### Custom domain (turblend.us)

The `CNAME` file already tells GitHub the domain. At your domain registrar, add these DNS records:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `<your-github-username>.github.io` |

Then, in **Settings → Pages**, confirm the custom domain shows `turblend.us` and tick **Enforce HTTPS** once it's available (DNS can take up to a day). Check GitHub's "Managing a custom domain" docs if these addresses ever change.

> Until the domain is connected, the site lives at `https://<username>.github.io/<repo>/`. The page works there too, because all its links are relative. The 404 page's "Back to Turblend" button assumes the site is at the root of the domain, so it works fully once turblend.us is connected.

---

## Placeholders to fill before launch

Search `index.html` for `{` to find them, or run `node tools/check.mjs` (needs [Node.js](https://nodejs.org); `--strict` fails while any remain).

| Placeholder | What it needs |
| --- | --- |
| `{FORMSPREE FORM ID}` | Your Formspree form ID. **The form doesn't work without it.** |
| `{FOUNDER NAME}` | Founder's name, for the signature under the origin story |
| `{INSTAGRAM URL}` | Full profile URL in the footer, e.g. `https://www.instagram.com/turblend` |
| `{EMAIL ADDRESS}` | Public contact email in the footer (appears twice on that line) |
| `{PLACEHOLDER: Soon. Bags are coming first to list members.}` | The "Can I buy beans?" answer. Confirm or rewrite it, then remove the braces. |
| `{HERO PHOTO}`, `{ORIGIN PHOTO}`, `{POP-UP PHOTO}` | Photos. See below. |
| `{OG IMAGE}` | Image for link previews. Instructions are in the comment in `<head>`. |

Also worth doing:

- Once you have the email and Instagram URL, add them to the business details for search engines (the `application/ld+json` block in `<head>`). The comment above it shows how.
- Replace the placeholder logo mark (the `<symbol id="logo-mark">` near the top of `<body>`) and `favicon.svg`.

### Adding photos

Each photo slot in `index.html` has a comment above it with the exact `<img>` tag to use.

1. Save the photo in `images/` (e.g. `images/hero.jpg`).
2. Replace the placeholder `<div class="photo photo--placeholder ...">…</div>` with the `<img>` line from the comment.
3. Make the `alt` text describe the actual photo.

| Slot | Shape | Suggested size |
| --- | --- | --- |
| Hero | Portrait 4:5 on desktop (cropped wider on phones) | 1600 × 2000 |
| Origin | Landscape 4:3 | 1600 × 1200 |
| Pop-ups | Landscape 3:2 | 1800 × 1200 |

Photos are cropped to fill their slot, so keep the subject near the center. Export JPG or WebP under about 400 KB each.

---

## Quality checklist

Last verified on 2026-10-16:

- **Layout:** checked at 360, 768, 1280 and 1440 px. No horizontal scroll, nothing outside the screen, no clipped text. The vertical hero label is part of the layout, so it can't be clipped, and it becomes a horizontal line below 900 px.
- **Em dashes:** none.
- **Form:** inline error for an empty or invalid email; "Sending" state; success message ("You're in. See you at the cezve.") with focus moved to it; error message with the form kept for retrying. The request to Formspree carries the email (trimmed), first name, tastings opt-in, subject line and an empty honeypot.
- **Events:** sorted, past and malformed dates dropped, ticker updates, empty state when nothing's upcoming, and events stay up through the end of their day in Cincinnati time.
- **Lighthouse:** Accessibility 100, Best Practices 100, SEO 100, Performance 99 on mobile and 100 on desktop.
- **Contrast:** all text meets WCAG AA, including small gold labels on the brightest part of the burgundy glow (4.7:1).
- **Keyboard:** skip link, visible focus rings, keyboard-operable menu (Escape closes it and focus returns to the button), FAQ uses native `<details>`.
- **Reduced motion:** smooth scrolling, the drawer slide and the "live" pulse all turn off when the visitor's system asks for reduced motion.
- **Opening the file directly** (double-clicking `index.html`): page, menu and pop-up list all work, with no errors.
