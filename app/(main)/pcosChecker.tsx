import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal
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

const PCOSInfoModal = ({ isVisible, onClose, riskLevel }) => {
  const content = {
    low: {
      title: "Low Likelihood of PCOS: Staying Healthy",
      articles: [
        {
          heading: "Maintain a Balanced Diet",
          body: "Focus on a diet rich in whole foods, including fruits, vegetables, lean proteins, and complex carbohydrates. This helps maintain stable blood sugar levels and overall health."
        },
        {
          heading: "Stay Active",
          body: "Regular physical activity, such as walking, jogging, or yoga, is crucial for hormonal balance and stress reduction. Aim for at least 30 minutes most days of the week."
        },
        {
          heading: "Dos & Don'ts",
          dos: ["• Eat plenty of fiber", "• Stay hydrated", "• Get consistent sleep"],
          donts: ["• Avoid highly processed foods", "• Limit sugary drinks"]
        }
      ]
    },
    moderate: {
      title: "Moderate Likelihood of PCOS: Proactive Steps",
      articles: [
        {
          heading: "Insulin-Resistant Diet",
          body: "Consider a low-glycemic index (GI) diet to manage insulin levels. This includes choosing whole grains, legumes, and non-starchy vegetables. Protein and healthy fats should be part of every meal."
        },
        {
          heading: "Incorporate Strength Training",
          body: "Building muscle can improve insulin sensitivity. Combine cardio with strength exercises 2-3 times a week. Listen to your body and avoid over-exercising."
        },
        {
          heading: "Dos & Don'ts",
          dos: ["• Eat at regular times", "• Include healthy fats like avocado and nuts", "• Track your symptoms"],
          donts: ["• Avoid refined carbohydrates and sweets", "• Don't skip meals"]
        }
      ]
    },
    high: {
      title: "High Likelihood of PCOS: Lifestyle Management",
      articles: [
        {
          heading: "Anti-Inflammatory & Low-GI Diet",
          body: "Adopt a diet that reduces inflammation, such as the Mediterranean diet. Emphasize foods like fatty fish, olive oil, leafy greens, and berries. This, combined with low-GI principles, is highly effective for managing PCOS symptoms."
        },
        {
          heading: "Stress Reduction",
          body: "Chronic stress can worsen hormonal imbalances. Practice mindfulness, meditation, or deep breathing exercises. Prioritize self-care to manage cortisol levels."
        },
        {
          heading: "Dos & Don'ts",
          dos: ["• Consult a registered dietitian", "• Prioritize quality sleep", "• Consider supplements like Inositol or Omega-3s (with doctor's approval)"],
          donts: ["• Avoid trans fats and hydrogenated oils", "• Don't ignore symptoms—seek medical advice"]
        }
      ]
    },
  };

  const modalContent = content[riskLevel] || content.low;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <LinearGradient
          colors={["#fefefe", "#fcf4f8"]}
          style={styles.modalView}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle-outline" size={30} color="#f43f5e" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.scrollViewContentModal}>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            {modalContent.articles.map((article, index) => (
              <View key={index} style={styles.articleCard}>
                <Text style={styles.articleHeading}>{article.heading}</Text>
                <Text style={styles.articleBody}>{article.body}</Text>
                {article.dos && (
                  <>
                    <Text style={styles.dosTitle}>Dos:</Text>
                    {article.dos.map((item, i) => (
                      <Text key={`dos-${i}`} style={styles.dosItem}>{item}</Text>
                    ))}
                  </>
                )}
                {article.donts && (
                  <>
                    <Text style={styles.dontsTitle}>Don'ts:</Text>
                    {article.donts.map((item, i) => (
                      <Text key={`donts-${i}`} style={styles.dontsItem}>{item}</Text>
                    ))}
                  </>
                )}
              </View>
            ))}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};


export default function PcosChecker() {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'low' | 'moderate' | 'high' | null>(null);
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
    let determinedRiskLevel: 'low' | 'moderate' | 'high';
    if (score >= 15) {
      determinedRiskLevel = 'high';
    } else if (score >= 8) {
      determinedRiskLevel = 'moderate';
    } else {
      determinedRiskLevel = 'low';
    }

    setRiskLevel(determinedRiskLevel);
    setIsModalVisible(true);
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

        </ScrollView>
      </SafeAreaView>

      {/* Render the new modal component */}
      {riskLevel && (
        <PCOSInfoModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          riskLevel={riskLevel}
        />
      )}
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
  // New Styles for Modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    height: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  scrollViewContentModal: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  articleHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f43f5e',
    marginBottom: 8,
  },
  articleBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  dosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#228B22',
    marginTop: 10,
  },
  dosItem: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
  },
  dontsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B22222',
    marginTop: 10,
  },
  dontsItem: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
  },
});