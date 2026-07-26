import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "../../theme";

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function AppCard({ children, style, compact = false }: AppCardProps) {
  return <View style={[styles.card, compact && styles.compact, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glassStrong,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(191, 217, 203, 0.86)",
    ...shadows.card,
  },
  compact: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },
});
