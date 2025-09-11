import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface Question {
  id: number;
  question: string;
  options: { value: string; label: string; score: number }[];
}

const pcosQuestions: Question[] = [
  {
    id: 1,
    question: "How regular are your menstrual cycles?",
    options: [
      { value: "regular", label: "Regular (21-35 days)", score: 0 },
      { value: "irregular", label: "Irregular or absent", score: 3 },
      { value: "rare", label: "Rare (less than 8 per year)", score: 5 },
    ],
  },
  {
    id: 2,
    question: "Do you experience excessive hair growth (hirsutism)?",
    options: [
      { value: "no", label: "No, or very little", score: 0 },
      { value: "yes", label: "Yes, on my face, chest, or back", score: 5 },
    ],
  },
  {
    id: 3,
    question: "Have you noticed persistent acne that doesn't respond to treatment?",
    options: [
      { value: "no", label: "No, my acne is manageable", score: 0 },
      { value: "yes", label: "Yes, persistent and severe acne", score: 3 },
    ],
  },
  {
    id: 4,
    question: "Do you have unexplained weight gain or difficulty losing weight?",
    options: [
      { value: "no", label: "No", score: 0 },
      { value: "yes", label: "Yes, particularly around the abdomen", score: 4 },
    ],
  },
  {
    id: 5,
    question: "Do you experience thinning hair on your scalp?",
    options: [
      { value: "no", label: "No", score: 0 },
      { value: "yes", label: "Yes, noticeable hair thinning", score: 2 },
    ],
  },
  {
    id: 6,
    question: "Have you been diagnosed with ovarian cysts?",
    options: [
      { value: "no", label: "No", score: 0 },
      { value: "yes", label: "Yes, diagnosed by a doctor", score: 5 },
      { value: "dontKnow", label: "I don't know", score: 0 },
    ],
  },
];

export default function PcosChecker() {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const handleAnswer = (questionId: number, answerValue: string) => {
    setAnswers({ ...answers, [questionId]: answerValue });
  };

  const calculateScore = () => {
    let totalScore = 0;
    pcosQuestions.forEach((question) => {
      const selectedOption = question.options.find(
        (opt) => opt.value === answers[question.id]
      );
      if (selectedOption) {
        totalScore += selectedOption.score;
      }
    });
    return totalScore;
  };

  const showResults = () => {
    if (Object.keys(answers).length !== pcosQuestions.length) {
      Alert.alert("Incomplete", "Please answer all questions before submitting.");
      return;
    }

    const score = calculateScore();
    if (score >= 15) {
      setResult("High likelihood of PCOS. We highly recommend you consult a doctor for a proper diagnosis.");
    } else if (score >= 8) {
      setResult("Moderate likelihood of PCOS. Consider tracking your symptoms and speaking to a healthcare professional.");
    } else {
      setResult("Low likelihood of PCOS. Continue to monitor your health and log symptoms.");
    }
  };

  return (
    <LinearGradient colors={["#fff", "#fdf2f8"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>PCOS Self-Assessment</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              This self-assessment is for informational purposes only and is not a substitute for a professional medical diagnosis.
            </Text>
          </View>

          {pcosQuestions.map((q) => (
            <View key={q.id} style={styles.questionCard}>
              <Text style={styles.questionText}>{q.question}</Text>
              {q.options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    answers[q.id] === option.value && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleAnswer(q.id, option.value)}
                >
                  <Ionicons
                    name={answers[q.id] === option.value ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={answers[q.id] === option.value ? "#f43f5e" : "#666"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      answers[q.id] === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={showResults}>
            <Text style={styles.submitButtonText}>Check My Likelihood</Text>
          </TouchableOpacity>

          {result && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Your Assessment Result</Text>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#fff0f0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f43f5e',
  },
  infoText: {
    fontSize: 14,
    color: '#f43f5e',
    lineHeight: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionButtonSelected: {
    backgroundColor: '#fde3f0',
    borderColor: '#f43f5e',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  optionTextSelected: {
    color: '#f43f5e',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#f43f5e',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f43f5e',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
});