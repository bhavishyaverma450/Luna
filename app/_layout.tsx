// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { Provider } from "react-redux";
import { SettingsProvider } from "../contexts/settingsContext";
import store from "../redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SettingsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SettingsProvider>
    </Provider>
  );
}