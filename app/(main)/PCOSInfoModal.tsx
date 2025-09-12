import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PCOSInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  riskLevel: 'low' | 'moderate' | 'high';
}

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
        donts: ["• Don't skip meals", "• Avoid refined carbohydrates and sweets"]
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

export const PCOSInfoModal: React.FC<PCOSInfoModalProps> = ({ isVisible, onClose, riskLevel }) => {
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
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
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

const styles = StyleSheet.create({
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
  scrollViewContent: {
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
  }
});