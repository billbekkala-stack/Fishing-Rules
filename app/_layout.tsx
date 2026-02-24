import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Leaflet map styles and marker icon fix (needed for web map)
if (Platform.OS === 'web') {
  require('leaflet/dist/leaflet.css');
  const L = require('leaflet');
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
  // Ensure popups appear above zoom controls (Leaflet zoom = 1000, popup must be higher)
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.id = 'leaflet-popup-zindex-fix';
    style.textContent = `
      .leaflet-popup-pane,
      .leaflet-popup,
      .leaflet-popup-content-wrapper,
      .leaflet-popup-tip { z-index: 99999 !important; }
      .leaflet-control-zoom { z-index: 400 !important; }
    `;
    document.head.appendChild(style);
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // On web, don't block rendering - font may load slowly or fail
  if (!loaded && !fontError && Platform.OS !== 'web') {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
