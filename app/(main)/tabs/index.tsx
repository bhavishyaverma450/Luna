import SymptomModal from "@/components/SymptomModal";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

// Interfaces and constants
interface PeriodRange {
  start: string;
  end: string;
}

interface PredictionData {
  predictedPeriod: PeriodRange | null;
  predictedOvulation: string[] | null;
}

interface LoggedSymptomData {
  symptoms: string[];
  notes: string;
}

const NORMAL_CYCLE_MIN = 21;
const NORMAL_CYCLE_MAX = 35;
const NORMAL_PERIOD_MIN = 2;
const NORMAL_PERIOD_MAX = 7;

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
  const lastPeriod = sortedPeriods[sortedPeriods.length - 1];
  const lastPeriodDuration = Math.ceil(
    (new Date(lastPeriod.end).getTime() - new Date(lastPeriod.start).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  const predictedStart = new Date(new Date(lastPeriod.start).getTime() + averageCycleLength * 24 * 60 * 60 * 1000);
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

const getCycleMetrics = (periods: PeriodRange[]) => {
  if (periods.length < 2) {
    return {
      prevCycleLength: null,
      prevPeriodDuration: null,
      cycleVariation: null,
    };
  }
  const sortedPeriods = [...periods].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const lastPeriod = sortedPeriods[sortedPeriods.length - 1];
  const lastPeriodDuration = Math.ceil(
    (new Date(lastPeriod.end).getTime() - new Date(lastPeriod.start).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  const previousPeriod = sortedPeriods[sortedPeriods.length - 2];
  const prevCycleLength = Math.ceil(
    (new Date(lastPeriod.start).getTime() - new Date(previousPeriod.start).getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleLengths = sortedPeriods.slice(1).map((period, index) =>
    Math.ceil((new Date(period.start).getTime() - new Date(sortedPeriods[index].start).getTime()) / (1000 * 60 * 60 * 24))
  );
  const averageLength = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;
  const variation = Math.max(...cycleLengths) - Math.min(...cycleLengths);
  return {
    prevCycleLength,
    prevPeriodDuration: lastPeriodDuration,
    cycleVariation: variation,
  };
};

const getStatus = (value: number | null, min: number, max: number) => {
  if (value === null || isNaN(value)) {
    return { text: "N/A", color: "#666", icon: "help-circle-outline" };
  }
  if (value >= min && value <= max) {
    return { text: "NORMAL", color: "#4caf50", icon: "checkmark-circle-outline" };
  } else {
    return { text: "ABNORMAL", color: "#ffc107", icon: "warning-outline" };
  }
};

const getIrregularityStatus = (variation: number | null, periodsLength: number) => {
  if (periodsLength < 3 || variation === null || isNaN(variation)) {
    return { text: "N/A", color: "#666", icon: "help-circle-outline" };
  }
  if (variation > 7) {
    return { text: "IRREGULAR", color: "#ffc107", icon: "warning-outline" };
  }
  return { text: "REGULAR", color: "#4caf50", icon: "checkmark-circle-outline" };
};

const DayItem = ({ date, selectedDay, today, isInPeriod, onPress, isPredictedOvulation, isFuturePredictedPeriod, hasSymptoms }) => {
  const isSelected = date.toDateString() === selectedDay.toDateString();
  const isToday = date.toDateString() === today.toDateString();
  const isPeriodDay = isInPeriod(date);

  // Define the styles for the day container based on its state
  const dayContainerStyle = [
    styles.dayContainer,
    isSelected && styles.dayContainerSelected,
  ];

  // Define the style for the bubble behind the day number
  const dayBubbleStyle = [
    styles.dayBubble,
    isPeriodDay && styles.periodDay,
    isPredictedOvulation && styles.ovulationDay,
    isFuturePredictedPeriod && styles.futurePredictedPeriodDay,
  ];

  const dayTextStyle = [
    styles.dayText,
    isPeriodDay && styles.periodText,
    isPredictedOvulation && styles.ovulationText,
    isFuturePredictedPeriod && styles.futurePredictedText,
    date.getMonth() !== selectedDay.getMonth() && styles.fadedText,
  ];

  return (
    <TouchableOpacity onPress={() => onPress(date)} style={dayContainerStyle}>
      <Text style={styles.weekdayText}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
      <View style={[styles.day, isSelected && styles.selectedDay]}>
        <View style={dayBubbleStyle}>
          <Text style={dayTextStyle}>{date.getDate()}</Text>
        </View>
      </View>
      {isToday && <View style={styles.todayIndicator} />}
      {hasSymptoms(date) && (
        <Ionicons name="sparkles" size={12} color="#f43f5e" style={styles.symptomSparkle} />
      )}
    </TouchableOpacity>
  );
};

export default function Home() {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [periodRanges, setPeriodRanges] = useState<PeriodRange[]>([]);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const router = useRouter();
  const flatListRef = useRef<FlatList<any>>(null);

  const [isSymptomModalVisible, setIsSymptomModalVisible] = useState<boolean>(false);
  const [selectedSymptomDate, setSelectedSymptomDate] = useState<string | null>(null);
  const [loggedSymptoms, setLoggedSymptoms] = useState<{ [date: string]: LoggedSymptomData }>({});

  const fetchData = useCallback(async () => {
    try {
      const storedPeriods = await AsyncStorage.getItem("periodRanges");
      const fetchedPeriods: PeriodRange[] = storedPeriods ? JSON.parse(storedPeriods) : [];
      setPeriodRanges(fetchedPeriods);
      const predictionData = getPredictions(fetchedPeriods);
      setPredictions(predictionData);
      const storedSymptoms = await AsyncStorage.getItem("loggedSymptoms");
      const fetchedSymptoms = storedSymptoms ? JSON.parse(storedSymptoms) : {};
      setLoggedSymptoms(fetchedSymptoms);
    } catch (e) {
      console.error("Failed to fetch data from AsyncStorage", e);
      Alert.alert("Error", "Could not load data from your device.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleLogSymptoms = () => {
    setSelectedSymptomDate(selectedDay.toISOString().split('T')[0]);
    setIsSymptomModalVisible(true);
  };

  const saveSymptomsToDevice = async (date: string, symptoms: string[], notes: string) => {
    try {
      const updatedSymptoms = {
        ...loggedSymptoms,
        [date]: { symptoms, notes }
      };
      await AsyncStorage.setItem("loggedSymptoms", JSON.stringify(updatedSymptoms));
      setLoggedSymptoms(updatedSymptoms);
      setIsSymptomModalVisible(false);
    } catch (e) {
      console.error("Failed to save symptoms:", e);
      Alert.alert("Error", "Could not save symptoms. Please try again.");
    }
  };

  const hasSymptoms = (date: Date) => {
    const isoDate = date.toISOString().split('T')[0];
    const symptomsForDate = loggedSymptoms[isoDate];
    return symptomsForDate && symptomsForDate.symptoms.length > 0;
  };

  const generateWeeks = (centerDate: Date, numWeeks: number = 5) => {
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

  const weeks = generateWeeks(selectedDay, 4);

  const handleDateSelected = (date: Date) => {
    setSelectedDay(date);
    const dateIndex = weeks.findIndex(week => week.some(d => d.toDateString() === date.toDateString()));
    if (dateIndex !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: dateIndex, animated: true, viewPosition: 0 });
    }
  };

  const isInPeriod = (date: Date) => {
    const isoDate = date.toISOString().split('T')[0];
    return periodRanges.some((range) => isoDate >= range.start && isoDate <= range.end);
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
    const selectedDateISO = selectedDay.toISOString().split('T')[0];

    // If no data is logged yet
    if (periodRanges.length < 2) {
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
    }
    
    // Period Day
    const currentPeriodRange = periodRanges.find(range => selectedDateISO >= range.start && selectedDateISO <= range.end);
    if (currentPeriodRange) {
      const periodStart = new Date(currentPeriodRange.start);
      const dayOfPeriod = Math.ceil((selectedDay.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return (
        <View style={styles.predictionSection}>
          <Ionicons name="water-outline" size={28} color="#f43f5e" />
          <Text style={styles.predictionDays}>Day {dayOfPeriod-1}</Text>
          <Text style={styles.predictionText}>Your period is here. Take a moment to relax and care for yourself.</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push("/(main)/calenderScreen")}>
            <Text style={styles.editButtonText}>Edit period dates</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Predicted Period Day
    const predictedPeriodStart = new Date(predictions.predictedPeriod.start);
    if (isPredictedPeriod(selectedDay) && selectedDay > today) {
      const daysUntilPeriod = Math.ceil((predictedPeriodStart.getTime() - selectedDay.getTime()) / (1000 * 60 * 60 * 24));
      return (
        <View style={styles.predictionSection}>
          <Ionicons name="calendar-outline" size={28} color="#ffc107" />
          <Text style={styles.predictionText}>Your next period is predicted to start soon. Get ready!</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push("/(main)/calenderScreen")}>
            <Text style={styles.editButtonText}>Edit period dates</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Ovulation Day
    const ovulationStart = new Date(predictions.predictedOvulation[0]);
    if (isPredictedOvulation(selectedDay)) {
      return (
        <View style={styles.predictionOvulationSection}>
          <Ionicons name="heart-outline" size={28} color="#3f51b5" />
          <Text style={styles.predictionText}>High chance of conceiving!</Text>
          <Image
            source={require('@/assets/images/ovulation.png')}
            style={{height:150,width:250,marginTop:5}}
          />          
          <TouchableOpacity style={styles.editOvulationButton} onPress={() => router.push("/(main)/calenderScreen")}>
            <Text style={styles.editOvulationButtonText}>Edit period dates</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Upcoming Ovulation
    if (selectedDay < ovulationStart) {
      const diffStart = ovulationStart.getTime() - selectedDay.getTime();
      const daysUntilOvulation = Math.ceil(diffStart / (1000 * 60 * 60 * 24));
      return (
        <View style={styles.predictionSection}>
          {/* <Ionicons name="sparkles-outline" size={28} color="#f43f5e" /> */}
          <LottieView source={require('@/anim/Trying.json')} style={{height:100,width:150,marginTop:-30,marginBottom:-20,}}
          autoPlay loop/>
          <Text style={styles.predictionText}>Best chances of conceiving are in</Text>
          <Text style={styles.predictionDays}>{daysUntilOvulation} days</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push("/(main)/calenderScreen")}>
            <Text style={styles.editButtonText}>Edit period dates</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Default (Ovulation has passed)
    return (
      <View style={styles.predictionSection}>
        <Ionicons name="checkmark-circle-outline" size={28} color="#4caf50" />
        <Text style={styles.predictionText}>Your ovulation period for this cycle has passed.</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push("/(main)/calenderScreen")}>
          <Text style={styles.editButtonText}>Edit period dates</Text>
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

  const getSymptomPatternUI = () => {
    const selectedDateString = selectedDay.toISOString().split('T')[0];
    const symptomsForSelectedDate = loggedSymptoms[selectedDateString];
    if (!symptomsForSelectedDate || symptomsForSelectedDate.symptoms.length === 0) {
      return (
        <View style={styles.symptomPatternCard}>
          <Text style={styles.symptomPatternText}>
            No symptoms logged for this date. Log your symptoms to see patterns across your cycles.
          </Text>
          <LottieView 
            source={require("@/anim/No data Found.json")} 
            autoPlay
            loop
            style={styles.symptomPatternImage} />
        </View>
      );
    }
    return (
      <View style={styles.symptomPatternCard}>
        <View style={styles.symptomCardHeader}>
          <Text style={styles.symptomCardDate}>
            Symptoms for: {new Date(selectedDateString).toLocaleDateString()}
          </Text>
          <TouchableOpacity
            style={styles.symptomEditButton}
            onPress={() => {
              setSelectedSymptomDate(selectedDateString);
              setIsSymptomModalVisible(true);
            }}
          >
            <Ionicons name="create-outline" size={20} color="#f43f5e" />
          </TouchableOpacity>
        </View>
        <View style={styles.symptomTagsContainer}>
          {symptomsForSelectedDate.symptoms.map((symptom, index) => (
            <View key={index} style={styles.symptomTag}>
              <Text style={styles.symptomTagText}>{symptom}</Text>
            </View>
          ))}
        </View>
        {symptomsForSelectedDate.notes.length > 0 && (
          <View style={styles.symptomNotesContainer}>
            <Text style={styles.symptomNotesTitle}>Notes:</Text>
            <Text style={styles.symptomNotesText}>{symptomsForSelectedDate.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  const getDailyInsightsUI = () => {
    const isPeriodDay = isInPeriod(selectedDay);
    const isOvulationDay = isPredictedOvulation(selectedDay);
    const isFuturePredictedPeriodDay = isPredictedPeriod(selectedDay) && selectedDay > today;
    const symptomsLogged = hasSymptoms(selectedDay);

    const insights = [];

    // Insight 1: Main insight based on cycle phase
    let mainInsight = {
      key: 'main-insight',
      title: 'Hello! You are doing great.',
      subtitle: 'Stay healthy and listen to your body.',
      icon: 'sparkles',
      color: '#e8fdf2',
      iconColor: '#4caf50',
      onPress: null,
    };

    if (isPeriodDay) {
      mainInsight = {
        ...mainInsight,
        title: 'Period is here!',
        subtitle: 'Your superpower is in full effect. Log your flow!',
        icon: 'water-outline',
        color: '#fff0f0',
        iconColor: '#f43f5e',
        onPress: handleLogPeriod,
      };
    } else if (isOvulationDay) {
      mainInsight = {
        ...mainInsight,
        title: 'High chance of conceiving!',
        subtitle: 'Today is one of your most fertile days. Be mindful.',
        icon: 'heart-outline',
        color: '#eef6ff',
        iconColor: '#3f51b5',
        onPress: () => router.push("/(main)/calenderScreen"),
      };
    } else if (isFuturePredictedPeriodDay) {
      mainInsight = {
        ...mainInsight,
        title: 'Predicted period is coming!',
        subtitle: 'Your next cycle is predicted to start soon. Get ready!',
        icon: 'calendar-outline',
        color: '#fff5e6',
        iconColor: '#ffc107',
        onPress: () => router.push("/(main)/calenderScreen"),
      };
    }
    insights.push(mainInsight);

    // Insight 2: Log Symptoms
    insights.push({
      key: 'log-symptoms',
      title: 'Log Symptoms',
      subtitle: symptomsLogged ? 'Symptoms are already logged today.' : 'Add your symptoms and notes now.',
      icon: 'add-circle-outline',
      color: '#fff',
      iconColor: '#ef5da8',
      onPress: handleLogSymptoms,
    });

    // Insight 3: Quick Tip / Info Card (can be dynamic)
    insights.push({
      key: 'quick-tip',
      title: 'Daily Health Tip',
      subtitle: 'Did you know staying hydrated can reduce bloating?',
      icon: 'bulb-outline',
      color: '#fdf2f8',
      iconColor: '#ef5da8',
      onPress: () => router.push("/(main)/HyderatinKey"),
    });

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, paddingLeft: 16,paddingBottom:10, }}>
        {insights.map(insight => (
          <TouchableOpacity
            key={insight.key}
            style={[styles.insightCard, { backgroundColor: insight.color }]}
            onPress={insight.onPress}
          >
            <View style={styles.insightCardIconContainer}>
              <Ionicons name={insight.icon} size={32} color={insight.iconColor} />
            </View>
            <Text style={styles.insightCardTitle}>{insight.title}</Text>
            <Text style={styles.insightCardSubtitle}>{insight.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
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
          initialNumToRender={5} // This helps prevent layout errors
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
                    isPredictedOvulation={isPredictedOvulation(date)}
                    isFuturePredictedPeriod={isPredictedPeriod(date) && date > today}
                    hasSymptoms={hasSymptoms}
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

  const renderContent = () => {
    const { prevCycleLength, prevPeriodDuration, cycleVariation } = getCycleMetrics(periodRanges);
    const cycleStatus = getStatus(prevCycleLength, NORMAL_CYCLE_MIN, NORMAL_CYCLE_MAX);
    const periodStatus = getStatus(prevPeriodDuration, NORMAL_PERIOD_MIN, NORMAL_PERIOD_MAX);
    const variationStatus = getIrregularityStatus(cycleVariation, periodRanges.length);

    return (
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>My daily insights · {selectedDay.toDateString() === today.toDateString() ? 'Today' : selectedDay.toLocaleDateString()}</Text>
        {getDailyInsightsUI()}

        <View style={styles.sectionDuringYourPeriod}>
          <Text style={styles.sectionTitle}>During your period</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
            {/* Coping with cramps card */}
            <TouchableOpacity
              key="coping-cramps"
              style={[styles.infoCard, { backgroundColor: '#4b0082' }]}
              onPress={() => router.push("/(main)/CopingWithCramps")}
            >
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>Coping with cramps</Text>
                <View style={styles.infoCardItem}>
                  <Ionicons name="bulb-outline" size={16} color="#fff" />
                  <Text style={styles.infoCardText}>Quick pain relief tips</Text>
                </View>
                <View style={styles.infoCardItem}>
                  <Ionicons name="heart-outline" size={16} color="#fff" />
                  <Text style={styles.infoCardText}>What's causing your cramps</Text>
                </View>
                <View style={styles.infoCardItem}>
                  <Ionicons name="medical-outline" size={16} color="#fff" />
                  <Text style={styles.infoCardText}>When to see a doctor</Text>
                </View>
                <TouchableOpacity style={styles.infoCardButton} onPress={() => router.push("/(main)/CopingWithCramps")}>
                  <Text style={styles.infoCardButtonText}>Manage the pain</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
        key="hydration-key"
        style={[styles.infoCard, { backgroundColor: '#3f51b5' }]}
        onPress={() => router.push("/(main)/HyderatinKey")}
      >
        <View style={styles.infoCardContent}>
          {/* This new container organizes the title and the animation on one line */}
          <View style={styles.headerRow}>
            <Text style={styles.infoCardTitle}>Hydration is Key</Text>
            <LottieView
              source={require('@/anim/Drink water.json')}
              style={styles.hydrationAnimation}
              autoPlay
              loop
            />
          </View>

          {/* The rest of the card content is now neatly below the title and animation */}
          <View style={styles.infoCardItem}>
            <Ionicons name="water-outline" size={16} color="#fff" />
            <Text style={styles.infoCardText}>Boost energy with water</Text>
          </View>
          <View style={styles.infoCardItem}>
            <Ionicons name="pint-outline" size={16} color="#fff" />
            <Text style={styles.infoCardText}>Importance of electrolytes</Text>
          </View>
          <View style={styles.infoCardItem}>
            <Ionicons name="cafe-outline" size={16} color="#fff" />
            <Text style={styles.infoCardText}>Avoid sugary drinks</Text>
          </View>

          <TouchableOpacity
            style={styles.infoCardButton}
            onPress={() => router.push("/(main)/HyderatinKey")}
          >
            <Text style={styles.infoCardButtonText}>Stay hydrated</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

            {/* Period-friendly foods card */}
            <TouchableOpacity
              key="period-friendly-foods"
              style={[styles.infoCard, { backgroundColor: '#4caf50' }]}
              onPress={() => router.push("/(main)/PeriodFriendlyFoods")}
            >
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>Period-friendly foods</Text>
                <View style={styles.infoCardItem}>
                  <Ionicons name="nutrition-outline" size={16} color="#fff" />
                  <Text style={styles.infoCardText}>Foods to reduce bloating</Text>
                </View>
                <View style={styles.infoCardItem}>
                  <Ionicons name="leaf-outline" size={16} color="#fff" />
                  <Text style={styles.infoCardText}>Rich in iron & vitamins</Text>
                </View>
                <View style={styles.infoCardItem}>
                  <Ionicons name="fast-food-outline" size={16} color="#fff" />
                  <Text style={styles.infoCardText}>What to avoid</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.infoCardButton}
                  onPress={() => router.push("/(main)/PeriodFriendlyFoods")}
                >
                  <Text style={styles.infoCardButtonText}>Explore diet</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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
                <Text style={[styles.cycleInfoValue, { color: cycleStatus.color }]}>{prevCycleLength !== null ? `${prevCycleLength} days` : "N/A"}</Text>
                <Ionicons name={cycleStatus.icon} size={16} color={cycleStatus.color} style={{ marginLeft: 5 }} />
                <Text style={[styles.cycleStatusText, { color: cycleStatus.color }]}>{cycleStatus.text}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cycleInfoCard}>
              <Text style={styles.cycleInfoTitle}>Previous period duration</Text>
              <View style={styles.cycleInfoStatus}>
                <Text style={[styles.cycleInfoValue, { color: periodStatus.color }]}>{prevPeriodDuration !== null ? `${prevPeriodDuration} days` : "N/A"}</Text>
                <Ionicons name={periodStatus.icon} size={16} color={periodStatus.color} style={{ marginLeft: 5 }} />
                <Text style={[styles.cycleStatusText, { color: periodStatus.color }]}>{periodStatus.text}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cycleInfoCard}>
              <Text style={styles.cycleInfoTitle}>Cycle length variation</Text>
              <View style={styles.cycleInfoStatus}>
                <Text style={[styles.cycleInfoValue, { color: variationStatus.color }]}>{cycleVariation !== null ? `${cycleVariation} days` : "N/A"}</Text>
                <Ionicons name={variationStatus.icon} size={16} color={variationStatus.color} style={{ marginLeft: 5 }} />
                <Text style={[styles.cycleStatusText, { color: variationStatus.color }]}>{variationStatus.text}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.logRecentPeriodsButton}>
            <Text style={styles.logRecentPeriodsButtonText}>Log recent periods</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My symptom patterns</Text>
          {getSymptomPatternUI()}
        </View>
      </ScrollView>
    );
  };

  return (
    <LinearGradient colors={["#fff", "#fdf2f8"]} style={styles.container}>
      <View style={{ flex: 1, marginTop:30, }}>
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderContent}
          showsVerticalScrollIndicator={false}
        />
      </View>

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

      <SymptomModal
        isVisible={isSymptomModalVisible}
        onClose={() => setIsSymptomModalVisible(false)}
        selectedDate={selectedSymptomDate}
        onSave={saveSymptomsToDevice}
        initialSymptoms={selectedSymptomDate ? loggedSymptoms[selectedSymptomDate]?.symptoms || [] : []}
        initialNotes={selectedSymptomDate ? loggedSymptoms[selectedSymptomDate]?.notes || "" : ""}
      />
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
    marginTop: 10,
    marginBottom:-20,
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
    marginTop: 5, 
    marginBottom: 15,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    marginTop: 20,
    marginLeft: 20,
  },
  sectionDuringYourPeriod:{
    marginTop:20,
    paddingHorizontal: 0,
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
  modalCloseButtonText: {
    color: "#fff",
    fontWeight: "600"
  },
  predictionOvulationSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 5, // Reduced spacing
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  predictionSection: {
    backgroundColor: "#fde3f0",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 5, // Reduced spacing
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 15,
    alignSelf: 'center',
  },
  editOvulationButton: {
    backgroundColor: '#f43f5e',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 15,
    alignSelf: 'center',
  },
  editButtonText: {
    color: "#f43f5e",
    fontWeight: "600",
  },
  editOvulationButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#4b0082',
    borderRadius: 16,
    marginTop: 12,
    padding: 20,
    marginRight: 10,
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
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
  secondaryInfoCard: {
    width: 150,
    height: 150,
    backgroundColor: '#eef6ff',
    borderRadius: 16,
    padding: 15,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryInfoCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b0082',
    textAlign: 'center',
    marginTop: 10,
  },
  secondaryInfoCardText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
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
  cycleInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  cycleStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  symptomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  symptomCardDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  symptomEditButton: {
    backgroundColor: '#fde3f0',
    padding: 6,
    borderRadius: 12,
  },
  symptomTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  symptomTag: {
    backgroundColor: '#ff99b3',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  symptomTagText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  symptomNotesContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  symptomNotesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  symptomNotesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  dayContainer: {
    width: (width - 40) / 7,
    alignItems: 'center',
    marginBottom: 8,
  },
  dayContainerSelected: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 12,
  },
  weekdayText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginBottom: 4,
  },
  day: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#fff',
    borderColor: '#f43f5e',
    borderWidth: 2,
  },
  dayBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fadedText: {
    color: '#ccc',
  },
  periodDay: {
    backgroundColor: '#f43f5e',
  },
  periodText: {
    color: '#fff',
  },
  ovulationDay: {
    backgroundColor: '#52b2ff',
  },
  ovulationText: {
    color: '#fff',
  },
  futurePredictedPeriodDay: {
    backgroundColor: 'rgba(244, 63, 94, 0.3)',
  },
  futurePredictedText: {
    color: '#f43f5e',
  },
  todayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f43f5e',
    marginTop: 4,
  },
  symptomSparkle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  insightCard: {
    width: 180,
    height: 150,
    borderRadius: 20,
    padding: 20,
    marginRight: 15,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  insightCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  insightCardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});