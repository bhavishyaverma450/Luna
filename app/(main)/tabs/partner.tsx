import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  Dimensions, TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function PartnerLogin() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#F3E9F3', '#E0BBE4']} style={styles.gradient}>
      <View style={styles.container}>
    
        
        <View style={styles.comingSoonContainer}>
          <LottieView 
            source={require('@/anim/Girl on the Bicycle.json')} 
            autoPlay 
            loop 
            style={styles.lottie} 
            resizeMode="contain" 
          />
          <Text style={styles.title}>Connect with Your Partner</Text>
          <Text style={styles.subtitle}>This feature is coming soon!</Text>
          <Text style={styles.description}>
            We're working hard to bring you new ways to connect and share your journey with your partner.
            Check back for updates!
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center' },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  comingSoonContainer: { 
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
  },
  lottie: { 
    height: height * 0.35, 
    width: '100%' 
  },
  title: {
    fontSize: width * 0.07, 
    fontWeight: 'bold', 
    color: '#6A0DAD', 
    marginTop: height * 0.005, 
    textAlign: 'center' 
  },
  subtitle: {
    fontSize: width * 0.05, 
    color: '#8A2BE2', 
    marginBottom: height * 0.01, 
    textAlign: 'center' 
  },
  description: {
    fontSize: width * 0.04,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
});