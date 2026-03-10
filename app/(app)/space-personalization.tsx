import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ColorPicker, { HueSlider, InputWidget, Panel1, Preview } from 'reanimated-color-picker';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { getSpaceDetails, Space, updateSpacePersonalization } from '../../src/services/spaceService';


const PRIMARY_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Fuchsia', value: '#d946ef' },
    { name: 'Slate', value: '#475569' },
];

const SECONDARY_COLORS = [
    { name: 'White', value: '#ffffff' },
    { name: 'Zinc 50', value: '#fafafa' },
    { name: 'Slate 100', value: '#f1f5f9' },
    { name: 'Slate 800', value: '#1e293b' },
    { name: 'Slate 900', value: '#0f172a' },
    { name: 'Indigo 50', value: '#eef2ff' },
    { name: 'Rose 50', value: '#fff1f2' },
];

const BG_IMAGES = [
    { name: 'Starry Night', value: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80' },
    { name: 'Abstract Waves', value: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80' },
    { name: 'Soft Gradient', value: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80' },
];

const CUSTOMIZABLE_TABS = [
    { key: 'datenight', defaultName: 'Date Night' },
    { key: 'album', defaultName: 'Our Album' },
    { key: 'music', defaultName: 'Our Music' },
    { key: 'notes', defaultName: 'Chats' },
    { key: 'lists', defaultName: 'Lists' },
];

export default function SpacePersonalizationScreen() {
    const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
    const { user, spaces } = useAuth();
    const { customization } = useTheme();
    const { theme } = customization;
    const router = useRouter();

    const [space, setSpace] = useState<Space | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [primaryColor, setPrimaryColor] = useState('#6366f1');
    const [secondaryColor, setSecondaryColor] = useState('#ffffff');
    const [tertiaryType, setTertiaryType] = useState<'color' | 'image'>('color');
    const [tertiaryValue, setTertiaryValue] = useState('#f1f5f9');

    // Modals for color pickers
    const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
    const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
    const [showTertiaryPicker, setShowTertiaryPicker] = useState(false);

    const [nicknames, setNicknames] = useState<Record<string, string>>({});
    const [tabNames, setTabNames] = useState<Record<string, string>>({});

    useEffect(() => {
        loadSpaceDetails();
    }, [spaceId]);

    const loadSpaceDetails = async () => {
        if (!spaceId) return;
        setLoading(true);
        try {
            const details = await getSpaceDetails(spaceId);
            setSpace(details);
            if (details) {
                if (details.theme) {
                    setPrimaryColor(details.theme.primary || '#6366f1');
                    setSecondaryColor(details.theme.secondary || '#ffffff');
                    setTertiaryType(details.theme.tertiary?.type || 'color');
                    setTertiaryValue(details.theme.tertiary?.value || '#f1f5f9');
                } else if ((details as any).themeColor) {
                    // Legacy fallback
                    setPrimaryColor((details as any).themeColor);
                }

                setNicknames(details.nicknames || {});
                setTabNames(details.tabNames || {});
            }
        } catch (error) {
            console.error('Failed to load space details:', error);
            Alert.alert('Error', 'Failed to load personalization settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user || !spaceId) return;
        setSaving(true);
        try {
            // Clean up empty tab names
            const cleanedTabNames = { ...tabNames };
            Object.keys(cleanedTabNames).forEach(key => {
                if (!cleanedTabNames[key].trim()) {
                    delete cleanedTabNames[key];
                }
            });

            await updateSpacePersonalization(spaceId, {
                theme: {
                    primary: primaryColor,
                    secondary: secondaryColor,
                    tertiary: { type: tertiaryType, value: tertiaryValue }
                },
                nicknames,
                tabNames: cleanedTabNames,
            });

            Alert.alert('Saved!', 'Personalization options updated successfully.');
            router.back();
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert('Error', error.message || 'Failed to update personalization settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-transparent">
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!space) {
        return (
            <View className="flex-1 justify-center items-center bg-transparent px-6">
                <Text className="text-lg text-gray-500 dark:text-slate-400">Space not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 py-3 px-6 rounded-xl" style={{ backgroundColor: theme.primary }}>
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isOwner = spaces.find(s => s.id === spaceId)?.role === 'owner';

    const handleTabNameChange = (key: string, value: string) => {
        setTabNames(prev => ({ ...prev, [key]: value }));
    };

    const handleNicknameChange = (uid: string, value: string) => {
        setNicknames(prev => ({ ...prev, [uid]: value }));
    };

    return (
        <ScrollView className="flex-1 bg-secondary">
            <View className="px-6 py-6 pb-20">

                {/* Primary Theme Color */}
                <View className="bg-secondary rounded-2xl p-5 mb-6 shadow-sm border border-secondary-100 dark:border-secondary-100/20">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Primary Color</Text>
                    <Text className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                        Used for buttons, highlights, and active states.
                    </Text>
                    <TouchableOpacity
                        className="h-16 rounded-xl border-2 border-slate-200 dark:border-slate-700 items-center justify-center flex-row"
                        style={{ backgroundColor: primaryColor }}
                        onPress={() => isOwner && setShowPrimaryPicker(true)}
                    >
                        <Text className="font-bold text-white uppercase drop-shadow-md">{primaryColor}</Text>
                        {!isOwner && <Ionicons name="lock-closed" size={16} color="white" style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                </View>

                {/* Secondary Theme Color */}
                <View className="bg-secondary rounded-2xl p-5 mb-6 shadow-sm border border-secondary-100 dark:border-secondary-100/20">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Secondary Color</Text>
                    <Text className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                        Used for widget backgrounds and secondary cards.
                    </Text>
                    <TouchableOpacity
                        className="h-16 rounded-xl border-2 border-slate-200 dark:border-slate-700 items-center justify-center flex-row"
                        style={{ backgroundColor: secondaryColor }}
                        onPress={() => isOwner && setShowSecondaryPicker(true)}
                    >
                        <Text className="font-bold text-gray-800 dark:text-white uppercase drop-shadow-md">{secondaryColor}</Text>
                        {!isOwner && <Ionicons name="lock-closed" size={16} color="#64748b" style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                </View>

                {/* Tertiary Background / Image */}
                <View className="bg-secondary rounded-2xl p-5 mb-6 shadow-sm border border-secondary-100 dark:border-secondary-100/20">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">App Background</Text>
                    <Text className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                        Set the overall app background to a color or an image.
                    </Text>

                    <View className="flex-row mb-4 bg-secondary/50 p-1 rounded-xl">
                        <TouchableOpacity
                            className={`flex-1 py-2 items-center rounded-lg ${tertiaryType === 'color' ? 'bg-white shadow-sm dark:bg-slate-600' : ''}`}
                            onPress={() => isOwner ? setTertiaryType('color') : null}
                        >
                            <Text className={`font-semibold ${tertiaryType === 'color' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>Color</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-2 items-center rounded-lg ${tertiaryType === 'image' ? 'bg-white shadow-sm dark:bg-slate-600' : ''}`}
                            onPress={() => isOwner ? setTertiaryType('image') : null}
                        >
                            <Text className={`font-semibold ${tertiaryType === 'image' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}>Image</Text>
                        </TouchableOpacity>
                    </View>

                    {tertiaryType === 'color' ? (
                        <TouchableOpacity
                            className="h-16 rounded-xl border-2 border-slate-200 dark:border-slate-700 items-center justify-center flex-row"
                            style={{ backgroundColor: tertiaryValue }}
                            onPress={() => isOwner && setShowTertiaryPicker(true)}
                        >
                            <Text className="font-bold text-gray-800 dark:text-white uppercase drop-shadow-md">{tertiaryValue}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                {BG_IMAGES.map((img, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => isOwner ? setTertiaryValue(img.value) : null}
                                        className="mr-3 relative rounded-xl overflow-hidden"
                                        style={{ borderWidth: tertiaryValue === img.value ? 3 : 0, borderColor: primaryColor }}
                                    >
                                        <Image source={{ uri: img.value }} style={{ width: 100, height: 100 }} />
                                        {tertiaryValue === img.value && (
                                            <View className="absolute inset-0 bg-black/20 justify-center items-center">
                                                <Ionicons name="checkmark-circle" size={32} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <Text className="text-xs text-gray-500 dark:text-slate-400 mb-1">Or paste custom image URL:</Text>
                            <TextInput
                                className="bg-secondary border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm"
                                placeholder="https://..."
                                placeholderTextColor="#9ca3af"
                                value={tertiaryValue}
                                onChangeText={setTertiaryValue}
                                editable={isOwner}
                            />
                        </View>
                    )}
                </View>

                {/* Member Nicknames */}
                <View className="bg-secondary rounded-2xl p-5 mb-6 shadow-sm border border-secondary-100 dark:border-secondary-100/20">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Member Nicknames</Text>
                    <Text className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                        Set fun nicknames for each member in this space.
                    </Text>

                    {space.members?.map((uid, index) => (
                        <View key={uid} className="mb-4">
                            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                {uid === user?.uid ? 'Your Nickname' : `Member ${index + 1} Nickname`}
                            </Text>
                            <TextInput
                                className="bg-secondary border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-base"
                                placeholder={uid === user?.uid ? "e.g. Me" : "e.g. Partner"}
                                placeholderTextColor="#9ca3af"
                                value={nicknames[uid] || ''}
                                onChangeText={(text) => handleNicknameChange(uid, text)}
                                editable={isOwner || uid === user?.uid} // Anyone can edit their own, owner can edit all
                            />
                        </View>
                    ))}
                </View>

                {/* Custom Tab Names */}
                <View className="bg-secondary rounded-2xl p-5 mb-6 shadow-sm border border-secondary-100 dark:border-secondary-100/20">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">Custom Tab Names</Text>
                    <Text className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                        Rename standard sections to fit your unique style.
                    </Text>

                    {CUSTOMIZABLE_TABS.map(tab => (
                        <View key={tab.key} className="mb-4">
                            <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">
                                {tab.defaultName} Tab
                            </Text>
                            <TextInput
                                className="bg-secondary border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-base"
                                placeholder={`Default: ${tab.defaultName}`}
                                placeholderTextColor="#9ca3af"
                                value={tabNames[tab.key] || ''}
                                onChangeText={(text) => handleTabNameChange(tab.key, text)}
                                editable={isOwner}
                            />
                        </View>
                    ))}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className="py-4 rounded-xl items-center shadow-sm"
                    style={{ backgroundColor: primaryColor, opacity: saving ? 0.7 : 1 }}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Save Personalization</Text>
                    )}
                </TouchableOpacity>

            </View>

            {/* Modals for Color Pickers */}
            <Modal visible={showPrimaryPicker} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-transparent p-6 rounded-t-3xl h-[60%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold dark:text-white">Primary Color</Text>
                            <TouchableOpacity onPress={() => setShowPrimaryPicker(false)}>
                                <Ionicons name="close" size={24} className="color-slate-900 dark:color-white" />
                            </TouchableOpacity>
                        </View>
                        <ColorPicker style={{ flex: 1, gap: 20 }} value={primaryColor} onComplete={({ hex }) => setPrimaryColor(hex)}>
                            <Preview />
                            <Panel1 />
                            <HueSlider />
                            <InputWidget inputStyle={{ color: 'black' }} />
                        </ColorPicker>
                        <TouchableOpacity
                            className="bg-primary py-4 rounded-xl mt-6 items-center"
                            onPress={() => setShowPrimaryPicker(false)}
                        >
                            <Text className="font-bold text-white text-lg">Select</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showSecondaryPicker} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-transparent p-6 rounded-t-3xl h-[60%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold dark:text-white">Secondary Color</Text>
                            <TouchableOpacity onPress={() => setShowSecondaryPicker(false)}>
                                <Ionicons name="close" size={24} className="color-slate-900 dark:color-white" />
                            </TouchableOpacity>
                        </View>
                        <ColorPicker style={{ flex: 1, gap: 20 }} value={secondaryColor} onComplete={({ hex }) => setSecondaryColor(hex)}>
                            <Preview />
                            <Panel1 />
                            <HueSlider />
                            <InputWidget inputStyle={{ color: 'black' }} />
                        </ColorPicker>
                        <TouchableOpacity
                            className="bg-primary py-4 rounded-xl mt-6 items-center"
                            onPress={() => setShowSecondaryPicker(false)}
                        >
                            <Text className="font-bold text-white text-lg">Select</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showTertiaryPicker} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-transparent p-6 rounded-t-3xl h-[60%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold dark:text-white">Tertiary Color (Background)</Text>
                            <TouchableOpacity onPress={() => setShowTertiaryPicker(false)}>
                                <Ionicons name="close" size={24} className="color-slate-900 dark:color-white" />
                            </TouchableOpacity>
                        </View>
                        <ColorPicker style={{ flex: 1, gap: 20 }} value={tertiaryValue} onComplete={({ hex }) => setTertiaryValue(hex)}>
                            <Preview />
                            <Panel1 />
                            <HueSlider />
                            <InputWidget inputStyle={{ color: 'black' }} />
                        </ColorPicker>
                        <TouchableOpacity
                            className="bg-primary py-4 rounded-xl mt-6 items-center"
                            onPress={() => setShowTertiaryPicker(false)}
                        >
                            <Text className="font-bold text-white text-lg">Select</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
