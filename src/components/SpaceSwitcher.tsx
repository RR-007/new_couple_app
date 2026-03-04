import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SPACE_EMOJI: Record<string, string> = {
    partner: '❤️',
    friends: '🙌',
    squad: '🔥',
};

export default function SpaceSwitcher() {
    const { spaces, activeSpaceId, setActiveSpace } = useAuth();
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);

    const activeSpace = spaces.find(s => s.id === activeSpaceId);

    if (!activeSpace && spaces.length === 0) return null;

    const handleSwitch = async (spaceId: string) => {
        await setActiveSpace(spaceId);
        setModalVisible(false);
    };

    return (
        <>
            {/* Tappable chip in the header */}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="flex-row items-center bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-full"
            >
                <Text className="text-sm mr-1">
                    {activeSpace ? SPACE_EMOJI[activeSpace.type] || '🌌' : '🌌'}
                </Text>
                <Text className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 max-w-[120px]" numberOfLines={1}>
                    {activeSpace?.name || 'Select Space'}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#6366f1" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            {/* Bottom sheet style modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                    className="flex-1 bg-black/40 justify-end"
                >
                    <TouchableOpacity activeOpacity={1} onPress={() => { }}>
                        <View className="bg-white dark:bg-slate-900 rounded-t-3xl px-6 pt-5 pb-10">
                            {/* Handle bar */}
                            <View className="items-center mb-4">
                                <View className="w-10 h-1 bg-gray-300 dark:bg-slate-700 rounded-full" />
                            </View>

                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Switch Space
                            </Text>

                            {/* Space list */}
                            {spaces.map(space => (
                                <TouchableOpacity
                                    key={space.id}
                                    onPress={() => handleSwitch(space.id)}
                                    className={`flex-row items-center p-4 rounded-xl mb-2 border ${activeSpaceId === space.id
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700'
                                            : 'bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700'
                                        }`}
                                >
                                    <Text className="text-xl mr-3">
                                        {SPACE_EMOJI[space.type] || '🌌'}
                                    </Text>
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-gray-900 dark:text-white">
                                            {space.name}
                                        </Text>
                                        <Text className="text-xs text-gray-500 dark:text-slate-400 capitalize">
                                            {space.type} Space
                                        </Text>
                                    </View>
                                    {activeSpaceId === space.id && (
                                        <Ionicons name="checkmark-circle" size={22} color="#6366f1" />
                                    )}
                                </TouchableOpacity>
                            ))}

                            {/* Manage button */}
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(false);
                                    // @ts-ignore — Expo Router types may be stale
                                    router.push('/(app)/space-hub');
                                }}
                                className="flex-row items-center justify-center mt-3 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700"
                            >
                                <Ionicons name="settings-outline" size={18} color="#6366f1" />
                                <Text className="text-indigo-600 dark:text-indigo-400 font-semibold ml-2">
                                    Manage Spaces
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    );
}
