import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ICONS = ['📝', '✈️', '🍳', '🎮', '🎬', '📚', '🏋️', '🎵', '🛒', '💡', '🎯', '❤️'];
const COLORS = ['#4F46E5', '#DC2626', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0891B2', '#4B5563'];

interface CreateListModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (name: string, icon: string, color: string) => void;
}

export default function CreateListModal({ visible, onClose, onCreate }: CreateListModalProps) {
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('📝');
    const [selectedColor, setSelectedColor] = useState('#4F46E5');
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!name.trim()) {
            setError('Please enter a list name.');
            return;
        }
        onCreate(name.trim(), selectedIcon, selectedColor);
        // Reset state
        setName('');
        setSelectedIcon('📝');
        setSelectedColor('#4F46E5');
        setError('');
    };

    const handleClose = () => {
        setName('');
        setSelectedIcon('📝');
        setSelectedColor('#4F46E5');
        setError('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">New List</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Text className="text-gray-400 text-2xl">✕</Text>
                        </TouchableOpacity>
                    </View>

                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-4">
                            <Text className="text-red-700 text-sm text-center">{error}</Text>
                        </View>
                    ) : null}

                    <Text className="text-sm font-medium text-gray-700 mb-1">List Name</Text>
                    <TextInput
                        className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50 mb-5"
                        placeholder="e.g. Travel Bucket List"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={(t) => { setName(t); setError(''); }}
                        autoFocus
                    />

                    <Text className="text-sm font-medium text-gray-700 mb-2">Icon</Text>
                    <View className="flex-row flex-wrap gap-2 mb-5">
                        {ICONS.map((icon) => (
                            <TouchableOpacity
                                key={icon}
                                onPress={() => setSelectedIcon(icon)}
                                className={`w-11 h-11 rounded-xl items-center justify-center ${selectedIcon === icon ? 'bg-indigo-100 border-2 border-indigo-500' : 'bg-gray-100'
                                    }`}
                            >
                                <Text className="text-xl">{icon}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-sm font-medium text-gray-700 mb-2">Color</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {COLORS.map((color) => (
                            <TouchableOpacity
                                key={color}
                                onPress={() => setSelectedColor(color)}
                                className={`w-11 h-11 rounded-full items-center justify-center ${selectedColor === color ? 'border-2 border-gray-900' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            >
                                {selectedColor === color && (
                                    <Text className="text-white font-bold">✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleCreate}
                        className="w-full py-4 rounded-xl items-center"
                        style={{ backgroundColor: selectedColor }}
                    >
                        <Text className="text-white font-bold text-lg">Create List</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
