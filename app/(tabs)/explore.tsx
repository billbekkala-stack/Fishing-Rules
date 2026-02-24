import { Platform, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ExploreScreen() {
  // Re-apply popup z-index when map mounts (ensures it works on Netlify/mobile)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const apply = () => {
      document.querySelectorAll('.leaflet-popup-pane, .leaflet-popup').forEach((el) => {
        (el as HTMLElement).style.zIndex = '99999';
      });
    };
    apply();
    const t = setTimeout(apply, 300); // retry after Leaflet mounts
    return () => clearTimeout(t);
  }, []);

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
            <WaterBodiesLayer />
          </MapContainer>
        </View>
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
});
