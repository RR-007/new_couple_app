import { ScrollView, Text, View } from 'react-native';
import CompletedQuestsGallery from '../../../src/components/CompletedQuestsGallery';
import QuestBoard from '../../../src/components/QuestBoard';

export default function QuestsScreen() {
    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
            {/* Header */}
            <View className="bg-white dark:bg-slate-900 pt-8 pb-4 px-6 border-b border-gray-100 dark:border-slate-800">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">Active Quests</Text>
                <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">Accept the challenge, upload proof, win glory.</Text>
            </View>

            <View className="border-b border-gray-100 dark:border-slate-800 pb-4">
                <QuestBoard />
            </View>

            <View className="mt-4">
                <View className="px-6 mb-2">
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">Quest History</Text>
                    <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">Past challenges you&apos;ve conquered together.</Text>
                </View>
                <CompletedQuestsGallery />
            </View>

            {/* Bottom Padding */}
            <View className="h-24" />
        </ScrollView>
    );
}
