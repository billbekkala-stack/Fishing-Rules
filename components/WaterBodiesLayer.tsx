/**
 * Displays rivers and lakes as clickable pins on the map (web/Leaflet).
 * Uses rivers.json data with approximate Michigan coordinates.
 * Click a pin to trigger onRiverSelect (overlay shown outside map to avoid z-index issues).
 * Pins scale down when zoomed out so they don't cover the state.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Marker, useMap } from 'react-leaflet';
import { buildRiverPoints } from '@/lib/riverData';
import type { River } from '@/lib/riverData';

const L = typeof window !== 'undefined' ? require('leaflet') : null;

function useMarkerIcon(zoom: number) {
  return useMemo(() => {
    if (!L) return undefined;
    // Scale from 0.35 at zoom 7 (state view) to 1 at zoom 15+
    const scale = Math.max(0.35, Math.min(1, (zoom - 6) / 10));
    const w = Math.round(25 * scale);
    const h = Math.round(41 * scale);
    return L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconSize: [w, h],
      iconAnchor: [Math.round(w / 2), h],
      popupAnchor: [0, -h],
      shadowUrl: '',
      shadowSize: [0, 0],
      shadowAnchor: [0, 0],
    });
  }, [zoom]);
}

type Props = {
  onRiverSelect?: (river: River) => void;
  coordOverrides?: Record<string, [number, number]>;
  explicitPlacementKeys?: Set<string>;
};

export function WaterBodiesLayer({ onRiverSelect, coordOverrides, explicitPlacementKeys }: Props) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map?.getZoom?.() ?? 10);
  const icon = useMarkerIcon(zoom);

  useEffect(() => {
    if (!map) return undefined;
    const handler = () => setZoom(map.getZoom());
    map.on('zoomend', handler);
    setZoom(map.getZoom());
    return () => {
      map.off('zoomend', handler);
    };
  }, [map]);

  const points = useMemo(
    () => buildRiverPoints(coordOverrides ?? {}, explicitPlacementKeys),
    [coordOverrides, explicitPlacementKeys]
  );

  if (points.length === 0) {
    return null;
  }

  return (
    <>
      {points.map(({ lat, lng, river }, i) => (
        <Marker
          key={`${river.id}-${i}`}
          position={[lat, lng]}
          icon={icon}
          eventHandlers={{
            click: () => onRiverSelect?.(river),
          }}
        />
      ))}
    </>
  );
}
