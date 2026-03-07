import { useEffect, useState } from 'react';
import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LocationData, calculateDistance, subscribeToUserLocation } from '../services/locationService';
import { formatRelativeTime } from '../utils/dateFormatter';

export default function PartnerLocationWidget() {
    const { user, coupleId, profile } = useAuth();
    const [partnerLocation, setPartnerLocation] = useState<LocationData | null>(null);
    const [userLocation, setUserLocation] = useState<LocationData | null>(null);

    useEffect(() => {
        if (!coupleId || !profile?.partnerUid) return;

        const unsubscribePartner = subscribeToUserLocation(coupleId, profile.partnerUid, (loc) => {
            setPartnerLocation(loc);
        });

        return () => unsubscribePartner();
    }, [coupleId, profile?.partnerUid]);

    useEffect(() => {
        if (!coupleId || !user?.uid) return;

        const unsubscribeUser = subscribeToUserLocation(coupleId, user.uid, (loc) => {
            setUserLocation(loc);
        });

        return () => unsubscribeUser();
    }, [coupleId, user?.uid]);

    if (!partnerLocation) {
        return null;
    }

    const handleOpenMap = () => {
        const url = Platform.select({
            ios: `maps://app?daddr=${partnerLocation.lat},${partnerLocation.lng}`,
            android: `google.navigation:q=${partnerLocation.lat},${partnerLocation.lng}`,
            default: `https://www.google.com/maps/dir/?api=1&destination=${partnerLocation.lat},${partnerLocation.lng}`
        });

        if (url) {
            Linking.canOpenURL(url)
                .then(supported => {
                    if (supported) {
                        Linking.openURL(url);
                    } else {
                        // Fallback to web map
                        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${partnerLocation.lat},${partnerLocation.lng}`);
                    }
                })
                .catch(err => console.error('An error occurred opening map', err));
        }
    };

    const distanceThreshold = 500; // in meters
    let isNear = false;
    if (partnerLocation && userLocation) {
        const dist = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            partnerLocation.lat,
            partnerLocation.lng
        );
        if (dist < distanceThreshold) {
            isNear = true;
        }
    }

    return (
        <TouchableOpacity
            onPress={handleOpenMap}
            className={`mx-4 mt-4 bg-white dark:bg-slate-800 rounded-2xl p-4 border flex-row items-center shadow-sm ${isNear ? 'border-primary-400 dark:border-primary-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-indigo-100 dark:border-indigo-900/50'
                }`}
        >
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isNear ? 'bg-primary-500 dark:bg-primary-600' : 'bg-indigo-50 dark:bg-indigo-900/30'
                }`}>
                <Text className="text-xl">{isNear ? '💕' : '📍'}</Text>
            </View>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white mr-2">
                        Partner's Location
                    </Text>
                    {isNear && (
                        <View className="bg-primary-100 dark:bg-primary-900/50 px-2 py-0.5 rounded-md border border-primary-200 dark:border-primary-800">
                            <Text className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                                Near You!
                            </Text>
                        </View>
                    )}
                </View>
                <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {partnerLocation.isLive ? 'Live sharing Active' : 'Last Check-in'} • {formatRelativeTime(new Date(partnerLocation.timestamp))}
                </Text>
            </View>
            <View className="bg-indigo-50 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Map</Text>
            </View>
        </TouchableOpacity>
    );
}
