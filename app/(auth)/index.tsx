import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback,
  Alert, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setProduct } from '../../redux/slicer/productSlice';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      // Use the correct key 'userToken'
      const token = await AsyncStorage.getItem('userToken'); 
      if (token) router.replace('/(main)');
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.6:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.error || 'Something went wrong');
        return;
      }
      
      // Check if token is present before saving
      if (data.token) {
        // FIX: Use the correct key 'userToken'
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userId', data.userId);
        
        dispatch(setProduct(email));
        router.replace('/(main)');
      } else {
        Alert.alert('Login Failed', 'No token received from server');
      }

    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#E0F7FA', '#E3F2FD']} style={styles.gradient}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          <View style={styles.animationWrapper}>
            <LottieView source={require('@/anim/Meditating girl.json')} autoPlay loop style={styles.lottie} resizeMode="contain" />
          </View>

          <View style={styles.formWrapper}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue</Text>

            <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerText}>New user? Register here...</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'flex-start' },
  animationWrapper: {
    alignItems: 'center',
  },
  lottie: {
    height: height * 0.3,
    width: width * 0.8,
    marginTop:-(height*0.05),
  },
  formWrapper: {
    flex: 1,
    paddingHorizontal: width * 0.08,
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#37474F',
    marginBottom: height * 0.005,
    textAlign: 'center',
    marginTop:-(height*0.02),
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#607D8B',
    marginBottom: height * 0.07,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: 10,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    fontSize: width * 0.04,
    color: '#37474F',
  },
  loginButton: {
    backgroundColor: '#81D4FA',
    paddingVertical: height * 0.02,
    borderRadius: 10,
    marginBottom: height * 0.02,
    shadowColor: '#81D4FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  bottomLinks: {
    marginTop: height * 0.05,
  },
  registerText: {
    color: '#0288D1',
    textAlign: 'center',
    marginBottom: height * 0.015,
    fontSize: width * 0.04,
  },
  forgotText: {
    color: '#607D8B',
    textAlign: 'center',
    fontSize: width * 0.035,
  },
});