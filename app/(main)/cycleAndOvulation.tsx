// cycleAndOvulation.tsx
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export default function CycleAndOvulation() {
  return (
    <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20 }}>
          
          {/* Cycle Overview Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Cycle Overview</Text>
            <Text style={styles.description}>
              Your current cycle is 28 days. Track your period start and end dates to get accurate ovulation predictions.
            </Text>
          </View>

          {/* Next Ovulation Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Next Ovulation</Text>
            <Text style={styles.description}>
              Predicted ovulation day: 14th day of your cycle. Your fertile window is from day 12 to day 16.
            </Text>
          </View>

          {/* Fertility Tips Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Fertility Tips</Text>
            <Text style={styles.description}>
              Stay hydrated, maintain a healthy diet, and track your basal body temperature for better insights.
            </Text>
          </View>

          {/* Optional Lottie Animation */}
          <View style={styles.card}>
            <Text style={styles.title}>Cycle Progress</Text>
            <Text style={styles.description}>
              (Add Lottie animation here for cycle/ovulation visualization)
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, color: "#555" },
});
