import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HydrationIsKeyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#fbcfe8", "#f9a8d4"]}
          style={styles.headerWrapper}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#f43f5e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hydration is Key 💧</Text>
        </LinearGradient>

        {/* Card 1 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Why Hydration Matters During Your Period
          </Text>
          <Text style={styles.paragraph}>
            Staying hydrated is crucial throughout your menstrual cycle,
            especially during your period. It can help reduce bloating, ease
            cramps, and combat fatigue.
          </Text>
        </View>

        {/* Card 2 - Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Tips to Stay Hydrated</Text>

          <View style={styles.tipContainer}>
            <Ionicons
              name="water-outline"
              size={26}
              color="#2563eb"
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Drink water consistently: Aim for at least 8 glasses a day. Keep a
              water bottle with you to remind yourself.
            </Text>
          </View>

          <View style={styles.tipContainer}>
            <Ionicons
              name="beaker-outline"
              size={26}
              color="#16a34a"
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Include electrolytes: Try adding a pinch of sea salt to your water
              or drinking coconut water.
            </Text>
          </View>

          <View style={styles.tipContainer}>
            <Ionicons
              name="leaf-outline"
              size={26}
              color="#9333ea"
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Try herbal teas: Peppermint or ginger tea can soothe cramps and
              aid digestion while keeping you hydrated.
            </Text>
          </View>

          <View style={styles.tipContainer}>
            <Ionicons
              name="ban-outline"
              size={26}
              color="#dc2626"
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Limit caffeine and sugary drinks: These can dehydrate you and may
              worsen bloating and cramps.
            </Text>
          </View>
        </View>

        {/* Card 3 - Lottie */}
        <View style={styles.card}>
          <LottieView
            source={require("@/anim/Drink water.json")}
            style={{ height: 180 }}
            autoPlay
            loop
          />
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
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
  },
  lottieCard: {
    alignItems: "center",
  },
});
