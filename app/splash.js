// Splash.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        router.replace(token ? '/(main)/tabs' : '/(auth)');
      } catch (error) {
        console.warn('Error checking login:', error);
        router.replace('/(auth)');
      }
    };

    const timer = setTimeout(checkLogin, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView 
        source={require("../anim/Girl yoga.json")}
        autoPlay
        loop={false} 
        style={styles.lottie}
      />
      {/* App name */}
      <Text style={styles.appName}>Luna</Text>
      <Text style={styles.appSubtitle}>
        Your safe space to track, connect, and learn
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf2f8', 
    paddingHorizontal: 24,
  },
  lottie: {
    width: 220,
    height: 220,
  },
  appName: {
    marginTop: 18,
    fontSize: 34,
    fontWeight: 'bold',
    color: '#ef5da8', // soft violet accent
    letterSpacing: 1,
  },
  appSubtitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280', // subtle gray text
    textAlign: 'center',
    lineHeight: 22,
  },
});
