/**
 * Displays rivers and lakes as clickable pins on the map (web/Leaflet).
 * Uses rivers.json data with approximate Michigan coordinates.
 * Click a pin to trigger onRiverSelect (overlay shown outside map to avoid z-index issues).
 */

import React, { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import { buildRiverPoints } from '@/lib/riverData';
import type { River } from '@/lib/riverData';

export function WaterBodiesLayer({ onRiverSelect }: { onRiverSelect?: (river: River) => void }) {
  const points = useMemo(() => buildRiverPoints(), []);

  if (points.length === 0) {
    return null;
  }

  return (
    <>
      {points.map(({ lat, lng, river }, i) => (
        <Marker
          key={`${river.id}-${i}`}
          position={[lat, lng]}
          eventHandlers={{
            click: () => onRiverSelect?.(river),
          }}
        />
      ))}
    </>
  );
}
