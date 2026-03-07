import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import BudgetTab from '../../../src/components/gifts/BudgetTab';
import GiftHistoryTab from '../../../src/components/gifts/GiftHistoryTab';
import GiftIdeaGenerator from '../../../src/components/gifts/GiftIdeaGenerator';
import WishlistTab from '../../../src/components/gifts/WishlistTab';

type TabType = 'Wishlist' | 'History' | 'Budgets';

export default function GiftsScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [activeTab, setActiveTab] = useState<TabType>('Wishlist');

    const tabs: TabType[] = ['Wishlist', 'History', 'Budgets'];

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Tab Navigation */}
            <View className="flex-row items-center justify-around px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full ${activeTab === tab
                            ? 'bg-purple-100 dark:bg-purple-900/40'
                            : 'bg-transparent'
                            }`}
                    >
                        <Text
                            className={`font-semibold ${activeTab === tab
                                ? 'text-purple-700 dark:text-purple-300'
                                : 'text-gray-500 dark:text-slate-400'
                                }`}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* AI Idea Generator (visible on Wishlist tab) */}
            {activeTab === 'Wishlist' && (
                <View className="px-4 pt-3">
                    <GiftIdeaGenerator />
                </View>
            )}

            {/* Tab Content */}
            <View className="flex-1">
                {activeTab === 'Wishlist' && <WishlistTab />}
                {activeTab === 'History' && <GiftHistoryTab />}
                {activeTab === 'Budgets' && <BudgetTab />}
            </View>
        </SafeAreaView>
    );
}
