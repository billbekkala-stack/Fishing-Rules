// convert_v6.js — robust CSV -> app/(tabs)/rivers.json (tolerates header typos)
// Usage:
//   node convert_v6.js --check rivers.csv   # print what headers it matches
//   node convert_v6.js rivers.csv           # write app/(tabs)/rivers.json

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// Normalize: strip quotes, collapse whitespace/newlines, lowercase
function norm(s) {
  return String(s || "")
    .replace(/^"+|"+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error("Usage: node convert_v6.js [--check] rivers.csv");
  process.exit(1);
}
const checkMode = args[0] === "--check";
const inputPath = checkMode ? args[1] : args[0];
if (!inputPath || !fs.existsSync(inputPath)) {
  console.error(`CSV not found: ${inputPath || "(none)"}`);
  process.exit(1);
}

const csvText = fs.readFileSync(inputPath, "utf8");
const rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
if (!rows.length) {
  console.error("CSV appears empty.");
  process.exit(1);
}

// Build map: normalized header -> actual header
const headerIndex = {};
Object.keys(rows[0]).forEach((k) => (headerIndex[norm(k)] = k));

if (checkMode) {
  console.log("Normalized headers detected:\n");
  Object.keys(headerIndex).forEach((k) => console.log(" -", k));
  process.exit(0);
}

// Helper: find a header whose normalized text contains at least one term
// from each group (each inner array is a group of synonyms/typos).
function findByAnyAll(groups) {
  const keys = Object.keys(headerIndex);
  for (const nh of keys) {
    const ok = groups.every((alts) => alts.some((w) => nh.includes(w)));
    if (ok) return headerIndex[nh]; // return original header key
  }
  return null;
}
const ANY = (w) => [w];

// Structural fields (with synonyms)
const H_COUNTY   = findByAnyAll([ANY("county")]);
const H_STREAM   = findByAnyAll([[ "stream", "river" ]]);
const H_LOCATION = findByAnyAll([ANY("location")]);
const H_TYPE     = findByAnyAll([ANY("type")]);

// Regulations (tolerate misspellings)
const H_FISH_SEASON  = findByAnyAll([ANY("fishing"), ANY("season")]);
const H_POSSESS_SEAS = findByAnyAll([[ "possession", "possesion" ], ANY("season")]);
const H_BROOK_MIN    = findByAnyAll([ANY("brook"), [ "minimum", "minumum" ], ANY("size")]);
const H_BROWN_MIN    = findByAnyAll([ANY("brown"), [ "minimum", "minumum" ], ANY("size")]);
// Long salmon/etc header: require "salmon" + ("minimum|minumum") + "size"
const H_SALMON_ETC   = findByAnyAll([ANY("salmon"), [ "minimum", "minumum" ], ANY("size")]);
const H_DAILY_LIMIT  = findByAnyAll([ANY("daily"), ANY("possession"), ANY("limit")]);

// Show matches so you can verify
console.log("Header matches:");
console.log(" county           →", H_COUNTY);
console.log(" stream           →", H_STREAM);
console.log(" location         →", H_LOCATION);
console.log(" type             →", H_TYPE);
console.log(" fishing season   →", H_FISH_SEASON);
console.log(" possession season→", H_POSSESS_SEAS);
console.log(" brook min        →", H_BROOK_MIN);
console.log(" brown min        →", H_BROWN_MIN);
console.log(" salmon/etc min   →", H_SALMON_ETC);
console.log(" daily limit      →", H_DAILY_LIMIT);

function pick(row, header) {
  return header ? String(row[header] ?? "").trim() : "";
}

const REG_LABELS = [
  { label: "Fishing Season",                               header: H_FISH_SEASON },
  { label: "Possession Season",                            header: H_POSSESS_SEAS },
  { label: "Brook Trout Minimum Size (in)",                header: H_BROOK_MIN },
  { label: "Brown Trout Minimum Size (in)",                header: H_BROWN_MIN },
  { label: "Salmon/Lake/Rainbow/Splake Minimum Size (in)", header: H_SALMON_ETC },
  { label: "All Trout & Salmon Daily Possession Limit",    header: H_DAILY_LIMIT }
];

const out = rows.map((row, i) => {
  const county   = pick(row, H_COUNTY);
  const name     = pick(row, H_STREAM) || pick(row, H_STREAM ?? findByAnyAll([ANY("river")]));
  const location = pick(row, H_LOCATION);
  const type     = pick(row, H_TYPE);

  const regulations = REG_LABELS.map(({ label, header }) => ({
    label,
    value: pick(row, header)   // may be ""
  }));

  return {
    id: String(i + 1),
    name: name || `River ${i + 1}`,
    county,
    class: type,
    location,
    species: [],
    regulations
  };
});

const outDir = path.join("app", "(tabs)");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "rivers.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log(`✅ Wrote ${out.length} rivers to ${outPath}`);
