import { CheckCircle2, CircleAlert, Navigation } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { VoiceCommandResult } from "../../types";

type Props = {
  result: VoiceCommandResult | null;
};

export function VoiceResultCard({ result }: Props) {
  if (!result) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No command yet</Text>
        <Text style={styles.emptyText}>Your latest voice result will appear here after Viora processes a command.</Text>
      </View>
    );
  }

  const Icon = result.status === "failed" ? CircleAlert : result.targetRoute ? Navigation : CheckCircle2;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconShell}>
          <Icon size={20} color={colors.primaryDark} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{result.title}</Text>
          <Text style={styles.status}>{result.status.replace(/_/g, " ")}</Text>
        </View>
      </View>

      <Text style={styles.transcript}>“{result.transcript}”</Text>
      <Text style={styles.message}>{result.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconShell: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  status: {
    marginTop: 2,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  transcript: {
    color: colors.primaryDark,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
  },
  message: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
