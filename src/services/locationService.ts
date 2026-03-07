import * as Location from 'expo-location';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface LocationData {
    lat: number;
    lng: number;
    timestamp: number;
    isLive: boolean; // Tells us if this was a background continuous ping or a manual "Meet Me Here" ping
}

export interface UserLocation {
    userId: string;
    location: LocationData;
}

/**
 * Update the user's location in the shared space
 * Stored at: spaces/{spaceId}/locations/{userId}
 */
export const updateLocation = async (
    spaceId: string,
    userId: string,
    location: LocationData
) => {
    if (!spaceId || !userId || !location) return;

    try {
        const ref = doc(db, 'spaces', spaceId, 'locations', userId);
        await setDoc(ref, {
            ...location,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (e) {
        console.error("Error updating location:", e);
    }
};

/**
 * Get a specific user's last known location
 */
export const getUserLocation = async (
    spaceId: string,
    userId: string
): Promise<LocationData | null> => {
    if (!spaceId || !userId) return null;

    try {
        const ref = doc(db, 'spaces', spaceId, 'locations', userId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            return snap.data() as LocationData;
        }
    } catch (e) {
        console.error("Error fetching location:", e);
    }
    return null;
};

/**
 * Subscribe to a specific user's location
 */
export const subscribeToUserLocation = (
    spaceId: string,
    userId: string,
    callback: (location: LocationData | null) => void
) => {
    if (!spaceId || !userId) {
        callback(null);
        return () => { };
    }

    const ref = doc(db, 'spaces', spaceId, 'locations', userId);
    return onSnapshot(ref, (snap) => {
        if (snap.exists()) {
            callback(snap.data() as LocationData);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error("Error subscribing to location:", error);
        callback(null);
    });
};

/**
 * Requests Foreground permission and fetches the current position once
 */
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return null;
        }

        const location = await Location.getCurrentPositionAsync({});
        return location;
    } catch (error) {
        console.error("Error getting current location:", error);
        return null;
    }
};

let liveLocationSubscriber: Location.LocationSubscription | null = null;

/**
 * Start watching location for Live Sharing foreground tracking
 */
export const startLiveLocationTracking = async (spaceId: string, userId: string): Promise<boolean> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location for live tracking was denied');
            return false;
        }

        if (liveLocationSubscriber) {
            liveLocationSubscriber.remove();
        }

        liveLocationSubscriber = await Location.watchPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 60000, // Update roughly every minute (in foreground)
            distanceInterval: 100 // Or every 100 meters
        }, (location) => {
            updateLocation(spaceId, userId, {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                timestamp: location.timestamp,
                isLive: true
            });
        });

        return true;
    } catch (e) {
        console.error("Error starting live location tracking", e);
        return false;
    }
};

/**
 * Stop watching location 
 */
export const stopLiveLocationTracking = () => {
    if (liveLocationSubscriber) {
        liveLocationSubscriber.remove();
        liveLocationSubscriber = null;
    }
};

// ============================================================================
// Haversine Formula helper for "Near You" calculations
// ============================================================================

const toRad = (value: number) => {
    return (value * Math.PI) / 180;
};

/**
 * Calculates the great-circle distance between two points on a sphere given their longitudes and latitudes
 * Returns distance in meters.
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371e3; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};
