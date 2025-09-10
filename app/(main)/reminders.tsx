import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Reminder {
  id: string;
  title: string;
  enabled: boolean;
}

export default function Reminders() {
  const router = useRouter();

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: "1", title: "Track Cycle", enabled: true },
    { id: "2", title: "Drink Water", enabled: false },
    { id: "3", title: "Workout Reminder", enabled: true },
  ]);

  const [newReminder, setNewReminder] = useState("");

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const addReminder = () => {
    if (newReminder.trim() === "") return;
    setReminders((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newReminder, enabled: true },
    ]);
    setNewReminder("");
    Alert.alert("Reminder added!");
  };

  return (
    <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Reminders</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Add New Reminder */}
          <View style={styles.addReminderCard}>
            <TextInput
              style={styles.input}
              placeholder="Add new reminder"
              value={newReminder}
              onChangeText={setNewReminder}
            />
            <TouchableOpacity style={styles.addButton} onPress={addReminder}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Existing Reminders */}
          <Text style={styles.sectionTitle}>Your Reminders</Text>
          {reminders.map((reminder) => (
            <View key={reminder.id} style={styles.card}>
              <Text style={styles.reminderText}>{reminder.title}</Text>
              <Switch
                value={reminder.enabled}
                onValueChange={() => toggleReminder(reminder.id)}
                trackColor={{ false: "#ccc", true: "#ff5083" }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "600", color: "#333" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginVertical: 10 },
  addReminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 5 },
  addButton: { backgroundColor: "#ff5083", borderRadius: 25, padding: 10, marginLeft: 10, justifyContent: "center", alignItems: "center" },
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
  reminderText: { fontSize: 16, color: "#333" },
});
