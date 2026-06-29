import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type CommonBackButtonProps = {
  label?: string;
  fallbackPath?: "/dashboard" | "/(tabs)";
  accessibilityLabel?: string;
  compact?: boolean;
};

function navigateBackOrFallback(fallbackPath: "/dashboard" | "/(tabs)") {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackPath as never);
}

export function CommonBackButton({
  label = "Dashboard",
  fallbackPath = "/dashboard",
  accessibilityLabel = "Go back to dashboard",
  compact = false,
}: CommonBackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => navigateBackOrFallback(fallbackPath)}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compactButton,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconShell}>
        <ArrowLeft size={compact ? 15 : 16} color={colors.primaryDark} />
      </View>

      {compact ? null : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: 6,
    paddingRight: spacing.md,
    paddingVertical: 6,
  },
  compactButton: {
    width: 46,
    height: 46,
    justifyContent: "center",
    paddingLeft: 0,
    paddingRight: 0,
    paddingVertical: 0,
  },
  iconShell: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
