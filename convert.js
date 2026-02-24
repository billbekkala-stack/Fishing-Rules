// convert.js — CSV (County, Stream, Location, Type) -> app/(tabs)/rivers.json
// Usage: node convert.js rivers.csv
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

// ---- config: adjust header names here if yours are different ----
const HEADERS = {
  county: "County",
  stream: "Stream",
  location: "Location",
  type: "Type"
};

const inputPath = process.argv[2] || "rivers.csv";
if (!fs.existsSync(inputPath)) {
  console.error(`CSV not found: ${inputPath}`);
  process.exit(1);
}

const csvText = fs.readFileSync(inputPath, "utf8");
// Relaxed parser handles quoted commas etc.
const records = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

function pick(obj, key) {
  // case-insensitive header lookup
  const found = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
  return found ? obj[found] : "";
}

const out = records.map((row, idx) => {
  const county   = pick(row, HEADERS.county);
  const name     = pick(row, HEADERS.stream);   // your “river/stream” name
  const location = pick(row, HEADERS.location); // optional, we’ll keep it
  const type     = pick(row, HEADERS.type);     // we’ll store as “class”

  return {
    id: String(idx + 1),
    name: name || `River ${idx + 1}`,
    county: county || "",
    class: type || "",
    // Keep location if you want to show/use it later:
    location: location || "",
    // Start with empty species; you can fill later per river
    species: []
  };
});

// Ensure output folder exists: app/(tabs)/
const outDir = path.join("app", "(tabs)");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, "rivers.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf8");
console.log(`✅ Wrote ${out.length} rivers to ${outPath}`);
