// ./components/AppLockWrapper.tsx
import { useSettings } from '@/contexts/SettingsContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const AppLockWrapper = ({ children }: { children: React.ReactNode }) => {
  const { settings, isSettingsLoading } = useSettings();
  const [isLocked, setIsLocked] = useState(true);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!isSettingsLoading) {
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          // App has come to the foreground
          if (settings.appLockEnabled) {
            setIsLocked(true);
            authenticate();
          }
        }
        appState.current = nextAppState;
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);
      if (settings.appLockEnabled) {
        authenticate();
      } else {
        setIsLocked(false);
      }
      return () => {
        subscription.remove();
      };
    }
  }, [settings.appLockEnabled, isSettingsLoading]);

  const authenticate = async () => {
    const authOptions: LocalAuthentication.AuthenticationOptions = {
      promptMessage: 'Unlock App',
      cancelLabel: 'Use Passcode',
      disableDeviceFallback: !settings.biometricEnabled,
    };
    try {
      const result = await LocalAuthentication.authenticateAsync(authOptions);
      if (result.success) {
        setIsLocked(false);
      } else {
        // Handle failed authentication, maybe try again or exit app
        console.log('Authentication failed:', result.error);
        setIsLocked(true); // Keep locked on failure
      }
    } catch (e) {
      console.error('Authentication error:', e);
      setIsLocked(true); // Keep locked on error
    }
  };

  if (isSettingsLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
      {isLocked && settings.appLockEnabled && (
        <Modal
          animationType="fade"
          transparent={false}
          visible={isLocked}
          onRequestClose={() => {}}
        >
          <LinearGradient colors={["#fef9fb", "#fdf2f8"]} style={styles.lockScreenContainer}>
            <View style={styles.lockScreenContent}>
              <Ionicons name="lock-closed-outline" size={80} color="#ff5083" />
              <Text style={styles.lockScreenTitle}>App Locked</Text>
              <Text style={styles.lockScreenSubtitle}>
                Please authenticate to unlock the app.
              </Text>
              <TouchableOpacity style={styles.unlockButton} onPress={authenticate}>
                <Text style={styles.unlockButtonText}>Unlock</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  lockScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockScreenContent: {
    alignItems: 'center',
    padding: 20,
  },
  lockScreenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  lockScreenSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  unlockButton: {
    marginTop: 40,
    backgroundColor: '#ff5083',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  unlockButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});