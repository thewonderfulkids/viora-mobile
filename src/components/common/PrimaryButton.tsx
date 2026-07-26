import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, premiumGradients, radius, shadows, spacing, typography } from "../../theme";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  loadingTitle?: string;
};

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading = false,
  loadingTitle,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <LinearGradient colors={premiumGradients.action} style={styles.button}>
        <View style={styles.shine} />
        <View style={styles.content}>
          {loading ? <ActivityIndicator size="small" color={colors.white} /> : null}
          <Text style={styles.text}>{loading ? loadingTitle || "Please wait..." : title}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.pill,
    overflow: "hidden",
    ...shadows.green,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  disabled: {
    opacity: 0.58,
  },
  button: {
    minHeight: 56,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  shine: {
    position: "absolute",
    width: 180,
    height: 70,
    borderRadius: 90,
    top: -46,
    right: -22,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  content: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  text: {
    color: colors.white,
    ...typography.button,
  },
});
