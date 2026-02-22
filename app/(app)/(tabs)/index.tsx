import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../../src/config/firebase';
import { useAuth } from '../../../src/context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-8">
      <View className="w-full max-w-sm items-center space-y-6">
        <Text className="text-4xl mb-2">💑</Text>
        <Text className="text-2xl font-bold text-gray-900 text-center">
          You're Connected!
        </Text>
        <Text className="text-gray-500 text-center text-base mt-2">
          Welcome back, {user?.email}
        </Text>
        <Text className="text-gray-400 text-center text-sm mt-4">
          Your shared lists and features are coming soon in Phase 2!
        </Text>

        <TouchableOpacity
          onPress={handleLogout}
          className="mt-8 bg-red-50 border border-red-200 rounded-xl py-3 px-6"
        >
          <Text className="text-red-600 font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
