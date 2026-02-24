// convert_v4.js — CSV with multi-line headers -> app/(tabs)/rivers.json (includes ALL columns)
// Usage: node convert_v4.js rivers.csv
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// Normalize header labels: lower-case, strip quotes, collapse whitespace/newlines
function norm(s) {
  return String(s || "")
    .replace(/^"+|"+$/g, "") // strip outer quotes
    .replace(/\s+/g, " ")    // collapse spaces/newlines/tabs
    .trim()
    .toLowerCase();
}

// Canonical labels for display (and their matcher keys)
const REG_LABELS = [
  { key: "fishingSeason",   label: "Fishing Season" },
  { key: "possessionSeason",label: "Possession Season" },
  { key: "brookMin",        label: "Brook Trout Minimum Size (in)" },
  { key: "brownMin",        label: "Brown Trout Minimum Size (in)" },
  { key: "salmonEtcMin",    label: "Salmon/Lake/Rainbow/Splake Minimum Size (in)" },
  { key: "troutSalmonDaily",label: "All Trout & Salmon Daily Possession Limit" }
];

// Your exact headers (with normalization)
const TARGET = {
  county: norm("County"),
  stream: norm("Stream"),
  location: norm("Location"),
  type: norm("Type"),
  fishingSeason: norm("Fishing Season"),
  possessionSeason: norm("Possession Season"),
  brookMin: norm('Brook Trout Minimum Size Limit (inches)'),
  brownMin: norm('Brown Trout Minimum Size Limit (inches)'),
  salmonEtcMin: norm('Atlantic, Chinook, Coho & Pink Salmon, Lake Trout, Rainbow Trout(Steelhead) & Splake Minimum Size Limit (inches)'),
  troutSalmonDaily: norm('All Trout and Salmon Daily Possession Limit')
};

const inputPath = process.argv[2] || "rivers.csv";
if (!fs.existsSync(inputPath)) {
  console.error(`CSV not found: ${inputPath}`);
  process.exit(1);
}

const csvText = fs.readFileSync(inputPath, "utf8");
const rows = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

// Build normalization map for headers in the file
const headerIndex = {};
if (rows.length > 0) {
  Object.keys(rows[0]).forEach((k) => {
    headerIndex[norm(k)] = k;
  });
}

function pick(row, targetNormLabel) {
  const actual = headerIndex[targetNormLabel];
  return actual ? String(row[actual] ?? "").trim() : "";
}

const out = rows.map((row, i) => {
  const county   = pick(row, TARGET.county);
  const name     = pick(row, TARGET.stream);
  const location = pick(row, TARGET.location);
  const type     = pick(row, TARGET.type);

  // Always include all regulation labels (even if blank)
  const regulations = REG_LABELS.map(({ key, label }) => ({
    label,
    value: pick(row, TARGET[key]) // may be ""
  }));

  return {
    id: String(i + 1),
    name: name || `River ${i + 1}`,
    county: county || "",
    class: type || "",
    location: location || "",
    species: [],
    regulations
  };
});

const outDir = path.join("app", "(tabs)");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, "rivers.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log(`✅ Wrote ${out.length} rivers to ${outPath}`);
