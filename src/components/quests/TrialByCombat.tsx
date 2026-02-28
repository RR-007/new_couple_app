import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TrialByCombatProps {
    targetPhrase: string;
    onSuccess: (timeMs: number) => void;
    onCancel: () => void;
}

export default function TrialByCombat({ targetPhrase, onSuccess, onCancel }: TrialByCombatProps) {
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (startTime && !isComplete) {
            interval = setInterval(() => {
                setCurrentTime(Date.now() - startTime);
            }, 50);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [startTime, isComplete]);

    const handleTextChange = (text: string) => {
        if (!startTime) {
            setStartTime(Date.now());
        }

        setInput(text);

        if (text === targetPhrase) {
            setIsComplete(true);
            Keyboard.dismiss();

            // Give a short delay to see the success state
            setTimeout(() => {
                onSuccess(Date.now() - (startTime || Date.now()));
            }, 1000);
        }
    };

    // Calculate mistakes for real-time feedback
    const getHighlightedText = () => {
        const result = [];
        let hasError = false;

        for (let i = 0; i < targetPhrase.length; i++) {
            if (i < input.length) {
                if (input[i] === targetPhrase[i] && !hasError) {
                    result.push(<Text key={i} className="text-green-400 font-inter">{targetPhrase[i]}</Text>);
                } else {
                    hasError = true;
                    result.push(<Text key={i} className="text-red-500 font-inter bg-red-500/20">{targetPhrase[i]}</Text>);
                }
            } else {
                result.push(<Text key={i} className="text-gray-500 font-inter">{targetPhrase[i]}</Text>);
            }
        }
        return <Text className="text-2xl font-bold font-serif leading-tight">{result}</Text>;
    };

    const formatTime = (ms: number) => {
        const totalSeconds = ms / 1000;
        return totalSeconds.toFixed(2) + 's';
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-black"
        >
            <View className="flex-1 p-6 justify-center">
                <TouchableOpacity onPress={onCancel} className="absolute top-12 left-6 z-10 p-2">
                    <MaterialIcons name="close" size={28} color="white" />
                </TouchableOpacity>

                <View className="items-center mb-10">
                    <Text className="text-red-500 font-bold tracking-widest uppercase mb-2">Trial by Combat</Text>
                    <Text className="text-white text-3xl font-serif text-center">Type this exactly:</Text>

                    <View className="bg-gray-900 border border-red-900/50 p-6 rounded-2xl mt-8 w-full shadow-lg shadow-red-900/20">
                        {getHighlightedText()}
                    </View>
                </View>

                <View className="items-center mb-8">
                    <Text className="text-gray-400 font-mono text-xl">
                        {formatTime(currentTime)}
                    </Text>
                </View>

                <TextInput
                    className={`bg-gray-800 text-white p-5 rounded-2xl text-xl font-inter border-2 ${isComplete ? 'border-green-500' : 'border-transparent'}`}
                    placeholder="Type here to start timer..."
                    placeholderTextColor="#6b7280"
                    autoCorrect={false}
                    autoCapitalize="none"
                    value={input}
                    onChangeText={handleTextChange}
                    editable={!isComplete}
                    autoFocus
                />

                {isComplete && (
                    <View className="items-center mt-8 space-y-2">
                        <View className="bg-green-500/20 px-6 py-2 rounded-full border border-green-500/50 flex-row items-center">
                            <MaterialIcons name="done" size={20} color="#4ade80" />
                            <Text className="text-green-400 font-bold ml-1">PERFECT!</Text>
                        </View>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}
