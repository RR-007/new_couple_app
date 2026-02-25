import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import type { TravelPin } from '../services/travelPinService';

interface TravelMapProps {
    pins: TravelPin[];
    height?: number;
    onPinPress?: (pin: TravelPin) => void;
}

export default function TravelMapView({ pins, height = 300, onPinPress }: TravelMapProps) {
    const handleCalloutPress = (pin: TravelPin) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${pin.latitude},${pin.longitude}`;
        Linking.openURL(url);
    };

    // Calculate bounding box or default region
    const defaultRegion = {
        latitude: pins.length > 0 ? pins[0].latitude : 20,
        longitude: pins.length > 0 ? pins[0].longitude : 0,
        latitudeDelta: pins.length > 0 ? 30 : 100,
        longitudeDelta: pins.length > 0 ? 30 : 100,
    };

    return (
        <View style={[{ height, borderRadius: 16, overflow: 'hidden' }, styles.container]}>
            <MapView
                style={styles.map}
                initialRegion={defaultRegion}
            >
                {pins.map((pin) => (
                    <Marker
                        key={pin.id}
                        coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                        pinColor={pin.visited ? 'indigo' : 'tomato'}
                        onCalloutPress={() => handleCalloutPress(pin)}
                    >
                        <Callout>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{pin.name}</Text>
                                <Text style={styles.calloutSubtitle}>{pin.visited ? '✅ Visited' : '📍 Bucket List'}</Text>
                                <Text style={styles.calloutLink}>Open in Maps ↗</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    calloutContainer: {
        padding: 8,
        alignItems: 'center',
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
    },
    calloutSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    calloutLink: {
        color: '#4F46E5',
        fontSize: 12,
        fontWeight: '600',
    },
});
