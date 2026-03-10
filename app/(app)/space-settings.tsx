import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { getSpaceDetails, leaveSpace, renameSpace, Space } from '../../src/services/spaceService';

export default function SpaceSettingsScreen() {
    const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
    const { user, spaces, activeSpaceId, setActiveSpace } = useAuth();
    const router = useRouter();

    const [space, setSpace] = useState<Space | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);

    const userSpaceRecord = spaces.find(s => s.id === spaceId);
    const isOwner = userSpaceRecord?.role === 'owner';
    const isActive = activeSpaceId === spaceId;

    useEffect(() => {
        loadSpaceDetails();
    }, [spaceId]);

    const loadSpaceDetails = async () => {
        if (!spaceId) return;
        setLoading(true);
        try {
            const details = await getSpaceDetails(spaceId);
            setSpace(details);
            if (details) setNewName(details.name);
        } catch (error) {
            console.error('Failed to load space details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = async () => {
        if (space?.joinCode) {
            await Clipboard.setStringAsync(space.joinCode);
            Alert.alert('Copied!', 'Join code copied to clipboard.');
        }
    };

    const handleShareCode = async () => {
        if (space?.joinCode) {
            try {
                await Share.share({
                    message: `Join my space "${space.name}" on UsQuest! Use code: ${space.joinCode}`,
                });
            } catch (error) {
                // User cancelled
            }
        }
    };

    const handleRename = async () => {
        if (!user || !spaceId || !newName.trim()) return;
        setSaving(true);
        try {
            await renameSpace(user.uid, spaceId, newName.trim());
            setEditingName(false);
            loadSpaceDetails(); // Refresh
            Alert.alert('Renamed!', `Space renamed to "${newName.trim()}".`);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to rename space.');
        } finally {
            setSaving(false);
        }
    };

    const handleLeave = () => {
        const onlySpace = spaces.length <= 1;

        Alert.alert(
            'Leave Space',
            onlySpace
                ? "This is your only space. If you leave, you'll need to create or join a new one."
                : `Are you sure you want to leave "${space?.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: async () => {
                        if (!user || !spaceId) return;
                        try {
                            await leaveSpace(user.uid, spaceId);

                            // If this was the active space, switch to another or redirect to hub
                            if (isActive) {
                                const remaining = spaces.filter(s => s.id !== spaceId);
                                if (remaining.length > 0) {
                                    await setActiveSpace(remaining[0].id);
                                    router.replace('/(app)/(drawer)');
                                } else {
                                    // @ts-ignore
                                    router.replace('/(app)/space-hub');
                                }
                            } else {
                                router.back();
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to leave space.');
                        }
                    }
                }
            ]
        );
    };

    const handleSetActive = async () => {
        if (!spaceId) return;
        await setActiveSpace(spaceId);
        Alert.alert('Switched!', `Now viewing "${space?.name}".`);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-transparent">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (!space) {
        return (
            <View className="flex-1 justify-center items-center bg-transparent px-6">
                <Text className="text-lg text-gray-500 dark:text-slate-400">Space not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 py-3 px-6 bg-primary-600 rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const SPACE_EMOJI: Record<string, string> = {
        partner: '❤️',
        friends: '🙌',
        squad: '🔥',
    };

    return (
        <ScrollView className="flex-1 bg-transparent">
            <View className="px-6 py-8">
                {/* Space Header */}
                <View className="items-center mb-8">
                    <View className="bg-primary-100 dark:bg-primary-900/40 h-20 w-20 rounded-full items-center justify-center mb-3">
                        <Text className="text-4xl">{SPACE_EMOJI[space.type] || '🌌'}</Text>
                    </View>

                    {editingName ? (
                        <View className="flex-row items-center">
                            <TextInput
                                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-lg font-semibold flex-1 text-center"
                                value={newName}
                                onChangeText={setNewName}
                                autoFocus
                            />
                            <TouchableOpacity onPress={handleRename} disabled={saving} className="ml-2 p-2">
                                <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setEditingName(false); setNewName(space.name); }} className="ml-1 p-2">
                                <Ionicons name="close-circle" size={28} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => setEditingName(true)} className="flex-row items-center">
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white">{space.name}</Text>
                            <Ionicons name="pencil" size={16} color="#9ca3af" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    )}

                    <Text className="text-sm text-gray-500 dark:text-slate-400 capitalize mt-1">{space.type} Space</Text>
                    {isActive && (
                        <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full mt-2">
                            <Text className="text-green-700 dark:text-green-400 text-xs font-semibold">Currently Active</Text>
                        </View>
                    )}
                </View>

                {/* Join Code Section */}
                <View className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-5 mb-4 border border-secondary-100 dark:border-secondary-100/20">
                    <Text className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                        Join Code
                    </Text>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-3xl font-bold text-primary-600 dark:text-primary-400 tracking-[6px]">
                            {space.joinCode}
                        </Text>
                        <View className="flex-row">
                            <TouchableOpacity onPress={handleCopyCode} className="bg-primary-100 dark:bg-primary-900/40 p-3 rounded-xl mr-2">
                                <Ionicons name="copy-outline" size={20} color="#6366f1" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShareCode} className="bg-primary-100 dark:bg-primary-900/40 p-3 rounded-xl">
                                <Ionicons name="share-outline" size={20} color="#6366f1" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                        Share this code with others to let them join your space.
                    </Text>
                </View>

                {/* Members Section */}
                <View className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-5 mb-4 border border-secondary-100 dark:border-secondary-100/20">
                    <Text className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                        Members ({space.members?.length || 0})
                    </Text>
                    {space.members?.map((uid, index) => (
                        <View key={uid} className={`flex-row items-center py-3 ${index < space.members.length - 1 ? 'border-b border-gray-200 dark:border-slate-700' : ''}`}>
                            <View className="bg-primary-100 dark:bg-primary-900 h-10 w-10 rounded-full items-center justify-center mr-3">
                                <Ionicons name="person" size={18} color="#6366f1" />
                            </View>
                            <Text className="text-base text-gray-900 dark:text-white flex-1">
                                {uid === user?.uid ? 'You' : `Member ${index + 1}`}
                            </Text>
                            {uid === user?.uid && isOwner && (
                                <View className="bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                                    <Text className="text-amber-700 dark:text-amber-400 text-xs font-semibold">Owner</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Actions */}
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(app)/space-personalization' as any, params: { spaceId: space.id } })}
                    className="bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-200 dark:border-fuchsia-800 py-4 rounded-xl items-center mb-3 mt-4"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="color-palette-outline" size={20} color="#d946ef" className="dark:color-fuchsia-400" style={{ marginRight: 8 }} />
                        <Text className="text-fuchsia-600 dark:text-fuchsia-400 font-bold text-base">Personalization & Theme</Text>
                    </View>
                </TouchableOpacity>

                {!isActive && (
                    <TouchableOpacity
                        onPress={handleSetActive}
                        className="bg-primary-600 dark:bg-primary-500 py-4 rounded-xl items-center mb-3"
                    >
                        <Text className="text-white font-bold text-base">Switch to This Space</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={handleLeave}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 py-4 rounded-xl items-center mt-2"
                >
                    <Text className="text-red-600 dark:text-red-400 font-bold text-base">Leave Space</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
