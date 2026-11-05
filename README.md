# Turblend
### Landing for a local coffee-producing company with a coffee shop in Cincinnati, OH

Built with [Astro](https://astro.build): the pages are written as components and built into plain HTML, CSS and a little JavaScript. Live at <https://maksimds.github.io/turblend-landing/>.

## Working on it

You need Node.js 24 (`node -v` to check).

```sh
npm install        # once
npm run dev        # http://localhost:4321/turblend-landing/, reloads as you edit
npm run build      # builds the site into dist/
npm run preview    # serves dist/ the way GitHub Pages will
```

Before publishing:

```sh
npm run check              # fails on an em dash, lists {PLACEHOLDERS} still to fill
npm run check -- --strict  # also fails while any placeholder is left
npm run typecheck          # checks the code
```

## Where things are

| To change | Edit |
|---|---|
| Pop-up dates | `src/data/events.ts` (instructions at the top) |
| A section's text | `src/components/`, one file per chapter: `Origin.astro`, `Method.astro`, … |
| The Story / Roadmap / Blog links (header, menu, footer) | `src/data/nav.ts` |
| Photos | `src/assets/photos/`, one full-size file each (see `src/photos.ts`) |
| Colours, type, spacing, layout | `src/styles/global.css` |
| Logos, favicons, the link-preview image | `public/images/`, `public/` |
| The 404 page | `src/pages/404.astro` |
| The public address (turblend.us) | `src/site.ts` |

A mistyped pop-up date stops the build with a message naming the line, so it never reaches the live page.

## Publishing

Every push builds the site on GitHub (see the Actions tab). A push to `main` publishes it; a push to any other branch only builds and checks. If a check or the build fails, nothing is published and the live site stays as it was. A push takes about a minute to go live.

One-time setup: in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.

## The signup form

Signups go to [Formspree](https://formspree.io). Create a form there, copy its ID (the part after `/f/` in the form's endpoint), and put it in place of `{FORMSPREE FORM ID}` in `src/components/Signup.astro`. Until then, the form shows its "That didn't go through" message.

## Moving to turblend.us

1. In `astro.config.mjs`, set `site` to `"https://turblend.us"` and `base` to `"/"`.
2. In **Settings → Pages → Custom domain**, enter `turblend.us`, and add the DNS records GitHub lists there with the domain's registrar.

Canonical links, link previews, structured data and the sitemap already use turblend.us (`src/site.ts`).
