// ./contexts/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

interface Settings {
  appLockEnabled: boolean;
  biometricEnabled: boolean;
  appAppearance: 'light' | 'dark' | 'automatic';
  hideAppIcon: boolean;
}

const defaultSettings: Settings = {
  appLockEnabled: false,
  biometricEnabled: false,
  appAppearance: 'automatic',
  hideAppIcon: false,
};

interface SettingsContextType {
  settings: Settings;
  updateSetting: (key: keyof Settings, value: any) => Promise<void>;
  isSettingsLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('appSettings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Failed to load settings from storage:', error);
      } finally {
        setIsSettingsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const updateSetting = useCallback(async (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      if (key === 'appAppearance') {
        if (value === 'automatic') {
          Appearance.setColorScheme(null);
        } else {
          Appearance.setColorScheme(value);
        }
      }
    } catch (error) {
      console.error('Failed to save settings to storage:', error);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, isSettingsLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};