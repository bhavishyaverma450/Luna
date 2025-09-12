import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "../../contexts/SettingsContext"; // Import the hook

export default function PrivacySettings() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  const toggleSetting = (key: keyof typeof settings) => {
    updateSetting(key, !settings[key]);
  };

  return (
    <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Privacy Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Privacy Options */}
        <Text style={styles.sectionTitle}>App Privacy</Text>
        <View style={styles.card}>
          <Text style={styles.optionLabel}>Enable App Privacy</Text>
          <Switch
            value={settings.appPrivacy}
            onValueChange={() => updateSetting("appPrivacy", !settings.appPrivacy)}
            trackColor={{ false: "#ccc", true: "#ff5083" }}
            thumbColor="#fff"
          />
        </View>

        <Text style={styles.sectionTitle}>Data & Permissions</Text>
        <View style={styles.card}>
          <Text style={styles.optionLabel}>Data Sharing with Partners</Text>
          <Switch
            value={settings.dataSharing}
            onValueChange={() => toggleSetting("dataSharing")}
            trackColor={{ false: "#ccc", true: "#ff5083" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.optionLabel}>Personalized Ads</Text>
          <Switch
            value={settings.personalizedAds}
            onValueChange={() => toggleSetting("personalizedAds")}
            trackColor={{ false: "#ccc", true: "#ff5083" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.optionLabel}>Allow Analytics</Text>
          <Switch
            value={settings.analytics}
            onValueChange={() => toggleSetting("analytics")}
            trackColor={{ false: "#ccc", true: "#ff5083" }}
            thumbColor="#fff"
          />
        </View>

        <Text style={styles.footerText}>
          Adjusting these settings helps you control your privacy and how your data is used in the app.
        </Text>
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
  optionLabel: { fontSize: 16, color: "#333" },
  footerText: { fontSize: 14, color: "#555", marginTop: 20, lineHeight: 20 },
});
