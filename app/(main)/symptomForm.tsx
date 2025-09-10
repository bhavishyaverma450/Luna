import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useRouter } from "expo-router";

export default function SymptomForm() {
  const router = useRouter();
  const [symptom, setSymptom] = useState("");
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!symptom) {
      Alert.alert("Please enter at least one symptom");
      return;
    }
    console.log("Saved:", { symptom, note });
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
        <Text style={styles.title}>Log Symptoms</Text>

        <TextInput
            style={styles.input}
            placeholder="Enter symptom (e.g., cramps, headache)"
            value={symptom}
            onChangeText={setSymptom}
        />

        <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Add any notes..."
            value={note}
            onChangeText={setNote}
            multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
