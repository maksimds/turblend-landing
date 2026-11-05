// The site's public address, used in canonical links, link previews, structured
// data and the share button. It stays turblend.us even while the files are served
// from GitHub Pages (see astro.config.mjs).
export const SITE_URL = "https://turblend.us/";

// The folder the site is served from, always ending in "/": "/turblend-landing/" today.
export const basePath = import.meta.env.BASE_URL.replace(/\/?$/, "/");

// A file in public/, addressed from the site's folder: asset("images/og.jpg").
export const asset = (path: string) => basePath + path.replace(/^\//, "");

// A path the build produced ("/turblend-landing/_astro/cup.1a2b3c.jpg") at the
// public address ("https://turblend.us/_astro/cup.1a2b3c.jpg").
export const publicUrl = (path: string) =>
  new URL(path.startsWith(basePath) ? path.slice(basePath.length) : path.replace(/^\//, ""), SITE_URL).href;
