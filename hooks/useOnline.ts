/**
 * Returns whether the device has network connectivity.
 * Uses @react-native-community/netinfo (works on web, iOS, Android).
 */
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  return isOnline;
}
