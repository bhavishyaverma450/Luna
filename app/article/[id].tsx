import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// This object holds the full content for each article based on its ID
const articleContentData = {
  0: {
    title: "A message from Luna: Your guide to our app",
    content: `
Welcome to Luna, your personal guide to understanding your menstrual cycle and overall wellness. We're so happy you're here!

This app is designed to help you track your cycle, predict your next period, and understand the subtle changes in your body. But it's also a community where you can share experiences and get support.

**Here are some simple DOs and DON'Ts to get the most out of Luna:**

**✅ DO:**
* **Log your symptoms daily:** The more data you provide, the more accurate our predictions will be.
* **Use the calendar:** It's a powerful tool for seeing your cycle patterns and planning ahead.
* **Engage with the community:** Ask questions, share tips, and support others. You're not alone in this journey.
* **Explore the articles:** The articles section is full of evidence-based information on menstrual health, diet, and wellness.

**❌ DON'T:**
* **Panic over slight irregularities:** Stress and lifestyle changes can affect your cycle. If something seems off, check our articles for guidance.
* **Replace professional medical advice:** Luna is a tool for self-awareness, not a substitute for a doctor's diagnosis or treatment.
* **Share private health information with others in public chats.** Always prioritize your privacy.

We hope Luna becomes a trusted companion on your wellness journey. Enjoy exploring the app!
    `,
    image: require("@/assets/images/img.png"),
  },
  1: {
    title: "Understanding your period: What's normal?",
    content: `
A "normal" period can vary greatly from person to person. What’s important is understanding what's normal for *you*.

**Key characteristics of a normal period:**
* **Duration:** Typically lasts between 2 to 7 days.
* **Cycle length:** The time from the start of one period to the start of the next is usually 21 to 35 days.
* **Flow:** Your flow can be light, moderate, or heavy, but it should be manageable without needing to change your pad/tampon every hour.

**Common symptoms that are generally considered normal:**
* **Mild cramps:** These are caused by the uterus contracting to shed its lining.
* **Mood swings:** Hormonal fluctuations can cause irritability, anxiety, or sadness.
* **Bloating and breast tenderness:** These are also common hormonal side effects.
* **Cravings:** A desire for certain foods, especially before your period starts.

**When to be concerned:**
* **Very heavy bleeding:** Soaking through a pad or tampon every hour for several hours.
* **Severe pain:** Cramps that are so intense they disrupt your daily life.
* **Irregular cycles:** Cycles that are consistently shorter than 21 days or longer than 35 days.
* **Sudden changes:** If your period suddenly becomes very different from your usual pattern.

If you experience these more severe symptoms, it's a good idea to consult a healthcare provider to rule out any underlying conditions.
    `,
    image: require("@/assets/images/img.png"),
  },
  2: {
    title: "Coping with cramps: Tips & tricks",
    content: `
Period cramps, medically known as dysmenorrhea, are a common and often painful part of the menstrual cycle. They are caused by the uterus contracting to shed its lining. Fortunately, there are many ways to find relief.

### **Home Remedies & Lifestyle Adjustments**

**1. Heat Therapy 🔥:** Applying heat is one of the most effective and accessible remedies. Use a heating pad, a hot water bottle, or take a warm bath to relax your abdominal muscles and ease the pain. The warmth increases blood flow to the area, which helps reduce cramping.

**2. Over-the-Counter Pain Relievers:** Nonsteroidal anti-inflammatory drugs (NSAIDs) like ibuprofen (Advil, Motrin) or naproxen (Aleve) are very effective at reducing period pain. They work by blocking prostaglandins, the hormones that trigger uterine contractions.

**3. Gentle Exercise 🤸‍♀️:** It might sound counterintuitive, but light exercise can help. Activities like walking, yoga, or stretching can release endorphins, which are natural painkillers. Just a 20-30 minute walk can make a big difference.

**4. Hydration and Diet:**
* **Drink more water:** Staying hydrated can help reduce bloating, which can make cramps feel worse.
* **Avoid certain foods:** Some foods, like caffeine, alcohol, and salty foods, can increase bloating and cramping. Try to reduce your intake a few days before and during your period.
* **Eat anti-inflammatory foods:** Foods rich in omega-3 fatty acids (like salmon and walnuts) and vitamins can help.

**5. Herbal Tea:** A warm cup of ginger or chamomile tea can be soothing. Both have properties that can help relax muscles and ease discomfort.

**6. Massage:** Gently massaging your lower abdomen in a circular motion can help relax the muscles and provide relief.

If your cramps are severe and disrupt your daily life, or if they suddenly worsen, it's important to consult a healthcare professional. They can help identify any underlying issues and recommend stronger treatments.
    `,
    image: require("@/assets/images/new.png"),
  },
  3: {
    title: "Signs of hormonal imbalance to watch out for",
    content: `
Hormones are chemical messengers that regulate almost every process in your body. When they're out of balance, it can lead to a wide range of symptoms. Pay attention to your body and look for these common signs.

**1. Irregular Periods:** This is one of the most common signs. If your cycle is consistently unpredictable, it could be due to an imbalance in estrogen or progesterone.

**2. Weight Gain or Loss:** Unexplained changes in weight can be linked to hormonal issues, especially with thyroid hormones or insulin.

**3. Acne:** Persistent acne, especially along your jawline or chin, can signal excess androgens (male hormones).

**4. Mood Swings and Depression:** Hormonal fluctuations can impact neurotransmitters in the brain, leading to anxiety, irritability, and feelings of sadness.

**5. Fatigue:** Feeling constantly exhausted, even after a full night's sleep, can be a symptom of thyroid issues or adrenal fatigue.

**6. Sleep Problems:** Hormones like melatonin and cortisol regulate sleep. An imbalance can make it difficult to fall asleep or stay asleep.

**7. Changes in Libido:** A low sex drive can be linked to low levels of estrogen or testosterone.

If you're experiencing several of these symptoms, consider keeping a detailed journal of your symptoms and talking to a doctor.
    `,
    image: require("@/assets/images/img.png"),
  },
  4: {
    title: "How diet affects your menstrual cycle",
    content: `
What you eat has a profound impact on your menstrual cycle, from easing cramps to regulating your flow. By making smart food choices, you can support your body's natural processes.

**1. Iron-rich Foods:** During your period, you lose iron. To replenish your stores and avoid fatigue, eat foods like lean meat, spinach, lentils, and fortified cereals.

**2. Omega-3 Fatty Acids:** Found in fatty fish (salmon, mackerel), flaxseeds, and walnuts, these healthy fats have anti-inflammatory properties that can help reduce period cramps.

**3. Complex Carbohydrates:** Foods like oats, brown rice, and quinoa provide sustained energy and help stabilize blood sugar levels, reducing mood swings and cravings.

**4. Calcium and Vitamin D:** These are essential for bone health. Calcium is found in dairy, leafy greens, and fortified foods, while Vitamin D comes from sunlight and fortified milk.

**5. Avoid Processed Foods and Sugar:** These can cause blood sugar spikes and crashes, leading to mood swings and fatigue. Processed foods also often contain high amounts of sodium, which can increase bloating.

**6. Stay Hydrated:** Drinking plenty of water is crucial. It helps reduce bloating and can ease headaches that often accompany your period. Try adding lemon or cucumber to your water for a refreshing twist.

A balanced diet throughout your cycle can significantly improve your overall well-being.
    `,
    image: require("@/assets/images/calenderr.png"),
  },
};

export default function ArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const articleId = Number(id);

  const article = articleContentData[articleId as keyof typeof articleContentData];

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Article not found!</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.goBackText}>
            <Text>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{article.title}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {article.image && (
          <Image source={article.image} style={styles.articleImage} />
        )}
        <Text style={styles.articleBody}>{article.content.trim()}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf2f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flexShrink: 1,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  articleImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: "cover",
  },
  articleBody: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
    // To handle multiline text properly from the string
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  goBackText: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
  }
});