import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTranslation } from "../../i18n/useAppTranslation";
import { colors, shadows } from "../../theme";

type NavItem = {
  key: "home" | "wellness" | "ai" | "progress" | "profile";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: string;
  matches: (pathname: string) => boolean;
};

const ITEMS: NavItem[] = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home", route: "/(tabs)", matches: (path) => path === "/" || path === "/dashboard" || path === "/explore" },
  { key: "wellness", label: "Wellness", icon: "leaf-outline", activeIcon: "leaf", route: "/(tabs)/wellness", matches: (path) => path === "/wellness" || ["/hydration",
        "/steps", "/nutrition", "/sleep", "/yoga", "/meditation", "/music", "/home-workout", "/mental-wellness", "/goals-habits", "/programs", "/family-wellness"].some((route) => path.startsWith(route)) },
  { key: "ai", label: "AI Coach", icon: "sparkles-outline", activeIcon: "sparkles", route: "/(tabs)/ai", matches: (path) => path === "/ai" || ["/ai-coach", "/voice-ai", "/ai-memory", "/wellness-intelligence"].some((route) => path.startsWith(route)) },
  { key: "progress", label: "Progress", icon: "analytics-outline", activeIcon: "analytics", route: "/(tabs)/progress", matches: (path) => path === "/progress" || path.startsWith("/reports") },
  { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person", route: "/(tabs)/profile", matches: (path) => path === "/profile" || ["/settings-center", "/account-security", "/language-settings", "/notification-preferences",
        "/reminder-editor",
        "/notification-center", "/smart-notifications", "/privacy-ai-safety", "/premium"].some((route) => path.startsWith(route)) },
];

export function UniversalBottomNav() {
  const { t } = useAppTranslation();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeShell, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <LinearGradient colors={["rgba(255,255,255,0.98)", "rgba(237,248,241,0.98)"]} style={styles.shell} accessibilityRole="tablist">
        {ITEMS.map((item) => {
          const label = t(`common.${item.key === "ai" ? "aiCoach" : item.key}`);
          const active = item.matches(pathname);
          return (
            <Pressable
              key={item.key}
              onPress={() => router.replace(item.route as never)}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                {active ? <View pointerEvents="none" style={styles.glow} /> : null}
                <Ionicons name={active ? item.activeIcon : item.icon} size={21} color={active ? colors.white : "#718A7F"} />
              </View>
              <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safeShell: {
    backgroundColor: "rgba(255,255,255,0.98)",
  },
  shell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(191,217,203,0.82)",
    ...shadows.soft,
  },
  item: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  itemPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  iconWrap: {
    width: 38,
    height: 32,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    ...shadows.glow,
  },
  glow: {
    position: "absolute",
    width: 44,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(143,228,95,0.18)",
  },
  label: {
    color: "#718A7F",
    fontSize: 10.5,
    fontWeight: "800",
  },
  labelActive: {
    color: colors.primaryDark,
  },
});
