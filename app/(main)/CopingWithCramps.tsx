import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function CopingWithCrampsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#fecdd3", "#fda4af"]}
          style={styles.headerWrapper}
        >
          <Text style={styles.headerTitle}>Coping with Cramps 💕</Text>
        </LinearGradient>

        {/* Quick Relief Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Relief Tips 🏃‍♀️</Text>
          <Text style={styles.paragraph}>
            When cramps hit, quick relief is often all you want. Try these simple
            remedies right away:
          </Text>

          <View style={styles.tipContainer}>
            <Ionicons
              name="thermometer-outline"
              size={26}
              color="#e11d48"
              style={styles.tipIcon}
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Apply Heat</Text>
              <Text style={styles.tipText}>
                Use a heating pad or hot water bottle on your belly or lower
                back. Warm baths also help relax muscles.
              </Text>
            </View>
          </View>

          <View style={styles.tipContainer}>
            <Ionicons
              name="walk-outline"
              size={26}
              color="#e11d48"
              style={styles.tipIcon}
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Light Exercise</Text>
              <Text style={styles.tipText}>
                Gentle walking, stretching, or yoga can increase blood flow and
                ease pain.
              </Text>
            </View>
          </View>

          <View style={styles.tipContainer}>
            <Ionicons
              name="medical-outline"
              size={26}
              color="#e11d48"
              style={styles.tipIcon}
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Massage</Text>
              <Text style={styles.tipText}>
                A gentle circular massage on your belly can release tension and
                reduce cramps.
              </Text>
            </View>
          </View>

          <View style={styles.tipContainer}>
            <Ionicons
              name="water-outline"
              size={26}
              color="#e11d48"
              style={styles.tipIcon}
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay Hydrated</Text>
              <Text style={styles.tipText}>
                Drink plenty of water — dehydration can worsen cramps.
              </Text>
            </View>
          </View>
        </View>

        {/* What Causes Cramps */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What Causes Cramps? 🤔</Text>
          <Text style={styles.paragraph}>
            Period cramps (also called{" "}
            <Text style={styles.highlight}>dysmenorrhea</Text>) are caused by{" "}
            <Text style={styles.highlight}>prostaglandins</Text>, hormone-like
            substances that make your uterus contract and shed its lining. More
            prostaglandins = stronger cramps.
          </Text>
          <Text style={styles.paragraph}>
            Severity can also be influenced by:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Age – younger people often feel them more strongly</Text>
            <Text style={styles.listItem}>• Lifestyle – diet, stress, and exercise matter</Text>
            <Text style={styles.listItem}>
              • Underlying Conditions – such as endometriosis or fibroids
            </Text>
          </View>
        </View>

        {/* Animation */}
        <View style={styles.card}>
          <LottieView
            source={require("@/anim/calendar - woman.json")}
            style={{ height: 200 }}
            autoPlay
            loop
          />
        </View>

        {/* When to See a Doctor */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>When to See a Doctor 👩‍⚕️</Text>
          <Text style={styles.paragraph}>
            Cramps are normal, but seek medical advice if you notice:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>
              • Pain so severe it disrupts your daily routine
            </Text>
            <Text style={styles.listItem}>
              • Pain getting worse over time or not relieved by medicine
            </Text>
            <Text style={styles.listItem}>
              • Cramps with heavy bleeding or large blood clots
            </Text>
            <Text style={styles.listItem}>
              • Pain outside your period cycle
            </Text>
          </View>
          <Text style={styles.paragraph}>
            A doctor can recommend treatments such as stronger pain relief,
            birth control, or other therapies.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff0f6",
  },
  container: {
    padding: 20,
  },
  headerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#9f1239",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  animationCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#be123c",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 10,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e11d48",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  list: {
    marginLeft: 8,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 4,
  },
  highlight: {
    fontWeight: "600",
    color: "#dc2626",
  },
});
