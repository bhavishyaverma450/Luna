import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "../../contexts/SettingsContext";

export default function AppSettings() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  const toggleSetting = (key: keyof typeof settings) => {
    updateSetting(key, !settings[key]);
  };

  const handleFeedback = () => {
    Alert.alert("Feedback", "This will open feedback form (to be implemented).");
  };

  const handleLanguage = () => {
    Alert.alert("Language", "This will open language selection (to be implemented).");
  };

  return (
    <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>App Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <Text style={styles.optionLabel}>Enable Notifications</Text>
          <Switch
            value={settings.notifications}
            onValueChange={() => toggleSetting("notifications")}
            trackColor={{ false: "#ccc", true: "#ff5083" }}
            thumbColor="#fff"
          />
        </View>

        {/* Dark Mode */}
        <View style={styles.card}>
          <Text style={styles.optionLabel}>Dark Mode</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={() => toggleSetting("darkMode")}
            trackColor={{ false: "#ccc", true: "#ff5083" }}
            thumbColor="#fff"
          />
        </View>

        {/* Auto Update */}
        <View style={styles.card}>
          <Text style={styles.optionLabel}>Automatic Updates</Text>
          <Switch
            value={settings.autoUpdate}
            onValueChange={() => toggleSetting("autoUpdate")}
            trackColor={{ false: "#ccc", true: "#ff5083" }}
            thumbColor="#fff"
          />
        </View>

        {/* Language */}
        <TouchableOpacity style={styles.cardTouchable} onPress={handleLanguage}>
          <Text style={styles.optionLabel}>Language</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Feedback */}
        <TouchableOpacity style={styles.cardTouchable} onPress={handleFeedback}>
          <Text style={styles.optionLabel}>Send Feedback</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.sectionTitle}>About App</Text>
        <View style={styles.card}>
          <Text style={styles.optionLabel}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingTop: 20 },
  title: { fontSize: 20, fontWeight: "600", color: "#333" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginVertical: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTouchable: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  optionLabel: { fontSize: 16, color: "#333" },
});
