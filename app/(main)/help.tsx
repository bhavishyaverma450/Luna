// help.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Help() {
  const router = useRouter();

  const faqs = [
    {
      question: "How do I track my cycle?",
      answer: "Go to the Home screen, tap on 'Track Cycle' and input your dates. Luna will automatically predict your ovulation and fertile days.",
    },
    {
      question: "How do I update my profile?",
      answer: "Go to Settings > Update Profile. You can edit your personal information and goals.",
    },
    {
      question: "Can I use biometric authentication?",
      answer: "Yes! Enable App Lock and turn on Biometrics from Settings > App Lock & Security.",
    },
    {
      question: "How do I reset my password?",
      answer: "Go to Profile > Change Password and follow the instructions to reset your password securely.",
    },
  ];

  const contactSupport = () => {
    Linking.openURL("mailto:support@lunaapp.com");
  };

  return (
    <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
        <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20 }}>
            <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Help & Support</Text>
            <View style={{ width: 24 }} />
            </View>

            <Text style={styles.sectionTitle}>FAQs</Text>
            {faqs.map((faq, index) => (
            <View key={index} style={styles.card}>
                <Text style={styles.question}>{faq.question}</Text>
                <Text style={styles.answer}>{faq.answer}</Text>
            </View>
            ))}
            <Text style={styles.sectionTitle}>Contact Support</Text>
            <View style={styles.card}>
            <Text style={styles.description}>
                If your question is not answered above, feel free to contact our support team.
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={contactSupport}>
                <Text style={styles.contactButtonText}>Email Support</Text>
            </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Tips</Text>
            <View style={styles.card}>
            <Text style={styles.description}>• Enable notifications to never miss your cycle updates.</Text>
            <Text style={styles.description}>• Keep your profile updated for personalized recommendations.</Text>
            <Text style={styles.description}>• Use biometric authentication for quick and secure login.</Text>
            </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "600", color: "#333" },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 10 },
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
  },
  question: { fontSize: 16, fontWeight: "700", marginBottom: 6, color: "#333" },
  answer: { fontSize: 15, color: "#555", lineHeight: 22 },
  description: { fontSize: 15, color: "#555", lineHeight: 22, marginBottom: 8 },
  contactButton: {
    marginTop: 10,
    backgroundColor: "#ff5083",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  contactButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
