import React, { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import type { TravelPin } from '../services/travelPinService';

// Leaflet is only available on web
let L: any = null;
if (Platform.OS === 'web') {
    L = require('leaflet');
}

interface TravelMapProps {
    pins: TravelPin[];
    height?: number;
    onPinPress?: (pin: TravelPin) => void;
}

export default function TravelMapView({ pins, height = 300, onPinPress }: TravelMapProps) {
    const mapRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const markersRef = useRef<any[]>([]);

    // Load Leaflet CSS
    useEffect(() => {
        if (Platform.OS !== 'web') return;
        // Inject Leaflet CSS if not already present
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
    }, []);

    // Initialize map
    useEffect(() => {
        if (Platform.OS !== 'web' || !L || !containerRef.current) return;

        // Only create map once
        if (!mapRef.current) {
            mapRef.current = L.map(containerRef.current, {
                zoomControl: true,
                attributionControl: true,
            }).setView([20, 0], 2);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 18,
            }).addTo(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update markers when pins change
    useEffect(() => {
        if (!mapRef.current || !L) return;

        // Clear existing markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        if (pins.length === 0) return;

        // Add markers
        pins.forEach((pin) => {
            const icon = L.divIcon({
                html: `<div style="font-size:24px;text-align:center;line-height:1;">${pin.visited ? '✅' : '📍'}</div>`,
                className: 'custom-pin-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            });

            const marker = L.marker([pin.latitude, pin.longitude], { icon })
                .addTo(mapRef.current)
                .bindPopup(
                    `<div style="text-align:center;">
                        <strong>${pin.name.split(',')[0]}</strong><br/>
                        <small>${pin.visited ? '✅ Visited' : '📍 Bucket List'}</small><br/>
                        <a href="https://www.google.com/maps?q=${pin.latitude},${pin.longitude}" target="_blank" style="color:#4F46E5;font-size:12px;">Open in Google Maps ↗</a>
                    </div>`
                );

            if (onPinPress) {
                marker.on('click', () => onPinPress(pin));
            }

            markersRef.current.push(marker);
        });

        // Fit bounds to show all markers
        if (pins.length === 1) {
            mapRef.current.setView([pins[0].latitude, pins[0].longitude], 10);
        } else {
            const bounds = L.latLngBounds(pins.map((p: TravelPin) => [p.latitude, p.longitude]));
            mapRef.current.fitBounds(bounds, { padding: [30, 30] });
        }
    }, [pins]);

    if (Platform.OS !== 'web') {
        // Fallback for native — can add react-native-maps later
        return <View style={{ height, backgroundColor: '#e5e7eb', borderRadius: 16 }} />;
    }

    return (
        <div
            ref={containerRef}
            style={{
                height,
                width: '100%',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
            }}
        />
    );
}
