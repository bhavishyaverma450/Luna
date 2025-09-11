// app/(main)/_layout.tsx
import { Tabs, Stack, useRouter } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';

export default function TabLayout() {
  const router = useRouter();

  const handlePressSettings = () => {
    router.push("/(main)/settings");
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ presentation: 'modal', title: 'Settings' }} />
    </Stack>
  );
}