/**
 * Dev server that updates lib/riverData.ts when the pin location page
 * sends new coordinates. Run alongside npm run web when editing pins.
 * Port 3001.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const RIVER_DATA_PATH = path.join(__dirname, '..', 'lib', 'riverData.ts');

function formatCoords(coords) {
  const lines = Object.entries(coords)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  '${k.replace(/'/g, "\\'")}': [${v[0].toFixed(4)}, ${v[1].toFixed(4)}],`);
  return `export const RIVER_COORDS: Record<string, [number, number]> = {\n${lines.join('\n')}\n};`;
}

function updateRiverData(newCoords) {
  const content = fs.readFileSync(RIVER_DATA_PATH, 'utf8');
  const regex = /export const RIVER_COORDS: Record<string, \[number, number\]> = \{[\s\S]*?\n\};/;
  const replacement = formatCoords(newCoords);
  if (!regex.test(content)) {
    throw new Error('Could not find RIVER_COORDS in riverData.ts');
  }
  const newContent = content.replace(regex, replacement);
  fs.writeFileSync(RIVER_DATA_PATH, newContent);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/update-coords') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { coords } = JSON.parse(body);
        if (!coords || typeof coords !== 'object') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Invalid coords' }));
          return;
        }
        updateRiverData(coords);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`Update coords server running at http://localhost:${PORT}`);
});
