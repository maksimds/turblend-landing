// sitemap.xml, built with the site: the home page, dated the day it was last
// published, with its photos at their current addresses.
import type { APIRoute } from "astro";
import { SITE_URL } from "../site";
import { photos, photoUrl } from "../photos";

export const GET: APIRoute = async () => {
  const { hero, cherries, origin, cup, guests, popup } = photos;
  const images = await Promise.all([hero, cherries, origin, cup, guests, popup].map(photoUrl));
  const today = new Date().toISOString().slice(0, 10);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${today}</lastmod>
${images.map((src) => `    <image:image><image:loc>${src}</image:loc></image:image>`).join("\n")}
  </url>
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
