// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import store from "../redux/store";
import { SettingsProvider } from "../contexts/settingsContext";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SettingsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SettingsProvider>
    </Provider>
  );
}