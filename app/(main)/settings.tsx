import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useSettings } from "../../contexts/SettingsContext";
import LottieView from "lottie-react-native";

const settingsOptions = [
  { id: 1, label: "Report for a doctor", icon: "folder", lib: "Feather" },
  { id: 2, label: "Hide content", icon: "eye-off", lib: "Feather" },
  { id: 3, label: "App lock", icon: "lock", lib: "Feather" },
  { id: 4, label: "Graphs & reports", icon: "bar-chart", lib: "Feather" },
  { id: 5, label: "Cycle and ovulation", icon: "refresh-ccw", lib: "Feather" },
  { id: 6, label: "App settings", icon: "settings", lib: "Feather" },
  { id: 7, label: "Privacy settings", icon: "shield", lib: "Ionicons" },
  { id: 8, label: "Reminders", icon: "ios-bell", lib: "Ionicons" },
  { id: 9, label: "Help", icon: "help-circle", lib: "Ionicons" },
  { id: 10, label: "About Luna", icon: "information-circle-outline", lib: "Ionicons" },
  { id: 11, label: "Logout", icon: "log-out", lib: "Feather" },
];

const iconLibraries = { Feather, Ionicons };

export default function Settings() {
  const router = useRouter();
  const { settings } = useSettings();
  const [activeGoal, setActiveGoal] = useState<string>("Track cycle");
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [userName, setUserName] = useState("");
  const [comingSoonVisible, setComingSoonVisible] = useState(false);
  // New state for the content modal
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", text: "" });

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const storedName = await AsyncStorage.getItem("userName");
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedDOB = await AsyncStorage.getItem("userDOB");
        const storedPhone = await AsyncStorage.getItem("userPhone");
        const storedBio = await AsyncStorage.getItem("userBio");

        if (storedName && storedEmail && storedDOB && storedPhone && storedBio) {
          setIsProfileComplete(true);
          setUserName(storedName);
        } else {
          setIsProfileComplete(false);
          setUserName("");
        }
      } catch (error) {
        console.error("Failed to fetch profile data from AsyncStorage", error);
        setIsProfileComplete(false);
      }
    };
    checkProfileStatus();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return parts[0][0];
  };

  const handleOptionPress = async (item: (typeof settingsOptions)[0]) => {
    switch (item.label) {
      case "About Luna":
        router.push("/(main)/aboutLuna");
        break;
      case "Reminders":
        router.push("/(main)/reminders");
        break;
      case "Help":
        router.push("/(main)/help");
        break;
      case "App lock":
        router.push("/(main)/appLock");
        break;
      case "Privacy settings":
        router.push("/(main)/privacySettings");
        break;
      case "App settings":
        router.push("/(main)/appSettings");
        break;
      case "Cycle and ovulation":
        router.push("/(main)/cycleAndOvulation");
        break;
      case "Graphs & reports":
        router.push("/(main)/graphsAndReports");
        break;
      case "Logout":
        Alert.alert(
          "Confirm Logout",
          "Are you sure you want to log out?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Logout",
              style: "destructive",
              onPress: async () => {
                await AsyncStorage.removeItem("userToken");
                router.replace("/(auth)");
              },
            },
          ],
          { cancelable: true }
        );
        break;
      default:
        console.log(`Clicked on ${item.label}`);
        break;
    }
  };

  const handleUpdateProfile = () => {
    router.push("/(main)/updateProfile");
  };

  // Function to handle opening the content modal with different content
  const handleContentModal = (title: string, text: string) => {
    setModalContent({ title, text });
    setContentModalVisible(true);
  };

  const renderOption = (item: (typeof settingsOptions)[0]) => {
    const IconComponent = iconLibraries[item.lib as keyof typeof iconLibraries];
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.optionItem}
        activeOpacity={0.6}
        onPress={() => handleOptionPress(item)}
      >
        <View style={styles.optionContent}>
          {IconComponent && (
            <IconComponent name={item.icon} size={24} color="#555" />
          )}
          <Text style={styles.optionLabel}>{item.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#fff", "#fdf2f8"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Account Section */}
        <View style={styles.accountCard}>
          <View style={styles.accountInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {isProfileComplete ? getInitials(userName) : "?"}
              </Text>
            </View>
            <View>
              <Text style={styles.accountText}>
                {isProfileComplete ? `Hello, ${userName}!` : "Create free account"}
              </Text>
              <Text style={styles.editInfoText}>
                {isProfileComplete ? "View profile" : "Edit info"}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.premiumButton} onPress={handleUpdateProfile}>
            <Text style={styles.premiumButtonText}>
              {isProfileComplete ? "Update Profile" : "Complete Profile"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My goal:</Text>
          <View style={styles.goalContainer}>
            {["Track cycle", "Get pregnant", "Track pregnancy"].map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalButton,
                  activeGoal === goal && styles.goalButtonActive,
                ]}
                onPress={() => {
                  if (goal === "Get pregnant" || goal === "Track pregnancy") {
                    setComingSoonVisible(true);
                  } else {
                    setActiveGoal(goal);
                  }
                }}
              >
                <Text
                  style={[
                    styles.goalButtonText,
                    activeGoal === goal && styles.goalButtonTextActive,
                  ]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Options Section */}
        <View style={styles.optionsList}>{settingsOptions.map(renderOption)}</View>

        {/* Data Protected Card */}
        <View style={styles.dataProtectedCard}>
          <View style={styles.protectedContent}>
            <LottieView
              source={require("@/anim/Safe and secure.json")}
              style={{ height: 70, width: 70 }}
              autoPlay
              loop
            />
            <View style={styles.protectedTextContainer}>
              <Text style={styles.protectedTitle}>Your data is protected</Text>
              <Text style={styles.protectedDescription}>
                Your privacy is our top priority. We never sell your data and you can
                delete it anytime.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() =>
              handleContentModal(
                "Data Protection",
                "We take your privacy seriously. Your data is encrypted and stored on our secure servers, ensuring that your personal information is protected from unauthorized access. We do not sell, rent, or share your data with any third parties for marketing or other commercial purposes. You have full control over your information and can choose to delete your account and all associated data at any time. We are committed to maintaining the highest standards of data security to protect your privacy."
              )
            }
          >
            <Text style={styles.learnMoreText}>Learn more</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() =>
                handleContentModal(
                  "Privacy Policy",
                  "At Luna, your privacy is our highest priority. This Privacy Policy explains how we collect, use, and protect your information when you use our app. 1. What Information We Collect We only collect the information necessary to provide and improve our period-tracking services. This includes: Period and cycle data: The dates of your period, cycle length, and any related symptoms you choose to log. Health and wellness data: This may include details you provide about your mood, physical symptoms, and other health-related observations. Basic profile information: Your name, email address, and date of birth, which are used to personalize your experience and for account management. We do not collect any personally identifiable information without your explicit consent.  2. How We Use Your Information Your data is used solely to provide you with a personalized and effective service. We use it to: Track and predict your menstrual cycle: The core function of the app is to help you understand your body’s unique patterns. Provide personalized insights: We analyze your data to give you insights into your health and wellness trends. Improve app functionality: Aggregated, anonymized data helps us understand user behavior and make the app better for everyone.  3. How We Protect Your Information We use industry-standard security measures to protect your data. All data is encrypted both in transit and at rest on our secure servers. This ensures that your personal information is protected from unauthorized access, disclosure, or alteration. We regularly review and update our security protocols to maintain the highest level of protection. We do not sell, rent, or share your personal data with any third-party companies for marketing, advertising, or other commercial purposes. Your information is and will remain private.  4. Your Rights You have complete control over your data. You can: Access your data: View and review the information you have logged in the app at any time. Update your data: Easily edit or correct any information in your profile or cycle logs. Delete your data: You have the right to delete your account and all associated data permanently at any time. If you have any questions about this Privacy Policy or our data practices, please contact us at bhavishyaver50@gmail.com."
                )
              }
            >
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>•</Text>
            <TouchableOpacity
              onPress={() =>
                handleContentModal(
                  "Terms of Use",
                  "These are the Terms of Use for the Luna app. They outline the rules and regulations for using our services, including user responsibilities and our rights as the service provider. By using the app, you agree to these terms."
                )
              }
            >
              <Text style={styles.footerLink}>Terms of Use</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() =>
              handleContentModal(
                "Accessibility Statement",
                "Accessibility Statement Luna is committed to making our app accessible to everyone, regardless of ability or disability. We believe that health and wellness tools should be available to all. We are actively working to improve the user experience for everyone by applying relevant accessibility standards. Our goal is to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level, an international standard that provides guidance on how to make web content more accessible to people with disabilities. Our efforts include: Continuous Improvement,UserFeedback, Future Updates."
              )
            }
          >
            <Text style={styles.footerLink}>Accessibility Statement</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Coming Soon Modal */}
      <Modal
        visible={comingSoonVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setComingSoonVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LottieView
              source={require("@/anim/Pregnancy Test.json")}
              autoPlay
              loop
              style={{ width: 150, height: 150 }}
            />
            <Text style={styles.modalTitle}>Coming Soon!</Text>
            <Text style={styles.modalDescription}>
              This feature is under development. Stay tuned ✨
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setComingSoonVisible(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Generic Content Modal */}
      <Modal
        visible={contentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setContentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.contentModalContent}>
            <Text style={styles.contentModalTitle}>{modalContent.title}</Text>
            <ScrollView style={styles.contentModalScroll}>
              <Text style={styles.contentModalText}>{modalContent.text}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setContentModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollViewContent: { padding: 20, paddingBottom: 50 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  title: { fontSize: 20, fontWeight: "600", color: "#333" },
  accountCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#7ec794",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  accountText: { fontSize: 18, fontWeight: "600" },
  editInfoText: { color: "#a0a0a0", fontSize: 14, marginTop: 2 },
  premiumButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: "#ff5083",
    alignItems: "center",
  },
  premiumButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  section: { marginTop: 30, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  goalContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  goalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },
  goalButtonActive: { backgroundColor: "#ff5083" },
  goalButtonText: { color: "#888", fontWeight: "600" },
  goalButtonTextActive: { color: "#fff" },
  optionsList: { marginTop: 20 },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionContent: { flexDirection: "row", alignItems: "center" },
  optionLabel: { fontSize: 16, marginLeft: 15, color: "#333" },
  dataProtectedCard: {
    backgroundColor: "#f0f8ff",
    borderRadius: 15,
    padding: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#d1e9f7",
  },
  protectedContent: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  protectedTextContainer: { flex: 1, marginLeft: 15 },
  protectedTitle: { fontSize: 16, fontWeight: "bold", color: "#2e8b57" },
  protectedDescription: { fontSize: 14, color: "#555", marginTop: 5 },
  learnMoreButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  learnMoreText: { color: "#555", fontWeight: "500" },
  footer: { alignItems: "center", marginTop: 40 },
  footerLinks: { flexDirection: "row", marginBottom: 10 },
  footerLink: { color: "#ff5083", fontSize: 13, marginHorizontal: 5 },
  linkSeparator: { color: "#ff5083", fontSize: 13, fontWeight: "bold" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff5083",
    marginTop: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginVertical: 10,
  },
  modalButton: {
    marginTop: 15,
    backgroundColor: "#ff5083",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems:'center'
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // New modal styles for the content modal
  contentModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "70%",
  },
  contentModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  contentModalScroll: {
    maxHeight: "80%",
  },
  contentModalText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
});