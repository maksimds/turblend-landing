#!/usr/bin/env node
/**
 * Optional content check. Needs Node.js, nothing else. Run from the project folder:
 *
 *   node tools/check.mjs            fails if an em dash is found, lists placeholders
 *   node tools/check.mjs --strict   also fails while any {PLACEHOLDER} remains
 *
 * The site itself doesn't need this file; it's a pre-publish safety net.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const files = ["index.html", "404.html", "js/events.js"];
const strict = process.argv.includes("--strict");

const EM_DASH = /—|&mdash;|&#8212;|&#x2014;/i;
const PLACEHOLDER = /\{[A-Z@][^{}\n]*\}/g;

const dashes = [];
const placeholders = [];

for (const file of files) {
  readFileSync(join(root, file), "utf8")
    .split("\n")
    .forEach((line, i) => {
      const where = `${file}:${i + 1}`;
      if (EM_DASH.test(line)) dashes.push(`  ${where.padEnd(18)} ${line.trim().slice(0, 100)}`);
      for (const match of line.matchAll(PLACEHOLDER)) placeholders.push(`  ${where.padEnd(18)} ${match[0]}`);
    });
}

if (dashes.length) {
  console.error("\n✗ Em dashes found. Replace each with a period, comma, colon, or parentheses:");
  console.error(dashes.join("\n"));
} else {
  console.log("\n✓ No em dashes.");
}

if (placeholders.length) {
  console.log(`\n${strict ? "✗" : "!"} ${placeholders.length} placeholders still need real content:`);
  console.log(placeholders.join("\n"));
} else {
  console.log("✓ No placeholders left.");
}

console.log("");
process.exit(dashes.length || (strict && placeholders.length) ? 1 : 0);
