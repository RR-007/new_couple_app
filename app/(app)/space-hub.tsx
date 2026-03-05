import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../src/config/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { createSpace, joinSpace } from '../../src/services/spaceService';

export default function SpaceHubScreen() {
    const { user, profile, spaces, activeSpaceId, setActiveSpace } = useAuth();
    const router = useRouter();

    // Join Space State
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);

    // Create Space State
    const [isCreating, setIsCreating] = useState(false);
    const [newSpaceName, setNewSpaceName] = useState('');
    const [newSpaceType, setNewSpaceType] = useState<'partner' | 'friends' | 'squad'>('partner');
    const [creating, setCreating] = useState(false);

    // Custom modal state
    const [successModal, setSuccessModal] = useState<{ visible: boolean; title: string; message: string; emoji: string }>(
        { visible: false, title: '', message: '', emoji: '' }
    );
    const scrollRef = useRef<ScrollView>(null);

    const handleJoin = async () => {
        if (!joinCode.trim() || joinCode.length !== 6) {
            Alert.alert("Invalid Code", "Please enter a valid 6-character space code.");
            return;
        }

        if (!user) return;

        setJoining(true);
        try {
            const joinedSpace = await joinSpace(user.uid, joinCode.trim().toUpperCase());
            await setActiveSpace(joinedSpace.id);
            setJoinCode('');
            setSuccessModal({
                visible: true,
                title: 'Welcome aboard!',
                message: `You've joined ${joinedSpace.name}! 🎉`,
                emoji: '🚀',
            });
            setTimeout(() => {
                setSuccessModal(prev => ({ ...prev, visible: false }));
                router.replace('/(app)/(drawer)');
            }, 2000);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to join space. Please check the code and try again.");
        } finally {
            setJoining(false);
        }
    };

    const handleCreate = async () => {
        if (!newSpaceName.trim()) {
            Alert.alert("Missing Name", "Please enter a name for your new space.");
            return;
        }

        if (!user) return;

        setCreating(true);
        try {
            const newSpace = await createSpace(user.uid, newSpaceName.trim(), newSpaceType);
            await setActiveSpace(newSpace.id);
            setNewSpaceName('');
            setIsCreating(false);
            setSuccessModal({
                visible: true,
                title: 'Space Created!',
                message: `${newSpace.name} is ready to go! Share your join code from settings 🎯`,
                emoji: '🎉',
            });
            setTimeout(() => {
                setSuccessModal(prev => ({ ...prev, visible: false }));
                router.replace('/(app)/(drawer)');
            }, 2500);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to create space.");
        } finally {
            setCreating(false);
        }
    };

    const selectActiveSpace = async (spaceId: string) => {
        await setActiveSpace(spaceId);
        router.replace('/(app)/(drawer)');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            className="flex-1 bg-white dark:bg-slate-900"
        >
            {/* Success Celebration Modal */}
            <Modal visible={successModal.visible} transparent animationType="fade">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: '#1e293b', borderRadius: 24, padding: 32, alignItems: 'center', marginHorizontal: 40, borderWidth: 1, borderColor: '#6366f1' }}>
                        <Text style={{ fontSize: 56, marginBottom: 12 }}>{successModal.emoji}</Text>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 }}>{successModal.title}</Text>
                        <Text style={{ fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 22 }}>{successModal.message}</Text>
                    </View>
                </View>
            </Modal>

            <ScrollView
                ref={scrollRef}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 py-12 px-6 relative">
                    {/* Header with Logout */}
                    <View className="flex-row justify-between items-center mb-10 pt-4">
                        <View>
                            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                Your Spaces
                            </Text>
                            <Text className="text-base text-gray-500 dark:text-slate-400">
                                {spaces.length > 0 ? "Select a space or join a new one." : "Create or join a space to get started."}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert("Logout", "Are you sure you want to log out?", [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Logout", style: "destructive", onPress: () => signOut(auth) }
                                ]);
                            }}
                            className="bg-indigo-50 dark:bg-slate-800 p-3 rounded-full"
                        >
                            <Ionicons name="log-out-outline" size={24} color="#6366f1" />
                        </TouchableOpacity>
                    </View>

                    {/* Existing Spaces */}
                    {spaces.length > 0 && (
                        <View className="mb-8">
                            <Text className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                My Active Spaces
                            </Text>
                            {spaces.map(space => (
                                <TouchableOpacity
                                    key={space.id}
                                    onPress={() => selectActiveSpace(space.id)}
                                    className={`flex-row items-center p-4 rounded-xl mb-3 border ${activeSpaceId === space.id
                                        ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800'
                                        : 'bg-white border-gray-100 shadow-sm dark:bg-slate-800 dark:border-slate-700'
                                        }`}
                                >
                                    <View className="bg-indigo-100 dark:bg-indigo-900 h-12 w-12 rounded-full items-center justify-center mr-4">
                                        <Text className="text-xl">
                                            {space.type === 'partner' ? '❤️' : space.type === 'friends' ? '🙌' : '🔥'}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-900 dark:text-white">{space.name}</Text>
                                        <Text className="text-xs text-gray-500 dark:text-slate-400 capitalize">{space.type} Space</Text>
                                    </View>
                                    {activeSpaceId === space.id && (
                                        <View className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full mr-2">
                                            <Text className="text-green-700 dark:text-green-400 text-xs font-semibold">Active</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            // @ts-ignore
                                            router.push({ pathname: '/(app)/space-settings', params: { spaceId: space.id } });
                                        }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        className="p-2"
                                    >
                                        <Ionicons name="settings-outline" size={20} color="#9ca3af" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Action Cards (Join / Create) */}
                    <View className="mt-4">
                        <Text className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                            Join or Create
                        </Text>

                        {/* Join a Space */}
                        <View className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-5 mb-4 border border-gray-100 dark:border-slate-700">
                            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
                                Join with a Code
                            </Text>
                            <TextInput
                                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest uppercase mb-3"
                                placeholder="000000"
                                placeholderTextColor="#94a3b8"
                                value={joinCode}
                                onChangeText={setJoinCode}
                                maxLength={6}
                                autoCapitalize="characters"
                            />
                            <TouchableOpacity
                                onPress={handleJoin}
                                disabled={joining || joinCode.length !== 6}
                                className={`w-full py-3 rounded-xl items-center ${joining || joinCode.length !== 6 ? 'bg-indigo-300 dark:bg-indigo-800' : 'bg-indigo-600 dark:bg-indigo-500'
                                    }`}
                            >
                                {joining ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Join Space</Text>}
                            </TouchableOpacity>
                        </View>

                        {/* Create a Space */}
                        {!isCreating ? (
                            <TouchableOpacity
                                onPress={() => setIsCreating(true)}
                                className="bg-white dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-5 items-center justify-center flex-row"
                            >
                                <Ionicons name="add-circle-outline" size={24} color="#6366f1" className="mr-2" />
                                <Text className="text-indigo-600 dark:text-indigo-400 font-bold ml-2">Create a New Space</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900 rounded-2xl p-5">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white">New Space Details</Text>
                                    <TouchableOpacity onPress={() => setIsCreating(false)}>
                                        <Ionicons name="close-circle" size={24} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 mb-4 font-medium"
                                    placeholder="Space Name (e.g. The Besties)"
                                    placeholderTextColor="#94a3b8"
                                    value={newSpaceName}
                                    onChangeText={setNewSpaceName}
                                />

                                <Text className="text-xs font-bold text-gray-400 dark:text-slate-500 mb-2 uppercase">Space Type</Text>
                                <View className="flex-row space-x-2 mb-5">
                                    {['partner', 'friends', 'squad'].map(type => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setNewSpaceType(type as any)}
                                            className={`flex-1 py-2 rounded-lg items-center border ${newSpaceType === type
                                                ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/40 dark:border-indigo-500'
                                                : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700'
                                                }`}
                                        >
                                            <Text className={newSpaceType === type ? 'text-indigo-600 dark:text-indigo-400 font-bold capitalize' : 'text-gray-500 dark:text-slate-400 capitalize'}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    onPress={handleCreate}
                                    disabled={creating || !newSpaceName.trim()}
                                    className={`w-full py-3 rounded-xl items-center ${creating || !newSpaceName.trim() ? 'bg-indigo-300 dark:bg-indigo-800' : 'bg-indigo-600 dark:bg-indigo-500'
                                        }`}
                                >
                                    {creating ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Create Space</Text>}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
