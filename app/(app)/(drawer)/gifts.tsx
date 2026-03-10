import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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
        <View className="flex-1 bg-secondary">
            {/* Tab Navigation */}
            <View className="flex-row items-center justify-around px-4 py-3 bg-secondary border-b border-gray-200 dark:border-slate-700">
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full ${activeTab === tab
                            ? 'bg-secondary-100 dark:bg-secondary-900/40'
                            : 'bg-transparent'
                            }`}
                    >
                        <Text
                            className={`font-semibold ${activeTab === tab
                                ? 'text-secondary-700 dark:text-secondary-300'
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
        </View>
    );
}
