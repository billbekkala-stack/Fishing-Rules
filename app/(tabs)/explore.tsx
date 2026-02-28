import { Platform, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useOnline } from '@/hooks/useOnline';
import type { River } from '@/lib/riverData';

function OfflineMessage() {
  return (
    <View style={styles.offlineContainer}>
      <ThemedText type="title" style={styles.offlineTitle}>
        No internet connection
      </ThemedText>
      <ThemedText style={styles.offlineMessage}>
        The map needs an internet connection to load. Please connect to Wi‑Fi or cellular data and try again.
      </ThemedText>
    </View>
  );
}

export default function ExploreScreen() {
  const [selectedRiver, setSelectedRiver] = useState<River | null>(null);
  const isOnline = useOnline();

  if (!isOnline) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Explore
          </ThemedText>
        </View>
        <View style={styles.mapWrapper}>
          <OfflineMessage />
        </View>
      </ThemedView>
    );
  }

  if (Platform.OS === 'web') {
    const { MapContainer, TileLayer } = require('react-leaflet');
    const { WaterBodiesLayer } = require('@/components/WaterBodiesLayer');
    const center: [number, number] = [44.3, -85.6];
    const zoom = 7;

    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Explore
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Tap a pin to see the river or lake name and fishing regulations.
          </ThemedText>
        </View>
        <View style={styles.mapWrapper}>
          <MapContainer
            center={center}
            zoom={zoom}
            style={styles.map}
            scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <WaterBodiesLayer onRiverSelect={setSelectedRiver} />
          </MapContainer>
        </View>
        {selectedRiver && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2147483647,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setSelectedRiver(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Escape' && setSelectedRiver(null)}
            aria-label="Close overlay">
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 20,
                maxWidth: 340,
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
              onClick={(e) => e.stopPropagation()}>
              <strong style={{ fontSize: 16 }}>{selectedRiver.name}</strong>
              {selectedRiver.county && (
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{selectedRiver.county} County</div>
              )}
              {selectedRiver.location && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{selectedRiver.location}</div>
              )}
              <div style={{ marginTop: 12, fontSize: 13, color: '#333' }}>
                {selectedRiver.regulations?.map((reg) => (
                  <div key={reg.label} style={{ marginTop: 6 }}>
                    <strong>{reg.label}:</strong> {reg.value}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSelectedRiver(null)}
                style={{
                  marginTop: 16,
                  padding: '10px 20px',
                  backgroundColor: '#4da6ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                }}>
                Close
              </button>
            </div>
          </div>
        )}
      </ThemedView>
    );
  }

  const { WaterBodiesLayerNative } = require('@/components/WaterBodiesLayerNative');
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Explore
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Tap a pin to see the river or lake name and fishing regulations.
        </ThemedText>
      </View>
      <View style={styles.mapWrapper}>
        <WaterBodiesLayerNative />
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
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
    minHeight: 400,
  },
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  offlineTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  offlineMessage: {
    textAlign: 'center',
    opacity: 0.9,
  },
});
