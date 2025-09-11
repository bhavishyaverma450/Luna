import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || password !== confirmPassword) {
      Alert.alert('Error', 'Please fill all fields correctly');
      return;
    }

    try {
      const checkResponse = await fetch('http://192.168.1.6:5000/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        Alert.alert('Error', 'Email is already registered. Please login.');
        return;
      }

      const response = await fetch('http://192.168.1.6:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Registration Failed', data.error || 'Something went wrong');
        return;
      }
      
      // Save the user's name and email to local storage
      await AsyncStorage.setItem('userName', name);
      await AsyncStorage.setItem('userEmail', email);

      Alert.alert('Success', 'Registration complete! Please login.');
      router.replace('/(auth)');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to register. Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#E0F7FA', '#E3F2FD']} style={styles.gradient}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.animationWrapper}>
              <LottieView
                source={require('@/anim/Woman.json')}
                autoPlay
                loop
                style={styles.lottie}
                resizeMode="contain"
              />
            </View>

            <View style={styles.formWrapper}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Register to get started</Text>

              <TextInput placeholder="Full Name" style={styles.input} value={name} onChangeText={setName} />
              <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
              <TextInput placeholder="Confirm Password" style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

              <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)')}>
                <Text style={styles.loginText}>Already have an account? Login here...</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  animationWrapper: { alignItems: 'center', marginTop: height * 0.05 },
  lottie: { height: height * 0.25, width: '100%' },
  formWrapper: { flex: 1, paddingHorizontal: 30, marginTop: height * 0.02 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#37474F', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#607D8B', marginBottom: 40, textAlign: 'center' },
  input: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, color: '#37474F' },
  registerButton: { backgroundColor: '#81D4FA', paddingVertical: 15, borderRadius: 10, marginBottom: 20 },
  registerButtonText: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  loginText: { color: '#0288D1', textAlign: 'center', fontSize: 15, marginTop: 10 },
});