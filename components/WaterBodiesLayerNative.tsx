/**
 * Native map layer for iOS/Android using react-native-maps.
 * Displays rivers and lakes as tappable pins with callouts showing regulations.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { buildRiverPoints } from '@/lib/riverData';
import type { River } from '@/lib/riverData';

const MICHIGAN_CENTER = { latitude: 44.3, longitude: -85.6 };
const INITIAL_DELTA = { latitudeDelta: 4.5, longitudeDelta: 5.5 };

function RiverCallout({ river }: { river: River }) {
  return (
    <View style={styles.callout}>
      <Text style={styles.calloutTitle}>{river.name}</Text>
      {river.county && (
        <Text style={styles.calloutSubtitle}>{river.county} County</Text>
      )}
      {river.location && (
        <Text style={styles.calloutLocation} numberOfLines={2}>
          {river.location}
        </Text>
      )}
      {river.regulations && river.regulations.length > 0 && (
        <View style={styles.regulations}>
          {river.regulations.slice(0, 4).map((reg) => (
            <Text key={reg.label} style={styles.regulation} numberOfLines={1}>
              <Text style={styles.regLabel}>{reg.label}:</Text> {reg.value}
            </Text>
          ))}
          {river.regulations.length > 4 && (
            <Text style={styles.moreRegs}>
              +{river.regulations.length - 4} more...
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export function WaterBodiesLayerNative() {
  const points = useMemo(() => buildRiverPoints(), []);

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
          title={river.name}
          description={river.county ? `${river.county} County` : undefined}
        >
          <Callout tooltip>
            <RiverCallout river={river} />
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
    minHeight: 400,
  },
  callout: {
    minWidth: 220,
    maxWidth: 300,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
