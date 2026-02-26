import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Text, View } from 'react-native';

const QUOTES = [
    "Building memories...",
    "Sprinkling extra love on this...",
    "Sending this with a kiss...",
    "Patience, my love...",
    "Good things come to those who wait (together)...",
    "Cooking up something special...",
    "Just a moment, sweetheart...",
    "Securing our digital scrapbook...",
];

interface QuoteLoadingOverlayProps {
    visible: boolean;
}

export default function QuoteLoadingOverlay({ visible }: QuoteLoadingOverlayProps) {
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (visible) {
            // Pick a random starting quote
            setQuoteIndex(Math.floor(Math.random() * QUOTES.length));

            // Cycle every 2.5 seconds
            timer = setInterval(() => {
                setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
            }, 2500);
        }
        return () => clearInterval(timer);
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View
                className="flex-1 items-center justify-center px-8"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.92)' }}
            >
                {/* For dark mode support we normally'd use a dynamic bg based on colorScheme, 
                    but since we want a soft overlay, a solid semi-transparent light or dark color works. */}
                <View className="bg-white dark:bg-slate-800 p-8 rounded-3xl items-center shadow-lg border border-pink-100 dark:border-pink-900/30">
                    <ActivityIndicator size="large" color="#EC4899" className="mb-6" />
                    <Text className="text-lg font-medium text-gray-800 dark:text-gray-200 text-center italic">
                        "{QUOTES[quoteIndex]}"
                    </Text>
                </View>
            </View>
        </Modal>
    );
}
