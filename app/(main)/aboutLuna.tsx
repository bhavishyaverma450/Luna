import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// Import Lottie
import LottieView from "lottie-react-native";

export default function AboutLuna() {
  return (
    <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
          
          <View style={styles.card}>
            <Text style={styles.title}>About Luna</Text>
            <Text style={styles.description}>
              Luna is your personal wellness app, helping you track cycles, symptoms, and more. 
              Stay informed, track your progress, and gain insights for a healthier lifestyle.
            </Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          <View style={styles.card}>
            <LottieView
              source={require("@/anim/cooking.json")}
              autoPlay
              loop
              style={styles.lottie}
            />
            <Text style={styles.title}>Diet Planning</Text>
            <Text style={styles.description}>
              Get personalized diet plans based on your goals and cycle. 
              Track nutrition, calories, and meal schedules for a balanced lifestyle.
            </Text>
          </View>

          <View style={styles.card}>
            <LottieView
              source={require("@/anim/Workout.json")}
              autoPlay
              loop
              style={styles.lottie}
            />
            <Text style={styles.title}>Workout Planning</Text>
            <Text style={styles.description}>
              Access tailored workout routines that match your fitness level and goals. 
              Track progress, set reminders, and stay consistent with your fitness journey.
            </Text>
          </View>
          
          {/* Credits Card - Added for you */}
          <View style={styles.card}>
            <Text style={styles.title}>Credits</Text>
            <Text style={styles.description}>
              This app was designed and developed by Bhavishya Verma. 
              My goal is to create beautiful and functional wellness applications to help woman live healthier lives using technology.
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  card: { 
    backgroundColor: "#fff", 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: "center",
  },
  lottie: { width: 120, height: 120, marginBottom: 15 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8, color: "#333", textAlign: "center" },
  description: { fontSize: 16, lineHeight: 24, color: "#555", textAlign: "center" },
  version: { fontSize: 14, color: "#888", textAlign: "right", marginTop: 10 },
});