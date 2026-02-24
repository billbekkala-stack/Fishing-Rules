/**
 * Fetches Michigan river data from OpenStreetMap Overpass API.
 * Run: node scripts/fetch-overpass.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const query = `[out:json][timeout:120];
way["waterway"="river"]["name"](43.5,-88,46,-82);
out body geom;`;

const outPath = path.join(__dirname, 'overpass-rivers.json');

console.log('Fetching from Overpass API (this may take 1-2 minutes)...');

const req = https.request(
  {
    hostname: 'overpass-api.de',
    path: '/api/interpreter',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(query),
    },
  },
  (res) => {
    let body = '';
    res.on('data', (c) => (body += c));
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        const count = (data.elements || []).length;
        fs.writeFileSync(outPath, body, 'utf8');
        console.log('Saved', count, 'river segments to', outPath);
      } catch (e) {
        console.error('Error:', e.message);
        if (body.length > 0) {
          fs.writeFileSync(outPath, body, 'utf8');
          console.log('Wrote raw response to', outPath);
        }
      }
    });
  }
);

req.on('error', (e) => console.error('Request error:', e.message));
req.write(query);
req.end();
