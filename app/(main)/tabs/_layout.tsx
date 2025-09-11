import { Tabs } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, Text } from 'react-native';

export default function HomeWithTabs() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#ef5da8',
          tabBarInactiveTintColor: '#a0a0a0',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Today",
            tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="secret-chats"
          options={{
            title: "Secret Chats",
            tabBarIcon: ({ color }) => <Ionicons name="chatbox-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="articles"
          options={{
            title: "Articles",
            tabBarIcon: ({ color }) => <Ionicons name="mail-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="partner"
          options={{
            title: "Partner",
            tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 5,
    height: 80, 
    paddingTop: 10,
    paddingBottom: 15,
    marginBottom: 2,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});