/**
 * Displays rivers and lakes as clickable pins on the map (web/Leaflet).
 * Uses rivers.json data with approximate Michigan coordinates.
 * Click a pin to see fishing regulations.
 */

import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { buildRiverPoints } from '@/lib/riverData';
import type { River } from '@/lib/riverData';

// Build popup content for a river
function buildPopupContent(river: River): React.ReactNode {
  return (
    <div style={{ minWidth: 200, maxWidth: 320 }}>
      <strong style={{ fontSize: 14 }}>{river.name}</strong>
      {river.county && (
        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{river.county} County</div>
      )}
      {river.location && (
        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{river.location}</div>
      )}
      <div style={{ marginTop: 10, fontSize: 12, color: '#333' }}>
        {river.regulations?.map((reg) => (
          <div key={reg.label} style={{ marginTop: 4 }}>
            <strong>{reg.label}:</strong> {reg.value}
          </div>
        ))}
      </div>
    </div>
  );
}

export function WaterBodiesLayer() {
  const points = useMemo(() => buildRiverPoints(), []);

  if (points.length === 0) {
    return null;
  }

  return (
    <>
      {points.map(({ lat, lng, river }, i) => (
        <Marker key={`${river.id}-${i}`} position={[lat, lng]}>
          <Popup maxWidth={340}>{buildPopupContent(river)}</Popup>
        </Marker>
      ))}
    </>
  );
}
