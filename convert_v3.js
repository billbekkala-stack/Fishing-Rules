// convert_v3.js — CSV with multi-line headers -> app/(tabs)/rivers.json
// Usage: node convert_v3.js rivers.csv
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// Normalize header labels: lower-case, strip quotes, collapse whitespace
function norm(s) {
  return String(s || "")
    .replace(/^"+|"+$/g, "")        // strip outer quotes
    .replace(/\s+/g, " ")           // collapse spaces/newlines/tabs
    .trim()
    .toLowerCase();
}

// Target labels we want to map to (normalized)
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

// Let csv-parse read the first row as headers (even with quotes/newlines)
const rows = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

// Build a case/whitespace-insensitive header index
// Map normalized header -> actual header key in row objects
const headerIndex = {};
if (rows.length > 0) {
  const sample = rows[0];
  Object.keys(sample).forEach((k) => {
    headerIndex[norm(k)] = k;
  });
}

// Helper to read a cell by our target key
function pick(row, targetNormLabel) {
  const actual = headerIndex[targetNormLabel];
  return actual ? String(row[actual] ?? "").trim() : "";
}

// Push regulation line only if value present
function pushReg(regs, label, value) {
  const v = (value || "").trim();
  if (v) regs.push({ label, value: v });
}

const out = rows.map((row, i) => {
  const county   = pick(row, TARGET.county);
  const name     = pick(row, TARGET.stream);
  const location = pick(row, TARGET.location);
  const type     = pick(row, TARGET.type);

  const regulations = [];
  pushReg(regulations, "Fishing Season", pick(row, TARGET.fishingSeason));
  pushReg(regulations, "Possession Season", pick(row, TARGET.possessionSeason));
  pushReg(regulations, "Brook Trout Minimum Size (in)", pick(row, TARGET.brookMin));
  pushReg(regulations, "Brown Trout Minimum Size (in)", pick(row, TARGET.brownMin));
  pushReg(regulations, "Salmon/Lake/Rainbow/Splake Minimum Size (in)", pick(row, TARGET.salmonEtcMin));
  pushReg(regulations, "All Trout & Salmon Daily Possession Limit", pick(row, TARGET.troutSalmonDaily));

  return {
    id: String(i + 1),
    name: name || `River ${i + 1}`,
    county: county || "",
    class: type || "",
    location: location || "",
    species: [],         // kept for compatibility
    regulations          // new list used by the app's detail view
  };
});

const outDir = path.join("app", "(tabs)");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, "rivers.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log(`✅ Wrote ${out.length} rivers to ${outPath}`);
