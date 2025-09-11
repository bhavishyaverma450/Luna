import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CalendarList, DateData } from "react-native-calendars";

const { height: screenHeight } = Dimensions.get("window");
const CARD_HEIGHT = screenHeight * 0.45;
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

export default function CalendarScreen() {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const router = useRouter();
  const { logDate } = useLocalSearchParams();

  const [selectedDate, setSelectedDate] = useState<string | null>(todayString);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [periodRanges, setPeriodRanges] = useState<PeriodRange[]>([]);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const animatedValue = useRef(new Animated.Value(screenHeight)).current;
  const originalRanges = useRef<PeriodRange[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        animatedValue.setValue(
          Math.max(screenHeight - CARD_HEIGHT, animatedValue._value + gestureState.dy)
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          showBottomCard();
        } else if (gestureState.dy > 50) {
          hideBottomCard();
        } else {
          if (animatedValue._value > screenHeight - CARD_HEIGHT / 2) {
            hideBottomCard();
          } else {
            showBottomCard();
          }
        }
      },
    })
  ).current;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const fetchAndSetData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("User not logged in");
      const response = await axios.get(`${API_BASE}/period/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedPeriods = response.data.map((log: any) => ({
        start: log.start_date,
        end: log.end_date
      }));
      setPeriodRanges(fetchedPeriods);
      originalRanges.current = fetchedPeriods;
      await AsyncStorage.setItem("periodRanges", JSON.stringify(fetchedPeriods));
      const predictionData = getPredictions(fetchedPeriods);
      setPredictions(predictionData);
    } catch (e: any) {
        if (e.response && e.response.status === 401) {
            Alert.alert(
              "Session Expired",
              "Please log in again.",
              [{ text: "OK", onPress: async () => {
                await AsyncStorage.removeItem("userToken");
                router.replace('/(auth)');
              }}]
            );
        } else {
            console.error("Failed to fetch periods from backend", e.response?.data || e.message);
            Alert.alert("Error", "Could not load period data. Please check your connection.");
        }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAndSetData();
    }, [])
  );

  useEffect(() => {
    if (logDate && typeof logDate === 'string') {
      setSelectedDate(logDate);
      setIsLogging(true);
      showBottomCard();
    }
  }, [logDate]);

  useEffect(() => {
    const newMarkedDates = getMarkedDates();
    setMarkedDates(newMarkedDates);
  }, [periodRanges, selectedDate, predictions, isEditing, isLogging]);

  const getSelectedStyle = () => ({
    selected: true,
    selectedColor: "#ff5083",
    selectedTextColor: "white",
  });

  const getPeriodStyle = () => ({
    color: "#f43f5e",
    startingDay: true,
    endingDay: true,
  });

  const getPredictionPeriodStyle = () => ({
    color: "#f43f5e",
    startingDay: true,
    endingDay: true,
    textColor: "#f43f5e",
    marked: true,
    dotColor: "transparent",
    customStyles: {
      container: {
        borderWidth: 1.5,
        borderColor: "#f43f5e",
        borderStyle: "dotted",
        borderRadius: 20,
      },
      text: { color: "#f43f5e", fontWeight: "bold" },
    },
  });

  const getOvulationStyle = () => ({
    color: "#a4c639",
    startingDay: true,
    endingDay: true,
    textColor: "#a4c639",
    marked: true,
    dotColor: "transparent",
    customStyles: {
      container: {
        borderWidth: 1.5,
        borderColor: "#a4c639",
        borderStyle: "dotted",
        borderRadius: 20,
      },
      text: { color: "#a4c639", fontWeight: "bold" },
    },
  });

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};

    periodRanges.forEach((range) => {
      let current = new Date(range.start);
      const end = new Date(range.end);
      let isFirstDay = true;
      while (current <= end) {
        const dateStr = current.toISOString().split("T")[0];
        const isLastDay = current.toDateString() === end.toDateString();

        marked[dateStr] = {
          ...marked[dateStr],
          customStyles: {
            container: {
              backgroundColor: '#f43f5e',
              borderTopLeftRadius: isFirstDay ? 20 : 0,
              borderBottomLeftRadius: isFirstDay ? 20 : 0,
              borderTopRightRadius: isLastDay ? 20 : 0,
              borderBottomRightRadius: isLastDay ? 20 : 0,
              width: 32,
              borderWidth: 1.5,
              borderColor: "#f43f5e",
              borderStyle: "dotted",
            },
            text: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
        };
        isFirstDay = false;
        current.setDate(current.getDate() + 1);
      }
    });

    if (!isEditing && !isLogging && predictions) {
      if (predictions.predictedPeriod) {
        let current = new Date(predictions.predictedPeriod.start);
        const end = new Date(predictions.predictedPeriod.end);
        while (current <= end) {
          const dateStr = current.toISOString().split("T")[0];
          marked[dateStr] = marked[dateStr] ? marked[dateStr] : getPredictionPeriodStyle();
          current.setDate(current.getDate() + 1);
        }
      }
      if (predictions.predictedOvulation) {
        let current = new Date(predictions.predictedOvulation[0]);
        const end = new Date(predictions.predictedOvulation[1]);
        while (current <= end) {
          const dateStr = current.toISOString().split("T")[0];
          marked[dateStr] = marked[dateStr] ? marked[dateStr] : getOvulationStyle();
          current.setDate(current.getDate() + 1);
        }
      }
    }

    if (selectedDate) {
      marked[selectedDate] = { ...marked[selectedDate], ...getSelectedStyle() };
    }

    return marked;
  };

  const showBottomCard = () => {
    Animated.timing(animatedValue, {
      toValue: screenHeight - CARD_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const hideBottomCard = () => {
    Animated.timing(animatedValue, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
        setSelectedDate(null);
        setIsLogging(false);
    });
  };

  const handleDayPress = useCallback(
    (day: DateData) => {
      const newDate = day.dateString;
      setSelectedDate(newDate);

      if (isEditing || isLogging) {
        togglePeriod(newDate);
      } else {
        showBottomCard();
      }
    },
    [periodRanges, isEditing, isLogging]
  );
  
  const togglePeriod = async (dateStr: string) => {
    const isPeriodDay = periodRanges.some(
      (r) => dateStr >= r.start && dateStr <= r.end
    );
    
    let updatedRanges: PeriodRange[] = [];
    if (isPeriodDay) {
        updatedRanges = periodRanges.filter(range => !(dateStr >= range.start && dateStr <= range.end));
    } else {
        updatedRanges = [...periodRanges, { start: dateStr, end: dateStr }];
    }
    
    setPeriodRanges(updatedRanges);
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("User not logged in");
      
      const response = await axios.post(`${API_BASE}/period/update`, { periods: periodRanges }, {
          headers: { Authorization: `Bearer ${token}` },
      });
      
      await AsyncStorage.setItem("periodRanges", JSON.stringify(periodRanges));
      Alert.alert("Success", "Period dates saved successfully.");
      setIsEditing(false);
      hideBottomCard();
      fetchAndSetData();
    } catch (e: any) {
      console.error("Failed to save changes:", e.response?.data || e.message);
      Alert.alert("Error", "Could not save changes. Please try again.");
    }
  };

  const handleCancel = () => {
      setPeriodRanges(originalRanges.current);
      setIsEditing(false);
      hideBottomCard();
  };
  
  const handleLogPeriod = async () => {
    if (!selectedDate) return;
    
    const newPeriod = { start: selectedDate, end: selectedDate };
    let updatedRanges = [...periodRanges, newPeriod];
    
    try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) throw new Error("User not logged in");
        
        await axios.post(
            `${API_BASE}/period/add`,
            { start_date: newPeriod.start, end_date: newPeriod.end },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        await AsyncStorage.setItem("periodRanges", JSON.stringify(updatedRanges));
        setPeriodRanges(updatedRanges);
        setIsLogging(false);
        hideBottomCard();
        Alert.alert("Success", "Period logged successfully!");
        fetchAndSetData();
    } catch (e: any) {
        console.error("Failed to log period:", e.response?.data || e.message);
        Alert.alert("Error", "Could not log period. Please try again.");
    }
  };

  const renderYearView = () => (
    <FlatList
      data={months}
      numColumns={3}
      keyExtractor={(item) => item}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      renderItem={({ item, index }) => {
        const monthNumber = index;
        return (
          <TouchableOpacity
            style={styles.monthItem}
            onPress={() => {
              const firstDay = new Date(currentYear, monthNumber, 1).toISOString().split("T")[0];
              setSelectedDate(firstDay);
              setViewMode("month");
            }}
          >
            <Text style={styles.monthText}>{item}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={viewMode === "month" ? styles.toggleButtonActive : styles.toggleButton}
            onPress={() => setViewMode("month")}
          >
            <Text style={viewMode === "month" ? styles.toggleTextActive : styles.toggleText}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={viewMode === "year" ? styles.toggleButtonActive : styles.toggleButton}
            onPress={() => setViewMode("year")}
          >
            <Text style={viewMode === "year" ? styles.toggleTextActive : styles.toggleText}>Year</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {viewMode === "month" ? (
        <CalendarList
          pastScrollRange={12}
          futureScrollRange={12}
          scrollEnabled
          showScrollIndicator
          current={selectedDate || todayString}
          markingType={"custom"}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{
            backgroundColor: "transparent",
            calendarBackground: "transparent",
            textSectionTitleColor: "#a0a0a0",
            dayTextColor: "#1e293b",
            monthTextColor: "#333",
            todayTextColor: "#ff5083",
            textDayFontWeight: "600",
            textMonthFontWeight: "700",
            textDayHeaderFontWeight: "600",
            dotColor: "#ff5083",
            "stylesheet.calendar.header": {
              week: {
                marginTop: 10,
                flexDirection: "row",
                justifyContent: "space-around",
              },
            },
          }}
        />
      ) : (
        <ScrollView style={styles.yearViewScrollView}>{renderYearView()}</ScrollView>
      )}

      {isEditing || isLogging ? (
        <View style={styles.editButtonsContainer}>
          <TouchableOpacity onPress={handleCancel} style={[styles.editButton, {backgroundColor: '#ccc'}]}>
              <Text style={[styles.editButtonText, {color: '#333'}]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={[styles.editButton, {backgroundColor: '#ff5083'}]}>
              <Text style={styles.editButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.bottomCard,
            {
              transform: [{ translateY: animatedValue }],
            },
          ]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.bottomCardHeader}>
              <Text style={styles.bottomCardTitle}>
                {selectedDate
                  ? new Date(selectedDate).toLocaleString("en-us", { month: "short", day: "numeric" })
                  : "Select a Date"}
              </Text>
              <TouchableOpacity onPress={hideBottomCard}>
                <Ionicons name="close" size={24} color="#a0a0a0" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text>Insights and reminders would be here.</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={[styles.periodButton, { marginTop: 20 }]}>
                <Text style={styles.periodButtonText}>Edit Period Dates</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 3,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 18,
  },
  toggleButtonActive: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: "#fff",
  },
  toggleText: {
    color: "#888",
    fontWeight: "bold",
  },
  toggleTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  yearViewScrollView: {
    flex: 1,
  },
  monthItem: {
    flex: 1,
    margin: 10,
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  monthText: {
    fontWeight: "600",
    fontSize: 16,
  },
  bottomCard: {
    position: "absolute",
    left: 0,
    right: 0,
    height: screenHeight,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 5,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: 5,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
  },
  bottomCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  bottomCardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  periodButton: {
    backgroundColor: "#ff5083",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  periodButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  editButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});