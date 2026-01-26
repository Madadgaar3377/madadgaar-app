/**
 * Location and IP address utilities
 * Functions to get user location and IP address
 */

import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  locationString: string; // Format: "latitude,longitude"
}

/**
 * Request location permission and get current location
 */
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    // Check if location services are enabled
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return null;
    }
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000,
      maximumAge: 60000, // Use cached location if less than 1 minute old
    });

    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    const locationString = `${latitude},${longitude}`;
    return {
      latitude,
      longitude,
      locationString,
    };
  } catch (error: any) {
    return null;
  }
};

/**
 * Get device IP address
 * Uses external API services to fetch public IP address
 */
export const getIpAddress = async (): Promise<string | null> => {
  try {
    // Use external API service to get public IP address
    // This is a common approach for getting public IP in mobile apps
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const ip = data.ip;
        return ip;
      }
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
      } else {
      }
    }

    // Fallback: Try another IP service
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://api64.ipify.org?format=json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const ip = data.ip;
        return ip;
      }
    } catch (fetchError2: any) {
    }

    // If both fail, return null
    return null;
  } catch (error: any) {
    return null;
  }
};

/**
 * Get both location and IP address
 */
export const getLocationAndIp = async (): Promise<{
  location: LocationData | null;
  ipAddress: string | null;
}> => {
  // Get both in parallel for better performance
  const [location, ipAddress] = await Promise.all([
    getCurrentLocation(),
    getIpAddress(),
  ]);

  return {
    location,
    ipAddress,
  };
};

