/**
 * Pin location editor at /pin-location.
 * Web only; on mobile shows a message.
 * Hidden from tab bar (href: null).
 */
import { Platform, StyleSheet, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useOnline } from '@/hooks/useOnline';
import { RIVER_COORDS, getRiverKeysForPicker } from '@/lib/riverData';
import type { River } from '@/lib/riverData';

export default function PinLocationScreen() {
  const [selectedRiver, setSelectedRiver] = useState<River | null>(null);
  const [pickerCoords, setPickerCoords] = useState<Record<string, [number, number]>>({});
  const [pickerSelectedKey, setPickerSelectedKey] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const isOnline = useOnline();

  const riverKeys = useMemo(() => getRiverKeysForPicker(), []);
  const filteredRiverKeys = useMemo(() => {
    if (!pickerSearch.trim()) return riverKeys;
    const q = pickerSearch.trim().toLowerCase();
    return riverKeys.filter(
      ({ key, river }) =>
        key.toLowerCase().includes(q) ||
        river.name?.toLowerCase().includes(q) ||
        river.county?.toLowerCase().includes(q)
    );
  }, [riverKeys, pickerSearch]);

  const mergedCoords = useMemo(() => ({ ...RIVER_COORDS, ...pickerCoords }), [pickerCoords]);
  const explicitPlacementKeys = useMemo(() => new Set(Object.keys(pickerCoords)), [pickerCoords]);

  const [undoHistory, setUndoHistory] = useState<Array<{ key: string; prevCoords: [number, number] | undefined }>>([]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (pickerSelectedKey) {
      const prevCoords = pickerCoords[pickerSelectedKey] ?? (RIVER_COORDS[pickerSelectedKey] as [number, number] | undefined);
      setUndoHistory((h) => [...h, { key: pickerSelectedKey, prevCoords }]);
      setPickerCoords((prev) => ({ ...prev, [pickerSelectedKey]: [lat, lng] }));
    }
  }, [pickerSelectedKey, pickerCoords]);

  const undoLastPin = useCallback(() => {
    setUndoHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setPickerCoords((prev) => {
        const next = { ...prev };
        if (last.prevCoords === undefined) {
          delete next[last.key];
        } else {
          next[last.key] = last.prevCoords;
        }
        return next;
      });
      return h.slice(0, -1);
    });
  }, []);


  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveCoords = useCallback(async () => {
    const out = { ...RIVER_COORDS, ...pickerCoords };
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const res = await fetch('http://localhost:3001/update-coords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coords: out }),
      });
      const data = await res.json();
      if (data.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setSaveError(data.error || 'Update failed');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err?.message || 'Could not reach update server. Run "npm run update-coords-server" in another terminal.');
    }
  }, [pickerCoords]);

  if (Platform.OS !== 'web') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Pin location</ThemedText>
        <ThemedText style={styles.subtitle}>
          The pin location editor is only available on web. Open this app in a browser at /pin-location.
        </ThemedText>
        <Link href="/(tabs)/explore" asChild>
          <ThemedText style={{ color: '#4da6ff', marginTop: 16 }}>← Back to Explore</ThemedText>
        </Link>
      </ThemedView>
    );
  }

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (!isLocalhost) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Admin only</ThemedText>
        <ThemedText style={styles.subtitle}>
          This page is for development only. Run the app locally (npm run web) and open
          localhost:8081/pin-location to use it.
        </ThemedText>
        <Link href="/(tabs)/explore" style={{ color: '#4da6ff', marginTop: 16 }}>
          ← Back to Explore
        </Link>
      </ThemedView>
    );
  }

  if (!isOnline) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          No internet connection
        </ThemedText>
        <ThemedText style={styles.subtitle}>The map needs an internet connection to load.</ThemedText>
      </ThemedView>
    );
  }

  const { MapContainer, TileLayer } = require('react-leaflet');
  const { WaterBodiesLayer } = require('@/components/WaterBodiesLayer');
  const { MapClickHandler } = require('@/components/MapClickHandler');
  const center: [number, number] = [44.3, -85.6];
  const zoom = 7;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Pin Location
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Select a river, click the map to set its pin, then Save. (Run "npm run update-coords-server" in another terminal if Save fails.)
        </ThemedText>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
        <div
          style={{
            width: 280,
            minWidth: 280,
            borderRight: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#f8f8f8',
          }}>
          <input
            type="text"
            placeholder="Search rivers..."
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            style={{
              margin: 12,
              padding: 10,
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 14,
            }}
          />
          <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
            {filteredRiverKeys.map(({ key, river }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPickerSelectedKey(key)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  marginBottom: 4,
                  border: pickerSelectedKey === key ? '2px solid #4da6ff' : '1px solid #ddd',
                  borderRadius: 8,
                  backgroundColor: pickerSelectedKey === key ? '#e8f4ff' : 'white',
                  cursor: 'pointer',
                  fontSize: 13,
                }}>
                <strong>{river.name}</strong>
                {river.county && <span style={{ color: '#666', fontSize: 12 }}> • {river.county}</span>}
                {river.location && (
                  <div style={{ fontSize: 11, color: '#555', marginTop: 4, lineHeight: 1.3 }}>
                    {river.location}
                  </div>
                )}
                {river.class && (
                  <div style={{ fontSize: 10, color: '#777', marginTop: 2 }}>Class {river.class}</div>
                )}
                {pickerCoords[key] && (
                  <div style={{ fontSize: 11, color: '#4a4', marginTop: 4 }}>
                    [{pickerCoords[key][0].toFixed(4)}, {pickerCoords[key][1].toFixed(4)}]
                  </div>
                )}
              </button>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid #ccc' }}>
            {pickerSelectedKey && (
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                Selected: <strong>{pickerSelectedKey}</strong>
                <br />
                Click the map to set position.
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={undoLastPin}
                disabled={undoHistory.length === 0}
                style={{
                  flex: 1,
                  minWidth: 80,
                  padding: 10,
                  backgroundColor: undoHistory.length === 0 ? '#ccc' : '#757575',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: undoHistory.length === 0 ? 'not-allowed' : 'pointer',
                }}>
                Don&apos;t save
              </button>
              <button
                type="button"
                onClick={saveCoords}
                disabled={saveStatus === 'saving'}
                style={{
                  flex: 1,
                  minWidth: 80,
                  padding: 10,
                  backgroundColor: saveStatus === 'saved' ? '#2e7d32' : saveStatus === 'error' ? '#c62828' : '#4da6ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
                }}>
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save'}
              </button>
            </div>
            {saveError && (
              <div style={{ fontSize: 12, color: '#c62828', marginTop: 6 }}>{saveError}</div>
            )}
            <Link
              href="/(tabs)/explore"
              style={{ display: 'block', marginTop: 8, fontSize: 13, color: '#4da6ff' }}>
              ← Exit pin location
            </Link>
          </div>
        </div>
        <View style={styles.mapWrapper}>
          <MapContainer center={center} zoom={zoom} style={styles.map} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <WaterBodiesLayer
              coordOverrides={mergedCoords}
              explicitPlacementKeys={explicitPlacementKeys}
              onRiverSelect={setSelectedRiver}
            />
            <MapClickHandler onMapClick={handleMapClick} />
          </MapContainer>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 12,
    opacity: 0.8,
  },
  mapWrapper: {
    flex: 1,
    minHeight: 400,
    minWidth: 0,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
    minHeight: 400,
  },
});
