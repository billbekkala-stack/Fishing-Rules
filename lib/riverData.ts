/**
 * Shared river data and coordinates for both web (Leaflet) and native (react-native-maps).
 */

export type Regulation = { label: string; value: string };
export type River = {
  id: string;
  name: string;
  county?: string;
  class?: string;
  location?: string;
  regulations?: Regulation[];
};

// River-specific coordinates from OpenStreetMap
export const RIVER_COORDS: Record<string, [number, number]> = {
  'Au Sable River Mainstream|Alcona': [44.4727, -83.5721],
  'Au Sable River Mainstream|Crawford': [44.6651, -84.6599],
  'Au Sable River Mainstream|Iosco': [44.4353, -83.4410],
  'Au Sable River Mainstream|Oscoda': [44.6573, -84.0930],
  'Bark River|Delta': [45.7198, -87.2688],
  'Bear Creek|Manistee': [44.2920, -86.0636],
  'Bear River|Charlevoix': [45.2612, -84.9342],
  'Bear River|Emmet': [45.3690, -84.9665],
  'Betsie River|Benzie': [44.5937, -86.0724],
  'Big Cedar River|Menominee': [45.6979, -87.5292],
  'Big Fishdam River|Delta': [45.8999, -86.5787],
  'Big Huron River|Baraga': [46.8890, -88.0899],
  'Big Huron River|Marquette': [46.8658, -88.0837],
  'Big Sable River|Mason': [44.0959, -86.3507],
  'Big South Branch Pere Marquette River|Mason': [43.9273, -86.3919],
  'Big South Branch Pere Marquette River|Newaygo': [43.7714, -85.9841],
  'Big Traverse River|Houghton': [47.1948, -88.2348],
  'Big Traverse River|Keweenaw': [47.1999, -88.2439],
  'Bird Creek|Huron': [44.0372, -82.9874],
  'Black River|Alcona': [44.5800, -83.4500],
  'Black River|Allegan': [42.5500, -86.1500],
  'Black River|Gogebic': [46.4500, -89.7500],
  'Black River|Montmorency': [45.2031, -84.3347],
  'Black River|Otsego': [45.0539, -84.4294],
  'Boardman River|Grand Traverse': [44.7206, -85.6176],
  'Boyne River|Charlevoix': [45.2130, -84.9827],
  'Brevoort River|Mackinac': [45.9822, -84.9304],
  'Carp Lake River|Emmet': [45.6771, -84.8080],
  'Cheboygan River|Cheboygan': [45.5954, -84.4735],
  'Chippewa River|Isabella': [43.6026, -84.7845],
  'Clam River|Antrim': [44.9423, -85.2829],
  'Crystal River|Leelanau': [44.9092, -85.9729],
  'Days River|Delta': [45.8942, -86.9821],
  'Devils River|Alpena': [44.9321, -83.4492],
  'Eagle River|Keweenaw': [47.4138, -88.2980],
  'East Branch Au Gres River (Whitney Drain)|Arenac': [44.0753, -83.6897],
  'East Branch Au Gres River (Whitney Drain)|Iosco': [44.2710, -83.7196],
  'East Branch Ontonagon River|Houghton': [46.6596, -89.0477],
  'Elm River|Houghton': [47.0498, -88.8864],
  'Escanaba River|Delta': [45.7804, -87.0671],
  'Falls River|Baraga': [46.7531, -88.4540],
  'Fanny Hooe River|Keweenaw': [47.4641, -87.8632],
  'Ford River|Delta': [45.6948, -87.1290],
  'Ford River|Dickinson': [45.9126, -87.6302],
  'Ford River|Menominee': [45.8731, -87.3328],
  'Grass River|Antrim': [44.9299, -85.2093],
  'Gratiot River|Keweenaw': [47.3273, -88.4199],
  'Graveraet River|Houghton': [47.0931, -88.8452],
  'Intermediate River|Antrim': [45.0637, -85.1671],
  'Jordan River|Antrim': [45.1035, -85.0993],
  'Jordan River|Charlevoix': [45.0640, -84.9481],
  'Lincoln River|Mason': [43.9985, -86.3733],
  'Little Elm River|Houghton': [47.0387, -88.9007],
  'Little Manistee River|Lake': [44.0554, -85.8404],
  'Little Manistee River|Manistee': [44.1984, -86.1946],
  'Little Muskegon River|Mecosta': [43.6041, -85.2879],
  'Little Muskegon River|Newaygo': [43.5472, -85.5681],
  'Manistee River|Crawford': [44.7164, -84.8214],
  'Manistee River|Kalkaska': [44.6236, -85.0408],
  'Manistee River|Manistee': [44.1984, -86.1946],
  'Manistee River|Otsego': [44.9013, -84.8449],
  'Manistee River|Wexford': [44.4528, -85.6127],
  'Manistique River|Schoolcraft': [46.0268, -86.2209],
  'Maple River|Cheboygan': [45.5500, -84.4800],
  'Maple River|Emmet': [45.5425, -84.9051],
  'Milakokia River|Schoolcraft': [45.9993, -85.9105],
  'Muskegon River|Mecosta': [43.6041, -85.2879],
  'Muskegon River|Newaygo': [43.5472, -85.5681],
  'Muskegon River|Osceola': [43.8945, -85.2606],
  'North Branch Au Sable River|Crawford': [44.6651, -84.6599],
  'North Branch Cedar River|Gladwin': [43.9651, -84.4843],
  'North Branch Pentwater River|Oceana': [43.7075, -86.3711],
  'North Branch White River|Oceana': [43.5924, -86.2217],
  'Otter Creek|Benzie': [44.7555, -86.0700],
  'Otter River|Baraga': [46.8352, -88.6388],
  'Otter River|Houghton': [46.8385, -88.6488],
  'Pentwater River|Oceana': [43.7132, -86.3125],
  'Pere Marquette River|Lake': [43.8665, -85.7894],
  'Pere Marquette River|Mason': [43.9273, -86.3919],
  'Pigeon River|Cheboygan': [45.4393, -84.5431],
  'Pigeon River|Huron': [43.8879, -83.2667],
  'Pigeon River|Otsego': [45.0488, -84.5720],
  'Pilgrim River and tributaries|Houghton': [47.0717, -88.5823],
  'Pilgrim River|Houghton': [47.1057, -88.5146],
  'Pine River|Alcona': [44.5732, -83.5861],
  'Pine River|Chippewa': [46.3500, -84.5500],
  'Pine River|Iosco': [44.3800, -83.6200],
  'Pine River|Lake': [44.1006, -85.6667],
  'Pine River|Wexford': [44.1822, -85.4846],
  'Pinnebog River|Huron': [43.8866, -83.1529],
  'Platte River|Benzie': [44.6656, -86.0297],
  'Portage/Torch Lake system|Houghton': [47.0640, -88.4961],
  'Rapid River|Delta': [45.9133, -86.9621],
  'Rapid River|Kalkaska': [44.7501, -85.1827],
  'Ravine River|Baraga': [46.8411, -88.2301],
  'Saginaw River|Bay': [43.5750, -83.9076],
  'Salmon Trout River|Houghton': [47.1194, -88.7453],
  'Silver Creek|Keweenaw': [47.4433, -88.0587],
  'Silver River|Baraga': [46.8081, -88.3148],
  'Silver River|Keweenaw': [47.4669, -88.0734],
  'Slate River|Baraga': [46.8305, -88.2495],
  'South Branch Au Sable River|Crawford': [44.6651, -84.6599],
  'South Branch Elm River|Houghton': [47.0178, -88.9182],
  'Sturgeon River|Baraga': [46.5797, -88.6781],
  'Sturgeon River|Cheboygan': [45.4127, -84.6091],
  'Sturgeon River|Delta': [45.8814, -86.6978],
  'Sturgeon River|Houghton': [46.6626, -88.7127],
  'Tacoosh River|Delta': [45.9162, -86.9723],
  'Thunder Bay River|Alpena': [45.0625, -83.4284],
  'Tobacco River|Keweenaw': [47.2822, -88.1446],
  'Torch River|Antrim': [44.8476, -85.3256],
  'Trap Rock River|Houghton': [47.2784, -88.3595],
  'Trout River|Presque Isle': [45.3791, -83.6608],
  'Van Etten Creek|Iosco': [44.4418, -83.3397],
  'White River|Oceana': [43.5924, -86.2217],
};

