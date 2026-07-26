import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { OfflineBanner, ProductionErrorBoundary } from "../components/common";
import { UniversalBottomNav } from "../components/navigation";
import { NotificationRuntime } from "../components/runtime";
import { NAV_HIDDEN_ROUTES, routeMatches } from "../constants/navigation";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { LanguageProvider } from "../i18n/LanguageProvider";
import { NetworkProvider } from "../providers/NetworkProvider";
import { ToastProvider } from "../providers/ToastProvider";

function AuthenticatedNavigationShell() {
  const pathname = usePathname();
  const { user, userDoc, loading } = useAuth();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const showNavigation = useMemo(() => {
    if (loading || !user || userDoc?.onboardingCompleted !== true || keyboardVisible) return false;
    return !NAV_HIDDEN_ROUTES.some((route) => routeMatches(pathname, route));
  }, [keyboardVisible, loading, pathname, user, userDoc?.onboardingCompleted]);

  return (
    <View style={styles.shell}>
      <View style={styles.stackWrap}><Stack screenOptions={{ headerShown: false }} /></View>
      {showNavigation ? <UniversalBottomNav /> : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProductionErrorBoundary>
        <LanguageProvider>
          <AuthProvider>
            <NetworkProvider>
              <ToastProvider>
                <StatusBar style="dark" />
                <OfflineBanner />
                <NotificationRuntime />
                <AuthenticatedNavigationShell />
              </ToastProvider>
            </NetworkProvider>
          </AuthProvider>
        </LanguageProvider>
      </ProductionErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ shell: { flex: 1, backgroundColor: "#FFFFFF" }, stackWrap: { flex: 1, minHeight: 0 } });
