import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type LoadingStateProps = {
  title?: string;
  message?: string;
};

export function LoadingState({
  title = "Loading...",
  message = "Please wait while Viora prepares your experience.",
}: LoadingStateProps) {
  return (
    <View style={styles.card}>
      <ActivityIndicator size="large" color={colors.primary} />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
  },
  title: {
    marginTop: spacing.lg,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  message: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    fontWeight: "600",
  },
});