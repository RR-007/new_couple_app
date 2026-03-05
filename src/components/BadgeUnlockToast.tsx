import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { BadgeDef, onBadgeUnlocked } from '../services/achievementService';

export default function BadgeUnlockToast() {
    const [currentBadge, setCurrentBadge] = useState<BadgeDef | null>(null);
    const [queue, setQueue] = useState<BadgeDef[]>([]);

    // Animation refs
    const translateY = useRef(new Animated.Value(-150)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        // Subscribe to global unlock events
        const unsubscribe = onBadgeUnlocked((badge) => {
            setQueue(prev => [...prev, badge]);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!currentBadge && queue.length > 0) {
            // Process next badge in queue
            const nextBadge = queue[0];
            setQueue(prev => prev.slice(1));
            setCurrentBadge(nextBadge);

            // Animate in
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 50, // Distance from top
                    duration: 500,
                    easing: Easing.out(Easing.back(1.5)),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 5,
                    tension: 100,
                    useNativeDriver: true,
                })
            ]).start();

            // Animate out after delay
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -150,
                        duration: 400,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 0.8,
                        duration: 400,
                        useNativeDriver: true,
                    })
                ]).start(() => {
                    setCurrentBadge(null); // Clear to allow next badge
                });
            }, 4000); // Show for 4 seconds
        }
    }, [currentBadge, queue, opacity, translateY, scale]);

    if (!currentBadge) return null;

    return (
        <View className="absolute top-0 left-0 right-0 z-50 items-center pointer-events-none">
            <Animated.View
                style={{
                    transform: [
                        { translateY },
                        { scale }
                    ],
                    opacity
                }}
                className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-4 shadow-xl flex-row items-center w-[90%] border border-gray-700 pointer-events-auto"
            >
                <View className="w-12 h-12 bg-indigo-500/20 rounded-full items-center justify-center mr-4">
                    <Text className="text-3xl">{currentBadge.icon}</Text>
                </View>

                <View className="flex-1">
                    <Text className="text-indigo-400 font-bold text-xs uppercase tracking-wider mb-0.5">
                        Achievement Unlocked!
                    </Text>
                    <Text className="text-white font-bold text-lg leading-tight mb-1">
                        {currentBadge.title}
                    </Text>
                    <Text className="text-gray-300 text-xs">
                        {currentBadge.description}
                    </Text>
                </View>
            </Animated.View>
        </View>
    );
}
