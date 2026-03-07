import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { deleteBudget, GiftBudget, GiftHistory, setGiftBudget, subscribeToBudgets, subscribeToGiftHistory } from '../../services/giftService';

export default function BudgetTab() {
    const { activeSpaceId } = useAuth();
    const [budgets, setBudgets] = useState<GiftBudget[]>([]);
    const [giftHistory, setGiftHistory] = useState<GiftHistory[]>([]);

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newOccasion, setNewOccasion] = useState('');
    const [newAmountLimit, setNewAmountLimit] = useState('');

    useEffect(() => {
        if (!activeSpaceId) return;
        const unsubBudgets = subscribeToBudgets(activeSpaceId, setBudgets);
        const unsubHistory = subscribeToGiftHistory(activeSpaceId, setGiftHistory);
        return () => {
            unsubBudgets();
            unsubHistory();
        };
    }, [activeSpaceId]);

    const handleSaveBudget = async () => {
        if (!newOccasion.trim() || !newAmountLimit || !activeSpaceId) {
            Alert.alert("Missing Fields", "Please enter occasion and amount limit.");
            return;
        }
        try {
            await setGiftBudget(activeSpaceId, newOccasion.trim(), parseFloat(newAmountLimit));
            setIsAddModalVisible(false);
            setNewOccasion('');
            setNewAmountLimit('');
        } catch (e) {
            console.error("Error setting budget:", e);
            Alert.alert("Error", "Could not save budget.");
        }
    };

    const handleDelete = (id: string) => {
        if (!activeSpaceId) return;
        Alert.alert("Delete Budget", "Are you sure you want to remove this budget?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteBudget(activeSpaceId, id) }
        ]);
    };

    const getSpentAmount = (occasion: string) => {
        return giftHistory
            .filter(g => g.occasion?.toLowerCase() === occasion.toLowerCase() && g.price)
            .reduce((sum, g) => sum + (g.price || 0), 0);
    };

    const renderItem = ({ item }: { item: GiftBudget }) => {
        const spent = getSpentAmount(item.occasion);
        const percentage = item.amountLimit > 0 ? Math.min((spent / item.amountLimit) * 100, 100) : 0;
        const isOverBudget = spent > item.amountLimit;

        return (
            <View className="bg-white dark:bg-slate-800 p-4 rounded-xl mb-4 shadow-sm border border-gray-100 dark:border-slate-700">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">{item.occasion}</Text>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-600 dark:text-slate-400">
                        ${spent.toFixed(2)} spent
                    </Text>
                    <Text className="text-sm font-bold text-gray-900 dark:text-white">
                        Budget: ${item.amountLimit.toFixed(2)}
                    </Text>
                </View>

                <View className="h-3 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <View
                        className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${percentage}%` }}
                    />
                </View>

                {isOverBudget && (
                    <Text className="text-xs text-red-500 font-bold mt-2">
                        Over budget by ${(spent - item.amountLimit).toFixed(2)}!
                    </Text>
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 p-4 bg-gray-50 dark:bg-slate-900">
            <FlatList
                data={budgets}
                keyExtractor={i => i.id}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                ListEmptyComponent={() => (
                    <View className="py-10 items-center justify-center">
                        <Ionicons name="wallet-outline" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 dark:text-slate-400 text-center mt-4">
                            No budgets set. Let's plan ahead!
                        </Text>
                    </View>
                )}
            />

            <TouchableOpacity
                onPress={() => setIsAddModalVisible(true)}
                className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            <Modal visible={isAddModalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold dark:text-white">Set Budget</Text>
                            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            placeholder="Occasion (e.g., Anniversary, Christmas)"
                            placeholderTextColor="#9CA3AF"
                            value={newOccasion}
                            onChangeText={setNewOccasion}
                            className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-3 dark:text-white"
                        />

                        <TextInput
                            placeholder="Amount Limit"
                            placeholderTextColor="#9CA3AF"
                            value={newAmountLimit}
                            onChangeText={setNewAmountLimit}
                            keyboardType="numeric"
                            className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-6 dark:text-white"
                        />

                        <TouchableOpacity
                            onPress={handleSaveBudget}
                            className="w-full bg-indigo-600 py-4 rounded-xl mb-8 items-center"
                        >
                            <Text className="text-white font-bold text-lg">Save Budget</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
