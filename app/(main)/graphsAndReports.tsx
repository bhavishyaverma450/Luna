// graphsAndReports.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart, BarChart } from "react-native-chart-kit";

// Get screen width for responsive charts
const screenWidth = Dimensions.get("window").width;

// 1. Cycle Length Data
const cycleLengthData = {
  labels: ["Last 3", "Last 2", "Last 1", "Avg"],
  datasets: [{
    data: [28, 30, 29, 29], // Example: Your last 3 cycles and calculated average
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    strokeWidth: 2,
  }],
};

// 2. Fertile Window & Ovulation Data
const fertileWindowData = {
  labels: ["Day 1", "Day 5", "Day 10", "Day 14", "Day 18", "Day 22"],
  datasets: [{
    data: [0.1, 0.2, 0.5, 1, 0.7, 0.3], // Example: Fertility score from low (0.1) to high (1)
    color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Use a different color for this line
    strokeWidth: 2,
  }],
};

// 3. Symptom & Mood Data (Bar Chart)
const symptomData = {
  labels: ["Cramps", "Mood Swings", "Headache", "Fatigue"],
  datasets: [{
    data: [3, 4, 2, 5], // Example: Symptom intensity on a scale of 1-5
    colors: [
      (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
      (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
      (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
      (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
    ],
  }],
};

// Chart configuration
const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#ffa726",
  },
  propsForBackgroundLines: {
    strokeDasharray: "", // makes the background lines solid
  }
};

export default function GraphsAndReports() {
  return (
    <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Graphs & Reports</Text>
          </View>

          {/* Cycle Length Summary Card */}
          <View style={[styles.card, styles.cycleSummaryCard]}>
            <Text style={styles.title}>Your Cycle History</Text>
            <Text style={styles.description}>
              See your past cycle lengths to understand your average period duration.
            </Text>
            <LineChart
              data={cycleLengthData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>

          {/* Fertility Trends Card */}
          <View style={[styles.card, styles.fertilityTrendsCard]}>
            <Text style={styles.title}>Fertility Trends</Text>
            <Text style={styles.description}>
              Visualize your most fertile days to predict your ovulation window.
            </Text>
            <LineChart
              data={fertileWindowData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero={true}
            />
          </View>

          {/* Health Reports Card */}
          <View style={[styles.card, styles.healthReportsCard]}>
            <Text style={styles.title}>Symptom and Mood Tracker</Text>
            <Text style={styles.description}>
              Monitor daily symptoms and mood changes to identify personal patterns.
            </Text>
            <BarChart
              data={symptomData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              fromZero={true}
              showValuesOnTopOfBars={true}
            />
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollViewContent: { paddingVertical: 20, paddingHorizontal: 20 },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  card: {
    backgroundColor: "#fff", // Default fallback
    borderRadius: 20,
    padding: 25,
    marginBottom: 20, // Increased margin for better separation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  // Pastel background colors for each card
  cycleSummaryCard: {
    backgroundColor: '#FCE4EC', // Light Pink
  },
  fertilityTrendsCard: {
    backgroundColor: '#E0F2F7', // Light Blue
  },
  healthReportsCard: {
    backgroundColor: '#E8F5E9', // Light Green
  },
  title: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24, color: "#555", marginBottom: 12 },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },
});