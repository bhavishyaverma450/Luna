import SymptomModal from '@/components/SymptomModal';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { CalendarList, DateData } from "react-native-calendars";
import LottieView from 'lottie-react-native';

const { height: screenHeight } = Dimensions.get("window");
const CARD_HEIGHT = screenHeight * 0.45;
const EXPANDED_CARD_HEIGHT = screenHeight * 0.8;

interface PeriodRange {
    start: string;
    end: string;
}

interface PredictionData {
    predictedPeriods: PeriodRange[];
    predictedOvulation: string[] | null;
}

interface LoggedSymptomData {
    symptoms: string[];
    notes: string;
}

const getPredictions = (periods: PeriodRange[]): PredictionData => {
    if (periods.length < 2) {
        return { predictedPeriods: [], predictedOvulation: null };
    }
    const sortedPeriods = [...periods].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    const validPeriods = sortedPeriods.filter(period => 
        !isNaN(new Date(period.start).getTime()) && !isNaN(new Date(period.end).getTime())
    );

    if (validPeriods.length < 2) {
        return { predictedPeriods: [], predictedOvulation: null };
    }

    const cycleLengths = validPeriods.slice(1).map((period, index) => {
        const prevPeriodStart = new Date(validPeriods[index].start);
        const currentPeriodStart = new Date(period.start);
        return Math.ceil(Math.abs(currentPeriodStart.getTime() - prevPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
    });

    const validCycleLengths = cycleLengths.filter(len => len > 0);
    
    if (validCycleLengths.length === 0) {
      return { predictedPeriods: [], predictedOvulation: null };
    }

    const averageCycleLength = validCycleLengths.reduce((sum, len) => sum + len, 0) / validCycleLengths.length;
    const lastPeriod = validPeriods[validPeriods.length - 1];
    const lastPeriodEnd = new Date(lastPeriod.end);
    const lastPeriodStart = new Date(lastPeriod.start);
    const lastPeriodDuration = Math.ceil(
        Math.abs(lastPeriodEnd.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (isNaN(lastPeriodEnd.getTime()) || isNaN(lastPeriodStart.getTime()) || isNaN(lastPeriodDuration)) {
      return { predictedPeriods: [], predictedOvulation: null };
    }

    const predictedPeriods: PeriodRange[] = [];
    let currentPredictedStart = new Date(lastPeriodStart.getTime() + averageCycleLength * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 2; i++) {
        const predictedEnd = new Date(currentPredictedStart.getTime() + lastPeriodDuration * 24 * 60 * 60 * 1000);
        predictedPeriods.push({
            start: currentPredictedStart.toISOString().split('T')[0],
            end: predictedEnd.toISOString().split('T')[0],
        });
        currentPredictedStart.setDate(currentPredictedStart.getDate() + averageCycleLength);
    }
    
    const firstPredictedPeriod = predictedPeriods[0];
    const ovulationDay = new Date(new Date(firstPredictedPeriod.start).getTime() - 14 * 24 * 60 * 60 * 1000);

    if (isNaN(ovulationDay.getTime())) {
      return { predictedPeriods, predictedOvulation: null };
    }

    const ovulationWindow = [
        (new Date(ovulationDay.getTime() - 2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        (new Date(ovulationDay.getTime() + 2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    ];
    
    if (isNaN(new Date(ovulationWindow[0]).getTime()) || isNaN(new Date(ovulationWindow[1]).getTime())) {
        return { predictedPeriods, predictedOvulation: null };
    }

    return {
        predictedPeriods,
        predictedOvulation: ovulationWindow,
    };
};

export default function CalendarScreen() {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState<string | null>(todayString);
    const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
    const [viewMode, setViewMode] = useState<"month" | "year">("month");
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [periodRanges, setPeriodRanges] = useState<PeriodRange[]>([]);
    const [predictions, setPredictions] = useState<PredictionData | null>(null);
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
    const [isSymptomsModalVisible, setIsSymptomsModalVisible] = useState(false);
    const [isBottomCardVisible, setIsBottomCardVisible] = useState(false);
    const [isEditingPeriod, setIsEditingPeriod] = useState(false);
    const [newPeriodRange, setNewPeriodRange] = useState<PeriodRange | null>(null);
    const [editingMonth, setEditingMonth] = useState<string | null>(null);

    const [isInsightModalVisible, setIsInsightModalVisible] = useState(false);
    const [insightModalContent, setInsightModalContent] = useState({ title: '', content: '' });

    // State to hold symptoms logged for each date
    const [loggedSymptoms, setLoggedSymptoms] = useState<{ [date: string]: LoggedSymptomData }>({});

    const animatedValue = useRef(new Animated.Value(screenHeight)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                const newTranslateY = animatedValue._value + gestureState.dy;
                const clampedTranslateY = Math.max(
                    screenHeight - EXPANDED_CARD_HEIGHT,
                    Math.min(screenHeight, newTranslateY)
                );
                animatedValue.setValue(clampedTranslateY);
            },
            onPanResponderRelease: (_, gestureState) => {
                const currentTranslateY = animatedValue._value;
                const middlePoint = screenHeight - (EXPANDED_CARD_HEIGHT + CARD_HEIGHT) / 2;

                if (gestureState.vy > 0.5 || currentTranslateY > middlePoint) {
                    Animated.spring(animatedValue, {
                        toValue: screenHeight - CARD_HEIGHT,
                        useNativeDriver: true,
                    }).start(() => setIsBottomCardVisible(false));
                } else if (gestureState.vy < -0.5 || currentTranslateY < middlePoint) {
                    Animated.spring(animatedValue, {
                        toValue: screenHeight - EXPANDED_CARD_HEIGHT,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const fetchAndSetData = async () => {
        try {
            const storedPeriods = await AsyncStorage.getItem("periodRanges");
            const fetchedPeriods = storedPeriods ? JSON.parse(storedPeriods) : [];
            setPeriodRanges(fetchedPeriods);
            const predictionData = getPredictions(fetchedPeriods);
            setPredictions(predictionData);
            
            const storedSymptoms = await AsyncStorage.getItem("loggedSymptoms");
            const fetchedSymptoms = storedSymptoms ? JSON.parse(storedSymptoms) : {};
            setLoggedSymptoms(fetchedSymptoms);

        } catch (e) {
            console.error("Failed to load data from local storage", e);
            Alert.alert("Error", "Could not load data from your device.");
        }
    };

    const saveSymptomsToDevice = async (date: string, symptoms: string[], notes: string) => {
      try {
        const updatedSymptoms = {
          ...loggedSymptoms,
          [date]: { symptoms, notes }
        };
        await AsyncStorage.setItem("loggedSymptoms", JSON.stringify(updatedSymptoms));
        setLoggedSymptoms(updatedSymptoms);
      } catch (e) {
        console.error("Failed to save symptoms:", e);
        Alert.alert("Error", "Could not save symptoms. Please try again.");
      }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAndSetData();
        }, [])
    );

    useEffect(() => {
        const newMarkedDates = getMarkedDates();
        setMarkedDates(newMarkedDates);
    }, [periodRanges, selectedDate, predictions, isEditingPeriod, newPeriodRange]);

    const getMarkedDates = () => {
        const marked: { [key: string]: any } = {};
        const todayDate = new Date(todayString);
    
        const PERIOD_COLOR = '#ff5083';

        // Mark Logged Periods
        periodRanges.forEach((range) => {
            const startDate = new Date(range.start);
            const endDate = new Date(range.end);
            
            let current = new Date(startDate);
            while (current <= endDate) {
                const dateStr = current.toISOString().split("T")[0];
                const isFuturePeriod = new Date(dateStr) > todayDate;
                
                marked[dateStr] = {
                    ...marked[dateStr],
                    customStyles: {
                        container: {
                            backgroundColor: isFuturePeriod ? 'transparent' : PERIOD_COLOR,
                            borderWidth: isFuturePeriod ? 1.5 : 0,
                            borderColor: isFuturePeriod ? PERIOD_COLOR : 'transparent',
                            borderStyle: isFuturePeriod ? 'dotted' : 'solid',
                            borderRadius: 20,
                            width: 32,
                            height: 32,
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        text: {
                            color: isFuturePeriod ? PERIOD_COLOR : 'white',
                            fontWeight: 'bold',
                        },
                    },
                };
                current.setDate(current.getDate() + 1);
            }
        });
    
        // Mark Predicted Periods (dotted)
        if (predictions?.predictedPeriods) {
            predictions.predictedPeriods.forEach(range => {
                const startDate = new Date(range.start);
                const endDate = new Date(range.end);
                
                let current = new Date(startDate);
                while (current <= endDate) {
                    const dateStr = current.toISOString().split("T")[0];
                    marked[dateStr] = {
                        ...marked[dateStr],
                        customStyles: {
                            container: {
                                ...marked[dateStr]?.customStyles?.container,
                                borderWidth: 1.5,
                                borderColor: PERIOD_COLOR,
                                borderStyle: 'dotted',
                                backgroundColor: 'transparent',
                            },
                            text: {
                                ...marked[dateStr]?.customStyles?.text,
                                color: PERIOD_COLOR,
                                fontWeight: 'bold',
                            },
                        },
                    };
                    current.setDate(current.getDate() + 1);
                }
            });
        }

        // Mark Ovulation Window (Dotted)
        if (predictions?.predictedOvulation) {
            const OVU_COLOR = '#60b9ff';
            const start = new Date(predictions.predictedOvulation[0]);
            const end = new Date(predictions.predictedOvulation[1]);
            
            let current = new Date(start);
            while (current <= end) {
                const dateStr = current.toISOString().split("T")[0];
                marked[dateStr] = {
                    ...marked[dateStr],
                    customStyles: {
                        container: {
                            ...marked[dateStr]?.customStyles?.container,
                            borderWidth: 1.5,
                            borderColor: OVU_COLOR,
                            borderStyle: 'dotted',
                            backgroundColor: marked[dateStr]?.customStyles?.container?.backgroundColor || 'transparent',
                        },
                        text: {
                            ...marked[dateStr]?.customStyles?.text,
                            color: marked[dateStr]?.customStyles?.text?.color || OVU_COLOR,
                            fontWeight: 'bold',
                        },
                    },
                };
                current.setDate(current.getDate() + 1);
            }
        }
    
        // Mark selected date with a bubble
        if (selectedDate) {
            const isSelectedAConfirmedPeriodDay = periodRanges.some(r => selectedDate >= r.start && selectedDate <= r.end && new Date(selectedDate) <= todayDate);
            const isSelectedAPredictedPeriodDay = predictions?.predictedPeriods?.some(r => selectedDate >= r.start && selectedDate <= r.end);
            const isSelectedAOvulationDay = predictions?.predictedOvulation && selectedDate >= predictions.predictedOvulation[0] && selectedDate <= predictions.predictedOvulation[1];

            marked[selectedDate] = {
                ...marked[selectedDate],
                selected: true,
                customStyles: {
                    container: {
                        ...marked[selectedDate]?.customStyles?.container,
                        borderWidth: 2,
                        borderColor: isSelectedAConfirmedPeriodDay ? PERIOD_COLOR : (isSelectedAPredictedPeriodDay || isSelectedAOvulationDay ? (isSelectedAOvulationDay ? '#60b9ff' : PERIOD_COLOR) : PERIOD_COLOR),
                        borderRadius: 20,
                        width: 32,
                        height: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelectedAConfirmedPeriodDay ? PERIOD_COLOR : 'transparent',
                        borderStyle: isSelectedAPredictedPeriodDay || isSelectedAOvulationDay ? 'dotted' : 'solid',
                    },
                    text: {
                        ...marked[selectedDate]?.customStyles?.text,
                        color: isSelectedAConfirmedPeriodDay ? 'white' : (isSelectedAPredictedPeriodDay || isSelectedAOvulationDay ? (isSelectedAOvulationDay ? '#60b9ff' : PERIOD_COLOR) : PERIOD_COLOR),
                        fontWeight: 'bold',
                    },
                },
            };
        }

        // Mark dates for editing mode
        if (isEditingPeriod && newPeriodRange) {
            const sortedDates = [newPeriodRange.start, newPeriodRange.end].sort();
            let current = new Date(sortedDates[0]);
            const end = new Date(sortedDates[1]);

            while (current <= end) {
                const dateStr = current.toISOString().split('T')[0];
                marked[dateStr] = {
                    ...marked[dateStr],
                    customStyles: {
                        container: {
                            backgroundColor: PERIOD_COLOR,
                            borderRadius: 20,
                            width: 32,
                            height: 32,
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        text: {
                            color: 'white',
                            fontWeight: 'bold',
                        },
                    },
                };
                current.setDate(current.getDate() + 1);
            }
        }
    
        return marked;
    };
    
    const showBottomCard = (initialPosition = screenHeight - CARD_HEIGHT) => {
        setIsBottomCardVisible(true);
        Animated.timing(animatedValue, {
            toValue: initialPosition,
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
            setIsBottomCardVisible(false);
        });
    };

    const handleDayPress = useCallback(
        async (day: DateData) => {
            if (isEditingPeriod) {
                const selectedDay = new Date(day.dateString);
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();
                const selectedMonth = selectedDay.getMonth();
                const selectedYear = selectedDay.getFullYear();

                if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
                    Alert.alert("Notice", "You can only edit dates in the current or future months.");
                    return;
                }

                if (!newPeriodRange?.start) {
                    setNewPeriodRange({ start: day.dateString, end: day.dateString });
                } else {
                    const sortedDates = [newPeriodRange.start, day.dateString].sort();
                    setNewPeriodRange({ start: sortedDates[0], end: sortedDates[1] });
                }
            } else {
                const newDate = day.dateString;
                setSelectedDate(newDate);
                showBottomCard();
            }
        },
        [isEditingPeriod, newPeriodRange]
    );

    const handleEditPeriod = async () => {
        const isPeriodDay = periodRanges.some(r => selectedDate >= r.start && selectedDate <= r.end);
        try {
            let updatedPeriods = [...periodRanges];
            if (isPeriodDay) {
                updatedPeriods = updatedPeriods.filter(r => !(selectedDate >= r.start && selectedDate <= r.end));
                Alert.alert("Period Un-logged", "The period log for this date has been removed.");
            } else {
                const endDate = new Date(selectedDate);
                endDate.setDate(endDate.getDate() + 4);
                updatedPeriods.push({ start: selectedDate, end: endDate.toISOString().split("T")[0] });
                Alert.alert("Period Logged", "A 5-day period has been logged for you.");
            }
            await AsyncStorage.setItem("periodRanges", JSON.stringify(updatedPeriods));
            fetchAndSetData();
        } catch (e: any) {
            console.error("Failed to update period:", e.message);
            Alert.alert("Error", "Could not update period data. Please try again.");
        }
    };

    const handleEditPeriodDates = () => {
        setIsEditingPeriod(true);
        setIsBottomCardVisible(false);
        setNewPeriodRange(null);
        setEditingMonth(todayString);
    };

    const handleSavePeriodChanges = async () => {
        if (!newPeriodRange) {
            Alert.alert("Notice", "No period selected. Please select a start and end date.");
            return;
        }

        try {
            const storedPeriods = await AsyncStorage.getItem("periodRanges");
            const existingPeriods = storedPeriods ? JSON.parse(storedPeriods) : [];
            const updatedPeriods = existingPeriods.filter(
                (r: PeriodRange) =>
                    !(r.start <= newPeriodRange.end && newPeriodRange.start <= r.end)
            );
            updatedPeriods.push(newPeriodRange);
            await AsyncStorage.setItem("periodRanges", JSON.stringify(updatedPeriods));
            Alert.alert("Success", "Period log updated successfully!");
            fetchAndSetData();
        } catch (e: any) {
            console.error("Failed to save period changes:", e.message);
            Alert.alert("Error", "Could not save changes. Please try again.");
        } finally {
            setIsEditingPeriod(false);
            setNewPeriodRange(null);
            setEditingMonth(null);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingPeriod(false);
        setNewPeriodRange(null);
        setEditingMonth(null);
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

    const getCycleDayText = () => {
        if (!selectedDate || periodRanges.length === 0) {
            return "Cycle Day";
        }
        const sortedPeriods = [...periodRanges].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        const lastPeriodStart = sortedPeriods[sortedPeriods.length - 1]?.start;
        
        if (!lastPeriodStart) {
            return "Cycle Day";
        }

        const selectedDateTime = new Date(selectedDate).getTime();
        const lastPeriodStartTime = new Date(lastPeriodStart).getTime();
        
        if (selectedDateTime < lastPeriodStartTime) {
            return "Cycle Day not started";
        }

        const cycleDay = Math.ceil((selectedDateTime - lastPeriodStartTime) / (1000 * 60 * 60 * 24)) + 1;
        return `Cycle day ${cycleDay}`;
    };

    const getInsightText = () => {
        if (!selectedDate) {
            return "Log your symptoms to get insights!";
        }

        const isPeriodDay = periodRanges.some(r => selectedDate >= r.start && selectedDate <= r.end);
        if (isPeriodDay) {
            const periodDayNumber = periodRanges.find(r => selectedDate >= r.start && selectedDate <= r.end);
            const dayNumber = Math.ceil((new Date(selectedDate).getTime() - new Date(periodDayNumber.start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return `Period day ${dayNumber}`;
        }

        const isOvulationDay = predictions?.predictedOvulation && selectedDate >= predictions.predictedOvulation[0] && selectedDate <= predictions.predictedOvulation[1];
        if (isOvulationDay) {
            return `Predicted Ovulation Day`;
        }

        const isPredictedPeriod = predictions?.predictedPeriods?.some(r => selectedDate >= r.start && selectedDate <= r.end);
        if (isPredictedPeriod) {
            const periodDayNumber = predictions.predictedPeriods.find(r => selectedDate >= r.start && selectedDate <= r.end);
            const dayNumber = Math.ceil((new Date(selectedDate).getTime() - new Date(periodDayNumber.start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return `Predicted Period Day ${dayNumber}`;
        }

        return "Log your symptoms to get insights!";
    };

    const handleOpenInsightModal = (key) => {
      let content = { title: '', content: '', lottie: null };
      if (key === 'pregnancy-chance') {
        content = {
          title: "Today's Chance of Pregnancy",
          content: "Your menstrual cycle is divided into several phases. The follicular phase is when an egg matures in your ovary, leading up to ovulation. Ovulation is when the egg is released, and your chance of pregnancy is highest. This is followed by the luteal phase. Knowing these phases helps you understand your fertility window.",
          lottie: 'pregnancy_lottie_animation_placeholder'
        };
      } else if (key === 'daily-status') {
        content = {
          title: "Daily Status & Cycle Insights",
          content: "Your cycle is a personal journey. By consistently logging your period dates, moods, and symptoms, our app can provide more accurate predictions. Understanding the rhythm of your body is key to managing your health. Pay attention to how your energy, cravings, and emotions shift throughout each phase. This awareness can empower you to take better care of yourself.",
          lottie: null
        };
      } else if (key === 'symptoms-to-expect') {
        content = {
          title: "Symptoms to Expect",
          content: "Common symptoms vary by cycle phase. In the days leading up to your period, you might experience bloating, mood swings, or fatigue. During ovulation, you may notice changes in your cervical mucus and a slight increase in body temperature. Logging these symptoms can help you identify patterns and better anticipate your body's needs.",
          lottie: null
        };
      } else if (key === 'feeling-full') {
        content = {
          title: "Feeling Full? Pregnancy or PMS?",
          content: "Bloating and a feeling of fullness can be confusing symptoms, as they can indicate either PMS or early pregnancy. PMS-related bloating usually starts a few days before your period and subsides once your period begins. Early pregnancy bloating, however, can last longer and is often accompanied by other symptoms like nausea, fatigue, and breast tenderness. Tracking your symptoms is the best way to tell the difference.",
          lottie: null
        };
      }
      setInsightModalContent(content);
      setIsInsightModalVisible(true);
    };

    // Get the symptoms for the currently selected date
    const selectedDateSymptoms = selectedDate ? loggedSymptoms[selectedDate] : null;

    const InsightModal = ({ isVisible, onClose, content }) => {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isVisible}
          onRequestClose={onClose}
        >
          <View style={styles.modalBackground}>
            <View style={styles.insightModalContainer}>
              <View style={styles.insightModalHeader}>
                <Text style={styles.insightModalTitle}>{content.title}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.insightModalContent}>
                {content.lottie && (
                  <View style={styles.lottieContainer}>
                    <LottieView
                      source={require("@/anim/wired-flat-1270-fetus-hover-pinch.json")}
                      autoPlay
                      loop
                      style={{ width: 200, height: 200 }}
                    />
                  </View>
                )}
                <Text style={styles.insightModalText}>{content.content}</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      );
    };

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
                <TouchableOpacity onPress={() => setIsInfoModalVisible(true)}>
                    <Ionicons name="information-circle-outline" size={24} color="#000" />
                </TouchableOpacity>
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
                        textSectionTitleColor: "#ff5083",
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

            {!isBottomCardVisible && !isEditingPeriod && (
                <TouchableOpacity style={styles.editButton} onPress={handleEditPeriodDates}>
                    <Text style={styles.editButtonText}>Edit period dates</Text>
                </TouchableOpacity>
            )}

            {isEditingPeriod && (
                <View style={styles.editingButtonsContainer}>
                    <TouchableOpacity style={[styles.editingButton, styles.cancelButton]} onPress={handleCancelEdit}>
                        <Text style={styles.editingButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.editingButton, styles.saveButton]} onPress={handleSavePeriodChanges}>
                        <Text style={styles.editingButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            )}

            {selectedDate && isBottomCardVisible && (
                <Animated.View
                    style={[
                        styles.bottomCard,
                        {
                            transform: [{ translateY: animatedValue }],
                            height: EXPANDED_CARD_HEIGHT,
                        },
                    ]}
                >
                    <View {...panResponder.panHandlers}>
                        <View style={styles.dragHandleContainer}>
                            <View style={styles.dragHandle} />
                        </View>
                        <View style={styles.bottomCardHeader}>
                            <Text style={styles.bottomCardTitle}>
                                {new Date(selectedDate).toLocaleString("en-us", { month: "short", day: "numeric" })}
                                {` • `}
                                <Text style={styles.cycleDayText}>{getCycleDayText()}</Text>
                            </Text>
                            <TouchableOpacity onPress={hideBottomCard}>
                                <Ionicons name="close" size={24} color="#a0a0a0" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.bottomCardScrollView}>
                        <TouchableOpacity style={styles.symptomsContainer} onPress={() => setIsSymptomsModalVisible(true)}>
                            <Text style={styles.symptomsTitle}>Symptoms and activities</Text>
                            <View style={styles.symptomsInputContainer}>
                                <Text style={styles.symptomsPlaceholder}>Add weight, mood, & symptoms</Text>
                                <View style={styles.addButton}>
                                    <Ionicons name="add" size={30} color="#fff" />
                                </View>
                            </View>
                        </TouchableOpacity>

                        {selectedDateSymptoms?.symptoms.length > 0 && (
                            <View style={styles.addedSymptomsSection}>
                                <Text style={styles.addedSymptomsTitle}>Logged Symptoms</Text>
                                <View style={styles.addedSymptomsContainer}>
                                    {selectedDateSymptoms.symptoms.map((symptom, index) => (
                                        <View key={index} style={styles.addedSymptomCard}>
                                            <Text style={styles.addedSymptomText}>{symptom}</Text>
                                        </View>
                                    ))}
                                </View>
                                {selectedDateSymptoms.notes && (
                                    <>
                                        <Text style={styles.addedSymptomsNotesTitle}>Notes</Text>
                                        <Text style={styles.addedSymptomsNotesText}>{selectedDateSymptoms.notes}</Text>
                                    </>
                                )}
                            </View>
                        )}

                        <View style={styles.insightsContainer}>
                            <Text style={styles.insightsTitle}>My daily insights</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <TouchableOpacity style={styles.insightCard} onPress={() => handleOpenInsightModal('daily-status')}>
                                    <Text style={styles.insightCardTitle}>Daily Status</Text>
                                    <Text style={styles.insightCardText}>{getInsightText()}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.insightCard} onPress={() => handleOpenInsightModal('pregnancy-chance')}>
                                    <Text style={styles.insightCardTitle}>Today's chance of pregnancy</Text>
                                    <Text style={styles.insightCardText}>See more...</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.insightCard} onPress={() => handleOpenInsightModal('symptoms-to-expect')}>
                                    <Text style={styles.insightCardTitle}>Symptoms to expect</Text>
                                    <Text style={styles.insightCardText}>Explore now</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.insightCard} onPress={() => handleOpenInsightModal('feeling-full')}>
                                    <Text style={styles.insightCardTitle}>Feeling full?</Text>
                                    <Text style={styles.insightCardText}>Pregnancy or PMS</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>

                        <TouchableOpacity onPress={handleEditPeriod} style={styles.periodButton}>
                            <Text style={styles.periodButtonText}>
                                {periodRanges.some(r => selectedDate >= r.start && selectedDate <= r.end) ? "Un-log Period" : "Log Period"}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            )}

            {/* General Info Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isInfoModalVisible}
                onRequestClose={() => {
                    setIsInfoModalVisible(!isInfoModalVisible);
                }}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Calendar Guide</Text>
                            <TouchableOpacity onPress={() => setIsInfoModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.modalSectionTitle}>How to Log a Period</Text>
                            <Text style={styles.modalText}>
                                To log a period, tap on a date to open the daily card. Use "Log Period" to add/remove for that day. Or tap "Edit Period Dates" to select a range of dates at once.
                            </Text>
                            <Text style={styles.modalSectionTitle}>What the Symbols Mean</Text>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { backgroundColor: '#ff5083' }]} />
                                <Text style={styles.legendText}>Logged Period</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { borderWidth: 1.5, borderColor: '#ff5083', borderStyle: 'dotted', backgroundColor: 'transparent' }]} />
                                <Text style={styles.legendText}>Predicted Period</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { borderWidth: 1.5, borderColor: '#60b9ff', borderStyle: 'dotted', backgroundColor: 'transparent' }]} />
                                <Text style={styles.legendText}>Predicted Ovulation Window</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { borderWidth: 2, borderColor: '#ff5083', backgroundColor: 'transparent' }]} />
                                <Text style={styles.legendText}>Selected Day (if no period/ovulation)</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { borderWidth: 2, borderColor: '#60b9ff', backgroundColor: 'transparent' }]} />
                                <Text style={styles.legendText}>Selected Day (if in Ovulation Window)</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { backgroundColor: '#ff5083', borderWidth: 2, borderColor: '#ff5083' }]} />
                                <Text style={styles.legendText}>Selected Day (if on Logged Period)</Text>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Symptoms & Activities Modal */}
            <SymptomModal
                isVisible={isSymptomsModalVisible}
                onClose={() => setIsSymptomsModalVisible(false)}
                onSave={saveSymptomsToDevice}
                selectedDate={selectedDate}
                initialSymptoms={selectedDateSymptoms?.symptoms || []}
                initialNotes={selectedDateSymptoms?.notes || ""}
            />

            {/* Insights Modal */}
            <InsightModal 
              isVisible={isInsightModalVisible} 
              onClose={() => setIsInsightModalVisible(false)} 
              content={insightModalContent} 
            />
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
    cycleDayText: {
        color: '#888',
        fontSize: 14,
        fontWeight: 'normal',
    },
    bottomCardScrollView: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    symptomsContainer: {
        marginBottom: 20,
    },
    symptomsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    symptomsInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    symptomsPlaceholder: {
        flex: 1,
        color: '#888',
    },
    addButton: {
        backgroundColor: '#60b9ff',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    insightsContainer: {
        marginBottom: 20,
    },
    insightsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    insightCard: {
        backgroundColor: '#f8c7d6',
        borderRadius: 15,
        padding: 15,
        marginRight: 10,
        width: 150,
    },
    insightCardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    insightCardText: {
        fontSize: 12,
    },
    periodButton: {
        backgroundColor: '#ff5083',
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
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    modalContent: {
        maxHeight: screenHeight * 0.6,
    },
    modalSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
    },
    modalText: {
        fontSize: 16,
        color: '#555',
        lineHeight: 22,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    legendBox: {
        width: 25,
        height: 25,
        borderRadius: 15,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    legendText: {
        fontSize: 16,
        color: '#333',
    },
    editButton: {
        position: 'absolute',
        bottom: 30,
        left: '50%',
        transform: [{ translateX: -90 }],
        backgroundColor: '#ff5083',
        borderRadius: 25,
        paddingVertical: 15,
        paddingHorizontal: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    editingButtonsContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editingButton: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#ff5083',
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    editingButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    addedSymptomsSection: {
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: 10,
    },
    addedSymptomsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    addedSymptomsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    addedSymptomCard: {
        backgroundColor: '#e0e0e0',
        borderRadius: 15,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    addedSymptomText: {
        fontSize: 14,
        color: '#333',
    },
    addedSymptomsNotesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    addedSymptomsNotesText: {
        fontSize: 14,
        marginTop: 5,
        color: '#555',
    },
    insightModalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    insightModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    insightModalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    insightModalContent: {
        maxHeight: screenHeight * 0.6,
    },
    lottieContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    insightModalText: {
        fontSize: 16,
        lineHeight: 22,
        color: '#555',
    },
});