// County fallback (used when river not in RIVER_COORDS)
export const COUNTY_COORDS: Record<string, [number, number]> = {
  Alcona: [44.55, -83.55],
  Alger: [46.42, -86.65],
  Allegan: [42.58, -85.92],
  Alpena: [45.02, -83.42],
  Antrim: [45.05, -85.18],
  Arenac: [44.05, -83.78],
  Baraga: [46.75, -88.38],
  Barry: [42.58, -85.32],
  Bay: [43.62, -83.92],
  Benzie: [44.62, -86.05],
  Berrien: [41.95, -86.55],
  Branch: [41.92, -85.08],
  Calhoun: [42.22, -85.02],
  Cass: [41.92, -86.02],
  Charlevoix: [45.22, -85.12],
  Cheboygan: [45.55, -84.48],
  Chippewa: [46.35, -84.48],
  Crawford: [44.65, -84.65],
  Delta: [45.82, -86.95],
  Dickinson: [45.95, -87.85],
  Eaton: [42.58, -84.82],
  Emmet: [45.48, -84.88],
  Gladwin: [43.98, -84.48],
  Gogebic: [46.48, -89.72],
  'Grand Traverse': [44.72, -85.55],
  Houghton: [46.95, -88.55],
  Huron: [43.88, -83.35],
  Ionia: [42.95, -85.08],
  Iosco: [44.38, -83.55],
  Iron: [46.08, -88.62],
  Isabella: [43.62, -84.78],
  Jackson: [42.25, -84.42],
  Kalamazoo: [42.25, -85.55],
  Kalkaska: [44.68, -85.08],
  Keweenaw: [47.45, -88.18],
  Lake: [44.02, -85.82],
  Leelanau: [45.08, -85.98],
  Luce: [46.48, -85.58],
  Mackinac: [46.02, -84.98],
  Manistee: [44.25, -86.18],
  Marquette: [46.42, -87.62],
  Mason: [44.02, -86.38],
  Mecosta: [43.62, -85.32],
  Menominee: [45.58, -87.58],
  Missaukee: [44.35, -85.08],
  Montmorency: [45.02, -84.08],
  Newaygo: [43.58, -85.82],
  Oceana: [43.62, -86.28],
  Ogemaw: [44.35, -84.08],
  Osceola: [43.92, -85.32],
  Oscoda: [44.68, -84.08],
  Otsego: [45.02, -84.62],
  'Presque Isle': [45.32, -83.48],
  Roscommon: [44.48, -84.58],
  Schoolcraft: [46.22, -86.18],
  Wexford: [44.35, -85.55],
};

