import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import CompletedQuestsGallery from '../../../src/components/CompletedQuestsGallery';
import CreateListModal from '../../../src/components/CreateListModal';
import QuestBoard from '../../../src/components/QuestBoard';
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
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <View className="bg-white dark:bg-slate-900 pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Our Lists</Text>
        <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">Shared bucket lists with your partner</Text>
      </View>

      {/* Mood Check-In Widget */}
      <View className="mx-4 mt-4 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
        <Text className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">How are you feeling today?</Text>
        <View className="flex-row justify-between mb-3">
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood}
              onPress={() => handleMoodSelect(mood)}
              className={`w-12 h-12 rounded-full items-center justify-center ${myMood?.mood === mood ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-400 dark:border-primary-500' : 'bg-gray-50 dark:bg-slate-700'
                }`}
            >
              <Text className="text-2xl">{mood}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {(myMood || partnerMood) && (
          <View className="flex-row items-center pt-2 border-t border-gray-50 dark:border-slate-700">
            {myMood && (
              <View className="flex-row items-center mr-4">
                <Text className="text-xs text-gray-400 dark:text-slate-500 mr-1">You:</Text>
                <Text className="text-lg">{myMood.mood}</Text>
              </View>
            )}
            {partnerMood && (
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-400 dark:text-slate-500 mr-1">Partner:</Text>
                <Text className="text-lg">{partnerMood.mood}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Daily & Weekly Quests */}
      <QuestBoard />

      {/* Historical Quests */}
      <CompletedQuestsGallery />

      {/* Date Night Quick Link */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/datenight')}
        className="mx-4 mt-3 bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-center border border-gray-100 dark:border-slate-700"
      >
        <Text className="text-2xl mr-3">🎲</Text>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">Date Night Roulette</Text>
          <Text className="text-xs text-gray-400 dark:text-slate-400">Add ideas & spin to pick one!</Text>
        </View>
        <Text className="text-gray-300 dark:text-slate-600 text-xl">›</Text>
      </TouchableOpacity>

      {/* Recipes Quick Link */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/recipes')}
        className="mx-4 mt-3 bg-white dark:bg-slate-800 rounded-2xl p-4 flex-row items-center border border-gray-100 dark:border-slate-700"
      >
        <Text className="text-2xl mr-3">🍳</Text>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">Recipes</Text>
          <Text className="text-xs text-gray-400 dark:text-slate-400">Ingredients checklist & cooking steps</Text>
        </View>
        <Text className="text-gray-300 dark:text-slate-600 text-xl">›</Text>
      </TouchableOpacity>

      {/* Countdown Widget */}
      {nextEvent && (
        <TouchableOpacity
          onPress={() => router.push('/(app)/(tabs)/events')}
          className="mx-4 mt-3 rounded-2xl p-4 flex-row items-center bg-indigo-50 dark:bg-indigo-900"
        >
          <Text className="text-3xl mr-3">{nextEvent.icon}</Text>
          <View className="flex-1">
            <Text className="text-sm text-indigo-700 dark:text-primary-300 font-medium">{nextEvent.title}</Text>
            <Text className="text-xs text-indigo-500 dark:text-primary-400 mt-0.5">{nextEvent.date}</Text>
          </View>
          <View className="bg-indigo-600 dark:bg-primary-600 rounded-xl px-3 py-2 items-center">
            <Text className="text-white text-lg font-bold">
              {getDaysUntil(nextEvent.date)}
            </Text>
            <Text className="text-indigo-200 dark:text-primary-200 text-xs">days</Text>
          </View>
        </TouchableOpacity>
      )}

      {lists.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📝</Text>
          <Text className="text-lg font-semibold text-gray-700 dark:text-slate-300 text-center">No lists yet</Text>
          <Text className="text-gray-400 dark:text-slate-500 text-center mt-2">
            Create your first shared list to start planning together!
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="mt-6 bg-indigo-600 dark:bg-primary-600 rounded-xl py-3 px-8"
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
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-3 flex-row items-center border border-gray-100 dark:border-slate-700"
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: item.color + '20' }}
              >
                <Text className="text-2xl">{item.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</Text>
              </View>
              <Text className="text-gray-300 dark:text-slate-600 text-xl">›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Add Button */}
      {lists.length > 0 && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute bottom-24 right-6 w-14 h-14 bg-indigo-600 dark:bg-primary-500 rounded-full items-center justify-center"
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
