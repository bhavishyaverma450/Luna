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
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";

export default function PeriodFriendlyFoodsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#bbf7d0", "#86efac"]}
          style={styles.headerWrapper}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#22c55e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Period-Friendly Foods 🌱</Text>
        </LinearGradient>

        {/* Card 1 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nutrition for a Better Period</Text>
          <Text style={styles.paragraph}>
            Eating the right foods during your period can make a big difference
            in how you feel. A balanced diet helps manage cramps, bloating, and
            mood swings while keeping your energy stable.
          </Text>
        </View>

        {/* Card 2 - Food List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Foods to Eat for Comfort</Text>

          <View style={styles.foodItemContainer}>
            <Ionicons
              name="nutrition-outline"
              size={26}
              color="#16a34a"
              style={styles.foodIcon}
            />
            <Text style={styles.foodText}>
              <Text style={styles.foodHighlight}>Leafy Greens:</Text> Spinach
              and kale are rich in iron, helping combat fatigue from blood loss.
            </Text>
          </View>

          <View style={styles.foodItemContainer}>
            <Ionicons
              name="fish-outline"
              size={26}
              color="#0284c7"
              style={styles.foodIcon}
            />
            <Text style={styles.foodText}>
              <Text style={styles.foodHighlight}>Fatty Fish:</Text> Salmon and
              tuna are high in Omega-3s, which reduce inflammation and muscle
              pain.
            </Text>
          </View>

          <View style={styles.foodItemContainer}>
            <Ionicons
              name="cube-outline"
              size={26}
              color="#9333ea"
              style={styles.foodIcon}
            />
            <Text style={styles.foodText}>
              <Text style={styles.foodHighlight}>Whole Grains:</Text> Oats and
              brown rice provide B vitamins and magnesium for energy and muscle
              relaxation.
            </Text>
          </View>

          <View style={styles.foodItemContainer}>
            <Ionicons
              name="fast-food-outline"
              size={26}
              color="#dc2626"
              style={styles.foodIcon}
            />
            <Text style={styles.foodText}>
              <Text style={styles.foodHighlight}>Fruits:</Text> Watermelon and
              cucumber are water-rich, easing bloating and helping hydration.
            </Text>
          </View>
        </View>
        <View style={styles.card}>
            <LottieView
                source={require('@/anim/Nutrition.json')}
                style={{height:180}}
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
    backgroundColor: "#f0fdf4",
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
    shadowOpacity: 0.1,
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
    color: "#065f46",
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
    color: "#14532d",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
  },
  foodItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  foodIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  foodText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  foodHighlight: {
    fontWeight: "600",
    color: "#16a34a",
  },
});
