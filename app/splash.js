// Splash.js
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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

    const timer = setTimeout(checkLogin, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView 
        source={require("../anim/Girl yoga.json")}
        autoPlay
        loop={false} 
        style={styles.lottie}
        onAnimationFinish={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
  },
  lottie: {
    width: 200, // Adjust size as needed
    height: 200,
  },
});