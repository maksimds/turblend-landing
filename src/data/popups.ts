// Checks the pop-up dates in events.ts when the site is built. A mistake stops
// the build with a message naming the entry, instead of the date quietly
// disappearing from the live page.
import { z } from "astro/zod";
import { events, type PopUp } from "./events";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Write the date as "YYYY-MM-DD", like "2026-11-08".', abort: true })
  .refine((date) => {
    const time = Date.parse(date + "T12:00:00Z");
    return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === date;
  }, "That date doesn't exist on the calendar.");

const missing = (issue: { input?: unknown }) =>
  issue.input === undefined ? "This is missing." : "Write this as text, in quotes.";

const text = z.string({ error: missing }).trim().min(1, "This can't be empty.");

const fields = "date, venue, neighborhood, hours and url";
const popUp = z.strictObject(
  {
    date: isoDate,
    venue: text,
    neighborhood: text,
    hours: text,
    url: z.url("Write the full address, starting with https://").optional(),
  },
  {
    error: (issue) =>
      issue.code === "unrecognized_keys"
        ? `${issue.keys.map((key) => `"${key}"`).join(", ")} isn't a field here (they're ${fields}). Check the spelling.`
        : undefined,
  },
);

function check(list: unknown[]): PopUp[] {
  const problems = list.flatMap((entry, i) => {
    const result = popUp.safeParse(entry);
    if (result.success) return [];
    const where = `pop-up ${i + 1} (${JSON.stringify(entry)})`;
    return result.error.issues.map((issue) => `  ${where}, ${issue.path.join(".") || "entry"}: ${issue.message}`);
  });
  if (problems.length) {
    throw new Error(`The pop-up dates in src/data/events.ts need fixing:\n${problems.join("\n")}`);
  }
  return list as PopUp[];
}

/** Every pop-up from events.ts, checked. The page script hides past ones and sorts the rest. */
export const popUps = check(events);
