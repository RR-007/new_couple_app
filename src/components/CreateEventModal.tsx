import React, { useState } from 'react';
import { Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

const EVENT_ICONS = ['💍', '🎂', '✈️', '🎄', '🎉', '💝', '🏠', '🎓', '👶', '📅'];

interface CreateEventModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (title: string, date: string, icon: string) => void;
}

export default function CreateEventModal({ visible, onClose, onCreate }: CreateEventModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('💍');
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!title.trim()) {
            setError('Please enter an event name.');
            return;
        }
        if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            setError('Please enter a valid date (YYYY-MM-DD).');
            return;
        }
        onCreate(title.trim(), date, selectedIcon);
        setTitle('');
        setDate('');
        setSelectedIcon('💍');
        setError('');
    };

    const handleClose = () => {
        setTitle('');
        setDate('');
        setSelectedIcon('💍');
        setError('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">New Event</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Text className="text-gray-400 text-2xl">✕</Text>
                        </TouchableOpacity>
                    </View>

                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-4">
                            <Text className="text-red-700 text-sm text-center">{error}</Text>
                        </View>
                    ) : null}

                    <Text className="text-sm font-medium text-gray-700 mb-1">Event Name</Text>
                    <TextInput
                        className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50 mb-4"
                        placeholder="e.g. Our Anniversary"
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={(t) => { setTitle(t); setError(''); }}
                        autoFocus
                    />

                    <Text className="text-sm font-medium text-gray-700 mb-1">Date (YYYY-MM-DD)</Text>
                    <TextInput
                        className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-gray-50 mb-5"
                        placeholder="2026-06-15"
                        placeholderTextColor="#9CA3AF"
                        value={date}
                        onChangeText={(t) => { setDate(t); setError(''); }}
                        keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'}
                    />

                    <Text className="text-sm font-medium text-gray-700 mb-2">Icon</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {EVENT_ICONS.map((icon) => (
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

                    <TouchableOpacity
                        onPress={handleCreate}
                        className="w-full bg-indigo-600 py-4 rounded-xl items-center"
                    >
                        <Text className="text-white font-bold text-lg">Add Event</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
