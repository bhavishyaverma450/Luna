// cycleAndOvulation.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LottieView from 'lottie-react-native';

export default function CycleAndOvulation() {
  return (
    <LinearGradient colors={['#fef9fb', '#fdf2f8']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Cycle & Ovulation</Text>
          </View>

          {/* Cycle Overview Card - Light Blue */}
          <View style={[styles.card, styles.cycleOverviewCard]}>
            <Text style={styles.cardTitle}>Cycle Overview</Text>
            <Text style={styles.description}>
              Your current cycle is 28 days. Track your period start and end dates to get accurate
              ovulation predictions.
            </Text>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('@/anim/Meditating Lady.json')}
                autoPlay
                loop
                style={styles.lottieStyle}
              />
            </View>
          </View>

          {/* Next Ovulation Card - Light Green */}
          <View style={[styles.card, styles.nextOvulationCard]}>
            <Text style={styles.cardTitle}>Next Ovulation</Text>
            <Text style={styles.description}>
              Predicted ovulation day: 14th day of your cycle. Your fertile window is from day 12 to
              day 16.
            </Text>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('@/anim/Meditation mindfulness.json')}
                autoPlay
                loop
                style={styles.lottieStyle}
              />
            </View>
          </View>

          {/* Fertility Tips Card - Light Pink */}
          <View style={[styles.card, styles.fertilityTipsCard]}>
            <Text style={styles.cardTitle}>Fertility Tips</Text>
            <Text style={styles.description}>
              Stay hydrated, maintain a healthy diet, and track your basal body temperature for
              better insights.
            </Text>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('@/anim/wired-flat-1270-fetus-hover-pinch.json')}
                autoPlay
                loop
                style={styles.lottieStyle}
              />
            </View>
          </View>

          {/* Cycle Progress Card - Light Lavender */}
          <View style={[styles.card, styles.cycleProgressCard]}>
            <Text style={styles.cardTitle}>Cycle Progress Visualization</Text>
            <Text style={styles.description}>
              A dynamic visual representation of your current cycle stage.
            </Text>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('@/anim/girl-cycling-in-autumn.json')}
                autoPlay
                loop
                style={styles.lottieStyle}
              />
            </View>
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
  // Default card style
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  // Unique color for each card
  cycleOverviewCard: {
    backgroundColor: '#E9F4F6', // A light blue-green
  },
  nextOvulationCard: {
    backgroundColor: '#F3EFE9', // A light green//#C5E0D8
  },
  fertilityTipsCard: {
    backgroundColor: '#F3E9F3', // A light pink/purple
  },
  cycleProgressCard: {
    backgroundColor: '#E6E6FA', // A light lavender
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 15,
  },
  animationContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  lottieStyle: {
    width: '100%',
    height: '100%',
  },
});