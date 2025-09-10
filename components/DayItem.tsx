import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  date: Date;
  selectedDay: Date;
  today: Date;
  isInPeriod: (date: Date) => boolean;
  onPress: (date: Date) => void;
  isPredictedPeriod: boolean; // New prop for predicted period dates
  isPredictedOvulation: boolean; // New prop for predicted ovulation dates
}

const DayItem = ({ date, selectedDay, today, isInPeriod, onPress, isPredictedPeriod, isPredictedOvulation }: Props) => {
  const dayNumber = date.getDate();
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const isSelected = date.toDateString() === selectedDay.toDateString();
  const isToday = date.toDateString() === today.toDateString();
  const inPeriod = isInPeriod(date);

  const getContainerStyle = () => {
    if (inPeriod) {
        return { backgroundColor: "#f43f5e" };
    }
    if (isPredictedPeriod) {
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#f43f5e', borderStyle: 'dotted' };
    }
    if (isPredictedOvulation) {
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#a4c639', borderStyle: 'dotted' };
    }
    return { backgroundColor: "#fff" };
  };

  const getTextStyle = () => {
    if (inPeriod || isSelected) {
        return { color: "#fff", fontWeight: "700" };
    }
    if (isPredictedPeriod || isPredictedOvulation) {
        return { color: "#f43f5e", fontWeight: "700" };
    }
    return { color: "#333" };
  };

  return (
    <View style={styles.dayWrapper}>
      <Text style={styles.weekdayText}>{weekday}</Text>
      <TouchableOpacity
        style={[
          styles.dayCircle,
          getContainerStyle(),
          isSelected && styles.todayBubble,
        ]}
        onPress={() => onPress(date)}
      >
        <Text style={[styles.dayText, getTextStyle()]}>
          {dayNumber}
        </Text>
      </TouchableOpacity>
      {isToday && <Text style={styles.todayText}>Today</Text>}
    </View>
  );
};

export default memo(DayItem);

const styles = StyleSheet.create({
  dayWrapper: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  weekdayText: {
    fontSize: 14,
    color: "#a0a0a0",
    fontWeight: "500",
    marginBottom: 5,
  },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  todayBubble: {
    backgroundColor: "#fde3f0",
  },
  todayBubbleText: {
    color: "#f43f5e",
  },
  todayText: {
    fontSize: 12,
    color: "#f43f5e",
    fontWeight: "600",
    marginTop: 4,
  },
});