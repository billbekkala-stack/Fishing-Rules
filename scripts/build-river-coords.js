/**
 * Parses Overpass API JSON and builds RIVER_COORDS for WaterBodiesLayer.
 * Run: node scripts/build-river-coords.js
 * Copy output into WaterBodiesLayer.tsx RIVER_COORDS
 */

const fs = require('fs');
const path = require('path');

const overpassPath = path.join(__dirname, 'overpass-rivers.json');
const riversPath = path.join(__dirname, '../app/(tabs)/rivers.json');

// Michigan county centers for matching OSM segments to counties
const COUNTY_CENTERS = {
  Alcona: [44.55, -83.55], Alger: [46.42, -86.65], Allegan: [42.58, -85.92],
  Alpena: [45.02, -83.42], Antrim: [45.05, -85.18], Arenac: [44.05, -83.78],
  Baraga: [46.75, -88.38], Barry: [42.58, -85.32], Bay: [43.62, -83.92],
  Benzie: [44.62, -86.05], Berrien: [41.95, -86.55], Branch: [41.92, -85.08],
  Calhoun: [42.22, -85.02], Cass: [41.92, -86.02], Charlevoix: [45.22, -85.12],
  Cheboygan: [45.55, -84.48], Chippewa: [46.35, -84.48], Crawford: [44.65, -84.65],
  Delta: [45.82, -86.95], Dickinson: [45.95, -87.85], Eaton: [42.58, -84.82],
  Emmet: [45.48, -84.88], Gladwin: [43.98, -84.48], Gogebic: [46.48, -89.72],
  'Grand Traverse': [44.72, -85.55], Houghton: [46.95, -88.55], Huron: [43.88, -83.35],
  Ionia: [42.95, -85.08], Iosco: [44.38, -83.55], Iron: [46.08, -88.62],
  Isabella: [43.62, -84.78], Jackson: [42.25, -84.42], Kalamazoo: [42.25, -85.55],
  Kalkaska: [44.68, -85.08], Kent: [43.05, -85.55], Keweenaw: [47.45, -88.18],
  Lake: [44.02, -85.82], Lapeer: [43.08, -83.22], Leelanau: [45.08, -85.98],
  Luce: [46.48, -85.58], Mackinac: [46.02, -84.98], Macomb: [42.65, -82.95],
  Manistee: [44.25, -86.18], Marquette: [46.42, -87.62], Mason: [44.02, -86.38],
  Mecosta: [43.62, -85.32], Menominee: [45.58, -87.58], Missaukee: [44.35, -85.08],
  Montmorency: [45.02, -84.08], Newaygo: [43.58, -85.82], Oceana: [43.62, -86.28],
  Ogemaw: [44.35, -84.08], Osceola: [43.92, -85.32], Oscoda: [44.68, -84.08],
  Otsego: [45.02, -84.62], 'Presque Isle': [45.32, -83.48], Roscommon: [44.48, -84.58],
  Schoolcraft: [46.22, -86.18], 'St. Clair': [42.92, -82.68], Wexford: [44.35, -85.55],
};

function dist(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function findCounty(lat, lng) {
  let best = null, bestD = Infinity;
  for (const [county, [cy, cx]] of Object.entries(COUNTY_CENTERS)) {
    const d = dist([lat, lng], [cy, cx]);
    if (d < bestD) { bestD = d; best = county; }
  }
  return best;
}

function normalizeName(name) {
  return (name || '')
    .replace(/\s*(Mainstream|Tributary|and tributaries|and all tributaries).*$/i, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();
}

let data;
try {
  const raw = fs.readFileSync(overpassPath, 'utf8');
  data = JSON.parse(raw);
} catch (e) {
  console.error('Could not read Overpass file:', e.message);
  process.exit(1);
}

// Extract name + center from each element
const elements = [];
for (const el of data.elements || []) {
  if (el.type !== 'way' || !el.tags?.name) continue;
  const name = el.tags.name.trim();
  let lat, lng;
  if (el.geometry && el.geometry.length >= 1) {
    const mid = Math.floor(el.geometry.length / 2);
    lat = el.geometry[mid].lat;
    lng = el.geometry[mid].lon;
  } else if (el.bounds) {
    lat = (el.bounds.minlat + el.bounds.maxlat) / 2;
    lng = (el.bounds.minlon + el.bounds.maxlon) / 2;
  } else continue;

  let county = el.tags['tiger:county'];
  if (county) county = county.replace(/,?\s*MI\s*$/i, '').trim();
  if (!county) county = findCounty(lat, lng);

  elements.push({ tags: { name }, lat, lng, county });
}

const rivers = JSON.parse(fs.readFileSync(riversPath, 'utf8'));
const needed = new Set();
rivers.forEach(r => {
  needed.add(`${r.name}|${r.county || ''}`);
});

// OSM name -> list of { lat, lng, county }
const osmPoints = {};
for (const el of elements) {
  const name = el.tags.name.trim();
  if (!osmPoints[name]) osmPoints[name] = [];
  osmPoints[name].push({ lat: el.lat, lng: el.lng, county: el.county });
}

// Build RIVER_COORDS: for each needed river+county, find best OSM match
const out = {};
for (const key of needed) {
  const [riverName, county] = key.split('|');
  if (!riverName) continue;

  const norm = normalizeName(riverName);
  let best = null;
  let bestScore = Infinity;

  for (const [osmName, points] of Object.entries(osmPoints)) {
    const osmNorm = normalizeName(osmName);
    if (!osmNorm.includes(norm.split(' ')[0]) && !norm.includes(osmNorm.split(' ')[0])) continue;
    const nameMatch = osmNorm === norm || osmName.includes(norm) || norm.includes(osmNorm);

    for (const p of points) {
      const countyMatch = !county || p.county === county;
      const countyCenter = COUNTY_CENTERS[county] || [44.3, -85.6];
      const d = dist([p.lat, p.lng], countyCenter);
      const score = (nameMatch ? 0 : 100) + (countyMatch ? 0 : 50) + d;
      if (score < bestScore) {
        bestScore = score;
        best = [p.lat, p.lng];
      }
    }
  }

  if (best && bestScore < 2) {
    const k = county ? `${riverName}|${county}` : riverName;
    out[k] = best;
  }
}

console.log('const RIVER_COORDS: Record<string, [number, number]> = {');
for (const [k, v] of Object.entries(out).sort()) {
  console.log(`  '${k.replace(/'/g, "\\'")}': [${v[0].toFixed(4)}, ${v[1].toFixed(4)}],`);
}
console.log('};');
console.error('\nGenerated', Object.keys(out).length, 'river coordinates');
