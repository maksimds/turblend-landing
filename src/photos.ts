// The page's photos: one full-size original each, in src/assets/photos/. The build
// makes the AVIF sizes and the JPG fallbacks from these. To swap a photo, replace
// its file here (same name), at full size; the hero also has a separate 2:3 crop
// for phones.
import { getImage } from "astro:assets";
import { publicUrl } from "./site";

import hero from "./assets/photos/hero.jpg";
import heroMobile from "./assets/photos/hero-mobile.jpg";
import cherries from "./assets/photos/cherries.jpg";
import origin from "./assets/photos/origin.jpg";
import cup from "./assets/photos/cup.jpg";
import guests from "./assets/photos/guests.jpg";
import popup from "./assets/photos/popup.jpg";

export const photos = { hero, heroMobile, cherries, origin, cup, guests, popup };

/** A photo's full-size JPG at the site's public address, for structured data and the sitemap. */
export async function photoUrl(photo: ImageMetadata) {
  const image = await getImage({ src: photo, format: "jpg" });
  return publicUrl(image.src);
}
