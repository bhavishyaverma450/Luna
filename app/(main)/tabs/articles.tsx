import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { io } from "socket.io-client";

// REPLACE WITH YOUR MACHINE'S LOCAL IP ADDRESS! 
// e.g., "http://192.168.1.10:5000"
const SERVER_URL = "http://192.168.1.10:5000"; 
const socket = io(SERVER_URL);

interface Article {
  id: number;
  title: string;
  readTime: string;
  image: any;
  postedBy?: string;
  postedWhen?: string;
  isLunaArticle?: boolean;
}

interface Comment {
  _id: string; // The ID from the database
  userId: string;
  user?: { name: string }; // Populated user object
  text: string;
  timestamp: string;
}

interface FullArticleContent {
  id: number; // Article ID
  title: string;
  content: string;
  activities: string[];
}

const dummyArticles: Article[] = [
  {
    id: 0,
    title: "A message from Luna: Your guide to our app",
    readTime: "3 min read",
    image: require("@/assets/images/img.png"),
    postedBy: "Luna",
    postedWhen: "Today",
    isLunaArticle: true,
  },
  {
    id: 1,
    title: "Understanding your period: What's normal?",
    readTime: "5 min read",
    image: require("@/assets/images/img.png"),
    postedBy: "Jane Doe",
    postedWhen: "1 month ago",
  },
  {
    id: 2,
    title: "Coping with cramps: Tips & tricks",
    readTime: "7 min read",
    image: require("@/assets/images/new.png"),
    postedBy: "Sarah Lee",
    postedWhen: "2 weeks ago",
  },
  {
    id: 3,
    title: "Signs of hormonal imbalance to watch out for",
    readTime: "9 min read",
    image: require("@/assets/images/img.png"),
    postedBy: "Emily White",
    postedWhen: "1 month ago",
  },
  {
    id: 4,
    title: "How diet affects your menstrual cycle",
    readTime: "6 min read",
    image: require("@/assets/images/calenderr.png"),
    postedBy: "Jessica Chan",
    postedWhen: "Today",
  },
  {
    id: 5,
    title: "The link between stress and your period",
    readTime: "8 min read",
    image: require("@/assets/images/new.png"),
    postedBy: "Olivia Rodriguez",
    postedWhen: "2 days ago",
  },
];

