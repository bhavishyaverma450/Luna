// File: articles.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { ArticleContentModal, FullArticleContent } from "../ArticleContentModal";
import { dummyArticles, fullArticleContentData } from "@/app/data/data"; 

// Dummy articles data
// ... (your existing dummyArticles data)

// Full article content mapping
// ... (your existing fullArticleContentData)

export default function Articles() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticle, setSelectedArticle] =
    useState<FullArticleContent | null>(null);

  // ✅ Use a valid ObjectId from your MongoDB 'users' collection
  const loggedInUser = {
    id: "60c72b2f9b1d8e001c8e4d1f", // REPLACE with a real ObjectId from your database
    name: "Bhavishya Verma",
  };

  const openArticleModal = (articleId: number) => {
    const article = fullArticleContentData[articleId];
    if (article) {
      setSelectedArticle(article);
      setModalVisible(true);
    }
  };

  const renderArticleItem = ({ item }: { item: (typeof dummyArticles)[0] }) => (
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
        currentUser={loggedInUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  listContainer: { padding: 16 },
  articleCard: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
  },
  lunaCard: { borderColor: "#e57373", borderWidth: 2 },
  articleImage: { width: 100, height: 100, resizeMode: "cover" },
  articleContent: { flex: 1, padding: 12, justifyContent: "center" },
  articleTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 6, color: "#333" },
  articleReadTime: { fontSize: 12, color: "#888", marginBottom: 4 },
  postInfo: { flexDirection: "row", justifyContent: "space-between" },
  postedBy: { fontSize: 12, color: "#555" },
  postedWhen: { fontSize: 12, color: "#aaa" },
});