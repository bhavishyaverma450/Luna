import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import io from 'socket.io-client';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.6:5000"; 
const socket = io(API_BASE_URL);

interface Message {
  _id: string;
  userId: string;
  text: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatRoom() {
  const router = useRouter();
  const { roomId, roomName } = useLocalSearchParams<{ roomId: string; roomName: string }>();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const currentUserId = "64f1d46b41a7337910086c8a";

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join', { room: roomId, username: `User${currentUserId}` });
    });

    socket.on('new_message', (data: any) => {
      // Add all new messages from the server to the state
      setMessages((prevMessages) => [...prevMessages, {
        ...data,
        isUser: data.userId === currentUserId, // Determine isUser for every message
        _id: data._id,
        userId: data.userId,
      }]);
    });

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/chats/rooms/${roomId}/messages`);
        const fetchedMessages = response.data.map((msg: any) => ({
          ...msg,
          isUser: msg.userId === currentUserId,
          _id: msg._id,
          userId: msg.userId,
        }));
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();

    return () => {
      socket.emit('leave', { room: roomId, username: `User${currentUserId}` });
      socket.off('new_message');
    };
  }, [roomId]);

  useEffect(() => {
    const checkMessageStatus = async () => {
      const lastMessageDate = await AsyncStorage.getItem(`lastMessageDate_${roomId}`);
      if (lastMessageDate) {
        const today = new Date().toISOString().split('T')[0];
        if (lastMessageDate === today) {
          setCanSendMessage(false);
        } else {
          setCanSendMessage(true);
        }
      } else {
         setCanSendMessage(true);
      }
    };
    checkMessageStatus();
  }, [roomId]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!canSendMessage) {
      Alert.alert("Daily Limit Reached", "You can only send one message per day in this room.");
      return;
    }

    if (inputText.trim()) {
      const messageData = {
        roomId: roomId,
        userId: currentUserId,
        text: inputText,
      };

      // Send the message to the server
      socket.emit('send_message', messageData);
      
      // Immediately disable the send button and clear the input
      setCanSendMessage(false);
      setInputText("");

      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(`lastMessageDate_${roomId}`, today);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{roomName}</Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView 
          style={styles.chatContainer} 
          ref={scrollViewRef}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          {messages.map((message) => (
            <View
              key={message._id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userMessage : styles.otherMessage,
              ]}
            >
              <Text style={message.isUser ? styles.userMessageText : styles.otherMessageText}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={canSendMessage ? "Type a message..." : "Daily message limit reached"}
            placeholderTextColor="#a0a0a0"
            value={inputText}
            onChangeText={setInputText}
            editable={canSendMessage}
          />
          <TouchableOpacity 
            onPress={handleSendMessage} 
            style={[styles.sendButton, !canSendMessage && styles.disabledButton]}
            disabled={!canSendMessage}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf2f8" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  chatContainer: { flexGrow: 1, paddingHorizontal: 16 },
  messageBubble: { 
    borderRadius: 16,
    padding: 12, 
    marginBottom: 8, 
    maxWidth: "80%", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  userMessage: { 
    alignSelf: "flex-end", 
    backgroundColor: "#ef5da8",
  },
  otherMessage: { 
    alignSelf: "flex-start", 
    backgroundColor: "#fff",
  },
  userMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#333",
  },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 10, borderTopWidth: 1, borderTopColor: "#e0e0e0", backgroundColor: "#fff" },
  textInput: { flex: 1, backgroundColor: "#f0f0f0", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  sendButton: { backgroundColor: "#ef5da8", borderRadius: 20, width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  disabledButton: { backgroundColor: "#ccc" },
});