// Pop-up dates: the "Next pop-up" tickers in the header bar and the hero, the
// list in chapter 05, and the event listings for Google. The dates come from
// src/data/events.ts, checked at build time and written into the page by
// Header.astro. Past ones are dropped here, in the browser, so a date leaves
// the page at the end of its day without the site being rebuilt.
//
// Imported by more than one component; it runs once per page.
import { SITE_URL } from "../site";
import type { PopUp } from "../data/events";
import { $, $$, el, typeset } from "./dom";

const TIME_ZONE = "America/New_York"; // Cincinnati

// Today as "YYYY-MM-DD" in Cincinnati, so an event stays up through its whole day.
function todayISO() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// Noon UTC keeps the calendar day stable in every time zone.
function formatDate(iso: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(new Date(iso + "T12:00:00Z"));
}

function renderEvent(event: PopUp) {
  const item = el("li", "event");

  const date = el("time", "event-date") as HTMLTimeElement;
  date.dateTime = event.date;
  date.append(
    el("span", "event-dow", formatDate(event.date, { weekday: "short" })),
    el("span", "event-day", formatDate(event.date, { day: "numeric" })),
    el("span", "event-mon", formatDate(event.date, { month: "short" })),
  );

  const info = el("div", "event-info");
  const venue = el("p", "event-venue");
  if (event.url) {
    const link = el("a", null, typeset(event.venue)) as HTMLAnchorElement;
    link.href = event.url;
    venue.append(link);
  } else {
    venue.textContent = typeset(event.venue);
  }
  info.append(venue, el("p", "event-meta", typeset(event.neighborhood)));

  item.append(date, info, el("p", "event-hours", typeset(event.hours)));
  return item;
}

// Cincinnati's offset from UTC on a given day: "-05:00" in winter, "-04:00" in summer.
function utcOffset(iso: string) {
  try {
    const name = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "shortOffset" })
      .formatToParts(new Date(iso + "T12:00:00Z"))
      .find((p) => p.type === "timeZoneName")?.value ?? ""; // "GMT-5"
    const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name);
    return match ? `${match[1]}${match[2].padStart(2, "0")}:${match[3] || "00"}` : null;
  } catch {
    return null;
  }
}

// "9 AM to 1 PM" on 2026-11-08 becomes 2026-11-08T09:00-05:00 to 2026-11-08T13:00-05:00.
// Hours written any other way fall back to the date alone.
function eventTimes(event: PopUp) {
  const match = /(\d{1,2})(?::(\d{2}))?\s*([AP])\.?M\.?\s*(?:to|-|–)\s*(\d{1,2})(?::(\d{2}))?\s*([AP])\.?M/i.exec(event.hours || "");
  const offset = utcOffset(event.date);
  if (!match || !offset) return { start: event.date, end: event.date };

  const time = (hour: string, minute: string | undefined, half: string) => {
    const h = (Number(hour) % 12) + (half.toUpperCase() === "P" ? 12 : 0);
    return `${event.date}T${String(h).padStart(2, "0")}:${minute || "00"}${offset}`;
  };
  return { start: time(match[1], match[2], match[3]), end: time(match[4], match[5], match[6]) };
}

// The upcoming dates again, as structured data, so Google can list them as events.
function addEventData(events: PopUp[]) {
  if (!events.length) return;
  const data = {
    "@context": "https://schema.org",
    "@graph": events.map((event) => {
      const times = eventTimes(event);
      return {
        "@type": "Event",
        "name": "Turblend pop-up at " + event.venue,
        "description": "Turkish coffee from single-origin Puerto Rican beans, brewed on hot sand at " +
          event.venue + " in " + event.neighborhood + ", Cincinnati.",
        "startDate": times.start,
        "endDate": times.end,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": event.venue,
          "address": { "@type": "PostalAddress", "addressLocality": "Cincinnati", "addressRegion": "OH", "addressCountry": "US" },
        },
        "image": [new URL("images/og.jpg", SITE_URL).href],
        "organizer": { "@type": "Organization", "name": "Turblend", "url": SITE_URL },
        "url": event.url || new URL("#popups", SITE_URL).href,
      };
    }),
  };
  const script = el("script", null, JSON.stringify(data)) as HTMLScriptElement;
  script.type = "application/ld+json";
  document.head.append(script);
}

function readDates(): PopUp[] {
  try {
    return JSON.parse($("[data-popup-dates]")?.textContent || "[]");
  } catch {
    return [];
  }
}

const today = todayISO();
const upcoming = readDates()
  .filter((event) => event.date >= today)
  .sort((a, b) => a.date.localeCompare(b.date));

const list = $("[data-events]");
const empty = $("[data-events-empty]");
if (list) {
  list.replaceChildren(...upcoming.map(renderEvent));
  list.hidden = upcoming.length === 0;
}
if (empty) empty.hidden = upcoming.length > 0;

const next = upcoming[0];
$$("[data-next-popup]").forEach((ticker) => {
  ticker.textContent = next
    ? formatDate(next.date, { weekday: "short", month: "short", day: "numeric" }) + " · " + typeset(next.venue)
    : ticker.dataset.fallback ?? "";
});

addEventData(upcoming);
