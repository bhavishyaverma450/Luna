import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Gesture Handler and Reanimated imports
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

interface Reminder {
  id: string;
  title: string;
  enabled: boolean;
}

// Separate component for each reminder item
const ReminderItem = ({ reminder, onToggle, onDelete }) => {
  // Render the delete button that appears on swipe
  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={styles.deleteSwipeButton}
        onPress={() => onDelete(reminder.id)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.card}>
        <Text style={styles.reminderText}>{reminder.title}</Text>
        <View style={styles.cardActions}>
          <Switch
            value={reminder.enabled}
            onValueChange={() => onToggle(reminder.id)}
            trackColor={{ false: '#ccc', true: '#ff5083' }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </Swipeable>
  );
};

export default function Reminders() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', title: 'Track Cycle', enabled: true },
    { id: '2', title: 'Drink Water', enabled: false },
    { id: '3', title: 'Workout Reminder', enabled: true },
  ]);
  const [newReminder, setNewReminder] = useState('');

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const addReminder = () => {
    if (newReminder.trim() === '') {
      Alert.alert('Error', 'Reminder cannot be empty!');
      return;
    }
    setReminders(prev => [
      ...prev,
      { id: Date.now().toString(), title: newReminder, enabled: true },
    ]);
    setNewReminder('');
    Alert.alert('Success', 'Reminder added!');
  };

  const deleteReminder = (id: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setReminders(prev => prev.filter(r => r.id !== id));
            Alert.alert('Success', 'Reminder deleted.');
          },
        },
      ]
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient colors={['#fef9fb', '#fdf2f8']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.title}>Reminders</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Add New Reminder */}
            <View style={styles.addReminderContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add new reminder"
                value={newReminder}
                onChangeText={setNewReminder}
              />
              <TouchableOpacity style={styles.addButton} onPress={addReminder}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Existing Reminders */}
            <Text style={styles.sectionTitle}>Your Reminders</Text>
            {reminders.map(reminder => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                onToggle={toggleReminder}
                onDelete={deleteReminder}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    padding: 5,
  },
  addReminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
  },
  addButton: {
    backgroundColor: '#ff5083',
    borderRadius: 25,
    padding: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom:15,
  },
  reminderText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteSwipeButton: {
    backgroundColor: '#ff5083',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
  },
});