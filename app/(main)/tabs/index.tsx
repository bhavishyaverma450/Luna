import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import DayItem from '@/components/DayItem'; 
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const API_BASE = "http://192.168.1.6:5000/api/auth";

interface PeriodRange {
  start: string;
  end: string;
}

interface PredictionData {
  predictedPeriod: PeriodRange | null;
  predictedOvulation: string[] | null;
}

const getPredictions = (periods: PeriodRange[]): PredictionData => {
  if (periods.length < 2) {
    return { predictedPeriod: null, predictedOvulation: null };
  }
  const sortedPeriods = [...periods].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const cycleLengths = sortedPeriods.slice(1).map((period, index) => {
    const prevPeriodStart = new Date(sortedPeriods[index].start);
    const currentPeriodStart = new Date(period.start);
    return Math.ceil(Math.abs(currentPeriodStart.getTime() - prevPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
  });
  const averageCycleLength = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;
  const lastPeriodEnd = new Date(sortedPeriods[sortedPeriods.length - 1].end);
  const predictedStart = new Date(lastPeriodEnd.getTime() + averageCycleLength * 24 * 60 * 60 * 1000);
  
  const lastPeriodDuration = Math.ceil(
    Math.abs(new Date(sortedPeriods[sortedPeriods.length - 1].end).getTime() - new Date(sortedPeriods[sortedPeriods.length - 1].start).getTime()) / (1000 * 60 * 60 * 24)
  );
  const predictedEnd = new Date(predictedStart.getTime() + lastPeriodDuration * 24 * 60 * 60 * 1000);
  
  const ovulationDay = new Date(predictedStart.getTime() - 14 * 24 * 60 * 60 * 1000);
  const ovulationWindow = [
    (new Date(ovulationDay.getTime() - 2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    (new Date(ovulationDay.getTime() + 2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
  ];
  return {
    predictedPeriod: {
      start: predictedStart.toISOString().split('T')[0],
      end: predictedEnd.toISOString().split('T')[0],
    },
    predictedOvulation: ovulationWindow,
  };
};

export default function Home() {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today);
  const [modalVisible, setModalVisible] = useState(false);
  const [periodRanges, setPeriodRanges] = useState<PeriodRange[]>([]);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const router = useRouter();
  const flatListRef = useRef<FlatList<any>>(null);
  const [hasAlerted, setHasAlerted] = useState(false);

  const fetchPeriods = async () => {
    if (hasAlerted) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        console.warn("No token found. Redirecting to login.");
        router.replace('/(auth)'); 
        return;
      }

      const response = await axios.get(`${API_BASE}/period/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPeriodRanges(response.data);
      const predictionData = getPredictions(response.data);
      setPredictions(predictionData);

    } catch (e: any) {
      if (e.response && e.response.status === 401) {
        setHasAlerted(true);
        Alert.alert(
          "Session Expired", 
          "Please log in again.", 
          [{
            text: "OK", 
            onPress: async () => {
              await AsyncStorage.removeItem("userToken");
              router.replace('/(auth)');
            }
          }]
        );
      } else {
        console.error("Failed to fetch periods from backend", e);
        Alert.alert("Error", "Could not load period data. Please check your connection.");
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      setHasAlerted(false);
      fetchPeriods();
    }, [])
  );

  const generateWeeks = (centerDate: Date, numWeeks = 5) => {
    const weeks = [];
    const start = new Date(centerDate);
    start.setDate(start.getDate() - numWeeks * 7);

    for (let w = 0; w < numWeeks * 2 + 1; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        week.push(date);
      }
      weeks.push(week);
    }
    return weeks;
  };

  const weeks = generateWeeks(today, 4);

  const handleDateSelected = (date: Date) => {
    setSelectedDay(date);
  };

  const isInPeriod = (date: Date) => {
    const isoDate = date.toISOString().split('T')[0];
    return periodRanges.some((range) => {
      return isoDate >= range.start && isoDate <= range.end;
    });
  };

  const isPredictedPeriod = (date: Date) => {
    const isoDate = date.toISOString().split('T')[0];
    if (!predictions?.predictedPeriod) return false;
    return isoDate >= predictions.predictedPeriod.start && isoDate <= predictions.predictedPeriod.end;
  };

  const isPredictedOvulation = (date: Date) => {
    const isoDate = date.toISOString().split('T')[0];
    if (!predictions?.predictedOvulation) return false;
    return isoDate >= predictions.predictedOvulation[0] && isoDate <= predictions.predictedOvulation[1];
  };

  const getPredictionUI = () => {
      if (predictions?.predictedOvulation && periodRanges.length >= 2) {
          const ovulationStart = new Date(predictions.predictedOvulation[0]);
          const diffTime = ovulationStart.getTime() - today.getTime();
          const daysUntilOvulation = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return (
            <View style={styles.predictionSection}>
                <Text style={styles.predictionText}>Best chances of conceiving are in</Text>
                <Text style={styles.predictionDays}>{daysUntilOvulation} days</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => router.push("/(main)/calenderScreen")}>
                    <Text style={styles.editButtonText}>Edit period dates</Text>
                </TouchableOpacity>
            </View>
          );
      }
      return (
          <View style={styles.ctaBox}>
              <Text style={styles.ctaText}>
                  Log the first day of your last period{"\n"}to make better predictions
              </Text>
              <TouchableOpacity
                  style={styles.logButton}
                  onPress={() => {
                      if (selectedDay > today) {
                          Alert.alert("Invalid Date", "You cannot log a future date.");
                      } else {
                          handleLogPeriod();
                      }
                  }}
              >
                  <Text style={styles.logButtonText}>Log period</Text>
              </TouchableOpacity>
          </View>
      );
  };

  const handleLogPeriod = () => {
    const isoDate = selectedDay.toISOString().split('T')[0];
    router.push({
      pathname: "/(main)/calenderScreen",
      params: { logDate: isoDate }
    });
  };

  const renderHeader = () => (
    <>
      <View style={styles.calendarTopBar}>
        <View style={styles.lottieContainer}>
          <TouchableOpacity onPress={() => router.push("/(main)/settings")}>
            <LottieView
              source={require("@/anim/wired-lineal-269-avatar-female-hover-glance.json")}
              style={{ width: 40, height: 40 }}
              autoPlay
              loop
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.calendarMonth}>
          {selectedDay.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </Text>
        <TouchableOpacity onPress={() => router.push("/(main)/calenderScreen")}>
          <Ionicons name="calendar-outline" size={28} color="#ef5da8" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarStrip}>
        <FlatList
          ref={flatListRef}
          data={weeks}
          keyExtractor={(_, idx) => idx.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={4}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          renderItem={({ item: week }) => (
            <View style={{ width, paddingHorizontal: 20 }}>
              <View style={styles.weekRow}>
                {week.map((date: Date, idx: number) => (
                  <DayItem
                    key={idx}
                    date={date}
                    selectedDay={selectedDay}
                    today={today}
                    isInPeriod={isInPeriod}
                    onPress={handleDateSelected}
                    isPredictedPeriod={isPredictedPeriod(date)}
                    isPredictedOvulation={isPredictedOvulation(date)}
                  />
                ))}
              </View>
            </View>
          )}
        />
      </View>
      {getPredictionUI()}
    </>
  );

  const renderContent = () => (
    <ScrollView style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>My daily insights · Today</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, paddingLeft: 16 }}>
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardIconContainer}>
            <Ionicons name="add-circle" size={32} color="#ef5da8" />
          </View>
          <Text style={styles.cardTitle}>Log your symptoms</Text>
        </TouchableOpacity>
        <View style={[styles.card, { backgroundColor: "#fff0f0" }]}>
          <Image source={require("@/assets/images/new.png")} style={styles.cardImage} />
          <Text style={styles.cardTitle}>Today's sex superpower</Text>
          <Text style={styles.cardSubtitle}>Your period</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#eef6ff" }]}>
          <Image source={require("@/assets/images/period.png")} style={styles.cardImage} />
          <Text style={styles.cardTitle}>Today's chance of pregnancy</Text>
          <Text style={styles.cardSubtitle}>Updating ...</Text>
        </View>
        <TouchableOpacity style={[styles.card, { backgroundColor: "#e8fdf2" }]}>
          <Image source={require("@/assets/images/img.png")} style={styles.cardImage} />
          <Text style={styles.cardTitle}>September Symptom report</Text>
          <Text style={styles.cardSubtitle}>Explore now</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>During your period</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
          <View style={styles.infoCard}>
            <Image source={require("@/assets/images/period.png")} style={styles.infoCardImage} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Coping with cramps</Text>
              <View style={styles.infoCardItem}>
                <Ionicons name="bulb-outline" size={16} color="#4b0082" />
                <Text style={styles.infoCardText}>Quick pain relief tips</Text>
              </View>
              <View style={styles.infoCardItem}>
                <Ionicons name="heart-outline" size={16} color="#4b0082" />
                <Text style={styles.infoCardText}>What's causing your cramps</Text>
              </View>
              <View style={styles.infoCardItem}>
                <Ionicons name="medical-outline" size={16} color="#4b0082" />
                <Text style={styles.infoCardText}>When to see a doctor</Text>
              </View>
              <TouchableOpacity style={styles.infoCardButton}>
                <Text style={styles.infoCardButtonText}>Manage the pain</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Symptom Checker</Text>
        <TouchableOpacity style={styles.pcosCard} onPress={() => router.push('/(main)/pcosChecker')} > 
          <Ionicons name="warning-outline" size={24} color="#f43f5e" />
          <Text style={styles.pcosText}>
            Up to 70% of people with polycystic ovary syndrome (PCOS) don't know for sure that they have it
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.pcosAssessmentCard}
          onPress={() => router.push('/(main)/pcosChecker')}
          activeOpacity={0.8}
        >
          <View style={styles.pcosAssessmentIcon}>
            <Ionicons name="clipboard-outline" size={24} color="#f43f5e" />
          </View>
          <View style={styles.pcosAssessmentTextContainer}>
            <Text style={styles.pcosAssessmentTitle}>PCOS self-assessment</Text>
            <View style={styles.pcosAssessmentTime}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.pcosAssessmentTimeText}>Typically 5 min</Text>
            </View>
          </View>
          <View style={styles.pcosAssessmentArrow}>
            <Ionicons name="arrow-forward" size={24} color="#f43f5e" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My cycles</Text>
        <View style={styles.cyclesContainer}>
          <TouchableOpacity style={styles.cycleInfoCard}>
            <Text style={styles.cycleInfoTitle}>Previous cycle length</Text>
            <View style={styles.cycleInfoStatus}>
              <Ionicons name="warning-outline" size={16} color="#ffc107" />
              <Text style={styles.cycleInfoText}>ABNORMAL</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cycleInfoCard}>
            <Text style={styles.cycleInfoTitle}>Previous period length</Text>
            <View style={styles.cycleInfoStatus}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#4caf50" />
              <Text style={styles.cycleInfoText}>NORMAL</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cycleInfoCard}>
            <Text style={styles.cycleInfoTitle}>Cycle length variation</Text>
            <View style={styles.cycleInfoStatus}>
              <Ionicons name="warning-outline" size={16} color="#ffc107" />
              <Text style={styles.cycleInfoText}>IRREGULAR</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logRecentPeriodsButton}>
          <Text style={styles.logRecentPeriodsButtonText}>Log recent periods</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My symptom patterns</Text>
        <View style={styles.symptomPatternCard}>
          <Text style={styles.symptomPatternText}>
            Get to know your body better. By logging symptoms, you'll be able to spot patterns across multiple cycles and get insights verified by medical experts.
          </Text>
          <Image source={require("@/assets/images/calendar.png")} style={styles.symptomPatternImage} />
        </View>
      </View>

    </ScrollView>
  );

  return (
    <LinearGradient colors={["#fff", "#fdf2f8"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Log Period for{" "}
              {selectedDay.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
            </Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={async () => {
              handleLogPeriod();
              setModalVisible(false);
            }}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>Confirm Log</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: "#ccc", marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#333", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10, 
    paddingBottom: 10,
  },
  lottieContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarMonth: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  calendarStrip: {
    height: 120,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  ctaBox: {
    backgroundColor: "#fde3f0",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  ctaText: {
    fontSize: 16,
    color: "#f43f5e",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
  },
  logButton: {
    backgroundColor: "#f43f5e",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  logButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  contentContainer: {
    paddingBottom: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 30,
    marginLeft: 20,
  },
  card: {
    width: 150,
    height: 150,
    backgroundColor: "#fdf2f8",
    borderRadius: 16,
    padding: 15,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: 'center',
  },
  cardImage: {
    width: "100%",
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalCloseButton: {
    backgroundColor: "#f43f5e",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  predictionSection: {
    backgroundColor: "#fdf2f8",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 40,
  },
  predictionText: {
    fontSize: 16,
    color: "#f43f5e",
    fontWeight: "500",
    textAlign: "center",
  },
  predictionDays: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#f43f5e",
    marginVertical: 10,
  },
  editButton: {
    position: 'absolute',
    bottom: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: "#f43f5e",
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#4b0082',
    borderRadius: 16,
    marginTop: 12,
    overflow: 'hidden',
    padding: 20,
    width: 300,
  },
  infoCardImage: {
    width: 100,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    opacity: 0.3,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  infoCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoCardText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  infoCardButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  infoCardButtonText: {
    color: '#4b0082',
    fontWeight: 'bold',
  },
  cyclesContainer: {
    marginTop: 12,
  },
  cycleInfoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cycleInfoTitle: {
    fontSize: 16,
    color: '#333',
  },
  cycleInfoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cycleInfoText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  logRecentPeriodsButton: {
    backgroundColor: '#f43f5e',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  logRecentPeriodsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  symptomPatternCard: {
    backgroundColor: '#fdf2f8',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    alignItems: 'center',
  },
  symptomPatternText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  symptomPatternImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  pcosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    borderRadius: 16,
    padding: 15,
    marginTop: 12,
  },
  pcosText: {
    fontSize: 14,
    color: '#f43f5e',
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  pcosAssessmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-between',
  },
  pcosAssessmentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fde3f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  pcosAssessmentTextContainer: {
    flex: 1,
  },
  pcosAssessmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pcosAssessmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pcosAssessmentTimeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  pcosAssessmentArrow: {
    marginLeft: 15,
  },
});