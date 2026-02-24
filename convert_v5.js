// convert_v5.js — Robust CSV -> app/(tabs)/rivers.json with fuzzy header matching
// Usage:
//   node convert_v5.js rivers.csv
//   node convert_v5.js --check rivers.csv   (prints the normalized headers it sees)

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

function norm(s) {
  return String(s || "")
    .replace(/^"+|"+$/g, "")   // strip outer quotes
    .replace(/\s+/g, " ")      // collapse spaces/newlines/tabs
    .trim()
    .toLowerCase();
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error("Usage: node convert_v5.js [--check] rivers.csv");
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

// Build normalized header map: normHeader -> actualHeader
const headerIndex = {};
Object.keys(rows[0]).forEach((k) => (headerIndex[norm(k)] = k));

if (checkMode) {
  console.log("Normalized headers detected:\n");
  Object.keys(headerIndex).forEach((k) => console.log(" -", k));
  process.exit(0);
}

// Helper: find a header whose normalized text contains *all* keywords
function findByKeywords(...keywords) {
  const wants = keywords.map(norm);
  const match = Object.keys(headerIndex).find((h) =>
    wants.every((w) => h.includes(w))
  );
  return match ? headerIndex[match] : null;
}

// Map the structural fields
const H_COUNTY   = findByKeywords("county");
const H_STREAM   = findByKeywords("stream");        // "stream" / "river" — adjust if needed
const H_LOCATION = findByKeywords("location");
const H_TYPE     = findByKeywords("type");

// Map the regulation fields (fuzzy)
const H_FISH_SEASON  = findByKeywords("fishing", "season");
const H_POSSESS_SEAS = findByKeywords("possession", "season");
const H_BROOK_MIN    = findByKeywords("brook", "minimum", "size");
const H_BROWN_MIN    = findByKeywords("brown", "minimum", "size");
// the long one: “Atlantic, Chinook, Coho & Pink Salmon, Lake Trout, Rainbow Trout(Steelhead) & Splake Minimum Size Limit (inches)”
const H_SALMON_ETC   = findByKeywords("salmon", "lake trout", "rainbow", "splake", "minimum", "size");
const H_DAILY_LIMIT  = findByKeywords("trout", "salmon", "daily", "possession", "limit");

// Optional: show what matched
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
  { key: "fishingSeason",   label: "Fishing Season", header: H_FISH_SEASON },
  { key: "possessionSeason",label: "Possession Season", header: H_POSSESS_SEAS },
  { key: "brookMin",        label: "Brook Trout Minimum Size (in)", header: H_BROOK_MIN },
  { key: "brownMin",        label: "Brown Trout Minimum Size (in)", header: H_BROWN_MIN },
  { key: "salmonEtcMin",    label: "Salmon/Lake/Rainbow/Splake Minimum Size (in)", header: H_SALMON_ETC },
  { key: "troutSalmonDaily",label: "All Trout & Salmon Daily Possession Limit", header: H_DAILY_LIMIT }
];

const out = rows.map((row, i) => {
  const county   = pick(row, H_COUNTY);
  const name     = pick(row, H_STREAM) || pick(row, findByKeywords("river")); // fallback
  const location = pick(row, H_LOCATION);
  const type     = pick(row, H_TYPE);

  const regulations = REG_LABELS.map(({ label, header }) => ({
    label,
    value: pick(row, header)  // may be ""
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