let riversData: River[] = [];
try {
  riversData = require('../app/(tabs)/rivers.json') as River[];
} catch {
  riversData = [];
}

export type RiverPoint = { lat: number; lng: number; river: River };

export type RiverKeyForPicker = { key: string; river: River };

/** Returns unique river+county entries for the coordinate picker. */
export function getRiverKeysForPicker(): RiverKeyForPicker[] {
  const seen = new Set<string>();
  const result: RiverKeyForPicker[] = [];
  for (const river of riversData) {
    const county = river.county || 'Unknown';
    const key = `${river.name}|${county}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ key, river });
  }
  return result.sort((a, b) => a.key.localeCompare(b.key));
}

export function buildRiverPoints(): RiverPoint[];
export function buildRiverPoints(
  coordOverrides: Record<string, [number, number]>,
  explicitPlacementKeys?: Set<string>
): RiverPoint[];
export function buildRiverPoints(
  coordOverrides?: Record<string, [number, number]>,
  explicitPlacementKeys?: Set<string>
): RiverPoint[] {
  const seen = new Set<string>();
  const points: RiverPoint[] = [];
  let idx = 0;

  for (const river of riversData) {
    const county = river.county || 'Unknown';
    const key = `${river.name}|${county}|${river.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const riverKey = `${river.name}|${county}`;
    const coords =
      coordOverrides?.[riverKey] ?? RIVER_COORDS[riverKey] ?? RIVER_COORDS[river.name] ?? COUNTY_COORDS[county] ?? [44.3, -85.6];

    // Skip offset for explicitly placed pins (from picker); only offset default coords to avoid overlap
    const isExplicitPlacement = explicitPlacementKeys?.has(riverKey) ?? false;
    const offset = isExplicitPlacement ? 0 : 0.003 * (idx % 8);
    const angle = (idx * 45) * (Math.PI / 180);
    points.push({
      lat: coords[0] + Math.cos(angle) * offset,
      lng: coords[1] + Math.sin(angle) * offset,
      river,
    });
    idx++;
  }

  return points;
}
