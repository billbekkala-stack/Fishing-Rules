/**
 * Native map layer for iOS/Android using react-native-maps.
 * Displays rivers and lakes as tappable pins. Tap a pin to see regulations in a modal.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
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

function RiverModal({
  river,
  onClose,
}: {
  river: River | null;
  onClose: () => void;
}) {
  if (!river) return null;
  return (
    <Modal visible={!!river} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function WaterBodiesLayerNative() {
  const points = useMemo(() => buildRiverPoints(), []);
  const [selectedRiver, setSelectedRiver] = useState<River | null>(null);
  const closeModal = useCallback(() => setSelectedRiver(null), []);

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
    <>
      <MapView
        style={styles.map}
        initialRegion={{
          ...MICHIGAN_CENTER,
          ...INITIAL_DELTA,
        }}
        provider={PROVIDER_DEFAULT}
        mapType="standard"
        showsUserLocation
      >
        {points.map(({ lat, lng, river }, i) => (
          <Marker
            key={`${river.id}-${i}`}
            coordinate={{ latitude: lat, longitude: lng }}
            onPress={() => setSelectedRiver(river)}
          />
        ))}
      </MapView>
      <RiverModal river={selectedRiver} onClose={closeModal} />
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
    minHeight: 400,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
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