const fullArticleContentData: Record<number, FullArticleContent> = {
  0: {
    id: 0,
    title: "A message from Luna: Your guide to our app",
    content: `Welcome to Luna, your personal guide to understanding your menstrual cycle and overall wellness. We're so happy you're here! This app is designed to help you track your cycle, predict your next period, and understand the subtle changes in your body. It's also a community where you can share experiences and get support.
    
**Getting Started with Luna**
1. **Daily Logging**: The more data you provide, the more accurate our predictions will be. Log your period, symptoms (like mood, pain, and cravings), and activities every day.
2. **Community Forum**: The community section is a safe space to ask questions and share your journey. Remember to be respectful and supportive of others.
3. **Articles & Resources**: This section, where you are now, is full of expert-written articles on a variety of topics, from nutritional advice to exercise tips tailored for your cycle.

Remember, Luna is a tool for self-awareness, not a substitute for a doctor's advice. Always consult a healthcare professional for specific medical concerns.`,
    activities: [
      "Log your symptoms daily",
      "Explore the calendar and patterns",
      "Engage with the community forum",
    ],
  },
  1: {
    id: 1,
    title: "Understanding your period: What's normal?",
    content: `A "normal" period can vary greatly from person to person. What’s important is understanding what's normal for *you*. Normal cycles typically last 2 to 7 days, with a cycle length of 21 to 35 days. Mild cramps, mood swings, and bloating are common.

**The Menstrual Cycle Phases**
* **Menstruation (Days 1-7):** The shedding of the uterine lining. This is the first day of your period.
* **Follicular Phase (Days 8-14):** The body prepares for ovulation. Estrogen levels rise, and the uterine lining thickens.
* **Ovulation (Day 14):** An egg is released from the ovary. This is your most fertile window.
* **Luteal Phase (Days 15-28):** Progesterone levels increase to prepare the uterus for a potential pregnancy. If no pregnancy occurs, hormone levels drop, leading to your period.

Knowing your cycle can help you predict symptoms and plan your life more effectively. `,
    activities: [
      "Check your cycle history",
      "Learn about hormonal changes",
      "Talk to a healthcare provider",
    ],
  },
  2: {
    id: 2,
    title: "Coping with cramps: Tips & tricks",
    content: `Period cramps, medically known as dysmenorrhea, are a common and often painful part of the menstrual cycle. They are caused by the uterus contracting to shed its lining. Fortunately, there are many ways to find relief.

**1. Heat Therapy 🔥:** Applying heat is one of the most effective and accessible remedies. Use a heating pad, a hot water bottle, or take a warm bath to relax your abdominal muscles and ease the pain. The warmth increases blood flow to the area, which helps reduce cramping.

**2. Over-the-Counter Pain Relievers:** Nonsteroidal anti-inflammatory drugs (NSAIDs) like ibuprofen (Advil, Motrin) or naproxen (Aleve) are very effective. They work by blocking prostaglandins, the hormones that trigger uterine contractions.

**3. Gentle Exercise 🤸‍♀️:** It might sound counterintuitive, but light exercise can help. Activities like walking, yoga, or stretching can release endorphins, which are natural painkillers. Just a 20-30 minute walk can make a big difference.

**4. Hydration and Diet:** Staying hydrated can help reduce bloating, which can make cramps feel worse. Try to reduce your intake of caffeine, alcohol, and salty foods. `,
    activities: [
      "Practice light stretching or yoga",
      "Try a heating pad",
      "Drink herbal tea (like ginger or chamomile)",
    ],
  },
  3: {
    id: 3,
    title: "Signs of hormonal imbalance to watch out for",
    content: `Hormones are chemical messengers that regulate almost every process in your body. When they're out of balance, it can lead to a wide range of symptoms. Pay attention to your body and look for these common signs.

**Key Symptoms of Hormonal Imbalance**
* **Irregular Periods:** This is one of the most common signs. If your cycle is consistently unpredictable, it could be due to an imbalance in estrogen or progesterone.
* **Weight Changes:** Unexplained weight gain or loss can be linked to hormonal issues, especially with thyroid hormones or insulin.
* **Persistent Acne:** Acne, especially along your jawline or chin, can signal excess androgens (male hormones).
* **Mood Swings and Depression:** Hormonal fluctuations can impact neurotransmitters in the brain, leading to anxiety, irritability, and feelings of sadness.
* **Fatigue:** Feeling constantly exhausted, even after a full night's sleep, can be a symptom of thyroid issues.

If you're experiencing several of these symptoms, consider keeping a detailed journal and talking to a doctor or an endocrinologist.`,
    activities: [
      "Track your mood & energy levels",
      "Review your sleep patterns",
      "Consult a professional if symptoms persist",
    ],
  },
  4: {
    id: 4,
    title: "How diet affects your menstrual cycle",
    content: `What you eat has a profound impact on your menstrual cycle, from easing cramps to regulating your flow. By making smart food choices, you can support your body's natural processes.

**Nutritional Tips for a Healthier Cycle**
* **Iron-rich Foods:** During your period, you lose iron. To replenish your stores and avoid fatigue, eat foods like lean meat, spinach, lentils, and fortified cereals.
* **Omega-3 Fatty Acids:** Found in fatty fish (salmon, mackerel) and walnuts, these healthy fats have anti-inflammatory properties that can help reduce period cramps.
* **Complex Carbohydrates:** Foods like oats, brown rice, and quinoa provide sustained energy and help stabilize blood sugar levels, reducing mood swings and cravings.
* **Stay Hydrated:** Drinking plenty of water is crucial. It helps reduce bloating and can ease headaches that often accompany your period. Try adding lemon or cucumber to your water.

A balanced diet throughout your cycle can significantly improve your overall well-being. `,
    activities: [
      "Plan your meals for the week",
      "Try a new healthy recipe",
      "Keep a food diary to track changes",
    ],
  },
  5: {
    id: 5,
    title: "The link between stress and your period",
    content: `Stress can have a powerful impact on your menstrual cycle. When you're stressed, your body releases hormones like cortisol, which can interfere with the hormones that regulate your period. This can lead to late or missed periods, or a heavier flow.

**Managing Stress for a Regular Cycle**
* **Mindfulness and Meditation:** Practicing mindfulness can help calm your nervous system and reduce cortisol levels. Even 5-10 minutes a day can make a difference.
* **Regular Sleep:** Aim for 7-9 hours of quality sleep per night. Lack of sleep puts stress on your body, exacerbating hormonal imbalances.
* **Physical Activity:** Regular exercise, especially activities like walking, jogging, or yoga, is a great stress reliever.
* **Journaling:** Writing down your feelings and worries can help you process emotions and reduce mental stress.

Taking care of your mental health is a vital part of menstrual health. `,
    activities: [
      "Try a guided meditation session",
      "Go for a short walk",
      "Start a daily gratitude journal",
    ],
  },
};

