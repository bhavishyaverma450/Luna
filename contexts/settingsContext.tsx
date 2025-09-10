// settingsContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "http://10.0.2.2:5000/api/settings"; // match backend

interface SettingsState {
  appLockEnabled: boolean;
  biometricEnabled: boolean;
  appAppearance: "light" | "dark" | "automatic";
  hideAppIcon: boolean;
  notifications: boolean;
  darkMode: boolean;
  autoUpdate: boolean;
  dataSharing: boolean;
  personalizedAds: boolean;
  analytics: boolean;
  appPrivacy: boolean;
}

interface SettingsContextType {
  settings: SettingsState;
  loading: boolean;
  updateSetting: (key: keyof SettingsState, value: any) => Promise<void>;
}

const defaultSettings: SettingsState = {
  appLockEnabled: false,
  biometricEnabled: false,
  appAppearance: "automatic",
  hideAppIcon: false,
  notifications: true,
  darkMode: false,
  autoUpdate: true,
  dataSharing: false,
  personalizedAds: false,
  analytics: true,
  appPrivacy: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettings({ ...defaultSettings, ...response.data });
    } catch (err) {
      console.error("❌ Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key: keyof SettingsState, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("No token");

      await axios.put(`${API_BASE}/update`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("❌ Failed to save settings:", err);
      setSettings(settings);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return context;
};
