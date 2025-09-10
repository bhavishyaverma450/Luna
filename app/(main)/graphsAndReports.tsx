// graphsAndReports.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function GraphsAndReports() {
  return (
    <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20 }}>
          
          {/* Cycle Summary Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Cycle Summary</Text>
            <Text style={styles.description}>
              Track your last 3 cycles, average cycle length, and predict your next period with visual charts.
            </Text>
            <Text style={styles.placeholder}>[Add Line/Bar Chart Here]</Text>
          </View>

          {/* Fertility Trends Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Fertility Trends</Text>
            <Text style={styles.description}>
              Visualize your fertile days over past cycles to understand patterns and trends.
            </Text>
            <Text style={styles.placeholder}>[Add Trend Graph Here]</Text>
          </View>

          {/* Health Reports Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Health Reports</Text>
            <Text style={styles.description}>
              Monitor symptoms, mood changes, and other wellness metrics with easy-to-read graphs.
            </Text>
            <Text style={styles.placeholder}>[Add Report Graphs Here]</Text>
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
  description: { fontSize: 16, lineHeight: 24, color: "#555", marginBottom: 12 },
  placeholder: { fontSize: 14, color: "#aaa", fontStyle: "italic" },
});
