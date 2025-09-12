// File: ArticleContentModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { io } from "socket.io-client";
import { MarkdownText } from "./MarkdownText";

// 🔥 Make sure this IP is your local machine accessible from phone/emulator
const SERVER_URL = "http://192.168.1.6:5000";
const socket = io(SERVER_URL);

interface Comment {
  _id: string;
  userId: string;
  articleId: number;
  user?: { name: string };
  text: string;
  timestamp: string;
}

export interface FullArticleContent {
  id: number;
  title: string;
  content: string;
  activities: string[];
}

interface ArticleContentModalProps {
  visible: boolean;
  onClose: () => void;
  article: FullArticleContent | null;
  currentUser: { id: string; name: string };
}

export const ArticleContentModal: React.FC<ArticleContentModalProps> = ({
  visible,
  onClose,
  article,
  currentUser,
}) => {
  const [newCommentText, setNewCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && article) {
      fetchComments();

      // ✅ Listen for real-time comments
      const handleNewComment = (newComment: Comment) => {
        if (newComment.articleId === article.id) {
          setComments((prev) => [newComment, ...prev]);
        }
      };

      socket.on("new_comment", handleNewComment);

      return () => {
        socket.off("new_comment", handleNewComment);
      };
    }
  }, [visible, article]);

  const fetchComments = async () => {
    if (!article) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${SERVER_URL}/api/articles/${article.id}/comments`
      );
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (newCommentText.trim() === "" || !article) return;

    try {
      await fetch(`${SERVER_URL}/api/articles/${article.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
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
        {/* Header */}
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle}>Article</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView style={modalStyles.scrollViewContent}>
            <Text style={modalStyles.modalTitle}>{article.title}</Text>
            <MarkdownText>{article.content}</MarkdownText>

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
              <ActivityIndicator
                size="small"
                color="#e57373"
                style={{ marginTop: 20 }}
              />
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <View key={comment._id} style={modalStyles.commentCard}>
                  <Text style={modalStyles.commentUser}>
                    {comment.user?.name || "Anonymous"}
                  </Text>
                  <Text style={modalStyles.commentText}>{comment.text}</Text>
                  <Text style={modalStyles.commentTimestamp}>
                    {new Date(comment.timestamp).toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={modalStyles.noCommentsText}>
                No comments yet. Be the first!
              </Text>
            )}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Comment input */}
          <View style={modalStyles.commentInputContainer}>
            <TextInput
              style={modalStyles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              value={newCommentText}
              onChangeText={setNewCommentText}
              multiline
            />
            <TouchableOpacity
              style={modalStyles.commentSubmitButton}
              onPress={handleCommentSubmit}
            >
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf2f8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  closeButton: { padding: 8 },
  scrollViewContent: { padding: 20 },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
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
    elevation: 2,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 4,
  },
  commentText: { fontSize: 14, color: "#444", lineHeight: 20 },
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