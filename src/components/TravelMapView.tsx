import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import type { TravelPin } from '../services/travelPinService';

interface TravelMapProps {
    pins: TravelPin[];
    height?: number;
    onPinPress?: (pin: TravelPin) => void;
}

export default function TravelMapView({ pins, height = 300, onPinPress }: TravelMapProps) {
    const openAllInMaps = () => {
        if (pins.length > 0) {
            const pin = pins[0];
            const url = `https://www.google.com/maps/search/?api=1&query=${pin.latitude},${pin.longitude}`;
            Linking.openURL(url);
        }
    };

    return (
        <View
            style={{
                height,
                borderRadius: 16,
                backgroundColor: '#EEF2FF',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
            }}
        >
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🗺️</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
                {pins.length} pin{pins.length !== 1 ? 's' : ''} on your map
            </Text>
            <TouchableOpacity
                onPress={openAllInMaps}
                style={{
                    backgroundColor: '#4F46E5',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                    marginTop: 8,
                }}
            >
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>
                    Open in Google Maps
                </Text>
            </TouchableOpacity>
        </View>
    );
}
