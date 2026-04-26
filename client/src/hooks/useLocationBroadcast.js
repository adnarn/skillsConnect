import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

/**
 * Hook for workers to broadcast their live location
 * Should be used in Worker Dashboard
 * Updates location every 60 seconds when worker is visible
 */
export default function useLocationBroadcast() {
  const { user } = useAuth();
  const intervalRef = useRef(null);

  useEffect(() => {
    // Only run for workers who are visible
    if (!user || user.role !== 'worker' || !user.isVisible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const updateLocation = () => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            await api.patch('/workers/location', {
              lat: latitude,
              lng: longitude
            });
            console.log('Location broadcasted successfully');
          } catch (error) {
            console.error('Error broadcasting location:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    };

    // Broadcast immediately on mount
    updateLocation();

    // Then every 60 seconds
    intervalRef.current = setInterval(updateLocation, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]);

  // Return broadcast status for UI indicator
  return {
    isBroadcasting: !!intervalRef.current && user?.role === 'worker' && user?.isVisible
  };
}
