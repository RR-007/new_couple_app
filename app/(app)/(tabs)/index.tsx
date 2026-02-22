import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import CreateListModal from '../../../src/components/CreateListModal';
import { useAuth } from '../../../src/context/AuthContext';
import { CoupleEvent, getDaysUntil, subscribeToEvents } from '../../../src/services/eventService';
import { CoupleList, createList, subscribeToLists } from '../../../src/services/listService';
import {
  logMood,
  MoodEntry,
  MOODS,
  subscribeToTodaysMoods,
} from '../../../src/services/moodService';

export default function ListsDashboard() {
  const { user, coupleId } = useAuth();
  const router = useRouter();
  const [lists, setLists] = useState<CoupleList[]>([]);
  const [nextEvent, setNextEvent] = useState<CoupleEvent | null>(null);
  const [todayMoods, setTodayMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!coupleId) return;

    const unsubLists = subscribeToLists(coupleId, (data) => {
      setLists(data);
      setLoading(false);
    });

    const unsubEvents = subscribeToEvents(coupleId, (events) => {
      const upcoming = events
        .filter((e) => getDaysUntil(e.date) >= 0)
        .sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
      setNextEvent(upcoming.length > 0 ? upcoming[0] : null);
    });

    const unsubMoods = subscribeToTodaysMoods(coupleId, (moods) => {
      setTodayMoods(moods);
    });

    return () => {
      unsubLists();
      unsubEvents();
      unsubMoods();
    };
  }, [coupleId]);

  const myMood = todayMoods.find((m) => m.uid === user?.uid);
  const partnerMood = todayMoods.find((m) => m.uid !== user?.uid);

  const handleMoodSelect = async (mood: string) => {
    if (!coupleId || !user) return;
    try {
      await logMood(coupleId, mood, user.uid);
    } catch (e) {
      console.error('Error logging mood:', e);
    }
  };

  const handleCreate = async (name: string, icon: string, color: string) => {
    if (!coupleId || !user) return;
    try {
      await createList(coupleId, name, icon, color, user.uid);
      setModalVisible(false);
    } catch (e) {
      console.error('Error creating list:', e);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Our Lists</Text>
        <Text className="text-sm text-gray-500 mt-1">Shared bucket lists with your partner</Text>
      </View>

      {/* Mood Check-In Widget */}
      <View className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-gray-100">
        <Text className="text-sm font-semibold text-gray-700 mb-2">How are you feeling today?</Text>
        <View className="flex-row justify-between mb-3">
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood}
              onPress={() => handleMoodSelect(mood)}
              className={`w-12 h-12 rounded-full items-center justify-center ${myMood?.mood === mood ? 'bg-indigo-100 border-2 border-indigo-400' : 'bg-gray-50'
                }`}
            >
              <Text className="text-2xl">{mood}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {(myMood || partnerMood) && (
          <View className="flex-row items-center pt-2 border-t border-gray-50">
            {myMood && (
              <View className="flex-row items-center mr-4">
                <Text className="text-xs text-gray-400 mr-1">You:</Text>
                <Text className="text-lg">{myMood.mood}</Text>
              </View>
            )}
            {partnerMood && (
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-400 mr-1">Partner:</Text>
                <Text className="text-lg">{partnerMood.mood}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Date Night Quick Link */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/datenight')}
        className="mx-4 mt-3 bg-white rounded-2xl p-4 flex-row items-center border border-gray-100"
      >
        <Text className="text-2xl mr-3">🎲</Text>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">Date Night Roulette</Text>
          <Text className="text-xs text-gray-400">Add ideas & spin to pick one!</Text>
        </View>
        <Text className="text-gray-300 text-xl">›</Text>
      </TouchableOpacity>

      {/* Countdown Widget */}
      {nextEvent && (
        <TouchableOpacity
          onPress={() => router.push('/(app)/(tabs)/events')}
          className="mx-4 mt-3 rounded-2xl p-4 flex-row items-center"
          style={{ backgroundColor: '#4F46E520' }}
        >
          <Text className="text-3xl mr-3">{nextEvent.icon}</Text>
          <View className="flex-1">
            <Text className="text-sm text-indigo-700 font-medium">{nextEvent.title}</Text>
            <Text className="text-xs text-indigo-500 mt-0.5">{nextEvent.date}</Text>
          </View>
          <View className="bg-indigo-600 rounded-xl px-3 py-2 items-center">
            <Text className="text-white text-lg font-bold">
              {getDaysUntil(nextEvent.date)}
            </Text>
            <Text className="text-indigo-200 text-xs">days</Text>
          </View>
        </TouchableOpacity>
      )}

      {lists.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📝</Text>
          <Text className="text-lg font-semibold text-gray-700 text-center">No lists yet</Text>
          <Text className="text-gray-400 text-center mt-2">
            Create your first shared list to start planning together!
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="mt-6 bg-indigo-600 rounded-xl py-3 px-8"
          >
            <Text className="text-white font-semibold text-base">Create First List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(app)/list/[id]', params: { id: item.id, name: item.name, icon: item.icon, color: item.color } })}
              className="bg-white rounded-2xl p-5 mb-3 flex-row items-center shadow-sm border border-gray-100"
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: item.color + '20' }}
              >
                <Text className="text-2xl">{item.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
              </View>
              <Text className="text-gray-300 text-xl">›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Add Button */}
      {lists.length > 0 && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute bottom-24 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-white text-3xl leading-none">+</Text>
        </TouchableOpacity>
      )}

      <CreateListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreate}
      />
    </View>
  );
}
