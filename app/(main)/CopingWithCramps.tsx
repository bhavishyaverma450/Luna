import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function CopingWithCrampsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Relief Tips 🏃‍♀️</Text>
          <Text style={styles.paragraph}>
            When cramps hit, quick relief is often all you want. Here are a few simple things you can try right now:
          </Text>
          <View style={styles.tipContainer}>
            <Ionicons name="thermometer-outline" size={24} color="#f43f5e" style={styles.tipIcon} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Apply Heat</Text>
              <Text style={styles.tipText}>
                Place a heating pad or hot water bottle on your lower abdomen or lower back. Heat helps relax the muscles that are cramping. A warm bath can also be very effective.
              </Text>
            </View>
          </View>
          <View style={styles.tipContainer}>
            <Ionicons name="walk-outline" size={24} color="#f43f5e" style={styles.tipIcon} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Light Exercise</Text>
              <Text style={styles.tipText}>
                Gentle movements like walking, stretching, or light yoga can increase blood flow and reduce pain. Try a few simple stretches for your back and hips.
              </Text>
            </View>
          </View>
          <View style={styles.tipContainer}>
            <Ionicons name="medical-outline" size={24} color="#f43f5e" style={styles.tipIcon} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Massage</Text>
              <Text style={styles.tipText}>
                Gently massaging your lower belly in a circular motion can help ease tension and discomfort.
              </Text>
            </View>
          </View>
          <View style={styles.tipContainer}>
            <Ionicons name="water-outline" size={24} color="#f43f5e" style={styles.tipIcon} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay Hydrated</Text>
              <Text style={styles.tipText}>
                Drinking plenty of water is essential. Dehydration can sometimes make cramps worse.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Causes Cramps? 🤔</Text>
          <Text style={styles.paragraph}>
            Period cramps, also known as **dysmenorrhea**, are caused by **prostaglandins**, which are hormone-like substances released by your uterine lining during your period. They cause the muscles of your uterus to contract and shed its lining. The more prostaglandins your body produces, the more intense your cramps may be.
          </Text>
          <Text style={styles.paragraph}>
            While cramps are a normal part of the menstrual cycle, there are other factors that can influence their severity, including:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Age: Younger people often experience more severe cramps.</Text>
            <Text style={styles.listItem}>• Lifestyle: Diet, stress, and exercise habits can play a role.</Text>
            <Text style={styles.listItem}>• Underlying Conditions: Conditions like endometriosis or fibroids can lead to more painful cramps.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When to See a Doctor 👩‍⚕️</Text>
          <Text style={styles.paragraph}>
            Most period cramps are manageable at home, but you should consult a healthcare professional if you experience:
          </Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• **Cramps that are so severe** they prevent you from going about your daily activities.</Text>
            <Text style={styles.listItem}>• Pain that gets **progressively worse** over time or is not relieved by over-the-counter medication.</Text>
            <Text style={styles.listItem}>• Cramps accompanied by **heavy bleeding or large blood clots**.</Text>
            <Text style={styles.listItem}>• Pain that occurs at times other than your period.</Text>
          </View>
          <Text style={styles.paragraph}>
            Your doctor can help determine the cause and recommend a personalized treatment plan, which might include stronger pain relievers, birth control pills, or other therapies.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fde3f0',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 10,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 4,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f43f5e',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  list: {
    marginLeft: 10,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
});