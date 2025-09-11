import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UpdateProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem("userName");
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedDOB = await AsyncStorage.getItem("userDOB");
        const storedPhone = await AsyncStorage.getItem("userPhone");
        const storedBio = await AsyncStorage.getItem("userBio");

        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
        if (storedDOB) setDateOfBirth(storedDOB);
        if (storedPhone) setPhoneNumber(storedPhone);
        if (storedBio) setBio(storedBio);

      } catch (error) {
        console.error("Profile data fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleSaveChanges = async () => {
    try {
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userDOB', dateOfBirth);
      await AsyncStorage.setItem('userPhone', phoneNumber);
      await AsyncStorage.setItem('userBio', bio);

      Alert.alert("Success", "Your profile has been saved successfully!");
    } catch (error) {
      console.error("Save profile error:", error);
      Alert.alert('Error', 'Failed to save changes locally. Please try again.');
    }
  };

  const generateQRCodeData = () => {
    return `Name: ${name}\nEmail: ${email}\nDate of Birth: ${dateOfBirth}\nPhone: ${phoneNumber}\nBio: ${bio}`;
  };

  if (isLoading) {
    return (
      <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff5083" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.title}>Update Profile</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Profile Avatar Section */}
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {name.split(" ").map((n) => n[0]).join("")}
                </Text>
              </View>
            </View>

            {/* Profile Info Card */}
            <View style={styles.card}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.textInput}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
              
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.textInput, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                multiline
              />
              
              <View style={styles.divider} />
              
              <TouchableOpacity style={styles.changePasswordButton}>
                <Text style={styles.changePasswordText}>Change Password</Text>
              </TouchableOpacity>
            </View>
            
            {/* QR Code Section */}
            <View style={styles.qrCodeCard}>
              <Text style={styles.qrTitle}>Share Profile</Text>
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={generateQRCodeData()}
                  size={150}
                />
              </View>
              <Text style={styles.qrDescription}>
                Scan this QR code to share your basic profile information.
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  scrollViewContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexGrow: 1,
    justifyContent: "space-between",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ff5083",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  changePasswordButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  changePasswordText: {
    color: "#ff5083",
    fontSize: 16,
    fontWeight: "600",
  },
  qrCodeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  qrCodeContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  qrDescription: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#ff5083",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});