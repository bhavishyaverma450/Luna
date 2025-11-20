// AppLockScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Appearance,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../../contexts/SettingsContext";

// You do not need to import expo-app-icon here, it's globally available
// as part of the expo-updates package with the correct configuration.

export default function AppLockScreen() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setBiometricSupported(compatible);
    })();
  }, []);

  const handleAppLockToggle = async (value: boolean) => {
    if (value) {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert(
          "App Lock",
          "No biometrics or passcode enrolled on your device. Please set one up in your device settings."
        );
        return;
      }
    }
    updateSetting("appLockEnabled", value);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert("Biometric", "No biometrics enrolled on your device. Please set one up in your device settings.");
        return;
      }
    }
    updateSetting("biometricEnabled", value);
  };

  const handleAppearanceChange = (value: "light" | "dark" | "automatic") => {
    updateSetting("appAppearance", value);
    // The settings context now handles setting the color scheme
  };

  const handleHideAppIconToggle = async (value: boolean) => {
    try {
      if (value) {
        // @ts-ignore
        await expo.appIcon.setAppIcon('hidden');
        Alert.alert("App Icon Hidden", "The app icon has been hidden. To unhide, you may need to open the app via a link or widget.");
      } else {
        // @ts-ignore
        await expo.appIcon.setAppIcon('default');
      }
      updateSetting("hideAppIcon", value);
    } catch (e) {
      console.error("Failed to change app icon:", e);
      Alert.alert("Error", "Could not change app icon. This feature may not be supported on your device or requires additional configuration.");
    }
  };

  return (
    <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>App Lock & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* App Lock Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>App Lock</Text>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Enable App Lock</Text>
          <Switch
            trackColor={{ false: "#ccc", true: "#ffe0eb" }}
            thumbColor={settings.appLockEnabled ? "#ff5083" : "#fff"}
            ios_backgroundColor="#ccc"
            value={settings.appLockEnabled}
            onValueChange={handleAppLockToggle}
          />
        </View>
      </View>

      {/* Biometric Section */}
      {settings.appLockEnabled && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Biometric Authentication</Text>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Enable Biometrics</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#ffe0eb" }}
              thumbColor={settings.biometricEnabled ? "#ff5083" : "#fff"}
              ios_backgroundColor="#ccc"
              value={settings.biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!biometricSupported}
            />
          </View>
          {!biometricSupported && (
            <Text style={styles.disabledText}>
              Biometrics are not supported on this device.
            </Text>
          )}
        </View>
      )}

      {/* App Appearance Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>App Appearance</Text>
        {(["light", "dark", "automatic"] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={styles.appearanceOption}
            onPress={() => handleAppearanceChange(mode)}
          >
            <Text style={styles.optionLabel}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
            {settings.appAppearance === mode && (
              <Ionicons name="checkmark" size={20} color="#ff5083" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Hide App Icon Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>App Icon</Text>
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Hide App Icon</Text>
          <Switch
            trackColor={{ false: "#ccc", true: "#ffe0eb" }}
            thumbColor={settings.hideAppIcon ? "#ff5083" : "#fff"}
            ios_backgroundColor="#ccc"
            value={settings.hideAppIcon}
            onValueChange={handleHideAppIconToggle}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: 20,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#333" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#444",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionLabel: { fontSize: 16, color: "#555" },
  appearanceOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  disabledText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    fontStyle: "italic",
  },
});