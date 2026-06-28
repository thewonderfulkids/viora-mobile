import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { OfflineBanner } from "../components/common";
import { AuthProvider } from "../context/AuthContext";
import { NetworkProvider } from "../providers/NetworkProvider";
import { ToastProvider } from "../providers/ToastProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NetworkProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }} />
        </ToastProvider>
      </NetworkProvider>
    </AuthProvider>
  );
}