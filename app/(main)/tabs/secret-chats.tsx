import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator
} from "react-native";
import axios from "axios";

const API_BASE_URL = "http://192.168.1.6:5000"; // Ensure this is your computer's IP

interface Room {
  _id: string; // MongoDB uses _id
  name: string;
}

export default function SecretChats() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/chats/rooms`);
        setRooms(response.data);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleRoomPress = (room: Room) => {
    router.push({
      pathname: "chat-room",
      params: { roomId: room._id, roomName: room.name },
    });
  };

  const renderRoomCard = ({ item }: { item: Room }) => (
    <TouchableOpacity
      style={styles.roomCard}
      onPress={() => handleRoomPress(item)}
    >
      <View style={styles.roomIconContainer}>
        <Ionicons name="chatbubbles-outline" size={28} color="#ef5da8" />
      </View>
      <View style={styles.roomTextContainer}>
        <Text style={styles.roomTitle}>{item.name}</Text>
        <Text style={styles.roomSubtitle}>Join the conversation anonymously</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#a0a0a0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secret Chats</Text>
        <View style={{ width: 24 }} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#ef5da8" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoomCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf2f8" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  listContainer: { padding: 16 },
  roomCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  roomIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#fde3f0", justifyContent: "center", alignItems: "center", marginRight: 15 },
  roomTextContainer: { flex: 1 },
  roomTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  roomSubtitle: { fontSize: 12, color: "#a0a0a0", marginTop: 4 },
  loadingIndicator: { marginTop: 50 },
});