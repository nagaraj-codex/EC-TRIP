import { useState, useEffect, useCallback } from "react";

interface Coordinates {
  lat: number;
  lon: number;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean | null;
  refresh: () => void;
}

export function useGeolocation(): GeolocationState {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setHasPermission(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setHasPermission(true);
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access denied. Using manual city selection.");
            setHasPermission(false);
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location unavailable. Using manual city selection.");
            setHasPermission(false);
            break;
          case err.TIMEOUT:
            setError("Location request timed out.");
            setHasPermission(false);
            break;
          default:
            setError("Could not get your location.");
            setHasPermission(false);
        }
        setLoading(false);
      },
      {
        timeout: 8000,
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000, // Cache for 5 minutes
      }
    );
  }, []);

  return { coordinates, loading, error, hasPermission, refresh: fetchLocation };
}

/**
 * Haversine formula — returns distance in km between two lat/lon pairs.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
