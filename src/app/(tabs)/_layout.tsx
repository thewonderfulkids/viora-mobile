import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAppTranslation } from "../../i18n/useAppTranslation";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme";

export default function TabsLayout() {
  const { t } = useAppTranslation();
  const { user, userDoc, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  if (userDoc?.onboardingCompleted !== true) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("common.home"), tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="wellness" options={{ title: t("common.wellness"), tabBarIcon: ({ color, size }) => <Ionicons name="leaf-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="ai" options={{ title: t("common.aiCoach"), tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="progress" options={{ title: t("common.progress"), tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: t("common.profile"), tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
