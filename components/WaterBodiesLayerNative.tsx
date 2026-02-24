/**
 * Native map layer for iOS/Android using react-native-maps.
 * Tap a pin to see regulations in a bottom panel (avoids map overlay z-index issues).
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { buildRiverPoints } from '@/lib/riverData';
import type { River } from '@/lib/riverData';

const MICHIGAN_CENTER = { latitude: 44.3, longitude: -85.6 };
const INITIAL_DELTA = { latitudeDelta: 4.5, longitudeDelta: 5.5 };

function RiverPanel({
  river,
  onClose,
}: {
  river: River | null;
  onClose: () => void;
}) {
  if (!river) return null;
  return (
    <View style={styles.panel}>
      <ScrollView style={styles.panelScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.calloutTitle}>{river.name}</Text>
        {river.county && (
          <Text style={styles.calloutSubtitle}>{river.county} County</Text>
        )}
        {river.location && (
          <Text style={styles.calloutLocation}>{river.location}</Text>
        )}
        {river.regulations && river.regulations.length > 0 && (
          <View style={styles.regulations}>
            {river.regulations.map((reg) => (
              <Text key={reg.label} style={styles.regulation}>
                <Text style={styles.regLabel}>{reg.label}:</Text> {reg.value}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
      <Pressable style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </Pressable>
    </View>
  );
}

export function WaterBodiesLayerNative() {
  const points = useMemo(() => buildRiverPoints(), []);
  const [selectedRiver, setSelectedRiver] = useState<River | null>(null);
  const closePanel = useCallback(() => setSelectedRiver(null), []);

  if (points.length === 0) {
    return (
      <MapView
        style={styles.map}
        initialRegion={{
          ...MICHIGAN_CENTER,
          ...INITIAL_DELTA,
        }}
        provider={PROVIDER_DEFAULT}
      />
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          ...MICHIGAN_CENTER,
          ...INITIAL_DELTA,
        }}
        provider={PROVIDER_DEFAULT}
        mapType="standard"
        showsUserLocation
        showsZoomControls={false}
      >
        {points.map(({ lat, lng, river }, i) => (
          <Marker
            key={`${river.id}-${i}`}
            coordinate={{ latitude: lat, longitude: lng }}
            onPress={() => setSelectedRiver(river)}
          />
        ))}
      </MapView>
      {selectedRiver && (
        <RiverPanel river={selectedRiver} onClose={closePanel} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    minHeight: 300,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 20,
  },
  panelScroll: {
    maxHeight: 220,
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#0a66c2',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  calloutLocation: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  regulations: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 6,
  },
  regulation: {
    fontSize: 11,
    color: '#333',
    marginBottom: 2,
  },
  regLabel: {
    fontWeight: '600',
  },
  moreRegs: {
    fontSize: 10,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