const ArticleContentModal = ({
  visible,
  onClose,
  article,
}: {
  visible: boolean;
  onClose: () => void;
  article: FullArticleContent | null;
}) => {
  const [newCommentText, setNewCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchComments();
      socket.on("new_comment", (newComment: Comment) => {
        // Add the new comment to the top of the list
        setComments((prevComments) => [newComment, ...prevComments]);
      });
    } else {
      // Clean up the socket listener when the modal is closed
      socket.off("new_comment");
    }
    // Clean up function for the effect
    return () => {
      socket.off("new_comment");
    };
  }, [visible, article?.id]);

  const fetchComments = async () => {
    if (!article) return;
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/articles/${article.id}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (newCommentText.trim() === "" || !article) {
      return;
    }

    const dummyUserId = "60c72b2f9b1d8e001c8e4d1f";

    try {
      const response = await fetch(`${SERVER_URL}/api/articles/${article.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: dummyUserId,
          text: newCommentText.trim(),
        }),
      });

      setNewCommentText("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  if (!article) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={modalStyles.container}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle}>Article</Text>
          <View style={{ width: 24 }} />
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView style={modalStyles.scrollViewContent}>
            <Text style={modalStyles.modalTitle}>{article.title}</Text>
            <Text style={modalStyles.modalText}>{article.content}</Text>
            <View style={modalStyles.divider} />
            <Text style={modalStyles.activitiesTitle}>
              Activities related to this article:
            </Text>
            <View style={modalStyles.activitiesContainer}>
              {article.activities.map((activity, index) => (
                <TouchableOpacity key={index} style={modalStyles.activityCard}>
                  <Text style={modalStyles.activityText}>{activity}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={modalStyles.divider} />
            <Text style={modalStyles.commentsTitle}>Comments</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#e57373" style={{ marginTop: 20 }} />
            ) : comments.length > 0 ? (
              comments.map((comment, index) => (
                <View key={comment._id || index} style={modalStyles.commentCard}>
                  <Text style={modalStyles.commentUser}>{comment.user?.name || "Anonymous"}</Text>
                  <Text style={modalStyles.commentText}>{comment.text}</Text>
                  <Text style={modalStyles.commentTimestamp}>
                    {comment.timestamp}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={modalStyles.noCommentsText}>No comments yet. Be the first!</Text>
            )}
            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={modalStyles.commentInputContainer}>
            <TextInput
              style={modalStyles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              value={newCommentText}
              onChangeText={setNewCommentText}
              multiline
            />
            <TouchableOpacity style={modalStyles.commentSubmitButton} onPress={handleCommentSubmit}>
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default function Articles() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] =
    useState<FullArticleContent | null>(null);

  const openArticleModal = (articleId: number) => {
    const article = fullArticleContentData[articleId];
    if (article) {
      setSelectedArticle(article);
      setModalVisible(true);
    }
  };

  const renderArticleItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={[styles.articleCard, item.isLunaArticle && styles.lunaCard]}
      activeOpacity={0.8}
      onPress={() => openArticleModal(item.id)}
    >
      <Image source={item.image} style={styles.articleImage} />
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle}>{item.title}</Text>
        <Text style={styles.articleReadTime}>{item.readTime}</Text>
        {item.postedBy && (
          <View style={styles.postInfo}>
            <Text style={styles.postedBy}>{item.postedBy}</Text>
            <Text style={styles.postedWhen}>{item.postedWhen}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Articles</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={dummyArticles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      <ArticleContentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        article={selectedArticle}
      />
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
  },
  listContainer: {
    padding: 16,
  },
  articleCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  lunaCard: {
    backgroundColor: "#ffebee",
    borderColor: "#e57373",
    borderWidth: 1,
  },
  articleImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    margin: 10,
  },
  articleContent: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  articleReadTime: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  postInfo: {
    flexDirection: "row",
    marginTop: 5,
  },
  postedBy: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginRight: 5,
  },
  postedWhen: {
    fontSize: 12,
    color: "#a0a0a0",
  },
});

const modalStyles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  scrollViewContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#e0e0e0",
    marginBottom: 15,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  activitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  activityCard: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e57373",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "center",
    width: "45%",
  },
  activityText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#e57373",
    textAlign: "center",
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  commentCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#a0a0a0",
    marginTop: 5,
    textAlign: "right",
  },
  noCommentsText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fdf2f8",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    minHeight: 45,
    maxHeight: 120,
  },
  commentSubmitButton: {
    backgroundColor: "#e57373",
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});