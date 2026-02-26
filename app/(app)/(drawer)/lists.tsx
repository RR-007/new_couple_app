import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import CreateListModal from '../../../src/components/CreateListModal';
import { useAuth } from '../../../src/context/AuthContext';
import { CoupleList, createList, subscribeToLists } from '../../../src/services/listService';

export default function ListsDashboard() {
  const { user, coupleId } = useAuth();
  const router = useRouter();
  const [lists, setLists] = useState<CoupleList[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!coupleId) return;

    const unsubLists = subscribeToLists(coupleId, (data) => {
      setLists(data);
      setLoading(false);
    });

    return () => {
      unsubLists();
    };
  }, [coupleId]);

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

      {/* Static Recipes Link */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/recipes')}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 mx-4 mt-4 flex-row items-center border border-gray-100 dark:border-slate-700"
      >
        <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-orange-50 dark:bg-slate-700/50">
          <Text className="text-2xl">🍳</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">Recipes</Text>
          <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Ingredients checklist & cooking steps</Text>
        </View>
        <Text className="text-gray-300 dark:text-slate-600 text-xl">›</Text>
      </TouchableOpacity>

      {/* Static Watchlist Link */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/watchlist')}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 mx-4 mt-3 flex-row items-center border border-gray-100 dark:border-slate-700"
      >
        <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-blue-50 dark:bg-slate-700/50">
          <Text className="text-2xl">🎬</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">Watchlist</Text>
          <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Movies & Shows to watch together</Text>
        </View>
        <Text className="text-gray-300 dark:text-slate-600 text-xl">›</Text>
      </TouchableOpacity>


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
