#!/usr/bin/env node
/**
 * Content check. Needs Node.js, nothing else. Run from the project folder:
 *
 *   npm run check                  fails if an em dash is found, lists placeholders
 *   npm run check -- --strict      also fails while any {PLACEHOLDER} remains
 *
 * It reads everything under src/ (pages, components, layouts, the pop-up dates)
 * and public/js/. A placeholder is capitals in braces, like {BLOG URL}; Astro code
 * in braces ({asset(...)}, {SITE_URL}) doesn't match, as long as constants used in
 * the markup keep an underscore or a lowercase letter in their names.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, extname } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const folders = ["src", "public/js"];
const types = new Set([".astro", ".ts", ".js", ".mjs", ".md", ".mdx", ".css", ".html"]);
const strict = process.argv.includes("--strict");

const EM_DASH = /—|&mdash;|&#8212;|&#x2014;/i;
const PLACEHOLDER = /\{[A-Z@][A-Z0-9@ -]*\}/g;

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return types.has(extname(name)) ? [path] : [];
  });
}

const files = folders.flatMap((folder) => walk(join(root, folder))).sort();
const dashes = [];
const placeholders = [];

for (const path of files) {
  const file = relative(root, path);
  readFileSync(path, "utf8")
    .split("\n")
    .forEach((line, i) => {
      const where = `${file}:${i + 1}`;
      if (EM_DASH.test(line)) dashes.push(`  ${where.padEnd(34)} ${line.trim().slice(0, 100)}`);
      for (const match of line.matchAll(PLACEHOLDER)) placeholders.push(`  ${where.padEnd(34)} ${match[0]}`);
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
